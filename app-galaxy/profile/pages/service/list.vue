<template>
  <div id="service-list">
    <div class="header">
      <el-tabs type="border-tab" v-model="profileName">
        <el-tab-pane v-for="item in $storeHelper.profileListOfGroup" :label="item.description" :name="item.name"
                     :key="item.id"></el-tab-pane>
      </el-tabs>
      <div class="operation">
        <el-button
                v-if="false"
                size="mini"
                type="primary"
                @click="handleButtonClick($event, 'service_create')"
                :class="['flex', $storeHelper.permission['service_create'].disabled || this.appIdWithoutService.length === 0 ? 'disabled' : '']">
          <span>创建服务</span><i class="paas-icon-level-up"></i>
        </el-button>
        <el-button size="mini"
                   type="primary"
                   @click="handleButtonClick($event, 'refresh-list')">
          <span>刷新列表</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
        </el-button>
        <el-input
                size="mini"
                style="max-width: 300px"
                placeholder="按关键字搜索服务"
                suffix-icon="el-icon-search"
                v-model="filterKey">
        </el-input>
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
            <div class="version" v-if="">{{scope.row.language.version ? scope.row.language.version : '版本未知'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="应用名称" headerAlign="left" align="left" minWidth="100">
          <template slot-scope="scope">
            <span>{{scope.row.appName}}</span>
            <span v-if="$storeHelper.groupVersion === 'v1'"
                  style="display: inline; color: #909399; font-size: 12px; line-height: 14px; cursor: pointer; padding: 1px; border: 1px solid #909399; border-radius: 4px; word-break: normal"
                  @mouseenter="handleTRClick($event, 'k8s-tag', scope.$index, scope.row)"
            >{{scope.row.k8s === 1 ? 'k8s':'mesos'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目名称" prop="tag" headerAlign="left" align="left" minWidth="100"></el-table-column>
        <el-table-column label="二级域名" prop="serviceName" headerAlign="left" align="left" minWidth="100"></el-table-column>
        <el-table-column
                prop="applicationServiceStatus"
                label="运行实例数/总实例数"
                width="160"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            {{scope.row.k8s === 1 ? scope.row.instanceCount : '---' }}
          </template>
        </el-table-column>
        <el-table-column v-if="!isProductionProfile" label="过期时间(天)" prop="remainExpiredDays" headerAlign="center" align="center" width="100">
        </el-table-column>
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
        <el-table-column label="操作" headerAlign="left" align="left" minWidth="200">
          <template slot-scope="scope">
            <div v-if="scope.row.id" style="line-height: 20px;">
              <el-button
                      v-if="!isProductionProfile"
                      size="small"
                      type="text"
                      :loading="statusOfWaitingResponse('service_deploy') && action.row.appId == scope.row.appId"
                      @click="confirmDeploy($event, 'service_deploy', scope.$index, scope.row)"
                      :class="$storeHelper.permission['service_deploy'].disabled ? 'disabled' : 'danger'">
                    {{statusOfWaitingResponse('deploy') && action.row.appId == scope.row.appId ? '部署中': '部署'}}
              </el-button>
              <div v-if="!isProductionProfile"
                   class="ant-divider"></div>
              <el-button
                      v-if="!isProductionProfile"
                      size="small"
                      type="text"
                      :loading="statusOfWaitingResponse('quick_deploy') && action.row.appId == scope.row.appId"
                      @click="handleTRClick($event, 'quick_deploy', scope.$index, scope.row)"
                      :class="reason4DisableQuickDeploy(scope.row) ? 'disabled' : 'danger'">
                    {{statusOfWaitingResponse('quick_deploy') && action.row.appId == scope.row.appId ? '重启中': '重启'}}
              </el-button>
              <div v-if="!isProductionProfile"
                   class="ant-divider"></div>
              <el-button
                      size="small"
                      type="text"
                      :loading="statusOfWaitingResponse('service_stop') && action.row.appId == scope.row.appId"
                      @click="handleTRClick($event, 'service_stop', scope.$index, scope.row)"
                      :class="$storeHelper.permission['service_stop'].disabled || scope.row.containerStatus.Total == 0 ? 'disabled' : 'danger'">
                停止
              </el-button>
              <div class="ant-divider"></div>
              <el-button
                      size="small"
                      type="text"
                      :loading="statusOfWaitingResponse('service_delete') && action.row.appId == scope.row.appId"
                      @click="handleTRClick($event, 'service_delete', scope.$index, scope.row)"
                      :class="$storeHelper.permission['service_delete'].disabled ? 'disabled' : 'danger'">
                删除
              </el-button>
              <div class="ant-divider"></div>
              <el-button
                      type="text"
                      :class="['primary', 'flex']"
                      @click="handleTRClick($event, 'service_config_modify', scope.$index, scope.row)">
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
                      v-if="$storeHelper.groupVersion === 'v2'"
                      size="small"
                      type="text"
                      @click="handleTRClick($event, 'go-page-domain-from-service', scope.$index, scope.row)"
                      :class="$storeHelper.permission['go-page-domain-from-service'].disabled ? 'disabled' : 'primary'">
                <span>配置外网二级域名</span><i class="paas-icon-level-up"></i>
              </el-button>
              <el-button
                      v-if="false"
                      size="small"
                      type="text"
                      @click="handleTRClick($event, 'v1-add-internetDomain', scope.$index, scope.row)"
                      :class="['primary']">
                <span>添加外网域名</span>
              </el-button>
            </div>
            <el-button
                    v-else
                    size="small"
                    type="text"
                    :loading="statusOfWaitingResponse('service_config_add') && action.row.appId == scope.row.appId"
                    :class="['flex', $storeHelper.permission['service_create'].disabled ? 'disabled' : 'warning']"
                    @click="handleTRClick($event, 'service_config_add', scope.$index, scope.row)">
              <span>创建服务</span><i class="paas-icon-level-up"></i>
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
                  @current-change="page => {currentPage = page}"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <!--为v1团队添加外网域名-->
    <el-dialog title="添加外网域名" :visible="action.name == 'v1-add-internetDomain'"
               :close-on-click-modal="false"
               class="internet-domain size-700"
               @close="action.name = null"
               v-if="action.name && action.row"
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
                     @click="action.name = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="提示" :visible="showConfirmDeployDialog"
               class="confirm-deploy"
               width="600px"
               :close-on-click-modal="false"
               @close="showConfirmDeployDialog = false"
    >
      <div class="el-message-box__status el-icon-warning" style="padding-bottom: 27px;"></div>
      <div class="el-message-box__message">
        <p>您确认要部署{{serviceDesc}}吗?</p>
        <el-checkbox v-model="forceClone">强制清空打包目录（删除所有源代码、包文件等）</el-checkbox>
      </div>

      <span slot="footer" class="el-message-box__btns">
        <el-button type="primary"
                   @click="handleDeployClick()"
                   :loading="waitingResponse">确&nbsp认</el-button>
        <el-button action="profile-dialog/cancel"
                   @click="showConfirmDeployDialog = false">取&nbsp消</el-button>
      </span>
    </el-dialog>

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
            border-color: $g-env-fpdev-color;
            color: $g-env-fpdev-color;
          }
          #tab-test.is-active {
            border-color: $g-env-test-color;
            color: $g-env-test-color;
          }
          #tab-performance.is-active {
            border-color: $g-env-performance-color;
            color: $g-env-performance-color;
          }
          #tab-beta.is-active {
            border-color: $g-env-beta-color;
            color: $g-env-beta-color;
          }
          #tab-production.is-active {
            border-color: $g-env-production-color;
            color: $g-env-production-color;
          }
          #tab-staging.is-active {
            border-color: $g-env-staging-color;
            color: $g-env-staging-color;
          }

          >.el-tabs__header {
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
        padding: 3px 5px 3px 5px;
        text-align: right;
        /*flex: 1;*/
        /*display: inline-flex;*/
        /*align-items: center;*/
        /*border-top: 1px solid #dfe4ed;*/
        .el-button, el-input {
          margin: 0px 5px;
        }
      }
    }
    > .list {
      .el-table {
        td {
          padding: 0px 3px;
        }
        .version {
          font-size: 14px;
          line-height: 16px;
        }
      }

    }
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
    > .confirm-deploy {
      .el-dialog {
        display: inline-block;
        vertical-align: middle;
        background-color: #fff;
        border-radius: 4px;
        border: 1px solid #e6ebf5;
        font-size: 18px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        text-align: left;
        overflow: hidden;
        backface-visibility: hidden;
        box-sizing: border-box;
        top: 24vh;
      }
      .el-dialog__header {
        position: relative;
        padding: 15px 15px 5px;
        background-color: #fff;
        .el-dialog__title {
          padding-left: 0;
          margin-bottom: 0;
          font-size: 18px;
          line-height: 1;
          color: #2d2f33;
         }
      }
      .el-dialog__body {
        position: relative;
        padding: 10px 15px;
        color: #5a5e66;
        font-size: 14px;
      }
      .el-dialog__footer {
        border-top: none;
        margin-top: 0;
      }
    }
  }
