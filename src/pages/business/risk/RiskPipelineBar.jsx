import { Button, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const STEPS = [
  { key: 'identify', label: '风险识别', path: '/risk/identification' },
  { key: 'assess', label: '风险评估', path: '/risk/assessment' },
  { key: 'respond', label: '风险应对', path: '/risk/response' },
  { key: 'case', label: '案例库', path: '/risk/case' },
]

/**
 * 风险防控全流程导航条
 * @param {'identify'|'assess'|'respond'|'case'} current
 * @param {string} [activeLabel] 当前页补充说明
 */
export default function RiskPipelineBar({ current = 'identify', activeLabel, extra }) {
  const navigate = useNavigate()
  const idx = STEPS.findIndex((s) => s.key === current)

  return (
    <div className="business-filter-bar risk-pipeline-bar">
      <Space wrap size={[4, 8]}>
        <Text type="secondary">防控闭环</Text>
        {STEPS.map((step, i) => (
          <Button
            key={step.key}
            type={step.key === current ? 'primary' : 'link'}
            size="small"
            onClick={() => navigate(step.path)}
          >
            {i + 1}. {step.label}
            {step.key === current && activeLabel ? ` · ${activeLabel}` : ''}
          </Button>
        ))}
        {idx >= 0 && idx < STEPS.length - 2 && (
          <Button type="link" size="small" onClick={() => navigate(STEPS[idx + 1].path)}>
            下一步 →
          </Button>
        )}
      </Space>
      {extra}
    </div>
  )
}
