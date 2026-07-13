import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Slider,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  AppstoreOutlined,
  FolderAddOutlined,
  HeartFilled,
  HeartOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
  StarOutlined,
  TableOutlined,
  TagOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../auth/AuthContext'
import { USERS } from '../../../../mock/rbac'
import { OPPORTUNITY_SCOPE_FIELDS } from '../../../../constants/dataScope'
import ExportButton from '../../../../components/ExportButton'
import {
  COUNTRY_OPTIONS,
  GROUP_OPTIONS,
  PRESET_TAGS,
  RISK_OPTIONS,
  SCHEME_OPTIONS,
  STATUS_OPTIONS,
} from '../../../../mock/opportunity'
import { loadOpportunities } from '../opportunityStore'
import {
  OPPORTUNITY_STORAGE_KEY,
  filterOpportunities,
  getRiskColor,
} from '../utils'
import '../opportunity.css'

const { RangePicker } = DatePicker
const { Text } = Typography

const DEFAULT_FILTERS = {
  status: 'all',
  country: 'all',
  product: '',
  riskLevel: 'all',
  dateRange: null,
  scoreRange: [0, 100],
  keyword: '',
}

function EllipsisText({ text, width }) {
  return (
    <Tooltip title={text}>
      <span className="opportunity-ellipsis" style={{ maxWidth: width }}>
        {text}
      </span>
    </Tooltip>
  )
}

