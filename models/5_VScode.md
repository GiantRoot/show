# vscode

## 安装latex-workshop

latex workshop 帮助使用者在vscode中编写和编译latex文件，
使用之前，需要在自己的电脑中先安装latex编译软件，比如Miktex

vs code 左下角点击齿轮->选中setting，
搜索latex-workshop.latex.tool

选择最下方的edit in setting.json，
将代码复制到setting.json文件中

```json
{
// Latex Workshop
"latex-workshop.latex.outDir": "./Tmp", // 中间文件保存在./Tmp文件夹下
"latex-workshop.synctex.afterBuild.enabled": true,
"latex-workshop.latex.recipes": [
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
"args": [
"./Tmp/%DOCFILE%",  // 中间文件保存在./Tmp文件夹下
],
"env": {}
},
],
"latex-workshop.view.pdf.viewer": "tab",

// 一般设置
"window.zoomLevel": 1,
"git.confirmSync": false,
}

```

## latex 数学代码

[Wikipedia-latex数学公式](./attachments/Wikipedia-latex-formula.pdf)

