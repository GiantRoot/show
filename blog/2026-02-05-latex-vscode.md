---
slug: latex_in_vscode
title: 使用latex和vscode写论文
authors: [pevoro]
date: 2026-02-05
tags: [开源软件, 论文写作]
---

之前，写代码对于普通人来说是难事，但是现在人工智能加持之下，代码变得越来越容易应对。

以前，很多人希望word的所见即所得，格式问题总是反反复复，经常崩溃的交叉引用，格式刷、样式库都无法完美解决问题，我痛恨Word，是打开Word就心烦的那种痛恨。

latex很臃肿，但是安装完成之后，后续的事情就变得单纯，你只需要专注写作内容，再也不用担心格式问题了。

overleaf很好，但是网络的稳定性让我不愿意使用，当然这不怪overleaf，但我也不知道能怪谁。不管怎么样，我选择使用vscode+latex+git来完成我的工作。

<!--truncate-->

## 安装TexLive

首先，你需要安装TexLive，国内有很多安装源，选一个下载速度快的，下载完整的ISO文件大概6GB，很大有点慢，但是相信我，不要使用在线安装，直接下载ISO文件是最稳妥的安装方式。
安装TexLive最好，即使你使用的是windows，也不建议使用MikTex，至少MikTex让我我遇到了不少我解决不了的问题。

``` bash
https://mirrors.tuna.tsinghua.edu.cn/CTAN/systems/texlive/Images/ # 清华
https://mirrors.cqu.edu.cn/CTAN/systems/texlive/Images/ # 重庆大学
https://mirrors.aliyun.com/CTAN/systems/texlive/Images/ # 阿里云
# 还有很多其他的mirrors，自己去搜也行
```

从上面选一个下载速度快的下载就行。挂载ISO文件，运行`install-tl-windows.bat`（windows用户），然后按照提示安装即可，安装时间可能持续半个小时以上，但这仍然是最快的安装方式。

## 安装vscode

并安装LaTeX Workshop插件

## 编写vscode setting文件

创建文件夹`.vscode`，创建文件`setting.json`，写入下面内容：

``` json
{
  // Latex Workshop
  "latex-workshop.latex.outDir": "Tmp",
  "latex-workshop.latex.recipe.default": "pdflatex",
  "latex-workshop.latex.recipes": [
    {
      "name": "pdflatex",
      "tools": ["pdflatex"]
    },
    {
      "name": "pdflatex -> bibtex -> pdflatex*2",
      "tools": [
        "pdflatex",
        "bibtex",
        "pdflatex",
        "pdflatex"]
    },
    {
        "name": "xelatex ➞ bibtex ➞ xelatex x 2",
        "tools": [
        "xelatex",
        "bibtex",
        "xelatex",
        "xelatex"
        ]
    },
    {
        "name": "xelatex",
        "tools": [
        "xelatex"
        ]
    },
  ],
  "latex-workshop.latex.tools": [
    {
      "name": "pdflatex",
      "command": "pdflatex",
      "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "-output-directory=Tmp",
        "%DOC%"
      ]
    },
    {
        "name": "xelatex",
        "command": "xelatex",
        "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "-output-directory=./Tmp", // 中间文件保存在./Tmp文件夹下
        "%DOC%"
        ],
        "env": {}
    },
    {
      "name": "bibtex",
      "command": "bibtex",
      "args": ["Tmp/%DOCFILE%"]
    }
  ],
  "latex-workshop.latex.autoBuild.run": "onSave"
}
```

## latex 数学代码

可以查阅下面的pdf文件，现在的在线编写工具也有很多，不需要自己死记硬背。

[Wikipedia-latex数学公式](./attachments/Wikipedia-latex-formula.pdf)

[在线编辑表格](https://www.latexlive.com/##)

## 撰写tex文件

创建main.tex文件，或者直接从网上下载模板，很多学校都有硕士博士论文的latex模板，下载之后就能按照别人的模板生成精美的论文排版了。