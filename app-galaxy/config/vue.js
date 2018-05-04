/**
 * Created by xifei.wu on 2018/1/5.
 */

import Vue from 'vue';
import Utils from '$assets/js/utils';
import axios from 'axios';

class VUEConfig {
  constructor({URL_LIST, netHelper, storeHelper}) {
    this.addPrototype({URL_LIST, storeHelper, netHelper});
  }

  addMixin(Vue){
    Vue.mixin({
      methods: {
        $refresh: function () {
          this.$router.go({
            path: this.$route.path,
            force: true
          })
        }
      }
    });
  }

  addPrototype({URL_LIST, storeHelper, netHelper}) {
    Vue.prototype.$utils = new Utils();
    Vue.prototype.$ajax = axios;
    if (URL_LIST) {
      Vue.prototype.$url = URL_LIST;
    }
    if (storeHelper) {
      Vue.prototype.$storeHelper = storeHelper;
    }
    if (netHelper) {
      // $storeHelper and $utils in Vue.prototype will be used in NetData
      netHelper.setVue(Vue);
      Vue.prototype.$net = netHelper;
    }
  }
}

export default VUEConfig;