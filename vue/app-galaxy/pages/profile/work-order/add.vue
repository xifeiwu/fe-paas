<template>
  <div id="work-order-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="title-section">
      <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
        <div slot="content">
          <div>申请工单注意事项</div>
          <div>1. 必须选定生产环境版本，确保所选择应用的生产环境下有版本。</div>
          <div>2. 在所选应用版本的工单处理完成前，不可提交新的工单。</div>
        </div>
        <span>申请工单<i class="el-icon-question"></i></span>
      </el-tooltip>
    </div>
    <div class="basic-section">
      <el-form :model="workOrderForm" :rules="rules"
               ref="basicForm"
               size="mini"
               label-width="120px">
        <el-form-item label="审批工单名称" prop="name">
          <el-input v-model="workOrderForm.name" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="申请人：">
          {{workOrderForm.userName}}
        </el-form-item>
        <el-form-item label="团队名称" prop="groupName">
          <el-select v-model="currentGroupID" placeholder="请选择" style="width: 350px">
            <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="feature-section">
      <div class="title">功能列表</div>
      <div class="feature-form-list">
        <features v-for="(item, index) in workOrderForm.features" :key="index"
                  :id="index"
                  :featureInfo="item"
                  :showPlug="index == workOrderForm.features.length - 1"
                  :onPlug="addFeatureForm"
        >{{item}}</features>
      </div>
    </div>
    <div class="application-section">
      <div class="title">程序列表</div>
      <el-form :model="workOrderForm" :rules="rules"
               ref="applicationForm"
               size="mini"
               label-width="120px">
        <el-form-item label="应用名称" prop="appName">
          <el-select v-model="workOrderForm.appID" placeholder="请选择" style="display:block; width: 350px;">
            <el-option v-for="(item, index) in appInfoListOfGroup.appList" :key="item.appId" :label="item.serviceName" :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生成环境版本" prop="appVersion">
          <el-select v-model="workOrderForm.appVersion"
                     :placeholder="versionList.length > 0 ? '请选择': '当前应用下无版本'" style="width: 350px">
            <el-option v-for="(item, index) in versionList" :key="index" :label="item" :value="item"></el-option>
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
        <el-form-item label="验收人" prop="userAccepted">
          <el-select v-model="workOrderForm.userAccepted" multiple placeholder="请选择" style="width: 350px">
            <el-option v-for="item in usersInGroup" :key="item.userId" :label="item.realName" :value="item.userId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="知会人" prop="userNotify">
          <el-select v-model="workOrderForm.userNotify" multiple placeholder="请选择" style="width: 350px">
            <el-option v-for="item in allUsers" :key="item.id" :label="item.realName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮件组" prop="mailGroup">
          <el-input v-model="workOrderForm.mailGroup" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="工单备注" prop="comments">
          <el-input v-model="workOrderForm.comments"
                    type="textarea"
                    :rows="2"
                    style="width: 350px"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="submit-section">
      <el-button type="primary" @click="handleFinish" :disabled="disableSubmit">完成</el-button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .el-form {
    .el-form-item--mini {
      margin-bottom: 12px;
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
    .submit-section {
      margin: 15px auto;
      text-align: center;
      .el-button {
        display: inline-block;
        margin: 0px auto;
        width: 50%;
        max-width: 200px;
        text-align: center;
      }
      i {
        font-size: 20px;
        line-height: 28px;
      }
    }
  }
</style>
<script>
  import workOrderUtils from '../utils/work-order-props';
  import features from './components/features.vue';
  import StoreHelper from '../utils/store-helper.vue';
  import ElTooltip from "../../../../packages/tooltip/src/main";
  import ElOption from "../../../../packages/select/src/option";
  import ElInput from "../../../../packages/input/src/input";
  export default {
    components: {ElInput, ElOption, ElTooltip, features},
    mixins: [StoreHelper],

    created() {
      this.onCurrentGroupID(this.currentGroupID);
      this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      this.onUsersAll(this.usersAll);
    },
    data() {
      return {
        showLoading: false,
        loadingText: '',

        rules: workOrderUtils.rules.workOrder,
        workOrderForm: {
          name: '',
          userName: this.$getUserInfo('realName'),
          groupName: '',
          groupId: this.currentGroupID,
          groupName: '',
          features: [{
            name: '',
            type: workOrderUtils.getFeatureTypeList()[0]['id'],
            jiraAddress: null,
            description: null,
            valid: false
          }],
          appID: null,
          appName: null,
          appVersion: '',
          userAccepted: [],
          userNotify: [],
          mailGroup: '',
          comments: '',
        },
        versionList: [],
        allUsers: [],
        disableSubmit: false,
      };
    },
    watch: {
      appInfoListOfGroup: 'onAppInfoListOfGroup',
      'workOrderForm.appID': function (value) {
        let appInfo = this.getAppInfoByID(value);
        if (appInfo && appInfo.hasOwnProperty('app')) {
          this.workOrderForm.appName = appInfo.app.serviceName;
        }
        this.requestProductVersionList(value);
      },
      'workOrderForm.appVersion': function () {
        this.$refs.hasOwnProperty('applicationForm') && this.$refs['applicationForm'].validate(valid => {
        });
      },
      currentGroupID: 'onCurrentGroupID',
      usersAll: 'onUsersAll'
    },
    methods: {
      onCurrentGroupID(value) {
        this.workOrderForm.groupId = value;
        let groupInfo = this.getGroupInfoByID(value);
        if (groupInfo && groupInfo.hasOwnProperty('name')) {
          this.workOrderForm.groupName = groupInfo.name;
        }
      },
      onUsersAll(value) {
        this.allUsers = value;
      },
      onAppInfoListOfGroup(value) {
        if (value.hasOwnProperty('appList')) {
          if (Array.isArray(value.appList)) {
            this.workOrderForm.appID = value.appList[0].appId;
          }
        }
      },
      addFeatureForm() {
        this.workOrderForm.features.push({
          name: '',
          type: workOrderUtils.getFeatureTypeList()[0]['id'],
          jiraAddress: null,
          description: null,
          valid: false
        });
        console.log(this.workOrderForm.features);
      },

      /**
       * request version list when selectedAppId or selectedProfileId is changed
       */
      requestProductVersionList(appID) {
        let spaceID = 1;
        if (!appID || !spaceID) {
          console.log('appID or spaceID can not be empty');
          return;
        }
        this.workOrderForm.appVersion = null;
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
              this.workOrderForm.appVersion = version[0];
              this.disableSubmit = false;
            } else {
              this.$message({
                type: 'warning',
                message: this.workOrderForm.appName + '的生产环境下，服务没有版本！'
              });
              this.$refs.hasOwnProperty('applicationForm') && this.$refs['applicationForm'].validate(valid => {
              });
//              this.disableSubmit = true;
//              console.log(this.workOrderForm);
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

      handleFinish() {
        let basicPromise = new Promise((resolve, reject) => {
          this.$refs['basicForm'].validate((valid) => {
//            console.log(valid);
            resolve(valid);
          });
        });
        let featurePromise = new Promise((resolve, reject) => {
          let valid = this.workOrderForm.features
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
          console.log(results);
          console.log(Array.isArray(results));
        });
//        console.log(this.getUserInfoByID(this.workOrderForm.userAccepted));
//        console.log(this.getUserInfoByID(this.workOrderForm.userNotify));

        console.log(this.workOrderForm);
      }
    }
  };
</script>
