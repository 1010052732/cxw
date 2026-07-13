import { Button, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const STEPS = [
  { key: 'config', label: '数据源配置', path: '/data/config' },
  { key: 'monitor', label: '采集监控', path: '/data/monitor' },
  { key: 'quality', label: '清洗预处理', path: '/data/quality' },
  { key: 'storage', label: '安全存储', path: '/data/storage' },
  { key: 'models', label: '模型算法', path: '/data/models' },
]

export default function DataWorkflowBar({ active = 'config', extra }) {
  const navigate = useNavigate()
  return (
    <div className="data-workflow-bar">
      <Text type="secondary">数据中心闭环：</Text>
      {STEPS.map((step, i) => (
        <Space key={step.key} size={4}>
          {i > 0 && <Text type="secondary">→</Text>}
          {step.key === active ? (
            <Text strong style={{ color: '#B32620' }}>{step.label}</Text>
          ) : (
            <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => navigate(step.path)}>
              {step.label}
            </Button>
          )}
        </Space>
      ))}
      {extra}
    </div>
  )
}
