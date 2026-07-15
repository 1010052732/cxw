import { CREDIT_RATING_ORDER } from '../../../mock/opportunity'

/** 二级指标组内叶子权重（与 Excel 指标体系一致） */
export const INDICATOR_LEAF_WEIGHTS = {
  market: {
    scale: { tam: 40, sam: 35, som: 25 },
    growth: { cagr: 40, forecastGrowth: 35, lifecycle: 25 },
    profit: { grossMargin: 40, netMargin: 35, priceElasticity: 25 },
  },
  policy: {
    access: { foreignOwnership: 40, licenseComplexity: 35, localization: 25 },
    cost: { weightedTariff: 40, vatRate: 35, ftaUtilization: 25 },
    incentive: { taxIncentive: 35, subsidy: 35, exportRebateEfficiency: 30 },
  },
  credit: {
    entity: { buyerRating: 45, debtRatio: 30, litigation: 25 },
    transaction: { paymentTimeliness: 45, paymentMethod: 30, lcBank: 25 },
    country: { sovereignRating: 40, politicalStability: 35, fxControl: 25 },
  },
}

export const INDICATOR_DEFINITIONS = [
  { key: 'tam', label: '市场总容量 (TAM)', dimension: 'market', group: 'scale', unit: '美元', formula: 'TAM = 本地生产总值 + 进口总额 - 出口总额' },
  { key: 'sam', label: '可服务市场规模 (SAM)', dimension: 'market', group: 'scale', unit: '美元', formula: 'SAM = TAM × 目标细分品类占比 × 适用客户群占比' },
  { key: 'som', label: '可获得市场规模 (SOM)', dimension: 'market', group: 'scale', unit: '美元', formula: 'SOM = SAM × 预估市场占有率' },
  { key: 'cagr', label: '历史增长率 (CAGR)', dimension: 'market', group: 'growth', unit: '%', formula: 'CAGR = (现值/基期值)^(1/N) - 1' },
  { key: 'forecastGrowth', label: '预测增长率', dimension: 'market', group: 'growth', unit: '%', formula: '引用权威机构预测值' },
  { key: 'lifecycle', label: '产品生命周期阶段', dimension: 'market', group: 'growth', unit: '1-5分', formula: 'G=(fA×0.4)+(fB×0.4)+(fC×0.2)' },
  { key: 'grossMargin', label: '行业平均毛利率', dimension: 'market', group: 'profit', unit: '%', formula: '∑毛利/∑营收' },
  { key: 'netMargin', label: '行业平均净利率', dimension: 'market', group: 'profit', unit: '%', formula: '∑净利/∑营收' },
  { key: 'priceElasticity', label: '价格弹性', dimension: 'market', group: 'profit', unit: '系数', formula: '销量变动%/价格变动%' },
  { key: 'foreignOwnership', label: '行业外资持股限制', dimension: 'policy', group: 'access', unit: '状态', formula: '提取法规原文' },
  { key: 'licenseComplexity', label: '行政许可复杂度', dimension: 'policy', group: 'access', unit: '1-5分', formula: 'G=(A×0.4)+(B×0.4)+(C×0.2)' },
  { key: 'localization', label: '本地化成分要求', dimension: 'policy', group: 'access', unit: '%', formula: '政策原文百分比' },
  { key: 'weightedTariff', label: '加权平均关税税率', dimension: 'policy', group: 'cost', unit: '%', formula: '∑(进口额×税率)/总进口额' },
  { key: 'vatRate', label: '增值税/消费税', dimension: 'policy', group: 'cost', unit: '%', formula: '法定税率' },
  { key: 'ftaUtilization', label: '自贸协定利用率', dimension: 'policy', group: 'cost', unit: '享惠评级', formula: '协定税率对比MFN税率' },
  { key: 'taxIncentive', label: '税收优惠力度', dimension: 'policy', group: 'incentive', unit: '1-5分', formula: 'G=(fA×0.4)+(fB×0.4)+(fC×0.2)' },
  { key: 'subsidy', label: '补贴金额与条件', dimension: 'policy', group: 'incentive', unit: '1-5分', formula: 'G=(fA×0.7)+(fB×0.3)' },
  { key: 'exportRebateEfficiency', label: '出口退税效率', dimension: 'policy', group: 'incentive', unit: '1-5分', formula: 'G=(fA×0.6)+(fB×0.4)' },
  { key: 'buyerRating', label: '买家信用评级', dimension: 'credit', group: 'entity', unit: '符号', formula: '第三方征信评级' },
  { key: 'debtRatio', label: '资产负债率', dimension: 'credit', group: 'entity', unit: '%', formula: '负债总额/资产总额' },
  { key: 'litigation', label: '诉讼记录', dimension: 'credit', group: 'entity', unit: '状态', formula: '近3年诉讼统计' },
  { key: 'paymentTimeliness', label: '历史付款及时率', dimension: 'credit', group: 'transaction', unit: '%', formula: '按时付款金额/总成交额' },
  { key: 'paymentMethod', label: '惯用支付方式', dimension: 'credit', group: 'transaction', unit: '方式', formula: '历史成交支付方式占比' },
  { key: 'lcBank', label: '开证行资质', dimension: 'credit', group: 'transaction', unit: '评级', formula: '开证行外部评级' },
  { key: 'sovereignRating', label: '主权信用评级', dimension: 'credit', group: 'country', unit: '符号', formula: '标普/穆迪/惠誉主权评级' },
  { key: 'politicalStability', label: '政治稳定性', dimension: 'credit', group: 'country', unit: 'WGI百分位', formula: '世界银行WGI政治稳定指数' },
  { key: 'fxControl', label: '外汇管制风险', dimension: 'credit', group: 'country', unit: '管制程度', formula: '央行外汇管制政策' },
]