</style>
<script>
  import {mapGetters} from 'vuex';
  import commonUtils from 'assets/components/mixins/common-utils';
  import paasDialogForLog from '../components/dialog4log.vue';
  export default {
    components: {paasDialogForLog},
    mixins: [commonUtils],
    created() {
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
//        console.log(dataTransfer);
        const from = dataTransfer.from;
        this.dataPassed.from = from;
        /**
         * dataTransfer.to is used to set profileName and currentPage
         * this.profileName is set on function mounted
         * currentPage is get by getPageStatePassed
         * @type {*}
         */
        this.dataPassed.to = dataTransfer.to;
        this.$storeHelper.dataTransfer = null;
      }
    },
    mounted() {
      // NOTICE: getServiceListByPage will be called by change of profileName, which is changed onProfileList,
      // so this.getServiceListByPage(); is no need
      this.onProfileList(this.$storeHelper.profileListOfGroup);
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
      if (false) {
        const profileInfoPassed = this.getPageStatePassed('profileInfo');
        if (profileInfoPassed) {
          this.profileName = profileInfoPassed['name'];
        }
      }

    },
    computed: {
      ...mapGetters('user', {
        'userConfig': 'config'
      }),
    },
    watch: {
      '$storeHelper.currentGroupID': function (value, oldValue) {
        this.getServiceListByPage({
          refresh: true,
          currentPage: 1
        });
      },
      'currentPage': function (page) {
//        console.log(this.$route);
//        console.log(this.$route.path);
//        console.log(this.$route.query);
//        this.$route.query['page'] = page;
//        location.search = `?page=${page}`;
        this.getServiceListByPage({});
        this.$store.dispatch('user/config', {
          page: 'service',
          data: {
            currentPage: page
          }
        });
      },
      'filterKey': function () {
        this.getServiceListByPage({
          currentPage: 1
        });
      },
      // changed by el-tab
      profileName(profileName) {
//        console.log(`change profileName to ${profileName}`);
        var target = null;
        this.$storeHelper.profileListOfGroup.some(it => {
          if (it.name === profileName) {
            target = it;
          }
        });
        if (target) {
          this.profileInfo = target;
          this.isProductionProfile = target.spaceType.toUpperCase() === 'PRODUCTION';
        }
//        console.log(this.localPageState);
        var currentPage = 1; // this.getPageStatePassed('currentPage');
        // used only once
        if (this.localPageState.currentPage != 1) {
          currentPage = this.localPageState.currentPage;
          this.localPageState.currentPage = 1;
        }
        this.getServiceListByPage({
          refresh: true,
          currentPage
        });
        this.$store.dispatch('user/config', {
          page: 'service',
          data: {
            profileName
          }
        });
      },
      '$storeHelper.screen.size': 'onScreenSizeChange',
      '$storeHelper.profileListOfGroup': 'onProfileList',
      '$storeHelper.appInfoListOfGroup': function() {
        this.getAppWithoutService();
      },
    },
    data() {
      return {
        dataPassed: {
          from: null,
          to: null
        },
        // TODO: for change internetDomain, will change later
        waitingResponse: false,
        heightOfTable: '',

        filterKey: '',
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
        localPageState: {
          profileName: null,
          profileInfo: null,
          currentPage: 1
        },

        action: {
          evt: null,
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
        showConfirmDeployDialog: false,
        forceClone: false,
        serviceDesc: '',
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
          this.heightOfTable = this.$el.clientHeight - headerHeight;
        } catch(err) {
        }
      },
      onProfileList(profileList) {
        if (!Array.isArray(profileList) || profileList.length === 0) {
          console.log('error: onProfileList');
          return;
        }
        // default profileInfo
        var profileInfo = profileList[0];
        this.getPageStateLocal(profileList);
        if (this.localPageState['profileInfo']) {
          profileInfo = this.localPageState['profileInfo'];
        }
        this.profileInfo = profileInfo;
        this.profileName = profileInfo['name'];
      },
      handleButtonClick(evt, action) {
        if (action === 'service_create' && this.appIdWithoutService.length === 0) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: '当前环境下，没有可以创建的服务'
          });
          return;
        }
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        switch (action) {
          case 'service_create':
            this.goToPageServiceAdd('service_create');
            break;
          case 'refresh-list':
            this.getServiceListByPage({
              refresh: true,
              currentPage: 1
            });
            break;
        }
      },

      // TODO: not used
      // 需要传递到其它页面的本地页面信息
      getPageStateToTransfer(action) {
        return {
          path: this.$net.page['profile/service'],
          action,
          page: this.currentPage,
          profileInfo: this.profileInfo
        }
      },
      // TODO: not used
      // used prop of  dataPassed.to only once
      getPageStatePassed(prop) {
//        console.log(this.dataPassed.to);
        var value = {
          currentPage: 1,
          profileInfo: null,
        }[prop];
        if (this.dataPassed.to && this.dataPassed.to[prop]) {
          value = this.dataPassed.to[prop];
          this.dataPassed.to[prop] = null;
        }
        return value;
      },
      // page state from localStorage
      getPageStateLocal(profileList) {
        const serviceConfig = this.userConfig['service'];
        var localProfileInfo = null;
        if (serviceConfig && serviceConfig.profileName) {
          localProfileInfo = profileList.find(it => {
            return it.name == serviceConfig['profileName'];
          })
        }
        if (localProfileInfo) {
          this.localPageState['profileInfo'] = localProfileInfo;
          this.localPageState['profileName'] = localProfileInfo['name'];
        }
        const currentPage = serviceConfig['currentPage'];
        if (currentPage) {
          this.localPageState.currentPage = currentPage;
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

      async goToPageServiceAdd(action, row) {
        const basicInfo = {
          profileInfo: this.profileInfo
        };
        switch (action) {
          case 'service_create':
            this.appWithoutService = this.getAppWithoutService();
            this.$storeHelper.dataTransfer = {
              from: this.getPageStateToTransfer(action),
              data: Object.assign(basicInfo, {
                appWithoutService: this.appWithoutService,
              })
            };
            this.$router.push(this.$net.page['profile/service/add']);
            break;
          case 'service_config_add':
            this.$storeHelper.dataTransfer = {
              from: this.getPageStateToTransfer(action),
              data: Object.assign(basicInfo, {
                serviceBasicInfo: row
              })
            };
            this.$router.push(this.$net.page['profile/service/add']);
            break;
          case 'service_config_modify':
            const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {
              payload: {
                appId: row.appId,
                spaceId: this.profileInfo.id
              }
            });
            const parsedContent = this.$net.parseServiceList(resContent);

            var model = null;
            if (parsedContent.hasOwnProperty("serviceModelList")) {
              model = parsedContent["serviceModelList"].find(it => {
                return it["defaultSelect"] === true;
              });
            }
           // console.log(resContent);
           // console.log(parsedContent);
           // console.log(model);
            if (model) {
              this.$storeHelper.dataTransfer = {
                from: {
                  path: this.$net.page['profile/service'],
                  action,
                  page: this.currentPage,
                  profileInfo: this.profileInfo
                },
                data: Object.assign(basicInfo, {
                  serviceInfo: model
                })
              };
              this.$router.push(this.$net.page['profile/service/modify']);
            } else {
              return;
            }
            break;
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
        this.serviceDesc = desc;
        // var warningMsg = `您确认要部署${desc}吗?`;
        if (type == 'quick_deploy') {
          let warningMsg = `<p>您确认要重启${desc}吗?</p><p style="color: #E6A23C; font-size: 12px;">(重启：采用最近一次部署成功的镜像进行服务的重新启动，跳过代码编译、镜像生成阶段)</p>`;
          // await this.warningConfirm(warningMsg);
          await this.$confirm(warningMsg, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          });
        }

        const urlDesc = type == 'quick_deploy' ? this.$net.URL_LIST.service_quick_deploy : this.$net.URL_LIST.service_deploy;
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

      confirmDeploy(evt, action, index, row) {
        this.showConfirmDeployDialog = true;
        this.action.evt = evt;
        this.action.name = action;
        this.action.row = row;
        this.serviceDesc = this.getVersionDescription();
      },

      handleDeployClick() {
        this.handleTRClick(this.action.evt, this.action.name, this.action.row.index, this.action.row);
        this.showConfirmDeployDialog = false;
      },

      async handleTRClick(evt, action, index, row) {
        var permission = action;
        if (action == 'service_config_add') {
          permission = 'service_create';
        }
        if (action === 'service_stop' && row.containerStatus.Total == 0) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: `当前运行实例数为0，不能进行停止操作`
          });
          return;
        }
        if (this.$storeHelper.permission.hasOwnProperty(permission) && this.$storeHelper.permission[permission].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[permission].reason
          });
          return;
        }
        if (action === 'k8s-tag') {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: `这是一个${row.k8s === 1 ? 'k8s':'mesos'}服务`
          });
          return;
        }
        this.action.name = action;
        this.action.row = row;
        var resContent = null;
        switch (action) {
          case 'service_config_add':
            this.goToPageServiceAdd(action, row);
            break;
          case 'service_config_modify':
            this.goToPageServiceAdd(action, row);
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
//              from: this.getPageStateToTransfer(action),
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
                forceClone: this.forceClone,
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
              this.getServiceListByPage({
                refresh: true
              });
            } catch (err) {
              console.log(err);
              this.hideWaitingResponse(action);
            }
            break;
          case 'v1-add-internetDomain':
            // 兼容v1，为v1团队添加外网域名
