import { useEffect, useMemo, useRef, useState } from 'react'
import {
  App,
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Form,
  InputNumber,
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
  Timeline,
  Typography,
} from 'antd'
import { Area, Column, DualAxes, Line } from '@ant-design/charts'
import {
  BellOutlined,
  CloudDownloadOutlined,
  FileTextOutlined,
  FundOutlined,
  LineChartOutlined,
  MailOutlined,
  MobileOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {
  PRICE_GRANULARITY,
  PRICE_TIME_RANGES,
  getPriceAnalysisData,
  getProductDetail,
} from '../../../../mock/analysis'
import { exportCsv, exportJsonAsTxt } from '../analysisExport'
import {
  FORECAST_HORIZONS,
  buildAlertPayload,
  buildTrendCompare,
  computeHedgingAdvice,
  exportAttributionTxt,
  exportPriceAnalysisCsv,
  filterForecastByHorizon,
  generateAttributionReport,
  shouldAutoAttribution,
} from './priceAnalysisEngine'
import {
  appendAlertHistory,
  checkPriceAlerts,
  loadAlertHistory,
  loadPriceAlertSettings,
  savePriceAlertSettings,
} from './priceAnalysisStore'
import ProductSwitcher from './ProductSwitcher'

const { Text, Paragraph, Title } = Typography

const WORKFLOW_STEPS = [
  { key: 'aggregate', title: '数据聚合' },
  { key: 'trend', title: '走势解读' },
  { key: 'attribution', title: '归因分析' },
  { key: 'forecast', title: '预测预警' },
]

export default function PriceTab({ productName, skuLabel, filters = {}, onGoQuery, onGoSupply }) {
  const { message, notification } = App.useApp()
  const [granularity, setGranularity] = useState('month')
  const [timeRange, setTimeRange] = useState('6m')
  const [forecastMonths, setForecastMonths] = useState(3)
  const [workflowStep, setWorkflowStep] = useState(0)
  const [showAttribution, setShowAttribution] = useState(false)
  const [attributionReport, setAttributionReport] = useState(null)
  const [factorLayer, setFactorLayer] = useState('宏观')
  const [alertSettings, setAlertSettings] = useState(() => loadPriceAlertSettings(productName))
  const [alertHistory, setAlertHistory] = useState(() => loadAlertHistory(productName))
  const [hedgeInputs, setHedgeInputs] = useState({ monthlyPurchase: 800, inventory: 200, hedgeRatio: 65 })
  const lastAlertKey = useRef('')

  const product = useMemo(() => getProductDetail(productName), [productName])
  const price = useMemo(
    () => getPriceAnalysisData(productName, granularity, timeRange, filters),
    [productName, granularity, timeRange, filters],
  )

  useEffect(() => {
    setAlertSettings(loadPriceAlertSettings(productName))
    setAlertHistory(loadAlertHistory(productName))
    setWorkflowStep(0)
    setShowAttribution(false)
    setAttributionReport(null)
  }, [productName])

  const upper = alertSettings.upper ?? price.alert?.upper
  const lower = alertSettings.lower ?? price.alert?.lower

  const alertCheck = useMemo(
    () => checkPriceAlerts(price, { ...alertSettings, upper, lower }),
    [price, alertSettings, upper, lower],
  )

  const forecastData = useMemo(
    () => filterForecastByHorizon(price.forecastLines, forecastMonths),
    [price.forecastLines, forecastMonths],
  )

  const trendCompareData = useMemo(
    () => buildTrendCompare(price.multiLine, price.benchmarkRatio),
    [price.multiLine, price.benchmarkRatio],
  )

  const hedgingAdvice = useMemo(
    () => computeHedgingAdvice(price, hedgeInputs),
    [price, hedgeInputs],
  )

  const factorItems = useMemo(
    () => price.factorDatabase?.find((g) => g.layer === factorLayer)?.items || [],
    [price.factorDatabase, factorLayer],
  )

  // 预警推送闭环：触发后记录历史并多渠道通知（演示）
  useEffect(() => {
    if (!alertSettings.enabled || !alertCheck.triggered || !alertCheck.reasons.length) return
    const key = `${productName}-${alertCheck.reasons.map((r) => r.msg).join('|')}`
    if (lastAlertKey.current === key) return
    lastAlertKey.current = key

    const payload = buildAlertPayload(price, alertCheck, alertSettings)
    const history = appendAlertHistory(payload)
    setAlertHistory(history.filter((h) => h.product === productName))

    if (alertSettings.channels?.platform) {
      notification.warning({
        message: '价格预警触发',
        description: alertCheck.reasons[0]?.msg,
        placement: 'topRight',
        duration: 6,
      })
    }
    if (alertSettings.channels?.sms) {
      message.info('【短信】价格预警已推送至绑定手机')
    }
    if (alertSettings.channels?.email) {
      message.info('【邮件】价格预警已发送至企业邮箱')
    }
  }, [alertCheck, alertSettings, message, notification, price, productName])

  // 单周涨跌幅 ≥8% 自动生成归因报告
  useEffect(() => {
    if (shouldAutoAttribution(price.weeklyChange, alertSettings.weeklyChangeThreshold || 8)) {
      const report = generateAttributionReport(price)
      setAttributionReport(report)
      setShowAttribution(true)
      setWorkflowStep(2)
    }
  }, [price, alertSettings.weeklyChangeThreshold, productName])

  const handleAttribution = () => {
    const report = generateAttributionReport(price)
    setAttributionReport(report)
    setShowAttribution(true)
    setWorkflowStep(2)
    message.success('《价格波动归因分析报告》已生成')
  }

  const handleExportAttribution = () => {
    const report = attributionReport || generateAttributionReport(price)
    exportJsonAsTxt(`价格归因报告-${productName}.txt`, exportAttributionTxt(report, productName))
    message.success('归因报告已导出')
  }

  const handleExportData = () => {
    const rows = exportPriceAnalysisCsv(price)
    exportCsv(`价格走势-${productName}-${timeRange}.csv`, ['类型', '日期', '系列', '价格'], rows)
    message.success('全链路价格数据已导出')
  }

  const handleSaveAlert = () => {
    savePriceAlertSettings(productName, { ...alertSettings, upper, lower })
    setWorkflowStep(3)
    const channels = [
      alertSettings.channels?.platform && '平台弹窗',
      alertSettings.channels?.sms && '短信',
      alertSettings.channels?.email && '邮件',
    ].filter(Boolean).join('、')
    message.success(`预警已保存 · 推送渠道：${channels || '平台'}`)
  }

  const activeReport = attributionReport || (showAttribution ? generateAttributionReport(price) : null)

  return (
    <>
      <div className="price-workflow-bar">
        <LineChartOutlined style={{ color: '#B32620' }} />
        <Text type="secondary">分析流程：</Text>
        <Steps
          size="small"
          current={workflowStep}
          items={WORKFLOW_STEPS}
          onChange={setWorkflowStep}
          style={{ flex: 1, maxWidth: 560 }}
        />
        {onGoSupply && <Button type="link" size="small" onClick={onGoSupply}>供需研究 →</Button>}
      </div>

      <div className="business-filter-bar">
        <Space wrap>
          <ProductSwitcher productName={productName} skuLabel={skuLabel} onGoQuery={onGoQuery} />
          <Text>时间区间</Text>
          <Select value={timeRange} style={{ width: 100 }} options={PRICE_TIME_RANGES} onChange={(v) => { setTimeRange(v); setWorkflowStep(1) }} />
          <Text>数据粒度</Text>
          <Select value={granularity} style={{ width: 100 }} options={PRICE_GRANULARITY} onChange={(v) => { setGranularity(v); setWorkflowStep(1) }} />
          <Tag>更新：{price.updateFreq}</Tag>
          {price.filterNote && <Tag color="blue">{price.filterNote}</Tag>}
          <Tag>周涨跌 {price.weeklyChange > 0 ? '+' : ''}{price.weeklyChange}%</Tag>
        </Space>
        <Space>
          <Button icon={<FileTextOutlined />} onClick={handleExportAttribution} disabled={!showAttribution}>导出归因</Button>
          <Button icon={<CloudDownloadOutlined />} onClick={handleExportData}>导出数据</Button>
        </Space>
      </div>

      {workflowStep === 0 && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            {(price.indices || []).map((idx) => (
              <Col xs={24} sm={8} key={idx.name}>
                <Card size="small" className="forecast-stat-card">
                  <Text type="secondary">{idx.name}</Text>
                  <div className="forecast-stat-value">{idx.value}</div>
                  <Tag color={idx.change >= 0 ? 'success' : 'error'}>{idx.change > 0 ? '+' : ''}{idx.change}%</Tag>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="business-panel" style={{ marginBottom: 16 }}>
            <h3 className="business-panel-title">全链路价格数据聚合 · 期货 + 现货 + 终端</h3>
            <Table
              size="small"
              pagination={false}
              rowKey="type"
              dataSource={price.dataSources || []}
              columns={[
                { title: '层级', dataIndex: 'type', width: 70 },
                { title: '数据源', dataIndex: 'sources', render: (v) => (v || []).join('、') },
                { title: '频率', dataIndex: 'freq', width: 90 },
                { title: '说明', dataIndex: 'desc' },
              ]}
            />
            <Alert
              type="info"
              showIcon
              style={{ marginTop: 12 }}
              message="价格清洗与标准化"
              description={`${price.standardization?.note} · 方法：${(price.standardization?.methods || []).join('、')} · 样本 ${price.standardization?.quality?.samples} 条 · 剔除异常 ${price.standardization?.quality?.outliersRemoved} 条 · 置信度 ${price.standardization?.quality?.confidence}% · 基准：${(price.standardization?.benchmarks || []).join('、')}`}
            />
            <div style={{ marginTop: 12 }}>
              <Button type="primary" size="small" onClick={() => setWorkflowStep(1)}>进入走势解读 →</Button>
            </div>
          </div>
        </>
      )}

      {(workflowStep === 1 || workflowStep >= 2) && (
        <>
          <Row gutter={16}>
            <Col xs={24} lg={14}>
              <div className="business-panel">
                <h3 className="business-panel-title">价格走势 · 多链路对比（{PRICE_GRANULARITY.find((g) => g.value === granularity)?.label} · {PRICE_TIME_RANGES.find((t) => t.value === timeRange)?.label}）</h3>
                <div className="business-chart-box">
                  <Line
                    data={price.multiLine}
                    xField="date"
                    yField="price"
                    seriesField="series"
                    height={300}
                    smooth
                    color={['#B32620', '#1677ff', '#52c41a']}
                  />
                </div>
              </div>
            </Col>
            <Col xs={24} lg={10}>
              <div className="business-panel">
                <h3 className="business-panel-title">趋势对比 · 现货 vs 行业基准</h3>
                <div className="business-chart-box-sm">
                  <DualAxes
                    data={trendCompareData}
                    xField="date"
                    height={260}
                    legend={{ color: { itemMarker: 'circle' } }}
                    children={[
                      { type: 'line', yField: 'price', colorField: () => '现货价格', style: { stroke: '#B32620', lineWidth: 2 }, axis: { y: { title: '价格' } } },
                      { type: 'line', yField: 'benchmark', colorField: () => '行业基准', style: { stroke: '#1677ff', lineWidth: 2, lineDash: [4, 4] }, axis: { y: { title: '价格' } } },
                    ]}
                  />
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <div className="business-panel">
                <h3 className="business-panel-title">历史价格（{timeRange === '5y' ? '近5年' : '归档参考'}）</h3>
                <div className="business-chart-box-sm">
                  <Area data={price.history5y} xField="year" yField="price" height={220} color="#B32620" />
                </div>
                <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                  均价 {product.archive?.priceRange?.min}–{product.archive?.priceRange?.max} · 波动系数 {product.archive?.priceRange?.volatility}
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="business-panel">
                <h3 className="business-panel-title">季节性热力 · 月度价格强度</h3>
                <div className="price-season-heatmap">
                  {(price.seasonalHeatmap || []).map((cell) => (
                    <div
                      key={cell.month}
                      className="price-season-cell"
                      style={{ background: `rgba(179, 38, 32, ${0.25 + cell.intensity / 200})` }}
                      title={`${cell.month}: ${cell.value}`}
                    >
                      <div>{cell.month}</div>
                      <strong>{cell.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">多维度影响解读</h3>
            <Row gutter={12}>
              {(price.influenceFactors || []).map((f) => (
                <Col xs={24} sm={12} lg={8} xl={4} key={f.key} style={{ marginBottom: 12 }}>
                  <Card size="small" className="price-influence-card">
                    <Tag color={f.trend === 'up' ? 'error' : f.trend === 'down' ? 'success' : 'default'}>{f.impact}</Tag>
                    <div style={{ fontWeight: 600, marginTop: 6 }}>{f.title}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{f.summary}</Text>
                    <div style={{ marginTop: 6, fontSize: 11, color: '#8c8c8c' }}>{(f.items || []).join(' · ')}</div>
                  </Card>
                </Col>
              ))}
            </Row>
            <Button size="small" style={{ marginTop: 8 }} onClick={() => setWorkflowStep(2)}>进入归因分析 →</Button>
          </div>
        </>
      )}

      {(workflowStep === 2 || showAttribution) && (
        <>
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <div className="business-panel">
                <h3 className="business-panel-title">成本结构拆解</h3>
                <div className="business-chart-box-sm">
                  <Column
                    data={price.costBreakdown || []}
                    xField="item"
                    yField="share"
                    height={240}
                    color="#B32620"
                    label={{ position: 'top', text: (d) => `${d.share}%` }}
                  />
                </div>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="business-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 className="business-panel-title" style={{ margin: 0 }}>价格驱动因子库</h3>
                  <Button size="small" type="primary" icon={<ThunderboltOutlined />} onClick={handleAttribution}>生成归因报告</Button>
                </div>
                <Tabs
                  size="small"
                  activeKey={factorLayer}
                  onChange={setFactorLayer}
                  items={(price.factorDatabase || []).map((g) => ({ key: g.layer, label: g.layer }))}
                />
                <Table
                  rowKey="factor"
                  size="small"
                  pagination={false}
                  scroll={{ y: 200 }}
                  dataSource={factorItems}
                  columns={[
                    { title: '因子', dataIndex: 'factor', key: 'factor' },
                    { title: '相关性', dataIndex: 'correlation', width: 70, render: (v) => v?.toFixed?.(2) ?? v },
                    { title: '变动', dataIndex: 'change', width: 90 },
                    { title: '贡献%', dataIndex: 'contribution', width: 70 },
                  ]}
                />
              </div>
            </Col>
          </Row>

          {showAttribution && activeReport && (
            <div className="business-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="business-panel-title">《价格波动归因分析报告》· {activeReport.period}</h3>
                <Button size="small" icon={<FileTextOutlined />} onClick={handleExportAttribution}>导出报告</Button>
              </div>
              <Alert
                type="warning"
                showIcon
                message={`单周涨跌幅 ${activeReport.change} · 分析方法：${(activeReport.methods || []).join('、')}`}
                description={activeReport.summary}
                style={{ marginBottom: 16 }}
              />
              <Title level={5}>因子贡献权重</Title>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                {(activeReport.factors || []).map((f) => (
                  <Col xs={12} sm={8} lg={4} key={f.name}>
                    <Text type="secondary">{f.name}</Text>
                    <Progress percent={f.weight} strokeColor="#B32620" size="small" />
                  </Col>
                ))}
              </Row>
              <Title level={5}>历史行情对比</Title>
              <Table
                size="small"
                pagination={false}
                rowKey="event"
                dataSource={activeReport.historicalCompare || []}
                columns={[
                  { title: '历史事件', dataIndex: 'event' },
                  { title: '相似度', dataIndex: 'similarity', width: 80, render: (v) => `${v}%` },
                  { title: '与本次差异', dataIndex: 'diff' },
                ]}
              />
              <Button size="small" type="primary" style={{ marginTop: 12 }} onClick={() => setWorkflowStep(3)}>进入预测预警 →</Button>
            </div>
          )}
        </>
      )}

      {workflowStep === 3 && (
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <div className="business-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 className="business-panel-title" style={{ margin: 0 }}>PC-Stacking 价格预测 · 三情景模拟</h3>
                <Space>
                  <Text type="secondary">预测周期</Text>
                  <Select
                    value={forecastMonths}
                    style={{ width: 100 }}
                    options={FORECAST_HORIZONS}
                    onChange={setForecastMonths}
                  />
                </Space>
              </div>
              <Space style={{ marginBottom: 12 }}>
                <Tag color="#B32620">{price.model}</Tag>
                <Tag>物理约束 · LSTM + RF + XGBoost 集成</Tag>
                <Tag color="blue">MAPE 8.6%</Tag>
              </Space>
              <div className="business-chart-box">
                <Line
                  data={forecastData}
                  xField="month"
                  yField="price"
                  seriesField="series"
                  height={280}
                  smooth
                  color={['#1677ff', '#52c41a', '#ff4d4f']}
                />
              </div>
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                乐观：需求回暖/成本下降 · 稳健：基线延续 · 风险：供应扰动/政策冲击
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <div className="business-panel">
              <h3 className="business-panel-title"><BellOutlined /> 价格预警与套保建议</h3>

              {price.supplyDisruption?.active && (
                <Alert
                  type="error"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message="重大供需变化监测"
                  description={`${price.supplyDisruption.title} — ${price.supplyDisruption.impact}`}
                />
              )}

              <Form layout="vertical" size="small">
                <Form.Item label="启用智能预警">
                  <Switch
                    checked={alertSettings.enabled}
                    onChange={(v) => setAlertSettings((p) => ({ ...p, enabled: v }))}
                  />
                </Form.Item>
                <Form.Item label={`上限预警线 (${upper})`}>
                  <Slider
                    min={Math.round(price.currentPrice * 0.7)}
                    max={Math.round(price.currentPrice * 1.5)}
                    value={upper}
                    onChange={(v) => setAlertSettings((p) => ({ ...p, upper: v }))}
                  />
                </Form.Item>
                <Form.Item label={`下限预警线 (${lower})`}>
                  <Slider
                    min={Math.round(price.currentPrice * 0.5)}
                    max={Math.round(price.currentPrice * 1.2)}
                    value={lower}
                    onChange={(v) => setAlertSettings((p) => ({ ...p, lower: v }))}
                  />
                </Form.Item>
                <Form.Item label={`单日涨跌幅阈值 (${alertSettings.dailyChangeThreshold}%)`}>
                  <Slider min={1} max={15} value={alertSettings.dailyChangeThreshold} onChange={(v) => setAlertSettings((p) => ({ ...p, dailyChangeThreshold: v }))} />
                </Form.Item>
                <Form.Item label={`单周涨跌幅阈值 (${alertSettings.weeklyChangeThreshold ?? 8}%)`}>
                  <Slider min={3} max={20} value={alertSettings.weeklyChangeThreshold ?? 8} onChange={(v) => setAlertSettings((p) => ({ ...p, weeklyChangeThreshold: v }))} />
                </Form.Item>
                <Form.Item label={`突破上限概率阈值 (${alertSettings.probThreshold}%)`}>
                  <Slider min={50} max={90} value={alertSettings.probThreshold} onChange={(v) => setAlertSettings((p) => ({ ...p, probThreshold: v }))} />
                </Form.Item>
                <Form.Item label="监测重大供需变化">
                  <Switch checked={alertSettings.watchSupplyDisruption !== false} onChange={(v) => setAlertSettings((p) => ({ ...p, watchSupplyDisruption: v }))} />
                </Form.Item>
                <Form.Item label="推送渠道">
                  <Space>
                    <Checkbox checked={alertSettings.channels?.platform} onChange={(e) => setAlertSettings((p) => ({ ...p, channels: { ...p.channels, platform: e.target.checked } }))}>平台</Checkbox>
                    <Checkbox checked={alertSettings.channels?.sms} onChange={(e) => setAlertSettings((p) => ({ ...p, channels: { ...p.channels, sms: e.target.checked } }))}><MobileOutlined /> 短信</Checkbox>
                    <Checkbox checked={alertSettings.channels?.email} onChange={(e) => setAlertSettings((p) => ({ ...p, channels: { ...p.channels, email: e.target.checked } }))}><MailOutlined /> 邮件</Checkbox>
                  </Space>
                </Form.Item>
              </Form>

              {alertCheck.triggered ? (
                <Alert
                  type="error"
                  showIcon
                  icon={<WarningOutlined />}
                  message="价格预警已触发"
                  description={alertCheck.reasons.map((r) => r.msg).join('；')}
                />
              ) : (
                <Alert type="success" showIcon message={`未来1月突破上限概率 ${price.alert?.probBreakUpper}%（阈值 ${alertSettings.probThreshold}%）`} />
              )}

              <Button type="primary" block style={{ marginTop: 12 }} onClick={handleSaveAlert}>保存预警设置</Button>

              {alertHistory.length > 0 && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Text strong style={{ fontSize: 12 }}>预警记录</Text>
                  <Timeline
                    style={{ marginTop: 8 }}
                    items={alertHistory.slice(0, 5).map((h) => ({
                      color: h.level === 'error' ? 'red' : 'orange',
                      children: (
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>{h.time} · {h.channels}</Text>
                          <div style={{ fontSize: 12 }}>{h.reasons[0]}</div>
                        </div>
                      ),
                    }))}
                  />
                </>
              )}

              {hedgingAdvice.applicable && (
                <Card size="small" style={{ marginTop: 16 }} title={<span><FundOutlined /> 套期保值建议</span>}>
                  <Row gutter={8} style={{ marginBottom: 8 }}>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 11 }}>月采购量(吨)</Text>
                      <InputNumber size="small" min={100} style={{ width: '100%' }} value={hedgeInputs.monthlyPurchase} onChange={(v) => setHedgeInputs((p) => ({ ...p, monthlyPurchase: v || 800 }))} />
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 11 }}>库存(吨)</Text>
                      <InputNumber size="small" min={0} style={{ width: '100%' }} value={hedgeInputs.inventory} onChange={(v) => setHedgeInputs((p) => ({ ...p, inventory: v || 0 }))} />
                    </Col>
                  </Row>
                  <Form.Item label={`对冲比例 ${hedgeInputs.hedgeRatio}%`} style={{ marginBottom: 8 }}>
                    <Slider min={30} max={90} value={hedgeInputs.hedgeRatio} onChange={(v) => setHedgeInputs((p) => ({ ...p, hedgeRatio: v }))} />
                  </Form.Item>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="合约">{hedgingAdvice.contract}</Descriptions.Item>
                    <Descriptions.Item label="方向/数量">{hedgingAdvice.direction} · {hedgingAdvice.quantity}</Descriptions.Item>
                    <Descriptions.Item label="风险敞口">{hedgingAdvice.exposure} 吨当量</Descriptions.Item>
                    <Descriptions.Item label="止损">{hedgingAdvice.stopLoss}</Descriptions.Item>
                  </Descriptions>
                  <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>{hedgingAdvice.note}</Paragraph>
                </Card>
              )}

              {!hedgingAdvice.applicable && (
                <Alert style={{ marginTop: 16 }} type="info" showIcon message={hedgingAdvice.note || '建议通过长协锁价替代金融套保'} />
              )}
            </div>
          </Col>
        </Row>
      )}
    </>
  )
}
