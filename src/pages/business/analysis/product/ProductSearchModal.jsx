import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import {
  PRODUCT_MARKET_OPTIONS,
  PRODUCT_ORIGIN_OPTIONS,
  TRADE_MODE_OPTIONS,
  semanticSearchProducts,
} from '../../../../mock/analysis'

const { Text } = Typography

const TRADE_MODE_LABEL = Object.fromEntries(TRADE_MODE_OPTIONS.map((o) => [o.value, o.label]))

function FilterChips({ label, options, value, onChange }) {
  return (
    <div className="product-filter-chips">
      <Text type="secondary" className="product-filter-chips-label">{label}</Text>
      <Space wrap size={[6, 6]}>
        {options.map((opt) => (
          <Tag.CheckableTag
            key={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          >
            {opt.label}
          </Tag.CheckableTag>
        ))}
      </Space>
    </div>
  )
}

/**
 * 商品查询列表弹窗：加宽展示完整列，减少左右拖动。
 */
export default function ProductSearchModal({
  open,
  onClose,
  initialKeyword = '',
  initialFilters,
  activeName,
  onSelect,
}) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const [filters, setFilters] = useState({
    tradeMode: 'all',
    origin: 'all',
    targetMarket: 'all',
    spec: '',
    ...initialFilters,
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  useEffect(() => {
    if (!open) return
    setKeyword(initialKeyword || '')
    setFilters((prev) => ({
      ...prev,
      tradeMode: initialFilters?.tradeMode || 'all',
      origin: initialFilters?.origin || 'all',
      targetMarket: initialFilters?.targetMarket || 'all',
      spec: initialFilters?.spec || '',
    }))
    setSelectedRowKeys([])
  }, [open, initialKeyword, initialFilters?.tradeMode, initialFilters?.origin, initialFilters?.targetMarket, initialFilters?.spec])

  const results = useMemo(
    () => semanticSearchProducts(keyword, filters),
    [keyword, filters],
  )

  const handleConfirm = (row) => {
    if (!row) return
    onSelect?.(row, { ...filters })
    onClose?.()
  }

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (v, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          {row.parent !== v && <Text type="secondary" style={{ fontSize: 12 }}>归属：{row.parent}</Text>}
        </Space>
      ),
    },
    {
      title: 'HS 编码',
      key: 'hs',
      width: 130,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Tag>{r.hsCode}</Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.hsDetail}</Text>
        </Space>
      ),
    },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100 },
    { title: '规格', dataIndex: 'spec', key: 'spec', width: 160, ellipsis: true },
    { title: '原产地', dataIndex: 'origin', key: 'origin', width: 80 },
    {
      title: '目标市场',
      dataIndex: 'markets',
      key: 'markets',
      width: 200,
      render: (list) => (list || []).slice(0, 4).map((m) => <Tag key={m}>{m}</Tag>),
    },
    {
      title: '贸易方式',
      dataIndex: 'tradeMode',
      key: 'tradeMode',
      width: 110,
      render: (v) => TRADE_MODE_LABEL[v] || v || '-',
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 90,
      sorter: (a, b) => a.confidence - b.confidence,
      render: (v) => <Tag color={v >= 90 ? 'success' : v >= 80 ? 'processing' : 'default'}>{v}%</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, row) => (
        <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); handleConfirm(row) }}>
          选用
        </Button>
      ),
    },
  ]

  return (
    <Modal
      title="商品数据查询 · 检索结果列表"
      open={open}
      onCancel={onClose}
      width="min(1440px, calc(100vw - 48px))"
      centered
      destroyOnClose
      className="product-search-modal"
      styles={{ body: { paddingTop: 12 } }}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button
          key="ok"
          type="primary"
          disabled={!selectedRowKeys.length}
          onClick={() => {
            const row = results.find((r) => r.id === selectedRowKeys[0])
            handleConfirm(row)
          }}
        >
          确认选用
        </Button>,
      ]}
    >
      <div className="product-search-modal-toolbar">
        <Space.Compact style={{ width: '100%', maxWidth: 560 }}>
          <Input
            allowClear
            value={keyword}
            placeholder="商品名称 / HS编码 / 规格 / 自然语言，如：刹车片、5G路由器"
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => setKeyword((k) => k.trim())}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => setKeyword((k) => k.trim())}>
            查询
          </Button>
        </Space.Compact>
        <Input
          allowClear
          style={{ width: 240 }}
          placeholder="规格筛选，如：陶瓷、5G"
          value={filters.spec}
          onChange={(e) => setFilters((p) => ({ ...p, spec: e.target.value }))}
        />
      </div>

      <FilterChips
        label="贸易方式"
        options={TRADE_MODE_OPTIONS}
        value={filters.tradeMode}
        onChange={(v) => setFilters((p) => ({ ...p, tradeMode: v }))}
      />
      <FilterChips
        label="原产地"
        options={PRODUCT_ORIGIN_OPTIONS}
        value={filters.origin}
        onChange={(v) => setFilters((p) => ({ ...p, origin: v }))}
      />
      <FilterChips
        label="目标市场"
        options={PRODUCT_MARKET_OPTIONS}
        value={filters.targetMarket}
        onChange={(v) => setFilters((p) => ({ ...p, targetMarket: v }))}
      />

      <div className="product-search-modal-meta">
        <Text type="secondary">
          共 {results.length} 条 · 点击行或「选用」打开商品档案 · 响应 &lt; 3s（Mock）
        </Text>
        <Button
          type="link"
          size="small"
          onClick={() => setFilters({ tradeMode: 'all', origin: 'all', targetMarket: 'all', spec: '' })}
        >
          重置筛选
        </Button>
      </div>

      <Table
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={results}
        scroll={{ y: 400 }}
        pagination={{ pageSize: 8, showSizeChanger: false, showTotal: (t) => `共 ${t} 条` }}
        rowClassName={(row) => (row.parent === activeName || row.name === activeName ? 'product-result-row-active' : '')}
        onRow={(row) => ({
          onClick: () => setSelectedRowKeys([row.id]),
          onDoubleClick: () => handleConfirm(row),
        })}
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          columnWidth: 48,
        }}
        locale={{ emptyText: '未匹配到商品，请调整关键词或筛选条件' }}
      />
    </Modal>
  )
}
