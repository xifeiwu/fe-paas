import axios from 'axios';
import NetBase from '$assets/js/net';

class Net extends NetBase {
  constructor() {
    super();
    const URL_LIST = {
      menu_list: {
        path: '/docs/help/menu.json',
        method: 'get'
      },
      doc_content: {
        path: '/docs/help/{path}',
        method: 'get'
      }
    };
    const ASSIST_URL_LIST = {
      md_detail: {
        path: '/api/md/view',
        method: 'post'
      }
    };
    // Object.keys(URL_LIST).forEach(key => {
    //   let item = URL_LIST[key];
    //   item.path = this.ASSIST_PREFIX + item.path;
    // });
    Object.keys(ASSIST_URL_LIST).forEach(key => {
      let item = ASSIST_URL_LIST[key];
      item.path = this.ASSIST_PREFIX + item.path;
    });
    this.URL_LIST = Object.assign(URL_LIST, ASSIST_URL_LIST);
  }

  setVue(Vue) {
    this.$storeHelper = Vue.prototype.$storeHelper;
    this.$utils = Vue.prototype.$utils;
  }

  getHelp() {
    return new Promise((resolve, reject) => {
      axios.all([
        axios.get(this.URL_LIST.menu_list.path),
        axios.get(this.$utils.formatUrl(this.URL_LIST.doc_content.path, {path: 'help'}))
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
          msg: `请求路径：${this.URL_LIST.menu_list.path}；${err.toString()}`
        });
      })
    });
  }

  getMenuList() {
    return new Promise((resolve, reject) => {
      axios.get(this.URL_LIST.menu_list.path).then(response => {
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
      let url = this.$utils.formatUrl(this.URL_LIST.doc_content.path, {path});
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