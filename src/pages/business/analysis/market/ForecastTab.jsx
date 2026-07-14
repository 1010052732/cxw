import { useMemo, useState } from 'react'
import {
  Alert,
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
  Steps,
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
  MARKET_COUNTRIES,
  PRODUCT_CATEGORIES,
  SCENARIO_PRESETS,
  SHOCK_EVENTS,
  applyScenarioForecast,
  buildEnsembleLabel,
  buildForecastTrendChart,
  buildMonteCarloFan,
  getForecastData,
} from '../../../../mock/analysis'
import { exportCsv } from '../analysisExport'

const { Text, Paragraph } = Typography

const SCENARIO_DEFAULTS = {
  gdpDelta: 0,
  materialDelta: 0,
  policyShock: false,
  fxDelta: 0,
  rateDelta: 0,
  rivalShareDelta: 0,
  inventoryDelta: 0,
  freightDelta: 0,
  energyDelta: 0,
  demandPulse: 0,
}

export default function ForecastTab({
  country,
  countryLabel,
  category,
  onGoCompetition,
}) {
  const { message } = App.useApp()
  const [horizon, setHorizon] = useState(1)
  const [models, setModels] = useState(() => FORECAST_MODELS.map((m) => ({ ...m })))
  const [shocks, setShocks] = useState(() => SHOCK_EVENTS.map((s) => ({ ...s })))
  const [activeScenario, setActiveScenario] = useState('baseline')
  const [customScenario, setCustomScenario] = useState({ ...SCENARIO_DEFAULTS })
  const [monteCarloRuns, setMonteCarloRuns] = useState(0)
  const [trained, setTrained] = useState(true)
  const [subTab, setSubTab] = useState('factory')

  const marketLabel = countryLabel || MARKET_COUNTRIES.find((c) => c.value === country)?.label || country
  const categoryLabel = PRODUCT_CATEGORIES.find((c) => c.value === category)?.label || category

  const enabledShocks = useMemo(() => shocks.filter((s) => s.enabled), [shocks])
  const ensembleLabel = useMemo(() => buildEnsembleLabel(models), [models])

  const forecast = useMemo(
    () => getForecastData(country, category, horizon, { shocks: enabledShocks }),
    [country, category, horizon, enabledShocks],
  )

  const indicators = LEADING_INDICATORS[category] || LEADING_INDICATORS.vehicle
  const deepModels = models.filter((m) => m.type === '深度学习')

  const scenarioPreset = SCENARIO_PRESETS.find((s) => s.id === activeScenario) || SCENARIO_PRESETS[0]
  const scenarioLine = useMemo(
    () => applyScenarioForecast(forecast.baseline, { ...scenarioPreset, ...customScenario, name: scenarioPreset.name }, enabledShocks),
    [forecast.baseline, scenarioPreset, customScenario, enabledShocks],
  )

  const monteCarlo = useMemo(
    () => (monteCarloRuns > 0 ? buildMonteCarloFan(forecast.baseline, monteCarloRuns) : null),
    [forecast.baseline, monteCarloRuns],
  )

  const trendChartData = useMemo(() => buildForecastTrendChart(forecast), [forecast])

  const compareData = useMemo(() => {
    const hist = forecast.historical.map((h) => ({ month: h.month, value: h.actual, series: '历史实际' }))
    const base = forecast.baseline.map((b) => ({ month: b.month, value: b.value, series: '基准预测' }))
    const opt = forecast.optimistic.map((b) => ({ month: b.month, value: b.value, series: '乐观情景' }))
    const pes = forecast.pessimistic.map((b) => ({ month: b.month, value: b.value, series: '风险收缩' }))
    const custom = scenarioLine.map((b) => ({ month: b.month, value: b.value, series: scenarioPreset.name }))
    return [...hist, ...base, ...opt, ...pes, ...custom]
  }, [forecast, scenarioLine, scenarioPreset.name])

  const workflowStep = useMemo(() => {
    if (monteCarloRuns > 0) return 4
    if (subTab === 'scenario') return 3
    if (trained) return 1
    return 0
  }, [monteCarloRuns, subTab, trained])

  const handleTrain = () => {
    message.loading({ content: '多模型回溯测试中…', key: 'train' })
    setTimeout(() => {
      setModels((prev) => prev.map((m) => ({
        ...m,
        selected: ['sarima', 'xgb'].includes(m.id),
      })))
      setTrained(true)
      message.success({ content: '回溯测试完成 · 推荐 SARIMA+XGBoost 加权集成', key: 'train' })
    }, 1500)
  }

  const handleMonteCarlo = () => {
    setMonteCarloRuns(5000)
    message.success('蒙特卡洛模拟 5000 次完成 · 已生成 P10–P90 置信区间')
  }

  const applyPreset = (preset) => {
    setActiveScenario(preset.id)
    setCustomScenario({
      ...SCENARIO_DEFAULTS,
      gdpDelta: preset.gdpDelta || 0,
      materialDelta: preset.materialDelta || 0,
      policyShock: !!preset.policyShock,
    })
  }

  const factoryTab = (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={6}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">集成方案</Text>
            <div className="forecast-stat-value">{ensembleLabel}</div>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">样本外 MAPE</Text>
            <div className="forecast-stat-value">{forecast.mape}%</div>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">预测周期</Text>
            <div className="forecast-stat-value">{FORECAST_HORIZONS.find((h) => h.value === horizon)?.label}</div>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">需求拆解</Text>
            <Space wrap size={[4, 4]}>
              {forecast.decomposition.map((d) => (
                <Tag key={d.component}>{d.component} {d.share}%</Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">总体需求趋势 · 预测误差带</h3>
        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          区分趋势项、周期项与随机冲击项，避免对短期噪声过度反应
        </Paragraph>
        <div className="business-chart-box">
          <Line
            data={trendChartData.flatMap((d) => [
              d.actual != null ? { month: d.month, value: d.actual, series: '历史实际' } : null,
              d.baseline != null ? { month: d.month, value: d.baseline, series: '基准预测' } : null,
              d.upper != null ? { month: d.month, value: d.upper, series: '误差带上沿' } : null,
              d.lower != null ? { month: d.month, value: d.lower, series: '误差带下沿' } : null,
            ].filter(Boolean))}
            xField="month"
            yField="value"
            seriesField="series"
            height={280}
            smooth
            color={['#8c8c8c', '#B32620', '#ffccc7', '#ffccc7']}
          />
        </div>
        <Row gutter={12} style={{ marginTop: 12 }}>
          {forecast.decomposition.map((d) => (
            <Col xs={8} key={d.component}>
              <div className="forecast-decomp-item">
                <Text strong>{d.component}</Text>
                <Progress percent={d.share} size="small" strokeColor="#B32620" />
                <Text type="secondary" style={{ fontSize: 11 }}>{d.desc}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="business-panel">
        <div className="business-panel-title-row">
          <h3 className="business-panel-title">1）基础模型库 · 竞争与集成</h3>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleTrain}>运行回溯测试</Button>
        </div>
        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          ARIMA / SARIMA / 指数平滑 · 多元回归 / 面板数据 · XGBoost / LightGBM / RF · 多模型加权降低单模型依赖
        </Paragraph>
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={models.filter((m) => m.type !== '深度学习')}
          columns={[
            { title: '模型', dataIndex: 'name', key: 'name' },
            { title: '范式', dataIndex: 'type', key: 'type', width: 90 },
            { title: 'MAPE%', dataIndex: 'mape', key: 'mape', width: 80, render: (v) => <Tag color={v < 8 ? 'success' : 'default'}>{v}</Tag> },
            { title: 'RMSE', dataIndex: 'rmse', key: 'rmse', width: 70 },
            { title: '稳定性', dataIndex: 'stability', key: 'stability', width: 100, render: (v) => <Progress percent={v} size="small" showInfo={false} /> },
            { title: '样本外', dataIndex: 'oos', key: 'oos', width: 70 },
            {
              title: '纳入集成',
              key: 'sel',
              width: 80,
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
            <h3 className="business-panel-title">2）领先指标体系</h3>
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              按品类自动匹配宏观与行业领先指标 · 筛选相关性最高、领先期最稳定的变量
            </Paragraph>
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
            <h3 className="business-panel-title">3）非线性与突发因素建模</h3>
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              LSTM / Transformer 捕捉长期依赖；外生冲击量化脉冲效应与滞后影响
            </Paragraph>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={deepModels}
              columns={[
                { title: '深度学习模型', dataIndex: 'name', key: 'name' },
                { title: 'MAPE%', dataIndex: 'mape', key: 'mape', width: 80 },
                { title: '稳定性', dataIndex: 'stability', key: 'stability', width: 100, render: (v) => <Progress percent={v} size="small" showInfo={false} /> },
                {
                  title: '辅助',
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
            <div style={{ marginTop: 12 }}>
              <Text strong style={{ fontSize: 12 }}>外生冲击变量</Text>
              {shocks.map((s) => (
                <div key={s.id} className="forecast-shock-row">
                  <Space>
                    <Checkbox
                      checked={s.enabled}
                      onChange={(e) => setShocks((prev) => prev.map((x) => (x.id === s.id ? { ...x, enabled: e.target.checked } : x)))}
                    />
                    <Text style={{ fontSize: 12 }}>{s.name}</Text>
                  </Space>
                  <Space>
                    <Tag color={s.impact >= 0 ? 'success' : 'error'}>{s.impact > 0 ? '+' : ''}{s.impact}%</Tag>
                    <Text type="secondary" style={{ fontSize: 11 }}>滞后 {s.lag}</Text>
                  </Space>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">机会识别 · 加速品类与空白区间</h3>
        <Row gutter={12}>
          {forecast.gaps.map((g) => (
            <Col xs={24} sm={12} lg={6} key={g.segment}>
              <Card size="small" className={`forecast-gap-card forecast-gap-${g.type}`}>
                <Tag color={g.type === 'accelerating' ? 'success' : g.type === 'whitespace' ? 'processing' : g.type === 'declining' ? 'error' : 'default'}>
                  {g.label}
                </Tag>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{g.segment}</div>
                <Text type={g.growth >= 0 ? 'success' : 'danger'}>{g.growth > 0 ? '+' : ''}{g.growth}% CAGR</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className="forecast-tab-cta">
        <Button type="primary" onClick={() => setSubTab('scenario')}>进入多情景预测与模拟 →</Button>
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
              onClick={() => applyPreset(s)}
            >
              <Text strong>{s.name}</Text>
              <Paragraph type="secondary" style={{ fontSize: 12, margin: '8px 0 0' }}>{s.desc}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">1）情景定义器 · 10 个核心驱动因子</h3>
        {enabledShocks.length > 0 && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message={`已注入 ${enabledShocks.length} 项外生冲击：${enabledShocks.map((s) => s.name).join('、')}`}
          />
        )}
        <Form layout="vertical" size="small">
          <Row gutter={24}>
            {[
              { key: 'gdpDelta', label: 'GDP增速', min: -2, max: 2, step: 0.5, unit: 'ppt' },
              { key: 'materialDelta', label: '原材料价格', min: -20, max: 40, unit: '%' },
              { key: 'fxDelta', label: '汇率波动', min: -15, max: 15, unit: '%' },
              { key: 'rateDelta', label: '利率调整', min: -100, max: 100, step: 10, unit: 'bp' },
              { key: 'rivalShareDelta', label: '竞品份额', min: -10, max: 10, unit: 'ppt' },
              { key: 'inventoryDelta', label: '库存水位', min: -30, max: 30, unit: '%' },
              { key: 'freightDelta', label: '运费指数', min: -40, max: 80, unit: '%' },
              { key: 'energyDelta', label: '能源价格', min: -20, max: 50, unit: '%' },
              { key: 'demandPulse', label: '需求脉冲', min: -20, max: 30, unit: '%' },
            ].map((f) => (
              <Col xs={24} sm={12} lg={8} key={f.key}>
                <Form.Item label={`${f.label} (${customScenario[f.key] || 0}${f.unit})`}>
                  <Slider
                    min={f.min}
                    max={f.max}
                    step={f.step || 1}
                    value={customScenario[f.key] || 0}
                    onChange={(v) => setCustomScenario((p) => ({ ...p, [f.key]: v }))}
                  />
                </Form.Item>
              </Col>
            ))}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="政策冲击（补贴取消/关税上调）">
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
              <Line
                data={compareData}
                xField="month"
                yField="value"
                seriesField="series"
                height={320}
                smooth
                color={['#8c8c8c', '#B32620', '#52c41a', '#ff4d4f', '#1677ff']}
              />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <div className="business-panel-title-row">
              <h3 className="business-panel-title">2）蒙特卡洛模拟</h3>
              <Button icon={<ThunderboltOutlined />} onClick={handleMonteCarlo}>运行 5000 次</Button>
            </div>
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              为汇率、大宗商品价格、需求增长率等设定概率分布，生成置信区间与尾部风险评估
            </Paragraph>
            {monteCarlo ? (
              <>
                <div className="business-chart-box-sm">
                  <Area
                    data={monteCarlo.fan}
                    xField="month"
                    yField="value"
                    seriesField="quantile"
                    height={260}
                    color={['#fff1f0', '#ffccc7', '#B32620', '#ffccc7', '#fff1f0']}
                  />
                </div>
                <Text type="secondary">P10–P90 扇形置信区间 · 已模拟 {monteCarlo.runs} 次</Text>
              </>
            ) : (
              <Paragraph type="secondary">点击运行生成需求概率分布，识别最可能路径与极端情形</Paragraph>
            )}
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <div className="business-panel-title-row">
          <h3 className="business-panel-title">3）预测结果输出</h3>
          <Space wrap>
            <Button
              icon={<CloudDownloadOutlined />}
              onClick={() => {
                exportCsv(
                  `forecast-${country}-${category}-${horizon}y.csv`,
                  ['period', 'baseline', 'optimistic', 'pessimistic', 'errorBand'],
                  forecast.forecastTable || [],
                )
                message.success('预测报表 CSV 已下载')
              }}
            >
              导出标准报表
            </Button>
            <Button
              icon={<ApiOutlined />}
              onClick={() => {
                exportCsv(
                  `forecast-erp-push-${Date.now()}.csv`,
                  ['period', 'baseline', 'optimistic', 'pessimistic'],
                  (forecast.forecastTable || []).map((r) => ({
                    period: r.period,
                    baseline: r.baseline,
                    optimistic: r.optimistic,
                    pessimistic: r.pessimistic,
                  })),
                )
                message.success('已生成 ERP/SCM 推送载荷（CSV）')
              }}
            >
              API 推送 ERP/SCM
            </Button>
          </Space>
        </div>
        <Table
          rowKey="period"
          size="small"
          pagination={{ pageSize: horizon === 5 ? 5 : 6 }}
          dataSource={forecast.forecastTable}
          columns={[
            { title: '周期', dataIndex: 'period', key: 'period' },
            { title: '基准情景', dataIndex: 'baseline', key: 'baseline' },
            { title: '乐观情景', dataIndex: 'optimistic', key: 'optimistic' },
            { title: '风险收缩', dataIndex: 'pessimistic', key: 'pessimistic' },
            { title: '预测误差带', dataIndex: 'errorBand', key: 'errorBand' },
          ]}
        />
      </div>

      <div className="forecast-tab-cta">
        <Space>
          <Button onClick={() => setSubTab('factory')}>← 返回模型工厂</Button>
          {onGoCompetition && (
            <Button type="primary" onClick={onGoCompetition}>竞争态势分析 →</Button>
          )}
        </Space>
      </div>
    </>
  )

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="需求预测分析 · 3.2.2.2.1.2"
        description="从「事后响应」转向「事前布局」：量化预测 · 情景模拟 · 不确定性边界 · 支撑产能/库存/采购决策"
      />

      <Steps
        size="small"
        current={workflowStep}
        style={{ marginBottom: 16 }}
        items={[
          { title: '配置范围', description: `${marketLabel} · ${categoryLabel}` },
          { title: '模型工厂', description: '回溯测试与集成' },
          { title: '情景定义', description: '多假设对比' },
          { title: '蒙特卡洛', description: '置信区间' },
          { title: '结果输出', description: '报表/API' },
        ]}
      />

      <div className="business-filter-bar forecast-filter-bar">
        <Space wrap>
          <Tag color="blue">目标市场：{marketLabel}</Tag>
          <Tag>分析品类：{categoryLabel}</Tag>
          <Text>预测周期</Text>
          <Select value={horizon} style={{ width: 160 }} options={FORECAST_HORIZONS} onChange={setHorizon} />
        </Space>
        <Space wrap>
          <Button type="link" onClick={() => setSubTab(subTab === 'factory' ? 'scenario' : 'factory')}>
            {subTab === 'factory' ? '多情景预测 →' : '← 模型工厂'}
          </Button>
          {onGoCompetition && (
            <Button type="link" onClick={onGoCompetition}>竞争态势 →</Button>
          )}
        </Space>
      </div>

      <Tabs
        activeKey={subTab}
        onChange={setSubTab}
        items={[
          { key: 'factory', label: <span><ExperimentOutlined /> （1）预测模型工厂</span>, children: factoryTab },
          { key: 'scenario', label: <span><LineChartOutlined /> （2）多情景预测与模拟</span>, children: scenarioTab },
        ]}
      />
    </>
  )
}