export default function OpportunityHallPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { filterModuleData } = useAuth()
  const [rawData, setRawData] = useState(() => loadOpportunities(USERS))
  const dataSource = useMemo(
    () => filterModuleData(rawData, 'opportunity', OPPORTUNITY_SCOPE_FIELDS),
    [rawData, filterModuleData],
  )
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [viewMode, setViewMode] = useState('list')
  const [currentScheme, setCurrentScheme] = useState('scheme-default')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortInfo, setSortInfo] = useState({ field: 'score', order: 'descend' })
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [customGroups, setCustomGroups] = useState([])
  const [tagForm] = Form.useForm()
  const [groupForm] = Form.useForm()

  const groupOptions = useMemo(
    () => [...GROUP_OPTIONS, ...customGroups.map((item) => item.label)],
    [customGroups],
  )

  const filteredData = useMemo(
    () => filterOpportunities(dataSource, appliedFilters),
    [dataSource, appliedFilters],
  )

  const sortedData = useMemo(() => {
    const list = [...filteredData]
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
  }, [filteredData, sortInfo])

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, page, pageSize])

  const hasSelection = selectedRowKeys.length > 0

  const updateRows = (ids, updater) => {
    setRawData((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, ...updater(item) } : item)),
    )
  }

  const handleSearch = () => {
    setAppliedFilters({ ...filters })
    setPage(1)
    message.success('筛选条件已应用')
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
    message.info('筛选条件已重置')
  }

  const handleToggleFavorite = (record) => {
    updateRows([record.id], (item) => ({ favorited: !item.favorited }))
    message.success(record.favorited ? '已取消收藏' : '收藏成功')
  }

  const handleToggleEnabled = (record, checked) => {
    updateRows([record.id], () => ({ enabled: checked, status: checked ? 'active' : 'paused' }))
    message.success(checked ? '商机已启用' : '商机已暂停')
  }

  const handleBatchFavorite = () => {
    updateRows(selectedRowKeys, (item) => ({ favorited: true }))
    message.success(`已收藏 ${selectedRowKeys.length} 条商机`)
  }

  const handleBatchTagSubmit = () => {
    tagForm.validateFields().then((values) => {
      const tags = [...(values.presetTags || [])]
      if (values.customTag?.trim()) tags.push(values.customTag.trim())
      updateRows(selectedRowKeys, (item) => ({
        tags: Array.from(new Set([...item.tags, ...tags])),
      }))
      setTagModalOpen(false)
      tagForm.resetFields()
      message.success('批量标记成功')
    })
  }

  const handleBatchGroupSubmit = () => {
    groupForm.validateFields().then((values) => {
      if (!values.group && !values.newGroup?.trim()) {
        message.warning('请选择分组或输入新分组名称')
        return
      }
      let targetGroup = values.group
      if (values.newGroup?.trim()) {
        targetGroup = values.newGroup.trim()
        setCustomGroups((prev) => [...prev, { label: targetGroup, value: targetGroup }])
      }
      updateRows(selectedRowKeys, () => ({ group: targetGroup }))
      setGroupModalOpen(false)
      groupForm.resetFields()
      message.success('批量分组成功')
    })
  }

  const handleEvaluate = () => {
    const ids = hasSelection ? selectedRowKeys : sortedData.map((item) => item.id)
    sessionStorage.setItem(OPPORTUNITY_STORAGE_KEY, JSON.stringify(ids))
    navigate('/opportunity/evaluation')
  }

  const handleDiscover = () => {
    const newItem = {
      id: `OP-2026-${String(dataSource.length + 1).padStart(3, '0')}`,
      name: '智能挖掘新商机（模拟）',
      country: '新加坡',
      product: '跨境服务',
      score: 84,
      marketSize: '8.5亿元',
      revenueRange: '300万-600万',
      riskLevel: '低',
      policyFriendliness: 86,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'pending',
      favorited: false,
      tags: ['智能挖掘'],
      group: '未分组',
      enabled: true,
      marketScore: 83,
      policyScore: 85,
      creditScore: 84,
    }
    setRawData((prev) => [newItem, ...prev])
    message.success('已发现 1 条新商机')
  }

  const columns = [
    {
      title: '商机ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      sorter: true,
      render: (text) => <EllipsisText text={text} width={100} />,
    },
    {
      title: '商机名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: true,
      render: (text) => <EllipsisText text={text} width={160} />,
    },
    {
      title: '所属国家',
      dataIndex: 'country',
      key: 'country',
      width: 100,
      sorter: true,
      render: (text) => <EllipsisText text={text} width={80} />,
    },
    {
      title: '关联产品',
      dataIndex: 'product',
      key: 'product',
      width: 120,
      sorter: true,
      render: (text) => <EllipsisText text={text} width={100} />,
    },
    {
      title: '综合评分',
      dataIndex: 'score',
      key: 'score',
      width: 90,
      sorter: true,
      render: (score) => <Tag color="#B32620">{score}</Tag>,
    },
    {
      title: '预估市场规模',
      dataIndex: 'marketSize',
      key: 'marketSize',
      width: 130,
      render: (text) => <EllipsisText text={text} width={110} />,
    },
    {
      title: '收益区间',
      dataIndex: 'revenueRange',
      key: 'revenueRange',
      width: 130,
      render: (text) => <EllipsisText text={text} width={110} />,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 90,
      render: (level) => <Tag color={getRiskColor(level)}>{level}</Tag>,
    },
    {
      title: '政策友好度',
      dataIndex: 'policyFriendliness',
      key: 'policyFriendliness',
      width: 100,
      sorter: true,
      render: (value) => `${value}%`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: true,
      render: (text) => <EllipsisText text={text} width={130} />,
    },
    {
      title: '收藏',
      dataIndex: 'favorited',
      key: 'favorited',
      width: 70,
      render: (_, record) => (
        <Button
          type="text"
          icon={record.favorited ? <HeartFilled style={{ color: '#B32620' }} /> : <HeartOutlined />}
          onClick={() => handleToggleFavorite(record)}
        />
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 180,
      render: (tags) => (
        <EllipsisText
          text={tags.join('、')}
          width={160}
        />
      ),
    },
    {
      title: '分组',
      dataIndex: 'group',
      key: 'group',
      width: 110,
      render: (text) => <EllipsisText text={text} width={90} />,
    },
    {
      title: '启停',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (_, record) => (
        <Switch checked={record.enabled} onChange={(checked) => handleToggleEnabled(record, checked)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => navigate(`/opportunity/report/${record.id}`)}>
            报告
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              sessionStorage.setItem(OPPORTUNITY_STORAGE_KEY, JSON.stringify([record.id]))
              navigate('/opportunity/evaluation')
            }}
          >
            评估
          </Button>
        </Space>
      ),
    },
  ]

  const renderCardView = () => (
    <div className="opportunity-card-grid">
      {pageData.map((item) => (
        <Card
          key={item.id}
          size="small"
          title={<EllipsisText text={item.name} width={220} />}
          extra={
            <Checkbox
              checked={selectedRowKeys.includes(item.id)}
              onChange={(e) => {
                setSelectedRowKeys((prev) =>
                  e.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id),
                )
              }}
            />
          }
        >
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            <Text type="secondary">{item.id}</Text>
            <Text>{item.country} · {item.product}</Text>
            <Text>综合评分：<Tag color="#B32620">{item.score}</Tag></Text>
            <Text>风险等级：<Tag color={getRiskColor(item.riskLevel)}>{item.riskLevel}</Tag></Text>
            <EllipsisText text={item.tags.join('、')} width={240} />
          </Space>
        </Card>
      ))}
    </div>
  )

  const renderMapView = () => (
    <div className="opportunity-map-grid">
      {pageData.map((item) => (
        <div key={item.id} className="opportunity-map-item">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            <EllipsisText text={item.country} width={160} />
          </div>
          <EllipsisText text={item.name} width={180} />
          <div style={{ marginTop: 8 }}>
            <Tag color="#B32620">{item.score} 分</Tag>
            <Tag color={getRiskColor(item.riskLevel)}>{item.riskLevel}风险</Tag>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="opportunity-page">
      <div className="opportunity-page-header">
        <h1 className="page-title">商机大厅</h1>
        <p className="page-description">全球商机智能挖掘与管理</p>
      </div>

      <div className="opportunity-toolbar">
        <div className="opportunity-toolbar-left">
          <span>当前方案</span>
          <Select
            value={currentScheme}
            style={{ width: 220 }}
            options={SCHEME_OPTIONS}
            onChange={setCurrentScheme}
          />
          <Button icon={<AppstoreOutlined />}>修改方案</Button>
          <Button icon={<ReloadOutlined />} onClick={() => message.success('方案已重新运行')}>
            重新运行
          </Button>
          <Button icon={<SaveOutlined />} onClick={() => message.success('方案保存成功')}>
            保存为方案
          </Button>
        </div>
        <div className="opportunity-toolbar-right">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleDiscover}>
            一键发现新商机
          </Button>
        </div>
      </div>

      <div className="opportunity-batch-bar">
        <Button type="primary" disabled={!hasSelection && sortedData.length === 0} onClick={handleEvaluate}>
          商机评估
        </Button>
        <Button disabled={!hasSelection} icon={<TagOutlined />} onClick={() => setTagModalOpen(true)}>
          标记
        </Button>
        <Button disabled={!hasSelection} icon={<FolderAddOutlined />} onClick={() => setGroupModalOpen(true)}>
          分组
        </Button>
        <Button disabled={!hasSelection} onClick={() => message.success('批量分配成功')}>
          批量分配
        </Button>
        <Button disabled={!hasSelection} icon={<StarOutlined />} onClick={handleBatchFavorite}>
          批量收藏
        </Button>
        <ExportButton disabled={!hasSelection} onExport={() => message.success('导出任务已创建')}>
          批量导出
        </ExportButton>
      </div>

      <div className="opportunity-filter-bar">
        <Select
          className="filter-item"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
        />
        <Select
          className="filter-item"
          value={filters.country}
          options={COUNTRY_OPTIONS}
          onChange={(value) => setFilters((prev) => ({ ...prev, country: value }))}
        />
        <Input
          className="filter-item"
          placeholder="产品/商机名称"
          value={filters.product}
          onChange={(e) => setFilters((prev) => ({ ...prev, product: e.target.value }))}
        />
        <Select
          className="filter-item"
          value={filters.riskLevel}
          options={RISK_OPTIONS}
          onChange={(value) => setFilters((prev) => ({ ...prev, riskLevel: value }))}
        />
        <RangePicker
          value={filters.dateRange}
          onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
        />
        <div className="opportunity-score-slider">
          <Text type="secondary">评分区间：</Text>
          <Slider
            range
            min={0}
            max={100}
            value={filters.scoreRange}
            onChange={(value) => setFilters((prev) => ({ ...prev, scoreRange: value }))}
          />
        </div>
        <div className="opportunity-filter-actions">
          <Button onClick={handleReset}>重置</Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
        </div>
      </div>

      <div className="opportunity-view-bar">
        <Space>
          <Button
            type={viewMode === 'list' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode('list')}
          >
            列表视图
          </Button>
          <Button
            type={viewMode === 'card' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode('card')}
          >
            卡片视图
          </Button>
          <Button
            type={viewMode === 'map' ? 'primary' : 'default'}
            icon={<TableOutlined />}
            onClick={() => setViewMode('map')}
          >
            地图视图
          </Button>
        </Space>
        <Text type="secondary">共 {sortedData.length} 条商机</Text>
      </div>

      <div className="opportunity-content-panel">
        {viewMode === 'list' && (
          <Table
            rowKey="id"
            size="middle"
            scroll={{ x: 1800 }}
            columns={columns}
            dataSource={pageData}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            onChange={(_, __, sorter) => {
              if (!Array.isArray(sorter)) {
                setSortInfo({
                  field: sorter.field,
                  order: sorter.order,
                })
              }
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
            onChange={(current, size) => {
              setPage(current)
              setPageSize(size)
            }}
          />
        </div>
      </div>

      <Modal
        title="批量标记"
        open={tagModalOpen}
        onCancel={() => setTagModalOpen(false)}
        onOk={handleBatchTagSubmit}
        destroyOnClose
      >
        <Form form={tagForm} layout="vertical">
          <Form.Item label="预设标签" name="presetTags">
            <Checkbox.Group options={PRESET_TAGS} />
          </Form.Item>
          <Form.Item label="自定义标签" name="customTag">
            <Input placeholder="输入自定义标签" maxLength={20} />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="可选备注信息" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="批量分组"
        open={groupModalOpen}
        onCancel={() => setGroupModalOpen(false)}
        onOk={handleBatchGroupSubmit}
        destroyOnClose
      >
        <Form form={groupForm} layout="vertical">
          <Form.Item label="选择分组" name="group" rules={[{ required: false }]}>
            <Select placeholder="选择已有分组" options={groupOptions.map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Form.Item label="新建分组" name="newGroup">
            <Input placeholder="或输入新分组名称" maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
