# 部署说明

下面给你一套可直接落地的技术方案（阿里云 Ubuntu + Docusaurus + 免费 SSL + 极速更新）。我把“为什么这样做”和“每一步要敲的命令/配置”都写好了，你照着走就能上线并自动续期、自动发布。

---

# 架构一图流

本地改内容 → 推 Git 仓库（GitHub/Gitee/Codeup） → GitHub Actions 构建静态站 → `rsync` 同步到阿里云服务器的 `releases/时间戳` → 切换 `current` 软链接（**零停机**） → Nginx 静态托管 + **Let’s Encrypt（acme.sh + 阿里云 DNS-API）自动续期**。

---

# 一次性准备（服务器）

## 0）基础环境与账号

```bash
# 创建部署用户（可用已有用户；示例用 deploy）
sudo adduser deploy
sudo usermod -aG sudo deploy

# 开启防火墙（放行 22/80/443）
sudo apt update && sudo apt install -y ufw nginx
sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443
sudo ufw enable

# （阿里云控制台）安全组也放行 22/80/443
```

## 1）目录结构（零停机场景）

```bash
sudo mkdir -p /var/www/site/{releases,shared,logs}
sudo chown -R deploy:deploy /var/www/site
```

## 2）免费证书（Let’s Encrypt；DNS-01，支持通配符）

> 用 **acme.sh + 阿里云 DNS API**，不占用 80/443，续期全自动，适合大陆机房/走 CDN 的场景。

```bash
# 以 root 执行（证书默认装在 /root/.acme.sh）
curl https://get.acme.sh | sh -s email=you@example.com
source ~/.bashrc

# 设置阿里云 DNS 的 API Key（在阿里云控制台创建）
export Ali_Key="LTAIxxxxxxxx"
export Ali_Secret="xxxxxxxxxxxx"

# 签发主域 + 通配符（把 example.com 换成你的域名）
acme.sh --issue --dns dns_ali -d example.com -d *.example.com

# 安装到 Nginx 习惯路径，并在续期后自动 reload
mkdir -p /etc/ssl/private /etc/ssl/certs
acme.sh --install-cert -d example.com \
  --key-file       /etc/ssl/private/example.com.key \
  --fullchain-file /etc/ssl/certs/example.com.fullchain.pem \
  --reloadcmd     "systemctl reload nginx"
```

## 3）Nginx 站点配置（静态托管 Docusaurus）

> Docusaurus 是**纯静态**站点，直接由 Nginx 托管最佳；注意 `try_files ... /index.html` 以支持前端路由。

```nginx
# /etc/nginx/sites-available/site.conf
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/ssl/certs/example.com.fullchain.pem;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    # 安全与性能（可按需精简）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    ssl_stapling on; ssl_stapling_verify on;

    access_log /var/www/site/logs/access.log;
    error_log  /var/www/site/logs/error.log;

    root /var/www/site/current;   # 指向当前生效版本
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 可选：静态资源长缓存
    location ~* \.(?:js|css|svg|png|jpg|jpeg|gif|ico|webp|woff2?)$ {
        expires 30d;
        access_log off;
        try_files $uri =404;
    }
}
```

启用并检查：

```bash
sudo ln -s /etc/nginx/sites-available/site.conf /etc/nginx/sites-enabled/site.conf
sudo nginx -t && sudo systemctl reload nginx
```

---

# 项目与自动发布（把“修改→上线”变成一次 push）

## 4）Docusaurus 项目建议

* 仓库根目录结构（常见）：

```
docusaurus.config.ts
package.json
src/
docs/         # 主要内容（你只要改这里/Blog 就能触发全自动发布）
blog/
static/
```

* Node 版本锁定到 LTS（18/20），并固定依赖（`package-lock.json` 或 `pnpm-lock.yaml`）以保证可重复构建。

## 5）GitHub Actions（云端构建、同步到服务器）

