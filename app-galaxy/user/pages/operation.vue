<template>
  <div id="operation-main">
    <div class="header">
      <div class="top-tip" style="font-size: 14px">
        <span style="font-weight: bold; font-size: 14px;"><i class="el-icon-warning"></i></span>
        <span>操作记录每隔15分钟更新一次，若需要立即更新请联系PAAS团队。操作状态不涉及业务逻辑上的成功失败，仅代表操作动作正确完成或失败</span>
      </div>
      <div class="search-form">
        <el-form :model="form" :inline="true" class="form">
          <el-form-item class="el-form-group">
            <label>团队:</label>
            <el-select v-model="form.groupId" filterable @change="handleTick('groupChange')">
              <el-option v-for="(item,index) in groupList" :label="item.asLabel" :key="index" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="el-form-operation-module">
            <label>功能模块:</label>
            <el-select v-model="form.moduleName" @change="handleTick('moduleNameChange')">
              <el-option v-for="(item,index) in operationModuleList" :label="item.description" :key="index" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="el-form-operation-type">
            <label>操作类型:</label>
            <el-select v-model="form.operationType" @change="handleTick('operationTypeChange')" filterable>
              <el-option v-for="(item,index) in operationTypeList" :label="item.description" :key="index" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <label>操作人:</label>
            <el-select v-model="form.userId" @change="handleTick('userChange')">
              <el-option v-for="(item,index) in memberList" :label="item.realName" :key="index" :value="item.userId">
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
          <el-form-item class="el-form-keyword" v-if="false">
            <label>关键字:</label>
            <el-input placeholder="可按应用名称搜索" v-model="searchValue"></el-input>
            <el-button size="mini-extral" type="primary" @click="handleTick('search')" @keyup.enter.native="handleTick('search')">搜索</el-button>
          </el-form-item>
          <el-button type="primary" size="mini-extral" @click="handleRefresh('false')">刷新</el-button>
          <el-button type="danger" size="mini-extral" @click="handleRefresh('true')" v-if="isAdmin">强制刷新</el-button>
          <el-tooltip content="强制刷新将会强制生成新的索引，可以立即看到最近的操作记录，但可能引起接口超时" v-if="isAdmin">
          <i class="el-icon-info" style="color: #E6A23C"></i>
          </el-tooltip>
        </el-form>
      </div>
    </div>
    <div class="body">
      <el-table
              :data="operationLogList"
              style="width: 100%;"
              stripe="">
        <el-table-column prop="groupName" label="团队" align="center"></el-table-column>
        <el-table-column prop="applicationName" label="应用名称" align="center">
          <template slot-scope="scope">
            {{scope.row.applicationName || scope.row.applicationName != "" ? scope.row.applicationName: "---"}}
          </template>
        </el-table-column>
        <el-table-column label="服务名称(serviceName)" align="center">
          <template slot-scope="scope">
            {{scope.row.serviceName || scope.row.serviceName != "" ? scope.row.serviceName: "---"}}
          </template>
        </el-table-column>
        <el-table-column prop="env" label="环境" align="center">
          <template slot-scope="scope">
            {{scope.row.env ? scope.row.env : "--"}}
          </template>
        </el-table-column>
        <el-table-column prop="moduleDescription" label="功能模块" align="left"></el-table-column>
        <el-table-column prop="bundleName" label="操作类型" align="left"></el-table-column>
        <el-table-column prop="userRealName" label="操作人" align="center"></el-table-column>
        <el-table-column prop="status" label="操作状态" align="center">
          <template slot-scope="scope">
            {{operationStatus(scope.row.status)}}
          </template>
        </el-table-column>
        <el-table-column label="操作详情" align="center" prop="operationContent" width="150px">
          <template slot-scope="scope">
            <el-tooltip effect="dark">
              <pre slot="content" style="max-width: 500px;overflow: scroll;max-height: 500px;" v-if="scope.row.operationContent && $utils.isObject(scope.row.operationContent)">{{JSON.stringify(scope.row.operationContent, null, 2)}}</pre>
              <div slot="content" v-else style="max-width: 500px;overflow: scroll;max-height: 500px;">{{scope.row.operationContent}}</div>
              <span style="color:#409EFF;">更多...</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="时间" align="center"></el-table-column>
      </el-table>
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
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          .el-form-item {
            margin-bottom: 0;
          }
          .el-form-group {
            .el-input__inner {
              width: 300px;
            }
          }
          .el-form-keyword {
            min-width: 340px;
            .el-form-item__content {
              display: flex;
              align-items: center;
              label {
                min-width: 50px;
              }
              .el-input__inner {
                height: 28px;
                font-size: 13px;
              }
              .el-button {
                height: 24px;
                margin-left: 10px;
              }
            }
          }
        }
        .el-select .el-input__inner {
          height: 24px;
          font-size: 13px;
        }
        .el-range-editor--mini .el-input__inner{
          height: 24px
        }
        margin-bottom: 15px;
      }
    }
    .el-pagination {
      text-align: center;
      &.prev-disabled {
        .btn-prev {
          color: #b4bccc;
          cursor: not-allowed;
        }
      }
      &.next-disabled {
        .btn-next {
          color: #b4bccc;
          pointer-events: none;
        }
      }
    }
  }
