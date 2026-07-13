import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Row,
  Select,
  Slider,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  ApiOutlined,
  CloudDownloadOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../../../auth/AuthContext'
import ExportButton from '../../../../components/ExportButton'
import {
  DEFAULT_RULES,
  INDUSTRY_PRESETS,
  ML_MODELS,
  RISK_ATOM_CATEGORIES,
  RISK_INDICATOR_ATOMS,
  RULE_TEMPLATES,
  RULE_VERSION_HISTORY,
  buildRulePreview,
  runRuleBacktest,
} from '../../../../mock/risk'

const { Text, Paragraph } = Typography

export default function IndicatorTab({ onGoMonitoring, onGoAssessment }) {
  const { message } = App.useApp()
  const { can } = useAuth()
  const canWrite = can('action:risk:write')
  const [category, setCategory] = useState('全部')
  const [selectedAtoms, setSelectedAtoms] = useState([])
  const [logic, setLogic] = useState('AND')
  const [sensitivity, setSensitivity] = useState(70)
  const [ruleName, setRuleName] = useState('自定义风险规则')
  const [backtest, setBacktest] = useState(null)
  const [rules, setRules] = useState(DEFAULT_RULES)

  const atoms = useMemo(
    () => (category === '全部' ? RISK_INDICATOR_ATOMS : RISK_INDICATOR_ATOMS.filter((a) => a.category === category)),
    [category],
  )

  const preview = useMemo(
    () => buildRulePreview(selectedAtoms.length ? selectedAtoms : [RISK_INDICATOR_ATOMS[0]], logic, sensitivity),
    [selectedAtoms, logic, sensitivity],
  )

  const toggleAtom = (atom) => {
    setSelectedAtoms((prev) => {
      const exists = prev.find((a) => a.id === atom.id)
      if (exists) return prev.filter((a) => a.id !== atom.id)
      return [...prev, atom]
    })
  }

  const applyTemplate = (tpl) => {
    setRuleName(tpl.name)
    message.success(`已加载模板：${tpl.name}`)
  }

  const handleSaveRule = () => {
    if (!canWrite) {
      message.warning('当前角色无风险识别配置权限')
      return
    }
    setRules((prev) => [
      {
        id: `rule-${Date.now()}`,
        name: ruleName,
        version: 'v1.0',
        status: '启用',
        level: sensitivity >= 80 ? '紧急' : sensitivity >= 60 ? '高' : '中',
        sensitivity: sensitivity >= 80 ? '高' : '中',
        updatedAt: '2026-07-02',
        operator: '当前用户',
        triggers: 0,
        accuracy: '-',
      },
      ...prev,
    ])
    message.success('规则已保存并启用 · 版本 v1.0')
  }

  const handleBacktest = () => {
    setBacktest(runRuleBacktest(ruleName))
    message.success('历史回测完成（3年数据）')
  }

  return (
    <>
      <Row gutter={16}>
        <Col xs={24} lg={6}>
          <div className="business-panel rule-builder-panel">
            <h3 className="business-panel-title">指标原子库</h3>
            <Select value={category} style={{ width: '100%', marginBottom: 12 }} options={RISK_ATOM_CATEGORIES.map((c) => ({ value: c, label: c }))} onChange={setCategory} />
            <div className="rule-atom-list">
              {atoms.map((a) => (
                <Card
                  key={a.id}
                  size="small"
                  hoverable
                  className={selectedAtoms.some((x) => x.id === a.id) ? 'forecast-scenario-active' : ''}
                  onClick={() => toggleAtom(a)}
                  style={{ marginBottom: 8, cursor: 'pointer' }}
                >
                  <Tag>{a.category}</Tag>
                  <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4 }}>{a.name}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{a.source}</Text>
                </Card>
              ))}
            </div>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title"><NodeIndexOutlined /> 图形化规则构建器</h3>
            <Form layout="vertical" size="small">
              <Form.Item label="规则名称">
                <Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="逻辑运算">
                    <Select value={logic} options={[{ value: 'AND', label: 'AND' }, { value: 'OR', label: 'OR' }]} onChange={setLogic} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="时间窗口">
                    <Select defaultValue="30d" options={[{ value: '7d', label: '7天' }, { value: '30d', label: '30天' }, { value: '90d', label: '90天' }]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label={`敏感度 ${sensitivity}`}>
                    <Slider min={40} max={100} value={sensitivity} onChange={setSensitivity} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <div className="rule-canvas">
              <div className="rule-canvas-node start">IF 开始</div>
              {(selectedAtoms.length ? selectedAtoms : [RISK_INDICATOR_ATOMS[0]]).map((a, i) => (
                <div key={a.id} className="rule-canvas-flow">
                  {i > 0 && <Tag className="rule-logic-tag">{logic}</Tag>}
                  <div className="rule-canvas-node atom">{a.name}</div>
                </div>
              ))}
              <div className="rule-canvas-node end">THEN 触发预警 · {sensitivity >= 80 ? '紧急' : '高'}</div>
            </div>

            <Paragraph type="secondary" style={{ background: '#fafafa', padding: 12, borderRadius: 6, marginTop: 12 }}>
              <Text code>{preview}</Text>
            </Paragraph>

            <Space wrap style={{ marginTop: 12 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleSaveRule} disabled={!canWrite}>保存并启用</Button>
              <Button icon={<PlayCircleOutlined />} onClick={handleBacktest}>历史回测</Button>
              <ExportButton icon={<CloudDownloadOutlined />} onExport={() => message.success('规则已导出')}>导出</ExportButton>
            </Space>
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">示例规则模板</h3>
            <Row gutter={12}>
              {RULE_TEMPLATES.map((tpl) => (
                <Col xs={24} md={8} key={tpl.id}>
                  <Card size="small" hoverable onClick={() => applyTemplate(tpl)}>
                    <Tag color="error">{tpl.level}</Tag>
                    <div style={{ fontWeight: 600, marginTop: 8 }}>{tpl.name}</div>
                    <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>{tpl.desc}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Col>

        <Col xs={24} lg={6}>
          <div className="business-panel">
            <h3 className="business-panel-title"><ExperimentOutlined /> AI指标注入</h3>
            {ML_MODELS.map((m) => (
              <Card key={m.id} size="small" style={{ marginBottom: 8 }}>
                <Text strong>{m.name}</Text>
                <div><Tag color="purple">ML输出</Tag> {m.output} ({m.unit})</div>
                <Button type="link" size="small" onClick={() => toggleAtom({ id: m.id, name: m.name, category: 'AI预测' })}>加入规则</Button>
              </Card>
            ))}
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">行业敏感度预设</h3>
            {INDUSTRY_PRESETS.map((p) => (
              <Card key={p.id} size="small" style={{ marginBottom: 8 }}>
                <Text strong>{p.label}</Text>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {Object.entries(p.sensitivity).map(([k, v]) => <Tag key={k}>{k}:{v}</Tag>)}
                </div>
              </Card>
            ))}
          </div>
        </Col>
      </Row>

      {backtest && (
        <div className="business-panel">
          <h3 className="business-panel-title">回测结果 · {backtest.period}</h3>
          <Descriptions bordered column={4} size="small">
            <Descriptions.Item label="触发次数">{backtest.triggers}</Descriptions.Item>
            <Descriptions.Item label="误报">{backtest.falsePositive}</Descriptions.Item>
            <Descriptions.Item label="漏报">{backtest.falseNegative}</Descriptions.Item>
            <Descriptions.Item label="准确率">{backtest.accuracy}%</Descriptions.Item>
          </Descriptions>
          <Table
            rowKey="date"
            size="small"
            style={{ marginTop: 12 }}
            pagination={false}
            dataSource={backtest.hitEvents}
            columns={[
              { title: '时间', dataIndex: 'date', key: 'date' },
              { title: '事件', dataIndex: 'event', key: 'event' },
              { title: '捕获', dataIndex: 'caught', key: 'caught', render: (v) => <Tag color={v ? 'success' : 'error'}>{v ? '是' : '误报'}</Tag> },
            ]}
          />
        </div>
      )}

      <div className="business-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 className="business-panel-title" style={{ margin: 0 }}><HistoryOutlined /> 规则版本管理</h3>
          {onGoAssessment && <Button type="link" onClick={onGoAssessment}>进入风险评估 →</Button>}
          {onGoMonitoring && <Button type="primary" onClick={onGoMonitoring}>进入监测预警 →</Button>}
        </div>
        <Table rowKey="id" size="small" pagination={false} dataSource={rules} columns={[
          { title: '规则', dataIndex: 'name', key: 'name', ellipsis: true },
          { title: '版本', dataIndex: 'version', key: 'version', width: 70 },
          { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: (v) => <Tag color={v === '启用' ? 'success' : 'default'}>{v}</Tag> },
          { title: '等级', dataIndex: 'level', key: 'level', width: 70 },
          { title: '准确率', dataIndex: 'accuracy', key: 'accuracy', width: 70, render: (v) => v === '-' ? '-' : `${v}%` },
          { title: '更新', dataIndex: 'updatedAt', key: 'updatedAt', width: 100 },
        ]} />
        <Table rowKey="version" size="small" style={{ marginTop: 12 }} pagination={false} dataSource={RULE_VERSION_HISTORY} columns={[
          { title: '版本', dataIndex: 'version', key: 'version', width: 70 },
          { title: '时间', dataIndex: 'date', key: 'date', width: 100 },
          { title: '操作人', dataIndex: 'operator', key: 'operator', width: 80 },
          { title: '变更', dataIndex: 'change', key: 'change' },
        ]} />
      </div>
    </>
  )
}
