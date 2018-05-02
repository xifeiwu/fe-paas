<template>
  <div class="my-version-selector">
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
      <el-select filterable v-model="selectedServiceID" :placeholder="currentServiceList.length > 0 ? '请选择' : '当前运行环境下没有版本！'">
        <el-option v-for="item in currentServiceList" :key="item.id" :label="item.serviceVersion" :value="item.id">
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<style lang="scss">
  .my-version-selector {
    .el-select .el-input__inner {
      height: 24px;
    }
  }
</style>
<style lang="scss" scoped>
  .my-version-selector {
    font-size: 14px;
    .item {
      display: inline-block;
      margin-right: 3px;
    }
  }
</style>

<script>
  /**
   * used to select service, the place used:
   * page domain：header selector，dialog for binding service
   * page instance：header selector
   * page log: log-deploy, log-run
   */
  export default {
    created() {
    },
    mounted() {
      if (!this.appInfoListOfGroup) {
        this.$store.dispatch('user/appInfoListOfGroup', {
          from: 'component version-selector',
          groupID: this.$storeHelper.currentGroupID
        });
      } else {
        this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      }
    },
    props: {
      /**
       * format of customConfig: {
       *   appID: null,
       *   profileID: null,
       *   serviceID: null,
       *   serviceVersion: null
       * }
       */
      customConfig: Object
    },
    data() {
      return {
        appList: [],

        selectedAppID: null,
        selectedAPP: null,

        // profile related
        selectedProfileID: null,
        selectedProfile: null,
        currentProfileList: [],

        // 版本（既服务）列表
        selectedServiceID: null,
        selectedService: null,
        currentServiceList: [],
//        getVersionList: this.requestServiceList,
//        getVersionList: this.requestVersionList,

        // TODO: not used
        currentVersionList: [],
      }
    },
    computed: {
      appInfoListOfGroup() {
        return this.$storeHelper.appInfoListOfGroup();
      }
    },
    watch: {
      'appInfoListOfGroup': 'onAppInfoListOfGroup',
      selectedAppID: function (value, oldValue) {
        let appID = value;
        let appInfo = this.$storeHelper.getAppInfoByID(appID);
        if (!appInfo) {
          return;
        }
        this.selectedAPP = appInfo['app'];
        this.currentProfileList = this.selectedAPP['profileList'];

        // set default profileID
        if (Array.isArray(this.currentProfileList) && this.currentProfileList.length > 0) {
          // if value of selectedProfileID is null(at the beginning of this page),
          // set default profileID as follows:
          // 1. customConfig.profileID if customConfig is not null
          // 2. localStorage
          // 3. first element of profileList in selectedApp
          let firstProfileID = this.currentProfileList[0]['id'];
          if (null == this.selectedProfileID) {
            let defaultProfileID = null;
            if (this.customConfig && this.customConfig.hasOwnProperty('profileID')) {
              defaultProfileID = this.customConfig['profileID'];
            }
            if (!defaultProfileID) {
              defaultProfileID = this.$storeHelper.getUserConfig('profile/service/profileID');
            }
            if (defaultProfileID && this.currentProfileList.map(it => {return it.id}).indexOf(defaultProfileID) > -1) {
              this.selectedProfileID = defaultProfileID;
            } else {
              this.selectedProfileID = firstProfileID;
            }
          } else {
            // request service list when app id is changed while profile id is not changed.
            if (this.selectedProfileID == firstProfileID) {
              this.requestServiceList(this.selectedAPP.appId, this.selectedProfileID);
            } else {
              this.selectedProfileID = firstProfileID;
            }
          }
        } else {
          // changeVersion even the length of profileList is zero
          this.changeVersion(this.selectedAPP, null, null);
        }
//        this.$setUserConfig('profile/service/appID', appID);
      },
      selectedProfileID: function (value, oldValue) {
        let profileID = value;
        let appID = this.selectedAPP ? this.selectedAPP.appId: null;
        this.requestServiceList(appID, profileID);
//        this.$storeHelper.setUserConfig('profile/service/profileID', profileID);
      },

      // update currentService when selectedServiceID is changed
      selectedServiceID: function (serviceID, oldValue) {
        if (null == serviceID) {
          return;
        }
        let target = null;
        this.currentServiceList.some(it => {
          if (it.id == serviceID) {
            target = it;
          }
          return target;
        });
        if (!target) {
          return;
        }
        this.selectedService = target;
        this.changeVersion(this.selectedAPP, this.selectedProfileID, target);
      },
    },
    methods: {
      initDataStatus() {
        this.appList = [];
        this.selectedAppID = null;
        this.currentProfileList = [];
         this.selectedProfileID = this.$storeHelper.SERVICE_ID_FOR_NULL;
        this.currentServiceList = [];
        this.selectedServiceID = this.$storeHelper.SERVICE_ID_FOR_NULL;
      },
      /**
       * this function is the start point of watcher chain
       * the start of watcher chain: appID -> profileID -> serviceID
       *
       * call in two place:
       * 1. created function
       * 2. appInfoListOfGroup watcher
       *
       * what is done?
       * 1. refresh this.appList
       * 2. get default appId
       */
      onAppInfoListOfGroup(appInfoListOfGroup) {
        this.initDataStatus();
        if (appInfoListOfGroup) {
          if (appInfoListOfGroup.hasOwnProperty('appList')) {
            this.appList = appInfoListOfGroup.appList;
          }
          if (!this.appList || (0 == this.appList.length)) {
            this.$notify.warning({
              title: '该团队应用列表为空',
              message: '某些操作可能无法正常进行！',
              duration: 10 * 1000,
              onClose: function () {
              }
            });
            return;
          }
          // the sequence of getting default appID:
          // 1. customConfig.appId if customConfig exist
          // 2. localStorage
          // 3. first element of appList
          let defaultAppID = null;
          if (this.customConfig && this.customConfig.hasOwnProperty('appID')) {
            defaultAppID = this.customConfig['appID'];
          }
          if (!defaultAppID) {
            defaultAppID = this.$getUserConfig('profile/service/appID');
          }
          if (defaultAppID && this.$storeHelper.getAppInfoByID(defaultAppID)) {
            this.selectedAppID = defaultAppID;
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
        this.selectedServiceID = null;
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
              let firstServiceID = currentServiceList[0].id;
              // set default serviceID as follows:
              // 1. customConfig.serviceID if exist
              // 2. customConfig.serviceName if exist
              // 3. first element of profileList in selectedApp
              if (this.customConfig) {
                if (this.customConfig.hasOwnProperty('serviceID')) {
                  this.selectedServiceID = this.customConfig['serviceID'];
                } else if (this.customConfig.hasOwnProperty('serviceName')) {
                  let theProfile = null;
                  currentServiceList.some(it => {
                    if (it.serviceName === this.customConfig['serviceName']) {
                      theProfile = it;
                    }
                    return theProfile;
                  });
                  if (theProfile) {
                    this.selectedServiceID = theProfile.id;
                  } else {
                    this.selectedServiceID = firstServiceID;
                  }
                } else {
                  this.selectedServiceID = firstServiceID;
                }
              } else {
                this.selectedServiceID = firstServiceID;
              }
            } else {
              // changeVersion even the length of profileList is zero
              this.changeVersion(this.selectedAPP, this.selectedProfileID, null);
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
       * 1. at change of selectedServiceID
       * 2. the length of profileList is zero
       * 3. the length of serviceList is zero
       */
      changeVersion(selectedAPP, selectedProfileID, selectedService) {
        let profileInfo = this.$storeHelper.getProfileInfoByID(selectedProfileID);
        this.selectedProfile = profileInfo;
        this.$emit('version-selected', selectedAPP, profileInfo, selectedService);
      },

      /**
       * another way to get selected value
       */
      getSelectedValue() {
        return {
          selectedAPP: this.selectedAPP,
          selectedProfile: this.selectedProfile,
          selectedService: this.selectedService
        }
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