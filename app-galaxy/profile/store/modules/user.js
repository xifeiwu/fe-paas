/**
 * Created by xifei.wu on 2017/12/4.
 */
import Vue from 'vue';
const debug = browserDebug('pass-fe:net');


/**
 * the property write to and read from localStorage by default, and refresh when the network data is arrived.
 * 1. config. save user config, such as selected appID in page service
 * 2. menuList. got from the response of login
 * 3. groupList. only refresh at the beginning of page profile.vue
 * 4. profileListOfGroup. only refresh at the beginning of page profile.vue
 *
 * the properties save on vuex
 * 3. appInfoListOfGroup. only refresh at the beginning of page profile.vue
 */
const state = {
  /* net data */
  groupInfo: null,
  // 用户所属组列表
  groupList: null,
  lobInfo: null,
  // 当前组
  groupId: null,
  // 当前组的所有开发环境
  profileListOfGroup: null,
  // 当前组所有用户
  usersInGroup: null,
  // 当前做的所有APP列表
  appInfoListOfGroup: null,
  config: {
    service: {},
    instance: {}
  }
};

const actions = {
  logout({commit, state, dispatch}) {
    // state.menuList = null;
    state.groupInfo = null;
    state.groupList = null;
    state.profileListOfGroup = null;
    // remove menuList will have affect on UI
    // localStorage.removeItem('user/menuList');
    localStorage.removeItem('user/groupInfo');
    localStorage.removeItem('user/groupList');
    localStorage.removeItem('user/profileListOfGroup');
    dispatch('global/clearOnLogout', {}, {root: true});
  },

  /**
   * 获取用户所属组列表
   */
  async groupList({commit, state, dispatch}, groupList) {
    const net = Vue.prototype.$net;
    const resContent = await net.requestPaasServer(net.URL_LIST.user_group_list);
    state.groupList = resContent.groupList.map(it => {
      let lobName = '';
      if (it.hasOwnProperty('lobName') && it.lobName && it.lobName.length > 0) {
        lobName = '（' + it['lobName'] + '）';
      }
      it.asLabel = it.name;
      // it.asLabel = it.name + lobName;
      return it;
    });
    commit('SET_GROUP_INFO');
    return state.groupList;
  },

  /**
   * 获取所有scrum列表
   */
  lobInfo({commit, state, dispatch}, lobInfo) {
    state.lobInfo = lobInfo;
  },
  /**
   * 更改用户组ID
   */
  groupId({commit, state, dispatch}, value) {
    state.groupId = value;
    commit('SET_GROUP_INFO');
  },

  profileList({commit, state, dispatch}, profileList) {
    commit('SET_PROFILE_LIST', profileList);
  },

  usersInGroup({commit, state}) {
    const net = Vue.prototype.$net;
    if (!state.usersInGroup) {
      net.requestPaasServer(net.URL_LIST.users_list_of_group, {
        payload: {
          id: state.groupId
        }
      }).then(resContent => {
        state.usersInGroup = resContent['groupUserList'];
      }).catch(() => {});
    }
  },

  config({commit, state}, {page, data}) {
    commit('UPDATE_CONFIG', {page, data});
  },

  appInfoList({commit, state}, infoList) {
    state.appInfoListOfGroup = infoList;
  },

  /**
   * 获取该groupId下的所有app, the case of triggering state action:
   * 1. at created of profile.vue
   * 2. at success callback of app/add.vue
   * 3. refresh button in page app.vue
   * @param commit
   * @param state
   * @param groupId
   */
  async appInfoListOfGroup({commit, state}, {groupId}) {
    if (!groupId) {
      return;
    }
    state.appInfoListOfGroup = await Vue.prototype.$net.getAPPList({
      groupId: groupId,
    });
    return state.appInfoListOfGroup;
  },
};

const mutations = {
  /* net state */
  SET_GROUP_INFO(state) {
    let target = null;
    if (state.groupId) {
      if (state.groupList && Array.isArray(state.groupList)) {
        state.groupList.some(it => {
          target = it.id === state.groupId ? it : null;
          return target
        });
        if (!target && state.groupList.length > 0) {
          target = state.groupList[0];
        }
      } else {
      }
    } else {
      if (state.groupList && Array.isArray(state.groupList) && state.groupList.length > 0) {
        target = state.groupList[0];
      } else {
      }
    }
    state.groupInfo = target;
    if (!state.groupId && state.groupInfo) {
      state.groupId = state.groupInfo['id'];
    }
  },

  SET_PROFILE_LIST(state, profileList) {
    state.profileListOfGroup = profileList;
  },

  SET_APP_INFO_LIST_OF_GROUP(state, appList) {
  },

  UPDATE_CONFIG(state, {page, data}) {
    const config = state.config;
    if (!config.hasOwnProperty(page)) {
      console.log(`not found page ${page}`);
      return;
    }
    if (!config[page]) {
      config[page] = {};
    }
    for (let key in data) {
      Vue.set(config[page], key, data[key]);
    }
  }
};

const getters = {
  'groupId': (state, getters) => {
    let groupId = state.groupId;
    if (null === groupId) {
      if (state.groupInfo) {
        groupId = state.groupInfo['id'];
      } else if (state.groupList && state.groupList.length > 0) {
        groupId = state.groupList[0].id
      }
    }
    return parseInt(groupId);
  },
  'lobInfo': (state, getters) => {
    return state.lobInfo;
  },
  'groupInfo': (state, getters) => {
    return state.groupInfo;
  },
  'groupList': (state, getters) => {
    return state.groupList;
  },
  'profileListOfGroup': (state, getters) => {
    return state.profileListOfGroup;
  },

  'appInfoListOfGroup': (state, getters) => {
    return state.appInfoListOfGroup;
  },
  'usersInGroup': (state, getters) => {
    return state.usersInGroup;
  },
  'config': (state, getters) => {
    return state.config;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}