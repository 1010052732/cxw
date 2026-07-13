import {
  ENTERPRISE_GEO_SEED,
  applyGeoLocation,
  formatGeoLocation,
  matchesGeoFilter,
} from './geo'

export const MARKET_COUNTRIES = [
  { value: 'germany', label: '德国' },
  { value: 'usa', label: '美国' },
  { value: 'asean', label: '东南亚' },
  { value: 'japan', label: '日本' },
  { value: 'brazil', label: '巴西' },
]

export const TIME_PERIODS = [
  { value: '1d', label: '日' },
  { value: '1m', label: '月' },
  { value: '1q', label: '季' },
  { value: '6m', label: '近半年' },
  { value: '1y', label: '年' },
  { value: '10y', label: '近10年' },
]

export const MAP_LAYERS = [
  { key: 'trade', label: '贸易流量', default: true },
  { key: 'gdp', label: 'GDP密度', default: true },
  { key: 'population', label: '人口热力', default: false },
  { key: 'nightlight', label: '夜间灯光', default: false },
  { key: 'infra', label: '基础设施', default: false },
  { key: 'industry', label: '产业聚集', default: false },
  { key: 'ftz', label: '自贸区', default: false },
  { key: 'risk', label: '政治风险', default: false },
  { key: 'climate', label: '气候风险', default: false },
]

export const PRODUCT_CATEGORIES = [
  { value: 'vehicle', label: '乘用车' },
  { value: 'machinery', label: '机电设备' },
  { value: 'electronics', label: '消费电子' },
  { value: 'agri', label: '农产品' },
]

export const MARKET_EXTENDED = {
  germany: {
    continent: '欧洲',
    mapCenter: { x: 48, y: 28 },
    regions: [
      { id: 'de-by', name: '巴伐利亚', x: 52, y: 32, snapshot: { gdp: '6,900亿EUR', population: '1310万', import: '892亿', export: '1024亿', lpi: 4.2, business: 82 } },
      { id: 'de-nw', name: '北威州', x: 46, y: 26, snapshot: { gdp: '7,800亿EUR', population: '1790万', import: '1120亿', export: '986亿', lpi: 4.1, business: 80 } },
      { id: 'de-bw', name: '巴符州', x: 50, y: 30, snapshot: { gdp: '5,600亿EUR', population: '1110万', import: '756亿', export: '890亿', lpi: 4.3, business: 84 } },
    ],
    timeline: [
      { year: 2015, label: '2015', value: 2680, event: '难民危机冲击消费' },
      { year: 2018, label: '2018', value: 2920, event: '中美贸易摩擦间接影响出口' },
      { year: 2020, label: '2020', value: 2750, event: '疫情供应链中断' },
      { year: 2022, label: '2022', value: 3050, event: '能源危机推高成本' },
      { year: 2024, label: '2024', value: 3180, event: '绿色转型投资加速' },
      { year: 2026, label: '2026', value: 3280, event: 'CBAM正式实施' },
    ],
    keyEvents: [
      { date: '2026-05', title: 'CBAM正式实施', type: 'policy', impact: '高' },
      { date: '2022-03', title: '俄乌冲突能源冲击', type: 'shock', impact: '高' },
      { date: '2020-04', title: '疫情封锁', type: 'shock', impact: '高' },
    ],
    demandSegments: {
      vehicle: {
        byType: [{ name: 'SUV', share: 38, growth: 12 }, { name: '轿车', share: 32, growth: -2 }, { name: 'MPV', share: 8, growth: 3 }],
        byPrice: [{ name: '豪华', share: 22, growth: 8 }, { name: '中高端', share: 45, growth: 5 }, { name: '经济型', share: 33, growth: -1 }],
        byPower: [{ name: '燃油', share: 52, growth: -8 }, { name: '混动', share: 28, growth: 18 }, { name: '纯电', share: 20, growth: 35 }],
        byChannel: [
          { name: '4S店/经销商', share: 44, growth: 2 },
          { name: '平行进口', share: 10, growth: -3 },
          { name: '线上渠道', share: 26, growth: 16 },
          { name: 'B2B平台', share: 20, growth: 10 },
        ],
        sentiment: [
          { topic: '价格敏感度', score: 74, trend: '上升', source: 'Euromonitor' },
          { topic: '充电网络', score: 68, trend: '关注', source: '社媒情感' },
          { topic: '品牌偏好', score: 62, trend: '稳定', source: '消费者调研' },
        ],
        insights: ['纯电渗透率加速', '价格敏感度上升', '售后与充电网络成关键'],
      },
      machinery: {
        byType: [{ name: '数控机床', share: 35, growth: 6 }, { name: '工业机器人', share: 28, growth: 14 }, { name: '通用机械', share: 37, growth: 3 }],
        insights: ['工业4.0升级驱动', '精度与能效为采购核心'],
      },
    },
    supply: {
      localProduction: '本土制造占68%，进口依赖度32%',
      capacity: '产能利用率 78%，技术水平领先',
      importDependency: '高端零部件进口依赖度 45%',
      producers: [
        { name: '西门子', share: '18%', capacity: '高' },
        { name: '博世', share: '15%', capacity: '高' },
        { name: '本土中小企', share: '42%', capacity: '中' },
      ],
    },
    valueChain: [
      { stage: '原材料', players: '钢铁、稀土、化工', margin: '12%', risk: '中' },
      { stage: '零部件', players: '精密加工、电子元件', margin: '22%', risk: '中' },
      { stage: '制造装配', players: 'OEM/ODM工厂', margin: '18%', risk: '低' },
      { stage: '分销零售', players: '4S/贸易商/B2B平台', margin: '15%', risk: '低' },
    ],
    heatmapCells: [
      { id: 'de-nw', label: '北威州', x: 38, y: 22, w: 18, h: 22, trade: 92, gdp: 90, risk: 32, climate: 38, infra: 94, industry: 88 },
      { id: 'de-by', label: '巴伐利亚', x: 52, y: 30, w: 16, h: 20, trade: 88, gdp: 94, risk: 28, climate: 35, infra: 90, industry: 92 },
      { id: 'de-bw', label: '巴符州', x: 48, y: 26, w: 15, h: 18, trade: 85, gdp: 91, risk: 30, climate: 36, infra: 88, industry: 90 },
      { id: 'de-north', label: '北部沿海', x: 44, y: 16, w: 20, h: 16, trade: 78, gdp: 72, risk: 35, climate: 52, infra: 86, industry: 68 },
      { id: 'de-east', label: '东部', x: 58, y: 24, w: 16, h: 18, trade: 62, gdp: 58, risk: 42, climate: 40, infra: 74, industry: 62 },
    ],
  },
  usa: {
    continent: '北美洲',
    mapCenter: { x: 22, y: 38 },
    regions: [
      { id: 'us-ca', name: '加利福尼亚', x: 12, y: 42, snapshot: { gdp: '3.9万亿USD', population: '3950万', import: '4520亿', export: '2100亿', lpi: 3.9, business: 77 } },
      { id: 'us-tx', name: '德克萨斯', x: 28, y: 48, snapshot: { gdp: '2.4万亿USD', population: '3000万', import: '3280亿', export: '3850亿', lpi: 3.8, business: 79 } },
    ],
    timeline: [
      { year: 2015, label: '2015', value: 4200, event: 'TPP谈判期' },
      { year: 2018, label: '2018', value: 4450, event: '301关税启动' },
      { year: 2020, label: '2020', value: 4100, event: '疫情需求波动' },
      { year: 2022, label: '2022', value: 4580, event: '通胀削减法案' },
      { year: 2026, label: '2026', value: 4860, event: '半导体管制延续' },
    ],
    keyEvents: [{ date: '2026-05', title: '301关税复审', type: 'policy', impact: '高' }],
    demandSegments: {
      vehicle: {
        byType: [{ name: '皮卡/SUV', share: 48, growth: 8 }, { name: '轿车', share: 28, growth: -5 }],
        byPower: [{ name: '燃油', share: 68, growth: -6 }, { name: '纯电', share: 14, growth: 28 }],
        insights: ['本土化要求提升', '渠道向DTC转移'],
      },
    },
    supply: { localProduction: '本土制造占72%', capacity: '产能利用率 81%', importDependency: '消费电子进口依赖 58%', producers: [{ name: '北美OEM', share: '35%', capacity: '高' }] },
    valueChain: [
      { stage: '研发设计', players: '硅谷/底特律', margin: '28%', risk: '低' },
      { stage: '制造', players: '墨西哥+美国工厂', margin: '16%', risk: '中' },
      { stage: '分销', players: 'Costco/Amazon/经销商', margin: '14%', risk: '低' },
    ],
    heatmapCells: [
      { id: 'us-west', label: '西海岸', x: 8, y: 38, w: 16, h: 22, trade: 95, gdp: 96, risk: 38, climate: 58, infra: 88, industry: 92 },
      { id: 'us-tx', label: '德州', x: 22, y: 48, w: 18, h: 20, trade: 88, gdp: 82, risk: 42, climate: 62, infra: 80, industry: 78 },
      { id: 'us-mw', label: '中西部', x: 26, y: 34, w: 18, h: 20, trade: 72, gdp: 74, risk: 35, climate: 48, infra: 76, industry: 82 },
      { id: 'us-east', label: '东海岸', x: 32, y: 28, w: 16, h: 22, trade: 90, gdp: 88, risk: 40, climate: 52, infra: 92, industry: 85 },
      { id: 'us-south', label: '南部', x: 24, y: 52, w: 18, h: 18, trade: 68, gdp: 65, risk: 48, climate: 72, infra: 70, industry: 62 },
    ],
  },
  asean: {
    continent: '亚洲',
    mapCenter: { x: 72, y: 52 },
    regions: [
      { id: 'asean-vn', name: '越南', x: 70, y: 50, snapshot: { gdp: '4300亿USD', population: '9900万', import: '3680亿', export: '3710亿', lpi: 3.6, business: 71 } },
      { id: 'asean-id', name: '印尼', x: 74, y: 58, snapshot: { gdp: '1.4万亿USD', population: '2.78亿', import: '2120亿', export: '2580亿', lpi: 3.3, business: 67 } },
    ],
    timeline: [
      { year: 2015, label: '2015', value: 980, event: 'RCEP谈判' },
      { year: 2020, label: '2020', value: 1120, event: '产业链转移' },
      { year: 2022, label: '2022', value: 1380, event: 'RCEP生效' },
      { year: 2026, label: '2026', value: 1650, event: '数字贸易协定推进' },
    ],
    keyEvents: [{ date: '2022-01', title: 'RCEP生效', type: 'policy', impact: '高' }],
    demandSegments: {
      electronics: {
        byType: [{ name: '智能手机', share: 42, growth: 15 }, { name: '可穿戴', share: 18, growth: 22 }],
        insights: ['年轻人口红利', '线上渠道占比超60%'],
      },
    },
    supply: { localProduction: '加工贸易为主', capacity: '产能扩张中', importDependency: '芯片依赖进口', producers: [{ name: '三星/富士康系', share: '28%', capacity: '高' }] },
    valueChain: [
      { stage: '组装制造', players: '越泰印尼工厂', margin: '10%', risk: '中' },
      { stage: '出口转运', players: '新加坡/香港枢纽', margin: '8%', risk: '低' },
    ],
    heatmapCells: [
      { id: 'asean-vn', label: '越南', x: 68, y: 46, w: 16, h: 20, trade: 86, gdp: 72, risk: 42, climate: 58, infra: 68, industry: 82 },
      { id: 'asean-id', label: '印尼', x: 72, y: 54, w: 18, h: 22, trade: 78, gdp: 68, risk: 48, climate: 62, infra: 62, industry: 74 },
      { id: 'asean-th', label: '泰国', x: 66, y: 50, w: 14, h: 18, trade: 82, gdp: 74, risk: 38, climate: 55, infra: 75, industry: 78 },
      { id: 'asean-sg', label: '新加坡', x: 74, y: 52, w: 10, h: 12, trade: 95, gdp: 92, risk: 22, climate: 48, infra: 96, industry: 88 },
      { id: 'asean-my', label: '马来西亚', x: 70, y: 48, w: 14, h: 16, trade: 76, gdp: 70, risk: 40, climate: 60, infra: 72, industry: 76 },
      { id: 'asean-hub', label: '区域枢纽', x: 58, y: 38, w: 20, h: 18, trade: 88, gdp: 65, risk: 45, climate: 52, infra: 80, industry: 70 },
    ],
  },
  japan: {
    continent: '亚洲',
    mapCenter: { x: 82, y: 36 },
    regions: [
      { id: 'jp-kanto', name: '关东', x: 84, y: 38, snapshot: { gdp: '2.0万亿USD', population: '4400万', import: '9800亿', export: '9200亿', lpi: 4.0, business: 81 } },
      { id: 'jp-kansai', name: '关西', x: 80, y: 40, snapshot: { gdp: '1.0万亿USD', population: '2100万', import: '4200亿', export: '5100亿', lpi: 4.1, business: 79 } },
    ],
    timeline: [
      { year: 2015, label: '2015', value: 4200, event: '安倍经济学延续' },
      { year: 2020, label: '2020', value: 3950, event: '疫情冲击消费' },
      { year: 2022, label: '2022', value: 4100, event: '半导体补贴启动' },
      { year: 2026, label: '2026', value: 4380, event: '高端制造回流' },
    ],
    keyEvents: [{ date: '2026-03', title: '半导体设备出口管制调整', type: 'policy', impact: '高' }],
    demandSegments: {
      electronics: {
        byType: [{ name: '半导体设备', share: 36, growth: 12 }, { name: '消费电子', share: 28, growth: 4 }],
        insights: ['高端制造需求稳定', '老龄化驱动医疗进口'],
      },
    },
    supply: { localProduction: '本土制造占75%', capacity: '产能利用率 79%', importDependency: '能源与稀土依赖进口', producers: [{ name: '丰田/索尼系', share: '22%', capacity: '高' }] },
    valueChain: [
      { stage: '研发', players: '东京/大阪', margin: '30%', risk: '低' },
      { stage: '精密制造', players: '本土工厂', margin: '20%', risk: '中' },
    ],
    heatmapCells: [
      { id: 'jp-kanto', label: '关东', x: 78, y: 32, w: 18, h: 22, trade: 92, gdp: 95, risk: 28, climate: 45, infra: 94, industry: 90 },
      { id: 'jp-kansai', label: '关西', x: 72, y: 38, w: 16, h: 20, trade: 85, gdp: 88, risk: 30, climate: 42, infra: 90, industry: 86 },
      { id: 'jp-kyushu', label: '九州', x: 68, y: 44, w: 14, h: 18, trade: 72, gdp: 70, risk: 35, climate: 48, infra: 82, industry: 78 },
      { id: 'jp-tohoku', label: '东北', x: 82, y: 28, w: 14, h: 18, trade: 58, gdp: 62, risk: 52, climate: 68, infra: 75, industry: 65 },
    ],
  },
  brazil: {
    continent: '南美洲',
    mapCenter: { x: 28, y: 62 },
    regions: [
      { id: 'br-sp', name: '圣保罗', x: 30, y: 64, snapshot: { gdp: '7800亿USD', population: '4600万', import: '1850亿', export: '2100亿', lpi: 3.2, business: 66 } },
      { id: 'br-rj', name: '里约', x: 32, y: 68, snapshot: { gdp: '3200亿USD', population: '1700万', import: '920亿', export: '780亿', lpi: 3.0, business: 62 } },
    ],
    timeline: [
      { year: 2015, label: '2015', value: 1850, event: '大宗商品下行' },
      { year: 2020, label: '2020', value: 1720, event: '疫情冲击' },
      { year: 2022, label: '2022', value: 1980, event: '农产品出口反弹' },
      { year: 2026, label: '2026', value: 2150, event: '绿色能源投资升温' },
    ],
    keyEvents: [{ date: '2026-04', title: '亚马逊雨林保护关税', type: 'policy', impact: '中' }],
    demandSegments: {
      agri: {
        byType: [{ name: '大豆', share: 42, growth: 8 }, { name: '牛肉', share: 28, growth: 5 }],
        insights: ['农产品出口优势', '基建投资需求大'],
      },
    },
    supply: { localProduction: '资源型出口为主', capacity: '产能波动大', importDependency: '工业中间品依赖进口', producers: [{ name: ' Vale/本土农企', share: '18%', capacity: '中' }] },
    valueChain: [
      { stage: '资源开采', players: '矿区/农场', margin: '22%', risk: '中' },
      { stage: '出口物流', players: '桑托斯港', margin: '10%', risk: '高' },
    ],
    heatmapCells: [
      { id: 'br-sp', label: '圣保罗', x: 24, y: 58, w: 18, h: 22, trade: 82, gdp: 78, risk: 55, climate: 62, infra: 72, industry: 80 },
      { id: 'br-am', label: '亚马逊', x: 18, y: 48, w: 22, h: 24, trade: 45, gdp: 38, risk: 68, climate: 88, infra: 42, industry: 35 },
      { id: 'br-ne', label: '东北', x: 34, y: 52, w: 16, h: 20, trade: 58, gdp: 52, risk: 60, climate: 72, infra: 48, industry: 45 },
      { id: 'br-s', label: '南部', x: 28, y: 68, w: 16, h: 18, trade: 72, gdp: 68, risk: 48, climate: 55, infra: 65, industry: 70 },
    ],
  },
}

