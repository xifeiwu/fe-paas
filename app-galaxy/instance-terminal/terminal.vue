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

  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
  // the lowest limit is Chrome, with 0x10000 args.
  // We go 1 magnitude less, for safety
  var MAX_ARGUMENTS_LENGTH = 0x1000;
  class ConvertHelper {
    constructor() {
      this.buf = null;
      this.bufList = [];
      this.isChunk = false;
    }

    async readAsArrayBuffer(blob) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.readAsArrayBuffer(blob);
        reader.onload = function() {
          var result = reader.result;
          resolve(result);
        }
        reader.onerror = function(e) {
          reject(e)
        }
      })
    }

    concat(buf1, buf2) {
      if (!buf1) {
        return buf2
      }
      if (!buf2) {
        return buf1;
      }

      var concated = new Uint8Array(buf1.byteLength + buf2.byteLength);
      concated.set(buf1);
      concated.set(buf2, buf1.byteLength);
      return concated;
    }

    // @parms bytes: Uint8Array
    async convert2(buf, cb) {
      if (buf instanceof Blob) {
        buf = await this.readAsArrayBuffer(buf);
      }
      if (buf instanceof ArrayBuffer) {
        buf = new Uint8Array(buf);
      }
      if (buf.byteLength >= 4 * 1024) {
        this.isChunk = true;
      } else {
        this.isChunk = false;
      }
      // console.log(`buf.byteLength: ${buf.byteLength}`);
      // console.log(buf);
      if (this.isChunk) {
        if (!this.isStartValid(buf)) {
          // buf = this.concat(this.buf, buf);
          buf = this.getBufAll(buf);
        }
        // console.log(buf);
        // console.log(this.isStartValid(buf));
        // console.log(this.isEndValid(buf));
        // console.log(this.getLastInValidPos(buf));
        if (!this.isEndValid(buf)) {
          this.bufList.push(buf);
        } else {
          cb(null, this.forceUtf8Slice(this.getBufAll(buf)));
        }
      } else {
        cb(null, this.forceUtf8Slice(this.getBufAll(buf)));
      }
    }

    getBufAll(buf) {
      this.bufList.push(buf);
      var length = this.bufList.reduce((sum, buf) => {
        sum += buf.byteLength;
        return sum
      }, 0);

      var concated = new Uint8Array(length);
      var pos = 0;
      this.bufList.forEach(it => {
        concated.set(it, pos);
        pos += it.byteLength;
      });

      this.bufList.length = 0;
      return concated;
    }

    async convert(buf, cb) {
      if (buf instanceof Blob) {
        buf = await this.readAsArrayBuffer(buf);
      }
      if (buf instanceof ArrayBuffer) {
        buf = new Uint8Array(buf);
      }
      if (this.isEndValid(buf) || buf.byteLength < 2 * 1024) {
        cb(null, this.forceUtf8Slice(this.getBufAll(buf)));
      } else {
        this.bufList.push(buf);
      }
    }

    isStartValid(buf) {
      var pos = this.getInValidPos(buf.subarray(0, 4));
      return pos > 0;
    }
    isEndValid(buf) {
      return this.getInValidPos(buf.subarray(-4)) === 4 || this.getInValidPos(buf.subarray(-3)) === 3
        || this.getInValidPos(buf.subarray(-2)) === 2 || this.getInValidPos(buf.subarray(-1)) === 1
    }
    getLastInValidPos(buf) {
      var size = 8;
      var pos = 0;
      while (pos === 0 && size > 0) {
        pos = this.getInValidPos(buf.subarray(size * -1));
        if (pos === 0) {
          size -= 1;
        }
      }
      return pos - size;
    }

    getInValidPos (buf) {
      var start = 0, end = buf.byteLength;

      var i = start
      while (i < end) {
        var firstByte = buf[i]
        var codePoint = null
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
            : (firstByte > 0xBF) ? 2
              : 1

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte
              }
              break
            case 2:
              secondByte = buf[i + 1]
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 3:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 4:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              fourthByte = buf[i + 3]
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint
                }
              }
          }
        }
        if (codePoint === null) {
          break;
        } else {
          i += bytesPerSequence
        }
      }
      return i;
    }

    decodeCodePointsArray (codePoints) {
      var len = codePoints.length
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = ''
      var i = 0
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        )
      }
      return res
    }

    forceUtf8Slice (buf, start, end) {
      var res = [];
      var start = 0;
      var end = buf.byteLength;

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
            : (firstByte > 0xBF) ? 2
              : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte
              }
              break;
            case 2:
              secondByte = buf[i + 1]
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint
                }
              }
              break;
            case 3:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint
                }
              }
              break;
            case 4:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              fourthByte = buf[i + 3]
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD
          bytesPerSequence = 1
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000
          res.push(codePoint >>> 10 & 0x3FF | 0xD800)
          codePoint = 0xDC00 | codePoint & 0x3FF
        }

        res.push(codePoint)
        i += bytesPerSequence
      }

      return this.decodeCodePointsArray(res)
    }
  }
  export default {
    created() {
      this.convertHelper = new ConvertHelper();
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
        const onResize = () => {
            term.fit();
            // 把web终端的尺寸term.rows和term.cols发给服务端, 通知sshd调整输出宽度
            var msg = {
              type: "resize",
              rows: term.rows,
              cols: term.cols
            };
            ws.send(JSON.stringify(msg));
        };
        ws.onopen = (evt) => {
//          console.log("onopen");
          onResize();
          var msg = {type: "input", input: '\r'};
          ws.send(JSON.stringify(msg));
        };
        ws.onclose = (evt) => {
//          console.log("onclose")
        };
        ws.onmessage = (evt) => {
          // 服务端ssh输出, 写到web shell展示
          const data = event.data;
          if (data instanceof ArrayBuffer || data instanceof Blob) {
            this.convertHelper.convert(data, (err, str) => {
              if (err) {
                console.log(err);
              }
              term.write(str);
            })
          } else {
            term.write(data);
          }
        };
        ws.onerror = (evt) => {
//          console.log("onerror");
          console.log(evt);
        };
        // 当浏览器窗口变化时, 重新适配终端
        window.addEventListener("resize", onResize);
        // 当向web终端敲入字符时候的回调
        term.on('data', (input) => {
          // 写给服务端, 由服务端发给container
          var msg = {type: "input", input: input}
          ws.send(JSON.stringify(msg))
        });
      }
    }
  }
</script>