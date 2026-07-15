import {
  formatGeoLocation,
  geoSearchText,
  getGeoCityOptions,
  getGeoCountryOptions,
  matchesGeoFilter,
} from '../../../mock/geo'
import { SUB_INDICATOR_GROUPS } from '../../../mock/opportunity'
import {
  buildIndicatorDrillChildren,
  computeDimensionScoresFromIndicators,
  computeIndicatorScores,
  enrichIndicatorRawData,
  INDICATOR_DEFINITIONS,
} from './indicatorEngine'

export {
  formatGeoLocation,
  formatGeoLocation as formatOpportunitySource,
  getGeoCountryOptions,
  getGeoCountryOptions as getSourceRegionOptions,
  getGeoCityOptions,
  matchesGeoFilter,
}

export function calcCompositeScore(item, weights) {
  const market = Number(item.marketScore) || 0
  const policy = Number(item.policyScore) || 0
  const credit = Number(item.creditScore) || 0
  const total =
    (market * weights.market + policy * weights.policy + credit * weights.credit) / 100
  return Math.round(total * 10) / 10
}

export function calcCustomIndicator(item, preset, allPresets = []) {
  if (!preset?.weights) return 0
  const enriched = { ...item }
  allPresets.forEach((p) => {
    if (p.id !== preset.id) {
      enriched[`custom:${p.id}`] = calcCustomIndicator(item, p, allPresets.filter((x) => x.id !== p.id))
    }
  })
  let sum = 0
  const invert = new Set(preset.invertKeys || [])
  Object.entries(preset.weights).forEach(([key, w]) => {
    let val = Number(enriched[key]) || 0
    if (invert.has(key)) val = Math.max(0, 100 - val)
    sum += val * w
  })
  return Math.round(sum * 10) / 10
}

export function validateCustomIndicator(preset) {
  if (!preset?.weights || Object.keys(preset.weights).length === 0) {
    return { valid: false, message: '请至少配置一个公式项' }
  }
  const sum = Object.values(preset.weights).reduce((s, w) => s + w, 0)
  if (Math.abs(sum - 1) > 0.01) {
    return { valid: false, message: '权重总和须为 100%' }
  }
  return { valid: true, message: '' }
}

export function calcDimensionScores(item, subWeights) {
  const computed = computeDimensionScoresFromIndicators(item, subWeights)
  return {
    marketScore: computed.marketScore,
    policyScore: computed.policyScore,
    creditScore: computed.creditScore,
    indicatorScores: computed.indicatorScores,
    marketGroups: computed.marketGroups,
    policyGroups: computed.policyGroups,
    creditGroups: computed.creditGroups,
  }
}

export function getEvaluationConfig() {
  try {
    const weights = JSON.parse(localStorage.getItem('opportunity-eval-weights') || 'null')
    const subWeights = JSON.parse(localStorage.getItem('opportunity-eval-sub-weights') || 'null')
    return {
      weights: weights?.market != null ? weights : { market: 35, policy: 30, credit: 35 },
      subWeights: subWeights || {
        market: { scale: 35, growth: 40, profit: 25 },
        policy: { access: 30, cost: 35, incentive: 35 },
        credit: { entity: 40, transaction: 35, country: 25 },
      },
    }
  } catch {
    return {
      weights: { market: 35, policy: 30, credit: 35 },
      subWeights: {
        market: { scale: 35, growth: 40, profit: 25 },
        policy: { access: 30, cost: 35, incentive: 35 },
        credit: { entity: 40, transaction: 35, country: 25 },
      },
    }
  }
}

export function applySingleOpportunityEvaluation(item, weights = null, subWeights = null) {
  const config = getEvaluationConfig()
  const w = weights || config.weights
  const sw = subWeights || config.subWeights
  const dim = calcDimensionScores(item, sw)
  const enriched = { ...enrichIndicatorRawData(item), ...dim }
  const compositeScore = calcCompositeScore(enriched, w)
  return {
    ...enriched,
    score: Math.round(compositeScore),
    compositeScore,
    evaluatedAt: new Date().toISOString(),
  }
}

export function compareCreditRating(rating, minRating, order = []) {
  if (!minRating || !rating) return true
  const idx = order.indexOf(rating)
  const minIdx = order.indexOf(minRating)
  if (idx < 0 || minIdx < 0) return true
  return idx >= minIdx
}

