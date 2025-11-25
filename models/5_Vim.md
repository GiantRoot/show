# vim 101

### cheat sheet for vim

![vim cheat sheet](./attachments/vi-vim-cheat-sheet.svg)

### vim无法右键鼠标粘贴解决方法
```bash
sudo vim /usr/share/vim/vim80/defaults.vim
```
将 set mouse=a 改为：set mouse-=a
