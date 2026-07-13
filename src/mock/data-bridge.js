/**
 * 数据中心 ↔ 商机/分析/风险 业务数据桥接
 * 统一指标、血缘、下游路由，避免各模块 Mock 数据割裂
 */
import { INITIAL_OPPORTUNITIES } from './opportunity'
import { ENTERPRISE_CATALOG, MARKET_COUNTRIES, PRODUCT_CATEGORIES } from './analysis'
import {
  INITIAL_DATA_SOURCES,
  QUALITY_REPORT,
  QUALITY_TREND,
  CLEANING_PIPELINE,
  ENTITY_LINK_RULES,
  DATA_LINEAGE,
} from './data-governance'
import { INITIAL_RISK_TASKS } from './risk'
import { getProductionModels } from './model-algorithm'

export const MODULE_META = {
  opportunity: { label: '商机识别', route: '/opportunity/classify', color: '#B32620' },
  analysis_market: { label: '市场分析', route: '/analysis/market', color: '#1677ff' },
  analysis_product: { label: '商品分析', route: '/analysis/product', color: '#13c2c2' },
  analysis_enterprise: { label: '企业分析', route: '/analysis/enterprise', color: '#722ed1' },
  risk: { label: '风险防控', route: '/risk/identification', color: '#faad14' },
}

/** 数据源 → 下游业务模块映射 */
export const DATA_SOURCE_FEEDS = {
  'DS-001': {
    modules: ['analysis_market', 'analysis_product', 'opportunity'],
    desc: '海关统计 → 市场/商品分析 + 商机挖掘',
  },
  'DS-002': {
    modules: ['risk', 'analysis_market'],
    desc: '337调查公告 → 风险识别 + 政策解读',
  },
  'DS-003': {
    modules: ['analysis_market', 'risk'],
    desc: '欧盟贸易防卫 → 市场政策 + 风险预警',
  },
  'DS-004': {
    modules: ['opportunity', 'analysis_product'],
    desc: 'B2B询盘 → 商机池 + 商品供需',
  },
  'DS-005': {
    modules: ['analysis_enterprise', 'risk', 'opportunity'],
    desc: '企业信用 → 企业画像 + 买家信用评估',
  },
  'DS-006': {
    modules: ['analysis_market', 'risk'],
    desc: '航运指数 → 物流成本 + 物流风险',
  },
  'DS-007': {
    modules: ['risk', 'opportunity'],
    desc: '贸易舆情 → 风险信号 + 商机动态',
  },
  'DS-008': {
    modules: ['opportunity', 'analysis_enterprise'],
    desc: '行业动态 → 商机线索 + 企业拓展',
  },
  'DS-009': {
    modules: ['analysis_enterprise', 'opportunity', 'analysis_product'],
    desc: '内部交易 → 企业分析 + 商机复购',
  },
  'DS-010': {
    modules: ['risk'],
    desc: '物流轨迹 → 物流风险识别',
  },
  'DS-011': {
    modules: ['analysis_market', 'risk'],
    desc: '汇率行情 → 市场分析 + 汇率风险',
  },
  'DS-012': {
    modules: ['analysis_market', 'analysis_product'],
    desc: '港口吞吐量 → 市场物流指标 + 商品品类分析',
  },
}

