import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  App,
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import RequirePermission from '../../../auth/RequirePermission'
import { PERMISSION_GROUPS } from '../../../auth/permissions'
import { useAuth } from '../../../auth/AuthContext'
import SystemWorkflow from '../components/SystemWorkflow'
import '../../business/business.css'

const { Text, Paragraph } = Typography

export default function RolePage() {
  const { message } = App.useApp()
  const {
    roles,
    users,
    updateRolePermissions,
    createRole,
    deleteRole,
    currentRole,
  } = useAuth()
  const [selectedRoleId, setSelectedRoleId] = useState(currentRole?.id || roles[0]?.id)
  const [checked, setChecked] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()

  const role = useMemo(() => roles.find((r) => r.id === selectedRoleId), [roles, selectedRoleId])
  const boundCount = useMemo(() => users.filter((u) => u.roleId === selectedRoleId).length, [users, selectedRoleId])

  useEffect(() => {
    if (role) setChecked(role.permissions)
  }, [role])

  const handleSave = () => {
    updateRolePermissions(selectedRoleId, checked)
    message.success('角色功能权限已保存，绑定账号即时生效')
  }

  const handleCreate = async () => {
    const values = await form.validateFields()
    const created = createRole(values)
    setSelectedRoleId(created.id)
    setCreateOpen(false)
    form.resetFields()
    message.success(`角色「${created.name}」已创建，请继续配置功能权限`)
  }

  const handleDelete = () => {
    const ok = deleteRole(selectedRoleId)
    if (!ok) {
      message.warning('系统内置角色或仍有绑定账号的角色不可删除')
      return
    }
    message.success('角色已删除')
    setSelectedRoleId(roles.find((r) => r.id !== selectedRoleId)?.id)
  }

  return (
    <RequirePermission permission="action:rbac:manage">
      <div className="business-page">
        <div className="business-page-header">
          <h1 className="page-title">角色管理</h1>
          <p className="page-description">角色新增 · 功能权限矩阵 · 复制模板 · 绑定统计</p>
        </div>

        <SystemWorkflow activePath="/system/role" />

        <Row gutter={16}>
          <Col xs={24} lg={8}>
            <div className="business-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 className="business-panel-title" style={{ margin: 0 }}>角色列表</h3>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                  新增角色
                </Button>
              </div>
              {roles.map((r) => (
                <div
                  key={r.id}
                  className={`rbac-role-card${selectedRoleId === r.id ? ' active' : ''}`}
                  onClick={() => setSelectedRoleId(r.id)}
                >
                  <Text strong>{r.name}</Text>
                  <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 12 }}>{r.desc}</Paragraph>
                  <Space size={4} wrap style={{ marginTop: 6 }}>
                    <Tag>{r.permissions.length} 项权限</Tag>
                    <Tag color="blue">{users.filter((u) => u.roleId === r.id).length} 人</Tag>
                  </Space>
                </div>
              ))}
            </div>
          </Col>
          <Col xs={24} lg={16}>
            <div className="business-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 className="business-panel-title" style={{ margin: 0 }}>功能权限 · {role?.name}</h3>
                  <Text type="secondary">已绑定 {boundCount} 个账号 · 保存后菜单与按钮权限立即生效</Text>
                </div>
                <Space>
                  {selectedRoleId !== 'super_admin' && (
                    <Popconfirm title="确认删除该角色？" onConfirm={handleDelete}>
                      <Button danger icon={<DeleteOutlined />} disabled={boundCount > 0}>删除角色</Button>
                    </Popconfirm>
                  )}
                  <Button type="primary" onClick={handleSave}>保存权限</Button>
                </Space>
              </div>
              <Alert type="info" showIcon style={{ marginBottom: 12 }} message="功能权限控制菜单访问与业务操作按钮；数据范围请在「权限分配」中配置" />
              <Checkbox.Group value={checked} onChange={setChecked} style={{ width: '100%' }}>
                {PERMISSION_GROUPS.map((g) => (
                  <div key={g.key} style={{ marginBottom: 16 }}>
                    <Text strong>{g.label}</Text>
                    <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                      {g.items.map((item) => (
                        <Col span={8} key={item.key}>
                          <Checkbox value={item.key}>{item.label}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
              </Checkbox.Group>
            </div>
          </Col>
        </Row>

        <Modal title="新增角色" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={handleCreate} okText="创建">
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
              <Input placeholder="如：区域业务主管" />
            </Form.Item>
            <Form.Item name="desc" label="角色说明">
              <Input.TextArea rows={2} placeholder="描述该角色的职责范围" />
            </Form.Item>
            <Form.Item name="copyRoleId" label="复制权限模板（可选）">
              <Select
                allowClear
                placeholder="从现有角色复制权限"
                options={roles.map((r) => ({ value: r.id, label: r.name }))}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </RequirePermission>
  )
}
