import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  BranchesOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { FILTER_METRIC_POOL } from '../../../../mock/opportunity'
import {
  ALL_METRICS,
  LOGIC_OPTIONS,
  OPERATOR_OPTIONS,
  buildFilterExpression,
  countConditions,
  createCondition,
  createFilterGroup,
  formatConditionLabel,
  getMetricMeta,
} from './filterModel'
import { filterGroupToTemplatePayload } from './filterTemplateStore'
import '../opportunity.css'

const { Text, Paragraph } = Typography

function ConditionEditor({ condition, onChange, onRemove, showLogicTag, logicLabel }) {
  const meta = getMetricMeta(condition.field)
  const operators = meta?.type === 'text'
    ? OPERATOR_OPTIONS.filter((o) => ['eq', 'neq', 'contains'].includes(o.value))
    : meta?.type === 'date'
      ? OPERATOR_OPTIONS.filter((o) => ['gte', 'lte', 'eq'].includes(o.value))
      : meta?.type === 'select'
        ? OPERATOR_OPTIONS.filter((o) => ['eq', 'neq'].includes(o.value))
        : OPERATOR_OPTIONS.filter((o) => o.value !== 'contains')

  const valueControl = (() => {
    if (meta?.type === 'select') {
      return (
        <Select
          style={{ width: 140 }}
          value={condition.value}
          options={(meta.options || []).map((o) => ({ value: o, label: o }))}
          onChange={(v) => onChange({ value: v, label: '' })}
        />
      )
    }
    if (meta?.type === 'date') {
      return (
        <Input
          type="date"
          style={{ width: 150 }}
          value={condition.value ? String(condition.value).slice(0, 10) : ''}
          onChange={(e) => onChange({ value: e.target.value, label: '' })}
        />
      )
    }
    if (meta?.type === 'number') {
      return (
        <InputNumber
          style={{ width: 120 }}
          value={condition.value}
          onChange={(v) => onChange({ value: v, label: '' })}
        />
      )
    }
    return (
      <Input
        style={{ width: 140 }}
        value={condition.value}
        onChange={(e) => onChange({ value: e.target.value, label: '' })}
      />
    )
  })()

  return (
    <div className="filter-builder-row">
      {showLogicTag && <Tag className="filter-logic-tag">{logicLabel}</Tag>}
      <Tooltip title="单条件取反 (NOT)">
        <Switch
          size="small"
          checked={condition.negate}
          checkedChildren="NOT"
          unCheckedChildren="—"
          onChange={(negate) => onChange({ negate })}
        />
      </Tooltip>
      <Select
        style={{ width: 200 }}
        value={condition.field}
        options={ALL_METRICS.map((m) => ({ value: m.field, label: `${m.label}` }))}
        onChange={(field) => {
          const nextMeta = getMetricMeta(field)
          onChange({
            field,
            operator: nextMeta?.type === 'text' ? 'contains' : nextMeta?.type === 'date' ? 'gte' : 'gte',
            value: nextMeta?.type === 'number' ? 80 : nextMeta?.type === 'select' ? nextMeta.options?.[0] : '',
            label: '',
          })
        }}
      />
      <Select
        style={{ width: 72 }}
        value={condition.operator}
        options={operators}
        onChange={(operator) => onChange({ operator, label: '' })}
      />
      {valueControl}
      <Button type="link" danger icon={<DeleteOutlined />} onClick={onRemove}>删除</Button>
    </div>
  )
}

function FilterTreeCanvas({ group }) {
  const expr = buildFilterExpression(group)
  const normalized = group

  return (
    <div className="filter-rule-canvas">
      <div className="filter-rule-root">
        <Tag color="#B32620" className="filter-rule-logic">{normalized.logic}</Tag>
        <Text type="secondary">根逻辑组 · {countConditions(normalized)} 个条件</Text>
      </div>
      <div className="filter-rule-branches">
        {normalized.conditions.map((cond) => (
          <div key={cond.id} className="filter-rule-node">
            {cond.negate && <Tag>NOT</Tag>}
            <Tag color="processing">{getMetricMeta(cond.field)?.label || cond.field}</Tag>
            <Text>{formatConditionLabel(cond)}</Text>
          </div>
        ))}
        {normalized.groups.map((sub, index) => (
          <div key={`sub-${index}`} className="filter-rule-subgroup">
            <Tag color="orange">{sub.logic} 子组</Tag>
            {sub.conditions.map((cond) => (
              <div key={cond.id} className="filter-rule-node nested">
                {cond.negate && <Tag>NOT</Tag>}
                <Text>{formatConditionLabel(cond)}</Text>
              </div>
            ))}
          </div>
        ))}
        {!normalized.conditions.length && !normalized.groups.length && (
          <Text type="secondary">从右侧指标池点击添加，或使用「添加条件」</Text>
        )}
      </div>
      <Paragraph type="secondary" className="filter-rule-expression">
        <BranchesOutlined /> 筛选表达式：{expr}
      </Paragraph>
    </div>
  )
}

