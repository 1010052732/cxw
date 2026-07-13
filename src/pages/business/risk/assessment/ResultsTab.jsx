import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Badge,
  Col,
  Descriptions,
  Drawer,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Sankey, Waterfall, Column } from '@ant-design/charts'
import {
  FallOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import {
  ASSESSMENT_RESULT_SUBJECTS,
  EXPOSURE_REPORT,
  getAssessmentResultsData,
  getDrilldownDetail,
  getExposureStatus,
  scoreToGrade,
} from '../../../../mock/risk'

const { Text, Paragraph, Title } = Typography

export default function ResultsTab({ onGoPriority }) {
  const navigate = useNavigate()
  const [subjectId, setSubjectId] = useState('SUB-001')
  const [drillOpen, setDrillOpen] = useState(false)
  const [drillData, setDrillData] = useState(null)
  const [exposureView, setExposureView] = useState('byType')

  const data = useMemo(() => getAssessmentResultsData(subjectId), [subjectId])
  const { subject, grade, waterfall, sankey, contribution } = data

  const exposureList = EXPOSURE_REPORT[exposureView] || EXPOSURE_REPORT.byType
  const exposureKey = exposureView === 'byType' ? 'type' : exposureView === 'byRegion' ? 'region' : 'dept'

  const openDrill = (dimensionKey) => {
    const detail = getDrilldownDetail(subjectId, dimensionKey)
    if (detail) {
      setDrillData(detail)
      setDrillOpen(true)
    }
  }

  const handleWaterfallClick = (evt) => {
    const name = evt?.data?.data?.type || evt?.data?.type
    const dim = contribution.dimensions.find((d) => d.label === name)
    if (dim) openDrill(dim.key)
  }

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="图表为主 · 文字为辅 · 点击图表下钻查看底层数据与计算逻辑"
        action={onGoPriority && <a onClick={onGoPriority}>进入风险排序 →</a>}
      />

      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <div className="business-panel">
            <h3 className="business-panel-title"><SafetyCertificateOutlined /> 风险评分卡</h3>
            <Select
              style={{ width: '100%', marginBottom: 12 }}
              value={subjectId}
              options={ASSESSMENT_RESULT_SUBJECTS.map((s) => ({ value: s.id, label: `${s.name}（${s.type}）` }))}
              onChange={setSubjectId}
            />
            <div className="result-scorecard">
              <div className="result-score-value">{subject.score}</div>
              <Text type="secondary">综合风险分数 · 0-1000（越高越安全）</Text>
              <Space style={{ marginTop: 12 }}>
                <Tag color={grade.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {grade.grade} · {grade.label}
                </Tag>
                {subject.gradeChange !== '稳定' && (
                  <Badge count={subject.gradeChange} style={{ backgroundColor: '#B32620' }} />
                )}
              </Space>
              <Descriptions bordered size="small" column={1} style={{ marginTop: 12 }}>
                <Descriptions.Item label="对象类型">{subject.type}</Descriptions.Item>
                <Descriptions.Item label="风险敞口">{subject.exposure} 万元</Descriptions.Item>
                <Descriptions.Item label="上次分数">{subject.prevScore} 分</Descriptions.Item>
                <Descriptions.Item label="变动原因">
                  {subject.reason !== '-' ? (
                    <Text type="danger"><FallOutlined /> {subject.reason}</Text>
                  ) : (
                    <Text type="success">稳定</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">{subject.updatedAt}</Descriptions.Item>
              </Descriptions>
              {subject.score < subject.prevScore && (
                <Alert type="warning" showIcon style={{ marginTop: 12 }} message="等级变动通知已推送" description={`${subject.prevScore}→${subject.score}，请关注核心参数变化`} />
              )}
            </div>
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <Title level={5}>九级分类标准</Title>
            <Table
              size="small"
              pagination={false}
              rowKey="grade"
              dataSource={[
                { grade: 'AAA', range: '900-1000', label: '低风险' },
                { grade: 'AA', range: '800-899', label: '较低风险' },
                { grade: 'A', range: '700-799', label: '中等偏低' },
                { grade: 'BBB', range: '600-699', label: '中等风险' },
                { grade: 'BB', range: '500-599', label: '中等偏高' },
                { grade: 'B', range: '400-499', label: '较高风险' },
                { grade: 'CCC', range: '300-399', label: '高风险' },
                { grade: 'CC', range: '200-299', label: '极高风险' },
                { grade: 'D', range: '0-199', label: '已发生' },
              ]}
              columns={[
                { title: '等级', dataIndex: 'grade', key: 'grade', width: 60 },
                { title: '分数', dataIndex: 'range', key: 'range' },
                { title: '含义', dataIndex: 'label', key: 'label' },
              ]}
              rowClassName={(r) => (r.grade === grade.grade ? 'result-grade-active' : '')}
            />
          </div>
        </Col>

        <Col xs={24} lg={16}>
          <div className="business-panel">
            <h3 className="business-panel-title">贡献度分解 · 瀑布图</h3>
            <Paragraph type="secondary">从基准分叠加各子风险维度贡献，点击维度下钻指标明细</Paragraph>
            <div className="business-chart-box">
              <Waterfall
                data={waterfall.map((w) => ({ x: w.type, y: w.value, isTotal: w.isTotal }))}
                xField="x"
                yField="y"
                height={280}
                total={{ label: '综合分数' }}
                risingFill="#B32620"
                fallingFill="#52c41a"
                onReady={(plot) => {
                  plot.on('element:click', handleWaterfallClick)
                }}
              />
            </div>
            <Space wrap style={{ marginTop: 8 }}>
              {contribution.dimensions.map((d) => (
                <Tag key={d.key} color="#B32620" style={{ cursor: 'pointer' }} onClick={() => openDrill(d.key)}>
                  {d.label} +{d.contribution}分
                </Tag>
              ))}
            </Space>
          </div>

          <div className="business-panel" style={{ marginTop: 16 }}>
            <h3 className="business-panel-title">贡献度分解 · 桑基图</h3>
            <Paragraph type="secondary">流宽表示子风险维度得分占比与传导路径</Paragraph>
            <div className="business-chart-box">
              <Sankey
                data={sankey}
                sourceField="source"
                targetField="target"
                weightField="value"
                height={260}
                nodeStyle={{ fill: '#B32620', fillOpacity: 0.85 }}
                edgeStyle={{ fill: '#B32620', fillOpacity: 0.3 }}
                onReady={(plot) => {
                  plot.on('element:click', (evt) => {
                    const name = evt?.data?.data?.name || evt?.data?.name
                    const dim = contribution.dimensions.find((d) => d.label === name)
                    if (dim) openDrill(dim.key)
                  })
                }}
              />
            </div>
          </div>
        </Col>
      </Row>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 className="business-panel-title" style={{ margin: 0 }}>风险敞口报告</h3>
          <Select
            value={exposureView}
            style={{ width: 140 }}
            options={[
              { value: 'byType', label: '按风险类型' },
              { value: 'byRegion', label: '按地区' },
              { value: 'byDepartment', label: '按业务部门' },
            ]}
            onChange={setExposureView}
          />
        </div>
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <Table
              size="small"
              pagination={false}
              rowKey={exposureKey}
              dataSource={exposureList}
              columns={[
                { title: exposureView === 'byType' ? '类型' : exposureView === 'byRegion' ? '地区' : '部门', dataIndex: exposureKey, key: exposureKey },
                { title: '敞口', key: 'exp', render: (_, r) => `${r.exposure}${r.unit}` },
                { title: '容忍限额', key: 'lim', render: (_, r) => `${r.limit}${r.unit}` },
                {
                  title: '状态',
                  key: 'status',
                  render: (_, r) => {
                    const st = getExposureStatus(r.exposure, r.limit)
                    return <Tag color={st.color}>{st.status}{st.status === '超限' ? ` +${st.pct}%` : ` ${st.pct}%`}</Tag>
                  },
                },
                { title: '备注', dataIndex: 'note', key: 'note', ellipsis: true, render: (v) => v || '-' },
              ]}
            />
            <Alert
              type="error"
              showIcon
              style={{ marginTop: 12 }}
              message={`出口部信用风险敞口 ${EXPOSURE_REPORT.byDepartment[0].exposure} 万元，限额 ${EXPOSURE_REPORT.byDepartment[0].limit} 万元，已超限 10%`}
            />
          </Col>
          <Col xs={24} lg={10}>
            <div className="business-chart-box-sm">
              <Column
                data={exposureList.map((r) => {
                  const st = getExposureStatus(r.exposure, r.limit)
                  return {
                    name: r[exposureKey],
                    exposure: r.exposure,
                    barColor: st.color === 'error' ? '#cf1322' : st.color === 'warning' ? '#faad14' : '#52c41a',
                  }
                })}
                xField="name"
                yField="exposure"
                seriesField="name"
                color={(datum) => datum.barColor}
                height={220}
                legend={false}
                meta={{ exposure: { alias: '敞口(万)' } }}
              />
            </div>
            <Descriptions bordered size="small" column={1} style={{ marginTop: 12 }}>
              <Descriptions.Item label="总敞口">{EXPOSURE_REPORT.total.exposure}{EXPOSURE_REPORT.total.unit}</Descriptions.Item>
              <Descriptions.Item label="总限额">{EXPOSURE_REPORT.total.limit}{EXPOSURE_REPORT.total.unit}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </div>

      <Drawer title={`下钻详情 · ${drillData?.dimension || ''}`} open={drillOpen} onClose={() => setDrillOpen(false)} width={520}>
        {drillData && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="维度贡献">{drillData.contribution} 分</Descriptions.Item>
              <Descriptions.Item label="计算逻辑">{drillData.calcLogic}</Descriptions.Item>
              <Descriptions.Item label="数据来源">{drillData.dataSources.join(' · ')}</Descriptions.Item>
            </Descriptions>
            <Title level={5} style={{ marginTop: 16 }}>指标得分明细</Title>
            <Table
              size="small"
              pagination={false}
              rowKey="name"
              dataSource={drillData.indicators}
              columns={[
                { title: '指标', dataIndex: 'name', key: 'name' },
                { title: '得分', dataIndex: 'score', key: 'score', width: 70 },
                { title: '计算说明', dataIndex: 'calc', key: 'calc' },
              ]}
            />
            <Space style={{ marginTop: 16 }}>
              <a onClick={() => navigate('/risk/identification?tab=indicator')}>查看规则配置</a>
              {onGoPriority && <a onClick={onGoPriority}>进入优先级排序 →</a>}
            </Space>
          </>
        )}
      </Drawer>
    </>
  )
}
