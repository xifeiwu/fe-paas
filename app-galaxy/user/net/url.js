/**
 * Created by xifei.wu on 2017/11/30.
 */
import BaseURL from 'assets/js/url';

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
      // 获取团队列表
      'group_list': {
        url: API_PATH + '/group/queryAllGroup',
        path: '/group/queryAllGroup'
      },
      // 分页获取团队列表
      'group_list_by_page': {
        url: API_PATH + '/group/queryByPage',
        path: '/group/queryByPage'
      },
      'group_get_lob_list': {
        url: API_PATH + '/group/queryLobList',
        path: '/group/queryLobList'
      },
      // 获取所有用户列表
      'users_all': {
        url: API_PATH + '/user/queryUserList',
        path: '/user/queryUserList',
        method: 'get'
      },
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
