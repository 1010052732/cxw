/** 首页展示数据 · 实时指标由 data-bridge.buildHomeDashboard 合并 */
import { INITIAL_RISK_TASKS } from './risk'

export const HOME_DASHBOARD = {
  riskAlerts: [
    { id: 'RA-001', title: '中东航线大面积延误', level: '高', type: '物流风险', path: '/risk/situation' },
    { id: 'RA-002', title: '美国301关税清单更新', level: '高', type: '政策风险', path: '/risk/assessment' },
    { id: 'RA-003', title: '巴西买家信用异常', level: '高', type: '信用风险', path: '/risk/response' },
    { id: 'RA-004', title: '欧元汇率波动加剧', level: '中', type: '汇率风险', path: '/risk/situation' },
  ],
  /** 四段业务闭环 · 弱化数据中心细节，突出核心业务路径 */
  workflowPhases: [
    {
      key: 'data',
      title: '数据底座',
      desc: '采集 · 清洗 · 模型',
      path: '/data/config',
      color: '#1677ff',
      actions: [
        { label: '数据源', path: '/data/config' },
        { label: '清洗', path: '/data/quality' },
        { label: '模型', path: '/data/models' },
      ],
    },
    {
      key: 'opportunity',
      title: '商机识别',
      desc: '分类 · 评估 · 报告',
      path: '/opportunity/classify',
      color: '#B32620',
      actions: [
        { label: '分类筛选', path: '/opportunity/classify' },
        { label: '评估排序', path: '/opportunity/evaluation' },
        { label: '评估报告', path: '/opportunity/report/generate' },
      ],
    },
    {
      key: 'analysis',
      title: '进出口分析',
      desc: '市场 · 商品 · 企业',
      path: '/analysis/market',
      color: '#13c2c2',
      actions: [
        { label: '市场', path: '/analysis/market' },
        { label: '商品', path: '/analysis/product' },
        { label: '企业', path: '/analysis/enterprise' },
      ],
    },
    {
      key: 'risk',
      title: '风险防控',
      desc: '识别 · 评估 · 应对',
      path: '/risk/identification',
      color: '#faad14',
      actions: [
        { label: '风险识别', path: '/risk/identification' },
        { label: '风险评估', path: '/risk/assessment' },
        { label: '风险应对', path: '/risk/response' },
      ],
    },
  ],
}

const TODO_TYPE_META = {
  opportunity: { label: '商机', color: '#B32620', defaultPath: '/opportunity/hall' },
  risk: { label: '风险', color: '#fa541c', defaultPath: '/risk/response' },
  data: { label: '数据', color: '#1677ff', defaultPath: '/data/monitor' },
  system: { label: '系统', color: '#8c8c8c', defaultPath: '/message' },
}

export function buildFeaturedOpportunities(opportunities, limit = 5) {
  return [...opportunities]
    .filter((item) => item.enabled !== false && item.status === 'active')
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country,
      product: item.product,
      score: item.score,
      riskLevel: item.riskLevel,
      tags: item.tags || [],
      revenueRange: item.revenueRange,
      alert: item.dynamicAlert?.message,
    }))
}

export function buildHomeTodos(opportunities, messages) {
  const todos = []
  const seen = new Set()

  messages
    .filter((item) => !item.read)
    .forEach((item) => {
      const type = item.category === 'risk' ? 'risk' : item.category === 'business' ? 'opportunity' : item.category === 'data' ? 'data' : 'system'
      const path =
        item.linkPath
        || (type === 'risk' ? '/risk/situation' : type === 'opportunity' ? '/opportunity/evaluation' : type === 'data' ? '/data/monitor' : '/message')
      todos.push({
        id: item.id,
        type,
        title: item.title,
        desc: item.content?.length > 48 ? `${item.content.slice(0, 48)}…` : item.content,
        time: item.time,
        path,
        urgent: item.type === 'error' || (type === 'risk' && item.type !== 'info'),
      })
      seen.add(item.id)
    })

  ;[...(INITIAL_RISK_TASKS.pending || []), ...(INITIAL_RISK_TASKS.processing || [])]
    .filter((task) => !task.owner)
    .slice(0, 2)
    .forEach((task) => {
      if (seen.has(task.id)) return
      todos.push({
        id: task.id,
        type: 'risk',
        title: `待分配：${task.title}`,
        desc: task.type,
        time: task.time,
        path: '/risk/response',
        urgent: task.level === '高',
      })
      seen.add(task.id)
    })

  opportunities
    .filter((item) => item.tags?.includes('重点跟进') || item.favorited)
    .slice(0, 2)
    .forEach((item) => {
      const key = `follow-${item.id}`
      if (seen.has(key)) return
      todos.push({
        id: key,
        type: 'opportunity',
        title: `重点跟进：${item.name}`,
        desc: `综合得分 ${item.score} · ${item.country}`,
        time: item.createdAt,
        path: `/opportunity/detail/${item.id}`,
        urgent: false,
      })
      seen.add(key)
    })

  return todos
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.time.localeCompare(a.time))
    .slice(0, 6)
    .map((item) => ({ ...item, meta: TODO_TYPE_META[item.type] || TODO_TYPE_META.system }))
}

export function summarizeHomeKpis({ opportunityTotal, todos, riskAlerts, trendDelta = 0 }) {
  const highRiskCount = riskAlerts.filter((item) => item.level === '高').length
  const todoByType = todos.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    },
    {},
  )

  return {
    highRiskCount,
    todoSummary: [
      todoByType.opportunity ? `${todoByType.opportunity} 商机` : null,
      todoByType.risk ? `${todoByType.risk} 风险` : null,
      todoByType.data ? `${todoByType.data} 数据` : null,
    ].filter(Boolean).join(' · ') || '暂无分类',
    trendDelta,
  }
}
