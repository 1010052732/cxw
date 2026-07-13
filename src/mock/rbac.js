export const DEPARTMENTS = [
  { id: 'D001', name: '信息技术部', code: 'IT', leader: '管理员', modules: ['data', 'system'], defaultScope: 'all', regions: ['全球'], status: 'active' },
  { id: 'D002', name: '风控部', code: 'RISK', leader: '王芳', modules: ['risk', 'analysis', 'opportunity'], defaultScope: 'dept', regions: ['全球', '欧洲', '南美'], status: 'active' },
  { id: 'D003', name: '出口部', code: 'EXPORT', leader: '张强', modules: ['opportunity', 'analysis', 'risk'], defaultScope: 'dept', regions: ['欧洲', '东南亚'], status: 'active' },
  { id: 'D004', name: '市场研究部', code: 'MR', leader: '李明', modules: ['analysis', 'opportunity'], defaultScope: 'region', regions: ['东南亚', '欧洲', '北美'], status: 'active' },
  { id: 'D005', name: '合规部', code: 'COMP', leader: '陈静', modules: ['risk', 'data'], defaultScope: 'all', regions: ['全球'], status: 'active' },
  { id: 'D006', name: '进口部', code: 'IMPORT', leader: '—', modules: ['analysis', 'opportunity'], defaultScope: 'dept', regions: ['东南亚'], status: 'active' },
  { id: 'D007', name: '财务部', code: 'FIN', leader: '—', modules: ['data'], defaultScope: 'self', regions: [], status: 'active' },
  { id: 'D008', name: '物流部', code: 'LOG', leader: '—', modules: ['risk', 'data'], defaultScope: 'dept', regions: ['全球'], status: 'active' },
]

export const ROLES = [
  {
    id: 'super_admin',
    name: '系统管理员',
    desc: '全量菜单与操作权限',
    permissions: ['menu:home', 'menu:opportunity', 'menu:analysis', 'menu:risk', 'menu:data', 'menu:system', 'menu:message', 'action:risk:read', 'action:risk:write', 'action:risk:assess', 'action:risk:response', 'action:risk:archive:export', 'action:data:export', 'action:rbac:manage'],
    dataRules: {
      risk: { scope: 'all', departments: [], regions: [] },
      analysis: { scope: 'all', departments: [], regions: [] },
      opportunity: { scope: 'all', departments: [], regions: [] },
      data: { scope: 'all', departments: [], regions: [] },
    },
  },
  {
    id: 'risk_director',
    name: '风控总监',
    desc: '风险全模块 + 本部门数据',
    permissions: ['menu:home', 'menu:opportunity', 'menu:risk', 'menu:analysis', 'menu:data', 'menu:system', 'menu:message', 'action:risk:read', 'action:risk:write', 'action:risk:assess', 'action:risk:response', 'action:risk:archive:export'],
    dataRules: {
      risk: { scope: 'dept', departments: ['出口部', '风控部'], regions: ['南美', '欧洲', '全球'] },
      analysis: { scope: 'region', departments: [], regions: ['欧洲', '东南亚'] },
      opportunity: { scope: 'dept', departments: ['出口部'], regions: [] },
      data: { scope: 'self', departments: [], regions: [] },
    },
  },
  {
    id: 'dept_manager',
    name: '业务部门经理',
    desc: '分析+风险查看+本部门应对',
    permissions: ['menu:home', 'menu:opportunity', 'menu:analysis', 'menu:risk', 'menu:system', 'menu:message', 'action:risk:read', 'action:risk:response', 'action:risk:assess'],
    dataRules: {
      risk: { scope: 'dept', departments: ['出口部'], regions: [] },
      analysis: { scope: 'dept', departments: ['出口部'], regions: [] },
      opportunity: { scope: 'dept', departments: ['出口部'], regions: [] },
      data: { scope: 'self', departments: [], regions: [] },
    },
  },
  {
    id: 'analyst',
    name: '数智分析师',
    desc: '分析+商机，无风险写权限',
    permissions: ['menu:home', 'menu:opportunity', 'menu:analysis', 'menu:risk', 'menu:system', 'menu:message', 'action:risk:read', 'action:data:export'],
    dataRules: {
      risk: { scope: 'region', departments: [], regions: ['欧洲', '东南亚', '北美'] },
      analysis: { scope: 'all', departments: [], regions: [] },
      opportunity: { scope: 'region', departments: [], regions: ['东盟', '欧洲'] },
      data: { scope: 'self', departments: [], regions: [] },
    },
  },
  {
    id: 'auditor',
    name: '合规审计员',
    desc: '只读+档案审计导出',
    permissions: ['menu:home', 'menu:risk', 'menu:data', 'menu:system', 'menu:message', 'action:risk:read', 'action:risk:archive:export', 'action:data:export'],
    dataRules: {
      risk: { scope: 'all', departments: [], regions: [] },
      analysis: { scope: 'all', departments: [], regions: [] },
      opportunity: { scope: 'all', departments: [], regions: [] },
      data: { scope: 'all', departments: [], regions: [] },
    },
  },
]

