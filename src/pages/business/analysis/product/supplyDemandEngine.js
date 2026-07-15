/** 供求关系研究计算引擎 — 3.2.2.2.2.3 */

export const SD_WORKFLOW_STEPS = [
  { key: 'integrate', title: '数据整合' },
  { key: 'balance', title: '平衡仪表盘' },
  { key: 'imbalance', title: '失衡分析' },
  { key: 'bottleneck', title: '瓶颈模拟' },
  { key: 'strategy', title: '策略建议' },
]

export const GAP_STATUS_COLORS = {
  短缺: 'error',
  紧平衡: 'warning',
  过剩: 'default',
  严重过剩: 'processing',
}

const MARKET_SD_ADJUST = {
  德国: { demand: 1.08, import: 1.1 },
  美国: { demand: 1.12, import: 1.05 },
  东盟: { demand: 1.15, export: 1.2 },
  中东: { demand: 0.9, import: 0.85 },
  日本: { demand: 1.02, import: 1.0 },
}

export function resolveSupplyDemandParent(name, directory = []) {
  if (['汽车配件', '电子产品', '机械设备'].includes(name)) return name
  const dir = directory.find((d) => d.name === name)
  if (dir?.parent) return dir.parent
  if (/刹|汽配|配件|底盘/i.test(name)) return '汽车配件'
  if (/5g|电子|光纤|电路|pcb/i.test(name)) return '电子产品'
  if (/机床|机械|泵|cnc/i.test(name)) return '机械设备'
  return '汽车配件'
}

export function applySupplyDemandFilters(data, filters = {}) {
  const { targetMarket = 'all' } = filters
  if (targetMarket === 'all') return data
  const adj = MARKET_SD_ADJUST[targetMarket] || { demand: 1, import: 1, export: 1 }
  const balance = { ...data.balance }
  if (adj.demand) {
    balance.demand = {
      ...balance.demand,
      total: Math.round(balance.demand.total * adj.demand),
      mom: Math.round((balance.demand.mom + (adj.demand - 1) * 10) * 10) / 10,
    }
  }
  const tradeHeatmap = (data.tradeHeatmap || []).map((cell) => {
    if (cell.region.includes(targetMarket) || targetMarket.includes(cell.region)) {
      return {
        ...cell,
        import: Math.round(cell.import * (adj.import || 1.1)),
        export: Math.round(cell.export * (adj.export || 1)),
        intensity: Math.min(100, Math.round(cell.intensity * 1.08)),
      }
    }
    return cell
  })
  return {
    ...data,
    balance,
    tradeHeatmap,
    filterNote: `目标市场聚焦：${targetMarket}`,
  }
}

export function buildInventoryRatioSeries(history = [], demandTotal = 1) {
  return history.map((h) => ({
    period: h.period,
    ratio: Math.round((h.inventory / Math.max(h.demand, 1)) * 100) / 100,
    turnover: Math.round((h.inventory / Math.max(demandTotal / 12, 1)) * 30),
  }))
}

export function buildStatusMigration(gap = []) {
  return gap.map((g, i) => ({
    month: g.month,
    status: g.status,
    gap: g.gap,
    order: i,
  }))
}

export function runBottleneckSimulation(bottleneck, alertNodes = []) {
  const base = bottleneck?.simulation || bottleneck?.propagationHeatmap || []
  if (!base.length) {
    return {
      ran: true,
      event: bottleneck?.event || '未识别重大瓶颈',
      heatmap: [],
      affected: bottleneck?.affected || [],
      suggestions: bottleneck?.suggestions || ['维持现有采购节奏'],
      summary: '当前供应链节点运行平稳，暂无显著传播风险。',
    }
  }

  const alertBoost = alertNodes.filter((n) => n.alert).length * 0.08
  const heatmap = base.map((cell) => ({
    region: cell.region,
    delay: Math.round((cell.delay || 0) * (1 + alertBoost)),
    cost: Math.round(((cell.cost || cell.costUp || 0) * (1 + alertBoost)) * 10) / 10,
    intensity: Math.min(100, Math.round(((cell.delay || 0) + (cell.cost || cell.costUp || 0) * 2) * (1 + alertBoost))),
  }))

  const topRegions = [...heatmap].sort((a, b) => b.intensity - a.intensity).slice(0, 3).map((h) => h.region)

  return {
    ran: true,
    event: bottleneck.event,
    heatmap,
    affected: bottleneck.affected || [],
    suggestions: bottleneck.suggestions || [],
    summary: `瓶颈事件已沿贸易流传播，${topRegions.join('、')} 面临较高延迟与成本上升风险。`,
    topRegions,
  }
}

