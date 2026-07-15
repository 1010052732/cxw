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
  ENTERPRISE_HEALTH_FILTER_OPTIONS,
  ENTERPRISE_RISK_FILTER_OPTIONS,
  ENTERPRISE_SORT_OPTIONS,
  ENTERPRISE_TYPE_OPTIONS,
  semanticSearchEnterprises,
} from '../../../../mock/analysis'
import {
  GEO_MACRO_OPTIONS,
  getGeoCityOptions,
  getGeoCountryOptions,
} from '../../../../mock/geo'
import { loadEnterpriseFavorites, toggleEnterpriseFavorite } from './enterpriseStore'

const { Text, Paragraph } = Typography

const HEALTH_COLOR = { 优秀: 'success', 良好: 'processing', 一般: 'default', 预警: 'warning', 高危: 'error' }
const RISK_COLOR = { 低: 'success', 中: 'warning', 高: 'error' }
const MATCH_COLOR = (v) => (v >= 90 ? '#B32620' : v >= 80 ? '#d4380d' : '#fa8c16')

export default function EnterpriseSearchPanel({
  appliedKeyword = '',
  appliedFilters = {},
  sortBy = 'healthScore',
  activeEnterpriseId,
  activeEnterpriseName,
  onSearch,
  onSelect,
}) {
  const { message } = App.useApp()
  const [keyword, setKeyword] = useState(appliedKeyword)
  const [filters, setFilters] = useState({
    industryType: 'all',
    healthLevel: 'all',
    riskLevel: 'all',
    geoMacro: 'all',
    geoCountry: 'all',
    geoCity: 'all',
    ...appliedFilters,
  })
  const [localSort, setLocalSort] = useState(sortBy)
  const [favorites, setFavorites] = useState(loadEnterpriseFavorites)

  const geoCountryOptions = useMemo(() => getGeoCountryOptions(filters.geoMacro), [filters.geoMacro])
  const geoCityOptions = useMemo(() => getGeoCityOptions(filters.geoCountry), [filters.geoCountry])

  useEffect(() => {
    setKeyword(appliedKeyword)
    setFilters((prev) => ({ ...prev, ...appliedFilters }))
    setLocalSort(sortBy)
  }, [appliedKeyword, appliedFilters, sortBy])

  const results = useMemo(
    () => semanticSearchEnterprises(keyword, filters, localSort),
    [keyword, filters, localSort],
  )

  const handleFavorite = (id) => {
    setFavorites(toggleEnterpriseFavorite(id))
  }

  const handleSearch = () => {
    onSearch?.({ keyword: keyword.trim(), filters: { ...filters }, sortBy: localSort })
    message.success(`检索完成，共 ${results.length} 家企业`)
  }

  const handleReset = () => {
    const reset = {
      industryType: 'all',
      healthLevel: 'all',
      riskLevel: 'all',
      geoMacro: 'all',
      geoCountry: 'all',
      geoCity: 'all',
    }
    setKeyword('')
    setFilters(reset)
    setLocalSort('healthScore')
    onSearch?.({ keyword: '', filters: reset, sortBy: 'healthScore' })
  }

  const columns = [
    { title: '序号', key: 'idx', width: 56, render: (_, __, i) => i + 1 },
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
          <Progress percent={v} showInfo={false} size="small" strokeColor={MATCH_COLOR(v)} trailColor="#f0f0f0" />
        </div>
      ),
    },
    {
      title: '企业名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (v) => <Text strong>{v}</Text>,
    },
    { title: '行业类型', dataIndex: 'type', key: 'type', width: 110 },
    {
      title: '所在地',
      dataIndex: 'geoLabel',
      key: 'geoLabel',
      width: 130,
      ellipsis: true,
    },
    {
      title: '健康度',
      key: 'health',
      width: 100,
      render: (_, r) => <Tag color={HEALTH_COLOR[r.healthLevel] || 'default'}>{r.healthLevel} {r.healthScore}</Tag>,
    },
    {
      title: '信用',
      key: 'credit',
      width: 90,
      render: (_, r) => <Tag>{r.creditLevel}</Tag>,
    },
    {
      title: '营收(亿)',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 80,
      render: (v) => (v ? v.toFixed(1) : '—'),
    },
    {
      title: '合作风险',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 80,
      render: (v) => <Tag color={RISK_COLOR[v] || 'default'}>{v}</Tag>,
    },
    {
      title: '行业地位',
      dataIndex: 'industryRank',
      key: 'industryRank',
      width: 120,
      ellipsis: true,
      render: (v) => <Text type="secondary" style={{ fontSize: 12 }}>{v || '—'}</Text>,
    },
    {
      title: '经营范围',
      dataIndex: 'scope',
      key: 'scope',
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>
        </Tooltip>
      ),
    },
    { title: '更新', dataIndex: 'updateDate', key: 'updateDate', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, row) => (
        <Space size={4}>
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => onSelect?.(row)}>
            查看档案
          </Button>
          <Button
            type="text"
            size="small"
            icon={favorites.includes(row.id) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={(e) => { e.stopPropagation(); handleFavorite(row.id) }}
          />
        </Space>
      ),
    },
  ]

  return (
    <div className="business-panel enterprise-search-panel">
      <div className="product-search-panel-header">
        <div>
          <h3 className="business-panel-title" style={{ margin: 0 }}>企业智能检索</h3>
          <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 13 }}>
            支持企业名称、行业、区域组合筛选，选用后加载动态档案与关联网络
          </Paragraph>
        </div>
        <Space>
          <Button icon={<StarOutlined />} onClick={() => message.info(`已收藏 ${favorites.length} 家企业`)}>
            我的收藏{favorites.length > 0 ? ` (${favorites.length})` : ''}
          </Button>
          <Button icon={<BellOutlined />} onClick={() => message.info('贸易伙伴变更预警（Mock）')}>
            我的预警
          </Button>
        </Space>
      </div>

      <div className="product-search-filter-grid">
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">企业名称</Text>
              <Input
                allowClear
                value={keyword}
                placeholder="全称/简称/行业/所在地"
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">行业分类</Text>
              <Select style={{ width: '100%' }} value={filters.industryType} options={ENTERPRISE_TYPE_OPTIONS} onChange={(v) => setFilters((p) => ({ ...p, industryType: v }))} />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">排序方式</Text>
              <Select style={{ width: '100%' }} value={localSort} options={ENTERPRISE_SORT_OPTIONS} onChange={setLocalSort} />
            </div>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">洲别</Text>
              <Select style={{ width: '100%' }} value={filters.geoMacro} options={GEO_MACRO_OPTIONS} onChange={(v) => setFilters((p) => ({ ...p, geoMacro: v, geoCountry: 'all', geoCity: 'all' }))} />
            </div>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">国家/地区</Text>
              <Select style={{ width: '100%' }} value={filters.geoCountry} options={geoCountryOptions} disabled={filters.geoMacro === 'all'} onChange={(v) => setFilters((p) => ({ ...p, geoCountry: v, geoCity: 'all' }))} />
            </div>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">城市</Text>
              <Select style={{ width: '100%' }} value={filters.geoCity} options={geoCityOptions} disabled={filters.geoCountry === 'all'} onChange={(v) => setFilters((p) => ({ ...p, geoCity: v }))} />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">健康度</Text>
              <Select style={{ width: '100%' }} value={filters.healthLevel} options={ENTERPRISE_HEALTH_FILTER_OPTIONS} onChange={(v) => setFilters((p) => ({ ...p, healthLevel: v }))} />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="product-search-field">
              <Text type="secondary" className="product-search-label">合作风险</Text>
              <Select style={{ width: '100%' }} value={filters.riskLevel} options={ENTERPRISE_RISK_FILTER_OPTIONS} onChange={(v) => setFilters((p) => ({ ...p, riskLevel: v }))} />
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
          共 {results.length} 家
          {activeEnterpriseName && <span> · 当前查看：<Text strong>{activeEnterpriseName}</Text></span>}
        </Text>
      </div>

      <Table
        className="product-search-table"
        size="middle"
        rowKey="id"
        columns={columns}
        dataSource={results}
        scroll={{ x: 1400 }}
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20'], showTotal: (t) => `共 ${t} 条` }}
        rowClassName={(row) => (row.id === activeEnterpriseId || row.name === activeEnterpriseName ? 'product-result-row-active' : '')}
        onRow={(row) => ({ onDoubleClick: () => onSelect?.(row) })}
        locale={{ emptyText: '未匹配到企业，请调整关键词或筛选条件' }}
      />
    </div>
  )
}
