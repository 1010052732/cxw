import { useMemo } from 'react'
import { Badge, Button, Col, Empty, Row, Space, Tag, Typography } from 'antd'
import {
  AlertOutlined,
  ArrowRightOutlined,
  BellOutlined,
  FundProjectionScreenOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../auth/AuthContext'
import { usePlatform } from '../../../context/PlatformContext'
import { buildHomeDashboard } from '../../../mock/data-bridge'
import {
  HOME_DASHBOARD,
  buildFeaturedOpportunities,
  buildHomeTodos,
  summarizeHomeKpis,
} from '../../../mock/home'
import { USERS } from '../../../mock/rbac'
import { loadOpportunities } from '../opportunity/opportunityStore'
import OpportunityTrendChart from './OpportunityTrendChart'
import { buildOpportunityTrendSeries, getDefaultTrendRange, DEFAULT_TREND_GRANULARITY } from './opportunityTrend'
import '../business.css'

const { Text, Paragraph } = Typography

const levelColor = { 高: 'error', 中: 'warning', 低: 'success' }
const riskLevelColor = { 高: 'error', 中: 'warning', 低: 'success' }

export default function HomePage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { messages, unreadCount } = usePlatform()

  const dashboard = useMemo(() => {
    const opportunities = loadOpportunities(USERS)
    const live = buildHomeDashboard({ opportunityCount: opportunities.length })
    const featuredOpportunities = buildFeaturedOpportunities(opportunities)
    const todos = buildHomeTodos(opportunities, messages)
    const riskAlerts = HOME_DASHBOARD.riskAlerts
    const defaultTrend = buildOpportunityTrendSeries({
      opportunities,
      range: getDefaultTrendRange(DEFAULT_TREND_GRANULARITY),
      granularity: DEFAULT_TREND_GRANULARITY,
      currentTotal: live.opportunityTotal,
    })
    const kpis = summarizeHomeKpis({
      opportunityTotal: live.opportunityTotal,
      todos,
      riskAlerts,
      trendDelta: defaultTrend.summary.delta,
    })

    return {
      ...HOME_DASHBOARD,
      ...live,
      opportunities,
      featuredOpportunities,
      todos,
      riskAlerts,
      kpis,
      urgentTodoCount: todos.filter((item) => item.urgent).length,
    }
  }, [messages])

  const goTo = (path) => {
    if (path.includes('?')) {
      const [base, query] = path.split('?')
      navigate({ pathname: base, search: `?${query}` })
      return
    }
    navigate(path)
  }

  return (
    <div className="business-page home-v2">
      <section className="home-hero">
        <div className="home-hero-main">
          <Text type="secondary" className="home-hero-eyebrow">工作台</Text>
          <h1 className="home-hero-title">{currentUser.name}，您好</h1>
          <Paragraph className="home-hero-desc">
            今日有 <Text strong style={{ color: '#B32620' }}>{dashboard.todos.length}</Text> 项待办
            {dashboard.urgentTodoCount > 0 && (
              <>，其中 <Text strong style={{ color: '#fa541c' }}>{dashboard.urgentTodoCount}</Text> 项需优先处理</>
            )}
            。建议从重点商机与风险预警开始。
          </Paragraph>
        </div>
        <Space wrap className="home-hero-actions">
          <Button type="primary" icon={<FundProjectionScreenOutlined />} onClick={() => navigate('/opportunity/evaluation')}>
            商机评估
          </Button>
          <Button icon={<SafetyCertificateOutlined />} onClick={() => navigate('/risk/situation')}>
            风险态势
          </Button>
          <Badge count={unreadCount} size="small" offset={[-2, 2]}>
            <Button icon={<BellOutlined />} onClick={() => navigate('/message')}>
              消息中心
            </Button>
          </Badge>
        </Space>
      </section>

      <section className="home-kpi-row">
        <button type="button" className="home-kpi-card home-kpi-primary" onClick={() => navigate('/opportunity/classify')}>
          <div className="home-kpi-icon"><FundProjectionScreenOutlined /></div>
          <div className="home-kpi-body">
            <div className="home-kpi-value">{dashboard.opportunityTotal}</div>
            <div className="home-kpi-label">有效商机</div>
            <div className="home-kpi-sub">
              本周 {dashboard.kpis.trendDelta >= 0 ? '+' : ''}{dashboard.kpis.trendDelta} · 池内 {dashboard.cleanedRecords.toLocaleString()} 条
            </div>
          </div>
          <RightOutlined className="home-kpi-arrow" />
        </button>

        <button type="button" className="home-kpi-card" onClick={() => navigate('/message')}>
          <div className="home-kpi-icon home-kpi-icon-warn"><ThunderboltOutlined /></div>
          <div className="home-kpi-body">
            <div className="home-kpi-value">{dashboard.todos.length}</div>
            <div className="home-kpi-label">我的待办</div>
            <div className="home-kpi-sub">{dashboard.kpis.todoSummary}</div>
          </div>
          {dashboard.urgentTodoCount > 0 && <Badge count={dashboard.urgentTodoCount} />}
          <RightOutlined className="home-kpi-arrow" />
        </button>

        <button type="button" className="home-kpi-card" onClick={() => navigate('/risk/situation')}>
          <div className="home-kpi-icon home-kpi-icon-risk"><AlertOutlined /></div>
          <div className="home-kpi-body">
            <div className="home-kpi-value">{dashboard.riskAlerts.length}</div>
            <div className="home-kpi-label">风险预警</div>
            <div className="home-kpi-sub">{dashboard.kpis.highRiskCount} 项高危 · {dashboard.pendingRisks} 条待处置</div>
          </div>
          <RightOutlined className="home-kpi-arrow" />
        </button>
      </section>

      <Row gutter={[16, 16]} className="home-main-grid">
        <Col xs={24} xl={16}>
          <div className="business-panel home-panel">
            <div className="home-panel-head">
              <div>
                <h3 className="business-panel-title">重点商机</h3>
                <Text type="secondary">按综合得分排序 · 点击进入详情或评估</Text>
              </div>
              <Button type="link" onClick={() => navigate('/opportunity/classify')}>
                查看全部 <ArrowRightOutlined />
              </Button>
            </div>

            <div className="home-opp-list">
              {dashboard.featuredOpportunities.map((item, index) => (
                <div
                  key={item.id}
                  className={`home-opp-item ${index === 0 ? 'home-opp-item-top' : ''}`}
                  onClick={() => navigate(`/opportunity/detail/${item.id}`)}
                >
                  <div className="home-opp-rank">{index + 1}</div>
                  <div className="home-opp-content">
                    <div className="home-opp-title-row">
                      <Text strong ellipsis className="home-opp-name">{item.name}</Text>
                      <Tag color={riskLevelColor[item.riskLevel] || 'default'}>{item.riskLevel}风险</Tag>
                    </div>
                    <Text type="secondary" className="home-opp-meta">
                      {item.country} · {item.product} · 预期 {item.revenueRange}
                    </Text>
                    {item.alert && (
                      <Text type="warning" className="home-opp-alert">{item.alert}</Text>
                    )}
                    <Space size={4} wrap className="home-opp-tags">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Tag key={tag} bordered={false}>{tag}</Tag>
                      ))}
                    </Space>
                  </div>
                  <div className="home-opp-score">
                    <div className="home-opp-score-value">{item.score}</div>
                    <div className="home-opp-score-label">综合分</div>
                  </div>
                  <Space direction="vertical" size={4} className="home-opp-actions" onClick={(e) => e.stopPropagation()}>
                    <Button size="small" type="primary" ghost onClick={() => navigate('/opportunity/evaluation')}>评估</Button>
                    <Button size="small" onClick={() => navigate(`/opportunity/detail/${item.id}`)}>详情</Button>
                  </Space>
                </div>
              ))}
            </div>

            <OpportunityTrendChart
              opportunities={dashboard.opportunities}
              currentTotal={dashboard.opportunityTotal}
            />
          </div>
        </Col>

        <Col xs={24} xl={8}>
          <div className="business-panel home-panel home-side-panel">
            <div className="home-panel-head">
              <h3 className="business-panel-title">我的待办</h3>
              <Button type="link" size="small" onClick={() => navigate('/message')}>全部</Button>
            </div>
            {dashboard.todos.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待办" />
            ) : (
              <div className="home-todo-list">
                {dashboard.todos.map((item) => (
                  <div
                    key={item.id}
                    className={`home-todo-item ${item.urgent ? 'home-todo-urgent' : ''}`}
                    onClick={() => goTo(item.path)}
                  >
                    <div className="home-todo-head">
                      <Tag color={item.meta.color} bordered={false}>{item.meta.label}</Tag>
                      {item.urgent && <Tag color="error">优先</Tag>}
                      <Text type="secondary" className="home-todo-time">{item.time?.slice(5, 16)}</Text>
                    </div>
                    <Text strong className="home-todo-title">{item.title}</Text>
                    <Text type="secondary" className="home-todo-desc">{item.desc}</Text>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="business-panel home-panel home-side-panel">
            <div className="home-panel-head">
              <h3 className="business-panel-title">风险预警</h3>
              <Button type="link" size="small" onClick={() => navigate('/risk/identification')}>监测中心</Button>
            </div>
            <div className="home-risk-list">
              {dashboard.riskAlerts.map((item) => (
                <div
                  key={item.id}
                  className={`home-risk-item ${item.level === '高' ? 'home-risk-high' : ''}`}
                  onClick={() => goTo(item.path)}
                >
                  <Space size={6} wrap>
                    <Tag color={levelColor[item.level]}>{item.level}</Tag>
                    <Tag bordered={false}>{item.type}</Tag>
                  </Space>
                  <Text strong className="home-risk-title">{item.title}</Text>
                  <Button type="link" size="small" className="home-risk-action">立即处置 →</Button>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <section className="business-panel home-workflow-panel">
        <div className="home-panel-head">
          <div>
            <h3 className="business-panel-title">业务闭环路径</h3>
            <Text type="secondary">数据驱动商机与风险决策 · 点击阶段进入对应模块</Text>
          </div>
        </div>
        <div className="home-workflow-track">
          {dashboard.workflowPhases.map((phase, index) => (
            <div key={phase.key} className="home-workflow-phase-wrap">
              <div
                className="home-workflow-phase"
                style={{ '--phase-color': phase.color }}
                onClick={() => goTo(phase.path)}
              >
                <div className="home-workflow-phase-title">{phase.title}</div>
                <div className="home-workflow-phase-desc">{phase.desc}</div>
                <Space size={4} wrap className="home-workflow-links" onClick={(e) => e.stopPropagation()}>
                  {phase.actions.map((action) => (
                    <Button key={action.path} type="link" size="small" onClick={() => goTo(action.path)}>
                      {action.label}
                    </Button>
                  ))}
                </Space>
              </div>
              {index < dashboard.workflowPhases.length - 1 && (
                <ArrowRightOutlined className="home-workflow-arrow" />
              )}
            </div>
          ))}
        </div>
        <div className="home-data-strip">
          <Text type="secondary">数据底座：</Text>
          <Button type="link" size="small" onClick={() => navigate('/data/monitor')}>
            今日采集 {dashboard.todayCollection} 万条
          </Button>
          <Text type="secondary">·</Text>
          <Button type="link" size="small" onClick={() => navigate('/data/quality')}>
            质量分 {dashboard.qualityScore}
          </Button>
          <Text type="secondary">·</Text>
          <Button type="link" size="small" onClick={() => navigate('/data/models')}>
            {dashboard.productionModelCount} 个模型在线
          </Button>
          <Button type="link" size="small" onClick={() => navigate('/data/config')}>
            进入数据中心 →
          </Button>
        </div>
      </section>
    </div>
  )
}
