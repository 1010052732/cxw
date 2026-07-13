import { Alert, Tag, Typography } from 'antd'
import { Column, Line } from '@ant-design/charts'
import {
  CAPACITY_ALERTS,
  CAPACITY_FORECAST,
  STORAGE_CAPACITY_TREND,
  STORAGE_TIERS,
} from '../../../mock/data-governance'

const { Text } = Typography

export default function CapacityTab({ totalUsage, totalCapacity }) {
  const trendFlat = STORAGE_CAPACITY_TREND.flatMap((item) => [
    { month: item.month, value: item.hot, type: '热存储' },
    { month: item.month, value: item.warm, type: '温存储' },
    { month: item.month, value: item.cold, type: '冷存储' },
  ])

  const forecastTotal = CAPACITY_FORECAST.map((item) => ({
    month: item.month,
    value: Math.round((item.hot + item.warm + item.cold) * 10) / 10,
    type: item.type,
  }))

  const hotForecast = CAPACITY_FORECAST.find((item) => item.type === '预测')

  return (
    <>
      <div className="business-stat-grid storage-capacity-stats" style={{ marginBottom: 16 }}>
        <div className="business-stat-card">
          <div className="value">{totalUsage.toFixed(1)} TB</div>
          <div className="label">总已用容量</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{totalCapacity.toFixed(1)} TB</div>
          <div className="label">总规划容量</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{Math.round((totalUsage / totalCapacity) * 100)}%</div>
          <div className="label">整体使用率</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{hotForecast ? hotForecast.hot : '—'} TB</div>
          <div className="label">热层次月预测</div>
        </div>
      </div>

      {CAPACITY_ALERTS.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.level === 'warning' ? 'warning' : 'info'}
          showIcon
          style={{ marginBottom: 12 }}
          message={alert.message}
          description={`当前 ${alert.current}% · 预警阈值 ${alert.threshold}% · 建议提前规划扩容`}
        />
      ))}

      <div className="business-panel" style={{ marginBottom: 16 }}>
        <h3 className="business-panel-title">各层存储容量增长趋势</h3>
        <div className="business-chart-box">
          <Line
            data={trendFlat}
            xField="month"
            yField="value"
            seriesField="type"
            height={300}
            smooth
            color={['#B32620', '#faad14', '#1677ff']}
            yAxis={{ title: { text: 'TB' } }}
          />
        </div>
      </div>

      <div className="business-panel">
        <h3 className="business-panel-title">未来总容量预测</h3>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          基于近 6 个月增长速率 · 实线柱为实际 · 虚线区域为预测
        </Text>
        <div className="business-chart-box-sm">
          <Column
            data={forecastTotal}
            xField="month"
            yField="value"
            seriesField="type"
            isGroup
            height={260}
            color={['#B32620', '#faad14']}
            label={{ position: 'top', style: { fill: '#8c8c8c' } }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          {STORAGE_TIERS.filter((t) => t.usagePercent >= 65).map((t) => (
            <Tag key={t.tier} color="warning" style={{ marginBottom: 4 }}>
              {t.label} 使用率 {t.usagePercent}% · 接近容量上限
            </Tag>
          ))}
        </div>
      </div>
    </>
  )
}
