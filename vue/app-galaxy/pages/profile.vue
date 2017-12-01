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
    <el-main>
    </el-main>
    <el-footer>
      <div>Copyright © 2017 凡普金科</div>
    </el-footer>
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
  }
</style>