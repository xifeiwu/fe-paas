<template>
  <div id="user" class="main spa" direction="vertical">
    <div class="header">
      <div class="img" @click="handleHeaderMenuClick('index')">
        <img src="/assets/imgs/finup-cloud.png">
      </div>
      <paas-header-profile :showDescriptor="showDescriptor4Header" :userName="userName"  defaultActive="info" backgroundColor="#fafafa"
                           @menu-click="handleHeaderMenuClick"></paas-header-profile>
    </div>
    <div class="content">
      <div class="container">
        <div class="left">
          <div class="user-info">
            <div class="bg" style="background-image: url(/assets/imgs/coding.jpeg);"></div>
            <div class="info">
              <img src="/assets/imgs/coder.jpg" v-if="false">
              <p class="user-name">{{userName}}</p>
              <p class="user-role">用户角色：{{userRole}}</p>
            </div>
          </div>
          <div class="commands">
            <ul>
              <li v-for="(item, index) in commandList" :class="{'is-active': item.isActive}"
                  :key="index" @click="handleCommands(item)">
                <i class="el-icon-arrow-right" v-if="item.isActive"></i>
                <span class="text">{{item.name}}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="right">
          <div class="detail">
            <div class="el-loading-mask" v-if="$net.vm.requestingUrlListLength > 0">
              <div class="el-loading-spinner">
                <i class="el-icon-loading"></i>
                <p class="el-loading-text">{{$net.vm.loadingText ? $net.vm.loadingText : '网络请求中...'}}</p>
              </div>
            </div>
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  $header-height: 45px;
  $header-background-color: #3976EF;
  $header-background-color: #e7e7e7;
  $split-line-color: #e7e7e7;
  $aside-width: 180px;
  #user.main {
    display: flex;
    flex-direction: column;
    background: #f5f8fa;
    height: 100%;
    .header {
      background-color: #fafafa;
      border-bottom: 1px solid rgb(235, 235, 235);
      display: flex;
      justify-content: space-between;
      .img {
        line-height: 32px;
        cursor: pointer;
        img {
          height: 24px;
          margin-left: 8px;
          margin-top: -2px;
          vertical-align: middle;
        }
      }
      .paas-header-profile {
        display: inline-block;
      }
    }
    .content {
      flex: 1;
      height: calc(100% - 55px);
      .container {
        display: flex;
        margin: 0px auto;
        margin-top: 8px;
        height: calc(100% - 8px);
        @media (min-width: 992px) {
          max-width: 990px;
        }
        @media (min-width: 1100px) {
          max-width: 1080px;
        }
        @media (min-width: 1200px) {
          max-width: 1180px;
        }
        @media (min-width: 1300px) {
          max-width: 1280px;
        }
        @media (min-width: 1400px) {
          max-width: 1380px;
        }
        @media (min-width: 1500px) {
          max-width: 1480px;
        }
        @media (min-width: 1600px) {
          max-width: 1580px;
        }
        .left {
          /*flex: 0 0 25%;*/
          width: 25%;
          padding: 0px 6px;
          box-sizing: border-box;
          .user-info {
            background-color: white;
            margin-bottom: 10px;
            border: 1px solid rgba(0, 0, 0, 0.125);
            background-clip: border-box;
            .bg {
              height: 150px;
              padding: 15px;
              background-size: cover;
            }
            .info {
              padding-bottom: 36px;
              img {
                display: none;
                max-width: 100px;
                margin-top: -70px;
                margin-bottom: 5px;
                border: 3px solid #fff;
                border-radius: 100%;
                box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
              }
              text-align: center;
              p {
                margin-bottom: 3px;
              }
              .user-name {
                display: inline-block;
                margin-top: -45px;
                margin-bottom: 15px;
                border: 3px solid white;
                border-radius: 100%;
                box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
                font-size: 18px;
                font-weight: bold;
                width: 90px;
                height: 90px;
                line-height: 90px;
                background-color: white;
                color: green;
              }
              .user-role {
                font-size: 14px;
              }
            }
          }
          .commands {
            padding: 16px;
            background-color: white;
            margin-bottom: 10px;
            border: 1px solid rgba(0, 0, 0, 0.125);
            ul {
              margin-left: 20px;
              li {
                position: relative;
                font-size: 16px;
                line-height: 30px;
                height: 30px;
                &.is-active {
                  color: green;
                }
                i {
                  position: absolute;
                  left: -18px;
                  top: 9px;
                }
                .text {
                  cursor: pointer;
                  &:hover {
                    /*color: black;*/
                    font-weight: bold;
                  }
                }
              }
            }
          }
        }
        .right {
          /*flex: 0 0 75%;*/
          width: 75%;
          padding: 0px 6px;
          box-sizing: border-box;
          .detail {
            height: calc(100% - 5px);
            box-sizing: border-box;
            background-color: white;
            border: 1px solid rgba(0, 0, 0, 0.125);
          }
        }
      }
    }
  }
</style>

<script>
  import paasHeaderProfile from 'assets/components/header-profile';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';

  export default {
    components: {paasHeaderProfile},
    data() {
      return {
        showDescriptor4Header: {
          'manage': this.$storeHelper.getUserInfo('role') && this.$storeHelper.getUserInfo('role') === '平台管理员',
          'user/info': false,
          'user/group': false,
          'user/feedback': false,
          'user/message': false,
          'user/operation': false,
        },
        commandList: [],
        activeSideMenuItem: '/info',
        crumbList: [],
      }
    },
    async created() {
      const permission = await this.$net.requestPermission();
      this.$storeHelper.permission = permission;
      // this.$routeHelper.addPermission(permissionList);
      this.commandList = this.$router.helper.getPermittedSubRouteList();
      this.updateActiveCommand();
    },
    mounted() {
      this.resizeListener = () => {
        this.$storeHelper.screen = {
          width: this.$el.offsetWidth,
          height: this.$el.offsetHeight
        };
      };
      this.$nextTick(() => {
        addResizeListener(this.$el, this.resizeListener);
      });
    },
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },
    computed: {
      userName() {
        let userName = this.$storeHelper.getUserInfo('realName');
        if (!userName) {
          userName = '未知';
        }
        return userName;
      },
      userRole() {
        return this.$storeHelper.getUserInfo('role');
      }
    },
    watch: {
    },
    methods: {
      /**
       * register some global variable at start of page profile
       */
      handleHeaderMenuClick(keyPath) {
        switch (keyPath) {
          case 'user/group':
          case 'user/info':
          case 'manage':
          case 'profile':
            window.location.pathname = this.$net.page[keyPath];
            break;
          case 'index':
            this.$utils.goToPath('/index');
            break;
        }
      },
      updateActiveCommand() {
        let path = this.$route.path;
        this.commandList.forEach(it => {
          if (it.fullPath === path) {
            it.isActive = true;
          } else {
            it.isActive = false;
          }
        })
      },
      handleCommands(item) {
        this.$router.push(item.fullPath);
        this.updateActiveCommand();
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
