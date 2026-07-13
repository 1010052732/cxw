export const RISK_TYPES = ['全部', '市场风险', '信用风险', '政策风险', '物流风险', '汇率风险', '合规风险']
export const RISK_LEVELS = ['全部', '高', '中', '低']

export const INITIAL_ALERTS = [
  {
    id: 'RA-001', title: '中东航线大面积延误', type: '物流风险', level: '高', region: '中东',
    time: '2026-07-02 08:30', status: 'active', confirmed: false,
    detail: '受地区局势影响，苏伊士运河以东航线平均延误72小时，建议调整出货计划。',
  },
  {
    id: 'RA-002', title: '美国301关税清单更新', type: '政策风险', level: '高', region: '北美',
    time: '2026-07-02 07:15', status: 'active', confirmed: false,
    detail: '部分电子元器件关税由15%上调至25%，涉及HS 8517品类。',
  },
  {
    id: 'RA-003', title: '巴西买家信用异常', type: '信用风险', level: '高', region: '南美',
    time: '2026-07-01 16:40', status: 'active', confirmed: false,
    detail: '合作买家近30天出现2笔逾期付款，建议暂停新增订单。',
  },
  {
    id: 'RA-004', title: '欧元汇率波动加剧', type: '汇率风险', level: '中', region: '欧洲',
    time: '2026-07-01 14:20', status: 'active', confirmed: true,
    detail: 'EUR/CNY 近7日波动超过3%，建议启用远期锁汇。',
  },
  {
    id: 'RA-005', title: '印尼出口许可证收紧', type: '政策风险', level: '中', region: '东南亚',
    time: '2026-06-30 11:05', status: 'active', confirmed: true,
    detail: '镍矿下游产品出口需额外审批，周期延长5-7个工作日。',
  },
  {
    id: 'RA-006', title: '某港口集装箱堆场饱和', type: '物流风险', level: '中', region: '东亚',
    time: '2026-06-29 09:50', status: 'active', confirmed: true,
    detail: '上海港部分堆场利用率超95%，提箱等待时间延长。',
  },
  {
    id: 'RA-007', title: '反倾销调查立案', type: '合规风险', level: '中', region: '欧洲',
    time: '2026-06-28 15:30', status: 'active', confirmed: true,
    detail: '欧盟对某类光伏组件发起反倾销调查，建议关注应诉窗口。',
  },
  {
    id: 'RA-008', title: '泰国买家资质待核验', type: '信用风险', level: '低', region: '东南亚',
    time: '2026-06-27 10:15', status: 'active', confirmed: true,
    detail: '新合作买家注册信息不完整，建议补充尽调材料。',
  },
]

export const RISK_TREND_30D = [
  { date: '06-03', high: 2, medium: 5, low: 8 }, { date: '06-06', high: 3, medium: 6, low: 7 },
  { date: '06-09', high: 2, medium: 7, low: 9 }, { date: '06-12', high: 4, medium: 6, low: 8 },
  { date: '06-15', high: 3, medium: 8, low: 10 }, { date: '06-18', high: 3, medium: 7, low: 9 },
  { date: '06-21', high: 4, medium: 8, low: 11 }, { date: '06-24', high: 3, medium: 9, low: 10 },
  { date: '06-27', high: 3, medium: 8, low: 12 }, { date: '06-30', high: 3, medium: 9, low: 11 },
  { date: '07-02', high: 3, medium: 9, low: 12 },
]

export const RISK_TYPE_STATS = [
  { type: '市场风险', value: 16 },
  { type: '信用风险', value: 18 },
  { type: '政策风险', value: 22 },
  { type: '物流风险', value: 26 },
  { type: '汇率风险', value: 14 },
  { type: '合规风险', value: 20 },
]

export const HEATMAP_REGIONS = [
  { region: '北美', level: '高', score: 85 }, { region: '欧洲', level: '中', score: 62 },
  { region: '东亚', level: '中', score: 58 }, { region: '东南亚', level: '中', score: 55 },
  { region: '中东', level: '高', score: 88 }, { region: '南美', level: '中', score: 60 },
  { region: '非洲', level: '低', score: 35 }, { region: '大洋洲', level: '低', score: 28 },
  { region: '南亚', level: '中', score: 52 }, { region: '独联体', level: '高', score: 72 },
]

export const ASSESSMENT_ITEMS = [
  { key: 'counterparty', label: '交易对手资质', weight: 20, options: [{ v: 90, t: '优质' }, { v: 70, t: '一般' }, { v: 40, t: '较差' }] },
  { key: 'country', label: '国别风险', weight: 15, options: [{ v: 85, t: '低风险国' }, { v: 60, t: '中风险国' }, { v: 30, t: '高风险国' }] },
  { key: 'product', label: '商品合规性', weight: 15, options: [{ v: 88, t: '合规' }, { v: 65, t: '待审查' }, { v: 35, t: '敏感品' }] },
  { key: 'payment', label: '支付方式', weight: 20, options: [{ v: 92, t: '信用证/托收' }, { v: 70, t: '电汇预付' }, { v: 45, t: 'OA赊销' }] },
  { key: 'logistics', label: '物流通道', weight: 15, options: [{ v: 86, t: '稳定' }, { v: 62, t: '一般' }, { v: 38, t: '不稳定' }] },
  { key: 'policy', label: '政策环境', weight: 15, options: [{ v: 90, t: '友好' }, { v: 68, t: '中性' }, { v: 42, t: '趋严' }] },
]

export const INITIAL_RISK_TASKS = {
  pending: [
    {
      id: 'RT-001', title: '中东航线大面积延误', level: '高', type: '物流风险',
      reporter: '系统自动', time: '2026-07-02 08:30', owner: '', records: [],
    },
    {
      id: 'RT-002', title: '巴西买家信用异常', level: '高', type: '信用风险',
      reporter: '风控专员-李明', time: '2026-07-01 16:40', owner: '', records: [],
    },
  ],
  processing: [
    {
      id: 'RT-003', title: '美国301关税清单更新', level: '高', type: '政策风险',
      reporter: '系统自动', time: '2026-07-02 07:15', owner: '王芳',
      records: [
        { time: '2026-07-02 09:00', action: '分配责任人', user: '管理员', note: '指派王芳跟进' },
        { time: '2026-07-02 10:30', action: '启动评估', user: '王芳', note: '正在梳理受影响品类清单' },
      ],
    },
    {
      id: 'RT-004', title: '欧元汇率波动加剧', level: '中', type: '汇率风险',
      reporter: '财务中心', time: '2026-07-01 14:20', owner: '张强',
      records: [
        { time: '2026-07-01 15:00', action: '分配责任人', user: '管理员', note: '指派张强处理' },
      ],
    },
  ],
  archived: [
    {
      id: 'RT-005', title: '某港口集装箱堆场饱和', level: '中', type: '物流风险',
      reporter: '物流部', time: '2026-06-29 09:50', owner: '赵磊',
      records: [
        { time: '2026-06-29 10:00', action: '分配责任人', user: '管理员', note: '指派赵磊' },
        { time: '2026-06-29 14:00', action: '上传凭证', user: '赵磊', note: '已切换备用港口方案' },
        { time: '2026-06-30 09:00', action: '归档完成', user: '赵磊', note: '风险已消除' },
      ],
    },
  ],
}

export const RISK_CASES = [
  {
    id: 'RC-001', title: '虚假贸易单据识别案例', type: '信用风险', industry: '机电产品',
    region: '东南亚', date: '2025-11-20', level: '高',
    summary: '通过单证交叉比对发现重复使用的提单号，成功拦截虚假贸易。',
    detail: '某企业提交的多笔贸易单据中，提单号与船公司系统记录不符，经核查为伪造单据。处置措施包括冻结交易、上报监管部门，并完善单证核验流程。',
    tags: ['单证核验', '虚假贸易'],
    similar: ['RC-003', 'RC-006'],
  },
  {
    id: 'RC-002', title: 'RCEP原产地规则误用', type: '政策风险', industry: '电子产品',
    region: '东盟', date: '2025-10-08', level: '中',
    summary: '企业错误申报RCEP原产地，导致退运并产生额外关税。',
    detail: '产品实际增值比例未达到RCEP要求，但仍按零关税申报。海关稽查后要求补缴关税及滞纳金。建议加强原产地规则培训。',
    tags: ['RCEP', '原产地'],
    similar: ['RC-005'],
  },
  {
    id: 'RC-003', title: '高风险国家收汇异常', type: '信用风险', industry: '农产品',
    region: '中东', date: '2025-09-15', level: '高',
    summary: '买家所在国汇管制收紧，导致货款无法按时到账。',
    detail: '合作买家所在国突然加强外汇管制，200万美元货款滞留。通过第三方担保和分批收汇方案，最终回收85%款项。',
    tags: ['收汇', '国别风险'],
    similar: ['RC-001', 'RC-006'],
  },
  {
    id: 'RC-004', title: '红海航线中断应对', type: '物流风险', industry: '化工材料',
    region: '中东', date: '2025-08-22', level: '高',
    summary: '航线中断导致交货严重延误，通过多式联运方案保障履约。',
    detail: '原定苏伊士运河航线中断，改道好望角增加15天航程。启动南非中转+铁路联运备选方案，最终延迟控制在7天内。',
    tags: ['航线中断', '多式联运'],
    similar: ['RC-007'],
  },
  {
    id: 'RC-005', title: '反补贴调查应诉案例', type: '合规风险', industry: '光伏组件',
    region: '欧洲', date: '2025-07-10', level: '中',
    summary: '成功应诉欧盟反补贴调查，维持正常出口税率。',
    detail: '企业联合行业商协会提交完整应诉材料，证明不存在政府补贴。终裁维持现有税率，避免高额惩罚性关税。',
    tags: ['反补贴', '应诉'],
    similar: ['RC-002'],
  },
  {
    id: 'RC-006', title: '关联企业循环贸易识别', type: '信用风险', industry: '机械设备',
    region: '全球', date: '2025-06-18', level: '高',
    summary: '识别关联企业间循环贸易，避免虚假繁荣的贸易数据。',
    detail: '通过企业图谱分析发现三家企业存在循环交易，贸易量虚增。已纳入黑名单并调整授信额度。',
    tags: ['关联企业', '循环贸易'],
    similar: ['RC-001', 'RC-003'],
  },
  {
    id: 'RC-007', title: '港口罢工物流危机', type: '物流风险', industry: '消费品',
    region: '欧洲', date: '2025-05-05', level: '中',
    summary: '欧洲港口罢工期间通过内陆运输保障供应链。',
    detail: '汉堡港罢工导致集装箱积压，启用铁路+公路内陆运输方案，将延误从预计21天缩短至9天。',
    tags: ['港口罢工', '供应链'],
    similar: ['RC-004'],
  },
  {
    id: 'RC-008', title: '汇率剧烈波动对冲', type: '汇率风险', industry: '汽车配件',
    region: '北美', date: '2025-04-12', level: '中',
    summary: '通过远期锁汇规避美元贬值带来的汇兑损失。',
    detail: 'USD/CNY 单月波动超4%，企业提前锁定6个月远期汇率，避免损失约320万元人民币。',
    tags: ['汇率对冲', '远期锁汇'],
    similar: [],
  },
  {
    id: 'RC-009', title: '非洲买家拖欠货款追讨成功案例', type: '信用风险', industry: '轻工产品',
    region: '非洲', date: '2025-07-18', level: '高',
    summary: '非洲买家订单突增后拖欠，通过信用保险与本地律师成功回收70%货款。',
    detail: '买家在订单量突增3个月后出现付款延迟，企业启动信用保险索赔并委托当地律师，6个月内回收70%货款。',
    tags: ['非洲', '拖欠货款', '信用保险'],
    similar: ['RC-003', 'RC-006'],
  },
]

export function calcAssessmentScore(values) {
  let total = 0
  ASSESSMENT_ITEMS.forEach((item) => {
    const score = values[item.key] || 0
    total += (score * item.weight) / 100
  })
  return Math.round(total * 10) / 10
}

