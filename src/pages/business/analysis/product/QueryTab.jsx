import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Form,
  InputNumber,
  Row,
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
  SwapOutlined,
} from '@ant-design/icons'
import {
  PRODUCT_DIRECTORY,
  TRADE_MODE_OPTIONS,
  calcLandedCost,
  getProductDetail,
  resolveMarketCountryValue,
  resolveProductByRelatedName,
} from '../../../../mock/analysis'
import { exportCsv } from '../analysisExport'
import ProductSearchPanel from './ProductSearchPanel'

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

const TRADE_MODE_LABEL = Object.fromEntries(TRADE_MODE_OPTIONS.map((o) => [o.value, o.label]))

export default function QueryTab({
  productName,
  skuLabel,
  filters: outerFilters,
  onProductChange,
  onFiltersChange,
  onGoPrice,
  onGoSupply,
}) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const archiveRef = useRef(null)

  const [searchState, setSearchState] = useState({
    keyword: skuLabel || productName || '',
    hs: '',
    filters: outerFilters || {
      tradeMode: 'all',
      origin: 'all',
      targetMarket: 'all',
      spec: '',
    },
  })
  const [cargoValue, setCargoValue] = useState(100)
  const [compareKeys, setCompareKeys] = useState([])

  const activeSku = useMemo(
    () => PRODUCT_DIRECTORY.find((d) => d.name === skuLabel) || PRODUCT_DIRECTORY.find((d) => d.parent === productName || d.name === productName),
    [skuLabel, productName],
  )

  useEffect(() => {
    setSearchState((prev) => ({
      ...prev,
      keyword: skuLabel || productName || '',
      filters: { ...prev.filters, ...(outerFilters || {}) },
    }))
  }, [skuLabel, productName, outerFilters])

  const updateFilters = (next) => {
    setSearchState((prev) => ({ ...prev, filters: next }))
    onFiltersChange?.(next)
  }

  const product = useMemo(() => getProductDetail(productName), [productName])
  const costResult = useMemo(() => calcLandedCost(cargoValue, product.costParams), [cargoValue, product])

  const compareRows = useMemo(
    () => compareKeys.map((name) => {
      const p = getProductDetail(name)
      return {
        key: name,
        name,
        hs: p.codes?.hs || p.hsCode || '-',
        tradeIndex: p.archive?.tradeIndex ?? '-',
        priceAvg: p.archive?.priceRange?.avg ?? '-',
        volatility: p.archive?.priceRange?.volatility ?? '-',
      }
    }),
    [compareKeys],
  )

  const toggleCompare = (name, checked) => {
    setCompareKeys((prev) => {
      if (checked) {
        if (prev.includes(name)) return prev
        if (prev.length >= 3) {
          message.warning('最多对比 3 个商品')
          return prev
        }
        return [...prev, name]
      }
      return prev.filter((k) => k !== name)
    })
  }

  const handleSearch = ({ keyword, hs, filters }) => {
    setSearchState({ keyword, hs, filters })
    updateFilters(filters)
  }

  const handleSelectProduct = (row, nextFilters) => {
    if (nextFilters) updateFilters(nextFilters)
    const catalogName = row.parent || row.name
    onProductChange({
      catalogName,
      skuLabel: row.name,
      hs: row.hsCode,
      filters: nextFilters || searchState.filters,
    })
    setSearchState((prev) => ({ ...prev, keyword: row.name }))
    message.success(`已加载「${row.name}」档案 · HS ${row.hsDetail || row.hsCode} · 匹配度 ${row.confidence}%`)
    requestAnimationFrame(() => {
      archiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const codeRows = CODE_LABELS.map(({ key, label }) => ({
    system: label,
    code: product.codes?.[key] || product.hsCode || '-',
  }))

  const activeFilters = [
    searchState.filters.tradeMode !== 'all' && TRADE_MODE_LABEL[searchState.filters.tradeMode],
    searchState.filters.origin !== 'all' && `原产地:${searchState.filters.origin}`,
    searchState.filters.targetMarket !== 'all' && `市场:${searchState.filters.targetMarket}`,
    searchState.filters.spec && `规格:${searchState.filters.spec}`,
  ].filter(Boolean)

  return (
    <>
      <div className="product-query-steps-bar">
        <Tag color="processing">1. 检索筛选</Tag>
        <Tag color="processing">2. 列表选用</Tag>
        <Tag color="processing">3. 档案下钻</Tag>
        <Tag color="processing">4. 价格 / 供需 / 壁垒</Tag>
      </div>

      <ProductSearchPanel
        appliedKeyword={searchState.keyword}
        appliedHs={searchState.hs}
        appliedFilters={searchState.filters}
        activeSkuId={activeSku?.id}
        activeSkuLabel={skuLabel}
        onSearch={handleSearch}
        onSelect={handleSelectProduct}
      />

      {activeFilters.length > 0 && (
        <div className="product-query-active-filters">
          <Text type="secondary">当前筛选：</Text>
          {activeFilters.map((f) => <Tag key={f}>{f}</Tag>)}
        </div>
      )}

      {compareKeys.length >= 2 && (
        <div className="business-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="business-panel-title" style={{ margin: 0 }}>多商品对比</h3>
            <Button size="small" onClick={() => setCompareKeys([])}>清空对比</Button>
          </div>
          <Table
            size="small"
            pagination={false}
            rowKey="key"
            dataSource={compareRows}
            columns={[
              { title: '商品名称', dataIndex: 'name', key: 'name' },
              { title: 'HS编码', dataIndex: 'hs', key: 'hs', width: 100 },
              { title: '贸易活跃度', dataIndex: 'tradeIndex', key: 'tradeIndex', width: 100 },
              { title: '10年均价', dataIndex: 'priceAvg', key: 'priceAvg', width: 100 },
              { title: '波动系数', dataIndex: 'volatility', key: 'volatility', width: 90 },
            ]}
          />
        </div>
      )}

      <div ref={archiveRef}>
        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <div className="business-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
                <h3 className="business-panel-title" style={{ margin: 0 }}>
                  <DatabaseOutlined /> 360° 商品数字档案
                  {skuLabel && skuLabel !== productName && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>{skuLabel}</Tag>
                  )}
                </h3>
                <Space>
                  <Checkbox
                    checked={compareKeys.includes(productName)}
                    disabled={!compareKeys.includes(productName) && compareKeys.length >= 3}
                    onChange={(e) => toggleCompare(productName, e.target.checked)}
                  >
                    加入对比
                  </Checkbox>
                  <Button
                    size="small"
                    icon={<CloudDownloadOutlined />}
                    onClick={() => {
                      exportCsv(`product-archive-${product.name}.csv`, ['field', 'value'], [
                        { field: '名称', value: skuLabel || product.name },
                        { field: '档案商品', value: product.name },
                        { field: 'HS', value: product.codes?.hs || product.hsCode },
                        { field: '物理属性', value: product.archive?.physical },
                        { field: '贸易活跃度', value: product.archive?.tradeIndex },
                      ])
                      message.success('商品档案 CSV 已下载')
                    }}
                  >
                    导出档案
                  </Button>
                  <Tag color="success">每日更新 · {product.archive?.updateDate}</Tag>
                </Space>
              </div>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <div className="product-archive-visual">
                    <div className="product-archive-icon">{product.category?.slice(0, 2)}</div>
                    <Text type="secondary">3D模型预览（可旋转示意）</Text>
                    <div className="product-3d-mock" aria-hidden>
                      <div className="product-3d-cube" />
                    </div>
                    <div style={{ marginTop: 8 }}><Tag>贸易活跃度 {product.archive?.tradeIndex}</Tag></div>
                  </div>
                </Col>
                <Col xs={24} md={16}>
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="商品">{skuLabel || product.name}</Descriptions.Item>
                    <Descriptions.Item label="档案归类">{product.name}</Descriptions.Item>
                    <Descriptions.Item label="HS编码">{product.codes?.hs || product.hsCode}</Descriptions.Item>
                    <Descriptions.Item label="10位编码">{product.codes?.hs10 || '-'}</Descriptions.Item>
                    <Descriptions.Item label="物理属性" span={2}>{product.archive?.physical}</Descriptions.Item>
                    <Descriptions.Item label="10年均价">{product.archive?.priceRange?.avg} 指数</Descriptions.Item>
                    <Descriptions.Item label="波动系数">{product.archive?.priceRange?.volatility}</Descriptions.Item>
                  </Descriptions>
                  {(product.archive?.priceHistory10y || []).length > 0 && (
                    <Table
                      size="small"
                      pagination={false}
                      style={{ marginTop: 8 }}
                      rowKey="year"
                      dataSource={product.archive.priceHistory10y}
                      columns={[
                        { title: '年份', dataIndex: 'year', key: 'year', width: 70 },
                        { title: '均价指数', dataIndex: 'price', key: 'price', width: 90 },
                        { title: '贸易指数', key: 'trade', render: (_, r) => product.archive.tradeIndex10y?.find((t) => t.year === r.year)?.index ?? '—' },
                      ]}
                    />
                  )}
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
                      {
                        title: '国家',
                        dataIndex: 'country',
                        key: 'country',
                        render: (v) => {
                          const code = resolveMarketCountryValue(v)
                          return code ? (
                            <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate(`/analysis/market?country=${code}&tab=overview`)}>
                              {v}
                            </Button>
                          ) : v
                        },
                      },
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
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">TOP 生产商（全球产能排名）</h3>
            <Table rowKey="name" size="small" pagination={{ pageSize: 5, showTotal: (t) => `共 ${t} 家` }} dataSource={product.archive?.producers || []} columns={[
              { title: '排名', key: 'rank', width: 50, render: (_, __, i) => i + 1 },
              {
                title: '企业',
                dataIndex: 'name',
                key: 'name',
                render: (v) => (
                  <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate(`/analysis/enterprise?q=${encodeURIComponent(v)}&tab=query`)}>
                    {v}
                  </Button>
                ),
              },
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
                {(product.related?.[key] || []).map((item) => {
                  const mapped = resolveProductByRelatedName(item.name)
                  return (
                    <div
                      key={item.name}
                      style={{ marginBottom: 8, padding: '6px 0', borderBottom: '1px solid #f0f0f0', cursor: mapped ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (!mapped) {
                          message.info(`${item.name} 暂未建立独立商品档案，请在上方列表继续检索`)
                          setSearchState((prev) => ({ ...prev, keyword: item.name.replace(/\s*HS\d+$/i, '').trim() }))
                          return
                        }
                        onProductChange({ catalogName: mapped, skuLabel: item.name, hs: undefined })
                        setSearchState((prev) => ({ ...prev, keyword: item.name }))
                        message.success(`已切换至关联商品：${mapped}`)
                      }}
                    >
                      <Text>{item.name}</Text>
                      <div><Tag>热度 {item.heat}</Tag><Tag color="success">利润 {item.margin}</Tag>{mapped && <Tag color="processing">可下钻</Tag>}</div>
                    </div>
                  )
                })}
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
          <Button
            icon={<ExportOutlined />}
            onClick={() => {
              const market = searchState.filters.targetMarket !== 'all'
                ? resolveMarketCountryValue(searchState.filters.targetMarket)
                : 'germany'
              navigate(`/analysis/market?country=${market || 'germany'}&tab=overview`)
            }}
          >
            关联市场分析
          </Button>
        </Space>
        <Button icon={<ApiOutlined />} onClick={() => message.success('已推送商品档案至 ERP（Mock）')}>API 推送</Button>
      </div>
    </>
  )
}
