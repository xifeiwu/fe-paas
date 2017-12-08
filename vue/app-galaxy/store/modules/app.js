/**
 * Created by xifei.wu on 2017/12/6.
 */
import Vue from 'vue';
// let NetData = Vue.prototype.$net;
import NetData from '../../net/net';
import postFormatter from '../post_formatter';
const USE_LOCAL_STORAGE = true;

const stateHasUpdated = function(prop) {
  let hasUpdated = false;
  if ('object' === typeof(prop) && Object.keys(prop).length > 0) {
    hasUpdated = true;
  } else if (Array.isArray(prop) && prop.length > 0) {
    hasUpdated = true;
  }
  return hasUpdated;
}

const getValue = function({state, getters}, prop) {
  let result = null;
  if (stateHasUpdated(state[prop])) {
    result = state[prop];
  } else if (USE_LOCAL_STORAGE) {
    warning(prop, 'localStorage');
    let local = JSON.parse(localStorage.getItem('user/' + prop));
    if (local) {
      result = local;
    }
  }
  return result;
}

const warning = function(prop, where) {
  console.log(`warning: get ${prop} from ${where}`);
};

const state = {
  stepOfAddAPP: 0,
  infoForCreateApp: {},
  infoForCreateAppToPost: {},

  /* net data */
  messageForCreateAPP: {},
};

const actions = {
  updateStepOfAddAPP({commit, state}, step) {
    state.stepOfAddAPP = step;
  },
  addCreateAPPInfo({commit, state}, params) {
    // console.log(params);
    state.infoForCreateApp[params.key] = params.value;
    if (state.infoForCreateApp.hasOwnProperty('page1') && state.infoForCreateApp.hasOwnProperty('page2')
      && state.infoForCreateApp.hasOwnProperty('page3')) {
      commit('SET_INFO_FOR_CREATE_APP', state.infoForCreateApp);
    }
  },

  /* net data */
  getMessageForCreateAPP({commit, state}) {
    console.log('getMessageForCreateAPP');
    console.log(stateHasUpdated(state.messageForCreateAPP));
    if (!stateHasUpdated(state.messageForCreateAPP)) {
      NetData.getMessageForCreateAPP().then(content => {
        commit('SET_MESSAGE_FOR_CREATE_APP', content);
      });
    }
  }
};

const mutations = {
  SET_INFO_FOR_CREATE_APP(state, infoForCreateApp) {
    let result = {};
    for (let key in infoForCreateApp) {
      result = Object.assign(result, infoForCreateApp[key]);
    }
    state.infoForCreateAppToPost = postFormatter.infoToCreateAPP(result);
    if (USE_LOCAL_STORAGE) {
      localStorage.setItem('app/infoForCreateAppToPost', JSON.stringify(state.infoForCreateAppToPost));
    }
  },

  /* net data */
  SET_MESSAGE_FOR_CREATE_APP(state, content) {
    state.messageForCreateAPP = content;
    if (USE_LOCAL_STORAGE) {
      localStorage.setItem('app/messageForCreateAPP', JSON.stringify(content));
    }
  }
};

const getters = {
  'stepOfAddAPP': (state, getters) => {
    return state.stepOfAddAPP;
  },
  'infoForCreateApp': (state, getters) => {
    return state.infoForCreateApp;
  },
  'infoForCreateAppToPost': (state, getters) => {
    let result = null;
    if (Object.keys(state.infoForCreateAppToPost).length > 0) {
      result = state.infoForCreateAppToPost;
    } else if (USE_LOCAL_STORAGE) {
      warning('infoForCreateAppToPost', 'localStorage');
      let local = JSON.parse(localStorage.getItem('app/infoForCreateAppToPost'));
      if (local) {
        result = local;
      }
    }
    return result;
  },

  /* net data */
  'messageForCreateAPP': (state, getters) => {

    console.log('dddddkkfisfoidsajoifdjsaiofj');
    // console.log(stateHasUpdated(state[prop]));
    return getValue({state, getters}, 'messageForCreateAPP');
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