export function getRiskLevelByScore(score) {
  if (score >= 80) return { level: '低', color: 'success', suggestion: '风险可控，可正常开展业务，建议定期复核。' }
  if (score >= 60) return { level: '中', color: 'warning', suggestion: '存在一定风险，建议加强合同条款与履约监控。' }
  return { level: '高', color: 'error', suggestion: '风险较高，建议暂停交易并启动专项处置。' }
}

export function getHeatColor(score) {
  if (score >= 75) return '#B32620'
  if (score >= 50) return '#faad14'
  return '#52c41a'
}

export const RISK_SCAN_DIMENSIONS = [
  { key: 'market', label: '市场风险', score: 72, alerts: 5, status: '中' },
  { key: 'credit', label: '信用风险', score: 68, alerts: 8, status: '中' },
  { key: 'policy', label: '政策风险', score: 81, alerts: 6, status: '高' },
  { key: 'fx', label: '汇率风险', score: 55, alerts: 3, status: '中' },
  { key: 'logistics', label: '物流风险', score: 78, alerts: 7, status: '高' },
  { key: 'compliance', label: '合规风险', score: 62, alerts: 4, status: '中' },
]

export const RISK_ATOM_CATEGORIES = ['全部', '信用风险', '市场风险', '运营风险', '合规风险', '地缘政治', 'ESG', 'AI预测']

export const RISK_INDICATOR_ATOMS = [
  { id: 'a1', category: '信用风险', name: '采购商90天平均付款延迟', unit: '天', source: '贸易记录', defaultThreshold: 15 },
  { id: 'a2', category: '信用风险', name: '供应商信用评级变动幅度', unit: '级', source: '标普/惠誉', defaultThreshold: 2 },
  { id: 'a3', category: '信用风险', name: '公开诉讼新增数量(60天)', unit: '起', source: '司法库', defaultThreshold: 3 },
  { id: 'a4', category: '信用风险', name: '应收账款余额', unit: 'USD', source: 'ERP', defaultThreshold: 500000 },
  { id: 'a5', category: '合规风险', name: '目标国临时反倾销税率', unit: '%', source: 'WTO TBT/SPS', defaultThreshold: 10 },
  { id: 'a6', category: '合规风险', name: '环保新规生效状态', unit: '-', source: '政策库', defaultThreshold: 1 },
  { id: 'a7', category: '运营风险', name: '港口拥堵指数', unit: '指数', source: '港口API', defaultThreshold: 0.85 },
  { id: 'a8', category: '运营风险', name: '航线运价单日涨跌幅', unit: '%', source: 'SCFI/BDI', defaultThreshold: 8 },
  { id: 'a9', category: '市场风险', name: '全球库存消费比', unit: '比值', source: '行业报告', defaultThreshold: 0.35 },
  { id: 'a10', category: '地缘政治', name: '贸易伙伴国政治稳定性', unit: '指数', source: '政治数据库', defaultThreshold: 50 },
  { id: 'a11', category: 'ESG', name: '供应商碳排放达标', unit: '-', source: 'ESG评级', defaultThreshold: 1 },
  { id: 'a12', category: 'AI预测', name: '采购商60天破产概率', unit: '%', source: 'ML模型', defaultThreshold: 80 },
  { id: 'a13', category: 'AI预测', name: '汇率30天贬值概率', unit: '%', source: 'ML模型', defaultThreshold: 70 },
  { id: 'a14', category: 'AI预测', name: '供应商60天停产风险', unit: '%', source: 'ML模型', defaultThreshold: 80 },
]

export const RULE_TEMPLATES = [
  {
    id: 'tpl-credit',
    name: '高信用风险警报',
    desc: 'IF 主体=海外采购商C AND (信用评级30天降2级 OR 诉讼60天>3) AND 应收>$50万 THEN 紧急',
    conditions: ['采购商C', '信用评级↓2级', '诉讼>3', '应收>$500K'],
    level: '紧急',
  },
  {
    id: 'tpl-policy',
    name: '农产品政策风险',
    desc: 'IF 进口关税单日>10% AND 在途货值>$100万 THEN 政策警报',
    conditions: ['关税↑>10%', '在途>$100万'],
    level: '高',
  },
  {
    id: 'tpl-supply',
    name: '供应链中断预警',
    desc: 'IF 供应商停产风险>80% AND 依赖占比>30% THEN 供应链预警',
    conditions: ['停产风险>80%', '依赖>30%'],
    level: '高',
  },
]

export const DEFAULT_RULES = [
  {
    id: 'rule-001',
    name: '海外采购商C信用恶化',
    version: 'v3.2',
    status: '启用',
    level: '紧急',
    sensitivity: '高',
    updatedAt: '2026-07-01',
    operator: '李明',
    triggers: 12,
    accuracy: 91,
  },
  {
    id: 'rule-002',
    name: '汇率波动风险',
    version: 'v2.1',
    status: '启用',
    level: '中',
    sensitivity: '中',
    updatedAt: '2026-06-28',
    operator: '张强',
    triggers: 8,
    accuracy: 86,
  },
  {
    id: 'rule-003',
    name: '苏伊士航线物流',
    version: 'v1.5',
    status: '停用',
    level: '高',
    sensitivity: '高',
    updatedAt: '2026-06-15',
    operator: '王芳',
    triggers: 5,
    accuracy: 78,
  },
]

export const RULE_VERSION_HISTORY = [
  { version: 'v3.2', date: '2026-07-01', operator: '李明', change: '阈值应收$40万→$50万' },
  { version: 'v3.1', date: '2026-06-20', operator: '李明', change: '新增诉讼条件' },
  { version: 'v3.0', date: '2026-06-01', operator: '李明', change: '初始创建' },
]

export const ML_MODELS = [
  { id: 'ml-bankrupt', name: '采购商60天破产概率', output: '破产概率', unit: '%' },
  { id: 'ml-fx', name: '汇率30天贬值概率', output: '贬值概率', unit: '%' },
  { id: 'ml-price', name: '大宗商品15天波动预测', output: '波动幅度', unit: '%' },
  { id: 'ml-shutdown', name: '供应商60天停产风险', output: '停产风险', unit: '%' },
]

export const INDUSTRY_PRESETS = [
  { id: 'machinery', label: '机械设备', sensitivity: { fx: '最高', policy: '高' } },
  { id: 'metal', label: '金属材料', sensitivity: { fx: '最高', market: '高' } },
  { id: 'agri', label: '农产品', sensitivity: { policy: '最高', logistics: '高' } },
  { id: 'electronics', label: '电子产品', sensitivity: { compliance: '最高', policy: '高' } },
]

export function runRuleBacktest(ruleName, period = '1y') {
  return {
    period,
    triggers: 24,
    falsePositive: 3,
    falseNegative: 2,
    accuracy: 88,
    missRate: 8,
    hitEvents: [
      { date: '2025-11', event: '巴西买家逾期', caught: true },
      { date: '2026-03', event: '欧元剧烈波动', caught: true },
      { date: '2026-05', event: '小额误报', caught: false },
    ],
  }
}

export function buildRulePreview(atoms, logic = 'AND', threshold = 70) {
  const names = atoms.map((a) => a.name).join(` ${logic} `)
  return `IF [${names}] 超阈值 ${threshold} THEN 触发预警`
}

export const ALERT_LEVEL_MAP = {
  红色: { label: '红色-紧急', color: '#cf1322', priority: 1, confirmMinutes: 15 },
  橙色: { label: '橙色-高', color: '#fa541c', priority: 2, confirmMinutes: 30 },
  黄色: { label: '黄色-中', color: '#faad14', priority: 3, confirmMinutes: 60 },
  蓝色: { label: '蓝色-低', color: '#1677ff', priority: 4, confirmMinutes: 240 },
}

export const PUSH_ROUTING = [
  { level: '红色-紧急', channels: ['平台弹窗', '短信', '电话语音', '邮件'], owner: '风控总监+业务负责人', escalate: '15分钟未确认→上级' },
  { level: '橙色-高', channels: ['平台消息', '短信', '邮件'], owner: '部门负责人', escalate: '30分钟未确认→上级' },
  { level: '黄色-中', channels: ['平台消息', '邮件'], owner: '业务专员', escalate: '1小时未确认→上级' },
  { level: '蓝色-低', channels: ['平台消息', '邮件'], owner: '业务专员', escalate: '4小时未确认→上级' },
]

export const RESPONSIBILITY_MATRIX = [
  { type: '信用风险', dept: '财务部', contacts: ['张强', '陈静'] },
  { type: '政策风险', dept: '法务部', contacts: ['王芳'] },
  { type: '物流风险', dept: '供应链部', contacts: ['赵磊', '李明'] },
  { type: '汇率风险', dept: '财务部', contacts: ['张强'] },
  { type: '合规风险', dept: '合规部', contacts: ['王芳', '陈静'] },
  { type: '地缘政治', dept: '风控中心', contacts: ['李明', '风控总监'] },
]

export const STREAM_ENGINE_STATUS = {
  engine: 'Flink + Spark Streaming',
  latency: '120ms',
  throughput: '18.6万条/秒',
  rulesMatched: 156,
  dataSources: ['多语言新闻', '实时汇率', 'AIS船舶', '海关更新', '企业信用', '政策法规', '制裁名单'],
  cepPatterns: 12,
}

export const MONITORING_ALERTS = [
  {
    id: 'MA-001', title: '巴西核心买家信用评分骤降', level: '红色', type: '信用风险', time: '2026-07-02 09:12:08',
    latency: '0.8s', rule: '海外采购商C信用恶化', channels: ['弹窗', '短信', '语音'],
    owner: '张强(财务)', confirmed: false, escalated: false,
    detail: '买家C信用评级30天内下降2级，应收账款$620,000。',
    rawCount: 3, aggregated: true,
  },
  {
    id: 'MA-002', title: '美国301清单HS8517关税上调', level: '橙色', type: '政策风险', time: '2026-07-02 08:45:22',
    latency: '1.2s', rule: '农产品政策风险', channels: ['消息', '短信', '邮件'],
    owner: '王芳(法务)', confirmed: false, escalated: false,
    detail: '新闻发布后1.2秒内完成抓取与规则匹配，关税15%→25%。',
  },
  {
    id: 'MA-003', title: '中东航线大面积延误', level: '橙色', type: '物流风险', time: '2026-07-02 08:30:15',
    latency: '0.5s', rule: '苏伊士航线物流', channels: ['消息', '短信', '邮件'],
    owner: '赵磊(供应链)', confirmed: true, escalated: false,
    detail: 'CEP聚合：船舶定位+港口排队+运价三源确认。',
  },
  {
    id: 'MA-004', title: '欧元汇率单日波动3.2%', level: '黄色', type: '汇率风险', time: '2026-07-02 07:55:00',
    latency: '0.3s', rule: '汇率波动风险', channels: ['消息', '邮件'],
    owner: '张强(财务)', confirmed: true, escalated: false,
    detail: '波动未达紧急阈值，建议关注锁汇窗口。',
  },
  {
    id: 'MA-005', title: '行业技术标准小幅更新', level: '蓝色', type: '合规风险', time: '2026-07-02 06:20:00',
    latency: '2.1s', rule: '-', channels: ['消息', '邮件'],
    owner: '王芳(合规)', confirmed: true, escalated: false,
    detail: '非核心品类，影响有限。',
  },
]

export const AGGREGATED_ALERTS = [
  {
    id: 'AGG-001',
    title: '台风导致上海港关闭 · 物流及成本连锁风险',
    level: '橙色',
    time: '2026-07-01 22:10',
    window: '30分钟',
    rawAlerts: 3,
    subItems: ['物流延误预警', '货物滞留预警', '集装箱运价上涨预警'],
    summary: '同一事件触发3条规则，已聚合为1条综合预警，降噪率67%。',
  },
]

