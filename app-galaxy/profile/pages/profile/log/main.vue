<template>
  <div id="log">
    <el-tabs v-model="currentPath" type="card" @tab-click="handleClick">
      <el-tab-pane v-for="item in tabs" :label="item.label" :name="item.name" :key="item.name"></el-tab-pane>
    </el-tabs>
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
  </div>
</template>
<style lang="scss" scoped>
</style>

<style lang="scss">
  #log {
    padding: 0px;
    height: 100%;
    .el-tabs {
      /*margin-left: 5px;*/
      .el-tabs__nav {
        border-radius: 0px;
        border-top: 0px;
        border-left: 0px;
      }
      .el-tabs__header {
        margin: 0px;
        .el-tabs__item {
          line-height: 30px;
          height: 30px;
          /*&:nth-child(2) {*/
            /*padding-left: 20px;*/
          /*}*/
        }
      }
    }
  }
</style>
<script>
  export default {
    created() {
    },
    data() {
      return {
        tabs: [{
          label: '运行日志',
          name: '/log/run',
        },{
          label: '部署日志',
          name: '/log/deploy',
        }]
      };
    },
    computed: {
      currentPath: {
        get() {
          return this.$route.path;
        },
        set(path) {
          this.$router.push(path);
        }
      }
    },

    methods: {
      handleClick(tab, event) {
//        console.log(tab.name);
//        console.log(event);
      }
    }
  };
</script>
