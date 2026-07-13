import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'

dayjs.extend(isoWeek)
dayjs.extend(quarterOfYear)

/** 平台 Mock 基准日期 */
export const TREND_ANCHOR = dayjs('2026-07-02')

export const TREND_GRANULARITY_OPTIONS = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'year', label: '年' },
]

export const DEFAULT_TREND_GRANULARITY = 'week'

const RANGE_PRESETS = {
  day: { amount: 29, unit: 'day' },
  week: { amount: 11, unit: 'week' },
  month: { amount: 11, unit: 'month' },
  quarter: { amount: 7, unit: 'quarter' },
  year: { amount: 4, unit: 'year' },
}

export function getDefaultTrendRange(granularity = DEFAULT_TREND_GRANULARITY) {
  const end = TREND_ANCHOR.endOf('day')
  const preset = RANGE_PRESETS[granularity] || RANGE_PRESETS.week
  const start = end.subtract(preset.amount, preset.unit).startOf(granularity === 'week' ? 'isoWeek' : granularity)
  return [start, end]
}

function alignPeriodStart(date, granularity) {
  if (granularity === 'week') return date.startOf('isoWeek')
  if (granularity === 'quarter') return date.startOf('quarter')
  return date.startOf(granularity)
}

function nextPeriod(date, granularity) {
  if (granularity === 'week') return date.add(1, 'week').startOf('isoWeek')
  if (granularity === 'quarter') return date.add(1, 'quarter').startOf('quarter')
  return date.add(1, granularity).startOf(granularity)
}

function formatPeriodLabel(date, granularity) {
  switch (granularity) {
    case 'day':
      return date.format('MM-DD')
    case 'week': {
      const end = date.endOf('isoWeek')
      return `${date.format('MM/DD')}-${end.format('MM/DD')}`
    }
    case 'month':
      return date.format('YYYY-MM')
    case 'quarter':
      return `${date.format('YYYY')} Q${date.quarter()}`
    case 'year':
      return `${date.format('YYYY')}年`
    default:
      return date.format('YYYY-MM-DD')
  }
}

function countOpportunitiesInPeriod(opportunities, periodStart, periodEnd) {
  return opportunities.filter((item) => {
    const created = dayjs(item.createdAt?.split(' ')[0])
    if (!created.isValid()) return false
    return !created.isBefore(periodStart, 'day') && !created.isAfter(periodEnd, 'day')
  }).length
}

/** 确定性波动，保证同参数结果一致 */
function seededNoise(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function buildBaselineNewCount(periodIndex, granularity, currentTotal) {
  const growthBase = {
    day: 1.2,
    week: 4,
    month: 12,
    quarter: 28,
    year: 45,
  }[granularity] || 4
  const noise = (seededNoise(periodIndex + granularity.length * 7) - 0.5) * growthBase * 0.35
  return Math.max(0, Math.round(growthBase + noise + periodIndex * 0.08))
}

export function buildOpportunityTrendSeries({
  opportunities = [],
  range,
  granularity = DEFAULT_TREND_GRANULARITY,
  currentTotal = 128,
}) {
  if (!range?.[0] || !range?.[1]) return { series: [], summary: {} }

  const [rangeStart, rangeEnd] = range
  const start = alignPeriodStart(rangeStart, granularity)
  const end = rangeEnd.endOf('day')

  const periods = []
  let cursor = start
  let guard = 0

  while ((cursor.isBefore(end) || cursor.isSame(end, granularity === 'week' ? 'isoWeek' : granularity)) && guard < 500) {
    const periodStart = cursor
    const periodEnd =
      granularity === 'week'
        ? cursor.endOf('isoWeek')
        : granularity === 'quarter'
          ? cursor.endOf('quarter')
          : cursor.endOf(granularity)

    const clippedEnd = periodEnd.isAfter(end) ? end : periodEnd
    const realNew = countOpportunitiesInPeriod(opportunities, periodStart, clippedEnd)
    const baselineNew = buildBaselineNewCount(periods.length, granularity, currentTotal)
    const newCount = realNew > 0 ? realNew + Math.max(0, baselineNew - 2) : baselineNew

    periods.push({
      period: formatPeriodLabel(periodStart, granularity),
      periodStart: periodStart.valueOf(),
      newCount,
      total: 0,
    })

    cursor = nextPeriod(cursor, granularity)
    guard += 1
  }

  if (periods.length === 0) {
    return { series: [], summary: { delta: 0, latestTotal: currentTotal, latestNew: 0 } }
  }

  const startTotal = Math.max(Math.round(currentTotal * 0.62), currentTotal - periods.reduce((s, p) => s + p.newCount, 0))
  let running = startTotal

  periods.forEach((point, index) => {
    running += point.newCount
    if (index === periods.length - 1) {
      point.total = currentTotal
    } else {
      point.total = running
    }
  })

  const last = periods[periods.length - 1]
  const prev = periods.length > 1 ? periods[periods.length - 2] : null

  return {
    series: periods,
    summary: {
      delta: prev ? last.total - prev.total : last.newCount,
      latestTotal: last.total,
      latestNew: last.newCount,
      periodCount: periods.length,
    },
  }
}

export function getTrendRangePresets(granularity) {
  const end = TREND_ANCHOR
  const presets = {
    day: [
      { label: '近7天', range: [end.subtract(6, 'day'), end] },
      { label: '近30天', range: [end.subtract(29, 'day'), end] },
      { label: '近90天', range: [end.subtract(89, 'day'), end] },
    ],
    week: [
      { label: '近4周', range: [end.subtract(3, 'week').startOf('isoWeek'), end] },
      { label: '近12周', range: [end.subtract(11, 'week').startOf('isoWeek'), end] },
      { label: '近26周', range: [end.subtract(25, 'week').startOf('isoWeek'), end] },
    ],
    month: [
      { label: '近6月', range: [end.subtract(5, 'month').startOf('month'), end] },
      { label: '近12月', range: [end.subtract(11, 'month').startOf('month'), end] },
      { label: '近24月', range: [end.subtract(23, 'month').startOf('month'), end] },
    ],
    quarter: [
      { label: '近4季', range: [end.subtract(3, 'quarter').startOf('quarter'), end] },
      { label: '近8季', range: [end.subtract(7, 'quarter').startOf('quarter'), end] },
    ],
    year: [
      { label: '近3年', range: [end.subtract(2, 'year').startOf('year'), end] },
      { label: '近5年', range: [end.subtract(4, 'year').startOf('year'), end] },
    ],
  }
  return presets[granularity] || presets.week
}
