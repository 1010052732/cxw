/** 免费底图：OpenStreetMap（默认）· 天地图 WMTS（可选 tk） */

export function getTiandituToken() {
  return (import.meta.env.VITE_TIANDITU_TK || '').trim()
}

/**
 * 创建底图图层
 * - 未配置 tk：OpenStreetMap（完全免费，无需 Key）
 * - 已配置 VITE_TIANDITU_TK：天地图矢量 + 注记
 */
export function createBasemapLayers(L) {
  const tk = getTiandituToken()

  if (tk) {
    const vec = L.tileLayer(
      `https://t{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tk}`,
      {
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        maxZoom: 18,
        attribution: '© 国家基础地理信息中心 · 天地图',
      },
    )
    const cva = L.tileLayer(
      `https://t{s}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tk}`,
      {
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        maxZoom: 18,
      },
    )
    return { base: vec, label: cva, provider: 'tianditu' }
  }

  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  })
  return { base: osm, label: null, provider: 'osm' }
}

export function getBasemapLabel() {
  return getTiandituToken() ? '天地图' : 'OpenStreetMap'
}

/** WFS 服务地址（文档引用，展示用） */
export const TIANDITU_WFS_URL = 'http://gisserver.tianditu.gov.cn/TDTService/wfs'
