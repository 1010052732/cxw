import { FILTER_TEMPLATES } from '../../../../mock/opportunity'
import { cloneFilterGroup, normalizeFilterGroup } from './filterModel'

const FILTER_TEMPLATES_KEY = 'opportunity-filter-templates-custom'
export const CLASSIFY_FILTER_STATE_KEY = 'opportunity-classify-filter-state'

export function loadFilterTemplates() {
  const builtin = FILTER_TEMPLATES.map((t) => ({
    ...t,
    groups: t.groups || [],
    conditions: t.conditions || [],
  }))
  try {
    const raw = localStorage.getItem(FILTER_TEMPLATES_KEY)
    if (!raw) return builtin
    const custom = JSON.parse(raw)
    if (!Array.isArray(custom)) return builtin
    const builtinIds = new Set(builtin.map((t) => t.id))
    return [...builtin, ...custom.filter((t) => t.id && !builtinIds.has(t.id))]
  } catch {
    return builtin
  }
}

export function persistCustomTemplates(allTemplates) {
  const custom = allTemplates.filter((t) => String(t.id).startsWith('ft-custom-'))
  localStorage.setItem(FILTER_TEMPLATES_KEY, JSON.stringify(custom))
}

export function loadClassifyFilterState(fallback) {
  try {
    const raw = localStorage.getItem(CLASSIFY_FILTER_STATE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return {
      ...fallback,
      ...parsed,
      filterGroup: normalizeFilterGroup(parsed.filterGroup || fallback.filterGroup),
    }
  } catch {
    return fallback
  }
}

export function saveClassifyFilterState(state) {
  localStorage.setItem(
    CLASSIFY_FILTER_STATE_KEY,
    JSON.stringify({
      filterGroup: state.filterGroup,
      activeTemplateId: state.activeTemplateId,
      dimWeights: state.dimWeights,
      dimPriority: state.dimPriority,
      pipelineApplied: state.pipelineApplied,
    }),
  )
}

export function templateToFilterGroup(template) {
  return normalizeFilterGroup({
    logic: template.logic || 'AND',
    conditions: template.conditions || [],
    groups: template.groups || [],
  })
}

export function filterGroupToTemplatePayload(group, meta) {
  const normalized = normalizeFilterGroup(group)
  return {
    ...meta,
    logic: normalized.logic,
    conditions: normalized.conditions.map(({ field, operator, value, label, negate }) => ({
      field,
      operator,
      value,
      label: label || undefined,
      negate: negate || false,
    })),
    groups: normalized.groups.map((sub) => ({
      logic: sub.logic,
      conditions: sub.conditions.map(({ field, operator, value, label, negate }) => ({
        field, operator, value, label, negate: negate || false,
      })),
    })),
  }
}

export function cloneFilterGroupForLoad(group) {
  return cloneFilterGroup(group)
}
