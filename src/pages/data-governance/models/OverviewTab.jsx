import { Alert, Button, Col, Row, Space, Table, Tag, Timeline, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  DATA_ARCHITECTURE_LAYERS,
  DATA_RESOURCE_CATEGORIES,
  ITERATION_PLAN,
  MODEL_LINEAGE,
  MODEL_SCENES,
  getProductionModels,
} from '../../../mock/model-algorithm'
import { getDownstreamConsumption, getPlatformMetrics } from '../../../mock/data-bridge'

const { Text, Paragraph } = Typography

export default function OverviewTab() {
  const navigate = useNavigate()
  const metrics = getPlatformMetrics()
  const downstream = getDownstreamConsumption(metrics)
  const productionModels = getProductionModels()

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="五层数据架构 · 模型服务标准化"
        description="数据接入 → 存储计算 → 数据治理 → 数据服务 → 安全运维，模型算法作为数据服务层核心能力，支撑商机/分析/风险全场景。"
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {DATA_ARCHITECTURE_LAYERS.map((layer) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={layer.key}>
            <div className="data-arch-layer-card" style={{ borderTopColor: layer.color }}>
              <Text strong style={{ color: layer.color }}>{layer.name}</Text>
              <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0, marginTop: 6 }}>{layer.desc}</Paragraph>
            </div>
          </Col>
        ))}
      </Row>

      <div className="business-panel" style={{ marginBottom: 16 }}>
        <h3 className="business-panel-title">五大类数据资源规划</h3>
        <Table
          size="small"
          pagination={false}
          rowKey="category"
          dataSource={DATA_RESOURCE_CATEGORIES}
          columns={[
            { title: '数据类别', dataIndex: 'category', width: 120 },
            { title: '核心内容', dataIndex: 'content' },
            { title: '数据来源', dataIndex: 'source', width: 140 },
            { title: '更新频率', dataIndex: 'freq', width: 90 },
            { title: '存储位置', dataIndex: 'store', width: 130 },
          ]}
        />
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">三大算法模型 · 业务映射</h3>
            {MODEL_SCENES.map((scene) => {
              const model = productionModels.find((m) => m.scene === scene.id)
              return (
                <div key={scene.id} className="model-scene-card">
                  <Space wrap style={{ marginBottom: 6 }}>
                    <Text strong>{scene.name}</Text>
                    <Tag>{scene.algorithm}</Tag>
                    {model && <Tag color="success">准确率 {model.accuracy}%</Tag>}
                  </Space>
                  <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 8 }}>{scene.desc}</Paragraph>
                  <Space>
                    <Button size="small" onClick={() => navigate('/data/models?tab=library')}>模型库</Button>
                    <Button type="primary" size="small" onClick={() => navigate(scene.route)}>进入业务应用 →</Button>
                  </Space>
                </div>
              )
            })}
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">数据→模型→业务 血缘链路</h3>
            <Timeline
              items={MODEL_LINEAGE.map((item) => ({
                color: '#B32620',
                children: (
                  <div>
                    <Text strong>{item.stage}</Text> · {item.node}
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.detail}</div>
                    <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate(item.route)}>查看 →</Button>
                  </div>
                ),
              }))}
            />
          </div>
        </Col>
      </Row>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <h3 className="business-panel-title">下游业务消费 · 模型输出落地</h3>
        <Row gutter={[12, 12]}>
          {downstream.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.key}>
              <div className="config-category-card" style={{ cursor: 'pointer', minHeight: 88 }} onClick={() => navigate(item.route)}>
                <div style={{ fontWeight: 600 }}>{item.module}</div>
                <div style={{ color: '#B32620', marginTop: 4 }}>{item.metric}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.pool}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <h3 className="business-panel-title">模型优化迭代体系</h3>
        <Table
          size="small"
          pagination={false}
          rowKey="quarter"
          dataSource={ITERATION_PLAN}
          columns={[
            { title: '季度', dataIndex: 'quarter', width: 100 },
            { title: '优化重点', dataIndex: 'focus' },
            { title: '状态', dataIndex: 'status', width: 100, render: (v) => <Tag color={v === '进行中' ? 'processing' : 'default'}>{v}</Tag> },
          ]}
        />
      </div>
    </>
  )
}
