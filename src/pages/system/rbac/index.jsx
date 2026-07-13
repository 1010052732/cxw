import { Navigate } from 'react-router-dom'

/** 兼容旧路径 /system/rbac */
export default function RbacLegacyRedirect() {
  return <Navigate to="/system/permission" replace />
}
