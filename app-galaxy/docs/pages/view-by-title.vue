<template>
  <div id="docs-paas">
    <div class="section-navigation">
      <el-scrollbar>
        <div class="navigation markdown-body" ref="navigation"></div>
      </el-scrollbar>
    </div>
    <div class="section-content">
      <el-scrollbar>
        <div v-html="netData.html" class="content markdown-body">
        </div>
      </el-scrollbar>
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
    position: relative;
    height: 100%;
    padding-top: 5px;
    box-sizing: border-box;
    .section-navigation {
      width: 320px;
      position: absolute;
      left: 0px;
      top: 10px;
      bottom: 15px;
      z-index: 10;
      margin: 0;
      box-sizing: border-box;
      box-shadow: 0 2px 6px 0 rgba(0,0,0,.04);
      border-radius: 9px;
      background-color: white;
      .el-scrollbar {
        margin-top: 5px;
        height: 100%;
        width: 100%;
      }
      .navigation {
        padding: 8px 0px;
        overflow-y: auto;
        padding: 8px 0px;
        h1, h2, h3, h4, h5, h6 {
          margin: 2px 0;
          font-weight: 500;
          font-size: 17px;
          color: #2185d0;
          cursor: pointer;
          line-height: normal;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0px 12px;
          border-bottom: none;
          &:hover {
            color: #483D8B;
            text-decoration-line: underline;
          }
        }
        h2 {
          padding-left: 27px;
          font-size: 17px
        }
        h3 {
          padding-left: 42px;
          font-size: 17px
        }
        h4 {
          padding-left: 58px;
          font-size: 15px
        }
        h5 {
          padding-left: 72px;
          font-size: 15px;
        }
        h6 {
          padding-left: 87px;
          font-size: 15px;
        }
      }
    }
    .section-content {
      margin-left: 320px;
      height: 100%;
      padding-left: 10px;
      padding-right: 5px;
      .el-scrollbar {
        height: 100%;
        width: 100%;
      }
      .markdown-body {
      }
    }
  }
</style>
<script>

  export default {
    created() {
      if (this.$route.params.hasOwnProperty('title')) {
        this.title = this.$route.params['title'];
      } else {
        this.$router.push('/page-not-found');
        return;
      }

      this.$net.requestAssistServer(this.$net.URL_LIST.md_detail, {
        payload: {title: this.title}
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
        title: null,
        contentScrollWrapper: null,
        menuList: [{
          label: ''
        }],
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
      'netData.html': function (value) {
        if (!this.$refs.hasOwnProperty('navigation')) {
          return;
        }
        const nodeList = [];
        const navigationNode = this.$refs['navigation'];
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
            node.addEventListener('click', (evt) => {
              let target = evt.target;
              while (!reg.exec(target.outerHTML)) {
                target = target.parentNode;
              }
              this.contentScrollWrapper.scrollTop = this.contentNode.children[index].offsetTop;
            });
          }
        });
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