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
          }
        }
      }).catch(err => {
        reject(this.getMsgFromErrorResponse(err));
      });
    })
  }

  // 获取组列表
  getGroupList() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.group_list.url).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
        } else {
          let responseMsg = this.getResponseMsg(response);
          reject(responseMsg);
        }
      }).catch(err => {
        reject(err);
        console.log(err);
      })
    })
  }

  // 获取组成员
  getGroupNumbers(data) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.group_numbers.url, data).then(response => {
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

}

export default new Net();