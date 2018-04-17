<template>
  <el-container id="docs" direction="vertical">
    <paas-header @menu-click="handleClickOnPassHeader" defaultActive="docs"></paas-header>
    <el-container class="inner-container">
      <el-aside width="180px">
        <el-tree ref="menu-list"
            :data="menuList"
            :props="defaultProps"
             nodeKey='href'
             :setCurrentNodeOnClick="false"
             :expandOnClickNode="false"
             default-expand-all
            @node-click="handleNodeClick">
        </el-tree>
      </el-aside>
      <el-main>
        <div v-html="docContent.body">
        </div>
      </el-main>
    </el-container>
  </el-container>
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
              .el-tree-node__content {
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
    .el-container.inner-container {
      margin: 20px 40px;
    }
  }
</style>
<script>
  import paasHeader from './components/header';
  import {ORIGIN} from '../net/url';
  import axios from 'axios';

  export default {
    components: {paasHeader},
    created() {
      this.$ajax.get(ORIGIN + this.url.menu).then(response => {
        let responseContent = this.$net.getResponseContent(response);
        this.menuList = responseContent;
      }).catch(err => {

      });
    },
    mounted() {
    },
    data() {
      return {
        url: {
          menu: '/docs/guide/menu.json'
        },
        menuList: [{
          label: '一级 1',
          isLeaf: true,
          children: [{
            label: '二级 1-1',
            href: '222'
          }, {
            label: '二级 1-2'
          }]
        }, {
          label: '一级 2',
          isLeaf: true,
          children: [{
            label: '二级 2-1',
          }, {
            label: '二级 2-2',
            href: 'dfs'
          }]
        }, {
          label: '一级 3',
          isLeaf: true,
          children: [{
            label: '二级 3-1',
          }, {
            label: '二级 3-2',
          }]
        }],
        docContent: '',
        defaultProps: {
          children: 'children',
          label: 'label',
          isLeaf: 'isLeaf',
        }
      };
    },
    methods: {
      handleNodeClick(data) {
        if (data.hasOwnProperty('href')) {
          let href = data['href']
          this.$ajax.get(`${ORIGIN}/docs/${href}`).then(response => {
            let responseContent = this.$net.getResponseContent(response);
//            console.log(responseContent);
            this.docContent = responseContent;
            this.$refs['menu-list'].setCurrentKey(href);
          }).catch(err => {

          });
        }
      },
      handleClickOnPassHeader(keyPath) {
        switch (keyPath) {
          case 'profile':
          case 'user/app':
          case 'login':
            this.$router.push({
              path: '/profile/app',
              query: {
              }
            });
            break;
          case 'docs':
            this.$router.push({
              path: '/docs'
            });
            break;
          case 'index':
            this.$router.push({
              path: '/index'
            });
            break;
        }
      }
    }
  };
</script>