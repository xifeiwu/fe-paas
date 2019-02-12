<template>
  <div id="service-list">
    <div class="header">
      <el-tabs type="border-tab" v-model="profileName">
        <el-tab-pane v-for="item in $storeHelper.profileListOfGroup" :label="item.description" :name="item.name"
                     :key="item.id"></el-tab-pane>
      </el-tabs>
      <div class="operation">
        <el-button
                size="mini-extral"
                type="primary"
                @click="handleButtonClick($event, 'service_create')"
                :class="{'disabled': $storeHelper.permission['service_create'].disabled && !haveService, 'flex': true}">
          <span>创建服务</span><i class="paas-icon-level-up"></i>
        </el-button>
        <!--<el-button size="mini-extral"-->
                   <!--type="primary"-->
                   <!--:class="{'flex': true, 'disabled': $storeHelper.permission['middleware_mariadb_instance_create'].disabled}"-->
                   <!--@click="handleButtonClick($event, 'middleware_mariadb_instance_create')">-->
          <!--<span>申请实例</span><i class="paas-icon-level-up"></i>-->
        <!--</el-button>-->
        <el-button size="mini-extral"
                   type="primary"
                   @click="handleButtonClick($event, 'refresh-list')">
          <span>刷新列表</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
        </el-button>
      </div>
    </div>
    <div class="list">
      <el-table :data="serviceListByPage"
                stripe
                :height="heightOfTable">
        <el-table-column label="语言版本" headerAlign="center" align="center" width="80">
          <template slot-scope="scope">
            <svg :class="['paas-icon-svg', 'paas-icon-' + scope.row.language.name]" aria-hidden="true" v-if="scope.row.language.name">
              <use :xlink:href="'#paas-icon-' + scope.row.language.name"></use>
            </svg>
            <div class="language" v-else>{{scope.row.language.name ? scope.row.language.name : '语言名未知'}}</div>
            <div class="version" v-if="scope.row.language.version">{{scope.row.language.version}}</div>
            <div v-else>版本未知</div>
          </template>
        </el-table-column>
        <el-table-column label="应用名称" prop="appName" headerAlign="left" align="left" minWidth="100"></el-table-column>
        <el-table-column label="项目名称" prop="tag" headerAlign="left" align="left" minWidth="100"></el-table-column>
        <el-table-column label="二级域名" prop="serviceName" headerAlign="left" align="left" minWidth="100"></el-table-column>
        <el-table-column label="剩余有效时间" prop="remainExpiredDays" headerAlign="center" align="center" width="100"></el-table-column>
        <el-table-column label="创建日期" prop="formattedCreateTime" headerAlign="center" align="center" width="100">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" headerAlign="left" align="left" minWidth="180">
          <template slot-scope="scope">
            <el-button
                    size="small"
                    type="text"
                    :loading="statusOfWaitingResponse('service_deploy') && action.row.appId == scope.row.appId"
                    v-if="!isProductionProfile"
                    @click="handleTRClick($event, 'service_deploy', scope.$index, scope.row)"
                    :class="$storeHelper.permission['service_deploy'].disabled ? 'disabled' : 'danger'">
                  {{statusOfWaitingResponse('deploy') && action.row.appId == scope.row.appId ? '部署中': '部署'}}
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    v-if="!isProductionProfile"
                    type="text"
                    :loading="statusOfWaitingResponse('quick_deploy') && action.row.appId == scope.row.appId"
                    @click="handleTRClick($event, 'quick_deploy', scope.$index, scope.row)"
                    :class="reason4DisableQuickDeploy(scope.row) ? 'disabled' : 'danger'">
                  {{statusOfWaitingResponse('quick_deploy') && action.row.appId == scope.row.appId ? '重启中': '重启'}}
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    :loading="statusOfWaitingResponse('service_stop')"
                    @click="handleTRClick($event, 'service_stop', scope.$index, scope.row)"
                    :class="$storeHelper.permission['service_stop'].disabled ? 'disabled' : 'danger'">
              停止
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    :loading="statusOfWaitingResponse('service_delete')"
                    @click="handleTRClick($event, 'service_delete', scope.$index, scope.row)"
                    :class="$storeHelper.permission['service_delete'].disabled ? 'disabled' : 'danger'">
              删除
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['primary', 'flex']"
                    @click="handleTRClick($event, 'service_edit', scope.$index, scope.row)">
              <span>修改配置</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    :class="['flex', 'primary']"
                    @click="handleTRClick($event, 'go-to-page-service-detail-from-page-service', scope.$index, scope.row)">
              <span>服务详情</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    v-if="isProductionProfile"
                    size="small"
                    type="text"
                    :class="['primary']"
                    @click="handleTRClick($event,'go-to-work-order-todo-add', scope.$index, scope.row)">
              <span>申请工单</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div v-if="isProductionProfile" class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    :class="['flex', 'primary']"
                    @click="handleTRClick($event, 'go-to-page-log-deploy-from-service', scope.$index, scope.row)">
              <span>部署日志</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    :class="['flex', 'primary']"
                    @click="handleTRClick($event, 'go-to-instance-list', scope.$index, scope.row)">
              <span>实例列表</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    v-if="$storeHelper.groupVersion === 'v2'"
                    @click="handleTRClick($event, 'go-page-domain-from-service', scope.$index, scope.row)"
                    :class="$storeHelper.permission['go-page-domain-from-service'].disabled ? 'disabled' : 'primary'">
              <span>配置外网二级域名</span><i class="paas-icon-level-up"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <paas-dialog-for-log title="部署日志" :showStatus="dialogForLogStatus" ref="dialogForDeployLog">
      <div slot="content">
        <div v-for="(item,index) in deployLogs" :key="index" class="log-item" v-html="item"></div>
      </div>
    </paas-dialog-for-log>
  </div>
