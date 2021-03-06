/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import {URL_LIST} from './url';
import appInfoHelper from '../pages/utils/app-props';
import NetBase from 'assets/js/net';
var debug = browserDebug('pass-fe:net');

function permission(target, name, descriptor) {
  let value = descriptor.value;
  Object.assign(descriptor, {
    value: function (...args) {
      // console.log(this.__proto__ === target);
      value.apply(this, args);
    }
  })
}

class Net extends NetBase {
  constructor() {
    super();
    this.$utils = null;
    this.$storeHelper = null;
    // 需要更新应用列表：
    // 1. 添加应用
    // 2. 添加服务
    // 3. 删除服务
    this.needUpdateAppList = false;
    const PAAS_URL_LIST = {
      // permission与url的对应关系。TODO: not used
      'permission_url_map': {
        path: '/permissionUrlMappings',
        method: 'post'
      },
      // 获取配置信息：如，cpu和memory的对应关系、开发语言列表
      'config_query': {
        path: '/config/query',
        method: 'get'
      },
      // 获取cpu和memory的对应关系
      // TODO: not used
      'cpu_and_memory_config': {
        path: '/cpuAndMemory/queryCpuAndMemory',
        method: 'get'
      },
      // 开发语言列表
      // TODO: not used
      'language_list': {
        path: '/language/queryAllLanguage',
        method: 'get'
      },
      // 获取用户所在组列表（父类中已经存在）
      'user_group_list': {
        path: '/group/queryByUser',
        method: 'get'
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
      /** 概况 */
      // 申请的实例数
      general_instance_count: {
        path: '/overview/queryInstanceNumberByGroup',
        method: 'post',
        partial: true,
      },
      // 申请
      general_cpu_count: {
        path: '/overview/queryCpuByGroup',
        method: 'post',
        partial: true,
      },
      general_memory_size: {
        path: '/overview/queryMemoryByGroup',
        method: 'post',
        partial: true,
      },
      general_ratio_cpu_usage: {
        path: '/overview/queryCpuAvgUsage',
        method: 'post',
        timeout: 30000,
        partial: true,
      },
      general_ratio_memory_usage: {
        path: '/overview/queryMemoryAvgUsage',
        method: 'post',
        partial: true,
      },
      /** 应用相关 */
      // 应用列表
      // 'app_list'
      // 创建应用
      'app_create': {
        path: '/application/create',
        method: 'post'
      },
      // 修改应用
      'app_update': {
        path: '/application/update',
        method: 'post'
      },
      // 删除应用
      'app_delete': {
        path: '/application/delete',
        method: 'post'
      },
      // TODO: not used
      // 获取应用实例运行状态
      'app_instance_status': {
        partial: true,
        path: '/application/instance/status',
        method: 'get'
      },

      /** 服务相关 */
      // 创建和更新服务
      'service_create': {
        path: '/service/createApplicationService',
        method: 'post'
      },
      'service_update': {
        path: '/service/updateApplicationService',
        method: 'post'
      },
      // 获取服务版本，TODO: not used
      'service_version': {
        path: '/service/queryApplicationServiceVersion',
        method: 'post'
      },
      // {
      //    appId: appId,
      //    spaceId: profileId
      //  }

      // 获取服务基本信息列表（k8s运行时）
      'service_list_by_profile': {
        path: '/service/queryByDetail',
        method: 'post'
      },
      // 获取服务信息（基本信息）（数据库）
      'service_list_by_app_and_profile': {
        path: '/service/queryByAppIdAndSpaceId',
        method: 'post'
      },
      'service_by_id': {
        path: '/service/{id}',
        method: 'get'
      },

      'service_not_exists_in_space': {
        path: '/service/queryNotServiceAppByAppId',
        method: 'get'
      },
      // 获取服务信息（实时运行信息）
      'service_info_running': {
        path: '/service/getRuntimeAppConfig',
        method: 'post'
      },
      // 删除服务
      'service_delete': {
        path: '/service/deleteApplicationService',
        method: 'post'
      },
      // 停止服务
      'service_stop': {
        path: '/service/stopApplicationService',
        method: 'post'
      },
      // 获取域名请求相关信息
      'service_info_request_statistic': {
        path: '/getInterfaceAccessCount',
        method: 'post',
        level: 'LEVEL_WARNING',
        errObj: {
          title: '请求超时',
          message: '因访问数量过多/响应数据量过大，请您稍后再试！'
        }
      },
      //获取topN的异常信息
      'service_detail_topNException': {
        path: '/api/v1/app/excption/top',
        method: 'post',
      },
      // TODO: not used
      'query_default_expired_days': {
        path: '/service/queryDefaultExpiredDays',
        method: 'post'
      },
      // 部署服务-开始部署
      'service_deploy': {
        path: '/service/deployApplicationService',
        method: 'post'
      },
      // 部署服务-开始部署
      'service_quick_deploy': {
        path: '/service/quickDeployApplicationService',
        method: 'post'
      },
      // 获取容忍配置
      'get_toleration_config': {
        path: '/service/getTolerationConfig',
        method: 'post'
      },
      // 获取亲和性k8s信息
      'get_resource_information_by_k8s': {
        path: '/service/getResourceInformationByK8S',
        method: 'post'
      },
      // 获取pod spec配置
      'get_affinity_config': {
        path: '/service/getPodSpecConfig',
        method: 'post'
      },
      // 修改pod spec配置
      'update_affinity_config': {
        path: '/service/updatePodSpecConfig',
        method: 'post'
      },
      // node spec配置立即生效
      'update_affinity_sync_k8s': {
        path: '/service/updatePodSpecSyncK8S',
        method: 'post'
      },
      // 修改容忍配置
      'update_toleration_config': {
        path: '/service/updateTolerationConfig',
        method: 'post'
      },
      'update_toleration_sync_k8s': {
        path: '/service/updateTolerationSyncK8S',
        method: 'post'
      },
      // 检测服务端口映射
      'service_port_map_check': {
        path: '/service/checkPortMapping',
        method: 'post'
      },
      // 获取自动打镜像类型列表
      'auto_image_list': {
        path: '/image/queryBasicImage',
        method: 'post',
        level: 'LEVEL_WARNING'
      },
      // 获取自定义镜像列表
      'custom_image_list': {
        path: '/image/queryLastTenByAppIdAndSpaceId',
        method: 'post',
        level: 'LEVEL_WARNING'
      },
      // 根据服务id获得最近（10次）部署工单
      'lastest_work_order_by_service': {
        path: '/workOrderDeploy/last10/workorder/{serviceId}',
        method: 'get'
      },
      // 获取工单的部署列表
      'latest_deploy_log_by_work_order': {
        path: '/deployLog/10/{workOrderId}/{serviceId}',
        method: 'get'
      },
      // 镜像回滚
      'image_rollback': {
        path: '/service/rollback',
        method: 'post'
      },

      // 更改实例数
      'service_update_instance_num': {
        // path: '/service/instances/update',
        path: '/service/instances/updateDB',
        method: 'post'
      },
      'service_update_health': {
        path: '/service/updateHealth',
        method: 'post'
      },
      // 更改镜像方式
      'service_update_image': {
        path: '/service/updateImage',
        method: 'post'
      },
      // 更改gitLabAddress
      'service_update_gitLab_address': {
        path: '/service/updateGitLabSsh',
        method: 'post'
      },
      // 更改gitLabBranch
      'service_update_gitLab_branch': {
        path: '/service/updateGitLabBranch',
        method: 'post'
      },
      // 更改relativePath
      'service_update_relative_path': {
        path: '/service/updateRelativePath',
        method: 'post'
      },
      // 更改mainClass
      'service_update_main_class': {
        path: '/service/updateMainClass',
        method: 'post'
      },
      // 更改maven profile id
      'service_update_maven_profile_id': {
        path: '/service/updateMavenProfileId',
        method: 'post'
      },
      // 更改CPU和Memory
      'service_update_cpu_and_memory': {
        path: '/service/updateCpuAndMemory',
        method: 'post'
      },
      // 更改滚动升级
      'service_update_rolling_update': {
        path: '/service/updateRollingUpdate',
        method: 'post'
      },
      // 更改负载均衡
      'service_update_load_balance': {
        path: '/service/updateLoadBalance',
        method: 'post'
      },
      // 更改文件存储
      'service_update_file_location': {
        path: '/service/updateVolume',
        method: 'post'
      },
      // 更改环境变量
      'service_update_environment': {
        path: '/service/updateEnv',
        method: 'post'
      },
      // 更改Host配置
      'service_update_host': {
        path: '/service/updateHostIp',
        method: 'post'
      },
      // 更改OneAPM
      'service_update_one_apm': {
        path: '/service/updateOneApm',
        method: 'post'
      },
      // 更改应用监控
      'service_update_app_monitor': {
        path: '/service/updateAppMonitor',
        method: 'post'
      },
      // 更改VM_Options
      'service_update_vm_options': {
        path: '/service/updateVMOptions',
        method: 'post'
      },
      // 更改prestop
      'service_update_prestop_command': {
        path: '/service/updatePrestop',
        method: 'post'
      },
      // 更改包信息
      'service_update_package_info': {
        path: '/service/updatePackage',
        method: 'post'
      },
      'service_update_port_map': {
        path: '/service/updatePortMapping',
        method: 'post'
      },
      //延长过期时间
      'service_expired_days_change':{
        path: '/service/updateExpiredDays',
        method: 'post'
      },
      'service_update_internet_domain': {
        path: '/service/1.x/updateOuterDomain',
        method: 'post'
      },
      'service_gray_list': {
        path: '/service/canaryInfo',
        method: 'get'
      },
      'service_gray_create': {
        path: '/service/canary/create',
        method: 'post'
      },
      'service_gray_update': {
        path: '/service/canary/update',
        method: 'put'
      },
      'service_gray_delete': {
        path: '/service/canary/delete',
        method: 'post'
      },
      // 查询灰度策略配置
      'service_gray_strategy_query': {
        path: '/service/canaryStrategy/query',
        method: 'post'
      },
      // 查询灰度实例配置
      'service_gray_instance_query': {
        path: '/service/canary/instanceQuery',
        method: 'post'
      },
      // 创建/更新灰度配置：调整实例数
      'service_gray_update_instance_count': {
        path: '/service/canary/instanceUpdate',
        method: 'post'
      },
      // 创建/更新灰度配置：调整策略
      'service_gray_update_strategy': {
        path: '/service/canaryStrategy/createOrUpdate',
        method: 'post'
      },
      'service_gray_apply': {
        path: '/service/canaryProgress/finish',
        method: 'post'
      },
      'service_gray_apply_log': {
        path: '/service/canaryProgress/get',
        method: 'post'
      },
      /** 实例相关*/
      // 获取实例列表
      'instance_list': {
        path: '/service/queryInstance',
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
        method: 'post',
        partial: true
      },
      // 驱逐实例
      'instance_replace': {
        path: '/service/deletePod',
        method: 'post'
      },
      // 获取实例的console日志
      'instance_console_log': {
        path: '/pod/console/log',
        method: 'post'
      },

      'instance_info': {
        path: '/instance?id={id}&appId={appId}&spaceId={spaceId}',
        method: 'get'
      },

      /** oauth相关 */
      // 创建Access Key
      'oauth_access_key_create': {
        path: '/application/authorization/create',
        method: 'post'
      },
      // oauth列表
      'oauth_get_access_key_list': {
        path: '/application/authorization/query',
        method: 'post'
      },
      // 修改秘钥
      'oauth_update_secret': {
        path: '/application/authorization/{id}',
        method: 'patch'
      },
      // 添加(修改)访问配置
      'oauth_add_access_config': {
        path: '/application/authorization/{id}',
        method: 'put'
      },

      /** 应用配置 */
      'config_server_branch': {
        path: '/remote-config/branches',
        method: 'post',
      },
      // 远程配置中心——目录列表 eg. remote-config/list?groupId=2
      'config_server_list': {
        path: '/remote-config/list',
        method: 'post',
      },
      // 远程配置中心——添加目录
      'config_server_add': {
        path: '/remote-config/add',
        method: 'post',
      },
      // 远程配置中心——添加配置文件
      'config_server_file_add': {
        path: '/applicationRemoteConfigFile/add',
        method: 'post',
      },
      // 远程配置中心——获取配置文件列表 eg. /applicationRemoteConfigFile/get?applicationRemoteConfigId=123123
      'config_server_file_list': {
        path: '/applicationRemoteConfigFile/get',
        method: 'post',
        timeout: 20000
      },
      // 远程配置中心——获取配置文件内容 eg. /applicationRemoteConfigFile/content?applicationRemoteConfigId=123123
      'config_server_file_content': {
        path: '/applicationRemoteConfigFile/content',
        method: 'get',
      },
      // 远程配置中心——保存配置文件 eg. /applicationRemoteConfigFile/update?applicationRemoteConfigFileId=1123
      'config_server_file_save': {
        path: '/applicationRemoteConfigFile/update',
        method: 'post',
        // NOTICE: use message for tip other than notify
        level: 'LEVEL_IGNORE',
      },
      // 远程配置中心——编辑配置文件 eg. /applicationRemoteConfigFile/update/edit-status?applicationRemoteConfigFileId=1123
      'config_server_file_edit': {
        path: '/applicationRemoteConfigFile/update/edit-status',
        method: 'post',
      },
      // 远程配置中心——删除配置文件 eg. /applicationRemoteConfigFile/del?applicationRemoteConfigFileId=1123
      'config_server_file_del': {
        path: '/applicationRemoteConfigFile/del',
        method: 'post',
      },

      /** 域名相关 */
      // 外网域名列表
      'domain_list': {
        path: '/domain/queryByPage',
        method: 'post'
      },
      // 绑定服务
      'domain_bind_service': {
        path: '/domain/bind',
        method: 'post'
      },
      // 解绑服务
      'domain_unbind_service': {
        path: '/domain/unbind',
        method: 'post'
      },

      /** 日志相关 */
      // 获取部署日志列表
      'log_deploy_list': {
        path: '/deployLog/getDeployLog',
        method: 'post'
      },
      // 获取灰度部署日志列表
      'log_canary_deploy_list': {
        path: '/service/canary/logs',
        method: 'post'
      },

      /** 监控相关 */
      // 获取监控数据-CPU
      'monitor_statistic_cpu': {
        path: '/service/monitorCPUUsage',
        method: 'post',
        partial: true,
      },
      // 获取监控数据-内存
      'monitor_statistic_memory': {
        path: '/service/monitorMemoryUsage',
        method: 'post',
        partial: true,
      },
      // 获取监控数据-磁盘读
      'monitor_statistic_disk_read': {
        path: '/service/monitorFSReadBytes',
        method: 'post',
        partial: true,
      },
      // 获取监控数据-磁盘写
      'monitor_statistic_disk_write': {
        path: '/service/monitorFSWriteBytes',
        method: 'post',
        partial: true,
      },
      // 获取监控数据-网络in
      'monitor_statistic_net_in': {
        path: '/service/monitorNetworkInput',
        method: 'post',
        partial: true,
      },
      // 获取监控数据-网络out
      'monitor_statistic_net_out': {
        path: '/service/monitorNetworkOutput',
        method: 'post',
        partial: true,
      },
      // 获取监控数据-入包量
      // payload: {netWorkPackageDirection: 'receive'}
      'monitor_statistic_package_count_in': {
        path: '/service/monitorNetWork',
        method: 'post',
        partial: true,
      },
      // 获取监控数据-出包量
      // payload: {netWorkPackageDirection: 'transmit'}
      'monitor_statistic_package_count_out': {
        path: '/service/monitorNetWork',
        method: 'post',
        partial: true,
      },
      //获取监控数据-新生代GC次数
      'monitor_statistic_young_gc_count': {
        path: '/service/monitorYoungGcCount',
        method: 'post',
        partial: true,
      },
      //获取监控数据-新生代GC时间
      'monitor_statistic_young_gc_time': {
        path: '/service/monitorYoungGcTime',
        method: 'post',
        partial: true,
      },
      //获取监控数据-老生代GC次数
      'monitor_statistic_old_gc_count': {
        path: '/service/monitorOldGcCount',
        method: 'post',
        partial: true,
      },
      'monitor_statistic_old_gc_time': {
        path: '/service/monitorOldGcTime',
        method: 'post',
        partial: true,
      },

      /**镜像相关*/
      //获取镜像仓库列表
      'image_repo_list_by_group':{
        path: '/image/queryRepositoryByGroupTag',
        method:'post',
      },
      //获取镜像详情
      'image_version_list_by_repo':{
        path: '/image/queryImageTagByProjectAndRepository',
        method:'post',
        timeout: 130 * 1000
      },
      // 删除镜像标签
      'image_version_remove_label': {
        path: '/image/removeLabel',
        method: 'post'
      },
      'image_version_remove': {
        path: '/image/delete',
        method: 'post'
      },

      /** 域名相关*/
      // 获取当前组的所有一级域名（在服务管理和域名管理都被调用，存储到全局store中）
      'domain_level_1_list_all': {
        path: '/domain/queryDomainList',
        method: 'post'
      },
      // 域名-安全审核
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
      // 修改白名单
      'domain_update_white_ip': {
        path: '/domain/whiteList/{id}/update',
        method: 'put'
      },
      // 修改白名单
      'domain_delete_white_ip': {
        path: '/domain/whiteList/{id}/delete',
        method: 'delete'
      },
      // 获取白名单列表
      'domain_white_ip_list': {
        path: '/domain/whiteList/query',
        method: 'post'
      },

      /** API网关相关 */
      // 网关列表
      'gateway_list': {
        path: '/gateway/queryGatewayByAppIdAndSpaceId',
        method: 'post',
      },
      // 服务是否在运行
      'service_is_running': {
        path: '/gateway/checkRootPath',
        method: 'post',
        level: 'LEVEL_IGNORE'
      },
      // 创建网关相关参数
      'gateway_create_related': {
        path: '/gateway/getCreateApiInfo',
        method: 'get'
      },
      // 创建网关
      'gateway_create': {
        path: '/gateway/addGateway',
        method: 'post'
      },
      // 修改网关
      'gateway_update': {
        path: '/gateway/updateGateway',
        method: 'post'
      },
      // 删除网关
      'gateway_delete': {
        path: '/gateway/deleteGateway',
        method: 'post'
      },
      // 源IP限速
      'gateway_update_rate_limiting': {
        path: '/gateway/createOrUpdateSourceIPLimiting',
        method: 'post',
        partial: true
      },
      // 修改请求改写
      'gateway_update_path_rewrite': {
        path: '/gateway/createOrUpdatePathRewrite',
        method: 'post'
      },
      // 需改流量复制
      'gateway_update_copy_request': {
        path: '/gateway/createOrUpdateCopyRequest',
        method: 'post',
        level: 'LEVEL_IGNORE'
      },

      /**工单相关*/
      // 工单列表
      'work_order_list': {
        path: '/workOrderDeploy/getWorkOrderDeployList',
        method: 'post'
      },
	    // 工单列表下载
	    'work_order_download': {
		    path: '/workOrderDeploy/downloadWorkOrderDeployList',
		    method: 'post'
	    },
      // 创建工单
      'work_order_create': {
        path: '/workOrderDeploy/applyWordOrderDeploy',
        method: 'post'
      },
      // 修改工单
      'work_order_modify': {
        path: '/workOrderDeploy/againSendWorkOrderDeploy',
        method: 'post'
      },
      // 删除工单
      'work_order_remove': {
        path: '/workOrderDeploy/revoked',
        method: 'post'
      },
      // 待办工单列表
      'work_order_todo_list': {
        path: '/workOrderDeploy/getTodoWorkOrderListByUser',
        method: 'post'
      },
      // 部署工单中部署服务
      'work_order_service_deploy': {
        path: '/workOrderDeploy/deploy',
        method: 'post'
      },
      // 部署工单中重启服务
      'work_order_service_restart': {
        path: '/workOrderDeploy/quickDeployWorkOrder',
        method: 'post'
      },
      // 工单详情
      'work_order_detail': {
        path: '/workOrderDeploy/{id}/details',
        method: 'get'
      },
      'work_order_detail_download_test_log_get': {
        path: '/workOrderDeploy/downloadTestReport/{id}',
        method: 'get'
      },
      // 查询当前团队所有应用的工单处理状态
      'work_order_app_status': {
        path: '/workOrderDeploy/queryPendingOrdersByAppIdList',
        method: 'post',
        partial: false
      },
      // 强制撤销工单
      'work_order_cancel': {
        path: '/workOrderDeploy/endWorkOrderDeployById',
        method: 'post'
      },
      /** 中间件相关 */
      // 获取cluster列表
      'middleware_cluster': {
        path: '/middleware/queryOpenShiftCluster',
        method: 'get'
      },
      // 获取中间件列表
      'middleware_middleware': {
        path: '/middleware/queryOpenShiftMiddleware',
        method: 'get'
      },
      // 获取中间件版本列表
      'middleware_middleware_version': {
        path: '/middleware/queryMiddlewareVersion',
        method: 'get'
      },
      // 获取配额信息
      'middleware_middleware_quota': {
        path: '/middleware/getOpenShiftQuota',
        method: 'post'
      },
      // 获取实例列表
      'middleware_middleware_instance_info_basic': {
        path: '/middleware/queryMiddlewareRuntime',
        method: 'post'
      },
      'middleware_middleware_instance_info_maria': {
        path: '/middleware/getMiddlewareMariaDBServer',
        method: 'post'
      },
      // 获取更多实例信息 TODO: not used
      'middleware_middleware_instance_info_detail': {
        path: '/middleware/getMiddlewareStatus',
        method: 'post'
      },
      // 获取实例更多信息
      'middleware_mariadb_instance_more_info': {
        path: '/middleware/getMiddlewareMariaDBStatus',
        method: 'post'
      },
      // 修改实例信息（CPU, 内存）
      'middleware_mariadb_instance_update': {
        path: '/middleware/updateMiddlewareMariaDB',
        method: 'post'
      },
      // 获取mairadb的my.cnf
      'middleware_mariadb_get_my_cnf': {
        path: '/middleware/getMariaMyCnf',
        method: 'post'
      },
      // 修改mairadb的my.cnf
      'middleware_mariadb_update_my_cnf': {
        path: '/middleware/updateMariaMyCnf',
        method: 'post'
      },
      // 修改实例信息（其它基本信息）
      'middleware_mariadb_instance_update_config': {
        path: '/middleware/editMiddlewareMariaDB',
        method: 'post'
      },
      // 删除mariadb实例
      'middleware_mariadb_instance_delete': {
        path: '/middleware/deleteMiddleware',
        method: 'post'
      },
      // 启动mariadb实例
      'middleware_mariadb_instance_start': {
        path: '/middleware/startMiddlewareInstance',
        method: 'post'
      },
      // 停止mariadb实例
      'middleware_mariadb_instance_stop': {
        path: '/middleware/stopMiddlewareInstance',
        method: 'post'
      },
      // 创建mariadb实例
      'middleware_mariadb_instance_create': {
        path: '/middleware/createMiddlewareMariaDB',
        method: 'post'
      },
      // 获取backup列表
      'middleware_mariadb_backup_list': {
        path: '/middleware/queryMiddlewareMariaDBBackup',
        method: 'post'
      },
	    'middleware_mariadb_backup_list_by_namespace': {
		    path: '/middleware/queryMiddlewareMariaDBBackupByNamespace',
		    method: 'post'
	    },
      // 获取backup恢复历史
      'middleware_mariadb_backup_recovery_list': {
        path: '/middleware/queryMiddlewareMariaDBRestore',
        method: 'post'
      },
      // 创建备份
      'middleware_mariadb_backup_create': {
        path: '/middleware/createMiddlewareMariaDBBackup',
        method: 'post',
        level: 'LEVEL_IGNORE'
      },
      // 删除备份
      'middleware_mariadb_backup_delete': {
        path: '/middleware/deleteMiddlewareMariaDBBackup',
        method: 'post'
      },
      // 恢复备份
      'middleware_mariadb_backup_restore': {
        path: '/middleware/createMiddlewareMariaDBRestore',
        method: 'post'
      },
      // 创建redis实例
      'middleware_redis_instance_create': {
        path: '/middleware/createMiddlewareRedis',
        method: 'post'
      },
      // 删除redis实例
      'middleware_redis_instance_delete': {
        path: '/middleware/deleteMiddlewareRedis',
        method: 'post'
      },
      // redis实例更多信息
      'middleware_redis_instance_info_more': {
        path: '/middleware/getMiddlewareRedisStatus',
        method: 'post'
      },
      // 更改redis使用内存信息（openshift部分）
      'middleware_redis_update_memory': {
        path: '/middleware/updateMiddlewareRedis',
        method: 'post'
      },
      // 更改redis配置（数据库配置部分）
      'middleware_redis_update_config': {
        path: '/middleware/editMiddlewareRedis',
        method: 'post'
      },
      //服务详情中获取中间件的状态信息
      'middleware_service_relation': {
        path: '/service/queryServiceRelation',
        method: 'post',
        partial: true,
        level: 'LEVEL_WARNING',
        errObj: {
          title: '请求超时',
          message: '因访问数量过多/响应数据量过大，请您稍后再试！',
          type: 'error'
        }
      },

      /** pipeline相关*/
      // 查询pipieline相关信息
      'pipeline_stage_query': {
        path: '/pipeline/query',
        method: 'get'
      },
      //查询构建参数
      'pipeline_query_build_param': {
        path: '/pipeline/queryBuildParam',
        method: 'get'
      },
      // 创建或更新pipeline
      'pipeline_add_or_update': {
        path: '/pipeline/createOrUpdate',
        method: 'post'
      },
      // 保存（更新）pipeline并生效
      'pipeline_take_effect': {
        path: '/pipeline/apply',
        method: 'post'
      },
      // 删除pipeline
      'pipeline_delete': {
        path: '/pipeline/delete/{appId}',
        method: 'post'
      },
      // pipeline生效
      'pipeline_enable': {
        path: '/pipeline/enable',
        method: 'post'
      },
      // 获取pipeline列表
      'pipeline_list': {
        path: '/pipeline/get/list',
        method: 'post'
      },
      // pipeline构建列表
      'pipeline_build_list': {
        // path: '/pipeline/queryBuildList/{appId}',
        path: '/pipeline/build/history/list/{appId}',
        method: 'get'
      },
      // pipeline构建中的信息列表（可查询正在构建的信息）
      'pipeline_in_building': {
        // path: '/pipeline/runsPipeline/{appId}',
        path: '/pipeline/build/running/list/{appId}',
        method: 'get',
        partial: true
      },
      // 开始构建pipeline
      'pipeline_record_restart': {
        path: '/pipeline/execute/{appId}',
        method: 'post'
      },
      // 停止构建pipeline
      'pipeline_record_stop': {
        path: '/pipeline/stop/{appId}',
        method: 'post'
      },
      // 获取构建历史日志
      'pipeline_record_build_history': {
        path: '/pipeline/build/end/log',
        method: 'post'
      },
      // 下载构建日志
      'pipeline_record_build_history_download': {
        path: '/pipeline/download/build/log/{appId}',
        method: 'post',
        timeout: 0
      },
      // 获取正在构建中的日志
      'pipeline_record_building_log': {
        path: '/pipeline/building/log',
        method: 'post'
      },
      // 等待用户确认，query: {inputUrl}参数决定继续还是取消
      'pipeline_user_input_check': {
        path: '/pipeline/execute/input',
        method: 'post',
      },
      // 校验app是否能创建pipeline
      'pipeline_build_validate': {
        path: '/pipeline/validate/{appId}',
        method: 'post',
      },
      'pipeline_service_info_update': {
        path: '/pipeline/latest/application/config/{appId}',
        method: 'get'
      },
      /** 授权相关 */
      'uaa_get_by_group':{
        path: '/application/authorization/list',
        method: 'post'
      },
      'oauth_get_by_uaa': {
        path: '/application/authorization/{uaaId}/oauth',
        method: 'get'
      },
      // 标记消息为已读
      'message_mark_read': {
        path: '/message/update/status',
        method: 'post'
      },
      //获取blue ocean stage列表
      'pipeline_blue_ocean_stage_list': {
        path: '/pipeline/query/blueOcean/stage/{appId}',
        method: 'get',
        partial: true,
      },
      //获取blue ocean stage step 列表
      'pipeline_blue_ocean_stage_step_list': {
        path: '/pipeline/query/blueOcean/stage/steps/{appId}',
        method: 'get',
        partial: true,
      },
      //获取blue ocean stage step log
      'pipeline_blue_ocean_stage_step_log': {
        path: '/pipeline/query/blueOcean/stage/step/log',
        method: 'get'
      }
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

    // 如果父类已经存在URL_LIST，则合并父类中的URL_LIST
    if (this.URL_LIST) {
      this.URL_LIST = Object.assign(this.URL_LIST, PAAS_URL_LIST, CDN_URL_LIST);
    } else {
      this.URL_LIST = Object.assign(PAAS_URL_LIST, CDN_URL_LIST);
    }
  }

  // called at config/vue
  setVue(Vue) {
    this.$storeHelper = Vue.prototype.$storeHelper;
    this.$utils = Vue.prototype.$utils;
  }

  showLog(func, data) {
    debug('%s, %o', func, data);
  }

  logout() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.logout.url).then(res => {
        if ('data' in res) {
          let data = res.data;
          if (0 === data.code) {
            let msg = null;
            if (data.hasOwnProperty('msg')) {
              msg = data.msg;
            }
            resolve(msg);
          } else {
            reject({
              title: '退出失败',
              msg: '服务器错误！'
            });
          }
        } else {
          reject({
            title: '退出失败',
            msg: '服务器错误！'
          });
        }
      }).catch(err => {
        reject(this.getMsgFromErrorResponse(err));
      });
    })
  }

  // 获取Lob列表
  getLobInfo() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.get_lob_list.url).then(res => {
        let content = this.getResponseContent(res);
        let lobList = [];
        if(content && content.hasOwnProperty('lobList')){
          lobList = content['lobList'];
        }
        resolve({
          lobList
        });
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.get_lob_list.path};${err.toString()}`
        });
      })
    });
  }

  getUsersInGroup(data) {
      return new Promise((resolve, reject) => {
          axios.post(URL_LIST.users_in_group.url, data).then(response => {
              let content = this.getResponseContent(response);
              if (content && content.hasOwnProperty('groupUserList')) {
                  let userList = content['groupUserList'];
                  // add prop jobs to each user
                  userList.forEach(user => {
                      if (user.hasOwnProperty('jobName') && user.hasOwnProperty('jobDescription')) {
                          let names = user['jobName'].split(',');
                          let descriptions = user['jobDescription'].split(',');
                          user.jobNames = names;
                          user.jobDescriptions = descriptions;
                          if (names.length === descriptions.length) {
                              user.jobs = [];
                              names.forEach((it, index) => {
                                  user.jobs.push({
                                      name: it,
                                      desc: descriptions[index]
                                  })
                              });
                          } else {
                              console.log('length of name and description is different');
                          }
                      } else {
                          console.log('jobName or jobDescription is not found!');
                      }
                  });
                  resolve(userList);
              } else {
                  reject([]);
              }
          }).catch(err => {
              console.log(err);
              reject(err);
          })
      })
  }

  //通过lob获取scrum列表
  getScrumByLobId(options) {
    return new Promise((resolve, reject) => {
      let queryString = URL_LIST.get_scrum_list_by_lob.url + "?lobId=" + options["lobId"];
      axios.get(queryString).then(res => {
        let content = this.getResponseContent2(res);
        let scrumList = [];
        if(content && content.hasOwnProperty('scrumList')){
          scrumList = content['scrumList'];
        }
        resolve({
          scrumList
        });
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.get_scrum_list_by_lob.path};${err.toString()}`
        });
      })
    });
  }

  /** request appInfoList*/
  async requestAppInfoListOfGroup(groupId) {
    var resData = await this.requestPaasServer(this.URL_LIST.app_list_by_group, {
      payload: {
        groupId: groupId
      }
    });
    const appInfoListOfGroup = await this.parseAppListV2(resData);
    return appInfoListOfGroup;
  }

  /**
   * 解析应用列表数据
   * @param resContent
   * @returns {Promise.<*>}
   */
  async parseAppListV2(resData) {
    const result = {
      total: 0,
      data: [],
      appList: [],
      appModelList: []
    };

    if (!resData.hasOwnProperty('data') || !Array.isArray(resData['data']) || !resData.hasOwnProperty('recordsTotal')) {
      return result;
    }
    result.total = resData['recordsTotal'];
    result.data = resData['data'];
    result.appList = resData['data'].map(app => {
      var formattedCreateTime = this.$utils.formatDate(app.createTime, 'yyyy-MM-dd hh:mm:ss');
      if (formattedCreateTime) {
        formattedCreateTime = formattedCreateTime.split(' ');
      }
      const language = {
        version: app.languageVersion,
        type: app.language,
        get name() {
          var name = '';
          switch (this.type) {
            case 'JAVA':
              name = 'java';
              break;
            case 'NODE_JS':
              name = 'nodejs';
              break;
            case 'PYTHON':
              name = 'python';
              break;
            case 'PHP':
              name = 'php';
              break;
          }
          return name;
        }
      };
      return {
        appId: app.id,
        appName: app.appName,
        projectName: app.tag,
        serviceName: app.serviceName,
        userName: app.userName,
        creator: app.creator,
        maintainer: app.maintainer,
        maintainerId: app.maintainerId,
        maintainerList: app.maintainerList,
        formattedCreateTime,
        createTime: app.createTime,
        language,
        packageType: app.packageType,
        lobId: app.lobId,
        scrumId: app.scrumId,
        description:app.description
      }
    });
    result.appModelList = result.appList.map(app => {
      var result = {};
      ['appId', 'appName', 'projectName', 'serviceName', 'creator', 'maintainer', 'maintainerId', 'maintainerList', 'userName', 'formattedCreateTime', 'createTime', 'language', 'packageType', 'lobId', 'scrumId','description'].forEach(key => {
        result[key] = app[key];
      });
      return result;
    });
    return result;
  }
  /**
   * 获取创建APP时的相关信息
   * 1. 相关语言
   * 2. cpu memory对应关系
   */
  parseConfigList(resContent) {
    if (resContent && resContent.hasOwnProperty('LanguageList')) {
      resContent['LanguageList'].forEach(it => {
        let language = it.language;
        // add property type which will be send to server
        // change the style of language
        // it.type = language;
        switch (language) {
          case 'JAVA':
            it.languageDesc = 'Java';
            break;
          case 'NODE_JS':
            it.languageDesc = 'NodeJS';
            break;
          case 'PYTHON':
            it.languageDesc = 'Python';
            break;
        }
        if (it.hasOwnProperty('languageVersionList')) {
          let languageVersionList = it['languageVersionList'];
          // console.log(languageVersionList);
          Array.isArray(languageVersionList) && languageVersionList.forEach(version => {
            // console.log(version.packageTypeList);
            version.packageTypeList = version.packageTypeList.map(packageType => {
              return {
                type: packageType,
                packageType: packageType.replace('_', '.')
              }
            });
          });
        }
      });
      resContent['healthCheckList'] = Object.keys(resContent['healthCheckList']).map(key => {
        let desc = '', contentDesc = '';
        switch (key) {
          case '0':
            desc = 'http';
            contentDesc = '路径';
            break;
          case '1':
            desc = 'shell';
            contentDesc = '脚本';
            break;
          case '2':
            desc = 'socket';
            contentDesc = '端口号';
            break;
        }
        return {
          key, desc, contentDesc,
          label: resContent['healthCheckList'][key]
        };
      });
      // rename spaceList to profileList(prop spaceList should be deleted, or it will be stored in localStorage)
      resContent['profileList'] = resContent['spaceList'];
      delete resContent['spaceList'];
    }
    return resContent;
  }


  /**
   * 获取当前组的所有用户
   * @param options
   * @returns {Promise}
   */
  getUsersAll() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.users_all.url).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('userList')) {
          resolve(content.userList);
        } else {
          reject();
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  /**
   * 修改应用名称/运行环境
   * @param prop
   * @param options
   * @returns {Promise}
   */
  appUpdate(prop, options) {
    let urlMap = {
      appName: URL_LIST.app_change_name,
      profileNames: URL_LIST.app_change_profile,
    };
    let urlDesc = urlMap[prop];
    if (!urlDesc) {
      return new Promise((resolve, reject) => {
        reject('url not found');
      })
    }
    return new Promise((resolve, reject) => {
      axios.post(urlDesc.url, options).then(response => {
        if ('data' in response) {
          let data = response.data;
          if (0 === data.code) {
            let msg = data.msg ? data.msg : '修改成功';
            resolve(msg);
          } else {
            reject({
              title: '修改失败',
              msg: data.msg
            });
          }
        }
      }).catch(err => {
        // console.log(err);
        reject({
          title: '网络请求错误',
          msg: `请求路径：${urlDesc.path}；${err.toString()}`
        });
      });
    });
  }

  getObjHealthCheck() {
    return {
      _type: '',
      _content: {
        http: '',
        shell: '',
        socket: '8080',
      },
      _initialDelay: 120,
      _periodSeconds: 5,
      _failureThreshold: 5,
      _timeoutSeconds: 10,

      set type(type) {
        this._type = type;
      },
      get type() {
        return this._type
      },
      set content(value) {
        if (['http', 'shell', 'socket'].indexOf(this._type) > -1) {
          this._content[this._type] = value;
        }
      },
      get content() {
        return this._content[this._type];
      },
      get contentDesc() {
        var _contentDesc = '';
        switch (this.type) {
          case 'http':
            _contentDesc = '路径';
            break;
          case 'shell':
            _contentDesc = '脚本';
            break;
          case 'socket':
            _contentDesc = '端口';
            break;
        }
        return _contentDesc;
      },
      // contentCheckErrMsg具有watcher的属性
      get contentCheckErrMsg() {
        var errMsg = '';
        switch (this.type) {
          case 'http':
            const regForHttp = /^\/[A-Za-z0-9_\-\.\/]{1,99}$/;
            if (!regForHttp.exec(this.content)) {
              errMsg = '以/开头，可以包含字母、数字、下划线、中划线。2-100个字符';
            }
            break;
          case 'shell':
            if (this.content.trim().length === 0) {
              errMsg = '健康检查不能为空';
            }
            break;
          case 'socket':
            break;
        }
        return errMsg;
      },
      set initialDelay(value) {
        this._initialDelay = value
      },
      get initialDelay() {
        return this._initialDelay
      },
      set timeoutSeconds(value) {
        this._timeoutSeconds = value
      },
      get timeoutSeconds() {
        return this._timeoutSeconds
      },
      set failureThreshold(value) {
        this._failureThreshold = value
      },
      get failureThreshold() {
        return this._failureThreshold
      },
      set periodSeconds(value) {
        this._periodSeconds = value
      },
      get periodSeconds() {
        return this._periodSeconds
      }
    }
  }

  /**
   * get service model, as there are many useless prop in net data
   * @param resContent
   * @returns resContent
   */
  getServiceModel(service) {
    const item = {
      /** used for update prop */
      oneApm: service.oneapm,
      appMonitor: service.appMonitor,
      environments: JSON.parse(JSON.stringify(service.environments)),
      hosts: JSON.parse(JSON.stringify(service.hosts)),
      prestopCommand: service.prestopCommand,
      terminationGracePeriodSeconds:service.terminationGracePeriodSeconds,
      rollingUpdate: service.rollingUpdate,
      loadBalance: service.loadBalance,
      gitLabAddress: service.gitLabAddress,
      gitLabBranch: service.gitLabBranch,
      mainClass: service.mainClass,
      relativePath: service.relativePath,
      mavenProfileId: service.mavenProfileId,
      // fileLocation: service.fileLocation ? service.fileLocation : [],
      vmOptions: service.vmOptions,
      instanceNum: service.instanceNum,
      serviceVersion: service.serviceVersion,
      volume: service.volume,
      subPath: service.subPath,
      configServiceName: service.configServiceName,
      claimName: service.claimName,
      enableJacoco: !!service.enableJacoco,
    };

    /** copy prop */
    ['id', 'appId', 'spaceId', 'orchId', 'orchIp', 'intranetDomain', 'intranetDomainList', 'internetDomainList', 'updateTime',
      'containerStatus', // 运行状态：几个实例；几个运行中实例
      'defaultSelect', // 是否是默认服务
      'k8s', // 是否是k8s应用
      'isCanaryDeploy', // 是否有灰度服务
    ].forEach(prop => {
      service.hasOwnProperty(prop) && (item[prop] = service[prop]);
    });
    // set value '---' if null
    ['appName', 'tag',
      'serviceName'
    ].forEach(prop => {
      service.hasOwnProperty(prop) && (item[prop] = service[prop] ? service[prop] : '---');
    });
    item.formattedCreateTime = service.createTime ? this.$utils.formatDate(service.createTime, 'yyyy-MM-dd hh:mm:ss').split(' ') : '---';
    item['remainExpiredDays'] = service['remainExpiredDays']  ? parseInt(service['remainExpiredDays']) : 0;

    // props check for service model
    if (item['containerStatus']) {
      item.instanceCount = `${item['containerStatus'].Running}/${item['containerStatus'].Total}`;
    } else {
      item.instanceCount = '---';
    }

    item.image = {
      customImage: null == service.customImage ? false : service.customImage,
      typeName: appInfoHelper.getImageNameById(service.customImage),
      location: service.image,
    };

    // wrap cpuId and cpu to cpuInfo
    // cpu and memory from server is value, such as 2.0/4096
    // so get cpu and memory info by cpuAndMemoryInfo.
    if (service.cpuId && service.memoryId) {
      item.cpuInfo = {
        id: service.cpuId,
        size: service.cpu
      };
      item.memoryInfo = {
        id: service.memoryId,
        size: service.memory / 1024
      };
    } else {
      const cpuAndMemoryInfo = this.$storeHelper.getCPUAndMemoryInfoBySize(service.cpu, service.memory);
      item.cpuInfo = cpuAndMemoryInfo[0];
      item.memoryInfo = cpuAndMemoryInfo[1];
    }

    const language = {
      version: service.languageVersion,
      type: service.language,
      get name() {
        var name = '';
        switch (this.type) {
          case 'JAVA':
            name = 'java';
            break;
          case 'NODE_JS':
            name = 'nodejs';
            break;
          case 'PYTHON':
            name = 'python';
            break;
          case 'PHP':
            name = 'php';
            break;
        }
        return name;
      }
    };
    item.language = language;

    item.isJavaLanguage = language.type === 'JAVA';
    item.isPythonLanguage = language.type === 'PYTHON';

    // 更新healthCheck格式
    const healthCheck = this.getObjHealthCheck();
    healthCheck.type = this.$storeHelper.getHealthCheckTypeDescByKey(service.healthCheckType);
    healthCheck.content = service.healthCheck;
    healthCheck.initialDelay = service.hasOwnProperty('initialDelaySeconds') ? service['initialDelaySeconds'] : 120;
    healthCheck.periodSeconds = service.hasOwnProperty('periodSeconds') ? service['periodSeconds'] : 5;
    healthCheck.failureThreshold = service.hasOwnProperty('failureThreshold') ? service['failureThreshold'] : 5;
    healthCheck.timeoutSeconds = service.hasOwnProperty('timeoutSeconds') ? service['timeoutSeconds'] : 10;
    item.healthCheck = healthCheck;

    const portMap = {
      id: null,
      protocol: 'TCP',
      outerPort: '',
      containerPort: '',
      action: '',
      get exist() {
        return this.outerPort && this.containerPort;
      }
    };
    // 更新portMap格式
    if (service.portsMapping && service.portsMapping.length > 0) {
      portMap.id = service.portsMapping[0].id;
      portMap.protocol = service.portsMapping[0].protocol;
      portMap.outerPort = service.portsMapping[0].outerPort;
      portMap.containerPort = service.portsMapping[0].containerPort;
      portMap.action = service.portsMapping[0].action;
    }
    item.portMap = portMap;

    const packageInfo = {
      _type: '',
      _name: '',
      set type(value) {
        if (value !== 'WAR') {
          this._name = '';
        }
        this._type = value;
      },
      get type() {
        return this._type;
      },
      set name(value) {
        this._name = value;
      },
      get name() {
        if (this._type == 'WAR') {
          return this._name;
        } else {
          return '';
        }
      },
      get needSetName() {
        return this._type == 'WAR';
      }
    };
    packageInfo.type = service.packageType;
    packageInfo.name = service.buildName;
    item.packageInfo = packageInfo;
    // modelList.push(item);

    if (item['containerStatus']) {
      item.applicationServiceStatus = `${item.containerStatus.Running}/${item.containerStatus.Total}`;
    }
    return item;
  }

  // TODO: can be replace by $net.getServiceByAppIdAndSpaceId
  // 根据appId和spaceId，得到对应服务
  async getServiceByAppIdAndSpaceId(appId, profileId) {
    const resContent = await this.requestPaasServer(this.URL_LIST.service_list_by_app_and_profile, {
      payload: {
        appId: appId,
        spaceId: profileId
      }
    });
    if (!resContent.hasOwnProperty('applicationServerList') && !Array.isArray(resContent['applicationServerList'])) {
      throw new Error('数据格式不正确');
    }
    if (resContent['applicationServerList'].length === 0) {
      throw new Error('服务尚未创建');
    }
    const serviceModel = this.getServiceModel(resContent['applicationServerList'][0]);
    serviceModel.profileId = profileId;
    return serviceModel;
  }

  /**
   * 端口映射：检测端口是否被占用
   * @param payload: {appId, spaceId， outerPort}
   * @param cb
   */
  getDebounce4CheckPortMap() {
    const checkPortMap = (payload, cb) => {
      this.getResponse(this.URL_LIST.service_port_map_check, {
        payload
      }).then(res => {
        let errMsgForPortMap = '';
        if (!this.isResponseSuccess(res.data)) {
          errMsgForPortMap = res.data.msg;
        }
        cb(null, errMsgForPortMap);
      }).catch(err => {
        cb(err);
      });
    };
    const func = this.$utils.debounce(checkPortMap.bind(this), 1500, false);
    return (payload, cb) => {
      func(payload, cb);
    }
  }


  // 切换默认服务版本
  changeDefaultService(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_change_default.url, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.service_change_default.path}；${err.toString()}`
        });
      })
    });
  }

  // 获取部署日志（轮询）
  serviceGetDeployLog(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_get_deploy_log.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
        } else {
          reject();
        }
      }).catch(err => {
        reject(err);
        console.log(err);
      })
    });
  }

  // TODO: not used
  serviceDelete(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_delete.url, options).then(response => {
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(JSON.stringify(err));
      })
    });
  }

  serviceUpdate(prop, payload) {
    const URL_LIST = this.URL_LIST;
    let urlMap = {
      'instanceNum': URL_LIST.service_update_instance_num,
      'healthCheck': URL_LIST.service_update_health,
      'image': URL_LIST.service_update_image,
      'gitLabAddress': URL_LIST.service_update_gitLab_address,
      'gitLabBranch': URL_LIST.service_update_gitLab_branch,
      'mainClass': URL_LIST.service_update_main_class,
      'relativePath': URL_LIST.service_update_relative_path,
      'mavenProfileId': URL_LIST.service_update_maven_profile_id,
      'cpuAndMemory': URL_LIST.service_update_cpu_and_memory,
      'rollingUpdate': URL_LIST.service_update_rolling_update,
      'loadBalance': URL_LIST.service_update_load_balance,
      'fileLocation': URL_LIST.service_update_file_location,
      'environments': URL_LIST.service_update_environment,
      'hosts': URL_LIST.service_update_host,
      'oneApm': URL_LIST.service_update_one_apm,
      'appMonitor': URL_LIST.service_update_app_monitor,
      'vmOptions': URL_LIST.service_update_vm_options,
      'prestopCommand': URL_LIST.service_update_prestop_command,
      'packageInfo': URL_LIST.service_update_package_info,
      'portMap': URL_LIST.service_update_port_map,
      'expiredDays': URL_LIST.service_expired_days_change,
      'internetDomain': URL_LIST.service_update_internet_domain
    };
    let url = urlMap[prop];
    if (!url) {
      return new Promise((resolve, reject) => {
        reject('url not found');
      });
    }
    return new Promise((resolve, reject) => {
      this.getResponse(url, {
        payload
      }).then(response => {
        const resData = response.data;
        if (this.isResponseSuccess(resData)) {
          resolve(resData.msg ? resData.msg : '修改成功');
        } else {
          reject(resData.msg);
        }
      }).catch(err => {
        reject(err.message);
      })
    })
  }

  /**
   * TODO: not used
   * 获取镜像列表相关信息
   * 1. autoImageList， 自动打镜像列表
   * 2. customEnvImageList, 自定义镜像-环境镜像列表
   * 3. privateAppList， 自定义镜像-私有镜像(项目列表)
   * @param options
   * @returns {Promise}
   */
  async getImageRelatedInfo(payload4AutoImageList, payload4CustomImageList, options4PrivateApp) {
    // 自动打镜像列表
    // return axios.post(this.URL_LIST.auto_image_list.url, options4Auto);
    // 自定义镜像-环境镜像
    // return axios.post(URL_LIST.custom_image_env_list.url, options4Env);
    // 自定义镜像-私有镜像(项目列表)
    // return axios.post(URL_LIST.custom_image_private_app_list.url, options4PrivateApp);
    const resContentList = await Promise.all([
      this.requestPaasServer(this.URL_LIST.auto_image_list, {
        payload: payload4AutoImageList
      }),
      this.requestPaasServer(this.URL_LIST.custom_image_list, {
        payload: payload4CustomImageList
      }),
    ]);
    // console.log(resContentList);
    const autoImageList = resContentList[0]['basicImage'];
    const customImageList = resContentList[1];
    return {autoImageList, customImageList};
  }

  /**
   * 自定义镜像-私有镜像(项目的版本列表)
   * @param options
   * @returns {Promise}
   */
  getVersionListOfAppInCustomImage(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.custom_image_private_version_list_of_app.url, options).then(response => {
        let versionList = this.getResponseContent(response);
        if (versionList.hasOwnProperty('customImage')) {
          resolve(versionList.customImage);
        } else {
          reject('not found versionList.customImage');
        }
      }).catch(err => {
        reject(err);
      })
    });
  }

  // 获取一级域名列表
  // TODO: not used
  getDomainLevel1ListByProfile(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_level_1_list.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('domainList')) {
          resolve(content['domainList']);
          this.showLog('getDomainLevel1ListByProfile', content['domainList']);
        } else {
          reject('获取一级域名列表失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 创建域名
  createDomain(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_add.url, options).then(response => {
        let content = this.getResponseContent2(response);
        if (content) {
          resolve(content);
          this.showLog('createDomain', content);
        } else {
          let resMsg = this.getResponseMsg2(response, {
            successMsg: '',
            errorMsg: '创建域名失败'
          });
          reject(resMsg);
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.domain_add.path}；${err.toString()}`
        });
      })
    })
  }
  // 删除域名
  removeDomain(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_remove.url, options).then(response => {
        let responseMsg = this.getResponseMsg(response, {
          successMsg: '',
          errorMsg: '删除域名失败'
        });
        if (responseMsg.success) {
          resolve(responseMsg);
        } else {
          reject(responseMsg);
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.domain_remove.path}；${err.toString()}`
        });
      })
    })
  }

  // 白名单中添加IP
  addWhiteIP(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_add_white_ip.url, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          if (!responseMsg.msg) {
            responseMsg.msg = '添加白名单成功！';
          }
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('白名单中添加IP失败');
      })
    });
  }
  // // 修改IP
  updateWhiteIP(options, whiteIPID) {
    let url = this.URL_LIST.domain_update_white_ip.url + whiteIPID + '/update';
    return new Promise((resolve, reject) => {
      axios.put(url, options).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          if (!responseMsg.msg) {
            responseMsg.msg = '修改白名单成功！';
          }
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('修改IP失败！');
      })
    });
  }

  // 删除所有白名单
  // domainDeleteAllWhiteIP(id) {
  //   let url = this.$utils.formatUrl(URL_LIST.domain_delete_all_white_ip.url, {id});
  //   return new Promise((resolve, reject) => {
  //     axios[URL_LIST.domain_delete_all_white_ip.method](url).then(response => {
  //       let resMsg = this.getResponseMsg2(response, {
  //         successMsg: '开启"一键开启全网访问"成功！',
  //         errorMsg: '开启"一键开启全网访问"失败！'
  //       });
  //       if (resMsg.success) {
  //         resolve(resMsg);
  //       } else {
  //         reject(resMsg);
  //       }
  //     }).catch(err => {
  //       reject({
  //         title: '网络请求错误',
  //         msg: `请求路径：${URL_LIST.domain_delete_all_white_ip.path}；${err.toString()}`
  //       });
  //     })
  //   })
  // }
  // 添加办公环境白名单
  // domainAddOfficeWhiteIP(id) {
  //   let url = this.$utils.formatUrl(URL_LIST.domain_add_office_ip_list.url, {id});
  //   return new Promise((resolve, reject) => {
  //     axios.post(url).then(response => {
  //       let resMsg = this.getResponseMsg2(response, {
  //         successMsg: '关闭"一键开启全网访问"成功！',
  //         errorMsg: '关闭"一键开启全网访问"失败！'
  //       });
  //       if (resMsg.success) {
  //         resolve(resMsg);
  //       } else {
  //         reject(resMsg);
  //       }
  //     }).catch(err => {
  //       reject({
  //         title: '网络请求错误',
  //         msg: `请求路径：${URL_LIST.domain_add_office_ip_list.path}；${err.toString()}`
  //       });
  //     })
  //   })
  // }

  //下载白名单模板
  downloadTemplateForWhiteIP() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.domain_download_white_ip_list_template.url).then(response => {
        resolve(response);
      }).catch(err => {
        console.log(err);
        reject('下载白名单模板失败！')
      })
    })
  }

  /**
   * 获取运行日志
   */
  getHistoryRunLog(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.log_run_log.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('rows')) {
         resolve(content.rows);
         this.showLog('getHistoryRunLog', content.rows);
        } else {
          reject('获取日志内容失败');
        }
      }).catch(err => {
        console.log(err);
        reject('获取日志网络请求失败');
      })
    })
  }

  /**
   * 获取历史部署日志
    */
  getHistoryDeployLog(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.log_deploy_log.url, options).then(response => {
        let content = this.getResponseContent(response);
        console.log(response);
        if (content && content.hasOwnProperty('deployLog')) {
          resolve(content.deployLog);
          // this.showLog('getHistoryDeployLog', content.deployLog);
        } else {
          reject('getHistoryDeployLog, not found deployLog');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  /**
   * TODO: not used
   * oauth相关，根据当前团队id获取可以绑定的目标团队列表?
   */
  // 获取绑定
  oAuthGetTargetGroupList(options) {
    let url = `${URL_LIST.oauth_get_target_group_list.url}?requestGroupId=${options.requestGroupId}`;
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        let content = this.getResponseContent(response);
        if (content && content.hasOwnProperty('targetGroupList')) {
          resolve(content['targetGroupList']);
        } else {
          reject('oAuthGetTargetGroupList, not found content');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 通过应用和运行环境获取AccessKey列表
  oAuthGetAccessKeyListByApp(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.oauth_access_key_list_by_app.url, options).then(response => {
        let resContent = this.getResponseContent2(response);
        if (resContent) {
          resolve(resContent);
        } else {
          let resMsg = this.getResponseMsg2(response, {
            successMsg: '',
            errorMsg: '获取clientId列表失败'
          });
          reject(resMsg);
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.oauth_access_key_list_by_app.path}；${err.toString()}`
        })
      })
    });
  }

  //删除access key
  oauthDeleteAccessKey(id, param) {
    return new Promise((resolve, reject) => {
      let url = this.$utils.formatUrl(URL_LIST.oauth_delete_access_key.url, {id});
      axios[URL_LIST.oauth_delete_access_key.method](url,{params:param}).then(response => {
        let resMsg = this.getResponseMsg(response);
        if (resMsg.success) {
          resolve(resMsg.msg);
        } else {
          reject(resMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 获取授权url列表
  oauthGetUrlPermissionList(id) {
    let url = this.$utils.formatUrl(URL_LIST.oauth_get_url_permission_list.url, {id});
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        let resContent = this.getResponseContent2(response);
        if (Array.isArray(resContent)) {
          resContent.forEach(it => {
            if (it && it.hasOwnProperty('oauthUrl')) {
              it.resource = it.oauthUrl;
            }
          });
          resolve(resContent);
        } else {
          reject({
            title: '数据格式不正确',
            msg: '获取授权URL列表失败'
          })
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.oauth_get_url_permission_list.path}；${err.toString()}`
        });
      })
    })
  }

  // 获取授权URL列表
  oauthGetAuthorizeUrlList(options) {
    let transfer = (it) => {
      if (it.authTime) {
        it.authTime = this.$utils.formatDate(it.authTime, 'yyyy-MM-dd hh:mm:ss');
      } else {
        it.authTime = '';
      }
      if (it.authTime) {
        it.authTime = it.authTime.split(' ');
      }
      if (null == it.produceEnv) {
        it.profileName = null;
      } else {
        if (true == it.produceEnv) {
          it.profileName = '生产环境';
        } else if (false == it.produceEnv) {
          it.profileName = '非生产环境';
        }
      }
      // set property enabled
      // ['REQUESTED', 'AUTHORIZED', 'INVALIDATED']
      if (it.detailList.length === 0 || it.status === 'REQUESTED') {
        it.enabled = null;
      } else {
        if (it.status === 'AUTHORIZED') {
          it.enabled = true;
        } else if (it.status === 'INVALIDATED') {
          it.enabled = false;
        }
      }
    };
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.oauth_get_authorize_url_list.url, options).then(response => {
        // debug('o', response);
        // console.log(response);
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('authRecordList')) {
            let authRecordList = content['authRecordList'];
            if (Array.isArray(authRecordList)) {
              authRecordList.forEach(transfer.bind(this));
            }
          }
          resolve(content);
        } else {
          reject('获取Access Key列表失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  oauthGetTargetAppList(groupID) {
    let url = this.$utils.formatUrl(URL_LIST.oauth_get_target_app_list.url, {id: groupID});
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('requestClientIdList')) {
            resolve(content['requestClientIdList']);
          } else {
            reject('获取被访问的ClientId列表失败！');
          }
        } else {
          reject('获取被访问的ClientId列表失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 修改授权URL
  oauthModifyAuthorizeList(id, options) {
    let url = this.$utils.formatUrl(URL_LIST.oauth_modify_authorize_url_list.url, {id: id});
    return new Promise((resolve, reject) => {
      axios[URL_LIST.oauth_modify_authorize_url_list.method](url, options).then(response => {
        let resMsg = this.getResponseMsg(response);
        if (resMsg.success) {
          resolve(resMsg.msg);
        } else {
          reject(resMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 添加url权限配置
  oauthAddUrlPermission(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.oauth_add_url_permission.url, options).then(response => {
        let resContent = this.getResponseContent2(response);
        if (resContent) {
          resolve(resContent);
        } else {
          let resMsg = this.getResponseMsg2(response, {
            successMsg: '',
            errorMsg: '配置权限失败'
          });
          reject(resMsg);
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.oauth_add_url_permission.path}；${err.toString()}`
        });
      })
    })
  }

  // 删除url权限配置
  oauthRemoveUrlPermission(id) {
    let url = this.$utils.formatUrl(URL_LIST.oauth_remove_url_permission.url, {id: id});
    return new Promise((resolve, reject) => {
      axios[URL_LIST.oauth_remove_url_permission.method](url).then(response => {
        let resContent = this.getResponseContent2(response);
        if (resContent) {
          resolve(resContent);
        } else {
          let resMsg = this.getResponseMsg2(response, {
            successMsg: '',
            errorMsg: '删除失败'
          });
          reject(resMsg);
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.oauth_remove_url_permission.path}；${err.toString()}`
        });
      })
    })
  }

  // 开启/禁用授权URL
  oauthToggleAuthorizeUrlEnable(id, options) {
    let url = this.$utils.formatUrl(URL_LIST.oauth_authorize_url_toggle_enable.url, {id: id});
    return new Promise((resolve, reject) => {
      axios.patch(url, options).then(response => {
        let resMsg = this.getResponseMsg(response);
        if (resMsg.success) {
          resolve(resMsg.msg);
        } else {
          reject(resMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  /**
   * 获取工单详情
   */
  getWorkOrderDetail_1(options) {
    const getFeatureList = () => {
      return axios.post(URL_LIST.work_order_detail_feature_list.url, options);
    };
    const getAppList = () => {
      return axios.post(URL_LIST.work_order_detail_app_list.url, options);
    };
    const getUserToDo = () => {
      return axios.post(URL_LIST.work_order_detail_user_todo.url, options);
    };
    const getUserAccepted = () => {
      return axios.post(URL_LIST.work_order_detail_user_accepted.url, options);
    };
    const getUserNotify = () => {
      return axios.post(URL_LIST.work_order_detail_notify_user.url, options);
    };
    const getOperationList = () => {
      return axios.post(URL_LIST.work_order_detail_operation_list.url, options);
    };
    const getEmailGroup = () => {
      return axios.post(URL_LIST.work_order_detail_email_group.url, options)
    };
    const getTestLog = () => {
      return axios.post(URL_LIST.work_order_detail_test_log_list.url, options);
    };
    let keyMap = {
      featureList: {
        functionType: {
          DEMAND: '需求',
          BUG: 'BUG'
        }
      },
      userAcceptedList: {
        status: {
          NO_HANDLE: '未处理',
          REJECT: '拒绝处理',
          HANDLEING: '处理中',
          PASS: '通过'
        }
      },
      operationList: {
        functionType: {
          'WORKORDER_APPLY': '工单申请',
          'WAIT_TEST': '等待测试',
          'TESTING': '测试受理中',
          'HANDLEING': '处理中',
          'WAIT_DBA': '等待DBA处理',
          'DBAING': 'DBA受理中',
          'WAIT_DEPLOY': '等待部署',
          'DEPLOYING': '部署受理中',
          'WAIT_ACCEPTANCE': '等待验收',
          'ACCEPTANCEING': '验收受理中',
          'END': '结束',
        }
      }
    }
    const transfer = (key1, key2, key3) => {
      let formatted = key3;
      if (keyMap.hasOwnProperty(key1) && keyMap[key1].hasOwnProperty(key2) && keyMap[key1][key2].hasOwnProperty(key3)) {
        formatted = keyMap[key1][key2][key3];
      }
      return formatted;
    }
    return new Promise((resolve, reject) => {
      axios.all([getFeatureList(), getAppList(), getUserToDo(), getUserAccepted(),
        getUserNotify(), getOperationList(), getEmailGroup(), getTestLog()])
        .then(axios.spread((featureList, appList, userToDo, userAcceptedList,
                            notifyUserList, operationList, emailGroup, testLogStatus) => {
          featureList = this.getResponseContent(featureList);
          appList = this.getResponseContent(appList);
          userToDo = this.getResponseContent(userToDo);
          userAcceptedList = this.getResponseContent(userAcceptedList);
          notifyUserList = this.getResponseContent(notifyUserList);
          operationList = this.getResponseContent(operationList);
          emailGroup = this.getResponseContent(emailGroup);
          testLogStatus = this.getResponseContent(testLogStatus);

          if (featureList.hasOwnProperty('WorkOrderDeployFunctionVO')) {
            featureList = featureList.WorkOrderDeployFunctionVO;
            Array.isArray(featureList) && featureList.forEach(it => {
              if (it.hasOwnProperty('functionType')) {
                it.functionType = transfer('featureList', 'functionType', it.functionType);
              }
            });
          }
          if (appList.hasOwnProperty('WorkOrderDeployAppVO')) {
            appList = appList.WorkOrderDeployAppVO;
          }
          if (userToDo.hasOwnProperty('todoUser')) {
            userToDo = userToDo.todoUser;
          }
          if (userAcceptedList.hasOwnProperty('acceptanceUserList')) {
            userAcceptedList = userAcceptedList.acceptanceUserList;
            Array.isArray(userAcceptedList) && userAcceptedList.forEach(it => {
              if (it.hasOwnProperty('status')) {
                it.status = transfer('userAcceptedList', 'status', it.status);
              }
            });
          }
          if (notifyUserList.hasOwnProperty('informUserList')) {
            notifyUserList = notifyUserList['informUserList'];
          }
          if (operationList.hasOwnProperty('WorkOrderDeployLogVO')) {
            operationList = operationList.WorkOrderDeployLogVO;
            Array.isArray(operationList) && operationList.forEach(it => {
              it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              if (it.hasOwnProperty('functionType')) {
                it.status = transfer('operationList', 'functionType', it.functionType);
              }
            });
          }
          if (emailGroup.hasOwnProperty('emailGroup')) {
            emailGroup = emailGroup['emailGroup'];
          }

          let testType = null;
          let testLogList = [];
          if (testLogStatus.hasOwnProperty('testType')) {
            testType = testLogStatus['testType'];
          }
          if (testLogStatus.hasOwnProperty('workOrderDeployTestReport')) {
            testLogList = testLogStatus.workOrderDeployTestReport;
            testLogList.forEach(it => {
              it.url = encodeURI(this.$utils.formatUrl(URL_LIST.work_order_detail_download_test_log_get.url, {
                id: it.id
              }));
            });
          }

          let results = {
            featureList: featureList,
            appList: appList,
            userToDo: userToDo,
            userAcceptedList: userAcceptedList,
            notifyUserList: notifyUserList,
            operationList: operationList,
            emailGroup: emailGroup,
            testType: testType,
            testLogList: testLogList
          };
          resolve(results);
        })).catch(err => {
          reject(err);
      })
    })
  }

  /**
   * TODO: not used
   * 下载工单测试报告-通过POST方法
   */
  workOrderPostDownloadTestReport(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_detail_download_test_log_post.url, options).then(response => {
        debug('%s, %o', 'workOrderDownloadTestReport', response);
      }).catch(err => {
        console.log(err);
        reject('创建工单失败！');
      })
    });
  }

  /**
   * 删除测试报告
   * @param id, 测试报告ID
   */
  workOrderRemoveTestReport(id) {
    const url = this.$utils.formatUrl(URL_LIST.work_order_delete_test_log.url, {id: id});
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        debug('%s, %o', 'workOrderRemoveTestReport', response);
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  // 工单-部署应用-拉取日志
  workOrderFetchDeployLog(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_fetch_deploy_log.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
        } else {
          reject();
        }
      }).catch(err => {
        reject(err);
        console.log(err);
      })
    });
  }

  checkBeforeHandleWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.check_before_handle_work_order.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('workOrderDeploy')) {
            resolve(content.workOrderDeploy);
          } else {
            reject('workOrderDeploy not found in content')
          }
        } else {
          let msg = this.getResponseMsg(response);
          if (!msg.success) {
            reject(msg.msg)
          }
        }
      });
    })
  }

  //处理工单
  handleWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_submit_handle.url, options).then(response => {
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('处理工单失败！');
      })
    })
  }
}

export default new Net();
