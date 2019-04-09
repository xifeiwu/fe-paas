import NetBase from 'assets/js/net';

class Net extends NetBase {
  constructor() {
    super();
    const PAAS_URL_LIST = {
      // 获取验证码
      'get_verify_code': {
        path: '/createRandomImage',
        method: 'get'
      },
      // 登录
      'login': {
        path: '/paas-login',
        method: 'post'
      },
      'cas-login': {
        path: '/login',
        method: 'post'
      },
      // 用户退出
      'logout': {
        path: '/userLogout',
        method: 'get'
      }
    };
    Object.keys(PAAS_URL_LIST).forEach(key => {
      let item = PAAS_URL_LIST[key];
      item.path = this.PAAS_PREFIX + item.path;
    });
    const ASSIST_URL_LIST = {
      get_token: {
        path: '/api/paas/terminal/get-token',
        method: 'post'
      }
    };
    Object.keys(ASSIST_URL_LIST).forEach(key => {
      let item = ASSIST_URL_LIST[key];
      item.path = this.ASSIST_PREFIX + item.path;
    });

    this.URL_LIST = Object.assign(PAAS_URL_LIST, ASSIST_URL_LIST);
  }
}

export default new Net();