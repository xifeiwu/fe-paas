<template>
  <div class="paas-version-selector">
    <div class="item app-list">
      <label>应用名称:</label>
      <el-select filterable v-model="selectedAppId" size="mini" placeholder="请选择">
        <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.appName" :value="item.appId">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label>运行环境:</label>
      <el-select v-model="selectedProfileId" size="mini" placeholder="请选择">
        <el-option v-for="item in currentProfileList" :key="item.id" :label="item.description" :value="item.id">
        </el-option>
      </el-select>
    </div>
    <!--<div class="item" v-if="false">-->
      <!--<label>版本:</label>-->
      <!--<el-select filterable v-model="selectedServiceId" :placeholder="currentServiceList.length > 0 ? '请选择' : '当前运行环境下没有版本！'">-->
        <!--<el-option v-for="item in currentServiceList" :key="item.id" :label="item.serviceVersion" :value="item.id">-->
        <!--</el-option>-->
      <!--</el-select>-->
    <!--</div>-->
  </div>
</template>

<style lang="scss" scoped>
  .paas-version-selector {
    font-size: 14px;
    .item {
      display: inline-block;
      margin-right: 3px;
      label {
        font-weight: bold;
      }
      &.app-list {
        .el-select {
          min-width: 260px;
        }
      }
    }
  }
</style>

