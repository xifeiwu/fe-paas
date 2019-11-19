import Vue from 'vue';
import axios from 'axios';
import querystring from 'query-string';
import Utils from './utils';
import Common from './common';

const utils = new Utils();

class Net extends Common {
  constructor() {
    super();
    // 提示（错误、警告）除抖
    this.debouncedShowError = utils.debounce(this.showError.bind(this), 1000, true);
    this.debouncedShowWarning = utils.debounce(this.showWarning.bind(this), 1000, true);

    this.ASSIST_PREFIX = '/n-api/assist';
    this.CDN_PREFIX = '/n-api';
    // this.DNS_PREFIX = '/n-api';
    this.PAAS_PREFIX = '/j-api/paas';

    const PAAS_URL_LIST = {
      // 当前用户禁用的权限
      'user_not_permitted': {
        path: '/user/roles/permissions?exclude=true',
        method: 'get'
      },
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
        method: 'post',
        partial: true,
      },
      // 获取发布状态
      publish_status: {
        path: '/system/deployed',
        method: 'get'
      },

      /** 团队管理 */
      // 获取所有组列表
      'get_all_group_list': {
        path: '/group/queryAllGroup',
        method: 'get'
      },
      // 分页获取团队列表
      'group_list_by_page': {
        path: '/group/queryByPage',
        method: 'post'
      },
      // 团队创建
      'group_create': {
        path: '/group/create',
        method: 'post'
      },
      // 团队更新
      'group_update': {
        path: '/group/update',
        method: 'post'
      },
      // 团队删除
      'group_delete': {
        path: '/group/delete',
        method: 'post'
      },
      // 团队成员添加
      'group_member_add': {
        path: '/group/addUser',
        method: 'post',
        level: 'LEVEL_WARNING'
      },
      // 团队成员删除
      'group_member_remove': {
        path: '/group/user/delete',
        method: 'delete'
      },
      // 获取团队成员
      'group_member_list': {
        path: '/group/users',
        method: 'post'
      },
      // 修改团队成员角色
      'group_member_change_roles': {
        path: '/group/user/updateJob',
        method: 'put'
      },
    };
    Object.keys(PAAS_URL_LIST).forEach(key => {
      let item = PAAS_URL_LIST[key];
      item.path = this.PAAS_PREFIX + item.path;
    });
    this.URL_LIST = PAAS_URL_LIST;

