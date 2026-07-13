import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  App,
  Button,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Column, Line } from '@ant-design/charts'
import {
  CloudDownloadOutlined,
  LineChartOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {
  EFFECT_TRACKING_PLANS,
  KRI_LIBRARY,
  STRATEGY_ADJUSTMENT_ALERTS,
  STRATEGY_EFFECTIVENESS_INSIGHTS,
  evaluateKriStatus,
  generateEffectTrackingReport,
} from '../../../../mock/risk'

const { Text, Paragraph, Title } = Typography

export default function TrackingTab({ activePlan, onGoStrategy, onGoArchive }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [planId, setPlanId] = useState(activePlan?.id || EFFECT_TRACKING_PLANS[0].planId)
  const [report, setReport] = useState(() => generateEffectTrackingReport(planId))
  const [adjustForm] = Form.useForm()
  const [adjustModal, setAdjustModal] = useState(false)
  const [alerts, setAlerts] = useState(STRATEGY_ADJUSTMENT_ALERTS)
  const [customKris, setCustomKris] = useState([])
  const [kriDrawer, setKriDrawer] = useState(false)

  const plan = useMemo(
    () => EFFECT_TRACKING_PLANS.find((p) => p.planId === planId) || EFFECT_TRACKING_PLANS[0],
    [planId],
  )

  const chartData = useMemo(() => {
    if (!report.trend?.length) return []
    return report.trend.flatMap((t) => [
      { period: t.date, value: t.recovery ?? t.progress ?? 0, metric: '核心KRI' },
      { period: t.date, value: t.loss ?? t.recoveryDays ?? 0, metric: '辅助指标' },
    ])
  }, [report])

  const compareData = useMemo(
    () => report.kriResults.map((k) => ({
      name: k.name.slice(0, 6),
      baseline: k.baseline,
      current: k.current,
      target: k.target,
    })),
    [report],
  )

  const refreshReport = () => {
    const r = generateEffectTrackingReport(planId)
    setReport(r)
    message.success(`${r.cycle}效果跟踪报告已生成`)
  }

  const handleAdjustSubmit = () => {
    adjustForm.validateFields().then((values) => {
      setAlerts((prev) => prev.map((a) => (a.id === values.alertId ? { ...a, resolved: true } : a)))
      message.success('策略调整方案已录入 · 已同步策略有效性数据库')
      setAdjustModal(false)
      onGoStrategy?.()
    })
  }

  const handleAddKri = (values) => {
    setCustomKris((prev) => [...prev, { ...values, kriId: `custom-${Date.now()}`, current: values.baseline }])
    setKriDrawer(false)
    message.success('自定义KRI已绑定至跟踪计划')
  }

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="指标设定 → 自动化监控 → 效果评估 → 策略优化"
        description={`跟踪对象：${plan.riskTitle} · 报告周期：${plan.reportCycle}`}
        action={
          <Select
            size="small"
            style={{ width: 220 }}
            value={planId}
            options={EFFECT_TRACKING_PLANS.map((p) => ({ value: p.planId, label: p.riskTitle }))}
            onChange={(id) => { setPlanId(id); setReport(generateEffectTrackingReport(id)) }}
          />
        }
      />

      {alerts.filter((a) => !a.resolved).map((a) => (
        <Alert
          key={a.id}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 8 }}
          message={`策略调整提醒 · ${a.kri} ${a.status}`}
          description={`${a.message} · 建议：${a.suggestion} · 截止 ${a.deadline}`}
          action={
            <Button size="small" type="primary" onClick={() => { adjustForm.setFieldsValue({ alertId: a.id }); setAdjustModal(true) }}>
              制定调整方案
            </Button>
          }
        />
      ))}

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>KRI 指标（SMART）</h3>
              <Button size="small" onClick={() => setKriDrawer(true)}>设定/新增</Button>
            </div>
            <Table
              rowKey="name"
              size="small"
              pagination={false}
              dataSource={[...plan.kris, ...customKris]}
              columns={[
                { title: '指标', dataIndex: 'name', key: 'name', ellipsis: true },
                { title: '基准', key: 'b', width: 70, render: (_, r) => `${r.baseline}${r.unit}` },
                { title: '目标', key: 't', width: 70, render: (_, r) => `${r.target}${r.unit}` },
                { title: '当前', key: 'c', width: 70, render: (_, r) => `${r.current}${r.unit}` },
                {
                  title: '状态',
                  key: 's',
                  width: 90,
                  render: (_, r) => {
                    const lib = KRI_LIBRARY.find((l) => l.id === r.kriId)
                    const e = evaluateKriStatus({ ...r, higherBetter: lib?.higherBetter ?? true })
                    return <Tag color={e.color}>{e.status}</Tag>
                  },
                },
              ]}
            />
            <Title level={5} style={{ marginTop: 12 }}>内置指标库</Title>
            <Space wrap>
              {KRI_LIBRARY.map((k) => (
                <Tag key={k.id} bordered={false}>{k.name} · {k.type}</Tag>
              ))}
            </Space>
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">策略有效性数据库</h3>
            <Paragraph type="secondary">{STRATEGY_EFFECTIVENESS_INSIGHTS.graphUpdates.join('；')}</Paragraph>
            <Text strong>低效策略共性问题</Text>
            {STRATEGY_EFFECTIVENESS_INSIGHTS.lowEfficiency.map((t) => (
              <Paragraph key={t} type="secondary" style={{ margin: '4px 0', fontSize: 12 }}>• {t}</Paragraph>
            ))}
            <Text strong>高效策略特征</Text>
            {STRATEGY_EFFECTIVENESS_INSIGHTS.highEfficiency.map((t) => (
              <Paragraph key={t} type="secondary" style={{ margin: '4px 0', fontSize: 12 }}>• {t}</Paragraph>
            ))}
            <Button type="link" size="small" onClick={() => navigate('/risk/response?tab=strategy')}>优化策略知识图谱 →</Button>
          </div>
        </Col>

        <Col xs={24} lg={14}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}><LineChartOutlined /> 效果跟踪报告</h3>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={refreshReport}>刷新监控</Button>
                <Button icon={<CloudDownloadOutlined />} onClick={() => message.success('报告已导出')}>导出</Button>
              </Space>
            </div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 12 }}>
              <Descriptions.Item label="综合效果">
                <Tag color={report.overall === '效果显著' ? 'success' : report.overall === '效果一般' ? 'warning' : 'error'}>{report.overall}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="生成时间">{report.generatedAt}</Descriptions.Item>
              <Descriptions.Item label="原因诊断" span={2}>{report.diagnosis}</Descriptions.Item>
            </Descriptions>
            <Row gutter={12}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>基准 vs 当前 vs 目标</Text>
                <div className="business-chart-box-sm">
                  <Column
                    data={compareData.flatMap((d) => [
                      { name: d.name, type: '基准', value: d.baseline },
                      { name: d.name, type: '当前', value: d.current },
                      { name: d.name, type: '目标', value: d.target },
                    ])}
                    xField="name"
                    yField="value"
                    seriesField="type"
                    height={200}
                    color={['#bfbfbf', '#B32620', '#52c41a']}
                  />
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>KRI 趋势</Text>
                <div className="business-chart-box-sm">
                  <Line data={chartData} xField="period" yField="value" seriesField="metric" height={200} color={['#B32620', '#1677ff']} />
                </div>
              </Col>
            </Row>
            {report.issues.length > 0 && (
              <Alert type="warning" showIcon style={{ marginTop: 12 }} message="未达预期项" description={report.issues.join('；')} />
            )}
          </div>
        </Col>
      </Row>

      <Drawer title="设定 KRI（SMART）" open={kriDrawer} onClose={() => setKriDrawer(false)} width={480}>
        <Form layout="vertical" onFinish={handleAddKri} initialValues={{ period: '周度' }}>
          <Form.Item name="name" label="指标名称" rules={[{ required: true }]}>
            <Select allowClear placeholder="从指标库选择或自定义" options={KRI_LIBRARY.map((k) => ({ value: k.name, label: `${k.name}（${k.type}）` }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="baseline" label="基准值" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="target" label="目标值" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="unit" label="单位" initialValue="%"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="period" label="监控周期"><Select options={[{ value: '日度' }, { value: '周度' }, { value: '月度' }]} /></Form.Item>
          <Button type="primary" htmlType="submit" block>绑定至跟踪计划</Button>
        </Form>
      </Drawer>

      <Modal title="策略调整方案" open={adjustModal} onCancel={() => setAdjustModal(false)} onOk={handleAdjustSubmit}>
        <Form form={adjustForm} layout="vertical">
          <Form.Item name="alertId" hidden><Input /></Form.Item>
          <Form.Item name="adjustment" label="调整方案" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="重新评估风险并说明策略调整内容" />
          </Form.Item>
          <Form.Item name="reason" label="原因分析" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
