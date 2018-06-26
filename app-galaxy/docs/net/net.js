import {URL_LIST} from './url';
import axios from 'axios';
import NetBase from '$assets/js/net';

class Net extends NetBase {
  constructor() {
    super();
  }

  setVue(Vue) {
    this.$storeHelper = Vue.prototype.$storeHelper;
    this.$utils = Vue.prototype.$utils;
  }

  getHelp() {
    return new Promise((resolve, reject) => {
      axios.all([
        axios.get(URL_LIST.menu_list),
        axios.get(this.$utils.formatUrl(URL_LIST.doc_content, {path: 'help'}))
      ]).then(axios.spread((response1, response2) => {
        let menuList = this.getResponseContent(response1);
        let helpContent = this.getResponseContent(response2);
        if (!menuList || !helpContent) {
          reject({
            title: '数据获取失败',
            msg: '请联系管理员'
          })
        }
        resolve({menuList, helpContent});
      })).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.menu_list}；${err.toString()}`
        });
      })
    });
  }

  getMenuList() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.menu_list).then(response => {
        let responseContent = this.getResponseContent(response);
        if (responseContent) {
          resolve(responseContent);
        } else {
          reject('获取帮助菜单列表失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    });
  }

  getContent(path) {
    return new Promise((resolve, reject) => {
      let url = this.$utils.formatUrl(URL_LIST.doc_content, {path});
      axios.get(url).then(response => {
        let responseContent = this.getResponseContent(response);
        if (responseContent) {
          resolve(responseContent);
        } else {
          reject('获取帮助菜单列表失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    });

  }
}

export default new Net();