export const COMPOSITE_EVENTS = [
  {
    id: 'CEP-001',
    title: 'XX国复合型地缘政治风险事件',
    driver: '贸易伙伴国突发政局动荡',
    level: '红色',
    time: '2026-06-28 14:00',
    subAlerts: [
      { type: '地缘政治', title: '政局动荡指数跌破阈值', order: 1 },
      { type: '汇率风险', title: '本国货币单日贬值8%', order: 2, cause: '政局→资本外流' },
      { type: '物流风险', title: '主要港口运营中断', order: 3, cause: '政局→罢工' },
      { type: '政策风险', title: '进口关税临时上调5%', order: 4, cause: '政局→贸易保护' },
    ],
    suggestion: '建议启动国别风险专项预案，暂停新增订单并评估在途货物。',
  },
  {
    id: 'CEP-002',
    title: '原材料+物流+需求组合风险',
    driver: 'CEP模式：成本上升+需求走弱',
    level: '黄色',
    time: '2026-06-25 10:30',
    subAlerts: [
      { type: '市场风险', title: '原材料价格上涨12%', order: 1 },
      { type: '物流风险', title: '海运成本激增18%', order: 2 },
      { type: '市场风险', title: '下游需求指数下降', order: 3 },
    ],
    suggestion: '评估毛利压缩，考虑调整报价与采购节奏。',
  },
]

export function getMonitoringData() {
  return {
    engine: STREAM_ENGINE_STATUS,
    alerts: MONITORING_ALERTS,
    aggregated: AGGREGATED_ALERTS,
    composite: COMPOSITE_EVENTS,
    routing: PUSH_ROUTING,
    matrix: RESPONSIBILITY_MATRIX,
  }
}

export function confirmMonitoringAlert(alertId) {
  return { success: true, alertId }
}

export const RISK_TRACKING_LIST = [
  { id: 'TR-001', subject: '巴西买家C', type: '信用风险', level: '红色', triggerTime: '2026-07-02 09:12', status: '新触发', dept: '财务部', progress: 10, owner: '张强' },
  { id: 'TR-002', subject: '美国301关税', type: '政策风险', level: '橙色', triggerTime: '2026-07-02 08:45', status: '已确认', dept: '法务部', progress: 35, owner: '王芳' },
  { id: 'TR-003', subject: '中东航线', type: '物流风险', level: '橙色', triggerTime: '2026-07-02 08:30', status: '处理中', dept: '供应链', progress: 60, owner: '赵磊' },
  { id: 'TR-004', subject: 'EUR/CNY波动', type: '汇率风险', level: '黄色', triggerTime: '2026-07-02 07:55', status: '处理中', dept: '财务部', progress: 45, owner: '张强' },
  { id: 'TR-005', subject: '技术标准更新', type: '合规风险', level: '蓝色', triggerTime: '2026-07-02 06:20', status: '已关闭', dept: '合规部', progress: 100, owner: '王芳' },
]

export const DASHBOARD_STATS = {
  enterprise: { open: 12, red: 1, orange: 3, yellow: 5, blue: 3, trend: '+2' },
  europe: { open: 5, red: 0, orange: 2, yellow: 2, blue: 1, trend: '+1' },
  america: { open: 4, red: 1, orange: 1, yellow: 1, blue: 1, trend: '0' },
  project: { open: 2, red: 0, orange: 1, yellow: 1, blue: 0, trend: '-1' },
}

export const RISK_PROPAGATION = {
  id: 'prop-chip',
  title: '芯片供应商火灾 → 出口订单交付延误',
  source: '芯片供应商因火灾停产',
  nodes: [
    { id: 'n1', label: '芯片供应商停产', impact: '高', delay: '即时', x: 50, y: 10 },
    { id: 'n2', label: '模块制造商产能↓30%', impact: '高', delay: '+2周', x: 50, y: 30 },
    { id: 'n3', label: '终端设备组装延迟', impact: '中', delay: '+4周', x: 50, y: 50 },
    { id: 'n4', label: '本企业出口订单延误', impact: '高', delay: '+6周', x: 30, y: 70 },
    { id: 'n5', label: '下游客户交付违约', impact: '中', delay: '+7周', x: 70, y: 70 },
  ],
  edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }, { from: 'n3', to: 'n5' }],
  suggestion: '寻找备用芯片供应商，调整订单交付时间，启动客户沟通预案。',
}

export const RISK_TRAJECTORIES = [
  {
    id: 'RH-001', title: '巴西买家信用风险', period: '2026-06-15 ~ 2026-07-02',
    events: [
      { date: '06-15', event: '付款延迟3天', level: '蓝色' },
      { date: '06-22', event: '信用评级下降1级', level: '黄色' },
      { date: '06-28', event: '诉讼新增2起', level: '橙色' },
      { date: '07-02', event: '触发红色预警', level: '红色' },
      { date: '07-02', event: '财务部确认处置', level: '处理中' },
    ],
  },
]

export const CASE_STRUCTURED_TEMPLATE = [
  '案例标题', '发生时间', '涉及国家/地区', '所属行业', '风险类型', '涉事企业类型',
  '风险源头', '事件发展时间线', '直接经济损失', '间接损失', '有效应对措施', '无效应对措施',
  '外部环境因素', '根本原因分析', '经验教训总结',
]

export const CASE_ANALYSIS_REPORT = {
  month: '2026年6月',
  patterns: [
    { pattern: '新兴市场买家订单突增后付款延迟', freq: '高频', loss: '中' },
    { pattern: '大宗商品进口未对冲汇率', freq: '中频', loss: '高' },
    { pattern: '大选周期汇率剧烈波动', freq: '季节性', loss: '高' },
  ],
  ruleSuggestions: [
    '核心贸易国进入大选周期 → 触发汇率强化监测',
    '非洲买家首次合作且订单>$50万 → 提高信用监测等级',
    '港口拥堵指数>0.85持续3天 → 自动聚合物流预警',
  ],
  training: ['合规新规72小时响应流程', '信用证诈骗识别要点'],
}

const CASE_STRUCTURED_DATA = {
  'RC-001': {
    enterpriseType: '出口商', riskSource: '单证核验流程缺失',
    timeline: '2025-10发现重复提单→11月冻结交易→上报监管',
    directLoss: '避免潜在损失约200万', indirectLoss: '业务暂停2周',
    effectiveMeasures: '接入船公司提单核验API', ineffectiveMeasures: '人工抽查效率低',
    externalFactors: '伪造手段升级', rootCause: '单证交叉比对机制不足',
    lessons: '关键单证必须系统级核验',
  },
  'RC-003': {
    enterpriseType: '出口商', riskSource: '买家所在国外汇管制',
    timeline: '2025-08货款到期→09月管制收紧→10月分批收汇',
    directLoss: '滞汇损失约30万美元', indirectLoss: '客户流失1家',
    effectiveMeasures: '第三方担保+分批收汇', ineffectiveMeasures: '单一电汇渠道',
    externalFactors: '地缘政治导致汇管', rootCause: '国别风险监测不足',
    lessons: '高风险国别需多元化收汇方案',
  },
  'RC-006': {
    enterpriseType: '出口商', riskSource: '关联企业循环交易',
    timeline: '2025-05图谱分析发现循环→06月纳入黑名单',
    directLoss: '虚增贸易额识别', indirectLoss: '授信额度调整',
    effectiveMeasures: '企业图谱关联分析', ineffectiveMeasures: '单一交易维度审核',
    externalFactors: '-', rootCause: '缺乏关联企业穿透识别',
    lessons: '大额贸易需穿透核查关联关系',
  },
  'RC-009': {
    enterpriseType: '出口商', riskSource: '非洲买家现金流断裂',
    timeline: '2025-04订单交付→05月拖欠→06月律师函→07月回收70%',
    directLoss: '拖欠货款80万美元', indirectLoss: '法律费用12万',
    effectiveMeasures: '信用保险+本地律师追讨', ineffectiveMeasures: '仅靠邮件催收',
    externalFactors: '买家所在国汇管收紧', rootCause: 'OA赊销额度管理失控',
    lessons: '非洲新买家首单建议信用证或预付款',
  },
}

export function getCaseStructured(caseItem) {
  const extra = CASE_STRUCTURED_DATA[caseItem.id] || {}
  return {
    title: caseItem.title,
    date: caseItem.date,
    region: caseItem.region,
    industry: caseItem.industry,
    type: caseItem.type,
    enterpriseType: extra.enterpriseType || '进出口企业',
    riskSource: extra.riskSource || caseItem.summary,
    timeline: extra.timeline || caseItem.detail?.slice(0, 80),
    directLoss: extra.directLoss || '待评估',
    indirectLoss: extra.indirectLoss || '待评估',
    effectiveMeasures: extra.effectiveMeasures || '见案例详情',
    ineffectiveMeasures: extra.ineffectiveMeasures || '-',
    externalFactors: extra.externalFactors || '-',
    rootCause: extra.rootCause || '-',
    lessons: extra.lessons || caseItem.summary,
  }
}

export function findSimilarCases({ type, region, keyword }) {
  let list = [...RISK_CASES]
  if (type && type !== '全部') list = list.filter((c) => c.type === type)
  if (region) list = list.filter((c) => c.region.includes(region) || region.includes(c.region))
  if (keyword) {
    const q = keyword.toLowerCase()
    list = list.filter((c) => c.title.includes(keyword) || c.tags.some((t) => t.includes(keyword)) || c.summary.includes(keyword))
  }
  return list.slice(0, 3)
}

export function getRiskDisplayData(filters = {}) {
  let regions = [...HEATMAP_REGIONS]
  if (filters.type && filters.type !== '全部') {
    regions = regions.map((r) => ({ ...r, score: Math.round(r.score * (filters.type === '信用风险' ? 1.1 : 0.9)) }))
  }
  if (filters.level === '紧急及高') {
    regions = regions.filter((r) => r.score >= 60)
  }
  let tracking = [...RISK_TRACKING_LIST]
  if (filters.type && filters.type !== '全部') {
    tracking = tracking.filter((t) => t.type === filters.type)
  }
  if (filters.status && filters.status !== '全部') tracking = tracking.filter((t) => t.status === filters.status)
  return {
    regions,
    tracking,
    stats: DASHBOARD_STATS,
    propagation: RISK_PROPAGATION,
    trajectories: RISK_TRAJECTORIES,
    typeStats: RISK_TYPE_STATS,
    trend: RISK_TREND_30D,
  }
}

export const ASSESSMENT_BUSINESS_PROFILES = [
  {
    id: 'b2b',
    name: '外贸B2B企业',
    desc: '重点评估买家信用与付款履约',
    focus: '买家信用',
    paramWeights: [
      { key: 'fulfillment', label: '历史交易履约率', weight: 30, defaultScore: 7 },
      { key: 'delay', label: '付款延迟天数', weight: 25, defaultScore: 6 },
      { key: 'rating', label: '信用评级变动', weight: 20, defaultScore: 7 },
      { key: 'exposure', label: '授信敞口规模', weight: 15, defaultScore: 5 },
      { key: 'industry', label: '行业景气度', weight: 10, defaultScore: 6 },
    ],
  },
  {
    id: 'manufacturing',
    name: '生产型企业',
    desc: '重点锚定政策变化与敏感清单',
    focus: '政策风险',
    paramWeights: [
      { key: 'policyFreq', label: '目标国政策变化频率', weight: 35, defaultScore: 6 },
      { key: 'sensitive', label: '行业敏感清单命中', weight: 30, defaultScore: 5 },
      { key: 'enforce', label: '政策执行力度', weight: 20, defaultScore: 7 },
      { key: 'supply', label: '供应链替代能力', weight: 15, defaultScore: 6 },
    ],
  },
  {
    id: 'trade',
    name: '进出口贸易企业',
    desc: '聚焦汇率波动与外汇敞口',
    focus: '汇率风险',
    paramWeights: [
      { key: 'volatility', label: '汇率波动幅度', weight: 35, defaultScore: 6 },
      { key: 'trend', label: '汇率指数趋势', weight: 30, defaultScore: 5 },
      { key: 'exposure', label: '外汇敞口规模', weight: 25, defaultScore: 7 },
      { key: 'hedge', label: '对冲覆盖率', weight: 10, defaultScore: 6 },
    ],
  },
  {
    id: 'crossborder',
    name: '跨境电商',
    desc: '更关注物流与合规风险',
    focus: '物流与合规',
    paramWeights: [
      { key: 'logistics', label: '物流通道稳定性', weight: 30, defaultScore: 6 },
      { key: 'compliance', label: '平台合规要求', weight: 30, defaultScore: 7 },
      { key: 'return', label: '退货/拒收率', weight: 20, defaultScore: 5 },
      { key: 'customs', label: '清关时效', weight: 20, defaultScore: 6 },
    ],
  },
]

