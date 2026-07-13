import { useMemo, useState } from 'react'
import {
  App,
  Alert,
  Button,
  Col,
  Descriptions,
  Drawer,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import { EyeOutlined, PlayCircleOutlined, SettingOutlined } from '@ant-design/icons'
import {
  DEDUP_ENTITY_PREVIEW,
  FORMAT_STANDARD_RULES,
} from '../../../mock/data-governance'

const { Text, Paragraph } = Typography

const STRATEGY_OPTIONS = [
  { value: 'delete', label: '删除记录' },
  { value: 'mean', label: '均值填充' },
  { value: 'median', label: '中位数填充' },
  { value: 'constant', label: '常量填充' },
  { value: 'predict', label: '模型预测填充' },
]

const stepConfigFields = {
  dedup: [
    { key: 'matchField', label: '精确匹配字段', type: 'select', options: ['creditCode', 'registrationNo', 'standardName'] },
    { key: 'similarityThreshold', label: '相似度阈值', type: 'number', min: 0.8, max: 1, step: 0.01 },
    { key: 'strategy', label: '合并策略', type: 'select', options: ['merge', 'keep_latest', 'keep_richest'] },
  ],
  missing: [
    { key: 'defaultStrategy', label: '默认策略', type: 'select', options: ['delete', 'median', 'mean', 'constant', 'predict'] },
  ],
  outlier: [
    { key: 'method', label: '检测方法', type: 'select', options: ['sigma3', 'isolation_forest', 'boxplot'] },
    { key: 'sigma', label: 'σ 倍数', type: 'number', min: 2, max: 5 },
    { key: 'action', label: '默认动作', type: 'select', options: ['mark', 'delete', 'correct'] },
  ],
  format: [
    { key: 'dateFormat', label: '日期格式', type: 'select', options: ['ISO8601', 'YYYY-MM-DD'] },
    { key: 'currency', label: '基准币种', type: 'select', options: ['USD', 'CNY', 'EUR'] },
    { key: 'countryCode', label: '国家编码', type: 'select', options: ['ISO3166', 'ISO3166-2'] },
  ],
  text: [
    { key: 'nlp', label: '启用 NLP', type: 'switch' },
    { key: 'lang', label: '语言', type: 'select', options: ['zh,en', 'zh', 'en'] },
  ],
}

export default function PipelineTab({
  pipeline,
  setPipeline,
  selectedBatch,
  setSelectedBatch,
  currentBatch,
  alertContext,
  batches,
  samples,
  outliers,
  setOutlierModal,
  running,
  runStepIndex,
  onRunPipeline,
  cleaningJobs,
  missingStrategies,
  setMissingStrategies,
}) {
  const { message } = App.useApp()
  const [configStep, setConfigStep] = useState(null)
  const [dedupOpen, setDedupOpen] = useState(false)
  const [form] = Form.useForm()

  const enabledSteps = pipeline.filter((s) => s.enabled).length
  const enabledPipeline = useMemo(() => pipeline.filter((s) => s.enabled), [pipeline])
  const batchOutliers = useMemo(() => {
    if (!currentBatch?.sourceId) return outliers
    return outliers.filter((o) => !o.sourceId || o.sourceId === currentBatch.sourceId)
  }, [outliers, currentBatch])
  const pendingOutliers = batchOutliers.filter((o) => o.action === 'pending').length

  const openConfig = (step) => {
    setConfigStep(step)
    form.setFieldsValue(step.config)
  }

  const saveConfig = () => {
    const values = form.getFieldsValue()
    setPipeline((prev) => prev.map((s) => (s.id === configStep.id ? { ...s, config: { ...s.config, ...values } } : s)))
    setConfigStep(null)
    message.success(`${configStep.name} 配置已保存`)
  }

  const updateMissingStrategy = (field, strategy) => {
    setMissingStrategies((prev) =>
      prev.map((item) => (item.field === field ? { ...item, strategy } : item)),
    )
    message.success(`${field} 策略已更新`)
  }

  const compareColumns = [
    { title: '字段', dataIndex: 'field', key: 'field', width: 120 },
    {
      title: '清洗前',
      dataIndex: 'before',
      key: 'before',
      ellipsis: true,
      render: (v) => <Text type="secondary">{v ?? 'NULL'}</Text>,
    },
    {
      title: '清洗后',
      dataIndex: 'after',
      key: 'after',
      ellipsis: true,
      render: (v) => <Text strong>{v}</Text>,
    },
    { title: '处理步骤', dataIndex: 'step', key: 'step', width: 110 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v) => {
        const map = {
          fixed: { c: 'success', t: '已修正' },
          filled: { c: 'processing', t: '已补全' },
          outlier: { c: 'error', t: '异常' },
        }
        const m = map[v] || { c: 'default', t: v }
        return <Tag color={m.c}>{m.t}</Tag>
      },
    },
  ]

  return (
    <>
      <div className="business-panel" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <h3 className="business-panel-title" style={{ margin: 0 }}>待清洗数据批次</h3>
            <Text type="secondary">选择采集完成的数据批次，配置并运行标准化清洗流水线</Text>
            {currentBatch && (
              <Space wrap style={{ marginTop: 8 }}>
                <Tag color="#B32620">{currentBatch.id}</Tag>
                <Tag color={currentBatch.status === 'warning' ? 'warning' : 'processing'}>
                  {currentBatch.status === 'warning' ? '采集异常待修复' : '待清洗'}
                </Tag>
                <Text type="secondary">清洗前质量分 {currentBatch.qualityBefore}</Text>
                {alertContext?.batchId === currentBatch.id && (
                  <Tag color="orange">来自采集预警</Tag>
                )}
              </Space>
            )}
          </Col>
          <Col>
            <Select
              style={{ width: 320 }}
              value={selectedBatch}
              onChange={setSelectedBatch}
              options={batches.map((b) => ({
                value: b.id,
                label: `${b.sourceName} · ${b.records.toLocaleString()} 条 · ${b.collectedAt}`,
              }))}
            />
          </Col>
        </Row>
        {currentBatch?.status === 'warning' && alertContext && (
          <Alert
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
            message="预警关联批次：请先处理下方异常值，再运行清洗流水线"
          />
        )}
      </div>

      <div className="business-panel" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 className="business-panel-title" style={{ margin: 0 }}>
              可配置清洗流水线（{enabledSteps}/5 步启用）
            </h3>
            <Text type="secondary">去重与合并 → 缺失值处理 → 异常值检测 → 格式标准化 → 文本清洗</Text>
          </div>
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => setDedupOpen(true)}>消重预览</Button>
            <Button type="primary" icon={<PlayCircleOutlined />} loading={running} onClick={onRunPipeline}>
              运行流水线
            </Button>
          </Space>
        </div>
        <div className="pipeline-steps">
          {pipeline.map((step, idx) => {
            const enabledIdx = enabledPipeline.findIndex((s) => s.id === step.id)
            const isRunning = running && runStepIndex >= 0 && enabledIdx === runStepIndex
            const isDone = running && runStepIndex >= 0 && enabledIdx >= 0 && enabledIdx < runStepIndex
            return (
              <div
                key={step.id}
                className={`pipeline-step-item ${step.enabled ? '' : 'disabled'} ${isRunning ? 'pipeline-step-running' : ''} ${isDone ? 'pipeline-step-done' : ''}`}
              >
                <div className="pipeline-step-order">{step.order}</div>
                <div style={{ flex: 1 }}>
                  <Space wrap>
                    <Text strong>{step.name}</Text>
                    {isRunning && <Tag color="processing">执行中</Tag>}
                    {isDone && <Tag color="success">已完成</Tag>}
                    <Switch size="small" checked={step.enabled} onChange={(c) => setPipeline((prev) => prev.map((s) => (s.id === step.id ? { ...s, enabled: c } : s)))} />
                    <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => openConfig(step)}>
                      配置
                    </Button>
                  </Space>
                  <Paragraph type="secondary" style={{ margin: '4px 0 8px', fontSize: 13 }}>{step.desc}</Paragraph>
                  <Space wrap size={4}>
                    {step.key === 'dedup' && <Tag>消重 {step.removed} 条</Tag>}
                    {step.key === 'missing' && <Tag>补全 {step.filled} 字段</Tag>}
                    {step.key === 'outlier' && <Tag color="warning">异常 {step.outliers} 条</Tag>}
                    {step.key === 'format' && <Tag>标准化 {step.converted} 条</Tag>}
                    {step.key === 'text' && <Tag>NER实体 {step.entities} 个</Tag>}
                  </Space>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">清洗前后对比样本</h3>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              字段级清洗效果 · 可在质量报告页追溯单条记录血缘
            </Text>
            <Table rowKey="id" size="small" columns={compareColumns} dataSource={samples} pagination={false} scroll={{ x: 640 }} />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">异常值待处理 ({pendingOutliers})</h3>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
              3σ / 箱线图 / 孤立森林 · 支持删除、修正或保留
            </Text>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={batchOutliers}
              columns={[
                { title: '字段', dataIndex: 'field', key: 'field', width: 80 },
                { title: '值', dataIndex: 'value', key: 'value', ellipsis: true },
                {
                  title: '状态',
                  dataIndex: 'action',
                  key: 'action',
                  width: 80,
                  render: (v) => {
                    const map = { pending: '待处理', deleted: '已删除', corrected: '已修正', kept: '已保留' }
                    const color = v === 'pending' ? 'warning' : v === 'deleted' ? 'error' : 'success'
                    return <Tag color={color}>{map[v] || v}</Tag>
                  },
                },
                {
                  title: '操作',
                  key: 'op',
                  width: 60,
                  render: (_, r) => (
                    <Button type="link" size="small" onClick={() => setOutlierModal(r)} disabled={r.action !== 'pending'}>
                      处理
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">缺失值处理策略（按字段配置）</h3>
            <Table
              rowKey="field"
              size="small"
              pagination={false}
              dataSource={missingStrategies}
              columns={[
                { title: '字段', dataIndex: 'field', key: 'field', width: 120 },
                { title: '重要性', dataIndex: 'importance', key: 'importance', width: 80, render: (v) => <Tag color={v === '高' ? 'error' : v === '中' ? 'warning' : 'default'}>{v}</Tag> },
                {
                  title: '策略',
                  dataIndex: 'strategy',
                  key: 'strategy',
                  width: 140,
                  render: (v, r) => (
                    <Select
                      size="small"
                      value={v}
                      style={{ width: 130 }}
                      options={STRATEGY_OPTIONS}
                      onChange={(val) => updateMissingStrategy(r.field, val)}
                    />
                  ),
                },
                { title: '回退方案', dataIndex: 'fallback', key: 'fallback', width: 100 },
                { title: '说明', dataIndex: 'desc', key: 'desc', ellipsis: true },
              ]}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">格式标准化规则示例</h3>
            <Table
              rowKey="field"
              size="small"
              pagination={false}
              dataSource={FORMAT_STANDARD_RULES}
              columns={[
                { title: '字段', dataIndex: 'field', key: 'field', width: 90 },
                { title: '清洗前', dataIndex: 'before', key: 'before', ellipsis: true },
                { title: '清洗后', dataIndex: 'after', key: 'after', ellipsis: true },
                { title: '规则', dataIndex: 'rule', key: 'rule', width: 110, render: (v) => <Tag>{v}</Tag> },
              ]}
            />
          </div>
        </Col>
      </Row>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <h3 className="business-panel-title">最近清洗作业</h3>
        <Table
          rowKey="id"
          size="small"
          dataSource={cleaningJobs.slice(0, 5)}
          pagination={false}
          columns={[
            { title: '作业ID', dataIndex: 'id', key: 'id', width: 90 },
            { title: '数据源', dataIndex: 'sourceName', key: 'sourceName', ellipsis: true },
            { title: '步骤', dataIndex: 'steps', key: 'steps', width: 60, render: (v) => `${v}步` },
            { title: '清洗前', dataIndex: 'beforeScore', key: 'beforeScore', width: 80 },
            { title: '清洗后', dataIndex: 'afterScore', key: 'afterScore', width: 80, render: (v) => v ?? '—' },
            { title: '耗时', dataIndex: 'duration', key: 'duration', width: 80 },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 80,
              render: (v) => <Tag color={v === 'success' ? 'success' : v === 'failed' ? 'error' : 'processing'}>{v === 'success' ? '成功' : v === 'failed' ? '失败' : '运行中'}</Tag>,
            },
          ]}
        />
      </div>

      <Drawer title="实体消重与融合预览" open={dedupOpen} onClose={() => setDedupOpen(false)} width={560}>
        {DEDUP_ENTITY_PREVIEW.map((item) => (
          <div key={item.id} className="dedup-preview-card">
            <Space wrap style={{ marginBottom: 8 }}>
              <Tag color="#B32620">{item.matchType}</Tag>
              <Text type="secondary">{item.method}</Text>
            </Space>
            <Text strong>{item.matchKey}</Text>
            <Table
              style={{ marginTop: 8 }}
              size="small"
              pagination={false}
              rowKey="source"
              dataSource={item.records}
              columns={[
                { title: '来源', dataIndex: 'source', key: 'source' },
                { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true },
                { title: '相似度', dataIndex: 'score', key: 'score', width: 80, render: (v) => v.toFixed(2) },
              ]}
            />
            <Alert type="success" showIcon message={item.merged} style={{ marginTop: 8 }} />
          </div>
        ))}
      </Drawer>

      <Drawer
        title={`${configStep?.name || ''} · 步骤配置`}
        open={!!configStep}
        onClose={() => setConfigStep(null)}
        width={420}
        extra={<Button type="primary" onClick={saveConfig}>保存</Button>}
      >
        {configStep && (
          <Form form={form} layout="vertical" size="small">
            {(stepConfigFields[configStep.key] || []).map((field) => (
              <Form.Item key={field.key} name={field.key} label={field.label}>
                {field.type === 'select' ? (
                  <Select options={field.options.map((o) => ({ value: o, label: o }))} />
                ) : field.type === 'number' ? (
                  <InputNumber min={field.min} max={field.max} step={field.step} style={{ width: '100%' }} />
                ) : field.type === 'switch' ? (
                  <Switch />
                ) : null}
              </Form.Item>
            ))}
            <Descriptions bordered column={1} size="small" title="当前效果">
              {configStep.key === 'dedup' && <Descriptions.Item label="已消重">{configStep.removed} 条</Descriptions.Item>}
              {configStep.key === 'missing' && <Descriptions.Item label="已补全">{configStep.filled} 字段</Descriptions.Item>}
              {configStep.key === 'outlier' && <Descriptions.Item label="检出异常">{configStep.outliers} 条</Descriptions.Item>}
            </Descriptions>
          </Form>
        )}
      </Drawer>
    </>
  )
}
