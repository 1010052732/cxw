/** 市场概况 · 地理层级下钻、时间粒度与图表联动工具 */

const CITY_NAMES = {
  'de-by': ['慕尼黑', '纽伦堡', '奥格斯堡'],
  'de-nw': ['杜塞尔多夫', '科隆', '埃森'],
  'de-bw': ['斯图加特', '曼海姆', '卡尔斯鲁厄'],
  'us-ca': ['洛杉矶', '旧金山', '圣地亚哥'],
  'us-tx': ['休斯顿', '达拉斯', '奥斯汀'],
  'asean-vn': ['胡志明市', '河内', '海防'],
  'asean-id': ['雅加达', '泗水', '万隆'],
  'jp-kanto': ['东京', '横滨', '千叶'],
  'jp-kansai': ['大阪', '京都', '神户'],
  'br-sp': ['圣保罗市', '坎皮纳斯', '桑托斯'],
  'br-rj': ['里约热内卢', '尼泰罗伊', '卡希亚斯'],
}

const DEFAULT_CHANNELS = [
  { name: '4S店/经销商', share: 42, growth: 3 },
  { name: '平行进口', share: 12, growth: -2 },
  { name: '线上渠道', share: 28, growth: 18 },
  { name: 'B2B平台', share: 18, growth: 12 },
]

const DEFAULT_PRICE = [
  { name: '豪华', share: 22, growth: 8 },
  { name: '中高端', share: 45, growth: 5 },
  { name: '经济型', share: 33, growth: -1 },
]

function scaleSnapshot(base, factor) {
  if (!base) return base
  return { ...base, _scale: factor }
}

function buildCities(region) {
  if (region.cities?.length) return region.cities
  const names = CITY_NAMES[region.id] || [`${region.name}核心城`, `${region.name}次级城`]
  return names.map((name, ci) => {
    const x = Math.min(92, Math.max(8, region.x + (ci - 1) * 5))
    const y = Math.min(88, Math.max(10, region.y + ci * 4))
    return {
      id: `${region.id}-c${ci}`,
      name,
      x,
      y,
      parentId: region.id,
      snapshot: {
        ...region.snapshot,
        population: region.snapshot?.population,
        urbanization: `${68 + ci * 4}%`,
        incomeLevel: ci === 0 ? '高' : ci === 1 ? '中' : '中低',
      },
      postals: [
        {
          id: `${region.id}-c${ci}-p0`,
          name: `${name}中心`,
          x: Math.min(94, x + 2),
          y: Math.min(90, y - 2),
          parentId: `${region.id}-c${ci}`,
          snapshot: { ...region.snapshot, density: '高', retailIndex: 88 + ci },
        },
        {
          id: `${region.id}-c${ci}-p1`,
          name: `${name}外围`,
          x: Math.min(94, x - 2),
          y: Math.min(90, y + 3),
          parentId: `${region.id}-c${ci}`,
          snapshot: { ...region.snapshot, density: '中', retailIndex: 72 + ci },
        },
      ],
    }
  })
}

function buildInfraNodes(regions) {
  const types = [
    { type: 'port', icon: 'port', label: '港口' },
    { type: 'airport', icon: 'airport', label: '机场' },
    { type: 'rail', icon: 'rail', label: '铁路枢纽' },
    { type: 'ftz', icon: 'ftz', label: '自贸区' },
  ]
  return regions.flatMap((r, ri) =>
    types.slice(0, 2 + (ri % 2)).map((t, ti) => ({
      id: `infra-${r.id}-${t.type}`,
      type: t.type,
      label: `${r.name}${t.label}`,
      x: Math.min(90, r.x + ti * 6 - 3),
      y: Math.min(86, r.y + ti * 5 + 2),
      regionId: r.id,
    })),
  )
}

function buildLogisticsPaths(regions) {
  if (regions.length < 2) return []
  const [a, b] = regions
  return [
    { id: 'path-ab', from: { x: a.x, y: a.y }, to: { x: b.x, y: b.y }, label: '干线物流', days: 2.4, costIndex: 86 },
    { id: 'path-port', from: { x: a.x + 4, y: a.y - 6 }, to: { x: a.x, y: a.y }, label: '港口腹地', days: 0.8, costIndex: 72 },
  ]
}

export function enrichMarketExtended(extended) {
  if (!extended) return extended
  const regions = (extended.regions || []).map((r) => ({ ...r, cities: buildCities(r) }))
  return {
    ...extended,
    regions,
    infraNodes: extended.infraNodes || buildInfraNodes(regions),
    logisticsPaths: extended.logisticsPaths || buildLogisticsPaths(regions),
  }
}

export function getDrillLevel(stack) {
  if (!stack.length) return 'country'
  return stack[stack.length - 1].level
}

