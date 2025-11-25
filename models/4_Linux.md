# Linux

## 常用命令行

[常用命令行](./attachments/CLI-Cheat-Sheet.pdf)

## Linux系统中文件行末尾出现^M的原因及解决办法

不同系统，有不同的换行符号：
    在windows下的文本文件的每一行结尾，都有一个回车('\n')和换行('\r')
    在linux下的文本文件的每一行结尾，只有一个回车('\n');
    在Mac下的文本文件的每一行结尾，只有一个换行('\r');

因此：`^M`出现的原因： 在linux下打开windows编辑过的文件，就会在行末尾显示`^M`;

对此的解决办法就是通过字符替换，将`^M`换掉，具体方法如下：

利用vim打开文件，然后输入vim 命令 `%s/^M$//g`，进行全文件查找替换。

注意：`^` 使用ctrl+v 来输入，`M`使用ctrl+m来输入

## 自动挂载iso

挂载

```bash
sudo mkdir /mnt/BD1
sudo mkdir /mnt/BD2
sudo mkdir /mnt/BD3
sudo mkdir /mnt/BD4
su
echo "/mnt/Linux-Backup/debian11-amd64-full-BD/debian-11.7.0-amd64-BD-1.iso /mnt/BD1 iso9660 defaults 0 0" >> /etc/fstab
echo "/mnt/Linux-Backup/debian11-amd64-full-BD/debian-11.7.0-amd64-BD-2.iso /mnt/BD2 iso9660 defaults 0 0" >> /etc/fstab
echo "/mnt/Linux-Backup/debian11-amd64-full-BD/debian-11.7.0-amd64-BD-3.iso /mnt/BD3 iso9660 defaults 0 0" >> /etc/fstab
echo "/mnt/Linux-Backup/debian11-amd64-full-BD/debian-11.7.0-amd64-BD-4.iso /mnt/BD4 iso9660 defaults 0 0" >> /etc/fstab
exit
sudo mount -a
df -h
```

添加到sources.list，保留清华源中的安全更新

``` bash
sudo gedit /etc/apt/sources.list
deb [trusted=yes] file:///mnt/BD1/ bullseye main contrib
deb [trusted=yes] file:///mnt/BD2/ bullseye main contrib
deb [trusted=yes] file:///mnt/BD3/ bullseye main contrib
deb [trusted=yes] file:///mnt/BD4/ bullseye main contrib
deb https://mirrors.tuna.tsinghua.edu.cn/debian bullseye main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian bullseye main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian-security bullseye-security main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian-security bullseye-security main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian bullseye-updates main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian bullseye-updates main contrib non-free
```

## 用户和组权限设置

### 用户操作

添加用户：`sudo adduser username`,
删除用户:`sudo userdel username`,
将新用户添加到特定组pe:`usermod -aG pe pevoro`(-a代表add，-G代表group),
例如想要给pevoro超级用户权限，则：`sudo usermod -aG sudo pevoro`,
查看用户所属分组:`groups pevoro`
查看某个组有哪些用户:`members pe`

### 控制权

```shell
# chown -R pevoro some_dir/  # 用户获得控制权
chgrp -R pe some_dir/
chmod -R 770 some_dir/
chmod g+s some_dir/  # 文件夹内所有新建文件夹，保持和some_dir一致的权限
```

770的含义
有三位数，这三位数分别是owner的权限，group的权限，全局权限
然后每一位数字可以为，1，2，4组合的和值
1代表可执行
2代表可写入
4代表可读取
例如，第一位数字为7，则代表owner可以读取，写入和执行some_dir/中的文件
例如，第二位数字为5，则代表group可以读取和执行some_dir/中的文件

-R 含义
recursive，对文件夹内的所有文件执行相同操作

如果想要改变一个文件的owner，可以使用下面的命令
chown [user] [file]

如果想要改变一个文件的group，可以使用下面的命令
chgrp [group] [file]
如果是文件夹的话，需要加上-R来进行递归操作，作用于所有的子文件夹和其中的文件

[了解更多pdf](./attachments/Linux-chmod.pdf)

## SSH 远程连接

修改个人目录下面的`.bashrc`文件，添加

