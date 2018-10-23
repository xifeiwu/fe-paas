<template>
  <div id="oauth-url">
    <el-row class="header">
      <el-col :span="0"></el-col>
      <el-col :span="24">
        <div class="item">
          <label style="float: left; width: 100px; line-height: 26px">被访问的应用：</label>
          <el-select filterable v-model="searchCondition.appID" placeholder="请选择"
                     style="display:block; max-width: 280px; margin-left: 100px;">
            <el-option v-for="(item, index) in targetAppList"
                       :key="item.targetApplicationId" :label="item.targetApplicationName" :value="item.targetApplicationId">
            </el-option>
          </el-select>
        </div>
        <div class="item">
          <label style="float: left; width: 72px; line-height: 26px">访问环境：</label>
          <el-select v-model="searchCondition.production" placeholder="请选择"
                     style="display:block; max-width: 200px; margin-left: 72px;">
            <el-option :value="null" label="全部"></el-option>
            <el-option :value="true" label="生产环境"></el-option>
            <el-option :value="false" label="非生产环境"></el-option>
          </el-select>
        </div>
        <el-button size="mini-extral"
                   type="primary"
                   v-if="true"
                   :loading="statusOfWaitingResponse('search')"
                   @click="handleButtonClick('search')">搜索
        </el-button>
      </el-col>
    </el-row>
    <div class="access-key-list">
      <el-table
              :data="authorizeUrlListByPage"
              stripe
              :height="heightOfAccessKeyList"
              v-loading="showLoading"
              element-loading-text="加载中"
      >
        <el-table-column
                prop="targetApplicationName"
                label="被访问的应用"
                max-width="200"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                prop="profileName"
                label="访问环境"
                width="120"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <div>{{scope.row.profileName ? scope.row.profileName: '未配置'}}</div>
          </template>
        </el-table-column>
        <el-table-column
                prop="operatorName"
                label="授权人"
                width="120"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                label="授权时间"
                prop="authTime"
                width="120"
                headerAlign="center" align="center">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.authTime)">
              <div v-for="(item, index) in scope.row.authTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.authTime}}</div>
          </template>
        </el-table-column>
        <el-table-column
                prop="requestGroupName"
                label="申请授权的团队 / 应用"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <div>
              <span>{{scope.row.requestGroupName}}</span>
              <span style="color: #409EFF; font-weight: bold">/</span>
              <span>{{scope.row.requestApplicationName}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
                prop="requestGroupName"
                label="授权访问权限"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.detailList.length==0">无</div>
            <div v-if="scope.row.detailList.length<=2">
              <div v-for="(item, index) in scope.row.detailList">
                {{item.oauth}} <span style="color: #409EFF; font-weight: bold">/</span> {{item.resource}}
              </div>
            </div>
            <div v-else>
              <div>{{scope.row.detailList[0].oauth}} <span style="color: #409EFF; font-weight: bold">/</span> {{scope.row.detailList[0].resource}}</div>
              <div>{{scope.row.detailList[1].oauth}} <span style="color: #409EFF; font-weight: bold">/</span> {{scope.row.detailList[1].resource}}</div>
              <el-tooltip slot="trigger" effect="dark" placement="bottom">
                <div slot="content">
                  <div v-for="(item, index) in scope.row.detailList">
                    {{item.oauth }} <span style="color: #409EFF; font-weight: bold">/</span> {{ item.resource}}
                  </div>
                </div>
                <div class="more">详情...</div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="200"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :loading="statusOfWaitingResponse('oauth_modify_authorize_url_list') && selected.row.id === scope.row.id"
                    :class="[$storeHelper.permission['oauth_modify_authorize_url_list'].disabled ? 'disabled': 'warning']"
                    @click="handleTRClick($event, 'oauth_modify_authorize_url_list', scope.$index, scope.row)">
              授权配置
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    v-if="scope.row.enabled !== null"
                    type="text"
                    :class="[$storeHelper.permission['oauth_authorize_url_toggle_enable'].disabled ? 'disabled': 'primary']"
                    :loading="statusOfWaitingResponse('delete') && selected.row.id === scope.row.id"
                    @click="handleTRClick($event, 'oauth_authorize_url_toggle_enable', scope.$index, scope.row)">
              {{scope.row.enabled?'禁用':'开启'}}
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

    <el-dialog title="修改授权配置" :visible="selected.operation == 'oauth_modify_authorize_url_list'"
               class="config-authorize-url size-800"
               :close-on-click-modal="false"
               @close="selected.operation = null"
               v-if="selected.row"
    >
      <el-form :model="configAuthorizeUrlInfo" :rules="rulesForAuthorizeUrl" labelWidth="200px" size="mini" ref="configAuthorizeUrlForm">
        <el-form-item label="申请访问的团队/应用" class="request-app">
          <div>
            <span>{{selected.row.requestGroupName}}</span>
            <span style="color: #409EFF; font-weight: bold">/</span>
            <span>{{selected.row.requestApplicationName}}</span>
          </div>
        </el-form-item>
        <el-form-item label="访问环境" class="profile">
          {{selected.row.profileName}}
        </el-form-item>
        <el-form-item label="被访问的团队/应用" v-if="groupInfo" class="target-app big">
          <div>
            <span>{{groupInfo.name}}</span>
            <span style="color: #409EFF; font-weight: bold">/</span>
            <span>{{selected.row.targetApplicationName}}</span>
          </div>
        </el-form-item>
        <el-form-item label="被访问应用所属AccessKey" class="access-key" prop="accessKeyID">
          <el-select filterable v-model="configAuthorizeUrlInfo.accessKeyID" placeholder="请选择">
            <el-option v-for="(item, index) in configAuthorizeUrlInfo.accessKeyList"
                       :key="item.id" :label="item.clientId" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="已经授予的访问授权" class="authorize-url-list" v-if="configAuthorizeUrlInfo.authorizeUrlList.length>0">
          <el-row class="title">
            <el-col :span="11" class="oauth">所属权限</el-col>
            <el-col :span="11" class="resource">资源URL</el-col>
            <el-col :span="2" class="operation"></el-col>
          </el-row>
          <el-row class="has-exist"
                  v-for="(item, index) in configAuthorizeUrlInfo.authorizeUrlList"
                  :key="index"
          >
            <el-col :span="11" class="oauth">{{item.oauth}}</el-col>
            <el-col :span="11" class="resource">{{item.resource}}</el-col>
            <el-col :span="2" class="operation" style="text-align: center">
              <el-popover
                      width="160"
                      v-model="item.openPopover"
                      placement="left"
                      trigger="click"
                      popperClass="el-popover--small"
                      content="复制成功">
                <p style="color: #fa5555">确定要删除该条授权吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="handlePopoverButton('cancel', index, item)">取消</el-button>
                  <el-button type="danger" size="mini-extral" @click="handlePopoverButton('delete-authorize-url', index, item)">确定</el-button>
                </div>
                <el-button type="warning" size="mini-extral" round
                           slot="reference">删除</el-button>
              </el-popover>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="授予访问权限" class="all-authorize-url-list" :error="errorMsgForAuthorizeUrl">
          <el-row>
            <el-col :span="18">
              <el-select filterable v-model="configAuthorizeUrlInfo.authorizeUrlID" placeholder="请选择">
                <el-option v-for="(item, index) in configAuthorizeUrlInfo.authorizeUrlByAccessKey"
                           :key="item.id" :label="item.oauth + ' - ' + item['resource'] " :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" size="mini-extral"
                         @click="handleDialogButton('add-authorize-url')">添加</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div class="helper-text-expanded">
        <div class="title">提示<i class="el-icon-question"></i></div>
        <div class="item">1. 不进行任何授权，对方只能访问未被限制的资源，被限制的资源必须授予权限后，对方才能带token进行访问</div>
        <div class="item">2. 授权完毕后，通知申请团队重启应用后才能使授权信息生效</div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       :loading="statusOfWaitingResponse('submit-authorize-url-in-dialog')"
                       @click="handleDialogButton('submit-authorize-url')"
            >保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.operation = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
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
  #oauth-url {
    .el-row.header {
      .el-input {
        input {
          height: 26px;
        }
      }
      .el-select .el-input__inner {
        height: 26px;
      }
    }
    .el-dialog__wrapper {
      .el-form.el-form--inline {
        margin-bottom: 6px;
        text-align: left;
        .el-form-item {
          margin: 0px;
          width: calc(50% - 2px);
          &.big {
            @include expand-inline-form-item;
            .el-form-item__content {
              margin-left: 140px;
            }
          }
        }
      }
      &.config-authorize-url {
        .el-form {
          &.el-form--inline {
            .el-form-item {
              &.request-app {
                width: calc(66% - 2px);
              }
              &.profile {
                width: calc(33% - 2px);
              }
              &.target-app {
                .el-form-item__content {
                  margin-left: 160px;
                }
              }
            }
          }
          .el-form-item {
            &.request-app, &.profile, &.target-app, &.authorize-url-list {
              margin-bottom: 2px;
            }
            &.access-key {
              .el-input {
                width: 300px;
              }
            }
            &.authorize-url-list {
              .oauth, .resource {
                text-align: center;
              }
              .el-row.title {
                font-weight: bold;
              }
            }
            &.all-authorize-url-list {
              .el-row {
                .el-col {
                  padding-right: 4px;
                  .el-select {
                    width: 100%;
                    max-width: 450px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #oauth-url {
    height: calc(100% - 30px);
    .el-row.header {
      padding: 5px;
      font-size: 14px;
      line-height: 20px;
      i {
        font-size: 14px;
      }
      .el-col {
        vertical-align: middle;
        .item {
          margin: 1px;
          display: inline-block;
        }
      }
    }
    .el-table {
      .more {
        font-size: 12px;
      }
    }
  }
</style>

<script>
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  module.exports = {
    created() {
    },
    mounted() {
      // whether need to request access key list or not
      let updateAccessList = false;
      if (!Array.isArray(this.authorizeUrlListByPage)) {
        updateAccessList = true;
      } else if (this.authorizeUrlListByPage.length == 0) {
        updateAccessList = true;
      }
      if (updateAccessList) {
        this.requestAuthorizeUrlList();
      }
//      if (!this.targetAppList || this.targetAppList.length === 0) {
      this.getTargetAppList(this.$storeHelper.currentGroupID);
//      }
      // adjust element height after resize
      try {
        let header = this.$el.querySelector('.header:first-child');
        let accessKeyList = this.$el.querySelector('.access-key-list');
        this.resizeListener = (evt) => {
          let height = this.$el.clientHeight;
          let heightOfHeader = header.offsetHeight;
          let heightOfContent = height - heightOfHeader;
          accessKeyList.style.height = heightOfContent + 'px';
          this.heightOfAccessKeyList = height - heightOfHeader - 20;
        };
        addResizeListener(this.$el, this.resizeListener)
      } catch(err) {
      }
    },
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },

    data() {
      return {
        resizeListener: () => {},
        heightOfAccessKeyList: '',

        queueForWaitingResponse: [],

        targetAppList: [],
        showLoading: false,
        searchCondition: {
          appID: null,
          production: null,
        },
        authorizeUrlListByPage: [],

        selected: {
          row: {id: null},
          operation: null,
          prop: null,
        },
        errorMsgForAuthorizeUrl: '',
        errorMsgForAccessKey: '',
        rulesForAuthorizeUrl: {
          accessKeyID: [{
            required: true,
            message: 'AccessKey不能为空',
          }],
        },
        configAuthorizeUrlInfo: {
          accessKey: '',
          accessKeyID: '',
          accessKeyList: [],
          authorizeUrlID: '',
          authorizeUrlByAccessKey: [],
          authorizeUrlList: []
        },

        // for pagination
        totalSize: 0,
        pageSize: 10,
        currentPage: 1,
      }
    },
    computed: {
      groupInfo() {
        return this.$storeHelper.groupInfo;
      },
    },
    watch: {
      '$storeHelper.currentGroupID': 'getTargetAppList',
      'searchCondition.appID': function() {
        this.currentPage = 1;
        this.requestAuthorizeUrlList()
      },
      'searchCondition.production': function() {
        this.currentPage = 1;
        this.requestAuthorizeUrlList()
      },
      'configAuthorizeUrlInfo.accessKeyID': function (accessKeyID) {
        if (!accessKeyID) {
          return;
        }
        let accessKey = '';
        this.configAuthorizeUrlInfo.accessKeyList.some(it => {
          if (it.id === accessKeyID) {
            accessKey = it.clientId;
          }
          return accessKey;
        });
        this.configAuthorizeUrlInfo.accessKey = accessKey;

        this.configAuthorizeUrlInfo.authorizeUrlByAccessKey = [];
        this.configAuthorizeUrlInfo.authorizeUrlID = '';
        this.$net.oauthGetUrlPermissionList(accessKeyID).then(urlPermissionList => {
          if (Array.isArray(urlPermissionList) && urlPermissionList.length > 0) {
            this.configAuthorizeUrlInfo.authorizeUrlByAccessKey = urlPermissionList;
            this.configAuthorizeUrlInfo.authorizeUrlID = urlPermissionList[0].id;
          }
//          console.log(urlPermissionList);
        })
      },
      // update errorMsg
      'configAuthorizeUrlInfo.authorizeUrlID': {
        deep: true,
        immediate: true,
        handler(value, oldValue) {
          this.checkExistBeforeAddAuthorizeUrl();
        }
      }
    },

    methods: {
      /**
       * get has oauthed app list in current Group, which is used for search filter
       */
      // called at: 1. start of page, 2. change of gorupID
      getTargetAppList (groupID) {
        if (!groupID) {
          return;
        }
        this.$net.oauthGetTargetAppList(groupID).then(appList => {
          this.targetAppList = appList;
          this.targetAppList.unshift({
            targetApplicationId: this.$storeHelper.GROUP_ID_FOR_ALL,
            targetApplicationName: '全部'
          });
          this.searchCondition.appID = this.$storeHelper.GROUP_ID_FOR_ALL;
          this.currentPage = 1;
          this.requestAuthorizeUrlList();
        }).catch(err => {
          console.log(err);
          this.targetAppList = [{
            targetApplicationId: this.$storeHelper.GROUP_ID_FOR_ALL,
            targetApplicationName: '全部'
          }];
          this.searchCondition.appID = this.$storeHelper.GROUP_ID_FOR_ALL;
        });
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

      handleButtonClick(action) {
        switch (action) {
          case 'search':
//          console.log(this.searchCondition);
            this.requestAuthorizeUrlList();
            break;
        }
      },

      handleTRClick(evt, action, index, row) {
      if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
        this.$storeHelper.globalPopover.show({
          ref: evt.target,
          msg: this.$storeHelper.permission[action].reason
        });
        return;
      }
        this.selected.row = row;
        switch (action) {
          case 'oauth_modify_authorize_url_list':
//            console.log(row);
            // reset error tip
            if (!row.hasOwnProperty('targetApplicationId') || !row.hasOwnProperty('produceEnv')) {
              this.$message.error('信息不完整！');
              return;
            }
            const openDialog = () => {
              if (Array.isArray(row.detailList)) {
                this.configAuthorizeUrlInfo.authorizeUrlList = row.detailList.map(it => {
                  return {
                    id: it.id,
                    oauth: it.oauth,
                    resource: it.resource,
                    clientId: it['requestClientId'],
                    openPopover: false
                  }
                });
              } else {
                this.configAuthorizeUrlInfo.authorizeUrlList = [];
              }
              this.selected.operation = action;
            };

            this.addToWaitingResponseQueue(action);
            this.errorMsgForAuthorizeUrl = '';
            this.configAuthorizeUrlInfo.accessKeyList = [];
            this.configAuthorizeUrlInfo.accessKeyID = '';
            this.$net.oAuthGetAccessKeyListByApp({
              applicationId: row['targetApplicationId'],
              productEnv: row['produceEnv']
            }).then(accessKeyList => {
              this.hideWaitingResponse(action);
              if (Array.isArray(accessKeyList) && accessKeyList.length > 0) {
                this.configAuthorizeUrlInfo.accessKeyList = accessKeyList;
                this.configAuthorizeUrlInfo.accessKeyID = accessKeyList[0].id;
                openDialog();
//                console.log(this.configAuthorizeUrlInfo);
              } else {
                this.$notify.error({
                  title: '被访问的应用没有AccessKey',
                  message: `请先在 "AccessKey列表页面" 为被访问的应用 "${row.targetApplicationName}" 创建AccessKey，否则无法进行授权配置`,
                  duration: 0,
                  onClose: function () {
                  }
                });
              }
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
          case 'oauth_authorize_url_toggle_enable':
//            console.log(row);
            if (row.hasOwnProperty('enabled')) {
              if (row.enabled === true || row.enabled === false) {
                this.$net.oauthToggleAuthorizeUrlEnable(row.id, {
                  enableOrDisable: !row.enabled
                }).then(msg => {
                  this.$message.success(msg);
                  row.enabled = !row.enabled;
                }).catch(msg => {
                  this.$notify.error({
                    title: '修改失败！',
                    message: msg,
                    duration: 0,
                    onClose: function () {
                    }
                  });
                });
              }
            }
            break;
        }
      },

      ifAuthorizeUrlChanged(origin, current) {
        let theSame = true;
        // no need to compare when current.authorizeUrlList is empty
        if (current.authorizeUrlList.length === 0) {
          theSame = false;
        }
        if (theSame) {
          let detailList = origin.detailList;
          let authorizeUrlList = current.authorizeUrlList;
          if (detailList.length === authorizeUrlList.length) {
            let index = 0;
            detailList.every((it) => {
              let it2 = authorizeUrlList[index];
              index += 1;
              theSame = it.oauth == it2.oauth && it.resource == it2.resource;
              return theSame;
            });
          } else {
            theSame = false;
          }
        }
        return !theSame;
      },

      /**
       * 1. add, 2. delete, 3 change of
       */
      checkExistBeforeAddAuthorizeUrl() {
        let target = null;
        this.configAuthorizeUrlInfo.authorizeUrlList.some(it => {
          if (it.id === this.configAuthorizeUrlInfo.authorizeUrlID) {
            target = it;
          }
          return target;
        });
        if (target) {
          this.errorMsgForAuthorizeUrl = '该权限已经存在';
        } else {
          this.errorMsgForAuthorizeUrl = '';
        }
        return target;
      },

      handleDialogButton(action, index, item) {
        switch (action) {
          case 'add-authorize-url':
//            console.log(this.configAuthorizeUrlInfo);
            if (this.checkExistBeforeAddAuthorizeUrl()) {
              return;
            }
            if (Array.isArray(this.configAuthorizeUrlInfo.authorizeUrlByAccessKey) && this.configAuthorizeUrlInfo.authorizeUrlID) {
              let item = null;
              this.configAuthorizeUrlInfo.authorizeUrlByAccessKey.some(it => {
                if (it.id === this.configAuthorizeUrlInfo.authorizeUrlID) {
                  item = it;
                }
                return item;
              });
              if (item) {
                this.configAuthorizeUrlInfo.authorizeUrlList.push(item);
              }
            }

            break;
//          case 'delete-authorize-url':
//            if (item && item.hasOwnProperty('openPopover')) {
//              item.openPopover = true;
//            }
//            break;
          case 'submit-authorize-url':
            this.$refs['configAuthorizeUrlForm'].validate((valid) => {
              if (!valid) {
                return;
              }
              if (this.configAuthorizeUrlInfo.authorizeUrlList.length === 0) {
                this.errorMsgForAuthorizeUrl = '至少要有一条授权URL记录';
                return;
              }
              if (!this.ifAuthorizeUrlChanged(this.selected.row, this.configAuthorizeUrlInfo)) {
                this.$message.warning('您没有修改授权URL');
                this.selected.operation = null;
                return;
              }
              let oauthList = this.configAuthorizeUrlInfo.authorizeUrlList.map(it => {
                return it.oauth;
              });
              this.addToWaitingResponseQueue(action + '-in-dialog');

              this.$net.oauthModifyAuthorizeList(this.selected.row.id, {
                supportClientId: this.configAuthorizeUrlInfo.accessKey,
//                detailList: detailList
                oauthList: oauthList
              }).then(msg => {
                this.hideWaitingResponse(action + '-in-dialog');
                this.selected.operation = null;
                this.updateModelInfo('authorizeUrlList');
                this.$message.success(msg);
                // refresh after update authorizeUrlList
                this.requestAuthorizeUrlList();
              }).catch(msg => {
                this.hideWaitingResponse(action + '-in-dialog');
                this.selected.operation = null;
                this.$notify.error({
                  title: '修改失败！',
                  message: msg,
                  duration: 0,
                  onClose: function () {
                  }
                });
              });
            });
            break;
        }
      },
      updateModelInfo(prop) {
        switch (prop) {
          case 'authorizeUrlList':
//            this.selected.row.supportClientId = this.configAuthorizeUrlInfo.accessKeyID;
            this.selected.row.detailList = this.configAuthorizeUrlInfo.authorizeUrlList.map(it => {
              return {
                oauth: it.oauth,
                resource: it.resource,
                openPopover: false
              }
            });
            this.selected.row.enabled = true;
            break;
        }
      },
      handlePopoverButton(action, index, item) {
        switch (action) {
          case 'delete-authorize-url':
            this.configAuthorizeUrlInfo.authorizeUrlList.splice(index, 1);
            item['openPopover'] = false;
            this.checkExistBeforeAddAuthorizeUrl();
            break;
          case 'cancel':
            item['openPopover'] = false;
            break;
        }
      },

      // the first page of pagination is 1
      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestAuthorizeUrlList();
      },

      /**
       * update access-key list, called at:
       * 1. mounted function at start of page
       * 2. change of pagination
       * 3. search button
       * 4. success callback of delete access-key
       * @param cb
       */
      requestAuthorizeUrlList(cb) {
        if (!cb) {
          cb = function () {
          };
        }
        if (null == this.searchCondition.appID) {
          return;
        }
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;
        let targetAppID = this.searchCondition.appID;
        let options = {
          targetGroupId: this.$storeHelper.currentGroupID,
          targetApplicationId: targetAppID == this.$storeHelper.APP_ID_FOR_ALL ? '' : targetAppID,
          start: start,
          length: length,
        };
        // productEnv will not add to options if production=null(访问环境=全部)
        if (null !== this.searchCondition.production) {
          options.productEnv = this.searchCondition.production;
        }
        this.showLoading = true;
//      {
//        "targetApplicationName": "被访问的应用",
//        "envName": "访问环境",
//        "operatorName": '授权人',
//        "createTime": '授权时间',
//        "requestGroupName": '授权访问团队',
//        "detailList": []
//      }
        this.$net.oauthGetAuthorizeUrlList(options).then(content => {
          if (content.hasOwnProperty('authRecordList')) {
            this.authorizeUrlListByPage = content['authRecordList'];
            this.totalSize = content.total;
          }
          this.showLoading = false;
          cb(true)
        }).catch(msg => {
          this.showLoading = false;
          this.$notify.error({
            title: '修改失败！',
            message: msg,
            duration: 0,
            onClose: function () {
            }
          });
          cb(false)
        });
      },
    }
  }
</script>