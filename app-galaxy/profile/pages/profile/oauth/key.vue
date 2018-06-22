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
          <label style="float: left; width: 90px; line-height: 26px">AccessKey：</label>
          <el-input v-model="searchCondition.accessKey"
                    style="display:block; width: 200px; margin-left: 90px;"></el-input>
        </div>
        <el-button size="mini-extral"
                   type="primary"
                   :loading="statusOfWaitingResponse('search')"
                   @click="handleButtonClick('search')">搜索</el-button>
      </el-col>
      <el-col :span="4">
        <el-button
                v-if="!$storeHelper.notPermitted['oauth_create_access_key']"
                size="mini-extral"
                type="primary"
                :loading="statusOfWaitingResponse('open-dialog-4-create-access-key')"
                @click="handleButtonClick('open-dialog-4-create-access-key')">
          {{contentOfCreateAccessKeyButton}}
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
          label="AccessKey"
          width="140"
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
                   v-clipboard:success="handleTRClick.bind(this, 'copy', scope.$index, scope.row)"></i>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="secret"
          label="Access Secret"
          min-width="120"
          headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <div class="secret">
              <span>{{scope.row.secret}}</span>
              <el-popover
                      placement="bottom"
                      trigger="click"
                      :disabled="disablePopper"
                      popperClass="el-popover--small is-dark"
                      content="复制成功">
                <i class="my-icon-copy" slot="reference"
                   v-clipboard:copy="scope.row.secret"
                   v-clipboard:success="handleTRClick.bind(this, 'copy', scope.$index, scope.row)"></i>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="myApp"
          label="我的应用"
          min-width="160"
          headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <div>
              <span>{{scope.row.myApp ? scope.row.myApp: '未配置'}}</span>
              <span v-if="scope.row.outerApp"
                    style="color: #409EFF; font-size: 12px; line-height: 100%; padding: 2px; border: 1px solid #409EFF; border-radius: 4px;">外</span>
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
          label="申请访问的对方团队-应用，状态"
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
            <div class="button-list">
              <el-button
                      v-if="!$storeHelper.notPermitted['oauth_add_access_config']"
                      size="mini-extral"
                      type="warning"
                      :loading="statusOfWaitingResponse('open-dialog-for-update-target-app') && selected.row.id === scope.row.id"
                      @click="handleTRClick('open-dialog-4-modify-access-key', scope.$index, scope.row)">
                修改访问配置
              </el-button>
              <el-button
                      size="mini-extral"
                      type="warning"
                      :loading="statusOfWaitingResponse('open-dialog-4-update-url-permission') && selected.row.id === scope.row.id"
                      @click="handleTRClick('open-dialog-4-update-url-permission', scope.$index, scope.row)">
                权限配置
              </el-button>
              <el-button
                      v-if="!$storeHelper.notPermitted['oauth_update_secret']"
                      size="mini-extral"
                      type="warning"
                      :loading="statusOfWaitingResponse('modify-secret') && selected.row.id === scope.row.id"
                      @click="handleTRClick('modify-secret', scope.$index, scope.row)">修改秘钥
              </el-button>
              <el-button
                      v-if="!$storeHelper.notPermitted['oauth_delete_access_key']"
                      size="mini-extral"
                      type="danger"
                      :loading="statusOfWaitingResponse('delete-access-key') && selected.row.id === scope.row.id"
                      @click="handleTRClick('delete-access-key', scope.$index, scope.row)">删除
              </el-button>
            </div>
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

    <el-dialog title="创建AccessKey" :visible="selected.operation == 'open-dialog-4-create-access-key'"
               class="create-access-key size-700"
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
        <el-form-item label="已申请应用" class="target-app-list" v-if="modifyAccessKeyInfo.targetAppList.length>0">
          <el-row class="title">
            <el-col :span="6" class="group">团队</el-col>
            <el-col :span="10" class="app">应用</el-col>
            <el-col :span="5" class="status">状态</el-col>
            <el-col :span="3"></el-col>
          </el-row>
          <el-row class="has-exist"
                  v-for="(item, index) in modifyAccessKeyInfo.targetAppList"
                  :key="index"
          >
            <el-col :span="6" class="group">{{item.targetGroupName}}</el-col>
            <el-col :span="10" class="app">{{item.targetApplicationName}}</el-col>
            <el-col :span="5" class="app">{{item.status}}</el-col>
            <el-col :span="3" style="text-align: right">
              <el-popover
                      width="160"
                      v-model="item.openPopover"
                      placement="left"
                      trigger="click"
                      popperClass="el-popover--small"
                      content="复制成功">
                <p style="color: #fa5555">确定要删除"{{item.targetGroupName}}"下的应用"{{item.targetApplicationName}}"吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="handlePopoverButton('cancel', index, item)">取消</el-button>
                  <el-button type="danger" size="mini-extral" @click="handlePopoverButton('delete-target-app', index, item)">确定</el-button>
                </div>
                <el-button type="warning" size="mini-extral"
                           round
                           slot="reference"
                           @click="handleDialogButton('delete-access-config', index, item)">删除</el-button>
              </el-popover>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="申请访问对方应用" prop="accessGroupID" class="add-target-app"
                      style="margin-bottom: 20px"
                      :error="errorMsgForAddTargetApp">
          <el-row>
            <el-col :span="11" style="padding-right:4px;">
              <el-select filterable v-model="modifyAccessKeyInfo.targetGroupID" placeholder="请选择" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForSelectApp.groupListAll" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="11" style="padding-right:4px;">
              <el-select filterable v-model="modifyAccessKeyInfo.targetAppID"
                         :placeholder="dataForSelectApp.appList.length==0?'应用列表为空':'请选择'" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForSelectApp.appList" :key="item.appId" :label="item.appName" :value="item.appId">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="2" style="text-align: right">
              <el-button
                      size="mini-extral"
                      type="warning"
                      style="margin-bottom: 3px"
                      @click="handleDialogButton('add-target-app')">添加
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       :loading="statusOfWaitingResponse('create-access-key')"
                       @click="handleDialogButton('create-access-key')"
            >保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button
                       @click="handleDialogClose('create-access-key')">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="修改访问配置" :visible="selected.operation == 'open-dialog-4-modify-access-key'"
               class="update-target-app size-700"
               :close-on-click-modal="false"
               @close="handleDialogClose('add-access-config-in-dialog')"
               v-if="selected.row"
    >
      <el-tag type="warning" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>如需更换团队，请在页面右上角选择我的团队</span>
      </el-tag>
      <el-form labelWidth="140px" inline size="mini" >
        <el-form-item label="我的团队" v-if="groupInfo">
          {{groupInfo.name}}
        </el-form-item>
        <el-form-item label="我的应用">
          {{selected.row.myApp}}
        </el-form-item>
        <el-form-item label="访问环境">
          {{selected.row.profileName}}
        </el-form-item>
      </el-form>
      <el-form :model="modifyAccessKeyInfo" :rules="rulesForAccessConfig" labelWidth="140px"
               size="mini" ref="modifyAccessKeyInfoForm">
        <el-form-item label="已申请应用" class="target-app-list" v-if="modifyAccessKeyInfo.targetAppList.length>0">
          <el-row class="title">
            <el-col :span="8" class="group">团队</el-col>
            <el-col :span="12" class="app">应用</el-col>
            <el-col :span="0" class="status">状态</el-col>
            <el-col :span="4"></el-col>
          </el-row>
          <el-row class="has-exist"
                  v-for="(item, index) in modifyAccessKeyInfo.targetAppList"
                  :key="index"
          >
            <el-col :span="8" class="group">{{item.targetGroupName}}</el-col>
            <el-col :span="12" class="app">{{item.targetApplicationName}}</el-col>
            <el-col :span="0" class="app">{{item.status}}</el-col>
            <el-col :span="4" style="text-align: right">
              <el-popover
                      width="160"
                      v-model="item.openPopover"
                      placement="left"
                      trigger="click"
                      popperClass="el-popover--small"
                      content="复制成功">
                <p style="color: #fa5555">确定要删除"{{item.targetGroupName}}"下的应用"{{item.targetApplicationName}}"吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="handlePopoverButton('cancel', index, item)">取消</el-button>
                  <el-button type="danger" size="mini-extral" @click="handlePopoverButton('delete-target-app', index, item)">确定</el-button>
                </div>
                <el-button type="warning" size="mini-extral"
                           round
                           slot="reference"
                           @click="handleDialogButton('delete-access-config', index, item)">删除</el-button>
              </el-popover>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="申请访问对方应用" prop="accessGroupID" class="add-target-app"
                      style="margin-bottom: 20px"
                      :error="errorMsgForAddTargetApp">
          <el-row>
            <el-col :span="11" style="padding-right:4px;">
              <el-select filterable v-model="modifyAccessKeyInfo.targetGroupID" placeholder="请选择" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForSelectApp.groupListAll" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="11" style="padding-right:4px;">
              <el-select filterable v-model="modifyAccessKeyInfo.targetAppID"
                         :placeholder="dataForSelectApp.appList.length==0?'应用列表为空':'请选择'" style="display:block; max-width: 280px;">
                <el-option v-for="(item, index) in dataForSelectApp.appList" :key="item.appId" :label="item.appName" :value="item.appId">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="2" style="text-align: right">
              <el-button
                      size="mini-extral"
                      type="primary"
                      style="margin-bottom: 3px"
                      @click="handleDialogButton('add-target-app')">添加
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

    <el-dialog title="权限配置" :visible="selected.operation == 'open-dialog-4-update-url-permission'"
               class="update-url-permission size-750"
               :close-on-click-modal="false"
               @close="handleDialogClose('update-url-permission')"
    >
      <el-form labelWidth="130px" size="mini" inline>
        <el-form-item label="我的应用">
          {{selected.row.myApp}}
        </el-form-item>
        <el-form-item label="访问环境">
          {{selected.row.profileName}}
        </el-form-item>
        <el-form-item label="所属AccessKey">
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

  <el-dialog title="更改秘钥" :visible="selected.operation == 'modify-secret'"
               class="modify-secret"
               :close-on-click-modal="false"
               @close="selected.operation = null"
               v-if="selected.row"
    >
      <el-form :model="newProps" :rules="rulesForNewProps" labelWidth="160px" size="mini" ref="modifySecretForm">
        <el-form-item label="AccessKey：">
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
  .el-row.header {
    padding: 5px 0px;
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
      .button-list {
        text-align: left;
      }
      .more {
        &:hover {
        }
        font-size: 12px;
      }
      .el-button {
        margin: 2px 4px;
        margin-left: 0px;
      }
    }
  }
}
</style>

