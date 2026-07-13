import {
  EnvironmentOutlined,
  GlobalOutlined,
  NodeIndexOutlined,
  RocketOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { Button, Space, Tag, Tooltip } from 'antd'
import MapHeatmapOverlay from '../../../../components/MapHeatmapOverlay'
import { MAP_LAYER_META } from '../../../../utils/mapHeatmap'

const INFRA_ICON = {
  port: '🚢',
  airport: '✈️',
  rail: '🚆',
  ftz: '🏭',
}

export default function MarketGeoCanvas({
  countryLabel,
  extended,
  mapEntities,
  heatmapCells,
  heatmapLayers,
  mapLayers,
  selectedId,
  highlightedCellIds = [],
  view3d,
  showPathSim,
  onToggle3d,
  onTogglePath,
  onMarkerClick,
  onCellClick,
  onDrillUp,
  canDrillUp,
}) {
  const { level, markers, parentLabel } = mapEntities

  return (
    <div className="market-map-panel">
      <div className="market-geo-toolbar">
        <Space wrap>
          <Tag color="blue">层级：{level === 'country' ? '国家/区域' : level === 'region' ? '省/州' : level === 'city' ? '城市' : '邮编区'}</Tag>
          {parentLabel && <Tag>{parentLabel}</Tag>}
          <Button size="small" disabled={!canDrillUp} onClick={onDrillUp}>上一级</Button>
          <Button size="small" type={view3d ? 'primary' : 'default'} onClick={onToggle3d}>3D地形</Button>
          <Button size="small" type={showPathSim ? 'primary' : 'default'} icon={<SendOutlined />} onClick={onTogglePath}>路径仿真</Button>
        </Space>
      </div>

      <div className={`market-map-canvas ${view3d ? 'market-map-3d' : ''}`}>
        <svg className="world-map-svg" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden>
          <path className="world-map-land" d="M8,22 L18,18 L28,20 L38,16 L48,18 L58,14 L68,16 L78,12 L88,18 L92,28 L88,38 L78,42 L68,48 L58,52 L48,50 L38,54 L28,50 L18,46 L10,38 Z" />
          <path className="world-map-land" d="M12,8 L22,6 L32,10 L24,14 Z" opacity="0.6" />
          <path className="world-map-land" d="M72,44 L82,42 L88,48 L80,52 Z" opacity="0.5" />
        </svg>

        <GlobalOutlined className="market-map-bg-icon" />

        <MapHeatmapOverlay
          cells={heatmapCells}
          activeLayers={heatmapLayers}
          className="market-map-heatmap"
          showLabel={level !== 'country'}
          onCellClick={onCellClick}
        />

        {mapLayers.includes('infra') && (extended?.infraNodes || []).map((node) => (
          <Tooltip key={node.id} title={`${node.label} · 基础设施节点`}>
            <div
              className="market-infra-node"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {INFRA_ICON[node.type] || <NodeIndexOutlined />}
            </div>
          </Tooltip>
        ))}

        {showPathSim && (extended?.logisticsPaths || []).map((path) => (
          <svg key={path.id} className="market-logistics-path" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line
              x1={path.from.x}
              y1={path.from.y}
              x2={path.to.x}
              y2={path.to.y}
              stroke="#B32620"
              strokeWidth="0.6"
              strokeDasharray="2 1"
            />
            <title>{`${path.label} · ${path.days}天 · 成本指数${path.costIndex}`}</title>
          </svg>
        ))}

        {markers.map((m) => {
          const active = selectedId === m.id
          const highlighted = highlightedCellIds.includes(m.id)
          return (
            <Tooltip key={m.id} title={`${m.name} · 点击下钻`}>
              <div
                className={`market-map-region ${active ? 'active' : ''} ${highlighted ? 'highlight-segment' : ''}`}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                onClick={() => onMarkerClick(m, level)}
              >
                <EnvironmentOutlined />
                <span className="market-map-region-label">{m.name}</span>
              </div>
            </Tooltip>
          )
        })}

        {level === 'country' && (
          <div
            className="market-map-center"
            style={{ left: `${extended?.mapCenter?.x || 50}%`, top: `${extended?.mapCenter?.y || 50}%` }}
          >
            {countryLabel}
          </div>
        )}
      </div>

      <div className="map-heatmap-legend">
        {heatmapLayers.map((key) => (
          <Tag key={key} color={MAP_LAYER_META[key]?.color || '#B32620'}>{MAP_LAYER_META[key]?.label || key}</Tag>
        ))}
        {view3d && <Tag icon={<RocketOutlined />}>3D视角 · 地形/走廊影响物流成本</Tag>}
      </div>
    </div>
  )
}