export const MARKET_DATA = {
  germany: {
    '1m': {
      overview: { marketSize: 286.5, importGrowth: 8.2, exportGrowth: 6.5, policyIndex: 82, competitionIndex: 74 },
      trend: [
        { month: 'W1', value: 62 }, { month: 'W2', value: 68 }, { month: 'W3', value: 71 }, { month: 'W4', value: 85 },
      ],
      importTop10: [
        { country: '中国', value: 42 }, { country: '荷兰', value: 28 }, { country: '美国', value: 24 },
        { country: '法国', value: 19 }, { country: '意大利', value: 16 }, { country: '波兰', value: 14 },
        { country: '捷克', value: 12 }, { country: '奥地利', value: 10 }, { country: '比利时', value: 9 }, { country: '西班牙', value: 8 },
      ],
      exportTop10: [
        { country: '美国', value: 38 }, { country: '中国', value: 32 }, { country: '法国', value: 26 },
        { country: '荷兰', value: 22 }, { country: '英国', value: 20 }, { country: '波兰', value: 18 },
        { country: '意大利', value: 15 }, { country: '奥地利', value: 13 }, { country: '瑞士', value: 11 }, { country: '捷克', value: 9 },
      ],
      policies: [
        { title: '欧盟碳边境调节机制（CBAM）', date: '2026-05-01', impact: '高', summary: '高耗能产品出口需提交碳排放证明' },
        { title: '德国供应链尽职调查法更新', date: '2026-04-12', impact: '中', summary: '强化人权与环境合规审查要求' },
        { title: '机电产品CE认证简化通道', date: '2026-03-20', impact: '低', summary: '符合条件的中小企业可享快速认证' },
      ],
      competition: [
        { name: '西门子供应链', share: '22%', strength: '技术标准领先' },
        { name: '博世零部件联盟', share: '18%', strength: '渠道覆盖广' },
        { name: '本地ODM联合体', share: '14%', strength: '成本优势明显' },
      ],
    },
    '6m': {
      overview: { marketSize: 1680.2, importGrowth: 7.6, exportGrowth: 5.8, policyIndex: 80, competitionIndex: 76 },
      trend: [
        { month: '1月', value: 240 }, { month: '2月', value: 255 }, { month: '3月', value: 268 },
        { month: '4月', value: 282 }, { month: '5月', value: 310 }, { month: '6月', value: 325 },
      ],
      importTop10: [
        { country: '中国', value: 248 }, { country: '荷兰', value: 165 }, { country: '美国', value: 142 },
        { country: '法国', value: 118 }, { country: '意大利', value: 96 }, { country: '波兰', value: 84 },
        { country: '捷克', value: 72 }, { country: '奥地利', value: 60 }, { country: '比利时', value: 54 }, { country: '西班牙', value: 48 },
      ],
      exportTop10: [
        { country: '美国', value: 228 }, { country: '中国', value: 192 }, { country: '法国', value: 156 },
        { country: '荷兰', value: 132 }, { country: '英国', value: 120 }, { country: '波兰', value: 108 },
        { country: '意大利', value: 90 }, { country: '奥地利', value: 78 }, { country: '瑞士', value: 66 }, { country: '捷克', value: 54 },
      ],
      policies: [
        { title: '欧盟碳边境调节机制（CBAM）', date: '2026-05-01', impact: '高', summary: '高耗能产品出口需提交碳排放证明' },
        { title: '德国供应链尽职调查法更新', date: '2026-04-12', impact: '中', summary: '强化人权与环境合规审查要求' },
        { title: '机电产品CE认证简化通道', date: '2026-03-20', impact: '低', summary: '符合条件的中小企业可享快速认证' },
        { title: '中德工业4.0合作框架延期', date: '2026-02-08', impact: '低', summary: '智能制造合作项目继续推进' },
      ],
      competition: [
        { name: '西门子供应链', share: '24%', strength: '技术标准领先' },
        { name: '博世零部件联盟', share: '17%', strength: '渠道覆盖广' },
        { name: '本地ODM联合体', share: '15%', strength: '成本优势明显' },
        { name: '欧洲工业集成商', share: '12%', strength: '项目交付能力强' },
      ],
    },
    '1y': {
      overview: { marketSize: 3280.6, importGrowth: 6.9, exportGrowth: 5.2, policyIndex: 79, competitionIndex: 78 },
      trend: [
        { month: '7月', value: 220 }, { month: '8月', value: 235 }, { month: '9月', value: 248 },
        { month: '10月', value: 260 }, { month: '11月', value: 275 }, { month: '12月', value: 290 },
        { month: '1月', value: 240 }, { month: '2月', value: 255 }, { month: '3月', value: 268 },
        { month: '4月', value: 282 }, { month: '5月', value: 310 }, { month: '6月', value: 325 },
      ],
      importTop10: [
        { country: '中国', value: 486 }, { country: '荷兰', value: 322 }, { country: '美国', value: 278 },
        { country: '法国', value: 231 }, { country: '意大利', value: 188 }, { country: '波兰', value: 165 },
        { country: '捷克', value: 141 }, { country: '奥地利', value: 118 }, { country: '比利时', value: 106 }, { country: '西班牙', value: 94 },
      ],
      exportTop10: [
        { country: '美国', value: 446 }, { country: '中国', value: 376 }, { country: '法国', value: 306 },
        { country: '荷兰', value: 258 }, { country: '英国', value: 235 }, { country: '波兰', value: 211 },
        { country: '意大利', value: 176 }, { country: '奥地利', value: 153 }, { country: '瑞士', value: 129 }, { country: '捷克', value: 106 },
      ],
      policies: [
        { title: '欧盟碳边境调节机制（CBAM）', date: '2026-05-01', impact: '高', summary: '高耗能产品出口需提交碳排放证明' },
        { title: '德国供应链尽职调查法更新', date: '2026-04-12', impact: '中', summary: '强化人权与环境合规审查要求' },
        { title: '机电产品CE认证简化通道', date: '2026-03-20', impact: '低', summary: '符合条件的中小企业可享快速认证' },
        { title: '中德工业4.0合作框架延期', date: '2026-02-08', impact: '低', summary: '智能制造合作项目继续推进' },
        { title: '欧盟反补贴调查清单更新', date: '2025-12-15', impact: '中', summary: '部分品类需提交原产地证明' },
      ],
      competition: [
        { name: '西门子供应链', share: '23%', strength: '技术标准领先' },
        { name: '博世零部件联盟', share: '19%', strength: '渠道覆盖广' },
        { name: '本地ODM联合体', share: '14%', strength: '成本优势明显' },
        { name: '欧洲工业集成商', share: '13%', strength: '项目交付能力强' },
        { name: '日韩零部件供应商', share: '10%', strength: '精密制造优势' },
      ],
    },
  },
  usa: {
    '1m': {
      overview: { marketSize: 412.8, importGrowth: 5.4, exportGrowth: 4.1, policyIndex: 71, competitionIndex: 82 },
      trend: [{ month: 'W1', value: 88 }, { month: 'W2', value: 92 }, { month: 'W3', value: 98 }, { month: 'W4', value: 135 }],
      importTop10: [
        { country: '中国', value: 58 }, { country: '墨西哥', value: 36 }, { country: '加拿大', value: 28 },
        { country: '德国', value: 22 }, { country: '日本', value: 18 }, { country: '越南', value: 15 },
        { country: '韩国', value: 13 }, { country: '印度', value: 11 }, { country: '爱尔兰', value: 9 }, { country: '泰国', value: 8 },
      ],
      exportTop10: [
        { country: '加拿大', value: 42 }, { country: '墨西哥', value: 38 }, { country: '中国', value: 30 },
        { country: '日本', value: 24 }, { country: '英国', value: 20 }, { country: '德国', value: 18 },
        { country: '韩国', value: 15 }, { country: '荷兰', value: 12 }, { country: '巴西', value: 10 }, { country: '法国', value: 9 },
      ],
      policies: [
        { title: '301关税清单复审', date: '2026-05-18', impact: '高', summary: '部分电子品类关税维持25%' },
        { title: 'USMCA原产地规则调整', date: '2026-04-02', impact: '中', summary: '汽车零部件本地化比例要求提高' },
      ],
      competition: [
        { name: '北美供应链联盟', share: '26%', strength: '本土渠道强' },
        { name: '跨境电商平台', share: '20%', strength: '流量与履约优势' },
        { name: '传统分销商网络', share: '16%', strength: '覆盖全美仓储' },
      ],
    },
    '6m': {
      overview: { marketSize: 2450.3, importGrowth: 4.8, exportGrowth: 3.6, policyIndex: 70, competitionIndex: 84 },
      trend: [
        { month: '1月', value: 360 }, { month: '2月', value: 375 }, { month: '3月', value: 390 },
        { month: '4月', value: 410 }, { month: '5月', value: 435 }, { month: '6月', value: 480 },
      ],
      importTop10: [
        { country: '中国', value: 348 }, { country: '墨西哥', value: 216 }, { country: '加拿大', value: 168 },
        { country: '德国', value: 132 }, { country: '日本', value: 108 }, { country: '越南', value: 90 },
        { country: '韩国', value: 78 }, { country: '印度', value: 66 }, { country: '爱尔兰', value: 54 }, { country: '泰国', value: 48 },
      ],
      exportTop10: [
        { country: '加拿大', value: 252 }, { country: '墨西哥', value: 228 }, { country: '中国', value: 180 },
        { country: '日本', value: 144 }, { country: '英国', value: 120 }, { country: '德国', value: 108 },
        { country: '韩国', value: 90 }, { country: '荷兰', value: 72 }, { country: '巴西', value: 60 }, { country: '法国', value: 54 },
      ],
      policies: [
        { title: '301关税清单复审', date: '2026-05-18', impact: '高', summary: '部分电子品类关税维持25%' },
        { title: 'USMCA原产地规则调整', date: '2026-04-02', impact: '中', summary: '汽车零部件本地化比例要求提高' },
        { title: '半导体出口管制更新', date: '2026-01-15', impact: '高', summary: '高端芯片及设备出口受限' },
      ],
      competition: [
        { name: '北美供应链联盟', share: '28%', strength: '本土渠道强' },
        { name: '跨境电商平台', share: '19%', strength: '流量与履约优势' },
        { name: '传统分销商网络', share: '17%', strength: '覆盖全美仓储' },
        { name: '亚洲直采贸易商', share: '11%', strength: '价格竞争力强' },
      ],
    },
    '1y': {
      overview: { marketSize: 4860.5, importGrowth: 4.2, exportGrowth: 3.1, policyIndex: 69, competitionIndex: 85 },
      trend: [
        { month: '7月', value: 340 }, { month: '8月', value: 355 }, { month: '9月', value: 368 },
        { month: '10月', value: 382 }, { month: '11月', value: 398 }, { month: '12月', value: 415 },
        { month: '1月', value: 360 }, { month: '2月', value: 375 }, { month: '3月', value: 390 },
        { month: '4月', value: 410 }, { month: '5月', value: 435 }, { month: '6月', value: 480 },
      ],
      importTop10: [
        { country: '中国', value: 690 }, { country: '墨西哥', value: 428 }, { country: '加拿大', value: 333 },
        { country: '德国', value: 262 }, { country: '日本', value: 214 }, { country: '越南', value: 178 },
        { country: '韩国', value: 154 }, { country: '印度', value: 131 }, { country: '爱尔兰', value: 107 }, { country: '泰国', value: 95 },
      ],
      exportTop10: [
        { country: '加拿大', value: 500 }, { country: '墨西哥', value: 452 }, { country: '中国', value: 357 },
        { country: '日本', value: 286 }, { country: '英国', value: 238 }, { country: '德国', value: 214 },
        { country: '韩国', value: 179 }, { country: '荷兰', value: 143 }, { country: '巴西', value: 119 }, { country: '法国', value: 107 },
      ],
      policies: [
        { title: '301关税清单复审', date: '2026-05-18', impact: '高', summary: '部分电子品类关税维持25%' },
        { title: 'USMCA原产地规则调整', date: '2026-04-02', impact: '中', summary: '汽车零部件本地化比例要求提高' },
        { title: '半导体出口管制更新', date: '2026-01-15', impact: '高', summary: '高端芯片及设备出口受限' },
        { title: '通胀削减法案补贴细则', date: '2025-11-20', impact: '中', summary: '新能源产品需满足本地化要求' },
      ],
      competition: [
        { name: '北美供应链联盟', share: '27%', strength: '本土渠道强' },
        { name: '跨境电商平台', share: '21%', strength: '流量与履约优势' },
        { name: '传统分销商网络', share: '16%', strength: '覆盖全美仓储' },
        { name: '亚洲直采贸易商', share: '12%', strength: '价格竞争力强' },
        { name: '拉美转口贸易商', share: '9%', strength: '关税筹划能力' },
      ],
    },
  },
  asean: {
    '1m': {
      overview: { marketSize: 198.6, importGrowth: 11.2, exportGrowth: 9.8, policyIndex: 88, competitionIndex: 68 },
      trend: [{ month: 'W1', value: 42 }, { month: 'W2', value: 46 }, { month: 'W3', value: 50 }, { month: 'W4', value: 61 }],
      importTop10: [
        { country: '中国', value: 38 }, { country: '日本', value: 22 }, { country: '韩国', value: 18 },
        { country: '美国', value: 15 }, { country: '澳大利亚', value: 12 }, { country: '印度', value: 10 },
        { country: '德国', value: 9 }, { country: '新加坡', value: 8 }, { country: '阿联酋', value: 7 }, { country: '巴西', value: 6 },
      ],
      exportTop10: [
        { country: '中国', value: 35 }, { country: '美国', value: 28 }, { country: '日本', value: 22 },
        { country: '欧盟', value: 18 }, { country: '印度', value: 14 }, { country: '澳大利亚', value: 12 },
        { country: '韩国', value: 10 }, { country: '阿联酋', value: 9 }, { country: '巴西', value: 8 }, { country: '英国', value: 7 },
      ],
      policies: [
        { title: 'RCEP关税减让第四阶段', date: '2026-06-01', impact: '高', summary: '90%以上税目实现零关税' },
        { title: '东盟数字贸易框架', date: '2026-03-15', impact: '中', summary: '跨境数据流动规则统一' },
      ],
      competition: [
        { name: '东盟本地制造联盟', share: '20%', strength: '产地优势' },
        { name: '中资跨境园区', share: '18%', strength: '产能配套完善' },
        { name: '日韩供应链', share: '15%', strength: '精密制造能力' },
      ],
    },
    '6m': {
      overview: { marketSize: 1180.4, importGrowth: 10.5, exportGrowth: 9.2, policyIndex: 87, competitionIndex: 70 },
      trend: [
        { month: '1月', value: 168 }, { month: '2月', value: 175 }, { month: '3月', value: 182 },
        { month: '4月', value: 190 }, { month: '5月', value: 205 }, { month: '6月', value: 220 },
      ],
      importTop10: [
        { country: '中国', value: 228 }, { country: '日本', value: 132 }, { country: '韩国', value: 108 },
        { country: '美国', value: 90 }, { country: '澳大利亚', value: 72 }, { country: '印度', value: 60 },
        { country: '德国', value: 54 }, { country: '新加坡', value: 48 }, { country: '阿联酋', value: 42 }, { country: '巴西', value: 36 },
      ],
      exportTop10: [
        { country: '中国', value: 210 }, { country: '美国', value: 168 }, { country: '日本', value: 132 },
        { country: '欧盟', value: 108 }, { country: '印度', value: 84 }, { country: '澳大利亚', value: 72 },
        { country: '韩国', value: 60 }, { country: '阿联酋', value: 54 }, { country: '巴西', value: 48 }, { country: '英国', value: 42 },
      ],
      policies: [
        { title: 'RCEP关税减让第四阶段', date: '2026-06-01', impact: '高', summary: '90%以上税目实现零关税' },
        { title: '东盟数字贸易框架', date: '2026-03-15', impact: '中', summary: '跨境数据流动规则统一' },
        { title: '越南加工增值认定优化', date: '2026-02-10', impact: '低', summary: '区域内增值比例认定放宽' },
      ],
      competition: [
        { name: '东盟本地制造联盟', share: '21%', strength: '产地优势' },
        { name: '中资跨境园区', share: '17%', strength: '产能配套完善' },
        { name: '日韩供应链', share: '14%', strength: '精密制造能力' },
        { name: '新加坡转口贸易商', share: '12%', strength: '金融与物流枢纽' },
      ],
    },
    '1y': {
      overview: { marketSize: 2280.8, importGrowth: 9.8, exportGrowth: 8.6, policyIndex: 86, competitionIndex: 72 },
      trend: [
        { month: '7月', value: 155 }, { month: '8月', value: 162 }, { month: '9月', value: 170 },
        { month: '10月', value: 178 }, { month: '11月', value: 185 }, { month: '12月', value: 192 },
        { month: '1月', value: 168 }, { month: '2月', value: 175 }, { month: '3月', value: 182 },
        { month: '4月', value: 190 }, { month: '5月', value: 205 }, { month: '6月', value: 220 },
      ],
      importTop10: [
        { country: '中国', value: 440 }, { country: '日本', value: 255 }, { country: '韩国', value: 209 },
        { country: '美国', value: 174 }, { country: '澳大利亚', value: 139 }, { country: '印度', value: 116 },
        { country: '德国', value: 104 }, { country: '新加坡', value: 93 }, { country: '阿联酋', value: 81 }, { country: '巴西', value: 70 },
      ],
      exportTop10: [
        { country: '中国', value: 405 }, { country: '美国', value: 324 }, { country: '日本', value: 255 },
        { country: '欧盟', value: 209 }, { country: '印度', value: 162 }, { country: '澳大利亚', value: 139 },
        { country: '韩国', value: 116 }, { country: '阿联酋', value: 104 }, { country: '巴西', value: 93 }, { country: '英国', value: 81 },
      ],
      policies: [
        { title: 'RCEP关税减让第四阶段', date: '2026-06-01', impact: '高', summary: '90%以上税目实现零关税' },
        { title: '东盟数字贸易框架', date: '2026-03-15', impact: '中', summary: '跨境数据流动规则统一' },
        { title: '越南加工增值认定优化', date: '2026-02-10', impact: '低', summary: '区域内增值比例认定放宽' },
        { title: '印尼镍矿出口政策调整', date: '2025-10-08', impact: '中', summary: '原材料出口限制影响下游' },
      ],
      competition: [
        { name: '东盟本地制造联盟', share: '20%', strength: '产地优势' },
        { name: '中资跨境园区', share: '18%', strength: '产能配套完善' },
        { name: '日韩供应链', share: '15%', strength: '精密制造能力' },
        { name: '新加坡转口贸易商', share: '13%', strength: '金融与物流枢纽' },
        { name: '欧美品牌代工商', share: '10%', strength: '品牌溢价能力' },
      ],
    },
  },
  japan: {
    '1m': {
      overview: { marketSize: 156.2, importGrowth: 3.8, exportGrowth: 2.9, policyIndex: 84, competitionIndex: 79 },
      trend: [{ month: 'W1', value: 34 }, { month: 'W2', value: 36 }, { month: 'W3', value: 38 }, { month: 'W4', value: 48 }],
      importTop10: [
        { country: '中国', value: 32 }, { country: '美国', value: 18 }, { country: '澳大利亚', value: 14 },
        { country: '韩国', value: 12 }, { country: '德国', value: 10 }, { country: '泰国', value: 8 },
        { country: '越南', value: 7 }, { country: '印尼', value: 6 }, { country: '马来西亚', value: 5 }, { country: '加拿大', value: 4 },
      ],
      exportTop10: [
        { country: '中国', value: 28 }, { country: '美国', value: 22 }, { country: '韩国', value: 16 },
        { country: '泰国', value: 12 }, { country: '德国', value: 10 }, { country: '越南', value: 9 },
        { country: '印度', value: 8 }, { country: '澳大利亚', value: 7 }, { country: '英国', value: 6 }, { country: '巴西', value: 5 },
      ],
      policies: [{ title: 'CPTPP原产地累积规则', date: '2026-04-20', impact: '中', summary: '区域内成分累积比例优化' }],
      competition: [{ name: '日本综合商社', share: '30%', strength: '全球渠道网络' }],
    },
    '6m': {
      overview: { marketSize: 920.5, importGrowth: 3.2, exportGrowth: 2.5, policyIndex: 83, competitionIndex: 80 },
      trend: [
        { month: '1月', value: 138 }, { month: '2月', value: 142 }, { month: '3月', value: 148 },
        { month: '4月', value: 152 }, { month: '5月', value: 158 }, { month: '6月', value: 165 },
      ],
      importTop10: [
        { country: '中国', value: 192 }, { country: '美国', value: 108 }, { country: '澳大利亚', value: 84 },
        { country: '韩国', value: 72 }, { country: '德国', value: 60 }, { country: '泰国', value: 48 },
        { country: '越南', value: 42 }, { country: '印尼', value: 36 }, { country: '马来西亚', value: 30 }, { country: '加拿大', value: 24 },
      ],
      exportTop10: [
        { country: '中国', value: 168 }, { country: '美国', value: 132 }, { country: '韩国', value: 96 },
        { country: '泰国', value: 72 }, { country: '德国', value: 60 }, { country: '越南', value: 54 },
        { country: '印度', value: 48 }, { country: '澳大利亚', value: 42 }, { country: '英国', value: 36 }, { country: '巴西', value: 30 },
      ],
      policies: [
        { title: 'CPTPP原产地累积规则', date: '2026-04-20', impact: '中', summary: '区域内成分累积比例优化' },
        { title: '半导体设备出口审查', date: '2026-01-08', impact: '高', summary: '先进制程设备出口受限' },
      ],
      competition: [
        { name: '日本综合商社', share: '28%', strength: '全球渠道网络' },
        { name: '精密零部件联盟', share: '22%', strength: '技术壁垒高' },
      ],
    },
    '1y': {
      overview: { marketSize: 1820.3, importGrowth: 2.8, exportGrowth: 2.1, policyIndex: 82, competitionIndex: 81 },
      trend: [
        { month: '7月', value: 130 }, { month: '8月', value: 134 }, { month: '9月', value: 138 },
        { month: '10月', value: 142 }, { month: '11月', value: 146 }, { month: '12月', value: 150 },
        { month: '1月', value: 138 }, { month: '2月', value: 142 }, { month: '3月', value: 148 },
        { month: '4月', value: 152 }, { month: '5月', value: 158 }, { month: '6月', value: 165 },
      ],
      importTop10: [
        { country: '中国', value: 380 }, { country: '美国', value: 214 }, { country: '澳大利亚', value: 166 },
        { country: '韩国', value: 142 }, { country: '德国', value: 118 }, { country: '泰国', value: 95 },
        { country: '越南', value: 83 }, { country: '印尼', value: 71 }, { country: '马来西亚', value: 59 }, { country: '加拿大', value: 47 },
      ],
      exportTop10: [
        { country: '中国', value: 332 }, { country: '美国', value: 261 }, { country: '韩国', value: 190 },
        { country: '泰国', value: 142 }, { country: '德国', value: 118 }, { country: '越南', value: 107 },
        { country: '印度', value: 95 }, { country: '澳大利亚', value: 83 }, { country: '英国', value: 71 }, { country: '巴西', value: 59 },
      ],
      policies: [
        { title: 'CPTPP原产地累积规则', date: '2026-04-20', impact: '中', summary: '区域内成分累积比例优化' },
        { title: '半导体设备出口审查', date: '2026-01-08', impact: '高', summary: '先进制程设备出口受限' },
      ],
      competition: [
        { name: '日本综合商社', share: '27%', strength: '全球渠道网络' },
        { name: '精密零部件联盟', share: '21%', strength: '技术壁垒高' },
        { name: '韩国竞争供应链', share: '15%', strength: '价格与速度优势' },
      ],
    },
  },
  brazil: {
    '1m': {
      overview: { marketSize: 98.4, importGrowth: 6.8, exportGrowth: 5.5, policyIndex: 75, competitionIndex: 65 },
      trend: [{ month: 'W1', value: 20 }, { month: 'W2', value: 22 }, { month: 'W3', value: 24 }, { month: 'W4', value: 32 }],
      importTop10: [
        { country: '中国', value: 28 }, { country: '美国', value: 16 }, { country: '德国', value: 10 },
        { country: '阿根廷', value: 8 }, { country: '日本', value: 7 }, { country: '韩国', value: 6 },
        { country: '意大利', value: 5 }, { country: '法国', value: 4 }, { country: '印度', value: 3 }, { country: '墨西哥', value: 3 },
      ],
      exportTop10: [
        { country: '中国', value: 22 }, { country: '美国', value: 18 }, { country: '阿根廷', value: 12 },
        { country: '荷兰', value: 10 }, { country: '德国', value: 8 }, { country: '日本', value: 7 },
        { country: '韩国', value: 6 }, { country: '西班牙', value: 5 }, { country: '智利', value: 4 }, { country: '印度', value: 3 },
      ],
      policies: [{ title: 'Mercosur关税同盟调整', date: '2026-03-28', impact: '中', summary: '成员国间贸易便利化加强' }],
      competition: [{ name: '南美资源型贸易商', share: '24%', strength: '原材料优势' }],
    },
    '6m': {
      overview: { marketSize: 580.2, importGrowth: 6.2, exportGrowth: 5.0, policyIndex: 74, competitionIndex: 67 },
      trend: [
        { month: '1月', value: 82 }, { month: '2月', value: 86 }, { month: '3月', value: 90 },
        { month: '4月', value: 94 }, { month: '5月', value: 100 }, { month: '6月', value: 108 },
      ],
      importTop10: [
        { country: '中国', value: 168 }, { country: '美国', value: 96 }, { country: '德国', value: 60 },
        { country: '阿根廷', value: 48 }, { country: '日本', value: 42 }, { country: '韩国', value: 36 },
        { country: '意大利', value: 30 }, { country: '法国', value: 24 }, { country: '印度', value: 18 }, { country: '墨西哥', value: 18 },
      ],
      exportTop10: [
        { country: '中国', value: 132 }, { country: '美国', value: 108 }, { country: '阿根廷', value: 72 },
        { country: '荷兰', value: 60 }, { country: '德国', value: 48 }, { country: '日本', value: 42 },
        { country: '韩国', value: 36 }, { country: '西班牙', value: 30 }, { country: '智利', value: 24 }, { country: '印度', value: 18 },
      ],
      policies: [
        { title: 'Mercosur关税同盟调整', date: '2026-03-28', impact: '中', summary: '成员国间贸易便利化加强' },
        { title: '农产品出口检疫新规', date: '2026-01-22', impact: '低', summary: '出口证书电子化加速' },
      ],
      competition: [
        { name: '南美资源型贸易商', share: '23%', strength: '原材料优势' },
        { name: '中资农业联合体', share: '16%', strength: '规模化采购' },
      ],
    },
    '1y': {
      overview: { marketSize: 1120.6, importGrowth: 5.6, exportGrowth: 4.5, policyIndex: 73, competitionIndex: 69 },
      trend: [
        { month: '7月', value: 78 }, { month: '8月', value: 80 }, { month: '9月', value: 83 },
        { month: '10月', value: 85 }, { month: '11月', value: 88 }, { month: '12月', value: 90 },
        { month: '1月', value: 82 }, { month: '2月', value: 86 }, { month: '3月', value: 90 },
        { month: '4月', value: 94 }, { month: '5月', value: 100 }, { month: '6月', value: 108 },
      ],
      importTop10: [
        { country: '中国', value: 324 }, { country: '美国', value: 185 }, { country: '德国', value: 116 },
        { country: '阿根廷', value: 93 }, { country: '日本', value: 81 }, { country: '韩国', value: 69 },
        { country: '意大利', value: 58 }, { country: '法国', value: 46 }, { country: '印度', value: 35 }, { country: '墨西哥', value: 35 },
      ],
      exportTop10: [
        { country: '中国', value: 255 }, { country: '美国', value: 209 }, { country: '阿根廷', value: 139 },
        { country: '荷兰', value: 116 }, { country: '德国', value: 93 }, { country: '日本', value: 81 },
        { country: '韩国', value: 69 }, { country: '西班牙', value: 58 }, { country: '智利', value: 46 }, { country: '印度', value: 35 },
      ],
      policies: [
        { title: 'Mercosur关税同盟调整', date: '2026-03-28', impact: '中', summary: '成员国间贸易便利化加强' },
        { title: '农产品出口检疫新规', date: '2026-01-22', impact: '低', summary: '出口证书电子化加速' },
      ],
      competition: [
        { name: '南美资源型贸易商', share: '22%', strength: '原材料优势' },
        { name: '中资农业联合体', share: '17%', strength: '规模化采购' },
        { name: '欧洲食品进口商', share: '13%', strength: '品牌渠道强' },
      ],
    },
  },
}

