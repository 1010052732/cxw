import { useMemo, useState } from 'react'
import {
  App,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Column, Line, Scatter } from '@ant-design/charts'
import {
  EyeOutlined,
  RadarChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  PRODUCT_CATEGORIES,
  getCompetitionData,
} from '../../../../mock/analysis'
import { exportJsonAsTxt } from '../analysisExport'

const { Text, Paragraph } = Typography

export default function CompetitionTab({ country, category, onCategoryChange, onGoPolicy }) {
  const { message } = App.useApp()
  const [subTab, setSubTab] = useState('landscape')
  const [metric, setMetric] = useState('sales')

  const data = useMemo(() => getCompetitionData(country, category, metric), [country, category, metric])

  const shareHistoryLines = useMemo(
    () => (data.shareHistory || []).flatMap((h) => [
      { period: h.period, value: h.hhi, series: 'HHI指数' },
      { period: h.period, value: h.top3, series: 'CR3(%)' },
      { period: h.period, value: h.top5 || h.top3 + 14, series: 'CR5(%)' },
    ]),
    [data.shareHistory],
  )

  const landscapeTab = (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">HHI指数</Text>
            <div className="forecast-stat-value">{data.hhi}</div>
            <Tag color={data.hhi > 1800 ? 'error' : data.hhi > 1500 ? 'warning' : 'success'}>
              {data.hhi > 1800 ? '高度集中' : data.hhi > 1500 ? '中度集中' : '竞争充分'}
            </Tag>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">CR3</Text>
            <div className="forecast-stat-value">{data.cr3}%</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">CR5</Text>
            <div className="forecast-stat-value">{data.cr5}%</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="forecast-stat-card">
            <Text type="secondary">格局趋势</Text>
            <div className="forecast-stat-value" style={{ fontSize: 14 }}>{data.trend}</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>市场份额分布</h3>
              <Select
                size="small"
                value={metric}
                style={{ width: 120 }}
                options={[
                  { value: 'sales', label: '销售额口径' },
                  { value: 'volume', label: '销量口径' },
                  { value: 'import', label: '进口量口径' },
                ]}
                onChange={setMetric}
              />
            </div>
            {data.fallback && (
              <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
                当前品类竞争画像暂用相近市场模板（{data.dataScope}），口径切换仍生效
              </Paragraph>
            )}
            <div className="business-chart-box-sm">
              <Column
                data={data.shareChart}
                xField="name"
                yField="value"
                height={260}
                color={(d) => (d.isSelf ? '#B32620' : '#8c8c8c')}
                label={{ position: 'top', formatter: (v) => `${v.value}%` }}
              />
            </div>
            <Table
              rowKey="name"
              size="small"
              pagination={false}
              style={{ marginTop: 12 }}
              dataSource={data.competitors}
              columns={[
                { title: '竞争者', dataIndex: 'name', key: 'name', render: (v, r) => r.isSelf ? <Text strong style={{ color: '#B32620' }}>{v}</Text> : v },
                { title: '份额%', dataIndex: 'share', key: 'share', width: 70 },
                { title: '变化', dataIndex: 'shareTrend', key: 'shareTrend', width: 80, render: (v) => <Tag color={v >= 0 ? 'success' : 'error'}>{v > 0 ? '+' : ''}{v}ppt</Tag> },
              ]}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">集中度动态 · HHI / CR3 / CR5</h3>
            <div className="business-chart-box-sm">
              <Line data={shareHistoryLines} xField="period" yField="value" seriesField="series" height={260} smooth color={['#B32620', '#1677ff', '#52c41a']} />
            </div>
            <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              动态时间序列展示市场集中化趋势，识别头部垄断或新进入者扰动信号。
            </Paragraph>
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">竞争定位矩阵 · PCA 感知地图</h3>
        <Paragraph type="secondary">
          {data.pcaAxes
            ? `${data.pcaAxes.xLabel}（X） × ${data.pcaAxes.yLabel}（Y），气泡=品牌知名度`
            : '基于价格水平（X轴）与产品质量感知（Y轴），气泡大小代表品牌知名度'}
        </Paragraph>
        <div className="business-chart-box">
          <Scatter
            data={data.positioningScatter}
            xField="x"
            yField="y"
            sizeField="size"
            colorField="name"
            height={320}
            pointStyle={{ fillOpacity: 0.85 }}
            label={{ formatter: (d) => d.name }}
            xAxis={{ title: { text: data.pcaAxes?.xLabel || '价格水平 →' } }}
            yAxis={{ title: { text: data.pcaAxes?.yLabel || '质量感知 →' } }}
          />
        </div>
        <Row gutter={12} style={{ marginTop: 12 }}>
          {data.positioning?.map((p) => (
            <Col xs={12} sm={8} lg={4} key={p.name}>
              <Card size="small" className={p.isSelf ? 'forecast-scenario-active' : ''}>
                <Text strong style={p.isSelf ? { color: '#B32620' } : undefined}>{p.name}</Text>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                  渠道{p.channel} · 服务{p.service}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </>
  )

  const monitorTab = (
    <>
      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>全渠道情报监听 · 7×24</h3>
              <Badge status="processing" text="实时更新" />
            </div>
            <Timeline
              items={(data.intelFeed || []).map((item) => ({
                color: item.type.includes('新品') ? 'green' : item.type.includes('促销') ? 'orange' : 'blue',
                children: (
                  <div>
                    <Space wrap>
                      <Tag>{item.source}</Tag>
                      <Tag color="processing">{item.type}</Tag>
                      <Text type="secondary">{item.date}</Text>
                    </Space>
                    <div style={{ marginTop: 4 }}><Text strong>{item.competitor}</Text> · {item.title}</div>
                  </div>
                ),
              }))}
            />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">战略意图推断 · {data.strategyReport?.month}</h3>
            <Paragraph>{data.strategyReport?.summary}</Paragraph>
            {(data.strategyReport?.intents || []).map((intent) => (
              <Card key={intent.competitor} size="small" style={{ marginBottom: 8 }}>
                <Space direction="vertical" size={4}>
                  <Text strong>{intent.competitor}</Text>
                  <Text>{intent.intent}</Text>
                  <Space>
                    <Tag color="blue">置信度 {intent.confidence}%</Tag>
                    <Text type="secondary">信号：{intent.signal}</Text>
                  </Space>
                </Space>
              </Card>
            ))}
            <Button
              type="primary"
              block
              icon={<ThunderboltOutlined />}
              onClick={() => {
                exportJsonAsTxt(
                  `strategy-intent-${data.strategyReport?.month || 'report'}.txt`,
                  {
                    month: data.strategyReport?.month,
                    summary: data.strategyReport?.summary,
                    intents: data.strategyReport?.intents,
                    generatedAt: new Date().toISOString(),
                  },
                )
                message.success('月度战略意图分析报告已导出')
              }}
            >
              生成完整分析报告
            </Button>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">价格与促销追踪</h3>
            <div className="business-chart-box-sm">
              <Line data={data.priceLines || []} xField="month" yField="price" seriesField="series" height={240} smooth color={['#B32620', '#1677ff', '#52c41a']} />
            </div>
            <Table
              rowKey="date"
              size="small"
              pagination={false}
              style={{ marginTop: 12 }}
              dataSource={data.promoCalendar || []}
              columns={[
                { title: '时间', dataIndex: 'date', key: 'date', width: 90 },
                { title: '竞品', dataIndex: 'competitor', key: 'competitor', width: 90 },
                { title: '促销活动', dataIndex: 'event', key: 'event' },
              ]}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">供应链与物流分析</h3>
            <Table
              rowKey="competitor"
              size="small"
              pagination={false}
              dataSource={data.supplyChain || []}
              columns={[
                { title: '竞品', dataIndex: 'competitor', key: 'competitor', width: 90 },
                { title: '核心供应商', dataIndex: 'supplier', key: 'supplier' },
                { title: '来源', dataIndex: 'origin', key: 'origin', width: 90 },
                { title: '采购频率', dataIndex: 'freq', key: 'freq', width: 90 },
                { title: '物流路径', dataIndex: 'route', key: 'route' },
                { title: '成本', dataIndex: 'cost', key: 'cost', width: 60, render: (v) => <Tag>{v}</Tag> },
              ]}
            />
            <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
              基于海关提单推断供应商来源与物流路径，辅助供应链对标与成本估算。
            </Paragraph>
          </div>
        </Col>
      </Row>

      {(data.billOfLading || []).length > 0 && (
        <div className="business-panel">
          <h3 className="business-panel-title">海关提单明细 · BOL 级追踪</h3>
          <Table
            rowKey="blNo"
            size="small"
            pagination={false}
            dataSource={data.billOfLading}
            columns={[
              { title: '提单号', dataIndex: 'blNo', key: 'blNo', width: 120 },
              { title: '发货人', dataIndex: 'shipper', key: 'shipper' },
              { title: '收货人', dataIndex: 'consignee', key: 'consignee' },
              { title: 'HS', dataIndex: 'hs', key: 'hs', width: 70 },
              { title: '柜量', dataIndex: 'containers', key: 'containers', width: 70 },
              { title: '航线', dataIndex: 'route', key: 'route' },
              { title: 'ETA', dataIndex: 'eta', key: 'eta', width: 100 },
            ]}
          />
        </div>
      )}
    </>
  )

  return (
    <>
      <div className="business-filter-bar">
        <Space wrap>
          <Text>分析品类</Text>
          <Select value={category} style={{ width: 140 }} options={PRODUCT_CATEGORIES} onChange={onCategoryChange} />
        </Space>
        <Space>
          <Button type="link" onClick={() => setSubTab(subTab === 'landscape' ? 'monitor' : 'landscape')}>
            {subTab === 'landscape' ? '深度监控 →' : '← 格局测绘'}
          </Button>
          {onGoPolicy && (
            <Button type="link" onClick={onGoPolicy}>政策法规解读 →</Button>
          )}
        </Space>
      </div>

      <Tabs
        activeKey={subTab}
        onChange={setSubTab}
        items={[
          { key: 'landscape', label: <span><RadarChartOutlined /> 竞争格局量化测绘</span>, children: landscapeTab },
          { key: 'monitor', label: <span><EyeOutlined /> 竞争对手深度监控</span>, children: monitorTab },
        ]}
      />
    </>
  )
}