const OWNERSHIP_LEVELS = {
  禁止外资: 20,
  需合资且中方控股: 40,
  需合资但外资可控股: 60,
  有特定条件限制: 80,
  无限制: 100,
  允许独资: 100,
}

const FTA_LEVELS = {
  不适用: 20,
  降税极少: 40,
  利用难: 40,
  降税一般: 60,
  降税明显: 80,
  零关税: 100,
}

const LITIGATION_LEVELS = {
  致命风险: 20,
  高风险: 40,
  中风险: 60,
  低风险: 80,
  极低风险: 100,
  无记录: 100,
}

const PAYMENT_METHOD_LEVELS = {
  'OA>90天': 20,
  'OA<90天': 40,
  DP: 40,
  远期LC: 60,
  即期LC: 80,
  远期TT: 80,
  预付TT: 100,
  全额即期LC: 100,
}

const LC_BANK_LEVELS = {
  无评级: 20,
  黑名单: 20,
  C: 40,
  B: 60,
  A: 80,
  AA: 100,
  AAA: 100,
}

const FX_CONTROL_LEVELS = {
  严格管制: 20,
  无法汇出: 20,
  高额税: 40,
  审批严: 40,
  结汇限制: 60,
  利润汇出受阻: 60,
  少许限制: 80,
  需备案: 80,
  自由兑换: 100,
  无限制: 100,
}

const SOVEREIGN_RATING_SCORES = {
  CCC: 20, CC: 20, C: 20, D: 20,
  'B-': 30, B: 35, 'B+': 40,
  'BB-': 50, BB: 55, 'BB+': 60,
  'BBB-': 70, BBB: 75, 'BBB+': 80,
  'A-': 85, A: 88, 'A+': 90,
  'AA-': 93, AA: 95, 'AA+': 97, AAA: 100,
}

const LIFECYCLE_STAGE = {
  衰退期: 1.2,
  成熟期晚期: 2,
  成熟期: 2.8,
  成熟期早期: 3.2,
  导入期: 4.2,
  成长期: 4.5,
}

function hashSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 9973
  return h
}

