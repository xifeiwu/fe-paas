<template>
  <el-form labelWidth="110px" size="mini" class="work-order-detail">
    <el-form-item label="审批工单名称" class="message-show">{{workOrderDetail.name}}</el-form-item>
    <el-form-item label="申请人" class="message-show">{{workOrderDetail.creatorName}}</el-form-item>
    <el-form-item label="团队名称" class="message-show">{{workOrderDetail.groupName}}</el-form-item>
    <el-form-item label="功能列表">
      <el-table :data="workOrderDetail.featureList" class="compact">
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
    <el-form-item label="应用列表">
      <el-table :data="workOrderDetail.appList" class="compact">
        <el-table-column label="应用名称" prop="appName" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="运行环境" headerAlign="center" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.spaceDescription}}</span>
          </template>
        </el-table-column>
        <el-table-column label="部署次数" prop="deployCount" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                v-if="showAppDeploy"
                label="操作"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <el-button
                    type="text"
                    style="font-size: 14px;"
                    :class="[$storeHelper.permission['work-order_deploy_service'].disabled || $storeHelper.serverIsPublishing? 'disabled' : 'warning']"
                    @click="handleClick($event, 'work-order_deploy_service', scope.$index, scope.row)"
            >{{scope.row.hasCanary ? '灰度部署':'部署'}}</el-button>
            <i class="el-icon-question" v-if="scope.row.hasCanary" style="color: #E6A23C;"
               v-pop-on-mouse-over="['当该主服务存在灰度服务时，只能进行灰度部署，如需部署主服务，请先删除灰度服务', '灰度部署完成后，需要到服务管理/灰度发布页面，设置灰度策略后，才能生效']"></i>
            <el-button v-if="false"
                    type="text"
                    style="font-size: 14px;"
                    :class="[$storeHelper.permission['work-order_restart_service'].disabled ? 'disabled' : 'warning']"
                    @click="handleClick($event, 'work-order_restart_service', scope.$index, scope.row)"
            >重启</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item label="待办人">{{workOrderDetail.userToDo}}</el-form-item>
    <el-form-item label="验收人">
      <el-table :data="workOrderDetail.acceptedUserList" class="compact">
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
      <el-table :data="workOrderDetail.operationList" class="compact">
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
    <el-form-item label="测试类型" class="test-type" v-if="showTestLog">
      {{workOrderDetail.testTypeLabel}}
    </el-form-item>
    <el-form-item label="测试报告" class="test-log-list" v-if="showTestLog">
      <div class="test-log"
           v-if="workOrderDetail.testLogList.length>0"
           v-for="(item, index) in workOrderDetail.testLogList" :key="index">
        <a :href="item.url">{{item.name}}</a>
      </div>
    </el-form-item>
    <el-form-item label="工单状态">
      <span>{{workOrderDetail.statusName}}</span>
    </el-form-item>

    <el-dialog title="提示"
               :visible="action.name=='work-order_deploy_service'"
               v-if="action.name=='work-order_deploy_service'"
               width="600px"
               class="confirm-deploy"
               :close-on-click-modal="false"
               @close="closeDialog"
    >
      <div class="el-message-box__status el-icon-warning" style="padding-bottom: 27px;"></div>
      <div class="el-message-box__message">
        <p>您确认要部署吗?</p>
        <el-checkbox v-model="action.data.forceClone">强制清空打包目录（删除所有源代码、包文件等）</el-checkbox>
      </div>
      <span slot="footer" class="el-message-box__btns">
      <el-button action="profile-dialog/cancel"
                 @click="closeDialog">取&nbsp消</el-button>
      <el-button type="primary"
                 @click="handleDialogClick($event, action.name)">确&nbsp认</el-button>
    </span>
    </el-dialog>
  </el-form>
</template>

<style lang="scss">
  .el-form.work-order-detail {
    .confirm-deploy {
      .el-dialog {
        display: inline-block;
        vertical-align: middle;
        background-color: #fff;
        border-radius: 4px;
        border: 1px solid #e6ebf5;
        font-size: 18px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        text-align: left;
        overflow: hidden;
        backface-visibility: hidden;
        box-sizing: border-box;
      }
      .el-dialog__header {
        position: relative;
        padding: 15px 15px 5px;
        background-color: #fff;
        .el-dialog__title {
          padding-left: 0;
          margin-bottom: 0;
          font-size: 18px;
          line-height: 1;
          color: #2d2f33;
        }
      }
      .el-dialog__body {
        position: relative;
        padding: 10px 15px;
        color: #5a5e66;
        font-size: 14px;
      }
      .el-dialog__footer {
        border-top: none;
        margin-top: 0;
      }
    }
    .el-table {
      th, td {
        padding: 2px 0px;
      }
    }
    .el-form-item {
      margin-bottom: 6px;
      &.test-report, &.comment {
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
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    mixins: [commonUtils],
    created() {
    },
    mounted() {
    },
    computed: {
    },
    props: {
      workOrderDetail: Object,
      showTestLog: {
        type: Boolean,
        default: true
      },
      showAppDeploy: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
      }
    },
    methods: {
      handleDialogClick(evt, action) {
        switch (action) {
          case 'work-order_deploy_service':
            this.action.promise.resolve(this.action.data);
            break;
        }
      },
      async handleClick($event, action, index, row) {
        switch (action) {
          case 'work-order_deploy_service':
            try {
              var data = await this.openDialog(action, {
                forceClone: false
              });
              row.forceClone = data.forceClone ? data.forceClone : false;
              this.$emit('app-deploy', $event, action, index, row);
            } catch (err) {
              console.log(err);
            } finally {
              this.closeDialog();
            }
            break;
          case 'work-order_restart_service':
            row.forceClone = false;
            this.$emit('app-deploy', $event, action, index, row);
            break;
        }
      }
    }
  }
</script>