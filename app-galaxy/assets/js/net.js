import Vue from 'vue';
import axios from 'axios';

class Net {
  constructor() {
    // this.DOMAIN_PATH_PREFIX = '/n-api/domain';
    this.DOMAIN_PATH_PREFIX = '/api/cdn';
  }
  setVue(Vue) {
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


  showError (err) {
    let title = `${err.title}! ${err.hasOwnProperty('code') ? err.code : ''}`;
    Vue.prototype.$notify.error({
      title,
      message: err.message,
      duration: 0
    })
  };
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
    if (!method) {
      return Promise.reject({
        title: '参数错误',
        message: '未设置请求方式'
      });
    }
    let payload = {};
    if (options.params) {
      Object.keys(options.params).forEach((key) => {
        path = path.replace('{' + key + '}', encodeURIComponent(options.params[key]));
      });
    }
    if (options.query) {
      path = path + '?' + querystring.stringify(data.query);
    }
    if (options.payload) {
      payload = options.payload;
    }
    return new Promise((resolve, reject) => {
      axios[method](path, payload).then(res => {
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
            // return resData;
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

  // request for dns server and cdn server
  requestDomainServer({path, method}, options = {}) {
    if (!method) {
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
      path = path + '?' + querystring.stringify(data.query);
    }
    if (options.payload) {
      payload = options.payload;
    }
    return new Promise((resolve, reject) => {
      axios[method](path, payload).then(res => {
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
          const err = {
            title: '请求失败',
            message: resData
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