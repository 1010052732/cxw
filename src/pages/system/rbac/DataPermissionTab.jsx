import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  App,
  Button,
  Col,
  Form,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { DATA_MODULES, DATA_SCOPES } from '../../../auth/permissions'
import { useAuth } from '../../../auth/AuthContext'

const { Text } = Typography
const REGIONS = ['全球', '欧洲', '东南亚', '南美', '北美', '中东', '东盟']

export default function DataPermissionTab() {
  const { message } = App.useApp()
  const { roles, updateRoleDataRules, departments } = useAuth()
  const [roleId, setRoleId] = useState(roles[1]?.id || roles[0]?.id)
  const [moduleKey, setModuleKey] = useState('risk')
  const [form] = Form.useForm()

  const role = useMemo(() => roles.find((r) => r.id === roleId), [roles, roleId])

  useEffect(() => {
    if (role?.dataRules?.[moduleKey]) {
      form.setFieldsValue(role.dataRules[moduleKey])
    }
  }, [role, moduleKey, form])

  const deptOptions = useMemo(
    () => (departments?.length ? departments.map((d) => d.name) : DEPTS),
    [departments],
  )

  const previewRows = useMemo(() => {
    if (!role) return []
    return DATA_MODULES.map((m) => {
      const rule = role.dataRules[m.key]
      return {
        module: m.label,
        scope: DATA_SCOPES.find((s) => s.value === rule.scope)?.label || rule.scope,
        dept: rule.departments?.join('、') || '—',
        region: rule.regions?.join('、') || '—',
      }
    })
  }, [role])

  const handleSave = () => {
    form.validateFields().then((values) => {
      const nextRules = {
        ...role.dataRules,
        [moduleKey]: {
          scope: values.scope,
          departments: values.departments || [],
          regions: values.regions || [],
        },
      }
      updateRoleDataRules(roleId, nextRules)
      message.success('数据权限规则已保存 · 列表数据将按规则过滤')
    })
  }

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="数据权限 · 行级（部门/区域/本人）+ 模块级隔离"
        description="配置后，风险档案、评估信号、分析数据等将按当前用户角色自动过滤"
      />
      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">规则配置</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">目标角色</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  value={roleId}
                  options={roles.map((r) => ({ value: r.id, label: r.name }))}
                  onChange={setRoleId}
                />
              </div>
              <div>
                <Text type="secondary">业务模块</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  value={moduleKey}
                  options={DATA_MODULES.map((m) => ({ value: m.key, label: m.label }))}
                  onChange={setModuleKey}
                />
              </div>
            </Space>
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item name="scope" label="数据范围" rules={[{ required: true }]}>
                <Select options={DATA_SCOPES.map((s) => ({ value: s.value, label: s.label }))} />
              </Form.Item>
              <Form.Item name="departments" label="授权部门（scope=dept）">
                <Select mode="multiple" options={deptOptions.map((d) => ({ value: d, label: d }))} />
              </Form.Item>
              <Form.Item name="regions" label="授权区域（scope=region）">
                <Select mode="multiple" options={REGIONS.map((r) => ({ value: r, label: r }))} />
              </Form.Item>
              <Button type="primary" block onClick={handleSave}>保存数据权限</Button>
            </Form>
          </div>
        </Col>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">角色数据权限总览 · {role?.name}</h3>
            <Table
              rowKey="module"
              size="small"
              pagination={false}
              dataSource={previewRows}
              columns={[
                { title: '模块', dataIndex: 'module', key: 'module' },
                { title: '范围', dataIndex: 'scope', key: 'scope', render: (v) => <Tag color="processing">{v}</Tag> },
                { title: '部门', dataIndex: 'dept', key: 'dept', ellipsis: true },
                { title: '区域', dataIndex: 'region', key: 'region', ellipsis: true },
              ]}
            />
            <Alert
              type="warning"
              showIcon
              style={{ marginTop: 12 }}
              message="闭环说明"
              description="用户登录 → 绑定角色 → 加载功能权限+数据规则 → 菜单/路由/数据列表三重过滤 → 审计留痕"
            />
          </div>
        </Col>
      </Row>
    </>
  )
}