export function getPlatformMetrics(options = {}) {
  const activeOpportunities = options.opportunityCount ?? INITIAL_OPPORTUNITIES.length
  const enabledSources = INITIAL_DATA_SOURCES.filter((d) => d.enabled)
  const todayVolumeSum = enabledSources.reduce((sum, d) => sum + (d.todayVolume || 0), 0)
  const todayCollectionWan = Math.round((todayVolumeSum / 2.8) * 10) / 10
  const enterpriseCount = Object.keys(ENTERPRISE_CATALOG).length
  const marketCountries = MARKET_COUNTRIES.length
  const productCategories = PRODUCT_CATEGORIES.length
  const qualityScore = QUALITY_TREND[QUALITY_TREND.length - 1]?.score ?? QUALITY_REPORT.after.overall
  const cleanedRecords = QUALITY_REPORT.recordCount.after
  const pendingRisks =
    (INITIAL_RISK_TASKS.pending?.length || 0) + (INITIAL_RISK_TASKS.processing?.length || 0)
  const productionModels = getProductionModels()
  const productionModelCount = productionModels.length
  const modelApiCalls24h = productionModels.reduce((sum, m) => sum + (m.apiCalls24h || 0), 0)
  const avgModelAccuracy =
    productionModelCount > 0
      ? Math.round((productionModels.reduce((sum, m) => sum + m.accuracy, 0) / productionModelCount) * 10) / 10
      : 0

  return {
    activeOpportunities,
    opportunityPoolTotal: cleanedRecords + activeOpportunities,
    cleanedRecords,
    enterpriseCount,
    marketCountries,
    productCategories,
    enabledSourceCount: enabledSources.length,
    todayCollectionWan,
    qualityScore,
    pendingRisks,
    rawVolumeMB: Math.round(todayVolumeSum * 10) / 10,
    productionModelCount,
    modelApiCalls24h,
    avgModelAccuracy,
  }
}

export function getSourceFeed(sourceId) {
  return DATA_SOURCE_FEEDS[sourceId] || { modules: [], desc: '未配置下游' }
}

export function formatModuleTags(sourceId) {
  const feed = getSourceFeed(sourceId)
  return feed.modules.map((key) => MODULE_META[key]).filter(Boolean)
}

export function buildIntegratedLineage(metrics) {
  const base = DATA_LINEAGE.slice(0, 6).map((item) => ({ ...item }))
  if (base[5]) {
    base[5] = {
      ...base[5],
      detail: `trade.clean.customs · ${metrics.cleanedRecords.toLocaleString()} 条`,
    }
  }
  return [
    ...base,
    {
      step: 7,
      stage: '模型算法·训练部署',
      node: '算法工厂 / 在线 API',
      detail: `${metrics.productionModelCount} 个生产模型 · 24h 调用 ${metrics.modelApiCalls24h.toLocaleString()} 次 · 均准 ${metrics.avgModelAccuracy}%`,
      time: '2026-07-02 10:24',
      route: '/data/models',
    },
    {
      step: 8,
      stage: '业务应用·商机识别',
      node: '商机池（温数据层）',
      detail: `清洗池 ${metrics.cleanedRecords.toLocaleString()} 条 → 有效商机 ${metrics.activeOpportunities} 条`,
      time: '2026-07-02 10:25',
      route: '/opportunity/classify',
    },
    {
      step: 9,
      stage: '业务应用·进出口分析',
      node: '分析主题库',
      detail: `${metrics.marketCountries} 国市场 · ${metrics.productCategories} 品类 · ${metrics.enterpriseCount} 家企业画像`,
      time: '2026-07-02 10:26',
      route: '/analysis/market',
    },
    {
      step: 10,
      stage: '业务应用·风险防控',
      node: '风险信号库',
      detail: `${metrics.pendingRisks} 条待处理任务 · 关联企业/政策/物流数据源`,
      time: '2026-07-02 10:27',
      route: '/risk/identification',
    },
  ]
}

export function syncPipelineWithMetrics(metrics) {
  return CLEANING_PIPELINE.map((step, index) => {
    if (index === 0) return { ...step, processed: metrics.opportunityPoolTotal, removed: QUALITY_REPORT.recordCount.deduped }
    if (index === 1) return { ...step, processed: metrics.cleanedRecords + 47, filled: QUALITY_REPORT.recordCount.filled }
    if (index === 2) return { ...step, processed: metrics.cleanedRecords + 47, outliers: QUALITY_REPORT.recordCount.outliers }
    if (index === 3) return { ...step, processed: metrics.cleanedRecords, converted: metrics.cleanedRecords }
    if (index === 4) return { ...step, processed: metrics.cleanedRecords * 6, entities: metrics.enterpriseCount * 40 }
    return { ...step }
  })
}

export function enrichEntityLinkRules(metrics) {
  return ENTITY_LINK_RULES.map((rule) => {
    if (rule.id === 'EL-004') {
      return {
        ...rule,
        linked: metrics.cleanedRecords,
        rightKey: `${metrics.activeOpportunities} 条有效商机`,
      }
    }
    if (rule.id === 'EL-002') {
      return { ...rule, linked: metrics.productCategories * 320 }
    }
    return rule
  })
}

