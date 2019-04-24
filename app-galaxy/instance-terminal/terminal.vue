<template>
  <div id="instance-terminal">
    <div class="header" v-if="instanceInfo">
      <div class="instance-info">
        <div class="item">当前实例：{{instanceInfo.instanceName}}</div>
        <div class="item">操作员：{{instanceInfo.realName}}</div>
      </div>
    </div>
    <div class="content">
      <div class="section-error" v-if="netError">
        <div>您暂时无法访问该实例终端：{{netError.message}}</div>
        <div>请联系paas平台</div>
        <div><a :href="$net.page['profile']">点击跳转控制台（登陆）页面</a></div>
      </div>
      <div class="terminal-screen" v-else></div>
    </div>
  </div>
</template>

<style lang="scss">
  body {
    padding: 0px;
    margin: 0px;
  }
  #instance-terminal {
    height: 100%;
    box-sizing: border-box;
    padding: 0px;
    display: flex;
    flex-direction: column;
    .header {
      background: black;
      color: #5DF504;
      padding-bottom: 4px 4px;
      .instance-info {
        max-width: 1000px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
      }
    }
    .content {
      flex: 1;
      position: relative;
      background: black;
      .terminal-screen {
        height: 100%;
      }
      .section-error {
        /*color: #F56C6C;*/
        position: absolute;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        display: inline-block;
        text-align: center;
        color: white;
        font-size: 14px;
        font-weight: bold;
        background-color: rgba(245, 108, 108, 0.8);
        /*background-color: rgba(144, 147, 153, 0.8);*/
        padding: 5px 10px;
        border-radius: 5px;
      }

    }
  }
</style>

