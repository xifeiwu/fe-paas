
const state = {
  versionInfo: null,
  currentWorkOrder: null,
};

const actions = {
  setWorkOrder({commit, state}, detail) {
    state.currentWorkOrder = detail;
  },
  versionInfo({commit, state}, info) {
    state.versionInfo = info;
  }
};

const mutations = {
  SET_MESSAGE_FOR_CREATE_APP(state, content) {
  }
};

const getters = {
  'currentWorkOrder': (state, getters) => {
    return state.currentWorkOrder;
  },
  'versionInfo': (state, getters) => {
    return state.versionInfo;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}