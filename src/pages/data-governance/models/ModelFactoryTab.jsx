import { useMemo, useState } from 'react'
import {
  App,
  Alert,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd'
import { PlayCircleOutlined, SaveOutlined } from '@ant-design/icons'
import { MODEL_TEMPLATES, MODEL_SCENES } from '../../../mock/model-algorithm'
import { appendTrainJob, saveModelDraft } from './modelAlgorithmStore'

const { Text, Paragraph } = Typography

export default function ModelFactoryTab() {
  const { message } = App.useApp()
  const [step, setStep] = useState(0)
  const [templateId, setTemplateId] = useState(MODEL_TEMPLATES[0].id)
  const [form] = Form.useForm()
  const [weights, setWeights] = useState(() => {
    const tpl = MODEL_TEMPLATES[0]
    const w = {}
    tpl.indicators.forEach((i) => { w[i.key] = i.weight })
    return w
  })
  const [training, setTraining] = useState(false)
  const [trainProgress, setTrainProgress] = useState(0)
  const [trainResult, setTrainResult] = useState(null)

  const template = useMemo(() => MODEL_TEMPLATES.find((t) => t.id === templateId), [templateId])
  const weightSum = Object.values(weights).reduce((s, v) => s + (v || 0), 0)
  const weightValid = weightSum === 100

  const handleTemplateChange = (id) => {
    setTemplateId(id)
    const tpl = MODEL_TEMPLATES.find((t) => t.id === id)
    const w = {}
    tpl?.indicators.forEach((i) => { w[i.key] = i.weight })
    setWeights(w)
  }

  const handleSaveDraft = () => {
    form.validateFields().then((values) => {
      if (!weightValid) {
        message.error('指标权重总和须为 100%')
        return
      }
      saveModelDraft({
        id: `draft-${Date.now()}`,
        templateId,
        name: values.name,
        scene: template?.scene,
        weights: { ...weights },
      })
      message.success('模型配置草稿已保存')
    })
  }

  const handleTrain = () => {
    if (!weightValid) {
      message.error('权重总和必须等于 100%')
      return
    }
    setTraining(true)
    setTrainProgress(0)
    setTrainResult(null)
    const timer = setInterval(() => {
      setTrainProgress((p) => {
        if (p >= 100) {
          clearInterval(timer)
          return 100
        }
        return p + 10
      })
    }, 400)
    setTimeout(() => {
      clearInterval(timer)
      setTraining(false)
      setTrainProgress(100)
      const accuracy = 80 + Math.round(Math.random() * 12)
      const result = {
        accuracy,
        recall: accuracy - 3,
        f1: accuracy - 2,
        auc: (accuracy / 100 + 0.05).toFixed(2),
        rows: 125000,
        duration: '38m',
      }
      setTrainResult(result)
      appendTrainJob({
        id: `TR-${Date.now()}`,
        modelId: `MDL-NEW-${Date.now()}`,
        status: 'success',
        algorithm: template?.scene === 'analysis' ? 'ARIMA+Stacking' : template?.scene === 'risk' ? 'XGBoost' : 'RandomForest',
        dataRows: result.rows,
        duration: result.duration,
        accuracy: result.accuracy,
        time: new Date().toLocaleString('zh-CN'),
      })
      message.success(`训练完成 · 准确率 ${accuracy}%`)
      setStep(2)
    }, 4200)
  }

  return (
    <>
      <Steps
        current={step}
        style={{ marginBottom: 24 }}
        items={[
          { title: '选择模板' },
          { title: '配置参数' },
          { title: '训练验证' },
        ]}
      />

      {step === 0 && (
        <Row gutter={16}>
          {MODEL_TEMPLATES.map((tpl) => (
            <Col xs={24} lg={8} key={tpl.id}>
              <div
                className={`model-template-card business-panel ${templateId === tpl.id ? 'model-template-active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleTemplateChange(tpl.id)}
              >
                <Tag color={templateId === tpl.id ? '#B32620' : undefined}>
                  {MODEL_SCENES.find((s) => s.id === tpl.scene)?.name}
                </Tag>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{tpl.name}</div>
                <Paragraph type="secondary" style={{ fontSize: 12 }}>{tpl.indicators.length} 项指标 · 版本 {tpl.version}</Paragraph>
              </div>
            </Col>
          ))}
          <Col span={24} style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => setStep(1)}>下一步：配置参数</Button>
          </Col>
        </Row>
      )}

      {step === 1 && template && (
        <>
          <Form form={form} layout="vertical" initialValues={{ name: `${template.name} 副本` }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="模型名称" name="name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="业务场景">
                  <Input disabled value={MODEL_SCENES.find((s) => s.id === template.scene)?.name} />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="指标体系配置"
            description="调整各指标权重（总和须为 100%），支持等级映射与阈值设定，配置异常时系统提醒。"
          />

          {template.indicators.map((ind) => (
            <div className="model-weight-row" key={ind.key}>
              <Text style={{ width: 120 }}>{ind.label}</Text>
              <Slider
                min={0}
                max={50}
                value={weights[ind.key]}
                onChange={(v) => setWeights((prev) => ({ ...prev, [ind.key]: v }))}
                style={{ flex: 1, margin: '0 16px' }}
                trackStyle={{ background: '#B32620' }}
              />
              <Text strong>{weights[ind.key]}%</Text>
              {ind.threshold && <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>{ind.threshold}</Text>}
            </div>
          ))}

          <Text type={weightValid ? 'success' : 'danger'}>权重总和：{weightSum}%</Text>

          <Space style={{ marginTop: 16 }}>
            <Button onClick={() => setStep(0)}>上一步</Button>
            <Button icon={<SaveOutlined />} onClick={handleSaveDraft}>保存草稿</Button>
            <Button type="primary" icon={<PlayCircleOutlined />} disabled={!weightValid} onClick={handleTrain}>
              启动训练
            </Button>
          </Space>
        </>
      )}

      {step === 2 && (
        <>
          {training && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Progress type="circle" percent={trainProgress} strokeColor="#B32620" />
              <Paragraph style={{ marginTop: 16 }}>数据准备 → 特征工程 → 交叉验证 → 模型评估...</Paragraph>
            </div>
          )}
          {trainResult && !training && (
            <>
              <Alert type="success" showIcon message={`训练完成 · 准确率 ${trainResult.accuracy}% · F1 ${trainResult.f1}% · AUC ${trainResult.auc}`} style={{ marginBottom: 16 }} />
              <Table
                size="small"
                pagination={false}
                dataSource={[
                  { metric: '准确率', value: `${trainResult.accuracy}%`, target: '≥80%' },
                  { metric: '召回率', value: `${trainResult.recall}%`, target: '—' },
                  { metric: '训练样本', value: trainResult.rows.toLocaleString(), target: '近3年' },
                  { metric: '耗时', value: trainResult.duration, target: '—' },
                ]}
                columns={[
                  { title: '指标', dataIndex: 'metric' },
                  { title: '结果', dataIndex: 'value' },
                  { title: '目标', dataIndex: 'target' },
                ]}
              />
              <Space style={{ marginTop: 16 }}>
                <Button onClick={() => { setStep(1); setTrainResult(null) }}>调整参数重训</Button>
                <Button type="primary" onClick={() => message.success('请前往「部署监控」Tab 发布至生产环境')}>前往部署 →</Button>
              </Space>
            </>
          )}
        </>
      )}
    </>
  )
}
