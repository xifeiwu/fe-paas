<template>
  <div id="service-main">
    <div class="header">
      <el-row class="operation">
        <el-col :span="24" class="selector">
          <div class="item">
            <label style="float: left; width: 66px; line-height: 26px">应用名称:</label>
            <el-select filterable v-model="selectedAppID" placeholder="请选择"
                       style="display:block; min-width: 360px; margin-left: 66px;">
              <el-option v-for="(item,index) in appList" :key="item.appId" :label="item.appName" :value="item.appId">
              </el-option>
            </el-select>
          </div>
          <div class="item" style="margin-left: 8px;">
            <label style="float: left; width: 66px; line-height: 26px">运行环境:</label>
            <el-select v-model="selectedProfileID" placeholder="请选择" style="display:block; max-width: 200px; margin-left: 66px;">
              <el-option v-for="item in currentProfileList" :key="item.id" :label="item.description" :value="item.id">
              </el-option>
            </el-select>
          </div>
        </el-col>
        <div class="el-col el-col-24 btn-list">
          <el-button
                  size="mini-extral"
                  type="primary"
                  @click="handleButtonClick($event, 'refresh')">
            刷新
          </el-button>
          <el-button
                  size="mini-extral"
                  type="primary"
                  @click="handleButtonClick($event, 'service-create')">
            {{haveService ? '修改配置' : '创建服务'}}
          </el-button>
          <el-button
                  size="mini-extral"
                  type="danger"
                  :loading="statusOfWaitingResponse('service_deploy')"
                  v-if="haveService && !isProductionProfile"
                  @click="handleButtonClick($event, 'service-deploy')"
                  :disabled="$storeHelper.permission['service_deploy'].disabled ? true : false">
            {{statusOfWaitingResponse('deploy') ? '部署中': '部署'}}
          </el-button>
          <el-button
                  size="mini-extral"
                  v-if="haveService && !isProductionProfile"
                  type="danger"
                  :loading="statusOfWaitingResponse('quick-deploy')"
                  @click="handleButtonClick($event, 'quick-deploy')"
                  :class="reason4DisableQuickDeploy() ? 'disabled' : ''">
            {{statusOfWaitingResponse('quick-deploy') ? '部署中': '重启'}}
          </el-button>
          <el-button
                  size="mini-extral"
                  type="danger"
                  v-if="haveService"
                  :loading="statusOfWaitingResponse('service_stop')"
                  @click="handleButtonClick($event, 'service-stop')"
                  :disabled="$storeHelper.permission['service_stop'].disabled ? true : false">
            停止
          </el-button>
          <el-button
                  size="mini-extral"
                  type="primary"
                  v-if="isProductionProfile && haveService"
                  @click="handleButtonClick($event,'go-to-work-order-todo-add')">
            <span>申请工单</span><i class="paas-icon-level-up"></i>
          </el-button>
          <el-button
                  size="mini-extral"
                  type="primary"
                  v-if="haveService"
                  @click="handleButtonClick($event, 'go-to-page-log-deploy-from-service')">
            <span>部署日志</span><i class="paas-icon-level-up"></i>
          </el-button>
          <el-button
                  size="mini-extral"
                  type="primary"
                  v-if="haveService"
                  @click="handleButtonClick($event, 'go-to-instance-list')">
            <span>实例列表</span><i class="paas-icon-level-up"></i>
          </el-button>
          <el-button
                  size="mini-extral"
                  type="primary"
                  v-if="haveService"
                  @click="handleButtonClick($event, 'go-page-domain-from-service')">
            <span>配置外网二级域名</span><i class="paas-icon-level-up"></i>
          </el-button>
        </div>
      </el-row>
    </div>
    <div class="service-info-title">
      <div class="title" v-if="showServiceInfo">服务实时信息</div>
      <div class="title" v-else="showServiceInfo">暂无服务</div>
    </div>
    <div v-if="showServiceInfo" class="service-info">
      <table cellspacing="0" cellpadding="0">
        <thead>
        <tr>
          <th colspan="2" style="text-align: left;background-color: lightgrey;font-size: 14px;">基本信息</th>
        </tr>
        </thead>
        <colgroup>
          <col width="40%" />
          <col width="60%" />
        </colgroup>
        <tbody>
        <tr>
          <td>外网域名</td>
          <td>{{applicationConfigBasic["internetDomainList"] ? applicationConfigBasic["internetDomainList"] : "未绑定"}}</td>
        </tr>
        <tr>
          <td>内网域名</td>
          <td>{{applicationConfigBasic["intranetDomain"] ? applicationConfigBasic["intranetDomain"] : "未绑定"}}</td>
        </tr>
        <tr>
          <td>更新时间</td>
          <td>{{this.$utils.formatDate(applicationConfigBasic["updateTime"],"yyyy-MM-dd hh:mm:ss")}}</td>
        </tr>
        <tr>
          <td>namespace</td>
          <td>{{applicationConfigBasic["namespace"]}}</td>
        </tr>
        <tr>
          <td>label</td>
          <td>{{applicationConfigBasic["serviceName"]}}</td>
        </tr>
        <tr>
          <td>开发语言</td>
          <td>{{applicationConfigBasic["language"] + applicationConfigBasic["languageVersion"]}}</td>
        </tr>
        <tr>
          <td>构建方式</td>
          <td>{{applicationConfigBasic["packageType"] ? applicationConfigBasic["packageType"] : "未知"}}</td>
        </tr>
        <tr v-if="!isProductionProfile">
          <td>服务期限</td>
          <td>{{applicationConfigBasic["expiredDays"] ? applicationConfigBasic["expiredDays"] + "天": "未配置"}}</td>
        </tr>
        </tbody>
      </table>
      <table cellspacing="0" cellpadding="0" style="margin-top: 0px">
        <thead>
        <tr>
          <th colspan="2" style="text-align: left;background-color: lightgrey;font-size: 14px;">配置信息</th>
        </tr>
        </thead>
        <colgroup>
          <col width="40%" />
          <col width="60%" />
        </colgroup>
        <tbody>
        <tr>
          <td>CPU/内存</td>
          <td>{{applicationConfigDeployment["cpu"] == null || applicationConfigDeployment["memory"] == null ? "未知" : applicationConfigDeployment["cpu"] + "核/" + applicationConfigDeployment["memory"] / 1024 + "G"}}</td>
        </tr>
        <tr>
          <td>运行实例数</td>
          <td>{{applicationConfigDeployment["instances"] ? applicationConfigDeployment["instances"] : 0}}</td>
        </tr>
        <tr>
          <td>健康检查</td>
          <td>{{applicationConfigDeployment["healthCheck"] ? applicationConfigDeployment["healthCheck"] : "未设置"}}</td>
        </tr>
        <tr>
          <td>健康检查等待时间</td>
          <td>{{applicationConfigDeployment["initialDelaySeconds"] ? applicationConfigDeployment["initialDelaySeconds"] + "s" : "未知"}}</td>
        </tr>
        <tr>
          <td>负载均衡</td>
          <td>{{applicationConfigDeployment["loadBalance"] ? applicationConfigDeployment["loadBalance"] : "未设置"}}</td>
        </tr>
        <tr>
          <td>滚动升级</td>
          <td>{{applicationConfigDeployment["rollingUpdate"] ? applicationConfigDeployment["rollingUpdate"] : "未设置"}}</td>
        </tr>
        <tr>
          <td>应用监控</td>
          <td>{{applicationConfigDeployment["appMonitor"] ? applicationConfigDeployment["appMonitor"] : "未设置"}}</td>
        </tr>
        <tr>
          <td>环境变量配置</td>
          <td>{{applicationConfigDeployment["environments"] ? applicationConfigDeployment["environments"] : "未设置"}}</td>
        </tr>
        <tr>
          <td>Host配置</td>
          <td>{{applicationConfigDeployment["hosts"] ? applicationConfigDeployment["hosts"] : "未设置"}}</td>
        </tr>
        <tr>
          <td>端口映射</td>
          <td>{{applicationConfigDeployment["postMapped"] ?  applicationConfigDeployment["postMapped"] : "未设置"}}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <paas-dialog-for-log title="部署日志" :showStatus="dialogForLogStatus" ref="dialogForDeployLog">
      <div slot="content">
        <div v-for="(item,index) in deployLogs" :key="index" class="log-item" v-html="item"></div>
      </div>
    </paas-dialog-for-log>
  </div>
