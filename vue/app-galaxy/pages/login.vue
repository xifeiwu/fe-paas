<template>
  <el-container id="login">
    <el-header height="45px">
      <div class="img">picture</div>
      <el-menu class="header-menu"
               mode="horizontal"
               @select="handleHeaderMenuClick"
               defaultActive="login">
        <el-menu-item index="main">凡普云首页</el-menu-item>
        <!--<el-submenu index="2">-->
        <!--<template slot="title">我的工作台</template>-->
        <!--<el-menu-item index="2-1">选项1</el-menu-item>-->
        <!--<el-menu-item index="2-2">选项2</el-menu-item>-->
        <!--<el-menu-item index="2-3">选项3</el-menu-item>-->
        <!--</el-submenu>-->
        <el-menu-item index="help">帮助文档</el-menu-item>
        <el-menu-item index="login">登录</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <div class="form-container"
           v-loading="showLoading"
           element-loading-text="登录中"
           element-loading-spinner="el-icon-loading"
           element-loading-background="rgba(255, 255, 255, 0.6)"
      >
        <el-form ref="form" :model="form" label-width="0px" class="login-form"
                 @keydown.native="handleKeyDownOnForm"
                 @focus.native.capture="handleFocusOnForm"
        >
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
          <el-form-item>
            <el-input v-model="form.userName" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" placeholder="请输入密码" type="password"></el-input>
          </el-form-item>
          <el-form-item class="verify-code">
            <el-input v-model="form.verifyCode" placeholder="请输入验证码"
                      appendStyle="width: 60px; text-align: center"
            >
              <template slot="append"><img alt="..." :src="verifyImageData" style="width: 60px; height: 30px; font-size: 10px"
                                           @click="updateVerifyCode"></template>
            </el-input>
          </el-form-item>
          <el-form-item class="login-interval-item">
            <el-checkbox v-model="freeLogin15Days"
                         label="without_login"
                         name="without_login"
                         @change="freeLoginStateChange">15天免登录
            </el-checkbox>
          </el-form-item>
          <el-form-item class="login-button-item">
            <el-button type="primary" class="login-btn" @click="onSubmit">登&nbsp&nbsp&nbsp&nbsp录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-main>
    <el-footer>
      <div>Copyright © 2017 凡普金科</div>
    </el-footer>
  </el-container>
</template>
<style lang="scss" scoped>
  .el-menu {
    .el-menu-item {
      &.is-active {
        font-weight: bold;
        cursor: no-drop;
        font-weight: bold;
      }
    }
  }
  $header-height: 45px;
  $header-background-color: #e7e7e7;
  #login.el-container {
    .el-header {
      background-color: $header-background-color;
      color: #333;
      text-align: center;
      .img {
        float: left;
        line-height: $header-height;
      }
      .el-menu.header-menu {
        background-color: transparent;
        float: right;
        border-width: 0px;
        .el-menu-item {
          font-size: 14px;
          line-height: $header-height;
          height: $header-height;
          &.is-active {
            color: black;
          }
        }
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
        .el-form.login-form {
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
            &.login-interval-item {
              .el-form-item__title {
                line-height: 24px;
              }
            }
            &.login-button-item {
              text-align: center;
              .el-button {
                width: 100%;
              }
            }
            &.verify-code {
              .el-input-group__append {
                width: 60px;
                text-align: center;
              }
            }
            &:last-child {
              margin-bottom: 0px;
            }
            .el-form-item__content {
              /*margin-left: 0px !important;*/
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

<script>
  const keyCode = Object.freeze({
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 13
  });
  export default {
    data() {
      return {
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
        focusIndex: 0,
        focusableElesInForm: []
      };
    },
    created: function () {
      this.updateVerifyCode();
    },
    mounted: function () {
      let loginForm = document.querySelector('.el-form.login-form');
      let results = [];
      results = results.concat(Array.prototype.slice.call(loginForm.querySelectorAll('input')));
      results = results.concat(Array.prototype.slice.call(loginForm.querySelectorAll('button')));
      this.focusableElesInForm = results;
      setTimeout(() => {
        this.focusableElesInForm.length > 0 && this.focusableElesInForm[0].focus();
      }, 1000);
    },
    methods: {
      handleHeaderMenuClick(key, keyPath) {
        console.log(key, keyPath);
      },
      handleKeyDownOnForm(evt) {
        switch (evt.keyCode) {
          case keyCode.DOWN:
            this.focusIndex +=1;
            break;
          case keyCode.UP:
            this.focusIndex -=1;
            break;
          case keyCode.ENTER:
            // if keydown event of enter is trigger on the last input, the form will be submitted.
            let lastInputIndex = 2;
            let submitButtonIndex = 4;
//            if (lastInputIndex === this.focusIndex) {
              this.focusableElesInForm[submitButtonIndex].click();
//            }
            break;
        }
        this.focusIndex = this.focusIndex < 0 ? 0 : this.focusIndex;
        this.focusIndex = this.focusIndex >= this.focusableElesInForm.length ? this.focusableElesInForm.length-1 : this.focusIndex;
        this.focusableElesInForm[this.focusIndex].focus();
      },
      handleFocusOnForm(evt) {
        let target = evt.target;
        this.focusableElesInForm.some((it, index) => {
          if (it === target) {
            this.focusIndex = index;
          }
        });
      },
      freeLoginStateChange: function (value, evt) {
      },
      updateVerifyCode() {
        var verifyImageURL = this.$url.get_verify_code + '?t=' + new Date().getTime();
          this.$ajax.get(verifyImageURL, {
            responseType: 'arraybuffer',
            timeout: 6000
          }).then(response => {
            var base64 = new Buffer(response.data, 'binary').toString('base64');
            var mimetype = response.headers['content-type'];
            this.verifyImageData = "data:" + mimetype + ";base64," + base64;
            this.form.verificationCode = response.headers['verification-code'];
          }).catch(err => {
            this.showError('获取验证码失败，请检查网络是否正常连接。');
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
            freeLogin: this.freeLogin15Days,
          };
//          console.log(objToPost);
          this.showLoading = true;
          this.$ajax.post(this.$url.login, objToPost).then(response => {
//            console.log(JSON.stringify(response));
//            console.log(response);
            if (response && 'data' in response && 'code' in response.data) {
              if (response.data.code !== 0) {
                this.showError(response.data.msg);
              } else {
                this.$store.dispatch('user/login', response);
                console.log(response);
                this.$router.push('/profile');
//                this.$ajax.get(this.$url.app_test).then(response => {
//                  console.log(response);
//                }).catch(err => {
//                  console.log(err);
//                });
              }
            }
            this.showLoading = false;
          }).catch(err => {
            console.log(err);
            this.$notify.error({
              title: '运行失败！',
              message: JSON.stringify(err)
            });
            this.showError('网络连接或内部错误');
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