import NetData from '../../net/net';
import axios from 'axios';
import {URL_LIST} from "../../net/url";

const state = {
  loading: true,
  dirSelected: null,
  dirFilter: '',
  remoteConfigList: null, //require('./mock/remote-config-list.json').data,
  configFiles: null, //require('./mock/file-list.json').applicationRemoteConfigFiles,
  branchList: null, //require('./mock/branch.json')
}

const actions = {
  // 初始化数据
  initData({dispatch}) {
    dispatch('getDir');
    dispatch('getBranch');
  },
  // 获取目录列表
  getDir({commit}) {
    commit('SET_LOADING', true);
    axios.post(URL_LIST.config_server_list.url + '?groupId=', {})
      .then(res => {
        commit('SET_REMOTE_CONFIG_LIST', res.data),
        commit('SET_LOADING', false);
      });
  },
  // 获取分支
  getBranch({commit}) {
    axios.post(URL_LIST.config_server_branch.url, {})
      .then(res => {
        commit('SET_BRANCH_LIST', res.data)
      })
  },
  // 添加目录
  addDir({commit, dispatch}, payload) {
    axios.post(URL_LIST.config_server_add.url, payload)
      .then(res => dispatch('getDir'))
  },
  // 文件列表
  getFiles({commit, dispatch}, payload) {
    axios.post(URL_LIST.config_server_file_list.url + '?applicationRemoteConfigId=' + payload)
      .then(res => commit('SET_CONFIG_FILES', res.data))
  },
  // 添加文件
  addFile({commit, dispatch, state}, payload) {
    axios.post(URL_LIST.config_server_file_add.url, payload)
      .then(res => {dispatch('getFiles', state.dirSelected.id)})
  }
}

const mutations = {
  SET_DIR_FILTER(state, payload) {
    state.dirFilter = payload
  },
  SET_DIR_SELECTED(state, payload) {
    state.dirSelected = payload
  },
  SET_REMOTE_CONFIG_LIST(state, payload) {
    state.remoteConfigList = payload.content.data;
  },
  SET_BRANCH_LIST(state, payload) {
    state.branchList = payload.content
  },
  SET_LOADING(state, payload) {
    state.loading = payload
  },
  SET_CONFIG_FILES(state, payload) {
    state.configFiles = payload.content
  }
}
export default {
  namespaced: true,
  state,
  actions,
  mutations
}