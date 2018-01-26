<template>
  <div id="work-order-handle">
    <div class="section-title">
      <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
        <div slot="content">
          <div>部署应用注意事项</div>
          <div>1. 点击最下面的部署应用按钮，将会弹出对话框展示部署状态</div>
          <div>2. 部署（成功或失败）完成，仍需点击"处理完成"或"拒绝处理"，以便更新工单状态</div>
          <div>3. 拒绝处理，需要填写审批意见</div>
        </div>
        <span>部署应用<i class="el-icon-question"></i></span>
      </el-tooltip>
    </div>
    <div class="section-body">
      <my-show-detail :workOrderDetail="workOrderDetail"></my-show-detail>
      <el-form labelWidth="120px" size="mini" :model="handleInfo" :rules="rules" ref="handle-form">
        <el-form-item label="审批意见" prop="comment" class="comment">
          <el-input v-model="handleInfo.comment"
                    type="textarea"
                    :rows="2"
                    placeholder="无"
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
    <my-dialog-for-log title="部署日志" :showStatus="dialogForLogStatus" ref="dialogForDeployLog">
      <div slot="log-list">
        <div v-for="(item,index) in deployLogs" :key="index" class="log-item">{{item}}</div>
      </div>
    </my-dialog-for-log>
  </div>
</template>

<style lang="scss">
  #work-order-handle {
    margin: 25px auto;
    width: 80%;
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
  import MyShowDetail from '../utils/components/show-detail.vue';
  import MyDialogForLog from '../../utils/components/dialog4log.vue';
  import ElSelect from "element-ui/packages/select/src/select";
  import ElOption from "element-ui/packages/select/src/option";
  import ElFormItem from "element-ui/packages/form/src/form-item";
  export default {
    components: {MyDialogForLog, MyShowDetail, ElFormItem, ElOption, ElSelect},
    created() {
    },
    mounted() {
      let workOrder = this.$store.getters['app/currentWorkOrder'];
      if (!workOrder || !workOrder.hasOwnProperty('id')) {
        this.$router.push('/profile/work-order/todo');
        return;
      }
      this.$nextTick(() => {
//        this.getWorkOrderDetail(workOrder)
        WorkOrderPropUtils.getWorkOrderDetailByBasic(this, workOrder).then(detail => {
          console.log(detail);
          this.workOrderDetail = detail;
        }).catch(err => {
        })
      });
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
          showLoading: false
        },
        deployLogs: []
      }
    },
    methods: {
      handleButtonClick(action) {
        switch (action) {
          case 'deploy':
            // request and show log
            function showDeployLog(options) {
              this.deployLogs = [];
              this.dialogForLogStatus.visible = true;

              // recursive function to fetch log from server with options {logName, logPath, offset}
              function getDeployLog(options) {
                // stop request deploy log when the window is closed
                if (!this.dialogForLogStatus.visible) {
                  return;
                }
                this.$net.workOrderFetchDeployLog(options).then(content => {
                  if (content.hasOwnProperty('orchestrationVO')) {
                    let Orchestration = content['orchestrationVO'];
                    let log = Orchestration.log;
//                    console.log(Orchestration);
//                    console.log(content);
  //                  console.log(Orchestration.offset);
                    if (log) {
                      // scroll after render finish
                      this.deployLogs = this.deployLogs.concat(log.split('\n'));
                      this.$nextTick(() => {
                        this.$refs.hasOwnProperty('dialogForDeployLog') &&
                        this.$refs['dialogForDeployLog'].scrollToBottom();
                      });
                    }
                    options.offset = Orchestration.offset;
                    if (null != log) {
                      setTimeout(() => {
                        getDeployLog.call(this, options);
                      }, 1800);
                    }
                  }
                }).catch(err => {
                  console.log(err);
                });
              }

              setTimeout(() => {
                getDeployLog.call(this, options);
              }, 1500);
            }
//            let profileType = 'DEV';
            let profileType = 'PRODUCTION';
            let profileInfo = this.$global.getProfileInfoByType(profileType);
            if (!profileInfo || !profileInfo.hasOwnProperty('id')) {
              this.$message.error('未找到profileID');
              return;
            }
            if (!this.workOrderDetail.serviceVersion || !this.workOrderDetail.appID) {
              this.$message.error('信息不完整：请检查应用名和版本是否完整！');
              return;
            }

            this.$net.workOrderDeployApp({
              applicationId: this.workOrderDetail.appID,
              spaceId: profileInfo.id,
              serviceVersion: this.workOrderDetail.serviceVersion,
              groupId: this.$global.currentGroupID
            }).then(content => {
//              console.log(content);
              if (content.hasOwnProperty('orchestration')) {
                let orchestration = content['orchestration'];
                showDeployLog.call(this, {
                  logName: orchestration.logName,
                  logPath: orchestration.logPath,
                  offset: null == orchestration.offset ? 0 : orchestration.offset
                });
              }
            }).catch(err => {
              this.$notify({
                title: '部署失败',
                message: err,
                duration: 0,
                onClose: function () {
                }
              });
            });
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
        this.$refs.hasOwnProperty('handle-form')  && this.$refs['handle-form'].validate(valid => {
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
              this.$alert('点击确定，将进入工单列表页', msg, {
                confirmButtonText: '确定',
                callback: (action) => {
                  if ('confirm' === action) {
                    this.$router.push('/profile/work-order/list');
                  }
                }
              });
              this.showLoading = false;
              this.loadingText = '';
            }).catch(msg => {
              console.log(msg);
              this.$alert('请与管理员联系。点击确定，进入待办工单列表页', msg, {
                confirmButtonText: '确定',
                callback: (action) => {
                  if ('confirm' === action) {
                    this.$router.push('/profile/work-order/todo');
                  }
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