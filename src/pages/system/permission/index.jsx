import { Alert, Space, Tabs, Typography } from 'antd'
import { DatabaseOutlined, TeamOutlined, UserSwitchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import RequirePermission from '../../../auth/RequirePermission'
import { useAuth } from '../../../auth/AuthContext'
import DataPermissionTab from '../rbac/DataPermissionTab'
import UserTab from '../rbac/UserTab'
import SystemWorkflow from '../components/SystemWorkflow'
import '../../business/business.css'

const { Text } = Typography

export default function PermissionPage() {
  const navigate = useNavigate()
  const { currentUser, currentRole } = useAuth()

  return (
    <RequirePermission permission="action:rbac:manage">
      <div className="business-page">
        <div className="business-page-header">
          <h1 className="page-title">权限分配</h1>
          <p className="page-description">数据权限 · 用户授权 · 与角色/部门/账号联动 · 业务模块即时生效</p>
        </div>

        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          message={`当前会话：${currentUser.name}（${currentUser.dept}）· 角色：${currentRole?.name}`}
          description="建议流程：先在「部门权限/角色管理/账号管理」完成基础配置，再在此分配数据范围并验证业务模块过滤效果"
          action={(
            <Space>
              <a onClick={() => navigate('/system/department')}>部门权限</a>
              <a onClick={() => navigate('/system/role')}>角色管理</a>
              <a onClick={() => navigate('/system/account')}>账号管理</a>
              <a onClick={() => navigate('/risk/assessment')}>验证生效</a>
            </Space>
          )}
        />

        <SystemWorkflow activePath="/system/permission" />

        <Tabs
          items={[
            {
              key: 'data',
              label: <span><DatabaseOutlined /> 数据权限分配</span>,
              children: <DataPermissionTab />,
            },
            {
              key: 'user',
              label: <span><UserSwitchOutlined /> 用户授权</span>,
              children: <UserTab />,
            },
            {
              key: 'guide',
              label: <span><TeamOutlined /> 分配说明</span>,
              children: (
                <div className="business-panel">
                  <h3 className="business-panel-title">权限分配闭环</h3>
                  <Space direction="vertical" size={12}>
                    <Text>1. <strong>部门权限</strong>：定义部门默认模块与数据范围基准。</Text>
                    <Text>2. <strong>角色管理</strong>：创建角色并配置功能权限（菜单与操作）。</Text>
                    <Text>3. <strong>权限分配</strong>：按角色配置各业务模块的数据范围（本页「数据权限分配」）。</Text>
                    <Text>4. <strong>账号管理</strong>：创建账号并绑定部门与角色。</Text>
                    <Text>5. <strong>业务生效</strong>：登录后菜单、路由、列表数据三重过滤；可在风险评估页查看数据权限提示。</Text>
                    <Text>6. <strong>审计追溯</strong>：所有变更写入审计日志，支持恢复默认配置。</Text>
                  </Space>
                </div>
              ),
            },
          ]}
        />
      </div>
    </RequirePermission>
  )
}
