<template>
  <div class="paas-service-selector">
    <div class="item">
      <label>应用名称:</label>
      <el-select class="app-list" filterable v-model="selected.appId" size="mini" placeholder="请选择">
        <el-option v-for="(item, index) in appModelList" :key="index" :label="item.appName" :value="item.appId">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label>运行环境:</label>
      <el-select class="profile-list" v-model="selected.profileId" placeholder="请选择" size="mini" :disabled="disabled.profile">
        <el-option v-for="(item, index) in profileList" :key="index" :label="item.description" :value="item.id">
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .paas-service-selector {
    font-size: 14px;
    .item {
      display: inline-block;
      margin-right: 3px;
      .el-select.app-list {
        width: 220px;
      }
      .el-select.profile-list {
        width: 140px;
      }
    }
  }
</style>

<script>
  export default {
    created() {
    },
    mounted() {
      if (Array.isArray(this.$storeHelper.appModelListOfGroup) && this.$storeHelper.appModelListOfGroup.length > 0) {
        this.onAppModelListOfGroup(this.$storeHelper.appModelListOfGroup);
      }
      if (Array.isArray(this.$storeHelper.profileListOfGroup) && this.$storeHelper.profileListOfGroup.length > 0) {
        this.onProfileListOfGroup(this.$storeHelper.profileListOfGroup);
      }
    },
    props: {
      selected: {
        type: Object,
        default() {
          return {
            appId: this.$storeHelper.APP_ID_FOR_NULL,
            profileId: this.$storeHelper.PROFILE_ID_FOR_NULL
          }
        }
      },
      addItemAll: {
        type: Object,
        default() {
          return {
            app: false,
            profile: false
          }
        }
      },
      disabled: {
        type: Object,
        default() {
          return {
            app: false,
            profile: false
          }
        }
      }
    },
    data() {
      return {
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
        },
        appModelList: [],
        profileList: []
      }
    },
    computed: {
    },
    watch: {
      'selected.appId': 'selectChange',
      'selected.profileId': 'selectChange',
      '$storeHelper.appModelListOfGroup': 'onAppModelListOfGroup',
      '$storeHelper.profileListOfGroup': 'onProfileListOfGroup'
    },
    methods: {
      onAppModelListOfGroup(appModelListOfGroup) {
        if (!Array.isArray(appModelListOfGroup)) {
          return;
        }
        if (appModelListOfGroup.length === 0) {
          console.log('appModelListOfGroup is zero!');
          this.$message.warning('当前团队应用数为0，请先创建应用再进行后续操作。');
          return;
        }
        if (this.addItemAll.app) {
          this.appModelList = [this.appItemAll].concat(appModelListOfGroup);
        } else {
          this.appModelList = appModelListOfGroup;
        }
        const appModel = this.appModelList.find(it => it.appId == this.selected.appId);
        if (!appModel) {
          this.selected.appId = this.appModelList[0].appId;
        }
      },

      onProfileListOfGroup(profileListOfGroup) {
        if (!Array.isArray(profileListOfGroup)) {
          return;
        }
        if (profileListOfGroup.length === 0) {
          console.log('profileListOfGroup is zero!');
          return;
        }
        if (this.addItemAll.profile) {
          this.profileList = [this.profileItemAll].concat(profileListOfGroup);
        } else {
          this.profileList = profileListOfGroup;
        }

        const profileInfo = this.profileList.find(it => it.id == this.selected.profileId);
        if (!profileInfo) {
          this.selected.profileId = this.profileList[0].id;
        }
      },

      getSelected() {
        const appModel =  (Array.isArray(this.appModelList) && this.appModelList.length > 0) ?
          this.appModelList.find(it => it.appId == this.selected.appId) : null;
        const profileInfo = (Array.isArray(this.profileList) && this.profileList.length > 0) ?
          this.profileList.find(it => it.id == this.selected.profileId) : null;
        return this.$utils.cloneDeep({appModel, profileInfo});
      },

      selectChange() {
        this.$emit('service-selected', {
          appId: this.selected.appId,
          profileId: this.selected.profileId
        });
      },
    }
  }
</script>