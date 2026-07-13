import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { matchRoutePermission } from './permissions'
import {
  cloneRbacState,
  filterDataByScope,
  getDepartmentByName,
  getRoleById,
  getUserById,
} from '../mock/rbac'

const STORAGE_KEY = 'dt-rbac-state'
const SESSION_USER_KEY = 'dt-current-user'
const RBAC_VERSION = 3

const DEFAULT_DATA_RULES = {
  risk: { scope: 'dept', departments: [], regions: [] },
  analysis: { scope: 'dept', departments: [], regions: [] },
  opportunity: { scope: 'dept', departments: [], regions: [] },
  data: { scope: 'self', departments: [], regions: [] },
}

const AuthContext = createContext(null)

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.version === RBAC_VERSION) return parsed
      if (parsed.version === 2) {
        const fresh = cloneRbacState()
        return {
          ...fresh,
          roles: parsed.roles || fresh.roles,
          users: (parsed.users || fresh.users).map((u) => ({ status: 'active', ...u })),
          auditLog: parsed.auditLog || fresh.auditLog,
          version: RBAC_VERSION,
        }
      }
    }
  } catch {
    /* ignore */
  }
  return { ...cloneRbacState(), version: RBAC_VERSION }
}

function loadUserId() {
  return localStorage.getItem(SESSION_USER_KEY) || 'U002'
}

function appendAudit(state, entry, operator) {
  return {
    id: `PA-${Date.now()}`,
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    operator,
    ...entry,
  }
}

