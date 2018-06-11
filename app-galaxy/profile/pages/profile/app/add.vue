<template>
  <div id="app-add">
    <div class="section-title">创建应用</div>
    <el-form :model="createAppForm" :rules="rules" size="mini"
             ref="createAppForm" label-width="110px"
             v-loading="showLoading"
             :element-loading-text="loadingText">
      <el-form-item label="团队" prop="groupID" class="group-list">
        <el-select v-model="$storeHelper.currentGroupID" placeholder="请选择" filterable>
          <el-option v-for="item in groupList" :key="item.id" :label="item.asLabel" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="应用名称" prop="appName">
        <el-input v-model="createAppForm.appName" placeholder="中文，英文，数字，下划线，中划线。2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="createAppForm.projectName"
                  placeholder="输入GitLab里的project名称。只能包含字母、数字、中划线，2-50个字符"></el-input>
      </el-form-item>
      <el-form-item label="运行环境" prop="profiles" class="profiles">
        <el-checkbox-group v-model="createAppForm.profiles" @change="onProfilesChanged">
          <el-checkbox v-for="item in $storeHelper.profileListOfGroup" :label="item.name" :key="item.name"
                       :disabled="item.description == '生产环境'">
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
      <transition name="script-4-rolling-update">
        <el-form-item label="滚动升级脚本" prop="script4RollingUpdate"
                      class="script-4-rolling-update"
                      v-if="false"
        >
          <el-input v-model="createAppForm.script4RollingUpdate"
                    type="textarea"
                    :rows="16"
                    placeholder="滚动升级脚本"
                    v-if="editScript"
          ></el-input>
          <div class="formatted-script-4-rolling-update" v-else>
            <el-scrollbar>
              <pre><code class="bash hljs" v-if="formattedScript4RollingUpdate.length > 0"
                         v-html="formattedScript4RollingUpdate"></code></pre>
            </el-scrollbar>
          </div>
          <div class="toggle-edit-script" @click="toggleEditScript">
            <span v-if="editScript">预览</span>
            <span v-else>编辑</span>
          </div>
        </el-form-item>
      </transition>
      <transition name="max-age-4-script">
        <el-form-item label="超时时间" prop="maxAge4Script"
                      class="max-age-4-script"
                      v-if="false"
        >
          <el-input-number v-model="createAppForm.maxAge4Script" :min="1" :max="120" label="描述文字"></el-input-number>
          <span>秒（1-120秒之间）</span>
        </el-form-item>
      </transition>
      <el-form-item label="负载均衡" prop="loadBalance">
        <el-radio-group v-model="createAppForm.loadBalance">
          <el-radio v-for="item in loadBalanceType" :label="item" :key="item"></el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="section-footer">
      <el-row>
        <el-col :span="12" style="text-align: center">
          <el-button type="primary" size="mini"
                     @click="$router.go(-1)">关闭</el-button>
        </el-col>
        <el-col :span="12" style="text-align: center">
          <el-button type="primary" size="mini"
                     @click="handleFinish">完成</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="scss">
.el-form {
  .el-form-item {
    .el-textarea {
      textarea {
        font-size: 12px;
      }
    }
    &.script-4-rolling-update {
      .el-form-item__content {
        /*overflow: scroll;*/
        .toggle-edit-script {
          font-size: 12px;
          line-height: 20px;
          background: #E6A23C;
          padding: 0px 3px;
          border-radius: 4px;
          display: inline-block;
          position: absolute;
          top: 0px;
          right: 0px;
          &:hover {
            font-weight: bold;
          }
        }
        .formatted-script-4-rolling-update {
          margin: 0px;
          padding: 0px;
          width: 100%;
          box-sizing: border-box;
          height: 300px;
          border: 1px solid gray;
          border-radius: 5px;
          .el-scrollbar {
            width: 100%;
            height: 300px;
          }
          overflow: scroll;
          font-size: 12px;
          line-height: 14px;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
  @keyframes to-show {
    0% {
      opacity: 0;
      /*max-height: 0px;*/
    }
    25% {
      opacity: .75;
    }
    100% {
      opacity: 1;
      /*max-height: 600px;*/
    }
  }
  @keyframes to-hide {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  .script-4-rolling-update-enter-active, .max-age-4-script-enter-active  {
    animation: to-show 1.5s ease-in-out;
  }
  .script-4-rolling-update-leave-active, .max-age-4-script-leave-active {
    animation: to-hide 1s ease-in-out;
  }

  #app-add {
    background: white;
    margin: 20px;
    padding: 10px 30px;
    width: 80%;
    max-width: 750px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    .section-title {
      font-size: 18px;
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
    }
    .section-footer {
      margin: 0px -10px;
      padding-top: 10px;
      border-top: 1px solid #e7e7e7;
      .el-button {
        display: block;
        margin: 0px auto;
        width: 150px;
        text-align: center;
      }
    }
    .el-form {
      .el-form-item {
        .el-form-item__label {
          font-weight: bold;
        }
        &.group-list {
          .el-select {
            width: 240px;
          }
        }
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
        &.script-4-rolling-update {
        }
        &.max-age-4-script {
        }
      }
    }
  }
</style>
<script>
  import appPropUtil from '../utils/app-props';
export default {
  created() {
    this.onLanguageInfo(this.languageInfo, null);
    this.onProfileListOfGroup(this.$storeHelper.profileListOfGroup, null);
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
        rollingUpdate: false,
        script4RollingUpdate: '',
        maxAge4Script: '30',
        loadBalance: appPropUtil.getAllLoadBalance()[0],
      },
      editScript: true,
      formattedScript4RollingUpdate: '',
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
    languageInfo() {
      return this.$storeHelper.languageInfo();
    },
    groupList() {
      return this.$storeHelper.groupList();
    },
  },
  watch: {
    languageInfo: 'onLanguageInfo',
    '$storeHelper.profileListOfGroup': 'onProfileListOfGroup',
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
    // handle the change of profile
    onProfilesChanged(value) {
      console.log(value);
      console.log(this.$storeHelper.profileListOfGroup);
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

    toggleEditScript() {
      if (this.editScript) {
        Promise.all([this.$utils.lazyLoad('js', this.$url['highlight.js']),
          this.$utils.lazyLoad('css', this.$url['highlight.css'])]).then(content => {
            console.log(content);
          // lib highlight.js will expose hljs to window
          if (hljs) {
            let result = hljs.highlightAuto(this.createAppForm.script4RollingUpdate, ['bash']);
            if (result && result.value) {
              this.formattedScript4RollingUpdate = result.value;
            } else {
              this.formattedScript4RollingUpdate = '';
            }
            this.editScript = false;
          }
        }).catch(err => {
          console.log(err);
        });
      } else {
        this.editScript = true;
      }
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
            this.$router.push('/app');
          }).catch((err) => {
            self.showLoading = false;
            this.$notify.error({
              title: err.title,
              message: err.msg,
              duration: 0,
              onClose: function () {
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