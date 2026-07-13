import { Col, Progress, Row, Table, Tag, Typography } from 'antd'
import { STORAGE_MODALITIES, STORAGE_STRATEGIES, STORAGE_TIERS } from '../../../mock/data-governance'

const { Text } = Typography
const tierClass = { hot: 'hot', warm: 'warm', cold: 'cold' }

export default function ArchitectureTab({ strategies }) {
  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {STORAGE_TIERS.map((tier) => (
          <Col xs={24} lg={8} key={tier.tier}>
            <div className={`storage-tier-card ${tierClass[tier.tier]}`}>
              <Tag color={tier.tier === 'hot' ? '#B32620' : tier.tier === 'warm' ? 'warning' : 'processing'}>
                {tier.label}
              </Tag>
              <div className="storage-tier-engine">{tier.engine}</div>
              <p className="storage-tier-desc">{tier.desc}</p>
              <Progress
                percent={tier.usagePercent}
                strokeColor={tier.tier === 'hot' ? '#B32620' : tier.tier === 'warm' ? '#faad14' : '#1677ff'}
              />
              <div className="storage-tier-meta">
                已用 {tier.capacity}{tier.unit} / {tier.total}{tier.unit} · 响应 {tier.latency}
              </div>
              <div className="storage-tier-scenario">场景：{tier.scenarios}</div>
            </div>
          </Col>
        ))}
      </Row>

      <div className="business-panel" style={{ marginBottom: 16 }}>
        <h3 className="business-panel-title">多模存储形式</h3>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          关系型 · NoSQL · 分布式数仓 · 对象存储 · 分布式文件系统 — 按数据特性选型
        </Text>
        <Row gutter={[12, 12]}>
          {STORAGE_MODALITIES.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.key}>
              <div className="storage-modality-card">
                <div className="storage-modality-label">{item.label}</div>
                <div className="storage-modality-engines">{item.engines}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.useCase}</Text>
                <Tag style={{ marginTop: 8 }} color={item.tier === 'hot' ? '#B32620' : item.tier === 'warm' ? 'warning' : 'processing'}>
                  默认 {item.tier === 'hot' ? '热' : item.tier === 'warm' ? '温' : '冷'}层
                </Tag>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="business-panel">
        <h3 className="business-panel-title">存储策略映射</h3>
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={strategies}
          columns={[
            { title: '策略名称', dataIndex: 'name', key: 'name' },
            { title: '数据类型', dataIndex: 'dataType', key: 'dataType' },
            {
              title: '存储层级',
              dataIndex: 'tier',
              key: 'tier',
              render: (v) => (
                <Tag color={v === 'hot' ? '#B32620' : v === 'warm' ? 'warning' : v === 'cold' ? 'blue' : 'default'}>
                  {v === 'hot' ? '热' : v === 'warm' ? '温' : v === 'cold' ? '冷' : '混合'}
                </Tag>
              ),
            },
            { title: '引擎', key: 'engine', render: (_, r) => STORAGE_TIERS.find((t) => t.tier === r.tier || r.tier === 'hybrid')?.engine || '混合引擎' },
            { title: '占用', key: 'usage', render: (_, r) => `${r.usage} ${r.unit}` },
            { title: '备份频率', dataIndex: 'backup', key: 'backup', width: 90 },
          ]}
        />
      </div>
    </>
  )
}
