const debug = browserDebug('pass-fe:store/global');

const warning = function(prop, where) {
  debug(`warning: get user/${prop} from ${where}`);
};

var LOCAL_PROP = ['config', 'permission'];
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
  if (state && (null != state[prop])) {
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
  // 权限相关
  permission: JSON.parse(localStorage.getItem('user/permission')) ? JSON.parse(localStorage.getItem('user/permission')) : {},
};

const actions = {
  clearOnLogout({commit, state, getters}) {
    state.config = null;
    localStorage.removeItem('user/config');
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
  }
};

const mutations = {
  permission(state, permission) {
    state.permission = Object.assign(state.permission, permission);
    localStorage.setItem('user/permission', JSON.stringify(state.permission));
  }
};

const getters = {
  'config': (state, getters) => {
    return getValue({state, getters}, 'config');
  },
  'permission': (state, getters) => {
    return getValue({state, getters}, 'permission');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}