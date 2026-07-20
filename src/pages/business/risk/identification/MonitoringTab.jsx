import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Row,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import {
  AlertOutlined,
  BellOutlined,
  ClusterOutlined,
  NodeIndexOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { saveRiskHandoff, handoffToAssessment, handoffToResponse } from '../../../../utils/riskHandoff'
import { pushRiskAlert } from '../riskStore'
import {
  ALERT_LEVEL_MAP,
  findSimilarCases,
  getMonitoringData,
} from '../../../../mock/risk'

const { Text, Paragraph } = Typography

const levelTag = {
  红色: 'error',
  橙色: 'orange',
  黄色: 'warning',
  蓝色: 'processing',
}

export default function MonitoringTab({ onGoResponse, onGoDisplay, onGoAssessment }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const data = useMemo(() => getMonitoringData(), [])
  const [alerts, setAlerts] = useState(data.alerts)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [current, setCurrent] = useState(null)
  const [composite, setComposite] = useState(null)

  const handleConfirm = (record) => {
    setAlerts((prev) => prev.map((a) => (a.id === record.id ? { ...a, confirmed: true, status: '已确认' } : a)))
    pushRiskAlert({ ...record, status: '已确认', source: 'monitoring' })
    message.success(`已确认 · ${record.title}`)
  }

  const handleSendAssess = (record) => {
    const payload = {
      from: 'monitoring-alert',
      alertId: record.id,
      title: record.title,
      type: record.type,
      level: record.level,
      suggestedModel: record.type?.includes('信用') ? 'el' : record.type?.includes('汇率') || record.type?.includes('市场') ? 'var' : 'matrix',
    }
    pushRiskAlert({ ...record, status: '待评估', ...payload })
    handoffToAssessment(payload, navigate)
    message.success('已送入风险评估 · 请选择模型量化打分')
  }

  const handleDispatch = (record) => {
    const payload = {
      from: 'monitoring-alert',
      alertId: record.id,
      title: record.title,
      alertTitle: record.title,
      type: record.type,
      level: record.level,
    }
    pushRiskAlert({ ...record, status: '处置中', ...payload })
    saveRiskHandoff(payload)
    handoffToResponse(payload, navigate)
    message.success('已推送至风险应对任务池')
  }

  const openDetail = (record) => {
    setCurrent(record)
    setDrawerOpen(true)
  }

  const similarCases = useMemo(() => {
    if (!current) return []
    const region = current.title.includes('巴西') ? '南美' : current.title.includes('美国') ? '北美' : undefined
    return findSimilarCases({ type: current.type, region, keyword: current.type.includes('信用') ? '拖欠' : undefined })
  }, [current])

  return (
    <>
      <Alert
        type="info"
        showIcon
        icon={<ThunderboltOutlined />}
        style={{ marginBottom: 16 }}
        message={`实时流计算 · ${data.engine.engine}`}
        description={`延迟 ${data.engine.latency} · 吞吐 ${data.engine.throughput} · 并行匹配 ${data.engine.rulesMatched} 条规则 · CEP模式 ${data.engine.cepPatterns} 个`}
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        {Object.entries(ALERT_LEVEL_MAP).map(([key, cfg]) => {
          const count = alerts.filter((a) => a.level === key).length
          return (
            <Col xs={12} sm={6} key={key}>
              <Card size="small" className={`alert-level-card alert-level-${key}`}>
                <Text type="secondary">{cfg.label}</Text>
                <div className="forecast-stat-value" style={{ color: cfg.color }}>{count}</div>
                <Text type="secondary">{cfg.confirmMinutes}分钟内确认</Text>
              </Card>
            </Col>
          )
        })}
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={15}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}><BellOutlined /> 实时预警流</h3>
              <Badge status="processing" text="CEP运行中" />
            </div>
            <Table
              rowKey="id"
              size="small"
              pagination={{ pageSize: 6 }}
              dataSource={alerts}
              rowClassName={(r) => (r.level === '红色' && !r.confirmed ? 'risk-alert-blink' : '')}
              columns={[
                { title: '预警', dataIndex: 'title', key: 'title', ellipsis: true },
                {
                  title: '等级',
                  dataIndex: 'level',
                  key: 'level',
                  width: 70,
                  render: (v) => <Tag color={levelTag[v]}>{v}</Tag>,
                },
                { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
                { title: '延迟', dataIndex: 'latency', key: 'latency', width: 60 },
                { title: '责任人', dataIndex: 'owner', key: 'owner', width: 100, ellipsis: true },
                {
                  title: '操作',
                  key: 'action',
                  width: 220,
                  render: (_, r) => (
                    <Space size="small" wrap>
                      <Button type="link" size="small" onClick={() => openDetail(r)}>详情</Button>
                      {!r.confirmed && (
                        <Button type="primary" size="small" onClick={() => handleConfirm(r)}>确认</Button>
                      )}
                      <Button type="link" size="small" onClick={() => handleSendAssess(r)}>评估</Button>
                      <Button type="link" size="small" onClick={() => handleDispatch(r)}>应对</Button>
                    </Space>
                  ),
                },
              ]}
            />
          </div>
        </Col>
        <Col xs={24} lg={9}>
          <div className="business-panel">
            <h3 className="business-panel-title"><SendOutlined /> 智能推送路由</h3>
            <Table rowKey="level" size="small" pagination={false} dataSource={data.routing} columns={[
              { title: '等级', dataIndex: 'level', key: 'level', width: 90 },
              { title: '渠道', dataIndex: 'channels', key: 'channels', render: (v) => v.map((c) => <Tag key={c}>{c}</Tag>) },
            ]} />
            <Table
              rowKey="type"
              size="small"
              pagination={false}
              style={{ marginTop: 12 }}
              dataSource={data.matrix}
              columns={[
                { title: '风险类型', dataIndex: 'type', key: 'type', width: 90 },
                { title: '责任部门', dataIndex: 'dept', key: 'dept', width: 80 },
                { title: '联系人', dataIndex: 'contacts', key: 'contacts', render: (v) => v.join('、') },
              ]}
            />
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title"><ClusterOutlined /> 告警聚合与降噪</h3>
        {(data.aggregated || []).map((agg) => (
          <Card key={agg.id} size="small" style={{ marginBottom: 12 }}>
            <Space wrap>
              <Tag color="orange">{agg.level}</Tag>
              <Text strong>{agg.title}</Text>
              <Text type="secondary">{agg.time} · 窗口 {agg.window}</Text>
            </Space>
            <Paragraph style={{ margin: '8px 0' }}>{agg.summary}</Paragraph>
            <Space wrap>
              {agg.subItems.map((s) => <Tag key={s}>{s}</Tag>)}
            </Space>
            <div style={{ marginTop: 8 }}>
              <Button
                size="small"
                type="primary"
                onClick={() => handleSendAssess({
                  id: agg.id,
                  title: agg.title,
                  level: agg.level,
                  type: '复合风险',
                  detail: agg.summary,
                })}
              >
                聚合事件送评估
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="business-panel">
        <h3 className="business-panel-title"><NodeIndexOutlined /> 风险事件关联分析 · CEP复合事件</h3>
        <Row gutter={16}>
          {(data.composite || []).map((ev) => (
            <Col xs={24} lg={12} key={ev.id}>
              <Card
                hoverable
                className={composite?.id === ev.id ? 'forecast-scenario-active' : ''}
                onClick={() => setComposite(ev)}
              >
                <Tag color={levelTag[ev.level] || 'error'}>{ev.level}</Tag>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{ev.title}</div>
                <Text type="secondary">驱动因素：{ev.driver}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        {composite && (
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} lg={14}>
              <div className="rule-canvas" style={{ minHeight: 160 }}>
                <div className="rule-canvas-node start">{composite.driver}</div>
                {composite.subAlerts.map((s, i) => (
                  <div key={s.title} className="rule-canvas-flow">
                    <Tag className="rule-logic-tag">→</Tag>
                    <div className="rule-canvas-node atom">{s.order}. {s.type} · {s.title}</div>
                    {s.cause && <Text type="secondary" style={{ fontSize: 11 }}>{s.cause}</Text>}
                  </div>
                ))}
                <div className="rule-canvas-node end">主预警 · {composite.title}</div>
              </div>
            </Col>
            <Col xs={24} lg={10}>
              <Alert type="warning" showIcon message="系统性应对建议" description={composite.suggestion} />
              <Timeline
                style={{ marginTop: 16 }}
                items={composite.subAlerts.map((s) => ({
                  color: s.order === 1 ? 'red' : 'blue',
                  children: `${s.order}. ${s.title}`,
                }))}
              />
            </Col>
          </Row>
        )}
      </div>

      <div className="business-filter-bar" style={{ justifyContent: 'space-between' }}>
        <Space wrap>
          {data.engine.dataSources.map((s) => <Tag key={s}>{s}</Tag>)}
        </Space>
        <Space>
          <Button onClick={() => navigate('/risk/situation')}>风险态势感知</Button>
          {onGoDisplay && (
            <Button icon={<NodeIndexOutlined />} onClick={onGoDisplay}>风险信息展示</Button>
          )}
          {onGoAssessment && (
            <Button onClick={onGoAssessment}>进入风险评估</Button>
          )}
          {onGoResponse && (
            <Button type="primary" icon={<AlertOutlined />} onClick={onGoResponse}>进入风险应对</Button>
          )}
        </Space>
      </div>

      <Drawer title="预警详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}>
        {current && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="编号">{current.id}</Descriptions.Item>
              <Descriptions.Item label="等级"><Tag color={levelTag[current.level]}>{ALERT_LEVEL_MAP[current.level]?.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="匹配规则">{current.rule}</Descriptions.Item>
              <Descriptions.Item label="识别延迟">{current.latency}</Descriptions.Item>
              <Descriptions.Item label="推送渠道">{current.channels?.join(' · ')}</Descriptions.Item>
              <Descriptions.Item label="责任人">{current.owner}</Descriptions.Item>
              <Descriptions.Item label="详情">{current.detail}</Descriptions.Item>
            </Descriptions>
            {similarCases.length > 0 && (
              <Card size="small" title="相似案例推荐" style={{ marginTop: 16 }}>
                {similarCases.map((c) => (
                  <div key={c.id} style={{ marginBottom: 8 }}>
                    <Text strong>{c.title}</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 4, fontSize: 12 }}>{c.summary}</Paragraph>
                    <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate(`/risk/case?caseId=${c.id}`)}>
                      查看案例详情
                    </Button>
                  </div>
                ))}
              </Card>
            )}
            {!current.confirmed && (
              <Button type="primary" block style={{ marginTop: 16 }} onClick={() => { handleConfirm(current); setDrawerOpen(false) }}>
                确认已读
              </Button>
            )}
            <Button block type="primary" ghost style={{ marginTop: 8 }} onClick={() => { handleSendAssess(current); setDrawerOpen(false) }}>
              送入风险评估（量化）
            </Button>
            <Button block style={{ marginTop: 8 }} onClick={() => { handleDispatch(current); setDrawerOpen(false) }}>
              紧急直达风险应对
            </Button>
          </>
        )}
      </Drawer>
    </>
  )
}
