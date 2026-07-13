import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Button, Space, Tabs, Typography } from 'antd'
import {
  AuditOutlined,
  DatabaseOutlined,
  FileProtectOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import { loadRiskHandoff } from '../../../../utils/riskHandoff'
import StrategyTab from './StrategyTab'
import EmergencyTab from './EmergencyTab'
import ExecutionTab from './ExecutionTab'
import TrackingTab from './TrackingTab'
import ArchiveTab from './ArchiveTab'
import { PRIORITY_RISK_ITEMS } from '../../../../mock/risk'
import '../../business.css'

const { Text } = Typography
const TAB_KEYS = ['strategy', 'emergency', 'execution', 'tracking', 'archive']

export default function RiskResponsePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, changeTab] = useTabSearchParam(TAB_KEYS, 'strategy')
  const [injectedTasks, setInjectedTasks] = useState([])
  const [activePlan, setActivePlan] = useState(null)

  const handoff = useMemo(() => loadRiskHandoff(), [searchParams])
  const fromSource = searchParams.get('from') || handoff?.from

  const incomingRisk = useMemo(() => {
    const title = handoff?.title || handoff?.items?.[0]
    if (title) {
      return PRIORITY_RISK_ITEMS.find((r) => r.title === title || title.includes(r.title.slice(0, 4))) || PRIORITY_RISK_ITEMS[0]
    }
    return PRIORITY_RISK_ITEMS[0]
  }, [handoff])

  const handoffDescription = handoff?.title || handoff?.items?.join('、') || handoff?.alertTitle || '请制定应对策略并推送执行'

  const handlePushExecution = (plan) => {
    if (plan?.id) setActivePlan(plan)
    const tasks = plan?.actions || plan?.tasks || []
    setInjectedTasks(tasks)
    changeTab('execution')
  }

  const handleGoTracking = (plan) => {
    if (plan) setActivePlan(plan)
    changeTab('tracking')
  }

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">风险应对</h1>
        <p className="page-description">策略 → 预案 → 执行 → 效果跟踪 → 档案沉淀 · 可执行 · 可落地 · 可追溯</p>
      </div>

      <div className="assessment-pipeline" style={{ marginBottom: 16 }}>
        {[
          { key: 'strategy', label: '策略制定' },
          { key: 'emergency', label: '预案管理' },
          { key: 'execution', label: '执行跟踪' },
          { key: 'tracking', label: '效果跟踪' },
          { key: 'archive', label: '档案管理' },
        ].map((step, idx, arr) => (
          <div key={step.key} className="assessment-pipeline-item">
            <div
              className={`assessment-pipeline-node${activeTab === step.key ? ' active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => changeTab(step.key)}
            >
              <span>{idx + 1}</span>
              <Text strong>{step.label}</Text>
            </div>
            {idx < arr.length - 1 && <span className="assessment-pipeline-arrow">→</span>}
          </div>
        ))}
      </div>

      <div className="business-filter-bar">
        <Space wrap>
          <Button type="link" size="small" onClick={() => navigate('/risk/assessment?tab=priority')}>← 评估排序</Button>
          <Button type="link" size="small" onClick={() => changeTab('tracking')}>效果跟踪</Button>
          <Button type="link" size="small" onClick={() => changeTab('archive')}>风险档案</Button>
          <Button type="link" size="small" onClick={() => navigate('/risk/case')}>案例库</Button>
        </Space>
      </div>

      {fromSource && (
        <Alert
          type="success"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          message="已承接风险评估结果"
          description={handoffDescription}
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={changeTab}
        items={[
          {
            key: 'strategy',
            label: <span><NodeIndexOutlined /> 应对策略制定</span>,
            children: (
              <StrategyTab
                incomingRisk={incomingRisk}
                onGoExecution={handlePushExecution}
                onGoEmergency={() => changeTab('emergency')}
                onGoTracking={handleGoTracking}
              />
            ),
          },
          {
            key: 'emergency',
            label: <span><FileProtectOutlined /> 应急预案管理</span>,
            children: <EmergencyTab onGoExecution={() => changeTab('execution')} />,
          },
          {
            key: 'execution',
            label: <span><AuditOutlined /> 执行跟踪</span>,
            children: (
              <ExecutionTab
                injectedTasks={injectedTasks}
                onGoArchive={() => changeTab('archive')}
                onGoTracking={() => changeTab('tracking')}
              />
            ),
          },
          {
            key: 'tracking',
            label: <span><LineChartOutlined /> 应对效果跟踪</span>,
            children: (
              <TrackingTab
                activePlan={activePlan}
                onGoStrategy={() => changeTab('strategy')}
                onGoArchive={() => changeTab('archive')}
              />
            ),
          },
          {
            key: 'archive',
            label: <span><DatabaseOutlined /> 风险档案管理</span>,
            children: <ArchiveTab />,
          },
        ]}
      />
    </div>
  )
}
