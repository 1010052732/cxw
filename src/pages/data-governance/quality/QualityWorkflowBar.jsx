import { Button, Space, Typography } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

export const QUALITY_WORKFLOW_STEPS = [
  { key: 'sources', label: '分源质量', desc: '评估各数据源' },
  { key: 'pipeline', label: '清洗流水线', desc: '五步标准化处理' },
  { key: 'transform', label: '转换增强', desc: '归一化·特征·关联' },
  { key: 'rules', label: '质量规则', desc: '规则命中处置' },
  { key: 'report', label: '评估报告', desc: '评分·血缘·入库' },
]

export default function QualityWorkflowBar({ active = 'pipeline', onChange, completedSteps = [] }) {
  return (
    <div className="quality-workflow-bar">
      <Text type="secondary">清洗治理流程：</Text>
      {QUALITY_WORKFLOW_STEPS.map((step, index) => (
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