export function getGrade(score) {
  if (score >= 90) return { grade: 'A', color: '#B32620' }
  if (score >= 85) return { grade: 'B+', color: '#d4380d' }
  if (score >= 80) return { grade: 'B', color: '#fa8c16' }
  if (score >= 70) return { grade: 'C', color: '#faad14' }
  return { grade: 'D', color: '#8c8c8c' }
}

export function getRiskCoefficient(item) {
  const map = { 低: 1.0, 中: 1.15, 高: 1.35 }
  let coef = map[item.riskLevel] || 1.1
  if (item.dynamicAlert?.type === 'credit') coef += 0.1
  if (item.dynamicAlert?.type === 'policy') coef += 0.05
  return Math.round(coef * 100) / 100
}

export function calcRiskAdjustedScore(item, weights) {
  const base = calcCompositeScore(item, weights)
  return Math.round((base / getRiskCoefficient(item)) * 10) / 10
}

export function calcStrategicFit(item, keywords = {}) {
  let fit = 50
  const regions = keywords.regions || []
  const industries = keywords.industries || []
  const continents = keywords.continents || []
  if (regions.some((r) => item.group?.includes(r) || item.country?.includes(r) || item.geoCity?.includes(r) || item.geoMacro?.includes(r))) fit += 15
  if (continents.includes(item.continent)) fit += 10
  if (industries.some((i) => item.product?.includes(i) || item.tags?.some((t) => t.includes(i)))) fit += 15
  if (item.tags?.includes('重点跟进')) fit += 10
  return Math.min(100, fit)
}

export function checkThresholds(item, thresholds, weights = null, creditRatingOrder = []) {
  const issues = []
  const composite = calcCompositeScore(item, weights || { market: 35, policy: 30, credit: 35 })

  if (thresholds.buyerCreditRatingMin && item.buyerCreditRating) {
    if (!compareCreditRating(item.buyerCreditRating, thresholds.buyerCreditRatingMin, creditRatingOrder)) {
      issues.push({
        level: 'block',
        msg: `买家信用评级 ${item.buyerCreditRating} 低于底线 ${thresholds.buyerCreditRatingMin}`,
      })
    }
  }
  if (item.buyerCreditScore < thresholds.buyerCreditMin) {
    issues.push({ level: 'block', msg: `买家信用 ${item.buyerCreditScore} 低于阈值 ${thresholds.buyerCreditMin}` })
  }
  if (thresholds.blockHighRisk && item.riskLevel === '高') {
    issues.push({ level: 'block', msg: '风险等级为高，触发硬性约束' })
  }
  if (item.policyScore < thresholds.policyMin) {
    issues.push({ level: 'warn', msg: `政策得分 ${item.policyScore} 低于警戒线 ${thresholds.policyMin}` })
  }
  if (thresholds.marketMin && item.marketScore < thresholds.marketMin) {
    issues.push({ level: 'warn', msg: `市场得分 ${item.marketScore} 低于合格线 ${thresholds.marketMin}` })
  }
  if (composite < thresholds.compositeMin) {
    issues.push({ level: 'warn', msg: `综合得分 ${composite} 低于合格线 ${thresholds.compositeMin}` })
  }
  return {
    passed: !issues.some((i) => i.level === 'block'),
    issues,
  }
}

export function getScoreTags(item) {
  const tags = []
  const ind = item.indicatorScores || computeIndicatorScores(item).scores
  if ((ind.ftaUtilization || 0) >= 80 || (ind.taxIncentive || 0) >= 80) tags.push({ text: '政策红利显著', color: 'success' })
  if ((ind.buyerRating || item.buyerCreditScore || 0) < 70) tags.push({ text: '信用风险偏高', color: 'error' })
  if ((ind.cagr || 0) >= 80 || (item.cagr || 0) >= 12) tags.push({ text: '需求增长强劲', color: 'processing' })
  if ((ind.cagr || 0) < 60 || (item.cagr || 0) < 7) tags.push({ text: '需求增长放缓', color: 'warning' })
  if ((ind.som || 0) >= 80 || (item.demandMatch || 0) >= 88) tags.push({ text: '可获得规模可观', color: 'blue' })
  return tags
}

function buildDimensionDrillChildren(dimKey, subScores, subWeights, drillMap) {
  return (SUB_INDICATOR_GROUPS[dimKey] || []).map((g) => ({
    key: `${dimKey}-${g.key}`,
    title: g.label,
    score: subScores[g.key],
    weight: subWeights?.[g.key],
    source: g.hint,
    children: drillMap[g.key] || [],
  }))
}

