<template>
  <div id="work-order-list">
    <div class="header">
      <div class="item">
        <el-checkbox v-model="searchForm.onlyUndone" v-if="false">未完成工单</el-checkbox>
        <label>审批状态:</label>
        <el-select-custom v-model="searchForm.status" size="mini" filterable multiple placeholder="请选择">
          <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select-custom>
      </div>
      <div class="item">
        <label>申请时间:</label>
        <el-date-picker style="display: inline-block; width: 220px;"
                        class="custom disable-close"
                        v-model="searchForm.dateRange"
                        type="daterange"
                        size="mini"
                        align="right"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        :enableClose="false"
                        :picker-options="datePickerOptions">
        </el-date-picker>
      </div>
      <div class="item">
        <label>关键字:</label>
        <el-input v-model="searchForm.filterKey" placeholder="包括审批工单名称、申请人、团队"
                size="mini" style="display: inline-block; width: 240px;">
          <i :class="searchForm.filterKey && searchForm.filterKey.length > 0 ? 'paas-icon-close' : 'el-icon-search'"
             slot="suffix" style="line-height: 26px;"
             @click="evt => evt.target.classList.contains('paas-icon-close') ? searchForm.filterKey = '' : ''"></i>
        </el-input>
      </div>
      <div class="item">
        <el-button size="mini" type="primary"
                @click="handleButtonClick('refresh')">刷新</el-button>
        <el-button
            size="mini" style="margin-left: 3px;"
            plain type="primary"
            :class="[$storeHelper.permission['work-order_download'].disabled ? 'disabled' : 'warning']"
            @click="handleButtonClick('work-order_download', '', $event)">
          <i class="el-icon-download"></i><span>下载工单</span>
        </el-button>
        <div class="toggle-warning">
          <i class="paas-icon-double-arrow-right" style="transform: rotate(270deg); " v-if="showWarning" @click="showWarning = false"></i>
          <i class="paas-icon-fa-question" v-if="!showWarning" @click="showWarning = true"></i>
        </div>
      </div>
      <paas-dismiss-message :toExpand="showWarning"
                            @status-change="active => {this.showWarning = active; onScreenSizeChange()}"
                            style="margin-left: -5px; margin-right: -5px;"
                            :msgList="['默认只查询非结束状态的工单，如需查看已结束的工单，请在审批状态下拉列表中选择“结束”选项']"></paas-dismiss-message>
    </div>
    <div class="work-order-list">
      <el-table :data="workOrderListByPage"
                stripe
                :height="heightOfTable"
                :row-key="getRowKeys"
                :expand-row-keys="expandRows">
        <el-table-column label="审批工单名称" prop="name" minWidth="140" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="申请人" prop="creatorName" width="80" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="状态" prop="statusName" minWidth="100" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="申请时间" prop="formattedCreateTime" width="150" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="团队" prop="groupName" minWidth="120" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="操作" headerAlign="center" align="center" minWidth="100">
          <template slot-scope="scope">
            <el-button
                    v-if="scope.row.status != 'END'"
                    type="text"
                    :loading="statusOfWaitingResponse('cancel') && action.row.id == scope.row.id"
                    @click="handleTRClick($event,'cancel', scope.$index, scope.row)"
                    :class="[$storeHelper.permission['work-order_end'].disabled ?  'disabled' : 'danger']">
                    撤销工单</el-button>
            <div class="ant-divider" v-if="scope.row.status != 'END'"></div>
            <el-button
                    type="text" class="primary"
                    :class="{'expand': expandRows.indexOf(scope.row.id) > -1}"
                    @click="handleTRClick($event, 'detail', scope.$index, scope.row)"
                    :loading="statusOfWaitingResponse('detail') && action.row.id == scope.row.id">
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
              <el-form labelWidth="104px" size="mini" class="message-show">
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
                    <el-table-column label="应用名称" prop="appName" headerAlign="center" align="center" minWidth="200">
                    </el-table-column>
                    <el-table-column label="运行环境" headerAlign="center" align="center" minWidth="100">
                      <template slot-scope="scope">
                        <span>{{scope.row.spaceDescription}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" headerAlign="center" align="center" minWidth="100">
                      <template slot-scope="scope">
                        <el-button
                                type="text"
                                style="font-size: 14px;"
                                :class="['flex', $storeHelper.permission['go-to-page-log-deploy-from-work-order-list'].disabled?'disabled':'primary']"
                                :loading="statusOfWaitingResponse('go-to-page-log-deploy-from-work-order-list') && action.app.id == scope.row.id"
                                @click="goToPageLogDeploy($event, 'go-to-page-log-deploy-from-work-order-list', scope.$index, scope.row)">
                          <span>查看部署日志</span><i class="paas-icon-level-up"></i>
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form-item>
                <el-form-item label="待办人"><span style="font-weight: bold; color: red">{{workOrderDetail.userToDo}}</span></el-form-item>
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
            padding: 4px 6px;
            margin: 3px auto 5px;
            width: 80%;
            max-width: 900px;
            /*box-shadow: 0 0 2px 0 rgba(64,158,255, .6);*/
            /*border: 1px solid #dfe1e5;*/
            box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
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
      .item {
        display: inline-block;
        margin-right: 6px;
        label {
          color: black;
          font-weight: bold;
        }
        .paas-icon-close {
          &:hover {
            color: black;
            cursor: pointer;
          }
        }
      }
      .toggle-warning {
        display: inline-block;
        line-height: 24px;
        margin-left: 12px;
        color: #eb9e05;
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
  import paasDismissMessage from 'assets/components/dismiss-message.vue';
  export default {
    components: {paasDismissMessage},
    created() {
    },
    mounted() {
      this.setDateRange();
      // update value in next tick
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
    },
    beforeDestroy() {
    },
    data() {
      return {
        heightOfTable: '',
        showWarning: true,

        searchForm: {
          // workOrderName, creator通过filterKey进行假搜索
          workOrderName: '',
          creator: '',
          // status不再向后端发送
          status: [],

          filterKey: '',
          onlyUndone: false,
          dateRange: '',
        },
        queueForWaitingResponse: [],

        workOrderList: [],
        workOrderListByPage: [],
        getRowKeys: function (row) {
          return row.id;
        },
        expandRows: [],

        action: {
          row: null,
          app: null,
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

        statusUnDone: [{
          id: 'WORKORDER_APPLY',
          name: '工单申请'
        }, {
          id: 'WAIT_TEST',
          name: '等待测试',
        }, {
          id: 'TESTING',
          name: '测试受理中'
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
        },
        ],
        statusDone: [{
          id: 'END',
          name: '结束'
        }],
        statusList: [],
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
      '$storeHelper.screen.size': 'onScreenSizeChange',
      'searchForm.dateRange': function (value) {
        this.updateWorkOrderListByPage(true);
      },
      'searchForm.onlyUndone': {
        immediate: true,
        handler(onlyUndone) {
          if (onlyUndone) {
            this.statusList = this.statusUnDone;
            this.searchForm.status = this.statusList.map(it => it.id);
          } else {
            this.statusList = this.statusUnDone.concat(this.statusDone);
            this.searchForm.status = this.statusUnDone.map(it => it.id);
          }
        }
      },
      'searchForm.status': function (statusList) {
        this.updateWorkOrderListByPage();
      },
      'searchForm.filterKey': function () {
        if (this.currentPage > 1) {
          // update workOrderListByPage by change of currentPage
          this.currentPage = 1;
        } else {
          this.updateWorkOrderListByPage();
        }
      },
      'currentPage': function () {
        this.updateWorkOrderListByPage();
      },
    },
    computed: {
    },
    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          size = this.$storeHelper.screen.size;
        }
        try {
          // if this.showAppList == false, headerNode will not exist
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight;
        } catch(err) {
        }
      },
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
        start.setTime(start.getTime() - 1000 * 3600 * 24 * 60);
        this.searchForm.dateRange = [start, end];
      },
      handleButtonClick(action, params, evt) {
        switch (action) {
          case 'refresh':
            this.currentPage = 1;
            // updateWorkOrderListByPage will be triggered by change of dataRange
            this.setDateRange();
            break;
          case 'linker':
            this.$router.push(params.path);
            break;
          case 'work-order_download':
            if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
              this.$storeHelper.globalPopover.show({
                ref: evt.target,
                msg: this.$storeHelper.permission[action].reason
              });
              return;
            }
            this.currentPage = 1;
            this.downloadWorkOrderList();
            break;
        }
      },
      async handleTRClick(evt, action, index, row) {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        this.action.row = row;
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
              this.action.name = action;
            });
            return;
            break;
          case 'cancel':
            // console.log(this.$storeHelper.permission)
            if (!this.$storeHelper.permission.hasOwnProperty('work-order_end') || this.$storeHelper.permission['work-order_end'].disabled) {
              this.$storeHelper.globalPopover.show({
                ref: evt.target,
                msg: this.$storeHelper.permission['work-order_end'].reason
              });
              return;
            }

            this.addToWaitingResponseQueue(action);
            try {
               await this.$confirm(`确定要撤销工单"${row.name}"吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              await this.$net.requestPaasServer(this.$net.URL_LIST.work_order_cancel, {
                payload: {
                  id: row.id
                }
              }).then(resContent=>{
                this.$message({
                  type: 'success',
                  message: '撤销成功'
                });
                this.setDateRange();
                this.hideWaitingResponse(action);
              });
            } catch(err) {
              this.hideWaitingResponse(action);
            }
            break;
        }
      },
      // action = 'go-to-page-log-deploy-from-work-order-list'
      async goToPageLogDeploy(evt, action, index, row) {
        this.action.app = row;
        // console.log(this.action.row);
        // console.log(this.workOrderDetail);
        // console.log(row);

        // 查看用户是否是当前工单所属团队的团队成员，平台管理员不受限制
        if ((!this.workOrderDetail.groupId || !this.$storeHelper.groupList.find(it => it.id = this.workOrderDetail.id))
          && this.$storeHelper.getUserInfo('role') !== '平台管理员') {
          this.$message.error(`您不是"${this.workOrderDetail.groupName}"的团队成员，无法查看该团队下的部署日志`);
          return;
        }
        if (this.$storeHelper.currentGroupID != this.workOrderDetail.groupId) {
          try {
            this.addToWaitingResponseQueue(action);
            this.$net.vm.loadingText = `正在切换到团队："${this.workOrderDetail.groupName}"`;
            // wait until groupId is completely changed(such as, profileList, appList has received from server)
            await this.$storeHelper.changeGroup(this.workOrderDetail.groupId);
          } catch (err) {
            console.log(err);
            return;
          } finally {
            this.$net.vm.loadingText = null;
            this.hideWaitingResponse(action);
          }
        }
        this.$storeHelper.dataTransfer = {
          from: this.$net.page['profile/work-order/list'],
          data: {
            appId: row.appId,
            profileId: row.spaceId,
          }
        };
        this.$router.push(this.$net.page['profile/log/deploy']);
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
          // 工单名称
          name: '',
          // 申请人
          creatorName: '',
          // 审批状态
          // status: '',
          startTime: '',
          endTime: ''
        };
        if (this.searchForm.workOrderName) {
          options.name = this.searchForm.workOrderName.trim();
        }
        if (this.searchForm.creator) {
          options.creatorName = this.searchForm.creator.trim();
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
      },

      async updateWorkOrderListByPage(refresh = false) {
        if (refresh) {
          this.expandRows = [];
          await this.requestWorkOrderList();
        }
        this.workOrderListByPage = [];

        const filteredList = this.workOrderList.filter(it => {
          return this.searchForm.status.indexOf(it.status) > -1;
        }).filter(it => {
          return new RegExp(this.searchForm.filterKey).exec(['name', 'creatorName', 'groupName'].map(key => it[key]).join(''));
        });
        this.totalSize = filteredList.length;

        var page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        var start = page * this.pageSize;
        var length = this.pageSize;
        var end = start + length;
        this.workOrderListByPage = filteredList.slice(start, end).map(it => {
          it.formattedCreateTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
          return it;
        });
      },

      async downloadWorkOrderList() {
        let payload = {
          name: '',
          creatorName: '',
//          status: '',
          startTime: '',
          endTime: ''
        };
        if (this.searchForm.workOrderName) {
          payload.name = this.searchForm.workOrderName.trim();
        }
        if (this.searchForm.creator) {
          payload.creatorName = this.searchForm.creator.trim();
        }
        if (this.searchForm.dateRange) {
          let dateRange = this.searchForm.dateRange.map(it => {
            let v = this.$utils.formatDate(it, 'yyyy-MM-dd')
            return v;
          });
          payload.startTime = dateRange[0] + ' 00:00:00';
          payload.endTime = dateRange[1] + ' 23:59:59';
        } else {
          payload.startTime = '';
          payload.endTime = '';
        }

        let startTimestamp = new Date(payload.startTime);
        let endTimestamp = new Date(payload.endTime);
        let iDays = parseInt(Math.abs(endTimestamp.getTime() - startTimestamp.getTime()) /1000/60/60/24);
        // 工单下载暂时仅支持3个月之内
        // if (iDays > 92 || iDays < 0) {
        //   this.$message({
        //     duration: 5000,
        //     type: 'warning',
        //     message: '下载仅支持申请时间在3个月之内的工单！'
        //   });
        //   return;
        // }
        await this.$confirm('<div>1）只下载审批状态为“结束”的工单，可通过申请时间筛选下载工单的时间区间；</div>' +
          '<div>2）工单下载会比较耗费服务器性能，请尽量选择在非高峰期操作；</div>' , '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        });

        this.$net.addToRequestingRrlList(this.$net.URL_LIST.work_order_download.path);
        this.$net.getResponse(this.$net.URL_LIST.work_order_download, {
          payload
        }, {
          timeout: 600000,
          headers: {
            token: this.$storeHelper.getUserInfo('token')
          },
          responseType: 'blob'
        }).then(res => {
          const a = document.createElement('a');
          const blob = new Blob([res.data]);
          a.href = window.URL.createObjectURL(blob);
          a.download = `结束工单列表-${payload.endTime}.xls`;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
        }).catch(err => {
          this.$net.showError(err);
        }).finally(() => {
          this.$net.removeFromRequestingRrlList(this.$net.URL_LIST.work_order_download.path);
        });
      }
    }
  }
</script>