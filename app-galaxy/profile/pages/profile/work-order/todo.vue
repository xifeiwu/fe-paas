<template>
  <div id="work-order-todo">
    <div class="header">
      <el-row class="operation" type="flex" justify="center" align="middle">
        <el-col :span="3">
          <el-button
                  size="mini-extral"
                  type="primary"
                  @click="handleButtonClick('linker', {path: '/work-order/todo/add'})">申请审批工单</el-button>
        </el-col>
        <div class="el-col el-col-3">
          <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
            <div slot="content">
              <div>工单处理逻辑</div>
              <div>1. 如果一个应用下有正在处理的工单，则不可以提交新的工单</div>
              <div>2. 如果工单超过三个小时没有更新状态，则会被系统更改为结束</div>
            </div>
            <span>工单处理逻辑<i class="el-icon-question"></i></span>
          </el-tooltip>
        </div>
        <el-col :span="18">
          <div class="item">
            <label style="width: 68px; line-height: 26px; color: black">申请人：</label>
            <el-input
                    v-model="searchForm.userName"
                    size="mini" style="display: inline-block; width: 160px;"></el-input>
          </div>
          <div class="item">
            <label style="width: 72px; line-height: 26px; color: black">申请时间：</label>
            <el-date-picker style="display: inline-block; width: 240px;"
                class="custom"
                v-model="searchForm.dateRange"
                type="daterange"
                size="mini"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="datePickerOptions">
            </el-date-picker>
          </div>
          <el-button
            size="mini-extral"
            type="primary"
            @click="handleButtonClick('search')">搜索</el-button>
          <el-button
                  size="mini-extral"
                  type="primary"
                  @click="handleButtonClick('refresh')">刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="work-order-list">
      <el-table :data="workOrderListByPage"
                v-loading="showLoading"
                stripe
                :row-key="getRowKeys"
                :expand-row-keys="expandRows"
                element-loading-text="加载中">
        <el-table-column label="审批工单名称" prop="name" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="申请人" prop="creatorName" width="80" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="状态" prop="statusName" width="120" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="申请时间" prop="createTime" width="200" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="团队" prop="groupName"  width="120" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="操作" headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="primary"
                    :class="{'expand': expandRows.indexOf(scope.row.id) > -1}"
                    @click="handleTRButton('detail', scope.$index, scope.row)"
                    :loading="statusOfWaitingResponse('detail') && operation.rowID == scope.row.id">
              <span>详情</span>
              <i class="el-icon-arrow-right"></i>
            </el-button>
            <el-button v-if="scope.row.status!=='WORKORDER_APPLY'"
                    size="mini-extral"
                    type="warning"
                    :loading="statusOfWaitingResponse(scope.row.status) && operation.rowID == scope.row.id"
                    @click="handleTRButton(scope.row.status, scope.$index, scope.row)">{{getStatusName(scope.row.status)}}</el-button>
            <el-button v-if="scope.row.status==='WORKORDER_APPLY'"
                    size="mini-extral"
                    type="warning"
                    :loading="statusOfWaitingResponse('modify') && operation.rowID == scope.row.id"
                    @click="handleTRButton('modify', scope.$index, scope.row)">{{getStatusName(scope.row.status)}}</el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         v-if="true"
                         width="0"
        >
          <template slot-scope="scope">
            <div class="row-expand">
              <el-form labelWidth="120px" size="mini">
                <el-form-item label="审批工单名称">
                  <div class="expand-to-next-line">{{workOrderDetail.name}}</div>
                </el-form-item>
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
                <el-form-item label="备注">{{workOrderDetail.comment}}</el-form-item>
                <el-form-item label="测试类型" class="test-type">
                  {{workOrderDetail.testTypeLabel}}
                </el-form-item>
                <el-form-item label="测试报告" class="test-log-list">
                  <div class="test-log"
                        v-for="(item, index) in workOrderDetail.testLogList" :key="index" v-if="workOrderDetail.testLogList.length>0">
                    <a :href="item.url">{{item.name}}</a>
                  </div>
                  <!--<div class="test-log" v-if="workOrderDetail.testLogList.length>0"-->
                       <!--v-for="(item, index) in workOrderDetail.testLogList" :key="index"-->
                       <!--@click="handleDownload(item.path, item.name)"-->
                  <!--&gt;-->
                      <!--{{item.name}}-->
                  <!--</div>-->
                  <span v-else>无</span>
                </el-form-item>
              </el-form>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize">
        <div class="pagination">
          <el-pagination
                  :current-page="currentPage"
                  size="large"
                  layout="prev, pager, next"
                  :page-size = "pageSize"
                  :total="totalSize"
                  @current-change="handlePaginationPageChange"
          >
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
  #work-order-todo {
    .header {
      margin: 3px 5px;
      font-size: 14px;
      .el-row.operation {
        .el-col {
          padding: 0px 0px;
          &:first-child {
            text-align: left;
            border-right: 1px solid darkgray;
          }
          &:nth-child(2) {
            color: #1a0dab;
            text-align: center;
            border-right: 1px solid darkgray;
          }
          &:nth-child(3) {
            text-align: center;
            .item {
              display: inline-block;
            }
          }
        }
      }
      .el-select .el-input__inner {
        height: 26px;
      }
    }

    .work-order-list {
      .el-table {
        margin-bottom: 40px;
        .el-table__row {
          .el-button {
            /*display: inline-block;*/
            margin: 2px 4px;
            /*float: left;*/
            &.expand {
              .el-icon-arrow-right {
                transform: rotate(90deg);
              }
            }
            .el-icon-arrow-right {
              vertical-align: middle;
              transition: transform 0.2s ease-in-out;
            }
            &:first-child {
              margin-left: 0px;
            }
          }
          .el-button + .el-button {
            margin-left: 0px;
          }
        }
        .el-table__expanded-cell {
          padding: 0px;
        }
      }

      .row-expand {
        border-top: 1px solid #409EFF;
        border-bottom: 1px solid #409EFF;
        background-color: #fff;
        .el-form {
          width: 85%;
          margin: 0px auto;
          max-width: 750px;
          .el-table {
            margin-bottom: 6px;
            th, td {
              padding: 0px;
            }
          }
          .el-form-item {
            margin-bottom: 6px;
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
              }
            }
          }
        }
      }
    }
  }