export function getMapEntities(extended, drillStack) {
  const level = getDrillLevel(drillStack)
  const regions = extended?.regions || []

  if (level === 'country') {
    return {
      level: 'country',
      heatmapCells: extended?.heatmapCells || [],
      markers: regions,
      parentLabel: extended?.continent,
    }
  }

  const current = drillStack[drillStack.length - 1]
  if (level === 'region') {
    const region = regions.find((r) => r.id === current.id)
    return {
      level: 'region',
      heatmapCells: (extended?.heatmapCells || []).filter((c) => c.id === region?.id || c.id?.startsWith(current.id)),
      markers: region?.cities || [],
      parentLabel: current.name,
    }
  }

  if (level === 'city') {
    const region = regions.find((r) => r.id === current.parentId || r.cities?.some((c) => c.id === current.id))
    const city = region?.cities?.find((c) => c.id === current.id)
    return {
      level: 'city',
      heatmapCells: [],
      markers: city?.postals || [],
      parentLabel: current.name,
    }
  }

  return { level: 'postal', heatmapCells: [], markers: [], parentLabel: current?.name }
}

export function resolveGeoSelection(extended, entity, level) {
  const regions = extended?.regions || []
  if (level === 'country') {
    return regions.find((r) => r.id === entity.id || r.id === entity.regionId) || entity
  }
  if (level === 'region') {
    return regions.find((r) => r.id === entity.id) || entity
  }
  if (level === 'city') {
    for (const r of regions) {
      const city = r.cities?.find((c) => c.id === entity.id)
      if (city) return { ...city, parentRegion: r }
    }
  }
  for (const r of regions) {
    for (const c of r.cities || []) {
      const postal = c.postals?.find((p) => p.id === entity.id)
      if (postal) return { ...postal, parentCity: c, parentRegion: r }
    }
  }
  return entity
}

export function buildPeriodTrend(baseTrend, period, timeline) {
  const trend = baseTrend || []
  if (period === '1d') {
    return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((day, i) => ({
      month: day,
      value: Math.round((trend[trend.length - 1]?.value || 100) * (0.82 + i * 0.03)),
    }))
  }
  if (period === '1q') {
    return ['Q1', 'Q2', 'Q3', 'Q4'].map((month, i) => ({
      month,
      value: Math.round((trend[i]?.value || trend[0]?.value || 100) * (1 + i * 0.06)),
    }))
  }
  if (period === '10y' && timeline?.length) {
    return timeline.map((t) => ({ month: String(t.year), value: t.value }))
  }
  return trend
}

export function scaleOverviewByRegion(overview, regionFactor = 1) {
  if (!overview || regionFactor >= 0.99) return overview
  const f = regionFactor
  return {
    ...overview,
    marketSize: Math.round(overview.marketSize * f * 10) / 10,
    importGrowth: Math.round(overview.importGrowth * (0.9 + f * 0.1) * 10) / 10,
    exportGrowth: Math.round(overview.exportGrowth * (0.9 + f * 0.1) * 10) / 10,
  }
}

export function filterTradeByRegion(tradeList, regionName, factor = 0.35) {
  if (!regionName) return tradeList
  return tradeList.map((item, i) => ({
    ...item,
    value: Math.round(item.value * (factor + (i % 3) * 0.08)),
    _filteredBy: regionName,
  }))
}

export function enrichDemandSegments(demand) {
  if (!demand) return { byType: [], byPrice: DEFAULT_PRICE, byChannel: DEFAULT_CHANNELS, insights: [], sentiment: [] }
  return {
    ...demand,
    byPrice: demand.byPrice?.length ? demand.byPrice : DEFAULT_PRICE,
    byChannel: demand.byChannel?.length ? demand.byChannel : DEFAULT_CHANNELS,
    sentiment: demand.sentiment || [
      { topic: '价格敏感度', score: 72, trend: '上升' },
      { topic: '品牌偏好', score: 65, trend: '稳定' },
      { topic: '功能体验', score: 81, trend: '上升' },
      { topic: '交付/售后', score: 58, trend: '关注' },
    ],
  }
}

export function getRegionFactor(entity, level) {
  if (!entity) return 1
  if (level === 'region') return 0.38
  if (level === 'city') return 0.14
  if (level === 'postal') return 0.06
  return 1
}

export function syncTimelineIndex(period, timelineLength) {
  if (period === '10y') return timelineLength - 1
  if (period === '1y') return Math.max(0, timelineLength - 2)
  if (period === '1q') return Math.max(0, timelineLength - 3)
  return -1
}

export function getTrendXLabel(period) {
  if (period === '1d') return '时点'
  if (period === '10y') return '年份'
  if (period === '1q') return '季度'
  return '时间'
}

export function matchSegmentToCells(segmentName, cells) {
  if (!segmentName || !cells.length) return cells.map((c) => c.id)
  const key = segmentName.toLowerCase()
  return cells
    .filter((c) => c.label?.includes(segmentName) || c.id?.includes(key.slice(0, 2)))
    .map((c) => c.id)
}
