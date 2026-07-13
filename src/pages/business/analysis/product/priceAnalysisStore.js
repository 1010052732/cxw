const ALERT_KEY = 'product-price-alerts'

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

export function loadPriceAlertSettings(productName) {
  const all = readAll()
  return all[productName] || {
    enabled: true,
    upper: null,
    lower: null,
    dailyChangeThreshold: 5,
    channels: { platform: true, sms: false, email: true },
    probThreshold: 70,
  }
}

export function savePriceAlertSettings(productName, settings) {
  const all = readAll()
  all[productName] = { ...settings, updatedAt: new Date().toLocaleString('zh-CN') }
  writeAll(all)
  return all[productName]
}

export function checkPriceAlerts(priceData, settings) {
  if (!settings?.enabled) return { triggered: false, reasons: [] }
  const upper = settings.upper ?? priceData.alert?.upper
  const lower = settings.lower ?? priceData.alert?.lower
  const reasons = []
  const current = priceData.currentPrice
  const dailyChange = Math.abs(priceData.dailyChange || 0)

  if (current > upper) reasons.push({ level: 'error', msg: `价格 ${current} 突破上限预警线 ${upper}` })
  if (current < lower) reasons.push({ level: 'error', msg: `价格 ${current} 跌破下限预警线 ${lower}` })
  if (dailyChange >= (settings.dailyChangeThreshold || 5)) {
    reasons.push({ level: 'warning', msg: `单日涨跌幅 ${dailyChange}% 超过阈值 ${settings.dailyChangeThreshold}%` })
  }
  if ((priceData.alert?.probBreakUpper || 0) >= (settings.probThreshold || 70)) {
    reasons.push({ level: 'warning', msg: `未来1月突破上限概率 ${priceData.alert.probBreakUpper}% ≥ ${settings.probThreshold}%` })
  }

  return { triggered: reasons.some((r) => r.level === 'error') || reasons.length > 0, reasons }
}
