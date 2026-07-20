/** 商机识别 · 高德地图经纬度与视野配置 */

export const OPPORTUNITY_WORLD_VIEW = {
  center: [20, 18],
  zoom: 2,
}

export const OPPORTUNITY_REGION_VIEWS = {
  亚洲: { center: [95, 32], zoom: 3 },
  东南亚: { center: [110, 6], zoom: 4 },
  欧洲: { center: [12, 50], zoom: 4 },
  北美: { center: [-98, 42], zoom: 3 },
  南美: { center: [-58, -18], zoom: 3 },
  中东: { center: [48, 28], zoom: 4 },
  大洋洲: { center: [135, -28], zoom: 3 },
  非洲: { center: [22, 2], zoom: 3 },
}

/** 国家中心坐标 [lng, lat] */
export const COUNTRY_COORDS = {
  中国: [104.2, 35.5],
  日本: [138.0, 36.2],
  韩国: [127.8, 36.5],
  印度: [78.9, 22.5],
  新加坡: [103.8, 1.35],
  印度尼西亚: [117.9, -2.5],
  越南: [108.0, 14.5],
  泰国: [100.5, 14.0],
  马来西亚: [101.9, 4.2],
  菲律宾: [122.0, 12.5],
  德国: [10.5, 51.2],
  法国: [2.2, 46.6],
  英国: [-1.5, 52.5],
  波兰: [19.4, 52.0],
  荷兰: [5.3, 52.1],
  意大利: [12.5, 42.8],
  美国: [-98.5, 39.5],
  加拿大: [-106.3, 56.1],
  墨西哥: [-102.5, 23.6],
  巴西: [-51.9, -14.2],
  阿根廷: [-63.6, -38.4],
  智利: [-71.5, -35.7],
  阿联酋: [54.4, 24.5],
  沙特阿拉伯: [45.0, 24.0],
  土耳其: [35.2, 39.0],
  澳大利亚: [133.8, -25.3],
  新西兰: [174.8, -41.3],
  南非: [25.0, -29.0],
  埃及: [30.8, 26.8],
  尼日利亚: [8.7, 9.1],
}

/** 城市坐标 [lng, lat] */
const CITY_COORDS = {
  北京市: [116.41, 39.9],
  上海市: [121.47, 31.23],
  杭州市: [120.15, 30.28],
  宁波市: [121.55, 29.87],
  苏州市: [120.62, 31.32],
  深圳市: [114.05, 22.55],
  广州市: [113.26, 23.13],
  青岛市: [120.38, 36.07],
  义乌市: [120.08, 29.31],
  南京市: [118.78, 32.05],
  厦门市: [118.09, 24.48],
  成都市: [104.07, 30.67],
  武汉市: [114.31, 30.59],
  雅加达: [106.85, -6.21],
  泗水: [112.75, -7.26],
  万隆: [107.62, -6.9],
  棉兰: [98.67, 3.6],
  胡志明市: [106.66, 10.82],
  河内市: [105.85, 21.03],
  河内: [105.85, 21.03],
  岘港市: [108.22, 16.05],
  曼谷: [100.5, 13.75],
  清迈: [98.98, 18.79],
  芭提雅: [100.88, 12.93],
  吉隆坡: [101.69, 3.14],
  槟城: [100.33, 5.41],
  马尼拉: [120.98, 14.6],
  宿务: [123.89, 10.32],
  新加坡市: [103.82, 1.35],
  东京: [139.69, 35.69],
  大阪: [135.5, 34.69],
  名古屋: [136.91, 35.18],
  首尔: [126.98, 37.57],
  釜山: [129.08, 35.18],
  孟买: [72.88, 19.08],
  新德里: [77.21, 28.61],
  班加罗尔: [77.59, 12.97],
  柏林: [13.4, 52.52],
  慕尼黑: [11.58, 48.14],
  汉堡: [9.99, 53.55],
  法兰克福: [8.68, 50.11],
  巴黎: [2.35, 48.86],
  里昂: [4.84, 45.76],
  伦敦: [-0.13, 51.51],
  曼彻斯特: [-2.24, 53.48],
  华沙: [21.01, 52.23],
  格但斯克: [18.65, 54.35],
  阿姆斯特丹: [4.9, 52.37],
  鹿特丹: [4.48, 51.92],
  米兰: [9.19, 45.46],
  罗马: [12.5, 41.9],
  纽约: [-74.01, 40.71],
  洛杉矶: [-118.24, 34.05],
  芝加哥: [-87.63, 41.88],
  休斯顿: [-95.37, 29.76],
  多伦多: [-79.38, 43.65],
  温哥华: [-123.12, 49.28],
  墨西哥城: [-99.13, 19.43],
  蒙特雷: [-100.32, 25.67],
  圣保罗: [-46.63, -23.55],
  圣保罗市: [-46.63, -23.55],
  里约热内卢: [-43.17, -22.91],
  布宜诺斯艾利斯: [-58.38, -34.6],
  圣地亚哥: [-70.67, -33.45],
  迪拜: [55.27, 25.2],
  阿布扎比: [54.37, 24.45],
  利雅得: [46.72, 24.71],
  吉达: [39.17, 21.54],
  伊斯坦布尔: [28.98, 41.01],
  安卡拉: [32.86, 39.93],
  悉尼: [151.21, -33.87],
  墨尔本: [144.96, -37.81],
  奥克兰: [174.76, -36.85],
  惠灵顿: [174.78, -41.29],
  约翰内斯堡: [28.05, -26.2],
  开普敦: [18.42, -33.92],
  开罗: [31.24, 30.04],
  拉各斯: [3.38, 6.52],
}

