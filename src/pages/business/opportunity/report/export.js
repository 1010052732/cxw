export function exportReportToExcel(report, combo) {
  const lines = []
  const push = (row) => lines.push(row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))

  if (combo) {
    push(['组合评估报告', report.reportNo, report.generatedAt, report.scheme])
    push([])
    push(['排名', '商机名称', '国家', '综合得分', '评级', '市场分', '政策分', '信用分', '风险'])
    report.items.forEach((item) => {
      push([item.rank, item.title, item.country, item.compositeScore, item.rating, item.marketScore, item.policyScore, item.creditScore, item.riskLevel])
    })
    push([])
    push(['组合摘要', report.summary])
  } else {
    push(['商机评估报告', report.id, report.generatedAt])
    push(['商机名称', report.title])
    push(['综合得分', report.compositeScore, '评级', report.rating])
    push([])
    push(['维度', '得分', '权重', '加权得分'])
    report.scoreBreakdown?.forEach((r) => push([r.dimension, r.score, `${r.weight}%`, r.weighted]))
    push([])
    push(['结论解读', report.interpretation])
    push([])
    push(['政策-关税', report.policyAnalysis?.tariff])
    push(['政策-FTA', report.policyAnalysis?.fta])
    push(['信用-买家评级', report.creditAnalysis?.buyerRating])
    push(['信用-支付建议', report.creditAnalysis?.payment])
  }

  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = combo ? `${report.reportNo}.csv` : `商机评估报告_${report.id}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
