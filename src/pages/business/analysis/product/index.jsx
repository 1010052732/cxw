import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import { Button, Space, Tabs, Typography } from 'antd'
import {
  DatabaseOutlined,
  GlobalOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import AnalysisWorkflowBar from '../AnalysisWorkflowBar'
import QueryTab from './QueryTab'
import PriceTab from './PriceTab'
import SupplyDemandTab from './SupplyDemandTab'
import TradeBarrierTab from './TradeBarrierTab'
import '../../business.css'

const { Text } = Typography

const QUICK_KEYWORDS = ['汽车配件', '电子产品', '机械设备']

const TAB_KEYS = ['query', 'price', 'supply', 'barrier']

export default function AnalysisProductPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, changeTab] = useTabSearchParam(TAB_KEYS, 'query')
  const [productName, setProductName] = useState('汽车配件')

  useEffect(() => {
    const hs = searchParams.get('hs')
    const q = searchParams.get('q')
    if (q) setProductName(decodeURIComponent(q))
    else if (hs === '8507' || hs === '8517') setProductName('电子产品')
    else if (hs === '8708') setProductName('汽车配件')
    else if (hs === '8479') setProductName('机械设备')
  }, [searchParams])

  const selectProduct = (name) => {
    setProductName(name)
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
        <h1 className="page-title">商品分析</h1>
        <p className="page-description">查询 → 价格 → 供需 → 壁垒 · 四维闭环 · 支撑采购、定价与合规决策</p>
      </div>

      <AnalysisWorkflowBar
        active="product"
        context={{
          q: productName,
          hs: searchParams.get('hs') || undefined,
          country: searchParams.get('country') || undefined,
          tab: activeTab,
        }}
      />

      <div className="business-filter-bar">
        <Space wrap>
          <Text>快捷查询</Text>
          {QUICK_KEYWORDS.map((k) => (
            <Button key={k} size="small" type={productName === k ? 'primary' : 'default'} onClick={() => selectProduct(k)}>
              {k}
            </Button>
          ))}
        </Space>
        <Space wrap>
          <Button type="link" size="small" onClick={() => changeTab('query')}>查询</Button>
          <Button type="link" size="small" onClick={() => changeTab('price')}>价格</Button>
          <Button type="link" size="small" onClick={() => changeTab('supply')}>供需</Button>
          <Button type="link" size="small" onClick={() => changeTab('barrier')}>壁垒</Button>
          <Button type="link" icon={<GlobalOutlined />} onClick={() => navigate(`/analysis/market?country=germany&tab=overview`)}>市场分析</Button>
          <Button type="link" icon={<ShopOutlined />} onClick={() => navigate(`/analysis/enterprise?q=${encodeURIComponent('华贸进出口集团')}&tab=query`)}>企业分析</Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={changeTab}
        items={[
          {
            key: 'query',
            label: <span><DatabaseOutlined /> 商品数据查询</span>,
            children: (
              <QueryTab
                productName={productName}
                onProductChange={setProductName}
                onGoPrice={() => changeTab('price')}
                onGoSupply={() => changeTab('supply')}
              />
            ),
          },
          {
            key: 'price',
            label: <span><LineChartOutlined /> 价格走势分析</span>,
            children: (
              <PriceTab
                productName={productName}
                onGoSupply={() => changeTab('supply')}
              />
            ),
          },
          {
            key: 'supply',
            label: <span><SwapOutlined /> 供求关系研究</span>,
            children: (
              <SupplyDemandTab
                productName={productName}
                onGoBarrier={() => changeTab('barrier')}
              />
            ),
          },
          {
            key: 'barrier',
            label: <span><SafetyCertificateOutlined /> 贸易壁垒分析</span>,
            children: <TradeBarrierTab productName={productName} />,
          },
        ]}
      />
    </div>
  )
}
