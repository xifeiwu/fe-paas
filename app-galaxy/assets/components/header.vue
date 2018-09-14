<template>
  <el-row class="pass-header" type="flex" justify="center" align="middle">
    <el-col :span=12 class="first-col">
      <div class="img" @click="handleHeaderMenuClick(null, ['index'])">
        <img src="/assets/imgs/finup-cloud.png" height="32px">
      </div>
      <div class="text">
        <div>云端分享价值，平台成就用户</div>
      </div>
    </el-col>
    <el-col :span="12" class="second-col">
      <el-menu class="header-menu"
               mode="horizontal"
               menuTrigger="click"
               @select="handleHeaderMenuClick"
               :defaultActive="defaultActive"
      >
        <el-menu-item index="index">首页</el-menu-item>
        <el-submenu index="product">
          <template slot="title">产品</template>
          <el-menu-item v-for="item in productionList" :key="item.index" :index="item.index" v-if="item.index">{{item.name}}</el-menu-item>
        </el-submenu>
        <el-menu-item index="finup-community" v-show="true">凡普云社区</el-menu-item>
        <el-menu-item index="docs" v-show="true">帮助文档</el-menu-item>
        <el-menu-item index="profile">控制台</el-menu-item>
      </el-menu>
      <!--<div class="login" @click="handleHeaderMenuClick(null, ['login'])">登录</div>-->
    </el-col>
  </el-row>
</template>

<style lang="scss">
$header-height: 45px;
$header-background-color: #e7e7e7;
$aside-width: 180px;
$menu-font-size: 16px;
$menu-height: 45px;
.el-row.pass-header {
  padding: 0px 20px;
  .el-col {
    &.second-col {
      .el-menu.header-menu {
        .el-submenu {
          .el-submenu__title {
            height: 100%;
            font-size: $menu-font-size;
            line-height: $menu-height;
          }
          .el-menu {
            top: 50px;
            .el-menu-item {
              text-align: left;
            }
          }
        }
      }
    }
  }
}
.el-row.pass-header {
  background-color: white;
  color: #333;
  .el-col {
    &.first-col {
      line-height: $header-height;
      .img {
        display: inline-block;
        cursor: pointer;
      }
      .text {
        display: inline-block;
        vertical-align: bottom;
        color: gray;
        margin-left: 12px;
        margin-bottom: 8px;
        line-height: 120%;
        font-size: 12px;
      }
    }
    &.second-col {
      text-align: right;
      .el-menu.header-menu {
        display: inline-block;
        background-color: transparent;
        border-width: 0px;
        .el-menu-item {
          font-size: $menu-font-size;
          line-height: $menu-height;
          height: $menu-height;
          &.is-active {
            color: black;
          }
        }
        .el-submenu {
          height: $menu-height;
        }
      }
      .login {
        margin-left: 15px;
        display: inline-block;
        font-size: $menu-font-size;
        line-height: $menu-height;
      }
    }
  }
}
</style>

<script>
  export default {
    props: {
      defaultActive: {
        type: String,
        default: 'index'
      },
    },
    data() {
      return {
        productionList: [{
          name: '应用引擎',
          index: 'profile/app',
        }, {
          name: '对象存储',
          index: false,
          path: 'unknown',
        }, {
          name: '应用配置',
          index: 'profile/config-server',
        }, {
          name: 'Access Key',
          index: 'profile/oauth',
        }]
      }
    },
    methods: {
      handleHeaderMenuClick(key, keyPath) {
        const keyAll = keyPath.join('/');
        if (keyPath.length === 0) {
          return;
        }
        const key1 = keyPath[0];
        const key2 = keyPath.length > 1 ? keyPath[1] : '';
        switch (key1) {
          case 'docs':
          case 'index':
            window.location.pathname = this.$net.page[key1];
            break;
          case 'product':
            switch (key2) {
              case 'profile/app':
              case 'profile/config-server':
              case 'profile/oauth':
                window.location.pathname = this.$net.page[key2];
                break;
              default:
                this.$emit('menu-click', keyAll);
                break;
            }
            break;
          case 'finup-community':
            window.open('http://club.finupcloud.com/', '_blank');
            break;
          default:
            this.$emit('menu-click', keyAll);
        }
      },
    }
  }
</script>