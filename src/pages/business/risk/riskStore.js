/** 风险防控闭环状态（识别 → 评估 → 应对 → 档案） */

const STORE_KEY = 'dtip-risk-lifecycle-v1'

const DEFAULT_STATE = {
  version: 1,
  activeCase: null,
  alerts: [],
  assessments: [],
  responsePlans: [],
  archives: [],
  updatedAt: null,
}

function readState() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function writeState(next) {
  const payload = { ...next, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORE_KEY, JSON.stringify(payload))
  return payload
}

export function loadRiskLifecycle() {
  return readState()
}

export function clearRiskLifecycle() {
  localStorage.removeItem(STORE_KEY)
  return { ...DEFAULT_STATE }
}

/** 监测预警确认 / 送评估 / 送应对 */
export function pushRiskAlert(alert) {
  const state = readState()
  const entry = {
    id: alert.id || `ALERT-${Date.now()}`,
    title: alert.title,
    type: alert.type || '综合风险',
    level: alert.level || '橙色',
    status: alert.status || '新触发',
    source: alert.source || 'monitoring',
    suggestedModel: alert.suggestedModel || 'el',
    createdAt: alert.triggerTime || new Date().toISOString().slice(0, 16).replace('T', ' '),
    ...alert,
  }
  const alerts = [entry, ...state.alerts.filter((a) => a.id !== entry.id)].slice(0, 50)
  return writeState({ ...state, alerts, activeCase: entry })
}

/** 评估完成写入闭环 */
export function pushRiskAssessment(assessment) {
  const state = readState()
  const entry = {
    id: assessment.id || `ASSESS-${Date.now()}`,
    title: assessment.title || state.activeCase?.title || '风险评估',
    modelId: assessment.modelId,
    modelName: assessment.modelName,
    score: assessment.score,
    level: assessment.level,
    grade: assessment.grade,
    signalId: assessment.signalId || state.activeCase?.id,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ...assessment,
  }
  const assessments = [entry, ...state.assessments.filter((a) => a.id !== entry.id)].slice(0, 30)
  return writeState({
    ...state,
    assessments,
    activeCase: {
      ...(state.activeCase || {}),
      id: entry.signalId || entry.id,
      title: entry.title,
      level: entry.level,
      assessmentId: entry.id,
      status: '已评估',
    },
  })
}

/** 应对计划写入闭环 */
export function pushRiskResponsePlan(plan) {
  const state = readState()
  const entry = {
    id: plan.id || `PLAN-${Date.now()}`,
    title: plan.title || state.activeCase?.title || '应对计划',
    strategyType: plan.strategyType || '降低',
    status: plan.status || '执行中',
    assessmentId: plan.assessmentId || state.activeCase?.assessmentId,
    actions: plan.actions || [],
    kris: plan.kris || [],
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ...plan,
  }
  const responsePlans = [entry, ...state.responsePlans.filter((p) => p.id !== entry.id)].slice(0, 30)
  return writeState({
    ...state,
    responsePlans,
    activeCase: {
      ...(state.activeCase || {}),
      title: entry.title,
      planId: entry.id,
      status: '处置中',
    },
  })
}

/** 关闭并归档 */
export function archiveRiskCase(archive) {
  const state = readState()
  const entry = {
    id: archive.id || `ARCH-${Date.now()}`,
    title: archive.title || state.activeCase?.title || '风险档案',
    alertId: archive.alertId || state.activeCase?.id,
    assessmentId: archive.assessmentId || state.activeCase?.assessmentId,
    planId: archive.planId || state.activeCase?.planId,
    conclusion: archive.conclusion || '已关闭',
    lessons: archive.lessons || '',
    closedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ...archive,
  }
  const archives = [entry, ...state.archives.filter((a) => a.id !== entry.id)].slice(0, 40)
  return writeState({
    ...state,
    archives,
    activeCase: state.activeCase
      ? { ...state.activeCase, status: '已关闭', archiveId: entry.id }
      : null,
  })
}

export function getActiveRiskCase() {
  return readState().activeCase
}

export function getPendingAssessments() {
  return readState().alerts.filter((a) => a.status === '新触发' || a.status === '待评估')
}
