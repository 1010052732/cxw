/** 洲/区域 → 国家 → 城市 三级地理体系 */

export const GEO_MACRO_OPTIONS = [
  { value: 'all', label: '全部洲/区域' },
  { value: '亚洲', label: '亚洲' },
  { value: '东南亚', label: '东南亚' },
  { value: '欧洲', label: '欧洲' },
  { value: '北美', label: '北美' },
  { value: '南美', label: '南美' },
  { value: '中东', label: '中东' },
  { value: '大洋洲', label: '大洋洲' },
  { value: '非洲', label: '非洲' },
]

export const GEO_COUNTRY_MAP = {
  亚洲: ['中国', '日本', '韩国', '印度', '新加坡'],
  东南亚: ['印度尼西亚', '越南', '泰国', '马来西亚', '菲律宾', '新加坡'],
  欧洲: ['德国', '法国', '英国', '波兰', '荷兰', '意大利'],
  北美: ['美国', '加拿大', '墨西哥'],
  南美: ['巴西', '阿根廷', '智利'],
  中东: ['阿联酋', '沙特阿拉伯', '土耳其'],
  大洋洲: ['澳大利亚', '新西兰'],
  非洲: ['南非', '埃及', '尼日利亚'],
}

export const GEO_CITY_MAP = {
  中国: ['北京市', '上海市', '杭州市', '宁波市', '苏州市', '深圳市', '广州市', '青岛市', '义乌市', '南京市', '厦门市', '成都市', '武汉市'],
  印度尼西亚: ['雅加达', '泗水', '万隆', '棉兰'],
  越南: ['胡志明市', '河内市', '岘港市'],
  泰国: ['曼谷', '清迈', '芭提雅'],
  马来西亚: ['吉隆坡', '槟城'],
  菲律宾: ['马尼拉', '宿务'],
  新加坡: ['新加坡市'],
  日本: ['东京', '大阪', '名古屋'],
  韩国: ['首尔', '釜山'],
  印度: ['孟买', '新德里', '班加罗尔'],
  德国: ['柏林', '慕尼黑', '汉堡', '法兰克福'],
  法国: ['巴黎', '里昂'],
  英国: ['伦敦', '曼彻斯特'],
  波兰: ['华沙', '格但斯克'],
  荷兰: ['阿姆斯特丹', '鹿特丹'],
  意大利: ['米兰', '罗马'],
  美国: ['纽约', '洛杉矶', '芝加哥', '休斯顿'],
  加拿大: ['多伦多', '温哥华'],
  墨西哥: ['墨西哥城', '蒙特雷'],
  巴西: ['圣保罗', '里约热内卢'],
  阿根廷: ['布宜诺斯艾利斯'],
  智利: ['圣地亚哥'],
  阿联酋: ['迪拜', '阿布扎比'],
  沙特阿拉伯: ['利雅得', '吉达'],
  土耳其: ['伊斯坦布尔', '安卡拉'],
  澳大利亚: ['悉尼', '墨尔本'],
  新西兰: ['奥克兰', '惠灵顿'],
  南非: ['约翰内斯堡', '开普敦'],
  埃及: ['开罗'],
  尼日利亚: ['拉各斯'],
}

/** 世界伪地图上的国家/区域中心点（百分比坐标） */
export const GEO_COUNTRY_MAP_POS = {
  中国: { x: 72, y: 38, r: 16 },
  日本: { x: 82, y: 36, r: 12 },
  韩国: { x: 78, y: 34, r: 11 },
  印度: { x: 68, y: 48, r: 15 },
  新加坡: { x: 74, y: 54, r: 9 },
  印度尼西亚: { x: 76, y: 58, r: 14 },
  越南: { x: 74, y: 50, r: 12 },
  泰国: { x: 72, y: 52, r: 12 },
  马来西亚: { x: 74, y: 56, r: 11 },
  菲律宾: { x: 78, y: 52, r: 11 },
  德国: { x: 48, y: 28, r: 13 },
  法国: { x: 46, y: 32, r: 12 },
  英国: { x: 44, y: 24, r: 12 },
  波兰: { x: 52, y: 26, r: 11 },
  荷兰: { x: 47, y: 26, r: 10 },
  意大利: { x: 50, y: 34, r: 12 },
  美国: { x: 18, y: 36, r: 16 },
  加拿大: { x: 16, y: 22, r: 14 },
  墨西哥: { x: 14, y: 44, r: 12 },
  巴西: { x: 28, y: 62, r: 15 },
  阿根廷: { x: 26, y: 78, r: 12 },
  智利: { x: 22, y: 82, r: 10 },
  阿联酋: { x: 58, y: 46, r: 11 },
  沙特阿拉伯: { x: 56, y: 44, r: 13 },
  土耳其: { x: 54, y: 36, r: 12 },
  澳大利亚: { x: 82, y: 72, r: 14 },
  新西兰: { x: 88, y: 78, r: 10 },
  南非: { x: 52, y: 72, r: 12 },
  埃及: { x: 52, y: 42, r: 11 },
  尼日利亚: { x: 48, y: 52, r: 12 },
}

