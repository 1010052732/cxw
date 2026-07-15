import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Col,
  Input,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  BellOutlined,
  ReloadOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons'
import {
  PRODUCT_MARKET_OPTIONS,
  PRODUCT_ORIGIN_OPTIONS,
  TRADE_MODE_OPTIONS,
  semanticSearchProducts,
} from '../../../../mock/analysis'

const { Text, Paragraph } = Typography

const TRADE_MODE_LABEL = Object.fromEntries(TRADE_MODE_OPTIONS.map((o) => [o.value, o.label]))

const MATCH_COLOR = (v) => {
  if (v >= 90) return '#B32620'
  if (v >= 80) return '#d4380d'
  return '#fa8c16'
}

export default function ProductSearchPanel({
  appliedKeyword = '',
  appliedHs = '',
  appliedFilters = {},
  activeSkuId,
  activeSkuLabel,
  onSearch,
  onSelect,
}) {
  const { message } = App.useApp()
  const [nameKeyword, setNameKeyword] = useState(appliedKeyword)
  const [hsKeyword, setHsKeyword] = useState(appliedHs)
  const [filters, setFilters] = useState({
    tradeMode: 'all',
    origin: 'all',
    targetMarket: 'all',
    spec: '',
    ...appliedFilters,
  })
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('product-search-favorites') || '[]')
    } catch {
      return []
    }
  })
  const [alertCount] = useState(2)

  useEffect(() => {
    setNameKeyword(appliedKeyword)
    setHsKeyword(appliedHs)
    setFilters((prev) => ({ ...prev, ...appliedFilters }))
  }, [appliedKeyword, appliedHs, appliedFilters])

  const searchKeyword = useMemo(() => {
    const parts = [nameKeyword, hsKeyword].map((s) => String(s || '').trim()).filter(Boolean)
    return parts.join(' ')
  }, [nameKeyword, hsKeyword])

  const results = useMemo(
    () => semanticSearchProducts(searchKeyword, { ...filters, hs: hsKeyword }),
    [searchKeyword, filters, hsKeyword],
  )

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem('product-search-favorites', JSON.stringify(next))
      return next
    })
  }

  const handleSearch = () => {
    onSearch?.({
      keyword: nameKeyword.trim(),
      hs: hsKeyword.trim(),
      filters: { ...filters },
    })
    message.success(`检索完成，共 ${results.length} 条匹配商品`)
  }

  const handleReset = () => {
    const resetFilters = { tradeMode: 'all', origin: 'all', targetMarket: 'all', spec: '' }
    setNameKeyword('')
    setHsKeyword('')
    setFilters(resetFilters)
    onSearch?.({ keyword: '', hs: '', filters: resetFilters })
  }

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 56,
      render: (_, __, i) => i + 1,
    },
    {
      title: '匹配度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 110,
      sorter: (a, b) => a.confidence - b.confidence,
      defaultSortOrder: 'descend',
      render: (v) => (
        <div className="product-match-cell">
          <Text strong style={{ color: MATCH_COLOR(v), fontSize: 13 }}>{v}%</Text>
          <Progress
            percent={v}
            showInfo={false}
            size="small"
            strokeColor={MATCH_COLOR(v)}
            trailColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 140,
      render: (v, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          {row.parent !== v && <Text type="secondary" style={{ fontSize: 12 }}>档案：{row.parent}</Text>}
        </Space>
      ),
    },
    {
      title: 'HS编码',
      key: 'hs',
      width: 120,
      render: (_, r) => <Tag className="product-hs-tag">{r.hsDetail || r.hsCode}</Tag>,
    },
    {
      title: '商品规格',
      dataIndex: 'spec',
      key: 'spec',
      width: 180,
      ellipsis: true,
    },
    {
      title: '贸易方式',
      dataIndex: 'tradeMode',
      key: 'tradeMode',
      width: 100,
      render: (v) => TRADE_MODE_LABEL[v] || v || '-',
    },
    { title: '原产地', dataIndex: 'origin', key: 'origin', width: 72 },
    {
      title: '目标市场',
      dataIndex: 'markets',
      key: 'markets',
      width: 160,
      render: (list) => (
        <Space size={[4, 4]} wrap>
          {(list || []).slice(0, 3).map((m) => <Tag key={m} style={{ margin: 0 }}>{m}</Tag>)}
          {(list || []).length > 3 && <Text type="secondary" style={{ fontSize: 12 }}>+{list.length - 3}</Text>}
        </Space>
      ),
    },
    {
      title: '行业分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (v) => <Tag color="processing">{v}</Tag>,
    },
    {
      title: '商品描述',
      dataIndex: 'desc',
      key: 'desc',
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>
        </Tooltip>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updateDate',
      key: 'updateDate',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, row) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            style={{ padding: 0 }}
            onClick={() => onSelect?.(row, { ...filters })}
          >
            查看详情
          </Button>
          <Button
            type="text"
            size="small"
            icon={favorites.includes(row.id) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(row.id) }}
          />
        </Space>
      ),
    },
  ]

  return (
    <div className="business-panel product-search-panel">
      <div className="product-search-panel-header">
        <div>
          <h3 className="business-panel-title" style={{ margin: 0 }}>商品智能检索</h3>
          <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 13 }}>
            输入关键词或组合筛选，在下方列表选用商品并加载 360° 数字档案
          </Paragraph>
        </div>
        <Space>
          <Button
            icon={<StarOutlined />}
            onClick={() => message.info(`已收藏 ${favorites.length} 个商品（本地 Mock）`)}
          >
            我的收藏{favorites.length > 0 ? ` (${favorites.length})` : ''}
          </Button>
          <Button icon={<BellOutlined />} onClick={() => message.info('价格/壁垒预警订阅（Mock）')}>
            我的预警{alertCount > 0 ? ` (${alertCount})` : ''}
          </Button>
        </Space>
      </div>

      <div className="product-search-filter-grid">
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">商品名称</Text>
              <Input
                allowClear
                value={nameKeyword}
                placeholder="输入商品名称关键词，支持模糊检索"
                onChange={(e) => setNameKeyword(e.target.value)}
                onPressEnter={handleSearch}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">HS编码</Text>
              <Input
                allowClear
                value={hsKeyword}
                placeholder="输入 HS 编码，支持模糊检索"
                onChange={(e) => setHsKeyword(e.target.value)}
                onPressEnter={handleSearch}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">商品规格</Text>
              <Input
                allowClear
                value={filters.spec}
                placeholder="型号、尺寸、材质、纯度等"
                onChange={(e) => setFilters((p) => ({ ...p, spec: e.target.value }))}
                onPressEnter={handleSearch}
              />
            </div>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">贸易方式</Text>
              <Select
                style={{ width: '100%' }}
                value={filters.tradeMode}
                options={TRADE_MODE_OPTIONS}
                onChange={(v) => setFilters((p) => ({ ...p, tradeMode: v }))}
              />
            </div>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">原产地</Text>
              <Select
                style={{ width: '100%' }}
                value={filters.origin}
                options={PRODUCT_ORIGIN_OPTIONS}
                onChange={(v) => setFilters((p) => ({ ...p, origin: v }))}
              />
            </div>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">目标市场</Text>
              <Select
                style={{ width: '100%' }}
                value={filters.targetMarket}
                options={PRODUCT_MARKET_OPTIONS}
                onChange={(v) => setFilters((p) => ({ ...p, targetMarket: v }))}
              />
            </div>
          </Col>
        </Row>
      </div>

      <div className="product-search-actions">
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>检索</Button>
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          共 {results.length} 条
          {activeSkuLabel && <span> · 当前查看：<Text strong>{activeSkuLabel}</Text></span>}
        </Text>
      </div>

      <Table
        className="product-search-table"
        size="middle"
        rowKey="id"
        columns={columns}
        dataSource={results}
        scroll={{ x: 1280 }}
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20'], showTotal: (t) => `共 ${t} 条` }}
        rowClassName={(row) => (
          row.id === activeSkuId || row.name === activeSkuLabel ? 'product-result-row-active' : ''
        )}
        onRow={(row) => ({
          onDoubleClick: () => onSelect?.(row, { ...filters }),
        })}
        locale={{ emptyText: '未匹配到商品，请调整关键词或筛选条件后重新检索' }}
      />
    </div>
  )
}
