// import '$assets/static/libs/xterm-dist/xterm.js';
// import '$assets/static/libs/xterm-dist/addons/fit/fit.js';
// import '$assets/static/libs/xterm-dist/addons/winptyCompat/winptyCompat.js';
// import '$assets/static/libs/xterm-dist/addons/webLinks/webLinks.js';
// import '$assets/static/libs/xterm-dist/xterm.css';

import Utils from '../js/utils';
import Utf8Convert from './utf8-chunks-converter.js';
import EventEmitter from '$assets/libs/eventemitter3';

export default class XtermHelper extends EventEmitter{
  constructor() {
    super();
    this.utils = new Utils();
    this.convertHelper = new Utf8Convert();
    this.hasLoadXterm = false;
    this.xterm = null;
    this.websocket = null;
  }

  async loadXterm() {
    if (this.hasLoadXterm) {
      return 'has load xterm';
    }
    try {
      const loadTaskList = [
        '/assets/libs/xterm-dist/xterm.js',
        '/assets/libs/xterm-dist/addons/fit/fit.js',
        '/assets/libs/xterm-dist/addons/winptyCompat/winptyCompat.js',
        '/assets/libs/xterm-dist/addons/webLinks/webLinks.js',
        '/assets/libs/xterm-dist/xterm.css'
      ].map(file => {
        // if (file.endsWith('js'))
        return this.utils.lazyLoad(file.split('.').pop(), file);
      });
      const result = await Promise.all(loadTaskList);
      // xterm配置自适应大小插件
      Terminal.applyAddon(fit);
      // 这俩插件不知道干嘛的, 用总比不用好
      Terminal.applyAddon(winptyCompat);
      Terminal.applyAddon(webLinks);
      this.hasLoadXterm = true;
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getTerminal(target) {
    await this.loadXterm();
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
    term.open(target);
    // 使用fit插件自适应terminal size
    term.fit();
    term.winptyCompatInit();
    term.webLinksInit();
    // 取得输入焦点
    term.focus();

    term.onScreenResize = () => {
      term.fit();
      // 把web终端的尺寸term.rows和term.cols发给服务端, 通知sshd调整输出宽度
      var msg = {
        type: "resize",
        rows: term.rows,
        cols: term.cols
      };
      term.emit('rich-data', msg);
    };
    // 当浏览器窗口变化时, 重新适配终端
    window.addEventListener("resize", term.onScreenResize);

    // 当向web终端敲入字符时候的回调
    term.on('data', (input) => {
      // 写给服务端, 由服务端发给container
      term.emit('rich-data', {
        type: "input",
        input: input
      });
    });
    return term;
  }

  async getWebSocket(assistInfo) {
    // 连接websocket
    const ws = new WebSocket(`wss://${assistInfo.host}:${assistInfo.port}/api/ws?token=${assistInfo.token}`);
    return new Promise((resolve, reject) => {
      ws.onopen = (evt) => {
        this.emit('open', evt);
        resolve(ws);
      };
      ws.onclose = (evt) => {
        // console.log("onclose")
        this.emit('close', evt);
        reject(evt);
      };
      ws.onerror = (evt) => {
        // console.log("onerror");
        // console.log(evt);
        this.emit('error', evt);
        reject(evt);
      };
    });
  }

  async connectToXterm(assistInfo, target, sayHello, listenXterm = true) {
    const xterm = await this.getTerminal(target);
    const ws = await this.getWebSocket(assistInfo);
    this.xterm = xterm;
    this.websocket = ws;

    // var msg = {type: "input", input: '\r'};
    // ws.send(JSON.stringify(msg));
    xterm.onScreenResize();
    if (listenXterm) {
      xterm.on('rich-data', obj => {
        ws.send(JSON.stringify(obj));
      });
    }
    if (sayHello) {
      setTimeout(() => {
        var msg = {type: "input", input: sayHello}
        ws.send(JSON.stringify(msg));
      }, 200);
    }

    ws.onmessage = evt => {
      const data = evt.data;
      // 服务端ssh输出, 写到web shell展示
      if (data instanceof ArrayBuffer || data instanceof Blob) {
        this.convertHelper.convert(data, (err, str) => {
          if (err) {
            console.log(err);
          }
          // console.log(str);
          xterm.write(str);
        })
      } else {
        xterm.write(data);
      }
    };
  }

  close() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    if (this.xterm) {
      if (this.xterm.onScreenResize) {
        window.removeEventListener('resize', this.xterm.onScreenResize);
      }
      this.xterm.destroy();
      this.xterm = null;
    }
  }
}