export const PRODUCT_CATALOG = {
  汽车配件: {
    hsCode: '8708',
    category: '汽车配件',
    desc: '涵盖发动机零部件、底盘系统、车身附件等',
    tradeTrend: [
      { period: '1月', import: 12.5, export: 8.2 }, { period: '2月', import: 13.1, export: 8.6 },
      { period: '3月', import: 13.8, export: 9.0 }, { period: '4月', import: 14.2, export: 9.4 },
      { period: '5月', import: 15.0, export: 9.8 }, { period: '6月', import: 15.6, export: 10.2 },
    ],
    priceTrend: [
      { date: '01-01', price: 128 }, { date: '01-15', price: 131 }, { date: '02-01', price: 129 },
      { date: '02-15', price: 133 }, { date: '03-01', price: 135 }, { date: '03-15', price: 132 },
      { date: '04-01', price: 136 }, { date: '04-15', price: 138 }, { date: '05-01', price: 137 },
      { date: '05-15', price: 140 }, { date: '06-01', price: 142 }, { date: '06-15', price: 141 },
    ],
    tariffs: [
      { country: '美国', mfn: '2.5%', preferential: '0%（USMCA）', vat: '无联邦VAT' },
      { country: '德国', mfn: '4.5%', preferential: '0%（自贸）', vat: '19%' },
      { country: '日本', mfn: '3.0%', preferential: '0%（RCEP）', vat: '10%' },
      { country: '巴西', mfn: '18%', preferential: '12%（Mercosur）', vat: '17%' },
      { country: '越南', mfn: '20%', preferential: '0%（RCEP）', vat: '10%' },
    ],
    costParams: { tariffRate: 0.045, freightRate: 0.08, insuranceRate: 0.005, vatRate: 0.19 },
  },
  电子产品: {
    hsCode: '8517',
    category: '电子产品',
    desc: '通信设备、消费电子、电子元器件等',
    tradeTrend: [
      { period: '1月', import: 28.6, export: 22.4 }, { period: '2月', import: 29.2, export: 23.0 },
      { period: '3月', import: 30.5, export: 24.1 }, { period: '4月', import: 31.8, export: 25.0 },
      { period: '5月', import: 33.2, export: 26.2 }, { period: '6月', import: 34.5, export: 27.1 },
    ],
    priceTrend: [
      { date: '01-01', price: 256 }, { date: '01-15', price: 252 }, { date: '02-01', price: 248 },
      { date: '02-15', price: 245 }, { date: '03-01', price: 242 }, { date: '03-15', price: 238 },
      { date: '04-01', price: 235 }, { date: '04-15', price: 232 }, { date: '05-01', price: 228 },
      { date: '05-15', price: 225 }, { date: '06-01', price: 222 }, { date: '06-15', price: 218 },
    ],
    tariffs: [
      { country: '美国', mfn: '0%', preferential: '0%', vat: '州税另计' },
      { country: '德国', mfn: '0%', preferential: '0%', vat: '19%' },
      { country: '日本', mfn: '0%', preferential: '0%', vat: '10%' },
      { country: '印度', mfn: '15%', preferential: '10%', vat: '18%' },
      { country: '墨西哥', mfn: '0%', preferential: '0%（USMCA）', vat: '16%' },
    ],
    costParams: { tariffRate: 0, freightRate: 0.06, insuranceRate: 0.004, vatRate: 0.19 },
  },
  机械设备: {
    hsCode: '8479',
    category: '机械设备',
    desc: '工业机械、工程设备、通用机械等',
    tradeTrend: [
      { period: '1月', import: 18.2, export: 14.6 }, { period: '2月', import: 18.8, export: 15.0 },
      { period: '3月', import: 19.5, export: 15.8 }, { period: '4月', import: 20.1, export: 16.2 },
      { period: '5月', import: 21.0, export: 17.0 }, { period: '6月', import: 21.8, export: 17.6 },
    ],
    priceTrend: [
      { date: '01-01', price: 520 }, { date: '01-15', price: 525 }, { date: '02-01', price: 518 },
      { date: '02-15', price: 530 }, { date: '03-01', price: 535 }, { date: '03-15', price: 528 },
      { date: '04-01', price: 540 }, { date: '04-15', price: 545 }, { date: '05-01', price: 538 },
      { date: '05-15', price: 550 }, { date: '06-01', price: 555 }, { date: '06-15', price: 548 },
    ],
    tariffs: [
      { country: '德国', mfn: '0%', preferential: '0%', vat: '19%' },
      { country: '美国', mfn: '2.5%', preferential: '0%', vat: '无联邦VAT' },
      { country: '印尼', mfn: '5%', preferential: '0%（RCEP）', vat: '11%' },
      { country: '沙特', mfn: '5%', preferential: '0%', vat: '15%' },
      { country: '俄罗斯', mfn: '5%', preferential: '3%', vat: '20%' },
    ],
    costParams: { tariffRate: 0.025, freightRate: 0.12, insuranceRate: 0.008, vatRate: 0.19 },
  },
}

