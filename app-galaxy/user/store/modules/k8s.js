import Vue from 'vue';

export default {
  namespaced: true,
  state: {
    eventTypeList: [],
  },
  actions: {
    async setEventTypeList({state, commit}, groupList) {
      if (state.eventTypeList.length > 0) {
        return state.eventTypeList;
      }
      const net = Vue.prototype.$net;
      const resContent = net.requestPaasServer(net.URL_LIST.k8s_event_type)
      state.eventTypeList = resContent;
      return state.eventTypeList;
    },
    setUserGroupList({state, commit}, groupList) {
      state.userGroupList = groupList;
    }
  },
  mutations: {
  },

  getters: {
    'userGroupList': (state, getters) => {
      return state.userGroupList;
    }
  }
}