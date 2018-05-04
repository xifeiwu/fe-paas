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
                  :class="['custom-image', imageSelectState.customImageType.toLowerCase()+'-image']"
    >
      <el-input v-model="imageSelectState.customImageValue" placeholder="输入镜像地址，包含版本"></el-input>
    </el-form-item>
    <el-form-item label="基础镜像" class="auto-image" prop="autoImageValue" v-else>
      <el-select v-model="imageSelectState.autoImageValue"
                 :placeholder="imageInfoFromNet.autoImageList.length > 0 ? '请选择' : '无数据'">
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
        infoForAddService: null,
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
          autoImageValue: [{
            required: false,
            message: '请输入镜像地址',
          }],
          customImageValue: [{
            required: true,
            message: '请输入镜像地址',
          }],
        },

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
    },
    watch: {
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

      'imageSelectState.customImage': {
        immediate: true,
        handler (value) {
          this.formData.customImage = value;
        }
      },
    },
    methods: {
      init(infoForAddService, imageInfo) {
        if (!infoForAddService) {
          return;
        }
        this.infoForAddService = infoForAddService;
        this.imageSelectState.customImage = imageInfo.customImage;
        this.imageSelectState.customImageValue = null;
        this.imageSelectState.autoImageValue = null;
        this.requestImageRelatedInfo();
      },

      // get image related info from network
      requestImageRelatedInfo() {
        // check group tag
        let {groupTag, appId, profileName} = this.infoForAddService;
        this.$net.getImageRelatedInfo({
          groupTag,
          appId
        }, {
          env: profileName,
          applicationId: appId,
          groupTag: groupTag
        }, {
          groupTag: groupTag
        }).then(imageInfoFromNet => {
          this.imageInfoFromNet = imageInfoFromNet;
//          if (imageInfoFromNet && imageInfoFromNet.hasOwnProperty('privateAppList')
//            && Array.isArray(imageInfoFromNet.privateAppList) && imageInfoFromNet.privateAppList.length > 0) {
//            this.imageSelectState.currentPrivateApp = imageInfoFromNet.privateAppList[0];
//          }
        }).catch(err => {
          console.log(err);
        })
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