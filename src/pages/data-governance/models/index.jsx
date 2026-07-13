import { useSearchParams } from 'react-router-dom'
import { Tabs, Typography } from 'antd'
import {
  ApartmentOutlined,
  CloudServerOutlined,
  ExperimentOutlined,
  FundProjectionScreenOutlined,
} from '@ant-design/icons'
import DataWorkflowBar from '../DataWorkflowBar'
import OverviewTab from './OverviewTab'
import ModelLibraryTab from './ModelLibraryTab'
import ModelFactoryTab from './ModelFactoryTab'
import DeployMonitorTab from './DeployMonitorTab'
import '../data-governance.css'

const { Paragraph } = Typography

const TAB_KEYS = ['overview', 'library', 'factory', 'deploy']

export default function ModelAlgorithmPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = TAB_KEYS.includes(tabParam) ? tabParam : 'overview'

  const changeTab = (tab) => {
    setSearchParams({ tab })
  }

  return (
    <div className="data-governance-page">
      <div className="business-page-header">
        <h1 className="page-title">模型算法中心</h1>
        <Paragraph className="page-description">
          数据治理 → 模型创建 → 训练优化 → 部署监控 → 业务应用 · 商机识别 / 进出口分析 / 贸易风险防控
        </Paragraph>
      </div>

      <DataWorkflowBar active="models" />

      <Tabs
        activeKey={activeTab}
        onChange={changeTab}
        items={[
          {
            key: 'overview',
            label: <span><FundProjectionScreenOutlined /> 架构总览</span>,
            children: <OverviewTab />,
          },
          {
            key: 'library',
            label: <span><ApartmentOutlined /> 模型库</span>,
            children: <ModelLibraryTab />,
          },
          {
            key: 'factory',
            label: <span><ExperimentOutlined /> 模型工厂</span>,
            children: <ModelFactoryTab />,
          },
          {
            key: 'deploy',
            label: <span><CloudServerOutlined /> 部署监控</span>,
            children: <DeployMonitorTab />,
          },
        ]}
      />
    </div>
  )
}
