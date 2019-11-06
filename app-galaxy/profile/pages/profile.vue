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
      <paas-popover-message ref="global-popover-close-on-leave" popperClass="el-popover--small is-dark"
                            placement="top" :closeDelay="0" :closeOnLeave="true"></paas-popover-message>
      <paas-popover-message ref="global-popover-close-on-delay" popperClass="el-popover--small is-dark"
                            placement="bottom" :closeDelay="1000" :closeOnLeave="false"></paas-popover-message>
      <!--popover-message-area-->

      <div class="profile header">
        <div class="header-left">
          <div class="current-step">
            <i class="paas-icon-fa-home" style="margin-right: 2px;"></i>
            <el-breadcrumb separator-class="el-icon-arrow-right" @item-click="handleBreadCrumbClick">
              <el-breadcrumb-item v-for="item in breadCrumbItemList" :key="item.fullPath" :item="item">
                <span v-if="item.messageShow" :class="['badge', 'primary', 'small', 'message-show']" style="color: #5a5e66; cursor: text; height: 14px; line-height: 14px;">{{item['label']}}</span>
                <span v-else>{{item['label']}}</span>
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div :class="['group', !showGroupList?'disabled':'']">
            <el-tooltip slot="trigger" effect="dark" placement="bottom">
              <div slot="content">
                <div>当前所在团队</div>
              </div>
              <i class="paas-icon-group"></i>
            </el-tooltip>
            <el-select  v-model="$storeHelper.currentGroupID" size="small" filterable :disabled="!showGroupList"
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
                             ref="paasHeaderProfile" :alertMessage="currentAlertMessage"
                             @menu-click="handleHeaderMenuClick" @read-message="handleReadMessage"></paas-header-profile>
      </div>
      <div v-if="showPageNotFound" class="profile content">
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
              <p class="el-loading-text">{{$net.vm.loadingText ? $net.vm.loadingText : '网络请求中...'}}</p>
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
          &.disabled {
            cursor: not-allowed;
            .paas-icon-group {
              color: #b4bccc;
            }
          }
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
  /*$main-background: #E4E7ED;*/
  $main-background: #F2F6FC;
  $main-background: #f4f5f5;
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
  import markdown from 'assets/components/markdown/markdown.js';

  export default {
    mixins: [markdown],
    components: {PageNotFound, paasHeaderProfile, paasNavBar, paasPopoverMessage},
    data() {
      return {
        showDescriptor4Header: {},
        // calc by change of screenChange or collapseMenu
        mainNodeWidth: '',
        activeSideMenuItem: this.$net.page['profile'],
        breadCrumbItemList: [],
        // 用于配置404页面的属性
        routeConfig: null,
        showPageNotFound: false,
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

        notPermitted: [],

        alertMessageQueen: [],
        currentAlertMessage: null,
      }
    },
    created() {
      // 如果是游客，token无效
      if (this.$storeHelper.isGuest) {
        window.location.href = this.$net.page['index'];
        return;
      }

      // 初始化权限信息(避免出现'can not read disabled of undefined')
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
        // trigger change of currentGroupId
//        this.$store.dispatch('user/groupId', this.$storeHelper.currentGroupID);
      }).catch(err => {
        console.log(err);
        // requestPaasServer已经给出提示，不需重复提示
//        this.$notify.error({
//          title: '配置信息获取失败，请刷新页面重试',
//          message: err.message,
//          duration: 0,
//        });
      });
      this.showDescriptor4Header = {
        'manage': this.$storeHelper.getUserInfo('role') && this.$storeHelper.getUserInfo('role') === '平台管理员',
        'profile': false,
        'user/feedback': true
      };
      this.requestAndHandleMessage();
      this.getPublishStatus();
    },
    mounted() {
      this.resizeListener = () => {
        this.$storeHelper.screen = {
          width: this.$el.offsetWidth,
          height: this.$el.offsetHeight
        };
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

      this.onRouteChange(this.$route);

      // set value of globalPopover to $storeHelper.globalPopover
      this.$storeHelper.globalPopover = this.$refs['global-popover-close-on-leave'];
      this.$storeHelper.globalTip = this.$refs['global-popover-close-on-delay'];

      //这个定时器是用来轮询消息的，看有没有alert类型的消息
      this.requestAndHandleMessage();
      //这个定时器是用来轮询后台发布情况的，看是否正在发布
      this.getPublishStatus();
      setInterval(() => {
        //这个定时器是用来轮询消息的，看有没有alert类型的消息
        this.requestAndHandleMessage();
        //这个定时器是用来轮询后台发布情况的，看是否正在发布
        this.getPublishStatus();
      }, 1.5 * 60 * 1000);
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
          // label: '== pass2.x新团队 ==',
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
      '$route': 'onRouteChange',
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

            var resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.app_list_by_group, {
              payload: {
                groupId: groupId
              }
            });
            const appInfoListOfGroup = await this.$net.parseAppListV2(resContent, profileList);
            this.$store.dispatch('user/appInfoList', appInfoListOfGroup);
            // 更新（1.x支持、权限）相关信息
            this.updatePermissionInfo();
            this.$storeHelper.promiseChangeGroup.resolve && this.$storeHelper.promiseChangeGroup.resolve();
          } catch(err) {
            this.$storeHelper.promiseChangeGroup.reject && this.$storeHelper.promiseChangeGroup.reject();
            console.log(err);
          }
        }
      },
      '$storeHelper.appInfoListOfGroup': function (appInfoList) {
        if (appInfoList) {
          this.updatePermissionInfo();
        }
      },
      'notPermitted': 'updatePermissionInfo'
    },
    methods: {
      // set el-menu profile as active menu of paasHeaderProfile
      setDefaultActiveForHeader() {
        if (this.$refs.hasOwnProperty('paasHeaderProfile') && this.$refs['paasHeaderProfile']) {
          this.$refs['paasHeaderProfile'].setActiveMenu('profile');
        }
      },
      onRouteChange (route, preRoute) {
//        console.log(route);
//        console.log(preRoute);
        const path = route['path'];
        this.routeConfig = this.$router.helper.getConfigByRoutePath(path);
        if (this.routeConfig) {
          this.showPageNotFound = false;
          // whether show groupList
          const pageNotShowGroupList = ['/profile/app/add', '/profile/service/add', '/profile/service/copy',
            '/profile/service/modify', '/profile/service/detail', '/profile/image/repo/version',
            '/profile/domain/white-list', '/profile/pipeline/records'];
          const pageNotShowGroupListRegList = [
            /^\/profile\/(work-order\/(todo|list).*|config-server\/*)$/,
            /^\/profile\/pipeline\/(add|modify).*/
          ].concat([
            '/profile/service/:id(\\d+)/gray',
            '/profile/service/:id(\\d+)/gray/add',
            '/profile/service/:id(\\d+)/gray/modify'
          ].map(it => this.$router.helper.getConfigByFullPath(it)).map(it => it.pathReg));

          if (pageNotShowGroupList.indexOf(path) > -1 || pageNotShowGroupListRegList.find(reg => reg.test(path))) {
            this.showGroupList = false;
          } else {
            this.showGroupList = true;
          }
          // update content of breadcrumb list
          this.updateBreadCrumbList(path);
        } else {
          // 延迟2s展示page-not-found页面
          setTimeout(() => {
            this.showPageNotFound = this.$router.helper.getConfigByRoutePath(this.$route['path']) ? false : true;
          }, 2000);
        }
      },

      /**
       * update crumb list
       */
      updateBreadCrumbList(path) {
        if (!path.startsWith('/')) {
          return;
        }
        var activeSideMenuItem = null;
        ['profile/app', 'profile/service', 'profile/instance', 'profile/domain', 'profile/log', 'profile/work-order',
          'profile/monitor', 'profile/oauth', 'profile/config-server', 'profile/image/repo', 'profile/middleware/mariadb',
          'profile/middleware/redis', 'profile/pipeline'].map(it => {
            return this.$net.page[it];
        }).some(it => {
          if (path.startsWith(it)) {
            activeSideMenuItem = it;
          }
          return activeSideMenuItem;
        });
        this.activeSideMenuItem = activeSideMenuItem;

        const pathList = path.split('/');
        this.breadCrumbItemList = [];
        while (pathList.length > 0) {
          const partialPath = pathList.join('/');
          const routeConfig = this.$router.helper.getConfigByRoutePath(partialPath);
          if (routeConfig && routeConfig.hasOwnProperty('label')) {
            if (routeConfig.messageShow) {
              routeConfig.label = '---';
            }
            this.breadCrumbItemList.unshift(routeConfig);
          }
          pathList.pop();
        }
        // console.log(this.breadCrumbItemList)
      },
      handleBreadCrumbClick(item) {
        if (item.messageShow === true) {
          return;
        }
        const path = this.$route.path;
        const pathList = path.split('/');
        if (item.pathReg.test(path)) {
          return;
        }
        while (pathList.length > 0) {
          if(item.pathReg.test(pathList.join('/'))) {
            break;
          }
          pathList.pop();
        }
        if (pathList.length === 0) {
          console.log('path match error');
          this.$router.push(this.$router.helper.pages['profile'])
        } else {
          this.$router.push(pathList.join('/'));
        }
      },

      // 初始化部分权限相关信息（权限的更新在网络请求完成后，不初始化会导致无法访问，报错：undefined）
      initPermissionInfo() {
        const permission = {};
        // TODO: can be replaced by reason4ActionDisabled in $storeHelper
        const pageApp = ['app_change_name', 'app_show_profile', 'app_change_props'];
        const pageService = ['copy-service',
          'go-to-page-log-deploy-from-service', 'go-page-domain-from-service', 'go-page-domain-from-service-list'];
        const pageWorkOrder = ['work-order_restart_service'];
        const allPermissionList1 = [...pageApp, ...pageService, ...pageWorkOrder];
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
//        console.log(permission);
        this.$storeHelper.permission = permission;
      },

      // 更新权限信息：页面访问权限；按钮点击权限。
      // at change of: $storeHelper.appInfoListOfGroup, notPermitted, $storeHelper.groupInfo.id
      updatePermissionInfo() {
        this.initPermissionInfo();
        const appInfoListOfGroup = this.$storeHelper.appInfoListOfGroup;
//        console.log('appInfoListOfGroup');
//        console.log(appInfoListOfGroup);
        if (!appInfoListOfGroup || !this.notPermitted) {
          return;
        }
        if (appInfoListOfGroup.total === 0) {
          // 当前团队应用数为零，能进入如下页面
          this.$router.helper.updateDisabledState({
            pathList: [
              // 应用列表
              this.$net.page['profile/app'],
              // 添加应用
              this.$net.page['profile/app/add'],
              // 外网域名
              new RegExp(`^${this.$utils.escapeRegexp(this.$net.page['profile/domain'])}.*`),
              // 审批管理
              new RegExp(`^${this.$utils.escapeRegexp(this.$net.page['profile/work-order'])}.*`),
              // Access Key管理
              new RegExp(`^${this.$utils.escapeRegexp(this.$net.page['profile/oauth'])}.*`),
              // 镜像中心
              new RegExp(`^${this.$utils.escapeRegexp(this.$net.page['profile/image'])}.*`),
              // 中间件
              new RegExp(`^${this.$utils.escapeRegexp(this.$net.page['profile/middleware'])}.*`),
              // pipeline
              new RegExp(`^${this.$utils.escapeRegexp(this.$net.page['profile/pipeline'])}.*`),
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
          // this.$message.warning('您当前在1.x团队，部分功能正在迁移。置灰的功能暂时无法使用！');
          this.$router.helper.updateDisabledState({
            pathList: [
              this.$net.page['profile/domain'],
              this.$net.page['profile/work-order'],
              // path start with /profile/oauth
              // new RegExp(`^${this.$utils.escapeRegexp(this.$net.page['profile/oauth'])}.*`)
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
            if ('app_create' === it) {
              permission[it]['reason'] = '不能创建新应用，需要先迁移到云平台2.0，请联系Paas团队。';
            } else {
              permission[it]['reason'] = '1.x团队无法使用';
            }
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
          case 'user/feedback':
          case 'user/message':
          case 'user/operation':
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

      //获取消息数量，以及对alert类型的消息进行弹窗
      async requestAndHandleMessage() {
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.message_unread_count);
        this.alertMessageQueen = [];
        this.messageCountTip = resContent.length;
        resContent.forEach(it => {
          if (it.messageType === "ALERT") {
            try {
              it.htmlContent = this.$render(it.content);
            } catch (err) {
              it.htmlContent = '';
            }
            this.alertMessageQueen.push(it);
          }
        });
        this.currentAlertMessage = this.alertMessageQueen.pop();
        // if (!this.currentAlertMessage || !this.alertMessageQueen.find(it => {
        //       return it.id === this.currentAlertMessage.id;
        //     })
        // ) {
        //   let length = this.alertMessageQueen.length;
        //   this.currentAlertMessage = length === 0 ? null : this.alertMessageQueen[length - 1];
        // }
      },

      //这个方法是用来确认是否正在发布的，对于正在发布的，禁用创建服务，复制服务，删除服务，创建公网域名，绑定，解除绑定公网域名。禁用所有环境的服务的部署，重启，实例动态伸缩。
      getPublishStatus() {
        this.$net.getPublishStatus().then(result => {
          this.$storeHelper.publishStatus = result && result == "true" ? true : false ;
        })
      },

      handleReadMessage(messageId) {
        this.messageCountTip -= 1;
        this.currentAlertMessage = this.alertMessageQueen.pop();
      }
    }
  }
</script>
