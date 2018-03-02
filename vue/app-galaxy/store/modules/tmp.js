
const state = {
  versionInfo: null,
  workOrderBasic: null,
  workOrderDetail: null,
};

const actions = {
  workOrderBasic({commit, state}, detail) {
    state.workOrderBasic = detail;
  },
  workOrderDetail({commit, state}, detail) {
    state.workOrderDetail = detail;
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
  'workOrderDetail': (state, getters) => {
    return state.workOrderDetail;
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