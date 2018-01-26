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
    <el-form labelWidth="120px" size="mini" :model="handleInfo" :rules="rules" ref="handle-form">
      <el-form-item label="工单名称">{{workOrderDetail.name}}</el-form-item>
      <el-form-item label="申请人">{{workOrderDetail.creatorName}}</el-form-item>
      <el-form-item label="团队名称">{{workOrderDetail.groupName}}</el-form-item>
      <el-form-item label="功能列表">
        <el-table :data="workOrderDetail.featureList">
          <el-table-column label="功能名称" prop="name" headerAlign="center">
          </el-table-column>
          <el-table-column label="功能类型" prop="typeName" headerAlign="center">
          </el-table-column>
          <el-table-column label="jira地址" prop="jiraAddress" headerAlign="center">
          </el-table-column>
          <el-table-column label="功能描述" prop="description" headerAlign="center">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="应用名/版本">
        <span>{{workOrderDetail.appName}}</span>
        <span>/</span>
        <span v-if="workOrderDetail.serviceVersion">{{workOrderDetail.serviceVersion}}</span><span v-else>版本未知</span>
      </el-form-item>
      <el-form-item label="待办人">{{workOrderDetail.userToDo}}</el-form-item>
      <el-form-item label="团队名称">{{workOrderDetail.groupName}}</el-form-item>
      <el-form-item label="验收人">
        <el-table :data="workOrderDetail.acceptedUserList">
          <el-table-column label="验收人" prop="userName" headerAlign="center">
          </el-table-column>
          <el-table-column label="状态" prop="status" headerAlign="center">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="知会人" class="notify-user-list">
        <span v-for="item in workOrderDetail.notifyUserList" :key="item.userId">{{item.userName}}</span>
      </el-form-item>
      <el-form-item label="邮件组" class="mail-group-list">
        <span v-for="(item, index) in workOrderDetail.mailGroupList" :key="index" v-if="workOrderDetail.mailGroupList.length > 0">
          {{item}}
        </span>
        <span v-else>未设置</span>
      </el-form-item>
      <el-form-item label="操作记录">
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
      </el-form-item>
      <el-form-item label="备注">
        <span v-if="workOrderDetail.comment">{{workOrderDetail.comment}}</span>
        <span v-else>无备注</span>
      </el-form-item>
      <el-form-item label="工单状态">
        <span>{{workOrderDetail.statusName}}</span>
      </el-form-item>
      <el-form-item label="审批意见" prop="comment" class="comment">
        <el-input v-model="handleInfo.comment"
                  type="textarea"
                  :rows="2"
                  placeholder="无"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="section-footer">
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('deploy')">部署应用</el-button>
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('finish-handle')">处理完成</el-button>
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('reject-handle')">拒绝处理</el-button>
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('close')">关闭</el-button>
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
    .el-form {
      .el-form-item {
        margin-bottom: 6px;
        &.test-type, &.test-report, &.comment {
          margin-bottom: 14px;
        }
        &.notify-user-list, &.mail-group-list{
          .el-form-item__content {
            span::after {
              content: '，';
            }
            span:last-child::after {
              content: '';
            }
          }
        }
      }
    }
  }
</style>

<script>
  import WorkOrderPropUtils from '../utils/work-order-props';
  import MyDialogForLog from '../../utils/components/dialog4log.vue';
  import ElSelect from "element-ui/packages/select/src/select";
  import ElOption from "element-ui/packages/select/src/option";
  import ElFormItem from "element-ui/packages/form/src/form-item";
  export default {
    components: {MyDialogForLog, ElFormItem, ElOption, ElSelect},
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
                this.$net.serviceDeployLog(options).then(content => {
                  if (content.hasOwnProperty('Orchestration')) {
                    let Orchestration = content.Orchestration;
                    let log = Orchestration.log;
  //                  console.log(log);
  //                  console.log(content);
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

            let profileInfo = this.$global.getProfileInfoByType('PRODUCTION');
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
          case 'close':
            this.$router.go(-1);
            break;
          case 'finish-handle':
            if (!WorkOrderPropUtils.checkComment(this.handleInfo.comment)) {
              this.$message.error('评论内容只能包含字母，数字，下划线，中划线等常规字符');
              return;
            }
            this.handleSubmit(false);
            break;
          case 'reject-handle':
            if (!WorkOrderPropUtils.checkComment(this.handleInfo.comment)) {
              this.$message.error('评论内容只能包含字母，数字，下划线，中划线等常规字符');
              return;
            }
            this.handleSubmit(true);
            break;
        }
      },
      handleSubmit(reject) {
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
              this.$alert('即将进入待办工单列表页', msg, {
                confirmButtonText: '确定',
                callback: () => {
                  this.$router.push('/profile/work-order/todo');
                }
              });
              this.showLoading = false;
              this.loadingText = '';
            }).catch(msg => {
              console.log(msg);
              this.$alert('请与管理员联系。点击确定，进入待办工单列表页', msg, {
                confirmButtonText: '确定',
                callback: () => {
                  this.$router.push('/profile/work-order/todo');
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