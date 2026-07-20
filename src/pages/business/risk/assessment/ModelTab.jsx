import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Slider,
  Space,
  Steps,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import { Column, Line } from '@ant-design/charts'
import {
  ApartmentOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  ASSESSMENT_BUSINESS_PROFILES,
  ASSESSMENT_MODEL_CATALOG,
  BAYES_SAMPLE,
  ETA_SAMPLE,
  FTA_SAMPLE,
  MATRIX_IMPACT_LEVELS,
  MATRIX_PROB_LEVELS,
  NLP_SAMPLE_EVENTS,
  buildAssessmentReport,
  calcCVaR,
  calcExpectedLoss,
  calcRiskIndex,
  calcRiskMatrix,
  calcVaR,
  recommendAssessmentModel,
  runLstmAssessment,
  runNlpAssessment,
} from '../../../../mock/risk'

const { Text, Paragraph, Title } = Typography

const WIZARD_RISK_TYPES = ['信用风险', '市场风险', '运营风险', '合规风险', '政策风险', '物流风险', '汇率风险', '供应链风险']
const CATEGORY_LABEL = {
  qualitative: '定性/半定量',
  quantitative: '定量统计',
  market: '市场风险',
  causal: '因果推演',
  ai: '人工智能',
}

export default function ModelTab({ initialSignal, onGoParams, onGoResults, onGoResponse }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [wizardStep, setWizardStep] = useState(0)
  const [wizard, setWizard] = useState({
    riskType: '信用风险',
    dataAvailability: '高',
    precision: '精准量化',
    compute: '普通PC',
  })
  const [profileId, setProfileId] = useState('b2b')
  const [modelId, setModelId] = useState('el')
  const [manualOverride, setManualOverride] = useState(false)
  const [report, setReport] = useState(null)

  const profile = useMemo(
    () => ASSESSMENT_BUSINESS_PROFILES.find((p) => p.id === profileId) || ASSESSMENT_BUSINESS_PROFILES[0],
    [profileId],
  )

  const [paramScores, setParamScores] = useState(() =>
    Object.fromEntries(profile.paramWeights.map((p) => [p.key, p.defaultScore])),
  )

  useEffect(() => {
    setParamScores(Object.fromEntries(profile.paramWeights.map((p) => [p.key, p.defaultScore])))
  }, [profile])

  useEffect(() => {
    if (initialSignal?.suggestedModel && !manualOverride) {
      setModelId(initialSignal.suggestedModel)
      const typeMap = {
        信用风险: '信用风险',
        汇率风险: '汇率风险',
        供应链风险: '供应链风险',
        合规风险: '合规风险',
      }
      if (typeMap[initialSignal.type]) {
        setWizard((w) => ({ ...w, riskType: typeMap[initialSignal.type] || w.riskType }))
      }
    }
  }, [initialSignal, manualOverride])

  const recommendation = useMemo(() => recommendAssessmentModel(wizard), [wizard])

  useEffect(() => {
    if (!manualOverride && wizardStep >= 3) {
      setModelId(recommendation.modelId)
    }
  }, [recommendation.modelId, manualOverride, wizardStep])

  const [matrixProb, setMatrixProb] = useState(3)
  const [matrixImpact, setMatrixImpact] = useState(3)
  const [elParams, setElParams] = useState({ pd: 3, lgd: 60, ead: 500 })
  const [varParams, setVarParams] = useState({ exposure: 1000, volatility: 2.5, confidence: 95, days: 10 })
  const [lstmParams, setLstmParams] = useState({ historyQuarters: 3, delayTrend: '递增' })
  const [nlpText, setNlpText] = useState(NLP_SAMPLE_EVENTS[0].text)

  const indexFactors = useMemo(
    () => profile.paramWeights.map((p) => ({
      ...p,
      score: paramScores[p.key] ?? p.defaultScore,
    })),
    [profile, paramScores],
  )

  const result = useMemo(() => {
    switch (modelId) {
      case 'matrix':
        return calcRiskMatrix(matrixProb, matrixImpact)
      case 'index':
        return calcRiskIndex(indexFactors)
      case 'el':
        return calcExpectedLoss(elParams.pd, elParams.lgd, elParams.ead)
      case 'var':
        return calcVaR(varParams.exposure, varParams.volatility, varParams.confidence, varParams.days)
      case 'cvar':
        return calcCVaR(varParams.exposure, varParams.volatility, varParams.confidence, varParams.days)
      case 'fta':
        return { ...FTA_SAMPLE, level: FTA_SAMPLE.probability >= 0.35 ? '高风险' : '中风险', score: Math.round(FTA_SAMPLE.probability * 100) }
      case 'eta':
        return { ...ETA_SAMPLE, level: '中风险', score: 42 }
      case 'bayes':
        return { ...BAYES_SAMPLE, level: '中风险', score: 58 }
      case 'lstm':
        return runLstmAssessment(lstmParams)
      case 'nlp':
        return runNlpAssessment(nlpText)
      default:
        return calcRiskIndex(indexFactors)
    }
  }, [modelId, matrixProb, matrixImpact, indexFactors, elParams, varParams, lstmParams, nlpText])

  const trendData = useMemo(() => {
    const base = modelId === 'el' ? result.elRatio || 3 : result.index || result.score || 45
    return [
      { month: 'T-5', value: Math.max(0, base - 8) },
      { month: 'T-4', value: Math.max(0, base - 5) },
      { month: 'T-3', value: Math.max(0, base - 3) },
      { month: 'T-2', value: Math.max(0, base - 1) },
      { month: 'T-1', value: base },
      { month: 'T+1', value: base + 2 },
      { month: 'T+3', value: base + 4 },
      { month: 'T+6', value: base + (wizard.riskType === '信用风险' ? 6 : 3) },
    ]
  }, [result, modelId, wizard.riskType])

  const breakdownData = useMemo(() => {
    if (modelId === 'index' && result.breakdown) {
      return result.breakdown.map((b) => ({ factor: b.label, value: b.contribution }))
    }
    if (modelId === 'el') {
      return [
        { factor: 'PD', value: elParams.pd },
        { factor: 'LGD', value: elParams.lgd },
        { factor: 'EAD(百)', value: elParams.ead / 10 },
      ]
    }
    return profile.paramWeights.map((p) => ({ factor: p.label.slice(0, 6), value: paramScores[p.key] || 0 }))
  }, [modelId, result, profile, paramScores, elParams])

  const activeModel = ASSESSMENT_MODEL_CATALOG.find((m) => m.id === modelId)

  const handleRun = () => {
    const r = buildAssessmentReport({
      modelId,
      modelName: activeModel?.name,
      profile,
      result,
      wizard: !manualOverride,
      signal: initialSignal,
    })
    setReport(r)
    message.success('评估完成，得分构成明细已生成')
  }

  const handleDispatch = () => {
    message.success('评估结果已推送至风险应对')
    onGoResponse?.({
      assessmentId: report?.id,
      level: result.level,
      score: result.score || result.totalScore,
      modelId,
      modelName: activeModel?.name,
      title: initialSignal?.title || '风险评估处置',
    })
  }

  const renderModelConfig = () => {
    switch (modelId) {
      case 'matrix':
        return (
          <>
            <Form.Item label="发生概率">
              <Slider min={0} max={4} marks={Object.fromEntries(MATRIX_PROB_LEVELS.map((v, i) => [i, v]))} value={matrixProb} onChange={setMatrixProb} />
            </Form.Item>
            <Form.Item label="影响程度">
              <Slider min={0} max={4} marks={Object.fromEntries(MATRIX_IMPACT_LEVELS.map((v, i) => [i, v]))} value={matrixImpact} onChange={setMatrixImpact} />
            </Form.Item>
            <AlertMatrix prob={matrixProb} impact={matrixImpact} />
          </>
        )
      case 'index':
        return profile.paramWeights.map((p) => (
          <Form.Item key={p.key} label={`${p.label}（权重 ${p.weight}%）`}>
            <Slider min={0} max={10} value={paramScores[p.key]} onChange={(v) => setParamScores((s) => ({ ...s, [p.key]: v }))} />
          </Form.Item>
        ))
      case 'el':
        return (
          <>
            <Form.Item label="违约概率 PD (%)"><InputNumber min={0.1} max={20} step={0.1} value={elParams.pd} onChange={(v) => setElParams((p) => ({ ...p, pd: v }))} style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="违约损失率 LGD (%)"><InputNumber min={10} max={100} value={elParams.lgd} onChange={(v) => setElParams((p) => ({ ...p, lgd: v }))} style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="风险敞口 EAD (万元)"><InputNumber min={10} max={10000} value={elParams.ead} onChange={(v) => setElParams((p) => ({ ...p, ead: v }))} style={{ width: '100%' }} /></Form.Item>
            <Paragraph type="secondary">示例：EAD=500万，PD=3%，LGD=60% → EL=9万元</Paragraph>
          </>
        )
      case 'var':
      case 'cvar':
        return (
          <>
            <Form.Item label="外汇敞口 (万美元)"><InputNumber min={100} max={50000} value={varParams.exposure} onChange={(v) => setVarParams((p) => ({ ...p, exposure: v }))} style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="波动率 (%)"><InputNumber min={0.5} max={15} step={0.1} value={varParams.volatility} onChange={(v) => setVarParams((p) => ({ ...p, volatility: v }))} style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="置信水平">
              <Radio.Group value={varParams.confidence} onChange={(e) => setVarParams((p) => ({ ...p, confidence: e.target.value }))}>
                <Radio.Button value={90}>90%</Radio.Button>
                <Radio.Button value={95}>95%</Radio.Button>
                <Radio.Button value={99}>99%</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="持有期 (天)"><InputNumber min={1} max={30} value={varParams.days} onChange={(v) => setVarParams((p) => ({ ...p, days: v }))} style={{ width: '100%' }} /></Form.Item>
          </>
        )
      case 'fta':
        return (
          <div className="rule-canvas">
            <div className="rule-canvas-node end">{FTA_SAMPLE.topEvent}</div>
            {FTA_SAMPLE.nodes.map((n) => (
              <div key={n.id} className="rule-canvas-flow">
                <Tag className="rule-logic-tag">{n.gate}</Tag>
                <div className="rule-canvas-node atom">{n.label} · P={Math.round(n.prob * 100)}%</div>
                <Space wrap size={4}>{n.children.map((c) => <Tag key={c}>{c}</Tag>)}</Space>
              </div>
            ))}
          </div>
        )
      case 'eta':
        return (
          <Table size="small" pagination={false} rowKey="path" dataSource={ETA_SAMPLE.branches} columns={[
            { title: '分支', dataIndex: 'path', key: 'path' },
            { title: '概率', dataIndex: 'prob', key: 'prob', render: (v) => `${Math.round(v * 100)}%` },
            { title: '损失', dataIndex: 'loss', key: 'loss' },
            { title: '连锁反应', dataIndex: 'next', key: 'next', ellipsis: true },
          ]} />
        )
      case 'bayes':
        return (
          <Table size="small" pagination={false} rowKey="id" dataSource={BAYES_SAMPLE.nodes} columns={[
            { title: '节点', dataIndex: 'label', key: 'label' },
            { title: '概率', dataIndex: 'prob', key: 'prob', render: (v) => `${Math.round(v * 100)}%` },
            { title: '依赖', key: 'dep', render: (_, r) => r.parent || (r.parents ? r.parents.join('+') : '根节点') },
          ]} />
        )
      case 'lstm':
        return (
          <>
            <Form.Item label="连续延迟季度数"><InputNumber min={1} max={8} value={lstmParams.historyQuarters} onChange={(v) => setLstmParams((p) => ({ ...p, historyQuarters: v }))} style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="付款延迟趋势">
              <Radio.Group value={lstmParams.delayTrend} onChange={(e) => setLstmParams((p) => ({ ...p, delayTrend: e.target.value }))}>
                <Radio.Button value="递增">递增</Radio.Button>
                <Radio.Button value="平稳">平稳</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </>
        )
      case 'nlp':
        return (
          <>
            <Form.Item label="新闻/政策文本">
              <Input.TextArea rows={3} value={nlpText} onChange={(e) => setNlpText(e.target.value)} />
            </Form.Item>
            <Space wrap>{NLP_SAMPLE_EVENTS.map((e) => (
              <Button key={e.text} size="small" onClick={() => setNlpText(e.text)}>{e.type}</Button>
            ))}</Space>
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Card size="small" title={<><ExperimentOutlined /> 模型选择向导 · 四步问诊</>} style={{ marginBottom: 16 }}>
        <Steps
          current={wizardStep}
          size="small"
          items={[
            { title: '风险类型', description: wizard.riskType },
            { title: '数据可用性', description: wizard.dataAvailability },
            { title: '精度要求', description: wizard.precision },
            { title: '算力约束', description: wizard.compute },
          ]}
        />
        <div style={{ marginTop: 16 }}>
          {wizardStep === 0 && (
            <Radio.Group value={wizard.riskType} onChange={(e) => setWizard((w) => ({ ...w, riskType: e.target.value }))}>
              <Space wrap>{WIZARD_RISK_TYPES.map((t) => <Radio.Button key={t} value={t}>{t}</Radio.Button>)}</Space>
            </Radio.Group>
          )}
          {wizardStep === 1 && (
            <Radio.Group value={wizard.dataAvailability} onChange={(e) => setWizard((w) => ({ ...w, dataAvailability: e.target.value }))}>
              <Radio.Button value="高">高（完整3年数据）</Radio.Button>
              <Radio.Button value="中">中</Radio.Button>
              <Radio.Button value="低">低</Radio.Button>
            </Radio.Group>
          )}
          {wizardStep === 2 && (
            <Radio.Group value={wizard.precision} onChange={(e) => setWizard((w) => ({ ...w, precision: e.target.value }))}>
              <Radio.Button value="精准量化">精准量化</Radio.Button>
              <Radio.Button value="快速估算">快速估算</Radio.Button>
            </Radio.Group>
          )}
          {wizardStep === 3 && (
            <Radio.Group value={wizard.compute} onChange={(e) => setWizard((w) => ({ ...w, compute: e.target.value }))}>
              <Radio.Button value="普通PC">普通PC</Radio.Button>
              <Radio.Button value="服务器集群">服务器集群</Radio.Button>
            </Radio.Group>
          )}
        </div>
        <Space style={{ marginTop: 16 }}>
          {wizardStep > 0 && <Button onClick={() => setWizardStep((s) => s - 1)}>上一步</Button>}
          {wizardStep < 3 && <Button type="primary" onClick={() => setWizardStep((s) => s + 1)}>下一步</Button>}
          {wizardStep === 3 && (
            <>
              <Button type="primary" onClick={() => { setManualOverride(false); setModelId(recommendation.modelId); message.success(`推荐模型：${recommendation.model?.name}`) }}>
                采纳推荐
              </Button>
              <Text type="secondary">{recommendation.reasons.join('；')}</Text>
            </>
          )}
        </Space>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title"><ApartmentOutlined /> 个性化参数配置</h3>
            <Form layout="vertical">
              <Form.Item label="业务画像">
                <Select
                  value={profileId}
                  options={ASSESSMENT_BUSINESS_PROFILES.map((p) => ({ value: p.id, label: p.name }))}
                  onChange={setProfileId}
                />
              </Form.Item>
              <Paragraph type="secondary">{profile.desc} · 关注 {profile.focus}</Paragraph>
              {profile.paramWeights.slice(0, 3).map((p) => (
                <Form.Item key={p.key} label={`${p.label} ${p.weight}%`}>
                  <Slider min={0} max={10} value={paramScores[p.key]} onChange={(v) => setParamScores((s) => ({ ...s, [p.key]: v }))} />
                </Form.Item>
              ))}
            </Form>
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title"><RobotOutlined /> 评估模型</h3>
            <Select
              style={{ width: '100%', marginBottom: 8 }}
              value={modelId}
              options={ASSESSMENT_MODEL_CATALOG.map((m) => ({
                value: m.id,
                label: `${m.name} · ${CATEGORY_LABEL[m.category]}`,
              }))}
              onChange={(v) => { setModelId(v); setManualOverride(true) }}
            />
            {activeModel && (
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                {activeModel.desc}
                <br />
                适用：{activeModel.scenarios.join('、')}
              </Paragraph>
            )}
            <Tabs
              size="small"
              items={Object.entries(CATEGORY_LABEL).map(([key, label]) => ({
                key,
                label,
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {ASSESSMENT_MODEL_CATALOG.filter((m) => m.category === key).map((m) => (
                      <Button key={m.id} block size="small" type={modelId === m.id ? 'primary' : 'default'} onClick={() => { setModelId(m.id); setManualOverride(true) }}>
                        {m.name}
                      </Button>
                    ))}
                  </Space>
                ),
              }))}
            />
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title"><ThunderboltOutlined /> {activeModel?.name} · 参数设置</h3>
            <Form layout="vertical">{renderModelConfig()}</Form>
            <Button block icon={<ExperimentOutlined />} onClick={handleRun}>快速运行评估</Button>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title">评估结果</h3>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div className="assessment-score-display">
                {result.el ?? result.index ?? result.var ?? result.cvar ?? result.score ?? result.bankruptcyProb ?? '-'}
              </div>
              <Text type="secondary">
                {modelId === 'el' && '预期损失(万元)'}
                {modelId === 'index' && '综合风险指数'}
                {(modelId === 'var' || modelId === 'cvar') && '万美元'}
                {modelId === 'lstm' && '60天破产概率(%)'}
                {modelId === 'nlp' && '影响评分'}
                {modelId === 'matrix' && '矩阵得分'}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={result.color || (result.level?.includes('高') ? 'error' : result.level?.includes('中') ? 'warning' : 'success')}>
                  {result.level || '中风险'}
                </Tag>
              </div>
            </div>

            <Descriptions bordered size="small" column={1}>
              {result.formula && <Descriptions.Item label="公式">{result.formula}</Descriptions.Item>}
              {result.desc && <Descriptions.Item label="说明">{result.desc}</Descriptions.Item>}
              {result.forward && <Descriptions.Item label="前瞻判断">{result.forward}</Descriptions.Item>}
              {result.cell && <Descriptions.Item label="矩阵位置">{result.cell}</Descriptions.Item>}
              {result.keywords && <Descriptions.Item label="关键词">{result.keywords.join('、')}</Descriptions.Item>}
            </Descriptions>

            <Title level={5} style={{ marginTop: 16 }}>得分构成明细</Title>
            <div className="business-chart-box-sm">
              <Column data={breakdownData} xField="factor" yField="value" height={160} color="#B32620" />
            </div>

            <Title level={5} style={{ marginTop: 12 }}>风险趋势（含预测）</Title>
            <div className="business-chart-box-sm">
              <Line data={trendData} xField="month" yField="value" height={140} color="#B32620" smooth point={{ size: 3 }} />
            </div>

            {report && (
              <Card size="small" style={{ marginTop: 12 }} title="评估报告摘要">
                <Text type="secondary" style={{ fontSize: 12 }}>{report.traceability}</Text>
                <Paragraph style={{ marginTop: 8 }}>{report.createdAt}</Paragraph>
              </Card>
            )}

            <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
              <Button
                type="primary"
                block
                onClick={() => onGoParams?.({
                  modelId,
                  profileId,
                  signal: initialSignal,
                  wizard,
                  elParams,
                  varParams,
                })}
              >
                进入参数配置 →
              </Button>
              <Button block icon={<ExperimentOutlined />} onClick={handleRun}>快速运行评估</Button>
              <Button block icon={<FileTextOutlined />} disabled={!report} onClick={() => message.success('评估报告已导出')}>导出评估报告</Button>
              <Button block disabled={!report} onClick={handleDispatch}>推送至风险应对</Button>
              <Button block type="link" onClick={() => onGoResults?.()}>查看评估结果 →</Button>
              <Button block type="link" onClick={() => navigate('/risk/case')}>参考风险案例库</Button>
            </Space>
          </div>
        </Col>
      </Row>
    </>
  )
}

function AlertMatrix({ prob, impact }) {
  const cells = []
  for (let i = 4; i >= 0; i -= 1) {
    for (let j = 0; j < 5; j += 1) {
      const score = (i + 1) * (j + 1)
      const active = i === prob && j === impact
      cells.push(
        <div
          key={`${i}-${j}`}
          className={`assessment-matrix-cell${active ? ' active' : ''}`}
          style={{ background: score >= 20 ? '#ffccc7' : score >= 12 ? '#ffe7ba' : '#f6ffed' }}
        >
          {score}
        </div>,
      )
    }
  }
  return (
    <div className="assessment-matrix-wrap">
      <Text type="secondary" style={{ fontSize: 11 }}>概率 ↓ / 影响 →</Text>
      <div className="assessment-matrix-grid">{cells}</div>
    </div>
  )
}
