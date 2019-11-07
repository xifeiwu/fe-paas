<template>
  <div id="oauth">
    <el-tabs v-model="currentPath" type="card" @tab-click="handleClick">
      <el-tab-pane v-for="item in tabs" :label="item.label" :name="item.fullPath" :key="item.fullPath"></el-tab-pane>
    </el-tabs>
    <router-view v-if="$route.meta.keepAlive"></router-view>
  </div>
</template>
<style lang="scss" scoped>
</style>

<style lang="scss">
  #oauth {
    background: white;
    height: 100%;
    /*margin:0px 6px;*/
    max-width: 1500px;
    height: 100%;
    .el-tabs {
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
        tabs: this.$router.helper.getPermittedSubRouteList(this.$net.page['profile/oauth'])
//        allTabs: [{
//          label: 'Access Key',
//          name: '/oauth/key',
//          permission: 'page_oauth_key'
//        },{
//          label: '授权URL',
//          name: '/oauth/url',
//          permission: 'page_oauth_url'
//        }]
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
