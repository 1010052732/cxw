import { useMemo, useState, useCallback } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Dropdown,
  Input,
  Pagination,
  Popover,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  AppstoreOutlined,
  ColumnHeightOutlined,
  ExportOutlined,
  EyeOutlined,
  FolderAddOutlined,
  GlobalOutlined,
  HeartFilled,
  HeartOutlined,
  MoreOutlined,
  PartitionOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  StarOutlined,
  TagOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { GEO_COUNTRY_MAP_POS, OPPORTUNITY_MAP_LAYERS } from '../../../../mock/geo'
import {
  COUNTRY_OPTIONS,
  GEO_MACRO_OPTIONS,
  RISK_OPTIONS,
  STATUS_OPTIONS,
} from '../../../../mock/opportunity'
import MapHeatmapOverlay from '../../../../components/MapHeatmapOverlay'
import { MAP_LAYER_META } from '../../../../utils/mapHeatmap'
import { OPPORTUNITY_STORAGE_KEY, OPPORTUNITY_DETAIL_NAV_KEY } from '../utils'
import { isFavoritedBy } from '../opportunityStore'
import {
  applyHighlight,
  formatGeoLocation,
  getDynamicAlertColor,
  getRiskColor,
} from '../utils'
import {
  DEFAULT_VISIBLE_COLUMNS,
  LIST_COLUMN_DEFS,
  MAP_DOT_METRICS,
  SORT_FIELD_OPTIONS,
  getMapDotStyle,
  loadVisibleColumns,
  saveVisibleColumns,
} from './listColumnConfig'

const { RangePicker } = DatePicker
const { Text } = Typography

function EllipsisText({ text, width }) {
  return (
    <Tooltip title={text}>
      <span className="opportunity-ellipsis" style={{ maxWidth: width }}>{text}</span>
    </Tooltip>
  )
}

