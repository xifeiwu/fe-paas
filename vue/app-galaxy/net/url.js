/**
 * Created by xifei.wu on 2017/11/30.
 */
var path = 'http://galaxy-web-server.galaxy.dev';
// var path = 'http://172.31.165.126:30333';
// var path = 'http://172.16.107.163:30333';
var path = 'http://172.16.49.141:30333';
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
  'get_service_by_appId_and_profile': path + '/server/queryByAppIdAndSpaceId',

  'service_deploy': path + '/server/deploy',
}

export default urlList;
