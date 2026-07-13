import { useMemo, useState } from 'react'
import {
  App,
  Badge,
  Button,
  Drawer,
  Input,
  List,
  Popconfirm,
  Segmented,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  CheckOutlined,
  DeleteOutlined,
  MailOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { MESSAGE_CATEGORIES, categoryColor, typeIcon } from '../../../mock/message'
import { usePlatform } from '../../../context/PlatformContext'
import '../business.css'

const { Text, Paragraph } = Typography

export default function MessagePage() {
  const { message: msgApi } = App.useApp()
  const navigate = useNavigate()
  const { messages, markRead, markAllRead, removeMessage, unreadCount } = usePlatform()
  const [category, setCategory] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentMsg, setCurrentMsg] = useState(null)

  const filteredMessages = useMemo(
    () =>
      messages.filter((item) => {
        if (category !== 'all' && item.category !== category) return false
        if (keyword && !`${item.title}${item.content}`.includes(keyword)) return false
        return true
      }),
    [messages, category, keyword],
  )

  const openMessage = (item) => {
    setCurrentMsg(item)
    setDrawerOpen(true)
    if (!item.read) markRead(item.id)
  }

  const handleMarkAllRead = () => {
    markAllRead()
    msgApi.success('已全部标记为已读')
  }

  const deleteMessage = (id) => {
    removeMessage(id)
    setDrawerOpen(false)
    msgApi.success('消息已删除')
  }

  const categoryLabel = MESSAGE_CATEGORIES.find((c) => c.value === category)?.label || '全部消息'

  return (
    <div className="business-page">
      <div className="business-page-header">
        <h1 className="page-title">消息中心</h1>
        <p className="page-description">集中展示系统通知、业务提醒、风险预警与数据告警，与顶部铃铛提醒同步</p>
      </div>

      <div className="business-filter-bar">
        <Segmented
          value={category}
          onChange={setCategory}
          options={MESSAGE_CATEGORIES.map((c) => ({
            value: c.value,
            label: c.value === 'all' && unreadCount > 0 ? `${c.label} (${unreadCount})` : c.label,
          }))}
        />
        <Input
          placeholder="搜索消息标题/内容"
          style={{ width: 240 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
        />
        <Space style={{ marginLeft: 'auto' }}>
          <Button icon={<ReadOutlined />} onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            全部已读
          </Button>
        </Space>
      </div>

      <div className="business-panel">
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">{categoryLabel} · 共 {filteredMessages.length} 条 · 未读 {unreadCount} 条</Text>
        </div>
        <List
          itemLayout="horizontal"
          dataSource={filteredMessages}
          locale={{ emptyText: '暂无消息' }}
          renderItem={(item) => (
            <List.Item
              className={!item.read ? 'message-item-unread' : ''}
              style={{ padding: '16px 12px', cursor: 'pointer', borderRadius: 8, marginBottom: 4 }}
              onClick={() => openMessage(item)}
              actions={[
                <Popconfirm
                  key="del"
                  title="确认删除该消息？"
                  onConfirm={(e) => { e?.stopPropagation(); deleteMessage(item.id) }}
                  onCancel={(e) => e?.stopPropagation()}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!item.read}>
                    <MailOutlined style={{ fontSize: 22, color: categoryColor[item.category] || '#B32620' }} />
                  </Badge>
                }
                title={
                  <Space>
                    {!item.read && <Badge status="processing" />}
                    <Text strong={!item.read}>{item.title}</Text>
                    <Tag color={typeIcon[item.type]}>{item.category === 'system' ? '系统' : item.category === 'business' ? '业务' : item.category === 'risk' ? '风险' : '数据'}</Tag>
                  </Space>
                }
                description={
                  <>
                    <Paragraph ellipsis={{ rows: 1 }} style={{ margin: '4px 0', color: '#595959' }}>
                      {item.content}
                    </Paragraph>
                    <Space size={16}>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>来自：{item.sender}</Text>
                    </Space>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </div>

      <Drawer
        title={currentMsg?.title}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        extra={
          currentMsg && (
            <Space>
              {currentMsg.read && <Tag icon={<CheckOutlined />} color="success">已读</Tag>}
              <Popconfirm title="确认删除？" onConfirm={() => deleteMessage(currentMsg.id)}>
                <Button danger size="small" icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            </Space>
          )
        }
      >
        {currentMsg && (
          <>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={categoryColor[currentMsg.category]}>
                {MESSAGE_CATEGORIES.find((c) => c.value === currentMsg.category)?.label}
              </Tag>
              <Tag color={typeIcon[currentMsg.type]}>{currentMsg.type}</Tag>
            </Space>
            <Text type="secondary">发送方：{currentMsg.sender}</Text>
            <div style={{ margin: '8px 0 16px' }}>
              <Text type="secondary">{currentMsg.time}</Text>
            </div>
            <div className="message-detail-content">{currentMsg.content}</div>
            {currentMsg.linkPath && (
              <Button type="primary" style={{ marginTop: 16 }} onClick={() => { setDrawerOpen(false); navigate(currentMsg.linkPath) }}>
                前往处理
              </Button>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
