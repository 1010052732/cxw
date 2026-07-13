import {
  CUSTOM_INDICATOR_PRESETS,
  DEFAULT_SUB_WEIGHTS,
  DEFAULT_THRESHOLDS,
  DEFAULT_WEIGHTS,
  WEIGHT_SCHEMES,
} from '../../../../mock/opportunity'

const WEIGHTS_KEY = 'opportunity-eval-weights'
const SUB_WEIGHTS_KEY = 'opportunity-eval-sub-weights'
const THRESHOLDS_KEY = 'opportunity-eval-thresholds'
const SCHEMES_KEY = 'opportunity-eval-weight-schemes'
const CUSTOM_INDICATORS_KEY = 'opportunity-eval-custom-indicators'
const ACTIVE_CUSTOM_KEY = 'opportunity-eval-active-custom'
const CUSTOM_ENABLED_KEY = 'opportunity-eval-custom-enabled'
const ACTIVE_SCHEME_KEY = 'opportunity-eval-active-scheme'
const AUDIT_KEY = 'opportunity-eval-audit-log'

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

export function loadEvalWeights() {
  const saved = readJson(WEIGHTS_KEY, null)
  if (!saved || typeof saved !== 'object') return DEFAULT_WEIGHTS
  const { market, policy, credit } = saved
  if ([market, policy, credit].every((v) => typeof v === 'number' && !Number.isNaN(v))) {
    return { market, policy, credit }
  }
  return DEFAULT_WEIGHTS
}

export function saveEvalWeights(weights) {
  writeJson(WEIGHTS_KEY, weights)
}

export function loadSubWeights() {
  return readJson(SUB_WEIGHTS_KEY, DEFAULT_SUB_WEIGHTS)
}

export function saveSubWeights(subWeights) {
  writeJson(SUB_WEIGHTS_KEY, subWeights)
}

export function loadEvalThresholds() {
  return readJson(THRESHOLDS_KEY, DEFAULT_THRESHOLDS)
}

export function saveEvalThresholds(thresholds) {
  writeJson(THRESHOLDS_KEY, thresholds)
}

export function loadCustomIndicators() {
  return readJson(CUSTOM_INDICATORS_KEY, CUSTOM_INDICATOR_PRESETS)
}

export function saveCustomIndicators(list) {
  writeJson(CUSTOM_INDICATORS_KEY, list)
}

export function loadActiveCustomId() {
  return localStorage.getItem(ACTIVE_CUSTOM_KEY) || CUSTOM_INDICATOR_PRESETS[0]?.id
}

export function saveActiveCustomId(id) {
  localStorage.setItem(ACTIVE_CUSTOM_KEY, id)
}

export function loadSavedSchemes() {
  const custom = readJson(SCHEMES_KEY, [])
  return [...WEIGHT_SCHEMES, ...custom]
}

export function saveCustomSchemes(schemes) {
  writeJson(SCHEMES_KEY, schemes)
}

export function appendAuditEntry(entry) {
  const log = readJson(AUDIT_KEY, [])
  const next = [{ id: `audit-${Date.now()}`, time: new Date().toLocaleString('zh-CN'), ...entry }, ...log].slice(0, 30)
  writeJson(AUDIT_KEY, next)
  return next
}

export function loadAuditLog() {
  return readJson(AUDIT_KEY, [])
}

export function loadCustomEnabled() {
  const raw = localStorage.getItem(CUSTOM_ENABLED_KEY)
  return raw === null ? true : raw === 'true'
}

export function saveCustomEnabled(enabled) {
  localStorage.setItem(CUSTOM_ENABLED_KEY, String(enabled))
}

export function loadActiveSchemeName() {
  return localStorage.getItem(ACTIVE_SCHEME_KEY) || ''
}

export function saveActiveSchemeName(name) {
  if (name) localStorage.setItem(ACTIVE_SCHEME_KEY, name)
  else localStorage.removeItem(ACTIVE_SCHEME_KEY)
}
