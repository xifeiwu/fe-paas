<template>
  <div id="profile" :class="['spa', $storeHelper.groupVersion]">
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
      <div v-if="invalidPath" class="content">
        <page-not-found :navigateList="navigateList"></page-not-found>
      </div>
      <div v-else class="content">
        <el-row class="header" type="flex" align="middle">
          <el-col :span="12" class="current-step">
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item v-for="item in crumbList" :key="item" :to="{path: item}">
                {{routerPathToName[item]}}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="12" class="group-list">
            <!--<el-select v-model="$storeHelper.currentGroupID" size="mini" filterable-->
                       <!--:placeholder="(groupList && groupList.length > 0) ? '请选择':'无数据'" v-if="showGroupList">-->
              <!--<el-option v-for="item in groupList" :key="item.id" :label="item.asLabel" :value="item.id">-->
              <!--</el-option>-->
            <!--</el-select>-->
            <el-select  v-model="$storeHelper.currentGroupID" size="mini" filterable
                        :placeholder="(groupList && groupList.length > 0) ? '请选择':'无数据'" v-if="showGroupList">
              <el-option-group
                      v-for="version in groupListByVersion"
                      :key="version.label"
                      :class="version['class']"
                      :label="version.label">
                <el-option
                        v-for="group in version.groupList"
                        :key="group.id"
                        :label="group.asLabel"
                        :value="group.id">
                </el-option>
              </el-option-group>
            </el-select>
          </el-col>
        </el-row>
        <!--<div class="child"-->
             <!--v-loading="$net.vm.requestingUrlListLength > 0"-->
             <!--element-loading-text="网络请求中..."-->
             <!--element-loading-spinner="el-icon-loading"-->
        <!--&gt;-->
        <div :class="['child']">
          <div class="el-loading-mask" v-if="$net.vm.requestingUrlListLength > 0">
            <div class="el-loading-spinner">
              <i class="el-icon-loading"></i>
              <p class="el-loading-text">网络请求中...</p>
            </div>
          </div>
          <router-view></router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss">
  #profile.v1 {
    .content {
      .header {
        .group-list {
          .el-select {
            .el-input {
              input {
                color: #E6A23C;
              }
            }
          }
        }
      }
    }
  }
  .el-select-dropdown.el-popper {
    .el-select-group__wrap {
      &.v1 {
        .el-select-dropdown__item {
          &:hover {
            background-color: #C0C4CC;
          }
          &.selected {
            color: #E6A23C;
          }
        }
      }
    }
  }
</style>
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
          position: relative;
          height: calc(100% - 32px);
          overflow: scroll;
          /*max-width: 1300px;*/
          .el-loading-mask {
            position: absolute;
            z-index: 2000;
            background-color: rgba(255, 255, 255, 0.5);;
            margin: 0;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            transition: opacity .3s;
          }
          .el-loading-spinner {
            top: 50%;
            margin-top: -21px;
            width: 100%;
            height: 100px;
            text-align: center;
            position: absolute;
          }
        }
      }
    }
  }
</style>

