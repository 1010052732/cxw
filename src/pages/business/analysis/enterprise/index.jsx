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
import EnterpriseQueryTab from './QueryTab'
import CompetitorTab from './CompetitorTab'
import PartnerTab from './PartnerTab'
import BenchmarkTab from './BenchmarkTab'
import '../../business.css'

const { Text } = Typography

const QUICK_ENTERPRISES = ['华贸进出口集团', '远洋供应链公司', '丝路跨境贸易']
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

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">企业分析</h1>
        <p className="page-description">信息查询 → 竞争分析 → 伙伴评估 → 标杆对比 · 洲/国家/城市三级筛选 · 支撑合作与竞争决策</p>
      </div>

      <div className="business-filter-bar">
        <Space wrap>
          <Text>快捷企业</Text>
          {QUICK_ENTERPRISES.map((k) => (
            <Button key={k} size="small" type={enterpriseName === k ? 'primary' : 'default'} onClick={() => selectEnterprise(k)}>
              {k}
            </Button>
          ))}
        </Space>
        <Space wrap>
          <Button type="link" size="small" onClick={() => changeTab('query')}>查询</Button>
          <Button type="link" size="small" onClick={() => changeTab('competitor')}>竞争</Button>
          <Button type="link" size="small" onClick={() => changeTab('partner')}>伙伴</Button>
          <Button type="link" size="small" onClick={() => changeTab('benchmark')}>标杆</Button>
          <Button type="link" icon={<ShopOutlined />} onClick={() => navigate('/analysis/product')}>商品分析</Button>
          <Button type="link" icon={<GlobalOutlined />} onClick={() => navigate('/analysis/market')}>市场分析</Button>
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
                onEnterpriseChange={setEnterpriseName}
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
                onGoBenchmark={() => changeTab('benchmark')}
              />
            ),
          },
          {
            key: 'benchmark',
            label: <span><TrophyOutlined /> 行业标杆对比</span>,
            children: <BenchmarkTab enterpriseName={enterpriseName} />,
          },
        ]}
      />
    </div>
  )
}
