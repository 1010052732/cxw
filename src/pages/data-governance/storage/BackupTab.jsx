import { App, Button, Modal, Space, Table, Tag } from 'antd'
import { CloudUploadOutlined, PlusOutlined, RollbackOutlined } from '@ant-design/icons'
import { BACKUP_SCHEDULE_PRESETS } from '../../../mock/data-governance'

export default function BackupTab({ backups, setBackups, onBackupComplete }) {
  const { message } = App.useApp()

  const handleRestore = (job) => {
    Modal.confirm({
      title: '一键恢复确认',
      content: (
        <>
          <p>确认从备份「{job.name}」恢复数据？</p>
          <p style={{ color: '#ff4d4f' }}>此操作将覆盖当前 {job.type === 'full' ? '全量' : '增量'} 数据，请确保已通知相关业务方。</p>
        </>
      ),
      okText: '确认恢复',
      okButtonProps: { danger: true },
      onOk: () => {
        message.success(`已从 ${job.lastRun} 备份点恢复 · 业务连续性已保障`)
        onBackupComplete?.('backup')
      },
    })
  }

  const handleBackupNow = (preset) => {
    message.loading({ content: '备份任务启动中...', key: 'bk' })
    setTimeout(() => {
      const now = new Date().toLocaleString('zh-CN')
      setBackups((prev) => [
        {
          id: `BK-${Date.now()}`,
          name: preset ? `${preset.label}（手动）` : '手动触发备份',
          type: preset?.type || 'full',
          schedule: preset?.schedule || '手动',
          lastRun: now,
          status: 'success',
          size: preset?.tier === 'cold' ? '1.0TB' : preset?.tier === 'warm' ? '156GB' : '2.8TB',
        },
        ...prev,
      ])
      message.success({ content: '备份任务已完成', key: 'bk' })
      onBackupComplete?.('backup')
    }, 1500)
  }

  return (
    <div className="business-panel">
      <Space wrap style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<CloudUploadOutlined />} onClick={() => handleBackupNow(null)}>
          立即全量备份
        </Button>
        {BACKUP_SCHEDULE_PRESETS.map((preset) => (
          <Button key={preset.label} icon={<PlusOutlined />} onClick={() => handleBackupNow(preset)}>
            {preset.label}
          </Button>
        ))}
      </Space>
      <Table
        rowKey="id"
        size="small"
        dataSource={backups}
        pagination={false}
        columns={[
          { title: '备份任务', dataIndex: 'name', key: 'name' },
          { title: '类型', dataIndex: 'type', key: 'type', width: 90, render: (v) => ({ full: '全量', incremental: '增量', snapshot: '快照' }[v] || v) },
          { title: '计划', dataIndex: 'schedule', key: 'schedule', width: 120 },
          { title: '最近执行', dataIndex: 'lastRun', key: 'lastRun', width: 160 },
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (v) => <Tag color={v === 'success' ? 'success' : v === 'running' ? 'processing' : 'error'}>{v === 'success' ? '成功' : v === 'running' ? '进行中' : '失败'}</Tag>,
          },
          { title: '大小', dataIndex: 'size', key: 'size', width: 80 },
          {
            title: '操作',
            key: 'action',
            width: 100,
            render: (_, r) => (
              <Button
                type="link"
                size="small"
                icon={<RollbackOutlined />}
                disabled={r.status !== 'success'}
                onClick={() => handleRestore(r)}
              >
                恢复
              </Button>
            ),
          },
        ]}
      />
    </div>
  )
}
