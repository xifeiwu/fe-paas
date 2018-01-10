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
                  v-model="searchForm.userName"
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
      <el-table :data="workOrderList"
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
                    @click="handleOperationClick('detail', scope.$index, scope.row)">详情</el-button>
            <el-button
                    size="mini-extral"
                    type="success"
                    @click="handleOperationClick('deploy-log', scope.$index, scope.row)">部署日志</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
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
  }
</style>

<script>
  export default {
    data() {
      return {
        searchForm: {
          workOrderName: '',
          userName: '',
          status: '',
          dateRange: '',
        },

        showLoading: false,
        workOrderList: [],

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
              options.name = this.searchForm.workOrderName;
            }
            if (this.searchForm.userName) {
              options.creatorName = this.searchForm.userName;
            } else {
              options.creatorName = '';
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
            this.$net.getWorkOrderList(options).then(content => {
//              console.log(content.workOrderDeployList);
              if (content.hasOwnProperty('workOrderDeployList')) {
                this.workOrderList = content.workOrderDeployList;
              }
            })
            break;
          case 'linker':
            this.$router.push(params.path);
            break;
        }
      },
      handleOperationClick(action, index, row) {
        switch (action) {
          case 'detail':
            console.log('detail');
            break;
          case 'deploy-log':
            console.log('deploy-log');
            break;
        }
      }
    }
  }
</script>