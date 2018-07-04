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
      <paas-header-profile :userName="userName" :showImg="false" ref="paasHeaderProfile"
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
  /*$main-background: #E4E7ED;*/

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
    aside {
      box-sizing: border-box;
      width: 180px;
      height: 100%;
      float: left;
      background: $menu-background;

      .img {
        line-height: $header-height;
        cursor: pointer;
        img {
          width: 120px;
          margin-left: 12px;
          vertical-align: middle;
        }
      }

      [class^="paas-icon-"] {
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
            [class^="paas-icon-"] {
              /*font-size: 15px;*/
            }
          }
        }
      }
    }
    main {
      background: $main-background;
      width: calc(100% - 180px);
      height: 100%;
      float: left;
      .paas-header-profile {
      }
      .content {
        margin-top: 3px;
        padding: 0px;
        height: calc(100% - 33px);
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
//      this.$store.dispatch('user/groupList');
      // get group list of current user
      this.$net.getUserGroupList().then(content => {
        if (content.hasOwnProperty('groupList') && Array.isArray(content['groupList'])) {
          let groupList = content.groupList;
          this.$store.dispatch('user/groupList', groupList);
          if (groupList.length === 0) {
            this.$notify.error({
              title: '您所属的团队为空，某些操作可能无法进行',
              message: '请联系管理员，添加团队',
              duration: 0,
              onClose: function () {
              }
            });
          }
        } else {
          this.$notify.error({
            title: '数据错误',
            message: '数据格式不正确',
            duration: 0,
            onClose: function () {
            }
          });
        }
      }).catch(err => {
        if (err.title && err.msg) {
          this.$notify.error({
            title: err.title,
            message: err.msg,
            duration: 0,
            onClose: function () {
            }
          });
        }
      });

      this.$store.dispatch('app/messageForCreateAPP');
      // for permission list
      this.$net.getNotPermittedCommands().then(list => {
        this.$storeHelper.notPermitted = list;
        this.$routeHelper.addPermission(this.$storeHelper.notPermitted);
      }).catch(err => {
        this.$notify.error({
          title: err.title,
          message: err.msg,
          duration: 0,
          onClose: function () {
          }
        });
      });

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
      this.$utils.onWindowVisibilityChange((evt) => {
        if (!document.hidden) {
          this.setDefaultActiveForHeader();
        }
      });
      this.$nextTick(() => {
        this.setDefaultActiveForHeader();
      });
    },
    computed: {
      menuList() {
        return this.$storeHelper.menuList;
      },
      routerPathToName() {
        return this.$routeHelper.getRoutePathToName();
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
      // set el-menu profile as active menu of paasHeaderProfile
      setDefaultActiveForHeader() {
        if (this.$refs.hasOwnProperty('paasHeaderProfile') && this.$refs['paasHeaderProfile']) {
          this.$refs['paasHeaderProfile'].setActiveMenu('profile');
        }
      },
      onRoutePath (value, oldValue) {
        let relativePath = value.path;
        if (relativePath && relativePath.length > 0) {
          // whether show groupList
          let pageNotShowGroupList = ['/app/add', '/service/add'];
          let pageNotShowGroupListReg = /^\/(work-order\/(todo|list).*|config-server\/*)$/;
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
            this.$utils.goToPath('/user', {
              target: '_blank'
            });
            break;
          case 'user/logout':
            this.$net.logout().then(msg => {
              this.$message({
                type: 'success',
                message: msg,
                duration: 500,
                onClose: () => {
                  this.$store.dispatch('user/logout');
                  this.$utils.goToPath('/login?to=/profile');
                }
              });
            }).catch(err => {
              if (err.msg) {
                this.$message({
                  type: 'error',
                  message: err.msg,
                  duration: 500,
                  onClose: () => {
                    this.$store.dispatch('user/logout');
                    this.$utils.goToPath('/login?to=/user');
                  }
                });
              }
            });
            break;
          case 'message':
            break;
          case 'docs':
            this.$utils.goToPath('/docs', {
              target: '_blank'
            });
            break;
          case 'group-manager':
            this.$utils.goToPath('/user#/group', {
              target: '_blank'
            });
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
