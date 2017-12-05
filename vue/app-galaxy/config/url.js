/**
 * Created by xifei.wu on 2017/11/30.
 */
var path = 'http://172.16.49.141:30333';
var urlList = {
  'get_verify_code': path + '/createRandomImage',
  'login': path + '/login',
  'logout': path + '/userLogout',
  'app_test': path + '/app',
  'app_list': path + '/application/queryByPage',
  'user_info': path + '/group/queryByUser',
  'get_group_id': path + '/group/queryByUser',
}

export default urlList;
