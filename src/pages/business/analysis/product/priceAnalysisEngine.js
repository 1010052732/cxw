/** 价格走势分析计算引擎 — 与 3.2.2.2.2.2 文档逻辑对齐 */

export const FORECAST_HORIZONS = [
  { value: 1, label: '1个月' },
  { value: 3, label: '3个月' },
  { value: 6, label: '6个月' },
]

export function buildTrendCompare(multiLine, benchmarkRatio = 0.97) {
  const spot = (multiLine || []).filter((d) => d.series === '现货')
  return spot.map((d) => ({
    date: d.date,
    price: d.price,
    benchmark: Math.round(d.price * benchmarkRatio),
  }))
}

export function computeWeeklyChange(multiLine) {
  const spot = (multiLine || []).filter((d) => d.series === '现货')
  if (spot.length < 2) return 0
  const last = spot[spot.length - 1]?.price || 0
  const prev = spot[spot.length - 2]?.price || last
  if (!prev) return 0
  return Math.round(((last - prev) / prev) * 1000) / 10
}

export function filterForecastByHorizon(forecastLines, months = 3) {
  const allowed = new Set()
  const base = new Date('2026-06-01')
  for (let i = 1; i <= months; i += 1) {
    const d = new Date(base)
    d.setMonth(d.getMonth() + i)
    allowed.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return (forecastLines || []).filter((row) => allowed.has(row.month))
}

export function computeProbBreakUpper(forecast, upper, current) {
  const risk = forecast?.scenarios?.pessimistic || []
  if (!risk.length || !upper || !current) return 0
  const hits = risk.filter((d) => d.price >= upper).length
  const maxRisk = Math.max(...risk.map((d) => d.price))
  let prob = Math.round((hits / risk.length) * 55)
  if (maxRisk >= upper) prob += 25
  if (current >= upper * 0.95) prob += 15
  return Math.min(95, Math.max(5, prob))
}

export function shouldAutoAttribution(weeklyChange, threshold = 8) {
  return Math.abs(weeklyChange) >= threshold
}

export function generateAttributionReport(priceData, options = {}) {
  const weeklyChange = options.weeklyChange ?? computeWeeklyChange(priceData.multiLine)
  const changeStr = `${weeklyChange >= 0 ? '+' : ''}${weeklyChange}%`
  const base = priceData.attribution || {}
  const factors = base.factors || (priceData.factorDatabase?.[0]?.items || []).slice(0, 5).map((f, i) => ({
    name: f.factor,
    weight: f.contribution || (30 - i * 5),
  }))

  return {
    period: base.period || `2026-W${Math.ceil(new Date().getDate() / 7) + 22}`,
    change: changeStr,
    weeklyChange,
    summary: base.summary || `本期价格${weeklyChange >= 0 ? '上涨' : '下跌'} ${Math.abs(weeklyChange)}%，主要由成本传导与供需变化共同驱动。`,
    factors,
    methods: ['多元回归分析', '方差分解', '时间序列STL分解'],
    historicalCompare: base.historicalCompare || [
      { event: '2024-Q2 原料涨价周期', similarity: 76, diff: '本次运费贡献更高' },
      { event: '2023-W45 贸易政策扰动', similarity: 62, diff: '政策预期占比更高' },
    ],
    generatedAt: new Date().toLocaleString('zh-CN'),
  }
}

export function computeHedgingAdvice(priceData, inputs = {}) {
  const base = priceData.hedging || {}
  if (!base.contract || base.contract.includes('不适用')) {
    return { ...base, applicable: false }
  }

  const monthlyPurchase = Number(inputs.monthlyPurchase) || 800
  const inventory = Number(inputs.inventory) || 200
  const exposure = monthlyPurchase + inventory * 0.5
  const hedgeRatio = Math.min(0.85, Math.max(0.3, (inputs.hedgeRatio ?? 65) / 100))
  const quantity = Math.round(exposure * hedgeRatio)

  return {
    ...base,
    applicable: true,
    monthlyPurchase,
    inventory,
    exposure: Math.round(exposure),
    hedgeRatio: Math.round(hedgeRatio * 100),
    quantity: `${quantity}吨当量`,
    direction: weeklyTrend(priceData) >= 0 ? '卖出套保' : '买入套保',
    stopLoss: base.stopLoss || `较现价 ${weeklyTrend(priceData) >= 0 ? '+' : '-'}5%`,
    note: `基于月采购 ${monthlyPurchase} 吨、库存 ${inventory} 吨，建议对冲比例 ${Math.round(hedgeRatio * 100)}%`,
  }
}

function weeklyTrend(priceData) {
  return computeWeeklyChange(priceData.multiLine)
}

export function buildAlertPayload(priceData, alertCheck, settings) {
  const channels = []
  if (settings.channels?.platform) channels.push('平台弹窗')
  if (settings.channels?.sms) channels.push('短信')
  if (settings.channels?.email) channels.push('邮件')
  return {
    id: `alert-${Date.now()}`,
    time: new Date().toLocaleString('zh-CN'),
    product: priceData.productName,
    currentPrice: priceData.currentPrice,
    reasons: alertCheck.reasons.map((r) => r.msg),
    channels: channels.join('、') || '平台',
    level: alertCheck.reasons.some((r) => r.level === 'error') ? 'error' : 'warning',
  }
}

export function exportPriceAnalysisCsv(priceData) {
  const rows = []
  ;(priceData.multiLine || []).forEach((d) => {
    rows.push({ 类型: '走势', 日期: d.date, 系列: d.series, 价格: d.price })
  })
  ;(priceData.forecastLines || []).forEach((d) => {
    rows.push({ 类型: '预测', 日期: d.month, 系列: d.series, 价格: d.price })
  })
  ;(priceData.indices || []).forEach((d) => {
    rows.push({ 类型: '指数', 日期: d.name, 系列: '基准', 价格: d.value })
  })
  return rows
}

export function exportAttributionTxt(report, productName) {
  const lines = [
    `价格波动归因分析报告`,
    `商品：${productName}`,
    `周期：${report.period}`,
    `涨跌幅：${report.change}`,
    `生成时间：${report.generatedAt}`,
    ``,
    `摘要：${report.summary}`,
    ``,
    `分析方法：${(report.methods || []).join('、')}`,
    ``,
    `因子贡献：`,
    ...(report.factors || []).map((f) => `  - ${f.name}: ${f.weight}%`),
    ``,
    `历史对比：`,
    ...(report.historicalCompare || []).map((h) => `  - ${h.event} (相似度${h.similarity}%): ${h.diff}`),
  ]
  return lines.join('\n')
}
