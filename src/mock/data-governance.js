export const DATA_SOURCE_CATEGORIES = [
  { value: 'all', label: '全部来源' },
  { value: 'official', label: '官方与机构' },
  { value: 'commercial', label: '商业与平台' },
  { value: 'sentiment', label: '市场与舆情' },
  { value: 'internal', label: '企业内部' },
]

export const DATA_SOURCE_TYPES = [
  { value: 'all', label: '全部接入方式' },
  { value: 'api', label: 'API接口' },
  { value: 'crawler', label: '网络爬虫' },
  { value: 'database', label: '数据库' },
  { value: 'file', label: '文件/FTP' },
  { value: 'stream', label: '消息流' },
]

export const DATA_SOURCE_STATUS = [
  { value: 'all', label: '全部状态' },
  { value: 'running', label: '运行中' },
  { value: 'warning', label: '异常' },
  { value: 'stopped', label: '已停止' },
]

export const FREQUENCY_OPTIONS = [
  { value: '实时', label: '实时流式' },
  { value: '每15分钟', label: '每15分钟（准实时）' },
  { value: '每30分钟', label: '每30分钟' },
  { value: '每小时', label: '每小时' },
  { value: '每6小时', label: '每6小时' },
  { value: '每日', label: '每日' },
  { value: '每周', label: '每周' },
  { value: '监测触发', label: '页面变更监测' },
]

export const INITIAL_DATA_SOURCES = [
  {
    id: 'DS-001',
    name: '海关总署进出口数据',
    category: 'official',
    type: 'api',
    protocol: 'HTTPS/REST',
    endpoint: 'https://api.customs.gov.cn/trade/v2',
    frequency: '每小时',
    timeWindow: '近24小时滚动',
    collectDepth: '标准字段集',
    geoScope: '全球',
    keywords: 'HS编码,进出口额,国别',
    status: 'running',
    enabled: true,
    lastSync: '2026-07-02 10:30:00',
    owner: '数据平台组',
    todayVolume: 86.5,
    latency: 1.2,
    failRate: 0.2,
    apiQuota: 100000,
    apiUsed: 68200,
    apiCost: 1200,
    quotaWarning: 80,
    paidApi: true,
    health: 'green',
  },
  {
    id: 'DS-002',
    name: 'USITC 337调查公告',
    category: 'official',
    type: 'crawler',
    protocol: 'Robots合规爬虫',
    endpoint: 'https://www.usitc.gov/337',
    frequency: '监测触发',
    timeWindow: '增量监测',
    collectDepth: '标题,正文,发布时间,附件',
    geoScope: '美国',
    keywords: '337调查,贸易救济',
    status: 'running',
    enabled: true,
    lastSync: '2026-07-02 09:45:00',
    owner: '政策研究组',
    todayVolume: 2.1,
    latency: 3.2,
    failRate: 0.0,
    apiQuota: 0,
    apiUsed: 0,
    apiCost: 0,
    quotaWarning: 0,
    paidApi: false,
    health: 'green',
  },
  {
    id: 'DS-003',
    name: '欧盟官方公报(OJ)贸易防卫',
    category: 'official',
    type: 'crawler',
    protocol: 'Robots合规爬虫',
    endpoint: 'https://eur-lex.europa.eu/oj',
    frequency: '每日',
    timeWindow: '近7天',
    collectDepth: '政策全文,生效日期',
    geoScope: '欧盟',
    keywords: '反倾销,反补贴,保障措施',
    status: 'running',
    enabled: true,
    lastSync: '2026-07-02 06:30:00',
    owner: '政策研究组',
    todayVolume: 5.6,
    latency: 4.8,
    failRate: 0.3,
    apiQuota: 0,
    apiUsed: 0,
    apiCost: 0,
    quotaWarning: 0,
    paidApi: false,
    health: 'green',
  },
  {
    id: 'DS-004',
    name: '阿里巴巴国际站供需数据',
    category: 'commercial',
    type: 'api',
    protocol: 'HTTPS/REST',
    endpoint: 'https://api.alibaba.com/trade/demand',
    frequency: '每30分钟',
    timeWindow: '近48小时',
    collectDepth: '产品目录,询盘,价格区间',
    geoScope: '全球',
    keywords: 'B2B,询盘,品类',
    status: 'running',
    enabled: true,
    lastSync: '2026-07-02 10:28:00',
    owner: '商机挖掘组',
    todayVolume: 42.3,
    latency: 1.5,
    failRate: 0.4,
    apiQuota: 50000,
    apiUsed: 43800,
    apiCost: 860,
    quotaWarning: 85,
    paidApi: true,
    health: 'yellow',
  },
  {
    id: 'DS-005',
    name: '邓白氏企业信用API',
    category: 'commercial',
    type: 'api',
    protocol: 'HTTPS/REST',
    endpoint: 'https://api.dnb.com/v2/credit',
    frequency: '每日',
    timeWindow: '全量更新',
    collectDepth: '信用评分,行业基准',
    geoScope: '全球',
    keywords: '企业信用,采购商',
    status: 'warning',
    enabled: true,
    lastSync: '2026-07-02 08:00:00',
    owner: '风控数据组',
    todayVolume: 8.6,
    latency: 2.4,
    failRate: 1.2,
    apiQuota: 10000,
    apiUsed: 9200,
    apiCost: 2400,
    quotaWarning: 90,
    paidApi: true,
    health: 'yellow',
  },
  {
    id: 'DS-006',
    name: '波罗的海航运指数',
    category: 'commercial',
    type: 'api',
    protocol: 'HTTPS/REST',
    endpoint: 'https://api.balticexchange.com/index',
    frequency: '实时',
    timeWindow: '实时流',
    collectDepth: 'BDI, BCI, BPI指数',
    geoScope: '全球航线',
    keywords: '航运成本,BDI',
    status: 'running',
    enabled: true,
    lastSync: '2026-07-02 10:30:05',
    owner: '物流分析组',
    todayVolume: 18.2,
    latency: 0.4,
    failRate: 0.0,
    apiQuota: 200000,
    apiUsed: 156000,
    apiCost: 580,
    quotaWarning: 80,
    paidApi: true,
    health: 'green',
  },
  {
    id: 'DS-007',
    name: '全球贸易舆情NLP监测',
    category: 'sentiment',
    type: 'crawler',
    protocol: 'NLP爬虫集群',
    endpoint: 'multi-source/news,social,forum',
    frequency: '每15分钟',
    timeWindow: '近72小时',
    collectDepth: '标题,正文,情感,主题',
    geoScope: '全球',
    keywords: '贸易,关税,供应链',
    status: 'running',
    enabled: true,
    lastSync: '2026-07-02 10:25:00',
    owner: '舆情分析组',
    todayVolume: 35.8,
    latency: 5.2,
    failRate: 0.8,
    apiQuota: 0,
    apiUsed: 0,
    apiCost: 320,
    quotaWarning: 0,
    paidApi: false,
    health: 'green',
  },
  {
    id: 'DS-008',
    name: 'LinkedIn行业动态监测',
    category: 'sentiment',
    type: 'crawler',
    protocol: 'NLP爬虫',
    endpoint: 'https://linkedin.com/feed/industry',
    frequency: '每小时',
    timeWindow: '近24小时',
    collectDepth: '动态,评论,情感',
    geoScope: '欧美,东南亚',
    keywords: '采购,合作,扩产',
    status: 'running',
    enabled: true,
    lastSync: '2026-07-02 10:00:00',
    owner: '商机挖掘组',
    todayVolume: 12.4,
    latency: 6.1,
    failRate: 1.0,
    apiQuota: 0,
    apiUsed: 0,
    apiCost: 180,
    quotaWarning: 0,
    paidApi: false,
    health: 'green',
  },
  {
    id: 'DS-009',
    name: '企业历史交易记录',
    category: 'internal',
    type: 'database',
    protocol: 'MySQL(加密管道)',
    endpoint: '10.12.8.56:3306/erp_trade',
    frequency: '每30分钟',
    timeWindow: '近90天',
    collectDepth: '订单,客户,产品,金额',
    geoScope: '企业内部',
    keywords: '交易,客户档案',
    status: 'running',
    enabled: true,
    lastSync: '2026-07-02 10:28:00',
    owner: '贸易数据组',
    todayVolume: 15.2,
    latency: 0.6,
    failRate: 0.0,
    apiQuota: 0,
    apiUsed: 0,
    apiCost: 0,
    quotaWarning: 0,
    paidApi: false,
    health: 'green',
  },
  {
    id: 'DS-010',
    name: '国际物流轨迹数据',
    category: 'commercial',
    type: 'api',
    protocol: 'HTTPS/REST',
    endpoint: 'https://api.logistics.global/track',
    frequency: '实时',
    timeWindow: '在途订单',
    collectDepth: '轨迹节点, ETA, 异常',
    geoScope: '全球',
    keywords: '物流,航线,港口',
    status: 'warning',
    enabled: true,
    lastSync: '2026-07-02 10:15:00',
    owner: '供应链组',
    todayVolume: 28.8,
    latency: 3.6,
    failRate: 2.8,
    apiQuota: 80000,
    apiUsed: 52000,
    apiCost: 450,
    quotaWarning: 80,
    paidApi: true,
    health: 'red',
  },
  {
    id: 'DS-011',
    name: '汇率行情数据',
    category: 'commercial',
    type: 'stream',
    protocol: 'Kafka',
    endpoint: 'kafka://10.12.9.10:9092/fx_rates',
    frequency: '实时',
    timeWindow: '实时流',
    collectDepth: '即期,远期汇率',
    geoScope: '主要货币对',
    keywords: 'USD,EUR,CNY',
    status: 'running',
    enabled: true,
    lastSync: '2026-07-02 10:30:05',
    owner: '金融数据组',
    todayVolume: 22.6,
    latency: 0.3,
    failRate: 0.0,
    apiQuota: 500000,
    apiUsed: 210000,
    apiCost: 200,
    quotaWarning: 80,
    paidApi: true,
    health: 'green',
  },
  {
    id: 'DS-012',
    name: '港口吞吐量统计',
    category: 'official',
    type: 'database',
    protocol: 'PostgreSQL',
    endpoint: '10.12.8.88:5432/port_stats',
    frequency: '每日',
    timeWindow: '月度统计',
    collectDepth: '港口,吞吐量,航线',
    geoScope: '全球主要港口',
    keywords: '港口,集装箱',
    status: 'stopped',
    enabled: false,
    lastSync: '2026-06-28 08:00:00',
    owner: '物流分析组',
    todayVolume: 0,
    latency: 0,
    failRate: 0,
    apiQuota: 0,
    apiUsed: 0,
    apiCost: 0,
    quotaWarning: 0,
    paidApi: false,
    health: 'red',
  },
]

