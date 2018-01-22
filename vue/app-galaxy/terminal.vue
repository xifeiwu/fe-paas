<template>
  <div id="gateone_container" style="position: relative; width: 100%; height: 60em;">
    <div id="gateone"></div>
  </div>
</template>
<script>
  import axios from 'axios';
  import URL_LIST from './net/url';
  const NEED_LOGIN = 1;
  const PARAMS_NOT_FOUND = 2;

  export default {
    created() {
    },
    mounted() {
      this.$nextTick(() => {
        this.getTerminalInfo().then(response => {
          let data = response.data;
          if (data.code === 0) {
            let content = data.content;
//            console.log(content);
            this.openTerminal(content);
          } else {
            this.$alert('数据请求失败，请与管理员联系。');
          }
        }).catch(err => {
          let title = '错误';
          let content = '';
          let callback = () => {};
          if (err.hasOwnProperty('status')) {
            switch (err.status) {
              case NEED_LOGIN:
                content = `即将进入：${this.$url.page_login_path}`;
                callback = () => {
                  window.open(this.$url.page_login_path, '_blank');
                };
                break;
            }
            title = err.msg;
          } else {
            // network err
            title = '获取基本信息失败';
            content = err;
          }
          this.$alert(content, title, {
            confirmButtonText: '确定',
            callback: callback
          });
        })
      });
    },
    data() {
      return {
        ip: null,
      }
    },
    computed: {
    },
    methods: {
      getTerminalInfo() {
        let token = this.$getUserInfo('token');
        if (!token) {
          return Promise.reject({
            status: NEED_LOGIN,
            msg: '当前未登陆，请重新登陆'
          });
        }

        let id = this.$utils.getQueryString('id');
        let ip = this.$utils.getQueryString('ip');
        let name = this.$utils.getQueryString('name');
        this.ip = ip;
        if (id && ip && name) {
          // save terminal config to localStorage
          this.$setUserConfig('terminal/id', id);
          this.$setUserConfig('terminal/ip', ip);
          this.$setUserConfig('terminal/name', name);
        } else {
          // in the page of terminal
          if (this.$utils.getQueryString('location')) {
            id = this.$getUserConfig('terminal/id');
            ip = this.$getUserConfig('terminal/ip');
            name = this.$getUserConfig('terminal/name');
          }
        }
        if (id && ip) {
          return axios.post(URL_LIST.terminal_info, {
            name: name,
            serviceId: parseInt(id)
          }, {
            headers: {
              'token': token,
            }
          });
        } else {
          return Promise.reject({
            status: PARAMS_NOT_FOUND,
            msg: '未找到IP'
          });
        }
      },

      openTerminal(options) {
        let gateOneURL = options.url;
        let authInfo = options['auth_info'];
        let location = options.location;
        var ssh_url = "ssh://root@" + this.ip + ":22";

        if (!window.GateOne) {
          this.$alert('未找到GateOne！');
          return;
        }
        GateOne.init({
          auth: authInfo,
          url: gateOneURL,
          theme: 'solarized',
          goDiv: '#gateone',
          disableTermTransitions: 'true',
          autoConnectURL: ssh_url
        });

        GateOne.Base.superSandbox("GateOne.SomePlugin",
          ["GateOne", "GateOne.Net", "GateOne.Terminal.Input", "GateOne.Terminal"],
          function (window, undefined) {
            GateOne.prefs.autoConnectURL = ssh_url;
            GateOne.prefs.fontSize = "100%";
            GateOne.prefs.scrollback = 10000;
            GateOne.Net.setLocation(location);
            GateOne.i18n.setLocales(['zh-CN', 'zh-CN', 'zh']);
          }
        );
      }
    }
  }
</script>
<style lang="scss">
  body {
    padding: 0px;
    margin: 0px;
  }
</style>