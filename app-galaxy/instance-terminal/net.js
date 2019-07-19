import NetBase from 'assets/js/net';

class Net extends NetBase {
  constructor() {
    super();
    const URL_LIST_PAAS = {
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
    Object.keys(URL_LIST_PAAS).forEach(key => {
      let item = URL_LIST_PAAS[key];
      item.path = this.PAAS_PREFIX + item.path;
    });
    const URL_LIST_ASSIST = {
    };
    Object.keys(URL_LIST_ASSIST).forEach(key => {
      let item = URL_LIST_ASSIST[key];
      item.path = this.ASSIST_PREFIX + item.path;
    });
    this.URL_LIST = this.URL_LIST ? Object.assign(this.URL_LIST, URL_LIST_PAAS) : URL_LIST_PAAS;
    this.URL_LIST_ASSIST = this.URL_LIST_ASSIST ? Object.assign(this.URL_LIST_ASSIST, URL_LIST_ASSIST) : URL_LIST_ASSIST;
  }
}

export default new Net();