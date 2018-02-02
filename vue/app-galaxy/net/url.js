/**
 * Created by xifei.wu on 2017/11/30.
 */
var path = 'http://galaxy-web-server.galaxy.test';
// var path = 'http://172.31.165.126:30333';
// var path = 'http://172.16.106.191:30333';
// var path = 'http://172.16.106.191:30333';
var path = 'http://' + window.location.hostname + ':7002/api';
var urlList = {
  'page_terminal_path': 'http://' + window.location.host + '/terminal.html',
  'page_login_path': 'http://' + window.location.host + '/galaxy.html',

  // 获取验证码
  'get_verify_code': path + '/createRandomImage',
  'login': path + '/login',
  // 用户退出
  'logout': path + '/userLogout',
  'app_test': path + '/app',
  'app_list': path + '/application/queryByPage',
  'user_info': path + '/group/queryByUser',
  // 获取用户组ID
  'get_group_id': path + '/group/queryByUser',
  'create_app': path + '/application/create',
  'delete_app': path + '/application/delete',
  'get_profile_of_group': path + '/space/querySpaceByGroupId',
  'get_cpu_and_memory_config': path + '/cpuAndMemory/queryCpuAndMemory',
  'get_all_language': path + '/language/queryAllLanguage',
  'change_profile': path + '/application/update',
  // 通过appID和profileID获取服务列表
  'get_service_by_appId_and_profile': path + '/service/queryByAppIdAndSpaceId',

  // 获取服务版本
  'service_version': path + '/service/queryApplicationServiceVersion',
  // 部署服务
  'service_deploy': path + '/service/deployApplicationService',
  'service_deploy_log': path + '/service/deploy/log',
  // 创建服务
  'service_create':  path + '/service/createApplicationService',
  // 删除服务
  'service_delete': path + '/service/deleteApplicationService',
  // 停止服务
  'service_stop': path + '/service/stopApplicationService',
  // 获取自动打镜像类型列表
  'auto_image_list': path + '/image/queryBasicImage',
  // 自定义镜像-环境镜像
  'custom_image_env_list': path + '/image/queryEnvImageByEnvAndGroupTagAndApplicationId',
  // 自定义镜像-私有镜像-项目列表
  'custom_image_private_app_list': path + '/image/queryProjectNameByGroupTag',
  // 自定义镜像-私有镜像-项目-版本列表
  'custom_image_private_version_list_of_app': path + '/image/queryCustomImage',

  // 更改健康检查
  'service_update_health': path + '/service/updateHealth',
  // 更改镜像方式
  'service_update_image': path + '/service/updateImage',
  // 更改gitLabAddress
  'service_update_gitLab_address': path + '/service/updateGitLabSsh',
  // 更改gitLabBranch
  'service_update_gitLab_branch': path + '/service/updateGitLabBranch',
  // 更改maven profile id
  'service_update_maven_profile_id': path + '/service/updateMavenProfileId',
  // 更改CPU和Memory
  'service_update_cpu_and_memory': path + '/service/updateCpuAndMemory',
  // 更改滚动升级
  'service_update_rolling_update': path + '/service/updateRollingUpdate',
  // 更改负载均衡
  'service_update_load_balance': path + '/service/updateLoadBalance',
  // 更改文件存储
  'service_update_file_location': path + '/service/updateVolume',
  // 更改环境变量
  'service_update_environment': path + '/service/updateEnv',
  // 更改Host配置
  'service_update_host': path + '/service/updateHostIp',

  /** 实例相关*/
  // 获取实例列表
  'instance_list': path + '/service/queryInstance',

  /** 域名相关 */
  // 获取一级域名
  'domain_level_1_list': path + '/domain/queryBySpaceId',
  // 获取当前组的所有一级域名
  'domain_level_1_list_all': path + '/domain/queryDomainList',
  // 添加域名
  'create_domain': path + '/domain/record/create',
  // 删除域名
  'remove_domain': path + '/domain/record/delete',
  // 外网域名列表
  'domain_list': path + '/domain/queryByPage',
  // 绑定服务
  'domain_bind_service': path + '/domain/bind',
  // 解绑服务
  'domain_unbind_service': path + '/domain/unbind',
  // 添加
  'domain_add_white_ip': path + '/domain/whiteList/add',
  // 修改
  'domain_update_white_ip': path + '/domain/whiteList/',
  // 删除
  'domain_delete_white_ip': path + '/domain/whiteList/',
  // 获取白名单列表
  'domain_white_ip_list': path + '/domain/whiteList/query',


  // 获取部署列表
  'log_deploy_list': path + '/deployLog/getDeployLog',
  // 获取运行日志
  'log_run_log': path + '/searchLog',
  // 获取部署历史日志
  'log_deploy_log': path + '/service/historylog',

  // 工单列表
  'work_order_list': path + '/workOrderDeploy/getWorkOrderDeployList',
  'work_order_todo_list': path + '/workOrderDeploy/getTodoWorkOrderListByUser',
  // 工单详情
  // 功能列表
  'work_order_detail_feature_list': path + '/workOrderDeployFunction/getWorkOrderDeployFunctions',
  // 程序列表
  'work_order_detail_app_list': path + '/workOrderDeployApp/getWorkOrderDeployApp',
  // 待办人
  'work_order_detail_user_todo': path + '/workOrderDeploy/queryWorkOrderDeployToDoUser',
  // 验收人
  'work_order_detail_user_accepted': path + '/acceptanceUser/getWorkOrderDeployAcceptUser',
  // 知会人
  'work_order_detail_notify_user': path + '/informUser/getWorkOrderDeployInformUser',
  // 操作记录
  'work_order_detail_operation_list': path + '/workOrderDeployLog/getWorkOrderDeployLog',
  // 邮件组
  'work_order_detail_email_group': path + '/emailGroup/getWorkOrderDeployEmailGroup',

  /** 处理工单 */
  // 点击处理前的判断逻辑
  'check_before_handle_work_order': path + '/workOrderDeploy/validWorkOrderDeployHandleUser',
  // 上传测试报告
  // 'work_order_handle_upload_test_report': 'http://localhost:4291/post/upload',
  'work_order_handle_upload_test_report': path + '/workOrderDeploy/uploadFile',
  // 处理完成
  'work_order_submit_handle': path + '/workOrderDeploy/handleWorkOrderDeploy',
  // 创建工单
  'work_order_create': path + '/workOrderDeploy/applyWordOrderDeploy',
  // 删除工单
  'work_order_remove': path + '/workOrderDeploy/revoked',
  // 需改工单
  'work_order_modify': path + '/workOrderDeploy/againSendWorkOrderDeploy',
  // 部署应用
  'work_order_app_deploy': path + '/workOrderDeploy/deploy',
  // 部署应用-获取日志
  'work_order_fetch_deploy_log': path + '/workOrderDeploy/searchDeployLog',

  // 获取验收人列表
  'users_in_group': path + '/group/users',
  // 获取所有用户列表
  'users_all': path + '/user/queryUserList',

  // 获取打开实例终端信息
  'terminal_info': path + '/service/queryTerminalInfo',

};

export default urlList;
