import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import ForbiddenPage from '../pages/system/ForbiddenPage'

export default function RouteGuard() {
  const location = useLocation()
  const { canAccessRoute } = useAuth()

  if (!canAccessRoute(location.pathname)) {
    return <ForbiddenPage />
  }

  return <Outlet />
}
