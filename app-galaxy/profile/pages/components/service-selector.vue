<template>
  <div class="paas-service-selector">
    <div class="item">
      <label>应用名称:</label>
      <el-select class="app-list" filterable v-model="selected.appId" size="mini" placeholder="请选择">
        <el-option v-for="(item, index) in appModelListOfGroup" :key="index" :label="item.appName" :value="item.appId">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label>运行环境:</label>
      <el-select class="profile-list" v-model="selected.profileId" placeholder="请选择" size="mini"  :disabled="fixedInfo.type === 'profile'">
        <el-option v-for="(item, index) in profileListOfGroup" :key="index" :label="item.description" :value="item.id">
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
  import {mapGetters} from 'vuex';
  export default {
    created() {
    },
    mounted() {
      if (Array.isArray(this.appModelListOfGroup) && this.appModelListOfGroup.length > 0) {
        this.onAppModelListOfGroup(this.appModelListOfGroup);
      }
      if (Array.isArray(this.profileListOfGroup) && this.profileListOfGroup.length > 0) {
        this.onProfileListOfGroup(this.profileListOfGroup);
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
      appModelListOfGroup() {
        if (this.$storeHelper.appModelListOfGroup.length === 0) {
          return [];
        }
        if (this.addItemAll.app) {
          return [this.appItemAll].concat(this.$storeHelper.appModelListOfGroup);
        } else {
          return this.$storeHelper.appModelListOfGroup;
        }
      },
      profileListOfGroup() {
        if (this.$storeHelper.profileListOfGroup.length === 0) {
          return [];
        }
        if (this.addItemAll.profile) {
          return [this.profileItemAll].concat(this.$storeHelper.profileListOfGroup);
        } else {
          return this.$storeHelper.profileListOfGroup;
        }
      }
    },
    watch: {
      'selected.appId': 'selectChange',
      'selected.profileId': 'selectChange',
      appModelListOfGroup: 'onAppModelListOfGroup',
      profileListOfGroup: 'onProfileListOfGroup'
    },
    methods: {
      onAppModelListOfGroup(appModelListOfGroup) {
        if (!Array.isArray(appModelListOfGroup) || appModelListOfGroup.length === 0) {
          console.log('appModelListOfGroup data error!');
          return;
        }
        const appModel = appModelListOfGroup.find(it => it.appId == this.selected.appId);
        if (!appModel) {
          this.selected.appId = appModelListOfGroup[0].appId;
        }
      },

      onProfileListOfGroup(profileListOfGroup) {
        if (!Array.isArray(profileListOfGroup) || profileListOfGroup.length === 0) {
          console.log('profileListOfGroup data error!');
          return;
        }
        const profileInfo = profileListOfGroup.find(it => it.id == this.selected.profileId);
        if (!profileInfo) {
          this.selected.profileId = profileListOfGroup[0].id;
        }
      },

      getSelected() {
        const appModel =  (Array.isArray(this.appModelListOfGroup) && this.appModelListOfGroup.length > 0) ?
          this.appModelListOfGroup.find(it => it.appId == this.selected.appId) : null;
        const profileInfo = (Array.isArray(this.profileListOfGroup) && this.profileListOfGroup.length > 0) ?
          this.profileListOfGroup.find(it => it.id == this.selected.profileId) : null;
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