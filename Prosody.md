# pevoro.cn XMPP / Prosody 最终服务器修改记录

记录日期：2026-05-07  
系统：Ubuntu  
公网 IP：121.199.73.156  
主域名：pevoro.cn  
Web 服务：Caddy + Docusaurus  
XMPP 服务：Prosody  
当前 Prosody 版本：13.0.5  
当前 Lua 版本：Lua 5.4  


## 1. 当前最终状态

已确认：

```text
Prosody 已升级到 13.0.5
系统默认 Lua 已切换到 Lua 5.4
Prosody 配置检查通过
Prosody 证书检查通过
VirtualHost 已设置为 pevoro.cn
开放注册已启用
invites_register 已禁用，避免注册变成邀请制
pevoro.cn / xmpp.pevoro.cn 证书已申请并导入 Prosody
Certbot 自动续期 dry-run 已通过
user@pevoro.cn 已成功登录过
```

当前核心结构：

```text
https://pevoro.cn              -> Caddy -> Docusaurus
用户名@pevoro.cn              -> XMPP 用户地址
xmpp.pevoro.cn:5222           -> Prosody 客户端登录/注册
xmpp.pevoro.cn:5269           -> Prosody 服务器互联
https://share.pevoro.cn        -> Caddy -> 127.0.0.1:5280
```

注意：`share.pevoro.cn` 的 Caddy 反代已存在，但 Prosody 13 升级后，`Component "share.pevoro.cn" "http_file_share"` 尚未在最终配置中确认重新添加，因此文件分享功能不能视为已经完成。


设置了服务器组策略，针对rustdesk、docusaurus和prosody开放了特定端口。

---

## 2. DNS 最终记录

最终采用：

| 类型 | 主机记录 | 记录值 |
|---|---|---|
| A | @ | 121.199.73.156 |
| A | xmpp | 121.199.73.156 |
| A | share | 121.199.73.156 |
| SRV | _xmpp-client._tcp | 5 0 5222 xmpp.pevoro.cn. |
| SRV | _xmpp-server._tcp | 5 0 5269 xmpp.pevoro.cn. |

说明：

```text
5222 是客户端登录/注册端口
5269 是服务器互联端口
客户端不要使用 5269
XMPP 用户名格式为：用户名@pevoro.cn
不要使用：用户名@xmpp.pevoro.cn
```

---

## 3. Caddy 最终修改

### 3.1 创建 Certbot 专用目录

```bash
sudo mkdir -p /var/www/certbot
sudo chown -R caddy:caddy /var/www/certbot
```

用途：

```text
仅用于 Let's Encrypt / Certbot 的 HTTP-01 验证
不使用 /var/www/site，避免被 Docusaurus 构建覆盖
```

### 3.2 pevoro.cn 增加 ACME challenge 路径

`/etc/caddy/Caddyfile` 中，`pevoro.cn` 应保留如下结构：

```caddyfile
pevoro.cn {
  handle /.well-known/acme-challenge/* {
    root * /var/www/certbot
    file_server
  }

  handle {
    root * /var/www/site
    file_server
    encode zstd gzip

    @static path_regexp static \.(css|js|mjs|png|jpg|jpeg|gif|svg|ico|woff2)$
    header @static Cache-Control "public, max-age=31536000, immutable"

    @html path *.html
    header @html Cache-Control "no-store"

    try_files {path} {path}/ /index.html

    header {
      X-Content-Type-Options "nosniff"
      Referrer-Policy "strict-origin-when-cross-origin"
    }
  }
}
```

### 3.3 增加 xmpp.pevoro.cn 站点

用于让 Certbot 能验证并签发包含 `xmpp.pevoro.cn` 的证书：

```caddyfile
xmpp.pevoro.cn {
  handle /.well-known/acme-challenge/* {
    root * /var/www/certbot
    file_server
  }

  respond "XMPP service for pevoro.cn" 200
}
```

已确认：

```bash
curl https://xmpp.pevoro.cn/.well-known/acme-challenge/test
```

返回：

```text
test
```

### 3.4 share.pevoro.cn 反代

Caddyfile 中保留：

```caddyfile
share.pevoro.cn {
    reverse_proxy 127.0.0.1:5280
}
```

### 3.5 Caddy 检查

已执行并通过：

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

输出包含：

```text
Valid configuration
```

---

## 4. Certbot 最终修改

### 4.1 安装状态

已确认：

```bash
certbot --version
```

输出：

```text
certbot 2.9.0
```

### 4.2 最终证书

最终证书覆盖：

```text
pevoro.cn
xmpp.pevoro.cn
```

有效执行命令：

```bash
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d pevoro.cn \
  -d xmpp.pevoro.cn
```

证书路径：

```text
/etc/letsencrypt/live/pevoro.cn/fullchain.pem
/etc/letsencrypt/live/pevoro.cn/privkey.pem
```

到期时间：

```text
2026-08-05
```