export default function FilterBuilderTab({
  dataSource,
  filterGroup,
  setFilterGroup,
  savedTemplates,
  setSavedTemplates,
  previewCount,
  onRunPipeline,
}) {
  const { message } = App.useApp()
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveForm] = Form.useForm()

  const updateRoot = (patch) => setFilterGroup((prev) => ({ ...prev, ...patch }))

  const updateCondition = (id, patch, groupIndex = null) => {
    setFilterGroup((prev) => {
      if (groupIndex == null) {
        return {
          ...prev,
          conditions: prev.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }
      }
      const groups = [...prev.groups]
      groups[groupIndex] = {
        ...groups[groupIndex],
        conditions: groups[groupIndex].conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }
      return { ...prev, groups }
    })
  }

  const removeCondition = (id, groupIndex = null) => {
    setFilterGroup((prev) => {
      if (groupIndex == null) {
        return { ...prev, conditions: prev.conditions.filter((c) => c.id !== id) }
      }
      const groups = [...prev.groups]
      groups[groupIndex] = {
        ...groups[groupIndex],
        conditions: groups[groupIndex].conditions.filter((c) => c.id !== id),
      }
      return { ...prev, groups }
    })
  }

  const addCondition = (field, groupIndex = null) => {
    const cond = createCondition(field ? { field } : {})
    setFilterGroup((prev) => {
      if (groupIndex == null) {
        return { ...prev, conditions: [...prev.conditions, cond] }
      }
      const groups = [...(prev.groups || [])]
      if (!groups[groupIndex]) return prev
      groups[groupIndex] = { ...groups[groupIndex], conditions: [...groups[groupIndex].conditions, cond] }
      return { ...prev, groups }
    })
  }

  const addSubGroup = () => {
    setFilterGroup((prev) => ({
      ...prev,
      groups: [...(prev.groups || []), createFilterGroup({ logic: 'OR', conditions: [] })],
    }))
    message.info('已添加子条件组，可用于 (A AND B) OR (C AND D) 等层级组合')
  }

  const removeSubGroup = (index) => {
    setFilterGroup((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }))
  }

  const loadTemplate = (tplId) => {
    const tpl = savedTemplates.find((t) => t.id === tplId)
    if (!tpl) return
    setFilterGroup({
      logic: tpl.logic || 'AND',
      conditions: (tpl.conditions || []).map((c, i) => ({ ...createCondition(), ...c, id: `load-${i}-${c.field}` })),
      groups: (tpl.groups || []).map((g, gi) => ({
        logic: g.logic || 'AND',
        conditions: (g.conditions || []).map((c, ci) => ({ ...createCondition(), ...c, id: `load-${gi}-${ci}` })),
        groups: [],
      })),
    })
    message.success(`已加载筛选模板「${tpl.name}」`)
  }

  const deleteTemplate = (tplId) => {
    setSavedTemplates((prev) => {
      const next = prev.filter((t) => t.id !== tplId)
      return next
    })
    message.success('模板已删除')
  }

  const handleSaveTemplate = () => {
    saveForm.validateFields().then((values) => {
      const tpl = filterGroupToTemplatePayload(filterGroup, {
        id: `ft-custom-${Date.now()}`,
        name: values.name,
        shared: values.shared,
      })
      setSavedTemplates((prev) => [tpl, ...prev])
      setSaveModalOpen(false)
      saveForm.resetFields()
      message.success(values.shared ? '筛选模板已保存并标记为团队共享' : '筛选模板已保存')
    })
  }

  const metricSections = useMemo(
    () => FILTER_METRIC_POOL.filter((g) => g.category !== 'basic'),
    [],
  )

  return (
    <Row gutter={16}>
      <Col xs={24} lg={16}>
        <div className="business-panel">
          <div className="filter-builder-header">
            <div>
              <h3 className="business-panel-title" style={{ margin: 0 }}>图形化筛选器</h3>
              <Text type="secondary">可视化构建筛选规则 · 支持数值/分类/文本/日期 · AND / OR / NOT 层级组合</Text>
            </div>
            <Space wrap>
              <Select
                placeholder="加载筛选模板"
                style={{ width: 220 }}
                allowClear
                options={savedTemplates.map((t) => ({
                  value: t.id,
                  label: t.shared ? `${t.name}（共享）` : t.name,
                }))}
                onChange={loadTemplate}
              />
              <Button icon={<SaveOutlined />} onClick={() => setSaveModalOpen(true)}>保存为模板</Button>
            </Space>
          </div>

          <FilterTreeCanvas group={filterGroup} />

          <Space wrap style={{ margin: '16px 0' }}>
            <Text>根逻辑：</Text>
            <Select
              value={filterGroup.logic}
              style={{ width: 160 }}
              onChange={(logic) => updateRoot({ logic })}
              options={LOGIC_OPTIONS}
            />
            <Button icon={<PlusOutlined />} onClick={() => addCondition()}>添加条件</Button>
            <Button icon={<BranchesOutlined />} onClick={addSubGroup}>添加子条件组</Button>
          </Space>

          <div className="filter-builder-list">
            {filterGroup.conditions.map((cond, idx) => (
              <ConditionEditor
                key={cond.id}
                condition={cond}
                showLogicTag={idx > 0}
                logicLabel={filterGroup.logic}
                onChange={(patch) => updateCondition(cond.id, patch)}
                onRemove={() => removeCondition(cond.id)}
              />
            ))}
          </div>

          {(filterGroup.groups || []).map((sub, groupIndex) => (
            <div key={`group-${groupIndex}`} className="filter-subgroup-panel">
              <Space wrap style={{ marginBottom: 10 }}>
                <Text strong>子条件组 {groupIndex + 1}</Text>
                <Select
                  value={sub.logic}
                  style={{ width: 120 }}
                  options={LOGIC_OPTIONS}
                  onChange={(logic) => {
                    setFilterGroup((prev) => {
                      const groups = [...prev.groups]
                      groups[groupIndex] = { ...groups[groupIndex], logic }
                      return { ...prev, groups }
                    })
                  }}
                />
                <Button size="small" icon={<PlusOutlined />} onClick={() => addCondition(null, groupIndex)}>添加条件</Button>
                <Popconfirm title="删除该子条件组？" onConfirm={() => removeSubGroup(groupIndex)}>
                  <Button size="small" danger type="link">删除子组</Button>
                </Popconfirm>
              </Space>
              {sub.conditions.map((cond, idx) => (
                <ConditionEditor
                  key={cond.id}
                  condition={cond}
                  showLogicTag={idx > 0}
                  logicLabel={sub.logic}
                  onChange={(patch) => updateCondition(cond.id, patch, groupIndex)}
                  onRemove={() => removeCondition(cond.id, groupIndex)}
                />
              ))}
            </div>
          ))}

          <div className="filter-preview-bar">
            <ThunderboltOutlined style={{ color: '#B32620' }} />
            <Text>
              实时预览：<Text strong>{previewCount}</Text> / {dataSource.length} 条商机匹配
            </Text>
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={onRunPipeline}>
              运行分类筛选流水线
            </Button>
          </div>
        </div>
      </Col>

      <Col xs={24} lg={8}>
        <div className="business-panel">
          <h3 className="business-panel-title">核心筛选指标池</h3>
          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>点击指标快速加入根条件组</Text>
          {metricSections.map((group) => (
            <div key={group.category} className="filter-metric-section">
              <Text strong>{group.label}</Text>
              <div className="filter-metric-tags">
                {group.metrics.map((m) => (
                  <Tag
                    key={m.field}
                    className="filter-metric-tag"
                    onClick={() => addCondition(m.field)}
                  >
                    + {m.label}
                  </Tag>
                ))}
              </div>
            </div>
          ))}
          <DividerThin />
          <Text strong>基础属性</Text>
          <div className="filter-metric-tags">
            {FILTER_METRIC_POOL.find((g) => g.category === 'basic')?.metrics.map((m) => (
              <Tag key={m.field} className="filter-metric-tag" onClick={() => addCondition(m.field)}>
                + {m.label}
              </Tag>
            ))}
          </div>
        </div>

        <div className="business-panel" style={{ marginTop: 16 }}>
          <h3 className="business-panel-title">筛选模板库</h3>
          {savedTemplates.map((t) => (
            <div key={t.id} className="filter-saved-item">
              <Space wrap>
                <Text strong>{t.name}</Text>
                {t.shared && <Tag color="blue">团队共享</Tag>}
                {t.id.startsWith('ft-custom-') && <Tag>自定义</Tag>}
              </Space>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                {t.logic} · {countConditions(t)} 个条件
              </Text>
              <Space>
                <Button type="link" size="small" onClick={() => loadTemplate(t.id)}>一键调用</Button>
                {t.id.startsWith('ft-custom-') && (
                  <Popconfirm title={`删除模板「${t.name}」？`} onConfirm={() => deleteTemplate(t.id)}>
                    <Button type="link" size="small" danger>删除</Button>
                  </Popconfirm>
                )}
              </Space>
            </div>
          ))}
        </div>
      </Col>

      <Modal title="保存筛选模板" open={saveModalOpen} onCancel={() => setSaveModalOpen(false)} onOk={handleSaveTemplate} destroyOnClose>
        <Form form={saveForm} layout="vertical" initialValues={{ shared: false }}>
          <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input placeholder="例如：高增长新兴市场B2B机会" />
          </Form.Item>
          <Form.Item name="shared" label="团队共享" valuePropName="checked">
            <Switch checkedChildren="共享" unCheckedChildren="仅本人" />
          </Form.Item>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            当前逻辑：{buildFilterExpression(filterGroup)}
          </Paragraph>
        </Form>
      </Modal>
    </Row>
  )
}

function DividerThin() {
  return <div style={{ height: 1, background: '#f0f0f0', margin: '12px 0' }} />
}
