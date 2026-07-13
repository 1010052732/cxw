import { Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const STEPS = [
  { label: '部门建档', path: '/system/department' },
  { label: '角色定义', path: '/system/role' },
  { label: '权限分配', path: '/system/permission' },
  { label: '账号绑定', path: '/system/account' },
  { label: '业务生效', path: '/risk/assessment' },
  { label: '审计追溯', path: '/system/audit' },
]

export default function SystemWorkflow({ activePath }) {
  const navigate = useNavigate()

  return (
    <div className="assessment-pipeline system-workflow" style={{ marginBottom: 16 }}>
      {STEPS.map((step, idx) => {
        const active = activePath === step.path
        return (
          <div key={step.label} className="assessment-pipeline-item">
            <div
              className={`assessment-pipeline-node${active ? ' active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(step.path)}
            >
              <span>{idx + 1}</span>
              <Text strong>{step.label}</Text>
            </div>
            {idx < STEPS.length - 1 && <span className="assessment-pipeline-arrow">→</span>}
          </div>
        )
      })}
    </div>
  )
}
