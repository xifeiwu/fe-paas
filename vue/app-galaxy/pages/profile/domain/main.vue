<template>
  <div id="domain-main">
    <div class="header">
      <el-row>
        <el-col :span="8">
          <span>应用名称:</span>
          <el-select v-model="selectedAppID" placeholder="请选择">
            <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.serviceName" :value="item.appId">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <span>运行环境:</span>
          <el-select v-model="selectedProfileID" placeholder="请选择">
            <el-option v-for="item in selectedProfileList" :key="item.id" :label="item.description" :value="item.id">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <span>版本:</span>
          <el-select v-model="selectedVersion" placeholder="请选择">
            <el-option v-for="item in selectedVersionList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <div class="domain-list">
        <el-table
                :data="currentDomainList"
                style="width: 100%"
        >
          <el-table-column
                  prop="domain"
                  label="外网二级域名"
                  width="180">
          </el-table-column>
          <el-table-column
                  prop="createTime"
                  label="创建时间"
                  width="180">
          </el-table-column>
          <el-table-column
                  prop="creator"
                  label="创建人"
                  width="160">
          </el-table-column>
          <el-table-column
                  prop="status"
                  label="状态"
                  width="160"
          >
          </el-table-column>
          <el-table-column
                  prop="operation"
                  label="操作"
                  width="360px"
          >
            <template slot-scope="scope">
              <el-button
                      size="mini-extral"
                      type="warning"
                      @click="handleRowButtonClick('to-white-list', scope.$index, scope.row)">
                绑定IP白名单
              </el-button>
              <el-button
                      size="mini-extral"
                      type="danger"
                      @click="handleRowButtonClick('delete', scope.$index, scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  #domain-main {
    .header {
      .el-select .el-input__inner {
        height: 24px;
      }
    }
  }
</style>
<style lang="scss" scoped>
  #domain-main {
    .header {
      margin: 5px;
      font-size: 14px;
    }
  }

</style>

<script>
  import appPropUtils from '../utils/app_prop';
  import StoreHelper from '../utils/store-helper.vue';
  export default {
    mixins: [StoreHelper],
    created() {
      this.onUpdateAppInfoList(this.appInfoListOfGroup);
    },
    data() {
      return {
        appList: [],

        selectedAppID: null,
        selectedAPP: null,
        selectedProfileID: null,
        selectedProfileList: [],
        selectedVersion: null,
        selectedVersionList: [],

        currentDomainList: [{
          domain: 'www.finupgroup.com',
          createTime: '2017-06-06',
          creator: 'me',
          status: '生效中',
        }]
      }
    },
    watch: {
      appInfoListOfGroup: 'onUpdateAppInfoList',
      selectedAppID: function (value, oldValue) {
        let appID = value;
        let appInfo = this.getAppInfoByID(appID);
        if (!appInfo) {
          return;
        }
        this.selectedAPP = appInfo['app'];
        this.selectedProfileList = this.selectedAPP['profileList'];
        if (Array.isArray(this.selectedProfileList) && this.selectedProfileList.length > 0) {
          // at the beginning of this page(value of selectedProfileID is null), get selectedProfileID from localStorage
          // else selectedProfileID is the first element in profileList of selectedApp
          var defaultProfileID = this.selectedProfileList[0]['id'];
          if (null == this.selectedProfileID) {
//            let selectedProfileID = this.getConfig('profile/service/profileID');
//            if (selectedProfileID) {
//              this.selectedProfileID = selectedProfileID;
//            }
            this.selectedProfileID = defaultProfileID;
          } else {
            // request service list when app id is changed while profile id is not changed.
            if (this.selectedProfileID == defaultProfileID) {
              this.requestVersionList(this.selectedAPP.appId, this.selectedProfileID);
            } else {
              this.selectedProfileID = defaultProfileID;
            }
          }
        }
        this.$setUserConfig('profile/service/appID', appID);
      },
      selectedProfileID: function (value, oldValue) {
        let profileID = value;
        let appID = this.selectedAPP.appId;
        this.requestVersionList(appID, profileID);
//      this.setConfig('profile/service/profileID', profileID);
      },
      selectedVersion: function (value, oldValue) {
        console.log(value);
        if (null == value) {
          return;
        }
        this.requestInstanceList(this.selectedAPP.appId, this.selectedProfileID, value);
      },
    },
    methods: {
      /**
       * call in two place:
       * 1. created function
       * 2. appInfoListOfGroup watcher
       *
       * what is done?
       * 1. refresh this.appList
       * 2. get default appId
       */
      onUpdateAppInfoList(appInfoListOfGroup) {
        if (appInfoListOfGroup) {
          if (appInfoListOfGroup.hasOwnProperty('appList')) {
            this.appList = appInfoListOfGroup.appList;
          }
          if (!this.appList || (0 == this.appList.length)) {
            return;
          }
          let appId = this.$getUserConfig('profile/service/appID');
          if (appId && this.getAppInfoByID(appId)) {
            this.selectedAppID = appId;
          } else {
            this.selectedAppID = this.appList[0]['appId'];
          }
        }
      },

      requestVersionList(appID, spaceID) {
        if (!appID || !spaceID) {
          console.log('appID or spaceID can not be empty');
          return;
        }
        this.selectedVersion = null;
        this.$net.getServiceVersion({
          appId: appID,
          spaceId: spaceID
        }).then(content => {
//          console.log(content);
          if (content.hasOwnProperty('version')) {
            let version = content.version;
            if (version && Array.isArray(version) && version.length > 0) {
              this.selectedVersionList = version;
              this.selectedVersion = version[0];
            } else {
              let profileName = '该';
              let profileInfo = appPropUtils.getProfileInfoByID(this.selectedProfileID);
              if (profileInfo && profileInfo.hasOwnProperty('name')) {
                profileName = profileInfo.description;
              }
              this.$message({
                type: 'warning',
                message: profileName + '下，服务没有版本！'
              });
            }
          }
        }).catch(err => {
          console.log(err);
          this.$message({
            type: 'error',
            message: '查找服务版本失败！'
          });
        });
      },
      // 获取实例列表
      requestInstanceList(appID, spaceID, version) {
        if (!appID || !spaceID) {
          console.log('appID or spaceID can not be empty');
          return;
        }
        this.$net.getInstanceList({
          appId: appID,
          spaceId: spaceID,
          serviceVersion: version
        }).then(content => {
          console.log(content);
//          if (content.hasOwnProperty('version')) {
//            let version = content.version;
//            if (version && Array.isArray(version) && version.length > 0) {
//              this.selectedVersionList = version;
//              this.selectedVersion = version[0];
//            } else {
//              let profileName = '该';
//              let profileInfo = appPropUtils.getProfileInfoByID(this.selectedProfileID);
//              if (profileInfo && profileInfo.hasOwnProperty('name')) {
//                profileName = profileInfo.description;
//              }
//              this.$message({
//                type: 'warning',
//                message: profileName + '下，服务没有版本！'
//              });
//            }
//          }
        }).catch(err => {
          console.log(err);
          this.$message({
            type: 'error',
            message: '查找服务版本失败！'
          });
        });
      },

      handleRowButtonClick(action, index, row) {
        switch (action) {
          case 'to-white-list':
            let domain = row.domain;
            this.$router.push({
              path: '/profile/domain/white-list',
              query: {
                domain: domain,
              }
            });
            break;
        }
      }
    }
  }
</script>