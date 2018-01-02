<template>
  <div id="app-add">
    <el-form :model="createAppForm" :rules="rules"
             ref="createAppForm" label-width="100px" size="mini"
             v-loading="showLoading"
             :element-loading-text="loadingText">
      <el-form-item label="团队">
        <el-select v-model="currentGroupID" placeholder="请选择" @input="handleGroupIDChange">
          <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="应用名称" prop="appName">
        <el-input v-model="createAppForm.appName" placeholder="中文，英文，数字，30字符内"></el-input>
      </el-form-item>
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="createAppForm.projectName" placeholder="gitlab中project的名称"></el-input>
      </el-form-item>
      <el-form-item label="运行环境" prop="profiles" class="profiles">
        <el-checkbox-group v-model="createAppForm.profiles" @change="handleProfileChange">
          <el-checkbox v-for="item in profileListOfGroup" :label="item.name" :key="item.name">
            {{item.description}}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="开发语言" prop="language">
        <el-radio-group v-model="createAppForm.language" @change="handleLanguageChange">
          <el-radio v-for="item in language.list" :label="item.type" :key="item.id">
            {{item.language}}
          </el-radio>
          <!--<el-radio label="JAVA"></el-radio>-->
          <!--<el-radio label="NODE_JS"></el-radio>-->
          <!--<el-radio label="PHP"></el-radio>-->
        </el-radio-group>
      </el-form-item>

      <el-form-item label="语言版本" prop="languageVersion">
        <el-radio-group v-model="createAppForm.languageVersion"
                        @change="handleVersionChange">
          <el-radio v-for="item in language.versionList" :label="item.version" :key="item.version">
            {{item.version}}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="构建类型" prop="buildType" v-if="language.buildTypeList.length > 0">
        <el-radio-group v-model="createAppForm.buildType">
          <el-radio v-for="item in language.buildTypeList" :label="item.type" :key="item.type">
            {{item.packageType}}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="健康检查" prop="healthCheck">
        <el-input v-model="createAppForm.healthCheck" placeholder="以/开头，可以包含字母数字下划线中划线，2-50位"></el-input>
      </el-form-item>
      <el-form-item label="文件存储" prop="fileLocation" class="fileLocation">
        <div>
          <el-tag
                  v-for="tag in createAppForm.fileLocation"
                  :key="tag"
                  closable
                  type="success"
                  @close="handleRemoveFileLocation(tag)"
          >{{tag}}</el-tag>
        </div>
        <el-input v-model="fileLocationToAdd" placeholder="以/开头，可以包含字母数字下划线中划线，2-18位">
          <template slot="append">
            <el-button type="primary" class="add-file-location-btn" @click="handleAddFileLocation(fileLocationToAdd)">
              添加
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="滚动升级">
        <el-radio-group v-model="createAppForm.rollingUpdate">
          <el-radio :label="true">需要</el-radio>
          <el-radio :label="false">不需要</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="负载均衡">
        <el-radio-group v-model="createAppForm.loadBalance">
          <el-radio v-for="item in loadBalanceType" :label="item" :key="item"></el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item class="finish" labelWidth="0">
          <el-button type="primary" @click="handleFinish">完成</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style>
  .onePercentLineHeight {
    line-height: 100%;
  }
</style>
<style lang="scss" scoped>
  #app-add {
    .el-form {
      margin: 30px auto 0px auto;
      width: 80%;
      max-width: 550px;
      .el-form-item {
        &.profiles {
          .el-checkbox + .el-checkbox {
            margin-left: 20px;
          }
        }
        &.finish {
          .el-button {
            display: block;
            margin: 0px auto;
            width: 50%;
            max-width: 200px;
            text-align: center;
          }
        }
        &.fileLocation {
          .add-file-location-btn {
            margin: 0px;
            width: 60px;
            background-color: lavenderblush;
            border-radius: 0px;
            &:hover {
              font-weight: bold;
              color: #409EFF;
            }
          }
        }
      }
    }
  }
</style>
<script>
  import appPropUtil from '../utils/app_prop';
  import StoreHelper from '../utils/store_helper.vue';
