/**
 * Created by xifei.wu on 2017/11/30.
 */
var path = 'http://galaxy-web-server.galaxy.test';
// var path = 'http://172.31.165.126:30333';
var path = 'http://172.16.106.191:30333';
// var path = 'http://172.16.49.130:30333';
var urlList = {
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
  'get_service_by_appId_and_profile': path + '/service/queryByAppIdAndSpaceId',

  // 部署服务
  'service_deploy': path + '/service/deployApplicationService',
  'service_deploy_log': path + '/service/deploy/log',
  // 创建服务
  'service_create':  path + '/service/createApplicationService',
  // 删除服务
  'service_delete': path + '/service/deleteApplicationService',
  // 停止服务
  'service_stop': path + '/service/stopApplicationService',
  // 获取服务版本
  'service_version': path + '/service/queryApplicationServiceVersion',

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

  // 获取实例列表
  'instance_list': path + '/service/queryInstance',
};

export default urlList;
