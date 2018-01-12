<template>
  <div id="work-order-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="basic-section">
      <el-form :model="workOrderForm" :rules="rules"
               ref="workOrderForm"
               size="mini"
               label-width="120px">
        <el-form-item label="审批工单名称" prop="name">
          <el-input v-model="workOrderForm.name" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="申请人：">
          {{workOrderForm.userName}}
        </el-form-item>
        <el-form-item label="团队名称" prop="groupName">
          <el-select v-model="currentGroupID" placeholder="请选择">
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
          <el-select v-model="workOrderForm.appVersion" placeholder="请选择" style="width: 350px">
            <!--<el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">-->
            <!--</el-option>-->
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
        <el-form-item label="验收人" prop="acceptanceUser">
          <el-select v-model="workOrderForm.acceptanceUser" multiple placeholder="请选择" style="width: 350px">
            <el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="知会人" prop="notifyUser">
          <el-select v-model="workOrderForm.notifyUser" multiple placeholder="请选择" style="width: 350px">
            <el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮件组" prop="mailGroup">
          <el-select v-model="workOrderForm.mailGroup" multiple placeholder="请选择" style="width: 350px">
            <el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工单备注" prop="comments">
          <el-input v-model="workOrderForm.comments"
                    type="textarea"
                    :rows="2"
                    style="width: 350px"></el-input>
          <!--<el-select v-model="workOrderForm.comments" multiple placeholder="请选择" style="width: 350px">-->
          <!--<el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">-->
          <!--</el-option>-->
          <!--</el-select>-->
        </el-form-item>
      </el-form>
    </div>
    <div class="submit-section">
      <el-button type="primary" @click="handleFinish" :disabled="disableSubmit">完成</el-button>
      <el-tooltip slot="trigger" effect="dark" placement="top-start">
        <div slot="content">
          <div>提交工单注意事项</div>
          <div>1. 必须选定生产环境版本，确保所选择应用的生产环境下有版本。</div>
          <div>2. 在所选应用版本的工单处理完成前，不可提交新的工单。</div>
        </div>
        <i class="el-icon-question"></i>
      </el-tooltip>
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
    /*max-width: 600px;*/
    margin: 25px auto 5px auto;
    .feature-section {
      .title {
        border-left: 5px solid gray;
        border-top: 1px solid gray;
        margin: 15px 0px 5px -2px;
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
      .title {
        border-left: 5px solid gray;
        border-top: 1px solid gray;
        margin: 15px 0px 5px -2px;
      }
    }
    .acceptance-section {
      .title {
        border-left: 5px solid gray;
        border-top: 1px solid gray;
        margin: 15px 0px 5px -2px;
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
  export default {
    components: {ElOption, ElTooltip, features},
    mixins: [StoreHelper],

    created() {
      this.onCurrentGroupID(this.currentGroupID);
      this.onAppInfoListOfGroup(this.appInfoListOfGroup);
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
          }],
          appID: null,
          appName: null,
          appVersion: null,
          acceptanceUser: [],
          notifyUser: [],
          mailGroup: [],
          comments: '',
        },
        versionList: [],
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
      currentGroupID: 'onCurrentGroupID',
    },
    methods: {
      onCurrentGroupID(value) {
        this.workOrderForm.groupId = value;
        let groupInfo = this.getGroupInfoByID(value);
        if (groupInfo && groupInfo.hasOwnProperty('name')) {
          this.workOrderForm.groupName = groupInfo.name;
        }
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
          console.log(content);
          if (content.hasOwnProperty('version')) {
            let version = content.version;
            if (version && Array.isArray(version) && version.length > 0) {
              this.versionList = version;
              this.workOrderForm.appVersion = version[0];
              this.disableSubmit = false;
            } else {
//              this.$message({
//                type: 'warning',
//                message: this.workOrderForm.appName + '的生产环境下，服务没有版本！'
//              });
              this.$refs['applicationForm'].validate();
              this.disableSubmit = true;
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
        this.$refs['applicationForm'].validate((valid) => {
          console.log(valid);
        });
        console.log(this.workOrderForm);
      }
    }
  };
</script>
