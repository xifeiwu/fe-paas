<template>
  <div id="log-deploy">
    <div class="header">
      <my-version-selector :customConfig="localServiceConfig"
                           @version-selected="onVersionSelected"></my-version-selector>
    </div>
    <div class="list">
      <el-table
              :data="deployLogListByPage"
              style="width: 100%"
              v-loading="showLoading"
              element-loading-text="加载中"
      >
        <el-table-column
                prop="createTime"
                label="部署时间">
        </el-table-column>
        <el-table-column
                prop="deployUserName"
                label="部署人员"
        >
        </el-table-column>
        <el-table-column
                label="操作">
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="success"
                    :loading="waitingResponse && operation.rowID == scope.row.id"
                    @click="handleOperationClick('show-log', scope.$index, scope.row)">查看日志</el-button>
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
    <el-dialog-for-log :showStatus="dialogStatus">
      <div slot="log-list" v-for="(item,index) in deployLogs" :key="index" class="log-item">{{item}}</div>
    </el-dialog-for-log>
  </div>
</template>
<style lang="scss" scoped>
  #log-deploy {
    .header {
      padding: 5px 0px;
    }
    .list {
      .el-table {
      }
    }
  }
</style>
<style lang="scss">

</style>
<script>
  import MyVersionSelector from '../components/version-selector';
  import elDialogForLog from '../components/dialog4log.vue';
  export default {
    components: {MyVersionSelector, elDialogForLog},
    created() {
      // set default service
      let queryParam = this.$route.query;
      if (queryParam && queryParam.hasOwnProperty('from')) {
        let formerPage = queryParam['from'];
        switch (formerPage) {
          case '/service':
            this.localServiceConfig = this.$storeHelper.getUserConfig('profile/service');
            break;
          case '/work-order/list':
            this.localServiceConfig = this.$storeHelper.getTmpProp('versionInfo');
            break;
        }
      }
//      console.log('this.localServiceConfig');
//      console.log(this.localServiceConfig);
    },
    data() {
      return {
        // service config in localStorage
        localServiceConfig: null,

        showLoading: false,
        deployLogList: [],
        operation: {
          appID: 0
        },
        waitingResponse: false,

        dialogStatus: {
          visible: false,
          full: false,
        },
        deployLogs: [],
        deployLogListByPage: [],

        // data for pagination
        totalSize: 0,
        pageSize: 10,
        currentPage: 1,
      }
    },
    methods: {
      onVersionSelected(appInfo, profileInfo, serviceInfo) {
        this.deployLogList = [];
        this.deployLogListByPage = [];
        if (!appInfo || !profileInfo || !serviceInfo) {
          return;
        }
        let profileID = profileInfo.id;
        this.showLoading = true;
        this.$net.getDeployLogList({
          appId: appInfo.appId,
          spaceId: profileID,
          serviceVersion: serviceInfo.serviceVersion
        }).then(deployLogList => {
//          console.log(deployLogList);
          this.deployLogList = deployLogList;
          this.totalSize = this.deployLogList.length;
          this.showLoading = false;
          this.getDeployLogListByPage();
        }).catch(err => {
          this.$message.error('列表获取失败！');
          this.showLoading = false;
        });
      },
      handleOperationClick(action, index, row) {
        switch (action) {
          case 'show-log':
            let logPath = row.logPath;
            let logName = row.logName;
            if (!logPath || !logName) {
              this.$message.error('该次部署失败，没有部署日志');
              return;
            }
            this.operation.rowID = row.id;
            this.waitingResponse = true;
            this.$net.getHistoryDeployLog({
              logPath, logName
            }).then(deployLog => {
//              console.log(deployLog);
              this.waitingResponse = false;
              this.deployLogs = deployLog.split('\n');
              this.dialogStatus.visible = true;
            });
            break;
        }
      },

      getDeployLogListByPage() {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;
        let end = start + length;
        this.deployLogListByPage = this.deployLogList.slice(start, end);
      },

      // the first page of pagination is 1
      // called at: 1. at the data of response; 2. change of pagination
      handlePaginationPageChange(value) {
        this.currentPage = value;
        this.getDeployLogListByPage();
      },
    }
  }
</script>