### 4.3 证书内容验证

已确认 Prosody 5222 返回的证书包含：

```text
DNS:pevoro.cn
DNS:xmpp.pevoro.cn
```

验证命令：

```bash
echo | openssl s_client \
  -connect xmpp.pevoro.cn:5222 \
  -starttls xmpp \
  -xmpphost pevoro.cn \
  -servername xmpp.pevoro.cn \
  2>/dev/null | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
```

已确认输出包含：

```text
subject=CN=pevoro.cn
issuer=C=US, O=Let's Encrypt, CN=E7
X509v3 Subject Alternative Name:
    DNS:pevoro.cn, DNS:xmpp.pevoro.cn
```

### 4.4 自动续期

已执行：

```bash
sudo certbot renew --dry-run
```

确认成功：

```text
Congratulations, all simulated renewals succeeded:
  /etc/letsencrypt/live/pevoro.cn/fullchain.pem (success)
```

### 4.5 Prosody 自动导入证书

扩展证书时，Certbot 输出过：

```text
Hook 'deploy-hook' ran with output:
 Imported certificate and key for hosts pevoro.cn, xmpp.pevoro.cn
```

说明当前存在 deploy hook 或 deploy-hook 配置，可在证书更新后导入 Prosody。

建议确认：

```bash
sudo grep -R "prosodyctl.*cert import" /etc/letsencrypt/renewal /etc/letsencrypt/renewal-hooks/deploy 2>/dev/null
```

理想 hook 内容：

```sh
#!/bin/sh
/usr/bin/prosodyctl --root cert import /etc/letsencrypt/live
systemctl reload prosody
```

---

## 5. Prosody 官方源与升级

### 5.1 添加 Prosody 官方源

由于 Ubuntu noble 默认源只有 Prosody 0.12.4，最终添加 Prosody 官方源：

```bash
sudo wget https://prosody.im/downloads/repos/$(lsb_release -sc)/prosody.sources -O /etc/apt/sources.list.d/prosody.sources
sudo apt update
```

添加后 `apt policy prosody` 显示候选版本：

```text
13.0.5-1~noble1
```

### 5.2 升级 Prosody

最终升级到：

```text
Prosody 13.0.5
```

确认命令：

```bash
sudo prosodyctl about
```

确认输出包含：

```text
Prosody 13.0.5
Lua version: Lua 5.4
```

升级时没有保留旧配置，最终采用 Prosody 13 新模板，并在新模板上重新补必要配置。

---

## 6. Lua 最终修改

升级 Prosody 13 后出现：

```text
Prosody is no longer compatible with Lua 5.1
```

最终通过 alternatives 将系统默认 Lua 切换到 Lua 5.4：

```bash
sudo update-alternatives --config lua-interpreter
```

选择：

```text
/usr/bin/lua5.4
```

确认：

```bash
lua -v
```

输出：

```text
Lua 5.4.6
```

---

## 7. Prosody 13 配置最终修改

配置文件：

```text
/etc/prosody/prosody.cfg.lua
```

### 7.1 禁用邀请注册

将：

```lua
"invites_register"; -- Allows invited users to create accounts
```

改为：

```lua
--"invites_register"; -- Allows invited users to create accounts
```

原因：注册日志中出现过：

```text
Registration disallowed by module: Registration on this server is through invitation only
```

说明该模块会使注册变为邀请制注册。

### 7.2 保留普通注册模块

保留：

```lua
"register"; -- Allow users to register on this server using a client and change passwords
```

### 7.3 开启开放注册

在全局配置区、`VirtualHost` 之前添加或保留：

```lua
allow_registration = true
min_seconds_between_registrations = 3600
```

说明：

```text
allow_registration = true 允许客户端注册
min_seconds_between_registrations = 3600 限制同一 IP 频繁注册
```

### 7.4 设置正式 VirtualHost

将：

```lua
VirtualHost "localhost"
```

改为：

```lua
VirtualHost "pevoro.cn"
```

### 7.5 配置检查

已执行：

```bash
sudo prosodyctl check config
sudo systemctl restart prosody
sudo prosodyctl check certs
```

确认输出：

```text
All checks passed, congratulations!
```

配置检查时出现：

```text
Public registration is enabled on:
    pevoro.cn
```

这是安全提醒，不是错误，因为当前目标是开放注册。

---

## 8. Prosody 证书最终状态

已执行：

```bash
sudo prosodyctl --root cert import /etc/letsencrypt/live
```

最终导入结果曾显示：

```text
Imported certificate and key for hosts pevoro.cn, xmpp.pevoro.cn
```

当前 Prosody 证书检查通过：

```bash
sudo prosodyctl check certs
```

输出包含：

```text
Checking certificate for pevoro.cn
  Certificate: /etc/prosody/certs/pevoro.cn.crt

All checks passed, congratulations!
```

Prosody 使用的证书文件：

