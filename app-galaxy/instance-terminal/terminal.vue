<template>
  <div id="terminal-xterm">
    <form>
      namespace:<input type="text" id="podNs">
      podName:<input  type="text" id="podName">
      containerName:<input  type="text" id="containerName">
      <input id="ssh" type="button" value="ssh">
    </form>
    <div id="terminal"></div>
  </div>
</template>

<style lang="scss">
  body {
    padding: 0px;
    margin: 0px;
  }
</style>

<script>
  export default {
    created() {
      // xterm配置自适应大小插件
      Terminal.applyAddon(fit);
      // 这俩插件不知道干嘛的, 用总比不用好
      Terminal.applyAddon(winptyCompat)
      Terminal.applyAddon(webLinks)
    },
    async mounted() {
      this.$nextTick(() => {
        const container = document.querySelector('#terminal-xterm');
        // 点击ssh建立websocket连接, 启动xterm终端
        container.querySelector("#ssh").addEventListener("click", () => {
          console.log('on click');
          container.querySelector('#terminal').innerHTML = "";
          this.openTerminal()
        })
      });

      this.queryObj = this.$utils.parseQueryString(location.search);
      console.log(location.search);
      console.log(this.queryObj);
      const tokenForSocket = await this.getToken();
      this.openTerminal(tokenForSocket);

    },
    data() {
      return {
        ip: null,
        queryObj: null
      }
    },
    computed: {
    },
    methods: {
      async getToken() {
//        console.log(this.$storeHelper.globalUserGroupInfo.tag);
        const groupTag = this.$storeHelper.globalUserGroupInfo.tag;
        const profileName = 'test';
        const instanceName = 'jingang-demo-jar-0327-2798430198-zfbcp';
        const serviceName = 'jingang-demo-jar-0327';

        // k8s-namespace
        // podNs: profileInfo.name-groupTag
        // podName: 实例名称
        // containerName: appInfo.serviceName
        const resContent = await this.$net.requestAssistServer(this.$net.URL_LIST.get_token, {
          payload: {
            podNs:`${profileName}-${groupTag}` ,
            podName: instanceName,
            containerName: serviceName
          }
        });
        if (resContent.token) {
          return resContent.token
        } else {
          return null;
        }
      },
      // 新建终端
      openTerminal(token) {
        // 创建终端
        var term = new Terminal();
        term.open(document.getElementById('terminal'));
        // 使用fit插件自适应terminal size
        term.fit();
        term.winptyCompatInit();
        term.webLinksInit();
        // 取得输入焦点
        term.focus();
        // 获取要连接的容器信息
        var podNs = document.getElementById("podNs").value
        var podName = document.getElementById("podName").value
        var containerName = document.getElementById("containerName").value
        // 连接websocket
        // ws = new WebSocket("ws://10.10.152.39:30001/api/ws?" + "podNs=" + podNs + "&podName=" + podName + "&containerName=" + containerName );
        const ws = new WebSocket(`wss://k8s-webshell.finupgroup.com:30001/api/ws?token=${token}`);
        ws.onopen = function(event) {
          console.log("onopen");
          var msg = {type: "input", input: '\r'};
          ws.send(JSON.stringify(msg))
        };
        ws.onclose = function(event) {
          console.log("onclose")
        };
        ws.onmessage = function(event) {
          // 服务端ssh输出, 写到web shell展示
          term.write(event.data)
        };
        ws.onerror = function(event) {
          console.log("onerror")
        };
        // 当浏览器窗口变化时, 重新适配终端
        window.addEventListener("resize", function () {
          term.fit()
          // 把web终端的尺寸term.rows和term.cols发给服务端, 通知sshd调整输出宽度
          var msg = {
            type: "resize",
            rows: term.rows,
            cols: term.cols
          };
          ws.send(JSON.stringify(msg))
          // console.log(term.rows + "," + term.cols)
        });
        // 当向web终端敲入字符时候的回调
        term.on('data', function(input) {
          // 写给服务端, 由服务端发给container
          var msg = {type: "input", input: input}
          ws.send(JSON.stringify(msg))
        })
      }
    }
  }
</script>