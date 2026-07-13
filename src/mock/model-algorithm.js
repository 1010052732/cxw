/** 模型算法中心 Mock · 对齐《数据中心及模型算法需求》 */

export const DATA_ARCHITECTURE_LAYERS = [
  { key: 'access', name: '数据接入层', desc: 'API/爬虫/数据库/文件/FTP/消息流多源接入', color: '#1677ff' },
  { key: 'storage', name: '存储计算层', desc: '数据湖(HDFS/S3) + 仓库(Hive/ClickHouse) + 专题库', color: '#13c2c2' },
  { key: 'governance', name: '数据治理层', desc: '清洗/标准化/关联/血缘/质量/安全', color: '#722ed1' },
  { key: 'service', name: '数据服务层', desc: 'RESTful API · 模型服务 · 自助分析', color: '#fa8c16' },
  { key: 'ops', name: '安全运维层', desc: '加密脱敏 · RBAC · 监控备份 · 故障告警', color: '#B32620' },
]

export const DATA_RESOURCE_CATEGORIES = [
  { category: '基础主体数据', content: '出口商/海外买家/监管机构', source: '工商/海关/邓白氏', freq: '日/月', store: '仓库-主体表' },
  { category: '跨境交易数据', content: '订单/物流/支付', source: 'ERP/海关/银行/物流API', freq: '实时/小时', store: '交易主题表' },
  { category: '信用评估数据', content: '财报/履约/负面/评分', source: '财报/信贷/法院/内部模型', freq: '月/日', store: '信用专题库' },
  { category: '风险预警数据', content: '国别/行业/交易风险', source: 'IMF/协会/实时监测', freq: '周/实时', store: '风险预警库' },
  { category: '外部补充数据', content: '舆情/国际征信/行业报告', source: '新闻/征信/咨询', freq: '小时/月', store: '数据湖' },
]

export const MODEL_SCENES = [
  {
    id: 'opportunity',
    name: '商机识别算法模型',
    algorithm: 'K-Means聚类 + 多维评分',
    targetAccuracy: 85,
    route: '/opportunity/evaluation',
    desc: '商品匹配度、交易频率、信用维度识别潜在贸易伙伴',
    dataSources: ['DS-001', 'DS-004', 'DS-005'],
  },
  {
    id: 'analysis',
    name: '进出口多维度分析模型',
    algorithm: 'ARIMA + PC-Stacking',
    targetAccuracy: 80,
    route: '/analysis/market',
    desc: '市场趋势、成本、政策多维分析与≤2秒报表',
    dataSources: ['DS-001', 'DS-011', 'DS-012'],
  },
  {
    id: 'risk',
    name: '贸易风险防控算法模型',
    algorithm: '层次分析法(AHP) + 实时扫描',
    targetAccuracy: 90,
    route: '/risk/assessment',
    desc: '汇率/海关处罚/信用下降等多场景分级预警',
    dataSources: ['DS-002', 'DS-005', 'DS-007', 'DS-010'],
  },
]

