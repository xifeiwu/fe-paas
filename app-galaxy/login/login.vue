<template>
  <div id="login">
    <img class="finup-cloud" src="/assets/imgs/finup-cloud.png" @click="handleImageClick()">
    <div :class="['main', pathName]" v-if="pathName === 'cas-login'"
         v-loading="showLoading"
         element-loading-text="登录中...">
      <div class="login-error" v-if="errMsg">
        <div style="text-align: center; color: red; font-weight: bold">登录失败：{{errMsg}}</div>
        <div style="text-align: center; text-decoration: underline;"><a :href="$net.getCasLoginHref(false)">请点击链接跳转到CAS登录页面</a></div>
      </div>
    </div>
    <div class="main" v-if="pathName === 'paas-login'">
      <!--the element of writting-code is use for backgroundEffectOfCodeWriter-->
      <div class="writting-code">
          <pre><code class="javascript hljs"></code></pre>
      </div>
      <div class="login-form-container"
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
            <div class="login-title">登录金融云</div>
          </el-form-item>
          <el-form-item labelWidth="0px" v-if="errMsg">
            <el-alert
                    :title="errMsg"
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
                         name="without_login">15天免登录</el-checkbox>
          </el-form-item>
          <el-form-item class="login-button-item">
            <el-button type="primary" class="login-btn" @click="onSubmit">登&nbsp&nbsp&nbsp&nbsp录</el-button>
          </el-form-item>
        </el-form>
        <div style="margin-top: 6px; font-size: 14px; line-height: 24px; color: #909399; background-color: #f4f4f5; border-radius: 4px;">
          <i class="el-icon-warning"></i>
          <span>请使用</span>
          <a href="http://ops.finupgroup.com/login.htm" target="_blank">运管平台(ops)</a>
          <span>账号登录</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <div>Copyright © 2017 凡普金科</div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  $header-height: 45px;
  $header-background-color: #e7e7e7;
  #login {
    position: fixed;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    img.finup-cloud {
      z-index: 10;
      position: absolute;
      width: 160px;
      top: 12px;
      left: 12px;
    }
    .main {
      &.cas-login {
        display: block;
      }
      .hljs {
        background: white;
      }
      max-width: 1500px;
      min-width: 1000px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -60%);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      .writting-code {
        display: inline-block;
        min-height: 450px;
        font-size: 12px;
        filter: blur(1px);
        opacity: 0.8;
      }
      .login-form-container {
        padding: 20px;
        /*box-shadow: 0 0 2px 0 rgba(64,158,255, .6);*/
        box-shadow: 0 2px 7px 0 rgba(0,0,0,.18);
        &:hover {
          /*box-shadow: 0 0 6px 0 rgba(64,158,255, .6);*/
          box-shadow: 0 2px 7px 0 rgba(0,0,0,.28);
        }
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
              margin-bottom: 3px;
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
              input {
                border-radius: 0px
              }
            }
          }
        }
      }
    }
    .footer {
      position: absolute;
      color: #606266;
      bottom: 8px;
      left: 50%;
      transform: translate(-50%);
    }

    canvas {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0px;
      right: 0px;
      height: auto;
    }
    #canvas-fe {
      z-index: -1;
    }
    #canvas-bg {
      z-index: -2;
      -webkit-filter: blur(3px);
      -moz-filter: blur(3px);
      -o-filter: blur(3px);
      filter: blur(3px);
      opacity: 0.6;
    }
  }
</style>

