const FAVORITES_KEY = 'enterprise-search-favorites'
const WATCHLIST_KEY = 'enterprise-competitor-watchlist'
const PARTNER_WEIGHTS_KEY = 'enterprise-partner-weights'
const ALERT_CHANNELS_KEY = 'enterprise-competitor-alert-channels'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadEnterpriseFavorites() {
  return readJson(FAVORITES_KEY, [])
}

export function toggleEnterpriseFavorite(id) {
  const list = loadEnterpriseFavorites()
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
  writeJson(FAVORITES_KEY, next)
  return next
}

export function loadCompetitorWatchlist() {
  return readJson(WATCHLIST_KEY, [])
}

export function toggleCompetitorWatch(name) {
  const list = loadCompetitorWatchlist()
  const next = list.includes(name) ? list.filter((x) => x !== name) : [...list, name]
  writeJson(WATCHLIST_KEY, next)
  return next
}

export function loadPartnerWeights(enterpriseName, role) {
  const all = readJson(PARTNER_WEIGHTS_KEY, {})
  return all[`${enterpriseName}:${role}`] || null
}

export function savePartnerWeights(enterpriseName, role, weights) {
  const all = readJson(PARTNER_WEIGHTS_KEY, {})
  all[`${enterpriseName}:${role}`] = weights
  writeJson(PARTNER_WEIGHTS_KEY, all)
}

export function loadCompetitorAlertChannels() {
  return readJson(ALERT_CHANNELS_KEY, { platform: true, sms: false, email: true })
}

export function saveCompetitorAlertChannels(channels) {
  writeJson(ALERT_CHANNELS_KEY, channels)
}
