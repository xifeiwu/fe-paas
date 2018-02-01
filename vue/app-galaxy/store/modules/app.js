/**
 * Created by xifei.wu on 2017/12/6.
 */
import NetData from '../../net/net';
import postFormatter from '../post_formatter';
const USE_LOCAL_STORAGE = false;

const warning = function(prop, where) {
  console.log(`warning: get app/${prop} from ${where}`);
};

/**
 * used in getter:
 * 1. if the prop in state has not null, return state.prop
 * 2. else get from localStorage, and assign the value to state.prop
 */
var localProps = ['messageForCreateAPP'];
const getValue = function({state, getters}, prop) {
  const getLocalValue = function() {
    let result = null;
    warning(prop, 'localStorage');
    let local = localStorage.getItem('app/' + prop);
    if (local) {
      try {
        local = JSON.parse(local);
      } catch(err) {
        if (local == 'undefined') {
          local = null;
        }
      }
      result = local;
      state[prop] = local;
    }
    return result;
  };
  let result = null;
  if (null != state[prop]) {
    result = state[prop];
  } else if(USE_LOCAL_STORAGE) {
    result = getLocalValue();
  } else if (localProps.indexOf(prop) > -1) {
    result = getLocalValue();
  }
  return result;
}

const state = {
  /* net data */
  messageForCreateAPP: null,
  usersAll: null,
  currentWorkOrder: null,
};

const actions = {
  /* net data */
  /**
   * get message of creating app from server
   * format: @../mock/app/messageForCreateAPP
   */
  messageForCreateAPP({commit, state}) {
    // if (!stateHasUpdated(state.messageForCreateAPP)) {
      NetData.getMessageForCreateAPP().then(content => {
        commit('SET_MESSAGE_FOR_CREATE_APP', content);
      });
    // }
  },
  getUsersAll({commit, state}) {
    if (!state.usersAll) {
      NetData.getUsersAll().then(userList => {
        // console.log(userList);
        state.usersAll = userList;
      });
    }
  },

  setWorkOrder({commit, state}, detail) {
    state.currentWorkOrder = detail;
  }
};

const mutations = {
  /* net data */
  SET_MESSAGE_FOR_CREATE_APP(state, content) {
    state.messageForCreateAPP = content;
    // if (USE_LOCAL_STORAGE) {
      localStorage.setItem('app/messageForCreateAPP', JSON.stringify(content));
    // }
  }
};

const getters = {
  /* net data */
  'messageForCreateAPP': (state, getters) => {
    return getValue({state, getters}, 'messageForCreateAPP');
  },
  'usersAll': (state, getters) => {
    return state.usersAll;
  },

  'currentWorkOrder': (state, getters) => {
    return state.currentWorkOrder;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
