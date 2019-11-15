<template>
  <div id="log-deploy">
    <div class="header">
      <paas-version-selector style="display: inline-block"
                             :customConfig="config4VersionSelector"
                             ref="version-selector"
                             @version-selected="onVersionSelected"></paas-version-selector>
      <el-button
              style="display: inline-block"
              size="mini"
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
              :height="heightOfTable"
      >
        <el-table-column
                prop="createTime"
                label="部署时间"
                headerAlign="center" align="center" width="160"
        >
        </el-table-column>
        <el-table-column
                prop="deployUserName"
                label="部署人员"
                headerAlign="center" align="center" width="100"
        >
        </el-table-column>
        <el-table-column
                prop="fullImage"
                label="部署镜像"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <span>{{scope.row.fullImage}}</span><span class="image-status" :style="scope.row.imageStatus.style">{{scope.row.imageStatus.imageStatus}}</span>
          </template>
        </el-table-column>
        <el-table-column
                prop="deployTypeDesc"
                label="部署类型"
                headerAlign="center" align="center" width="120"
        >
        </el-table-column>
        <el-table-column
                label="操作" width="220">
          <template slot-scope="scope">
            <el-button
                    type="text"
                    class="primary"
                    :loading="statusOfWaitingResponse('show-log') && operation.row.id == scope.row.id"
                    @click="handleTRButton($event, 'show-log', scope.$index, scope.row)">查看日志</el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', isEnable('time-analyze', scope.row) ? 'primary':'disabled']"
                    @click="handleTRButton($event, 'time-analyze', scope.$index, scope.row)">
              <span>部署时间分析</span><i class="paas-icon-popover" style="margin-left: 2px;"></i>
            </el-button>
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
    <paas-dialog-for-log :showStatus="dialogForLogStatus" ref="dialogForDeployLog">
      <div slot="content" v-for="(item, index) in deployLogs" :key="index" class="log-item" v-html="item">{{item}}</div>
    </paas-dialog-for-log>
  </div>
</template>
<style lang="scss" scoped>
  #log-deploy {
    height: calc(100% - 30px);
    display: flex;
    flex-direction: column;
    .header {
      padding: 5px;
    }
    .list {
      flex: 1;
      position: relative;
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
        color: #eee;
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
          if (this.$utils.hasProps(logDeployConfig, 'appId', 'profileId')) {
            this.config4VersionSelector = {
              appId: logDeployConfig['appId'],
              profileId: logDeployConfig['profileId'],
            };
            if (logDeployConfig.hasOwnProperty('serviceId')) {
              this.config4VersionSelector['serviceId'] = logDeployConfig['serviceId'];
            } else if (logDeployConfig.hasOwnProperty('serviceVersion')) {
              this.config4VersionSelector['serviceVersion'] = logDeployConfig['serviceVersion'];
            }
          }
        }
      }
//      console.log('this.config4VersionSelector');
//      console.log(this.config4VersionSelector);
    },
    mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
    },
    data() {
      return {
        // service config in localStorage
        config4VersionSelector: null,

        showLoading: false,
        deployLogList: [],
        operation: {
          row: null,
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
        heightOfTable: '',
      }
    },
    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          return;
        }
        try {
          // if this.showAppList == false, headerNode will not exist
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
        } catch(err) {
        }
      },

      onVersionSelected(appInfo, profileInfo, serviceInfo) {
        this.deployLogList = [];
        this.deployLogListByPage = [];
        if (!appInfo || !profileInfo) {
          return;
        }
        const serviceId = serviceInfo ? serviceInfo.id : '';
//        const serviceVersion = serviceInfo ? serviceInfo.serviceVersion : '';
        // save to localStorage after selected change
        this.$store.dispatch('user/config', {
          page: 'log/deploy',
          data: {
            appId: appInfo.appId,
            profileId: profileInfo.id,
            serviceId: serviceId
          }
        });
        this.requestDeployLogList();
      },

      requestDeployLogList(appId, profileId, serviceVersion) {
        const {selectedAPP, selectedProfile, selectedService} = this.$refs['version-selector'].getSelectedValue();
        if (!selectedAPP || !selectedProfile || !selectedService) {
          return;
        }
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;

        this.$net.requestPaasServer(this.$net.URL_LIST.log_deploy_list, {
          payload: {
            start, length,
            appId: selectedAPP.appId,
            spaceId: selectedProfile.id,
            // serviceVersion: selectedService.serviceVersion
          }
        }).then(resContent => {
          this.totalSize = resContent['total'];
          const deployLogList = resContent['deployLogList'];
          deployLogList.forEach(it => {
            it.createTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
            ['fullImage', 'deployTypeDesc'].forEach(prop => {
              if (!it[prop]) {
                it[prop] = '---';
              }
            });
            if (!it['imageStatus']) {
              it['imageStatus'] = {
                imageStatus: '---',
                style: {
                }
              }
            } else {
              const color = it['imageStatus']['color'];
              it['imageStatus']['style'] = {
                color: `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`,
                border: `1px solid rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`,
                padding: '1px 2px',
                marginLeft: '3px',
                borderRadius: '6px',
                fontSize: '12px',
                lineHeight: '100%',
                display: 'inline-block'
              };
            }
          });
          this.deployLogList = deployLogList;
          this.deployLogListByPage = this.deployLogList;
//          this.getDeployLogListByPage();
        }).catch(err => {
          console.log(err);
        });
      },

      // TODO: not used
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
        this.requestDeployLogList();
