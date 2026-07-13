import { getUserById } from '../../../mock/rbac'
import { formatGeoLocation } from './utils'

const FIELD_MAP = {
  id: { header: '商机ID', get: (item) => item.id },
  name: { header: '商机名称', get: (item) => item.name },
  source: { header: '商机来源（洲-国家-城市）', get: (item) => formatGeoLocation(item) },
  geoMacro: { header: '洲/区域', get: (item) => item.geoMacro || '—' },
  geoCountry: { header: '国家', get: (item) => item.geoCountry || '—' },
  geoCity: { header: '城市', get: (item) => item.geoCity || '—' },
  country: { header: '目标市场', get: (item) => item.country },
  product: { header: '关联产品', get: (item) => item.product },
  score: { header: '综合评分', get: (item) => item.score },
  group: { header: '分组', get: (item) => item.group || '未分组' },
  tags: { header: '标签', get: (item) => (item.tags || []).join('、') },
  owner: {
    header: '负责人',
    get: (item, users) => (item.ownerId ? getUserById(item.ownerId, users)?.name : item.ownerName) || '—',
  },
  assignee: {
    header: '跟进人',
    get: (item, users) => {
      const name = item.assignedUserId ? getUserById(item.assignedUserId, users)?.name : item.assignedUserName
      return name || item.assignedTo || '—'
    },
  },
  riskLevel: { header: '风险等级', get: (item) => item.riskLevel },
  revenueRange: { header: '收益区间', get: (item) => item.revenueRange },
  status: { header: '状态', get: (item) => item.status },
}

export function exportOpportunitiesToCsv(list, users, filename = '商机列表', fields) {
  const selectedFields = fields?.length ? fields : Object.keys(FIELD_MAP)
  const headers = selectedFields.map((key) => FIELD_MAP[key]?.header).filter(Boolean)
  const lines = [headers]

  list.forEach((item) => {
    lines.push(
      selectedFields.map((key) => {
        const def = FIELD_MAP[key]
        if (!def) return ''
        return def.get.length >= 2 ? def.get(item, users) : def.get(item)
      }),
    )
  })

  const csv = lines
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
