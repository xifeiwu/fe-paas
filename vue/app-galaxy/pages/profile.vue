<template>
  <el-container>
    <el-header>
      <div class="img">picture</div>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item index="login">登录</el-menu-item>
        <!--<el-submenu index="2">-->
        <!--<template slot="title">我的工作台</template>-->
        <!--<el-menu-item index="2-1">选项1</el-menu-item>-->
        <!--<el-menu-item index="2-2">选项2</el-menu-item>-->
        <!--<el-menu-item index="2-3">选项3</el-menu-item>-->
        <!--</el-submenu>-->
        <el-menu-item index="message">消息中心</el-menu-item>
        <el-menu-item index="user">用户A</el-menu-item>
        <el-menu-item index="logout">退出</el-menu-item>
      </el-menu>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu
                default-active="2"
                class="el-menu-vertical-demo"
                @open="handleOpen"
                @close="handleClose"
                @select="handleSelect">
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>管理中心</span>
            </template>
            <el-menu-item-group>
              <template slot="title">管理中心</template>
              <el-menu-item index="1-0">应用管理</el-menu-item>
              <el-menu-item index="1-1">服务管理</el-menu-item>
              <el-menu-item index="1-2">实例列表</el-menu-item>
              <el-menu-item index="1-3">外网域名</el-menu-item>
              <el-menu-item index="1-4">日志中心</el-menu-item>
              <el-menu-item index="1-5">应用监控</el-menu-item>
              <el-menu-item index="1-6">Oauth权限</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="分组2">
              <el-menu-item index="1-3">选项3</el-menu-item>
            </el-menu-item-group>
            <el-submenu index="1-4">
              <template slot="title">选项4</template>
              <el-menu-item index="1-4-1">选项1</el-menu-item>
            </el-submenu>
          </el-submenu>
          <el-menu-item index="2">
            <i class="el-icon-menu"></i>
            <span slot="title">导航二</span>
          </el-menu-item>
          <el-menu-item index="3">
            <i class="el-icon-setting"></i>
            <span slot="title">导航三</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script>

  import URL_LIST from '../config/url'
  export default {
    data() {
      return {
        activeIndex: '3',
      }
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
        switch (key) {
          case 'login':
            this.$router.push('/login');
            break;
          case 'logout':
            this.$ajax.get(URL_LIST.logout).then(res => {
              console.log(res);
            }).catch(err => {
              console.log(err);
            });
            break;
          case 'user':
            this.$ajax.get(URL_LIST.app_test).then(res => {
              console.log(res);
            }).catch(err => {
              console.log(err);
            });
            break;

        }
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .el-container {
    .el-header {
      background-color: #e7e7e7;
      color: #333;
      text-align: center;
      line-height: 60px;

      .img {
        float: left;
      }

      .el-menu {
        background-color: transparent;
        float: right;
      }

    }
    .el-aside {
      position: fixed;
      top: 62px;
      bottom: 0px;
    }
  }
</style>