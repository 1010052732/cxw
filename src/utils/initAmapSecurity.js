/**
 * 必须在加载高德 JS 脚本之前设置安全密钥
 * 在 main.jsx 中最先 import 本文件
 */
const securityJsCode = (import.meta.env.VITE_AMAP_SECURITY_CODE || '').trim()
if (securityJsCode) {
  window._AMapSecurityConfig = { securityJsCode }
}
