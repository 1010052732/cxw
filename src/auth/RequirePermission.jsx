import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function RequirePermission({ permission, route, children, fallback }) {
  const { can, canAccessRoute } = useAuth()
  const navigate = useNavigate()

  const allowed = route ? canAccessRoute(route) : !permission || can(permission)

  if (allowed) return children

  if (fallback) return fallback

  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，您没有访问此页面的权限。请联系管理员或在「角色管理/权限分配」中调整角色权限。"
      extra={
        <Button type="primary" onClick={() => navigate('/home')}>
          返回首页
        </Button>
      }
    />
  )
}