export function buildStrategyRecommendations(data, simulationResult = null) {
  const { balance, imbalance } = data
  const gap = balance.gap?.[0]
  const strategies = []

  if (gap?.status === '短缺' || gap?.gap < -30) {
    strategies.push({
      type: '采购',
      priority: '高',
      action: '提前锁定紧缺货源',
      detail: `未来3月供需缺口约 ${Math.abs(gap?.gap || 0)}，建议与核心供应商签订Q3长协并预留15%安全产能。`,
    })
    strategies.push({
      type: '库存',
      priority: '高',
      action: '提升安全库存',
      detail: `当前库存消费比 ${balance.inventory.ratio}，建议将周转天数从 ${balance.inventory.turnoverDays} 天提升至 ${balance.inventory.turnoverDays + 12} 天。`,
    })
  } else if (gap?.status === '过剩' || gap?.gap > 20) {
    strategies.push({
      type: '库存',
      priority: '中',
      action: '滞销清库',
      detail: '市场供给过剩，建议促销去库存并压缩采购批次，避免库存积压侵蚀毛利。',
    })
  } else {
    strategies.push({
      type: '生产',
      priority: '中',
      action: '按旺季节奏备货',
      detail: '市场紧平衡，建议按需求结构分布提前1个月排产，重点保障高增速细分品类。',
    })
  }

  const highCause = (imbalance.causes || []).find((c) => c.impact === '高')
  if (highCause) {
    strategies.push({
      type: '采购',
      priority: '高',
      action: `应对${highCause.reason}`,
      detail: highCause.desc,
    })
  }

  if (simulationResult?.ran && simulationResult.heatmap?.length) {
    strategies.push({
      type: '物流',
      priority: '高',
      action: '启动替代物流方案',
      detail: (simulationResult.suggestions || []).join('；') || '评估中欧班列/空运加急等替代线路。',
    })
  }

  return strategies
}

export function exportSupplyDemandCsv(data) {
  const rows = []
  ;(data.balance?.history || []).forEach((h) => {
    rows.push({ 类型: '供需历史', 周期: h.period, 供给: h.supply, 需求: h.demand, 库存: h.inventory })
  })
  ;(data.balance?.gap || []).forEach((g) => {
    rows.push({ 类型: '供需缺口', 周期: g.month, 供给: g.gap, 需求: g.status, 库存: '' })
  })
  ;(data.tradeHeatmap || []).forEach((t) => {
    rows.push({ 类型: '贸易热力', 周期: t.region, 供给: t.export, 需求: t.import, 库存: t.intensity })
  })
  return rows
}

export function exportSupplyDemandReportTxt(data, productName, simulation) {
  const lines = [
    '供求关系研究报告',
    `商品：${productName}`,
    `市场状态：${data.balance?.marketStatus}`,
    `生成时间：${new Date().toLocaleString('zh-CN')}`,
    '',
    '【供需平衡】',
    `供给：${data.balance?.supply?.total} ${data.balance?.supply?.unit}（环比+${data.balance?.supply?.mom}%）`,
    `需求：${data.balance?.demand?.total}（环比+${data.balance?.demand?.mom}%）`,
    `库存：${data.balance?.inventory?.total}（消费比${data.balance?.inventory?.ratio}，周转${data.balance?.inventory?.turnoverDays}天）`,
    '',
    '【失衡判断】',
    data.imbalance?.summary || '',
    ...(data.imbalance?.causes || []).map((c) => `  - [${c.impact}] ${c.reason}：${c.desc}`),
    '',
    '【瓶颈模拟】',
    simulation?.summary || '未执行',
    ...(simulation?.suggestions || []).map((s) => `  建议：${s}`),
  ]
  return lines.join('\n')
}
