<template>
  <div id="log-deploy">
    <div class="header">
      <el-version-selector @version-selected="onVersionSelected"></el-version-selector>
    </div>
    <div class="list">
      <el-table
              :data="deployLogList"
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
    </div>
    <el-dialog-log :showStatus="dialogStatus" :deployLogs="deployLogs"></el-dialog-log>
  </div>
</template>
<style lang="scss" scoped>
  #log-deploy {
    .header {
      margin: 5px;
    }
  }
</style>
<script>
  import elVersionSelector from '../utils/components/version-selector';
  import elDialogLog from '../utils/components/dialog4log.vue';
  export default {
    components: {elVersionSelector, elDialogLog},
    data() {
      return {
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
        deployLogs: []
      }
    },
    methods: {
      onVersionSelected(appInfo, profileID, version) {
//        console.log(appId, profileID, version);
        this.$net.getDeployLogList({
          appId: appInfo.appId,
          spaceId: profileID,
          serviceVersion: version
        }).then(deployLogList => {
//          console.log(deployLogList);
          this.deployLogList = deployLogList;
        }).catch(err => {
          this.$message.error('列表获取失败！');
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
      }
    }
  }
</script>