> 优点：服务器**无需 Node**，只托管静态文件；构建更快、稳定、好维护。
> 你需要在 GitHub 仓库 **Settings → Secrets and variables → Actions** 添加：
>
> * `SSH_HOST`（服务器公网 IP）
> * `SSH_PORT`（一般 22）
> * `SSH_USER`（deploy）
> * `SSH_KEY`（deploy 用户的私钥；公钥放到服务器 `~/.ssh/authorized_keys`）
> * 可选：`DEPLOY_PATH`（默认 `/var/www/site`）

**.github/workflows/deploy.yml**

```yaml
name: Build & Deploy Docusaurus
on:
  push:
    branches: [ main ]   # 主分支 push 自动发布
  workflow_dispatch: {}  # 也可手动触发

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install deps
        run: npm ci

      - name: Build
        run: npx docusaurus build

      - name: Rsync to server (upload as a new release)
        uses: burnett01/rsync-deployments@7.0.1
        with:
          switches: -avzr --delete
          path: build/
          remote_path: ${{ secrets.DEPLOY_PATH || '/var/www/site' }}/releases/${{ github.sha }}/
          remote_host: ${{ secrets.SSH_HOST }}
          remote_port: ${{ secrets.SSH_PORT }}
          remote_user: ${{ secrets.SSH_USER }}
          remote_key:  ${{ secrets.SSH_KEY }}

      - name: Activate release (atomic symlink switch)
        uses: appleboy/ssh-action@v1.1.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            set -e
            cd ${{ secrets.DEPLOY_PATH || '/var/www/site' }}
            ln -sfn releases/${{ github.sha }} current
            # 可选：保留最近 5 个版本，清理旧版本
            ls -1dt releases/* | tail -n +6 | xargs -r rm -rf
            # Nginx 静态文件无需重启；若你有缓存层，可在此处做刷新
```

> 使用：以后你只要**改 `docs/` 或 `blog/` 内容并 push 到 main**，1～2 分钟内自动构建并切换到新版本。失败不影响线上旧版本（因为是新目录 + 原子切换）。

---

# 内容修改 & 快速生效

* **日常改内容**：本地 `docs/xxx.md`/`blog/xxx.md` 改完 → `git commit -m "update"` → `git push`。
* **想预览**：本地 `npm run start` 热刷新；线上是静态托管，无需 `serve`。
* **紧急回滚**：在服务器上执行（或 GitHub Actions 里作个 Rollback 手动触发工作流）：

  ```bash
  cd /var/www/site
  ln -sfn $(ls -1dt releases/* | sed -n '2p') current
  ```

---

# 常见坑 & 小贴士

* **Docusaurus 只需静态托管**：不要把 `npm run serve` 当作生产方案。生产里直接让 Nginx 读取 `build/`。
* **前端路由 404**：务必保留 `try_files $uri $uri/ /index.html;`，否则刷新子路径会 404。
* **Node 源**：国内构建建议把 npm 源切到 npmmirror（仅用于 Actions 外的本地构建）。
* **HTTPS 首次联机**：证书申请走 DNS-01，不依赖 80/443；若你选 HTTP-01，记得放行 80 并确保未被占用。
* **证书自动续期**：`acme.sh` 默认安装了 cron；你也可以用 systemd timer（可选）。
* **CDN（可选）**：如接入阿里云/Cloudflare CDN，浏览器侧证书由 CDN 托管；源站证书仍按上述方案维护。

---

# 你需要替换的变量清单

* `example.com` → 你的域名（已备案 ✔）
* `you@example.com` → 接通知的邮箱
* GitHub Secrets：`SSH_HOST`、`SSH_PORT`、`SSH_USER`、`SSH_KEY`、（可选）`DEPLOY_PATH`

---

如果你把**域名**（是否用了子域/通配符）、**是否走 CDN**、**Git 托管位置（GitHub/Gitee/阿里云 Codeup）**告诉我，我可以把上面的 `nginx` 配置、`deploy.yml` 和证书签发命令替换成**你的最终版本**，并帮你核对一遍每条命令不会冲突。