export const PRODUCT_EXTENDED = {
  汽车配件: {
    id: '870899',
    codes: {
      hs: '8708.99', hs10: '8708998180', ciq: '8708990000', hts: '8708.99.8180', taric: '8708999790', jcn: '8708.99-000',
    },
    keywords: ['刹车片', '发动机零部件', '底盘系统', '车身附件', 'auto parts', 'brake pad'],
    archive: {
      physical: '金属/复合材料构成，耐温-40~200°C，符合IATF16949',
      applications: [{ name: '乘用车售后', share: 45 }, { name: '商用车', share: 30 }, { name: '工业设备', share: 25 }],
      producers: [
        { name: '博世', country: '德国', capacity: '1200万件/年', contact: 'b2b@bosch.com' },
        { name: '大陆集团', country: '德国', capacity: '980万件/年', contact: 'trade@continental.com' },
        { name: '万向集团', country: '中国', capacity: '1500万件/年', contact: 'export@wanxiang.com' },
      ],
      consumers: [
        { country: '德国', rank: 1, feature: '品质认证要求高' },
        { country: '美国', rank: 2, feature: '售后市场庞大' },
        { country: '墨西哥', rank: 3, feature: 'USMCA原产地优势' },
      ],
      certifications: [
        { name: 'ECE R90', type: '强制' }, { name: 'IATF 16949', type: '强制' }, { name: 'ISO 9001', type: '自愿' },
      ],
      priceRange: { min: 118, max: 165, avg: 142, volatility: 0.12, period: '近10年' },
      tradeIndex: 86,
      tradeTrend: '上升',
      updateDate: '2026-07-02',
    },
    customsCases: [
      { case: '预裁定 BR-2024-8708', desc: '刹车片按870830归类争议', result: '建议870830' },
    ],
    related: {
      complementary: [{ name: '润滑油 HS2710', heat: 82, margin: '18%' }, { name: '轮胎 HS4011', heat: 76, margin: '15%' }],
      substitute: [{ name: '陶瓷刹车片', heat: 68, margin: '22%' }],
      upstream: [{ name: '钢材 HS7208', heat: 90, margin: '8%' }, { name: '橡胶 HS4009', heat: 72, margin: '10%' }],
      downstream: [{ name: '整车 HS8703', heat: 88, margin: '12%' }],
    },
    supplyDemand: {
      supply: '全球产能利用78%，中国出口占35%',
      demand: '欧美售后需求稳定，新兴市场增速12%',
      quarterTrade: [
        { quarter: '2025Q1', import: 42, export: 28 }, { quarter: '2025Q2', import: 45, export: 30 },
        { quarter: '2025Q3', import: 48, export: 32 }, { quarter: '2025Q4', import: 50, export: 34 },
        { quarter: '2026Q1', import: 52, export: 36 }, { quarter: '2026Q2', import: 55, export: 38 },
      ],
      standards: ['ECE R90', 'FMVSS 135', 'GB 5763'],
      restrictions: ['美国301清单部分子目', '欧盟反倾销调查（部分制动器）'],
    },
    priceAnalysis: {
      sources: ['LME间接', '上海钢联现货', '阿里巴巴B2B', '海关进口单价'],
      updateFreq: '小时级',
      indices: [
        { name: '中国CFR基准', value: 142, change: 2.1 },
        { name: '西欧现货溢价', value: 138, change: 1.5 },
        { name: '北美终端零售指数', value: 156, change: -0.8 },
      ],
      chain: {
        futures: [{ date: '2026-01', price: 128 }, { date: '2026-02', price: 131 }, { date: '2026-03', price: 135 }, { date: '2026-04', price: 136 }, { date: '2026-05', price: 140 }, { date: '2026-06', price: 142 }],
        spot: [{ date: '2026-01', price: 125 }, { date: '2026-02', price: 128 }, { date: '2026-03', price: 132 }, { date: '2026-04', price: 134 }, { date: '2026-05', price: 138 }, { date: '2026-06', price: 141 }],
        terminal: [{ date: '2026-01', price: 148 }, { date: '2026-02', price: 150 }, { date: '2026-03', price: 152 }, { date: '2026-04', price: 155 }, { date: '2026-05', price: 158 }, { date: '2026-06', price: 160 }],
      },
      drivers: [
        { factor: '钢材价格', layer: '成本', correlation: 0.82, change: '+5.2%', contribution: 35 },
        { factor: '海运SCFI', layer: '成本', correlation: 0.68, change: '+8.1%', contribution: 22 },
        { factor: '欧元汇率', layer: '金融', correlation: -0.55, change: '-1.2%', contribution: 15 },
        { factor: '欧盟反倾销', layer: '政策', correlation: 0.45, change: '调查进行中', contribution: 18 },
        { factor: 'PMI制造业', layer: '宏观', correlation: 0.71, change: '+0.3ppt', contribution: 10 },
      ],
      attribution: {
        period: '2026-W23',
        change: '+8.2%',
        summary: '本周价格显著上涨，主要由钢材成本传导与海运运费上升驱动，政策调查预期加剧市场惜售。',
        factors: [
          { name: '原材料（钢）', weight: 35 }, { name: '海运运费', weight: 22 }, { name: '政策预期', weight: 18 },
          { name: '汇率', weight: 15 }, { name: '其他', weight: 10 },
        ],
      },
      forecast: {
        model: 'PC-Stacking (LSTM+RF+XGB)',
        scenarios: {
          baseline: [{ month: '2026-07', price: 144 }, { month: '2026-08', price: 146 }, { month: '2026-09', price: 145 }, { month: '2026-10', price: 148 }],
          optimistic: [{ month: '2026-07', price: 140 }, { month: '2026-08', price: 138 }, { month: '2026-09', price: 136 }],
          pessimistic: [{ month: '2026-07', price: 148 }, { month: '2026-08', price: 152 }, { month: '2026-09', price: 155 }],
        },
        alert: { upper: 150, lower: 125, triggered: false, probBreakUpper: 42 },
        hedging: {
          contract: 'LME钢卷期货 2026Q3',
          direction: '卖出套保',
          quantity: '500吨',
          stopLoss: '152 USD/吨',
          note: '基于月采购800吨、库存200吨测算',
        },
      },
      costBreakdown: [
        { item: '原材料', share: 45 }, { item: '人工', share: 18 }, { item: '加工', share: 15 },
        { item: '运输', share: 12 }, { item: '能源', share: 10 },
      ],
    },
  },
  电子产品: {
    id: '851762',
    codes: { hs: '8517.62', hs10: '8517620000', ciq: '8517620000', hts: '8517.62.0090', taric: '8517620000', jcn: '8517.62-000' },
    keywords: ['通信设备', '路由器', '5G', 'electronics', 'smartphone module', '芯片'],
    archive: {
      physical: 'PCB+芯片+外壳，工作温度0~45°C，RoHS/REACH合规',
      applications: [{ name: '消费电子', share: 55 }, { name: '企业通信', share: 30 }, { name: '工业物联网', share: 15 }],
      producers: [
        { name: '华为', country: '中国', capacity: '8000万台/年', contact: 'enterprise@huawei.com' },
        { name: '思科', country: '美国', capacity: '5000万台/年', contact: 'b2b@cisco.com' },
      ],
      consumers: [{ country: '东南亚', rank: 1, feature: '5G建设拉动' }, { country: '欧洲', rank: 2, feature: '网络安全合规' }],
      certifications: [{ name: 'CE', type: '强制' }, { name: 'FCC', type: '强制' }, { name: 'RoHS', type: '强制' }],
      priceRange: { min: 180, max: 320, avg: 228, volatility: 0.18, period: '近10年' },
      tradeIndex: 92,
      tradeTrend: '波动',
      updateDate: '2026-07-02',
    },
    customsCases: [{ case: '归类案例 CN-2023-8517', desc: '含SIM卡槽路由器归类', result: '851762' }],
    related: {
      complementary: [{ name: '光纤 HS9001', heat: 80, margin: '14%' }],
      substitute: [{ name: 'WiFi6E模组', heat: 75, margin: '20%' }],
      upstream: [{ name: '半导体 HS8541', heat: 95, margin: '6%' }],
      downstream: [{ name: '数据中心设备', heat: 85, margin: '16%' }],
    },
    supplyDemand: {
      supply: '芯片供应趋稳，产能利用率85%',
      demand: 'AI算力与5G双轮驱动',
      quarterTrade: [
        { quarter: '2025Q3', import: 88, export: 72 }, { quarter: '2025Q4', import: 92, export: 78 },
        { quarter: '2026Q1', import: 96, export: 82 }, { quarter: '2026Q2', import: 102, export: 88 },
      ],
      standards: ['CE RED', 'FCC Part 15', 'GB/T 9254'],
      restrictions: ['美国EAR出口管制（高端芯片）', '印度BIS强制认证'],
    },
    priceAnalysis: {
      sources: ['COMEX间接', '普氏估价', 'Amazon终端', '海关单价'],
      updateFreq: '分钟级（芯片）/ 小时级（整机）',
      indices: [
        { name: '中国CFR基准', value: 228, change: -1.8 },
        { name: '西欧现货溢价', value: 235, change: -2.2 },
        { name: '北美终端零售指数', value: 268, change: -0.5 },
      ],
      chain: {
        futures: [{ date: '2026-01', price: 256 }, { date: '2026-03', price: 242 }, { date: '2026-06', price: 218 }],
        spot: [{ date: '2026-01', price: 250 }, { date: '2026-03', price: 238 }, { date: '2026-06', price: 222 }],
        terminal: [{ date: '2026-01', price: 298 }, { date: '2026-03', price: 275 }, { date: '2026-06', price: 258 }],
      },
      drivers: [
        { factor: '芯片价格', layer: '成本', correlation: 0.88, change: '-6.5%', contribution: 42 },
        { factor: '美元汇率', layer: '金融', correlation: 0.62, change: '+0.8%', contribution: 20 },
        { factor: '301关税', layer: '政策', correlation: 0.55, change: '复审中', contribution: 25 },
        { factor: '消费电子PMI', layer: '宏观', correlation: 0.58, change: '-0.5ppt', contribution: 13 },
      ],
      attribution: {
        period: '2026-W23', change: '-5.8%',
        summary: '芯片成本下降传导至整机价格，叠加消费淡季需求走弱。',
        factors: [{ name: '芯片成本', weight: 42 }, { name: '关税预期', weight: 25 }, { name: '汇率', weight: 20 }, { name: '需求', weight: 13 }],
      },
      forecast: {
        model: 'PC-Stacking (LSTM+RF+XGB)',
        scenarios: {
          baseline: [{ month: '2026-07', price: 215 }, { month: '2026-08', price: 212 }, { month: '2026-09', price: 218 }],
          optimistic: [{ month: '2026-07', price: 205 }, { month: '2026-08', price: 200 }],
          pessimistic: [{ month: '2026-07', price: 225 }, { month: '2026-08', price: 232 }],
        },
        alert: { upper: 260, lower: 200, triggered: false, probBreakUpper: 18 },
        hedging: { contract: '不适用（非大宗商品）', direction: '-', quantity: '-', stopLoss: '-', note: '建议通过长协锁价替代套保' },
      },
      costBreakdown: [{ item: '芯片', share: 52 }, { item: '其他元器件', share: 22 }, { item: '组装', share: 14 }, { item: '物流', share: 12 }],
    },
  },
  机械设备: {
    id: '847989',
    codes: { hs: '8479.89', hs10: '8479899999', ciq: '8479899999', hts: '8479.89.9899', taric: '8479899899', jcn: '8479.89-000' },
    keywords: ['工业机械', '数控机床', 'CNC', 'machinery', '通用机械'],
    archive: {
      physical: '精密钢结构，定位精度±0.01mm，CE/UL认证',
      applications: [{ name: '汽车制造', share: 40 }, { name: '航空航天', share: 25 }, { name: '通用加工', share: 35 }],
      producers: [{ name: '西门子', country: '德国', capacity: '8000台/年', contact: 'industry@siemens.com' }],
      consumers: [{ country: '德国', rank: 1, feature: '工业4.0升级' }, { country: '印度', rank: 2, feature: '基建扩张' }],
      certifications: [{ name: 'CE', type: '强制' }, { name: 'ISO 13849', type: '强制' }],
      priceRange: { min: 480, max: 620, avg: 548, volatility: 0.09, period: '近10年' },
      tradeIndex: 78,
      tradeTrend: '稳健上升',
      updateDate: '2026-07-02',
    },
    customsCases: [],
    related: {
      complementary: [{ name: '工业软件', heat: 70, margin: '35%' }],
      upstream: [{ name: '特种钢 HS7225', heat: 82, margin: '9%' }],
      downstream: [{ name: '汽车零部件', heat: 75, margin: '11%' }],
    },
    supplyDemand: {
      supply: '欧洲产能紧张，交期延长至16周',
      demand: '东南亚新建工厂拉动',
      quarterTrade: [{ quarter: '2026Q1', import: 62, export: 48 }, { quarter: '2026Q2', import: 68, export: 52 }],
      standards: ['CE Machinery Directive', 'ISO 12100'],
      restrictions: ['部分国家进口许可'],
    },
    priceAnalysis: {
      sources: ['CBOT间接', '上海钢联', 'B2B报价', '海关单价'],
      updateFreq: '日级',
      indices: [{ name: '中国CFR基准', value: 548, change: 3.2 }, { name: '西欧现货溢价', value: 562, change: 2.8 }],
      chain: {
        futures: [{ date: '2026-01', price: 520 }, { date: '2026-03', price: 535 }, { date: '2026-06', price: 555 }],
        spot: [{ date: '2026-01', price: 515 }, { date: '2026-03', price: 530 }, { date: '2026-06', price: 548 }],
        terminal: [{ date: '2026-01', price: 580 }, { date: '2026-03', price: 595 }, { date: '2026-06', price: 615 }],
      },
      drivers: [
        { factor: '特种钢', layer: '成本', correlation: 0.75, change: '+4.0%', contribution: 30 },
        { factor: 'BDI海运', layer: '成本', correlation: 0.60, change: '+6.5%', contribution: 25 },
        { factor: '欧洲能源', layer: '成本', correlation: 0.65, change: '+2.1%', contribution: 20 },
      ],
      attribution: { period: '2026-W23', change: '+4.5%', summary: '原材料与能源成本推动价格上涨。', factors: [{ name: '特种钢', weight: 30 }, { name: '海运', weight: 25 }, { name: '能源', weight: 20 }] },
      forecast: {
        model: 'PC-Stacking',
        scenarios: {
          baseline: [{ month: '2026-07', price: 558 }, { month: '2026-08', price: 562 }],
          optimistic: [{ month: '2026-07', price: 545 }],
          pessimistic: [{ month: '2026-07', price: 575 }],
        },
        alert: { upper: 580, lower: 500, triggered: false, probBreakUpper: 55 },
        hedging: { contract: 'LME铝/钢组合', direction: '买入套保', quantity: '200吨当量', stopLoss: '590', note: '锁定Q3原材料成本' },
      },
      costBreakdown: [{ item: '原材料', share: 38 }, { item: '人工', share: 25 }, { item: '研发', share: 18 }, { item: '物流', share: 19 }],
    },
  },
}

export const TRADE_MODE_OPTIONS = [
  { value: 'all', label: '全部贸易方式' },
  { value: 'general', label: '一般贸易' },
  { value: 'processing', label: '加工贸易' },
  { value: 'crossborder', label: '跨境电商' },
]

export const PRICE_GRANULARITY = [
  { value: 'day', label: '日度' },
  { value: 'week', label: '周度' },
  { value: 'month', label: '月度' },
  { value: 'quarter', label: '季度' },
  { value: 'year', label: '年度' },
]

export const PRICE_TIME_RANGES = [
  { value: '1m', label: '近1月' },
  { value: '3m', label: '近3月' },
  { value: '6m', label: '近6月' },
  { value: '1y', label: '近1年' },
  { value: '5y', label: '近5年' },
]

const DEFAULT_DATA_SOURCES = [
  { type: '期货', sources: ['LME', 'COMEX', 'CBOT'], freq: '分钟级', desc: '实时期货价格与持仓' },
  { type: '现货', sources: ['上海钢联', 'Platts', 'CCTD'], freq: '小时级', desc: '权威现货估价' },
  { type: '港口', sources: ['上海港', '鹿特丹港', '纽约港'], freq: '日级', desc: '港口现货成交价' },
  { type: 'B2B', sources: ['阿里巴巴国际站', '环球资源'], freq: '小时级', desc: '供应商报价' },
  { type: '终端', sources: ['Amazon', '沃尔玛'], freq: '日级', desc: '零售终端售价' },
  { type: '海关', sources: ['各国进口单价统计'], freq: '月度', desc: '区域市场均价参考' },
]

function expandChainSeries(chain, granularity, timeRange) {
  const spot = chain?.spot || []
  if (!spot.length) return []
  const basePrice = spot[spot.length - 1]?.price || 140
  const pointCounts = { '1m': 30, '3m': 12, '6m': 6, '1y': 12, '5y': 5 }[timeRange] || 6
  const granMult = { day: 1, week: 0.25, month: 1, quarter: 0.33, year: 0.083 }[granularity] || 1
  const count = Math.max(4, Math.round(pointCounts * (granMult > 1 ? granMult : 1 / granMult)))

  const labels = []
  for (let i = count - 1; i >= 0; i -= 1) {
    if (granularity === 'day') labels.push(`${String(6).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`)
    else if (granularity === 'week') labels.push(`W${count - i}`)
    else if (granularity === 'quarter') labels.push(`202${5 - Math.floor(i / 4)}Q${(i % 4) + 1}`)
    else if (granularity === 'year') labels.push(String(2026 - i))
    else labels.push(`2026-${String(Math.max(1, 7 - i)).padStart(2, '0')}`)
  }

  return [
    { key: 'futures', name: '期货', offset: -3 },
    { key: 'spot', name: '现货', offset: 0 },
    { key: 'terminal', name: '终端零售', offset: 12 },
  ].flatMap(({ name, offset }) =>
    labels.map((date, idx) => {
      const wave = Math.sin(idx * 0.8) * 3 + (idx - count / 2) * 0.4
      return { date, price: Math.round(basePrice + offset + wave), series: name }
    }),
  )
}

