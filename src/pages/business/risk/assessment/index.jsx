import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space, Tabs, Typography } from 'antd'
import {
  ApartmentOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  FundProjectionScreenOutlined,
  OrderedListOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useTabSearchParam } from '../../../../hooks/useTabSearchParam'
import OverviewTab from './OverviewTab'
import ModelTab from './ModelTab'
import ParameterTab from './ParameterTab'
import ResultsTab from './ResultsTab'
import PriorityTab from './PriorityTab'
import QuickTab from './QuickTab'
import '../../business.css'

const { Text } = Typography
const TAB_KEYS = ['overview', 'model', 'params', 'results', 'priority', 'quick']

const defaultConfig = {
  modelId: 'el',
  profileId: 'b2b',
  signal: null,
  wizard: null,
}

export default function RiskAssessmentPage() {
  const navigate = useNavigate()
  const [activeTab, changeTab] = useTabSearchParam(TAB_KEYS, 'overview')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [assessmentConfig, setAssessmentConfig] = useState(defaultConfig)

  const goModel = (signal) => {
    if (signal) {
      setSelectedSignal(signal)
      setAssessmentConfig((c) => ({ ...c, signal, modelId: signal.suggestedModel || c.modelId }))
    }
    changeTab('model')
  }

  const goParams = (partial) => {
    setAssessmentConfig((c) => ({ ...c, ...partial }))
    changeTab('params')
  }

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">风险评估</h1>
        <p className="page-description">模型 → 参数 → 结果展示 → 优先级排序 → 风险应对</p>
      </div>

      <div className="business-filter-bar">
        <Space wrap>
          <Text>评估流程</Text>
          <Button type="link" size="small" onClick={() => navigate('/risk/identification')}>← 风险识别</Button>
          <Button type="link" size="small" onClick={() => changeTab('model')}>模型</Button>
          <Button type="link" size="small" onClick={() => changeTab('params')}>参数</Button>
          <Button type="link" size="small" onClick={() => changeTab('results')}>结果</Button>
          <Button type="link" size="small" onClick={() => changeTab('priority')}>排序</Button>
          <Button type="link" size="small" onClick={() => navigate('/risk/response?tab=strategy')}>应对 →</Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={changeTab}
        items={[
          {
            key: 'overview',
            label: <span><FundProjectionScreenOutlined /> 评估概览</span>,
            children: (
              <OverviewTab
                onGoModel={goModel}
                onGoParams={() => changeTab('params')}
                onGoResults={() => changeTab('results')}
                onGoResponse={() => navigate('/risk/response?tab=strategy')}
              />
            ),
          },
          {
            key: 'model',
            label: <span><ExperimentOutlined /> 模型选择</span>,
            children: (
              <ModelTab
                initialSignal={selectedSignal}
                onGoParams={goParams}
                onGoResults={() => changeTab('results')}
                onGoResponse={() => navigate('/risk/response?tab=strategy')}
              />
            ),
          },
          {
            key: 'params',
            label: <span><SettingOutlined /> 参数设置</span>,
            children: (
              <ParameterTab
                config={assessmentConfig}
                onGoModel={() => changeTab('model')}
                onGoResults={() => changeTab('results')}
                onGoResponse={() => navigate('/risk/response?tab=strategy')}
              />
            ),
          },
          {
            key: 'results',
            label: <span><BarChartOutlined /> 评估结果展示</span>,
            children: <ResultsTab onGoPriority={() => changeTab('priority')} />,
          },
          {
            key: 'priority',
            label: <span><OrderedListOutlined /> 排序与优先级</span>,
            children: <PriorityTab onGoResponse={() => navigate('/risk/response?tab=strategy&from=priority-queue')} />,
          },
          {
            key: 'quick',
            label: <span><ApartmentOutlined /> 快速评估</span>,
            children: <QuickTab onGoResponse={() => navigate('/risk/response?tab=strategy&from=assessment-quick')} />,
          },
        ]}
      />
    </div>
  )
}