//        this.getDeployLogListByPage();
      },

      async serviceDeploy(payload) {
        // request and show log
        const filterReg = /^ *\[( *(?:INFO|WARNING|ERROR) *)\](.*)$/;
        const parseDeployLog = (logs) => {
          var logObjList = logs ? logs.split('\n').filter(it => {
            return it;
          }).map(it => {
            var logObj = {
              LOG: '',
              TYPE: 'DEFAULT'
            };
            try {
              var parsedLog = JSON.parse(it);
              if (this.$utils.isObject(parsedLog) && parsedLog.hasOwnProperty('TYPE') && parsedLog.hasOwnProperty('LOG')) {
                logObj = parsedLog;
              } else {
                throw new Error('格式不正确');
              }
            } catch (err) {
              logObj['LOG'] = it;
            }
            return logObj;
          }) : [];

          logObjList.forEach(it => {
            // replace white-space with &nbsp
            it['LOG'] = it['LOG'].replace(/^( *)(.*)$/, (match, p1, p2) => {
              return '&nbsp;'.repeat(p1.length) + p2;
            }).replace(filterReg, (match, p1, p2, offset, string) => {
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
            })
          });
          return logObjList;
        };

        // recursive function to fetch log from server with options {logName, logPath, offset}
        const getDeployLog = async (options) => {
          // stop request deploy log when the window is closed
          if (!this.dialogForLogStatus.visible) {
            return Promise.reject('弹框关闭');
          }
          const resContent = await this.$net.serviceGetDeployLog(options);
          if (resContent.hasOwnProperty('Orchestration')) {
            const orchestration = resContent['Orchestration'];
            orchestration.logList = parseDeployLog(orchestration.log);
            return orchestration;
          } else {
            throw new Error('格式不正确');
          }
        };

        // mock resContent of serviceDeploy
        const resContent = {
          orchestration: {
            logName: payload.logName,
            logPath: payload.logPath,
            moreData: true
          }
        };

        if (resContent.hasOwnProperty('orchestration')) {
          this.deployLogs = [];
          this.dialogForLogStatus.visible = true;
          this.dialogForLogStatus.showLoading = true;
          var orchestration = resContent['orchestration'];
          var moreData = orchestration && orchestration['moreData'];

          var deployLogQueue = [];
          var preItem = null, nextItem = null;
          var tagUpdateDeployLog = null;
          // logType === history: jump all download-record; small time-interval
          if (payload.logType === 'history') {
            tagUpdateDeployLog = setInterval(() => {
              if (!moreData && deployLogQueue.length === 0) {
                clearInterval(tagUpdateDeployLog);
                return;
              }
              while (deployLogQueue.length > 0) {
                nextItem = deployLogQueue.shift();
                if (!nextItem) {
                  return;
                }
                if (nextItem['TYPE'] === 'DOWNLOAD' && preItem['TYPE'] === 'DOWNLOAD') {
                } else {
                  this.deployLogs.push(nextItem['LOG']);
                }
                preItem = nextItem;
                // scroll after render finish
                this.$nextTick(() => {
                  if (this.$refs.hasOwnProperty('dialogForDeployLog')) {
                    const dialogForDeployLog = this.$refs['dialogForDeployLog'];
                    dialogForDeployLog.isScrolledBottom && dialogForDeployLog.scrollToBottom();
                  }
                });
              }
            }, 10);
          } else {
            tagUpdateDeployLog = setInterval(() => {
              if (!moreData && deployLogQueue.length === 0) {
                clearInterval(tagUpdateDeployLog);
                return;
              }
              nextItem = deployLogQueue.shift();
              if (!nextItem) {
                return;
              }
              if (nextItem['TYPE'] === 'DOWNLOAD' && preItem['TYPE'] === 'DOWNLOAD') {
                this.deployLogs.pop();
                this.deployLogs.push(nextItem['LOG']);
              } else {
                this.deployLogs.push(nextItem['LOG']);
              }
              preItem = nextItem;
              // scroll after render finish
              this.$nextTick(() => {
                if (this.$refs.hasOwnProperty('dialogForDeployLog')) {
                  const dialogForDeployLog = this.$refs['dialogForDeployLog'];
                  dialogForDeployLog.isScrolledBottom && dialogForDeployLog.scrollToBottom();
                }
              });
            }, 5);
          }

          while (moreData) {
            orchestration = await getDeployLog({
              logName: orchestration.logName,
              logPath: orchestration.logPath,
              offset: null == orchestration.offset ? 0 : orchestration.offset,
              // 正在部署中的日志
              logType: payload.logType
            });
//          console.log(orchestration);
            if (orchestration && orchestration.hasOwnProperty('logList')) {
              // stop showLoading when orchestration.log is not null
              this.dialogForLogStatus.showLoading = false;
              deployLogQueue = deployLogQueue.concat(orchestration['logList']);
            }
            moreData = orchestration && orchestration['moreData'];
            await new Promise((resolve) => {
              setTimeout(resolve, 1500);
            });
          }
          return Promise.reject('已拉取所有日志');
        } else {
          return Promise.reject({
            title: '数据格式错误',
            message: '未找到orchestration'
          })
        }
      },

      handleButtonClick(evt, action) {
        switch (action) {
          case 'refresh':
            this.currentPage = 1;
            this.requestDeployLogList();
            break;
        }
      },


      isEnable(action, row) {
        var enable = false;
        switch (action) {
          case 'time-analyze':
            try {
              const logDetail = JSON.parse(row['logDetail']);
              if (!logDetail) {
                break;
              }
              const keyMap = {
                'git': '代码下载',
                'maven': 'Maven打包',
                'docker': '镜像制作',
                'harbor': '镜像发布',
                'k8s': 'k8s编排'
              };
              enable = ['git', 'maven', 'docker', 'harbor', 'k8s'].filter(it => {
                return logDetail.hasOwnProperty(it);
              }).map(it => {
                var timeUsed = this.$utils.formatMilliSeconds(parseInt(logDetail[it]));
                return `<div><div style="display: inline-block; width: 80px; text-align: right">${keyMap[it]}：</div><div style="display: inline-block">${timeUsed}</div></div>`;
              }).join('');
            } catch(err) {
              console.log(err);
            }
            break;
          case 'related-image':
            enable = row['fullImage']
            break;
          default:
            break;
        }
        return enable;
      },

      async handleTRButton(evt, action, index, row) {
        var enable = '';
        switch (action) {
          case 'show-log':
            let logPath = row.logPath;
            let logName = row.logName;
            let offset = 0;
            if (!logPath || !logName) {
              this.$message.error('该次部署失败，没有部署日志');
              return;
            }
            this.operation.row = row;

            this.addToWaitingResponseQueue(action);
            try {
              await this.serviceDeploy({
                logPath : logPath,
                logName : logName,
                offset : offset,
                // 历史部署日志
                logType: 'history'
              }, action);
            } catch (err) {
              console.log(err);
              this.hideWaitingResponse(action);
            }
            break;
          case 'time-analyze':
            enable = this.isEnable(action, row);
            if (enable) {
              this.$storeHelper.globalPopover.show({
                ref: evt.target,
                type: 'html',
                msg: enable
              });
            } else {
              this.$storeHelper.globalPopover.show({
                ref: evt.target,
                msg: '没有相关信息'
              });
            }
            break;
          case 'related-image':
            enable = this.isEnable(action, row);
            console.log(enable);
            break;
        }
      },

    }
  }
</script>