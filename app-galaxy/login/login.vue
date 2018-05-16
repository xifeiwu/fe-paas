<template>
  <div id="login">
    <img class="finup-cloud" src="/assets/imgs/finup-cloud.png" @click="handleImageClick()">
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
    <div class="footer">
      <div>Copyright © 2017 凡普金科</div>
    </div>
    <canvas id="canvas-fe" width="100%" height="100%"></canvas>
    <canvas id="canvas-bg" width="1950px" height="800px"></canvas>
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
      width: 120px;
      top: 8px;
      left: 8px;
    }
    .login-form-container {
      z-index: 10;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -60%);
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
      drawBG2();
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
        let verifyImageURL = this.$url.get_verify_code + '?t=' + new Date().getTime();
          this.$ajax.get(verifyImageURL, {
            responseType: 'arraybuffer',
            timeout: 6000
          }).then(response => {
            let base64 = new Buffer(response.data, 'binary').toString('base64');
            let mimeType = response.headers['content-type'];
            this.verifyImageData = "data:" + mimeType + ";base64," + base64;
            this.form.verificationCode = response.headers['verification-code'];
          }).catch(err => {
            this.showError('获取验证码失败，请检查网络是否正常连接。');
            console.log(err);
          });
      },
      /**
       * show error message of submit login
       * @param content, error message to show
       * @param updateVerifyCode, whether update verify code or not
       */
      showError(content, updateVerifyCode) {
        this.error.status = true;
        this.error.content = content;
        if (updateVerifyCode) {
          this.form.verifyCode = '';
          this.updateVerifyCode();
        }
      },

      parseResponse (response) {
        function updateItem(item) {
          let keyMap = {
            "应用管理": {
              router: '/profile/app',
              icon: 'my-icon-app'
              // icon: 'el-icon-location'
            },
            "服务管理": {
              router: '/profile/service',
              icon: 'my-icon-service'
            },
            "实例列表": {
              router: '/profile/instance',
              icon: 'my-icon-instance'
            },
            "外网域名": {
              router: '/profile/domain',
              icon: 'my-icon-domain',
            },
            "日志中心": {
              router: '/profile/log',
              icon: 'my-icon-log'
            },
            "应用监控": {
              router: '/profile/monitor',
              icon: 'my-icon-monitor'
            },
            "Oauth权限": {
              router: '/profile/oauth',
              icon: 'my-icon-key'
            },
            "审批管理": {
              router: '/profile/work-order',
              icon: 'my-icon-work-order'
            },
          };
          let key = item.name;
          if (keyMap.hasOwnProperty(key)) {
            let props = keyMap[key];
            for (let key in props) {
              item[key] = props[key];
            }
          }
          return item;
        }
        return new Promise((resolve, reject) => {
          if ('data' in response && 'content' in response.data) {
            let content = response.data.content;
            let twoLevelMenu = [];
            let permission = content.permission;

            // append some property to each item
            permission = permission.map(it => {
              return updateItem(it);
            });

            // generate two level menu tree by parentId
            permission.forEach(it => {
              if (0 === it.parentId) {
                twoLevelMenu.push(it);
              }
            });
            permission.forEach(it => {
              if (0 !== it.parentId) {
                let findParent = twoLevelMenu.some(pItem => {
                  if (it.parentId === pItem.id) {
                    if (!pItem.hasOwnProperty('children')) {
                      pItem.children = [];
                    }
                    pItem.children.push(it);
                    return true;
                  } else {
                    return false;
                  }
                });
                if (!findParent) {
                  twoLevelMenu.push(it);
                }
              }
            });

            // generate one level menu from two level menu
            let oneLevelMenu = [];
            twoLevelMenu.forEach(it => {
              oneLevelMenu.push(it);
              if (it.hasOwnProperty('children')) {
                it.children.forEach(it2 => {
                  oneLevelMenu.push(it2);
                })
              }
            });

            // let menuToIgnore = ["应用监控", "Oauth权限"];
            let menuToIgnore = ["应用监控"];
            oneLevelMenu = oneLevelMenu.filter(it => {
              return menuToIgnore.indexOf(it.name) === -1;
            }).map(it => {
              if (it.name === 'Oauth权限') {
                it.name = 'Access Key管理';
              }
              if (it.hasOwnProperty('children')) {
                delete it.children;
              }
              return it;
            });
//            content.menuList = oneLevelMenu;
            resolve({
              userInfo: content.user,
              menuList: oneLevelMenu
            });
          }
        });
      },
      // on click of login button
      onSubmit() {
        if (this.checkData()) {
          let objToPost = {
            username: this.form.userName,
            password: this.form.password,
            randomCode: this.form.verifyCode,
            verificationCode: this.form.verificationCode,
            freeLogin: this.freeLogin15Days,
          };
//          console.log(objToPost);
          this.showLoading = true;
          this.$ajax.post(this.$url.login, objToPost).then(response => {
//            console.log(response);
            if (response && 'data' in response && 'code' in response.data) {
              if (response.data.code !== 0) {
                this.showError(response.data.msg, true);
              } else {
                this.parseResponse(response).then(({userInfo, menuList}) => {
                  if (menuList) {
                    this.$storeHelper.setUserInfo('menuList', menuList);
                  }
                  if (userInfo) {
                    if (userInfo.hasOwnProperty('username')) {
                      this.$storeHelper.setUserInfo('userName', userInfo.username);
                    }
                    if (userInfo.hasOwnProperty('realName')) {
                      this.$storeHelper.setUserInfo('realName', userInfo.realName);
                    }
                    if (userInfo.hasOwnProperty('role')) {
                      this.$storeHelper.setUserInfo('role', userInfo.role);
                    }
                  }
                });
                let queryString = window.location.search.replace(/^\?/, '');
                let queryObj = this.$utils.parseQueryString(queryString);
                let toPath = '/profile';
                if (queryObj.hasOwnProperty('to')) {
                  toPath = queryObj['to'];
                }
                this.$utils.goToPath(toPath);
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