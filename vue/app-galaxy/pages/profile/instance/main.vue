<template>
  <div id="instance-main">
    <div class="header">
      <my-version-selector @version-selected="onVersionSelected"></my-version-selector>
    </div>
    <div class="section-content">
      <el-table
              :data="currentInstanceList"
              style="width: 100%"
              v-loading="showLoading"
              element-loading-text="加载中"
      >
        <el-table-column
                prop="instanceName"
                label="实例名称"
                width="300">
        </el-table-column>
        <el-table-column
                prop="status"
                label="状态"
                width="80"
        >
        </el-table-column>
        <el-table-column
                prop="intranetIP"
                label="内网IP"
                width="120">
        </el-table-column>
        <el-table-column
                label="创建时间"
                prop="createTime"
                width="120">
        </el-table-column>
        <el-table-column label="操作" prop="operation" minWidth="170" headerAlign="center">
          <template slot-scope="scope">
            <el-button
                    @click="handleOperationClick('terminal', scope.$index, scope.row)"
                    size="mini-extral"
                    type="primary">终端</el-button>
            <el-button
                    @click="handleOperationClick('work-log', scope.$index, scope.row)"
                    size="mini-extral"
                    type="primary">查看运行日志</el-button>
            <el-button
                    @click="handleOperationClick('monitor', scope.$index, scope.row)"
                    size="mini-extral"
                    type="primary">监控</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss">
  #instance-main {
    .header {
      .el-select .el-input__inner {
        height: 24px;
      }
    }
    .section-content {
      .el-table {
        margin-bottom: 40px;
        .el-table__row {
          .el-button {
            margin: 2px 4px 2px 0px;
            float: left;
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #instance-main {
    .header {
      margin: 5px;
      font-size: 14px;
    }
  }

</style>

<script>
  import appPropUtils from '../utils/app_prop';
  import StoreHelper from '../utils/store-helper.vue';
  import MyVersionSelector from '../utils/components/version-selector';

  export default {
    components: {MyVersionSelector},
    mixins: [StoreHelper],
    created() {
    },
    data() {
      return {
        serviceInfo: null,
        showLoading: false,
//        currentInstanceList: [{
//          createTime: "2018-01-11 20:39:09",
//          health: null,
//          instanceName: "v3-puhui-notification-3270010048-3xp1s",
//          intranetIP:null,
//          message:null,
//          status:"运行中",
//          version: "puhui-notification:2018-01-11-20-38-12"
//        }],
        currentInstanceList: [],
      }
    },
    watch: {
    },
    methods: {
      onVersionSelected(appInfo, profileInfo, serviceInfo) {
//        console.log(appInfo, profileID, serviceInfo);
        this.serviceInfo = serviceInfo;
        this.requestInstanceList(appInfo.appId, profileInfo.id, serviceInfo.serviceVersion);
      },
      /**
       * 获取实例列表
       */
      requestInstanceList(appID, spaceID, version) {
        if (!appID || !spaceID) {
          console.log('appID or spaceID can not be empty');
          return;
        }
        this.showLoading = true;
        this.$net.getInstanceList({
          appId: appID,
          spaceId: spaceID,
          serviceVersion: version
        }).then(content => {
//          console.log(content);
          if (content.hasOwnProperty('instanceList')) {
            this.currentInstanceList = content['instanceList'];
          }
          this.showLoading = false;
        }).catch(err => {
          console.log(err);
          this.$message({
            type: 'error',
            message: '查找服务版本失败！'
          });
          this.showLoading = false;
        });
      },

      /**
       * handle click event in operation column
       */
      handleOperationClick(action, index, row) {
        switch (action) {
          case 'terminal':
            let id = null, ip = null;
            if (this.serviceInfo && this.serviceInfo.hasOwnProperty('id')) {
              id = this.serviceInfo.id;
            }
            if (row.hasOwnProperty('intranetIP') && row['intranetIP']) {
              ip = row['intranetIP'];
            }
            if (id && ip) {
              let terminalPath = this.$url.page_terminal_path + '?id=' + id + '&ip=' + ip + '&name=' + row['instanceName'];
//              this.$net.getTerminalInfo({
//                serviceId: id
//              });
              window.open(terminalPath, '_blank');
            } else {
              this.$message.error('组ID或内网IP没有找到');
            }
            break;
          case 'work-log':
            break;
          case 'monitor':
            break;
        }
      },
    }
  }
</script>