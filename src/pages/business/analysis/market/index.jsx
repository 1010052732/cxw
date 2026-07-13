import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../auth/AuthContext'
import { ANALYSIS_SCOPE_FIELDS } from '../../../../constants/dataScope'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Drawer,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Column, Line, Pie } from '@ant-design/charts'
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
import ForecastTab from './ForecastTab'
import CompetitionTab from './CompetitionTab'
import PolicyTab from './PolicyTab'
import MarketGeoCanvas from './MarketGeoCanvas'
import ValueChainMap from './ValueChainMap'
import {
  enrichDemandSegments,
  enrichMarketExtended,
  filterTradeByRegion,
  getDrillLevel,
  getMapEntities,
  getRegionFactor,
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

const SUPPLY_MATERIALS = [
  { name: '钢铁/铝材', origin: '本地+进口', stability: '中' },
  { name: '芯片/电控', origin: '进口依赖', stability: '低' },
  { name: '精密轴承', origin: '德日供应', stability: '中' },
]

export default function AnalysisMarketPage() {
  const navigate = useNavigate()
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

  const [country, setCountry] = useState(() => countryOptions[0]?.value || 'germany')
  const [period, setPeriod] = useState('6m')
  const [mapLayers, setMapLayers] = useState(MAP_LAYERS.filter((l) => l.default).map((l) => l.key))
  const [timelineIdx, setTimelineIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const playTimer = useRef(null)
  const [category, setCategory] = useState('vehicle')
  const [drillStack, setDrillStack] = useState([])
  const [selectedGeo, setSelectedGeo] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [highlightSegment, setHighlightSegment] = useState(null)
  const [highlightCellIds, setHighlightCellIds] = useState([])
  const [view3d, setView3d] = useState(false)
  const [showPathSim, setShowPathSim] = useState(false)

  const data = useMemo(() => getMarketData(country, period), [country, period])
  const extended = useMemo(() => enrichMarketExtended(data.extended), [data.extended])
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
    () => getMarketHeatmapCells(extended, currentTimeline),
    [extended, currentTimeline],
  )

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

  const pieTypeData = (demand.byType || []).map((d) => ({ type: d.name, value: d.share }))
  const piePriceData = (demand.byPrice || []).map((d) => ({ type: d.name, value: d.share }))
  const piePowerData = (demand.byPower || []).map((d) => ({ type: d.name, value: d.share }))
  const pieChannelData = (demand.byChannel || []).map((d) => ({ type: d.name, value: d.share }))

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

  const openSnapshot = (entity, snapshot) => {
    setSelectedGeo(entity)
    setDrawerOpen(true)
    if (snapshot) setSelectedGeo((prev) => ({ ...prev, snapshot }))
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

  const handlePeriodChange = (p) => {
    setPeriod(p)
    if (p === '10y') setTimelineIdx(timeline.length - 1)
    else if (p === '1y') setTimelineIdx(Math.max(0, timeline.length - 2))
    else setTimelineIdx(-1)
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
      {selectedGeo && (
        <Alert
          type="info"
          showIcon
          closable
          onClose={resetGeo}
          style={{ marginBottom: 12 }}
          message={`已联动区域：${selectedGeo.name || selectedGeo.label} · 图表与 KPI 已按区域缩放`}
        />
      )}

      <div className="business-panel">
        <h3 className="business-panel-title">市场总控屏 · 关键指标</h3>
        <div className="business-stat-grid">
          <div className="business-stat-card"><div className="value">{overview.marketSize}</div><div className="label">市场规模（亿元）</div></div>
          <div className="business-stat-card"><div className="value">{overview.importGrowth}%</div><div className="label">进口增长率</div></div>
          <div className="business-stat-card"><div className="value">{overview.exportGrowth}%</div><div className="label">出口增长率</div></div>
          <div className="business-stat-card"><div className="value">{overview.policyIndex}</div><div className="label">政策友好指数</div></div>
          <div className="business-stat-card"><div className="value">{overview.competitionIndex}</div><div className="label">竞争强度指数</div></div>
        </div>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <div className="business-panel">
            <div className="market-geo-header">
              <h3 className="business-panel-title">地理信息可视化 · 多图层同屏</h3>
              <Checkbox.Group
                options={MAP_LAYERS.map((l) => ({ value: l.key, label: l.label }))}
                value={mapLayers}
                onChange={setMapLayers}
              />
            </div>
            <MarketGeoCanvas
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
              onToggle3d={() => setView3d((v) => !v)}
              onTogglePath={() => setShowPathSim((v) => !v)}
              onMarkerClick={handleMarkerClick}
              onCellClick={handleCellClick}
              onDrillUp={handleDrillUp}
              canDrillUp={drillStack.length > 0}
            />
            <Breadcrumb style={{ marginTop: 12 }} items={breadcrumbItems} />
            {highlightSegment && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                图表联动：已高亮与「{highlightSegment}」相关的空间聚集区
              </Text>
            )}
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title">时空数据操控台</h3>
            {currentTimeline && (
              <Card size="small" style={{ marginBottom: 12 }}>
                <Text strong>{currentTimeline.label}</Text>
                <div>市场规模：{currentTimeline.value} 亿元</div>
                <Text type="secondary">{currentTimeline.event}</Text>
              </Card>
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
              时间粒度「{TIME_PERIODS.find((p) => p.value === period)?.label}」与回放联动 · 识别拐点与扩散路径
            </Text>
          </div>
          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">关键变化节点</h3>
            <Timeline
              items={(extended?.keyEvents || []).map((e) => ({
                color: e.impact === '高' ? 'red' : 'blue',
                children: <div><Text strong>{e.title}</Text><div style={{ fontSize: 12, color: '#8c8c8c' }}>{e.date}</div></div>,
              }))}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">市场规模趋势 · {getTrendXLabel(period)}</h3>
            <div className="business-chart-box">
              <Line data={trend} xField="month" yField="value" height={300} color="#B32620" smooth point={{ size: 4 }} />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">进出口 TOP10 对比{selectedGeo?.name ? ` · ${selectedGeo.name}` : ''}</h3>
            <div className="business-chart-box">
              <Column data={tradeTopData} xField="country" yField="value" seriesField="type" height={300} isGroup color={['#B32620', '#D44A44']} />
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <div className="business-panel-title-row">
              <h3 className="business-panel-title">政策法规环境</h3>
              <Button type="link" size="small" onClick={() => setActiveTab('policy')}>深度解读 →</Button>
            </div>
            <Table rowKey="title" size="small" columns={policyColumns} dataSource={policies} pagination={false} />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <div className="business-panel-title-row">
              <h3 className="business-panel-title">竞争格局 · 消费者偏好转移</h3>
              <Button type="link" size="small" onClick={() => setActiveTab('competition')}>竞争态势分析 →</Button>
            </div>
            <Table rowKey="name" size="small" pagination={false} dataSource={competition} columns={[
              { title: '竞争者', dataIndex: 'name', key: 'name' },
              { title: '份额', dataIndex: 'share', key: 'share', width: 80 },
              { title: '优势', dataIndex: 'strength', key: 'strength', ellipsis: true },
            ]} />
            <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
              {(demand.insights || []).map((i) => <Tag key={i}>{i}</Tag>)}
            </Paragraph>
          </div>
        </Col>
      </Row>
    </>
  )

  const structureTab = (
    <>
      <div className="business-filter-bar">
        <Space wrap>
          <Text>分析品类</Text>
          <Select value={category} style={{ width: 140 }} options={PRODUCT_CATEGORIES} onChange={(v) => { setCategory(v); setHighlightSegment(null) }} />
          {selectedGeo && <Tag closable onClose={resetGeo}>区域联动：{selectedGeo.name}</Tag>}
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">需求侧深度剖析 · 结构拆解</h3>
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
            <h3 className="business-panel-title">消费者偏好 · 情感分析</h3>
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
            <h3 className="business-panel-title">供给侧与本土生产</h3>
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
        <h3 className="business-panel-title">价值链/供应链地图 · 交互穿透</h3>
        <ValueChainMap
          chain={VALUE_CHAIN_ENRICH(extended?.valueChain || [])}
          materials={SUPPLY_MATERIALS}
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

      <div className="business-filter-bar">
        <Space wrap>
          <Text>目标市场</Text>
          <Select
            value={country}
            style={{ width: 140 }}
            options={countryOptions}
            onChange={(v) => { setCountry(v); resetGeo() }}
          />
          <Text>时间粒度</Text>
          <Select value={period} style={{ width: 120 }} options={TIME_PERIODS} onChange={handlePeriodChange} />
          <Text>分析品类</Text>
          <Select value={category} style={{ width: 120 }} options={PRODUCT_CATEGORIES} onChange={setCategory} />
        </Space>
        <Space wrap>
          <Button type="link" onClick={() => setActiveTab('structure')}>结构解构</Button>
          <Button type="link" onClick={() => setActiveTab('forecast')}>需求预测</Button>
          <Button type="link" onClick={() => setActiveTab('competition')}>竞争态势</Button>
          <Button type="link" onClick={() => setActiveTab('policy')}>政策法规</Button>
          <Button type="link" onClick={() => navigate('/analysis/product')}>商品分析 →</Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'overview', label: <span><GlobalOutlined /> 市场概况展示</span>, children: overviewTab },
          { key: 'structure', label: <span><NodeIndexOutlined /> 市场结构解构</span>, children: structureTab },
          { key: 'forecast', label: <span><LineChartOutlined /> 需求预测分析</span>, children: <ForecastTab country={country} category={category} onCategoryChange={setCategory} onGoCompetition={() => setActiveTab('competition')} /> },
          { key: 'competition', label: <span><TeamOutlined /> 竞争态势分析</span>, children: <CompetitionTab country={country} category={category} onCategoryChange={setCategory} onGoPolicy={() => setActiveTab('policy')} /> },
          { key: 'policy', label: <span><FileProtectOutlined /> 政策法规解读</span>, children: <PolicyTab country={country} /> },
        ]}
      />

      <Drawer
        title={`区域数据快照 · ${selectedGeo?.name || selectedGeo?.label || ''}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        {snapshot && (
          <Descriptions bordered column={1} size="small">
            {snapshot.gdp && <Descriptions.Item label="GDP">{snapshot.gdp}</Descriptions.Item>}
            {snapshot.population && <Descriptions.Item label="人口">{snapshot.population}</Descriptions.Item>}
            {snapshot.import && <Descriptions.Item label="进口额">{snapshot.import}</Descriptions.Item>}
            {snapshot.export && <Descriptions.Item label="出口额">{snapshot.export}</Descriptions.Item>}
            {snapshot.lpi && <Descriptions.Item label="物流绩效(LPI)">{snapshot.lpi}</Descriptions.Item>}
            {snapshot.business && <Descriptions.Item label="营商环境">{snapshot.business}</Descriptions.Item>}
            {snapshot.urbanization && <Descriptions.Item label="城市化率">{snapshot.urbanization}</Descriptions.Item>}
            {snapshot.incomeLevel && <Descriptions.Item label="收入层级">{snapshot.incomeLevel}</Descriptions.Item>}
            {snapshot.density && <Descriptions.Item label="密度">{snapshot.density}</Descriptions.Item>}
            {snapshot.retailIndex && <Descriptions.Item label="零售指数">{snapshot.retailIndex}</Descriptions.Item>}
          </Descriptions>
        )}
        <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
          <Button block onClick={() => { setActiveTab('structure'); setDrawerOpen(false) }}>市场结构解构</Button>
          <Button block onClick={() => { setActiveTab('forecast'); setDrawerOpen(false) }}>需求预测分析</Button>
          <Button type="primary" block onClick={() => { setActiveTab('competition'); setDrawerOpen(false) }}>竞争态势分析</Button>
        </Space>
      </Drawer>
    </div>
  )
}
