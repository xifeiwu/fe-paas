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
                stripe
                :height="heightOfWorkOrderList"
                :row-key="getRowKeys"
                :expand-row-keys="expandRows">
        <el-table-column label="审批工单名称" prop="name" minWidth="160" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="申请人" prop="creatorName" width="80" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="状态" prop="statusName" width="100" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="申请时间" prop="createTime" width="140" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="团队" prop="groupName" minWidth="160" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="操作" headerAlign="center" align="center" minWidth="80">
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['go-to-page-log-deploy-from-work-order-list'].disabled?'disabled':'primary']"
                    :loading="statusOfWaitingResponse('go-to-page-log-deploy-from-work-order-list') && operation.rowID == scope.row.id"
                    @click="handleTRClick($event, 'go-to-page-log-deploy-from-work-order-list', scope.$index, scope.row)">
              <span>部署日志</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text" class="primary"
                    :class="{'expand': expandRows.indexOf(scope.row.id) > -1}"
                    @click="handleTRClick($event, 'detail', scope.$index, scope.row)"
                    :loading="statusOfWaitingResponse('detail') && operation.rowID == scope.row.id">
              <span>详情</span><i class="el-icon-arrow-right"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         v-if="true"
                         width="0"
        >
          <template slot-scope="scope">
            <div class="row-expand">
              <el-form labelWidth="120px" size="mini" class="message-show">
                <el-form-item label="审批工单名称">
                  <div class="expand-to-next-line">{{workOrderDetail.name}}</div>
                </el-form-item>
                <el-form-item label="申请人">{{workOrderDetail.creatorName}}</el-form-item>
                <el-form-item label="团队名称">{{workOrderDetail.groupName}}</el-form-item>
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
                <el-form-item label="备注">{{workOrderDetail.comment}}</el-form-item>
                <el-form-item label="测试类型" class="test-type">
                  {{workOrderDetail.testTypeLabel}}
                </el-form-item>
                <el-form-item label="测试报告" class="test-log-list">
                  <div class="test-log"
                       v-for="(item, index) in workOrderDetail.testLogList" :key="index" v-if="workOrderDetail.testLogList.length>0">
                    <a :href="item.url">{{item.name}}</a>
                  </div>
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
    height: calc(100% - 30px);
    .work-order-list {
      .el-table {
        .el-table__row {
          .el-button {
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
        }
        .el-table__expanded-cell {
          .row-expand {
            background-color: #fff;
            box-sizing: border-box;
            padding: 12px 8px;
            width: 85%;
            margin: 0px auto;
            max-width: 750px;
            box-shadow: 0 0 2px 0 rgba(64,158,255, .6);
            .el-form {
              margin: 0px auto;
              .el-table {
                margin-bottom: 6px;
                th, td {
                  padding: 0px;
                }
              }
              .el-form-item__label {
                font-weight: bold;
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
      }

    }

    .header {
      padding: 5px;
      font-size: 14px;
      text-align: center;
      .el-row.operation {
        display: inline-block;
        .item {
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
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  export default {
    created() {
    },
    mounted() {
      this.setDateRange();
      // adjust element height after resize
      try {
        let header = this.$el.querySelector('.header:first-child');
        let workOrderList = this.$el.querySelector('.work-order-list');
        this.resizeListener = (evt) => {
          let height = this.$el.clientHeight;
          let heightOfHeader = header.offsetHeight;
          let heightOfContent = height - heightOfHeader;
          workOrderList.style.height = heightOfContent + 'px';
          this.heightOfWorkOrderList = height - heightOfHeader - 20;
        };
        addResizeListener(this.$el, this.resizeListener)
      } catch(err) {
      }
    },
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },
    data() {
      return {
        resizeListener: () => {},
        heightOfWorkOrderList: '',

        searchForm: {
          workOrderName: '',
          creator: '',
          status: 'STATUS_ALL',
          dateRange: '',
        },
        queueForWaitingResponse: [],

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
      handleTRClick(evt, action, index, row) {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        // operation.rowID is used to indicate which row is active
        this.operation.rowID = row.id;
//        console.log(action);
//        console.log(row);
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

            WorkerOrderPropUtils.getWorkOrderDetail(this, row.id).then(detail => {
              this.workOrderDetail = detail;
              updateExpandRows();
            }).catch(err => {
              console.log(err);
            }).finally(() => {
              this.hideWaitingResponse('detail');
              this.operation.name = action;
            });
            return;
//            WorkerOrderPropUtils.getWorkOrderDetailByBasic(this, workOrderBasic).then(detail => {
//              this.hideWaitingResponse('detail');
//              this.workOrderDetail = detail;
//              console.log(JSON.stringify(detail));
//              this.operation.name = action;
//              updateExpandRows();
//            }).catch(err => {
//              this.hideWaitingResponse('detail');
//              this.operation.name = action;
//            });
            break;
          case 'go-to-page-log-deploy-from-work-order-list':
            this.addToWaitingResponseQueue(action);
            WorkerOrderPropUtils.getWorkOrderDetail(this, row.id).then(detail => {
//            WorkerOrderPropUtils.getWorkOrderDetailByBasic(this, row).then(detail => {
              // 平台管理员不受限制
              if (this.$storeHelper.getUserInfo('role') !== '平台管理员') {
                // NOTICE: set groupID when
                if (!detail.groupId) {
                  this.$message.error('您无法查看其它团队的部署日志！');
                  throw new Error('groupId not found!');
                  return;
                }
              }
              if (this.$storeHelper.currentGroupID != detail.groupId) {
                this.$storeHelper.currentGroupID = detail.groupId;
              }
              this.hideWaitingResponse(action);
              var appId = detail.appID;
              var profileId = this.$storeHelper.getProductionProfile()['id'];
              try {
                appId = detail.appList[0]['appId'];
                profileId = detail.appList[0]['spaceId'];
              } catch (err) {
                console.log(err);
              }
              this.$storeHelper.dataTransfer = {
                from: this.$net.page['profile/work-order/list'],
                data: {
                  appId,
                  profileId: profileId,
                  serviceVersion: detail.serviceVersion
                }
              };
              this.$router.push(this.$net.page['profile/log/deploy']);
            }).catch(err => {
              this.hideWaitingResponse(action);
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
      async requestWorkOrderList() {
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
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.work_order_list, {
          payload: options
        });
        this.workOrderList = resContent['workOrderDeployList'];
        this.workOrderList.forEach(it => {
          it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
        });
        this.totalSize = resContent['workOrderDeployList'].length;
      }
    }
  }
</script>