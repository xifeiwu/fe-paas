<template>
  <div id="docs">
    <paas-header @menu-click="handleClickOnPassHeader" defaultActive="docs"></paas-header>
    <div class="help-content">
      <div class="menu-list">
        <el-scrollbar>
          <el-tree ref="menu-list"
              :data="menuList"
              :props="defaultProps"
               nodeKey='target'
               :setCurrentNodeOnClick="false"
               :expandOnClickNode="false"
              @node-click="handleNodeClick">
          </el-tree>
        </el-scrollbar>
      </div>
      <div class="content">
        <el-scrollbar>
          <div v-html="helpContent.body" class="markdown">
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  #docs {
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
  #docs {
    height: 100%;
    /*padding-top: 60px;*/
    .pass-header {
      /*position: fixed;*/
      width: 100%;
      /*top: 0px;*/
      box-shadow: 0 0 2px 0 rgba(64,158,255, .6);
      z-index: 100;
    }
    .help-content {
      padding: 0px;
      height: calc(100% - 60px);
      box-sizing: border-box;
      .menu-list {
        width: 300px;
        float: left;
        height: 100%;
        border-right: 1px solid gray;
        .el-scrollbar {
          height: 100%;
          width: 100%;
        }
      }
      .content {
        margin-left: 300px;
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
  import paasHeader from '../components/header';

  export default {
    components: {paasHeader},
    created() {
      this.$net.getHelp().then(content => {
        this.menuList = content.menuList;
        this.helpContent = content.helpContent;
        this.$nextTick(() => {
          this.updateScrollTopByHash();
          this.listenScrollWrapper();
        });
      })
    },
    mounted() {
      this.scrollWrapper = this.$el.querySelector('.content .el-scrollbar .el-scrollbar__wrap');
    },
    data() {
      return {
        scrollWrapper: null,
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
        helpContent: '',
        defaultProps: {
          children: 'children',
          label: 'label',
          isLeaf: 'isLeaf',
        }
      };
    },
    methods: {
      updateScrollTopByHash() {
        let hash = location.hash;
        if (!hash) {
          return;
        }
        let target = this.$el.querySelector(decodeURI(hash));
        if (target) {
          this.scrollWrapper.scrollTop = target.offsetTop;
        }
      },
      listenScrollWrapper() {
        this.scrollWrapper && this.scrollWrapper.addEventListener('scroll', (evt) => {
          let scrollTop = evt.target.scrollTop;
        })
      },
      handleNodeClick(data) {
        if (data.hasOwnProperty('target')) {
          let target = data['target'];
          window.location.hash = target;
          this.$refs['menu-list'].setCurrentKey(target);
        }
      },

      handleClickOnPassHeader(keyPath) {
        switch (keyPath) {
          case 'profile':
          case 'product/app':
          case 'login':
            this.$utils.goToPath('/profile');
//            this.$router.push({
//              path: '/profile/app',
//              query: {
//              }
//            });
            break;
          case 'docs':
            this.$utils.goToPath('/docs');
            break;
          case 'index':
            this.$utils.goToPath('/index');
            break;
        }
      },
    }
  };
</script>