<template>
  <el-container id="docs" direction="vertical">
    <paas-header @menu-click="handleClickOnPassHeader" defaultActive="docs"></paas-header>
    <el-container class="inner-container">
      <el-aside width="180px">
        <el-tree refs="menu-list"
            :data="data"
            :props="defaultProps"
                 default-expand-all
            @node-click="handleNodeClick">
        </el-tree>
      </el-aside>
      <el-main>
        <div v-html="content">
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
  export default {
    components: {paasHeader},
    created() {

    },
    mounted() {

    },
    data() {
      return {
        data: [{
          label: '一级 1',
          children: [{
            label: '二级 1-1',
          }, {
            label: '二级 1-2'
          }]
        }, {
          label: '一级 2',
          children: [{
            label: '二级 2-1',
          }, {
            label: '二级 2-2',
            href: 'dfs'
          }]
        }, {
          label: '一级 3',
          children: [{
            label: '二级 3-1',
          }, {
            label: '二级 3-2',
          }]
        }],
        content: {},
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      };
    },
    methods: {
      handleNodeClick(data) {
        console.log(data);
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