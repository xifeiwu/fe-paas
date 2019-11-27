import * as shvl from 'shvl';
import globalStore from './index';
import Net from '../net';
import Common from '../common';
const net = new Net();

export default class StoreHelper extends Common {
  constructor(store) {
    super();
    this.$globalStore = globalStore;
    this.$store = store;
    this._dataTransfer = null;

    // TODO: remove the logic
    // save status(variable) for each page, not perisistent(persistent status save in localStorage)
    this.globalStatus = {};
    for (let key in net.page) {
      let value = net.page[key];
      this.globalStatus[value] = {};
    }
    this.betaProfileId = 4;
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
    return this.userInfo.role === '普通成员';
  }

  /**
   *
   * @param size: {width: 100,height: 100}
   */
  set screen(size) {
    this.$globalStore.dispatch('setScreenSize', size);
  }
  get screen() {
    return this.$globalStore.getters['screen'];
  }

  // TODO: will be replaced by userInfo
  getUserInfo(key) {
    let value = null;
    if (this.userInfo) {
      value = this.userInfo[key];
    }
    return value;
  }
  set menus(valMap) {
    this.$globalStore.dispatch('user/updateMenus', valMap);
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

  /**
   * get props stored in localStorage of the page
   * @param page
   * @param path, in the form of a.b.c. user.groupList
   * @returns {any}
   */
  getPropsFromLocalStorage(page, path) {
    var pageInfo = null;
    try {
      pageInfo = JSON.parse(localStorage.getItem(page));
    } catch(err) {
      pageInfo = null;
    }
    return shvl.get(pageInfo, path);
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

  set permission(value) {
    this.$globalStore.dispatch('user/permission', value);
  }
  get permission() {
    return this.$globalStore.getters['user/permission'];
  }

  actionToPermission(action) {
    const actionMap = {
      domain_add_open_dialog: 'domain_add',
      open_dialog_update_pod_spec: 'get_affinity',

      /** page oauth*/
      // 创建accessKey
      open_dialog_oauth_access_key_create: 'oauth_access_key_create',
      // 修改秘钥
      open_dialog_oauth_secret_change: 'oauth_update_secret',
      // 修改访问配置
      open_dialog_oauth_access_key_and_config_update: 'oauth_update_access_config',
    };
    return actionMap.hasOwnProperty(action) ? actionMap[action] : action
  }
  _permissionDisabled(permission) {
    return permission && this.permission[permission] && this.permission[permission].disabled;
  }
  reason4ActionDisabled(action) {
    const stillPermitWhenPublishing = (permission) => {
      return ['get_affinity', 'update_affinity'].includes(permission);
    };
    const permission = this.actionToPermission(action);
    var reason = false;
    if (this.serverIsPublishing && !stillPermitWhenPublishing(permission)) {
      reason = '因云平台正在发布，在此期间不能进行此操作，谢谢您的合作'
    } else if (this._permissionDisabled(permission)) {
      reason = this.permission[permission]['reason'];
    }
    return reason;
  }
  actionDisabled(action) {
    const reason = this.reason4ActionDisabled(action);
    if (reason === false) {
      return false;
    } else {
      return true;
    }
  }
  // TODO: fix
  // action
  set publishStatus(value) {
    this.$globalStore.dispatch('setPublishStatus', value);
  }
  // 后台服务是否正在部署
  get serverIsPublishing() {
    return this.$globalStore.getters['publishStatus'];
  }
  get publishStatus() {
    return this.$globalStore.getters['publishStatus'];
  }
}