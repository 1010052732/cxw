import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Col,
  Drawer,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Line, Pie } from '@ant-design/charts'
import {
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  NodeIndexOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { handoffToAssessment, handoffToResponse } from '../../../../utils/riskHandoff'
import { pushRiskAlert } from '../riskStore'
import {
  RISK_LEVELS,
  RISK_TYPES,
  getRiskDisplayData,
} from '../../../../mock/risk'
import WorldMapHeatmap from '../../../../components/WorldMapHeatmap'

const { Text, Paragraph } = Typography

const statusColor = { 新触发: 'error', 已确认: 'processing', 处理中: 'warning', 已关闭: 'success' }
const levelColor = { 红色: 'error', 橙色: 'orange', 黄色: 'warning', 蓝色: 'processing' }

const DIMENSIONS = [
  { key: 'enterprise', label: '企业整体' },
  { key: 'europe', label: '欧洲业务部' },
  { key: 'america', label: '美洲业务部' },
  { key: 'project', label: '出口订单项目' },
]

export default function DisplayTab({ onGoCase, onGoAssessment, onGoResponse }) {
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState('全部')
  const [levelFilter, setLevelFilter] = useState('全部')
  const [timeFilter, setTimeFilter] = useState('7d')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [dimension, setDimension] = useState('enterprise')
  const [selectedTrack, setSelectedTrack] = useState(null)

  const data = useMemo(
    () => getRiskDisplayData({
      type: typeFilter,
      level: levelFilter === '紧急及高' ? '紧急及高' : null,
      status: statusFilter,
    }),
    [typeFilter, levelFilter, statusFilter],
  )

  const dimStats = data.stats[dimension] || data.stats.enterprise

  const trendData = useMemo(
    () => data.trend.flatMap((item) => [
      { date: item.date, value: item.high, type: '高风险' },
      { date: item.date, value: item.medium, type: '中风险' },
      { date: item.date, value: item.low, type: '低风险' },
    ]),
    [data.trend],
  )

  const levelPie = [
    { type: '红色', value: dimStats.red },
    { type: '橙色', value: dimStats.orange },
    { type: '黄色', value: dimStats.yellow },
    { type: '蓝色', value: dimStats.blue },
  ]

  return (
    <>
      <div className="business-filter-bar">
        <Space wrap>
          <Text>风险类型</Text>
          <Select value={typeFilter} style={{ width: 110 }} options={RISK_TYPES.map((v) => ({ value: v, label: v }))} onChange={setTypeFilter} />
          <Text>等级</Text>
          <Select
            value={levelFilter}
            style={{ width: 120 }}
            options={[...RISK_LEVELS.map((v) => ({ value: v, label: v })), { value: '紧急及高', label: '紧急及高' }]}
            onChange={setLevelFilter}
          />
          <Text>时间</Text>
          <Select value={timeFilter} style={{ width: 100 }} options={[{ value: '7d', label: '近7天' }, { value: '30d', label: '近30天' }]} onChange={setTimeFilter} />
        </Space>
        <Space>
          {onGoCase && <Button type="link" onClick={onGoCase}>风险案例库 →</Button>}
          {onGoAssessment && <Button type="link" icon={<ExperimentOutlined />} onClick={onGoAssessment}>送评估 →</Button>}
          {onGoResponse && <Button type="link" icon={<ThunderboltOutlined />} onClick={onGoResponse}>去应对 →</Button>}
        </Space>
      </div>

      <WorldMapHeatmap title="全球风险热力图" subtitle="世界地图展示 · 洲 → 国家 → 城市 → 区域风险详情" />

      <div className="business-filter-bar">
        <Space>
          <DashboardOutlined />
          <Text>仪表盘维度</Text>
          <Select value={dimension} style={{ width: 140 }} options={DIMENSIONS} onChange={setDimension} />
        </Space>
        <Space>
          <Text>未关闭预警</Text>
          <Text strong style={{ color: '#B32620', fontSize: 20 }}>{dimStats.open}</Text>
          <Tag>较上期 {dimStats.trend}</Tag>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title">各等级预警占比</h3>
            <div className="business-chart-box-sm">
              <Pie data={levelPie} angleField="value" colorField="type" height={220} radius={0.8} innerRadius={0.5} color={['#cf1322', '#fa541c', '#faad14', '#1677ff']} />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title">风险类型分布</h3>
            <div className="business-chart-box-sm">
              <Pie data={data.typeStats} angleField="value" colorField="type" height={220} radius={0.8} color={['#1677ff', '#B32620', '#D44A44', '#E56E69', '#F0928E', '#FAB6B3']} />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title">风险趋势变化</h3>
            <div className="business-chart-box-sm">
              <Line data={trendData} xField="date" yField="value" seriesField="type" height={220} smooth color={['#B32620', '#faad14', '#52c41a']} />
            </div>
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 className="business-panel-title" style={{ margin: 0 }}><DatabaseOutlined /> 风险预警追踪列表</h3>
          <Select value={statusFilter} style={{ width: 120 }} options={['全部', '新触发', '已确认', '处理中', '已关闭'].map((v) => ({ value: v, label: v }))} onChange={setStatusFilter} />
        </div>
        <Table
          rowKey="id"
          size="small"
          pagination={{ pageSize: 8 }}
          dataSource={data.tracking}
          onRow={(record) => ({
            onClick: () => setSelectedTrack(record),
            style: { cursor: 'pointer', background: selectedTrack?.id === record.id ? '#fff7f6' : undefined },
          })}
          columns={[
          { title: '风险主体', dataIndex: 'subject', key: 'subject' },
          { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
          { title: '等级', dataIndex: 'level', key: 'level', width: 60, render: (v) => <Tag color={levelColor[v]}>{v}</Tag> },
          { title: '触发时间', dataIndex: 'triggerTime', key: 'triggerTime', width: 140 },
          { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => <Tag color={statusColor[v]}>{v}</Tag> },
          { title: '部门', dataIndex: 'dept', key: 'dept', width: 80 },
          { title: '进度', dataIndex: 'progress', key: 'progress', width: 100, render: (v) => <Progress percent={v} size="small" strokeColor="#B32620" /> },
          {
            title: '流转',
            key: 'flow',
            width: 140,
            render: (_, r) => (
              <Space size={0}>
                <Button
                  type="link"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    pushRiskAlert({ id: r.id, title: r.subject, type: r.type, level: r.level === '红色' ? '红色' : r.level === '橙色' ? '橙色' : '黄色', status: '待评估' })
                    handoffToAssessment({ from: 'display-track', title: r.subject, type: r.type, alertId: r.id }, navigate)
                  }}
                >
                  评估
                </Button>
                <Button
                  type="link"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handoffToResponse({ from: 'display-track', title: r.subject, alertTitle: r.subject }, navigate)
                  }}
                >
                  应对
                </Button>
              </Space>
            ),
          },
        ]}
        />
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title"><NodeIndexOutlined /> 风险传播路径图</h3>
            <Paragraph type="secondary">{data.propagation.title}</Paragraph>
            <div className="policy-graph-canvas" style={{ height: 320 }}>
              {data.propagation.nodes.map((n) => (
                <div key={n.id} className="policy-graph-node" style={{ left: `${n.x}%`, top: `${n.y}%`, borderColor: n.impact === '高' ? '#cf1322' : '#faad14' }}>
                  {n.label}
                  <div style={{ fontSize: 10, color: '#8c8c8c' }}>{n.delay}</div>
                </div>
              ))}
              <svg className="policy-graph-edges">
                {data.propagation.edges.map((e, i) => {
                  const from = data.propagation.nodes.find((n) => n.id === e.from)
                  const to = data.propagation.nodes.find((n) => n.id === e.to)
                  if (!from || !to) return null
                  return <line key={i} x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`} stroke="#B32620" strokeWidth="2" markerEnd="url(#arrow)" />
                })}
              </svg>
            </div>
            <Paragraph><Text strong>应对建议：</Text>{data.propagation.suggestion}</Paragraph>
            <Space wrap style={{ marginTop: 8 }}>
              <Button
                type="primary"
                onClick={() => {
                  handoffToAssessment({
                    from: 'propagation',
                    title: data.propagation.title,
                    type: '供应链风险',
                    suggestedModel: 'fta',
                  }, navigate)
                }}
              >
                按传导路径评估
              </Button>
              <Button onClick={() => handoffToResponse({ from: 'propagation', title: data.propagation.title }, navigate)}>
                启动应对预案
              </Button>
            </Space>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">风险历史轨迹</h3>
            {(data.trajectories || []).map((tr) => (
              <div key={tr.id} style={{ marginBottom: 16 }}>
                <Text strong>{tr.title}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{tr.period}</Text>
                <Timeline
                  style={{ marginTop: 8 }}
                  items={tr.events.map((e) => ({
                    color: e.level === '红色' ? 'red' : e.level === '橙色' ? 'orange' : 'blue',
                    children: `${e.date} · ${e.event}`,
                  }))}
                />
              </div>
            ))}
            <Button block onClick={() => navigate('/risk/response?tab=archive')}>查看完整处置档案</Button>
            <Button block type="primary" style={{ marginTop: 8 }} onClick={() => onGoAssessment?.() || navigate('/risk/assessment')}>
              进入风险评估闭环 →
            </Button>
          </div>
        </Col>
      </Row>
    </>
  )
}
