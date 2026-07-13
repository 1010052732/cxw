import { useMemo, useState } from 'react'
import { DatePicker, Segmented, Space, Statistic, Typography } from 'antd'
import { DualAxes } from '@ant-design/charts'
import {
  DEFAULT_TREND_GRANULARITY,
  TREND_GRANULARITY_OPTIONS,
  buildOpportunityTrendSeries,
  getDefaultTrendRange,
  getTrendRangePresets,
} from './opportunityTrend'

const { RangePicker } = DatePicker
const { Text } = Typography

export default function OpportunityTrendChart({ opportunities, currentTotal }) {
  const [granularity, setGranularity] = useState(DEFAULT_TREND_GRANULARITY)
  const [range, setRange] = useState(() => getDefaultTrendRange(DEFAULT_TREND_GRANULARITY))

  const handleGranularityChange = (value) => {
    setGranularity(value)
    setRange(getDefaultTrendRange(value))
  }

  const { series, summary } = useMemo(
    () =>
      buildOpportunityTrendSeries({
        opportunities,
        range,
        granularity,
        currentTotal,
      }),
    [opportunities, range, granularity, currentTotal],
  )

  const rangePresets = useMemo(() => getTrendRangePresets(granularity), [granularity])

  return (
    <div className="home-trend-block home-trend-block-full">
      <div className="home-trend-toolbar">
        <div>
          <h4 className="home-subtitle">商机增长趋势</h4>
          <Text type="secondary">累计有效商机与周期新增 · 默认按周统计</Text>
        </div>
        <Space wrap size={12} className="home-trend-controls">
          <Segmented
            value={granularity}
            options={TREND_GRANULARITY_OPTIONS}
            onChange={handleGranularityChange}
          />
          <RangePicker
            value={range}
            allowClear={false}
            onChange={(value) => {
              if (value?.[0] && value?.[1]) setRange(value)
            }}
            presets={rangePresets.map((item) => ({
              label: item.label,
              value: item.range,
            }))}
          />
        </Space>
      </div>

      <div className="home-trend-summary">
        <Statistic
          title="当前有效商机"
          value={summary.latestTotal ?? currentTotal}
          suffix="条"
          valueStyle={{ color: '#B32620', fontSize: 22 }}
        />
        <Statistic
          title="本周期新增"
          value={summary.latestNew ?? 0}
          suffix="条"
          valueStyle={{ fontSize: 22 }}
        />
        <Statistic
          title="环比变化"
          value={summary.delta ?? 0}
          prefix={summary.delta >= 0 ? '+' : ''}
          suffix="条"
          valueStyle={{ color: summary.delta >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 22 }}
        />
        <div className="home-trend-range-label">
          <Text type="secondary">统计区间</Text>
          <div>{range[0]?.format('YYYY-MM-DD')} ~ {range[1]?.format('YYYY-MM-DD')}</div>
        </div>
      </div>

      <div className="home-trend-chart home-trend-chart-main">
        {series.length === 0 ? (
          <div className="home-trend-empty">所选区间暂无数据，请调整日期范围</div>
        ) : (
          <DualAxes
            data={[series, series]}
            xField="period"
            yField={['newCount', 'total']}
            height={280}
            legend={{ position: 'top' }}
            geometryOptions={[
              {
                geometry: 'column',
                color: '#ffccc7',
                columnWidthRatio: 0.45,
                label: {
                  position: 'top',
                  style: { fill: '#8c8c8c', fontSize: 11 },
                  formatter: (datum) => (datum.newCount > 0 ? datum.newCount : ''),
                },
              },
              {
                geometry: 'line',
                color: '#B32620',
                smooth: true,
                point: { size: 3, shape: 'circle' },
                lineStyle: { lineWidth: 2 },
              },
            ]}
            meta={{
              newCount: { alias: '新增商机', min: 0 },
              total: { alias: '累计有效商机', min: 0 },
            }}
            tooltip={{
              shared: true,
              showMarkers: true,
            }}
            xAxis={{
              label: {
                autoRotate: true,
                autoHide: true,
              },
            }}
          />
        )}
      </div>
    </div>
  )
}
