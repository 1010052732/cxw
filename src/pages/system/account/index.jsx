import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import RequirePermission from '../../../auth/RequirePermission'
import { useAuth } from '../../../auth/AuthContext'
import SystemWorkflow from '../components/SystemWorkflow'
import '../../business/business.css'

const { Text } = Typography
const REGIONS = ['全球', '欧洲', '东南亚', '南美', '北美', '中东', '东盟']

export default function AccountPage() {
  const { message } = App.useApp()
  const {
    users,
    roles,
    departments,
    createUser,
    updateUser,
    updateUserRole,
    toggleUserStatus,
    switchUser,
    currentUser,
  } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const deptOptions = useMemo(
    () => departments.map((d) => ({ value: d.name, label: d.name })),
    [departments],
  )

  const openCreate = () => {
    form.resetFields()
    form.setFieldsValue({ region: '全球', roleId: roles.find((r) => r.id === 'analyst')?.id })
    setModalOpen(true)
  }

  const handleCreate = async () => {
    const values = await form.validateFields()
    if (users.some((u) => u.username === values.username)) {
      message.error('账号已存在，请更换登录名')
      return
    }
    const user = createUser(values)
    message.success(`账号「${user.name}」已创建，默认角色 ${roles.find((r) => r.id === user.roleId)?.name}`)
    setModalOpen(false)
  }

  return (
    <RequirePermission permission="action:rbac:manage">
      <div className="business-page">
        <div className="business-page-header">
          <h1 className="page-title">账号管理</h1>
          <p className="page-description">账号新增 · 部门归属 · 角色绑定 · 启停控制 · 演示切换</p>
        </div>

        <SystemWorkflow activePath="/system/account" />

        <div className="business-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h3 className="business-panel-title" style={{ margin: 0 }}>账号列表</h3>
              <Text type="secondary">新建账号后请在「权限分配」中确认数据范围是否满足部门要求</Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增账号</Button>
          </div>
          <Table
            rowKey="id"
            size="small"
            dataSource={users}
            pagination={{ pageSize: 8 }}
            columns={[
              { title: '姓名', dataIndex: 'name', key: 'name' },
              { title: '登录账号', dataIndex: 'username', key: 'username' },
              { title: '部门', dataIndex: 'dept', key: 'dept' },
              { title: '区域', dataIndex: 'region', key: 'region', width: 90 },
              {
                title: '角色',
                key: 'role',
                render: (_, record) => (
                  <Select
                    size="small"
                    style={{ width: 140 }}
                    value={record.roleId}
                    options={roles.map((r) => ({ value: r.id, label: r.name }))}
                    onChange={(roleId) => {
                      updateUserRole(record.id, roleId)
                      message.success(`已更新 ${record.name} 的角色`)
                    }}
                  />
                ),
              },
              {
                title: '状态',
                key: 'status',
                width: 90,
                render: (_, record) => (
                  <Switch
                    size="small"
                    checked={record.status !== 'disabled'}
                    disabled={record.id === currentUser.id}
                    onChange={() => {
                      const ok = toggleUserStatus(record.id)
                      if (ok) message.success(record.status === 'disabled' ? '账号已启用' : '账号已停用')
                      else message.warning('不能停用当前登录账号')
                    }}
                  />
                ),
              },
              {
                title: '模拟登录',
                key: 'switch',
                width: 100,
                render: (_, record) => (
                  <a
                    onClick={() => {
                      if (record.status === 'disabled') {
                        message.warning('账号已停用')
                        return
                      }
                      switchUser(record.id)
                      message.success(`已切换为 ${record.name}，菜单与数据权限已刷新`)
                    }}
                  >
                    {record.id === currentUser.id ? <Tag color="success">当前</Tag> : '切换'}
                  </a>
                ),
              },
            ]}
          />
        </div>

        <Modal title="新增账号" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleCreate} okText="创建">
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="员工姓名" />
            </Form.Item>
            <Form.Item name="username" label="登录账号" rules={[{ required: true, message: '请输入登录账号' }]}>
              <Input placeholder="如：zhangsan" />
            </Form.Item>
            <Form.Item name="dept" label="所属部门" rules={[{ required: true, message: '请选择部门' }]}>
              <Select options={deptOptions} placeholder="选择部门" />
            </Form.Item>
            <Form.Item name="region" label="负责区域" rules={[{ required: true }]}>
              <Select options={REGIONS.map((r) => ({ value: r, label: r }))} />
            </Form.Item>
            <Form.Item name="roleId" label="初始角色" rules={[{ required: true }]}>
              <Select options={roles.map((r) => ({ value: r.id, label: r.name }))} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </RequirePermission>
  )
}
