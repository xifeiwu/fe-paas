<template>
  <div id="work-order">
    <el-tabs v-model="currentPath" type="card" @tab-click="handleClick">
      <el-tab-pane v-for="item in tabs" :label="item.label" :name="item.name" :key="item.name"></el-tab-pane>
    </el-tabs>
    <router-view></router-view>
  </div>
</template>
<style lang="scss" scoped>
</style>

<style lang="scss">
  #work-order {
    background: white;
    height: 100%;
    margin:0px 6px;
    padding: 0px 5px;
    max-width: 1300px;
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
        tabs: [{
          label: '待办工单',
          name: '/work-order/todo',
        },{
          label: '工单列表',
          name: '/work-order/list',
        }]
      };
    },
    computed: {
      currentPath: {
        get() {
          return this.$route.path;
        },
        set(path) {
//          console.log(path);
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
