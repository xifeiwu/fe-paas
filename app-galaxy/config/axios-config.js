import Vue from 'vue';
import axios from 'axios';

/**
 * network config for axios
 */
class AxiosConfig {
  constructor() {
    this.setConfig();
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
    // console.log('goToLoginPage');
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
    // axios.defaults.withCredentials = true;
    axios.defaults.timeout = 15000;

    // let currentToken = this.getToken();
    //添加请求拦截器
    axios.interceptors.request.use((config) => {
      //在发送请求之前做某事
      // if (currentToken) {
      //   config.headers['token'] = currentToken;
      // }
      let token = this.getToken();
      if (token) {
        config.headers['token'] = token;
      }
      return config;
    }, function(error) {
      //请求错误时做些事
      return Promise.reject(error);
    });

    //添加响应拦截器
    axios.interceptors.response.use((response) => {
      if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('code')) {
        let statueCode = response.data.code;
        if (0 === statueCode) {
        } else if (555 === statueCode) {
          this.setToken(null);
          this.goToLoginPage();
        }
      }
      return response;
    }, function(error) {
      //请求错误时做些事
      return Promise.reject(error);
    });
  }
}

export default new AxiosConfig();