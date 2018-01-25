<template>
  <div id="work-order-todo">
    <div class="header">
      <el-row class="operation" type="flex" justify="center" align="middle">
        <el-col :span="4">
          <el-button
                  size="mini-extral"
                  type="primary"
                  @click="handleButtonClick('linker', {path: '/profile/work-order/todo/add'})">申请工单</el-button>
        </el-col>
        <el-col :span="20">
          <div class="item">
            <label style="width: 68px; line-height: 26px; color: #409EFF">申请人：</label>
            <el-input
                    v-model="searchForm.userName"
                    size="mini" style="display: inline-block; width: 160px;"></el-input>
          </div>
          <div class="item">
            <label style="width: 72px; line-height: 26px; color: #409EFF">申请时间：</label>
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
        </el-col>
      </el-row>
    </div>
    <div class="work-order-list">
      <el-table :data="workOrderListByPage"
                v-loading="showLoading"
                :row-key="getRowKeys"
                :expand-row-keys="expandRows"
                element-loading-text="加载中">
        <el-table-column label="审批工单名称" prop="name" headerAlign="center">
        </el-table-column>
        <el-table-column label="申请人" prop="creatorName" width="80" headerAlign="center">
        </el-table-column>
        <el-table-column label="状态" prop="statusName" width="120" headerAlign="center">
        </el-table-column>
        <el-table-column label="申请时间" prop="createTime" width="200" headerAlign="center">
        </el-table-column>
        <el-table-column label="团队" prop="groupName"  width="120" headerAlign="center">
        </el-table-column>
        <el-table-column label="操作" headerAlign="center">
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="success"
                    :class="{'expand': expandRows.indexOf(scope.row.id) > -1}"
                    @click="handleOperationClick('detail', scope.$index, scope.row)"
                    :loading="waitingResponse && operation.rowID == scope.row.id">
              <span>详情</span>
              <i class="el-icon-arrow-right"></i>
            </el-button>
            <el-button v-if="scope.row.status!=='WORKORDER_APPLY'"
                    size="mini-extral"
                    type="success"
                    @click="handleOperationClick('handle', scope.$index, scope.row)">处理</el-button>
            <el-button v-if="scope.row.status==='WORKORDER_APPLY'"
                    size="mini-extral"
                    type="success"
                    @click="handleOperationClick('modify', scope.$index, scope.row)">修改</el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         v-if="true"
                         width="0"
        >
          <template slot-scope="scope">
            <div class="row-expand">
              <el-form labelWidth="120px" size="mini">
                <el-form-item label="工单名称">{{detailForm.name}}</el-form-item>
                <el-form-item label="申请人">{{detailForm.creatorName}}</el-form-item>
                <el-form-item label="团队名称">{{detailForm.groupName}}</el-form-item>
                <el-form-item label="邮件组" class="mail-group-list">
                  <span v-for="(item, index) in detailForm.mailGroupList" :key="index" v-if="detailForm.mailGroupList.length > 0">
                    {{item}}
                  </span>
                  <span v-else>未设置</span>
                </el-form-item>
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
                <el-form-item label="备注">{{detailForm.comment}}</el-form-item>
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
      margin: 5px;
      font-size: 14px;
      .el-row.operation {
        .el-col {
          padding: 0px 0px;
          &:first-child {
            text-align: center;
            border-right: 1px solid darkgray;
          }
          &:nth-child(2) {
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
            margin: 2px 4px;
            float: left;
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
                  content: ', ';
                }
                span:last-child::after {
                  content: '';
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
  import ElFormItem from "element-ui/packages/form/src/form-item";
  export default {
    components: {ElFormItem}, created() {
      console.log('created');
    },
    mounted() {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 1000 * 3600 * 24 * 30);
      this.searchForm.dateRange = [start, end];
//      console.log('mounted');
    },
    data() {
      return {
        searchForm: {
          userName: '',
          dateRange: '',
        },

        waitingResponse: false,
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
        detailForm: {
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
        pageSize: 20,
        currentPage: 1,

        statusList: [{
          id: 'WORKORDER_APPLY',
          name: '工单申请'
        }, {
          id: 'WAIT_TEST',
          name: '等待测试',
        }, {
          id: 'TESTING',
          name: '测试受理中'
        }, {
          id: 'WAIT_DBA',
          name: '等待DBA处理'
        }, {
          id: 'DBAING',
          name: 'DBA受理中'
        }, {
          id: 'WAIT_DEPLOY',
          name: '等待部署'
        }, {
          id: 'DEPLOYING',
          name: '部署受理中'
        }, {
          id: 'WAIT_ACCEPTANCE',
          name: '等待验收'
        }, {
          id: 'ACCEPTANCEING',
          name: '验收受理中'
        }, {
          id: 'END',
          name: '结束'
        }],

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
      handleButtonClick(action, params) {
        switch (action) {
          case 'search':
            this.requestWorkOrderList();
            break;
          case 'linker':
            this.$router.push(params.path);
            break;
        }
      },
      handleOperationClick(action, index, row) {
        switch (action) {
          case 'detail':
            // operation.rowID is used to indicate which row is active
            this.operation.rowID = row.id;
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
                this.expandRows.push(key);
              }
            };
            if (checkIfExpanded()) {
              return;
            }

            // update data of model for work-order-detail
            this.waitingResponse = true;
            WorkerOrderPropUtils.getWorkOrderDetailByBasic(this, row).then(detail => {
              console.log(detail);
              this.detailForm = detail;
              this.operation.name = action;
              this.waitingResponse = false;
              updateExpandRows();
            }).catch(err => {
              this.operation.name = action;
              this.waitingResponse = false;
            });
            break;
          case 'handle':
            this.$net.checkBeforeHandleWorkOrder({
              id: row.id,
              handleStatus: row.handleStatus,
              status: row.status
            }).then(workOrderInfo => {
              let newStatus = workOrderInfo['status'];
              this.$store.dispatch('app/setWorkOrder', {
                id: row.id,
                name: row.name,
                creator: row.creatorName,
                groupName: row.groupName,
                emailGroupList: [],
                featureList: [],
                appList: [],
                userToDo: '获取失败',
                acceptedUserList: [],
                operationList: [],
                comment: row.remark,
                status: newStatus,
                statusName: WorkerOrderPropUtils.getNameByStatus(newStatus)
              });
              this.$router.push('/profile/work-order/todo/handle');
            }).catch(errMsg => {
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
          case 'modify':
            this.$store.dispatch('app/setWorkOrder', {
              id: row.id,
              name: row.name,
              creatorName: row.creatorName,
              groupName: row.groupName,
              emailGroupList: [],
              featureList: [],
              appList: [],
              userToDo: '获取失败',
              acceptedUserList: [],
              operationList: [],
              comment: row.remark,
              status: row.status,
              statusName: WorkerOrderPropUtils.getNameByStatus(row.status)
            });
            this.$router.push('/profile/work-order/todo/modify');
            break;
        }
      },
      handlePaginationPageChange(page) {
        this.currentPage = page;
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
            let v = this.$utils.formatDate(it, 'yyyy-MM-dd hh:mm:ss')
            return v;
          });
          options.startTime = dateRange[0];
          options.endTime = dateRange[1];
        } else {
          options.startTime = '';
          options.endTime = '';
        }
        this.showLoading = true;
        this.$net.getWorkOrderToDoList(options).then(content => {
//          console.log(content);
          if (content.hasOwnProperty('todoWorkOrderList')) {
            this.workOrderList = content.todoWorkOrderList;
          }
          this.totalSize = content.total;
          this.showLoading = false;
        }).catch(err => {
          this.showLoading = false;
        });
      }
    }
  }
</script>