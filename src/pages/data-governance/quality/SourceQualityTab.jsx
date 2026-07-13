import { App, Button, Col, Progress, Row, Space, Table, Tag } from 'antd'
import { Column } from '@ant-design/charts'
import { useNavigate } from 'react-router-dom'
import { resolveCleaningBatch } from '../../../mock/data-governance'

export default function SourceQualityTab({ qualityDetail, batches, highlightSourceId, onSelectBatch, setActiveTab }) {
  const { message } = App.useApp()
  const navigate = useNavigate()

  const chartData = qualityDetail.flatMap((d) => [
    { source: d.name.length > 8 ? `${d.name.slice(0, 8)}…` : d.name, score: d.integrity, dimension: '完整性' },
    { source: d.name.length > 8 ? `${d.name.slice(0, 8)}…` : d.name, score: d.accuracy, dimension: '准确性' },
    { source: d.name.length > 8 ? `${d.name.slice(0, 8)}…` : d.name, score: d.consistency, dimension: '一致性' },
    { source: d.name.length > 8 ? `${d.name.slice(0, 8)}…` : d.name, score: d.timeliness, dimension: '时效性' },
  ])

  const startClean = (sourceId) => {
    const batch = resolveCleaningBatch(sourceId, batches)
    if (batch) {
      onSelectBatch(batch.id)
      setActiveTab('pipeline')
      message.success(`已选中批次 ${batch.id}，请配置并运行清洗流水线`)
    } else {
      message.warning('该数据源暂无待清洗批次，请先在采集监控确认采集已完成')
    }
  }

  return (
    <>
      <div className="business-panel" style={{ marginBottom: 16 }}>
        <h3 className="business-panel-title">分数据源质量评分</h3>
        <Table
          rowKey="id"
          size="small"
          dataSource={qualityDetail}
          pagination={false}
          rowClassName={(record) => (record.id === highlightSourceId ? 'quality-source-highlight' : '')}
          columns={[
            { title: '数据源', dataIndex: 'name', key: 'name', ellipsis: true },
            {
              title: '综合分',
              dataIndex: 'quality',
              key: 'quality',
              width: 120,
              render: (v) => (
                <Space>
                  <Progress type="circle" percent={v} size={36} strokeColor={v >= 95 ? '#52c41a' : v >= 90 ? '#faad14' : '#ff4d4f'} format={(p) => p} />
                </Space>
              ),
            },
            { title: '完整性', dataIndex: 'integrity', key: 'integrity', width: 70 },
            { title: '准确性', dataIndex: 'accuracy', key: 'accuracy', width: 70 },
            { title: '一致性', dataIndex: 'consistency', key: 'consistency', width: 70 },
            { title: '时效性', dataIndex: 'timeliness', key: 'timeliness', width: 70 },
            {
              title: '操作',
              key: 'op',
              width: 140,
              render: (_, r) => (
                <Space>
                  <Button type="link" size="small" onClick={() => startClean(r.id)}>发起清洗</Button>
                  <Button type="link" size="small" onClick={() => navigate('/data/monitor?tab=alerts')}>采集监控</Button>
                </Space>
              ),
            },
          ]}
        />
      </div>

      <div className="business-panel">
        <h3 className="business-panel-title">四维度对比（分源）</h3>
        <div className="business-chart-box">
          <Column
            data={chartData}
            xField="source"
            yField="score"
            seriesField="dimension"
            isGroup
            height={320}
            meta={{ score: { min: 80, max: 100 } }}
            color={['#1677ff', '#52c41a', '#722ed1', '#faad14']}
          />
        </div>
      </div>
    </>
  )
}