function buildSeasonalHeatmap(baseValue = 140) {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const seasonal = [0.92, 0.88, 0.95, 1.02, 1.05, 1.08, 1.1, 1.06, 1.0, 0.96, 0.94, 0.9]
  return months.map((month, i) => ({
    month,
    value: Math.round(baseValue * seasonal[i]),
    intensity: Math.round(seasonal[i] * 100),
  }))
}

function buildInfluenceFactors(pa, productName) {
  const isElectronics = productName === '电子产品'
  return [
    {
      key: 'cost', title: '生产成本', summary: isElectronics ? '芯片占比超50%' : '钢材/橡胶占45%',
      items: (pa.costBreakdown || []).slice(0, 3).map((c) => `${c.item} ${c.share}%`), trend: isElectronics ? 'down' : 'up', impact: isElectronics ? '-2.1%' : '+3.2%',
    },
    {
      key: 'transport', title: '运输费用', summary: '海运/空运/陆运价差与港口杂费',
      items: ['SCFI +8.1%', '欧线溢价 +12%', '空运较海运 +35%'], trend: 'up', impact: '+1.8%',
    },
    {
      key: 'seasonal', title: '季节性', summary: isElectronics ? 'Q4促销季高峰' : '夏季出行旺季',
      items: ['Q3需求旺季', 'Q1春节淡季', '收获季扰动'], trend: 'neutral', impact: '+0.9%',
    },
    {
      key: 'fx', title: '汇率波动', summary: '主要结算货币汇率影响进口成本',
      items: ['USD/CNY -0.3%', 'EUR/CNY +0.5%', '敞口 62%'], trend: 'neutral', impact: '-0.6%',
    },
    {
      key: 'energy', title: '能源价格', summary: '原油/电力经生产与运输传导',
      items: ['布伦特 +2.4%', '工业电价 +1.1%', 'BDI +6.5%'], trend: 'up', impact: '+1.2%',
    },
  ]
}

function buildFactorDatabase(drivers) {
  const layers = ['宏观', '中观', '成本', '金融', '政策', '突发']
  const extra = [
    { factor: '全球GDP增速', layer: '宏观', correlation: 0.62, change: '+0.2ppt', contribution: 8 },
    { factor: '制造业PMI', layer: '宏观', correlation: 0.71, change: '+0.3ppt', contribution: 10 },
    { factor: '产能利用率', layer: '中观', correlation: 0.58, change: '78%', contribution: 12 },
    { factor: '库存周转率', layer: '中观', correlation: -0.45, change: '45天', contribution: 9 },
    { factor: '基金持仓变化', layer: '金融', correlation: 0.52, change: '+3.2%', contribution: 7 },
    { factor: '极端天气', layer: '突发', correlation: 0.38, change: '东南亚洪涝', contribution: 5 },
  ]
  const merged = [...(drivers || []), ...extra]
  return layers.map((layer) => ({ layer, items: merged.filter((d) => d.layer === layer) }))
}

function buildStandardization(indices) {
  return {
    benchmarks: (indices || []).map((i) => i.name),
    methods: ['规格折算系数', '区域价差调整', '贸易条款换算(CIF/FOB/CFR)'],
    quality: { outliersRemoved: 12, samples: 8640, confidence: 96.8 },
    note: '异常报价已剔除，统一换算为标准基准价格指数',
  }
}

export function semanticSearchProducts(keyword, filters = {}) {
  const q = (keyword || '').trim().toLowerCase()
  const results = Object.keys(PRODUCT_CATALOG).map((name) => {
    const base = PRODUCT_CATALOG[name]
    const ext = PRODUCT_EXTENDED[name] || {}
    let score = 50
    if (name.includes(keyword) || keyword.includes(name)) score = 98
    else if (ext.keywords?.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()))) score = 88
    else if (base.hsCode.includes(keyword)) score = 95
    else if (base.desc.includes(keyword)) score = 72
    else if (q.includes('刹') || q.includes('brake')) score = name === '汽车配件' ? 85 : 40
    else if (q.includes('5g') || q.includes('通信')) score = name === '电子产品' ? 90 : 35
    else if (q.includes('机床') || q.includes('cnc')) score = name === '机械设备' ? 92 : 35
    return { name, hsCode: base.hsCode, category: base.category, desc: base.desc, confidence: score, ext }
  }).filter((r) => r.confidence >= 40)

  if (filters.targetMarket && filters.targetMarket !== 'all') {
    results.forEach((r) => { if (r.ext.archive?.consumers?.some((c) => c.country.includes(filters.targetMarket))) r.confidence += 5 })
  }
  return results.sort((a, b) => b.confidence - a.confidence)
}

export function getProductDetail(name) {
  const base = PRODUCT_CATALOG[name] || PRODUCT_CATALOG['汽车配件']
  const ext = PRODUCT_EXTENDED[name] || PRODUCT_EXTENDED['汽车配件']
  return { ...base, ...ext, name: name || '汽车配件' }
}

export function getPriceAnalysisData(name, granularity = 'month', timeRange = '6m') {
  const detail = getProductDetail(name)
  const pa = detail.priceAnalysis || PRODUCT_EXTENDED['汽车配件'].priceAnalysis
  const chain = pa.chain || {}
  const multiLine = expandChainSeries(chain, granularity, timeRange)
  const forecastLines = [
    ...(pa.forecast?.scenarios?.baseline || []).map((d) => ({ ...d, series: '稳健预测' })),
    ...(pa.forecast?.scenarios?.optimistic || []).map((d) => ({ ...d, series: '乐观情景' })),
    ...(pa.forecast?.scenarios?.pessimistic || []).map((d) => ({ ...d, series: '风险情景' })),
  ]
  const history5y = [
    { year: '2021', price: Math.round((pa.indices[0]?.value || 140) * 0.82) },
    { year: '2022', price: Math.round((pa.indices[0]?.value || 140) * 0.88) },
    { year: '2023', price: Math.round((pa.indices[0]?.value || 140) * 0.94) },
    { year: '2024', price: Math.round((pa.indices[0]?.value || 140) * 0.98) },
    { year: '2025', price: Math.round((pa.indices[0]?.value || 140) * 1.02) },
    { year: '2026', price: pa.indices[0]?.value || 140 },
  ]
  const currentPrice = pa.indices?.[0]?.value || 140
  const dailyChange = pa.indices?.[0]?.change || 0
  const attribution = {
    ...(pa.attribution || {}),
    historicalCompare: pa.attribution?.historicalCompare || [
      { event: '2024-Q2 原料涨价周期', similarity: 76, diff: '本次海运运费贡献更高，需求端更弱' },
      { event: '2023-W45 贸易政策扰动', similarity: 62, diff: '政策预期占比更高，库存水平更低' },
    ],
    methods: ['多元回归', '方差分解', '时间序列STL分解'],
  }

  return {
    ...pa,
    multiLine,
    forecastLines,
    history5y,
    granularity,
    timeRange,
    productName: name,
    currentPrice,
    dailyChange,
    dataSources: DEFAULT_DATA_SOURCES,
    standardization: buildStandardization(pa.indices),
    seasonalHeatmap: buildSeasonalHeatmap(currentPrice),
    influenceFactors: buildInfluenceFactors(pa, name),
    factorDatabase: buildFactorDatabase(pa.drivers),
    attribution,
    alert: pa.forecast?.alert || { upper: 150, lower: 125, triggered: false, probBreakUpper: 42 },
    hedging: pa.forecast?.hedging,
    model: pa.forecast?.model || 'PC-Stacking (LSTM+RF+XGB)',
  }
}

const SUPPLY_DEMAND_DATA = {
  汽车配件: {
    balance: {
      supply: { total: 1280, unit: '万吨当量', mom: 2.1, yoy: 5.8, topCountries: [{ name: '中国', share: 35 }, { name: '德国', share: 18 }, { name: '日本', share: 12 }] },
      demand: { total: 1210, mom: 3.2, yoy: 6.5, segments: [{ name: '售后替换', share: 52, growth: 8 }, { name: 'OEM配套', share: 35, growth: 4 }, { name: '改装', share: 13, growth: 12 }] },
      inventory: { total: 438, ratio: 0.36, turnoverDays: 45, types: [{ type: '港口库存', value: 120 }, { type: '商业库存', value: 210 }, { type: '交易所', value: 48 }, { type: '生产企业', value: 60 }] },
      gap: [
        { month: '2026-07', gap: -70, status: '短缺' },
        { month: '2026-08', gap: -85, status: '短缺' },
        { month: '2026-09', gap: -45, status: '紧平衡' },
      ],
      marketStatus: '紧平衡',
      history: [
        { period: '2026-01', supply: 1180, demand: 1120, inventory: 380 },
        { period: '2026-02', supply: 1195, demand: 1140, inventory: 395 },
        { period: '2026-03', supply: 1220, demand: 1165, inventory: 410 },
        { period: '2026-04', supply: 1240, demand: 1180, inventory: 420 },
        { period: '2026-05', supply: 1260, demand: 1195, inventory: 428 },
        { period: '2026-06', supply: 1280, demand: 1210, inventory: 438 },
      ],
    },
    imbalance: {
      summary: '欧洲售后需求回升叠加钢材原料传导，港口库存偏低，预计Q3维持紧平衡。',
      causes: [
        { reason: '上游钢材原料涨价', impact: '高', desc: '钢厂减产预期推升零部件成本' },
        { reason: '欧洲需求旺季', impact: '中', desc: '夏季出行高峰拉动刹车片需求' },
        { reason: '红海航线扰动', impact: '中', desc: '海运时效延长导致补库延迟' },
        { reason: '反倾销调查预期', impact: '低', desc: '部分企业惜售观望' },
      ],
    },
    tradeHeatmap: [
      { region: '欧盟', import: 88, export: 72, intensity: 92 },
      { region: '北美', import: 76, export: 65, intensity: 78 },
      { region: '东盟', import: 82, export: 90, intensity: 85 },
      { region: '中东', import: 45, export: 38, intensity: 42 },
      { region: '拉美', import: 52, export: 48, intensity: 50 },
    ],
    nodes: [
      { node: '长三角港口', metric: '集装箱吞吐量', value: '↑ 4.2%', status: '正常', alert: false },
      { node: '苏伊士运河', metric: '等待时间', value: '18h', status: '拥堵', alert: true },
      { node: '德国汉堡港', metric: '船舶排队', value: '12艘', status: '偏紧', alert: true },
      { node: 'CAx指数', metric: '集装箱可用性', value: '0.82', status: '偏紧', alert: false },
      { node: '供应商配送PMI', metric: '配送时间', value: '52.1', status: '延长', alert: true },
    ],
    bottleneck: {
      event: '苏伊士运河通行受限 + 汉堡港罢工风险',
      affected: ['欧洲航线交货延迟7-12天', '刹车片CIF价格上涨3-5%', '德国库存周转延长8天'],
      simulation: [
        { region: '德国', delay: 12, costUp: 4.2 },
        { region: '荷兰', delay: 10, costUp: 3.8 },
        { region: '波兰', delay: 8, costUp: 3.1 },
        { region: '意大利', delay: 14, costUp: 4.8 },
      ],
      suggestions: ['提前锁定Q3货源', '评估中欧班列替代', '增加安全库存15天'],
    },
  },
  电子产品: {
    balance: {
      supply: { total: 980, unit: '百万台', mom: 1.5, yoy: 8.2, topCountries: [{ name: '中国', share: 42 }, { name: '越南', share: 18 }, { name: '韩国', share: 15 }] },
      demand: { total: 1020, mom: 2.8, yoy: 9.5, segments: [{ name: '消费电子', share: 58, growth: 12 }, { name: '企业通信', share: 28, growth: 6 }, { name: 'IoT', share: 14, growth: 18 }] },
      inventory: { total: 285, ratio: 0.28, turnoverDays: 32, types: [{ type: '渠道库存', value: 150 }, { type: '工厂库存', value: 85 }, { type: '港口', value: 50 }] },
      gap: [
        { month: '2026-07', gap: 40, status: '短缺' },
        { month: '2026-08', gap: 55, status: '短缺' },
        { month: '2026-09', gap: 25, status: '紧平衡' },
      ],
      marketStatus: '供不应求',
      history: [
        { period: '2026-03', supply: 920, demand: 960, inventory: 260 },
        { period: '2026-06', supply: 980, demand: 1020, inventory: 285 },
      ],
    },
    imbalance: {
      summary: 'AI算力需求拉动通信设备订单，芯片供应仍为核心瓶颈。',
      causes: [
        { reason: '高端芯片短缺', impact: '高', desc: '7nm以下产能紧张' },
        { reason: '东南亚需求骤升', impact: '中', desc: '5G基建加速' },
        { reason: '美国出口管制', impact: '高', desc: '部分型号需替代方案' },
      ],
    },
    tradeHeatmap: [
      { region: '东盟', import: 95, export: 88, intensity: 98 },
      { region: '欧盟', import: 72, export: 68, intensity: 70 },
      { region: '北美', import: 85, export: 62, intensity: 82 },
    ],
    nodes: [
      { node: '深圳盐田港', metric: '出口集装箱', value: '↑ 6.1%', status: '繁忙', alert: false },
      { node: '台积电产能', metric: '利用率', value: '92%', status: '紧张', alert: true },
    ],
    bottleneck: {
      event: '先进制程芯片分配紧张',
      affected: ['高端路由器交期延长至16周', '部分型号涨价8-12%'],
      simulation: [{ region: '欧洲', delay: 0, costUp: 10 }, { region: '北美', delay: 0, costUp: 12 }],
      suggestions: ['锁定长协芯片配额', '评估中端替代方案'],
    },
  },
  机械设备: {
    balance: {
      supply: { total: 86, unit: '万台', mom: 0.8, yoy: 3.2, topCountries: [{ name: '德国', share: 28 }, { name: '中国', share: 32 }, { name: '日本', share: 18 }] },
      demand: { total: 82, mom: 1.2, yoy: 4.5, segments: [{ name: '汽车制造', share: 40, growth: 5 }, { name: '航空航天', share: 22, growth: 8 }] },
      inventory: { total: 28, ratio: 0.34, turnoverDays: 58, types: [{ type: '生产企业', value: 12 }, { type: '经销商', value: 16 }] },
      gap: [{ month: '2026-07', gap: -4, status: '紧平衡' }, { month: '2026-08', gap: 2, status: '过剩' }],
      marketStatus: '紧平衡',
      history: [{ period: '2026-06', supply: 86, demand: 82, inventory: 28 }],
    },
    imbalance: { summary: '欧洲能源成本压制产能，东南亚基建拉动需求。', causes: [{ reason: '欧洲能源价格', impact: '中', desc: '制造成本上升' }] },
    tradeHeatmap: [{ region: '东盟', import: 78, export: 65, intensity: 72 }],
    nodes: [{ node: '鹿特丹港', metric: '散货吞吐', value: '正常', status: '正常', alert: false }],
    bottleneck: { event: '暂无重大瓶颈', affected: [], simulation: [], suggestions: ['维持现有采购节奏'] },
  },
}