</template>

<style lang="scss">
  @mixin expand-inline-form-item() {
    display: block;
    width: 100%;
    .el-form-item__label {
      float: left;
    }
    .el-form-item__content {
      display: block;
    }
  }
  .fix-form-item-label {
    line-height: 25px;
    padding-right: 4px;
  }
  .fix-form-item-content {
    line-height: 25px;
  }
  #service-main {
    .el-textarea__inner {
      font-size: 14px;
    }
    .paas-icon-level-up {
      margin-left: 2px;
      font-size: 12px;
    }
    .header {
      .el-select .el-input__inner {
        height: 26px;
      }
    }
  }
</style>

<style lang="scss" scoped>
  #service-main {
    background: white;
    height: 100%;
    /*margin:0px 6px;*/
    max-width: 1500px;
    .header {
      padding: 0px 5px;
      font-size: 14px;
      line-height: 20px;
      i {
        font-size: 14px;
      }
      .el-row {
        min-height: 28px;
        &.operation {
          /*margin: 3px 5px;*/
          .el-col {
            display: block !important;
            float: none !important;
            margin: 3px 0px;

            display: inline-block;
            vertical-align: middle;
            text-align: left;

            &.selector {
              .item {
                display: inline-block;
              }
            }
            &.btn-list {
              padding-top: 15px;
              padding-bottom: 15px;
              border-bottom: 1px solid lightgrey;
            }
          }
        }
        &.notice {
          .el-tag {
            display: block;
            .el-icon-warning {
              vertical-align: middle;
            }
          }
        }
        &.domain {
          /*margin: 5px 5px 5px 8px;*/
          .el-col {
            .text {
              display: inline-block;
              max-width: calc(100% - 30px);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              word-wrap: break-word;
              word-break: break-all;
            }
            .el-icon-edit {
              font-size: 16px;
              margin-left: 0px;
            }
          }
        }
      }
    }

    .service-info-title {
      .title {
        font-size: 16px;
        margin-top: 5px;
        border-left: 10px solid #409eff;
      }
    }

    table {
      width: 50%;
      font-size: 14px;
      color: #606266;
      table-layout: fixed;
      border-collapse: separate;
      margin-top: 10px;
      border-left: 1px solid #EBEEF5;
      tbody {
        td {
          border-right: 1px solid #EBEEF5;
          border-bottom: 1px solid #EBEEF5;
        }
      }
    }
  }
