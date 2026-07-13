import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Column } from '@ant-design/charts'
import {
  AlertOutlined,
  BellOutlined,
  RadarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import {
  INITIAL_ALERTS,
  RISK_SCAN_DIMENSIONS,
} from '../../../../mock/risk'
import WorldMapHeatmap from '../../../../components/WorldMapHeatmap'

const { Text, Paragraph } = Typography

const DIMENSION_ACCENTS = {
  market: '#1677ff',
  credit: '#722ed1',
  policy: '#B32620',
  fx: '#13c2c2',
  logistics: '#fa8c16',
  compliance: '#52c41a',
}

export default function OverviewTab({ onGoIndicator, onGoMonitoring }) {
  const navigate = useNavigate()

  const dimChart = RISK_SCAN_DIMENSIONS.map((d) => ({ dim: d.label, score: d.score, alerts: d.alerts }))

  return (
    <>
      <Alert
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
        message="7×24 无间断运行 · 进出口风控核心模型"
        description="对接联合国制裁库、标普/惠誉、全球政治事件库及多语言新闻情绪分析，覆盖宏观-行业-企业-交易全链条。"
      />

      <div className="risk-dimension-grid">
        {RISK_SCAN_DIMENSIONS.map((d) => (
          <Card
            key={d.key}
            size="small"
            hoverable
            className={`risk-dimension-card risk-dimension-${d.key}`}
            style={{ borderTopColor: DIMENSION_ACCENTS[d.key] || '#B32620' }}
            onClick={() => onGoIndicator?.()}
          >
            <div className="risk-dimension-label">{d.label}</div>
            <div className="risk-dimension-score">{d.score}</div>
            <Space size={4} wrap>
              <Tag color={d.status === '高' ? 'error' : 'warning'}>{d.status}</Tag>
              <Text type="secondary">{d.alerts} 条预警</Text>
            </Space>
          </Card>
        ))}
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title"><RadarChartOutlined /> 六大维度动态扫描</h3>
            <div className="business-chart-box-sm">
              <Column data={dimChart} xField="dim" yField="score" height={260} color="#B32620" label={{ position: 'top' }} />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">最新识别结果</h3>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={INITIAL_ALERTS.slice(0, 5)}
              columns={[
                { title: '预警', dataIndex: 'title', key: 'title', ellipsis: true },
                { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
                { title: '等级', dataIndex: 'level', key: 'level', width: 60, render: (v) => <Tag color={v === '高' ? 'error' : 'warning'}>{v}</Tag> },
              ]}
            />
            <Button type="link" block onClick={() => navigate('/risk/situation')}>查看风险态势感知 →</Button>
          </div>
        </Col>
      </Row>

      <WorldMapHeatmap title="全球风险分布" height={340} />

      <div className="business-filter-bar" style={{ justifyContent: 'space-between' }}>
        <Space>
          <Badge status="processing" text="实时扫描中" />
          <Paragraph type="secondary" style={{ margin: 0 }}>识别结果同步至态势感知、评估与应对模块</Paragraph>
        </Space>
        <Space>
          <Button type="primary" icon={<SettingOutlined />} onClick={onGoIndicator}>风险指标设置 →</Button>
          {onGoMonitoring && <Button icon={<BellOutlined />} onClick={onGoMonitoring}>监测预警 →</Button>}
          <Button icon={<AlertOutlined />} onClick={() => navigate('/risk/assessment')}>进入风险评估</Button>
        </Space>
      </div>
    </>
  )
}
