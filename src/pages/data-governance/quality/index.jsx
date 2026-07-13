import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { App, Alert, Button, Descriptions, Modal, Space, Tabs, Tag, Typography } from 'antd'
import {
  AuditOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
} from '@ant-design/icons'
import {
  BEFORE_AFTER_SAMPLES,
  CLEANING_BATCHES,
  CLEANING_JOBS,
  CLEANING_PIPELINE,
  FEATURE_RULES,
  MISSING_FIELD_STRATEGIES,
  NORMALIZATION_CONFIG,
  OUTLIER_RECORDS,
  QUALITY_DETAIL,
  QUALITY_REPORT,
  QUALITY_RULES,
  QUALITY_RULE_HITS,
  resolveCleaningBatch,
  getSourceNameById,
} from '../../../mock/data-governance'
import { getDownstreamConsumption, getPlatformMetrics, syncPipelineWithMetrics } from '../../../mock/data-bridge'
import DataWorkflowBar from '../DataWorkflowBar'
import QualityWorkflowBar from './QualityWorkflowBar'
import {
  loadQualityWorkflowState,
  markQualityStepComplete,
  saveQualityWorkflowState,
} from './qualityStore'
import PipelineTab from './PipelineTab'
import TransformTab from './TransformTab'
import RulesTab from './RulesTab'
import SourceQualityTab from './SourceQualityTab'
import ReportTab from './ReportTab'
import '../data-governance.css'

const { Text } = Typography

