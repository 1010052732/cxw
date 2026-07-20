import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs } from 'antd'
import {
  BellOutlined,
  BookOutlined,
  FundOutlined,
  RadarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import RiskPipelineBar from '../RiskPipelineBar'
import OverviewTab from './OverviewTab'
import IndicatorTab from './IndicatorTab'
import MonitoringTab from './MonitoringTab'
import DisplayTab from './DisplayTab'
import CaseLibraryEmbed from './CaseLibraryEmbed'
import '../../business.css'

const TAB_KEYS = ['overview', 'indicator', 'monitoring', 'display', 'cases']

export default function RiskIdentificationPage() {
  const navigate = useNavigate()
  const [activeTab, changeTab] = useTabSearchParam(TAB_KEYS, 'overview')

  const tabItems = useMemo(
    () => [
      {
        key: 'overview',
        label: <span><RadarChartOutlined /> 识别概览</span>,
        children: (
          <OverviewTab
            onGoIndicator={() => changeTab('indicator')}
            onGoMonitoring={() => changeTab('monitoring')}
          />
        ),
      },
      {
        key: 'indicator',
        label: <span><SettingOutlined /> 指标设置</span>,
        children: (
          <IndicatorTab
            onGoMonitoring={() => changeTab('monitoring')}
            onGoAssessment={() => navigate('/risk/assessment')}
          />
        ),
      },
      {
        key: 'monitoring',
        label: <span><BellOutlined /> 监测预警</span>,
        children: (
          <MonitoringTab
            onGoResponse={() => navigate('/risk/response?tab=strategy')}
            onGoAssessment={() => navigate('/risk/assessment?tab=model')}
            onGoDisplay={() => changeTab('display')}
          />
        ),
      },
      {
        key: 'display',
        label: <span><FundOutlined /> 信息展示</span>,
        children: (
          <DisplayTab
            onGoCase={() => changeTab('cases')}
            onGoAssessment={() => navigate('/risk/assessment')}
            onGoResponse={() => navigate('/risk/response')}
          />
        ),
      },
      {
        key: 'cases',
        label: <span><BookOutlined /> 案例库</span>,
        children: <CaseLibraryEmbed />,
      },
    ],
    [changeTab, navigate],
  )

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">风险识别</h1>
        <p className="page-description">
          7×24 预警雷达 · 指标设置 → 监测预警 → 信息展示 → 案例沉淀 · 事前精准预判
        </p>
      </div>

      <RiskPipelineBar current="identify" activeLabel={
        ({ overview: '概览', indicator: '指标', monitoring: '监测', display: '展示', cases: '案例' })[activeTab]
      } />

      <div className="assessment-pipeline" style={{ marginBottom: 16 }}>
        {[
          { key: 'overview', label: '识别概览' },
          { key: 'indicator', label: '指标设置' },
          { key: 'monitoring', label: '监测预警' },
          { key: 'display', label: '信息展示' },
          { key: 'cases', label: '案例库' },
        ].map((step, idx, arr) => (
          <div key={step.key} className="assessment-pipeline-item">
            <div
              className={`assessment-pipeline-node${activeTab === step.key ? ' active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => changeTab(step.key)}
            >
              <span>{idx + 1}</span>
              <span>{step.label}</span>
            </div>
            {idx < arr.length - 1 && <span className="assessment-pipeline-arrow">→</span>}
          </div>
        ))}
      </div>

      <Tabs activeKey={activeTab} onChange={changeTab} destroyInactiveTabPane={false} items={tabItems} />
    </div>
  )
}
