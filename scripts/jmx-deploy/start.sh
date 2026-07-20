#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ROOT="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$DEPLOY_ROOT/web"
PORT="${DTIP_PORT:-4173}"

echo "========================================"
echo "  数智分析平台 · 一键启动 (Linux)"
echo "========================================"
echo "部署目录: $DEPLOY_ROOT"

if [[ ! -f "$WEB_DIR/index.html" ]]; then
  echo "[错误] 未找到 web/index.html"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[错误] 未找到 Node.js，请先安装 Node.js LTS"
  exit 1
fi

cd "$DEPLOY_ROOT"

if [[ ! -d node_modules/serve ]]; then
  echo "[1/2] 安装静态服务依赖..."
  npm install --no-fund --no-audit
else
  echo "[1/2] 依赖已就绪"
fi

LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo "[2/2] 启动 Web 服务..."
echo "  本机: http://localhost:$PORT/"
if [[ -n "$LAN_IP" ]]; then
  echo "  局域网: http://${LAN_IP}:$PORT/"
fi
echo "  按 Ctrl+C 停止"
echo

npm run start:lan
