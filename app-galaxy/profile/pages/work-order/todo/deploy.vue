<template>
  <div id="work-order-handle">
    <div class="section-title">
      <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
        <div slot="content">
          <div>部署工单注意事项</div>
          <div>1. 点击最下面的部署工单按钮，将会弹出对话框展示部署状态</div>
          <div>2. 部署（成功或失败）完成，仍需点击"处理完成"或"拒绝处理"，以便更新工单状态</div>
          <div>3. 拒绝处理，需要填写审批意见</div>
        </div>
        <span>部署工单<i class="el-icon-question"></i></span>
      </el-tooltip>
    </div>
    <div class="section-body">
      <my-show-detail :workOrderDetail="workOrderDetail" :showAppDeploy="true" @app-deploy="handleButtonClick"></my-show-detail>
      <el-form labelWidth="110px" size="mini" :model="handleInfo" :rules="rules" ref="handle-form">
        <el-form-item label="审批意见" prop="comment" class="comment">
          <el-input v-model="handleInfo.comment"
                    type="textarea"
                    :rows="2"
                    placeholder="不超过200个字符"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="section-footer">
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('back')">返回</el-button>
      <el-button
              size="mini"
              type="primary"
              v-if="!$storeHelper.permission['work-order_deploy_app'].hide && false"
              @click="handleButtonClick('deploy')">部署应用</el-button>
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('reject-handle')">拒绝处理</el-button>
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('finish-handle')">处理完成</el-button>
    </div>
    <paas-dialog-for-log title="部署日志" :showStatus="dialogForLogStatus" ref="dialogForDeployLog">
      <div slot="content">
        <div v-for="(item, index) in deployLogs" :key="index" class="log-item" v-html="item"></div>
      </div>
    </paas-dialog-for-log>
  </div>
</template>

<style lang="scss">
  #work-order-handle {
    .el-form {
      .el-form-item {
        .el-textarea {
          textarea {
            font-size: 12px;
          }
        }
      }
    }

    .dialog-for-log {
      .el-dialog {
        width: 95%;
      }
      .log-item {
        /*white-space: pre;*/
        max-width: 100%;
        word-wrap: break-word;
        word-break: break-all;
        line-height: 1.4;
      }
      .info {
        color: #409EFF;
        font-weight: bold;
      }
      .warning {
        color: #E6A23C;
        font-weight: bold;
      }
      .error {
        color: #F56C6C;
        font-weight: bold;
      }
      .success {
        color: #67C23A;
        font-weight: bold;
      }
    }
  }
</style>
<style lang="scss" scoped>
  #work-order-handle {
    background: white;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    width: 800px;
    margin: 20px;
    margin-left: 30px;
    padding: 18px;
    .section-title {
      text-align: center;
      margin: 15px 0px;
    }
    .section-footer {
      text-align: center;
    }
  }
</style>