</template>
<style lang="scss">
  #service-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 1500px;
    background: white;
    > .header {
      .el-tabs {
        /*border-right: 1px solid #dfe4ed;*/
        &.el-tabs--border-tab {
          background-color: #f4f5f5;
          #tab-fpdev.is-active {
            border-top-color: $g-env-fpdev-color;
            color: $g-env-fpdev-color;
          }
          #tab-test.is-active {
            border-top-color: $g-env-test-color;
            color: $g-env-test-color;
          }
          #tab-performance.is-active {
            border-top-color: $g-env-performance-color;
            color: $g-env-performance-color;
          }
          #tab-beta.is-active {
            border-top-color: $g-env-beta-color;
            color: $g-env-beta-color;
          }
          #tab-production.is-active {
            border-top-color: $g-env-production-color;
            color: $g-env-production-color;
          }

          > .el-tabs__header {
            .el-tabs__item {
              color: black;
            }
          }
          .el-tabs__content {
            display: none;
          }
        }
      }
      .operation {
        padding: 6px 8px 3px 5px;
        text-align: right;
        /*flex: 1;*/
        /*display: inline-flex;*/
        /*align-items: center;*/
        /*border-top: 1px solid #dfe4ed;*/
      }
    }
    > .list {
      .el-table {
        td {
          padding: 0px 3px;
        }
      }

    }
  }
