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
      </el-row>
    </div>
    <div class="work-order-list">
      <el-table :data="workOrderListByPage"
                v-loading="showLoading"
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
                    @click="handleOperationClick('detail', scope.$index, scope.row)"
                    :loading="waitingResponse">详情</el-button>
            <el-button
                    size="mini-extral"
                    type="success"
                    @click="handleOperationClick('deploy-log', scope.$index, scope.row)">部署日志</el-button>
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

    <el-dialog title="工单详情" :visible="operation.name == 'detail'"
               @close="operation.name = null"
    >
      <el-form labelWidth="120px" size="mini">
        <el-form-item label="工单名称">{{detailForm.name}}</el-form-item>
        <el-form-item label="申请人">{{detailForm.creator}}</el-form-item>
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
        <el-form-item label="待办人">{{detailForm.userToDo}}
        </el-form-item>
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
            <el-table-column label="处理操作" prop="action" headerAlign="center">
            </el-table-column>
            <el-table-column label="处理人" prop="handleUserName" headerAlign="center">
            </el-table-column>
            <el-table-column label="备注" prop="remark" headerAlign="center">
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary"
                   @click="operation.name = null">关&nbsp闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<style lang="scss">
  #work-order-list {
    .el-table {
      .el-table__row {
        .el-button {
          margin: 2px 4px;
          float: left;
          .el-icon-arrow-right {
            vertical-align: middle;
            transition: transform 0.2s ease-in-out;
            &.expand {
              transform: rotate(90deg);
            }
          }
          &:first-child {
            margin-left: 0px;
          }
        }
        .el-button + .el-button {
          margin-left: 0px;
        }
      }
    }
    .header {
      margin: 5px;
      font-size: 14px;
      text-align: center;
      .el-row.operation {
        display: inline-block;
        .item {
          margin: 3px;
          display: inline-block;
          label {
            color: #409EFF
          }
        }
      }
      .el-select .el-input__inner {
        height: 26px;
      }
    }
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
  import ElDialog from "../../../../packages/dialog/src/component";
  import ElFormItem from "../../../../packages/form/src/form-item";
  import ElTable from "../../../../packages/table/src/table";
  export default {
    components: {ElTable, ElFormItem, ElDialog}, created() {
//      let pagination = document.querySelector('.pagination');
//      console.log(pagination);
    },
    data() {
      return {
        searchForm: {
//          workOrderName: '',
          workOrderName: '',
          creator: '',
          status: '',
          dateRange: '',
        },

        waitingResponse: false,
        showLoading: false,
        workOrderList: [],

        operation: {
          name: null,
        },
        detailForm: {

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
            console.log(this.searchForm);
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
              options.status = this.searchForm.status;
            } else {
              delete options.status;
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
            this.$net.getWorkOrderList(options).then(content => {
              console.log(content);
              if (content.hasOwnProperty('workOrderDeployList')) {
                this.workOrderList = content.workOrderDeployList;
              }
              this.totalSize = content.total;

              this.showLoading = false;
            }).catch(err => {
              this.showLoading = false;
            });
            break;
          case 'linker':
            this.$router.push(params.path);
            break;
        }
      },
      handleOperationClick(action, index, row) {
        switch (action) {
          case 'detail':
            this.waitingResponse = true;
            this.detailForm = {
              name: row.name,
              creator: row.creatorName,
              featureList: [],
              appList: [],
              userToDo: '获取失败',
              userAcceptedList: [],
              operationList: [],
            };
            this.$net.getWorkOrderDetail({
              id: row.id
            }).then(result => {
              console.log(result);
              if (result.hasOwnProperty('featureList')) {
                this.detailForm.featureList = result.featureList;
              }
              if (result.hasOwnProperty('appList')) {
                this.detailForm.appList = result.appList;
              }
              if (result.hasOwnProperty('userToDo')) {
                this.detailForm.userToDo = result.userToDo;
              }
              if (result.hasOwnProperty('userAcceptedList')) {
                this.detailForm.userAcceptedList = result.userAcceptedList;
              }
              if (result.hasOwnProperty('operationList')) {
                this.detailForm.operationList = result.operationList;
              }
              this.operation.name = action;
              this.waitingResponse = false;
            }).catch(err => {
              this.operation.name = action;
              this.waitingResponse = false;
            });
//            this.detailForm = {
//              name: row.name,
//              creator: row.creatorName,
//              featureList: [{
//                functionName: '测试galaxy-server工单',
//                functionType: 'DEMAND',
//                jiraAddress: 'http://jira.puhuitech.cn/browse/BASE-537',
//                description: '测试paas上线'
//              }, {
//                functionName: '测试galaxy-server工单',
//                functionType: 'DEMAND',
//                jiraAddress: 'http://jira.puhuitech.cn/browse/BASE-537',
//                description: '测试paas上线'
//              }],
//              appList: ['datapi-sdk-api'],
//              userToDo: '工单已结束!',
//              userAcceptedList: [{
//                userName: 'user',
//                status: 'passed'
//              }],
//              operationList: [{
//                createTime: '2017-09-30',
//                action: "TEST_ACCEPT",
//                handleUserName: 'me',
//                remark: '测试通过'
//              }]
//            };
            break;
          case 'deploy-log':
            console.log('deploy-log');
            break;
        }
      },
      handlePaginationPageChange(page) {
        this.currentPage = page;
      }
    }
  }
</script>