export const OPPORTUNITY_MAP_LAYERS = [
  { key: 'count', label: '商机密度', default: true },
  { key: 'score', label: '综合评分', default: true },
  { key: 'risk', label: '风险强度', default: false },
  { key: 'policy', label: '政策友好', default: false },
]

export const OPPORTUNITY_GEO_SEED = {
  'OP-2026-001': { geoMacro: '亚洲', geoCountry: '中国', geoCity: '杭州市' },
  'OP-2026-002': { geoMacro: '东南亚', geoCountry: '泰国', geoCity: '曼谷' },
  'OP-2026-003': { geoMacro: '欧洲', geoCountry: '德国', geoCity: '慕尼黑' },
  'OP-2026-004': { geoMacro: '中东', geoCountry: '阿联酋', geoCity: '迪拜' },
  'OP-2026-005': { geoMacro: '南美', geoCountry: '巴西', geoCity: '圣保罗' },
  'OP-2026-006': { geoMacro: '东南亚', geoCountry: '印度尼西亚', geoCity: '雅加达' },
  'OP-2026-007': { geoMacro: '亚洲', geoCountry: '日本', geoCity: '东京' },
  'OP-2026-008': { geoMacro: '北美', geoCountry: '墨西哥', geoCity: '墨西哥城' },
  'OP-2026-009': { geoMacro: '东南亚', geoCountry: '新加坡', geoCity: '新加坡市' },
  'OP-2026-010': { geoMacro: '大洋洲', geoCountry: '澳大利亚', geoCity: '悉尼' },
  'OP-2026-011': { geoMacro: '欧洲', geoCountry: '波兰', geoCity: '华沙' },
  'OP-2026-012': { geoMacro: '欧洲', geoCountry: '德国', geoCity: '法兰克福' },
}

export const ENTERPRISE_GEO_SEED = {
  'ENT-001': { geoMacro: '亚洲', geoCountry: '中国', geoCity: '深圳市' },
  'ENT-002': { geoMacro: '亚洲', geoCountry: '中国', geoCity: '上海市' },
  'ENT-003': { geoMacro: '亚洲', geoCountry: '中国', geoCity: '杭州市' },
}

export function formatGeoLocation(item) {
  if (!item) return '—'
  if (item.geoLabel) return item.geoLabel
  const macro = item.geoMacro || item.sourceMacro
  const country = item.geoCountry || item.sourceCountry
  const city = item.geoCity || item.sourceCity || item.sourceRegion
  const parts = [macro, country, city].filter(Boolean)
  return parts.length ? parts.join('-') : '—'
}

function getAllGeoCountries() {
  return [...new Set(Object.values(GEO_COUNTRY_MAP).flat())]
}

function getMacroForCountry(country) {
  for (const [macro, list] of Object.entries(GEO_COUNTRY_MAP)) {
    if (list.includes(country)) return macro
  }
  return '亚洲'
}

const GEO_COVERAGE_SEED = {}
const GEO_COVERAGE_OPPORTUNITIES = []

