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
                  v-if="!haveService"
                  size="mini-extral"
                  type="primary"
                  @click="handleButtonClick($event, 'service_create')"
                  :class="{'disabled': $storeHelper.permission['service_create'].disabled && !haveService}">
            创建服务
          </el-button>
          <el-button
                  v-else
                  size="mini-extral"
                  type="primary"
                  @click="handleButtonClick($event, 'service_edit')">
            修改配置
          </el-button>
          <el-button
                  size="mini-extral"
                  type="danger"
                  :loading="statusOfWaitingResponse('service_deploy')"
                  v-if="haveService && !isProductionProfile"
                  @click="handleButtonClick($event, 'service_deploy')"
                  :class="$storeHelper.permission['service_deploy'].disabled ? 'disabled' : ''">
            {{statusOfWaitingResponse('deploy') ? '部署中': '部署'}}
          </el-button>
          <el-button
                  size="mini-extral"
                  v-if="haveService && !isProductionProfile"
                  type="danger"
                  :loading="statusOfWaitingResponse('quick_deploy')"
                  @click="handleButtonClick($event, 'quick_deploy')"
                  :class="reason4DisableQuickDeploy() ? 'disabled' : ''">
            {{statusOfWaitingResponse('quick-deploy') ? '部署中': '重启'}}
          </el-button>
          <el-button
                  size="mini-extral"
                  type="danger"
                  v-if="haveService"
                  :loading="statusOfWaitingResponse('service_stop')"
                  @click="handleButtonClick($event, 'service_stop')"
                  :class="$storeHelper.permission['service_stop'].disabled ? 'disabled' : ''">
            停止
          </el-button>
          <el-button
                  size="mini-extral"
                  type="danger"
                  v-if="haveService"
                  :loading="statusOfWaitingResponse('service_delete')"
                  @click="handleButtonClick($event, 'service_delete')"
                  :class="$storeHelper.permission['service_delete'].disabled ? 'disabled' : ''">
            删除
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
                  v-if="haveService && this.$storeHelper.groupVersion === 'v2'"
                  @click="handleButtonClick($event, 'go-page-domain-from-service')"
                  :class="$storeHelper.permission['go-page-domain-from-service'].disabled ? 'disabled' : ''">
            <span>配置外网二级域名</span><i class="paas-icon-level-up"></i>
          </el-button>
          <el-button
                  size="mini-extral"
                  type="primary"
                  v-else-if="haveService"
                  @click="handleButtonClick($event, 'v1-add-internetDomain')"
                  :class="{'disabled': model.internetDomainList.length > 0}">
            <span>添加外网域名</span>
          </el-button>
        </div>
      </el-row>
    </div>
    <div class="expand" v-if="haveService">
      <div class="service-info">
        <div class="title">基本信息</div>
        <el-form label-position="right" label-width="150px" size="mini">
          <el-form-item label="服务ID">
            {{model["id"]}}
          </el-form-item>
          <el-form-item label="所在集群" v-if="$storeHelper.groupVersion === 'v1'">
            {{model["k8s"] === 1 ? 'k8s' : 'mesos'}}
          </el-form-item>
          <el-form-item label="外网域名">
            <div v-if="model.internetDomainList.length==0">未绑定</div>
            <div v-if="model.internetDomainList.length==1">
              <a :href="'http://' + model.internetDomainList[0]" target="_blank">{{model.internetDomainList[0]}}</a>
            </div>
            <div v-if="model.internetDomainList.length>1">
              <a :href="'http://' + model.internetDomainList[0]" target="_blank">{{model.internetDomainList[0]}}</a>
              <el-tooltip slot="trigger" effect="light" placement="top">
                <div slot="content">
                  <div v-for="(item, index) in model.internetDomainList" v-if="index!=0">
                    <a :href="'http://' + item" target="_blank">{{item}}</a>
                  </div>
                </div>
                <span class="more"><i class="paas-icon-more"></i></span>
              </el-tooltip>
            </div>
          </el-form-item>
          <el-form-item label="内网域名">
            <a :href="'http://' + model['intranetDomain']" target="_blank"
               v-if="model['intranetDomain']">{{model['intranetDomain']}}</a>
            <span v-else>未绑定</span>
          </el-form-item>
          <el-form-item label="更新时间">
            {{this.$utils.formatDate(model["updateTime"],"yyyy-MM-dd hh:mm:ss")}}
          </el-form-item>
          <el-form-item label="namespace">
            {{applicationConfigDeployment["namespace"]}}
          </el-form-item>
          <el-form-item label="label">
            {{model["serviceName"]}}
          </el-form-item>
          <el-form-item label="开发语言">
            {{model["language"] + "-" + model["languageVersion"]}}
          </el-form-item>
          <el-form-item label="构建方式">
            {{model["packageType"] ? model["packageType"] : "未知"}}
          </el-form-item>
          <el-form-item label="服务期限" v-if="!isProductionProfile">
            {{model["remainExpiredDays"] ? model["remainExpiredDays"] + "天": "未配置"}}
          </el-form-item>
        </el-form>
      </div>
      <div class="service-info">
        <div class="title">实时信息</div>
        <el-form label-position="right" label-width="150px" size="mini">
          <el-form-item label="CPU/内存">
            {{applicationConfigDeployment["cpu"] == null || applicationConfigDeployment["memory"] == null ? "未知" : applicationConfigDeployment["cpu"] + "/" + applicationConfigDeployment["memory"]}}
          </el-form-item>
          <el-form-item label="运行实例数">
            {{applicationConfigDeployment["status"] == null ? '未知' : applicationConfigDeployment["status"]["Running"] + "/" +applicationConfigDeployment["status"]["Total"]}}
          </el-form-item>
          <el-form-item label="健康检查">
            {{applicationConfigDeployment["healthCheck"] ? applicationConfigDeployment["healthCheck"] : "未知"}}
          </el-form-item>
          <el-form-item label="健康检查等待时间">
            {{applicationConfigDeployment["initialDelaySeconds"] ? applicationConfigDeployment["initialDelaySeconds"] + "s" : "未知"}}
          </el-form-item>
          <el-form-item label="负载均衡">
            {{applicationConfigDeployment["loadBalance"] ? applicationConfigDeployment["loadBalance"] : "未知"}}
          </el-form-item>
          <el-form-item label="滚动升级">
            {{applicationConfigDeployment["rollingUpdate"] ? applicationConfigDeployment["rollingUpdate"] : "未知"}}
          </el-form-item>
          <el-form-item label="应用监控">
            {{applicationConfigDeployment["appMonitor"] ? applicationConfigDeployment["appMonitor"] : "未知"}}
          </el-form-item>
          <el-form-item label="环境变量配置">
            <div v-if="applicationConfigDeployment.environments && applicationConfigDeployment.environments.length > 0">
              <el-row>
                <el-col :span="10" style="font-weight: bold;text-align: center">Key</el-col>
                <el-col :span="10" style="font-weight: bold;text-align: center">Value</el-col>
              </el-row>
              <el-row v-for="(item, index) in applicationConfigDeployment.environments" :key="item.key">
                <el-col :span="10" style="text-align: center">
                  <div class="expand-to-next-line">{{item.key}}</div>
                </el-col>
                <el-col :span="10" style="text-align: center">
                  <div class="expand-to-next-line">{{item.value}}</div>
                </el-col>
              </el-row>
            </div>
            <div v-else>
              <span>未知</span>
            </div>
          </el-form-item>
          <el-form-item label="Host配置">
            <div v-if="applicationConfigDeployment.hosts && applicationConfigDeployment.hosts.length > 0">
              <el-row>
                <el-col :span="8" style="font-weight: bold; text-align: center">IP</el-col>
                <el-col :span="8" style="font-weight: bold; text-align: center">域名</el-col>
              </el-row>
              <el-row v-for="(item, index) in applicationConfigDeployment.hosts" :key="item.key">
                <el-col :span="8" style="text-align: center">{{item.ip}}</el-col>
                <el-col :span="8" style="text-align: center">{{item.domain}}</el-col>
                <el-col :span="2"></el-col>
              </el-row>
            </div>
            <div v-else>
              <span>未知</span>
            </div>
          </el-form-item>
          <el-form-item label="端口映射">
            <div v-if="applicationConfigDeployment.postMapped">
              <div class="el-row">
                <div class="el-col el-col-6" style="font-weight: bold; text-align: center">访问端口</div>
                <div class="el-col el-col-2" style="min-height:1px"></div>
                <div class="el-col el-col-6" style="font-weight: bold; text-align: center">目标端口</div>
                <div class="el-col el-col-2" style="font-weight: bold; text-align: center">协议</div>
                <div class="el-col el-col-2" style="font-weight: bold; text-align: center"></div>
              </div>
              <el-row class="content">
                <el-col :span="6" style="text-align: center">{{applicationConfigDeployment.postMapped.outerPort}}</el-col>
                <el-col :span="2" style="text-align: center">&ndash;&gt;</el-col>
                <el-col :span="6" style="text-align: center">{{applicationConfigDeployment.postMapped.containerPort}}</el-col>
                <el-col :span="2" style="text-align: center">TCP</el-col>
              </el-row>
            </div>
            <div v-else>
              <span>未知</span>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-else class="el-table__empty-text" style="color: #545454">暂无服务</div>
    <el-dialog title="添加外网域名" :visible="showInternetDomainDialog"
               :close-on-click-modal="false"
               class="internet-domain size-700"
               @close="showInternetDomainDialog = false"
    >
      <el-tag type="warning" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>老团队只支持添加一个外网域名（如想自助式配置外网域名和IP白名单，请联系Paas团队，进行应用迁移）</span>
      </el-tag>
      <el-form size="mini" label-width="120px" ref="changeInternetDomainForm">
        <el-form-item label="将要添加的域名" :error="props4CreateDomain.errMsgForDomainList">
          <div v-if="props4CreateDomain.domainToAdd.length > 0">
            <el-tag class="domain-to-add"
                    v-for="(item, index) in props4CreateDomain.domainToAdd"
                    :key="index"
                    closable
                    type="success"
                    size="small"
                    @close="handleDomainInDialog($event, 'remove', item)"
            >{{item}}</el-tag>
          </div>
          <div v-else>无</div>
        </el-form-item>
        <el-form-item label="外网二级域名" :error="props4CreateDomain.errMsgForDomainName">
          <el-input v-model="props4CreateDomain.prefixName" placeholder="小写字符、数字、中划线，以字符数字开头，长度不超过63位"
                    style="margin-bottom: 3px;"></el-input>
          <el-select v-model="props4CreateDomain.subDomain"
                     :placeholder="(props4CreateDomain.subDomainList && props4CreateDomain.subDomainList.length > 0) ? '请选择':'无数据'">
            <el-option v-for="(item, index) in props4CreateDomain.subDomainList" :value="item.domainName" :label="item.domainName"
                       :key="index"></el-option>
          </el-select>
          <el-button :class="['add-domain-btn', props4CreateDomain.domainToAdd.length > 0 ? 'disabled': '']"
                     size="mini-extral" type="primary" @click="handleDomainInDialog($event, 'add')">添加</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="v1UpdateInternetDomain"
                     :loading="waitingResponse">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="showInternetDomainDialog = false">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
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
    .expand {
      box-sizing: border-box;
      padding: 8px 12px;
      width: 65%;
      margin: 5px 5px;
      max-width: 900px;
      box-shadow: 0 2px 7px 0 rgba(0,0,0,.18);
      box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
      border: none;
      border-radius: 2px;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      .paas-icon {
        margin-left: 2px;
        vertical-align: middle;
        &:hover {
          font-weight: bold;
          cursor: pointer;
        }
      }
      .el-form {
        .el-form-item {
          .el-form-item__label {
            /*color: #409EFF;*/
            font-weight: bold;
          }
          &.el-form-item--mini {
            margin-bottom: 2px;
          }
          &.relativePathOfParentPOM {
            .el-form-item__label {
              /*line-height: 120%;*/
            }
          }
        }
      }
      .service-info {
        width: 50%;
        /*border-bottom: 1px solid lightgray;*/
        .el-form {
          .el-form-item {
            width: 50%;
            @include expand-inline-form-item;
            .el-form-item__content {
              margin-left: 170px;
            }
            &.file-location {
              .el-tag {
                display: inline-block;
                line-height: 26px;
                height: 26px;
              }
            }
          }
        }
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
    .expand {
      .service-info {
        .title {
          margin: 8px 0px;
          padding-left: 5px;
          border-left: 6px solid darkslategray;
          font-weight: bold;
        }
        .el-form {
          font-size: 0;
          .el-form-item {
            margin-right: 0;
            margin-bottom: 10px;
          }
        }
      }
    }
  }
</style>

<script>
  import {mapGetters} from 'vuex';
  import paasDialogForLog from '../components/dialog4log.vue'
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  import fa from "../../../../components/element-ui/src/locale/lang/fa";
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
      waitingResponse: false,
      selectedApp: null,
      selectedProfileID: null,
      selectedProfile: null,
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
      props4CreateDomain: {
        prefixName: '',
        subDomain: '',
        subDomainList: [],
        domainToAdd: [],
        // 校验规则：单个元素（语法校验）
        errMsgForDomainName: '',
        // 校验规则：域名数组（大于一个小于五个，无域名后缀）
        errMsgForDomainList: ''
      },
      showInternetDomainDialog: false,
    }
  },
  watch: {
    appInfoListOfGroup: 'onAppInfoListOfGroup',
    selectedAppID: function (appId) {
      this.recoveryStatus();
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
      console.log(this.currentProfileList);
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
      this.recoveryStatus();
      if (this.$storeHelper.SERVICE_ID_FOR_NULL === profileId) {
        return;
      }
      this.serviceInfo.profileID = profileId;
      this.selectedProfile = this.$storeHelper.getProfileInfoByID(profileId);
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

    recoveryStatus() {
      this.applicationConfigDeployment = null;
      this.showServiceInfo = false;
      this.haveService = false;
      this.model = null;
    },

    requestService(appID, profileID) {
      this.recoveryStatus();
      if (!appID || !profileID) {
        console.log('appID or profileID can not be empty');
        return;
      }
      let payload = {
        appId: appID,
        spaceId: profileID
      };
      this.$net.requestPaasServer(this.$net.URL_LIST.get_service_list_v2, {payload}).then(resContent => {
        if (resContent.hasOwnProperty("applicationConfigDeployment")) {
          this.applicationConfigDeployment = resContent["applicationConfigDeployment"];
          this.showServiceInfo = true;
        }
      });
      this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {payload}).then(resContent => {
        const content = this.$net.parseServiceList(resContent);
        if (content.hasOwnProperty("applicationServerList")) {
          this.model = content["applicationServerList"].find(it => {
            return it["defaultSelect"] === true;
          });
          if (this.model) {
            this.haveService = true;
            this.serviceInfo.serviceID = this.model.id;
          }
        }
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
      if (!this.haveService) {
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

    warningConfirm(content) {
      return new Promise((resolve, reject) => {
        this.$confirm(content, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          resolve();
        }).catch(() => {
          reject()
        });
      });
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
      let desc = `应用"${this.selectedApp.appName}:${description}"的服务`;
      return desc;
    },

    // some init action for domain props
    initDomainProps() {
      this.props4CreateDomain.domainToAdd = [];
      this.props4CreateDomain.prefixName = '';
      this.props4CreateDomain.subDomain = '';
      this.props4CreateDomain.errMsgForDomainName = '';
      this.props4CreateDomain.errMsgForDomainList = '';
    },

    handleDomainInDialog(evt, action, domainItem) {
      const domainToAdd = this.props4CreateDomain.domainToAdd;
      switch (action) {
        case 'remove':
          if (domainToAdd.indexOf(domainItem) > -1) {
            domainToAdd.splice(domainToAdd.indexOf(domainItem), 1);
          }
          break;
        case 'add':
          if (this.props4CreateDomain.domainToAdd.length > 0) {
            this.$storeHelper.globalPopover.show({
              ref: evt.target,
              msg: '只支持添加一个外网域名'
            });
            return;
          }
          this.props4CreateDomain.prefixName = this.props4CreateDomain.prefixName.trim();

          this.props4CreateDomain.errMsgForDomainName = '';
          this.props4CreateDomain.errMsgForDomainList = '';

          if (this.props4CreateDomain.subDomainList.length === 0) {
            this.props4CreateDomain.errMsgForDomainName = '当前运行环境，域名后缀列表为空，无法创建。请联系Paas团队。';
            return;
          }
          if (!/^[a-z0-9][a-z0-9\-]{0,62}$/.exec(this.props4CreateDomain.prefixName)) {
            this.props4CreateDomain.errMsgForDomainName = '可以包含小写字符、数字、中划线，以字符数字开头，长度不超过63位';
            return;
          }
//          if (domainToAdd.length >= 5) {
//            this.props4CreateDomain.errMsgForDomainList = '每次最多添加五个';
//            return;
//          }


          const domain = this.props4CreateDomain.prefixName + '.' + this.props4CreateDomain.subDomain;
//          let item = null;
//          domainToAdd.some(it => {
//            if (it === domain) {
//              item = it;
//            }
//            return item
//          });
//          if (item) {
//            this.props4CreateDomain.errMsgForDomainName = `域名${domain}已经存在！`
//            return;
//          }
          domainToAdd.push(domain);
          this.props4CreateDomain.prefixName = '';
          break;
      }
    },

    v1UpdateInternetDomain() {
      this.waitingResponse = true;
      this.addToWaitingResponseQueue("update-internet-domain");
      if (this.props4CreateDomain.domainToAdd.length === 0) {
        this.props4CreateDomain.errMsgForDomainList = '至少添加一个域名！';
        return;
      }
      let options = {
        appId: this.serviceInfo.appID,
        spaceId: this.serviceInfo.profileID,
        id: this.serviceInfo.serviceID,
      };
      options['outerDomain'] = this.props4CreateDomain.domainToAdd[0];
      this.$net.serviceUpdate('internetDomain', options).then(msg => {
        this.$message({
          type: 'success',
          message: msg
        });
        // 只在更新成功后关闭弹框
        this.showInternetDomainDialog = false;
        this.requestService(this.selectedAppID,this.selectedProfileID);
      }).catch(errMsg => {
        this.$net.showError({
          title: '修改失败',
          message: errMsg
        })
      }).finally(() => {
        this.waitingResponse = false;
        this.hideWaitingResponse("update-internet-domain");
      });
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
        case 'service_create' :
          this.goToAddServicePage();
          break;
        case 'service_edit' :
          this.goToAddServicePage();
          break;
        case 'service_deploy':
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
        case 'quick_deploy':
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
        case 'service_stop':
          this.addToWaitingResponseQueue(action);
          var desc = this.getVersionDescription();
          this.$confirm(`停止将会导致${desc}不可用，但不会删除代码及配置信息，你确定需要这么做吗?`).then(() => {
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
        case 'service_delete':
          this.addToWaitingResponseQueue(action);
          var desc = this.getVersionDescription();
          this.warningConfirm(`删除服务将会销毁${desc}的代码和配置信息，同时自动解绑外网二级域名，删除后服务数据不可恢复。`).then(() => {
            this.warningConfirm(`你确认要删除${desc}，并清除该服务的一切数据？`).then(() => {
              this.$net.serviceDelete({
                id: this.serviceInfo.serviceID,
                appId: this.serviceInfo.appID,
                spaceId: this.serviceInfo.profileID,
              }).then(msg => {
                this.hideWaitingResponse(action);
                this.$message({
                  type: 'success',
                  message: msg
                });
                this.$net.needUpdateAppList = true;
                this.requestService(this.serviceInfo.appID, this.serviceInfo.profileID);
              }).catch(err => {
                this.hideWaitingResponse(action);
                this.$notify.error({
                  title: '提示',
                  message: err,
                  duration: 0,
                  onClose: function () {
                  }
                });
              });
            }).catch(() => {
              this.hideWaitingResponse(action);
            });
          }).catch(()=> {
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
        case 'v1-add-internetDomain':
          if (this.model.internetDomainList.length > 0) {
            this.$storeHelper.globalPopover.show({
              ref: evt.target,
              msg: "老团队只支持添加一个外网域名（如想自助式配置外网域名和IP白名单，请联系Paas团队，进行应用迁移）"
            });
            break;
          }
          this.showInternetDomainDialog = true;
          const subDomainListByProfile = await this.$store.dispatch('app/getSubDomainByProfile', {
            net: this.$net,
            urlDesc: this.$net.URL_LIST.domain_level_1_list_all,
            payload: {groupId: this.$storeHelper.currentGroupID}
          });
          this.initDomainProps();
          if (subDomainListByProfile.hasOwnProperty(this.selectedProfile.name)) {
            this.props4CreateDomain.subDomainList = subDomainListByProfile[this.selectedProfile.name];
            this.props4CreateDomain.subDomain = this.props4CreateDomain.subDomainList[0]['domainName'];
          } else {
            this.props4CreateDomain.subDomainList = [];
          }
          break;
      }
    }
  }
}
</script>
