import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Breadcrumb, Button, Space, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, GlobalOutlined, ZoomInOutlined } from '@ant-design/icons'
import MapHeatmapOverlay from './MapHeatmapOverlay'
import {
  buildLocationSearchParams,
  buildRiskMapCells,
  getRiskGeoLevel,
} from '../mock/risk-geo'
import { getHeatColor } from '../mock/risk'

const { Text } = Typography

function WorldMapSvg() {
  return (
    <svg className="world-map-svg" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <path
        className="world-map-land"
        d="M120,120 Q180,80 260,95 T420,85 Q500,70 580,95 T720,110 Q820,100 880,130 L900,180 Q860,220 820,250 T760,300 Q700,340 640,360 T520,380 Q420,400 340,390 T220,370 Q160,350 120,300 Z"
      />
      <path
        className="world-map-land"
        d="M150,90 Q220,60 310,75 T450,65 Q540,55 620,80 T760,95 Q840,85 900,115 L880,160 Q820,190 740,210 T600,220 Q480,230 380,215 T250,200 Q180,185 150,140 Z"
        transform="translate(0, 20) scale(0.95)"
      />
      <path
        className="world-map-land"
        d="M780,280 Q840,260 900,290 T950,340 Q920,390 860,410 T780,420 Q720,400 700,350 T740,300 Z"
      />
      <path
        className="world-map-land"
        d="M430,300 Q500,280 580,300 T680,320 Q720,350 700,400 T620,430 Q540,440 480,420 T400,390 Q380,350 430,300 Z"
      />
      <path
        className="world-map-land"
        d="M250,320 Q320,300 390,320 T480,340 Q520,370 500,410 T420,430 Q340,420 290,390 T250,360 Z"
      />
    </svg>
  )
}

export default function WorldMapHeatmap({
  title = '全球风险热力图',
  subtitle = '颜色越深风险越高 · 点击区域下钻：洲 → 国家 → 城市 → 详情',
  height = 380,
  navigateOnLeaf = true,
  onLeafClick,
}) {
  const navigate = useNavigate()
  const [drill, setDrill] = useState({ macro: null, country: null })

  const level = getRiskGeoLevel(drill)
  const cells = useMemo(() => buildRiskMapCells(level, drill), [level, drill])

  const breadcrumbItems = useMemo(() => {
    const items = [{ title: '全球', onClick: () => setDrill({ macro: null, country: null }) }]
    if (drill.macro) items.push({ title: drill.macro, onClick: () => setDrill({ macro: drill.macro, country: null }) })
    if (drill.country) items.push({ title: drill.country })
    return items
  }, [drill])

  const handleCellClick = (cell) => {
    const meta = cell.meta || {}
    if (meta.level === 'macro') {
      setDrill({ macro: meta.label, country: null })
      return
    }
    if (meta.level === 'country') {
      setDrill({ macro: drill.macro, country: meta.label })
      return
    }
    const location = { macro: drill.macro, country: drill.country, city: meta.label }
    if (onLeafClick) {
      onLeafClick(location)
      return
    }
    if (navigateOnLeaf) {
      navigate(`/risk/location?${buildLocationSearchParams(location)}`)
    }
  }

  const handleBack = () => {
    if (drill.country) setDrill({ macro: drill.macro, country: null })
    else setDrill({ macro: null, country: null })
  }

  const avgScore = cells.length
    ? Math.round(cells.reduce((s, c) => s + (c.risk || 0), 0) / cells.length)
    : 0

  return (
    <div className="business-panel world-map-panel">
      <div className="world-map-panel-header">
        <div>
          <h3 className="business-panel-title" style={{ margin: 0 }}>
            <GlobalOutlined style={{ marginRight: 8 }} />
            {title}
          </h3>
          <Text type="secondary">{subtitle}</Text>
        </div>
        <Space wrap>
          {level !== 'macro' && (
            <Button size="small" icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回上一级
            </Button>
          )}
          <Tag color={avgScore >= 75 ? 'error' : avgScore >= 50 ? 'warning' : 'success'}>
            当前层均分 {avgScore}
          </Tag>
          <Tag icon={<ZoomInOutlined />}>
            {level === 'macro' ? '洲/区域' : level === 'country' ? '国家' : '城市'}
          </Tag>
        </Space>
      </div>

      <div className="market-map-canvas world-map-canvas layer-risk" style={{ height }}>
        <WorldMapSvg />
        <MapHeatmapOverlay
          cells={cells}
          activeLayers={['risk']}
          className="world-map-heatmap"
          showLabel
          onCellClick={handleCellClick}
        />
      </div>

      <div className="map-heatmap-legend">
        <Tag color="#faad14">风险强度</Tag>
        <Text type="secondary">低</Text>
        <div className="world-map-gradient-bar" />
        <Text type="secondary">高</Text>
        <Text type="secondary" style={{ marginLeft: 8 }}>
          点击热点继续下钻{level === 'city' ? '，进入风险详情页' : ''}
        </Text>
      </div>

      <Breadcrumb
        style={{ marginTop: 12 }}
        items={breadcrumbItems.map((item, index) => ({
          title: index < breadcrumbItems.length - 1 ? (
            <span style={{ cursor: 'pointer' }} onClick={item.onClick}>{item.title}</span>
          ) : item.title,
        }))}
      />

      <div className="world-map-score-legend">
        {[90, 70, 50, 30].map((score) => (
          <span key={score} className="world-map-score-chip" style={{ background: getHeatColor(score) }}>
            {score}+
          </span>
        ))}
      </div>
    </div>
  )
}