function parseYiAmount(text) {
  const num = parseFloat(String(text || '').replace(/[^\d.]/g, ''))
  return Number.isFinite(num) ? num : 0
}

/** 亿元折算为美元（演示口径：1亿元 ≈ 1400万美元） */
function yiToUsd(yi) {
  return yi * 14e6
}

function parseRevenueMidUsd(text) {
  const parts = String(text || '').split('-').map((s) => parseFloat(s.replace(/[^\d.]/g, ''))).filter(Number.isFinite)
  if (!parts.length) return 0
  const avg = parts.reduce((a, b) => a + b, 0) / parts.length
  const isWan = String(text).includes('万') && !String(text).includes('亿')
  if (isWan) return avg * 1e4 * 0.14
  return avg * 1e8 * 0.14
}

function scoreFromBands(value, bands) {
  for (const band of bands) {
    if (band.min != null && value < band.min) continue
    if (band.max != null && value >= band.max) continue
    return band.score
  }
  return bands[bands.length - 1]?.score ?? 60
}

function gToScore(g) {
  if (g < 1) return 20
  if (g < 2) return 40
  if (g < 3) return 60
  if (g < 4) return 80
  return 100
}

function factorPoints(value, rules) {
  for (const rule of rules) {
    if (rule.test(value)) return rule.points
  }
  return rules[rules.length - 1]?.points ?? 1
}

function weightedG(factors) {
  return factors.reduce((sum, f) => sum + f.points * f.weight, 0)
}

function ratingToScore(rating, order = CREDIT_RATING_ORDER) {
  if (!rating) return 60
  const idx = order.indexOf(rating)
  if (idx < 0) {
    const key = Object.keys(SOVEREIGN_RATING_SCORES).find((k) => rating.startsWith(k))
    return key ? SOVEREIGN_RATING_SCORES[key] : 60
  }
  return Math.round(20 + (idx / Math.max(order.length - 1, 1)) * 80)
}

function blendScores(scores, weights) {
  let total = 0
  let weightSum = 0
  Object.entries(weights).forEach(([key, w]) => {
    if (scores[key] != null) {
      total += scores[key] * w
      weightSum += w
    }
  })
  return weightSum ? Math.round(total / weightSum) : 0
}

function blendGroupScores(leafScores, leafWeights) {
  const groups = {}
  Object.entries(leafWeights).forEach(([groupKey, weights]) => {
    groups[groupKey] = blendScores(leafScores, weights)
  })
  return groups
}

function blendDimensionScores(groupScores, subWeights) {
  let total = 0
  Object.entries(subWeights).forEach(([k, w]) => {
    total += (groupScores[k] || 0) * w / 100
  })
  return Math.round(total)
}

