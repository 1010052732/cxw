import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Progress,
  Row,
  Segmented,
  Space,
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

const { Text, Paragraph, Title } = Typography

export default function PartnerTab({ enterpriseName, onGoBenchmark }) {
  const { message } = App.useApp()
  const [role, setRole] = useState('supplier')
  const [reportOpen, setReportOpen] = useState(false)

  const ent = useMemo(() => getEnterpriseDetail(enterpriseName), [enterpriseName])
  const evalData = useMemo(() => getPartnerEvaluation(enterpriseName, role), [enterpriseName, role])
  const report = useMemo(() => buildDueDiligenceReport(enterpriseName), [enterpriseName])

  const radarData = (evalData.dimensions || []).map((d) => ({ item: d.dim, score: d.score }))

  const handleReport = () => {
    setReportOpen(true)
    message.success('《企业初步尽职调查报告》已生成 · 用时 3.2 分钟')
  }

  return (
    <>
      <div className="business-filter-bar">
        <Space>
          <Text>评估对象</Text>
          <Tag color="processing">{enterpriseName}</Tag>
          <Segmented
            value={role}
            onChange={setRole}
            options={[
              { value: 'supplier', label: '供应商模型' },
              { value: 'customer', label: '客户/买家模型' },
            ]}
          />
        </Space>
        <Space>
          <Button type="primary" icon={<FileProtectOutlined />} onClick={handleReport}>一键尽职调查</Button>
          {onGoBenchmark && <Button type="link" onClick={onGoBenchmark}>行业标杆对比 →</Button>}
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">
              <SafetyCertificateOutlined /> {role === 'supplier' ? '质量-成本-交付-服务-风险' : '信用-价值-战略-稳定性'} 五/四维评估
            </h3>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Progress type="circle" percent={evalData.total} strokeColor="#B32620" format={(p) => `${p}分`} />
              <div style={{ marginTop: 8 }}><Tag color="success">综合得分 {evalData.total}</Tag></div>
            </div>
            {(evalData.dimensions || []).map((d) => (
              <div key={d.dim} style={{ marginBottom: 8 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text>{d.dim}</Text><Text type="secondary">权重 {d.weight}%</Text>
                </Space>
                <Progress percent={d.score} strokeColor="#B32620" size="small" />
              </div>
            ))}
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

      {reportOpen && (
        <div className="business-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0 }}>{report.title}</Title>
            <Button icon={<CloudDownloadOutlined />} onClick={() => message.success('PDF已下载')}>下载PDF</Button>
          </div>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="生成时间">{report.generatedAt}</Descriptions.Item>
            <Descriptions.Item label="风险等级"><Tag color={report.risks.level === '低' ? 'success' : 'warning'}>{report.risks.level}</Tag></Descriptions.Item>
            <Descriptions.Item label="健康度">{report.score} · {report.level}</Descriptions.Item>
            <Descriptions.Item label="诉讼/处罚">{report.risks.litigation} / {report.risks.penalties}</Descriptions.Item>
          </Descriptions>
          <Paragraph style={{ marginTop: 12 }}><Text strong>综合建议：</Text>{report.summary}</Paragraph>
          <Paragraph><Text strong>重点核查：</Text>{(report.checks || []).join('；')}</Paragraph>
          <Table size="small" pagination={false} rowKey="year" dataSource={report.finance || []} columns={[
            { title: '年份', dataIndex: 'year', key: 'year' },
            { title: '营收(亿)', dataIndex: 'revenue', key: 'revenue' },
            { title: '增速%', dataIndex: 'growth', key: 'growth' },
          ]} />
        </div>
      )}
    </>
  )
}
