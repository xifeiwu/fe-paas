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
      <el-form-item label="工单名称">{{detailForm.name}}</el-form-item>
      <el-form-item label="申请人">{{detailForm.creatorName}}</el-form-item>
      <el-form-item label="团队名称">{{detailForm.groupName}}</el-form-item>
      <el-form-item label="功能列表">
        <el-table :data="detailForm.featureList">
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
      <el-form-item label="程序列表">
        <!--<span v-for="item in detailForm.appList" :key="item.appName">{{item.appName}}</span>-->
        <span>{{detailForm.appName}}</span>
      </el-form-item>
      <el-form-item label="待办人">{{detailForm.userToDo}}</el-form-item>
      <el-form-item label="团队名称">{{detailForm.groupName}}</el-form-item>
      <el-form-item label="验收人">
        <el-table :data="detailForm.acceptedUserList">
          <el-table-column label="验收人" prop="userName" headerAlign="center">
          </el-table-column>
          <el-table-column label="状态" prop="status" headerAlign="center">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="知会人" class="notify-user-list">
        <span v-for="item in detailForm.notifyUserList" :key="item.userId">{{item.userName}}</span>
      </el-form-item>
      <el-form-item label="邮件组" class="mail-group-list">
        <span v-for="(item, index) in detailForm.mailGroupList" :key="index" v-if="detailForm.mailGroupList.length > 0">
          {{item}}
        </span>
        <span v-else>未设置</span>
      </el-form-item>
      <el-form-item label="操作记录">
        <el-table :data="detailForm.operationList">
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
        <span v-if="detailForm.comment">{{detailForm.comment}}</span>
        <span v-else>无备注</span>
      </el-form-item>
      <el-form-item label="工单状态">
        <span>{{detailForm.statusName}}</span>
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
  import ElSelect from "element-ui/packages/select/src/select";
  import ElOption from "element-ui/packages/select/src/option";
  import ElFormItem from "element-ui/packages/form/src/form-item";
  export default {
    components: {ElFormItem, ElOption, ElSelect}, created() {

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
          this.detailForm = detail;
        }).catch(err => {
        })
      });
    },
    data() {
      return {
        detailForm: {},
        testTypeList: [{
          label: '系统测试',
          value: 'SYSTEM_TEST'
        }, {
          label: '简版测试',
          value: 'SIMPLE_TEST'
        }, {
          label: '跳过测试',
          value: 'SKIP_TEST'
        }],
        handleInfo: {
          testType: '',
          fileList2Upload: [],
          comment: '',
        },
        rules: {
          testType: [{
            required: true,
            message: '请选择测试类型',
            trigger: 'blur'
          }],
          fileList2Upload: [{
            type: 'array',
            required: true,
            message: '请上传测试文件',
            trigger: 'blur'
          }],
          comment: [{
            required: false,
            message: '拒绝处理必须填写审批意见',
            trigger: 'blur'
          }],
        },

        showLoading: false,
        loadingText: ''
      }
    },
    methods: {
      handleButtonClick(action) {
        switch (action) {
          case 'deploy':
            break;
          case 'close':
            this.$router.go(-1);
            break;
          case 'finish-handle':
            this.handleSubmit(false);
            break;
          case 'reject-handle':
            this.handleSubmit(true);
            break;
        }
      },
      handleSubmit(reject) {
        // change rules according to user select
        this.rules.comment[0].required = reject;
        this.rules.fileList2Upload[0].required = this.handleInfo.testType != 'SKIP_TEST';

        this.$refs.hasOwnProperty('handle-form')  && this.$refs['handle-form'].validate(valid => {
          if (valid) {
            this.showLoading = true;
            this.loadingText = '正在处理工单"' + this.detailForm.name + '"';
            let options = {
              id: this.detailForm.id,
              handleResult: !reject,
              status: this.detailForm.status,
              testType: this.handleInfo.testType,
              remark: this.handleInfo.comment
            };
//            console.log(options);
            this.handleSubmitUpload();
            this.$net.handleWorkOrder(options).then(msg => {
              console.log(msg);
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
              this.$alert('请与管理员联系，即将进入待办工单列表页', msg, {
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