const TRADE_BARRIER_DATA = {
  汽车配件: {
    barriers: [
      { country: '美国', type: '关税', desc: 'MFN 2.5%，301清单部分子目+25%', law: 'Section 301', status: '生效中', rate: '27.5%', exemption: 'USMCA原产地', originRule: 'RVC≥75%' },
      { country: '德国', type: 'TBT', desc: 'ECE R90制动器认证', law: 'EU 661/2009', status: '生效中', rate: '-', exemption: '-', originRule: '非优惠' },
      { country: '德国', type: '反倾销', desc: '部分制动器反倾销税', law: 'EU 2024/xxx', status: '调查中', rate: '12.6%', exemption: '价格承诺', originRule: '中国原产' },
      { country: '印度', type: 'SPS', desc: 'BIS强制认证', law: 'BIS Act', status: '生效中', rate: '-', exemption: '-', originRule: '-' },
    ],
    routes: [
      { id: 'direct-us', name: '中国直出口美国', tariff: 27.5, vat: 0, addDuty: 0, agency: 2.5, total: 30.0 },
      { id: 'asean-us', name: '东盟转口美国', tariff: 15.0, vat: 0, addDuty: 0, agency: 3.5, total: 18.5 },
      { id: 'fta-de', name: '自贸协定出口德国', tariff: 0, vat: 19, addDuty: 0, agency: 1.8, total: 20.8 },
    ],
    certifications: [
      { market: '欧盟', cert: 'ECE R90', mandatory: true, cycle: '6-9个月', agency: 'TÜV/莱茵' },
      { market: '美国', cert: 'FMVSS/DOT', mandatory: true, cycle: '4-6个月', agency: 'NHTSA认可实验室' },
      { market: '印度', cert: 'BIS', mandatory: true, cycle: '3-5个月', agency: 'BIS指定机构' },
    ],
    documents: [
      { doc: '商业发票', required: true, lang: 'EN' },
      { doc: '装箱单', required: true, lang: 'EN' },
      { doc: '原产地证(Form E/RCEP)', required: true, lang: 'EN/中文' },
      { doc: 'ECE认证证书', required: true, lang: 'EN' },
      { doc: 'REACH声明', required: true, lang: 'EN' },
    ],
  },
  电子产品: {
    barriers: [
      { country: '美国', type: '关税', desc: 'Section 301 25%', law: 'USTR', status: '生效中', rate: '25%', exemption: '-', originRule: '中国原产' },
      { country: '欧盟', type: 'TBT', desc: 'CE RED指令', law: '2014/53/EU', status: '生效中', rate: '-', exemption: '-', originRule: '-' },
      { country: '美国', type: '出口管制', desc: 'EAR高端芯片限制', law: 'BIS', status: '生效中', rate: '-', exemption: '许可例外', originRule: '-' },
      { country: '印度', type: 'TBT', desc: 'BIS强制注册', law: 'BIS', status: '生效中', rate: '-', exemption: '-', originRule: '-' },
    ],
    routes: [
      { id: 'direct-us', name: '中国直出口美国', tariff: 25, vat: 0, addDuty: 0, agency: 2.0, total: 27.0 },
      { id: 'vietnam-us', name: '越南组装出口美国', tariff: 0, vat: 0, addDuty: 0, agency: 2.5, total: 2.5 },
    ],
    certifications: [
      { market: '欧盟', cert: 'CE RED', mandatory: true, cycle: '4-8周', agency: 'Notified Body' },
      { market: '美国', cert: 'FCC', mandatory: true, cycle: '2-4周', agency: 'TCB' },
    ],
    documents: [
      { doc: '商业发票', required: true, lang: 'EN' },
      { doc: 'CE/FCC证书', required: true, lang: 'EN' },
      { doc: 'RoHS报告', required: true, lang: 'EN' },
    ],
  },
  机械设备: {
    barriers: [
      { country: '德国', type: 'TBT', desc: 'CE机械指令2006/42/EC', law: 'MD', status: '生效中', rate: '-', exemption: '-', originRule: '-' },
      { country: '沙特', type: 'TBT', desc: 'SABER认证', law: 'SASO', status: '生效中', rate: '-', exemption: '-', originRule: '-' },
    ],
    routes: [
      { id: 'direct-de', name: '直出口德国', tariff: 0, vat: 19, addDuty: 0, agency: 2.0, total: 21.0 },
    ],
    certifications: [{ market: '欧盟', cert: 'CE MD', mandatory: true, cycle: '3-6个月', agency: 'Notified Body' }],
    documents: [{ doc: 'CE技术文件', required: true, lang: 'EN/DE' }, { doc: '操作手册', required: true, lang: 'EN/DE' }],
  },
}

export const BARRIER_COUNTRY_OPTIONS = [
  { value: 'all', label: '全部国家' },
  { value: '美国', label: '美国' },
  { value: '德国', label: '德国' },
  { value: '欧盟', label: '欧盟' },
  { value: '印度', label: '印度' },
  { value: '东盟', label: '东盟' },
]

export function getSupplyDemandData(name) {
  return SUPPLY_DEMAND_DATA[name] || SUPPLY_DEMAND_DATA['汽车配件']
}

export function getTradeBarrierData(name, country = 'all') {
  const base = TRADE_BARRIER_DATA[name] || TRADE_BARRIER_DATA['汽车配件']
  const barriers = country === 'all' ? base.barriers : base.barriers.filter((b) => b.country.includes(country) || country.includes(b.country))
  return { ...base, barriers: barriers.length ? barriers : base.barriers }
}

export function calcBarrierCost(cargoValue, route, barriers = []) {
  const value = Number(cargoValue) || 0
  const tariffCost = value * (route.tariff / 100)
  const vatCost = (value + tariffCost) * (route.vat / 100)
  const addDuty = value * (route.addDuty / 100)
  const agency = value * (route.agency / 100)
  const total = value + tariffCost + vatCost + addDuty + agency
  return {
    cargoValue: value,
    tariffCost: Math.round(tariffCost * 100) / 100,
    vatCost: Math.round(vatCost * 100) / 100,
    addDuty: Math.round(addDuty * 100) / 100,
    agency: Math.round(agency * 100) / 100,
    total: Math.round(total * 100) / 100,
    rateTotal: route.total,
  }
}

export const ENTERPRISE_CATALOG = {
  华贸进出口集团: {
    id: 'ENT-001',
    name: '华贸进出口集团',
    type: '进出口贸易',
    region: '广东深圳',
    founded: '2008',
    creditScore: 92,
    creditLevel: 'AAA',
    healthRadar: [
      { item: '营收增长', score: 88 }, { item: '利润水平', score: 85 },
      { item: '现金流', score: 90 }, { item: '合规记录', score: 94 },
      { item: '供应链稳定', score: 86 }, { item: '市场拓展', score: 82 },
    ],
    tradeHistory: [
      { date: '2026-06-01', type: '出口', product: '汽车配件', amount: '1280万', country: '德国' },
      { date: '2026-05-18', type: '进口', product: '电子产品', amount: '860万', country: '日本' },
      { date: '2026-05-02', type: '出口', product: '机械设备', amount: '2100万', country: '东南亚' },
      { date: '2026-04-15', type: '出口', product: '汽车配件', amount: '950万', country: '美国' },
      { date: '2026-03-28', type: '进口', product: '机械设备', amount: '1560万', country: '德国' },
    ],
    relatedEnterprises: [
      { name: '华南汽配供应链', relation: '上游供应商' },
      { name: '远洋物流集团', relation: '物流合作' },
      { name: '德意志工业代理', relation: '海外客户' },
      { name: '深圳跨境金融', relation: '金融服务' },
    ],
  },
  远洋供应链公司: {
    id: 'ENT-002',
    name: '远洋供应链公司',
    type: '供应链服务',
    region: '上海',
    founded: '2012',
    creditScore: 86,
    creditLevel: 'AA',
    healthRadar: [
      { item: '营收增长', score: 82 }, { item: '利润水平', score: 78 },
      { item: '现金流', score: 84 }, { item: '合规记录', score: 88 },
      { item: '供应链稳定', score: 90 }, { item: '市场拓展', score: 80 },
    ],
    tradeHistory: [
      { date: '2026-06-05', type: '进口', product: '电子产品', amount: '720万', country: '韩国' },
      { date: '2026-05-20', type: '出口', product: '汽车配件', amount: '580万', country: '墨西哥' },
      { date: '2026-04-28', type: '进口', product: '机械设备', amount: '1320万', country: '德国' },
    ],
    relatedEnterprises: [
      { name: '华贸进出口集团', relation: '战略合作' },
      { name: '日韩电子联盟', relation: '供应商' },
      { name: '墨西哥组装厂', relation: '下游客户' },
    ],
  },
  丝路跨境贸易: {
    id: 'ENT-003',
    name: '丝路跨境贸易',
    type: '跨境贸易',
    region: '浙江杭州',
    founded: '2015',
    creditScore: 78,
    creditLevel: 'A',
    healthRadar: [
      { item: '营收增长', score: 75 }, { item: '利润水平', score: 72 },
      { item: '现金流', score: 76 }, { item: '合规记录', score: 80 },
      { item: '供应链稳定', score: 74 }, { item: '市场拓展', score: 78 },
    ],
    tradeHistory: [
      { date: '2026-06-08', type: '出口', product: '机械设备', amount: '680万', country: '中东' },
      { date: '2026-05-12', type: '进口', product: '汽车配件', amount: '420万', country: '日本' },
    ],
    relatedEnterprises: [
      { name: '中东能源贸易', relation: '海外客户' },
      { name: '杭州跨境仓储', relation: '仓储合作' },
    ],
  },
}

export const ENTERPRISE_EXTENDED = {
  华贸进出口集团: {
    scope: '汽车配件、机电设备进出口；覆盖欧美及东南亚20+国家',
    revenueTrend: [
      { year: '2023', revenue: 8.2, growth: 12 },
      { year: '2024', revenue: 9.6, growth: 17 },
      { year: '2025', revenue: 11.2, growth: 16 },
    ],
    marketShare: '华南汽配出口排名第8',
    industryRank: '区域领先',
    healthScore: 88,
    healthLevel: '良好',
    healthDims: { finance: 86, risk: 90, operation: 87, credit: 92 },
    patents: 12,
    litigation: 0,
    penalties: 0,
    equityGraph: {
      nodes: [
        { id: 'root', label: '华贸进出口集团', type: 'self', x: 50, y: 15 },
        { id: 'p1', label: '华贸控股(75%)', type: 'parent', x: 50, y: 35 },
        { id: 's1', label: '深圳华贸物流(100%)', type: 'subsidiary', x: 25, y: 55 },
        { id: 's2', label: '德国销售子公司(80%)', type: 'subsidiary', x: 75, y: 55 },
        { id: 'u1', label: '华南汽配供应链', type: 'partner', x: 25, y: 80 },
      ],
      edges: [{ from: 'p1', to: 'root' }, { from: 'root', to: 's1' }, { from: 'root', to: 's2' }, { from: 'u1', to: 'root' }],
    },
    tradeNetwork: {
      suppliers: [
        { name: '华南汽配供应链', country: '中国', years: 5, share: 35, products: '刹车片/滤芯' },
        { name: '东莞精密制造', country: '中国', years: 3, share: 22, products: '传感器' },
        { name: '日韩电子联盟', country: '韩国', years: 4, share: 18, products: '电子模块' },
      ],
      buyers: [
        { name: '德意志工业代理', country: '德国', years: 6, share: 28, products: '汽车配件' },
        { name: '北美汽配连锁', country: '美国', years: 3, share: 20, products: '售后件' },
        { name: '墨西哥组装厂', country: '墨西哥', years: 2, share: 15, products: 'OEM配套' },
      ],
      concentration: '前三大供应商占比75%，存在一定集中风险',
    },
    competitors: ['远洋供应链公司', '丝路跨境贸易'],
    competitorAnalysis: {
      rivals: [
        { name: '远洋供应链公司', revenue: '6.8亿', marketShare: '12%', rdRatio: '3.2%', patents: 5, margin: '15%' },
        { name: '丝路跨境贸易', revenue: '4.2亿', marketShare: '8%', rdRatio: '2.1%', patents: 2, margin: '12%' },
      ],
      self: { name: '华贸进出口集团', revenue: '11.2亿', marketShare: '18%', rdRatio: '4.5%', patents: 12, margin: '18%' },
      radarCompare: [
        { item: '营收规模', self: 88, rival1: 72, rival2: 58 },
        { item: '毛利率', self: 72, rival1: 65, rival2: 55 },
        { item: '研发投入', self: 68, rival1: 55, rival2: 42 },
        { item: '市场覆盖', self: 85, rival1: 78, rival2: 70 },
        { item: '交付准时率', self: 90, rival1: 88, rival2: 75 },
        { item: '客户留存', self: 82, rival1: 80, rival2: 68 },
      ],
      gapTable: [
        { metric: '毛利率', self: '18%', rival: '15%', gap: '+3ppt', note: '规模采购优势' },
        { metric: '研发投入占比', self: '4.5%', rival: '3.2%', gap: '+1.3ppt', note: '产品迭代更快' },
        { metric: '覆盖国家数', self: '22', rival: '18', gap: '+4', note: '欧洲渠道更深' },
      ],
      strategyPath: [
        { year: '2018', event: '进入德国售后市场' },
        { year: '2020', event: '建立东南亚仓储中心' },
        { year: '2022', event: '收购深圳物流公司' },
        { year: '2024', event: '纯电配件产品线发布' },
      ],
      dashboard: [
        { type: '订单', content: '新获德国刹车片订单860万', date: '2026-06-18' },
        { type: '招聘', content: '招聘欧洲销售经理3名', date: '2026-06-12' },
        { type: '产品', content: '发布新一代传感器模块', date: '2026-06-05' },
      ],
      alerts: [
        { level: '中', title: '竞争对手远洋供应链德国出口量+52%', desc: '2026年5月海关数据', date: '2026-06-20' },
      ],
    },
    partnerEval: {
      supplier: {
        dimensions: [
          { dim: '质量', score: 88, weight: 25 }, { dim: '成本', score: 82, weight: 20 },
          { dim: '交付', score: 90, weight: 25 }, { dim: '服务', score: 85, weight: 15 }, { dim: '风险', score: 86, weight: 15 },
        ],
        total: 87,
        risks: ['无重大风险'],
      },
      customer: {
        dimensions: [
          { dim: '信用', score: 92, weight: 30 }, { dim: '价值', score: 88, weight: 25 },
          { dim: '战略匹配', score: 85, weight: 25 }, { dim: '稳定性', score: 90, weight: 20 },
        ],
        total: 89,
        risks: ['无逾期记录'],
      },
    },
    benchmarks: {
      recommended: [
        { name: '宁德时代', type: '规模对标', industry: '新能源', score: 95 },
        { name: '怡合达', type: '路径对标', industry: '零部件', score: 88 },
        { name: '顺丰国际', type: '运营对标', industry: '跨境物流', score: 90 },
      ],
      gaps: [
        { metric: '研发投入占比', self: '4.5%', benchmark: '8.2%', gap: '-3.7ppt', factor: '产品定价偏低15%' },
        { metric: '库存周转率', self: '6.2次', benchmark: '9.5次', gap: '-3.3次', factor: 'JIT模式未导入' },
        { metric: '海外渗透率', self: '22国', benchmark: '45国', gap: '-23国', factor: '东南亚布局不足' },
      ],
      practices: [
        { title: '丰田JIT供应模式', link: '降低库存成本30%', domain: '供应链' },
        { title: '海尔欧洲本土化', link: '复制渠道建设策略', domain: '市场拓展' },
      ],
      actions: ['提升研发至营收8%', '引入JIT试点', '加大东南亚渠道投入'],
    },
    dueDiligence: {
      riskLevel: '低',
      checks: ['建议核查德国子公司实缴资本', '确认核心产能8800万件/年'],
      summary: '综合信用AAA，经营稳健，适合作为核心供应商/战略合作伙伴。',
    },
  },
  远洋供应链公司: {
    scope: '跨境供应链整合、海运空运、保税仓储',
    revenueTrend: [{ year: '2024', revenue: 5.8, growth: 10 }, { year: '2025', revenue: 6.8, growth: 17 }],
    marketShare: '长三角供应链服务第12',
    healthScore: 84,
    healthLevel: '良好',
    healthDims: { finance: 80, risk: 85, operation: 88, credit: 86 },
    patents: 5,
    litigation: 1,
    penalties: 0,
    equityGraph: { nodes: [{ id: 'root', label: '远洋供应链', type: 'self', x: 50, y: 30 }, { id: 's1', label: '上海仓储(100%)', type: 'subsidiary', x: 30, y: 60 }], edges: [{ from: 'root', to: 's1' }] },
    tradeNetwork: {
      suppliers: [{ name: '日韩电子联盟', country: '韩国', years: 4, share: 40, products: '电子' }],
      buyers: [{ name: '华贸进出口集团', country: '中国', years: 5, share: 30, products: '综合' }],
      concentration: '客户集中度中等',
    },
    competitors: ['华贸进出口集团'],
    competitorAnalysis: {
      rivals: [{ name: '华贸进出口集团', revenue: '11.2亿', marketShare: '18%', rdRatio: '4.5%', patents: 12, margin: '18%' }],
      self: { name: '远洋供应链公司', revenue: '6.8亿', marketShare: '12%', rdRatio: '3.2%', patents: 5, margin: '15%' },
      radarCompare: [{ item: '营收规模', self: 72, rival1: 88 }],
      gapTable: [{ metric: '毛利率', self: '15%', rival: '18%', gap: '-3ppt', note: '采购成本偏高' }],
      strategyPath: [{ year: '2021', event: '拓展墨西哥航线' }],
      dashboard: [{ type: '订单', content: '德国航线运量+52%', date: '2026-06-15' }],
      alerts: [{ level: '高', title: '出口量单月激增52%', desc: '德国航线', date: '2026-06-20' }],
    },
    partnerEval: {
      supplier: { dimensions: [{ dim: '交付', score: 92, weight: 30 }, { dim: '服务', score: 88, weight: 25 }], total: 88, risks: ['1次报关差错'] },
      customer: { dimensions: [{ dim: '信用', score: 86, weight: 30 }], total: 84, risks: ['无'] },
    },
    benchmarks: { recommended: [{ name: 'DHL供应链', type: '规模对标', industry: '物流', score: 92 }], gaps: [], practices: [], actions: ['优化航线成本'] },
    dueDiligence: { riskLevel: '中', checks: ['核实诉讼进展'], summary: '物流能力突出，需关注客户集中度。' },
  },
  丝路跨境贸易: {
    scope: '中东、中亚跨境贸易',
    revenueTrend: [{ year: '2025', revenue: 4.2, growth: 14 }],
    healthScore: 76,
    healthLevel: '良好',
    healthDims: { finance: 72, risk: 78, operation: 75, credit: 78 },
    patents: 2,
    litigation: 0,
    penalties: 1,
    equityGraph: { nodes: [{ id: 'root', label: '丝路跨境', type: 'self', x: 50, y: 50 }], edges: [] },
    tradeNetwork: { suppliers: [], buyers: [{ name: '中东能源贸易', country: '阿联酋', years: 3, share: 45, products: '机械' }], concentration: '区域集中度高' },
    competitors: ['华贸进出口集团'],
    partnerEval: {
      supplier: { dimensions: [{ dim: '成本', score: 80, weight: 30 }], total: 78, risks: ['1次行政处罚', '2次逾期付款'] },
      customer: { dimensions: [{ dim: '稳定性', score: 70, weight: 30 }], total: 72, risks: ['订单波动大'] },
    },
    benchmarks: { recommended: [{ name: '新疆众和', type: '区域对标', industry: '跨境', score: 80 }], gaps: [], practices: [], actions: [] },
    dueDiligence: { riskLevel: '中', checks: ['核查行政处罚详情', '确认中东客户真实性'], summary: '区域特色明显，合作需加强信用监控。' },
  },
}

