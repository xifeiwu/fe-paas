/**
 * Created by xifei.wu on 2017/12/28.
 */
import Vue from 'vue';
import Components from './custom/index.js';
Components.install(Vue);
import entry from './custom/index.vue';

new Vue({ // eslint-disable-line
  el: '#app',
  render: h => h(entry)
});