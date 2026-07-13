import { useMemo, useState } from 'react'
import {
  App,
  Alert,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Column, Line } from '@ant-design/charts'
import {
  AlertOutlined,
  CloudDownloadOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { getSupplyDemandData } from '../../../../mock/analysis'

const { Text, Paragraph } = Typography

const statusColor = { 短缺: 'error', 紧平衡: 'warning', 过剩: 'default', 严重过剩: 'processing' }

export default function SupplyDemandTab({ productName, onGoBarrier }) {
  const { message } = App.useApp()
  const [simulated, setSimulated] = useState(false)

  const data = useMemo(() => getSupplyDemandData(productName), [productName])
  const { balance, imbalance, tradeHeatmap, nodes, bottleneck } = data

  const balanceChart = useMemo(
    () => (balance.history || []).flatMap((h) => [
      { period: h.period, value: h.supply, series: '供给' },
      { period: h.period, value: h.demand, series: '需求' },
      { period: h.period, value: h.inventory, series: '库存' },
    ]),
    [balance.history],
  )

  const gapChart = (balance.gap || []).map((g) => ({ month: g.month, gap: g.gap, status: g.status }))

  const handleSimulate = () => {
    setSimulated(true)
    message.success('供应链瓶颈传播模拟已完成')
  }

  return (
    <>
      <div className="business-filter-bar">
        <Space>
          <Text>当前商品</Text>
          <Tag color="processing">{productName}</Tag>
          <Tag color={balance.marketStatus === '供不应求' ? 'error' : 'warning'}>{balance.marketStatus}</Tag>
        </Space>
        <Space>
          <Button icon={<CloudDownloadOutlined />} onClick={() => message.success('供需报告已导出')}>导出报告</Button>
          {onGoBarrier && <Button type="link" onClick={onGoBarrier}>贸易壁垒分析 →</Button>}
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="多源数据融合"
        description="整合官方统计、行业协会、卫星遥感、表观消费量及全链条库存数据，低透明度市场采用间接指标+专家修正。"
      />

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
                { title: '占比', dataIndex: 'share', key: 'share', width: 50, render: (v) => `${v}%` },
                { title: '增速', dataIndex: 'growth', key: 'growth', width: 50, render: (v) => <Tag color="success">+{v}%</Tag> },
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
            <h3 className="business-panel-title">未来3月供需缺口</h3>
            {(balance.gap || []).map((g) => (
              <div key={g.month} style={{ marginBottom: 12 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text>{g.month}</Text>
                  <Tag color={statusColor[g.status]}>{g.status}</Tag>
                </Space>
                <Progress
                  percent={Math.min(100, Math.abs(g.gap) / 2)}
                  strokeColor={g.gap < 0 ? '#ff4d4f' : '#52c41a'}
                  format={() => `${g.gap > 0 ? '+' : ''}${g.gap}`}
                />
              </div>
            ))}
            <div className="business-chart-box-sm">
              <Column data={gapChart} xField="month" yField="gap" height={140} color="#B32620" />
            </div>
          </div>
        </Col>
      </Row>

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
      </div>

      <div className="business-panel">
        <h3 className="business-panel-title">供需失衡原因分析</h3>
        <Paragraph><Text strong>综合判断：</Text>{imbalance.summary}</Paragraph>
        <Row gutter={12}>
          {(imbalance.causes || []).map((c) => (
            <Col xs={24} sm={12} lg={6} key={c.reason}>
              <Card size="small">
                <Tag color={c.impact === '高' ? 'error' : c.impact === '中' ? 'warning' : 'default'}>{c.impact}影响</Tag>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{c.reason}</div>
                <Text type="secondary">{c.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title"><NodeIndexOutlined /> 全供应链节点监控</h3>
            <Table rowKey="node" size="small" pagination={false} dataSource={nodes} columns={[
              { title: '节点', dataIndex: 'node', key: 'node' },
              { title: '指标', dataIndex: 'metric', key: 'metric', width: 100 },
              { title: '数值', dataIndex: 'value', key: 'value', width: 90 },
              { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: (v, r) => <Tag color={r.alert ? 'error' : 'success'}>{v}</Tag> },
            ]} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}><ThunderboltOutlined /> 瓶颈传播模拟</h3>
              <Button type="primary" size="small" icon={<AlertOutlined />} onClick={handleSimulate}>启动模拟</Button>
            </div>
            <Alert type="warning" showIcon message={bottleneck.event} description={(bottleneck.affected || []).join(' · ')} style={{ marginBottom: 12 }} />
            {simulated && (bottleneck.simulation || []).length > 0 && (
              <>
                <div className="business-chart-box-sm">
                  <Column
                    data={bottleneck.simulation}
                    xField="region"
                    yField="costUp"
                    height={180}
                    color="#B32620"
                    label={{ position: 'top', formatter: (d) => `+${d.costUp}%` }}
                  />
                </div>
                <Paragraph type="secondary">延迟与成本上升热力分布</Paragraph>
              </>
            )}
            <Space wrap style={{ marginTop: 8 }}>
              {(bottleneck.suggestions || []).map((s) => <Tag key={s} icon={<SafetyCertificateOutlined />}>{s}</Tag>)}
            </Space>
          </div>
        </Col>
      </Row>
    </>
  )
}
