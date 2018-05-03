<template>
  <el-container id="user" direction="vertical">
    <paas-header-profile :userName="userName"  defaultActive="user"
                         @menu-click="handleHeaderMenuClick"></paas-header-profile>
    <el-container class="inner-container">
      <el-aside width="180px">
        <el-menu
                class="el-menu-vertical-demo"
                @open="handleOpen"
                @close="handleClose"
                @select="handleAsideMenuSelect"
                :defaultOpeneds="['app_menu']"
                :defaultActive="activeSideMenuItem">
          <el-menu-item v-for="menu in menuList" :key="menu.name" :index="menu.router">
            <i :class="menu.icon"></i><span>{{menu.name}}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <!--<el-row class="main-header" type="flex" align="middle">-->
          <!--<el-col :span="12" class="current-step">-->
            <!--<el-breadcrumb separator-class="el-icon-arrow-right">-->
              <!--<el-breadcrumb-item v-for="item in crumbList" :key="item" :to="{path: item}">-->
                <!--{{routerPathToName[item]}}-->
              <!--</el-breadcrumb-item>-->
            <!--</el-breadcrumb>-->
          <!--</el-col>-->
          <!--<el-col :span="12" class="group-list">-->
            <!--<el-select v-model="$storeHelper.currentGroupID" filterable placeholder="请选择">-->
              <!--<el-option v-for="item in $storeHelper.groupList" :key="item.id" :label="item.name" :value="item.id">-->
              <!--</el-option>-->
            <!--</el-select>-->
          <!--</el-col>-->
        <!--</el-row>-->
        <el-scrollbar>
          <router-view></router-view>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
  $header-height: 45px;
  $header-background-color: #3976EF;
  $header-background-color: #e7e7e7;
  $split-line-color: #e7e7e7;
  $aside-width: 180px;
  #user.el-container {
    height: 100%;
    .inner-container {
      .el-aside {
        position: fixed;
        top: $header-height;
        bottom: 0px;
        border-right: solid 1px $split-line-color;
        [class^="my-icon-"] {
          display: inline-block;
          font-size: 14px;
          margin-top: 1px;
          margin-right: 5px;
        }
        .el-menu {
          margin-top: 10px;
          border-width: 0px;
          .el-menu-item {
            font-size: 15px;
            height: 40px;
            margin: 8px 0px;
            line-height: 40px;
            &.is-active {
              background-color: #409EFF;
              color: white;
              border-radius: 0px;
              [class^="my-icon-"] {
                /*font-size: 15px;*/
              }
            }
          }
        }
      }
      .el-main {
        padding: 0px;
        margin-left: $aside-width;
        .el-row.main-header {
          border-bottom: 1px solid $split-line-color;
          padding: 3px;
          min-height:39px;
          .el-col {
            &:nth-child(1) {
              padding-left: 6px;
              .el-breadcrumb {
                font-size: 16px;
              }
            }
            &:nth-child(2) {
              text-align: right;

            }
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
  import routeUtils from './route';
  import paasHeaderProfile from './components/header-profile';

  export default {
    components: {paasHeaderProfile},
    data() {
      return {
        activeSideMenuItem: '/profile/app',
        crumbList: [],
      }
    },
    created() {
      this.$store.dispatch('user/groupList');
      this.$store.dispatch('app/messageForCreateAPP');
//      this.$store.dispatch('user/profileListOfGroup', {
//        id: this.currentGroupID
//      });
//      this.$store.dispatch('user/appInfoListOfGroup', {
//        from: 'page/profile',
//        groupID: this.currentGroupID
//      });
      /**
       * all the request related with groupID will be refreshed, include:
       * 1. profileListOfGroup
       * 2. appInfoListOfGroup
       * 3. usersInGroup
       */
      this.$store.dispatch('user/groupID', {
        value: this.$storeHelper.currentGroupID
      });
      this.updateCrumbList(this.$route.path);
    },
    mounted() {
      this.$nextTick(() => {
      });
    },
    computed: {
      menuList() {
        return [{
          "id": 1,
          "name": "用户信息",
          "router": "/user/info",
          "icon": "my-icon-user"
        }, {
          "id": 2,
          "name": "操作记录",
          "router": "/user/operation",
          "icon": "my-icon-log"
        }]
      },
      routerPathToName() {
        return routeUtils.getRouterPathToName();
      },
      userName() {
        let userName = this.$storeHelper.getUserInfo('realName');
        if (!userName) {
          userName = '未知';
        }
        return userName;
      }
    },
    watch: {
//      '$route': function (value, oldValue) {
//        this.updateCrumbList(value.path);
//      },
    },
    methods: {
      /**
       * register some global variable at start of page profile
       */
      handleHeaderMenuClick(keyPath) {
        switch (keyPath) {
          case 'user/info':
            this.$router.push('/user/info');
            break;
          case 'user/logout':
            this.$net.logout().then(msg => {
              this.$setUserInfo('token', null);
              this.$message({
                type: 'success',
                message: msg,
                duration: 500,
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
          case 'user/operation':
            this.$router.push('/user/operation');
            break;
          case 'profile':
            this.$router.push('/profile');
            break;
          case 'index':
            this.$utils.goToPath('/index.html');
            break;
        }
      },
      handleAsideMenuSelect(key, keyPath) {
//        console.log(key);
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
      /**
       * update crumb list by path and routerPathToName which get from router config, such as:
       * /profile/service/add
       * /profile/service -> 服务管理
       * /profile/service/add -> 添加服务
       * @param path
       */
      updateCrumbList(path) {
        // url中只能包括：\w(字母或数字、下划线、汉字)或中划线
        let pathReg = /^\/user\/([\w-\/]*)$/i;
        let execResult = pathReg.exec(path);
        if (execResult && execResult.length >= 2) {
          let curPath = '/user/';
          this.crumbList = [];
          execResult[1].split('/').forEach((it, index) => {
            let path = curPath + it;
            // set active aside menu item by the first url after /profile, such as:
            // /profile/domain -> 外网域名
            if (index === 0) {
              this.activeSideMenuItem = path;
            }
            if (path in this.routerPathToName) {
              this.crumbList.push(path);
            }
            curPath = curPath + it + '/';
          });
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
