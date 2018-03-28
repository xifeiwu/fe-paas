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
            <el-option :value="true" label="生产环境"></el-option>
            <el-option :value="false" label="非生产环境"></el-option>
          </el-select>
        </div>
        <el-button size="mini-extral"
                   type="primary"
                   :loading="statusOfWaitingResponse('search')"
                   @click="handleButtonClick('search')">搜索
        </el-button>
      </el-col>
    </el-row>
    <div class="access-key-list">
      <el-table
              :data="authorizeUrlListByPage"
              stripe
              v-loading="showLoading"
              element-loading-text="加载中"
      >
        <el-table-column
                prop="targetApplicationName"
                label="被访问的应用"
                width="120"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                prop="envName"
                label="访问环境"
                width="120"
                headerAlign="center" align="center"
        >
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
                prop="createTime"
                width="120"
                headerAlign="center" align="center">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.createTime)">
              <div v-for="(item, index) in scope.row.createTime" :key="index">
                {{item}}

              </div>
            </div>
            <div v-else>{{scope.row.createTime}}</div>
          </template>
        </el-table-column>
        <el-table-column
                prop="requestGroupName"
                label="授权访问团队"
                width="120"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                prop="requestGroupName"
                label="授权URL"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="200"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="warning"
                    :loading="statusOfWaitingResponse('open-dialog-for-authorize-url') && selected.row.id === scope.row.id"
                    @click="handleTRClick('open-dialog-for-modify-authorize-url', scope.$index, scope.row)">
              授权URL
            </el-button>
            <el-button
                    size="mini-extral"
                    type="danger"
                    :loading="statusOfWaitingResponse('delete') && selected.row.id === scope.row.id"
                    @click="handleTRClick('disable', scope.$index, scope.row)">禁用

            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="修改授权URL" :visible="selected.operation == 'open-dialog-for-modify-authorize-url'"
               class="modify-authorize-url size-700"
               :close-on-click-modal="false"
               @close="selected.operation = null"
               v-if="selected.row"
    >
      <el-form :model="modifyAuthorizeUrl" :rules="rulesForAuthorizeUrl" labelWidth="140px" size="mini" ref="modifyAuthorizeUrlForm">
        <el-form-item label="被访问的环境" class="profile">
          {{selected.row.envName}}
        </el-form-item>
        <el-form-item label="被访问的团队" v-if="groupInfo" class="group-name">
          {{groupInfo.name}}
        </el-form-item>
        <el-form-item label="被访问的应用名称" class="app-name">
          {{selected.row.targetApplicationName}}
        </el-form-item>
        <el-form-item label="Access Key" prop="accessKey" class="access-key">
          <el-input v-model="modifyAuthorizeUrl.accessKey"></el-input>
        </el-form-item>
        <el-form-item label="已有授权" class="authorize-url-list" v-if="newProps.authorizeUrlList.length>0">
          <el-row class="title">
            <el-col :span="11" class="oauth">所属权限</el-col>
            <el-col :span="11" class="resource">资源URL</el-col>
            <el-col :span="2" class="operation"></el-col>
          </el-row>
          <el-row class="has-exist"
                  v-for="(item, index) in newProps.authorizeUrlList"
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
                  <el-button type="danger" size="mini-extral" @click="handlePopoverButton('delete-access-config', index, item)">确定</el-button>
                </div>
                <el-button type="warning" size="mini-extral"
                           slot="reference"
                           :loading="statusOfWaitingResponse('delete-authorize-url-in-dialog') && selected.row.id === scope.row.id"
                           @click="handleDialogButton('delete-authorize-url', index, item)">删除</el-button>
              </el-popover>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="添加授权URL" prop="accessGroupID" class="add-authorize-url"
                      style="margin-bottom: 20px"
                      :error="errorMsgForAddAuthorizeUrl">
          <el-row>
            <el-col :span="11" class="oauth">
              <el-input v-model="modifyAuthorizeUrl.newItem.oauth" placeholder="所属权限"></el-input>
            </el-col>
            <el-col :span="11" class="resource">
              <el-input v-model="modifyAuthorizeUrl.newItem.resource" placeholder="资源URL"></el-input>
            </el-col>
            <el-col :span="2" class="operation" style="text-align: center">
              <el-button
                      size="mini-extral"
                      type="warning"
                      style="margin-bottom: 3px"
                      @click="handleDialogButton('add-authorize-url')">添加
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
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
      &.modify-authorize-url {
        .el-form {
          .el-form-item {
            &.profile, &.group-name, &.app-name, &.authorize-url-list {
              margin-bottom: 2px;
            }
            &.access-key {
              .el-input {
                max-width: 300px;
              }
            }
            &.add-authorize-url {
              .el-col {
                padding: 0px 2px;
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
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #oauth-url {
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
      .el-button {
        margin: 2px 4px;
      }
    }
  }
</style>

<script>
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
      this.targetAppList = [{
        targetGroupId: this.$storeHelper.APP_ID_FOR_ALL,
        targetGroupName: '全部',
      }];
    if (!this.targetAppList || this.targetAppList.length === 0) {
      this.getTargetAppList(this.$storeHelper.currentGroupID)
    }
    },
    data() {
      return {
        queueForWaitingResponse: [],

        targetAppList: [],
        showLoading: false,
        searchCondition: {
          appID: '',
          production: true,
        },
        authorizeUrlListByPage: [],

        selected: {
          row: {id: null},
          operation: null,
          prop: null,
        },
        modifyAuthorizeUrl: {
          accessKey: '',
          newItem: {
            oauth: '',
            resource: ''
          }
        },
        errorMsgForAddAuthorizeUrl: '',
        rulesForAuthorizeUrl: {
          accessKey: [{
            required: true,
            message: 'Access Key不能为空',
          }],
        },
        newProps: {
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
        return this.$storeHelper.groupInfo();
      },
    },
    watch: {
      '$storeHelper.currentGroupID': 'getTargetAppList',
    },

    methods: {
      // called at: 1. start of page, 2. change of gorupID
      getTargetAppList (groupID) {
//      console.log(`currentGroupID: ${value}`);
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

      handleTRClick(action, index, row) {
        this.selected.row = row;
        switch (action) {
          case 'open-dialog-for-modify-authorize-url':
            this.selected.operation = action;
            console.log(this.selected);
            break;
        }
      },
      handleDialogButton(action) {
        switch (action) {
          case 'add-authorize-url':
            let oAuthReg = /^[A-Za-z0-9_]{1,50}$/;
            let newItem = this.modifyAuthorizeUrl.newItem;
            if (oAuthReg.test(newItem.oauth) && oAuthReg.test(newItem.resource)) {
              this.newProps.authorizeUrlList.push({
                oauth: newItem.oauth,
                resource: newItem.resource
              });
              newItem.oauth = '';
              newItem.resource = '';
              this.errorMsgForAddAuthorizeUrl = '';
            } else {
              this.errorMsgForAddAuthorizeUrl = '"所属权限"和"资源URL"不能为空'
            }
            break;
        }
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
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;
        let targetAppID = this.searchCondition.appID;
        let options = {
          productEnv: this.searchCondition.production,
          targetGroupId: this.$storeHelper.currentGroupID,
          targetApplicationId: targetAppID == this.$storeHelper.APP_ID_FOR_ALL ? '' : targetAppID,
          start: start,
          length: length,
        };
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
            console.log(this.authorizeUrlListByPage);
          }
          this.showLoading = false;
          cb(true)
        }).catch(err => {
          this.showLoading = false;
          cb(false)
        });
      },
    }
  }
</script>