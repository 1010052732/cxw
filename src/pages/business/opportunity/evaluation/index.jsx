import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Modal,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Tree,
  Typography,
} from 'antd'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BellOutlined,
  FileTextOutlined,
  FundOutlined,
  StarFilled,
  StarOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons'
import { Radar, Scatter } from '@ant-design/charts'
import { useNavigate } from 'react-router-dom'
import ExportButton from '../../../../components/ExportButton'
import { saveReportConfig } from '../../../../utils/reportStorage'
import { useAuth } from '../../../../auth/AuthContext'
import { OPPORTUNITY_SCOPE_FIELDS } from '../../../../constants/dataScope'
import { USERS } from '../../../../mock/rbac'
import {
  CREDIT_RATING_ORDER,
  SORT_MODES,
  STRATEGIC_KEYWORDS,
} from '../../../../mock/opportunity'
import IndicatorSettingsTab from './IndicatorSettingsTab'
import {
  loadActiveCustomId,
  loadActiveSchemeName,
  loadCustomEnabled,
  loadCustomIndicators,
  loadEvalThresholds,
  loadEvalWeights,
  loadSavedSchemes,
  loadSubWeights,
  saveEvalThresholds,
  saveEvalWeights,
} from './evaluationIndicatorStore'
import {
  loadOpportunities,
  persistEvaluatedScores,
  saveOpportunities,
  toggleFavoriteForUser,
} from '../opportunityStore'
import {
  EVALUATION_THRESHOLDS_KEY,
  EVALUATION_WEIGHTS_KEY,
  OPPORTUNITY_STORAGE_KEY,
  applyManualOrder,
  drillDownToTreeData,
  evaluateOpportunities,
  getDrillDown,
  getRankIcon,
  sortOpportunities,
  formatGeoLocation,
} from '../utils'
import '../opportunity.css'

const { Text, Paragraph } = Typography

function EllipsisText({ text, width = 160 }) {
  return (
    <Tooltip title={text}>
      <span className="opportunity-ellipsis" style={{ maxWidth: width }}>{text}</span>
    </Tooltip>
  )
}

