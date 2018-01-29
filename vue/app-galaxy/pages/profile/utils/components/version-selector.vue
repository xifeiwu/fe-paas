<template>
  <div class="el-version-selector">
    <div class="item">
      <label>应用名称:</label>
      <el-select filterable v-model="selectedAppID" placeholder="请选择">
        <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.serviceName" :value="item.appId">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label>运行环境:</label>
      <el-select v-model="selectedProfileID" placeholder="请选择">
        <el-option v-for="item in currentProfileList" :key="item.id" :label="item.description" :value="item.id">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label>版本:</label>
      <!--<el-select v-model="selectedVersion" :placeholder="currentVersionList.length > 0 ? '加载中' : '当前运行环境下没有版本！'">-->
        <!--<el-option v-for="item in currentVersionList" :key="item" :label="item" :value="item">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <el-select filterable v-model="selectedVersion" :placeholder="currentServiceList.length > 0 ? '加载中' : '当前运行环境下没有版本！'">
      <el-option v-for="item in currentServiceList" :key="item.id" :label="item.serviceVersion" :value="item.serviceVersion">
      </el-option>
    </el-select>
    </div>
  </div>
</template>

<style lang="scss">
  .el-version-selector {
    .el-select .el-input__inner {
      height: 24px;
    }
  }
</style>
<style lang="scss" scoped>
  .el-version-selector {
    font-size: 14px;
    .item {
      display: inline-block;
      margin-right: 3px;
    }
  }
</style>

<script>
  import appPropUtils from '../app_prop';
//  import StoreHelper from '../store-helper.vue';
  export default {
//    mixins: [StoreHelper],
    created() {
      this.onAppInfoListOfGroup(this.$storeHelper.appInfoListOfGroup);
    },
    data() {
      return {
        appList: [],

        selectedAppID: null,
        selectedAPP: null,

        // profile related
        selectedProfileID: null,
        currentProfileList: [],

        // 版本（既服务）列表
        // the value of serviceVersion in currentService
        selectedVersion: null,
        currentServiceList: [],
        getVersionList: this.requestServiceList,

        // TODO: not used
        currentVersionList: [],
//        getVersionList: this.requestVersionList,
      }
    },
    watch: {
      '$storeHelper.appInfoListOfGroup': 'onAppInfoListOfGroup',
      selectedAppID: function (value, oldValue) {
        let appID = value;
        let appInfo = this.$storeHelper.getAppInfoByID(appID);
        if (!appInfo) {
          return;
        }
        this.selectedAPP = appInfo['app'];
        this.currentProfileList = this.selectedAPP['profileList'];
        if (Array.isArray(this.currentProfileList) && this.currentProfileList.length > 0) {
          // if value of selectedProfileID is null(at the beginning of this page),
          // get selectedProfileID from localStorage
          // else selectedProfileID is the first element in profileList of selectedApp
          var defaultProfileID = this.currentProfileList[0]['id'];
          if (null == this.selectedProfileID) {
//            let selectedProfileID = this.getConfig('profile/service/profileID');
//            if (selectedProfileID) {
//              this.selectedProfileID = selectedProfileID;
//            }
            this.selectedProfileID = defaultProfileID;
          } else {
            // request service list when app id is changed while profile id is not changed.
            if (this.selectedProfileID == defaultProfileID) {
              this.getVersionList(this.selectedAPP.appId, this.selectedProfileID);
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
        this.getVersionList(appID, profileID);
//      this.setConfig('profile/service/profileID', profileID);
      },

      // update currentService when selectedVersion is changed
      selectedVersion: function (serviceVersion, oldValue) {
        let currentService = null;
        if (null == serviceVersion) {
          return;
        }
        let target = null;
        this.currentServiceList.some(it => {
          if (it.serviceVersion == serviceVersion) {
            target = it;
          }
          return target;
        });
        if (!target) {
          return;
        }
        currentService = target;
        this.changeVersion(this.selectedAPP, this.selectedProfileID, currentService);
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
      onAppInfoListOfGroup(appInfoListOfGroup) {
//        console.log(appInfoListOfGroup);
        if (appInfoListOfGroup) {
          if (appInfoListOfGroup.hasOwnProperty('appList')) {
            this.appList = appInfoListOfGroup.appList;
          }
          if (!this.appList || (0 == this.appList.length)) {
            return;
          }
          let appId = this.$getUserConfig('profile/service/appID');
          if (appId && this.$storeHelper.getAppInfoByID(appId)) {
            this.selectedAppID = appId;
          } else {
            this.selectedAppID = this.appList[0]['appId'];
          }
        }
      },

      /**
       * request service list when selectedAppId or selectedProfileId is changed
       */
      requestServiceList(appID, spaceID) {
        if (!appID || !spaceID) {
          console.log('appID or spaceID can not be empty');
          return;
        }
        this.selectedVersion = null;
        this.currentServiceList = [];
        this.$net.getServiceListByAppIDAndProfileID({
          appId: appID,
          spaceId: spaceID
        }).then(content => {
          if (content.hasOwnProperty('applicationServerList')) {
            let currentServiceList = content['applicationServerList'];
            // get default version
            if (currentServiceList && Array.isArray(currentServiceList) && currentServiceList.length > 0) {
              this.currentServiceList = currentServiceList;
              this.selectedVersion = currentServiceList[0].serviceVersion;
            }
          }
        }).catch(err => {
          console.log(err);
          this.$message({
            type: 'error',
            message: '查找服务版本失败！'
          });
        })
      },

      /**
       * emit event for value changed
       */
      changeVersion(appInfo, profileId, serviceInfo) {
        let profileInfo = this.$storeHelper.getProfileInfoByID(profileId);
        this.$emit('version-selected', appInfo, profileInfo, serviceInfo);
      },

      /**
       * request version list when selectedAppId or selectedProfileId is changed
       * TODO: not used
       */
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
              this.currentVersionList = version;
              this.selectedVersion = version[0];
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
    }
  }
</script>