export const COLLECTION_LOGS = [
  {
    id: 'LOG-001', taskId: 'TASK-8821', sourceId: 'DS-001', sourceName: '海关总署进出口数据',
    startTime: '2026-07-02 10:00:00', endTime: '2026-07-02 10:02:15', duration: '2m15s',
    operator: '系统调度', ip: '10.12.10.21', status: 'success',
    records: 12580, dataSize: '86.5MB', params: 'window=24h, fields=standard',
    response: 'HTTP 200, 12580 records', error: null,
  },
  {
    id: 'LOG-002', taskId: 'TASK-8820', sourceId: 'DS-010', sourceName: '国际物流轨迹数据',
    startTime: '2026-07-02 10:14:00', endTime: '2026-07-02 10:15:32', duration: '1m32s',
    operator: '系统调度', ip: '10.12.10.21', status: 'warning',
    records: 3200, dataSize: '12.3MB', params: 'mode=realtime, retry=3',
    response: 'HTTP 504 Gateway Timeout', error: '上游API响应超时，已触发自动重试',
  },
  {
    id: 'LOG-003', taskId: 'TASK-8819', sourceId: 'DS-005', sourceName: '邓白氏企业信用API',
    startTime: '2026-07-02 08:00:00', endTime: '2026-07-02 08:05:48', duration: '5m48s',
    operator: '系统调度', ip: '10.12.10.22', status: 'warning',
    records: 8600, dataSize: '4.2MB', params: 'quota_check=true',
    response: 'HTTP 200, quota 92%', error: 'API配额使用率超过90%预警阈值',
  },
  {
    id: 'LOG-004', taskId: 'TASK-8818', sourceId: 'DS-012', sourceName: '港口吞吐量统计',
    startTime: '2026-06-28 08:00:00', endTime: '2026-06-28 08:00:45', duration: '45s',
    operator: '系统调度', ip: '10.12.10.21', status: 'failed',
    records: 0, dataSize: '0', params: 'host=10.12.8.88:5432',
    response: 'Connection refused', error: 'java.net.ConnectException: Connection refused',
  },
  {
    id: 'LOG-005', taskId: 'TASK-8817', sourceId: 'DS-004', sourceName: '阿里巴巴国际站供需数据',
    startTime: '2026-07-02 10:00:00', endTime: '2026-07-02 10:01:20', duration: '1m20s',
    operator: '系统调度', ip: '10.12.10.23', status: 'success',
    records: 8900, dataSize: '28.6MB', params: 'window=48h, category=all',
    response: 'HTTP 200, 8900 records', error: null,
  },
  {
    id: 'LOG-006', taskId: 'TASK-8816', sourceId: 'DS-002', sourceName: 'USITC 337调查公告',
    startTime: '2026-07-02 09:45:00', endTime: '2026-07-02 09:45:38', duration: '38s',
    operator: '系统调度', ip: '10.12.10.24', status: 'success',
    records: 12, dataSize: '0.8MB', params: 'mode=change_detect',
    response: '检测到1条新公告', error: null,
  },
  {
    id: 'LOG-007', taskId: 'TASK-8815', sourceId: 'DS-010', sourceName: '国际物流轨迹数据',
    startTime: '2026-07-02 10:15:32', endTime: '2026-07-02 10:16:10', duration: '38s',
    operator: '系统自动', ip: '10.12.10.21', status: 'success',
    records: 3200, dataSize: '12.3MB', params: 'self_heal=backup_proxy',
    response: 'HTTP 200 via backup proxy', error: '自愈：已切换备用代理节点',
  },
  {
    id: 'LOG-008', taskId: 'TASK-8814', sourceId: 'DS-007', sourceName: '全球贸易舆情NLP监测',
    startTime: '2026-07-02 10:10:00', endTime: '2026-07-02 10:12:30', duration: '2m30s',
    operator: '张三(手动)', ip: '192.168.1.105', status: 'success',
    records: 5680, dataSize: '18.4MB', params: 'manual_trigger=true',
    response: 'HTTP 200, NLP processed', error: null,
  },
]

