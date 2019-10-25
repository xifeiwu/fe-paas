import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
// import createPersistedState from '$assets/js/vuex-presisted-global-state';
import user from './modules/user';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    version: '',
    screen: {
      width: 0,
      height: 0,
      size: 0,
      ratioHeight: 0
    },
  },
  actions: {
    version({dispatch, state, commit}, version) {
      commit('SET_VERSION', version);
    },
    logout({dispatch, state, commit}, groupList) {
      dispatch('user/clear');
      // commit('user/CLEAR');
      commit('CLEAR');
    },
    setScreenSize({state, commit}, {width, height}) {
      state.screen.width = width;
      state.screen.height = height;
      try {
        state.screen.ratioHeight = height / window.devicePixelRatio;
      } catch(err) {
        state.screen.ratioHeight = 500
      }
      state.screen.size = width * height;
    },
  },
  mutations: {
    SET_VERSION(state, version) {
      state.version = version;
    },
    SET_GROUP_INFO(state, groupInfo) {
      state.groupInfo = groupInfo;
    },
    SET_PERMISSION(state, permission) {
      // Vue.set(state.permission, key, config[key]);
      state.permission = Object.assign(state.permission, permission);
    },
    CLEAR(state) {
    }
  },

  getters: {
    'version': (state, getters) => {
      return state.version;
    },
    'screen': (state) => {
      return state.screen;
    },
  },
  modules:{
    user
  },
  plugins: [createPersistedState({
    key: 'global',
    // 暂时只持久化 etc 模块，防止冲突
    paths: ['version', 'user.userInfo', 'user.groupInfo', 'user.config', 'user.menus'],
    filter: (mutation) => {
      // console.log(mutation);
      return true;
    }
  })]
})