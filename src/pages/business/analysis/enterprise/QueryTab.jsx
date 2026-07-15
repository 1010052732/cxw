import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Alert,
  Button,
  Col,
  Descriptions,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Line, Radar } from '@ant-design/charts'
import {
  CloudDownloadOutlined,
  DatabaseOutlined,
  ExportOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  ENTERPRISE_DIRECTORY,
  getEnterpriseDetail,
  resolveMarketCountryValue,
} from '../../../../mock/analysis'
import { exportCsv } from '../analysisExport'
import { formatGeoLocation } from '../../../../mock/geo'
import EnterpriseSearchPanel from './EnterpriseSearchPanel'

const { Text, Paragraph } = Typography

const healthColor = { 优秀: 'success', 良好: 'processing', 一般: 'default', 预警: 'warning', 高危: 'error' }
const nodeColor = { self: '#B32620', parent: '#1677ff', subsidiary: '#52c41a', partner: '#faad14' }

export default function EnterpriseQueryTab({ enterpriseName, onEnterpriseChange, onGoCompetitor, onGoPartner }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const archiveRef = useRef(null)

  const [searchState, setSearchState] = useState({
    keyword: enterpriseName || '',
    filters: {
      industryType: 'all',
      healthLevel: 'all',
      riskLevel: 'all',
      geoMacro: 'all',
      geoCountry: 'all',
      geoCity: 'all',
    },
    sortBy: 'healthScore',
  })

  const activeRow = useMemo(
    () => ENTERPRISE_DIRECTORY.find((d) => d.name === enterpriseName),
    [enterpriseName],
  )

  useEffect(() => {
    setSearchState((prev) => ({ ...prev, keyword: enterpriseName || '' }))
  }, [enterpriseName])

  const ent = useMemo(() => getEnterpriseDetail(enterpriseName), [enterpriseName])
  const equityNodes = ent.equityGraph?.nodes || []
  const equityEdges = ent.equityGraph?.edges || []
  const equityNodeMap = useMemo(
    () => Object.fromEntries(equityNodes.map((n) => [n.id, n])),
    [equityNodes],
  )
  const revenueLine = (ent.revenueTrend || []).map((r) => ({ year: r.year, value: r.revenue, type: '营收(亿元)' }))

  const handleSearch = ({ keyword, filters, sortBy }) => {
    setSearchState({ keyword, filters, sortBy })
  }

  const handleSelectEnterprise = (row) => {
    onEnterpriseChange(row.name)
    setSearchState((prev) => ({ ...prev, keyword: row.name }))
    message.success(`已加载「${row.name}」档案 · 健康度 ${row.healthLevel}(${row.healthScore}) · 信用 ${row.creditLevel}`)
    requestAnimationFrame(() => {
      archiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <>
      <div className="product-query-steps-bar">
        <Tag color="processing">1. 检索筛选</Tag>
        <Tag color="processing">2. 列表选用</Tag>
        <Tag color="processing">3. 动态档案</Tag>
        <Tag color="processing">4. 竞争 / 伙伴 / 标杆</Tag>
      </div>

      <EnterpriseSearchPanel
        appliedKeyword={searchState.keyword}
        appliedFilters={searchState.filters}
        sortBy={searchState.sortBy}
        activeEnterpriseId={activeRow?.id}
        activeEnterpriseName={enterpriseName}
        onSearch={handleSearch}
        onSelect={handleSelectEnterprise}
      />

      <div ref={archiveRef}>
        <Row gutter={16}>
          <Col xs={24} lg={8}>
            <div className="business-panel">
              <h3 className="business-panel-title"><DatabaseOutlined /> 企业动态档案</h3>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="企业">{ent.name}</Descriptions.Item>
                <Descriptions.Item label="编号">{ent.id}</Descriptions.Item>
                <Descriptions.Item label="所在地">{formatGeoLocation(ent)}</Descriptions.Item>
                <Descriptions.Item label="类型">{ent.type}</Descriptions.Item>
                <Descriptions.Item label="成立">{ent.founded}</Descriptions.Item>
                <Descriptions.Item label="经营范围">{ent.scope}</Descriptions.Item>
                <Descriptions.Item label="行业地位">{ent.industryRank || '-'}</Descriptions.Item>
                <Descriptions.Item label="市场份额">{ent.marketShare || '-'}</Descriptions.Item>
              </Descriptions>
              <Space wrap style={{ marginTop: 12 }}>
                <Tag>专利 {ent.patents || 0}</Tag>
                <Tag color={ent.litigation ? 'error' : 'success'}>诉讼 {ent.litigation || 0}</Tag>
                <Tag color={ent.penalties ? 'warning' : 'success'}>处罚 {ent.penalties || 0}</Tag>
              </Space>
              {(ent.dataSources || []).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>多源融合：</Text>
                  <Space wrap size={[4, 4]} style={{ marginTop: 4 }}>
                    {ent.dataSources.map((s) => <Tag key={s} style={{ margin: 0 }}>{s}</Tag>)}
                  </Space>
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <div className="business-panel">
              <h3 className="business-panel-title">经营健康度指数</h3>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <Progress type="dashboard" percent={ent.healthScore || 80} strokeColor="#B32620" format={() => ent.healthScore} />
                <Tag color={healthColor[ent.healthLevel]} style={{ marginTop: 8 }}>{ent.healthLevel} · {ent.healthScore}分</Tag>
              </div>
              {ent.healthDims && Object.entries(ent.healthDims).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 6 }}>
                  <Text type="secondary">{{ finance: '财务', risk: '风险', operation: '经营', credit: '信用' }[k]}</Text>
                  <Progress percent={v} size="small" strokeColor="#B32620" />
                </div>
              ))}
              <div className="business-chart-box-sm">
                <Radar data={ent.healthRadar} xField="item" yField="score" height={180} color="#B32620" meta={{ score: { min: 0, max: 100 } }} />
              </div>
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <div className="business-panel">
              <h3 className="business-panel-title">近3年营收趋势</h3>
              <div className="business-chart-box-sm">
                <Line data={revenueLine} xField="year" yField="value" height={200} color="#B32620" smooth />
              </div>
              <Descriptions bordered column={1} size="small" style={{ marginTop: 12 }}>
                <Descriptions.Item label="信用">{ent.creditLevel} · {ent.creditScore}分</Descriptions.Item>
                <Descriptions.Item label="最新营收">
                  {ent.revenueTrend?.[ent.revenueTrend.length - 1]?.revenue || '—'} 亿元
                  {ent.revenueTrend?.[ent.revenueTrend.length - 1]?.growth != null && (
                    <Tag color="success" style={{ marginLeft: 8 }}>+{ent.revenueTrend[ent.revenueTrend.length - 1].growth}%</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
              <Button
                size="small"
                icon={<CloudDownloadOutlined />}
                style={{ marginTop: 8 }}
                onClick={() => {
                  exportCsv(`enterprise-${ent.name}.csv`, ['field', 'value'], [
                    { field: '企业', value: ent.name },
                    { field: '健康度', value: `${ent.healthLevel}(${ent.healthScore})` },
                    { field: '信用', value: `${ent.creditLevel}(${ent.creditScore})` },
                    { field: '所在地', value: formatGeoLocation(ent) },
                  ])
                  message.success('企业档案 CSV 已下载')
                }}
              >
                导出档案
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title"><NodeIndexOutlined /> 族谱与集团关系图</h3>
            <Paragraph type="secondary">红色=主体 · 蓝色=母公司 · 绿色=子公司 · 橙色=合作伙伴</Paragraph>
            <div className="enterprise-graph-canvas">
              {equityEdges.length > 0 && (
                <svg className="eg-edges" aria-hidden="true">
                  {equityEdges.map((e, i) => {
                    const from = equityNodeMap[e.from]
                    const to = equityNodeMap[e.to]
                    if (!from || !to) return null
                    return (
                      <line key={`${e.from}-${e.to}-${i}`} x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`} stroke="#bfbfbf" strokeWidth={1.5} />
                    )
                  })}
                </svg>
              )}
              {equityNodes.map((n) => (
                <div key={n.id} className="eg-node" style={{ left: `${n.x}%`, top: `${n.y}%`, background: nodeColor[n.type] || '#8c8c8c' }}>
                  {n.label}
                </div>
              ))}
            </div>
            {(ent.equityHistory || []).length > 0 && (
              <>
                <Text strong style={{ fontSize: 13 }}>股权结构历史追溯</Text>
                <Timeline
                  style={{ marginTop: 8 }}
                  items={(ent.equityHistory || []).map((h) => ({ children: <span><Text strong>{h.year}</Text> · {h.event}</span> }))}
                />
              </>
            )}
            <Table
              size="small"
              pagination={false}
              style={{ marginTop: 12 }}
              rowKey="name"
              dataSource={ent.relatedEnterprises || []}
              columns={[
                { title: '关联企业', dataIndex: 'name', key: 'name' },
                { title: '关系', dataIndex: 'relation', key: 'relation' },
              ]}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title"><TeamOutlined /> 贸易关系网络</h3>
            <Paragraph type="secondary">{ent.tradeNetwork?.concentration || '核心贸易伙伴网络摘要'}</Paragraph>
            {(ent.tradeNetworkAlerts || []).map((a) => (
              <Alert key={a.title} type={a.level === 'warning' ? 'warning' : 'info'} showIcon message={a.title} description={`${a.desc} · ${a.date}`} style={{ marginBottom: 8 }} />
            ))}
            <Text strong>核心供应商 TOP</Text>
            <Table
              size="small"
              pagination={false}
              style={{ marginTop: 8 }}
              rowKey="name"
              dataSource={ent.tradeNetwork?.suppliers || []}
              columns={[
                { title: '供应商', dataIndex: 'name', key: 'name' },
                { title: '国家', dataIndex: 'country', key: 'country', width: 70 },
                { title: '年限', dataIndex: 'years', key: 'years', width: 50 },
                { title: '份额%', dataIndex: 'share', key: 'share', width: 60 },
              ]}
            />
            <Text strong style={{ display: 'block', marginTop: 12 }}>核心采购商 TOP</Text>
            <Table
              size="small"
              pagination={false}
              style={{ marginTop: 8 }}
              rowKey="name"
              dataSource={ent.tradeNetwork?.buyers || []}
              columns={[
                { title: '采购商', dataIndex: 'name', key: 'name' },
                { title: '国家', dataIndex: 'country', key: 'country', width: 70 },
                { title: '年限', dataIndex: 'years', key: 'years', width: 50 },
                { title: '份额%', dataIndex: 'share', key: 'share', width: 60 },
              ]}
            />
            <Table
              size="small"
              pagination={{ pageSize: 5 }}
              style={{ marginTop: 16 }}
              rowKey={(r) => `${r.date}-${r.product}`}
              dataSource={ent.tradeHistory || []}
              columns={[
                { title: '日期', dataIndex: 'date', key: 'date', width: 100 },
                { title: '类型', dataIndex: 'type', key: 'type', width: 60 },
                {
                  title: '产品',
                  dataIndex: 'product',
                  key: 'product',
                  render: (v) => (
                    <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate(`/analysis/product?q=${encodeURIComponent(v)}&tab=query`)}>
                      {v}
                    </Button>
                  ),
                },
                { title: '金额', dataIndex: 'amount', key: 'amount', width: 90 },
                {
                  title: '市场',
                  dataIndex: 'country',
                  key: 'country',
                  width: 90,
                  render: (v) => {
                    const code = resolveMarketCountryValue(v)
                    return code ? (
                      <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate(`/analysis/market?country=${code}&tab=overview`)}>
                        {v}
                      </Button>
                    ) : v
                  },
                },
              ]}
            />
            <Space wrap style={{ marginTop: 12 }}>
              <Button type="primary" onClick={onGoCompetitor}>竞争分析 →</Button>
              <Button icon={<SafetyCertificateOutlined />} onClick={onGoPartner}>伙伴评估 →</Button>
              <Button icon={<ExportOutlined />} onClick={() => navigate('/opportunity/classify?tab=list')}>关联商机</Button>
            </Space>
          </div>
        </Col>
      </Row>
    </>
  )
}
