import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Slider,
  Space,
  Tag,
  Typography,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { CUSTOM_INDICATOR_VARS } from '../../../../mock/opportunity'
import { calcCustomIndicator, validateCustomIndicator } from '../utils'

const { Text, Paragraph } = Typography

const DEFAULT_TERMS = [
  { varKey: 'ftaCoverage', weight: 40, invert: false },
  { varKey: 'subsidyStrength', weight: 30, invert: false },
  { varKey: 'channelMaturity', weight: 30, invert: false },
]

function buildVarOptions(otherPresets = [], currentId) {
  const bySource = {}
  CUSTOM_INDICATOR_VARS.forEach((v) => {
    if (!bySource[v.source]) bySource[v.source] = []
    bySource[v.source].push({ value: v.key, label: v.label })
  })
  const groups = Object.entries(bySource).map(([label, options]) => ({ label, options }))
  const nested = otherPresets.filter((p) => p.id !== currentId)
  if (nested.length) {
    groups.push({
      label: '自定义指标',
      options: nested.map((p) => ({ value: `custom:${p.id}`, label: p.name })),
    })
  }
  return groups
}

export default function CustomIndicatorBuilder({
  open,
  onCancel,
  onSave,
  previewItem,
  initialValues,
  allPresets = [],
}) {
  const [form] = Form.useForm()
  const [terms, setTerms] = useState(initialValues?.terms || DEFAULT_TERMS)
  const nameWatch = Form.useWatch('name', form)
  const descWatch = Form.useWatch('desc', form)

  useEffect(() => {
    if (!open) return
    form.setFieldsValue({
      name: initialValues?.name,
      desc: initialValues?.desc,
    })
    setTerms(
      initialValues?.terms?.map((t) => ({
        ...t,
        invert: initialValues.invertKeys?.includes(t.varKey) || t.invert || false,
      })) || DEFAULT_TERMS,
    )
  }, [open, initialValues, form])

  const weightSum = terms.reduce((s, t) => s + (t.weight || 0), 0)
  const weightsValid = weightSum === 100

  const draftPreset = useMemo(() => {
    const weights = {}
    const invertKeys = []
    terms.forEach((t) => {
      if (t.varKey) {
        weights[t.varKey] = (t.weight || 0) / 100
        if (t.invert) invertKeys.push(t.varKey)
      }
    })
    const labelOf = (key) => {
      if (key.startsWith('custom:')) {
        const id = key.replace('custom:', '')
        return allPresets.find((p) => p.id === id)?.name || key
      }
      return CUSTOM_INDICATOR_VARS.find((v) => v.key === key)?.label || key
    }
    return {
      id: initialValues?.id,
      name: nameWatch || '预览指标',
      desc: descWatch,
      formula: terms
        .filter((t) => t.varKey)
        .map((t) => {
          const prefix = t.invert ? '逆指标(' : ''
          const suffix = t.invert ? ')' : ''
          return `${prefix}${labelOf(t.varKey)}${suffix} × ${((t.weight || 0) / 100).toFixed(2)}`
        })
        .join(' + '),
      weights,
      invertKeys,
      terms,
    }
  }, [terms, nameWatch, descWatch, initialValues?.id, allPresets])

  const validation = useMemo(() => validateCustomIndicator(draftPreset), [draftPreset])
  const previewScore = previewItem && validation.valid
    ? calcCustomIndicator(previewItem, draftPreset, allPresets.filter((p) => p.id !== draftPreset.id))
    : null

  const varOptions = useMemo(
    () => buildVarOptions(allPresets, initialValues?.id),
    [allPresets, initialValues?.id],
  )

  const handleAddTerm = () => {
    setTerms((prev) => [...prev, { varKey: CUSTOM_INDICATOR_VARS[0]?.key, weight: 0, invert: false }])
  }

  const handleRemoveTerm = (index) => {
    setTerms((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTermChange = (index, patch) => {
    setTerms((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)))
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (!weightsValid || !validation.valid) return
      const weights = {}
      const invertKeys = []
      terms.forEach((t) => {
        weights[t.varKey] = (t.weight || 0) / 100
        if (t.invert) invertKeys.push(t.varKey)
      })
      onSave({
        id: initialValues?.id || `ci-${Date.now()}`,
        name: values.name,
        desc: values.desc,
        formula: draftPreset.formula,
        weights,
        invertKeys,
        terms: terms.map(({ varKey, weight, invert }) => ({ varKey, weight, invert })),
      })
      form.resetFields()
      setTerms(DEFAULT_TERMS)
    })
  }

  return (
    <Modal
      title={initialValues ? '编辑自定义指标' : '新建自定义指标'}
      open={open}
      width={720}
      onCancel={() => {
        form.resetFields()
        setTerms(DEFAULT_TERMS)
        onCancel()
      }}
      onOk={handleOk}
      okButtonProps={{ disabled: !weightsValid || !validation.valid }}
      destroyOnClose
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="图形化公式构建"
        description="从原始字段、中间指标或其他自定义指标中选择变量，分配权重（总和须为 100%），系统校验后实时预览计算结果。"
      />
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="指标名称" name="name" rules={[{ required: true, message: '请输入指标名称' }]}>
              <Input placeholder="如：政策红利综合指数" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="业务说明" name="desc">
              <Input placeholder="衡量制度层面综合吸引力" />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Text strong>公式项组合</Text>
      <div className="eval-formula-builder">
        {terms.map((term, index) => (
          <div className="eval-formula-term" key={`${term.varKey}-${index}`}>
            <Select
              style={{ flex: 1, minWidth: 180 }}
              value={term.varKey}
              options={varOptions}
              onChange={(v) => handleTermChange(index, { varKey: v })}
            />
            <div className="eval-formula-weight">
              <Text type="secondary">权重</Text>
              <Slider
                min={0}
                max={100}
                value={term.weight}
                onChange={(v) => handleTermChange(index, { weight: v })}
                style={{ width: 120 }}
                trackStyle={{ background: '#B32620' }}
              />
              <Text strong>{term.weight}%</Text>
            </div>
            <Checkbox
              checked={term.invert}
              onChange={(e) => handleTermChange(index, { invert: e.target.checked })}
            >
              逆指标
            </Checkbox>
            <Button type="text" danger icon={<DeleteOutlined />} disabled={terms.length <= 1} onClick={() => handleRemoveTerm(index)} />
          </div>
        ))}
        <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddTerm}>添加变量项</Button>
      </div>

      <Space style={{ marginTop: 12 }}>
        <Text type={weightsValid ? 'success' : 'danger'}>权重总和：{weightSum}%</Text>
        {!validation.valid && <Text type="danger">{validation.message}</Text>}
      </Space>

      <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
        <Descriptions.Item label="公式预览">{draftPreset.formula || '—'}</Descriptions.Item>
        <Descriptions.Item label="示例计算">
          {previewScore != null ? (
            <Space>
              <Tag color="#B32620">{previewScore}</Tag>
              <Text type="secondary">基于商机「{previewItem?.name}」</Text>
            </Space>
          ) : (
            <Text type="secondary">完成配置后显示</Text>
          )}
        </Descriptions.Item>
      </Descriptions>

      <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0, fontSize: 12 }}>
        支持嵌套引用：可将已保存的自定义指标作为输入变量，形成层级化指标体系。
      </Paragraph>
    </Modal>
  )
}