/** 从现有 mock 字段衍生 Excel 原始指标（无显式字段时按商机 ID 稳定生成） */
export function enrichIndicatorRawData(item) {
  const seed = hashSeed(item.id || item.name || 'default')
  const tamYi = parseYiAmount(item.marketSize) || 8 + (seed % 30)
  const tamUsd = item.tamUsd ?? yiToUsd(tamYi)
  const segmentShare = item.segmentShare ?? Math.min(0.85, 0.25 + (item.demandMatch || 70) / 200)
  const customerShare = item.customerShare ?? Math.min(0.9, 0.3 + (item.channelMaturity || 60) / 250)
  const samUsd = item.samUsd ?? tamUsd * segmentShare * customerShare
  const marketShare = item.marketShare ?? Math.min(0.25, 0.03 + (item.demandMatch || 60) / 1200 + (seed % 20) / 1000)
  const somUsd = item.somUsd ?? samUsd * marketShare

  const lifecycleStage = item.productLifecycle || '成长期'
  const lifecycleSalesUsd = item.lifecycleSalesUsd ?? (parseRevenueMidUsd(item.revenueRange) * 3 || samUsd * 0.05)
  const lifecycleMargin = item.lifecycleMargin ?? item.profitMargin ?? 12 + (seed % 15)
  const lifecycleCompetitors = item.lifecycleCompetitors ?? Math.max(2, Math.round((item.marketConcentration || 0.5) * 20))

  const ownershipLabels = Object.keys(OWNERSHIP_LEVELS)
  const foreignOwnership = item.foreignOwnership ?? ownershipLabels[Math.min(4, Math.floor((item.channelMaturity || 50) / 20))]

  const licenseSteps = item.licenseSteps ?? Math.max(1, Math.round(6 - (item.channelMaturity || 50) / 15))
  const licenseDays = item.licenseDays ?? Math.max(15, Math.round(120 - (item.channelMaturity || 50)))
  const licenseCerts = item.licenseCerts ?? Math.max(1, Math.round((item.ntbStrength || 30) / 15))

  const localizationPct = item.localizationPct ?? (item.ntbStrength > 50 ? 25 + (seed % 35) : (seed % 15))

  const ftaLevels = ['不适用', '降税极少', '降税一般', '降税明显', '零关税']
  const ftaIdx = Math.min(4, Math.floor((item.ftaCoverage || 50) / 22))
  const ftaUtilizationLevel = item.ftaUtilizationLevel ?? ftaLevels[ftaIdx]

  const taxHolidayYears = item.taxHolidayYears ?? Math.max(0, Math.round((item.subsidyStrength || 50) / 18))
  const taxReduction = item.taxReduction ?? Math.max(0, Math.round((item.subsidyStrength || 50) / 8))
  const taxThreshold = item.taxThreshold ?? (item.subsidyStrength > 70 ? '低' : item.subsidyStrength > 45 ? '中等门槛' : '高')

  const subsidyRatio = item.subsidyRatio ?? Math.max(0, Math.round((item.subsidyStrength || 40) / 3))
  const subsidyComplexity = item.subsidyComplexity ?? (item.subsidyStrength > 65 ? '低' : '中等门槛')

  const rebateDays = item.rebateDays ?? Math.max(20, 120 - Math.round((item.exportRebate || 5) * 5))

  const debtRatio = item.debtRatio ?? Math.max(15, Math.min(95, 70 - (item.buyerCreditScore || 70) / 2 + (seed % 15)))

  const litigationLevels = ['无记录', '低风险', '中风险', '高风险', '致命风险']
  const litigationRisk = item.litigationRisk ?? (
    (item.buyerCreditScore || 75) < 65 ? litigationLevels[3]
      : (item.buyerCreditScore || 75) < 78 ? litigationLevels[2]
        : litigationLevels[1]
  )

  const paymentTimeliness = item.paymentTimeliness ?? Math.min(99, 55 + (item.buyerCreditScore || 70) / 2 + (item.buyerCooperationYears || 0) * 3)

  const paymentMethods = ['OA>90天', 'OA<90天', '远期LC', '即期LC', '预付TT']
  const paymentMethod = item.paymentMethod ?? (
    paymentTimeliness < 70 ? paymentMethods[0]
      : paymentTimeliness < 82 ? paymentMethods[1]
        : paymentTimeliness < 90 ? paymentMethods[2]
          : paymentTimeliness < 96 ? paymentMethods[3]
            : paymentMethods[4]
  )

  const lcBanks = ['C', 'B', 'A', 'AA', 'AAA']
  const lcBankRating = item.lcBankRating ?? lcBanks[Math.min(4, Math.floor((item.buyerCreditScore || 70) / 20))]

  const sovereignByRisk = { 低: 'A', 中: 'BBB', 高: 'BB' }
  const sovereignRating = item.sovereignRating ?? sovereignByRisk[item.riskLevel] ?? 'BBB'

  const wgiPercentile = item.wgiPercentile ?? (
    item.riskLevel === '低' ? 72 + (seed % 20)
      : item.riskLevel === '中' ? 38 + (seed % 25)
        : 8 + (seed % 18)
  )

  const fxLevels = ['严格管制', '结汇限制', '少许限制', '自由兑换']
  const fxControlLevel = item.fxControlLevel ?? (
    item.riskLevel === '高' ? fxLevels[0]
      : item.riskLevel === '中' ? fxLevels[1]
        : fxLevels[3]
  )

  return {
    ...item,
    tamUsd,
    samUsd,
    somUsd,
    segmentShare,
    customerShare,
    marketShare,
    forecastGrowth: item.forecastGrowth ?? Math.round(((item.cagr || 8) * 0.75 + (seed % 5)) * 10) / 10,
    lifecycleSalesUsd,
    lifecycleMargin,
    lifecycleCompetitors,
    lifecycleStage,
    grossMarginPct: item.grossMarginPct ?? item.profitMargin ?? 15,
    netMarginPct: item.netMarginPct ?? Math.round((item.profitMargin || 15) * 0.55 * 10) / 10,
    priceElasticityCoef: item.priceElasticityCoef ?? Math.round((1.8 - (item.profitMargin || 10) / 30 + (seed % 10) / 20) * 100) / 100,
    foreignOwnership,
    licenseSteps,
    licenseDays,
    licenseCerts,
    localizationPct,
    weightedTariff: item.weightedTariff ?? item.tariffLevel ?? 10,
    vatRate: item.vatRate ?? (12 + (seed % 12)),
    ftaUtilizationLevel,
    taxHolidayYears,
    taxReduction,
    taxThreshold,
    subsidyRatio,
    subsidyComplexity,
    exportRebateRate: item.exportRebateRate ?? item.exportRebate ?? 9,
    rebateDays,
    debtRatio,
    litigationRisk,
    paymentTimeliness,
    paymentMethod,
    lcBankRating,
    sovereignRating,
    wgiPercentile,
    fxControlLevel,
  }
}

