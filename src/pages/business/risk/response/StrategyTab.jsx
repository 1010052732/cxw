import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  BulbOutlined,
  FileDoneOutlined,
  NodeIndexOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  PRIORITY_RISK_ITEMS,
  RESPONSE_STRATEGY_TYPES,
  STRATEGY_KNOWLEDGE_GRAPH,
  KRI_LIBRARY,
  DEFAULT_PLAN_KRIS,
  buildActionPlan,
  recommendStrategies,
  scoreToGrade,
} from '../../../../mock/risk'

const { Text, Paragraph, Title } = Typography
const typeColor = { avoid: 'blue', reduce: 'success', transfer: 'orange', accept: 'default' }

export default function StrategyTab({ incomingRisk, onGoExecution, onGoEmergency, onGoTracking }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [riskContext, setRiskContext] = useState(incomingRisk || PRIORITY_RISK_ITEMS[0])
  const [selectedIds, setSelectedIds] = useState([])
  const [detailStrategy, setDetailStrategy] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [planStep, setPlanStep] = useState(0)
  const [actionPlan, setActionPlan] = useState(null)
  const [selectedKris, setSelectedKris] = useState(DEFAULT_PLAN_KRIS.map((k) => k.kriId))
  const [planForm] = Form.useForm()

  const recommendations = useMemo(
    () => recommendStrategies({
      riskType: riskContext.type,
      grade: riskContext.grade || scoreToGrade(riskContext.score).grade,
      exposure: riskContext.exposure,
      title: riskContext.title,
    }),
    [riskContext],
  )

  const selectedStrategies = recommendations.filter((s) => selectedIds.includes(s.id))

  const toggleStrategy = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 3)))
  }

  const handleCreatePlan = () => {
    planForm.validateFields().then((values) => {
      const actions = (values.actions || '').split('\n').filter(Boolean).map((line, i) => {
        const [item, owner, dept, end] = line.split('|').map((s) => s.trim())
        return {
          id: i + 1,
          item: item || line,
          owner: owner || values.owner,
          dept: dept || values.dept,
          start: 'D+0',
          end: end || values.deadline,
          budget: values.budget || 0,
          kpi: values.kpi,
          status: '待开始',
        }
      })
      const kris = DEFAULT_PLAN_KRIS.filter((k) => selectedKris.includes(k.kriId))
      const plan = buildActionPlan({
        strategies: selectedStrategies.length ? selectedStrategies : recommendations.slice(0, 1),
        actions: actions.length ? actions : undefined,
        riskTitle: riskContext.title,
        kris,
      })
      setActionPlan(plan)
      setPlanStep(2)
      message.success('《风险应对行动计划表》已生成，已同步日历与待办')
    })
  }

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="策略库支撑 → 智能推荐 → 流程化制定"
        description={`当前风险：${riskContext.title} · ${riskContext.type} · 敞口${riskContext.exposure}万`}
        action={
          <Select
            size="small"
            style={{ width: 200 }}
            value={riskContext.id}
            options={PRIORITY_RISK_ITEMS.map((r) => ({ value: r.id, label: r.title }))}
            onChange={(id) => {
              const r = PRIORITY_RISK_ITEMS.find((x) => x.id === id)
              if (r) { setRiskContext(r); setSelectedIds([]) }
            }}
          />
        }
      />

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title"><NodeIndexOutlined /> 策略知识图谱</h3>
            <Paragraph type="secondary">风险类型 → 策略框架 → 具体措施</Paragraph>
            <Space wrap style={{ marginBottom: 12 }}>
              {RESPONSE_STRATEGY_TYPES.map((t) => (
                <Tag key={t.key} color={typeColor[t.key]}>{t.label}</Tag>
              ))}
            </Space>
            <div className="rule-canvas" style={{ minHeight: 160 }}>
              <div className="rule-canvas-node start">{riskContext.type}</div>
              {RESPONSE_STRATEGY_TYPES.map((t) => (
                <div key={t.key} className="rule-canvas-flow">
                  <Tag className="rule-logic-tag">{t.label}</Tag>
                  <div className="rule-canvas-node atom" style={{ borderColor: t.color }}>
                    {STRATEGY_KNOWLEDGE_GRAPH.filter((s) => s.type === t.key && s.riskType === riskContext.type).length || 0} 条策略
                  </div>
                </div>
              ))}
            </div>
            {RESPONSE_STRATEGY_TYPES.map((t) => (
              <Paragraph key={t.key} type="secondary" style={{ fontSize: 12, marginBottom: 4 }}>
                <Tag color={typeColor[t.key]}>{t.label}</Tag> {t.desc}
              </Paragraph>
            ))}
          </div>
        </Col>

        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title"><BulbOutlined /> 智能策略推荐（Top {recommendations.length}）</h3>
            {recommendations.map((s) => (
              <Card
                key={s.id}
                size="small"
                style={{ marginBottom: 8, borderLeft: `3px solid ${RESPONSE_STRATEGY_TYPES.find((t) => t.key === s.type)?.color}` }}
                extra={
                  <Checkbox checked={selectedIds.includes(s.id)} onChange={() => toggleStrategy(s.id)}>组合</Checkbox>
                }
              >
                <Space wrap>
                  <Tag color={typeColor[s.type]}>{s.framework}</Tag>
                  <Text strong>{s.title}</Text>
                </Space>
                <Paragraph type="secondary" style={{ margin: '6px 0', fontSize: 12 }}>{s.reason}</Paragraph>
                <Space>
                  <Button type="link" size="small" onClick={() => { setDetailStrategy(s); setDrawerOpen(true) }}>详情</Button>
                  <Button type="link" size="small" onClick={() => toggleStrategy(s.id)}>选用</Button>
                </Space>
              </Card>
            ))}
            {selectedIds.length > 1 && (
              <Alert type="success" showIcon message={`已组合 ${selectedIds.length} 条策略`} description="如：预付款+信用保险组合方案" />
            )}
          </div>
        </Col>
      </Row>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <h3 className="business-panel-title"><FileDoneOutlined /> 应对计划制定工作流</h3>
        <Steps
          current={planStep}
          style={{ marginBottom: 24 }}
          items={[
            { title: '选定策略', description: `${selectedStrategies.length || 0} 条已选` },
            { title: '填写行动要素', description: '责任人·时间·预算·KPI' },
            { title: '生成计划表', description: '审批·版本·待办同步' },
          ]}
        />

        {planStep === 0 && (
          <Space>
            <Button type="primary" disabled={!selectedStrategies.length} onClick={() => setPlanStep(1)}>
              下一步：制定行动计划
            </Button>
            <Button onClick={() => { setSelectedIds([recommendations[0]?.id].filter(Boolean)); setPlanStep(1) }}>
              采用首推策略
            </Button>
          </Space>
        )}

        {planStep === 1 && (
          <Form form={planForm} layout="vertical" initialValues={{ owner: '王芳', dept: '风控部', budget: 50, kpi: '回收率≥70%', deadline: 'D+7' }}>
            <Row gutter={16}>
              <Col span={8}><Form.Item label="总责任人" name="owner" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={8}><Form.Item label="协作部门" name="dept"><Input /></Form.Item></Col>
              <Col span={8}><Form.Item label="预算(万元)" name="budget"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Form.Item label="成功衡量标准(KPI)" name="kpi"><Input /></Form.Item>
            <Form.Item label="完成节点" name="deadline"><Input placeholder="如 D+7" /></Form.Item>
            <Form.Item label="行动项（每行：行动|责任人|部门|节点）" name="actions">
              <Input.TextArea rows={4} placeholder="购买信用保险|王芳|风控部|D+3&#10;提高预付款比例|销售经理|销售部|D+5" />
            </Form.Item>
            <Form.Item label="效果跟踪 KRI（1-3项）">
              <Checkbox.Group
                value={selectedKris}
                onChange={setSelectedKris}
                options={DEFAULT_PLAN_KRIS.map((k) => ({ label: `${k.name}（基准${k.baseline}→目标${k.target}${k.unit}）`, value: k.kriId }))}
              />
              <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                指标库参考：{KRI_LIBRARY.slice(0, 3).map((k) => k.name).join(' · ')}等
              </Paragraph>
            </Form.Item>
            <Form.Item label="已选策略">
              {selectedStrategies.map((s) => <Tag key={s.id} color={typeColor[s.type]}>{s.title}</Tag>)}
            </Form.Item>
            <Space>
              <Button onClick={() => setPlanStep(0)}>上一步</Button>
              <Button type="primary" onClick={handleCreatePlan}>生成行动计划表</Button>
            </Space>
          </Form>
        )}

        {planStep === 2 && actionPlan && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 12 }}>
              <Descriptions.Item label="计划编号">{actionPlan.id}</Descriptions.Item>
              <Descriptions.Item label="版本">{actionPlan.version}</Descriptions.Item>
              <Descriptions.Item label="策略组合" span={2}>{actionPlan.strategies.join(' + ')}</Descriptions.Item>
              <Descriptions.Item label="同步状态" span={2}>{actionPlan.matrix}</Descriptions.Item>
            </Descriptions>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={actionPlan.actions}
              columns={[
                { title: '行动项', dataIndex: 'item', key: 'item' },
                { title: '责任人', dataIndex: 'owner', key: 'owner', width: 90 },
                { title: '部门', dataIndex: 'dept', key: 'dept', width: 90 },
                { title: '节点', dataIndex: 'end', key: 'end', width: 70 },
                { title: '预算', dataIndex: 'budget', key: 'budget', width: 70, render: (v) => `${v}万` },
                { title: 'KPI', dataIndex: 'kpi', key: 'kpi', ellipsis: true },
                { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
              ]}
            />
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => { message.success('计划已推送执行跟踪'); onGoExecution?.(actionPlan) }}>
                推送至执行跟踪
              </Button>
              <Button onClick={() => onGoTracking?.(actionPlan)}>进入效果跟踪 →</Button>
              <Button onClick={() => navigate('/risk/case')}>查看参考案例</Button>
              {onGoEmergency && <Button onClick={onGoEmergency}>重大事件 → 应急预案</Button>}
            </Space>
          </>
        )}
      </div>

      <Drawer title={detailStrategy?.title} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={560}>
        {detailStrategy && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="策略框架"><Tag color={typeColor[detailStrategy.type]}>{detailStrategy.framework}</Tag></Descriptions.Item>
              <Descriptions.Item label="适用场景">{detailStrategy.scene}</Descriptions.Item>
              <Descriptions.Item label="触发条件">{detailStrategy.trigger}</Descriptions.Item>
              <Descriptions.Item label="操作步骤">{detailStrategy.steps.join(' → ')}</Descriptions.Item>
              <Descriptions.Item label="资源清单">{detailStrategy.resources.join(' · ')}</Descriptions.Item>
              <Descriptions.Item label="预期效果">{detailStrategy.kpi}</Descriptions.Item>
              <Descriptions.Item label="潜在副作用">{detailStrategy.sideEffect} · 规避：{detailStrategy.sideEffectMitigation}</Descriptions.Item>
              <Descriptions.Item label="案例索引">{detailStrategy.caseRef}</Descriptions.Item>
            </Descriptions>
            <Button type="link" style={{ marginTop: 12 }} onClick={() => navigate(`/risk/case?caseId=${detailStrategy.caseRef}`)}>
              查看行业参考案例
            </Button>
          </>
        )}
      </Drawer>
    </>
  )
}
