import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Col,
  Drawer,
  Input,
  List,
  Progress,
  Row,
  Segmented,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import { Column, Line, Pie } from '@ant-design/charts'
import {
  CheckCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  COLLECTION_LOGS,
  INITIAL_DATA_SOURCES,
  MONITOR_ALERTS,
  MONITOR_TREND,
  TASK_QUEUE,
  TASK_STATUS_STATS,
  buildQualityCleanUrl,
  getHealthColor,
  getSourceNameById,
  getLogStatusTag,
  getStatusTag,
} from '../../../mock/data-governance'
import { formatModuleTags, getDownstreamConsumption, getPlatformMetrics } from '../../../mock/data-bridge'
import DataWorkflowBar from '../DataWorkflowBar'
import '../data-governance.css'

const { Text } = Typography
const alertLevelMap = { warning: 'monitor-alert-warning', error: 'monitor-alert-error', info: 'monitor-alert-info' }

export default function DataMonitorPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'
  const [timeRange, setTimeRange] = useState('today')
  const [alerts, setAlerts] = useState(MONITOR_ALERTS)
  const [logs] = useState(COLLECTION_LOGS)
  const [logKeyword, setLogKeyword] = useState('')
  const [logDrawerOpen, setLogDrawerOpen] = useState(false)
  const [currentLog, setCurrentLog] = useState(null)

  useEffect(() => {
    const cleaned = searchParams.get('cleaned')
    if (!cleaned) return
    setAlerts((prev) => {
      const hasOpen = prev.some((a) => a.sourceId === cleaned && !a.handled)
      if (!hasOpen) return prev
      return prev.map((a) => (a.sourceId === cleaned ? { ...a, handled: true } : a))
    })
    message.success(`${getSourceNameById(cleaned)} 数据清洗已完成，相关预警已确认关闭`)
    const tab = searchParams.get('tab') || 'alerts'
    setSearchParams({ tab }, { replace: true })
  }, [searchParams, message, setSearchParams])

  const trendData = useMemo(() => MONITOR_TREND[timeRange] || MONITOR_TREND.today, [timeRange])

  const overview = useMemo(() => {
    const active = INITIAL_DATA_SOURCES.filter((d) => d.enabled)
    const metrics = getPlatformMetrics()
    const totalVolume = metrics.todayCollectionWan
    const avgLatency = active.length
      ? Math.round((active.reduce((s, d) => s + d.latency, 0) / active.length) * 10) / 10
      : 0
    const avgFail = active.length
      ? Math.round((active.reduce((s, d) => s + d.failRate, 0) / active.length) * 10) / 10
      : 0
    const greenCount = INITIAL_DATA_SOURCES.filter((d) => d.health === 'green' && d.enabled).length
    return {
      totalVolume,
      avgLatency,
      avgFail,
      activeCount: active.length,
      greenCount,
      metrics,
    }
  }, [])

  const downstreamModules = useMemo(
    () => getDownstreamConsumption(overview.metrics),
    [overview.metrics],
  )

  const filteredLogs = useMemo(
    () =>
      logs.filter(
        (log) =>
          !logKeyword ||
          `${log.sourceName}${log.taskId}${log.operator}${log.params}`.includes(logKeyword),
      ),
    [logs, logKeyword],
  )

  const handleSelfHeal = (alert) => {
    message.loading({ content: '正在尝试自愈...', key: 'heal' })
    setTimeout(() => {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alert.id
            ? { ...a, selfHealed: true, selfHeal: '已切换备用接口/代理节点，采集恢复', handled: true }
            : a,
        ),
      )
      message.success({ content: '自愈成功，采集任务已恢复', key: 'heal' })
    }, 1200)
  }

  const handleConfirmAlert = (alert) => {
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, handled: true } : a)))
    message.success('告警已确认处理')
  }

  const taskColumns = [
    { title: '数据源', dataIndex: 'name', key: 'name', ellipsis: true },
    {
      title: '健康度',
      dataIndex: 'health',
      key: 'health',
      width: 80,
      render: (h) => (
        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: getHealthColor(h) }} />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v) => {
        const s = getStatusTag(v)
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    { title: '今日采集（万条）', dataIndex: 'todayVolume', key: 'todayVolume', width: 120 },
    { title: '成功率', key: 'successRate', width: 80, render: (_, r) => `${(100 - r.failRate).toFixed(1)}%` },
    { title: '平均耗时(s)', dataIndex: 'latency', key: 'latency', width: 100 },
    { title: '最后同步', dataIndex: 'lastSync', key: 'lastSync', width: 150 },
    {
      title: '下游模块',
      key: 'downstream',
      width: 180,
      render: (_, record) => {
        const tags = formatModuleTags(record.id)
        if (!tags.length) return '—'
        return (
          <Space size={4} wrap>
            {tags.map((m) => (
              <Tag key={m.route} style={{ cursor: 'pointer', margin: 0 }} onClick={() => navigate(m.route)}>
                {m.label}
              </Tag>
            ))}
          </Space>
        )
      },
    },
  ]

  const logColumns = [
    { title: '任务ID', dataIndex: 'taskId', key: 'taskId', width: 100 },
    { title: '数据源', dataIndex: 'sourceName', key: 'sourceName', width: 150, ellipsis: true },
    { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 150 },
    { title: '耗时', dataIndex: 'duration', key: 'duration', width: 80 },
    { title: '操作主体', dataIndex: 'operator', key: 'operator', width: 110 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v) => {
        const s = getLogStatusTag(v)
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    { title: '采集条目', dataIndex: 'records', key: 'records', width: 90 },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => { setCurrentLog(record); setLogDrawerOpen(true) }}>
          详情
        </Button>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'dashboard',
      label: '实时仪表盘',
      children: (
        <>
          <div className="business-panel" style={{ marginBottom: 16 }}>
            <h3 className="business-panel-title">数据源连接拓扑（健康度）</h3>
            <div className="source-topology-grid">
              {INITIAL_DATA_SOURCES.filter((d) => d.enabled).map((node) => (
                <div key={node.id} className={`source-topology-node health-${node.health}`}>
                  <div className="node-name" title={node.name}>{node.name}</div>
                  <div className="node-status">
                    <Tag color={getStatusTag(node.status).color} style={{ marginBottom: 4 }}>
                      {getStatusTag(node.status).text}
                    </Tag>
                  </div>
                  <div className="node-status">{node.frequency} · {node.todayVolume}万条</div>
                </div>
              ))}
            </div>
            <Space style={{ marginTop: 12 }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#52c41a', marginRight: 4 }} />正常</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#faad14', marginRight: 4 }} />预警</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#ff4d4f', marginRight: 4 }} />异常</span>
            </Space>
          </div>

          <Row gutter={16}>
            <Col xs={24} lg={14}>
              <div className="business-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 className="business-panel-title" style={{ margin: 0 }}>采集吞吐趋势</h3>
                  <Segmented
                    value={timeRange}
                    onChange={setTimeRange}
                    options={[{ value: 'today', label: '今日' }, { value: 'week', label: '本周' }]}
                  />
                </div>
                <div className="business-chart-box">
                  <Line data={trendData} xField="time" yField="value" height={300} color="#B32620" smooth point={{ size: 4 }} />
                </div>
              </div>
            </Col>
            <Col xs={24} lg={10}>
              <div className="business-panel">
                <h3 className="business-panel-title">采集任务队列</h3>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>点击任务查看采集详情</Text>
                {TASK_QUEUE.map((task) => (
                  <div
                    key={task.id}
                    className="task-queue-item task-queue-item-clickable"
                    onClick={() => navigate(`/data/monitor/task/${task.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/data/monitor/task/${task.id}`)}
                  >
                    <div style={{ flex: 1 }}>
                      <Text ellipsis style={{ display: 'block', maxWidth: 200 }}>{task.source}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{task.taskNo}</Text>
                      <Progress
                        percent={task.progress}
                        size="small"
                        strokeColor={task.status === 'warning' ? '#faad14' : '#B32620'}
                      />
                    </div>
                    <Tag>{task.threads} 线程</Tag>
                    <Tag color={task.status === 'warning' ? 'warning' : task.status === 'waiting' ? 'default' : 'success'}>
                      {task.status === 'waiting' ? '等待' : task.status === 'warning' ? '异常' : '运行'}
                    </Tag>
                  </div>
                ))}
                <h3 className="business-panel-title" style={{ marginTop: 16 }}>任务状态分布</h3>
                <div style={{ height: 200 }}>
                  <Pie
                    data={TASK_STATUS_STATS}
                    angleField="value"
                    colorField="status"
                    height={200}
                    radius={0.9}
                    innerRadius={0.5}
                    legend={{ position: 'bottom' }}
                    color={['#B32620', '#faad14', '#ff4d4f', '#52c41a']}
                  />
                </div>
              </div>
            </Col>
          </Row>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">数据源运行明细</h3>
            <Table rowKey="id" size="small" columns={taskColumns} dataSource={INITIAL_DATA_SOURCES.filter((d) => d.enabled)} pagination={false} />
          </div>
        </>
      ),
    },
    {
      key: 'logs',
      label: '采集日志',
      children: (
        <div className="business-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="business-panel-title" style={{ margin: 0 }}>全量采集日志（审计追溯）</h3>
            <Input
              placeholder="搜索任务ID/数据源/操作人"
              style={{ width: 260 }}
              value={logKeyword}
              onChange={(e) => setLogKeyword(e.target.value)}
              allowClear
            />
          </div>
          <Table
            rowKey="id"
            size="small"
            columns={logColumns}
            dataSource={filteredLogs}
            pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 条日志` }}
          />
        </div>
      ),
    },
    {
      key: 'alerts',
      label: '异常预警',
      children: (
        <div className="business-panel">
          <h3 className="business-panel-title">异常预警与自愈</h3>
          <List
            dataSource={alerts}
            renderItem={(item) => (
              <List.Item
                className={alertLevelMap[item.level]}
                style={{ padding: '16px 12px', marginBottom: 8, borderRadius: 8 }}
                actions={[
                  !item.handled && item.level !== 'info' && !item.selfHealed && (
                    <Button
                      key="heal"
                      type="primary"
                      size="small"
                      icon={<ThunderboltOutlined />}
                      onClick={() => handleSelfHeal(item)}
                    >
                      触发自愈
                    </Button>
                  ),
                  !item.handled && (
                    <Button
                      key="quality"
                      size="small"
                      onClick={() => navigate(buildQualityCleanUrl({ sourceId: item.sourceId, from: 'alert' }))}
                    >
                      数据清洗
                    </Button>
                  ),
                  !item.handled && (
                    <Button key="confirm" size="small" icon={<CheckCircleOutlined />} onClick={() => handleConfirmAlert(item)}>
                      确认处理
                    </Button>
                  ),
                  item.handled && <Tag color="success">已处理</Tag>,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={item.level === 'error' ? 'error' : item.level === 'warning' ? 'warning' : 'processing'}>
                        {item.level === 'error' ? '高优先级' : item.level === 'warning' ? '中优先级' : '信息'}
                      </Tag>
                      <Text strong>{item.source}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                    </Space>
                  }
                  description={
                    <>
                      <div>{item.message}</div>
                      {item.selfHeal && (
                        <div style={{ marginTop: 6, color: item.selfHealed ? '#52c41a' : '#faad14' }}>
                          <ThunderboltOutlined /> 自愈：{item.selfHeal}
                        </div>
                      )}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="data-gov-page">
      <div className="business-page-header">
        <h1 className="page-title">采集监控仪表盘</h1>
        <p className="page-description">全流程采集监控 · 拓扑健康度 · 日志审计 · 异常预警与自愈</p>
      </div>

      <DataWorkflowBar active="monitor" />

      <div className="business-stat-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="business-stat-card">
          <div className="value">{overview.totalVolume}</div>
          <div className="label">今日采集量（万条）</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{overview.avgLatency}s</div>
          <div className="label">平均耗时</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{overview.avgFail}%</div>
          <div className="label">平均失败率</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{overview.greenCount}/{overview.activeCount}</div>
          <div className="label">健康/活跃源</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{alerts.filter((a) => !a.handled).length}</div>
          <div className="label">待处理告警</div>
        </div>
      </div>

      <div className="business-panel" style={{ marginBottom: 16 }}>
        <h3 className="business-panel-title">清洗后数据 · 业务模块消费概览</h3>
        <Row gutter={[12, 12]}>
          {downstreamModules.map((item) => (
            <Col xs={24} sm={12} md={8} lg={4} key={item.key}>
              <div
                style={{ background: '#fafafa', borderRadius: 8, padding: 12, border: '1px solid #f0f0f0', cursor: 'pointer', height: '100%' }}
                onClick={() => navigate(item.route)}
              >
                <Text strong>{item.module}</Text>
                <div style={{ color: '#B32620', marginTop: 4 }}>{item.metric}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.pool}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setSearchParams(key === 'dashboard' ? {} : { tab: key }, { replace: true })}
        items={tabItems}
      />

      <Drawer title="采集日志详情" open={logDrawerOpen} onClose={() => setLogDrawerOpen(false)} width={600}>
        {currentLog && (
          <>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={getLogStatusTag(currentLog.status).color}>{getLogStatusTag(currentLog.status).text}</Tag>
              <Text type="secondary">{currentLog.taskId}</Text>
            </Space>
            <DescriptionsBlock log={currentLog} />
          </>
        )}
      </Drawer>
    </div>
  )
}

function DescriptionsBlock({ log }) {
  return (
    <div style={{ lineHeight: 2 }}>
      <div><Text strong>数据源：</Text>{log.sourceName} ({log.sourceId})</div>
      <div><Text strong>起止时间：</Text>{log.startTime} → {log.endTime}（{log.duration}）</div>
      <div><Text strong>操作主体：</Text>{log.operator}</div>
      <div><Text strong>访问IP：</Text>{log.ip}</div>
      <div><Text strong>请求参数：</Text><code>{log.params}</code></div>
      <div><Text strong>响应摘要：</Text>{log.response}</div>
      <div><Text strong>采集条目：</Text>{log.records} 条 · {log.dataSize}</div>
      {log.error && (
        <div className="log-error-text"><Text strong>异常信息：</Text>{log.error}</div>
      )}
    </div>
  )
}
