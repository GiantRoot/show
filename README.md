# 使用 Caddy 部署 Docusaurus 静态站点

## 一次性部署步骤

1. **DNS 指向服务器**
   在域名控制台添加一条 A 记录：`@ -> 你的服务器IP`。

2. **放行 80/443 端口**

* 阿里云安全组：入站放行 TCP 80、443。
* 服务器上（如用 UFW）：

  ```bash
  sudo ufw allow 80,443/tcp
  ```

3. **安装 Caddy**（Ubuntu）

```bash
sudo apt update && sudo apt install -y caddy
```

4. **构建并拷贝站点文件**

```bash
# 安装 Node.js 和 npm（如果还没装）
sudo apt install npm
# 在你的项目里
npm ci
npm run build   # 生成 build/ 目录

# 上传到服务器（本地→服务器）
rsync -av --delete build/ user@server:/var/www/site/
# 或者在服务器本机操作：
sudo mkdir -p /var/www/site
sudo rsync -av --delete build/ /var/www/site/
```

5. **写 Caddyfile**（/etc/caddy/Caddyfile）

```
sodu vim /etc/caddy/Caddyfile
```

```
# www -> 根域名
www.pevoro.cn {
  redir https://pevoro.cn{uri} permanent
}

pevoro.cn {
  # 指向 Docusaurus 构建结果
  root * /var/www/site
  file_server

  # 压缩（HTTP/2/3 自带） 
  encode zstd gzip

  # 指纹静态资源：长缓存
  @static path_regexp static \.(css|js|mjs|png|jpg|jpeg|gif|svg|ico|woff2)$
  header @static Cache-Control "public, max-age=31536000, immutable"

  # HTML 不缓存，便于更新即时生效
  @html path *.html
  header @html Cache-Control "no-store"

  # SPA 回退（Docusaurus 必备）
  try_files {path} {path}/ /index.html

  # 基础安全头（保守，不会影响内嵌）
  header {
    X-Content-Type-Options "nosniff"
    Referrer-Policy "strict-origin-when-cross-origin"
  }
}

```

1. **重载使其生效**

```bash
sudo chown -R caddy:caddy /var/www/site
sudo systemctl reload caddy
```


* **证书续期**：Caddy 会在到期前自动续期；查看证书：

  ```bash
  sudo caddy list-certificates
  journalctl -u caddy --no-pager -n 200
  ```

* **权限问题**：官方包用 `caddy` 用户运行。确保 `/var/www/site` 可读：

  ```bash
  sudo chown -R caddy:caddy /var/www/site
  # 或至少保证所有文件对“其他用户”可读（o+r）
  ```

## 之后如何“自动更新”站点？

```sh
sudo tee /usr/local/bin/deploy_site.sh >/dev/null <<'SH'
#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/deploy/show"
DEST_DIR="/var/www/site"
BRANCH="main"

cd "$REPO_DIR"

# 拉代码（公开仓库用 https；如果你用 ssh，确保 deploy 用户能免密拉取）
git fetch --depth=1 origin "$BRANCH"
git reset --hard "origin/$BRANCH"

# 安装依赖并构建
if git diff --name-only HEAD@{1} HEAD | grep -qE 'package(-lock)?\.json'; then
  echo "[deploy] dependencies changed, running npm ci"
  npm ci --no-audit --no-fund
else
  echo "[deploy] no dependency change, skipping npm ci"
fi
npm run build

# 同步到站点目录（删除多余文件）
rsync -a --delete "$REPO_DIR/build/" "$DEST_DIR/"

# 可选：确保 caddy 可读（只在第一次可能需要）
# chgrp -R caddy "$DEST_DIR" || true
# chmod -R 2755 "$DEST_DIR" || true

echo "[deploy] done at $(date '+%F %T')"
SH

sudo chown deploy:deploy /usr/local/bin/deploy_site.sh
sudo chmod +x /usr/local/bin/deploy_site.sh
```

3）用 cron 定时跑（每 10 分钟一次）

```bash
sudo -u deploy crontab -e

*/10 * * * * /usr/bin/flock -n /var/lock/pevoro-deploy.lock /usr/local/bin/deploy_site.sh >> /var/log/pevoro-deploy.log 2>&1

# 手动更新

```
/usr/local/bin/deploy_site.sh
```