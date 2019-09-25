import axios from 'axios';
import NetBase from 'assets/js/net';

class Net extends NetBase {
  constructor() {
    super();
    this.$utils = null;
    this.$storeHelper = null;
    const PAAS_URL_LIST = {
      'profile_list_all': {
        path: '/backstage/querySpace',
        method: 'get'
      },
      // 获取用户所在组列表
      'app_status_list': {
        path: '/querybackstage',
        method: 'post'
      },
      'app_transfer': {
        path: '/application/updateGroup',
        method: 'post'
      },
      // 获取团队的所有运行环境
      'profile_list_of_group': {
        path: '/space/querySpaceByGroupId',
        method: 'post'
      },
      'group_list_all': {
        path: '/queryAllGroup',
        method: 'get'
      },
      'analyze_app_count': {
        path: '/backstage/queryAppCount',
        method: 'post'
      },
      'analyze_app_count_detail': {
        path: '/backstage/queryAppCountDetail',
        method: 'post'
      },
      'download_app_count_detail': {
        path: '/backstage/downloadAppCountXls',
        method: 'post'
      },
      // 应用部署次数列表
      'analyze_app_deploy_count_list': {
        path: '/backstage/queryDeploy',
        method: 'post'
      },
      // 应用部署次数详情
      'analyze_app_deploy_count_detail': {
        path: '/backstage/queryDetailDeploy',
        method: 'post'
      },
      // 下载应用部署次数列表
      'download_app_deploy_count': {
        path: '/backstage/downloadDeployCountXls',
        method: 'post'
      },
      // 资源使用率统计
      analyze_resources_list: {
        path: '/backstage/queryCpuAndMemoryTotal',
        method: 'post'
      },
      analyze_resources_list_download: {
        path: '/backstage/downloadCpuAndMemoryExcel',
        method: 'post'
      },
      analyze_resource_list_item_detail: {
        path: '/backstage/queryCpuAndMemoryDetail',
        method: 'post'
      },
      // 调用次数列表
      analyze_visit_list: {
        path: '/backstage/queryCallTotal',
        method: 'post'
      },
      // 下载调用次数列表
      analyze_visit_list_download: {
        path: '/backstage/downloadCallAmountXls',
        method: 'post'
      },
      // k8s群集
      query_k8s_cluster: {
        path: '/queryCluster',
        method: 'get'
      },
      query_k8s_cluster_detail: {
        path: '/queryClusterDetail',
        method: 'post'
      },
      // node列表
      query_node_list: {
        path: '/queryAllNode',
        method: 'get'
      },
      query_node_resource: {
        path: '/queryNodeResouceUsage',
        method: 'post'
      },
      update_node_taint: {
        path: '/updateNodeSpec',
        partial: true,
        method: 'post'
      },
      get_node_taint: {
        path: '/getNodeSpec',
        partial: true,
        method: 'post'
      },
      // 调用次数详情
      analyze_visit_list_item_detail: {
        path: '/backstage/queryCallDetail',
        method: 'post'
      },

      /** 站内信 */
      // 信息列表
      message_list: {
        path: '/message/query/all/list',
        method: 'get'
      },
      // 信息类型列表
      message_type_list: {
        path: '/message/query/all/type',
        method: 'get'
      },
      message_create: {
        path: '/message/add',
        method: 'post'
      },
      message_modify: {
        path: '/message/modify',
        method: 'post'
      },
      message_change_status: {
        path: '/message/update/release/status/{messageId}',
        method: 'post'
      },

      /** 用户反馈*/
      feedback_list: {
        path: '/suggestion/list',
        method: 'post'
      },
      // 得到feedback中的图片
      'feedback_get_picture': {
        path: '/suggestion/{feedbackId}/picture',
        method: 'get'
      }
    };
    Object.keys(PAAS_URL_LIST).forEach(key => {
      let item = PAAS_URL_LIST[key];
      item.path = this.PAAS_PREFIX + item.path;
    });

    // extend URL_LIST from super
    if (this.URL_LIST) {
      this.URL_LIST = Object.assign(this.URL_LIST, PAAS_URL_LIST);
    }

  }

  // called at config/vue
  setVue(Vue) {
    this.$storeHelper = Vue.prototype.$storeHelper;
    this.$utils = Vue.prototype.$utils;
  }
}

export default new Net();