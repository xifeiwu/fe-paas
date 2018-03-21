<template>
  <div id="app-main">
    <div class="header">
      <el-row type="flex" justify="center" align="middle">
        <el-col :span="10">
          <el-button
                  size="mini-extral"
                  type="primary"
                  @click="handleButtonClick('linker', {path: '/profile/app/add'})">
            创建应用
          </el-button>
          <el-button v-if="true"
                     size="mini-extral"
                     type="primary"
                     @click="handleButtonClick('refreshAppList')">刷新</el-button>
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
                  style="max-width: 200px"
                  placeholder="按名称搜索应用"
                  suffix-icon="el-icon-search"
                  v-model="filterKey">
          </el-input>
        </el-col>
      </el-row>
    </div>
    <div class="app-list">
      <el-table :data="appListByPage"
                v-loading="showLoading"
                stripe
                element-loading-text="加载中">
        <el-table-column label="语言版本" prop="languageVersion" headerAlign="center" align="center" width="100">
          <template slot-scope="scope">
            <svg :class="['my-icon-svg', 'my-icon-' + scope.row.languageLogo]" aria-hidden="true" v-if="scope.row.languageLogo">
              <use :xlink:href="'#my-icon-' + scope.row.languageLogo"></use>
            </svg>
            <div class="language" v-else>应用名未知</div>
            <div class="version" v-if="scope.row.languageVersion">{{scope.row.languageVersion}}</div>
            <div v-else>版本未知</div>
          </template>
        </el-table-column>
        <el-table-column label="应用名称" prop="serviceName" headerAlign="center" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.appName}}</span>
            <i class="el-icon-edit" @click="handleTRButton('change-appName', scope.$index, scope.row)"></i>
          </template>
        </el-table-column>
        <el-table-column label="创建者" prop="creator" headerAlign="center" align="center" width="140">
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" headerAlign="center" align="center" width="180">
        </el-table-column>
        <el-table-column label="运行环境" prop="profileList" minWidth="90" headerAlign="center" align="center">
          <template slot-scope="scope">
              <span v-for="item in profileListOfGroup" :label="item.name" :key="item.name"
                    :class="{'profile-item': true, 'active': scope.row.profileNames.indexOf(item.name) > -1}"
                    @click="jumpToServicePage(scope.$index, scope.row, item, scope.row.profileNames.indexOf(item.name) > -1)"
              >{{ item.description }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operation" minWidth="170" width="200" headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini-extral"
              type="danger"
              @click="handleTRButton('deleteRow', scope.$index, scope.row)">删除</el-button>
            <el-button
              size="mini-extral"
              type="warning"
              @click="handleTRButton('change-profileNames', scope.$index, scope.row)">更改运行环境</el-button>
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

    <el-dialog title="更改应用名称" :visible="selected.prop == 'appName'"
               @close="selected.prop = null; waitingResponse=false"
               v-if="selected.app && selected.model"
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
        <el-form-item label="更改为：" prop="profileNames">
          <el-checkbox-group v-model="newProps.profileNames" @change="handleCheckboxChangeForProfileNames">
            <el-checkbox v-for="item in profileListOfGroup" :label="item.name" :key="item.name">
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
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButton('profileNames')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  #app-main {
    .app-list {
      .el-table {
        th {
          padding: 2px 0px;
        }
        td {
          padding: 3px 0px;
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #app-main {
    .header {
      margin: 1px 5px;
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
      padding: 0px 0px;
      .el-table {
        margin-bottom: 0px;
        color: black;
        .el-table__row {
          .my-icon-svg {
            width: 26px;
            height: 26px;
            &.my-icon-java {
              width: 30px;
              height: 30px;
            }
          }
          .version {
            line-height: 16px;
          }
          .profile-item {
            display: inline-block;
            margin: 0px 5px;
            color: #909399;
            line-height: 18px;
            &.active {
              cursor: pointer;
              color: blue;
              /*border-bottom: 1px solid gray;*/
              &:hover {
                color: blue;
                border-color: blue;
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

  .el-form-item__label {
    text-align: right;
  }
  .el-tag {
    display: block;
  }
</style>
<script>
  import AppPropUtils from '../utils/app-props';
  export default {
    created() {
//      let appInfoListOfGroup = this.appInfoListOfGroup;
//      if (appInfoListOfGroup.hasOwnProperty('appList')) {
//        this.appList = appInfoListOfGroup.appList;
//      }
//      this.appListByPage = this.appList;
//      if (appInfoListOfGroup.hasOwnProperty('appModelList')) {
//        this.appModelList = appInfoListOfGroup.appModelList;
//      }
//      if (appInfoListOfGroup.hasOwnProperty('total')) {
//        this.totalSize = appInfoListOfGroup.total;
//      }
//      console.log(this.totalSize);
    },
    mounted() {
      if (!this.appInfoListOfGroup) {
        this.$store.dispatch('user/appInfoListOfGroup', {
          from: 'page/app',
          groupID: this.$storeHelper.currentGroupID
        });
      } else {
        this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      }
    },
    data() {
      return {
        showLoading: false,
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
          toDelete: []
        },

        filterMyApp: false,
        filterKey: '',
        myAppCount: 0,
      }
    },
    computed: {
      tableHeight() {
        return document.body.clientHeight - 45 - 30 * 3 - 6;
      },
      needFilter() {
        return this.filterMyApp || (this.filterKey.length > 0);
      },
      appInfoListOfGroup() {
        return this.$storeHelper.appInfoListOfGroup();
      },
      profileListOfGroup() {
        return this.$storeHelper.profileListOfGroup();
      }
    },
    watch: {
      '$storeHelper.currentGroupID': function (value, oldValue) {
        this.requestAPPList({});
      },
      'appInfoListOfGroup': 'onAppInfoListOfGroup',
      'filterMyApp': 'requestAPPList',
      'filterKey': 'requestAPPList'
    },
    methods: {
      onAppInfoListOfGroup(value, oldValue) {
        // go to first page
        this.currentPage = 1;
        this.getFromStore && this.requestAPPList({});

        // get the count of app of current user
        let count = 0;
        let myUserName = this.$storeHelper.getUserInfo('userName');
        if (value && value.hasOwnProperty('appList') && Array.isArray(value.appList)) {
          value.appList.forEach(it => {
            if (it.userName == myUserName) {
              count += 1;
            }
          });
          this.myAppCount = count;
        }
      },
      handleButtonClick(action, params) {
        switch (action) {
          case 'linker':
            this.$router.push(params.path);
            break;
          case 'refreshAppList':
            this.showLoading = true;
            this.$store.dispatch('user/appInfoListOfGroup', {
              from: 'page/app',
              groupID: this.$storeHelper.currentGroupID
            });
//            this.$nextTick(() => {
//              this.showLoading = false;
//            });
            setTimeout(() => {
              this.showLoading = false;
            }, 300);
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
      handleTRButton(action, index, row) {
        let appInfo = this.$storeHelper.getAppInfoByID(row.appId);
        if (!appInfo) {
          return;
        } else {
          this.selected.app = appInfo.app;
          this.selected.model = appInfo.model;
        }
        switch (action) {
          case 'deleteRow':
            this.warningConfirm(`删除应用"${row.serviceName}"将会销毁所有环境的代码和配置信息，
            解绑所有公网域名、IP白名单，删除后应用数据不可恢复！`).then(() => {
              this.warningConfirm(`您确认要删除应用"${row.serviceName}"，并清除该应用的一切数据？`).then(() => {
                this.$net.deleteAPP({
                  groupId: this.$storeHelper.currentGroupID,
                  id: row.appId
                }).then(res => {
//                this.appListByPage.splice(index, 1);
                  this.$storeHelper.deleteAppInfoByID(row.appId);
                  this.$message({
                    type: 'success',
                    message: '删除成功!'
                  });
                  this.requestAPPList({});
                }).catch((err) => {
                  this.$notify.error({
                    title: '删除应用失败！',
                    message: err,
                    duration: 0,
                    onClose: function () {
                    }
                  });
                });
              }).catch(() => {
//              this.$message({
//                type: 'info',
//                message: '您已取消删除'
//              });
              });
            }).catch(()=> {
            });
            break;
          case 'change-profileNames':
            this.profileChangeStatus.toAdd = [];
            this.profileChangeStatus.toDelete = [];
          case 'change-appName':
            let prop = action.split('-')[1];
            this.selected.prop = prop;
            this.newProps[prop] = JSON.parse(JSON.stringify(this.selected.model[prop]));
            let formName = 'change' + prop.replace(/^[a-z]/g, (L) => L.toUpperCase()) + 'Form';
            this.$refs.hasOwnProperty(formName) && this.$refs[formName].validate();
            break;
        }
      },

      // handle checkbox change in dialog
      handleCheckboxChangeForProfileNames(values) {
        let origin = this.selected.model.profileNames;
        let current = values;
        let toDelete = origin.filter(it => current.indexOf(it) === -1);
        let toAdd = current.filter(it => origin.indexOf(it) === -1);
        this.profileChangeStatus.toAdd = this.$storeHelper.getProfileInfoListByNameList(toAdd);
        this.profileChangeStatus.toDelete = this.$storeHelper.getProfileInfoListByNameList(toDelete);
      },
      /**
       * do some action of ok button in popup-dialog
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
                this.requestUpdate(prop);
              }
            });
            break;
          case 'profileNames':
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
                  msg += '。将销毁该环境的代码和配置信息，解绑所有公网域名、IP白名单，且不可恢复。确定继续吗？'
                  this.warningConfirm(msg).then(() => {
                    this.requestUpdate(prop);
                  })
                } else {
                  this.requestUpdate(prop);
                }
              }
            });
            break;
        }
      },
      requestUpdate(prop) {
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

        // simulate post
//        setTimeout(() => {
//          this.waitingResponse = false;
//          this.selected.prop = null;
//          this.updateModelInfo(prop);
//        }, 1000);
//        return;
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
            this.$notify.error({
              title: '修改运行环境失败！',
              message: err,
              duration: 0,
              onClose: function () {
              }
            });
          })
        }
      },
      /**
       * update value of service and model when server feedback is ok
       */
      updateModelInfo(prop) {
        let newProp = this.newProps[prop];
        switch (prop) {
          case 'profileNames':
            this.selected.model[prop] = newProp;
            this.selected.app.profileList = this.profileListOfGroup
              .filter(it => {
                return newProp.indexOf(it.name) >= 0;
              });
            this.selected.app.profileNames = this.selected.app.profileList.map(it => {
              return it.name;
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
        let myUserName = this.$getUserInfo('userName');
        let filterReg = null;
        if (this.filterKey) {
          filterReg = new RegExp(this.filterKey);
        }
//        console.log(this.filterMyApp);
//        console.log(this.filterKey);
        let checkItem = function (item) {
          let isOK = true;
          if (!item.hasOwnProperty('userName') || !item.hasOwnProperty('serviceName')) {
            isOK = false;
          }
          if (isOK && this.filterMyApp) {
            if (item.userName !== myUserName) {
              isOK = false;
            }
          }
          if (isOK && filterReg) {
            if (!filterReg.exec(item.serviceName)) {
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
       * @param serviceName
       */
      requestAPPList({serviceName}) {
        if (!serviceName) {
          serviceName = '';
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
          let filteredAppInfo = {
            'appList': theAppInfoList.appList.slice(start, end),
            'appModelListByPage': theAppInfoList.appModelList.slice(start, end),
            'total': theAppInfoList.total
          };
          this.updateAppInfoModel(filteredAppInfo);
        } else {
          this.$net.getAPPList({
            groupId: this.$storeHelper.currentGroupID,
            start: start,
            length: length,
            serviceName: serviceName
          }).then(content => {
            this.updateAppInfoModel(content);
          }).catch(err => {
            this.showPagination = false;
          });
        }
      },
      /**
       * assign value of appListByPage, appModelListByPage, totalSize from appInfoList
       * @param appInfoList
       * @param slice, whether appList and appModelList should be sliced
       */
      updateAppInfoModel(appInfoList) {
        this.appListByPage = [];
        this.appModelListByPage = [];
        this.totalSize = 0;
        if (!appInfoList) {
          return;
        }
        if (appInfoList.hasOwnProperty('appList')) {
          this.appListByPage = appInfoList.appList;
        }
        if (appInfoList.hasOwnProperty('appModelList')) {
          this.appModelListByPage = appInfoList.appModelList;
        }
        if (appInfoList.hasOwnProperty('total')) {
          this.totalSize = appInfoList.total;
          if (this.totalSize > 0) {
            this.showPagination = true;
          }
        }
      },
      jumpToServicePage(index, row, profile, active) {
        if (!active) {
          return;
        }
        let appID = row.appId;
        let profileID = profile.id;
        this.$setUserConfig('profile/service/appID', appID);
        this.$setUserConfig('profile/service/profileID', profileID);
        this.$router.push('service');
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

      // the first page of pagination is 1
      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestAPPList({});
      },
    }
  }
</script>