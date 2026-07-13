import { useMemo, useState } from 'react'
import { App, Button, Col, Descriptions, Drawer, Row, Space, Table, Tag, Typography } from 'antd'
import { EyeOutlined, RocketOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  MODEL_REGISTRY,
  MODEL_SCENES,
  MODEL_TEMPLATES,
  buildModelExplain,
} from '../../../mock/model-algorithm'

const { Text, Paragraph } = Typography

export default function ModelLibraryTab() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [sceneFilter, setSceneFilter] = useState('all')
  const [explainModel, setExplainModel] = useState(null)

  const filtered = useMemo(
    () => (sceneFilter === 'all' ? MODEL_REGISTRY : MODEL_REGISTRY.filter((m) => m.scene === sceneFilter)),
    [sceneFilter],
  )

  const explain = useMemo(() => buildModelExplain(explainModel), [explainModel])

  const columns = [
    { title: '模型', dataIndex: 'name', key: 'name', render: (n, r) => <Space direction="vertical" size={0}><Text strong>{n}</Text><Text type="secondary" style={{ fontSize: 12 }}>{r.id}</Text></Space> },
    { title: '场景', dataIndex: 'scene', key: 'scene', width: 90, render: (v) => MODEL_SCENES.find((s) => s.id === v)?.name?.slice(0, 6) || v },
    { title: '版本', dataIndex: 'version', key: 'version', width: 70 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (v) => <Tag color={v === 'production' ? 'success' : 'default'}>{v === 'production' ? '生产' : '归档'}</Tag> },
    { title: '准确率', dataIndex: 'accuracy', key: 'accuracy', width: 80, render: (v) => `${v}%` },
    { title: 'F1', dataIndex: 'f1', key: 'f1', width: 60 },
    { title: '部署', dataIndex: 'deployType', key: 'deployType', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, r) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setExplainModel(r)}>解释</Button>
          <Button type="link" size="small" icon={<RocketOutlined />} onClick={() => navigate(r.downstream)}>应用</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <Text>场景筛选</Text>
        {[{ value: 'all', label: '全部' }, ...MODEL_SCENES.map((s) => ({ value: s.id, label: s.name.slice(0, 8) }))].map((opt) => (
          <Tag
            key={opt.value}
            color={sceneFilter === opt.value ? '#B32620' : undefined}
            style={{ cursor: 'pointer' }}
            onClick={() => setSceneFilter(opt.value)}
          >
            {opt.label}
          </Tag>
        ))}
      </Space>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {MODEL_TEMPLATES.map((tpl) => (
          <Col xs={24} lg={8} key={tpl.id}>
            <div className="business-panel model-template-card">
              <Tag>{MODEL_SCENES.find((s) => s.id === tpl.scene)?.name}</Tag>
              <div style={{ fontWeight: 600, margin: '8px 0' }}>{tpl.name}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>版本 {tpl.version} · {tpl.indicators.length} 项指标</Text>
              <Button
                type="link"
                size="small"
                style={{ padding: 0, marginTop: 8 }}
                onClick={() => {
                  message.info(`模板「${tpl.name}」已选中，请前往模型工厂配置`)
                  navigate('/data/models?tab=factory')
                }}
              >
                基于此模板创建 →
              </Button>
            </div>
          </Col>
        ))}
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title">模型注册表</h3>
        <Table rowKey="id" size="middle" columns={columns} dataSource={filtered} pagination={{ pageSize: 6 }} />
      </div>

      <Drawer title={explainModel ? `模型解释 · ${explainModel.name}` : ''} open={!!explainModel} onClose={() => setExplainModel(null)} width={480}>
        {explain && (
          <>
            <Paragraph>{explain.summary}</Paragraph>
            <Descriptions bordered column={1} size="small">
              {explain.features.map((f) => (
                <Descriptions.Item key={f.name} label={f.name}>{f.value}</Descriptions.Item>
              ))}
            </Descriptions>
            <Paragraph style={{ marginTop: 16 }}><Text strong>应用场景：</Text>{explain.application}</Paragraph>
            <Paragraph type="secondary">{explain.caseStudy}</Paragraph>
            <Button type="primary" block onClick={() => navigate(explainModel.downstream)}>进入业务模块验证</Button>
          </>
        )}
      </Drawer>
    </>
  )
}
