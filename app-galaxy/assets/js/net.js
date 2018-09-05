import Vue from 'vue';
import axios from 'axios';
import querystring from 'query-string';

class Net {
  constructor() {
    this.ASSIST_PREFIX = '/n-api/assist';
    this.CDN_PREFIX = '/n-api';
    // this.DNS_PREFIX = '/n-api';
    this.PAAS_PREFIX = '/j-api/paas';


    const PAAS_URL_LIST = {
      // 用户退出
      'logout': {
        path: '/userLogout',
        method: 'get'
      },
      // 获取用户所在组列表
      'user_group_list': {
        path: '/group/queryByUser',
        method: 'get'
      },
      // 获取line of business列表
      'lob_list': {
        path: '/group/queryLobList',
        method: 'get'
      },
    };
    Object.keys(PAAS_URL_LIST).forEach(key => {
      let item = PAAS_URL_LIST[key];
      item.path = this.PAAS_PREFIX + item.path;
    });

    this.URL_LIST = PAAS_URL_LIST;

    this.page = {
      'login': '/login',
      'profile': '/profile',
      'profile/app': '/app',
      'profile/instance': '/instance',
      'profile/oauth': '/oauth',
      'profile/config-server': '/config-server',
      'user/info': '/user/info',
      'user/group': '/user/group',
      'docs': '/docs',
      'index': '/index',
      'manage': '/manage'
    };

    this.vm = new Vue({
      data: {
        requestingUrlListLength: 0
      },
      template: '<div>{{ message }}</div>'
    });
    this.requestingUrlList = [];
  }

  // some function of Vue.prototype may be used in net.js
  setVue() {}

  addToRequestingRrlList(path) {
    this.requestingUrlList.push(path);
    this.vm.requestingUrlListLength = this.requestingUrlList.length;
  }
  removeFromRequestingRrlList(path) {
    const index = this.requestingUrlList.indexOf(path);
    if (index > -1) {
      this.requestingUrlList.splice(index, 1);
    }
    this.vm.requestingUrlListLength = this.requestingUrlList.length;
  }
  /**
   * get content from response
   * 1. if response if error, return null
   * 2. if response is ok, if content exist return content of response, else return empty object {}
   * @param response
   * @returns null, response err
   *          object, response ok
   *
   * format of success response.data:
   * {
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
   */
  getResponseContent (response) {
    let content = null;
    if ('data' in response) {
      let data = response.data;
      if (0 === data.code) {
        content = data.content ? data.content : {};
      } else {
        // console.log(this.getResponseContent.caller);
        console.log('request error:' + JSON.stringify(data));
      }
    }
    return content;
  }

  getResponseContent2 (response) {
    let content = null;
    if ('data' in response) {
      let data = response.data;
      if (true === data.success) {
        content = data.content ? data.content : {};
      } else {
        console.log('request error:' + JSON.stringify(data));
      }
    }
    return content;
  }

  /**
   * get the message shown to user from error
   * @param error
   */
  getMsgFromErrorResponse(error) {
    let content = {
      title: '网络错误',
      msg: '请与管理员联系'
    };
    let response = null, data = null;
    if (error.hasOwnProperty('response')) {
      response = error.response;
      if (response && response.hasOwnProperty('data')) {
        data = response.data;
        if (data.hasOwnProperty('error') && data.hasOwnProperty('path')) {
          content.msg = data.error + ': ' + data.path;
        }
      }
    }
    return content;
  }

