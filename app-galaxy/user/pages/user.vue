<template>
  <div id="user" class="main spa" direction="vertical">
    <paas-header-profile :userName="userName"  defaultActive="info"
                         @menu-click="handleHeaderMenuClick"></paas-header-profile>
    <div class="content">
      <div class="container">
        <div class="left">
          <div class="user-info">
            <div class="bg" style="background-image: url(/assets/imgs/iceland-small.png);"></div>
            <div class="info">
              <img src="assets/imgs/finup-logo.png">
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
          <div class="detail"><router-view></router-view></div>
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
    .content {
      flex: 1;
      height: calc(100% - 55px);
      .container {
        display: flex;
        margin: 0px auto;
        margin-top: 10px;
        height: calc(100% - 10px);
        @media (min-width: 992px) {
          max-width: 990px;
        }
        @media (min-width: 1200px) {
          max-width: 1230px;
        }
        .left {
          flex: 0 0 25%;
          padding: 0px 8px;
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
              padding: 16px;
              img {
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
                font-size: 18px;
                font-weight: bold;
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
          flex: 0 0 75%;
          padding: 0px 8px;
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
  import paasHeaderProfile from '$components/header-profile';

  export default {
    components: {paasHeaderProfile},
    data() {
      return {
        activeSideMenuItem: '/info',
        crumbList: [],
      }
    },
    created() {
      this.updateActiveCommand();
    },
    mounted() {
      this.$nextTick(() => {
      });
    },
    computed: {
      commandList() {
        return [{
          name: "产品介绍",
          route: "/info",
          icon: "my-icon-user",
          isActive: false,
        }, {
          name: "操作记录",
          route: "/operation",
          icon: "my-icon-log",
          isActive: false,
        }, {
          name: "团队管理",
          route: "/group",
          icon: "my-icon-log",
          isActive: false,
        }]
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
          case 'user/info':
            break;
          case 'user/logout':
            this.$net.logout().then(msg => {
              this.$message({
                type: 'success',
                message: msg,
                duration: 500,
                onClose: () => {
                  this.$storeHelper.logout();
//                  this.$store.dispatch('user/logout');
                  this.$utils.goToPath('/login?to=/user');
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
          case 'profile':
            this.$utils.goToPath('/profile');
            break;
          case 'index':
            this.$utils.goToPath('/index');
            break;
        }
      },
      updateActiveCommand() {
        let path = this.$route.path;
        this.commandList.forEach(it => {
          if (it.route === path) {
            it.isActive = true;
          } else {
            it.isActive = false;
          }
        })
      },
      handleCommands(item) {
        this.$router.push(item.route);
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