export const ASSESSMENT_MODEL_CATALOG = [
  { id: 'matrix', name: '风险矩阵', category: 'qualitative', tag: '定性/半定量', desc: '概率-影响矩阵，5×5格快速评估', scenarios: ['新兴市场新合作方', '数据不足', '紧急筛查'] },
  { id: 'index', name: '风险指数法', category: 'qualitative', tag: '定性/半定量', desc: '多因素0-10分加权，综合指数0-100', scenarios: ['国别风险', '地缘政治', '快速量化'] },
  { id: 'el', name: '预期损失(EL)', category: 'quantitative', tag: '定量统计', desc: 'EL = PD × LGD × EAD', scenarios: ['买家信用', '供应商履约', '信贷决策'] },
  { id: 'var', name: '风险价值(VaR)', category: 'market', tag: '市场风险', desc: '置信水平下最大可能损失', scenarios: ['汇率敞口', '利率风险', '商品价格'] },
  { id: 'cvar', name: '条件风险价值(CVaR)', category: 'market', tag: '市场风险', desc: 'VaR阈值外平均损失，刻画极端事件', scenarios: ['汇率暴跌', '极端波动', '尾部风险'] },
  { id: 'fta', name: '故障树(FTA)', category: 'causal', tag: '因果推演', desc: '顶事件反向拆解，逻辑门连接', scenarios: ['订单交付延误', '供应链中断'] },
  { id: 'eta', name: '事件树(ETA)', category: 'causal', tag: '因果推演', desc: '初始事件正向推演连锁反应', scenarios: ['自然灾害', '政策突变', '连锁违约'] },
  { id: 'bayes', name: '贝叶斯网络', category: 'causal', tag: '因果推演', desc: '概率图模型，因素依赖实时更新', scenarios: ['组合风险', '多因素关联', '动态传导'] },
  { id: 'lstm', name: 'LSTM深度学习', category: 'ai', tag: '人工智能', desc: '时序预测破产/延迟概率', scenarios: ['供应商破产', '付款延迟预测'] },
  { id: 'nlp', name: 'NLP影响分类', category: 'ai', tag: '人工智能', desc: '新闻/政策情感分析与影响分级', scenarios: ['关税公告', '港口关闭', '舆情事件'] },
]

export const ASSESSMENT_PENDING_SIGNALS = [
  { id: 'AS-001', from: 'MA-003', title: '巴西买家信用异常', type: '信用风险', level: '高', source: '监测预警', time: '2026-07-02 08:15', suggestedModel: 'el', exposure: 500, status: '待评估', dept: '出口部', region: '南美' },
  { id: 'AS-002', from: 'MA-001', title: 'USD/CNY汇率波动加剧', type: '汇率风险', level: '中', source: '监测预警', time: '2026-07-02 07:40', suggestedModel: 'var', exposure: 1000, status: '待评估', dept: '财务部', region: '全球' },
  { id: 'AS-003', from: 'MA-005', title: '芯片供应商停产传导', type: '供应链风险', level: '高', source: '信息展示', time: '2026-07-01 18:20', suggestedModel: 'fta', exposure: 0, status: '评估中', dept: '出口部', region: '东亚' },
  { id: 'AS-004', from: 'MA-002', title: '欧盟新规合规缺口', type: '合规风险', level: '高', source: '案例库联动', time: '2026-07-01 14:00', suggestedModel: 'index', exposure: 0, status: '待评估', dept: '合规部', region: '欧洲' },
]

export const MATRIX_PROB_LEVELS = ['极低', '低', '中', '高', '极高']
export const MATRIX_IMPACT_LEVELS = ['轻微', '较小', '中等', '较大', '严重']

export const FTA_SAMPLE = {
  topEvent: '订单交付延误',
  probability: 0.42,
  nodes: [
    { id: 'n1', label: '物流延误', gate: 'OR', prob: 0.28, children: ['港口罢工', '航线改道'] },
    { id: 'n2', label: '生产延期', gate: 'OR', prob: 0.22, children: ['原材料短缺', '设备故障'] },
    { id: 'n3', label: '海关清关受阻', gate: 'AND', prob: 0.15, children: ['单证不符', '查验加严'] },
  ],
}

export const ETA_SAMPLE = {
  initEvent: '某国突发地震',
  branches: [
    { path: '工厂停产', prob: 0.35, loss: '高', next: '原材料供应中断 → 下游生产停滞 → 订单违约', totalProb: 0.18 },
    { path: '港口受损', prob: 0.25, loss: '中', next: '物流延误 → 交付延迟', totalProb: 0.12 },
    { path: '局部影响', prob: 0.40, loss: '低', next: '短暂停工 → 产能恢复', totalProb: 0.08 },
  ],
}

export const BAYES_SAMPLE = {
  nodes: [
    { id: 'oil', label: '油价上涨', prob: 0.65 },
    { id: 'shipping', label: '海运成本增加', prob: 0.78, parent: 'oil' },
    { id: 'price', label: '商品价格波动', prob: 0.55, parent: 'oil' },
    { id: 'margin', label: '出口利润压缩', prob: 0.48, parents: ['shipping', 'price'] },
  ],
}

export const NLP_SAMPLE_EVENTS = [
  { text: '某国宣布对钢铁产品加征20%关税', keywords: ['钢铁', '加征20%关税'], impact: '高', type: '政策风险', score: 82 },
  { text: '某港口因暴雨短暂关闭', keywords: ['港口', '暴雨', '关闭'], impact: '低', type: '物流风险', score: 28 },
  { text: '核心贸易国进入总统大选周期', keywords: ['大选', '汇率'], impact: '中', type: '汇率风险', score: 58 },
]

export function recommendAssessmentModel({ riskType, dataAvailability, precision, compute }) {
  const reasons = []
  let modelId = 'matrix'

  if (riskType === '信用风险' && dataAvailability === '高' && precision === '精准量化') {
    modelId = 'el'
    reasons.push('信用场景且交易数据完整，适合 EL 精确量化预期损失')
  } else if (['汇率风险', '市场风险'].includes(riskType) && precision === '精准量化') {
    modelId = compute === '服务器集群' ? 'cvar' : 'var'
    reasons.push(modelId === 'cvar' ? '市场极端尾部风险需 CVaR 刻画' : '外汇/商品敞口适用 VaR 模型')
  } else if (['供应链风险', '运营风险'].includes(riskType)) {
    modelId = precision === '精准量化' ? 'bayes' : 'fta'
    reasons.push('多环节传导风险，推荐因果推演模型')
  } else if (riskType === '合规风险' || riskType === '政策风险') {
    modelId = dataAvailability === '低' ? 'matrix' : 'index'
    reasons.push(dataAvailability === '低' ? '政策因素难量化，矩阵快速评估' : '国别/政策指数法更直观')
  } else if (dataAvailability === '低' || precision === '快速估算') {
    modelId = 'matrix'
    reasons.push('数据有限或需快速估算，风险矩阵效率最高')
  } else if (compute === '服务器集群' && dataAvailability === '高') {
    modelId = riskType === '信用风险' ? 'lstm' : 'nlp'
    reasons.push('算力充足且数据丰富，启用 AI 预测/分类模型')
  } else {
    modelId = 'index'
    reasons.push('综合条件适用风险指数法')
  }

  const model = ASSESSMENT_MODEL_CATALOG.find((m) => m.id === modelId)
  return { modelId, model, reasons }
}

export function calcRiskMatrix(probabilityIdx, impactIdx) {
  const score = (probabilityIdx + 1) * (impactIdx + 1)
  const level = score >= 20 ? '高风险' : score >= 12 ? '中风险' : '低风险'
  const color = score >= 20 ? 'error' : score >= 12 ? 'warning' : 'success'
  return {
    probability: MATRIX_PROB_LEVELS[probabilityIdx],
    impact: MATRIX_IMPACT_LEVELS[impactIdx],
    score,
    level,
    color,
    cell: `${MATRIX_PROB_LEVELS[probabilityIdx]} × ${MATRIX_IMPACT_LEVELS[impactIdx]}`,
  }
}

export function calcRiskIndex(factors) {
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0) || 1
  let weighted = 0
  const breakdown = factors.map((f) => {
    const contribution = (f.score * f.weight) / totalWeight
    weighted += contribution
    return { ...f, contribution: Math.round(contribution * 10) / 10, indexScore: Math.round(f.score * 10) }
  })
  const index = Math.round(weighted * 10)
  const level = index >= 70 ? '高风险' : index >= 45 ? '中风险' : '低风险'
  return { index, level, breakdown, color: index >= 70 ? 'error' : index >= 45 ? 'warning' : 'success' }
}

export function calcExpectedLoss(pd, lgd, ead) {
  const el = (pd / 100) * (lgd / 100) * ead
  const level = el >= ead * 0.05 ? '高风险' : el >= ead * 0.02 ? '中风险' : '低风险'
  return {
    pd, lgd, ead,
    el: Math.round(el * 100) / 100,
    elRatio: Math.round((el / ead) * 10000) / 100,
    level,
    color: level === '高风险' ? 'error' : level === '中风险' ? 'warning' : 'success',
    formula: `${ead} × ${pd}% × ${lgd}% = ${Math.round(el * 100) / 100} 万元`,
  }
}

export function calcVaR(exposure, volatility, confidence = 95, days = 10) {
  const z = confidence === 99 ? 2.33 : confidence === 95 ? 1.65 : 1.28
  const varValue = exposure * (volatility / 100) * z * Math.sqrt(days / 252)
  return {
    exposure,
    volatility,
    confidence,
    days,
    var: Math.round(varValue * 100) / 100,
    unit: '万美元',
    desc: `${confidence}%置信水平下${days}天VaR为 ${Math.round(varValue * 100) / 100} 万美元`,
    level: varValue >= exposure * 0.08 ? '高风险' : varValue >= exposure * 0.04 ? '中风险' : '低风险',
  }
}

export function calcCVaR(exposure, volatility, confidence = 95, days = 10) {
  const varResult = calcVaR(exposure, volatility, confidence, days)
  const cvar = varResult.var * 1.35
  return {
    ...varResult,
    cvar: Math.round(cvar * 100) / 100,
    desc: `VaR阈值外平均损失(CVaR)为 ${Math.round(cvar * 100) / 100} 万美元，更贴合极端市场事件`,
    level: cvar >= exposure * 0.1 ? '高风险' : cvar >= exposure * 0.05 ? '中风险' : '低风险',
  }
}

export function runLstmAssessment(params = {}) {
  const { historyQuarters = 3, delayTrend = '递增' } = params
  const baseProb = delayTrend === '递增' ? 0.28 : 0.15
  const trendBoost = historyQuarters >= 3 ? 0.12 : 0.05
  const prob60d = Math.min(0.85, baseProb + trendBoost)
  const prob90d = Math.min(0.92, prob60d + 0.08)
  return {
    model: 'LSTM',
    horizon: '60天',
    bankruptcyProb: Math.round(prob60d * 1000) / 10,
    delayProb90d: Math.round(prob90d * 1000) / 10,
    trend: delayTrend,
    features: ['近3年财务数据', '交易流水', '舆情情感'],
    level: prob60d >= 0.35 ? '高风险' : prob60d >= 0.2 ? '中风险' : '低风险',
    forward: `未来6个月违约概率预计${delayTrend === '递增' ? '上升' : '平稳'}，建议强化授信审查`,
  }
}

export function runNlpAssessment(text) {
  const hit = NLP_SAMPLE_EVENTS.find((e) => text.includes(e.keywords[0])) || NLP_SAMPLE_EVENTS[0]
  return { ...hit, model: 'NLP', confidence: 0.91 }
}

export function buildAssessmentReport({ modelId, modelName, profile, result, wizard, signal }) {
  return {
    id: `AR-${Date.now()}`,
    modelId,
    modelName,
    profile: profile?.name,
    wizard,
    signal: signal?.title,
    result,
    traceability: `模型=${modelName} · 业务画像=${profile?.name || '默认'} · 向导=${wizard ? '已启用' : '手动'}`,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  }
}

