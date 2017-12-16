<template>
  <div class="container">
    <el-row>
      <el-col :span="6">
        <el-button @click="handleButtonClick($event, {role:'linker', path: '/profile/add_app'})">创建应用</el-button>
      </el-col>
      <el-col :span="6">
        <el-button @click="handleButtonClick($event, {role:'cmd', action: 'refreshAppList'})">刷新</el-button>
      </el-col>
      <el-col :span="6"></el-col>
    </el-row>
    <el-table :data="appListByPage" style="width: 100%">
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
      <el-table-column label="操作" prop="operation" minWidth="170" headerAlign="center">
        <template slot-scope="scope">
          <el-button
            size="mini-extral"
            type="danger"
            @click="handleRowButtonClick('deleteRow', scope.$index, scope.row)">删除</el-button>
          <el-button
            size="mini-extral"
            type="warning"
            @click="handleRowButtonClick('change-profiles', scope.$index, scope.row)">更改运行环境</el-button>
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

<!--<style lang="scss">-->
  <!--.fix-form-item-label {-->
    <!--line-height: 25px;-->
  <!--}-->
  <!--.fix-form-item-content {-->
    <!--line-height: 100%;-->
  <!--}-->
<!--</style>-->
<style lang="scss" scoped>
  .container {
    margin: 40px;
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
  import app_rules from './add_app.rules';
  export default {
    created() {
      console.log('create app manager');
      this.requestAPPList('');
//      let appInfoOfGroup = this.appInfoOfGroup;
//      if (appInfoOfGroup.hasOwnProperty('appList')) {
//        this.appList = appInfoOfGroup.appList;
//      }
//      this.appListByPage = this.appList;
//      if (appInfoOfGroup.hasOwnProperty('appModelList')) {
//        this.appModelList = appInfoOfGroup.appModelList;
//      }
//      if (appInfoOfGroup.hasOwnProperty('total')) {
//        this.totalSize = appInfoOfGroup.total;
//      }
//      console.log(this.totalSize);
    },
    mounted() {
      console.log('mount app manager');
    },
    data() {
      return {
        totalSize: 0,
        pageSize: 2,
        currentPage: 1,
        appListByPage: [],
        appList: [],
        appModelList: [],
        appModelListByPage: [],
        showPagination: false,
        rules: app_rules,

        selected: {
          index: -1,
          prop: null,
          app: null,
          model: null,
        },
        newProps: {
          profiles: [],
        },

        waitingResponse: false,
      }
    },
    computed: {
      currentGroupID() {
        let groupID = this.$store.getters['user/groupID'];
        return groupID;
      },
      groupList() {
        return this.$store.getters['user/groupList'];
      },
      profileListOfGroup() {
        let value = this.$store.getters['user/profileListOfGroup'];
        return value;
      },
      appInfoOfGroup() {
        return this.$store.getters['user/appInfoOfGroup'];
      }
    },
    watch: {
      currentGroupID: function (value, oldValue) {
        this.requestAPPList('');
      },
//      appInfoOfGroup: function (value, oldValue) {
//      },
    },
    methods: {
      getAppListByPage() {

      },
      handleButtonClick(evt, info) {
        let target = evt.target;
        let bubble = true;
        let stepCnt = 0;
        let maxStep = 8;
        while(bubble) {
          if ('BUTTON' == target.tagName.toUpperCase()) {
            bubble = false;
          } else {
            target = target.parentElement;
          }
          stepCnt += 1;
          if (stepCnt > maxStep) {
            bubble = false;
          }
        }
        if (!info.hasOwnProperty('role')) {
          return;
        }
        if ('linker' === info.role) {
          this.$router.push(info.path);
        } else {
          switch (info.action) {
            case 'refreshAppList':
              this.requestAPPList('');
              break;
          }
        }
      },
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
                  this.updateAppInfo(action, this.selected.index);
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
      updateAppInfo(prop, index) {
        let app = this.appListByPage[index];
        let model = this.appModelListByPage[index];
        let newProp = this.newProps[prop];
        switch (prop) {
          case 'profiles':
            app.profileList = this.profileListOfGroup
              .filter(it => {
                return newProp.indexOf(it.name) >= 0;
              });
            model[prop] = newProp;
            break;
        }
      },
      updateSelectedInfo(action, row, index) {
        let prop = action.split('-')[1];
        this.selected.index = index;
        this.selected.prop = prop;
        this.selected.app = row;
        if (this.appModelListByPage.length > index) {
          let model = this.appModelListByPage[index]
          this.selected.model = model;
          this.newProps[prop] = JSON.parse(JSON.stringify(model[prop]))
        }
      },
      handleRowButtonClick(action, index, row) {
        switch (action) {
          case 'deleteRow':
            this.confirm('您将删除应用，' + row.groupTag + '确定吗？').then(() => {
              this.$net.deleteAPP({
                groupId: this.currentGroupID,
                id: row.appId
              }).then(res => {
                this.appListByPage.splice(index, 1);
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                });
                this.requestAPPList('');
              });
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '您已取消删除'
              });
            });
            break;
          case 'change-profiles':
            this.updateSelectedInfo(action, row, index);
            this.$refs['formInChangeProfileDialog'].validate();
            break;
        }
      },
      getProfileByName(name) {
        let result = {
          name: '',
          description: ''
        };
        if (Array.isArray(this.profileListOfGroup)) {
          for (let key in this.profileListOfGroup) {
            let item = this.profileListOfGroup[key];
            if (name == item.name) {
              result = item;
              break;
            }
          }
        }
        return result;
      },
      requestAPPList(serviceName) {
        if (!serviceName) {
          serviceName = '';
        }
        this.$net.getAPPList({
          groupId: this.currentGroupID,
          start: this.currentPage,
          length: this.pageSize,
          serviceName: serviceName
        }).then(content => {
          if (content.hasOwnProperty('appList')) {
            let appList = content.appList;
            this.appListByPage = appList;
          }
          if (content.hasOwnProperty('appModelList')) {
            this.appModelListByPage = content.appModelList;
          }
          if (content.hasOwnProperty('total')) {
            this.totalSize = content.total;
            if (this.totalSize > 0) {
              this.showPagination = true;
            }
          }
        }).catch(err => {
          this.showPagination = false;
        });
      },
      jumpToServicePage(index, row, tag) {
        console.log('in jumpToServicePage');
        console.log(index, row, tag);
      },

      /* unused */
      handleTagClose(index, row, tag) {
        let item = row;
        if (item.hasOwnProperty('profileList')) {
          let profileList = item.profileList;
          if ((Array.isArray(profileList) && profileList.indexOf(tag) > -1)) {
            this.confirm('您将删除' + row.groupTag + '应用下的' + tag + '环境，确定吗？').then(() => {
              profileList.splice(profileList.indexOf(tag), 1);
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
              this.requestAPPList('')
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '您已取消删除'
              });
            });
          }
        }
      },
      confirm(content) {
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

      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestAPPList('');
      },

      handleChangeprofileList(row) {
        console.log(row);
      },
    }
  }
</script>