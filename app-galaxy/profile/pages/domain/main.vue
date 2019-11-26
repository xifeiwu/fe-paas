<template>
  <div id="domain-main">
    <div class="header">
      <div class="row selector">
        <paas-service-selector
                ref="version-condition-filter"
                :addItemAll="{app:true, profile:true}"
                :customConfig="localServiceConfig"
                @service-selected="onServiceConditionChanged"></paas-service-selector>
        <el-input
                size="mini"
                style="max-width: 200px"
                placeholder="按关键字搜索外网二级域名"
                suffix-icon="el-icon-search"
                v-model="keyword">
        </el-input>
        <el-button
                size="mini"
                type="primary"
                @click="handleButtonClick($event, 'refresh')">
          查询
       </el-button>
      </div>
      <div class="row operation">
        <el-button
                size="mini"
                type="primary"
                :class="{'disabled': $storeHelper.actionDisabled('domain_add_open_dialog') || publishStatus}"
                :loading="statusOfWaitingResponse('domain_add_open_dialog')"
                @click="handleButtonClick($event, 'domain_add_open_dialog')">
          申请外网二级域名
        </el-button>
        <el-button
                size="mini"
                type="warning"
                :class="{'disabled': $storeHelper.permission['domain_bind_service'].disabled || publishStatus}"
                @click="handleButtonClick($event, 'domain_bind_service')"
        >绑定服务
        </el-button>
        <el-button
                size="mini"
                type="warning"
                :class="{'disabled': $storeHelper.permission['domain_unbind_service'].disabled || publishStatus}"
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
              element-loading-text="加载中"
      >
        <el-table-column
                prop="internetDomain"
                label="外网二级域名"
                minWidth="200">
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
                width="100"
                headerAlign="center" align="center"
                label="运行环境">
        </el-table-column>
        <el-table-column
                prop="formattedCreateTime"
                headerAlign="center" align="center"
                label="创建时间"
                width="140">
        </el-table-column>
        <el-table-column
                prop="creatorName"
                label="创建人"
                headerAlign="center" align="center"
                width="100">
        </el-table-column>
        <el-table-column
                prop="status"
                label="域名状态"
                minWidth="180"
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
                width="120"
        >
          <template slot-scope="scope">
            <span>{{scope.row.accessStatus}}</span>
          </template>
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="220"
        >
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :class="$storeHelper.permission['domain_secure_check'].disabled || publishStatus? 'disabled' : 'warning'"
                    @click="handleRowButtonClick($event, 'domain_secure_check', scope.$index, scope.row)">
              安全审核
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="$storeHelper.permission['domain_remove'].disabled || publishStatus? 'disabled' : 'danger'"
                    :loading="statusOfWaitingResponse('domain_remove') && selected.row.id === scope.row.id"
                    @click="handleRowButtonClick($event, 'domain_remove', scope.$index, scope.row)">删除
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['domain_bind_white_list'].disabled || publishStatus? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'domain_bind_white_list', scope.$index, scope.row)">
              <span>关联IP白名单</span><i class="paas-icon-level-up"></i>
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

    <el-dialog :title="props4CreateDomain.showResponse?'创建外网域名结果':'申请外网二级域名'" :visible="selected.action == 'add-domain'"
               :class="{'add-domain': true, 'size-750': true, 'show-response': props4CreateDomain.showResponse}"
               :close-on-click-modal="false"
               bodyPadding="10px"
               @close="handleClickInDialog('close-domain-in-dialog')"
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
                     @click="handleClickInDialog('close-domain-in-dialog')">确&nbsp定</el-button>
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
                  @click="handleClickInDialog('add-domain-in-dialog')"
                  :loading="statusOfWaitingResponse('add-domain-in-dialog')">保&nbsp存</el-button></div>
        <div class="item">
          <el-button size="mini" @click="handleClickInDialog('close-domain-in-dialog')">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="绑定服务"
               :visible="selected.action == 'bind-service'"
               v-if="selected.action == 'bind-service'"
               :class="{'bind-service': true, 'size-700': true, 'show-response': bindServiceProps.showResponse}"
               :close-on-click-modal="false"
               bodyPadding="4px"
               @close="selected.action = null"
    >
      <div v-if="bindServiceProps.showResponse">
        <el-row class="title">
          <el-col :span="8" class="key">外网域名</el-col>
          <el-col :span="16" class="value">绑定状态</el-col>
        </el-row>
        <el-row class="item" v-for="(value, key) in bindServiceProps.serverResponse" :key="key">
          <el-col :span="8" class="key">{{key}}</el-col>
          <el-col :span="16" class="value">{{value}}</el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer flex" v-if="bindServiceProps.showResponse">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleClickInDialog('close-bind-service-in-dialog')">确定</el-button>
        </div>
      </div>

      <div v-if="!bindServiceProps.showResponse">
        <paas-dismiss-message :toExpand="true" showSeconds="0" style="margin: -2px -4px 6px -4px;"
                              :msgList="[
                                bindServiceProps.bindTipForApp,
                                '如果绑定域名的服务在灰度发布中，如需调整流量策略请到该服务的灰度发布/设置灰度策略中进行调整'
                              ]"></paas-dismiss-message>
        <div style="padding-left: 10px;">
          <paas-service-selector ref="service-selector-in-bind-service-dialog"
                                 :fixedInfo="fixedInfoForVersionCondition"
                                 :customConfig="dialogCustomConfig"
                                 @service-selected="handleConditionChangeInDialog"
                                 v-if="selected.action == 'bind-service'"
          >
          </paas-service-selector>
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
        </div>
        <div class="helper-text-expanded" style="margin-top: 3px;" v-if="false">
          <div>
            <div style="font-weight: bold; font-size: 14px;">提示 <i class="el-icon-warning"></i></div>
            <div style="font-size: 13px; margin-top: 3px;">1.{{bindServiceProps.bindTipForApp}}</div>
            <div style="font-size: 13px; margin-top: 3px;">2.该域名如需使用灰度发布，请到灰度策略中配置</div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer flex" v-if="!bindServiceProps.showResponse">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleClickInDialog('bind-service-in-dialog')"
                     :loading="statusOfWaitingResponse('bind-service-in-dialog')">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button size="mini" @click="selected.action = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="解绑服务" :visible="selected.action == 'unbind-service'"
               :class="{'unbind-service': true, 'size-750': true, 'show-response': unBindServiceProps.showResponse}"
               :close-on-click-modal="false"
               bodyPadding="6px 4px"
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
      <div slot="footer" class="dialog-footer flex" v-if="unBindServiceProps.showResponse">
        <div class="item">
          <el-button type="primary" size="mini"
                   @click="handleClickInDialog('close-unbind-service-in-dialog')">确&nbsp定</el-button>
        </div>
      </div>

      <div class="selected-domain" v-if="!unBindServiceProps.showResponse">
        <span>解绑</span>
        <span
                v-for="(item, index) in rowsSelected"
                :key="index"
                type="success"
                size="small"
        >{{'"' + item['internetDomain'] + '"'}}</span>
        <span>域名将导致绑定在域名上的应用不能通过这个域名进行访问，你确定这么做吗？</span>
        <br/>
        <strong style="color: red">注：如果域名的服务在灰度发布中，解绑外网域名会删除该域名下的灰度策略</strong>
      </div>
      <div slot="footer" class="dialog-footer flex" v-if="!unBindServiceProps.showResponse">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleClickInDialog('unbind-service-in-dialog')"
                     :loading="statusOfWaitingResponse('unbind-service-in-dialog')">确&nbsp定</el-button>
        </div>
        <div class="item">
          <el-button size="mini" @click="selected.action = null">取&nbsp消</el-button>
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
        <el-form-item label="安全审核人：">李斌（NBSP-安全组），15600693326</el-form-item>
        <el-form-item label="申请全网访问" v-if="selected.row">
          <el-checkbox v-model="selected.row.openAllInternet">开启</el-checkbox>
        </el-form-item>
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
        .el-dialog {
          width: 100%;
          .el-dialog__body {
          }
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
        .paas-icon-close {
          color: #aaa;
          line-height: 24px;
          width: 30px;
          &:hover {
            color: gray;
          }
        }
      }
      &.bind-service {
        .paas-service-selector {
          text-align: left;
        }
        .el-form.selected-domain {
          margin-top: 10px;
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
              margin-bottom: 3px;
              .key, .value {
                font-weight: bold;
              }
            }
            .item {
              border-bottom: 1px solid #909399;
              margin-bottom: 3px;
              &:last-child {
                border-width: 0px;
              }
            }
            .key, .value {
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
          .paas-service-selector {
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
  import paasServiceSelector from '../components/service-selector.vue';
  import paasDismissMessage from 'assets/components/dismiss-message.vue';
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    components: {paasServiceSelector, paasDismissMessage},
    created() {
      // 1. page service
      try {
        const dataTransfer = this.$storeHelper.dataTransfer;
        if (dataTransfer && dataTransfer.hasOwnProperty('from')) {
          let data = dataTransfer['data'];
          switch (dataTransfer['from']) {
            case this.$net.page['profile/service']:
              this.localServiceConfig = {
                appId: data['appId'],
                profileId: data['profileId']
              };
              if (data.hasOwnProperty('serviceId')) {
                this.localServiceConfig['serviceId'] = data['serviceId'];
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
      this.requestDomainList();
      // adjust element height after resize
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
    },
    beforeDestroy() {
    },
    data() {
      return {
        resizeListener: () => {},
        heightOfTable: '',

        totalSize: 0,
        pageSize: 12,
        currentPage: 1,

        localServiceConfig: null,

        currentDomainList: [],
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
        bindServiceProps: {
          showResponse: false,
          serverResponse: {},
          bindTipForApp: '绑定成功后5分钟内可使用外网域名访问应用',
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

        // 作为paas-service-selector的定制状态
        dialogCustomConfig: {
          appId: null,
          profileId: null,
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
      },
      publishStatus() {
        return this.$store.getters['publishStatus'];
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
//        let versionConditionFilter = this.$refs.hasOwnProperty('version-condition-filter')?
//          this.$refs['version-condition-filter'].getSelectedInfo() : null;
//        if (!versionConditionFilter) {
//          return;
//        }
//        this.appInfo = versionConditionFilter.selectedApp;
//        this.profileInfo = versionConditionFilter.selectedProfile;
//        this.serviceInfo = versionConditionFilter.selectedService;
//        this.currentPage = 1;
//        this.debounceRequestDomainList();
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
      onServiceConditionChanged(appInfo, profileInfo, serviceInfo) {
        // console.log(appInfo, profileInfo, serviceInfo);
        this.profileInfo = profileInfo;
        this.appInfo = appInfo;
        this.serviceInfo = serviceInfo;
        this.keyword = '';
        // this.debounceRequestDomainList();
      },
      // the first page of pagination is 1
      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestDomainList();
      },

      setDebounce() {
        this.debounceRequestDomainList = this.$utils.debounce(this.requestDomainList.bind(this), 500, true);
      },
      /**
       * the place of calling requestDomainList;
       * 1. onServiceConditionChanged
       * 2. callback of successful delete domain
       * 3. callback of successful add domain
       */
      async requestDomainList() {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;

        let profileID = '';
        if (this.profileInfo && this.profileInfo.hasOwnProperty('id')
          && this.profileInfo.id != this.$storeHelper.PROFILE_ID_FOR_ALL) {
          profileID = this.profileInfo.id;
        }
        let appID = '';
        if (this.appInfo && this.appInfo.hasOwnProperty('appId') && this.appInfo.appId != this.$storeHelper.APP_ID_FOR_ALL) {
          appID = this.appInfo.appId;
        }
        const payload = {
          groupId: this.$storeHelper.currentGroupID,
          spaceId: profileID,
          applicationId: appID,
          start: start,
          length: length,
          keyword: this.keyword
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
        this.currentDomainList = resContent['internetDomainList'].map(it => {
          if (it.hasOwnProperty('spaceId')) {
            let profileInfo = this.$storeHelper.getProfileInfoByID(it.spaceId);
            if (profileInfo.hasOwnProperty('description')) {
              it.profileDesc = profileInfo.description;
            }
            it['formattedCreateTime'] = this.$utils.formatDate(it['createTime'], 'yyyy-MM-dd hh:mm:ss');
          }
          it['accessStatus'] = (it['status'] === 'EFFECTIVE' ? it['notHaveIPWhiteList'] : it['openAllInternet']) ? '已开启' : '未开启';
          return it;
        });
        if (this.currentDomainList.length > 0) {
          const firstRow = this.currentDomainList[0];
          this.rowsSelected = [firstRow];
          this.selectedId = firstRow['id'];
        }
      },

      // handle the button in operation column of table
      handleRowButtonClick(evt, action, index, row) {
        if (this.publishStatus && ["domain_secure_check","domain_remove","domain_bind_white_list"].indexOf(action) > -1) {
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
        if (['domain_add','domain_bind_service','domain_unbind_service'].indexOf(permission) > -1 && this.publishStatus) {
          this.$storeHelper.popoverWhenPublish(evt.target);
          return;
        }
        if (this.$storeHelper.actionDisabled(action)) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[permission].reason
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
                let selectedProfile = this.$refs['version-condition-filter'].getSelectedInfo().selectedProfile;
                if (selectedProfile && selectedProfile.hasOwnProperty('id')
                  && selectedProfile.id !== this.$storeHelper.PROFILE_ID_FOR_ALL) {
                  this.props4CreateDomain.profileName = selectedProfile['name'];
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
          case 'domain_bind_service':
            this.bindServiceProps.showResponse = false;
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.dialogCustomConfig.appId = this.appInfo.appId;
            this.dialogCustomConfig.profileId = this.rowsSelected[0]['spaceId'];
            this.selected.action = 'bind-service';
            break;
          case 'domain_unbind_service':
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.selected.action = 'unbind-service';
            break;
          case 'refresh':
            this.currentPage = 1;
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
      async handleClickInDialog(action) {
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
          case 'bind-service-in-dialog':
//            console.log(this.rowsSelected);
            domainIdList = this.rowsSelected.map(it => {
              return it.id;
            });
            if (domainIdList.length === 0) {
              this.$message.error('请选择要操作的域名！');
              return;
            }
            let refKey = 'service-selector-in-bind-service-dialog';
            if (!this.$refs.hasOwnProperty(refKey)) {
              this.$message.error('未找到服务信息！');
              return;
            }
            let selectedValue = this.$refs[refKey].getSelectedInfo();
            if (!selectedValue || !selectedValue['selectedProfile'] || !selectedValue['selectedApp']) {
              this.$message.error('未找到服务信息！');
              return;
            }
            this.addToWaitingResponseQueue(action);

            let options = {
              internetDomainIdList: domainIdList,
              spaceId: selectedValue['selectedProfile'].id,
              applicationId: selectedValue['selectedApp']['appId'],
              groupId: this.$storeHelper.currentGroupID,
              // serviceId: ''
            };
            // if (selectedValue['selectedService']
            //   && selectedValue['selectedService'].id !== this.$storeHelper.SERVICE_ID_FOR_ALL) {
            //   options['serviceId'] = selectedValue['selectedService'].id;
            // }
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
              internetDomainIdList: domainIdList,
              groupId: this.$storeHelper.currentGroupID,
              spaceId: this.rowsSelected.spaceId,
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

      handleConditionChangeInDialog(app, profile, service) {
        if (profile && app) {
          this.bindServiceProps.bindTipForApp = `所选域名正在绑定"${profile.description}"的"${app.appName}"应用，绑定成功后5分钟内可使用外网域名访问应用`;
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