    const URL_LIST_ASSIST = {
      get_websocket_token: {
        path: '/api/paas/terminal/get-token',
        method: 'post'
      }
    };
    Object.keys(URL_LIST_ASSIST).forEach(key => {
      let item = URL_LIST_ASSIST[key];
      item.path = this.ASSIST_PREFIX + item.path;
    });
    this.URL_LIST_ASSIST = URL_LIST_ASSIST;

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
      'profile/service/list': '/profile/service/list',
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
      'profile/pipeline/records/plan': '/profile/pipeline/records/plan',
      'profile/instance': '/profile/instance',
      'profile/monitor': '/profile/monitor',
      'profile/domain': '/profile/domain',
      'profile/domain/white-list': '/profile/domain/white-list',
      'profile/log': '/profile/log',
      'profile/log/deploy': '/profile/log/deploy',
      'profile/log/run': '/profile/log/run',
      'profile/log/canary': '/profile/log/canary',
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
      'user/feedback': '/user/feedback',
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
	    'profile/middleware/mariadb/backup-list': '/profile/middleware/mariadb/backup-list',
      'profile/middleware/mariadb/history': '/profile/middleware/mariadb/history',
      'profile/middleware/redis': '/profile/middleware/redis',
      'profile/middleware/redis/add': '/profile/middleware/redis/add',
      'profile/middleware/redis/modify': '/profile/middleware/redis/modify',
      'manage/node-manage': '/manage/node-manage'
    };

    this.vm = new Vue({
      data: {
        requestingUrlListLength: 0,
        loadingText: null
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
  showError ({title = '', message = ''}) {
    if (!title || !message) {
      console.log(`title or message not found`);
      return;
    }
    Vue.prototype.$notify.error({
      title,
      message,
      duration: 3000
    })
  };
  /**
   * show error
   * @param err: {title, message}
   */
  showWarning ({title = '', message = ''}) {
    if (!title || !message) {
      console.log(`title or message not found`);
      return;
    }
    Vue.prototype.$notify.warning({
      title,
      message,
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

  /**
   * @param method
   * @param path
   * @param params,
   * @param query,
   * @param data,
   * @param headers,
   * @returns request in the form of Promise
   */
  async requestAxiosResponse({method, url, params, query, data, headers, responseType, onUploadProgress, onDownloadProgress, timeout = 0, path, payload}, axiosConfig) {
    url = url ? url : path;
    data = data ? data : payload;
    if (!url) {
      throw new Error('参数不完整');
    }
    var instance = axios;
    if (axiosConfig) {
      instance = axios.create(axiosConfig);
    }
    if (params) {
      Object.keys(params).forEach((key) => {
        // path = path.replace('{' + key + '}', encodeURIComponent(params[key]));
        url = url.replace('{' + key + '}', params[key]);
      });
    }
    const config = {
      method,
      url,
      timeout,
      params: query,
      headers,
      responseType, onUploadProgress, onDownloadProgress
    };
    if (['post', 'put', 'patch', 'delete'].indexOf(method) > -1) {
      config['data'] = data ? data : {};
    }
    return instance.request(config);
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
   * TODO: remove withMorePage
   */
  async requestPaasServer({path, method, timeout = 15000, level = 'LEVEL_ERROR', partial = false, withTimeStamp = false, withCode=false, withMorePage = false, moreData = false}, options = {}) {
    // 访客只能进入首页
    if (Vue.prototype.$storeHelper.isGuest) {
      window.location.href = this.page['index'];
      return;
    }
    try {
      if (!partial) {
        this.addToRequestingRrlList(path);
      }
      const response = await this.requestAxiosResponse(utils.deepMerge({
        path, method, timeout,
      }, options, {
        headers: {
          token: Vue.prototype.$storeHelper.getUserInfo('token')
        }
      }));
      const resData = response.data;
      if (this.isResponseSuccess(resData)) {
        // add more info of response to result
        const moreInfo = withTimeStamp || withCode || withMorePage;
        if (moreInfo || moreData) {
          resData['timeStamp'] = parseInt(resData.t);
          return resData;
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

        const err = new Error(resData.msg);
        err.code = resData.code;
        if (resData.hasOwnProperty('level')) {
          err.level = resData['level'];
        }
        throw err;
      }
    } catch (error) {
      level = error.level ? error.level : level;
      const showTip = {
        LEVEL_IGNORE: () => {},
        LEVEL_WARNING: this.showWarning,
        LEVEL_ERROR: this.debouncedShowError
      }[level];
      const title = error.isAxiosError ? '网络请求失败' : '请求失败';
      var message = `请求路径：${path.replace(this.PAAS_PREFIX, '')}，${error.message}`;
      if (error.code === 'ECONNABORTED') {
        message = `网络请求超时，请稍后再试。请求路径：${path.replace(this.PAAS_PREFIX, '')}`;
      }
      showTip({
        title,
        message
      });
      error.path = path;
      throw error;
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
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJmZS1wYWFzIiwiaWF0IjoxNTY3MzkwMDE2LCJleHAiOjE1OTg5MjYwMTZ9.kUW4z4zwM5HlBFJlAuwsvqpnTHLMTgpkq1YboEKtzhg'
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
      if (error instanceof Error) {
        error = {
          title: '网络请求错误',
          message: `请求路径：${path.replace(this.ASSIST_PREFIX, '')}，${error.message}`
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
    var {corp} = this.getPlatform();
    try {
      if ('cloud.renmaitech.com' == location.host) {
        corp = 'renmai';
      }
    } catch (err) {
      console.log(err);
    }
    const casServer = {
      'finup': 'http://cas.finupgroup.com/puhui-cas',
      'renmai': 'http://cas.renmaitech.com/puhui-cas'
    }[corp];
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


  get permissionMap() {
    // some permissionPath do not related to any url are list bellow
    return {
      // 创建应用
      '/2.x/app/create': 'app_create',
      // 更改运行环境
      '/2.x/app/update/space': 'app_change_profile',
      // 应用转让
      '/2.x/app/transfer': 'app_transfer',
      // 删除应用
      '/2.x/app/delete': 'app_delete',

      /** 服务相关 */
      // 创建服务
      '/2.x/service/create': 'service_create',
      // 切换默认服务版本
      '/2.x/service/update/defaultVersion': 'service_change_default',
      // 部署服务
      '/2.x/service/deploy': 'service_deploy',
      // 停止服务
      '/2.x/service/stop': 'service_stop',
      // 重启服务（生产环境）
      '/2.x/service/restart': 'service_restart_production',
      // 删除服务
      '/2.x/service/delete': 'service_delete',
      // 修改服务信息
      '/2.x/service/update': 'service_update',
      // 服务管理（服务列表） -> 外网域名
      '/2.x/service/update/DefaultInternetDomain': 'go-page-domain-from-service-list',
      // 服务管理（单个服务） -> 外网域名
      '/2.x/service/bindingInternetDomain': 'go-page-domain-from-service',
      // 服务管理 -> 日志/部署日志
      '/2.x/service/search/deployLog': 'go-to-page-log-deploy-from-service',
      // 镜像回滚
      '/2.x/service/rollback': 'image_rollback',
      // 获取亲和性配置
      '/2.x/service/getAffinity': 'get_affinity',
      // 修改亲和性配置
      '/2.x/service/updateAffinity': 'update_affinity',

      /** 实例相关 */
      // 手动伸缩
      '/2.x/instances/autoChangeNum': 'instance_change_count',
      // 驱逐实例
      '/2.x/instances/delete': 'instance_replace',
      // 删除实例
      // '/2.x/instances/delete': '',
      // 实例管理 -> 终端
      '/2.x/instances/openTerminal': 'go-to-page-terminal-from-instance',
      // 实例管理 -> 监控
      '/2.x/instances/apm': 'go-to-page-monitor-from-instance',
      // 实例管理 -> 运行日志
      '/2.x/instances/searchLogs': 'go-to-log-run-from-instance',

      /** 外网域名 */
      // 创建外网域名
      '/2.x/internet/create': 'domain_add',
      // 绑定服务
      '/2.x/internet/binging': 'domain_bind_service',
      // 解绑服务
      '/2.x/internet/unbind': 'domain_unbind_service',
      // 外网域名安全审核
      '/2.x/internet/update': 'domain_secure_check',
      // 删除域名
      '/2.x/internet/delete': 'domain_remove',
      // 关联白名单
      '/2.x/internet/ipWhiteList': 'domain_bind_white_list',

      // 应用监控
      '/2.x/apm': 'app_monitor',
      // 应用转让
      '/2.x/app/transfer': 'app_transfer',
      // 查看实例监控
      '/2.x/instances/apm': 'instance_monitor',

      /** oauth / accessKey相关 */
      // 创建accessKey
      '/2.x/keys/AccessKey/create': 'oauth_access_key_create',
      // 删除accessKey
      '/2.x/keys/AccessKey/delete': 'oauth_delete_access_key',
      // 修改访问配置
      '/2.x/keys/AccessKey/update': 'oauth_update_access_config',
      // 权限配置
      '/2.x/keys/AccessKey/oauth/list': 'oauth_set_permission',
      // 修改密钥
      '/2.x/keys/AccessKey/updateSecret': 'oauth_update_secret',
      /** oauth / 授权url相关 */
      // 授权URL
      '/2.x/keys/authUrl/auth': 'oauth_modify_authorize_url_list',
      // 禁用/开启
      '/2.x/keys/AccessKey/disable': 'oauth_authorize_url_toggle_enable',

      /** 工单相关 */
      // 工单列表 -> 日志/部署日志
      '/2.x/order/list/deployLog': 'go-to-page-log-deploy-from-work-order-list',
      // 工单详情
      // '/2.x/order/list/info': '',
      // 申请工单
      '/2.x/order/todoList/apply': 'work-order_create',
      // 待办/工单/部署应用
      '/2.x/order/todoList/deploy': 'work-order_deploy_service',
      '/2.x/order/list/download': 'work-order_download',
      '/2.x/order/todoList/end':'work-order_end',

      /** 中间件(mariadb)相关 */
      // 创建MariaDB
      '/2.x/openShift/mariaDB/create': 'middleware_mariadb_instance_create',
      // 删除MariaDB
      '/2.x/openShift/mariaDB/delete': 'middleware_mariadb_instance_delete',
      // 启动MariaDB
      '/2.x/openShift/mariaDB/start': 'middleware_mariadb_instance_start',
      // 停止MariaDB
      '/2.x/openShift/mariaDB/stop': 'middleware_mariadb_instance_stop',
      // 更新MariaDB参数
      '/2.x/openShift/mariaDB/update': 'middleware_mariadb_instance_update',
      // 创建MariaDB备份
      '/2.x/openShift/mariaDB/createBackup': 'middleware_mariadb_backup_create',
      // 删除MariaDB备份
      '/2.x/openShift/mariaDB/deleteBackup': 'middleware_mariadb_backup_delete',
      // 恢复MariaDB备份
      '/2.x/openShift/mariaDB/createRestore': 'middleware_mariadb_backup_restore',
      // 修改MariaDB配置
      '/2.x/openShift/mariaDB/edit': 'middleware_mariadb_instance_update_config',

      /** 中间件(redis)相关 */
      // 创建redis
      '/2.x/openShift/redis/create': 'middleware_redis_instance_create',
      // 删除redis
      '/2.x/openShift/redis/delete': 'middleware_redis_instance_delete',
      // 编辑redis(java server端)
      '/2.x/openShift/redis/edit': 'middleware_redis_instance_edit',
      // 更新redis(openshift端)
      '/2.x/openShift/redis/update': 'middleware_redis_instance_update',

      // 创建redis备份
      '/2.x/openShift/redis/createBackup': 'middleware_redis_backup_create',
      // 删除redis备份
      '/2.x/openShift/redis/deleteBackup': 'middleware_redis_backup_delete',
      // 恢复redis备份
      '/2.x/openShift/redis/createRestore': 'middleware_redis_backup_restore',

      /** 团队管理 */
      // 查看成员
      '/2.x/group/member/list': 'group_member_list',
      // 邀请成员
      '/2.x/group/member/add': 'group_member_invite',
      // 修改岗位
      '/2.x/group/member/update': 'group_member_update_roles',
      // 移除成员
      '/2.x/group/member/delete': 'group_member_remove',
      // 页面相关
      // 团队列表
      '/2.x/group/list': '/group',

      /** 页面相关 */
      // 服务管理
      '/2.x/service': this.page['profile/service'],
      // 实例列表
      '/2.x/instances': this.page['profile/instance'],
      // 外网域名
      '/2.x/internet': this.page['profile/domain'],
      // 日志中心
      '/2.x/logs': this.page['profile/log'],
      // 日志中心/运行日志
      '/2.x/logs/searchLog': this.page['profile/log/run'],
      // 日志中心/部署日志
      '/2.x/logs/searchDeployLog': this.page['profile/log/deploy'],
      // 页面-Oauth/Access Key
      '/2.x/keys/AccessKey': this.page['profile/oauth/key'],
      // 页面-Oauth权限
      '/2.x/keys': this.page['profile/oauth'],
      // 页面-Oauth/url
      '/2.x/keys/authUrl': this.page['profile/oauth/url'],
      // 页面-审批管理页面
      '/2.x/orders': this.page['profile/work-order'],
      // 页面-审批管理/待办工单
      '/2.x/order/todoList': this.page['profile/work-order/todo'],
      // 页面-审批管理/工单列表
      '/2.x/order/list': this.page['profile/work-order/list'],
      // 应用监控
      '/2.x/apm': this.page['profile/monitor'],
      // 配置中心
      '/2.x/config/server': this.page['profile/config-server']
    };
  }

  /**
   * 解析用户权限
   * @param resContent
   * @returns {Array}
   */
  parseNotPermittedCommands(notPermittedList) {
    notPermittedList = notPermittedList.map(it => {
      it.hasOwnProperty('id') && delete it.id;
      it.hasOwnProperty('parentId') && delete it.parentId;
      it.hasOwnProperty('createTime') && delete it.createTime;
      it.hasOwnProperty('updateTime') && delete it.updateTime;
      it.hasOwnProperty('permissionType') && delete it.permissionType;
      return it;
    });

    // format of notPermittedList
    // [{
    //   id: 110,
    //   name: "创建外网域名",
    //   parentId: 84,
    //   path: "/2.x/internet/create",
    //   permissionType: "BUTTON",
    //   url: "/domain/record/create",
    //   method: "POST",
    //   key: "domain_bind_white_list"
    // }...]
    // format of converted notPermittedList:
    // ["app_delete", "service_delete", ...]
    const permissionMap = this.permissionMap;
    notPermittedList = notPermittedList.filter(it => {
      if (permissionMap.hasOwnProperty(it.path)) {
        return true;
      } else {
        // output permission not converted except listed below
        if (!{
            '/2.x/keys/AccessKey/oauth/delete': '删除权限',
            '/2.x/backstage': '后台管理'
          }[it.path]) {
          console.log('not catch in permissionMap:');
          console.log(it);
        }
        return false;
      }
    }).map(it => {
      return permissionMap[it.path];
    });
    return notPermittedList;
  }

  async requestPermission() {
    const notPermittedListFromNet = await this.requestPaasServer(this.URL_LIST.user_not_permitted);
    const notPermittedList = this.parseNotPermittedCommands(notPermittedListFromNet);
    const result = {};
    notPermittedList.forEach(it => {
      result[it] = {
        disabled: true,
        reason: '您无权进行该操作'
      }
    });
    return result;
  }
}

export default Net;
