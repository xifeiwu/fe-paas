<template>
  <div id="operation-main">
    <div class="header">
      <div class="top-tip" style="font-size: 14px">
        <span style="font-weight: bold; font-size: 14px;"><i class="el-icon-warning"></i></span>
        <span>操作记录的获取可能会有延迟，若要立即获取最近的操作记录，请点击强制刷新。</span>
      </div>
      <div class="search-form">
        <el-form :model="form" :inline="true" class="form">
          <el-form-item>
            <label>用户名:</label>
            <el-select v-model="form.userId" @change="handleTick('userChange')">
              <el-option v-for="(item,index) in userList" :label="item.realName" :key="index" :value="item.userId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <label>操作类型:</label>
            <el-select v-model="form.operation" @change="handleTick('operationChange')">
              <el-option v-for="(item,index) in this.$storeHelper.operationList" :label="item.operationNickName" :key="index"
                         :value="item.operationName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <label>起始时间:</label>
            <el-date-picker
                    style="display: inline-block; width: 340px;"
                    size="mini"
                    v-model="form.dateTimeRange"
                    type="datetimerange"
                    :picker-options="pickerOptions"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right"
                    :enableClose="false"
                    @change="handleTick('timeChange')">
            </el-date-picker>
          </el-form-item>
        </el-form>
        <el-row style="margin-left: 3px;">
          <el-col :span="2">
            <el-button type="primary" size="mini-extral" @click="handleRefresh('false')">刷新</el-button>
          </el-col>
          <el-col :span="3">
            <el-button type="danger" size="mini-extral" @click="handleRefresh('true')">强制刷新</el-button>
            <el-tooltip content="强制刷新将会强制生成新的索引，可以立即看到最近的操作记录，但可能引起接口超时">
              <i class="el-icon-info" style="color: #E6A23C"></i>
            </el-tooltip>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="body">
      <el-table
              :data="operationLogList"
              style="width: 100%;"
              stripe="">
        <el-table-column prop="operationNickName" label="操作类型" align="left" width="250px"></el-table-column>
        <el-table-column prop="userRealName" label="操作人" align="center"></el-table-column>
        <el-table-column prop="status" label="操作状态" align="center">
          <template slot-scope="scope">
            {{operationStatus(scope.row.status)}}
          </template>
        </el-table-column>
        <el-table-column prop="env" label="环境" align="center">
          <template slot-scope="scope">
            {{scope.row.env ? scope.row.env : "--"}}
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="时间" align="center"></el-table-column>
      </el-table>
      <div class="pagination-container">
        <div class="pagination">
          <el-pagination
                  size="large"
                  layout="prev, next"
                  :page-size = "pageSize"
                  :current-page = "currentPage"
                  @current-change="pageChange"
                  :class="{'prev-disabled': currentPage === 1, 'next-disabled': !ifnotHaveMore}"
                  v-if="showPagination"
          >
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  #operation-main {
    .header {
      .top-tip {
        background-color: #E6A23C;
      }
    }
  }
</style>

<style lang="scss">
  #operation-main {
    .header {
      .search-form {
        .el-form {
          height: 45px;
        }
        .el-select .el-input__inner {
          height: 24px;
        }
        .el-range-editor--mini .el-input__inner{
          height: 24px
        }
        margin-bottom: 15px;
      }
    }
    .pagination {
      .prev-disabled {
        .btn-prev {
          color: #b4bccc;
          cursor: not-allowed;
        }
      }
      .next-disabled {
        .btn-next {
          color: #b4bccc;
          cursor: not-allowed;
        }
      }
    }
  }
</style>

<script>
  export default {
    async created() {
      this.groupInfo = this.$storeHelper.globalUserGroupInfo;
      if (this.groupInfo) {
        let groupId = this.groupInfo.id;
        let memberList = await this.$net.getGroupMembers({id: groupId});
        this.userList = [{id: -1, userId: -1, userName: 'quanbu', realName: '全部'}].concat(memberList);
        this.form.userId = this.userList[0].userId;
      }
      this.operationList = this.$storeHelper.operationList;
      this.form.operation = this.operationList[0].operationName;
      this.setDefaultDateRange();
      this.handleTick();
    },
    mounted() {
    },
    watch: {
    },
    computed: {
    },
    data() {
      return {
        groupInfo: null,
        userList: [],
        operationList: [],
        operationLogList: [],
        pageSize: 12,
        showPagination: false,
        currentPage: 1,
        ifnotHaveMore: false,
        form: {
          userId: '',
          dateTimeRange: [],
          operation: '',
        },
        pickerOptions: {
          shortcuts: [{
            text: '最近6小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 6);
              picker.$emit('pick', [start, end]);
            }
          },{
            text: '最近12小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 12);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一天',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三天',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
              picker.$emit('pick', [start, end]);
            }
          },{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }],
          disabledDate(time) {
            const getDate = function (dt) {
              return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
            };
            const toDate = getDate(time);
            return toDate > getDate(new Date());
          },
        }
      }
    },
    methods: {
      setDefaultDateRange() {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 1000 * 3600 * 6);
        this.form.dateTimeRange = [start, end];
      },

      async requestOperationList(force) {
        let query = {
          'groupId': this.groupInfo.id,
          'startTime': this.form.dateTimeRange[0].getTime(),
          'endTime': this.form.dateTimeRange[1].getTime(),
          'page': this.currentPage,
          'size': this.pageSize,
          'force': force,
        };
        if (this.form.userId != -1) {
          query["userId"] = this.form.userId;
        }
        if (this.form.operation !== 'FULL') {
          query["bundle"] = this.form.operation;
        }
        let resData = await this.$net.requestPaasServer(this.$net.URL_LIST.operation_log,{query});
        resData.content.forEach(it => {
          it["operationNickName"] = this.operationList.find(obj => {
            return obj["operationName"] === it["bundle"];
          })["operationNickName"];
          it["userRealName"] = this.userList.find(user => {
            return user["userId"] === it["userId"];
          })["realName"];
          it["operationTime"] = this.$utils.formatDate(it["timestamp"], 'yyyy-MM-dd hh:mm:ss');
        });
        return resData;
      },

      async handleTick(action) {
        this.setInit();
        let resData = await this.requestOperationList();
        this.operationLogList = resData.content;
        this.ifnotHaveMore = resData.more;
        this.showPagination = this.ifnotHaveMore;
      },

      setInit() {
        this.operationLogList = [];
        this.currentPage = 1;
        this.totalSize = 0;
      },

      async pageChange(page) {
        this.currentPage = page;
        let resData = await this.requestOperationList();
        this.ifnotHaveMore = resData.more;
        this.operationLogList = resData.content;
      },

      async handleRefresh(force) {
        this.currentPage = 1;
        let resData = await this.requestOperationList(force);
        this.ifnotHaveMore = resData.more;
        this.operationLogList = resData.content;
      },

      operationStatus(status) {
        switch (status) {
          case 'SUCC':
            return "成功";
          case 'FAIL':
            return "失败";
          case 'UNKNOWN':
            return "未知";
          case 'EXCEPTION':
            return "异常";
          default:
            break;
        }
      }
    }
  }
</script>