import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space, Tabs, Typography } from 'antd'
import { RadarChartOutlined, BellOutlined, SettingOutlined, FundOutlined } from '@ant-design/icons'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import OverviewTab from './OverviewTab'
import IndicatorTab from './IndicatorTab'
import MonitoringTab from './MonitoringTab'
import DisplayTab from './DisplayTab'
import '../../business.css'

const { Text } = Typography
const TAB_KEYS = ['overview', 'indicator', 'monitoring', 'display']

export default function RiskIdentificationPage() {
  const navigate = useNavigate()
  const [activeTab, changeTab] = useTabSearchParam(TAB_KEYS, 'overview')

  const tabItems = useMemo(
    () => [
      {
        key: 'overview',
        label: <span><RadarChartOutlined /> 风险识别概览</span>,
        children: <OverviewTab onGoIndicator={() => changeTab('indicator')} onGoMonitoring={() => changeTab('monitoring')} />,
      },
      {
        key: 'indicator',
        label: <span><SettingOutlined /> 风险指标设置</span>,
        children: <IndicatorTab onGoMonitoring={() => changeTab('monitoring')} onGoAssessment={() => navigate('/risk/assessment')} />,
      },
      {
        key: 'monitoring',
        label: <span><BellOutlined /> 风险监测预警</span>,
        children: <MonitoringTab onGoResponse={() => navigate('/risk/response?tab=strategy')} onGoDisplay={() => changeTab('display')} />,
      },
      {
        key: 'display',
        label: <span><FundOutlined /> 风险信息展示</span>,
        children: <DisplayTab onGoCase={() => navigate('/risk/case')} />,
      },
    ],
    [changeTab, navigate],
  )

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">风险识别</h1>
        <p className="page-description">识别概览 → 指标设置 → 监测预警 → 信息展示 → 案例库 → 评估 → 应对</p>
      </div>

      <div className="business-filter-bar">
        <Space wrap>
          <Text>风险防控流程</Text>
          <Button type="link" size="small" onClick={() => changeTab('overview')}>识别概览</Button>
          <Button type="link" size="small" onClick={() => changeTab('indicator')}>指标设置</Button>
          <Button type="link" size="small" onClick={() => changeTab('monitoring')}>监测预警</Button>
          <Button type="link" size="small" onClick={() => changeTab('display')}>信息展示</Button>
          <Button type="link" size="small" onClick={() => navigate('/risk/case')}>案例库</Button>
          <Button type="link" size="small" onClick={() => navigate('/risk/situation')}>态势感知</Button>
          <Button type="link" size="small" onClick={() => navigate('/risk/assessment')}>风险评估</Button>
          <Button type="link" size="small" onClick={() => navigate('/risk/response')}>风险应对</Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={changeTab} destroyInactiveTabPane={false} items={tabItems} />
    </div>
  )
}
