<template>
  <div id="work-order-list">
    <div class="header">
      <el-row class="operation">
        <div class="item">
          <label>审批工单名称</label>
          <el-input
                  v-model="searchForm.workOrderName"
                  size="mini" style="display: inline-block; width: 160px;"></el-input>
        </div>
        <div class="item">
          <label>申请人</label>
          <el-input
                  v-model="searchForm.creator"
                  size="mini" style="display: inline-block; width: 160px;"></el-input>
        </div>
        <div class="item">
          <label>审批状态</label>
          <el-select v-model="searchForm.status" placeholder="请选择">
            <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="item">
          <label>申请时间</label>
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
      </el-row>
    </div>
    <div class="work-order-list">
      <el-table :data="workOrderListByPage"
                v-loading="showLoading"
                :row-key="getRowKeys"
                :expand-row-keys="expandRows"
                element-loading-text="加载中">
        <el-table-column label="审批工单名称" prop="name" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="申请人" prop="creatorName" width="100" headerAlign="center" align="center">
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
                    @click="handleOperationClick('detail', scope.$index, scope.row)"
                    :loading="statusOfWaitingResponse('detail') && operation.rowID == scope.row.id">
              <span>详情</span>
              <i class="el-icon-arrow-right"></i>
            </el-button>
            <el-button
                    size="mini-extral"
                    type="primary"
                    :loading="statusOfWaitingResponse('deploy-log') && operation.rowID == scope.row.id"
                    @click="handleOperationClick('deploy-log', scope.$index, scope.row)">部署日志</el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         v-if="true"
                         width="0"
        >
          <template slot-scope="scope">
            <div class="row-expand">
              <el-form labelWidth="120px" size="mini">
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
                <el-form-item label="备注">{{workOrderDetail.comment}}</el-form-item>
                <el-form-item label="测试报告" class="test-log-list">
                  <div class="test-log"
                       v-for="(item, index) in workOrderDetail.testLogList" :key="index" v-if="workOrderDetail.testLogList.length>0">
                    <a :href="item.url">{{item.name}}</a>
                  </div>
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
  #work-order-list {
    .work-order-list {
      .el-table {
        margin-bottom: 40px;
        .el-table__row {
          .el-button {
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
      }
    }

    .header {
      margin: 3px 5px;
      font-size: 14px;
      text-align: center;
      .el-row.operation {
        display: inline-block;
        .item {
          margin: 3px;
          display: inline-block;
          label {
            /*color: #409EFF*/
            color: black;
          }
        }
      }
      .el-select .el-input__inner {
        height: 26px;
      }
    }
    /*not used*/
    .el-dialog {
      width: 80%;
      min-width: 500px;
      max-width: 900px;
      .el-table {
        th, td {
          padding: 0px;
        }
      }
      .el-form {
        .el-form-item {
          margin-bottom: 6px;
        }
      }
    }
  }
</style>

<script>
  import WorkerOrderPropUtils from './utils/work-order-props';
  import ElDialog from "element-ui/packages/dialog/src/component";
  import ElFormItem from "element-ui/packages/form/src/form-item";
  import ElTable from "element-ui/packages/table/src/table";
  export default {
    components: {ElTable, ElFormItem, ElDialog}, created() {
    },
    mounted() {
      this.setDateRange();
    },
    data() {
      return {
        searchForm: {
          workOrderName: '',
          creator: '',
          status: 'STATUS_ALL',
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
          // not used now
          name: null,
        },

        workOrderDetail: {
          "id": null,
          "name": "",
          "creatorName": "",
          "groupId": null,
          "groupName": "",
          "featureList": [],
          "appID": null,
          "appName": "",
          "serviceVersion": "",
          "acceptedUserIdList": [],
          "acceptedUserList": [],
          "notifyUserIdList": [],
          "notifyUserList": [],
          "mailGroupList": [],
          "comment": null,
          "status": null,
          "statusName": "",
          "appList": [],
          "userToDo": "",
          "operationList": []
        },

        showPagination: true,
        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        statusList: [{
          id: 'STATUS_ALL',
          name: '全部'
        }, {
          id: 'WORKORDER_APPLY',
          name: '工单申请'
        }, {
          id: 'WAIT_TEST',
          name: '等待测试',
        }, {
          id: 'TESTING',
          name: '测试受理中'
        },
//          {
//          id: 'WAIT_DBA',
//          name: '等待DBA处理'
//        }, {
//          id: 'DBAING',
//          name: 'DBA受理中'
//        },
          {
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
//            console.log(this.searchForm);
            this.requestWorkOrderList();
            break;
          case 'refresh':
            this.setDateRange();
            // avoid duplicate request
//            this.requestWorkOrderList();
            break;
          case 'linker':
            this.$router.push(params.path);
            break;
        }
      },
      handleOperationClick(action, index, row) {
        // operation.rowID is used to indicate which row is active
        this.operation.rowID = row.id;
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
            // update data of model for work-order-detail
            this.addToWaitingResponseQueue('detail');
            WorkerOrderPropUtils.getWorkOrderDetailByBasic(this, workOrderBasic).then(detail => {
              this.hideWaitingResponse('detail');
//              console.log(detail);
              this.workOrderDetail = detail;
              this.operation.name = action;
              updateExpandRows();
            }).catch(err => {
              this.hideWaitingResponse('detail');
              this.operation.name = action;
            });
            break;
          case 'deploy-log':
            this.addToWaitingResponseQueue('deploy-log');
            WorkerOrderPropUtils.getWorkOrderDetailByBasic(this, row).then(detail => {
              // NOTICE: set groupID when
              if (this.$storeHelper.currentGroupID != detail.groupId) {
                this.$storeHelper.currentGroupID = detail.groupId;
              }
              this.hideWaitingResponse('deploy-log');
              let productionProfile = this.$storeHelper.getProductionProfile();
              this.$storeHelper.setTmpProp('versionInfo', {
                appID: detail.appID,
                profileID: productionProfile ? productionProfile.id:null,
                serviceVersion: detail.serviceVersion
              });
              this.$router.push({
                path: '/profile/log/deploy',
                query: {
                  from: '/profile/work-order/list'
                }
              });
            }).catch(err => {
              this.hideWaitingResponse('deploy-log');
            });
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
          name: '',
          creatorName: '',
          status: '',
          startTime: '',
          endTime: ''
        };
        if (this.searchForm.workOrderName) {
          options.name = this.searchForm.workOrderName.trim();
        }
        if (this.searchForm.creator) {
          options.creatorName = this.searchForm.creator.trim();
        }
        if (this.searchForm.status) {
          if (this.searchForm.status == 'STATUS_ALL') {
            delete options.status;
          } else {
            options.status = this.searchForm.status;
          }
        } else {
          delete options.status;
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
        this.$net.getWorkOrderList(options).then(content => {
//          console.log(content);
          if (content.hasOwnProperty('workOrderDeployList')) {
            this.workOrderList = content.workOrderDeployList;
            this.totalSize = content.workOrderDeployList.length;
          }
          this.showLoading = false;
        }).catch(err => {
          this.showLoading = false;
        });
      }
    }
  }
</script>