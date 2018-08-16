<template>
  <div id="work-order-modify"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="title-section">
      <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
        <div slot="content">
          <div>修改工单注意事项</div>
          <div>1. 必须选定生产环境版本，确保所选择应用的生产环境下有版本。</div>
          <div>2. 在所选应用版本的工单处理完成前，不可提交新的工单。</div>
        </div>
        <span>修改工单<i class="el-icon-question"></i></span>
      </el-tooltip>
    </div>
    <div class="basic-section">
      <el-form :model="workOrderDetail" :rules="rules"
               ref="basicForm"
               size="mini"
               label-width="110px">
        <el-form-item label="审批工单名称" prop="name">
          <span>{{workOrderDetail.name}}</span>
        </el-form-item>
        <el-form-item label="申请人：">
          {{workOrderDetail.creatorName}}
        </el-form-item>
        <el-form-item label="团队名称" prop="groupName">
          <span>{{workOrderDetail.groupName}}</span>
          <!--<el-select v-model="currentGroupID" placeholder="请选择">-->
            <!--<el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">-->
            <!--</el-option>-->
          <!--</el-select>-->
        </el-form-item>
      </el-form>
    </div>
    <div class="feature-section">
      <div class="title">功能列表</div>
      <div class="feature-form-list">
        <my-feature v-for="(item, index) in workOrderDetail.featureList" :key="index"
                    :id="index"
                    :featureInfo="item"
                    :showAdd="index == workOrderDetail.featureList.length - 1"
                    :showRemove="workOrderDetail.featureList.length > 1"
                    @add="addFeatureComponent"
                    @remove="removeFeatureComponent"
        >{{item}}</my-feature>
      </div>
    </div>
    <div class="application-section">
      <div class="title">程序列表</div>
      <el-form :model="workOrderDetail" :rules="rules"
               ref="applicationForm"
               size="mini"
               label-width="120px">
        <el-form-item label="应用名称" prop="appID" v-if="workOrderDetail.appID">
          <el-select filterable v-model="workOrderDetail.appID" placeholder="请选择">
            <el-option v-if="appInfoListOfGroup" v-for="(item, index) in appInfoListOfGroup.appList"
                       :key="item.appId" :label="item.appName" :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生产环境版本" prop="serviceVersion" :error="serviceVersionError.description">
          <el-select v-model="workOrderDetail.serviceVersion"
                     :placeholder="versionList.length > 0 ? '请选择': '当前应用的生产环境下没有版本'">
            <el-option v-for="(item, index) in versionList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="acceptance-section">
      <div class="title">验收信息</div>
      <el-form :model="workOrderDetail" :rules="rules"
               ref="acceptanceForm"
               size="mini"
               label-width="120px">
        <el-form-item label="验收人" prop="acceptedUserIdList">
          <span v-for="(item,index) in workOrderDetail.acceptedUserList" :key="index">
            {{item.userName}}
          </span>
          <!--<el-select v-model="workOrderDetail.acceptedUserIdList" multiple placeholder="请选择">-->
            <!--<el-option v-for="item in usersInGroup" :key="item.userId" :label="item.realName" :value="item.userId">-->
            <!--</el-option>-->
          <!--</el-select>-->
        </el-form-item>
        <el-form-item label="知会人" prop="notifyUserIdList">
          <el-select filterable v-model="workOrderDetail.notifyUserIdList" multiple placeholder="请选择">
            <el-option v-for="item in usersAll" :key="item.id" :label="item.realName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮件组" prop="mailGroupList" class="mail-group">
          <el-tag
                v-for="tag in workOrderDetail.mailGroupList"
                size="small"
                :key="tag"
                closable
                type="success"
                @close="handleMailGroup('remove', tag)"
          >{{tag}}</el-tag>
          <el-input v-model="mailGroup" placeholder="请填写">
            <template slot="append">
              <el-button type="primary" class="add-mail-group-btn" @click="handleMailGroup('add', mailGroup)">
                添加
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="工单备注" prop="comment">
          <el-input v-model="workOrderDetail.comment"
                    type="textarea"
                    placeholder="不超过200个字符"
                    :rows="2"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="operation-history-section">
      <div class="title">操作记录</div>
      <el-table :data="workOrderDetail.operationList">
        <el-table-column label="处理时间" prop="createTime" headerAlign="center" align="center" width="200px">
        </el-table-column>
        <el-table-column label="处理操作" prop="actionName" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="处理人" prop="handleUserName" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="备注" prop="remark" headerAlign="center" align="center">
        </el-table-column>
      </el-table>
    </div>
    <div class="submit-section">
      <el-button type="primary" size="mini" @click="handleButtonClick('back')">取消</el-button>
      <el-button type="primary" size="mini" @click="handleButtonClick('remove')">删除工单</el-button>
      <el-button type="primary" size="mini" @click="handleButtonClick('modify')">提交工单</el-button>
    </div>
  </div>