export const MONITOR_TREND = {
  today: [
    { time: '00:00', value: 8 }, { time: '02:00', value: 12 }, { time: '04:00', value: 15 },
    { time: '06:00', value: 28 }, { time: '08:00', value: 52 }, { time: '10:00', value: 86 },
    { time: '12:00', value: 120 }, { time: '14:00', value: 168 }, { time: '16:00', value: 210 },
    { time: '18:00', value: 245 }, { time: '20:00', value: 278 }, { time: '22:00', value: 301 },
  ],
  week: [
    { time: '周一', value: 1850 }, { time: '周二', value: 1920 }, { time: '周三', value: 1980 },
    { time: '周四', value: 2050 }, { time: '周五', value: 2100 }, { time: '周六', value: 1680 },
    { time: '周日', value: 1520 },
  ],
}

export const TASK_STATUS_STATS = [
  { status: '运行中', value: 8 }, { status: '等待中', value: 3 },
  { status: '异常', value: 2 }, { status: '已完成', value: 24 },
]

export const TASK_QUEUE = [
  {
    id: 'TQ-001',
    sourceId: 'DS-001',
    taskNo: 'TASK-8821',
    source: '海关总署进出口数据',
    progress: 85,
    threads: 4,
    status: 'running',
    priority: '高',
    schedule: '每小时',
    startTime: '2026-07-02 10:00:00',
    eta: '2026-07-02 10:05:00',
    collectedRecords: 10693,
    targetRecords: 12580,
    throughput: '1.2万条/分钟',
    workerNode: 'collector-node-01',
  },
  {
    id: 'TQ-002',
    sourceId: 'DS-011',
    taskNo: 'TASK-8822',
    source: '汇率行情数据',
    progress: 100,
    threads: 2,
    status: 'running',
    priority: '中',
    schedule: '实时流',
    startTime: '2026-07-02 10:28:00',
    eta: '持续运行',
    collectedRecords: 226000,
    targetRecords: null,
    throughput: '3.8万条/分钟',
    workerNode: 'stream-node-02',
  },
  {
    id: 'TQ-003',
    sourceId: 'DS-007',
    taskNo: 'TASK-8814',
    source: '全球贸易舆情NLP监测',
    progress: 62,
    threads: 8,
    status: 'running',
    priority: '高',
    schedule: '每15分钟',
    startTime: '2026-07-02 10:10:00',
    eta: '2026-07-02 10:14:00',
    collectedRecords: 3520,
    targetRecords: 5680,
    throughput: '0.9万条/分钟',
    workerNode: 'nlp-node-03',
  },
  {
    id: 'TQ-004',
    sourceId: 'DS-010',
    taskNo: 'TASK-8820',
    source: '国际物流轨迹数据',
    progress: 45,
    threads: 3,
    status: 'warning',
    priority: '高',
    schedule: '每10分钟',
    startTime: '2026-07-02 10:14:00',
    eta: '2026-07-02 10:18:00',
    collectedRecords: 1440,
    targetRecords: 3200,
    throughput: '0.4万条/分钟',
    workerNode: 'collector-node-02',
    lastError: '上游API响应超时，已触发自动重试',
  },
  {
    id: 'TQ-005',
    sourceId: 'DS-005',
    taskNo: 'TASK-8819',
    source: '邓白氏企业信用API',
    progress: 0,
    threads: 0,
    status: 'waiting',
    priority: '中',
    schedule: '每日 08:00',
    startTime: '—',
    eta: '2026-07-03 08:00:00',
    collectedRecords: 0,
    targetRecords: 8600,
    throughput: '—',
    workerNode: '—',
    waitReason: 'API配额使用率 92%，等待配额窗口释放',
  },
]

export const MONITOR_ALERTS = [
  {
    id: 'MA-001', source: '国际物流轨迹数据', sourceId: 'DS-010', level: 'error',
    message: '连续3次采集失败，API响应超时', time: '2026-07-02 10:15',
    selfHeal: '已切换备用代理节点，采集恢复', selfHealed: true, handled: false,
  },
  {
    id: 'MA-002', source: '邓白氏企业信用API', sourceId: 'DS-005', level: 'warning',
    message: 'API配额使用率 92%，接近上限预警阈值 90%', time: '2026-07-02 08:05',
    selfHeal: null, selfHealed: false, handled: false,
  },
  {
    id: 'MA-003', source: '阿里巴巴国际站供需数据', sourceId: 'DS-004', level: 'warning',
    message: 'API配额使用率 87.6%，建议关注调用频率', time: '2026-07-02 10:01',
    selfHeal: null, selfHealed: false, handled: false,
  },
  {
    id: 'MA-004', source: '港口吞吐量统计', sourceId: 'DS-012', level: 'error',
    message: '数据库连接失败，任务已停止', time: '2026-06-28 08:00',
    selfHeal: '自动重连失败，需人工介入', selfHealed: false, handled: true,
  },
  {
    id: 'MA-005', source: '贸易政策公告爬虫', sourceId: 'DS-003', level: 'info',
    message: '页面结构变更检测，已自动适配新选择器', time: '2026-07-02 06:30',
    selfHeal: '爬虫规则自动更新成功', selfHealed: true, handled: true,
  },
]