```bash
alias P900='ssh -p 端口 pevoro@IP地址'
```

```bash
source .bashrc
ssh-keygen -t rsa -b 4096  # 生成一个sshkey
# ssh-keygen -t ed25519  # 新的加密方式，更安全，但有些系统可能不支持
# 把生成的公钥倒入到远程信任列表
P900 'mkdir -p .ssh && cat >> .ssh/authorized_keys' < ~/.ssh/id_rsa.pub
# 然后在命令行输入P900即可进入窗口
```

## 修改SSH和RDP的端口

修改ssh默认端口，修改rdp远程桌面默认端口

### 首先选择一个端口

有很多协议都有自己的默认端口的，如http默认是80，rtmp默认1935，QQ默认端口8000,4000等等等等，所以端口的使用原则是不冲突。端口号通常是0-65535，每个数字代表一个端口号，为了不冲突，自己开发的东西，尽量使用后面的，一般就在20000-50000之间随便选吧，问题不大。1024以下的端口一般由专用用途，应用程序一般尽量避免使用。

### 查看选择的端口是否已经被占用

```linux
netstat -anp |grep 2211  # 2211 为你选中的端口号
```

没弹出信息则表示没有占用
也可以使用

```linux
netstat -nultp
```

查看所有被占用的端口

### 修改ssh默认端口设置

```linux
sudo vim /etc/ssh/sshd_config
```

找到

``` bash
#Port 22
```

修改为

``` bash
Port 22222
```

### 重启sshd服务，关闭防火墙

```linux
service sshd restart
```

如果没有进行防火墙设置，现在就可以使用新端口ssh了。

### 修改xrdp远程桌面

暂时出了点问题，下面方法不能用

```linux
sudo vim /etc/xrdp/xrdp.ini
```

将globals下面的port=3389改为port=4489
重启xrdp

``` bash
sudo /etc/init.d/xrdp restart
```

需要的时候要更改防火墙设置，开放4489端口。

需要重启电脑。。。

``` bash
sudo reboot
```

## debian_安装与配置

### 制作光盘，安装系统

