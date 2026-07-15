import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Progress,
  Result,
  Row,
  Segmented,
  Select,
  Space,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { DualAxes, Line, Scatter } from '@ant-design/charts'
import {
  ArrowLeftOutlined,
  AuditOutlined,
  BulbOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  FilePdfOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FolderAddOutlined,
  HeartFilled,
  HeartOutlined,
  LeftOutlined,
  LinkOutlined,
  MessageOutlined,
  RightOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  TagOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../../auth/AuthContext'
import { USERS } from '../../../../mock/rbac'
import {
  DETAIL_FOLLOW_STATUS,
  GROUP_OPTIONS,
  getDetailData,
} from '../../../../mock/opportunity'
import OpportunityActionModals from '../classify/OpportunityActionModals'
import { exportOpportunitiesToCsv } from '../exportList'
import {
  FOLLOW_STATUS_PATCH,
  getOpportunityById,
  isFavoritedBy,
  loadDiscussions,
  loadOpportunities,
  saveDiscussion,
  saveOpportunities,
  updateOpportunityById,
} from '../opportunityStore'
import { OPPORTUNITY_STORAGE_KEY, OPPORTUNITY_DETAIL_NAV_KEY, getRiskColor, formatGeoLocation } from '../utils'
import '../opportunity.css'

const DETAIL_SECTIONS = [
  { key: 'summary', label: '核心摘要' },
  { key: 'analysis', label: '多维分析' },
  { key: 'attachments', label: '附件证据' },
  { key: 'collaboration', label: '协作行动' },
]

const ANALYSIS_DIMENSIONS = [
  { key: 'market', label: '市场环境', desc: '宏观·需求·文化习俗' },
  { key: 'competition', label: '竞争格局', desc: '份额·定价·定位矩阵' },
  { key: 'buyer', label: '目标买家', desc: '画像·信用·舆情' },
  { key: 'product', label: '产品与供应链', desc: '规格·认证·替代方案' },
  { key: 'policy', label: '政策与法规', desc: '关税·准入·合规' },
  { key: 'logistics', label: '物流与通关', desc: '港口·线路·清关' },
]

function scrollToDetailSection(key) {
  document.getElementById(`detail-section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const { Title, Text, Paragraph } = Typography

const ATTACH_TYPE_MAP = {
  report: { label: '行业报告', color: 'blue' },
  policy: { label: '政策文件', color: 'green' },
  analysis: { label: '研究资料', color: 'purple' },
  credit: { label: '信用报告', color: 'orange' },
  news: { label: '新闻报道', color: 'default' },
}

const WORKFLOW_DETAIL_FIELDS = [
  'tags', 'group', 'score', 'status', 'followStatus', 'ownerId', 'ownerName',
  'assignedUserId', 'assignedUserName', 'assignedTo', 'favoriteUserIds', 'favorited',
  'marked', 'dynamicAlert', 'updatedAt', 'riskLevel', 'revenueRange', 'marketSize',
  'policyFriendliness', 'marketScore', 'policyScore', 'creditScore', 'compositeScore', 'indicatorScores',
  'geoMacro', 'geoCountry', 'geoCity', 'geoLabel',
  'sourceMacro', 'sourceCountry', 'sourceCity', 'sourceRegion', 'sourceLabel',
]

function mergeDetail(id, workflowList) {
  const analytics = getDetailData(id)
  const workflow = getOpportunityById(workflowList, id)
  if (!analytics || !workflow) return null
  const patch = {}
  WORKFLOW_DETAIL_FIELDS.forEach((key) => {
    if (workflow[key] !== undefined) patch[key] = workflow[key]
  })
  return {
    ...analytics,
    ...patch,
    followStatus: patch.followStatus || analytics.followStatus,
    rating: (patch.score ?? analytics.score) >= 90 ? 'A' : (patch.score ?? analytics.score) >= 85 ? 'B+' : 'B',
  }
}

export default function OpportunityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { currentUser } = useAuth()
  const [workflowList, setWorkflowList] = useState(() => loadOpportunities(USERS))
  const [detail, setDetail] = useState(() => mergeDetail(id, loadOpportunities(USERS)))
  const [discussions, setDiscussions] = useState(() => {
    const base = getDetailData(id)
    return loadDiscussions(id, base?.discussions || [])
  })
  const [actionModal, setActionModal] = useState({ type: null, ids: [] })
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignForm] = Form.useForm()
  const [commentText, setCommentText] = useState('')
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [researchModalOpen, setResearchModalOpen] = useState(false)
  const [attachFilter, setAttachFilter] = useState('all')
  const [analysisTabKey, setAnalysisTabKey] = useState('market')
  const [traceAttach, setTraceAttach] = useState(null)
  const [taskForm] = Form.useForm()
  const [reviewForm] = Form.useForm()
  const [researchForm] = Form.useForm()
  const [activityLog, setActivityLog] = useState([])

  const persistWorkflow = (nextList, successMsg) => {
    setWorkflowList(nextList)
    saveOpportunities(nextList)
    const merged = mergeDetail(id, nextList)
    if (merged) setDetail(merged)
    if (successMsg) message.success(successMsg)
  }

  useEffect(() => {
    const list = loadOpportunities(USERS)
    setWorkflowList(list)
    const merged = mergeDetail(id, list)
    setDetail(merged)
    const base = getDetailData(id)
    setDiscussions(loadDiscussions(id, base?.discussions || []))
    setActivityLog([])
  }, [id])

  const followMeta = useMemo(
    () => DETAIL_FOLLOW_STATUS.find((s) => s.value === detail?.followStatus) || DETAIL_FOLLOW_STATUS[1],
    [detail?.followStatus],
  )

  const actionTargets = useMemo(
    () => (detail ? [detail] : []),
    [detail],
  )

  const macroTrendData = useMemo(() => {
    if (!detail?.market?.trendData) return []
    return detail.market.trendData.map((d) => ({
      year: d.year,
      demand: d.demand,
      gdp: d.gdp,
    }))
  }, [detail?.market?.trendData])

  const macroTrendColumnData = useMemo(
    () => macroTrendData.map((d) => ({ ...d, metric: '需求指数' })),
    [macroTrendData],
  )

  const macroTrendLineData = useMemo(
    () => macroTrendData.map((d) => ({ ...d, metric: 'GDP增速指数' })),
    [macroTrendData],
  )

  const priceTrendLineData = useMemo(() => {
    if (!detail?.market?.priceTrendData) return []
    return detail.market.priceTrendData.flatMap((d) => [
      { period: d.period, value: d.priceIndex, type: '价格指数' },
      { period: d.period, value: d.demandIndex, type: '需求指数' },
    ])
  }, [detail?.market?.priceTrendData])

  const navIds = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(OPPORTUNITY_DETAIL_NAV_KEY)
      if (raw) {
        const ids = JSON.parse(raw)
        if (Array.isArray(ids) && ids.includes(id)) return ids
      }
    } catch {
      /* ignore */
    }
    return workflowList.map((item) => item.id)
  }, [id, workflowList])

  const navIndex = navIds.indexOf(id)
  const prevId = navIndex > 0 ? navIds[navIndex - 1] : null
  const nextId = navIndex >= 0 && navIndex < navIds.length - 1 ? navIds[navIndex + 1] : null

  const filteredAttachments = useMemo(() => {
    if (!detail?.attachments) return []
    if (attachFilter === 'all') return detail.attachments
    return detail.attachments.filter((item) => item.type === attachFilter)
  }, [detail?.attachments, attachFilter])

  const appendActivity = (action, detailText) => {
    setActivityLog((prev) => [{
      id: `act-${Date.now()}`,
      action,
      detail: detailText,
      user: currentUser.name,
      time: new Date().toLocaleString('zh-CN'),
    }, ...prev])
  }

  const openActionModal = (type) => {
    if (!detail) return
    setActionModal({ type, ids: [detail.id] })
  }

  const closeActionModal = () => setActionModal({ type: null, ids: [] })

  const handleFollowChange = (value) => {
    const patch = FOLLOW_STATUS_PATCH[value]
    if (!patch || !detail) return
    const nextTags = Array.from(new Set([
      ...(detail.tags || []).filter((t) => !patch.removeTags.includes(t)),
      ...patch.addTags,
    ]))
    const nextList = updateOpportunityById(workflowList, detail.id, {
      followStatus: value,
      status: patch.status,
      tags: nextTags,
      marked: true,
      updatedAt: new Date().toLocaleString('zh-CN'),
    })
    persistWorkflow(nextList, `跟进状态已更新为「${DETAIL_FOLLOW_STATUS.find((s) => s.value === value)?.label}」`)
    appendActivity('状态变更', DETAIL_FOLLOW_STATUS.find((s) => s.value === value)?.label)
  }

  const handleAddComment = () => {
    if (!commentText.trim() || !detail) return
    const item = {
      id: `d-${Date.now()}`,
      user: currentUser.name,
      dept: currentUser.dept,
      content: commentText.trim(),
      time: new Date().toLocaleString('zh-CN'),
    }
    const next = saveDiscussion(id, item)
    setDiscussions(next)
    setCommentText('')
    appendActivity('讨论', item.content.slice(0, 40))
    message.success('评论已发布')
  }

  const handleCreateTask = () => {
    taskForm.validateFields().then((values) => {
      appendActivity('销售任务', values.title)
      message.success(`销售任务「${values.title}」已创建，负责人：${values.owner}`)
      setTaskModalOpen(false)
      taskForm.resetFields()
    })
  }

  const handleCreateResearch = () => {
    researchForm.validateFields().then((values) => {
      appendActivity('市场调研', values.topic)
      message.success(`市场调研「${values.topic}」已安排，执行人：${values.assignee}`)
      setResearchModalOpen(false)
      researchForm.resetFields()
    })
  }

  const handleStartReview = () => {
    reviewForm.validateFields().then((values) => {
      appendActivity('内部评审', values.type)
      message.success(`内部评审流程已发起：${values.type}`)
      setReviewModalOpen(false)
      reviewForm.resetFields()
    })
  }

  const handleEvaluate = () => {
    sessionStorage.setItem(OPPORTUNITY_STORAGE_KEY, JSON.stringify([detail.id]))
    navigate('/opportunity/evaluation')
  }

  const handleClaimOwner = () => {
    const nextList = updateOpportunityById(workflowList, detail.id, {
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      marked: true,
      tags: Array.from(new Set([...(detail.tags || []), '重点跟进'])),
      updatedAt: new Date().toLocaleString('zh-CN'),
    })
    persistWorkflow(nextList, '已认领为该商机负责人')
    appendActivity('认领', '成为负责人')
  }

  const handleAssign = () => {
    assignForm.validateFields().then((values) => {
      const user = USERS.find((u) => u.id === values.userId)
      if (!user) return
      const nextList = updateOpportunityById(workflowList, detail.id, {
        assignedUserId: user.id,
        assignedUserName: user.name,
        assignedTo: user.dept,
        group: values.group || detail.group,
        updatedAt: new Date().toLocaleString('zh-CN'),
      })
      persistWorkflow(nextList, `已指派给 ${user.name}`)
      appendActivity('分配', user.name)
      setAssignModalOpen(false)
      assignForm.resetFields()
    })
  }

  const handleMarkSubmit = (values) => {
    let tags = [...(detail.tags || [])]
    if (values.presetTags?.length) tags = [...tags, ...values.presetTags]
    if (values.customTag?.trim()) tags.push(values.customTag.trim())
    if (values.removeTags?.length) tags = tags.filter((t) => !values.removeTags.includes(t))
    const nextList = updateOpportunityById(workflowList, detail.id, {
      tags: Array.from(new Set(tags)),
      marked: true,
      updatedAt: new Date().toLocaleString('zh-CN'),
    })
    persistWorkflow(nextList, '商机标记已更新')
    appendActivity('标记', tags.slice(-2).join('、'))
  }

  const handleGroupSubmit = (values) => {
    const targetGroup = values.newGroup?.trim() || values.group
    const nextList = updateOpportunityById(workflowList, detail.id, {
      group: targetGroup,
      updatedAt: new Date().toLocaleString('zh-CN'),
    })
    persistWorkflow(nextList, `已归入「${targetGroup}」`)
    appendActivity('分组', targetGroup)
  }

  const handleAssignSubmit = (values) => {
    const user = USERS.find((u) => u.id === values.userId)
    if (!user) return
    const nextList = updateOpportunityById(workflowList, detail.id, {
      assignedUserId: user.id,
      assignedUserName: user.name,
      assignedTo: user.dept,
      group: values.group || detail.group,
      ...(values.setOwner ? { ownerId: user.id, ownerName: user.name, marked: true } : {}),
      updatedAt: new Date().toLocaleString('zh-CN'),
    })
    persistWorkflow(nextList, `已分配给 ${user.name}`)
    appendActivity('分配', user.name)
  }

  const handleFavoriteSubmit = (values) => {
    let nextList
    if (values.action === 'unfavorite') {
      nextList = updateOpportunityById(workflowList, detail.id, {
        favoriteUserIds: (detail.favoriteUserIds || []).filter((uid) => uid !== currentUser.id),
        favorited: (detail.favoriteUserIds || []).filter((uid) => uid !== currentUser.id).length > 0,
      })
    } else {
      const favIds = new Set(detail.favoriteUserIds || [])
      favIds.add(currentUser.id)
      nextList = updateOpportunityById(workflowList, detail.id, {
        favoriteUserIds: [...favIds],
        favorited: true,
      })
    }
    persistWorkflow(
      nextList,
      values.action === 'unfavorite' ? '已取消收藏' : '已收藏，可在「我的商机 → 收藏夹」查看',
    )
  }

  const handleExportSubmit = (values) => {
    exportOpportunitiesToCsv([detail], USERS, values.filename || `商机_${detail.id}`, values.fields)
    message.success('商机详情已导出（CSV）')
  }

  if (!detail) {
    return (
      <div className="opportunity-page">
        <Result
          status="404"
          title="商机不存在"
          subTitle={`未找到 ID 为 ${id} 的商机，可能已被移除或链接有误。`}
          extra={[
            <Button type="primary" key="list" onClick={() => navigate('/opportunity/classify?tab=list')}>返回商机列表</Button>,
            <Button key="classify" onClick={() => navigate('/opportunity/classify')}>商机识别</Button>,
          ]}
        />
      </div>
    )
  }

  const competitorColumns = [
    { title: '竞争对手', dataIndex: 'name', key: 'name', width: 120 },
    { title: '份额', dataIndex: 'share', key: 'share', width: 60 },
    { title: '产品结构', dataIndex: 'productStructure', key: 'productStructure', ellipsis: true },
    { title: '核心优势', dataIndex: 'advantage', key: 'advantage', ellipsis: true },
    { title: '主要劣势', dataIndex: 'weakness', key: 'weakness', ellipsis: true },
    { title: '定价策略', dataIndex: 'pricing', key: 'pricing', width: 80 },
    { title: '营销与渠道', dataIndex: 'marketingChannel', key: 'marketingChannel', ellipsis: true },
  ]

  const eventTypeColor = { 扩产: 'green', 融资: 'blue', 并购: 'purple', 新品发布: 'cyan', 合规: 'default' }

  const analysisTabs = [
    {
      key: 'market',
      label: '市场环境',
      children: (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="GDP增速">{detail.market.gdpGrowth}%</Descriptions.Item>
              <Descriptions.Item label="通胀水平">{detail.market.inflation}%</Descriptions.Item>
              <Descriptions.Item label="汇率波动">{detail.market.exchangeVolatility}</Descriptions.Item>
              <Descriptions.Item label="政社稳定性">{detail.market.stability}</Descriptions.Item>
              <Descriptions.Item label="行业规模">{detail.market.industrySize}</Descriptions.Item>
              <Descriptions.Item label="行业趋势">{detail.market.industryTrend}</Descriptions.Item>
              <Descriptions.Item label="需求特征" span={2}>{detail.market.demandFeatures}</Descriptions.Item>
              <Descriptions.Item label="消费偏好" span={2}>{detail.market.consumptionPreference || detail.market.demandFeatures}</Descriptions.Item>
              <Descriptions.Item label="商业惯例" span={2}>{detail.market.businessPractices || detail.market.cultureTips}</Descriptions.Item>
              <Descriptions.Item label="进入难度">
                <Tag color={detail.market.entryDifficulty === '高' || detail.market.entryDifficulty === '中高' ? 'orange' : 'green'}>
                  {detail.market.entryDifficulty || '中'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="长期可持续性">{detail.market.longTermSustainability || '—'}</Descriptions.Item>
            </Descriptions>
            <Card size="small" title="文化习俗与贸易影响提示" style={{ marginTop: 12 }}>
              <List
                size="small"
                dataSource={detail.market.tradeImpactTips || []}
                renderItem={(tip) => (
                  <List.Item>
                    <Text strong style={{ minWidth: 96 }}>{tip.label}：</Text>
                    <Text>{tip.value}</Text>
                  </List.Item>
                )}
              />
              {!detail.market.tradeImpactTips?.length && (
                <Text type="secondary">{detail.market.cultureTips}</Text>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>宏观需求与 GDP 走势</Text>
            <div className="detail-chart-box detail-chart-box-sm">
              {macroTrendData.length > 0 ? (
                <DualAxes
                  xField="year"
                  height={220}
                  legend={{ color: { position: 'top' } }}
                  tooltip={{ title: (d) => d.year }}
                  children={[
                    {
                      data: macroTrendColumnData,
                      type: 'interval',
                      yField: 'demand',
                      colorField: 'metric',
                      scale: { color: { range: ['#B32620'] } },
                      axis: { y: { title: '需求指数' } },
                      style: { maxWidth: 36 },
                    },
                    {
                      data: macroTrendLineData,
                      type: 'line',
                      yField: 'gdp',
                      colorField: 'metric',
                      shapeField: 'smooth',
                      scale: { color: { range: ['#1677ff'] }, y: { independent: true } },
                      axis: { y: { position: 'right', title: 'GDP增速指数' } },
                      style: { lineWidth: 2 },
                    },
                  ]}
                />
              ) : (
                <Text type="secondary">暂无走势数据</Text>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>价格与需求季度走势</Text>
            <div className="detail-chart-box detail-chart-box-sm">
              <Line
                data={priceTrendLineData}
                xField="period"
                yField="value"
                seriesField="type"
                color={['#B32620', '#1677ff']}
                smooth
                height={200}
              />
            </div>
          </Col>
        </Row>
      ),
    },
    {
      key: 'competition',
      label: '竞争格局',
      children: (
        <>
          <Row gutter={16} style={{ marginBottom: 12 }}>
            <Col xs={24} md={8}>
              <Card size="small">
                <Text type="secondary">行业集中度</Text>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{detail.competition.concentrationLevel ?? '—'}%</div>
                <Tag>{detail.competition.concentrationLabel || '—'}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" title="竞争拥挤区">
                <Space wrap>{(detail.competition.crowdedZones || []).map((z) => <Tag key={z} color="red">{z}</Tag>)}</Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" title="差异化突破空间">
                <Space wrap>{(detail.competition.differentiationSpaces || []).map((z) => <Tag key={z} color="green">{z}</Tag>)}</Space>
              </Card>
            </Col>
          </Row>
          <Paragraph type="secondary">{detail.competition.insight}</Paragraph>
          {detail.competition.relations?.length > 0 && (
            <div className="detail-competition-graph">
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>竞争关系图谱</Text>
              <div className="detail-competition-nodes">
                {detail.competition.relations.map((rel) => (
                  <div key={`${rel.from}-${rel.to}`} className="detail-competition-edge">
                    <Tag>{rel.from}</Tag>
                    <span className="detail-competition-arrow">→ {rel.relation} →</span>
                    <Tag color="blue">{rel.to}</Tag>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Row gutter={16}>
            <Col xs={24} lg={14}>
              <Table rowKey="name" size="small" pagination={false} columns={competitorColumns} dataSource={detail.competition.competitors} />
            </Col>
            <Col xs={24} lg={10}>
              <div className="detail-chart-box">
                <Scatter
                  data={detail.competition.matrix}
                  xField="price"
                  yField="quality"
                  sizeField="share"
                  colorField="name"
                  height={260}
                  xAxis={{ title: { text: '价格定位' } }}
                  yAxis={{ title: { text: '质量定位' } }}
                  label={{ text: (d) => d.name }}
                />
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>竞争定位矩阵：气泡大小映射市场份额</Text>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'buyer',
      label: '目标买家',
      children: (
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="企业名称">{detail.buyer.companyName}</Descriptions.Item>
              <Descriptions.Item label="统一社会信用代码">{detail.buyer.creditCode}</Descriptions.Item>
              <Descriptions.Item label="注册地址">{detail.buyer.registeredAddress || '—'}</Descriptions.Item>
              <Descriptions.Item label="所属行业">{detail.buyer.industry || detail.product}</Descriptions.Item>
              <Descriptions.Item label="成立年份">{detail.buyer.establishedYear || '—'}</Descriptions.Item>
              <Descriptions.Item label="历史采购">{detail.buyer.purchaseHistory}</Descriptions.Item>
              <Descriptions.Item label="采购频率">{detail.buyer.purchaseFrequency || '—'}</Descriptions.Item>
              <Descriptions.Item label="采购规模">{detail.buyer.purchaseScale || detail.buyerPurchaseScale}</Descriptions.Item>
              <Descriptions.Item label="主要采购品类">{(detail.buyer.categories || []).join('、')}</Descriptions.Item>
              <Descriptions.Item label="关键联系人">
                {detail.buyer.contact.name}
                {detail.buyer.contact.title ? ` · ${detail.buyer.contact.title}` : ''}
                <br />
                {detail.buyer.contact.email} · {detail.buyer.contact.phone}
              </Descriptions.Item>
              <Descriptions.Item label="信用报告摘要">{detail.buyer.creditSummary}</Descriptions.Item>
              <Descriptions.Item label="支付行为特征">{detail.buyer.paymentBehavior}</Descriptions.Item>
              <Descriptions.Item label="违约风险评估">
                <Tag color={detail.buyer.defaultRisk === '低' ? 'success' : 'warning'}>{detail.buyer.defaultRisk || '中'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="社交活跃度">{detail.buyer.socialActivity}</Descriptions.Item>
            </Descriptions>
            {(detail.buyer.socialMedia || []).length > 0 && (
              <Card size="small" title="社交媒体活跃度" style={{ marginTop: 12 }}>
                <Table
                  rowKey="platform"
                  size="small"
                  pagination={false}
                  dataSource={detail.buyer.socialMedia}
                  columns={[
                    { title: '平台', dataIndex: 'platform', key: 'platform' },
                    { title: '活跃度', dataIndex: 'activity', key: 'activity', width: 80 },
                    { title: '说明', key: 'note', render: (_, r) => r.followers || r.note || '—' },
                  ]}
                />
              </Card>
            )}
          </Col>
          <Col xs={24} lg={10}>
            <Card size="small" title="买家信用表现" style={{ marginBottom: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">综合信用评分</Text>
                  <Progress
                    percent={detail.buyerCreditScore || detail.creditScore}
                    strokeColor={detail.buyerCreditScore >= 85 ? '#52c41a' : '#faad14'}
                    format={() => `${detail.buyerCreditRating} · ${detail.buyerCreditScore}分`}
                  />
                </div>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="近12月采购">{detail.buyerPurchaseScale}</Descriptions.Item>
                  <Descriptions.Item label="合作年限">{detail.buyerCooperationYears ? `${detail.buyerCooperationYears} 年` : '尚无直接合作'}</Descriptions.Item>
                </Descriptions>
              </Space>
            </Card>
            <Card size="small" title="近期动态与舆情">
              <Timeline
                items={detail.buyer.news.map((n) => ({
                  color: n.sentiment === 'positive' ? 'green' : 'blue',
                  children: (
                    <div>
                      <Space>
                        {n.eventType && <Tag color={eventTypeColor[n.eventType] || 'default'}>{n.eventType}</Tag>}
                        <Text strong>{n.title}</Text>
                      </Space>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>{n.date}</div>
                    </div>
                  ),
                }))}
              />
            </Card>
            {(detail.buyer.majorEvents || []).length > 0 && (
              <Card size="small" title="重大事件" style={{ marginTop: 12 }}>
                <List
                  size="small"
                  dataSource={detail.buyer.majorEvents}
                  renderItem={(ev) => (
                    <List.Item>
                      <Tag color={eventTypeColor[ev.type] || 'blue'}>{ev.type}</Tag>
                      <Text>{ev.date} · {ev.desc}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </Col>
        </Row>
      ),
    },
    {
      key: 'product',
      label: '产品与供应链',
      children: (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="产品规格">{detail.productDetail.specs}</Descriptions.Item>
              <Descriptions.Item label="质量要求">{detail.productDetail.qualityRequirements || '—'}</Descriptions.Item>
              <Descriptions.Item label="质量认证">{(detail.productDetail.certifications || []).join('、')}</Descriptions.Item>
              <Descriptions.Item label="适用行业标准">
                {(detail.productDetail.industryStandards || [detail.productDetail.standards]).filter(Boolean).join(' · ')}
              </Descriptions.Item>
              <Descriptions.Item label="匹配度">
                <Progress percent={detail.productDetail.matchScore} size="small" strokeColor="#B32620" />
                {detail.productDetail.matchDesc}
              </Descriptions.Item>
              <Descriptions.Item label="差距与优势">{detail.productDetail.gapAnalysis || detail.productDetail.matchDesc}</Descriptions.Item>
              <Descriptions.Item label="区域供应链配套">{detail.productDetail.regionalSupply || detail.productDetail.supplyChain}</Descriptions.Item>
              <Descriptions.Item label="供应链配套">{detail.productDetail.supplyChain}</Descriptions.Item>
            </Descriptions>
            {detail.productDetail.feasibility && (
              <Card size="small" title="进入可行性评估" style={{ marginTop: 12 }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="成本层面">{detail.productDetail.feasibility.cost}</Descriptions.Item>
                  <Descriptions.Item label="交付层面">{detail.productDetail.feasibility.delivery}</Descriptions.Item>
                  <Descriptions.Item label="技术层面">{detail.productDetail.feasibility.technical}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title="潜在替代方案">
              <List
                size="small"
                dataSource={detail.productDetail.alternatives}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={`${item.region} · 价差 ${item.priceDiff} · 交期 ${item.leadTime}${item.note ? ` · ${item.note}` : ''}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
            <Card size="small" title="潜在合作模式" style={{ marginTop: 12 }}>
              <Space wrap>{(detail.cooperationModes || []).map((m) => <Tag key={m}>{m}</Tag>)}</Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'policy',
      label: '政策与法规',
      children: (
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            {detail.policy.tradeModeLink && (
              <Alert type="info" showIcon message="政策与贸易模式关联" description={detail.policy.tradeModeLink} style={{ marginBottom: 12 }} />
            )}
            <List
              dataSource={detail.policy.items}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        {item.title}
                        <Tag color={item.impact === '利好' ? 'success' : item.impact === '需关注' ? 'warning' : 'default'}>{item.impact}</Tag>
                      </Space>
                    }
                    description={
                      <>
                        <div>{item.detail}</div>
                        {item.extraCost && <Text type="warning" style={{ fontSize: 12 }}>潜在额外成本：{item.extraCost}</Text>}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Col>
          <Col xs={24} lg={10}>
            <Card size="small" title="政策红利" style={{ marginBottom: 12 }}>
              {detail.policy.bonusPoints.map((p) => <Tag key={p} color="success" style={{ marginBottom: 4 }}>{p}</Tag>)}
            </Card>
            <Card size="small" title="合规风险提示" style={{ marginBottom: 12 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {detail.policy.complianceRisks.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Card>
            {detail.policy.extraCostEstimate && (
              <Card size="small" title="合规成本预估">
                <Text>{detail.policy.extraCostEstimate}</Text>
              </Card>
            )}
          </Col>
        </Row>
      ),
    },
    {
      key: 'logistics',
      label: '物流与通关',
      children: (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card size="small" title="主要港口/节点" style={{ marginBottom: 12 }}>
              <Table
                rowKey="name"
                size="small"
                pagination={false}
                dataSource={detail.logistics.ports}
                columns={[
                  { title: '节点', dataIndex: 'name', key: 'name' },
                  { title: '吞吐', dataIndex: 'throughput', key: 'throughput', width: 70 },
                  { title: '拥堵', dataIndex: 'congestion', key: 'congestion', width: 70 },
                  { title: '能力', dataIndex: 'capacity', key: 'capacity', ellipsis: true },
                ]}
              />
            </Card>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="清关复杂度">{detail.logistics.customsComplexity}</Descriptions.Item>
              <Descriptions.Item label="通关模式">{(detail.logistics.customsModes || []).join(' · ')}</Descriptions.Item>
              <Descriptions.Item label="履约评估">{detail.logistics.feasibility}</Descriptions.Item>
              <Descriptions.Item label="交付稳定性">{detail.logistics.deliveryStability || '—'}</Descriptions.Item>
              <Descriptions.Item label="报价策略建议">{detail.logistics.quoteStrategyHint || '—'}</Descriptions.Item>
              <Descriptions.Item label="推荐货代">{(detail.logistics.agents || []).join('、')}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title="运输方案对比">
              <Table
                rowKey="mode"
                size="small"
                pagination={false}
                dataSource={detail.logistics.routes}
                columns={[
                  { title: '方式', dataIndex: 'mode', key: 'mode', width: 70 },
                  { title: '成本', dataIndex: 'cost', key: 'cost' },
                  { title: '时效', dataIndex: 'duration', key: 'duration', width: 90 },
                  { title: '可靠性', dataIndex: 'reliability', key: 'reliability', width: 70 },
                  { title: '说明', dataIndex: 'note', key: 'note', ellipsis: true },
                ]}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
  ]

  return (
    <div className="opportunity-page opportunity-detail-page">
      <div className="business-page-header detail-page-header">
        <h1 className="page-title">商机详情 · 一商机一全景</h1>
        <p className="page-description">
          连接数据洞察与业务决策的核心枢纽 · 市场—竞争—买家—产品—政策—履约 六维交叉分析 · 支撑从发现商机到确认价值
        </p>
      </div>

      <div className="detail-top-bar">
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/opportunity/classify?tab=list')}>
            返回商机列表
          </Button>
          <Button onClick={() => navigate('/opportunity/classify?tab=mine')}>我的商机</Button>
          <Button disabled={!prevId} icon={<LeftOutlined />} onClick={() => prevId && navigate(`/opportunity/detail/${prevId}`)}>
            上一条
          </Button>
          <Button disabled={!nextId} icon={<RightOutlined />} onClick={() => nextId && navigate(`/opportunity/detail/${nextId}`)}>
            下一条
          </Button>
          {navIds.length > 1 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {navIndex + 1} / {navIds.length}
            </Text>
          )}
        </Space>
        <Space wrap>
          <Button icon={<TagOutlined />} onClick={() => openActionModal('mark')}>标记</Button>
          <Button icon={<FolderAddOutlined />} onClick={() => openActionModal('group')}>分组</Button>
          <Button icon={<UserAddOutlined />} onClick={() => openActionModal('assign')}>分配</Button>
          <Button
            icon={isFavoritedBy(detail, currentUser.id) ? <HeartFilled style={{ color: '#B32620' }} /> : <HeartOutlined />}
            onClick={() => openActionModal('favorite')}
          >
            {isFavoritedBy(detail, currentUser.id) ? '已收藏' : '收藏'}
          </Button>
          <Button icon={<ExportOutlined />} onClick={() => openActionModal('export')}>导出</Button>
          <Button onClick={handleClaimOwner}>认领负责人</Button>
          <Button icon={<FileTextOutlined />} onClick={() => navigate('/opportunity/report/generate', { state: { preselect: [detail.id] } })}>
            评估报告
          </Button>
          <Button type="primary" icon={<RocketOutlined />} onClick={handleEvaluate}>送评估排序</Button>
        </Space>
      </div>

      {detail.dynamicAlert && (
        <Alert
          type="warning"
          showIcon
          icon={<ThunderboltOutlined />}
          style={{ marginBottom: 16 }}
          message="商机关键信息已更新"
          description={`${detail.dynamicAlert.message} · ${detail.dynamicAlert.time} — 请结合下方多维分析复核后再做决策。`}
          action={
            <Button size="small" onClick={() => navigate('/opportunity/classify?tab=list')}>
              返回列表刷新
            </Button>
          }
        />
      )}

      <div className="detail-anchor-nav">
        <Text type="secondary">快速定位：</Text>
        {DETAIL_SECTIONS.map((section) => (
          <Button key={section.key} type="link" size="small" onClick={() => scrollToDetailSection(section.key)}>
            {section.label}
          </Button>
        ))}
      </div>

      <div className="detail-lineage-bar">
        <Text type="secondary">数据链路：</Text>
        <Steps
          size="small"
          current={3}
          className="detail-lineage-steps"
          items={[
            { title: '数据源', onClick: () => navigate('/data/config') },
            { title: '清洗预处理', onClick: () => navigate('/data/quality') },
            { title: '商机识别', onClick: () => navigate('/opportunity/classify?tab=list') },
            { title: '详情洞察' },
            { title: '评估排序', onClick: () => handleEvaluate() },
            { title: '评估报告', onClick: () => navigate('/opportunity/report/generate', { state: { preselect: [detail.id] } }) },
          ].map((item) => ({
            title: (
              <span
                className={item.onClick ? 'detail-lineage-link' : undefined}
                onClick={item.onClick}
                onKeyDown={item.onClick ? (e) => e.key === 'Enter' && item.onClick() : undefined}
                role={item.onClick ? 'button' : undefined}
                tabIndex={item.onClick ? 0 : undefined}
              >
                {item.title}
              </span>
            ),
          }))}
        />
      </div>

      <div className="opportunity-workflow-bar detail-workflow-bar">
        <Text type="secondary">商机转化：</Text>
        <Button type="link" size="small" onClick={() => openActionModal('mark')}>① 标记</Button>
        <Button type="link" size="small" onClick={() => openActionModal('group')}>② 分组</Button>
        <Button type="link" size="small" onClick={() => openActionModal('assign')}>③ 分配</Button>
        <Button type="link" size="small" onClick={() => openActionModal('favorite')}>④ 收藏</Button>
        <Button type="link" size="small" onClick={() => openActionModal('export')}>⑤ 导出</Button>
        <Button type="link" size="small" onClick={() => navigate('/opportunity/classify?tab=mine')}>⑥ 我的商机</Button>
        <Button type="link" size="small" onClick={handleEvaluate}>⑦ 评估排序 →</Button>
        <Button type="link" size="small" onClick={() => navigate('/opportunity/report/generate', { state: { preselect: [detail.id] } })}>
          ⑧ 评估报告
        </Button>
      </div>

      <Card className="detail-summary-card" id="detail-section-summary">
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} lg={14}>
            <Space direction="vertical" size={8}>
              <Space wrap align="center">
                <Title level={3} style={{ margin: 0 }}>{detail.name}</Title>
                {detail.dynamicAlert && (
                  <Badge dot>
                    <Tag color="warning">{detail.dynamicAlert.message}</Tag>
                  </Badge>
                )}
              </Space>
              <Space wrap>
                <Text type="secondary">ID：{detail.id}</Text>
                <Divider type="vertical" />
                <Text>商机来源：</Text>
                <Tag color="#B32620">{formatGeoLocation(detail)}</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {detail.geoMacro} · {detail.geoCountry} · {detail.geoCity}
                </Text>
                <Divider type="vertical" />
                <Text>目标市场：</Text>
                <Tag>{detail.country}</Tag>
                <Text>产品：</Text>
                <Tag>{typeof detail.product === 'string' ? detail.product : '—'}</Tag>
                <Text>跟进状态：</Text>
                <Select
                  size="small"
                  value={detail.followStatus}
                  style={{ width: 130 }}
                  options={DETAIL_FOLLOW_STATUS.map((s) => ({ value: s.value, label: s.label }))}
                  onChange={handleFollowChange}
                />
                <Tag color={followMeta.color}>{followMeta.label}</Tag>
              </Space>
              <Space wrap>
                {(detail.tags || []).map((t) => <Tag key={t}>{t}</Tag>)}
                <Tag>{detail.group || '未分组'}</Tag>
                <Text type="secondary">跟进：{detail.assignedUserName || detail.assignedTo || '待分配'}</Text>
                <Text type="secondary">负责人：{detail.ownerName || '—'}</Text>
                <Text type="secondary">最后更新：{detail.updatedAt || detail.createdAt}</Text>
              </Space>
              <div className="detail-dimension-scores">
                <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>维度得分：</Text>
                <span className="detail-dim-score">
                  <Text type="secondary">市场</Text>
                  <Progress percent={detail.marketScore} size="small" strokeColor="#B32620" showInfo={false} />
                  <Text>{detail.marketScore}</Text>
                </span>
                <span className="detail-dim-score">
                  <Text type="secondary">政策</Text>
                  <Progress percent={detail.policyScore} size="small" strokeColor="#1677ff" showInfo={false} />
                  <Text>{detail.policyScore}</Text>
                </span>
                <span className="detail-dim-score">
                  <Text type="secondary">信用</Text>
                  <Progress percent={detail.creditScore} size="small" strokeColor="#52c41a" showInfo={false} />
                  <Text>{detail.creditScore}</Text>
                </span>
              </div>
              <Space wrap>
                <Button size="small" icon={<DatabaseOutlined />} onClick={() => navigate('/data/quality')}>查看清洗批次</Button>
                <Button size="small" icon={<SafetyCertificateOutlined />} onClick={() => navigate('/risk/assessment')}>关联风险评估</Button>
                <Button size="small" onClick={() => navigate('/analysis/market')}>市场分析</Button>
                {(detail.linkedDataSources || []).slice(0, 2).map((ds) => (
                  <Button key={ds.id} size="small" type="link" onClick={() => navigate(ds.route)}>{ds.name}</Button>
                ))}
              </Space>
              <Button type="primary" icon={<RocketOutlined />} onClick={handleEvaluate} style={{ marginTop: 8 }}>
                确认价值 · 送评估排序
              </Button>
            </Space>
          </Col>
          <Col xs={24} lg={10}>
            <div className="detail-summary-metrics">
              <div className="detail-metric-main">
                <div className="detail-score">{detail.score}</div>
                <Text type="secondary">综合评分 · 评级 {detail.rating}</Text>
              </div>
              <div className="detail-metric-grid">
                <div><Text type="secondary">市场规模</Text><div>{detail.marketSize}</div></div>
                <div><Text type="secondary">收益区间</Text><div>{detail.revenueRange}</div></div>
                <div><Text type="secondary">风险等级</Text><div><Tag color={getRiskColor(detail.riskLevel)}>{detail.riskLevel}</Tag></div></div>
                <div><Text type="secondary">政策友好度</Text><div>{detail.policyFriendliness}%</div></div>
                <div><Text type="secondary">买家信用</Text><div>{detail.buyerCreditRating} · {detail.buyerCreditScore}分</div></div>
                <div><Text type="secondary">首次发现</Text><div>{detail.createdAt}</div></div>
              </div>
            </div>
          </Col>
        </Row>
        <Divider style={{ margin: '16px 0 12px' }} />
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <div className="detail-insight-block">
              <Text strong><BulbOutlined /> 核心判断</Text>
              <ul className="detail-insight-list">
                {(detail.keyInsights || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="detail-insight-block">
              <Text strong><ExclamationCircleOutlined /> 关键不确定性</Text>
              <ul className="detail-insight-list">
                {(detail.keyUncertainties || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="detail-insight-block">
              <Text strong><WarningOutlined /> 风险提示</Text>
              <Space direction="vertical" size={4} style={{ width: '100%', marginTop: 8 }}>
                {(detail.keyRisks || []).slice(0, 3).map((r) => (
                  <div key={r.type}>
                    <Tag color={getRiskColor(r.level)}>{r.type}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{r.desc}</Text>
                  </div>
                ))}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="多维深度分析" className="detail-section-card" id="detail-section-analysis">
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          围绕「市场—竞争—买家—产品—政策—履约」六大维度系统拆解，识别机会来源与风险边界
        </Paragraph>
        <div className="detail-dimension-pills">
          {ANALYSIS_DIMENSIONS.map((dim) => (
            <div
              key={dim.key}
              className={`detail-dimension-pill ${analysisTabKey === dim.key ? 'active' : ''}`}
              onClick={() => setAnalysisTabKey(dim.key)}
            >
              <div className="detail-dimension-pill-label">{dim.label}</div>
              <div className="detail-dimension-pill-desc">{dim.desc}</div>
            </div>
          ))}
        </div>
        <Tabs activeKey={analysisTabKey} onChange={setAnalysisTabKey} items={analysisTabs} />
        {detail.keyRisks?.length > 0 && (
          <>
            <Divider orientation="left">关键风险汇总</Divider>
            <Table
              rowKey="type"
              size="small"
              pagination={false}
              dataSource={detail.keyRisks}
              columns={[
                { title: '风险类型', dataIndex: 'type', key: 'type', width: 100 },
                { title: '等级', dataIndex: 'level', key: 'level', width: 80, render: (v) => <Tag color={getRiskColor(v)}>{v}</Tag> },
                { title: '说明', dataIndex: 'desc', key: 'desc' },
              ]}
            />
          </>
        )}
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card
            title="附件与证据"
            className="detail-section-card"
            id="detail-section-attachments"
            extra={
              <Segmented
                size="small"
                value={attachFilter}
                onChange={setAttachFilter}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'report', label: '报告' },
                  { value: 'policy', label: '政策' },
                  { value: 'analysis', label: '研究' },
                  { value: 'credit', label: '信用' },
                  { value: 'news', label: '新闻' },
                ]}
              />
            }
          >
            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
              行业报告、政策原文、权威统计与新闻报道 · 支持溯源至数据采集与清洗链路，确保评估有据可依、可追溯、可复核
              {detail.attachmentSummary && (
                <> · 共 {detail.attachmentSummary.total} 份 · 最近核验 {detail.attachmentSummary.lastVerified}</>
              )}
            </Paragraph>
            <Space wrap style={{ marginBottom: 12 }}>
              <Button size="small" icon={<DatabaseOutlined />} onClick={() => navigate('/data/config')}>原始数据来源</Button>
              <Button size="small" icon={<FileSearchOutlined />} onClick={() => navigate('/data/quality?tab=report')}>清洗报告复核</Button>
            </Space>
            <List
              dataSource={filteredAttachments}
              locale={{ emptyText: '暂无该类型附件' }}
              renderItem={(item) => {
                const meta = ATTACH_TYPE_MAP[item.type] || { label: item.type, color: 'default' }
                return (
                  <List.Item
                    actions={[
                      <Button key="t" type="link" size="small" onClick={() => setTraceAttach(item)}>溯源</Button>,
                      <Button key="v" type="link" size="small" icon={<LinkOutlined />} onClick={() => message.info(`打开：${item.name}`)}>查看</Button>,
                      <Button key="d" type="link" size="small" icon={<FilePdfOutlined />} onClick={() => message.success('下载任务已创建')}>下载</Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#B32620' }} />}
                      title={<Space>{item.name}<Tag color={meta.color}>{meta.label}</Tag></Space>}
                      description={`来源：${item.source} · ${item.date} · ${item.format}${item.dataSourceId ? ` · ${item.dataSourceId}` : ''}`}
                    />
                  </List.Item>
                )
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="协作与行动" className="detail-section-card" id="detail-section-collaboration">
            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
              跨部门评论讨论 · 销售任务 · 市场调研 · 内部评审 · 从「被分析对象」转化为「被执行事项」
            </Paragraph>
            <Space wrap style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<RocketOutlined />} onClick={handleEvaluate}>确认价值 · 送评估</Button>
              <Button icon={<SendOutlined />} onClick={() => setTaskModalOpen(true)}>创建销售任务</Button>
              <Button icon={<FileSearchOutlined />} onClick={() => setResearchModalOpen(true)}>安排市场调研</Button>
              <Button icon={<UserAddOutlined />} onClick={() => setAssignModalOpen(true)}>指派跟进人</Button>
              <Button icon={<AuditOutlined />} onClick={() => setReviewModalOpen(true)}>发起评审</Button>
              <Button icon={<ExportOutlined />} onClick={() => navigate('/opportunity/report/generate', { state: { preselect: [detail.id] } })}>生成评估报告</Button>
            </Space>
            <Steps
              size="small"
              current={detail.followStatus === 'pending' ? 0 : detail.followStatus === 'focus' ? 1 : detail.followStatus === 'negotiation' ? 2 : 1}
              style={{ marginBottom: 16 }}
              items={[
                { title: '待评估', description: '详情研判' },
                { title: '重点跟进', description: '协作行动' },
                { title: '进入谈判', description: '执行落地' },
              ]}
            />
            <Divider orientation="left">讨论记录</Divider>
            <div className="detail-comment-input">
              <Input.TextArea
                rows={2}
                placeholder={`发表评论，以 ${currentUser.name} 身份参与讨论...`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button type="primary" icon={<MessageOutlined />} style={{ marginTop: 8 }} onClick={handleAddComment}>发布评论</Button>
            </div>
            <List
              className="detail-discussion-list"
              dataSource={discussions}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<TeamOutlined />} />}
                    title={<Space><Text strong>{item.user}</Text><Tag>{item.dept}</Tag><Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text></Space>}
                    description={item.content}
                  />
                </List.Item>
              )}
            />
            {activityLog.length > 0 && (
              <>
                <Divider orientation="left">本次操作记录</Divider>
                <Timeline
                  className="detail-activity-timeline"
                  items={activityLog.slice(0, 6).map((item) => ({
                    color: '#B32620',
                    children: (
                      <div>
                        <Text strong>{item.action}</Text>
                        <Text type="secondary"> · {item.detail}</Text>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.user} · {item.time}</div>
                      </div>
                    ),
                  }))}
                />
              </>
            )}
          </Card>
        </Col>
      </Row>

      <OpportunityActionModals
        action={actionModal}
        onClose={closeActionModal}
        targets={actionTargets}
        currentUser={currentUser}
        users={USERS}
        groupOptions={GROUP_OPTIONS}
        sortedCount={1}
        onMark={handleMarkSubmit}
        onGroup={handleGroupSubmit}
        onAssign={handleAssignSubmit}
        onFavorite={handleFavoriteSubmit}
        onExport={handleExportSubmit}
      />

      <Modal title="安排市场调研" open={researchModalOpen} onCancel={() => setResearchModalOpen(false)} onOk={handleCreateResearch} destroyOnClose>
        <Form form={researchForm} layout="vertical" initialValues={{ assignee: currentUser.dept }}>
          <Form.Item label="调研主题" name="topic" rules={[{ required: true, message: '请输入调研主题' }]}>
            <Input placeholder="如：目标市场渠道与定价调研" />
          </Form.Item>
          <Form.Item label="执行部门/人员" name="assignee" rules={[{ required: true }]}>
            <Select options={['市场分析部', '东南亚业务组', '欧洲业务组', '风控部'].map((i) => ({ label: i, value: i }))} />
          </Form.Item>
          <Form.Item label="调研重点" name="focus">
            <Input.TextArea rows={3} placeholder="如需验证的竞争格局、买家背景、政策合规点等" />
          </Form.Item>
          <Form.Item label="期望完成时间" name="deadline">
            <Input placeholder="如：2026-07-20" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="创建销售任务" open={taskModalOpen} onCancel={() => setTaskModalOpen(false)} onOk={handleCreateTask} destroyOnClose>
        <Form form={taskForm} layout="vertical">
          <Form.Item label="任务标题" name="title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="负责人" name="owner" rules={[{ required: true }]}>
            <Select options={['东南亚业务组', '欧洲业务组', '美洲业务组', '重点培育组'].map((i) => ({ label: i, value: i }))} />
          </Form.Item>
          <Form.Item label="截止日期" name="deadline"><Input placeholder="如：2026-07-15" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="发起内部评审" open={reviewModalOpen} onCancel={() => setReviewModalOpen(false)} onOk={handleStartReview} destroyOnClose>
        <Form form={reviewForm} layout="vertical">
          <Form.Item label="评审类型" name="type" rules={[{ required: true }]}>
            <Select options={[{ value: 'risk', label: '风控评审' }, { value: 'business', label: '业务立项评审' }, { value: 'compliance', label: '合规评审' }]} />
          </Form.Item>
          <Form.Item label="评审说明" name="note"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="指派跟进人员" open={assignModalOpen} onCancel={() => setAssignModalOpen(false)} onOk={handleAssign} destroyOnClose>
        <Form form={assignForm} layout="vertical" initialValues={{ userId: detail.assignedUserId || currentUser.id, group: detail.group }}>
          <Form.Item label="跟进人员" name="userId" rules={[{ required: true }]}>
            <Select options={USERS.map((u) => ({ value: u.id, label: `${u.name} · ${u.dept}` }))} />
          </Form.Item>
          <Form.Item label="调整分组" name="group">
            <Select allowClear options={GROUP_OPTIONS.map((i) => ({ label: i, value: i }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="证据材料溯源"
        open={!!traceAttach}
        onCancel={() => setTraceAttach(null)}
        footer={[
          <Button key="close" onClick={() => setTraceAttach(null)}>关闭</Button>,
          <Button key="data" type="primary" onClick={() => { navigate('/data/quality?tab=report'); setTraceAttach(null) }}>查看数据血缘</Button>,
        ]}
      >
        {traceAttach && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="材料名称">{traceAttach.name}</Descriptions.Item>
            <Descriptions.Item label="类型">{ATTACH_TYPE_MAP[traceAttach.type]?.label || traceAttach.type}</Descriptions.Item>
            <Descriptions.Item label="来源机构">{traceAttach.source}</Descriptions.Item>
            <Descriptions.Item label="关联数据源">{traceAttach.dataSourceId || '—'}</Descriptions.Item>
            <Descriptions.Item label="处理链路">{traceAttach.tracePath || '—'}</Descriptions.Item>
            <Descriptions.Item label="采集时间">{traceAttach.date}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
