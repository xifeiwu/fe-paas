<template>
  <div class="paas-header-profile">
    <div class="img" @click="handleMenuClick(null, ['index'])" v-show="showImg">
      <img src="/assets/imgs/finup-cloud.png">
    </div>
    <el-menu class="header-menu"
             mode="horizontal"
             menuTrigger="click"
             @select="handleMenuClick"
             :defaultActive="defaultActive"
             ref="menu"
             v-clickoutside="handleClickOutsideMenu"
    >
      <el-menu-item index="profile">控制台</el-menu-item>
      <el-menu-item index="docs">帮助文档</el-menu-item>
      <el-menu-item index="group-manager" v-if="showGroupManager">团队管理</el-menu-item>
      <el-menu-item index="message" v-show="false">消息中心</el-menu-item>
      <el-submenu index="user" :withDrawOnMouseLeave="false">
        <template slot="title">{{userName}}</template>
        <el-menu-item index="info"><i class="paas-icon-user"></i><span>用户信息</span></el-menu-item>
        <el-menu-item index="logout"><i class="paas-icon-logout"></i><span>退出</span></el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<style lang="scss">
  $header-height: 32px;
  .paas-header-profile {
    height: $header-height;
    .el-menu.header-menu {
      .el-submenu {
        .el-submenu__title {
          font-size: 15px;
          line-height: $header-height;
          height: $header-height;
        }
        .el-menu {
          top: $header-height;
          .el-menu-item {
            text-align: left;
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  $header-height: 32px;
  $header-background-color: rgb(0, 21, 41);
  $header-background-color: #e7e7e7;
  $header-background-color: linear-gradient(120deg, #155799, #159957);
  $header-background-color: linear-gradient(120deg, rgb(0, 21, 41), #159957, rgb(0, 21, 41));
  $header-background-color: linear-gradient(120deg, #002766, rgb(0, 21, 41), #002766);
  $header-background-color: white;

  $menu-background: white;
  $menu-background-hover: white;
  $menu-background-active: white;
  $menu-font-color: black;
  $menu-font-color-hover: black;
  $menu-font-color-active: black;

  .paas-header-profile {
    background: $header-background-color;
    border-bottom: 1px solid #409EFF;

    padding: 0px 30px 0px 0px;
    color: #333;
    text-align: center;
    .img {
      float: left;
      line-height: $header-height;
      cursor: pointer;
      img {
        height: 24px;
        margin-left: 8px;
        margin-top: -2px;
        vertical-align: middle;
      }
    }
    .el-menu.header-menu {
      [class^="paas-icon-"] {
        display: inline-block;
        font-size: 14px;
        margin-top: 1px;
        margin-right: 5px;
      }
      /*background-color: transparent;*/
      background-color: $menu-background;
      float: right;
      border-width: 0px;
      .el-menu-item {
        font-size: 15px;
        line-height: $header-height;
        height: $header-height;
        color: $menu-font-color;
        box-sizing: border-box;
        &:hover {
          background-color: $menu-background-hover;
          color: $menu-font-color-hover;
        }
        &.is-active {
          color: $menu-font-color-active;
          border-radius: 0px;
        }
      }
      .el-submenu .el-menu-item {
        min-width: 120px;
      }
    }
  }
</style>

<script>
  import Clickoutside from 'element-ui/src/utils/clickoutside';
  export default {
    directives: { Clickoutside },
    props: {
      userName: {
        type: String,
        default: '更多'
      },
      defaultActive: {
        type: String,
        default: 'index'
      },
      showImg: {
        type: Boolean,
        default: true
      },
      showGroupManager: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      handleMenuClick(key, keyPath) {
        keyPath = keyPath.join('/');
        this.$emit('menu-click', keyPath);
      },
      handleClickOutsideMenu() {
        this.$refs['menu'].openedMenus = [];
      }
    }
  }
</script>