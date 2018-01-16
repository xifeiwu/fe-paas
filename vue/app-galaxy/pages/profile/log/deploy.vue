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
                    @click="handleOperationClick('show-log', scope.$index, scope.row)">查看日志</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
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
  export default {
    components: {elVersionSelector},
    data() {
      return {
        showLoading: false,
        deployLogList: []
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
            break;
        }
      }
    }
  }
</script>