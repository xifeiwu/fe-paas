import BaseHelper from 'assets/js/store/helper';
import store from './index';

class StoreHelper extends BaseHelper{
  constructor() {
    super(store);

    // used for item '全部' in app list, profile list, service list
    this.GROUP_ID_FOR_ALL = -1;
    this.PROFILE_ID_FOR_ALL = -1;
    this.APP_ID_FOR_ALL = -1;
    this.APP_ID_FOR_NULL = '';
    this.PROFILE_ID_FOR_NULL = '';
    this.SERVICE_ID_FOR_ALL = -1;
    this.SERVICE_ID_FOR_NULL = '';
    // popover on click
    this.globalPopover = null;
    this.globalTip = null;

    this.checkBasicData4Middleware = () => {};
    this.currentMiddleware = {
      clusterId: null,
      middlewareId: null,
    };
    // this.clusterList = null;
  }

  set currentGroupID(groupId) {
    this.$store.dispatch('user/toGroupId', groupId);
  }
  get currentGroupID() {
    var groupId = null;
    if (this.groupInfo) {
      groupId = this.groupInfo['id'];
    }
    try {
      groupId = parseInt(groupId);
    } catch(err) {
      groupId = null;
    }
    return groupId;
  }
  get groupInfo() {
    return this.$store.getters['user/groupInfo'];
  }

  get userConfig() {
    return this.$store.getters['user/config'];
  }

  get lobInfo() {
    return this.$store.getters['user/lobInfo'];
  }
  set lobInfo(value) {
    this.$store.dispatch('user/lobInfo', value);
  }

  get screen() {
    return this.$store.getters['screen'];
  }
  get navMenuWidth() {
    return this.$store.getters['navMenuWidth'];
  }

  get groupList() {
    return this.$store.getters['user/groupList'];
  }

  get groupVersion() {
    var result = 'v2';
    try {
      result = this.groupInfo['supportVersion'] == '1.x' ? 'v1' : 'v2';
    } catch(err) {

    }
    return result;
  }

