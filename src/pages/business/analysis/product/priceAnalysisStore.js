const ALERT_KEY = 'product-price-alerts'
const ALERT_HISTORY_KEY = 'product-price-alert-history'

function readAll() {
  try {
    const raw = localStorage.getItem(ALERT_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return {}
}

function writeAll(data) {
  localStorage.setItem(ALERT_KEY, JSON.stringify(data))
}

function readHistory() {
  try {
    const raw = localStorage.getItem(ALERT_HISTORY_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

function writeHistory(list) {
  localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify(list.slice(0, 50)))
}

export function loadPriceAlertSettings(productName) {
  const all = readAll()
  return all[productName] || {
    enabled: true,
    upper: null,
    lower: null,
    dailyChangeThreshold: 5,
    weeklyChangeThreshold: 8,
    channels: { platform: true, sms: false, email: true },
    probThreshold: 70,
    watchSupplyDisruption: true,
  }
}

export function savePriceAlertSettings(productName, settings) {
  const all = readAll()
  all[productName] = { ...settings, updatedAt: new Date().toLocaleString('zh-CN') }
  writeAll(all)
  return all[productName]
}

export function loadAlertHistory(productName) {
  return readHistory().filter((h) => h.product === productName)
}

export function appendAlertHistory(entry) {
  const next = [entry, ...readHistory()]
  writeHistory(next)
  return next
}

export function checkPriceAlerts(priceData, settings) {
  if (!settings?.enabled) return { triggered: false, reasons: [] }
  const upper = settings.upper ?? priceData.alert?.upper
  const lower = settings.lower ?? priceData.alert?.lower
  const reasons = []
  const current = priceData.currentPrice
  const dailyChange = Math.abs(priceData.dailyChange || 0)
  const weeklyChange = Math.abs(priceData.weeklyChange || 0)

  if (upper != null && current > upper) {
    reasons.push({ level: 'error', msg: `价格 ${current} 突破上限预警线 ${upper}` })
  }
  if (lower != null && current < lower) {
    reasons.push({ level: 'error', msg: `价格 ${current} 跌破下限预警线 ${lower}` })
  }
  if (dailyChange >= (settings.dailyChangeThreshold || 5)) {
    reasons.push({ level: 'warning', msg: `单日涨跌幅 ${dailyChange}% 超过阈值 ${settings.dailyChangeThreshold}%` })
  }
  if (weeklyChange >= (settings.weeklyChangeThreshold || 8)) {
    reasons.push({ level: 'warning', msg: `单周涨跌幅 ${weeklyChange}% 超过阈值 ${settings.weeklyChangeThreshold}%` })
  }
  if ((priceData.alert?.probBreakUpper || 0) >= (settings.probThreshold || 70)) {
    reasons.push({ level: 'warning', msg: `未来1月突破上限概率 ${priceData.alert.probBreakUpper}% ≥ ${settings.probThreshold}%` })
  }
  if (settings.watchSupplyDisruption && priceData.supplyDisruption?.active) {
    reasons.push({
      level: 'error',
      msg: `重大供需变化：${priceData.supplyDisruption.title} — ${priceData.supplyDisruption.impact}`,
    })
  }

  return { triggered: reasons.length > 0, reasons }
}
