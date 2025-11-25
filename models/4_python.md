---
title: Python
slug: /python_intro
sidebar_position: 4
---

# Python 介绍

Python已经成为我们工程技术人员最广泛使用的编程语言，
掌握这门语言对于我们处理数据、计算模拟、机器学习等领域均有非常大的作用。

## 学习资料

[廖雪峰老师的网站](https://www.liaoxuefeng.com/wiki/1016959663602400)是一个非常适合python入门的网站，其中“网络编程”，“访问数据库”，“电子邮件”，“异步IO”，"使用MicroPython"这些部分和我们没什么关系，不用看。

[“Dive Into Python 3”](https://diveintopython3.net/)是一个非常不错的网站，英文的，涉及的内容更丰富，也可作为入门参考。

## conda 创建并使用环境

```bash
conda create -n venv311 python=3.11  # 创建一个名为venv311的环境，使用python3.11作为基础
conda activate venv311  # 运行venv311环境
pip install numpy  # 在环境中安装numpy库
pip freeze > requirements.txt  # 将当前环境中的库列表输出到requirements.txt文件夹
pip install -r requirements.txt  # 安装列表中的库
```

## 修改pip镜像源

### 现状

pip默认的镜像地址是：`https://pypi.org/simple` 连接速度较慢

网上有很多可用的源，例如：

**清华大学**：`https://pypi.tuna.tsinghua.edu.cn/simple`

**阿里云**：`http://mirrors.aliyun.com/pypi/simple/`

**豆瓣**`http://pypi.douban.com/simple/`

### 临时使用镜像地址

在使用pip的时候加参数`-i https://pypi.tuna.#tsinghua.edu.cn/simple`
 例如：

```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple vtk
```

这样就可以从清华的镜像下载安装vtk。

### 永久修改pip镜像(推荐)

#### Linux系统

修改 ~/.pip/pip.conf (没有就创建一个.pip文件夹及pip.conf 文件。“.”表示是隐藏文件夹)

#### win系统

直接在user目录中创建一个pip目录，如：C:\Users\xx\pip（xx为你的用户名），并新建文件pip.ini文件。

pip文件内容如下：

```sh
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
[install]
trusted-host = https://pypi.tuna.tsinghua.edu.cn
```

## 变量命名规则

- **项目名**
    > 首字母大写，其余小写单词，尽量使用一个单词（自己造个词也行）
    > 若多个单词组合可以添加`_`下划线增加可读
    > Ui_test

- **包名、模块名**
    > 全部小写字母
    > package、 module

- **类名**
    > 首字母大写，其它字母小写，若多个单词时，才用驼峰，eg：UserLogin
    > class Login :

- **方法名**
    > 小写单词，多个单词时，用下划线分隔单词以增加可读性。
    > def user_login():

- **参数名**
    > 小写单词
    > def user_login(self):
    > 如果函数的参数名与保留关键字冲突，在参数名后加一个下划线，比用缩写、错误 的拼写要好。因此 `_print` 比 `prnt` 好。

- **普通变量名**
    > 小写字母，单词之间用`_`分割 或者 遵守驼峰原则命名
    > month_pay = 2000
    > monthPay = 2000

- 注意
  
   1. 不论是类成员变量还是全局变量，均不使用 m 或 g 前缀。
   2. 私有类成员使用单一下划线前缀标识，多定义公开成员，少定义私有成员。
   3. 变量名不应带有类型信息，因为Python是动态类型语言。如 iValue、names_list、dict_obj 等都是不好的命名
   4. 开头，结尾，一般为python的自有变量，不要以这种方式命名
   5. 以`__`开头（2个下划线），是私有实例变量（外部不能直接访问），依照情况进行命名
   6. 不要使用小写字母'l'(el),大写字母'O'(oh),或者小写'i'作为单独变量名称。因为一些字体中，上诉字母和数字很难区分（比如：O和0，l和1）。

- **常量**
    > 常量定义全部为大写，必要时可用下划线分隔单词以增加可读性。
    > constant

## 首先创建package框架文件

创建一个文件夹用来保存这个package，本文以dir为例，文件夹结构如下，当然module和subdir的数量可以增多或减少（可没有）。subdir的层级也能够任意增加。

```vim
dir
|---__init__.py
|---module1.py
|---module2.py
|---subdir1
|   |---__init__.py
|   |---module1.py
|   |---module2.py
|---subdir2
|   |---__init__.py
|   |---module1.py
|   |---module2.py
```

## 手动调用module和subdir

当__init__.py全部为空白文件时，可以通过下面的方法调用所有的module

```terminal
python
>>>import dir
>>>from dir import module1, module2, subdir1, subdir2
>>>module1
>>>subdir2
```

想要调用subdir下的module如下

```terminal
python
>>>from dir.subdir1 import module1
>>>module1 # 这里也可以使用dir.subdir1.module1
需要注意上面的module是subdir1下的module1
```

## 手动调用module和sub

对于__init__.py的设置非常重要。如果想要在python中使用如下语句（即让package自动调用所有的module）

```terminal
python
>>>import dir
>>>dir.module1
>>>dir.module2
>>>dir.subdir1
```

需要在dir下的__init__.py中设置

```python
__all__ = [
    "module1",
    "module2",
    "subdir1",
    "subdir2",
]

from . import *

```

不过使用这种方式会违法PEP8-E402的设定（import之前有其他运行语句），所有也可以换成下面这种方式

```python
from . import module1, module2, subdir1, subdir2
```

这样会自动调用列表中的module和subdir，不需要单独import，就可以用"dir."的方式来用了

## package内部交叉调用

在module1中调用module2和subdir2.module1则在module开头要试用import

```python
from . import module2
from .subdir2 import module1
moduel2  # dir目录下的文件
moduel1  # subidr2下的文件
```
