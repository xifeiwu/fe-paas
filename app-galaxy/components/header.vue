<template>
  <el-row class="pass-header" width="180px" type="flex" justify="center" align="middle">
    <el-col :span=12 class="first-col">
      <div class="img" @click="handleHeaderMenuClick(null, ['index'])">
        <img src="/assets/imgs/finup-cloud.png" height="45px">
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
          <el-menu-item index="app">应用引擎</el-menu-item>
          <el-menu-item index="object-storage">对象存储</el-menu-item>
        </el-submenu>
        <el-menu-item index="docs" v-show="true">帮助文档</el-menu-item>
        <el-menu-item index="profile">控制台</el-menu-item>
      </el-menu>
      <!--<div class="login" @click="handleHeaderMenuClick(null, ['login'])">登录</div>-->
    </el-col>
  </el-row>
</template>

<style lang="scss">
$header-height: 60px;
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
        cursor: pointer;
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
          /*<!--.el-submenu__title {-->*/
          /*<!--height: 100%;-->*/
          /*<!--font-size: $menu-font-size;-->*/
          /*<!--line-height: $menu-height;-->*/
          /*<!--}-->*/
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
    methods: {
      handleHeaderMenuClick(key, keyPath) {
        keyPath = keyPath.join('/');
        this.$emit('menu-click', keyPath);
      },
    }
  }
</script>