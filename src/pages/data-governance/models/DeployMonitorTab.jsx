import { useState } from 'react'
import {
  App,
  Alert,
  Button,
  Col,
  Descriptions,
  Modal,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  CloudUploadOutlined,
  RollbackOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Line } from '@ant-design/charts'
import {
  MODEL_DRIFT_ALERTS,
  MODEL_REGISTRY,
} from '../../../mock/model-algorithm'
import { getAllTrainJobs } from './modelAlgorithmStore'

const { Text } = Typography

const monitorTrend = [
  { hour: '08:00', calls: 120, latency: 180 },
  { hour: '10:00', calls: 280, latency: 165 },
  { hour: '12:00', calls: 420, latency: 190 },
  { hour: '14:00', calls: 560, latency: 172 },
  { hour: '16:00', calls: 680, latency: 158 },
  { hour: '18:00', calls: 820, latency: 186 },
]

export default function DeployMonitorTab() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [deploying, setDeploying] = useState(null)
  const [models, setModels] = useState(MODEL_REGISTRY.filter((m) => m.status === 'production'))

  const handleDeploy = (model) => {
    setDeploying(model.id)
    message.loading({ content: '部署任务执行中...', key: 'deploy' })
    setTimeout(() => {
      setDeploying(null)
      message.success({ content: `${model.name} ${model.version} 已部署至生产 API`, key: 'deploy' })
    }, 2000)
  }

  const handleRollback = (model) => {
    Modal.confirm({
      title: '版本回滚确认',
      content: `确认将 ${model.name} 回滚至上一稳定版本？`,
      onOk: () => message.success('已回滚至 V2.0 基准版'),
    })
  }

  const columns = [
    { title: '模型', dataIndex: 'name', key: 'name', render: (n, r) => <Space direction="vertical" size={0}><Text strong>{n}</Text><Text type="secondary" style={{ fontSize: 12 }}>{r.version}</Text></Space> },
    { title: '环境', dataIndex: 'env', key: 'env', width: 90, render: (v) => <Tag color={v === 'production' ? 'success' : 'default'}>{v}</Tag> },
    { title: '24h调用', dataIndex: 'apiCalls24h', key: 'apiCalls24h', width: 90 },
    { title: '延迟', dataIndex: 'avgLatencyMs', key: 'avgLatencyMs', width: 80, render: (v) => `${v}ms` },
    { title: '错误率', dataIndex: 'errorRate', key: 'errorRate', width: 80, render: (v) => `${v}%` },
    { title: '漂移', dataIndex: 'driftScore', key: 'driftScore', width: 70, render: (v) => <Tag color={v > 0.1 ? 'warning' : 'success'}>{(v * 100).toFixed(0)}%</Tag> },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, r) => (
        <Space size={4}>
          <Button type="link" size="small" loading={deploying === r.id} icon={<CloudUploadOutlined />} onClick={() => handleDeploy(r)}>部署</Button>
          <Button type="link" size="small" icon={<RollbackOutlined />} onClick={() => handleRollback(r)}>回滚</Button>
          <Button type="link" size="small" onClick={() => navigate(r.downstream)}>应用</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="部署监控阈值"
        description="API 响应时间 >500ms、准确率 <85%、错误率 >1%、特征漂移 >10% 时触发短信/邮件预警，支持自动切换备用模型。"
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">在线服务监控 · 调用量与延迟</h3>
            <div className="business-chart-box-sm">
              <Line
                data={monitorTrend.flatMap((d) => [
                  { hour: d.hour, value: d.calls, series: 'API调用量' },
                  { hour: d.hour, value: d.latency, series: '平均延迟(ms)' },
                ])}
                xField="hour"
                yField="value"
                seriesField="series"
                height={240}
                color={['#B32620', '#1677ff']}
              />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title"><WarningOutlined /> 漂移与异常预警</h3>
            {MODEL_DRIFT_ALERTS.map((a) => (
              <Alert
                key={a.id}
                type={a.level === 'warning' ? 'warning' : 'info'}
                message={a.msg}
                description={`${getModelByIdSafe(a.modelId)?.name || a.modelId} · ${a.time}`}
                style={{ marginBottom: 8 }}
                showIcon
              />
            ))}
          </div>
        </Col>
      </Row>

      <div className="business-panel" style={{ marginBottom: 16 }}>
        <h3 className="business-panel-title">生产环境模型</h3>
        <Table rowKey="id" size="middle" columns={columns} dataSource={models} pagination={false} />
      </div>

      <div className="business-panel">
        <h3 className="business-panel-title">训练任务历史</h3>
        <Table
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
          dataSource={getAllTrainJobs()}
          columns={[
            { title: '任务ID', dataIndex: 'id', width: 140 },
            { title: '算法', dataIndex: 'algorithm', width: 120 },
            { title: '样本量', dataIndex: 'dataRows', render: (v) => v?.toLocaleString?.() || v },
            { title: '准确率', dataIndex: 'accuracy', width: 80, render: (v) => `${v}%` },
            { title: '耗时', dataIndex: 'duration', width: 80 },
            { title: '时间', dataIndex: 'time', width: 160 },
            { title: '状态', dataIndex: 'status', width: 80, render: () => <Tag color="success">成功</Tag> },
          ]}
        />
      </div>
    </>
  )
}

function getModelByIdSafe(id) {
  return MODEL_REGISTRY.find((m) => m.id === id)
}
