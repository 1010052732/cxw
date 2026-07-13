import { App, Select, Space, Table, Tag, Typography } from 'antd'
import { useAuth } from '../../../auth/AuthContext'

const { Text } = Typography

export default function UserTab() {
  const { message } = App.useApp()
  const { users, roles, updateUserRole, switchUser, currentUser } = useAuth()

  return (
    <div className="business-panel">
      <h3 className="business-panel-title">用户与角色绑定</h3>
      <Table
        rowKey="id"
        size="small"
        dataSource={users}
        pagination={false}
        columns={[
          { title: '用户', dataIndex: 'name', key: 'name' },
          { title: '账号', dataIndex: 'username', key: 'username' },
          { title: '部门', dataIndex: 'dept', key: 'dept' },
          { title: '区域', dataIndex: 'region', key: 'region' },
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
            title: '模拟登录',
            key: 'switch',
            width: 100,
            render: (_, record) => (
              <a
                onClick={() => {
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
      <Text type="secondary" style={{ fontSize: 12 }}>
        为用户绑定角色后，功能权限与数据范围即时生效；也可在「账号管理」中新建账号
      </Text>
    </div>
  )
}
