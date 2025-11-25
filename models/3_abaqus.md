# Abaqus

## abaqus documentation 安装

1. 选择html和pdf
2. 选择abaqus web server
3. 安装完成之后重启电脑
4. 在开始菜单中查找documentation

## 书籍推荐

其实看看b站视频也挺好

## 命令行运行abaqus

```bash
abaqus job=xxx datcheck  # 运算Job之前检查
abaqus job=jobname1 或 abaqus job=jobname1 int  # 提交Job
# int 代表在命令行窗口显示交互信息
abaqus job=jobname1 double int  # 双精度提交
abaqus suspend job=jobname1 int  # 任务暂停
abaqus resume job=jobname1 int  # 恢复运算
abaqus terminate job=jobname1 int  # 结束任务
abaqus job=jobname1 oldjob=jobname2 int  # Restart 重启动计算
abaqus cae  # cae界面
abaqus viewer  # viewer界面
abaqus doc  # 帮助文档
abaqus help  # 命令行帮助
abaqus job=xxx memory=memory-size  # 定义所需的最大内存
abaqus job=jobname user=user.for  # 子程序
abaqus job=jobname cpus=4  # 四核并行
```

## 在vscode/pycharm中写python脚本不报错

基于https://github.com/liangzulin/abaqus_pycharm的方法。

先下载这个库中的import_file中的所有文件。
找到自己用的python的Lib文件夹，
例如`C:\Users\pevoro\anaconda3\Lib\site-packages`或者
`C:\Users\pevoro\anaconda3\envs\py38\Lib\site-packages`这种类型的文件夹。
将import_file文件夹中的所有文件都复制到上面的文件夹中。

再在vscode中使用你的python环境打开abaqus的python脚本，就不会频繁报错了。

## scratch directory

abaqus Unable to change the current working directory to C:\Users\xxx\AppData\Local\Temp\

临时修改 Module: Job->job manager-> edit job-> general ->scratch directory

永久修改 修改系统环境变量，将用户变量的TEMP改为C:\TEMP

## 搭建Debian-abaqus-fortran计算环境

使用了debian9.9和abaqus6.14-2，版本比较老，仅作为参考。

### 素材

1. U盘一个

1. debian-9.9.0-amd64-DVD-1.iso
debian-9.9.0-amd64-DVD-2.iso
debian-9.9.0-amd64-DVD-3.iso

1. abaqus6.14-2安装包及.env文件

1. openmpi-1.8.4.tar.gz

### 备工作

1. 使用管理员运行ultraiso，打开debian-9.9.0-amd64-DVD-1.iso，点击启动，选择写入硬盘映像，写入方式选择raw，点击写入，等待完成。

### 安装Debian注意事项

1. 为计算机命名时只使用字母和数字，如D20,username:junfan

1. 安装时domian name空着不填

1. 安装的时候可以选择拔掉网线，不选择network mirror, 不选择release update

1. 选择安装Debian desktop environment, Xfce, ssh server, web server

1. 完成安装，重启电脑

### 设置下载源为本地DVD镜像

1. 将DVD-1, DVD-2, DVD-3 三个iso文件复制到新安装的Debian系统中

1. su 进入管理员模式，输入密码

1. 创建文件夹用来挂载iso文件，并挂载

    ```terminal
    mkdir -p /media/dvd1
    mkdir -p /media/dvd2
    mkdir -p /media/dvd3
    mount -o loop debian-9.9.0-amd64-DVD-1.iso /media/dvd1/
    mount -o loop debian-9.9.0-amd64-DVD-2.iso /media/dvd2/
    mount -o loop debian-9.9.0-amd64-DVD-3.iso /media/dvd3/
    ```

1. 修改 /etc/apt/sources.list 文件，添加dvd库，

    先备份源文件 cp /etc/apt/sources.list /etc/apt/sources.list.bak
    然后修改 /etc/apt/sources.list 为如下三行

    ```nano
    deb [trusted=yes] file:///media/dvd1/  stretch contrib main
    deb [trusted=yes] file:///media/dvd2/  stretch contrib main
    deb [trusted=yes] file:///media/dvd3/  stretch contrib main
    ```

### 安装依赖库libjpeg62和libstdc++5和远程ssh，vim等相关依赖库

```terminal
apt-get update
apt-get install libjpeg62 libstdc++5 ssh openssh-server vim csh gfortran gedit g++ make
```

### 安装Abaqus

1. 新建文件夹    mkdir /usr/simulia

1. 将abaqus的证书文件夹移动到新建的文件夹中    cp -a license /usr/simulia/

