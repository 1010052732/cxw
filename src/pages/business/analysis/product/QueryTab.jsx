import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { DualAxes } from '@ant-design/charts'
import {
  ApiOutlined,
  CloudDownloadOutlined,
  DatabaseOutlined,
  ExportOutlined,
  LineChartOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import {
  MARKET_COUNTRIES,
  TRADE_MODE_OPTIONS,
  calcLandedCost,
  getProductDetail,
  semanticSearchProducts,
} from '../../../../mock/analysis'

const { Text, Paragraph } = Typography

const CODE_LABELS = [
  { key: 'hs', label: 'HS编码' },
  { key: 'hs10', label: 'HS 10位' },
  { key: 'ciq', label: '中国CIQ' },
  { key: 'hts', label: '美国HTS' },
  { key: 'taric', label: '欧盟TARIC' },
  { key: 'jcn', label: '日本JCN' },
]

const RELATED_TYPES = [
  { key: 'complementary', label: '互补商品', color: 'processing' },
  { key: 'substitute', label: '替代商品', color: 'warning' },
  { key: 'upstream', label: '上游原材料', color: 'default' },
  { key: 'downstream', label: '下游衍生品', color: 'success' },
]

export default function QueryTab({ productName, onProductChange, onGoPrice, onGoSupply }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState(productName)
  const [filters, setFilters] = useState({ tradeMode: 'all', origin: 'all', targetMarket: 'all' })
  const [cargoValue, setCargoValue] = useState(100)
  const [searched, setSearched] = useState(true)

  const results = useMemo(() => (searched ? semanticSearchProducts(query, filters) : []), [query, filters, searched])
  const activeName = results[0]?.name || productName
  const product = useMemo(() => getProductDetail(activeName), [activeName])
  const costResult = useMemo(() => calcLandedCost(cargoValue, product.costParams), [cargoValue, product])

  const handleSearch = (value) => {
    const v = (value ?? query)?.trim()
    if (!v) {
      message.warning('请输入商品名称、HS编码或功能描述')
      return
    }
    setQuery(v)
    setSearched(true)
    const top = semanticSearchProducts(v, filters)[0]
    if (top) {
      onProductChange(top.name)
      message.success(`查询完成 · ${top.name} · 置信度 ${top.confidence}% · 响应 1.2s`)
    }
  }

  const codeRows = CODE_LABELS.map(({ key, label }) => ({
    system: label,
    code: product.codes?.[key] || product.hsCode || '-',
  }))

  return (
    <>
      <div className="business-filter-bar">
        <Space.Compact style={{ width: 420, maxWidth: '100%' }}>
          <Input
            value={query}
            placeholder="商品名称 / HS编码 / 自然语言描述，如：刹车片、5G路由器"
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={() => handleSearch()}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => handleSearch()}>查询</Button>
        </Space.Compact>
        <Space wrap>
          <Select value={filters.tradeMode} style={{ width: 130 }} options={TRADE_MODE_OPTIONS} onChange={(v) => setFilters((p) => ({ ...p, tradeMode: v }))} />
          <Select value={filters.origin} style={{ width: 120 }} options={[{ value: 'all', label: '全部原产地' }, { value: '中国', label: '中国' }, { value: '德国', label: '德国' }]} onChange={(v) => setFilters((p) => ({ ...p, origin: v }))} />
          <Select value={filters.targetMarket} style={{ width: 120 }} options={[{ value: 'all', label: '全部市场' }, ...MARKET_COUNTRIES.map((c) => ({ value: c.label, label: c.label }))]} onChange={(v) => setFilters((p) => ({ ...p, targetMarket: v }))} />
          <Button icon={<CloudDownloadOutlined />} onClick={() => message.success('商品档案已导出')}>导出</Button>
        </Space>
      </div>

      {searched && results.length > 1 && (
        <div className="business-panel">
          <h3 className="business-panel-title">语义检索结果 · 匹配置信度</h3>
          <Space wrap>
            {results.map((r) => (
              <Card
                key={r.name}
                size="small"
                hoverable
                className={activeName === r.name ? 'forecast-scenario-active' : ''}
                onClick={() => { onProductChange(r.name); setQuery(r.name) }}
              >
                <Text strong>{r.name}</Text>
                <div><Tag>HS {r.hsCode}</Tag><Tag color="blue">{r.confidence}%</Tag></div>
              </Card>
            ))}
          </Space>
        </div>
      )}

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}><DatabaseOutlined /> 360° 商品数字档案</h3>
              <Tag color="success">每日更新 · {product.archive?.updateDate}</Tag>
            </div>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="product-archive-visual">
                  <div className="product-archive-icon">{product.category?.slice(0, 2)}</div>
                  <Text type="secondary">3D模型预览（Mock）</Text>
                  <div style={{ marginTop: 8 }}><Tag>贸易活跃度 {product.archive?.tradeIndex}</Tag></div>
                </div>
              </Col>
              <Col xs={24} md={16}>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="HS编码">{product.codes?.hs || product.hsCode}</Descriptions.Item>
                  <Descriptions.Item label="10位编码">{product.codes?.hs10 || '-'}</Descriptions.Item>
                  <Descriptions.Item label="物理属性" span={2}>{product.archive?.physical}</Descriptions.Item>
                  <Descriptions.Item label="10年均价">{product.archive?.priceRange?.avg} 指数</Descriptions.Item>
                  <Descriptions.Item label="波动系数">{product.archive?.priceRange?.volatility}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={24} lg={12}>
                <Text strong>主要用途与应用</Text>
                <Table
                  size="small"
                  pagination={false}
                  rowKey="name"
                  style={{ marginTop: 8 }}
                  dataSource={product.archive?.applications || []}
                  columns={[
                    { title: '领域', dataIndex: 'name', key: 'name' },
                    { title: '占比%', dataIndex: 'share', key: 'share', width: 70 },
                  ]}
                />
              </Col>
              <Col xs={24} lg={12}>
                <Text strong>主要消费国/地区</Text>
                <Table
                  size="small"
                  pagination={false}
                  rowKey="country"
                  style={{ marginTop: 8 }}
                  dataSource={product.archive?.consumers || []}
                  columns={[
                    { title: '排名', dataIndex: 'rank', key: 'rank', width: 50 },
                    { title: '国家', dataIndex: 'country', key: 'country' },
                    { title: '需求特征', dataIndex: 'feature', key: 'feature' },
                  ]}
                />
              </Col>
            </Row>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title">多编码体系映射 · 一码查全球</h3>
            <Table rowKey="system" size="small" pagination={false} dataSource={codeRows} columns={[
              { title: '体系', dataIndex: 'system', key: 'system', width: 100 },
              { title: '编码', dataIndex: 'code', key: 'code' },
            ]} />
          </div>
          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">技术标准与认证</h3>
            {(product.archive?.certifications || []).map((c) => (
              <Tag key={c.name} color={c.type === '强制' ? 'error' : 'default'} style={{ marginBottom: 6 }}>{c.name} · {c.type}</Tag>
            ))}
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">TOP 生产商</h3>
            <Table rowKey="name" size="small" pagination={false} dataSource={product.archive?.producers || []} columns={[
              { title: '企业', dataIndex: 'name', key: 'name' },
              { title: '国家', dataIndex: 'country', key: 'country', width: 70 },
              { title: '产能', dataIndex: 'capacity', key: 'capacity' },
            ]} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">供需与贸易 · 季度进出口</h3>
            <Paragraph><Text strong>供给：</Text>{product.supplyDemand?.supply}</Paragraph>
            <Paragraph><Text strong>需求：</Text>{product.supplyDemand?.demand}</Paragraph>
            <div className="business-chart-box-sm">
              <DualAxes
                data={[product.supplyDemand?.quarterTrade || [], product.supplyDemand?.quarterTrade || []]}
                xField="quarter"
                yField={['import', 'export']}
                height={200}
                geometryOptions={[{ geometry: 'column', color: '#B32620' }, { geometry: 'line', color: '#1677ff' }]}
              />
            </div>
            <Space wrap style={{ marginTop: 8 }}>
              {(product.supplyDemand?.standards || []).map((s) => <Tag key={s}>{s}</Tag>)}
            </Space>
          </div>
        </Col>
      </Row>

      {(product.customsCases || []).length > 0 && (
        <div className="business-panel">
          <h3 className="business-panel-title">海关归类案例 / 预裁定</h3>
          <Table rowKey="case" size="small" pagination={false} dataSource={product.customsCases} columns={[
            { title: '案例', dataIndex: 'case', key: 'case', width: 180 },
            { title: '描述', dataIndex: 'desc', key: 'desc' },
            { title: '建议归类', dataIndex: 'result', key: 'result', width: 120 },
          ]} />
        </div>
      )}

      <div className="business-panel">
        <h3 className="business-panel-title">关联商品推荐 · 产业链拓展</h3>
        <Row gutter={12}>
          {RELATED_TYPES.map(({ key, label, color }) => (
            <Col xs={24} sm={12} lg={6} key={key}>
              <Card size="small" title={<Tag color={color}>{label}</Tag>}>
                {(product.related?.[key] || []).map((item) => (
                  <div key={item.name} style={{ marginBottom: 8, padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Text>{item.name}</Text>
                    <div><Tag>热度 {item.heat}</Tag><Tag color="success">利润 {item.margin}</Tag></div>
                  </div>
                ))}
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">各国关税与监管</h3>
            <Table rowKey="country" size="small" pagination={false} dataSource={product.tariffs} columns={[
              { title: '国家', dataIndex: 'country', key: 'country', width: 90 },
              { title: 'MFN', dataIndex: 'mfn', key: 'mfn', width: 80 },
              { title: '优惠', dataIndex: 'preferential', key: 'preferential' },
              { title: '增值税', dataIndex: 'vat', key: 'vat', width: 100 },
            ]} />
            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              贸易限制：{(product.supplyDemand?.restrictions || []).join('；')}
            </Paragraph>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">到岸成本计算器</h3>
            <Form layout="vertical">
              <Form.Item label="货值（万元）">
                <InputNumber min={1} value={cargoValue} onChange={(v) => setCargoValue(v || 0)} style={{ width: '100%' }} addonAfter="万元" />
              </Form.Item>
            </Form>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="到岸总成本"><Text strong style={{ color: '#B32620' }}>{costResult.total} 万元</Text></Descriptions.Item>
              <Descriptions.Item label="关税">{costResult.tariff} · 运费 {costResult.freight} · 增值税 {costResult.vat}</Descriptions.Item>
            </Descriptions>
          </div>
        </Col>
      </Row>

      <div className="business-filter-bar" style={{ justifyContent: 'space-between' }}>
        <Space wrap>
          <Button type="primary" icon={<LineChartOutlined />} onClick={onGoPrice}>价格走势 →</Button>
          {onGoSupply && <Button icon={<SwapOutlined />} onClick={onGoSupply}>供求关系研究 →</Button>}
          <Button icon={<ExportOutlined />} onClick={() => navigate('/analysis/market')}>关联市场分析</Button>
        </Space>
        <Button icon={<ApiOutlined />} onClick={() => message.success('已推送商品档案至 ERP（Mock）')}>API 推送</Button>
      </div>
    </>
  )
}
