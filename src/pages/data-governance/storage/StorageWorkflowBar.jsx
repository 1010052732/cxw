import { Button, Space, Typography } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

export const STORAGE_WORKFLOW_STEPS = [
  { key: 'architecture', label: '多模架构', desc: '热/温/冷分层' },
  { key: 'capacity', label: '容量监控', desc: '趋势与预警' },
  { key: 'lifecycle', label: '生命周期', desc: 'GDPR 合规' },
  { key: 'backup', label: '备份恢复', desc: '全量/增量' },
  { key: 'security', label: '数据安全', desc: '加密与脱敏' },
]

export default function StorageWorkflowBar({ active = 'architecture', onChange, completedSteps = [] }) {
  return (
    <div className="storage-workflow-bar">
      <Text type="secondary">存储治理流程：</Text>
      {STORAGE_WORKFLOW_STEPS.map((step, index) => (
        <Space key={step.key} size={4}>
          {index > 0 && <Text type="secondary">→</Text>}
          {step.key === active ? (
            <Text strong style={{ color: '#B32620' }}>{step.label}</Text>
          ) : (
            <Button
              type="link"
              size="small"
              style={{ padding: 0, height: 'auto' }}
              onClick={() => onChange?.(step.key)}
            >
              {completedSteps.includes(step.key) && (
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
              )}
              {step.label}
            </Button>
          )}
        </Space>
      ))}
    </div>
  )
}