const nowStr = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function DataQualityPage() {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('pipeline')
  const [workflowState, setWorkflowState] = useState(loadQualityWorkflowState)

  const [pipeline, setPipeline] = useState(() => syncPipelineWithMetrics(getPlatformMetrics()))
  const [selectedBatch, setSelectedBatch] = useState(CLEANING_BATCHES[0]?.id)
  const [batches] = useState(CLEANING_BATCHES)
  const [samples] = useState(BEFORE_AFTER_SAMPLES)
  const [outliers, setOutliers] = useState(OUTLIER_RECORDS)
  const [outlierModal, setOutlierModal] = useState(null)
  const [running, setRunning] = useState(false)
  const [runStepIndex, setRunStepIndex] = useState(-1)
  const [reportGenerated, setReportGenerated] = useState(true)
  const [lastRunTime, setLastRunTime] = useState('2026-07-02 10:20')
  const [qualityReport, setQualityReport] = useState(QUALITY_REPORT)
  const [featureRules, setFeatureRules] = useState(FEATURE_RULES)
  const [normConfig, setNormConfig] = useState(NORMALIZATION_CONFIG)
  const [qualityRules, setQualityRules] = useState(QUALITY_RULES)
  const [ruleHits, setRuleHits] = useState(QUALITY_RULE_HITS)
  const [cleaningJobs, setCleaningJobs] = useState(CLEANING_JOBS)
  const [qualityDetail, setQualityDetail] = useState(QUALITY_DETAIL)
  const [missingStrategies, setMissingStrategies] = useState(MISSING_FIELD_STRATEGIES)
  const [transformApplied, setTransformApplied] = useState(workflowState.transformApplied)
  const [highlightSource, setHighlightSource] = useState(null)
  const [alertContext, setAlertContext] = useState(null)
  const handledNavRef = useRef('')
  const runTimerRef = useRef(null)

  useEffect(() => () => {
    if (runTimerRef.current) clearInterval(runTimerRef.current)
  }, [])

  useEffect(() => {
    const navKey = searchParams.toString()
    if (handledNavRef.current === navKey) return
    handledNavRef.current = navKey

    const tab = searchParams.get('tab')
    const sourceId = searchParams.get('source')
    const batchRef = searchParams.get('batch')
    const from = searchParams.get('from')
    const validTabs = ['pipeline', 'transform', 'rules', 'sources', 'report']

    const resolved = resolveCleaningBatch(batchRef || sourceId, batches)
    if (resolved) {
      setSelectedBatch(resolved.id)
    }

    if (sourceId) {
      setHighlightSource(sourceId)
    }

    if (from === 'alert' || from === 'task') {
      const targetTab = validTabs.includes(tab) ? tab : (resolved ? 'pipeline' : 'sources')
      setActiveTab(targetTab)
      if (sourceId) {
        setAlertContext({
          sourceId,
          sourceName: resolved?.sourceName || getSourceNameById(sourceId),
          batchId: resolved?.id,
          from,
        })
      }
      if (resolved) {
        message.info(`已定位「${resolved.sourceName}」待清洗批次 ${resolved.id}`)
      } else if (sourceId) {
        message.warning(`「${getSourceNameById(sourceId)}」暂无待清洗批次，请先确认采集任务已完成`)
      }
    } else if (tab && validTabs.includes(tab)) {
      setActiveTab(tab)
      if (!from) setAlertContext(null)
    }
  }, [searchParams, batches, message])

  const changeTab = useCallback((tab) => {
    setActiveTab(tab)
    const next = { tab }
    const source = searchParams.get('source')
    if (source) next.source = source
    if (selectedBatch) next.batch = selectedBatch
    const from = searchParams.get('from')
    if (from) next.from = from
    setSearchParams(next)
  }, [searchParams, selectedBatch, setSearchParams])

  const handleSelectBatch = (batchId) => {
    setSelectedBatch(batchId)
    const batch = batches.find((b) => b.id === batchId)
    const next = { tab: activeTab, batch: batchId }
    if (batch?.sourceId) next.source = batch.sourceId
    const from = searchParams.get('from')
    if (from) next.from = from
    setSearchParams(next)
  }

  const enabledSteps = pipeline.filter((s) => s.enabled).length
  const enabledPipeline = useMemo(() => pipeline.filter((s) => s.enabled), [pipeline])
  const currentBatch = batches.find((b) => b.id === selectedBatch)
  const downstreamModules = useMemo(() => getDownstreamConsumption(getPlatformMetrics()), [])

  const finishPipelineRun = useCallback((afterOverall, runTime) => {
    setCleaningJobs((prev) => [
      {
        id: `CJ-${Date.now()}`,
        batchId: selectedBatch,
        sourceName: currentBatch?.sourceName || '—',
        pipelineVersion: 'v2.3',
        steps: enabledSteps,
        status: 'success',
        startTime: runTime,
        duration: '6m30s',
        beforeScore: currentBatch?.qualityBefore || qualityReport.before.overall,
        afterScore: afterOverall,
        operator: '当前用户',
      },
      ...prev,
    ])
    if (currentBatch?.sourceId) {
      setQualityDetail((prev) =>
        prev.map((d) =>
          d.id === currentBatch.sourceId
            ? { ...d, quality: Math.min(99, d.quality + 1), integrity: Math.min(100, d.integrity + 0.5) }
            : d,
        ),
      )
    }
    setQualityRules((prev) =>
      prev.map((r) => (r.status === 'open' && r.hitCount > 0 ? { ...r, hitCount: Math.max(0, r.hitCount - 2) } : r)),
    )
    setRunning(false)
    setRunStepIndex(-1)
    setReportGenerated(true)
    setLastRunTime(runTime)
    const nextState = markQualityStepComplete('pipeline')
    saveQualityWorkflowState({ lastBatchId: selectedBatch })
    setWorkflowState(nextState)
    message.success({
      content: `流水线完成 · ${enabledSteps} 步 · 质量分 ${afterOverall.toFixed(1)}`,
      key: 'pipeline',
    })
    modal.confirm({
      title: '清洗流水线已完成',
      content: '建议继续执行「转换与增强」配置特征与关联规则，然后在「质量评估与报告」确认产出并入库。',
      okText: '前往转换增强',
      cancelText: '查看质量报告',
      onOk: () => changeTab('transform'),
      onCancel: () => changeTab('report'),
    })
    if (alertContext) {
      const cleanedSourceId = alertContext.sourceId
      setAlertContext(null)
      setSearchParams({ tab: 'report', batch: selectedBatch, cleaned: cleanedSourceId })
      setActiveTab('report')
    }
  }, [
    alertContext,
    changeTab,
    currentBatch,
    enabledSteps,
    message,
    modal,
    qualityReport.before.overall,
    selectedBatch,
    setSearchParams,
  ])

  const handleRunPipeline = () => {
    if (enabledSteps === 0) {
      message.warning('请至少启用一个清洗步骤')
      return
    }
    if (outliers.some((o) => {
      if (o.action !== 'pending') return false
      if (!o.sourceId) return true
      return o.sourceId === currentBatch?.sourceId
    })) {
      message.warning('请先处理本批次异常值队列中的待办项，或将其标记为保留/删除')
      changeTab('pipeline')
      return
    }

    const runTime = nowStr()
    setRunning(true)
    setRunStepIndex(0)
    message.loading({ content: '清洗流水线运行中...', key: 'pipeline' })

    let step = 0
    runTimerRef.current = setInterval(() => {
      step += 1
      if (step >= enabledPipeline.length) {
        clearInterval(runTimerRef.current)
        runTimerRef.current = null
        const afterOverall = Math.min(99.5, qualityReport.after.overall + 0.2)
        setQualityReport((prev) => ({
          ...prev,
          after: {
            ...prev.after,
            overall: Math.round(afterOverall * 10) / 10,
            integrity: Math.min(100, prev.after.integrity + 0.3),
            accuracy: Math.min(100, prev.after.accuracy + 0.2),
            consistency: Math.min(100, prev.after.consistency + 0.2),
            timeliness: Math.min(100, prev.after.timeliness + 0.1),
          },
        }))
        finishPipelineRun(afterOverall, runTime)
        return
      }
      setRunStepIndex(step)
    }, 900)
  }

  const handleOutlierAction = (id, action) => {
    setOutliers((prev) => prev.map((o) => (o.id === id ? { ...o, action } : o)))
    setOutlierModal(null)
    message.success('异常值处理已保存')
  }

  const handleApplyTransform = () => {
    setTransformApplied(true)
    const nextState = markQualityStepComplete('transform')
    saveQualityWorkflowState({ transformApplied: true })
    setWorkflowState(nextState)
    message.success('转换与增强规则已应用 · 归一化、特征工程与数据关联已生效')
    modal.confirm({
      title: '转换规则已应用',
      content: '是否前往生成质量评估报告并确认下游入库？',
      okText: '生成报告',
      onOk: () => changeTab('report'),
    })
  }

  const handleGoReport = () => {
    markQualityStepComplete('report')
    setWorkflowState(loadQualityWorkflowState())
    changeTab('report')
  }

  return (
    <div className="data-gov-page">
      <div className="business-page-header">
        <h1 className="page-title">深度数据清洗与预处理</h1>
        <p className="page-description">
          将多源异构原始数据转化为结构规范、语义一致的高质量数据资产 · 支撑商机识别与风险分析的可信输入
        </p>
      </div>

      <DataWorkflowBar
        active="quality"
        extra={(
          <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => navigate('/data/models?tab=factory')}>
            清洗完成 · 进入模型训练 →
          </Button>
        )}
      />

      <QualityWorkflowBar
        active={activeTab}
        completedSteps={workflowState.completedSteps}
        onChange={changeTab}
      />

      <div className="business-stat-grid quality-dimension-grid" style={{ marginBottom: 16 }}>
        <div className="business-stat-card">
          <div className="value">{qualityReport.after.overall}</div>
          <div className="label">综合质量分</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{qualityReport.after.integrity}%</div>
          <div className="label">完整性</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{qualityReport.after.accuracy}%</div>
          <div className="label">准确性</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{qualityReport.after.consistency}%</div>
          <div className="label">一致性</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{qualityReport.after.timeliness}%</div>
          <div className="label">时效性</div>
        </div>
      </div>

      {alertContext && (
        <Alert
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setAlertContext(null)}
          message={`采集预警联动 · ${alertContext.sourceName}`}
          description={
            alertContext.batchId
              ? `已自动选中清洗批次 ${alertContext.batchId}。请检查流水线步骤与异常值队列，执行清洗后可在「质量评估与报告」确认产出并回流商机/风险模块。`
              : '该数据源暂无待清洗批次，请先在采集监控确认采集任务已完成，或前往分源质量页发起清洗。'
          }
          action={(
            <Space>
              <Button size="small" onClick={() => navigate('/data/monitor?tab=alerts')}>返回预警</Button>
              {alertContext.batchId && (
                <Button size="small" type="primary" onClick={() => changeTab('pipeline')}>前往流水线</Button>
              )}
            </Space>
          )}
        />
      )}

      <div className="business-panel quality-downstream-panel" style={{ marginBottom: 16 }}>
        <h3 className="business-panel-title">清洗产出 · 业务模块联动</h3>
        <Space wrap>
          {downstreamModules.map((item) => (
            <Tag
              key={item.key}
              color="#B32620"
              style={{ cursor: 'pointer', padding: '4px 10px' }}
              onClick={() => navigate(item.route)}
            >
              {item.module}：{item.metric}
            </Tag>
          ))}
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={changeTab}
        items={[
          {
            key: 'sources',
            label: <span><DatabaseOutlined /> 分源质量</span>,
            children: (
              <SourceQualityTab
                qualityDetail={qualityDetail}
                batches={batches}
                highlightSourceId={highlightSource}
                onSelectBatch={handleSelectBatch}
                setActiveTab={changeTab}
              />
            ),
          },
          {
            key: 'pipeline',
            label: <span><ExperimentOutlined /> 标准化清洗流水线</span>,
            children: (
              <PipelineTab
                pipeline={pipeline}
                setPipeline={setPipeline}
                selectedBatch={selectedBatch}
                setSelectedBatch={handleSelectBatch}
                currentBatch={currentBatch}
                alertContext={alertContext}
                batches={batches}
                samples={samples}
                outliers={outliers}
                setOutlierModal={setOutlierModal}
                running={running}
                runStepIndex={runStepIndex}
                onRunPipeline={handleRunPipeline}
                cleaningJobs={cleaningJobs}
                missingStrategies={missingStrategies}
                setMissingStrategies={setMissingStrategies}
              />
            ),
          },
          {
            key: 'transform',
            label: <span><FundProjectionScreenOutlined /> 转换与增强</span>,
            children: (
              <TransformTab
                featureRules={featureRules}
                setFeatureRules={setFeatureRules}
                normConfig={normConfig}
                setNormConfig={setNormConfig}
                transformApplied={transformApplied}
                onApplyTransform={handleApplyTransform}
                onGoReport={handleGoReport}
              />
            ),
          },
          {
            key: 'rules',
            label: <span><AuditOutlined /> 质量规则</span>,
            children: (
              <RulesTab
                qualityRules={qualityRules}
                setQualityRules={setQualityRules}
                ruleHits={ruleHits}
                setRuleHits={setRuleHits}
                onRunPipeline={() => changeTab('pipeline')}
              />
            ),
          },
          {
            key: 'report',
            label: <span><FileTextOutlined /> 质量评估与报告</span>,
            children: (
              <ReportTab
                qualityReport={qualityReport}
                reportGenerated={reportGenerated}
                setReportGenerated={setReportGenerated}
                lastRunTime={lastRunTime}
                cleaningJobs={cleaningJobs}
                samples={samples}
              />
            ),
          },
        ]}
      />

      <Modal title="异常值处理" open={!!outlierModal} onCancel={() => setOutlierModal(null)} footer={null}>
        {outlierModal && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="字段">{outlierModal.field}</Descriptions.Item>
              <Descriptions.Item label="异常值">{outlierModal.value}</Descriptions.Item>
              <Descriptions.Item label="可能原因">{outlierModal.reason}</Descriptions.Item>
              <Descriptions.Item label="检测方法">3σ原则 / 箱线图 / 孤立森林多维检测</Descriptions.Item>
            </Descriptions>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              根据业务判断选择：录入错误可修正或删除；单位混淆建议修正；极端真实事件可保留。
            </Text>
            <Space>
              <Button danger onClick={() => handleOutlierAction(outlierModal.id, 'deleted')}>删除</Button>
              <Button onClick={() => handleOutlierAction(outlierModal.id, 'corrected')}>修正</Button>
              <Button type="primary" onClick={() => handleOutlierAction(outlierModal.id, 'kept')}>保留</Button>
            </Space>
          </>
        )}
      </Modal>
    </div>
  )
}