export function AuthProvider({ children }) {
  const [rbacState, setRbacState] = useState(loadState)
  const [currentUserId, setCurrentUserId] = useState(loadUserId)

  const currentUser = useMemo(
    () => getUserById(currentUserId, rbacState.users) || rbacState.users[0],
    [currentUserId, rbacState.users],
  )

  const currentRole = useMemo(
    () => getRoleById(currentUser?.roleId, rbacState.roles),
    [currentUser, rbacState.roles],
  )

  const persist = useCallback((next) => {
    const withVersion = { ...next, version: RBAC_VERSION }
    setRbacState(withVersion)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withVersion))
  }, [])

  const switchUser = useCallback((userId) => {
    setCurrentUserId(userId)
    localStorage.setItem(SESSION_USER_KEY, userId)
  }, [])

  const can = useCallback(
    (permission) => !!currentRole?.permissions.includes(permission),
    [currentRole],
  )

  const canAny = useCallback(
    (permissions = []) => permissions.some((p) => can(p)),
    [can],
  )

  const canAccessRoute = useCallback(
    (pathname) => {
      const required = matchRoutePermission(pathname)
      if (!required) return true
      return required.every((p) => can(p))
    },
    [can],
  )

  const getDataRule = useCallback(
    (moduleKey) => {
      const roleRule = currentRole?.dataRules?.[moduleKey] || { scope: 'all', departments: [], regions: [] }
      const dept = getDepartmentByName(currentUser?.dept, rbacState.departments)
      if (!dept?.modules?.includes(moduleKey)) return roleRule
      if (roleRule.scope !== 'all') return roleRule
      if (dept.defaultScope === 'all') return roleRule
      return {
        scope: dept.defaultScope,
        departments: dept.defaultScope === 'dept' ? [currentUser.dept] : roleRule.departments,
        regions: dept.regions?.length ? dept.regions : roleRule.regions.length ? roleRule.regions : [currentUser.region],
      }
    },
    [currentRole, currentUser, rbacState.departments],
  )

  const filterModuleData = useCallback(
    (data, moduleKey, fieldMap) => filterDataByScope(data, getDataRule(moduleKey), currentUser, fieldMap),
    [currentUser, getDataRule],
  )

  const updateRolePermissions = useCallback(
    (roleId, permissions) => {
      const next = {
        ...rbacState,
        roles: rbacState.roles.map((r) => (r.id === roleId ? { ...r, permissions: [...permissions] } : r)),
        auditLog: [
          appendAudit(rbacState, {
            action: '更新角色权限',
            target: getRoleById(roleId, rbacState.roles)?.name,
            detail: `共 ${permissions.length} 项权限`,
          }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
    },
    [rbacState, currentUser.name, persist],
  )

  const updateRoleDataRules = useCallback(
    (roleId, dataRules) => {
      const next = {
        ...rbacState,
        roles: rbacState.roles.map((r) => (r.id === roleId ? { ...r, dataRules: { ...dataRules } } : r)),
        auditLog: [
          appendAudit(rbacState, {
            action: '调整数据权限',
            target: getRoleById(roleId, rbacState.roles)?.name,
            detail: Object.entries(dataRules).map(([k, v]) => `${k}:${v.scope}`).join(' · '),
          }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
    },
    [rbacState, currentUser.name, persist],
  )

  const createRole = useCallback(
    ({ name, desc, copyRoleId }) => {
      const template = copyRoleId ? getRoleById(copyRoleId, rbacState.roles) : null
      const role = {
        id: `role_${Date.now()}`,
        name,
        desc: desc || '自定义角色',
        permissions: template ? [...template.permissions] : ['menu:home'],
        dataRules: template
          ? JSON.parse(JSON.stringify(template.dataRules))
          : JSON.parse(JSON.stringify(DEFAULT_DATA_RULES)),
      }
      const next = {
        ...rbacState,
        roles: [...rbacState.roles, role],
        auditLog: [
          appendAudit(rbacState, { action: '新增角色', target: name, detail: template ? `复制自 ${template.name}` : '默认权限集' }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
      return role
    },
    [rbacState, currentUser.name, persist],
  )

  const updateRoleMeta = useCallback(
    (roleId, patch) => {
      const next = {
        ...rbacState,
        roles: rbacState.roles.map((r) => (r.id === roleId ? { ...r, ...patch } : r)),
        auditLog: [
          appendAudit(rbacState, { action: '更新角色', target: getRoleById(roleId, rbacState.roles)?.name, detail: patch.name || patch.desc || '信息变更' }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
    },
    [rbacState, currentUser.name, persist],
  )

  const deleteRole = useCallback(
    (roleId) => {
      if (roleId === 'super_admin') return false
      const bound = rbacState.users.some((u) => u.roleId === roleId)
      if (bound) return false
      const target = getRoleById(roleId, rbacState.roles)
      const next = {
        ...rbacState,
        roles: rbacState.roles.filter((r) => r.id !== roleId),
        auditLog: [
          appendAudit(rbacState, { action: '删除角色', target: target?.name, detail: '角色已移除' }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
      return true
    },
    [rbacState, currentUser.name, persist],
  )

  const createUser = useCallback(
    ({ name, username, dept, region, roleId }) => {
      const maxNum = rbacState.users.reduce((max, u) => {
        const n = Number(String(u.id).replace(/\D/g, ''))
        return Number.isFinite(n) ? Math.max(max, n) : max
      }, 0)
      const user = {
        id: `U${String(maxNum + 1).padStart(3, '0')}`,
        name,
        username,
        dept,
        region: region || '全球',
        roleId: roleId || rbacState.roles.find((r) => r.id === 'analyst')?.id || rbacState.roles[0]?.id,
        status: 'active',
      }
      const next = {
        ...rbacState,
        users: [...rbacState.users, user],
        auditLog: [
          appendAudit(rbacState, { action: '新增账号', target: name, detail: `${username} · ${dept} · ${getRoleById(user.roleId, rbacState.roles)?.name}` }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
      return user
    },
    [rbacState, currentUser.name, persist],
  )

  const updateUser = useCallback(
    (userId, patch) => {
      const next = {
        ...rbacState,
        users: rbacState.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
        auditLog: [
          appendAudit(rbacState, { action: '更新账号', target: getUserById(userId, rbacState.users)?.name, detail: Object.keys(patch).join('、') }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
    },
    [rbacState, currentUser.name, persist],
  )

  const updateUserRole = useCallback(
    (userId, roleId) => {
      const next = {
        ...rbacState,
        users: rbacState.users.map((u) => (u.id === userId ? { ...u, roleId } : u)),
        auditLog: [
          appendAudit(rbacState, {
            action: '用户角色变更',
            target: getUserById(userId, rbacState.users)?.name,
            detail: `绑定角色 ${getRoleById(roleId, rbacState.roles)?.name}`,
          }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
    },
    [rbacState, currentUser.name, persist],
  )

  const toggleUserStatus = useCallback(
    (userId) => {
      const user = getUserById(userId, rbacState.users)
      if (!user || user.id === currentUserId) return false
      const status = user.status === 'disabled' ? 'active' : 'disabled'
      const next = {
        ...rbacState,
        users: rbacState.users.map((u) => (u.id === userId ? { ...u, status } : u)),
        auditLog: [
          appendAudit(rbacState, { action: status === 'disabled' ? '停用账号' : '启用账号', target: user.name, detail: user.username }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
      return true
    },
    [rbacState, currentUserId, currentUser.name, persist],
  )

  const createDepartment = useCallback(
    ({ name, code, leader, modules, defaultScope, regions }) => {
      const dept = {
        id: `D${String(rbacState.departments.length + 1).padStart(3, '0')}`,
        name,
        code: code || name.slice(0, 4).toUpperCase(),
        leader: leader || '—',
        modules: modules || ['analysis'],
        defaultScope: defaultScope || 'dept',
        regions: regions || [],
        status: 'active',
      }
      const next = {
        ...rbacState,
        departments: [...rbacState.departments, dept],
        auditLog: [
          appendAudit(rbacState, { action: '新增部门', target: name, detail: `默认范围 ${defaultScope || 'dept'}` }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
      return dept
    },
    [rbacState, currentUser.name, persist],
  )

  const updateDepartment = useCallback(
    (deptId, patch) => {
      const next = {
        ...rbacState,
        departments: rbacState.departments.map((d) => (d.id === deptId ? { ...d, ...patch } : d)),
        auditLog: [
          appendAudit(rbacState, { action: '更新部门权限', target: rbacState.departments.find((d) => d.id === deptId)?.name, detail: '部门数据范围或模块变更' }, currentUser.name),
          ...rbacState.auditLog,
        ],
      }
      persist(next)
    },
    [rbacState, currentUser.name, persist],
  )

  const resetRbac = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setRbacState({ ...cloneRbacState(), version: RBAC_VERSION })
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      currentRole,
      departments: rbacState.departments || [],
      roles: rbacState.roles,
      users: rbacState.users,
      auditLog: rbacState.auditLog,
      switchUser,
      can,
      canAny,
      canAccessRoute,
      getDataRule,
      filterModuleData,
      updateRolePermissions,
      updateRoleDataRules,
      createRole,
      updateRoleMeta,
      deleteRole,
      createUser,
      updateUser,
      updateUserRole,
      toggleUserStatus,
      createDepartment,
      updateDepartment,
      resetRbac,
    }),
    [
      currentUser,
      currentRole,
      rbacState,
      switchUser,
      can,
      canAny,
      canAccessRoute,
      getDataRule,
      filterModuleData,
      updateRolePermissions,
      updateRoleDataRules,
      createRole,
      updateRoleMeta,
      deleteRole,
      createUser,
      updateUser,
      updateUserRole,
      toggleUserStatus,
      createDepartment,
      updateDepartment,
      resetRbac,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
