import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import {
  ApiOutlined,
  CloudDownloadOutlined,
  FileSearchOutlined,
  NodeIndexOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {
  HS_PRODUCT_OPTIONS,
  getPolicyData,
} from '../../../../mock/analysis'

const { Text, Paragraph } = Typography

const impactColor = { '实质性风险': 'error', '潜在约束': 'warning', '阶段性机会': 'success' }
const statusColor = { 符合: 'success', 部分符合: 'warning', 不符合: 'error' }
const nodeColor = { policy: '#B32620', product: '#1677ff', enterprise: '#52c41a', risk: '#ff4d4f' }

export default function PolicyTab({ country, initialHs }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [subTab, setSubTab] = useState('nlp')
  const [hsCode, setHsCode] = useState(initialHs || '8507')
  const [selectedDoc, setSelectedDoc] = useState(null)

  useEffect(() => {
    if (initialHs) setHsCode(initialHs)
  }, [initialHs])

  const data = useMemo(() => getPolicyData(country, hsCode), [country, hsCode])
  const doc = selectedDoc || data.matchedDocs[0]

  const matchScore = useMemo(() => {
    const ok = data.checklist.filter((c) => c.status === '符合').length
    return Math.round((ok / data.checklist.length) * 100)
  }, [data.checklist])

  const nlpTab = (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="多语言自动采集与翻译"
        description="系统持续抓取目标国政府部门、海关、标准化组织官网政策文本，采用贸易语料训练的NMT模型完成高质量翻译。"
        action={
          <Space>
            <Button
              size="small"
              onClick={() => {
                message.loading({ content: '正在爬取目标国官网政策…', key: 'crawl', duration: 1.2 })
                setTimeout(() => {
                  message.success({ content: `已采集 ${data.matchedDocs?.length || 0} 份政策文本并入库`, key: 'crawl' })
                }, 1200)
              }}
            >
              立即采集
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => message.success('NMT 翻译已刷新 · 法律术语保留率 98.6%（Mock）')}
            >
              刷新翻译
            </Button>
          </Space>
        }
      />

      <div className="business-panel">
        <h3 className="business-panel-title">政策文本库 · 结构化抽取</h3>
        <Table
          rowKey="id"
          size="small"
          dataSource={data.matchedDocs}
          pagination={false}
          onRow={(record) => ({
            onClick: () => setSelectedDoc(record),
            style: { cursor: 'pointer', background: doc?.id === record.id ? '#fff1f0' : undefined },
          })}
          columns={[
            { title: '法规名称', dataIndex: 'titleCn', key: 'titleCn', ellipsis: true },
            { title: '机构', dataIndex: 'agency', key: 'agency', width: 100 },
            { title: '翻译', dataIndex: 'lang', key: 'lang', width: 80 },
            { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (v) => <Tag>{v}</Tag> },
            { title: '影响', dataIndex: 'impact', key: 'impact', width: 100, render: (v) => <Tag color={impactColor[v]}>{v}</Tag> },
          ]}
        />
      </div>

      {doc && (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <div className="business-panel">
              <h3 className="business-panel-title">原文 / 译文对照</h3>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="原文">{doc.title}</Descriptions.Item>
                <Descriptions.Item label="译文">{doc.titleCn}</Descriptions.Item>
                <Descriptions.Item label="生效">{doc.effective}</Descriptions.Item>
                <Descriptions.Item label="过渡期">{doc.transition || '-'}</Descriptions.Item>
                <Descriptions.Item label="HS编码">{(doc.hsCodes || []).join(', ')}</Descriptions.Item>
              </Descriptions>
              <Paragraph style={{ marginTop: 12 }}><Text strong>解读摘要：</Text>{doc.summary}</Paragraph>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="business-panel">
              <h3 className="business-panel-title">NER 关键信息抽取</h3>
              <Table
                rowKey="type"
                size="small"
                pagination={false}
                dataSource={doc.entities}
                columns={[
                  { title: '字段', dataIndex: 'type', key: 'type', width: 100 },
                  { title: '抽取值', dataIndex: 'value', key: 'value' },
                ]}
              />
            </div>
          </Col>
        </Row>
      )}
    </>
  )

  const graphTab = (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {(data.alerts || []).map((a) => (
          <Col xs={24} sm={12} lg={6} key={a.id}>
            <Alert
              type={a.type === '趋严' ? 'warning' : a.type === '机会' ? 'success' : 'info'}
              showIcon
              icon={<WarningOutlined />}
              message={a.title}
              description={`${a.horizon} · 概率 ${a.prob}% · ${a.type}`}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">合规知识图谱 · 政策—产品—企业—风险</h3>
            <div className="policy-graph-canvas">
              {(data.graph?.nodes || []).map((n) => (
                <div
                  key={n.id}
                  className={`policy-graph-node policy-graph-node-${n.type}`}
                  style={{ left: `${n.x}%`, top: `${n.y}%`, borderColor: nodeColor[n.type] }}
                >
                  {n.label}
                </div>
              ))}
              <svg className="policy-graph-edges">
                {(data.graph?.edges || []).map((e, i) => {
                  const from = data.graph.nodes.find((n) => n.id === e.from)
                  const to = data.graph.nodes.find((n) => n.id === e.to)
                  if (!from || !to) return null
                  return (
                    <line
                      key={i}
                      x1={`${from.x}%`}
                      y1={`${from.y}%`}
                      x2={`${to.x}%`}
                      y2={`${to.y}%`}
                      stroke="#d9d9d9"
                      strokeWidth="1.5"
                    />
                  )
                })}
              </svg>
            </div>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">影响模拟器</h3>
            <Form layout="vertical" size="small">
              <Form.Item label="产品 HS 编码">
                <Select value={hsCode} options={HS_PRODUCT_OPTIONS} onChange={setHsCode} />
              </Form.Item>
              <Form.Item label="产品规格（可选）">
                <Input placeholder="如：磷酸铁锂 / 纯电SUV" />
              </Form.Item>
            </Form>
            <Card size="small" style={{ marginBottom: 12 }}>
              <Text type="secondary">合规匹配度</Text>
              <Progress percent={matchScore} strokeColor="#B32620" />
              <Text type="secondary">已匹配 {data.matchedDocs.length} 项适用法规</Text>
            </Card>
            <Button type="primary" block onClick={() => message.success('《目标市场合规清单》已生成')}>
              生成合规清单
            </Button>
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <h3 className="business-panel-title" style={{ margin: 0 }}>《目标市场合规清单》</h3>
          <Space>
            <Button icon={<CloudDownloadOutlined />} onClick={() => message.success('合规清单已导出')}>导出</Button>
            <Button icon={<ApiOutlined />} onClick={() => message.success('已推送合规任务至 ERP（Mock）')}>推送任务</Button>
          </Space>
        </div>
        <Table
          rowKey="regulation"
          size="small"
          pagination={false}
          dataSource={data.checklist}
          columns={[
            { title: '法规', dataIndex: 'regulation', key: 'regulation', width: 110 },
            { title: '合规要求', dataIndex: 'requirement', key: 'requirement' },
            { title: '匹配度', dataIndex: 'status', key: 'status', width: 90, render: (v) => <Tag color={statusColor[v]}>{v}</Tag> },
            { title: '差距', dataIndex: 'gap', key: 'gap', width: 140, ellipsis: true },
            { title: '行动建议', dataIndex: 'action', key: 'action', ellipsis: true },
          ]}
        />
      </div>
    </>
  )

  return (
    <>
      <div className="business-filter-bar">
        <Space>
          <Text>政策影响模拟基于当前目标市场</Text>
          <Tag color="processing">实时更新</Tag>
        </Space>
        <Button type="link" onClick={() => setSubTab(subTab === 'nlp' ? 'graph' : 'nlp')}>
          {subTab === 'nlp' ? '合规图谱 →' : '← 政策文本处理'}
        </Button>
        <Button type="link" onClick={() => navigate(`/analysis/product?hs=${hsCode}&tab=query`)}>关联商品分析 →</Button>
      </div>

      <Tabs
        activeKey={subTab}
        onChange={setSubTab}
        items={[
          { key: 'nlp', label: <span><FileSearchOutlined /> 政策文本智能处理</span>, children: nlpTab },
          { key: 'graph', label: <span><NodeIndexOutlined /> 合规知识图谱与影响模拟</span>, children: graphTab },
        ]}
      />
    </>
  )
}
