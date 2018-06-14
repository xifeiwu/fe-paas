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
      // 当前用户禁用的权限
      'user_not_permitted': {
        url: API_PATH + '/user/roles/permissions?exclude=true',
        path: '/user/roles/permissions?exclude=true'
      },
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
      // 获取团队成员
      'group_members': {
        url: API_PATH + '/group/users',
        path: '/group/users'
      },
      'group_member_change_roles': {
        url: API_PATH + '/group/user/updateJob',
        path: '/group/user/updateJob'
      },
      'group_invite_new': {
        url: API_PATH + '/group/addUser',
        path: '/group/addUser'
      },
      'group_remove_member': {
        url: API_PATH + '/group/user/delete',
        path: '/group/user/delete'
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
