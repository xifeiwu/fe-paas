/**
 * Created by xifei.wu on 2017/12/6.
 */


const state = {
  stepOfAddAPP: 0,
  infoForCreateApp: [],
};

const actions = {
  updateStepOfAddAPP({commit, state}, step) {
    state.stepOfAddAPP = step;
  },
  addCreateAPPInfo({commit, state}, step, values) {
    let key = 'page' + step;
    state.infoForCreateApp[key] = values;
  }
};

const mutations = {

};

const getters = {
  'stepOfAddAPP': (state, getters) => {
    return state.stepOfAddAPP;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
