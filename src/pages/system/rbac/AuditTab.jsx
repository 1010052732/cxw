import { Button, Space, Table } from 'antd'
import { useAuth } from '../../../auth/AuthContext'

export default function AuditTab({ onReset }) {
  const { auditLog } = useAuth()

  return (
    <div className="business-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 className="business-panel-title" style={{ margin: 0 }}>权限变更审计</h3>
        <Button danger onClick={onReset}>恢复默认配置</Button>
      </div>
      <Table
        rowKey="id"
        size="small"
        dataSource={auditLog}
        pagination={{ pageSize: 8 }}
        columns={[
          { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
          { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
          { title: '动作', dataIndex: 'action', key: 'action', width: 120 },
          { title: '对象', dataIndex: 'target', key: 'target', width: 120 },
          { title: '详情', dataIndex: 'detail', key: 'detail', ellipsis: true },
        ]}
      />
    </div>
  )
}
