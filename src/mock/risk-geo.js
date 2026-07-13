import {
  GEO_CITY_MAP,
  GEO_COUNTRY_MAP,
  GEO_COUNTRY_MAP_POS,
} from './geo'
import { HEATMAP_REGIONS, INITIAL_ALERTS, RISK_TRACKING_LIST } from './risk'

/** 洲/区域在世界地图上的中心点（百分比坐标） */
export const GEO_MACRO_MAP_POS = {
  亚洲: { x: 72, y: 38, r: 20 },
  东南亚: { x: 74, y: 52, r: 16 },
  欧洲: { x: 48, y: 28, r: 18 },
  北美: { x: 18, y: 34, r: 18 },
  南美: { x: 28, y: 66, r: 16 },
  中东: { x: 56, y: 42, r: 14 },
  大洋洲: { x: 84, y: 74, r: 14 },
  非洲: { x: 50, y: 58, r: 17 },
}

/** 热力图区域名 → 标准洲/区域 */
const REGION_TO_MACRO = {
  北美: '北美',
  欧洲: '欧洲',
  东亚: '亚洲',
  东南亚: '东南亚',
  中东: '中东',
  南美: '南美',
  非洲: '非洲',
  大洋洲: '大洋洲',
  南亚: '亚洲',
  独联体: '欧洲',
}

/** 预警 region 字段 → 洲/国家 映射 */
const ALERT_REGION_MACRO = {
  北美: '北美',
  欧洲: '欧洲',
  东亚: '亚洲',
  东南亚: '东南亚',
  中东: '中东',
  南美: '南美',
  非洲: '非洲',
  大洋洲: '大洋洲',
  全球: '亚洲',
}

const ALERT_REGION_COUNTRY = {
  北美: '美国',
  欧洲: '德国',
  东亚: '中国',
  东南亚: '印度尼西亚',
  中东: '阿联酋',
  南美: '巴西',
  非洲: '南非',
  全球: '中国',
}

const COUNTRY_RISK_BASE = {
  美国: 82,
  德国: 58,
  法国: 55,
  英国: 60,
  巴西: 72,
  中国: 48,
  日本: 52,
  印度尼西亚: 56,
  阿联酋: 78,
  澳大利亚: 35,
  南非: 40,
}

function hashScore(seed, base = 50, spread = 25) {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) % 997
  return Math.max(15, Math.min(95, base + (h % spread) - Math.floor(spread / 2)))
}

function getMacroScores() {
  const scores = {}
  HEATMAP_REGIONS.forEach((item) => {
    const macro = REGION_TO_MACRO[item.region] || item.region
    scores[macro] = Math.max(scores[macro] || 0, item.score)
  })
  Object.keys(GEO_MACRO_MAP_POS).forEach((macro) => {
    if (scores[macro] == null) scores[macro] = hashScore(macro, 45, 30)
  })
  return scores
}

const MACRO_SCORES = getMacroScores()

function spreadCityPos(country, cities) {
  const base = GEO_COUNTRY_MAP_POS[country] || { x: 50, y: 50, r: 12 }
  return cities.map((city, index) => {
    const angle = (index / Math.max(cities.length, 1)) * Math.PI * 2 - Math.PI / 2
    const ring = 2.5 + (index % 3) * 1.8
    return {
      city,
      x: Math.max(4, Math.min(96, base.x + Math.cos(angle) * ring)),
      y: Math.max(8, Math.min(92, base.y + Math.sin(angle) * ring)),
      r: Math.max(7, base.r - 4),
    }
  })
}

export function getRiskGeoLevel(drill) {
  if (!drill?.macro) return 'macro'
  if (!drill?.country) return 'country'
  return 'city'
}

export function getRiskGeoCells(level, drill = {}) {
  if (level === 'macro') {
    return Object.entries(GEO_MACRO_MAP_POS).map(([macro, pos]) => ({
      id: macro,
      label: macro,
      level: 'macro',
      macro,
      score: MACRO_SCORES[macro] ?? 50,
      x: pos.x,
      y: pos.y,
      r: pos.r,
    }))
  }

  if (level === 'country') {
    const countries = GEO_COUNTRY_MAP[drill.macro] || []
    return countries.map((country) => {
      const pos = GEO_COUNTRY_MAP_POS[country] || { x: 50, y: 50, r: 12 }
      return {
        id: country,
        label: country,
        level: 'country',
        macro: drill.macro,
        country,
        score: COUNTRY_RISK_BASE[country] ?? hashScore(`${drill.macro}-${country}`, MACRO_SCORES[drill.macro] || 50, 22),
        x: pos.x,
        y: pos.y,
        r: pos.r,
      }
    })
  }

  const cities = GEO_CITY_MAP[drill.country] || [`${drill.country}市区`]
  return spreadCityPos(drill.country, cities).map(({ city, x, y, r }) => ({
    id: city,
    label: city,
    level: 'city',
    macro: drill.macro,
    country: drill.country,
    city,
    score: hashScore(`${drill.country}-${city}`, COUNTRY_RISK_BASE[drill.country] || 50, 18),
    x,
    y,
    r,
  }))
}

export function buildRiskMapCells(level, drill) {
  return getRiskGeoCells(level, drill).map((cell) => ({
    id: cell.id,
    label: cell.label,
    x: cell.x,
    y: cell.y,
    r: cell.r,
    risk: cell.score,
    meta: cell,
  }))
}

export function getRiskLocationDetail({ macro, country, city }) {
  const alerts = INITIAL_ALERTS.filter((a) => {
    const alertMacro = ALERT_REGION_MACRO[a.region] || a.region
    const alertCountry = ALERT_REGION_COUNTRY[a.region]
    if (city && country) {
      return alertMacro === macro && alertCountry === country
    }
    if (country) return alertCountry === country || (alertMacro === macro && !alertCountry)
    if (macro) return alertMacro === macro
    return true
  })

  const tracking = RISK_TRACKING_LIST.filter((t) => {
    if (country === '巴西' && t.subject.includes('巴西')) return true
    if (country === '美国' && t.subject.includes('美国')) return true
    if (country === '德国' && t.type === '汇率风险') return true
    if (macro === '中东' && t.subject.includes('中东')) return true
    if (macro === '欧洲' && ['政策', '合规', '汇率'].some((k) => t.type.includes(k))) return true
    return false
  })

  const baseScore = city
    ? hashScore(`${country}-${city}`, COUNTRY_RISK_BASE[country] || 50, 12)
    : country
      ? COUNTRY_RISK_BASE[country] ?? hashScore(country, 50, 20)
      : MACRO_SCORES[macro] ?? 50

  return {
    macro,
    country,
    city,
    score: baseScore,
    level: baseScore >= 75 ? '高' : baseScore >= 50 ? '中' : '低',
    alerts: alerts.length ? alerts : INITIAL_ALERTS.slice(0, 2),
    tracking: tracking.length ? tracking : RISK_TRACKING_LIST.slice(0, 2),
    metrics: {
      openAlerts: alerts.filter((a) => !a.confirmed).length,
      activeTasks: tracking.filter((t) => t.status !== '已关闭').length,
      policyExposure: Math.round(baseScore * 0.6),
      creditExposure: Math.round(baseScore * 0.8),
    },
  }
}

export function buildLocationSearchParams({ macro, country, city }) {
  const params = new URLSearchParams()
  if (macro) params.set('macro', macro)
  if (country) params.set('country', country)
  if (city) params.set('city', city)
  return params.toString()
}
