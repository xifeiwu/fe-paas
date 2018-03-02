
const state = {
  versionInfo: null,
  workOrderBasic: null,
};

const actions = {
  workOrderBasic({commit, state}, detail) {
    state.workOrderBasic = detail;
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
  'workOrderBasic': (state, getters) => {
    return state.workOrderBasic;
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