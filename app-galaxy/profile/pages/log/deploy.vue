<template>
  <div id="log-deploy">
    <div class="header">
      <paas-version-selector style="display: inline-block"
                             :customConfig="config4VersionSelector"
                             ref="version-selector"
                             @version-selected="onVersionSelected"></paas-version-selector>
      <el-button
              style="display: inline-block"
              size="mini-extral"
              :type="'primary'"
              @click="handleButtonClick($event, 'refresh')">
        刷新
      </el-button>
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
                    :loading="statusOfWaitingResponse('show-log') && operation.rowID == scope.row.id"
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
    <paas-dialog-for-log :showStatus="dialogForLogStatus" ref="dialogForStatus">
      <div slot="content" v-for="(item, index) in deployLogs" :key="index" class="log-item" v-html="item">{{item}}</div>
    </paas-dialog-for-log>
  </div>
</template>
<style lang="scss" scoped>
  #log-deploy {
    .header {
      padding: 5px;
    }
    .list {
      .el-table {
      }
    }
  }
</style>
<style lang="scss">
  #log-deploy {
    .dialog-for-log {
      .el-dialog {
        width: 95%;
      }
      .log-item {
        /*white-space: pre;*/
        max-width: 100%;
        word-wrap: break-word;
        word-break: break-all;
        line-height: 1.4;
      }
      .info {
        color: #409EFF;
        font-weight: bold;
      }
      .warning {
        color: #E6A23C;
        font-weight: bold;
      }
      .error {
        color: #F56C6C;
        font-weight: bold;
      }
      .success {
        color: #67C23A;
        font-weight: bold;
      }
    }
  }
</style>
<script>
  import paasVersionSelector from '../components/version-selector';
  import paasDialogForLog from '../components/dialog4log.vue';
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    mixins: [commonUtils],
    components: {paasVersionSelector, paasDialogForLog},
    created() {
      // set default service
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer['from'];
        const data = dataTransfer['data'];
        switch (from) {
          case this.$net.page['profile/service']:
            this.config4VersionSelector = {
              appId: data['appId'],
              profileId: data['profileId'],
              serviceId: data['serviceId'],
            };
            break;
          case this.$net.page['profile/work-order/list']:
            this.config4VersionSelector = {
              appId: data['appId'],
              profileId: data['profileId'],
              serviceVersion: data['serviceVersion'],
            };
            break;
        }
        // save to localStorage after selected change
        if (this.config4VersionSelector) {
          this.$store.dispatch('user/config', {
            page: 'log/deploy',
            data: this.config4VersionSelector
          });
        }
        this.$storeHelper.dataTransfer = null;
      } else {
        // get config from localStorage
        const userConfig = this.$store.getters['user/config'];
        if (userConfig.hasOwnProperty('log/deploy')) {
          const logDeployConfig = userConfig['log/deploy'];
          if (this.$utils.hasProps(logDeployConfig, 'appId', 'profileId', 'serviceId')) {
            this.config4VersionSelector = {
              appId: logDeployConfig['appId'],
              profileId: logDeployConfig['profileId'],
              serviceId: logDeployConfig['serviceId'],
            }
          } else if (this.$utils.hasProps(logDeployConfig, 'appId', 'profileId', 'serviceVersion')) {
            this.config4VersionSelector = {
              appId: logDeployConfig['appId'],
              profileId: logDeployConfig['profileId'],
              serviceVersion: logDeployConfig['serviceVersion'],
            }
          }
        }
      }
