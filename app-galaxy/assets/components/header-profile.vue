<template>
  <div class="paas-header-profile">
    <el-menu class="horizontal-menu"
             mode="horizontal"
             menuTrigger="hover"
             @select="handleMenuClick"
             :defaultActive="defaultActive"
             ref="menu"
             :backgroundColor="backgroundColor"
             text-color="#909399"
             active-text-color="#000"
             v-clickoutside="handleClickOutsideMenu"
    >
      <el-menu-item index="manage" v-if="show['manage']"><i class="paas-icon-manage"></i><span>管理后台</span></el-menu-item>
      <el-menu-item index="profile" v-if="show['profile']"><i class="paas-icon-profile"></i><span>控制台</span></el-menu-item>
      <el-menu-item index="docs" v-if="show['docs']"><i class="paas-icon-docs"></i><span>帮助文档</span></el-menu-item>
      <el-popover
                placement="bottom"
                width="300"
                trigger="manual"
                ref="popover_alert"
                :title="alertMessage ? alertMessage.title : ''">
        <div class="content-alert">{{alertMessage ? alertMessage.content : ''}}</div>
        <el-button type="primary" size="mini" @click="readMessage()">已阅</el-button>
        <el-menu-item index="user/message" v-if="show['user/message']" slot="reference"><i class="paas-icon-message"></i><span>消息</span>
          <span class="badge danger" v-if="messageCountTip > 0">{{messageCountTip}}</span></el-menu-item>
      </el-popover>
      <el-submenu index="user" :withDrawOnMouseLeave="false">
        <template slot="title"><i class="paas-icon-user"></i><span>{{userName}}</span></template>
        <el-menu-item index="info" v-if="show['user/info']"><i class="paas-icon-user"></i><span>用户中心</span></el-menu-item>
        <el-menu-item index="group" v-if="show['user/group']"><i class="paas-icon-group-1"></i><span>团队管理</span></el-menu-item>
        <el-menu-item index="operation" v-if="show['user/operation']"><i class="paas-icon-log"></i><span>操作记录</span></el-menu-item>
        <el-menu-item index="logout" v-if="show['user/logout']"><i class="paas-icon-logout"></i><span>退出</span></el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<style lang="scss">
  $header-height: 32px;
  .paas-header-profile {
    .el-menu.horizontal-menu {
      .el-submenu {
        & > .el-menu {
          top: 33px;
        }
        .el-submenu__title {
          line-height: 30px;
          height: 32px;
          padding: 0px 8px;
        }
      }
    }
  }
  .el-popover {
    .el-button {
      float: right;
    }
    .content-alert {
      margin-bottom: 10px;
    }
  }
</style>
<style lang="scss" scoped>
  @mixin el-menu-item() {
    font-size: 14px;
    line-height: 30px;
    height: 32px;
    padding: 0px 8px;
  }
  .paas-header-profile {
    display: inline-block;
    height: 32px;
    .el-menu.horizontal-menu {
      border-bottom-width: 0px;
      padding-right: 30px;
      .el-submenu {
        .el-menu-item {
          @include el-menu-item
        }
      }
      .el-menu-item {
        @include el-menu-item
      }
    }
  }
</style>

<script>
  import Clickoutside from 'element-ui/src/utils/clickoutside';
  /**
   * this component is used in page:
   * profile, manage, user
   */
  export default {
    directives: { Clickoutside },
    props: {
      userName: {
        type: String,
        default: '更多'
      },
      defaultActive: {
        type: String,
        default: 'index'
      },
      showImg: {
        type: Boolean,
        default: true
      },
      messageCountTip: {
        type: Number,
        default: 0
      },
      alertMessage: {
        type: Object,
        default: null
      },
      backgroundColor: {
        type: String,
        default: 'white'
      },
      showDescriptor: {
        type: Object,
        default(){
          return {
          }
        }
      }
    },
    mounted() {
      this.show = Object.assign(this.show, this.showDescriptor);
    },
    watch: {
      "alertMessage": function (alertMessage) {
        let popoverAlert = this.$refs["popover_alert"];
        if (!alertMessage) {
          popoverAlert.doClose();
        } else {
          popoverAlert.doShow();
        }
      }
    },
    data() {
      return {
        show: {
          manage: false,
          profile: true,
          docs: true,
          'user/info': false,
          'user/message': true,
          'user/group': true,
          'user/operation': true,
          'user/logout': true
        }
      }
    },
    computed: {
      userInfo() {
        return this.$storeHelper.userInfo;
      }
    },
    methods: {
      handleMenuClick(key, keyPath) {
        const keyAll = keyPath.join('/');
        if (keyPath.length === 0) {
          return;
        }
        const key1 = keyPath[0];
        const key2 = keyPath.length > 1 ? keyPath[1] : '';
        switch (key1) {
          case 'docs':
            window.open(this.$net.page[key1], '_blank');
//            window.location.pathname = this.$net.page[key1];
            break;
          case 'manage':
          case 'profile':
          case 'user/message':
            this.$emit('menu-click', key1);
            break;
          case 'user':
            switch (key2) {
              case 'info':
                this.$emit('menu-click', keyAll);
                break;
              case 'group':
                this.$emit('menu-click', keyAll);
                break;
              case 'operation':
                this.$emit('menu-click', keyAll);
                break;
              case 'logout':
                // 登出步骤：1. 清理本地用户信息；2. 向服务器发送登出请求
                const logout = () => {
                  this.$message({
                    type: 'success',
                    message: '退出成功',
                    duration: 500,
                    onClose: () => {
                      // step 2
                      this.$storeHelper.logout();
                      const targetHref = this.$net.getCasLogoutHref();
                      window.location.href = targetHref;
                    }
                  });
                };
                if (this.$net && this.$net.URL_LIST && this.$net.URL_LIST['logout']) {
                  // step 1
                  // 不论网络请求成功与否，都会调用logout方法
                  this.$net.requestPaasServer(this.$net.URL_LIST.logout).then(logout).catch(logout);
                  // 最多等待1.5秒
                  setTimeout(logout, 1500);
                } else {
                  this.$emit('menu-click', keyAll);
                }
                break;
            }
            break;
          default:
            this.$emit('menu-click', keyAll);
        }
      },
      handleClickOutsideMenu() {
        this.$refs['menu'].openedMenus = [];
      },
      setActiveMenu(index) {
        if (this.$refs.hasOwnProperty('menu')) {
          this.$refs['menu'].activeIndex = index;
        }
      },

      readMessage() {
        const resContent = this.$net.requestPaasServer(this.$net.URL_LIST.message_mark_read, {
          query: {
            messageId: this.alertMessage.id,
          }
        });
        this.$emit('read-message',this.alertMessage.id);
      }
    }
  }
</script>