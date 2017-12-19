<template>
  <el-container class="outer-container">
    <el-header>
      <div class="img">picture</div>
      <el-menu
              :default-active="activeIndex"
              class="el-menu-demo"
              mode="horizontal"
              @select="handleTitleMenuSelect"
              index="title_menu"
      >
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
    <el-container class="inner-container">
      <el-aside width="200px">
        <el-menu
                class="el-menu-vertical-demo"
                @open="handleOpen"
                @close="handleClose"
                @select="handleAsideMenuSelect"
                :defaultOpeneds="['app_menu']"
                default-active="app_manager"
                index="aside_menu">
            <!--<el-menu-item index="app_manager">-->
              <!--<i class="el-icon-location"></i>-->
              <!--<span>应用管理</span>-->
            <!--</el-menu-item>-->
          <el-menu-item v-for="menu in menuList" :key="menu.name" :index="menu.router">
            <i :class="menu.icon"></i><span>{{menu.name}}</span>
          </el-menu-item>
          <li :value="activeIndex"></li>
        </el-menu>
      </el-aside>
      <el-main>
        <el-row class="main-title">
          <el-col :span="12" class="current-step">{{currentStep}}</el-col>
          <el-col :span="12" class="group-list">
            <el-select v-model="currentGroupID" placeholder="请选择">
              <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-col>
        </el-row>
        <el-scrollbar>
          <router-view></router-view>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
  .el-container.outer-container {
    height: 100%;
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
    .inner-container {
      .el-aside {
        position: fixed;
        top: 62px;
        bottom: 0px;
        border-right: solid 1px #e6e6e6;
        .el-menu {
          border-width: 0px;
        }
      }
      .el-main {
        padding: 0px;
        margin-left: 200px;
        .main-title {
          border-bottom: 1px solid gray;
          padding: 5px;
          .current-step {
            line-height: 32px;
          }
          .group-list {
            text-align: right;
          }
        }
        .el-scrollbar {
          height: calc(100% - 43px);
        }
      }
    }
  }
</style>

<script>
//  import { mapGetters } from 'vuex'
  import routeUtils from './route';

  export default {
    data() {
      return {
        activeIndex: '3',
        currentStep: '',
        groupID: '',
      }
    },
    created() {
      this.$store.dispatch('user/getGroupList');
      this.$store.dispatch('app/getMessageForCreateAPP');
      this.$store.dispatch('user/getAppListByGroupID', {
        from: 'page/profile',
        groupID: this.currentGroupID
      });
      this.currentStep = routeUtils.getNameByRouterPath(this.$route.path);
    },
    mounted() {
//      console.log('profile created');
    },
    computed: {
      menuList() {
        return this.$store.getters['user/menuList']
      },
      currentGroupID: {
        get() {
          if ('' === this.groupID) {
            this.groupID = this.$store.getters['user/groupID'];
          }
          if (!this.groupID && (Array.isArray(this.groupList) && this.groupList.length > 0)) {
            this.groupID = this.groupList[0]['id'];
            this.$store.dispatch('user/groupID', {
              value: this.groupID,
              from: 'profile'
            });
          }
          return this.groupID;
        },
        set(value) {
          this.groupID = value;
          this.$store.dispatch('user/groupID', {
            value,
            from: 'profile'
          });
        }
      },
      groupList() {
        return this.$store.getters['user/groupList'];
      }
    },
    watch: {
      '$route': function (value, oldValue) {
        let pathReg = /^\/profile\/[\w\/]*$/i;
        let path = value.path;
        this.currentStep = '';
        if (pathReg.exec(path)) {
          this.currentStep = '';
          let name = routeUtils.getNameByRouterPath(path);
          if (name) {
            this.currentStep = name;
          }
        }
      }
    },
    methods: {
      handleTitleMenuSelect(key, keyPath) {
        switch (key) {
          case 'login':
            this.$router.push('/login');
            break;
          case 'logout':
            this.$net.logout().then(msg => {
              localStorage.removeItem('token');
              this.$message({
                type: 'success',
                message: msg,
                duration: 1000,
                onClose: () => {
                  this.$router.push('/login');
                }
              });
            }).catch(err => {
              this.$notify.error({
                title: '错误',
                message: err
              });
            });
            break;
          case 'user':
            this.$ajax.get(this.$url.app_test).then(res => {
              console.log(res);
            }).catch(err => {
              console.log(err);
            });
            break;
        }
      },
      handleAsideMenuSelect(key, keyPath) {
        console.log(key);
        if (keyPath.length > 0) {
          switch (key) {
            case '/profile/app_manager':
              this.$router.push(key);
              break;
            default:
              console.log('push key ' + key);
              this.$router.push(key);
              break;
          }
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
