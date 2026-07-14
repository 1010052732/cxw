import { Steps, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const STEPS = [
  { key: 'market', title: '市场维度', desc: '宏观环境与制度', path: '/analysis/market' },
  { key: 'product', title: '商品维度', desc: '价格·供需·壁垒', path: '/analysis/product' },
  { key: 'enterprise', title: '企业维度', desc: '竞争·伙伴·标杆', path: '/analysis/enterprise' },
]

/**
 * 进出口分析「三维一体」闭环导航条
 * 文档要求：市场/商品/企业三类数据互联互通、结论相互印证
 */
export default function AnalysisWorkflowBar({ active = 'market', context = {} }) {
  const navigate = useNavigate()
  const current = Math.max(0, STEPS.findIndex((s) => s.key === active))

  const buildPath = (step) => {
    const params = new URLSearchParams()
    if (context.country) params.set('country', context.country)
    if (context.q) params.set('q', context.q)
    if (context.hs) params.set('hs', context.hs)
    if (context.tab) params.set('tab', context.tab)
    const qs = params.toString()
    return qs ? `${step.path}?${qs}` : step.path
  }

  return (
    <div className="business-panel" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <Text strong>进出口分析 · 三维一体闭环</Text>
        <Tag color="#B32620">战略作战室 · 业务望远镜</Tag>
      </div>
      <Steps
        size="small"
        current={current}
        onChange={(idx) => navigate(buildPath(STEPS[idx]))}
        items={STEPS.map((s) => ({
          title: s.title,
          description: s.desc,
        }))}
      />
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
        操作闭环：选定目标市场 → 锁定商品标的 → 评估参与企业 → 结论互证 → 导出决策底稿
      </Text>
    </div>
  )
}
