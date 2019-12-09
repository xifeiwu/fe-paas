<template>
  <div id="domain-main">
    <div class="header">
      <div class="item search">
        <paas-service-selector
                ref="version-condition-filter"
                :addItemAll="{app: true, profile: true}"
                :selected="query"
                @service-selected="onServiceConditionChanged"></paas-service-selector>
        <el-input size="mini" placeholder="按关键字搜索外网二级域名" class="search-by-key"
                  style="min-width: 200px;"
                  v-model="query.keyword">
          <i slot="prefix" class="el-icon-search"></i>
          <i :class="query.keyword && query.keyword.length > 0 ? 'paas-icon-close' : ''"
             slot="suffix"
             @click="evt => query.keyword=''"></i>
        </el-input>
        <el-button
                size="mini"
                type="primary"
                @click="handleButtonClick($event, 'refresh')">刷新
       </el-button>
      </div>
      <div class="item operation">
        <el-button
                size="mini"
                type="primary"
                :class="{'disabled': $storeHelper.actionDisabled('domain_add_open_dialog') || $storeHelper.serverIsPublishing}"
                :loading="statusOfWaitingResponse('domain_add_open_dialog')"
                @click="handleButtonClick($event, 'domain_add_open_dialog')"
        >申请外网二级域名</el-button>
        <el-button
                size="mini"
                type="warning"
                :class="{'disabled': $storeHelper.actionDisabled('open_dialog_domain_bind_service')}"
                @click="handleButtonClick($event, 'open_dialog_domain_bind_service')"
        >绑定服务</el-button>
        <el-button
                size="mini"
                type="warning"
                :class="{'disabled': $storeHelper.actionDisabled('open_dialog_domain_unbind_service')}"
                @click="handleButtonClick($event, 'open_dialog_domain_unbind_service')"
        >解绑服务</el-button>
        <i style="font-size:12px; line-height: 24px; margin: 0px 3px;" class="paas-icon-question"
           v-pop-on-mouse-over="['已绑定的域名需要先进行解绑，才可绑定新的服务',
          '点击 \'绑定服务\' 和 \'解绑服务\' 按钮前，需要选择要操作的外网域名']"></i>
      </div>
    </div>
    <div class="domain-list">
      <el-table
              :data="domainList"
              style="width: 100%"
              :height="heightOfTable"
              element-loading-text="加载中"
      >
        <el-table-column
                prop="internetDomain"
                label="外网二级域名"
                minWidth="160">
            <template slot-scope="scope">
              <el-radio :label="scope.row.id"
                        :value="selectedId"
                        :style="{marginLeft: '3px'}"
                        @input="changeDefaultVersion(scope.row)">{{''}}</el-radio>
              <span>{{scope.row.internetDomain}}</span>
              <i class="paas-icon-copy"
                 v-clipboard:copy="scope.row.internetDomain"
                 v-clipboard:success="handleSuccessCopy"></i>
            </template>
        </el-table-column>
        <el-table-column
                prop="profileDesc"
                width="80"
                headerAlign="center" align="center"
                label="运行环境">
        </el-table-column>
        <el-table-column
                label="创建时间"
                prop="formattedCreateTime"
                sortable="custom"
                width="100"
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
                prop="creatorName"
                label="创建人"
                headerAlign="center" align="center"
                width="80">
        </el-table-column>
        <el-table-column
                prop="status"
                label="域名状态"
                minWidth="160"
        >
          <template slot-scope="scope">
            <span>{{scope.row.statusDescription}}</span>
            <span v-if="scope.row.reason" style="color: #00f; cursor: pointer"
                  @click="handleRowButtonClick($event, 're-secure-check-in-dialog', scope.$index, scope.row)">原因</span>
          </template>
        </el-table-column>
        <el-table-column
                prop="status"
                label="全网访问状态"
                headerAlign="center" align="center"
                width="100"
        >
          <template slot-scope="scope">
            <span>{{scope.row.accessStatus}}</span>
          </template>
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                minWidth="180"
        >
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :class="$storeHelper.permission['domain_secure_check'].disabled || $storeHelper.serverIsPublishing? 'disabled' : 'warning'"
                    @click="handleRowButtonClick($event, 'domain_secure_check', scope.$index, scope.row)">
              安全审核
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="$storeHelper.permission['domain_remove'].disabled || $storeHelper.serverIsPublishing? 'disabled' : 'danger'"
                    :loading="statusOfWaitingResponse('domain_remove') && selected.row.id === scope.row.id"
                    @click="handleRowButtonClick($event, 'domain_remove', scope.$index, scope.row)">删除
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['domain_bind_white_list'].disabled || $storeHelper.serverIsPublishing? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'domain_bind_white_list', scope.$index, scope.row)">
              <span>关联IP白名单</span><i class="paas-icon-level-up"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > query.pageSize">
        <div class="pagination">
          <el-pagination
                  layout="total, sizes, prev, pager, next, jumper"
                  :page-sizes="[12, 15, 20, 30]"
                  :current-page.sync="query.currentPage"
                  :page-size.sync = "query.pageSize"
                  :total="totalSize"
          ></el-pagination>
        </div>
      </div>
    </div>

    <el-dialog :title="props4CreateDomain.showResponse?'创建外网域名结果':'申请外网二级域名'" :visible="selected.action == 'add-domain'"
               :class="{'add-domain': true, 'size-750': true, 'show-response': props4CreateDomain.showResponse}"
               :close-on-click-modal="false"
               bodyPadding="10px"
               @close="handleDialogEvent('close-domain-in-dialog')"
    >
      <div v-if="props4CreateDomain.showResponse">
        <div class="title" style="margin-bottom: 5px;">
          <div class="key">外网域名</div>
          <div class="value">添加状态</div>
        </div>
        <div class="item" v-for="(value, key) in props4CreateDomain.serverResponse" :key="key">
          <div class="key">{{key}}</div>
          <div class="value">{{value}}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer flex" v-if="props4CreateDomain.showResponse">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent('close-domain-in-dialog')">确定</el-button>
        </div>
      </div>

      <el-form :model="props4CreateDomain" :rules="rules" size="mini" v-if="!props4CreateDomain.showResponse"
               label-width="120px" ref="newDomainForm">
        <el-form-item label="运行环境" class="message-show">
          <el-select v-model="props4CreateDomain.profileName" placeholder="请选择">
            <el-option v-for="item in $storeHelper.profileListOfGroup" :key="item.name" :label="item.description" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="将要添加的域名" class="has-existed" :error="props4CreateDomain.errMsgForDomainToAdd">
          <div v-if="props4CreateDomain.domainListToAdd.length > 0">
            <div style="display: flex; font-weight: bold; color: #5a5e66">
              <div style="flex: 1">外网域名</div>
              <div style="width: 200px;">全网访问</div>
              <div style="width: 30px;"></div>
            </div>
            <div style="display: flex;" v-for="(item, index) in props4CreateDomain.domainListToAdd">
              <div style="flex: 1">{{item.domain}}</div>
              <el-checkbox style="width: 200px;" v-model="item.noWhiteList">开启</el-checkbox>
              <i class="paas-icon-close" @click="handleDomainInDialog('remove', item)"></i>
            </div>
          </div>
          <div v-else>无</div>
        </el-form-item>
        <el-form-item label="外网二级域名" :error="props4CreateDomain.errMsgForLevel2Name">
          <div style="display: flex">
            <el-input v-model="props4CreateDomain.level2Name" size="mini"
                      placeholder="小写字符、数字、中划线，以字符数字开头，长度不超过63位" style="width: calc(100% - 235px); margin-right: 5px;"></el-input>
            <el-select v-model="props4CreateDomain.level1Name" style="width: 230px;">
              <el-option v-for="(item, index) in props4CreateDomain.level1InfoList" :value="item.domainName" :label="item.domainName"
                         :key="index"></el-option>
            </el-select>
          </div>
          <div style="display: flex; margin-top: 3px;">
            <div style="width: calc(100% - 235px); margin-right: 5px;"></div>
            <div style="width: 230px; display: flex; justify-content: space-between">
              <el-checkbox v-model="props4CreateDomain.noWhiteList" style="">开启全网访问</el-checkbox>
              <el-button class="add-domain-btn" size="mini" type="primary" @click="handleDomainInDialog('add')">添加</el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex" v-if="!props4CreateDomain.showResponse">
        <div class="item">
          <el-button
                  type="primary"
                  size="mini"
                  @click="handleDialogEvent('add-domain-in-dialog')"
                  :loading="statusOfWaitingResponse('add-domain-in-dialog')">保存</el-button></div>
        <div class="item">
          <el-button size="mini" @click="handleDialogEvent('close-domain-in-dialog')">取消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="绑定服务"
               :visible="action.name == 'open_dialog_domain_bind_service'"
               v-if="action.name == 'open_dialog_domain_bind_service'"
               :class="{'domain_bind_service': true, 'size-650': true, 'show-response': action.data.showResponse}"
               :close-on-click-modal="false"
               bodyPadding="4px"
               @close="closeDialog"
    >
      <div v-if="!action.data.showResponse" style="text-align: left">
        <paas-dismiss-message :toExpand="true" showSeconds="0" style="margin: -2px -4px 6px -4px;"
                              :msgList="[
                                '绑定成功后5分钟内可使用外网域名访问应用',
                                '如果绑定域名的服务在灰度发布中，如需调整流量策略请到该服务的灰度发布/设置灰度策略中进行调整'
                              ]"></paas-dismiss-message>
        <div style="padding-left: 10px;">
          <div style="margin-bottom: 10px; text-align: left">
            <span style="font-weight: bold">所选外网域名：</span>
            <span>{{rowsSelected[0]['internetDomain']}}</span>
          </div>
          <paas-service-selector :disabled="{app: false, profile: true}"
                                 :selected="action.data.selected">
          </paas-service-selector>
        </div>
      </div>
      <div class="content" v-else>
        <div>
          <div class="title">
            <div class="key">外网域名</div>
            <div class="value">绑定状态</div>
          </div>
          <div class="item" v-for="(item, index) in action.data.serverResponse" :key="index">
            <div class="key">{{item.internetDomain}}</div>
            <div class="value">{{item.status}}</div>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer flex"  v-if="!action.data.showResponse">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent('domain_bind_service')"
                     :loading="action.requesting">保存</el-button>
        </div>
        <div class="item">
          <el-button size="mini" @click="closeDialog">取消</el-button>
        </div>
      </div>
      <div slot="footer" class="dialog-footer flex" v-else>
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent('close_dialog_domain_bind_service')">确定</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="解绑服务"
               :visible="action.name == 'open_dialog_domain_unbind_service'"
               v-if="action.name == 'open_dialog_domain_unbind_service'"
               :class="{'domain_unbind_service': true, 'size-700': true, 'show-response': action.data.showResponse}"
               :close-on-click-modal="false"
               bodyPadding="8px 10px"
               @close="closeDialog"
    >
      <div v-if="action.data.showResponse">
        <div class="title">
          <div class="key">外网域名</div>
          <div class="value">绑定状态</div>
        </div>
        <div class="item" v-for="(item, index) in action.data.serverResponse">
          <div class="key">{{item.internetDomain}}</div>
          <div class="value">{{item.status}}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer flex" v-if="action.data.showResponse">
        <div class="item">
          <el-button type="primary" size="mini"
                   @click="handleDialogEvent('close_dialog_domain_unbind_service')">确定</el-button>
        </div>
      </div>

      <div class="selected-domain" v-if="!action.data.showResponse">
        <div style="margin-bottom: 5px;">
          <span>解绑域名</span>
          <span>（{{rowsSelected.map(it => it.internetDomain).join(', ')}}）</span>
          <span>将导致绑定在域名上的应用不能通过这个域名进行访问，你确定这么做吗？</span>
        </div>
        <strong style="color: red">注：如果域名的服务在灰度发布中，解绑外网域名会删除该域名下的灰度策略</strong>
      </div>
      <div slot="footer" class="dialog-footer flex" v-if="!action.data.showResponse">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent('domain_unbind_service')"
                     :loading="action.requesting">确定</el-button>
        </div>
        <div class="item">
          <el-button size="mini" @click="closeDialog">取消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="安全审核" :visible="selected.action == 'domain_secure_check'"
               :class="{'domain_secure_check': true, 'size-650': true,}"
               :close-on-click-modal="false"
               @close="selected.action = null"
    >
      <el-form labelWidth="120px" size="mini">
        <el-form-item v-if="selected.row" label="域名状态">
          该域名{{selected.row.openAllInternet?'正在':'未'}}申请全网访问
        </el-form-item>
        <el-form-item label="审核意见" class="custom-image">
          <el-radio-group v-model="secureCheckProps.passed" size="mini" class="passed">
            <el-radio :label="true">审核通过</el-radio>
            <el-radio :label="false">审核不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="不通过理由" :error="secureCheckProps.tip" class="reason"
        >
          <el-input v-model="secureCheckProps.reason"
                    type="textarea"
                    :rows="3"
                    placeholder="审核不通过，请描述理由"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary"
                       size="mini"
                       @click="handleDialogEvent('secure-check-in-dialog')"
                       :loading="statusOfWaitingResponse('secure-check-in-dialog')">确定</el-button>
          </div>
          <div class="item">
            <el-button size="mini" @click="selected.action = null">取消</el-button>
          </div>
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
        <el-form-item label="安全审核人：">李斌（NBSP-安全组），15600693326</el-form-item>
        <el-form-item label="申请全网访问" v-if="selected.row">
          <el-checkbox v-model="selected.row.openAllInternet">开启</el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent('re-secure-check-in-dialog')"
                     :loading="statusOfWaitingResponse('re-secure-check-in-dialog')">重新审核</el-button>
        </div>
        <div class="item">
          <el-button size="mini" @click="selected.action = null">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  #domain-main {
    .el-dialog__wrapper {
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
        .paas-icon-close {
          color: #aaa;
          line-height: 24px;
          width: 30px;
          &:hover {
            color: gray;
          }
        }
      }
      &.domain_bind_service {
        &.show-response {
          .el-dialog__body {
            .title {
              display: flex;
              margin-bottom: 3px;
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
              padding: 0px 8px;
              text-align: center;
              text-overflow: ellipsis;
              word-wrap: break-word;
              word-break: break-all;
            }
            .key {
              flex: 1;
            }
            .value {
              flex: 2;
            }
          }
        }
      }
      &.domain_unbind_service {
        &.show-response {
          .el-dialog__body {
            .title {
              display: flex;
              margin-bottom: 3px;
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
    max-width: 1500px;
    height: 100%;
    & > .header {
      padding: 3px 5px;
      font-size: 14px;
      > .item {
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        &.search {
          .paas-service-selector {
            display: inline-block;
            min-width: 500px;
          }
          .el-button {
            margin-left: 3px;
          }
        }
        &.operation {
          .el-button {
            margin-left: 5px;
          }
        }
      }
      .el-input.search-by-key {
        .paas-icon-close {
          &:hover {
            cursor: pointer;
          }
        }
      }
      .paas-icon-question {
        font-size: 12px;
        color: #E6A23C;
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
  import paasServiceSelector from '../components/service-selector.vue';
  import paasDismissMessage from 'assets/components/dismiss-message.vue';
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    mixins: [commonUtils],
    components: {paasServiceSelector, paasDismissMessage},
    created() {
      // 1. page service
      try {
        const dataTransfer = this.$storeHelper.dataTransfer;
        if (dataTransfer && dataTransfer.hasOwnProperty('from')) {
          let data = dataTransfer['data'];
          switch (dataTransfer['from']) {
            case this.$net.page['profile/service']:
              this.query.appId = data['appId'];
              this.query.profileId = data['profileId'];
              break;
          }
          this.$storeHelper.dataTransfer = null;
        }
      } catch(err) {
      }
    },
    mounted() {
      // adjust element height after resize
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
      this.throttleRequestList();
    },
    beforeDestroy() {
    },
    data() {
      return {
        resizeListener: () => {},
        heightOfTable: '',

        appInfo: null,
        profileInfo: null,
        totalSize: 0,
        query: {
          currentPage: 1,
          pageSize: 12,
          appId: this.$storeHelper.PROFILE_ID_FOR_NULL,
          profileId: this.$storeHelper.PROFILE_ID_FOR_NULL,
          keyword: '',
        },

        domainList: [],
        selectedId: null,
        rowsSelected: [],
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
          // item in domainListToAdd: {domain, profileId}
          domainListToAdd: [],
          showResponse: false,
          serverResponse: {},
          // 域名后缀
          level1Name: '',
          // 自定义域名
          level2Name: '',
          // 全网访问
          noWhiteList: false,
          errMsgForLevel2Name: '',
          errMsgForDomainToAdd: '',
        },
        secureCheckProps: {
          passed: false,
          reason: '',
          tip: ''
        },

        // 作为paas-service-selector的定制状态
        dialogCustomConfig: {
          appId: null,
          profileId: null,
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
        throttleRequestList: this.$utils.throttle(this.requestDomainList.bind(this), 300, false, true)
      }
    },
    computed: {
    },
    watch: {
      'props4CreateDomain.profileName': 'onProfileChangeInCreateDomainDialog',
      'profileInfo.id': function (id) {
//        this.isProfileSelected = id !== this.$storeHelper.PROFILE_ID_FOR_ALL;
      },
      '$storeHelper.currentGroupId': function () {
        this.requestDomainList();
      },
      'query.appId'() {
        this.throttleRequestList();
      },
      'query.profileId'() {
        this.throttleRequestList();
      },
      'query.currentPage'(currentPage) {
        this.throttleRequestList();
      },
      'query.pageSize'(pageSize) {
        this.query.currentPage = 1;
        this.throttleRequestList();
      },
      'query.keyword': function (value) {
        this.query.currentPage = 1;
        this.throttleRequestList();
      },
      'secureCheckProps.passed': function (value) {
        if (value) {
          this.secureCheckProps.tip = '';
        }
      },
      '$storeHelper.screen.size': 'onScreenSizeChange',
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
        this.props4CreateDomain.profileInfo = this.$storeHelper.getProfileInfoByName(profileName);
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
      onServiceConditionChanged() {
        const {appModel, profileInfo} = this.$refs['version-condition-filter'].getSelected();
        this.appInfo = appModel;
        this.profileInfo = profileInfo;
        this.query.keyword = '';
      },

      /**
       * the place of calling requestDomainList;
       * 1. onServiceConditionChanged
       * 2. callback of successful delete domain
       * 3. callback of successful add domain
       */
      async requestDomainList() {
        if (!this.$utils.isNumber(parseInt(this.query.currentPage))) {
          this.query.currentPage = 1;
          return;
        }
        var page = this.query.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.query.pageSize;
        const length = this.query.pageSize;

        const payload = {
          groupId: this.$storeHelper.currentGroupID,
          spaceId: this.query.profileId == this.$storeHelper.PROFILE_ID_FOR_ALL ? '' : this.query.profileId,
          applicationId: this.query.appId == this.$storeHelper.APP_ID_FOR_ALL ? '' : this.query.appId,
          start: start,
          length: length,
          keyword: this.query.keyword
        };
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.domain_list, {
          payload
        });
        if (!['internetDomainList', 'total'].every(prop => {
          return this.$utils.propExists(resContent, prop)
          })) {
          console.log(`internetDomainList or total not exist in resContent`);
          return;
        }
        this.totalSize = resContent['total'];
        this.domainList = resContent['internetDomainList'].map(it => {
          if (it.hasOwnProperty('spaceId')) {
            const profileInfo = this.$storeHelper.getProfileInfoById(it.spaceId);
            it.profileDesc = profileInfo.description;
            it['formattedCreateTime'] = this.$utils.formatDate(it['createTime'], 'yyyy-MM-dd hh:mm:ss').split(' ');
          }
          it['accessStatus'] = (it['status'] === 'EFFECTIVE' ? it['notHaveIPWhiteList'] : it['openAllInternet']) ? '已开启' : '未开启';
          return it;
        });
        if (this.domainList.length > 0) {
          const firstRow = this.domainList[0];
          this.rowsSelected = [firstRow];
          this.selectedId = firstRow['id'];
        }
      },

      // handle the button in operation column of table
      handleRowButtonClick(evt, action, index, row) {
        if (this.$storeHelper.serverIsPublishing && ["domain_secure_check","domain_remove","domain_bind_white_list"].indexOf(action) > -1) {
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
                  id: row.id,
                  groupId: this.$storeHelper.currentGroupID
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
      changeDefaultVersion(row) {
        this.rowsSelected = [row];
        this.selectedId = row['id'];
      },

      // some init action for domain props
      initDomainProps() {
        this.props4CreateDomain.level1InfoList = [];
        this.props4CreateDomain.domainListToAdd = [];
        this.props4CreateDomain.level2Name = '';
        this.props4CreateDomain.noWhiteList = false;
        this.props4CreateDomain.level1Name = '';
        this.props4CreateDomain.showResponse = false;
        //clear error message tip
        this.props4CreateDomain.errMsgForLevel2Name = '';
        this.props4CreateDomain.errMsgForDomainToAdd = '';
      },

      /**
       * do some init action before dialog popup
       */
      async handleButtonClick(evt, action) {
        const permission = this.$storeHelper.actionToPermission(action);
        if (['domain_add'].indexOf(permission) > -1 && this.$storeHelper.serverIsPublishing) {
          this.$storeHelper.popoverWhenPublish(evt.target);
          return;
        }
        if (this.$storeHelper.actionDisabled(action)) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.reason4ActionDisabled(action)
          });
          return;
        }
        switch (action) {
          case 'domain_add_open_dialog':
            if (!this.profileInfo) {
              this.$message.error('获取运行环境信息失败！');
              return;
            }
            this.addToWaitingResponseQueue(action);

            this.initDomainProps();
            try {
              const domainMap = await this.$store.dispatch('app/getSubDomainByProfile', {
                net: this.$net,
                urlDesc: this.$net.URL_LIST.domain_level_1_list_all,
                payload: {groupId: this.$storeHelper.currentGroupID}
              });
              this.props4CreateDomain.level1InfoListByProfile = domainMap;

              // set default profileName for add-domain-dialog(the same as profile in version-condition-filter)
              this.props4CreateDomain.profileName = this.$storeHelper.profileListOfGroup[0]['name'];
              if (this.$refs.hasOwnProperty('version-condition-filter')) {
                const {profileInfo} = this.$refs['version-condition-filter'].getSelected();
                if (profileInfo && profileInfo.hasOwnProperty('id')
                  && profileInfo.id !== this.$storeHelper.PROFILE_ID_FOR_ALL) {
                  this.props4CreateDomain.profileName = profileInfo['name'];
                }
              }

              this.onProfileChangeInCreateDomainDialog(this.props4CreateDomain.profileName);
              this.selected.action = 'add-domain';
            } catch(err) {
              console.log(err);
            } finally {
              this.hideWaitingResponse(action);
            }
            break;
          case 'open_dialog_domain_bind_service':
            try {
              this.openDialog(action, {
                showResponse: false,
                serverResponse: [],
                selected: {
                  appId: this.query.appId,
                  profileId: this.rowsSelected[0]['spaceId']
                },
              });
            } catch (err) {}
            break;
          case 'open_dialog_domain_unbind_service':
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.openDialog(action, {
              showResponse: false,
              serverResponse: []
            });
            break;
          case 'refresh':
            this.requestDomainList();
            break;
        }
      },

      /**
       * action for add or remove domain
       * @param action
       * @param domainItem: domain item in this.props4CreateDomain.domainListToAdd(for remove)
       */
      handleDomainInDialog(action, domainItem) {
        // console.log(this.props4CreateDomain.profileInfo);
        let domainListToAdd = this.props4CreateDomain.domainListToAdd;
        switch (action) {
          case 'remove':
            if (domainListToAdd.indexOf(domainItem) > -1) {
              domainListToAdd.splice(domainListToAdd.indexOf(domainItem), 1);
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
            if (domainListToAdd.length >= 5) {
              this.props4CreateDomain.errMsgForDomainToAdd = '每次最多添加五个';
              return;
            }
            let domain;
            if (this.props4CreateDomain.profileName.startsWith('production')) {
              domain = this.props4CreateDomain.level2Name + '.' + this.props4CreateDomain.level1Name;
            } else {
              domain = this.props4CreateDomain.level2Name + '-' + this.props4CreateDomain.level1Name;
            }

            if (domainListToAdd.find(it => it.domain === domain)) {
              this.props4CreateDomain.errMsgForLevel2Name = `域名${domain}已经存在！`
              return;
            }
            domainListToAdd.push({
              domain: domain,
              customSubDomain: this.props4CreateDomain.level2Name,
              customDomain: this.props4CreateDomain.level1Name,
              noWhiteList: this.props4CreateDomain.noWhiteList,
              profileId: this.props4CreateDomain.profileInfo['id']
            });
            this.props4CreateDomain.level2Name = '';
            break;
        }
      },

      /**
       * action in popup dialog on the press of button-ok
       * @param action
       */
      async handleDialogEvent(action) {
        let domainIdList = null;
        switch (action) {
          case 'add-domain-in-dialog':
            // console.log(this.props4CreateDomain.domainListToAdd);
            // console.log(internetDomainList);
            if (this.props4CreateDomain.domainListToAdd.length === 0) {
              this.props4CreateDomain.errMsgForDomainToAdd = '至少添加一个域名！';
              return;
            }
            if (this.props4CreateDomain.domainListToAdd.length > 5) {
              this.props4CreateDomain.errMsgForDomainToAdd = '每次最多添加五个！';
              return;
            }
            this.addToWaitingResponseQueue(action);
            this.$net.createDomain({
              "groupId": this.$storeHelper.currentGroupID,
              internetDomainOperateVOList: this.props4CreateDomain.domainListToAdd.map(it => {
                return {
                  domainName: it.domain,
                  customSubDomain: it.customSubDomain,
                  customDomain: it.customDomain,
                  openAllInternet: it.noWhiteList,
                  spaceId: it.profileId
                }
              })
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
          case 'domain_bind_service':
//            console.log(this.rowsSelected);
            domainIdList = this.rowsSelected.map(it => {
              return it.id;
            });
            if (domainIdList.length === 0) {
              this.$message.error('请选择要操作的域名！');
              return;
            }
            try {
              const dialogData = this.action.data;
              const payload = {
                internetDomainIdList: domainIdList,
                spaceId: dialogData.selected.profileId,
                applicationId: dialogData.selected.appId,
                groupId: this.$storeHelper.currentGroupId,
                // serviceId: ''
              };
              this.action.requesting = true;
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.domain_bind_service, {
                payload
              });
              dialogData.showResponse = true;
              Object.keys(resContent).forEach(key => {
                const domainItem = this.domainList.find(it => it.id == key);
                if (domainItem) {
                  this.action.data.serverResponse.push({
                    id: key,
                    internetDomain: domainItem['internetDomain'],
                    status: resContent[key],
                  })
                }
              });
            } catch (err) {
              console.log(err);
            } finally {
              this.action.requesting = false;
            }
            break;
          case 'close_dialog_domain_bind_service':
            this.closeDialog();
            this.requestDomainList();
            break;
          case 'domain_unbind_service':
            if (this.rowsSelected.length === 0) {
              this.$message.error('请选择要操作的域名！');
              return;
            }
            try {
              this.action.requesting = true;
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.domain_unbind_service, {
                payload: {
                  internetDomainIdList: this.rowsSelected.map(it => it.id),
                  groupId: this.$storeHelper.currentGroupId,
                  spaceId: this.rowsSelected[0].spaceId,
                }
              });
              Object.keys(resContent).forEach(key => {
                const domainItem = this.domainList.find(it => it.id == key);
                if (domainItem) {
                  this.action.data.serverResponse.push({
                    id: key,
                    internetDomain: domainItem['internetDomain'],
                    status: resContent[key],
                  })
                }
              });
              this.action.data.showResponse = true;
            } catch (err) {
              console.log(err)
            } finally {
              this.action.requesting = false;
            }
            break;
          case 'close_dialog_domain_unbind_service':
            this.closeDialog();
            this.requestDomainList();
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
                reason: this.secureCheckProps.reason,
                groupId: this.$storeHelper.currentGroupID,
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
                reason: '重新申请',
                openAllInternet: this.selected.row.openAllInternet
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

      handleSuccessCopy(evt) {
        this.$storeHelper.globalTip.show({
          ref: evt.trigger,
          msg: '复制成功'
        });
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