/**
 * Created by xifei.wu on 2017/12/1.
 */
import Vue from 'vue';
import Axios from 'axios';

class NetworkConfig {
  constructor() {
    this.setConfig();
  }

  // TODO: not used
  downloadUrl(url) {
    let iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    iframe.onload = function () {
      document.body.removeChild(iframe)
    };
    document.body.appendChild(iframe);
  }
  // TODO: not used
  downloadFile(response) {
    const blob = new Blob([response])
    const fileName = '测试表格123.xls'
    if ('download' in document.createElement('a')) { // 非IE下载
      const elink = document.createElement('a')
      elink.download = fileName
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href) // 释放URL 对象
      document.body.removeChild(elink)
    } else { // IE10+下载
      navigator.msSaveBlob(blob, fileName)
    }
  }

  getContentTypeList(response) {
    return response.headers['content-type'].split(';');
  }

  getToken() {
    let token = null;
    try {
      token = Vue.prototype.$storeHelper.getUserInfo('token');
    } catch (err) {
    }
    return token;
  }

  goToLoginPage() {
    Vue.prototype.$utils.goToPath('/login');
  }

  setToken(token) {
    if (Vue && Vue.prototype && Vue.prototype.$storeHelper && Vue.prototype.$storeHelper.updateLoginState) {
      Vue.prototype.$storeHelper.updateLoginState('userInfo/token', token);
    }
  }

  /**
   * data format of response.data
   * 1. format used before(still in use)
   *  {
   *    "code": 0,
   *    "t": 1526456817162,
   *    "content": {
   *      "permission": [{
   *        "id": 300,
   *        "name": "应用管理",
   *        "permissionType": "MENU",
   *        "path": "/app",
   *        "parentId": 0,
   *      }],
   *      "user": {
   *        "username": "admin",
   *        "password": null,
   *      }
   *    }
   *  }
   * 2. new format
   *  {
   *    "success": true,
   *    "dup": false,
   *    "content": "docker envs are",
   *    "code": null,
   *    "msg": null,
   *    "t": 1532434559536,
   *    "failure": false,
   *    "items": null
   *  }
   */

  setConfig(Vue) {
    // Axios.defaults.withCredentials = true;
    Axios.defaults.timeout = 15000;

    let currentToken = this.getToken();
    //添加请求拦截器
    Axios.interceptors.request.use(function(config) {
      //在发送请求之前做某事
      // console.log('config');
      // console.log(config);
      // let token = window.localStorage.getItem('token');
      // if (!currentToken) {
      //   currentToken = Vue.prototype.$storeHelper.getUserInfo('token');
      // }
      if (currentToken) {
        config.headers['token'] = currentToken;
      }
      return config;
    }, function(error) {
      //请求错误时做些事
      return Promise.reject(error);
    });

    //添加响应拦截器
    Axios.interceptors.response.use((response) => {
      // console.log(response);
      if (this.getContentTypeList(response).indexOf('application/octet-stream') > -1) {
        return response;
      } else {
        if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('code')) {
          let statueCode = response.data.code;
          if (0 === statueCode) {
            if ('token' in response.headers && currentToken !== response.headers['token']) {
              // window.localStorage.setItem('token', response.headers['token']);
              this.setToken(response.headers['token']);
              currentToken = response.headers['token'];
            }
          } else if (555 === statueCode) {
            // localStorage.removeItem('token');
            this.setToken(null);
            this.goToLoginPage();
          }
        }
        return response;
      }
    }, function(error) {
      //请求错误时做些事
      return Promise.reject(error);
    });
  }
}

export default NetworkConfig;