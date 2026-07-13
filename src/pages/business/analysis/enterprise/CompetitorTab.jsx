import { useMemo } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { Radar } from '@ant-design/charts'
import { AlertOutlined, DashboardOutlined, RiseOutlined } from '@ant-design/icons'
import { getCompetitorAnalysis, getEnterpriseDetail } from '../../../../mock/analysis'

const { Text, Paragraph } = Typography

export default function CompetitorTab({ enterpriseName, onGoPartner }) {
  const ent = useMemo(() => getEnterpriseDetail(enterpriseName), [enterpriseName])
  const data = useMemo(() => getCompetitorAnalysis(enterpriseName), [enterpriseName])

  const radarFlat = useMemo(() => {
    const rows = data.radarCompare || []
    return rows.flatMap((r) => [
      { item: r.item, score: r.self, series: ent.name },
      { item: r.item, score: r.rival1, series: data.rivals?.[0]?.name || '竞品A' },
      ...(r.rival2 != null ? [{ item: r.item, score: r.rival2, series: data.rivals?.[1]?.name || '竞品B' }] : []),
    ])
  }, [data, ent.name])

  return (
    <>
      <div className="business-filter-bar">
        <Space>
          <Text>分析主体</Text>
          <Tag color="processing">{enterpriseName}</Tag>
        </Space>
        {onGoPartner && <Button type="link" onClick={onGoPartner}>合作伙伴评估 →</Button>}
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">39项指标 · 竞争力雷达对标</h3>
            <div className="business-chart-box">
              <Radar data={radarFlat} xField="item" yField="score" seriesField="series" height={320} meta={{ score: { min: 0, max: 100 } }} color={['#B32620', '#1677ff', '#52c41a']} />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">差距分析表</h3>
            <Table rowKey="metric" size="small" pagination={false} dataSource={data.gapTable || []} columns={[
              { title: '指标', dataIndex: 'metric', key: 'metric' },
              { title: '本企业', dataIndex: 'self', key: 'self', width: 70 },
              { title: '竞品', dataIndex: 'rival', key: 'rival', width: 70 },
              { title: '差距', dataIndex: 'gap', key: 'gap', width: 70, render: (v) => <Tag color={v.startsWith('+') ? 'success' : 'error'}>{v}</Tag> },
            ]} />
            <Table
              size="small"
              pagination={false}
              style={{ marginTop: 12 }}
              rowKey="name"
              dataSource={[data.self, ...(data.rivals || [])].filter(Boolean)}
              columns={[
                { title: '企业', dataIndex: 'name', key: 'name' },
                { title: '营收', dataIndex: 'revenue', key: 'revenue', width: 70 },
                { title: '份额', dataIndex: 'marketShare', key: 'marketShare', width: 60 },
                { title: '毛利率', dataIndex: 'margin', key: 'margin', width: 60 },
              ]}
            />
          </div>
        </Col>
      </Row>

      <div className="business-panel">
        <h3 className="business-panel-title"><RiseOutlined /> 战略路径回溯 · 近5-10年</h3>
        <Timeline items={(data.strategyPath || []).map((s) => ({ children: <div><Text strong>{s.year}</Text> · {s.event}</div> }))} />
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title"><DashboardOutlined /> 实时竞争动态看板</h3>
            {(data.dashboard || []).map((d) => (
              <Card key={d.date + d.content} size="small" style={{ marginBottom: 8 }}>
                <Space><Tag>{d.type}</Tag><Text type="secondary">{d.date}</Text></Space>
                <div>{d.content}</div>
              </Card>
            ))}
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title"><AlertOutlined /> 异动警报</h3>
            {(data.alerts || []).map((a) => (
              <Alert key={a.title} type={a.level === '高' ? 'error' : 'warning'} showIcon message={a.title} description={`${a.desc} · ${a.date}`} style={{ marginBottom: 12 }} />
            ))}
            {!(data.alerts || []).length && <Paragraph type="secondary">暂无重大异动</Paragraph>}
          </div>
        </Col>
      </Row>
    </>
  )
}
