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
      <el-menu-item index="manage" v-if="userRole && userRole=='平台管理员'"><i class="paas-icon-manage"></i><span>管理后台</span></el-menu-item>
      <el-menu-item index="profile"><i class="paas-icon-profile"></i><span>控制台</span></el-menu-item>
      <el-menu-item index="docs"><i class="paas-icon-docs"></i><span>帮助文档</span></el-menu-item>
      <el-menu-item index="message" v-show="false"><i class="paas-icon-message"></i><span>消息中心</span></el-menu-item>
      <el-submenu index="user" :withDrawOnMouseLeave="false">
        <template slot="title"><i class="paas-icon-user"></i><span>{{userName}}</span></template>
        <el-menu-item index="info"><i class="paas-icon-user"></i><span>用户中心</span></el-menu-item>
        <el-menu-item index="group" v-if="showGroupManager"><i class="paas-icon-group"></i><span>团队管理</span></el-menu-item>
        <el-menu-item index="logout"><i class="paas-icon-logout"></i><span>退出</span></el-menu-item>
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
          line-height: 32px;
          height: 32px;
          padding: 0px 8px;
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  .paas-header-profile {
    display: inline-block;
    height: 32px;
    .el-menu.horizontal-menu {
      border-bottom-width: 0px;
      padding-right: 30px;
      .el-submenu {
      }
      .el-menu-item {
        line-height: 32px;
        height: 32px;
        padding: 0px 8px;
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
      userRole: {
        type: String,
        default: ''
      },
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
      backgroundColor: {
        type: String,
        default: 'white'
      },
      showGroupManager: {
        type: Boolean,
        default: true
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
              case 'logout':
                const logout = () => {
                  this.$message({
                    type: 'success',
                    message: '退出成功',
                    duration: 500,
                    onClose: () => {
                      this.$storeHelper.logout();
                      window.location.pathname = this.$net.page['login'];
                    }
                  });
                };
                if (!this.$storeHelper.getUserInfo('token')) {
                  logout();
                  return;
                }
                if (this.$net && this.$net.URL_LIST && this.$net.URL_LIST['logout']) {
                  this.$net.requestPaasServer(this.$net.URL_LIST.logout).then(logout).catch(err => {});
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
    }
  }
</script>