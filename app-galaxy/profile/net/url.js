/**
 * Created by xifei.wu on 2017/11/30.
 */
import BaseURL from 'assets/js/url';

class URL extends BaseURL {
  constructor() {
    super();
    this.setUrlList();
  }

  setUrlList() {
    let API_PATH = this.API_PATH;
    this.URL_LIST = {
      'page_terminal_path': 'http://' + window.location.host + '/terminal.html',

      'highlight.js': '/assets/libs/highlight/highlight.pack.js',
      'highlight.css': '/assets/libs/highlight/styles/vs2015.css',

      // 获取验证码
      'get_verify_code': {
        url: API_PATH + '/createRandomImage',
        path: '/createRandomImage',
        method: 'get'
      },
      'login': {
        url: API_PATH + '/login',
        path: '/login',
        method: 'post'
      },
      // 获取Scrum列表
      'get_scrum_list': {
        url: API_PATH + '/group/getScrumList',
        path: '/group/getScrumList',
        method: 'get'
      },
      // 获取line of business列表
      'get_lob_list': {
        url: API_PATH + '/group/queryLobList',
        path: '/group/queryLobList',
        method: 'get'
      },

      // 获取团队成员
      'users_in_group': {
          url: API_PATH + '/group/users',
          path: '/group/users',
          method: 'post'
      },
      /** 全局相关 */
      // 获取所有用户列表
      'users_all': {
        url: API_PATH + '/user/queryUserList',
        path: '/user/queryUserList',
        method: 'get'
      },
      // 获取所有组列表
      'get_all_group_list': {
        url: API_PATH + '/group/queryAllGroup',
        path: '/group/queryAllGroup',
        method: 'get'
      },

      /** 应用相关 */
      // 创建应用
      // 修改应用名称
      'app_change_name': {
        url: API_PATH + '/application/updateAppName',
        path: '/application/updateAppName',
        method: 'post'
      },
      // 修改运行环境
      'app_change_profile': {
        url: API_PATH + '/application/update',
        path: '/application/update',
        method: 'post'
      },

      /** 服务相关 */
      // 修改默认服务
      'service_change_default': {
        url: API_PATH + '/service/switchService',
        path: '/service/switchService',
        method: 'post'
      },
      // 获取服务版本
      'service_version': {
        url: API_PATH + '/service/queryApplicationServiceVersion',
        path: '/service/queryApplicationServiceVersion',
        method: 'post'
      },
      // 部署服务-部署日志
      'service_get_deploy_log': {
        url: API_PATH + '/service/deploy/log',
        path: '/service/deploy/log',
        method: 'post'
      },
      // TODO: not used
      // 自定义镜像-环境镜像
      'custom_image_env_list': {
        url: API_PATH + '/image/queryEnvImageByEnvAndGroupTagAndApplicationId',
        path: '/image/queryEnvImageByEnvAndGroupTagAndApplicationId'
      },
      // TODO: not used
      // 自定义镜像-私有镜像-项目列表
      'custom_image_private_app_list': {
        url: API_PATH + '/image/queryProjectNameByGroupTag',
        path: '/image/queryProjectNameByGroupTag'
      },
      // TODO: not used
      // 自定义镜像-私有镜像-项目-版本列表
      'custom_image_private_version_list_of_app': {
        url: API_PATH + '/image/queryCustomImage',
        path: '/image/queryCustomImage'
      },

      /** 实例相关*/
      // 获取实例列表
      // 'instance_list':

      /** 域名相关 */
      // 获取一级域名
      'domain_level_1_list': {
        url: API_PATH + '/domain/queryBySpaceId',
        path: '/domain/queryBySpaceId'
      },
      // 添加域名
      'domain_add': {
        url: API_PATH + '/domain/record/apply',
        path: '/domain/record/apply'
      },
      // 删除域名
      'domain_remove': {
        url: API_PATH + '/domain/record/delete',
        path: '/domain/record/delete'
      },
      // 绑定服务
      'domain_bind_service': {
        url: API_PATH + '/domain/bind',
        path: '/domain/bind'
      },
      // 解绑服务
      'domain_unbind_service': {
        url: API_PATH + '/domain/unbind',
        path: '/domain/unbind'
      },
      // 添加白名单
      'domain_add_white_ip': {
        url: API_PATH + '/domain/whiteList/add',
        path: '/domain/whiteList/add'
      },
      // 删除白名单
      'domain_delete_white_ip': {
        url: API_PATH + '/domain/whiteList/',
        path: '/domain/whiteList/'
      },
      // 下载白名单模板（从java服务器）
      'domain_download_white_ip_list_template': {
        url: API_PATH + '/domain/whiteList/download/template',
        path: '/domain/whiteList/download/template'
      },
      // 下载白名单模板
      'domain_download_white_ip_list_template': {
        url: '/assets/files/ip白名单模板.xlsx',
        path: '/assets/files/ip白名单模板.xlsx'
      },
      // 上传白名单模板
      'domain_upload_white_ip_list_template': {
        url: API_PATH + '/domain/whiteList/upload/template',
        path: '/domain/whiteList/upload/template'
      },

      // 获取运行日志
      'log_run_log': {
        url: API_PATH + '/searchLog',
        path: '/searchLog'
      },
      // 获取部署历史日志
      'log_deploy_log': {
        url: API_PATH + '/service/historylog',
        path: '/service/historylog'
      },

      /** oauth相关 */
      // access key
      'oauth_get_target_group_list': {
        url: API_PATH + '/application/authorization/targetGroups',
        path: '/application/authorization/targetGroups'
      },
      'oauth_access_key_list_by_app': {
        url: API_PATH + '/application/authorization/queryByAppId',
        path: '/application/authorization/queryByAppId'
      },
      // 修改秘钥
      'oauth_update_secret': {
        url: API_PATH + '/application/authorization/{id}',
        path: '/application/authorization/{id}',
        method: 'patch'
      },
      // 删除Access Key
      'oauth_delete_access_key': {
        url: API_PATH + '/application/authorization/{id}',
        path: '/application/authorization/{id}',
        method: 'delete'
      },
      // 添加访问配置
      'oauth_add_access_config': {
        url: API_PATH + '/application/authorization/{id}',
        path: '/application/authorization/{id}',
        method: 'put'
      },
      // 获取AccessKey的所有授权URL
      'oauth_get_url_permission_list': {
        url: API_PATH + '/application/authorization/{id}/oauth',
        path: '/application/authorization/{id}/oauth',
        method: 'get'
      },
      // 授权url
      'oauth_get_authorize_url_list': {
        url: API_PATH + '/application/authorization/record/query',
        path: '/application/authorization/record/query'
      },
      'oauth_get_target_app_list': {
        url: API_PATH + '/application/authorization/targetGroup/{id}/requestClientId',
        path: '/application/authorization/targetGroup/{id}/requestClientId'
      },
      // 修改授权URL
      'oauth_modify_authorize_url_list': {
        url: API_PATH + '/application/authorization/record/{id}/auth',
        path: '/application/authorization/record/{id}/auth',
        method: 'put',
      },
      // 添加权限
      'oauth_add_url_permission': {
        url: API_PATH + '/application/authorization/oauth/create',
        method: 'post'
      },
      // 删除权限
      'oauth_remove_url_permission': {
        url: API_PATH + '/application/authorization/oauth/{id}/delete ',
        method: 'delete'
      },
      // 禁用/开启授权URL配置
      'oauth_authorize_url_toggle_enable': {
        url: API_PATH + '/application/authorization/record/{id}/enableOrDisable',
        path: '/application/authorization/record/{id}/enableOrDisable',
        method: 'patch'
      },
      /** 工单相关 */
      // 是否有未处理工单
      'work_order_in_handling': {
        url: API_PATH + '/workOrderDeploy/validNoEndWorkOrderDeployByAppId',
        path: '/workOrderDeploy/validNoEndWorkOrderDeployByAppId'
      },
      // 工单详情
      // 工单详情-功能列表
      'work_order_detail_feature_list': {
        url: API_PATH + '/workOrderDeployFunction/getWorkOrderDeployFunctions',
        path: '/workOrderDeployFunction/getWorkOrderDeployFunctions'
      },
      // 工单详情-程序列表
      'work_order_detail_app_list': {
        url: API_PATH + '/workOrderDeployApp/getWorkOrderDeployApp',
        path: '/workOrderDeployApp/getWorkOrderDeployApp'
      },
      // 工单详情-待办人
      'work_order_detail_user_todo': {
        url: API_PATH + '/workOrderDeploy/queryWorkOrderDeployToDoUser',
        path: '/workOrderDeploy/queryWorkOrderDeployToDoUser'
      },
      // 工单详情-验收人
      'work_order_detail_user_accepted': {
        url: API_PATH + '/acceptanceUser/getWorkOrderDeployAcceptUser',
        path: '/acceptanceUser/getWorkOrderDeployAcceptUser'
      },
      // 工单详情-知会人
      'work_order_detail_notify_user': {
        url: API_PATH + '/informUser/getWorkOrderDeployInformUser',
        path: '/informUser/getWorkOrderDeployInformUser'
      },
      // 工单详情-操作记录
      'work_order_detail_operation_list': {
        url: API_PATH + '/workOrderDeployLog/getWorkOrderDeployLog',
        path: '/workOrderDeployLog/getWorkOrderDeployLog'
      },
      // 工单详情-邮件组
      'work_order_detail_email_group': {
        url: API_PATH + '/emailGroup/getWorkOrderDeployEmailGroup',
        path: '/emailGroup/getWorkOrderDeployEmailGroup'
      },
      // 测试日志
      'work_order_detail_test_log_list': {
        url: API_PATH + '/workOrderDeploy/queryWorkOrderDeployTestReport',
        path: '/workOrderDeploy/queryWorkOrderDeployTestReport'
      },
      // 下载测试日志
      'work_order_detail_download_test_log_post': {
        url: API_PATH + '/workOrderDeploy/downloadTestReport',
        path: '/workOrderDeploy/downloadTestReport'
      },
      // 删除测试日志
      'work_order_delete_test_log': {
        url: API_PATH + '/workOrderDeploy/deleteTestReport/{id}',
        path: '/workOrderDeploy/deleteTestReport/{id}'
      },

      /** 处理工单 */
      // 点击处理前的判断逻辑
      'check_before_handle_work_order': {
        url: API_PATH + '/workOrderDeploy/validWorkOrderDeployHandleUser',
        path: '/workOrderDeploy/validWorkOrderDeployHandleUser'
      },
      // 上传测试报告
      'work_order_handle_upload_test_report': {
        url: API_PATH + '/workOrderDeploy/uploadFile',
        path: '/workOrderDeploy/uploadFile'
      },
      // 处理完成
      'work_order_submit_handle': {
        url: API_PATH + '/workOrderDeploy/handleWorkOrderDeploy',
        path: '/workOrderDeploy/handleWorkOrderDeploy'
      },
      // 部署应用-获取日志
      'work_order_fetch_deploy_log': {
        url: API_PATH + '/workOrderDeploy/searchDeployLog',
        path: '/workOrderDeploy/searchDeployLog'
      },

      // 远程配置中心——文件列表 eg. remote-config/get?applicationRemoteConfigId=111
      'config_server_get': {
        url: API_PATH + '/remote-config/get',
        path: 'remote-config/get',
        method: 'post',
      },
      //通过lob获取scrum列表
      'get_scrum_list_by_lob': {
        url:API_PATH + '/queryScrumByLobId',
        path:'/queryScrumByLobId',
        method:'get',
      },
      /**镜像中心相关*/
      //获取镜像仓库列表
      'get_image_repository_by_group': {
        url:API_PATH + '/image/queryRepositoryByGroupTag',
        path: '/image/queryRepositoryByGroupTag',
        method:'post',
      },
      //搜索镜像仓库
      'search_image_repository': {
        url:API_PATH + '/image/searchRepositoryByGroupTag',
        path:'/image/searchRepositoryByGroupTag',
        method:'post',
      }
    };
  }

  getUrlList() {
    return this.URL_LIST;
  }
}
let url = new URL();
const URL_LIST = url.getUrlList();

export {
  URL_LIST
}