function percentToWorldLngLat(x = 50, y = 50) {
  const lng = -160 + (x / 100) * 320
  const lat = 72 - (y / 100) * 132
  return [lng, lat]
}

function getJitter(index = 0, id = '') {
  const seed = String(id).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const angle = ((seed + index * 3) % 8) * (Math.PI / 4)
  const dist = 0.12 + (index % 4) * 0.08
  return [Math.cos(angle) * dist, Math.sin(angle) * dist]
}

export function resolveCityLngLat(city) {
  if (!city) return null
  return CITY_COORDS[city] || null
}

export function resolveCountryLngLat(country) {
  if (!country) return null
  return COUNTRY_COORDS[country] || null
}

export function resolveOpportunityLngLat(item, index = 0) {
  if (item?.lnglat?.length === 2) return item.lnglat
  if (item?.lng != null && item?.lat != null) return [item.lng, item.lat]

  const city = item?.geoCity || item?.sourceCity || item?.sourceRegion
  const country = item?.geoCountry || item?.country
  const [jx, jy] = getJitter(index, item?.id)

  const cityPos = resolveCityLngLat(city)
  if (cityPos) return [cityPos[0] + jx, cityPos[1] + jy]

  const countryPos = resolveCountryLngLat(country)
  if (countryPos) return [countryPos[0] + jx * 2, countryPos[1] + jy * 2]

  if (item?.mapPos) {
    const [lng, lat] = percentToWorldLngLat(item.mapPos.x, item.mapPos.y)
    return [lng + jx, lat + jy]
  }

  return OPPORTUNITY_WORLD_VIEW.center
}

export function resolveHeatCellLngLat(cell) {
  if (cell?.lnglat?.length === 2) return cell.lnglat
  const countryPos = resolveCountryLngLat(cell?.label || cell?.country || cell?.id)
  if (countryPos) return countryPos
  if (cell?.x != null && cell?.y != null) {
    return percentToWorldLngLat(cell.x, cell.y)
  }
  return OPPORTUNITY_WORLD_VIEW.center
}

export function getOpportunityMapView(geoMacro) {
  if (geoMacro && geoMacro !== 'all' && OPPORTUNITY_REGION_VIEWS[geoMacro]) {
    return OPPORTUNITY_REGION_VIEWS[geoMacro]
  }
  return OPPORTUNITY_WORLD_VIEW
}

export function computeOpportunityBounds(items, resolveLngLat = resolveOpportunityLngLat) {
  const points = items
    .map((item, index) => resolveLngLat(item, index))
    .filter((p) => Array.isArray(p) && p.length === 2)

  if (!points.length) return null

  let minLng = points[0][0]
  let maxLng = points[0][0]
  let minLat = points[0][1]
  let maxLat = points[0][1]

  points.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  })

  return { min: [minLng, minLat], max: [maxLng, maxLat] }
}