不是。
**`ssh_key` 不是服务器密码**，而是**SSH 私钥**的内容，用来做“公钥登录”。做法是：你在本地生成一对钥匙（私钥 + 公钥）；把**公钥**放到服务器的 `~/.ssh/authorized_keys`；**私钥**保存在 GitHub 的**加密 Secrets**里供 Workflow 使用。**不要把密码或私钥明文写进仓库或 workflow yml**。

下面是最小可行、安全的做法（Ubuntu 服务器 + GitHub Actions）：

## 1) 本地生成一对专用密钥

```bash
# 本地或安全的跳板机上
ssh-keygen -t ed25519 -C "gha-deploy@example.com" -f ~/.ssh/gha-deploy
# 生成了：
# 私钥  ~/.ssh/gha-deploy
# 公钥  ~/.ssh/gha-deploy.pub
```

## 2) 把**公钥**装到服务器的部署用户上

```bash
# 假设你的部署用户是 deploy，服务器 IP 是 1.2.3.4
ssh-copy-id -i ~/.ssh/gha-deploy.pub deploy@1.2.3.4
# 若没有 ssh-copy-id，就手动追加：
# cat ~/.ssh/gha-deploy.pub | ssh deploy@1.2.3.4 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys'
```

测试一下（应当无需密码）：

```bash
ssh -i ~/.ssh/gha-deploy deploy@1.2.3.4 'echo ok'
```

> 可选强化：确认能免密登录后，在服务器 `/etc/ssh/sshd_config` 里将
> `PasswordAuthentication no`（禁用口令登录），再 `sudo systemctl reload sshd`。

## 3) 在 GitHub 仓库配置 **Secrets**（加密存储）

到 **Repo → Settings → Secrets and variables → Actions → New repository secret**：

* `SSH_HOST`：你的服务器 IP 或域名
* `SSH_PORT`：`22`（或你的自定义端口）
* `SSH_USER`：`deploy`
* `SSH_KEY`：把 **私钥文件 `~/.ssh/gha-deploy` 的全文**粘进去（包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 到 `-----END ...-----`）。

> 说明：Secrets 在 GitHub **加密存储**、在日志中会**打码**，workflow yml 里只以 `${{ secrets.SSH_KEY }}` 这种形式引用，不会出现在仓库里。

## 4) 在 workflow 里引用（不要写明文）

以你之前的两个步骤为例：

```yaml
      - name: Rsync to server
        uses: burnett01/rsync-deployments@7.0.1
        with:
          switches: -avzr --delete
          path: build/
          remote_path: /var/www/site/releases/${{ github.sha }}/
          remote_host: ${{ secrets.SSH_HOST }}
          remote_port: ${{ secrets.SSH_PORT }}
          remote_user: ${{ secrets.SSH_USER }}
          remote_key:  ${{ secrets.SSH_KEY }}

      - name: Activate release
        uses: appleboy/ssh-action@v1.1.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            set -e
            cd /var/www/site
            ln -sfn releases/${{ github.sha }} current
            ls -1dt releases/* | tail -n +6 | xargs -r rm -rf
```

## 5) 进一步安全建议（可选）

* **专用部署用户**：仅对 `/var/www/site` 有写权限，避免给 root。
* **限制该 key 的能力**：把 `authorized_keys` 里这一行前面加上限制项，例如
  `no-agent-forwarding,no-port-forwarding,no-X11-forwarding,no-pty `（阻止端口/代理等滥用）。
* **Environments 保护**：在 GitHub **Environments** 里放同名 Secrets，并设置“仅允许 main 分支、需要审批”再部署。
* **校验服务器指纹**：在 workflow 里添加一步 `ssh-keyscan -H $SSH_HOST >> ~/.ssh/known_hosts`，并开启 `StrictHostKeyChecking yes` 以防中间人攻击。

---

**结论**：

* `ssh_key` 不是密码，是**SSH 私钥**（和服务器上的**公钥**配对使用）。
* 不要把它写进 yml 或仓库；把**私钥内容放进 GitHub Secrets**，在 workflow 里通过 `${{ secrets.SSH_KEY }}` 引用即可。
