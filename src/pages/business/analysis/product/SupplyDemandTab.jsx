import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Alert,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Steps,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Column, Line } from '@ant-design/charts'
import {
  AlertOutlined,
  BulbOutlined,
  CloudDownloadOutlined,
  FileTextOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { getSupplyDemandData } from '../../../../mock/analysis'
import { exportCsv, exportJsonAsTxt } from '../analysisExport'
import {
  GAP_STATUS_COLORS,
  SD_WORKFLOW_STEPS,
  buildStrategyRecommendations,
  exportSupplyDemandCsv,
  exportSupplyDemandReportTxt,
  runBottleneckSimulation,
} from './supplyDemandEngine'
import {
  appendStrategyLog,
  loadLastSimulation,
  loadStrategyLog,
  saveSimulationResult,
} from './supplyDemandStore'
import ProductSwitcher from './ProductSwitcher'

const { Text, Paragraph, Title } = Typography

const STAGE_STATUS_COLOR = { 正常: 'success', 偏紧: 'warning', 拥堵: 'error', 紧张: 'error', 繁忙: 'processing', 旺盛: 'success', 回升: 'processing' }

export default function SupplyDemandTab({ productName, skuLabel, filters = {}, onGoQuery, onGoBarrier }) {
  const { message } = App.useApp()
  const [workflowStep, setWorkflowStep] = useState(0)
  const [simulation, setSimulation] = useState(() => loadLastSimulation(productName))
  const [strategyLog, setStrategyLog] = useState(() => loadStrategyLog(productName))

  const data = useMemo(() => getSupplyDemandData(productName, filters), [productName, filters])
  const { balance, imbalance, tradeHeatmap, nodes, bottleneck, chainStages } = data

  useEffect(() => {
    setSimulation(loadLastSimulation(productName))
    setStrategyLog(loadStrategyLog(productName))
    setWorkflowStep(0)
  }, [productName])

  const balanceChart = useMemo(
    () => (balance.history || []).flatMap((h) => [
      { period: h.period, value: h.supply, series: '供给' },
      { period: h.period, value: h.demand, series: '需求' },
      { period: h.period, value: h.inventory, series: '库存' },
    ]),
    [balance.history],
  )

  const inventoryRatioChart = useMemo(
    () => (data.inventoryRatioSeries || []).map((d) => ({ period: d.period, ratio: d.ratio })),
    [data.inventoryRatioSeries],
  )

  const gapChart = (balance.gap || []).map((g) => ({ month: g.month, gap: g.gap, status: g.status }))

  const strategies = useMemo(
    () => buildStrategyRecommendations(data, simulation),
    [data, simulation],
  )

  const handleSimulate = () => {
    const result = runBottleneckSimulation(bottleneck, nodes)
    const saved = saveSimulationResult(productName, result)
    setSimulation(saved)
    setWorkflowStep(3)
    message.success('供应链瓶颈传播模拟已完成')
  }

  const handleExportCsv = () => {
    const rows = exportSupplyDemandCsv(data)
    exportCsv(`供求关系-${productName}.csv`, ['类型', '周期', '供给', '需求', '库存'], rows)
    message.success('供需数据已导出')
  }

  const handleExportReport = () => {
    exportJsonAsTxt(`供求关系报告-${productName}.txt`, exportSupplyDemandReportTxt(data, productName, simulation))
    message.success('供求关系研究报告已导出')
  }

  const handleAdoptStrategy = (strategy) => {
    const entry = appendStrategyLog(productName, strategy)
    setStrategyLog((prev) => [entry, ...prev])
    message.success(`已采纳策略：${strategy.action}`)
    setWorkflowStep(4)
  }

  return (
    <>
      <div className="price-workflow-bar">
        <SwapOutlined style={{ color: '#B32620' }} />
        <Text type="secondary">研究流程：</Text>
        <Steps
          size="small"
          current={workflowStep}
          onChange={setWorkflowStep}
          items={SD_WORKFLOW_STEPS}
          style={{ flex: 1, maxWidth: 640 }}
        />
        {onGoBarrier && <Button type="link" size="small" onClick={onGoBarrier}>贸易壁垒分析 →</Button>}
      </div>

      <div className="business-filter-bar">
        <Space wrap>
          <ProductSwitcher productName={productName} skuLabel={skuLabel} onGoQuery={onGoQuery} />
          <Tag color={balance.marketStatus === '供不应求' || balance.marketStatus === '短缺' ? 'error' : 'warning'}>
            {balance.marketStatus}
          </Tag>
          {data.filterNote && <Tag color="blue">{data.filterNote}</Tag>}
        </Space>
        <Space>
          <Button icon={<FileTextOutlined />} onClick={handleExportReport}>导出报告</Button>
          <Button icon={<CloudDownloadOutlined />} onClick={handleExportCsv}>导出数据</Button>
        </Space>
      </div>

      {workflowStep === 0 && (
        <div className="business-panel">
          <h3 className="business-panel-title">多源数据融合 · 供求数据采集体系</h3>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="数据整合与估算"
            description="整合官方统计、行业协会、卫星遥感、表观消费量（产量+进口-出口）及全链条库存。低透明度市场采用间接指标估算+专家修正。"
          />
          <Table
            size="small"
            pagination={false}
            rowKey="type"
            dataSource={data.dataSources || []}
            columns={[
              { title: '数据类型', dataIndex: 'type', width: 100 },
              { title: '数据源', dataIndex: 'sources', render: (v) => (v || []).join('、') },
              { title: '频率', dataIndex: 'freq', width: 80 },
              { title: '方法', dataIndex: 'method' },
            ]}
          />
          <Title level={5} style={{ marginTop: 16 }}>全供应链节点覆盖</Title>
          <Row gutter={12}>
            {(chainStages || []).map((stage) => (
              <Col xs={24} sm={12} lg={6} key={stage.stage} style={{ marginBottom: 12 }}>
                <Card size="small">
                  <Tag color={STAGE_STATUS_COLOR[stage.status] || 'default'}>{stage.status}</Tag>
                  <div style={{ fontWeight: 600, marginTop: 6 }}>{stage.stage}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{(stage.nodes || []).join(' · ')}</Text>
                  <div style={{ marginTop: 6, fontSize: 12 }}>{stage.metric}</div>
                </Card>
              </Col>
            ))}
          </Row>
          <Button type="primary" size="small" style={{ marginTop: 8 }} onClick={() => setWorkflowStep(1)}>
            进入平衡仪表盘 →
          </Button>
        </div>
      )}

      {(workflowStep === 1 || workflowStep >= 2) && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={8}>
              <Card size="small" className="sd-dashboard-card supply">
                <Text type="secondary">供给总量</Text>
                <div className="sd-dashboard-value">{balance.supply.total} <span className="sd-unit">{balance.supply.unit}</span></div>
                <Space><Tag color="success">环比 +{balance.supply.mom}%</Tag><Tag>同比 +{balance.supply.yoy}%</Tag></Space>
                <div style={{ marginTop: 12 }}>
                  {(balance.supply.topCountries || []).map((c) => (
                    <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <Text>{c.name}</Text><Text>{c.share}%</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card size="small" className="sd-dashboard-card demand">
                <Text type="secondary">需求总量</Text>
                <div className="sd-dashboard-value">{balance.demand.total} <span className="sd-unit">{balance.supply.unit}</span></div>
                <Space><Tag color="success">环比 +{balance.demand.mom}%</Tag><Tag>同比 +{balance.demand.yoy}%</Tag></Space>
                <Table
                  size="small"
                  pagination={false}
                  rowKey="name"
                  style={{ marginTop: 8 }}
                  dataSource={balance.demand.segments}
                  columns={[
                    { title: '细分', dataIndex: 'name', key: 'name' },
                    { title: '占比', dataIndex: 'share', width: 50, render: (v) => `${v}%` },
                    { title: '增速', dataIndex: 'growth', width: 50, render: (v) => <Tag color="success">+{v}%</Tag> },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card size="small" className="sd-dashboard-card inventory">
                <Text type="secondary">库存总量</Text>
                <div className="sd-dashboard-value">{balance.inventory.total}</div>
                <Space wrap>
                  <Tag>库存消费比 {balance.inventory.ratio}</Tag>
                  <Tag>周转 {balance.inventory.turnoverDays}天</Tag>
                </Space>
                {(balance.inventory.types || []).map((t) => (
                  <div key={t.type} style={{ marginTop: 8 }}>
                    <Text type="secondary">{t.type}</Text>
                    <Progress percent={Math.round(t.value / balance.inventory.total * 100)} size="small" strokeColor="#B32620" />
                  </div>
                ))}
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={14}>
              <div className="business-panel">
                <h3 className="business-panel-title">供需平衡动态 · 供给-需求-库存</h3>
                <div className="business-chart-box-sm">
                  <Line data={balanceChart} xField="period" yField="value" seriesField="series" height={260} smooth color={['#B32620', '#1677ff', '#52c41a']} />
                </div>
              </div>
            </Col>
            <Col xs={24} lg={10}>
              <div className="business-panel">
                <h3 className="business-panel-title">库存比率走势</h3>
                <div className="business-chart-box-sm">
                  <Line data={inventoryRatioChart} xField="period" yField="ratio" height={200} color="#52c41a" />
                </div>
                <h3 className="business-panel-title" style={{ marginTop: 12 }}>未来3月供需缺口</h3>
                {(balance.gap || []).map((g) => (
                  <div key={g.month} style={{ marginBottom: 10 }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>{g.month}</Text>
                      <Tag color={GAP_STATUS_COLORS[g.status]}>{g.status}</Tag>
                    </Space>
                    <Progress
                      percent={Math.min(100, Math.abs(g.gap) / 1.2)}
                      strokeColor={g.gap < 0 ? '#ff4d4f' : '#52c41a'}
                      format={() => `${g.gap > 0 ? '+' : ''}${g.gap}`}
                    />
                  </div>
                ))}
                <div className="business-chart-box-sm">
                  <Column data={gapChart} xField="month" yField="gap" height={120} color="#B32620" />
                </div>
              </div>
            </Col>
          </Row>

          <div className="business-panel">
            <h3 className="business-panel-title">市场状态迁移 · 紧平衡 → 过剩/短缺</h3>
            <Timeline
              items={(data.statusMigration || []).map((s) => ({
                color: GAP_STATUS_COLORS[s.status] === 'error' ? 'red' : GAP_STATUS_COLORS[s.status] === 'warning' ? 'orange' : 'green',
                children: (
                  <Space>
                    <Text strong>{s.month}</Text>
                    <Tag color={GAP_STATUS_COLORS[s.status]}>{s.status}</Tag>
                    <Text type="secondary">缺口 {s.gap > 0 ? '+' : ''}{s.gap}</Text>
                  </Space>
                ),
              }))}
            />
          </div>

          <div className="business-panel">
            <h3 className="business-panel-title">进出口热力图 · 区域贸易强度</h3>
            <div className="heatmap-grid">
              {(tradeHeatmap || []).map((cell) => (
                <div
                  key={cell.region}
                  className="heatmap-cell"
                  style={{ background: `rgba(179, 38, 32, ${0.35 + cell.intensity / 200})` }}
                >
                  <div className="region">{cell.region}</div>
                  <div style={{ fontSize: 12 }}>进口 {cell.import}</div>
                  <div style={{ fontSize: 12 }}>出口 {cell.export}</div>
                </div>
              ))}
            </div>
            <Button size="small" style={{ marginTop: 12 }} onClick={() => setWorkflowStep(2)}>进入失衡分析 →</Button>
          </div>
        </>
      )}

      {(workflowStep === 2 || workflowStep >= 3) && (
        <div className="business-panel">
          <h3 className="business-panel-title">供需失衡原因分析</h3>
          <Paragraph><Text strong>综合判断：</Text>{imbalance.summary}</Paragraph>
          <Row gutter={12}>
            {(imbalance.causes || []).map((c) => (
              <Col xs={24} sm={12} lg={6} key={c.reason} style={{ marginBottom: 12 }}>
                <Card size="small">
                  <Tag color={c.impact === '高' ? 'error' : c.impact === '中' ? 'warning' : 'default'}>{c.impact}影响</Tag>
                  <div style={{ fontWeight: 600, marginTop: 8 }}>{c.reason}</div>
                  <Text type="secondary">{c.desc}</Text>
                </Card>
              </Col>
            ))}
          </Row>
          <Button type="primary" size="small" onClick={() => setWorkflowStep(3)}>进入瓶颈模拟 →</Button>
        </div>
      )}

      {workflowStep === 3 && (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <div className="business-panel">
              <h3 className="business-panel-title"><NodeIndexOutlined /> 全供应链节点监控</h3>
              <Table rowKey="node" size="small" pagination={false} dataSource={nodes} columns={[
                { title: '节点', dataIndex: 'node', key: 'node' },
                { title: '指标', dataIndex: 'metric', width: 110 },
                { title: '数值', dataIndex: 'value', width: 90 },
                { title: '状态', dataIndex: 'status', width: 70, render: (v, r) => <Tag color={r.alert ? 'error' : 'success'}>{v}</Tag> },
              ]} />
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>
                监控港口排队、CAx集装箱可用性、货运量指数、PMI配送时间等指标，提前感知运输瓶颈。
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="business-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 className="business-panel-title" style={{ margin: 0 }}><ThunderboltOutlined /> 瓶颈传播模拟</h3>
                <Button type="primary" size="small" icon={<AlertOutlined />} onClick={handleSimulate}>启动模拟</Button>
              </div>
              <Alert type="warning" showIcon message={bottleneck.event} description={(bottleneck.affected || []).join(' · ')} style={{ marginBottom: 12 }} />
              {simulation?.ran && (
                <>
                  <Alert type="info" showIcon message={simulation.summary} style={{ marginBottom: 12 }} />
                  <div className="business-chart-box-sm">
                    <Column
                      data={simulation.heatmap || []}
                      xField="region"
                      yField="cost"
                      height={160}
                      color="#B32620"
                      label={{ position: 'top', text: (d) => `+${d.cost}%` }}
                    />
                  </div>
                  <div className="heatmap-grid" style={{ marginTop: 8 }}>
                    {(simulation.heatmap || []).map((cell) => (
                      <div
                        key={cell.region}
                        className="heatmap-cell"
                        style={{
                          background: `rgba(179,38,32,${Math.min(0.9, cell.intensity / 100)})`,
                          color: '#fff',
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{cell.region}</div>
                        <div style={{ fontSize: 12 }}>延迟 {cell.delay}天 · 成本+{cell.cost}%</div>
                      </div>
                    ))}
                  </div>
                  <Space wrap style={{ marginTop: 8 }}>
                    {(simulation.suggestions || []).map((s) => <Tag key={s} icon={<SafetyCertificateOutlined />}>{s}</Tag>)}
                  </Space>
                </>
              )}
              <Button size="small" style={{ marginTop: 12 }} onClick={() => setWorkflowStep(4)}>查看策略建议 →</Button>
            </div>
          </Col>
        </Row>
      )}

      {workflowStep === 4 && (
        <div className="business-panel">
          <h3 className="business-panel-title"><BulbOutlined /> 供应链策略建议</h3>
          <Paragraph type="secondary">基于供需缺口、失衡原因与瓶颈模拟，生成采购、生产、库存策略，支持一键采纳并记录。</Paragraph>
          <List
            dataSource={strategies}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="adopt" type="link" size="small" onClick={() => handleAdoptStrategy(item)}>采纳</Button>,
                ]}
              >
                <List.Item.Meta
                  title={<Space><Tag color={item.priority === '高' ? 'error' : 'warning'}>{item.type}</Tag>{item.action}</Space>}
                  description={item.detail}
                />
              </List.Item>
            )}
          />
          {strategyLog.length > 0 && (
            <>
              <Title level={5} style={{ marginTop: 16 }}>已采纳策略记录</Title>
              <Timeline
                items={strategyLog.slice(0, 5).map((e) => ({
                  children: (
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>{e.time}</Text>
                      <div>{e.action} — {e.detail?.slice(0, 60)}</div>
                    </div>
                  ),
                }))}
              />
            </>
          )}
        </div>
      )}
    </>
  )
}
