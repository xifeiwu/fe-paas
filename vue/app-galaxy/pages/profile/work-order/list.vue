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
  </div>
</template>
<style lang="scss">
  #work-order-list {
    .header {
      margin: 5px;
      font-size: 14px;
      text-align: center;
      .el-row.operation {
        display: inline-block;
        .item {
          padding: 0px 3px;
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
        searchForm: {
          workOrderName: '',
          userName: '',
          status: '',
          dateRange: '',
        },
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
            this.$net.getWorkOrderList(options);
            break;
          case 'linker':
            this.$router.push(params.path);
            break;
        }
      }
    }
  }
</script>