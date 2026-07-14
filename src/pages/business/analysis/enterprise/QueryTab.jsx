import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Col,
  Descriptions,
  Input,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Line, Radar } from '@ant-design/charts'
import {
  CloudDownloadOutlined,
  DatabaseOutlined,
  ExportOutlined,
  NodeIndexOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  ENTERPRISE_SORT_OPTIONS,
  getEnterpriseDetail,
  resolveMarketCountryValue,
  searchEnterprises,
} from '../../../../mock/analysis'
import { exportCsv } from '../analysisExport'
import {
  GEO_MACRO_OPTIONS,
  formatGeoLocation,
  getGeoCityOptions,
  getGeoCountryOptions,
} from '../../../../mock/geo'

const { Text, Paragraph } = Typography

const healthColor = { 优秀: 'success', 良好: 'processing', 一般: 'default', 预警: 'warning', 高危: 'error' }
const nodeColor = { self: '#B32620', parent: '#1677ff', subsidiary: '#52c41a', partner: '#faad14' }

export default function EnterpriseQueryTab({ enterpriseName, onEnterpriseChange, onGoCompetitor, onGoPartner }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState(enterpriseName)
  const [sortBy, setSortBy] = useState('creditScore')
  const [geoMacro, setGeoMacro] = useState('all')
  const [geoCountry, setGeoCountry] = useState('all')
  const [geoCity, setGeoCity] = useState('all')

  const geoCountryOptions = useMemo(() => getGeoCountryOptions(geoMacro), [geoMacro])
  const geoCityOptions = useMemo(() => getGeoCityOptions(geoCountry), [geoCountry])

  const geoFilters = useMemo(
    () => ({ geoMacro, geoCountry, geoCity }),
    [geoMacro, geoCountry, geoCity],
  )

  const results = useMemo(
    () => searchEnterprises(query, sortBy, geoFilters),
    [query, sortBy, geoFilters],
  )
  const ent = useMemo(() => getEnterpriseDetail(enterpriseName), [enterpriseName])

  const equityNodes = ent.equityGraph?.nodes || []
  const equityEdges = ent.equityGraph?.edges || []
  const equityNodeMap = useMemo(
    () => Object.fromEntries(equityNodes.map((n) => [n.id, n])),
    [equityNodes],
  )

  const revenueLine = (ent.revenueTrend || []).map((r) => ({ year: r.year, value: r.revenue, type: '营收(亿元)' }))

  const handleSearch = () => {
    if (results[0]) {
      onEnterpriseChange(results[0].name)
      message.success(`已加载 ${results[0].name} · ${formatGeoLocation(results[0])}`)
    }
  }

  const handleResetGeo = () => {
    setGeoMacro('all')
    setGeoCountry('all')
    setGeoCity('all')
  }

  return (
    <>
      <div className="business-filter-bar">
        <Space.Compact style={{ width: 400, maxWidth: '100%' }}>
          <Input value={query} placeholder="企业全称/简称/行业/所在地" onChange={(e) => setQuery(e.target.value)} onPressEnter={handleSearch} />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
        </Space.Compact>
        <Select value={geoMacro} style={{ width: 130 }} options={GEO_MACRO_OPTIONS} onChange={(v) => { setGeoMacro(v); setGeoCountry('all'); setGeoCity('all') }} />
        <Select value={geoCountry} style={{ width: 120 }} options={geoCountryOptions} disabled={geoMacro === 'all'} onChange={(v) => { setGeoCountry(v); setGeoCity('all') }} />
        <Select value={geoCity} style={{ width: 120 }} options={geoCityOptions} disabled={geoCountry === 'all'} onChange={setGeoCity} />
        <Button onClick={handleResetGeo}>重置地区</Button>
        <Select value={sortBy} style={{ width: 120 }} options={ENTERPRISE_SORT_OPTIONS} onChange={setSortBy} />
        <Button
          icon={<CloudDownloadOutlined />}
          onClick={() => {
            exportCsv(`enterprise-${ent.name}.csv`, ['field', 'value'], [
              { field: '企业', value: ent.name },
              { field: '编号', value: ent.id },
              { field: '类型', value: ent.type },
              { field: '所在地', value: formatGeoLocation(ent) },
              { field: '健康度', value: `${ent.healthLevel}(${ent.healthScore})` },
              { field: '信用', value: `${ent.creditLevel}(${ent.creditScore})` },
              { field: '专利', value: ent.patents },
              { field: '诉讼', value: ent.litigation },
              { field: '处罚', value: ent.penalties },
            ])
            message.success('企业档案 CSV 已下载')
          }}
        >
          导出
        </Button>
      </div>

      {results.length > 1 && (
        <div className="business-panel">
          <h3 className="business-panel-title">检索结果 · 多维排序</h3>
          <Space wrap>
            {results.map((r) => (
              <Button key={r.name} type={enterpriseName === r.name ? 'primary' : 'default'} size="small" onClick={() => onEnterpriseChange(r.name)}>
                {r.name} · {formatGeoLocation(r)}
              </Button>
            ))}
          </Space>
        </div>
      )}

      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title"><DatabaseOutlined /> 企业动态档案</h3>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="企业">{ent.name}</Descriptions.Item>
              <Descriptions.Item label="编号">{ent.id}</Descriptions.Item>
              <Descriptions.Item label="所在地">{formatGeoLocation(ent)}</Descriptions.Item>
              <Descriptions.Item label="类型">{ent.type}</Descriptions.Item>
              <Descriptions.Item label="区域">{ent.region}</Descriptions.Item>
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
            </Descriptions>
          </div>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title"><NodeIndexOutlined /> 股权与关联网络</h3>
            <Paragraph type="secondary">节点颜色：红色=主体 · 蓝色=母公司 · 绿色=子公司 · 橙色=合作伙伴</Paragraph>
            <div className="enterprise-graph-canvas">
              {equityEdges.length > 0 && (
                <svg className="eg-edges" aria-hidden="true">
                  {equityEdges.map((e, i) => {
                    const from = equityNodeMap[e.from]
                    const to = equityNodeMap[e.to]
                    if (!from || !to) return null
                    return (
                      <line
                        key={`${e.from}-${e.to}-${i}`}
                        x1={`${from.x}%`}
                        y1={`${from.y}%`}
                        x2={`${to.x}%`}
                        y2={`${to.y}%`}
                        stroke="#bfbfbf"
                        strokeWidth={1.5}
                      />
                    )
                  })}
                </svg>
              )}
              {equityNodes.map((n) => (
                <div
                  key={n.id}
                  className="eg-node"
                  style={{ left: `${n.x}%`, top: `${n.y}%`, background: nodeColor[n.type] || '#8c8c8c' }}
                >
                  {n.label}
                </div>
              ))}
            </div>
            <Table
              size="small"
              pagination={false}
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
            <h3 className="business-panel-title"><TeamOutlined /> 贸易往来摘要</h3>
            <Table
              size="small"
              pagination={{ pageSize: 5 }}
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
              <Button onClick={onGoPartner}>伙伴评估 →</Button>
              <Button icon={<ExportOutlined />} onClick={() => navigate('/opportunity/classify?tab=list')}>关联商机</Button>
            </Space>
          </div>
        </Col>
      </Row>
    </>
  )
}
