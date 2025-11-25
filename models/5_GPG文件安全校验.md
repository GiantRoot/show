# GPG校验

文件校验，从网上下载的文件，尤其是软件可能面临链接劫持等风险，导致下载的是添加了后面的软件，或者直接就是病毒，因此有些网站对下载的文件提供了安全校验的服务。

## GPG

### 以libreoffice为例

通过镜像下载了四个文件，

``` bash
LibreOffice_7.4.5_Linux_x86-64_deb.tar.gz.asc
LibreOffice_7.4.5_Linux_x86-64_deb.tar.gz
LibreOffice_7.4.5_Win_x64.msi
LibreOffice_7.4.5_Win_x64.msi.asc
```

`tar.gz`是deb的安装包，
`msi`是windows的安装包，
`asc`是文件校验码文件，有些时候也会是`sig`结尾。
为了防止下载的过程中文件被劫持更换，
需要使用gpg校验文件。

校验代码如下：

``` bash
gpg --verify LibreOffice_7.4.5_Linux_x86-64_deb.tar.gz.asc LibreOffice_7.4.5_Linux_x86-64_deb.tar.gz
gpg --verify LibreOffice_7.4.5_Win_x64.msi.asc LibreOffice_7.4.5_Win_x64.msi
```

因为本地之前没有公钥，所以会收到如下提示，
其中有RSA key：

``` bash
gpg: Signature made Tue 24 Jan 2023 10:28:11 PM CST
gpg:                using RSA key C2839ECAD9408FBE9531C3E9F434A1EFAFEEAEA3
gpg: Can't check signature: No public key
```

因此需要获取公钥：

``` bash
gpg --keyserver keyserver.ubuntu.com --recv-keys F434A1EFAFEEAEA3
```

`keyserver.ubuntu.com`是我测试可用的服务器，
`F434A1EFAFEEAEA3`是前面提到的RSA key末尾的几位，位数没有具体限制。

### apt gpg key问题

获取公钥的方法和前面类似，需要另外把公钥导入到apt-key中：

导入公钥

``` bash
gpg -a --export F434A1EFAFEEAEA3 | sudo apt-key add -
```

## 校验 sha256/md5/sha512

将真实的  和文件名拷贝至一个文本文件中，
例如文件命名为xxx.xx，每一行均有一个sha256/md5/sha512码和对应的文件名，
此处为sha256码。

```text
f7cad11d7696a9e5d22574f9bc82afd51a24388910d595c5018798e32d073224 Cryptomator-1.6.17-x64.exe
18eedc6fb1894fe3b7061cdbf7597a49f4a7fdb300cee8b0aaeec24e99eb5a42 cryptomator-1.6.17-x86_64.AppImage
```

然后运行

``` bash
sha512sum -c xxx.xx
# 输出为
Cryptomator-1.6.17-x64.exe: OK
cryptomator-1.6.17-x86_64.AppImage: OK
# OK代表没问题
```

## Windows

使用powershell计算XXX.XX文件的sha256码

``` bash
certutil -hashfile XXX.XX sha256
```
