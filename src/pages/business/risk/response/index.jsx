import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Tabs, Typography } from 'antd'
import {
  AuditOutlined,
  DatabaseOutlined,
  FileProtectOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import { loadRiskHandoff } from '../../../../utils/riskHandoff'
import { getActiveRiskCase, loadRiskLifecycle, pushRiskResponsePlan, archiveRiskCase } from '../riskStore'
import RiskPipelineBar from '../RiskPipelineBar'
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
  const [lifecycle, setLifecycle] = useState(() => loadRiskLifecycle())

  const handoff = useMemo(() => loadRiskHandoff(), [searchParams])
  const fromSource = searchParams.get('from') || handoff?.from

  useEffect(() => {
    setLifecycle(loadRiskLifecycle())
  }, [searchParams, activeTab])

  const incomingRisk = useMemo(() => {
    const title = handoff?.title || handoff?.items?.[0] || getActiveRiskCase()?.title
    if (title) {
      const found = PRIORITY_RISK_ITEMS.find((r) => r.title === title || title.includes(r.title.slice(0, 4)))
      if (found) return { ...found, level: handoff?.level || found.level, score: handoff?.score || found.score }
      return {
        ...PRIORITY_RISK_ITEMS[0],
        title,
        type: handoff?.type || PRIORITY_RISK_ITEMS[0].type,
        level: handoff?.level || '橙色',
        score: handoff?.score || PRIORITY_RISK_ITEMS[0].score,
      }
    }
    return PRIORITY_RISK_ITEMS[0]
  }, [handoff])

  const handoffDescription = handoff?.title
    || handoff?.items?.join('、')
    || handoff?.alertTitle
    || lifecycle.activeCase?.title
    || '请制定应对策略并推送执行'

  const handlePushExecution = (plan) => {
    if (plan?.id) setActivePlan(plan)
    const tasks = plan?.actions || plan?.tasks || []
    setInjectedTasks(tasks)
    pushRiskResponsePlan({
      id: plan?.id,
      title: plan?.riskTitle || incomingRisk.title,
      actions: tasks,
      status: '执行中',
    })
    setLifecycle(loadRiskLifecycle())
    changeTab('execution')
  }

  const handleGoTracking = (plan) => {
    if (plan) setActivePlan(plan)
    changeTab('tracking')
  }

  const handleArchive = (payload) => {
    archiveRiskCase({
      title: payload?.title || incomingRisk.title,
      conclusion: payload?.conclusion || '风险已关闭',
      lessons: payload?.lessons || '',
    })
    setLifecycle(loadRiskLifecycle())
    changeTab('archive')
  }

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">风险应对</h1>
        <p className="page-description">
          执行中枢 · 策略 → 预案 → 执行 → 效果跟踪 → 档案沉淀 · 事后复盘优化
        </p>
      </div>

      <RiskPipelineBar current="respond" activeLabel={
        ({ strategy: '策略', emergency: '预案', execution: '执行', tracking: '跟踪', archive: '档案' })[activeTab]
      } />

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

      {fromSource && (
        <Alert
          type="success"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          message="已承接上游风险信号"
          description={`${handoffDescription}${handoff?.score != null ? ` · 评估分 ${handoff.score}` : ''}${handoff?.level ? ` · ${handoff.level}` : ''}`}
        />
      )}

      {lifecycle.activeCase && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={`当前闭环案件：${lifecycle.activeCase.title || '—'}`}
          description={`状态 ${lifecycle.activeCase.status || '进行中'} · 已评估 ${lifecycle.assessments.length} 次 · 应对计划 ${lifecycle.responsePlans.length} 份 · 档案 ${lifecycle.archives.length} 份`}
          action={(
            <a onClick={() => changeTab('archive')}>查看档案</a>
          )}
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
                onGoArchive={handleArchive}
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
                onGoArchive={handleArchive}
              />
            ),
          },
          {
            key: 'archive',
            label: <span><DatabaseOutlined /> 风险档案管理</span>,
            children: <ArchiveTab lifecycle={lifecycle} />,
          },
        ]}
      />
    </div>
  )
}