//            if (this.model.internetDomainList.length > 0) {
//              this.$storeHelper.globalPopover.show({
//                ref: evt.target,
//                msg: "老团队只支持添加一个外网域名（如想自助式配置外网域名和IP白名单，请联系Paas团队，进行应用迁移）"
//              });
//              break;
//            }
            const subDomainListByProfile = await this.$store.dispatch('app/getSubDomainByProfile', {
              net: this.$net,
              urlDesc: this.$net.URL_LIST.domain_level_1_list_all,
              payload: {groupId: this.$storeHelper.currentGroupID}
            });
//            console.log(subDomainListByProfile);
            this.props4CreateDomain.domainToAdd = [];
            this.props4CreateDomain.prefixName = '';
            this.props4CreateDomain.subDomain = '';
            this.props4CreateDomain.errMsgForDomainName = '';
            this.props4CreateDomain.errMsgForDomainList = '';
            if (subDomainListByProfile.hasOwnProperty(this.profileInfo.name)) {
              this.props4CreateDomain.subDomainList = subDomainListByProfile[this.profileInfo.name];
              this.props4CreateDomain.subDomain = this.props4CreateDomain.subDomainList[0]['domainName'];
            } else {
              this.props4CreateDomain.subDomainList = [];
            }
            break;
        }
      },

      // TODO: for change internetDomain
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
        const row = this.action.row;
        let options = {
          id: row.id,
          appId: row.appId,
          spaceId: this.profileInfo.id,
        };
        options['outerDomain'] = this.props4CreateDomain.domainToAdd[0];
        this.$net.serviceUpdate('internetDomain', options).then(msg => {
          this.$message({
            type: 'success',
            message: msg
          });
          // 只在更新成功后关闭弹框
          this.showInternetDomainDialog = false;
          this.requestServiceInfo(this.selectedAppID,this.selectedProfileID);
        }).catch(errMsg => {
//          this.$net.showError({
//            title: '修改失败',
//            message: errMsg
//          })
        }).finally(() => {
          this.waitingResponse = false;
          this.hideWaitingResponse("update-internet-domain");
        });
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

      /**
       * request service list from server
       * only called by getServiceListByPage
       */
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
        this.totalSize = parsedResContent.total;

        this.appIdWithoutService = [];
        if (parsedResContent.hasOwnProperty('tobeInsertList')) {
          this.appIdWithoutService = parsedResContent['tobeInsertList'];
          this.appWithoutService = this.getAppWithoutService();
        }
//        console.log(parsedResContent);
      },

      /**
       * 获取分页的服务列表
       * @param refresh, request service list from server or not
       * @param currentPage, set currentPage by code
       */
      async getServiceListByPage({refresh = false, currentPage = null}) {
        if (refresh) {
          await this.requestServiceList();
        }
        if (currentPage) {
          this.currentPage = currentPage;
        }
        // check currentPage after item delete
        const maxPageSize = Math.ceil(this.totalSize / this.pageSize);
        if (this.currentPage > maxPageSize) {
          this.currentPage = maxPageSize;
        }

        var page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;

        var filterReg = null;
        if (this.filterKey) {
          filterReg = new RegExp(this.filterKey);
        }
        const filteredServiceList = this.serviceList.filter(it => {
          var result = true;

          if (filterReg) {
            const searchField = `${it.appName}${it.serviceName}${it.tag}`;
            result = filterReg.exec(searchField);
          }
          return result;
        });
        this.totalSize = filteredServiceList.length;
        this.serviceListByPage = filteredServiceList.slice(start, end);
      },
    }
  }
</script>