</style>
<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  import paasDialogForLog from '../components/dialog4log.vue';
  export default {
    components: {paasDialogForLog},
    mixins: [commonUtils],
    created() {
    },
    mounted() {
      this.onProfileList(this.$storeHelper.profileListOfGroup);
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
      // first requestServiceList will be called by change of profileName
      // this.requestServiceList();

//      if (this.$storeHelper.profileListOfGroup)
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
      '$storeHelper.profileListOfGroup': 'onProfileList',
      '$storeHelper.appInfoListOfGroup': function() {
        this.getAppWithoutService();
      },
      // changed by el-tab
      profileName(profileName) {
        var target = null;
        this.$storeHelper.profileListOfGroup.some(it => {
          if (it.name === profileName) {
            target = it;
          }
        });
        if (target) {
          this.profileInfo = target;
        }
        this.requestServiceList();
      }
    },
    data() {
      return {
        heightOfTable: '',

        profileName: null,
        profileInfo: null,
        isProductionProfile: false,
        serviceList: [],
        serviceListByPage: [],
        // 没有服务的appId列表
        appIdWithoutService: [],
        // 没有服务的app详情列表
        appWithoutService: [],

        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        action: {
          name: null,
          row: null
        },

        deployLogs: [],
        dialogForLogStatus: {
          visible: false,
          full: false,
          showLoading: false,
          iconExpand: true
        },

      }
    },
    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          return;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
        } catch(err) {
        }
      },
      onProfileList(profileList) {
        if (profileList && profileList.length > 0) {
          this.profileName = profileList[0]['name'];
          this.profileInfo = profileList[0];
          this.isProductionProfile = (this.profileName === 'production');
        }
      },
      handleButtonClick(evt, action) {
        switch (action) {
          case 'service_create':
            this.goToPageServiceAdd();
            break;
          case 'refresh-list':
            this.requestServiceList();
            break;
        }
      },

      // collect all related info for add-service before jump to page service/add
      // TODO: not used
      getInfoForAddService() {
        let result = {
          success: false,
          message: '',
          content: null,
        };
        // check group info
        let groupInfo = this.$storeHelper.groupInfo;
        if (!groupInfo) {
          result.message = '未找到团队相关信息！';
          return result;
        }
        // app info
        let appInfo = this.$storeHelper.getAppByID(this.selectedAppID);
        let appName = null;
        let language = null;
        let languageVersion = null;
        if (appInfo && appInfo.hasOwnProperty('appName') && appInfo.hasOwnProperty('language')) {
          appName = appInfo.appName;
          language = appInfo.language.name;
          languageVersion = appInfo.language.version;
        } else {
          result.message = '未找到应用相关信息！';
          return result;
        }

        if (!this.selectedProfileID) {
          result.message = '未找到运行环境相关信息';
          return;
        }

        if (appName && language && languageVersion && null !== this.selectedProfileID) {
          result.success = true;
          result.content = {
            appInfo,
            appName,
            language,
            languageVersion,
            groupTag: groupInfo['tag'],
            appId: this.selectedAppID,
            profileId: this.selectedProfileID,
          }
        } else {
          console.log('error: infoForAddService');
        }
        return result;
      },

      // 获取制定运行环境下没有服务的应用列表（只有没有服务的应用才可以创建服务）
      getAppWithoutService() {
        var appWithoutService = [];
        if (!this.$storeHelper.appInfoListOfGroup) {
          console.log('未获得应用列表信息');
        } else {
          appWithoutService = this.$storeHelper.appInfoListOfGroup['appModelList'].filter(it => {
            return this.appIdWithoutService.indexOf(it['appId']) > -1;
          });
        }
        return appWithoutService;
      },

      goToPageServiceAdd() {
        const basicInfo = {
          profileInfo: this.profileInfo
        };
        this.appWithoutService = this.getAppWithoutService();
        this.$storeHelper.dataTransfer = {
          from: this.$net.page['profile/service'],
          data: Object.assign(basicInfo, {
            appWithoutService: this.appWithoutService,
//            serviceInfo: this.action.row
          })
//          data: JSON.parse(JSON.stringify(Object.assign(this.model, infoForAddService.content))),
        };
        this.$router.push(this.$net.page['profile/service/add']);
      },

      async goToPageServiceModify(row) {
        const basicInfo = {
          profileInfo: this.profileInfo
        };
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {
          payload: {
            appId: row.appId,
            spaceId: this.profileInfo.id
          }
        });
        console.log(resContent);
        const parsedContent = this.$net.parseServiceList(resContent);
        console.log(parsedContent);

        var model = null;
        if (parsedContent.hasOwnProperty("serviceModelList")) {
          model = parsedContent["serviceModelList"][0];
        }

        if (model) {
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            data: JSON.parse(JSON.stringify(Object.assign(basicInfo, {
              serviceInfo: model
            })))
          };
