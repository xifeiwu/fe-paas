import axios from 'axios';
import NetBase from '$assets/js/net';

class Net extends NetBase {
  constructor() {
    super();
    this.$utils = null;
    this.$storeHelper = null;
    this.requestingState = {
      getAPPList: false,
    };
    const PAAS_URL_LIST = {
      // 获取用户所在组列表
      'app_status_list': {
        path: '/backstage',
        method: 'post'
      },
      // 获取团队的所有运行环境
      'profile_list_of_group': {
        path: '/space/querySpaceByGroupId',
        method: 'post'
      },
      // 获取验收人列表
      'users_list_of_group': {
        path: '/group/users',
        method: 'post'
      },
      // 获取cpu和memory的对应关系
      'cpu_and_memory_config': {
        path: '/cpuAndMemory/queryCpuAndMemory',
        method: 'get'
      },
      // 开发语言列表
      'language_list': {
        path: '/language/queryAllLanguage',
        method: 'get'
      },
      // 检测服务端口映射
      'service_port_map_check': {
        path: '/service/checkPortMapping',
        method: 'post'
      },
      // 更改实例数量
      'instance_change_count': {
        path: '/service/instances/update',
        method: 'post'
      },
      // 获取k8s实例状态
      'instance_status': {
        path: '/event/pod/info',
        method: 'post'
      },
      'domain_secure_check': {
        path: '/domain/record/status/update',
        method: 'post'
      },
      // 删除所有白名单
      'domain_delete_all_white_ip': {
        path: '/domain/whiteList/deleteOffice',
        method: 'delete'
      },
      // 添加办公网白名单
      'domain_add_office_ip_list': {
        path: '/domain/whiteList/addOffice',
        method: 'post'
      },
    };
    Object.keys(PAAS_URL_LIST).forEach(key => {
      let item = PAAS_URL_LIST[key];
      item.path = this.PAAS_PREFIX + item.path;
    });
    const CDN_URL_LIST = {
      'cdn_domain_create': {
        path: '/cdn/domain/create/{domain}',
        method: 'post'
      },
      'cdn_domain_offline': {
        path: '/cdn/domain/{domain}/offline',
        method: 'post'
      },
      'cdn_domain_online': {
        path: '/cdn/domain/{domain}/online',
        method: 'post'
      },
      'cdn_domain_delete': {
        path: '/cdn/domain/{domain}',
        method: 'delete'
      },
      'cdn_fusion_source_check': {
        path: '/cdn/fusion/domains/{domain}/source/check',
        method: 'post'
      },

      'dns_record_remove': {
        path: '/dns/record/remove',
        method: 'post'
      },
      'dns_record_info': {
        path: '/dns/record/info',
        method: 'post'
      }
    };
    Object.keys(CDN_URL_LIST).forEach(key => {
      let item = CDN_URL_LIST[key];
      item.path = this.CDN_PREFIX + item.path;
    });

    // extend URL_LIST from super
    if (this.URL_LIST) {
      this.URL_LIST = Object.assign(this.URL_LIST, PAAS_URL_LIST, CDN_URL_LIST);
    }
  }

  // called at config/vue
  setVue(Vue) {
    this.$storeHelper = Vue.prototype.$storeHelper;
    this.$utils = Vue.prototype.$utils;
  }
}

export default new Net();