const STORAGE_KEY = 'opportunity-list-visible-columns'

export const LIST_COLUMN_DEFS = [
  { key: 'name', label: '商机名称', defaultVisible: true, required: true },
  { key: 'source', label: '商机来源', defaultVisible: true },
  { key: 'country', label: '目标市场', defaultVisible: true },
  { key: 'product', label: '关联产品', defaultVisible: true },
  { key: 'score', label: '综合评分', defaultVisible: true },
  { key: 'revenueRange', label: '预估交易规模', defaultVisible: true },
  { key: 'riskLevel', label: '综合风险', defaultVisible: true },
  { key: 'policyFriendliness', label: '政策利好', defaultVisible: true },
  { key: 'buyer', label: '买家信用', defaultVisible: true },
  { key: 'createdAt', label: '首次发现日期', defaultVisible: true },
  { key: 'classPath', label: '分类路径', defaultVisible: false },
  { key: 'tags', label: '标签', defaultVisible: true },
  { key: 'group', label: '分组', defaultVisible: true },
  { key: 'assignee', label: '跟进人', defaultVisible: true },
  { key: 'fav', label: '收藏', defaultVisible: true },
  { key: 'action', label: '操作', defaultVisible: true, required: true },
]

export const DEFAULT_VISIBLE_COLUMNS = LIST_COLUMN_DEFS
  .filter((c) => c.defaultVisible)
  .map((c) => c.key)

export const MAP_DOT_METRICS = [
  { value: 'score', label: '综合评分', hint: '散点大小映射评分，颜色映射风险' },
  { value: 'risk', label: '风险等级', hint: '颜色映射风险等级' },
  { value: 'policy', label: '政策友好度', hint: '颜色映射政策利好程度' },
  { value: 'value', label: '预估价值', hint: '散点大小映射收益区间' },
]

export const SORT_FIELD_OPTIONS = [
  { value: 'score', label: '综合评分' },
  { value: 'policyFriendliness', label: '政策利好' },
  { value: 'buyerCreditScore', label: '买家信用' },
  { value: 'createdAt', label: '发现日期' },
  { value: 'country', label: '目标市场' },
  { value: 'riskLevel', label: '风险等级' },
]

export function loadVisibleColumns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_VISIBLE_COLUMNS
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_VISIBLE_COLUMNS
    const valid = parsed.filter((k) => LIST_COLUMN_DEFS.some((c) => c.key === k))
    const withRequired = [...new Set([...valid, ...LIST_COLUMN_DEFS.filter((c) => c.required).map((c) => c.key)])]
    return withRequired.length ? withRequired : DEFAULT_VISIBLE_COLUMNS
  } catch {
    return DEFAULT_VISIBLE_COLUMNS
  }
}

export function saveVisibleColumns(keys) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export function parseRevenueValue(revenueRange = '') {
  const num = parseFloat(String(revenueRange).replace(/[^\d.]/g, ''))
  return Number.isFinite(num) ? num : 500
}

export function getMapDotStyle(item, metric) {
  if (metric === 'risk') {
    const color = item.riskLevel === '高' ? '#ff4d4f' : item.riskLevel === '中' ? '#faad14' : '#52c41a'
    return { background: color, width: 14, height: 14 }
  }
  if (metric === 'policy') {
    const p = item.policyFriendliness || 50
    const color = p >= 85 ? '#52c41a' : p >= 70 ? '#1677ff' : '#faad14'
    return { background: color, width: 10 + p / 12, height: 10 + p / 12 }
  }
  if (metric === 'value') {
    const v = parseRevenueValue(item.revenueRange)
    const size = 10 + Math.min(18, v / 80)
    const color = item.riskLevel === '高' ? '#ff7875' : '#B32620'
    return { background: color, width: size, height: size }
  }
  const color = item.riskLevel === '高' ? '#ff4d4f' : item.riskLevel === '中' ? '#faad14' : '#52c41a'
  return { background: color, width: 8 + item.score / 15, height: 8 + item.score / 15 }
}
