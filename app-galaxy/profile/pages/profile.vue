<template>
  <div id="profile" :class="['spa', $storeHelper.groupVersion]">
    <paas-nav-bar :activeSideMenuItem="activeSideMenuItem"></paas-nav-bar>
    <main :style="{width: mainNodeWidth ? mainNodeWidth+'px':''}">
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
      <!--popover-message-area-->
      <paas-popover-message ref="global-popover" popperClass="el-popover--small is-dark"
                            placement="top" :closeDelay="0" :closeOnLeave="true"></paas-popover-message>
      <!--popover-message-area-->

      <div class="profile header">
        <div class="header-left">
          <div class="current-step">
            <i class="paas-icon-fa-home" style="margin-right: 2px;"></i>
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item v-for="item in crumbList" :key="item" :to="{path: item}">
                {{routerPathToName[item]}}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="group">
            <el-tooltip slot="trigger" effect="dark" placement="bottom">
              <div slot="content">
                <div>当前所在团队</div>
              </div>
              <i class="paas-icon-group"></i>
            </el-tooltip>
            <el-select  v-model="$storeHelper.currentGroupID" size="mini" filterable :disabled="!showGroupList"
                        :placeholder="(groupList && groupList.length > 0) ? '请选择':'无数据'">
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
            <div class="no-select" v-if="false">
              <span :title="`${$storeHelper.groupInfo ? $storeHelper.groupInfo['asLabel'] : ''}`">{{$storeHelper.groupInfo ? $storeHelper.groupInfo['asLabel'] : ''}}</span>
            </div>
          </div>
        </div>
        <paas-header-profile :showDescriptor="showDescriptor4Header" class="header-right"
                             :userName="userName" :messageCountTip="messageCountTip" backgroundColor="#fafafa"
                             ref="paasHeaderProfile"
                             @menu-click="handleHeaderMenuClick"></paas-header-profile>
      </div>
      <div v-if="!routeConfig" class="profile content">
        <page-not-found :navigateList="navigateList"></page-not-found>
      </div>
      <div class="profile content" v-else>
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
  #profile {
    .profile.header {
      background-color: #fafafa;
      border-bottom: 1px solid rgb(235, 235, 235);
      display: flex;
      justify-content: space-between;
      .header-left {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: transparent;
        height: 32px;
        .current-step {
          padding-left: 6px;
          .el-breadcrumb {
            font-size: 14px;
            display: inline-block;
            .el-breadcrumb__item {
              .el-breadcrumb__separator {
                margin: 0px;
              }
              .el-breadcrumb__inner, .el-breadcrumb__inner a {
                font-weight: normal;
                color: #409EFF
              }
              &:last-child {
                .el-breadcrumb__inner, .el-breadcrumb__inner a {
                  color: #5a5e66;
                }
              }
            }
          }
        }
        .group {
          .el-select {
            width: 240px;
            .el-input {
              &.is-disabled {
                &:hover, &.is-focus {
                  .el-input__inner {
                    border-bottom-color: transparent;
                  }
                }
              }
              &:hover, &.is-focus {
                .el-input__inner {
                  border-bottom: 1px solid black;
                }
              }
            }
            .el-input__inner {
              border-width: 0px;
              border-bottom: 1px solid transparent;
              border-radius: 0px;
              height: 32px;
              background-color: #fafafa;
            }
          }
          .no-select {
            display: inline-block;
            width: 240px;
            box-sizing: border-box;
            height: 32px;
            font-size: 12px;
            color: #5a5e66;
            line-height: 32px;
            padding: 0px 30px 0px 10px;
            text-align: start;
            text-indent: 0px;
            text-rendering: auto;
            text-shadow: none;
            text-transform: none;
            font-weight: 400;

            span {
              width: 100%;
              display: inline-block;
              overflow: hidden;
              white-space: nowrap;
              word-wrap: break-word;
              word-break: break-all;
              text-overflow: ellipsis;
            }
            &:hover {
              /*z-index: 50;*/
              /*overflow: visible;*/
            }
          }
        }
      }
      .paas-header-profile {
        display: inline-block;
      }
    }
    &.v1 {
      .header-left {
        .group {
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

  /*parent of popper for el-select is body */
  #paas {
    .el-select-dropdown.el-popper {
      .el-select-group__wrap:not(:last-of-type)::after {
        content: '';
        position: absolute;
        display: block;
        left: 5px;
        right: 5px;
        bottom: 12px;
        height: 1px;
        background: #dfe4ed;
      }
      .el-select-group__wrap {
        .el-select-group__title {
          color: #F56C6C;
        }
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
  }
</style>
<style lang="scss" scoped>
  $main-background: #F2F6FC;
  /*$main-background: #E4E7ED;*/
  #profile {
    height: 100%;
    display: flex;
    flex-direction: row;
    min-width: 1000px;
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: $main-background;
      height: 100%;
      .content {
        flex: 1;
        padding: 0px;
        /*height: 100%;*/
        height: calc(100% - 33px);
        .child {
          position: relative;
          height: 100%;
          padding: 5px;
          box-sizing: border-box;
          overflow: scroll;
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
  import paasPopoverMessage from 'assets/components/popover-message';

  export default {
    components: {PageNotFound, paasHeaderProfile, paasNavBar, paasPopoverMessage},
    data() {
      return {
        showDescriptor4Header: {},
        // calc by change of screenChange or collapseMenu
        mainNodeWidth: '',
        activeSideMenuItem: this.$net.page['profile'],
        crumbList: [],
        // 用于配置404页面的属性
        routeConfig: null,
        navigateList: [{
          href: this.$net.page['profile/app'],
          label: '应用引擎'
        }, {
          href: this.$net.page['profile/oauth'],
          label: 'AccessKey管理'
        }, {
          href: this.$net.page['profile/config-server'],
          label: '应用配置'
        }],
        showGroupList: true,
        messageCountTip: 0,

        notPermitted: []
      }
    },
    created() {
      // 初始化权限信息
      this.initPermissionInfo();
      // 获取页面相关配置
      Promise.all([
        this.$net.requestPaasServer(this.$net.URL_LIST.user_group_list),
        this.$net.requestPaasServer(this.$net.URL_LIST.config_query),
        this.$net.requestPaasServer(this.$net.URL_LIST.user_not_permitted)
      ]).then(resContentList => {
        // groupList
        const groupList = resContentList[0].groupList.map(it => {
           it.asLabel = `${it.name} (${it.tag})`;
          return it;
        });

        this.$store.dispatch('user/groupList', groupList);

        // app config related
        const configList = this.$net.parseConfigList(resContentList[1]);
        this.$store.dispatch('app/globalConfig', configList);

        // permission
        this.notPermitted = this.$net.parseNotPermittedCommands(resContentList[2]);
        this.$router.helper.addPermission(this.notPermitted);
//        console.log(this.notPermitted);
        // trigger change of currentGroupId
//        this.$store.dispatch('user/groupId', this.$storeHelper.currentGroupID);
      }).catch(err => {
        console.log(err);
        this.$notify.error({
          title: '配置信息获取失败，请刷新页面重试',
          message: err.message,
          duration: 0,
        });
      });
      this.showDescriptor4Header = {
        'manage': this.$storeHelper.getUserInfo('role') && this.$storeHelper.getUserInfo('role') === '平台管理员',
        'profile': false
      };

      this.$net.requestPaasServer(this.$net.URL_LIST.message_unread_count, {}).then(resContent => {
        this.messageCountTip = resContent;
      }).catch(() => {
        this.messageCountTip = 0;
      }).finally(() => {});
    },
    mounted() {
      this.resizeListener = () => {
        this.$store.dispatch('setScreenSize', {
          width: this.$el.offsetWidth,
          height: this.$el.offsetHeight
        });
        this.mainNodeWidth =  this.$el.offsetWidth - this.$storeHelper.navMenuWidth;
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

      // set value of globalPopover to $storeHelper.globalPopover
      const globalPopover = this.$refs['global-popover'];
      this.$storeHelper.globalPopover = globalPopover;
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
      groupList() {
        return this.$storeHelper.groupList;
      },
      groupListByVersion() {
        var result = [{
          label: '== pass2.x新团队 ==',
          class: 'v2',
          groupList: []
        }, {
          label: '== pass1.x老团队 ==',
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
      'collapseMenu': function() {
        this.mainNodeWidth =  this.$el.offsetWidth - this.$storeHelper.navMenuWidth;
      },
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
            // 更新（1.x支持、权限）相关信息
            this.updatePermissionInfo();
          } catch(err) {
            console.log(err);
          }
        }
      },
      '$storeHelper.appInfoListOfGroup': function (appInfoList) {
        if (appInfoList) {
          this.updatePermissionInfo();
        }
      }
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
        this.routeConfig = this.$router.helper.getConfigByRouterPath(path);
        console.log(path);
        if (this.routeConfig) {
          // whether show groupList
          let pageNotShowGroupList = ['/profile/app/add', '/profile/service/add', '/profile/image/repo/version'];
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
        var activeSideMenuItem = null;
        ['profile/app', 'profile/service', 'profile/instance', 'profile/domain', 'profile/log', 'profile/work-order',
          'profile/monitor', 'profile/oauth', 'profile/config-server', 'profile/image/repo'].map(it => {
            return this.$net.page[it];
        }).some(it => {
          if (path.startsWith(it)) {
            activeSideMenuItem = it;
          }
          return activeSideMenuItem;
        });
        this.activeSideMenuItem = activeSideMenuItem;

        const pathList = path.split('/');
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

      // 初始化部分权限相关信息（权限的更新在网络请求完成后，不初始化会导致无法访问，报错：undefined）
      initPermissionInfo() {
        const permission = {};
        const pageApp = ['app_create', 'app_change_name', 'app_delete', 'app_change_profile'];
        const pageService = ['service_create', 'service_deploy', 'service_stop', 'service_delete', 'copy-service',
          'go-to-page-log-deploy-from-service', 'go-page-domain-from-service', 'go-page-domain-from-service-list',
          'service_update', 'service_change_default'];
        const pageInstance = ['instance_change_count', 'instance_replace', 'go-to-page-terminal-from-instance',
          'go-to-log-run-from-instance', 'go-to-page-monitor-from-instance'];
        const pageDomain = ['domain_add', 'domain_bind_service', 'domain_unbind_service', 'domain_secure_check',
        'domain_remove', 'domain_bind_white_list'];
        const pageWorkOrder = ['go-to-page-log-deploy-from-work-order-list', 'work-order_create', 'work-order_deploy_service', 'work-order_restart_service'];
        const pageOauth = ['oauth_create_access_key', 'oauth_update_access_config', 'oauth_delete_access_key',
          'oauth_modify_authorize_url_list',
          'oauth_authorize_url_toggle_enable'];
        const allPermissionList1 = [...pageApp, ...pageService, ...pageInstance, ...pageDomain, ...pageWorkOrder, ...pageOauth];
        const permissionMap = this.$net.getPermissionMap();
        const allPermissionList = [];
        Object.keys(permissionMap).forEach(it => {
//          console.log(`${it} -> ${permissionMap[it]}`);
          allPermissionList.push(permissionMap[it])
        });

        Array.from(new Set(allPermissionList.concat(allPermissionList1))).forEach(it => {
          permission[it] = {
            disabled: false,
            hide: false,
            reason: ''
          }
        });
//        allPermissionList1.forEach(it => {
//          if (allPermissionList.indexOf(it) === -1) {
//            console.log(it);
//          }
//        });
        this.$storeHelper.permission = permission;
      },

      // 更新权限信息：页面访问权限；按钮点击权限。
      updatePermissionInfo() {
        this.initPermissionInfo();
        // 当前团队应用数为零，只能进入应用管理和添加应用页面
        const appInfoListOfGroup = this.$storeHelper.appInfoListOfGroup;
//        console.log('appInfoListOfGroup');
//        console.log(appInfoListOfGroup);
        if (appInfoListOfGroup.total === 0) {
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

        const groupVersion = this.$storeHelper.groupVersion;
        // 1.x团队不支持：外网域名、审批管理、Access Key、团队管理
        if (groupVersion === 'v1') {
          this.$message.warning('您当前在1.x团队，部分功能正在迁移。置灰的功能暂时无法使用！');
          this.$router.helper.updateDisabledState({
            pathList: [
              this.$net.page['profile/domain'],
              this.$net.page['profile/work-order'],
              // path start with /profile/oauth
              new RegExp(`^${this.$utils.escapeRegexp(this.$net.page['profile/oauth'])}.*`)
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

        // update this.$storeHelper.permission
        const permission = this.$storeHelper.permission;
        const notSupportedByV2 = ['app_create', 'app_delete', 'app_change_profile',
          'service_create', 'service_delete', 'copy-service', 'go-page-domain-from-service-list', 'go-page-domain-from-service',
        'go-to-log-run-from-instance'];
        if (groupVersion === 'v1') {
          notSupportedByV2.forEach(it => {
            permission[it]['disabled'] = true;
            permission[it]['hide'] = false;
            permission[it]['reason'] = '1.x团队无法使用';
          })
        }
        this.notPermitted.forEach(it => {
          permission[it]['disabled'] = true;
          permission[it]['hide'] = false;
          permission[it]['reason'] = '您无权使用该功能';
        });
//        console.log(permission);
      },

      /**
       * register some global variable at start of page profile
       */
      handleHeaderMenuClick(keyPath) {
        switch (keyPath) {
          case 'user/group':
          case 'user/info':
          case 'user/message':
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
