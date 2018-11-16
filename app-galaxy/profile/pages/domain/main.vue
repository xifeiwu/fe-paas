<template>
  <div id="domain-main">
    <div class="header">
      <div class="row selector">
        <my-version-condition-filter
                ref="version-condition-filter"
                :addItemAll="{app:true, profile:true, service: true}"
                :customConfig="localServiceConfig"
                @service-condition-changed="onServiceConditionChanged"></my-version-condition-filter>
        <el-input
                size="mini"
                style="max-width: 200px"
                placeholder="按关键字搜索外网二级域名"
                suffix-icon="el-icon-search"
                v-model="keyword">
        </el-input>
      </div>
      <div class="row operation">
        <el-button
                size="mini-extral"
                type="primary"
                :class="{'disabled': $storeHelper.permission['domain_add'].disabled}"
                :loading="statusOfWaitingResponse('domain_add')"
                @click="handleButtonClick($event, 'domain_add')">
          申请外网二级域名
        </el-button>
        <el-button
                size="mini-extral"
                type="warning"
                :class="{'disabled': $storeHelper.permission['domain_bind_service'].disabled}"
                @click="handleButtonClick($event, 'domain_bind_service')"
        >绑定服务
        </el-button>
        <el-button
                size="mini-extral"
                type="warning"
                :class="{'disabled': $storeHelper.permission['domain_unbind_service'].disabled}"
                @click="handleButtonClick($event, 'domain_unbind_service')">解绑服务
        </el-button>

        <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
          <div slot="content">
            <div>1. 已绑定的域名需要先进行解绑，才可绑定新的服务</div>
            <div>2. 点击"绑定服务"和"解绑服务"按钮前，需要选择要操作的外网域名</div>
            <div>3. 绑定服务时，运行环境不能选择"全部"</div>
          </div>
          <span class="helper-text-tool-tip" style="margin-top: 1px">域名处理逻辑<i class="el-icon-question"></i></span>
        </el-tooltip>
      </div>
    </div>
    <div class="domain-list">
      <el-table
              :data="currentDomainList"
              style="width: 100%"
              :height="heightOfTable"
              v-loading="showLoading"
              element-loading-text="加载中"
              @selection-change="handleSelectionChangeInTable"
      >
        <el-table-column
                type="selection"
                width="36">
        </el-table-column>
        <el-table-column
                prop="internetDomain"
                label="外网二级域名">
        </el-table-column>
        <el-table-column
                prop="profileDesc"
                width="100"
                label="运行环境">
        </el-table-column>
        <el-table-column
                prop="createTime"
                label="创建时间"
                width="180">
        </el-table-column>
        <el-table-column
                prop="creatorName"
                label="创建人"
                width="120">
        </el-table-column>
        <el-table-column
                prop="status"
                label="状态"
        >
          <template slot-scope="scope">
            <span>{{scope.row.status}}</span>
            <span v-if="scope.row.reason" style="color: #00f; cursor: pointer"
                  @click="handleRowButtonClick($event, 're-secure-check-in-dialog', scope.$index, scope.row)">原因</span>
          </template>
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="260"
        >
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :class="$storeHelper.permission['domain_secure_check'].disabled ? 'disabled' : 'warning'"
                    @click="handleRowButtonClick($event, 'domain_secure_check', scope.$index, scope.row)">
              安全审核
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="$storeHelper.permission['domain_remove'].disabled ? 'disabled' : 'danger'"
                    :loading="statusOfWaitingResponse('domain_remove') && selected.row.id === scope.row.id"
                    @click="handleRowButtonClick($event, 'domain_remove', scope.$index, scope.row)">删除
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['domain_bind_white_list'].disabled ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'domain_bind_white_list', scope.$index, scope.row)">
              <span>关联IP白名单</span><i class="paas-icon-level-up"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize" :class="{'disable': showLoading}">
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

    <el-dialog :title="props4CreateDomain.showResponse?'创建外网域名结果':'申请外网二级域名'" :visible="selected.action == 'add-domain'"
               :class="{'add-domain': true, 'size-700': true, 'show-response': props4CreateDomain.showResponse}"
               :close-on-click-modal="false"
               @close="handleClickInDialog('close-domain-in-dialog')"
    >
      <div v-if="props4CreateDomain.showResponse">
        <div class="title">
          <div class="key">外网域名</div>
          <div class="value">添加状态</div>
        </div>
        <div class="item" v-for="(value, key) in props4CreateDomain.serverResponse">
          <div class="key">{{key}}</div>
          <div class="value">{{value}}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center" v-if="props4CreateDomain.showResponse">
        <el-button type="primary"
                   @click="handleClickInDialog('close-domain-in-dialog')">确&nbsp定</el-button>
      </div>

      <el-form :model="props4CreateDomain" :rules="rules" size="mini" v-if="!props4CreateDomain.showResponse"
               label-width="120px" ref="newDomainForm">
        <el-form-item label="运行环境">
          <el-select v-model="props4CreateDomain.profileName" placeholder="请选择">
            <el-option v-for="item in $storeHelper.profileListOfGroup" :key="item.name" :label="item.description" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="将要添加的域名" class="has-existed" :error="props4CreateDomain.errMsgForDomainToAdd">
          <div v-if="props4CreateDomain.domainToAdd.length > 0">
            <el-tag
                    v-for="(item, index) in props4CreateDomain.domainToAdd"
                    :key="index"
                    closable
                    type="success"
                    size="small"
                    @close="handleDomainInDialog('remove', item)"
            >{{item.domain}}</el-tag>
          </div>
          <div v-else>无</div>
        </el-form-item>
        <el-form-item label="外网二级域名" :error="props4CreateDomain.errMsgForLevel2Name">
          <el-input v-model="props4CreateDomain.level2Name" placeholder="小写字符、数字、中划线，以字符数字开头，长度不超过63位"></el-input>
          <el-select v-model="props4CreateDomain.level1Name">
            <el-option v-for="(item, index) in props4CreateDomain.level1InfoList" :value="item.domainName" :label="item.domainName"
                       :key="index"></el-option>
          </el-select>
          <el-button class="add-domain-btn" size="mini-extral" type="primary" @click="handleDomainInDialog('add')">添加</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex" v-if="!props4CreateDomain.showResponse">
        <div class="item">
          <el-button
                  type="primary"
                  @click="handleClickInDialog('add-domain-in-dialog')"
                  :loading="statusOfWaitingResponse('add-domain-in-dialog')">保&nbsp存</el-button></div>
        <div class="item">
          <el-button @click="handleClickInDialog('close-domain-in-dialog')">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="绑定服务" :visible="selected.action == 'bind-service'"
               :class="{'bind-service': true, 'size-800': true, 'show-response': bindServiceProps.showResponse}"
               :close-on-click-modal="false"
               @close="selected.action = null"
    >
      <div v-if="bindServiceProps.showResponse">
        <div class="title">
          <div class="key">外网域名</div>
          <div class="value">绑定状态</div>
        </div>
        <div class="item" v-for="(value, key) in bindServiceProps.serverResponse">
          <div class="key">{{key}}</div>
          <div class="value">{{value}}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center" v-if="bindServiceProps.showResponse">
        <el-button type="primary"
                   @click="handleClickInDialog('close-bind-service-in-dialog')">确&nbsp定</el-button>
      </div>

      <div v-if="!bindServiceProps.showResponse">
        <my-version-condition-filter ref="version-selector-in-bind-service-dialog"
                                     :fixedInfo="fixedInfoForVersionCondition"
                                     :addItemAll="{service: true}"
                                     @service-condition-changed="handleConditionChangeInDialog"
        >
        </my-version-condition-filter>
        <el-form labelWidth="90px" class="selected-domain">
          <el-form-item label="所选外网域名">
            <el-tag
                    v-for="(item, index) in rowsSelected"
                    :key="index"
                    type="success"
                    size="small"
            >{{item['internetDomain']}}</el-tag>
          </el-form-item>
        </el-form>
        <div class="helper-text-expanded" style="margin-top: 3px;">
          <div>
            <div style="font-weight: bold">提示 <i class="el-icon-warning"></i></div>
            <div>{{bindServiceProps.bindTipForApp}}</div>
          </div>
          <br>
          <div class="title">域名绑定服务规则<i class="el-icon-question"></i></div>
          <div class="item">1. 所选版本为全部时，所选域名会作为该应用的全局域名，指向应用的默认服务版本。</div>
          <div class="item">2. 所选版本为特定版本时，所选域名只会绑定到所选服务版本上。</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" v-if="!bindServiceProps.showResponse">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleClickInDialog('bind-service-in-dialog')"
                       :loading="statusOfWaitingResponse('bind-service-in-dialog')">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="selected.action = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="解绑服务" :visible="selected.action == 'unbind-service'"
               :class="{'unbind-service': true, 'size-750': true, 'show-response': unBindServiceProps.showResponse}"
               :close-on-click-modal="false"
               @close="selected.action = null"
    >
      <div v-if="unBindServiceProps.showResponse">
        <div class="title">
          <div class="key">外网域名</div>
          <div class="value">绑定状态</div>
        </div>
        <div class="item" v-for="(value, key) in unBindServiceProps.serverResponse">
          <div class="key">{{key}}</div>
          <div class="value">{{value}}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center" v-if="unBindServiceProps.showResponse">
        <el-button type="primary"
                   @click="handleClickInDialog('close-unbind-service-in-dialog')">确&nbsp定</el-button>
      </div>

      <div class="selected-domain" v-if="!unBindServiceProps.showResponse">
        <span>解绑域名</span>
        <span
                v-for="(item, index) in rowsSelected"
                :key="index"
                type="success"
                size="small"
        >{{'"' + item['internetDomain'] + '"，'}}</span>
        <span>将导致外网二级域名与服务分离，你确定需要这么做吗？</span>
      </div>
      <div slot="footer" class="dialog-footer" v-if="!unBindServiceProps.showResponse">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleClickInDialog('unbind-service-in-dialog')"
                       :loading="statusOfWaitingResponse('unbind-service-in-dialog')">确&nbsp定</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="selected.action = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="安全审核" :visible="selected.action == 'domain_secure_check'"
               :class="{'domain_secure_check': true, 'size-650': true,}"
               :close-on-click-modal="false"
               @close="selected.action = null"
    >
      <el-form labelWidth="120px" size="mini">
        <el-form-item label="审核意见：" class="custom-image">
          <el-radio-group v-model="secureCheckProps.passed" size="mini" class="passed">
            <el-radio :label="true">审核通过</el-radio>
            <el-radio :label="false">审核不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="不通过理由：" :error="secureCheckProps.tip" class="reason"
        >
          <el-input v-model="secureCheckProps.reason"
                    type="textarea"
                    :rows="3"
                    placeholder="审核不通过，请描述理由"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleClickInDialog('secure-check-in-dialog')"
                       :loading="statusOfWaitingResponse('secure-check-in-dialog')">确&nbsp定</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="selected.action = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="审核不通过" :visible="selected.action == 're-secure-check-in-dialog'"
               :class="{'re-secure-check-in-dialog': true, 'size-650': true,}"
               :close-on-click-modal="false"
               @close="selected.action = null"
    >
      <el-form labelWidth="120px" size="mini">
        <el-form-item label="不通过原因：" class="reason" v-if="selected.row && selected.row.reason">
          {{selected.row.reason}}
        </el-form-item>
        <el-form-item label="安全审核人：" class="tip">李斌（NBSP-安全组），15600693326</el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleClickInDialog('re-secure-check-in-dialog')"
                     :loading="statusOfWaitingResponse('re-secure-check-in-dialog')">重新审核</el-button>
        </div>
        <div class="item">
          <el-button @click="selected.action = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  #domain-main {
    .header {
      .row {
        &.selector {
          .el-input .el-input__inner {
            height: 24px;
          }
        }
      }
    }
    .el-dialog__wrapper {
      &.add-domain, &.bind-service, &.unbind-service {
        /*max-width: 900px;*/
        .el-dialog {
          width: 100%;
        }
        margin: 15px auto;
        .el-form {
          .el-form-item__content {
            text-align: left;
          }
        }
      }
      &.add-domain {
        &.show-response {
          .el-dialog__body {
            .title {
              display: flex;
              .key, .value {
                font-weight: bold;
              }
            }
            .item {
              display: flex;
              border-bottom: 1px solid #909399;
              margin-bottom: 3px;
              &:last-child {
                border-width: 0px;
              }
            }
            .key, .value {
              flex: 1;
              text-align: center;
              text-overflow: ellipsis;
              word-wrap: break-word;
              word-break: break-all;
            }
          }
        }
      }
      &.bind-service {
        .profile-version-condition-filter {
          text-align: left;
        }
        .el-form.selected-domain {
          margin-top: 5px;
          .el-form-item {
            margin-bottom: 5px;
            .el-form-item__label {
              padding-right: 5px;
              line-height: 25px;
            }
            .el-form-item__content {
              line-height: 25px;
              .el-tag {
                margin: 2px 3px;
                padding: 0px 2px;
              }
            }
          }
        }
        &.show-response {
          .el-dialog__body {
            .title {
              display: flex;
              .key, .value {
                font-weight: bold;
              }
            }
            .item {
              display: flex;
              border-bottom: 1px solid #909399;
              margin-bottom: 3px;
              &:last-child {
                border-width: 0px;
              }
            }
            .key, .value {
              flex: 1;
              text-align: center;
              text-overflow: ellipsis;
              word-wrap: break-word;
              word-break: break-all;
            }
          }
        }
      }
      &.unbind-service {
        .selected-domain {
          margin-top: 3px;
          text-align: left;
          word-break: break-all;
          word-wrap: break-word;
        }
        &.show-response {
          .el-dialog__body {
            .title {
              display: flex;
              .key, .value {
                font-weight: bold;
              }
            }
            .item {
              display: flex;
              border-bottom: 1px solid #909399;
              margin-bottom: 3px;
              &:last-child {
                border-width: 0px;
              }
            }
            .key, .value {
              flex: 1;
              text-align: center;
              text-overflow: ellipsis;
              word-wrap: break-word;
              word-break: break-all;
            }
          }
        }
      }
      &.re-secure-check-in-dialog {
        .el-form-item {
          &.reason {
            margin-bottom: 8px;
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #domain-main {
    background: white;
    height: 100%;
    /*margin:0px 6px;*/
    max-width: 1500px;
    height: 100%;
    .header {
      padding: 3px 5px;
      font-size: 14px;
      .row {
        box-sizing: border-box;
        margin: 3px 0px;
        &.operation {
          text-align: left;
        }
        &.selector {
          text-align: left;
          .profile-version-condition-filter {
            display: inline-block;
          }
        }
      }
    }
    .domain-list {
      box-sizing: border-box;
      .el-table {
        .el-table__row {
          .el-button {
          }
        }
        .el-table__expanded-cell {
          padding: 0px;
        }
      }
    }
  }
</style>

<script>
  import MyVersionConditionFilter from '../components/version-condition-filter.vue';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  export default {
    components: {MyVersionConditionFilter},
    created() {
      // 1. page service
      try {
        const dataTransfer = this.$storeHelper.dataTransfer;
        if (dataTransfer && dataTransfer.hasOwnProperty('from')) {
          let data = dataTransfer['data'];
          switch (dataTransfer['from']) {
            case this.$net.page['profile/service']:
              this.localServiceConfig = {
                appID: data['appId'],
                profileID: data['profileId']
              };
              if (data.hasOwnProperty('serviceId')) {
                this.localServiceConfig['serviceID'] = data['serviceId'];
              }
              break;
          }
          this.$storeHelper.dataTransfer = null;
        }
      } catch(err) {
      }
//      console.log(this.localServiceConfig);
    },
    mounted() {
      this.setDebounce();
      this.keyword = '';
      // adjust element height after resize
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
    data() {
      return {
        resizeListener: () => {},
        heightOfTable: '',

        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        localServiceConfig: null,

        currentDomainList: [],
        rowsSelected: [],
        showLoading: false,
        queueForWaitingResponse: [],
        selected: {
          action: '',
          row: null
        },

        // props for add domain
        props4CreateDomain: {
          level1InfoListByProfile: {},
          profile: null,
          profileName: null,
          level1InfoList: [],
          // item in domainToAdd: {domain, profileId}
          domainToAdd: [],
          showResponse: false,
          serverResponse: {},
          level1Name: '',
          level2Name: '',
          errMsgForLevel2Name: '',
          errMsgForDomainToAdd: '',
        },
        bindServiceProps: {
          showResponse: false,
          serverResponse: {},
          bindTipForApp: '',
        },
        unBindServiceProps: {
          showResponse: false,
          serverResponse: {}
        },
        secureCheckProps: {
          passed: false,
          reason: '',
          tip: ''
        },

        appInfo: null,
        profileInfo: null,
        serviceInfo: null,
        keyword: '',
        // passed to my-version-condition-filter
        fixedInfoForVersionCondition: {
          type: 'profile',
          id: null,
        },
        // whether bind button is enabled
//        isProfileSelected: false,

        rules: {
          domainList: [{
            type: 'array',
            required: true,
            message: '请输入至少一个域名',
          }, {
            validator(rule, values, callback) {
              callback();
            }
          }],
          level2Name: [{
            validator(rule, values, callback) {
              let passed = false;
              if (typeof(values) == 'string' && values.length > 0) {
                passed = true;
                callback();
              } else {
                passed = false;
                callback('请填写域名！');
              }
            },
            trigger: 'blur'
          }]
        },
        debounceRequestDomainList: () => {}
      }
    },
    computed: {
      currentGroupID() {
        return this.$storeHelper.currentGroupID;
      }
    },
    watch: {
      'props4CreateDomain.profileName': 'onProfileChangeInCreateDomainDialog',
      'profileInfo.id': function (id) {
//        this.isProfileSelected = id !== this.$storeHelper.PROFILE_ID_FOR_ALL;
        this.fixedInfoForVersionCondition.id = id;
      },
      'currentGroupID': function () {
        this.requestDomainList();
      },
      'keyword': function (value) {
        let versionConditionFilter = this.$refs.hasOwnProperty('version-condition-filter')?
          this.$refs['version-condition-filter'].getSelectedValue() : null;
        if (!versionConditionFilter) {
          return;
        }
        this.appInfo = versionConditionFilter.selectedAPP;
        this.profileInfo = versionConditionFilter.selectedProfile;
        this.serviceInfo = versionConditionFilter.selectedService;
        this.currentPage = 1;
        this.debounceRequestDomainList();
      },
      'secureCheckProps.passed': function (value) {
        if (value) {
          this.secureCheckProps.tip = '';
        }
      },
    },
    methods: {
      // helper for loading action of el-button
      addToWaitingResponseQueue(action) {
        if (this.queueForWaitingResponse.indexOf(action) === -1) {
          this.queueForWaitingResponse.push(action);
        }
      },
      hideWaitingResponse(action) {
        let index = this.queueForWaitingResponse.indexOf(action);
        if (index > -1) {
          this.queueForWaitingResponse.splice(index, 1);
        }
      },
      statusOfWaitingResponse(action) {
        return this.queueForWaitingResponse.indexOf(action) > -1;
      },

      // used to listen domain change in dialog of create-domain
      onProfileChangeInCreateDomainDialog(profileName) {
        // get profile by profileName
        this.props4CreateDomain.profile = this.$storeHelper.getProfileInfoByName(profileName);
        this.props4CreateDomain.level1InfoList = [];
        this.props4CreateDomain.level1Name = '';
        if (this.props4CreateDomain.level1InfoListByProfile.hasOwnProperty(profileName)) {
          let level1InfoList = this.props4CreateDomain.level1InfoListByProfile[profileName];
          if (Array.isArray(level1InfoList) && level1InfoList.length > 0) {
            this.props4CreateDomain.level1Name = level1InfoList[0]['domainName'];
          }
          this.props4CreateDomain.level1InfoList = level1InfoList;
        }
      },
      onServiceConditionChanged(profileInfo, appInfo, serviceInfo) {
//        console.log(appInfo, profileInfo, serviceInfo);
        this.profileInfo = profileInfo;
        this.appInfo = appInfo;
        this.serviceInfo = serviceInfo;
        this.keyword = '';
        this.requestDomainList();
      },
      // the first page of pagination is 1
      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestDomainList();
      },

      setDebounce() {
        this.debounceRequestDomainList = this.$utils.debounce(this.requestDomainList.bind(this), 1000, false);
      },
      /**
       * the place of calling requestDomainList;
       * 1. onServiceConditionChanged
       * 2. callback of successful delete domain
       * 3. callback of successful add domain
       */
      requestDomainList() {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;
        this.showLoading = true;

        let profileID = '';
        if (this.profileInfo && this.profileInfo.hasOwnProperty('id')
          && this.profileInfo.id != this.$storeHelper.PROFILE_ID_FOR_ALL) {
          profileID = this.profileInfo.id;
        }
        let appID = '';
        if (this.appInfo && this.appInfo.hasOwnProperty('appId') && this.appInfo.appId != this.$storeHelper.APP_ID_FOR_ALL) {
          appID = this.appInfo.appId;
        }
        let serviceID = '';
        if (this.serviceInfo && this.serviceInfo.hasOwnProperty('id')
          && this.serviceInfo.id != this.$storeHelper.SERVICE_ID_FOR_ALL) {
          serviceID = this.serviceInfo.id;
        }
        let requestOptions = {
          groupId: this.$storeHelper.currentGroupID,
          spaceId: profileID,
          applicationId: appID,
          serviceId: serviceID,
          start: start,
          length: length,
          keyword: this.keyword
        };
        this.$net.getDomainList(requestOptions).then(content => {
          if (content.hasOwnProperty('total')) {
            this.totalSize = content['total'];
          }
          if (content.hasOwnProperty('internetDomainList')) {
            this.currentDomainList = content['internetDomainList'].map(it => {
              if (it.hasOwnProperty('spaceId')) {
                let profileInfo = this.$storeHelper.getProfileInfoByID(it.spaceId);
                if (profileInfo.hasOwnProperty('description')) {
                  it.profileDesc = profileInfo.description;
                }
              }
              return it;
            })
          }

          this.showLoading = false;
        }).catch(err => {
          this.$notify.error({
            title: err.title,
            message: err.msg,
            duration: 0,
            onClose: function () {
            }
          });
          this.showLoading = false;
        })
      },

      // handle the button in operation column of table
      handleRowButtonClick(evt, action, index, row) {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        this.selected.row = row;
        switch (action) {
          case 'domain_secure_check':
            this.selected.action = action;
            this.secureCheckProps.passed = false;
            this.secureCheckProps.reason = '';
            this.secureCheckProps.tip = '';
            break;
          case 'domain_bind_white_list':
            this.$router.push(this.$net.page['profile/domain/white-list']);
            this.$storeHelper.dataTransfer = row;
            break;
          case 'domain_remove':
            if (row['hasBind']) {
              this.$message.error(`外网域名"${row.internetDomain}"${row.status}，请先解绑服务，才能删除！`);
            } else {
              this.addToWaitingResponseQueue(action);
              this.warningConfirm(`删除外网域名"${row.internetDomain}"，将会同时删除该域名关联的IP白名单，确定吗？`).then(() => {
                this.$net.removeDomain({
                  id: row.id
                }).then(msg => {
                  this.hideWaitingResponse(action);
                  this.$message.success(`成功删除域名"${row['internetDomain']}"`);
                  this.requestDomainList();
                }).catch(err => {
                  this.hideWaitingResponse(action);
                  this.$notify({
                    title: err.title,
                    message: err.msg,
                    duration: 0,
                    onClose: function () {
                    }
                  });
                });
              }).catch(() => {
                this.hideWaitingResponse(action);
              });
            }
            break;
          case 're-secure-check-in-dialog':
            this.selected.action = action;
            break;
        }
      },
      // handle the checkbox in table for domain-list
      handleSelectionChangeInTable(val) {
        this.rowsSelected = val;
      },

      // some init action for domain props
      initDomainProps() {
        this.props4CreateDomain.level1InfoList = [];
        this.props4CreateDomain.domainToAdd = [];
        this.props4CreateDomain.level2Name = '';
        this.props4CreateDomain.level1Name = '';
        this.props4CreateDomain.showResponse = false;
        //clear error message tip
        this.props4CreateDomain.errMsgForLevel2Name = '';
        this.props4CreateDomain.errMsgForDomainToAdd = '';
      },

      /**
       * do some init action before dialog popup
       */
      handleButtonClick(evt, action) {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        switch (action) {
          case 'domain_add':
            if (!this.profileInfo) {
              this.$message.error('获取运行环境信息失败！');
              return;
            }
            this.addToWaitingResponseQueue(action);

            this.initDomainProps();
            this.$net.getDomainLevel1Map({
              groupId: this.$storeHelper.currentGroupID
            }).then(domainMap => {
              this.props4CreateDomain.level1InfoListByProfile = domainMap;

              // set default profileName for add-domain-dialog(the same as profile in version-condition-filter)
              this.props4CreateDomain.profileName = this.$storeHelper.profileListOfGroup[0]['name'];
              if (this.$refs.hasOwnProperty('version-condition-filter')) {
                let selectedProfile = this.$refs['version-condition-filter'].getSelectedValue().selectedProfile;
                if (selectedProfile && selectedProfile.hasOwnProperty('id')
                  && selectedProfile.id !== this.$storeHelper.PROFILE_ID_FOR_ALL) {
                  this.props4CreateDomain.profileName = selectedProfile['name'];
                }
              }

              this.onProfileChangeInCreateDomainDialog(this.props4CreateDomain.profileName);
              this.hideWaitingResponse(action);
              this.selected.action = 'add-domain';
            }).catch(err => {
              this.$notify.error({
                title: err.title,
                message: err.msg,
                duration: 0,
                onClose: function () {
                }
              });
              this.hideWaitingResponse(action);
            });
            break;
          case 'domain_bind_service':
            if (this.profileInfo.id === this.$storeHelper.PROFILE_ID_FOR_ALL) {
              this.$message.warning('运行环境为"全部"的情况下，不能进行绑定服务操作。请先将运行环境切换为其它运行环境！');
              return;
            }
            this.bindServiceProps.showResponse = false;
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.selected.action = 'bind-service';
            break;
          case 'domain_unbind_service':
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.selected.action = 'unbind-service';
            break;
        }
      },

      /**
       * action for add or remove domain
       * @param action
       * @param domainItem: domain item in this.props4CreateDomain.domainToAdd(for remove)
       */
      handleDomainInDialog(action, domainItem) {
        let domainToAdd = this.props4CreateDomain.domainToAdd;
        switch (action) {
          case 'remove':
            if (domainToAdd.indexOf(domainItem) > -1) {
              domainToAdd.splice(domainToAdd.indexOf(domainItem), 1);
            }
            break;
          case 'add':
            this.props4CreateDomain.level2Name = this.props4CreateDomain.level2Name.trim();

            this.props4CreateDomain.errMsgForLevel2Name = '';
            this.props4CreateDomain.errMsgForDomainToAdd = '';
            if (!/^[a-z0-9][a-z0-9\-]{0,62}$/.exec(this.props4CreateDomain.level2Name)) {
              this.props4CreateDomain.errMsgForLevel2Name = '可以包含小写字符、数字、中划线，以字符数字开头，长度不超过63位';
              return;
            }
            if (domainToAdd.length >= 5) {
              this.props4CreateDomain.errMsgForDomainToAdd = '每次最多添加五个';
              return;
            }
            let domain = this.props4CreateDomain.level2Name + '.' + this.props4CreateDomain.level1Name;
            let item = null;
            domainToAdd.some(it => {
              if (it.domain === domain) {
                item = it;
              }
              return item
            });
            if (item) {
              this.props4CreateDomain.errMsgForLevel2Name = `域名${domain}已经存在！`
              return;
            }
            domainToAdd.push({
              domain: domain,
              profileId: this.props4CreateDomain.profile['id']
            });
            this.props4CreateDomain.level2Name = '';
            break;
        }
      },

      /**
       * action in popup dialog on the press of button-ok
       * @param action
       */
      handleClickInDialog(action) {
        let domainIdList = null;
        switch (action) {
          case 'add-domain-in-dialog':
//            console.log(this.props4CreateDomain.domainToAdd);
//            console.log(internetDomainList);
            let internetDomainList = {};
            this.props4CreateDomain.domainToAdd.forEach(it => {
              let profileId = it['profileId'];
              if (!internetDomainList.hasOwnProperty(profileId)) {
                internetDomainList[profileId] = [];
              }
              internetDomainList[profileId].push(it.domain);
            });
            if (this.props4CreateDomain.domainToAdd.length === 0) {
              this.props4CreateDomain.errMsgForDomainToAdd = '至少添加一个域名！';
              return;
            }
            if (this.props4CreateDomain.domainToAdd.length > 5) {
              this.props4CreateDomain.errMsgForDomainToAdd = '每次最多添加五个！';
              return;
            }
            this.addToWaitingResponseQueue(action);
            this.$net.createDomain({
              "groupId": this.$storeHelper.currentGroupID,
              internetDomainList
            }).then(content => {
              this.props4CreateDomain.serverResponse = content;
              this.props4CreateDomain.showResponse = true;
              this.hideWaitingResponse(action);
            }).catch(err => {
              this.hideWaitingResponse(action);
              this.$notify.error({
                title: err.title,
                message: err.msg,
                duration: 0,
                onClose: function () {
                }
              });
            });
            break;
          case 'close-domain-in-dialog':
            this.selected.action = null;
            if (this.props4CreateDomain.showResponse) {
              this.requestDomainList();
            }
            break;
          case 'bind-service-in-dialog':
//            console.log(this.rowsSelected);
            domainIdList = this.rowsSelected.map(it => {
              return it.id;
            });
            if (domainIdList.length === 0) {
              this.$message.error('请选择要操作的域名！');
              return;
            }
            let refKey = 'version-selector-in-bind-service-dialog';
            if (!this.$refs.hasOwnProperty(refKey)) {
              this.$message.error('未找到服务信息！');
              return;
            }
            let selectedValue = this.$refs[refKey].getSelectedValue();
            if (!selectedValue || !selectedValue['selectedProfile'] || !selectedValue['selectedAPP']) {
              this.$message.error('未找到服务信息！');
              return;
            }
            this.addToWaitingResponseQueue(action);

            let options = {
              internetDomainIdList: domainIdList,
              spaceId: selectedValue['selectedProfile'].id,
              applicationId: selectedValue['selectedAPP']['appId'],
              serviceId: ''
            };
            if (selectedValue['selectedService']
              && selectedValue['selectedService'].id !== this.$storeHelper.SERVICE_ID_FOR_ALL) {
              options['serviceId'] = selectedValue['selectedService'].id;
            }
//            console.log(options);
            this.$net.domainBindService(options).then(content => {
              let domainIDList = Object.keys(content);
              for (let key in content) {
                let target = null;
                this.currentDomainList.some(it => {
                  if (it.id == key) {
                    target = it;
                  }
                  return target;
                });
                if (target) {
                  content[target['internetDomain']] = content[key];
                }
              }
              domainIDList.forEach(key => {
                delete content[key];
              });
              this.bindServiceProps.serverResponse = content;
              this.bindServiceProps.showResponse = true;
              this.hideWaitingResponse(action);
            }).catch(msg => {
              this.$notify({
                title: '绑定域名失败',
                message: msg,
                duration: 0,
                onClose: function () {
                }
              });
              this.hideWaitingResponse(action);
            });
            break;
          case 'close-bind-service-in-dialog':
            this.selected.action = null;
            if (this.bindServiceProps.showResponse) {
              this.requestDomainList();
              this.bindServiceProps.showResponse = false;
            }
            break;
          case 'unbind-service-in-dialog':
            domainIdList = this.rowsSelected.map(it => {
              return it.id;
            });
            if (domainIdList.length === 0) {
              this.$message.error('请选择要操作的域名！');
              return;
            }
            this.addToWaitingResponseQueue(action);
            this.$net.domainUnBindService({
              internetDomainIdList: domainIdList
            }).then(content => {
              let domainIDList = Object.keys(content);
              for (let key in content) {
                let target = null;
                this.currentDomainList.some(it => {
                  if (it.id == key) {
                    target = it;
                  }
                  return target;
                });
                if (target) {
                  content[target['internetDomain']] = content[key];
                }
              }
              domainIDList.forEach(key => {
                delete content[key];
              });
              this.unBindServiceProps.serverResponse = content;
              this.unBindServiceProps.showResponse = true;
              this.hideWaitingResponse(action);
            }).catch(msg => {
              this.$notify({
                title: '绑定域名失败',
                message: msg,
                duration: 0,
                onClose: function () {
                }
              });
              this.hideWaitingResponse(action);
            });
            break;
          case 'close-unbind-service-in-dialog':
            this.selected.action = null;
            if (this.unBindServiceProps.showResponse) {
              this.requestDomainList();
              this.unBindServiceProps.showResponse = false;
            }
            break;
          case 'secure-check-in-dialog':
            if (!this.secureCheckProps.passed && !this.secureCheckProps.reason) {
              this.secureCheckProps.tip = '请描述审核不通过的理由';
              return;
            }
            this.addToWaitingResponseQueue(action);
            this.$net.requestPaasServer(this.$net.URL_LIST.domain_secure_check, {
              payload: {
                id: this.selected.row.id,
                status: this.secureCheckProps.passed ? 'EFFECTIVE' : 'NOT_EFFECTIVE',
                reason: this.secureCheckProps.reason
              }
            }).then(() => {
              this.$message.success('提交成功');
              this.requestDomainList();
            }).catch(err => {
            }).finally(() => {
              this.hideWaitingResponse(action);
              this.selected.action = null;
            });
            break;
          case 're-secure-check-in-dialog':
            this.addToWaitingResponseQueue(action);
            this.$net.requestPaasServer(this.$net.URL_LIST.domain_secure_check, {
              payload: {
                id: this.selected.row.id,
                status: 'APPLY',
                reason: '重新申请'
              }
            }).then(() => {
              this.$message.success('提交成功');
              this.requestDomainList();
            }).catch(err => {
            }).finally(() => {
              this.hideWaitingResponse(action);
              this.selected.action = null;
            });
            break;
        }
      },

      handleConditionChangeInDialog(profile, app, service) {
        if (service.id === this.$storeHelper.SERVICE_ID_FOR_ALL) {
          this.bindServiceProps.bindTipForApp = `所选外网域名会作为全局域名，绑定到应用"${app.appName}"的"${profile.description}"的默认服务下。`;
        } else {
          this.bindServiceProps.bindTipForApp = `所选外网域名会绑定到应用"${app.appName}"的"${profile.description}"的版本为"${service.serviceVersion}"的服务下。`;
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
    }
  }
</script>