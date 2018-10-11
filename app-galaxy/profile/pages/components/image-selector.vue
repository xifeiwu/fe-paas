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
      <el-select v-model="imageSelectState.autoImageValue" :disabled="this.$storeHelper.groupVersion === 'v1'"
                 :placeholder="imageInfoFromNet.autoImageList.length > 0 ? '请选择' : '无数据'">
        <el-option v-for="(item, index) in imageInfoFromNet.autoImageList"
                   :key="index" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="镜像地址" prop="customImageValue"  v-else
                  :class="['custom-image', imageSelectState.customImageType.toLowerCase()+'-image']"
    >
      <el-autocomplete
              class="inline-input"
              v-model="imageSelectState.customImageValue"
              :fetch-suggestions="querySearch"
              placeholder="输入镜像地址，包含版本"
      ></el-autocomplete>
    </el-form-item>
  </el-form>
</template>
<style lang="scss" scoped>
  .el-form {
    .el-form-item {
      &.auto-image {
        max-width: 800px;
        .el-select {
          width: 100%;
        }
      }
      &.custom-image {
        max-width: 800px;
        .el-autocomplete {
          width: 100%;
        }
        .el-select {
          width: 100%;
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
          }],
          customImageValue: [{
            required: true,
            message: '请选择打镜像方式',
          }],
        },

        imageInfoFromNet: {
          autoImageList: [],
          customImageList: [],
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
      'imageSelectState.customImage': function () {
        // update validate rules when imageSelectState.customImage is changed
        this.formRules.customImageValue[0]['required'] = this.imageSelectState.customImage;
        this.validate(valid => {
        });
      }
    },
    methods: {
      async init(infoForAddService, imageInfo) {
        if (!infoForAddService) {
          return;
        }

        this.infoForAddService = infoForAddService;
//        const {groupTag, appId, profileName} = this.infoForAddService;
        let {groupTag, appId, profileName, language, languageVersion, packageType} = this.infoForAddService;
        const results =  await this.$net.getImageRelatedInfo({
          groupTag,
          appId,
          language,
          languageVersion,
          packageType
        }, {
          groupTag,
          appId
        });
        const customImageList = results['customImageList'];
        const autoImageList = results['autoImageList'];

        this.imageInfoFromNet['autoImageList'] = [{
          label: '无',
          value: ''
        }].concat(autoImageList.map(it => {
          return {
            label: it,
            value: it,
          }
        }));
        this.imageInfoFromNet['customImageList'] = customImageList;

//        设置自动打镜像的值：
//        1. 开始设置为空（无）
//        2. 请求镜像列表后，查看传递过来的imageInfo.autoImageValue的值是否在
        this.imageSelectState.customImage = imageInfo.customImage;
        this.imageSelectState.autoImageValue = '';
        this.imageSelectState.customImageValue = '';
        if (imageInfo.customImage) {
          if (customImageList.indexOf(imageInfo.imageLocation) > -1) {
            this.imageSelectState.customImageValue = imageInfo.imageLocation;
          }
        } else {
          if (autoImageList.indexOf(imageInfo.imageLocation) > -1) {
            this.imageSelectState.autoImageValue = imageInfo.imageLocation;
          }
        }
      },

      querySearch(queryString, cb) {
        var results = [];
        if (this.imageInfoFromNet['customImageList'].length > 1) {
          results = this.imageInfoFromNet['customImageList'].filter(it => {
            return it.indexOf(queryString) > -1;
          }).map(it => {
            return {
              value: it
            }
          })
        }
        cb(results);
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