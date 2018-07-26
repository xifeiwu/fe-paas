<template>
  <div id="instance-main" style="flex: 1">
    <el-row class="header" type="flex" justify="center" align="middle">
      <el-col :span="20">
        <my-version-selector :customConfig="localConfig" ref="version-selector"
                             @version-selected="onVersionSelected"></my-version-selector>
      </el-col>
      <el-col :span="4">
        <el-button v-if="true"
                   size="mini-extral"
                   type="primary"
                   @click="handleButtonClick('refresh')">刷新</el-button>
        <el-button size="mini-extral"
                   type="primary"
                   v-if="!$storeHelper.notPermitted['instance_change_count']"
                   @click="handleButtonClick('manual-scale')">手动伸缩</el-button>
      </el-col>
    </el-row>
    <div class="instance-list">
      <el-table
              :data="instanceStatus.instanceList"
              style="width: 100%"
              :height="heightOfInstanceList"
              v-loading="showLoading"
              element-loading-text="加载中"
      >
        <el-table-column
                prop="instanceName"
                label="实例名称"
                min-width="200"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                prop="status"
                label="健康状态"
                width="180"
                headerAlign="center" align="center"
        >
        <template slot-scope="scope">
          <div>
            <span>{{scope.row.status ? scope.row.status : ''}}</span>
            <el-button
              round
              type="primary"
              size="mini-extral"
              :disabled="scope.row.status == '运行中'"
              class="statusButton"
              @click="handleRowButtonClick('instanceStatus',scope.$index,scope.row)"
              title=“查看详情”
            >详情</el-button>
          </div>
        </template>
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
            <div class="operation">
              <el-button
                      round
                      @click="handleRowButtonClick('terminal', scope.$index, scope.row)"
                      size="mini-extral"
                      v-if="!$storeHelper.notPermitted['open_terminal_from_instance']"
                      type="primary">终端</el-button>
              <el-button
                      round
                      @click="handleRowButtonClick('go-to-log-run', scope.$index, scope.row)"
                      size="mini-extral"
                      v-if="!$storeHelper.notPermitted['go-log-run-from-instance']"
                      type="primary">
                 <span>查看运行日志</span><i class="paas-icon-level-up"></i>
              </el-button>
              <el-button
                      round
                      @click="handleRowButtonClick('show-console-log', scope.$index, scope.row)"
                      size="mini-extral"
                      v-if="!$storeHelper.notPermitted['show-console-log']"
                      type="primary">
                <span>查看console日志</span>
              </el-button>
              <el-button
                      round
                      @click="handleRowButtonClick('monitor', scope.$index, scope.row)"
                      size="mini-extral"
                      :disabled="true"
                      v-if="!$storeHelper.notPermitted['go-monitor-from-instance']"
                      type="info">监控</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="手动伸缩" :visible="operation == 'manual-scale'"
               :close-on-click-modal="false"
               @close="operation = null"
               class="manual-scale size-500"
    >
      <el-form labelWidth="120px" size="mini">
        <el-form-item label="当前实例数：">
          <div>{{instanceStatus.instanceCount}}个</div>
        </el-form-item>
        <el-form-item label="调整实例数为：" :error="manualScale.error">
          <el-input-number v-model="manualScale.newCount" :min="1" :max="20" size="mini"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('manualScale')"
                       :loading="statusOfWaitingResponse('ok-button-in-dialog-manual-scale')">确&nbsp定</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="operation = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
    <paas-dialog-for-log :showStatus="statusForDialogInstanceLog" ref="statusForDialogInstanceLog" title="实例状态">
      <div slot="log-list">
        <div class="log-title">
          <p v-html="formatColumn('Firstseen',25) + formatColumn('Lastseen',25) + formatColumn('Type',10) + formatColumn('Reason',25) + formatColumn('Message',40)"></p>
          <p>{{'-'.repeat(120)}}</p>
        </div>
        <div v-for="(item,index) in instanceStatusList" :key="index">
          <p v-html="item" class="log pb-2"></p>
        </div>
      </div>
    </paas-dialog-for-log>

    <paas-dialog-for-log :showStatus="dialogStatusForConsoleLog" ref="dialogForConsoleLog" title="console日志">
      <div slot="log-list">
        <pre>{{consoleLogList}}</pre>
      </div>
    </paas-dialog-for-log>
  </div>
</template>

<style lang="scss">
  .el-dialog__wrapper {
    &.manual-scale {
      .el-form-item {
        &:first-child {
          margin-bottom: 5px;
        }
      }
    }
    .el-dialog {
      .log-title,
      .log {
        font-size: 12px;
        font-family: "Courier New", Courier, monospace;
        line-height: 100% !important;
      }
    }
  }
