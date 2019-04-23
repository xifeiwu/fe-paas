<template>
  <div id="instance-main">
    <el-row class="header" type="flex" justify="center" align="middle">
      <el-col :span="14">
        <paas-version-selector :customConfig="config4VersionSelector" ref="version-selector"
                             @version-selected="onVersionSelected"></paas-version-selector>
      </el-col>
      <el-col :span="6">
          <span>运行实例数/总实例数：{{serviceRunningInfo === null ? "0 / 0" : serviceRunningInfo["status"] == null ? '0 / 0' : serviceRunningInfo["status"]["Running"] + " / " +serviceRunningInfo["status"]["Total"]}}</span>
      </el-col>
      <el-col :span="4">
        <el-button v-if="true"
                   size="mini-extral"
                   type="primary"
                   @click="handleButtonClick($event, 'refresh')">刷新</el-button>
        <el-button size="mini-extral"
                   type="primary"
                   :class="{'disabled': $storeHelper.permission['instance_change_count'].disabled || publishStatus}"
                   @click="handleButtonClick($event, 'instance_change_count')">手动伸缩</el-button>
      </el-col>
    </el-row>
    <div class="instance-list"
         v-clickoutside="handleClickOutsideOfInstanceList">
      <el-table
              :data="instanceStatus.instanceList"
              style="width: 100%"
              :height="heightOfInstanceList"
              element-loading-text="加载中"
              @sort-change="onSortChangeInTable"
              :defaultSort="tableSort"
      >
        <el-table-column
                prop="id"
                label="实例名称"
                width="200"
                headerAlign="left" align="left">
        </el-table-column>
        <el-table-column
                prop="nodeName"
                label="运行节点"
                width="170"
                headerAlign="left" align="left">
          <template slot-scope="scope">
            <span
                    :class="['running-node', isProductionProfile ? 'production': 'un-production']"
                    @click="handleRowButtonClick($event, 'show_eagleeye', scope.$index, scope.row)"
            >{{scope.row.nodeName}}</span>
          </template>
        </el-table-column>
        <el-table-column
                prop="status"
                label="健康状态"
                width="120"
                headerAlign="center" align="center"
        >
        <template slot-scope="scope">
          <div>
            <span>{{scope.row.status ? scope.row.status : ''}}</span>
            <span :style="{border: !isMesosService ? '1px solid #409EFF' : '1px solid #b4bccc', color: !isMesosService ? '#409EFF':'#b4bccc',
             'font-size': '12px', cursor: 'pointer', padding: '1px','border-radius': '4px'}"
                  @click="handleRowButtonClick($event, 'instanceStatus',scope.$index,scope.row)"
            >详情</span>
          </div>
        </template>
        </el-table-column>
        <el-table-column
                prop="intranetIP"
                label="内网IP"
                width="90"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
              label="使用内存/总内存"
              prop="memoryStatus"
              width="160"
              sortable="custom"
              headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                prop="cpuUsageInPercent"
                label="CPU使用率"
                width="120"
                sortable="custom"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                label="创建时间"
                prop="formattedCreateTime"
                width="90"
                headerAlign="center" align="center">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column
                label="k8s重启时间"
                prop="formattedStartTime"
                width="100"
                headerAlign="center" align="center"
                v-if="!isMesosService">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedStartTime)">
              <div v-for="(item, index) in scope.row.formattedStartTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedStartTime}}</div>
          </template>
        </el-table-column>
        <el-table-column
                prop="restartCount"
                label="K8s重启次数"
                width="100"
                headerAlign="center" align="center"
                v-if="!isMesosService">
        </el-table-column>
        <el-table-column label="操作" prop="operation" headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-button
                    type="text"
                    v-if="true"
                    :class="['flex', $storeHelper.permission['instance_replace'].disabled || isMesosService ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'instance_replace', scope.$index, scope.row)"
                    >
              <span>驱逐</span>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="[isMesosService ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'show-console-log', scope.$index, scope.row)"
            >
              <span>console日志</span>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['go-to-page-terminal-from-instance'].disabled || isMesosService ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'go-to-page-terminal-from-instance', scope.$index, scope.row)"
                    >终端</el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['go-to-page-terminal-from-instance'].disabled || isMesosService ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'go-to-page-instance-terminal-from-instance', scope.$index, scope.row)"
            ><span class="new-terminal"><span>新终端</span><span class="beta">(beta)</span></span></el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['go-to-log-run-from-instance'].disabled ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'go-to-log-run-from-instance', scope.$index, scope.row)">
              <span>查看运行日志</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['go-to-page-monitor-from-instance'].disabled || isMesosService ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'go-to-page-monitor-from-instance', scope.$index, scope.row)">
              <span>监控</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider" v-if="false"></div>
            <el-button v-if="false"
                    @click="handleRowButtonClick($event, 'more', scope.$index, scope.row)"
                    type="text" class="more"><span>实例详情</span><i :class="[statusForPop.visible ? 'paas-icon-fa-caret-left':'paas-icon-fa-caret-right']"></i></el-button>
          </template>
        </el-table-column>
      </el-table>
      <paas-pop-in-container :title="titleForPop" :status="statusForPop">
        <div slot="content">
          detail
        </div>
      </paas-pop-in-container>
    </div>

    <el-dialog title="手动伸缩" :visible="action.name == 'instance_change_count'"
               :close-on-click-modal="false"
               @close="action.name = null"
               class="manual-scale size-500"
    >
      <el-form labelWidth="120px" size="mini">
        <el-form-item label="当前实例数：">
          <div>{{instanceStatus.instanceCount}}个</div>
        </el-form-item>
        <el-form-item label="调整实例数为：" :error="manualScale.error">
          <el-input-number v-model="manualScale.newCount" :min="1" size="mini"></el-input-number>
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
            <el-button @click="action.name = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
    <paas-dialog-for-log :showStatus="statusForDialogInstanceLog" @refresh='updateInstanceStatusList(false)'
                         class="dialog-instance-log" title="实例状态" @close="handleDialogButtonClick('close-dialog-for-instance-log')">
      <div slot="content">
        <div class="log-title">
          <p v-html="formatColumn('Firstseen',25) + formatColumn('Lastseen',25) + formatColumn('Type',10) + formatColumn('Reason',25) + formatColumn('Message',40)"></p>
          <p>{{'-'.repeat(120)}}</p>
        </div>
        <div v-for="(item,index) in instanceStatusList" :key="index">
          <p v-html="item" class="log pb-2"></p>
        </div>
      </div>
    </paas-dialog-for-log>

    <paas-dialog-for-log :showStatus="dialogStatusForConsoleLog"  @refresh='updateConsoleLog(false)'
                         class="dialog-console-log"
                         ref="dialogForConsoleLog" title="console日志">
      <div slot="content">
        <div v-for="(item, index) in consoleLogList" :key="index" class="log-item">{{item}}</div>
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
    &.dialog-for-log {
      &.dialog-instance-log {
        .el-dialog {
          width: 95% !important;
        }
        .log-title,
        .log {
          color: white;
          font-size: 14px;
          font-family: "Courier New", Courier, monospace;
          line-height: 100%;
        }
      }
      &.dialog-console-log {
        .el-dialog {
          width: 95% !important;
        }
        .log-item {
          max-width: 100%;
          word-wrap: break-word;
          word-break: break-all;
          line-height: 1.4;
          color: #eee;
        }
      }
    }
  }
  /*.spa .el-button.el-button--text:hover*/
  #instance-main {
    .el-button {
      &.el-button--text {
        &:hover {
          color: #ffd400;
          font-weight: normal;
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #instance-main {
    background: white;
    height: 100%;
    /*margin:0px 6px;*/
    max-width: 1500px;
    height: 100%;
    .el-row.header {
      padding: 3px 5px;
      font-size: 14px;
      min-height: 28px;
    }
    .instance-list {
      position: relative;
      .running-node {
        &.production {
          color: #409EFF;
          cursor: pointer;
        }
      }

      .new-terminal {
        position: relative;
      }
      .beta {
        display: inline-block;
        color: #EF9C69;
        font-size: 12px;
        line-height: 12px;
        border-radius: 4px;
        word-break: normal;
        &:hover {
          color: red;
        }
      }
      .pop-in-container {
      }
      .el-table {
      }
    }
  }
</style>

<script>
  import appPropUtils from "../utils/app-props";
  import PaasVersionSelector from "../components/version-selector";
  import bytes from 'bytes';
  import PaasPopInContainer from 'assets/components/pop-in-container';
  import Clickoutside from 'element-ui/src/utils/clickoutside';
  import {
    addResizeListener,
    removeResizeListener
  } from "element-ui/src/utils/resize-event";
  import paasDialogForLog from "../components/dialog4log.vue";
  import commonUtils from 'assets/components/mixins/common-utils';

  export default {
    directives: { Clickoutside },
    mixins: [commonUtils],
    components: { PaasVersionSelector, paasDialogForLog, PaasPopInContainer },

    /**
     * the sequence of create and mount in parent and child element is:
     * create parent -> create children -> mount children -> mount parent
     *
     * as this.config4VersionSelector is used in child component, as it must be set in created method
     */
    created() {
      this.bytes = bytes;
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer['from'];
        const data = dataTransfer['data'];
        this.config4VersionSelector = {
          appId: data['appId'],
          profileId: data['profileId'],
          serviceId: data['serviceId']
        };
        this.$storeHelper.dataTransfer = null;
        this.$store.dispatch('user/config', {
          page: 'instance',
          data
        });
      } else {
        // get config from localStorage
        const userConfig = this.$store.getters['user/config'];
        if (userConfig.hasOwnProperty('instance')) {
          const instanceConfig = userConfig['instance'];
          if (this.$utils.hasProps(instanceConfig, 'appId', 'profileId', 'serviceId')) {
            this.config4VersionSelector = {
              appId: instanceConfig['appId'],
              profileId: instanceConfig['profileId'],
              serviceId: instanceConfig['serviceId'],
              showInstance: true
            }
          }
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
    computed: {
      isProductionProfile() {
        return this.$storeHelper.isProductionProfile(this.profileInfo.id);
      },
      publishStatus() {
        return this.$store.getters['publishStatus'];
      }
    },
    data() {
      return {
        resizeListener: () => {},
        heightOfInstanceList: '',

        profileInfo: null,
        config4VersionSelector: null,
        queueForWaitingResponse: [],
        //        instanceStatus.instanceList: [{
        //          createTime: '2018-01-11 20:39:09',
        //          health: null,
        //          id: 'v3-puhui-notification-3270010048-3xp1s',
        //          intranetIP:null,
        //          message:null,
        //          status:'运行中',
        //          version: 'puhui-notification:2018-01-11-20-38-12'
        //        }],
        instanceStatus: {
          instanceCount: null,
          instanceList: []
        },
        titleForPop: '',
        statusForPop: {
          visible: false,
        },

        action: {
          name: null,
          row: null
        },
        manualScale: {
          newCount: null,
          error: ''
        },
        statusForDialogInstanceLog: {
          visible: false,
          full: false,
          showLoading: false,
          iconRefresh: true,
          iconExpand: true,
        },
        instanceStatusList: [],
        dialogStatusForConsoleLog: {
          visible: false,
          full: false,
          showLoading: false,
          iconRefresh: true,
          iconExpand: true
        },
        consoleLogList: [],

        isMesosService: false,

        tableSort: {
          prop: 'cpuUsageInPercent',
          order: 'descending',
        },

        serviceRunningInfo: null
      };
    },
    watch: {},
    methods: {
      // TODO: 获取实例数有没有必要请求整个服务运行相关的所有信息
      // 获取服务的当前运行信息（用于展示：当前实例数/总实例数）
      async requestServiceRunningInfo(appId, profileId) {
        if (!appId || !profileId) {
          console.log('appId or profileId can not be empty');
          return;
        }
        let payload = {
          appId: appId,
          spaceId: profileId
        };
        this.$net.requestPaasServer(this.$net.URL_LIST.service_info_running, {payload}).then(resContent => {
          this.serviceRunningInfo = null
          if (resContent.hasOwnProperty("applicationConfigDeployment")) {
            this.serviceRunningInfo = resContent["applicationConfigDeployment"];
          }
          if (this.serviceRunningInfo) {
            this.instanceStatus.instanceCount = this.serviceRunningInfo["status"]["Total"];
          } else {
            this.instanceStatus.instanceCount = 0;
          }
        }).catch(err => {
          console.log(err)
        });
      },
      onVersionSelected(appInfo, profileInfo, serviceInfo) {
//        console.log(appInfo, profileInfo, serviceInfo);
        // 获取服务运行时信息
        this.requestServiceRunningInfo(appInfo.appId, profileInfo.id);
        this.hidePop();
        this.instanceStatus.instanceList = [];
        if (!appInfo || !profileInfo || !serviceInfo) {
          return;
        }
        this.profileInfo = profileInfo;
        // save to localStorage after selected change
        this.$store.dispatch('user/config', {
          page: 'instance',
          data: {
            appId: appInfo.appId,
            profileId: profileInfo.id,
            serviceId: serviceInfo.id
          }
        });
        // 是否mesos服务
        this.isMesosService = serviceInfo.hasOwnProperty('k8s') && serviceInfo['k8s'] !== 1;
        this.requestInstanceList(
          appInfo.appId,
          profileInfo.id,
          // serviceInfo.serviceVersion
        );
      },
      /**
       * 获取实例列表
       */
      async requestInstanceList(appID, spaceID, version) {
        if (!appID || !spaceID) {
          console.log('appID or spaceID can not be empty');
          return;
        }
        try {
          this.instanceStatus.instanceList = [];
          const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.instance_list, {
            payload: {
              appId: appID,
              spaceId: spaceID,
              // serviceVersion: version,
            }
          });
//          console.log(resContent);
          if (!resContent.hasOwnProperty('instanceList')) {
            return;
          }

          const instanceList = resContent.instanceList;
          instanceList.forEach(it => {
            it.name = it.id;
            it['formattedCreateTime'] = this.$utils.formatDate(it['createTime'], 'yyyy-MM-dd hh:mm:ss').split(' ');
            it['formattedStartTime'] = this.$utils.formatDate(it['startTime'], 'yyyy-MM-dd hh:mm:ss').split(' ');
            it.cpuUsageInPercent = it['cpuUsage'] ? `${parseFloat(it['cpuUsage'] * 100).toFixed(2)}%` : '---';
            this.$utils.renameProperty(it, 'state', 'status');
            this.$utils.renameProperty(it, 'ip', 'intranetIP');

            it.memoryStatus = '---';
            if (it['memoryUsageBytes'] && it['actualMemory']) {
              it.memoryStatus = bytes(parseInt(it['memoryUsageBytes'])) + ' / ' + bytes(parseInt(it['actualMemory']));
            }
            it.cpuUsageSecondsSum = it.cpuUsageSecondsSum ? `${parseFloat(it['cpuUsageSecondsSum']).toFixed(2)}s` : '---'
          });
          this.instanceStatus.instanceList = instanceList;
          if (resContent.hasOwnProperty('instanceNum')) {
            this.instanceStatus.instanceCount = resContent['instanceNum'];
          }
          // sort table by this.tableSort after success request
          this.onSortChangeInTable(this.tableSort);
//          console.log(this.instanceStatus);
        } catch(err) {
          console.log(err);
        }
      },

      /**
       * if version is selected.
       * return selected service if version is selected
       */
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

      handleButtonClick(evt, action) {
        if (action == 'instance_change_count' && this.publishStatus) {
          this.$storeHelper.popoverWhenPublish(evt.target);
          return;
        }
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        this.hidePop();
        let serviceInfo = this.checkVersionSelector();
        if (!serviceInfo) {
          return;
        }
        switch (action) {
          case 'refresh':
            const params = [
              serviceInfo.selectedAPP.appId,
              serviceInfo.selectedProfile.id,
              serviceInfo.selectedService.serviceVersion
            ];
            this.requestServiceRunningInfo(serviceInfo.selectedAPP.appId, serviceInfo.selectedProfile.id);
            this.requestInstanceList.apply(this, params);
            break;
          case 'instance_change_count':
            this.manualScale.newCount = this.instanceStatus.instanceCount;
            this.action.name = action;
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
              this.action.name = null;
              return;
            }
            this.addToWaitingResponseQueue('ok-button-in-dialog-manual-scale');
            let payload = {
              spaceId: serviceInfo.selectedProfile.id,
              appId: serviceInfo.selectedAPP.appId,
              id: serviceInfo.selectedService.id,
              instanceNum: this.manualScale.newCount
            };
            this.$net.requestPaasServer(this.$net.URL_LIST.instance_change_count, {
              payload
            }).then(msg => {
              this.instanceStatus.instanceCount = this.manualScale.newCount;
              this.$message.success('扩容缩容操作成功，请过几十秒后刷新查看实例运行情况');
            })
            .catch(msg => {
            }).finally(() => {
              this.hideWaitingResponse('ok-button-in-dialog-manual-scale');
              this.action.name = null;
//              setTimeout(() => {
//                this.handleButtonClick($event, 'refresh');
//              }, 5000);
            });
            break;
          case 'close-dialog-for-instance-log':
            this.$net.removeFromRequestingRrlList(this.$net.URL_LIST.instance_status.path);
            break;
        }
      },

      /**
       * 更新实例状态信息。
       * @param goOn, 手动更新还是自动更新
       */
      updateInstanceStatusList(goOn) {
        if (!this.statusForDialogInstanceLog.visible) {
          this.$net.removeFromRequestingRrlList(this.$net.URL_LIST.instance_status.path);
          return;
        }
        let service = this.checkVersionSelector();
        const payload = {
          applicationId: service.selectedAPP.appId,
          spaceId: service.selectedProfile.id,
          kindName: this.action.row['id']
        };
        this.statusForDialogInstanceLog.showLoading = true;

        this.$net.requestPaasServer(this.$net.URL_LIST.instance_status, {
          payload
        }).then(resContent => {
          this.instanceStatusList = resContent.map(item => {
            item.firstTimestamp = this.$utils.formatDate(item.firstTimestamp, 'yyyy-MM-dd hh:mm:ss');
            item.lastTimestamp = this.$utils.formatDate(item.lastTimestamp, 'yyyy-MM-dd hh:mm:ss');
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
          if (goOn) {
            setTimeout(() => {
              this.updateInstanceStatusList(true);
            }, 6000);
          }
        }).catch(err => {
        }).finally(() => {
          this.statusForDialogInstanceLog.showLoading = false;
        });
      },

      /**
       * 更新consoleLog，手动更新
       */
      updateConsoleLog() {
        var selectedValue = this.$refs['version-selector'].getSelectedValue();
        this.dialogStatusForConsoleLog.showLoading = true;
        this.$net.requestPaasServer(this.$net.URL_LIST.instance_console_log, {
          payload: {
            applicationId: selectedValue['selectedAPP'].appId,
            spaceId: selectedValue['selectedProfile'].id,
            podName: this.action.row['id'],
            limitLine: 500
          }
        }).then(resData => {
          this.consoleLogList = resData.split('\n');
          this.$nextTick(() => {
            this.$refs.hasOwnProperty('dialogForConsoleLog') &&
            this.$refs['dialogForConsoleLog'].scrollToBottom();
          });
        }).finally(() => {
          setTimeout(() => {
            this.dialogStatusForConsoleLog.showLoading = false;
          }, 200);
        });
      },

      togglePop() {
        this.statusForPop.visible = !this.statusForPop.visible;
      },
      hidePop() {
        this.statusForPop.visible = false;
      },
      handleClickOutsideOfInstanceList() {
      },

      // 传递给实例终端页面的参数
      getInfoForPageInstanceTerminal(instance) {
        var results = {};
        var {selectedAPP, selectedProfile, selectedService} = this.$refs['version-selector'].getSelectedValue();
        if (!selectedAPP || !selectedProfile || !selectedService) {
          return result;
        }
//        results['appName'] = selectedAPP['appName'];
        results['serviceName'] = selectedService['serviceName'];
        results['profileName'] = selectedProfile['name'];
        results['gid'] = this.$storeHelper.groupInfo.id;
        results['instanceName'] = instance.id;
        if (Object.keys(results)) {
          return results;
        } else {
          return null;
        }
      },
      /**
       * handle click event in operation column
       */
      async handleRowButtonClick(evt, action, index, row) {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        if (this.isMesosService && ['show-console-log', 'go-to-page-terminal-from-instance', 'go-to-page-monitor-from-instance',
            'instanceStatus', 'instance_replace'].indexOf(action) > -1) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: '老mesos应用不支持'
          });
          return;
        }
        this.action.row = row;
        if (action !== 'more') {
          this.hidePop();
        }
        let serviceInfo = null;
        var valueOfVersionSelector = null;
        var infoForPageTerminal = null;
        switch (action) {
          case 'show_eagleeye':
            var nodeUrl = "/monitor/index.html#/basicResource/machine/cpu?node=" + row.nodeIp
                    + "&groupId=" + this.$storeHelper.groupInfo.tag + "&app=" + row.svcName;
            if (this.isProductionProfile) {
              window.open("http://apm.finupgroup.com" + nodeUrl, '_blank');
            } else {
              // window.open("http://monitor-app-web.godeyes.test" + nodeUrl, '_blank');
            }
            break;
          case 'instance_replace':
//            console.log(this.$storeHelper.groupInfo);
//            console.log(this.profileInfo);
            this.addToWaitingResponseQueue(action);
            try {
              var desc = `<p>确定要驱逐实例 "${row.name}" 吗？</p><p style="color: #E6A23C; font-size: 12px;">驱逐成功后，系统会自动补充一个实例，保持总实例数量不变。10秒内生效。</p>`;
              await this.$confirm(desc, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              await this.$net.requestPaasServer(this.$net.URL_LIST.instance_replace, {
                payload: {
                  namespace: `${this.profileInfo.name}-${this.$storeHelper.groupInfo.tag}`,
                  name: row.name,
                  groupId: this.$storeHelper.currentGroupID,
                }
              });
              this.$message.success('驱逐成功，稍后可点击刷新按钮，更新实例列表。');
            } catch(err) {
              console.log(err);
            } finally {
              this.hideWaitingResponse(action);
            }
            break;
          case 'go-to-page-terminal-from-instance':
            serviceInfo = this.$refs['version-selector'].getSelectedValue()[
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
              let terminalPath = this.$net.page['terminal'] + '?id=' + id + '&ip=' + ip + '&name=' + row['id'];
              //              this.$net.getTerminalInfo({
              //                serviceId: id
              //              });
              window.open(terminalPath, '_blank');
            } else {
              this.$message.error('组ID或内网IP没有找到');
            }
            break;
          case 'go-to-page-instance-terminal-from-instance':
            infoForPageTerminal = this.getInfoForPageInstanceTerminal(row);
            if (infoForPageTerminal) {
              window.open(`${this.$net.page['instance-terminal']}${this.$utils.objectToQueryString(infoForPageTerminal)}`, '_blank');
            } else {
              this.$message.error('所需信息不完整，请刷新页面重试！');
            }
            break;
          case 'go-to-log-run-from-instance':
            valueOfVersionSelector = this.$refs['version-selector'].getSelectedValue();
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/instance'],
              data: {
                appId: valueOfVersionSelector['selectedAPP'].appId,
                profileId: valueOfVersionSelector['selectedProfile'].id,
                serviceId: valueOfVersionSelector['selectedService'].id
              }
            };
            this.$router.push(this.$net.page['profile/log/run']);
            break;
          case 'go-to-page-monitor-from-instance':
            valueOfVersionSelector = this.$refs['version-selector'].getSelectedValue();
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/instance'],
              data: {
                appId: valueOfVersionSelector['selectedAPP'].appId,
                profileId: valueOfVersionSelector['selectedProfile'].id,
                serviceId: valueOfVersionSelector['selectedService'].id,
                instanceId: row['id'],
                instanceList: this.instanceStatus.instanceList,
                instanceIp: row['ip'],
              }
            };
            this.$router.push(this.$net.page['profile/monitor']);
            break;
          case 'more':
            this.titleForPop = `实例${this.action.row['id']}`;
            this.togglePop();
            break;
          case 'instanceStatus':
            this.statusForDialogInstanceLog.visible = true;
            this.updateInstanceStatusList(true);
            break;
          case 'show-console-log':
            this.dialogStatusForConsoleLog.visible = true;
            this.updateConsoleLog();
            break;
        }
      },

      // 对齐，填充空白信息
      formatColumn (text, width) {
        let space = '#'.repeat(width);
        return (text + space).slice(0, width).replace(/\#/g, '&nbsp;');
      },

      onSortChangeInTable(tableSort) {
        this.tableSort = tableSort;
        const keyMap = {
          'cpuUsageInPercent': 'cpuUsage',
          'memoryStatus': 'memoryUsageBytes'
        };
        const key = keyMap[this.tableSort.prop];
        if (!key) {
          return 0;
        }
        this.instanceStatus.instanceList.sort((pre, next) => {
          var result = pre[key] - next[key];
          switch (tableSort['order']) {
            case 'ascending':
              break;
            case 'descending':
              result = -1 * result;
              break;
            default:
              result = 0;
              break;
          }
          return result;
        });
      }
    }
  };
</script>