export const MODEL_TEMPLATES = [
  {
    id: 'tpl-opportunity-v2',
    scene: 'opportunity',
    name: '商机多维评分模型 V2',
    version: '2026.07',
    indicators: [
      { key: 'compliance', label: '工商合规性', weight: 15, threshold: '无经营异常满分' },
      { key: 'customs', label: '海关信用等级', weight: 25, threshold: 'AEO高级认证' },
      { key: 'stability', label: '交易稳定性', weight: 20, threshold: '近1年波动<10%' },
      { key: 'credit', label: '信贷履约', weight: 20, threshold: '无逾期' },
      { key: 'finance', label: '财务指标', weight: 20, threshold: '资产负债率≤40%' },
    ],
    grades: [{ min: 90, grade: 'AAAA' }, { min: 80, grade: 'AAA' }, { min: 70, grade: 'AA' }],
  },
  {
    id: 'tpl-analysis-forecast',
    scene: 'analysis',
    name: '进出口趋势预测模型',
    version: '2026.06',
    indicators: [
      { key: 'trend', label: '市场趋势', weight: 30 },
      { key: 'cost', label: '成本传导', weight: 25 },
      { key: 'policy', label: '政策影响', weight: 25 },
      { key: 'season', label: '季节性', weight: 20 },
    ],
    grades: [],
  },
  {
    id: 'tpl-risk-scan',
    scene: 'risk',
    name: '贸易风险实时扫描模型',
    version: '2026.07',
    indicators: [
      { key: 'buyer', label: '买方信用', weight: 30 },
      { key: 'country', label: '国别风险', weight: 25 },
      { key: 'amount', label: '金额异常', weight: 20 },
      { key: 'logistics', label: '物流延迟', weight: 15 },
      { key: 'fx', label: '外汇波动', weight: 10 },
    ],
    alertLevels: ['紧急', '高危', '中危', '低危'],
  },
]

export const MODEL_REGISTRY = [
  {
    id: 'MDL-OPP-202607',
    templateId: 'tpl-opportunity-v2',
    name: '商机多维评分模型',
    scene: 'opportunity',
    version: 'V2.1',
    status: 'production',
    env: 'production',
    accuracy: 87.2,
    recall: 84.5,
    f1: 85.8,
    auc: 0.91,
    deployType: 'online-api',
    lastTrain: '2026-07-01 02:00',
    lastDeploy: '2026-07-02 08:30',
    apiCalls24h: 1280,
    avgLatencyMs: 186,
    errorRate: 0.3,
    driftScore: 0.08,
    owner: '数智分析师',
    downstream: '/opportunity/evaluation',
  },
  {
    id: 'MDL-ANA-202606',
    templateId: 'tpl-analysis-forecast',
    name: '进出口趋势预测模型',
    scene: 'analysis',
    version: 'V1.8',
    status: 'production',
    env: 'production',
    accuracy: 82.4,
    recall: 79.1,
    f1: 80.6,
    auc: 0.86,
    deployType: 'online-api',
    lastTrain: '2026-06-28 02:00',
    lastDeploy: '2026-06-30 10:00',
    apiCalls24h: 856,
    avgLatencyMs: 142,
    errorRate: 0.5,
    driftScore: 0.12,
    owner: '数智分析师',
    downstream: '/analysis/market',
  },
  {
    id: 'MDL-RSK-202607',
    templateId: 'tpl-risk-scan',
    name: '贸易风险实时扫描模型',
    scene: 'risk',
    version: 'V3.0',
    status: 'production',
    env: 'production',
    accuracy: 91.5,
    recall: 89.2,
    f1: 90.3,
    auc: 0.94,
    deployType: 'online-api',
    lastTrain: '2026-07-02 01:00',
    lastDeploy: '2026-07-02 09:00',
    apiCalls24h: 2340,
    avgLatencyMs: 98,
    errorRate: 0.2,
    driftScore: 0.05,
    owner: '风控模型组',
    downstream: '/risk/assessment',
  },
  {
    id: 'MDL-OPP-202605',
    templateId: 'tpl-opportunity-v2',
    name: '商机多维评分模型',
    scene: 'opportunity',
    version: 'V2.0',
    status: 'archived',
    env: 'test',
    accuracy: 84.1,
    recall: 81.0,
    f1: 82.5,
    auc: 0.88,
    deployType: 'offline',
    lastTrain: '2026-05-15 02:00',
    owner: '数智分析师',
    downstream: '/opportunity/evaluation',
  },
]

