<template>
  <div id="work-order-modify"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="title-section">
      <span>修改工单</span>
      <el-tooltip slot="trigger" effect="dark" placement="bottom">
        <div slot="content">
          <div>申请工单注意事项</div>
          <div>1. 必须选定生产环境版本，确保所选择应用的生产环境下有版本。</div>
          <div>2. 在所选应用版本的工单处理完成前，不可提交新的工单。</div>
        </div>
        <i class="paas-icon-fa-question" style="font-size: 14px; color: #E6A23C; cursor: pointer"></i>
      </el-tooltip>
    </div>

    <div class="basic-section">
      <el-form :model="workOrderForm" :rules="rules"
               ref="basicForm"
               size="mini"
               label-width="110px">
        <el-form-item label="审批工单名称" prop="name" class="message-show">
          <span>{{workOrderForm.name}}</span>
        </el-form-item>
        <el-form-item label="申请人" class="message-show">
          {{workOrderForm.creatorName}}
        </el-form-item>
        <el-form-item label="团队名称" prop="groupName" class="message-show">
          <span>{{workOrderForm.groupName}}</span>
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
        <my-feature v-for="(item, index) in workOrderForm.featureList" :key="index"
                    :id="index"
                    :featureInfo="item"
                    :showAdd="index == workOrderForm.featureList.length - 1"
                    :showRemove="workOrderForm.featureList.length > 1"
                    @add="addFeatureComponent"
                    @remove="removeFeatureComponent"
        >{{item}}</my-feature>
      </div>
    </div>
    <div class="application-section">
      <div class="title">相关应用</div>
      <el-form :model="workOrderForm" :rules="rules"
               ref="applicationForm"
               size="mini"
               label-width="120px">
        <el-form-item label="应用名称" prop="appID" v-if="workOrderForm.appID">
          <el-select filterable v-model="workOrderForm.appID" placeholder="请选择">
            <el-option v-if="appInfoListOfGroup" v-for="(item, index) in appInfoListOfGroup.appList"
                       :key="item.appId" :label="item.appName" :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="acceptance-section">
      <div class="title">验收信息</div>
      <el-form :model="workOrderForm" :rules="rules"
               ref="acceptanceForm"
               size="mini"
               label-width="120px">
        <el-form-item label="验收人" prop="acceptedUserIdList">
          <span v-for="(item,index) in workOrderForm.acceptedUserList" :key="index">
            {{item.userName}}
          </span>
          <!--<el-select v-model="workOrderForm.acceptedUserIdList" multiple placeholder="请选择">-->
            <!--<el-option v-for="item in usersInGroup" :key="item.userId" :label="item.realName" :value="item.userId">-->
            <!--</el-option>-->
          <!--</el-select>-->
        </el-form-item>
        <el-form-item label="知会人" prop="notifyUserIdList">
          <el-select filterable v-model="workOrderForm.notifyUserIdList" multiple placeholder="请选择">
            <el-option v-for="item in usersAll" :key="item.id" :label="item.realName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮件组" prop="mailGroupList" class="mail-group">
          <el-tag
                v-for="tag in workOrderForm.mailGroupList"
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
          <el-input v-model="workOrderForm.comment"
                    type="textarea"
                    placeholder="不超过200个字符"
                    :rows="2"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="operation-history-section">
      <div class="title">操作记录</div>
      <el-table :data="workOrderForm.operationList">
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
    margin: 20px;
    padding: 10px 20px 10px 20px;
    width: 700px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    .title-section {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 15px 0px;
    }
    .feature-section {
      width: 660px;
      margin-top: 22px;
      .title {
        border-left: 5px solid gray;
        border-top: 1px solid gray;
        padding-left: 5px;
        margin: 15px 0px 15px -2px;
      }
      .feature-form-list {
        text-align: center;
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

  export default {
    components: {MyFeature},

    created() {
//      this.onCurrentGroupID(this.currentGroupID);
      const dataTransfer = this.$storeHelper.dataTransfer;
//      console.log(dataTransfer);
      if (dataTransfer && dataTransfer.hasOwnProperty('from')) {
        switch (dataTransfer['from']) {
          case this.$net.page['profile/work-order/todo']:
            const detail = dataTransfer['data'];
            this.workOrderForm.id = detail['id'];
            this.workOrderForm.name = detail['name'];
            this.workOrderForm.groupId = detail['groupId'];
            this.workOrderForm.groupName = detail['groupName'];
            this.workOrderForm.featureList = detail['featureList'];
            this.workOrderForm.appID = detail['appID'];
            this.workOrderForm.appName = detail['appName'];
            this.workOrderForm.acceptedUserIdList = detail['acceptedUserIdList'];
            this.workOrderForm.notifyUserIdList = detail['notifyUserIdList'];
            this.workOrderForm.operationList = detail['operationList'];
            this.workOrderForm.mailGroupList = detail['mailGroupList'];
            this.workOrderForm.comment = detail['comment'];
            break;
        }
        this.$storeHelper.dataTransfer = null;

//        this.onCurrentGroupID(this.currentGroupID);
        this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      } else {
        this.$router.go(-1);
      }
    },
    mounted() {
      // should have at least one feature item
      if (this.workOrderForm.featureList.length == 0) {
        this.workOrderForm.featureList.push({
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
        workOrderForm: {
          id: '',
          name: '',
          creatorName: this.$storeHelper.getUserInfo('realName'),
//          groupId: this.currentGroupID,
          groupId: null,
          groupName: '',
          featureList: [],
          appID: null,
          appName: null,
          acceptedUserIdList: [],
          notifyUserIdList: [],
          operationList: [],
          mailGroupList: [],
          comment: '',
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
      'workOrderForm.appID': function (value) {
        let appInfo = this.$storeHelper.getAppInfoByID(value);
        if (appInfo && appInfo.hasOwnProperty('app')) {
          this.workOrderForm.appName = appInfo.app.appName;
        }
//        this.requestProductVersionList(value);
      },
//      '$storeHelper.currentGroupID': 'onCurrentGroupID',
    },
    methods: {
      // TODO: not used
      onCurrentGroupID(value) {
        this.workOrderForm.groupId = value;
        let groupInfo = this.$storeHelper.getGroupInfoByID(value);
        if (groupInfo && groupInfo.hasOwnProperty('name')) {
          this.workOrderForm.groupName = groupInfo.name;
        }
      },
      onAppInfoListOfGroup(value) {
        if (!value.hasOwnProperty('appList')) {
          return;
        }
        if (Array.isArray(value.appList) && value.appList.length > 0) {
          const defaultAppID = value.appList[0].appId;
          let targetApp = null;
          value.appList.some(it => {
            if (this.workOrderForm.appID === it.appId) {
              targetApp = it;
            }
            return targetApp;
          });
          if (!targetApp) {
            this.workOrderForm.appID = defaultAppID;
          }
        } else {
          this.workOrderForm.appID = this.$storeHelper.APP_ID_FOR_NULL;
        }
      },
      addFeatureForm() {
        this.workOrderForm.featureList.push({
          name: '',
          type: WorkOrderPropUtils.getFeatureTypeList()[0]['id'],
          jiraAddress: null,
          description: null,
          valid: false
        });
//        console.log(this.workOrderForm.featureList);
      },
      // 添加功能描述
      addFeatureComponent() {
        let maxID = 0;
        this.workOrderForm.featureList.forEach(it => {
          if (it.id > maxID) {
            maxID = it.id;
          }
        });
        this.workOrderForm.featureList.push({
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
        let featureList = this.workOrderForm.featureList;
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
       * action for add or remove mailGroup
       * @param action
       * @param domain
       */
      handleMailGroup(action, mailGroup) {
        let mailGroupList = this.workOrderForm.mailGroupList;
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
            if (!this.workOrderForm.hasOwnProperty('id')) {
              this.$router.go(-1);
              return;
            }
            this.$net.removeWorkOrder({
              workOrderDeployId: this.workOrderForm.id
            }).then(msg => {
              this.$alert('工单"' + this.workOrderForm.name +'"删除成功，即将返回上一页', '删除工单成功', {
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
            if (!WorkOrderPropUtils.checkComment(this.workOrderForm.comment)) {
              this.$message.error('评论内容只能包含字母，数字，下划线，中划线等常规字符');
              return;
            }
            let basicPromise = new Promise((resolve, reject) => {
              this.$refs['basicForm'].validate((valid) => {
                resolve(valid);
              });
            });
            let featurePromise = new Promise((resolve, reject) => {
              let valid = this.workOrderForm.featureList
                .map(it => {return it.valid})
                .reduce((sum, valid) => {
                  return sum && valid;
                });
              resolve(valid);
            });
            let acceptancePromise = new Promise((resolve, reject) => {
              this.$refs['acceptanceForm'].validate((valid) => {
//            console.log(valid);
                resolve(valid);
              });
            });
            Promise.all([basicPromise, featurePromise, acceptancePromise]).then(results => {
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
                    id: this.workOrderForm.id,
                    name: this.workOrderForm.name,
                    groupId: this.workOrderForm.groupId,
                    groupName: this.workOrderForm.groupName,
                    remark: this.workOrderForm.comment
                  }
                };
                toPost.workOrderDeployFunctionList = this.workOrderForm.featureList.map(it => {
                  return {
                    functionName: it.name,
                    functionType: it.type,
                    jiraAddress: it.jiraAddress,
                    description: it.description
                  }
                });
                toPost.workOrderDeployAppList = [{
                  appId: this.workOrderForm.appID,
                  appName: this.workOrderForm.appName,
                }];
                // 验收人
                let userAcceptedList = this.$storeHelper.getUserInfoByID(this.workOrderForm.acceptedUserIdList);
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
                let userNotifyList = this.$storeHelper.getUserInfoByID(this.workOrderForm.notifyUserIdList);
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
                toPost.emailGroupList = this.workOrderForm.mailGroupList.map(it => {
                  return {
                    emailGroupName: it
                  }
                });
//                console.log(toPost);
                this.showLoading = true;
                this.loadingText = '正在提交工单"' + this.workOrderForm.name + '"';
                this.$net.modifyWorkOrder(toPost).then((msg) => {
                  this.$alert('工单"' + this.workOrderForm.name +'"提交成功，即将进入待办工单页', '修改工单成功', {
                    confirmButtonText: '确定',
                    callback: () => {
                      this.$router.push(this.$net.page['profile/work-order/todo']);
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
