import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  BookOutlined,
  BulbOutlined,
  CloudDownloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import RiskPipelineBar from '../RiskPipelineBar'
import {
  CASE_ANALYSIS_REPORT,
  CASE_STRUCTURED_TEMPLATE,
  RISK_CASES,
  findSimilarCases,
  getCaseStructured,
} from '../../../../mock/risk'
import '../../business.css'

const { Text, Paragraph, Title } = Typography
const levelColor = { 高: 'error', 中: 'warning', 低: 'success' }
const CASE_TYPES = ['全部', '信用风险', '政策风险', '物流风险', '合规风险', '汇率风险']
const REGIONS = ['全部', '东南亚', '非洲', '欧洲', '中东', '北美', '东盟', '全球']

export default function RiskCasePage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [typeFilter, setTypeFilter] = useState('全部')
  const [regionFilter, setRegionFilter] = useState('全部')
  const [keyword, setKeyword] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentCase, setCurrentCase] = useState(null)

  const filteredCases = useMemo(() => {
    let list = RISK_CASES
    if (typeFilter !== '全部') list = list.filter((c) => c.type === typeFilter)
    if (regionFilter !== '全部') list = list.filter((c) => c.region.includes(regionFilter) || regionFilter.includes(c.region))
    if (keyword.trim()) {
      const q = keyword.trim()
      list = list.filter((c) => c.title.includes(q) || c.tags.some((t) => t.includes(q)) || c.summary.includes(q))
    }
    return list
  }, [typeFilter, regionFilter, keyword])

  const structured = useMemo(() => (currentCase ? getCaseStructured(currentCase) : null), [currentCase])

  const similarCases = useMemo(() => {
    if (!currentCase) return []
    const byLink = RISK_CASES.filter((c) => currentCase.similar?.includes(c.id))
    const byFeature = findSimilarCases({ type: currentCase.type, region: currentCase.region })
    const ids = new Set([...byLink.map((c) => c.id), ...byFeature.map((c) => c.id)])
    ids.delete(currentCase.id)
    return RISK_CASES.filter((c) => ids.has(c.id)).slice(0, 3)
  }, [currentCase])

  const openCase = (item) => {
    setCurrentCase(item)
    setDrawerOpen(true)
  }

  useEffect(() => {
    const caseId = searchParams.get('caseId') || location.state?.caseId
    if (!caseId) return
    const target = RISK_CASES.find((c) => c.id === caseId)
    if (target) openCase(target)
  }, [searchParams, location.state])

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">风险案例库</h1>
        <p className="page-description">结构化案例沉淀 · 智能检索 · 相似推荐 · 规则优化 · 联动识别与监测</p>
      </div>

      <RiskPipelineBar current="case" />

      <div className="business-filter-bar">
        <Space.Compact style={{ width: 280 }}>
          <Input placeholder="关键词：反倾销、信用证诈骗..." value={keyword} onChange={(e) => setKeyword(e.target.value)} prefix={<SearchOutlined />} />
        </Space.Compact>
        <Select value={typeFilter} style={{ width: 120 }} options={CASE_TYPES.map((v) => ({ value: v, label: v }))} onChange={setTypeFilter} />
        <Select value={regionFilter} style={{ width: 110 }} options={REGIONS.map((v) => ({ value: v, label: v }))} onChange={setRegionFilter} />
        <Button type="link" onClick={() => navigate('/risk/identification?tab=display')}>← 风险信息展示</Button>
        <Button type="link" onClick={() => navigate('/risk/identification?tab=indicator')}>优化风险规则</Button>
      </div>

      <div className="case-card-grid">
        {filteredCases.map((item) => (
          <div key={item.id} className="case-card" onClick={() => openCase(item)}>
            <Space style={{ marginBottom: 8 }}>
              <Tag color={levelColor[item.level]}>{item.level}</Tag>
              <Tag>{item.type}</Tag>
            </Space>
            <Title level={5} style={{ margin: '0 0 8px' }}>{item.title}</Title>
            <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>{item.summary}</Paragraph>
            <Space wrap size={4}>
              {item.tags.map((tag) => <Tag key={tag} bordered={false} color="#B32620">{tag}</Tag>)}
            </Space>
            <div style={{ marginTop: 12, color: '#8c8c8c', fontSize: 12 }}>{item.region} · {item.industry} · {item.date}</div>
          </div>
        ))}
      </div>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 className="business-panel-title" style={{ margin: 0 }}><BulbOutlined /> {CASE_ANALYSIS_REPORT.month} · 案例分析报告</h3>
          <Button icon={<CloudDownloadOutlined />} onClick={() => message.success('报告已下载')}>下载报告</Button>
        </div>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Text strong>高频风险模式</Text>
            <Table rowKey="pattern" size="small" pagination={false} style={{ marginTop: 8 }} dataSource={CASE_ANALYSIS_REPORT.patterns} columns={[
              { title: '模式', dataIndex: 'pattern', key: 'pattern' },
              { title: '频率', dataIndex: 'freq', key: 'freq', width: 70 },
              { title: '损失', dataIndex: 'loss', key: 'loss', width: 60 },
            ]} />
          </Col>
          <Col xs={24} lg={12}>
            <Text strong>规则优化建议</Text>
            {(CASE_ANALYSIS_REPORT.ruleSuggestions || []).map((s) => (
              <Card key={s} size="small" style={{ marginTop: 8 }}>
                <Tag color="processing">建议新增</Tag> {s}
                <Button type="link" size="small" onClick={() => navigate('/risk/identification?tab=indicator')}>去配置</Button>
              </Card>
            ))}
            <Paragraph type="secondary" style={{ marginTop: 12 }}>
              培训主题：{CASE_ANALYSIS_REPORT.training.join(' · ')}
            </Paragraph>
          </Col>
        </Row>
      </div>

      <Drawer title="案例详情 · 14字段结构化模板" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={640}>
        {currentCase && structured && (
          <>
            <Space style={{ marginBottom: 12 }}>
              <Tag color={levelColor[currentCase.level]}>{currentCase.level}</Tag>
              <Tag>{currentCase.type}</Tag>
              <Tag><BookOutlined /> {currentCase.id}</Tag>
            </Space>
            <Descriptions bordered column={1} size="small">
              {CASE_STRUCTURED_TEMPLATE.map((label) => {
                const keyMap = {
                  '案例标题': 'title', '发生时间': 'date', '涉及国家/地区': 'region', '所属行业': 'industry',
                  '风险类型': 'type', '涉事企业类型': 'enterpriseType', '风险源头': 'riskSource',
                  '事件发展时间线': 'timeline', '直接经济损失': 'directLoss', '间接损失': 'indirectLoss',
                  '有效应对措施': 'effectiveMeasures', '无效应对措施': 'ineffectiveMeasures',
                  '外部环境因素': 'externalFactors', '根本原因分析': 'rootCause', '经验教训总结': 'lessons',
                }
                return (
                  <Descriptions.Item key={label} label={label}>
                    {structured[keyMap[label]] || '-'}
                  </Descriptions.Item>
                )
              })}
            </Descriptions>
            <Paragraph style={{ marginTop: 12 }}><Text strong>详细经过：</Text>{currentCase.detail}</Paragraph>

            {similarCases.length > 0 && (
              <>
                <Title level={5} style={{ marginTop: 16 }}>智能相似案例推荐</Title>
                {similarCases.map((item) => (
                  <div key={item.id} className="case-card" style={{ marginBottom: 8, padding: 12 }} onClick={() => openCase(item)}>
                    <Text strong>{item.title}</Text>
                    <Paragraph type="secondary" ellipsis={{ rows: 1 }} style={{ margin: '4px 0 0' }}>{item.summary}</Paragraph>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
