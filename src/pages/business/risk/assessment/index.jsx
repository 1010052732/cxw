import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Tabs } from 'antd'
import {
  ApartmentOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  FundProjectionScreenOutlined,
  OrderedListOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import { loadAssessmentHandoff, handoffToResponse } from '../../../../utils/riskHandoff'
import { getPendingAssessments, pushRiskAssessment } from '../riskStore'
import RiskPipelineBar from '../RiskPipelineBar'
import OverviewTab from './OverviewTab'
import ModelTab from './ModelTab'
import ParameterTab from './ParameterTab'
import ResultsTab from './ResultsTab'
import PriorityTab from './PriorityTab'
import QuickTab from './QuickTab'
import '../../business.css'

const TAB_KEYS = ['overview', 'model', 'params', 'results', 'priority', 'quick']

const defaultConfig = {
  modelId: 'el',
  profileId: 'b2b',
  signal: null,
  wizard: null,
}

export default function RiskAssessmentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, changeTab] = useTabSearchParam(TAB_KEYS, 'overview')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [assessmentConfig, setAssessmentConfig] = useState(defaultConfig)
  const [incoming, setIncoming] = useState(null)

  useEffect(() => {
    const handoff = loadAssessmentHandoff()
    const pending = getPendingAssessments()
    if (handoff) {
      const signal = {
        id: handoff.alertId || handoff.id || `SIG-${Date.now()}`,
        title: handoff.title,
        type: handoff.type || '综合风险',
        level: handoff.level || '橙色',
        suggestedModel: handoff.suggestedModel || 'el',
      }
      setIncoming(handoff)
      setSelectedSignal(signal)
      setAssessmentConfig((c) => ({ ...c, signal, modelId: signal.suggestedModel }))
      if (searchParams.get('from') || searchParams.get('tab') === 'model') {
        changeTab('model')
      }
      return
    }
    if (pending[0]) {
      const p = pending[0]
      setSelectedSignal({
        id: p.id,
        title: p.title,
        type: p.type,
        level: p.level,
        suggestedModel: p.suggestedModel || 'el',
      })
    }
  }, [searchParams, changeTab])

  const goModel = (signal) => {
    if (signal) {
      setSelectedSignal(signal)
      setAssessmentConfig((c) => ({ ...c, signal, modelId: signal.suggestedModel || c.modelId }))
    }
    changeTab('model')
  }

  const goParams = (partial) => {
    setAssessmentConfig((c) => ({ ...c, ...partial }))
    changeTab('params')
  }

  const goResponse = (payload = {}) => {
    const title = payload.title || selectedSignal?.title || assessmentConfig.signal?.title || '风险评估处置'
    pushRiskAssessment({
      title,
      modelId: payload.modelId || assessmentConfig.modelId,
      modelName: payload.modelName,
      score: payload.score,
      level: payload.level,
      signalId: selectedSignal?.id,
    })
    handoffToResponse({
      from: payload.from || 'assessment',
      title,
      level: payload.level,
      score: payload.score,
      modelName: payload.modelName,
      items: payload.items,
    }, navigate)
  }

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">风险评估</h1>
        <p className="page-description">
          决策中枢 · 模型选择 → 参数设置 → 结果展示 → 优先级排序 · 事中动态干预
        </p>
      </div>

      <RiskPipelineBar current="assess" activeLabel={
        ({ overview: '概览', model: '模型', params: '参数', results: '结果', priority: '排序', quick: '快速' })[activeTab]
      } />

      {incoming && (
        <Alert
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          message="已承接风险识别预警"
          description={`${incoming.title || ''} · 建议模型：${incoming.suggestedModel || '按向导选择'} · 请完成量化评估后推送应对`}
        />
      )}

      <div className="assessment-pipeline" style={{ marginBottom: 16 }}>
        {[
          { key: 'model', label: '模型选择' },
          { key: 'params', label: '参数设置' },
          { key: 'results', label: '结果展示' },
          { key: 'priority', label: '优先级' },
        ].map((step, idx, arr) => (
          <div key={step.key} className="assessment-pipeline-item">
            <div
              className={`assessment-pipeline-node${activeTab === step.key ? ' active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => changeTab(step.key)}
            >
              <span>{idx + 1}</span>
              <span>{step.label}</span>
            </div>
            {idx < arr.length - 1 && <span className="assessment-pipeline-arrow">→</span>}
          </div>
        ))}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={changeTab}
        items={[
          {
            key: 'overview',
            label: <span><FundProjectionScreenOutlined /> 评估概览</span>,
            children: (
              <OverviewTab
                onGoModel={goModel}
                onGoParams={() => changeTab('params')}
                onGoResults={() => changeTab('results')}
                onGoResponse={() => goResponse({ from: 'assessment-overview' })}
              />
            ),
          },
          {
            key: 'model',
            label: <span><ExperimentOutlined /> 模型选择</span>,
            children: (
              <ModelTab
                initialSignal={selectedSignal}
                onGoParams={goParams}
                onGoResults={() => changeTab('results')}
                onGoResponse={(p) => goResponse({ from: 'assessment-model', ...p })}
              />
            ),
          },
          {
            key: 'params',
            label: <span><SettingOutlined /> 参数设置</span>,
            children: (
              <ParameterTab
                config={assessmentConfig}
                onGoModel={() => changeTab('model')}
                onGoResults={() => changeTab('results')}
                onGoResponse={(p) => goResponse({ from: 'assessment-params', ...p })}
              />
            ),
          },
          {
            key: 'results',
            label: <span><BarChartOutlined /> 评估结果展示</span>,
            children: <ResultsTab onGoPriority={() => changeTab('priority')} />,
          },
          {
            key: 'priority',
            label: <span><OrderedListOutlined /> 排序与优先级</span>,
            children: <PriorityTab onGoResponse={(p) => goResponse({ from: 'priority-queue', ...p })} />,
          },
          {
            key: 'quick',
            label: <span><ApartmentOutlined /> 快速评估</span>,
            children: <QuickTab onGoResponse={(p) => goResponse({ from: 'assessment-quick', ...p })} />,
          },
        ]}
      />
    </div>
  )
}
