import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTabSearchParam } from '../../../hooks/useTabSearchParam'
import {
  App,
  Alert,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import {
  CloudServerOutlined,
  DatabaseOutlined,
  HddOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import {
  BACKUP_JOBS,
  LIFECYCLE_POLICIES,
  SECURITY_POLICIES,
  STORAGE_INGRESS_FLOW,
  STORAGE_STRATEGIES,
  STORAGE_TIERS,
} from '../../../mock/data-governance'
import { getDownstreamConsumption, getPlatformMetrics } from '../../../mock/data-bridge'
import DataWorkflowBar from '../DataWorkflowBar'
import StorageWorkflowBar from './StorageWorkflowBar'
import { loadStorageWorkflowState, markStorageStepComplete } from './storageStore'
import ArchitectureTab from './ArchitectureTab'
import CapacityTab from './CapacityTab'
import LifecycleTab from './LifecycleTab'
import BackupTab from './BackupTab'
import SecurityTab from './SecurityTab'
import '../data-governance.css'

const { Text } = Typography

const STORAGE_TABS = ['architecture', 'capacity', 'lifecycle', 'backup', 'security']

export default function DataStoragePage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, changeTab] = useTabSearchParam(STORAGE_TABS, 'architecture')
  const [workflowState, setWorkflowState] = useState(loadStorageWorkflowState)

  const [strategies] = useState(STORAGE_STRATEGIES)
  const [lifecycle, setLifecycle] = useState(LIFECYCLE_POLICIES)
  const [backups, setBackups] = useState(BACKUP_JOBS)
  const [security, setSecurity] = useState(SECURITY_POLICIES)
  const [lcModalOpen, setLcModalOpen] = useState(false)
  const [editingLc, setEditingLc] = useState(null)
  const [lcForm] = Form.useForm()
  const [fromQuality, setFromQuality] = useState(false)

  useEffect(() => {
    const from = searchParams.get('from')
    const cleaned = searchParams.get('cleaned')
    if (from === 'quality' || cleaned) {
      setFromQuality(true)
      message.info('清洗产出数据已就绪，请确认分层入库策略与容量分配')
    }
  }, [searchParams, message])

  const totalUsage = STORAGE_TIERS.reduce((s, t) => s + t.capacity, 0)
  const totalCapacity = STORAGE_TIERS.reduce((s, t) => s + t.total, 0)
  const downstreamModules = useMemo(() => getDownstreamConsumption(getPlatformMetrics()), [])

  const handleStepComplete = (stepKey) => {
    const next = markStorageStepComplete(stepKey)
    setWorkflowState(next)
  }

  const handleSaveLifecycle = () => {
    lcForm.validateFields().then((values) => {
      if (editingLc) {
        setLifecycle((prev) => prev.map((l) => (l.id === editingLc.id ? { ...l, ...values } : l)))
      } else {
        setLifecycle((prev) => [{ ...values, id: `LC-00${prev.length + 1}`, status: 'active' }, ...prev])
      }
      setLcModalOpen(false)
      handleStepComplete('lifecycle')
      message.success('生命周期策略已保存')
    })
  }

  const tabItems = [
    {
      key: 'architecture',
      label: <span><DatabaseOutlined /> 多模存储架构</span>,
      children: <ArchitectureTab strategies={strategies} />,
    },
    {
      key: 'capacity',
      label: <span><HddOutlined /> 容量监控</span>,
      children: <CapacityTab totalUsage={totalUsage} totalCapacity={totalCapacity} />,
    },
    {
      key: 'lifecycle',
      label: <span><SyncOutlined /> 生命周期策略</span>,
      children: (
        <LifecycleTab
          lifecycle={lifecycle}
          onAdd={() => { setEditingLc(null); lcForm.resetFields(); setLcModalOpen(true) }}
          onEdit={(r) => { setEditingLc(r); lcForm.setFieldsValue(r); setLcModalOpen(true) }}
        />
      ),
    },
    {
      key: 'backup',
      label: <span><CloudServerOutlined /> 备份与恢复</span>,
      children: <BackupTab backups={backups} setBackups={setBackups} onBackupComplete={handleStepComplete} />,
    },
    {
      key: 'security',
      label: <span><SafetyCertificateOutlined /> 数据安全</span>,
      children: (
        <SecurityTab
          security={security}
          setSecurity={setSecurity}
          onSecurityAudit={() => handleStepComplete('security')}
        />
      ),
    },
  ]

  return (
    <div className="data-gov-page">
      <div className="business-page-header">
        <h1 className="page-title">安全数据存储管理</h1>
        <p className="page-description">
          多模分层存储 · 容量监控与预测 · 生命周期合规 · 备份恢复 · 加密脱敏与权限控制
        </p>
      </div>

      <DataWorkflowBar
        active="storage"
        extra={(
          <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => navigate('/data/models')}>
            数据就绪 · 模型训练部署 →
          </Button>
        )}
      />

      <StorageWorkflowBar
        active={activeTab}
        completedSteps={workflowState.completedSteps}
        onChange={changeTab}
      />

      <div className="business-stat-grid storage-capacity-stats" style={{ marginBottom: 16 }}>
        <div className="business-stat-card">
          <div className="value">{totalUsage.toFixed(1)} TB</div>
          <div className="label">已用总容量</div>
        </div>
        <div className="business-stat-card">
          <div className="value">3 层</div>
          <div className="label">热/温/冷架构</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{lifecycle.length}</div>
          <div className="label">生命周期规则</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{backups.filter((b) => b.status === 'success').length}</div>
          <div className="label">可用备份点</div>
        </div>
      </div>

      {fromQuality && (
        <Alert
          type="success"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setFromQuality(false)}
          message="清洗产出已到达存储层"
          description="高质量数据已按策略路由至热/温/冷存储。请确认容量分配、生命周期规则与备份策略后，进入模型算法或业务模块。"
          action={(
            <Space>
              <Button size="small" onClick={() => navigate('/data/quality?tab=report')}>查看清洗报告</Button>
              <Button size="small" type="primary" onClick={() => navigate('/data/models')}>进入模型训练</Button>
            </Space>
          )}
        />
      )}

      <div className="business-panel storage-ingress-panel" style={{ marginBottom: 16 }}>
        <h3 className="business-panel-title">清洗产出 → 分层入库路径</h3>
        <Timeline
          className="lineage-timeline"
          items={STORAGE_INGRESS_FLOW.map((item) => ({
            color: item.step >= 5 ? '#B32620' : 'blue',
            children: (
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => item.route && navigate(item.route)}
              >
                <Text strong>{item.stage}</Text>
                <div>{item.node}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.detail}</Text>
              </div>
            ),
          }))}
        />
      </div>

      <div className="business-panel" style={{ marginBottom: 16 }}>
        <h3 className="business-panel-title">温/热数据层 · 业务模块读取</h3>
        <Row gutter={[12, 12]}>
          {downstreamModules.map((item) => (
            <Col xs={24} sm={12} md={8} lg={4} key={item.key}>
              <div className="storage-downstream-card" onClick={() => navigate(item.route)}>
                <div className="storage-downstream-title">{item.module}</div>
                <div className="storage-downstream-metric">{item.metric}</div>
                <div className="storage-downstream-pool">{item.pool}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <Tabs activeKey={activeTab} onChange={(tab) => { changeTab(tab); handleStepComplete(tab) }} items={tabItems} />

      <Modal
        title={editingLc ? '编辑生命周期规则' : '新增生命周期规则'}
        open={lcModalOpen}
        onCancel={() => setLcModalOpen(false)}
        onOk={handleSaveLifecycle}
        destroyOnClose
        width={520}
      >
        <Form form={lcForm} layout="vertical">
          <Form.Item label="规则名称" name="name" rules={[{ required: true }]}><Input placeholder="例：原始日志策略" /></Form.Item>
          <Form.Item label="数据类型" name="dataType" rules={[{ required: true }]}><Input placeholder="例：采集日志" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="保留(天)" name="retain" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="压缩(天)" name="compress" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="归档(天)" name="archive" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="删除(天)" name="delete"><InputNumber min={0} style={{ width: '100%' }} placeholder="0=永久" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