export const TRAIN_JOBS = [
  { id: 'TR-20260702-01', modelId: 'MDL-OPP-202607', status: 'success', algorithm: 'RandomForest', dataRows: 125000, duration: '42m', accuracy: 87.2, time: '2026-07-01 02:42' },
  { id: 'TR-20260701-02', modelId: 'MDL-RSK-202607', status: 'success', algorithm: 'XGBoost', dataRows: 98000, duration: '38m', accuracy: 91.5, time: '2026-07-02 01:38' },
  { id: 'TR-20260628-01', modelId: 'MDL-ANA-202606', status: 'success', algorithm: 'ARIMA+Stacking', dataRows: 210000, duration: '55m', accuracy: 82.4, time: '2026-06-28 02:55' },
]

export const MODEL_DRIFT_ALERTS = [
  { id: 'DR-001', modelId: 'MDL-ANA-202606', type: 'feature_drift', level: 'warning', msg: '政策特征分布偏移 12%', time: '2026-07-02 09:15' },
  { id: 'DR-002', modelId: 'MDL-OPP-202607', type: 'accuracy', level: 'info', msg: '准确率稳定在 87% 以上', time: '2026-07-02 08:00' },
]

export const MODEL_LINEAGE = [
  { step: 1, stage: '数据源', node: '海关/工商/征信/舆情', detail: '12 路数据源 · DS-001~DS-012', route: '/data/config' },
  { step: 2, stage: '清洗标准化', node: '质量工作台', detail: '25+ 规则 · 质量分≥98%', route: '/data/quality' },
  { step: 3, stage: '存储分层', node: '热/温/冷存储', detail: 'ClickHouse 温层 + Redis 热层', route: '/data/storage' },
  { step: 4, stage: '特征工程', node: '转换与增强', detail: '归一化 · 实体关联 · NLP标签', route: '/data/quality?tab=transform' },
  { step: 5, stage: '模型训练', node: '算法工厂', detail: 'K-Means/ARIMA/AHP/Stacking', route: '/data/models?tab=factory' },
  { step: 6, stage: '模型部署', node: '在线API服务', detail: '测试/生产 · 并发100 · ≤500ms', route: '/data/models?tab=deploy' },
  { step: 7, stage: '业务应用', node: '商机/分析/风险', detail: '评估排序 · 趋势预测 · 风险预警', route: '/opportunity/evaluation' },
]

export const ITERATION_PLAN = [
  { quarter: '2026 Q3', focus: '跨境电商场景参数适配', status: '进行中' },
  { quarter: '2026 Q4', focus: '大宗商品 PC-Stacking 优化', status: '计划中' },
  { quarter: '2027 Q1', focus: '多语言报告与解释增强', status: '计划中' },
]

export function getModelById(id) {
  return MODEL_REGISTRY.find((m) => m.id === id)
}

export function getModelsByScene(scene) {
  return MODEL_REGISTRY.filter((m) => m.scene === scene && m.status !== 'archived')
}

export function getProductionModels() {
  return MODEL_REGISTRY.filter((m) => m.status === 'production')
}

export function buildModelExplain(model) {
  if (!model) return null
  return {
    summary: `${model.name} ${model.version} 当前准确率 ${model.accuracy}%，主要服务于${MODEL_SCENES.find((s) => s.id === model.scene)?.name || model.scene}场景。`,
    features: [
      { name: '特征重要性 Top1', value: model.scene === 'risk' ? '买方信用评级' : model.scene === 'analysis' ? '海关进出口额' : '交易稳定性' },
      { name: '训练样本量', value: TRAIN_JOBS.find((j) => j.modelId === model.id)?.dataRows?.toLocaleString() || '—' },
      { name: '交叉验证', value: '5折 · AUC ' + (model.auc || '—') },
    ],
    application: model.scene === 'opportunity'
      ? '应用于商机评估排序，支持权重可调与阈值硬性约束。'
      : model.scene === 'analysis'
        ? '应用于市场/商品趋势预测与价格 PC-Stacking 情景模拟。'
        : '应用于风险识别预警与评估参数自动获取。',
    caseStudy: '某银行接入模型后审批效率提升 30%，坏账率下降 15%（Mock案例）。',
  }
}
