<template>
  <div id="oauth-key">
    <el-row class="header" type="flex" justify="center" align="middle">
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
            <el-option :value="null" label="全部"></el-option>
            <el-option :value="true" label="生产环境"></el-option>
            <el-option :value="false" label="非生产环境"></el-option>
          </el-select>
        </div>
        <div class="item">
          <label style="float: left; width: 90px; line-height: 26px">ClientId：</label>
          <el-input v-model="searchCondition.accessKey"
                    style="display:block; width: 200px; margin-left: 90px;"></el-input>
        </div>
        <el-button size="mini-extral"
                   type="primary"
                   :loading="statusOfWaitingResponse('search')"
                   @click="handleButtonClick($event, 'search')">搜索</el-button>
      </el-col>
      <el-col :span="4">
        <el-button
                size="mini-extral"
                type="primary"
                :class="{'disabled': $storeHelper.permission['oauth_create_access_key'].disabled}"
                :loading="statusOfWaitingResponse('oauth_create_access_key')"
                @click="handleButtonClick($event, 'oauth_create_access_key')">
          创建ClientId
        </el-button>
      </el-col>
    </el-row>
    <div class="access-key-list">
      <el-table
              :data="accessKeyListByPage"
              stripe
              :height="heightOfAccessKeyList"
              v-loading="showLoading"
              element-loading-text="加载中"
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
          label="申请访问的对方团队-权限，状态"
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
                    :class="$storeHelper.permission['oauth_update_access_config'].disabled ? 'disabled' : 'warning'"
                    :loading="statusOfWaitingResponse('oauth_update_access_config') && selected.row.id === scope.row.id"
                    @click="handleTRClick($event, 'oauth_update_access_config', scope.$index, scope.row)">
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
                    :class="[$storeHelper.permission['oauth_update_secret'].disabled ? 'disabled' : 'warning']"
                    :loading="statusOfWaitingResponse('oauth_update_secret') && selected.row.id === scope.row.id"
                    @click="handleTRClick($event, 'oauth_update_secret', scope.$index, scope.row)">修改秘钥
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

    <el-dialog title="创建ClientId" :visible="selected.operation == 'oauth_create_access_key'"
               class="create-access-key size-800"
               :close-on-click-modal="false"
               @close="handleDialogClose('create-access-key')"
    >
      <el-form :model="modifyAccessKeyInfo" :rules="rulesForCreateAccessKey" labelWidth="140px" size="mini"
               ref="createAccessKeyForm">
        <el-form-item label="我的团队" v-if="groupInfo">
          {{groupInfo.name}}
        </el-form-item>
        <el-form-item label="是否外部应用">
          <el-radio-group v-model="modifyAccessKeyInfo.isExternalApp">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="外部应用名称" prop="externalAppName"
                      :class="{'external-app-name': true, 'hidden': !modifyAccessKeyInfo.isExternalApp}">
          <el-input v-model="modifyAccessKeyInfo.externalAppName" placeholder="中文，英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
        <el-form-item label="我的应用" prop="appID" v-if="!modifyAccessKeyInfo.isExternalApp" class="app">
          <el-select filterable v-model="modifyAccessKeyInfo.appID" placeholder="请选择"
                     style="display:block; max-width: 280px;">
            <el-option v-for="(item, index) in appListOfCurrentGroup" :key="item.appId" :label="item.appName" :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="访问环境" prop="production" class="profile">
          <el-radio-group v-model="modifyAccessKeyInfo.production">
            <el-radio :label="true">生产环境</el-radio>
            <el-radio :label="false">非生产环境</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="等待申请访问的权限" class="target-app-list" v-if="modifyAccessKeyInfo.targetAuthInfoList.length>0">
          <el-row class="title">
            <el-col :span="3" class="group">团队</el-col>
            <el-col :span="7" class="app">ClientId</el-col>
            <el-col :span="8" class="app">权限</el-col>
            <el-col :span="3" class="status">状态</el-col>
            <el-col :span="3"></el-col>
          </el-row>
          <el-row class="has-exist"
                  v-for="(item, index) in modifyAccessKeyInfo.targetAuthInfoList"
                  :key="index">
            <el-col :span="3" class="group">{{item.targetGroupName}}</el-col>
            <el-col :span="7" class="app">{{item.targetClientId}}</el-col>
            <el-col :span="8" class="app">{{item.targetOauth}}</el-col>
            <el-col :span="3" class="app">{{item.status}}</el-col>
            <el-col :span="3" style="text-align: right">
              <el-popover
                      width="160"
                      v-model="item.openPopover"
                      placement="left"
                      trigger="click"
                      popperClass="el-popover--small"
                      content="复制成功">
                <p style="color: #fa5555">确定要删除"{{item.targetGroupName}}"团队的"{{item.targetOauth}}"权限吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="handlePopoverButton('cancel', index, item)">取消</el-button>
                  <el-button type="danger" size="mini-extral" @click="handlePopoverButton('delete-target-oauth', index, item)">确定</el-button>
                </div>
                <el-button type="primary" size="mini-extral"
                           round
                           slot="reference"
                           @click="handleDialogButton('delete-access-config', index, item)">删除</el-button>
              </el-popover>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="申请访问权限" prop="accessGroupID" class="add-target-app"
                      style="margin-bottom: 20px"
                      :error="errorMsgForAddTargetApp" v-if="true">
          <el-row>
            <el-col :span="5" style="padding-right:4px;">
              <el-select filterable v-model="modifyAccessKeyInfo.targetGroupID" placeholder="请选择" style="display:block; max-width: 200px;">
                <el-option v-for="(item, index) in dataForSelectApp.groupListAll" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="8" style="padding-right:4px;">
              <el-select
                      v-loading="modifyAccessKeyInfo.requestingAppList"
                      element-loading-spinner="el-icon-loading"
                      filterable v-model="modifyAccessKeyInfo.targetUaaId"
                      :placeholder="dataForSelectApp.uaaList.length==0?'列表为空':'请选择'" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForSelectApp.uaaList" :key="item.id" :label="item.clientId" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="7" style="padding-right:4px;">
              <el-select
                      v-loading="modifyAccessKeyInfo.loadingOauthList"
                      element-loading-spinner="el-icon-loading"
                      filterable v-model="modifyAccessKeyInfo.targetOauthId"
                      :placeholder="dataForSelectApp.oauthList.length==0?'列表为空':'请选择'" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForSelectApp.oauthList" :key="item.id" :label="item.oauth" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="2" style="text-align: right">
              <el-button
                      size="mini-extral"
                      type="primary"
                      round
                      style="margin-bottom: 3px"
                      @click="handleDialogButton('add-target-oauth')">添加
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary"
                       :loading="statusOfWaitingResponse('create-access-key')"
                       @click="handleDialogButton('create-access-key')"
            >保&nbsp存</el-button>
          </div>
          <div class="item">
            <el-button @click="handleDialogClose('create-access-key')">取&nbsp消</el-button>
          </div>
      </div>
    </el-dialog>

    <el-dialog title="修改访问配置" :visible="selected.operation == 'oauth_update_access_config'"
               class="update-target-app size-800"
               :close-on-click-modal="false"
               @close="handleDialogClose('add-access-config-in-dialog')"
               v-if="selected.row"
    >
      <el-tag type="warning" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>如需更换团队，请在页面右上角选择我的团队</span>
      </el-tag>
      <el-form labelWidth="140px" size="mini" class="message-show">
        <el-form-item label="我的团队" v-if="groupInfo">
          {{groupInfo.name}}
        </el-form-item>
        <el-form-item label="我的应用">
          <span>{{selected.row.myApp}}</span>
          <span v-if="selected.row.outerApp" class="outer-app-tag">外</span>
        </el-form-item>
        <el-form-item label="访问环境">
          {{selected.row.profileName}}
        </el-form-item>
      </el-form>
      <el-form :model="modifyAccessKeyInfo" :rules="rulesForAccessConfig" labelWidth="140px"
               size="mini" ref="modifyAccessKeyInfoForm">
        <el-form-item label="已申请访问的权限" class="target-app-list" v-if="modifyAccessKeyInfo.targetAuthInfoList.length>0">
          <el-row class="title">
            <el-col :span="3" class="group">团队</el-col>
            <el-col :span="7" class="app">ClientId</el-col>
            <el-col :span="8" class="app">权限</el-col>
            <el-col :span="3" class="status">状态</el-col>
            <el-col :span="3"></el-col>
          </el-row>
          <el-row class="has-exist"
                  v-for="(item, index) in modifyAccessKeyInfo.targetAuthInfoList"
                  :key="index"
          >
            <el-col :span="3" class="group">{{item.targetGroupName}}</el-col>
            <el-col :span="7" class="app">{{item.targetOauth.substr(0,item.targetOauth.indexOf("."))}}</el-col>
            <el-col :span="8" class="app">{{item.targetOauth}}</el-col>
            <el-col :span="3" class="app">{{item.status}}</el-col>
            <el-col :span="3" style="text-align: right">
              <el-popover
                      width="160"
                      v-model="item.openPopover"
                      placement="left"
                      trigger="click"
                      popperClass="el-popover--small"
                      content="复制成功">
                <p style="color: #fa5555">确定要删除"{{item.targetGroupName}}"下的"{{item.targetOauth}}"权限吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="handlePopoverButton('cancel', index, item)">取消</el-button>
                  <el-button type="danger" size="mini-extral" @click="handlePopoverButton('delete-target-oauth', index, item)">确定</el-button>
                </div>
                <el-button type="primary" size="mini-extral"
                           round
                           slot="reference"
                           @click="handleDialogButton('delete-access-config', index, item)">删除</el-button>
              </el-popover>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="申请访问权限" prop="accessGroupID" class="add-target-app"
                      style="margin-bottom: 20px"
                      :error="errorMsgForAddTargetApp">
          <el-row>
            <el-col :span="5" style="padding-right:4px;">
              <el-select filterable v-model="modifyAccessKeyInfo.targetGroupID" placeholder="请选择" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForSelectApp.groupListAll" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="8" style="padding-right:4px;">
              <el-select
                      v-loading="modifyAccessKeyInfo.requestingAppList"
                      element-loading-spinner="el-icon-loading"
                      filterable v-model="modifyAccessKeyInfo.targetUaaId"
                      :placeholder="dataForSelectApp.uaaList.length==0?'列表为空':'请选择'" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForSelectApp.uaaList" :key="item.id" :label="item.clientId" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="7" style="padding-right:4px;">
              <el-select
                      v-loading="modifyAccessKeyInfo.loadingOauthList"
                      element-loading-spinner="el-icon-loading"
                      filterable v-model="modifyAccessKeyInfo.targetOauthId"
                      :placeholder="dataForSelectApp.oauthList.length==0?'列表为空':'请选择'" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForSelectApp.oauthList" :key="item.id" :label="item.oauth" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="2" style="text-align: right">
              <el-button
                      size="mini-extral"
                      type="primary"
                      round
                      style="margin-bottom: 3px"
                      @click="handleDialogButton('add-target-oauth')">添加
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       :loading="statusOfWaitingResponse('submit-target-app-list-in-dialog')"
                       @click="handleDialogButton('submit-target-app-list')"
                       >保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button
                       @click="handleDialogClose('add-access-config-in-dialog')">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="资源配置" :visible="selected.operation == 'oauth_set_permission'"
               class="update-url-permission size-800"
               :close-on-click-modal="false"
               @close="handleDialogClose('update-url-permission')"
    >
      <el-form labelWidth="130px" size="mini" inline>
        <el-form-item label="我的应用">
          <span>{{selected.row.myApp}}</span>
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
                      size="mini-extral"
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
                  <el-button type="danger" size="mini-extral" @click="handlePopoverButton('delete-url-permission', index, item)">确定</el-button>
                </div>
                <el-button type="warning" size="mini-extral"
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
      </div>
      <div slot="footer" class="dialog-footer">
        <div style="text-align: center">
          <el-button @click="handleDialogClose('update-url-permission')">关闭</el-button>
        </div>
      </div>
    </el-dialog>

  <el-dialog title="更改秘钥" :visible="selected.operation == 'oauth_update_secret'"
               class="modify-secret"
               :close-on-click-modal="false"
               @close="selected.operation = null"
               v-if="selected.row"
    >
      <el-form :model="newProps" :rules="rulesForNewProps" labelWidth="160px" size="mini" ref="modifySecretForm">
        <el-form-item label="ClientId：">
          {{selected.row.accessKey}}
        </el-form-item>
        <el-form-item label="Secret：" prop="secret">
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
      &.modify-secret {
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
      &.update-target-app {
        .el-dialog {
          .el-form {
            .el-form-item--mini {
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
  height: calc(100% - 30px);
  .outer-app-tag {
    color: #409EFF;
    font-size: 12px;
    line-height: 100%;
    padding: 1px 2px;
    border: 1px solid #409EFF;
    border-radius: 4px;
  }
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
  import {addResizeListener, removeResizeListener} from 'element-ui/src/utils/resize-event';
  import utils from 'assets/libs/element-ui/utils';

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

      targetGroupList: [],
      showLoading: false,
//      createAccessKeyTag: null,
      searchCondition: {
        groupID: '',
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
        appID: [{
          required: false,
          message: '必须选择应用',
        }],
        production: [{
          required: true,
          message: '必须选择访问环境',
        }],
        externalAppName: [{
          required: true,
          message: '应用名不能为空',
        }, {
          validator: utils.generateValidator(true, true, 2, 30, true)
        }],
      },

      // prop used for dialog update-target-app
      errorMsgForAddTargetApp: '',
      disableMyAppSelectInDialogModifyAccessConfig: false,
      // prop for add or modify app access config
      modifyAccessKeyInfo: {
        isExternalApp: false,
        appID: null,
        production: null,
        externalAppName: '',
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
        targetAuthInfoList:[]
      },
      rulesForAccessConfig: {
        appID: [{
          required: false,
          message: '应用不能为空',
        }],
        production: [{
          required: true,
          message: '请选择访问环境',
        }],
        targetGroupID: [{
          required: true,
          message: '用户组不能为空',
        }],
        targetAppID: [{
          required: true,
          message: '应用名不能为空',
        }],
      },
      dataForSelectApp: {
        groupListAll: null,
        appList: [],
        uaaList: [],
        oauthList:[]
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
      return this.$storeHelper.groupInfo;
    },
    appListOfCurrentGroup: function () {
      let appInfoListOfGroup = this.$storeHelper.appInfoListOfGroup;
      if (appInfoListOfGroup && appInfoListOfGroup.hasOwnProperty('appList')) {
        debugger
        return [{appId: -1, appName: '无'}].concat(appInfoListOfGroup.appList);
      } else {
        return [];
      }
    },
  },

  watch: {
    '$storeHelper.currentGroupID': 'getTargetGroupList',
    '$storeHelper.currentGroupID': function () {
      this.currentPage = 1;
      this.requestAccessKeyList();
    },
    'searchCondition.groupID': function () {
      this.currentPage = 1;
      this.requestAccessKeyList();
    },
    'searchCondition.production': function () {
      this.currentPage = 1;
      this.requestAccessKeyList();
    },
    'modifyAccessKeyInfo.targetGroupID': function (groupID) {
//      console.log(groupID);
      if (!groupID) {
        return;
      }

      this.modifyAccessKeyInfo.requestingAppList = true;
      this.$net.requestPaasServer(this.$net.URL_LIST.uaa_get_by_group, {
        payload: {groupId: groupID,productEnv:this.modifyAccessKeyInfo.production}
      }).then(resContent => {
        // init default value for appList and modifyAccessKeyInfo.targetAppID
        this.modifyAccessKeyInfo.targetUaaId = this.$storeHelper.APP_ID_FOR_NULL;

        // update uaaList and modifyAccessKeyInfo.targetAppID
        if (Array.isArray(resContent)) {
          // resContent.forEach(it => {
          //   it['appId'] = it['id'];
          // });
          this.dataForSelectApp.uaaList = resContent;
          if (resContent.length > 0) {
            this.modifyAccessKeyInfo.targetUaaId = resContent[0].id;
          }
        }

        // get targetGroupName by id
        let target = null;
        let groupList = this.dataForSelectApp.groupListAll;
        if (groupList && Array.isArray(groupList)) {
          groupList.some(it => {
            target = (it.id == groupID) ? it : null;
            return target;
          });
          if (target && target.hasOwnProperty('id')) {
            this.modifyAccessKeyInfo.targetGroupName = target.name;
          } else {
            this.modifyAccessKeyInfo.targetGroupName = '';
          }
        } else {
          this.modifyAccessKeyInfo.targetGroupName = '';
        }
      }).catch(err => {
        this.$message.error('获取应用列表失败！');
      }).finally(() => {
        this.modifyAccessKeyInfo.requestingAppList = false;
      })
    },
    'modifyAccessKeyInfo.targetUaaId': function (uaaId) {
      this.modifyAccessKeyInfo.loadingOauth = true;

      let uaaList = this.dataForSelectApp.uaaList;
      if (uaaList && Array.isArray(uaaList)) {
        let target = null;
        uaaList.some(it => {
          target = (it.id == uaaId) ? it : null;
          return target;
        });
        if (null != target && target.id) {
          let getOauthUrl = encodeURI(this.$utils.formatUrl(this.$net.URL_LIST.oauth_get_by_uaa.path, {
            uaaId: target.id
          }));
          this.$net.requestPaasServer({path:getOauthUrl,method:"get"}).then(content => {
             if(Array.isArray(content) && content.length > 0){
               this.dataForSelectApp.oauthList = content;
               this.modifyAccessKeyInfo.targetOauthId = content[0].id;
               this.modifyAccessKeyInfo.targetOauth = content[0].oauth;
             }else{
               this.modifyAccessKeyInfo.targetOauthId = null;
               this.dataForSelectApp.oauthList = [];
             }
          }).catch(err=>{
             console.error(err)
             this.$message.error('获取Uaa列表失败！');
          }).finally(()=>{
            this.modifyAccessKeyInfo.loadingOauth = false;
          });
          // set targetClientId
          this.modifyAccessKeyInfo.targetClientId = target.clientId;
        } else {
            this.modifyAccessKeyInfo.targetClientId = '';
        }
      }
      // if current app is ok?
      this.isTargetAppOK();
    },
    'modifyAccessKeyInfo.targetOauthId':function (oauthId) {
        let oauthList = this.dataForSelectApp.oauthList;
        if(oauthList && Array.isArray(oauthList)){
            let target = null;
            oauthList.some(o=>{
               target = (o.id === oauthId)?o:null;
            });

            if(null != target && target.oauth){
               this.modifyAccessKeyInfo.targetOauth = target.oauth
            }
        }else{
            this.modifyAccessKeyInfo.targetOauth = '';
        }
    },
    'modifyAccessKeyInfo.appID': function() {
      // if current app is ok?
      this.isTargetAppOK();
    },
    'selected.row': function (row) {
      let disable = false;
      if (row && row.hasOwnProperty('accessConfigList') && row['accessConfigList'].length > 0) {
        disable = true;
      }
      if (row && row.hasOwnProperty('production') && row.production !== null) {
        disable = true;
      }
      if (row && row.hasOwnProperty('profileName') && row.profileName) {
        disable = true;
      }
      this.disableMyAppSelectInDialogModifyAccessConfig = disable;
    },
  },

  methods: {
    // called at: 1. start of page, 2. change of groupID
    getTargetGroupList (groupID) {
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
//        console.log(err);
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
    handleDialogClose(action) {
      this.refreshAccessKeyList();
      this.selected.operation = null;
      if (action) {
        this.hideWaitingResponse(action);
      }
    },

    initModifyAccessKeyInfo () {
      this.modifyAccessKeyInfo.isExternalApp = false;
      this.modifyAccessKeyInfo.appID = null;
      this.modifyAccessKeyInfo.production = false;
      this.modifyAccessKeyInfo.externalAppName = '';
      this.modifyAccessKeyInfo.targetAuthInfoList = [];
      this.modifyAccessKeyInfo.targetGroupID = null;
      this.modifyAccessKeyInfo.targetGroupName = '';
      this.modifyAccessKeyInfo.targetAppID = null;
      this.modifyAccessKeyInfo.requestAuthList = [];
      this.modifyAccessKeyInfo.targetAppList = [];
      this.modifyAccessKeyInfo.targetAppName = '';
    },

    handleButtonClick(evt, action) {
      if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
        this.$storeHelper.globalPopover.show({
          ref: evt.target,
          msg: this.$storeHelper.permission[action].reason
        });
        return;
      }
      switch (action) {
        case 'oauth_create_access_key':
//          console.log(this.appListOfCurrentGroup);
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

          this.addToWaitingResponseQueue(action);
          this.initModifyAccessKeyInfo();
          this.modifyAccessKeyInfo.appID = this.appListOfCurrentGroup[0].appId;
          // get dataForSelectApp
          if (!this.dataForSelectApp.groupListAll) {
            this.$net.getAllGroupList().then(content => {
              if (content.hasOwnProperty('groupList')) {
                let groupList = content.groupList;
                if (Array.isArray(groupList) && groupList.length > 0) {
                  this.dataForSelectApp.groupListAll = groupList;
                  if (groupList.length > 0) {
                    this.modifyAccessKeyInfo.targetGroupID = groupList[0].id;
                    this.modifyAccessKeyInfo.targetGroupName = groupList[0].name;
                  }
                  this.hideWaitingResponse(action);
                  // open dialog for submit-access-config
                  this.selected.operation = action;
                } else {
                  this.$message.error('获取组列表信息失败！');
                }
              }
            }).catch(err => {
              this.hideWaitingResponse(action);
//              this.selected.operation = action;
            })
          } else {
            this.hideWaitingResponse(action);
            this.modifyAccessKeyInfo.targetGroupID = this.dataForSelectApp.groupListAll[0].id;
            this.modifyAccessKeyInfo.targetGroupName = this.dataForSelectApp.groupListAll[0].name;
            this.modifyAccessKeyInfo.targetUaaId = this.dataForSelectApp.uaaList[0].id;
            this.modifyAccessKeyInfo.targetOauthId = this.dataForSelectApp.oauthList[0].id;
            this.modifyAccessKeyInfo.targetClientId = this.dataForSelectApp.uaaList[0].clientId;
            this.modifyAccessKeyInfo.targetOauth = this.dataForSelectApp.oauthList[0].oauth;
            this.selected.operation = action;
          }
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
        case 'oauth_update_access_config':
          let openDialog = ()=>  {
            let selectedRow = this.selected.row;
            this.modifyAccessKeyInfo.production = selectedRow.produceEnv;
            if (Array.isArray(selectedRow.accessConfigList)) {
              this.modifyAccessKeyInfo.targetAuthInfoList = selectedRow.accessConfigList.map(it => {
                return {
                  status: it.status,
                  targetOauth: it.targetOauth,
                  targetGroupId: it.targetGroupId,
                  targetGroupName: it.targetGroupName,
                  targetClientId:it.targetClientId,
                  openPopover: false
                }
              });
            } else {
              this.modifyAccessKeyInfo.targetAuthInfoList = [];
            }
            this.selected.operation = action;
            // remove error tip for button add-access-config
            this.errorMsgForAddTargetApp = '';
          };
          // check dialog-related-data before open dialog
          if (!this.groupInfo) {
            this.$message.error('所需信息不完整！');
            return;
          }
          this.addToWaitingResponseQueue(action);
          this.initModifyAccessKeyInfo();
//          this.modifyAccessKeyInfo.appID = this.appListOfCurrentGroup[0].appId;
          // get dataForSelectApp
          if (!this.dataForSelectApp.groupListAll) {
            this.$net.getAllGroupList().then(content => {
              if (content.hasOwnProperty('groupList')) {
                let groupList = content.groupList;
                if (Array.isArray(groupList) && groupList.length > 0) {
                  this.dataForSelectApp.groupListAll = groupList;
                  if (groupList.length > 0) {
                    this.modifyAccessKeyInfo.targetGroupID = groupList[0].id;
                    this.modifyAccessKeyInfo.targetGroupName = groupList[0].name;
                  }
                  this.hideWaitingResponse(action);
                  // open dialog for submit-access-config
                  openDialog();
                } else {
                  this.$message.error('获取组列表信息失败！');
                }
              }
            }).catch(err => {
              this.hideWaitingResponse(action);
//              this.selected.operation = action;
            })
          } else {
            this.hideWaitingResponse(action);
            this.modifyAccessKeyInfo.targetGroupID = this.dataForSelectApp.groupListAll[0].id;
            this.modifyAccessKeyInfo.targetGroupName = this.dataForSelectApp.groupListAll[0].name;
            this.modifyAccessKeyInfo.targetUaaId = this.dataForSelectApp.uaaList[0].id;
            this.modifyAccessKeyInfo.targetOauthId = this.dataForSelectApp.oauthList[0].id;
            this.modifyAccessKeyInfo.targetClientId = this.dataForSelectApp.uaaList[0].clientId;
            this.modifyAccessKeyInfo.targetOauth = this.dataForSelectApp.oauthList[0].oauth;

            openDialog();
          }
//          if (this.selected.operation) {
//            this.$nextTick(() => {
//              let formName = 'modifyAccessKeyInfoForm';
//              this.$refs.hasOwnProperty(formName) && this.$refs[formName].validate((valid) => {
//              })
//            });
//          }
          break;
        case 'oauth_set_permission':
          if (!this.groupInfo) {
            this.$message.error('所需信息不完整！');
            return;
          }
//          console.log(row);

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
        case 'oauth_update_secret':
          this.newProps.secret = row.secret;
          this.selected.operation = action;
          break;
        case 'oauth_delete_access_key':
          let appDesc = '';
//          let row = this.selected.row;
          if (row.myApp && row.profileName) {
            appDesc = `应用 “${row.myApp}” 的`;
          }
          this.addToWaitingResponseQueue(action);
          this.warningConfirm('删除AccessKey',
            `删除${appDesc}AccessKey将会造成已经授权的配置失效，你确定需要这么做吗？`).then(() => {
            this.$net.oauthDeleteAccessKey(this.selected.row.id).then(msg => {
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
     * if the app to add is ok? (used in dialog update-target-app)
     * 1. appId exist(some group does not have app)
     * 2. the appId not in the has-add-app-id-list
     *
     * trigger by watch: modifyAccessKeyInfo.appID, modifyAccessKeyInfo.targetAppID
     */
    isTargetAppOK() {
      let errMsg = '';
      let modifyAccessKeyInfo = this.modifyAccessKeyInfo;

      if(modifyAccessKeyInfo.targetGroupID === this.$storeHelper.GROUP_ID_FOR_ALL) {
        errMsg = '未选择团队';
      }

      if(modifyAccessKeyInfo.targetUaaId === this.$storeHelper.APP_ID_FOR_NULL){
        errMsg = '未选择clientId';
      }

      if(modifyAccessKeyInfo.targetOauthId === this.$storeHelper.APP_ID_FOR_NULL){
        errMsg = '未选择权限信息';
      }

      if (!errMsg) {
        let isExist = false;
        let hasExisted = this.modifyAccessKeyInfo.targetAuthInfoList;
        hasExisted.some(it => {
          isExist =  it['targetGroupId'] === this.modifyAccessKeyInfo.targetGroupID
                  && it['targetUaaId'] === this.modifyAccessKeyInfo.targetUaaId
                  && it['targetOauthId'] === this.modifyAccessKeyInfo.targetOauthId;
          return isExist;
        });

        if (isExist) {
          errMsg = '已绑定该权限，不能重复绑定';
        }
      }

      this.errorMsgForAddTargetApp = errMsg;
      return !errMsg;
    },
    ifAppListChanged(origin, current) {
      let theSame = true;
      if (origin.length === current.length) {
        let index = 0;
        origin.every((it) => {
          let it2 = current[index];
          index += 1;
          theSame = it.targetGroupId == it2.targetGroupId && it.targetApplicationId == it2.targetApplicationId;
          return theSame;
        });
      } else {
        theSame = false;
      }
      return !theSame;
    },

    /**
     *  used to check new added authorized-url in dialog update-target-app
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
        case 'delete-target-oauth':
          this.modifyAccessKeyInfo.targetAuthInfoList.splice(index, 1);
          item['openPopover'] = false;
          // update message of errorMsgForAddTargetApp after modifyAccessKeyInfo.targetAppList
          this.isTargetAppOK();
          break;
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
    handleDialogButton(action, index, item) {
      switch (action) {
        case 'create-access-key':
//          console.log(this.modifyAccessKeyInfo);
          let targetAuthInfoList = this.modifyAccessKeyInfo.targetAuthInfoList.map((it) => {
            return {
              groupId: it.targetGroupId,
              uaaId: it.targetUaaId,
              clientId:it.targetClientId,
              uaaOauthId:it.targetOauthId,
              oauth:it.targetOauth
            }
          });
          let dataToPost = {
            groupId: this.$storeHelper.currentGroupID,
            outerApp: this.modifyAccessKeyInfo.isExternalApp,
            productEnv: this.modifyAccessKeyInfo.production,
            applyList: targetAuthInfoList
          };
          if (this.modifyAccessKeyInfo.isExternalApp) {
            dataToPost['outerAppName'] = this.modifyAccessKeyInfo.externalAppName;
          } else {
            dataToPost['applicationId'] = this.modifyAccessKeyInfo.appID;
          }
          this.addToWaitingResponseQueue(action);
          this.$net.oAuthCreateAccessKey(dataToPost).then(content => {
            this.handleDialogClose();
            this.$message.success(`Access key ${content.secret} 创建成功！`);
            this.refreshAccessKeyList();
          }).catch(msg => {
            this.$notify.error({
              title: '创建AccessKey失败！',
              message: msg,
              duration: 0,
              onClose: function () {
              }
            });
          }).finally(() => {
            this.hideWaitingResponse(action);
          });
          break;
        case 'add-target-oauth':
//          console.log(this.modifyAccessKeyInfo);
          if (this.isTargetAppOK()) {
            this.modifyAccessKeyInfo.targetAuthInfoList.push({
              status: '新申请',
              targetGroupId: this.modifyAccessKeyInfo.targetGroupID,
              targetGroupName: this.modifyAccessKeyInfo.targetGroupName,
              targetUaaId: this.modifyAccessKeyInfo.targetUaaId,
              targetClientId: this.modifyAccessKeyInfo.targetClientId,
              targetOauthId: this.modifyAccessKeyInfo.targetOauthId,
              targetOauth: this.modifyAccessKeyInfo.targetOauth,
              openPopover: false
            });
          }
          break;
        case 'submit-target-app-list':
          // if this.selected.row.accessConfigList.length == 0, go on.
          if (this.selected.row.accessConfigList.length > 0 &&
            !this.ifAppListChanged(this.selected.row.accessConfigList, this.modifyAccessKeyInfo.targetAuthInfoList)) {
            this.$message.warning('您没有做修改');
            this.handleDialogClose();
            return;
          }
          this.requestUpdate(action, 'accessConfigList');
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
              oauthUrl: newItem.resource
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
      if (!this.selected.row.id) {
        this.$message.error('未找到ID');
        return;
      }
      this.addToWaitingResponseQueue(action + '-in-dialog');
      switch (prop) {
        case 'secret':
          this.$net.oauthUpdateSecret(this.selected.row.id, {
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
        case 'accessConfigList':
          let appListToPost = this.modifyAccessKeyInfo.targetAuthInfoList.map((it) => {
            return {
              groupId: it.targetGroupId,
              uaaId: it.targetUaaId,
              clientId:it.targetClientId,
              uaaOauthId:it.targetOauthId,
              oauth:it.targetOauth
            }
          });
          this.$net.oauthUpdateTargetApp(this.selected.row.id, {
            groupId: this.$storeHelper.currentGroupID,
            applicationId: this.modifyAccessKeyInfo.appID,
            productEnv: this.modifyAccessKeyInfo.production,
            applyList: appListToPost
          }).then(msg => {
            this.hideWaitingResponse(action + '-in-dialog');
            this.selected.operation = null;
            this.$message.success(msg);
            this.updateModelInfo(prop);
          }).catch(msg => {
            this.hideWaitingResponse(action + '-in-dialog');
            this.selected.operation = null;
            this.$notify.error({
              title: '添加失败！',
              message: msg,
              duration: 0,
              onClose: function () {
              }
            });
          });
          break;
      }
    },
    updateModelInfo(prop) {
      switch (prop) {
        case 'secret':
          this.selected.row[prop] = this.newProps[prop];
          break;
        case 'accessConfigList':
//          let accessConfigList = this.newProps['accessConfigList'];
          let targetAuthInfoList = this.modifyAccessKeyInfo.targetAuthInfoList;
          let accessConfigDesc = [];
          if (targetAuthInfoList.length > 0) {
            accessConfigDesc = targetAuthInfoList.map(it => {
              return `${it.targetGroupName} - ${it.targetOauth}，${it.status}`;
            });
          }
          this.selected.row['accessConfigList'] = JSON.parse(JSON.stringify(targetAuthInfoList));
          this.selected.row['accessConfigDesc'] = JSON.parse(JSON.stringify(accessConfigDesc));
          if (!this.selected.row.myApp) {
            let app = this.$storeHelper.getAppByID(this.modifyAccessKeyInfo.appID);
            if (app) {
              this.selected.row.myApp = app.appName;
            }
            this.selected.row.profileName = this.modifyAccessKeyInfo.production ? '生产环境':'非生产环境';
          }
          // set this.selected.row = null at the end of operation
//          this.selected.row = null;
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
    requestAccessKeyList(cb) {
      if (typeof(cb) != 'function') {
        cb = function() {};
      }
      if (null === this.$storeHelper.currentGroupID) {
//        this.$message.error('数据不完整，请刷新页面重试！');
        cb(false);
        return;
      }
      let page = this.currentPage - 1;
      page = page >= 0 ? page : 0;
      let start = page * this.pageSize;
      let length = this.pageSize;
      let searchGroupID = this.searchCondition.groupID;
      let options = {
        groupId: this.$storeHelper.currentGroupID,
        targetGroupId: searchGroupID == this.$storeHelper.GROUP_ID_FOR_ALL ? '' : searchGroupID,
        accessKey: this.searchCondition.accessKey,
        start: start,
        length: length,
      };
      // options will not have property productEnv if searchCondition.production is null
      if (null !== this.searchCondition.production) {
        options.productEnv = this.searchCondition.production;
      }
      this.showLoading = true;
      this.$net.getAccessKeyList(options).then(content => {
        if (content.hasOwnProperty('uaaList')) {
          this.accessKeyListByPage = content['uaaList'];
          this.totalSize = content.total;
        }
        this.showLoading = false;
        cb(true)
      }).catch(err => {
          console.error(err)
        this.showLoading = false;
        cb(false);
        this.$notify.error({
          title: err.title,
          message: err.message,
          duration: 0
        })
      });
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

    // TODO: not used
    getEmptyItem() {
      return {
        "id": null,
        "createTime": '',
        "accessKey": '',
        "secret": '',
        "profileName": '',
        "myApp": '',
        "creatorName": "",
        "accessConfigList": [],
        "accessConfigDesc": []
      }
    },
  }
}
</script>