```text
/etc/prosody/certs/pevoro.cn.crt
/etc/prosody/certs/pevoro.cn.key
```

---

## 9. Conversations 问题最终处理

### 9.1 “无通道绑定”

现象：

```text
Conversations 显示“无通道绑定”
```

处理：

```text
添加 Prosody 官方源
升级 Prosody 到 13.0.5
切换 Lua 到 5.4
```

### 9.2 注册被限制为邀请制

日志曾显示：

```text
Registration disallowed by module: Registration on this server is through invitation only
```

处理：

```text
禁用 invites_register
保留 register
保留 allow_registration = true
```

### 9.3 端口使用

注册/登录应使用：

```text
Hostname: xmpp.pevoro.cn
Port: 5222
Security: STARTTLS
```

不要使用：

```text
Port: 5269
```

---

## 10. 用户账号最终记录

已确认至少存在并成功登录过：

```text
user@pevoro.cn
```

客户端建议：

```text
Jabber ID: user@pevoro.cn
Hostname: xmpp.pevoro.cn
Port: 5222
Security: STARTTLS
```

---

## 11. UFW 与安全组最终说明

曾执行过：

```bash
sudo ufw allow 5280/tcp
sudo ufw allow 5281/tcp
```

但当时：

```bash
sudo ufw status numbered
```

输出：

```text
Status: inactive
```

因此这些 UFW 规则当前没有实际生效。

建议若未来启用 UFW，先检查：

```bash
sudo ufw show added
```

如有 5280/5281 规则，删除：

```bash
sudo ufw delete allow 5280/tcp
sudo ufw delete allow 5281/tcp
```

建议公网只开放：

```text
22/tcp
80/tcp
443/tcp
5222/tcp
5269/tcp
```

不建议公网开放：

```text
5280/tcp
5281/tcp
```

---

## 12. 不纳入最终配置的内容

以下内容曾讨论或尝试过，但不作为最终配置：

```text
upload.pevoro.cn：已改为 share.pevoro.cn
Prosody 0.12.4 旧配置：升级时已被覆盖
只包含 pevoro.cn 的单域名证书：已扩展为 pevoro.cn + xmpp.pevoro.cn
Caddy 证书复制给 Prosody 的方案：未采用
5281 公网文件上传方案：未采用
恢复旧 prosody.cfg.lua 的方案：未采用
```

---

## 13. 当前未完成或需确认项

```text
1. Prosody 13 中尚未确认已重新添加 Component "share.pevoro.cn" "http_file_share"
2. share.pevoro.cn 文件分享功能尚未确认测试通过
3. /etc/letsencrypt/renewal-hooks/deploy/prosody.sh 是否实际存在，建议用 grep 命令确认
4. UFW 未来启用前应清理 5280/5281 规则
5. 如果 debug 日志仍开启，稳定后可关闭，避免日志过大
```

---

## 14. 建议备份文件

建议备份：

```text
/etc/caddy/Caddyfile
/etc/prosody/prosody.cfg.lua
/etc/prosody/certs/
/etc/letsencrypt/renewal/pevoro.cn.conf
/etc/letsencrypt/renewal-hooks/deploy/prosody.sh
/etc/apt/sources.list.d/prosody.sources
```

备份命令示例：

```bash
sudo tar -czf ~/pevoro-xmpp-final-config-$(date +%F).tar.gz \
  /etc/caddy/Caddyfile \
  /etc/prosody/prosody.cfg.lua \
  /etc/prosody/certs \
  /etc/letsencrypt/renewal/pevoro.cn.conf \
  /etc/letsencrypt/renewal-hooks/deploy/prosody.sh \
  /etc/apt/sources.list.d/prosody.sources
```

如果 `prosody.sh` 不存在，可以先从命令中删除这一项。

---

## 15. 最终修改清单

最终对服务器产生影响并应保留的修改：

```text
1. 创建 /var/www/certbot 并配置 Caddy 用于 Certbot 验证
2. 修改 Caddyfile，使 pevoro.cn 的 ACME challenge 不被 Docusaurus SPA 回退拦截
3. 添加 xmpp.pevoro.cn Caddy 站点用于证书验证
4. 保留 share.pevoro.cn -> 127.0.0.1:5280 的 Caddy 反代
5. 安装并使用 Certbot
6. 申请 pevoro.cn + xmpp.pevoro.cn 多域名证书
7. 将证书导入 Prosody
8. 确认 Certbot 自动续期 dry-run 成功
9. 添加 Prosody 官方 apt 源
10. 升级 Prosody 到 13.0.5
11. 将默认 Lua 切换为 Lua 5.4
12. 在 Prosody 13 新模板中设置 VirtualHost "pevoro.cn"
13. 开启 allow_registration = true
14. 设置 min_seconds_between_registrations = 3600
15. 禁用 invites_register
16. 保留 register 模块
17. 重启 Prosody 并确认 config/certs 检查通过
