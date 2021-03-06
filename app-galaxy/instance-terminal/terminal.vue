<template>
  <div id="instance-terminal">
    <div class="header" v-if="instanceInfo">
      <div class="state">
        <div class="item">当前实例：{{instanceInfo.instanceName}}</div>
        <div class="item">实例IP：{{instanceInfo.intranetIP}}</div>
        <div class="item">操作员：{{instanceInfo.realName}}</div>
      </div>
      <div class="operation">
        <el-button v-if="showDownloadButton"
                type="primary"
                size="mini-extral"
                @click="handleButtonClick($event, 'download_file')">
          下载文件
        </el-button>
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
      padding: 2px;
      color: #5DF504;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .state {
        .item {
          display: inline-block;
          margin-right: 36px;
        }
      }
      .operation {
        flex: 1;
        text-align: left;
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
  import XtermHelper from 'assets/libs/xterm-helper.js';
  export default {
    created() {
      this.xtermHelper = new XtermHelper();
      this.xtermHelper.on('open', () => console.log('opened!'));
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
        // as this.$el is used in this.openTerminal, wait for nextTick
        await new Promise(resolve => {
          this.$nextTick(resolve);
        });
        await this.xtermHelper.connectToXterm(assistInfo, this.$el.querySelector('.terminal-screen'), '\r');
        this.netError = null;
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
      showDownloadButton() {
        const {corp, env} = this.$storeHelper.getPlatform();
        return corp == 'finup';
      }
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
          intranetIP: qsObj.intranetIP,
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
        const resContent = await this.$net.requestAssistServer(this.$net.URL_LIST_ASSIST.get_websocket_token, {payload});
        if (resContent.token && resContent.host && resContent.port) {
          return resContent
        } else {
          return null;
        }
      },

      async handleButtonClick(evt, action) {
        switch (action) {
          case 'download_file':
            const h = this.$createElement;
            try {
              const {value, action} = await this.$msgbox({
                title: '提示',
                message: h('div', null, ['1）输入路径，点击确定后，会在终端运行相关指令',
                  '2）指令运行成功后，会在终端生成文件的下载路径，点击下载路径即可下载到本地',
                  ].map(it => {
                  return h('div', null, it);
                })),
                showCancelButton: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                $type: 'prompt',
                showInput: true,
                inputPlaceholder: '请输入相对文件（针对当前目录的）相对路径',
                inputValidator: (inputValue) => {
                  return true;
                },
                beforeClose(action, component, done) {
                  if (action === 'confirm') {
                    setTimeout(() => {
                      done();
                    }, 800);
                  } else {
                    done();
                  }
                }
              });
              this.xtermHelper.sendInput(`curl -sSL http://minio.puhuitech.cn:9001/public/oss-tools.sh | sh -s ${value.trim()}\r`);
            } catch (err) {
            }
            break;
        }

      }
    }
  }
</script>