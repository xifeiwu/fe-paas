<template>
  <div id="work-order-todo">
    <div class="header">
      <el-row class="operation" type="flex" justify="center" align="middle">
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
        <el-col :span="4">
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
          padding: 0px 0px;
          &:first-child {
            text-align: center;
            .item {
              display: inline-block;
            }
          }
          &:nth-child(2) {
            text-align: right;
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
          userName: '',
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
            break;
          case 'linker':
            this.$router.push(params.path);
            break;
        }
      }
    }
  }
</script>