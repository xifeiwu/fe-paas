<template>
  <el-container>
    <el-header>
      <div class="img">picture</div>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item index="1">凡普云首页</el-menu-item>
        <!--<el-submenu index="2">-->
        <!--<template slot="title">我的工作台</template>-->
        <!--<el-menu-item index="2-1">选项1</el-menu-item>-->
        <!--<el-menu-item index="2-2">选项2</el-menu-item>-->
        <!--<el-menu-item index="2-3">选项3</el-menu-item>-->
        <!--</el-submenu>-->
        <el-menu-item index="2">帮助文档</el-menu-item>
        <el-menu-item index="3">登录</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <div class="form-container"
           v-loading="showLoading"
           element-loading-text="登录中"
           element-loading-spinner="el-icon-loading"
           element-loading-background="rgba(255, 255, 255, 0.6)"
      >
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item labelWidth="0px">
            <div class="login-title">登录凡普云</div>
          </el-form-item>
          <el-form-item labelWidth="0px" v-if="error.status">
            <el-alert
                    :title="error.content"
                    type="error"
                    :closable="false"
                    class="login-error"
            >
            </el-alert>
          </el-form-item>
          <el-form-item labelWidth="0px">
            <el-input v-model="form.userName" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item labelWidth="0px">
            <el-input v-model="form.password" placeholder="请输入密码" type="password"></el-input>
          </el-form-item>
          <el-form-item labelWidth="0px">
            <el-input v-model="form.verifyCode" placeholder="请输入验证码">
              <template slot="append"><img alt="..." width="60" height="30" :src="verifyImageData"
                                           @click="updateVerifyCode"></template>
            </el-input>
          </el-form-item>
          <el-form-item class="login-interval" labelWidth="0px">
            <el-checkbox v-model="freeLogin15Days"
                         label="without_login"
                         name="without_login"
                         @change="freeLoginStateChange">15天免登录
            </el-checkbox>
          </el-form-item>
          <el-form-item class="login-button" labelWidth="0px">
            <el-button type="primary" @click="onSubmit">登&nbsp&nbsp&nbsp&nbsp录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-main>
    <el-footer>
      <div>Copyright © 2017 凡普金科</div>
    </el-footer>
  </el-container>
</template>
<script>
  import urlList from '../url.config'
  export default {
    data() {
      return {
        activeIndex: '3',
        form: {
          userName: '',
          password: '',
          verifyCode: '',
          verificationCode: '',
        },
        verifyImageData: '',
        freeLogin15Days: false,
        error: {
          status: false,
          content: ''
        },
        showLoading: false,
      };
    },
    created: function () {
//      this.verifyImageData = urlList.getVerifyCode + '?t=' + new Date().getTime();
      this.updateVerifyCode();
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      freeLoginStateChange: function (value, evt) {
//        console.log(value);
      },
      updateVerifyCode() {
        var verifyImageURL = urlList.getVerifyCode + '?t=' + new Date().getTime();
          this.$ajax.get(verifyImageURL,{
            responseType: 'arraybuffer'
          }).then(response => {
            var base64 = new Buffer(response.data, 'binary').toString('base64');
            var mimetype = response.headers['content-type'];
            this.verifyImageData = "data:" + mimetype + ";base64," + base64;
            this.form.verificationCode = response.headers['verification-code'];
          }).catch(err => {
            console.log(err);
          });
      },
      showError(content) {
        this.error.status = true;
        this.error.content = content;
      },
      onSubmit() {
        if (this.checkData()) {
          var objToPost = {
            username: this.form.userName,
            password: this.form.password,
            randomCode: this.form.verifyCode,
            verificationCode: this.form.verificationCode,
            freeLogin15Days: this.freeLogin15Days,
          };
          console.log(objToPost);
          this.showLoading = true;
          this.$ajax.post(urlList.login, objToPost).then(response => {
            console.log(JSON.stringify(response));
            if (response && 'data' in response && 'code' in response.data) {
              if (response.data.code !== 0) {
                this.showError(response.data.msg);
              } else {
                this.$router.push('/profile');
                this.$ajax.get(urlList.app_test).then(response => {
                  console.log(response);
                }).catch(err => {
                  console.log(err);
                });
              }
            }
            this.showLoading = false;
          }).catch(err => {
            console.log(err);
            this.showError('网络连接错误');
            this.showLoading = false;
          });
        }
      },
      checkData() {
        let isOK = false;
        if (this.form.userName.length === 0) {
          this.showError("请输入用户名");
          return isOK;
        }
        if (this.form.password.length === 0) {
          this.showError("请输入密码");
          return isOK;
        }
        if (this.form.verifyCode.length === 0) {
          this.showError("请输入验证码");
          return isOK;
        }
        isOK = true;
        this.error.status = false;
        this.error.content = '';
        return isOK;
      }
    }
  }
</script>
<style lang="scss" scoped>
  .el-container {
    .el-header {
      background-color: #e7e7e7;
      color: #333;
      text-align: center;
      line-height: 60px;
      .img {
        float: left;
      }
      .el-menu {
        background-color: transparent;
        float: right;
      }
    }

    .el-main {
      position: relative;
      color: #333;
      .form-container {
        float: right;
        margin-top: 50px;
        margin-right: 30px;
        padding: 20px;
        box-shadow: 0 0 8px 0 rgba(232, 237, 250, .6), 0 2px 4px 0 rgba(232, 237, 250, .5);
        .el-form {
          width: 320px;
          .el-form-item {
            margin-bottom: 16px;
            .login-error {
              line-height: 100%;
              padding: 8px 2px;
              font-weight: bold;
            }
            .login-title {
              text-align: center;
              font-size: 1.2rem;
            }
            &.login-interval {
              .el-form-item__title {
                line-height: 24px;
              }
            }
            &.login-button {
              text-align: center;
              button {
                width: 100%;
              }
            }
            &:last-child {
              margin-bottom: 0px;
            }
            .el-form-item__content {
              margin-left: 0px !important;
              input {
                border-radius: 0px
              }
            }
          }
        }
      }
    }

    .el-footer {
      text-align: center;
    }

    .el-aside {
      background-color: #D3DCE6;
      color: #333;
      text-align: center;
    }
  }

  body > .el-container {
    margin-bottom: 40px;
  }

</style>