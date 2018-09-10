<template>
  <div id="profile" class="spa">
    <paas-nav-bar :activeSideMenuItem="activeSideMenuItem"></paas-nav-bar>
    <main :class="{'collapse-menu': collapseMenu}">
      <!--toasts area-->
      <div style="width: 100%; position: fixed; z-index: 99999;">
        <el-alert v-for="item in toasts"
                  :title="item.title"
                  :type="item.type"
                  :center="item.center"
                  :key="item.title"
                  class="mb-1"
                  show-icon>
        </el-alert>
      </div>
      <!--toasts-area-->
      <paas-header-profile :userName="userName" :userRole=userRole :showImg="false" ref="paasHeaderProfile"
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
        <div class="child"
             v-loading="$net.vm.requestingUrlListLength > 0"
             element-loading-text="网络请求中..."
             element-loading-spinner="el-icon-loading"
        >
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
    display: flex;
    flex-direction: row;
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: calc(100% - 200px);
      background: $main-background;
      height: 100%;
      .paas-header-profile {
      }
      .content {
        flex: 1;
        margin-top: 3px;
        padding: 0px;
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
  import paasNavBar from './nav-bar.vue';

  export default {
    components: {paasHeaderProfile, paasNavBar},
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

      Promise.all([
        this.$net.requestPaasServer(this.$net.URL_LIST.permission_url_map),
        this.$net.requestPaasServer(this.$net.URL_LIST.user_not_permitted)
      ]).then(resContentList => {
        this.$storeHelper.notPermitted = this.$net.parseNotPermittedCommands(resContentList);
        this.$routeHelper.addPermission(this.$storeHelper.notPermitted);
      });

      this.$store.dispatch('user/groupId', this.$storeHelper.currentGroupID);
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
      this.onRoutePath(this.$route);
    },
    computed: {
      ...mapState(['toasts']),
      ...mapState("user", ["groupInfo"]),
      ...mapGetters({
        'collapseMenu': 'collapseMenu'
      }),
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
        return this.$storeHelper.getUserInfo('role');;
      },
      groupList() {
        return this.$storeHelper.groupList();
      }
    },
    watch: {
      '$route': 'onRoutePath',
      '$net.vm.requestingUrlListLength': {
        deep: true,
        handler (urlListLength) {
//          console.log(urlListLength);
        }
      },
      'groupInfo.id': {
        immediate: true,
        handler (groupId, oldValue) {
          if (!groupId) {
            return;
          }
          /**
           * all the request related with groupID will be refreshed, include:
           * 1. profileListOfGroup
           * 2. appInfoListOfGroup
           * 3. usersInGroup
           */
          // 解析app列表的时候需要profileList的相关信息
          this.$net.requestPaasServer(this.$net.URL_LIST.profile_list_of_group, {
            payload: {
              id: groupId
            }
          }).then(resContent => {
            const profileList = resContent['spaceList'];
            this.$store.dispatch('user/profileList', profileList);
            Promise.all([
              this.$net.getAPPList({
                groupId: groupId
              }),
              this.$net.requestPaasServer(this.$net.URL_LIST.users_list_of_group, {
                payload: {
                  id: groupId
                }
              })
            ]).then(resContentList => {
              const [resContent1, resContent2] = resContentList;
              const appInfoList = resContent1;
              const userList = resContent2['groupUserList'];
              this.$store.dispatch('user/userList', userList);
              this.$store.dispatch('user/appInfoList', appInfoList);
            }).catch(err => {
              this.$net.showError(err);
            })
          }).catch(err => {});
        }
      },
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
          let pageNotShowGroupList = ['/profile/app/add', '/profile/service/add'];
          let pageNotShowGroupListReg = /^\/profile\/(work-order\/(todo|list).*|config-server\/*)$/;
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
        if (!path.startsWith('/')) {
          return;
        }
        const pathList = path.split('/');

        if (pathList.length >= 3) {
          this.activeSideMenuItem = pathList.slice(0, 3).join('/');
        }

        let index = 1;
        this.crumbList = [];
        while (index <= pathList.length) {
          let portionPath = pathList.slice(0, index).join('/');
          if (portionPath in this.routerPathToName) {
            this.crumbList.push(portionPath);
          }
          index += 1;
        }
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
            this.$net.requestPaasServer(this.$net.URL_LIST.logout).then(() => {
              this.$message({
                type: 'success',
                message: '退出成功',
                duration: 500,
                onClose: () => {
                  this.$storeHelper.logout();
                  this.$utils.goToPath('/login?to=/profile');
                }
              });
            }).catch();
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
