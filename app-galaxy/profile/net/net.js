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
      // 当前用户禁用的权限
      'user_not_permitted': {
        path: '/user/roles/permissions?exclude=true',
        method: 'get'
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
      // 获取用户所在组列表
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
      /** 应用相关 */
      // 应用列表
      // 'app_list'
      // 创建应用
      'app_create': {
        path: '/application/create',
        method: 'post'
      },
      // 删除应用
      'app_delete': {
        path: '/application/delete',
        method: 'post'
      },

      /** 服务相关 */
      // 创建服务
      'service_create': {
        path: '/service/createApplicationService',
        method: 'post'
      },
      // 通过appID和profileID获取服务列表
      'service_list_by_app_and_profile': {
        path: '/service/queryByAppIdAndSpaceId',
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
      // 检测服务端口映射
      'service_port_map_check': {
        path: '/service/checkPortMapping',
        method: 'post'
      },
      // 获取自动打镜像类型列表
      'auto_image_list': {
        path: '/image/queryBasicImage',
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
        method: 'post'
      },
      // 驱逐实例
      'instance_replace': {
        path: '/service/deletePod',
        method: 'post'
      },

      /** 日志相关 */
      // 获取部署日志列表
      'log_deploy_list': {
        path: '/deployLog/getDeployLog',
        method: 'post'
      },

      /** 监控相关 */
      // 获取监控数据-CPU
      'monitor_statistic_cpu': {
        path: '/service/monitorCPUUsage',
        method: 'post'
      },
      // 获取监控数据-内存
      'monitor_statistic_memory': {
        path: '/service/monitorMemoryUsage',
        method: 'post'
      },
      // 获取监控数据-磁盘读
      'monitor_statistic_disk_read': {
        path: '/service/monitorFSReadBytes',
        method: 'post'
      },
      // 获取监控数据-磁盘写
      'monitor_statistic_disk_write': {
        path: '/service/monitorFSWriteBytes',
        method: 'post'
      },
      // 获取监控数据-网络in
      'monitor_statistic_net_in': {
        path: '/service/monitorNetworkInput',
        method: 'post'
      },
      // 获取监控数据-网络out
      'monitor_statistic_net_out': {
        path: '/service/monitorNetworkOutput',
        method: 'post'
      },
      // 获取监控数据-入包量
      // payload: {netWorkPackageDirection: 'receive'}
      'monitor_statistic_package_count_in': {
        path: '/service/monitorNetWork',
        method: 'post'
      },
      // 获取监控数据-出包量
      // payload: {netWorkPackageDirection: 'transmit'}
      'monitor_statistic_package_count_out': {
        path: '/service/monitorNetWork',
        method: 'post'
      },

      /** 域名相关*/
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
      /**工单相关*/
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

    if (this.URL_LIST) {
      this.URL_LIST = Object.assign(this.URL_LIST, PAAS_URL_LIST, CDN_URL_LIST);
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

  getPermissionMap() {
    // some permissionPath do not related to any url are list bellow
    return {
      // 创建应用
      '/2.x/app/create': 'app_create',
      // 更改运行环境
      '/2.x/app/update/space': 'app_change_profile',
      // 应用转让
      '/2.x/app/transfer': 'app_transfer',
      // 删除应用
      '/2.x/app/delete': 'app_delete',

      /** 服务相关 */
      // 创建服务
      '/2.x/service/create': 'service_create',
      // 切换默认服务版本
      '/2.x/service/update/defaultVersion': 'service_change_default',
      //  部署服务
      '/2.x/service/deploy': 'service_deploy',
      // 停止服务
      '/2.x/service/stop': 'service_stop',
      // 删除服务
      '/2.x/service/delete': 'service_delete',
      // 修改服务信息
      '/2.x/service/update': 'service_update',
      // 服务管理（服务列表） -> 外网域名
      '/2.x/service/update/DefaultInternetDomain': 'go-page-domain-from-service-list',
      // 服务管理（单个服务） -> 外网域名
      '/2.x/service/bindingInternetDomain': 'go-page-domain-from-service',
      // 服务管理 -> 日志/部署日志
      '/2.x/service/search/deployLog': 'go-to-page-log-deploy-from-service',

      /** 实例相关 */
      // 手动伸缩
      '/2.x/instances/autoChangeNum': 'instance_change_count',
      // 驱逐实例
      '/2.x/instances/delete': 'instance_replace',
      // 删除实例
      // '/2.x/instances/delete': '',
      // 实例管理 -> 终端
      '/2.x/instances/openTerminal': 'go-to-page-terminal-from-instance',
      // 实例管理 -> 监控
      '/2.x/instances/apm': 'go-to-page-monitor-from-instance',
      // 实例管理 -> 运行日志
      '/2.x/instances/searchLogs': 'go-to-log-run-from-instance',

      /** 外网域名 */
      // 创建外网域名
      '/2.x/internet/create': 'domain_add',
      // 绑定服务
      '/2.x/internet/binging': 'domain_bind_service',
      // 解绑服务
      '/2.x/internet/unbind': 'domain_unbind_service',
      // 安全审核
      '/2.x/internet/update': 'domain_secure_check',
      // 删除域名
      '/2.x/internet/delete': 'domain_remove',
      // 关联白名单
      '/2.x/internet/ipWhiteList': 'domain_bind_white_list',

      // 应用监控
      '/2.x/apm': 'app_monitor',
      // 应用转让
      '/2.x/app/transfer': 'app_transfer',
      // 更改服务信息
      '/2.x/service/update': 'service_update',
      // 查看实例监控
      '/2.x/instances/apm': 'instance_monitor',
      '/2.x/internet/create': 'domain_add',
      // 删除域名
      '/2.x/internet/delete': 'domain_remove',
      // 外网域名安全审核
      '/2.x/internet/update': 'domain_secure_check',

      /** oauth / accessKey相关 */
      // 创建accessKey
      '/2.x/keys/AccessKey/create': 'oauth_create_access_key',
      // 删除accessKey
      '/2.x/keys/AccessKey/delete': 'oauth_delete_access_key',
      // 修改访问配置
      '/2.x/keys/AccessKey/update': 'oauth_update_access_config',
      // 权限配置
      '/2.x/keys/AccessKey/oauth/list': 'oauth_set_permission',
      // 修改密钥
      '/2.x/keys/AccessKey/updateSecret': 'oauth_update_secret',
      /** oauth / 授权url相关 */
      // 授权URL
      '/2.x/keys/authUrl/auth': 'oauth_modify_authorize_url_list',
      // 禁用/开启
      '/2.x/keys/AccessKey/disable': 'oauth_authorize_url_toggle_enable',

      /** 工单相关 */
      // 工单列表 -> 日志/部署日志
      '/2.x/order/list/deployLog': 'go-to-page-log-deploy-from-work-order-list',
      // 工单详情
      // '/2.x/order/list/info': '',
      // 申请工单
      '/2.x/order/todoList/apply': 'work-order_create',
      // 待办/工单/部署应用
      '/2.x/order/todoList/deploy': 'work-order_deploy_service',

      /** 页面相关 */
      // 服务管理
      '/2.x/service': this.page['profile/service'],
      // 实例列表
      '/2.x/instances': this.page['profile/instance'],
      // 外网域名
      '/2.x/internet': this.page['profile/domain'],
      // 日志中心
      '/2.x/logs': this.page['profile/log'],
      // 日志中心/运行日志
      '/2.x/logs/searchLog': this.page['profile/log/run'],
      // 日志中心/部署日志
      '/2.x/logs/searchDeployLog': this.page['profile/log/deploy'],
      // 页面-Oauth/Access Key
      '/2.x/keys/AccessKey': this.page['profile/oauth/key'],
      // 页面-Oauth权限
      '/2.x/keys': this.page['profile/oauth'],
      // 页面-Oauth/url
      '/2.x/keys/authUrl': this.page['profile/oauth/url'],
      // 页面-审批管理页面
      '/2.x/orders': this.page['profile/work-order'],
      // 页面-审批管理/待办工单
      '/2.x/order/todoList': this.page['profile/work-order/todo'],
      // 页面-审批管理/工单列表
      '/2.x/order/list': this.page['profile/work-order/list'],
      // 应用监控
      '/2.x/apm': this.page['profile/monitor'],
      // 配置中心
      '/2.x/config/server': this.page['profile/config-server']
    };
  }
  /**
   * 解析用户权限
   * @param resContent
   * @returns {Array}
   */
  parseNotPermittedCommands(notPermittedList) {
    notPermittedList = notPermittedList.map(it => {
      it.hasOwnProperty('id') && delete it.id;
      it.hasOwnProperty('parentId') && delete it.parentId;
      it.hasOwnProperty('createTime') && delete it.createTime;
      it.hasOwnProperty('updateTime') && delete it.updateTime;
      it.hasOwnProperty('permissionType') && delete it.permissionType;
      return it;
    });
    // console.log(notPermittedList);

    // format of item in notPermittedList
    // {
    //   id: 110,
    //   name: "创建外网域名",
    //   parentId: 84,
    //   path: "/2.x/internet/create",
    //   permissionType: "BUTTON",
    //   url: "/domain/record/create",
    //   method: "POST",
    //   key: "domain_bind_white_list"
    // }
    const permissionMap = this.getPermissionMap();

    // add url and method by notPermittedList
    notPermittedList.forEach(it => {
      // check if permission in permissionMap first
      if (permissionMap.hasOwnProperty(it.path)) {
        it.key = permissionMap[it.path];
        notPermittedList.push(it);
      }
    });
    // console.log(notPermittedList);

    let result = notPermittedList.filter(it => {
      return it.hasOwnProperty('key') && it.key;
    }).map(it => {
      return it['key'];
    });

    // console.log(notPermittedList);
    // console.log(result);
    return result;
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

  //通过lob获取scrum列表
  getScrumByLobId(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.get_scrum_list_by_lob.url,options).then(res => {
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

  /**
   * 获取所有组列表
   * @returns {Promise}
   */
  getAllGroupList() {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.get_all_group_list.url).then(res => {
        let resContent = this.getResponseContent(res);
        if (resContent) {
          resolve(resContent);
        } else {
          reject('获取组列表信息失败！');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    })
  }

  /**
   * 解析应用列表数据
   * @param resContent
   * @returns {Promise.<*>}
   */
  async parseAppList(resContent) {
    const getAppModelList = (appList) => {
      let appModelList = [];
      appList.forEach(app => {
        appModelList.push({
          'appId': app.appId,
          'appName': app.appName,
          'profileNames':
            app.profileList ? app.profileList.filter(it => {
              return '' != it.name && '' != it.description
            }).map(it => {
              return it.name;
            }) : []
        })
      });
      return appModelList;
    };

    if (resContent.hasOwnProperty('appList') && Array.isArray(resContent.appList)) {
      let appList = resContent.appList;
      appList.forEach(app => {
        app.createTime = this.$utils.formatDate(app.createTime, 'yyyy-MM-dd hh:mm:ss');
        if (app.createTime) {
          app.createTime = app.createTime.split(' ');
        }
        app['profileNames'] = app['serviceCountList'].map(it => {
          return it['envName']
        });
        // app['profileList'] = this.$storeHelper.getProfileInfoListByNameList(app.spaceList);
        app['profileList'] = app['serviceCountList'].map(it => {
          const profileInfo = this.$storeHelper.getProfileInfoByName(it['envName']);
          return Object.assign(profileInfo, {
            serviceNameCount: it['serviceNameCount']
          });
        });
        if (app.hasOwnProperty('language')) {
          // whether the language of app is JAVA
          app['isJavaLanguage'] = app.hasOwnProperty('language') && 'JAVA' == app.language;
          app.languageLogo = null;
          switch (app.language) {
            case 'JAVA':
              app.languageLogo = 'java';
              break;
            case 'NODE_JS':
              app.languageLogo = 'nodejs';
              break;
            case 'PYTHON':
              app.languageLogo = 'python';
              break;
            case 'PHP':
              app.languageLogo = 'php';
              break;
          }
        }
      });
      resContent.appModelList = getAppModelList(appList);
    }
    return resContent;
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
      })
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

  /**
   * format the response content of service list
   * @param resContent
   * @returns resContent
   */
  parseServiceList(resContent) {
    // 从service中摘取有用信息并封装到特定的数据格式中（部分属性进行了重命名）
    const getServiceModelList = (serviceList) => {
      let modelList = [];
      Array.isArray(serviceList) && serviceList.forEach(service => {
        const item = {
          /** copy prop */
          language: service.language,
          /** used for update prop */
          oneApm: service.oneapm,
          appMonitor: service.appMonitor,
          environments: JSON.parse(JSON.stringify(service.environments)),
          hosts: JSON.parse(JSON.stringify(service.hosts)),
          cpuID: service.cpuInfo.id,
          memoryID: service.memoryInfo.id,
          prestopCommand: service.prestopCommand,
          // image: JSON.parse(JSON.stringify(service.image))
          customImage: service.image.customImage,
          imageLocation: service.image.location,
          rollingUpdate: service.rollingUpdate,
          loadBalance: service.loadBalance,
          gitLabAddress: service.gitLabAddress,
          gitLabBranch: service.gitLabBranch,
          mainClass: service.mainClass,
          relativePath: service.relativePath,
          mavenProfileId: service.mavenProfileId,
          fileLocation: service.fileLocation ? service.fileLocation : [],
          vmOptions: service.vmOptions,
          instanceNum: service.instanceNum,
        };
        // 更新healthCheck格式
        const healthCheck = {
          _type: '',
          _content: {
            http: '',
            shell: '',
            socket: '8080',
          },
          _contentDesc: '',
          _initialDelay: 120,

          set type(type) {
            this._type = type;
            switch (type) {
              case 'http':
                this._contentDesc = '路径';
                break;
              case 'shell':
                this._contentDesc = '脚本';
                break;
              case 'socket':
                this._contentDesc = '端口';
                break;
            }
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
            return this._contentDesc;
          },
          set initialDelay(type) {
            this._initialDelay = type
          },
          get initialDelay() {
            return this._initialDelay
          },
        };
        healthCheck.type = this.$storeHelper.getHealthCheckTypeDescByKey(service.healthCheckType);
        healthCheck.content = service.healthCheck;
        healthCheck.initialDelay = service.hasOwnProperty('initialDelaySeconds') ? service['initialDelaySeconds'] : 120;
        item.healthCheck = healthCheck;

        const portMap = {
          id: null,
          protocol: 'TCP',
          outerPort: '',
          containerPort: '',
          get exist() {
            return this.outerPort && this.containerPort;
          }
        };
        // 更新portMap格式
        if (service.portsMapping.length > 0) {
          portMap.id = service.portsMapping[0].id;
          portMap.protocol = service.portsMapping[0].protocol;
          portMap.outerPort = service.portsMapping[0].outerPort;
          portMap.containerPort = service.portsMapping[0].containerPort;
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
        modelList.push(item);
      });
      return modelList;
    };

    if (resContent.hasOwnProperty('applicationServerList')) {
      let serviceList = resContent['applicationServerList'];
      Array.isArray(serviceList) && serviceList.forEach(it => {
        it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');

        it.image = {
          customImage: null == it.customImage ? false : it.customImage,
          typeName: appInfoHelper.getImageNameById(it.customImage),
          location: it.image,
        };

        // cpu and memory from server is value, such as 2.0/4096
        // so get cpu and memory info by cpuAndMemoryInfo.
        let cpuAndMemoryInfo = this.$storeHelper.getCPUAndMemoryInfoBySize(it.cpu, it.memory);
        it.cpuInfo = cpuAndMemoryInfo[0];
        it.memoryInfo = cpuAndMemoryInfo[1];

        if (!it.volume) {
          it.volume = '';
        }
        it.volume = it.volume.split(',').filter(it => {return it})
        this.$utils.renameProperty(it, 'volume', 'fileLocation');

        // fix运行实例/总实例数
        if (it.hasOwnProperty('containerStatus') && it['containerStatus']) {
          let containerStatus = it['containerStatus'];
          it.applicationServiceStatus = `${containerStatus.Running}/${containerStatus.Total}`;
        }
        // ['mavenProfileId', 'healthCheck', 'loadBalance', 'relativePath'].forEach(prop => {
        //   if (it.hasOwnProperty(prop) && !it[prop]) {
        //     it[prop] = '未设置';
        //   }
        // })
        if (!it.hasOwnProperty('internetDomainList')) {
          it['internetDomainList'] = [];
        }
      });
      resContent.serviceModelList = getServiceModelList(serviceList);
    }
    return resContent;
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

  // stop service
  serviceStop(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_stop.url, options).then(response => {
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
        }
      }).catch(err => {
        console.log(err);
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
   * 获取服务版本号列表
   * @param options {appId, profileId}
   * @returns {Promise}
   */
  getServiceVersion(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.service_version.url, options).then(response => {
        if ('data' in response) {
          let data = response.data;
          if (0 === data.code) {
            let content = data.content ? data.content : {};
            this.showLog('getServiceVersion', content);
            resolve(content);
          } else {
            reject(data.msg);
          }
        }
        // resolve(response);
      }).catch(err => {
        reject(err);
      })
    })
  }

  /**
   * 获取镜像列表相关信息
   * 1. autoImageList， 自动打镜像列表
   * 2. customEnvImageList, 自定义镜像-环境镜像列表
   * 3. privateAppList， 自定义镜像-私有镜像(项目列表)
   * @param options
   * @returns {Promise}
   */
  async getImageRelatedInfo(options4Auto, options4Env, options4PrivateApp) {
    // 自动打镜像列表
    // return axios.post(this.URL_LIST.auto_image_list.url, options4Auto);
    // 自定义镜像-环境镜像
    // return axios.post(URL_LIST.custom_image_env_list.url, options4Env);
    // 自定义镜像-私有镜像(项目列表)
    // return axios.post(URL_LIST.custom_image_private_app_list.url, options4PrivateApp);

    const resContentList = await Promise.all([
      this.requestPaasServer(this.URL_LIST.auto_image_list, {
        payload: options4Auto
      })
    ]);
    const autoImageList = resContentList[0]['basicImage'];
    return autoImageList;
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
  // 获取当前组的所有一级域名
  getDomainLevel1Map(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_level_1_list_all.url, options).then(response => {
        let resContent = this.getResponseContent(response);
        if (resContent) {
          if (Object.keys(resContent).length > 0) {
            resolve(resContent);
          } else {
            reject({
              title: '数据格式不正确',
              msg: '一级域名列表为空'
            });
          }
        } else {
          let resMsg = this.getResponseMsg(response, {
            successMsg: '',
            errorMsg: '获取一级域名列表失败！'
          });
          reject(resMsg);
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.domain_level_1_list_all.path}；${err.toString()}`
        });
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
  // 获取域名列表
  getDomainList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_list.url, options).then(response => {
        let resContent = this.getResponseContent(response);
        if (resContent) {
          if (resContent.hasOwnProperty('internetDomainList')) {
            let domainList = resContent['internetDomainList'];
            domainList.forEach(it => {
              it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
            });
            resolve(resContent);
          } else {
            reject({
              title: '数据格式不正确',
              msg: '未找到internetDomainList'
            })
          }
        } else {
          let resMsg = this.getResponseMsg(response, {
            successMsg: '',
            errorMsg: '获取外网域名列表失败'
          });
          reject(resMsg);
        }
      }).catch(err => {
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.domain_list.path}；${err.toString()}`
        });
      })
    })
  }
  // 为域名绑定服务
  domainBindService(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_bind_service.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
          this.showLog('domainBindService', content);
        } else {
          reject(null);
        }
      }).catch(err => {
        console.log(err);
        reject('为域名绑定服务失败！');
      })
    });
  }
  // 为域名解绑服务
  domainUnBindService(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_unbind_service.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
          this.showLog('domainUnBindService', content);
        } else {
          reject(null);
        }
      }).catch(err => {
      })
    });
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
  // 修改IP
  updateWhiteIP(options, whiteIPID) {
    let url = URL_LIST.domain_update_white_ip.url + whiteIPID + '/update';
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
  // 删除IP
  deleteWhiteIP(whiteIPID) {
    let url = URL_LIST.domain_update_white_ip.url + whiteIPID + '/delete';
    return new Promise((resolve, reject) => {
      axios.delete(url).then(response => {
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          if (!responseMsg.msg) {
            responseMsg.msg = '删除成功！';
          }
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('删除IP失败！');
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
  // 获取白名单列表
  getWhiteIPList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.domain_white_ip_list.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
          this.showLog('getWhiteIPList', content);
        } else {
          reject(null);
        }
      }).catch(err => {
        console.log(err);
        reject('获取白名单列表');
      })
    });
  }
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
   * 获取历史console日志
   */
  getConsoleLog(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.log_console_log.url, options).then(response => {
        let content = this.getResponseContent2(response);
        resolve(content);
      }).catch(err => {
        reject(err);
      })
    })
  }

  /**
   * oauth相关
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

  // 创建Access Key
  oAuthCreateAccessKey(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.oauth_create_access_key.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          resolve(content);
        } else {
          reject('oAuthCreateAccessKey, not found content');
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
            errorMsg: '获取AccessKey列表失败'
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

  // 获取Access Key列表
  getAccessKeyList(options) {
    /**
     * transfer name of props
     * 我的应哟：requestApplicationName -> myApp
     * Access Key: clientId -> accessKey
     * produceEnv -> profileName
     * @param it
     */
    let transfer = function(it) {
      it.accessKey = it.clientId;
      it.myApp = it['applicationName'] ? it['applicationName'] : '未配置';
      // 访问应用状态信息
      it.appAccessStatus = '';
      if (null == it.produceEnv) {
        it.profileName = null;
      } else {
        if (true == it.produceEnv) {
          it.profileName = '生产环境';
        } else if (false == it.produceEnv) {
          it.profileName = '非生产环境';
        }
      }
      it.production = it.produceEnv;
      it.accessConfigList = it['requestApplicationInfoVOList'];
      if (it.accessConfigList.length > 0) {
        it.accessConfigDesc = it.accessConfigList.map(it => {
          return `${it.targetGroupName} - ${it.targetApplicationName}，${it.status}`;
        });
      } else {
        it.accessConfigDesc = [];
      }
      it.createTime =  this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
      if (it.createTime) {
        it.createTime = it.createTime.split(' ');
      }
    };
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.oauth_get_access_key_list.url, options).then(response => {
        // console.log(response);
        let resContent = this.getResponseContent(response);
        if (resContent) {
          if (resContent.hasOwnProperty('uaaList')) {
            let uaaList = resContent['uaaList'];
            if (Array.isArray(uaaList)) {
              uaaList.forEach(transfer.bind(this));
            }
            resolve(resContent);
          } else {
            reject({
              title: '数据格式不正确',
              msg: '未找到uaaList'
            });
          }
        } else {
          let resMsg = this.getResponseMsg(response, {
            successMsg: '',
            errorMsg: '获取数据失败'
          });
          reject(resMsg);
        }
      }).catch(err => {
        console.log(err);
        reject({
          title: '网络请求错误',
          msg: `请求路径：${URL_LIST.oauth_get_access_key_list.path}；${err.toString()}`
        });
      })
    })
  }

  // 修改secret
  oauthUpdateSecret(id, options) {
    return new Promise((resolve, reject) => {
      let url = this.$utils.formatUrl(URL_LIST.oauth_update_secret.url, {id});
      axios[URL_LIST.oauth_update_secret.method](url, options).then(response => {
        // console.log(response);
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

  //删除access key
  oauthDeleteAccessKey(id) {
    return new Promise((resolve, reject) => {
      let url = this.$utils.formatUrl(URL_LIST.oauth_delete_access_key.url, {id});
      axios[URL_LIST.oauth_delete_access_key.method](url).then(response => {
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

  // 添加访问配置
  oauthUpdateTargetApp(id, options) {
    return new Promise((resolve, reject) => {
      let url = this.$utils.formatUrl(URL_LIST.oauth_add_access_config.url, {id});
      axios[URL_LIST.oauth_add_access_config.method](url, options).then(response => {
        // console.log(response);
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
          if (content.hasOwnProperty('targetApplicationList')) {
            resolve(content['targetApplicationList']);
          } else {
            reject('获取被访问的应用列表失败！');
          }
        } else {
          reject('获取被访问的应用列表失败！');
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
   * 获取工单列表
   */
  getWorkOrderList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_list.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('workOrderDeployList') && Array.isArray(content.workOrderDeployList)) {
            content.workOrderDeployList.forEach(it => {
              if (it.hasOwnProperty('createTime')) {
               it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              }
            })
          }
          debug('%s, %o', 'getWorkOrderList', content);
          resolve(content);
          this.showLog('getWorkOrderList', content);
        } else {
          reject('error: getWorkOrderToDoList');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }
  /**
   * 获取待办工单列表
   */
  getWorkOrderToDoList(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_todo_list.url, options).then(response => {
        let content = this.getResponseContent(response);
        if (content) {
          if (content.hasOwnProperty('todoWorkOrderList') && Array.isArray(content.todoWorkOrderList)) {
            content.todoWorkOrderList.forEach(it => {
              if (it.hasOwnProperty('createTime')) {
                it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              }
            })
          }

          resolve(content);
          this.showLog('getWorkOrderToDoList', content);
        } else {
          reject('error: getWorkOrderToDoList');
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
  }

  /**
   * 检查是否有正在处理的工单
   * @param options: {appId:, serviceVersion:}
   * @returns {Promise}
   */
  checkWorkOrderHandling(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_in_handling.url, options).then(response => {
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

  // 创建工单
  createWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_create.url, options).then(response => {
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('创建工单失败！');
      })
    })
  }

  // 修改工单
  modifyWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_modify.url, options).then(response => {
        debug('%s, %o', 'modifyWorkOrder', response);
        console.log(response);
        let result = this.getResponseMsg(response);
        if (result.success) {
          resolve(result.msg);
        } else {
          reject(result.msg);
        }
      }).catch(err => {
        console.log(err);
        reject('创建工单失败！');
      })
    })
  }

  // 删除工单
  removeWorkOrder(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.work_order_remove.url, options).then(response => {
        // console.log(response);
        let responseMsg = this.getResponseMsg(response);
        if (responseMsg.success) {
          resolve(responseMsg.msg);
        } else {
          reject(responseMsg.msg);
        }
      }).catch(err => {
        reject('删除工单失败！')
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
