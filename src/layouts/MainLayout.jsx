import { useMemo, useState } from 'react'
import { Avatar, Badge, Dropdown, Layout, Menu, Select, Space, Tag } from 'antd'
import {
  BarChartOutlined,
  BellOutlined,
  DatabaseOutlined,
  FundProjectionScreenOutlined,
  GlobalOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MENU_PERMISSION_MAP, canAccessMenuPath } from '../auth/permissions'
import { useAuth } from '../auth/AuthContext'
import { LOCALE_OPTIONS, usePlatform } from '../context/PlatformContext'

const { Header, Sider, Content } = Layout

const rawMenuItems = [
  { key: '/home', icon: <HomeOutlined />, label: '首页' },
  {
    key: 'opportunity',
    icon: <FundProjectionScreenOutlined />,
    label: '商机识别',
    children: [
      { key: '/opportunity/classify', label: '商机分类与筛选' },
      { key: '/opportunity/evaluation', label: '商机评估与排序' },
      { key: '/opportunity/report/generate', label: '评估报告' },
    ],
  },
  {
    key: 'analysis',
    icon: <BarChartOutlined />,
    label: '进出口分析',
    children: [
      { key: '/analysis/market', label: '市场分析' },
      { key: '/analysis/product', label: '商品分析' },
      { key: '/analysis/enterprise', label: '企业分析' },
    ],
  },
  {
    key: 'risk',
    icon: <SafetyCertificateOutlined />,
    label: '风险防控',
    children: [
      { key: '/risk/identification', label: '风险识别' },
      { key: '/risk/situation', label: '风险态势感知' },
      { key: '/risk/assessment', label: '风险评估' },
      { key: '/risk/response', label: '风险应对' },
      { key: '/risk/case', label: '风险案例库' },
    ],
  },
  { key: '/message', icon: <BellOutlined />, label: '消息中心' },
  {
    key: 'data',
    icon: <DatabaseOutlined />,
    label: '数据中心',
    children: [
      { key: '/data/config', label: '数据源配置' },
      { key: '/data/monitor', label: '采集监控' },
      { key: '/data/quality', label: '清洗预处理' },
      { key: '/data/models', label: '模型算法' },
      { key: '/data/storage', label: '安全存储' },
    ],
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统设置',
    children: [
      { key: '/system/profile', label: '个人中心' },
      { key: '/system/department', label: '部门权限' },
      { key: '/system/role', label: '角色管理' },
      { key: '/system/account', label: '账号管理' },
      { key: '/system/permission', label: '权限分配' },
      { key: '/system/audit', label: '审计日志' },
    ],
  },
]

function filterMenuByPermission(items, can) {
  return items
    .map((item) => {
      if (item.children) {
        const children = filterMenuByPermission(item.children, can)
        if (!children.length) return null
        return { ...item, children }
      }
      if (item.key?.startsWith('/')) {
        if (!canAccessMenuPath(item.key, can)) return null
      }
      return item
    })
    .filter(Boolean)
}

function getSelectedKeys(pathname) {
  if (pathname.startsWith('/opportunity/report')) return ['/opportunity/report/generate']
  if (pathname.startsWith('/opportunity/detail')) return ['/opportunity/classify']
  if (pathname === '/opportunity/hall') return ['/opportunity/hall']
  if (pathname.startsWith('/system/rbac')) return ['/system/permission']
  if (pathname.startsWith('/system')) return [pathname]
  return [pathname]
}

function getOpenKeys(pathname) {
  if (pathname.startsWith('/opportunity')) return ['opportunity']
  if (pathname.startsWith('/analysis')) return ['analysis']
  if (pathname.startsWith('/risk')) return ['risk']
  if (pathname.startsWith('/data')) return ['data']
  if (pathname.startsWith('/system')) return ['system']
  return []
}

function getPageTitle(pathname) {
  const titles = {
    '/home': '首页',
    '/opportunity/classify': '商机分类与筛选',
    '/opportunity/hall': '商机大厅',
    '/opportunity/evaluation': '商机评估与排序',
    '/analysis/market': '市场分析',
    '/analysis/product': '商品分析',
    '/analysis/enterprise': '企业分析',
    '/risk/identification': '风险识别',
    '/risk/situation': '风险态势感知',
    '/risk/assessment': '风险评估',
    '/risk/response': '风险应对',
    '/risk/case': '风险案例库',
    '/risk/location': '区域风险详情',
    '/message': '消息中心',
    '/data/config': '数据源配置',
    '/data/monitor': '采集监控',
    '/data/quality': '深度数据清洗与预处理',
    '/data/models': '模型算法中心',
    '/data/storage': '安全存储',
    '/system/profile': '个人中心',
    '/system/department': '部门权限',
    '/system/role': '角色管理',
    '/system/account': '账号管理',
    '/system/permission': '权限分配',
    '/system/audit': '审计日志',
  }

  if (pathname === '/opportunity/report/generate') return '评估报告'
  if (pathname.startsWith('/data/monitor/task')) return '采集任务详情'
  if (pathname.startsWith('/opportunity/report')) return '商机报告'
  if (pathname.startsWith('/opportunity/detail')) return '商机详情'

  return titles[pathname] || '页面不存在'
}

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { can, currentUser, currentRole, getDataRule } = useAuth()
  const { locale, setLocale, unreadCount, t } = usePlatform()
  const [openKeys, setOpenKeys] = useState(() => getOpenKeys(location.pathname))

  const menuItems = useMemo(() => filterMenuByPermission(rawMenuItems, can), [can])
  const selectedKeys = useMemo(() => getSelectedKeys(location.pathname), [location.pathname])
  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname])

  const dataScopeLabel = useMemo(() => {
    const rule = getDataRule('risk')
    return rule.scope === 'all' ? '全部数据' : `${rule.scope} · ${currentUser.dept}`
  }, [getDataRule, currentUser.dept])

  const avatarMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: t('profile') },
      { type: 'divider' },
      { key: 'logout', label: t('logout') },
    ],
    onClick: ({ key }) => {
      if (key === 'profile') navigate('/system/profile')
      if (key === 'logout') navigate('/home')
    },
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark" breakpoint="lg" collapsedWidth={64}>
        <div className="app-logo">
          <img src="/platform-logo.png" alt="数智分析平台" className="app-logo-image" />
          <span className="app-logo-text">{t('platform')}</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={menuItems}
          onClick={({ key }) => {
            if (key.startsWith('/')) navigate(key)
          }}
        />
      </Sider>
      <Layout>
        <Header className="main-layout-header">
          <span className="header-title">{pageTitle}</span>
          <Space size="middle" className="header-toolbar">
            <Tag color="volcano">{dataScopeLabel}</Tag>
            <Select
              size="small"
              variant="borderless"
              suffixIcon={<GlobalOutlined />}
              value={locale}
              options={LOCALE_OPTIONS}
              onChange={setLocale}
              style={{ width: 100 }}
            />
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <BellOutlined
                className="header-icon-btn"
                onClick={() => navigate('/message')}
                title={t('messages')}
              />
            </Badge>
            <Dropdown menu={avatarMenu} placement="bottomRight">
              <Space className="header-user-trigger">
                <Avatar size="small" style={{ backgroundColor: '#B32620' }} icon={<UserOutlined />} />
                <span className="header-user-name">{currentUser.name}</span>
                <Tag bordered={false} style={{ margin: 0 }}>{currentRole?.name}</Tag>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="main-layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
