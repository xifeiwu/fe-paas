/**
 * Created by xifei.wu on 2018/1/5.
 */

import Vue from 'vue';
import axios from 'axios';
import './axios-config';
import Utils from 'assets/js/utils';

import '$assets/css/fix-style.scss';
import 'assets/css/common.scss';


/**
 * add global css used for all components
 * 1. fix-style.scss: override some default style of browser
 * 2. mixin.scss: TODO
 * add global function
 * 1. Vue.prototype.$utils = new Utils()
 * 2. Vue.prototype.$ajax = axios
 * 3. Vue.prototype.$url = URL_LIST
 * 4. Vue.prototype.$storeHelper = storeHelper, vuex related api
 * 5. Vue.prototype.$net = netHelper, network related api
 * set global config
 * 1. NetConfig for axios
 */
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