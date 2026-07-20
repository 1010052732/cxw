import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { BookOutlined, BulbOutlined, SearchOutlined } from '@ant-design/icons'
import {
  CASE_ANALYSIS_REPORT,
  CASE_STRUCTURED_TEMPLATE,
  RISK_CASES,
  findSimilarCases,
  getCaseStructured,
} from '../../../../mock/risk'

const { Text, Paragraph, Title } = Typography
const levelColor = { 高: 'error', 中: 'warning', 低: 'success' }
const CASE_TYPES = ['全部', '信用风险', '政策风险', '物流风险', '合规风险', '汇率风险']
const REGIONS = ['全部', '东南亚', '非洲', '欧洲', '中东', '北美', '东盟', '全球']

/** 嵌入识别模块的案例库面板（与独立案例页共用能力） */
export default function CaseLibraryEmbed() {
  const { message } = App.useApp()
  const navigate = useNavigate()
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
    return findSimilarCases({ type: currentCase.type, region: currentCase.region })
      .filter((c) => c.id !== currentCase.id)
      .slice(0, 3)
  }, [currentCase])

  const openCase = (item) => {
    setCurrentCase(item)
    setDrawerOpen(true)
  }

  return (
    <>
      <div className="business-filter-bar">
        <Space.Compact style={{ width: 280 }}>
          <Input
            placeholder="关键词：反倾销、信用证诈骗..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Space.Compact>
        <Select value={typeFilter} style={{ width: 120 }} options={CASE_TYPES.map((v) => ({ value: v, label: v }))} onChange={setTypeFilter} />
        <Select value={regionFilter} style={{ width: 110 }} options={REGIONS.map((v) => ({ value: v, label: v }))} onChange={setRegionFilter} />
        <Button type="link" onClick={() => navigate('/risk/case')}>全屏案例库 →</Button>
        <Button type="link" onClick={() => navigate('/risk/identification?tab=indicator')}>反哺规则优化</Button>
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
            <div style={{ color: '#8c8c8c', fontSize: 12 }}>{item.region} · {item.date}</div>
          </div>
        ))}
      </div>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <h3 className="business-panel-title"><BulbOutlined /> {CASE_ANALYSIS_REPORT.month} · 案例分析 → 规则优化</h3>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Table
              rowKey="pattern"
              size="small"
              pagination={false}
              dataSource={CASE_ANALYSIS_REPORT.patterns}
              columns={[
                { title: '高频模式', dataIndex: 'pattern', key: 'pattern' },
                { title: '频率', dataIndex: 'freq', key: 'freq', width: 70 },
                { title: '损失', dataIndex: 'loss', key: 'loss', width: 60 },
              ]}
            />
          </Col>
          <Col xs={24} lg={12}>
            {(CASE_ANALYSIS_REPORT.ruleSuggestions || []).map((s) => (
              <Card key={s} size="small" style={{ marginBottom: 8 }}>
                <Tag color="processing">建议</Tag> {s}
                <Button type="link" size="small" onClick={() => navigate('/risk/identification?tab=indicator')}>去配置</Button>
              </Card>
            ))}
            <Button block type="primary" style={{ marginTop: 8 }} onClick={() => {
              message.success('已进入风险评估，可对相似预警量化打分')
              navigate('/risk/assessment')
            }}>
              基于案例进入评估 →
            </Button>
          </Col>
        </Row>
      </div>

      <Drawer title="案例详情 · 结构化模板" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={640}>
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
                  案例标题: 'title', 发生时间: 'date', '涉及国家/地区': 'region', 所属行业: 'industry',
                  风险类型: 'type', 涉事企业类型: 'enterpriseType', 风险源头: 'riskSource',
                  事件发展时间线: 'timeline', 直接经济损失: 'directLoss', 间接损失: 'indirectLoss',
                  有效应对措施: 'effectiveMeasures', 无效应对措施: 'ineffectiveMeasures',
                  外部环境因素: 'externalFactors', 根本原因分析: 'rootCause', 经验教训总结: 'lessons',
                }
                return (
                  <Descriptions.Item key={label} label={label}>
                    {structured[keyMap[label]] || '-'}
                  </Descriptions.Item>
                )
              })}
            </Descriptions>
            {similarCases.length > 0 && (
              <>
                <Title level={5} style={{ marginTop: 16 }}>相似案例</Title>
                {similarCases.map((item) => (
                  <Card key={item.id} size="small" style={{ marginBottom: 8 }} hoverable onClick={() => openCase(item)}>
                    {item.title}
                  </Card>
                ))}
              </>
            )}
            <Button
              type="primary"
              block
              style={{ marginTop: 16 }}
              onClick={() => {
                message.success('已参考案例应对经验，进入风险评估')
                navigate('/risk/assessment?tab=model')
              }}
            >
              参考本案启动评估
            </Button>
          </>
        )}
      </Drawer>
    </>
  )
}
