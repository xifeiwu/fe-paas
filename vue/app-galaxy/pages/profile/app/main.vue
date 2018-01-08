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
        <el-col :span="4">
          <span>&nbsp</span>
        </el-col>
        <el-col :span="10">
          <el-checkbox v-model="filterMyApp">我的应用</el-checkbox>
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
                element-loading-text="加载中">
        <el-table-column label="语言版本" prop="languageVersion" headerAlign="center">
          <template slot-scope="scope">
            <div>{{scope.row.language}} - {{scope.row.languageVersion}}</div>
          </template>
        </el-table-column>
        <el-table-column label="应用名称" prop="serviceName" headerAlign="center">
        </el-table-column>
        <el-table-column label="创建者" prop="creator" headerAlign="center">
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" headerAlign="center">
        </el-table-column>
        <el-table-column label="运行环境" prop="profileList" headerAlign="center" minWidth="90">
          <template slot-scope="scope">
            <div v-for="item in scope.row.profileList" :label="item.name" :key="item.name">
              <span class="profile-item" @click="jumpToServicePage(scope.$index, scope.row, item)"
              >{{ item.description }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operation" minWidth="170" width="200" headerAlign="center">
          <template slot-scope="scope">
            <el-button
              size="mini-extral"
              type="danger"
              @click="handleOperationClick('deleteRow', scope.$index, scope.row)">删除</el-button>
            <el-button
              size="mini-extral"
              type="warning"
              @click="handleOperationClick('change-profiles', scope.$index, scope.row)">更改运行环境</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination" v-if="showPagination">
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

    <el-dialog title="更改运行环境" :visible="selected.prop == 'profiles'"
               @close="selected.prop = null"
               v-if="selected.app && selected.model"
    >
      <el-form :model="newProps" :rules="rules" labelWidth="120px" ref="formInChangeProfileDialog">
        <el-form-item label="当前运行环境：">
          <el-tag v-for="item in selected.app.profileList" size="mini" :key="item.name" style="display: inline-block">
            {{item.description}}
          </el-tag>
        </el-form-item>
        <el-form-item label="更改为：" prop="profiles">
          <el-checkbox-group v-model="newProps.profiles">
            <el-checkbox v-for="item in profileListOfGroup" :label="item.name" :key="item.name">
              {{item.description}}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('profiles')"
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

<style lang="scss" scoped>
  #app-main {
    .header {
      margin: 5px;
      font-size: 14px;
      .el-row {
        margin: 0px 5px;
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
    .el-table {
      color: black;
      .el-table__row {
        .profile-item {
          cursor: pointer;
          display: inline-block;
          border-bottom: 1px solid gray;
          &:hover {
            color: blue;
            border-color: blue;
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

  .el-form-item__label {
    text-align: right;
  }
  .el-tag {
    display: block;
  }
  .pagination {
    margin-top: 15px;
    text-align: center;
    .el-pagination {
      display: inline-block;
    }
  }
</style>
<script>
  import AppPropUtils from '../utils/app_prop';
  import StoreHelper from '../utils/store-helper.vue';
  export default {
    mixins: [StoreHelper],
    created() {
      console.log('create app manager');
      this.onAppInfoListOfGroup(this.appInfoListOfGroup);
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
      console.log('mount app manager');
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
          profiles: [],
        },
        waitingResponse: false,

        filterMyApp: false,
        filterKey: '',
      }
    },
    watch: {
      currentGroupID: function (value, oldValue) {
        this.requestAPPList({});
      },
      'appInfoListOfGroup': 'onAppInfoListOfGroup',
      'filterMyApp': 'filterAppInfoList',
      'filterKey': 'filterAppInfoList'
    },
    methods: {
      onAppInfoListOfGroup(value, oldValue) {
        this.getFromStore && this.requestAPPList({});
      },
      handleButtonClick(action, params) {
        switch (action) {
          case 'linker':
            this.$router.push(params.path);
            break;
          case 'refreshAppList':
            this.showLoading = true;
            this.$store.dispatch('user/appInfoListOfGroup', {
              from: 'page/app/add',
              groupID: this.currentGroupID
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
       * filter appInfoList according to user action
       */
      filterAppInfoList(userName) {
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
        this.updateAppInfoModel(filteredAppInfo);
      },

      /**
       * 属性修改的数据分为三层：allData - model - newProps
       * model: data of form
       * allData: 包含展示用的数据和model
       * newProps: 临时数据model，用于弹出的dialog
       *
       * model只包含模型，在dialog弹出是将其值赋值给newProps；
       * 弹出dialog中的数据模型使用newProps，展示使用service；
       * 存储的时候，对比newProps和model的数据，如果发生改变用newProps更新model和service的数据，更新service的数据时需要使用app_prop；
       */
      /**
       * handle click event in the operation-column
       */
      handleOperationClick(action, index, row) {
        let appInfo = this.getAppInfoByID(row.appId);
        if (!appInfo) {
          return;
        } else {
          this.selected.app = appInfo.app;
          this.selected.model = appInfo.model;
        }
        switch (action) {
          case 'deleteRow':
            this.warningConfirm('您将删除应用' + row.serviceName + '，确定吗？').then(() => {
              this.$net.deleteAPP({
                groupId: this.currentGroupID,
                id: row.appId
              }).then(res => {
//                this.appListByPage.splice(index, 1);
                this.deleteAppInfoByID(row.appId);
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                });
                this.requestAPPList({});
              });
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '您已取消删除'
              });
            });
            break;
          case 'change-profiles':
            let prop = action.split('-')[1];
            this.selected.prop = prop;
            this.newProps[prop] = JSON.parse(JSON.stringify(this.selected.model[prop]))
            this.$refs.hasOwnProperty('formInChangeProfileDialog') &&
            this.$refs['formInChangeProfileDialog'].validate();
            break;
        }
      },

      /**
       * do some action of ok button in popup-dialog
       * @param prop
       */
      handleDialogButtonClick(action) {
        switch (action) {
          case 'profiles':
            this.$refs['formInChangeProfileDialog'].validate((valid) => {
              if (!valid) {
                return;
              }
              if (!this.newProps.hasOwnProperty(action) || !this.selected.model.hasOwnProperty(action)) {
                return;
              }
              if (this.$utils.theSame(this.newProps[action], this.selected.model[action])) {
                this.selected.prop = null;
                this.$message({
                  groupId: this.currentGroupID,
                  type: 'warning',
                  message: '您没有做修改'
                });
              } else {
                this.waitingResponse = true;
                this.$net.changeProfile({
                  id: this.selected.app['appId'],
                  spaceList: this.newProps['profiles']
                }).then(msg => {
                  this.waitingResponse = false;
                  this.selected.prop = null;
                  this.$message({
                    type: 'success',
                    message: msg
                  });
                  this.updateModelInfo(action);
//                  this.requestAPPList('');
                }).catch(err => {
                  this.waitingResponse = false;
                  this.selected.prop = null;
                  this.$notify.error({
                    title: '修改运行环境失败！',
                    message: err
                  });
                })
              }
            });
            break;
        }
      },
      /**
       * update value of service and model when server feedback is ok
       */
      updateModelInfo(prop) {
        let newProp = this.newProps[prop];
        switch (prop) {
          case 'profiles':
            this.selected.model[prop] = newProp;
            this.selected.app.profileList = this.profileListOfGroup
              .filter(it => {
                return newProp.indexOf(it.name) >= 0;
              });
            break;
        }
      },

      /**
       * the place of request appList:
       * 1. at beginning of this page
       * 2. at the change of page in Pagination
       * 3. at the change of groupID
       * 4. at the change of appInfoListOfGroup, if this.getFromStore is true
       * 5. operation of app: delete app. [change profile]
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
          let filteredAppInfo = {
            'appList': this.appInfoListOfGroup.appList.slice(start, end),
            'appModelListByPage': this.appInfoListOfGroup.appModelList.slice(start, end),
            'total': this.appInfoListOfGroup.total
          };
          this.updateAppInfoModel(filteredAppInfo);
        } else {
          this.$net.getAPPList({
            groupId: this.currentGroupID,
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
      jumpToServicePage(index, row, profile) {
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