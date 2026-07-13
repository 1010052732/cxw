import { App, Button, Col, Descriptions, Row, Switch, Table, Tag } from 'antd'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { MASKING_RULES } from '../../../mock/data-governance'

export default function SecurityTab({ security, setSecurity, onSecurityAudit }) {
  const { message } = App.useApp()
  const navigate = useNavigate()

  return (
    <Row gutter={16}>
      <Col xs={24} lg={12}>
        <div className="business-panel" style={{ marginBottom: 16 }}>
          <h3 className="business-panel-title">安全策略配置</h3>
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={security}
            columns={[
              { title: '策略项', dataIndex: 'name', key: 'name' },
              { title: '配置', dataIndex: 'value', key: 'value' },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: 100,
                render: (v, record) => (
                  <Switch
                    checked={v === 'enabled'}
                    checkedChildren="开"
                    unCheckedChildren="关"
                    onChange={(checked) => {
                      setSecurity((prev) =>
                        prev.map((s) => (s.id === record.id ? { ...s, status: checked ? 'enabled' : 'disabled' } : s)),
                      )
                      message.success(`${record.name} 已${checked ? '启用' : '关闭'}`)
                      if (checked) onSecurityAudit?.()
                    }}
                  />
                ),
              },
            ]}
          />
        </div>
        <div className="business-panel">
          <h3 className="business-panel-title">数据脱敏规则</h3>
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={MASKING_RULES}
            columns={[
              { title: '字段', dataIndex: 'field', key: 'field', width: 120 },
              { title: '脱敏方式', dataIndex: 'method', key: 'method' },
              { title: '示例', dataIndex: 'example', key: 'example', ellipsis: true },
              { title: '适用范围', dataIndex: 'scope', key: 'scope', ellipsis: true },
              { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: () => <Tag color="success">启用</Tag> },
            ]}
          />
        </div>
      </Col>
      <Col xs={24} lg={12}>
        <div className="business-panel">
          <h3 className="business-panel-title">权限与加密说明</h3>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="访问控制">RBAC 角色权限 · 行级/列级数据隔离</Descriptions.Item>
            <Descriptions.Item label="传输安全">TLS 1.3 全链路加密</Descriptions.Item>
            <Descriptions.Item label="静态加密">AES-256 静态数据加密</Descriptions.Item>
            <Descriptions.Item label="合规要求">GDPR 数据最小化 · 生命周期自动删除</Descriptions.Item>
            <Descriptions.Item label="开发环境">自动脱敏副本 · 禁止明文导出</Descriptions.Item>
          </Descriptions>
          <Button
            block
            icon={<SafetyCertificateOutlined />}
            style={{ marginTop: 12 }}
            onClick={() => {
              message.success('安全审计报告已生成')
              onSecurityAudit?.()
            }}
          >
            生成安全审计报告
          </Button>
          <Button block type="link" onClick={() => navigate('/system/permission')}>
            配置权限分配 →
          </Button>
          <Button block type="primary" ghost style={{ marginTop: 8 }} onClick={() => navigate('/data/models')}>
            存储就绪 · 进入模型训练 →
          </Button>
        </div>
      </Col>
    </Row>
  )
}
