import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
// import createPersistedState from '$assets/js/vuex-presisted-global-state';
import user from './modules/user';

Vue.use(Vuex);

export default new Vuex.Store({
  actions: {
    logout({dispatch, state, commit}, groupList) {
      dispatch('user/clear');
      // commit('user/CLEAR');
      commit('CLEAR');
    }
  },
  mutations: {
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
  modules:{
    user
  },
  plugins: [createPersistedState({
    key: 'global',
    // 暂时只持久化 etc 模块，防止冲突
    paths: ['user'],
    filter: (mutation) => {
      // console.log(mutation);
      return true;
    }
  })]
})