<template>
  <div id="app-add">
    <el-form :model="createAppForm" :rules="rules" size="mini"
             ref="createAppForm" label-width="100px"
             v-loading="showLoading"
             :element-loading-text="loadingText">
      <el-form-item label="团队" prop="groupID">
        <el-select v-model="$storeHelper.currentGroupID" placeholder="请选择">
          <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="应用名称" prop="appName">
        <el-input v-model="createAppForm.appName" placeholder="中文，英文，数字，下划线，中划线。2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="createAppForm.projectName" placeholder="字母、数字、下划线和中划线。2-50个字符"></el-input>
      </el-form-item>
      <el-form-item label="运行环境" prop="profiles" class="profiles">
        <el-checkbox-group v-model="createAppForm.profiles">
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
        <el-input v-model="createAppForm.healthCheck" placeholder="以/开头，可以包含字母、数字、下划线、中划线。2-50个字符"></el-input>
      </el-form-item>
      <el-form-item label="文件存储" prop="fileLocation" class="fileLocation" v-if="false">
          <el-tag
            v-for="tag in createAppForm.fileLocation"
            :key="tag"
            size="small"
            closable
            type="success"
            @close="handleFileLocation('remove', tag)"
          >{{tag}}</el-tag>
        <el-input v-model="fileLocationToAdd" placeholder="以/开头，可以包含字母、数字、下划线、中划线。2-18个字符。最多可以添加五个">
          <template slot="append">
            <el-button type="primary" class="add-file-location-btn" @click="handleFileLocation('add', fileLocationToAdd)">
              添加
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="滚动升级" prop="rollingUpdate">
        <el-radio-group v-model="createAppForm.rollingUpdate">
          <el-radio :label="true">需要</el-radio>
          <el-radio :label="false">不需要</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="负载均衡" prop="loadBalance">
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
    margin: 20px 20px 20px 30px;
    padding: 30px 20px 20px 20px;
    width: 80%;
    max-width: 600px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    .el-form {
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
            color: white;
            background-color: #409EFF;
            margin: 0px;
            width: 60px;
            padding: 7px 15px 8px 15px;
            border-width: 0px;
            border-radius: 0px;
            &:hover {
              background-color: #79bbff;
              font-weight: bold;
            }
          }
        }
      }
    }
  }
</style>
<script>
  import appPropUtil from '../utils/app-props';
  import StoreHelper from '../utils/store-helper.vue';
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
        groupID: this.$storeHelper.currentGroupID,
        appName: '',
        projectName: '',
        profiles: [],
        language: '',
        languageVersion: '',
        buildType: 'NO',
        healthCheck: '',
        fileLocation: [],
        rollingUpdate: true,
        loadBalance: appPropUtil.getAllLoadBalance()[0],
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
    loadBalanceType() {
      return appPropUtil.getAllLoadBalance();
    },
  },
  watch: {
    languageInfo: 'onLanguageInfo',
    profileListOfGroup: 'onProfileListOfGroup',
    '$storeHelper.currentGroupID': function (groupID) {
      this.createAppForm.groupID = groupID;
    }
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

    // 增删文件存储
    handleFileLocation(action, tag) {
      let fileLocationList = this.createAppForm.fileLocation;
      switch (action) {
        case 'add':
          tag = tag.trim();
          let reg = /^\/[A-Za-z0-9_\-\.@]{1,49}$/;
          if (!reg.exec(tag)) {
            this.$message.warning('以/开头，可包含字母、数字、下划线、中划线。2-50位字符。');
            return;
          }
          if (fileLocationList.length >= 5) {
            this.$message.warning('最多只能添加五个路径');
            return;
          }
          if (tag.length > 0) {
            if (fileLocationList.indexOf(tag) > -1) {
              this.$message.warning('该文件存储已存在！');
            } else {
              fileLocationList.push(tag);
              this.fileLocationToAdd = '';
            }
          }
          break;
        case 'remove':
          fileLocationList.splice(fileLocationList.indexOf(tag), 1);
          break;
      }
    },
    handleFinish() {
//      console.log(this.createAppForm);
      var self = this;
      this.$refs['createAppForm'].validate((valid) => {
        if (valid) {
          this.createAppForm.groupID = this.$storeHelper.currentGroupID;
          let toPost = appPropUtil.changePropNameForServer(this.createAppForm);
//          console.log('toPost');
//          console.log(toPost);
          this.showLoading = true;
          this.loadingText = '正在为您创建应用' + toPost.appName;
          this.$net.createAPP(toPost).then((content) => {
            this.showLoading = false;
            // update appInfoList after create app success
            this.$store.dispatch('user/appInfoListOfGroup', {
              from: 'page/app/add',
              groupID: this.$storeHelper.currentGroupID
            });
            this.$message({
              type: 'success',
              message: '应用' + toPost.appName + '创建成功！'
            });
            this.$router.push('/profile/app');
          }).catch((err) => {
            self.showLoading = false;
            this.$notify.error({
              title: err.title,
              message: err.msg,
              duration: 0,
              onClose: function () {
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