export default {
  mixins: [StoreHelper],
  created() {
    this.onLanguageInfo(this.languageInfo, null);
    this.onProfileListOfGroup(this.profileListOfGroup, null);
  },
  mounted() {
  },
  data() {
    return {
      fileLocationToAdd: '',
      createAppForm: {
        groupID: '',
        appName: '',
        projectName: '',
        profiles: [],
        language: '',
        languageVersion: '',
        buildType: 'NO',
        healthCheck: '',
        fileLocation: [],
        rollingUpdate: true,
        loadBalance: 'Round_robin',
      },
      rules: appPropUtil.rules,
      language: {
        selected: null,
        list: [],
        versionList: [],
        buildTypeList: []
      },

      showLoading: false,
      loadingText: '',
    };
  },
  computed: {
    currentGroupID: {
      get() {
        if ('' === this.createAppForm.groupID) {
          this.createAppForm.groupID = this.$store.getters['user/groupID'];
        }
        return this.createAppForm.groupID;
      },
      set(value) {
        this.createAppForm.groupID = value;
        this.$store.dispatch('user/groupID', {
          value,
          from:'add_app/step1'
          }
        );
      }
    },
    loadBalanceType() {
      return appPropUtil.getAllLoadBalance();
    },
  },
  watch: {
    languageInfo: 'onLanguageInfo',
    profileListOfGroup: 'onProfileListOfGroup',
  },
  methods: {
    onLanguageInfo: function(value, oldValue) {
      // set java language as default
      this.setDefaultLanguage(value);
    },
    onProfileListOfGroup: function (value, oldValue) {
      if (Array.isArray(value)) {
        this.createAppForm.profiles = value.map(it => {
          return it.name;
        });
      }
    },
    handleGroupIDChange: function(groupID) {
//      this.requestAPPList(groupID, 1, 8, '');
    },
    handleProfileChange: function () {
//      console.log(this.createAppForm.profiles);
    },
    setDefaultLanguage: function (languageList) {
      if (Array.isArray(languageList) && languageList.length > 0) {
        let defaultLanguage = languageList[0];
        this.createAppForm.language = defaultLanguage.type;
        this.language.list = languageList;
        this.handleLanguageChange(defaultLanguage.type);
      }
    },
    handleLanguageChange: function (languageType) {
      if (Array.isArray(this.languageInfo)) {
        // get language info from languageList by language type
        this.languageInfo.some(it => {
          if (it.hasOwnProperty('type') && it.type === languageType) {
            this.language.selected = it;
//            console.log(it);
            this.language.versionList = it['languageVersionList'];
            if (Array.isArray(this.language.versionList) && this.language.versionList.length > 0) {
              this.createAppForm.languageVersion = this.language.versionList[0].version;
              this.handleVersionChange(this.createAppForm.languageVersion);
            }
          }
        })
      }
    },
    handleVersionChange: function (version) {
      let versionList = this.language.versionList;
//      console.log(versionList);
      Array.isArray(versionList) && versionList.some(it => {
//        console.log(it);
        if (version == it.version) {
          if (1 === it.packageTypeList.length && 'NO' === it.packageTypeList[0].type){
            this.language.buildTypeList = [];
            this.createAppForm.buildType = 'NO';
          } else {
            this.language.buildTypeList = it.packageTypeList;
            this.createAppForm.buildType = it.packageTypeList[0].type;
          }
          return true;
        }
      });
    },
    handleRemoveFileLocation(tag) {
      let items = this.createAppForm.fileLocation;
      items.splice(items.indexOf(tag), 1);
    },
    handleAddFileLocation(tag) {
      let tagLength = tag.length;
      if (tagLength < 2 || tagLength > 18) {
        this.$message.error('长度在2到18个字符');
        return;
      }
      if (!/^\/[A-Za-z0-9_\-]+$/.exec(tag)) {
        this.$message.error('以/开头，可以包含字母数字下划线中划线');
        return;
      }
      if (tag.length > 0) {
        this.createAppForm.fileLocation.push(tag);
        this.fileLocationToAdd = '';
      }
    },
    handleFinish() {
      console.log(this.createAppForm);
      this.$refs['createAppForm'].validate((valid) => {
        if (valid) {
          this.$store.dispatch('app/addCreateAPPInfo', {
             key: 'page1',
             value: this.createAppForm
          });
          let toPost = this.$store.getters['app/infoForCreateAppToPost'];
//          console.log('toPost');
//          console.log(toPost);
          this.showLoading = true;
          this.loadingText = '正在为您创建应用' + toPost.serviceName;
          this.$net.createAPP(toPost).then((content) => {
            this.showLoading = false;
            // update appInfoList after create app success
            this.$store.dispatch('user/appInfoListOfGroup', {
              from: 'page/app/add',
              groupID: this.currentGroupID
            });

            this.$message({
              type: 'success',
              message: '应用' + toPost.serviceName + '创建成功！'
            });
            this.$router.push('/profile/app');
          }).catch((err) => {
            this.$notify({
              title: '提示',
              message: err,
              duration: 0,
              onClose: function () {
                self.showLoading = false;
                self.$router.push('/profile/app/add');
              }
            });
            console.log(err);
          });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  }
}
</script>