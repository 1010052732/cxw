import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Row,
  Select,
  Slider,
  Space,
  Tabs,
  Tag,
  Tree,
  Typography,
} from 'antd'
import {
  BulbOutlined,
  FilterOutlined,
  PartitionOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../../auth/AuthContext'
import { OPPORTUNITY_SCOPE_FIELDS } from '../../../../constants/dataScope'
import { USERS } from '../../../../mock/rbac'
import {
  CLASSIFICATION_DIMENSIONS,
  CLASSIFICATION_TEMPLATES,
  GROUP_OPTIONS,
  SMART_CLASSIFY_RECOMMEND,
} from '../../../../mock/opportunity'
import { GEO_COUNTRY_MAP_POS, OPPORTUNITY_MAP_LAYERS } from '../../../../mock/geo'
import { aggregateOpportunityHeatCells } from '../../../../utils/mapHeatmap'
import {
  OPPORTUNITY_STORAGE_KEY,
  buildClassificationGroups,
  evaluateFilterGroup,
  filterOpportunities,
  getGeoCityOptions,
  getGeoCountryOptions,
} from '../utils'
import FilterBuilderTab from './FilterBuilderTab'
import OpportunityListTab from './OpportunityListTab'
import { countConditions, createFilterGroup, normalizeFilterGroup } from './filterModel'
import {
  loadClassifyFilterState,
  loadFilterTemplates,
  persistCustomTemplates,
  saveClassifyFilterState,
} from './filterTemplateStore'
import {
  loadOpportunities,
  saveOpportunities,
} from '../opportunityStore'
import { exportOpportunitiesToCsv } from '../exportList'
import MyOpportunitiesTab from './MyOpportunitiesTab'
import OpportunityActionModals from './OpportunityActionModals'
import '../opportunity.css'

const { Text, Paragraph } = Typography

const DEFAULT_FILTERS = {
  status: 'all',
  country: 'all',
  geoMacro: 'all',
  geoCountry: 'all',
  geoCity: 'all',
  product: '',
  riskLevel: 'all',
  dateRange: null,
  scoreRange: [0, 100],
  keyword: '',
}

export default function OpportunityClassifyPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentUser, filterModuleData, can } = useAuth()
  const [activeTab, setActiveTab] = useState('classify')
  const [rawData, setRawData] = useState(() => loadOpportunities(USERS))
  const dataSource = useMemo(
    () => filterModuleData(rawData, 'opportunity', OPPORTUNITY_SCOPE_FIELDS),
    [rawData, filterModuleData],
  )
  const [activeTemplate, setActiveTemplate] = useState(() => {
    const stored = loadClassifyFilterState({})
    const tpl = CLASSIFICATION_TEMPLATES.find((t) => t.id === stored.activeTemplateId)
    return tpl || CLASSIFICATION_TEMPLATES[2]
  })
  const [dimWeights, setDimWeights] = useState(() => {
    const stored = loadClassifyFilterState({})
    return stored.dimWeights || CLASSIFICATION_TEMPLATES[2].weights
  })
  const [dimPriority, setDimPriority] = useState(() => {
    const stored = loadClassifyFilterState({})
    return stored.dimPriority || CLASSIFICATION_TEMPLATES[2].priority
  })
  const [filterGroup, setFilterGroup] = useState(() => {
    const stored = loadClassifyFilterState({})
    return normalizeFilterGroup(stored.filterGroup || createFilterGroup({
      logic: 'AND',
      conditions: [
        { field: 'score', operator: 'gte', value: 80, label: '综合评分≥80' },
      ],
    }))
  })
  const [savedTemplates, setSavedTemplates] = useState(() => loadFilterTemplates())
  const [pipelineApplied, setPipelineApplied] = useState(() => loadClassifyFilterState({}).pipelineApplied || false)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)
  const [quickKeyword, setQuickKeyword] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [viewMode, setViewMode] = useState('list')
  const [mapLayers, setMapLayers] = useState(OPPORTUNITY_MAP_LAYERS.filter((l) => l.default).map((l) => l.key))
  const [mapShowDots, setMapShowDots] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortInfo, setSortInfo] = useState({ field: 'score', order: 'descend' })
  const [actionModal, setActionModal] = useState({ type: null, ids: [] })
  const [customGroups, setCustomGroups] = useState([])
  const [groupFilter, setGroupFilter] = useState('all')

  useEffect(() => {
    saveOpportunities(rawData)
  }, [rawData])

  useEffect(() => {
    persistCustomTemplates(savedTemplates)
  }, [savedTemplates])

  useEffect(() => {
    saveClassifyFilterState({
      filterGroup,
      activeTemplateId: activeTemplate.id,
      dimWeights,
      dimPriority,
      pipelineApplied,
    })
  }, [filterGroup, activeTemplate.id, dimWeights, dimPriority, pipelineApplied])

  useEffect(() => {
    const tab = searchParams.get('tab') || location.state?.tab
    if (['classify', 'filter', 'list', 'mine'].includes(tab)) setActiveTab(tab)
  }, [searchParams, location.state])

  const switchTab = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const groupOptions = useMemo(
    () => [...GROUP_OPTIONS, ...customGroups.map((item) => item.label)],
    [customGroups],
  )

  const templateConfig = useMemo(
    () => ({ ...activeTemplate, priority: dimPriority, weights: dimWeights }),
    [activeTemplate, dimPriority, dimWeights],
  )

  const filteredByRules = useMemo(() => {
    if (!pipelineApplied) return dataSource
    const step1 = evaluateFilterGroup(dataSource, filterGroup)
    return step1
  }, [dataSource, filterGroup, pipelineApplied])

  const classificationGroups = useMemo(
    () => buildClassificationGroups(filteredByRules, templateConfig),
    [filteredByRules, templateConfig],
  )

  const listData = useMemo(() => {
    let list = filteredByRules
    if (pipelineApplied) {
      list = filterOpportunities(list, { ...appliedFilters, keyword: quickKeyword || appliedFilters.keyword })
    } else {
      list = filterOpportunities(list, appliedFilters)
    }
    if (groupFilter !== 'all') {
      list = list.filter((item) => item.group === groupFilter)
    }
    return list
  }, [filteredByRules, appliedFilters, quickKeyword, pipelineApplied, groupFilter])

  const sortedData = useMemo(() => {
    const list = [...listData]
    const { field, order } = sortInfo
    if (!field || !order) return list
    list.sort((a, b) => {
      const av = a[field]
      const bv = b[field]
      if (typeof av === 'number' && typeof bv === 'number') {
        return order === 'ascend' ? av - bv : bv - av
      }
      return order === 'ascend'
        ? String(av).localeCompare(String(bv), 'zh-CN')
        : String(bv).localeCompare(String(av), 'zh-CN')
    })
    return list
  }, [listData, sortInfo])

  const mapHeatCells = useMemo(
    () => aggregateOpportunityHeatCells(sortedData, GEO_COUNTRY_MAP_POS),
    [sortedData],
  )

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, page, pageSize])

  const geoCountryOptions = useMemo(
    () => getGeoCountryOptions(filters.geoMacro),
    [filters.geoMacro],
  )

  const geoCityOptions = useMemo(
    () => getGeoCityOptions(filters.geoCountry),
    [filters.geoCountry],
  )

  const previewCount = useMemo(
    () => evaluateFilterGroup(dataSource, filterGroup).length,
    [dataSource, filterGroup],
  )

  const treeData = useMemo(
    () => classificationGroups.slice(0, 12).map((g, i) => ({
      key: g.path,
      title: (
        <Space>
          <Text>{g.path}</Text>
          <Tag>{g.count} 条</Tag>
        </Space>
      ),
      children: g.items.slice(0, 3).map((id) => {
        const item = dataSource.find((o) => o.id === id)
        return { key: id, title: item ? `${item.name} (${item.score}分)` : id, isLeaf: true }
      }),
    })),
    [classificationGroups, dataSource],
  )

  const hasSelection = selectedRowKeys.length > 0

  const actionTargets = useMemo(
    () => dataSource.filter((item) => actionModal.ids.includes(item.id)),
    [dataSource, actionModal.ids],
  )

  const openActionModal = (type, ids) => {
    if (type === 'export') {
      setActionModal({ type: 'export', ids: ids?.length ? ids : selectedRowKeys })
      return
    }
    const targetIds = ids?.length ? ids : selectedRowKeys
    if (!targetIds.length) {
      message.warning('请先选择要操作的商机')
      return
    }
    setActionModal({ type, ids: targetIds })
  }

  const closeActionModal = () => setActionModal({ type: null, ids: [] })

  const updateRows = (ids, updater) => {
    setRawData((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, ...updater(item) } : item)),
    )
  }

  const handleApplyTemplate = (tpl) => {
    setActiveTemplate(tpl)
    setDimPriority(tpl.priority)
    setDimWeights(tpl.weights)
    message.success(`已应用分类模板「${tpl.name}」`)
  }

  const handleSmartRecommend = () => {
    const tpl = CLASSIFICATION_TEMPLATES.find((t) => t.id === SMART_CLASSIFY_RECOMMEND.templateId)
    if (tpl) handleApplyTemplate(tpl)
    message.info(SMART_CLASSIFY_RECOMMEND.reason)
  }

  const handleRunPipeline = () => {
    const count = evaluateFilterGroup(dataSource, filterGroup).length
    setPipelineApplied(true)
    setAppliedFilters({ ...filters })
    switchTab('list')
    setPage(1)
    message.success(`流水线运行完成，筛选出 ${count} 条目标商机`)
  }

  const handleRefreshDynamic = () => {
    setRawData((prev) =>
      prev.map((item) =>
        item.dynamicAlert
          ? { ...item, score: Math.min(100, item.score + 1), dynamicAlert: { ...item.dynamicAlert, time: new Date().toLocaleString('zh-CN') } }
          : item,
      ),
    )
    message.success('已引用最新数据变化，动态更新商机层级')
  }

  const handleQuickTrack = (id) => {
    updateRows([id], (item) => ({
      tags: Array.from(new Set([...(item.tags || []), '重点跟进'])),
      marked: true,
    }))
    message.success('已加入跟踪（标签：重点跟进），可在「我的商机」查看')
  }

  const handleSearch = () => {
    setAppliedFilters({ ...filters })
    setPage(1)
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setQuickKeyword('')
    setPage(1)
  }

  const handleToggleFavorite = (record) => {
    openActionModal('favorite', [record.id])
  }

  const handleMarkSubmit = (values, targets) => {
    const ids = targets.map((t) => t.id)
    updateRows(ids, (item) => {
      let tags = [...(item.tags || [])]
      if (values.presetTags?.length) tags = [...tags, ...values.presetTags]
      if (values.customTag?.trim()) tags.push(values.customTag.trim())
      if (values.removeTags?.length) tags = tags.filter((t) => !values.removeTags.includes(t))
      return { tags: Array.from(new Set(tags)), marked: true }
    })
    message.success(`已标记 ${ids.length} 条商机，可在列表标签列查看`)
  }

  const handleGroupSubmit = (values, targets) => {
    let targetGroup = values.group
    if (values.newGroup?.trim()) {
      targetGroup = values.newGroup.trim()
      setCustomGroups((prev) => [...prev, { label: targetGroup, value: targetGroup }])
    }
    updateRows(
      targets.map((t) => t.id),
      () => ({ group: targetGroup }),
    )
    message.success(`已将 ${targets.length} 条商机归入「${targetGroup}」`)
  }

  const handleAssignSubmit = (values, targets) => {
    const user = USERS.find((u) => u.id === values.userId)
    if (!user) return
    updateRows(targets.map((t) => t.id), (item) => ({
      assignedUserId: user.id,
      assignedUserName: user.name,
      assignedTo: user.dept,
      group: values.group || item.group,
      ...(values.setOwner ? { ownerId: user.id, ownerName: user.name, marked: true } : {}),
    }))
    message.success(`已分配给 ${user.name}，跟进人可在「我的商机 → 指派给我」查看`)
  }

  const handleFavoriteSubmit = (values, targets) => {
    updateRows(targets.map((t) => t.id), (item) => {
      if (values.action === 'unfavorite') {
        const favIds = (item.favoriteUserIds || []).filter((uid) => uid !== currentUser.id)
        return { favoriteUserIds: favIds, favorited: favIds.length > 0 }
      }
      const favIds = new Set(item.favoriteUserIds || [])
      favIds.add(currentUser.id)
      return { favoriteUserIds: [...favIds], favorited: true }
    })
    message.success(
      values.action === 'unfavorite'
        ? `已取消收藏 ${targets.length} 条商机`
        : `已收藏 ${targets.length} 条商机，可在「我的商机 → 收藏夹」查看`,
    )
  }

  const handleExportSubmit = (values, targets) => {
    if (!can('action:data:export')) {
      message.warning('当前角色无数据导出权限')
      return
    }
    let list = dataSource
    if (values.scope === 'selected') {
      list = targets.length ? targets : dataSource.filter((i) => selectedRowKeys.includes(i.id))
    } else if (values.scope === 'filtered') {
      list = sortedData
    }
    if (!list.length) {
      message.warning('没有可导出的商机')
      return
    }
    exportOpportunitiesToCsv(list, USERS, values.filename, values.fields)
    message.success(`已导出 ${list.length} 条商机（CSV）`)
  }

  const handleClaimOwner = (id) => {
    updateRows([id], (item) => ({
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      marked: true,
      tags: Array.from(new Set([...(item.tags || []), '重点跟进'])),
    }))
    message.success('已认领为该商机负责人，可在「我的商机 → 我负责的」查看')
  }

  const handleEvaluate = () => {
    const ids = hasSelection ? selectedRowKeys : sortedData.map((item) => item.id)
    sessionStorage.setItem(OPPORTUNITY_STORAGE_KEY, JSON.stringify(ids))
    navigate('/opportunity/evaluation')
  }

  const listTab = (
    <OpportunityListTab
      pipelineApplied={pipelineApplied}
      activeTemplate={activeTemplate}
      filterGroup={filterGroup}
      filterConditionCount={countConditions(filterGroup)}
      sortedData={sortedData}
      pageData={pageData}
      classificationGroups={classificationGroups}
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
      viewMode={viewMode}
      setViewMode={setViewMode}
      filters={filters}
      setFilters={setFilters}
      quickKeyword={quickKeyword}
      setQuickKeyword={setQuickKeyword}
      groupFilter={groupFilter}
      setGroupFilter={setGroupFilter}
      groupOptions={groupOptions}
      geoCountryOptions={geoCountryOptions}
      geoCityOptions={geoCityOptions}
      sortInfo={sortInfo}
      setSortInfo={setSortInfo}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      mapHeatCells={mapHeatCells}
      mapLayers={mapLayers}
      setMapLayers={setMapLayers}
      mapShowDots={mapShowDots}
      setMapShowDots={setMapShowDots}
      currentUser={currentUser}
      onSwitchTab={switchTab}
      onRefreshDynamic={handleRefreshDynamic}
      onEvaluate={handleEvaluate}
      onOpenActionModal={openActionModal}
      onToggleFavorite={handleToggleFavorite}
      onQuickTrack={handleQuickTrack}
      onSearch={handleSearch}
      onReset={handleReset}
      navigate={navigate}
    />
  )

  const classifyTab = (
    <Row gutter={16}>
      <Col xs={24} lg={14}>
        <div className="business-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 className="business-panel-title" style={{ margin: 0 }}>分类模板与维度库</h3>
              <Text type="secondary">规则可配置 · 支持智能推荐 · 结果可演进</Text>
            </div>
            <Button icon={<BulbOutlined />} onClick={handleSmartRecommend}>智能推荐规则</Button>
          </div>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {CLASSIFICATION_TEMPLATES.map((tpl) => (
              <Col xs={24} md={8} key={tpl.id}>
                <Card
                  size="small"
                  className={activeTemplate.id === tpl.id ? 'classify-tpl-active' : ''}
                  hoverable
                  onClick={() => handleApplyTemplate(tpl)}
                >
                  <Text strong>{tpl.name}</Text>
                  <Paragraph type="secondary" style={{ fontSize: 12, margin: '8px 0' }}>{tpl.desc}</Paragraph>
                  <Tag>{tpl.priority.join(' › ')}</Tag>
                </Card>
              </Col>
            ))}
          </Row>
          <Divider orientation="left">维度库</Divider>
          <Row gutter={16}>
            {Object.entries(CLASSIFICATION_DIMENSIONS).map(([key, dim]) => (
              <Col xs={24} md={8} key={key}>
                <Card size="small" title={dim.label}>
                  {dim.items.map((item) => (
                    <div key={item.key} style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 13 }}>{item.label}</Text>
                      <div><Text type="secondary" style={{ fontSize: 12 }}>{item.options.slice(0, 3).join('、')}…</Text></div>
                    </div>
                  ))}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Col>
      <Col xs={24} lg={10}>
        <div className="business-panel">
          <h3 className="business-panel-title">分类优先级与权重</h3>
          <Form layout="vertical" size="small">
            <Form.Item label="维度优先顺序">
              <Select
                mode="multiple"
                value={dimPriority}
                onChange={setDimPriority}
                options={[
                  { value: 'market', label: '市场维度' },
                  { value: 'product', label: '产品维度' },
                  { value: 'opportunity', label: '机会性质' },
                ]}
              />
            </Form.Item>
            {['market', 'product', 'opportunity'].map((key) => (
              <Form.Item key={key} label={`${key === 'market' ? '市场' : key === 'product' ? '产品' : '机会'}权重`}>
                <Slider min={10} max={60} value={dimWeights[key]} onChange={(v) => setDimWeights((prev) => ({ ...prev, [key]: v }))} />
              </Form.Item>
            ))}
          </Form>
          <Divider />
          <h4>分类预览（{classificationGroups.length} 个分组）</h4>
          <Tree treeData={treeData} defaultExpandAll height={280} />
          <Button type="primary" block icon={<FilterOutlined />} style={{ marginTop: 16 }} onClick={() => switchTab('filter')}>
            下一步：配置筛选条件
          </Button>
        </div>
      </Col>
    </Row>
  )

  const filterTab = (
    <FilterBuilderTab
      dataSource={dataSource}
      filterGroup={filterGroup}
      setFilterGroup={setFilterGroup}
      savedTemplates={savedTemplates}
      setSavedTemplates={setSavedTemplates}
      previewCount={previewCount}
      onRunPipeline={handleRunPipeline}
    />
  )

  return (
    <div className="opportunity-page">
      <div className="opportunity-page-header">
        <h1 className="page-title">商机分类与筛选</h1>
        <p className="page-description">先分清、再筛优 — 分类规则 · 筛选配置 · 商机列表 · 我的商机 · 送评估排序</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={switchTab}
        items={[
          { key: 'classify', label: <span><PartitionOutlined /> 分类规则设置</span>, children: classifyTab },
          { key: 'filter', label: <span><FilterOutlined /> 筛选条件配置</span>, children: filterTab },
          { key: 'list', label: <span><UnorderedListOutlined /> 商机列表展示</span>, children: listTab },
          {
            key: 'mine',
            label: <span><UserOutlined /> 我的商机</span>,
            children: (
              <MyOpportunitiesTab
                dataSource={dataSource}
                currentUser={currentUser}
                onToggleFavorite={handleToggleFavorite}
                onAssignSelf={handleClaimOwner}
                onOpenExport={(ids) => openActionModal('export', ids)}
                onNavigateDetail={(oid) => navigate(`/opportunity/detail/${oid}`)}
                onNavigateEvaluation={(oid) => {
                  sessionStorage.setItem(OPPORTUNITY_STORAGE_KEY, JSON.stringify([oid]))
                  navigate('/opportunity/evaluation')
                }}
              />
            ),
          },
        ]}
      />

      <OpportunityActionModals
        action={actionModal}
        onClose={closeActionModal}
        targets={actionTargets}
        currentUser={currentUser}
        users={USERS}
        groupOptions={groupOptions}
        sortedCount={sortedData.length}
        onMark={handleMarkSubmit}
        onGroup={handleGroupSubmit}
        onAssign={handleAssignSubmit}
        onFavorite={handleFavoriteSubmit}
        onExport={handleExportSubmit}
      />
    </div>
  )
}
