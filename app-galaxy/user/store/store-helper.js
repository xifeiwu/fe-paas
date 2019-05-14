import BaseHelper from 'assets/js/store/helper'
import store from './index';

class StoreHelper extends BaseHelper {
  constructor() {
    super(store);
  }

  set notPermitted(value) {
    this.setPermission({user: value})
  }

  get notPermitted() {
    let result = {};
    let permission = this.getPermission('user');
    if (Array.isArray(permission)) {
      permission.forEach(it => {
        result[it] = true;
      })
    }
    return result;
  }

  get screen() {
    return this.$store.getters['screen'];
  }

  get groupList() {
    return this.$store.getters['user/groupList'];
  }

  get operationList() {
    return [
      {
        operationName: 'FULL',
        operationNickName: '全部'
      },
      //应用相关
      {
        operationName: 'APPCREATE',
        operationNickName: '创建应用',
      },
      {
        operationName: 'APPDELETE',
        operationNickName: '删除应用',
      },
      {
        operationName: 'APPUPDATE',
        operationNickName: '修改应用',
      },
      //服务相关
      {
        operationName: 'CONFIGCREATE',
        operationNickName: '新增/修改服务',
      },
      {
        operationName: 'CONFIGDELETE',
        operationNickName: '删除服务',
      },
      {
        operationName: 'CONFIGDEPLOY',
        operationNickName: '部署/重启服务',
      },
      {
        operationName: 'CONFIGSTOP',
        operationNickName: '停止服务',
      },
      //实例相关
      {
        operationName: 'PODDELETE',
        operationNickName: '驱逐实例',
      },
      {
        operationName: 'CONFIGSCALE',
        operationNickName: '手动伸缩',
      },
      //外网域名相关
      {
        operationName: 'INTERNETDOMAINAPPLY',
        operationNickName: '申请外网域名',
      },
      {
        operationName: 'INTERNETDOMAINBIND',
        operationNickName: '绑定/解绑外网域名',
      },
      {
        operationName: 'INTERNETDOMAINDELETE',
        operationNickName: '删除外网域名',
      },
      {
        operationName: 'INTERNETDOMAINWHITEIPADD',
        operationNickName: '关联IP白名单-添加',
      },
      {
        operationName: 'INTERNETDOMAINWHITEIPUPDATE',
        operationNickName: '关联IP白名单-修改',
      },
      {
        operationName: 'INTERNETDOMAINSECURITYCHECK',
        operationNickName: '外网域名安全审核',
      },
      //配置中心相关
      {
        operationName: 'GITLABCONFIGDIRCREATE',
        operationNickName: '添加配置中心目录',
      },
      {
        operationName: 'GITLABCONFIGFILEADD',
        operationNickName: '添加配置中心文件',
      },
      {
        operationName: 'GITLABCONFIGFILEUPDATE',
        operationNickName: '修改配置中心文件',
      },
      //工单相关
      // {
      //   //线上工单发布
      //   operationName: 'WORKORDERDEPLOY',
      //   operationNickName: '线上工单发布',
      // }
      //中间件相关
      {
        operationName: 'CREATEMIDDLEWAREFORMARIADB',
        operationNickName: '创建mariaDB'
      },
      {
        operationName: 'DELETEMIDDLEWARE',
        operationNickName: '删除中间件'
      },
      {
        operationName: 'UPDATEMIDDLEWAREMARIADB',
        operationNickName: '更新mariaDB'
      },
      {
        operationName: 'CREATEMIDDLEWAREFORREDIS',
        operationNickName: '创建redis'
      },
      {
        operationName: 'UPDATEMIDDLEWAREREDIS',
        operationNickName: '更新redis'
      },
      //accesskey 相关
      {
        operationName: 'ACCESSKEYCREATECLIENTID',
        operationNickName: 'accessKey创建ClientId',
      },
      {
        operationName: 'ACCESSKEYUPDATEAUTHORIZATION',
        operationNickName: 'accessKey修改访问配置',
      },
      {
        operationName: 'ACCESSKEYUPDATESECRET',
        operationNickName: 'accessKey修改秘钥',
      },
      {
        operationName: 'ACCESSKEYCREATEOAUTH',
        operationNickName: 'accessKey资源配置',
      },
      {
        operationName: 'ACCESSKEYDELETEAUTHORIZATION',
        operationNickName: 'accessKey删除CliendId',
      },
      {
        operationName: 'ACCESSKEYAUTHORIZRECORD',
        operationNickName: 'accessKey通过授权申请',
      },
      //pipeline相关
      {
        operationName: 'PIPELINECREATEORUPDATE',
        operationNickName: 'pipeline创建/修改',
      },
      {
        operationName: 'PIPELINEDELETE',
        operationNickName: 'pipeline删除',
      },
      {
        operationName: 'PIPELINEEXECUTE',
        operationNickName: 'pipeline执行/重启/参数化构建',
      },
      //日志相关
      {
        operationName: 'SEARCHLOG',
        operationNickName: '查询运行日志',
      },
      //团队管理
      {
        operationName: 'GROUPADDUSER',
        operationNickName: '邀请成员'
      },
      {
        operationName: 'GROUPDELETEUSER',
        operationNickName: '移除成员'
      },
      {
        operationName: 'GROUPUPDATEJOB',
        operationNickName: '修改岗位'
      },
      {
        operationName: 'MESSAGEADD',
        operationNickName: '创建站内信'
      },
      {
        operationName: 'MESSAGERELEASEORCANCLE',
        operationNickName: '发布/撤销站内信'
      }
    ]
  }
}

export default StoreHelper;