export const QUALITY_RULES = [
  {
    id: 'QR-001', name: '必填字段完整性', dimension: '完整性', hitCount: 3, status: 'open',
    desc: '核心贸易字段（HS编码、出口金额、目的国）不得为空',
    fields: ['hsCode', 'amount', 'destination'],
    action: 'block',
  },
  {
    id: 'QR-002', name: 'HS编码格式校验', dimension: '一致性', hitCount: 7, status: 'open',
    desc: 'HS编码需符合 4/6/8/10 位标准格式',
    fields: ['hsCode'],
    action: 'auto_fix',
  },
  {
    id: 'QR-003', name: '采集延迟阈值', dimension: '及时性', hitCount: 2, status: 'fixed',
    desc: '采集完成时间与业务时间窗口偏差不超过 2 小时',
    fields: ['collectTime'],
    action: 'warn',
  },
  {
    id: 'QR-004', name: '金额精度校验', dimension: '准确性', hitCount: 1, status: 'open',
    desc: '金额字段小数位不超过 2 位，且不得为负',
    fields: ['amount', 'unitPrice'],
    action: 'mark',
  },
  {
    id: 'QR-005', name: '重复记录检测', dimension: '一致性', hitCount: 5, status: 'open',
    desc: '同一信用代码 + 报关单号不得重复入库',
    fields: ['creditCode', 'declarationNo'],
    action: 'dedup',
  },
]

export const QUALITY_RULE_HITS = [
  { id: 'RH-001', ruleId: 'QR-002', sourceId: 'DS-001', sourceName: '海关总署进出口数据', field: 'hsCode', sample: '8708', time: '2026-07-02 10:18', status: 'open' },
  { id: 'RH-002', ruleId: 'QR-002', sourceId: 'DS-001', sourceName: '海关总署进出口数据', field: 'hsCode', sample: '3926.90', time: '2026-07-02 10:17', status: 'open' },
  { id: 'RH-003', ruleId: 'QR-001', sourceId: 'DS-009', sourceName: '企业历史交易记录', field: 'destination', sample: 'NULL', time: '2026-07-02 09:55', status: 'open' },
  { id: 'RH-004', ruleId: 'QR-005', sourceId: 'DS-004', sourceName: '阿里巴巴国际站供需数据', field: 'creditCode', sample: '91310000MA1FL***', time: '2026-07-02 09:40', status: 'resolved' },
  { id: 'RH-005', ruleId: 'QR-004', sourceId: 'DS-009', sourceName: '企业历史交易记录', field: 'amount', sample: '-1280.556', time: '2026-07-02 09:22', status: 'open' },
]

export const CLEANING_BATCHES = [
  { id: 'BATCH-001', sourceId: 'DS-001', sourceName: '海关总署进出口数据', records: 12580, collectedAt: '2026-07-02 10:02', status: 'ready', qualityBefore: 86.2 },
  { id: 'BATCH-002', sourceId: 'DS-004', sourceName: '阿里巴巴国际站供需数据', records: 8900, collectedAt: '2026-07-02 10:01', status: 'ready', qualityBefore: 91.5 },
  { id: 'BATCH-003', sourceId: 'DS-007', sourceName: '全球贸易舆情NLP监测', records: 5680, collectedAt: '2026-07-02 10:12', status: 'ready', qualityBefore: 88.0 },
  { id: 'BATCH-004', sourceId: 'DS-010', sourceName: '国际物流轨迹数据', records: 3200, collectedAt: '2026-07-02 10:16', status: 'warning', qualityBefore: 82.4 },
  { id: 'BATCH-005', sourceId: 'DS-005', sourceName: '邓白氏企业信用API', records: 8600, collectedAt: '2026-07-02 08:05', status: 'warning', qualityBefore: 79.1 },
  { id: 'BATCH-006', sourceId: 'DS-003', sourceName: '欧盟官方公报(OJ)贸易防卫', records: 156, collectedAt: '2026-07-02 06:30', status: 'ready', qualityBefore: 94.2 },
]

export const CLEANING_JOBS = [
  {
    id: 'CJ-001', batchId: 'BATCH-001', sourceName: '海关总署进出口数据', pipelineVersion: 'v2.3',
    steps: 5, status: 'success', startTime: '2026-07-02 10:15', duration: '7m12s',
    beforeScore: 86.2, afterScore: 98.0, operator: '系统调度',
  },
  {
    id: 'CJ-002', batchId: 'BATCH-002', sourceName: '阿里巴巴国际站供需数据', pipelineVersion: 'v2.3',
    steps: 4, status: 'success', startTime: '2026-07-02 09:30', duration: '5m48s',
    beforeScore: 91.5, afterScore: 96.2, operator: '李四',
  },
  {
    id: 'CJ-003', batchId: 'BATCH-004', sourceName: '国际物流轨迹数据', pipelineVersion: 'v2.2',
    steps: 5, status: 'failed', startTime: '2026-07-02 08:50', duration: '2m10s',
    beforeScore: 82.4, afterScore: null, operator: '系统调度', error: '异常值队列未处理完毕',
  },
]

export const MISSING_FIELD_STRATEGIES = [
  { field: '出口金额', importance: '高', strategy: 'predict', fallback: '同类均值', desc: '基于 HS 编码 + 目的国同类样本 ML 预测' },
  { field: '目的国', importance: '高', strategy: 'constant', fallback: 'UNKNOWN', desc: '标记为未知，进入人工复核队列' },
  { field: '采购商信用分', importance: '中', strategy: 'median', fallback: '行业中位数', desc: '按行业分组取中位数填充' },
  { field: '产品描述', importance: '低', strategy: 'delete', fallback: '—', desc: '非核心字段缺失则删除该记录' },
]

export const NORMALIZATION_CONFIG = [
  { id: 'NC-001', field: '出口额/交易量', method: 'min_max', range: '[0, 1]', status: 'active' },
  { id: 'NC-002', field: '信用评分/波动率', method: 'z_score', range: 'μ=0, σ=1', status: 'active' },
  { id: 'NC-003', field: '货币金额', method: 'currency', range: 'USD 基准', status: 'active' },
  { id: 'NC-004', field: '计量单位', method: 'unit', range: 'SI 标准单位', status: 'active' },
]

export const ENTITY_LINK_RULES = [
  { id: 'EL-001', left: '海关出口商', leftKey: '统一社会信用代码', right: '邓白氏信用', rightKey: 'DUNS', linked: 652, status: 'active' },
  { id: 'EL-002', left: '报关商品', leftKey: 'HS编码', right: '产品目录', rightKey: 'SKU映射', linked: 1280, status: 'active' },
  { id: 'EL-003', left: '物流订单', leftKey: '港口代码', right: '港口吞吐量', rightKey: 'UN/LOCODE', linked: 430, status: 'active' },
  { id: 'EL-004', left: '企业画像', leftKey: '多维融合', right: '商机评估输入', rightKey: '897条关联', linked: 897, status: 'active' },
]

