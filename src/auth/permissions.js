export const PERMISSION_GROUPS = [
  {
    key: 'menu',
    label: '菜单访问',
    items: [
      { key: 'menu:home', label: '首页' },
      { key: 'menu:opportunity', label: '商机识别' },
      { key: 'menu:analysis', label: '进出口分析' },
      { key: 'menu:risk', label: '风险防控' },
      { key: 'menu:data', label: '数据中心' },
      { key: 'menu:system', label: '系统管理' },
      { key: 'menu:message', label: '消息中心' },
    ],
  },
  {
    key: 'risk',
    label: '风险操作',
    items: [
      { key: 'action:risk:read', label: '风险查看' },
      { key: 'action:risk:write', label: '风险识别配置' },
      { key: 'action:risk:assess', label: '风险评估执行' },
      { key: 'action:risk:response', label: '风险应对处置' },
      { key: 'action:risk:archive:export', label: '档案导出/审计' },
    ],
  },
  {
    key: 'data',
    label: '数据与系统',
    items: [
      { key: 'action:data:export', label: '数据导出' },
      { key: 'action:rbac:manage', label: '权限分配管理' },
    ],
  },
]

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.key))

export const ROUTE_PERMISSIONS = {
  '/home': ['menu:home'],
  '/opportunity/classify': ['menu:opportunity'],
  '/opportunity/evaluation': ['menu:opportunity'],
  '/opportunity/report/generate': ['menu:opportunity'],
  '/opportunity/report': ['menu:opportunity'],
  '/opportunity/detail': ['menu:opportunity'],
  '/opportunity/hall': ['menu:opportunity'],
  '/analysis/market': ['menu:analysis'],
  '/analysis/product': ['menu:analysis'],
  '/analysis/enterprise': ['menu:analysis'],
  '/risk/identification': ['menu:risk', 'action:risk:read'],
  '/risk/situation': ['menu:risk', 'action:risk:read'],
  '/risk/assessment': ['menu:risk', 'action:risk:assess'],
  '/risk/response': ['menu:risk', 'action:risk:response'],
  '/risk/case': ['menu:risk', 'action:risk:read'],
  '/risk/location': ['menu:risk', 'action:risk:read'],
  '/message': ['menu:message'],
  '/data/config': ['menu:data'],
  '/data/monitor': ['menu:data'],
  '/data/quality': ['menu:data'],
  '/data/models': ['menu:data'],
  '/data/storage': ['menu:data'],
  '/system/profile': ['menu:system'],
  '/system/department': ['menu:system', 'action:rbac:manage'],
  '/system/role': ['menu:system', 'action:rbac:manage'],
  '/system/account': ['menu:system', 'action:rbac:manage'],
  '/system/permission': ['menu:system', 'action:rbac:manage'],
  '/system/audit': ['menu:system', 'action:rbac:manage'],
  '/system/rbac': ['menu:system', 'action:rbac:manage'],
}

export const MENU_PERMISSION_MAP = {
  '/home': 'menu:home',
  '/opportunity/classify': 'menu:opportunity',
  '/opportunity/evaluation': 'menu:opportunity',
  '/opportunity/report/generate': 'menu:opportunity',
  '/opportunity/hall': 'menu:opportunity',
  '/analysis/market': 'menu:analysis',
  '/analysis/product': 'menu:analysis',
  '/analysis/enterprise': 'menu:analysis',
  '/risk/identification': 'menu:risk',
  '/risk/situation': 'menu:risk',
  '/risk/assessment': 'menu:risk',
  '/risk/response': 'menu:risk',
  '/risk/case': 'menu:risk',
  '/risk/location': 'menu:risk',
  '/message': 'menu:message',
  '/data/config': 'menu:data',
  '/data/monitor': 'menu:data',
  '/data/quality': 'menu:data',
  '/data/models': 'menu:data',
  '/data/storage': 'menu:data',
  '/system/profile': 'menu:system',
  '/system/department': 'menu:system',
  '/system/role': 'menu:system',
  '/system/account': 'menu:system',
  '/system/permission': 'menu:system',
  '/system/audit': 'menu:system',
  '/system/rbac': 'menu:system',
}

export const DATA_SCOPES = [
  { value: 'all', label: '全部数据' },
  { value: 'dept', label: '本部门及下级' },
  { value: 'region', label: '指定区域' },
  { value: 'self', label: '仅本人相关' },
]

export const DATA_MODULES = [
  { key: 'risk', label: '风险防控' },
  { key: 'analysis', label: '进出口分析' },
  { key: 'opportunity', label: '商机识别' },
  { key: 'data', label: '数据中心' },
]

export function matchRoutePermission(pathname) {
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname]
  const matched = Object.keys(ROUTE_PERMISSIONS)
    .filter((p) => pathname.startsWith(`${p}/`) || pathname === p)
    .sort((a, b) => b.length - a.length)[0]
  return matched ? ROUTE_PERMISSIONS[matched] : null
}

export function canAccessMenuPath(pathname, can) {
  const menuPerm = MENU_PERMISSION_MAP[pathname]
  if (menuPerm && !can(menuPerm)) return false
  const routePerms = matchRoutePermission(pathname)
  if (routePerms && !routePerms.every((p) => can(p))) return false
  return true
}
