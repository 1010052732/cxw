import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import { Button, Space, Tabs, Typography } from 'antd'
import {
  DatabaseOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import AnalysisWorkflowBar from '../AnalysisWorkflowBar'
import EnterpriseQueryTab from './QueryTab'
import CompetitorTab from './CompetitorTab'
import PartnerTab from './PartnerTab'
import BenchmarkTab from './BenchmarkTab'
import '../../business.css'

const { Text } = Typography

const TAB_KEYS = ['query', 'competitor', 'partner', 'benchmark']

export default function AnalysisEnterprisePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, changeTab] = useTabSearchParam(TAB_KEYS, 'query')
  const [enterpriseName, setEnterpriseName] = useState('华贸进出口集团')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setEnterpriseName(decodeURIComponent(q))
  }, [searchParams])

  const selectEnterprise = (name) => {
    setEnterpriseName(name)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', activeTab)
      next.set('q', name)
      return next
    })
  }

  const goQueryTab = () => changeTab('query')

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">企业分析</h1>
        <p className="page-description">检索选用 → 动态档案 → 竞争分析 → 伙伴评估 → 标杆对比 · 支撑合作甄选与竞争决策</p>
      </div>

      <AnalysisWorkflowBar
        active="enterprise"
        context={{
          q: enterpriseName,
          country: searchParams.get('country') || undefined,
          tab: activeTab,
        }}
      />

      <div className="business-filter-bar">
        <Space wrap>
          <Text>当前企业</Text>
          <Text strong>{enterpriseName}</Text>
          {activeTab !== 'query' && (
            <Button type="link" size="small" onClick={goQueryTab}>返回检索选用</Button>
          )}
        </Space>
        <Space wrap>
          <Button type="link" size="small" onClick={() => changeTab('query')}>查询</Button>
          <Button type="link" size="small" onClick={() => changeTab('competitor')}>竞争</Button>
          <Button type="link" size="small" onClick={() => changeTab('partner')}>伙伴</Button>
          <Button type="link" size="small" onClick={() => changeTab('benchmark')}>标杆</Button>
          <Button type="link" icon={<ShopOutlined />} onClick={() => navigate(`/analysis/product?q=${encodeURIComponent('汽车配件')}&tab=query`)}>商品分析</Button>
          <Button type="link" icon={<GlobalOutlined />} onClick={() => navigate('/analysis/market?country=germany&tab=overview')}>市场分析</Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={changeTab}
        items={[
          {
            key: 'query',
            label: <span><DatabaseOutlined /> 企业信息查询</span>,
            children: (
              <EnterpriseQueryTab
                enterpriseName={enterpriseName}
                onEnterpriseChange={selectEnterprise}
                onGoCompetitor={() => changeTab('competitor')}
                onGoPartner={() => changeTab('partner')}
              />
            ),
          },
          {
            key: 'competitor',
            label: <span><TeamOutlined /> 竞争企业分析</span>,
            children: (
              <CompetitorTab
                enterpriseName={enterpriseName}
                onGoQuery={goQueryTab}
                onGoPartner={() => changeTab('partner')}
              />
            ),
          },
          {
            key: 'partner',
            label: <span><SafetyCertificateOutlined /> 合作伙伴评估</span>,
            children: (
              <PartnerTab
                enterpriseName={enterpriseName}
                onGoQuery={goQueryTab}
                onGoBenchmark={() => changeTab('benchmark')}
              />
            ),
          },
          {
            key: 'benchmark',
            label: <span><TrophyOutlined /> 行业标杆对比</span>,
            children: (
              <BenchmarkTab
                enterpriseName={enterpriseName}
                onGoQuery={goQueryTab}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