export function getAssessmentOverview() {
  return {
    pending: ASSESSMENT_PENDING_SIGNALS.filter((s) => s.status === '待评估').length,
    processing: ASSESSMENT_PENDING_SIGNALS.filter((s) => s.status === '评估中').length,
    models: ASSESSMENT_MODEL_CATALOG.length,
    profiles: ASSESSMENT_BUSINESS_PROFILES.length,
    signals: ASSESSMENT_PENDING_SIGNALS,
    recentReports: [
      { id: 'AR-20260701-01', title: '巴西买家 EL 评估', model: '预期损失(EL)', level: '中风险', score: 'EL 9万', time: '2026-07-01 16:30' },
      { id: 'AR-20260630-02', title: '美元敞口 VaR 评估', model: 'VaR', level: '中风险', score: 'VaR 50万', time: '2026-06-30 11:20' },
    ],
  }
}

export const PARAM_DATA_SOURCES = {
  internal: [
    { id: 'erp', name: 'ERP系统', fields: ['交易记录', '应收账款', '未结清订单'], freq: '实时' },
    { id: 'crm', name: 'CRM系统', fields: ['客户互动', '投诉记录', '订单履约'], freq: '日度' },
    { id: 'finance', name: '财务系统', fields: ['资产负债率', '流动比率', '成本营收'], freq: '日度' },
  ],
  external: [
    { id: 'dnb', name: '邓白氏', fields: ['信用评级', 'PD基础值'], freq: '周度' },
    { id: 'sp', name: '标普', fields: ['主体评级', '行业违约率'], freq: '周度' },
    { id: 'customs', name: '海关数据库', fields: ['进出口记录', '查验率'], freq: '日度' },
    { id: 'forex', name: '汇率交易中心', fields: ['即期汇率', '波动率'], freq: '实时' },
    { id: 'industry', name: '行业协会', fields: ['景气指数', '价格指数'], freq: '周度' },
    { id: 'policy', name: '全球政策库', fields: ['关税变动', '禁运清单'], freq: '日度' },
  ],
}

export const EXPERT_ADJUSTMENT_HISTORY = [
  {
    id: 'EA-001', field: 'PD', before: 3.0, after: 3.6, user: '风控专家-王芳',
    time: '2026-06-28 14:20', reason: '已知买家CEO近期离职，上调违约概率',
  },
  {
    id: 'EA-002', field: '合规影响分', before: 8, after: 6, user: '合规经理-张强',
    time: '2026-06-25 10:05', reason: '了解到目标国政策执行宽松，下调合规风险影响',
  },
]

export const STRESS_SCENARIO_TEMPLATES = [
  {
    id: 'fx-30',
    name: '主要货币对美元单日贬值30%',
    category: '汇率风险',
    desc: '模拟极端汇率冲击',
    overrides: { volatilityMult: 3.5, fxShock: -30 },
    defaultImpact: { baseline: '中风险', stressed: '高风险', lossFrom: 5, lossTo: 80, unit: '万元' },
  },
  {
    id: 'shipping-2x',
    name: '全球海运运费翻倍',
    category: '物流风险',
    desc: '运费骤升冲击交付成本',
    overrides: { logisticsScore: +3, costMult: 2 },
    defaultImpact: { baseline: '低风险', stressed: '中风险', lossFrom: 12, lossTo: 45, unit: '万元' },
  },
  {
    id: 'export-ban',
    name: '关键原材料产地突发出口禁令',
    category: '供应链风险',
    desc: '供货中断概率100%',
    overrides: { supplyProb: 100, months: 6 },
    defaultImpact: { baseline: '低风险', stressed: '高风险', lossFrom: 5, lossTo: 80, unit: '万元' },
  },
  {
    id: 'fed-50bp',
    name: '美联储加息50个基点',
    category: '利率风险',
    desc: '融资成本与汇率联动上升',
    overrides: { rateShock: 50, volatilityMult: 1.8 },
    defaultImpact: { baseline: '中风险', stressed: '高风险', lossFrom: 20, lossTo: 65, unit: '万元' },
  },
  {
    id: 'trade-barrier',
    name: '核心市场突发贸易壁垒',
    category: '政策风险',
    desc: '关税/配额骤升',
    overrides: { policyScore: +4, tariffShock: 25 },
    defaultImpact: { baseline: '中风险', stressed: '高风险', lossFrom: 30, lossTo: 120, unit: '万元' },
  },
]

export function fetchAutoAssessmentParams(modelId = 'el', signal) {
  const buyer = signal?.title?.includes('巴西') ? '巴西买家 ABC Trading' : '海外买家 Global Import Co.'
  const base = {
    coverage: 86,
    syncedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    subject: buyer,
  }

  if (modelId === 'el' || modelId === 'lstm') {
    return {
      ...base,
      params: [
        { key: 'pdBase', label: 'PD基础值', value: 2.5, unit: '%', source: '邓白氏 · BB级参考', auto: true, freq: '周度' },
        { key: 'pdDelay', label: '付款延迟修正', value: 0.5, unit: '%', source: 'ERP · 近90天延迟15天', auto: true, freq: '实时' },
        { key: 'pdFulfill', label: '履约率修正', value: 0, unit: '%', source: 'CRM · 履约率92%', auto: true, freq: '日度' },
        { key: 'pd', label: '违约概率 PD', value: 3.0, unit: '%', source: '系统合成', auto: true, freq: '实时', formula: '2.5% + 0.5% + 0%' },
        { key: 'lgd', label: '违约损失率 LGD', value: 60, unit: '%', source: '财务 · 无担保+流动比率1.2', auto: true, freq: '日度' },
        { key: 'ead', label: '风险敞口 EAD', value: signal?.exposure || 500, unit: '万元', source: 'ERP · 未结清应收账款', auto: true, freq: '实时' },
        { key: 'mgmtStability', label: '管理层稳定性', value: 7, unit: '分', source: '待专家判断', auto: false, freq: '-' },
        { key: 'policyEnforce', label: '政策执行力度', value: 6, unit: '分', source: '待专家判断', auto: false, freq: '-' },
      ],
      computed: { pd: 3.0, lgd: 60, ead: signal?.exposure || 500 },
    }
  }

  if (modelId === 'var' || modelId === 'cvar') {
    return {
      ...base,
      params: [
        { key: 'exposure', label: '外汇敞口', value: signal?.exposure || 1000, unit: '万美元', source: '财务 · 未对冲敞口', auto: true, freq: '实时' },
        { key: 'volatility', label: '波动率', value: 2.5, unit: '%', source: '汇率交易中心 · 30日历史', auto: true, freq: '实时' },
        { key: 'confidence', label: '置信水平', value: 95, unit: '%', source: '企业风险偏好配置', auto: true, freq: '-' },
        { key: 'days', label: '持有期', value: 10, unit: '天', source: 'Treasury政策', auto: true, freq: '-' },
      ],
      computed: { exposure: signal?.exposure || 1000, volatility: 2.5, confidence: 95, days: 10 },
    }
  }

  return {
    ...base,
    params: [
      { key: 'political', label: '政治风险', value: 6, unit: '分', source: '全球政策库', auto: true, freq: '日度' },
      { key: 'economic', label: '经济风险', value: 5, unit: '分', source: '行业协会', auto: true, freq: '周度' },
      { key: 'compliance', label: '合规风险', value: 7, unit: '分', source: '海关+政策库', auto: true, freq: '日度' },
      { key: 'policyEnforce', label: '政策执行力度', value: 8, unit: '分', source: '待专家判断', auto: false, freq: '-' },
    ],
    computed: { political: 6, economic: 5, compliance: 7 },
  }
}

export function applyExpertAdjustment(value, adjustPct) {
  const min = value * 0.8
  const max = value * 1.2
  const next = value * (1 + adjustPct / 100)
  return Math.round(Math.min(max, Math.max(min, next)) * 100) / 100
}

export function runStressTest(scenario, baseParams) {
  const tpl = STRESS_SCENARIO_TEMPLATES.find((s) => s.id === scenario.id) || scenario
  const overrides = tpl.overrides || {}
  let stressedParams = { ...baseParams }
  let baselineResult
  let stressedResult

  if (baseParams.pd !== undefined) {
    baselineResult = calcExpectedLoss(baseParams.pd, baseParams.lgd, baseParams.ead)
    const pdMult = overrides.supplyProb ? 1.5 : overrides.fxShock ? 1.25 : 1.15
    stressedParams = {
      pd: Math.min(20, baseParams.pd * pdMult),
      lgd: Math.min(100, baseParams.lgd * (overrides.costMult ? 1.1 : 1.05)),
      ead: baseParams.ead * (overrides.fxShock ? 1.2 : 1.15),
    }
    stressedResult = calcExpectedLoss(stressedParams.pd, stressedParams.lgd, stressedParams.ead)
  } else if (baseParams.exposure !== undefined) {
    baselineResult = calcVaR(baseParams.exposure, baseParams.volatility, baseParams.confidence, baseParams.days)
    stressedParams = {
      ...baseParams,
      volatility: baseParams.volatility * (overrides.volatilityMult || 2),
      exposure: baseParams.exposure * (overrides.fxShock ? 1.3 : 1.1),
    }
    stressedResult = calcVaR(stressedParams.exposure, stressedParams.volatility, stressedParams.confidence, stressedParams.days)
  } else {
    baselineResult = calcRiskIndex([
      { label: '综合', weight: 100, score: 45 },
    ])
    stressedResult = calcRiskIndex([
      { label: '综合', weight: 100, score: 72 },
    ])
  }

  const impact = tpl.defaultImpact || {}
  return {
    scenario: tpl.name,
    description: tpl.desc,
    baseline: {
      level: baselineResult.level,
      value: baselineResult.el ?? baselineResult.var ?? baselineResult.index,
    },
    stressed: {
      level: stressedResult.level,
      value: stressedResult.el ?? stressedResult.var ?? stressedResult.index,
      params: stressedParams,
    },
    impact: {
      from: impact.lossFrom ?? baselineResult.el ?? 5,
      to: impact.lossTo ?? stressedResult.el ?? 80,
      unit: impact.unit ?? '万元',
      levelFrom: impact.baseline ?? baselineResult.level,
      levelTo: impact.stressed ?? stressedResult.level,
    },
    suggestion: `在「${tpl.name}」情景下，风险等级由 ${impact.baseline || baselineResult.level} 升至 ${impact.stressed || stressedResult.level}，建议启动应急预案并复核对冲/备选方案。`,
  }
}

export function buildFullAssessmentReport({
  modelId,
  modelName,
  profile,
  signal,
  autoParams,
  expertAdjustments = [],
  stressResult,
  result,
}) {
  const paramSteps = (autoParams?.params || []).map((p) => ({
    name: p.label,
    value: `${p.value}${p.unit || ''}`,
    source: p.source,
    auto: p.auto ? '自动获取' : '专家待填',
  }))

  expertAdjustments.forEach((a) => {
    paramSteps.push({
      name: `${a.field}（专家调整）`,
      value: `${a.before} → ${a.after}`,
      source: a.reason,
      auto: `专家 · ${a.user}`,
    })
  })

  const calcSteps = []
  if (result.formula) calcSteps.push({ step: '1', desc: '代入 EL 公式', detail: result.formula })
  if (result.desc) calcSteps.push({ step: '2', desc: '市场风险测算', detail: result.desc })
  if (stressResult) {
    calcSteps.push({
      step: String(calcSteps.length + 1),
      desc: '压力测试',
      detail: `${stressResult.scenario}：${stressResult.baseline.level} → ${stressResult.stressed.level}，损失 ${stressResult.impact.from}→${stressResult.impact.to}${stressResult.impact.unit}`,
    })
  }

  const interpretation = []
  if (result.level) interpretation.push(`综合判定为${result.level}，建议按等级匹配处置资源。`)
  if (result.forward) interpretation.push(result.forward)
  if (stressResult) interpretation.push(stressResult.suggestion)
  interpretation.push('参数来源可追溯，专家调整已留痕，可用于后续模型优化。')

  return {
    id: `AR-${Date.now()}`,
    modelId,
    modelName,
    profile: profile?.name,
    signal: signal?.title,
    coverage: autoParams?.coverage,
    syncedAt: autoParams?.syncedAt,
    sections: {
      paramDescription: paramSteps,
      calculationProcess: calcSteps.length ? calcSteps : [{ step: '1', desc: '模型运算', detail: JSON.stringify(result) }],
      resultInterpretation: interpretation,
    },
    result,
    stressResult,
    expertAdjustments,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  }
}