</style>

<script>
  import {mapGetters} from 'vuex';
  import paasDialogForLog from '../components/dialog4log.vue'
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
export default {
  components: {paasDialogForLog},
  created() {
    if (this.$storeHelper.dataTransfer) {
      const dataTransfer = this.$storeHelper.dataTransfer;
      try {
        const from = dataTransfer['from'];
        // data save to localStorage
        let dataToSave = null;
        switch (from) {
          case this.$net.page['profile/app']:
            dataToSave = {
              appId: dataTransfer['data']['appId'],
              profileId: dataTransfer['data']['profileId']
            };
            break;
          case this.$net.page['profile/app/add']:
            dataToSave = {
              profileId: dataTransfer['data']['profileId']
            };
            break;
        }
        if (dataToSave) {
          this.$store.dispatch('user/config', {
            page: 'service',
            data: dataToSave
          });
        }
        this.$storeHelper.dataTransfer = null;
      } catch(err) {
      }
    }
  },
  mounted() {
    if (this.appInfoListOfGroup) {
      this.onAppInfoListOfGroup(this.appInfoListOfGroup);
    }
    try {
      let headerNode = this.$el.querySelector(':scope > .header');
      this.resizeListener = () => {
        let headerHeight = headerNode.offsetHeight;
        this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
      };
      addResizeListener(this.$el, this.resizeListener);
    } catch(err) {
    }
  },
  beforeDestroy() {
    removeResizeListener(this.$el, this.resizeListener);
  },
  computed: {
    ...mapGetters('user', {
      'appInfoListOfGroup': 'appInfoListOfGroup',
      'userConfig': 'config'
    }),
    serviceConfig() {
      let result = null;
      if (this.userConfig.hasOwnProperty('service')) {
        result = this.userConfig['service'];
      }
      return result;
    },
  },
  data() {
    return {
//      1. 对于1.x团队的应用，服务管理页面中删除、配置外网域名、复制服务不可用，创建服务不可用。
//      2. 对于mesos应用，服务管理页面中重启按钮不可用
      resizeListenerForServiceList: () => {},
      heightOfTable: '',
      appList: [],
      selectedAppID: null,
      selectedApp: null,
      selectedProfileID: null,
      // whether current profile is production
      isProductionProfile: null,
      currentProfileList: [],
      serviceInfo: {
        appID: null,
        profileID: null,
        serviceID: null,
      },
      // used for component MyImageSelector
      queueForWaitingResponse: [],
      applicationConfigBasic: null,
      applicationConfigDeployment: null,
      showServiceInfo: false,
      haveService: false,
      model: null,
      deployLogs: [],
      dialogForLogStatus: {
        visible: false,
        full: false,
        showLoading: false,
        iconExpand: true
      },
    }
  },
  watch: {
    appInfoListOfGroup: 'onAppInfoListOfGroup',
    selectedAppID: function (appId) {
      let appInfo = this.$storeHelper.getAppInfoByID(appId);
      if (!appInfo) {
        return;
      }
      this.serviceInfo.appID = appId;
      this.selectedApp = appInfo['app'];
      this.$store.dispatch('user/config', {
        page: 'service',
        data: {
          appId
        }
      });
      this.currentProfileList = this.selectedApp['profileList'];
      if (!Array.isArray(this.currentProfileList) || this.currentProfileList.length === 0) {
        return;
      }
      // the logic of set profileId:
      // 1. profileId in local config; 2. first profileId in profileList
      let defaultProfileID = this.currentProfileList[0]['id'];
      const localProfileId = this.serviceConfig ? this.serviceConfig['profileId'] : null;
      // check whether localProfileId exist in currentProfileList
      defaultProfileID = this.currentProfileList.map(it => {
        if (it && it.id) {
          return it.id
        }
      }).indexOf(localProfileId) > -1 ? localProfileId: defaultProfileID;
      this.selectedProfileID = null;
      setTimeout(() => {
        this.selectedProfileID = defaultProfileID;
      });
    },
    selectedProfileID: function (profileId, oldValue) {
      if (this.$storeHelper.SERVICE_ID_FOR_NULL === profileId) {
        return;
      }
      this.serviceInfo.profileID = profileId;
      this.isProductionProfile = this.$storeHelper.isProductionProfile(profileId);
      let appID = this.selectedApp.appId;
      this.requestService(appID, profileId);
      this.$store.dispatch('user/config', {
        page: 'service',
        data: {
          profileId
        }
      });
    },
  },
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

    hideWaitingResponse(action) {
      let index = this.queueForWaitingResponse.indexOf(action);
      if (index > -1) {
        this.queueForWaitingResponse.splice(index, 1);
      }
    },

    onAppInfoListOfGroup(appInfoListOfGroup) {
      this.initDataStatus();
      if (appInfoListOfGroup) {
        if (appInfoListOfGroup.hasOwnProperty('appList')) {
          this.appList = appInfoListOfGroup.appList;
        }
        const localId = this.serviceConfig ? this.serviceConfig['appId'] : null;
        let appId = null;
        if (localId && this.$storeHelper.getAppInfoByID(localId)) {
          appId = localId;
        } else {
          appId = this.appList.length > 0 ? this.appList[0]['appId'] : this.$storeHelper.APP_ID_FOR_NULL;
        }
        setTimeout(() => {
          this.selectedAppID = appId;
        });
      }
    },

    initDataStatus() {
      this.appList = [];
      this.selectedAppID = null;
      this.currentProfileList = [];
      this.selectedProfileID = this.$storeHelper.SERVICE_ID_FOR_NULL;
    },

    requestService(appID, profileID) {
      if (!appID || !profileID) {
        console.log('appID or profileID can not be empty');
        return;
      }
      this.applicationConfigBasic = null;
      this.applicationConfigDeployment = null;
      this.showServiceInfo = false;
      this.haveService = false;
      let payload = {
        appId: appID,
        spaceId: profileID
      };
      this.$net.requestPaasServer(this.$net.URL_LIST.get_service_list_v2, {payload}).then(resContent => {
        if (resContent.hasOwnProperty("applicationConfigBasic") && resContent.hasOwnProperty("applicationConfigDeployment")) {
          this.applicationConfigBasic = resContent["applicationConfigBasic"];
          this.applicationConfigDeployment = resContent["applicationConfigDeployment"];
          this.showServiceInfo = true;
          this.haveService = true;
        }
      });
      this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {payload}).then(resContent => {
        const content = this.$net.parseServiceList(resContent);
        if (content.hasOwnProperty("applicationServerList")) {
          this.model = content["applicationServerList"].find(it => {
            return it["defaultSelect"] === true;
          });
        }
        this.serviceInfo.serviceID = this.model.id;
      })
    },

    // collect all related info for add-service before jump to page service/add
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

    goToAddServicePage() {
      let infoForAddService = this.getInfoForAddService();
      if (!infoForAddService.success) {
        this.$message.error(infoForAddService.message);
        return;
      }
      // 没有服务就是添加，有服务就是修改
      if (!this.haveService) {
        this.$storeHelper.dataTransfer = {
          from: this.$net.page['profile/service'],
          type: 'add',
          data: infoForAddService.content
        };
        this.$router.push(this.$net.page['profile/service/add']);
      } else {
        this.$storeHelper.dataTransfer = {
          from: this.$net.page['profile/service'],
          type: 'edit',
          data: JSON.parse(JSON.stringify(Object.assign(this.model, infoForAddService.content))),
        };
        this.$router.push(this.$net.page['profile/service/edit']);
      }
    },

    gotToWorkOrderPage(){
      if (this.applicationConfigBasic == null && this.applicationConfigDeployment == null) {
        this.$message.error('请先创建服务!');
        return;
      }
      if (this.selectedAppID == null && this.selectedProfileID == null) {
        this.$message.error('所需信息不完整！');
        return;
      }
      this.$storeHelper.dataTransfer = {
        from: this.$net.page['profile/service'],
        data: {
          appId: this.selectedAppID,
          profileId: this.selectedProfileID
        }
      };
      this.$router.push(this.$net.page['profile/work-order/todo/add']);
    },

    async serviceDeploy(payload,type) {
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
      if (type == 'quick-deploy') {
        warningMsg = `<p>您确认要重启${desc}吗?</p><p style="color: #E6A23C; font-size: 12px;">(重启：采用最近一次部署成功的镜像进行服务的重新启动，跳过代码编译、镜像生成阶段)</p>`;
      }
      const urlDesc = type == 'quick-deploy' ? this.$net.URL_LIST.service_quick_deploy : this.$net.URL_LIST.service_deploy;
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

    expiredDaysAutoAdd(){
      if(!this.isProductionProfile){
        let options = {
          appId: this.serviceInfo.appID,
          spaceId: this.serviceInfo.profileID,
          id: this.serviceInfo.serviceID,
          expiredDays:1,
          remainExpiredDays:this.model.remainExpiredDays,
        };
        this.$net.serviceUpdate("expiredDays", options).then(msg => {
          if(this.model.remainExpiredDays >= 0) {
            this.model.remainExpiredDays += 1;
          }else{
            this.model.remainExpiredDays = 1;
          }
        }).catch(errMsg => {
          console.log(errMsg);
        })
      }
    },



    // 是否支持快速部署：1. 是k8s应用，2. 有正在运行的实例
    reason4DisableQuickDeploy() {
      var reason = false;
      if (this.model) {
        if (this.model['k8s'] !== 1) {
          reason = '老mesos应用不支持';
        } else if (!this.model['containerStatus'].Running || this.model['containerStatus'].Running == 0) {
          reason = '运行实例数为0，不能进行重启操作！';
        }
      }
      return reason;
    },

    getVersionDescription() {
      let profileInfo = this.$storeHelper.getProfileInfoByID(this.selectedProfileID);
      let description = profileInfo && profileInfo.hasOwnProperty('description') ? profileInfo.description : '';
      let desc = `应用"${this.selectedApp.appName}"${description}的服务`;
      return desc;
    },

    async handleButtonClick(evt,action) {
      if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
        this.$storeHelper.globalPopover.show({
          ref: evt.target,
          msg: this.$storeHelper.permission[action].reason
        });
        return;
      }
      switch (action) {
        case "refresh" :
          this.requestService(this.selectedAppID,this.selectedProfileID);
          break;
        case "go-to-work-order-todo-add" :
          this.gotToWorkOrderPage();
          break;
        case 'service-create' :
          this.goToAddServicePage();
          break;
        case 'service-deploy':
          this.addToWaitingResponseQueue(action);
          try {
            await this.serviceDeploy({
              id: this.serviceInfo.serviceID,
              appId: this.serviceInfo.appID,
              spaceId: this.serviceInfo.profileID,
            }, action);
          } catch (err) {
            console.log(err);
            this.hideWaitingResponse(action);
          }
          break;
        case 'quick-deploy':
          try {
            let reason = this.reason4DisableQuickDeploy();
            if (reason) {
              this.$storeHelper.globalPopover.show({
                ref: evt.target,
                msg: reason
              });
            } else {
              this.addToWaitingResponseQueue(action);
              await this.serviceDeploy({
                id: this.selected.service['id'],
                appId: this.selectedAppID,
                spaceId: this.selectedProfileID
              }, action);
              this.hideWaitingResponse(action);
            }
          } catch (err) {
            console.log(err);
            this.hideWaitingResponse(action);
          }
          break;
        case 'service-stop':
          this.addToWaitingResponseQueue(action);
          var desc = this.getVersionDescription();
          this.$confirm(`停止将会导致"${desc}"不可用，但不会删除代码及配置信息，你确定需要这么做吗?`).then(() => {
            this.$net.serviceStop({
              id: this.serviceInfo.serviceID,
              appId: this.serviceInfo.appID,
              spaceId: this.serviceInfo.profileID,
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
        case 'go-to-page-log-deploy-from-service':
          if (this.serviceInfo.profileID == null || this.serviceInfo.serviceID == null || this.serviceInfo.appID == null) {
            this.$message.error('所需信息不完整！');
            return;
          }
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            data: {
              appId: this.serviceInfo.appID,
              profileId: this.serviceInfo.profileID,
              serviceId: this.serviceInfo.serviceID,
            }
          };
          this.$router.push(this.$net.page['profile/log/deploy']);
          break;
        case 'go-to-instance-list':
          if (this.serviceInfo.profileID == null || this.serviceInfo.serviceID == null || this.serviceInfo.appID == null) {
            this.$message.error('所需信息不完整！');
            return;
          }
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            data: {
              appId: this.serviceInfo.appID,
              profileId: this.serviceInfo.profileID,
              serviceId: this.serviceInfo.serviceID,
            }
          };
          this.$router.push(this.$net.page['profile/instance']);
          break;
        case 'go-page-domain-from-service':
          if (this.serviceInfo.profileID == null || this.serviceInfo.serviceID == null || this.serviceInfo.appID == null) {
            this.$message.error('所需信息不完整！');
            return;
          }
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            data: {
              appId: this.serviceInfo.appID,
              profileId: this.serviceInfo.profileID,
              serviceId: this.serviceInfo.serviceID,
            }
          };
          this.$router.push(this.$net.page['profile/domain']);
          break;
      }
    }
  }
}
</script>
