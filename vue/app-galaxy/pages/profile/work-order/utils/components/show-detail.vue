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
    <el-form-item label="团队名称">{{workOrderDetail.groupName}}</el-form-item>
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
          margin: 0px 5px;
          a {
            color: blue;
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
      workOrderDetail: Object
    },
    data() {
      return {
      }
    },
    methods: {
    }
  }
</script>