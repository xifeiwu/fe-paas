const state = {
    dirSelected: null,
    dirFilter: '',
    remoteConfigList: require('./mock/remote-config-list.json').data,
    configFiles: require('./mock/file-list.json').applicationRemoteConfigFiles,
    branchList: require('./mock/branch.json')
}

const actions = {
    
}

const mutations = {
    SET_DIR_SELECTED(state, payload) {
        state.dirFilter = payload
    }
}
export default {
    namespaced: true,
    state,
    actions,
    mutations
}