import { Button, Table, Tag, Timeline, Typography } from 'antd'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function LifecycleTab({ lifecycle, onAdd, onEdit }) {
  return (
    <>
      <div className="business-panel" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 className="business-panel-title" style={{ margin: 0 }}>自动化生命周期规则</h3>
            <Text type="secondary">原始日志 30 天保留 → 压缩归档 → 冷存储 → GDPR 合规删除</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>新增规则</Button>
        </div>
        <Table
          rowKey="id"
          size="small"
          dataSource={lifecycle}
          pagination={false}
          columns={[
            { title: '规则名称', dataIndex: 'name', key: 'name' },
            { title: '数据类型', dataIndex: 'dataType', key: 'dataType' },
            { title: '保留(天)', dataIndex: 'retain', key: 'retain', width: 80 },
            { title: '压缩(天)', dataIndex: 'compress', key: 'compress', width: 80 },
            { title: '归档(天)', dataIndex: 'archive', key: 'archive', width: 80 },
            { title: '删除(天)', dataIndex: 'delete', key: 'delete', width: 80, render: (v) => v || '永久' },
            { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: () => <Tag color="success">启用</Tag> },
            {
              title: '操作',
              key: 'action',
              width: 80,
              render: (_, r) => (
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(r)}>编辑</Button>
              ),
            },
          ]}
        />
      </div>

      <div className="business-panel">
        <h3 className="business-panel-title">生命周期流转示例 · 原始日志</h3>
        <Timeline
          items={[
            { color: 'green', children: 'Day 0–30：热/温层在线保留，支持实时查询与审计' },
            { color: 'blue', children: 'Day 30：自动压缩（Gzip/LZ4），存储成本降低约 60%' },
            { color: 'gray', children: 'Day 365：转入 OSS/HDFS 冷归档，分钟级检索' },
            { color: 'red', children: 'Day 1825（5年）：自动删除，符合 GDPR 数据最小化原则' },
          ]}
        />
      </div>
    </>
  )
}
