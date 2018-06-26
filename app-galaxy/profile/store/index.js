/**
 * Created by xifei.wu on 2017/12/4.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import user from './modules/user';
import app from './modules/app';
import tmp from './modules/tmp';
import global from '$assets/js/store/modules/global';
import etc from './modules/etc';

Vue.use(Vuex);

export default new Vuex.Store({
  modules:{
    user, app, tmp, global, etc
  },
  plugins: [createPersistedState({
    key: 'galaxy',
    // 暂时只持久化 etc 模块，防止冲突
    paths: ['etc']
  })]
})
