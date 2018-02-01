<template>
  <div id="domain-main">
    <div class="section-header">
      <div class="row">
        <my-version-condition-filter @service-condition-changed="onServiceConditionChanged"></my-version-condition-filter>
      </div>
      <div class="row">
        <el-button
                size="mini-extral"
                type="primary"
                :loading="waitingResponseStatus('open-create-domain-dialog')"
                @click="handleButtonClick('open-create-domain-dialog')">
          创建外网二级域名
        </el-button>
        <el-button
                size="mini-extral"
                type="warning"
                @click="handleButtonClick('open-bind-service-dialog')">绑定服务
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
          </div>
          <i class="el-icon-question"></i>
      </el-tooltip>
      </div>
    </div>
    <div class="section-content">
      <el-table
              :data="currentDomainList"
              style="width: 100%"
              v-loading="showLoading"
              element-loading-text="加载中"
              @selection-change="handleSelectionChangeInTable"
      >
        <el-table-column
                type="selection"
                width="55">
        </el-table-column>
        <el-table-column
                prop="internetDomain"
                label="外网二级域名">
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
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
        >
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="warning"
                    @click="handleRowButtonClick('to-white-list', scope.$index, scope.row)">
              绑定IP白名单
            </el-button>
            <el-button
                    size="mini-extral"
                    type="danger"
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

    <el-dialog :title="domainProps.showResponse?'创建外网域名结果':'创建外网二级域名'" :visible="selected.operation == 'add-domain-dialog'"
               :class="{'add-domain-dialog': true, 'show-response': domainProps.showResponse}"
               @close="handleDialogButtonClick('close-domain-dialog')"
    >
      <!--<el-tag type="success" disable-transitions>-->
        <!--<i class="el-icon-warning"></i>-->
        <!--<span>更改健康检查后需要重新【部署】才能生效！</span>-->
      <!--</el-tag>-->
      <div v-if="domainProps.showResponse">
        <div class="key title">外网域名</div>
        <div class="value title">添加状态</div>
        <div v-for="(value, key) in domainProps.serverResponse">
          <div class="key">{{key}}</div>
          <div class="value">{{value}}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center" v-if="domainProps.showResponse">
        <el-button type="primary"
                   @click="handleDialogButtonClick('close-domain-dialog')">确&nbsp定</el-button>
      </div>

      <el-form :model="domainProps" :rules="rules" size="mini" v-if="!domainProps.showResponse"
               label-width="120px" ref="newDomainForm">
        <el-form-item label="将要添加的域名" class="has-existed">
          <div v-if="domainProps.domainToAdd.length > 0">
            <el-tag
                    v-for="domain in domainProps.domainToAdd"
                    :key="domain"
                    closable
                    type="success"
                    size="small"
                    @close="handleAddDomainInDialog('remove', domain)"
            >{{domain}}</el-tag>
          </div>
          <div v-else>无</div>
        </el-form-item>
        <el-form-item label="外网二级域名" prop="level2">
          <el-input v-model="domainProps.level2"></el-input>
          <el-select v-model="domainProps.level1">
            <el-option v-for="item in domainProps.level1List" :value="item.domainName" :label="item.domainName"
                       :key="item.id"></el-option>
          </el-select>
          <el-button class="add-domain-btn" size="mini" @click="handleAddDomainInDialog('add')">添加</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!domainProps.showResponse">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('add-domain-dialog')"
                       :loading="waitingResponseStatus('add-domain-dialog')">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="handleDialogButtonClick('close-domain-dialog')">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="绑定服务" :visible="selected.operation == 'bind-service'"
               class="bind-service"
               @close="selected.operation = null"
    >
      <my-version-selector ref="version-selector-in-bind-service-dialog"></my-version-selector>
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
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('bind-service')"
                       :loading="waitingResponseStatus('bind-service')">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="selected.operation = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="解绑服务" :visible="selected.operation == 'unbind-service'"
               class="unbind-service"
               @close="selected.operation = null"
    >
      <div class="selected-domain">
        <span>将要解绑外网域名</span>
          <el-tag
                  v-for="(item, index) in rowsSelected"
                  :key="index"
                  type="success"
                  size="small"
          >{{item['internetDomain']}}</el-tag>
        <span>，解绑后会造成外网二级域名不可用，你确定需要这么做吗？</span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('unbind-service')"
                       :loading="waitingResponseStatus('unbind-service')">确&nbsp定</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="selected.operation = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  #domain-main {
    .section-header {
      margin: 5px;
      .el-select .el-input__inner {
        height: 24px;
      }
      .row {
        margin: 3px;
      }
    }
    .section-content {
      .el-table {
        margin-bottom: 40px;
        .el-table__row {
          .el-button {
            margin: 2px 4px 2px 0px;
            float: left;
          }
        }
        .el-table__expanded-cell {
          padding: 0px;
        }
      }
    }
    .el-dialog__wrapper {
      &.add-domain-dialog, &.bind-service {
        /*max-width: 900px;*/
        width: 80%;
        margin: 15px auto;
        .el-form {
          .el-form-item__content {
            text-align: left;
          }
        }
      }
      &.add-domain-dialog {
        &.show-response {
          .el-dialog__body {
            .key {
              &.title {
                font-weight: bold;
                text-align: center;
              }
              width: 160px;
              text-align: right;
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
              text-align: left;
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
      }
      &.unbind-service {
        .selected-domain {
          max-width: 500px;
          margin-top: 3px;
          text-align: left;
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #domain-main {
    .header {
      margin: 5px;
      font-size: 14px;
      .row {
        margin-bottom: 5px;
      }
      .el-icon-question {
        font-size: 16px;
        line-height: 24px;
        margin-left: 10px;
      }
    }
    .el-table {
      margin-bottom: 40px;
      .el-table__row {
        .el-button {
          margin: 2px 4px;
          float: left;
          &.expand {
            .el-icon-arrow-right {
              transform: rotate(90deg);
            }
          }
          .el-icon-arrow-right {
            vertical-align: middle;
            transition: transform 0.2s ease-in-out;
          }
          &:first-child {
            margin-left: 0px;
          }
        }
        .el-button + .el-button {
          margin-left: 0px;
        }
      }
      .el-table__expanded-cell {
        padding: 0px;
      }
    }
  }

</style>

<script>
  import MyVersionSelector from '../utils/components/version-selector.vue';
  import MyVersionConditionFilter from '../utils/components/version-condition-filter.vue';
  import StoreHelper from '../utils/store-helper.vue';
  import ElInput from "element-ui/packages/input/src/input";
  import ElSelect from "element-ui/packages/select/src/select";
  import ElOption from "element-ui/packages/select/src/option";
  import ElTooltip from "element-ui/packages/tooltip/src/main";
  export default {
    components: {ElTooltip, ElOption, ElSelect, ElInput, MyVersionSelector, MyVersionConditionFilter},
    mixins: [StoreHelper],
    created() {
    },
    mounted() {

    },
    data() {
      return {
        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        currentDomainList: [],
        rowsSelected: [],
        showLoading: false,
        responseStatus: {
          waiting: false,
          for: null,
        },

        // props for add domain
        domainProps: {
          dialogTitle: '创建外网二级域名',
          level1List: [],
          domainToAdd: [],
          showResponse: false,
          serverResponse: [],
          level1: '',
          level2: '',
        },

        appInfo: null,
        profileInfo: null,
        serviceInfo: null,

        selected: {
          operation: null,
          row: null,
        },
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
          level2: [{
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
    watch: {
    },
    methods: {
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
        if (this.appInfo && this.appInfo.hasOwnProperty('id') && this.appInfo.id != this.$storeHelper.APP_ID_FOR_ALL) {
          appID = this.appInfo.id;
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
        switch (action) {
          case 'to-white-list':
            let domain = row.domain;
            this.$router.push({
              path: '/profile/domain/white-list',
              query: {
                domain: domain,
              }
            });
            break;
          case 'remove':
            this.warningConfirm('删除外网二级域名将同时删除该域名关联的IP白名单，确定吗？').then(() => {
              this.$net.removeDomain({
                id: row.id
              }).then(msg => {
                this.$message.success(`成功删除域名${row['internetDomain']}`);
                this.requestDomainList();
              }).catch(msg => {
                this.$notify({
                  title: '删除域名失败',
                  message: msg,
                  duration: 0,
                  onClose: function () {
                  }
                });
              });
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '您已取消删除'
              });
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
        this.domainProps.level1List = [];
        this.domainProps.domainToAdd = [];
        this.domainProps.level2 = '';
        this.domainProps.showResponse = false;
      },
      showWaitingResponse(action) {
        this.responseStatus.waiting = true;
        this.responseStatus.for = action;
      },
      hiddenWaitingResponse() {
        this.responseStatus.waiting = false;
        this.responseStatus.for = null;
      },
      waitingResponseStatus(action) {
        return this.responseStatus.waiting && (this.responseStatus.for === action);
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
            this.showWaitingResponse(action);

            this.initDomainProps();
            this.$net.getDomainLevel1List({
              spaceId: this.profileInfo.id
            }).then(domain1List => {
              this.domainProps.level1List = domain1List;
              // init dialog value before open
              if (Array.isArray(domain1List) && domain1List.length > 0) {
                this.domainProps.level1 = domain1List[0]['domainName'];
              }
              this.selected.operation = 'add-domain-dialog';
              this.hiddenWaitingResponse();
//              console.log(this.domainProps.level1List);
            }).catch(err => {
              this.$message.error('获取运行环境信息失败！');
              this.hiddenWaitingResponse();
            });
            break;
          case 'open-bind-service-dialog':
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.selected.operation = 'bind-service';
            break;
          case 'open-unbind-service-dialog':
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.selected.operation = 'unbind-service';
            break;
        }
      },
      /**
       * action in popup dialog on the press of button-ok
       * @param action
       */
      handleDialogButtonClick(action) {
        switch (action) {
          case 'add-domain-dialog':
            this.domainProps.newDomain = [];
            this.showWaitingResponse(action);
//            console.log(this.domainProps);
//            console.log(this.domainProps.domainToAdd);
            this.$net.createDomain({
              "spaceId": this.profileInfo.id,
              "groupId": this.$storeHelper.currentGroupID,
//              applicationId: this.appInfo.appId,
              "internetDomainList": this.domainProps.domainToAdd
            }).then(content => {
              this.domainProps.serverResponse = content;
              this.domainProps.showResponse = true;
              this.hiddenWaitingResponse();
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
          case 'close-domain-dialog':
            this.selected.operation = null;
            if (this.domainProps.showResponse) {
              this.requestDomainList();
            }
            break;
          case 'bind-service':
//            console.log(this.rowsSelected);
            let domainIdList = this.rowsSelected.map(it => {
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
            if (!selectedValue || !selectedValue.hasOwnProperty('selectedService')) {
              this.$message.error('未找到服务信息！');
              return;
            }
            this.$net.domainBindService({
              serviceId: selectedValue['selectedService'].id,
              internetDomainIdList: domainIdList
            });
            break;
          case 'unbind-service':
//            this.showWaitingResponse(action);
//            setTimeout(() => {
//              this.hiddenWaitingResponse();
//              this.selected.operation = null;
//            }, 2000);
            break;
        }
      },

      /**
       * action for add or remove domain
       * @param action
       * @param domain
       */
      handleAddDomainInDialog(action, domain) {
        switch (action) {
          case 'remove':
            let items = this.domainProps.domainToAdd;
            items.splice(items.indexOf(domain), 1);
            break;
          case 'add':
            this.$refs.hasOwnProperty('newDomainForm') &&
            this.$refs['newDomainForm'].validate(valid => {
              if (valid) {
                let items = this.domainProps.domainToAdd;
                let domain = this.domainProps.level2 + '.' + this.domainProps.level1;
                if (items.indexOf(domain) > -1) {
                  items.splice(items.indexOf(domain), 1);
                }
                items.push(domain);
                this.domainProps.level2 = '';
              }
            });
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