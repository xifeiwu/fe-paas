<template>
  <div id="work-order-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="page-title">
      <span>{{pageType === 'modify' ? '修改工单' : '申请工单'}}</span>
      <el-tooltip slot="trigger" effect="dark" placement="bottom">
        <div slot="content">
          <div>申请工单注意事项</div>
          <div>1. 工单只可用来处理生产环境的服务。</div>
          <div>2. 在所选应用对应工单处理完成前，不可对该应用提交新的工单。</div>
        </div>
        <i class="paas-icon-fa-question" style="font-size: 14px; color: #E6A23C; cursor: pointer"></i>
      </el-tooltip>
    </div>
    <div class="section section-basic">
      <el-form :model="formData" :rules="formDataRules"
               ref="basicForm"
               :class="{'message-show': pageType === 'modify'}"
               size="mini"
               label-width="120px">
        <el-form-item label="申请人">
          {{formData.creatorName}}
        </el-form-item>
        <el-form-item label="审批工单名称" prop="name">
          <span v-if="pageType === 'modify'">{{formData.name}}</span>
          <el-input v-model="formData.name" placeholder="100字符内" v-else></el-input>
        </el-form-item>
        <el-form-item label="团队名称" prop="groupId">
          <span v-if="pageType === 'modify'">{{dataPassed.groupName}}</span>
          <el-select v-model="$storeHelper.currentGroupID" filterable placeholder="请选择" v-else>
            <el-option v-for="item in $storeHelper.groupList" :key="item.id" :label="item.asLabel" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="section section-feature">
      <div class="title">功能列表</div>
      <div class="feature-form-list">
        <my-feature v-for="(item, index) in formData.featureList" :key="index" ref="featureForm"
                    :id="index"
                    :featureInfo="item"
                    :showAdd="index == formData.featureList.length - 1"
                    :showRemove="formData.featureList.length > 1"
                    @add="addFeatureComponent"
                    @remove="removeFeatureComponent"
        >{{item}}</my-feature>
      </div>
    </div>
    <div class="section section-application">
      <div class="title">程序列表</div>
      <el-form :model="formData" :rules="formDataRules"
               ref="applicationForm"
               size="mini"
               label-width="100px">
        <el-form-item label="应用名称" prop="appIdList">
          <el-select  v-model="formData.appIdList"
                      filterable multiple
                      placeholder="请选择">
            <el-option v-for="(item, index) in productionServiceList" :disabled="item.disabled"
                       :key="item.id" :value="item.id" :label="item.label"
            >
              <div style="display: flex; justify-content: space-between">
                <span><span>{{item.appName}}</span>（<span :class="[`g-env-${item.profileName}-color`]">{{item.profileDescription}}</span>）</span>
                <span v-if="item.hasOwnProperty('workOrder')"
                      style="color: #E6A23C; font-size: 12px;">(有未完成工单：{{item['workOrder']['name']}})</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="section section-acceptance">
      <div class="title">验收信息</div>
      <el-form :model="formData" :rules="formDataRules"
               ref="acceptanceForm"
               size="mini"
               label-width="100px">
        <el-form-item label="验收人" prop="acceptedUserIdList">
          <el-select filterable v-model="formData.acceptedUserIdList" multiple placeholder="请选择">
            <el-option v-for="item in $storeHelper.usersInGroup" :key="item.userId" :label="item.realName" :value="item.userId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="知会人" prop="notifyUserIdList">
          <el-select filterable v-model="formData.notifyUserIdList" multiple placeholder="请选择">
            <el-option v-for="item in usersAll" :key="item.id" :label="item.realName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮件组" prop="mailGroupList" class="mail-group">
          <el-tag
                  v-for="tag in formData.mailGroupList"
                  size="small"
                  :key="tag"
                  closable
                  type="success"
                  @close="handleMailGroup('remove', tag)"
          >{{tag}}</el-tag>
          <el-input v-model="mailGroup" placeholder="请填写">
            <template slot="append">
              <div class="add-mail-group-btn" @click="handleMailGroup('add', mailGroup)">
                <span>添加</span>
              </div>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="工单备注" prop="comment">
          <el-input v-model="formData.comment"
                    type="textarea"
                    placeholder="不超过200个字符"
                    :rows="2"
                    ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="section section-operation-history" v-if="pageType === 'modify'">
      <div class="title">操作记录</div>
      <el-table :data="dataPassed.operationList" class="compact">
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
    <div class="page-footer">
      <div class="item">
        <el-button size="mini" type="primary" @click="handleButtonClick('submit')">提 交</el-button>
      </div>
      <div class="item" v-if="pageType === 'modify'">
        <el-button size="mini" type="primary" @click="handleButtonClick('remove')">删 除</el-button>
      </div>
      <div class="item">
        <el-button size="mini" type="primary" @click="handleButtonClick('back')">取 消</el-button>
      </div>
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
      width: 100%;
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
          cursor: pointer;
          color: #E6A23C;
          padding: 0px 8px;
          font-weight: bold;
          &:hover {
            /*color: #E68C0F;*/
            color: #F4B805;
          }
        }
      }
    }
  }
  #work-order-add {
    background: white;
    margin-top: 10px;
    margin-left: 15px;
    padding: 10px 20px 10px 20px;
    width: 860px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    .page-title {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 15px 0px;
    }
    .page-footer {
      display: flex;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e7e7e7;
      .item {
        flex: 1;
        text-align: center;
      }
      .el-button {
        width: 120px;
      }
    }
    .section {
      width: 90%;
      .title {
        font-weight: bold;
        border-left: 5px solid gray;
        padding-left: 5px;
        margin: 0px 0px 12px -2px;
      }
    }
    .section-basic {
      margin-bottom: 22px;
      .el-form {
        .el-form-item {
        }
      }
    }
    .section-feature {
      width: 100%;
      margin-bottom: 12px;
      .feature-form-list {
        text-align: left;
        .work-order-feature {
          margin-right: 5px;
          display: inline-block;
          width: calc(50% - 10px);
        }
      }
    }
    .section-application {
      margin-bottom: 22px;
    }
    .section-acceptance {
      margin-bottom: 22px;
      textarea {
        margin-top: 3px;
      }
    }
    .section-operation-history {
      .el-table {
        margin-left: 20px;
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
      var goBack = false;
      this.pageType = (this.$route['path'] == this.$net.page['profile/work-order/todo/modify']) ? 'modify' : 'add';

      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer && dataTransfer.hasOwnProperty('from')) {
        if (this.pageType === 'add') {
          switch (dataTransfer['from']) {
            case this.$net.page['profile/service']:
              this.dataPassed.appIdList = [dataTransfer['data']['appId']];
              // appStatusList is not passed by default
              this.dataPassed.appStatusList = dataTransfer['data'].hasOwnProperty('appStatusList') ? dataTransfer['data']['appStatusList'] : null;
              break;
            case this.$net.page['profile/work-order/todo']:
              this.dataPassed.appStatusList = dataTransfer['data'].hasOwnProperty('appStatusList') ? dataTransfer['data']['appStatusList'] : null;
              break;
          }
        } else if (this.pageType === 'modify') {
          switch (dataTransfer['from']) {
            case this.$net.page['profile/work-order/todo']:
              const detail = dataTransfer['data'];
              this.formData.groupId = detail['groupId'];
              this.formData.name = detail['name'];
              this.formData.creatorName = detail['creatorName'];
              this.formData.featureList = detail['featureList'];
              // dataPassed.appIdList will filtered onAppInfoListOfGroup
              this.dataPassed.appIdList = detail['appList'].map(it => it['appId']);
              this.formData.acceptedUserIdList = detail['acceptedUserIdList'];
              this.formData.notifyUserIdList = detail['notifyUserIdList'];
              this.formData.mailGroupList = detail['mailGroupList'];
              this.formData.comment = detail['comment'];
//              console.log(detail);
//              console.log(this.formData);

              this.dataPassed.workOrderId = detail['id'];
              this.dataPassed.groupName = detail['groupName'];
              this.dataPassed.operationList = detail['operationList'];
              // update groupId if necessary
              if (this.$storeHelper.currentGroupID != detail['groupId']) {
                this.$storeHelper.currentGroupID = detail['groupId']
              }
              break;
          }
        }
        this.$storeHelper.dataTransfer = null;
      } else {
        if (this.pageType === 'modify') {
          goBack = true;
        }
      }
      if (goBack) {
        this.$router.go(-1);
        return;
      }

      // get productionServiceListOfGroup
      this.onCurrentGroupID(this.$storeHelper.currentGroupID);
      this.onAppInfoListOfGroup(this.$storeHelper.appInfoListOfGroup);
    },
    mounted() {
      // should have at least one feature item
      if (this.pageType === 'add') {
        if (this.formData.featureList.length == 0) {
          this.formData.featureList.push({
            id: 1,
            name: '',
            type: WorkOrderPropUtils.getFeatureTypeList()[0]['id'],
            jiraAddress: null,
            description: null,
            valid: false
          })
        }
      }
    },
    data() {
      return {
        pageType: 'add',
        // 生产(预发布)环境服务列表
        productionServiceList: [],
        showLoading: false,
        loadingText: '',
//        appStatusList: null,

        dataPassed: {
          // for add and modify
          // for el-option, appIdList passed will not be disabled
          appIdList: null,
          appStatusList: null,
          // for modify
          workOrderId: '',
          groupName: '',
          operationList: [],
        },

        formDataRules: WorkOrderPropUtils.rules.workOrder,
        mailGroup: '',
        formData: {
          groupId: this.$storeHelper.currentGroupID,
          name: '',
          creatorName: this.$storeHelper.getUserInfo('realName'),
          featureList: [],
          appIdList: [],
          acceptedUserIdList: [],
          notifyUserIdList: [],
          mailGroupList: [],
          comment: '',
        },
      };
    },
    computed: {
      usersAll() {
        return this.$storeHelper.usersAll();
      }
    },
    watch: {
      '$storeHelper.groupInfo.id': 'onCurrentGroupID',
      '$storeHelper.appInfoListOfGroup': 'onAppInfoListOfGroup',
    },
    methods: {
      onCurrentGroupID(value) {
        if (!value) {
          return;
        }
        this.$store.dispatch('user/usersInGroup');
        // data should be init at change of group
        this.formData.groupId = this.$storeHelper.currentGroupID;
      },

      // 获得生产环境的profileInfo，并将该生产环境下的appIdList加入到profileInfo
      async getProductionProfileList() {
        const productionProfileList = this.$storeHelper.profileListOfGroup.filter(it => {
          // FinupFriends特殊处理
          if (this.$storeHelper.groupInfo.tag === 'ff') {
            return it.spaceType === 'PRODUCTION' && it.name !== 'production';
          } else {
            return it.spaceType === 'PRODUCTION';
          }
        });

        var count = 0;
        await new Promise((resolve, reject) => {
          productionProfileList.forEach(async profileInfo => {
            const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_profile, {
              payload: {
                groupId: this.$storeHelper.currentGroupID,
                spaceId: profileInfo.id
              }
            });
            const appIdList = resContent['applicationServiceList'].filter(it => it.id !== null).map(it => it.appId);
            profileInfo['appIdList'] = appIdList;
            count++;
            if (count === productionProfileList.length) {
              resolve();
            }
          });
        });
        return productionProfileList;
      },

      // set defaultAppID(first element in array) for this.formData.appID
      async onAppInfoListOfGroup(value) {
        if (!value) {
          return;
        }
//        console.log('onAppInfoListOfGroup');
//        console.log(this.dataPassed.appStatusList);
//        console.log(this.$net.URL_LIST.work_order_app_status);
        this.formData.appIdList = [];

        var appStatusList = [];
        // use appStatusList passed first
        if (this.dataPassed.appStatusList) {
          appStatusList = this.dataPassed.appStatusList;
          this.dataPassed.appStatusList = null;
        } else {
          const appIdList = this.$storeHelper.appInfoListOfGroup['appList'].map(it => it['appId']);
          appStatusList = await this.$net.requestPaasServer(this.$net.URL_LIST.work_order_app_status, {
            payload: {
              appIdList
            }
          });
        }
//        console.log(appStatusList);
        const productionServiceList = [];
        const productionProfileList = await this.getProductionProfileList();
        const appModelListOfGroup = this.$storeHelper.appInfoListOfGroup['appModelList'].map(it => {
          return {
            appId: it.appId,
            appName: it.appName
          }
        });
        appModelListOfGroup.forEach(app => {
          productionProfileList.forEach(profile => {
            if (profile.appIdList.includes(app.appId)) {
              var item = {
                appId: app.appId,
                appName: app.appName,
                profileId: profile.id,
                profileName: profile.name,
                profileDescription: profile.description,
              };
              item.id = `${item.appId}-${item.profileId}`;
              item.label = `${item.appName}（${item.profileDescription}）`;
              productionServiceList.push(item)
            }
          });
        });
        // console.log(appModelListOfGroup);
        // console.log(productionProfileList);
        // console.log(productionServiceList);

        // 更新工单处理状态
        productionServiceList.forEach(it => {
          const appId = it['appId'];
          if (appStatusList.hasOwnProperty(it['appId'])) {
            it['workOrder'] = appStatusList[appId];
          }
          // if el-option for this app can be selected
          let disabled = it.hasOwnProperty('workOrder');

          // if (this.pageType === 'modify') {
            // 对于修改工单，如果页面传递过的appIdList中包含当前appId，则为当前工单
            // if (this.dataPassed.appIdList && this.dataPassed.appIdList.indexOf(appId) > -1) {
            //   it['workOrder']['name'] = '当前工单';
            //   disabled = false;
            // }
          // }
          it['disabled'] = disabled;
        });
        this.productionServiceList = productionServiceList;

        // append appIdList passed to this.formData.appIdList
        // if (this.dataPassed.appIdList) {
        //   var appIdListToAppend = [];
        //   if (this.pageType === 'modify') {
        //     var appIdAll = appModelListOfGroup.map(it => it['appId']);
        //     appIdListToAppend = this.dataPassed.appIdList.filter(it => {
        //       return appIdAll.indexOf(it) >= -1;
        //     });
        //   } else {
        //     var appIdCanSelect = appModelListOfGroup.filter(it => !it.hasOwnProperty('workOrder')).map(it => it['appId']);
        //     appIdListToAppend = this.dataPassed.appIdList.filter(it => appIdCanSelect.indexOf(it) > -1);
        //   }
        //   this.formData.appIdList = this.formData.appIdList.concat(appIdListToAppend);
        //   if (appIdListToAppend.length != this.dataPassed.appIdList.length) {
        //     console.log(`some appId is ignored!`);
        //   }
        // }
      },
      // 添加功能描述
      addFeatureComponent() {
        let maxID = 0;
        this.formData.featureList.forEach(it => {
          if (it.id > maxID) {
            maxID = it.id;
          }
        });
        this.formData.featureList.push({
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
        let featureList = this.formData.featureList;
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
        let mailGroupList = this.formData.mailGroupList;
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

      async handleButtonClick(action) {
        switch (action) {
          case 'submit':
//            console.log(this.formData);
//            console.log(this.$refs['featureForm']);
//            return;
            if (!WorkOrderPropUtils.checkComment(this.formData.comment)) {
              this.$message.error('评论内容只能包含字母，数字，下划线，中划线等常规字符');
              return;
            }
            const basicPromise = new Promise((resolve, reject) => {
              this.$refs['basicForm'].validate((valid) => {
                resolve(valid);
              });
            });

            const featurePromise = new Promise((resolve, reject) => {
              Promise.all(this.$refs['featureForm'].map(it => it.validate())).then(results => {
                let valid = results.reduce((sum, it) => {
                  return sum && it[0];
                }, true);
                resolve(valid);
              }).catch(err => {
                resolve(false);
              })
            });
            const applicationPromise = new Promise((resolve, reject) => {
              this.$refs['applicationForm'].validate((valid) => {
                resolve(valid);
              });
            });
            const acceptancePromise = new Promise((resolve, reject) => {
              this.$refs['acceptanceForm'].validate((valid) => {
                resolve(valid);
              });
            });
            const results = await Promise.all([basicPromise, featurePromise, applicationPromise, acceptancePromise]);
            const valid = results.reduce((sum, valid) => {
              return sum && valid;
            });
            if (valid) {
              // check the format of el-form-item
              const toPost = {
                workOrderDeploy: {
                  name: this.formData.name,
                  groupId: this.$storeHelper.groupInfo['id'],
                  groupName: this.$storeHelper.groupInfo['name'],
                  remark: this.formData.comment
                }
              };
              // 功能列表
              toPost.workOrderDeployFunctionList = this.formData.featureList.map(it => {
                return {
                  functionName: it.name,
                  functionType: it.type,
                  jiraAddress: it.jiraAddress,
                  description: it.description
                }
              });
              // 应用列表
              toPost.workOrderDeployAppList = this.formData.appIdList.map(it => {
                return {
                  appId: it
                }
              });
              // 验收人
              let userAcceptedList = this.$storeHelper.getUserInfoByID(this.formData.acceptedUserIdList);
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
              let userNotifyList = this.$storeHelper.getUserInfoByID(this.formData.notifyUserIdList);
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
              toPost.emailGroupList = this.formData.mailGroupList.map(it => {
                return {
                  emailGroupName: it
                }
              });
//                console.log(toPost);
              this.showLoading = true;
              this.loadingText = '正在提交工单"' + this.formData.name + '"';

              try {
                let urlDesc = this.$net.URL_LIST.work_order_create;
                let action = '创建';
                if (this.pageType === 'modify') {
                  urlDesc = this.$net.URL_LIST.work_order_modify;
                  toPost.workOrderDeploy.id = this.dataPassed.workOrderId;
                  action = '更新'
                }
                await this.$net.requestPaasServer(urlDesc, {
                  payload: toPost
                });
                this.$alert(`工单 "${this.formData.name}" ${action}成功，即将进入工单列表页`, `${action}工单成功`, {
                  confirmButtonText: '确定',
                  callback: () => {
                    this.$router.push(this.$net.page['profile/work-order/list']);
                  }
                });
                this.showLoading = false;
                this.loadingText = '';
              } catch (err) {
                this.showLoading = false;
                this.loadingText = '';
                this.$notify.error({
                  title: `${action}工单失败`,
                  message: msg
                });
              }
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
            break;
          case 'remove':
            try {
              const warningMsg = `确定要删除工单 “${this.formData.name}”  吗？`;
              await this.$confirm(warningMsg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              await this.$net.requestPaasServer(this.$net.URL_LIST.work_order_remove, {
                payload: {
                  workOrderDeployId: this.dataPassed.workOrderId
                }
              });
              this.$message.success(`工单 “${this.formData.name}” 删除成功！`);
              this.$router.go(-1);
            } catch (err) {
            }
            break;
          case 'back':
            this.$router.go(-1);
            break;
        }
      },
    }
  };
</script>
