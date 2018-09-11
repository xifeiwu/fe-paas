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
  messageForCreateAPP: null,
  usersAll: null,
};

const actions = {
  /* net data */
  /**
   * get message of creating app from server
   * format: @../mock/app/messageForCreateAPP
   */
  async messageForCreateAPP({commit, state}) {
    state.messageForCreateAPP = await Vue.prototype.$net.getMessageForCreateAPP();
    return state.messageForCreateAPP;
  },
  usersAll({commit, state}) {
    if (!state.usersAll) {
      Vue.prototype.$net.getUsersAll().then(userList => {
        state.usersAll = userList;
      });
    }
  },
};

const mutations = {
};

const getters = {
  /* net data */
  'messageForCreateAPP': (state, getters) => {
    return state.messageForCreateAPP;
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
