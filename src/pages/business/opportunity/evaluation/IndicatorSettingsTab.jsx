import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import {
  BUILTIN_CUSTOM_INDICATOR_IDS,
  CREDIT_RATING_ORDER,
  CUSTOM_INDICATOR_VARS,
  EVAL_INDICATOR_MODELS,
  SUB_INDICATOR_GROUPS,
  WEIGHT_SCHEMES,
} from '../../../../mock/opportunity'
import { INDICATOR_DEFINITIONS } from '../indicatorEngine'
import CustomIndicatorBuilder from './CustomIndicatorBuilder'
import {
  appendAuditEntry,
  loadAuditLog,
  saveCustomIndicators,
  saveCustomSchemes,
  saveActiveCustomId,
  saveActiveSchemeName,
  saveCustomEnabled,
  saveEvalThresholds,
  saveEvalWeights,
  saveSubWeights,
} from './evaluationIndicatorStore'

const { Text, Paragraph } = Typography

const DIMENSION_INTRO = [
  {
    key: 'market',
    label: '市场需求',
    question: '有没有空间？',
    desc: '容量、成长性、渗透率与溢价空间',
    color: '#B32620',
  },
  {
    key: 'policy',
    label: '政策环境',
    question: '有没有制度支持？',
    desc: '关税、自贸协定、准入与补贴激励',
    color: '#fa8c16',
  },
  {
    key: 'credit',
    label: '交易信用',
    question: '有没有交易安全性？',
    desc: '买家信用、付款履约与国别风险',
    color: '#1677ff',
  },
]

const DIMENSIONS = [
  { key: 'market', label: '市场需求潜力', color: '#B32620' },
  { key: 'policy', label: '政策环境友好度', color: '#fa8c16' },
  { key: 'credit', label: '交易信用安全度', color: '#1677ff' },
]

function sumWeights(obj) {
  return Object.values(obj || {}).reduce((s, v) => s + v, 0)
}