function scoreTam(usd) {
  return scoreFromBands(usd, [
    { max: 10e6, score: 20 },
    { min: 10e6, max: 100e6, score: 40 },
    { min: 100e6, max: 500e6, score: 60 },
    { min: 500e6, max: 2e9, score: 80 },
    { min: 2e9, score: 100 },
  ])
}

function scoreSam(usd) {
  return scoreFromBands(usd, [
    { max: 1e6, score: 20 },
    { min: 1e6, max: 10e6, score: 40 },
    { min: 10e6, max: 50e6, score: 60 },
    { min: 50e6, max: 200e6, score: 80 },
    { min: 200e6, score: 100 },
  ])
}

function scoreSom(usd) {
  return scoreFromBands(usd, [
    { max: 0.5e6, score: 20 },
    { min: 0.5e6, max: 5e6, score: 40 },
    { min: 5e6, max: 20e6, score: 60 },
    { min: 20e6, max: 100e6, score: 80 },
    { min: 100e6, score: 100 },
  ])
}

function scoreCagr(pct) {
  return scoreFromBands(pct, [
    { max: 0, score: 20 },
    { min: 0, max: 5, score: 40 },
    { min: 5, max: 10, score: 60 },
    { min: 10, max: 20, score: 80 },
    { min: 20, score: 100 },
  ])
}

function scoreForecastGrowth(pct) {
  return scoreFromBands(pct, [
    { max: 0, score: 20 },
    { min: 0, max: 3, score: 40 },
    { min: 3, max: 8, score: 60 },
    { min: 8, max: 15, score: 80 },
    { min: 15, score: 100 },
  ])
}

function scoreLifecycle(item) {
  const fA = factorPoints(item.lifecycleSalesUsd, [
    { test: (v) => v > 50e6, points: 5 },
    { test: (v) => v >= 20e6, points: 3 },
    { test: () => true, points: 1 },
  ])
  const fB = factorPoints(item.lifecycleMargin, [
    { test: (v) => v > 20, points: 5 },
    { test: (v) => v >= 10, points: 3 },
    { test: () => true, points: 1 },
  ])
  const fC = factorPoints(item.lifecycleCompetitors, [
    { test: (v) => v < 3, points: 5 },
    { test: (v) => v <= 10, points: 3 },
    { test: () => true, points: 1 },
  ])
  const g = weightedG([
    { points: fA, weight: 0.4 },
    { points: fB, weight: 0.4 },
    { points: fC, weight: 0.2 },
  ])
  const stageBoost = LIFECYCLE_STAGE[item.lifecycleStage] || g
  return gToScore((g + stageBoost) / 2)
}

