import Vue from 'vue';
import axios from 'axios';
import querystring from 'query-string';
import Utils from './utils';

const utils = new Utils();

class Net {
  constructor() {
    // 提示（错误、警告）除抖
    this.debouncedShowError = utils.debounce(this.showError.bind(this), 1000, true);
    this.debouncedShowWarning = utils.debounce(this.showWarning.bind(this), 1000, true);

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
      //通过lob获取scrum列表
      'get_scrum_list_by_lob':{
        path:'/queryScrumByLobId',
        method:'get',
      },
      // 获取所有Scrum列表
      'scrum_list': {
        path: '/group/getScrumList',
        method: 'get'
      },
      // 应用列表
      'app_list_by_group': {
        path: '/application/queryByPage',
        method: 'post'
      },
      // 应用列表（无权限认证）
      'app_list_by_group_without_permission': {
        path: '/application/queryByGroupId',
        method: 'post'
      },
      // 未读消息条数
      message_unread_count: {
        path: '/message/query/count',
        method: 'post'
      },
      // 获取发布状态
      publish_status: {
        path: '/system/deployed',
        method: 'get'
      }
    };
    Object.keys(PAAS_URL_LIST).forEach(key => {
      let item = PAAS_URL_LIST[key];
      item.path = this.PAAS_PREFIX + item.path;
    });

    this.URL_LIST = PAAS_URL_LIST;

    this.page = {
      'index': '/index',
      'login': '/login',
      'cas-login': '/cas-login',
      'paas-login': '/paas-login',
      'profile': '/profile',
      'profile/app': '/profile/app',
      'profile/app/add': '/profile/app/add',
      'profile/app/update': '/profile/app/update',
      'profile/service': '/profile/service',
      'profile/service/add': '/profile/service/add',
      'profile/service/modify': '/profile/service/modify',
      'profile/service/copy': '/profile/service/copy',
      'profile/service/detail': '/profile/service/detail',
      'profile/pipeline': '/profile/pipeline',
      'profile/pipeline/list': '/profile/pipeline/list',
      'profile/pipeline/add': '/profile/pipeline/add',
      'profile/pipeline/modify': '/profile/pipeline/modify',
      'profile/pipeline/update': '/profile/pipeline/update',
      'profile/pipeline/records': '/profile/pipeline/records',
      'profile/instance': '/profile/instance',
      'profile/monitor': '/profile/monitor',
      'profile/domain': '/profile/domain',
      'profile/domain/white-list': '/profile/domain/white-list',
      'profile/log': '/profile/log',
      'profile/log/deploy': '/profile/log/deploy',
      'profile/log/run': '/profile/log/run',
      'profile/oauth': '/profile/oauth',
      'profile/oauth/key': '/profile/oauth/key',
      'profile/oauth/url': '/profile/oauth/url',
      'profile/work-order': '/profile/work-order',
      'profile/work-order/list': '/profile/work-order/list',
      'profile/work-order/todo': '/profile/work-order/todo',
      'profile/work-order/todo/add': '/profile/work-order/todo/add',
      'profile/work-order/todo/modify': '/profile/work-order/todo/modify',
      'profile/config-server': '/profile/config-server',
      'user/info': '/user/info',
      'user/group': '/user/group',
      'user/message': '/user/message',
      'user/operation': '/user/operation',
      'docs': '/docs',
      'docs/paas': '/docs/paas',
      'manage': '/manage',
      'terminal': '/terminal',
      'profile/image': '/profile/image',
      'instance-terminal': '/instance-terminal',
      'profile/image/repo': '/profile/image/repo',
      'profile/image/repo/version': '/profile/image/repo/version',
      'profile/middleware': '/profile/middleware',
      'profile/middleware/mariadb': '/profile/middleware/mariadb',
      'profile/middleware/mariadb/add': '/profile/middleware/mariadb/add',
      'profile/middleware/mariadb/modify': '/profile/middleware/mariadb/modify',
      'profile/middleware/mariadb/backup': '/profile/middleware/mariadb/backup',
      'profile/middleware/redis': '/profile/middleware/redis',
      'profile/middleware/redis/add': '/profile/middleware/redis/add',
      'profile/middleware/redis/modify': '/profile/middleware/redis/modify'
    };

