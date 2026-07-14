import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../../auth/AuthContext'
import { ANALYSIS_SCOPE_FIELDS } from '../../../../constants/dataScope'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Column, Heatmap, Line, Pie } from '@ant-design/charts'
import {
  FileProtectOutlined,
  GlobalOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { MAP_LAYER_META } from '../../../../utils/mapHeatmap'
import { resolveEntityLngLat } from '../../../../utils/marketAmapCoords'
import { fetchMarketGeoDashboard } from '../../../../services/marketGeoService'
import AnalysisWorkflowBar from '../AnalysisWorkflowBar'
import ForecastTab from './ForecastTab'
import CompetitionTab from './CompetitionTab'
import PolicyTab from './PolicyTab'
import MarketGeoCanvas from './MarketGeoCanvas'
import MarketGeoLayerPanel from './MarketGeoLayerPanel'
import MarketSnapshotDrawer from './MarketSnapshotDrawer'
import ValueChainMap from './ValueChainMap'
import {
  enrichDemandSegments,
  enrichMarketExtended,
  enrichRegionSnapshot,
  filterTradeByRegion,
  getDrillLevel,
  getMapEntities,
  getRegionFactor,
  getTimelineContext,
  getTrendXLabel,
  matchSegmentToCells,
  resolveGeoSelection,
  scaleOverviewByRegion,
  syncTimelineIndex,
} from './marketGeoUtils'
import {
  MAP_LAYERS,
  MARKET_COUNTRIES,
  PRODUCT_CATEGORIES,
  TIME_PERIODS,
  getDemandSegments,
  getMarketData,
  getMarketHeatmapCells,
  getSupplyMaterials,
} from '../../../../mock/analysis'
import '../../business.css'

const { Text, Paragraph } = Typography

const impactColor = { 高: 'error', 中: 'warning', 低: 'success' }
const TAB_KEYS = ['overview', 'structure', 'forecast', 'competition', 'policy']

const VALUE_CHAIN_ENRICH = (chain) => chain.map((v, i) => ({
  ...v,
  barrier: i === 0 ? '资源与许可' : i === 1 ? '精度与认证' : i === 2 ? '规模与良率' : '渠道与品牌',
  entryMode: i <= 1 ? '合资/并购关键节点' : i === 2 ? '设厂或ODM合作' : '本地代理+平台',
}))

export default function AnalysisMarketPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { filterModuleData } = useAuth()
  const [activeTab, setActiveTab] = useTabSearchParam(TAB_KEYS, 'overview')
  const countryOptions = useMemo(
    () => filterModuleData(
      MARKET_COUNTRIES.map((c) => ({ ...c, region: c.label })),
      'analysis',
      ANALYSIS_SCOPE_FIELDS,
    ),
    [filterModuleData],
  )

  const [country, setCountry] = useState(() => searchParams.get('country') || countryOptions[0]?.value || 'germany')
  const [period, setPeriod] = useState(() => searchParams.get('period') || '6m')
  const [mapLayers, setMapLayers] = useState(MAP_LAYERS.filter((l) => l.default).map((l) => l.key))
  const [timelineIdx, setTimelineIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const playTimer = useRef(null)
  const [category, setCategory] = useState(() => searchParams.get('category') || 'vehicle')
  const [drillStack, setDrillStack] = useState([])
  const [selectedGeo, setSelectedGeo] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [highlightSegment, setHighlightSegment] = useState(null)
  const [highlightCellIds, setHighlightCellIds] = useState([])
  const [view3d, setView3d] = useState(false)
  const [showPathSim, setShowPathSim] = useState(false)
  const [geoPayload, setGeoPayload] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const prevCountryRef = useRef(country)

  useEffect(() => {
    const c = searchParams.get('country')
    const p = searchParams.get('period')
    const cat = searchParams.get('category')
    if (c && MARKET_COUNTRIES.some((item) => item.value === c)) setCountry(c)
    if (p) setPeriod(p)
    if (cat) setCategory(cat)
  }, [searchParams])

  const syncMarketParams = (patch = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', patch.tab || activeTab)
      next.set('country', patch.country || country)
      next.set('period', patch.period || period)
      next.set('category', patch.category || category)
      return next
    })
  }

  const data = useMemo(() => getMarketData(country, period), [country, period])

  useEffect(() => {
    let cancelled = false
    setGeoLoading(true)
    fetchMarketGeoDashboard({ country, period, category })
      .then((payload) => {
        if (!cancelled) setGeoPayload(payload)
      })
      .finally(() => {
        if (!cancelled) setGeoLoading(false)
      })
    return () => { cancelled = true }
  }, [country, period, category])

  useEffect(() => {
    if (prevCountryRef.current !== country && geoPayload?.defaultLayers?.length) {
      setMapLayers(geoPayload.defaultLayers)
      prevCountryRef.current = country
    }
  }, [country, geoPayload])

  const extended = useMemo(
    () => geoPayload?.extended || enrichMarketExtended(data.extended),
    [geoPayload, data.extended],
  )
  const countryLabel = MARKET_COUNTRIES.find((c) => c.value === country)?.label || country
  const geoLevel = getDrillLevel(drillStack)
  const regionFactor = getRegionFactor(selectedGeo, geoLevel)
  const mapEntities = useMemo(() => getMapEntities(extended, drillStack), [extended, drillStack])

  const timeline = extended?.timeline || []
  const currentTimeline = timelineIdx >= 0 ? timeline[timelineIdx] : timeline[timeline.length - 1]

  const demand = useMemo(
    () => enrichDemandSegments(getDemandSegments(country, category)),
    [country, category],
  )

  const heatmapCells = useMemo(
    () => getMarketHeatmapCells(extended, currentTimeline).map((cell) => {
      const [lng, lat] = resolveEntityLngLat(cell, country)
      return { ...cell, lng, lat, lnglat: [lng, lat] }
    }),
    [extended, currentTimeline, country],
  )

  const availableLayerKeys = useMemo(
    () => geoPayload?.availableLayers || MAP_LAYERS.map((l) => l.key),
    [geoPayload],
  )

  const supplyMaterials = useMemo(
    () => getSupplyMaterials(country, category),
    [country, category],
  )

  const overviewStep = useMemo(() => {
    if (highlightSegment) return 3
    if (drillStack.length || drawerOpen) return 2
    if (timelineIdx >= 0 || playing) return 1
    return 0
  }, [highlightSegment, drillStack.length, drawerOpen, timelineIdx, playing])

  const heatmapLayers = useMemo(
    () => mapLayers.filter((key) => Object.keys(MAP_LAYER_META).includes(key)),
    [mapLayers],
  )

  const overview = useMemo(
    () => scaleOverviewByRegion(data.overview, regionFactor),
    [data.overview, regionFactor],
  )

  const trend = data.trend
  const importTop10 = useMemo(
    () => filterTradeByRegion(data.importTop10, selectedGeo?.name, regionFactor),
    [data.importTop10, selectedGeo?.name, regionFactor],
  )
  const exportTop10 = useMemo(
    () => filterTradeByRegion(data.exportTop10, selectedGeo?.name, regionFactor),
    [data.exportTop10, selectedGeo?.name, regionFactor],
  )
  const policies = data.policies
  const competition = data.competition

  const importChartData = importTop10.map((item) => ({ ...item, type: '进口' }))
  const exportChartData = exportTop10.map((item) => ({ ...item, type: '出口' }))
  const tradeTopData = [...importChartData, ...exportChartData]

  const timelineContext = useMemo(
    () => getTimelineContext(extended, currentTimeline),
    [extended, currentTimeline],
  )

  const preferenceHeatData = useMemo(() => {
    const matrix = demand.preferenceMatrix
    if (!matrix?.values) return []
    return matrix.values.flatMap((row, ri) =>
      row.map((v, ci) => ({
        priceBand: matrix.rows[ri],
        channel: matrix.cols[ci],
        share: v,
      })),
    )
  }, [demand.preferenceMatrix])

  const pieTypeData = (demand.byType || []).map((d) => ({ type: d.name, value: d.share }))
  const piePriceData = (demand.byPrice || []).map((d) => ({ type: d.name, value: d.share }))
  const piePowerData = (demand.byPower || []).map((d) => ({ type: d.name, value: d.share }))
  const pieChannelData = (demand.byChannel || []).map((d) => ({ type: d.name, value: d.share }))

  const growthPhaseColor = {
    加速增长: 'success',
    温和增长: 'processing',
    增速放缓: 'warning',
    收缩下行: 'error',
  }

  useEffect(() => () => { if (playTimer.current) clearInterval(playTimer.current) }, [])

  useEffect(() => {
    if (period === '10y') setTimelineIdx(syncTimelineIndex(period, timeline.length))
  }, [period, timeline.length])

  const resetGeo = () => {
    setDrillStack([])
    setSelectedGeo(null)
    setHighlightSegment(null)
    setHighlightCellIds([])
  }

  const handleCountryChange = (v) => {
    setCountry(v)
    resetGeo()
    syncMarketParams({ country: v })
  }

  const handleCategoryChange = (v) => {
    setCategory(v)
    setHighlightSegment(null)
    syncMarketParams({ category: v })
  }

  const handlePeriodChange = (p) => {
    setPeriod(p)
    syncMarketParams({ period: p })
    if (p === '10y') setTimelineIdx(timeline.length - 1)
    else if (p === '1y') setTimelineIdx(Math.max(0, timeline.length - 2))
    else setTimelineIdx(-1)
  }

  const openSnapshot = (entity, snapshot) => {
    const snap = enrichRegionSnapshot(snapshot || entity.snapshot, entity.name || entity.label)
    setSelectedGeo({ ...entity, snapshot: snap })
    setDrawerOpen(true)
  }

  const handleMarkerClick = (entity, currentLevel) => {
    const resolved = resolveGeoSelection(extended, entity, currentLevel)
    openSnapshot(resolved, entity.snapshot || resolved.snapshot)

    if (currentLevel === 'country') {
      setDrillStack([{ level: 'region', id: entity.id, name: entity.name }])
    } else if (currentLevel === 'region') {
      setDrillStack((s) => [...s, { level: 'city', id: entity.id, name: entity.name, parentId: entity.parentId || s[s.length - 1]?.id }])
    } else if (currentLevel === 'city') {
      setDrillStack((s) => [...s, { level: 'postal', id: entity.id, name: entity.name, parentId: entity.parentId }])
    }
  }

  const handleCellClick = (cell) => {
    const region = extended.regions?.find((r) => r.id === cell.id || cell.id?.startsWith(r.id))
    if (region) {
      handleMarkerClick(region, 'country')
      setHighlightCellIds([cell.id])
    } else {
      openSnapshot({ id: cell.id, name: cell.label, snapshot: { trade: cell.trade, gdp: cell.gdp } })
      setHighlightCellIds([cell.id])
    }
  }

  const handleDrillUp = () => {
    setDrillStack((s) => s.slice(0, -1))
    setSelectedGeo(null)
    setHighlightCellIds([])
  }

  const handleSegmentClick = (segmentName) => {
    setHighlightSegment(segmentName)
    const ids = matchSegmentToCells(segmentName, extended.heatmapCells || [])
    setHighlightCellIds(ids.length ? ids : (extended.heatmapCells || []).slice(0, 2).map((c) => c.id))
  }

  const handlePlayTimeline = () => {
    if (playing) {
      setPlaying(false)
      if (playTimer.current) clearInterval(playTimer.current)
      return
    }
    setPlaying(true)
    let idx = 0
    setTimelineIdx(0)
    playTimer.current = setInterval(() => {
      idx += 1
      if (idx >= timeline.length) {
        clearInterval(playTimer.current)
        setPlaying(false)
        return
      }
      setTimelineIdx(idx)
    }, 1200)
  }

  const breadcrumbItems = [
    { title: extended?.continent || '全球' },
    {
      title: drillStack.length
        ? <button type="button" className="market-breadcrumb-link" onClick={resetGeo}>{countryLabel}</button>
        : countryLabel,
    },
    ...drillStack.map((p) => ({ title: p.name })),
  ]

  const policyColumns = [
    { title: '政策名称', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '发布日期', dataIndex: 'date', key: 'date', width: 120 },
    { title: '影响', dataIndex: 'impact', key: 'impact', width: 80, render: (v) => <Tag color={impactColor[v]}>{v}</Tag> },
    { title: '摘要', dataIndex: 'summary', key: 'summary', ellipsis: true },
  ]

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    syncMarketParams({ tab })
  }

  const pieEvents = {
    onReady: ({ chart }) => {
      chart.on('element:click', (ev) => {
        const name = ev?.data?.data?.type
        if (name) handleSegmentClick(name)
      })
    },
  }

  const overviewTab = (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="市场概况展示 · 第一视角总控屏"
        description="同一界面观察：市场在哪里 · 规模有多大 · 增长加速还是放缓 · 结构是否在变 · 竞争格局是否在重塑"
      />

      <Steps
        size="small"
        current={overviewStep}
        style={{ marginBottom: 16 }}
        items={[
          { title: '选择市场', description: `${countryLabel} · ${PRODUCT_CATEGORIES.find((c) => c.value === category)?.label}` },
          { title: '空间—时间', description: '图层比对 / 时空回放' },
          { title: '层级穿透', description: '下钻区域 · 数据快照' },
          { title: '图表联动', description: '定位增长极与聚集区' },
          { title: '结构深化', description: '进入结构解构' },
        ]}
      />

      {selectedGeo && (
        <Alert
          type="info"
          showIcon
          closable
          onClose={resetGeo}
          style={{ marginBottom: 12 }}
          message={`区域联动：${selectedGeo.name || selectedGeo.label} · KPI 与贸易对比已按区域缩放`}
        />
      )}

      <div className="business-panel">
        <h3 className="business-panel-title">市场总控屏 · 关键指标</h3>
        <div className="business-stat-grid">
          <div className="business-stat-card"><div className="value">{overview.marketSize}</div><div className="label">市场规模（亿元）</div></div>
          <div className="business-stat-card"><div className="value">{overview.importGrowth}%</div><div className="label">进口增长率</div></div>
          <div className="business-stat-card"><div className="value">{overview.exportGrowth}%</div><div className="label">出口增长率</div></div>
          <div className="business-stat-card">
            <div className="value">{overview.volatility ?? '—'}%</div>
            <div className="label">波动幅度</div>
          </div>
          <div className="business-stat-card">
            <div className="value" style={{ fontSize: 18 }}>
              <Tag color={growthPhaseColor[overview.growthPhase] || 'default'}>{overview.growthPhase || '—'}</Tag>
            </div>
            <div className="label">增长态势</div>
          </div>
          <div className="business-stat-card"><div className="value">{overview.policyIndex}</div><div className="label">政策友好指数</div></div>
          <div className="business-stat-card"><div className="value">{overview.competitionIndex}</div><div className="label">竞争强度指数</div></div>
        </div>
      </div>

      <div className="business-panel market-fusion-dashboard">
        <h3 className="business-panel-title">（1）多维数据融合仪表盘</h3>
        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
          以空间—时间—层级三类能力构建可交互、可穿透、可联动的市场认知界面
        </Paragraph>

        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <Card size="small" title="1）地理信息可视化层" className="market-geo-section-card">
              <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
                政区底图上多图层同屏比对 · 支持 3D 地形与路径仿真 · 点击区域或热力区下钻
              </Paragraph>
              <MarketGeoLayerPanel
                mapLayers={mapLayers}
                onChange={setMapLayers}
                availableLayerKeys={availableLayerKeys}
              />
              <MarketGeoCanvas
                country={country}
                countryLabel={countryLabel}
                extended={extended}
                mapEntities={mapEntities}
                heatmapCells={heatmapCells}
                heatmapLayers={heatmapLayers}
                mapLayers={mapLayers}
                selectedId={selectedGeo?.id}
                highlightedCellIds={highlightCellIds}
                view3d={view3d}
                showPathSim={showPathSim}
                geoLoading={geoLoading}
                onToggle3d={() => setView3d((v) => !v)}
                onTogglePath={() => setShowPathSim((v) => !v)}
                onMarkerClick={handleMarkerClick}
                onCellClick={handleCellClick}
                onDrillUp={handleDrillUp}
                canDrillUp={drillStack.length > 0}
              />
              <div className="market-drill-strip">
                <Breadcrumb items={breadcrumbItems} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  3）层级下钻：{extended?.continent || '大洲'} → {countryLabel}
                  {drillStack.map((p) => ` → ${p.name}`).join('')}
                  {drillStack.length < 3 && ' → 城市 → 邮编区'}
                </Text>
              </div>
              {highlightSegment && (
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  图表联动：已高亮与「{highlightSegment}」相关的空间聚集区
                </Text>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card size="small" title="2）时空数据操控台" className="market-geo-section-card">
              {timelineContext && (
                <div className="market-timeline-card" style={{ marginBottom: 12 }}>
                  <Text strong>{timelineContext.year}</Text>
                  <div>市场规模：{timelineContext.marketSize} 亿元</div>
                  <div><Tag color="blue">价格指数 {timelineContext.priceIndex}</Tag> <Tag>{timelineContext.fxRate}</Tag></div>
                  <div style={{ marginTop: 4 }}><Tag color="purple">{timelineContext.policyTag}</Tag></div>
                  <Text type="secondary" style={{ display: 'block', marginTop: 6 }}>{timelineContext.event}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{timelineContext.diffusion}</Text>
                </div>
              )}
              <Slider
                min={0}
                max={Math.max(0, timeline.length - 1)}
                value={timelineIdx >= 0 ? timelineIdx : timeline.length - 1}
                onChange={setTimelineIdx}
                marks={timeline.reduce((acc, t, i) => ({ ...acc, [i]: t.label }), {})}
              />
              <Button block icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />} onClick={handlePlayTimeline}>
                {playing ? '暂停回放' : '时空回放（近10年）'}
              </Button>
              <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                结合价格指数、汇率与政策事件识别拐点与扩散路径（如核心城市向周边扩散）
              </Text>
            </Card>
            <Card size="small" title="关键变化节点回溯" style={{ marginTop: 12 }} className="market-geo-section-card">
              <Timeline
                items={(extended?.keyEvents || []).map((e) => ({
                  color: e.impact === '高' ? 'red' : 'blue',
                  children: (
                    <div>
                      <Text strong>{e.title}</Text>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>{e.date} · {e.type === 'policy' ? '政策转向' : e.type === 'shock' ? '价格/供应链冲击' : '结构变化'}</div>
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">市场规模趋势 · {getTrendXLabel(period)}</h3>
            <div className="business-chart-box">
              <Line data={trend} xField="month" yField="value" height={280} color="#B32620" smooth point={{ size: 4 }} />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">进出口 TOP10 对比{selectedGeo?.name ? ` · ${selectedGeo.name}` : ''}</h3>
            <div className="business-chart-box">
              <Column data={tradeTopData} xField="country" yField="value" seriesField="type" height={280} isGroup color={['#B32620', '#D44A44']} />
            </div>
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">细分品类需求结构 · 消费升级路径（点击联动地图）</h3>
        <Row gutter={[16, 16]}>
          {pieTypeData.length > 0 && (
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">按品类/车型</Text>
              <div className="business-chart-box-sm">
                <Pie data={pieTypeData} angleField="value" colorField="type" radius={0.75} height={160} label={{ type: 'outer', content: '{name} {percentage}' }} {...pieEvents} />
              </div>
            </Col>
          )}
          {piePriceData.length > 0 && (
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">价格带迁移</Text>
              <div className="business-chart-box-sm">
                <Pie data={piePriceData} angleField="value" colorField="type" radius={0.75} height={160} color={['#722ed1', '#B32620', '#8c8c8c']} {...pieEvents} />
              </div>
            </Col>
          )}
          {piePowerData.length > 0 && (
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">技术路线替代</Text>
              <div className="business-chart-box-sm">
                <Pie data={piePowerData} angleField="value" colorField="type" radius={0.75} height={160} color={['#8c8c8c', '#faad14', '#52c41a']} {...pieEvents} />
              </div>
            </Col>
          )}
          {pieChannelData.length > 0 && (
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">渠道转移</Text>
              <div className="business-chart-box-sm">
                <Pie data={pieChannelData} angleField="value" colorField="type" radius={0.75} height={160} {...pieEvents} />
              </div>
            </Col>
          )}
        </Row>
        {(demand.byType || []).length > 0 && (
          <Table
            size="small"
            pagination={false}
            rowKey="name"
            style={{ marginTop: 12 }}
            dataSource={demand.byType}
            onRow={(row) => ({ onClick: () => handleSegmentClick(row.name), style: { cursor: 'pointer' } })}
            columns={[
              { title: '细分', dataIndex: 'name', key: 'name' },
              { title: '份额%', dataIndex: 'share', key: 'share' },
              { title: '增速%', dataIndex: 'growth', key: 'growth', render: (v) => <Tag color={v >= 0 ? 'success' : 'error'}>{v > 0 ? '+' : ''}{v}%</Tag> },
            ]}
          />
        )}
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">消费者偏好转移矩阵 · 价格带 × 渠道</h3>
            {preferenceHeatData.length > 0 ? (
              <div className="business-chart-box-sm">
                <Heatmap
                  data={preferenceHeatData}
                  xField="channel"
                  yField="priceBand"
                  colorField="share"
                  height={220}
                  label={{ style: { fill: '#fff', fontSize: 12 } }}
                />
              </div>
            ) : (
              <Text type="secondary">暂无矩阵数据</Text>
            )}
            <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
              {(demand.insights || []).map((i) => <Tag key={i}>{i}</Tag>)}
            </Paragraph>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <div className="business-panel-title-row">
              <h3 className="business-panel-title">竞争格局 · 主要竞争者份额</h3>
              <Button type="link" size="small" onClick={() => handleTabChange('competition')}>竞争态势分析 →</Button>
            </div>
            <Table rowKey="name" size="small" pagination={false} dataSource={competition} columns={[
              { title: '竞争者', dataIndex: 'name', key: 'name' },
              { title: '份额', dataIndex: 'share', key: 'share', width: 80 },
              { title: '优势', dataIndex: 'strength', key: 'strength', ellipsis: true },
            ]} />
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <div className="business-panel-title-row">
              <h3 className="business-panel-title">政策法规环境</h3>
              <Button type="link" size="small" onClick={() => handleTabChange('policy')}>深度解读 →</Button>
            </div>
            <Table rowKey="title" size="small" columns={policyColumns} dataSource={policies} pagination={false} />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">机会窗口速览</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Card size="small"><Text strong>增长极</Text><div><Tag color="success">{(demand.byType || []).filter((d) => d.growth > 5).map((d) => d.name).join('、') || '—'}</Tag></div></Card>
              <Card size="small"><Text strong>竞争压力</Text><div>{competition.slice(0, 2).map((c) => <Tag key={c.name} color="warning">{c.name} {c.share}</Tag>)}</div></Card>
              <Card size="small"><Text strong>政策窗口</Text><div>{policies.filter((p) => p.impact === '低').slice(0, 1).map((p) => <Tag key={p.title} color="processing">{p.title}</Tag>)}</div></Card>
            </Space>
          </div>
        </Col>
      </Row>

      <div className="business-panel market-overview-cta">
        <Space>
          <Button type="primary" onClick={() => handleTabChange('structure')}>进入（2）市场结构解构分析 →</Button>
          <Text type="secondary">在概况建立全局认知后，深化需求侧拆解与供给侧/价值链分析</Text>
        </Space>
      </div>
    </>
  )

  const structureTab = (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="（2）市场结构解构分析"
        description="在概况总控屏建立全局认知后，回答：市场为什么这样 · 增长来自哪里 · 结构在怎么变"
      />

      {selectedGeo && (
        <Alert
          type="warning"
          showIcon
          closable
          onClose={resetGeo}
          style={{ marginBottom: 12 }}
          message={`延续区域联动：${selectedGeo.name} · 需求与供给分析已带入该区域上下文`}
        />
      )}

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">1）需求侧深度剖析 · 结构拆解</h3>
            <Row gutter={[16, 16]}>
              {pieTypeData.length > 0 && (
                <Col xs={24} sm={12}>
                  <Text type="secondary">按车型/品类 · 点击联动地图</Text>
                  <div className="business-chart-box-sm">
                    <Pie data={pieTypeData} angleField="value" colorField="type" radius={0.8} height={200} label={{ type: 'outer' }} {...pieEvents} />
                  </div>
                </Col>
              )}
              {piePriceData.length > 0 && (
                <Col xs={24} sm={12}>
                  <Text type="secondary">按价格带</Text>
                  <div className="business-chart-box-sm">
                    <Pie data={piePriceData} angleField="value" colorField="type" radius={0.8} height={200} color={['#722ed1', '#B32620', '#8c8c8c']} {...pieEvents} />
                  </div>
                </Col>
              )}
              {piePowerData.length > 0 && (
                <Col xs={24} sm={12}>
                  <Text type="secondary">按动力类型</Text>
                  <div className="business-chart-box-sm">
                    <Pie data={piePowerData} angleField="value" colorField="type" radius={0.8} height={200} color={['#8c8c8c', '#faad14', '#52c41a']} {...pieEvents} />
                  </div>
                </Col>
              )}
              {pieChannelData.length > 0 && (
                <Col xs={24} sm={12}>
                  <Text type="secondary">按销售渠道</Text>
                  <div className="business-chart-box-sm">
                    <Pie data={pieChannelData} angleField="value" colorField="type" radius={0.8} height={200} {...pieEvents} />
                  </div>
                </Col>
              )}
            </Row>
            {(demand.byType || []).length > 0 && (
              <Table
                size="small"
                pagination={false}
                rowKey="name"
                style={{ marginTop: 12 }}
                dataSource={demand.byType}
                onRow={(row) => ({ onClick: () => handleSegmentClick(row.name), style: { cursor: 'pointer' } })}
                columns={[
                  { title: '细分', dataIndex: 'name', key: 'name' },
                  { title: '份额%', dataIndex: 'share', key: 'share' },
                  { title: '增速%', dataIndex: 'growth', key: 'growth', render: (v) => <Tag color={v >= 0 ? 'success' : 'error'}>{v > 0 ? '+' : ''}{v}%</Tag> },
                ]}
              />
            )}
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">消费者偏好 · 情感分析（GlobalData / Euromonitor / 社媒）</h3>
            {(demand.sentiment || []).map((s) => (
              <div key={s.topic} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>{s.topic}</Text>
                  <Tag>{s.trend}</Tag>
                </div>
                <Progress percent={s.score} size="small" strokeColor="#B32620" />
                <Text type="secondary" style={{ fontSize: 12 }}>来源：{s.source}</Text>
              </div>
            ))}
            <Paragraph style={{ marginTop: 8 }}>
              <Text strong>洞察：</Text>
              {(demand.insights || []).map((i) => <Tag key={i}>{i}</Tag>)}
            </Paragraph>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">2）供给侧与本土生产</h3>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="本土生产">{extended?.supply?.localProduction}</Descriptions.Item>
              <Descriptions.Item label="产能利用">{extended?.supply?.capacity}</Descriptions.Item>
              <Descriptions.Item label="进口依赖">{extended?.supply?.importDependency}</Descriptions.Item>
            </Descriptions>
            <Table
              size="small"
              pagination={false}
              rowKey="name"
              style={{ marginTop: 12 }}
              dataSource={extended?.supply?.producers || []}
              columns={[
                { title: '生产商', dataIndex: 'name', key: 'name' },
                { title: '份额', dataIndex: 'share', key: 'share', width: 80 },
                { title: '产能', dataIndex: 'capacity', key: 'capacity', width: 70 },
              ]}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">渠道结构明细</h3>
            <Table
              size="small"
              pagination={false}
              rowKey="name"
              dataSource={demand.byChannel}
              columns={[
                { title: '渠道', dataIndex: 'name', key: 'name' },
                { title: '份额%', dataIndex: 'share', key: 'share' },
                { title: '增速%', dataIndex: 'growth', key: 'growth', render: (v) => <Tag color={v >= 0 ? 'success' : 'error'}>{v > 0 ? '+' : ''}{v}%</Tag> },
              ]}
            />
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">价值链/供应链地图 · 利润池与进入模式</h3>
        <ValueChainMap
          chain={VALUE_CHAIN_ENRICH(extended?.valueChain || [])}
          materials={supplyMaterials}
        />
      </div>
    </>
  )

  const snapshot = selectedGeo?.snapshot

  return (
    <div className="business-page">
      <div className="business-page-header">
        <div>
          <h1 className="page-title">市场分析</h1>
          <p className="page-description">战略作战室 · 概况 → 结构 → 预测 → 竞争 → 政策 · 空间-时间-层级多维闭环</p>
        </div>
      </div>

      <AnalysisWorkflowBar
        active="market"
        context={{
          country,
          q: category === 'electronics' ? '电子产品' : category === 'machinery' ? '机械设备' : category === 'agri' ? '农产品' : '汽车配件',
          hs: searchParams.get('hs') || undefined,
          tab: activeTab,
        }}
      />

      <div className="business-filter-bar">
        <Space wrap>
          <Text>目标市场</Text>
          <Select
            value={country}
            style={{ width: 140 }}
            options={countryOptions}
            onChange={handleCountryChange}
          />
          <Text>时间粒度</Text>
          <Select value={period} style={{ width: 120 }} options={TIME_PERIODS} onChange={handlePeriodChange} />
          <Text>分析品类</Text>
          <Select value={category} style={{ width: 120 }} options={PRODUCT_CATEGORIES} onChange={handleCategoryChange} />
        </Space>
        <Space wrap>
          <Button type="link" onClick={() => handleTabChange('structure')}>结构解构</Button>
          <Button type="link" onClick={() => handleTabChange('forecast')}>需求预测</Button>
          <Button type="link" onClick={() => handleTabChange('competition')}>竞争态势</Button>
          <Button type="link" onClick={() => handleTabChange('policy')}>政策法规</Button>
          <Button
            type="link"
            onClick={() => {
              const hs = category === 'electronics' ? '8517' : category === 'machinery' ? '8479' : category === 'agri' ? '8708' : '8708'
              const q = category === 'electronics' ? '电子产品' : category === 'machinery' ? '机械设备' : '汽车配件'
              navigate(`/analysis/product?q=${encodeURIComponent(q)}&hs=${hs}&tab=query`)
            }}
          >
            商品分析 →
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          { key: 'overview', label: <span><GlobalOutlined /> 市场概况展示</span>, children: overviewTab },
          { key: 'structure', label: <span><NodeIndexOutlined /> 市场结构解构</span>, children: structureTab },
          { key: 'forecast', label: <span><LineChartOutlined /> 需求预测分析</span>, children: <ForecastTab country={country} countryLabel={countryLabel} category={category} onGoCompetition={() => handleTabChange('competition')} /> },
          { key: 'competition', label: <span><TeamOutlined /> 竞争态势分析</span>, children: <CompetitionTab country={country} category={category} onCategoryChange={handleCategoryChange} onGoPolicy={() => setActiveTab('policy')} /> },
          { key: 'policy', label: <span><FileProtectOutlined /> 政策法规解读</span>, children: <PolicyTab country={country} initialHs={searchParams.get('hs') || undefined} /> },
        ]}
      />

      <Drawer
        title={`区域数据快照 · ${selectedGeo?.name || selectedGeo?.label || ''}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={440}
      >
        <MarketSnapshotDrawer
          selectedGeo={selectedGeo}
          snapshot={snapshot}
          onClose={() => setDrawerOpen(false)}
          onGoStructure={() => handleTabChange('structure')}
          onGoForecast={() => handleTabChange('forecast')}
          onGoCompetition={() => handleTabChange('competition')}
        />
      </Drawer>
    </div>
  )
}
