import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import { Area, Line } from '@ant-design/charts'
import {
  ApiOutlined,
  CloudDownloadOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  FORECAST_HORIZONS,
  FORECAST_MODELS,
  LEADING_INDICATORS,
  PRODUCT_CATEGORIES,
  SCENARIO_PRESETS,
  SHOCK_EVENTS,
  applyScenarioForecast,
  buildMonteCarloFan,
  getForecastData,
} from '../../../../mock/analysis'

const { Text, Paragraph } = Typography

export default function ForecastTab({ country, category, onCategoryChange, onGoCompetition }) {
  const { message } = App.useApp()
  const [horizon, setHorizon] = useState(1)
  const [models, setModels] = useState(FORECAST_MODELS)
  const [shocks, setShocks] = useState(SHOCK_EVENTS)
  const [activeScenario, setActiveScenario] = useState('baseline')
  const [customScenario, setCustomScenario] = useState({ gdpDelta: 0, materialDelta: 0, policyShock: false })
  const [monteCarloRuns, setMonteCarloRuns] = useState(0)
  const [trained, setTrained] = useState(true)
  const [subTab, setSubTab] = useState('factory')

  const forecast = useMemo(() => getForecastData(country, category, horizon), [country, category, horizon])
  const indicators = LEADING_INDICATORS[category] || LEADING_INDICATORS.vehicle

  const scenarioPreset = SCENARIO_PRESETS.find((s) => s.id === activeScenario) || SCENARIO_PRESETS[0]
  const scenarioLine = useMemo(
    () => applyScenarioForecast(forecast.baseline, { ...scenarioPreset, ...customScenario, name: scenarioPreset.name }),
    [forecast.baseline, scenarioPreset, customScenario],
  )

  const monteCarlo = useMemo(
    () => (monteCarloRuns > 0 ? buildMonteCarloFan(forecast.baseline, monteCarloRuns) : null),
    [forecast.baseline, monteCarloRuns],
  )

  const compareData = useMemo(() => {
    const hist = forecast.historical.map((h) => ({ month: h.month, value: h.actual, series: '历史实际' }))
    const base = forecast.baseline.map((b) => ({ month: b.month, value: b.value, series: '基准预测' }))
    const opt = forecast.optimistic.map((b) => ({ month: b.month, value: b.value, series: '乐观' }))
    const pes = forecast.pessimistic.map((b) => ({ month: b.month, value: b.value, series: '悲观' }))
    const custom = scenarioLine.map((b) => ({ month: b.month, value: b.value, series: scenarioPreset.name }))
    return [...hist, ...base, ...opt, ...pes, ...custom]
  }, [forecast, scenarioLine, scenarioPreset.name])

  const handleTrain = () => {
    message.loading({ content: '模型训练中...', key: 'train' })
    setTimeout(() => {
      setModels((prev) => prev.map((m) => ({ ...m, selected: ['sarima', 'xgb'].includes(m.id) })))
      setTrained(true)
      message.success({ content: '回溯测试完成，推荐 SARIMA+XGBoost 集成', key: 'train' })
    }, 1500)
  }

  const handleMonteCarlo = () => {
    setMonteCarloRuns(5000)
    message.success('蒙特卡洛模拟 5000 次完成')
  }

  const factoryTab = (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={8}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">集成模型</Text>
            <div className="forecast-stat-value">{trained ? forecast.ensemble : '待训练'}</div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">样本外 MAPE</Text>
            <div className="forecast-stat-value">{forecast.mape}%</div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">需求拆解</Text>
            <Space wrap>{forecast.decomposition.map((d) => <Tag key={d.component}>{d.component} {d.share}%</Tag>)}</Space>
          </Card>
        </Col>
      </Row>

      <div className="business-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 className="business-panel-title" style={{ margin: 0 }}>基础模型库 · 竞争与集成</h3>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleTrain}>运行回溯测试</Button>
        </div>
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={models}
          columns={[
            { title: '模型', dataIndex: 'name', key: 'name' },
            { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
            { title: 'MAPE%', dataIndex: 'mape', key: 'mape', width: 80, render: (v) => <Tag color={v < 8 ? 'success' : 'default'}>{v}</Tag> },
            { title: 'RMSE', dataIndex: 'rmse', key: 'rmse', width: 70 },
            { title: '稳定性', dataIndex: 'stability', key: 'stability', width: 100, render: (v) => <Progress percent={v} size="small" showInfo={false} /> },
            { title: '样本外', dataIndex: 'oos', key: 'oos', width: 70 },
            {
              title: '选用',
              key: 'sel',
              width: 70,
              render: (_, r) => (
                <Switch
                  size="small"
                  checked={r.selected}
                  onChange={(c) => setModels((prev) => prev.map((m) => (m.id === r.id ? { ...m, selected: c } : m)))}
                />
              ),
            },
          ]}
        />
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">领先指标体系</h3>
            <Table
              rowKey="name"
              size="small"
              pagination={false}
              dataSource={indicators}
              columns={[
                { title: '指标', dataIndex: 'name', key: 'name' },
                { title: '相关性', dataIndex: 'correlation', key: 'correlation', width: 80, render: (v) => v.toFixed(2) },
                { title: '领先期', dataIndex: 'lead', key: 'lead', width: 80 },
                { title: '权重', dataIndex: 'weight', key: 'weight', width: 70, render: (v) => `${(v * 100).toFixed(0)}%` },
              ]}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">非线性 / 突发因素建模</h3>
            <Paragraph type="secondary">LSTM / Transformer 捕捉长期依赖；外生冲击变量量化脉冲效应</Paragraph>
            {shocks.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '8px 12px', background: '#fafafa', borderRadius: 6 }}>
                <Space>
                  <Checkbox
                    checked={s.enabled}
                    onChange={(e) => setShocks((prev) => prev.map((x) => (x.id === s.id ? { ...x, enabled: e.target.checked } : x)))}
                  />
                  <Text>{s.name}</Text>
                </Space>
                <Space>
                  <Tag color={s.impact >= 0 ? 'success' : 'error'}>{s.impact > 0 ? '+' : ''}{s.impact}%</Tag>
                  <Text type="secondary">滞后 {s.lag}</Text>
                </Space>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">机会识别 · 加速品类与空白区间</h3>
        <Row gutter={12}>
          {forecast.gaps.map((g) => (
            <Col xs={24} sm={12} lg={6} key={g.segment}>
              <Card size="small">
                <Tag color={g.type === 'accelerating' ? 'success' : g.type === 'whitespace' ? 'processing' : 'default'}>{g.label}</Tag>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{g.segment}</div>
                <Text type={g.growth >= 0 ? 'success' : 'danger'}>{g.growth > 0 ? '+' : ''}{g.growth}% CAGR</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </>
  )

  const scenarioTab = (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {SCENARIO_PRESETS.map((s) => (
          <Col xs={24} sm={12} lg={6} key={s.id}>
            <Card
              size="small"
              hoverable
              className={activeScenario === s.id ? 'forecast-scenario-active' : ''}
              onClick={() => { setActiveScenario(s.id); setCustomScenario({ gdpDelta: s.gdpDelta, materialDelta: s.materialDelta, policyShock: !!s.policyShock }) }}
            >
              <Text strong>{s.name}</Text>
              <Paragraph type="secondary" style={{ fontSize: 12, margin: '8px 0 0' }}>{s.desc}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">情景定义器</h3>
        <Form layout="vertical" size="small">
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label={`GDP增速调整 (${customScenario.gdpDelta > 0 ? '+' : ''}${customScenario.gdpDelta} ppt)`}>
                <Slider min={-2} max={2} step={0.5} value={customScenario.gdpDelta} onChange={(v) => setCustomScenario((p) => ({ ...p, gdpDelta: v }))} marks={{ '-2': '-2', 0: '0', 2: '+2' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={`原材料价格 (${customScenario.materialDelta > 0 ? '+' : ''}${customScenario.materialDelta}%)`}>
                <Slider min={-20} max={40} value={customScenario.materialDelta} onChange={(v) => setCustomScenario((p) => ({ ...p, materialDelta: v }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="政策冲击（补贴取消/关税）">
                <Switch checked={customScenario.policyShock} onChange={(v) => setCustomScenario((p) => ({ ...p, policyShock: v }))} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">多情景预测对比</h3>
            <div className="business-chart-box">
              <Line data={compareData} xField="month" yField="value" seriesField="series" height={320} smooth color={['#8c8c8c', '#B32620', '#52c41a', '#ff4d4f', '#1677ff']} />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>蒙特卡洛模拟</h3>
              <Button icon={<ThunderboltOutlined />} onClick={handleMonteCarlo}>运行 5000 次</Button>
            </div>
            {monteCarlo ? (
              <>
                <div className="business-chart-box-sm">
                  <Area data={monteCarlo.fan} xField="month" yField="value" seriesField="quantile" height={260} color={['#fff1f0', '#ffccc7', '#B32620', '#ffccc7', '#fff1f0']} />
                </div>
                <Text type="secondary">P10–P90 置信区间 · 已模拟 {monteCarlo.runs} 次</Text>
              </>
            ) : (
              <Paragraph type="secondary">点击运行生成需求概率分布扇形图，评估尾部风险</Paragraph>
            )}
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <h3 className="business-panel-title" style={{ margin: 0 }}>预测结果输出</h3>
          <Space>
            <Button icon={<CloudDownloadOutlined />} onClick={() => message.success('预测报表已导出')}>导出报表</Button>
            <Button icon={<ApiOutlined />} onClick={() => message.success('已推送至 ERP/SCM 接口（Mock）')}>API 推送</Button>
          </Space>
        </div>
        <Table
          rowKey="period"
          size="small"
          pagination={{ pageSize: 6 }}
          dataSource={forecast.forecastTable}
          columns={[
            { title: '周期', dataIndex: 'period', key: 'period' },
            { title: '基准', dataIndex: 'baseline', key: 'baseline' },
            { title: '乐观', dataIndex: 'optimistic', key: 'optimistic' },
            { title: '悲观', dataIndex: 'pessimistic', key: 'pessimistic' },
            { title: '误差带', dataIndex: 'errorBand', key: 'errorBand' },
          ]}
        />
      </div>
    </>
  )

  return (
    <>
      <div className="business-filter-bar">
        <Space wrap>
          <Text>预测品类</Text>
          <Select value={category} style={{ width: 140 }} options={PRODUCT_CATEGORIES} onChange={onCategoryChange} />
          <Text>预测 horizon</Text>
          <Select value={horizon} style={{ width: 140 }} options={FORECAST_HORIZONS} onChange={setHorizon} />
        </Space>
        <Button type="link" onClick={() => setSubTab(subTab === 'factory' ? 'scenario' : 'factory')}>
          {subTab === 'factory' ? '多情景模拟 →' : '← 模型工厂'}
        </Button>
        {onGoCompetition && (
          <Button type="link" onClick={onGoCompetition}>竞争态势分析 →</Button>
        )}
      </div>

      <Tabs
        activeKey={subTab}
        onChange={setSubTab}
        items={[
          { key: 'factory', label: <span><ExperimentOutlined /> 预测模型工厂</span>, children: factoryTab },
          { key: 'scenario', label: <span><LineChartOutlined /> 多情景预测</span>, children: scenarioTab },
        ]}
      />
    </>
  )
}
