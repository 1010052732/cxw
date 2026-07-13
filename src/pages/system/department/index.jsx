import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import RequirePermission from '../../../auth/RequirePermission'
import { useAuth } from '../../../auth/AuthContext'
import { DATA_MODULES, DATA_SCOPES } from '../../../auth/permissions'
import { countUsersInDepartment } from '../../../mock/rbac'
import SystemWorkflow from '../components/SystemWorkflow'
import '../../business/business.css'

const { Text } = Typography
const REGIONS = ['全球', '欧洲', '东南亚', '南美', '北美', '中东', '东盟']

export default function DepartmentPage() {
  const { message } = App.useApp()
  const { departments, users, createDepartment, updateDepartment } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const dataSource = useMemo(
    () => departments.map((d) => ({
      ...d,
      memberCount: countUsersInDepartment(d.name, users),
    })),
    [departments, users],
  )

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ defaultScope: 'dept', modules: ['analysis'], regions: [] })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      updateDepartment(editing.id, values)
      message.success('部门权限已更新')
    } else {
      createDepartment(values)
      message.success('部门已创建，可在权限分配中为角色配置数据范围')
    }
    setModalOpen(false)
  }

  return (
    <RequirePermission permission="action:rbac:manage">
      <div className="business-page">
        <div className="business-page-header">
          <h1 className="page-title">部门权限</h1>
          <p className="page-description">部门建档 · 模块授权 · 默认数据范围 · 成员统计</p>
        </div>

        <SystemWorkflow activePath="/system/department" />

        <div className="business-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h3 className="business-panel-title" style={{ margin: 0 }}>部门列表</h3>
              <Text type="secondary">部门默认范围会在「权限分配」中作为角色数据规则的参考基准</Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增部门</Button>
          </div>
          <Table
            rowKey="id"
            size="small"
            dataSource={dataSource}
            pagination={{ pageSize: 8 }}
            columns={[
              { title: '部门名称', dataIndex: 'name', key: 'name' },
              { title: '编码', dataIndex: 'code', key: 'code', width: 90 },
              { title: '负责人', dataIndex: 'leader', key: 'leader', width: 100 },
              {
                title: '授权模块',
                dataIndex: 'modules',
                key: 'modules',
                render: (mods) => mods.map((m) => {
                  const label = DATA_MODULES.find((d) => d.key === m)?.label || m
                  return <Tag key={m}>{label}</Tag>
                }),
              },
              {
                title: '默认范围',
                dataIndex: 'defaultScope',
                key: 'defaultScope',
                width: 120,
                render: (v) => <Tag color="processing">{DATA_SCOPES.find((s) => s.value === v)?.label || v}</Tag>,
              },
              { title: '成员数', dataIndex: 'memberCount', key: 'memberCount', width: 80 },
              {
                title: '操作',
                key: 'action',
                width: 90,
                render: (_, record) => <a onClick={() => openEdit(record)}>编辑</a>,
              },
            ]}
          />
        </div>

        <Modal
          title={editing ? '编辑部门权限' : '新增部门'}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSubmit}
          okText={editing ? '保存' : '创建'}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
              <Input placeholder="如：海外拓展部" disabled={!!editing} />
            </Form.Item>
            <Form.Item name="code" label="部门编码">
              <Input placeholder="如：OVERSEA" />
            </Form.Item>
            <Form.Item name="leader" label="负责人">
              <Input placeholder="部门负责人姓名" />
            </Form.Item>
            <Form.Item name="modules" label="授权业务模块" rules={[{ required: true }]}>
              <Select mode="multiple" options={DATA_MODULES.map((m) => ({ value: m.key, label: m.label }))} />
            </Form.Item>
            <Form.Item name="defaultScope" label="默认数据范围" rules={[{ required: true }]}>
              <Select options={DATA_SCOPES.map((s) => ({ value: s.value, label: s.label }))} />
            </Form.Item>
            <Form.Item name="regions" label="关联区域">
              <Select mode="multiple" options={REGIONS.map((r) => ({ value: r, label: r }))} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </RequirePermission>
  )
}
