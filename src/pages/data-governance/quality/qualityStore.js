const STORAGE_KEY = 'data-quality-workflow-state'

const DEFAULT_STATE = {
  completedSteps: [],
  lastBatchId: null,
  transformApplied: false,
}

export function loadQualityWorkflowState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_STATE }
}

export function saveQualityWorkflowState(partial) {
  const next = { ...loadQualityWorkflowState(), ...partial }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function markQualityStepComplete(stepKey) {
  const state = loadQualityWorkflowState()
  const completedSteps = state.completedSteps.includes(stepKey)
    ? state.completedSteps
    : [...state.completedSteps, stepKey]
  return saveQualityWorkflowState({ completedSteps })
}

export function resetQualityWorkflowState() {
  localStorage.removeItem(STORAGE_KEY)
  return { ...DEFAULT_STATE }
}
