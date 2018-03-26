<template>
  <div id="oauth-key">
    <el-row class="header">
      <el-col :span="4">
        <el-button
                size="mini-extral"
                type="primary"
                :load="statusOfWaitingResponse('create-access-key')"
                @click="handleButtonClick('create-access-key')">
          创建Access Key
        </el-button>
      </el-col>
      <el-col :span="20" class="key-selector">
        <div class="item">
          <label style="float: left; width: 100px; line-height: 26px">访问对方团队：</label>
          <el-select filterable v-model="searchCondition.groupID" placeholder="请选择"
                     style="display:block; max-width: 280px; margin-left: 100px;">
            <el-option v-for="(item, index) in targetGroupList"
                       :key="item.targetGroupId" :label="item.targetGroupName" :value="item.targetGroupId">
            </el-option>
          </el-select>
        </div>
        <div class="item">
          <label style="float: left; width: 72px; line-height: 26px">访问环境：</label>
          <el-select v-model="searchCondition.production" placeholder="请选择" style="display:block; max-width: 200px; margin-left: 72px;">
            <el-option :value="true" label="生产环境"></el-option>
            <el-option :value="false" label="非生产环境"></el-option>
          </el-select>
        </div>
        <div class="item">
          <label style="float: left; width: 90px; line-height: 26px">Access Key：</label>
          <el-input v-model="searchCondition.accessKey"
                    style="display:block; width: 200px; margin-left: 90px;"></el-input>
        </div>
        <el-button size="mini-extral"
                   type="primary"
                   :loading="statusOfWaitingResponse('search')"
                   @click="handleButtonClick('search')">搜索</el-button>
      </el-col>
    </el-row>
    <div class="access-key-list">
      <el-table
              :data="accessKeyListByPage"
              stripe
              v-loading="showLoading"
              element-loading-text="加载中"
      >
        <el-table-column
          prop="accessKey"
          label="Access Key"
          width="120"
          headerAlign="center" align="center">
          <template slot-scope="scope">
            <div class="access-key">
              <span>{{scope.row.accessKey}}</span>
              <el-popover
                      placement="bottom"
                      trigger="click"
                      :disabled="disablePopper"
                      popperClass="el-popover--small is-dark"
                      content="复制成功">
                <i class="my-icon-copy" slot="reference"
                   v-clipboard:copy="scope.row.accessKey"
                   v-clipboard:success="handleTRClick.bind(this, 'copy-access-key', scope.$index, scope.row)"></i>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="secret"
          label="Access Secret"
          width="120"
          headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
          prop="myApp"
          label="我的应用"
          width="80"
          headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
          prop="accessConfigDesc"
          label="访问应用信息-状态"
          headerAlign="center" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.accessConfigDesc.length==0">无</div>
            <div v-if="scope.row.accessConfigDesc.length<=2">
              <div v-for="(item, index) in scope.row.accessConfigDesc">
                {{item}}
              </div>
            </div>
            <div v-else>
              <div>{{scope.row.accessConfigDesc[0]}}</div>
              <div>{{scope.row.accessConfigDesc[1]}}</div>
              <el-tooltip slot="trigger" effect="dark" placement="bottom">
                <div slot="content">
                  <div v-for="(item, index) in scope.row.accessConfigDesc">
                    {{item}}
                  </div>
                </div>
                <div class="more-access-config">更多...</div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="profileName"
          label="访问环境"
          width="90"
          headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
          prop="creatorName"
          label="创建人"
          width="90"
          headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                label="创建时间"
                prop="createTime"
                width="120"
                headerAlign="center" align="center">
          <template slot-scope="scope">
            <div v-for="(item, index) in scope.row.createTime" :key="index">
              {{item}}
            </div>
          </template>
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="260"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="warning"
                    :loading="statusOfWaitingResponse('modify-access-config') && selected.row.id === scope.row.id"
                    @click="handleTRClick('modify-access-config', scope.$index, scope.row)">
              访问配置
            </el-button>
            <el-button
                    size="mini-extral"
                    type="warning"
                    :loading="statusOfWaitingResponse('modify-secret') && selected.row.id === scope.row.id"
                    @click="handleTRClick('modify-secret', scope.$index, scope.row)">修改秘钥
            </el-button>
            <el-button
                    size="mini-extral"
                    type="danger"
                    :loading="statusOfWaitingResponse('delete') && selected.row.id === scope.row.id"
                    @click="handleTRClick('delete', scope.$index, scope.row)">删除
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

    <el-dialog title="修改访问配置" :visible="selected.operation == 'modify-access-config'"
               class="modify-access-config size-700"
               :close-on-click-modal="false"
               @close="selected.operation = null"
               v-if="selected.row"
    >
      <el-tag type="warning" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>如需更换团队，请在页面右上角选择我的团队</span>
      </el-tag>
      <el-form :model="modifyAccessConfig" :rules="rulesForAccessConfig" labelWidth="110px" size="mini" ref="modifyAccessConfigForm">
        <el-form-item label="我的团队" v-if="groupInfo">
          {{groupInfo.name}}
        </el-form-item>
        <el-form-item label="我的应用" prop="appID">
          <el-select filterable v-model="modifyAccessConfig.appID" placeholder="请选择" style="display:block; max-width: 280px;">
            <el-option v-for="(item, index) in appListOfCurrentGroup" :key="item.appId" :label="item.serviceName" :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="访问环境" prop="production">
          <el-select v-model="modifyAccessConfig.production" placeholder="请选择" style="display:block; max-width: 280px;">
            <el-option :value="true" label="生产环境"></el-option>
            <el-option :value="false" label="非生产环境"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="已绑应用" class="access-config-list">
          <el-row class="title">
            <el-col :span="7" class="group">团队</el-col>
            <el-col :span="7" class="app">应用</el-col>
            <el-col :span="7" class="app">状态</el-col>
            <el-col :span="3"></el-col>
          </el-row>
          <el-row class="has-exist"
                  v-for="(item, index) in modifyAccessConfig.hasExisted"
                  :key="index"
          >
            <el-col :span="7" class="group">{{item.targetGroupName}}</el-col>
            <el-col :span="7" class="app">{{item.targetApplicationName}}</el-col>
            <el-col :span="7" class="app">{{item.status}}</el-col>
            <el-col :span="3" style="text-align: right">
              <el-popover
                      width="160"
                      v-model="item.openPopover"
                      placement="left"
                      trigger="click"
                      popperClass="el-popover--small"
                      content="复制成功">
                <p style="color: #fa5555">这是一段内容这是一段内容确定删除吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="handlePopoverButton('cancel', index, item)">取消</el-button>
                  <el-button type="danger" size="mini" @click="handlePopoverButton('delete-access-config', index, item)">确定</el-button>
                </div>
                <el-button type="warning" size="mini-extral"
                           slot="reference"
                           :loading="statusOfWaitingResponse('delete-access-config-in-dialog') && selected.row.id === scope.row.id"
                           @click="handleDialogButton('delete-access-config', index, item)">删除</el-button>
              </el-popover>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="访问对方团队" prop="accessGroupID" class="add-access-config"
                      style="margin-bottom: 20px"
                      :error="errorMsgForAddAccessConfig">
          <el-row>
            <el-col :span="11">
              <el-select filterable v-model="modifyAccessConfig.accessGroupID" placeholder="请选择" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForAccessConfig.groupListAll" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="11">
              <el-select filterable v-model="modifyAccessConfig.accessAppID" placeholder="请选择" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForAccessConfig.appList" :key="item.appId" :label="item.appName" :value="item.appId">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="2" style="text-align: right">
              <el-button
                size="mini-extral"
                type="warning"
                style="margin-bottom: 3px"
                :loading="statusOfWaitingResponse('add-access-config-in-dialog') && selected.row.id === scope.row.id"
                @click="handleDialogButton('add-access-config')">添加
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButton('modify-access-config')"
                       >保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.operation = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="更改秘钥" :visible="selected.operation == 'modify-secret'"
               class="modify-secret"
               :close-on-click-modal="false"
               @close="selected.operation = null"
               v-if="selected.row"
    >
      <el-form :model="newProps" :rules="rulesForNewProps" labelWidth="160px" size="mini" ref="modifySecretForm">
        <el-form-item label="Access Key：">
          {{selected.row.accessKey}}
        </el-form-item>
        <el-form-item label="Access Secret：" prop="secret">
          <el-input v-model="newProps.secret" placeholder="中文，英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButton('modify-secret')"
                       :loading="statusOfWaitingResponse('modify-secret-in-dialog')">确&nbsp定</el-button>
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
  #oauth-key {
    .el-dialog__wrapper {
      &.modify-secret {
        width: 80%;
        max-width: 600px;
        margin: 15px auto;
        .el-dialog {
          width: 100%;
        }
      }
      &.modify-access-config {
        .el-dialog {
          width: 80%;
          max-width: 700px;
          margin: 15px auto;
          .add-access-config {
            .el-col {
              padding: 0px 2px;
            }
          }
          .el-form {
            .el-form-item--mini {
              margin-bottom: 5px;
            }
          }
        }
        .el-tag {
          display: block;
          line-height: 26px;
          height: 26px;
          text-align: left;
          .el-icon-warning {
            vertical-align: middle;
          }
        }
        .el-form {
          .el-form-item {
            .group, .app {
              text-align: center;
            }
            .el-row.title {
              font-weight: bold;
            }
            .has-exit {
              .group, .app {
                word-wrap: break-word;
                word-break: break-all;
                line-height: 1.2;
              }
            }
            .el-row.add-key-value {
              .el-col.group, .el-col.app {
                padding: 0px 3px;
              }
            }
          }
        }
      }
      .el-col .el-button {
        vertical-align: middle;
      }
    }
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
  }
