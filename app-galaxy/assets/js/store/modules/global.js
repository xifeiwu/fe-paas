const debug = browserDebug('pass-fe:store/global');

const warning = function(prop, where) {
  debug(`warning: get user/${prop} from ${where}`);
};

var LOCAL_PROP = ['config', 'info', 'menuList'];
const getValue = function({state, getters}, prop) {
  const getLocalValue = function() {
    let result = null;
    warning(prop, 'localStorage');
    let local = localStorage.getItem('user/' + prop);
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
  } else if (LOCAL_PROP.indexOf(prop) > -1) {
    result = getLocalValue();
  }
  return result;
};

const state = {
  /* net data */
  // 用户配置相关信息
  config: null,
  // 用户相关信息
  info: null,
  // 侧边栏
  menuList: null,
  // 在spa页面传递数据
  spaDataTransfer: null,
};

const actions = {
  clearOnLogout({commit, state, getters}) {
    state.info = null;
    state.config = null;
    localStorage.removeItem('user/info');
    localStorage.removeItem('user/config');

    state.menuList = null;
    localStorage.removeItem('user/menuList');
  },

  /**
   * save some config value to localStorage
   * format:
   * setConfig('profile/service/appID', 3);
   */
  setConfig({commit, state, getters}, {keys, value}) {
    if (!keys || 0 === keys.length) {
      return;
    }
    if (null == state.config) {
      let local = getters['config'];
      // for case 'user/config' is 'undefined'
      if (local && typeof(state.config) === 'object') {
        state.config = local;
      } else {
        state.config = {};
      }
    }
    let keyList = keys.split('/');
    let lastKeyIndex = keyList.length - 1;
    let prop = keyList[lastKeyIndex];
    if (0 === lastKeyIndex) {
      state.config[prop] = value;
    } else {
      let tmpValue = state.config;
      keyList.slice(0, lastKeyIndex).forEach(it => {
        if (!tmpValue.hasOwnProperty(it)) {
          tmpValue[it] = {};
        }
        tmpValue = tmpValue[it];
      });
      tmpValue[prop] = value;
    }
    if (state.config && typeof(state.config) === 'object') {
      localStorage.setItem('user/config', JSON.stringify(state.config));
    }
  },
  setInfo({commit, state, getters}, {keys, value}) {
    if (!keys || 0 === keys.length) {
      return;
    }
    if (null == state.info) {
      let local = getters['info'];
      // for case 'user/info' is 'undefined'
      if (local && typeof(state.info) === 'object') {
        state.info = local;
      } else {
        state.info = {};
      }
    }
    let keyList = keys.split('/');
    let lastKeyIndex = keyList.length - 1;
    let prop = keyList[lastKeyIndex];
    if (0 === lastKeyIndex) {
      state.info[prop] = value;
    } else {
      let tmpValue = state.info;
      keyList.slice(0, lastKeyIndex).forEach(it => {
        if (!tmpValue.hasOwnProperty(it)) {
          tmpValue[it] = {};
        }
        tmpValue = tmpValue[it];
      });
      tmpValue[prop] = value;
    }
    if (state.info && typeof(state.info) === 'object') {
      localStorage.setItem('user/info', JSON.stringify(state.info));
    }
  },
};

const mutations = {
  menuList(state, menuList) {
    state.menuList = menuList;
    localStorage.setItem('user/menuList', JSON.stringify(menuList));
  },
  spaDataTransfer(state, data) {
    state.spaDataTransfer = data;
  }
};

const getters = {
  'config': (state, getters) => {
    return getValue({state, getters}, 'config');
  },
  'info': (state, getters) => {
    return getValue({state, getters}, 'info');
  },
  'menuList': (state, getters) => {
    return getValue({state, getters}, 'menuList');
  },
  'spaDataTransfer': (state, getters) => {
    return getValue({state, getters}, 'spaDataTransfer');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}