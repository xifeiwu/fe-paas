<template>
  <div class="paas-header-profile">
    <div class="img" @click="handleMenuClick(null, ['index'])">
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
      <el-menu-item index="message" v-show="false">消息中心</el-menu-item>
      <el-submenu index="user" :withDrawOnMouseLeave="false">
        <template slot="title">{{userName}}</template>
        <el-menu-item index="info"><i class="my-icon-user"></i><span>用户信息</span></el-menu-item>
        <el-menu-item index="logout"><i class="my-icon-logout"></i><span>退出</span></el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<style lang="scss">
  $header-height: 45px;
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
  $header-height: 45px;
  $header-background-color: #3976EF;
  $header-background-color: #e7e7e7;
  $split-line-color: #e7e7e7;
  .paas-header-profile {
    background-color: $header-background-color;
    padding: 0px 20px 0px 0px;
    color: #333;
    text-align: center;
    .img {
      float: left;
      line-height: $header-height;
      cursor: pointer;
      img {
        width: 120px;
        margin-left: 8px;
        vertical-align: middle;
      }
    }
    .el-menu.header-menu {
      [class^="my-icon-"] {
        display: inline-block;
        font-size: 14px;
        margin-top: 1px;
        margin-right: 5px;
      }
      background-color: transparent;
      float: right;
      border-width: 0px;
      .el-menu-item {
        font-size: 15px;
        line-height: $header-height;
        height: $header-height;
        &.is-active {
          color: black;
        }
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