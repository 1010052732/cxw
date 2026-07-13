const REPORT_CONFIG_PREFIX = 'opportunity-report-config'

export function saveReportConfig(reportId, config) {
  sessionStorage.setItem(`${REPORT_CONFIG_PREFIX}:${reportId}`, JSON.stringify(config))
}

export function loadReportConfig(reportId) {
  try {
    const raw = sessionStorage.getItem(`${REPORT_CONFIG_PREFIX}:${reportId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveReportBundle(config) {
  sessionStorage.setItem(REPORT_CONFIG_PREFIX, JSON.stringify(config))
}

export function loadReportBundle() {
  try {
    const raw = sessionStorage.getItem(REPORT_CONFIG_PREFIX)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