  /**
   * get the message to user from data
   * @param response
   * @param default error tip
   * @returns {{success: boolean, title: string, msg: string}}
   *
   * format of error response.data
   * {
   *   "msg":"用户名或密码错误",
   *   "code":500,
   *   "t":1526456545447
   * }
   */
  getResponseMsg(response, {successMsg, errorMsg} = {successMsg: '', errorMsg: ''}) {
    let result = {
      success: false,
      title: '',
      msg: ''
    };
    if ('data' in response) {
      let data = response.data;
      if (0 === data.code) {
        result.success = true;
        result.title = '成功！';
        result.msg = '';
      } else {
        result.success = false;
        result.title = '错误! ' + (data.hasOwnProperty('code') ? data.code : '');
      }
      if (data.hasOwnProperty('msg') && data.msg && (data.msg.length > 0)) {
        result.msg = data.msg
      } else if (data.hasOwnProperty('content') && data.content && (data.content.length > 0)) {
        result.msg = JSON.stringify(data.content);
      } else {
        if (result.success) {
          result.msg = successMsg;
        } else {
          result.msg = errorMsg;
        }
      }
    } else {
      result.title = '失败';
      result.msg = errorMsg;
    }
    return result;
  }

  getResponseMsg2(response, {successMsg, errorMsg} = {successMsg: '', errorMsg: ''}) {
    let result = {
      success: false,
      title: '',
      msg: ''
    };
    if ('data' in response) {
      let data = response.data;
      if (true === data.success) {
        result.success = true;
        result.title = '成功！';
        result.msg = '';
      } else {
        result.success = false;
        result.title = '错误! ' + (data.hasOwnProperty('code') ? data.code : '');
      }
      if (data.hasOwnProperty('msg') && data.msg && (data.msg.length > 0)) {
        result.msg = data.msg
      } else if (data.hasOwnProperty('content') && data.content && (data.content.length > 0)) {
        result.msg = JSON.stringify(data.content);
      } else {
        if (result.success) {
          result.msg = successMsg;
        } else {
          result.msg = errorMsg;
        }
      }
    } else {
      result.title = '失败';
      result.msg = errorMsg;
    }
    return result;
  }

  showSuccess(msg) {
    Vue.prototype.$notify.success({
      title: '成功',
      message: msg,
      duration: 6000
    })
  }
  showError (err) {
    if (err instanceof Error) {
      err = {
        title: '请求失败',
        message: err.toString()
      }
    }
    const title = `${err.title}!`;
    Vue.prototype.$notify.error({
      title,
      message: err.message,
      duration: 3000
    })
  };

  /**
   * 格式化请求
   * @param path
   * @param method
   * @param options
   * @returns request in the form of Promise
   */
  formatRequest({path, method}, options = {}) {
    try {
      if (!path || !method) {
        return Promise.reject({
          title: '参数错误',
          message: '未设置请求方式'
        });
      }
      let payload = {};
      if (options.params) {
        Object.keys(options.params).forEach((key) => {
          // path = path.replace('{' + key + '}', encodeURIComponent(options.params[key]));
          path = path.replace('{' + key + '}', options.params[key]);
        });
      }
      if (options.query) {
        path = path + '?' + querystring.stringify(options.query);
      }
      if (options.payload) {
        payload = options.payload;
      }
      return axios[method](path, payload);
    } catch(err) {
      return Promise.reject(err);
    } finally {
    }
  }

  /**
   * 格式化请求
   * @param path
   * @param method
   * @param options
   * @returns request in the form of Promise
   */
  getFormattedRequest(config) {
    const instance = axios.create(config);
    return ({path, method}, options = {}) => {
      try {
        if (!path || !method) {
          return Promise.reject({
            title: '参数错误',
            message: '未设置请求方式'
          });
        }
        let payload = {};
        if (options.params) {
          Object.keys(options.params).forEach((key) => {
            // path = path.replace('{' + key + '}', encodeURIComponent(options.params[key]));
            path = path.replace('{' + key + '}', options.params[key]);
          });
        }
        if (options.query) {
          path = path + '?' + querystring.stringify(options.query);
        }
        if (options.payload) {
          payload = options.payload;
        }
        return instance[method](path, payload);
      } catch (err) {
        return Promise.reject(err);
      } finally {
      }
    }
  }

