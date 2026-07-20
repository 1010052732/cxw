import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  App,
  Button,
  Col,
  Descriptions,
  Row,
  Select,
  Slider,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Line } from '@ant-design/charts'
import {
  OrderedListOutlined,
  RocketOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  INDUSTRY_PRIORITY_PRESETS,
  PRIORITY_CRITERIA,
  calcPriorityQueue,
  scoreToGrade,
  simulateResourceOptimization,
} from '../../../../mock/risk'

const { Text, Paragraph, Title } = Typography

export default function PriorityTab({ onGoResponse }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [presetId, setPresetId] = useState('b2b')
  const [customWeights, setCustomWeights] = useState(null)
  const [budget, setBudget] = useState(85)

  const preset = INDUSTRY_PRIORITY_PRESETS.find((p) => p.id === presetId) || INDUSTRY_PRIORITY_PRESETS[0]
  const weights = customWeights || preset.weights

  const queue = useMemo(() => calcPriorityQueue(weights), [weights])
  const optimization = useMemo(() => simulateResourceOptimization(budget), [budget])

  const handleWeightChange = (key, val) => {
    setCustomWeights((prev) => ({ ...(prev || preset.weights), [key]: val }))
  }

  const handleApplyPreset = (id) => {
    setPresetId(id)
    setCustomWeights(null)
  }

  const handleDispatch = () => {
    const items = queue.slice(0, 3).map((q) => q.title)
    message.success(`已按优先级队列推送 Top${optimization.allocation.length} 至风险应对`)
    onGoResponse?.({ items, title: items[0], level: queue[0]?.level })
  }

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="多准则排序 · 资源约束优化 · 明确「该先防哪一个」"
        description="综合风险评分、敞口、趋势、紧迫性、成本效益、战略影响六维加权"
      />

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title"><OrderedListOutlined /> 准则权重配置</h3>
            <FormPreset presetId={presetId} onChange={handleApplyPreset} />
            <Paragraph type="secondary">当前行业：{preset.name}</Paragraph>
            {PRIORITY_CRITERIA.map((c) => (
              <div key={c.key} style={{ marginBottom: 12 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text>{c.label}</Text>
                  <Text type="secondary">{weights[c.key]}%</Text>
                </Space>
                <Slider
                  min={5}
                  max={35}
                  value={weights[c.key]}
                  onChange={(v) => handleWeightChange(c.key, v)}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>{c.desc}</Text>
              </div>
            ))}
          </div>
        </Col>

        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title"><RocketOutlined /> 风险应对优先级队列</h3>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={queue}
              columns={[
                {
                  title: '排名',
                  key: 'rank',
                  width: 60,
                  render: (_, __, idx) => (
                    <Tag color={idx === 0 ? 'error' : idx < 3 ? 'warning' : 'default'}>{idx + 1}</Tag>
                  ),
                },
                { title: '风险事件', dataIndex: 'title', key: 'title', ellipsis: true },
                {
                  title: '等级',
                  key: 'grade',
                  width: 70,
                  render: (_, r) => {
                    const g = scoreToGrade(r.score)
                    return <Tag color={g.color}>{g.grade}</Tag>
                  },
                },
                { title: '优先级分', dataIndex: 'priorityScore', key: 'priorityScore', width: 90 },
                { title: '敞口', dataIndex: 'exposure', key: 'exposure', width: 70, render: (v) => `${v}万` },
                { title: '趋势', dataIndex: 'trend', key: 'trend', width: 80 },
                { title: '建议', dataIndex: 'suggestion', key: 'suggestion', ellipsis: true },
              ]}
            />
          </div>
        </Col>
      </Row>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <h3 className="business-panel-title"><TeamOutlined /> 资源约束下的优化建议</h3>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Title level={5}>可投入风控资源上限（万元）</Title>
            <Slider min={30} max={150} value={budget} onChange={setBudget} marks={{ 30: '30', 85: '85', 150: '150' }} />
            <Descriptions bordered size="small" column={1} style={{ marginTop: 16 }}>
              <Descriptions.Item label="最优投入点">{optimization.optimal.budget} 万元</Descriptions.Item>
              <Descriptions.Item label="预期损失降低">{optimization.optimal.lossReduction} 万元</Descriptions.Item>
              <Descriptions.Item label="投入产出比">{Math.round(optimization.optimal.lossReduction / optimization.optimal.budget * 10) / 10} x</Descriptions.Item>
            </Descriptions>
            <Alert type="success" showIcon message={optimization.suggestion} style={{ marginTop: 12 }} />
          </Col>
          <Col xs={24} md={16}>
            <Paragraph type="secondary">资源投入 — 总体预期损失降低效果</Paragraph>
            <div className="business-chart-box">
              <Line
                data={optimization.curve.map((p) => ({ budget: p.budget, lossReduction: p.lossReduction }))}
                xField="budget"
                yField="lossReduction"
                height={240}
                color="#B32620"
                point={{ size: 5 }}
                meta={{ budget: { alias: '投入(万)' }, lossReduction: { alias: '降损(万)' } }}
              />
            </div>
            <Title level={5} style={{ marginTop: 12 }}>资源分配建议</Title>
            <Table
              size="small"
              pagination={false}
              rowKey="rank"
              dataSource={optimization.allocation}
              columns={[
                { title: '优先级', dataIndex: 'rank', key: 'rank', width: 70 },
                { title: '风险', dataIndex: 'title', key: 'title' },
                { title: '建议投入', dataIndex: 'budget', key: 'budget', render: (v) => `${v} 万` },
                { title: '预期降损', dataIndex: 'expectedReduction', key: 'expectedReduction', render: (v) => `${v} 万` },
              ]}
            />
          </Col>
        </Row>
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={handleDispatch}>按优先级推送至风险应对</Button>
          <Button onClick={() => navigate('/risk/assessment?tab=results')}>返回评估结果</Button>
          <Button type="link" onClick={() => navigate('/risk/case')}>参考历史案例</Button>
        </Space>
      </div>
    </>
  )
}

function FormPreset({ presetId, onChange }) {
  return (
    <Select
      style={{ width: '100%', marginBottom: 12 }}
      value={presetId}
      options={INDUSTRY_PRIORITY_PRESETS.map((p) => ({ value: p.id, label: p.name }))}
      onChange={onChange}
    />
  )
}