<script>
  import PageNotFound from 'assets/components/page-not-found.vue';
  import {mapState, mapGetters} from 'vuex';
  import paasHeaderProfile from 'assets/components/header-profile';
  import paasNavBar from './components/nav-bar.vue';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';

  export default {
    components: {PageNotFound, paasHeaderProfile, paasNavBar},
    data() {
      return {
        activeSideMenuItem: this.$net.page['profile'],
        crumbList: [],
        invalidPath: false,
        navigateList: [{
          href: '/profile/app',
          label: '应用引擎'
        }, {
          href: '/profile/oauth',
          label: 'AccessKey管理'
        }, {
          href: '/profile/config-server',
          label: '应用配置'
        }],
        showGroupList: true,
      }
    },
    created() {
      // 获取页面相关配置
      Promise.all([
        this.$net.requestPaasServer(this.$net.URL_LIST.user_group_list),
        this.$net.requestPaasServer(this.$net.URL_LIST.config_query),
        this.$net.requestPaasServer(this.$net.URL_LIST.user_not_permitted)
      ]).then(resContentList => {
        // groupList
        const groupList = resContentList[0].groupList.map(it => {
          let lobName = '';
          if (it.hasOwnProperty('lobName') && it.lobName && it.lobName.length > 0) {
            lobName = '（' + it['lobName'] + '）';
          }
          it.asLabel = it.name;
          // it.asLabel = it.name + lobName;
          return it;
        });
        this.$store.dispatch('user/groupList', groupList);

        // app config related
        const configList = this.$net.parseConfigList(resContentList[1]);
        this.$store.dispatch('app/globalConfig', configList);

        // permission
        this.$storeHelper.notPermitted = this.$net.parseNotPermittedCommands(resContentList[2]);
        this.$router.helper.addPermission(this.$storeHelper.notPermitted);
      }).catch(err => {
        console.log(err);
        this.$notify.error({
          title: '配置信息获取失败，请刷新页面重试',
          message: err.message,
          duration: 0,
        });
      });

      this.$store.dispatch('user/groupId', this.$storeHelper.currentGroupID);
    },
    mounted() {
      this.resizeListener = () => {
        this.$store.dispatch('setScreenSize', {
          width: this.$el.offsetWidth,
          height: this.$el.offsetHeight
        })
      };
      addResizeListener(this.$el, this.resizeListener);

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
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },
    computed: {
      ...mapState(['toasts']),
      ...mapState("user", ["groupInfo"]),
      ...mapGetters({
        'collapseMenu': 'collapseMenu'
      }),
      routerPathToName() {
        return this.$router.helper.getRoutePathToName();
      },
      routePathToConfig() {
        return this.$router.helper.getRoutePathToConfig();
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
        return this.$storeHelper.groupList;
      },
      groupListByVersion() {
        var result = [{
          label: 'pass2.x团队',
          class: 'v2',
          groupList: []
        }, {
          label: 'pass1.x团队',
          class: 'v1',
          groupList: []
        }];
        this.$storeHelper.groupList.forEach(it => {
          if (it['supportVersion']) {
            switch (it['supportVersion']) {
              case '2.x':
                result[0].groupList.push(it);
                break;
              case '1.x':
                result[1].groupList.push(it);
                break;
            }
          } else {
            result[0].groupList.push(it);
          }
        });
        return result;
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
        async handler(groupId, oldValue) {
          if (!groupId) {
            return;
          }
          var groupVersion = '2.x';
          if (this.groupInfo.hasOwnProperty('supportVersion') && this.groupInfo['supportVersion'] === '1.x') {
            groupVersion = '1.x';
          }
          /**
           * all the request related with groupID will be refreshed, include:
           * 1. profileListOfGroup
           * 2. appInfoListOfGroup
           * 3. usersInGroup
           */
          try {
            // 解析app列表的时候需要profileList的相关信息，所有profile列表和app列表不能同时请求。
            const profileList = (await this.$net.requestPaasServer(this.$net.URL_LIST.profile_list_of_group, {
              payload: {
                id: groupId
              }
            }))['spaceList'];
            this.$store.dispatch('user/profileList', profileList);

            const appInfoList = await this.$store.dispatch('user/appInfoList', {
              groupId: this.$storeHelper.currentGroupID,
            });
            // 当前团队应用数为零，只能进入应用管理和添加应用页面
            if (appInfoList.total === 0) {
              this.$router.helper.updateDisabledState({
                pathList: [
                  this.$net.page['profile/app'],
                  this.$net.page['profile/app/add'],
                  // path start with profile/config-server
                  new RegExp(`^${this.$utils.escapeRegexp(this.$net.page['profile/config-server'])}.*`)
                ],
                pathType: 'exclude'
              }, {key: 'NO_APP', value: true});
            } else {
              this.$router.helper.updateDisabledState({
                pathList: [],
                pathType: 'exclude'
              }, {key: 'NO_APP', value: false});
            }

            // 1.x团队不支持：外网域名、审批管理、Access Key、团队管理
            if (groupVersion === '1.x') {
              this.$message.warning('您当前在1.x团队，部分功能正在迁移。置灰的功能暂时无法使用！');
              this.$router.helper.updateDisabledState({
                pathList: [
                  this.$net.page['profile/domain'],
                  this.$net.page['profile/work-order'],
                  this.$net.page['profile/oauth'],
                ],
                pathType: 'include'
              }, {key: 'NOT_SUPPORT_IN_1.X', value: true});
            } else {
              this.$router.helper.updateDisabledState({
                pathList: [
                ],
                pathType: 'exclude'
              }, {key: 'NOT_SUPPORT_IN_1.X', value: false});
            }
          } catch(err) {
            console.log(err);
          }
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
      onRoutePath (route, preRoute) {
//        console.log(route);
//        console.log(preRoute);
//        console.log(this.routePathToConfig);
        const path = route['path'];
        this.invalidPath = !this.routePathToConfig.hasOwnProperty(path);
        if (!this.invalidPath) {
          // whether show groupList
          let pageNotShowGroupList = ['/profile/app/add', '/profile/service/add'];
          let pageNotShowGroupListReg = /^\/profile\/(work-order\/(todo|list).*|config-server\/*)$/;
          if (pageNotShowGroupList.indexOf(path) > -1 || pageNotShowGroupListReg.exec(path)) {
            this.showGroupList = false;
          } else {
            this.showGroupList = true;
          }
          // update content of crumb list
          this.updateCrumbList(path);
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

      updatePermissionInfo() {
        const groupInfo = this.$storeHelper.groupInfo;
        const notPermittedList = this.$storeHelper.notPermitted;
      },
      /**
       * register some global variable at start of page profile
       */
      handleHeaderMenuClick(keyPath) {
        switch (keyPath) {
          case 'user/group':
          case 'user/info':
          case 'manage':
            window.open(this.$net.page[keyPath], '_blank');
            break;
          case 'profile':
            break;
          case 'user/logout':
            break;
          case 'index':
            this.$utils.goToPath('/index');
            break;
        }
      },
    }
  }
</script>
