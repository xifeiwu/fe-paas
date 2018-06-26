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
               default-expand-all
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
      .el-tree-node__label {
        font-size: 16px;
        line-height: 1.5;
      }
      .el-tree-node {
        .el-tree-node__children {
          .el-icon-caret-right {
            box-sizing: border-box;
            width: 0px;
          }
          .el-tree-node {
            &.is-current {
              & > .el-tree-node__content {
                border-radius: 4px;
                background-color: #409EFF;
                color: white;
              }
            }
            .el-tree-node__content {
              &:hover {
                /*color: #f5f7fa;*/
                /*color: white;*/
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
        width: 350px;
        float: left;
        height: 100%;
        border-right: 1px solid gray;
        .el-scrollbar {
          height: 100%;
          width: 100%;
        }
      }
      .content {
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
  import paasHeader from '../components/header';
  import {ORIGIN} from './net/url';

  export default {
    components: {paasHeader},
    created() {
      this.$net.getHelp().then(content => {
        this.menuList = content.menuList;
        this.helpContent = content.helpContent;
      })
    },
    mounted() {
    },
    data() {
      return {
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