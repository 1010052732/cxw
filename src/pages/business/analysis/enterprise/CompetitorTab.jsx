import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Row,
  Segmented,
  Space,
  Steps,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Radar } from '@ant-design/charts'
import { AlertOutlined, BellOutlined, DashboardOutlined, RiseOutlined } from '@ant-design/icons'
import { buildMetric39Radar, getCompetitorAnalysis, getEnterpriseDetail } from '../../../../mock/analysis'
import { exportCsv } from '../analysisExport'
import EnterpriseSwitcher from './EnterpriseSwitcher'
import {
  loadCompetitorAlertChannels,
  loadCompetitorWatchlist,
  saveCompetitorAlertChannels,
  toggleCompetitorWatch,
} from './enterpriseStore'

const { Text, Paragraph } = Typography

const CATEGORY_LABEL = { 财务: '财务表现(12)', 市场: '市场表现(8)', 产品: '产品表现(10)', 运营: '运营表现(9)' }

const WORKFLOW_STEPS = [
  { key: 'benchmark', title: '指标对标' },
  { key: 'strategy', title: '战略回溯' },
  { key: 'monitor', title: '动态监测' },
  { key: 'alert', title: '异动警报' },
]

export default function CompetitorTab({ enterpriseName, onGoQuery, onGoPartner }) {
  const { message, notification } = App.useApp()
  const [workflowStep, setWorkflowStep] = useState(0)
  const [metricGroup, setMetricGroup] = useState('全部')
  const [watchlist, setWatchlist] = useState(loadCompetitorWatchlist)
  const [alertChannels, setAlertChannels] = useState(loadCompetitorAlertChannels)
  const lastAlertKey = useRef('')

  const ent = useMemo(() => getEnterpriseDetail(enterpriseName), [enterpriseName])
  const data = useMemo(() => getCompetitorAnalysis(enterpriseName), [enterpriseName])
  const metrics39 = useMemo(() => buildMetric39Radar(enterpriseName), [enterpriseName])

  const filteredMetrics = useMemo(() => {
    if (metricGroup === '全部') return metrics39
    return metrics39.filter((m) => m.category === metricGroup)
  }, [metrics39, metricGroup])

  const radarFlat = useMemo(() => filteredMetrics.flatMap((r) => [
    { item: r.item, score: r.self, series: ent.name },
    { item: r.item, score: r.rival1, series: data.rivals?.[0]?.name || '竞品A' },
    ...(r.rival2 != null ? [{ item: r.item, score: r.rival2, series: data.rivals?.[1]?.name || '竞品B' }] : []),
  ]), [filteredMetrics, data, ent.name])

  useEffect(() => {
    setWorkflowStep(0)
    lastAlertKey.current = ''
  }, [enterpriseName])

  useEffect(() => {
    const alerts = data.alerts || []
    if (!alerts.length) return
    const key = `${enterpriseName}-${alerts.map((a) => a.title).join('|')}`
    if (lastAlertKey.current === key) return
    lastAlertKey.current = key

    if (alertChannels.platform) {
      notification.warning({
        message: '竞争对手异动警报',
        description: alerts[0]?.title,
        placement: 'topRight',
        duration: 6,
      })
    }
    if (alertChannels.email) message.info('【邮件】竞争异动报告已发送')
    if (alertChannels.sms) message.info('【短信】竞争异动已推送')
  }, [data.alerts, alertChannels, enterpriseName, message, notification])

  const handleChannelChange = (key, checked) => {
    const next = { ...alertChannels, [key]: checked }
    setAlertChannels(next)
    saveCompetitorAlertChannels(next)
  }

  return (
    <>
      <div className="business-filter-bar" style={{ justifyContent: 'space-between' }}>
        <EnterpriseSwitcher enterpriseName={enterpriseName} onGoQuery={onGoQuery} />
        <Space wrap>
          <Checkbox checked={alertChannels.platform} onChange={(e) => handleChannelChange('platform', e.target.checked)}>平台弹窗</Checkbox>
          <Checkbox checked={alertChannels.email} onChange={(e) => handleChannelChange('email', e.target.checked)}>邮件</Checkbox>
          <Checkbox checked={alertChannels.sms} onChange={(e) => handleChannelChange('sms', e.target.checked)}>短信</Checkbox>
        </Space>
      </div>

      <Steps
        className="analysis-workflow-steps"
        current={workflowStep}
        onChange={setWorkflowStep}
        items={WORKFLOW_STEPS.map((s) => ({ title: s.title }))}
        style={{ marginBottom: 16 }}
      />

      {(workflowStep === 0) && (
        <>
          <div className="business-filter-bar">
            <Segmented value={metricGroup} onChange={setMetricGroup} options={['全部', '财务', '市场', '产品', '运营']} />
            <Space>
              <Button
                size="small"
                onClick={() => {
                  exportCsv(`competitor-39metrics-${enterpriseName}.csv`, ['category', 'item', 'self', 'rival1', 'rival2'], metrics39)
                  message.success('39项指标对比表已导出')
                }}
              >
                导出指标
              </Button>
              {onGoPartner && <Button type="link" onClick={onGoPartner}>合作伙伴评估 →</Button>}
            </Space>
          </div>
          <Row gutter={16}>
            <Col xs={24} lg={14}>
              <div className="business-panel">
                <h3 className="business-panel-title">
                  39项指标 · 竞争力雷达对标
                  {metricGroup !== '全部' && <Tag style={{ marginLeft: 8 }}>{CATEGORY_LABEL[metricGroup]}</Tag>}
                </h3>
                <Paragraph type="secondary" style={{ fontSize: 12 }}>
                  财务12 + 市场8 + 产品10 + 运营9；展示 {filteredMetrics.length} 项标准化指标
                </Paragraph>
                <div className="business-chart-box">
                  <Radar data={radarFlat} xField="item" yField="score" seriesField="series" height={360} meta={{ score: { min: 0, max: 100 } }} color={['#B32620', '#1677ff', '#52c41a']} />
                </div>
              </div>
            </Col>
            <Col xs={24} lg={10}>
              <div className="business-panel">
                <h3 className="business-panel-title">差距分析表</h3>
                <Table rowKey="metric" size="small" pagination={false} dataSource={data.gapTable || []} columns={[
                  { title: '指标', dataIndex: 'metric', key: 'metric' },
                  { title: '本企业', dataIndex: 'self', key: 'self', width: 70 },
                  { title: '竞品', dataIndex: 'rival', key: 'rival', width: 70 },
                  { title: '差距', dataIndex: 'gap', key: 'gap', width: 70, render: (v) => <Tag color={String(v).startsWith('+') ? 'success' : 'error'}>{v}</Tag> },
                ]} />
                <Table
                  size="small"
                  pagination={false}
                  style={{ marginTop: 12 }}
                  rowKey="name"
                  dataSource={[data.self, ...(data.rivals || [])].filter(Boolean)}
                  columns={[
                    { title: '企业', dataIndex: 'name', key: 'name' },
                    { title: '营收', dataIndex: 'revenue', key: 'revenue', width: 70 },
                    { title: '份额', dataIndex: 'marketShare', key: 'marketShare', width: 60 },
                    { title: '毛利率', dataIndex: 'margin', key: 'margin', width: 60 },
                  ]}
                />
              </div>
            </Col>
          </Row>
        </>
      )}

      {workflowStep === 1 && (
        <div className="business-panel">
          <h3 className="business-panel-title"><RiseOutlined /> 战略路径回溯 · 近5-10年</h3>
          <Paragraph type="secondary">基于进出口、并购、产品发布、专利等事件还原竞争对手发展逻辑</Paragraph>
          <Timeline items={(data.strategyPath || []).map((s) => ({ children: <div><Text strong>{s.year}</Text> · {s.event}</div> }))} />
          <Button type="primary" style={{ marginTop: 12 }} onClick={() => setWorkflowStep(2)}>进入动态监测 →</Button>
        </div>
      )}

      {workflowStep === 2 && (
        <div className="business-panel">
          <h3 className="business-panel-title"><DashboardOutlined /> 实时竞争动态看板（24h更新）</h3>
          <Space wrap style={{ marginBottom: 12 }}>
            {(data.rivals || []).map((r) => (
              <Button
                key={r.name}
                size="small"
                type={watchlist.includes(r.name) ? 'primary' : 'default'}
                icon={watchlist.includes(r.name) ? <BellOutlined /> : null}
                onClick={() => setWatchlist(toggleCompetitorWatch(r.name))}
              >
                {watchlist.includes(r.name) ? '已关注' : '关注'} {r.name}
              </Button>
            ))}
          </Space>
          {(data.dashboard || []).map((d) => (
            <Card key={d.date + d.content} size="small" style={{ marginBottom: 8 }}>
              <Space><Tag>{d.type}</Tag><Text type="secondary">{d.date}</Text></Space>
              <div>{d.content}</div>
            </Card>
          ))}
          <Button type="primary" onClick={() => setWorkflowStep(3)}>查看异动警报 →</Button>
        </div>
      )}

      {workflowStep === 3 && (
        <div className="business-panel">
          <h3 className="business-panel-title"><AlertOutlined /> 异动警报</h3>
          <Paragraph type="secondary">出口量激增、专利集中申请、供应链变更等异常行为自动识别</Paragraph>
          {(data.alerts || []).map((a) => (
            <Alert key={a.title} type={a.level === '高' ? 'error' : 'warning'} showIcon message={a.title} description={`${a.desc} · ${a.date}`} style={{ marginBottom: 12 }} />
          ))}
          {!(data.alerts || []).length && <Alert type="success" showIcon message="暂无重大异动" description="系统将持续 7×24 监测竞争对手动态" />}
        </div>
      )}
    </>
  )
}