export default function OpportunityListTab({
  pipelineApplied,
  activeTemplate,
  filterGroup,
  filterConditionCount,
  sortedData,
  pageData,
  classificationGroups,
  selectedRowKeys,
  setSelectedRowKeys,
  viewMode,
  setViewMode,
  filters,
  setFilters,
  quickKeyword,
  setQuickKeyword,
  groupFilter,
  setGroupFilter,
  groupOptions,
  geoCountryOptions,
  geoCityOptions,
  sortInfo,
  setSortInfo,
  page,
  setPage,
  pageSize,
  setPageSize,
  mapHeatCells,
  mapLayers,
  setMapLayers,
  mapShowDots,
  setMapShowDots,
  currentUser,
  onSwitchTab,
  onRefreshDynamic,
  onEvaluate,
  onOpenActionModal,
  onToggleFavorite,
  onQuickTrack,
  onSearch,
  onReset,
  navigate,
}) {
  const [visibleColumns, setVisibleColumns] = useState(() => loadVisibleColumns())
  const [mapDotMetric, setMapDotMetric] = useState('score')

  const hasSelection = selectedRowKeys.length > 0
  const dynamicCount = sortedData.filter((i) => i.dynamicAlert).length
  const highScoreCount = sortedData.filter((i) => i.score >= 85).length
  const favoritedCount = sortedData.filter((i) => isFavoritedBy(i, currentUser.id)).length

  const goToDetail = useCallback((oppId) => {
    sessionStorage.setItem(OPPORTUNITY_DETAIL_NAV_KEY, JSON.stringify(sortedData.map((item) => item.id)))
    navigate(`/opportunity/detail/${oppId}`)
  }, [navigate, sortedData])

  const allColumnMap = useMemo(() => {
    const buildRowActionMenu = (record) => ({
      onClick: ({ key }) => {
        if (key === 'mark') onOpenActionModal('mark', [record.id])
        if (key === 'group') onOpenActionModal('group', [record.id])
        if (key === 'assign') onOpenActionModal('assign', [record.id])
        if (key === 'favorite') onOpenActionModal('favorite', [record.id])
        if (key === 'export') onOpenActionModal('export', [record.id])
        if (key === 'mine') onSwitchTab('mine')
      },
      items: [
        { key: 'mark', icon: <TagOutlined />, label: '标记商机' },
        { key: 'group', icon: <FolderAddOutlined />, label: '商机分组' },
        { key: 'assign', icon: <UserAddOutlined />, label: '分配跟进人' },
        { key: 'favorite', icon: <StarOutlined />, label: '收藏' },
        { key: 'export', icon: <ExportOutlined />, label: '导出' },
        { type: 'divider' },
        { key: 'mine', label: '我的商机' },
      ],
    })

    return {
      name: {
        title: '商机名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        fixed: 'left',
        sorter: true,
        render: (text, record) => (
          <Space direction="vertical" size={0}>
            <Space>
              <EllipsisText text={text} width={160} />
              {record.dynamicAlert && (
                <Tooltip title={`${record.dynamicAlert.message} · ${record.dynamicAlert.time}`}>
                  <Badge dot color={getDynamicAlertColor(record.dynamicAlert.type)}>
                    <Tag color={getDynamicAlertColor(record.dynamicAlert.type)} className="opportunity-dynamic-tag">动态更新</Tag>
                  </Badge>
                </Tooltip>
              )}
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.id}</Text>
          </Space>
        ),
      },
      source: { title: '商机来源', key: 'source', width: 160, sorter: true, render: (_, r) => <Tag>{formatGeoLocation(r)}</Tag> },
      country: { title: '目标市场', dataIndex: 'country', key: 'country', width: 90, sorter: true },
      product: { title: '关联产品', dataIndex: 'product', key: 'product', width: 110, sorter: true },
      score: {
        title: '综合评分',
        dataIndex: 'score',
        key: 'score',
        width: 85,
        sorter: true,
        render: (score) => <Tag color="#B32620">{score}</Tag>,
      },
      revenueRange: { title: '预估交易规模', dataIndex: 'revenueRange', key: 'revenueRange', width: 120 },
      riskLevel: {
        title: '综合风险',
        dataIndex: 'riskLevel',
        key: 'riskLevel',
        width: 80,
        sorter: true,
        render: (v) => <Tag color={getRiskColor(v)}>{v}</Tag>,
      },
      policyFriendliness: {
        title: '政策利好',
        dataIndex: 'policyFriendliness',
        key: 'policyFriendliness',
        width: 90,
        sorter: true,
        render: (v) => <Tag color={v >= 85 ? 'success' : v >= 70 ? 'processing' : 'default'}>{v >= 85 ? '政策红利' : `${v}%`}</Tag>,
      },
      buyer: {
        title: '买家信用',
        key: 'buyer',
        width: 100,
        sorter: (a, b) => (a.buyerCreditScore || 0) - (b.buyerCreditScore || 0),
        render: (_, r) => (
          <Space direction="vertical" size={0}>
            <Text>{r.buyerCreditRating}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.buyerCreditScore}分</Text>
          </Space>
        ),
      },
      createdAt: { title: '首次发现', dataIndex: 'createdAt', key: 'createdAt', width: 140, sorter: true },
      classPath: {
        title: '分类路径',
        key: 'classPath',
        width: 180,
        ellipsis: true,
        render: (_, r) => {
          const g = classificationGroups.find((grp) => grp.items.includes(r.id))
          return g ? <EllipsisText text={g.path} width={160} /> : '—'
        },
      },
      tags: {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        width: 150,
        render: (tags) => tags.slice(0, 3).map((t) => <Tag key={t}>{t}</Tag>),
      },
      group: { title: '分组', dataIndex: 'group', key: 'group', width: 100, sorter: true },
      assignee: {
        title: '跟进人',
        key: 'assignee',
        width: 90,
        render: (_, r) => r.assignedUserName || r.assignedTo || '—',
      },
      fav: {
        title: '收藏',
        key: 'fav',
        width: 60,
        render: (_, r) => (
          <Button
            type="text"
            icon={isFavoritedBy(r, currentUser.id) ? <HeartFilled style={{ color: '#B32620' }} /> : <HeartOutlined />}
            onClick={() => onToggleFavorite(r)}
          />
        ),
      },
      action: {
        title: '操作',
        key: 'action',
        width: 220,
        fixed: 'right',
        render: (_, r) => (
          <Space size={0} wrap>
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => goToDetail(r.id)}>详情</Button>
            <Button type="link" size="small" onClick={() => { sessionStorage.setItem(OPPORTUNITY_STORAGE_KEY, JSON.stringify([r.id])); navigate('/opportunity/evaluation') }}>评估</Button>
            <Button type="link" size="small" onClick={() => onQuickTrack(r.id)}>跟踪</Button>
            <Dropdown menu={buildRowActionMenu(r)} trigger={['click']}>
              <Button type="link" size="small" icon={<MoreOutlined />}>更多</Button>
            </Dropdown>
          </Space>
        ),
      },
    }
  }, [classificationGroups, currentUser.id, goToDetail, onOpenActionModal, onQuickTrack, onSwitchTab, onToggleFavorite])

  const tableColumns = useMemo(
    () => visibleColumns.map((key) => allColumnMap[key]).filter(Boolean),
    [visibleColumns, allColumnMap],
  )

  const handleColumnChange = (keys) => {
    const next = [...new Set([...keys, ...LIST_COLUMN_DEFS.filter((c) => c.required).map((c) => c.key)])]
    setVisibleColumns(next)
    saveVisibleColumns(next)
  }

  const columnCustomizer = (
    <Popover
      title="自定义列字段"
      trigger="click"
      content={(
        <Checkbox.Group
          value={visibleColumns}
          onChange={handleColumnChange}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflow: 'auto' }}
        >
          {LIST_COLUMN_DEFS.filter((c) => c.key !== 'action').map((col) => (
            <Checkbox key={col.key} value={col.key} disabled={col.required}>
              {col.label}{col.required ? '（必选）' : ''}
            </Checkbox>
          ))}
        </Checkbox.Group>
      )}
    >
      <Button icon={<ColumnHeightOutlined />}>列设置</Button>
    </Popover>
  )

  const renderCardView = () => (
    <div className="opportunity-card-grid">
      {pageData.map((item) => (
        <Card
          key={item.id}
          size="small"
          className={`opportunity-card-item ${applyHighlight(item, activeTemplate.highlight) ? 'opportunity-card-highlight' : ''} ${item.dynamicAlert ? 'opportunity-card-dynamic' : ''}`}
          title={(
            <Space>
              <Checkbox
                checked={selectedRowKeys.includes(item.id)}
                onChange={(e) => setSelectedRowKeys((prev) => (e.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)))}
              />
              <EllipsisText text={item.name} width={180} />
            </Space>
          )}
          extra={item.dynamicAlert && (
            <Tooltip title={`${item.dynamicAlert.message} · ${item.dynamicAlert.time}`}>
              <Tag color={getDynamicAlertColor(item.dynamicAlert.type)} className="opportunity-dynamic-tag">动态更新</Tag>
            </Tooltip>
          )}
          actions={[
            <Button key="d" type="link" size="small" icon={<EyeOutlined />} onClick={() => goToDetail(item.id)}>查看详情</Button>,
            <Button key="t" type="link" size="small" onClick={() => onQuickTrack(item.id)}>加入跟踪</Button>,
            <Button key="a" type="link" size="small" onClick={() => onOpenActionModal('assign', [item.id])}>分配负责人</Button>,
            <Button key="f" type="link" size="small" onClick={() => onOpenActionModal('favorite', [item.id])}>收藏</Button>,
          ]}
        >
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <Text type="secondary">{formatGeoLocation(item)} · {item.country}</Text>
            <Text>{item.product} · 发现 {item.createdAt?.slice(0, 10)}</Text>
            <Row gutter={8}>
              <Col span={12}>
                <div className="opp-card-metric">
                  <Text type="secondary">综合评分</Text>
                  <div className="opp-card-metric-value" style={{ color: '#B32620' }}>{item.score}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="opp-card-metric">
                  <Text type="secondary">收益区间</Text>
                  <div className="opp-card-metric-value">{item.revenueRange}</div>
                </div>
              </Col>
            </Row>
            <Space wrap>
              <Tag color={getRiskColor(item.riskLevel)}>{item.riskLevel}风险</Tag>
              {item.policyFriendliness >= 85 && <Tag color="success">政策红利</Tag>}
              <Tag>{item.buyerCreditRating} · {item.buyerCreditScore}分</Tag>
            </Space>
            <Progress percent={item.score} size="small" strokeColor="#B32620" showInfo={false} />
            <Space wrap size={4}>{item.tags.slice(0, 4).map((t) => <Tag key={t}>{t}</Tag>)}</Space>
          </Space>
        </Card>
      ))}
    </div>
  )

  const renderMapView = () => (
    <div className="opportunity-world-map">
      <div className="opportunity-map-toolbar">
        <Space wrap size={[8, 8]}>
          <Text type="secondary">热力图层：</Text>
          <Checkbox.Group options={OPPORTUNITY_MAP_LAYERS.map((l) => ({ value: l.key, label: l.label }))} value={mapLayers} onChange={setMapLayers} />
          <Checkbox checked={mapShowDots} onChange={(e) => setMapShowDots(e.target.checked)}>叠加商机散点</Checkbox>
          <Select
            style={{ width: 160 }}
            value={mapDotMetric}
            onChange={setMapDotMetric}
            options={MAP_DOT_METRICS}
          />
          <Text type="secondary">{MAP_DOT_METRICS.find((m) => m.value === mapDotMetric)?.hint}</Text>
        </Space>
      </div>
      <div className="opportunity-map-bg">
        <GlobalOutlined className="opportunity-map-bg-icon" />
        <MapHeatmapOverlay cells={mapHeatCells} activeLayers={mapLayers} className="opportunity-map-heatmap" />
        {mapShowDots && sortedData.map((item, index) => {
          const countryPos = GEO_COUNTRY_MAP_POS[item.geoCountry]
          const jitter = ((index % 5) - 2) * 0.9
          const left = item.mapPos?.x ?? (countryPos ? countryPos.x + jitter : 50)
          const top = item.mapPos?.y ?? (countryPos ? countryPos.y + ((index % 3) - 1) * 0.8 : 50)
          const dotStyle = getMapDotStyle(item, mapDotMetric)
          return (
            <Popover
              key={item.id}
              title={item.name}
              content={(
                <Space direction="vertical" size={4}>
                  <Text>{formatGeoLocation(item)} · {item.country} · {item.product}</Text>
                  <Tag color="#B32620">{item.score}分</Tag>
                  <Tag color={getRiskColor(item.riskLevel)}>{item.riskLevel}风险</Tag>
                  <Tag color="blue">政策 {item.policyFriendliness}%</Tag>
                  <Text type="secondary">收益 {item.revenueRange}</Text>
                  {item.dynamicAlert && <Tag color={getDynamicAlertColor(item.dynamicAlert.type)}>{item.dynamicAlert.message}</Tag>}
                  <Button size="small" type="primary" onClick={() => goToDetail(item.id)}>查看详情</Button>
                </Space>
              )}
            >
              <div
                className={`opportunity-map-dot ${item.dynamicAlert ? 'has-alert' : ''}`}
                style={{ left: `${left}%`, top: `${top}%`, ...dotStyle }}
                onClick={() => goToDetail(item.id)}
              />
            </Popover>
          )
        })}
      </div>
      <div className="opportunity-map-legend">
        {mapLayers.map((key) => (
          <Tag key={key} color={MAP_LAYER_META[key]?.color || '#B32620'}>{MAP_LAYER_META[key]?.label || key}</Tag>
        ))}
        <Tag color="#B32620">映射：{MAP_DOT_METRICS.find((m) => m.value === mapDotMetric)?.label}</Tag>
        {dynamicCount > 0 && <Tag color="orange">闪烁点 = 动态更新</Tag>}
      </div>
    </div>
  )

  return (
    <>
      {!pipelineApplied && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="请先完成分类与筛选流水线"
          description="在「分类规则设置」与「筛选条件配置」中配置规则后，点击「运行分类筛选流水线」，结果将汇入本页目标商机池。"
          action={<Button size="small" type="primary" onClick={() => onSwitchTab('filter')}>前往筛选配置</Button>}
        />
      )}

      {dynamicCount > 0 && (
        <Alert
          type="info"
          showIcon
          icon={<ThunderboltOutlined />}
          style={{ marginBottom: 16 }}
          message={`${dynamicCount} 条商机存在动态更新`}
          description="买家信用、需求指数或政策环境发生变化，已在列表/卡片/地图中以「动态更新」标注，请及时复核。"
          action={<Button size="small" onClick={onRefreshDynamic}>刷新最新数据</Button>}
        />
      )}

      <Row gutter={12} className="opportunity-pool-stats">
        <Col xs={12} sm={6}>
          <div className="business-panel opp-stat-card">
            <Statistic title="目标商机池" value={sortedData.length} suffix="条" valueStyle={{ color: '#B32620' }} />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="business-panel opp-stat-card">
            <Statistic title="高评分(≥85)" value={highScoreCount} valueStyle={{ color: '#52c41a' }} />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="business-panel opp-stat-card">
            <Statistic title="动态更新" value={dynamicCount} valueStyle={{ color: '#faad14' }} />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="business-panel opp-stat-card">
            <Statistic title="已收藏" value={favoritedCount} />
          </div>
        </Col>
      </Row>

      <div className="opportunity-pipeline-bar">
        <Space wrap>
          <Tag icon={<PartitionOutlined />} color="#B32620">分类：{activeTemplate.name}</Tag>
          <Tag icon={<SearchOutlined />}>筛选：{filterGroup.logic} · {filterConditionCount} 条件</Tag>
          <Tag icon={<UnorderedListOutlined />}>目标商机池：{sortedData.length} 条</Tag>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={onRefreshDynamic}>动态更新</Button>
          <Button type="primary" icon={<SettingOutlined />} onClick={() => onSwitchTab('filter')}>调整筛选</Button>
        </Space>
      </div>

      <div className="opportunity-workflow-bar">
        <Text type="secondary">商机转化流程：</Text>
        <Button type="link" size="small" disabled={!hasSelection} onClick={() => onOpenActionModal('mark')}>① 标记</Button>
        <Button type="link" size="small" disabled={!hasSelection} onClick={() => onOpenActionModal('group')}>② 分组</Button>
        <Button type="link" size="small" disabled={!hasSelection} onClick={() => onOpenActionModal('assign')}>③ 分配</Button>
        <Button type="link" size="small" disabled={!hasSelection} onClick={() => onOpenActionModal('favorite')}>④ 收藏</Button>
        <Button type="link" size="small" onClick={() => onOpenActionModal('export')}>⑤ 导出</Button>
        <Button type="link" size="small" onClick={() => onSwitchTab('mine')}>⑥ 我的商机</Button>
        <Button type="link" size="small" onClick={onEvaluate}>⑦ 评估排序 →</Button>
      </div>

      <div className="opportunity-batch-bar">
        <Button type="primary" disabled={sortedData.length === 0} onClick={onEvaluate}>送评估排序</Button>
        <Button disabled={!hasSelection} icon={<TagOutlined />} onClick={() => onOpenActionModal('mark')}>批量标记</Button>
        <Button disabled={!hasSelection} icon={<FolderAddOutlined />} onClick={() => onOpenActionModal('group')}>批量分组</Button>
        <Button disabled={!hasSelection} icon={<UserAddOutlined />} onClick={() => onOpenActionModal('assign')}>批量分配</Button>
        <Button disabled={!hasSelection} icon={<StarOutlined />} onClick={() => onOpenActionModal('favorite')}>批量收藏</Button>
        <Button icon={<ExportOutlined />} onClick={() => onOpenActionModal('export')}>导出报表</Button>
        <Button onClick={() => onSwitchTab('mine')}>我的商机</Button>
      </div>

      <div className="opportunity-filter-bar">
        <Input
          className="filter-item"
          placeholder="关键词搜索（名称/产品/国家/来源）"
          prefix={<SearchOutlined />}
          value={quickKeyword}
          onChange={(e) => { setQuickKeyword(e.target.value); setPage(1) }}
          allowClear
        />
        <Select className="filter-item" value={filters.status} options={STATUS_OPTIONS} onChange={(v) => setFilters((p) => ({ ...p, status: v }))} />
        <Select className="filter-item" value={filters.geoMacro} options={GEO_MACRO_OPTIONS} onChange={(v) => setFilters((p) => ({ ...p, geoMacro: v, geoCountry: 'all', geoCity: 'all' }))} />
        <Select className="filter-item" value={filters.geoCountry} options={geoCountryOptions} disabled={filters.geoMacro === 'all'} onChange={(v) => setFilters((p) => ({ ...p, geoCountry: v, geoCity: 'all' }))} />
        <Select className="filter-item" value={filters.geoCity} options={geoCityOptions} disabled={filters.geoCountry === 'all'} onChange={(v) => setFilters((p) => ({ ...p, geoCity: v }))} />
        <Select className="filter-item" value={filters.country} options={COUNTRY_OPTIONS} onChange={(v) => setFilters((p) => ({ ...p, country: v }))} />
        <Select className="filter-item" value={filters.riskLevel} options={RISK_OPTIONS} onChange={(v) => setFilters((p) => ({ ...p, riskLevel: v }))} />
        <Select className="filter-item" value={groupFilter} onChange={setGroupFilter} options={[{ value: 'all', label: '全部分组' }, ...groupOptions.map((g) => ({ value: g, label: g }))]} />
        <RangePicker value={filters.dateRange} onChange={(v) => setFilters((p) => ({ ...p, dateRange: v }))} />
        <div className="opportunity-score-slider">
          <Text type="secondary">评分：</Text>
          <Slider range min={0} max={100} value={filters.scoreRange} onChange={(v) => setFilters((p) => ({ ...p, scoreRange: v }))} />
        </div>
        <div className="opportunity-filter-actions">
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>二次筛选</Button>
        </div>
      </div>

      <div className="opportunity-view-bar">
        <Space wrap>
          <Button type={viewMode === 'list' ? 'primary' : 'default'} icon={<UnorderedListOutlined />} onClick={() => setViewMode('list')}>列表视图</Button>
          <Button type={viewMode === 'card' ? 'primary' : 'default'} icon={<AppstoreOutlined />} onClick={() => setViewMode('card')}>卡片视图</Button>
          <Button type={viewMode === 'map' ? 'primary' : 'default'} icon={<GlobalOutlined />} onClick={() => setViewMode('map')}>地图视图</Button>
          {viewMode === 'list' && columnCustomizer}
          {viewMode !== 'list' && (
            <Select
              style={{ width: 140 }}
              value={sortInfo.field}
              options={SORT_FIELD_OPTIONS}
              onChange={(field) => setSortInfo({ field, order: sortInfo.order || 'descend' })}
            />
          )}
          {viewMode !== 'list' && (
            <Select
              style={{ width: 100 }}
              value={sortInfo.order || 'descend'}
              options={[{ value: 'descend', label: '降序' }, { value: 'ascend', label: '升序' }]}
              onChange={(order) => setSortInfo((prev) => ({ ...prev, order }))}
            />
          )}
        </Space>
        <Text type="secondary">共 {sortedData.length} 条 · 已选 {selectedRowKeys.length} 条</Text>
      </div>

      <div className="opportunity-content-panel">
        {viewMode === 'list' && (
          <Table
            rowKey="id"
            size="middle"
            scroll={{ x: 1700 }}
            columns={tableColumns}
            dataSource={pageData}
            pagination={false}
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
            rowClassName={(record) => (record.dynamicAlert ? 'opportunity-row-dynamic' : '')}
            onChange={(_, __, sorter) => {
              if (!Array.isArray(sorter)) setSortInfo({ field: sorter.field, order: sorter.order })
            }}
          />
        )}
        {viewMode === 'card' && renderCardView()}
        {viewMode === 'map' && renderMapView()}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={sortedData.length}
            showSizeChanger
            showTotal={(total) => `共 ${total} 条`}
            onChange={(current, size) => { setPage(current); setPageSize(size) }}
          />
        </div>
      </div>
    </>
  )
}