export const TEXT_CLEANING_SAMPLES = [
  { id: 'TX-001', raw: 'The EU imposed anti-dumping duties on steel imports...', tokens: 'EU / anti-dumping / steel / imports', entities: 'ORG:EU, PRODUCT:steel, TERM:anti-dumping', steps: '分词 → 去停用词 → NER' },
  { id: 'TX-002', raw: '华贸集团拟在越南设立冷链仓储中心', tokens: '华贸集团 / 越南 / 冷链 / 仓储', entities: 'ORG:华贸集团, GPE:越南, PRODUCT:冷链仓储', steps: '分词 → 词形还原 → NER' },
  { id: 'TX-003', raw: 'Bureau Veritas certifies ABC Trading GmbH for ISO14001', tokens: 'Bureau Veritas / certifies / ABC Trading / ISO14001', entities: 'ORG:Bureau Veritas, ORG:ABC Trading GmbH, TERM:ISO14001', steps: '多语言分词 → NER' },
]

export const DEDUP_ENTITY_PREVIEW = [
  {
    id: 'DUP-001',
    matchType: '精确匹配',
    matchKey: '统一社会信用代码 91440300MA5XXXXX',
    records: [
      { source: '海关出口商', name: '华贸进出口集团(深圳)有限公司', score: 0.99 },
      { source: '邓白氏信用', name: 'Huamao Import Export Group (Shenzhen) Co., Ltd.', score: 0.99 },
    ],
    merged: '华贸进出口集团(深圳)有限公司 · 融合 2 条记录',
    method: 'creditCode 精确匹配',
  },
  {
    id: 'DUP-002',
    matchType: '相似度融合',
    matchKey: '实体消歧 · 相似度 0.94',
    records: [
      { source: 'B2B询盘', name: 'Viet Fresh Fruit Co.', score: 0.91 },
      { source: '海关数据', name: 'Vietnam Fresh Fruit Trading', score: 0.94 },
    ],
    merged: 'Viet Fresh Fruit Co. · 消歧融合 2 条',
    method: '编辑距离 + 实体消歧模型',
  },
]

export const FORMAT_STANDARD_RULES = [
  { field: '日期时间', before: '02/07/2026 10:15', after: '2026-07-02T10:15:00Z', rule: 'ISO 8601' },
  { field: '货币金额', before: '1280000 RMB', after: '179775.28 USD', rule: 'USD 基准折算' },
  { field: '国家编码', before: 'USA / Viet Nam', after: 'US / VN', rule: 'ISO 3166-1 alpha-2' },
  { field: 'HS编码', before: '8708', after: '8708.99.00', rule: '10位标准编码' },
  { field: '电话号码', before: '+86 755 1234 5678', after: '+8675512345678', rule: 'E.164 规范化' },
]

export const RECORD_LINEAGE_TRACES = {
  'S-001': [
    { stage: '数据采集', node: 'DS-001 海关总署', detail: 'API 采集 · 2026-07-02 10:02', route: '/data/monitor' },
    { stage: '原始存储', node: 'Kafka trade.raw.customs', detail: '12580 条原始记录', route: '/data/storage' },
    { stage: '去重与合并', node: 'creditCode 精确匹配', detail: '消重 342 条 · 融合 2 条重复企业', route: '/data/quality?tab=pipeline' },
    { stage: '格式标准化', node: '企业名称 trim', detail: '去除尾部空格', route: '/data/quality?tab=pipeline' },
    { stage: '质量评估', node: '综合分 98.0', detail: '完整性 99 · 一致性 97', route: '/data/quality?tab=report' },
    { stage: '业务应用', node: '商机评估输入', detail: '关联企业画像 · 进入评估池', route: '/opportunity/evaluation' },
  ],
  'S-002': [
    { stage: '数据采集', node: 'DS-001 海关总署', detail: '报关单明细字段', route: '/data/monitor' },
    { stage: '格式标准化', node: '币种折算 USD', detail: '汇率 2026-07-02 中间价', route: '/data/quality?tab=pipeline' },
    { stage: '异常值检测', node: '3σ 校验通过', detail: '未触发异常队列', route: '/data/quality?tab=pipeline' },
    { stage: '分析层存储', node: 'ClickHouse trade.clean', detail: '温数据层可查', route: '/data/storage' },
  ],
  'S-005': [
    { stage: '数据采集', node: 'DS-005 邓白氏信用', detail: '信用分字段缺失 12%', route: '/data/monitor' },
    { stage: '缺失值处理', node: 'ML 预测填充', detail: '基于 HS+目的国同类样本', route: '/data/quality?tab=pipeline' },
    { stage: '特征工程', node: '买方信用衍生分', detail: '纳入商机评分模型', route: '/data/quality?tab=transform' },
    { stage: '模型算法', node: '商机多维评分 V2', detail: '权重 25% 海关信用', route: '/data/models' },
  ],
}

export const PIPELINE_STEP_CONTRIBUTIONS = [
  { step: '去重与合并', integrity: 2.1, accuracy: 0.8, consistency: 4.2, timeliness: 0 },
  { step: '缺失值处理', integrity: 5.5, accuracy: 1.2, consistency: 0.5, timeliness: 0 },
  { step: '异常值检测', integrity: 0.3, accuracy: 6.8, consistency: 1.1, timeliness: 0 },
  { step: '格式标准化', integrity: 0.5, accuracy: 2.4, consistency: 7.6, timeliness: 0 },
  { step: '文本清洗', integrity: 1.2, accuracy: 1.8, consistency: 2.1, timeliness: 0 },
]


export const QUALITY_DETAIL = [
  { id: 'DS-001', name: '海关总署进出口数据', quality: 98, integrity: 99, consistency: 97, timeliness: 98, accuracy: 98 },
  { id: 'DS-009', name: '企业历史交易记录', quality: 95, integrity: 96, consistency: 94, timeliness: 95, accuracy: 96 },
  { id: 'DS-010', name: '国际物流轨迹数据', quality: 87, integrity: 88, consistency: 85, timeliness: 82, accuracy: 90 },
  { id: 'DS-004', name: '阿里巴巴国际站供需数据', quality: 93, integrity: 94, consistency: 92, timeliness: 93, accuracy: 94 },
  { id: 'DS-011', name: '汇率行情数据', quality: 99, integrity: 99, consistency: 99, timeliness: 99, accuracy: 99 },
  { id: 'DS-007', name: '全球贸易舆情NLP监测', quality: 91, integrity: 92, consistency: 90, timeliness: 88, accuracy: 93 },
  { id: 'DS-005', name: '邓白氏企业信用API', quality: 84, integrity: 86, consistency: 83, timeliness: 80, accuracy: 88 },
  { id: 'DS-003', name: '欧盟官方公报(OJ)贸易防卫', quality: 94, integrity: 95, consistency: 93, timeliness: 92, accuracy: 94 },
]

export const QUALITY_TREND = [
  { date: '06-26', score: 93.2 }, { date: '06-27', score: 93.8 }, { date: '06-28', score: 92.5 },
  { date: '06-29', score: 94.1 }, { date: '06-30', score: 95.0 }, { date: '07-01', score: 95.6 },
  { date: '07-02', score: 96.8 },
]