export const ENTERPRISE_SORT_OPTIONS = [
  { value: 'creditScore', label: '信用等级' },
  { value: 'healthScore', label: '健康度' },
  { value: 'revenue', label: '营收规模' },
]

export function searchEnterprises(keyword = '', sortBy = 'creditScore', geoFilters = {}) {
  const list = Object.keys(ENTERPRISE_CATALOG).map((name) => getEnterpriseDetail(name))
  const q = (keyword || '').trim()
  let filtered = q
    ? list.filter((e) =>
      e.name.includes(q) || e.type.includes(q) || e.region.includes(q) || formatGeoLocation(e).includes(q),
    )
    : list
  if (geoFilters.geoMacro || geoFilters.geoCountry || geoFilters.geoCity) {
    filtered = filtered.filter((e) => matchesGeoFilter(e, geoFilters))
  }
  return filtered.sort((a, b) => {
    if (sortBy === 'revenue') return (b.revenueTrend?.[b.revenueTrend.length - 1]?.revenue || 0) - (a.revenueTrend?.[a.revenueTrend.length - 1]?.revenue || 0)
    if (sortBy === 'healthScore') return (b.healthScore || 0) - (a.healthScore || 0)
    return (b.creditScore || 0) - (a.creditScore || 0)
  })
}

export function getEnterpriseDetail(name) {
  const key = Object.keys(ENTERPRISE_CATALOG).find((k) => k.includes(name) || name.includes(k)) || '华贸进出口集团'
  const base = ENTERPRISE_CATALOG[key]
  const ext = ENTERPRISE_EXTENDED[key] || {}
  const merged = applyGeoLocation({ ...base, ...ext, name: base.name }, ENTERPRISE_GEO_SEED)
  return merged
}

export function getCompetitorAnalysis(name) {
  const ent = getEnterpriseDetail(name)
  return ent.competitorAnalysis || ENTERPRISE_EXTENDED['华贸进出口集团'].competitorAnalysis
}

export function getPartnerEvaluation(name, role = 'supplier') {
  const ent = getEnterpriseDetail(name)
  return ent.partnerEval?.[role] || ENTERPRISE_EXTENDED['华贸进出口集团'].partnerEval.supplier
}

export function getBenchmarkData(name) {
  const ent = getEnterpriseDetail(name)
  return ent.benchmarks || ENTERPRISE_EXTENDED['华贸进出口集团'].benchmarks
}

export function buildDueDiligenceReport(name) {
  const ent = getEnterpriseDetail(name)
  const dd = ent.dueDiligence || {}
  return {
    title: `${ent.name} · 初步尽职调查报告`,
    generatedAt: '2026-07-02',
    basic: { name: ent.name, id: ent.id, type: ent.type, region: ent.region, founded: ent.founded, scope: ent.scope },
    finance: ent.revenueTrend,
    risks: {
      litigation: ent.litigation,
      penalties: ent.penalties,
      level: dd.riskLevel,
      items: ent.partnerEval?.supplier?.risks || [],
    },
    trade: ent.tradeHistory,
    network: ent.tradeNetwork,
    score: ent.healthScore,
    level: ent.healthLevel,
    checks: dd.checks || [],
    summary: dd.summary,
  }
}

export function getMarketHeatmapCells(extended, timelinePoint) {
  const cells = (extended?.heatmapCells || []).map((cell) => ({
    ...cell,
    population: cell.population ?? Math.round((cell.gdp || 50) * 0.92),
    nightlight: cell.nightlight ?? Math.round((cell.trade || 50) * 0.88),
    ftz: cell.ftz ?? Math.round(100 - (cell.risk || 40) * 0.6),
  }))
  if (!timelinePoint || !extended?.timeline?.length) return cells
  const latest = extended.timeline[extended.timeline.length - 1]?.value || timelinePoint.value || 1
  const factor = timelinePoint.value / latest
  return cells.map((cell) => ({
    ...cell,
    trade: Math.round(cell.trade * (0.82 + factor * 0.18)),
    gdp: Math.round(cell.gdp * (0.85 + factor * 0.15)),
    population: Math.round(cell.population * (0.88 + factor * 0.12)),
    nightlight: Math.round(cell.nightlight * (0.86 + factor * 0.14)),
    risk: Math.round(cell.risk * (1.05 - factor * 0.05)),
    climate: Math.round(cell.climate * (0.9 + factor * 0.1)),
  }))
}

function resolvePeriodKey(period) {
  if (period === '1d') return '1m'
  if (period === '1q') return '6m'
  if (period === '10y') return '1y'
  return ['1m', '6m', '1y'].includes(period) ? period : '6m'
}

export function getMarketData(country, period, options = {}) {
  const periodKey = resolvePeriodKey(period)
  const base = MARKET_DATA[country]?.[periodKey] || MARKET_DATA.germany[periodKey] || MARKET_DATA.germany['6m']
  const rawExtended = MARKET_EXTENDED[country] || MARKET_EXTENDED.germany

  const trend = period === '1d'
    ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((month, i) => ({
      month,
      value: Math.round((base.trend?.[base.trend.length - 1]?.value || 80) * (0.78 + i * 0.04)),
    }))
    : period === '1q'
      ? ['Q1', 'Q2', 'Q3', 'Q4'].map((month, i) => ({
        month,
        value: Math.round((base.trend?.[i]?.value || base.trend?.[0]?.value || 100) * (1 + i * 0.05)),
      }))
      : period === '10y'
        ? (rawExtended.timeline || []).map((t) => ({ month: String(t.year), value: t.value }))
        : base.trend

  const overviewScale = period === '1d' ? 0.04 : period === '1q' ? 0.28 : period === '10y' ? 3.2 : period === '1y' ? 1 : period === '1m' ? 0.18 : 1

  return {
    ...base,
    overview: {
      ...base.overview,
      marketSize: Math.round(base.overview.marketSize * overviewScale * 10) / 10,
    },
    trend,
    extended: rawExtended,
    country,
    period,
    periodKey,
  }
}

export function getDemandSegments(country, category) {
  const ext = MARKET_EXTENDED[country] || MARKET_EXTENDED.germany
  const raw = ext.demandSegments?.[category] || ext.demandSegments?.vehicle || { byType: [], insights: [] }
  return {
    ...raw,
    byPrice: raw.byPrice?.length ? raw.byPrice : [
      { name: '豪华', share: 22, growth: 8 },
      { name: '中高端', share: 45, growth: 5 },
      { name: '经济型', share: 33, growth: -1 },
    ],
    byChannel: raw.byChannel?.length ? raw.byChannel : [
      { name: '4S店/经销商', share: 42, growth: 3 },
      { name: '平行进口', share: 12, growth: -2 },
      { name: '线上渠道', share: 28, growth: 18 },
      { name: 'B2B平台', share: 18, growth: 12 },
    ],
    sentiment: raw.sentiment || [
      { topic: '价格敏感度', score: 70, trend: '上升', source: 'GlobalData' },
      { topic: '品牌偏好', score: 64, trend: '稳定', source: '消费者调研' },
      { topic: '功能体验', score: 78, trend: '上升', source: '电商评论' },
    ],
  }
}

export const FORECAST_HORIZONS = [
  { value: 1, label: '1年（月度）' },
  { value: 3, label: '3年（季度）' },
  { value: 5, label: '5年（年度）' },
]

export const FORECAST_MODELS = [
  { id: 'arima', name: 'ARIMA', type: '时间序列', mape: 9.8, rmse: 14.2, stability: 88, oos: 91, selected: false },
  { id: 'sarima', name: 'SARIMA', type: '时间序列', mape: 8.6, rmse: 12.8, stability: 90, oos: 93, selected: true },
  { id: 'ets', name: '指数平滑', type: '时间序列', mape: 10.2, rmse: 15.1, stability: 86, oos: 89, selected: false },
  { id: 'regression', name: '多元回归', type: '计量经济', mape: 8.9, rmse: 13.5, stability: 87, oos: 90, selected: false },
  { id: 'panel', name: '面板数据', type: '计量经济', mape: 8.1, rmse: 12.2, stability: 91, oos: 92, selected: false },
  { id: 'xgb', name: 'XGBoost', type: '机器学习', mape: 7.2, rmse: 10.8, stability: 93, oos: 94, selected: true },
  { id: 'lgbm', name: 'LightGBM', type: '机器学习', mape: 7.5, rmse: 11.2, stability: 92, oos: 93, selected: false },
  { id: 'rf', name: 'Random Forest', type: '机器学习', mape: 8.0, rmse: 11.9, stability: 90, oos: 91, selected: false },
  { id: 'lstm', name: 'LSTM', type: '深度学习', mape: 7.8, rmse: 11.5, stability: 89, oos: 92, selected: false },
  { id: 'transformer', name: 'Transformer', type: '深度学习', mape: 7.4, rmse: 11.0, stability: 88, oos: 91, selected: false },
]

export const LEADING_INDICATORS = {
  vehicle: [
    { name: '新屋开工许可', correlation: 0.82, lead: '3个月', weight: 0.28 },
    { name: '制造业PMI', correlation: 0.76, lead: '2个月', weight: 0.22 },
    { name: '长期贷款利率', correlation: -0.68, lead: '4个月', weight: 0.18 },
    { name: '消费者信心指数', correlation: 0.71, lead: '2个月', weight: 0.16 },
    { name: '电商搜索热度', correlation: 0.65, lead: '1个月', weight: 0.16 },
  ],
  machinery: [
    { name: '建筑业PMI', correlation: 0.79, lead: '3个月', weight: 0.30 },
    { name: '固定资产投资', correlation: 0.74, lead: '4个月', weight: 0.25 },
    { name: '钢材产量', correlation: 0.70, lead: '2个月', weight: 0.20 },
    { name: '工业库存指数', correlation: -0.62, lead: '3个月', weight: 0.15 },
  ],
  electronics: [
    { name: '半导体出货', correlation: 0.81, lead: '2个月', weight: 0.32 },
    { name: '居民可支配收入', correlation: 0.69, lead: '3个月', weight: 0.24 },
    { name: '5G基站建设', correlation: 0.72, lead: '4个月', weight: 0.22 },
  ],
  agri: [
    { name: 'CPI食品分项', correlation: 0.75, lead: '2个月', weight: 0.30 },
    { name: '气候指数', correlation: -0.58, lead: '1个月', weight: 0.20 },
  ],
}

export const SHOCK_EVENTS = [
  { id: 'tariff', name: '关税上调10%', impact: -8, lag: '2个月', enabled: false },
  { id: 'subsidy', name: '补贴政策加码', impact: 12, lag: '1个月', enabled: false },
  { id: 'expo', name: '国际展会脉冲', impact: 6, lag: '即时', enabled: false },
  { id: 'weather', name: '极端天气冲击', impact: -5, lag: '1个月', enabled: false },
  { id: 'geopolitics', name: '地缘政治事件', impact: -10, lag: '3个月', enabled: false },
]

export const SCENARIO_PRESETS = [
  { id: 'baseline', name: '基准情景', gdpDelta: 0, materialDelta: 0, desc: '常规宏观假设' },
  { id: 'optimistic', name: '乐观情景', gdpDelta: 1, materialDelta: -5, desc: 'GDP增速+1ppt，成本下行' },
  { id: 'pessimistic', name: '悲观情景', gdpDelta: -1, materialDelta: 20, desc: 'GDP降1ppt，原材料+20%' },
  { id: 'policy', name: '政策冲击', gdpDelta: 0, materialDelta: 0, policyShock: true, desc: '补贴取消/关税上调' },
]

const MONTHS = ['2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']

export function getForecastData(country, category, horizon = 1) {
  const base = country === 'usa' ? 420 : country === 'asean' ? 165 : 325
  const growth = category === 'electronics' ? 1.12 : category === 'vehicle' ? 1.06 : 1.08
  const historical = MONTHS.slice(0, 12).map((m, i) => ({
    month: m,
    actual: Math.round(base * (0.85 + i * 0.012) * 10) / 10,
    type: '历史',
  }))
  const forecastMonths = horizon === 1 ? MONTHS.slice(12, 24) : horizon === 3 ? MONTHS.slice(12) : ['2027', '2028', '2029', '2030', '2031']
  const baseline = forecastMonths.map((m, i) => ({
    month: m,
    value: Math.round(base * growth ** (i / 12) * (1 + i * 0.008) * 10) / 10,
    type: '基准',
  }))
  const optimistic = baseline.map((b, i) => ({ ...b, value: Math.round(b.value * (1 + 0.05 + i * 0.003) * 10) / 10, type: '乐观' }))
  const pessimistic = baseline.map((b, i) => ({ ...b, value: Math.round(b.value * (1 - 0.08 - i * 0.002) * 10) / 10, type: '悲观' }))

  return {
    ensemble: 'SARIMA(40%) + XGBoost(60%) 加权集成',
    mape: 7.2,
    decomposition: [
      { component: '趋势项', share: 62, desc: '长期结构性增长' },
      { component: '周期项', share: 28, desc: '季节性波动' },
      { component: '随机冲击', share: 10, desc: '政策/事件扰动' },
    ],
    historical,
    baseline,
    optimistic,
    pessimistic,
    gaps: [
      { segment: '纯电SUV', growth: 35, type: 'accelerating', label: '需求加速' },
      { segment: '高端传感器', growth: 22, type: 'accelerating', label: '细分爆发' },
      { segment: '传统燃油轿车', growth: -8, type: 'declining', label: '结构性收缩' },
      { segment: '二手设备翻新', growth: 0, type: 'whitespace', label: '潜在空白' },
    ],
    forecastTable: baseline.map((b, i) => ({
      period: b.month,
      baseline: b.value,
      optimistic: optimistic[i].value,
      pessimistic: pessimistic[i].value,
      errorBand: '±6.5%',
    })),
  }
}

export function buildMonteCarloFan(baseline, runs = 1000) {
  const fan = []
  baseline.forEach((point, idx) => {
    const spread = point.value * (0.05 + idx * 0.003)
    fan.push({ month: point.month, value: point.value - spread * 1.5, quantile: 'P10' })
    fan.push({ month: point.month, value: point.value - spread * 0.5, quantile: 'P25' })
    fan.push({ month: point.month, value: point.value, quantile: 'P50' })
    fan.push({ month: point.month, value: point.value + spread * 0.5, quantile: 'P75' })
    fan.push({ month: point.month, value: point.value + spread * 1.5, quantile: 'P90' })
  })
  return { fan, runs }
}

export function applyScenarioForecast(baseline, scenario) {
  const gdpFactor = 1 + (scenario.gdpDelta || 0) * 0.04
  const materialFactor = 1 - (scenario.materialDelta || 0) * 0.003
  const policyFactor = scenario.policyShock ? 0.92 : 1
  return baseline.map((b, i) => ({
    ...b,
    value: Math.round(b.value * gdpFactor * materialFactor * policyFactor * (1 + i * 0.001) * 10) / 10,
    type: scenario.name || '自定义',
  }))
}