export default function OpportunityEvaluationPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { currentUser, filterModuleData } = useAuth()
  const [activeTab, setActiveTab] = useState('indicators')
  const [weights, setWeights] = useState(() => loadEvalWeights())
  const [subWeights, setSubWeights] = useState(() => loadSubWeights())
  const [thresholds, setThresholds] = useState(() => loadEvalThresholds())
  const [customFormulas, setCustomFormulas] = useState(() => loadCustomIndicators())
  const [customPreset, setCustomPreset] = useState(() => {
    const list = loadCustomIndicators()
    const activeId = loadActiveCustomId()
    return list.find((p) => p.id === activeId) || list[0]
  })
  const [savedSchemes, setSavedSchemes] = useState(() => loadSavedSchemes())
  const [customEnabled, setCustomEnabled] = useState(() => loadCustomEnabled())
  const [activeSchemeName, setActiveSchemeName] = useState(() => loadActiveSchemeName())
  const [sortMode, setSortMode] = useState('score')
  const [resourceBudget, setResourceBudget] = useState(30)
  const [strategicKeywords, setStrategicKeywords] = useState(STRATEGIC_KEYWORDS)
  const [manualOrder, setManualOrder] = useState([])
  const [pinnedIds, setPinnedIds] = useState([])
  const [starredIds, setStarredIds] = useState([])
  const [adjustments, setAdjustments] = useState([])
  const [rankAlert, setRankAlert] = useState(null)
  const [selectedCompareKeys, setSelectedCompareKeys] = useState([])
  const [drillItem, setDrillItem] = useState(null)
  const [adjustModal, setAdjustModal] = useState(null)
  const [adjustForm] = Form.useForm()

  const [pool, setPool] = useState(() => loadOpportunities(USERS))
  const scopedPool = useMemo(
    () => filterModuleData(pool, 'opportunity', OPPORTUNITY_SCOPE_FIELDS),
    [pool, filterModuleData],
  )

  const sourceList = useMemo(() => {
    const stored = sessionStorage.getItem(OPPORTUNITY_STORAGE_KEY)
    let ids = []
    if (stored) {
      try {
        ids = JSON.parse(stored)
      } catch {
        ids = []
      }
    }
    const list = ids.length
      ? ids.map((id) => scopedPool.find((item) => item.id === id)).filter(Boolean)
      : scopedPool
    return list.length ? list : scopedPool
  }, [scopedPool])

  const weightSum = weights.market + weights.policy + weights.credit
  const weightValid = weightSum === 100

  const activeCustomPreset = customEnabled ? customPreset : null

  const evaluatedList = useMemo(
    () => evaluateOpportunities(sourceList, weights, thresholds, activeCustomPreset, {
      subWeights,
      creditRatingOrder: CREDIT_RATING_ORDER,
      allCustomPresets: customFormulas,
    }),
    [sourceList, weights, thresholds, activeCustomPreset, subWeights, customFormulas],
  )

  const sortedList = useMemo(() => {
    const sorted = sortOpportunities(evaluatedList, sortMode, { resourceBudget, strategicKeywords })
    if (manualOrder.length || pinnedIds.length) {
      return applyManualOrder(sorted, manualOrder, pinnedIds)
    }
    return sorted
  }, [evaluatedList, sortMode, resourceBudget, strategicKeywords, manualOrder, pinnedIds])

  useEffect(() => {
    sessionStorage.setItem(EVALUATION_WEIGHTS_KEY, JSON.stringify(weights))
    saveEvalWeights(weights)
  }, [weights])

  useEffect(() => {
    sessionStorage.setItem(EVALUATION_THRESHOLDS_KEY, JSON.stringify(thresholds))
    saveEvalThresholds(thresholds)
  }, [thresholds])

  useEffect(() => {
    if (evaluatedList.length && selectedCompareKeys.length === 0) {
      setSelectedCompareKeys(evaluatedList.slice(0, 3).map((i) => i.id))
    }
  }, [evaluatedList, selectedCompareKeys.length])

  const compareItems = useMemo(
    () => sortedList.filter((i) => selectedCompareKeys.includes(i.id)).slice(0, 5),
    [sortedList, selectedCompareKeys],
  )

  const radarData = useMemo(() => {
    const items = ['市场需求潜力', '政策环境友好度', '交易信用安全度']
    return compareItems.flatMap((item) => [
      { item: items[0], score: item.marketScore, type: item.name },
      { item: items[1], score: item.policyScore, type: item.name },
      { item: items[2], score: item.creditScore, type: item.name },
    ])
  }, [compareItems])

  const bubbleData = useMemo(
    () =>
      compareItems.map((item) => ({
        name: item.name,
        market: item.marketScore,
        risk: item.riskLevel === '低' ? 85 : item.riskLevel === '中' ? 65 : 45,
        size: item.compositeScore,
        country: item.country,
      })),
    [compareItems],
  )

  const handleReEvaluate = () => {
    if (!weightValid) {
      message.error('权重总和必须等于 100%')
      return
    }
    setManualOrder([])
    setPool((prev) => persistEvaluatedScores(prev, evaluatedList))
    setRankAlert({ type: 'info', text: '评估已完成，排序结果已基于最新指标配置更新，分数已同步至商机池' })
    message.success('量化评估已完成，分数已写回商机数据')
    setActiveTab('results')
  }

  const indicatorTab = (
    <IndicatorSettingsTab
      weights={weights}
      setWeights={setWeights}
      subWeights={subWeights}
      setSubWeights={setSubWeights}
      thresholds={thresholds}
      setThresholds={setThresholds}
      customFormulas={customFormulas}
      setCustomFormulas={setCustomFormulas}
      customPreset={customPreset}
      setCustomPreset={setCustomPreset}
      savedSchemes={savedSchemes}
      setSavedSchemes={setSavedSchemes}
      previewItem={sourceList[0]}
      onRunEvaluate={handleReEvaluate}
      weightValid={weightValid}
      weightSum={weightSum}
      customEnabled={customEnabled}
      setCustomEnabled={setCustomEnabled}
      activeSchemeName={activeSchemeName}
      setActiveSchemeName={setActiveSchemeName}
    />
  )

  const evalConfigSummary = `市场 ${weights.market}% · 政策 ${weights.policy}% · 信用 ${weights.credit}%`
    + (activeSchemeName ? ` · 方案「${activeSchemeName}」` : '')
    + (activeCustomPreset ? ` · 自定义「${activeCustomPreset.name}」` : '')
    + ` · 信用底线 ${thresholds.buyerCreditRatingMin} · 综合≥${thresholds.compositeMin}`

  const handleDynamicRefresh = () => {
    setRankAlert({
      type: 'warning',
      text: '检测到 2 条商机排名变动：墨西哥汽车零部件（信用下调）、波兰光伏组件（政策利好）',
    })
    message.warning('排名已动态更新，告警已推送相关责任人')
  }

  const handleMove = (id, direction) => {
    const ids = sortedList.map((i) => i.id)
    const idx = ids.indexOf(id)
    if (idx < 0) return
    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= ids.length) return
    ;[ids[idx], ids[target]] = [ids[target], ids[idx]]
    setManualOrder(ids)
    setAdjustModal({ id, direction: 'move' })
  }

  const handlePin = (id) => {
    setPinnedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
    setAdjustModal({ id, direction: 'pin' })
  }

  const handleStar = (id) => {
    setPool((prev) => {
      const next = prev.map((item) =>
        item.id === id ? toggleFavoriteForUser(item, currentUser.id) : item,
      )
      saveOpportunities(next)
      return next
    })
    setStarredIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
    message.success(starredIds.includes(id) ? '已取消重点关注' : '已标记重点关注并同步收藏')
  }

  const handleAdjustSubmit = () => {
    adjustForm.validateFields().then((values) => {
      const item = sortedList.find((i) => i.id === adjustModal.id)
      setAdjustments((prev) => [{
        id: Date.now(),
        oppId: adjustModal.id,
        oppName: item?.name,
        action: adjustModal.direction,
        reason: values.reason,
        time: new Date().toLocaleString('zh-CN'),
      }, ...prev])
      setAdjustModal(null)
      adjustForm.resetFields()
      message.success('人工调整记录已保存')
    })
  }

  const scoreCards = sortedList.slice(0, 4).map((item) => (
    <Col xs={24} sm={12} lg={6} key={item.id}>
      <Card
        size="small"
        className="eval-score-card"
        hoverable
        onClick={() => setDrillItem(item)}
        title={<EllipsisText text={item.name} width={180} />}
        extra={
          <Tag color={item.grade.color}>{item.grade.grade}</Tag>
        }
      >
        <div className="eval-score-card-main">{item.compositeScore}<span>/100</span></div>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <div><Text type="secondary">市场</Text><Progress percent={item.marketScore} size="small" strokeColor="#B32620" showInfo={false} /></div>
          <div><Text type="secondary">政策</Text><Progress percent={item.policyScore} size="small" strokeColor="#fa8c16" showInfo={false} /></div>
          <div><Text type="secondary">信用</Text><Progress percent={item.creditScore} size="small" strokeColor="#1677ff" showInfo={false} /></div>
        </Space>
        <Space wrap size={4} style={{ marginTop: 8 }}>
          {item.scoreTags.slice(0, 2).map((t) => <Tag key={t.text} color={t.color}>{t.text}</Tag>)}
          {activeCustomPreset && item.customIndex != null && (
            <Tag color="purple">{activeCustomPreset.name?.slice(0, 4)} {item.customIndex}</Tag>
          )}
          {!item.thresholdPassed && <Tag color="error">未过阈值</Tag>}
        </Space>
      </Card>
    </Col>
  ))

  const resultColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 70,
      render: (_, __, index) => <span className="evaluation-rank-badge">{getRankIcon(index + 1)}</span>,
    },
    {
      title: '商机',
      key: 'name',
      width: 180,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Space>
            {starredIds.includes(r.id) && <StarFilled style={{ color: '#B32620' }} />}
            {pinnedIds.includes(r.id) && <Tag color="red">置顶</Tag>}
            <EllipsisText text={r.name} width={140} />
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>{formatGeoLocation(r)} · 目标 {r.country}</Text>
        </Space>
      ),
    },
    {
      title: '综合得分',
      dataIndex: 'compositeScore',
      key: 'compositeScore',
      width: 90,
      render: (s, r) => (
        <Space>
          <Tag color="#B32620">{s}</Tag>
          <Tag color={r.grade.color}>{r.grade.grade}</Tag>
        </Space>
      ),
    },
    { title: '市场', dataIndex: 'marketScore', key: 'marketScore', width: 60 },
    { title: '政策', dataIndex: 'policyScore', key: 'policyScore', width: 60 },
    { title: '信用', dataIndex: 'creditScore', key: 'creditScore', width: 60 },
    ...(activeCustomPreset
      ? [{
          title: activeCustomPreset.name?.slice(0, 6) || '自定义',
          dataIndex: 'customIndex',
          key: 'customIndex',
          width: 72,
          render: (v) => (v != null ? <Tag>{v}</Tag> : '—'),
        }]
      : []),
    {
      title: '阈值',
      key: 'threshold',
      width: 80,
      render: (_, r) => r.thresholdPassed ? <Tag color="success">通过</Tag> : <Tag color="error">未通过</Tag>,
    },
    {
      title: '标签',
      key: 'tags',
      width: 140,
      render: (_, r) => r.scoreTags.slice(0, 1).map((t) => <Tag key={t.text} color={t.color}>{t.text}</Tag>),
    },
    {
      title: '钻取',
      key: 'drill',
      width: 70,
      render: (_, r) => <Button type="link" size="small" onClick={() => setDrillItem(r)}>分析</Button>,
    },
    {
      title: '对比',
      key: 'compare',
      width: 60,
      render: (_, r) => (
        <Checkbox
          checked={selectedCompareKeys.includes(r.id)}
          onChange={(e) => {
            const next = e.target.checked
              ? [...selectedCompareKeys, r.id]
              : selectedCompareKeys.filter((id) => id !== r.id)
            if (next.length > 5) { message.warning('最多 5 个'); return }
            setSelectedCompareKeys(next)
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, r) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => navigate(`/opportunity/detail/${r.id}`)}>详情</Button>
          <Button type="link" size="small" onClick={() => {
            saveReportConfig(r.id, { ids: [r.id], weights, scheme: '商机评估方案 V1', sections: null, combo: false })
            navigate(`/opportunity/report/${r.id}`)
          }}>报告</Button>
        </Space>
      ),
    },
  ]

  const resultsTab = (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="当前评估配置"
        description={evalConfigSummary}
        action={<Button size="small" onClick={() => setActiveTab('indicators')}>调整指标</Button>}
      />
      {rankAlert && (
        <Alert
          type={rankAlert.type}
          message={rankAlert.text}
          showIcon
          closable
          onClose={() => setRankAlert(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>{scoreCards}</Row>
      <div className="business-panel">
        <div className="evaluation-result-header">
          <Text>共 <strong>{sortedList.length}</strong> 条 · 通过阈值 <strong>{sortedList.filter((i) => i.thresholdPassed).length}</strong> 条</Text>
          <Space>
            <Button icon={<BellOutlined />} onClick={handleDynamicRefresh}>模拟动态更新</Button>
            <Button icon={<FileTextOutlined />} onClick={() => navigate('/opportunity/report/generate')}>生成报告</Button>
            <ExportButton icon={<FileTextOutlined />} onExport={() => message.success('Excel 导出任务已创建')}>导出</ExportButton>
          </Space>
        </div>
        <Table rowKey="id" size="middle" columns={resultColumns} dataSource={sortedList} pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 条` }} rowClassName={(_, i) => (i < 3 ? 'evaluation-top-row' : '')} />
      </div>
      <div className="evaluation-chart-panel">
        <Tabs items={[
          {
            key: 'radar',
            label: '雷达图对比',
            children: (
              <div className="evaluation-chart-container">
                <Radar data={radarData} xField="item" yField="score" seriesField="type" height={360} meta={{ score: { min: 0, max: 100 } }} color={['#B32620', '#1677ff', '#52c41a', '#faad14', '#722ed1']} />
              </div>
            ),
          },
          {
            key: 'bubble',
            label: '潜力-风险矩阵',
            children: (
              <>
                <div className="evaluation-chart-container">
                  <Scatter
                    data={bubbleData}
                    xField="market"
                    yField="risk"
                    sizeField="size"
                    colorField="name"
                    height={360}
                    xAxis={{ title: { text: '市场潜力' }, min: 60, max: 100 }}
                    yAxis={{ title: { text: '风险安全度(越高越安全)' }, min: 40, max: 100 }}
                    size={[12, 36]}
                  />
                </div>
                <Text type="secondary">X轴：市场潜力 · Y轴：风险安全度 · 气泡大小：综合得分</Text>
              </>
            ),
          },
        ]} />
        <Text type="secondary">已选 {compareItems.length}/5 个商机参与对比</Text>
      </div>
    </>
  )

  const rankingColumns = [
    ...resultColumns.slice(0, 3),
    sortMode === 'riskAdjusted' && { title: '风险调整分', dataIndex: 'riskAdjustedScore', key: 'riskAdjustedScore', width: 100 },
    sortMode === 'strategic' && { title: '战略契合', dataIndex: 'strategicFit', key: 'strategicFit', width: 90 },
    sortMode === 'resource' && { title: '资源计划', key: 'plan', width: 90, render: (_, r) => r.inResourcePlan ? <Tag color="success">入选</Tag> : <Tag>备选</Tag> },
    ...resultColumns.slice(3, -1),
    {
      title: '调整',
      key: 'adjust',
      width: 160,
      fixed: 'right',
      render: (_, r) => (
        <Space size={0}>
          <Button type="text" size="small" icon={<VerticalAlignTopOutlined />} onClick={() => handlePin(r.id)} />
          <Button type="text" size="small" icon={<ArrowUpOutlined />} onClick={() => handleMove(r.id, 'up')} />
          <Button type="text" size="small" icon={<ArrowDownOutlined />} onClick={() => handleMove(r.id, 'down')} />
          <Button type="text" size="small" icon={starredIds.includes(r.id) ? <StarFilled style={{ color: '#B32620' }} /> : <StarOutlined />} onClick={() => handleStar(r.id)} />
        </Space>
      ),
    },
  ].filter(Boolean)

  const rankingTab = (
    <>
      <div className="business-panel">
        <Row gutter={16} align="middle">
          <Col xs={24} lg={10}>
            <Text strong>智能排序视角</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={sortMode}
              options={SORT_MODES.map((m) => ({ value: m.value, label: m.label }))}
              onChange={setSortMode}
            />
            <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 13 }}>
              {SORT_MODES.find((m) => m.value === sortMode)?.desc}
            </Paragraph>
          </Col>
          {sortMode === 'resource' && (
            <Col xs={24} lg={8}>
              <Text strong>资源预算上限</Text>
              <Slider min={10} max={50} value={resourceBudget} onChange={setResourceBudget} marks={{ 10: '10', 30: '30', 50: '50' }} />
            </Col>
          )}
          {sortMode === 'strategic' && (
            <Col xs={24} lg={8}>
              <Text strong>战略关键词</Text>
              <Select mode="tags" style={{ width: '100%', marginTop: 8 }} value={[...strategicKeywords.regions, ...strategicKeywords.industries]} onChange={(v) => setStrategicKeywords({ regions: v.filter((x) => ['东南亚', '欧洲', '中东', '美洲'].includes(x)), industries: v.filter((x) => !['东南亚', '欧洲', '中东', '美洲'].includes(x)) })} />
            </Col>
          )}
          <Col xs={24} lg={6}>
            <Button type="primary" block icon={<FundOutlined />} onClick={() => message.success('排序已刷新')}>应用排序</Button>
          </Col>
        </Row>
      </div>
      <Table rowKey="id" size="middle" scroll={{ x: 1200 }} columns={rankingColumns} dataSource={sortedList} pagination={false} />
      {adjustments.length > 0 && (
        <div className="business-panel" style={{ marginTop: 16 }}>
          <h3 className="business-panel-title">人工干预记录</h3>
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={adjustments}
            columns={[
              { title: '商机', dataIndex: 'oppName', key: 'oppName' },
              { title: '操作', dataIndex: 'action', key: 'action', width: 80 },
              { title: '原因', dataIndex: 'reason', key: 'reason' },
              { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
            ]}
          />
        </div>
      )}
    </>
  )

  return (
    <div className="opportunity-page">
      <div className="opportunity-page-header">
        <Space style={{ marginBottom: 8 }}>
          <Button onClick={() => navigate('/opportunity/classify?tab=list')}>← 返回商机列表</Button>
          <Button onClick={() => navigate('/opportunity/classify?tab=mine')}>我的商机</Button>
          <Button type="primary" onClick={() => navigate('/opportunity/report/generate')}>生成评估报告 →</Button>
        </Space>
        <h1 className="page-title">商机评估</h1>
        <p className="page-description">指标设置 → 量化评估 → 多维对比 → 智能排序 · 算法建议 + 人工判断</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'indicators', label: '评估指标设置', children: indicatorTab },
          { key: 'results', label: '评估结果展示', children: resultsTab },
          { key: 'ranking', label: '商机排序调整', children: rankingTab },
        ]}
      />

      <Drawer
        title={drillItem ? `指标钻取 · ${drillItem.name}` : '指标钻取'}
        open={!!drillItem}
        onClose={() => setDrillItem(null)}
        width={520}
      >
        {drillItem && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="综合得分">{drillItem.compositeScore}</Descriptions.Item>
              <Descriptions.Item label="评级">{drillItem.grade.grade}</Descriptions.Item>
              <Descriptions.Item label="风险系数">{drillItem.riskCoef}</Descriptions.Item>
              <Descriptions.Item label="风险调整分">{drillItem.riskAdjustedScore}</Descriptions.Item>
            </Descriptions>
            <Tree defaultExpandAll treeData={drillDownToTreeData(getDrillDown(drillItem, weights, subWeights, activeCustomPreset))} />
            {drillItem.thresholdIssues?.length > 0 && (
              <>
                <Divider />
                <Text strong>阈值检查</Text>
                {drillItem.thresholdIssues.map((issue, i) => (
                  <Alert key={i} type={issue.level === 'block' ? 'error' : 'warning'} message={issue.msg} style={{ marginTop: 8 }} />
                ))}
              </>
            )}
          </>
        )}
      </Drawer>

      <Modal title="人工调整原因" open={!!adjustModal} onCancel={() => setAdjustModal(null)} onOk={handleAdjustSubmit} destroyOnClose>
        <Form form={adjustForm} layout="vertical">
          <Form.Item label="调整原因" name="reason" rules={[{ required: true }]}>
            <Select
              placeholder="选择或输入原因"
              options={[
                { value: '已有长期客户关系基础', label: '已有长期客户关系基础' },
                { value: '属于战略示范项目', label: '属于战略示范项目' },
                { value: '高层明确指示推进', label: '高层明确指示推进' },
                { value: '需要抢占窗口期', label: '需要抢占窗口期' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  )
}
