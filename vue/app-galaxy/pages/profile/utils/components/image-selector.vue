<template>
  <el-form :model="formData"
           :rules="formRules" label-width="120px" size="mini" ref="the-form">
    <el-form-item label="镜像方式" prop="customImage">
      <el-radio-group v-model="formData.customImage">
        <el-radio :label="false">自动打镜像</el-radio>
        <el-radio :label="true">自定义镜像</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="镜像地址" prop="customImageValue" v-if="formData.customImage"
                  class="custom-image" :class="customImageType.toLowerCase()+'-image'"
    >
      <el-select v-model="customImageType">
        <el-option v-for="(item, index) in customImageTypeList"
                   :key="index" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select v-model="formData.customImageValue" v-if="customImageType=='ENV'"
                 :placeholder="this.imageRelatedInfo.customEnvImageList.length > 0 ? '请选择' : '加载中'">
        <el-option v-for="(item, index) in imageRelatedInfo.customEnvImageList"
                   :key="index" :label="item.imageName" :value="item.imageName">
        </el-option>
      </el-select>
      <el-select v-model="currentPrivateApp" v-if="customImageType=='PRIVATE'"
                 :placeholder="this.imageRelatedInfo.privateAppList.length > 0 ? '请选择' : '加载中'">
        <el-option v-for="(item, index) in imageRelatedInfo.privateAppList"
                   :key="index" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-select v-model="formData.customImageValue" v-if="customImageType=='PRIVATE'"
                 :placeholder="currentPrivateAppVersionList.length > 0 ? '请选择' : '加载中'">
        <el-option v-for="(item, index) in currentPrivateAppVersionList"
                   :key="index" :label="item" :value="item">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="基础镜像" class="auto-image" prop="autoImageValue" v-else>
      <el-select v-model="formData.autoImageValue"
                 :placeholder="this.imageRelatedInfo.autoImageList.length > 0 ? '请选择' : '加载中'">
        <el-option v-for="(item, index) in imageRelatedInfo.autoImageList"
                   :key="index" :label="item" :value="item">
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>
<style lang="scss" scoped>
  .el-form {
    width: 600px;
    .el-form-item {
      &.auto-image {
        .el-select {
          width: 100%;
        }
      }
      &.custom-image {
        &.env-image {
          .el-select {
            width: calc(50% - 2px);
          }
        }
        &.private-image {
          .el-select {
            box-sizing: border-box;
            width: calc(50% - 2px);
            &:nth-child(3) {
              width: 100%;
            }
          }
        }
      }
    }
  }