<script>
  const backgroundEffectOfCodeWriter = function(node) {
    const str = `<span class="hljs-comment">/** ignore me */</span>
<span class="hljs-keyword">const</span> codeWriter = <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">node</span>) </span>{
  <span class="hljs-keyword">let</span> str = node.innerHTML;
  <span class="hljs-keyword">let</span> progress = <span class="hljs-number">0</span>;
  node.innerHTML = <span class="hljs-string">''</span>;
  <span class="hljs-keyword">var</span> timer = setInterval(<span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) </span>{
    <span class="hljs-keyword">var</span> current = str.substr(progress, <span class="hljs-number">1</span>);
    <span class="hljs-keyword">switch</span>(current) {
      <span class="hljs-keyword">case</span> <span class="hljs-string">'&lt;'</span>:
        progress = str.indexOf(<span class="hljs-string">'&gt;'</span>, progress) + <span class="hljs-number">1</span>;
        <span class="hljs-keyword">break</span>;
      <span class="hljs-keyword">case</span> <span class="hljs-string">'&amp;'</span>:
        progress += <span class="hljs-number">3</span>;
        <span class="hljs-keyword">break</span>;
      <span class="hljs-keyword">default</span>:
        progress++;
        <span class="hljs-keyword">break</span>;
    }
    node.innerHTML = str.substring(<span class="hljs-number">0</span>, progress) + (progress &amp; <span class="hljs-number">1</span> ? <span class="hljs-string">'_'</span> : <span class="hljs-string">''</span>);
    <span class="hljs-keyword">if</span> (progress &gt;= str.length) {
      clearInterval(timer);
    }
  }, <span class="hljs-number">150</span>);
}
codeWriter(<span class="hljs-built_in">document</span>.querySelector(<span class="hljs-string">'pre code'</span>));`;
    let progress = 0;
    node.innerHTML = '';
    const update = () => {
      var current = str.substr(progress, 1);
      switch(current) {
        case '<':
          progress = str.indexOf('>', progress) + 1;
          break;
        case '&':
          progress += 3;
          break;
        case ' ':
          while ((progress < str.length) && str.substr(progress, 1) == ' ') {
            progress += 1;
          }
          break;
        default:
          progress++;
          break;
      }
      node.innerHTML = str.substring(0, progress) + (progress & 1 ? '_' : '');
      if (progress >= str.length) {
        progress = 0;
        setTimeout(update, 5000);
      } else {
        setTimeout(update, 200);
      }
    };
    update();
  };

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
        // paas-login or cas-login
        pathName: 'cas-login',
        form: {
          userName: '',
          password: '',
          verifyCode: '',
          verificationCode: '',
        },
        verifyImageData: '',
        freeLogin15Days: false,
        errMsgForVerifyCode: '获取验证码失败，请检查网络是否正常连接。',
        errMsg: '',
        showLoading: false,
        focusIndex: 0,
        focusableElesInForm: []
      };
    },
    created () {
      this.pathName = location.pathname.substr(1);
      const version = '1.2';
      if (this.$storeHelper.version != version) {
//        this.$storeHelper.version = version
      }
    },
    mounted () {
      // jump to destination page when token is found
      if (this.$storeHelper.getUserInfo('token')) {
        this.pageJump();
        return;
      }
      if (this.pathName === 'paas-login') {
        this.updateVerifyCode();
        // logic for form focus
        let loginForm = document.querySelector('.el-form.login-form');
        let results = [];
        results = results.concat(Array.prototype.slice.call(loginForm.querySelectorAll('input')));
        results = results.concat(Array.prototype.slice.call(loginForm.querySelectorAll('button')));
        this.focusableElesInForm = results;
        setTimeout(() => {
          this.focusableElesInForm.length > 0 && this.focusableElesInForm[0].focus();
        }, 1000);
        // code-writter effect
        backgroundEffectOfCodeWriter(this.$el.querySelector('.main .writting-code pre code'));
      } else if (this.pathName === 'cas-login') {
        // this._casLogin();
        this._paasLoginWithCasIndentity();
      } else if (this.pathName === 'login') {
        window.location.href = this.$net.page['cas-login'];
      }
    },
    methods: {
      handleImageClick() {
        this.$utils.goToPath('/index');
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
            const submitButtonIndex = 4;
            this.focusableElesInForm[submitButtonIndex].click();
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

      pageJump() {
        // return;
        // 1. go to profile by default
        var toPath = this.$net.page['profile'];

        // 2. judge by user role
//        const role = this.$storeHelper.userInfo['role'];
//        if (role === '平台管理员') {
//          toPath = this.$net.page['manage'];
//        }

        // 3. judge by querystring ?to=/profile
        const queryString = window.location.search.replace(/^\?/, '');
        const queryObj = this.$utils.parseQueryString(queryString);
        if (queryObj.hasOwnProperty('to')) {
          toPath = queryObj['to'];
        }
        // 3. judge by hash
//        const hash = location.hash;
//        if (hash) {
//          toPath = hash.substr(1);
//        }

        window.location.href = toPath;
      },

      async _paasLoginWithCasIndentity() {
        const queryString = window.location.search.replace(/^\?/, '');
        const queryObj = this.$utils.parseQueryString(queryString);
        // check if the url is validate
        this.showLoading = true;
        try {
          if (!queryObj.hasOwnProperty('ticket')) {
            throw new Error('queryString中未找到ticket信息');
          }
          var service = `${location.origin}${location.pathname}`;
          if (queryObj.hasOwnProperty('to')) {
            service = `${service}?to=${queryObj.to}`
          }
          const loginResContent = await this.$net.requestAssistServer(this.$net.URL_LIST.paas_login_with_cas_indentity, {
            payload: {
              service,
              ticket: queryObj['ticket']
            }
          });
          this._processLoginResponse(loginResContent);
        } catch(err) {
          console.log(err);
          this.errMsg = err.message;
//          this.$message.error(`登录失败：${err.message}`);
        } finally {
          this.showLoading = false;
        }
      },

      // on click of login button
      async onSubmit() {
        if (!this.checkData()) {
          return;
        }
        this._paasLogin();
      },

      async _paasLogin() {
        try {
          this.showLoading = true;
          const payload = {
            username: this.form.userName,
            password: this.form.password,
            randomCode: this.form.verifyCode,
            verificationCode: this.form.verificationCode,
            freeLogin: this.freeLogin15Days,
          };

          const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.login, {
            payload
          });
          this._processLoginResponse(resContent);
        } catch(err) {
          if (err.hasOwnProperty('msg')) {
            // status err
            this.showError(err.msg, true);
          } else {
            // network error
            this.showError(err.message, true);
          }
        } finally {
          this.showLoading = false;
        }
      },

      // 处理登录返回的用户信息
      _processLoginResponse(loginResponseContent) {
        const {userInfo, menuList} = this.$net.formatLoginResContent(loginResponseContent);
        this.$storeHelper.menus = {
          profile: menuList
        };
        this.$store.dispatch('updateUserInfo', userInfo);

        if (!userInfo) {
          throw new Error('用户信息获取失败！');
        }
        if (!userInfo.token) {
          throw new Error('未获得token信息');
        }
        if (!userInfo.role) {
          throw new Error('未获得角色信息');
        }

        // 如果用户是游客，只能进入首页
        if (userInfo.role === 'guest') {
          window.location.href = this.$net.page['index'];
        } else {
          this.pageJump();
        }
      },

      // TODO: replaced by _paasLoginWithCasIndentity
      async _casLogin() {
        const queryString = window.location.search.replace(/^\?/, '');
        const queryObj = this.$utils.parseQueryString(queryString);
        // check if the url is validate
        this.showLoading = true;
        try {
          if (!queryObj.hasOwnProperty('ticket')) {
            throw new Error('queryString中未找到ticket');
          }
          var service = `${location.origin}${location.pathname}`;
          if (queryObj.hasOwnProperty('to')) {
            service = `${service}?to=${queryObj.to}`
          }
          const casInfo = await this.$net.requestAssistServer(this.$net.URL_LIST.cas_validate, {
            payload: {
              service,
              ticket: queryObj['ticket']
            }
          });
          // console.log(JSON.stringify(casInfo));
          // console.log(casInfo.xml);
          const serviceResponse = casInfo.json.serviceResponse;
          if (serviceResponse.hasOwnProperty('authenticationFailure')) {
            throw new Error('CAS认证失败！');
          }

          const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST['cas-login'], {
            payload: {
              casLoginInfo: casInfo.xml
            }
          });
          this._processLoginResponse(resContent);
        } catch(err) {
          console.log(err);
          this.errMsg = err.message;
//          this.$message.error(`登录失败：${err.message}`);
        } finally {
          this.showLoading = false;
        }
      },

      /**
       * show error message of submit login
       * @param content, error message to show
       * @param updateVerifyCode, whether update verify code or not
       */
      showError(content, updateVerifyCode) {
        this.errMsg = content;
        if (updateVerifyCode) {
          this.form.verifyCode = '';
          this.updateVerifyCode();
        }
      },
      async updateVerifyCode() {
        let verifyImageURL = this.$net.URL_LIST.get_verify_code.path + '?t=' + new Date().getTime();
        try {
          const response = await this.$ajax.get(verifyImageURL, {
            responseType: 'blob',
            timeout: 6000
          });
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(response.data);
            reader.onload = function() {
              var result = reader.result;
              resolve(result);
            };
            reader.onerror = function(e) {
              reject(e)
            };
          });
          this.verifyImageData = base64;
          this.form.verificationCode = response.headers['verification-code'];
          // hide error if current error is errMsgForVerifyCode
          if (this.errMsg === this.errMsgForVerifyCode) {
            this.showError('', false);
          }
        } catch(err) {
          console.log(err);
          this.showError(this.errMsgForVerifyCode, false);
        }
      },

      // check data before submit
      checkData() {
        let isOK = false;
        if (this.form.userName.length === 0) {
          this.showError("请输入用户名", true);
          return isOK;
        }
        if (this.form.password.length === 0) {
          this.showError("请输入密码", true);
          return isOK;
        }
        if (this.form.verifyCode.length === 0) {
          this.showError("请输入验证码", true);
          return isOK;
        }
        isOK = true;
        this.errMsg = '';
        return isOK;
      }
    }
  }
</script>