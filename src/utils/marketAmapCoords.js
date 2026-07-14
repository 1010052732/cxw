/** 市场分析 · 高德地图经纬度与视野配置 */

export const MARKET_COUNTRY_MAP_VIEW = {
  germany: { center: [10.45, 51.16], zoom: 6, span: [6, 4] },
  usa: { center: [-98.35, 39.5], zoom: 4, span: [28, 16] },
  asean: { center: [110.5, 5.5], zoom: 4, span: [18, 12] },
  japan: { center: [138.25, 36.2], zoom: 5, span: [8, 6] },
  brazil: { center: [-51.9, -14.2], zoom: 4, span: [22, 14] },
}

/** 省/州/区域固定坐标 [lng, lat] */
export const ENTITY_COORDS = {
  'de-by': [11.58, 48.14],
  'de-nw': [6.77, 51.23],
  'de-bw': [9.18, 48.78],
  'de-north': [9.73, 53.55],
  'de-east': [13.4, 52.52],
  'us-ca': [-119.42, 36.78],
  'us-tx': [-99.9, 31.97],
  'us-west': [-121.5, 37.5],
  'us-mw': [-93.6, 41.9],
  'us-east': [-74.0, 40.7],
  'us-south': [-84.4, 33.75],
  'asean-vn': [106.66, 10.82],
  'asean-id': [106.85, -6.21],
  'asean-th': [100.5, 13.75],
  'asean-sg': [103.82, 1.35],
  'asean-my': [101.69, 3.14],
  'asean-hub': [114.17, 22.32],
  'jp-kanto': [139.69, 35.69],
  'jp-kansai': [135.5, 34.69],
  'br-sp': [-46.63, -23.55],
  'br-rj': [-43.17, -22.91],
}

const CITY_COORDS = {
  慕尼黑: [11.58, 48.14],
  纽伦堡: [11.08, 49.45],
  杜塞尔多夫: [6.77, 51.23],
  科隆: [6.96, 50.94],
  斯图加特: [9.18, 48.78],
  洛杉矶: [-118.24, 34.05],
  旧金山: [-122.42, 37.77],
  休斯顿: [-95.37, 29.76],
  胡志明市: [106.66, 10.82],
  河内: [105.85, 21.03],
  雅加达: [106.85, -6.21],
  东京: [139.69, 35.69],
  大阪: [135.5, 34.69],
  圣保罗市: [-46.63, -23.55],
  里约热内卢: [-43.17, -22.91],
}

function percentToLngLat(country, x = 50, y = 50) {
  const view = MARKET_COUNTRY_MAP_VIEW[country] || MARKET_COUNTRY_MAP_VIEW.germany
  const [spanLng, spanLat] = view.span || [8, 6]
  const lng = view.center[0] + ((x - 50) / 50) * (spanLng / 2)
  const lat = view.center[1] - ((y - 50) / 50) * (spanLat / 2)
  return [lng, lat]
}

export function resolveEntityLngLat(entity, country = 'germany') {
  if (entity?.lng != null && entity?.lat != null) {
    return [entity.lng, entity.lat]
  }
  if (entity?.lnglat?.length === 2) {
    return entity.lnglat
  }
  if (entity?.id && ENTITY_COORDS[entity.id]) {
    return ENTITY_COORDS[entity.id]
  }
  const name = entity?.name || entity?.label
  if (name && CITY_COORDS[name]) {
    return CITY_COORDS[name]
  }
  if (entity?.x != null && entity?.y != null) {
    return percentToLngLat(country, entity.x, entity.y)
  }
  const view = MARKET_COUNTRY_MAP_VIEW[country] || MARKET_COUNTRY_MAP_VIEW.germany
  return view.center
}

export function getCountryMapView(country) {
  return MARKET_COUNTRY_MAP_VIEW[country] || MARKET_COUNTRY_MAP_VIEW.germany
}

export function resolvePathLngLat(path, country) {
  const from = path.from?.lng != null
    ? [path.from.lng, path.from.lat]
    : percentToLngLat(country, path.from?.x ?? 50, path.from?.y ?? 50)
  const to = path.to?.lng != null
    ? [path.to.lng, path.to.lat]
    : percentToLngLat(country, path.to?.x ?? 50, path.to?.y ?? 50)
  return [from, to]
}