</style>
<script>
  export default {
    created() {
      if (!this.appInfoListOfGroup) {
        this.$store.dispatch('user/appInfoListOfGroup', {
          from: 'page/app/add',
          groupID: this.$storeHelper.currentGroupID
        });
      } else {
        this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      }
      // as groupInfo is store in localStorage,
      // so some performance is different from appInfoListOfGroup
      this.onGroupInfo(this.groupInfo);
    },
    mounted() {
      if (this.imageInfo) {
        if (this.imageInfo.hasOwnProperty('customImage')) {
          this.formData.customImage = this.imageInfo.customImage
        }
      }
    },
    data() {
      return {
        currentApp: null,
        currentProfile: null,

        formData: {
          customImage: false,
          customImageValue: '',
          autoImageValue: '',
        },
        formRules: {
          // 镜像方式
          customImage: [{
            required: true,
            message: '请选择打镜像方式',
          }],
          // 镜像方式
          imageTypeID: [{
            required: true,
            message: '请选择打镜像方式',
          }],
          autoImageValue: [{
            required: false,
            message: '请输入镜像地址',
          }],
          customImageValue: [{
            required: true,
            message: '请输入镜像地址',
          }],
        },

        customImageType: 'ENV',
        customImageTypeList: [{
          label: '环境镜像',
          value: 'ENV'
        }, {
          label: '私有镜像',
          value: 'PRIVATE'
        }],

        imageRelatedInfo: {
          autoImageList: [],
          customEnvImageList: [],
          privateAppList: [],
        },
        currentPrivateApp: '',
        currentPrivateAppVersionList: [],
      }
    },
    props: {
      serviceInfo: {
        type: Object,
        default() {
          return {
            appID: 82,
            profileID: 1
          };
        }
      },
      imageInfo: {
        type: Object
      }
    },
    computed: {
      groupInfo() {
        return this.$storeHelper.groupInfo();
      },
      appInfoListOfGroup() {
        return this.$storeHelper.appInfoListOfGroup();
      },
    },
    watch: {
      appInfoListOfGroup: 'onAppInfoListOfGroup',
      groupInfo: 'onGroupInfo',
      'currentPrivateApp': 'requestPrivateImageLocation',
      customImageType: {
        immediate: true,
        handler() {
          this.formData.customImageValue = '';
        }
      },
      'formData.customImageValue': 'onImageLocation',
      'formData.autoImageValue': 'onImageLocation',
    },
    methods: {
      onAppInfoListOfGroup(appList) {
        console.log(appList);
        if (this.serviceInfo.appID) {
          this.currentApp = this.$storeHelper.getAppByID(this.serviceInfo.appID);
        }
        if (this.serviceInfo.profileID) {
          this.currentProfile = this.$storeHelper.getProfileInfoByID(this.serviceInfo.profileID);
        }
        this.requestImageRelatedInfo();
      },
      onGroupInfo(groupInfo) {
        if (groupInfo) {
          this.requestImageRelatedInfo();
        }
      },

      requestImageRelatedInfo() {
        console.log(this.currentApp);
        if (!this.currentApp || !this.currentProfile || !this.groupInfo || !this.serviceInfo) {
          console.log('data is not complete');
          return;
        }
        // check group tag
        if (!this.groupInfo.hasOwnProperty('tag')) {
          console.log('groupTag not found');
          return;
        }
        // check language
        if (!this.currentApp.hasOwnProperty('language')) {
          console.log('language not found');
          return;
        }
        // check spaceId
        if (!this.serviceInfo.appID || !this.serviceInfo.profileID) {
          console.log('appID or profileID not found')
          return;
        }
        // check profile name
        if (!this.currentProfile.hasOwnProperty('name')) {
          console.log('profileName not found');
          return;
        }

        let groupTag = this.groupInfo.tag;
        let language = this.currentApp.language.toLowerCase();
        let profileName = this.currentProfile.name;
        this.$net.getImageRelatedInfo({
          groupTag: groupTag,
          language: 'ph' + language
        }, {
          env: profileName,
          applicationId: this.serviceInfo.appID,
          groupTag: groupTag
        }, {
          groupTag: groupTag
        }).then(imageRelatedInfo => {
          this.imageRelatedInfo = imageRelatedInfo;
          if (imageRelatedInfo && imageRelatedInfo.hasOwnProperty('privateAppList')
            && Array.isArray(imageRelatedInfo.privateAppList) && imageRelatedInfo.privateAppList.length > 0) {
            this.currentPrivateApp = imageRelatedInfo.privateAppList[0];
          }
//          console.log(this.imageRelatedInfo);
        }).catch(err => {
          console.log(err);
        })
      },

      requestPrivateImageLocation(value) {
        this.currentPrivateAppVersionList = [];
        this.$net.getVersionListOfAppInCustomImage({
          projectName: value
        }).then(versionList => {
          this.currentPrivateAppVersionList = versionList;
          if (this.currentPrivateAppVersionList.length > 0) {
            this.formData.customImageValue = this.currentPrivateAppVersionList[0];
          }
        });
      },

      onImageLocation(value) {
        this.imageInfo.customImage = this.formData.customImage;
        let imageLocation = this.formData.customImage ? this.formData.customImageValue : this.formData.autoImageValue;
        this.imageInfo.imageLocation = imageLocation;
        this.$emit('image-changed', this.formData);
      },
      getImageInfo() {
        return this.formData;
      },

      validate(cb) {
        this.$refs['the-form'].validate(cb);
      }
    }
  }
</script>