export function getDrillDown(item, weights, subWeights = null, customPreset = null) {
  const dimComputed = calcDimensionScores(item, subWeights)
  const subScores = {
    market: dimComputed.marketGroups,
    policy: dimComputed.policyGroups,
    credit: dimComputed.creditGroups,
  }
  const marketDrill = buildIndicatorDrillChildren('market', item)
  const policyDrill = buildIndicatorDrillChildren('policy', item)
  const creditDrill = buildIndicatorDrillChildren('credit', item)

  const compositeNode = {
    key: 'composite',
    title: '综合得分',
    score: calcCompositeScore({ ...item, ...dimComputed }, weights),
    children: [
      {
        key: 'market',
        title: '市场需求潜力',
        score: dimComputed.marketScore,
        weight: weights.market,
        children: buildDimensionDrillChildren('market', subScores.market, subWeights?.market, marketDrill),
      },
      {
        key: 'policy',
        title: '政策环境友好度',
        score: dimComputed.policyScore,
        weight: weights.policy,
        children: buildDimensionDrillChildren('policy', subScores.policy, subWeights?.policy, policyDrill),
      },
      {
        key: 'credit',
        title: '交易信用安全度',
        score: dimComputed.creditScore,
        weight: weights.credit,
        children: buildDimensionDrillChildren('credit', subScores.credit, subWeights?.credit, creditDrill),
      },
    ],
  }

  if (customPreset && item.customIndex != null) {
    compositeNode.children.push({
      key: 'custom',
      title: customPreset.name || '自定义指标',
      score: item.customIndex,
      source: customPreset.formula,
    })
  }

  return [compositeNode]
}

export function evaluateOpportunities(list, weights, thresholds = null, customPreset = null, options = {}) {
  const { subWeights, creditRatingOrder = [], allCustomPresets = [] } = options
  const presets = allCustomPresets.length ? allCustomPresets : (customPreset ? [customPreset] : [])
  return [...list]
    .map((item) => {
      const dimScores = calcDimensionScores(item, subWeights)
      const enriched = { ...enrichIndicatorRawData(item), ...dimScores }
      const compositeScore = calcCompositeScore(enriched, weights)
      const riskAdjustedScore = calcRiskAdjustedScore(enriched, weights)
      const strategicFit = calcStrategicFit(enriched)
      const customIndex = customPreset ? calcCustomIndicator(enriched, customPreset, presets) : null
      const thresholdResult = thresholds
        ? checkThresholds(enriched, thresholds, weights, creditRatingOrder)
        : { passed: true, issues: [] }
      const resourceCost = Math.round((parseFloat(String(item.revenueRange).split('-')[0]?.replace(/[^\d]/g, '')) || 500) / 100)
      const resourceValue = compositeScore
      return {
        ...enriched,
        score: Math.round(compositeScore),
        compositeScore,
        riskAdjustedScore,
        strategicFit,
        customIndex,
        thresholdPassed: thresholdResult.passed,
        thresholdIssues: thresholdResult.issues,
        scoreTags: getScoreTags(enriched),
        grade: getGrade(compositeScore),
        riskCoef: getRiskCoefficient(enriched),
        resourceCost: Math.max(3, Math.min(15, resourceCost)),
        resourceValue,
        evaluatedAt: new Date().toISOString(),
      }
    })
    .sort((a, b) => b.compositeScore - a.compositeScore)
}

export function sortOpportunities(list, mode, options = {}) {
  const { resourceBudget = 30, strategicKeywords } = options
  let sorted = [...list]

  if (mode === 'riskAdjusted') {
    sorted.sort((a, b) => b.riskAdjustedScore - a.riskAdjustedScore)
  } else if (mode === 'strategic') {
    sorted = sorted.map((item) => ({
      ...item,
      strategicFit: calcStrategicFit(item, strategicKeywords),
    }))
    sorted.sort((a, b) => b.strategicFit - a.strategicFit || b.compositeScore - a.compositeScore)
  } else if (mode === 'resource') {
    const selected = knapsackSelect(sorted, resourceBudget)
    const selectedIds = new Set(selected.map((i) => i.id))
    sorted.sort((a, b) => {
      const aSel = selectedIds.has(a.id) ? 1 : 0
      const bSel = selectedIds.has(b.id) ? 1 : 0
      if (aSel !== bSel) return bSel - aSel
      return b.compositeScore - a.compositeScore
    })
    sorted = sorted.map((item) => ({
      ...item,
      inResourcePlan: selectedIds.has(item.id),
    }))
  } else {
    sorted.sort((a, b) => b.compositeScore - a.compositeScore)
  }

  return sorted
}

