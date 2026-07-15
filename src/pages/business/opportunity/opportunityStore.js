import { INITIAL_OPPORTUNITIES } from '../../../mock/opportunity'
import { applyGeoLocation, formatGeoLocation } from '../../../mock/geo'
import { getUserById } from '../../../mock/rbac'
import { evaluateOpportunities } from './utils'
import { loadEvalWeights, loadSubWeights } from './evaluation/evaluationIndicatorStore'

export const OPPORTUNITY_DATA_KEY = 'opportunity-workflow-data'
export const OPPORTUNITY_DATA_VERSION = 3
const OPPORTUNITY_DATA_VERSION_KEY = 'opportunity-workflow-data-version'

const WORKFLOW_PERSIST_FIELDS = [
  'status',
  'followStatus',
  'tags',
  'group',
  'ownerId',
  'assignedUserId',
  'favoriteUserIds',
  'favorited',
  'marked',
  'enabled',
  'assignedUserName',
  'ownerName',
  'updatedAt',
  'score',
  'marketScore',
  'policyScore',
  'creditScore',
  'compositeScore',
  'indicatorScores',
  'evaluatedAt',
]

function mergeStoredWorkflow(seed, stored) {
  if (!stored) return seed
  const merged = { ...seed }
  WORKFLOW_PERSIST_FIELDS.forEach((field) => {
    if (stored[field] !== undefined) merged[field] = stored[field]
  })
  return merged
}

function mergeOpportunityRecords(storedList = []) {
  const storedMap = new Map(storedList.map((item) => [item.id, item]))
  return INITIAL_OPPORTUNITIES.map((seed) => mergeStoredWorkflow(seed, storedMap.get(seed.id)))
}

const WORKFLOW_SEED = {
  'OP-2026-001': { ownerId: 'U003', assignedUserId: 'U004', favoriteUserIds: ['U002', 'U004'] },
  'OP-2026-004': { ownerId: 'U002', assignedUserId: 'U002', favoriteUserIds: ['U002'] },
  'OP-2026-007': { ownerId: 'U003', assignedUserId: 'U002', favoriteUserIds: ['U002'] },
  'OP-2026-012': { ownerId: 'U003', assignedUserId: 'U004', favoriteUserIds: ['U002', 'U003'] },
  'OP-2026-003': { ownerId: 'U004', assignedUserId: 'U004', favoriteUserIds: ['U004'] },
  'OP-2026-008': { ownerId: 'U002', assignedUserId: 'U003', favoriteUserIds: [] },
}

export function applyEvaluationToOpportunities(list, weights = null, subWeights = null) {
  const w = weights || loadEvalWeights()
  const sw = subWeights || loadSubWeights()
  return evaluateOpportunities(list, w, null, null, { subWeights: sw })
}

export function enrichOpportunityRecord(item, users) {
  const seed = WORKFLOW_SEED[item.id] || {}
  const withSource = applyGeoLocation(item)
  const assignedUserId = withSource.assignedUserId ?? seed.assignedUserId ?? null
  const ownerId = withSource.ownerId ?? seed.ownerId ?? null
  const favoriteUserIds = withSource.favoriteUserIds ?? seed.favoriteUserIds ?? (withSource.favorited ? ['U003'] : [])
  const assignedUser = assignedUserId ? getUserById(assignedUserId, users) : null
  const owner = ownerId ? getUserById(ownerId, users) : null

  return {
    ...withSource,
    geoLabel: formatGeoLocation(withSource),
    sourceLabel: formatGeoLocation(withSource),
    ownerId,
    ownerName: owner?.name || withSource.ownerName || null,
    assignedUserId,
    assignedUserName: assignedUser?.name || withSource.assignedUserName || null,
    favoriteUserIds: [...new Set(favoriteUserIds)],
    favorited: favoriteUserIds.length > 0,
    marked: withSource.marked ?? (withSource.tags?.length > 0),
  }
}

export function enrichOpportunities(list, users) {
  return list.map((item) => enrichOpportunityRecord(item, users))
}