export const STORAGE_STRATEGIES = [
  { id: 'ST-001', name: '贸易明细热存储', tier: 'hot', dataType: '报关单明细', retention: 90, archiveDays: 90, backup: 'daily', usage: 2.8, unit: 'TB', status: 'active' },
  { id: 'ST-002', name: '物流轨迹温存储', tier: 'warm', dataType: '物流轨迹', retention: 180, archiveDays: 180, backup: 'daily', usage: 1.5, unit: 'TB', status: 'active' },
  { id: 'ST-003', name: '政策公告冷归档', tier: 'cold', dataType: '政策文件', retention: 365, archiveDays: 365, backup: 'weekly', usage: 0.6, unit: 'TB', status: 'active' },
  { id: 'ST-004', name: '汇率行情混合策略', tier: 'hybrid', dataType: '金融行情', retention: 60, archiveDays: 120, backup: 'hourly', usage: 0.3, unit: 'TB', status: 'active' },
]

export const STORAGE_USAGE = [
  { type: '热存储', value: 2.8 }, { type: '温存储', value: 1.5 },
  { type: '冷存储', value: 0.6 }, { type: '归档', value: 0.4 },
]

export const CLEANING_PIPELINE = [
  {
    id: 'step-1', name: '去重与合并', key: 'dedup', enabled: true, order: 1,
    desc: '基于统一社会信用代码/注册号精确匹配 + 实体消歧相似度融合',
    config: { matchField: 'creditCode', similarityThreshold: 0.92, strategy: 'merge' },
    processed: 1286, removed: 342,
  },
  {
    id: 'step-2', name: '缺失值处理', key: 'missing', enabled: true, order: 2,
    desc: '按字段重要性配置删除/均值填充/模型预测填充策略',
    config: { defaultStrategy: 'median', fields: { amount: 'predict', region: 'constant' } },
    processed: 944, filled: 218,
  },
  {
    id: 'step-3', name: '异常值检测与修正', key: 'outlier', enabled: true, order: 3,
    desc: '3σ原则 + 孤立森林多维异常检测，支持删除/修正/保留',
    config: { method: 'isolation_forest', sigma: 3, action: 'mark' },
    processed: 944, outliers: 47,
  },
  {
    id: 'step-4', name: '格式标准化', key: 'format', enabled: true, order: 4,
    desc: 'ISO8601日期、USD基准币种、ISO国家编码、单位换算',
    config: { dateFormat: 'ISO8601', currency: 'USD', countryCode: 'ISO3166' },
    processed: 897, converted: 897,
  },
  {
    id: 'step-5', name: '文本清洗', key: 'text', enabled: true, order: 5,
    desc: '分词、去停用词、NER提取公司/产品/地名实体',
    config: { nlp: true, ner: ['ORG', 'PRODUCT', 'GPE'], lang: 'zh,en' },
    processed: 5680, entities: 1240,
  },
]

export const BEFORE_AFTER_SAMPLES = [
  {
    id: 'S-001', field: '企业名称', before: '华贸进出口集团(深圳)有限公司 ', after: '华贸进出口集团(深圳)有限公司',
    step: '去重与合并', status: 'fixed',
  },
  {
    id: 'S-002', field: '出口金额', before: '1280000 RMB', after: '179775.28 USD',
    step: '格式标准化', status: 'fixed',
  },
  {
    id: 'S-003', field: 'HS编码', before: '8708', after: '8708.99.00',
    step: '格式标准化', status: 'fixed',
  },
  {
    id: 'S-004', field: '目的国', before: 'USA', after: 'US',
    step: '格式标准化', status: 'fixed',
  },
  {
    id: 'S-005', field: '采购商信用分', before: null, after: '86（模型预测填充）',
    step: '缺失值处理', status: 'filled',
  },
  {
    id: 'S-006', field: '交易金额', before: '999999999', after: '标记异常（3σ偏离）',
    step: '异常值检测', status: 'outlier',
  },
  {
    id: 'S-007', field: '政策文本', before: 'The EU imposed anti-dumping duties...',
    after: '实体: [EU/ORG] [anti-dumping/TERM] [steel/PRODUCT]',
    step: '文本清洗', status: 'fixed',
  },
]

export const OUTLIER_RECORDS = [
  { id: 'O-001', sourceId: 'DS-010', field: '交易金额', value: '999999999', reason: '3σ极端偏离，疑似单位混淆', action: 'pending' },
  { id: 'O-002', sourceId: 'DS-010', field: '出口量', value: '-1200', reason: '负值异常，疑似录入错误', action: 'pending' },
  { id: 'O-003', sourceId: 'DS-001', field: '单价', value: '0.001', reason: '孤立森林多维异常', action: 'corrected' },
]

export const FEATURE_RULES = [
  { id: 'FR-001', name: '公司存续年限', source: '成立日期', formula: '当前日期 - 成立日期', status: 'active' },
  { id: 'FR-002', name: '流动性指标', source: '流动比率,速动比率', formula: '加权综合评分', status: 'active' },
  { id: 'FR-003', name: '产品材质标签', source: '产品描述文本', formula: 'NLP标签抽取', status: 'active' },
  { id: 'FR-004', name: '海关-信用关联', source: '出口商ID + 邓白氏ID', formula: '注册号关联', status: 'active' },
]

export const DATA_LINEAGE = [
  { step: 1, stage: '数据采集', node: '海关总署进出口数据', detail: 'DS-001 · API采集 · 12580条', time: '2026-07-02 10:02' },
  { step: 2, stage: '原始存储', node: 'Kafka原始Topic', detail: 'trade.raw.customs · 86.5MB', time: '2026-07-02 10:02' },
  { step: 3, stage: '清洗流水线', node: '去重→缺失→异常→格式→文本', detail: 'Pipeline v2.3 · 5步', time: '2026-07-02 10:15' },
  { step: 4, stage: '特征工程', node: '衍生特征计算', detail: '4条规则 · 新增12字段', time: '2026-07-02 10:18' },
  { step: 5, stage: '质量评估', node: '质量评分 96.8', detail: '完整性99 · 一致性97 · 准确性98', time: '2026-07-02 10:20' },
  { step: 6, stage: '分析层存储', node: 'ClickHouse温数据', detail: 'trade.clean.customs · 897条', time: '2026-07-02 10:22' },
]

export const QUALITY_REPORT = {
  before: { integrity: 88, accuracy: 85, consistency: 82, timeliness: 90, overall: 86.2 },
  after: { integrity: 99, accuracy: 98, consistency: 97, timeliness: 98, overall: 98.0 },
  recordCount: { before: 12580, after: 897, deduped: 342, filled: 218, outliers: 47 },
}