</style>
<script>
  import WorkerOrderPropUtils from './utils/work-order-props';
  export default {
    created() {
    },
    mounted() {
      this.setDateRange();
    },
    data() {
      return {
        searchForm: {
          userName: '',
          dateRange: '',
        },
        queueForWaitingResponse: [],

        showLoading: false,
        workOrderList: [],
        getRowKeys: function (row) {
          return row.id;
        },
        expandRows: [],

        operation: {
          rowID: null,
          name: null,
        },
        workOrderDetail: {
          id: '',
          name: '',
          creatorName: '',
          groupName: '',
          mailGroupList: [],
          featureList: [],
          appName: '',
          userToDo: '获取失败',
          acceptedUserList: [],
          operationList: [],
          comment: ''
        },

        showPagination: true,
        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        datePickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近两个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 60);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
      },
      }
    },
    watch: {
      'searchForm.dateRange': function (value) {
        this.requestWorkOrderList();
      }
    },
    computed: {
      workOrderListByPage() {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;
        let end = start + length;
        let result = this.workOrderList.slice(start, end);
        return result
      },
    },
    methods: {
      // helper for loading action of el-button
      addToWaitingResponseQueue(action) {
        if (this.queueForWaitingResponse.indexOf(action) === -1) {
          this.queueForWaitingResponse.push(action);
        }
      },
      statusOfWaitingResponse(action) {
        return this.queueForWaitingResponse.indexOf(action) > -1;
      },
      hideWaitingResponse(action) {
        let index = this.queueForWaitingResponse.indexOf(action);
        if (index > -1) {
          this.queueForWaitingResponse.splice(index, 1);
        }
      },

      setDateRange() {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 1000 * 3600 * 24 * 30);
        this.searchForm.dateRange = [start, end];
      },
      handleButtonClick(action, params) {
        switch (action) {
          case 'search':
            this.currentPage = 1;
            this.requestWorkOrderList();
            break;
          case 'refresh':
            this.currentPage = 1;
            this.setDateRange();
            break;
          case 'linker':
            this.$router.push(params.path);
            break;
        }
      },
      getStatusName(status) {
        let name = '处理工单';
        switch (status) {
          case 'WORKORDER_APPLY':
            name = '修改工单';
            break;
          case 'WAIT_TEST':
          case 'TESTING':
            name = '测试工单';
            break;
          case 'WAIT_DEPLOY':
          case 'DEPLOYING':
            name = '部署工单';
            break;
          case 'WAIT_ACCEPTANCE':
          case 'ACCEPTANCEING':
            name = '验收工单';
            break;
        }
        return name;
      },
      handleTRButton(action, index, row) {
        // operation.rowID is used to indicate which row is active
        this.operation.rowID = row.id;
        let workOrderBasic = {
          id: row.id,
          name: row.name,
          creatorName: row.creatorName,
          groupName: row.groupName,
          mailGroupList: [],
          featureList: [],
          appList: [],
          userToDo: '获取失败',
          acceptedUserList: [],
          operationList: [],
          comment: row.remark,
          status: null,
          statusName: null
        };
        switch (action) {
          case 'detail':
            // update expandRows
            let checkIfExpanded = () => {
              let hasExpanded = false;
              if (!row.hasOwnProperty('id')) {
                hasExpanded = true;
                return hasExpanded;
              }
              let key = row.id;
              // close it if has expanded
              if (this.expandRows.indexOf(key) > -1) {
                this.expandRows.splice(this.expandRows.indexOf(key), 1);
                hasExpanded = true;
              }
              return hasExpanded;
            };
            let updateExpandRows = () => {
              if (!row.hasOwnProperty('id')) {
                return;
              }
              let key = row.id;
              if (this.expandRows.indexOf(key) > -1) {
                this.expandRows.splice(this.expandRows.indexOf(key), 1);
              } else {
//                this.expandRows.push(key);
                this.expandRows = [key];
              }
            };
            if (checkIfExpanded()) {
              return;
            }

            // update data of model for work-order-detail
            this.addToWaitingResponseQueue('detail');
            WorkerOrderPropUtils.getWorkOrderDetailByBasic(this, workOrderBasic).then(detail => {
              this.hideWaitingResponse('detail');
//              console.log(row);
//              console.log(detail);
              this.workOrderDetail = detail;
              this.operation.name = action;
              updateExpandRows();
            }).catch(err => {
              this.hideWaitingResponse('detail');
              this.operation.name = action;
            });
            break;
          case 'modify':
            this.addToWaitingResponseQueue('modify');
            WorkerOrderPropUtils.getWorkOrderDetailByBasic(this, workOrderBasic).then(detail => {
              this.hideWaitingResponse('modify');
              this.$storeHelper.setTmpProp('workOrderDetail', detail);
              this.$router.push('/work-order/todo/modify');
            }).catch(() => {
              this.hideWaitingResponse('modify');
            });
            break;
          case 'WAIT_TEST':
          case 'TESTING':
            this.addToWaitingResponseQueue(action);
            this.$net.checkBeforeHandleWorkOrder({
              id: row.id,
              handleStatus: row.handleStatus,
              status: row.status
            }).then(workOrderInfo => {
              let newStatus = workOrderInfo['status'];
              workOrderBasic.status = newStatus;
              workOrderBasic.statusName = WorkerOrderPropUtils.getNameByStatus(newStatus);
//              this.$storeHelper.setTmpProp('workOrderBasic', workOrderBasic);
//              this.$router.push('/profile/work-order/todo/test');
              WorkerOrderPropUtils.getWorkOrderDetailByBasic(this, workOrderBasic).then(detail => {
                if (detail.hasOwnProperty('testLogList')) {
                  // openPopover will be used for el-popover in work-order/todo/modify(test)
                  detail.testLogList.forEach(it => {
                    it.openPopover = false;
                  })
                }
                this.hideWaitingResponse(action);
                this.$storeHelper.setTmpProp('workOrderDetail', detail);
                this.$router.push('/work-order/todo/test');
              }).catch(() => {
                this.hideWaitingResponse(action);
              });
            }).catch(errMsg => {
              this.hideWaitingResponse(action);
              console.log(errMsg);
              this.$notify.error({
                title: '无法处理！',
                message: errMsg,
                duration: 0,
                onClose: function () {
                }
              });
            });
            break;
          case 'WAIT_DEPLOY':
          case 'DEPLOYING':
            this.addToWaitingResponseQueue(action);
            this.$net.checkBeforeHandleWorkOrder({
              id: row.id,
              handleStatus: row.handleStatus,
              status: row.status
            }).then(workOrderInfo => {
              let newStatus = workOrderInfo['status'];
              workOrderBasic.status = newStatus;
              workOrderBasic.statusName = WorkerOrderPropUtils.getNameByStatus(newStatus);
              WorkerOrderPropUtils.getWorkOrderDetailByBasic(this, workOrderBasic).then(detail => {
                this.hideWaitingResponse(action);
                this.$storeHelper.setTmpProp('workOrderDetail', detail);
                this.$router.push('/work-order/todo/deploy');
              }).catch(() => {
                this.hideWaitingResponse(action);
              });
            }).catch(errMsg => {
              this.hideWaitingResponse(action);
              console.log(errMsg);
              this.$notify.error({
                title: '无法处理！',
                message: errMsg,
                duration: 0,
                onClose: function () {
                }
              });
            });
            break;
            case 'WAIT_ACCEPTANCE':
            case 'ACCEPTANCEING':
              this.addToWaitingResponseQueue(action);
              this.$net.checkBeforeHandleWorkOrder({
                id: row.id,
                handleStatus: row.handleStatus,
                status: row.status
              }).then(workOrderInfo => {
                this.hideWaitingResponse(action);
                let newStatus = workOrderInfo['status'];
                workOrderBasic.status = newStatus;
                workOrderBasic.statusName = WorkerOrderPropUtils.getNameByStatus(newStatus);
                this.$storeHelper.setTmpProp('workOrderBasic', workOrderBasic);
                this.$router.push('/work-order/todo/accept');
              }).catch(errMsg => {
                this.hideWaitingResponse(action);
                console.log(errMsg);
                this.$notify.error({
                  title: '无法处理！',
                  message: errMsg,
                  duration: 0,
                  onClose: function () {
                  }
                });
              });
              break;
        }
      },
      handlePaginationPageChange(page) {
        this.currentPage = page;
      },

      // used to download file in http post protocol
      // TODO: not used
      handleDownload(path, name) {
        this.$net.workOrderPostDownloadTestReport({
          path, name
        });
      },
      /**
       * called at
       * 1. at the change of searchForm.dateRange
       * 2. at press of search button
       */
      requestWorkOrderList() {
        let options = {
          creatorName: '',
          startTime: '',
          endTime: ''
        };
        if (this.searchForm.userName) {
          options.creatorName = this.searchForm.userName;
        } else {
          options.creatorName = '';
        }
        if (this.searchForm.dateRange) {
          let dateRange = this.searchForm.dateRange.map(it => {
            let v = this.$utils.formatDate(it, 'yyyy-MM-dd')
            return v;
          });
          options.startTime = dateRange[0] + ' 00:00:00';
          options.endTime = dateRange[1] + ' 23:59:59';
        } else {
          options.startTime = '';
          options.endTime = '';
        }
        this.showLoading = true;
        this.$net.getWorkOrderToDoList(options).then(content => {
//          console.log(content);
          if (content.hasOwnProperty('todoWorkOrderList')) {
            this.workOrderList = content.todoWorkOrderList;
            this.totalSize = content.todoWorkOrderList.length;
          }
          this.showLoading = false;
        }).catch(err => {
          this.showLoading = false;
        });
      }
    }
  }
</script>