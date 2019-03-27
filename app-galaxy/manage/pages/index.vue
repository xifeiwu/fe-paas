<template>
  <div id="manage" class="spa">
    <paas-nav-bar :activeSideMenuItem="activeSideMenuItem"></paas-nav-bar>
    <main :style="{width: mainNodeWidth ? mainNodeWidth+'px':''}">
      <!--toasts-area-->
      <div class="header">
        <div></div>
        <paas-header-profile :showDescriptor="showDescriptor4Header" :userName="userName" backgroundColor="#fafafa"
                             ref="paasHeaderProfile" :messageCountTip="messageCountTip"
                             defaultActive="manage" @menu-click="handleHeaderMenuClick"></paas-header-profile>
      </div>
      <div class="content">
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

  #manage {
    height: 100%;
    display: flex;
    flex-direction: row;
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: calc(100% - 200px);
      background: $main-background;
      transition: width 0.3s ease-out;
      height: 100%;
      .header {
        display: flex;
        justify-content: space-between;
        background-color: #fafafa;
        border-bottom: 1px solid rgb(235, 235, 235);
        .paas-header-profile {
        }
      }
      .content {
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
          /*height: calc(100% - 32px);*/
          height: 100%;
          box-sizing: border-box;
          padding: 5px;
          overflow: scroll;
        }
      }
    }
  }
</style>

<script>
  import {mapState, mapGetters} from 'vuex';
  import paasHeaderProfile from 'assets/components/header-profile';
  import paasNavBar from './nav-bar.vue';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';

  export default {
    components: {paasHeaderProfile, paasNavBar},
    data() {
      return {
        // 未读消息
        messageCountTip: 0,
        showDescriptor4Header: {},
        // calc by change of screenChange or collapseMenu
        mainNodeWidth: '',
        activeSideMenuItem: '/manage',
        crumbList: [],
      }
    },
    created() {
      const role = this.$storeHelper.userInfo.role;
      // 如果是游客，token无效
      const isGuest = role === 'guest';
      if (isGuest) {
        window.location.href = this.$net.page['index'];
        return;
      }
      this.$net.requestPaasServer(this.$net.URL_LIST.message_unread_count, {}).then(resContent => {
        this.messageCountTip = resContent;
      }).catch(() => {
        this.messageCountTip = 0;
      }).finally(() => {});
      Promise.all([
        this.$net.requestPaasServer(this.$net.URL_LIST.lob_list),
        this.$net.requestPaasServer(this.$net.URL_LIST.scrum_list),
        this.$net.requestPaasServer(this.$net.URL_LIST.group_list_all),
        this.$net.requestPaasServer(this.$net.URL_LIST.profile_list_all)
      ]).then(resContentList => {
        const lobList = resContentList[0]['lobList'];
        const scrumList = resContentList[1]['scrumList'];
        const groupList = resContentList[2]['groupList'];
        const profileListAll = resContentList[3]['allSpace'];
        this.$store.dispatch('lobList', lobList);
        this.$store.dispatch('scrumList', scrumList);
        this.$store.dispatch('groupListAll', groupList);
        this.$store.dispatch('profileListAll', profileListAll);
      }).catch(err => {
      });
      this.onRoutePath(this.$route);
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

      if (this.$storeHelper.getUserInfo('role') !== '平台管理员') {
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
      this.showDescriptor4Header = {
        'manage': false,
      };
    },
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },
    computed: {
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
      },
      '$storeHelper.currentLobId': async function (lobId) {
        console.log(lobId);
      },
//      '$storeHelper.currentScrumList': function (scrumList) {
//        console.log('currentScrumList');
//        console.log(scrumList);
//      },
//      '$store.state.scrumListByLobId': function (scrumList) {
//        console.log('scrumListByLobId');
//        console.log(scrumList);
//      }
    },
    methods: {
      // set el-menu profile as active menu of paasHeaderProfile
      setDefaultActiveForHeader() {
        if (this.$refs.hasOwnProperty('paasHeaderProfile') && this.$refs['paasHeaderProfile']) {
          this.$refs['paasHeaderProfile'].setActiveMenu('manage');
        }
      },
      onRoutePath (value, oldValue) {
        let path = value.path;
        if (path && path.length > 0) {
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
        // url中只能包括：\w(字母或数字、下划线、汉字)或中划线
//        let pathConcat = '';
//        this.crumbList = [];
//        path.split('/').filter(it => {
//          return it.length > 0
//        }).map(it => {
//          return '/' + it
//        }).forEach((it, index) => {
//          if (0 === index) {
//            this.activeSideMenuItem = it;
//          }
//          pathConcat += it;
//          if (pathConcat in this.routerPathToName) {
//            this.crumbList.push(pathConcat);
//          }
//        });
        this.activeSideMenuItem = path;
      },
      /**
       * register some global variable at start of page profile
       */
      handleHeaderMenuClick(keyPath) {
        switch (keyPath) {
          case 'user/group':
          case 'user/message':
          case 'user/info':
          case 'profile':
            window.open(this.$net.page[keyPath], '_blank');
            break;
          case 'manage':
            break;
          case 'index':
//            this.$utils.goToPath('/index');
            break;
        }
      },
    }
  }
</script>
