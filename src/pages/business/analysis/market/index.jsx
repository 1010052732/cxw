import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../auth/AuthContext'
import { ANALYSIS_SCOPE_FIELDS } from '../../../../constants/dataScope'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Drawer,
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
import { Column, Line, Pie } from '@ant-design/charts'
import {
  EnvironmentOutlined,
  FileProtectOutlined,
  GlobalOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import MapHeatmapOverlay from '../../../../components/MapHeatmapOverlay'
import { MAP_LAYER_META } from '../../../../utils/mapHeatmap'
import ForecastTab from './ForecastTab'
import CompetitionTab from './CompetitionTab'
import PolicyTab from './PolicyTab'
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
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [category, setCategory] = useState('vehicle')
  const [drillPath, setDrillPath] = useState([])

  const data = useMemo(() => getMarketData(country, period), [country, period])
  const { overview, trend, importTop10, exportTop10, policies, competition, extended } = data
  const countryLabel = MARKET_COUNTRIES.find((c) => c.value === country)?.label || country

  const timeline = extended?.timeline || []
  const currentTimeline = timelineIdx >= 0 ? timeline[timelineIdx] : timeline[timeline.length - 1]

  const demand = useMemo(() => getDemandSegments(country, category), [country, category])

  const heatmapCells = useMemo(
    () => getMarketHeatmapCells(extended, currentTimeline),
    [extended, currentTimeline],
  )

  const heatmapLayers = useMemo(
    () => mapLayers.filter((key) => ['trade', 'gdp', 'risk', 'climate', 'infra', 'industry'].includes(key)),
    [mapLayers],
  )

  const importChartData = importTop10.map((item) => ({ ...item, type: '进口' }))
  const exportChartData = exportTop10.map((item) => ({ ...item, type: '出口' }))
  const tradeTopData = [...importChartData, ...exportChartData]

  const pieTypeData = (demand.byType || []).map((d) => ({ type: d.name, value: d.share }))
  const piePowerData = (demand.byPower || []).map((d) => ({ type: d.name, value: d.share }))

  const handleRegionClick = (region) => {
    setSelectedRegion(region)
    setDrillPath([{ name: countryLabel, level: 'country' }, { name: region.name, level: 'region' }])
    setDrawerOpen(true)
  }

  const handlePlayTimeline = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    setPlaying(true)
    let idx = 0
    setTimelineIdx(0)
    const timer = setInterval(() => {
      idx += 1
      if (idx >= timeline.length) {
        clearInterval(timer)
        setPlaying(false)
        return
      }
      setTimelineIdx(idx)
    }, 1200)
  }

  const policyColumns = [
    { title: '政策名称', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '发布日期', dataIndex: 'date', key: 'date', width: 120 },
    { title: '影响', dataIndex: 'impact', key: 'impact', width: 80, render: (v) => <Tag color={impactColor[v]}>{v}</Tag> },
    { title: '摘要', dataIndex: 'summary', key: 'summary', ellipsis: true },
  ]

  const overviewTab = (
    <>
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
          <div className="business-panel market-map-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>地理信息可视化 · 多图层同屏</h3>
              <Checkbox.Group
                options={MAP_LAYERS.map((l) => ({ value: l.key, label: l.label }))}
                value={mapLayers}
                onChange={setMapLayers}
              />
            </div>
            <div className="market-map-canvas">
              <GlobalOutlined className="market-map-bg-icon" />
              <MapHeatmapOverlay
                cells={heatmapCells}
                activeLayers={heatmapLayers}
                className="market-map-heatmap"
              />
              {mapLayers.includes('infra') && (
                <div className="market-map-badge infra">
                  <NodeIndexOutlined /> 港口·铁路·机场节点
                </div>
              )}
              {mapLayers.includes('industry') && (
                <div className="market-map-badge industry">
                  <TeamOutlined /> 制造业集群区
                </div>
              )}
              {(extended?.regions || []).map((r) => (
                <div
                  key={r.id}
                  className={`market-map-region ${selectedRegion?.id === r.id ? 'active' : ''}`}
                  style={{ left: `${r.x}%`, top: `${r.y}%` }}
                  onClick={() => handleRegionClick(r)}
                  title={r.name}
                >
                  <EnvironmentOutlined />
                </div>
              ))}
              <div className="market-map-center" style={{ left: `${extended?.mapCenter?.x || 50}%`, top: `${extended?.mapCenter?.y || 50}%` }}>
                {countryLabel}
              </div>
            </div>
            <div className="map-heatmap-legend">
              {heatmapLayers.map((key) => (
                <Tag key={key} color={MAP_LAYER_META[key]?.color || '#B32620'}>{MAP_LAYER_META[key]?.label || key}</Tag>
              ))}
              {heatmapLayers.length > 1 && <Text type="secondary">多图层叠加显示 · 颜色越深强度越高</Text>}
              {currentTimeline && <Text type="secondary">· 时空节点：{currentTimeline.label}</Text>}
            </div>
            <Breadcrumb style={{ marginTop: 12 }} items={[
              { title: extended?.continent || '全球' },
              { title: countryLabel },
              ...(drillPath.slice(1).map((p) => ({ title: p.name }))),
            ]} />
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
            <h3 className="business-panel-title">市场规模趋势</h3>
            <div className="business-chart-box">
              <Line data={trend} xField="month" yField="value" height={300} color="#B32620" smooth point={{ size: 4 }} />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">进出口 TOP10 对比</h3>
            <div className="business-chart-box">
              <Column data={tradeTopData} xField="country" yField="value" seriesField="type" height={300} isGroup color={['#B32620', '#D44A44']} />
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>政策法规环境</h3>
              <Button type="link" size="small" onClick={() => setActiveTab('policy')}>深度解读 →</Button>
            </div>
            <Table rowKey="title" size="small" columns={policyColumns} dataSource={policies} pagination={false} />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>竞争格局</h3>
              <Button type="link" size="small" onClick={() => setActiveTab('competition')}>竞争态势分析 →</Button>
            </div>
            <Table rowKey="name" size="small" pagination={false} dataSource={competition} columns={[
              { title: '竞争者', dataIndex: 'name', key: 'name' },
              { title: '份额', dataIndex: 'share', key: 'share', width: 80 },
              { title: '优势', dataIndex: 'strength', key: 'strength', ellipsis: true },
            ]} />
          </div>
        </Col>
      </Row>
    </>
  )

  const structureTab = (
    <>
      <div className="business-filter-bar">
        <Space>
          <Text>分析品类</Text>
          <Select value={category} style={{ width: 140 }} options={PRODUCT_CATEGORIES} onChange={setCategory} />
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">需求侧深度剖析 · 结构拆解</h3>
            <Row gutter={16}>
              {pieTypeData.length > 0 && (
                <Col span={12}>
                  <Text type="secondary">按车型/品类</Text>
                  <div className="business-chart-box-sm">
                    <Pie data={pieTypeData} angleField="value" colorField="type" radius={0.8} height={220} label={{ type: 'outer' }} />
                  </div>
                </Col>
              )}
              {piePowerData.length > 0 && (
                <Col span={12}>
                  <Text type="secondary">按动力类型</Text>
                  <div className="business-chart-box-sm">
                    <Pie data={piePowerData} angleField="value" colorField="type" radius={0.8} height={220} color={['#8c8c8c', '#faad14', '#52c41a']} />
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
                columns={[
                  { title: '细分', dataIndex: 'name', key: 'name' },
                  { title: '份额%', dataIndex: 'share', key: 'share' },
                  { title: '增速%', dataIndex: 'growth', key: 'growth', render: (v) => <Tag color={v >= 0 ? 'success' : 'error'}>{v > 0 ? '+' : ''}{v}%</Tag> },
                ]}
              />
            )}
            <Paragraph style={{ marginTop: 12 }}>
              <Text strong>消费洞察：</Text>
              {(demand.insights || []).map((i) => <Tag key={i} style={{ marginBottom: 4 }}>{i}</Tag>)}
            </Paragraph>
          </div>
        </Col>
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
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">价值链/供应链地图</h3>
        <Steps
          current={-1}
          items={(extended?.valueChain || []).map((v) => ({
            title: v.stage,
            description: `${v.players} · 利润池 ${v.margin} · 风险 ${v.risk}`,
          }))}
        />
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          通过价值链分析识别利润池分布、关键节点与进入模式建议（直接出口 / 本地代理 / 合资 / 设厂）。
        </Paragraph>
      </div>
    </>
  )

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">市场分析</h1>
        <p className="page-description">战略作战室 · 概况 → 结构 → 预测 → 竞争 → 政策 · 五维闭环分析</p>
      </div>

      <div className="business-filter-bar">
        <Space wrap>
          <Text>目标市场</Text>
          <Select value={country} style={{ width: 140 }} options={countryOptions} onChange={(v) => { setCountry(v); setSelectedRegion(null); setDrillPath([]) }} />
          <Text>时间粒度</Text>
          <Select value={period} style={{ width: 120 }} options={TIME_PERIODS} onChange={setPeriod} />
        </Space>
        <Space>
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

      <Drawer title={`区域数据快照 · ${selectedRegion?.name || ''}`} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={400}>
        {selectedRegion?.snapshot && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="GDP">{selectedRegion.snapshot.gdp}</Descriptions.Item>
            <Descriptions.Item label="人口">{selectedRegion.snapshot.population}</Descriptions.Item>
            <Descriptions.Item label="进口额">{selectedRegion.snapshot.import}</Descriptions.Item>
            <Descriptions.Item label="出口额">{selectedRegion.snapshot.export}</Descriptions.Item>
            <Descriptions.Item label="物流绩效(LPI)">{selectedRegion.snapshot.lpi}</Descriptions.Item>
            <Descriptions.Item label="营商环境">{selectedRegion.snapshot.business}</Descriptions.Item>
          </Descriptions>
        )}
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block onClick={() => { setActiveTab('structure'); setDrawerOpen(false) }}>市场结构解构</Button>
          <Button block onClick={() => { setActiveTab('forecast'); setDrawerOpen(false) }}>需求预测分析</Button>
          <Button type="primary" block onClick={() => { setActiveTab('competition'); setDrawerOpen(false) }}>竞争态势分析</Button>
        </Space>
      </Drawer>
    </div>
  )
}