//      console.log('this.config4VersionSelector');
//      console.log(this.config4VersionSelector);
    },
    data() {
      return {
        // service config in localStorage
        config4VersionSelector: null,

        showLoading: false,
        deployLogList: [],
        operation: {
          appID: 0
        },

        dialogForLogStatus: {
          showLoading: false,
          visible: false,
          full: false,
          iconExpand: true,
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
        // save to localStorage after selected change
        this.$store.dispatch('user/config', {
          page: 'log/deploy',
          data: {
            appId: appInfo.appId,
            profileId: profileInfo.id,
            serviceId: serviceInfo.id
          }
        });

        this.requestDeployLogList(appInfo.appId, profileInfo.id, serviceInfo.serviceVersion);
      },

      handleButtonClick(evt, action) {
        switch (action) {
          case 'refresh':
            try {
              const {selectedAPP, selectedProfile, selectedService} = this.$refs['version-selector'].getSelectedValue();
              if (!selectedAPP || !selectedProfile || !selectedService) {
                return;
              }
              this.requestDeployLogList(selectedAPP.appId, selectedProfile.id, selectedService.serviceVersion);
            } catch(err) {
              console.log(err);
            }
            break;
        }
      },

      requestDeployLogList(appId, profileId, serviceVersion) {
        this.$net.requestPaasServer(this.$net.URL_LIST.log_deploy_list, {
          payload: {
            appId,
            spaceId: profileId,
            serviceVersion: serviceVersion
          }
        }).then(resContent => {
          this.totalSize = resContent['total'];
          const deployLogList = resContent['deployLogList'];
          deployLogList.forEach(it => {
            it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
          });
          this.deployLogList = deployLogList;
          this.getDeployLogListByPage();
        }).catch(err => {
          console.log(err);
        });

      },
      handleOperationClick(action, index, row) {
        switch (action) {
          case 'show-log':
            let logPath = row.logPath;
            let logName = row.logName;
            let offset = 0;
            if (!logPath || !logName) {
              this.$message.error('该次部署失败，没有部署日志');
              return;
            }
            this.operation.rowID = row.id;
            this.addToWaitingResponseQueue(action);

            ((options) => {
              this.deployLogs = [];
              this.dialogForLogStatus.visible = true;
              this.hideWaitingResponse('show-log');
              const filterReg = /^ *\[( *(?:INFO|WARNING|ERROR) *)\](.*)$/;
              // recursive function to fetch log from server with options {logName, logPath, offset}
              function getDeployLog(options) {
                // stop request deploy log when the window is closed
                if (!this.dialogForLogStatus.visible) {
                  return;
                }
                this.dialogForLogStatus.showLoading = true;
                this.$net.serviceGetDeployLog(options).then(content => {
                  if (content.hasOwnProperty('Orchestration')) {
                    let Orchestration = content.Orchestration;
                    let logs = Orchestration.log;
  //                  console.log(log);
  //                  console.log(content);
  //                  console.log(Orchestration.offset);
                    if (logs) {
                      let logList = logs.split('\n').filter(it => {
                        return it;
                      }).map(it => {
                        return it.replace(filterReg, (match, p1, p2, offset, string) => {
                          // console.log(match, p1, offset, string);
                          p2 = p2.replace(/(BUILD )*SUCCESS/g, (match, p1, offset, string) => {
                            return `<span class="success">${match}</span>`;
                          });
                          p2 = p2.replace(/BUILD FAILURE/g, (match, p1, offset, string) => {
                            return `<span class="error">${match}</span>`;
                          });
                          let result = '';
                          switch (p1.toUpperCase()) {
                            case 'INFO':
                              result = `[<span class="info">${p1}</span>]${p2}`;
                              break;
                            case 'WARNING':
                              result = `[<span class="warning">${p1}</span>]${p2}`;
                              break;
                            case 'ERROR':
                              result = `[<span class="error">${p1}</span>]<span class="error">${p2}</span>`;
                              break;
                          }
                          return result;
                        });
                      });
                      // scroll after render finish
                      this.deployLogs = this.deployLogs.concat(logList);
                      this.$nextTick(() => {
                        this.$refs.hasOwnProperty('dialogForDeployLog') &&
                        this.$refs['dialogForDeployLog'].scrollToBottom();
                      });
                    }
                    options.offset = Orchestration.offset;
                    if (Orchestration.moreData) {
                      setTimeout(() => {
                        getDeployLog.call(this, options);
                      }, 2000);
                    }
                  }
                }).catch(err => {
                  console.log(err);
                }).finally(() => {
                  this.dialogForLogStatus.showLoading = false;
                });
              }

              getDeployLog.call(this, options);
            })({
              logPath : logPath,
              logName : logName,
              offset : offset,
              // 历史部署日志
              logType: 'history'
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