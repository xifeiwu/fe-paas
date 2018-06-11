import BaseHelper from '$assets/js/store/helper'

class StoreHelper extends BaseHelper{
  constructor(Store) {
    super(Store);

    // used for item '全部' in app list, profile list, service list
    this.GROUP_ID_FOR_ALL = -1;
    this.PROFILE_ID_FOR_ALL = -1;
    this.APP_ID_FOR_ALL = -1;
    this.APP_ID_FOR_NULL = '';
    this.SERVICE_ID_FOR_ALL = -1;
    this.SERVICE_ID_FOR_NULL = '';
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

  groupInfo() {
    return this.$store.getters['user/groupInfo'];
  }

  get appInfoListOfGroup() {
    let appInfoListOfGroup = this.$store.getters['user/appInfoListOfGroup'];
    if (!appInfoListOfGroup) {
      this.$store.dispatch('user/appInfoListOfGroup', {
        from: 'vue.$storeHelper',
        groupID: this.currentGroupID
      });
    }
    return appInfoListOfGroup;
  }

  set appInfoListOfGroup(value) {
    this.$store.commit('user/appInfoListOfGroup', value);
  }

  get profileListOfGroup() {
    return this.$store.getters['user/profileListOfGroup'];
  }

  get groupRelatedInfo() {
    let productionProfileCount = 0;
    if (Array.isArray(this.profileListOfGroup)) {
      this.profileListOfGroup.forEach(it => {
        if (it.spaceType === 'PRODUCTION') {
          productionProfileCount += 1;
        }
      })
    }
    let onlyOneProductionProfile = (productionProfileCount === 1);
    return {
      onlyOneProductionProfile,
    }
  }

  usersInGroup() {
    return this.$store.getters['user/usersInGroup'];
  }

  // get all users, request again if not exist
  usersAll() {
    let usersAll = this.$store.getters['app/usersAll'];
    if (!usersAll) {
      this.$store.dispatch('app/usersAll');
    }
    return usersAll;
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

  /**
   *
   * @param appID
   * @returns {*}
   * app: {
   *   appId: 2966,
   *   appName: '产品服务',
   *   profileNames: ['test', 'production', 'dev', 'performance']
   * }
   */
  getAppInfoByID(appID) {
    let result = null;
    let appInfoListOfGroup = this.appInfoListOfGroup;
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
    let appInfoListOfGroup = this.appInfoListOfGroup;
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
    let appInfoListOfGroup = this.appInfoListOfGroup;
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
    this.profileListOfGroup.some(it => {
      target = it.id === id ? it : null;
      return target
    });
    return target;
  }
  getProfileInfoByType(type) {
    let target = null;
    this.profileListOfGroup.some(it => {
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
    let profileListOfGroup = this.profileListOfGroup;
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

  setTmpProp(key, value) {
    this.$store.dispatch(`tmp/${key}`, value);
  }
  getTmpProp(key) {
    return this.$store.getters[`tmp/${key}`];
  }

  set notPermitted(value) {
    this.setPermission({profile: value})
  }

  get notPermitted() {
    let result = {};
    let permission = this.getPermission('profile');
    if (Array.isArray(permission)) {
      permission.forEach(it => {
        result[it] = true;
      })
    }
    return result;
  }
}

export default StoreHelper;