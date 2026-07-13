import { FILTER_METRIC_POOL } from '../../../../mock/opportunity'

export const LOGIC_OPTIONS = [
  { value: 'AND', label: 'AND（并且）', desc: '同时满足全部条件' },
  { value: 'OR', label: 'OR（或者）', desc: '满足任意一个即可' },
  { value: 'NOT', label: 'NOT（排除）', desc: '排除同时满足全部条件的结果' },
]

export const OPERATOR_OPTIONS = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '≠' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '≥' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '≤' },
  { value: 'contains', label: '包含' },
]

export const ALL_METRICS = FILTER_METRIC_POOL.flatMap((g) =>
  g.metrics.map((m) => ({ ...m, category: g.label, categoryKey: g.category })),
)

export function getMetricMeta(field) {
  return ALL_METRICS.find((m) => m.field === field)
}

export function createCondition(overrides = {}) {
  const field = overrides.field || 'score'
  const meta = getMetricMeta(field)
  const defaultValue = meta?.type === 'number' ? 80 : meta?.type === 'select' ? meta.options?.[0] : ''
  return {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    field,
    operator: meta?.type === 'text' ? 'contains' : meta?.type === 'date' ? 'gte' : 'gte',
    value: defaultValue,
    label: '',
    negate: false,
    ...overrides,
  }
}

export function createFilterGroup(overrides = {}) {
  return {
    logic: 'AND',
    conditions: [],
    groups: [],
    ...overrides,
  }
}

export function normalizeFilterGroup(group) {
  if (!group) return createFilterGroup()
  return {
    logic: group.logic || 'AND',
    conditions: (group.conditions || []).map((c, i) => ({
      ...createCondition({ field: 'score' }),
      ...c,
      id: c.id || `c-${i}`,
    })),
    groups: (group.groups || []).map((g, i) => normalizeFilterGroup({ ...g, groups: g.groups || [] })),
  }
}

export function cloneFilterGroup(group) {
  return JSON.parse(JSON.stringify(normalizeFilterGroup(group)))
}

function operatorLabel(op) {
  return OPERATOR_OPTIONS.find((o) => o.value === op)?.label || op
}

export function formatConditionLabel(condition) {
  if (condition.label) return condition.label
  const meta = getMetricMeta(condition.field)
  const name = meta?.label || condition.field
  return `${name} ${operatorLabel(condition.operator)} ${condition.value ?? ''}`
}

export function buildFilterExpression(group, depth = 0) {
  const normalized = normalizeFilterGroup(group)
  const parts = []

  normalized.conditions.forEach((cond) => {
    const text = formatConditionLabel(cond)
    parts.push(cond.negate ? `NOT (${text})` : text)
  })

  normalized.groups.forEach((sub) => {
    const subExpr = buildFilterExpression(sub, depth + 1)
    if (subExpr) parts.push(`(${subExpr})`)
  })

  if (!parts.length) return '暂无条件'
  const joiner = ` ${normalized.logic} `
  return parts.join(joiner)
}

export function countConditions(group) {
  const normalized = normalizeFilterGroup(group)
  return normalized.conditions.length + normalized.groups.reduce((sum, g) => sum + countConditions(g), 0)
}
