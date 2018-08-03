import axios from 'axios';
import {URL_LIST} from "../../net/url";

const state = {
  loading: false,
  domainSelected: null,
  domainFilter: '',
  domainList:  require('./mock/cdn-domains.json').domains,
}

const actions = {
  // 初始化数据
  initData({dispatch}) {
    dispatch('getDomainList');
  },
  // 获取域名列表
  getDomainList({commit}) {
    commit('SET_LOADING', true);
    axios.get('/api/cdn/domain/list')
      .then(res => {
        let domains = res.data.domains;
        const stateMap = {
          'processing': '处理中',
          'success': '成功',
          'offlined': '已停用',
          'failed': '失败',
          'frozen': '冻结'
        };
        domains.forEach(it => {
          if (stateMap.hasOwnProperty(it.operatingState)) {
            it.operatingStateDesc = stateMap[it.operatingState];
          }
        });
        commit('SET_DOMAIN_LIST', domains)
      })
      .finally(() => commit('SET_LOADING', false));
  },
}

const mutations = {
  SET_DOMAIN_FILTER(state, payload) {
    state.domainFilter = payload
  },
  SET_DIR_SELECTED(state, payload) {
    state.dirSelected = payload
  },
  SET_DOMAIN_LIST(state, payload) {
    state.domainList = payload
  },
  SET_LOADING(state, payload) {
    state.loading = payload
  }
}
export default {
  namespaced: true,
  state,
  actions,
  mutations
}