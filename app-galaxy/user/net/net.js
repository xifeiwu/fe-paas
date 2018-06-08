/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import {URL_LIST} from './url';
import NetBase from '$assets/js/net';
var debug = browserDebug('pass-fe:net');

class Net extends NetBase {
  constructor() {
    super();
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
  // 分页获取团队列表
  // not used
  getGroupListByPage(data) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.group_list_by_page.url, data).then(response => {
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

  // 获取组成员
  getGroupMembers(data) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.group_members.url, data).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('groupUserList')) {
          let userList = content['groupUserList'];
          // add prop jobs to each user
          userList.forEach(user => {
            if (user.hasOwnProperty('jobName') && user.hasOwnProperty('jobDescription')) {
              let names = user['jobName'].split(',');
              let descriptions = user['jobDescription'].split(',');
              user.jobNames = names;
              user.jobDescriptions = descriptions;
              if (names.length === descriptions.length) {
                user.jobs = [];
                names.forEach((it, index) => {
                  user.jobs.push({
                    name: it,
                    desc: descriptions[index]
                  })
                });
              } else {
                console.log('length of name and description is different');
              }
            } else {
              console.log('jobName or jobDescription is not found!');
            }
          });
          resolve(userList);
        } else {
          reject([]);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
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

  // 团队添加新成员
  inviteGroupNumber(data) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.group_invite_new.url, data).then(response => {
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

}

export default new Net();