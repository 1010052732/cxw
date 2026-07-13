import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Column } from '@ant-design/charts'
import { BulbOutlined, TrophyOutlined } from '@ant-design/icons'
import { getBenchmarkData, getEnterpriseDetail } from '../../../../mock/analysis'

const { Text, Paragraph } = Typography

export default function BenchmarkTab({ enterpriseName }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const ent = useMemo(() => getEnterpriseDetail(enterpriseName), [enterpriseName])
  const data = useMemo(() => getBenchmarkData(enterpriseName), [enterpriseName])

  const gapChart = (data.gaps || []).map((g) => ({ metric: g.metric, gap: parseFloat(String(g.gap).replace(/[^\d.-]/g, '')) || 0 }))

  return (
    <>
      <div className="business-filter-bar">
        <Space>
          <Text>对标主体</Text>
          <Tag color="processing">{enterpriseName}</Tag>
        </Space>
        <Button onClick={() => navigate('/analysis/market')}>返回市场分析</Button>
      </div>

      <div className="business-panel">
        <h3 className="business-panel-title"><TrophyOutlined /> 智能标杆推荐</h3>
        <Row gutter={12}>
          {(data.recommended || []).map((b) => (
            <Col xs={24} sm={8} key={b.name}>
              <Card size="small" hoverable className="forecast-stat-card">
                <Tag color="processing">{b.type}</Tag>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{b.name}</div>
                <Text type="secondary">{b.industry}</Text>
                <div style={{ marginTop: 8 }}>标杆指数 <Tag>{b.score}</Tag></div>
              </Card>
            </Col>
          ))}
        </Row>
        <Paragraph type="secondary" style={{ marginTop: 12 }}>
          指标已按统一会计准则标准化，未公开数据采用行业比例估算并标注来源。
        </Paragraph>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">绩效差距分解</h3>
            <Table rowKey="metric" size="small" pagination={false} dataSource={data.gaps || []} columns={[
              { title: '指标', dataIndex: 'metric', key: 'metric' },
              { title: '本企业', dataIndex: 'self', key: 'self', width: 90 },
              { title: '标杆', dataIndex: 'benchmark', key: 'benchmark', width: 90 },
              { title: '差距', dataIndex: 'gap', key: 'gap', width: 90, render: (v) => <Tag color={String(v).startsWith('-') ? 'error' : 'success'}>{v}</Tag> },
              { title: '主因', dataIndex: 'factor', key: 'factor', ellipsis: true },
            ]} />
            {gapChart.length > 0 && (
              <div className="business-chart-box-sm" style={{ marginTop: 16 }}>
                <Column data={gapChart} xField="metric" yField="gap" height={200} color="#B32620" />
              </div>
            )}
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title"><BulbOutlined /> 最佳实践案例库</h3>
            {(data.practices || []).map((p) => (
              <Card key={p.title} size="small" style={{ marginBottom: 8 }}>
                <Tag>{p.domain}</Tag>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{p.title}</div>
                <Text type="secondary">{p.link}</Text>
              </Card>
            ))}
            <Paragraph strong style={{ marginTop: 16 }}>改进行动建议</Paragraph>
            {(data.actions || []).map((a) => (
              <div key={a} style={{ marginBottom: 8 }}>
                <Progress percent={100} strokeColor="#B32620" showInfo={false} style={{ marginBottom: 2 }} />
                <Text>{a}</Text>
              </div>
            ))}
            <Button block style={{ marginTop: 12 }} onClick={() => message.success('对标报告已导出')}>导出对标报告</Button>
          </div>
        </Col>
      </Row>
    </>
  )
}
