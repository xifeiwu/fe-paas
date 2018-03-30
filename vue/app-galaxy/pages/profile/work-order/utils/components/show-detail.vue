<template>
  <el-form labelWidth="110px" size="mini" class="work-order-detail">
    <el-form-item label="审批工单名称">{{workOrderDetail.name}}</el-form-item>
    <el-form-item label="申请人">{{workOrderDetail.creatorName}}</el-form-item>
    <el-form-item label="团队名称">{{workOrderDetail.groupName}}</el-form-item>
    <el-form-item label="功能列表">
      <el-table :data="workOrderDetail.featureList">
        <el-table-column label="功能名称" prop="name" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="功能类型" prop="typeName" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="jira地址" prop="jiraAddress" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="功能描述" prop="description" headerAlign="center" align="center">
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item label="应用名/版本">
      <span>{{workOrderDetail.appName}}</span>
      <span>/</span>
      <span v-if="workOrderDetail.serviceVersion">{{workOrderDetail.serviceVersion}}</span><span v-else>版本未知</span>
    </el-form-item>
    <el-form-item label="待办人">{{workOrderDetail.userToDo}}</el-form-item>
    <el-form-item label="验收人">
      <el-table :data="workOrderDetail.acceptedUserList">
        <el-table-column label="验收人" prop="userName" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="状态" prop="status" headerAlign="center" align="center">
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
        <el-table-column label="处理时间" prop="createTime" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="处理操作" prop="actionName" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="处理人" prop="handleUserName" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="备注" prop="remark" headerAlign="center" align="center">
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item label="备注">
      <span>{{workOrderDetail.comment}}</span>
    </el-form-item>
    <el-form-item label="测试报告" class="test-log-list">
      <div class="test-log"
           v-for="(item, index) in workOrderDetail.testLogList" :key="index" v-if="workOrderDetail.testLogList.length>0">
        <a :href="item.url">{{item.name}}</a>
        <el-popover v-if="showDeleteTestLogButton"
                width="200"
                v-model="item.openPopover"
                placement="right"
                trigger="click"
                popperClass="el-popover--small">
          <p style="color: #fa5555">确定要删除测试报告《{{item.name}}》吗？</p>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="handlePopoverButton('cancel', index, item)">取消</el-button>
            <el-button type="danger" size="mini-extral" @click="handlePopoverButton('delete-test-log', index, item)">确定</el-button>
          </div>
          <i slot="reference" class="el-icon-close" @click="handleButtonClick('delete-test-log', index, item)"></i>
        </el-popover>
      </div>
      <span v-else>无</span>
    </el-form-item>
    <el-form-item label="工单状态">
      <span>{{workOrderDetail.statusName}}</span>
    </el-form-item>
  </el-form>
</template>

<style lang="scss">
  #app .el-form.work-order-detail {
    .el-table {
      th, td {
        padding: 2px 0px;
      }
    }
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
      &.test-log-list {
        .test-log {
          &:first-child {
            margin-top: 3px;
          }
          margin: 0px 5px;
          line-height: 1.4;
          a {
            color: blue;
          }
          .el-icon-close {
            margin-left: 5px;
            &:hover{
              font-weight: bold;
            }
          }
        }
      }
    }
  }
</style>

<script>
  export default {
    created() {
    },
    mounted() {
    },
    props: {
      workOrderDetail: Object,
      showDeleteTestLogButton: {
        type: Boolean,
        default: false
      },
    },
    data() {
      return {
      }
    },
    methods: {
      handleButtonClick(action, index, item) {
        switch (action) {
          case 'delete-test-log':
            item.openPopover = true;
            break;
        }
      },
      handlePopoverButton(action, index, item) {
        switch (action) {
          case 'delete-test-log':
            item.openPopover = false;
            if (item.hasOwnProperty('id')) {
              this.$net.workOrderRemoveTestReport(item.id).then(msg => {
                this.workOrderDetail.testLogList.splice(index, 1);
                this.$message.success(msg);
              }).catch(msg => {
                this.$notify.error({
                  title: '删除失败',
                  message: msg,
                  duration: 0,
                  onClose: function () {
                  }
                });
              })
            }
            break;
          case 'cancel':
            item.openPopover = false;
            break;
        }
      },
    }
  }
</script>