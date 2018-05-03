/**
 * Created by xifei.wu on 2018/1/5.
 */

class StoreHelper {
  constructor(Store) {
    this.$store = Store;

    // used for item '全部' in app list, profile list, service list
    this.GROUP_ID_FOR_ALL = -1;
    this.PROFILE_ID_FOR_ALL = -1;
    this.APP_ID_FOR_ALL = -1;
    this.SERVICE_ID_FOR_ALL = -1;
    this.SERVICE_ID_FOR_NULL = '';
  }

  menuList() {
    return this.$store.getters['user/menuList']
  }

  groupInfo() {
    return this.$store.getters['user/groupInfo'];
  }

  appInfoListOfGroup() {
    let appInfoListOfGroup = this.$store.getters['user/appInfoListOfGroup'];
    if (!appInfoListOfGroup) {
      this.$store.dispatch('user/appInfoListOfGroup', {
        from: 'vue.$storeHelper',
        groupID: this.currentGroupID
      });
    }
    return appInfoListOfGroup;
  }
  profileListOfGroup() {
    return this.$store.getters['user/profileListOfGroup'];
  }

  // get all users, request again if not exist
  usersAll() {
    let usersAll = this.$store.getters['app/usersAll'];
    if (!usersAll) {
      this.$store.dispatch('app/usersAll');
    }
    return usersAll;
  }

  usersInGroup() {
    return this.$store.getters['user/usersInGroup'];
  }

  get currentGroupID() {
    let groupID = null;
    let groupInfo = this.$store.getters['user/groupInfo'];
    if (groupInfo && groupInfo.hasOwnProperty('id')) {
      groupID = groupInfo.id;
    }
    return groupID;
  }
  set currentGroupID(value) {
    this.$store.dispatch('user/groupID', {
      value,
      from: 'store-helper'
    });
  }

  groupList() {
    return this.$store.getters['user/groupList'];
  }

  /**
   * message for create app: cpuAndMemoryList, languageInfo
   */
  messageForCreateAPP() {
    return this.$store.getters['app/messageForCreateAPP'];
  }

  cpuAndMemoryList() {
    let result = [];
    let messageForCreateAPP = this.messageForCreateAPP();
    if (messageForCreateAPP && messageForCreateAPP.hasOwnProperty('cpuAndMemorylist')) {
      result = messageForCreateAPP.cpuAndMemorylist;
    }
    return result;
  }

  languageInfo() {
    let result = [];
    let messageForCreateAPP = this.messageForCreateAPP();
    if (messageForCreateAPP && messageForCreateAPP.hasOwnProperty('LanguageList')) {
      result = messageForCreateAPP.LanguageList;
    }
    return result;
  }

  getAppInfoByID(appID) {
    let result = null;
    let appInfoListOfGroup = this.appInfoListOfGroup();
    if (!appInfoListOfGroup || !appInfoListOfGroup.hasOwnProperty('appList')) {
      return result;
    }
    for (let index in appInfoListOfGroup.appList) {
      let item = appInfoListOfGroup.appList[index];
      if (item.appId == appID) {
        result = {
          index: index,
          app: item,
          model: appInfoListOfGroup.appModelList[index]
        };
        break;
      }
    }
    return result;
  }

  getAppByID(appID) {
    let result = null;
    if (this.APP_ID_FOR_ALL === appID) {
      result = {
        appId: this.APP_ID_FOR_ALL
      };
    } else {
      let appInfo = this.getAppInfoByID(appID);
      if (appInfo) {
        result = appInfo['app'];
      }
    }
    return result;
  }

  /** get app list by profileID
   * @param profileInfoID, if null return all, else filter by id
   * @returns {*}
   */
  getAppListByProfileID(profileInfoID) {
    let appInfoListOfGroup = this.appInfoListOfGroup();
    if (!appInfoListOfGroup || !appInfoListOfGroup.hasOwnProperty('appList')) {
      return null;
    }
    let appList = appInfoListOfGroup.appList;
    if (this.PROFILE_ID_FOR_ALL === profileInfoID) {
      return appList;
    } else {
      return appList.filter(it => {
        let ok = false;
        if (it.hasOwnProperty('profileList')) {
          let profileList = it['profileList'];
          profileList.some(profile => {
            ok = profile.id === profileInfoID;
            return ok;
          })
        }
        return ok;
      })
    }
  }

  deleteAppInfoByID(appID) {
//      this.$store.dispatch('user/deleteAppInfoByID', appID);
    let result = {
      exist: false,
      index: -1,
    }
    let appInfoListOfGroup = this.appInfoListOfGroup();
    for (let index in appInfoListOfGroup.appList) {
      let item = appInfoListOfGroup.appList[index];
      if (item.appId == appID) {
        result.exist = true;
        result.index = index;
        break;
      }
    }
    if (result.exist) {
      appInfoListOfGroup.appList.splice(result.index, 1);
      appInfoListOfGroup.appModelList.splice(result.index, 1);
      appInfoListOfGroup.total -= 1;
    }
    // console.log(this.appInfoListOfGroup);
  }

