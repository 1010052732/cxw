import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Empty, Spin, Tag } from 'antd'
import { hasAmapKey, loadAmap } from '../../../../utils/amapLoader'
import { clampScore, MAP_LAYER_META } from '../../../../utils/mapHeatmap'
import {
  computeOpportunityBounds,
  getOpportunityMapView,
  resolveHeatCellLngLat,
  resolveOpportunityLngLat,
} from '../../../../utils/opportunityAmapCoords'
import { getMapDotStyle } from './listColumnConfig'
import { formatGeoLocation, getDynamicAlertColor } from '../utils'

function pickPrimaryLayer(cell, activeLayers) {
  return activeLayers.find((key) => cell[key] != null) || activeLayers[0]
}

function layerFillStyle(cell, activeLayers) {
  const primary = pickPrimaryLayer(cell, activeLayers) || 'count'
  const hex = MAP_LAYER_META[primary]?.color || '#B32620'
  const score = clampScore(cell[primary])
  return { fillColor: hex, fillOpacity: 0.18 + (score / 100) * 0.42, primaryLayer: primary }
}

function buildHeatInfoHtml(cell, activeLayers) {
  const rows = activeLayers
    .filter((key) => cell[key] != null)
    .map((key) => {
      const label = MAP_LAYER_META[key]?.label || key
      const value = key === 'count' ? `${cell.items || 0} 条` : `${cell[key]}`
      return `<div class="amap-info-row"><span>${label}</span><strong>${value}</strong></div>`
    })
    .join('')

  return `
    <div class="amap-market-info">
      <div class="amap-info-title">${cell.label || cell.id}</div>
      ${rows}
    </div>
  `
}

function buildOppInfoHtml(item) {
  const riskColor = item.riskLevel === '高' ? '#ff4d4f' : item.riskLevel === '中' ? '#faad14' : '#52c41a'
  const alertHtml = item.dynamicAlert
    ? `<div class="amap-info-row"><span>动态</span><strong style="color:${getDynamicAlertColor(item.dynamicAlert.type)}">${item.dynamicAlert.message}</strong></div>`
    : ''

  return `
    <div class="amap-market-info">
      <div class="amap-info-title">${item.name}</div>
      <div class="amap-info-row"><span>来源</span><strong>${formatGeoLocation(item)}</strong></div>
      <div class="amap-info-row"><span>市场</span><strong>${item.country || '—'}</strong></div>
      <div class="amap-info-row"><span>产品</span><strong>${item.product || '—'}</strong></div>
      <div class="amap-info-row"><span>评分</span><strong style="color:#B32620">${item.score}</strong></div>
      <div class="amap-info-row"><span>风险</span><strong style="color:${riskColor}">${item.riskLevel}</strong></div>
      <div class="amap-info-row"><span>政策</span><strong>${item.policyFriendliness}%</strong></div>
      <div class="amap-info-row"><span>收益</span><strong>${item.revenueRange || '—'}</strong></div>
      ${alertHtml}
    </div>
  `
}

function buildOppMarkerHtml(item, metric) {
  const style = getMapDotStyle(item, metric)
  const size = Math.round(style.width || 12)
  const cls = ['amap-opp-marker']
  if (item.dynamicAlert) cls.push('has-alert')
  return `<div class="${cls.join(' ')}" style="width:${size}px;height:${size}px;background:${style.background}"></div>`
}

