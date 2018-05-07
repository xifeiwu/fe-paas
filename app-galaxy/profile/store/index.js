/**
 * Created by xifei.wu on 2017/12/4.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import user from './modules/user';
import app from './modules/app';
import tmp from './modules/tmp';
import global from '$assets/js/store/modules/global';

Vue.use(Vuex);

export default new Vuex.Store({
  modules:{
    user, app, tmp, global
  }
})