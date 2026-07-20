import { useMemo, useState } from 'react'
import {
  App,
  Alert,
  Button,
  Col,
  Descriptions,
  Drawer,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Column } from '@ant-design/charts'
import {
  CloudDownloadOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  LockOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import ExportButton from '../../../../components/ExportButton'
import { useAuth } from '../../../../auth/AuthContext'
import {
  RISK_DIGITAL_ARCHIVES,
  RISK_MATURITY_REPORT,
  getArchiveDetail,
  searchRiskArchives,
} from '../../../../mock/risk'

const { Text, Paragraph, Title } = Typography
const REGIONS = ['全部', '南美', '中东', '欧洲', '全球']
const DEPTS = ['全部', '出口部', '物流部', '财务部', '风控部']
const TYPES = ['全部', '信用风险', '物流风险', '汇率风险', '供应链风险']

export default function ArchiveTab({ lifecycle }) {
  const { message } = App.useApp()
  const { filterModuleData, can, getDataRule } = useAuth()
  const [typeFilter, setTypeFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [regionFilter, setRegionFilter] = useState('全部')
  const [deptFilter, setDeptFilter] = useState('全部')
  const [keyword, setKeyword] = useState('')
  const [current, setCurrent] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const localArchives = useMemo(() => (lifecycle?.archives || []).map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type || '综合风险',
    region: a.region || '全球',
    dept: a.dept || '风控部',
    status: '已关闭',
    level: a.level || '已关闭',
    closedAt: a.closedAt,
    conclusion: a.conclusion,
    lessons: a.lessons,
    encrypted: true,
    fromLifecycle: true,
    attachments: ['闭环归档记录'],
  })), [lifecycle])

  const archives = useMemo(() => {
    const list = searchRiskArchives({ type: typeFilter, status: statusFilter, region: regionFilter, dept: deptFilter, keyword })
    const merged = [...localArchives, ...list.filter((a) => !localArchives.some((l) => l.id === a.id))]
    return filterModuleData(merged, 'risk', { dept: 'dept', region: 'region' })
  }, [typeFilter, statusFilter, regionFilter, deptFilter, keyword, filterModuleData, localArchives])

  const handleAuditExport = () => {
    if (!can('action:risk:archive:export')) {
      message.error('无档案导出权限，请联系管理员在权限分配中配置')
      return
    }
    message.success('审计报告已导出（标准化模板）')
  }

  const statsData = useMemo(
    () => [
      { type: '信用风险', count: archives.filter((a) => a.type === '信用风险').length },
      { type: '物流风险', count: archives.filter((a) => a.type === '物流风险').length },
      { type: '汇率风险', count: archives.filter((a) => a.type === '汇率风险').length },
    ],
    [archives],
  )

  const openArchive = (record) => {
    if (record.fromLifecycle) {
      setCurrent({
        ...record,
        timeline: [
          { stage: '警报触发', time: record.closedAt, content: record.title },
          { stage: '评估完成', time: record.closedAt, content: '量化评估已归档' },
          { stage: '应对执行', time: record.closedAt, content: record.conclusion || '应对完成' },
          { stage: '风险关闭', time: record.closedAt, content: record.lessons || '已关闭并沉淀经验' },
        ],
      })
    } else {
      setCurrent(getArchiveDetail(record.id))
    }
    setDrawerOpen(true)
  }

  return (
    <>
      <div className="business-filter-bar" style={{ marginBottom: 16 }}>
        <Tag color="processing">数据权限 · {getDataRule('risk').scope}</Tag>
        <Space wrap>
          <Input.Search placeholder="检索档案..." style={{ width: 200 }} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <Select value={typeFilter} style={{ width: 110 }} options={TYPES.map((v) => ({ value: v, label: v }))} onChange={setTypeFilter} />
          <Select value={statusFilter} style={{ width: 100 }} options={[{ value: '全部', label: '全部状态' }, { value: '已关闭', label: '已关闭' }, { value: '处理中', label: '处理中' }]} onChange={setStatusFilter} />
          <Select value={regionFilter} style={{ width: 100 }} options={REGIONS.map((v) => ({ value: v, label: v }))} onChange={setRegionFilter} />
          <Select value={deptFilter} style={{ width: 110 }} options={DEPTS.map((v) => ({ value: v, label: v }))} onChange={setDeptFilter} />
        </Space>
        <Button icon={<CloudDownloadOutlined />} onClick={handleAuditExport} disabled={!can('action:risk:archive:export')}>审计导出</Button>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title"><DatabaseOutlined /> 风险数字档案</h3>
            <Table
              rowKey="id"
              size="small"
              dataSource={archives}
              pagination={{ pageSize: 6 }}
              columns={[
                { title: '档案编号', dataIndex: 'id', key: 'id', width: 120 },
                { title: '风险事件', dataIndex: 'title', key: 'title', ellipsis: true },
                { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
                { title: '部门', dataIndex: 'dept', key: 'dept', width: 90 },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 90,
                  render: (v, r) => (
                    <Space size={4}>
                      <Tag color={v === '已关闭' ? 'success' : 'processing'}>{v}</Tag>
                      {r.encrypted && <LockOutlined style={{ color: '#8c8c8c' }} />}
                    </Space>
                  ),
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 80,
                  render: (_, r) => <Button type="link" size="small" onClick={() => openArchive(r)}>查阅</Button>,
                },
              ]}
            />
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title"><FileSearchOutlined /> 归档统计</h3>
            <div className="business-chart-box-sm">
              <Column data={statsData} xField="type" yField="count" height={160} color="#B32620" />
            </div>
            <Descriptions bordered size="small" column={1} style={{ marginTop: 12 }}>
              <Descriptions.Item label="已加密归档">{RISK_DIGITAL_ARCHIVES.filter((a) => a.encrypted).length} 份</Descriptions.Item>
              <Descriptions.Item label="处理中">{RISK_DIGITAL_ARCHIVES.filter((a) => a.status === '处理中').length} 份</Descriptions.Item>
              <Descriptions.Item label="审计接口">支持按时间/类型/部门导出合规报告</Descriptions.Item>
            </Descriptions>
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title"><ReadOutlined /> 组织风险文化赋能</h3>
            <Title level={5}>{RISK_MATURITY_REPORT.month} · 成熟度分析</Title>
            {RISK_MATURITY_REPORT.metrics.map((m) => (
              <div key={m.name} style={{ marginBottom: 8 }}>
                <Text>{m.name}：</Text>
                <Text strong>{m.value}</Text>
                <Tag style={{ marginLeft: 8 }}>{m.trend}</Tag>
              </div>
            ))}
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
              薄弱点：{RISK_MATURITY_REPORT.weakPoints.join(' · ')}
            </Paragraph>
            {RISK_MATURITY_REPORT.caseHighlights.map((c) => (
              <Tag key={c.title} color={c.type.includes('警示') ? 'error' : 'success'} style={{ marginBottom: 4 }}>{c.type}</Tag>
            ))}
            {RISK_MATURITY_REPORT.caseHighlights.map((c) => (
              <Paragraph key={c.ref} style={{ margin: '4px 0', fontSize: 12 }}>{c.title}</Paragraph>
            ))}
          </div>
        </Col>
      </Row>

      <Drawer
        title={`数字档案 · ${current?.title || ''}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
      >
        {current && (
          <>
            {current.encrypted && (
              <Tag icon={<LockOutlined />} color="default" style={{ marginBottom: 12 }}>已加密归档 · 仅授权查阅</Tag>
            )}
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="编号">{current.id}</Descriptions.Item>
              <Descriptions.Item label="等级"><Tag>{current.level}</Tag></Descriptions.Item>
              <Descriptions.Item label="地区">{current.region}</Descriptions.Item>
              <Descriptions.Item label="部门">{current.dept}</Descriptions.Item>
              <Descriptions.Item label="关闭时间">{current.closedAt || '—'}</Descriptions.Item>
              <Descriptions.Item label="附件">{(current.attachments || []).join(' · ') || '—'}</Descriptions.Item>
            </Descriptions>

            <Title level={5}>全生命周期时间线</Title>
            <Timeline
              items={(current.timeline || []).map((t) => ({
                color: t.stage.includes('关闭') ? 'green' : t.stage.includes('警报') ? 'red' : 'blue',
                children: (
                  <>
                    <Text strong>{t.stage}</Text>
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{t.time}</Text>
                    <Paragraph style={{ margin: '4px 0 0', fontSize: 13 }}>{t.content}</Paragraph>
                  </>
                ),
              }))}
            />

            {current.lessons && (
              <Alert type="info" showIcon message="经验教训" description={current.lessons} style={{ marginTop: 16 }} />
            )}

            <Space style={{ marginTop: 16 }}>
              <Button onClick={() => message.success('档案摘要已复制')}>复制摘要</Button>
              <ExportButton icon={<CloudDownloadOutlined />} onExport={() => message.success('完整档案包已导出')}>导出档案包</ExportButton>
            </Space>
          </>
        )}
      </Drawer>
    </>
  )
}