function scoreGrossMargin(pct) {
  return scoreFromBands(pct, [
    { max: 10, score: 20 },
    { min: 10, max: 20, score: 40 },
    { min: 20, max: 35, score: 60 },
    { min: 35, max: 50, score: 80 },
    { min: 50, score: 100 },
  ])
}

function scoreNetMargin(pct) {
  return scoreFromBands(pct, [
    { max: 2, score: 20 },
    { min: 2, max: 5, score: 40 },
    { min: 5, max: 10, score: 60 },
    { min: 10, max: 20, score: 80 },
    { min: 20, score: 100 },
  ])
}

function scorePriceElasticity(coef) {
  return scoreFromBands(coef, [
    { max: 0.5, score: 100 },
    { min: 0.5, max: 1.0, score: 80 },
    { min: 1.0, max: 1.5, score: 60 },
    { min: 1.5, max: 3.0, score: 40 },
    { min: 3.0, score: 20 },
  ])
}

function scoreLicenseComplexity(item) {
  const a = factorPoints(item.licenseSteps, [
    { test: (v) => v <= 2, points: 5 },
    { test: (v) => v <= 5, points: 3 },
    { test: () => true, points: 1 },
  ])
  const b = factorPoints(item.licenseDays, [
    { test: (v) => v < 30, points: 5 },
    { test: (v) => v <= 90, points: 3 },
    { test: () => true, points: 1 },
  ])
  const c = factorPoints(item.licenseCerts, [
    { test: (v) => v <= 1, points: 5 },
    { test: (v) => v <= 3, points: 3 },
    { test: () => true, points: 1 },
  ])
  return gToScore(weightedG([
    { points: a, weight: 0.4 },
    { points: b, weight: 0.4 },
    { points: c, weight: 0.2 },
  ]))
}

function scoreLocalization(pct) {
  if (pct <= 0) return 100
  return scoreFromBands(pct, [
    { min: 60, score: 20 },
    { min: 40, max: 60, score: 40 },
    { min: 20, max: 40, score: 60 },
    { min: 0, max: 20, score: 80 },
  ])
}

function scoreTariff(pct) {
  return scoreFromBands(pct, [
    { min: 35, score: 20 },
    { min: 20, max: 35, score: 40 },
    { min: 10, max: 20, score: 60 },
    { min: 5, max: 10, score: 80 },
    { max: 5, score: 100 },
  ])
}

function scoreVat(pct) {
  return scoreFromBands(pct, [
    { min: 25, score: 20 },
    { min: 17, max: 25, score: 40 },
    { min: 10, max: 17, score: 60 },
    { min: 5, max: 10, score: 80 },
    { max: 5, score: 100 },
  ])
}

function scoreFtaUtilization(level) {
  const key = Object.keys(FTA_LEVELS).find((k) => String(level).includes(k))
  return FTA_LEVELS[key] ?? 60
}

function scoreTaxIncentive(item) {
  const fA = factorPoints(item.taxHolidayYears, [
    { test: (v) => v > 5, points: 5 },
    { test: (v) => v >= 2, points: 3 },
    { test: () => true, points: 1 },
  ])
  const fB = factorPoints(item.taxReduction, [
    { test: (v) => v > 10, points: 5 },
    { test: (v) => v >= 5, points: 3 },
    { test: () => true, points: 1 },
  ])
  const fC = factorPoints(item.taxThreshold, [
    { test: (v) => v === '低', points: 5 },
    { test: (v) => v === '中等门槛', points: 3 },
    { test: () => true, points: 1 },
  ])
  return gToScore(weightedG([
    { points: fA, weight: 0.4 },
    { points: fB, weight: 0.4 },
    { points: fC, weight: 0.2 },
  ]))
}