export function getDownstreamConsumption(metrics) {
  return [
    {
      key: 'models',
      module: '模型算法中心',
      route: '/data/models',
      metric: `${metrics.productionModelCount} 个生产模型 · 均准 ${metrics.avgModelAccuracy}%`,
      pool: '模型服务 API 层',
      sources: ['清洗产出全量'],
    },
    {
      key: 'opportunity',
      module: MODULE_META.opportunity.label,
      route: MODULE_META.opportunity.route,
      metric: `${metrics.activeOpportunities} 条有效商机`,
      pool: `清洗池 ${metrics.cleanedRecords.toLocaleString()} 条`,
      sources: Object.entries(DATA_SOURCE_FEEDS)
        .filter(([, f]) => f.modules.includes('opportunity'))
        .map(([id]) => id),
    },
    {
      key: 'analysis_market',
      module: MODULE_META.analysis_market.label,
      route: MODULE_META.analysis_market.route,
      metric: `${metrics.marketCountries} 国市场指标`,
      pool: 'ClickHouse 温数据层',
      sources: Object.entries(DATA_SOURCE_FEEDS)
        .filter(([, f]) => f.modules.includes('analysis_market'))
        .map(([id]) => id),
    },
    {
      key: 'analysis_product',
      module: MODULE_META.analysis_product.label,
      route: MODULE_META.analysis_product.route,
      metric: `${metrics.productCategories} 个品类分析`,
      pool: 'trade.clean.product',
      sources: Object.entries(DATA_SOURCE_FEEDS)
        .filter(([, f]) => f.modules.includes('analysis_product'))
        .map(([id]) => id),
    },
    {
      key: 'analysis_enterprise',
      module: MODULE_META.analysis_enterprise.label,
      route: MODULE_META.analysis_enterprise.route,
      metric: `${metrics.enterpriseCount} 家企业画像`,
      pool: 'enterprise.profile',
      sources: Object.entries(DATA_SOURCE_FEEDS)
        .filter(([, f]) => f.modules.includes('analysis_enterprise'))
        .map(([id]) => id),
    },
    {
      key: 'risk',
      module: MODULE_META.risk.label,
      route: MODULE_META.risk.route,
      metric: `${metrics.pendingRisks} 条待处理风险`,
      pool: 'risk.signals',
      sources: Object.entries(DATA_SOURCE_FEEDS)
        .filter(([, f]) => f.modules.includes('risk'))
        .map(([id]) => id),
    },
  ]
}

export function getLatestCollectionTasks(limit = 4) {
  return INITIAL_DATA_SOURCES.filter((d) => d.enabled)
    .sort((a, b) => (b.lastSync || '').localeCompare(a.lastSync || ''))
    .slice(0, limit)
    .map((d) => {
      const feed = getSourceFeed(d.id)
      const progress = d.health === 'green' ? 92 + (d.id.charCodeAt(3) % 8) : d.health === 'yellow' ? 72 : 58
      return {
        id: d.id,
        name: d.name,
        status: d.status,
        progress,
        time: d.lastSync,
        downstream: feed.modules.map((m) => MODULE_META[m]?.label).filter(Boolean).join('、') || '—',
        routes: [...new Set(feed.modules.map((m) => MODULE_META[m]?.route).filter(Boolean))],
      }
    })
}

export function buildHomeDashboard(options = {}) {
  const metrics = getPlatformMetrics(options)
  return {
    opportunityTotal: metrics.activeOpportunities,
    opportunityPoolTotal: metrics.opportunityPoolTotal,
    cleanedRecords: metrics.cleanedRecords,
    pendingRisks: metrics.pendingRisks,
    todayCollection: metrics.todayCollectionWan,
    qualityScore: metrics.qualityScore,
    enterpriseCount: metrics.enterpriseCount,
    marketCountries: metrics.marketCountries,
    productionModelCount: metrics.productionModelCount,
    latestTasks: getLatestCollectionTasks(4),
    downstream: getDownstreamConsumption(metrics),
  }
}
