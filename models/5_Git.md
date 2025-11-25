
# Git

git是一个版本控制工具，
一般被用来设置保存代码，控制代码的版本。
但是这个工具不仅限于控制代码，
使用latex写毕业论文也可以使用。
代码长度超过100行，都尽量使用git来做版本控制。

小抄:[git-cheatsheet-CN-dark.pdf](./attachments/git-cheatsheet-CN-dark.pdf)、[git-cheatsheet-EN-dark.pdf](./attachments/git-cheatsheet-EN-dark.pdf)、[Git for Subversion Users.pdf](./attachments/Git_for_Subversion_Users.pdf)

## gitee注册

官网：gitee.com，注册，登陆，创建仓库。

与之类似的还有github，gitlab等，
但是由于监管原因，这些网站在国内的稳定性较差，
但是不可否认，github是目前最好的代码托管平台，
以后查询资料可以上github上去找别人的代码。

git book地址：`https://git-scm.com/book/zh/v2`

## git初始设定

首先是要安装git软件。`https://git-scm.com/downloads`

Git 全局设置，让git知道是谁在修改文件。

``` bash
# 设置用户名
git config --global user.name "pevoro"
# 设置邮箱
git config --global user.email "pevoro@sohu.cn"
```

创建 git 仓库:

```bash
# 创建一个文件夹
mkdir git_learn
# 打开这个文件夹
cd git_learn
# 进行初始化
git init 
# 创建一个README文件
touch README.md
# 添加这个文件到仓库 staged
git add README.md
# 提交
git commit -m "first commit"
# 设定远程仓库地址
git remote add origin https://gitee.com/user_name/git_learn.git
# 推送到远程
git push -u origin "master"
```

用vscode打开这个文件夹，
修改东西、保存。

```bash
git add file1
git commit -m "file1"
git push
```

## 账户密码设置

在git仓库的目录下执行下列命令

```bash
git config credential.helper store                  // 当前项目,永久存储密码
git config credential.helper cache                  // 当前项目,暂时存储密码,默认15分钟
git config credential.helper 'cache --timeout=3600' // 当前项目,暂时存储密码,自定义时间(秒)
git config user.name XXXX                           // 当前项目,设置用户名
git config user.email ***@***.***                   // 当前项目,设置用户邮箱
```

## 更改windwos上git的密码

### 方法1

In Windows 10 with Git
Remove/update related Credentials stored in Windows Credentials in >>Control Panel\All Control Panel Items\Credential Manager

### 方法2 untested

删除原有密码链

```dash
git credential-osxkeychain erase
```

## git vscode extensions

在vscode的Extensions里面搜索安装git graph，
这样在Source control页面的右上角就有一个新的git graph的标志，
打开这里可以方便查看修改历史。