function scoreSubsidy(item) {
  const fA = factorPoints(item.subsidyRatio, [
    { test: (v) => v > 30, points: 5 },
    { test: (v) => v >= 10, points: 3 },
    { test: () => true, points: 1 },
  ])
  const fB = factorPoints(item.subsidyComplexity, [
    { test: (v) => v === '低', points: 5 },
    { test: (v) => v === '中等门槛', points: 3 },
    { test: () => true, points: 1 },
  ])
  return gToScore(weightedG([
    { points: fA, weight: 0.7 },
    { points: fB, weight: 0.3 },
  ]))
}

function scoreExportRebate(item) {
  const fA = factorPoints(item.exportRebateRate, [
    { test: (v) => v > 13, points: 5 },
    { test: (v) => v >= 5, points: 3 },
    { test: () => true, points: 1 },
  ])
  const fB = factorPoints(item.rebateDays, [
    { test: (v) => v < 30, points: 5 },
    { test: (v) => v <= 90, points: 3 },
    { test: () => true, points: 1 },
  ])
  return gToScore(weightedG([
    { points: fA, weight: 0.6 },
    { points: fB, weight: 0.4 },
  ]))
}

function scoreDebtRatio(pct) {
  return scoreFromBands(pct, [
    { min: 100, score: 20 },
    { min: 70, max: 100, score: 40 },
    { min: 50, max: 70, score: 60 },
    { min: 30, max: 50, score: 80 },
    { max: 30, score: 100 },
  ])
}

function scoreWgi(percentile) {
  return scoreFromBands(percentile, [
    { max: 10, score: 20 },
    { min: 10, max: 25, score: 40 },
    { min: 25, max: 50, score: 60 },
    { min: 50, max: 75, score: 80 },
    { min: 75, score: 100 },
  ])
}

function formatUsd(v) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  return `$${Math.round(v / 1e3)}K`
}

