<template>
  <div id="work-order-handle">
    <div class="section-title">
      <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
        <div slot="content">
          <div>申请工单注意事项</div>
          <div>1. 测试类型为跳过测试的情况下，不需要上传测试报告，其它情况均需要上传测试报告。</div>
          <div>2. 如果选择拒绝处理，必须给出审批意见。</div>
        </div>
        <span>处理工单<i class="el-icon-question"></i></span>
      </el-tooltip>
    </div>
    <el-form labelWidth="120px" size="mini">
      <el-form-item label="工单名称">{{detailForm.name}}</el-form-item>
      <el-form-item label="申请人">{{detailForm.creator}}</el-form-item>
      <el-form-item label="团队名称">{{detailForm.groupName}}</el-form-item>
      <el-form-item label="邮件组">
                <span v-for="(item, index) in detailForm.emailGroupList" :key="index" v-if="detailForm.emailGroupList.length > 0">
                  {{item.emailGroupName}}
                </span>
        <span v-else>未设置</span>
      </el-form-item>
      <el-form-item label="功能列表">
        <el-table :data="detailForm.featureList">
          <el-table-column label="功能名称" prop="functionName" headerAlign="center">
          </el-table-column>
          <el-table-column label="功能类型" prop="functionType" headerAlign="center">
          </el-table-column>
          <el-table-column label="jira地址" prop="jiraAddress" headerAlign="center">
          </el-table-column>
          <el-table-column label="功能描述" prop="description" headerAlign="center">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="程序列表">
        <span v-for="item in detailForm.appList" :key="item.appName">{{item.appName}}</span>
      </el-form-item>
      <el-form-item label="待办人">{{detailForm.userToDo}}</el-form-item>
      <el-form-item label="团队名称">{{detailForm.groupName}}</el-form-item>
      <el-form-item label="验收人">
        <el-table :data="detailForm.userAcceptedList">
          <el-table-column label="验收人" prop="userName" headerAlign="center">
          </el-table-column>
          <el-table-column label="状态" prop="status" headerAlign="center">
          </el-table-column>
        </el-table>
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
      <el-form-item label="测试类型">
        <el-select  v-model="handleInfo.testType">
          <el-option v-for="item in testTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="测试报告">
      </el-form-item>
      <el-form-item label="审批意见">
        <el-input v-model="handleInfo.comment"
                  type="textarea"
                  :rows="2"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="section-footer">
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('close')">关闭</el-button>
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('finish-handle')">处理完成</el-button>
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('not-to-handle')">拒绝处理</el-button>
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
  }
</style>

<script>
  import ElSelect from "element-ui/packages/select/src/select";
  import ElOption from "element-ui/packages/select/src/option";
  import ElFormItem from "../../../../element-ui/packages/form/src/form-item";
  export default {
    components: {ElFormItem, ElOption, ElSelect}, created() {

    },
    mounted() {
      let workOrder = this.$store.getters['app/currentWorkOrder'];
      this.$nextTick(() => {
        this.getWorkOrderDetail(workOrder);
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
          uploadFile: '',
          comment: '',
        },
      }
    },
    methods: {
      getWorkOrderDetail(workOrder) {
        if (!workOrder || !workOrder.hasOwnProperty('id')) {
          this.$router.push('/profile/work-order/todo');
        }
        this.$net.getWorkOrderDetail({
          id: workOrder.id
        }).then(result => {
          console.log(result);
          if (result.hasOwnProperty('featureList')) {
            workOrder.featureList = result.featureList;
          }
          if (result.hasOwnProperty('appList')) {
            workOrder.appList = result.appList;
          }
          if (result.hasOwnProperty('userToDo')) {
            workOrder.userToDo = result.userToDo;
          }
          if (result.hasOwnProperty('userAcceptedList')) {
            workOrder.userAcceptedList = result.userAcceptedList;
          }
          if (result.hasOwnProperty('operationList')) {
            workOrder.operationList = result.operationList;
          }
          if (result.hasOwnProperty('emailGroup')) {
            workOrder.emailGroupList = result.emailGroup;
          }
          this.detailForm = workOrder;
        }).catch(err => {
        });
      },
      handleButtonClick(action) {

      }
    }
  }
</script>