/** Shared export helpers for analysis modules — download real CSV blobs (no toast-only). */

export function downloadTextFile(filename, content, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\uFEFF' + content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function rowsToCsv(headers, rows) {
  const escape = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.map(escape).join(',')]
  rows.forEach((row) => {
    lines.push(headers.map((h) => escape(typeof row === 'object' ? row[h] : row)).join(','))
  })
  return lines.join('\n')
}

export function exportCsv(filename, headers, rows) {
  downloadTextFile(filename, rowsToCsv(headers, rows))
}

export function exportJsonAsTxt(filename, data) {
  downloadTextFile(filename, typeof data === 'string' ? data : JSON.stringify(data, null, 2), 'text/plain;charset=utf-8')
}