</style>

<script>
  export default {
    async created() {
      this.groupInfo = this.$storeHelper.globalUserGroupInfo;
      const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.user_group_list);
      this.groupList = resContent.groupList.map(it => {
        it.asLabel = `${it.name} (${it.tag})`;
        return it;
      });
      this.isAdmin = this.$storeHelper.getUserInfo('role') == "平台管理员";
      //如果是平台管理员，有全部选项，且默认选中全部，否则其他用户默认为当前团队
      if (this.isAdmin) {
        this.groupList = [{id: -1, asLabel: "全部"}].concat(this.groupList);
        this.form.groupId = this.groupList[0].id;
      } else if (this.groupInfo) {
        this.form.groupId = this.groupInfo.id;
      }
      this.setDefaultDateRange();
      this.userList = await this.$net.getUsersAll();
      this.handleTick("groupChange");
      let operationModuleList = await this.requestOperationModule();
      if (operationModuleList) {
        operationModuleList = [{description: "全部", code: "FULL", operationLogTypeVOList:[{description: "全部", code: "FULL"}]}].concat(operationModuleList);
        this.operationModuleList = operationModuleList;
        this.operationTypeList = this.operationModuleList[0].operationLogTypeVOList;
        this.form.moduleName = this.operationModuleList[0].code;
        this.form.operationType = this.operationTypeList[0].code;
      }
    },
    mounted() {
    },
    computed: {
    },
    data() {
      return {
        groupList: [],
        groupInfo: null,
        userList: [],
        memberList: [],
        operationModuleList: [],
        operationTypeList: [],
        operationLogList: [],
        pageSize: 12,
        showPagination: false,
        currentPage: 1,
        ifnotHaveMore: false,
        isAdmin: false,
        searchValue: "",
        form: {
          userId: '',
          dateTimeRange: [],
          operationType: '',
          moduleName: '',
          groupId: '',
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

      async requestOperationList({action = '',force = false}) {
        let payload = {
          'startTime': this.form.dateTimeRange[0].getTime(),
          'endTime': this.form.dateTimeRange[1].getTime(),
          'page': this.currentPage,
          'size': this.pageSize,
          'force': force,
        };
        if (this.form.groupId != -1) {
          payload["groupId"] = this.form.groupId;
        }
        if (action != 'groupChange' && this.form.userId != -1) {
          payload["userId"] = this.form.userId;
        }
        if (this.form.moduleName !== 'FULL') {
          payload["moduleName"] = this.form.moduleName;
          payload["bundle"] = this.form.operationType;
        }
        let resData = await this.$net.requestPaasServer(this.$net.URL_LIST.operation_log,{payload});
        resData.content.forEach(it => {
          let user = this.userList.find(user => {
            return user["id"] === it["userId"];
          });
          it["userRealName"] = user ? user["realName"] : "--";
          let group = this.groupList.find(group => {
            return group.id === it["groupId"];
          });
          it["groupName"] = group ? group["name"] : "--";
          it["operationTime"] = this.$utils.formatDate(it["timestamp"], 'yyyy-MM-dd hh:mm:ss');
          try {
            it["operationContent"] = it["content"] && it["content"] !== "" ? JSON.parse(it["content"]) : it["content"];
          } catch (e) {
            it ["operationContent"] = it["content"];
          }
        });
        return resData;
      },

      async handleTick(action) {
        switch (action) {
          case "groupChange":
            await this.requestGroupMember(this.form.groupId);
            break;
          case "moduleNameChange":
            this.operationTypeList = [];
            let result = this.operationModuleList.find(it => {
              return it.code === this.form.moduleName;
            });
            if (result) {
              this.operationTypeList = result.operationLogTypeVOList;
              this.form.operationType = this.operationTypeList[0].code;
            }
            break;
        }
        this.setInit();
        let resData = await this.requestOperationList({action:action});
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
        this.operationLogList = [];
        this.totalSize = 0;
        this.currentPage = page;
        let resData = await this.requestOperationList({});
        this.ifnotHaveMore = resData.more;
        this.operationLogList = resData.content;
      },

      async handleRefresh(force) {
        this.setInit();
        let resData = await this.requestOperationList({force:force});
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
      },

      async requestGroupMember(groupId) {
        const memberList = (await this.$net.requestPaasServer(this.$net.URL_LIST.group_member_list, {
          payload: {
            id: groupId
          }
        }))['groupUserList'];
        this.memberList = [{id: -1, userId: -1, userName: 'quanbu', realName: '全部'}].concat(memberList);
        this.form.userId = this.memberList[0].userId;
      },

      async requestOperationModule() {
        this.operationModuleList = [];
        let query = {
          moduleName: ""
        };
         return await this.$net.requestPaasServer(this.$net.URL_LIST.operation_module, {query});
      },
    }
  }
</script>