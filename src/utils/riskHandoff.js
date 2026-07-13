const HANDOFF_KEY = 'risk-response-handoff'

export function saveRiskHandoff(payload) {
  sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ ...payload, savedAt: Date.now() }))
}

export function loadRiskHandoff() {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearRiskHandoff() {
  sessionStorage.removeItem(HANDOFF_KEY)
}