  get appInfoListOfGroup() {
    let appInfoListOfGroup = this.$store.getters['user/appInfoListOfGroup'];
    // if (!appInfoListOfGroup) {
    //   this.$store.dispatch('user/appInfoListOfGroup', {
    //     from: 'vue.$storeHelper',
    //     groupID: this.currentGroupID
    //   });
    // }
    return appInfoListOfGroup;
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

  get usersInGroup() {
    const usersInGroup = this.$store.getters['user/usersInGroup'];
    return usersInGroup;
  }

  // get all users, request again if not exist
  usersAll() {
    let usersAll = this.$store.getters['app/usersAll'];
    if (!usersAll) {
      this.$store.dispatch('app/usersAll');
    }
    return usersAll;
  }

  get appMonitorList() {
    return [{
      id: 0,
      name: '无监控'
    },
      //   {
      //   id: 1,
      //   name: 'OneAPM监控'
      // },
      {
        id: 2,
        name: '鹰眼监控'
      }]
  }
  get defaultAppMonitorId() {
    return this.appMonitorList[0]['id'];
  }
  getMonitorNameById(id) {
    var target = null;
    this.appMonitorList.some(it => {
      if (it.id === id) {
        target = it;
      }
      return target;
    });
    var result = '未设置';
    if (target && target.hasOwnProperty('name')) {
      result = target['name'];
    }
    return result
  }

  /**
   * message for create app: cpuAndMemoryList, languageInfo, healthCheckTypeList
   */
  get globalConfig() {
    return this.$store.getters['app/globalConfig'];
  }

  get cpuAndMemoryList() {
    let result = [];
    let globalConfig = this.globalConfig;
    if (globalConfig && globalConfig.hasOwnProperty('cpuAndMemorylist')) {
      result = globalConfig.cpuAndMemorylist;
    }
    return result;
  }

  get languageInfo() {
    let result = [];
    let globalConfig = this.globalConfig;
    if (globalConfig && globalConfig.hasOwnProperty('LanguageList')) {
      result = globalConfig.LanguageList;
    }
    return result;
  }

  // 所有运行环境信息
  get profileListAll() {
    let result = [];
    const globalConfig = this.globalConfig;
    if (globalConfig && globalConfig.hasOwnProperty('profileList')) {
      result = globalConfig.profileList;
    }
    return result;
  }

  // 创建应用时用到的信息：cpu和内存信息；语言列表
  // getMessageForCreateAPP(prop) {
  //   if (['cpuAndMemorylist', 'LanguageList'].indexOf(prop) > -1) {
  //     if (!this.globalConfig) {
  //       return null;
  //     }
  //     return this.globalConfig[prop];
  //   } else {
  //     return null;
  //   }
  // }

  /**
   *
   * @param cpuSize, 1, 2, 4 ...
   * @param memorySize, in the format of G or M. such as 1024, 6048. if memorySize >= 1024, treat as M, or treat as G.
   * @returns {Array}
   */
  getCPUAndMemoryInfoBySize(cpuSize, memorySize) {
    let model = [];
    const cpuAndMemoryList = this.cpuAndMemoryList;
    if (!cpuAndMemoryList || !Array.isArray(cpuAndMemoryList)) {
      return model;
    }
    // console.log(cpuAndMemoryList);
    memorySize = parseInt(memorySize);
    // if (memorySize >= 1024) {
      memorySize /= 1024;
    // }
    for (let index in cpuAndMemoryList) {
      let item = cpuAndMemoryList[index];
      if (item.cpu == cpuSize) {
        model.push({
          id: item.id,
          size: item.cpu
        });
        let memoryList = item.memoryList;
        for (let index2 in memoryList) {
          let item = memoryList[index2];
          if (item.memory == memorySize) {
            model.push({
              id: item.id,
              size: item.memory
            });
            break;
          }
        }
        break;
      }
    }
    // deal with the case cpuId or memoryId not found
    if (model.length != 2 && cpuAndMemoryList.length > 0) {
      model = [];
      let defaultConfig = cpuAndMemoryList[0];
      model.push({
        id: defaultConfig.id,
        size: cpuSize
        // size: defaultConfig.cpu
      });
      let memoryList = defaultConfig.memoryList;
      for (let index in memoryList) {
        let item = memoryList[index];
        if (1 == item.defaultSelect) {
          model.push({
            id: item.id,
            // size: item.memory
            size: memorySize
          });
        }
      }
    }
    return model;
  }

  /**
   * get cpu and memory info by id
   * @param cpuId
   * @param memoryId
   * @returns {Array}
   */
  getCPUAndMemoryInfoByID(cpuId, memoryId) {
    // let cpuAndMemoryList = this.getMessageForCreateAPP('cpuAndMemoryList');
    const cpuAndMemoryList = this.cpuAndMemoryList;
    let model = [];
    for (let index in cpuAndMemoryList) {
      let item = cpuAndMemoryList[index];
      if (item.id == cpuId) {
        model.push({
          id: item.id,
          size: item.cpu
        });
        let memoryList = item.memoryList;
        for (let index2 in memoryList) {
          let item = memoryList[index2];
          if (item.id == memoryId) {
            model.push({
              id: item.id,
              size: item.memory
            });
            break;
          }
        }
        break;
      }
    }
    return model;
  }

  // [{
  //   "id": 1,
  //   "language": "Java",
  //   "languageVersionList": [{
  //     "version": "1.8",
  //     "packageTypeList": [{
  //       "type": "JAR",
  //       "packageType": "JAR"
  //     }, {
  //       "type": "WAR",
  //       "packageType": "WAR"
  //     }, {
  //       "type": "ZIP",
  //       "packageType": "ZIP"
  //     }]
  //   }, {
  //     "version": "1.7",
  //     "packageTypeList": [{
  //       "type": "JAR",
  //       "packageType": "JAR"
  //     }, {
  //       "type": "WAR",
  //       "packageType": "WAR"
  //     }, {
  //       "type": "ZIP",
  //       "packageType": "ZIP"
  //     }]
  //   }],
  //   "type": "JAVA"
  // }]
  getPackageTypeListByLanguageAndVersion(languageType, version) {
    const languageInfo = this.languageInfo;
    let versionList = null;
    languageInfo.some(it => {
      if (it.language == languageType) {
        versionList = it.languageVersionList;
      }
      return versionList;
    });

    let packageTypeList = null;
    if (versionList) {
      versionList.some(it => {
        if (it.version == version) {
          packageTypeList = it.packageTypeList;
        }
      })
    }
    return packageTypeList;
  }

  // 健康检查类型
  // 0: {key: "0", desc: "http", label: "HTTP方式"}
  // 1: {key: "1", desc: "shell", label: "SHELL方式"}
  // 2: {key: "2", desc: "socket", label: "SOCKET方式"}
  get healthCheckTypeList() {
    let result = [];
    let globalConfig = this.globalConfig;
    if (globalConfig && globalConfig.hasOwnProperty('healthCheckList')) {
      // only use HTTP type
      result = globalConfig['healthCheckList'].slice(0, 1)
    }
    return result;
  }
  get healthCheckTypeListAll() {
    let result = [];
    let globalConfig = this.globalConfig;
    if (globalConfig && globalConfig.hasOwnProperty('healthCheckList')) {
      // only use HTTP type
      result = globalConfig['healthCheckList']
    }
    return result;
  }

  // 默认健康检查类型
  get defaultHealthCheckTypeDesc() {
    return this.healthCheckTypeList[0].desc;
  }

  // 通过desc获得key
  getHealthCheckTypeKeyByDesc(desc) {
    let target = null;
    this.healthCheckTypeList.some(it => {
      if (it.desc === desc) {
        target = it;
      }
    });
    let key = null;
    if (target) {
      key = target.key;
    }
    return key;
  }

  // 通过desc获得key
  getHealthCheckTypeDescByKey(key) {
    let target = null;
    this.healthCheckTypeListAll.some(it => {
      if (it.key == key) {
        target = it;
      }
    });
    let desc = null;
    if (target) {
      desc = target.desc;
    }
    return desc;
  }

  // 通过key获得HealthCheckType
  getHealthCheckTypeInfoByKey(key) {
    let target = null;
    this.healthCheckTypeList.some(it => {
      if (it.key == key) {
        target = it;
      }
    });
    return target;
  }

  // 通过desc获得HealthCheckType
  getHealthCheckTypeInfoByDesc(desc) {
    let target = null;
    this.healthCheckTypeList.some(it => {
      if (it.desc == desc) {
        target = it;
      }
    });
    return target;
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
    try {
      this.profileListOfGroup.some(it => {
        target = it.id === id ? it : null;
        return target
      });
    } catch(err) {
      console.log(err);
    }
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
    const profileListAll = this.profileListAll;
    if (Array.isArray(profileListAll)) {
      profileListAll.some(it => {
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
    this.groupList.some(it => {
      target = it.id === groupID ? it : null;
      return target
    });
    return target;
  }

  getGroupInfoByName(groupName) {
    let target;
    this.groupList.some(it => {
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

  setTmpProp(key, value) {
    this.$store.dispatch(`tmp/${key}`, value);
  }
  getTmpProp(key) {
    return this.$store.getters[`tmp/${key}`];
  }

  // set notPermitted(value) {
  //   this.setPermission({profile: value})
  // }
  //
  // get notPermitted() {
  //   let result = {};
  //   let permission = this.getPermission('profile');
  //   if (Array.isArray(permission)) {
  //     permission.forEach(it => {
  //       result[it] = true;
  //     })
  //   }
  //   return result;
  // }

  set permission(value) {
    this.$store.dispatch('user/permission', value);
  }
  get permission() {
    return this.$store.getters['user/permission'];
  }

  logout() {
    super.logout();
    this.$store.dispatch('logout');
  }

  set clusterList(value) {
    this.$store.dispatch('app/clusterList', value);
  }
  get clusterList() {
    return this.$store.getters['app/clusterList'];
  }

  setClusterList(clusterList) {
    this.clusterList = clusterList;
  }
  getClusterList() {
    return this.clusterList;
  }
  getClusterById(clusterId) {
    var cluster = null;
    this.clusterList.some(it => {
      if (clusterId === it['id']) {
        cluster = it;
      }
      return cluster;
    });
    if (!cluster) {
      console.log(`error: cluster not found`);
      // console.log(clusterId);
      // console.log(this.clusterList);
    }
    return cluster;
  }

  setMiddlewareList(clusterId, middlewareList) {
    var cluster = this.getClusterById(clusterId);
    if (cluster) {
      cluster['middlewareList'] = middlewareList;
    }
  }
  getMiddlewareList(clusterId) {
    var middlewareList = null;
    var cluster = this.getClusterById(clusterId);
    if (cluster) {
      middlewareList = cluster['middlewareList'];
    }
    return middlewareList;
  }
  getMiddlewareById(clusterId, middlewareId) {
    var middleware = null;
    var middlewareList = this.getMiddlewareList(clusterId);
    if (middlewareList) {
      middlewareList.some(it => {
        if (middlewareId === it['id']) {
          middleware = it;
        }
        return middleware;
      });
    }
    if (!middleware) {
      console.log(`error: middleware not found`);
    }
    return middleware;
  }

  setMiddlewareVersionList(clusterId, middlewareId, middlewareVersionList) {
    var middleware = this.getMiddlewareById(clusterId, middlewareId);
    if (middleware) {
      middleware.versionList = middlewareVersionList;
    }
  }
  getMiddlewareVersionList(clusterId, middlewareId) {
    var versionList = [];
    var middleware = this.getMiddlewareById(clusterId, middlewareId);
    if (middleware && Array.isArray(middleware['versionList'])) {
      versionList = middleware['versionList'];
    }
    if (versionList.length === 0) {
      console.log(`error: length of versionList is 0`);
    }
    return versionList;
  }
}

export default StoreHelper;