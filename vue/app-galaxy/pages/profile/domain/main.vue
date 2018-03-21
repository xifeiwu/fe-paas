<template>
  <div id="domain-main">
    <div class="header">
      <div class="row">
        <el-button
                size="mini-extral"
                type="primary"
                :loading="statusOfWaitingResponse('open-create-domain-dialog')"
                @click="handleButtonClick('open-create-domain-dialog')">
          创建外网二级域名
        </el-button>
        <el-button
                size="mini-extral"
                type="warning"
                @click="handleButtonClick('open-bind-service-dialog')"
                :disabled="!isProfileSelected"
        >绑定服务
        </el-button>
        <el-button
                size="mini-extral"
                type="warning"
                @click="handleButtonClick('open-unbind-service-dialog')">解绑服务
        </el-button>

        <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
          <div slot="content">
            <div>1. 已绑定的域名需要先进行解绑，才可绑定新的服务</div>
            <div>2. 点击"绑定服务"和"解绑服务"按钮前，需要选择要操作的外网域名</div>
            <div>3. 绑定服务时，开发环境不能选择"全部"</div>
          </div>
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
      <div class="row">
        <my-version-condition-filter
                :addItemAll="{app:true, profile:true, service: true}"
                :customConfig="localServiceConfig"
                @service-condition-changed="onServiceConditionChanged"></my-version-condition-filter>
      </div>
    </div>
    <div class="domain-list">
      <el-table
              :data="currentDomainList"
              style="width: 100%"
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
                headerAlign="center" align="center"
                label="外网二级域名">
        </el-table-column>
        <el-table-column
                prop="createTime"
                label="创建时间"
                headerAlign="center" align="center"
                width="180">
        </el-table-column>
        <el-table-column
                prop="creatorName"
                label="创建人"
                headerAlign="center" align="center"
                width="120">
        </el-table-column>
        <el-table-column
                prop="status"
                label="状态"
        >
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="warning"
                    @click="handleRowButtonClick('to-white-list', scope.$index, scope.row)">
              关联IP白名单
            </el-button>
            <el-button
                    size="mini-extral"
                    type="danger"
                    :loading="statusOfWaitingResponse('remove') && selected.row.id === scope.row.id"
                    @click="handleRowButtonClick('remove', scope.$index, scope.row)">删除
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

    <el-dialog :title="domainProps.showResponse?'创建外网域名结果':'创建外网二级域名'" :visible="currentOpenedDialog == 'add-domain'"
               :class="{'add-domain': true, 'show-response': domainProps.showResponse}"
               @close="handleButtonClickInDialog('close-domain-in-dialog')"
    >
      <!--<el-tag type="success" disable-transitions>-->
      <!--<i class="el-icon-warning"></i>-->
      <!--<span>更改健康检查后需要重新【部署】才能生效！</span>-->
      <!--</el-tag>-->
      <div v-if="domainProps.showResponse">
        <div class="key title">外网域名</div>
        <div class="value title">添加状态</div>
        <div class="clear list-item" v-for="(value, key) in domainProps.serverResponse">
          <div class="key">{{key}}</div>
          <div class="value">{{value}}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center" v-if="domainProps.showResponse">
        <el-button type="primary"
                   @click="handleButtonClickInDialog('close-domain-in-dialog')">确&nbsp定</el-button>
      </div>

      <el-form :model="domainProps" :rules="rules" size="mini" v-if="!domainProps.showResponse"
               label-width="120px" ref="newDomainForm">
        <el-form-item label="运行环境">
          <el-select v-model="domainProps.profileName" placeholder="请选择">
            <el-option v-for="item in $storeHelper.profileListOfGroup()" :key="item.name" :label="item.description" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="将要添加的域名" class="has-existed" :error="domainProps.stateForDomainToAdd">
          <div v-if="domainProps.domainToAdd.length > 0">
            <el-tag
                    v-for="domain in domainProps.domainToAdd"
                    :key="domain"
                    closable
                    type="success"
                    size="small"
                    @close="handleDomainInDialog('remove', domain)"
            >{{domain}}</el-tag>
          </div>
          <div v-else>无</div>
        </el-form-item>
        <el-form-item label="外网二级域名" :error="domainProps.stateForLevel2Name">
          <el-input v-model="domainProps.level2Name" placeholder="小写字符、数字、中划线，以字符数字开头，长度不超过63位"></el-input>
          <el-select v-model="domainProps.level1Name">
            <el-option v-for="(item, index) in domainProps.level1InfoList" :value="item.domainName" :label="item.domainName"
                       :key="index"></el-option>
          </el-select>
          <el-button class="add-domain-btn" size="mini" @click="handleDomainInDialog('add')">添加</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!domainProps.showResponse">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleButtonClickInDialog('add-domain-in-dialog')"
                       :loading="statusOfWaitingResponse('add-domain-in-dialog')">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="handleButtonClickInDialog('close-domain-in-dialog')">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="绑定服务" :visible="currentOpenedDialog == 'bind-service'"
               :class="{'bind-service': true, 'show-response': bindServiceProps.showResponse}"
               @close="currentOpenedDialog = null"
    >
      <div v-if="bindServiceProps.showResponse">
        <div class="key title">外网域名</div>
        <div class="value title">绑定状态</div>
        <div class="clear list-item" v-for="(value, key) in bindServiceProps.serverResponse">
          <div class="key">{{key}}</div>
          <div class="value">{{value}}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center" v-if="bindServiceProps.showResponse">
        <el-button type="primary"
                   @click="handleButtonClickInDialog('close-bind-service-in-dialog')">确&nbsp定</el-button>
      </div>

      <div v-if="!bindServiceProps.showResponse">
        <my-version-condition-filter ref="version-selector-in-bind-service-dialog"
                                     :fixedInfo="fixedInfoForVersionCondition"
                                     :addItemAll="{service: true}"
        >
        </my-version-condition-filter>
        <div class="selected-domain">
          <div>所选外网域名</div>
          <div>
            <el-tag
                    v-for="(item, index) in rowsSelected"
                    :key="index"
                    type="success"
                    size="small"
            >{{item['internetDomain']}}</el-tag>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" v-if="!bindServiceProps.showResponse">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleButtonClickInDialog('bind-service-in-dialog')"
                       :loading="statusOfWaitingResponse('bind-service-in-dialog')">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="currentOpenedDialog = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="解绑服务" :visible="currentOpenedDialog == 'unbind-service'"
               :class="{'unbind-service': true, 'show-response': unBindServiceProps.showResponse}"
               @close="currentOpenedDialog = null"
    >
      <div v-if="unBindServiceProps.showResponse">
        <div class="key title">外网域名</div>
        <div class="value title">绑定状态</div>
        <div class="clear list-item" v-for="(value, key) in unBindServiceProps.serverResponse">
          <div class="key">{{key}}</div>
          <div class="value">{{value}}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center" v-if="unBindServiceProps.showResponse">
        <el-button type="primary"
                   @click="handleButtonClickInDialog('close-unbind-service-in-dialog')">确&nbsp定</el-button>
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
                       @click="handleButtonClickInDialog('unbind-service-in-dialog')"
                       :loading="statusOfWaitingResponse('unbind-service-in-dialog')">确&nbsp定</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="currentOpenedDialog = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  #domain-main {
    .el-dialog__wrapper {
      &.add-domain, &.bind-service, &.unbind-service {
        /*max-width: 900px;*/
        .el-dialog {
          width: 100%;
        }
        width: 80%;
        max-width: 700px;
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
            .list-item {
              border-bottom: 1px solid #909399;
              margin-bottom: 3px;
            }
            .key {
              &.title {
                font-weight: bold;
                text-align: center;
              }
              width: 160px;
              text-align: center;
              float: left;
              text-overflow: ellipsis;
              word-wrap: break-word;
              word-break: break-all;
            }
            .value {
              &.title {
                font-weight: bold;
                text-align: center;
              }
              margin-left: 180px;
              text-align: center;
            }
          }
        }
      }
      &.bind-service {
        .el-version-selector {
          text-align: left;
        }
        .selected-domain {
          margin-top: 3px;
          div:nth-child(1) {
            width: 100px;
            text-align: left;
            float: left;
            text-overflow: ellipsis;
            word-wrap: break-word;
            word-break: break-all;
          }
          div:nth-child(2) {
            margin-left: 100px;
            text-align: left;
          }
        }
        &.show-response {
          .el-dialog__body {
            .list-item {
              border-bottom: 1px solid #e7e7e7;
              margin-bottom: 3px;
              &:last-child {
                border-width: 0px;
              }
            }
            .key {
              &.title {
                font-weight: bold;
                text-align: center;
              }
              width: 160px;
              text-align: center;
              float: left;
              text-overflow: ellipsis;
              word-wrap: break-word;
              word-break: break-all;
            }
            .value {
              &.title {
                font-weight: bold;
                text-align: center;
              }
              margin-left: 180px;
              text-align: center;
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
            .list-item {
              border-bottom: 1px solid #e7e7e7;
              margin-bottom: 3px;
              &:last-child {
                border-width: 0px;
              }
            }
            .key {
              &.title {
                font-weight: bold;
                text-align: center;
              }
              width: 160px;
              text-align: center;
              float: left;
              text-overflow: ellipsis;
              word-wrap: break-word;
              word-break: break-all;
            }
            .value {
              &.title {
                font-weight: bold;
                text-align: center;
              }
              margin-left: 180px;
              text-align: center;
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #domain-main {
    .header {
      margin: 3px 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      .row {
        box-sizing: border-box;
        &:nth-child(1) {
          width: 30%;
          /*border-right: 1px solid #e7e7e7;*/
          text-align: left;
        }
        &:nth-child(2) {
          width: 70%;
          text-align: left;
          .my-version-selector {
            display: inline-block;
          }
        }
      }
      .el-icon-question {
        font-size: 16px;
        line-height: 24px;
        margin-left: 10px;
      }
    }
    .domain-list {
      .el-table {
        margin-bottom: 40px;
        .el-table__row {
          .el-button {
            margin: 2px 4px 2px 0px;
            display: inline-block;
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
  import MyVersionConditionFilter from '../utils/components/version-condition-filter.vue';
  import StoreHelper from '../utils/store-helper.vue';
  import ElInput from "element-ui/packages/input/src/input";
  import ElSelect from "element-ui/packages/select/src/select";
  import ElOption from "element-ui/packages/select/src/option";
  import ElTooltip from "element-ui/packages/tooltip/src/main";
  import ElFormItem from "element-ui/packages/form/src/form-item";
  export default {
    components: {ElFormItem, ElTooltip, ElOption, ElSelect, ElInput, MyVersionConditionFilter},
    mixins: [StoreHelper],
    created() {
      let queryParam = this.$route.query;
      if (queryParam && queryParam.hasOwnProperty('from')) {
        if (queryParam['from'] === '/profile/service') {
          this.localServiceConfig = this.$utils.cloneDeep(this.$storeHelper.getUserConfig('profile/service'));
          if (queryParam['action'] === 'go-to-domain-app') {
            this.localServiceConfig.serviceID = this.$storeHelper.SERVICE_ID_FOR_ALL;
          }
        }
      }
    },
    mounted() {

    },
    data() {
      return {
        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        localServiceConfig: null,

        currentDomainList: [],
        rowsSelected: [],
        showLoading: false,
        queueForWaitingResponse: [],
        selected: {
          row: null
        },

        // props for add domain
        domainProps: {
          dialogTitle: '创建外网二级域名',
          level1InfoListByProfile: {},
          profileName: null,
          level1InfoList: [],
          domainToAdd: [],
          showResponse: false,
          serverResponse: {},
          level1Name: '',
          level2Name: '',
          stateForLevel2Name: '',
          stateForDomainToAdd: '',
        },
        bindServiceProps: {
          showResponse: false,
          serverResponse: {}
        },
        unBindServiceProps: {
          showResponse: false,
          serverResponse: {}
        },

        appInfo: null,
        profileInfo: null,
        serviceInfo: null,
        // passed to my-version-condition-filter
        fixedInfoForVersionCondition: {
          type: 'profile',
          id: null,
        },
        // whether bind button is enabled
        isProfileSelected: false,

        currentOpenedDialog: null,

        rules: {
          domainList: [{
            type: 'array',
            required: true,
            message: '请输入至少一个域名',
          }, {
            validator(rule, values, callback) {
              // console.log(rule);
              // console.log(values);
              // console.log(typeof(values));
//              let passed = true;
//              let reg = /^\/[A-Za-z0-9_\-]+$/;
//              for (let key in values) {
//                let item = values[key];
//                if (!reg.exec(item)) {
//                  passed = false;
//                  callback(`${item}不符合条件。请以/开头，可包含字母、数字、下划线、中划线，2-18位字符。`)
//                }
//              }
//              if (passed) {
//                callback();
//              }
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
      }
    },
    computed: {
      currentGroupID() {
        return this.$storeHelper.currentGroupID;
      }
    },
    watch: {
      'domainProps.profileName': 'onProfileChangeInCreateDomainDialog',
      'profileInfo.id': function (id) {
        this.isProfileSelected = id !== this.$storeHelper.PROFILE_ID_FOR_ALL;
        this.fixedInfoForVersionCondition.id = id;
      },
      'currentGroupID': function () {
        this.requestDomainList();
      }
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
      onProfileChangeInCreateDomainDialog(value) {
        let profileName = value;
        this.domainProps.level1InfoList = [];
        if (this.domainProps.level1InfoListByProfile.hasOwnProperty(profileName)) {
          let level1InfoList = this.domainProps.level1InfoListByProfile[profileName];
          if (Array.isArray(level1InfoList) && level1InfoList.length > 0) {
            this.domainProps.level1Name = level1InfoList[0]['domainName'];
          }
          this.domainProps.level1InfoList = level1InfoList;
        }
      },
      onServiceConditionChanged(profileInfo, appInfo, serviceInfo) {
//        console.log(appInfo, profileInfo, serviceInfo);
        this.profileInfo = profileInfo;
        this.appInfo = appInfo;
        this.serviceInfo = serviceInfo;
        this.requestDomainList();
      },
      // the first page of pagination is 1
      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestDomainList();
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
        };
        this.$net.getDomainList(requestOptions).then(content => {
          if (content.hasOwnProperty('total')) {
            this.totalSize = content['total'];
          }
          if (content.hasOwnProperty('internetDomainList')) {
            this.currentDomainList = content['internetDomainList'];
          }
          this.showLoading = false;
        }).catch(err => {
          this.showLoading = false;
        })
      },

      // handle the button in operation column of table
      handleRowButtonClick(action, index, row) {
        this.selected.row = row;
        switch (action) {
          case 'to-white-list':
            let domain = row.domain;
            this.$router.push({
              path: '/profile/domain/white-list',
              query: {
                id: row.id,
                domainName: row['internetDomain']
              }
            });
            break;
          case 'remove':
            this.addToWaitingResponseQueue(action);
            this.warningConfirm(`删除外网二级域名"${row.internetDomain}"，将会同时删除该域名关联的IP白名单，确定吗？`).then(() => {
              this.$net.removeDomain({
                id: row.id
              }).then(msg => {
                this.hideWaitingResponse(action);
                this.$message.success(`成功删除域名"${row['internetDomain']}"`);
                this.requestDomainList();
              }).catch(msg => {
                this.hideWaitingResponse(action);
                this.$notify({
                  title: '删除域名失败',
                  message: msg,
                  duration: 0,
                  onClose: function () {
                  }
                });
              });
            }).catch(() => {
              this.hideWaitingResponse(action);
//              this.$message({
//                type: 'info',
//                message: '您已取消删除'
//              });
            });
            break;
        }
      },
      // handle the checkbox in table for domain-list
      handleSelectionChangeInTable(val) {
        this.rowsSelected = val;
      },

      // some init action for domain props
      initDomainProps() {
        this.domainProps.level1InfoList = [];
        this.domainProps.domainToAdd = [];
        this.domainProps.level2Name = '';
        this.domainProps.level1Name = '';
        this.domainProps.showResponse = false;
      },

      /**
       * do some init action before dialog popup
       */
      handleButtonClick(action) {
        switch (action) {
          case 'open-create-domain-dialog':
            if (!this.profileInfo) {
              this.$message.error('获取运行环境信息失败！');
              return;
            }
            this.addToWaitingResponseQueue(action);

            this.initDomainProps();
            this.$net.getDomainLevel1Map({
              groupId: this.$storeHelper.currentGroupID
            }).then(domainMap => {
              this.domainProps.level1InfoListByProfile = domainMap;
              this.currentOpenedDialog = 'add-domain';
              this.domainProps.profileName = this.$storeHelper.profileListOfGroup()[0]['name'];
              this.onProfileChangeInCreateDomainDialog(this.domainProps.profileName);
              this.hideWaitingResponse(action);
            }).catch(err => {
              this.$message.error('获取运行环境信息失败！');
              this.hideWaitingResponse(action);
            });
            break;
          case 'open-bind-service-dialog':
            this.bindServiceProps.showResponse = false;
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.currentOpenedDialog = 'bind-service';
            break;
          case 'open-unbind-service-dialog':
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.currentOpenedDialog = 'unbind-service';
            break;
        }
      },
      /**
       * action in popup dialog on the press of button-ok
       * @param action
       */
      handleButtonClickInDialog(action) {
        let domainIdList = null;
        switch (action) {
          case 'add-domain-in-dialog':
//            console.log(this.domainProps);
//            console.log(this.domainProps.domainToAdd);
            if (this.domainProps.domainToAdd.length === 0) {
              this.$message.error('至少填写一个域名');
              return;
            }
            if (this.domainProps.domainToAdd.length > 5) {
              this.$message.error('一次创建域名不能超过5个');
              return;
            }
            this.addToWaitingResponseQueue(action);
            this.$net.createDomain({
              "spaceId": this.$storeHelper.getProfileInfoByName(this.domainProps.profileName)['id'],
              "groupId": this.$storeHelper.currentGroupID,
              "internetDomainList": this.domainProps.domainToAdd
            }).then(content => {
              this.domainProps.serverResponse = content;
              this.domainProps.showResponse = true;
              this.hideWaitingResponse(action);
            }).catch(err => {
              this.$notify({
                title: '添加域名失败',
                message: err,
                duration: 0,
                onClose: function () {
                }
              });
            });
            break;
          case 'close-domain-in-dialog':
            this.currentOpenedDialog = null;
            if (this.domainProps.showResponse) {
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
            this.currentOpenedDialog = null;
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
            this.currentOpenedDialog = null;
            if (this.unBindServiceProps.showResponse) {
              this.requestDomainList();
              this.unBindServiceProps.showResponse = false;
            }
            break;
        }
      },

      /**
       * action for add or remove domain
       * @param action
       * @param domain
       */
      handleDomainInDialog(action, domain) {
        let domainToAdd = this.domainProps.domainToAdd;

        switch (action) {
          case 'remove':
            if (domainToAdd.indexOf(domain) > -1) {
              domainToAdd.splice(domainToAdd.indexOf(domain), 1);
            }
            break;
          case 'add':
            this.domainProps.level2Name = this.domainProps.level2Name.trim();

            this.domainProps.stateForLevel2Name = '';
            this.domainProps.stateForDomainToAdd = '';
            if (!/^[a-z0-9][a-z0-9\-]{0,62}$/.exec(this.domainProps.level2Name)) {
              this.domainProps.stateForLevel2Name = '可以包含小写字符、数字、中划线，以字符数字开头，长度不超过63位';
              return;
            }
            if (domainToAdd.length >= 5) {
              this.domainProps.stateForDomainToAdd = '每次最多添加五个';
              return;
            }
            let itemToAdd = this.domainProps.level2Name + '.' + this.domainProps.level1Name;
            if (domainToAdd.indexOf(itemToAdd) > -1) {
              domainToAdd.splice(domainToAdd.indexOf(itemToAdd), 1);
            }
            domainToAdd.push(itemToAdd);
            this.domainProps.level2Name = '';
            break;
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