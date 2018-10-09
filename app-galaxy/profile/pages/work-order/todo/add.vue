<template>
  <div id="work-order-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="title-section">
      <span>申请工单</span>
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
        <el-form-item label="申请人">
          {{workOrderForm.creatorName}}
        </el-form-item>
        <el-form-item label="审批工单名称" prop="name">
          <el-input v-model="workOrderForm.name" placeholder="100字符内"></el-input>
        </el-form-item>
        <el-form-item label="团队名称" prop="groupName">
          <el-select v-model="$storeHelper.currentGroupID" placeholder="请选择">
            <el-option v-for="item in groupList" :key="item.id" :label="item.asLabel" :value="item.id">
            </el-option>
          </el-select>
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
      <div class="title">程序列表</div>
      <el-form :model="workOrderForm" :rules="rules"
               ref="applicationForm"
               size="mini"
               label-width="120px">
        <el-form-item label="应用名称" prop="appID">
          <el-select filterable v-model="workOrderForm.appID"
                     v-if="appInfoListOfGroup && appInfoListOfGroup.hasOwnProperty('appList')"
                     placeholder="请选择">
            <el-option v-for="(item, index) in appInfoListOfGroup.appList"
                       :key="item.appId" :label="item.appName" :value="item.appId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生产环境版本" prop="serviceVersion" :error="serviceVersionError.description">
          <el-select v-model="workOrderForm.serviceVersion"
                     :placeholder="versionList.length > 0 ? '请选择': '当前应用的生产环境下没有版本'">
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
        <el-form-item label="验收人" prop="acceptedUserIdList">
          <el-select filterable v-model="workOrderForm.acceptedUserIdList" multiple placeholder="请选择">
            <el-option v-for="item in $storeHelper.usersInGroup" :key="item.userId" :label="item.realName" :value="item.userId">
            </el-option>
          </el-select>
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
                    :rows="2"
                    ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="section-footer">
      <el-button size="mini" type="primary" @click="handleButtonClick('add')">完成</el-button>
      <el-button size="mini" type="primary" @click="handleButtonClick('back')">取消</el-button>
    </div>
  </div>
</template>

