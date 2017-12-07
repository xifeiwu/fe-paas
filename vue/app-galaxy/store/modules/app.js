/**
 * Created by xifei.wu on 2017/12/6.
 */


const state = {
  stepOfAddAPP: 0,
  infoForCreateApp: {},
};

const actions = {
  updateStepOfAddAPP({commit, state}, step) {
    state.stepOfAddAPP = step;
  },
  addCreateAPPInfo({commit, state}, params) {
    console.log(params);
    state.infoForCreateApp[params.key] = params.value;
  }
};

const mutations = {

};

const getters = {
  'stepOfAddAPP': (state, getters) => {
    return state.stepOfAddAPP;
  },
  'infoForCreateApp': (state, getters) => {
    return state.infoForCreateApp;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
