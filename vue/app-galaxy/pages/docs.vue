<template>
  <el-container id="index" direction="vertical">
    <paas-header @click="handleClickOnPassHeader"></paas-header>
    <el-main>
      <el-tree
              :data="data"
              :props="defaultProps"
              accordion
              @node-click="handleNodeClick">
      </el-tree>
    </el-main>
  </el-container>
</template>

<script>
  import paasHeader from './components/header';
  export default {
    components: {paasHeader},
    data() {
      return {
        data: [{
          label: '一级 1',
          children: [{
            label: '二级 1-1',
            children: [{
              label: '三级 1-1-1'
            }]
          }]
        }, {
          label: '一级 2',
          children: [{
            label: '二级 2-1',
            children: [{
              label: '三级 2-1-1'
            }]
          }, {
            label: '二级 2-2',
            children: [{
              label: '三级 2-2-1'
            }]
          }]
        }, {
          label: '一级 3',
          children: [{
            label: '二级 3-1',
            children: [{
              label: '三级 3-1-1'
            }]
          }, {
            label: '二级 3-2',
            children: [{
              label: '三级 3-2-1'
            }]
          }]
        }],
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
        }
      }
    }
  };
</script>