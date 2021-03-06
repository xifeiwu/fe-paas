<template>
  <div id="app-main">
    <div class="header" v-if="showAppList">
        <div class="item">
          <el-button
                  size="mini"
                  :type="'primary'"
                  :class="{'disabled': $storeHelper.permission['app_create'].disabled}"
                  @click="handleButtonClick($event, 'app_create')">
            创建应用
          </el-button>
          <el-button v-if="true"
                     size="mini"
                     type="primary"
                     @click="handleButtonClick($event, 'refreshAppList')"><i class="el-icon el-icon-refresh" style="margin-right: 3px;"></i>刷新</el-button>
        </div>
        <div class="item app-filter">
          <el-checkbox v-model="filterMyApp">
            <span>我的应用</span>
            <span>(共{{myAppCount}}个)</span>
          </el-checkbox>
          <el-input size="mini" placeholder="按名称搜索应用" class="search"
                    style="max-width: 360px;"
                    v-model="filterKey">
            <i slot="prefix" class="el-icon-search"></i>
            <i :class="filterKey && filterKey.length > 0 ? 'paas-icon-close' : ''"
               slot="suffix"
               @click="evt => filterKey=''"></i>
          </el-input>
        </div>
    </div>
    <div class="app-list" v-if="showAppList">
      <el-table :data="appModelListByPage"
                stripe
                :height="heightOfTable">
        <el-table-column label="语言版本" prop="languageVersion" headerAlign="center" align="center" width="80">
          <template slot-scope="scope">
            <svg v-if="scope.row.language.name"
                 :class="['paas-icon-svg', 'paas-icon-' + scope.row.language.name]" aria-hidden="true">
              <use :xlink:href="'#paas-icon-' + scope.row.language.name"></use>
            </svg>
            <div class="language" v-else>{{scope.row.language.name ? scope.row.language.name : '语言名未知'}}</div>
            <div class="version" v-if="scope.row.language.version">{{scope.row.language.version}}</div>
            <div v-else>版本未知</div>
          </template>
        </el-table-column>
        <el-table-column label="应用名称" prop="appName" headerAlign="left" align="left" minWidth="100">
          <template slot-scope="scope">
            <span>{{scope.row.appName}}</span>
            <i v-if="false"
                    class="el-icon-edit" @click="handleTRClick($event, 'app_change_name', scope.$index, scope.row)"></i>
          </template>
        </el-table-column>
        <el-table-column label="项目名称" prop="projectName" headerAlign="left" align="left" minWidth="100">
          <template slot-scope="scope">
            <span>{{scope.row.projectName}}</span>
          </template>
        </el-table-column>
        <el-table-column label="二级域名(serviceName)" prop="serviceName" headerAlign="left" align="left" minWidth="100">
          <template slot-scope="scope">
            <span>{{scope.row.serviceName}}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建者" prop="creator" headerAlign="center" align="center" width="80">
        </el-table-column>
        <el-table-column label="维护者" prop="maintainerList" headerAlign="center" align="center" width="100">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.maintainerList) && scope.row.maintainerList.length > 1">
              <span>
                {{scope.row.maintainerList[0]['realName']}}
              </span>
              <el-tooltip slot="trigger" effect="dark" placement="right">
                <div slot="content">
                  <div v-for="(item, index) in scope.row.maintainerList">
                    {{item.realName}}
                  </div>
                </div>
                <span class="more">...</span>
              </el-tooltip>
            </div>
            <div v-else-if="Array.isArray(scope.row.maintainerList) && scope.row.maintainerList.length === 1">
              {{scope.row.maintainerList[0]['realName']}}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" headerAlign="center" align="center" width="100">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="应用说明" prop="description" headerAlign="center" align="center" width="60">
          <template slot-scope="scope">
            <div v-if="scope.row.description">
              <div v-if="scope.row.description.length <20">
                <el-tooltip slot="trigger" effect="dark" placement="right">
                  <div slot="content">
                    <span>{{scope.row.description}}</span>
                  </div>
                  <span class="more">...</span>
                </el-tooltip>
              </div>
              <div v-else>
                <el-tooltip slot="trigger" effect="dark" placement="right">
                  <div slot="content" style="width: 100px;">
                    <span>{{scope.row.description.substring(0,21) + "..."}}</span>
                  </div>
                  <span class="more">...</span>
                </el-tooltip>
              </div>
            </div>
            <div v-else>
              <span>无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operation" width="240" headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-row>
              <el-col :span="24">
                <el-button
                    type="text"
                    :class="['flex', 'primary']"
                    @click="handleTRClick($event, 'app_show_profile', scope.$index, scope.row)">
                  <span>运行环境</span><i class="paas-icon-popover" style="margin-left: 3px;"></i>
                </el-button>
                <div class="ant-divider"></div>
                <el-button
                    type="text"
                    :class="['flex', $storeHelper.actionDisabled('app_update') ? 'disabled' : 'warning']"
                    @click="handleTRClick($event, 'app_update', scope.$index, scope.row)">
                  <span>修改应用</span><i class="paas-icon-level-up"></i>
                </el-button>
                <div class="ant-divider"></div>
                <el-button
                    type="text"
                    :class="$storeHelper.permission['app_delete'].disabled || $storeHelper.serverIsPublishing? 'disabled' : 'danger'"
                    :loading="statusOfWaitingResponse('app_delete') && selected.row.appId == scope.row.appId"
                    @click="handleTRClick($event, 'app_delete', scope.$index, scope.row)">删除
                </el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="status.showPagination">
        <div class="pagination">
          <el-pagination
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="totalSize"
                  :current-page.sync="query.currentPage"
                  :page-size.sync = "query.pageSize"
                  :page-sizes="[10, 15, 20, 30]"
          >
            <!--@current-change="page => {currentPage = page}"-->
          </el-pagination>
        </div>
      </div>
    </div>
    <div class="create-an-app" v-if="!showAppList">
      <img src="/assets/imgs/profile/create-an-app.png">
      <div class="desc">应用引擎为您快速构建应用，一键部署，持续集成、交付，加快应用迭代效率，实现DevOps运维理念的微服务应用框架，快来试试吧!</div>
      <el-button
              type="primary"
              :type="$storeHelper.permission['app_create'].disabled ? 'plain': 'primary'"
              @click="handleButtonClick($event, 'app_create')">
        创建应用
      </el-button>
    </div>
    <paas-popover-message ref="popover-profile-list" popperClass="el-popover--small is-dark"
                          placement="top">
      <div slot="content">
        <div v-for="(item, index) in $storeHelper.profileListOfGroup" :key="index"
             @click="handleProfileClick($event, item)"
             @mouseenter="handleMouseEnter('profile-item', $event)"
             @mouseleave="handleMouseLeave('profile-item', $event)"
             style="font-size: 14px; line-height: 18px; cursor: pointer; font-weight: 400"
             :class="[item.name ? `g-env-${item.name}-color` : '']">
          <div style="display: inline-block; min-width: 90px; text-align: right; margin-right: 5px;"
          >{{item.description}}</div>
          <i class="paas-icon-level-up"></i>
        </div>
      </div>
    </paas-popover-message>

    <el-dialog title="更改应用名称" :visible="selected.prop == 'appName'"
               @close="selected.prop = null; waitingResponse=false"
               v-if="selected.app && selected.model"
               :close-on-click-modal="false"
    >
      <el-form :model="newProps" :rules="rules" labelWidth="120px" size="mini" ref="changeAppNameForm">
        <el-form-item label="当前应用名称：">
          {{selected.app.appName}}
        </el-form-item>
        <el-form-item label="更改为：" prop="appName">
          <el-input v-model="newProps.appName" placeholder="中文，英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButton('appName')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="更改运行环境" :visible="selected.prop == 'profileNames'"
               @close="selected.prop = null; waitingResponse=false"
               class="change-profile"
               :close-on-click-modal="false"
               v-if="selected.app && selected.model"
    >
      <el-tag type="danger" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>删除运行环境将会销毁该环境的代码和配置信息，解绑所有公网域名、IP白名单，且不可恢复。</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="120px" size="mini" ref="changeProfileNamesForm">
        <el-form-item label="当前运行环境：">
          <el-tag v-for="item in selected.app.profileList" size="mini" :key="item.name" style="display: inline-block">
            {{item.description}}
          </el-tag>
        </el-form-item>
        <el-form-item label="更改为：" prop="profileNames" :error="profileChangeStatus.productionProfileTip">
          <el-checkbox-group v-model="newProps.profileNames" @change="handleCheckboxChangeForProfileNames">
            <el-checkbox v-for="item in $storeHelper.profileListOfGroup" :label="item.name" :key="item.name"
                         :disabled="item.spaceType == 'PRODUCTION' && $storeHelper.groupRelatedInfo.onlyOneProductionProfile">
              {{item.description}}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="操作：">
          <div v-if="profileChangeStatus.toDelete.length > 0">
            <span>将删除运行环境</span>
            <el-tag size="mini" type="danger" disable-transitions
                    v-for="item in profileChangeStatus.toDelete" :key="item.id"
                    style="display: inline-block;">{{item.description}}</el-tag>
          </div>
          <div v-if="profileChangeStatus.toAdd.length > 0">
            <span>将增加运行环境</span>
            <el-tag size="mini" type="warning" disable-transitions
                    v-for="item in profileChangeStatus.toAdd" :key="item.id"
                    style="display: inline-block;">{{item.description}}</el-tag>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-popover
                    width="200"
                    v-model="profileChangeStatus.openPopover"
                    placement="right"
                    trigger="manual"
                    popperClass="el-popover--small">
              <p style="color: #fa5555">{{profileChangeStatus.popperContent}}</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="handlePopoverButton('cancel-update-profile-name')">取消</el-button>
                <el-button type="danger" size="mini"
                           @click="handlePopoverButton('update-profile-name')">确定</el-button>
              </div>
              <el-button type="primary"
                         slot="reference"
                         @click="handleDialogButton('profileNames')"
                         :loading="waitingResponse">保&nbsp存</el-button>
            </el-popover>
          </div>
          <div class="item">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null; profileChangeStatus.openPopover = false">取&nbsp消</el-button>
          </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  #app-main {
    .el-dialog__wrapper {
      &.change-profile {
        .el-tag {
          text-align: left;
          height: 20px;
          line-height: 20px;
          box-sizing: content-box;
          display: block;
          padding: 0px 3px;
        }
        .el-form {
          margin-top: 10px;
          .el-tag {
            margin-right: 3px;
          }
          .el-form-item {
            margin-bottom: 10px;
          }
        }
      }
    }
    .app-list {
      .el-table {
        td {
          .cell {
            padding: 5px 2px;
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #app-main {
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 1300px;
    background: white;
    & > .header {
      padding: 3px 5px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .item {
        display: inline-block;
        &.app-filter {
          flex: 1;
          text-align: right;
        }
      }
    }
    .app-list {
      flex: 1;
      position: relative;
      padding: 0px 0px;
      .el-table {
        width: auto;
        th {
          padding: 2px 0px;
        }
        td {
          padding: 3px 0px;
        }
        margin-bottom: 0px;
        color: black;
        .el-table__row {
          .el-button {
          }
          .paas-icon-svg {
            width: 26px;
            height: 26px;
            &.paas-icon-java {
              width: 30px;
              height: 30px;
            }
          }
          .version {
            line-height: 16px;
          }
          .profile-item {
            position: relative;
            display: inline-block;
            margin: 0px 6px;
            color: #909399;
            line-height: 18px;
            &.active {
              cursor: pointer;
              color: blue;
              &:hover {
                color: blue;
                border-color: blue;
                font-weight: bold;
              }
            }
          }
          .el-icon-edit {
            color: #eb9e05;
            &:hover {
              font-weight: bold;
            }
          }
        }
        .el-table__expanded-cel {
          color: rgb(90, 94, 120);
        }
        .el-form {
          .el-checkbox + .el-checkbox {
            margin-left: 20px;
          }
          .el-form-item {
            margin-bottom: 6px;
          }
        }
        .demo-table-expand {
          font-size: 12px;
          .el-form-item__label {
            vertical-align: middle;
          }
        }
      }
    }
  }
  .create-an-app {
    max-width: 80%;
    margin: 0px auto;
    padding-top: 20px;
    img {
      display: block;
      margin: 0px auto;
    }
    .desc {
      margin: 10px auto;
      text-align: center;
    }
    .el-button {
      display: block;
      margin: 0px auto;
    }
  }
</style>
<script>
  import {mapGetters} from 'vuex';
  import AppPropUtils from '../utils/app-props';
  import commonUtils from 'assets/components/mixins/common-utils';
  import paasPopoverMessage from 'assets/components/popover-message';
  export default {
    mixins: [commonUtils],
    components: {paasPopoverMessage},
    created() {
      // 按需更新应用列表
      if (this.$net.needUpdateAppList) {
        this.requestAppList();
        this.$net.needUpdateAppList = false;
      }
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer.from;
        switch (from) {
          case this.$net.page['profile/service']:
          case this.$net.page['profile/pipeline/list']:
            this.filterKey = dataTransfer.data.appName;
            break;
        }
        this.$storeHelper.dataTransfer = null;
      }
    },
    mounted() {
      if (this.appInfoListOfGroup) {
        this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      }
      // update value in next tick
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
      this.popoverProfileList = this.$refs['popover-profile-list'];
    },
    beforeDestroy() {
      this.popoverProfileList.doClose();
      this.popoverProfileList.doDestroy();
    },
    data() {
      return {
        popoverProfileList: null,
        resizeListener: () => {},
        heightOfTable: '',

        showAppList: true,
        totalSize: 0,
        query: {
          pageSize: 10,
          currentPage: 1,
        },
        // save status of page
        status: {
          showPagination: true
        },

        appList: [],
        appListByPage: [],
        appModelList: [],
        appModelListByPage: [],
        rules: AppPropUtils.rules,

        selected: {
          prop: null,
          row: null,
          app: null,
          model: null,
        },
        newProps: {
          appName: '',
          profileNames: [],
        },
        waitingResponse: false,
        // used for dialog
        profileChangeStatus: {
          toAdd: [],
          toDelete: [],
          openPopper: false,
          popperContent: '',
          productionProfileTip: ''
        },

        filterMyApp: false,
        filterKey: '',
        myAppCount: 0,
      }
    },
    computed: {
      ...mapGetters('user', {
        'appInfoListOfGroup': 'appInfoListOfGroup',
      }),
    },
    watch: {
      '$storeHelper.currentGroupId'() {
        this.updateListByPage();
      },
      '$storeHelper.screen.size': 'onScreenSizeChange',
      'status.showPagination': 'onScreenSizeChange',
      'appInfoListOfGroup': 'onAppInfoListOfGroup',
      'filterMyApp': function () {
        this.query.currentPage = 1;
        this.updateListByPage();
      },
      'filterKey': function () {
        this.query.currentPage = 1;
        this.updateListByPage();
      },
      'query.currentPage'() {
        this.updateListByPage();
      },
      'query.pageSize'() {
        this.query.currentPage = 1;
        this.updateListByPage();
      }
    },
    methods: {
      onScreenSizeChange(size) {
//        console.log(this.$storeHelper.screen);
        if (!size) {
          return;
        }
        try {
          // if this.showAppList == false, headerNode will not exist
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - (this.status.showPagination ? 26 : 0);
        } catch(err) {
        }
      },

      onAppInfoListOfGroup(appInfoList, oldValue) {
        // go to first page
        this.query.currentPage = 1;
        this.updateListByPage();
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
          case 'app_create':
            this.$router.push(this.$net.page['profile/app/add']);
            break;
          case 'refreshAppList':
            this.requestAppList();
            break;
        }
      },
      async requestAppList() {
        const appInfoListOfGroup = await this.$net.requestAppInfoListOfGroup(this.$storeHelper.currentGroupID);
        this.$store.dispatch('user/appInfoList', appInfoListOfGroup);
      },

      /**
       * 属性修改的数据分为三层：allData - model - newProps
       * model: data of form
       * allData: 包含展示用的数据和model
       * newProps: 临时数据model，用于弹出的dialog
       *
       * model只包含模型，在dialog弹出是将其值赋值给newProps；
       * 弹出dialog中的数据模型使用newProps，展示使用service；
       * 存储的时候，对比newProps和model的数据，如果发生改变用newProps更新model和service的数据，更新service的数据时需要使用app-props；
       */
      /**
       * handle click event in the operation-column
       */
      async handleTRClick(evt, action, index, row) {
        if (['app_update', 'app_delete'].includes(action)) {
          if (this.$storeHelper.actionDisabled(action)) {
            this.$storeHelper.globalPopover.show({
              ref: evt.target,
              msg: this.$storeHelper.reason4ActionDisabled(action)
            });
            return;
          }
        }
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        const appInfo = this.$storeHelper.getAppInfoByID(row.appId);
        if (!appInfo) {
          return;
        } else {
          this.selected.row = row;
          this.selected.app = appInfo.app;
          this.selected.model = appInfo.model;
        }
        var prop = null, formName = null;
        switch (action) {
          case 'app_update':
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/app'],
              data: this.selected.model
            };

            this.$router.push(this.$net.page['profile/app/update']);
            break;
          case 'app_delete':
            this.addToWaitingResponseQueue(action);
            try {
              await this.$confirm(`删除应用"${row.appName}"，将会销毁该应用下所有环境的代码和配置信息，解绑所有公网域名，删除IP白名单、删除关联的Pipeline，且删除后应用数据不可恢复！继续吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              });
              // await this.warningConfirm(`您确认要删除应用"${row.appName}"，并清除该应用的一切数据？`);
              await this.$net.requestPaasServer(this.$net.URL_LIST.app_delete, {
                payload: {
                  groupId: this.$storeHelper.currentGroupID,
                  id: row.appId
                }
              });
              this.hideWaitingResponse(action);
              this.$storeHelper.deleteAppInfoByID(row.appId);
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
            } catch(err) {
              this.hideWaitingResponse(action);
            } finally {
              this.updateListByPage();
            }
            break;
          case 'app_show_profile':
            var target = evt.target;
            while (!target.classList.contains('el-button')) {
              target = target.parentNode;
            }
            this.popoverProfileList.show({
              ref: target,
              type: 'node'
            });
            break;
//          case 'app_change_name':
//            prop = 'appName';
//            this.selected.prop = prop;
//            this.newProps[prop] = JSON.parse(JSON.stringify(this.selected.model[prop]));
//            formName = 'change' + prop.replace(/^[a-z]/g, (L) => L.toUpperCase()) + 'Form';
//            this.$refs.hasOwnProperty(formName) && this.$refs[formName].validate();
            break;
        }
      },

      handleProfileClick(evt, item) {
        if (this.$storeHelper.permission['page_service']) {
          this.$message.warning('您没有权限进入服务管理页面');
          return;
        }
        const appId = this.selected.model.appId;
        const appName = this.selected.model.appName;
        const profileId = item['id'];
        this.$storeHelper.dataTransfer = {
          from: this.$net.page['profile/app'],
          data: {
            appName,
            profileId
          }
        };
        this.$router.push(this.$net.page['profile/service']);
      },
      handleMouseEnter(action, evt) {
        if (action === 'profile-item') {
          evt.target.style.fontWeight='800';
        }
      },
      handleMouseLeave(action, evt) {
        if (action === 'profile-item') {
          evt.target.style.fontWeight='400';
        }
      },

      // handle checkbox change in dialog
      handleCheckboxChangeForProfileNames(values) {
//        console.log(this.newProps.profileNames);
//        console.log(this.profileListOfGroup);
        let origin = this.selected.model.profileNames;
        let current = values;
        let toDelete = origin.filter(it => current.indexOf(it) === -1);
        let toAdd = current.filter(it => origin.indexOf(it) === -1);
        this.profileChangeStatus.toAdd = this.$storeHelper.getProfileInfoListByNameList(toAdd);
        this.profileChangeStatus.toDelete = this.$storeHelper.getProfileInfoListByNameList(toDelete);
        let productionTip = this.invalidProductionProfileTip();
        if (productionTip) {
          this.profileChangeStatus.productionProfileTip = productionTip;
        } else {
          this.profileChangeStatus.productionProfileTip = '';
        }
      },

      // 有且只能有一个生产环境
      invalidProductionProfileTip() {
        let messageTip = null;
        let profileInfoList = this.newProps.profileNames.map(it => {
          return this.$storeHelper.getProfileInfoByName(it);
        });
        let productionProfileCount = 0;
        profileInfoList.forEach(it => {
          if (it && it.hasOwnProperty('spaceType') && it['spaceType'] === 'PRODUCTION') {
            productionProfileCount += 1;
          }
        });
        if (productionProfileCount === 0) {
          messageTip = '必须选择一个生产环境';
        } else if (productionProfileCount > 1) {
          messageTip = '只能选择一个生产环境';
        }
        return messageTip;
      },

      /**
       * three steps for changing props request
       * 1. check if data is change in function handleDialogButton.
       * 2. request server for update in function requestServerForUpdate
       * 3. update local data if server response is success, in function updateModelInfo
       * @param prop
       */
      handleDialogButton(prop) {
        let formName = 'change' + prop.replace(/^[a-z]/g, (L) => L.toUpperCase()) + 'Form';
        switch (prop) {
          case 'appName':
            this.$refs[formName].validate((valid) => {
              if (!valid) {
                return;
              }
              if (!this.newProps.hasOwnProperty(prop) || !this.selected.model.hasOwnProperty(prop)) {
                return;
              }
              if (this.$utils.theSame(this.newProps[prop], this.selected.model[prop])) {
                this.selected.prop = null;
                this.$message({
                  type: 'warning',
                  message: '您没有做修改'
                });
              } else {
                this.requestServerForUpdate(prop);
              }
            });
            break;
          case 'profileNames':
            let productionTip = this.invalidProductionProfileTip();
            if (productionTip) {
              this.profileChangeStatus.productionProfileTip = productionTip;
              return;
            } else {
              this.profileChangeStatus.productionProfileTip = '';
            }
            this.$refs[formName].validate((valid) => {
              if (!valid) {
                return;
              }
              if (!this.newProps.hasOwnProperty(prop) || !this.selected.model.hasOwnProperty(prop)) {
                return;
              }
              if (this.$utils.theSame(this.newProps[prop], this.selected.model[prop])) {
                this.selected.prop = null;
                this.$message({
                  type: 'warning',
                  message: '您没有做修改'
                });
              } else {
                if (this.profileChangeStatus.toDelete.length > 0) {
                  let msg = '将要删除运行环境：' + this.profileChangeStatus.toDelete.map(it => {return it.description}).join(',');
                  msg += '。将销毁该环境的代码和配置信息，解绑所有公网域名、IP白名单，且不可恢复。确定继续吗？';
                  // open popper
                  this.profileChangeStatus.popperContent = msg;
                  this.profileChangeStatus.openPopover = true;
                } else {
                  this.requestServerForUpdate(prop);
                }
              }
            });
            break;
        }
      },

      // handle button action in popper dialog
      handlePopoverButton(action, tag) {
        switch (action) {
          case 'update-profile-name':
            this.requestServerForUpdate('profileNames');
            this.profileChangeStatus.openPopover = false;
            break;
          case 'cancel-update-profile-name':
            this.profileChangeStatus.openPopover = false;
            break;
        }
      },
      /**
       * request server for update
       */
      requestServerForUpdate(prop) {
        this.waitingResponse = true;
        let options = {
          id: this.selected.app['appId']
        };
        switch (prop) {
          case 'appName':
            options['appName'] = this.newProps['appName'];
            break;
          case 'profileNames':
            options['spaceList'] = this.newProps['profileNames'];
            break;
        }

        if (Object.keys(options).length > 1) {
          this.$net.appUpdate(prop, options).then(msg => {
            this.waitingResponse = false;
            this.selected.prop = null;
            this.$message({
              type: 'success',
              message: msg
            });
            this.updateModelInfo(prop);
          }).catch(err => {
            this.waitingResponse = false;
            this.selected.prop = null;
            if (err.title && err.msg) {
              this.$notify.error({
                title: err.title,
                message: err.msg,
                duration: 0,
                onClose: function () {
                }
              });
            }
          })
        }
      },
      /**
       * update local data after server update success
       */
      updateModelInfo(prop) {
        let newProp = this.newProps[prop];
        switch (prop) {
          case 'profileNames':
            this.selected.model[prop] = newProp;
            this.selected.app.profileList = this.$storeHelper.profileListOfGroup.filter(it => {
              return newProp.indexOf(it.name) >= 0;
            });
            this.selected.app.profileNames = this.selected.app.profileList.map(it => {
              return it.name;
            });
            this.selected.app.profileListAll.forEach(it => {
              it['active'] = newProp.indexOf(it['name']) > -1;
            });
            break;
          case 'appName':
            this.selected.model[prop] = newProp;
            this.selected.app[prop] = newProp;
            break;
        }
      },

      /**
       * the place of request appList:
       * 1. at beginning of this page
       * 2. at the change of page in Pagination
       * 3. at the change of groupID
       * 4. at the change of appInfoListOfGroup
       * 5. operation of app: delete app. [change profile]
       * 6. at the change of filterMyApp or filterKey
       * @param appName
       */
      updateListByPage() {
        this.showAppList = true;
        if (!this.appInfoListOfGroup) {
          return;
        }
        // whether show page appList or createApp
        if (this.appInfoListOfGroup.appModelList && this.appInfoListOfGroup.appModelList.length === 0) {
          this.showAppList = false;
        }

        const userName = this.$storeHelper.getUserInfo('userName');
        var regFilter = null;
        if (this.filterKey) {
          regFilter = this.$utils.getRegFromStr(this.filterKey);
        }
        const filtered = {
          appList: [],
          appModelList: [],
          total: 0
        };
        filtered.appModelList = this.appInfoListOfGroup.appModelList
          .filter(it => !this.filterMyApp ||  it.userName == 'userName')
          .filter(it => !regFilter || regFilter.test(it.appName));
        filtered.appList = this.appInfoListOfGroup.appList
          .filter(it => !this.filterMyApp ||  it.userName == 'userName')
          .filter(it => !regFilter || regFilter.test(it.appName));
        filtered.total = filtered.appModelList.length;
        this.myAppCount = 0;
        filtered.appModelList.forEach(it => {
          if (it.userName = userName) {
            this.myAppCount++;
          }
        });

        if (!this.$utils.isNumber(parseInt(this.query.currentPage))) {
          this.query.currentPage = 1;
          return;
        }
        const maxPageSize = Math.ceil(filtered.total / this.query.pageSize);
        if (maxPageSize >= 1 && this.query.currentPage > maxPageSize) {
          this.query.currentPage = maxPageSize;
        }
        var page = this.query.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.query.pageSize;
        const length = this.query.pageSize;
        const end = start + length;

        this.appListByPage = filtered.appList.slice(start, end);
        this.appModelListByPage = filtered.appModelList.slice(start, end);
        this.totalSize = filtered.total;

        this.status.showPagination = this.showAppList && this.totalSize > 10;
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