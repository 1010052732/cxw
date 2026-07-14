/**
 * 市场地理仪表盘数据服务
 * 对接后端 API；开发环境回退至本地 Mock 并模拟网络延迟
 */

import {
  MAP_LAYERS,
  getMarketData,
  getMarketHeatmapCells,
} from '../mock/analysis'
import { enrichMarketExtended } from '../pages/business/analysis/market/marketGeoUtils'
import { resolveEntityLngLat } from '../utils/marketAmapCoords'
import { MAP_LAYER_META } from '../utils/mapHeatmap'

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

function delay(ms = 280) {
  return new Promise((resolve) => { setTimeout(resolve, ms) })
}

function enrichEntityCoords(entity, country) {
  const [lng, lat] = resolveEntityLngLat(entity, country)
  return { ...entity, lng, lat, lnglat: [lng, lat] }
}

function resolveAvailableLayers(cells = [], extended = {}) {
  const scores = {}
  cells.forEach((cell) => {
    Object.keys(MAP_LAYER_META).forEach((key) => {
      if (cell[key] != null && cell[key] > 0) {
        scores[key] = (scores[key] || 0) + 1
      }
    })
  })
  if ((extended.infraNodes || []).length) scores.infra = extended.infraNodes.length
  if ((extended.overlayNodes || []).length) {
    extended.overlayNodes.forEach((n) => {
      if (n.layer) scores[n.layer] = (scores[n.layer] || 0) + 1
    })
  }
  return MAP_LAYERS
    .filter((l) => scores[l.key] > 0)
    .map((l) => l.key)
}

function filterInfraByCells(infraNodes = [], cells = []) {
  const regionScores = {}
  cells.forEach((cell) => {
    regionScores[cell.id] = cell.infra ?? cell.hinterland ?? 0
    if (cell.id) {
      const prefix = cell.id.split('-')[0]
      regionScores[prefix] = Math.max(regionScores[prefix] || 0, cell.infra ?? 0)
    }
  })
  return infraNodes.filter((node) => {
    const score = regionScores[node.regionId] ?? regionScores[node.id] ?? 50
    return score >= 45
  })
}

function filterOverlaysByCells(overlayNodes = [], cells = [], threshold = 55) {
  return overlayNodes.filter((node) => {
    const cell = cells.find((c) => c.id === node.regionId || c.id?.startsWith(node.regionId))
    if (!cell) return true
    const layerScore = cell[node.layer]
    return layerScore == null || layerScore >= threshold
  })
}

function normalizeGeoPayload(raw, { country, period, category, timelinePoint }) {
  const extended = enrichMarketExtended(raw.extended)
  const heatmapCells = getMarketHeatmapCells(extended, timelinePoint).map((cell) =>
    enrichEntityCoords(cell, country),
  )
  const regions = (extended.regions || []).map((r) => enrichEntityCoords(r, country))
  const infraNodes = filterInfraByCells(
    (extended.infraNodes || []).map((n) => enrichEntityCoords(n, country)),
    heatmapCells,
  )
  const overlayNodes = filterOverlaysByCells(
    (extended.overlayNodes || []).map((n) => enrichEntityCoords(n, country)),
    heatmapCells,
  )

  const enrichedExtended = {
    ...extended,
    regions,
    infraNodes,
    overlayNodes,
    logisticsPaths: extended.logisticsPaths || [],
    highwayNetwork: extended.highwayNetwork || [],
  }

  const availableLayers = resolveAvailableLayers(heatmapCells, enrichedExtended)
  const defaultLayers = MAP_LAYERS.filter((l) => l.default && availableLayers.includes(l.key)).map((l) => l.key)

  return {
    country,
    period,
    category,
    overview: raw.overview,
    trend: raw.trend,
    extended: enrichedExtended,
    heatmapCells,
    availableLayers,
    defaultLayers: defaultLayers.length ? defaultLayers : availableLayers.slice(0, 2),
    dataSource: 'mock',
    fetchedAt: new Date().toISOString(),
  }
}

async function fetchFromApi(params) {
  const qs = new URLSearchParams({
    country: params.country,
    period: params.period,
    category: params.category || 'vehicle',
  })
  const res = await fetch(`${API_BASE}/analysis/market/geo?${qs}`)
  if (!res.ok) throw new Error(`GEO_API_${res.status}`)
  const json = await res.json()
  const timelinePoint = json.timelinePoint || json.extended?.timeline?.slice(-1)[0]
  return normalizeGeoPayload(json, { ...params, timelinePoint })
}

export async function fetchMarketGeoDashboard(params = {}) {
  const { country = 'germany', period = '6m', category = 'vehicle', timelinePoint } = params

  if (!USE_MOCK && API_BASE) {
    try {
      const payload = await fetchFromApi({ country, period, category })
      return { ...payload, dataSource: 'api' }
    } catch {
      /* 回退 mock */
    }
  }

  await delay()
  const raw = getMarketData(country, period)
  const point = timelinePoint
    || raw.extended?.timeline?.[raw.extended.timeline.length - 1]
    || null
  return normalizeGeoPayload(raw, { country, period, category, timelinePoint: point })
}

export async function refreshGeoTimeline(country, period, timelinePoint) {
  const raw = getMarketData(country, period)
  const extended = enrichMarketExtended(raw.extended)
  const heatmapCells = getMarketHeatmapCells(extended, timelinePoint).map((cell) =>
    enrichEntityCoords(cell, country),
  )
  return { heatmapCells, timelinePoint }
}