export function loadOpportunities(users) {
  const version = Number(localStorage.getItem(OPPORTUNITY_DATA_VERSION_KEY) || 0)
  let base = INITIAL_OPPORTUNITIES.map((item) => ({ ...item }))

  try {
    const raw = localStorage.getItem(OPPORTUNITY_DATA_KEY)
    if (raw && version >= OPPORTUNITY_DATA_VERSION) {
      const parsed = JSON.parse(raw)
      base = mergeOpportunityRecords(parsed)
    } else if (raw && version < OPPORTUNITY_DATA_VERSION) {
      const parsed = JSON.parse(raw)
      base = mergeOpportunityRecords(parsed)
    }
  } catch {
    /* ignore */
  }

  const evaluated = applyEvaluationToOpportunities(base)
  const enriched = enrichOpportunities(evaluated, users)

  if (version < OPPORTUNITY_DATA_VERSION) {
    saveOpportunities(enriched)
    localStorage.setItem(OPPORTUNITY_DATA_VERSION_KEY, String(OPPORTUNITY_DATA_VERSION))
  }

  return enriched
}

export function persistEvaluatedScores(list, evaluatedList) {
  const map = new Map(evaluatedList.map((item) => [item.id, item]))
  const merged = list.map((item) => {
    const ev = map.get(item.id)
    if (!ev) return item
    return {
      ...item,
      score: ev.score,
      marketScore: ev.marketScore,
      policyScore: ev.policyScore,
      creditScore: ev.creditScore,
      compositeScore: ev.compositeScore,
      indicatorScores: ev.indicatorScores,
      evaluatedAt: ev.evaluatedAt || new Date().toISOString(),
    }
  })
  saveOpportunities(merged)
  return merged
}

export function saveOpportunities(data) {
  localStorage.setItem(OPPORTUNITY_DATA_KEY, JSON.stringify(data))
}

export function isFavoritedBy(opp, userId) {
  return Boolean(opp.favoriteUserIds?.includes(userId))
}

export function toggleFavoriteForUser(opp, userId) {
  const ids = new Set(opp.favoriteUserIds || [])
  if (ids.has(userId)) ids.delete(userId)
  else ids.add(userId)
  const favoriteUserIds = [...ids]
  return {
    ...opp,
    favoriteUserIds,
    favorited: favoriteUserIds.length > 0,
  }
}

export function filterAssignedTo(list, userId) {
  return list.filter((item) => item.assignedUserId === userId)
}

export function filterOwnedBy(list, userId) {
  return list.filter((item) => item.ownerId === userId)
}

export function filterFavoritedBy(list, userId) {
  return list.filter((item) => isFavoritedBy(item, userId))
}

export function updateOpportunityById(list, id, patch) {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function getOpportunityById(list, id) {
  return list.find((item) => item.id === id)
}

const DISCUSSIONS_KEY = 'opportunity-discussions'

export function loadDiscussions(id, fallback = []) {
  try {
    const raw = localStorage.getItem(DISCUSSIONS_KEY)
    if (raw) {
      const map = JSON.parse(raw)
      if (map[id]?.length) return map[id]
    }
  } catch {
    /* ignore */
  }
  return fallback
}

export function saveDiscussion(id, item) {
  try {
    const raw = localStorage.getItem(DISCUSSIONS_KEY)
    const map = raw ? JSON.parse(raw) : {}
    map[id] = [item, ...(map[id] || [])]
    localStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(map))
    return map[id]
  } catch {
    return [item]
  }
}

export const FOLLOW_STATUS_PATCH = {
  pending: { status: 'pending', addTags: ['待复核'], removeTags: ['重点跟进', '已联系', '暂缓'] },
  focus: { status: 'active', addTags: ['重点跟进'], removeTags: ['暂缓', '待复核'] },
  negotiation: { status: 'active', addTags: ['已联系'], removeTags: ['暂缓'] },
  hold: { status: 'paused', addTags: ['暂缓'], removeTags: ['重点跟进', '已联系'] },
}
