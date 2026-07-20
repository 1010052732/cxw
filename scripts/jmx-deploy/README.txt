数智分析平台 · 部署包使用说明
================================

版本: 见 VERSION 文件
适用: Windows / Linux 服务器、另一台办公电脑

【快速启动 - Windows】
  双击 START.bat（推荐，英文文件名兼容性更好）
  或双击「启动平台.bat」
  首次运行会自动安装 serve 静态服务（需联网）
  启动后访问:
    本机   http://localhost:4173/
    局域网 http://你的IP:4173/

【快速启动 - Linux】
  chmod +x start.sh
  ./start.sh

【目录说明】
  web/              前端静态文件（已构建，可直接部署）
  启动平台.bat      Windows 一键启动（推荐）
  start.ps1         PowerShell 启动脚本
  start.sh          Linux 启动脚本
  开发模式启动.bat  若含 source 源码目录，可开发调试
  package.json      静态服务依赖（serve）

【环境要求】
  - Node.js 18+ （https://nodejs.org/）
  - 首次启动需联网安装 serve
  - 防火墙放行 TCP 4173（局域网/服务器访问时）

【服务器部署步骤】
  1. 将整个 jmx 文件夹复制到服务器
  2. 安装 Node.js LTS
  3. Windows: 双击启动平台.bat
     Linux:   ./start.sh
  4. 浏览器访问 http://服务器IP:4173/

【另一台电脑使用】
  1. 复制整个 jmx 文件夹到目标电脑
  2. 安装 Node.js
  3. 双击「启动平台.bat」即可

【修改端口】
  设置环境变量 DTIP_PORT，例如 8080

【重新打包】
  在开发机项目根目录执行:
    powershell -File scripts\pack-jmx.ps1

【高德地图】
  地图 Key 已在构建时写入静态资源。
  若需更换 Key，请在源码 .env 修改后重新 pack-jmx 打包。
