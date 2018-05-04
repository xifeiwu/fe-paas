/**
 * Created by xifei.wu on 2017/12/4.
 */
import NetData from '../../net/net';
const USE_LOCAL_STORAGE = false;
const debug = browserDebug('pass-fe:net');

const warning = function(prop, where) {
  debug(`warning: get user/${prop} from ${where}`);
};
const stateHasUpdated = function(prop) {
  let hasUpdated = false;
  if ('object' === typeof(prop) && Object.keys(prop).length > 0) {
    hasUpdated = true;
  } else if (Array.isArray(prop) && prop.length > 0) {
    hasUpdated = true;
  }
  return hasUpdated;
}

/**
 * used in getter:
 * 1. if the prop in state has not null, return state.prop
 * 2. else get from localStorage, and assign the value to state.prop
 */
//, 'appInfoListOfGroup', 'usersInGroup'
var LOCAL_PROP = ['profileListOfGroup', 'config', 'info', 'menuList', 'groupList', 'groupInfo'];
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
  } else if(USE_LOCAL_STORAGE) {
    result = getLocalValue();
  } else if (LOCAL_PROP.indexOf(prop) > -1) {
    result = getLocalValue();
  }
  return result;
}

/**
 * the property write to and read from localStorage by default, and refresh when the network data is arrived.
 * 1. config, save user config, such as selected appID in page service
 * 2. menuList, got from the response of login
 * 3. groupList, only refresh at the beginning of page profile.vue
 * 4. profileListOfGroup, only refresh at the beginning of page profile.vue
 *
 * the properties save on vuex
 * 3. appInfoListOfGroup, only refresh at the beginning of page profile.vue
 */
const state = {
  /* net data */
  // 用户配置相关信息
  config: null,
  // 用户相关信息
  info: null,

  // 侧边栏
  menuList: null,
  // 用户所属组列表
  groupList: null,
  // 当前组
  groupID: null,
  groupInfo: null,
  // 当前组的所有开发环境
  profileListOfGroup: null,
  // 当前做的所有APP列表
  appInfoListOfGroup: null,
  // 当前组所有用户
  usersInGroup: null,
};