  /**
   * the format of profile
   * {
   *   description: "开发环境",
   *   id: 1,
   *   isDefault: true,
   *   name: "dev",
   *   spaceType: "DEV"
   * }
   */
  getProfileInfoByID(id) {
    let target = null;
    this.profileListOfGroup().some(it => {
      target = it.id === id ? it : null;
      return target
    });
    return target;
  }
  getProfileInfoByType(type) {
    let target = null;
    this.profileListOfGroup().some(it => {
      target = it.spaceType === type ? it : null;
      return target
    });
    return target;
  }
  getProductionProfile() {
    return this.getProfileInfoByType('PRODUCTION');
  }
  getProfileInfoByName(name) {
    let target = null;
    let profileListOfGroup = this.profileListOfGroup();
    if (Array.isArray(profileListOfGroup)) {
      profileListOfGroup.some(it => {
        target = it.name === name ? it : null;
        return target
      });
    }
    return target;
  }
  /**
   * change the format of profileList item from
   * dev to {
   *   name: 'dev',
   *   description: '开发环境'
   * }
   * as description should be shown in page app_manager
  */
  getProfileInfoListByNameList(nameList) {
    let result = [];
    if (Array.isArray(nameList)) {
      result = nameList.filter(it => {
        // for the case profile not found in profile list of group
        return null != this.getProfileInfoByName(it);
      }).map(it => {
        return this.getProfileInfoByName(it);
      });
    }
    return result;
  }

  // getProfileInfoOfProduct() {
  //   return this.getProfileInfoByName('production');
  // }
  isProductionProfile(id) {
    let profileInfo = this.getProfileInfoByID(id);
    return profileInfo && profileInfo.hasOwnProperty('spaceType') && profileInfo.spaceType === 'PRODUCTION';
  }

  getGroupInfoByID(groupID) {
    let target;
    this.groupList().some(it => {
      target = it.id === groupID ? it : null;
      return target
    });
    return target;
  }

  getGroupInfoByName(groupName) {
    let target;
    this.groupList().some(it => {
      target = it.name === groupName ? it : null;
      return target
    });
    return target;
  }
  getUserInfoByID(userIdList) {
    let results = null;
    if (Array.isArray(userIdList)) {
      let usersAll = this.usersAll();
      if (usersAll && Array.isArray(usersAll)) {
        results = usersAll.filter(it => {
          return userIdList.indexOf(it.id) > -1;
        })
      }
    }
    return results;
  }

  cpuAndMemoryList() {
    let result = [];
    let value = this.$store.getters['app/messageForCreateAPP'];
    if (value && value.hasOwnProperty('cpuAndMemorylist')) {
      result = value.cpuAndMemorylist;
    }
    return result;
  }

  // 创建应用时用到的信息：cpu和内存信息；语言列表
  getMessageForCreateAPP(prop) {
    if (['cpuAndMemorylist', 'LanguageList'].indexOf(prop) > -1) {
      if (!this.messageForCreateAPP) {
        return null;
      }
      return this.messageForCreateAPP[prop];
    } else {
      return null;
    }
  }

  setUserConfig(keys, value) {
    this.$store.dispatch('user/setConfig', {
      keys, value
    })
  }

  getUserConfig(keys) {
    let config = this.$store.getters['user/config'];
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
    return value;
  }

  setUserInfo(keys, value) {
    this.$store.dispatch('user/setInfo', {
      keys, value
    })
  }

  getUserInfo(keys) {
    let config = this.$store.getters['user/info'];
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
    return value;
  }

  setTmpProp(key, value) {
    this.$store.dispatch(`tmp/${key}`, value);
  }
  getTmpProp(key) {
    return this.$store.getters[`tmp/${key}`];
  }
}


import utils from 'assets/js/utils';

class VUEConfig {
  constructor(Vue, Store, URL_LIST, NetHelper) {
    this.setConfig(Vue, Store, URL_LIST, NetHelper);
  }
  setConfig(Vue, Store, URL_LIST, NetHelper) {
    this.addMixin(Vue);
    this.addStoreTools(Vue, Store);
    this.addGlobalFunction(Vue, Store, URL_LIST, NetHelper);
  }
  addMixin(Vue){
    Vue.mixin({
      methods: {
        $refresh: function () {
          this.$router.go({
            path: this.$route.path,
            force: true
          })
        }
      }
    });
  }
  addGlobalFunction(Vue, Store, URL_LIST, NetHelper) {
    Vue.prototype.$storeHelper = new StoreHelper(Store);
    Vue.prototype.$utils = utils;
    Vue.prototype.$url = URL_LIST;
    // $storeHelper and $utils in Vue.prototype will be used in NetData
    NetHelper.setVue(Vue);
    Vue.prototype.$net = NetHelper;
  }

  // TODO: store realted function will be moved to Vue.prototype.$storeHelper
  addStoreTools(Vue, Store) {
    Vue.prototype.$setUserConfig = function(keys, value) {
      Store.dispatch('user/setConfig', {
        keys, value
      })
    };
    Vue.prototype.$getUserConfig = function(keys) {
      let config = Store.getters['user/config'];
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
      return value;
    };
    Vue.prototype.$setUserInfo = function(keys, value) {
      Store.dispatch('user/setInfo', {
        keys, value
      })
    };
    Vue.prototype.$getUserInfo = function(keys) {
      let config = Store.getters['user/info'];
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
      return value;
    };
    Vue.prototype.$showError = function(err) {
      if (typeof(err) === 'string') {
        Vue.prototype.$notify({
          title: '错误',
          message: err,
          duration: 0,
        })
      }
    };
  }
}

export default VUEConfig;