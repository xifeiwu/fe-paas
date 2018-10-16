/**
 * Created by xifei.wu on 2017/12/4.
 */
import Vue from 'vue';
const debug = browserDebug('pass-fe:net');
import globalStore from 'assets/js/store';

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
  groupInfo: {},
  // 用户所属组列表
  groupList: [],
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
    instance: {},
    monitor: {}
  }
};

const actions = {
  clear({commit, state, dispatch}) {
    state.groupInfo = null;
    state.groupList = [];
  },

  /**
   * 获取用户所属组列表
   */
  async groupList({commit, state, dispatch}, groupList) {
    state.groupList = groupList;
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

  async usersInGroup({commit, state}) {
    const net = Vue.prototype.$net;
    const resContent = await net.requestPaasServer(net.URL_LIST.users_list_of_group, {
      payload: {
        id: state.groupId
      }
    });
    const usersInGroup = resContent['groupUserList'];
    state.usersInGroup = usersInGroup;
    return usersInGroup;
  },

  config({commit, state}, {page, data}) {
    commit('UPDATE_CONFIG', {page, data});
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
  async appInfoList({commit, state}, {groupId}) {
    if (!groupId) {
      return Promise.reject('groupId not found');
    }
    const net = Vue.prototype.$net;
    try {
      const resContent = await net.requestPaasServer(net.URL_LIST.app_list_by_group, {
        payload: {groupId: groupId}
      });
      state.appInfoListOfGroup = await net.parseAppList(resContent);
    } catch(err) {
      Vue.prototype.$notify.error({
        title: '获取应用列表失败，请联系管理员',
        message: err.message,
        duration: 8000
      });
    }
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
    globalStore.dispatch('user/setGroupInfo', target);
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