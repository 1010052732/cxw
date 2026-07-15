import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Column } from '@ant-design/charts'
import { BulbOutlined, TrophyOutlined } from '@ant-design/icons'
import { getBenchmarkData } from '../../../../mock/analysis'
import { exportJsonAsTxt } from '../analysisExport'

const { Text, Paragraph } = Typography

import EnterpriseSwitcher from './EnterpriseSwitcher'

const BENCHMARK_MODE_OPTIONS = [
  { value: 'all', label: '全部推荐' },
  { value: '规模对标', label: '规模对标' },
  { value: '路径对标', label: '路径对标' },
  { value: '运营对标', label: '运营对标' },
  { value: '区域对标', label: '区域对标' },
]

const SHORTBOARD_OPTIONS = [
  { value: '综合', label: '综合' },
  { value: '技术', label: '技术' },
  { value: '成本', label: '成本' },
  { value: '渠道', label: '渠道' },
  { value: '服务', label: '服务' },
]

const SHORTBOARD_GAP_KEYWORDS = {
  技术: ['研发', '专利', '创新', '投入'],
  成本: ['毛利率', '成本', '费用', '议价'],
  渠道: ['海外', '覆盖', '渗透率', '市场', '国家'],
  服务: ['周转', '准时', '交付', '库存', '客户'],
}

const SHORTBOARD_DOMAIN_KEYWORDS = {
  技术: ['研发', '创新', '产品'],
  成本: ['合规成本', '成本', '采购'],
  渠道: ['市场拓展', '市场', '渠道', '跨境'],
  服务: ['供应链', '运营', '服务', '交付'],
}

function matchesShortboard(item, type, field = 'metric') {
  if (type === '综合') return true
  const text = String(item[field] || item || '')
  const keywords = SHORTBOARD_GAP_KEYWORDS[type] || []
  return keywords.some((k) => text.includes(k))
}

function practiceMatchesShortboard(practice, type) {
  if (type === '综合') return true
  const domain = practice.domain || ''
  const keywords = SHORTBOARD_DOMAIN_KEYWORDS[type] || []
  return keywords.some((k) => domain.includes(k))
}

