<template>
  <el-form :model="imageSelectState"
           :rules="formRules" label-width="120px" size="mini" ref="the-form">
    <el-form-item label="镜像方式" prop="customImage">
      <el-radio-group v-model="imageSelectState.customImage">
        <el-radio :label="false">自动打镜像</el-radio>
        <el-radio :label="true">自定义镜像</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="镜像地址" prop="customImageValue" v-if="imageSelectState.customImage"
                  class="custom-image" :class="imageSelectState.customImageType.toLowerCase()+'-image'"
    >
      <el-select v-model="imageSelectState.customImageType">
        <el-option v-for="(item, index) in customImageTypeList"
                   :key="index" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select v-model="imageSelectState.customImageValue" v-if="imageSelectState.customImageType=='ENV'"
                 :placeholder="this.imageInfoFromNet.customEnvImageList.length > 0 ? '请选择' : '无数据'">
        <el-option v-for="(item, index) in imageInfoFromNet.customEnvImageList"
                   :key="index" :label="item.imageName" :value="item.imageName">
        </el-option>
      </el-select>
      <el-select v-model="imageSelectState.currentPrivateApp" v-if="imageSelectState.customImageType=='PRIVATE'"
                 :placeholder="this.imageInfoFromNet.privateAppList.length > 0 ? '请选择' : '无数据'">
        <el-option v-for="(item, index) in imageInfoFromNet.privateAppList"
                   :key="index" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-select v-model="imageSelectState.customImageValue" v-if="imageSelectState.customImageType=='PRIVATE'"
                 :placeholder="currentPrivateAppVersionList.length > 0 ? '请选择' : '无数据'">
        <el-option v-for="(item, index) in currentPrivateAppVersionList"
                   :key="index" :label="item" :value="item">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="基础镜像" class="auto-image" prop="autoImageValue" v-else>
      <el-select v-model="imageSelectState.autoImageValue"
                 :placeholder="this.imageInfoFromNet.autoImageList.length > 0 ? '请选择' : '无数据'">
        <el-option v-for="(item, index) in imageInfoFromNet.autoImageList"
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
    },
    mounted() {
    },
    data() {
      return {
        serviceInfo: {
          appID: null,
          profileID: null
        },
        currentApp: null,
        currentProfile: null,

        formData: {
          customImage: null,
          imageLocation: null,
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

        customImageTypeList: [{
          label: '环境镜像',
          value: 'ENV'
        }, {
          label: '私有镜像',
          value: 'PRIVATE'
        }],

        imageInfoFromNet: {
          autoImageList: [],
          customEnvImageList: [],
          privateAppList: [],
        },
        imageSelectState: {
          customImage: false,
          customImageValue: '',
          autoImageValue: '',
          // type of customImage
          customImageType: 'ENV',
          // selected private app in custom-image private-image
          currentPrivateApp: '',
        },
        currentPrivateAppVersionList: [],
      }
    },
    props: {
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
      groupInfo: 'onAppInfoListOfGroup',

      // sync data from imageSelectState to formData
      'imageSelectState.customImageValue': {
        immediate: true,
        handler(value) {
          if (this.formData.customImage) {
            this.formData.imageLocation = value;
          }
        }
      },
      'imageSelectState.autoImageValue': {
        immediate: true,
        handler(value) {
          if (!this.formData.customImage) {
            this.formData.imageLocation = value;
          }
        }
      },

      'imageInfoFromNet': {
        immediate: true,
        handler (info) {
          this.updateImageSelection();
        }
      },
      'imageSelectState.customImage': {
        immediate: true,
        handler (value) {
          this.formData.customImage = value;
          this.updateImageSelection();
        }
      },
      'imageSelectState.customImageType': {
        immediate: true,
        handler (value) {
          this.updateImageSelection();
        }
      },
      'imageSelectState.currentPrivateApp': 'requestPrivateImageLocation',
    },
    methods: {
      init(serviceInfo, imageInfo) {
        if (!this.$utils.theSame(serviceInfo, this.serviceInfo)) {
          this.serviceInfo.appID = serviceInfo.appID;
          this.serviceInfo.profileID = serviceInfo.profileID;
          if (!this.appInfoListOfGroup) {
            this.$store.dispatch('user/appInfoListOfGroup', {
              from: 'page/app/add',
              groupID: this.$storeHelper.currentGroupID
            });
          } else {
            this.onAppInfoListOfGroup(this.appInfoListOfGroup);
          }
        }

        this.imageSelectState.customImage = imageInfo.customImage;
        this.imageSelectState.customImageValue = null;
        this.imageSelectState.autoImageValue = null;
      },

      onAppInfoListOfGroup(appList) {
        if (this.serviceInfo.appID) {
          this.currentApp = this.$storeHelper.getAppByID(this.serviceInfo.appID);
        } else {
          console.log('serviceInfo.appID not found');
        }
        if (this.serviceInfo.profileID) {
          this.currentProfile = this.$storeHelper.getProfileInfoByID(this.serviceInfo.profileID);
        } else {
          console.log('serviceInfo.profileID not found');
        }
        this.requestImageRelatedInfo();
      },

      requestImageRelatedInfo() {
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
        }).then(imageInfoFromNet => {
          this.imageInfoFromNet = imageInfoFromNet;
          if (imageInfoFromNet && imageInfoFromNet.hasOwnProperty('privateAppList')
            && Array.isArray(imageInfoFromNet.privateAppList) && imageInfoFromNet.privateAppList.length > 0) {
            this.imageSelectState.currentPrivateApp = imageInfoFromNet.privateAppList[0];
          }
//          console.log(this.imageInfoFromNet);
        }).catch(err => {
          console.log(err);
        })
      },

      // set default image at the change of custom-image's type
      updateImageSelection() {
        if (!this.imageSelectState.customImage) {
          this.imageSelectState.autoImageValue = '';
        } else {
          let imageInfoFromNet = this.imageInfoFromNet;
          this.imageSelectState.customImageValue = '';
          switch (this.imageSelectState.customImageType) {
            case 'ENV':
              if (imageInfoFromNet.hasOwnProperty('customEnvImageList') && imageInfoFromNet.customEnvImageList.length > 0) {
                this.imageSelectState.customImageValue = this.imageInfoFromNet.customEnvImageList[0].imageName;
              }
              break;
            case 'PRIVATE':
              if (imageInfoFromNet.hasOwnProperty('privateAppList') && imageInfoFromNet.privateAppList.length > 0) {
                this.imageSelectState.currentPrivateApp = this.imageInfoFromNet.privateAppList[0];
              }
              break;
          }
        }
      },

      requestPrivateImageLocation(value) {
        this.currentPrivateAppVersionList = [];
        this.$net.getVersionListOfAppInCustomImage({
          projectName: value
        }).then(versionList => {
          this.currentPrivateAppVersionList = versionList;
          if (this.currentPrivateAppVersionList.length > 0) {
//            this.formData.customImageValue = this.currentPrivateAppVersionList[0];
          }
        });
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