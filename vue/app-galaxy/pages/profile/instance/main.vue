<template>
  <div id="instance-main">
    <el-row class="header">
      <el-col :span="4">
        <el-button v-if="true"
                   size="mini-extral"
                   type="primary"
                   @click="handleButtonClick('refresh')">刷新</el-button></el-col>
      <el-col :span="20">
        <my-version-selector :customConfig="localConfig" ref="version-selector"
                             @version-selected="onVersionSelected"></my-version-selector>
      </el-col>
    </el-row>
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
                width="300"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                prop="status"
                label="健康状态"
                width="80"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                prop="intranetIP"
                label="内网IP"
                width="120"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                label="创建时间"
                prop="createTime"
                width="200"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="操作" prop="operation" minWidth="300" headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-button
                    @click="handleRowButtonClick('terminal', scope.$index, scope.row)"
                    size="mini-extral"
                    type="primary">终端</el-button>
            <el-button
                    @click="handleRowButtonClick('go-to-log-run', scope.$index, scope.row)"
                    size="mini-extral"
                    type="primary">查看运行日志</el-button>
            <el-button
                    @click="handleRowButtonClick('monitor', scope.$index, scope.row)"
                    size="mini-extral"
                    type="primary">监控</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  #instance-main {
    .section-content {
      .el-table {
        margin-bottom: 40px;
        .el-button {
          display: inline-block;
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
  import appPropUtils from '../utils/app-props';
  import MyVersionSelector from '../utils/components/version-selector';
  import ElCol from "element-ui/packages/col/src/col";

  export default {
    components: {ElCol, MyVersionSelector},

    /**
     * the sequence of create and mount in parent and child element is:
     * create parent -> create children -> mount children -> mount parent
     *
     * as this.localConfig is used in child component, as it must be set in created method
     */
    created() {
      let queryParam = this.$route.query;
      if (queryParam && queryParam.hasOwnProperty('from')) {
        if (queryParam['from'] === '/profile/service') {
          this.localConfig = this.$storeHelper.getUserConfig('profile/service');
        }
      }
    },
    mounted() {
    },
    data() {
      return {
        localConfig: null,
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
        this.currentInstanceList = [];
        if (!appInfo || !profileInfo || !serviceInfo) {
          return;
        }
//        this.$storeHelper.setUserConfig('profile/instance', {
//          appID: appInfo.appId,
//          profileID: profileInfo.id,
//          serviceID: serviceInfo.id
//        });
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

      handleButtonClick(action) {
        switch (action) {
          case 'refresh':
            let serviceInfo = this.$refs['version-selector'].getSelectedValue();
            let params = [
              serviceInfo.selectedAPP.appId,
              serviceInfo.selectedProfile.id,
              serviceInfo.selectedService.serviceVersion
            ];
            this.requestInstanceList.apply(this, params);
            break;
        }
      },

      /**
       * handle click event in operation column
       */
      handleRowButtonClick(action, index, row) {
        switch (action) {
          case 'terminal':
            let serviceInfo = this.$refs['version-selector'].getSelectedValue()['selectedService'];
            let id = null, ip = null;
            if (serviceInfo && serviceInfo.hasOwnProperty('id')) {
              id = serviceInfo.id;
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
          case 'go-to-log-run':
            let selectedValue = this.$refs['version-selector'].getSelectedValue();
            this.$storeHelper.setUserConfig('profile/instance', {
              appID: selectedValue['selectedAPP'].appId,
              profileID: selectedValue['selectedProfile'].id,
              serviceID: selectedValue['selectedService'].id,
            });
            this.$router.push({
              path: '/profile/log/run',
              query: {
                from: '/profile/instance'
              }
            });
            break;
          case 'monitor':
            break;
        }
      },
    }
  }
</script>