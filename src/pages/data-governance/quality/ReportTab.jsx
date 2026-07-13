import { useMemo, useState } from 'react'
import { App, Button, Col, Descriptions, Drawer, Row, Space, Table, Tag, Timeline, Typography } from 'antd'
import { Column, Line, Radar } from '@ant-design/charts'
import { AuditOutlined, FileTextOutlined, ShareAltOutlined } from '@ant-design/icons'
import {
  PIPELINE_STEP_CONTRIBUTIONS,
  QUALITY_TREND,
  RECORD_LINEAGE_TRACES,
} from '../../../mock/data-governance'
import { buildIntegratedLineage, getDownstreamConsumption, getPlatformMetrics } from '../../../mock/data-bridge'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

export default function ReportTab({
  qualityReport,
  reportGenerated,
  setReportGenerated,
  lastRunTime,
  cleaningJobs,
  samples,
}) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [lineageSample, setLineageSample] = useState(null)

  const radarBefore = useMemo(
    () => [
      { item: '完整性', score: qualityReport.before.integrity, type: '清洗前' },
      { item: '准确性', score: qualityReport.before.accuracy, type: '清洗前' },
      { item: '一致性', score: qualityReport.before.consistency, type: '清洗前' },
      { item: '时效性', score: qualityReport.before.timeliness, type: '清洗前' },
      { item: '完整性', score: qualityReport.after.integrity, type: '清洗后' },
      { item: '准确性', score: qualityReport.after.accuracy, type: '清洗后' },
      { item: '一致性', score: qualityReport.after.consistency, type: '清洗后' },
      { item: '时效性', score: qualityReport.after.timeliness, type: '清洗后' },
    ],
    [qualityReport],
  )

  const stepChartData = useMemo(
    () =>
      PIPELINE_STEP_CONTRIBUTIONS.flatMap((item) => [
        { step: item.step, value: item.integrity, dimension: '完整性提升' },
        { step: item.step, value: item.accuracy, dimension: '准确性提升' },
        { step: item.step, value: item.consistency, dimension: '一致性提升' },
      ]),
    [],
  )

  const delta = (qualityReport.after.overall - qualityReport.before.overall).toFixed(1)
  const platformMetrics = useMemo(() => getPlatformMetrics(), [])
  const lineage = useMemo(() => buildIntegratedLineage(platformMetrics), [platformMetrics])
  const downstreamModules = useMemo(() => getDownstreamConsumption(platformMetrics), [platformMetrics])

  const sampleColumns = [
    { title: '字段', dataIndex: 'field', key: 'field', width: 100 },
    { title: '清洗前', dataIndex: 'before', key: 'before', ellipsis: true, render: (v) => v ?? 'NULL' },
    { title: '清洗后', dataIndex: 'after', key: 'after', ellipsis: true },
    { title: '步骤', dataIndex: 'step', key: 'step', width: 100 },
    {
      title: '血缘',
      key: 'lineage',
      width: 70,
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => setLineageSample(r)}>
          追溯
        </Button>
      ),
    },
  ]

  return (
    <>
      <div className="business-stat-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 16 }}>
        <div className="business-stat-card">
          <div className="value">{qualityReport.before.overall}</div>
          <div className="label">清洗前综合分</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{qualityReport.after.overall}</div>
          <div className="label">清洗后综合分</div>
        </div>
        <div className="business-stat-card">
          <div className="value">+{delta}</div>
          <div className="label">质量提升</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{qualityReport.recordCount.deduped}</div>
          <div className="label">去重记录数</div>
        </div>
        <div className="business-stat-card">
          <div className="value">{qualityReport.recordCount.after.toLocaleString()}</div>
          <div className="label">可用记录数</div>
        </div>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">四维度质量对比（雷达图）</h3>
            <div className="business-chart-box-sm">
              <Radar
                data={radarBefore}
                xField="item"
                yField="score"
                seriesField="type"
                height={280}
                meta={{ score: { min: 0, max: 100 } }}
                color={['#8c8c8c', '#B32620']}
              />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">质量得分趋势</h3>
            <div className="business-chart-box-sm">
              <Line data={QUALITY_TREND} xField="date" yField="score" height={280} color="#B32620" smooth point={{ size: 4 }} yAxis={{ min: 90, max: 100 }} />
            </div>
          </div>
        </Col>
      </Row>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <h3 className="business-panel-title">流水线步骤质量贡献</h3>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          各清洗步骤对完整性、准确性、一致性的提升贡献（百分点）
        </Text>
        <div className="business-chart-box-sm">
          <Column
            data={stepChartData}
            xField="step"
            yField="value"
            seriesField="dimension"
            isGroup
            height={240}
            color={['#1677ff', '#52c41a', '#722ed1']}
          />
        </div>
      </div>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Button type="primary" icon={<FileTextOutlined />} onClick={() => { setReportGenerated(true); message.success('质量评估报告已生成') }}>
            生成质量报告
          </Button>
          <Button icon={<ShareAltOutlined />} onClick={() => message.info('完整血缘见下方时间线 · 样本级追溯点击表格「追溯」')}>数据血缘追溯</Button>
          <Button icon={<AuditOutlined />} onClick={() => message.success('报告导出任务已创建（PDF/Excel）')}>导出报告</Button>
          <Button onClick={() => navigate('/data/storage?from=quality')}>入库与存储策略 →</Button>
          <Button type="primary" ghost onClick={() => navigate('/data/models?tab=factory')}>训练模型算法 →</Button>
        </Space>
        {reportGenerated && (
          <Descriptions bordered column={2} size="small" title={`最新评估报告摘要 · ${lastRunTime || '2026-07-02 10:20'}`}>
            <Descriptions.Item label="流水线版本">Pipeline v2.3</Descriptions.Item>
            <Descriptions.Item label="评估维度">完整性 / 准确性 / 一致性 / 时效性</Descriptions.Item>
            <Descriptions.Item label="完整性">{qualityReport.after.integrity}%</Descriptions.Item>
            <Descriptions.Item label="准确性">{qualityReport.after.accuracy}%</Descriptions.Item>
            <Descriptions.Item label="一致性">{qualityReport.after.consistency}%</Descriptions.Item>
            <Descriptions.Item label="时效性">{qualityReport.after.timeliness}%</Descriptions.Item>
            <Descriptions.Item label="原始记录">{qualityReport.recordCount.before.toLocaleString()} 条</Descriptions.Item>
            <Descriptions.Item label="可用记录">{qualityReport.recordCount.after.toLocaleString()} 条</Descriptions.Item>
            <Descriptions.Item label="缺失补全">{qualityReport.recordCount.filled} 字段</Descriptions.Item>
            <Descriptions.Item label="异常处理">{qualityReport.recordCount.outliers} 条</Descriptions.Item>
          </Descriptions>
        )}
      </div>

      <div className="business-panel" style={{ marginTop: 16 }}>
        <h3 className="business-panel-title">清洗前后样本对比</h3>
        <Table rowKey="id" size="small" columns={sampleColumns} dataSource={samples || []} pagination={false} scroll={{ x: 720 }} />
      </div>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">端到端数据血缘</h3>
            <Timeline
              className="lineage-timeline"
              items={lineage.map((item) => ({
                color: item.step >= 7 ? '#B32620' : 'blue',
                children: (
                  <div
                    style={item.route ? { cursor: 'pointer' } : undefined}
                    onClick={() => item.route && navigate(item.route)}
                  >
                    <Text strong>{item.stage}</Text>
                    <div>{item.node}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.detail}</Text>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.time}</div>
                    {item.route && (
                      <Button type="link" size="small" style={{ padding: 0, height: 'auto' }}>
                        跳转 →
                      </Button>
                    )}
                  </div>
                ),
              }))}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title">清洗作业审计</h3>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={cleaningJobs}
              columns={[
                { title: '作业', dataIndex: 'id', key: 'id', width: 80 },
                { title: '数据源', dataIndex: 'sourceName', key: 'sourceName', ellipsis: true },
                { title: '操作人', dataIndex: 'operator', key: 'operator', width: 90 },
                { title: '开始', dataIndex: 'startTime', key: 'startTime', width: 130 },
                {
                  title: '结果',
                  key: 'result',
                  width: 100,
                  render: (_, r) => (
                    r.afterScore ? (
                      <Tag color="success">{r.beforeScore} → {r.afterScore}</Tag>
                    ) : (
                      <Tag color="error">失败</Tag>
                    )
                  ),
                },
              ]}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <div className="business-panel">
            <h3 className="business-panel-title">下游业务消费（模型 / 商机 / 分析 / 风险）</h3>
            <Table
              rowKey="key"
              size="small"
              pagination={false}
              dataSource={downstreamModules}
              columns={[
                { title: '模块', dataIndex: 'module', key: 'module', width: 140 },
                { title: '消费指标', dataIndex: 'metric', key: 'metric' },
                { title: '数据池', dataIndex: 'pool', key: 'pool', ellipsis: true },
                {
                  title: '操作',
                  key: 'action',
                  width: 80,
                  render: (_, r) => (
                    <Button type="link" size="small" onClick={() => navigate(r.route)}>进入</Button>
                  ),
                },
              ]}
            />
          </div>
        </Col>
      </Row>

      <Drawer
        title={lineageSample ? `记录血缘 · ${lineageSample.field}` : '记录血缘'}
        open={!!lineageSample}
        onClose={() => setLineageSample(null)}
        width={480}
      >
        {lineageSample && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="字段">{lineageSample.field}</Descriptions.Item>
              <Descriptions.Item label="清洗前">{lineageSample.before ?? 'NULL'}</Descriptions.Item>
              <Descriptions.Item label="清洗后">{lineageSample.after}</Descriptions.Item>
              <Descriptions.Item label="处理步骤">{lineageSample.step}</Descriptions.Item>
            </Descriptions>
            <Timeline
              items={(RECORD_LINEAGE_TRACES[lineageSample.id] || RECORD_LINEAGE_TRACES['S-001'] || []).map((item) => ({
                color: '#B32620',
                children: (
                  <div style={{ cursor: item.route ? 'pointer' : undefined }} onClick={() => item.route && navigate(item.route)}>
                    <Text strong>{item.stage}</Text>
                    <div>{item.node}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.detail}</Text>
                  </div>
                ),
              }))}
            />
          </>
        )}
      </Drawer>
    </>
  )
}