  isResponseSuccess(resData) {
    let success = false;
    if (resData.hasOwnProperty('success')) {
      success = resData['success'];
    } else if (resData.hasOwnProperty('code')) {
      success = resData.code === 0;
    }
    return success;
  }
  /**
   *
   * @param path
   * @param method
   * @param options: {
   *  query: {key: value},
   *  params: {id}
   *  payload: {}
   * }
   * @returns {Promise}
   * return resData.content if success
   * else return {}
   */
  requestPaasServer({path, method}, options = {}) {
    this.addToRequestingRrlList(path);
    return new Promise((resolve, reject) => {
      this.formatRequest({path, method}, options).then(res => {
        let resData = res.data;
        if (this.isResponseSuccess(resData)) {
          resolve(resData.content);
        } else {
          const err = {
            code: resData.code,
            title: '请求失败',
            message: resData.msg
          };
          this.showError(err);
          reject(err);
        }
      }).catch(error => {
        if (error.hasOwnProperty('title') && error.hasOwnProperty('message')) {
          this.showError(error);
          reject(error);
        } else {
          let err = {
            title: '网络请求错误',
            message: `请求路径：${path.replace(this.PAAS_PREFIX, '')}，${error.toString()}`
          };
          this.showError(err);
          reject(err);
        }
      }).finally(() => {
        this.removeFromRequestingRrlList(path);
      });
    });
  }

  requestAssistServer({path, method}, options = {}) {
    return new Promise((resolve, reject) => {
      this.getFormattedRequest({
        timeout: 15000,
        headers: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJmZS1wYWFzIiwiaWF0IjoxNTM1ODE0NzU2LCJleHAiOjE1NjczNTA3NTZ9.Kua5fOfg7KJ5xOU08ImvcWdSfJnZpdHATQ_uwCW1nAI'
        }
      })({path, method}, options).then(res => {
        let resData = res.data;
        if (resData.hasOwnProperty('success')) {
          if (resData.success) {
            resolve(resData.content);
          } else {
            const err = {
              code: resData.code,
              title: '请求失败',
              message: resData.msg
            };
            this.showError(err);
            reject(err);
          }
        } else if (resData.hasOwnProperty('code')) {
          if (resData.code === 0) {
            // show msg if exist, when code == 0
            // if (resData.hasOwnProperty('msg') && resData.msg) {
            //   this.showSuccess(resData.msg);
            // }
            resolve(resData.content);
          } else {
            const err = {
              code: resData.code,
              title: '请求失败',
              message: resData.msg
            };
            this.showError(err);
            reject(err);
          }
        }
      }).catch(error => {
        if (error.hasOwnProperty('title') && error.hasOwnProperty('message')) {
          this.showError(error);
          reject(error);
        } else {
          path = path.replace(this.ASSIST_PREFIX, '');
          let err = {
            title: '网络请求错误',
            message: `请求路径：${path}，${error.toString()}`
          };
          this.showError(err);
          reject(err);
        }
      });
    });
  }
  /**
   * format of response data from qiniu-cdn is not fixed
   * {"code":200}
   * or
   * {"domains": [], "marker": "MTUzMTEzMjg5NDQxMDAwMDAwMA=="}
   *
   * format of response data from dns-pod
    {
      "status": {
        "code": "1",
        "message": "Action completed successful",
        "created_at": "2015-01-18 20:07:29"
      },
      "record": {
        "id": 16909160,
        "name": "@",
        "status": "disable"
      }
    }
   */
  // request for dns server and cdn server
  requestDomainServer({path, method}, options = {}) {
    return new Promise((resolve, reject) => {
      this.formatRequest({path, method}, options).then(res => {
        let resData = res.data;
        if (resData.hasOwnProperty('code')) {
          if (resData.code === 200) {
            // return resData;
            resolve(resData);
          } else {
            const err = {
              code: resData.code,
              title: '请求失败',
              message: resData.msg
            };
            this.showError(err);
            reject(err);
          }
        } else {
          resolve(resData);
        }
      }).catch(error => {
        if (error.hasOwnProperty('title') && error.hasOwnProperty('message')) {
          this.showError(error);
          reject(error);
        } else {
          let err = {
            title: '网络请求错误',
            message: `请求路径：${path}，${error.toString()}`
          };
          this.showError(err);
          reject(err);
        }
      });
    });
  }
}

export default Net;
