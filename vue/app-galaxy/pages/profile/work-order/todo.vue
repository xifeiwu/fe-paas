<template>
  <div id="work-order-todo">
    <div class="header">
      <el-row class="operation">
        <el-col :span="20">
          <label style="width: 68px; line-height: 26px; color: #409EFF">申请人：</label>
          <el-input size="mini" style="display: inline-block; width: 160px;"></el-input>
          <label style="width: 72px; line-height: 26px; color: #409EFF"">申请时间：</label>
          <el-date-picker style="display: inline-block; width: 280px;"
              class="custom"
              v-model="dateRange"
              type="daterange"
              size="mini"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="datePickerOptions">
          </el-date-picker>
          <el-button
            size="mini-extral"
            type="primary"
            @click="handleButtonClick('search')">搜索</el-button>
        </el-col>
        <el-col :span="4"
                style="line-height: 26px">
          <el-button
                size="mini-extral"
                type="primary"
                @click="handleButtonClick('linker', {path: '/profile/work-order/todo/add'})">申请工单</el-button>
        </el-col>
      </el-row>
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
          padding: 0px 10px;
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
        dateRange: '',
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
          case 'linker':
            this.$router.push(params.path);
            break;
        }
      }
    }
  }
</script>