export function knapsackSelect(items, budget) {
  const n = items.length
  const dp = Array.from({ length: n + 1 }, () => Array(budget + 1).fill(0))
  const keep = Array.from({ length: n + 1 }, () => Array(budget + 1).fill(false))

  for (let i = 1; i <= n; i += 1) {
    const item = items[i - 1]
    const cost = item.resourceCost || 5
    const value = item.resourceValue || item.compositeScore
    for (let w = 0; w <= budget; w += 1) {
      dp[i][w] = dp[i - 1][w]
      if (cost <= w) {
        const candidate = dp[i - 1][w - cost] + value
        if (candidate > dp[i][w]) {
          dp[i][w] = candidate
          keep[i][w] = true
        }
      }
    }
  }

  const selected = []
  let w = budget
  for (let i = n; i > 0; i -= 1) {
    if (keep[i][w]) {
      selected.unshift(items[i - 1])
      w -= items[i - 1].resourceCost || 5
    }
  }
  return selected
}

export function applyManualOrder(list, orderedIds, pinnedIds = []) {
  const map = new Map(list.map((item) => [item.id, item]))
  const result = []
  const used = new Set()

  pinnedIds.forEach((id) => {
    if (map.has(id) && !used.has(id)) {
      result.push({ ...map.get(id), manualPinned: true })
      used.add(id)
    }
  })

  orderedIds.forEach((id) => {
    if (map.has(id) && !used.has(id)) {
      result.push(map.get(id))
      used.add(id)
    }
  })

  list.forEach((item) => {
    if (!used.has(item.id)) result.push(item)
  })

  return result
}

export function filterOpportunities(list, filters) {
  const {
    status,
    country,
    geoMacro,
    geoCountry,
    geoCity,
    sourceCountry,
    sourceRegion,
    product,
    riskLevel,
    dateRange,
    scoreRange,
    keyword,
  } = filters

  const geoFilters = {
    geoMacro: geoMacro || (sourceCountry === 'all' ? 'all' : undefined),
    geoCountry: geoCountry || sourceCountry,
    geoCity: geoCity || sourceRegion,
  }

  return list.filter((item) => {
    if (status !== 'all' && item.status !== status) return false
    if (country !== 'all' && item.country !== country) return false
    if (!matchesGeoFilter(item, geoFilters)) return false
    if (riskLevel !== 'all' && item.riskLevel !== riskLevel) return false
    if (product && !item.product.includes(product) && !item.name.includes(product)) return false
    const searchText = `${item.id}${item.name}${item.product}${item.country}${geoSearchText(item)}`
    if (keyword && !searchText.includes(keyword)) return false
    if (item.score < scoreRange[0] || item.score > scoreRange[1]) return false

    if (dateRange?.[0] && dateRange?.[1]) {
      const created = new Date(item.createdAt.replace(/-/g, '/')).getTime()
      const start = dateRange[0].startOf('day').valueOf()
      const end = dateRange[1].endOf('day').valueOf()
      if (created < start || created > end) return false
    }

    return true
  })
}

const OPERATORS = {
  eq: (a, b) => String(a) === String(b),
  neq: (a, b) => String(a) !== String(b),
  gt: (a, b) => Number(a) > Number(b),
  gte: (a, b) => Number(a) >= Number(b),
  lt: (a, b) => Number(a) < Number(b),
  lte: (a, b) => Number(a) <= Number(b),
  contains: (a, b) => String(a).includes(String(b)),
}

export function getFieldValue(item, field) {
  if (field === 'sourceLocation') return formatGeoLocation(item)
  if (field === 'geoMacro') return item.geoMacro
  if (field === 'geoCountry') return item.geoCountry
  if (field === 'geoCity') return item.geoCity
  if (field === 'marketSizeUsd') {
    const num = parseFloat(String(item.marketSize).replace(/[^\d.]/g, ''))
    return Number.isFinite(num) ? num * 10 : 0
  }
  if (field === 'buyerPurchaseScale') {
    const num = parseFloat(String(item.buyerPurchaseScale || '').replace(/[^\d.]/g, ''))
    return Number.isFinite(num) ? num : 0
  }
  if (field === 'priceSensitivity') return item.priceSensitivity ?? Math.max(0, 100 - (item.profitMargin || 0) * 2.5)
  if (field === 'localCompetition') return item.localCompetition ?? Math.round((item.marketConcentration || 0.5) * 100)
  if (field === 'competitorGap') return item.competitorGap ?? Math.max(0, 100 - (item.demandMatch || 0))
  if (field === 'inquiryHeat') return item.inquiryHeat ?? Math.min(100, (item.cagr || 0) * 6)
  if (field === 'paymentDefaultCount') return item.paymentDefaultCount ?? 0
  if (field === 'buyerReputation') return item.buyerReputation ?? item.buyerCreditScore
  if (field === 'createdAt') return item.createdAt
  return item[field]
}

