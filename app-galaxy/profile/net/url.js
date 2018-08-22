/**
 * Created by xifei.wu on 2017/11/30.
 */
import BaseURL from '$assets/js/url';

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

      // permission与url的对应关系
      'permission_url_map': {
        url: API_PATH + '/permissionUrlMappings',
        path: '/permissionUrlMappings',
        method: 'post'
      },
      // 当前用户禁用的权限
      'user_not_permitted': {
        url: API_PATH + '/user/roles/permissions?exclude=true',
        path: '/user/roles/permissions?exclude=true',
        method: 'get'
      },
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
      // 应用列表
      'app_list': {
        url: API_PATH + '/application/queryByPage',
        path: '/application/queryByPage',
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
      'app_create': {
      },
      // 删除应用
      'app_delete': {
        url: API_PATH + '/application/delete',
        path: '/application/delete',
        method: 'post'
      },
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
      // 部署服务-开始部署
      'service_deploy': {
        url: API_PATH + '/service/deployApplicationService',
        path: '/service/deployApplicationService',
        method: 'post'
      },
      // 部署服务-部署日志
      'service_get_deploy_log': {
        url: API_PATH + '/service/deploy/log',
        path: '/service/deploy/log',
        method: 'post'
      },
      // 创建服务
      'service_create': {
        url: API_PATH + '/service/createApplicationService',
        path: '/service/createApplicationService',
        method: 'post'
      },
      // 删除服务
      'service_delete': {
        url: API_PATH + '/service/deleteApplicationService',
        path: '/service/deleteApplicationService',
        method: 'post'
      },
      // 停止服务
      'service_stop': {
        url: API_PATH + '/service/stopApplicationService',
        path: '/service/stopApplicationService'
      },
      // 获取自动打镜像类型列表
      'auto_image_list': {
        url: API_PATH + '/image/queryBasicImage',
        path: '/image/queryBasicImage'
      },
      // 自定义镜像-环境镜像
      'custom_image_env_list': {
        url: API_PATH + '/image/queryEnvImageByEnvAndGroupTagAndApplicationId',
        path: '/image/queryEnvImageByEnvAndGroupTagAndApplicationId'
      },
      // 自定义镜像-私有镜像-项目列表
      'custom_image_private_app_list': {
        url: API_PATH + '/image/queryProjectNameByGroupTag',
        path: '/image/queryProjectNameByGroupTag'
      },
      // 自定义镜像-私有镜像-项目-版本列表
      'custom_image_private_version_list_of_app': {
        url: API_PATH + '/image/queryCustomImage',
        path: '/image/queryCustomImage'
      },

      // 更改健康检查
      'service_update_health': {
        url: API_PATH + '/service/updateHealth',
        path: '/service/updateHealth'
      },
      // 更改镜像方式
      'service_update_image': {
        url: API_PATH + '/service/updateImage',
        path: '/service/updateImage'
      },
      // 更改gitLabAddress
      'service_update_gitLab_address': {
        url: API_PATH + '/service/updateGitLabSsh',
        path: '/service/updateGitLabSsh'
      },
      // 更改gitLabBranch
      'service_update_relative_path': {
        url: API_PATH + '/service/updateRelativePath',
        path: '/service/updateRelativePath'
      },
      // 更改gitLabBranch
      'service_update_gitLab_branch': {
        url: API_PATH + '/service/updateRelativePath',
        path: '/service/updateGitLabBranch'
      },
      // 更改relativePath
      'service_update_relative_path': {
        url: API_PATH + '/service/updateRelativePath',
        path: '/service/updateRelativePath'
      },
      // 更改maven profile id
      'service_update_maven_profile_id': {
        url: API_PATH + '/service/updateMavenProfileId',
        path: '/service/updateMavenProfileId'
      },
      // 更改CPU和Memory
      'service_update_cpu_and_memory': {
        url: API_PATH + '/service/updateCpuAndMemory',
        path: '/service/updateCpuAndMemory'
      },
      // 更改滚动升级
      'service_update_rolling_update': {
        url: API_PATH + '/service/updateRollingUpdate',
        path: ''
      },
      // 更改负载均衡
      'service_update_load_balance': {
        url: API_PATH + '/service/updateLoadBalance',
        path: ''
      },
      // 更改文件存储
      'service_update_file_location': {
        url: API_PATH + '/service/updateVolume',
        path: '/service/updateVolume'
      },
      // 更改环境变量
      'service_update_environment': {
        url: API_PATH + '/service/updateEnv',
        path: '/service/updateEnv'
      },
      // 更改Host配置
      'service_update_host': {
        url: API_PATH + '/service/updateHostIp',
        path: '/service/updateHostIp'
      },
      // 更改OneAPM
      'service_update_one_apm': {
        url: API_PATH + '/service/updateOneApm',
        path: '/service/updateOneApm'
      },
      // 更改VM_Options
      'service_update_vm_options': {
        url: API_PATH + '/service/updateVMOptions',
        path: '/service/updateVMOptions'
      },

      /** 实例相关*/
      // 获取实例列表
      'instance_list': {
        url: API_PATH + '/service/queryInstance',
        path: '/service/queryInstance'
      },

      /** 域名相关 */
      // 获取一级域名
      'domain_level_1_list': {
        url: API_PATH + '/domain/queryBySpaceId',
        path: '/domain/queryBySpaceId'
      },
      // 获取当前组的所有一级域名
      'domain_level_1_list_all': {
        url: API_PATH + '/domain/queryDomainList',
        path: '/domain/queryDomainList'
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
      // 外网域名列表
      'domain_list': {
        url: API_PATH + '/domain/queryByPage',
        path: '/domain/queryByPage'
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
      // 修改白名单
      'domain_update_white_ip': {
        url: API_PATH + '/domain/whiteList/',
        path: '/domain/whiteList/'
      },
      // 删除白名单
      'domain_delete_white_ip': {
        url: API_PATH + '/domain/whiteList/',
        path: '/domain/whiteList/'
      },
      // 获取白名单列表
      'domain_white_ip_list': {
        url: API_PATH + '/domain/whiteList/query',
        path: '/domain/whiteList/query'
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

      // 获取部署列表
      'log_deploy_list': {
        url: API_PATH + '/deployLog/getDeployLog',
        path: '/deployLog/getDeployLog'
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
      // 获取console日志
      'log_console_log': {
        url: API_PATH + '/pod/console/log',
        path: '/pod/console/log'
      },

      /** oauth相关 */
      // access key
      'oauth_get_target_group_list': {
        url: API_PATH + '/application/authorization/targetGroups',
        path: '/application/authorization/targetGroups'
      },
      // 创建Access Key
      'oauth_create_access_key': {
        url: API_PATH + '/application/authorization/create',
        path: '/application/authorization/create'
      },
      'oauth_access_key_list_by_app': {
        url: API_PATH + '/application/authorization/queryByAppId',
        path: '/application/authorization/queryByAppId'
      },
      'oauth_get_access_key_list': {
        url: API_PATH + '/application/authorization/query',
        path: '/application/authorization/query'
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
        url: API_PATH + '/application/authorization/targetGroup/{id}/targetApplication',
        path: '/application/authorization/targetGroup/{id}/targetApplication'
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

      // 工单列表
      'work_order_list': {
        url: API_PATH + '/workOrderDeploy/getWorkOrderDeployList',
        path: '/workOrderDeploy/getWorkOrderDeployList'
      },
      'work_order_todo_list': {
        url: API_PATH + '/workOrderDeploy/getTodoWorkOrderListByUser',
        path: '/workOrderDeploy/getTodoWorkOrderListByUser'
      },
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
      'work_order_detail_download_test_log_get': {
        url: API_PATH + '/workOrderDeploy/downloadTestReport/{id}',
        path: '/workOrderDeploy/downloadTestReport/{id}'
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
      // 创建工单
      'work_order_create': {
        url: API_PATH + '/workOrderDeploy/applyWordOrderDeploy',
        path: '/workOrderDeploy/applyWordOrderDeploy'
      },
      // 删除工单
      'work_order_remove': {
        url: API_PATH + '/workOrderDeploy/revoked',
        path: '/workOrderDeploy/revoked'
      },
      // 需改工单
      'work_order_modify': {
        url: API_PATH + '/workOrderDeploy/againSendWorkOrderDeploy',
        path: '/workOrderDeploy/againSendWorkOrderDeploy'
      },
      // 部署应用
      'work_order_app_deploy': {
        url: API_PATH + '/workOrderDeploy/deploy',
        path: '/workOrderDeploy/deploy'
      },
      // 部署应用-获取日志
      'work_order_fetch_deploy_log': {
        url: API_PATH + '/workOrderDeploy/searchDeployLog',
        path: '/workOrderDeploy/searchDeployLog'
      },

      // 远程配置中心——分支列表
      'config_server_branch': {
        url: API_PATH + '/remote-config/branches',
        path: 'remote-config/branches',
        method: 'post',
      },
      // 远程配置中心——目录列表 eg. remote-config/list?groupId=2
      'config_server_list': {
        url: API_PATH + '/remote-config/list',
        path: 'remote-config/list',
        method: 'post',
      },
      // 远程配置中心——文件列表 eg. remote-config/get?applicationRemoteConfigId=111
      'config_server_get': {
        url: API_PATH + '/remote-config/get',
        path: 'remote-config/get',
        method: 'post',
      },

      // 远程配置中心——添加目录
      'config_server_add': {
        url: API_PATH + '/remote-config/add',
        path: 'remote-config/add',
        method: 'post',
      },
      // 远程配置中心——添加配置文件
      'config_server_file_add': {
        url: API_PATH + '/applicationRemoteConfigFile/add',
        path: '/applicationRemoteConfigFile/add',
        method: 'post',
      },
      // 远程配置中心——获取配置文件列表 eg. /applicationRemoteConfigFile/get?applicationRemoteConfigId=123123
      'config_server_file_list': {
        url: API_PATH + '/applicationRemoteConfigFile/get',
        path: '/applicationRemoteConfigFile/get',
        method: 'post',
      },
      // 远程配置中心——获取配置文件内容 eg. /applicationRemoteConfigFile/content?applicationRemoteConfigId=123123
      'config_server_file_content': {
        url: API_PATH + '/applicationRemoteConfigFile/content',
        path: '/applicationRemoteConfigFile/content',
        method: 'post',
      },
      // 远程配置中心——保存配置文件 eg. /applicationRemoteConfigFile/update?applicationRemoteConfigFileId=1123
      'config_server_file_save': {
        url: API_PATH + '/applicationRemoteConfigFile/update',
        path: '/applicationRemoteConfigFile/update',
        method: 'post',
      },
      // 远程配置中心——编辑配置文件 eg. /applicationRemoteConfigFile/update/edit-status?applicationRemoteConfigFileId=1123
      'config_server_file_edit': {
        url: API_PATH + '/applicationRemoteConfigFile/update/edit-status',
        path: '/applicationRemoteConfigFile/update/edit-status',
        method: 'post',
      },

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