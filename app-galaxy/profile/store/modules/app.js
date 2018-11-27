/**
 * Created by xifei.wu on 2017/12/6.
 */
import Vue from 'vue';
// import NetData from '../../net/net';

/**
 * used in getter:
 * 1. if the prop in state has not null, return state.prop
 * 2. else get from localStorage, and assign the value to state.prop
 */

const state = {
  /* net data */
  globalConfig: null,
  usersAll: null,
  domainLevelByProfile: null
};

const actions = {
  /* net data */
  /**
   * get message of creating app from server
   * format: @../mock/app/globalConfig
   */
  async globalConfig({commit, state}, globalConfig) {
    commit('SET_GLOBAL_CONFIG', globalConfig);
  },
  usersAll({commit, state}) {
    if (!state.usersAll) {
      Vue.prototype.$net.getUsersAll().then(userList => {
        state.usersAll = userList;
      });
    }
  },
  async getSubDomainByProfile({commit, state}, {net, urlDesc, payload}) {
    if (!state.domainLevelByProfile) {
      state.domainLevelByProfile = await net.requestPaasServer(urlDesc, {
        payload
      });
    }
    return state.domainLevelByProfile;
  }
};

const mutations = {
  SET_GLOBAL_CONFIG(state, globalConfig) {
    state.globalConfig = globalConfig;
  }
};

const getters = {
  /* net data */
  'globalConfig': (state, getters) => {
    return state.globalConfig;
  },
  'usersAll': (state, getters) => {
    return state.usersAll;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
