import { useState } from 'react'
import {
  Alert,
  App,
  Button,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import {
  AlertOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  EMERGENCY_DRILL_RECORDS,
  EMERGENCY_PLAN_TEMPLATES,
  launchEmergencyPlan,
} from '../../../../mock/risk'

const { Text, Paragraph, Title } = Typography
const statusColor = { 有效: 'success', 待演练: 'warning', 需更新: 'error', 整改中: 'processing', 已完成: 'success' }

export default function EmergencyTab({ onGoExecution }) {
  const { message } = App.useApp()
  const [selectedPlan, setSelectedPlan] = useState(EMERGENCY_PLAN_TEMPLATES[0])
  const [detailOpen, setDetailOpen] = useState(false)
  const [launchResult, setLaunchResult] = useState(null)
  const [launchModal, setLaunchModal] = useState(false)
  const [drillForm] = Form.useForm()

  const handleLaunch = () => {
    Modal.confirm({
      title: '确认一键启动应急预案',
      content: `将启动「${selectedPlan.name}」，向指挥小组发送最高级别警报并自动分发任务。`,
      okText: '确认启动',
      okButtonProps: { danger: true },
      onOk: () => {
        const result = launchEmergencyPlan(selectedPlan.id)
        setLaunchResult(result)
        setLaunchModal(true)
        message.success('预案已启动 · 任务分发完成（<5分钟）')
        onGoExecution?.(result)
      },
    })
  }

  const handleDrillSubmit = () => {
    drillForm.validateFields().then(() => {
      message.success('演练记录已保存，已生成预案更新任务')
      drillForm.resetFields()
    })
  }

  return (
    <>
      <Alert
        type="warning"
        showIcon
        icon={<AlertOutlined />}
        style={{ marginBottom: 16 }}
        message="提前储备 · 定期演练 · 快速启动"
        description="针对战争、罢工、供应商事故、制裁升级等重大突发事件"
      />

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title"><SafetyOutlined /> 预案数字化模板库</h3>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={EMERGENCY_PLAN_TEMPLATES}
              rowClassName={(r) => (r.id === selectedPlan.id ? 'result-grade-active' : '')}
              onRow={(r) => ({ onClick: () => setSelectedPlan(r), style: { cursor: 'pointer' } })}
              columns={[
                { title: '预案名称', dataIndex: 'name', key: 'name', ellipsis: true },
                { title: '类别', dataIndex: 'category', key: 'category', width: 100 },
                { title: '演练周期', dataIndex: 'drillCycle', key: 'drillCycle', width: 90 },
                { title: '下次演练', dataIndex: 'nextDrill', key: 'nextDrill', width: 110 },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 80,
                  render: (v) => <Tag color={statusColor[v]}>{v}</Tag>,
                },
              ]}
            />
            <Space style={{ marginTop: 12 }}>
              <Button onClick={() => setDetailOpen(true)}>查看模板详情</Button>
              <Button type="primary" danger icon={<ThunderboltOutlined />} onClick={handleLaunch}>
                一键启动
              </Button>
            </Space>
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title"><CalendarOutlined /> 演练与更新管理</h3>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={EMERGENCY_DRILL_RECORDS}
              columns={[
                { title: '日期', dataIndex: 'date', key: 'date', width: 100 },
                { title: '模式', dataIndex: 'mode', key: 'mode', width: 90 },
                { title: '问题', dataIndex: 'issues', key: 'issues', render: (v) => v.join('；') },
                { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => <Tag color={statusColor[v]}>{v}</Tag> },
              ]}
            />
            <Title level={5} style={{ marginTop: 16 }}>录入演练记录</Title>
            <Form form={drillForm} layout="vertical" size="small">
              <Form.Item name="planId" label="关联预案" initialValue={selectedPlan.id}>
                <Select options={EMERGENCY_PLAN_TEMPLATES.map((p) => ({ value: p.id, label: p.name }))} />
              </Form.Item>
              <Form.Item name="mode" label="演练模式" rules={[{ required: true }]}>
                <Select options={[{ value: '桌面推演', label: '桌面推演' }, { value: '模拟实战', label: '模拟实战' }]} />
              </Form.Item>
              <Form.Item name="issues" label="发现问题" rules={[{ required: true }]}>
                <Input.TextArea rows={2} placeholder="演练中发现的问题及改进建议" />
              </Form.Item>
              <Button block icon={<PlayCircleOutlined />} onClick={handleDrillSubmit}>保存并生成更新任务</Button>
            </Form>
            <Alert type="info" showIcon style={{ marginTop: 12 }} message="外部环境变化时将触发预案适应性评估提醒" />
          </div>
        </Col>
      </Row>

      <Drawer title={selectedPlan.name} open={detailOpen} onClose={() => setDetailOpen(false)} width={620}>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="风险场景">{selectedPlan.riskScene}</Descriptions.Item>
          <Descriptions.Item label="指挥小组">
            组长 {selectedPlan.commander.leader} · 副组长 {selectedPlan.commander.deputy} · 24h {selectedPlan.commander.hotline}
          </Descriptions.Item>
          <Descriptions.Item label="沟通计划">对内：{selectedPlan.commPlan.internal} · 对外：{selectedPlan.commPlan.external}</Descriptions.Item>
          <Descriptions.Item label="业务连续性">{selectedPlan.continuity.join(' · ')}</Descriptions.Item>
          <Descriptions.Item label="数据备份">{selectedPlan.backup.freq} · {selectedPlan.backup.location} · RTO {selectedPlan.backup.recovery}</Descriptions.Item>
          <Descriptions.Item label="法律合规">{selectedPlan.legal.join(' · ')}</Descriptions.Item>
          <Descriptions.Item label="应急资源">{selectedPlan.resources.join(' · ')}</Descriptions.Item>
          <Descriptions.Item label="上次演练">{selectedPlan.lastDrill} · 下次 {selectedPlan.nextDrill}</Descriptions.Item>
        </Descriptions>
      </Drawer>

      <Modal
        title="应急预案已启动"
        open={launchModal}
        onCancel={() => setLaunchModal(false)}
        footer={[
          <Button key="exec" type="primary" onClick={() => { setLaunchModal(false); onGoExecution?.() }}>查看执行任务</Button>,
          <Button key="close" onClick={() => setLaunchModal(false)}>关闭</Button>,
        ]}
        width={640}
      >
        {launchResult && (
          <>
            <Alert type="error" showIcon message={`${launchResult.planName} · 启动耗时 ${launchResult.elapsed}`} />
            <Title level={5} style={{ marginTop: 16 }}>自动化流程</Title>
            <Timeline items={launchResult.alerts.map((a) => ({ color: 'red', children: a }))} />
            <Paragraph><Text strong>工作空间：</Text>{launchResult.workspace.join(' · ')}</Paragraph>
            <Paragraph><Text strong>{launchResult.meeting}</Text></Paragraph>
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={launchResult.tasks}
              columns={[
                { title: '行动项', dataIndex: 'action', key: 'action' },
                { title: '责任人', dataIndex: 'owner', key: 'owner', width: 90 },
                { title: '时限', dataIndex: 'deadline', key: 'deadline', width: 90 },
                { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
              ]}
            />
          </>
        )}
      </Modal>
    </>
  )
}