1. 到[官网](https://www.debian.org)下载最新镜像，选择完整版，一般只需要下载CD1.
2. 使用UltroISO打开镜像，选择启动-写入镜像，写入方式选择Raw，写入到一个空白U盘
3. 需要装机的电脑插上制作好的启动盘，选择boot顺序为USB优先。
4. 按照要求安装好即可，安装过程中选择ssh，KDE,gnome等工具

### 配置新装机的电脑

#### 修改debian9的源

1. alt+space，打开Terminal（Konsole）
2. 使用管理员权限修改配置文件。

```bash
su #输入密码
vi /etc/apt/sources.list
# 强前几行中的 cdrom 用#注释掉（在行开头加#）
# 添加下列内容，添加163国内镜像源

deb http://mirrors.163.com/debian/ stretch main non-free contrib

deb http://mirrors.163.com/debian/ stretch-updates main non-free contrib

deb http://mirrors.163.com/debian/ stretch-backports main non-free contrib

deb-src http://mirrors.163.com/debian/ stretch main non-free contrib

deb-src http://mirrors.163.com/debian/ stretch-updates main non-free contrib

deb-src http://mirrors.163.com/debian/ stretch-backports main non-free contrib

deb http://mirrors.163.com/debian-security/ stretch/updates main non-free contrib

deb-src http://mirrors.163.com/debian-security/ stretch/updates main non-free contrib

:wq # 保存退出
apt update # 更新
```

#### debian11（bullseye）的源

为了防止验证出错，需要先安装apt install ca-certificates

```bash
su #输入密码
vi /etc/apt/sources.list
# 强前几行中的 cdrom 用#注释掉（在行开头加#）
# 添加下列内容，添加163国内镜像源

deb [trusted=yes] https://mirrors.aliyun.com/debian/ bullseye main non-free contrib
deb-src [trusted=yes] https://mirrors.aliyun.com/debian/ bullseye main non-free contrib
deb [trusted=yes] https://mirrors.aliyun.com/debian-security/ bullseye-security main
deb-src [trusted=yes] https://mirrors.aliyun.com/debian-security/ bullseye-security main
deb [trusted=yes] https://mirrors.aliyun.com/debian/ bullseye-updates main non-free contrib
deb-src [trusted=yes] https://mirrors.aliyun.com/debian/ bullseye-updates main non-free contrib
deb [trusted=yes] https://mirrors.aliyun.com/debian/ bullseye-backports main non-free contrib
deb-src [trusted=yes] https://mirrors.aliyun.com/debian/ bullseye-backports main non-free contrib

:wq # 保存退出
apt update # 更新
```

### 修改用户权限

有些时候，debian默认不开启su账户，需要自行设置

首先 sudo su - root

然后passwd设置root密码

再运行su就可以用设置的密码进入了。

```bash
chmod +w /etc/sudoers # 修改文件属性为可写
vim /etc/sudoers
```

添加内容，找到root ALL=(ALL:ALL) ALL在其后添加

``` bash
user ALL=(ALL:ALL) ALL
```

这样用户user就可以使用sudo命令了，然后将文件改为只读

``` bash
chmod -w /etc/sudoers
```

### 远程桌面

参考这个[网页](https://www.hiroom2.com/2016/05/21/install-xrdp/)，
安装xrdp,xfce4,net-tools. net-tools是用来使用ifconfig查看ip的，
但是也可以直接使用"ip a"来查看。

```bash
sudo apt install -y net-tools xrdp xfce4 tigervnc-standalone-server
echo xfce4-session>~/.xsession
```

如果安装了其他桌面环境，可以更换"xfce4-session"为

```bash
"startkde"  #使用KDE
"cinnamon-session"  #使用cinnamon
"mate-session"  #使用mate
"gnome-session"  #gnome
```

使用xorg无法登陆，必须要使用xvnc，不知道为啥。。。  
可以更改 /etc/xrdp/xrdp.ini中的配置顺序，
将xvnc段落移到xorg之前然后运行

```bash
sudo systemctl restart xrdp
 # 可以使用远程桌面了
```

### 固定ip

进入xfce桌面系统，左上角Application，
setting->Network Connections。
进行相关设置。
然后重启电脑，本地ip就变成了192.168.1.10

``` bash
    address 192.168.1.10
    netmask 255.255.255.0
    gateway 192.168.1.1
    DNS 114.114.114.114,223.5.5.5,223.6.6.6,8.8.8.8
```

### 解压可运行文件

将执行文件连接到/usr/bin中

``` bash
sudo ln -s /home/pevoro/Program_files/blender-3.0.0-linux-x64/blender /usr/bin/blender
```

## 查看系统版本

命令行输入

``` bash
lsb_release -a
```

## 将linux系统安装进U盘

由于不同的硬件需要的驱动不同，所以换了硬件的话，可能无法正常启动。

1. 使用 vmware workstation player 创建新的虚拟机，选择稍后安装操作系统。

2. 设置启动时调用系统盘ISO映像文件

3. USB控制器里显示所有USB设备，兼容性选择USB3.1

4. 启动虚拟机

5. 挂载usb

6. 安装ubuntu时选择USB整个盘挂载到"/"根目录

## Linux 磁盘操作

### U盘的挂载

#### 需要管理员权限

过程中需要使用超级管理权限，所以不要通过远程桌面操作，
直接使用命令行，如windows下的Terminal/Putty/Powershell。

#### 查看U盘编号

USB接口的U盘对于linux系统而言是当作SCSI设备对待的。首先切换到root权限用户下。插入U盘前先用“sudo fdisk -l”命令查看系统的磁盘列表。

插入U盘后，再次使用“fdisk -l”命令，发现磁盘列表中多了一个硬盘/dev/sdb，容量大小2G，和插入的U盘容量大小一致。同时系统多了一个/dev/sdb1的磁盘分区。这个磁盘分区就是要挂载的U盘。

#### 新建一个目录作为U盘的挂接点

比如说要把U盘挂载到 /mnt/usb，那么需要采用下列命令新建 /mnt/usb。

```terminal
mkdir /mnt/usb
```

然后就可以采用mount命令把U盘挂载在/mnt/usb。

```terminal
mount /dev/sdb1 /mnt/usb
```

输入命令 cd /mnt/usb进入目录/mnt/usb，然后输入 ls命令就可以查看U盘里的内容了。U盘使用完毕后，为了避免损坏U盘或者丢失数据，可以采用 umount命令解挂U盘，类似于windows下的弹出U盘操作。

```terminal
umount /mnt/usb
```

### fstab 挂载硬盘

#### 查看uuid

``` bash
lsblk -f # 使用命令显示所有设备的UUID值
sudo fdisk -l  # 查看硬盘信息
```

如果能找到类似/dev/sdb 但是没有/dev/sdb1这样的，就没有uuid，需要先创建分区。

查看uuid信息，找到/dev/sdb1对应的uuid号码，例如5E1668121667EA0B，并找到对应的盘类型，如ntfs

#### 创建分区

fdisk工具只能创建2T以内大小的分区，创建更大分区需要使用parted工具。

``` bash
sudo parted  # 进入parted环境
print devices  # 列出所有的硬盘
select /dev/sdb  # 选中要分区的盘
mklabel gpt  # 创建gpt分区表
mkpart primary # 创建主分区
File system type?  [ext2]? ext4
Start? 10 # 表示从10MB位置开始
End? -10  # 表示到最后10MB截止
print  # 查看分区结果
quit  # 退出
```

#### 生成uuid

分区之后的硬盘可能还是没有uuid的，这里需要生成被写给分区

``` bash
uuidgen  # 生成uuid，复制一下
sudo tune2fs -U 2a11c07a-7c0f-4162-9ec8-b9b5e9476bb2 /dev/sdb1
sudo tune2fs -U 5dbd982e-7b1d-4764-9dcc-7c2239ac7be3 /dev/sdc1
```

#### 开机自动挂载

打开/etc/fstab文件，添加行

```sh
#  <file system>    <dir>   <type>  <options>   <dump>  <pass>
UUID=0A384D11384CFD67   /data   ntfs    defaults    0   0
```

### 恢复NTFS磁盘中误删除的文件

1. `df -h` 查看磁盘挂载位置，得到类似如下结果

```bash
Filesystem      Size  Used Avail Use% Mounted on
/dev/sdc1       1.8T  116G  1.6T   7% /mnt/linux_backup
/dev/sdb2       3.7T  468G  3.2T  13% /mnt/Data_backup
/dev/sda2       3.7T  497G  3.2T  14% /mnt/Data
```

1. `umount /mnt/Data`  # 解除某个磁盘的挂载

1. `cd tmp` 进入一个文件夹用来存储需要恢复的文件

1. `sudo ntfsundelete /dev/sda2` 查找对应盘符中已删除的文件

   `sudo ntfsundelete /dev/sda2 -m *关键字*` 查看带有特定关键字的文件

   `sudo ntfsundelete /dev/sda2 -m *关键字*.jpg` 查看带有特定关键字和后缀的文件

1. `sudo ntfsundelete /dev/sda1 –u –m *.jpg` 找回说有能恢复的jpg文件

### 恢复EXT硬盘中误删除的文件

``` bash
sudo apt install extundelete
extundelete --help
```

## 管理多种桌面环境

Debian可以使用tasksel来管理多种桌面环境

```terminal

tasksel

```

## 使用ssh密匙链接服务器

1. 进入自己的用户目录下的.ssh文件夹`cd ~/.ssh`
2. 生成rsa4096密钥对`ssh-keygen -t rsa -b 4096`，也可以生成保密等级更高的ed25519`ssh-keygen -t ed25519`
3. 以ed25519为例，默认会生成两个文件私钥`id_25519`和公钥`id_25519.pub`
4. 将公钥写入授权文件`cat id_25519.pub >> authorized_keys`，如果授权文件没有创建，可以使用touch进行创建`touch authorized_keys
5. 使用 Mobaxterm、Filezilla 等工具将私钥文件`id_25519`下载到本地机器上。
6. 在mobaxterm的session-SSH中就可以设定`Use private key`为该私钥了
7. 以后再使用mobaxterm登录服务器，就不需要密码了。
