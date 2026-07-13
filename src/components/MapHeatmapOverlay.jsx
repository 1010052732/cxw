import { Tooltip } from 'antd'
import { blendLayerColors, clampScore, getLayerHeatBorder, MAP_LAYER_META } from '../utils/mapHeatmap'

export default function MapHeatmapOverlay({
  cells = [],
  activeLayers = [],
  className = '',
  showLabel = false,
  onCellClick,
}) {
  if (!cells.length || !activeLayers.length) return null

  return (
    <div className={`map-heatmap-overlay ${className}`.trim()}>
      {cells.map((cell) => {
        const background = blendLayerColors(activeLayers, cell, activeLayers)
        const primaryLayer = activeLayers.find((key) => cell[key] != null) || activeLayers[0]
        const primaryValue = clampScore(cell[primaryLayer])
        const size = cell.r ? cell.r * 2 : Math.max(36, (cell.w || 16) * 2)
        const tooltipLines = activeLayers
          .filter((key) => cell[key] != null)
          .map((key) => `${MAP_LAYER_META[key]?.label || key}：${clampScore(cell[key])}`)

        return (
          <Tooltip
            key={cell.id || `${cell.x}-${cell.y}`}
            title={(
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{cell.label || cell.id}</div>
                {tooltipLines.map((line) => <div key={line}>{line}</div>)}
                {cell.items != null && <div>商机数量：{cell.items}</div>}
              </div>
            )}
          >
            <div
              className={`map-heatmap-cell ${onCellClick ? 'clickable' : ''}`.trim()}
              style={{
                left: `${cell.x}%`,
                top: `${cell.y}%`,
                width: cell.w ? `${cell.w}%` : size,
                height: cell.h ? `${cell.h}%` : size,
                background,
                borderColor: getLayerHeatBorder(primaryValue, primaryLayer),
                borderRadius: cell.w ? 10 : '50%',
              }}
              onClick={onCellClick ? () => onCellClick(cell) : undefined}
            >
              {showLabel && <span className="map-heatmap-cell-label">{cell.label}</span>}
            </div>
          </Tooltip>
        )
      })}
    </div>
  )
}
