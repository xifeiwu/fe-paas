import axios from 'axios';
import NetBase from '$assets/js/net';

class Net extends NetBase {
  constructor() {
    super();
    this.$utils = null;
    this.$storeHelper = null;
    const PAAS_URL_LIST = {
      'profile_list_all': {
        path: '/backstage/querySpace',
        method: 'get'
      },
      // 获取用户所在组列表
      'app_status_list': {
        path: '/backstage',
        method: 'post'
      },
      // 获取团队的所有运行环境
      'profile_list_of_group': {
        path: '/space/querySpaceByGroupId',
        method: 'post'
      },
      'analyze_app_count': {
        path: '/backstage/queryAppCount',
        method: 'post'
      },
      'analyze_app_count_detail': {
        path: '/backstage/queryAppCountDetail',
        method: 'post'
      }
    };
    Object.keys(PAAS_URL_LIST).forEach(key => {
      let item = PAAS_URL_LIST[key];
      item.path = this.PAAS_PREFIX + item.path;
    });

    // extend URL_LIST from super
    if (this.URL_LIST) {
      this.URL_LIST = Object.assign(this.URL_LIST, PAAS_URL_LIST);
    }
  }

  // called at config/vue
  setVue(Vue) {
    this.$storeHelper = Vue.prototype.$storeHelper;
    this.$utils = Vue.prototype.$utils;
  }
}

export default new Net();