function evaluateConditionResult(item, condition) {
  const fn = OPERATORS[condition.operator]
  if (!fn) return true
  let matched = fn(getFieldValue(item, condition.field), condition.value)

  if (condition.field === 'createdAt' && condition.value) {
    const itemDate = new Date(String(item.createdAt).replace(/-/g, '/')).getTime()
    const condDate = new Date(String(condition.value).replace(/-/g, '/')).getTime()
    if (condition.operator === 'gte') matched = itemDate >= condDate
    else if (condition.operator === 'lte') matched = itemDate <= condDate
    else if (condition.operator === 'eq') matched = String(item.createdAt).startsWith(String(condition.value))
  }

  return condition.negate ? !matched : matched
}

export function evaluateCondition(item, condition) {
  return evaluateConditionResult(item, condition)
}

function evaluateGroupNode(item, group) {
  const { logic = 'AND', conditions = [], groups = [] } = group || {}
  const results = []

  conditions.forEach((condition) => {
    results.push(evaluateConditionResult(item, condition))
  })

  groups.forEach((subGroup) => {
    results.push(evaluateGroupNode(item, subGroup))
  })

  if (!results.length) return true
  if (logic === 'OR') return results.some(Boolean)
  if (logic === 'NOT') return !results.every(Boolean)
  return results.every(Boolean)
}

export function evaluateFilterGroup(list, group) {
  if (!group) return list
  const { conditions = [], groups = [] } = group
  if (!conditions.length && !groups.length) return list

  return list.filter((item) => evaluateGroupNode(item, group))
}

export function buildClassificationGroups(list, template) {
  const priority = template?.priority || ['market', 'product', 'opportunity']
  const dimMap = {
    market: ['continent', 'economyStage', 'marketType'],
    product: ['hsChapter', 'productLifecycle', 'techComplexity'],
    opportunity: ['opportunityDriver', 'timeHorizon'],
  }

  const groups = {}
  list.forEach((item) => {
    const parts = priority.map((dim) => {
      const fields = dimMap[dim] || []
      const key = fields.map((f) => item[f]).filter(Boolean).join(' · ')
      return key || '未分类'
    })
    const path = parts.join(' / ')
    if (!groups[path]) {
      groups[path] = { path, count: 0, items: [], dimensions: parts }
    }
    groups[path].count += 1
    groups[path].items.push(item.id)
  })

  return Object.values(groups).sort((a, b) => b.count - a.count)
}

export function applyHighlight(item, highlightFields = []) {
  return highlightFields.some((field) => {
    const val = item[field]
    if (field === 'riskLevel') return val === '低'
    if (typeof val === 'number') return val >= 80
    return Boolean(val)
  })
}

export function getRiskColor(level) {
  if (level === '低') return 'success'
  if (level === '中') return 'warning'
  return 'error'
}

export function getDynamicAlertColor(type) {
  const map = { demand: 'success', policy: 'processing', credit: 'error' }
  return map[type] || 'warning'
}

export function getRankIcon(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return rank
}

export { INDICATOR_DEFINITIONS, computeIndicatorScores, enrichIndicatorRawData }

export const OPPORTUNITY_STORAGE_KEY = 'opportunity-selected-ids'
export const OPPORTUNITY_DETAIL_NAV_KEY = 'opportunity-detail-nav'
export const EVALUATION_WEIGHTS_KEY = 'opportunity-evaluation-weights'
export const EVALUATION_THRESHOLDS_KEY = 'opportunity-evaluation-thresholds'
export const CLASSIFY_STATE_KEY = 'opportunity-classify-state'

export function drillDownToTreeData(nodes) {
  return nodes.map((node) => ({
    key: node.key,
    title: `${node.title} · ${node.score}${node.weight != null ? ` (权重${node.weight}%)` : ''}${node.source ? ` — ${node.source}` : ''}`,
    children: node.children ? drillDownToTreeData(node.children) : undefined,
  }))
}
