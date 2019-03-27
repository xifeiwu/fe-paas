import globalStore from './index';

export default class StoreHelper {
  constructor(store) {
    this.$globalStore = globalStore;
    this.$store = store;
    this._dataTransfer = null;
  }

  get version() {
    return this.$globalStore.getters['version'];
  }
  set version(version) {
    this.$globalStore.dispatch('version', version);
  }

  get globalUserGroupInfo() {
    return this.$globalStore.getters['user/groupInfo'];
  }
  // global
  get userInfo() {
    return this.$globalStore.getters['user/userInfo'];
  }
  // 是否是访客
  get isGuest() {
    return this.userInfo.role === 'guest';
  }

  // TODO: for compatible
  getUserInfo(key) {
    let value = null;
    if (this.userInfo) {
      value = this.userInfo[key];
    }
    return value;
  }
  get menus() {
    return this.$globalStore.getters['user/menus'];
  }
  get profileNavMenu() {
    let result = [];
    if (this.menus && this.menus.hasOwnProperty('profile')) {
      result = this.menus['profile'];
    }
    return result;
  }

  // TODO: not used
  setUserConfig(keys, value) {
    this.$store.dispatch('global/setConfig', {
      keys, value
    })
  }

  // TODO: not used
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
    // this.$store.commit('status/permission', permission);
    this.$globalStore.commit('user/SET_PERMISSION', permission);
  }

  getPermission(page) {
    let result = null;
    let permission = this.$globalStore.getters['user/permission'];
    if (permission && permission[page]) {
      result = permission[page];
    }
    return result;
  }

  logout() {
    this.$globalStore.dispatch('logout');
  }

  get JOB_LIST() {
    return [{
      description: "开发工程师",
      name: "DEVELOP_ENGINEER"
    }, {
      description: "测试工程师",
      name: "TESTING_ENGINEER"
    }, {
      description: "DBA",
      name: "DBA"
    }, {
      description: "TECH LEADER",
      name: "TECH_LEADER"
    }, {
      description: "PRODUCT OWNER",
      name: "PRODUCT_OWNER"
    }];
  }
}