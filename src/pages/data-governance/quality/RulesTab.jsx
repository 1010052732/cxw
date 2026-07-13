import { App, Button, Col, Drawer, Row, Space, Table, Tag, Typography } from 'antd'
import { CheckOutlined, ToolOutlined } from '@ant-design/icons'

const { Text } = Typography

const dimensionColor = { 完整性: 'blue', 一致性: 'purple', 准确性: 'green', 及时性: 'orange' }

export default function RulesTab({ qualityRules, setQualityRules, ruleHits, setRuleHits, onRunPipeline }) {
  const { message } = App.useApp()

  const resolveHit = (hitId) => {
    setRuleHits((prev) => prev.map((h) => (h.id === hitId ? { ...h, status: 'resolved' } : h)))
    message.success('命中记录已处理')
  }

  const fixRule = (ruleId) => {
    setQualityRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, status: 'fixed', hitCount: 0 } : r)))
    setRuleHits((prev) => prev.filter((h) => h.ruleId !== ruleId || h.status === 'resolved'))
    message.success('规则问题已修复并关闭')
  }

  const openHits = qualityRules.filter((r) => r.status === 'open').reduce((s, r) => s + r.hitCount, 0)

  return (
    <>
      <div className="business-stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }}>
        <div className="business-stat-card">
          <div className="value">{qualityRules.length}</div>
          <div className="label">质量规则总数</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{qualityRules.filter((r) => r.status === 'open').length}</div>
          <div className="label">待处理规则</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{openHits}</div>
          <div className="label">累计命中次数</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{ruleHits.filter((h) => h.status === 'open').length}</div>
          <div className="label">待处理命中</div>
        </div>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <Space style={{ marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>质量规则库</h3>
              <Button size="small" type="primary" icon={<ToolOutlined />} onClick={onRunPipeline}>
                触发清洗修复
              </Button>
            </Space>
            <Table
              rowKey="id"
              size="small"
              dataSource={qualityRules}
              pagination={false}
              rowClassName={(r) => (r.status === 'fixed' ? 'quality-rule-fixed' : '')}
              columns={[
                { title: '规则', dataIndex: 'name', key: 'name' },
                { title: '维度', dataIndex: 'dimension', key: 'dimension', width: 90, render: (v) => <Tag color={dimensionColor[v]}>{v}</Tag> },
                { title: '命中', dataIndex: 'hitCount', key: 'hitCount', width: 60 },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 80,
                  render: (v) => <Tag color={v === 'open' ? 'warning' : 'success'}>{v === 'open' ? '待处理' : '已修复'}</Tag>,
                },
                {
                  title: '操作',
                  key: 'op',
                  width: 100,
                  render: (_, r) => (
                    r.status === 'open' ? (
                      <Button type="link" size="small" onClick={() => fixRule(r.id)}>标记修复</Button>
                    ) : (
                      <Tag icon={<CheckOutlined />} color="success">已关闭</Tag>
                    )
                  ),
                },
              ]}
              expandable={{
                expandedRowRender: (r) => (
                  <div style={{ padding: '0 8px' }}>
                    <Text type="secondary">{r.desc}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text>关联字段：</Text>
                      {(r.fields || []).map((f) => <Tag key={f}>{f}</Tag>)}
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">规则命中明细（质量工作台）</h3>
            <Table
              rowKey="id"
              size="small"
              pagination={{ pageSize: 6 }}
              dataSource={ruleHits}
              columns={[
                { title: '数据源', dataIndex: 'sourceName', key: 'sourceName', ellipsis: true },
                { title: '字段', dataIndex: 'field', key: 'field', width: 80 },
                { title: '样本值', dataIndex: 'sample', key: 'sample', ellipsis: true },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 80,
                  render: (v) => <Tag color={v === 'open' ? 'warning' : 'success'}>{v === 'open' ? '待处理' : '已处理'}</Tag>,
                },
                {
                  title: '操作',
                  key: 'op',
                  width: 70,
                  render: (_, r) => (
                    <Button type="link" size="small" disabled={r.status !== 'open'} onClick={() => resolveHit(r.id)}>
                      处理
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        </Col>
      </Row>
    </>
  )
}
