import { useState } from 'react'
import {
  App,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Upload,
} from 'antd'
import { InboxOutlined, UploadOutlined } from '@ant-design/icons'
import { INITIAL_RISK_TASKS } from '../../../../mock/risk'
import '../../business.css'

const { Dragger } = Upload
const levelColor = { 高: 'error', 中: 'warning', 低: 'success' }
const OWNERS = ['王芳', '张强', '赵磊', '李明', '陈静']

export default function ExecutionTab({ injectedTasks, onGoArchive, onGoTracking }) {
  const { message } = App.useApp()
  const [tasks, setTasks] = useState(() => {
    if (!injectedTasks?.length) return INITIAL_RISK_TASKS
    const extra = injectedTasks.map((t, i) => ({
      id: t.id || `RT-N${i}`,
      title: t.item || t.action || t.title,
      level: '高',
      type: '应对行动',
      reporter: '策略/预案推送',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      owner: t.owner || '',
      records: [{ time: new Date().toLocaleString('zh-CN', { hour12: false }), action: '计划推送', user: '系统', note: '来自应对计划或预案启动' }],
    }))
    return { ...INITIAL_RISK_TASKS, pending: [...extra, ...INITIAL_RISK_TASKS.pending] }
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [processModalOpen, setProcessModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [processForm] = Form.useForm()

  const columns = (status) => [
    { title: '编号', dataIndex: 'id', key: 'id', width: 100 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 70,
      render: (v) => <Tag color={levelColor[v]}>{v}</Tag>,
    },
    { title: '责任人', dataIndex: 'owner', key: 'owner', width: 90, render: (v) => v || '-' },
    { title: '时间', dataIndex: 'time', key: 'time', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setCurrentTask(record); setDrawerOpen(true) }}>流程</Button>
          {status === 'pending' && (
            <Button type="link" size="small" onClick={() => { setCurrentTask(record); setProcessModalOpen(true) }}>处置</Button>
          )}
          {status === 'processing' && (
            <Button type="link" size="small" onClick={() => handleArchive(record)}>归档</Button>
          )}
        </Space>
      ),
    },
  ]

  const handleProcess = () => {
    processForm.validateFields().then((values) => {
      const now = new Date().toLocaleString('zh-CN', { hour12: false })
      setTasks((prev) => {
        const task = prev.pending.find((t) => t.id === currentTask.id)
        const updated = {
          ...task,
          owner: values.owner,
          records: [
            ...task.records,
            { time: now, action: '分配责任人', user: '管理员', note: `指派 ${values.owner}` },
            { time: now, action: '处置说明', user: values.owner, note: values.note },
          ],
        }
        return {
          ...prev,
          pending: prev.pending.filter((t) => t.id !== currentTask.id),
          processing: [updated, ...prev.processing],
        }
      })
      setProcessModalOpen(false)
      processForm.resetFields()
      message.success('执行跟踪已启动 · 可追溯')
    })
  }

  const handleArchive = (record) => {
    Modal.confirm({
      title: '复盘归档',
      content: '确认处置完毕并归档？归档后将沉淀为策略资产。',
      onOk: () => {
        const now = new Date().toLocaleString('zh-CN', { hour12: false })
        setTasks((prev) => {
          const updated = {
            ...record,
            records: [...record.records, { time: now, action: '归档复盘', user: record.owner, note: '风险已消除，经验已沉淀' }],
          }
          return {
            ...prev,
            processing: prev.processing.filter((t) => t.id !== record.id),
            archived: [updated, ...prev.archived],
          }
        })
        message.success('已归档 · 复盘沉淀完成 · 数字档案已生成')
        onGoArchive?.()
      },
    })
  }

  const tabItems = [
    { key: 'pending', label: `待执行 (${tasks.pending.length})`, children: <Table rowKey="id" size="small" columns={columns('pending')} dataSource={tasks.pending} pagination={false} /> },
    { key: 'processing', label: `执行中 (${tasks.processing.length})`, children: <Table rowKey="id" size="small" columns={columns('processing')} dataSource={tasks.processing} pagination={false} /> },
    { key: 'archived', label: `已复盘 (${tasks.archived.length})`, children: <Table rowKey="id" size="small" columns={columns('archived')} dataSource={tasks.archived} pagination={false} /> },
  ]

  return (
    <>
      <div className="business-panel">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Space>
            {onGoTracking && <Button size="small" onClick={onGoTracking}>效果跟踪</Button>}
            {onGoArchive && <Button size="small" onClick={onGoArchive}>风险档案</Button>}
          </Space>
        </div>
        <Tabs items={tabItems} />
      </div>

      <Drawer title="执行全流程 · 可追溯" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}>
        {currentTask && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="编号">{currentTask.id}</Descriptions.Item>
              <Descriptions.Item label="标题">{currentTask.title}</Descriptions.Item>
              <Descriptions.Item label="责任人">{currentTask.owner || '未分配'}</Descriptions.Item>
            </Descriptions>
            <Timeline
              items={currentTask.records.map((r) => ({
                children: (
                  <div>
                    <div><Tag>{r.action}</Tag> {r.time}</div>
                    <div style={{ color: '#595959', marginTop: 4 }}>{r.user}：{r.note}</div>
                  </div>
                ),
              }))}
            />
            {currentTask.owner && (
              <Dragger style={{ marginTop: 16 }} beforeUpload={() => { message.success('凭证已上传'); return false }}>
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p>上传处置凭证 · 支持版本管理</p>
              </Dragger>
            )}
          </>
        )}
      </Drawer>

      <Modal title="启动执行" open={processModalOpen} onCancel={() => setProcessModalOpen(false)} onOk={handleProcess} destroyOnClose>
        <Form form={processForm} layout="vertical">
          <Form.Item label="责任人" name="owner" rules={[{ required: true }]}>
            <Select options={OWNERS.map((o) => ({ label: o, value: o }))} />
          </Form.Item>
          <Form.Item label="执行说明" name="note" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="附件">
            <Upload beforeUpload={() => { message.success('附件已上传'); return false }}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
