/**
 * Created by xifei.wu on 2017/11/30.
 */
import BaseURL from '$assets/js/url';

class URL extends BaseURL {
  constructor() {
    super();
    this.setUrlList();
  }

  setUrlList() {
    let API_PATH = this.API_PATH;
    this.URL_LIST = {
      'api_path': API_PATH,

      // 获取验证码
      'get_verify_code': API_PATH + '/createRandomImage',
      'login': API_PATH + '/login',
      // 用户退出
      'logout': API_PATH + '/userLogout',
      'app_list': API_PATH + '/application/queryByPage',
      'user_info': API_PATH + '/group/queryByUser',
      // 获取用户所在组列表
      'get_user_group_list': API_PATH + '/group/queryByUser',
    };
  }

  getUrlList() {
    return this.URL_LIST;
  }
}
let url = new URL();
const ORIGIN = url.ORIGIN;
const URL_LIST = url.getUrlList();

export {
  ORIGIN,
  URL_LIST
}