    this.vm = new Vue({
      data: {
        requestingUrlListLength: 0
      },
      template: '<div>{{ message }}</div>'
    });
    this.requestingUrlList = [];
  }

  // add prop to urlDesc without change origin value
  updateUrlDesc(desc, props) {
    return Object.assign({}, desc, props);
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

  /**
   * show error
   * @param err: {title, message}
   */
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
   * show error
   * @param err: {title, message}
   */
  showWarning (err) {
    if (err instanceof Error) {
      err = {
        title: '请求失败',
        message: err.toString()
      }
    }
    const title = `${err.title}`;
    Vue.prototype.$notify.warning({
      title,
      message: err.message,
      duration: 3000
    })
  };

  /**
   * 格式化请求
   * @param path
   * @param method
   * @param options,
   * @param config, config for axios
   * @returns request in the form of Promise
   */
  getResponse({path, method}, options = {}, config) {
    try {
      let instance = axios;
      if (config) {
        instance = axios.create(config);
      }
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
    } catch(err) {
      return Promise.reject(err);
    } finally {
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
   * @param level: LEVEL_ERROR(default), LEVEL_WARNING, LEVEL_IGNORE
   * @param errObj: {
   *   title: String,
   *   message: String
   * }
   * @param partial: not trigger global loading status
   * @param withTimeStamp
   * @param withCode
   * @param options: {
   *  query: {key: value},
   *  params: {id}
   *  payload: {}
   * }
   * @returns {Promise}
   * return resData.content if success
   * else return {}
   */
  async requestPaasServer({path, method, level = 'LEVEL_ERROR', errObj = null, partial = false, withTimeStamp = false, withCode=false, withMorePage = false}, options = {}) {
    // 访客只能进入首页
    if (Vue.prototype.$storeHelper.isGuest) {
      window.location.href = this.page['index'];
      return;
    }
    try {
      if (!partial) {
        this.addToRequestingRrlList(path);
      }
      const response = await this.getResponse({path, method}, options, {
        timeout: 15000,
        headers: {
          token: Vue.prototype.$storeHelper.getUserInfo('token')
        }
      });
      const resData = response.data;
      if (this.isResponseSuccess(resData)) {
        // add more info of response to result
        const moreInfo = withTimeStamp || withCode || withMorePage;
        if (moreInfo) {
          const result = {
            content: resData.content,
          };
          withTimeStamp && (result['timeStamp'] = parseInt(resData.t));
          withCode && (result['code'] = resData.code);
          withMorePage && (result['more'] = resData.more);
          return result
        } else {
          return resData.content;
        }
      } else {
        // 请求返回的状态不正确
        // code 555 stands for token is out of date
        if (resData.code === 555) {
          const logoutHref = this.getCasLogoutHref();
          if (logoutHref) {
            Vue.prototype.$storeHelper.logout();
            window.location.href = logoutHref;
          }
          return;
        }

        if (resData.hasOwnProperty('level')) {
          level = resData['level'];
        }
        errObj = errObj ? errObj : {
          code: resData.code,
          title: '请求失败',
          message: resData.msg
        };
        if (level === 'LEVEL_IGNORE') {
          return Promise.resolve(errObj);
        } else if (level === 'LEVEL_WARNING') {
          this.showWarning(errObj);
          return Promise.reject(errObj);
        } else {
          this.showError(errObj);
          return Promise.reject(errObj);
        }
      }
    } catch (error) {
      // 请求过程发生错误（一般是超时）
      // 请求超时
      if (level === 'LEVEL_IGNORE') {
        return Promise.resolve(error);
      } else if (level === 'LEVEL_WARNING') {
        errObj = errObj ? errObj : {
          title: '网络请求失败',
          message: `请求路径：${path.replace(this.PAAS_PREFIX, '')}，${error.toString()}`
        };
        this.showWarning(errObj);
        return Promise.reject(error);
      } else {
        if (error.code === 'ECONNABORTED') {
          errObj = errObj ? errObj : {
            title: '网络请求失败',
            message: `网络请求超时，请稍后再试。请求路径：${path.replace(this.PAAS_PREFIX, '')}`
          };
          this.debouncedShowError(errObj);
        } else {
          errObj = errObj ? errObj : {
            title: '网络请求失败',
            message: `请求路径：${path.replace(this.PAAS_PREFIX, '')}，${error.toString()}`
          };
          this.showError(errObj);
        }
        return Promise.reject(error);
      }
    } finally {
      this.removeFromRequestingRrlList(path);
    }
  }

  async requestAssistServer({path, method, partial = false, withTimeStamp = false, withCode=false}, options = {}) {
    try {
      if (!partial) {
        this.addToRequestingRrlList(path);
      }
      const response = await this.getResponse({path, method}, options, {
        timeout: 15000,
        headers: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJmZS1wYWFzIiwiaWF0IjoxNTM1ODE0NzU2LCJleHAiOjE1NjczNTA3NTZ9.Kua5fOfg7KJ5xOU08ImvcWdSfJnZpdHATQ_uwCW1nAI'
        }
      });
      const resData = response.data;
      if (this.isResponseSuccess(resData)) {
        // add more info of response to result
        const moreInfo = withTimeStamp || withCode;
        if (moreInfo) {
          const result = {
            content: resData.content,
          };
          withTimeStamp && (result['timeStamp'] = parseInt(resData.t));
          withCode && (result['code'] = resData.code);
          return result
        } else {
          return resData.content;
        }
      } else {
        const err = {
          code: resData.code,
          title: '请求失败',
          message: resData.msg
        };
        this.showError(err);
        return Promise.reject(err);
      }
    } catch (error) {
      if (error.hasOwnProperty('title') && error.hasOwnProperty('message')) {
      } else if (error instanceof Error) {
        error = {
          title: '网络请求错误',
          message: `请求路径：${path.replace(this.ASSIST_PREFIX, '')}，${error.toString()}`
        };
      }
      this.showError(error);
      return Promise.reject(error);
    } finally {
      this.removeFromRequestingRrlList(path);
    }
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
      this.getResponse({path, method}, options).then(res => {
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

  getCasServer() {
    var casServer = 'http://cas.finupgroup.com/puhui-cas';
    if ([location.host, location.hostname].includes('cloud.renmaitech.com')) {
      casServer = 'https://cas.renmaitech.com/puhui-cas';
    }
    const serverMap = {
      // 校验ticket才用域名cas.info.production
      // production: 'http://cas.info.production/puhui-cas',
    };

    if (serverMap.hasOwnProperty(NODE_ENV)) {
      casServer = serverMap[NODE_ENV];
    }
    return casServer;
  }
  // 获取(CAS)登录的url
  getCasLoginHref(withPathName = true) {
    // return null;
    const casServer = this.getCasServer();
    const pathName = window.location.pathname;
    // const loginHref = `${this.page['login']}#${pathName}`;
    var loginHref = `${casServer}/login?service=${location.origin}${this.page['cas-login']}`;
    if (withPathName) {
      loginHref = `${loginHref}?to=${pathName}`
    }
    return loginHref;
  }
  // 获取CAS登出的url
  getCasLogoutHref() {
    const casServer = this.getCasServer();
    const loginHref = this.getCasLoginHref();
    var logoutHref = null;
    if (loginHref) {
      logoutHref = `${casServer}/logout?service=${loginHref}`;
    }
    return logoutHref;
  }
}

export default Net;