export default function BenchmarkTab({ enterpriseName, onGoQuery }) {
  const { message } = App.useApp()
  const data = useMemo(() => getBenchmarkData(enterpriseName), [enterpriseName])
  const peerOptions = useMemo(
    () => (data.recommended || []).map((p) => ({ value: p.name, label: `${p.name} · ${p.type}` })),
    [data.recommended],
  )
  const [selectedPeer, setSelectedPeer] = useState(null)
  const [benchmarkMode, setBenchmarkMode] = useState('all')
  const [shortboardType, setShortboardType] = useState('综合')

  useEffect(() => {
    const names = (data.recommended || []).map((p) => p.name)
    if (!names.length) {
      setSelectedPeer(null)
      return
    }
    setSelectedPeer((prev) => (prev && names.includes(prev) ? prev : names[0]))
  }, [enterpriseName, data.recommended])

  const filteredRecommended = useMemo(() => {
    const list = data.recommended || []
    if (benchmarkMode === 'all') return list
    return list.filter((p) => p.type === benchmarkMode || p.type.includes(benchmarkMode.replace('对标', '')))
  }, [data.recommended, benchmarkMode])

  const filteredGaps = useMemo(() => {
    const gaps = data.gaps || []
    if (shortboardType === '综合') return gaps
    const withType = gaps.filter((g) => g.type != null)
    if (withType.length > 0) return withType.filter((g) => g.type === shortboardType)
    return gaps.filter((g) => matchesShortboard(g, shortboardType, 'metric'))
  }, [data.gaps, shortboardType])

  const filteredPractices = useMemo(
    () => (data.practices || []).filter((p) => practiceMatchesShortboard(p, shortboardType)),
    [data.practices, shortboardType],
  )

  const filteredActions = useMemo(() => {
    const actions = data.actions || []
    if (shortboardType === '综合') return actions
    const withType = actions.filter((a) => typeof a === 'object' && a.type != null)
    if (withType.length > 0) return withType.filter((a) => a.type === shortboardType).map((a) => a.text || a)
    return actions.filter((a) => matchesShortboard(a, shortboardType))
  }, [data.actions, shortboardType])

  const gapRows = useMemo(() => {
    const arr = filteredGaps
    const total = arr.reduce((s, x) => s + Math.abs(parseFloat(String(x.gap).replace(/[^\d.-]/g, '')) || 0), 0) || 1
    return arr.map((g) => {
      const abs = Math.abs(parseFloat(String(g.gap).replace(/[^\d.-]/g, '')) || 0)
      return { ...g, contribution: Math.round((abs / total) * 100) }
    })
  }, [filteredGaps])

  const gapChart = gapRows.map((g) => ({ metric: g.metric, gap: parseFloat(String(g.gap).replace(/[^\d.-]/g, '')) || 0 }))
  const activePeer = (data.recommended || []).find((p) => p.name === selectedPeer)

  return (
    <>
      <div className="business-filter-bar">
        <EnterpriseSwitcher enterpriseName={enterpriseName} onGoQuery={onGoQuery} />
        <Space wrap>
          <Text>对标模式</Text>
          <Select value={benchmarkMode} style={{ width: 120 }} options={BENCHMARK_MODE_OPTIONS} onChange={setBenchmarkMode} />
          {peerOptions.length > 0 && (
            <>
              <Text>标杆企业</Text>
              <Select value={selectedPeer} style={{ width: 220 }} options={peerOptions} onChange={setSelectedPeer} placeholder="选择标杆企业" />
            </>
          )}
          <Text>短板维度</Text>
          <Select value={shortboardType} style={{ width: 120 }} options={SHORTBOARD_OPTIONS} onChange={setShortboardType} />
        </Space>
      </div>

      <div className="business-panel">
        <h3 className="business-panel-title"><TrophyOutlined /> 智能标杆推荐</h3>
        <Row gutter={12}>
          {filteredRecommended.map((b) => (
            <Col xs={24} sm={8} key={b.name}>
              <Card
                size="small"
                hoverable
                className={`forecast-stat-card${selectedPeer === b.name ? ' forecast-scenario-active' : ''}`}
                onClick={() => setSelectedPeer(b.name)}
              >
                <Tag color="processing">{b.type}</Tag>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{b.name}</div>
                <Text type="secondary">{b.industry}</Text>
                <div style={{ marginTop: 8 }}>标杆指数 <Tag>{b.score}</Tag></div>
              </Card>
            </Col>
          ))}
        </Row>
        {activePeer && (
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            当前对标：<Text strong>{activePeer.name}</Text>（{activePeer.type} · {activePeer.industry} · 指数 {activePeer.score}）
          </Paragraph>
        )}
        <Paragraph type="secondary" style={{ marginTop: 12 }}>
          指标已按统一会计准则标准化，未公开数据采用行业比例估算并标注来源。
        </Paragraph>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">绩效差距分解</h3>
            <Table rowKey="metric" size="small" pagination={false} dataSource={gapRows} columns={[
              { title: '指标', dataIndex: 'metric', key: 'metric' },
              { title: '本企业', dataIndex: 'self', key: 'self', width: 90 },
              { title: '标杆', dataIndex: 'benchmark', key: 'benchmark', width: 90 },
              { title: '差距', dataIndex: 'gap', key: 'gap', width: 90, render: (v) => <Tag color={String(v).startsWith('-') ? 'error' : 'success'}>{v}</Tag> },
              { title: '贡献度', dataIndex: 'contribution', key: 'contribution', width: 80, render: (v) => `${v}%` },
              { title: '主因', dataIndex: 'factor', key: 'factor', ellipsis: true },
            ]} />
            {gapChart.length > 0 && (
              <div className="business-chart-box-sm" style={{ marginTop: 16 }}>
                <Column data={gapChart} xField="metric" yField="gap" height={200} color="#B32620" />
              </div>
            )}
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title"><BulbOutlined /> 最佳实践案例库</h3>
            {filteredPractices.map((p) => (
              <Card key={p.title} size="small" style={{ marginBottom: 8 }}>
                <Tag>{p.domain}</Tag>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{p.title}</div>
                <Text type="secondary">{p.link}</Text>
                <div>
                  <Button type="link" size="small" style={{ padding: 0 }} onClick={() => message.info(`已打开案例库条目：${p.title}`)}>
                    查看案例详情 →
                  </Button>
                </div>
              </Card>
            ))}
            <Paragraph strong style={{ marginTop: 16 }}>改进行动建议</Paragraph>
            {filteredActions.map((a) => (
              <div key={a} style={{ marginBottom: 8 }}>
                <Progress percent={100} strokeColor="#B32620" showInfo={false} style={{ marginBottom: 2 }} />
                <Text>{a}</Text>
              </div>
            ))}
            <Button
              block
              style={{ marginTop: 12 }}
              onClick={() => {
                exportJsonAsTxt(`benchmark-${enterpriseName}-${selectedPeer || 'peer'}.txt`, {
                  subject: enterpriseName,
                  peer: activePeer,
                  shortboardType,
                  gaps: gapRows,
                  practices: filteredPractices,
                  actions: filteredActions,
                })
                message.success('对标报告已导出')
              }}
            >
              导出对标报告
            </Button>
          </div>
        </Col>
      </Row>
    </>
  )
}
