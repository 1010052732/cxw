/** 地图热力图层颜色与数据聚合工具 */

export const MAP_LAYER_META = {
  trade: { label: '贸易流量', color: '#1677ff', channel: 'blue' },
  gdp: { label: 'GDP密度', color: '#B32620', channel: 'brand' },
  population: { label: '人口热力', color: '#eb2f96', channel: 'magenta' },
  nightlight: { label: '夜间灯光', color: '#fadb14', channel: 'yellow' },
  infra: { label: '基础设施', color: '#13c2c2', channel: 'cyan' },
  industry: { label: '产业聚集', color: '#d48806', channel: 'gold' },
  ftz: { label: '自贸区', color: '#52c41a', channel: 'success' },
  risk: { label: '政治风险', color: '#faad14', channel: 'warning' },
  climate: { label: '气候风险', color: '#722ed1', channel: 'purple' },
  score: { label: '综合评分', color: '#B32620', channel: 'brand' },
  policy: { label: '政策友好', color: '#52c41a', channel: 'success' },
  count: { label: '商机密度', color: '#1677ff', channel: 'blue' },
}

const CHANNEL_RGB = {
  blue: [22, 119, 255],
  brand: [179, 38, 32],
  cyan: [19, 194, 194],
  gold: [212, 136, 6],
  warning: [250, 173, 20],
  purple: [114, 46, 209],
  success: [82, 196, 26],
  magenta: [235, 47, 150],
  yellow: [250, 219, 20],
}

export function clampScore(value) {
  return Math.max(0, Math.min(100, Number(value) || 0))
}

export function getLayerHeatColor(value, layerKey = 'score') {
  const score = clampScore(value)
  const channel = MAP_LAYER_META[layerKey]?.channel || 'brand'
  const [r, g, b] = CHANNEL_RGB[channel] || CHANNEL_RGB.brand
  const alpha = 0.18 + (score / 100) * 0.62
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`
}

export function getLayerHeatBorder(value, layerKey = 'score') {
  const score = clampScore(value)
  const channel = MAP_LAYER_META[layerKey]?.channel || 'brand'
  const [r, g, b] = CHANNEL_RGB[channel] || CHANNEL_RGB.brand
  const alpha = 0.25 + (score / 100) * 0.45
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`
}

export function blendLayerColors(layers, cell, activeLayerKeys) {
  const active = activeLayerKeys.filter((key) => cell[key] != null)
  if (!active.length) return 'transparent'
  if (active.length === 1) return getLayerHeatColor(cell[active[0]], active[0])

  let r = 0
  let g = 0
  let b = 0
  let weight = 0
  active.forEach((key) => {
    const score = clampScore(cell[key])
    const channel = MAP_LAYER_META[key]?.channel || 'brand'
    const rgb = CHANNEL_RGB[channel] || CHANNEL_RGB.brand
    const w = score / 100
    r += rgb[0] * w
    g += rgb[1] * w
    b += rgb[2] * w
    weight += w
  })
  if (!weight) return 'transparent'
  const alpha = 0.22 + (weight / active.length) * 0.5
  return `rgba(${Math.round(r / weight)}, ${Math.round(g / weight)}, ${Math.round(b / weight)}, ${alpha.toFixed(2)})`
}

export function aggregateOpportunityHeatCells(items, posMap = {}) {
  const bucket = {}
  items.forEach((item) => {
    const country = item.geoCountry || item.country
    if (!country) return
    if (!bucket[country]) {
      bucket[country] = {
        country,
        count: 0,
        scoreSum: 0,
        policySum: 0,
        riskScoreSum: 0,
      }
    }
    const entry = bucket[country]
    entry.count += 1
    entry.scoreSum += item.score || 0
    entry.policySum += item.policyFriendliness || 0
    entry.riskScoreSum += item.riskLevel === '高' ? 85 : item.riskLevel === '中' ? 55 : 25
  })

  return Object.values(bucket).map((entry) => {
    const pos = posMap[entry.country] || { x: 50, y: 50, r: 14 }
    const avgScore = Math.round(entry.scoreSum / entry.count)
    const avgPolicy = Math.round(entry.policySum / entry.count)
    const avgRisk = Math.round(entry.riskScoreSum / entry.count)
    const density = Math.min(100, entry.count * 12 + avgScore * 0.25)
    return {
      id: entry.country,
      label: entry.country,
      x: pos.x,
      y: pos.y,
      r: pos.r + Math.min(18, entry.count * 2),
      count: density,
      score: avgScore,
      policy: avgPolicy,
      risk: avgRisk,
      trade: Math.round((avgScore + avgPolicy) / 2),
      items: entry.count,
    }
  })
}
