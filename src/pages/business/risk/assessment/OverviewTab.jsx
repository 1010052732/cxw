import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Col, Row, Space, Table, Tag, Typography } from 'antd'
import {
  AlertOutlined,
  ApartmentOutlined,
  ArrowRightOutlined,
  FundProjectionScreenOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Column } from '@ant-design/charts'
import { useAuth } from '../../../../auth/AuthContext'
import {
  ASSESSMENT_MODEL_CATALOG,
  getAssessmentOverview,
} from '../../../../mock/risk'

const { Text, Paragraph } = Typography
const levelColor = { 高: 'error', 中: 'warning', 低: 'success' }

export default function OverviewTab({ onGoModel, onGoParams, onGoResults, onGoResponse }) {
  const navigate = useNavigate()
  const { filterModuleData, getDataRule } = useAuth()
  const data = useMemo(() => getAssessmentOverview(), [])

  const visibleSignals = useMemo(
    () => filterModuleData(data.signals, 'risk', { dept: 'dept', region: 'region' }),
    [data.signals, filterModuleData],
  )

  const dataRule = getDataRule('risk')

  const modelUsage = useMemo(
    () => [
      { model: 'EL', count: 12 },
      { model: 'VaR', count: 9 },
      { model: '矩阵', count: 8 },
      { model: 'FTA', count: 6 },
      { model: 'LSTM', count: 4 },
      { model: 'NLP', count: 5 },
    ],
    [],
  )

  return (
    <>
      {dataRule.scope !== 'all' && (
        <Alert type="info" showIcon style={{ marginBottom: 16 }} message={`数据权限已生效 · 范围：${dataRule.scope} · 可见 ${visibleSignals.length}/${data.signals.length} 条信号`} />
      )}
      <div className="assessment-pipeline">
        {[
          { label: '风险识别', desc: '指标·监测·展示', action: () => navigate('/risk/identification') },
          { label: '风险评估', desc: '模型·量化·前瞻', active: true },
          { label: '风险应对', desc: '任务·处置·归档', action: onGoResponse },
        ].map((step, idx, arr) => (
          <div key={step.label} className="assessment-pipeline-item">
            <div className={`assessment-pipeline-node${step.active ? ' active' : ''}`}>
              <span>{idx + 1}</span>
              <Text strong>{step.label}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{step.desc}</Text>
              {step.action && (
                <Button type="link" size="small" onClick={step.action}>进入</Button>
              )}
            </div>
            {idx < arr.length - 1 && <ArrowRightOutlined className="assessment-pipeline-arrow" />}
          </div>
        ))}
      </div>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        {[
          { title: '待评估信号', value: data.pending, icon: <ThunderboltOutlined /> },
          { title: '评估进行中', value: data.processing, icon: <FundProjectionScreenOutlined /> },
          { title: '可用模型', value: data.models, icon: <ApartmentOutlined /> },
          { title: '业务画像', value: data.profiles, icon: <AlertOutlined /> },
        ].map((item) => (
          <Col xs={12} sm={6} key={item.title}>
            <div className="assessment-stat-card">
              <div className="assessment-stat-icon">{item.icon}</div>
              <div className="assessment-stat-value">{item.value}</div>
              <Text type="secondary">{item.title}</Text>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="business-panel-title" style={{ margin: 0 }}>待评估风险信号（来自识别模块）</h3>
              {onGoModel && (
                <Button type="primary" size="small" onClick={() => onGoModel()}>启动模型评估</Button>
              )}
              {onGoParams && (
                <Button size="small" onClick={onGoParams}>参数配置</Button>
              )}
              {onGoResults && (
                <Button size="small" onClick={onGoResults}>结果展示</Button>
              )}
            </div>
            <Table
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              dataSource={visibleSignals}
              columns={[
                { title: '风险事件', dataIndex: 'title', key: 'title', ellipsis: true },
                { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
                {
                  title: '等级',
                  dataIndex: 'level',
                  key: 'level',
                  width: 70,
                  render: (v) => <Tag color={levelColor[v]}>{v}</Tag>,
                },
                { title: '来源', dataIndex: 'source', key: 'source', width: 100 },
                {
                  title: '推荐模型',
                  key: 'model',
                  width: 100,
                  render: (_, r) => {
                    const m = ASSESSMENT_MODEL_CATALOG.find((x) => x.id === r.suggestedModel)
                    return m ? <Tag>{m.name}</Tag> : '-'
                  },
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 90,
                  render: (_, r) => (
                    <Button type="link" size="small" onClick={() => onGoModel?.(r)}>评估</Button>
                  ),
                },
              ]}
            />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">近期评估报告</h3>
            {data.recentReports.map((r) => (
              <div key={r.id} className="assessment-report-item">
                <Space>
                  <Tag>{r.model}</Tag>
                <Tag color={levelColor[r.level.replace('风险', '')] || 'default'}>{r.level}</Tag>
                </Space>
                <Paragraph strong style={{ margin: '6px 0 2px' }}>{r.title}</Paragraph>
                <Text type="secondary" style={{ fontSize: 12 }}>{r.score} · {r.time}</Text>
              </div>
            ))}
            <div className="business-chart-box-sm" style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>模型使用频次（近30天）</Text>
              <Column data={modelUsage} xField="model" yField="count" height={180} color="#B32620" />
            </div>
          </div>
        </Col>
      </Row>
    </>
  )
}
