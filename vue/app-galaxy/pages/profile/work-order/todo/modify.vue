<template>
  <div id="work-order-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="title-section">
      <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
        <div slot="content">
          <div>修改工单注意事项</div>
          <div>1. 必须选定生产环境版本，确保所选择应用的生产环境下有版本。</div>
          <div>2. 在所选应用版本的工单处理完成前，不可提交新的工单。</div>
        </div>
        <span>申请工单<i class="el-icon-question"></i></span>
      </el-tooltip>
    </div>
    <div class="basic-section">
      <el-form :model="workOrderDetail" :rules="rules"
               ref="basicForm"
               size="mini"
               label-width="120px">
        <el-form-item label="审批工单名称" prop="name">
          <!--<el-input v-model="workOrderDetail.name" style="width: 350px"></el-input>-->
          <span>{{workOrderDetail.name}}</span>
        </el-form-item>
        <el-form-item label="申请人：">
          {{workOrderDetail.creatorName}}
        </el-form-item>
        <el-form-item label="团队名称" prop="groupName">
          <span>{{workOrderDetail.groupName}}</span>
          <!--<el-select v-model="currentGroupID" placeholder="请选择" style="width: 350px">-->
            <!--<el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">-->
            <!--</el-option>-->
          <!--</el-select>-->
        </el-form-item>
      </el-form>
    </div>
    <!--<div class="feature-section">-->
      <!--<div class="title">功能列表</div>-->
      <!--<div class="feature-form-list">-->
        <!--<my-feature v-for="(item, index) in workOrderDetail.featureList" :key="index"-->
                  <!--:id="index"-->
                  <!--:featureInfo="item"-->
                  <!--:showPlug="index == workOrderDetail.featureList.length - 1"-->
                  <!--:onPlug="addFeatureForm"-->
        <!--&gt;{{item}}</my-feature>-->
      <!--</div>-->
    <!--</div>-->
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
        <el-form-item label="应用名称" prop="appName" v-if="workOrderDetail.appID">
          <el-select filterable v-model="workOrderDetail.appID" placeholder="请选择" style="display:block; width: 350px;">
            <el-option v-for="(item, index) in appInfoListOfGroup.appList" :key="item.appId" :label="item.serviceName" :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生产环境版本" prop="serviceVersion">
          <el-select v-model="workOrderDetail.serviceVersion"
                     :placeholder="versionList.length > 0 ? '请选择': '当前应用下无版本'" style="width: 350px">
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
          <!--<el-select v-model="workOrderDetail.acceptedUserIdList" multiple placeholder="请选择" style="width: 350px">-->
            <!--<el-option v-for="item in usersInGroup" :key="item.userId" :label="item.realName" :value="item.userId">-->
            <!--</el-option>-->
          <!--</el-select>-->
        </el-form-item>
        <el-form-item label="知会人" prop="notifyUserIdList">
          <el-select filterable v-model="workOrderDetail.notifyUserIdList" multiple placeholder="请选择" style="width: 350px">
            <el-option v-for="item in allUsers" :key="item.id" :label="item.realName" :value="item.id">
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
                    :rows="2"
                    style="width: 350px"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="operation-history-section">
      <div class="title">操作记录</div>
      <el-table :data="workOrderDetail.operationList">
        <el-table-column label="处理时间" prop="createTime" headerAlign="center">
        </el-table-column>
        <el-table-column label="处理操作" prop="actionName" headerAlign="center">
        </el-table-column>
        <el-table-column label="处理人" prop="handleUserName" headerAlign="center">
        </el-table-column>
        <el-table-column label="备注" prop="remark" headerAlign="center">
        </el-table-column>
      </el-table>
    </div>
    <div class="submit-section">
      <el-button type="primary" @click="handleButtonClick('back')" :disabled="disableSubmit">取消</el-button>
      <el-button type="primary" @click="handleButtonClick('remove')" :disabled="disableSubmit">删除工单</el-button>
      <el-button type="primary" @click="handleButtonClick('modify')" :disabled="disableSubmit">提交工单</el-button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .el-form {
    .el-form-item--mini {
      margin-bottom: 12px;
    }
    .el-form-item {
      &.mail-group {
        .add-mail-group-btn {
          color: white;
          background-color: #409EFF;
          margin: 0px;
          width: 60px;
          padding: 7px 15px 8px 15px;
          border-width: 0px;
          border-radius: 0px;
          &:hover {
            background-color: #79bbff;
            font-weight: bold;
          }
        }
      }
    }
  }
  #work-order-add {
    width: 80%;
    max-width: 620px;
    margin: 25px auto 5px auto;
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
          & + .work-order-feature {
            margin-left: 10px;
          }
        }
      }
    }
    .application-section {
      margin-top: 22px;
      width: 480px;
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
      width: 480px;
      /*margin: 0px auto;*/
      .title {
        border-left: 5px solid gray;
        border-top: 1px solid gray;
        padding-left: 5px;
        margin-bottom: 5px;
      }
    }
    .operation-history-section {
      margin-top: 32px;
      width: 480px;
      /*margin: 0px auto;*/
      .title {
        border-left: 5px solid gray;
        border-top: 1px solid gray;
        padding-left: 5px;
        margin-bottom: 5px;
      }
      .el-table {
        margin-left: 50px;
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
  import MyFeature from '../utils/components/feature.vue';
  import StoreHelper from '../../utils/store-helper.vue';
  import ElTooltip from "element-ui/packages/tooltip/src/main";
  import ElOption from "element-ui/packages/select/src/option";
  import ElInput from "element-ui/packages/input/src/input";
  export default {
    components: {ElInput, ElOption, ElTooltip, MyFeature},
    mixins: [StoreHelper],

    created() {
//      this.onCurrentGroupID(this.currentGroupID);
//      this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      this.onUsersAll(this.usersAll);
    },
    mounted() {
      let workOrder = this.$store.getters['app/currentWorkOrder'];
      if (!workOrder || !workOrder.hasOwnProperty('id')) {
        this.$router.push('/profile/work-order/todo');
        return;
      }
      this.$nextTick(() => {
        WorkOrderPropUtils.getWorkOrderDetailByBasic(this, workOrder).then(detail => {
          console.log(detail);
          this.workOrderDetail = detail;
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
        })
      });
    },
    data() {
      return {
        showLoading: false,
        loadingText: '',

        rules: WorkOrderPropUtils.rules.workOrder,
        mailGroup: '',
        workOrderDetail: {
          name: '',
          creatorName: this.$getUserInfo('realName'),
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
        allUsers: [],
        disableSubmit: false,
      };
    },
    watch: {
      appInfoListOfGroup: 'onAppInfoListOfGroup',
      'workOrderDetail.appID': function (value) {
        let appInfo = this.getAppInfoByID(value);
        if (appInfo && appInfo.hasOwnProperty('app')) {
          this.workOrderDetail.appName = appInfo.app.serviceName;
        }
        this.requestProductVersionList(value);
      },
      'workOrderDetail.serviceVersion': function () {
        this.$refs.hasOwnProperty('applicationForm') && this.$refs['applicationForm'].validate(valid => {
        });
      },
      currentGroupID: 'onCurrentGroupID',
      usersAll: 'onUsersAll'
    },
    methods: {
      onCurrentGroupID(value) {
        this.workOrderDetail.groupId = value;
        let groupInfo = this.getGroupInfoByID(value);
        if (groupInfo && groupInfo.hasOwnProperty('name')) {
          this.workOrderDetail.groupName = groupInfo.name;
        }
      },
      onUsersAll(value) {
        this.allUsers = value;
      },
      onAppInfoListOfGroup(value) {
        if (value.hasOwnProperty('appList')) {
          if (Array.isArray(value.appList)) {
            this.workOrderDetail.appID = value.appList[0].appId;
          }
        }
      },
      addFeatureForm() {
        this.workOrderDetail.featureList.push({
          name: '',
          type: WorkOrderPropUtils.getFeatureTypeList()[0]['id'],
          jiraAddress: null,
          description: null,
          valid: false
        });
        console.log(this.workOrderDetail.featureList);
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
//            let profileType = 'DEV';
        let profileType = 'PRODUCTION';
        let profileInfo = this.$storeHelper.getProfileInfoByType(profileType);
        if (profileInfo && profileInfo.hasOwnProperty('id')) {
          spaceID = profileInfo.id;
        }
        if (!appID || !spaceID) {
          console.log('appID or spaceID can not be empty');
          return;
        }
        this.workOrderDetail.serviceVersion = null;
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
              this.disableSubmit = false;
            } else {
              this.$message({
                type: 'warning',
                message: this.workOrderDetail.appName + '的生产环境下，服务没有版本！'
              });
              this.$refs.hasOwnProperty('applicationForm') && this.$refs['applicationForm'].validate(valid => {
              });
//              this.disableSubmit = true;
//              console.log(this.workOrderDetail);
            }
          }
        }).catch(err => {
          console.log(err);
          this.$message({
            type: 'error',
            message: '查找服务版本失败！'
          });
        });
      },


      /**
       * action for add or remove mailGroup
       * @param action
       * @param domain
       */
      handleMailGroup(action, mailGroup) {
        let mailGroupList = this.workOrderDetail.mailGroupList;
        switch (action) {
          case 'remove':
            mailGroupList.splice(mailGroupList.indexOf(mailGroup), 1);
            break;
          case 'add':
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
          case 'close':
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
              this.$alert('工单' + this.workOrderDetail.name +'删除成功，即将返回上一页', '删除工单成功', {
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
//        console.log(this.workOrderDetail);
            let basicPromise = new Promise((resolve, reject) => {
              this.$refs['basicForm'].validate((valid) => {
//            console.log(valid);
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
              this.$refs['applicationForm'].validate((valid) => {
//            console.log(valid);
                resolve(valid);
              });
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
                let userAcceptedList = this.getUserInfoByID(this.workOrderDetail.acceptedUserIdList);
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
                let userNotifyList = this.getUserInfoByID(this.workOrderDetail.notifyUserIdList);
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
                  this.$alert('工单' + this.workOrderDetail.name +'提交成功，即将进入工单列表页', '修改工单成功', {
                    confirmButtonText: '确定',
                    callback: () => {
                      this.$router.push('/profile/work-order/list');
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
