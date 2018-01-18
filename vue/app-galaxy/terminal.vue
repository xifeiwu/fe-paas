<template>
  <div id="app">
    termial
  </div>
</template>
<script>
  import axios from 'axios';
  import URL_LIST from './net/url';
  export default {
    created() {
    },
    mounted() {
      this.$nextTick(() => {
        this.getTerminalInfo().then(response => {
          let data = response.data;
          if (data.code === 0) {
            let content = data.content;
            console.log(content);
          } else {
            this.$alert('数据请求失败，请与管理员联系。');
          }
        }).catch(err => {
          this.$alert(`即将进入：${this.$url.page_login_path}`, err, {
            confirmButtonText: '确定',
            callback: action => {
              window.open(this.$url.page_login_path, '_blank');
            }
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
          return Promise.reject('当前未登陆，请重新登陆');
        }

        let id = this.$utils.getQueryString('id');
        let ip = this.$utils.getQueryString('ip');
        this.ip = ip;
        if (id && ip) {
          return axios.post(URL_LIST.terminal_info, {
            serviceId: parseInt(id)
          }, {
            headers: {
              'token': token,
            }
          });
        }
      },

      openTerminal(options) {
//        var gateOneURL = [[${url}]] + "";
//        var auth_info = [[${auth_info}]];
//        var ip = [[${ip}]] + "";
//        var location = [[${location}]] + "";

        let gateOneURL = options.url;
        let authInfo = options['auth_info'];
        let location = '';
        var ssh_url = "ssh://root@" + this.ip + ":22";

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
<style scoped>
  #app {
    height: 100%;
  }
</style>