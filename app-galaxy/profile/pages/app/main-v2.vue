<template>
  <div id="app-main">
    <div class="header" v-if="showAppList">
      <el-row type="flex" justify="center" align="middle">
        <el-col :span="10">
          <el-button
                  size="mini-extral"
                  :type="'primary'"
                  :class="{'disabled': $storeHelper.permission['app_create'].disabled}"
                  @click="handleButtonClick($event, 'app_create')">
            创建应用
          </el-button>
          <el-button v-if="true"
                     size="mini-extral"
                     type="primary"
                     @click="handleButtonClick($event, 'refreshAppList')"><i class="el-icon el-icon-refresh" style="margin-right: 3px;"></i>刷新</el-button>
        </el-col>
        <el-col :span="1">
          <span>&nbsp</span>
        </el-col>
        <el-col :span="13">
          <el-checkbox v-model="filterMyApp">
            <span>我的应用</span>
            <span>(共{{myAppCount}}个)</span>
          </el-checkbox>
          <el-input
                  size="mini"
                  style="max-width: 360px"
                  placeholder="按名称搜索应用"
                  suffix-icon="el-icon-search"
                  v-model="filterKey">
          </el-input>
        </el-col>
      </el-row>
    </div>
    <div class="app-list" v-if="showAppList">
      <el-table :data="appModelListByPage"
                stripe
                :height="heightOfTable">
        <el-table-column label="语言版本" prop="languageVersion" headerAlign="center" align="center" width="100">
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
            <i v-if="!$storeHelper.permission['app_change_name'].hide && false"
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
        <el-table-column label="创建者" prop="creator" headerAlign="center" align="center" width="100">
        </el-table-column>
        <el-table-column label="维护者" prop="maintainerList" headerAlign="center" align="center" width="120">
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
        <el-table-column label="创建时间" prop="createTime" headerAlign="center" align="center" width="160">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.createTime)">
              <div v-for="(item, index) in scope.row.createTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.createTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="应用说明" prop="description" headerAlign="center" align="center" width="60">
          <template slot-scope="scope">
            <div v-if="scope.row.description">
              <el-tooltip slot="trigger" effect="dark" placement="right">
                <div slot="content" style="width: 200px;">
                  <span>{{scope.row.description}}</span>
                </div>
                <span class="more">...</span>
              </el-tooltip>
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
                    :class="['flex', $storeHelper.permission['app_show_profile'].disabled ? 'disabled' : 'primary']"
                    @click="handleTRClick($event, 'app_show_profile', scope.$index, scope.row)">
                  <span>运行环境</span><i class="paas-icon-popover" style="margin-left: 3px;"></i>
                </el-button>
                <div class="ant-divider"></div>
                <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['app_change_props'].disabled ? 'disabled' : 'warning']"
                    @click="handleTRClick($event, 'app_change_props', scope.$index, scope.row)">
                  <span>修改应用</span><i class="paas-icon-level-up"></i>
                </el-button>
                <div class="ant-divider"></div>
                <el-button
                    type="text"
                    :class="$storeHelper.permission['app_delete'].disabled || publishStatus? 'disabled' : 'danger'"
                    :loading="statusOfWaitingResponse('app_delete') && selected.row.appId == scope.row.appId"
                    @click="handleTRClick($event, 'app_delete', scope.$index, scope.row)">删除
                </el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="showAppList && totalSize > pageSize">
        <div class="pagination">
          <el-pagination
                  :current-page="currentPage"
                  size="large"
                  layout="prev, pager, next"
                  :page-size = "pageSize"
                  :total="totalSize"
                  @current-change="page => {currentPage = page}"
          >
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
                <el-button type="danger" size="mini-extral"
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
    .header {
      padding: 3px 5px;
      font-size: 14px;
      .el-row {
        .el-col {
          &:nth-child(3) {
            text-align: right;
            .el-input {
              margin-left: 5px;
            }
          }
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
        this.$store.dispatch('user/appInfoList', {
          groupId: this.$storeHelper.currentGroupID,
        });
        this.$net.needUpdateAppList = false;
      }
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer.from;
        switch (from) {
          case this.$net.page['profile/service']:
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
        pageSize: 10,
        currentPage: 1,

        appList: [],
        appListByPage: [],
        appModelList: [],
        appModelListByPage: [],
        showPagination: false,
        rules: AppPropUtils.rules,

        getFromStore: true,
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
        'userConfig': 'config'
      }),
      needFilter() {
        return this.filterMyApp || (this.filterKey.length > 0);
      },
      publishStatus() {
        return this.$store.getters['publishStatus'];
      }
    },
    watch: {
      '$storeHelper.currentGroupID': function (value, oldValue) {
        this.requestAPPList({});
      },
      '$storeHelper.screen.size': 'onScreenSizeChange',
      'appInfoListOfGroup': 'onAppInfoListOfGroup',
      'filterMyApp': function () {
        this.currentPage = 1;
        this.requestAPPList({});
      },
      'filterKey': function () {
        this.currentPage = 1;
        this.requestAPPList({});
      },
      currentPage() {
        this.requestAPPList({});
      },
      pageSize() {
        this.requestAPPList({});
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
          this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
          this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 8;
        } catch(err) {
        }
      },

      // change value of showAppList
      onAppListChange() {
        // whether show page appList or createApp
        if (this.appInfoListOfGroup.appList && this.appInfoListOfGroup.appList.length === 0) {
          this.showAppList = false;
        } else {
          this.showAppList = true;
        }
      },

      onAppInfoListOfGroup(appInfoList, oldValue) {
        // go to first page
        this.currentPage = 1;
        this.getFromStore && this.requestAPPList({});

        // get the count of app of current user
        let count = 0;
        const myUserName = this.$storeHelper.getUserInfo('userName');
        appInfoList['appList'].forEach(it => {
          if (it.userName == myUserName) {
            count += 1;
          }
        });
        this.myAppCount = count;

        this.onAppListChange();
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
            this.$store.dispatch('user/appInfoList', {
              groupId: this.$storeHelper.currentGroupID,
            });
            break;
        }
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
        if (this.publishStatus && action == "app_delete") {
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
          case'app_change_props':
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/app'],
              data: this.selected.model
            };

            this.$router.push(this.$net.page['profile/app/update']);
            break;
          case 'app_delete':
            this.addToWaitingResponseQueue(action);
            try {
              await this.warningConfirm(`删除应用"${row.appName}"将会销毁所有环境的代码和配置信息，解绑所有公网域名、IP白名单，删除后应用数据不可恢复！`);
              await this.warningConfirm(`您确认要删除应用"${row.appName}"，并清除该应用的一切数据？`);
              await this.$net.requestPaasServer(this.$net.URL_LIST.app_delete, {
                payload: {
                  groupId: this.$storeHelper.currentGroupID,
                  id: row.appId
                }
              });
              this.hideWaitingResponse(action);
              this.$storeHelper.deleteAppInfoByID(row.appId);
              this.onAppListChange();
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
              this.requestAPPList({});
            } catch(err) {
              this.hideWaitingResponse(action);
            }
            this.onAppListChange();
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
       * filter appInfoList by myApp and Keys
       */
      filterAppInfoList() {
        let filteredAppInfo = {
          appList: [],
          appModelList: [],
          total: 0
        };
        let myUserName = this.$storeHelper.getUserInfo('userName');
        let filterReg = null;
        if (this.filterKey) {
          filterReg = new RegExp(this.filterKey);
        }
//        console.log(this.filterMyApp);
//        console.log(this.filterKey);
        let checkItem = function (item) {
          let isOK = true;
          if (!item.hasOwnProperty('userName') || !item.hasOwnProperty('appName')) {
            isOK = false;
          }
          if (isOK && this.filterMyApp) {
            if (item.userName !== myUserName) {
              isOK = false;
            }
          }
          if (isOK && filterReg) {
            if (!filterReg.exec(item.appName)) {
              isOK = false;
            }
          }
          return isOK;
        };
        this.appInfoListOfGroup.appList.forEach((it, index) => {
          if (checkItem.call(this, it)) {
            filteredAppInfo.appList.push(it);
            filteredAppInfo.appModelList.push(this.appInfoListOfGroup.appModelList[index]);
          }
        });
        filteredAppInfo.total = filteredAppInfo.appList.length;
        return filteredAppInfo;
      },

      /**
       * the place of request appList:
       * 1. at beginning of this page
       * 2. at the change of page in Pagination
       * 3. at the change of groupID
       * 4. at the change of appInfoListOfGroup, if this.getFromStore is true
       * 5. operation of app: delete app. [change profile]
       * 6. at the change of filterMyApp or filterKey
       * @param appName
       */
      requestAPPList({appName}) {
        if (!appName) {
          appName = '';
        }
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;
        if (this.getFromStore) {
          let end = start + length;
          let theAppInfoList = this.appInfoListOfGroup;
          if (this.needFilter) {
            theAppInfoList = this.filterAppInfoList();
          }
          if (!theAppInfoList) {
            return;
          }
          const filteredAppInfo = {
            'appList': theAppInfoList.appList.slice(start, end),
            'appModelList': theAppInfoList.appModelList.slice(start, end),
            'total': theAppInfoList.total
          };
          this.updateAppInfoModel(filteredAppInfo);
        } else {
        }
      },
      /**
       * assign value of appListByPage, appModelListByPage, totalSize from appInfoList
       * @param appInfoList
       * @param slice, whether appList and appModelList should be sliced
       */
      updateAppInfoModel(appInfoListByPage) {
        this.appListByPage = [];
        this.appModelListByPage = [];
        this.totalSize = 0;
        if (!appInfoListByPage) {
          return;
        }
        if (appInfoListByPage.hasOwnProperty('appList')) {
          this.appListByPage = appInfoListByPage.appList;
        }
        if (appInfoListByPage.hasOwnProperty('appModelList')) {
          this.appModelListByPage = appInfoListByPage.appModelList;
        }
        if (appInfoListByPage.hasOwnProperty('total')) {
          this.totalSize = appInfoListByPage.total;
          if (this.totalSize > 0) {
            this.showPagination = true;
          }
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