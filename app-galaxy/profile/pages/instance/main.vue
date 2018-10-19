<template>
  <div id="instance-main">
    <el-row class="header" type="flex" justify="center" align="middle">
      <el-col :span="20">
        <paas-version-selector :customConfig="config4VersionSelector" ref="version-selector"
                             @version-selected="onVersionSelected"></paas-version-selector>
      </el-col>
      <el-col :span="4">
        <el-button v-if="true"
                   size="mini-extral"
                   type="primary"
                   @click="handleButtonClick($event, 'refresh')">刷新</el-button>
        <el-button size="mini-extral"
                   type="primary"
                   :class="{'disabled': $storeHelper.permission['instance_change_count'].disabled}"
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
      >
        <el-table-column
                prop="id"
                label="实例名称"
                width="200"
                headerAlign="left" align="left">
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
                width="100"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
              label="使用内存/总内存"
              prop="memoryStatus"
              width="140"
              headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                label="CPU使用时间"
                prop="cpuUsageSecondsSum"
                width="120"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                label="创建时间"
                prop="createTime"
                width="100"
                headerAlign="center" align="center">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.createTime)">
              <div v-for="(item, index) in scope.row.createTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.createTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operation" headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-button
                    @click="handleRowButtonClick($event, 'instance_replace', scope.$index, scope.row)"
                    type="text" class="warning">
              <span>驱逐</span>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="[isMesosService ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'show-console-log', scope.$index, scope.row)"
            >
              <span>查看console日志</span>
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
                    @click="handleRowButtonClick($event, 'go-to-log-run-from-instance', scope.$index, scope.row)"
                    :class="['flex', $storeHelper.permission['go-to-log-run-from-instance'].disabled ? 'disabled' : 'primary']">
              <span>查看运行日志</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider" v-if="false"></div>
            <el-button
                    @click="handleRowButtonClick($event, 'go-to-page-monitor', scope.$index, scope.row)"
                    :disabled="false"
                    v-if="!$storeHelper.permission['go-to-page-monitor-from-instance'] && false"
                    type="text" class="primary flex">
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
        <pre class="content">{{consoleLogList}}</pre>
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
        pre.content {
          font-size: 12px;
          line-height: 14px;
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
    max-width: 1300px;
    height: 100%;
    .el-row.header {
      padding: 3px 5px;
      font-size: 14px;
      min-height: 28px;
    }
    .instance-list {
      position: relative;
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
          serviceId: data['serviceId'],
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
        consoleLogList: '',

        isMesosService: false,
      };
    },
    watch: {},
    methods: {
      onVersionSelected(appInfo, profileInfo, serviceInfo) {
//                console.log(appInfo, profileInfo, serviceInfo);
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

        this.$net.requestPaasServer(this.$net.URL_LIST.instance_list, {
          payload: {
            appId: appID,
            spaceId: spaceID,
            serviceVersion: version
          }
        }).then(resContent => {
          if (resContent.hasOwnProperty('instanceList')) {
            const instanceList = resContent.instanceList;
            instanceList.forEach(it => {
              it.name = it.id;
              it.updated = it.updated ? it.updated.split(' ') : '---';
              this.$utils.renameProperty(it, 'state', 'status');
              this.$utils.renameProperty(it, 'ip', 'intranetIP');
              this.$utils.renameProperty(it, 'updated', 'createTime');
              it.memoryStatus = '---';
              if (it['memoryUsageBytes'] && it['actualMemory']) {
                it.memoryStatus = bytes(parseInt(it['memoryUsageBytes'])) + ' / ' + bytes(parseInt(it['actualMemory']));
              }
              it.cpuUsageSecondsSum = it.cpuUsageSecondsSum ? `${parseFloat(it['cpuUsageSecondsSum']).toFixed(2)}s` : '---'
            });
            this.instanceStatus.instanceList = instanceList;
          } else {
            this.instanceStatus.instanceList = [];
          }
          if (resContent.hasOwnProperty('instanceNum')) {
            this.instanceStatus.instanceCount = resContent['instanceNum'];
          }
        }).catch(err => {
          console.log(err);
        }).finally(() => {
        });
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
            let params = [
              serviceInfo.selectedAPP.appId,
              serviceInfo.selectedProfile.id,
              serviceInfo.selectedService.serviceVersion
            ];
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
        this.$net.getConsoleLog({
          applicationId: selectedValue['selectedAPP'].appId,
          spaceId: selectedValue['selectedProfile'].id,
          podName: this.action.row['id'],
          limitLine: 500
        }).then(resData => {
          this.consoleLogList = resData;
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
        if (this.isMesosService && ['show-console-log', 'go-to-page-terminal-from-instance', 'instanceStatus'].indexOf(action) > -1) {
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
        let valueOfVersionSelector = null;
        switch (action) {
          case 'instance_replace':
//            console.log(this.$storeHelper.groupInfo);
//            console.log(this.profileInfo);
            this.addToWaitingResponseQueue(action);
            try {
              var desc = `<p>确定要驱逐实例 "${row.name}" 吗？</p><p style="color: #E6A23C; font-size: 12px;">大概30分钟后生效</p>`;
              await this.$confirm(desc, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              await this.$net.requestPaasServer(this.$net.URL_LIST.instance_replace, {
                payload: {
                  namespace: `${this.profileInfo.name}-${this.$storeHelper.groupInfo.tag}`,
                  name: row.name
                }
              });
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
          case 'go-to-page-monitor':
            valueOfVersionSelector = this.$refs['version-selector'].getSelectedValue();
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/instance'],
              data: {
                appId: valueOfVersionSelector['selectedAPP'].appId,
                profileId: valueOfVersionSelector['selectedProfile'].id,
                serviceId: valueOfVersionSelector['selectedService'].id,
                instanceId: row['id'],
                instanceList: this.instanceStatus.instanceList,
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
    }
  };
</script>
