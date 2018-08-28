export default class StoreHelper {
  constructor(store) {
    this.$store = store;
    this._dataTransfer = null;
  }

  setUserConfig(keys, value) {
    this.$store.dispatch('global/setConfig', {
      keys, value
    })
  }

  getUserConfig(keys) {
    let config = this.$store.getters['global/config'];
    if (!keys || 0 === keys.length) {
      return;
    }
    if (!config) {
      return;
    }
    let value = null;
    let keyList = keys.split('/');
    let lastKeyIndex = keyList.length - 1;
    let prop = keyList[lastKeyIndex];
    if (0 === lastKeyIndex) {
      if (config.hasOwnProperty(prop)) {
        value = config[prop];
      }
    } else {
      let tmpValue = config;
      let subList = keyList.slice(0, lastKeyIndex);
      for (var index in subList) {
        let key = keyList[index];
        if (tmpValue.hasOwnProperty(key)) {
          tmpValue = tmpValue[key];
        } else {
          tmpValue = null;
          break;
        }
      }
      if (tmpValue && tmpValue.hasOwnProperty(prop)) {
        value = tmpValue[prop];
      }
    }
    if (value) {
      value = JSON.parse(JSON.stringify(value));
    }
    return value;
  }

  getState(key) {
    try {
      let value = localStorage.getItem(key);
      if (value !== 'undefined') {
        return JSON.parse(value);
      }
    } catch (err) {
    }
    return undefined;
  }

  setState(key, state) {
    return localStorage.setItem(key, JSON.stringify(state));
  }

  updateLoginState(key, value) {
    let loginState = this.getState('login');
    if (!loginState) {
      loginState = {};
    }
    let keyList = key.split('/');
    let lastKeyIndex = keyList.length - 1;
    let prop = keyList[lastKeyIndex];
    if (0 === lastKeyIndex) {
      loginState[prop] = value;
    } else {
      let tmpValue = loginState;
      keyList.slice(0, lastKeyIndex).forEach(it => {
        if (!tmpValue.hasOwnProperty(it)) {
          tmpValue[it] = {};
        }
        tmpValue = tmpValue[it];
      });
      tmpValue[prop] = value;
    }
    this.setState('login', loginState);
  }

  getLoginState(key) {
    let value = null;
    let loginState = this.getState('login');
    if (!loginState) {
      return value;
    }
    let keyList = key.split('/');
    let lastKeyIndex = keyList.length - 1;
    let prop = keyList[lastKeyIndex];
    if (0 === lastKeyIndex) {
      if (loginState.hasOwnProperty(prop)) {
        value = loginState[prop];
      }
    } else {
      let tmpValue = loginState;
      keyList.slice(0, lastKeyIndex).every(it => {
        if (tmpValue.hasOwnProperty(it)) {
          tmpValue = tmpValue[it];
        } else {
          tmpValue = null;
        }
        return tmpValue;
      });
      if (tmpValue && tmpValue.hasOwnProperty(prop)) {
        value = tmpValue[prop];
      }
    }
    return value;
  }
  get menuList() {
    return this.getLoginState('menuList');
  }
  get navMenu() {
    return this.getLoginState('navMenu');
  }
  get userInfo() {
    return this.getLoginState('userInfo');
  }
  // TODO: for compatible
  getUserInfo(key) {
    let value = null;
    if (this.userInfo) {
      value = this.userInfo[key];
    }
    return value;
  }

  set dataTransfer(data) {
    this._dataTransfer = data;
  }

  get dataTransfer() {
    return this._dataTransfer;
  }

  /**
   * set user permission to localStorage
   * @param permission, format: {page: permissionList}
   */
  setPermission(permission) {
    this.$store.commit('global/permission', permission);
  }

  getPermission(page) {
    let result = null;
    let permission= this.$store.getters['global/permission'];
    if (permission && permission[page]) {
      result = permission[page];
    }
    return result;
  }

  logout() {
    this.$store.dispatch('global/clearOnLogout');
    this.updateLoginState('userInfo', null);
  }
}