const COMPETITOR_PROFILES = {
  germany: {
    vehicle: {
      hhi: 1420,
      cr3: 58,
      cr5: 72,
      trend: '集中化',
      competitors: [
        { name: '大众集团', share: 22, shareTrend: 1.2, isSelf: false },
        { name: '奔驰', share: 14, shareTrend: -0.5, isSelf: false },
        { name: '宝马', share: 12, shareTrend: 0.8, isSelf: false },
        { name: '特斯拉', share: 9, shareTrend: 2.5, isSelf: false },
        { name: '我司（示例）', share: 4, shareTrend: 1.8, isSelf: true },
        { name: 'Stellantis', share: 8, shareTrend: -1.2, isSelf: false },
        { name: '其他', share: 31, shareTrend: -4.8, isSelf: false },
      ],
      shareHistory: [
        { period: '2022Q1', top1: 24, top3: 56, hhi: 1380 },
        { period: '2023Q1', top1: 23, top3: 57, hhi: 1395 },
        { period: '2024Q1', top1: 22, top3: 58, hhi: 1410 },
        { period: '2025Q1', top1: 22, top3: 58, hhi: 1420 },
        { period: '2026Q1', top1: 21, top3: 59, hhi: 1435 },
      ],
      positioning: [
        { name: '我司（示例）', price: 62, quality: 78, brand: 55, channel: 48, service: 72, isSelf: true },
        { name: '大众', price: 58, quality: 75, brand: 82, channel: 88, service: 70, isSelf: false },
        { name: '奔驰', price: 88, quality: 92, brand: 95, channel: 85, service: 88, isSelf: false },
        { name: '宝马', price: 85, quality: 90, brand: 92, channel: 82, service: 85, isSelf: false },
        { name: '特斯拉', price: 72, quality: 80, brand: 78, channel: 65, service: 62, isSelf: false },
        { name: 'Stellantis', price: 52, quality: 68, brand: 65, channel: 75, service: 68, isSelf: false },
      ],
      intelFeed: [
        { date: '2026-06-18', source: '官网', type: '新品发布', title: '奔驰发布新一代纯电平台', competitor: '奔驰' },
        { date: '2026-06-15', source: '招聘', type: '研发岗位', title: '特斯拉柏林工厂扩招电池工程师', competitor: '特斯拉' },
        { date: '2026-06-12', source: '专利', type: '专利申请', title: '大众固态电池热管理专利授权', competitor: '大众' },
        { date: '2026-06-10', source: '电商', type: '促销', title: '宝马全系金融贴息0利率', competitor: '宝马' },
        { date: '2026-06-08', source: '展会', type: 'IAA出席', title: 'Stellantis展示氢能概念车', competitor: 'Stellantis' },
      ],
      priceTrack: [
        { month: '2026-01', self: 28500, rivalA: 29800, rivalB: 31200 },
        { month: '2026-02', self: 28200, rivalA: 29500, rivalB: 30800 },
        { month: '2026-03', self: 27800, rivalA: 28900, rivalB: 30200 },
        { month: '2026-04', self: 27500, rivalA: 28500, rivalB: 29800 },
        { month: '2026-05', self: 27200, rivalA: 27800, rivalB: 29200 },
        { month: '2026-06', self: 26800, rivalA: 27200, rivalB: 28800 },
      ],
      promoCalendar: [
        { date: '2026-07', competitor: '大众', event: '夏季购车节 · 置换补贴8000EUR' },
        { date: '2026-09', competitor: '特斯拉', event: 'Model Y 限时降价' },
        { date: '2026-11', competitor: '宝马', event: '双11金融方案' },
      ],
      supplyChain: [
        { competitor: '特斯拉', supplier: '宁德时代/松下', origin: '中国/日本', freq: '周均2批', route: '海运→汉堡港', cost: '中' },
        { competitor: '大众', supplier: '博世/大陆', origin: '德国本土', freq: '日均', route: '陆运', cost: '低' },
        { competitor: '奔驰', supplier: '采埃孚/法雷奥', origin: '德/法', freq: '周均3批', route: '铁路+陆运', cost: '中低' },
      ],
      strategyReport: {
        month: '2026年6月',
        summary: '头部品牌加速纯电转型，特斯拉与本土OEM在价格带20-35万EUR区间竞争加剧；我司在渠道覆盖率上仍有差距，但服务满意度领先同价位竞品。',
        intents: [
          { competitor: '特斯拉', intent: '加大欧洲产能与充电网络', confidence: 85, signal: '招聘+扩产+降价' },
          { competitor: '大众', intent: '推进MEB平台降本', confidence: 78, signal: '供应链本地化+促销' },
          { competitor: '奔驰', intent: '高端纯电差异化', confidence: 72, signal: '新品发布+专利布局' },
        ],
      },
    },
    electronics: {
      hhi: 1680, cr3: 62, cr5: 78, trend: '高度集中',
      competitors: [
        { name: '三星', share: 28, shareTrend: 0.5, isSelf: false },
        { name: '苹果', share: 24, shareTrend: 1.2, isSelf: false },
        { name: '小米', share: 12, shareTrend: 3.5, isSelf: false },
        { name: '我司（示例）', share: 5, shareTrend: 2.1, isSelf: true },
        { name: '其他', share: 31, shareTrend: -7.3, isSelf: false },
      ],
      shareHistory: [
        { period: '2024Q1', top1: 27, top3: 60, hhi: 1620 },
        { period: '2025Q1', top1: 28, top3: 61, hhi: 1650 },
        { period: '2026Q1', top1: 28, top3: 62, hhi: 1680 },
      ],
      positioning: [
        { name: '我司（示例）', price: 55, quality: 72, brand: 48, channel: 52, service: 68, isSelf: true },
        { name: '三星', price: 70, quality: 85, brand: 88, channel: 90, service: 82, isSelf: false },
        { name: '苹果', price: 92, quality: 95, brand: 98, channel: 85, service: 90, isSelf: false },
        { name: '小米', price: 45, quality: 70, brand: 65, channel: 78, service: 65, isSelf: false },
      ],
      intelFeed: [
        { date: '2026-06-17', source: '社交媒体', type: '营销', title: '三星Galaxy AI功能全球推广', competitor: '三星' },
        { date: '2026-06-14', source: '招投标', type: '政企采购', title: '苹果获德国政府设备采购框架', competitor: '苹果' },
      ],
      priceTrack: [
        { month: '2026-03', self: 399, rivalA: 899, rivalB: 699 },
        { month: '2026-06', self: 359, rivalA: 849, rivalB: 649 },
      ],
      promoCalendar: [{ date: '2026-08', competitor: '三星', event: '返校季以旧换新' }],
      supplyChain: [{ competitor: '三星', supplier: '台积电/京东方', origin: '台/中', freq: '周均', route: '空运+海运', cost: '中' }],
      strategyReport: { month: '2026年6月', summary: 'AI功能成为差异化焦点，价格战集中在中端价位。', intents: [{ competitor: '小米', intent: '欧洲渠道扩张', confidence: 80, signal: '招聘+电商促销' }] },
    },
  },
  usa: {
    vehicle: {
      hhi: 1550, cr3: 55, cr5: 70, trend: '寡头竞争',
      competitors: [
        { name: '通用', share: 16, shareTrend: -0.8, isSelf: false },
        { name: '福特', share: 14, shareTrend: -1.2, isSelf: false },
        { name: '特斯拉', share: 18, shareTrend: 3.2, isSelf: false },
        { name: '我司（示例）', share: 3, shareTrend: 1.5, isSelf: true },
        { name: '其他', share: 49, shareTrend: -2.7, isSelf: false },
      ],
      shareHistory: [{ period: '2024Q1', top1: 17, top3: 52, hhi: 1480 }, { period: '2026Q1', top1: 18, top3: 55, hhi: 1550 }],
      positioning: [
        { name: '我司（示例）', price: 58, quality: 70, brand: 42, channel: 38, service: 65, isSelf: true },
        { name: '特斯拉', price: 75, quality: 82, brand: 85, channel: 72, service: 58, isSelf: false },
        { name: '福特', price: 55, quality: 72, brand: 78, channel: 82, service: 75, isSelf: false },
      ],
      intelFeed: [{ date: '2026-06-16', source: '财报', type: '投资者演示', title: '福特宣布本土化电池合资', competitor: '福特' }],
      priceTrack: [{ month: '2026-06', self: 32000, rivalA: 38000, rivalB: 35000 }],
      promoCalendar: [],
      supplyChain: [],
      strategyReport: { month: '2026年6月', summary: 'IRA政策驱动本土化供应链重组。', intents: [{ competitor: '特斯拉', intent: '产能扩张与FSD推广', confidence: 82, signal: '扩产+降价' }] },
    },
  },
}

const POLICY_CATALOG = {
  germany: {
    alerts: [
      { id: 'cbam', level: '高', title: 'CBAM碳边境调节机制', prob: 100, horizon: '已生效', type: '趋严' },
      { id: 'battery', level: '中', title: '欧盟电池法规延伸要求', prob: 85, horizon: '6个月内', type: '趋严' },
      { id: 'plastic', level: '中', title: '塑料包装限制立法', prob: 70, horizon: '12个月内', type: '趋严' },
      { id: 'fta', level: '低', title: '中欧投资协定谈判重启信号', prob: 35, horizon: '24个月', type: '趋松' },
    ],
    documents: [
      {
        id: 'eu-cbam-2026',
        title: 'EU CBAM Implementing Regulation 2026/05',
        titleCn: '欧盟碳边境调节机制实施细则（2026/05）',
        agency: '欧盟委员会',
        lang: 'EN→ZH',
        status: '已生效',
        effective: '2026-05-01',
        transition: '2026-2028过渡期',
        hsCodes: ['7208', '7601', '8507'],
        summary: '进口高碳产品需申报嵌入式排放，2026年起逐步征收碳成本。',
        entities: [
          { type: '法规名称', value: 'CBAM Implementing Regulation' },
          { type: '发布机构', value: '欧盟委员会' },
          { type: '生效日期', value: '2026-05-01' },
          { type: '适用范围', value: '钢铁、铝、水泥、化肥、电力、氢' },
          { type: '核心要求', value: '碳排放申报、第三方核查、CBAM证书购买' },
          { type: '处罚条款', value: '未申报罚款100-500EUR/吨' },
        ],
        impact: '实质性风险',
      },
      {
        id: 'de-battery-2026',
        title: 'EU Battery Regulation (EU) 2023/1542 Amendment',
        titleCn: '欧盟电池法规修正案 · 碳足迹声明',
        agency: '欧盟议会',
        lang: 'EN→ZH',
        status: '即将生效',
        effective: '2026-08-01',
        transition: '2026-2027',
        hsCodes: ['8507'],
        summary: '锂离子电池出口欧盟需提供全生命周期碳足迹声明及回收责任证明。',
        entities: [
          { type: '法规名称', value: 'EU Battery Regulation Amendment' },
          { type: '发布机构', value: '欧盟议会' },
          { type: '生效日期', value: '2026-08-01' },
          { type: '适用范围', value: 'HS8507 锂离子电池' },
          { type: '核心要求', value: '碳足迹声明、回收材料比例、数字电池护照' },
          { type: '责任主体', value: '生产商/进口商' },
        ],
        impact: '潜在约束',
      },
      {
        id: 'de-tariff-2026',
        title: 'German Import Tariff Schedule Update Q2/2026',
        titleCn: '德国进口关税表 Q2/2026 更新',
        agency: '德国海关',
        lang: 'DE→ZH',
        status: '已生效',
        effective: '2026-04-01',
        hsCodes: ['8703', '8708'],
        summary: '部分汽车零部件MFN税率维持5%，RCEP原产地优惠继续适用。',
        entities: [
          { type: '法规名称', value: 'Tariff Schedule Q2/2026' },
          { type: '发布机构', value: '德国联邦财政部/海关' },
          { type: '核心要求', value: '原产地证明、HS编码准确申报' },
        ],
        impact: '阶段性机会',
      },
    ],
    graph: {
      nodes: [
        { id: 'p1', label: 'CBAM碳边境机制', type: 'policy', x: 50, y: 15 },
        { id: 'p2', label: '电池法规', type: 'policy', x: 80, y: 35 },
        { id: 'p3', label: '关税优惠', type: 'policy', x: 20, y: 35 },
        { id: 'prod1', label: 'HS8507 锂电池', type: 'product', x: 80, y: 60 },
        { id: 'prod2', label: 'HS8703 乘用车', type: 'product', x: 50, y: 60 },
        { id: 'prod3', label: 'HS7208 钢铁', type: 'product', x: 50, y: 85 },
        { id: 'ent1', label: '我司（示例）', type: 'enterprise', x: 30, y: 75 },
        { id: 'r1', label: '碳足迹不合规', type: 'risk', x: 90, y: 85 },
        { id: 'r2', label: 'CBAM证书成本', type: 'risk', x: 60, y: 95 },
      ],
      edges: [
        { from: 'p1', to: 'prod3' }, { from: 'p1', to: 'prod2' },
        { from: 'p2', to: 'prod1' }, { from: 'p3', to: 'prod2' },
        { from: 'prod1', to: 'ent1' }, { from: 'prod2', to: 'ent1' },
        { from: 'p2', to: 'r1' }, { from: 'p1', to: 'r2' }, { from: 'r2', to: 'ent1' },
      ],
    },
    complianceChecklist: [
      { regulation: 'CBAM申报', requirement: '嵌入式碳排放第三方核查报告', status: '部分符合', gap: '缺少2025年度核查', action: '委托认证机构完成核查' },
      { regulation: '电池法规', requirement: '碳足迹声明（DNV/BSI认证）', status: '不符合', gap: '未建立LCA数据库', action: '6个月内完成LCA建模' },
      { regulation: '电池法规', requirement: '数字电池护照', status: '不符合', gap: '系统未对接', action: '接入欧盟电池护照平台' },
      { regulation: '原产地规则', requirement: 'RCEP Form E', status: '符合', gap: '-', action: '维持现有流程' },
      { regulation: 'REACH', requirement: 'SVHC物质申报', status: '符合', gap: '-', action: '年度更新SDS' },
    ],
  },
  usa: {
    alerts: [
      { id: '301', level: '高', title: '301关税复审可能上调', prob: 65, horizon: '3个月内', type: '趋严' },
      { id: 'ira', level: '中', title: 'IRA本土化补贴窗口', prob: 90, horizon: '进行中', type: '机会' },
    ],
    documents: [
      {
        id: 'us-301-2026',
        title: 'Section 301 Tariff Review Notice',
        titleCn: '301条款关税复审公告',
        agency: 'USTR',
        lang: 'EN→ZH',
        status: '征求意见',
        effective: '待定',
        hsCodes: ['8504', '8541'],
        summary: '对部分中国进口商品关税可能从25%上调至35%。',
        entities: [
          { type: '法规名称', value: 'Section 301 Review' },
          { type: '发布机构', value: '美国贸易代表办公室' },
          { type: '核心要求', value: '关注复审清单HS编码' },
        ],
        impact: '实质性风险',
      },
    ],
    graph: { nodes: [{ id: 'p1', label: '301关税', type: 'policy', x: 50, y: 20 }, { id: 'prod1', label: 'HS8541 半导体', type: 'product', x: 50, y: 50 }, { id: 'ent1', label: '我司', type: 'enterprise', x: 50, y: 80 }], edges: [{ from: 'p1', to: 'prod1' }, { from: 'prod1', to: 'ent1' }] },
    complianceChecklist: [
      { regulation: '301关税', requirement: '原产地转移/第三国加工', status: '部分符合', gap: '越南产能不足', action: '评估墨西哥组装方案' },
    ],
  },
}

export const HS_PRODUCT_OPTIONS = [
  { value: '8507', label: 'HS8507 · 锂离子电池' },
  { value: '8703', label: 'HS8703 · 乘用车' },
  { value: '8708', label: 'HS8708 · 汽车零部件' },
  { value: '7208', label: 'HS7208 · 钢铁制品' },
  { value: '8541', label: 'HS8541 · 半导体' },
]

export function getCompetitionData(country, category) {
  const base = COMPETITOR_PROFILES[country]?.[category] || COMPETITOR_PROFILES[country]?.vehicle || COMPETITOR_PROFILES.germany.vehicle
  const shareChart = base.competitors.filter((c) => c.name !== '其他').map((c) => ({ name: c.name, value: c.share, isSelf: c.isSelf }))
  const positioningScatter = base.positioning.map((p) => ({
    name: p.name,
    x: p.price,
    y: p.quality,
    size: p.brand,
    isSelf: p.isSelf,
  }))
  const priceLines = (base.priceTrack || []).flatMap((row) => [
    { month: row.month, price: row.self, series: '我司' },
    { month: row.month, price: row.rivalA, series: '竞品A' },
    { month: row.month, price: row.rivalB, series: '竞品B' },
  ])
  return { ...base, shareChart, positioningScatter, priceLines }
}

export function getPolicyData(country, hsCode = '8507') {
  const base = POLICY_CATALOG[country] || POLICY_CATALOG.germany
  const matchedDocs = base.documents.filter((d) => !hsCode || d.hsCodes?.includes(hsCode) || d.hsCodes?.length > 2)
  const checklist = base.complianceChecklist.filter((c) => {
    if (hsCode === '8507') return c.regulation.includes('电池') || c.regulation.includes('CBAM') || c.regulation.includes('REACH')
    if (hsCode === '8703') return c.regulation.includes('CBAM') || c.regulation.includes('原产地') || c.regulation.includes('REACH')
    return true
  })
  return { ...base, matchedDocs: matchedDocs.length ? matchedDocs : base.documents, checklist: checklist.length ? checklist : base.complianceChecklist }
}

export function searchProduct(keyword) {
  const key = Object.keys(PRODUCT_CATALOG).find((k) => k.includes(keyword) || keyword.includes(k))
  const name = key || '汽车配件'
  return getProductDetail(name)
}

export function searchEnterprise(keyword) {
  const key = Object.keys(ENTERPRISE_CATALOG).find((k) => k.includes(keyword) || keyword.includes(k))
  return getEnterpriseDetail(key || '华贸进出口集团')
}

export function calcLandedCost(cargoValue, params) {
  const value = Number(cargoValue) || 0
  const tariff = value * params.tariffRate
  const freight = value * params.freightRate
  const insurance = value * params.insuranceRate
  const vat = (value + tariff + freight + insurance) * params.vatRate
  const total = value + tariff + freight + insurance + vat
  return {
    cargoValue: value,
    tariff: Math.round(tariff * 100) / 100,
    freight: Math.round(freight * 100) / 100,
    insurance: Math.round(insurance * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}
