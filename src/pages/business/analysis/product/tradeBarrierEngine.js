/** 贸易壁垒分析引擎 — 3.2.2.2.2.4 */

export const TB_WORKFLOW_STEPS = [
  { key: 'database', title: '壁垒数据库' },
  { key: 'cost', title: '成本模拟' },
  { key: 'compliance', title: '合规路径' },
  { key: 'documents', title: '文件清单' },
]

export const TRADE_TERM_OPTIONS = [
  { value: 'CIF', label: 'CIF 到岸价' },
  { value: 'FOB', label: 'FOB 离岸价' },
  { value: 'CFR', label: 'CFR 成本加运费' },
  { value: 'DDP', label: 'DDP 完税后交货' },
]

const DIFFICULTY_BY_TYPE = {
  关税: '低',
  配额: '中',
  禁令: '高',
  TBT: '高',
  SPS: '高',
  反倾销: '高',
  反补贴: '高',
  保障措施: '中',
  许可证: '中',
  知识产权: '中',
  绿色壁垒: '高',
  出口管制: '高',
}

const IMPACT_BY_TYPE = {
  关税: '到岸成本',
  配额: '进口数量',
  禁令: '市场准入',
  TBT: '通关时效',
  SPS: '检验检疫',
  反倾销: '到岸成本',
  反补贴: '到岸成本',
  保障措施: '到岸成本',
  许可证: '通关时效',
  知识产权: '货物扣留风险',
  绿色壁垒: '合规成本',
  出口管制: '市场准入',
}

export function enrichBarrierEntry(barrier) {
  const type = barrier.type || '关税'
  return {
    ...barrier,
    complianceDifficulty: barrier.complianceDifficulty || DIFFICULTY_BY_TYPE[type] || '中',
    effectivePeriod: barrier.effectivePeriod || (barrier.status === '调查中' ? '待定' : '即时生效'),
    impactScope: barrier.impactScope || IMPACT_BY_TYPE[type] || '综合贸易',
    updatedAt: barrier.updatedAt || '2026-07-02',
  }
}

