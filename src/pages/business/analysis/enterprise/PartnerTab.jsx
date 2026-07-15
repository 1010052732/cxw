import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Progress,
  Row,
  Segmented,
  Slider,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Radar } from '@ant-design/charts'
import {
  CloudDownloadOutlined,
  FileProtectOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import {
  buildDueDiligenceReport,
  getEnterpriseDetail,
  getPartnerEvaluation,
} from '../../../../mock/analysis'
import { exportCsv, exportJsonAsTxt } from '../analysisExport'
import EnterpriseSwitcher from './EnterpriseSwitcher'
import { loadPartnerWeights, savePartnerWeights } from './enterpriseStore'

const { Text, Paragraph, Title } = Typography

const WORKFLOW_STEPS = [
  { key: 'model', title: '评估模型' },
  { key: 'report', title: '尽职调查' },
  { key: 'network', title: '贸易网络' },
]

export default function PartnerTab({ enterpriseName, onGoQuery, onGoBenchmark }) {
  const { message } = App.useApp()
  const [workflowStep, setWorkflowStep] = useState(0)
  const [role, setRole] = useState('supplier')
  const [reportOpen, setReportOpen] = useState(false)
  const [weightOverrides, setWeightOverrides] = useState({})

  const ent = useMemo(() => getEnterpriseDetail(enterpriseName), [enterpriseName])
  const evalData = useMemo(() => getPartnerEvaluation(enterpriseName, role), [enterpriseName, role])
  const report = useMemo(() => buildDueDiligenceReport(enterpriseName), [enterpriseName])

  useEffect(() => {
    setWorkflowStep(0)
    setReportOpen(false)
    const saved = loadPartnerWeights(enterpriseName, role)
    setWeightOverrides(saved || {})
  }, [enterpriseName, role])

  const dimensions = useMemo(() => {
    const dims = evalData.dimensions || []
    if (!Object.keys(weightOverrides).length) return dims
    return dims.map((d) => ({ ...d, weight: weightOverrides[d.dim] ?? d.weight }))
  }, [evalData, weightOverrides])

  const weightedTotal = useMemo(() => {
    const sumW = dimensions.reduce((s, d) => s + (d.weight || 0), 0) || 100
    const score = dimensions.reduce((s, d) => s + (d.score || 0) * (d.weight || 0), 0) / sumW
    return Math.round(score)
  }, [dimensions])

  const radarData = dimensions.map((d) => ({ item: d.dim, score: d.score }))

  const handleWeightChange = (dim, v) => {
    const next = { ...weightOverrides, [dim]: v }
    setWeightOverrides(next)
    savePartnerWeights(enterpriseName, role, next)
  }

  const handleReport = () => {
    setReportOpen(true)
    setWorkflowStep(1)
    message.success(`《企业初步尽职调查报告》已生成 · 用时 ${report.durationMinutes || 3.2} 分钟`)
  }

  return (
    <>
      <div className="business-filter-bar" style={{ justifyContent: 'space-between' }}>
        <EnterpriseSwitcher enterpriseName={enterpriseName} onGoQuery={onGoQuery} />
        <Space>
          <Segmented
            value={role}
            onChange={(v) => setRole(v)}
            options={[
              { value: 'supplier', label: '供应商模型' },
              { value: 'customer', label: '客户/买家模型' },
            ]}
          />
          <Button type="primary" icon={<FileProtectOutlined />} onClick={handleReport}>一键尽职调查</Button>
          {onGoBenchmark && <Button type="link" onClick={onGoBenchmark}>行业标杆对比 →</Button>}
        </Space>
      </div>

      <Steps current={workflowStep} onChange={setWorkflowStep} items={WORKFLOW_STEPS.map((s) => ({ title: s.title }))} style={{ marginBottom: 16 }} />

      {workflowStep === 0 && (
        <Row gutter={16}>
          <Col xs={24} lg={10}>
            <div className="business-panel">
              <h3 className="business-panel-title">
                <SafetyCertificateOutlined /> {role === 'supplier' ? '质量-成本-交付-服务-风险' : '信用-价值-战略-稳定性'} 五维/四维评估
              </h3>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Progress type="circle" percent={weightedTotal} strokeColor="#B32620" format={(p) => `${p}分`} />
                <div style={{ marginTop: 8 }}><Tag color="success">综合得分 {weightedTotal}（权重已持久化）</Tag></div>
              </div>
              {dimensions.map((d) => (
                <div key={d.dim} style={{ marginBottom: 12 }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text>{d.dim}</Text>
                    <Text type="secondary">权重 {d.weight}% · 得分 {d.score}</Text>
                  </Space>
                  <Slider min={5} max={40} value={d.weight} onChange={(v) => handleWeightChange(d.dim, v)} />
                  <Progress percent={d.score} strokeColor="#B32620" size="small" />
                </div>
              ))}
              <Button size="small" onClick={() => { setWeightOverrides({}); savePartnerWeights(enterpriseName, role, {}) }}>重置权重</Button>
            </div>
          </Col>
          <Col xs={24} lg={14}>
            <div className="business-panel">
              <h3 className="business-panel-title">维度雷达</h3>
              <div className="business-chart-box-sm">
                <Radar data={radarData} xField="item" yField="score" height={280} color="#B32620" meta={{ score: { min: 0, max: 100 } }} />
              </div>
              <Card size="small" title="风险提示" style={{ marginTop: 12 }}>
                {(evalData.risks || []).map((r) => (
                  <Tag key={r} color={r.includes('无') ? 'success' : 'warning'} style={{ marginBottom: 4 }}>{r}</Tag>
                ))}
              </Card>
            </div>
          </Col>
        </Row>
      )}

      {workflowStep === 1 && reportOpen && (
        <div className="business-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <Title level={5} style={{ margin: 0 }}>{report.title}</Title>
            <Space>
              <Button icon={<CloudDownloadOutlined />} onClick={() => { exportJsonAsTxt(`${enterpriseName}-尽职调查报告.txt`, report); message.success('报告已导出') }}>下载报告</Button>
              <Button onClick={() => { exportCsv(`${enterpriseName}-贸易往来.csv`, ['date', 'type', 'product', 'amount', 'country'], report.trade || []); message.success('贸易数据已导出') }}>导出贸易数据</Button>
            </Space>
          </div>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="生成时间">{report.generatedAt}</Descriptions.Item>
            <Descriptions.Item label="耗时">{report.durationMinutes} 分钟</Descriptions.Item>
            <Descriptions.Item label="风险等级"><Tag color={report.risks?.level === '低' ? 'success' : 'warning'}>{report.risks?.level}</Tag></Descriptions.Item>
            <Descriptions.Item label="健康度">{report.score} · {report.level}</Descriptions.Item>
            <Descriptions.Item label="经营范围" span={2}>{report.basic?.scope}</Descriptions.Item>
          </Descriptions>
          <Paragraph style={{ marginTop: 12 }}><Text strong>综合建议：</Text>{report.summary}</Paragraph>
          <Paragraph><Text strong>重点核查：</Text>{(report.checks || []).join('；')}</Paragraph>
          {(report.risks?.items || []).length > 0 && (
            <Paragraph><Text strong>风险点：</Text>{report.risks.items.join('；')}</Paragraph>
          )}
          {(report.dataSources || []).length > 0 && (
            <Space wrap style={{ marginTop: 8 }}>
              {report.dataSources.map((s) => <Tag key={s}>{s}</Tag>)}
            </Space>
          )}
          <Button type="primary" style={{ marginTop: 12 }} onClick={() => setWorkflowStep(2)}>查看贸易网络 →</Button>
        </div>
      )}

      {workflowStep === 2 && (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <div className="business-panel">
              <h3 className="business-panel-title">贸易关系网络 · 核心供应商</h3>
              <Paragraph type="secondary">{ent.tradeNetwork?.concentration}</Paragraph>
              <Table size="small" pagination={false} rowKey="name" dataSource={ent.tradeNetwork?.suppliers || []} columns={[
                { title: '供应商', dataIndex: 'name', key: 'name' },
                { title: '国家', dataIndex: 'country', key: 'country', width: 80 },
                { title: '合作年限', dataIndex: 'years', key: 'years', width: 80 },
                { title: '份额%', dataIndex: 'share', key: 'share', width: 70 },
                { title: '品类', dataIndex: 'products', key: 'products' },
              ]} />
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="business-panel">
              <h3 className="business-panel-title">贸易关系网络 · 核心采购商</h3>
              <Table size="small" pagination={false} rowKey="name" dataSource={ent.tradeNetwork?.buyers || []} columns={[
                { title: '采购商', dataIndex: 'name', key: 'name' },
                { title: '国家', dataIndex: 'country', key: 'country', width: 80 },
                { title: '合作年限', dataIndex: 'years', key: 'years', width: 80 },
                { title: '份额%', dataIndex: 'share', key: 'share', width: 70 },
                { title: '品类', dataIndex: 'products', key: 'products' },
              ]} />
            </div>
          </Col>
        </Row>
      )}
    </>
  )
}
