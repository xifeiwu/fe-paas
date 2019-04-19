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
        //创建应用
        operationName: 'APPCREATE',
        operationNickName: '创建应用',
      },
      {
        //删除应用
        operationName: 'APPDELETE',
        operationNickName: '删除应用',
      },
      {
        //修改应用
        operationName: 'APPUPDATE',
        operationNickName: '修改应用',
      },
      //服务相关
      {
        //创建、修改服务
        operationName: 'CONFIGCREATE',
        operationNickName: '新增/修改服务',
      },
      {
        //删除服务
        operationName: 'CONFIGDELETE',
        operationNickName: '删除服务',
      },
      {
        //部署、重启服务
        operationName: 'CONFIGDEPLOY',
        operationNickName: '部署/重启服务',
      },
      {
        //停止服务
        operationName: 'CONFIGSTOP',
        operationNickName: '停止服务',
      },
      //实例相关
      {
        //驱逐实例
        operationName: 'PODDELETE',
        operationNickName: '驱逐实例',
      },
      {
        //手动伸缩
        operationName: 'CONFIGSCALE',
        operationNickName: '手动伸缩',
      },
      //外网域名相关
      {
        //申请外网域名
        operationName: 'INTERNETDOMAINAPPLY',
        operationNickName: '申请外网域名',
      },
      {
        //绑定、解绑外网域名
        operationName: 'INTERNETDOMAINBIND',
        operationNickName: '绑定/解绑外网域名',
      },
      {
        //删除外网域名
        operationName: 'INTERNETDOMAINDELETE',
        operationNickName: '删除外网域名',
      },
      {
        //关联IP白名单-添加
        operationName: 'INTERNETDOMAINWHITEIPADD',
        operationNickName: '关联IP白名单-添加',
      },
      {
        //关联IP白名单-修改
        operationName: 'INTERNETDOMAINWHITEIPUPDATE',
        operationNickName: '关联IP白名单-修改',
      },
      //配置中心相关
      {
        //添加配置中心目录
        operationName: 'GITLABCONFIGDIRCREATE',
        operationNickName: '添加配置中心目录',
      },
      {
        //添加配置中心文件
        operationName: 'GITLABCONFIGFILEADD',
        operationNickName: '添加配置中心文件',
      },
      {
        //修改配置中心目录
        operationName: 'GITLABCONFIGFILEUPDATE',
        operationNickName: '修改配置中心目录',
      },
      //工单相关
      {
        //线上工单发布
        operationName: 'WORKORDERDEPLOY',
        operationNickName: '线上工单发布',
      }
    ]
  }
}

export default StoreHelper;