export const STORAGE_TIERS = [
  {
    tier: 'hot', label: '热数据 / 实时层', engine: 'Redis + MongoDB',
    desc: '实时查询、在线监控、高频交互', capacity: 2.8, total: 4.0, unit: 'TB',
    usagePercent: 70, latency: '<10ms', scenarios: '汇率行情、物流轨迹实时查询',
  },
  {
    tier: 'warm', label: '温数据 / 分析层', engine: 'ClickHouse + Snowflake',
    desc: 'OLAP分析、历史趋势、多维切片', capacity: 1.5, total: 3.0, unit: 'TB',
    usagePercent: 50, latency: '<3s', scenarios: '商机评估、市场分析',
  },
  {
    tier: 'cold', label: '冷数据 / 归档层', engine: '阿里云OSS + HDFS',
    desc: '长期归档、审计回溯、法规遵从', capacity: 1.0, total: 5.0, unit: 'TB',
    usagePercent: 20, latency: '分钟级', scenarios: '政策文件、历史日志',
  },
]

export const STORAGE_CAPACITY_TREND = [
  { month: '1月', hot: 2.1, warm: 1.0, cold: 0.4 },
  { month: '2月', hot: 2.3, warm: 1.1, cold: 0.5 },
  { month: '3月', hot: 2.5, warm: 1.2, cold: 0.5 },
  { month: '4月', hot: 2.6, warm: 1.3, cold: 0.6 },
  { month: '5月', hot: 2.7, warm: 1.4, cold: 0.7 },
  { month: '6月', hot: 2.8, warm: 1.5, cold: 1.0 },
]

export const LIFECYCLE_POLICIES = [
  { id: 'LC-001', name: '原始日志策略', dataType: '采集日志', retain: 30, compress: 30, archive: 365, delete: 1825, status: 'active' },
  { id: 'LC-002', name: '清洗中间数据', dataType: 'Pipeline中间表', retain: 7, compress: 7, archive: 90, delete: 365, status: 'active' },
  { id: 'LC-003', name: '分析结果数据', dataType: '商机评估结果', retain: 180, compress: 90, archive: 730, delete: 0, status: 'active' },
]

export const BACKUP_JOBS = [
  { id: 'BK-001', name: '全量备份-热存储', type: 'full', schedule: '每日 02:00', lastRun: '2026-07-02 02:00', status: 'success', size: '2.8TB' },
  { id: 'BK-002', name: '增量备份-温数据', type: 'incremental', schedule: '每6小时', lastRun: '2026-07-02 10:00', status: 'success', size: '156GB' },
  { id: 'BK-003', name: '冷归档快照', type: 'snapshot', schedule: '每周日', lastRun: '2026-06-30 03:00', status: 'success', size: '1.0TB' },
  { id: 'BK-004', name: '配置元数据备份', type: 'incremental', schedule: '每小时', lastRun: '2026-07-02 10:00', status: 'running', size: '—' },
]

export const SECURITY_POLICIES = [
  { id: 'SEC-001', name: '传输加密', value: 'TLS 1.3', status: 'enabled' },
  { id: 'SEC-002', name: '静态加密', value: 'AES-256', status: 'enabled' },
  { id: 'SEC-003', name: '行级访问控制', value: 'RBAC · 6角色', status: 'enabled' },
  { id: 'SEC-004', name: '列级脱敏', value: '手机号/信用代码掩码', status: 'enabled' },
  { id: 'SEC-005', name: '开发环境脱敏', value: '自动脱敏副本', status: 'enabled' },
]

/** 多模存储形式 · 关系型/NoSQL/分布式文件/对象存储 */
export const STORAGE_MODALITIES = [
  { key: 'relational', label: '关系型数据库', engines: 'PostgreSQL · MySQL', useCase: '结构化主数据、配置元数据', tier: 'warm' },
  { key: 'nosql', label: 'NoSQL 数据库', engines: 'MongoDB · Redis', useCase: '文档型、键值型、实时热数据', tier: 'hot' },
  { key: 'warehouse', label: '分布式数仓', engines: 'ClickHouse · Snowflake', useCase: 'OLAP 分析、温数据主题库', tier: 'warm' },
  { key: 'object', label: '对象存储', engines: '阿里云 OSS · AWS S3', useCase: '冷归档、大文件、政策文档', tier: 'cold' },
  { key: 'dfs', label: '分布式文件系统', engines: 'HDFS · MinIO', useCase: '批量离线、日志归档、审计回溯', tier: 'cold' },
]

export const CAPACITY_FORECAST = [
  { month: '7月', hot: 2.9, warm: 1.6, cold: 1.1, type: '实际' },
  { month: '8月', hot: 3.1, warm: 1.8, cold: 1.2, type: '预测' },
  { month: '9月', hot: 3.3, warm: 2.0, cold: 1.3, type: '预测' },
  { month: '10月', hot: 3.5, warm: 2.2, cold: 1.4, type: '预测' },
]

export const CAPACITY_ALERTS = [
  { id: 'CA-001', tier: 'hot', level: 'warning', message: '热存储使用率 70%，预计 8 月达 85% 预警线', threshold: 85, current: 70 },
  { id: 'CA-002', tier: 'warm', level: 'info', message: '温数据层增长平稳，建议关注 ClickHouse 分区扩展', threshold: 80, current: 50 },
]

export const MASKING_RULES = [
  { id: 'MK-001', field: '手机号', method: '中间4位掩码', example: '138****5678', scope: '开发/测试环境', status: 'active' },
  { id: 'MK-002', field: '统一社会信用代码', method: '部分掩码', example: '914403**********', scope: '非授权角色', status: 'active' },
  { id: 'MK-003', field: '企业银行账户', method: '仅保留后4位', example: '************1234', scope: '演示环境', status: 'active' },
  { id: 'MK-004', field: '买家联系人邮箱', method: '用户名掩码', example: 'a***@example.com', scope: '分析沙箱', status: 'active' },
]

export const STORAGE_INGRESS_FLOW = [
  { step: 1, stage: '清洗产出', node: 'trade.clean.*', detail: '897 条可用记录 · 质量分 98.0', route: '/data/quality?tab=report' },
  { step: 2, stage: '分层路由', node: '存储策略引擎', detail: '按数据类型自动分配热/温/冷层', route: '/data/storage?tab=architecture' },
  { step: 3, stage: '热层写入', node: 'Redis + MongoDB', detail: '实时指标 · 物流轨迹 · 汇率行情', route: '/data/storage?tab=architecture' },
  { step: 4, stage: '温层写入', node: 'ClickHouse 主题库', detail: '商机池 · 企业画像 · 分析主题表', route: '/data/storage?tab=capacity' },
  { step: 5, stage: '冷层归档', node: 'OSS + HDFS', detail: '政策文件 · 历史日志 · 审计快照', route: '/data/storage?tab=lifecycle' },
  { step: 6, stage: '业务读取', node: '模型/商机/分析/风险', detail: '授权角色按行级/列级访问', route: '/data/models' },
]

