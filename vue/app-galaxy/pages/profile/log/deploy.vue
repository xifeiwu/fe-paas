<template>
  <div id="log-deploy">
    <div class="header">
      <my-version-selector @version-selected="onVersionSelected"></my-version-selector>
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
    <el-dialog-for-log :showStatus="dialogStatus">
      <div slot="log-list" v-for="(item,index) in deployLogs" :key="index" class="log-item">{{item}}</div>
    </el-dialog-for-log>
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
  import MyVersionSelector from '../utils/components/version-selector';
  import elDialogForLog from '../utils/components/dialog4log.vue';
  export default {
    components: {MyVersionSelector, elDialogForLog},
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
      onVersionSelected(appInfo, profileInfo, serviceInfo) {
//        console.log(appId, profileID, version);
        let profileID = profileInfo.id;
        this.showLoading = true;
        this.deployLogList = [];
        this.$net.getDeployLogList({
          appId: appInfo.appId,
          spaceId: profileID,
          serviceVersion: serviceInfo.serviceVersion
        }).then(deployLogList => {
//          console.log(deployLogList);
          this.deployLogList = deployLogList;
          this.showLoading = false;
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
      }
    }
  }
</script>