export function calcComprehensiveCost(inputs, route, barriers = []) {
  const {
    cargoValue = 100,
    quantity = 1000,
    origin = '中国',
    targetMarket = '德国',
    tradeTerm = 'CIF',
  } = inputs

  const value = Number(cargoValue) || 0
  const qty = Number(quantity) || 1000

  const ftaDiscount = origin === '中国' && /东盟|越南|RCEP/i.test(route.name || '')
    ? 0.65
    : origin !== '中国' && /自贸|东盟|越南/i.test(route.name || '')
      ? 0.55
      : /自贸|原产地|FTA/i.test(route.name || '')
        ? 0.7
        : 1

  const marketFactor = targetMarket.includes('美国') ? 1.08
    : targetMarket.includes('巴西') ? 1.12
      : targetMarket.includes('日本') ? 1.05
        : 1

  const matched = (barriers || []).filter((b) =>
    targetMarket.includes(b.country) || b.country.includes(targetMarket) || b.country === '欧盟',
  )

  const antiDumping = matched
    .filter((b) => /反倾销|反补贴/.test(b.type))
    .reduce((sum, b) => sum + (Number(String(b.rate).replace(/[^\d.]/g, '')) || 0), 0)

  const hasQuota = matched.some((b) => b.type === '配额')
  const hasTbtSps = matched.some((b) => b.type === 'TBT' || b.type === 'SPS')

  const termFactor = { CIF: 1.02, FOB: 1.0, CFR: 1.01, DDP: 1.05 }[tradeTerm] || 1
  const tariffRate = route.tariff * ftaDiscount * marketFactor
  const tariffCost = value * (tariffRate / 100) * termFactor
  const vatCost = (value + tariffCost) * (route.vat / 100)
  const addDuty = value * ((route.addDuty + antiDumping) / 100)
  const quotaFee = hasQuota ? value * 0.015 : 0
  const inspection = hasTbtSps ? value * 0.012 : value * 0.005
  const agency = value * (route.agency / 100)
  const total = value + tariffCost + vatCost + addDuty + quotaFee + inspection + agency

  return {
    cargoValue: value,
    quantity: qty,
    tradeTerm,
    tariffCost: round2(tariffCost),
    vatCost: round2(vatCost),
    addDuty: round2(addDuty),
    quotaFee: round2(quotaFee),
    inspection,
    inspectionCost: round2(inspection),
    agency: round2(agency),
    total: round2(total),
    rateTotal: round1(tariffRate + route.vat + route.addDuty + antiDumping + route.agency + (hasQuota ? 1.5 : 0) + (hasTbtSps ? 1.2 : 0.5)),
    origin,
    targetMarket,
    ftaApplied: ftaDiscount < 1,
    antiDumping,
    hasQuota,
    hasTbtSps,
    note: ftaDiscount < 1
      ? `已适用优惠路径（${tradeTerm}）· 含检测费/代理费`
      : `标准路径（${tradeTerm}）· 含检测费/代理费`,
    recommended: false,
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function round1(n) {
  return Math.round(n * 10) / 10
}

export function compareRoutes(routes, inputs, barriers) {
  const results = (routes || []).map((route) => {
    const cost = calcComprehensiveCost(inputs, route, barriers)
    return { ...route, ...cost, totalCost: cost.total }
  })
  const sorted = [...results].sort((a, b) => a.total - b.total)
  if (sorted[0]) sorted[0].recommended = true
  return sorted
}

export function buildCompliancePlan(certifications = [], targetMarket) {
  const certs = certifications.filter((c) => c.market === targetMarket || c.market === '欧盟' || targetMarket.includes(c.market))
  return certs.map((c, i) => ({
    step: i + 1,
    market: c.market,
    cert: c.cert,
    mandatory: c.mandatory,
    cycle: c.cycle,
    agency: c.agency,
    actions: [
      `确认 ${c.cert} 适用范围与测试标准`,
      `联系 ${c.agency} 提交样品与工厂审核资料`,
      `预计周期 ${c.cycle}，建议提前 ${c.mandatory ? '3个月' : '1个月'} 启动`,
    ],
  }))
}

export function buildDocumentChecklist(documents = [], options = {}) {
  const { productName, targetMarket, tradeMode = 'general', hsCode } = options
  return (documents || []).map((doc, i) => ({
    id: `doc-${i}`,
    doc: doc.doc,
    required: doc.required,
    lang: doc.lang,
    tradeMode: doc.tradeMode || 'all',
    checked: false,
    templateName: `${doc.doc}-${targetMarket}-${tradeMode}.txt`,
    hint: doc.required
      ? `${targetMarket} 清关必需文件 · HS ${hsCode || '-'}`
      : `建议备齐以加速通关 · ${productName}`,
  }))
}

export function exportBarrierReportTxt(data, inputs, bestRoute) {
  const lines = [
    '贸易壁垒分析报告',
    `商品：${data.productName}`,
    `HS编码：${inputs.hsCode || '-'}`,
    `目标市场：${inputs.targetMarket}`,
    `原产地：${inputs.origin}`,
    `贸易条款：${inputs.tradeTerm}`,
    `生成时间：${new Date().toLocaleString('zh-CN')}`,
    '',
    '【壁垒条目】',
    ...(data.barriers || []).map((b) =>
      `  [${b.country}] ${b.type} · ${b.status} · ${b.rate} · 难度${b.complianceDifficulty} · ${b.desc}`,
    ),
    '',
    '【最优路径】',
    bestRoute ? `${bestRoute.name} · 到岸成本 ${bestRoute.total} 万元 · 综合费率 ${bestRoute.rateTotal}%` : '未测算',
    '',
    '【认证要求】',
    ...(data.certifications || []).map((c) => `  ${c.market} · ${c.cert} · ${c.mandatory ? '强制' : '自愿'} · ${c.cycle}`),
  ]
  return lines.join('\n')
}
