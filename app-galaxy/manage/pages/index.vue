<template>
  <div id="manage" class="spa">
    <main :class="{'collapse-menu': false}">
      <!--toasts-area-->
      <paas-header-profile :userName="userName" :userRole="userRole" :showImg="false" ref="paasHeaderProfile"
                           defaultActive="manage" @menu-click="handleHeaderMenuClick"></paas-header-profile>
      <div class="content">
        <!--<el-row class="header" type="flex" align="middle">-->
          <!--<el-col :span="12" class="current-step">-->
            <!--<el-breadcrumb separator-class="el-icon-arrow-right">-->
              <!--<el-breadcrumb-item v-for="item in crumbList" :key="item" :to="{path: item}">-->
                <!--{{routerPathToName[item]}}-->
              <!--</el-breadcrumb-item>-->
            <!--</el-breadcrumb>-->
          <!--</el-col>-->
          <!--<el-col :span="12" class="group-list">-->
            <!--<el-select v-model="$storeHelper.currentGroupID" size="mini" filterable-->
                       <!--:placeholder="(groupList && groupList.length > 0) ? '请选择':'无数据'" v-if="showGroupList">-->
              <!--<el-option v-for="item in groupList" :key="item.id" :label="item.asLabel" :value="item.id">-->
              <!--</el-option>-->
            <!--</el-select>-->
          <!--</el-col>-->
        <!--</el-row>-->
        <div class="child">
          <router-view></router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
  $main-background: #F2F6FC;
  /*$main-background: #E4E7ED;*/

  #profile {
    height: 100%;
    main {
      background: $main-background;
      /*width: calc(100% - 200px);*/
      /*&.collapse-menu {*/
        /*width: calc(100% - 64px);*/
      /*}*/
      transition: width 0.3s ease-out;
      height: 100%;
      .paas-header-profile {
      }
      .content {
        margin-top: 3px;
        padding: 0px;
        height: calc(100% - 36px);
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
  import {mapState, mapGetters} from 'vuex';
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
//      this.$store.dispatch('app/messageForCreateAPP');
//
//      // for permission list
//      this.$net.getNotPermittedCommands().then(list => {
//        this.$storeHelper.notPermitted = list;
//        this.$routeHelper.addPermission(this.$storeHelper.notPermitted);
//      }).catch(err => {
//        this.$notify.error({
//          title: err.title,
//          message: err.msg,
//          duration: 0,
//          onClose: function () {
//          }
//        });
//      });
//
//      this.$store.dispatch('user/groupId', this.$storeHelper.currentGroupID);
      this.onRoutePath(this.$route);
    },
    mounted() {
      if (this.userRole !== '平台管理员') {
        window.location.pathname = this.$net.page['profile'];
        return;
      }
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
      userRole() {
        return this.$storeHelper.getUserInfo('role');
      },
      groupList() {
        return this.$storeHelper.groupList();
      }
    },
    watch: {
      '$route': 'onRoutePath',
      'groupInfo': function (groupInfo, oldValue) {
//        if (groupInfo.id === oldValue.id) {
//          return;
//        }
//        console.log(groupInfo);
        /**
         * all the request related with groupID will be refreshed, include:
         * 1. profileListOfGroup
         * 2. appInfoListOfGroup
         * 3. usersInGroup
         */
        Promise.all([
          this.$net.requestPaasServer(this.$net.URL_LIST.profile_list_of_group, {
            payload: {
              id: groupInfo.id
            }
          }),
          this.$net.requestPaasServer(this.$net.URL_LIST.users_list_of_group, {
            payload: {
              id: groupInfo.id
            }
          }),
          this.$net.getAPPList({
            groupId: groupInfo.id
          })
        ]).then(resContentList => {
          const [resContent1, resContent2, resContent3] = resContentList;
          const profileList = resContent1['spaceList'];
          const userList = resContent2['groupUserList'];
          const appInfoList = resContent3;
          this.$store.dispatch('user/userList', userList);
          this.$store.dispatch('user/appInfoList', appInfoList);
          this.$store.dispatch('user/profileList', profileList);
        }).catch(err => {
          console.log(err);
        })
      }
    },
    methods: {
      // set el-menu profile as active menu of paasHeaderProfile
      setDefaultActiveForHeader() {
        return;
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
                  this.$storeHelper.logout();
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
                    this.$storeHelper.logout();
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
    }
  }
</script>
