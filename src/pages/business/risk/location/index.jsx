import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Breadcrumb,
  Button,
  Col,
  Descriptions,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  AlertOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons'
import { getHeatColor } from '../../../../mock/risk'
import { getRiskLocationDetail } from '../../../../mock/risk-geo'
import '../../business.css'

const { Text, Paragraph, Title } = Typography

const levelColor = { 高: 'error', 中: 'warning', 低: 'success', 红色: 'error', 橙色: 'orange', 黄色: 'warning', 蓝色: 'processing' }
const statusColor = { 新触发: 'error', 已确认: 'processing', 处理中: 'warning', 已关闭: 'success' }

export default function RiskLocationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const macro = searchParams.get('macro') || ''
  const country = searchParams.get('country') || ''
  const city = searchParams.get('city') || ''

  const detail = useMemo(
    () => getRiskLocationDetail({ macro, country, city }),
    [macro, country, city],
  )

  const locationLabel = [macro, country, city].filter(Boolean).join(' · ') || '全球'

  if (!macro && !country && !city) {
    return (
      <div className="business-page">
        <div className="business-page-header">
          <h1 className="page-title">区域风险详情</h1>
          <p className="page-description">请从全球风险热力图下钻选择洲、国家或城市后查看详情</p>
        </div>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/risk/identification?tab=display')}>
          返回风险信息展示
        </Button>
      </div>
    )
  }

  return (
    <div className="business-page">
      <div className="business-page-header">
        <Space direction="vertical" size={4}>
          <Breadcrumb
            items={[
              { title: <span style={{ cursor: 'pointer' }} onClick={() => navigate('/risk/identification?tab=display')}>风险识别</span> },
              { title: macro || '区域' },
              ...(country ? [{ title: country }] : []),
              ...(city ? [{ title: city }] : []),
            ]}
          />
          <Title level={3} style={{ margin: 0 }}>
            <EnvironmentOutlined style={{ marginRight: 8, color: '#B32620' }} />
            {locationLabel} · 风险详情
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            该区域关联预警、追踪任务与业务暴露指标，支持联动评估与应对
          </Paragraph>
        </Space>
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          <Button onClick={() => navigate('/risk/assessment')}>风险评估</Button>
          <Button type="primary" onClick={() => navigate('/risk/response')}>风险应对</Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <div className="business-panel risk-location-stat">
            <Statistic title="综合风险指数" value={detail.score} suffix="/ 100" valueStyle={{ color: getHeatColor(detail.score) }} />
            <Tag color={levelColor[detail.level]} style={{ marginTop: 8 }}>{detail.level}风险</Tag>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="business-panel risk-location-stat">
            <Statistic title="未关闭预警" value={detail.metrics.openAlerts} prefix={<AlertOutlined />} valueStyle={{ color: '#B32620' }} />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="business-panel risk-location-stat">
            <Statistic title="在办追踪" value={detail.metrics.activeTasks} valueStyle={{ color: '#faad14' }} />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="business-panel risk-location-stat">
            <Statistic title="政策暴露度" value={detail.metrics.policyExposure} suffix="%" />
            <Progress percent={detail.metrics.policyExposure} size="small" strokeColor="#B32620" showInfo={false} style={{ marginTop: 8 }} />
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">区域风险概况</h3>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="所属洲/区域">{macro || '—'}</Descriptions.Item>
              <Descriptions.Item label="国家">{country || '—'}</Descriptions.Item>
              <Descriptions.Item label="城市/节点">{city || '—'}</Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <Tag color={levelColor[detail.level]}>{detail.level}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="信用暴露度" span={2}>
                <Progress percent={detail.metrics.creditExposure} strokeColor="#722ed1" size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="主要风险类型" span={2}>
                {[...new Set(detail.alerts.map((a) => a.type))].join('、') || '综合风险'}
              </Descriptions.Item>
              <Descriptions.Item label="业务建议" span={2}>
                {detail.score >= 75
                  ? '建议暂停新增敞口，优先处理在途订单与应收催收'
                  : detail.score >= 50
                    ? '加强监测频率，评估替代市场与供应链方案'
                    : '维持常规监测，关注政策与汇率边际变化'}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title"><NodeIndexOutlined /> 关联预警</h3>
            <Table
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              dataSource={detail.alerts}
              columns={[
                { title: '预警', dataIndex: 'title', key: 'title', ellipsis: true },
                { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
                {
                  title: '等级',
                  dataIndex: 'level',
                  key: 'level',
                  width: 70,
                  render: (v) => <Tag color={levelColor[v] || 'default'}>{v}</Tag>,
                },
                { title: '时间', dataIndex: 'time', key: 'time', width: 140 },
              ]}
            />
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">风险追踪任务</h3>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={detail.tracking}
              columns={[
                { title: '主体', dataIndex: 'subject', key: 'subject', ellipsis: true },
                { title: '等级', dataIndex: 'level', key: 'level', width: 60, render: (v) => <Tag color={levelColor[v]}>{v}</Tag> },
                { title: '状态', dataIndex: 'status', key: 'status', width: 72, render: (v) => <Tag color={statusColor[v]}>{v}</Tag> },
                { title: '进度', dataIndex: 'progress', key: 'progress', width: 80, render: (v) => <Progress percent={v} size="small" strokeColor="#B32620" showInfo={false} /> },
              ]}
            />
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">快捷操作</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block onClick={() => navigate('/risk/situation')}>查看态势感知大屏</Button>
              <Button block onClick={() => navigate('/risk/case')}>检索相似案例</Button>
              <Button block type="primary" onClick={() => navigate('/risk/identification?tab=monitoring')}>配置监测规则</Button>
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  )
}
