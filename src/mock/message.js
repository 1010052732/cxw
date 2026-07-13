export const MESSAGE_CATEGORIES = [
  { value: 'all', label: '全部消息' },
  { value: 'system', label: '系统通知' },
  { value: 'business', label: '业务提醒' },
  { value: 'risk', label: '风险预警' },
  { value: 'data', label: '数据告警' },
]

export const INITIAL_MESSAGES = [
  {
    id: 'MSG-001', title: '商机评估完成', category: 'business', type: 'success',
    read: false, time: '2026-07-02 09:30',
    content: '越南热带水果冷链进口（OP-2026-001）评估已完成，综合得分 92 分，建议重点跟进。',
    sender: '商机识别系统',
  },
  {
    id: 'MSG-002', title: '数据源采集异常', category: 'data', type: 'warning',
    read: false, time: '2026-07-02 08:15',
    content: '国际物流轨迹数据（DS-003）API 响应超时，已触发自动重试机制，请关注采集监控仪表盘。',
    sender: '数据采集平台',
  },
  {
    id: 'MSG-003', title: '风险预警升级', category: 'risk', type: 'error',
    read: false, time: '2026-07-01 17:42',
    content: '中东航线大面积延误风险等级升级为「高」，涉及 3 条在途订单，请及时处置。',
    sender: '风险防控系统',
  },
  {
    id: 'MSG-004', title: '系统维护通知', category: 'system', type: 'info',
    read: true, time: '2026-07-01 10:00',
    content: '平台将于 2026-07-05 02:00-04:00 进行例行维护，期间部分功能可能不可用。',
    sender: '系统管理员',
  },
  {
    id: 'MSG-005', title: '新商机发现提醒', category: 'business', type: 'success',
    read: true, time: '2026-06-30 16:20',
    content: '智能挖掘方案发现 3 条潜在新商机，匹配度均高于 85 分，请前往商机大厅查看。',
    sender: '商机识别系统',
  },
  {
    id: 'MSG-006', title: '数据质量规则命中', category: 'data', type: 'warning',
    read: true, time: '2026-06-30 14:05',
    content: 'HS编码格式校验规则命中 7 次，涉及企业报关单明细数据源，请在质量工作台处理。',
    sender: '数据质量引擎',
    linkPath: '/data/quality?tab=rules',
  },
  {
    id: 'MSG-007', title: '评估报告已生成', category: 'business', type: 'success',
    read: true, time: '2026-06-29 11:30',
    content: '德国工业传感器ODM合作（OP-2026-012）评估报告已生成，报告编号 OP-2026-012。',
    sender: '商机识别系统',
  },
  {
    id: 'MSG-008', title: '汇率波动预警', category: 'risk', type: 'warning',
    read: true, time: '2026-06-28 09:15',
    content: 'EUR/CNY 近7日波动超过 3%，建议对欧洲方向订单启用远期锁汇。',
    sender: '风险防控系统',
  },
  {
    id: 'MSG-009', title: '采集任务完成', category: 'data', type: 'success',
    read: true, time: '2026-06-28 06:05',
    content: 'RCEP关税优惠数据（DS-004）每日采集任务已完成，共采集 12.4 万条记录。',
    sender: '数据采集平台',
  },
  {
    id: 'MSG-010', title: '账号安全提醒', category: 'system', type: 'info',
    read: true, time: '2026-06-27 08:00',
    content: '您的账号于 2026-06-26 22:15 在新设备登录，如非本人操作请及时修改密码。',
    sender: '系统管理员',
  },
]

export const typeIcon = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'processing',
}

export const categoryColor = {
  system: '#1677ff',
  business: '#B32620',
  risk: '#ff4d4f',
  data: '#faad14',
}
