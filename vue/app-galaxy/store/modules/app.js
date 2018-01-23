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
  /* state data */
  stepOfAddAPP: 0,
  infoForCreateApp: {},
  infoForCreateAppToPost: {},
  infoForCreateService: {},
  infoForCreateServiceToPost: {},

  /* net data */
  messageForCreateAPP: null,
  usersAll: null,
  currentWorkOrderDetail: null,
};

const actions = {
  /* state data */
  // TODO: unused
  updateStepOfAddAPP({commit, state}, step) {
    state.stepOfAddAPP = step;
  },
  addCreateAPPInfo({commit, state}, params) {
    if (null === params) {
      state.messageForCreateAPP = {}
      return
    }
    state.infoForCreateApp = params.value;
    // if (state.infoForCreateApp.hasOwnProperty('page1') && state.infoForCreateApp.hasOwnProperty('page2')
    //   && state.infoForCreateApp.hasOwnProperty('page3')) {
    commit('SET_INFO_FOR_CREATE_APP', state.infoForCreateApp);
    // }
  },
  addCreateServiceInfo({commit, state}, params) {
    if (null === params) {
      state.messageForCreateService = {}
      return
    }
    state.infoForCreateService = params.value;
    commit('SET_INFO_FOR_CREATE_SERVICE', state.infoForCreateService);
  },

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

  setWorkOrderDetail({commit, state}, detail) {
    state.currentWorkOrderDetail = detail;
  }
};

const mutations = {
  /* state data */
  SET_INFO_FOR_CREATE_APP(state, infoForCreateApp) {
    state.infoForCreateAppToPost = postFormatter.infoToCreateAPP(infoForCreateApp);
  },
  SET_INFO_FOR_CREATE_SERVICE(state, infoForCreateService) {
    state.infoForCreateServiceToPost = postFormatter.infoToCreateAPP(infoForCreateService);
    state.infoForCreateServiceToPost.serviceVersion = 'v' + state.infoForCreateServiceToPost.serviceVersion;
  },

  /* net data */
  SET_MESSAGE_FOR_CREATE_APP(state, content) {
    state.messageForCreateAPP = content;
    // if (USE_LOCAL_STORAGE) {
      localStorage.setItem('app/messageForCreateAPP', JSON.stringify(content));
    // }
  }
};

const getters = {
  /* state data */
  'stepOfAddAPP': (state, getters) => {
    return state.stepOfAddAPP;
  },
  'infoForCreateApp': (state, getters) => {
    return state.infoForCreateApp;
  },
  'infoForCreateAppToPost': (state, getters) => {
    return getValue({state, getters}, 'infoForCreateAppToPost');
  },
  'infoForCreateServiceToPost': (state, getters) => {
    return getValue({state, getters}, 'infoForCreateServiceToPost');
  },

  /* net data */
  'messageForCreateAPP': (state, getters) => {
    return getValue({state, getters}, 'messageForCreateAPP');
  },
  'usersAll': (state, getters) => {
    return state.usersAll;
  },

  'currentWorkOrderDetail': (state, getters) => {
    return state.currentWorkOrderDetail;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