export const BACKUP_SCHEDULE_PRESETS = [
  { label: '每日全量', type: 'full', schedule: '每日 02:00', tier: 'hot' },
  { label: '每6小时增量', type: 'incremental', schedule: '每6小时', tier: 'warm' },
  { label: '每周快照', type: 'snapshot', schedule: '每周日 03:00', tier: 'cold' },
]

export function getStatusTag(status) {
  const map = {
    running: { color: 'success', text: '运行中' },
    warning: { color: 'warning', text: '异常' },
    stopped: { color: 'default', text: '已停止' },
  }
  return map[status] || { color: 'default', text: status }
}

export function getTypeLabel(type) {
  const map = {
    api: 'API接口',
    crawler: '网络爬虫',
    database: '数据库',
    file: '文件/FTP',
    stream: '消息流',
  }
  return map[type] || type
}

export function getCategoryLabel(category) {
  const map = {
    official: '官方与机构',
    commercial: '商业与平台',
    sentiment: '市场与舆情',
    internal: '企业内部',
  }
  return map[category] || category
}

export function getHealthColor(health) {
  const map = { green: '#52c41a', yellow: '#faad14', red: '#ff4d4f' }
  return map[health] || '#d9d9d9'
}

export function getQuotaPercent(used, quota) {
  if (!quota) return 0
  return Math.round((used / quota) * 1000) / 10
}

export function isQuotaWarning(used, quota, threshold) {
  if (!quota || !threshold) return false
  return getQuotaPercent(used, quota) >= threshold
}

/** 免费或企业内部数据源：配置只读，仅允许启停 */
export function isFreeOrInternalSource(record) {
  if (!record) return false
  return record.category === 'internal' || !record.paidApi
}

export function getLogStatusTag(status) {
  const map = {
    success: { color: 'success', text: '成功' },
    warning: { color: 'warning', text: '警告' },
    failed: { color: 'error', text: '失败' },
  }
  return map[status] || { color: 'default', text: status }
}

const TASK_STATUS_LABEL = {
  running: { color: 'success', text: '运行中' },
  warning: { color: 'warning', text: '异常' },
  waiting: { color: 'default', text: '等待中' },
}

const STAGE_STATUS_LABEL = {
  done: { color: 'success', text: '已完成' },
  running: { color: 'processing', text: '进行中' },
  warning: { color: 'warning', text: '异常' },
  pending: { color: 'default', text: '待执行' },
}

export function getTaskStatusTag(status) {
  return TASK_STATUS_LABEL[status] || { color: 'default', text: status }
}

export function getStageStatusTag(status) {
  return STAGE_STATUS_LABEL[status] || { color: 'default', text: status }
}

export function getCollectionTaskById(taskId) {
  return TASK_QUEUE.find((t) => t.id === taskId) || null
}

function buildTaskStages(task) {
  if (task.status === 'waiting') {
    return [
      { key: 'connect', name: '资源检查', status: 'pending', time: '—', detail: task.waitReason || '等待调度窗口' },
      { key: 'fetch', name: '数据拉取', status: 'pending', time: '—', detail: '等待上一任务释放资源' },
      { key: 'validate', name: '格式校验', status: 'pending', time: '—', detail: '—' },
      { key: 'store', name: '写入缓冲池', status: 'pending', time: '—', detail: '—' },
    ]
  }

  const fetchStatus = task.status === 'warning' ? 'warning' : task.progress < 100 ? 'running' : 'done'
  const validateStatus = task.progress >= 85 && task.progress < 100 ? 'running' : task.progress >= 100 ? 'done' : 'pending'
  const storeStatus = task.progress >= 100 ? 'running' : 'pending'

  return [
    { key: 'connect', name: '连接数据源', status: 'done', time: task.startTime?.slice(-8) || '—', detail: `工作节点 ${task.workerNode || '—'}` },
    { key: 'fetch', name: '拉取数据', status: fetchStatus, time: fetchStatus === 'running' ? '进行中' : '—', detail: task.lastError || `进度 ${task.progress}% · ${task.throughput}` },
    { key: 'validate', name: '格式校验', status: validateStatus, time: validateStatus === 'running' ? '进行中' : '—', detail: validateStatus === 'pending' ? '等待拉取完成' : '字段映射与完整性检查' },
    { key: 'store', name: '写入缓冲池', status: storeStatus, time: storeStatus === 'running' ? '进行中' : '—', detail: storeStatus === 'pending' ? '等待校验通过' : '写入采集缓冲池，待清洗调度' },
  ]
}

export function getCollectionTaskDetail(taskId) {
  const task = getCollectionTaskById(taskId)
  if (!task) return null

  const source = INITIAL_DATA_SOURCES.find((d) => d.id === task.sourceId) || null
  const logs = COLLECTION_LOGS.filter((l) => l.sourceId === task.sourceId)
    .sort((a, b) => (b.startTime || '').localeCompare(a.startTime || ''))
  const alerts = MONITOR_ALERTS.filter((a) => a.sourceId === task.sourceId)
  const recentTrend = MONITOR_TREND.today.slice(-6).map((item) => ({
    time: item.time,
    value: Math.round(item.value * (0.08 + (task.id.charCodeAt(3) % 5) * 0.02)),
  }))

  return {
    task: { ...task, stages: buildTaskStages(task) },
    source,
    logs,
    alerts,
    recentTrend,
    summary: {
      successRate: source ? `${(100 - source.failRate).toFixed(1)}%` : '—',
      todayVolume: source ? `${source.todayVolume} 万条` : '—',
      latency: source ? `${source.latency}s` : '—',
      owner: source?.owner || '—',
    },
  }
}

/** 将批次 ID 或数据源 ID 解析为清洗批次（预警/监控跳转用） */
export function resolveCleaningBatch(ref, batches = CLEANING_BATCHES) {
  if (!ref) return null
  const byId = batches.find((b) => b.id === ref)
  if (byId) return byId
  const bySource = batches.filter((b) => b.sourceId === ref)
  if (!bySource.length) return null
  const priority = { warning: 0, ready: 1, processing: 2 }
  return [...bySource].sort((a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9))[0]
}

export function getSourceNameById(sourceId) {
  return INITIAL_DATA_SOURCES.find((d) => d.id === sourceId)?.name || sourceId
}

/** 采集预警 → 数据清洗 跳转 URL（自动关联 source 与 batch） */
export function buildQualityCleanUrl({ sourceId, from = 'alert', tab = 'pipeline' } = {}) {
  if (!sourceId) return '/data/quality?tab=pipeline'
  const batch = resolveCleaningBatch(sourceId)
  const params = new URLSearchParams({ tab, source: sourceId })
  if (from) params.set('from', from)
  if (batch) params.set('batch', batch.id)
  return `/data/quality?${params.toString()}`
}
