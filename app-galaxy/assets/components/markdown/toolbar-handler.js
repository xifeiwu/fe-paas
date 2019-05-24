export default class ToolBarHandler {
  constructor(vm) {
    this.vm = vm;
  }

  insertTextAtCaret(obj, {
    prefix,
    subfix,
    str,
    type
  }) {
    let $vm = this.vm;
    obj.focus()
    if (document.selection) {} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
      var startPos = obj.selectionStart;
      var endPos = obj.selectionEnd;
      var tmpStr = obj.value;
      if (startPos === endPos) {
        // 直接插入
        obj.value = tmpStr.substring(0, startPos) + prefix + str + subfix + tmpStr.substring(endPos, tmpStr.length);
        obj.selectionStart = startPos + prefix.length;
        obj.selectionEnd = startPos + (str.length + prefix.length);
      } else {
        // 存在选中区域
        if (tmpStr.substring(startPos - prefix.length, startPos) === prefix && tmpStr.substring(endPos, endPos + subfix.length) === subfix) {
          // 取消
          obj.value = tmpStr.substring(0, startPos - prefix.length) + tmpStr.substring(startPos, endPos) + tmpStr.substring(endPos + subfix.length, tmpStr.length);
          obj.selectionStart = startPos - prefix.length;
          obj.selectionEnd = endPos - prefix.length;
        } else {
          // 确定
          obj.value = tmpStr.substring(0, startPos) + prefix + tmpStr.substring(startPos, endPos) + subfix + tmpStr.substring(endPos, tmpStr.length);
          obj.selectionStart = startPos + prefix.length;
          obj.selectionEnd = startPos + (endPos - startPos + prefix.length);
        }
      }
    } else {
      alert('Error: Browser version is too low')
      // obj.value += str;
    }
    // 触发change事件
    $vm.mdProps.markdown = obj.value
    obj.focus()
  }

  // 工具栏插入内容
  insertText(obj, {
    prefix,
    subfix,
    str,
    type
  }) {
    // if (this.s_preview_switch) {
    this.insertTextAtCaret(obj, {
      prefix,
      subfix,
      str,
      type
    }, this);
  }

  insertTab() {
    let $vm = this.vm;
    let obj = $vm.getTextareaDom();
    if (document.selection) {} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
      var startPos = obj.selectionStart;
      var endPos = obj.selectionEnd;
      var tmpStr = obj.value;
      let lastLine = tmpStr.substring(0, startPos).split('\n').pop()
      if (lastLine.match(/^\s*[0-9]+\.\s+\S*/)) {
        // 有序列表
        let temp = lastLine.replace(/(\d+)/, 1)
        obj.value = tmpStr.substring(0, startPos - temp.length) + '\t' + temp + tmpStr.substring(endPos, tmpStr.length);
      } else if (lastLine.match(/^\s*-\s+\S*/)) {
        // 无序列表
        obj.value = tmpStr.substring(0, startPos - lastLine.length) + '\t' + lastLine + tmpStr.substring(endPos, tmpStr.length);
      } else {
        obj.value = tmpStr.substring(0, startPos) + '\t' + tmpStr.substring(endPos, tmpStr.length);
      }
      obj.selectionStart = obj.selectionEnd = startPos + 1;
    } else {
      alert('Error: Browser version is too low')
      // obj.value += str;
    }
    // 触发change事件
    $vm.mdProps.markdown = obj.value
    obj.focus();
  }

  // shift + tab
  unInsertTab() {
    let $vm = this.vm;
    let obj = $vm.getTextareaDom();
    if (document.selection) {} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
      var startPos = obj.selectionStart;
      var endPos = obj.selectionEnd;
      var tmpStr = obj.value;
      let lastLine = tmpStr.substring(0, startPos).split('\n').pop()
      if (lastLine.search(/\t/) >= 0) {
        // 替换最后一个制表符为空
        obj.value = tmpStr.substring(0, startPos - lastLine.length) + lastLine.replace(/(.*)\t/, '$1') + tmpStr.substring(endPos, tmpStr.length);
        obj.selectionStart = obj.selectionEnd = startPos - 1;
      }
    } else {
      alert('Error: Browser version is too low')
      // obj.value += str;
    }
    // 触发change事件
    $vm.mdProps.markdown = obj.value
    obj.focus();
  }

  insertEnter(event) {
    let $vm = this.vm;
    let obj = $vm.getTextareaDom();
    if (document.selection) {} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
      var startPos = obj.selectionStart;
      var endPos = obj.selectionEnd;
      var tmpStr = obj.value;
      // 获取光标前最后一行字符串
      let lastLine = tmpStr.substring(0, startPos).split('\n').pop()
      let matchListNeedChangeLine = lastLine.match(/^\s*(?:[0-9]+\.|-)\s+\S+/)
      if (matchListNeedChangeLine) {
        // 需要自动产生下一个列表项
        event.preventDefault()
        // eg: [1.  test] 仅获取[1. ]
        let subfix = matchListNeedChangeLine.shift().match(/^\s*(?:[0-9]+\.|-)\s/).shift()
        if (subfix.search(/-/) >= 0) {
          // 无序列表
          obj.value = tmpStr.substring(0, startPos) + '\n' + subfix + tmpStr.substring(endPos, tmpStr.length);
          obj.selectionStart = obj.selectionEnd = startPos + subfix.length + 1
        } else {
          // 有序列表
          let temp = subfix.replace(/(\d+)/, parseInt(subfix) + 1)
          obj.value = tmpStr.substring(0, startPos) + '\n' + temp + tmpStr.substring(endPos, tmpStr.length);
          obj.selectionStart = obj.selectionEnd = startPos + temp.length + 1
        }
      } else {
        let matchListNeedRemoveLine = lastLine.match(/^\s*(?:[0-9]+\.|-)\s+$/)
        if (matchListNeedRemoveLine) {
          // 需要跳出列表
          event.preventDefault()
          let preLength = matchListNeedRemoveLine.shift().length
          obj.value = tmpStr.substring(0, startPos - preLength) + '\n' + tmpStr.substring(endPos, tmpStr.length);
          obj.selectionStart = obj.selectionEnd = startPos - preLength
          // TODO 检测是否存在嵌套列表，自动生成上一级
        }
      }
    } else {
      alert('Error: Browser version is too low')
    }
    $vm.mdProps.markdown = obj.value
    obj.focus();
  }

  toolbar_left_undo() {
    let $vm = this.vm;
    if ($vm.d_history_index > 0) {
      $vm.d_history_index--
    }
    // $vm.$refs.vNoteDivEdit.innerHTML = $vm.s_markdown.render($vm.d_value)
    if ($vm.s_preview_switch) {
      let start = $vm.getTextareaDom().selectionStart
      let currentLength = $vm.mdProps.markdown.length
      $vm.$nextTick(() => {
        // 光标操作
        start -= currentLength - $vm.mdProps.markdown.length
        $vm.getTextareaDom().selectionStart = start
        $vm.getTextareaDom().selectionEnd = start
      })
    }
  }
  // redo
  toolbar_left_redo() {
    let $vm = this.vm;
    if ($vm.d_history_index < $vm.d_history.length - 1) {
      $vm.d_history_index++
    }
    // $vm.$refs.vNoteDivEdit.innerHTML = $vm.s_markdown.render($vm.d_value)
  }
  toolbar_left_trash() {
    let $vm = this.vm;
    $vm.mdProps.markdown = ''
    // $vm.$refs.vNoteDivEdit.innerHTML = $vm.s_markdown.render($vm.d_value)
  }
  toolbar_left_save() {
    let $vm = this.vm;
    // $vm.save($vm.d_value, $vm.d_render)
  }
  // ol
  toolbar_left_ol() {
    let $vm = this.vm;
    let obj = $vm.getTextareaDom();
    if (document.selection) {} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
      var startPos = obj.selectionStart;
      var endPos = obj.selectionEnd;
      var tmpStr = obj.value;
      if (startPos === endPos) {
        // 直接插入
        obj.value = tmpStr.substring(0, startPos) + '1. ' + tmpStr.substring(endPos, tmpStr.length);
        obj.selectionEnd = obj.selectionStart = startPos + 3;
      } else {
        // 存在选中区域
        let start = startPos
        while (start > 0 && tmpStr.substring(start - 1, start) !== '\n') {
          start--
        }
        let selectStr = tmpStr.substring(start, endPos)
        let selectStrs = selectStr.split('\n')
        for (let i = 0; i < selectStrs.length; i++) {
          selectStrs[i] = (i + 1) + '. ' + selectStrs[i]
        }
        let newSelectStr = selectStrs.join('\n')
        obj.value = tmpStr.substring(0, start) + newSelectStr + tmpStr.substring(endPos, tmpStr.length);
        obj.selectionStart = start
        obj.selectionEnd = endPos + newSelectStr.length - selectStr.length;
      }
    } else {
      alert('Error: Browser version is too low')
      // obj.value += str;
    }
    // 触发change事件
    $vm.mdProps.markdown = obj.value
    obj.focus();
  }
  // ul
  toolbar_left_ul() {
    let $vm = this.vm;

    let obj = $vm.getTextareaDom();
    if (document.selection) {} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
      var startPos = obj.selectionStart;
      var endPos = obj.selectionEnd;
      var tmpStr = obj.value;
      if (startPos === endPos) {
        // 直接插入
        obj.value = tmpStr.substring(0, startPos) + '- ' + tmpStr.substring(endPos, tmpStr.length);
        obj.selectionEnd = obj.selectionStart = startPos + 2;
      } else {
        // 存在选中区域
        let start = startPos
        while (start > 0 && tmpStr.substring(start - 1, start) !== '\n') {
          start--
        }
        let selectStr = tmpStr.substring(start, endPos)
        let newSelectStr = selectStr.replace(/\n/g, '\n- ')
        newSelectStr = '- ' + newSelectStr
        obj.value = tmpStr.substring(0, start) + newSelectStr + tmpStr.substring(endPos, tmpStr.length);
        obj.selectionStart = start
        obj.selectionEnd = endPos + newSelectStr.length - selectStr.length;
      }
    } else {
      alert('Error: Browser version is too low')
      // obj.value += str;
    }
    // 触发change事件
    $vm.mdProps.markdown = obj.value
    obj.focus();
  }
  toolbar_left_remove_line() {
    let $vm = this.vm;
    let obj = $vm.getTextareaDom();
    if (document.selection) {} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
      var startPos = obj.selectionStart;
      var endPos = obj.selectionEnd;
      var tmpStr = obj.value;
      // 找到行首、行尾
      let start = startPos
      while (start > 0 && tmpStr.substring(start - 1, start) !== '\n') {
        start--
      }
      let end = endPos
      while (end < tmpStr.length && tmpStr.substring(end, end + 1) !== '\n') {
        end++
      }
      if (end < tmpStr.length) {
        end++
      }
      obj.value = tmpStr.substring(0, start) + tmpStr.substring(end, tmpStr.length);
      obj.selectionEnd = obj.selectionStart = start === 0 ? 0 : start - 1;
    } else {
      alert('Error: Browser version is too low')
      // obj.value += str;
    }
    // 触发change事件
    $vm.mdProps.markdown = obj.value
    obj.focus();
  }

  // 直接添加链接
  toolbar_left_link_add(link) {
    let {type, text, addr} = link;
    let $vm = this.vm;
    let insert_text = {
      prefix: type === 'image-link' ? `![${text}](` : `[${text}](`,
      subfix: ')',
      str: addr
    };
    this.insertText($vm.getTextareaDom(), insert_text);
  }
  handle(type, args) {
    let $vm = this.vm;
    const insertMap = {
      'bold': {
        prefix: '**',
        subfix: '**',
        str: '粗体'
      },
      'italic': {
        prefix: '*',
        subfix: '*',
        str: '斜体'
      },
      'header': {
        prefix: '# ',
        subfix: '',
        str: '标题'
      },
      'header1': {
        prefix: '# ',
        subfix: '',
        str: '一级标题'
      },
      'header2': {
        prefix: '## ',
        subfix: '',
        str: '二级标题'
      },
      'header3': {
        prefix: '### ',
        subfix: '',
        str: '三级标题'
      },
      'header4': {
        prefix: '#### ',
        subfix: '',
        str: '四级标题'
      },
      'header5': {
        prefix: '##### ',
        subfix: '',
        str: '五级标题'
      },
      'header6': {
        prefix: '###### ',
        subfix: '',
        str: '六级标题'
      },
      'underline': {
        prefix: '++',
        subfix: '++',
        str: '下划线'
      },
      'strikethrough': {
        prefix: '~~',
        subfix: '~~',
        str: '中划线'
      },
      'mark': {
        prefix: '==',
        subfix: '==',
        str: '标记'
      },
      'superscript': {
        prefix: '^',
        subfix: '^',
        str: '上角标'
      },
      'subscript': {
        prefix: '~',
        subfix: '~',
        str: '下角标'
      },
      'quote': {
        prefix: '> ',
        subfix: '',
        str: '段落引用'
      },
      'link': {
        prefix: '[](',
        subfix: ')',
        str: '链接'
      },
      'imagelink': {
        prefix: '![](',
        subfix: ')',
        str: '添加图片链接'
      },
      'code': {
        prefix: '```',
        subfix: '\n\n```\n',
        str: 'language'
      },
      'table': {
        prefix: '',
        subfix: '',
        str: '|column1|column2|column3|\n|-|-|-|\n|content1|content2|content3|\n'
      },
      'aligncenter': {
        prefix: '::: hljs-center\n\n',
        subfix: '\n\n:::\n',
        str: '居中'
      },
      'alignright': {
        prefix: '::: hljs-right\n\n',
        subfix: '\n\n:::\n',
        str: '居右'
      },
      'alignleft': {
        prefix: '::: hljs-left\n\n',
        subfix: '\n\n:::\n',
        str: '居左'
      }
    };
    if (insertMap.hasOwnProperty(type)) {
      // 插入对应的内容
      this.insertText($vm.getTextareaDom(), insertMap[type]);
    } else {
      switch (type) {
        case 'undo':
          this.toolbar_left_undo.apply(this, args);
          break;
        case 'redo':
          this.toolbar_left_redo.apply(this, args);
          break;
        case 'trash':
          this.toolbar_left_trash.apply(this, args);
          break;
        case 'save':
          this.toolbar_left_save.apply(this, args);
          break;
        case 'ol':
          this.toolbar_left_ol.apply(this, args);
          break;
        case 'ul':
          this.toolbar_left_ul.apply(this, args);
          break;
        case 'removeLine':
          this.toolbar_left_remove_line.apply(this, args);
          break;
        case 'toolbar_left_link_add':
          this.toolbar_left_link_add.apply(this, args);
          break;
        // for right toolbar click
        case 'help':
          $vm.s_help = !$vm.s_help
          // $toolbar_right_help_click,
          break;
        case 'html':
          // $toolbar_right_html_click,
          $vm.s_html_code = !$vm.s_html_code
          break;
        case 'read':
          // $toolbar_right_read_click,
          let element = $vm.$refs.vReadModel
          // 单栏编辑
          if (element.requestFullscreen) {
            element.requestFullscreen();
          } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
          } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
          } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
          }
          break;
        case 'fullscreen':
          $vm.s_fullScreen = !$vm.s_fullScreen
          if ($vm.fullscreen) {
            $vm.fullscreen($vm.s_fullScreen, $vm.mdProps.markdown)
          }
          break;
      }
    }
  }

}
