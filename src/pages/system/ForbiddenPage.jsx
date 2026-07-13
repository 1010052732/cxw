import { Button, Result, Space, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { matchRoutePermission } from '../../auth/permissions'
import { useAuth } from '../../auth/AuthContext'

const { Text } = Typography

export default function ForbiddenPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { can, currentRole, currentUser } = useAuth()
  const required = matchRoutePermission(location.pathname) || []
  const missing = required.filter((p) => !can(p))

  return (
    <Result
      status="403"
      title="无访问权限"
      subTitle={
        <Space direction="vertical" size={4}>
          <Text>当前角色「{currentRole?.name}」无法访问该功能。</Text>
          {missing.length > 0 && (
            <Text type="secondary">缺少权限：{missing.join(' · ')}</Text>
          )}
          <Text type="secondary">可在个人中心切换演示账号，或联系管理员在「权限分配」中配置。</Text>
        </Space>
      }
      extra={[
        <Button type="primary" key="home" onClick={() => navigate('/home')}>返回首页</Button>,
        <Button key="profile" onClick={() => navigate('/system/profile')}>个人中心（{currentUser.name}）</Button>,
        can('action:rbac:manage') ? (
          <Button key="rbac" onClick={() => navigate('/system/permission')}>权限分配</Button>
        ) : null,
      ].filter(Boolean)}
    />
  )
}