export function computeIndicatorScores(item) {
  const raw = enrichIndicatorRawData(item)
  const scores = {
    tam: scoreTam(raw.tamUsd),
    sam: scoreSam(raw.samUsd),
    som: scoreSom(raw.somUsd),
    cagr: scoreCagr(raw.cagr || 0),
    forecastGrowth: scoreForecastGrowth(raw.forecastGrowth || 0),
    lifecycle: scoreLifecycle(raw),
    grossMargin: scoreGrossMargin(raw.grossMarginPct),
    netMargin: scoreNetMargin(raw.netMarginPct),
    priceElasticity: scorePriceElasticity(raw.priceElasticityCoef),
    foreignOwnership: OWNERSHIP_LEVELS[raw.foreignOwnership] ?? 60,
    licenseComplexity: scoreLicenseComplexity(raw),
    localization: scoreLocalization(raw.localizationPct),
    weightedTariff: scoreTariff(raw.weightedTariff),
    vatRate: scoreVat(raw.vatRate),
    ftaUtilization: scoreFtaUtilization(raw.ftaUtilizationLevel),
    taxIncentive: scoreTaxIncentive(raw),
    subsidy: scoreSubsidy(raw),
    exportRebateEfficiency: scoreExportRebate(raw),
    buyerRating: ratingToScore(raw.buyerCreditRating),
    debtRatio: scoreDebtRatio(raw.debtRatio),
    litigation: LITIGATION_LEVELS[raw.litigationRisk] ?? 80,
    paymentTimeliness: scoreFromBands(raw.paymentTimeliness, [
      { max: 60, score: 20 },
      { min: 60, max: 80, score: 40 },
      { min: 80, max: 90, score: 60 },
      { min: 90, max: 95, score: 80 },
      { min: 95, score: 100 },
    ]),
    paymentMethod: PAYMENT_METHOD_LEVELS[raw.paymentMethod] ?? 60,
    lcBank: LC_BANK_LEVELS[raw.lcBankRating] ?? 60,
    sovereignRating: SOVEREIGN_RATING_SCORES[raw.sovereignRating] ?? ratingToScore(raw.sovereignRating),
    politicalStability: scoreWgi(raw.wgiPercentile),
    fxControl: FX_CONTROL_LEVELS[raw.fxControlLevel] ?? 60,
  }

  const display = {
    tam: formatUsd(raw.tamUsd),
    sam: formatUsd(raw.samUsd),
    som: formatUsd(raw.somUsd),
    cagr: `${raw.cagr ?? 0}%`,
    forecastGrowth: `${raw.forecastGrowth}%`,
    lifecycle: raw.lifecycleStage,
    grossMargin: `${raw.grossMarginPct}%`,
    netMargin: `${raw.netMarginPct}%`,
    priceElasticity: String(raw.priceElasticityCoef),
    foreignOwnership: raw.foreignOwnership,
    licenseComplexity: `${raw.licenseSteps}环节/${raw.licenseDays}天`,
    localization: raw.localizationPct ? `${raw.localizationPct}%` : '无要求',
    weightedTariff: `${raw.weightedTariff}%`,
    vatRate: `${raw.vatRate}%`,
    ftaUtilization: raw.ftaUtilizationLevel,
    taxIncentive: `免税${raw.taxHolidayYears}年/减让${raw.taxReduction}%`,
    subsidy: `补贴占比${raw.subsidyRatio}%`,
    exportRebateEfficiency: `退税率${raw.exportRebateRate}%/${raw.rebateDays}天到账`,
    buyerRating: raw.buyerCreditRating,
    debtRatio: `${raw.debtRatio}%`,
    litigation: raw.litigationRisk,
    paymentTimeliness: `${raw.paymentTimeliness}%`,
    paymentMethod: raw.paymentMethod,
    lcBank: raw.lcBankRating,
    sovereignRating: raw.sovereignRating,
    politicalStability: `WGI P${raw.wgiPercentile}`,
    fxControl: raw.fxControlLevel,
  }

  return { raw, scores, display }
}

export function computeDimensionScoresFromIndicators(item, subWeights) {
  const { scores } = computeIndicatorScores(item)
  const marketGroups = blendGroupScores(scores, INDICATOR_LEAF_WEIGHTS.market)
  const policyGroups = blendGroupScores(scores, INDICATOR_LEAF_WEIGHTS.policy)
  const creditGroups = blendGroupScores(scores, INDICATOR_LEAF_WEIGHTS.credit)

  if (!subWeights) {
    return {
      marketScore: blendScores(marketGroups, { scale: 35, growth: 40, profit: 25 }),
      policyScore: blendScores(policyGroups, { access: 30, cost: 35, incentive: 35 }),
      creditScore: blendScores(creditGroups, { entity: 40, transaction: 35, country: 25 }),
      indicatorScores: scores,
      marketGroups,
      policyGroups,
      creditGroups,
    }
  }

  return {
    marketScore: blendDimensionScores(marketGroups, subWeights.market),
    policyScore: blendDimensionScores(policyGroups, subWeights.policy),
    creditScore: blendDimensionScores(creditGroups, subWeights.credit),
    indicatorScores: scores,
    marketGroups,
    policyGroups,
    creditGroups,
  }
}

export function buildIndicatorDrillChildren(dimension, item) {
  const { scores, display } = computeIndicatorScores(item)
  const defs = INDICATOR_DEFINITIONS.filter((d) => d.dimension === dimension)
  const groupMap = {}
  defs.forEach((def) => {
    if (!groupMap[def.group]) groupMap[def.group] = []
    groupMap[def.group].push({
      key: `${dimension}-${def.key}`,
      title: def.label,
      score: scores[def.key],
      source: `${display[def.key]} · ${def.formula}`,
    })
  })
  return groupMap
}
