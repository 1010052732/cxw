import { useEffect, useMemo, useRef, useState } from 'react'
import { RocketOutlined, SendOutlined } from '@ant-design/icons'
import { Alert, Button, Empty, Space, Spin, Tag } from 'antd'
import { hasAmapKey, loadAmap } from '../../../../utils/amapLoader'
import { clampScore, MAP_LAYER_META } from '../../../../utils/mapHeatmap'
import {
  getCountryMapView,
  resolveEntityLngLat,
  resolvePathLngLat,
} from '../../../../utils/marketAmapCoords'
import {
  buildCellInfoHtml,
  buildGeoDisplayStats,
  computeFitBounds,
  filterRenderableCells,
  pickPrimaryLayer,
} from './marketGeoDisplay'

const OVERLAY_LAYERS = new Set(['cluster', 'resource', 'industry', 'hinterland', 'disaster', 'ftz'])

const INFRA_ICON = {
  port: '🚢',
  airport: '✈️',
  rail: '🚆',
  highway: '🛣️',
  ftz: '🏭',
}

function layerFillStyle(cell, activeLayers) {
  const primary = pickPrimaryLayer(cell, activeLayers) || activeLayers[0]
  const hex = MAP_LAYER_META[primary]?.color || '#B32620'
  const score = clampScore(cell[primary])
  return { fillColor: hex, fillOpacity: 0.2 + (score / 100) * 0.4, primaryLayer: primary }
}

function buildMarkerHtml(name, active, highlighted) {
  const cls = ['amap-market-marker']
  if (active) cls.push('active')
  if (highlighted) cls.push('highlight')
  return `<div class="${cls.join(' ')}"><span class="dot"></span><span class="label">${name}</span></div>`
}

