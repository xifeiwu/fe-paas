<template>
  <div id="oauth-key">
    <div class="header">
      <div class="item selector profile">
        <label style="float: left; width: 72px;">访问环境：</label>
        <el-select size="mini" v-model="searchCondition.production" placeholder="请选择" style="display:block; max-width: 200px; margin-left: 72px;">
          <el-option :value="null" label="全部"></el-option>
          <el-option :value="true" label="生产环境"></el-option>
          <el-option :value="false" label="非生产环境"></el-option>
        </el-select>
      </div>
      <div class="item selector key">
        <label style="float: left; width: 60px;">ClientId：</label>
        <el-input v-model="searchCondition.accessKey"
                  style="display:block; width: 200px; margin-left: 60px;"
                  size="mini"
                  @keyup.enter.native="handleButtonClick($event, 'search')"></el-input>
      </div>
      <el-button class="item button search" size="mini"
                 type="primary"
                 :loading="statusOfWaitingResponse('search')"
                 @click="handleButtonClick($event, 'search')">搜索</el-button>
      <el-button class="item button create"
              size="mini"
              type="primary"
              :class="{'disabled': $storeHelper.reason4ActionDisabled('open_dialog_oauth_access_key_create')}"
              :loading="statusOfWaitingResponse('open_dialog_oauth_access_key_create')"
              @click="handleButtonClick($event, 'open_dialog_oauth_access_key_create')">
        创建ClientId
      </el-button>
    </div>
    <div class="access-key-list">
      <el-table
              :data="accessKeyListByPage"
              stripe
              :height="heightOfAccessKeyList"
      >
        <el-table-column
          prop="accessKey"
          label="ClientId"
          width="140"
          headerAlign="center" align="center">
          <template slot-scope="scope">
            <div class="access-key">
              <span>{{scope.row.accessKey}}</span><i class="paas-icon-copy"
                   v-clipboard:copy="scope.row.accessKey"
                   v-clipboard:success="handleSuccessCopy"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="secret"
          label="Secret"
          min-width="120"
          headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <div class="secret">
              <span>{{scope.row.secret}}</span><i class="paas-icon-copy"
                   v-clipboard:copy="scope.row.secret"
                   v-clipboard:success="handleSuccessCopy"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column
                prop="profileName"
                label="访问环境"
                width="120"
                headerAlign="center" align="center">
          <template slot-scope="scope">
            <div>{{scope.row.profileName ? scope.row.profileName: '未配置'}}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="accessConfigDesc"
          label="访问团队-权限，状态"
          min-width="200"
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
                <div class="more">更多...</div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="creatorName"
          label="创建人"
          width="100"
          headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
            label="我的应用"
            width="100"
            headerAlign="center" align="center">
          <template slot-scope="scope">
            <div>
              <span>{{scope.row.applicationName}}</span>
              <span v-if="scope.row.outerApp" class="outer-app-tag">外</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
            prop="description"
            label="备注"
            minWidth="180"
            headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                label="创建时间"
                prop="createTime"
                width="100"
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
                prop="operation"
                label="操作"
                min-width="180"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :class="$storeHelper.reason4ActionDisabled('open_dialog_oauth_access_key_and_config_update') ? 'disabled' : 'warning'"
                    :loading="statusOfWaitingResponse('open_dialog_oauth_access_key_and_config_update') && selected.row.id === scope.row.id"
                    @click="handleTRClick($event, 'open_dialog_oauth_access_key_and_config_update', scope.$index, scope.row)">
              修改访问配置
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="$storeHelper.permission['oauth_set_permission'].disabled ? 'disabled' : 'warning'"
                    :loading="statusOfWaitingResponse('oauth_set_permission') && selected.row.id === scope.row.id"
                    @click="handleTRClick($event, 'oauth_set_permission', scope.$index, scope.row)">
              资源配置
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="[$storeHelper.reason4ActionDisabled('open_dialog_oauth_secret_change') ? 'disabled' : 'warning']"
                    :loading="statusOfWaitingResponse('open_dialog_oauth_secret_change') && selected.row.id === scope.row.id"
                    @click="handleTRClick($event, 'open_dialog_oauth_secret_change', scope.$index, scope.row)">修改秘钥
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="$storeHelper.permission['oauth_delete_access_key'].disabled ? 'disabled' : 'danger'"
                    :loading="statusOfWaitingResponse('oauth_delete_access_key') && selected.row.id === scope.row.id"
                    @click="handleTRClick($event, 'oauth_delete_access_key', scope.$index, scope.row)">删除
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

    <el-dialog title="创建ClientId"
               :visible="action.name == 'open_dialog_oauth_access_key_create'"
               v-if="action.name == 'open_dialog_oauth_access_key_create'"
               class="create-access-key size-700"
               :close-on-click-modal="false"
               bodyPadding="4px 16px"
               @close="closeDialog"
    >
      <el-form :model="action.data" :rules="rulesForCreateAccessKey" labelWidth="110px" size="mini"
               ref="oauthCreateForm">
        <el-form-item label="我的团队" v-if="groupInfo">
          {{groupInfo.name}}
        </el-form-item>
        <el-form-item label="是否外部应用">
          <el-radio-group v-model="action.data.isExternalApp" @change="handleDialogButton('as_external_app_or_not')">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="外部应用名称" prop="appName" v-if="action.data.isExternalApp"
                      :class="{'external-app-name': true}">
          <el-input v-model="action.data.appName" placeholder="中文，英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
        <el-form-item label="我的应用" prop="appId" class="app" v-else>
          <el-select filterable v-model="action.data.appId" placeholder="请选择"
                     style="display:block; max-width: 360px;">
            <el-option v-for="(item, index) in appListOfCurrentGroup" :key="item.appId" :label="item.appName" :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="访问环境" prop="production" class="profile">
          <el-radio-group v-model="action.data.isProductionProfile">
            <el-radio :label="true">生产环境</el-radio>
            <el-radio :label="false">非生产环境</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input v-model="action.data.description" placeholder="不超过200个字符"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary" size="mini"
                       @click="handleDialogButton(action.name.replace('open_dialog_', ''))">保存</el-button>
          </div>
          <div class="item">
            <el-button size="mini" @click="closeDialog">取消</el-button>
          </div>
      </div>
    </el-dialog>

    <el-dialog title="修改访问配置" :visible="action.name == 'open_dialog_oauth_access_key_and_config_update'"
               v-if="action.name == 'open_dialog_oauth_access_key_and_config_update'"
               class="oauth_access_key_and_config_update size-1000"
               :close-on-click-modal="false"
               bodyPadding="0px 10px"
               v-loading="this.data4KeyAndConfigUpdate.requestingList.length > 0"
               element-loading-spinner="el-icon-loading"
               @close="closeDialog"
    >
      <paas-dismiss-message :toExpand="true" showSeconds="0" style="margin: 2px -10px 0px -10px"
                            :msgList="[
                              '初次添加的“申请访问权限”需对方团队审批，状态变为“已授权”状态，访问权限才能生效！',
                              '访问权限授权通过后，注意需要重启服务！'
                            ]"></paas-dismiss-message>
      <el-form :model="action.data" :rules="rulesForCreateAccessKey" labelWidth="130px" size="mini"
               ref="oauthKeyAndConfigUpdate">
        <el-form-item label="我的团队/访问环境" v-if="groupInfo">
          {{groupInfo.name}} / {{action.data.isProductionProfile ? '生产环境' : '非生产环境'}}
        </el-form-item>
        <el-form-item label="是否外部应用">
          <el-radio-group v-model="action.data.isExternalApp" @change="handleDialogButton('as_external_app_or_not')">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="外部应用名称" prop="appName" style="max-width: 600px;" v-if="action.data.isExternalApp"
                      :class="{'external-app-name': true}">
          <el-input v-model="action.data.appName" placeholder="中文，英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
        <el-form-item label="我的应用" prop="appId" class="app" v-else>
          <el-select filterable v-model="action.data.appId" placeholder="请选择"
                     style="display:block; max-width: 600px;">
            <el-option v-for="(item, index) in appListOfCurrentGroup" :key="item.appId" :label="item.appName" :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input v-model="action.data.description" placeholder="不超过200个字符" style="max-width: 600px;"></el-input>
        </el-form-item>
        <el-form-item label="已申请访问的权限" class="target-app-list" >
          <el-row class="title">
            <el-col :span="7" class="group">团队</el-col>
            <el-col :span="7" class="app">ClientId</el-col>
            <el-col :span="7" class="app">权限</el-col>
            <el-col :span="2" class="app">状态</el-col>
            <el-col :span="1"></el-col>
          </el-row>
          <el-row class="has-exist"
                  v-for="(item, index) in action.data.accessConfigList"
                  :key="index"
          >
            <el-col :span="7" class="group">{{item.targetGroupName}}</el-col>
            <el-col :span="7" class="app">{{item.targetOauth.substr(0,item.targetOauth.indexOf("."))}}</el-col>
            <el-col :span="7" class="app">{{item.targetOauth}}</el-col>
            <el-col :span="2" class="app">{{item.status}}</el-col>
            <el-col :span="1" style="text-align: right">
              <el-popover
                      width="360"
                      v-model="item.openPopover"
                      placement="left"
                      trigger="click"
                      popperClass="el-popover--small"
                      content="复制成功">
                <p style="color: #fa5555">确定要删除"{{item.targetGroupName}}"下的"{{item.targetOauth}}"权限吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" style="margin-right: 8px" @click="item.openPopover = false">取消</el-button>
                  <el-button type="danger" size="mini" style="margin-right: 8px" @click="handleDialogButton('oauth_access_config_delete', index, item)">确定</el-button>
                </div>
                <i class="paas-icon-close" slot="reference" @click="handleDialogButton('oauth_access_config_open_popover_for_delete', index, item)"></i>
              </el-popover>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="申请访问权限" prop="accessGroupID" class="add-target-app"
                      style="margin-bottom: 20px"
                      :error="data4KeyAndConfigUpdate.errMsgForConfigAdd">
          <el-row>
            <el-col :span="7" style="padding-right:4px;">
              <el-select filterable v-model="data4KeyAndConfigUpdate.selectedGroupId" placeholder="请选择" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in data4KeyAndConfigUpdate.allGroupList" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="7" style="padding-right:4px;">
              <el-select
                      filterable v-model="data4KeyAndConfigUpdate.selectedUaaId"
                      :placeholder="data4KeyAndConfigUpdate.uaaList.length == 0 ? '列表为空' : '请选择'" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in data4KeyAndConfigUpdate.uaaList" :key="item.id" :label="item.clientId" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="7" style="padding-right:4px;">
              <el-select
                      filterable v-model="data4KeyAndConfigUpdate.selectedOauthId"
                      :placeholder="data4KeyAndConfigUpdate.oauthList.length == 0 ? '列表为空' : '请选择'" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in data4KeyAndConfigUpdate.oauthList" :key="item.id" :label="item.oauth" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="3" style="text-align: center">
              <el-button
                      size="mini"
                      type="primary"
                      round
                      style="margin-bottom: 3px"
                      @click="handleDialogButton('oauth_access_config_add')">添加
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary" size="mini"
                       :loading="statusOfWaitingResponse('oauth_access_key_and_config_updateg')"
                       @click="handleDialogButton('oauth_access_key_and_config_update')"
                       >保存</el-button>
          </div>
          <div class="item">
            <el-button size="mini" @click="closeDialog">取消</el-button>
          </div>
      </div>
    </el-dialog>

    <el-dialog title="资源配置" :visible="selected.operation == 'oauth_set_permission'"
               class="update-url-permission size-800"
               :close-on-click-modal="false"
               @close="handleDialogClose('update-url-permission')"
    >
      <el-form labelWidth="130px" size="mini" inline>
        <el-form-item label="我的应用">
          <span>{{selected.row.applicationName}}</span>
          <span v-if="selected.row.outerApp" class="outer-app-tag">外</span>
        </el-form-item>
        <el-form-item label="访问环境">
          {{selected.row.profileName}}
        </el-form-item>
        <el-form-item label="所属ClientId">
          {{selected.row.accessKey}}
        </el-form-item>
      </el-form>
      <el-form :model="modifyAccessKeyInfo" :rules="rulesForCreateAccessKey" labelWidth="130px" size="mini"
               ref="updateUrlPermissionForm">
        <el-form-item label="添加受限制的权限" prop="accessGroupID" class="add-authorize-url"
                      style="margin-bottom: 20px"
                      :error="errorMsgForAddUrlPermission">
          <el-row>
            <el-col :span="11" class="oauth" style="padding-right: 4px">
              <el-input v-model="updateUrlPermissionInfo.newItem.oauth" placeholder="所属权限">
                <template slot="prepend">{{selected.row.accessKey + '.'}}</template>
              </el-input>
            </el-col>
            <el-col :span="11" class="resource" style="padding-right: 4px">
              <el-input v-model="updateUrlPermissionInfo.newItem.resource" placeholder="资源URL"></el-input>
            </el-col>
            <el-col :span="2" class="operation" style="text-align: center">
              <el-button
                      size="mini"
                      type="primary"
                      :loading="statusOfWaitingResponse('add-url-permission')"
                      @click="handleDialogButton('add-url-permission')">添加
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="受限制的权限" class="url-permission-list" v-if="updateUrlPermissionInfo.urlPermissionList.length>0">
          <el-row class="title">
            <el-col :span="11" class="oauth">所属权限</el-col>
            <el-col :span="11" class="resource">资源URL</el-col>
            <el-col :span="2" class="operation"></el-col>
          </el-row>
          <el-row class="has-exist"
                  v-for="(item, index) in updateUrlPermissionInfo.urlPermissionList"
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
                <p style="color: #fa5555">删除受管控的权限将会造成对应的资源URL不受访问限制，确定要这样做吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="handlePopoverButton('cancel', index, item)">取消</el-button>
                  <el-button type="danger" size="mini" @click="handlePopoverButton('delete-url-permission', index, item)">确定</el-button>
                </div>
                <el-button type="warning" size="mini"
                           slot="reference"
                           round
                           :loading="statusOfWaitingResponse('delete-url-permission') && updateUrlPermissionInfo.urlPermissionToDelete.id == item.id">
                  删除</el-button>
              </el-popover>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div class="helper-text-expanded">
        <div>初始默认为所有资源URL无需授权均可被访问，当配置了某些资源URL，这些资源URL就会受到限制，需要授权给对方应用才能访问，未配置的资源URL不受限制，无需授权即可被对方应用访问！</div>
        <div class="title">添加授权URL规则<i class="el-icon-question"></i></div>
        <div class="item">1. 修改授权URL，需要重新部署我的应用，否则不能生效</div>
        <div class="item">2. 所属权限的自定义部分只能包括小写字母；50个字符以内。如，galaxy-WrJhXCOo.abcdef</div>
        <div class="item">3. 资源URL，必须以/开头，路径可以包含字母、数字、*、/、中划线、下划线。多个路径之间以,分割。50个字符以内。如，/a/1-2_3/C,/**/d</div>
        <div class="item" style="color:red">4. 资源URL增加/删除完毕后，必须重启服务才能生效</div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div style="text-align: center">
          <el-button @click="handleDialogClose('update-url-permission')">关闭</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="更改秘钥" :visible="action.name == 'open_dialog_oauth_secret_change'"
             v-if="action.name == 'open_dialog_oauth_secret_change'"
             class="oauth_secret_change size-600"
               bodyPadding="4px 10px"
             :close-on-click-modal="false"
             @close="closeDialog"
    >
      <el-form :model="action.data" :rules="rulesForCreateAccessKey" labelWidth="100px" size="mini" ref="modifySecretForm">
        <el-form-item label="ClientId：">
          {{action.data.accessKey}}
        </el-form-item>
        <el-form-item label="Secret：" prop="secret">
          <el-input v-model="action.data.secret" placeholder="中文，英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary" size="mini"
                       @click="handleDialogButton(action.name.replace('open_dialog_', ''))">确&nbsp定</el-button>
          </div>
          <div class="item">
            <el-button size="mini" @click="closeDialog">取&nbsp消</el-button>
          </div>
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
  #oauth-key {
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
      &.oauth_secret_change {
        width: 80%;
        max-width: 600px;
        margin: 15px auto;
        .el-dialog {
          width: 100%;
        }
      }
      &.create-access-key {
        .el-form {
          .el-form-item {
            margin-bottom: 8px;
            &.add-target-app, &.external-app-name {
              margin-bottom: 16px;
            }
            &.external-app-name {
              &.hidden {
                display: none;
              }
            }
            .title {
              font-weight: bold;
            }
            .group, .app, .status {
              text-align: center;
            }
          }
        }
      }
      &.oauth_access_key_and_config_update {
        .el-form {
          margin: 5px;
          .paas-icon-close {
            color: #aaa;
            font-size: 14px;
            cursor: pointer;
            &:hover {
              color: gray;
            }
          }
          .el-form-item {
            .group, .app {
              text-align: left;
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
      &.update-url-permission {
        .el-form {
          .el-form-item {
            &.url-permission-list {
              .title {
                .el-col {
                  font-weight: bold;
                  text-align: center;
                }
              }
              .oauth, .resource {
                text-align: center;
              }
            }
          }

        }
      }
      .el-col .el-button {
        vertical-align: middle;
      }
    }
  }
</style>
<style lang="scss" scoped>
#oauth-key {
  height: calc(100% - 30px);
  .outer-app-tag {
    color: #409EFF;
    font-size: 12px;
    line-height: 100%;
    padding: 1px 2px;
    border: 1px solid #409EFF;
    border-radius: 4px;
  }
  & > .header {
    padding: 3px 5px;
    font-size: 14px;
    display: flex;
    align-items: center;
    /*justify-content: space-between;*/
    justify-content: flex-start;
    .item {
      margin-right: 6px;
      &.selector {
        label {
          line-height: 24px;
        }
      }
    }
  }
  .access-key-list {
    /*height: calc(100% - 40px);*/
    /*overflow: scroll;*/
    .el-table {
      .access-key, .secret {
        line-height: 26px;
        text-align: center;
        .paas-icon-copy {
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
      .more {
        &:hover {
        }
        font-size: 12px;
      }
    }
  }
}
</style>

<script>
  import paasDismissMessage from 'assets/components/dismiss-message.vue';
  import commonUtils from 'assets/components/mixins/common-utils';
  import {addResizeListener, removeResizeListener} from 'element-ui/src/utils/resize-event';
  import utils from 'assets/libs/element-ui/utils';

export default {
  components: {paasDismissMessage},
  mixins: [commonUtils],
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

//      createAccessKeyTag: null,
      searchCondition: {
        production: null,
        accessKey: ''
      },
      accessKeyListByPage: [],
      popoverForDeleteAccessConfig: true,

      selected: {
        row: {id: null},
        operation: null,
        prop: null,
      },

      rulesForCreateAccessKey: {
        appId: [{
          required: false,
          message: '必须选择应用',
        }],
        isProduction: [{
          required: true,
          message: '必须选择访问环境',
        }],
        appName: [{
          required: true,
          message: '应用名不能为空',
        }, {
          validator: utils.generateValidator(true, true, 2, 30, true)
        }],
        description: [{
          trigger: ['blur', 'change'],
          validator(rule, values, callback) {
            if (values.length >= 200) {
              callback('不能超过200个字符');
              return;
            }
            callback();
          }
        }],
        // 修改秘钥使用
        secret: [{
          required: true,
          message: '内容不能为空',
        }],
      },

      // prop for add or modify app access config
      modifyAccessKeyInfo: {
        isExternalApp: false,
        appId: null,
        production: null,
        appName: '',
        requestingAppList: false,
        targetAppList: [],
        targetGroupID: null,
        targetGroupName: '',
        requestAuthList: [],
        targetUaaId: null,
        loadingOauthList: false,
        targetOauthId:null,
        targetAppID: null,
        targetAppName: '',
        targetAuthInfoList:[],
        description: ''
      },

      // prop used for dialog oauth_access_key_and_config_update
      data4KeyAndConfigUpdate: {
        isProductionProfile: null,
        allGroupList: null,       // 所有团队列表
        selectedGroup: null,
        selectedGroupId: null,
        selectedGroupName: null,
        uaaList: [],
        selectedUaa: null,
        selectedUaaId: null,
        selectedClientId: null,

        oauthList:[],
        selectedOauth: null,
        selectedOauthId: null,

        requestingList: [],
        errMsgForConfigAdd: ''
      },

      updateUrlPermissionInfo: {
        accessKeyId: null,
        accessKey: null,
        urlPermissionList: [],
        newItem: {
          oauth: '',
          resource: ''
        },
        urlPermissionToDelete: {}
      },
      errorMsgForAddUrlPermission: '',


      // used for modify props
      newProps: {
        secret: '',
        accessConfigList: [],
        accessConfigDesc: []
      },

      totalSize: 0,
      pageSize: 10,
      currentPage: 1,
    }
  },

  computed: {
    groupInfo() {
      return this.$storeHelper.groupInfo;
    },
    appListOfCurrentGroup: function () {
      let appInfoListOfGroup = this.$storeHelper.appInfoListOfGroup;
      if (appInfoListOfGroup && appInfoListOfGroup.hasOwnProperty('appList')) {
        return [{appId: -1, appName: '无'}].concat(appInfoListOfGroup.appList);
      } else {
        return [];
      }
    },
  },

  watch: {
    '$storeHelper.currentGroupId': function () {
      this.currentPage = 1;
      this.requestAccessKeyList();
    },
    'searchCondition.production': function () {
      this.currentPage = 1;
      this.requestAccessKeyList();
    },
    'data4KeyAndConfigUpdate.selectedGroupId': function (groupId) {
      // sync group related info by group.id
      this.data4KeyAndConfigUpdate.errMsgForConfigAdd = '';
      this.data4KeyAndConfigUpdate.selectedGroup = null;
      this.data4KeyAndConfigUpdate.selectedGroupName = null;
      this.data4KeyAndConfigUpdate.selectedUaa = null;
      this.data4KeyAndConfigUpdate.selectedClientId = null;
      this.data4KeyAndConfigUpdate.selectedOauth = null;
      const selectedGroup = this.data4KeyAndConfigUpdate.allGroupList.find(it => it.id == groupId);
      if (!selectedGroup) {
        return;
      }
      this.data4KeyAndConfigUpdate.selectedGroup = selectedGroup;
      this.data4KeyAndConfigUpdate.selectedGroupName = selectedGroup.name;

      // format of uaa: {id, clientId, ...}
      this.data4KeyAndConfigUpdate.uaaList = [];
      this.data4KeyAndConfigUpdate.selectedUaaId = null;

      this.data4KeyAndConfigUpdate.requestingList.push(this.$net.URL_LIST.uaa_get_by_group.path);
      this.$net.requestPaasServer(this.$net.URL_LIST.uaa_get_by_group, {
        payload: {
          groupId,
          productEnv: this.data4KeyAndConfigUpdate.isProductionProfile
        }
      }).then(resContent => {
        resContent = resContent ? resContent : [];
        // init default value for appList and modifyAccessKeyInfo.targetAppID
//        this.modifyAccessKeyInfo.targetUaaId = this.$storeHelper.APP_ID_FOR_NULL;
        this.data4KeyAndConfigUpdate.uaaList = resContent;
        if (resContent.length > 0) {
          this.data4KeyAndConfigUpdate.selectedUaaId = resContent[0].id;
        }
      }).catch(err => {
        this.$message.error('获取团队列表失败！');
      }).finally(() => {
        this.data4KeyAndConfigUpdate.requestingList.splice( this.data4KeyAndConfigUpdate.requestingList.indexOf(this.$net.URL_LIST.uaa_get_by_group.path), 1);
      })
    },
    'data4KeyAndConfigUpdate.selectedUaaId': function (uaaId) {
      // sync uaa relatedInfo by uaa.id
      this.data4KeyAndConfigUpdate.errMsgForConfigAdd = '';
      this.data4KeyAndConfigUpdate.selectedUaa = null;
      this.data4KeyAndConfigUpdate.selectedClientId = null;
      this.data4KeyAndConfigUpdate.selectedOauth = null;
      const uaa = this.data4KeyAndConfigUpdate.uaaList.find(it => it.id == uaaId);
      if (!uaa) {
        return;
      }
      this.data4KeyAndConfigUpdate.selectedClientId = uaa.clientId;
      this.data4KeyAndConfigUpdate.selectedUaa = uaa;

      // format of oauth: {id, oauth, oauthUrl}
      this.data4KeyAndConfigUpdate.oauthList = [];
      this.data4KeyAndConfigUpdate.selectedOauthId = null;

      let getOauthUrl = encodeURI(this.$utils.formatUrl(this.$net.URL_LIST.oauth_get_by_uaa.path, {
        uaaId
      }));
      this.data4KeyAndConfigUpdate.requestingList.push(this.$net.URL_LIST.oauth_get_by_uaa.path);
      this.$net.requestPaasServer({
        path: getOauthUrl,
        method: 'get'
      }).then(resContent => {
        resContent = resContent ? resContent : [];
        this.data4KeyAndConfigUpdate.oauthList = resContent;
        if (resContent.length > 0) {
          this.data4KeyAndConfigUpdate.selectedOauthId = resContent[0].id;
        }
      }).catch(err => {
         console.error(err)
      }).finally(() => {
        this.data4KeyAndConfigUpdate.requestingList.splice( this.data4KeyAndConfigUpdate.requestingList.indexOf(this.$net.URL_LIST.oauth_get_by_uaa.path), 1);
      })
    },
    'data4KeyAndConfigUpdate.selectedOauthId':function (oauthId) {
      // sync oauth related info by oauth.id
      this.data4KeyAndConfigUpdate.errMsgForConfigAdd = '';
      this.data4KeyAndConfigUpdate.selectedOauth = null;
      // if (!oauthId) {
      //   return;
      // }
      const oauthObj = this.data4KeyAndConfigUpdate.oauthList.find(it => it.id == oauthId);
      if (!oauthObj) {
        return;
      }
      this.data4KeyAndConfigUpdate.selectedOauth = oauthObj.oauth;
    }
  },

  methods: {
    handleDialogClose(action) {
      this.refreshAccessKeyList();
      this.selected.operation = null;
      if (action) {
        this.hideWaitingResponse(action);
      }
    },

    initModifyAccessKeyInfo () {
      this.modifyAccessKeyInfo.isExternalApp = false;
      this.modifyAccessKeyInfo.appId = null;
      this.modifyAccessKeyInfo.production = false;
      this.modifyAccessKeyInfo.appName = '';
      this.modifyAccessKeyInfo.targetAuthInfoList = [];
      this.modifyAccessKeyInfo.targetGroupID = null;
      this.modifyAccessKeyInfo.targetGroupName = '';
      this.modifyAccessKeyInfo.targetAppID = null;
      this.modifyAccessKeyInfo.requestAuthList = [];
      this.modifyAccessKeyInfo.targetAppList = [];
      this.modifyAccessKeyInfo.targetAppName = '';
    },

    async handleButtonClick(evt, action) {
      if (this.$storeHelper.reason4ActionDisabled('open_dialog_oauth_access_key_create')) {
        this.$storeHelper.globalPopover.show({
          ref: evt.target,
          msg: this.$storeHelper.reason4ActionDisabled('open_dialog_oauth_access_key_create')
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
        case 'open_dialog_oauth_access_key_create':
          let errorMsg = null;
          if (!this.groupInfo) {
            errorMsg = '团队信息获取失败';
          }
          if (!this.appListOfCurrentGroup || this.appListOfCurrentGroup.length === 0) {
            errorMsg = '该团队应用列表为空';
          }
          if (errorMsg) {
            this.$message.error(`无法创建AccessKey: ${errorMsg}`);
            return;
          }

          try {
            const defaultAppId = this.appListOfCurrentGroup[0].appId;
            const dialogData = await this.openDialog(action, {
              isExternalApp: false,
              appName: '',
              appId: defaultAppId,
              isProductionProfile: false,
              description: ''
            });
            this.addToWaitingResponseQueue(action);
            setTimeout(() => {
              this.hideWaitingResponse(action);
            }, 1000);
            // console.log(dialogData);

            const payload = {
              groupId: this.$storeHelper.currentGroupId,
              outerApp: dialogData.isExternalApp,
              productEnv: dialogData.isProductionProfile,
              description: dialogData.description
            };
            if (dialogData.isExternalApp) {
              payload['outerAppName'] = dialogData.appName;
            } else {
              payload['applicationId'] = dialogData.appId;
            }

            const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.oauth_access_key_create, {
              payload
            });
            this.closeDialog();
            // console.log(resData);
            this.$message({
              duration: 6000,
              message: "ClientId（" + resData.client_id + "）创建成功！如您需要申请了其他团队的权限，请及时联系您想访问的团队来给您的ClientId授权，并在三天内完成授权，逾期将是视为失效，需重新申请!",
              type: 'success'
            });
            this.refreshAccessKeyList();
          } catch (err) {
            console.log(err);
          } finally {
          }
          break;
        case 'search':
          this.currentPage = 1;
          this.addToWaitingResponseQueue(action);
          await this.requestAccessKeyList();
          this.hideWaitingResponse(action);
          break;
      }
    },
    /**
     * click handler for button in table row
     * @param action
     * @param index
     * @param row
     */
    async handleTRClick(evt, action, index, row) {
      if (['open_dialog_oauth_access_key_and_config_update', 'open_dialog_oauth_secret_change'].includes(action)) {
        if (this.$storeHelper.reason4ActionDisabled(action)) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.reason4ActionDisabled(action)
          });
          return;
        }
      } else {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
      }
      this.selected.row = row;
      switch (action) {
        case 'open_dialog_oauth_access_key_and_config_update':
          try {
            if (this.data4KeyAndConfigUpdate.allGroupList == null) {
              this.data4KeyAndConfigUpdate.allGroupList = (await this.$net.requestPaasServer(this.$net.URL_LIST.get_all_group_list))['groupList'];
            }
            this.data4KeyAndConfigUpdate.isProductionProfile = row.isProductionProfile;
            if (this.data4KeyAndConfigUpdate.allGroupList.length > 0) {
              this.data4KeyAndConfigUpdate.selectedGroupId = this.data4KeyAndConfigUpdate.allGroupList[0].id;
            }
            const defaultAppId = this.appListOfCurrentGroup[0].appId;
            const appInfo = this.appListOfCurrentGroup.find(it => it.appId == row.applicationId);
            const dialogData = await this.openDialog(action, {
              isExternalApp: row.outerApp,
              appName: row.outerApp ? row.applicationName : '',
              appId: appInfo ? appInfo.appId : defaultAppId,
              isProductionProfile: row.isProductionProfile,
              description: row.description,
              accessConfigList: row.accessConfigList.map(it => {
                return {
                  status: it.status,
                  targetOauth: it.targetOauth,
                  targetGroupId: it.targetGroupId,
                  targetGroupName: it.targetGroupName,
                  targetClientId: it.targetClientId,
                  openPopover: false
                }
              }),
            });
            const payload = {
              groupId: this.$storeHelper.currentGroupId,
              outerApp: dialogData.isExternalApp,
              productEnv: dialogData.isProductionProfile,
              description: dialogData.description,
              applyList: dialogData.accessConfigList.map((it) => {
                return {
                  groupId: it.targetGroupId,
                  uaaId: it.targetUaaId,
                  clientId:it.targetClientId,
                  uaaOauthId:it.targetOauthId,
                  oauth:it.targetOauth
                }
              })
            };
            if (dialogData.isExternalApp) {
              payload['outerAppName'] = dialogData.appName;
            } else {
              payload['applicationId'] = dialogData.appId;
            }
            this.data4KeyAndConfigUpdate.requestingList.push(this.$net.URL_LIST.oauth_add_access_config.path);
            const resData = await this.$net.requestPaasServer(Object.assign({}, this.$net.URL_LIST.oauth_add_access_config, {moreData: true}), {
              params: {
                id: row.id,
              },
              data: payload
            });
            this.data4KeyAndConfigUpdate.requestingList.splice( this.data4KeyAndConfigUpdate.requestingList.indexOf(this.$net.URL_LIST.oauth_add_access_config.path), 1);
            this.closeDialog();
            this.$message.success(resData.msg);
            this.refreshAccessKeyList();
          } catch (err) {
            console.log(err);
          } finally {
            this.data4KeyAndConfigUpdate.requestingList = [];
          }
          break;
        case 'oauth_set_permission':
          if (!this.groupInfo) {
            this.$message.error('所需信息不完整！');
            return;
          }
          if (row && row.hasOwnProperty('accessKey') && row.hasOwnProperty('id')) {
            this.updateUrlPermissionInfo.accessKeyId = row.id;
            this.updateUrlPermissionInfo.accessKey = row.accessKey;
          } else {
            console.log('err: access key not found');
            return;
          }
          this.addToWaitingResponseQueue(action);
          this.$net.oauthGetUrlPermissionList(row.id).then(urlPermissionList => {
            this.hideWaitingResponse(action);
            this.updateUrlPermissionInfo.urlPermissionList = urlPermissionList;
            this.updateUrlPermissionInfo.newItem.oauth = '';
            this.updateUrlPermissionInfo.newItem.resource = '';
            // reset error tip
            this.errorMsgForAddUrlPermission = '';
            this.selected.operation = action;
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
        case 'open_dialog_oauth_secret_change':
          try {
            const dialogData = await this.openDialog(action, {
              accessKey: row.accessKey,
              secret: row.secret
            });
            // console.log(dialogData);
            this.addToWaitingResponseQueue(action);
            const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.oauth_update_secret, {
              params: {
                id: row.id
              },
              data: {
                groupId: this.$storeHelper.currentGroupId,
                secret: dialogData.secret,
              }
            });
            // console.log(resData);
            row.secret = dialogData.secret;
            this.$message.success(`秘钥更新成功！`);
            this.closeDialog();
          } catch (err) {
          } finally {
            this.hideWaitingResponse(action);
          }
          break;
        case 'oauth_delete_access_key':
          this.addToWaitingResponseQueue(action);
          this.warningConfirm('删除CliendId',
            `删除ClientId：${row.clientId}，将会造成已经授权的配置失效，你确定需要这么做吗？`).then(() => {
            this.$net.oauthDeleteAccessKey(this.selected.row.id,{groupId: this.$storeHelper.currentGroupId}).then(msg => {
              this.hideWaitingResponse(action);
              this.$message.success(msg);
              this.requestAccessKeyList();
            }).catch((msg) => {
              this.hideWaitingResponse(action);
              this.$notify.error({
                title: '删除Oauth授权失败！',
                message: msg,
                duration: 0,
                onClose: function () {
                }
              });
            });
          }).catch(err => {
            this.hideWaitingResponse(action);
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

    /**
     * if the app to add is ok? (used in dialog oauth_access_key_and_config_update)
     * 1. appId exist(some group does not have app)
     * 2. the appId not in the has-add-app-id-list
     *
     * trigger by watch: modifyAccessKeyInfo.appId, modifyAccessKeyInfo.targetAppID
     */
    canAccessConfigBeAdd() {
      let errMsg = '';
      const data4KeyAndConfigUpdate = this.data4KeyAndConfigUpdate;

      if(data4KeyAndConfigUpdate.selectedGroupId === null) {
        errMsg = '未选择团队';
      }

      if(data4KeyAndConfigUpdate.selectedUaaId === null){
        errMsg = '未选择clientId';
      }

      if(data4KeyAndConfigUpdate.selectedOauthId === null){
        errMsg = '未选择权限信息';
      }

      if (!errMsg) {
        try {
          const accessConfigList = this.action.data.accessConfigList;
          if (accessConfigList.some(it => {
              return it['targetGroupId'] === this.data4KeyAndConfigUpdate.selectedGroupId
                && it['targetClientId'] === this.data4KeyAndConfigUpdate.selectedClientId
                && it['targetOauth'] === this.data4KeyAndConfigUpdate.selectedOauth;
            })) {
            errMsg = '已绑定该权限，不能重复绑定';
          }
        } catch (err) {}
      }
      this.data4KeyAndConfigUpdate.errMsgForConfigAdd = errMsg;
      return !errMsg;
    },

    /**
     *  used to check new added authorized-url in dialog oauth_access_key_and_config_update
     *  1. if the new item match regexp
     *  2. if the new item has exist in item array
     */
    checkAuthorizeUrlValidation(newItem) {
      if (!newItem) {
        newItem = this.updateUrlPermissionInfo.newItem;
      }

      let checkValidation = () => {
        let isValid = false;

        if (!this.updateUrlPermissionInfo.accessKey) {
          this.errorMsgForAddUrlPermission = '未找到accessKey';
          return isValid;
        }
        let selectedRow = this.updateUrlPermissionInfo.accessKey;

        if (!newItem.oauth) {
          this.errorMsgForAddUrlPermission = '请填写授权URL的所属权限';
          return isValid;
        }
        if (newItem.oauth.length > 50) {
          this.errorMsgForAddUrlPermission = '所属权限不能超过50个字符';
          return isValid;
        }
        if (!newItem.oauth.startsWith(selectedRow + '.')) {
          this.errorMsgForAddUrlPermission = `所属权限必须以${selectedRow}.开头`;
          return isValid;
        }
        if (!/^[a-z]+$/.test(newItem.oauth.replace(selectedRow + '.', ''))) {
          this.errorMsgForAddUrlPermission = '所属权限格式不正确';
          return isValid;
        }
        if (newItem.resource.length > 50) {
          this.errorMsgForAddUrlPermission = '所属权限不能超过50个字符';
          return isValid;
        }
        let resourceReg = /^(\/[a-zA-Z0-9\\*\/\-_]+)(, *\/[a-zA-Z0-9\\*\/\-_]+)*$/;
        if (!resourceReg.test(newItem.resource)) {
          this.errorMsgForAddUrlPermission = '资源URL格式不正确';
          return isValid;
        }
        return true;
      };
      let isValid = checkValidation();
      if (!isValid) {
        return isValid;
      }

      let checkIfExist = () => {
        let exist = false;
        let urlPermissionList = this.updateUrlPermissionInfo.urlPermissionList;
        urlPermissionList.some(it => {
          exist = it['oauth'] == newItem.oauth;
//            && it['resource'] == newItem.resource;
          return exist;
        });
        return exist;
      };

      if (checkIfExist()) {
        this.errorMsgForAddUrlPermission = '该权限已经存在';
        isValid = false;
      } else {
        isValid = true;
      }
      if (isValid) {
        this.errorMsgForAddUrlPermission = '';
      }
      return isValid;
    },
    ifAuthorizeUrlChanged(origin, current) {
      let theSame = true;
      if (origin.supportClientId != current.accessKey) {
        theSame = false;
      }
      if (theSame) {
        let detailList = origin.detailList;
        let urlPermissionList = current.urlPermissionList;
        if (detailList.length === urlPermissionList.length) {
          let index = 0;
          detailList.every((it) => {
            let it2 = urlPermissionList[index];
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

    handlePopoverButton(action, index, item) {
      switch (action) {
        case 'delete-url-permission':
          if (!item.hasOwnProperty('id')) {
            this.$message.error('为找到授权URL的ID');
          }
          this.updateUrlPermissionInfo.urlPermissionToDelete = item;
          this.addToWaitingResponseQueue(action);
          this.$net.oauthRemoveUrlPermission(item.id).then(content => {
            this.hideWaitingResponse(action);
            this.$message.success(`权限${item.oauth}删除成功`);
            this.updateUrlPermissionInfo.urlPermissionList.splice(index, 1);
            item['openPopover'] = false;
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
        case 'cancel':
          item['openPopover'] = false;
          break;
      }
    },
    async handleDialogButton(action, index, item) {
      switch (action) {
        case 'as_external_app_or_not':
          // update validate check
        case 'oauth_access_key_create':
          try {
            await this.$refs['oauthCreateForm'].validate();
            if (action == 'oauth_access_key_create') {
              this.action.promise.resolve(this.action.data);
            }
          } catch (err) {
          }
          break;
        case 'oauth_access_config_delete':
          this.action.data.accessConfigList.splice(index, 1);
          item['openPopover'] = false;
          break;
        case 'oauth_access_config_add':
          if (this.canAccessConfigBeAdd()) {
            this.action.data.accessConfigList.push({
              status: '新申请',
              targetGroupId: this.data4KeyAndConfigUpdate.selectedGroupId,
              targetGroupName: this.data4KeyAndConfigUpdate.selectedGroupName,
              targetUaaId: this.data4KeyAndConfigUpdate.selectedUaaId,
              targetClientId: this.data4KeyAndConfigUpdate.selectedClientId,
              targetOauthId: this.data4KeyAndConfigUpdate.selectedOauthId,
              targetOauth: this.data4KeyAndConfigUpdate.selectedOauth,
              openPopover: false
            });
          }
          break;
        case 'oauth_access_key_and_config_update':
          try {
            await this.$refs['oauthKeyAndConfigUpdate'].validate();
            if (this.$utils.theSame(this.action.dataOrigin, this.action.data)) {
              this.$message.warning('您没有做修改！');
              return;
            }
            this.action.promise.resolve(this.action.data);
          } catch (err) {
          }
          break;
        case 'add-url-permission':
          let newItem = JSON.parse(JSON.stringify(this.updateUrlPermissionInfo.newItem));
          if (newItem.oauth.length > 0) {
            newItem.oauth = this.updateUrlPermissionInfo.accessKey + '.' + newItem.oauth;
          }

          if (this.checkAuthorizeUrlValidation(newItem)) {
            this.addToWaitingResponseQueue(action);
            this.$net.oauthAddUrlPermission({
              accessKeyId: this.updateUrlPermissionInfo.accessKeyId,
              oauth: newItem.oauth,
              oauthUrl: newItem.resource,
              groupId: this.$storeHelper.currentGroupId,
            }).then(content => {
              this.hideWaitingResponse(action);
              this.$message.success(`权限${newItem.oauth}添加成功`);
              this.updateUrlPermissionInfo.urlPermissionList.push({
                id: content.id,
                oauth: newItem.oauth,
                resource: newItem.resource,
                openPopover: false
              });
              this.refreshAccessKeyList();
              this.updateUrlPermissionInfo.newItem.oauth = '';
              this.updateUrlPermissionInfo.newItem.resource = '';
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
          }
          break;
        case 'oauth_secret_change':
          try {
            await this.$refs['modifySecretForm'].validate();
            if (this.action.dataOrigin.secret === this.action.data.secret) {
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
              return;
            }
            this.action.promise.resolve(this.action.data);
          } catch (err) {

          }
          break;
        case 'oauth_access_config_open_popover_for_delete':
          // console.log(item)
          if(!item['openPopover']){
            item['openPopover'] = true;
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
    async requestAccessKeyList() {
      if (null === this.$storeHelper.currentGroupId) {
        console.log('数据不完整');
        return;
      }
      let page = this.currentPage - 1;
      page = page >= 0 ? page : 0;
      let start = page * this.pageSize;
      let length = this.pageSize;
      const options = {
        groupId: this.$storeHelper.currentGroupId,
        targetGroupId: '',
        accessKey: this.searchCondition.accessKey,
        start: start,
        length: length,
        productEnv: this.searchCondition.production   // NOTICE: if productEnv is supported in server?
      };
      const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.oauth_get_access_key_list, {
        payload: options
      });
      resData.uaaList.forEach(it => {
        it.accessKey = it.clientId;
        it.applicationName = it.applicationName ? it.applicationName : '---';
        // 访问应用状态信息
        it.appAccessStatus = '';

        it.profileName = '---';
        if (true == it.produceEnv) {
          it.profileName = '生产环境';
        } else if (false == it.produceEnv) {
          it.profileName = '非生产环境';
        }

        it.isProductionProfile = it.produceEnv;
        it.accessConfigList = it['requestUaaAuthoritiesList'] && Array.isArray(it['requestUaaAuthoritiesList']) ? it['requestUaaAuthoritiesList'] : [];
        if (it.accessConfigList.length > 0) {
          it.accessConfigDesc = it.accessConfigList.map(it => {
            return `${it.targetGroupName} - ${it.targetOauth}，${it.status}`;
          });
        } else {
          it.accessConfigDesc = [];
        }
        it.createTime =  this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
        if (it.createTime) {
          it.createTime = it.createTime.split(' ');
        }
        it.description = it.description ? it.description : '---';
      });
      this.accessKeyListByPage = resData.uaaList;
      this.totalSize = resData.total;
    },

    refreshAccessKeyList() {
      this.currentPage = 1;
      this.requestAccessKeyList();
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