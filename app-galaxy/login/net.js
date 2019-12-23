/**
 * Created by xifei.wu on 2017/12/5.
 */
import NetBase from 'assets/js/net';
const cryptoAes = require('crypto-js/aes');
// var debug = browserDebug('pass-fe:net');

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
      cas_validate: {
        path: '/api/cas/service-validate',
        method: 'post'
      }
    };
    Object.keys(ASSIST_URL_LIST).forEach(key => {
      let item = ASSIST_URL_LIST[key];
      item.path = this.ASSIST_PREFIX + item.path;
    });

    this.URL_LIST = Object.assign(PAAS_URL_LIST, ASSIST_URL_LIST);
  }

  /**
   * format of resContent:
   {
     excludeList: [], // not used
     user: {
       email: 'wuxifei@finupgroup.com',
       guest: false,
       id: 956,
       username: 'wuxifei',
       realName: '吴西飞'
       role: '平台管理员'
     },
     menuList: [],
     token: '20190121-88191cc3-47c0-4886-aa5c-f0d70efbcef6'
   }
   */
  formatLoginResContent(resContent) {

    const menuList = resContent.menuList.map(it => {
      return {
        name: it.name,
        path: it.path
      }
    });
    // resContent.user.token = resContent.token;
    const user = resContent.user;
    const userInfo = {
      userName: user.username,
      realName: user.realName,
      token: resContent.token,
      email: user.email,
      role: user.role,
    };
    userInfo.auth = cryptoAes.encrypt(`${userInfo.realName}:${userInfo.userName}:${userInfo.token}`, 'paas').toString();
    return {
      menuList, userInfo
    }
  }

}

export default new Net();