import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { App, Button, Col, Descriptions, Drawer, Row, Select, Space, Table, Tag, Typography } from 'antd'
import { Column, Line, Pie } from '@ant-design/charts'
import {
  INITIAL_ALERTS,
  RISK_LEVELS,
  RISK_TREND_30D,
  RISK_TYPES,
  RISK_TYPE_STATS,
} from '../../../../mock/risk'
import WorldMapHeatmap from '../../../../components/WorldMapHeatmap'
import '../../business.css'

const { Text } = Typography
const levelColor = { 高: 'error', 中: 'warning', 低: 'success' }

export default function RiskSituationPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [levelFilter, setLevelFilter] = useState('全部')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentAlert, setCurrentAlert] = useState(null)

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((item) => {
        if (levelFilter !== '全部' && item.level !== levelFilter) return false
        if (typeFilter !== '全部' && item.type !== typeFilter) return false
        return true
      }),
    [alerts, levelFilter, typeFilter],
  )

  const trendData = useMemo(
    () =>
      RISK_TREND_30D.flatMap((item) => [
        { date: item.date, value: item.high, type: '高风险' },
        { date: item.date, value: item.medium, type: '中风险' },
        { date: item.date, value: item.low, type: '低风险' },
      ]),
    [],
  )

  const handleConfirm = (record) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === record.id ? { ...item, confirmed: true } : item)),
    )
    message.success('预警已确认，闪烁已消除')
  }

  const columns = [
    { title: '预警标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (v) => <Tag color={levelColor[v]}>{v}</Tag>,
    },
    { title: '区域', dataIndex: 'region', key: 'region', width: 90 },
    { title: '时间', dataIndex: 'time', key: 'time', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setCurrentAlert(record); setDrawerOpen(true) }}>
            详情
          </Button>
          {!record.confirmed && record.level === '高' && (
            <Button type="primary" size="small" onClick={() => handleConfirm(record)}>
              确认
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">风险态势感知</h1>
        <p className="page-description">全球风险实时监测 · 识别结果可视化 · 联动评估与应对</p>
      </div>

      <WorldMapHeatmap title="全球风险热力图" />

      <div className="business-filter-bar">
        <Space>
          <Text>风险等级</Text>
          <Select value={levelFilter} style={{ width: 100 }} options={RISK_LEVELS.map((v) => ({ label: v, value: v }))} onChange={setLevelFilter} />
          <Text>风险类型</Text>
          <Select value={typeFilter} style={{ width: 120 }} options={RISK_TYPES.map((v) => ({ label: v, value: v }))} onChange={setTypeFilter} />
        </Space>
        <Space>
          <Text type="secondary">共 {filteredAlerts.length} 条预警</Text>
          <Button type="link" onClick={() => navigate('/risk/identification?tab=monitoring')}>监测预警</Button>
          <Button type="link" onClick={() => navigate('/risk/identification?tab=display')}>信息展示</Button>
          <Button type="link" onClick={() => navigate('/risk/assessment')}>进入风险评估 →</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">风险预警列表</h3>
            <Table
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={filteredAlerts}
              pagination={{ pageSize: 6 }}
              rowClassName={(record) =>
                record.level === '高' && !record.confirmed ? 'risk-alert-blink' : ''
              }
            />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">风险类型统计</h3>
            <div className="business-chart-box-sm">
              <Pie
                data={RISK_TYPE_STATS}
                angleField="value"
                colorField="type"
                height={280}
                radius={0.8}
                innerRadius={0.5}
                label={{ type: 'outer' }}
                color={['#1677ff', '#B32620', '#D44A44', '#E56E69', '#F0928E', '#FAB6B3']}
              />
            </div>
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">近30天风险趋势</h3>
        <div className="business-chart-box">
          <Line
            data={trendData}
            xField="date"
            yField="value"
            seriesField="type"
            height={320}
            smooth
            color={['#B32620', '#faad14', '#52c41a']}
          />
        </div>
      </div>

      <Drawer
        title="预警详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
      >
        {currentAlert && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="预警编号">{currentAlert.id}</Descriptions.Item>
            <Descriptions.Item label="标题">{currentAlert.title}</Descriptions.Item>
            <Descriptions.Item label="类型">{currentAlert.type}</Descriptions.Item>
            <Descriptions.Item label="等级">
              <Tag color={levelColor[currentAlert.level]}>{currentAlert.level}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="区域">{currentAlert.region}</Descriptions.Item>
            <Descriptions.Item label="时间">{currentAlert.time}</Descriptions.Item>
            <Descriptions.Item label="详情">{currentAlert.detail}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}
