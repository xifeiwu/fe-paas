<template>
  <div id="log">

    <div class="more-logs">
      <span>查询日志需要先进行[</span>
      <a :href="$storeHelper.getByPlatform('log_standardized_how_to')" target="_blank">日志标准化</a>
      <span>]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span>更多运行日志请访问：</span>
      <a :href="$storeHelper.getByPlatform('gray_log_production')" target="_blank">生产环境GrayLog</a>
      <span>，</span>
      <a :href="$storeHelper.getByPlatform('gray_log_un_production')" target="_blank">非生产环境GrayLog</a>
    </div>
    <el-tabs v-model="currentPath" type="card" @tab-click="handleClick">
      <el-tab-pane v-for="item in tabs" :label="item.label" :name="item.fullPath" :key="item.fullPath"></el-tab-pane>
    </el-tabs>
    <!--<keep-alive>-->
      <router-view></router-view>
    <!--</keep-alive>-->
  </div>
</template>
<style lang="scss" scoped>
</style>

<style lang="scss">
  #log {
    position: relative;
    background: white;
    height: 100%;
    /*margin:0px 6px;*/
    max-width: 1500px;
    height: 100%;
    .more-logs {
      position: absolute;
      z-index: 10;
      top: 0px;
      right: 10px;
      font-size: 14px;
      line-height: 30px;
      a {
        color: blue;
      }
    }
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
        tabs: this.$router.helper.getPermittedSubRouteList(this.$net.page['profile/log'])
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
