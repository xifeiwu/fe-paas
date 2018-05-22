<template>
  <div id="profile" class="spa">
    <aside>
      <div class="img" @click="handleAsideMenuSelect('index', ['index'])">
        <img src="/assets/imgs/finup-cloud-2.png">
      </div>
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
    </aside>
    <main>
      <paas-header-profile :userName="userName" defaultActive="profile" :showImg="false"
                           @menu-click="handleHeaderMenuClick"></paas-header-profile>
      <div class="content">
        <el-row class="header" type="flex" align="middle">
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
        <div class="child">
          <router-view></router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
  $header-height: 45px;
  $header-background-color: #3976EF;
  $header-background-color: #e7e7e7;
  $split-line-color: #e7e7e7;
  $aside-width: 180px;

  $main-background: #F2F6FC;
  $menu-background: white;
  $menu-background-hover: #ecf5ff;
  $menu-background-active: #409EFF;
  $menu-font-color: #2d2f33;
  $menu-font-color-hover: #2d2f33;
  $menu-font-color-active: white;

  $menu-background: rgb(0, 21, 41);
  $menu-background-hover: rgb(0, 21, 41);
  $menu-background-active: $main-background;
  $menu-font-color: rgba(255, 255, 255, 0.7);
  $menu-font-color-hover: white;
  $menu-font-color-active: black;


  #profile {
    height: 100%;
    /*display: flex;*/
    /*flex-direction: row;*/
    aside {
      /*position: fixed;*/
      /*top: 45px;*/
      /*bottom: 0px;*/
      box-sizing: border-box;
      width: 180px;
      height: 100%;
      float: left;
      /*flex: 0 0;*/
      background: $menu-background;
      /*border-right: solid 1px $split-line-color;*/

      .img {
        line-height: $header-height;
        cursor: pointer;
        img {
          width: 120px;
          margin-left: 12px;
          vertical-align: middle;
        }
      }

      [class^="my-icon-"] {
        display: inline-block;
        font-size: 14px;
        margin-top: 1px;
        margin-right: 5px;
      }
      .el-menu {
        background-color: $menu-background;
        margin-top: 10px;
        border-width: 0px;
        .el-menu-item {
          color: $menu-font-color;
          font-size: 15px;
          height: 40px;
          margin: 8px 0px;
          line-height: 40px;
          &:hover {
            background-color: $menu-background-hover;
            color: $menu-font-color-hover;
          }
          &.is-active {
            color: $menu-font-color-active;
            background: $menu-background-active;
            border-radius: 0px;
            [class^="my-icon-"] {
              /*font-size: 15px;*/
            }
          }
        }
      }
    }
    main {
      /*flex: 1 0;*/
      background: $main-background;
      width: calc(100% - 180px);
      height: 100%;
      float: left;
      .paas-header-profile {
      }
      .content {
        margin-top: 2px;
        padding: 0px;
        height: calc(100% - 32px);
        .el-row.header {
          background: white;
          border-bottom: 1px solid #e7e7e7;
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
        .child {
          height: calc(100% - 32px);
          overflow: scroll;
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
//        console.log(this.crumbList);
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
      /**
       * menu click handler for el-menu
       * @param key, string, such as '/log'
       * @param keyPath, array, such as ["/log"]
       */
      handleAsideMenuSelect(key, keyPath) {
        if (keyPath.length > 0) {
          switch (key) {
            case '/profile/app_manager':
              this.$router.push(key);
              break;
            case 'index':
              this.$utils.goToPath('/index');
            default:
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