export default function IndicatorSettingsTab({
  weights,
  setWeights,
  subWeights,
  setSubWeights,
  thresholds,
  setThresholds,
  customFormulas,
  setCustomFormulas,
  customPreset,
  setCustomPreset,
  savedSchemes,
  setSavedSchemes,
  previewItem,
  onRunEvaluate,
  weightValid,
  weightSum,
  customEnabled,
  setCustomEnabled,
  activeSchemeName,
  setActiveSchemeName,
}) {
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editPreset, setEditPreset] = useState(null)
  const [schemeModalOpen, setSchemeModalOpen] = useState(false)
  const [schemeName, setSchemeName] = useState('')
  const [auditLog, setAuditLog] = useState(() => loadAuditLog())
  const [expandedDim, setExpandedDim] = useState('market')

  const presetTableData = useMemo(() => {
    const defMap = new Map(INDICATOR_DEFINITIONS.map((d) => [d.label.replace(/\s*\([^)]*\)/, ''), d]))
    return EVAL_INDICATOR_MODELS.flatMap((model) =>
      model.indicators.flatMap((g) =>
        g.items.map((item, idx) => {
          const def = INDICATOR_DEFINITIONS.find((d) => d.label.includes(item) || item.includes(d.label.split(' ')[0]))
            || defMap.get(item)
          return {
            key: `${model.id}-${g.group}-${idx}`,
            model: model.name,
            dimension: DIMENSIONS.find((d) => d.key === model.dimension)?.label,
            group: g.group,
            indicator: item,
            formula: def?.formula || '—',
            unit: def?.unit || '—',
          }
        }),
      ),
    )
  }, [])

  const presetColumns = [
    { title: '模型名称', dataIndex: 'model', key: 'model', width: 140 },
    { title: '评估维度', dataIndex: 'dimension', key: 'dimension', width: 110 },
    { title: '指标分组', dataIndex: 'group', key: 'group', width: 90 },
    { title: '具体指标', dataIndex: 'indicator', key: 'indicator', width: 140 },
    { title: '计算公式', dataIndex: 'formula', key: 'formula', ellipsis: true },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 72 },
  ]

  const handleWeightChange = (key, value) => {
    setWeights((prev) => {
      const next = { ...prev, [key]: value }
      saveEvalWeights(next)
      return next
    })
  }

  const handleSubWeightChange = (dim, key, value) => {
    setSubWeights((prev) => {
      const next = { ...prev, [dim]: { ...prev[dim], [key]: value } }
      saveSubWeights(next)
      return next
    })
  }

  const handleThresholdChange = (patch) => {
    setThresholds((prev) => {
      const next = { ...prev, ...patch }
      saveEvalThresholds(next)
      return next
    })
    const log = appendAuditEntry({ action: '调整阈值', detail: Object.keys(patch).join('、') })
    setAuditLog(log)
  }

  const handleApplyScheme = (scheme) => {
    const next = { market: scheme.market, policy: scheme.policy, credit: scheme.credit }
    setWeights(next)
    saveEvalWeights(next)
    if (scheme.subWeights) {
      setSubWeights(scheme.subWeights)
      saveSubWeights(scheme.subWeights)
    }
    setActiveSchemeName(scheme.name)
    saveActiveSchemeName(scheme.name)
    const log = appendAuditEntry({ action: '应用权重方案', detail: scheme.name })
    setAuditLog(log)
  }

  const handleNormalizeSubWeights = (dim) => {
    const current = subWeights[dim]
    const total = sumWeights(current)
    if (!total) return
    const normalized = {}
    Object.keys(current).forEach((k) => {
      normalized[k] = Math.round((current[k] / total) * 100)
    })
    const diff = 100 - sumWeights(normalized)
    if (diff !== 0) {
      const firstKey = Object.keys(normalized)[0]
      normalized[firstKey] += diff
    }
    setSubWeights((prev) => {
      const next = { ...prev, [dim]: normalized }
      saveSubWeights(next)
      return next
    })
    const log = appendAuditEntry({ action: '归一化二级权重', detail: DIMENSIONS.find((d) => d.key === dim)?.label })
    setAuditLog(log)
  }

  const handleSaveScheme = () => {
    if (!schemeName.trim()) return
    const customOnly = savedSchemes.filter((s) => s.custom)
    const scheme = {
      id: `ws-custom-${Date.now()}`,
      name: schemeName.trim(),
      market: weights.market,
      policy: weights.policy,
      credit: weights.credit,
      subWeights: { ...subWeights },
      desc: `市场${weights.market}% · 政策${weights.policy}% · 信用${weights.credit}%`,
      custom: true,
    }
    const next = [...customOnly, scheme]
    saveCustomSchemes(next)
    setSavedSchemes([...WEIGHT_SCHEMES, ...next])
    setSchemeModalOpen(false)
    setSchemeName('')
    const log = appendAuditEntry({ action: '保存权重方案', detail: scheme.name })
    setAuditLog(log)
  }

  const handleDeleteScheme = (id) => {
    const customOnly = savedSchemes.filter((s) => s.custom && s.id !== id)
    saveCustomSchemes(customOnly)
    setSavedSchemes([...WEIGHT_SCHEMES, ...customOnly])
  }

  const handleSaveCustom = (preset) => {
    setCustomFormulas((prev) => {
      const exists = prev.some((p) => p.id === preset.id)
      const next = exists ? prev.map((p) => (p.id === preset.id ? preset : p)) : [preset, ...prev]
      saveCustomIndicators(next)
      return next
    })
    setCustomPreset(preset)
    saveActiveCustomId(preset.id)
    setBuilderOpen(false)
    setEditPreset(null)
    const log = appendAuditEntry({ action: '保存自定义指标', detail: preset.name })
    setAuditLog(log)
  }

  const handleRun = () => {
    const log = appendAuditEntry({
      action: '运行评估',
      detail: `权重 市${weights.market}/政${weights.policy}/信${weights.credit} · 阈值信用≥${thresholds.buyerCreditMin}`,
    })
    setAuditLog(log)
    onRunEvaluate()
  }

  return (
    <>
      <div className="evaluation-workflow-bar">
        <Text type="secondary">评估配置流程：</Text>
        <Text>① 预置指标库</Text>
        <Text>→</Text>
        <Text>② 自定义指标</Text>
        <Text>→</Text>
        <Text>③ 权重与阈值</Text>
        <Text>→</Text>
        <Button type="link" size="small" onClick={handleRun} disabled={!weightValid}>④ 运行评估 →</Button>
      </div>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        {DIMENSION_INTRO.map((d) => (
          <Col xs={24} md={8} key={d.key}>
            <div className="eval-dimension-card" style={{ borderTopColor: d.color }}>
              <Text strong style={{ color: d.color }}>{d.label}</Text>
              <div className="eval-dimension-question">{d.question}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>{d.desc}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag>{weights[d.key]}% 权重</Tag>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">预置指标库与模型</h3>
            <Paragraph type="secondary" style={{ fontSize: 13 }}>
              三大核心维度共 27 项指标，计算逻辑与《商机识别系统指标计算逻辑》一致；配置权重后运行评估，分数将同步至分类、大厅与详情页。
            </Paragraph>
            <Table
              size="small"
              pagination={false}
              scroll={{ y: 220 }}
              columns={presetColumns}
              dataSource={presetTableData}
            />
            <Collapse
              style={{ marginTop: 12 }}
              items={EVAL_INDICATOR_MODELS.map((model) => ({
                key: model.id,
                label: (
                  <Space>
                    <Tag color={DIMENSIONS.find((d) => d.key === model.dimension)?.color}>{model.name}</Tag>
                  </Space>
                ),
                children: model.indicators.map((g) => (
                  <div key={g.group} style={{ marginBottom: 8 }}>
                    <Text strong>{g.group}：</Text>
                    <Text type="secondary">{g.items.join(' · ')}</Text>
                  </div>
                )),
              }))}
            />
          </div>

          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>自定义指标构建器</h3>
              <Space>
                <Text type="secondary">参与评估</Text>
                <Switch
                  checked={customEnabled}
                  onChange={(v) => {
                    setCustomEnabled(v)
                    saveCustomEnabled(v)
                    const log = appendAuditEntry({ action: v ? '启用自定义指标' : '关闭自定义指标', detail: customPreset?.name || '' })
                    setAuditLog(log)
                  }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditPreset(null); setBuilderOpen(true) }}>
                  新建指标
                </Button>
              </Space>
            </div>
            <Select
              style={{ width: '100%', marginBottom: 12 }}
              value={customPreset?.id}
              options={customFormulas.map((p) => ({ value: p.id, label: p.name }))}
              onChange={(v) => {
                const p = customFormulas.find((item) => item.id === v)
                setCustomPreset(p)
                saveActiveCustomId(v)
              }}
            />
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="指标说明">{customPreset?.desc || '—'}</Descriptions.Item>
              <Descriptions.Item label="计算公式">{customPreset?.formula}</Descriptions.Item>
              <Descriptions.Item label="可用变量">
                {CUSTOM_INDICATOR_VARS.slice(0, 6).map((v) => v.label).join('、')} 等 {CUSTOM_INDICATOR_VARS.length} 项
              </Descriptions.Item>
            </Descriptions>
            <Space style={{ marginTop: 12 }}>
              <Button icon={<EditOutlined />} onClick={() => { setEditPreset(customPreset); setBuilderOpen(true) }}>编辑</Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={BUILTIN_CUSTOM_INDICATOR_IDS.includes(customPreset?.id)}
                onClick={() => {
                  const next = customFormulas.filter((p) => p.id !== customPreset?.id)
                  setCustomFormulas(next)
                  saveCustomIndicators(next)
                  const fallback = next[0]
                  setCustomPreset(fallback)
                  if (fallback) saveActiveCustomId(fallback.id)
                }}
              >
                删除
              </Button>
            </Space>
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div className="business-panel evaluation-weight-panel">
            <h3 className="business-panel-title">一级维度权重（总和 100%）</h3>
            {DIMENSIONS.map((dim) => (
              <div className="evaluation-weight-item" key={dim.key}>
                <div className="evaluation-weight-label">
                  <span>{dim.label}</span>
                  <strong>{weights[dim.key]}%</strong>
                </div>
                <Slider
                  min={0}
                  max={100}
                  value={weights[dim.key]}
                  onChange={(v) => handleWeightChange(dim.key, v)}
                  trackStyle={{ background: dim.color }}
                />
              </div>
            ))}
            <Text type={weightValid ? 'success' : 'danger'}>权重总和：{weightSum}%</Text>
            {!weightValid && <div className="evaluation-weight-error">权重总和必须等于 100%</div>}

            <Divider style={{ margin: '12px 0' }} />
            <Text strong>二级指标权重</Text>
            <Select
              size="small"
              style={{ width: '100%', margin: '8px 0' }}
              value={expandedDim}
              options={DIMENSIONS.map((d) => ({ value: d.key, label: d.label }))}
              onChange={setExpandedDim}
            />
            {SUB_INDICATOR_GROUPS[expandedDim]?.map((g) => (
              <div className="evaluation-weight-item" key={g.key}>
                <div className="evaluation-weight-label">
                  <span>{g.label}</span>
                  <strong>{subWeights[expandedDim]?.[g.key]}%</strong>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>{g.hint}</Text>
                <Slider
                  min={0}
                  max={100}
                  value={subWeights[expandedDim]?.[g.key]}
                  onChange={(v) => handleSubWeightChange(expandedDim, g.key, v)}
                />
              </div>
            ))}
            <Text type={sumWeights(subWeights[expandedDim]) === 100 ? 'success' : 'warning'}>
              当前维度二级权重：{sumWeights(subWeights[expandedDim])}%
              {sumWeights(subWeights[expandedDim]) !== 100 && (
                <Button type="link" size="small" onClick={() => handleNormalizeSubWeights(expandedDim)}>一键归一化至 100%</Button>
              )}
            </Text>

            {activeSchemeName && (
              <Alert type="info" showIcon style={{ marginTop: 12 }} message={`当前方案：${activeSchemeName}`} />
            )}

            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>权重方案库</Text>
              <Button size="small" icon={<SaveOutlined />} onClick={() => setSchemeModalOpen(true)}>保存当前</Button>
            </div>
            <div style={{ marginTop: 8 }}>
              {savedSchemes.map((s) => (
                <Tag
                  key={s.id}
                  style={{ marginBottom: 4, cursor: 'pointer' }}
                  color={activeSchemeName === s.name ? '#B32620' : undefined}
                  closable={s.custom}
                  onClose={(e) => { e.preventDefault(); handleDeleteScheme(s.id) }}
                  onClick={() => handleApplyScheme(s)}
                >
                  {s.name}
                </Tag>
              ))}
            </div>
          </div>

          <div className="business-panel">
            <h3 className="business-panel-title">阈值设定（硬性约束）</h3>
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message="阈值先行"
              description="低于底线的商机将被标记为「未通过」，即使综合得分较高也不建议进入重点跟进池。"
            />
            <Form layout="vertical" size="small">
              <Form.Item label="买家信用评级底线">
                <Select
                  value={thresholds.buyerCreditRatingMin}
                  options={CREDIT_RATING_ORDER.map((r) => ({ value: r, label: r }))}
                  onChange={(v) => handleThresholdChange({ buyerCreditRatingMin: v })}
                />
              </Form.Item>
              <Form.Item label="买家信用最低分">
                <InputNumber min={0} max={100} value={thresholds.buyerCreditMin} onChange={(v) => handleThresholdChange({ buyerCreditMin: v })} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="综合得分合格线">
                <InputNumber min={0} max={100} value={thresholds.compositeMin} onChange={(v) => handleThresholdChange({ compositeMin: v })} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="政策得分警戒线">
                <InputNumber min={0} max={100} value={thresholds.policyMin} onChange={(v) => handleThresholdChange({ policyMin: v })} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="市场需求合格线">
                <InputNumber min={0} max={100} value={thresholds.marketMin} onChange={(v) => handleThresholdChange({ marketMin: v })} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="阻断高风险商机">
                <Switch checked={thresholds.blockHighRisk} onChange={(v) => handleThresholdChange({ blockHighRisk: v })} />
              </Form.Item>
            </Form>
            <Button type="primary" block icon={<ReloadOutlined />} disabled={!weightValid} onClick={handleRun}>
              运行评估
            </Button>
          </div>

          {auditLog.length > 0 && (
            <div className="business-panel">
              <h3 className="business-panel-title">配置变更记录</h3>
              <Timeline
                className="eval-audit-timeline"
                items={auditLog.slice(0, 6).map((item) => ({
                  color: '#B32620',
                  children: (
                    <div>
                      <Text strong>{item.action}</Text>
                      <Text type="secondary"> · {item.detail}</Text>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.time}</div>
                    </div>
                  ),
                }))}
              />
            </div>
          )}
        </Col>
      </Row>

      <CustomIndicatorBuilder
        open={builderOpen}
        onCancel={() => { setBuilderOpen(false); setEditPreset(null) }}
        onSave={handleSaveCustom}
        previewItem={previewItem}
        initialValues={editPreset}
        allPresets={customFormulas}
      />

      <Modal title="保存权重方案" open={schemeModalOpen} onCancel={() => setSchemeModalOpen(false)} onOk={handleSaveScheme}>
        <Input placeholder="方案名称，如：2026 Q3 扩张方案" value={schemeName} onChange={(e) => setSchemeName(e.target.value)} />
        <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
          将保存当前一级/二级权重配置，可在不同战略情景下快速切换。
        </Paragraph>
      </Modal>
    </>
  )
}
