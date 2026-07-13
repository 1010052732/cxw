const STORAGE_KEY = 'data-storage-workflow-state'

const DEFAULT_STATE = {
  completedSteps: [],
  lastBackupAt: null,
}

export function loadStorageWorkflowState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_STATE }
}

export function saveStorageWorkflowState(partial) {
  const next = { ...loadStorageWorkflowState(), ...partial }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function markStorageStepComplete(stepKey) {
  const state = loadStorageWorkflowState()
  const completedSteps = state.completedSteps.includes(stepKey)
    ? state.completedSteps
    : [...state.completedSteps, stepKey]
  return saveStorageWorkflowState({ completedSteps })
}
