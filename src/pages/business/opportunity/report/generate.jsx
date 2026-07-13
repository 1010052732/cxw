import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { FileTextOutlined, RocketOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../auth/AuthContext'
import { USERS } from '../../../../mock/rbac'
import {
  DEFAULT_WEIGHTS,
  REPORT_SECTION_OPTIONS,
} from '../../../../mock/opportunity'
import { loadOpportunities } from '../opportunityStore'
import { formatGeoLocation } from '../utils'
import { saveReportConfig } from '../../../../utils/reportStorage'
import { OPPORTUNITY_SCOPE_FIELDS } from '../../../../constants/dataScope'
import {
  EVALUATION_WEIGHTS_KEY,
  OPPORTUNITY_STORAGE_KEY,
} from '../utils'
import '../opportunity.css'

const { Text, Paragraph } = Typography

export default function ReportGeneratePage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, filterModuleData } = useAuth()
  const [selectedIds, setSelectedIds] = useState(() => location.state?.preselect || [])
  const [sections, setSections] = useState(REPORT_SECTION_OPTIONS.filter((s) => s.default).map((s) => s.key))
  const [schemeName, setSchemeName] = useState('商机评估方案 V1')

  const weights = useMemo(() => {
    try {
      const saved = sessionStorage.getItem(EVALUATION_WEIGHTS_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS
    } catch {
      return DEFAULT_WEIGHTS
    }
  }, [])

  const candidateList = useMemo(() => {
    const pool = filterModuleData(loadOpportunities(USERS), 'opportunity', OPPORTUNITY_SCOPE_FIELDS)
    const stored = sessionStorage.getItem(OPPORTUNITY_STORAGE_KEY)
    if (stored) {
      try {
        const ids = JSON.parse(stored)
        const filtered = pool.filter((i) => ids.includes(i.id))
        if (filtered.length) return filtered
      } catch { /* ignore */ }
    }
    return pool
  }, [currentUser.id, filterModuleData])

  const handleGenerate = () => {
    if (selectedIds.length === 0) {
      message.warning('请至少选择一个商机')
      return
    }
    const primaryId = selectedIds[0]
    const config = { ids: selectedIds, weights, scheme: schemeName, sections, combo: selectedIds.length > 1 }
    saveReportConfig(primaryId, config)
    navigate(`/opportunity/report/${primaryId}`, { state: config })
    message.success(`报告已生成，包含 ${selectedIds.length} 个商机`)
  }

  const columns = [
    { title: '商机ID', dataIndex: 'id', key: 'id', width: 120 },
    { title: '商机名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '商机来源', key: 'source', width: 180, render: (_, r) => formatGeoLocation(r) },
    { title: '目标市场', dataIndex: 'country', key: 'country', width: 90 },
    { title: '产品', dataIndex: 'product', key: 'product', width: 110 },
    {
      title: '综合分',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      render: (s) => <Tag color="#B32620">{s}</Tag>,
    },
  ]

  return (
    <div className="opportunity-page">
      <div className="opportunity-page-header">
        <h1 className="page-title">评估报告生成</h1>
        <p className="page-description">基于单一商机或商机组合，一键生成结构化决策报告 · 支持 PDF / Excel 导出</p>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 className="business-panel-title" style={{ margin: 0 }}>选择报告对象</h3>
                <Text type="secondary">来自评估批次的 {candidateList.length} 条商机，支持单选或多选组合报告</Text>
              </div>
              <Space>
                <Button onClick={() => setSelectedIds(candidateList.map((i) => i.id))}>全选</Button>
                <Button onClick={() => setSelectedIds([])}>清空</Button>
              </Space>
            </div>
            <Table
              rowKey="id"
              size="middle"
              columns={columns}
              dataSource={candidateList}
              pagination={{ pageSize: 8 }}
              rowSelection={{
                selectedRowKeys: selectedIds,
                onChange: setSelectedIds,
              }}
            />
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title">报告配置</h3>
            <Form layout="vertical" size="small">
              <Form.Item label="评估方案名称">
                <Input value={schemeName} onChange={(e) => setSchemeName(e.target.value)} />
              </Form.Item>
              <Form.Item label="当前权重配置">
                <Text>市场 {weights.market}% · 政策 {weights.policy}% · 信用 {weights.credit}%</Text>
              </Form.Item>
              <Form.Item label="报告章节（可裁剪）">
                <Checkbox.Group
                  value={sections}
                  onChange={setSections}
                  options={REPORT_SECTION_OPTIONS.map((s) => ({ value: s.key, label: s.label }))}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                />
              </Form.Item>
            </Form>
            <Paragraph type="secondary" style={{ fontSize: 13 }}>
              报告将包含：基本背景、指标体系、得分权重、结论解读、政策与信用分析、进入路径建议、竞争风险及行动计划。
            </Paragraph>
            <Button type="primary" block size="large" icon={<RocketOutlined />} onClick={handleGenerate}>
              一键生成报告
            </Button>
            <Button block style={{ marginTop: 8 }} icon={<FileTextOutlined />} onClick={() => navigate('/opportunity/evaluation')}>
              返回评估与排序
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  )
}