</style>
<style lang="scss" scoped>
#oauth-key {
  .el-row.header {
    margin: 5px;
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
    .access-key {
      line-height: 26px;
      text-align: center;
      .my-icon-copy {
        font-size: 16px;
        margin-left: 5px;
        &:hover {
        }
        &:active {
          color: #409EFF;
          font-weight: bold;
        }
      }
    }
    .more-access-config {
      &:hover {
        cursor: pointer;
      }
    }
    .el-button {
      margin: 2px 4px;
    }
  }
}
</style>

<script>
module.exports = {
  created() {
//    console.log(this.appInfoListOfGroup);
  },
  mounted() {
    // whether need to request access key list or not
    let updateAccessList = false;
    if (!Array.isArray(this.accessKeyListByPage)) {
      updateAccessList = true;
    } else if(this.accessKeyListByPage.length == 0) {
      updateAccessList = true;
    }
    if (updateAccessList) {
      this.requestAccessKeyList();
    }
    if (!this.targetGroupList || this.targetGroupList.length === 0) {
      this.getTargetGroupList(this.$storeHelper.currentGroupID)
    }
  },

  data() {
    return {
      queueForWaitingResponse: [],

      targetGroupList: [],
      showLoading: false,
      createAccessKeyTag: null,
      searchCondition: {
        groupID: '',
        production: true,
        accessKey: ''
      },
      accessKeyListByPage: [],
      disablePopper: false,
      popoverForDeleteAccessConfig: true,

      selected: {
        row: {id: null},
        operation: null,
        prop: null,
      },

      // prop used for dialog modify-access-config
      errorMsgForAddAccessConfig: '',
      modifyAccessConfig: {
        appID: null,
        production: null,
        hasExisted: [],
        accessGroupID: null,
        accessAppID: null,
      },
      rulesForAccessConfig: {
        appID: [{
          required: true,
          message: '应用不能为空',
        }],
        production: [{
          required: true,
          message: '必须选择生产环境',
        }],
        accessGroupID: [{
          required: true,
          message: '必须选择生产环境',
        }],
        accessAppID: [{
          required: true,
          message: '必须选择生产环境',
        }],
      },
      dataForAccessConfig: {
        groupListAll: null,
        appList: []
      },

      newProps: {
        secret: ''
      },
      rulesForNewProps: {
        secret: [{
          required: true,
          message: '内容不能为空',
        }],
      },

      totalSize: 0,
      pageSize: 10,
      currentPage: 1,
    }
  },

  computed: {
    groupInfo() {
      return this.$storeHelper.groupInfo();
    },
    appListOfCurrentGroup() {
      let appInfoListOfGroup = this.$storeHelper.appInfoListOfGroup();
      if (appInfoListOfGroup && appInfoListOfGroup.hasOwnProperty('appList')) {
        return appInfoListOfGroup.appList;
      } else {
        return [];
      }
    },
  },
  
  watch: {
    '$storeHelper.currentGroupID': 'getTargetGroupList',
    'modifyAccessConfig.accessGroupID': function (value) {
//      console.log(value);
      this.$net.getAppListByGroupID({
        groupId: value
      }).then(content => {
        if (content && content.hasOwnProperty('appList')) {
          if (Array.isArray(content.appList)) {
            this.dataForAccessConfig.appList = content.appList;
            if (content.appList.length > 0) {
              this.modifyAccessConfig.accessAppID = content.appList[0].appId;
            }
          }
        }
      });
    }
  },

  methods: {
    // called at: 1. start of page, 2. change of gorupID
    getTargetGroupList (groupID) {
//      console.log(`currentGroupID: ${value}`);
      if (!groupID) {
        return;
      }
      this.$net.oAuthGetTargetGroupList({
        requestGroupId: groupID
      }).then(groupList => {
        this.targetGroupList = groupList;
        this.targetGroupList.unshift({
          targetGroupId: this.$storeHelper.GROUP_ID_FOR_ALL,
          targetGroupName: '全部'
        });
        this.searchCondition.groupID = this.$storeHelper.GROUP_ID_FOR_ALL;
      }).catch(err => {
        console.log(err);
        this.targetGroupList = [{
          targetGroupId: this.$storeHelper.GROUP_ID_FOR_ALL,
          targetGroupName: '全部'
        }];
        this.searchCondition.groupID = this.$storeHelper.GROUP_ID_FOR_ALL;
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

    getEmptyItem() {
      return {
        accessKey: '',
        secret: '',
        myApp: '',
        appAccessStatus: '',
        requestApplicationNames: [],
        profileName: '测试环境',
        creatorName: '',
        status: '',
        createTime: ''
      }
    },
    handleButtonClick(action) {
      switch (action) {
        case 'create-access-key':
          this.addToWaitingResponseQueue('create-access-key');
          if (this.createAccessKeyTag) {
            let duration = new Date().getTime() - this.createAccessKeyTag;
            if (duration > 5 * 1000) {
              this.$message.warning(`请${duration/100}秒后再尝试创建！`);
              return;
            }
          }
          this.createAccessKeyTag = new Date().getTime();
          this.$net.oAuthCreateAccessKey({
            groupId: this.$storeHelper.currentGroupID
          }).then(content => {
            let item = this.getEmptyItem();
            item.createTime = content.createTime;
            item.creatorName = content.creatorName;
            item.secret = content.secret;
            item.accessKey = content.client_id;
            this.accessKeyListByPage.unshift(item);
            this.hideWaitingResponse('create-access-key');
          }).catch(msg => {
            this.hideWaitingResponse('create-access-key');
            this.$notify.error({
              title: '创建Access Key失败！',
              message: msg,
              duration: 0,
              onClose: function () {
              }
            });
          });
          break;
        case 'search':
          this.currentPage = 1;
          this.addToWaitingResponseQueue(action);
          this.requestAccessKeyList(() => {
            this.hideWaitingResponse(action);
          });
          break;
      }
    },
    /**
     * click handler for button in table row
     * @param action
     * @param index
     * @param row
     */
    handleTRClick(action, index, row) {
      this.selected.row = row;
      switch (action) {
        case 'copy-access-key':
          this.disablePopper = false;
          setTimeout(() => {
            this.disablePopper = true;
          }, 500);
//          this.$message.success('复制成功');
          break;
        case 'modify-access-config':
          let openDialog = ()=>  {
            if (Array.isArray(this.selected.row.accessConfigList)) {
              this.modifyAccessConfig.hasExisted = this.selected.row.accessConfigList.map(it => {
                return {
                  status: it.status,
                  targetApplicationId: it.targetApplicationId,
                  targetApplicationName: it.targetApplicationName,
                  targetGroupId: it.targetGroupId == this.$storeHelper.GROUP_ID_FOR_ALL ? '' : it.targetGroupId,
                  targetGroupName: it.targetGroupName,
                  openPopover: false
                }
              });
            } else {
              this.modifyAccessConfig.hasExisted = [];
            }
            this.selected.operation = action;
            // remove error tip for button add-access-config
            this.errorMsgForAddAccessConfig = '';
          };
          this.addToWaitingResponseQueue(action);
          // check dialog-related-data before open dialog
          // as margin-bottom of el-form-item is not set for error show in el-form of dialog modify-access-config
          if (!this.groupInfo || !this.appListOfCurrentGroup) {
            this.$message.error('信息不完整');
            return;
          }
          if (!this.modifyAccessConfig.appID) {
            this.modifyAccessConfig.appID = this.appListOfCurrentGroup[0].appId;
          }
          if (null == this.modifyAccessConfig.production) {
            this.modifyAccessConfig.production = false;
          }
          if (!this.dataForAccessConfig.groupListAll) {
            this.$net.getAllGroupList().then(content => {
              if (content.hasOwnProperty('groupList')) {
                let groupList = content.groupList;
                if (Array.isArray(groupList)) {
                  this.dataForAccessConfig.groupListAll = groupList;
                  if (groupList.length > 0) {
                    this.modifyAccessConfig.accessGroupID = groupList[0].id;
                  }
                }
              }
              this.hideWaitingResponse(action);
              // open dialog for modify-access-config
              openDialog();
            }).catch(err => {
              this.hideWaitingResponse(action);
//              this.selected.operation = action;
            })
          } else {
            this.hideWaitingResponse(action);
            // set default accessID if necessary
            if (Array.isArray(this.dataForAccessConfig.appList) && this.dataForAccessConfig.appList.length > 0) {
              this.modifyAccessConfig.accessAppID = this.dataForAccessConfig.appList[0].appId;
            }
            openDialog();
          }

          if (this.selected.operation) {
            this.$nextTick(() => {
              let formName = 'modifyAccessConfigForm';
              this.$refs.hasOwnProperty(formName) && this.$refs[formName].validate((valid) => {
                console.log(`valid: ${valid}`)
              })
            });
          }
          break;
        case 'modify-secret':
          this.newProps.secret = row.secret;
          this.selected.operation = action;
          break;
        case 'delete':
          let appToDelete = '';
          if (this.selected.row.myAPP) {
            appToDelete = this.seelcted.row.myAPP;
          }
          this.warningConfirm('删除Oauth授权',
            `你确定要删除${appToDelete}Oauth授权？它将会造成授权的URL不可访问。`).then(() => {
            this.$net.oauthDeleteAccessKey(this.selected.row.id).then(msg => {
              this.$message.success(msg);
              this.requestAccessKeyList();
            }).catch((msg) => {
              this.$notify.error({
                title: '删除Oauth授权失败！',
                message: msg,
                duration: 0,
                onClose: function () {
                }
              });
            });
          }).catch(err => {
          });
          break;
      }
    },

    handleDialogButton(action, index, item) {
      switch (action) {
        case 'add-access-config':
          console.log(this.modifyAccessConfig);
          let checkIfHasExist = () => {
            let exist = false;
            let hasExisted = this.modifyAccessConfig.hasExisted;
            hasExisted.some(it => {
              exist = it['targetGroupId'] == this.modifyAccessConfig.accessGroupID &&
                it['targetApplicationId'] == this.modifyAccessConfig.accessAppID;
              return exist;
            });
            return exist;
          };
          if (checkIfHasExist()) {
            this.errorMsgForAddAccessConfig = '已绑定该应用，不能重复绑定';
            return;
          } else {
            this.errorMsgForAddAccessConfig = '';
          }
          this.$net.oauthAddAccessConfig(this.selected.row.id, {
            groupId: this.$storeHelper.currentGroupID,
            applicationId: this.modifyAccessConfig.appID,
            produceEnv: this.modifyAccessConfig.production,
            applyList:[{
              groupId: this.modifyAccessConfig.accessGroupID,
              applicationId: this.modifyAccessConfig.accessAppID
            }]
          }).then(msg => {
          }).catch(msg => {
            this.$notify.error({
              title: '添加失败！',
              message: msg,
              duration: 0,
              onClose: function () {
              }
            });
          });
          break;
        case 'delete-access-config':
          if (item && item.hasOwnProperty('openPopover')) {
            item.openPopover = true;
          }
          break;
        case 'modify-access-config':
          this.selected.operation = null;
          break;
        case 'modify-secret':
          let prop = 'secret';
          let formName = 'modify' + prop.replace(/^[a-z]/g, (L) => L.toUpperCase()) + 'Form';
          this.$refs[formName].validate((valid) => {
            if (!valid) {
              return;
            }
            if (!this.newProps.hasOwnProperty(prop) || !this.selected.row.hasOwnProperty(prop)) {
              return;
            }
            if (this.newProps[prop] == this.selected.row[prop]) {
              this.selected.operation = null;
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
            } else {
              this.requestUpdate(action, prop);
            }
          });
          break;
      }
    },

    requestUpdate(action, prop) {
      // simulate post
      this.addToWaitingResponseQueue(action + '-in-dialog');
      switch (prop) {
        case 'secret':
          this.$net.oauthUpdateSecret({
            id: this.selected.row.id,
            secret: this.newProps[prop]
          }).then(msg => {
            this.hideWaitingResponse(action + '-in-dialog');
            this.selected.operation = null;
            this.updateModelInfo(prop);
            this.$message.success(msg);
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
          break;
      }
//      setTimeout(() => {
//        this.hideWaitingResponse(action + '-in-dialog');
//        this.selected.operation = null;
//        this.selected.row[prop] = this.newProps[prop]
//      }, 1000);
    },
    updateModelInfo(prop) {
      this.selected.row[prop] = this.newProps[prop];
    },

    handlePopoverButton(action, index, item) {
//      console.log(arguments);
      switch (action) {
        case 'delete-access-config':
          break;
        case 'cancel':
          item['openPopover'] = false;
          break;
      }
    },

    /**
     * update access-key list, called at:
     * 1. mounted function at start of page
     * 2. chagne of pagination
     * 3. search button
     * 4. success callback of delete access-key
     * @param cb
     */
    requestAccessKeyList(cb) {
      if (!cb) {
        cb = function() {};
      }
      let page = this.currentPage - 1;
      page = page >= 0 ? page : 0;
      let start = page * this.pageSize;
      let length = this.pageSize;
      let options = {
        productEnv: this.searchCondition.production,
        groupId: this.$storeHelper.currentGroupID,
        targetGroupId: this.searchCondition.groupID,
        accessKey: this.searchCondition.accessKey,
        start: start,
        length: length,
      };
      this.showLoading = true;
      this.$net.getAccessKeyList(options).then(content => {
        if (content.hasOwnProperty('uaaList')) {
          this.accessKeyListByPage = content['uaaList'];
          this.totalSize = content.total;
        }
        this.showLoading = false;
        cb(true)
      }).catch(err => {
        this.showLoading = false;
        cb(false)
      });
    },

    // the first page of pagination is 1
    handlePaginationPageChange(page) {
      this.currentPage = page;
      this.requestAccessKeyList();
    },

    warningConfirm(title, content) {
      return new Promise((resolve, reject) => {
        this.$confirm(content, title, {
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