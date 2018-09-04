<template>
  <div id="login">
    <img class="finup-cloud" src="/assets/imgs/finup-cloud.png" @click="handleImageClick()">
    <div class="main">
      <div class="writting-code">
          <pre><code class="javascript hljs"><span class="hljs-comment">/** ignore me */</span>
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
codeWriter(<span class="hljs-built_in">document</span>.querySelector(<span class="hljs-string">'pre code'</span>));</code></pre>
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
            <div class="login-title">登录凡普云</div>
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
    <canvas id="canvas-fe" width="100%" height="100%"></canvas>
    <canvas id="canvas-bg" width="1950px" height="800px"></canvas>
  </div>
</template>
<style lang="scss" scoped>
  @import 'assets/css/mixin.scss';
  @import 'assets/static/libs/highlight/styles/atelier-forest-light';
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
  const drawBG2 = function() {
    //封装方法，压缩之后减少文件大小
    function get_attribute(node, attr, default_value) {
      return node.getAttribute(attr) || default_value;
    }
    //封装方法，压缩之后减少文件大小
    function get_by_tagname(name) {
      return document.getElementsByTagName(name);
    }
    //获取配置参数
    function get_config_option() {
      var scripts = get_by_tagname("script"),
        script_len = scripts.length,
        script = scripts[script_len - 1]; //当前加载的script
      return {
        l: script_len, //长度，用于生成id用
        z: get_attribute(script, "zIndex", -1), //z-index
        o: get_attribute(script, "opacity", 0.5), //opacity
        c: get_attribute(script, "color", "0,0,0"), //color
        n: get_attribute(script, "count", 99) //count
      };
    }
    //设置canvas的高宽
    function set_canvas_size() {
      canvas_width = the_canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        canvas_height = the_canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    //绘制过程
    function draw_canvas() {
      context.clearRect(0, 0, canvas_width, canvas_height);
      //随机的线条和当前位置联合数组
      var e, i, d, x_dist, y_dist, dist; //临时节点
      //遍历处理每一个点
      random_points.forEach(function(r, idx) {
        r.x += r.xa,
          r.y += r.ya, //移动
          r.xa *= r.x > canvas_width || r.x < 0 ? -1 : 1,
          r.ya *= r.y > canvas_height || r.y < 0 ? -1 : 1, //碰到边界，反向反弹
          context.fillRect(r.x - 0.5, r.y - 0.5, 1, 1); //绘制一个宽高为1的点
        //从下一个点开始
        for (i = idx + 1; i < all_array.length; i++) {
          e = all_array[i];
          // 当前点存在
          if (null !== e.x && null !== e.y) {
            x_dist = r.x - e.x; //x轴距离 l
            y_dist = r.y - e.y; //y轴距离 n
            dist = x_dist * x_dist + y_dist * y_dist; //总距离, m

            dist < e.max && (e === current_point && dist >= e.max / 2 && (r.x -= 0.03 * x_dist, r.y -= 0.03 * y_dist), //靠近的时候加速
              d = (e.max - dist) / e.max,
              context.beginPath(),
              context.lineWidth = d / 2,
              context.strokeStyle = "rgba(" + config.c + "," + (d + 0.2) + ")",
              context.moveTo(r.x, r.y),
              context.lineTo(e.x, e.y),
              context.stroke());
          }
        }
      }), frame_func(draw_canvas);
    }
    //创建画布，并添加到body中
//    var the_canvas = document.createElement("canvas"); //画布
    var the_canvas = document.getElementById('canvas-fe');
    var config = get_config_option(), //配置
      canvas_id = "c_n" + config.l, //canvas id
      context = the_canvas.getContext("2d"), canvas_width, canvas_height,
      frame_func = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(func) {
          window.setTimeout(func, 1000 / 45);
        }, random = Math.random,
      current_point = {
        x: null, //当前鼠标x
        y: null, //当前鼠标y
        max: 20000 // 圈半径的平方
      },
      all_array;
    the_canvas.id = canvas_id;
    the_canvas.style.cssText = "position:fixed;top:0;left:0;z-index:" + config.z + ";opacity:" + config.o;
//    get_by_tagname("body")[0].appendChild(the_canvas);

    //初始化画布大小
    set_canvas_size();
    window.onresize = set_canvas_size;
    //当时鼠标位置存储，离开的时候，释放当前位置信息
    window.onmousemove = function(e) {
      e = e || window.event;
      current_point.x = e.clientX;
      current_point.y = e.clientY;
    }, window.onmouseout = function() {
      current_point.x = null;
      current_point.y = null;
    };
    //随机生成config.n条线位置信息
    for (var random_points = [], i = 0; config.n > i; i++) {
      var x = random() * canvas_width, //随机位置
        y = random() * canvas_height,
        xa = 1 * random() - 1, //随机运动方向
        ya = 1 * random() - 1;
      // 随机点
      random_points.push({
        x: x,
        y: y,
        xa: xa,
        ya: ya,
        max: 6000 //沾附距离
      });
    }
    all_array = random_points.concat([current_point]);
    //0.1秒后绘制
    setTimeout(function() {
      draw_canvas();
    }, 100);
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
    created: function () {
      this.updateVerifyCode();
    },
    mounted: function () {
      // jump to destination page when token is found
      if (this.$storeHelper.getUserInfo('token')) {
        this.pageJump();
      }
      // 清理localstore
      window && window.localStorage.removeItem('galaxy');

      let loginForm = document.querySelector('.el-form.login-form');
      let results = [];
      results = results.concat(Array.prototype.slice.call(loginForm.querySelectorAll('input')));
      results = results.concat(Array.prototype.slice.call(loginForm.querySelectorAll('button')));
      this.focusableElesInForm = results;
      setTimeout(() => {
        this.focusableElesInForm.length > 0 && this.focusableElesInForm[0].focus();
      }, 1000);
      // background effect
//      drawBG2();

      // code-writter effect
      const codeWriter = function(node) {
        let str = node.innerHTML;
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
      codeWriter(this.$el.querySelector('.main pre code'));
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
        // 1. go to profile by default
        let toPath = this.$net.page['profile'];

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

        this.$utils.goToPath(toPath);
      },

      // on click of login button
      onSubmit() {
        if (this.checkData()) {
          let payload = {
            username: this.form.userName,
            password: this.form.password,
            randomCode: this.form.verifyCode,
            verificationCode: this.form.verificationCode,
            freeLogin: this.freeLogin15Days,
          };

          this.showLoading = true;
          this.$net.formatRequest(this.$net.URL_LIST.login, {
            payload
          }).then(response => {
            let content = this.$net.getResponseContent(response);
            if (content) {
              const {userInfo, menuList, notPermitted} = this.$net.parseLoginResponseMore(content);
              if (menuList) {
                this.$store.dispatch('saveNavMenu', menuList);
              }
//              if (notPermitted) {
//                this.$storeHelper.setPermission({'profile': notPermitted});
//              }
              if (!userInfo.hasOwnProperty('token')) {
                userInfo.token = response.headers.token;
              }
              if (userInfo) {
                this.$store.dispatch('updateUserInfo', {
                  userName: userInfo.username,
                  realName: userInfo.realName,
                  role: userInfo.role,
                  token: userInfo.token
                });
              }
              if (userInfo.token) {
                this.pageJump();
              }
            } else {
              let resMsgObj = this.$net.getResponseMsg(response, {
                errorMsg: '登录失败'
              });
              throw new Error(resMsgObj.msg);
            }
          }).catch(err => {
            if (err.hasOwnProperty('msg')) {
              // status err
              this.showError(err.msg, true);
            } else {
              // network error
              this.showError(err.message, true);
            }
          }).finally(() => {
            this.showLoading = false;
          });
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
      updateVerifyCode() {
        let verifyImageURL = this.$net.URL_LIST.get_verify_code.path + '?t=' + new Date().getTime();
        this.$ajax.get(verifyImageURL, {
          responseType: 'arraybuffer',
          timeout: 6000
        }).then(response => {
          let base64 = new Buffer(response.data, 'binary').toString('base64');
          let mimeType = response.headers['content-type'];
          this.verifyImageData = "data:" + mimeType + ";base64," + base64;
          this.form.verificationCode = response.headers['verification-code'];
          // hide error if current error is errMsgForVerifyCode
          if (this.errMsg === this.errMsgForVerifyCode) {
            this.showError('', false);
          }
        }).catch(err => {
          this.showError(this.errMsgForVerifyCode, false);
          console.log(err);
        });
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