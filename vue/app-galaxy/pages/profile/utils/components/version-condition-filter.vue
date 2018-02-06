<template>
  <div class="el-version-selector">
    <div class="item">
      <label>运行环境:</label>
      <span v-if="fixProfile">开发环境</span>
      <el-select v-model="selectedProfileID" placeholder="请选择" v-else>
        <el-option v-for="item in profileListWithAll" :key="item.id" :label="item.description" :value="item.id">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label>应用名称:</label>
      <el-select filterable v-model="selectedAppID" placeholder="请选择">
        <el-option v-for="(item, index) in appListWithAll" :key="item.appId" :label="item.serviceName" :value="item.appId">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label>版本:</label>
      <el-select filterable v-model="selectedServiceID" :placeholder="serviceListWithAll.length === 0 ?'当前环境下无版本':'请选择'">
        <el-option v-for="item in serviceListWithAll" :key="item.id" :label="item.serviceVersion" :value="item.id">
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
  /**
   * used to select service, the place used:
   * page domain：header selector，dialog for binding service
   * page instance：header selector
   * page log: log-deploy, log-run
   */
  export default {
    created() {
      this.onProfileListOfGroup(this.profileListOfGroup);
    },
    data() {
      return {
        // profile related
        selectedProfileID: null,
        profileListWithAll: [],

        // app related
        appListWithAll: [],
        selectedAppID: null,

        // 版本（既服务）列表
        // the value of serviceVersion in currentService
        selectedServiceID: null,
        serviceListWithAll: [],
        getVersionList: this.requestServiceList,

        selectedStatus: {
          profileID: null,
          appID: null,
          serviceID: null,
          profile: null,
          app: null,
          service: null
        },

        // TODO: not used
        currentVersionList: [],
      }
    },
    props: {
      setDefault: {
        type: Boolean,
        default: true
      },
      addItemAll: {
        type: Boolean,
        default: true
      },
      fixedProfileInfo: Object
    },
    computed: {
      profileListOfGroup() {
        return this.$storeHelper.profileListOfGroup();
      },
      appInfoListOfGroup() {
        return this.$storeHelper.appInfoListOfGroup();
      },
      fixProfile() {
        return this.fixedProfileInfo && this.fixedProfileInfo.hasOwnProperty('fixed');
      }
    },
    watch: {
      'profileListOfGroup': 'onProfileListOfGroup',
      'appInfoListOfGroup': function (value) {
        this.changeAppRelatedInfo('appInfoList');
      },
      selectedProfileID: function (value) {
        this.changeAppRelatedInfo('profileID');
        this.requestServiceList();
        this.changeServiceCondition();
      },
      selectedAppID: function (appID) {
//        this.$storeHelper.setUserConfig('profile/service/appID', appID);
        this.requestServiceList();
        this.changeServiceCondition();
      },
      // update currentService when selectedServiceID is changed
      selectedServiceID: function (serviceVersion) {
        this.changeServiceCondition();
      },
    },
    methods: {
      // the start of watch chain
      onProfileListOfGroup(profileList) {
        // set product profile as constant
        if (this.fixProfile) {
          if (this.fixedProfileInfo.profileID) {
            this.selectedProfileID = this.fixedProfileInfo.profileID;
          }
          return;
        }
        if (profileList && Array.isArray(profileList)) {
          let profileAll = [];
          if (this.addItemAll) {
            profileAll = [{
              description: "全部",
              id: this.$storeHelper.PROFILE_ID_FOR_ALL,
              isDefault: true,
              name: "all",
              spaceType: "ALL"
            }];
          }
          this.profileListWithAll = profileAll.concat(profileList);
          // get from localStorage first
//          let profileID = this.$storeHelper.getUserConfig('profile/service/profileID');
          let profileID = null;
          if (!profileID && this.profileListWithAll.length > 0) {
            profileID = this.profileListWithAll[0].id;
          }
          // profileID must be set here
          this.selectedProfileID = profileID;
        }
      },

      /**
       * change app related info, used in:
       * 1. on change of profileID
       * 2. callback of requesting appListOfGroup successful
       */
      changeAppRelatedInfo(from) {
        // avoid duplicate request
        if ('profileID' === from && !this.appInfoListOfGroup) {
          return;
        }
        let profileID = this.selectedProfileID;
        if (!profileID) {
          profileID = this.$storeHelper.PROFILE_ID_FOR_ALL;
        }
        let appList = this.$storeHelper.getAppListByProfileID(profileID);
        let appAll = [];
        if (this.addItemAll) {
          appAll = [{
            appId: this.$storeHelper.APP_ID_FOR_ALL,
            serviceName: '全部'
          }];
        }
        if (appList) {
          this.appListWithAll = appAll.concat(appList);
        } else {
          this.appListWithAll = appAll;
        }

        // check whether the selectedAppID in app list of this profile
        let needSetAppID = false;
        if (!this.selectedAppID) {
          needSetAppID = true;
        } else {
          let hasExist = false;
          this.appListWithAll.some(it => {
            hasExist = this.selectedAppID == it.appId;
            return hasExist;
          });
          needSetAppID = !hasExist;
        }

        if (this.setDefault && needSetAppID) {
          if (Array.isArray(this.appListWithAll) && this.appListWithAll.length > 0) {
            this.selectedAppID = this.appListWithAll[0].appId;
          }
        }
      },

      /**
       * request service list when selectedAppId or selectedProfileId is changed
       */
      requestServiceList() {
//        console.log(this.selectedProfileID);
//        console.log(this.selectedAppID);
        let versionAll = [];
        if (this.addItemAll) {
          versionAll = [{
            id: this.$storeHelper.SERVICE_ID_FOR_ALL,
            serviceVersion: '全部'
          }];
        }
        if (!this.selectedProfileID || !this.selectedAppID ||
          (this.$storeHelper.APP_ID_FOR_ALL === this.selectedAppID) ||
          (this.$storeHelper.PROFILE_ID_FOR_ALL === this.selectedProfileID)
        ) {
          this.serviceListWithAll = versionAll;
          if (this.setDefault) {
            if (this.serviceListWithAll.length > 0) {
              this.selectedServiceID = this.serviceListWithAll[0]['id'];
            } else {
              this.selectedServiceID = '';
            }
          }
          console.log('appID or spaceID can not be empty');
          return;
        }
        let appId = this.selectedAppID;
        let spaceId = this.selectedProfileID;
        this.$net.getServiceListByAppIDAndProfileID({
          appId, spaceId
        }).then(content => {
//          console.log(content);
          this.serviceListWithAll = versionAll;
          if (content.hasOwnProperty('applicationServerList')) {
            let serviceList = content['applicationServerList'];
            if (serviceList && Array.isArray(serviceList) && serviceList.length > 0) {
              this.serviceListWithAll = this.serviceListWithAll.concat(serviceList);
            }
          }
          // set default selectedServiceID
          if (this.setDefault) {
            if (this.serviceListWithAll.length > 0) {
              this.selectedServiceID = this.serviceListWithAll[0]['id'];
            } else {
              this.selectedServiceID = '';
            }
          }
//          console.log(this.serviceListWithAll);
        }).catch(err => {
          this.serviceListWithAll = versionAll;
          console.log(err);
//          this.$message({
//            type: 'error',
//            message: '查找服务版本失败！'
//          });
        })
      },

      needEmit() {
        let isChange = false;
        if (this.selectedStatus.profileID !== this.selectedProfileID) {
          this.selectedStatus.profileID = this.selectedProfileID;
          let target = null;
          this.profileListWithAll.some(it => {
            if (it.id === this.selectedProfileID) {
              target = it;
            }
            return target;
          });
          this.selectedStatus.profile = target;
          isChange = true;
        }
        if (this.selectedStatus.appID !== this.selectedAppID) {
          this.selectedStatus.appID = this.selectedAppID;
          this.selectedStatus.app = this.$storeHelper.getAppByID(this.selectedAppID);
          isChange = true;
        }
        if (this.selectedStatus.serviceID !== this.selectedServiceID) {
          this.selectedStatus.serviceID = this.selectedServiceID;
          let target = null;
          this.serviceListWithAll.some(it => {
            if (it.id === this.selectedServiceID) {
              target = it;
            }
            return target;
          });
          this.selectedStatus.service = target;
          isChange = true;
        }
        return isChange;
      },

      /**
       * emit event for value changed
       */
      changeServiceCondition() {
        const debouncedEmit = this.$utils.debounce(() => {
          let selectedStatus = this.selectedStatus;
          this.$emit('service-condition-changed', selectedStatus.profile, selectedStatus.app, selectedStatus.service);
        }, 100, false);
        if (this.needEmit()) {
          debouncedEmit();
        }
      },

      /**
       * another way to get selected value
       */
      getSelectedValue() {
        let selectedStatus = this.selectedStatus;
        return {
          selectedAPP: selectedStatus.app,
          selectedProfile: selectedStatus.profile,
          selectedService: selectedStatus.service
        }
      },
    }
  }
</script>