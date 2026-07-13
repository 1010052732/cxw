import { MODEL_REGISTRY, TRAIN_JOBS } from '../../../mock/model-algorithm'

const DRAFT_KEY = 'model-algorithm-drafts'
const JOBS_KEY = 'model-algorithm-jobs'

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

export function loadModelDrafts() {
  return readJson(DRAFT_KEY, [])
}

export function saveModelDraft(draft) {
  const list = loadModelDrafts().filter((d) => d.id !== draft.id)
  writeJson(DRAFT_KEY, [{ ...draft, updatedAt: new Date().toLocaleString('zh-CN') }, ...list].slice(0, 10))
}

export function loadCustomTrainJobs() {
  return readJson(JOBS_KEY, [])
}

export function appendTrainJob(job) {
  const next = [job, ...loadCustomTrainJobs()].slice(0, 20)
  writeJson(JOBS_KEY, next)
  return next
}

export function getAllTrainJobs() {
  return [...loadCustomTrainJobs(), ...TRAIN_JOBS]
}

export function getActiveProductionModels() {
  return MODEL_REGISTRY.filter((m) => m.status === 'production')
}
