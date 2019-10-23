/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import {URL_LIST} from './url';
import NetBase from 'assets/js/net';
var debug = browserDebug('pass-fe:net');

class Net extends NetBase {
  constructor() {
    super();
    const PAAS_URL_LIST = {
      // 分页获取团队列表
      'group_list_by_page': {
        path: '/group/queryByPage',
        method: 'post'
      },

      /** 团队管理 */
      'group_invite_new': {
        path: '/group/addUser',
        method: 'post'
      },
      // 创建团队
      'group_create': {
        path: '/group/create',
        method: 'post'
      },
      'group_update': {
        path: '/group/update',
        method: 'post'
      },
      // 删除团队
      'group_delete': {
        path: '/group/delete',
        method: 'post'
      },
      // 获取团队成员
      'group_members': {
        path: '/group/users',
        method: 'post'
      },

      // k8s异常事件列表
      'k8s_event_type': {
        path: '/event/type/query',
        method: 'get'
      },
      // k8s事件报警列表
      'k8s_warning_list': {
        path: '/application/alert/config/query/list',
        method: 'post'
      },
      // 添加k8s事件报警
      'k8s_warning_add': {
        path: '/application/alert/config/add',
        method: 'post'
      },
      // 添加k8s事件报警
      'k8s_warning_update': {
        path: '/application/alert/config/update',
        method: 'post'
      },
      'k8s_warning_delete': {
        path: '/application/alert/config/delete/{appId}',
        method: 'delete'
      },

      /** 消息相关 */
      // 获取消息记录
      'message_list_all': {
        path: '/message/query/user/all/list',
        method: 'post'
      },
      // 标记消息为已读
      'message_mark_read': {
        path: '/message/update/status',
        method: 'post'
      },

      //操作日志相关
      //获取操作日志
      'operation_log': {
        path: '/operation/searchLog',
        method: 'post',
        withMorePage: true,
      },
      //获取操作模块
      'operation_module': {
        path: '/operation/get/module/type',
        method: 'get'
      },
      // 反馈建议
      'feedback_create': {
        path: '/suggestion',
        method: 'post'
      },
      // 历史反馈列表
      'feedback_list': {
        path: '/suggestions',
        // path: '/user/{userId}/suggestions',
        // path: '/suggestion/list',
        method: 'get'
      },
      // 得到feedback中的图片
      'feedback_get_picture': {
        path: '/suggestion/{feedbackId}/picture',
        method: 'get'
      }
    };
    Object.keys(PAAS_URL_LIST).forEach(key => {
      let item = PAAS_URL_LIST[key];
      item.path = this.PAAS_PREFIX + item.path;
    });
    if (this.URL_LIST) {
      this.URL_LIST = Object.assign(this.URL_LIST, PAAS_URL_LIST);
    }
  }

  setVue(Vue) {
    this.$utils = Vue.prototype.$utils;
  }

  logout() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.logout).then(res => {
        if ('data' in res) {
          let data = res.data;
          if (0 === data.code) {
            let msg = null;
            if (data.hasOwnProperty('msg')) {
              msg = data.msg;
            }
            resolve(msg);
          } else {
            reject({
              title: '退出失败',
              msg: '服务器错误！'
            });
          }
        } else {
          reject({
            title: '退出失败',
            msg: '服务器错误！'
          });
        }
      }).catch(err => {
        reject(this.getMsgFromErrorResponse(err));
      });
    })
  }

  // 获取用户不允许操作的功能列表
  getNotPermittedCommands() {
    function getNotPermitted() {
      return axios.get(URL_LIST.user_not_permitted.url);
    }
    return new Promise((resolve, reject) => {
      axios.all([getNotPermitted()]).then(axios.spread((notPermittedRes) => {
        let notPermittedListOrigin = this.getResponseContent2(notPermittedRes);
        notPermittedListOrigin = notPermittedListOrigin.map(it => {
          it.hasOwnProperty('id') && delete it.id;
          it.hasOwnProperty('parentId') && delete it.parentId;
          it.hasOwnProperty('createTime') && delete it.createTime;
          it.hasOwnProperty('updateTime') && delete it.updateTime;
          it.hasOwnProperty('permissionType') && delete it.permissionType;
          return it;
        });
        // console.log(notPermittedListOrigin);

        let notPermittedList = [];

        // some permissionPath do not related to any url are list bellow
        let pathToKey = {
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
        };
        // format of item in notPermittedList
        // {
        //   id: 110,
        //   name: "创建外网域名",
        //   parentId: 84,
        //   path: "/2.x/internet/create",
        //   permissionType: "BUTTON",
        //   url: "/domain/record/create",
        //   method: "POST",
        //   key: "domain_bind_white_list"
        // }

        // add url and method by notPermittedListOrigin
        notPermittedListOrigin.forEach(it => {
          // check if permission in pathToKey first
          if (pathToKey.hasOwnProperty(it.path)) {
            it.key = pathToKey[it.path];
            notPermittedList.push(it);
          }
        });
        // console.log(notPermittedList);

        let result = notPermittedList.filter(it => {
          return it.hasOwnProperty('key') && it.key;
        }).map(it => {
          return it['key'];
        });
        // console.log(result);
        resolve(result);
      })).catch(err => {
        console.log(err);
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.user_not_permitted.path}；${err.toString()}`
        });
      })
    });
  }


  // 获取团队
  getGroupList() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.group_list.url).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('groupList') && Array.isArray(content.groupList)) {
          let groupList = content.groupList;
          groupList.forEach(it => {
            it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
            if (it.createTime) {
              it.createTime = it.createTime.split(' ');
            }
          })
          resolve(groupList);
        } else {
          let responseMsg = this.getResponseMsg(response);
          reject(responseMsg);
        }
      }).catch(err => {
        reject({
          title: '请求错误',
          msg: err.toString()
        });
      })
    })
  }
  // 获取Lob（line of business）信息
  getLobList() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.group_get_lob_list.url).then(response => {
        console.log(response);
      })
    })
  }

  // 修改用户角色
  changeGroupNumberRoles(data) {
    return new Promise((resolve, reject) => {
      axios.put(URL_LIST.group_member_change_roles.url, data).then(response => {
        // let content = this.getResponseContent(response);
        let resMsg = this.getResponseMsg(response);
        // console.log(resMsg);
        if (resMsg.success) {
          resolve(resMsg);
        } else {
          reject(resMsg);
        }
      })
    })
  }

  // 删除团队成员
  removeGroupNumber(data) {
    return new Promise((resolve, reject) => {
      axios.delete(URL_LIST.group_remove_member.url, {data}).then(response => {
        let resMsg = this.getResponseMsg(response);
        // console.log(resMsg);
        if (resMsg.success) {
          resolve(resMsg);
        } else {
          reject(resMsg);
        }
      })
    })
  }

  //获取所有用户
  getUsersAll() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.users_all.url).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('userList')) {
          resolve(content.userList);
        } else {
          reject();
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

}

export default new Net();