1. 修改/usr/simulia/license/ABAQUS.lic文件第一行的HOME为你的电脑名称，如D20

1. mkdir -p /usr/tmp/.flexlm/

1. Start abaqus License Server

    ```terminal
    /usr/simulia/license/lmgrd -c /usr/simulia/license/ABAQUS.lic
    ```

1. mount the .iso file of Abaqus

    create mount point and mount.

    ``` terminal
    mkdir /mnt/dvd
    mkdir /home/junfan/tempaba
    mount -o loop SIMULIA_ABAQUS_6.14-2_Win64_Linux64.iso /mnt/dvd
    ```

    ```terminal
    csh
    /mnt/dvd/setup
    ```

    临时文件夹选择/home/junfan/tempaba

1. Install abaqus to /usr/simulia/abaqus

    In type of installation select "ABAQUS Products"

    When asked for License server input for License server 1 (REQUIRED)填写
    27011@D20
    点击下一步，如果出现“There was a problem constructing the value for the ....license file”，则同样输入27011@D20
    安装位置选择/usr/simulia/abaqus/

1. 试用abaqus。GUI still have some problem.
/usr/simulia/abaqus/Commands/abaqus cae

1. umount iso file

    ```terminal
    umount /mnt/dvd
    ```

1. edit ~/.bashrc file

    ```terminal
    vim /home/junfan/.bashrc
    ```

    add new lines at the end of this file

    ```vim
    alias abaqus='XLIB_SKIP_ARGB_VISUALS=1 /usr/simulia/abaqus/Commands/abaqus'
    alias abaqusl="/usr/simulia/license/lmgrd -c /usr/simulia/license/ABAQUS.lic"
    alias cae="abaqus cae -mesa"
    ```

    这样运行abaqus就是打开abaqus，运行abaqusl就是打开证书，cae打开GUI交互界面

### 修改abaqus环境设置文件，使用gfortran作为编译器

1. 修改abaqus_v6.env文件

    ```terminal
    cp /usr/simulia/abaqus/6.14-2/SMA/site/abaqus_v6.env /usr/simulia/abaqus/6.14-2/SMA/site/~abaqus_v6.env
    ```

    更改abaqus_v6.env 中的```fortCmd = "ifort"   # <-- Fortran compiler```为```fortCmd = "gfortran"   # <-- Fortran compiler```
    更改

    ```nano
    compile_fortran = [fortCmd,
                   '-V',
                   '-c', '-fPIC', '-auto', '-mP2OPT_hpo_vec_divbyzero=F', '-extend_source',
                   '-fpp', '-WB', '-I%I']
    ```

    为```compile_fortran = (fortCmd + ' -c -fPIC -I%I')```
    更改

    ```nano
    link_sl = [fortCmd,
        '-V',
        '-cxxlib', '-fPIC', '-threads', '-shared',
        '%E', '-Wl,-soname,%U', '-o', '%U', '%F', '%A', '%L', '%B', '-parallel',
        '-Wl,-Bdynamic', '-i-dynamic', '-lifport', '-lifcoremt', '-lmpi']
    ```

    为：

    ```nano
    link_sl = (fortCmd + " -gcc-version=%i -fPIC -shared " + "%E -Wl,-soname,%U -o %U %F %A %L %B -Wl,-Bdynamic " + " -lifport -lifcoremt")
    ```

1. vim /usr/simulia/abaqus/6.14-2/SMA/site/abaqus.app
找到"perl"这一行，删掉"SMAExternal/perl"
保存

1. 测试abaqus verify -user_std

### 安装openmpi

(这一步或许是不必要的，但是我还是建议这么做。
网上有说更改 abaqus_v6.env中的"mp_mode=THREADS"就可以不使用mpi，但是我没测试过)
在需要进行显式计算explict的时候，修改abaqus_v6.env中为mp_mode=THREADS，可以避免未知错误。

1. 使用openmpi-1.8.4.tar.gz

1. 解压并配置

    ```terminal
    tar -zxvf openmpi-1.8.4.tar.gz
    cd openmpi-1.8.4
    ./configure --prefix="/usr/local/openmpi"
    ```

1. Build并安装
    make -j8
    make install
    可以在make后加参数-j8, 表示用8核编译

1. . 添加环境变量

    在/home/junfan/.bashrc文件中添加下列几行

    ```vim
    export PATH="$PATH:/usr/local/openmpi/bin"
    export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/usr/local/openmpi/lib/"
    ```

    保存后，执行

    ldconfig
    打开新的终端，使环境变量生效。

1. 测试是否安装成功

    mpirun
