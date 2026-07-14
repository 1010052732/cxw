/** 地理信息可视化层 · 按实际数据决定显示内容 */

import { MAP_LAYER_META } from '../../../../utils/mapHeatmap'

export const HEATMAP_LAYER_KEYS = new Set([
  'trade', 'gdp', 'population', 'nightlight', 'risk', 'climate',
  'infra', 'industry', 'cluster', 'resource', 'hinterland', 'disaster', 'ftz',
])

export const OVERLAY_ONLY_KEYS = new Set(['cluster', 'resource', 'industry', 'hinterland', 'disaster', 'ftz'])

export function filterRenderableCells(cells = [], activeLayers = []) {
  const heatLayers = activeLayers.filter((k) => HEATMAP_LAYER_KEYS.has(k) && !OVERLAY_ONLY_KEYS.has(k))
  if (!heatLayers.length) return []
  return cells.filter((cell) => heatLayers.some((k) => cell[k] != null && cell[k] > 0))
}

export function pickPrimaryLayer(cell, activeLayers = []) {
  return activeLayers
    .filter((k) => cell[k] != null && HEATMAP_LAYER_KEYS.has(k))
    .sort((a, b) => (cell[b] || 0) - (cell[a] || 0))[0]
}

export function buildCellInfoHtml(cell, activeLayers = []) {
  const lines = activeLayers
    .filter((k) => cell[k] != null && MAP_LAYER_META[k])
    .map((k) => {
      const label = MAP_LAYER_META[k].label
      return `<div class="amap-info-row"><span>${label}</span><strong>${Math.round(cell[k])}</strong></div>`
    })
  const title = cell.label || cell.name || cell.id || '区域'
  return `<div class="amap-market-info"><div class="amap-info-title">${title}</div>${lines.join('')}</div>`
}

export function computeFitBounds(country, cells = [], markers = [], resolveLngLat) {
  const points = []
  cells.forEach((c) => points.push(resolveLngLat(c, country)))
  markers.forEach((m) => points.push(resolveLngLat(m, country)))
  if (!points.length) return null
  const lngs = points.map((p) => p[0])
  const lats = points.map((p) => p[1])
  const pad = 0.8
  return {
    min: [Math.min(...lngs) - pad, Math.min(...lats) - pad],
    max: [Math.max(...lngs) + pad, Math.max(...lats) + pad],
  }
}

export function buildGeoDisplayStats({
  cells = [],
  heatmapLayers = [],
  mapLayers = [],
  extended = {},
  level = 'country',
}) {
  const renderCells = filterRenderableCells(cells, heatmapLayers)
  const infraCount = mapLayers.includes('infra') ? (extended.infraNodes || []).length : 0
  const overlayCount = mapLayers.includes('infra')
    ? 0
    : (extended.overlayNodes || []).filter((n) => mapLayers.includes(n.layer)).length
  const pathCount = (extended.logisticsPaths || []).length

  return {
    level,
    cellCount: renderCells.length,
    markerCount: extended.regions?.length || 0,
    infraCount,
    overlayCount,
    pathCount,
    hasHeatData: renderCells.length > 0,
    activeLayerCount: heatmapLayers.length,
  }
}

export function buildLayerCheckboxOptions(availableLayers = [], mapLayers = []) {
  return availableLayers.map((key) => {
    const meta = MAP_LAYER_META[key]
    const layerDef = { value: key, label: meta?.label || key }
    if (!mapLayers.includes(key)) return layerDef
    return layerDef
  })
}
