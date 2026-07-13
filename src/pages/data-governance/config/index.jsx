import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd'
import { DeleteOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  DATA_SOURCE_CATEGORIES,
  DATA_SOURCE_STATUS,
  DATA_SOURCE_TYPES,
  FREQUENCY_OPTIONS,
  INITIAL_DATA_SOURCES,
  getCategoryLabel,
  getQuotaPercent,
  getStatusTag,
  getTypeLabel,
  isQuotaWarning,
} from '../../../mock/data-governance'
import { formatModuleTags, getDownstreamConsumption, getPlatformMetrics, getSourceFeed } from '../../../mock/data-bridge'
import DataWorkflowBar from '../DataWorkflowBar'
import '../data-governance.css'

const categoryCards = [
  { key: 'official', label: '官方与机构', desc: '海关、税务、统计机构' },
  { key: 'commercial', label: '商业与平台', desc: 'B2B、电商、信用评级' },
  { key: 'sentiment', label: '市场与舆情', desc: '新闻、社交媒体、NLP' },
  { key: 'internal', label: '企业内部', desc: 'ERP、CRM、交易记录' },
]

export default function DataConfigPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [dataSources, setDataSources] = useState(INITIAL_DATA_SOURCES)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [viewRecord, setViewRecord] = useState(null)
  const [form] = Form.useForm()

  const categoryCounts = useMemo(() => {
    const counts = { official: 0, commercial: 0, sentiment: 0, internal: 0 }
    dataSources.forEach((d) => { counts[d.category] = (counts[d.category] || 0) + 1 })
    return counts
  }, [dataSources])

  const filteredData = useMemo(
    () =>
      dataSources.filter((item) => {
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
        if (typeFilter !== 'all' && item.type !== typeFilter) return false
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        if (keyword && !`${item.id}${item.name}${item.keywords}`.includes(keyword)) return false
        return true
      }),
    [dataSources, categoryFilter, typeFilter, statusFilter, keyword],
  )

  const platformMetrics = useMemo(() => getPlatformMetrics(), [])
  const downstreamModules = useMemo(() => getDownstreamConsumption(platformMetrics), [platformMetrics])

  const handleToggle = (record, checked) => {
    setDataSources((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? { ...item, enabled: checked, status: checked ? 'running' : 'stopped', health: checked ? 'green' : 'red' }
          : item,
      ),
    )
    message.success(checked ? '数据源已恢复采集' : '数据源已暂停')
  }

  const handleDelete = (id) => {
    setDataSources((prev) => prev.filter((item) => item.id !== id))
    message.success('数据源已删除')
  }

  const handleTest = (record) => {
    if (record.status === 'stopped') {
      message.error(`${record.name} 连接测试失败，数据源已停用`)
      return
    }
    message.success(`${record.name} 连接测试成功，延迟 ${record.latency || 1.2}s`)
  }

  const openEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const openCreate = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({ category: 'official', type: 'api', frequency: '每小时', quotaWarning: 80, paidApi: false })
    setModalOpen(true)
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const base = {
        ...values,
        apiUsed: values.apiUsed || 0,
        apiQuota: values.apiQuota || 0,
        apiCost: values.apiCost || 0,
        health: 'green',
        todayVolume: 0,
        latency: 1.0,
        failRate: 0,
      }
      if (editingRecord) {
        setDataSources((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? { ...item, ...base } : item)),
        )
        message.success('数据源配置已更新')
      } else {
        setDataSources((prev) => [
          {
            ...base,
            id: `DS-${String(prev.length + 1).padStart(3, '0')}`,
            status: 'running',
            enabled: true,
            lastSync: '-',
          },
          ...prev,
        ])
        message.success('数据源已添加')
      }
      setModalOpen(false)
    })
  }

  const columns = [
    { title: '编号', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '数据源名称',
      dataIndex: 'name',
      key: 'name',
      width: 170,
      ellipsis: true,
      render: (text) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: '来源分类',
      dataIndex: 'category',
      key: 'category',
      width: 110,
      render: (v) => <Tag>{getCategoryLabel(v)}</Tag>,
    },
    {
      title: '接入方式',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (v) => getTypeLabel(v),
    },
    { title: '采集频率', dataIndex: 'frequency', key: 'frequency', width: 100 },
    {
      title: 'API配额',
      key: 'quota',
      width: 130,
      render: (_, record) =>
        record.paidApi && record.apiQuota ? (
          <Tooltip title={`已用 ${record.apiUsed} / ${record.apiQuota}，费用 ¥${record.apiCost}`}>
            <Progress
              percent={getQuotaPercent(record.apiUsed, record.apiQuota)}
              size="small"
              strokeColor={isQuotaWarning(record.apiUsed, record.apiQuota, record.quotaWarning) ? '#ff4d4f' : '#B32620'}
              status={isQuotaWarning(record.apiUsed, record.apiQuota, record.quotaWarning) ? 'exception' : 'normal'}
            />
          </Tooltip>
        ) : (
          <Tag>免费/内部</Tag>
        ),
    },
    {
      title: '下游模块',
      key: 'downstream',
      width: 210,
      render: (_, record) => {
        const tags = formatModuleTags(record.id)
        if (!tags.length) return '—'
        return (
          <Space size={4} wrap>
            {tags.map((m) => (
              <Tag
                key={m.route}
                color={m.color}
                style={{ cursor: 'pointer', margin: 0 }}
                onClick={() => navigate(m.route)}
              >
                {m.label}
              </Tag>
            ))}
          </Space>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v) => {
        const s = getStatusTag(v)
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    { title: '最后同步', dataIndex: 'lastSync', key: 'lastSync', width: 150 },
    {
      title: '启停',
      key: 'enabled',
      width: 65,
      render: (_, record) => (
        <Switch checked={record.enabled} onChange={(c) => handleToggle(record, c)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setViewRecord(record); setDrawerOpen(true) }}>详情</Button>
          <Button type="link" size="small" onClick={() => openEdit(record)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleTest(record)}>测试</Button>
          <Popconfirm title="确认删除该数据源？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const formTabs = [
    {
      key: 'basic',
      label: '基础信息',
      children: (
        <>
          <Form.Item label="数据源名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="如：海关总署进出口数据" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="来源分类" name="category" rules={[{ required: true }]}>
                <Select options={DATA_SOURCE_CATEGORIES.filter((o) => o.value !== 'all')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="接入方式" name="type" rules={[{ required: true }]}>
                <Select options={DATA_SOURCE_TYPES.filter((o) => o.value !== 'all')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="协议/技术" name="protocol" rules={[{ required: true }]}>
            <Input placeholder="HTTPS/REST、Robots合规爬虫、MySQL等" />
          </Form.Item>
          <Form.Item label="连接地址" name="endpoint" rules={[{ required: true }]}>
            <Input placeholder="API地址、数据库连接串或爬虫目标" />
          </Form.Item>
          <Form.Item label="负责人" name="owner" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'collect',
      label: '采集策略',
      children: (
        <>
          <Form.Item label="采集频率" name="frequency" rules={[{ required: true }]}>
            <Select options={FREQUENCY_OPTIONS} />
          </Form.Item>
          <Form.Item label="时间窗口" name="timeWindow">
            <Input placeholder="如：近24小时滚动、实时流、近7天" />
          </Form.Item>
          <Form.Item label="采集深度/字段" name="collectDepth">
            <Input placeholder="如：标题,正文,发布时间,附件链接" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="地理范围" name="geoScope">
                <Input placeholder="特定国家/地区或全球" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="行业关键词" name="keywords">
                <Input placeholder="过滤关键词，逗号分隔" />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'quota',
      label: '权限与费用',
      children: (
        <>
          <Form.Item label="付费API" name="paidApi" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="API配额上限" name="apiQuota">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="次/月" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="已使用配额" name="apiUsed">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="预警阈值(%)" name="quotaWarning">
                <InputNumber min={50} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="累计费用(元)" name="apiCost">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </>
      ),
    },
  ]

  return (
    <div className="data-gov-page">
      <div className="business-page-header">
        <h1 className="page-title">数据源配置中心</h1>
        <p className="page-description">多维数据来源管理 · 参数化采集配置 · API配额与费用管控</p>
      </div>

      <DataWorkflowBar active="config" />

      <div className="config-category-cards">
        {categoryCards.map((card) => (
          <div
            key={card.key}
            className={`config-category-card ${categoryFilter === card.key ? 'active' : ''}`}
            onClick={() => setCategoryFilter(categoryFilter === card.key ? 'all' : card.key)}
          >
            <div className="count">{categoryCounts[card.key] || 0}</div>
            <div style={{ fontWeight: 600 }}>{card.label}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{card.desc}</div>
          </div>
        ))}
      </div>

      <div className="business-panel" style={{ marginBottom: 16 }}>
        <h3 className="business-panel-title">业务下游消费（与商机/分析/风险联动）</h3>
        <Row gutter={[12, 12]}>
          {downstreamModules.map((item) => (
            <Col xs={24} sm={12} lg={8} xl={4} key={item.key}>
              <div
                className="config-category-card"
                style={{ cursor: 'pointer', minHeight: 96 }}
                onClick={() => navigate(item.route)}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.module}</div>
                <div style={{ fontSize: 13, color: '#B32620' }}>{item.metric}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{item.pool}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="business-filter-bar">
        <Select value={categoryFilter} style={{ width: 130 }} options={DATA_SOURCE_CATEGORIES} onChange={setCategoryFilter} />
        <Select value={typeFilter} style={{ width: 130 }} options={DATA_SOURCE_TYPES} onChange={setTypeFilter} />
        <Select value={statusFilter} style={{ width: 110 }} options={DATA_SOURCE_STATUS} onChange={setStatusFilter} />
        <Input
          placeholder="搜索名称/编号/关键词"
          style={{ width: 220 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          suffix={<SearchOutlined />}
        />
        <Space style={{ marginLeft: 'auto' }}>
          <Button icon={<ReloadOutlined />} onClick={() => message.info('配置列表已刷新')}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增数据源</Button>
        </Space>
      </div>

      <div className="business-panel">
        <Table
          rowKey="id"
          size="middle"
          scroll={{ x: 1500 }}
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 条` }}
        />
      </div>

      <Modal
        title={editingRecord ? '编辑数据源' : '新增数据源'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical">
          <Tabs items={formTabs} />
        </Form>
      </Modal>

      <Drawer title="数据源详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={560}>
        {viewRecord && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="编号">{viewRecord.id}</Descriptions.Item>
              <Descriptions.Item label="分类">{getCategoryLabel(viewRecord.category)}</Descriptions.Item>
              <Descriptions.Item label="名称" span={2}>{viewRecord.name}</Descriptions.Item>
              <Descriptions.Item label="接入方式">{getTypeLabel(viewRecord.type)}</Descriptions.Item>
              <Descriptions.Item label="协议">{viewRecord.protocol}</Descriptions.Item>
              <Descriptions.Item label="连接地址" span={2}>{viewRecord.endpoint}</Descriptions.Item>
              <Descriptions.Item label="采集频率">{viewRecord.frequency}</Descriptions.Item>
              <Descriptions.Item label="时间窗口">{viewRecord.timeWindow}</Descriptions.Item>
              <Descriptions.Item label="采集深度" span={2}>{viewRecord.collectDepth}</Descriptions.Item>
              <Descriptions.Item label="地理范围">{viewRecord.geoScope}</Descriptions.Item>
              <Descriptions.Item label="关键词">{viewRecord.keywords}</Descriptions.Item>
              <Descriptions.Item label="负责人">{viewRecord.owner}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={getStatusTag(viewRecord.status).color}>{getStatusTag(viewRecord.status).text}</Tag></Descriptions.Item>
            </Descriptions>
            {viewRecord.paidApi && viewRecord.apiQuota > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>API 配额与费用</h4>
                <Progress
                  percent={getQuotaPercent(viewRecord.apiUsed, viewRecord.apiQuota)}
                  strokeColor={isQuotaWarning(viewRecord.apiUsed, viewRecord.apiQuota, viewRecord.quotaWarning) ? '#ff4d4f' : '#B32620'}
                />
                <div style={{ marginTop: 8, color: '#595959' }}>
                  已用 {viewRecord.apiUsed} / {viewRecord.apiQuota} 次 · 累计费用 ¥{viewRecord.apiCost} · 预警阈值 {viewRecord.quotaWarning}%
                </div>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <h4>下游业务模块</h4>
              <div style={{ marginBottom: 8, color: '#595959' }}>{getSourceFeed(viewRecord.id).desc}</div>
              <Space wrap>
                {formatModuleTags(viewRecord.id).map((m) => (
                  <Tag key={m.route} color={m.color} style={{ cursor: 'pointer' }} onClick={() => navigate(m.route)}>
                    {m.label}
                  </Tag>
                ))}
              </Space>
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}