<script>
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  import utils from '$assets/libs/element-ui/utils';
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
      contentOfCreateAccessKeyButton: '创建AccessKey',
      searchCondition: {
        groupID: '',
        production: null,
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

//      modifyAccessKeyInfo: {
//        isExternalApp: false,
//        appID: null,
//        production: false,
//        externalAppName: '',
//      },
      rulesForCreateAccessKey: {
        appID: [{
          required: true,
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
        targetAppList: [],
        targetGroupID: null,
        targetGroupName: '',
        targetAppID: null,
        targetAppName: ''
      },
      rulesForAccessConfig: {
        appID: [{
          required: true,
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
        appList: []
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
      return this.$storeHelper.groupInfo();
    },
    appListOfCurrentGroup() {
      let appInfoListOfGroup = this.$storeHelper.appInfoListOfGroup;
      if (appInfoListOfGroup && appInfoListOfGroup.hasOwnProperty('appList')) {
        return appInfoListOfGroup.appList;
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
      this.$net.getAppListByGroupID({
        groupId: groupID
      }).then(content => {
        if (content && content.hasOwnProperty('appList')) {
          this.modifyAccessKeyInfo.targetAppID = this.$storeHelper.APP_ID_FOR_NULL;
          if (Array.isArray(content.appList)) {
            this.dataForSelectApp.appList = content.appList;
            if (content.appList.length > 0) {
              this.modifyAccessKeyInfo.targetAppID = content.appList[0].appId;
            }
          }
        }

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
      });
    },
    'modifyAccessKeyInfo.targetAppID': function (appId) {
      let appList = this.dataForSelectApp.appList;
      if (appList && Array.isArray(appList)) {
        let target = null;
        appList.some(it => {
          target = (it.appId == appId) ? it : null;
          return target;
        });
        if (target && target.appId) {
          this.modifyAccessKeyInfo.targetAppName = target.appName;
        } else {
          this.modifyAccessKeyInfo.targetAppName = '';
        }
      } else {
        this.modifyAccessKeyInfo.targetAppName = '';
      }
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
      this.modifyAccessKeyInfo.targetAppList = [];
      this.modifyAccessKeyInfo.targetGroupID = null;
//      this.modifyAccessKeyInfo.targetGroupName = '';
      this.modifyAccessKeyInfo.targetAppID = null;
//      this.modifyAccessKeyInfo.targetAppName = '';
    },

    handleButtonClick(action) {
      switch (action) {
        case 'open-dialog-4-create-access-key':
//          console.log(this.appListOfCurrentGroup);
          if (!this.groupInfo || !this.appListOfCurrentGroup || this.appListOfCurrentGroup.length === 0) {
            this.$message.error('所需信息不完整！');
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
            // set default accessID if necessary
            if (Array.isArray(this.dataForSelectApp.appList) && this.dataForSelectApp.appList.length > 0) {
              this.modifyAccessKeyInfo.targetAppID = this.dataForSelectApp.appList[0].appId;
            }
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
    handleTRClick(action, index, row) {
      this.selected.row = row;
      switch (action) {
        case 'copy':
          this.disablePopper = false;
          setTimeout(() => {
            this.disablePopper = true;
          }, 500);
//          this.$message.success('复制成功');
          break;
        case 'open-dialog-4-modify-access-key':
          let openDialog = ()=>  {
            let selectedRow = this.selected.row;
//            console.log(selectedRow);
            this.modifyAccessKeyInfo.appID = selectedRow.applicationId;
            if (Array.isArray(selectedRow.accessConfigList)) {
              this.modifyAccessKeyInfo.targetAppList = selectedRow.accessConfigList.map(it => {
                return {
                  status: it.status,
                  targetApplicationId: it.targetApplicationId,
                  targetApplicationName: it.targetApplicationName,
                  targetGroupId: it.targetGroupId,
                  targetGroupName: it.targetGroupName,
                  openPopover: false
                }
              });
            } else {
              this.modifyAccessKeyInfo.targetAppList = [];
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
            // set default accessID if necessary
            if (Array.isArray(this.dataForSelectApp.appList) && this.dataForSelectApp.appList.length > 0) {
              this.modifyAccessKeyInfo.targetAppID = this.dataForSelectApp.appList[0].appId;
            }
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
        case 'open-dialog-4-update-url-permission':
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
        case 'modify-secret':
          this.newProps.secret = row.secret;
          this.selected.operation = action;
          break;
        case 'delete-access-key':
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

    /**
     * if the app to add is ok? used in dialog update-target-app
     * if the app to add is ok?
     * 1. appId exist(some group does not have app)
     * 2. the appId not in the has-add-app-id-list
     */
    isTargetAppOK() {
      let appIdIsOK = true;
      let isExist = false;

      if (this.modifyAccessKeyInfo.targetAppID === this.$storeHelper.APP_ID_FOR_NULL) {
        appIdIsOK = false;
      }
      if (appIdIsOK) {
        let hasExisted = this.modifyAccessKeyInfo.targetAppList;
        hasExisted.some(it => {
          isExist = it['targetGroupId'] == this.modifyAccessKeyInfo.targetGroupID &&
            it['targetApplicationId'] == this.modifyAccessKeyInfo.targetAppID;
          return isExist;
        });
      }
      if (!appIdIsOK) {
        this.errorMsgForAddTargetApp = '未选择应用';
      } else if (isExist) {
        this.errorMsgForAddTargetApp = '已绑定该应用，不能重复绑定';
      } else {
        this.errorMsgForAddTargetApp = '';
      }
      return appIdIsOK && !isExist;
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
        case 'delete-target-app':
          this.modifyAccessKeyInfo.targetAppList.splice(index, 1);
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
          let targetAppList = this.modifyAccessKeyInfo.targetAppList.map((it) => {
            return {
              groupId: it.targetGroupId,
              applicationId: it.targetApplicationId
            }
          });
          let dataToPost = {
            groupId: this.$storeHelper.currentGroupID,
            outerApp: this.modifyAccessKeyInfo.isExternalApp,
            productEnv: this.modifyAccessKeyInfo.production,
            applyList: targetAppList
          };
          if (this.modifyAccessKeyInfo.isExternalApp) {
            dataToPost['outerAppName'] = this.modifyAccessKeyInfo.externalAppName;
          } else {
            dataToPost['applicationId'] = this.modifyAccessKeyInfo.appID;
          }

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
          });
          break;
        case 'add-target-app':
          if (this.isTargetAppOK()) {
            this.modifyAccessKeyInfo.targetAppList.push({
              status: '新加',
              targetApplicationId: this.modifyAccessKeyInfo.targetAppID,
              targetApplicationName: this.modifyAccessKeyInfo.targetAppName,
              targetGroupId: this.modifyAccessKeyInfo.targetGroupID,
              targetGroupName: this.modifyAccessKeyInfo.targetGroupName,
              openPopover: false
            });
          }
          break;
        case 'submit-target-app-list':
          // if this.selected.row.accessConfigList.length == 0, go on.
          if (this.selected.row.accessConfigList.length > 0 &&
            !this.ifAppListChanged(this.selected.row.accessConfigList, this.modifyAccessKeyInfo.targetAppList)) {
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
                oauth: newItem.oauth,
                resource: newItem.resource,
                openPopover: false
              });
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
          let appListToPost = this.modifyAccessKeyInfo.targetAppList.map((it) => {
            return {
              groupId: it.targetGroupId,
              applicationId: it.targetApplicationId
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
          let targetAppList = this.modifyAccessKeyInfo.targetAppList;
          let accessConfigDesc = [];
          if (targetAppList.length > 0) {
            accessConfigDesc = targetAppList.map(it => {
              return `${it.targetGroupName} - ${it.targetApplicationName}，${it.status}`;
            });
          }
          this.selected.row['accessConfigList'] = JSON.parse(JSON.stringify(targetAppList));
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
      if (null === this.$storeHelper.currentGroupID) {
        return;
      }
      if (typeof(cb) != 'function') {
        cb = function() {};
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
        this.showLoading = false;
        cb(false)
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