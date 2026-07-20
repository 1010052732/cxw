const HANDOFF_KEY = 'risk-response-handoff'
const ASSESS_HANDOFF_KEY = 'risk-assessment-handoff'

/** 写入应对模块承接数据 */
export function saveRiskHandoff(payload) {
  sessionStorage.setItem(
    HANDOFF_KEY,
    JSON.stringify({
      ...payload,
      savedAt: Date.now(),
    }),
  )
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

/** 监测预警 → 评估模块承接 */
export function saveAssessmentHandoff(payload) {
  sessionStorage.setItem(
    ASSESS_HANDOFF_KEY,
    JSON.stringify({
      ...payload,
      savedAt: Date.now(),
    }),
  )
}

export function loadAssessmentHandoff() {
  try {
    const raw = sessionStorage.getItem(ASSESS_HANDOFF_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAssessmentHandoff() {
  sessionStorage.removeItem(ASSESS_HANDOFF_KEY)
}

/** 统一推送到应对（评估结果 / 监测直接处置） */
export function handoffToResponse(payload, navigate) {
  saveRiskHandoff(payload)
  const from = payload.from || 'assessment'
  const tab = payload.tab || 'strategy'
  navigate(`/risk/response?tab=${tab}&from=${encodeURIComponent(from)}`)
}

/** 统一推送到评估 */
export function handoffToAssessment(payload, navigate) {
  saveAssessmentHandoff(payload)
  navigate(`/risk/assessment?tab=model&from=${encodeURIComponent(payload.from || 'monitoring')}`)
}
