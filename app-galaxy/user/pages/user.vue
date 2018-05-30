<template>
  <div id="user" class="main" direction="vertical">
    <paas-header-profile :userName="userName"  defaultActive="info"
                         @menu-click="handleHeaderMenuClick"></paas-header-profile>
    <div class="content">
      <div class="container">
        <div class="left">
          <div class="user-info">
            <div class="bg" style="background-image: url(/assets/imgs/iceland-small.png);"></div>
            <div class="info">
              <img src="assets/imgs/finup-logo.png">
              <p style="font-size: 18px;font-weight: bold;">{{userName}}</p>
              <p>用户角色：{{userRole}}</p>
            </div>
          </div>
          <div class="commands">
            <ul>
              <li v-for="(item, index) in commandList" :class="{'is-active': item.isActive}"
                  :key="index" @click="handleCommands(item)">{{item.name}}</li>
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
      .container {
        display: flex;
        margin: 0px auto;
        margin-top: 18px;
        height: calc(100% - 18px);
        @media (min-width: 1200px) {
          max-width: 1230px;
        }
        .left {
          flex: 0 0 25%;
          padding: 0px 15px;
          .user-info {
            background-color: white;
            margin-bottom: 15px;
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
            }
          }
          .commands {
            padding: 16px;
            background-color: white;
            margin-bottom: 15px;
            border: 1px solid rgba(0, 0, 0, 0.125);
            ul li {
              &.is-active {
                color: green;
              }
            }
          }
        }
        .right {
          flex: 0 0 75%;
          padding: 0px 15px;
          .detail {
            min-height: 600px;
            max-height: calc(100% - 5px);
            box-sizing: border-box;
            background-color: white;
            margin-bottom: 15px;
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
    },
    mounted() {
      this.$nextTick(() => {
      });
    },
    computed: {
      commandList() {
        return [{
          name: "产品介绍",
          router: "/info",
          icon: "my-icon-user",
          isActive: true,
        }, {
          name: "操作记录",
          router: "/operation",
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
              this.$notify.error({
                title: err.title,
                message: err.msg,
                duration: 0,
                onClose: function () {
                }
              });
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
      handleCommands(item) {
        this.$router.push(item.router);
        this.commandList.forEach(it => it.isActive = false);
        item.isActive = true;
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
