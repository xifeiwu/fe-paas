import axios from 'axios';
import NetBase from '$assets/js/net';

class Net extends NetBase {
  constructor() {
    super();
    this.$utils = null;
    this.$storeHelper = null;
  }

  // called at config/vue
  setVue(Vue) {
    this.$storeHelper = Vue.prototype.$storeHelper;
    this.$utils = Vue.prototype.$utils;
  }
}

export default new Net();