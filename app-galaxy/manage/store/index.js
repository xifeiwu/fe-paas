import Vue from 'vue';
import Vuex from 'vuex';
import Net from '../net';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    scrumList: [],
    groupListAll: [],
    profileListAll: [],
    config: {},
    screen: {
      width: 0,
      height: 0,
      size: 0,
      ratioHeight: 0
    },
    currentLobId: '',
    scrumListByLobId: [],
    currentScrumId: '',
    lobList: [],
  },
  actions: {
    setScreenSize({state, commit}, {width, height}) {
      state.screen.width = width;
      state.screen.height = height;
      try {
        state.screen.ratioHeight = height / window.devicePixelRatio;
      } catch(err) {
        state.screen.ratioHeight = 500
      }
      state.screen.size = width * height;
    },
    lobList({ commit, state }, lobList) {
      state.lobList = lobList;
    },
    scrumList({ commit, state }, scrumList) {
      state.scrumList = scrumList;
    },
    groupListAll({commit, state }, groupListAll) {
      state.groupListAll = groupListAll;
    },
    profileListAll({commit, state }, profileListAll) {
      state.profileListAll = profileListAll;
    },
    setConfig({commit}, config) {
      commit('SET_CONFIG', config)
    },
    SET_CONFIG(state, config) {
      if (!state.config) {
        state.config = {};
      }
      for (let key in config) {
        // localStorage will not update if code run in the following way
        Vue.set(state.config, key, config[key]);
      }
    },
    async currentLobId({state}, lobId) {
      try {
        const resContent = await Net.requestPaasServer(Net.URL_LIST.get_scrum_list_by_lob, {
          query: {
            lobId
          }
        });
        var scrumList = resContent['scrumList'];
        // update currentScrumId when currentScrum is not '全部'
        if ('' !== state.currentScrumId) {
          state.currentScrumId = scrumList.map(it => it.id).indexOf(state.currentScrumId) > -1 ? state.currentScrumId : scrumList[0]['id'];
        }
        state.scrumListByLobId = scrumList;
        state.currentLobId = lobId;
      } catch (err) {
        console.log(err);
      }
    },
  },
  mutations: {
    toastPush(state, payload) {
      state.toasts.push(payload)
    },
    toastPop(state) {
      state.toasts.splice(0, 1)
    },
    SET_CONFIG(state, config) {
      if (!state.config) {
        state.config = {};
      }
      for (let key in config) {
        // localStorage will not update if code run in the following way
        Vue.set(state.config, key, config[key]);
      }
    }
  },

  getters: {
    'screen': (state, getters) => {
      return state.screen;
    },
    'lobList': (state, getters) => {
      return state.lobList;
    },
    'scrumList': (state, getters) => {
      return state.scrumList;
    },
    'groupListAll': (state, getters) => {
      return state.groupListAll;
    },
    'profileListAll': (state, getters) => {
      return state.profileListAll;
    },
    'collapseMenu': (state, getters) => {
      if (!state.config) {
        state.config = {}
      }
      return state.config.collapseMenu;
    },
    navMenuWidth(state, getters) {
      if (state.config.collapseMenu) {
        return 56;
      } else {
        return 180;
      }
    },
    currentScrumList(state, getters) {
      var scrumList = [];
      // currentLobId '' stands for '全部'
      if ('' === state.currentLobId) {
        scrumList = state.scrumList;
      } else {
        scrumList = state.scrumListByLobId;
      }
      return scrumList;
    }
  },

  // modules:{
  //   user, app, tmp, global, etc, cdn
  // },
  plugins: [createPersistedState({
    key: 'manage',
    // 暂时只持久化 etc 模块，防止冲突
    paths: ['config'],
  })]
})