</style>
<style lang="scss" scoped>
  #instance-main {
    background: white;
    height: 100%;
    margin:0px 6px;
    max-width: 1300px;
    height: 100%;
    .el-row.header {
      padding: 3px 5px;
      font-size: 14px;
      min-height: 28px;
    }
    .instance-list {
      .el-table {
        .operation {
          .el-button {
            float: left;
            margin: 2px 4px;
            margin-left: 0;
          }
        }
      }
    }
  }
</style>

<script>
  import appPropUtils from "../utils/app-props";
  import MyVersionSelector from "../components/version-selector";
  import {
    addResizeListener,
    removeResizeListener
  } from "element-ui/src/utils/resize-event";
  import paasDialogForLog from "../components/dialog4log.vue";

  export default {
    components: { MyVersionSelector, paasDialogForLog },

    /**
     * the sequence of create and mount in parent and child element is:
     * create parent -> create children -> mount children -> mount parent
     *
     * as this.localConfig is used in child component, as it must be set in created method
     */
    created() {
      let queryParam = this.$route.query;
      if (queryParam && queryParam.hasOwnProperty('from')) {
        if (queryParam['from'] === '/service') {
          this.localConfig = this.$storeHelper.getUserConfig('profile/instance');
        }
      }
    },
    mounted() {
      // adjust element height after resize
      try {
        let header = this.$el.querySelector('.header:first-child');
        let instanceList = this.$el.querySelector('.instance-list');
        this.resizeListener = evt => {
          let height = this.$el.clientHeight;
          let heightOfHeader = header.offsetHeight;
          let heightOfContent = height - heightOfHeader;
          instanceList.style.height = heightOfContent + 'px';
          this.heightOfInstanceList = height - heightOfHeader - 20;
        };
        addResizeListener(this.$el, this.resizeListener);
      } catch (err) {}
    },
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },
    data() {
      return {
        resizeListener: () => {},
        heightOfInstanceList: '',

        localConfig: null,
        showLoading: false,
        queueForWaitingResponse: [],
        //        instanceStatus.instanceList: [{
        //          createTime: '2018-01-11 20:39:09',
        //          health: null,
        //          instanceName: 'v3-puhui-notification-3270010048-3xp1s',
        //          intranetIP:null,
        //          message:null,
        //          status:'运行中',
        //          version: 'puhui-notification:2018-01-11-20-38-12'
        //        }],
        instanceStatus: {
          instanceCount: null,
          instanceList: []
        },
        operation: null,
        manualScale: {
          newCount: null,
          error: ''
        },
        statusForDialogInstanceLog: {
          visible: false,
          full: false,
          showLoading: false
        },
        instanceStatusList: [],
        dialogStatusForConsoleLog: {
          visible: false,
          full: false,
          showLoading: false
        },
        consoleLogList: []
      };
    },
    watch: {},
    methods: {
      // helper for loading action of el-button
      addToWaitingResponseQueue(action) {
        if (this.queueForWaitingResponse.indexOf(action) === -1) {
          this.queueForWaitingResponse.push(action);
        }
      },
      statusOfWaitingResponse(action) {
        return this.queueForWaitingResponse.indexOf(action) > -1;
      },

      onVersionSelected(appInfo, profileInfo, serviceInfo) {
        //        console.log(appInfo, profileInfo, serviceInfo);
        this.instanceStatus.instanceList = [];
        if (!appInfo || !profileInfo || !serviceInfo) {
          return;
        }
        //        this.$storeHelper.setUserConfig('profile/instance', {
        //          appID: appInfo.appId,
        //          profileID: profileInfo.id,
        //          serviceID: serviceInfo.id
        //        });
        this.requestInstanceList(
          appInfo.appId,
          profileInfo.id,
          serviceInfo.serviceVersion
        );
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
        this.$net
          .getInstanceList({
            appId: appID,
            spaceId: spaceID,
            serviceVersion: version
          })
          .then(content => {
            //          console.log(content);
            if (content.hasOwnProperty('instanceList')) {
              if (Array.isArray(content['instanceList'])) {
                this.instanceStatus.instanceList = content['instanceList'];
              } else {
                this.instanceStatus.instanceList = [];
              }
            }
            if (content.hasOwnProperty('instanceNum')) {
              this.instanceStatus.instanceCount = content['instanceNum'];
            }
            this.showLoading = false;
          })
          .catch(err => {
            console.log(err);
            this.$message({
              type: 'error',
              message: '查找服务版本失败！'
            });
            this.showLoading = false;
          });
      },

      checkVersionSelector() {
        let serviceInfo = this.$refs['version-selector'].getSelectedValue();
        if (
          !serviceInfo.selectedService ||
          !serviceInfo.selectedService.hasOwnProperty('serviceVersion')
        ) {
          this.$message.error('请选择服务版本！');
          return null;
        }
        return serviceInfo;
      },

      handleButtonClick(action) {
        let serviceInfo = this.checkVersionSelector();
        if (!serviceInfo) {
          return;
        }
        switch (action) {
          case 'refresh':
            let params = [
              serviceInfo.selectedAPP.appId,
              serviceInfo.selectedProfile.id,
              serviceInfo.selectedService.serviceVersion
            ];
            this.requestInstanceList.apply(this, params);
            break;
          case 'manual-scale':
            this.manualScale.newCount = this.instanceStatus.instanceCount;
            this.operation = 'manual-scale';
            break;
        }
      },
      // 处理dialog中的事件
      handleDialogButtonClick(action) {
        let serviceInfo = this.checkVersionSelector();
        if (!serviceInfo) {
          return;
        }
        switch (action) {
          case 'manualScale':
            if (this.manualScale.newCount === this.instanceStatus.instanceCount) {
              this.$message.warning('您没有做修改');
              this.operation = null;
              return;
            }
            this.addToWaitingResponseQueue('ok-button-in-dialog-manual-scale');
            let options = {
              spaceId: serviceInfo.selectedProfile.id,
              appId: serviceInfo.selectedAPP.appId,
              id: serviceInfo.selectedService.id,
              instanceNum: this.manualScale.newCount
            };
            this.$net
              .instanceChangeCount(options)
              .then(msg => {
                this.hideWaitingResponse('ok-button-in-dialog-manual-scale');
                this.operation = null;
                // update model, show success message
                this.instanceStatus.instanceCount = this.manualScale.newCount;
                this.$message.success(msg);
              })
              .catch(msg => {
                this.hideWaitingResponse('ok-button-in-dialog-manual-scale');
                this.operation = null;
                this.$notify.error({
                  title: '修改失败！',
                  message: msg,
                  duration: 0,
                  onClose: function() {}
                });
              });
            break;
        }
      },

      /**
       * handle click event in operation column
       */
      handleRowButtonClick(action, index, row) {
        switch (action) {
          case 'terminal':
            let serviceInfo = this.$refs['version-selector'].getSelectedValue()[
              'selectedService'
            ];
            let id = null,
              ip = null;
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
              serviceID: selectedValue['selectedService'].id
            });
            this.$router.push({
              path: '/log/run',
              query: {
                from: '/instance'
              }
            });
            break;
          case 'monitor':
            break;
          case 'instanceStatus':
            this.instanceStatusList = [];
            this.statusForDialogInstanceLog.visible = true;
            let service = this.checkVersionSelector();
            var options = {};
            options.applicationId = service.selectedAPP.appId;
            options.spaceId = service.selectedProfile.id;
            options.kindName = row['instanceName'];
            const getInstanceStatusList = options => {
              if (!this.statusForDialogInstanceLog.visible) {
                return;
              }
              this.$net
                .getInstanceStatus(options)
                .then(content => {
                  this.instanceStatusList = content.map(item => {
                    return (
                      `<i style='color: aqua;'>` +
                      this.formatColumn(item.firstTimestamp, 25) +
                      this.formatColumn(item.lastTimestamp, 25) +
                      this.formatColumn(item.type, 10) +
                      this.formatColumn(item.reason, 25) +
                      '</i>' +
                      item.message
                    );
                  });
                  setTimeout(() => {
                    getInstanceStatusList(options);
                  }, 5000);
                })
                .catch(err => {
                  this.statusForDialogInstanceLog.showLoading = false;
                });
              }
              getInstanceStatusList(options);
            break;
          case 'show-console-log':
            var selectedValue = this.$refs['version-selector'].getSelectedValue();
            this.$net.getConsoleLog({
              applicationId: selectedValue['selectedAPP'].appId,
              spaceId: selectedValue['selectedProfile'].id,
              podName: row['instanceName'],
              limitLine: 350
            }).then(resData => {
              this.dialogStatusForConsoleLog.visible = true;
              this.consoleLogList = resData;
            })
            break;
          }
        },
      formatColumn(text, width) {
        let space = '#'.repeat(width);
        return (text + space).slice(0, width).replace(/\#/g, '&nbsp;');
      }
    }
  };
</script>
