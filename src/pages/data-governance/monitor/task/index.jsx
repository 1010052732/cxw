import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Breadcrumb,
  Button,
  Col,
  Descriptions,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Line } from '@ant-design/charts'
import {
  ArrowLeftOutlined,
  DatabaseOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { formatModuleTags } from '../../../../mock/data-bridge'
import {
  getCollectionTaskDetail,
  getHealthColor,
  getLogStatusTag,
  getStageStatusTag,
  getStatusTag,
  getTaskStatusTag,
  buildQualityCleanUrl,
} from '../../../../mock/data-governance'
import '../../data-governance.css'

const { Text, Paragraph, Title } = Typography

export default function CollectionTaskDetailPage() {
  const navigate = useNavigate()
  const { taskId } = useParams()

  const detail = useMemo(() => getCollectionTaskDetail(taskId), [taskId])

  if (!detail) {
    return (
      <div className="data-gov-page">
        <div className="business-page-header">
          <h1 className="page-title">采集任务不存在</h1>
          <p className="page-description">任务 ID「{taskId}」未在队列中找到，请从采集监控返回重试</p>
        </div>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/data/monitor')}>
          返回采集监控
        </Button>
      </div>
    )
  }

  const { task, source, logs, alerts, recentTrend, summary } = detail
  const statusTag = getTaskStatusTag(task.status)
  const downstreamTags = source ? formatModuleTags(source.id) : []

  const logColumns = [
    { title: '任务编号', dataIndex: 'taskId', key: 'taskId', width: 100 },
    { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 150 },
    { title: '耗时', dataIndex: 'duration', key: 'duration', width: 80 },
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
    { title: '数据量', dataIndex: 'dataSize', key: 'dataSize', width: 90 },
  ]

  return (
    <div className="data-gov-page">
      <div className="business-page-header">
        <Space direction="vertical" size={4}>
          <Breadcrumb
            items={[
              { title: <span style={{ cursor: 'pointer' }} onClick={() => navigate('/data/config')}>数据源配置</span> },
              { title: <span style={{ cursor: 'pointer' }} onClick={() => navigate('/data/monitor')}>采集监控</span> },
              { title: task.source },
            ]}
          />
          <Title level={3} style={{ margin: 0 }}>
            <DatabaseOutlined style={{ marginRight: 8, color: '#B32620' }} />
            {task.source} · 采集详情
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            任务 {task.taskNo}（{task.id}）· {task.schedule} · 负责人 {summary.owner}
          </Paragraph>
        </Space>
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/data/monitor')}>返回监控</Button>
          {source && (
            <Button icon={<SettingOutlined />} onClick={() => navigate(`/data/config?source=${source.id}`)}>
              数据源配置
            </Button>
          )}
          <Button type="primary" onClick={() => navigate(buildQualityCleanUrl({ sourceId: task.sourceId, from: 'task' }))}>进入数据清洗</Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <div className="business-panel collection-task-stat">
            <Statistic title="采集进度" value={task.progress} suffix="%" valueStyle={{ color: '#B32620' }} />
            <Progress
              percent={task.progress}
              size="small"
              strokeColor={task.status === 'warning' ? '#faad14' : '#B32620'}
              style={{ marginTop: 8 }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="business-panel collection-task-stat">
            <Statistic
              title="已采集 / 目标"
              value={
                task.targetRecords != null
                  ? `${task.collectedRecords.toLocaleString()} / ${task.targetRecords.toLocaleString()}`
                  : `${task.collectedRecords.toLocaleString()}（实时流）`
              }
            />
            <Tag color={statusTag.color} style={{ marginTop: 8 }}>{statusTag.text}</Tag>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="business-panel collection-task-stat">
            <Statistic title="并发线程" value={task.threads} suffix="个" />
            <Text type="secondary" style={{ fontSize: 12 }}>吞吐 {task.throughput}</Text>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="business-panel collection-task-stat">
            <Statistic title="成功率" value={summary.successRate} />
            <Text type="secondary" style={{ fontSize: 12 }}>平均耗时 {summary.latency}</Text>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">任务执行信息</h3>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="队列 ID">{task.id}</Descriptions.Item>
              <Descriptions.Item label="任务编号">{task.taskNo}</Descriptions.Item>
              <Descriptions.Item label="数据源">{task.source}</Descriptions.Item>
              <Descriptions.Item label="数据源 ID">{task.sourceId}</Descriptions.Item>
              <Descriptions.Item label="调度策略">{task.schedule}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={task.priority === '高' ? 'error' : 'default'}>{task.priority}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">{task.startTime}</Descriptions.Item>
              <Descriptions.Item label="预计完成">{task.eta}</Descriptions.Item>
              {source && (
                <>
                  <Descriptions.Item label="健康度">
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: getHealthColor(source.health), marginRight: 6 }} />
                    {getStatusTag(source.status).text}
                  </Descriptions.Item>
                  <Descriptions.Item label="今日采集量">{summary.todayVolume}</Descriptions.Item>
                  <Descriptions.Item label="接入协议">{source.protocol}</Descriptions.Item>
                  <Descriptions.Item label="采集频率">{source.frequency}</Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="下游模块" span={2}>
                {downstreamTags.length ? (
                  <Space size={4} wrap>
                    {downstreamTags.map((m) => (
                      <Tag key={m.route} style={{ cursor: 'pointer' }} onClick={() => navigate(m.route)}>{m.label}</Tag>
                    ))}
                  </Space>
                ) : '—'}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">近期采集吞吐</h3>
            <div className="business-chart-box-sm">
              <Line data={recentTrend} xField="time" yField="value" height={220} color="#B32620" smooth point={{ size: 3 }} />
            </div>
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">关联采集日志</h3>
            <Table rowKey="id" size="small" columns={logColumns} dataSource={logs} pagination={{ pageSize: 5 }} />
            <Button type="link" block onClick={() => navigate('/data/monitor?tab=logs')}>查看全部采集日志 →</Button>
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">采集流水线阶段</h3>
            <Timeline
              items={task.stages.map((stage) => {
                const stageTag = getStageStatusTag(stage.status)
                return {
                  color: stage.status === 'warning' ? 'orange' : stage.status === 'done' ? 'green' : stage.status === 'running' ? 'blue' : 'gray',
                  children: (
                    <div>
                      <Space wrap>
                        <Text strong>{stage.name}</Text>
                        <Tag color={stageTag.color}>{stageTag.text}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>{stage.time}</Text>
                      </Space>
                      <div style={{ color: '#595959', fontSize: 13, marginTop: 4 }}>{stage.detail}</div>
                    </div>
                  ),
                }
              })}
            />
          </div>

          {alerts.length > 0 && (
            <div className="business-panel" style={{ marginTop: 16 }}>
              <h3 className="business-panel-title"><ThunderboltOutlined /> 关联异常预警</h3>
              {alerts.map((alert) => (
                <div key={alert.id} className={`monitor-alert-${alert.level}`} style={{ padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <Space wrap>
                    <Tag color={alert.level === 'error' ? 'error' : alert.level === 'warning' ? 'warning' : 'processing'}>
                      {alert.level === 'error' ? '高' : alert.level === 'warning' ? '中' : '信息'}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{alert.time}</Text>
                  </Space>
                  <div style={{ marginTop: 6 }}>{alert.message}</div>
                  {alert.selfHeal && (
                    <div style={{ marginTop: 4, color: alert.selfHealed ? '#52c41a' : '#faad14', fontSize: 12 }}>
                      自愈：{alert.selfHeal}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">快捷操作</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block onClick={() => navigate(buildQualityCleanUrl({ sourceId: task.sourceId, from: 'task' }))}>查看清洗批次</Button>
              <Button block onClick={() => navigate('/data/storage')}>查看存储策略</Button>
              <Button block type="primary" onClick={() => navigate('/data/monitor?tab=alerts')}>异常预警中心</Button>
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  )
}