<script>
  export default {
    created() {
    },
    async mounted() {
      try {
        const results = await this.checkAndGetData();
        if (results.errMsg) {
          throw new Error(results.errMsg);
        }
        this.instanceInfo = results.instanceInfo;
        const assistInfo = await this.requestAssist(results.payload);
        // console.log(assistInfo);
        if (!assistInfo) {
          return;
        }
        this.$nextTick(() => {
          // as this.$el is used in this.openTerminal
          this.openTerminal(assistInfo);
          this.netError = null;
        });
      } catch (err) {
        console.log(err);
        this.netError = err;
      }
    },
    data() {
      return {
        instanceInfo: null,
        netError: null,
      }
    },
    computed: {
    },
    methods: {
      /**
       * 获取请求token的相关信息
       * 属性与k8s属性的对应关系：
       * podNs: profileInfo.name-groupTag
       * podName: 实例名称
       * containerName: appInfo.serviceName
       * @returns {Promise.<{errMsg: null, data: null}>}
       */
      async checkAndGetData() {
        const results = {
          errMsg: null,
          instanceInfo: null,
          payload: null,
        };
        // format of queryString: serviceName=jingang-demo-jar-0327&profileName=test&gid=226&instanceName=jingang-demo-jar-0327-655708812-xjvk0
        const qsObj = this.$utils.parseQueryString(location.search);
        const groupList = this.$storeHelper.getPropsFromLocalStorage('profile', 'user.groupList');
        const profileList = this.$storeHelper.getPropsFromLocalStorage('profile', 'app.globalConfig.profileList');

        // get and check userInfo
        const userInfo = this.$storeHelper.userInfo;
        const userInfoErrMap = {
          token: 'token失效，请重新登陆',
          userName: 'token失效，请重新登陆'
        };
        Object.keys(userInfoErrMap).every(it => {
          if (!userInfo.hasOwnProperty(it)) {
            userInfo.errMsg = userInfoErrMap[it];
            return false;
          }
          return true;
        });
        if (results.errMsg) {
          return results;
        }

        // check queryString
        const qsErrMap = {
//          appName: '未找到应用名',
          serviceName: '未找到容器名',
          profileName: '未找到运行环境',
          instanceName: '实例名称',
          gid: '团队信息',
          profileId: '运行环境',
        };
        Object.keys(qsErrMap).every(it => {
          if (!qsObj.hasOwnProperty(it)) {
            results.errMsg = qsErrMap[it];
            return false;
          }
          return true;
        });
        if (results.errMsg) {
          return results;
        }

        // get groupInfo(groupTag) by qsObj.gid
        var groupInfo = null;
        var groupTag = null;
        if (Array.isArray(groupList)) {
          groupInfo = groupList.find(it => it.id == qsObj['gid']);
          groupTag = groupInfo && groupInfo['tag'];
        }
        if (!groupTag) {
          results.errMsg = '未找到团队相关信息，请重新登陆';
          return results;
        }
        var profileInfo = null;
        if (Array.isArray(profileList)) {
          profileInfo = profileList.find(it => it.id == qsObj.profileId)
        }
        if (!profileInfo) {
          results.errMsg = '未找到运行环境相关信息，请重新登陆';
          return results;
        }

        results.instanceInfo = {
          groupName: groupInfo.name,
          appName: qsObj.appName,
          instanceName: qsObj.instanceName,
          realName: userInfo.realName,
          startTime: null
        };
        results.payload = {
          podNs: `${qsObj.profileName}-${groupInfo.tag}`,
          podName: qsObj.instanceName,
          containerName: qsObj.serviceName,
          token: userInfo.token,
          userName: userInfo.userName,
          profileType: profileInfo.spaceType,
          profileName: profileInfo.name
        };
        return results;
      },

      /**
       * get token from server for websocket connection
       * @param payload
       * @returns {Promise.<null>}
       */
      async requestAssist(payload) {
        const resContent = await this.$net.requestAssistServer(this.$net.URL_LIST.get_token, {payload});
        if (resContent.token && resContent.host && resContent.port) {
          return resContent
        } else {
          return null;
        }
      },

      // 新建终端
      openTerminal(assistInfo) {
        // xterm配置自适应大小插件
        Terminal.applyAddon(fit);
        // 这俩插件不知道干嘛的, 用总比不用好
        Terminal.applyAddon(winptyCompat);
        Terminal.applyAddon(webLinks);
        // 创建终端
        var term = new Terminal({
          theme: {
            foreground: '#ffffff',
            background: 'black',
            cursor: '#ffffff',
            selection: 'rgba(255, 255, 255, 0.3)',
            black: '#000000',
            red: '#e06c75',
            brightRed: '#e06c75',
            green: '#A4EFA1',
            brightGreen: '#A4EFA1',
            brightYellow: '#EDDC96',
            yellow: '#EDDC96',
            magenta: '#e39ef7',
            brightMagenta: '#e39ef7',
            cyan: '#5fcbd8',
            brightBlue: '#5fcbd8',
            brightCyan: '#5fcbd8',
            blue: '#5fcbd8',
            white: '#d0d0d0',
            brightBlack: '#808080',
            brightWhite: '#ffffff'
          }
        });
        term.open(this.$el.querySelector('.terminal-screen'));
        // 使用fit插件自适应terminal size
        term.fit();
        term.winptyCompatInit();
        term.webLinksInit();
        // 取得输入焦点
        term.focus();
        // 连接websocket
        const ws = new WebSocket(`wss://${assistInfo.host}:${assistInfo.port}/api/ws?token=${assistInfo.token}`);
        ws.onopen = function(evt) {
//          console.log("onopen");
          var msg = {type: "input", input: '\r'};
          ws.send(JSON.stringify(msg))
        };
        ws.onclose = function(evt) {
//          console.log("onclose")
        };
        ws.onmessage = function(evt) {
          // 服务端ssh输出, 写到web shell展示
          term.write(evt.data)
        };
        ws.onerror = function(evt) {
          console.log("onerror");
          console.log(evt);
        };
        // 当浏览器窗口变化时, 重新适配终端
        window.addEventListener("resize", function () {
          term.fit();
          // 把web终端的尺寸term.rows和term.cols发给服务端, 通知sshd调整输出宽度
          var msg = {
            type: "resize",
            rows: term.rows,
            cols: term.cols
          };
          ws.send(JSON.stringify(msg));
          // console.log(term.rows + "," + term.cols)
        });
        // 当向web终端敲入字符时候的回调
        term.on('data', function(input) {
          // 写给服务端, 由服务端发给container
          var msg = {type: "input", input: input}
          ws.send(JSON.stringify(msg))
        });
      }
    }
  }
</script>