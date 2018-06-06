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
      // 用户退出
      'logout': API_PATH + '/userLogout',
      'group_list': {
        url: API_PATH + '/group/queryAllGroup',
        path: '/group/queryAllGroup'
      },
      'group_numbers': {
        url: API_PATH + '/group/users',
        path: '/group/users'
      },
      'group_number_change_roles': {
        url: API_PATH + '/group/user/updateJob',
        path: '/group/user/updateJob'
      }
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
