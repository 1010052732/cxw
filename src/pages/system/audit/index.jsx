import { App } from 'antd'
import RequirePermission from '../../../auth/RequirePermission'
import { useAuth } from '../../../auth/AuthContext'
import AuditTab from '../rbac/AuditTab'
import SystemWorkflow from '../components/SystemWorkflow'
import '../../business/business.css'

export default function AuditPage() {
  const { message } = App.useApp()
  const { resetRbac } = useAuth()

  const handleReset = () => {
    resetRbac()
    message.success('权限配置已恢复默认')
  }

  return (
    <RequirePermission permission="action:rbac:manage">
      <div className="business-page">
        <div className="business-page-header">
          <h1 className="page-title">审计日志</h1>
          <p className="page-description">权限变更留痕 · 操作追溯 · 合规审计</p>
        </div>

        <SystemWorkflow activePath="/system/audit" />

        <AuditTab onReset={handleReset} />
      </div>
    </RequirePermission>
  )
}