export function analyzeExpertAdjustmentPatterns(history = EXPERT_ADJUSTMENT_HISTORY) {
  return {
    summary: '新兴市场买家 PD 自动值平均被专家上调 15%，建议优化 PD 修正算法',
    patterns: [
      { pattern: '新兴市场 PD 偏低', avgAdjust: '+15%', count: 8, action: '建议上调 PD 基础修正系数' },
      { pattern: '合规影响分偏高', avgAdjust: '-12%', count: 5, action: '建议引入政策执行力度因子' },
    ],
    sampleSize: history.length,
  }
}

export const RATING_GRADES = [
  { grade: 'AAA', min: 900, max: 1000, label: '低风险', color: '#52c41a' },
  { grade: 'AA', min: 800, max: 899, label: '较低风险', color: '#73d13d' },
  { grade: 'A', min: 700, max: 799, label: '中等偏低', color: '#95de64' },
  { grade: 'BBB', min: 600, max: 699, label: '中等风险', color: '#faad14' },
  { grade: 'BB', min: 500, max: 599, label: '中等偏高', color: '#ffa940' },
  { grade: 'B', min: 400, max: 499, label: '较高风险', color: '#ff7a45' },
  { grade: 'CCC', min: 300, max: 399, label: '高风险', color: '#ff4d4f' },
  { grade: 'CC', min: 200, max: 299, label: '极高风险', color: '#cf1322' },
  { grade: 'D', min: 0, max: 199, label: '已发生风险', color: '#820014' },
]

export const ASSESSMENT_RESULT_SUBJECTS = [
  {
    id: 'SUB-001', name: '巴西买家 ABC Trading', type: '买家', score: 650, prevScore: 720,
    gradeChange: 'A→BBB', updatedAt: '2026-07-02 09:00', reason: '信用评级下调',
    exposure: 500, region: '南美',
  },
  {
    id: 'SUB-002', name: '欧洲业务部-出口航线', type: '物流路线', score: 780, prevScore: 790,
    gradeChange: '稳定', updatedAt: '2026-07-02 08:30', reason: '-', exposure: 100, region: '欧洲',
  },
  {
    id: 'SUB-003', name: '德国市场国别', type: '国家', score: 820, prevScore: 815,
    gradeChange: '稳定', updatedAt: '2026-07-01 18:00', reason: '-', exposure: 400, region: '欧洲',
  },
  {
    id: 'SUB-004', name: '芯片供应商 XTech', type: '供应商', score: 420, prevScore: 580,
    gradeChange: 'BB→B', updatedAt: '2026-07-01 16:20', reason: '停产事件', exposure: 320, region: '东亚',
  },
  {
    id: 'SUB-005', name: 'USD/CNY 汇率敞口', type: '风险事件', score: 610, prevScore: 650,
    gradeChange: 'BBB→BB', updatedAt: '2026-07-02 07:45', reason: '波动率上升', exposure: 1000, region: '全球',
  },
]

export const CONTRIBUTION_BY_SUBJECT = {
  'SUB-001': {
    total: 650,
    dimensions: [
      {
        key: 'credit', label: '信用风险', contribution: 350,
        indicators: [
          { name: '付款延迟天数', score: 80, calc: '近90天平均延迟15天 → 80分' },
          { name: '信用评级', score: 60, calc: '邓白氏 BB → 映射60分' },
          { name: '履约率', score: 45, calc: '履约率88% → 45分' },
        ],
      },
      { key: 'country', label: '国别风险', contribution: 120, indicators: [{ name: '汇管制', score: 70, calc: '巴西汇管趋严' }] },
      { key: 'operational', label: '操作风险', contribution: 90, indicators: [{ name: '单证差错率', score: 55, calc: '差错率2.1%' }] },
      { key: 'market', label: '市场风险', contribution: 90, indicators: [{ name: '汇率波动', score: 50, calc: 'BRL波动+3.2%' }] },
    ],
  },
  'SUB-004': {
    total: 420,
    dimensions: [
      { key: 'supply', label: '供应链风险', contribution: 280, indicators: [{ name: '供货中断概率', score: 95, calc: '火灾停产 → 95分' }] },
      { key: 'credit', label: '信用风险', contribution: 80, indicators: [{ name: '供应商评级', score: 65, calc: '评级下调' }] },
      { key: 'operational', label: '操作风险', contribution: 60, indicators: [] },
    ],
  },
}

export const EXPOSURE_REPORT = {
  byType: [
    { type: '信用风险', exposure: 500, limit: 550, unit: '万元' },
    { type: '市场风险', exposure: 300, limit: 350, unit: '万元' },
    { type: '物流风险', exposure: 100, limit: 150, unit: '万元' },
    { type: '合规风险', exposure: 80, limit: 120, unit: '万元' },
  ],
  byRegion: [
    { region: '欧洲', exposure: 400, limit: 450, unit: '万元' },
    { region: '东南亚', exposure: 300, limit: 320, unit: '万元' },
    { region: '南美', exposure: 280, limit: 250, unit: '万元' },
    { region: '北美', exposure: 200, limit: 300, unit: '万元' },
  ],
  byDepartment: [
    { dept: '出口部', exposure: 600, limit: 550, unit: '万元', note: '信用风险敞口已超限10%' },
    { dept: '进口部', exposure: 300, limit: 400, unit: '万元' },
    { dept: '跨境电商部', exposure: 180, limit: 250, unit: '万元' },
  ],
  total: { exposure: 1080, limit: 1000, unit: '万元' },
}

export const PRIORITY_CRITERIA = [
  { key: 'score', label: '风险评分', weight: 25, desc: '综合分数越低优先级越高' },
  { key: 'exposure', label: '风险敞口大小', weight: 20, desc: '敞口金额越大优先级越高' },
  { key: 'trend', label: '风险变化趋势', weight: 15, desc: '恶化趋势加分' },
  { key: 'urgency', label: '应对紧迫性', weight: 15, desc: '交付/收汇deadline' },
  { key: 'costBenefit', label: '应对成本效益比', weight: 15, desc: '投入产出比' },
  { key: 'strategic', label: '战略影响', weight: 10, desc: '核心客户/品类' },
]

export const INDUSTRY_PRIORITY_PRESETS = [
  { id: 'b2b', name: '外贸B2B', weights: { score: 20, exposure: 25, trend: 15, urgency: 15, costBenefit: 15, strategic: 10 } },
  { id: 'manufacturing', name: '生产型', weights: { score: 25, exposure: 20, trend: 20, urgency: 10, costBenefit: 15, strategic: 10 } },
  { id: 'crossborder', name: '跨境电商', weights: { score: 20, exposure: 15, trend: 15, urgency: 20, costBenefit: 15, strategic: 15 } },
]

export const PRIORITY_RISK_ITEMS = [
  {
    id: 'PR-001', title: '巴西买家信用异常', type: '信用风险', score: 650, exposure: 500,
    trend: '恶化', urgency: 92, costBenefit: 78, strategic: 85, dept: '出口部',
    suggestion: '优先启动信用保险与分批收汇',
  },
  {
    id: 'PR-002', title: '芯片供应商停产传导', type: '供应链风险', score: 420, exposure: 320,
    trend: '急剧恶化', urgency: 95, costBenefit: 65, strategic: 90, dept: '出口部',
    suggestion: '寻找备用供应商并调整交付计划',
  },
  {
    id: 'PR-003', title: 'USD/CNY汇率波动', type: '汇率风险', score: 610, exposure: 1000,
    trend: '上升', urgency: 70, costBenefit: 88, strategic: 60, dept: '财务部',
    suggestion: '远期锁汇覆盖70%敞口',
  },
  {
    id: 'PR-004', title: '欧盟新规合规缺口', type: '合规风险', score: 580, exposure: 80,
    trend: '稳定', urgency: 75, costBenefit: 72, strategic: 70, dept: '合规部',
    suggestion: '委托第三方合规整改',
  },
  {
    id: 'PR-005', title: '中东航线延误', type: '物流风险', score: 700, exposure: 100,
    trend: '缓和', urgency: 60, costBenefit: 80, strategic: 55, dept: '物流部',
    suggestion: '切换备用港口方案',
  },
]

export function scoreToGrade(score) {
  const hit = RATING_GRADES.find((g) => score >= g.min && score <= g.max) || RATING_GRADES[RATING_GRADES.length - 1]
  return hit
}

export function buildWaterfallData(subjectId = 'SUB-001') {
  const data = CONTRIBUTION_BY_SUBJECT[subjectId] || CONTRIBUTION_BY_SUBJECT['SUB-001']
  const items = [{ type: '起始', value: 0, isTotal: true }]
  data.dimensions.forEach((d) => {
    items.push({ type: d.label, value: d.contribution, isTotal: false })
  })
  items.push({ type: '综合分数', value: data.total, isTotal: true })
  return items
}

export function buildSankeyData(subjectId = 'SUB-001') {
  const data = CONTRIBUTION_BY_SUBJECT[subjectId] || CONTRIBUTION_BY_SUBJECT['SUB-001']
  const nodes = [{ name: '综合分数' }]
  const links = []
  data.dimensions.forEach((d) => {
    nodes.unshift({ name: d.label })
    links.push({ source: d.label, target: '综合分数', value: d.contribution })
  })
  return { nodes, links }
}

export function getExposureStatus(exposure, limit) {
  const ratio = exposure / limit
  if (ratio > 1) return { status: '超限', color: 'error', pct: Math.round((ratio - 1) * 100) }
  if (ratio >= 0.85) return { status: '接近超限', color: 'warning', pct: Math.round(ratio * 100) }
  return { status: '未超限', color: 'success', pct: Math.round(ratio * 100) }
}

export function calcPriorityQueue(weights = PRIORITY_CRITERIA.reduce((o, c) => ({ ...o, [c.key]: c.weight }), {})) {
  const totalW = Object.values(weights).reduce((s, v) => s + v, 0) || 1
  return PRIORITY_RISK_ITEMS.map((item) => {
    const norm = (v) => v
    const scorePart = (1000 - item.score) / 10 * (weights.score / totalW)
    const exposurePart = (item.exposure / 10) * (weights.exposure / totalW)
    const trendMap = { 急剧恶化: 100, 恶化: 85, 上升: 70, 稳定: 50, 缓和: 30 }
    const trendPart = (trendMap[item.trend] || 50) * (weights.trend / totalW)
    const urgencyPart = item.urgency * (weights.urgency / totalW)
    const cbPart = item.costBenefit * (weights.costBenefit / totalW)
    const stratPart = item.strategic * (weights.strategic / totalW)
    const priorityScore = Math.round((scorePart + exposurePart + trendPart + urgencyPart + cbPart + stratPart) * 10) / 10
    return { ...item, priorityScore, grade: scoreToGrade(item.score).grade }
  }).sort((a, b) => b.priorityScore - a.priorityScore)
}

export function simulateResourceOptimization(budget = 100) {
  const queue = calcPriorityQueue()
  const points = []
  let cumulativeBudget = 0
  let cumulativeLossReduction = 0
  const costs = [35, 28, 22, 18, 12]
  const reductions = [120, 95, 80, 45, 30]

  for (let idx = 0; idx < queue.length; idx += 1) {
    const cost = costs[idx] || 10
    const reduction = reductions[idx] || 20
    cumulativeBudget += cost
    cumulativeLossReduction += reduction
    points.push({
      budget: cumulativeBudget,
      lossReduction: cumulativeLossReduction,
      label: `投入${cumulativeBudget}万`,
      items: queue.slice(0, idx + 1).map((q) => q.title),
    })
  }

  const affordable = points.filter((p) => p.budget <= budget)
  const optimal = affordable.length
    ? affordable.reduce((best, p) => ((p.lossReduction / p.budget) > (best.lossReduction / best.budget) ? p : best))
    : points[0]

  return {
    curve: points,
    optimal,
    suggestion: `建议投入 ${optimal.budget} 万元风控资源，预计降低预期损失 ${optimal.lossReduction} 万元，覆盖：${optimal.items.slice(0, 2).join('、')}等`,
    allocation: queue.slice(0, 3).map((q, i) => ({
      rank: i + 1,
      title: q.title,
      budget: costs[i],
      expectedReduction: reductions[i],
    })),
  }
}