</template>

<style lang="scss">
  #work-order-modify {
    .el-form {
      .el-form-item {
        .el-textarea {
          textarea {
            font-size: 12px;
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  .el-form {
    .el-input, .el-select, .el-textarea {
      width: 400px;
    }
    .el-form-item--mini {
      margin-bottom: 12px;
    }
    .el-form-item {
      &.mail-group {
        .add-mail-group-btn {
          color: white;
          /*background-color: #409EFF;*/
          background-color: #6c757d;
          border-color: #6c757d;
          margin: 0px;
          width: 60px;
          padding: 0px;
          font-size: 12px;
          line-height: 25px;
          border-width: 0px;
          border-radius: 0px;
          &:hover {
            /*background-color: #79bbff;*/
            font-weight: bold;
            background-color: #5a6268;
            border-color: #545b62;
          }
        }
      }
    }
  }
  #work-order-modify {
    background: white;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    width: 660px;
    margin: 20px;
    margin-left: 30px;
    padding: 18px;
    .title-section {
      text-align: center;
      margin: 15px 0px;
    }
    .feature-section {
      margin-top: 22px;
      width: 620px;
      .title {
        border-left: 5px solid gray;
        border-top: 1px solid gray;
        padding-left: 5px;
        margin: 15px 0px 15px -2px;
      }
      .feature-form-list {
        .work-order-feature {
          display: inline-block;
          /*& + .work-order-feature {*/
            /*margin-left: 10px;*/
          /*}*/
        }
      }
    }
    .application-section {
      margin-top: 22px;
      width: 600px;
      /*margin: 0px auto;*/
      .title {
        border-left: 5px solid gray;
        border-top: 1px solid gray;
        padding-left: 5px;
        margin-bottom: 5px;
      }
    }
    .acceptance-section {
      margin-top: 32px;
      width: 600px;
      /*margin: 0px auto;*/
      .title {
        border-left: 5px solid gray;
        border-top: 1px solid gray;
        padding-left: 5px;
        margin-bottom: 5px;
      }
      textarea {
        margin-top: 3px;
      }
    }
    .operation-history-section {
      margin-top: 32px;
      width: 600px;
      /*margin: 0px auto;*/
      .title {
        border-left: 5px solid gray;
        border-top: 1px solid gray;
        padding-left: 5px;
        margin-bottom: 5px;
      }
      .el-table {
        margin-left: 20px;
      }
    }
    .submit-section {
      margin: 15px auto;
      text-align: center;
      i {
        font-size: 20px;
        line-height: 28px;
      }
    }
  }
</style>
<script>
  import WorkOrderPropUtils from '../utils/work-order-props';
  import MyFeature from '../components/feature.vue';
  const debug = browserDebug('pass-fe:work-order/todo/modify');

  export default {
    components: {MyFeature},

    created() {
//      this.onCurrentGroupID(this.currentGroupID);
      if (!this.appInfoListOfGroup) {
        console.log('warning: appInfoListOfGroup not found');
        this.$store.dispatch('user/appInfoListOfGroup', {
          from: 'page/work-order/todo/add',
          groupId: this.currentGroupID
        });
      }
    },
    mounted() {
      let workOrderDetail = this.$storeHelper.getTmpProp('workOrderDetail');
      if (!workOrderDetail || !workOrderDetail.hasOwnProperty('appID')) {
//        this.$router.push('/profile/work-order/todo');
        this.$router.go(-1);
        return;
      }
      this.workOrderDetail = workOrderDetail;
      this.requestProductVersionList(this.workOrderDetail.appID);
      // should have at least one feature item
      if (this.workOrderDetail.featureList.length == 0) {
        this.workOrderDetail.featureList.push({
          name: '',
          type: WorkOrderPropUtils.getFeatureTypeList()[0]['id'],
          jiraAddress: null,
          description: null,
          valid: false
        })
      }
    },
    data() {
      return {
        showLoading: false,
        loadingText: '',

        rules: WorkOrderPropUtils.rules.workOrder,
        mailGroup: '',
        workOrderDetail: {
          name: '',
          creatorName: this.$storeHelper.getUserInfo('realName'),
          groupId: this.currentGroupID,
          groupName: '',
          featureList: [],
          appID: null,
          appName: null,
          serviceVersion: '',
          acceptedUserIdList: [],
          notifyUserIdList: [],
          mailGroupList: [],
          comment: '',
        },
        versionList: [],

        serviceVersionError: {
          isOK: true,
          reason: 'NO',
          description: ''
        },
        serviceVersionState: {
          'WORK_ORDER_HAS_EXIST': '该服务有正在处理的工单',
          'NO_PRODUCTION_VERSION': '该应用无生产环境版本',
          'GET_VERSION_LIST_FAIL': '获取版本列表失败'
        },
      };
    },
    computed: {
      currentGroupID() {
       return this.$storeHelper.currentGroupID;
      },
      appInfoListOfGroup() {
        return this.$storeHelper.appInfoListOfGroup;
      },
      usersAll() {
        return this.$storeHelper.usersAll();
      }
    },
    watch: {
      appInfoListOfGroup: 'onAppInfoListOfGroup',
      'workOrderDetail.appID': function (value) {
        let appInfo = this.$storeHelper.getAppInfoByID(value);
        if (appInfo && appInfo.hasOwnProperty('app')) {
          this.workOrderDetail.appName = appInfo.app.appName;
        }
        this.requestProductVersionList(value);
      },
      'workOrderDetail.serviceVersion': function (value) {
        if (!value) {
          return;
        }
        if (this.workOrderDetail.appID && this.workOrderDetail.serviceVersion) {
          this.$net.checkWorkOrderHandling({
            workOrderId: this.workOrderDetail.id,
            appId: this.workOrderDetail.appID,
            serviceVersion: this.workOrderDetail.serviceVersion
          }).then((msg) => {
            this.serviceVersionError.isOK = true;
            this.serviceVersionError.description = '';
          }).catch((msg) => {
            this.serviceVersionError.isOK = false;
            this.serviceVersionError.reason = 'WORK_ORDER_HAS_EXIST';
            msg = msg.trim();
            if (this.serviceVersionError.description == msg) {
              this.serviceVersionError.description = msg + ' ';
            } else {
              this.serviceVersionError.description = msg;
            }
          });
        }
      },
      '$storeHelper.currentGroupID': 'onCurrentGroupID',
    },
    methods: {
      onCurrentGroupID(value) {
        this.workOrderDetail.groupId = value;
        let groupInfo = this.$storeHelper.getGroupInfoByID(value);
        if (groupInfo && groupInfo.hasOwnProperty('name')) {
          this.workOrderDetail.groupName = groupInfo.name;
        }
      },
      onAppInfoListOfGroup(value) {
      },
      addFeatureForm() {
        this.workOrderDetail.featureList.push({
          name: '',
          type: WorkOrderPropUtils.getFeatureTypeList()[0]['id'],
          jiraAddress: null,
          description: null,
          valid: false
        });
//        console.log(this.workOrderDetail.featureList);
      },
      // 添加功能描述
      addFeatureComponent() {
        let maxID = 0;
        this.workOrderDetail.featureList.forEach(it => {
          if (it.id > maxID) {
            maxID = it.id;
          }
        });
        this.workOrderDetail.featureList.push({
          id: maxID + 1,
          name: '',
          type: WorkOrderPropUtils.getFeatureTypeList()[0]['id'],
          jiraAddress: null,
          description: null,
          valid: false
        });
      },
      // 删除功能描述
      removeFeatureComponent(params) {
        let target = null;
        let index = null;
        let featureList = this.workOrderDetail.featureList;
        featureList.some((it, loc) => {
          target = it.id === params.id ? it : null;
          if (target) {
            index = loc;
            return true;
          } else {
            return false;
          }
        });
        if (null != target && null != index) {
          featureList.splice(index, 1);
        }
      },

      /**
       * request version list when selectedAppId or selectedProfileId is changed
       */
      requestProductVersionList(appID) {
        let spaceID = null;
        let profileInfo = this.$storeHelper.getProductionProfile();
        if (profileInfo && profileInfo.hasOwnProperty('id')) {
          spaceID = profileInfo.id;
        }
        if (!appID || !spaceID) {
          console.log('appID or spaceID can not be empty');
          return;
        }
        // make sure this.workOrderDetail.serviceVersion is changed
        this.workOrderDetail.serviceVersion = null;
        this.versionList = [];
        this.versionList = [];
        this.$net.getServiceVersion({
          appId: appID,
          spaceId: spaceID
        }).then(content => {
//          console.log(content);
          if (content.hasOwnProperty('version')) {
            let version = content.version;
            if (version && Array.isArray(version) && version.length > 0) {
              this.versionList = version;
              this.workOrderDetail.serviceVersion = version[0];
            } else {
              this.serviceVersionError.isOK = false;
              this.serviceVersionError.reason = 'NO_PRODUCTION_VERSION';
              this.serviceVersionError.description = '';
              this.serviceVersionError.description = this.serviceVersionState['NO_PRODUCTION_VERSION'];
            }
          }
        }).catch(err => {
          console.log(err);
          this.serviceVersionError.isOK = false;
          this.serviceVersionError.reason = 'GET_VERSION_LIST_FAIL';
          this.serviceVersionError.description = '';
          this.serviceVersionError.description = this.serviceVersionState['GET_VERSION_LIST_FAIL'];
        });
      },


      /**
       * action for add or remove mailGroup
       * @param action
       * @param domain
       */
      handleMailGroup(action, mailGroup) {
        let mailGroupList = this.workOrderDetail.mailGroupList;
        let mailReg = /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/;
        switch (action) {
          case 'remove':
            mailGroupList.splice(mailGroupList.indexOf(mailGroup), 1);
            break;
          case 'add':
            if (!mailReg.exec(mailGroup)) {
             this.$message.error('邮箱格式不正确');
             return;
            }
            if (mailGroupList.indexOf(mailGroup) > -1) {
              mailGroupList.splice(mailGroupList.indexOf(mailGroup), 1);
            }
            mailGroupList.push(mailGroup);
            this.mailGroup = '';
            break;
        }
      },

      handleButtonClick(action) {
        switch (action) {
          case 'back':
            this.$router.go(-1);
            break;
          case 'remove':
            if (!this.workOrderDetail.hasOwnProperty('id')) {
              this.$router.go(-1);
              return;
            }
            this.$net.removeWorkOrder({
              workOrderDeployId: this.workOrderDetail.id
            }).then(msg => {
              this.$alert('工单"' + this.workOrderDetail.name +'"删除成功，即将返回上一页', '删除工单成功', {
                confirmButtonText: '确定',
                callback: () => {
                  this.$router.go(-1);
                }
              });
            }).catch(msg => {
              this.$notify.err({
                title: '删除工单失败',
                message: msg,
                duration: 0,
                onClose: function () {
                }
              });
            });
            break;
          case 'modify':
            if (!WorkOrderPropUtils.checkComment(this.workOrderDetail.comment)) {
              this.$message.error('评论内容只能包含字母，数字，下划线，中划线等常规字符');
              return;
            }
            let basicPromise = new Promise((resolve, reject) => {
              this.$refs['basicForm'].validate((valid) => {
                resolve(valid);
              });
            });
            let featurePromise = new Promise((resolve, reject) => {
              let valid = this.workOrderDetail.featureList
                .map(it => {return it.valid})
                .reduce((sum, valid) => {
                  return sum && valid;
                });
              resolve(valid);
            });
            let applicationPromise = new Promise((resolve, reject) => {
              if (!this.serviceVersionError.isOK) {
                resolve(false);
              } else {
                this.$refs['applicationForm'].validate((valid) => {
                  resolve(valid);
                });
              }
            });
            let acceptancePromise = new Promise((resolve, reject) => {
              this.$refs['acceptanceForm'].validate((valid) => {
//            console.log(valid);
                resolve(valid);
              });
            });
            Promise.all([basicPromise, featurePromise, applicationPromise, acceptancePromise]).then(results => {
              if (!Array.isArray(results)) {
                return;
              }
              let valid = results.reduce((sum, valid) => {
                return sum && valid;
              });
              if (valid) {
                // check if a work-order in handling first
                if (!this.serviceVersionError.isOK ) {
                  let reason = this.serviceVersionError.reason;
                  this.$message.error(this.serviceVersionState[reason]);
                  return;
                }
                let toPost = {
                  workOrderDeploy: {
                    // id should be add when modify work-order
                    id: this.workOrderDetail.id,
                    name: this.workOrderDetail.name,
                    groupId: this.workOrderDetail.groupId,
                    groupName: this.workOrderDetail.groupName,
                    remark: this.workOrderDetail.comment
                  }
                };
                toPost.workOrderDeployFunctionList = this.workOrderDetail.featureList.map(it => {
                  return {
                    functionName: it.name,
                    functionType: it.type,
                    jiraAddress: it.jiraAddress,
                    description: it.description
                  }
                });
                toPost.workOrderDeployAppList = [{
                  appId: this.workOrderDetail.appID,
                  appName: this.workOrderDetail.appName,
                  serviceVersion: this.workOrderDetail.serviceVersion,
                }];
                // 验收人
                let userAcceptedList = this.$storeHelper.getUserInfoByID(this.workOrderDetail.acceptedUserIdList);
                if (userAcceptedList) {
                  toPost.acceptanceUserList = userAcceptedList.map(it => {
                    return {
                      userId: it.id,
                      userName: it.realName
                    }
                  })
                } else {
                  toPost.acceptanceUserList = [];
                }
                // 知会人
                let userNotifyList = this.$storeHelper.getUserInfoByID(this.workOrderDetail.notifyUserIdList);
                if (userNotifyList) {
                  toPost.informUserList = userNotifyList.map(it => {
                    return {
                      userId: it.id,
                      userName: it.realName
                    }
                  })
                } else {
                  toPost.informUserList = [];
                }
                // 邮件组
                toPost.emailGroupList = this.workOrderDetail.mailGroupList.map(it => {
                  return {
                    emailGroupName: it
                  }
                });
//                console.log(toPost);
                this.showLoading = true;
                this.loadingText = '正在提交工单"' + this.workOrderDetail.name + '"';
                this.$net.modifyWorkOrder(toPost).then((msg) => {
                  this.$alert('工单"' + this.workOrderDetail.name +'"提交成功，即将进入待办工单页', '修改工单成功', {
                    confirmButtonText: '确定',
                    callback: () => {
                      this.$router.push('/work-order/todo');
                    }
                  });
                  this.showLoading = false;
                  this.loadingText = '';
                }).catch(msg => {
                  this.$notify.error({
                    title: '提交工单失败',
                    message: msg
                  });
                  this.showLoading = false;
                  this.loadingText = '';
                });
              } else {
                let [basicCheck, featureCheck, appCheck, acceptanceCheck] = results;
                if (!featureCheck) {
                  this.$message.error('请检查"功能列表"部分是否正确');
                } else if (!appCheck) {
                  this.$message.error('请检查"程序列表"部分是否正确');
                } else if (!acceptanceCheck) {
                  this.$message.error('请检查"验收信息"部分是否正确');
                }
              }
            });
            break;
        }
      },
    }
  };
</script>
