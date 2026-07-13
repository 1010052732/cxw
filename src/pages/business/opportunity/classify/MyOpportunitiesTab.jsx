import { useMemo, useState } from 'react'
import { Badge, Button, Empty, Segmented, Space, Table, Tag, Typography } from 'antd'
import {
  ExportOutlined,
  HeartFilled,
  HeartOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  filterAssignedTo,
  filterFavoritedBy,
  filterOwnedBy,
  isFavoritedBy,
} from '../opportunityStore'
import { formatGeoLocation, getRiskColor } from '../utils'

const { Text } = Typography

export default function MyOpportunitiesTab({
  dataSource,
  currentUser,
  onToggleFavorite,
  onAssignSelf,
  onOpenExport,
  onNavigateDetail,
  onNavigateEvaluation,
}) {
  const [subTab, setSubTab] = useState('assigned')

  const assignedList = useMemo(
    () => filterAssignedTo(dataSource, currentUser.id),
    [dataSource, currentUser.id],
  )
  const ownedList = useMemo(
    () => filterOwnedBy(dataSource, currentUser.id),
    [dataSource, currentUser.id],
  )
  const favoriteList = useMemo(
    () => filterFavoritedBy(dataSource, currentUser.id),
    [dataSource, currentUser.id],
  )

  const activeList = subTab === 'assigned' ? assignedList : subTab === 'owned' ? ownedList : favoriteList

  const columns = [
    {
      title: '商机名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.id}</Text>
        </Space>
      ),
    },
    { title: '商机来源', key: 'source', width: 150, render: (_, r) => formatGeoLocation(r) },
    { title: '目标市场', dataIndex: 'country', key: 'country', width: 80 },
    { title: '产品', dataIndex: 'product', key: 'product', width: 100, ellipsis: true },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      width: 70,
      render: (v) => <Tag color="#B32620">{v}</Tag>,
    },
    { title: '分组', dataIndex: 'group', key: 'group', width: 100 },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 140,
      render: (tags) => (tags || []).slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>),
    },
    {
      title: '跟进人',
      key: 'assignee',
      width: 90,
      render: (_, r) => r.assignedUserName || r.assignedTo || '—',
    },
    {
      title: '负责人',
      key: 'owner',
      width: 90,
      render: (_, r) => r.ownerName || '—',
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 70,
      render: (v) => <Tag color={getRiskColor(v)}>{v}</Tag>,
    },
    {
      title: '收藏',
      key: 'fav',
      width: 60,
      render: (_, r) => (
        <Button
          type="text"
          icon={isFavoritedBy(r, currentUser.id) ? <HeartFilled style={{ color: '#B32620' }} /> : <HeartOutlined />}
          onClick={() => onToggleFavorite(r)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, r) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => onNavigateDetail(r.id)}>详情</Button>
          <Button type="link" size="small" onClick={() => onNavigateEvaluation(r.id)}>评估</Button>
          {subTab !== 'owned' && r.ownerId !== currentUser.id && (
            <Button type="link" size="small" onClick={() => onAssignSelf(r.id)}>认领</Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="my-opportunity-panel">
      <div className="business-panel" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <h3 className="business-panel-title" style={{ margin: 0 }}>我的商机</h3>
            <Text type="secondary">查看指派给您、您负责跟进以及收藏的商机</Text>
          </div>
          <Space>
            <Badge count={assignedList.length} offset={[6, 0]}>
              <Tag icon={<UserOutlined />}>指派 {assignedList.length}</Tag>
            </Badge>
            <Badge count={ownedList.length} offset={[6, 0]}>
              <Tag icon={<StarOutlined />}>负责 {ownedList.length}</Tag>
            </Badge>
            <Badge count={favoriteList.length} offset={[6, 0]}>
              <Tag icon={<HeartFilled style={{ color: '#B32620' }} />}>收藏 {favoriteList.length}</Tag>
            </Badge>
          </Space>
        </Space>
      </div>

      <div className="opportunity-batch-bar">
        <Segmented
          value={subTab}
          onChange={setSubTab}
          options={[
            { value: 'assigned', label: `指派给我 (${assignedList.length})` },
            { value: 'owned', label: `我负责的 (${ownedList.length})` },
            { value: 'favorite', label: `收藏夹 (${favoriteList.length})` },
          ]}
        />
        <Button
          icon={<ExportOutlined />}
          disabled={activeList.length === 0}
          onClick={() => onOpenExport(activeList.map((i) => i.id))}
          style={{ marginLeft: 'auto' }}
        >
          导出当前列表
        </Button>
      </div>

      <div className="opportunity-content-panel">
        {activeList.length === 0 ? (
          <Empty
            description={
              subTab === 'assigned'
                ? '暂无指派给您的商机'
                : subTab === 'owned'
                  ? '暂无您负责的商机，可在列表中认领或分配'
                  : '收藏夹为空，点击心形图标收藏商机'
            }
          />
        ) : (
          <Table
            rowKey="id"
            size="middle"
            scroll={{ x: 1200 }}
            columns={columns}
            dataSource={activeList}
            pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 条` }}
          />
        )}
      </div>
    </div>
  )
}