export function getAssessmentResultsData(subjectId) {
  const subject = ASSESSMENT_RESULT_SUBJECTS.find((s) => s.id === subjectId) || ASSESSMENT_RESULT_SUBJECTS[0]
  const grade = scoreToGrade(subject.score)
  const contribution = CONTRIBUTION_BY_SUBJECT[subject.id] || CONTRIBUTION_BY_SUBJECT['SUB-001']
  return {
    subject,
    grade,
    waterfall: buildWaterfallData(subject.id),
    sankey: buildSankeyData(subject.id),
    contribution,
    exposure: EXPOSURE_REPORT,
  }
}

export function getDrilldownDetail(subjectId, dimensionKey) {
  const data = CONTRIBUTION_BY_SUBJECT[subjectId] || CONTRIBUTION_BY_SUBJECT['SUB-001']
  const dim = data.dimensions.find((d) => d.key === dimensionKey)
  if (!dim) return null
  return {
    dimension: dim.label,
    contribution: dim.contribution,
    indicators: dim.indicators,
    calcLogic: dim.indicators.map((i) => `${i.name}：${i.calc} → ${i.score}分`).join('；'),
    dataSources: ['ERP交易记录', '邓白氏评级', 'CRM履约数据'],
  }
}

export const RESPONSE_STRATEGY_TYPES = [
  { key: 'avoid', label: '规避', color: '#1677ff', desc: '从源头消除风险暴露，调整业务避免接触高风险要素' },
  { key: 'reduce', label: '降低', color: '#52c41a', desc: '通过技术或流程优化，削减概率或减轻影响' },
  { key: 'transfer', label: '转移', color: '#fa8c16', desc: '将风险责任或损失分担至第三方' },
  { key: 'accept', label: '接受', color: '#8c8c8c', desc: '风险低于容忍度或应对成本高于潜在损失' },
]

export const STRATEGY_KNOWLEDGE_GRAPH = [
  {
    id: 'ST-001', type: 'transfer', riskType: '信用风险', level: ['B', 'BB', 'BBB', 'CCC'],
    title: '购买出口信用保险', trigger: '买家信用等级下调且敞口>300万',
    scene: '外贸B2B · 非洲/南美新兴市场 · OA或赊销',
    steps: ['评估投保金额与费率', '选择中信保或商业险产品', '提交投保申请并跟踪批复', '将保单号关联订单系统'],
    resources: ['风控专员1人', '保费预算约敞口0.8%', '信用保险系统账号'],
    kpi: '回收率≥70%', sideEffect: '保费增加出口成本', sideEffectMitigation: '计入报价或与客户分摊',
    caseRef: 'RC-009',
    successRate: 82, matchScore: 91, costBenefit: 85, complexity: 45,
  },
  {
    id: 'ST-002', type: 'reduce', riskType: '信用风险', level: ['BB', 'B', 'CCC'],
    title: '提高预付款比例+缩短账期', trigger: '付款延迟递增或PD>2.5%',
    scene: '订单金额较大 · 新客户或评级下调',
    steps: ['与客户协商30-50%预付款', '将账期从90天缩短至60天', '更新合同条款并法务审核', 'ERP设置账期预警'],
    resources: ['销售经理', '法务审核', '合同模板'],
    kpi: '预付款到账率100%', sideEffect: '可能影响接单', sideEffectMitigation: '提供价格/交期优惠换取',
    caseRef: 'RC-003', successRate: 75, matchScore: 88, costBenefit: 90, complexity: 35,
  },
  {
    id: 'ST-003', type: 'avoid', riskType: '信用风险', level: ['CC', 'D'],
    title: '暂停新订单并收紧授信', trigger: '综合评分<400或已发生拖欠',
    scene: '买家信用急剧恶化 · 敞口接近限额',
    steps: ['冻结新订单审批', '现有订单改为100%预付', '启动债务追讨程序', '评估是否退出该市场'],
    resources: ['风控委员会审批', '法务/外部律师', 'CRM黑名单标记'],
    kpi: '新增敞口=0', sideEffect: '业务短期下滑', sideEffectMitigation: '开发替代客户',
    caseRef: 'RC-006', successRate: 88, matchScore: 86, costBenefit: 78, complexity: 55,
  },
  {
    id: 'ST-004', type: 'transfer', riskType: '汇率风险', level: ['BBB', 'BB'],
    title: '远期锁汇覆盖敞口', trigger: '外汇敞口>500万美元且波动率上升',
    scene: '进出口贸易 · 美元/欧元敞口',
    steps: ['确定锁汇比例(建议70%)', '与银行签订远期合约', '建立敞口-锁汇台账', '到期前滚动续作'],
    resources: ['财务资金岗', '银行授信额度', 'Treasury系统'],
    kpi: '锁汇覆盖率≥70%', sideEffect: '丧失汇率有利变动收益', sideEffectMitigation: '保留部分敞口灵活操作',
    caseRef: 'RC-008', successRate: 90, matchScore: 92, costBenefit: 88, complexity: 40,
  },
  {
    id: 'ST-005', type: 'reduce', riskType: '供应链风险', level: ['B', 'BB', 'CCC'],
    title: '启用备用供应商并调整交付计划', trigger: '核心供应商停产或供货中断',
    scene: '芯片/原材料单一来源 · 交期敏感订单',
    steps: ['激活备用供应商清单', '评估认证周期与产能', '与客户协商交期调整', '更新BOM与采购计划'],
    resources: ['采购部2人', '质量工程师', '加急物流预算'],
    kpi: '交期延误≤7天', sideEffect: '成本上升5-15%', sideEffectMitigation: '与客户共担或计入索赔',
    caseRef: 'RC-004', successRate: 78, matchScore: 89, costBenefit: 72, complexity: 65,
  },
  {
    id: 'ST-006', type: 'accept', riskType: '物流风险', level: ['A', 'BBB'],
    title: '接受低等级物流延误并监控', trigger: '延误概率低且损失<容忍限额',
    scene: '航线轻微延误 · 有缓冲库存',
    steps: ['确认损失在容忍范围内', '加强在途跟踪', '预备备用港口方案但不提前启动', '复盘纳入季度评估'],
    resources: ['物流专员监控', '容忍限额内预备金'],
    kpi: '损失≤10万', sideEffect: '偶发延误影响客户体验', sideEffectMitigation: '主动沟通交期预期',
    caseRef: 'RC-007', successRate: 95, matchScore: 70, costBenefit: 92, complexity: 20,
  },
]

export const EMERGENCY_PLAN_TEMPLATES = [
  {
    id: 'EP-001', name: '港口长期罢工应急预案', category: '物流中断', drillCycle: '每半年',
    riskScene: '欧洲/美国主要港口罢工超过7天',
    commander: { leader: '物流总监-赵磊', deputy: '运营副总-陈静', hotline: '400-888-0001' },
    commPlan: { internal: '每4小时部门简报', external: '客户/货代/海关专人对接' },
    continuity: ['备用港口清单(鹿特丹/巴塞罗那)', '铁路+公路多式联运方案', '临时仓储协议'],
    backup: { freq: '日度', location: '异地云备份+本地NAS', recovery: 'RTO 4小时' },
    legal: ['律师团队24h待命', '危机公关声明模板V2'],
    resources: ['应急资金500万', '备用集装箱200TEU'],
    lastDrill: '2026-04-15', nextDrill: '2026-10-15', status: '有效',
  },
  {
    id: 'EP-002', name: '核心供应商突发事故预案', category: '供应链', drillCycle: '每季度',
    riskScene: '火灾/爆炸/地震导致核心供应商停产',
    commander: { leader: '供应链总监-张强', deputy: '生产副总-李明', hotline: '400-888-0002' },
    commPlan: { internal: '应急小组30分钟集结', external: '客户交期变更通知模板' },
    continuity: ['二级供应商清单及认证状态', '临时外包产能协议', '关键物料安全库存7天'],
    backup: { freq: '实时', location: '供应链协同平台', recovery: 'RTO 2小时' },
    legal: ['合同 force majeure 条款激活指引'],
    resources: ['加急采购预算300万', '质量快检团队'],
    lastDrill: '2026-06-01', nextDrill: '2026-09-01', status: '待演练',
  },
  {
    id: 'EP-003', name: '国际制裁升级应急预案', category: '地缘政治', drillCycle: '每季度',
    riskScene: '目标国/地区制裁清单更新影响现有订单',
    commander: { leader: '合规总监-王芳', deputy: '法务总监', hotline: '400-888-0003' },
    commPlan: { internal: '合规委员会2小时会商', external: '监管机构/银行合规沟通' },
    continuity: ['替代市场开拓清单', '合规筛查自动化规则更新', '受影响订单暂停流程'],
    backup: { freq: '日度', location: '合规文档库', recovery: 'RTO 8小时' },
    legal: ['涉外律师团队', '制裁合规自查清单'],
    resources: ['合规专项预算', '外部咨询顾问'],
    lastDrill: '2026-03-20', nextDrill: '2026-06-20', status: '需更新',
  },
  {
    id: 'EP-004', name: '大规模质量问题召回预案', category: '质量合规', drillCycle: '每半年',
    riskScene: '海外批次出现重大质量缺陷需召回',
    commander: { leader: '质量总监', deputy: '客服总监', hotline: '400-888-0004' },
    commPlan: { internal: '质量应急组1小时成立', external: '客户/监管/媒体分级沟通' },
    continuity: ['召回物流通道', '替代品快速生产方案', '客户补偿标准'],
    backup: { freq: '实时', location: '批次追溯系统', recovery: 'RTO 1小时' },
    legal: ['产品责任律师', '召回公告模板'],
    resources: ['召回预算200万', '第三方检测机构'],
    lastDrill: '2025-12-10', nextDrill: '2026-06-10', status: '有效',
  },
]

export const EMERGENCY_DRILL_RECORDS = [
  { id: 'DR-001', planId: 'EP-002', date: '2026-06-01', mode: '桌面推演', participants: 12, issues: ['备用供应商响应时间超预期', '客户通知模板需更新'], status: '整改中' },
  { id: 'DR-002', planId: 'EP-001', date: '2026-04-15', mode: '模拟实战', participants: 18, issues: ['多式联运成本核算不及时'], status: '已完成' },
]

export const EMERGENCY_LAUNCH_TASKS = [
  { action: '应急指挥小组集结', owner: '赵磊', deadline: '30分钟内', dept: '物流部' },
  { action: '启动备用港口切换', owner: '物流专员', deadline: '2小时内', dept: '物流部' },
  { action: '客户交期变更通知', owner: '销售经理', deadline: '4小时内', dept: '销售部' },
  { action: '财务应急资金审批', owner: '财务总监', deadline: '1小时内', dept: '财务部' },
]

export function recommendStrategies({ riskType = '信用风险', grade = 'BBB', exposure = 500, title = '' } = {}) {
  let list = STRATEGY_KNOWLEDGE_GRAPH.filter((s) => s.riskType === riskType || riskType === '全部')
  if (grade) list = list.filter((s) => s.level.includes(grade) || s.level.length >= 4)
  list = list.sort((a, b) => (b.matchScore + b.successRate) - (a.matchScore + a.successRate))
  const top = list.slice(0, 5)
  return top.map((s) => ({
    ...s,
    reason: `历史成功率${s.successRate}% · 匹配度${s.matchScore} · 成本效益${s.costBenefit} · 复杂度${s.complexity}/100`,
    framework: RESPONSE_STRATEGY_TYPES.find((t) => t.key === s.type)?.label,
  }))
}