let geoCoverageSeq = 13
getAllGeoCountries().forEach((country) => {
  const alreadyCovered = Object.values(OPPORTUNITY_GEO_SEED).some((entry) => entry.geoCountry === country)
  if (alreadyCovered) return

  const id = `OP-2026-${String(geoCoverageSeq).padStart(3, '0')}`
  const geoMacro = getMacroForCountry(country)
  const geoCity = GEO_CITY_MAP[country]?.[0] || country
  GEO_COVERAGE_SEED[id] = { geoMacro, geoCountry: country, geoCity }
  GEO_COVERAGE_OPPORTUNITIES.push({
    id,
    name: `${country}跨境贸易合作机会`,
    country,
    product: '综合贸易',
    score: 78 + (geoCoverageSeq % 12),
    marketSize: '8.5亿元',
    revenueRange: '300万-600万',
    riskLevel: geoCoverageSeq % 3 === 0 ? '高' : geoCoverageSeq % 2 === 0 ? '中' : '低',
    policyFriendliness: 72 + (geoCoverageSeq % 15),
    createdAt: `2026-06-${String(Math.min(28, geoCoverageSeq)).padStart(2, '0')} 10:00`,
    status: 'active',
    favorited: false,
    tags: ['跨境物流'],
    group: '未分组',
    enabled: true,
    marketScore: 75 + (geoCoverageSeq % 18),
    policyScore: 70 + (geoCoverageSeq % 20),
    creditScore: 74 + (geoCoverageSeq % 16),
    continent: geoMacro,
    economyStage: '新兴经济体',
    marketType: 'B2B',
    hsChapter: '84 机械器具',
    productLifecycle: '成长期',
    techComplexity: '中',
    opportunityDriver: '需求拉动型',
    timeHorizon: '中期趋势',
    cagr: 6 + (geoCoverageSeq % 8),
    marketConcentration: 0.45,
    profitMargin: 12,
    tariffLevel: 6,
    ntbStrength: 30,
    logisticsIndex: 70,
    channelMaturity: 65,
    demandMatch: 72,
    buyerCreditRating: 'BBB',
    buyerCreditScore: 78,
    buyerPurchaseScale: '500万美元/年',
    buyerCooperationYears: 0,
    ftaCoverage: 75,
    exportRebate: 9,
    subsidyStrength: 65,
    dynamicAlert: null,
    mapPos: { x: 40 + (geoCoverageSeq % 30), y: 30 + (geoCoverageSeq % 35) },
    assignedTo: null,
  })
  geoCoverageSeq += 1
})

export const FULL_OPPORTUNITY_GEO_SEED = { ...OPPORTUNITY_GEO_SEED, ...GEO_COVERAGE_SEED }
export { GEO_COVERAGE_OPPORTUNITIES }

export function applyGeoLocation(item, seedMap = FULL_OPPORTUNITY_GEO_SEED) {
  const seed = seedMap[item.id] || {}
  const geoMacro = item.geoMacro ?? seed.geoMacro ?? item.sourceMacro ?? '亚洲'
  const geoCountry = item.geoCountry ?? seed.geoCountry ?? item.sourceCountry ?? '中国'
  const geoCity = item.geoCity ?? seed.geoCity ?? item.sourceCity ?? item.sourceRegion ?? '杭州市'
  const geoLabel = formatGeoLocation({ geoMacro, geoCountry, geoCity })
  return {
    ...item,
    geoMacro,
    geoCountry,
    geoCity,
    geoLabel,
    sourceMacro: geoMacro,
    sourceCountry: geoCountry,
    sourceCity: geoCity,
    sourceRegion: geoCity,
    sourceLabel: geoLabel,
  }
}

export function getGeoCountryOptions(geoMacro) {
  if (!geoMacro || geoMacro === 'all') {
    return [{ value: 'all', label: '全部国家' }]
  }
  const countries = GEO_COUNTRY_MAP[geoMacro] || []
  return [{ value: 'all', label: '全部国家' }, ...countries.map((c) => ({ value: c, label: c }))]
}

export function getGeoCityOptions(geoCountry) {
  if (!geoCountry || geoCountry === 'all') {
    return [{ value: 'all', label: '全部城市' }]
  }
  const cities = GEO_CITY_MAP[geoCountry] || []
  return [{ value: 'all', label: '全部城市' }, ...cities.map((c) => ({ value: c, label: c }))]
}

export function matchesGeoFilter(item, filters = {}) {
  const { geoMacro, geoCountry, geoCity } = filters
  if (geoMacro && geoMacro !== 'all' && item.geoMacro !== geoMacro) return false
  if (geoCountry && geoCountry !== 'all' && item.geoCountry !== geoCountry) return false
  if (geoCity && geoCity !== 'all' && item.geoCity !== geoCity) return false
  return true
}

export function geoSearchText(item) {
  return `${formatGeoLocation(item)}${item.geoMacro || ''}${item.geoCountry || ''}${item.geoCity || ''}`
}

/** @deprecated 兼容旧字段名 */
export const SOURCE_COUNTRY_OPTIONS = GEO_MACRO_OPTIONS
export function applySourceLocation(item) {
  return applyGeoLocation(item)
}