export default function MarketGeoCanvas({
  country,
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
  geoLoading = false,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const infoRef = useRef(null)
  const overlaysRef = useRef([])
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { level, markers, parentLabel } = mapEntities
  const renderCells = useMemo(
    () => filterRenderableCells(heatmapCells, heatmapLayers),
    [heatmapCells, heatmapLayers],
  )
  const activeOverlays = useMemo(
    () => (extended?.overlayNodes || []).filter((n) => mapLayers.includes(n.layer)),
    [extended?.overlayNodes, mapLayers],
  )
  const showHighway = mapLayers.includes('infra')
  const mapConfigured = hasAmapKey()

  const displayStats = useMemo(
    () => buildGeoDisplayStats({
      cells: heatmapCells,
      heatmapLayers,
      mapLayers,
      extended,
      level,
    }),
    [heatmapCells, heatmapLayers, mapLayers, extended, level],
  )

  useEffect(() => {
    if (!mapConfigured || !containerRef.current) return undefined

    let disposed = false
    setLoading(true)
    setMapError(null)
    setMapReady(false)

    loadAmap()
      .then((AMap) => {
        if (disposed || !containerRef.current) return

        const view = getCountryMapView(country)
        const map = new AMap.Map(containerRef.current, {
          zoom: level === 'country' ? view.zoom : view.zoom + 1,
          center: view.center,
          viewMode: view3d ? '3D' : '2D',
          pitch: view3d ? 52 : 0,
          rotation: 0,
          mapStyle: 'amap://styles/normal',
        })

        mapRef.current = map
        infoRef.current = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -8), isCustom: true })

        try {
          if (AMap.Scale) map.addControl(new AMap.Scale())
          if (AMap.ToolBar) map.addControl(new AMap.ToolBar({ position: 'RB' }))
        } catch {
          /* 控件非必须 */
        }

        const markReady = () => {
          if (disposed) return
          if (typeof map.resize === 'function') map.resize()
          setMapReady(true)
          setLoading(false)
        }
        if (typeof map.on === 'function') map.on('complete', markReady)
        markReady()
      })
      .catch((err) => {
        if (disposed) return
        const msg = err?.message || ''
        setMapError(msg === 'AMAP_KEY_MISSING' ? '未配置高德 Key' : `高德地图加载失败：${msg || '未知错误'}`)
        setLoading(false)
      })

    return () => {
      disposed = true
      infoRef.current?.close?.()
      overlaysRef.current.forEach((o) => o?.setMap?.(null))
      overlaysRef.current = []
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
      infoRef.current = null
      setMapReady(false)
    }
  }, [country, mapConfigured])

  useEffect(() => {
    const el = containerRef.current
    const map = mapRef.current
    if (!el || !map || !mapReady) return undefined
    const ro = new ResizeObserver(() => {
      if (typeof map.resize === 'function') map.resize()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    const view = getCountryMapView(country)
    try {
      if (typeof map.setPitch === 'function') map.setPitch(view3d ? 52 : 0)
      if (typeof map.setViewMode === 'function') map.setViewMode(view3d ? '3D' : '2D')
      if (level === 'country' && typeof map.setZoomAndCenter === 'function') {
        map.setZoomAndCenter(view.zoom, view.center)
      }
    } catch {
      /* 部分版本不支持动态切换视角 */
    }
  }, [view3d, country, level, mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !window.AMap) return

    const AMap = window.AMap
    infoRef.current?.close?.()
    overlaysRef.current.forEach((o) => o?.setMap?.(null))
    overlaysRef.current = []

    const next = []

    renderCells.forEach((cell) => {
      const center = resolveEntityLngLat(cell, country)
      const { fillColor, fillOpacity, primaryLayer } = layerFillStyle(cell, heatmapLayers)
      const score = clampScore(cell[primaryLayer])
      const highlighted = highlightedCellIds.includes(cell.id)
      const circle = new AMap.Circle({
        center,
        radius: 16000 + score * 450,
        strokeColor: highlighted ? '#faad14' : MAP_LAYER_META[primaryLayer]?.color || '#B32620',
        strokeWeight: highlighted ? 3 : 1.5,
        strokeOpacity: 0.9,
        fillColor,
        fillOpacity,
        zIndex: highlighted ? 60 : 50,
        bubble: true,
        cursor: 'pointer',
      })
      circle.on('click', () => onCellClick?.(cell))
      circle.on('mouseover', () => {
        if (!infoRef.current) return
        infoRef.current.setContent(buildCellInfoHtml(cell, heatmapLayers))
        infoRef.current.open(map, center)
      })
      circle.on('mouseout', () => infoRef.current?.close?.())
      circle.setMap(map)
      next.push(circle)

      if (cell.label) {
        try {
          const label = new AMap.Text({
            text: cell.label,
            position: center,
            offset: new AMap.Pixel(-24, -10),
            style: {
              'background-color': 'rgba(0,0,0,0.6)',
              color: '#fff',
              'font-size': '11px',
              padding: '2px 6px',
              border: 'none',
              'border-radius': '4px',
            },
          })
          label.setMap(map)
          next.push(label)
        } catch {
          /* Text 不可用时跳过 */
        }
      }
    })

    if (showHighway) {
      ;(extended?.highwayNetwork || []).forEach((hw) => {
        const path = resolvePathLngLat(hw, country)
        const line = new AMap.Polyline({
          path,
          strokeColor: '#595959',
          strokeWeight: 4,
          strokeStyle: 'dashed',
          strokeOpacity: 0.75,
          zIndex: 40,
        })
        line.setMap(map)
        next.push(line)
      })
    }

    if (mapLayers.includes('infra')) {
      ;(extended?.infraNodes || []).forEach((node) => {
        const pos = resolveEntityLngLat(node, country)
        const marker = new AMap.Marker({
          position: pos,
          content: `<div class="amap-infra-marker" title="${node.label || ''}">${INFRA_ICON[node.type] || '📍'}</div>`,
          offset: new AMap.Pixel(-12, -12),
          zIndex: 120,
        })
        marker.setMap(map)
        next.push(marker)
      })
    }

    activeOverlays.forEach((node) => {
      const pos = resolveEntityLngLat(node, country)
      const marker = new AMap.Marker({
        position: pos,
        content: `<div class="amap-overlay-marker layer-${node.layer}" title="${node.label || ''}">${node.icon}</div>`,
        offset: new AMap.Pixel(-14, -14),
        zIndex: 110,
      })
      marker.setMap(map)
      next.push(marker)
    })

    if (showPathSim) {
      ;(extended?.logisticsPaths || []).forEach((path) => {
        const linePath = resolvePathLngLat(path, country)
        const line = new AMap.Polyline({
          path: linePath,
          strokeColor: '#B32620',
          strokeWeight: 5,
          strokeStyle: 'dashed',
          strokeOpacity: 0.9,
          zIndex: 90,
        })
        line.setMap(map)
        next.push(line)
      })
    }

    markers.forEach((m) => {
      const pos = resolveEntityLngLat(m, country)
      const active = selectedId === m.id
      const highlighted = highlightedCellIds.includes(m.id)
      const marker = new AMap.Marker({
        position: pos,
        content: buildMarkerHtml(m.name, active, highlighted),
        offset: new AMap.Pixel(-8, -8),
        zIndex: active ? 200 : highlighted ? 180 : 150,
        cursor: 'pointer',
      })
      marker.on('click', () => onMarkerClick?.(m, level))
      marker.setMap(map)
      next.push(marker)
    })

    overlaysRef.current = next

    const fitTargets = level === 'country' ? renderCells : markers
    const bounds = computeFitBounds(country, fitTargets, markers, resolveEntityLngLat)
    if (bounds && typeof AMap.Bounds === 'function' && typeof map.setBounds === 'function') {
      try {
        const box = new AMap.Bounds(bounds.min, bounds.max)
        map.setBounds(box, false, [56, 56, 56, 56])
      } catch {
        /* 视野自适应失败 */
      }
    }
  }, [
    mapReady,
    country,
    level,
    markers,
    renderCells,
    heatmapLayers,
    mapLayers,
    activeOverlays,
    showHighway,
    showPathSim,
    extended,
    selectedId,
    highlightedCellIds,
    onMarkerClick,
    onCellClick,
  ])

  const showEmptyHeat = mapReady && !geoLoading && heatmapLayers.length > 0 && !displayStats.hasHeatData

  return (
    <div className="market-map-panel">
      <div className="market-geo-toolbar">
        <Space wrap>
          <Tag color="blue">层级：{level === 'country' ? '国家/区域' : level === 'region' ? '省/州' : level === 'city' ? '城市' : '邮编区'}</Tag>
          {parentLabel && <Tag>{parentLabel}</Tag>}
          <Tag color="processing">政区底图</Tag>
          {mapReady && displayStats.hasHeatData && (
            <Tag color="default">{displayStats.cellCount} 个热力区</Tag>
          )}
          {mapReady && displayStats.infraCount > 0 && (
            <Tag color="cyan">{displayStats.infraCount} 个基建节点</Tag>
          )}
          <Button size="small" disabled={!canDrillUp} onClick={onDrillUp}>上一级</Button>
          <Button size="small" type={view3d ? 'primary' : 'default'} onClick={onToggle3d} disabled={!mapReady}>3D地形</Button>
          <Button size="small" type={showPathSim ? 'primary' : 'default'} icon={<SendOutlined />} onClick={onTogglePath} disabled={!mapReady || !displayStats.pathCount}>路径仿真</Button>
        </Space>
      </div>

      <div className={`market-map-canvas market-amap-canvas ${view3d ? 'market-map-3d' : ''}`}>
        {!mapConfigured && (
          <div className="market-amap-fallback">
            <Alert type="warning" showIcon message="未配置高德地图 Key" description="请在 .env.local 中设置 VITE_AMAP_KEY" />
          </div>
        )}

        {(mapConfigured && (loading || geoLoading)) && (
          <div className="market-amap-loading">
            <Spin tip={geoLoading ? '正在加载地理数据…' : '正在加载高德地图…'} />
          </div>
        )}

        {mapConfigured && mapError && (
          <div className="market-amap-fallback">
            <Alert type="error" showIcon message={mapError} description="请检查 Key、安全密钥、域名白名单与网络后刷新页面。" />
          </div>
        )}

        {showEmptyHeat && (
          <div className="market-amap-empty-hint">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="当前所选图层在本市场暂无数据，请切换图层或目标市场"
            />
          </div>
        )}

        <div ref={containerRef} className="market-amap-container" />
      </div>

      <div className="map-heatmap-legend">
        {heatmapLayers.map((key) => (
          <Tag key={key} color={MAP_LAYER_META[key]?.color || '#B32620'}>{MAP_LAYER_META[key]?.label || key}</Tag>
        ))}
        {mapLayers.filter((k) => OVERLAY_LAYERS.has(k)).map((key) => (
          <Tag key={`ov-${key}`} color={MAP_LAYER_META[key]?.color}>{MAP_LAYER_META[key]?.label}图层</Tag>
        ))}
        {view3d && <Tag icon={<RocketOutlined />}>3D视角</Tag>}
        {showPathSim && displayStats.pathCount > 0 && <Tag color="#B32620">路径仿真</Tag>}
        {mapReady && <Tag color="success">{countryLabel}</Tag>}
      </div>
    </div>
  )
}
