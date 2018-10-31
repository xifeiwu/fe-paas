<template>
  <el-form :model="imageSelectState"
           :rules="formRules" label-width="120px" size="mini" ref="the-form">
    <el-form-item label="镜像方式" prop="customImage">
      <el-radio-group v-model="imageSelectState.customImage">
        <el-radio :label="false">自动打镜像</el-radio>
        <el-radio :label="true">自定义镜像</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="基础镜像" class="auto-image" prop="autoImageValue" v-if="!imageSelectState.customImage">
      <el-select v-model="imageSelectState.autoImageValue"
                 :placeholder="imageInfoFromNet.autoImageList.length > 0 ? '请选择' : '无数据'">
        <el-option v-for="(item, index) in imageInfoFromNet.autoImageList"
                   :key="index" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="镜像地址" prop="customImageValue"  v-else
                  :class="['custom-image', imageSelectState.customImageType.toLowerCase()+'-image']"
    >
      <el-input v-model="imageSelectState.customImageValue" placeholder="输入镜像地址，包含版本"></el-input>
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
        payload4RequestImageList: null,
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
    },
    methods: {
      init(payload4RequestImageList, imageInfo) {
        if (!payload4RequestImageList) {
          return;
        }
        this.payload4RequestImageList = payload4RequestImageList;
        this.imageSelectState.customImage = imageInfo.customImage;
        if (imageInfo.customImage) {
          this.imageSelectState.customImageValue = imageInfo.imageLocation;
          this.imageSelectState.autoImageValue = '';
        } else {
          this.imageSelectState.customImageValue = '';
          this.imageSelectState.autoImageValue = '';
        }
        this.requestImageRelatedInfo().then((autoImageList) => {
          this.imageInfoFromNet['autoImageList'] = [{
            label: '无',
            value: ''
          }].concat(autoImageList.map(it => {
            return {
              label: it,
              value: it,
            }
          }));

//          设置自动打镜像的值：
//          1. 开始设置为空（无）
//          2. 请求镜像列表后，查看传递过来的imageInfo.autoImageValue的值是否在
//          this.setAutoImageValue(imageInfo);
          if (!imageInfo.customImage && autoImageList.indexOf(imageInfo.imageLocation) > -1) {
            this.imageSelectState.autoImageValue = imageInfo.imageLocation;
          }
        })
      },

      // get image related info from network
      async requestImageRelatedInfo() {
        // check group tag
        let {groupTag, appId, profileName, language, languageVersion, packageType} = this.payload4RequestImageList;
        const autoImageList =  await this.$net.getImageRelatedInfo({
          groupTag,
          appId,
          language,
          languageVersion,
          packageType
        }, {
          env: profileName,
          applicationId: appId,
          groupTag: groupTag
        }, {
          groupTag: groupTag
        });
        return autoImageList;
//        if (imageInfoFromNet && imageInfoFromNet.hasOwnProperty('privateAppList')
//          && Array.isArray(imageInfoFromNet.privateAppList) && imageInfoFromNet.privateAppList.length > 0) {
//          this.imageSelectState.currentPrivateApp = imageInfoFromNet.privateAppList[0];
//        }
      },

      getImageInfo() {
        const imageSelectState = this.imageSelectState;
        return {
          customImage: imageSelectState.customImage,
          imageLocation: imageSelectState.customImage ? imageSelectState.customImageValue : imageSelectState.autoImageValue
        }
      },

      validate(cb) {
        this.$refs['the-form'].validate(cb);
      }
    }
  }
</script>