import { useMemo, useState } from 'react'
import { App, Button, Col, Form, Input, Modal, Row, Select, Space, Steps, Switch, Table, Tag, Typography } from 'antd'
import { CheckOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { TEXT_CLEANING_SAMPLES } from '../../../mock/data-governance'
import { enrichEntityLinkRules, getPlatformMetrics } from '../../../mock/data-bridge'

const { Text } = Typography

export default function TransformTab({
  featureRules,
  setFeatureRules,
  normConfig,
  setNormConfig,
  transformApplied,
  onApplyTransform,
  onGoReport,
}) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [featureModal, setFeatureModal] = useState(false)
  const [normModal, setNormModal] = useState(null)
  const [linkStep, setLinkStep] = useState(3)
  const [featureForm] = Form.useForm()
  const [normForm] = Form.useForm()
  const platformMetrics = useMemo(() => getPlatformMetrics(), [])
  const entityLinkRules = useMemo(() => enrichEntityLinkRules(platformMetrics), [platformMetrics])

  const saveFeature = () => {
    featureForm.validateFields().then((values) => {
      setFeatureRules((prev) => [...prev, { id: `FR-${Date.now()}`, ...values, status: 'active' }])
      setFeatureModal(false)
      featureForm.resetFields()
      message.success('特征规则已添加')
    })
  }

  const saveNorm = () => {
    normForm.validateFields().then((values) => {
      setNormConfig((prev) => prev.map((n) => (n.id === normModal.id ? { ...n, ...values } : n)))
      setNormModal(null)
      message.success('归一化配置已更新')
    })
  }

  const runLinkPreview = () => {
    setLinkStep(0)
    let step = 0
    const timer = setInterval(() => {
      step += 1
      setLinkStep(step)
      if (step >= 3) {
        clearInterval(timer)
        message.success('数据关联预览完成 · 企业-商品-商机多维画像已就绪')
      }
    }, 600)
  }

  return (
    <>
      <div className="business-panel" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => onApplyTransform?.()}
          >
            {transformApplied ? '重新应用转换规则' : '应用转换与增强规则'}
          </Button>
          <Button icon={<CheckOutlined />} onClick={() => onGoReport?.()}>前往质量评估报告 →</Button>
          <Button onClick={() => navigate('/data/models?tab=factory')}>清洗完成 · 模型训练 →</Button>
          {transformApplied && <Tag color="success">转换规则已应用 · 可生成质量报告</Tag>}
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>数据归一化/标准化</h3>
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
              Min-Max / Z-Score 消除量纲差异 · 币种与单位统一换算
            </Text>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={normConfig}
              columns={[
                { title: '字段', dataIndex: 'field', key: 'field' },
                { title: '方法', dataIndex: 'method', key: 'method', render: (v) => ({ min_max: 'Min-Max', z_score: 'Z-Score', currency: '币种折算', unit: '单位换算' }[v] || v) },
                { title: '范围', dataIndex: 'range', key: 'range' },
                { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: () => <Tag color="success">启用</Tag> },
                {
                  title: '操作',
                  key: 'op',
                  width: 60,
                  render: (_, r) => (
                    <Button type="link" size="small" onClick={() => { setNormModal(r); normForm.setFieldsValue(r) }}>
                      编辑
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>特征工程规则</h3>
              <Button size="small" icon={<PlusOutlined />} onClick={() => setFeatureModal(true)}>新增</Button>
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
              从原始字段衍生存续年限、流动性指标、产品标签等高价值特征
            </Text>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={featureRules}
              columns={[
                { title: '衍生特征', dataIndex: 'name', key: 'name' },
                { title: '来源字段', dataIndex: 'source', key: 'source', ellipsis: true },
                { title: '计算方式', dataIndex: 'formula', key: 'formula', ellipsis: true },
                { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: () => <Tag color="success">启用</Tag> },
              ]}
            />
          </div>
        </Col>
        <Col span={24}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>数据关联整合</h3>
              <Button size="small" onClick={runLinkPreview}>运行关联预览</Button>
            </div>
            <Steps
              current={linkStep}
              items={[
                { title: '海关出口商', description: '统一社会信用代码 / HS编码' },
                { title: '邓白氏信用', description: 'DUNS / 信用报告关联' },
                { title: '企业多维画像', description: `${platformMetrics.enterpriseCount} 家企业融合` },
                { title: '商机评估输入', description: `${platformMetrics.activeOpportunities} 条有效商机` },
              ]}
            />
            <Table
              style={{ marginTop: 16 }}
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={entityLinkRules}
              columns={[
                { title: '左表', dataIndex: 'left', key: 'left' },
                { title: '关联键', dataIndex: 'leftKey', key: 'leftKey' },
                { title: '右表', dataIndex: 'right', key: 'right' },
                { title: '关联键', dataIndex: 'rightKey', key: 'rightKey' },
                { title: '已关联', dataIndex: 'linked', key: 'linked', width: 90, render: (v) => `${v.toLocaleString()} 条` },
                { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: () => <Tag color="success">启用</Tag> },
              ]}
            />
          </div>
        </Col>
        <Col span={24}>
          <div className="business-panel">
            <h3 className="business-panel-title">文本清洗与 NER 处理</h3>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
              分词 · 去停用词 · 词形还原 · 命名实体识别（公司/产品/地名）
            </Text>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={TEXT_CLEANING_SAMPLES}
              columns={[
                { title: '原始文本', dataIndex: 'raw', key: 'raw', ellipsis: true },
                { title: '处理流程', dataIndex: 'steps', key: 'steps', width: 160 },
                { title: '分词结果', dataIndex: 'tokens', key: 'tokens', ellipsis: true },
                { title: '命名实体', dataIndex: 'entities', key: 'entities', ellipsis: true },
              ]}
            />
          </div>
        </Col>
      </Row>

      <Modal title="新增特征规则" open={featureModal} onCancel={() => setFeatureModal(false)} onOk={saveFeature}>
        <Form form={featureForm} layout="vertical">
          <Form.Item name="name" label="衍生特征" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="source" label="来源字段" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="formula" label="计算方式" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑归一化配置" open={!!normModal} onCancel={() => setNormModal(null)} onOk={saveNorm}>
        <Form form={normForm} layout="vertical">
          <Form.Item name="field" label="字段"><Input disabled /></Form.Item>
          <Form.Item name="method" label="方法" rules={[{ required: true }]}>
            <Select options={[
              { value: 'min_max', label: 'Min-Max [0,1]' },
              { value: 'z_score', label: 'Z-Score 标准化' },
              { value: 'currency', label: '币种折算' },
              { value: 'unit', label: '单位换算' },
            ]}
            />
          </Form.Item>
          <Form.Item name="range" label="范围/说明"><Input /></Form.Item>
          <Form.Item name="status" label="启用" valuePropName="checked"><Switch defaultChecked /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}
