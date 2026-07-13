import { App, Avatar, Button, Col, Descriptions, Row, Select, Space, Tag, Typography } from 'antd'
import {
  GlobalOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { LOCALE_OPTIONS, usePlatform } from '../../../context/PlatformContext'
import { useAuth } from '../../../auth/AuthContext'
import '../../business/business.css'

const { Text, Title, Paragraph } = Typography

export default function ProfilePage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { locale, setLocale } = usePlatform()
  const { currentUser, currentRole, users, switchUser, getDataRule, can } = useAuth()

  const riskRule = getDataRule('risk')

  return (
    <div className="business-page">
        <div className="business-page-header">
          <h1 className="page-title">个人中心</h1>
          <p className="page-description">账号信息 · 角色权限 · 语言偏好 · 数据范围</p>
        </div>

        <Row gutter={16}>
          <Col xs={24} lg={8}>
            <div className="business-panel profile-card">
              <Avatar size={72} icon={<UserOutlined />} style={{ backgroundColor: '#B32620', marginBottom: 12 }} />
              <Title level={4} style={{ margin: 0 }}>{currentUser.name}</Title>
              <Text type="secondary">@{currentUser.username}</Text>
              <div style={{ marginTop: 12 }}>
                <Tag color="volcano">{currentRole?.name}</Tag>
                <Tag>{currentUser.dept}</Tag>
              </div>
            </div>
          </Col>
          <Col xs={24} lg={16}>
            <div className="business-panel">
              <h3 className="business-panel-title">基本信息</h3>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="姓名">{currentUser.name}</Descriptions.Item>
                <Descriptions.Item label="账号">{currentUser.username}</Descriptions.Item>
                <Descriptions.Item label="部门">{currentUser.dept}</Descriptions.Item>
                <Descriptions.Item label="区域">{currentUser.region}</Descriptions.Item>
                <Descriptions.Item label="角色">{currentRole?.name}</Descriptions.Item>
                <Descriptions.Item label="数据范围">{riskRule.scope} · 风险模块</Descriptions.Item>
              </Descriptions>
            </div>

            <div className="business-panel" style={{ marginTop: 16 }}>
              <h3 className="business-panel-title"><GlobalOutlined /> 语言与演示</h3>
              <Paragraph type="secondary">切换界面语言；演示环境可切换账号验证权限分配效果</Paragraph>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text type="secondary">界面语言</Text>
                  <Select
                    style={{ width: '100%', marginTop: 4 }}
                    value={locale}
                    options={LOCALE_OPTIONS}
                    onChange={(v) => { setLocale(v); message.success(v === 'zh-CN' ? '已切换为中文' : 'Switched to English') }}
                  />
                </div>
                <div>
                  <Text type="secondary">切换演示账号</Text>
                  <Select
                    style={{ width: '100%', marginTop: 4 }}
                    value={currentUser.id}
                    options={users.filter((u) => u.status !== 'disabled').map((u) => ({ value: u.id, label: `${u.name} · ${u.dept}` }))}
                    onChange={(id) => {
                      switchUser(id)
                      message.success('账号已切换，菜单与数据权限已更新')
                    }}
                  />
                </div>
              </Space>
            </div>

            <Space style={{ marginTop: 16 }} wrap>
              <Button onClick={() => navigate('/message')}>消息中心</Button>
              {can('action:rbac:manage') && (
                <Button icon={<SafetyCertificateOutlined />} onClick={() => navigate('/system/permission')}>
                  权限分配
                </Button>
              )}
              <Button type="primary" onClick={() => navigate('/home')}>返回首页</Button>
            </Space>
          </Col>
        </Row>
      </div>
  )
}
