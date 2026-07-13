import { App, Button } from 'antd'
import { useAuth } from '../auth/AuthContext'

/** 带 action:data:export 权限校验的导出按钮 */
export default function ExportButton({ onExport, children, ...props }) {
  const { can } = useAuth()
  const { message } = App.useApp()

  return (
    <Button
      {...props}
      onClick={() => {
        if (!can('action:data:export')) {
          message.warning('当前角色无数据导出权限')
          return
        }
        onExport?.()
      }}
    >
      {children}
    </Button>
  )
}
