export default {
  namespaced: true,
  state: {
    userGroupList: [],
  },
  actions: {
    setUserGroupList({state, commit}, groupList) {
      state.userGroupList = groupList;
    }
  },
  mutations: {
  },

  getters: {
    'userGroupList': (state, getters) => {
      return state.userGroupList;
    }
  }
}