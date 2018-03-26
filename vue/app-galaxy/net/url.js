/**
 * Created by xifei.wu on 2017/11/30.
 */

let port = null;
switch (process.env.NODE_ENV) {
  case 'test':
    port = 80;
    break;
  case 'production':
    port = 80;
    break;
  case 'dev':
  default:
    port = 7002;
    break;
}

var path = 'http://' + window.location.hostname + ':' + port;
var apiPath = path + '/api';

var urlList = {
  'api_path': apiPath,
  'page_terminal_path': 'http://' + window.location.host + '/terminal.html',
  'page_login_path': 'http://' + window.location.host + '/galaxy.html',

  // 获取验证码
  'get_verify_code': apiPath + '/createRandomImage',
  'login': apiPath + '/login',
  // 用户退出
  'logout': apiPath + '/userLogout',
  'app_test': apiPath + '/app',
  'app_list': apiPath + '/application/queryByPage',
  'user_info': apiPath + '/group/queryByUser',
  // 获取用户组ID
  'get_user_group_list': apiPath + '/group/queryByUser',

  /** 全局相关 */
  // 获取所有用户列表
  'users_all': apiPath + '/user/queryUserList',
  // 获取所有组列表
  'get_all_group_list': apiPath + '/group/queryAllGroup',

  /** 应用相关 */
  'create_app': apiPath + '/application/create',
  'delete_app': apiPath + '/application/delete',
  'get_profile_of_group': apiPath + '/space/querySpaceByGroupId',
  'get_cpu_and_memory_config': apiPath + '/cpuAndMemory/queryCpuAndMemory',
  'get_all_language': apiPath + '/language/queryAllLanguage',
  'change_app_name': apiPath + '/application/updateAppName',
  'change_profile': apiPath + '/application/update',

  /** 服务相关 */
  // 通过appID和profileID获取服务列表
  'get_service_by_appId_and_profile': apiPath + '/service/queryByAppIdAndSpaceId',
  // 修改默认服务
  'change_default_service': apiPath + '/service/switchService',
  // 获取服务版本
  'service_version': apiPath + '/service/queryApplicationServiceVersion',
  // 部署服务-开始部署
  'service_deploy': apiPath + '/service/deployApplicationService',
  // 部署服务-部署日志
  'service_deploy_log': apiPath + '/service/deploy/log',
  // 创建服务
  'service_create':  apiPath + '/service/createApplicationService',
  // 删除服务
  'service_delete': apiPath + '/service/deleteApplicationService',
  // 停止服务
  'service_stop': apiPath + '/service/stopApplicationService',
  // 获取自动打镜像类型列表
  'auto_image_list': apiPath + '/image/queryBasicImage',
  // 自定义镜像-环境镜像
  'custom_image_env_list': apiPath + '/image/queryEnvImageByEnvAndGroupTagAndApplicationId',
  // 自定义镜像-私有镜像-项目列表
  'custom_image_private_app_list': apiPath + '/image/queryProjectNameByGroupTag',
  // 自定义镜像-私有镜像-项目-版本列表
  'custom_image_private_version_list_of_app': apiPath + '/image/queryCustomImage',

  // 更改健康检查
  'service_update_health': apiPath + '/service/updateHealth',
  // 更改镜像方式
  'service_update_image': apiPath + '/service/updateImage',
  // 更改gitLabAddress
  'service_update_gitLab_address': apiPath + '/service/updateGitLabSsh',
  // 更改gitLabBranch
  'service_update_gitLab_branch': apiPath + '/service/updateGitLabBranch',
  // 更改maven profile id
  'service_update_maven_profile_id': apiPath + '/service/updateMavenProfileId',
  // 更改CPU和Memory
  'service_update_cpu_and_memory': apiPath + '/service/updateCpuAndMemory',
  // 更改滚动升级
  'service_update_rolling_update': apiPath + '/service/updateRollingUpdate',
  // 更改负载均衡
  'service_update_load_balance': apiPath + '/service/updateLoadBalance',
  // 更改文件存储
  'service_update_file_location': apiPath + '/service/updateVolume',
  // 更改环境变量
  'service_update_environment': apiPath + '/service/updateEnv',
  // 更改Host配置
  'service_update_host': apiPath + '/service/updateHostIp',
  // 更改OneAPM
  'service_update_one_apm': apiPath + '/service/updateOneApm',
  // 更改VM_Options
  'service_update_vm_options': apiPath + '/service/updateVMOptions',

  /** 实例相关*/
  // 获取实例列表
  'instance_list': apiPath + '/service/queryInstance',

  /** 域名相关 */
  // 获取一级域名
  'domain_level_1_list': apiPath + '/domain/queryBySpaceId',
  // 获取当前组的所有一级域名
  'domain_level_1_list_all': apiPath + '/domain/queryDomainList',
  // 添加域名
  'create_domain': apiPath + '/domain/record/create',
  // 删除域名
  'remove_domain': apiPath + '/domain/record/delete',
  // 外网域名列表
  'domain_list': apiPath + '/domain/queryByPage',
  // 绑定服务
  'domain_bind_service': apiPath + '/domain/bind',
  // 解绑服务
  'domain_unbind_service': apiPath + '/domain/unbind',
  // 添加
  'domain_add_white_ip': apiPath + '/domain/whiteList/add',
  // 修改
  'domain_update_white_ip': apiPath + '/domain/whiteList/',
  // 删除
  'domain_delete_white_ip': apiPath + '/domain/whiteList/',
  // 获取白名单列表
  'domain_white_ip_list': apiPath + '/domain/whiteList/query',
  // 下载白名单模板
  // 'domain_download_white_ip_list_template': apiPath + '/domain/whiteList/download/template',
  'domain_download_white_ip_list_template': path + '/assets/files/ip白名单模板.xlsx',
  // 上传白名单模板
  'domain_upload_white_ip_list_template': apiPath + '/domain/whiteList/upload/template',

  // 获取部署列表
  'log_deploy_list': apiPath + '/deployLog/getDeployLog',
  // 获取运行日志
  'log_run_log': apiPath + '/searchLog',
  // 获取部署历史日志
  'log_deploy_log': apiPath + '/service/historylog',

  /** oauth相关 */
  'oauth_get_target_group_list': apiPath + '/application/authorization/targetGroups',
  'oauth_create_access_key': apiPath + '/application/authorization/create',
  'oauth_get_access_key_list': apiPath + '/application/authorization/query',
  'oauth_update_secret': apiPath + '/application/authorization',
  'oauth_delete_access_key': apiPath + '/application/authorization',
  'oauth_add_access_config': apiPath + '/application/authorization',

  // 工单列表
  'work_order_list': apiPath + '/workOrderDeploy/getWorkOrderDeployList',
  'work_order_todo_list': apiPath + '/workOrderDeploy/getTodoWorkOrderListByUser',
  // 是否有未处理工单
  'work_order_in_handling': apiPath + '/workOrderDeploy/validNoEndWorkOrderDeployByAppId',
  // 工单详情
  // 功能列表
  'work_order_detail_feature_list': apiPath + '/workOrderDeployFunction/getWorkOrderDeployFunctions',
  // 程序列表
  'work_order_detail_app_list': apiPath + '/workOrderDeployApp/getWorkOrderDeployApp',
  // 待办人
  'work_order_detail_user_todo': apiPath + '/workOrderDeploy/queryWorkOrderDeployToDoUser',
  // 验收人
  'work_order_detail_user_accepted': apiPath + '/acceptanceUser/getWorkOrderDeployAcceptUser',
  // 知会人
  'work_order_detail_notify_user': apiPath + '/informUser/getWorkOrderDeployInformUser',
  // 操作记录
  'work_order_detail_operation_list': apiPath + '/workOrderDeployLog/getWorkOrderDeployLog',
  // 邮件组
  'work_order_detail_email_group': apiPath + '/emailGroup/getWorkOrderDeployEmailGroup',
  // 测试日志
  'work_order_detail_test_log_list': apiPath + '/workOrderDeploy/queryWorkOrderDeployTestReport',

  /** 处理工单 */
  // 点击处理前的判断逻辑
  'check_before_handle_work_order': apiPath + '/workOrderDeploy/validWorkOrderDeployHandleUser',
  // 上传测试报告
  // 'work_order_handle_upload_test_report': 'http://localhost:4291/post/upload',
  'work_order_handle_upload_test_report': apiPath + '/workOrderDeploy/uploadFile',
  // 处理完成
  'work_order_submit_handle': apiPath + '/workOrderDeploy/handleWorkOrderDeploy',
  // 创建工单
  'work_order_create': apiPath + '/workOrderDeploy/applyWordOrderDeploy',
  // 删除工单
  'work_order_remove': apiPath + '/workOrderDeploy/revoked',
  // 需改工单
  'work_order_modify': apiPath + '/workOrderDeploy/againSendWorkOrderDeploy',
  // 部署应用
  'work_order_app_deploy': apiPath + '/workOrderDeploy/deploy',
  // 部署应用-获取日志
  'work_order_fetch_deploy_log': apiPath + '/workOrderDeploy/searchDeployLog',

  // 获取验收人列表
  'users_in_group': apiPath + '/group/users',

  // 获取打开实例终端信息
  'terminal_info': apiPath + '/service/queryTerminalInfo',

};

export default urlList;
