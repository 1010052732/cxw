const SIM_KEY = 'product-supply-demand-sim'
const STRATEGY_KEY = 'product-supply-strategy-log'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return fallback
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadLastSimulation(productName) {
  const all = readJson(SIM_KEY, {})
  return all[productName] || null
}

export function saveSimulationResult(productName, result) {
  const all = readJson(SIM_KEY, {})
  all[productName] = { ...result, savedAt: new Date().toLocaleString('zh-CN') }
  writeJson(SIM_KEY, all)
  return all[productName]
}

export function appendStrategyLog(productName, strategy) {
  const log = readJson(STRATEGY_KEY, [])
  const entry = {
    id: `sd-strategy-${Date.now()}`,
    product: productName,
    time: new Date().toLocaleString('zh-CN'),
    ...strategy,
  }
  writeJson(STRATEGY_KEY, [entry, ...log].slice(0, 40))
  return entry
}

export function loadStrategyLog(productName) {
  return readJson(STRATEGY_KEY, []).filter((e) => e.product === productName)
}
