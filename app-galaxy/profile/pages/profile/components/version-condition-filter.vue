<template>
  <div class="profile-version-condition-filter">
    <div class="item">
      <label>运行环境:</label>
      <el-select v-model="selectedProfileID" placeholder="请选择" :disabled="fixedInfo.type=='profile'">
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
  .profile-version-condition-filter {
    .el-select .el-input__inner {
      height: 24px;
    }
  }
</style>
<style lang="scss" scoped>
  .profile-version-condition-filter {
    font-size: 14px;
    .item {
      display: inline-block;
      margin-right: 3px;
      .el-select {
        max-width: 190px;
      }
    }
  }
</style>

<script>
  /**
   * select service by profile and app
   *
   * used to select service, the place used:
   * page domain：header selector，dialog for binding service
   *
   * custom type:
   * 1. profile can be fixed
   * 2. add item '全部' or not
   * 3. customConfig for profileID, appID, serviceID
   */
  export default {
    created() {
      this.onProfileListOfGroup(this.$storeHelper.profileListOfGroup);
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
      // set default value or not, may be modify later
//      setDefault: {
//        type: Boolean,
//        default: true
//      },
      // whether add 全部 to option list of select for profile or service
      addItemAll: {
        type: Object,
        default() {
          return {
            app: false,
            profile: false,
            service: false
          }
        }
      },
      // give a fixed value for a type(profile, app, version)
      fixedInfo: {
        type: Object,
        default() {
          return {
            type: null,
            id: null,
          }
        }
      },
      customConfig: Object
    },
    computed: {
      appInfoListOfGroup() {
        return this.$storeHelper.appInfoListOfGroup;
      },
    },
    watch: {
      '$storeHelper.profileListOfGroup': 'onProfileListOfGroup',
      'appInfoListOfGroup': function (value) {
        this.changeAppRelatedInfo('appInfoList');
      },
      selectedProfileID: function (value) {
        this.changeAppRelatedInfo('profileID');
      },
      selectedAppID: function (appID) {
//        this.$storeHelper.setUserConfig('profile/service/appID', appID);
        this.requestServiceList();
      },
      // update currentService when selectedServiceID is changed
      selectedServiceID: function (serviceVersion) {
        this.changeServiceCondition();
      },
      'fixedInfo.id': function (id) {
        switch (this.fixedInfo.type) {
          case 'profile':
            this.selectedProfileID = id;
            break;
        }
      }
    },
    methods: {
      /**
       * the start of watch chain
       * onProfileListOfGroup -> selectedProfileID[appInfoListOfGroup] -> changeAppRelatedInfo
       *  -> selectedAppID[requestServiceList] ->
       */
      onProfileListOfGroup(profileList) {
        // set product profile as constant
//        if (this.fixProfile) {
//          if (this.fixedProfileInfo.profileID) {
//            this.selectedProfileID = this.fixedProfileInfo.profileID;
//          }
//          return;
//        }
        if (profileList && Array.isArray(profileList)) {
          let profileAll = [];
          if (this.addItemAll && this.addItemAll.profile) {
            profileAll = [{
              description: "全部",
              id: this.$storeHelper.PROFILE_ID_FOR_ALL,
              isDefault: true,
              name: "all",
              spaceType: "ALL"
            }];
          }
          this.profileListWithAll = profileAll.concat(profileList);
          this.setDefaultService(this.profileListWithAll);
        }
      },

      setDefaultService(profileListWithAll) {
        // check whether this.selectedProfileID in profileListWithAll
        let isSelectedProfileExist = false;
        profileListWithAll.some(it => {
          isSelectedProfileExist = it.id == this.selectedProfileID;
          return isSelectedProfileExist;
        });
        if (!isSelectedProfileExist) {
          this.selectedProfileID = null;
        }
        // get from localStorage first
        if (this.selectedProfileID == null) {
          let defaultProfileID = null;
          // 1. fixed id
          if (this.fixedInfo && this.fixedInfo.type === 'profile') {
            defaultProfileID = this.fixedInfo.id;
          }
          // 2. customConfig
          if (!defaultProfileID && this.customConfig && this.customConfig.hasOwnProperty('profileID')) {
            defaultProfileID = this.customConfig['profileID'];
          }
          // 3. first element in list
          if (!defaultProfileID && profileListWithAll.length > 0) {
            defaultProfileID = profileListWithAll[0].id;
          }
          // profileID must be set here
          this.selectedProfileID = defaultProfileID;
        }
      },

      /**
       * update appListWithAll on change of profileID or appInfoListOfGroup,
       * and init selectedAppID or update selectedAppID if necessary(when current selectedAppID is not in appListWithAll)
       *
       * change app related info, used in:
       * 1. on change of profileID
       * 2. callback of requesting appListOfGroup successful
       */
      changeAppRelatedInfo(from) {
        // avoid duplicate request
//        if ('profileID' === from && !this.appInfoListOfGroup) {
//          return;
//        }
        if (!this.selectedProfileID || !this.appInfoListOfGroup) {
          return;
        }
        // set and update appListWithAll
        let profileID = this.selectedProfileID;
//        if (!profileID) {
//          profileID = this.$storeHelper.PROFILE_ID_FOR_ALL;
//        }
        let appList = this.$storeHelper.getAppListByProfileID(profileID);
        let appAll = [];
        if (this.addItemAll && this.addItemAll.app) {
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

        // set or check selectedAppID
        let firstAppID = null;
        if (Array.isArray(this.appListWithAll) && this.appListWithAll.length > 0) {
          firstAppID = this.appListWithAll[0].appId;
        }
        let updateAppID = true;
        if (!this.selectedAppID) {
          // init value of this.selectedAppID
          if (this.customConfig && this.customConfig.hasOwnProperty('appID')) {
           this.selectedAppID = this.customConfig['appID'];
          }
          if (!this.selectedAppID && firstAppID) {
            this.selectedAppID = firstAppID;
          }
          if (!this.selectedAppID) {
            updateAppID = false;
          }
        } else {
          // check whether the selectedAppID in app list of this profile
          let hasExist = false;
          this.appListWithAll.some(it => {
            hasExist = this.selectedAppID == it.appId;
            return hasExist;
          });
          if (!hasExist && firstAppID) {
            this.selectedAppID = firstAppID;
          } else {
            updateAppID = false;
          }
        }
        // set default appId if necessary
        // this.setDefault &&
        if (!updateAppID) {
          this.requestServiceList();
        }
      },

      /**
       * request service list when selectedAppId or selectedProfileId is changed
       */
      requestServiceList() {
//        console.log(this.selectedProfileID);
//        console.log(this.selectedAppID);
        let versionAll = [];
        if (this.addItemAll && this.addItemAll.service) {
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
//          if (this.setDefault) {
            if (this.serviceListWithAll.length > 0) {
              this.selectedServiceID = this.serviceListWithAll[0]['id'];
            } else {
              this.selectedServiceID = '';
            }
//          }
          this.changeServiceCondition();
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

          let firstServiceID = null;
          if (this.serviceListWithAll && this.serviceListWithAll.length > 0) {
            firstServiceID = this.serviceListWithAll[0]['id'];
          }
          // whether serviceID is updated, if not trigger changeServiceCondition manually
          // else trigger changeServiceCondition by watcher function of serviceID
          let updateServiceID = true;
          if (!this.selectedServiceID) {
            if (this.customConfig && this.customConfig.hasOwnProperty('serviceID')) {
              this.selectedServiceID = this.customConfig['serviceID'];
            }
            if (!this.selectedServiceID && firstServiceID) {
              this.selectedServiceID = firstServiceID;
            }
            if (!this.selectedServiceID) {
              updateServiceID = false;
            }
          } else {
          // whether current selectedServiceID is valid
          // this.setDefault &&
//            if (this.serviceListWithAll.length > 0
//              && this.serviceListWithAll.map(it => {return it.id}).indexOf(this.selectedServiceID) > -1) {
//              updateServiceID = false;
//            } else {
            if (this.selectedServiceID === firstServiceID) {
              updateServiceID = false;
            } else {
            this.selectedServiceID = firstServiceID;
            }
          }
          if (!updateServiceID) {
            this.changeServiceCondition();
          }
//          console.log(this.serviceListWithAll);
        }).catch(err => {
          this.serviceListWithAll = versionAll;
          this.changeServiceCondition();
          console.log(err);
//          this.$message({
//            type: 'error',
//            message: '查找服务版本失败！'
//          });
        })
      },

      // compare to the former state, whether selected value(profile, app, service) is changed or not
      needEmit() {
//        console.log('needEmit');
        let isChange = false;
        // profileID changed or not
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
        // appID changed or not
        if (this.selectedStatus.appID !== this.selectedAppID) {
          this.selectedStatus.appID = this.selectedAppID;
          this.selectedStatus.app = this.$storeHelper.getAppByID(this.selectedAppID);
          isChange = true;
        }
        // serviceID changed or not
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
//          console.log(this.selectedStatus);
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