<style lang="scss">
  #work-order-add {
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
    .el-textarea {
      margin-top: 3px;
    }
    .el-form-item--mini {
      margin-bottom: 12px;
    }
    .el-form-item {
      &.mail-group {
        .add-mail-group-btn {
          color: white;
          /*background-color: #79bbff;*/
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
            font-weight: bold;
            /*background-color: #409EFF;*/
            background-color: #5a6268;
            border-color: #545b62;
          }
        }
      }
    }
  }
  #work-order-add {
    background: white;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    width: 700px;
    margin: 20px;
    margin-left: 30px;
    padding: 16px 30px;
    .title-section {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 15px 0px;
    }
    .basic-section {
      width: 620px;
      margin-bottom: 22px;
      .el-form {
        .el-form-item {
        }
      }
    }
    .feature-section {
      width: 660px;
      margin-bottom: 12px;
      .title {
        border-left: 5px solid #409EFF;
        border-top: 1px solid #409EFF;
        padding-left: 5px;
        margin: 0px 0px 12px -2px;
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
      margin-bottom: 22px;
      width: 600px;
      .title {
        border-left: 5px solid #409EFF;
        border-top: 1px solid #409EFF;
        padding-left: 5px;
        margin-bottom: 5px;
      }
    }
    .acceptance-section {
      margin-bottom: 22px;
      width: 600px;
      .title {
        border-left: 5px solid #409EFF;
        border-top: 1px solid #409EFF;
        padding-left: 5px;
        margin-bottom: 5px;
      }
      textarea {
        margin-top: 3px;
      }
    }
    .section-footer {
      text-align: center;
      .el-button {
        padding: 6px 20px;
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
      try {
        const dataTransfer = this.$storeHelper.dataTransfer;
        if (dataTransfer && dataTransfer.hasOwnProperty('from')) {
          switch (dataTransfer['from']) {
            case this.$net.page['profile/service']:
              this.workOrderForm.appID = dataTransfer['data']['appId'];
              break;
          }
          this.$storeHelper.dataTransfer = null;
        } else {
          this.workOrderForm.appID = this.$storeHelper.userConfig['service']['appId'];
        }
      } catch(err) {
      }

      this.onCurrentGroupID(this.currentGroupID);
      this.onAppInfoListOfGroup(this.appInfoListOfGroup);
    },
    mounted() {
//      let workOrder = this.$store.getters['app/currentWorkOrder'];
//      if (!workOrder || !workOrder.hasOwnProperty('id')) {
//        this.$router.push('/profile/work-order/todo');
//        return;
//      }
//      this.$nextTick(() => {
//        WorkOrderPropUtils.getWorkOrderDetailByBasic(this, workOrder).then(detail => {
//          this.workOrderForm = detail;
          // should have at least one feature item
          if (this.workOrderForm.featureList.length == 0) {
            this.workOrderForm.featureList.push({
              id: 1,
              name: '',
              type: WorkOrderPropUtils.getFeatureTypeList()[0]['id'],
              jiraAddress: null,
              description: null,
              valid: false
            })
          }
//        })
//      });
    },
    data() {
      return {
        showLoading: false,
        loadingText: '',

        rules: WorkOrderPropUtils.rules.workOrder,
        mailGroup: '',
        workOrderForm: {
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
      currentGroupID: {
        get() {
          return this.$storeHelper.currentGroupID;
        },
//        set(value) {
//          this.$storeHelper.currentGroupID = value;
//        }
      },
      groupList() {
        return this.$storeHelper.groupList;
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
        this.requestProductVersionList(value);
//        this.$storeHelper.setUserConfig('profile/work-order/appID', value);
      },
      'workOrderForm.serviceVersion': function (value) {
        if (!value) {
          return;
        }
        if (this.workOrderForm.appID && this.workOrderForm.serviceVersion) {
          this.$net.checkWorkOrderHandling({
            appId: this.workOrderForm.appID,
            serviceVersion: this.workOrderForm.serviceVersion
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
        this.workOrderForm.groupId = value;
        let groupInfo = this.$storeHelper.getGroupInfoByID(value);
        if (groupInfo && groupInfo.hasOwnProperty('name')) {
          this.workOrderForm.groupName = groupInfo.name;
        }

        // update usersInGroup
        this.$store.dispatch('user/usersInGroup');
      },
      // set defaultAppID(first element in array) for this.workOrderForm.appID
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
        // make sure this.workOrderForm.serviceVersion is changed
        this.workOrderForm.serviceVersion = null;
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
              this.workOrderForm.serviceVersion = version[0];
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

//          this.$message({
//            type: 'error',
//            message: '查找服务版本失败！'
//          });
        });
      },

      /**
       * action for add or remove mailGroup
       * @param action
       * @param domain
       */
      handleMailGroup(action, mailGroup) {
        let mailGroupList = this.workOrderForm.mailGroupList;
        let mailReg = this.$utils.getReg('mail');
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
          case 'add':
            if (!WorkOrderPropUtils.checkComment(this.workOrderForm.comment)) {
              this.$message.error('评论内容只能包含字母，数字，下划线，中划线等常规字符');
              return;
            }
//        console.log(this.workOrderForm);
            let basicPromise = new Promise((resolve, reject) => {
              this.$refs['basicForm'].validate((valid) => {
//            console.log(valid);
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
                // check the format of el-form-item
                let toPost = {
                  workOrderDeploy: {
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
                  serviceVersion: this.workOrderForm.serviceVersion,
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
                this.$net.createWorkOrder(toPost).then((msg) => {
                  this.$alert('工单"' + this.workOrderForm.name  +'"创建成功，即将进入工单列表页', '创建工单成功', {
                    confirmButtonText: '确定',
                    callback: () => {
                      this.$router.push(this.$net.page['profile/work-order/list']);
                    }
                  });
                  this.showLoading = false;
                  this.loadingText = '';
                }).catch(msg => {
                  this.$notify.error({
                    title: '创建工单失败',
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
          case 'back':
            this.$router.go(-1);
            break;
        }
      },
    }
  };
</script>