const actions = {
  login({commit, state, dispatch}, res) {
    warning('login', 'netwrok');
    NetData.login(res).then((content) => {
      // commit('LOGIN', content);
      let menuList = content.permission;
      state.menuList = menuList;
      localStorage.setItem('user/menuList', JSON.stringify(menuList));
      let userInfo = content.user;
      if (userInfo) {
        if (userInfo.hasOwnProperty('username')) {
          dispatch('setInfo', {
            keys: 'userName',
            value: userInfo.username
          });
        }
        if (userInfo.hasOwnProperty('realName')) {
          dispatch('setInfo', {
            keys: 'realName',
            value: userInfo.realName
          });
        }
        if (userInfo.hasOwnProperty('role')) {
          dispatch('setInfo', {
            keys: 'role',
            value: userInfo.role
          });
        }
      }
    })
  },
  logout({commit, state, dispatch}) {
    state.info = null;
    state.config = null;
    state.menuList = null;
    state.groupInfo = null;
    state.groupList = null;
    state.profileListOfGroup = null;
    // remove menuList will have affect on UI
    // localStorage.removeItem('user/menuList');
    localStorage.removeItem('user/info');
    localStorage.removeItem('user/config');
    localStorage.removeItem('user/groupInfo');
    localStorage.removeItem('user/groupList');
    localStorage.removeItem('user/profileListOfGroup');
  },

  /**
   * 获取用户所属组列表
   */
  groupList({commit, state, dispatch}) {
    // if (0 === state.groupList.length) {
    warning('getGroupList', 'netwrok');
    NetData.getUserGroupList().then(content => {
      if (content.hasOwnProperty('groupList')) {
        commit('SET_GROUP_LIST', content.groupList);
        dispatch('groupInfo');
      }
    }).catch(err => {
      console.log(err);
      dispatch('groupInfo');
    });
    // }
  },
  /**
   * 更改用户组ID
   */
  groupID({commit, state, dispatch}, {from, value}) {
    state.groupID = value;
    // localStorage.setItem('groupID', value);
    dispatch('groupInfo');
    // dispatch('app/appInfoListOfGroup', {
    //   id: id
    // }, {root: true});
  },

  /**
   * groupInfo在groupID或groupList发生变化时会被调用。且groupID和groupList都初始化后，才会出发mutation。
   * 当初次进入页面时，groupID是空，只有groupList请求成功后才能初始化groupID
   * 有些逻辑必须在groupID和groupList都具备的情况下才能处理：
   * 1. appInfoListOfGroup
   */
  groupInfo({commit, state, dispatch}) {
    // action at the change of groupInfo
    const SET_GROUP_INFO = function({state, dispatch}, groupInfo) {
      state.groupInfo = groupInfo;
      if (groupInfo && groupInfo.hasOwnProperty('id')) {
        dispatch('profileListOfGroup', {
          id: groupInfo.id
        });
        dispatch('usersInGroup', {
          id: groupInfo.id
        });
        dispatch('appInfoListOfGroup', {
          groupID: groupInfo.id
        });
      }
      localStorage.setItem('user/groupInfo', JSON.stringify(groupInfo));
    };

    if (state.groupID) {
      if (state.groupList && Array.isArray(state.groupList)) {
        // id, list
        let target = null;
        state.groupList.some(it => {
          target = it.id === state.groupID ? it : null;
          return target
        });
        if (!target && state.groupList.length > 0) {
          state.groupID = state.groupList[0];
        }
        if (!state.groupInfo || state.groupInfo.id != state.groupID) {
          SET_GROUP_INFO({state, dispatch}, target);
        }
      } else {
        // id, not list
        SET_GROUP_INFO({state, dispatch}, {});
      }
    } else {
      if (state.groupList && Array.isArray(state.groupList) && state.groupList.length > 0) {
        // not id, list
        let target = state.groupList[0];
        SET_GROUP_INFO({state, dispatch}, target);
      } else {
        // not id, not list
        SET_GROUP_INFO({state, dispatch}, {});
      }
    }

  },

  /**
   * 获取当前组所有profile
   */
  profileListOfGroup({commit, state, dispatch}, options) {
    NetData.getProfileListOfGroup(options).then(content => {
      if (content.hasOwnProperty('spaceList')) {
        commit('SET_PROFILE_OF_GROUP', content.spaceList);
        // reload appInfoListOfGroup when the format of item is not correct
        // if (Array.isArray(state.appInfoListOfGroup)) {
        //   let existProfileList = true;
        //   state.appInfoListOfGroup.every(it => {
        //     existProfileList = it.hasOwnProperty('profileList');
        //     return existProfileList;
        //   });
        //   if (!existProfileList) {
        //     dispatch('appInfoListOfGroup', {
        //       groupID: options.id
        //     });
        //   }
        // } else {
        //   // dispatch('appInfoListOfGroup', {
        //   //   groupID: options.id
        //   // });
        // }
      }
    });
  },

  /**
   * 获取该groupID下的所有app, the case of triggering state action:
   * 1. at created of profile.vue
   * 2. at success callback of app/add.vue
   * 3. refresh button in page app.vue
   * @param commit
   * @param state
   * @param groupID
   */
  appInfoListOfGroup({commit, state}, {groupID, from}) {
    NetData.getAPPList({
      groupId: groupID,
      serviceName: ''
    }).then(content => {
      // console.log(content);
      // if (content.hasOwnProperty('appList')) {
        commit('SET_APP_INFO_LIST_OF_GROUP', content);
      // }
    }).catch(() => {});
  },

  usersInGroup({commit, state}, options) {
    NetData.getUsersInGroup(options).then(content => {
      if (content && content.hasOwnProperty('groupUserList')) {
        state.usersInGroup = content.groupUserList;
      }
    });
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
  // deleteAppInfoByID({commit, state}, appID) {
  //   let result = {
  //     exist: false,
  //     index: -1,
  //   }
  //   for (let index in state.appInfoListOfGroup.appList) {
  //     let item = state.appInfoListOfGroup.appList[index];
  //     if (item.appId == appID) {
  //       result.exist = true;
  //       result.index = index;
  //       break;
  //     }
  //   }
  //   if (result.exist) {
  //     state.appInfoListOfGroup.appList.splice(result.index, 1);
  //     state.appInfoListOfGroup.appModelList.splice(result.index, 1);
  //     state.appInfoListOfGroup.total -= 1;
  //   }
  // },
};

const mutations = {
  /* net state */
  // LOGIN(state, groupList) {
  //   state.menuList = groupList;
  //   localStorage.setItem('user/menuList', JSON.stringify(groupList));
  // },

  SET_GROUP_LIST(state, groupList) {
    state.groupList = groupList;
    // if (USE_LOCAL_STORAGE) {
      localStorage.setItem('user/groupList', JSON.stringify(groupList));
    // }
  },

  SET_PROFILE_OF_GROUP(state, profileList) {
    state.profileListOfGroup = profileList;
    if (LOCAL_PROP.indexOf('profileListOfGroup') > -1) {
      localStorage.setItem('user/profileListOfGroup', JSON.stringify(profileList));
    }
  },

  SET_APP_INFO_LIST_OF_GROUP(state, appList) {
    state.appInfoListOfGroup = appList;
    // if (USE_LOCAL_STORAGE) {
    //   localStorage.setItem('user/appInfoListOfGroup', JSON.stringify(appList));
    // }
  }
}

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
  'groupID': (state, getters) => {
    let groupID = state.groupID;
    if (null === groupID) {
      groupID = localStorage.getItem('groupID');
    }
    // if the groupID is null, set first element of groupList as default
    if (null === groupID && Array.isArray(state.groupList) && state.groupList.length > 0) {
      groupID = state.groupList[0].id
    }
    return parseInt(groupID);
  },
  'groupInfo': (state, getters) => {
    return getValue({state, getters}, 'groupInfo');
  },
  'groupList': (state, getters) => {
    return getValue({state, getters}, 'groupList');
  },
  'profileListOfGroup': (state, getters) => {
    return getValue({state, getters}, 'profileListOfGroup');
  },

  'appInfoListOfGroup': (state, getters) => {
    return getValue({state, getters}, 'appInfoListOfGroup');
  },
  'usersInGroup': (state, getters) => {
    return state.usersInGroup;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}