export default function OpportunityGeoCanvas({
  items = [],
  heatCells = [],
  heatmapLayers = [],
  showDots = true,
  dotMetric = 'score',
  geoMacro = 'all',
  clusterDots = true,
  onItemClick,
  className = '',
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const infoRef = useRef(null)
  const clusterRef = useRef(null)
  const overlaysRef = useRef([])
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [loading, setLoading] = useState(false)

  const mapConfigured = hasAmapKey()
  const renderCells = useMemo(
    () => heatCells.filter((cell) => heatmapLayers.some((key) => cell[key] != null)),
    [heatCells, heatmapLayers],
  )

  useEffect(() => {
    if (!mapConfigured || !containerRef.current) return undefined

    let disposed = false
    setLoading(true)
    setMapError(null)
    setMapReady(false)

    loadAmap(['AMap.Scale', 'AMap.ToolBar', 'AMap.MarkerCluster'])
      .then((AMap) => {
        if (disposed || !containerRef.current) return

        const view = getOpportunityMapView(geoMacro)
        const map = new AMap.Map(containerRef.current, {
          zoom: view.zoom,
          center: view.center,
          viewMode: '2D',
          mapStyle: 'amap://styles/normal',
        })

        mapRef.current = map
        infoRef.current = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -10), isCustom: true })

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
      clusterRef.current?.setMap?.(null)
      clusterRef.current = null
      overlaysRef.current.forEach((o) => o?.setMap?.(null))
      overlaysRef.current = []
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
      infoRef.current = null
      setMapReady(false)
    }
  }, [geoMacro, mapConfigured])

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
    if (!map || !mapReady || !window.AMap) return

    const AMap = window.AMap
    infoRef.current?.close?.()
    clusterRef.current?.setMap?.(null)
    clusterRef.current = null
    overlaysRef.current.forEach((o) => o?.setMap?.(null))
    overlaysRef.current = []

    const next = []

    renderCells.forEach((cell) => {
      const center = resolveHeatCellLngLat(cell)
      const { fillColor, fillOpacity, primaryLayer } = layerFillStyle(cell, heatmapLayers)
      const score = clampScore(cell[primaryLayer])
      const radius = 80000 + score * 1200 + (cell.items || 0) * 15000

      const circle = new AMap.Circle({
        center,
        radius,
        strokeColor: MAP_LAYER_META[primaryLayer]?.color || '#B32620',
        strokeWeight: 1.5,
        strokeOpacity: 0.85,
        fillColor,
        fillOpacity,
        zIndex: 40,
        bubble: true,
        cursor: 'pointer',
      })
      circle.on('mouseover', () => {
        if (!infoRef.current) return
        infoRef.current.setContent(buildHeatInfoHtml(cell, heatmapLayers))
        infoRef.current.open(map, center)
      })
      circle.on('mouseout', () => infoRef.current?.close?.())
      circle.setMap(map)
      next.push(circle)
    })

    if (showDots && items.length) {
      const markers = items.map((item, index) => {
        const position = resolveOpportunityLngLat(item, index)
        const marker = new AMap.Marker({
          position,
          content: buildOppMarkerHtml(item, dotMetric),
          offset: new AMap.Pixel(-8, -8),
          zIndex: item.dynamicAlert ? 120 : 100,
          cursor: 'pointer',
          extData: item,
        })
        marker.on('click', () => onItemClick?.(item))
        marker.on('mouseover', () => {
          if (!infoRef.current) return
          infoRef.current.setContent(buildOppInfoHtml(item))
          infoRef.current.open(map, position)
        })
        marker.on('mouseout', () => infoRef.current?.close?.())
        return marker
      })

      if (clusterDots && AMap.MarkerCluster && markers.length > 3) {
        try {
          clusterRef.current = new AMap.MarkerCluster(map, markers, {
            gridSize: 70,
            maxZoom: 14,
            renderClusterMarker: (context) => {
              const count = context.count
              const size = Math.min(52, 28 + count * 2)
              const div = document.createElement('div')
              div.className = 'amap-opp-cluster'
              div.style.width = `${size}px`
              div.style.height = `${size}px`
              div.style.lineHeight = `${size}px`
              div.innerText = String(count)
              context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2))
              context.marker.setContent(div)
            },
          })
        } catch {
          markers.forEach((marker) => {
            marker.setMap(map)
            next.push(marker)
          })
        }
      } else {
        markers.forEach((marker) => {
          marker.setMap(map)
          next.push(marker)
        })
      }
    }

    overlaysRef.current = next

    const bounds = computeOpportunityBounds(items.length ? items : renderCells, (item, index) => {
      if (item?.label || item?.country) return resolveHeatCellLngLat(item)
      return resolveOpportunityLngLat(item, index)
    })

    if (bounds && typeof AMap.Bounds === 'function' && typeof map.setBounds === 'function') {
      try {
        const box = new AMap.Bounds(bounds.min, bounds.max)
        map.setBounds(box, false, [48, 48, 48, 48])
      } catch {
        const view = getOpportunityMapView(geoMacro)
        map.setZoomAndCenter(view.zoom, view.center)
      }
    } else {
      const view = getOpportunityMapView(geoMacro)
      map.setZoomAndCenter(view.zoom, view.center)
    }
  }, [
    mapReady,
    items,
    renderCells,
    heatmapLayers,
    showDots,
    dotMetric,
    geoMacro,
    clusterDots,
    onItemClick,
  ])

  const showEmpty = mapReady && !items.length && !renderCells.length

  return (
    <div className={`opportunity-amap-panel ${className}`.trim()}>
      <div className="opportunity-amap-canvas market-amap-canvas">
        {!mapConfigured && (
          <div className="market-amap-fallback">
            <Alert
              type="warning"
              showIcon
              message="未配置高德地图 Key"
              description="请在 .env 中设置 VITE_AMAP_KEY 与 VITE_AMAP_SECURITY_CODE 后重启开发服务。"
            />
          </div>
        )}

        {mapConfigured && loading && (
          <div className="market-amap-loading">
            <Spin tip="正在加载高德地图…" />
          </div>
        )}

        {mapConfigured && mapError && (
          <div className="market-amap-fallback">
            <Alert type="error" showIcon message={mapError} description="请检查 Key、安全密钥、域名白名单与网络后刷新页面。" />
          </div>
        )}

        {showEmpty && (
          <div className="market-amap-empty-hint">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当前筛选条件下暂无商机地理数据" />
          </div>
        )}

        <div ref={containerRef} className="market-amap-container opportunity-amap-container" />
      </div>

      {mapReady && (
        <div className="opportunity-amap-status">
          <Tag color="processing">高德地图</Tag>
          <Tag color="blue">{items.length} 个商机点位</Tag>
          {renderCells.length > 0 && <Tag color="default">{renderCells.length} 个聚合区</Tag>}
          {showDots && clusterDots && items.length > 3 && <Tag color="purple">智能聚合</Tag>}
        </div>
      )}
    </div>
  )
}
