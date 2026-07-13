import { useEffect, useMemo, useState } from 'react'
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
  Modal,
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
import { Area, Column, DualAxes, Line } from '@ant-design/charts'
import {
  BellOutlined,
  CloudDownloadOutlined,
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
import {
  checkPriceAlerts,
  loadPriceAlertSettings,
  savePriceAlertSettings,
} from './priceAnalysisStore'

const { Text, Paragraph, Title } = Typography

export default function PriceTab({ productName, onGoSupply }) {
  const { message, notification } = App.useApp()
  const [granularity, setGranularity] = useState('month')
  const [timeRange, setTimeRange] = useState('6m')
  const [showAttribution, setShowAttribution] = useState(false)
  const [factorLayer, setFactorLayer] = useState('宏观')
  const [alertSettings, setAlertSettings] = useState(() => loadPriceAlertSettings(productName))

  const product = useMemo(() => getProductDetail(productName), [productName])
  const price = useMemo(
    () => getPriceAnalysisData(productName, granularity, timeRange),
    [productName, granularity, timeRange],
  )

  useEffect(() => {
    setAlertSettings(loadPriceAlertSettings(productName))
  }, [productName])

  const upper = alertSettings.upper ?? price.alert?.upper
  const lower = alertSettings.lower ?? price.alert?.lower

  const alertCheck = useMemo(
    () => checkPriceAlerts(price, { ...alertSettings, upper, lower }),
    [price, alertSettings, upper, lower],
  )

  useEffect(() => {
    if (alertSettings.enabled && alertCheck.triggered && alertCheck.reasons.length) {
      notification.warning({
        message: '价格预警触发',
        description: alertCheck.reasons[0]?.msg,
        duration: 6,
      })
    }
  }, [productName, alertCheck.triggered, alertCheck.reasons, alertSettings.enabled, notification])

  const trendCompareData = useMemo(() => {
    const spot = price.multiLine?.filter((d) => d.series === '现货') || []
    return spot.map((d, i) => ({
      date: d.date,
      price: d.price,
      benchmark: Math.round(d.price * (0.96 + (i % 3) * 0.02)),
    }))
  }, [price.multiLine])

  const factorItems = useMemo(
    () => price.factorDatabase?.find((g) => g.layer === factorLayer)?.items || [],
    [price.factorDatabase, factorLayer],
  )

  const handleAttribution = () => {
    setShowAttribution(true)
    message.success('《价格波动归因分析报告》已生成')
  }

  const handleSaveAlert = () => {
    savePriceAlertSettings(productName, { ...alertSettings, upper, lower })
    const channels = [
      alertSettings.channels?.platform && '平台弹窗',
      alertSettings.channels?.sms && '短信',
      alertSettings.channels?.email && '邮件',
    ].filter(Boolean).join('、')
    message.success(`预警已保存 · 推送渠道：${channels || '平台'}`)
  }

  return (
    <>
      <div className="price-workflow-bar">
        <LineChartOutlined style={{ color: '#B32620' }} />
        <Text type="secondary">分析流程：</Text>
        <Text>数据聚合</Text><Text>→</Text>
        <Text>走势解读</Text><Text>→</Text>
        <Text>归因分析</Text><Text>→</Text>
        <Text>预测预警</Text><Text>→</Text>
        {onGoSupply && <Button type="link" size="small" onClick={onGoSupply}>供需研究 →</Button>}
      </div>

      <div className="business-filter-bar">
        <Space wrap>
          <Text>商品</Text>
          <Tag color="processing">{productName}</Tag>
          <Text>时间区间</Text>
          <Select value={timeRange} style={{ width: 100 }} options={PRICE_TIME_RANGES} onChange={setTimeRange} />
          <Text>数据粒度</Text>
          <Select value={granularity} style={{ width: 100 }} options={PRICE_GRANULARITY} onChange={setGranularity} />
          <Tag>更新：{price.updateFreq}</Tag>
        </Space>
        <Button icon={<CloudDownloadOutlined />} onClick={() => message.success('全链路价格数据已导出')}>导出</Button>
      </div>

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
          description={`${price.standardization?.note} · 方法：${(price.standardization?.methods || []).join('、')} · 样本 ${price.standardization?.quality?.samples} 条 · 剔除异常 ${price.standardization?.quality?.outliersRemoved} 条 · 置信度 ${price.standardization?.quality?.confidence}%`}
        />
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">价格走势 · 多链路对比</h3>
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
            <h3 className="business-panel-title">近5年历史价格</h3>
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
      </div>

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

      {showAttribution && price.attribution && (
        <div className="business-panel">
          <h3 className="business-panel-title">《价格波动归因分析报告》· {price.attribution.period}</h3>
          <Alert
            type="warning"
            showIcon
            message={`单期涨跌幅 ${price.attribution.change} · 分析方法：${(price.attribution.methods || []).join('、')}`}
            description={price.attribution.summary}
            style={{ marginBottom: 16 }}
          />
          <Title level={5}>因子贡献权重</Title>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            {(price.attribution.factors || []).map((f) => (
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
            dataSource={price.attribution.historicalCompare || []}
            columns={[
              { title: '历史事件', dataIndex: 'event' },
              { title: '相似度', dataIndex: 'similarity', width: 80, render: (v) => `${v}%` },
              { title: '与本次差异', dataIndex: 'diff' },
            ]}
          />
        </div>
      )}

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">PC-Stacking 价格预测 · 三情景模拟</h3>
            <Space style={{ marginBottom: 12 }}>
              <Tag color="#B32620">{price.model}</Tag>
              <Tag>物理约束 · LSTM + RF + XGBoost 集成</Tag>
            </Space>
            <div className="business-chart-box">
              <Line
                data={price.forecastLines}
                xField="month"
                yField="price"
                seriesField="series"
                height={280}
                smooth
                color={['#1677ff', '#52c41a', '#ff4d4f']}
              />
            </div>
            <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              乐观情景：需求回暖/成本下降 · 稳健情景：基线延续 · 风险情景：供应扰动/政策冲击
            </Paragraph>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title"><BellOutlined /> 价格预警与套保建议</h3>
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
                <Slider
                  min={1}
                  max={15}
                  value={alertSettings.dailyChangeThreshold}
                  onChange={(v) => setAlertSettings((p) => ({ ...p, dailyChangeThreshold: v }))}
                />
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
              <Alert type="success" showIcon message={`未来1月突破上限概率 ${price.alert?.probBreakUpper}%`} />
            )}

            <Button type="primary" block style={{ marginTop: 12 }} onClick={handleSaveAlert}>保存预警设置</Button>

            {price.hedging?.contract && price.hedging.contract !== '不适用（非大宗商品）' && (
              <Card size="small" style={{ marginTop: 16 }} title={<span><FundOutlined /> 套期保值建议</span>}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="合约">{price.hedging.contract}</Descriptions.Item>
                  <Descriptions.Item label="方向/数量">{price.hedging.direction} · {price.hedging.quantity}</Descriptions.Item>
                  <Descriptions.Item label="止损">{price.hedging.stopLoss}</Descriptions.Item>
                </Descriptions>
                <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>{price.hedging.note}</Paragraph>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </>
  )
}
