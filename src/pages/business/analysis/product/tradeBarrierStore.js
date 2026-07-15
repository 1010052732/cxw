const DOC_CHECK_KEY = 'trade-barrier-doc-check'
const CERT_APPLY_KEY = 'trade-barrier-cert-apply'

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

export function loadDocumentChecks(productName, targetMarket) {
  const all = readJson(DOC_CHECK_KEY, {})
  return all[`${productName}-${targetMarket}`] || {}
}

export function saveDocumentCheck(productName, targetMarket, docId, checked) {
  const all = readJson(DOC_CHECK_KEY, {})
  const key = `${productName}-${targetMarket}`
  all[key] = { ...(all[key] || {}), [docId]: checked }
  writeJson(DOC_CHECK_KEY, all)
  return all[key]
}

export function loadCertApplications(productName) {
  const all = readJson(CERT_APPLY_KEY, {})
  return all[productName] || []
}

export function appendCertApplication(productName, cert) {
  const all = readJson(CERT_APPLY_KEY, {})
  const entry = {
    id: `cert-${Date.now()}`,
    time: new Date().toLocaleString('zh-CN'),
    cert: cert.cert,
    agency: cert.agency,
    market: cert.market,
    status: '已提交对接',
  }
  all[productName] = [entry, ...(all[productName] || [])].slice(0, 10)
  writeJson(CERT_APPLY_KEY, all)
  return entry
}