//          console.log(model);
          this.$router.push(this.$net.page['profile/service/modify']);
        } else {

        }
      },

      // 是否支持快速部署：1. 是k8s应用，2. 有正在运行的实例
      reason4DisableQuickDeploy(row) {
        var reason = false;
        if (row) {
          if (row['k8s'] !== 1) {
            reason = '老mesos应用不支持';
          } else if (row['containerStatus'] && row['containerStatus']['Running'] == 0) {
            reason = '运行实例数为0，不能进行重启操作！';
          }
        }
        return reason;
      },

      getVersionDescription() {
        if (!this.action.row) {
          return;
        }
        const row = this.action.row;
        const profileInfo = this.profileInfo;
        const description = profileInfo && profileInfo.hasOwnProperty('description') ? profileInfo.description : '';
        const desc = `应用"${row.appName}:${description}"的服务`;
        return desc;
      },

      expiredDaysAutoAdd() {
        if (!this.action.row) {
          return;
        }
        const row = this.action.row;

        if(!this.isProductionProfile){
          let options = {
            appId: row.appId,
            spaceId: this.profileInfo.id,
            id: row.id,
            expiredDays: 1,
            remainExpiredDays: row.remainExpiredDays,
          };
          this.$net.serviceUpdate("expiredDays", options).then(msg => {
            if(row.remainExpiredDays >= 0) {
              row.remainExpiredDays += 1;
            }else{
              row.remainExpiredDays = 1;
            }
          }).catch(errMsg => {
            console.log(errMsg);
          })
        }
      },
      // 部署服务
      async serviceDeploy(payload, type) {
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

        const desc = this.getVersionDescription();

        var warningMsg = `您确认要部署${desc}吗?`;
        if (type == 'quick_deploy') {
          warningMsg = `<p>您确认要重启${desc}吗?</p><p style="color: #E6A23C; font-size: 12px;">(重启：采用最近一次部署成功的镜像进行服务的重新启动，跳过代码编译、镜像生成阶段)</p>`;
        }
        const urlDesc = type == 'quick_deploy' ? this.$net.URL_LIST.service_quick_deploy : this.$net.URL_LIST.service_deploy;
        //      await this.warningConfirm(warningMsg);
        await this.$confirm(warningMsg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        });
        const resContent = await this.$net.requestPaasServer(urlDesc, {
          payload
        });
        //每次点击部署,过期时间自动加1
        this.expiredDaysAutoAdd();
        if (resContent.hasOwnProperty('orchestration')) {
          this.deployLogs = [];
          this.dialogForLogStatus.visible = true;
          this.dialogForLogStatus.showLoading = true;
          var orchestration = resContent['orchestration'];
          var moreData = orchestration && orchestration['moreData'];

          var deployLogQueue = [];
          var preItem = null, nextItem = null;
          const tagUpdateDeployLog = setInterval(() => {
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
          }, 10);

          while(moreData) {
            await new Promise((resolve) => {
              setTimeout(resolve, 1500);
            });
            orchestration = await getDeployLog({
              logName: orchestration.logName,
              logPath: orchestration.logPath,
              offset: null == orchestration.offset ? 0 : orchestration.offset,
              // 正在部署中的日志
              logType: 'deployLog'
            });
//          console.log(orchestration);
            if (orchestration && orchestration.hasOwnProperty('logList')) {
              // stop showLoading when orchestration.log is not null
              this.dialogForLogStatus.showLoading = false;
              deployLogQueue = deployLogQueue.concat(orchestration['logList']);
            }
            moreData = orchestration && orchestration['moreData'];
          }
          return Promise.reject('已拉取所有日志');
        } else {
          return Promise.reject({
            title: '数据格式错误',
            message: '未找到orchestration'
          })
        }
      },

      async handleTRClick(evt, action, index, row) {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        this.action.name = action;
        this.action.row = row;
        var resContent = null;
        switch (action) {
          case 'service_edit':
            this.goToPageServiceModify(row);
            break;
          case 'go-to-page-service-detail-from-page-service':
          case 'go-to-work-order-todo-add':
          case 'go-to-page-log-deploy-from-service':
          case 'go-to-instance-list':
          case 'go-page-domain-from-service':
            const data = {
              appId: row.appId,
              profileId: this.profileInfo.id,
              serviceId: row.id,
              serviceInfo: row,
              profileInfo: this.profileInfo
            };
//            console.log(row);
//            console.log(data);
            if (!data.appId || !data.profileId || !data.serviceId) {
              this.$message.error('所需信息不完整！');
              return;
            }
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/service'],
              data
            };
            const PATH_MAP = {
              'go-to-page-service-detail-from-page-service': this.$net.page['profile/service/detail'],
              'go-to-work-order-todo-add': this.$net.page['profile/work-order/todo/add'],
              'go-to-page-log-deploy-from-service': this.$net.page['profile/log/deploy'],
              'go-to-instance-list': this.$net.page['profile/instance'],
              'go-page-domain-from-service': this.$net.page['profile/domain']
            };
            this.$router.push(PATH_MAP[action]);
            break;
          case 'service_deploy':
            this.addToWaitingResponseQueue(action);
            try {
              await this.serviceDeploy({
                id: row.id,
                appId: row.appId,
                spaceId: this.profileInfo.id,
              }, action);
            } catch (err) {
              console.log(err);
              this.hideWaitingResponse(action);
            }
            break;
          case 'quick_deploy':
            try {
              let reason = this.reason4DisableQuickDeploy(row);
              if (reason) {
                this.$storeHelper.globalPopover.show({
                  ref: evt.target,
                  msg: reason
                });
              } else {
                this.addToWaitingResponseQueue(action);
                await this.serviceDeploy({
                  id: row.id,
                  appId: row.appId,
                  spaceId: this.profileInfo.id,
                }, action);
                this.hideWaitingResponse(action);
              }
            } catch (err) {
              console.log(err);
              this.hideWaitingResponse(action);
            }
            break;
          case 'service_stop':
            this.addToWaitingResponseQueue(action);
            var desc = this.getVersionDescription();
            this.$confirm(`停止将会导致${desc}不可用，但不会删除代码及配置信息，你确定需要这么做吗?`).then(() => {
              this.$net.serviceStop({
                id: row.id,
                appId: row.appId,
                spaceId: this.profileInfo.id,
              }).then(msg => {
                this.hideWaitingResponse(action);
                this.$message({
                  type: 'success',
                  message: msg
                });
              }).catch(err => {
                this.hideWaitingResponse(action);
                this.$notify({
                  title: '提示',
                  message: err,
                  duration: 0,
                  onClose: function () {
                  }
                });
                console.log(err);
              });
            }).catch(() => {
              this.hideWaitingResponse(action);
            });
            break;
          case 'service_delete':
            this.addToWaitingResponseQueue(action);
            var desc = this.getVersionDescription();
            try {
              await this.warningConfirm(`删除服务将会销毁${desc}的代码和配置信息，同时自动解绑外网二级域名，删除后服务数据不可恢复。`);
              await this.warningConfirm(`你确认要删除${desc}，并清除该服务的一切数据？`);
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_delete, {
                payload: {
                  id: row.id,
                  appId: row.appId,
                  spaceId: this.profileInfo.id,
                }
              });
              this.hideWaitingResponse(action);
              this.$message({
                type: 'success',
                message: msg
              });
              this.$net.needUpdateAppList = true;
              this.requestServiceList();
            } catch (err) {
              console.log(err);
              this.hideWaitingResponse(action);
            }
            break;
        }
      },

      // TODO: not used
      parseServiceList(serviceList) {
        const  LANGUAGE_MAP = {
          'JAVA': 'java',
          'NODE_JS': 'nodejs',
          'PYTHON': 'python',
          'PHP': 'php'
        };
        const transform = it => {
          var result = {};
          ['language', 'languageVersion', 'serviceName', 'remainExpiredDays'].forEach(prop => {
            result[prop] = it[prop];
          });
          result = Object.assign(result, {
            formattedCreateTime: this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss').split(' '),
            languageLogo: LANGUAGE_MAP[it.language],
          });
          return result;
        };
        return serviceList.map(transform);
      },

      async requestServiceList() {
        this.serviceList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_profile, {
          payload: {
            groupId: this.$storeHelper.currentGroupID,
            spaceId: this.profileInfo.id
          }
        });
        const parsedResContent = this.$net.parseServiceList(resContent);
        this.serviceList = parsedResContent['serviceModelList'];
        this.serviceListByPage = this.serviceList;
        this.totalSize = parsedResContent.total;

        this.appIdWithoutService = [];
        if (parsedResContent.hasOwnProperty('tobeInsertList')) {
          this.appIdWithoutService = parsedResContent['tobeInsertList'];
          this.appWithoutService = this.getAppWithoutService();
        }
        console.log(parsedResContent);
      }
    }
  }
</script>