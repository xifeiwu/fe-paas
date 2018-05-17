<template>
  <el-container id="profile" class="page" direction="vertical">
    <paas-header-profile :userName="userName" defaultActive="profile"
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
            <!--<el-menu-item index="app_manager">-->
              <!--<i class="el-icon-location"></i>-->
              <!--<span>应用管理</span>-->
            <!--</el-menu-item>-->
          <el-menu-item v-for="menu in menuList" :key="menu.name" :index="menu.router">
            <i :class="menu.icon"></i><span>{{menu.name}}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <el-row class="main-header" type="flex" align="middle">
          <el-col :span="12" class="current-step">
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item v-for="item in crumbList" :key="item" :to="{path: item}">
                {{routerPathToName[item]}}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="12" class="group-list">
            <el-select v-model="$storeHelper.currentGroupID" size="mini" filterable
                       :placeholder="(groupList && groupList.length > 0) ? '请选择':'无数据'" v-if="showGroupList">
              <el-option v-for="item in groupList" :key="item.id" :label="item.asLabel" :value="item.id">
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
  $header-height: 45px;
  $header-background-color: #3976EF;
  $header-background-color: #e7e7e7;
  $split-line-color: #e7e7e7;
  $aside-width: 180px;
  #profile.el-container {
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
          border-bottom: 1px solid #e7e7e7;
          padding: 0px 6px;
          height:30px;
          .el-col {
            &.current-step {
              padding-left: 6px;
              .el-breadcrumb {
                font-size: 14px;
              }
            }
            &.group-list {
              text-align: right;
              .el-select {
                width: 240px;
              }
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
  import paasHeaderProfile from '$components/header-profile';

  export default {
    components: {paasHeaderProfile},
    data() {
      return {
        activeSideMenuItem: '/app',
        crumbList: [],

        showGroupList: true,
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
      this.onRoutePath(this.$route);
    },
    mounted() {
      this.$nextTick(() => {
      });
    },
    computed: {
      menuList() {
        return this.$storeHelper.menuList;
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
      },
      groupList() {
        return this.$storeHelper.groupList();
      }
    },
    watch: {
      '$route': 'onRoutePath',
    },
    methods: {
      onRoutePath (value, oldValue) {
        let relativePath = value.path;
        if (relativePath && relativePath.length > 0) {
          // whether show groupList
          let pageNotShowGroupList = ['/app/add', '/service/add'];
          let pageNotShowGroupListReg = /^\/work-order\/(todo|list).*$/;
          if (pageNotShowGroupList.indexOf(relativePath) > -1 || pageNotShowGroupListReg.exec(relativePath)) {
            this.showGroupList = false;
          } else {
            this.showGroupList = true;
          }
          // update content of crumb list
          this.updateCrumbList(relativePath);
        }
      },
      /**
       * update crumb list by path and routerPathToName which get from router config, such as:
       * /service/add
       * /service -> 服务管理
       * /service/add -> 添加服务
       * @param path: url path
       */
      updateCrumbList(path) {
        // url中只能包括：\w(字母或数字、下划线、汉字)或中划线
        let pathConcat = '';
        this.crumbList = [];
        path.split('/').filter(it => {
          return it.length > 0
        }).map(it => {
          return '/' + it
        }).forEach((it, index) => {
          if (0 === index) {
            this.activeSideMenuItem = it;
          }
          pathConcat += it;
          if (pathConcat in this.routerPathToName) {
            this.crumbList.push(pathConcat);
          }
        });
        console.log(this.crumbList);
      },
      /**
       * register some global variable at start of page profile
       */
      handleHeaderMenuClick(keyPath) {
        switch (keyPath) {
          case 'user/info':
//            this.$router.push('/user/info');
            this.$utils.goToPath('/user');
            break;
          case 'user/logout':
            this.$net.logout().then(msg => {
              this.$message({
                type: 'success',
                message: msg,
                duration: 500,
                onClose: () => {
                  this.$store.dispatch('user/logout');
//                  this.$router.push('/login');
                  this.$utils.goToPath('/login?to=/profile');
                }
              });
            }).catch(err => {
              this.$notify.error({
                title: err.title,
                message: err.msg,
                duration: 0,
                onClose: function () {
                }
              });
            });
            break;
          case 'message':
            break;
          case 'profile':
//            this.$utils.goToPath('/profile');
            break;
          case 'index':
            this.$utils.goToPath('/index');
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
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>