export const USERS = [
  { id: 'U001', name: '管理员', username: 'admin', roleId: 'super_admin', dept: '信息技术部', region: '全球', status: 'active' },
  { id: 'U002', name: '王芳', username: 'wangfang', roleId: 'risk_director', dept: '风控部', region: '全球', status: 'active' },
  { id: 'U003', name: '张强', username: 'zhangqiang', roleId: 'dept_manager', dept: '出口部', region: '欧洲', status: 'active' },
  { id: 'U004', name: '李明', username: 'liming', roleId: 'analyst', dept: '市场研究部', region: '东南亚', status: 'active' },
  { id: 'U005', name: '陈静', username: 'chenjing', roleId: 'auditor', dept: '合规部', region: '全球', status: 'active' },
]

export const PERMISSION_AUDIT_LOG = [
  { id: 'PA-001', time: '2026-07-02 09:00', operator: '管理员', action: '更新角色权限', target: '风控总监', detail: '新增 action:risk:archive:export' },
  { id: 'PA-002', time: '2026-07-01 15:30', operator: '管理员', action: '调整数据权限', target: '业务部门经理', detail: 'risk模块 scope=dept · 出口部' },
  { id: 'PA-003', time: '2026-06-28 11:20', operator: '管理员', action: '用户角色变更', target: '张强', detail: 'dept_manager → 出口部数据范围生效' },
]

export function getRoleById(roleId, roles = ROLES) {
  return roles.find((r) => r.id === roleId)
}

export function getUserById(userId, users = USERS) {
  return users.find((u) => u.id === userId)
}

export function cloneRbacState() {
  return {
    departments: DEPARTMENTS.map((d) => ({ ...d, modules: [...d.modules], regions: [...d.regions] })),
    roles: ROLES.map((r) => ({ ...r, permissions: [...r.permissions], dataRules: JSON.parse(JSON.stringify(r.dataRules)) })),
    users: USERS.map((u) => ({ ...u })),
    auditLog: [...PERMISSION_AUDIT_LOG],
  }
}

export function getDepartmentById(deptId, departments = DEPARTMENTS) {
  return departments.find((d) => d.id === deptId)
}

export function getDepartmentByName(name, departments = DEPARTMENTS) {
  return departments.find((d) => d.name === name)
}

export function countUsersInDepartment(deptName, users = USERS) {
  return users.filter((u) => u.dept === deptName && u.status !== 'disabled').length
}

export function filterDataByScope(data, rule, user, fieldMap = {}) {
  if (!rule || rule.scope === 'all') return data
  const deptField = fieldMap.dept || 'dept'
  const regionField = fieldMap.region || 'region'
  const ownerField = fieldMap.owner || 'owner'

  return data.filter((row) => {
    if (rule.scope === 'self') {
      const owner = row[ownerField] || row.reporter || row.owner
      return !owner || owner.includes(user.name) || owner === user.username
    }
    if (rule.scope === 'dept') {
      const dept = row[deptField] || row.dept
      if (!dept) return rule.departments.includes(user.dept)
      return rule.departments.length === 0 ? dept === user.dept : rule.departments.includes(dept)
    }
    if (rule.scope === 'region') {
      const region = row[regionField] || row.region
      if (!region) return true
      const allowed = rule.regions.length ? rule.regions : [user.region]
      return allowed.some((r) => region.includes(r) || r.includes(region))
    }
    return true
  })
}
