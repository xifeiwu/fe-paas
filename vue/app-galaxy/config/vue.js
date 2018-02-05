/**
 * Created by xifei.wu on 2018/1/5.
 */

class StoreHelper {
  constructor(Store) {
    this.$store = Store;
    // this.groupList = this.$store.getters['user/groupList'];
    this.groupInfo = this.$store.getters['user/groupInfo'];
    // this.profileListOfGroup = this.$store.getters['user/profileListOfGroup'];
    // this.appInfoListOfGroup = this.$store.getters['user/appInfoListOfGroup'];
    this.usersInGroup = this.$store.getters['user/usersInGroup'];
    this.usersAll = this.$store.getters['app/usersAll'];
    let messageForCreateAPP = this.$store.getters['app/messageForCreateAPP'];
    if (messageForCreateAPP && messageForCreateAPP.hasOwnProperty('LanguageList')) {
      this.languageInfo = messageForCreateAPP.LanguageList;
    }
    this.messageForCreateAPP = messageForCreateAPP;

    this.PROFILE_ID_FOR_ALL = -1;
    this.APP_ID_FOR_ALL = -1;
    this.SERVICE_ID_FOR_ALL = -1;
  }

  appInfoListOfGroup() {
    return this.$store.getters['user/appInfoListOfGroup'];
  }
  profileListOfGroup() {
    return this.$store.getters['user/profileListOfGroup'];
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

  getAppInfoByID(appID) {
    let result = null;
    let appInfoListOfGroup = this.appInfoListOfGroup();
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
        id: this.APP_ID_FOR_ALL
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

  getProfileInfoByType(type) {
    let target = null;
    this.profileListOfGroup().some(it => {
      target = it.spaceType === type ? it : null;
      return target
    });
    return target;
  }
  getProfileInfoByName(name) {
    let target = null;
    this.profileListOfGroup().some(it => {
      target = it.name === name ? it : null;
      return target
    });
    return target;
  }
  // getProfileInfoOfProduct() {
  //   return this.getProfileInfoByName('production');
  // }

  getProfileInfoByID(id) {
    let target = null;
    this.profileListOfGroup().some(it => {
      target = it.id === id ? it : null;
      return target
    });
    return target;
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
      if (this.usersAll && Array.isArray(this.usersAll)) {
        results = this.usersAll.filter(it => {
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
      // let messageForCreateAPP = STORE.getters['app/messageForCreateAPP'];
      if (!this.messageForCreateAPP) {
        // utils.error('messageForCreateAPP not found', 'app_prop.js');
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
}


class VUEConfig {
  constructor(Vue, Store) {
    this.setConfig(Vue, Store);
  }
  setConfig(Vue, Store) {
    this.addMixin(Vue);
    this.addStoreTools(Vue, Store);
    this.addGlobalFunction(Vue, Store);
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
  addGlobalFunction(Vue, Store) {
    Vue.prototype.$storeHelper = new StoreHelper(Store);
  }

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