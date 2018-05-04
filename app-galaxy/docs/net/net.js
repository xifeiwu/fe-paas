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