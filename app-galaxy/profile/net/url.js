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
    let ORIGIN = this.ORIGIN;
    let API_PATH = this.API_PATH;
    this.URL_LIST = {
      'api_path': API_PATH,
      'page_terminal_path': 'http://' + window.location.host + '/terminal.html',

      'highlight.js': '/assets/libs/highlight/highlight.pack.js',
      'highlight.css': '/assets/libs/highlight/styles/vs2015.css',
      // 'highlight.css': '/assets/css/highlight.scss',

      // 获取验证码
      'get_verify_code': API_PATH + '/createRandomImage',
      'login': API_PATH + '/login',
      // 用户退出
      'logout': API_PATH + '/userLogout',
      'app_list': API_PATH + '/application/queryByPage',
      'user_info': API_PATH + '/group/queryByUser',
      // 获取用户所在组列表
      'get_user_group_list': API_PATH + '/group/queryByUser',

      /** 全局相关 */
      // 获取所有用户列表
      'users_all': API_PATH + '/user/queryUserList',
      // 获取所有组列表
      'get_all_group_list': API_PATH + '/group/queryAllGroup',

      /** 应用相关 */
      'create_app': API_PATH + '/application/create',
      'delete_app': API_PATH + '/application/delete',
      'get_profile_of_group': API_PATH + '/space/querySpaceByGroupId',
      'get_cpu_and_memory_config': API_PATH + '/cpuAndMemory/queryCpuAndMemory',
      'get_all_language': API_PATH + '/language/queryAllLanguage',
      'change_app_name': API_PATH + '/application/updateAppName',
      'change_profile': API_PATH + '/application/update',

      /** 服务相关 */
      // 通过appID和profileID获取服务列表
      'get_service_by_appId_and_profile': API_PATH + '/service/queryByAppIdAndSpaceId',
      // 修改默认服务
      'change_default_service': API_PATH + '/service/switchService',
      // 获取服务版本
      'service_version': API_PATH + '/service/queryApplicationServiceVersion',
      // 部署服务-开始部署
      'service_deploy': API_PATH + '/service/deployApplicationService',
      // 部署服务-部署日志
      'service_deploy_log': API_PATH + '/service/deploy/log',
      // 创建服务
      'service_create':  API_PATH + '/service/createApplicationService',
      // 删除服务
      'service_delete': API_PATH + '/service/deleteApplicationService',
      // 停止服务
      'service_stop': API_PATH + '/service/stopApplicationService',
      // 获取自动打镜像类型列表
      'auto_image_list': API_PATH + '/image/queryBasicImage',
      // 自定义镜像-环境镜像
      'custom_image_env_list': API_PATH + '/image/queryEnvImageByEnvAndGroupTagAndApplicationId',
      // 自定义镜像-私有镜像-项目列表
      'custom_image_private_app_list': API_PATH + '/image/queryProjectNameByGroupTag',
      // 自定义镜像-私有镜像-项目-版本列表
      'custom_image_private_version_list_of_app': API_PATH + '/image/queryCustomImage',

      // 更改健康检查
      'service_update_health': API_PATH + '/service/updateHealth',
      // 更改镜像方式
      'service_update_image': API_PATH + '/service/updateImage',
      // 更改gitLabAddress
      'service_update_gitLab_address': API_PATH + '/service/updateGitLabSsh',
      // 更改gitLabBranch
      'service_update_gitLab_branch': API_PATH + '/service/updateGitLabBranch',
      // 更改maven profile id
      'service_update_maven_profile_id': API_PATH + '/service/updateMavenProfileId',
      // 更改CPU和Memory
      'service_update_cpu_and_memory': API_PATH + '/service/updateCpuAndMemory',
      // 更改滚动升级
      'service_update_rolling_update': API_PATH + '/service/updateRollingUpdate',
      // 更改负载均衡
      'service_update_load_balance': API_PATH + '/service/updateLoadBalance',
      // 更改文件存储
      'service_update_file_location': API_PATH + '/service/updateVolume',
      // 更改环境变量
      'service_update_environment': API_PATH + '/service/updateEnv',
      // 更改Host配置
      'service_update_host': API_PATH + '/service/updateHostIp',
      // 更改OneAPM
      'service_update_one_apm': API_PATH + '/service/updateOneApm',
      // 更改VM_Options
      'service_update_vm_options': API_PATH + '/service/updateVMOptions',

      /** 实例相关*/
      // 获取实例列表
      'instance_list': API_PATH + '/service/queryInstance',
      // 更改实例数量
      'instance_change_count': API_PATH + '/service/instances/update',

      /** 域名相关 */
      // 获取一级域名
      'domain_level_1_list': API_PATH + '/domain/queryBySpaceId',
      // 获取当前组的所有一级域名
      'domain_level_1_list_all': API_PATH + '/domain/queryDomainList',
      // 添加域名
      'create_domain': API_PATH + '/domain/record/create',
      // 删除域名
      'remove_domain': API_PATH + '/domain/record/delete',
      // 外网域名列表
      'domain_list': API_PATH + '/domain/queryByPage',
      // 绑定服务
      'domain_bind_service': API_PATH + '/domain/bind',
      // 解绑服务
      'domain_unbind_service': API_PATH + '/domain/unbind',
      // 添加
      'domain_add_white_ip': API_PATH + '/domain/whiteList/add',
      // 修改
      'domain_update_white_ip': API_PATH + '/domain/whiteList/',
      // 删除
      'domain_delete_white_ip': API_PATH + '/domain/whiteList/',
      // 获取白名单列表
      'domain_white_ip_list': API_PATH + '/domain/whiteList/query',
      // 下载白名单模板
      // 'domain_download_white_ip_list_template': API_PATH + '/domain/whiteList/download/template',
      'domain_download_white_ip_list_template': ORIGIN + '/assets/files/ip白名单模板.xlsx',
      // 上传白名单模板
      'domain_upload_white_ip_list_template': API_PATH + '/domain/whiteList/upload/template',

      // 获取部署列表
      'log_deploy_list': API_PATH + '/deployLog/getDeployLog',
      // 获取运行日志
      'log_run_log': API_PATH + '/searchLog',
      // 获取部署历史日志
      'log_deploy_log': API_PATH + '/service/historylog',

      /** oauth相关 */
      // access key
      'oauth_get_target_group_list': API_PATH + '/application/authorization/targetGroups',
      'oauth_create_access_key': API_PATH + '/application/authorization/create',
      'oauth_get_access_key_list': API_PATH + '/application/authorization/query',
      'oauth_update_secret': API_PATH + '/application/authorization',
      'oauth_delete_access_key': API_PATH + '/application/authorization',
      'oauth_add_access_config': API_PATH + '/application/authorization',
      // 授权url
      'oauth_get_authorize_url_list': API_PATH + '/application/authorization/record/query',
      'oauth_get_target_app_list': API_PATH + '/application/authorization/targetGroup/{id}/targetApplication',
      'oauth_modify_authorize_url_list': API_PATH + '/application/authorization/record/{id}/auth',
      'oauth_authorize_url_toggle_enable': API_PATH + '/application/authorization/record/{id}/enableOrDisable',

      // 工单列表
      'work_order_list': API_PATH + '/workOrderDeploy/getWorkOrderDeployList',
      'work_order_todo_list': API_PATH + '/workOrderDeploy/getTodoWorkOrderListByUser',
      // 是否有未处理工单
      'work_order_in_handling': API_PATH + '/workOrderDeploy/validNoEndWorkOrderDeployByAppId',
      // 工单详情
      // 功能列表
      'work_order_detail_feature_list': API_PATH + '/workOrderDeployFunction/getWorkOrderDeployFunctions',
      // 程序列表
      'work_order_detail_app_list': API_PATH + '/workOrderDeployApp/getWorkOrderDeployApp',
      // 待办人
      'work_order_detail_user_todo': API_PATH + '/workOrderDeploy/queryWorkOrderDeployToDoUser',
      // 验收人
      'work_order_detail_user_accepted': API_PATH + '/acceptanceUser/getWorkOrderDeployAcceptUser',
      // 知会人
      'work_order_detail_notify_user': API_PATH + '/informUser/getWorkOrderDeployInformUser',
      // 操作记录
      'work_order_detail_operation_list': API_PATH + '/workOrderDeployLog/getWorkOrderDeployLog',
      // 邮件组
      'work_order_detail_email_group': API_PATH + '/emailGroup/getWorkOrderDeployEmailGroup',
      // 测试日志
      'work_order_detail_test_log_list': API_PATH + '/workOrderDeploy/queryWorkOrderDeployTestReport',
      // 下载测试日志
      'work_order_detail_download_test_log_post': API_PATH + '/workOrderDeploy/downloadTestReport',
      'work_order_detail_download_test_log_get': API_PATH + '/workOrderDeploy/downloadTestReport/{id}',
      // 删除测试日志
      'work_order_delete_test_log': API_PATH + '/workOrderDeploy/deleteTestReport/{id}',

      /** 处理工单 */
      // 点击处理前的判断逻辑
      'check_before_handle_work_order': API_PATH + '/workOrderDeploy/validWorkOrderDeployHandleUser',
      // 上传测试报告
      // 'work_order_handle_upload_test_report': 'http://localhost:4291/post/upload',
      'work_order_handle_upload_test_report': API_PATH + '/workOrderDeploy/uploadFile',
      // 处理完成
      'work_order_submit_handle': API_PATH + '/workOrderDeploy/handleWorkOrderDeploy',
      // 创建工单
      'work_order_create': API_PATH + '/workOrderDeploy/applyWordOrderDeploy',
      // 删除工单
      'work_order_remove': API_PATH + '/workOrderDeploy/revoked',
      // 需改工单
      'work_order_modify': API_PATH + '/workOrderDeploy/againSendWorkOrderDeploy',
      // 部署应用
      'work_order_app_deploy': API_PATH + '/workOrderDeploy/deploy',
      // 部署应用-获取日志
      'work_order_fetch_deploy_log': API_PATH + '/workOrderDeploy/searchDeployLog',

      // 获取验收人列表
      'users_in_group': API_PATH + '/group/users',

    };
  }

  getUrlList() {
    return this.URL_LIST;
  }
}
let url = new URL();
const ORIGIN = url.ORIGIN;
const URL_LIST = url.getUrlList();

export {
  ORIGIN,
  URL_LIST
}