<script>
  import WorkOrderPropUtils from '../utils/work-order-props';
  import MyShowDetail from '../components/show-detail.vue';
  import paasDialogForLog from '../../components/dialog4log.vue';
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    mixins: [commonUtils],
    components: {paasDialogForLog, MyShowDetail},
    created() {
    },
    mounted() {
      const workOrderDetail = this.$storeHelper.getTmpProp('workOrderDetail');
      if (!workOrderDetail || !workOrderDetail.hasOwnProperty('id')) {
        this.$router.push(this.$net.page['profile/work-order/todo']);
        return;
      }
      this.workOrderDetail = workOrderDetail;
    },
    data() {
      return {
        workOrderDetail: {},
        handleInfo: {
          comment: '',
        },
        rules: {
          comment: [{
            required: false,
            message: '拒绝处理必须填写审批意见',
            trigger: 'blur'
          }],
        },

        showLoading: false,
        loadingText: '',

        dialogForLogStatus: {
          visible: false,
          full: false,
          showLoading: false,
          iconExpand: true
        },
        deployLogs: []
      }
    },
    methods: {

      /**
       *
       * @param type, 'quick-deploy' or 'deploy'
       * @returns {Promise<Promise<T>|Promise<never>|Promise.<*>>}
       */
      async serviceDeploy(payload) {
        // request and show log
        const filterReg = /^ *\[( *(?:INFO|WARNING|ERROR) *)\](.*)$/;
        // recursive function to fetch log from server with options {logName, logPath, offset}
        const getDeployLog = async (options) => {
          // stop request deploy log when the window is closed
          if (!this.dialogForLogStatus.visible) {
            return Promise.reject('弹框关闭');
          }
          const resContent = await this.$net.serviceGetDeployLog(options);
          if (resContent.hasOwnProperty('Orchestration')) {
            const orchestration = resContent['Orchestration'];
            const logs = orchestration.log;
            if (logs) {
              const logList = logs.split('\n').filter(it => {
                return it;
              }).map(it => {
                // replace white-space with &nbsp
                return it.replace(/^( *)(.*)$/, (match, p1, p2) => {
                  return '&nbsp;'.repeat(p1.length) + p2;
                });
              }).map(it => {
                return it.replace(filterReg, (match, p1, p2, offset, string) => {
                  // console.log(match, p1, offset, string);
                  p2 = p2.replace(/(BUILD )*SUCCESS/g, (match, p1, offset, string) => {
                    return `<span class="success">${match}</span>`;
                  });
                  p2 = p2.replace(/BUILD FAILURE/g, (match, p1, offset, string) => {
                    return `<span class="error">${match}</span>`;
                  });
                  let result = '';
                  switch (p1.toUpperCase()) {
                    case 'INFO':
                      result = `[<span class="info">${p1}</span>]${p2}`;
                      break;
                    case 'WARNING':
                      result = `[<span class="warning">${p1}</span>]${p2}`;
                      break;
                    case 'ERROR':
                      result = `[<span class="error">${p1}</span>]<span class="error">${p2}</span>`;
                      break;
                  }
                  return result;
                });
              });
              orchestration.logList = logList;
              return orchestration;
            } else {
              // may be orchestration has not prop log at start
              return orchestration;
            }
          } else {
            throw new Error('格式不正确');
          }
        };

//        const desc = this.getVersionDescription(this.selected.service);
        const warningMsg = '确定要部署应用吗？';
        const urlDesc = this.$net.URL_LIST.work_order_app_deploy;
        await this.warningConfirm(warningMsg);
        const resContent = await this.$net.requestPaasServer(urlDesc, {
          payload
        });
        if (resContent.hasOwnProperty('orchestration')) {
          this.deployLogs = [];
          this.dialogForLogStatus.visible = true;
          this.dialogForLogStatus.showLoading = true;
          let orchestration = resContent['orchestration'];

          while(orchestration && orchestration['moreData']) {
            await new Promise((resolve) => {
              setTimeout(resolve, 1500);
            });
            orchestration = await getDeployLog({
              logName: orchestration.logName,
              logPath: orchestration.logPath,
              offset: null == orchestration.offset ? 0 : orchestration.offset
            });
            if (!orchestration) {
              break;
            }
            if (orchestration.hasOwnProperty('logList')) {
              // stop showLoading when orchestration.log is not null
              this.dialogForLogStatus.showLoading = false;
              this.deployLogs = this.deployLogs.concat(orchestration['logList']);
              // scroll after render finish
              this.$nextTick(() => {
                if (this.$refs.hasOwnProperty('dialogForDeployLog')) {
                  let dialogForDeployLog = this.$refs['dialogForDeployLog'];
                  dialogForDeployLog.isScrolledBottom && dialogForDeployLog.scrollToBottom();
                }
              });
            }
          }
          return Promise.reject('已拉取所有日志');
        } else {
          return Promise.reject({
            title: '数据格式错误',
            message: '未找到orchestration'
          })
        }
      },

      getProductionProfile() {
        const profileType = 'PRODUCTION';
        const profileInfo = this.$storeHelper.getProfileInfoByType(profileType);
        return profileInfo;
      },

      async handleButtonClick(action, index, row) {
        switch (action) {
          case 'app-deploy':
//            console.log(index, row);
            var profileInfo = this.getProductionProfile();
            if (!profileInfo || !profileInfo.hasOwnProperty('id')) {
              this.$message.error('未找到profileID');
              return;
            }
            if (!row.serviceVersion || !row.appId) {
              this.$message.error('信息不完整：请检查应用名和版本是否完整！');
              return;
            }
            try {
              await this.serviceDeploy({
                applicationId: row.appId,
                spaceId: profileInfo.id,
                serviceVersion: row.serviceVersion,
                groupId: this.$storeHelper.currentGroupID
              });
            } catch (err) {
              console.log(err);
            }
            break;
          case 'deploy':
//            console.log(this.workOrderDetail);
//            console.log(profileInfo);
            var profileInfo = this.getProductionProfile();
            if (!profileInfo || !profileInfo.hasOwnProperty('id')) {
              this.$message.error('未找到profileID');
              return;
            }
            if (!this.workOrderDetail.serviceVersion || !this.workOrderDetail.appID) {
              this.$message.error('信息不完整：请检查应用名和版本是否完整！');
              return;
            }
            try {
              await this.serviceDeploy({
                applicationId: this.workOrderDetail.appID,
                spaceId: profileInfo.id,
                serviceVersion: this.workOrderDetail.serviceVersion,
                groupId: this.$storeHelper.currentGroupID
              });
            } catch (err) {
              console.log(err);
//              this.hideWaitingResponse(action);
            }
            break;
          case 'back':
            this.$router.go(-1);
            break;
          case 'finish-handle':
            this.submitWorkOrder(false);
            break;
          case 'reject-handle':
            this.submitWorkOrder(true);
            break;
        }
      },
      submitWorkOrder(reject) {
        if (!WorkOrderPropUtils.checkComment(this.handleInfo.comment)) {
          this.$message.error('评论内容只能包含字母，数字，下划线，中划线等常规字符');
          return;
        }
        // change rules according to user select
        this.rules.comment[0].required = reject;
        this.$refs.hasOwnProperty('handle-form') && this.$refs['handle-form'].validate(valid => {
          if (valid) {
            this.showLoading = true;
            this.loadingText = '正在处理工单"' + this.workOrderDetail.name + '"';
            let options = {
              id: this.workOrderDetail.id,
              handleResult: !reject,
              status: this.workOrderDetail.status,
              remark: this.handleInfo.comment
            };
//            console.log(options);
            this.$net.handleWorkOrder(options).then(msg => {
//              console.log(msg);
              this.$alert('处理成功！即将进入待办工单页。', msg, {
                confirmButtonText: '确定',
                callback: (action) => {
                  // value of action: confirm, cancel
//                  if ('confirm' === action) {
                    this.$router.push(this.$net.page['profile/work-order/todo']);
//                  }
                }
              });
              this.showLoading = false;
              this.loadingText = '';
            }).catch(msg => {
              console.log(msg);
              this.$alert('处理失败！请与管理员联系。点击确定，进入待办工单列表页', msg, {
                confirmButtonText: '确定',
                callback: (action) => {
                  this.$router.push(this.$net.page['profile/work-order/todo']);
                }
              });
              this.showLoading = false;
              this.loadingText = ''
            });
          }
        });
      }
    }
  }
</script>