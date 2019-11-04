<template>
  <div class="paas-service-selector">
    <div class="item">
      <label>应用名称:</label>
      <el-select class="app-name" filterable v-model="selectedAppId" placeholder="请选择">
        <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.appName" :value="item.appId">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label>运行环境:</label>
      <el-select v-model="selectedProfileId" placeholder="请选择" :disabled="fixedInfo.type === 'profile'">
        <el-option v-for="item in profileList" :key="item.id" :label="item.description" :value="item.id">
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<style lang="scss">
  .paas-service-selector {
    .el-select .el-input__inner {
      height: 24px;
    }
  }
</style>
<style lang="scss" scoped>
  .paas-service-selector {
    font-size: 14px;
    .item {
      display: inline-block;
      margin-right: 3px;
      .el-select.app-name {
        min-width: 260px;
      }
    }
  }
</style>

<script>
  import {mapGetters} from 'vuex';
  export default {
    created() {
    },
    mounted() {
      // init value to make sure 'service-selected' is emitted at start
      this.initDataStatus();
//      console.log(this.appInfoListOfGroup);
//      console.log(this.profileListOfGroup);
      if (this.appInfoListOfGroup) {
        this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      }
      if (this.profileListOfGroup) {
        this.onProfileListOfGroup(this.profileListOfGroup);
      }
    },
    props: {
      customConfig: Object,
      addItemAll: {
        type: Object,
        default() {
          return {
            app: false,
            profile: false
          }
        }
      },
      fixedInfo: {
        type: Object,
        default() {
          return {
            type: null,
            id: null,
          }
        }
      },
    },
    data() {
      return {
        appList: [],
        profileList: [],

        selectedAppId: null,
        selectedAPP: null,

        // profile related
        selectedProfileId: null,
        selectedProfile: null,

        appItemAll: {
          appId: this.$storeHelper.APP_ID_FOR_ALL,
          appName: '全部'
        },
        profileItemAll: {
          description: "全部",
          id: this.$storeHelper.PROFILE_ID_FOR_ALL,
          isDefault: true,
          name: "all",
          spaceType: "ALL"
        }
      }
    },
    computed: {
      ...mapGetters('user', {
        'appInfoListOfGroup': 'appInfoListOfGroup',
        'profileListOfGroup': 'profileListOfGroup'
      }),
    },
    watch: {
      selectedAppId: 'onSelectedAppId',
      selectedProfileId: 'onSelectedProfileId',
      appInfoListOfGroup: 'onAppInfoListOfGroup',
      profileListOfGroup: 'onProfileListOfGroup'
    },
    methods: {
      initDataStatus() {
        this.selectedAppId = this.$storeHelper.APP_ID_FOR_NULL;
        this.selectedProfileId = this.$storeHelper.PROFILE_ID_FOR_NULL;
      },

      onSelectedAppId() {
        this.serviceSelected();
      },
      onSelectedProfileId() {
        this.serviceSelected();
      },
      onAppInfoListOfGroup(appInfoListOfGroup) {
        if (appInfoListOfGroup && appInfoListOfGroup.hasOwnProperty('appList')) {
          this.appList = this.appInfoListOfGroup['appList'];
          if (this.addItemAll.app) {
            this.appList = [this.appItemAll].concat(this.appList);
          }
        }

        // set default selectedAppId
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
      },

      onProfileListOfGroup(profileListOfGroup) {
        this.profileList = profileListOfGroup;
        if (this.addItemAll.profile) {
          this.profileList = [this.profileItemAll].concat(this.profileList);
        }

        // set default profileId
        var defaultProfileId = null;
        if (this.customConfig && this.customConfig.hasOwnProperty('profileId')) {
          defaultProfileId = this.customConfig['profileId'];
          delete this.customConfig['profileId'];
        }
        setTimeout(() => {
          if (defaultProfileId && this.profileList.map(it => {
              return it.id;
            }).indexOf(defaultProfileId) > -1) {
            this.selectedProfileId = defaultProfileId;
          } else {
            this.selectedProfileId = this.profileList.length > 0 ? this.profileList[0]['id'] : this.$storeHelper.PROFILE_ID_FOR_NULL
          }
        });
      },

      getSelectedInfo() {
        var selectedApp = null;
        if (this.addItemAll['app'] && this.selectedAppId === this.appItemAll['appId']) {
          selectedApp = this.appItemAll;
        } else {
          let result = this.$storeHelper.getAppInfoByID(this.selectedAppId);
          selectedApp = result ? result.app : null;
        }

        var selectedProfile = null;
        if (this.addItemAll['profile'] && this.selectedProfileId === this.profileItemAll['id']) {
          selectedProfile = this.profileItemAll;
        } else {
          selectedProfile = this.$storeHelper.getProfileInfoByID(this.selectedProfileId);
        }
        return this.$utils.cloneDeep({selectedApp, selectedProfile});
      },

      serviceSelected() {
        const selectedInfo = this.getSelectedInfo();
        this.$emit('service-selected',
          this.$utils.cloneDeep(selectedInfo.selectedApp),
          this.$utils.cloneDeep(selectedInfo.selectedProfile)
        );
      },
    }
  }
</script>