<script>
  import {mapGetters} from 'vuex';
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
      if (this.appInfoListOfGroup) {
        this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      }
    },
    props: {
      /**
       * serviceId or serviceVersion can be passed
       * format of customConfig: {
       *   appId: null,
       *   profileId: null,
       *   serviceId: null,
       *   serviceVersion: null
       * }
       */
      customConfig: Object
    },
    data() {
      return {
        appList: [],

        selectedAppId: null,
        selectedAPP: null,

        // profile related
        selectedProfileId: null,
        selectedProfile: null,
        currentProfileList: [],

        // 版本（既服务）列表
        selectedServiceId: null,
        selectedService: null,
        DEFAULT_SERVICE_ID: 10,
        currentServiceList: [],

        // TODO: not used
        // currentVersionList: [],
      }
    },
    computed: {
      ...mapGetters('user', {
        'appInfoListOfGroup': 'appInfoListOfGroup'
      }),
    },
    watch: {
      'appInfoListOfGroup': 'onAppInfoListOfGroup',
      selectedAppId: 'onSelectedAppIdChanged',
      selectedProfileId: function (value, oldValue) {
        let profileId = value;
        let appId = this.selectedAPP ? this.selectedAPP.appId: null;
        if (!appId || !profileId) {
          return;
        }
        this.requestServiceList(appId, profileId);
        this.currentServiceList = [{
          id: this.DEFAULT_SERVICE_ID,
          serviceVersion: 'default'
        }];
        this.selectedServiceId = null;
        setTimeout(() => {
          this.selectedServiceId = this.DEFAULT_SERVICE_ID;
        });
      },

      // update currentService when selectedServiceId is changed
      selectedServiceId: function (serviceId, oldValue) {
        if (null == serviceId) {
          return;
        }
        let target = null;
        this.currentServiceList.some(it => {
          if (it.id == serviceId) {
            target = it;
          }
          return target;
        });
        if (!target) {
          return;
        }
        this.selectedService = target;
        this.changeVersion(this.selectedAPP, this.selectedProfileId, target);
      },
    },
    methods: {
      initDataStatus() {
        this.appList = [];
        this.selectedAppId = '';
        this.currentProfileList = [];
        this.selectedProfileId = this.$storeHelper.SERVICE_ID_FOR_NULL;
        this.currentServiceList = [];
        this.selectedServiceId = this.$storeHelper.SERVICE_ID_FOR_NULL;
      },
      /**
       * this function is the start point of watcher chain
       * the start of watcher chain: appId -> profileId -> serviceId
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
            console.log('该团队应用列表为空，某些操作可能无法正常进行');
          }
          // the sequence of getting default appId:
          // 1. customConfig.appId if customConfig exist
          // 2. first element of appList
          let defaultAppID = null;
          if (this.customConfig && this.customConfig.hasOwnProperty('appId')) {
            defaultAppID = this.customConfig['appId'];
            // customConfig can only use once
            delete this.customConfig['appId'];
          }
          // change selectedAppId in next tick to make sure value change can be watched
          setTimeout(() => {
            if (defaultAppID && this.$storeHelper.getAppInfoByID(defaultAppID)) {
              this.selectedAppId = defaultAppID;
            } else {
              this.selectedAppId = this.appList.length > 0 ? this.appList[0]['appId'] : this.$storeHelper.APP_ID_FOR_NULL;
            }
          });
        }
      },
      onSelectedAppIdChanged (appId, oldValue) {
        const appInfo = this.$storeHelper.getAppInfoByID(appId);
        if (!appInfo) {
          // emit 'version-selected' even selectedApp is null
//          this.changeVersion(null, null, null);
          return;
        }
        this.selectedAPP = appInfo['app'];
        this.currentProfileList = this.$storeHelper.profileListOfGroup;

        if (!Array.isArray(this.currentProfileList) || this.currentProfileList.length === 0) {
          // changeVersion even the length of profileList is zero
          this.changeVersion(this.selectedAPP, null, null);
          return;
        }

        // set default profileId
        // if value of selectedProfileId is null(at the beginning of this page),
        // set default profileId as follows:
        // 1. customConfig.profileId if customConfig is not null
        // 2. currentProfileId
        // 3. first element of profileList in selectedApp
        var toProfileId = this.currentProfileList[0]['id'];
        if (this.selectedProfileId) {
          toProfileId = this.selectedProfileId;
        }
        // custom profileId
        var customProfileId = null;
        if (this.customConfig && this.customConfig.hasOwnProperty('profileId')) {
          customProfileId = this.customConfig['profileId'];
          // customConfig can only use once
          delete this.customConfig['profileId'];
          if (this.currentProfileList.find(it => it.id == customProfileId)) {
            toProfileId = customProfileId;
          }
        }

        // splash to trigger watch event of this.selectedProfileId
        this.selectedProfileId = null;
        setTimeout(() => {
          this.selectedProfileId = toProfileId;
        });
      },

      /**
       * request service list when selectedAppId or selectedProfileId is changed
       */
      requestServiceList(appId, profileId) {
        if (!appId || !profileId) {
          console.log(`appId or profileId can not be empty: ${appId}, ${profileId}`);
          return;
        }
        this.selectedServiceId = null;
        this.currentServiceList = [];

        const getServiceById = (serviceList, serviceId) => {
          let service = null;
          serviceList.some(it => {
            if (it['id'] === serviceId) {
              service = it;
            }
            return service;
          });
          return service;
        };

        // const getServiceByVersion = (serviceList, serviceVersion) => {
        //   let service = null;
        //   serviceList.some(it => {
        //     if (it['serviceVersion'] === serviceVersion) {
        //       service = it;
        //     }
        //     return service;
        //   });
        //   return service;
        // };
        this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {
          payload: {
            appId: appId,
            spaceId: profileId
          }
        }).then(resContent => {
          if (resContent.hasOwnProperty('applicationServerList')) {
            let currentServiceList = resContent['applicationServerList'];
            // get default version
            if (currentServiceList && Array.isArray(currentServiceList) && currentServiceList.length > 0) {
              this.currentServiceList = currentServiceList;
              const firstServiceId = currentServiceList[0].id;
              // set default serviceId as follows:
              // 1. customConfig.serviceId if exist
              // 2. customConfig.serviceName if exist
              // 3. first element of profileList in selectedApp
              if (this.customConfig && (this.customConfig.hasOwnProperty('serviceId') || this.customConfig.hasOwnProperty('serviceVersion'))) {
                let targetService = null;
                if (this.customConfig.hasOwnProperty('serviceId')) {
                  targetService = getServiceById(currentServiceList, this.customConfig['serviceId']);
                  // customConfig can only use once
                  delete this.customConfig['serviceId'];
                }
                // else if (this.customConfig.hasOwnProperty('serviceVersion')) {
                //   targetService = getServiceByVersion(currentServiceList, this.customConfig['serviceVersion']);
                  // customConfig can only use once
                  // delete this.customConfig['serviceVersion'];
                // }
                if (targetService) {
                  this.selectedServiceId = targetService.id;
                } else {
                  console.log('service info passed is ignored');
                  this.selectedServiceId = firstServiceId;
                }
              } else {
                this.selectedServiceId = firstServiceId;
              }
            } else {
              // changeVersion even the length of profileList is zero
              this.changeVersion(this.selectedAPP, this.selectedProfileId, null);
            }
          }
        }).catch();
      },

      /**
       * emit event for value changed
       * 1. at change of selectedServiceId
       * 2. the length of profileList is zero
       * 3. the length of serviceList is zero
       */
      changeVersion(selectedAPP, selectedProfileId, selectedService) {
        let profileInfo = this.$storeHelper.getProfileInfoByID(selectedProfileId);
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
    }
  }
</script>