export function buildActionPlan({ strategies, actions, riskTitle, kris }) {
  return {
    id: `AP-${Date.now()}`,
    title: `${riskTitle || '风险'}应对行动计划`,
    version: 'v1.0',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    riskTitle,
    strategies: strategies.map((s) => s.title),
    kris: kris || DEFAULT_PLAN_KRIS,
    actions: actions || [
      { id: 1, item: '完成策略方案审批', owner: '风控经理', dept: '风控部', start: 'D+0', end: 'D+1', budget: 0, kpi: '审批通过', status: '待开始' },
      { id: 2, item: '执行核心应对动作', owner: '责任人', dept: '业务部', start: 'D+1', end: 'D+7', budget: 50, kpi: 'KPI达成', status: '待开始' },
      { id: 3, item: '效果验收与复盘', owner: '风控经理', dept: '风控部', start: 'D+7', end: 'D+14', budget: 0, kpi: '复盘报告', status: '待开始' },
    ],
    matrix: '责任矩阵已生成 · 已同步日历与待办 · KRI已绑定效果跟踪',
  }
}

export const KRI_LIBRARY = [
  { id: 'KRI-001', name: '货款回收率', type: '结果性', unit: '%', higherBetter: true, desc: '措施实施后的货款回收比例' },
  { id: 'KRI-002', name: '平均响应时间', type: '过程性', unit: '小时', higherBetter: false, desc: '从预警到首次处置动作的时间' },
  { id: 'KRI-003', name: '风险损失金额', type: '结果性', unit: '万元', higherBetter: false, desc: '累计实际/预期损失' },
  { id: 'KRI-004', name: '业务恢复速度', type: '结果性', unit: '天', higherBetter: false, desc: '恢复正常运营所需天数' },
  { id: 'KRI-005', name: '措施执行进度', type: '过程性', unit: '%', higherBetter: true, desc: '行动计划完成百分比' },
  { id: 'KRI-006', name: '违约/延误发生率', type: '结果性', unit: '次/月', higherBetter: false, desc: '风险事件复发频率' },
]

export const DEFAULT_PLAN_KRIS = [
  { kriId: 'KRI-001', name: '货款回收率', baseline: 55, target: 75, current: 68, unit: '%', period: '周度' },
  { kriId: 'KRI-002', name: '平均响应时间', baseline: 48, target: 12, current: 18, unit: '小时', period: '日度' },
  { kriId: 'KRI-003', name: '风险损失金额', baseline: 120, target: 50, current: 85, unit: '万元', period: '周度' },
]

export const EFFECT_TRACKING_PLANS = [
  {
    planId: 'AP-20260701-01',
    riskTitle: '巴西买家信用异常',
    riskType: '信用风险',
    owner: '王芳',
    level: '高',
    reportCycle: '周度',
    kris: DEFAULT_PLAN_KRIS,
    trend: [
      { date: 'W1', recovery: 55, loss: 120, response: 48 },
      { date: 'W2', recovery: 60, loss: 105, response: 32 },
      { date: 'W3', recovery: 65, loss: 92, response: 22 },
      { date: 'W4', recovery: 68, loss: 85, response: 18 },
    ],
  },
  {
    planId: 'AP-20260628-02',
    riskTitle: '芯片供应商停产传导',
    riskType: '供应链风险',
    owner: '张强',
    level: '高',
    reportCycle: '日度',
    kris: [
      { kriId: 'KRI-004', name: '业务恢复速度', baseline: 21, target: 7, current: 12, unit: '天', period: '日度' },
      { kriId: 'KRI-005', name: '措施执行进度', baseline: 0, target: 100, current: 72, unit: '%', period: '日度' },
    ],
    trend: [
      { date: 'D1', progress: 20, recoveryDays: 18 },
      { date: 'D3', progress: 45, recoveryDays: 15 },
      { date: 'D5', progress: 60, recoveryDays: 13 },
      { date: 'D7', progress: 72, recoveryDays: 12 },
    ],
  },
]

export const STRATEGY_ADJUSTMENT_ALERTS = [
  {
    id: 'SA-001', planId: 'AP-20260701-01', kri: '货款回收率', status: '效果一般',
    message: '回收率68%未达目标75%，损失金额下降慢于预期',
    suggestion: '建议组合加强：追加本地律师+提高预付款比例',
    deadline: '2026-07-05', owner: '王芳', resolved: false,
  },
]

export const STRATEGY_EFFECTIVENESS_INSIGHTS = {
  lowEfficiency: ['单一转移策略在新兴市场回收率偏低', '响应时间目标设定过激进导致执行压力'],
  highEfficiency: ['转移+降低组合策略成功率89%', '明确里程碑的行动计划执行进度更高'],
  graphUpdates: ['调整「购买信用保险」适用场景：增加敞口>200万条件', '优化「备用供应商」步骤：增加认证周期评估'],
}

export const RISK_DIGITAL_ARCHIVES = [
  {
    id: 'RA-2026-001', title: '巴西买家信用异常', type: '信用风险', region: '南美', dept: '出口部',
    level: '高', status: '已关闭', closedAt: '2026-06-30', encrypted: true,
    timeline: [
      { time: '2026-06-15 08:15', stage: '初始警报', content: '监测预警触发：买家付款延迟15天' },
      { time: '2026-06-15 10:00', stage: '风险评估', content: 'EL模型评估：预期损失9万 · BBB级' },
      { time: '2026-06-16 09:00', stage: '应对计划', content: '策略：信用保险+提高预付款 · 审批通过' },
      { time: '2026-06-18 14:00', stage: '执行沟通', content: '会议纪要：与客户协商30%预付款' },
      { time: '2026-06-25 11:00', stage: '效果跟踪', content: 'KRI：回收率65% · 效果一般 → 追加律师' },
      { time: '2026-06-30 16:00', stage: '关闭归档', content: '回收率70% · 经验教训：新兴市场需组合策略' },
    ],
    attachments: ['评估报告.pdf', '保险合同.pdf', '处置凭证.zip'],
    lessons: '非洲/南美买家应提前配置信用保险，OA账期不超过60天',
  },
  {
    id: 'RA-2026-002', title: '红海航线中断应对', type: '物流风险', region: '中东', dept: '物流部',
    level: '高', status: '已关闭', closedAt: '2026-06-22', encrypted: true,
    timeline: [
      { time: '2026-06-08 07:00', stage: '初始警报', content: '航线大面积延误预警' },
      { time: '2026-06-08 09:30', stage: '应急预案', content: '启动港口罢工预案 · 备用港口切换' },
      { time: '2026-06-12 15:00', stage: '效果跟踪', content: '延误控制在7天内 · 效果显著' },
      { time: '2026-06-22 10:00', stage: '关闭归档', content: '客户满意度维持 · 成本可控' },
    ],
    attachments: ['预案执行记录.pdf', '多式联运方案.docx'],
    lessons: '备用港口清单需每季度更新对接状态',
  },
  {
    id: 'RA-2026-003', title: 'USD/CNY汇率波动', type: '汇率风险', region: '全球', dept: '财务部',
    level: '中', status: '处理中', closedAt: null, encrypted: false,
    timeline: [
      { time: '2026-07-01 14:00', stage: '初始警报', content: '汇率波动率上升触发预警' },
      { time: '2026-07-02 09:00', stage: '风险评估', content: 'VaR 50万美元 · 锁汇策略推荐' },
      { time: '2026-07-02 11:00', stage: '应对计划', content: '远期锁汇70%敞口 · 执行中' },
    ],
    attachments: ['VaR评估报告.pdf'],
    lessons: '',
  },
]

export const RISK_MATURITY_REPORT = {
  month: '2026年6月',
  metrics: [
    { name: '风险识别平均滞后', value: '2.3天', trend: '↓', benchmark: '3天' },
    { name: '应对成功率', value: '78%', trend: '↑', benchmark: '75%' },
    { name: '平均处理周期', value: '12天', trend: '↓', benchmark: '15天' },
    { name: 'KRI达标率', value: '65%', trend: '→', benchmark: '70%' },
  ],
  weakPoints: ['供应链风险识别滞后', '出口部应对效率偏低', '新兴市场KRI达标率不足'],
  suggestions: ['加强供应商舆情监测规则', '出口部增配专职风控协同岗', '优化组合策略推荐权重'],
  caseHighlights: [
    { title: '【警示】虚假贸易单据识别', type: '警示通报', ref: 'RA-2026-001' },
    { title: '【优秀】红海航线多式联运应对', type: '案例分享', ref: 'RA-2026-002' },
  ],
}

export function evaluateKriStatus(kri) {
  const { current, baseline, target, higherBetter = true } = kri
  const progress = higherBetter !== false
    ? (current - baseline) / (target - baseline || 1)
    : (baseline - current) / (baseline - target || 1)
  if (progress >= 0.85) return { status: '效果显著', color: 'success', progress: Math.round(progress * 100) }
  if (progress >= 0.5) return { status: '效果一般', color: 'warning', progress: Math.round(progress * 100) }
  return { status: '效果不佳', color: 'error', progress: Math.round(Math.max(0, progress) * 100) }
}

export function generateEffectTrackingReport(planId) {
  const plan = EFFECT_TRACKING_PLANS.find((p) => p.planId === planId) || EFFECT_TRACKING_PLANS[0]
  const kriResults = plan.kris.map((k) => {
    const lib = KRI_LIBRARY.find((l) => l.kriId === k.kriId || l.id === k.kriId)
    const evalResult = evaluateKriStatus({
      ...k,
      higherBetter: lib?.higherBetter ?? (k.name.includes('回收') || k.name.includes('进度')),
    })
    return { ...k, ...evalResult, diff: `${k.current}${k.unit} vs 目标${k.target}${k.unit}` }
  })
  const overall = kriResults.some((k) => k.status === '效果不佳') ? '效果不佳'
    : kriResults.some((k) => k.status === '效果一般') ? '效果一般' : '效果显著'
  return {
    planId: plan.planId,
    title: plan.riskTitle,
    cycle: plan.reportCycle,
    generatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    overall,
    kriResults,
    issues: kriResults.filter((k) => k.status !== '效果显著').map((k) => `${k.name}：${k.status}，${k.diff}`),
    diagnosis: overall !== '效果显著' ? '损失下降速度慢于预期，可能与买家本地汇管收紧有关' : '各项KRI均达预期',
    trend: plan.trend,
  }
}

export function searchRiskArchives(filters = {}) {
  let list = [...RISK_DIGITAL_ARCHIVES]
  if (filters.type && filters.type !== '全部') list = list.filter((a) => a.type === filters.type)
  if (filters.status && filters.status !== '全部') list = list.filter((a) => a.status === filters.status)
  if (filters.region && filters.region !== '全部') list = list.filter((a) => a.region.includes(filters.region))
  if (filters.dept && filters.dept !== '全部') list = list.filter((a) => a.dept === filters.dept)
  if (filters.keyword) {
    const q = filters.keyword
    list = list.filter((a) => a.title.includes(q) || a.id.includes(q))
  }
  return list
}

export function getArchiveDetail(archiveId) {
  return RISK_DIGITAL_ARCHIVES.find((a) => a.id === archiveId)
}

export function launchEmergencyPlan(planId) {
  const plan = EMERGENCY_PLAN_TEMPLATES.find((p) => p.id === planId) || EMERGENCY_PLAN_TEMPLATES[0]
  return {
    planId: plan.id,
    planName: plan.name,
    launchedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    elapsed: '< 5分钟',
    alerts: ['短信已发送指挥小组6人', '电话语音通知已触发', '最高级别警报已推送'],
    workspace: ['预案文档', '相关风险数据', '历史案例RC-004'],
    tasks: EMERGENCY_LAUNCH_TASKS.map((t, i) => ({ ...t, id: `ET-${i + 1}`, status: '已分配' })),
    meeting: '应急会议通道已开启 · 指挥小组成员可一键接入',
  }
}

export function getStrategyGraphLinks() {
  return STRATEGY_KNOWLEDGE_GRAPH.flatMap((s) => [
    { source: s.riskType, target: s.type, value: 1 },
    { source: s.type, target: s.title.slice(0, 8), value: 1 },
  ])
}
