/** 高德地图 JS API 2.0 动态加载 */

import './initAmapSecurity.js'

const AMAP_BASE = 'https://webapi.amap.com/maps'

let loadPromise = null

export function getAmapKey() {
  return (import.meta.env.VITE_AMAP_KEY || '').trim()
}

export function getAmapSecurityCode() {
  return (import.meta.env.VITE_AMAP_SECURITY_CODE || '').trim()
}

export function hasAmapKey() {
  return Boolean(getAmapKey())
}

function ensureSecurityConfig() {
  const security = getAmapSecurityCode()
  if (security) {
    window._AMapSecurityConfig = { securityJsCode: security }
  }
}

function loadScript(key) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `${AMAP_BASE}?v=2.0&key=${key}`
    script.onerror = () => reject(new Error('AMAP_LOAD_FAILED'))
    script.onload = () => {
      if (window.AMap) resolve(window.AMap)
      else reject(new Error('AMAP_LOAD_FAILED'))
    }
    document.head.appendChild(script)
  })
}

function loadPlugins(AMap, plugins = []) {
  if (!plugins.length) return Promise.resolve(AMap)
  return new Promise((resolve) => {
    AMap.plugin(plugins, () => resolve(AMap))
  })
}

export function loadAmap(plugins = ['AMap.Scale', 'AMap.ToolBar']) {
  const key = getAmapKey()
  if (!key) {
    return Promise.reject(new Error('AMAP_KEY_MISSING'))
  }

  ensureSecurityConfig()

  if (window.AMap) {
    return loadPlugins(window.AMap, plugins).then(() => window.AMap)
  }

  if (!loadPromise) {
    loadPromise = loadScript(key)
      .then((AMap) => loadPlugins(AMap, plugins).then(() => AMap))
      .catch((err) => {
        loadPromise = null
        throw err
      })
  }

  return loadPromise
}

export function resetAmapLoader() {
  loadPromise = null
}
