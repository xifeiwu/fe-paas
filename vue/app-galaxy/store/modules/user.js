/**
 * Created by xifei.wu on 2017/12/4.
 */

const state = {
  user:[{
    username: '11',
    password: '11'
  },{
    username: '啊a',
    password: '啊啊'
  },{
    username: '啊b',
    password: '啊啊'
  },{
    username: '啊c',
    password: '啊啊'
  }],
  seccLogin: 0,
  menu_list: []
};


const actions = {
  login ({commit},user) {
    commit('LOGIN',user)
  }
};

const mutations = {
  LOGIN(state, res){
    function updateItem(item) {
      let keyMap = {
        "应用管理": {
          router: '/profile/app_manager'
        },
        "审批管理": {
          router: '/profile/approve_manager'
        },
        "服务管理": {
          router: '/profile/service_manager'
        },
        "实例列表": {
          router: '/profile/instance_list'
        },
        "外网域名": {
          router: '/profile/domain_name'
        },
        "日志中心": {
          router: '/profile/log_center'
        },
        "应用监控": {
          router: '/profile/app_monitor'
        },
        "Oauth权限": {
          router: '/profile/oauth_privilege'
        },
        "应用管理": {
          router: '/profile/app_manager'
        },
        "应用管理": {
          router: '/profile/app_manager'
        },
      }
      let key = it.name;
      if (keyMap.hasOwnProperty(key)) {
        it.router = keyMap[key].router;
      }
      return item;
    }
    let results = []
    let permission = res.permission;
    permission.forEach(it => {
      // if (0 === it.parentId) {
        results.push(updateItem(it));
      // }
    });
    state.menu_list = results;
    // state.user.forEach(function(eee) {
    //   if(eee.username === res.username){
    //     if(eee.password === res.password){
    //       state.seccLogin = 1
    //     }
    //   }
    // }, this);
  }
}

export default {
  state,
  actions,
  mutations
}