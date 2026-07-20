import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Column } from '@ant-design/charts'
import {
  CloudSyncOutlined,
  EditOutlined,
  FileTextOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  ASSESSMENT_BUSINESS_PROFILES,
  ASSESSMENT_MODEL_CATALOG,
  EXPERT_ADJUSTMENT_HISTORY,
  PARAM_DATA_SOURCES,
  STRESS_SCENARIO_TEMPLATES,
  analyzeExpertAdjustmentPatterns,
  applyExpertAdjustment,
  buildFullAssessmentReport,
  calcExpectedLoss,
  calcVaR,
  fetchAutoAssessmentParams,
  runStressTest,
} from '../../../../mock/risk'

const { Text, Paragraph, Title } = Typography

const defaultConfig = {
  modelId: 'el',
  profileId: 'b2b',
  signal: null,
}

export default function ParameterTab({ config = defaultConfig, onGoModel, onGoResults, onGoResponse }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [autoData, setAutoData] = useState(null)
  const [computed, setComputed] = useState({ pd: 3, lgd: 60, ead: 500 })
  const [expertForm] = Form.useForm()
  const [adjustments, setAdjustments] = useState([])
  const [auditLog, setAuditLog] = useState(EXPERT_ADJUSTMENT_HISTORY)
  const [stressId, setStressId] = useState('export-ban')
  const [customScenario, setCustomScenario] = useState({ name: '', desc: '', impactPct: 50 })
  const [stressResult, setStressResult] = useState(null)
  const [fullReport, setFullReport] = useState(null)
  const [reportDrawer, setReportDrawer] = useState(false)
  const [paramTab, setParamTab] = useState('auto')

  const modelId = config.modelId || 'el'
  const profile = useMemo(
    () => ASSESSMENT_BUSINESS_PROFILES.find((p) => p.id === config.profileId) || ASSESSMENT_BUSINESS_PROFILES[0],
    [config.profileId],
  )
  const activeModel = ASSESSMENT_MODEL_CATALOG.find((m) => m.id === modelId)

  const refreshAutoParams = () => {
    setLoading(true)
    setTimeout(() => {
      const data = fetchAutoAssessmentParams(modelId, config.signal)
      setAutoData(data)
      setComputed(data.computed)
      setLoading(false)
      message.success(`参数已同步 · 自动覆盖率 ${data.coverage}%`)
    }, 600)
  }

  useEffect(() => {
    const data = fetchAutoAssessmentParams(modelId, config.signal)
    setAutoData(data)
    setComputed(data.computed)
  }, [modelId, config.signal])

  const result = useMemo(() => {
    if (computed.pd !== undefined) return calcExpectedLoss(computed.pd, computed.lgd, computed.ead)
    if (computed.exposure !== undefined) return calcVaR(computed.exposure, computed.volatility, computed.confidence, computed.days)
    return calcExpectedLoss(3, 60, 500)
  }, [computed])

  const compareData = useMemo(() => {
    if (!stressResult) return []
    return [
      { type: '基准', value: stressResult.baseline.value || stressResult.impact.from },
      { type: '压力', value: stressResult.stressed.value || stressResult.impact.to },
    ]
  }, [stressResult])

  const handleExpertSubmit = (values) => {
    const field = values.field
    const param = autoData?.params.find((p) => p.key === field || p.label === field)
    const before = param?.value ?? computed[field] ?? values.before
    const after = applyExpertAdjustment(before, values.adjustPct)
    const record = {
      id: `EA-${Date.now()}`,
      field: param?.label || field,
      before,
      after,
      user: '当前用户',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      reason: values.reason,
    }
    setAdjustments((prev) => [...prev, record])
    setAuditLog((prev) => [record, ...prev])

    if (field === 'pd' || param?.key === 'pd') setComputed((c) => ({ ...c, pd: after }))
    else if (field === 'lgd' || param?.key === 'lgd') setComputed((c) => ({ ...c, lgd: after }))
    else if (field === 'ead' || param?.key === 'ead') setComputed((c) => ({ ...c, ead: after }))
    expertForm.resetFields()
    message.success('专家调整已记录并应用（±20%范围内）')
  }

  const handleRunStress = () => {
    const tpl = STRESS_SCENARIO_TEMPLATES.find((s) => s.id === stressId)
    const scenario = tpl || {
      id: 'custom',
      name: customScenario.name || '自定义情景',
      desc: customScenario.desc,
      overrides: { customImpact: customScenario.impactPct },
      defaultImpact: { baseline: '中风险', stressed: '高风险', lossFrom: 5, lossTo: 5 + customScenario.impactPct, unit: '万元' },
    }
    const res = runStressTest(scenario, computed)
    setStressResult(res)
    message.success('压力测试完成')
  }

  const handleGenerateReport = () => {
    const report = buildFullAssessmentReport({
      modelId,
      modelName: activeModel?.name,
      profile,
      signal: config.signal,
      autoParams: autoData,
      expertAdjustments: [...adjustments, ...auditLog.slice(0, 2)],
      stressResult,
      result,
    })
    setFullReport(report)
    setReportDrawer(true)
    message.success('完整评估报告已生成')
  }

  const optimization = useMemo(() => analyzeExpertAdjustmentPatterns(auditLog), [auditLog])

  if (!activeModel) {
    return (
      <Alert type="warning" showIcon message="请先完成评估模型选择" action={<Button size="small" onClick={onGoModel}>去选择模型</Button>} />
    )
  }

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={`当前模型：${activeModel.name} · ${profile.name}`}
        description={config.signal ? `评估对象：${config.signal.title}` : '未关联识别信号，使用默认参数模板'}
        action={
          <Space>
            <Button size="small" onClick={onGoModel}>更换模型</Button>
            <Button size="small" type="primary" icon={<CloudSyncOutlined />} loading={loading} onClick={refreshAutoParams}>同步参数</Button>
          </Space>
        }
      />

      <Tabs
        activeKey={paramTab}
        onChange={setParamTab}
        items={[
          {
            key: 'auto',
            label: <span><CloudSyncOutlined /> 参数自动获取</span>,
            children: (
              <Row gutter={16}>
                <Col xs={24} lg={14}>
                  <div className="business-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h3 className="business-panel-title" style={{ margin: 0 }}>量化参数 · 自动填充</h3>
                      <Space>
                        <Text type="secondary">覆盖率</Text>
                        <Progress type="circle" percent={autoData?.coverage || 0} size={44} strokeColor="#B32620" />
                      </Space>
                    </div>
                    <Paragraph type="secondary">
                      评估主体：{autoData?.subject} · 最近同步：{autoData?.syncedAt}
                    </Paragraph>
                    <Table
                      rowKey="key"
                      size="small"
                      pagination={false}
                      dataSource={autoData?.params || []}
                      columns={[
                        { title: '参数', dataIndex: 'label', key: 'label', width: 120 },
                        {
                          title: '数值',
                          key: 'value',
                          width: 100,
                          render: (_, r) => <Text strong>{r.value}{r.unit}</Text>,
                        },
                        { title: '数据来源', dataIndex: 'source', key: 'source', ellipsis: true },
                        {
                          title: '模式',
                          key: 'auto',
                          width: 90,
                          render: (_, r) => <Tag color={r.auto ? 'success' : 'warning'}>{r.auto ? '自动' : '待专家'}</Tag>,
                        },
                        { title: '频率', dataIndex: 'freq', key: 'freq', width: 70 },
                      ]}
                    />
                    {computed.pd !== undefined && (
                      <Descriptions bordered size="small" column={3} style={{ marginTop: 12 }}>
                        <Descriptions.Item label="PD">{computed.pd}%</Descriptions.Item>
                        <Descriptions.Item label="LGD">{computed.lgd}%</Descriptions.Item>
                        <Descriptions.Item label="EAD">{computed.ead}万</Descriptions.Item>
                      </Descriptions>
                    )}
                  </div>
                </Col>
                <Col xs={24} lg={10}>
                  <div className="business-panel">
                    <h3 className="business-panel-title">内外部数据源联动</h3>
                    <Title level={5}>内部系统</Title>
                    {PARAM_DATA_SOURCES.internal.map((s) => (
                      <div key={s.id} className="param-source-item">
                        <Tag color="processing">{s.name}</Tag>
                        <Text type="secondary">{s.fields.join(' · ')} · {s.freq}</Text>
                      </div>
                    ))}
                    <Title level={5} style={{ marginTop: 12 }}>外部权威渠道</Title>
                    {PARAM_DATA_SOURCES.external.map((s) => (
                      <div key={s.id} className="param-source-item">
                        <Tag>{s.name}</Tag>
                        <Text type="secondary">{s.fields.join(' · ')} · {s.freq}</Text>
                      </div>
                    ))}
                    <Paragraph type="secondary" style={{ marginTop: 12, fontSize: 12 }}>
                      示例：邓白氏 BB 级 → PD 基础 2.5% · ERP 延迟 +0.5% · 财务 LGD 60% · 订单 EAD 500万
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            ),
          },
          {
            key: 'expert',
            label: <span><UserOutlined /> 专家判断注入</span>,
            children: (
              <Row gutter={16}>
                <Col xs={24} lg={10}>
                  <div className="business-panel">
                    <h3 className="business-panel-title"><EditOutlined /> 专家干预（±20%）</h3>
                    <Form form={expertForm} layout="vertical" onFinish={handleExpertSubmit}>
                      <Form.Item name="field" label="调整字段" rules={[{ required: true }]}>
                        <Select
                          options={(autoData?.params || [])
                            .filter((p) => !p.auto || p.key === 'pd' || p.key === 'lgd')
                            .map((p) => ({ value: p.key, label: p.label }))}
                        />
                      </Form.Item>
                      <Form.Item name="adjustPct" label="调整幅度" initialValue={10}>
                        <Slider min={-20} max={20} marks={{ '-20': '-20%', 0: '0', 20: '+20%' }} />
                      </Form.Item>
                      <Form.Item name="reason" label="调整理由" rules={[{ required: true, message: '必须注明调整依据' }]}>
                        <Input.TextArea rows={3} placeholder="如：已知买家CEO近期离职，将PD从3%上调至3.6%" />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" block>提交调整</Button>
                    </Form>
                    <Alert type="info" showIcon style={{ marginTop: 12 }} message="所有调整永久留痕，用于后续模型优化" />
                  </div>
                </Col>
                <Col xs={24} lg={14}>
                  <div className="business-panel">
                    <h3 className="business-panel-title">调整审计记录</h3>
                    <Table
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 5 }}
                      dataSource={auditLog}
                      columns={[
                        { title: '字段', dataIndex: 'field', key: 'field', width: 100 },
                        { title: '调整', key: 'chg', render: (_, r) => `${r.before} → ${r.after}` },
                        { title: '调整人', dataIndex: 'user', key: 'user', width: 110 },
                        { title: '时间', dataIndex: 'time', key: 'time', width: 140 },
                        { title: '理由', dataIndex: 'reason', key: 'reason', ellipsis: true },
                      ]}
                    />
                    <Card size="small" title="模型优化反馈" style={{ marginTop: 12 }}>
                      <Paragraph>{optimization.summary}</Paragraph>
                      {optimization.patterns.map((p) => (
                        <div key={p.pattern} style={{ marginBottom: 8 }}>
                          <Tag color="processing">{p.pattern}</Tag>
                          <Text type="secondary"> 平均 {p.avgAdjust} · {p.action}</Text>
                        </div>
                      ))}
                      <Button type="link" size="small" onClick={() => navigate('/risk/identification?tab=indicator')}>去优化风险规则 →</Button>
                    </Card>
                  </div>
                </Col>
              </Row>
            ),
          },
          {
            key: 'stress',
            label: <span><ThunderboltOutlined /> 压力测试</span>,
            children: (
              <Row gutter={16}>
                <Col xs={24} lg={10}>
                  <div className="business-panel">
                    <h3 className="business-panel-title">情景参数设置</h3>
                    <Form layout="vertical">
                      <Form.Item label="内置压力情景">
                        <Select
                          value={stressId}
                          options={STRESS_SCENARIO_TEMPLATES.map((s) => ({ value: s.id, label: s.name }))}
                          onChange={setStressId}
                        />
                      </Form.Item>
                      {STRESS_SCENARIO_TEMPLATES.filter((s) => s.id === stressId).map((s) => (
                        <Alert key={s.id} type="warning" showIcon message={s.name} description={s.desc} style={{ marginBottom: 12 }} />
                      ))}
                      <Title level={5}>自定义情景</Title>
                      <Form.Item label="事件描述">
                        <Input.TextArea rows={2} value={customScenario.desc} onChange={(e) => setCustomScenario((c) => ({ ...c, desc: e.target.value }))} placeholder="如：某供应商因火灾停产6个月" />
                      </Form.Item>
                      <Form.Item label="影响幅度 (%)">
                        <InputNumber min={10} max={200} value={customScenario.impactPct} onChange={(v) => setCustomScenario((c) => ({ ...c, impactPct: v }))} style={{ width: '100%' }} />
                      </Form.Item>
                      <Button type="primary" block icon={<ThunderboltOutlined />} onClick={handleRunStress}>运行压力测试</Button>
                    </Form>
                  </div>
                </Col>
                <Col xs={24} lg={14}>
                  <div className="business-panel">
                    <h3 className="business-panel-title">压力测试结果</h3>
                    {stressResult ? (
                      <>
                        <Descriptions bordered size="small" column={2}>
                          <Descriptions.Item label="情景">{stressResult.scenario}</Descriptions.Item>
                          <Descriptions.Item label="基准等级">{stressResult.baseline.level}</Descriptions.Item>
                          <Descriptions.Item label="压力等级">{stressResult.stressed.level}</Descriptions.Item>
                          <Descriptions.Item label="损失变化">{stressResult.impact.from} → {stressResult.impact.to}{stressResult.impact.unit}</Descriptions.Item>
                        </Descriptions>
                        <div className="business-chart-box-sm" style={{ marginTop: 12 }}>
                          <Column data={compareData} xField="type" yField="value" height={180} color="#B32620" />
                        </div>
                        <Alert type="error" showIcon message="压力测试结论" description={stressResult.suggestion} style={{ marginTop: 12 }} />
                      </>
                    ) : (
                      <Text type="secondary">选择情景并运行测试，评估极端事件下的风险承受能力</Text>
                    )}
                  </div>
                </Col>
              </Row>
            ),
          },
        ]}
      />

      <div className="business-panel" style={{ marginTop: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Title level={5} style={{ margin: 0 }}>当前评估结果</Title>
            <div className="assessment-score-display">{result.el ?? result.var ?? '-'}</div>
            <Tag color={result.color}>{result.level}</Tag>
            {result.formula && <Paragraph type="secondary" style={{ marginTop: 8 }}>{result.formula}</Paragraph>}
          </Col>
          <Col xs={24} md={16}>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={refreshAutoParams}>重新同步</Button>
              <Button type="primary" icon={<FileTextOutlined />} onClick={handleGenerateReport}>生成完整评估报告</Button>
              <Button onClick={() => onGoResults?.()}>查看评估结果展示 →</Button>
              <Button
                onClick={() => {
                  handleGenerateReport()
                  onGoResponse?.({
                    title: config.signal?.title || '参数评估处置',
                    level: result.level,
                    from: 'assessment-params',
                  })
                }}
              >
                推送至风险应对
              </Button>
              <Button type="link" onClick={() => navigate('/risk/case')}>参考案例库</Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Drawer title="完整评估报告 · 参数说明-计算过程-结果解读" open={reportDrawer} onClose={() => setReportDrawer(false)} width={680}>
        {fullReport && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="报告编号">{fullReport.id}</Descriptions.Item>
              <Descriptions.Item label="模型">{fullReport.modelName}</Descriptions.Item>
              <Descriptions.Item label="参数覆盖率">{fullReport.coverage}%</Descriptions.Item>
              <Descriptions.Item label="生成时间">{fullReport.createdAt}</Descriptions.Item>
            </Descriptions>

            <Title level={5}>一、参数说明</Title>
            <Table size="small" pagination={false} rowKey="name" dataSource={fullReport.sections.paramDescription} columns={[
              { title: '参数', dataIndex: 'name', key: 'name' },
              { title: '取值', dataIndex: 'value', key: 'value' },
              { title: '来源', dataIndex: 'source', key: 'source', ellipsis: true },
              { title: '获取方式', dataIndex: 'auto', key: 'auto', width: 100 },
            ]} />

            <Title level={5} style={{ marginTop: 16 }}>二、计算过程</Title>
            <Timeline items={fullReport.sections.calculationProcess.map((s) => ({
              color: 'blue',
              children: <><Text strong>{s.desc}</Text><br /><Text type="secondary">{s.detail}</Text></>,
            }))} />

            <Title level={5} style={{ marginTop: 16 }}>三、结果解读</Title>
            {fullReport.sections.resultInterpretation.map((t) => (
              <Paragraph key={t}>• {t}</Paragraph>
            ))}

            <Button type="primary" block style={{ marginTop: 16 }} onClick={() => message.success('报告已导出')}>导出 PDF</Button>
          </>
        )}
      </Drawer>
    </>
  )
}
