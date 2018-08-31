<template>
  <div id="docs-paas">
    <div class="section-main">
      <div class="section-navigation">
        <el-scrollbar>
          <el-tree ref="menu-list"
                   :data="menuList"
                   :props="defaultProps"
                   nodeKey='target'
                   :setCurrentNodeOnClick="false"
                   :expandOnClickNode="false"
                   @node-click="handleNodeClick">
          </el-tree>
          <div class="navigation markdown-body" style="display: none" ref="navigation"></div>
        </el-scrollbar>
      </div>
      <div class="section-content">
        <el-scrollbar>
          <div v-html="netData.html" class="content markdown-body">
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  #docs-paas {
    .el-tree {
      font-weight: bold;
      .el-tree-node__label {
        font-size: 16px;
        line-height: 1.5;
      }
      .el-tree-node {
        .el-tree-node__children {
          .el-tree-node {
            &.is-current {
              & > .el-tree-node__content {
                border-radius: 4px;
                background-color: #409EFF;
                color: white;
              }
            }
            .el-tree-node__content {
              span.is-leaf + span {
                font-weight: normal;
              }
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss">
  #docs-paas {
    height: 100%;
    .section-main {
      padding: 0px;
      height: calc(100% - 60px);
      box-sizing: border-box;
      .section-navigation {
        width: 350px;
        float: left;
        height: 100%;
        border-right: 1px solid gray;
        .el-scrollbar {
          height: 100%;
          width: 100%;
        }
      }
      .section-content {
        margin-left: 350px;
        height: 100%;
        padding-left: 10px;
        padding-right: 5px;
        .el-scrollbar {
          height: 100%;
          width: 100%;
        }
      }
    }
  }
</style>
<script>

  export default {
    created() {
      this.$net.requestAssistServer(this.$net.URL_LIST.md_detail, {
        payload: {title: '云平台帮助文档'}
      }).then(resContent => {
        this.netData.html = resContent['html'];
        this.netData.markdown = resContent['markdown'];
      }).catch();
    },
    mounted() {
      this.contentScrollWrapper = this.$el.querySelector('.section-content .el-scrollbar .el-scrollbar__wrap');
      this.contentNode = this.contentScrollWrapper.querySelector('.content.markdown-body');
    },
    data() {
      return {
        contentScrollWrapper: null,
        menuList: [{
          label: ''
        }],
//        menuList: [{
//          label: '一级 1',
//          isLeaf: true,
//          children: [{
//            label: '二级 1-1',
//            href: '222'
//          }, {
//            label: '二级 1-2'
//          }]
//        }, {
//          label: '一级 2',
//          isLeaf: true,
//          children: [{
//            label: '二级 2-1',
//          }, {
//            label: '二级 2-2',
//            href: 'dfs'
//          }]
//        }],
        netData: {
          markdown: '',
          html: ''
        },
        defaultProps: {
          children: 'children',
          label: 'label',
          isLeaf: 'isLeaf',
        }
      };
    },
    watch: {
      '$route': function (value) {
        console.log(value);
      },
      'netData.html': function (value) {
        if (!this.$refs.hasOwnProperty('navigation')) {
          return;
        }
        const nodeList = [];
//        const navigation = this.$refs['navigation'];
        const  navigationNode = document.createElement('div');
        navigationNode.innerHTML = this.netData.html;
        Array.prototype.slice.call(navigationNode.children).forEach((node, index) => {
//          let reg = /^H[1-8]{1}$/;
          const reg =/^<h([1-8])(?: id="(.*)")*>(.*)<\/h\1>$/;
          const match = reg.exec(node.outerHTML);
          if (!match) {
            node.style.display = 'none'
          } else {
            // get level, target, and text by regexp
            node.index = index;
            if (match.length === 4) {
              node.level = match[1];
              node.target = `#${match[2]}`;
              node.label = match[3].trim();
            } else if (match.length === 3) {
              node.level = match[1];
              node.target = `#${match[2]}`;
              node.label = match[2].trim();
            }
            nodeList.push(node);
//            node.addEventListener('click', (evt) => {
//              let target = evt.target;
//              while (!reg.exec(target.outerHTML)) {
//                target = target.parentNode;
//              }
//              this.contentScrollWrapper.scrollTop = this.contentNode.children[index].offsetTop;
//            });
          }
        });

        let levelStack = [];
        let levelList = [];
        const pushIt = function(list, item) {
          if (!list.hasOwnProperty('children')) {
            list.children = [];
          }
          list.children.push(item);
        };
        nodeList.map(node => {
          return {
            index: node.index,
            level: node.level,
            target: node.target,
            label: node.label
          }
        }).forEach(it => {
//          console.log(it);
//          return;
          let lastItem = null;
          if (levelStack.length === 0) {
            levelStack.push(it);
            levelList.push(it);
          } else {
            lastItem = levelStack[levelStack.length - 1];
            // console.log(lastItem.level, lastItem.word);
            if (lastItem.level < it.level) {
              pushIt(lastItem, it);
              levelStack.push(it);
            } else {
              levelStack.pop();
              // console.log(levelStack);
              if (levelStack.length === 0) {
                levelStack.push(it);
                levelList.push(it);
              } else {
                lastItem = levelStack[levelStack.length - 1];
                // console.log(lastItem);
                // console.log(it);
                while (lastItem && lastItem.level >= it.level && levelStack.length > 0) {
                  levelStack.pop();
                  if (levelStack.length === 0) {
                    lastItem = null;
                  } else {
                    lastItem = levelStack[levelStack.length - 1];
                  }
                }
                if (lastItem) {
                  pushIt(lastItem, it);
                  levelStack.push(it);
                } else {
                  levelStack.push(it);
                  levelList.push(it);
                }
              }
            }
          }
        });
//        console.log(levelStack);
//        console.log(levelList);
        this.menuList = levelList;
      }
    },
    methods: {
      updateScrollTopByHash() {
        let hash = location.hash;
        if (!hash) {
          return;
        }
        let target = this.$el.querySelector(decodeURI(hash));
        if (target) {
          this.contentScrollWrapper.scrollTop = target.offsetTop;
        }
      },
      handleNodeClick(data) {
        if (data.hasOwnProperty('target')) {
          let target = data['target'];
          window.location.hash = target;
          this.updateScrollTopByHash();
          this.$refs['menu-list'].setCurrentKey(target);
        }
      }
    }
  };
</script>