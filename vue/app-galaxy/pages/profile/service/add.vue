<template>
  <div id="service-add">
    <el-form :model="serviceForm" ref="serviceForm"
             :rules="rules" label-width="150px" size="mini"
             v-loading="showLoading"
             :element-loading-text="loadingText">
      <el-form-item label="版本号" prop="serviceVersion" class="serviceVersion">
        <el-input v-model="serviceForm.serviceVersion" placeholder="版本号只能包含数字，不能超过五位">
          <template slot="prepend">V</template>
        </el-input>
      </el-form-item>
      <el-form-item label="镜像方式" prop="customImage">
        <el-radio-group v-model="imageSelectState.customImage">
          <el-radio :label="false" v-if="currentApp && currentApp.language != 'PYTHON'">自动打镜像</el-radio>
          <el-radio :label="true">自定义镜像</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="基础镜像" class="auto-image" prop="autoImageValue" v-if="!imageSelectState.customImage">
        <el-select v-model="serviceForm.autoImageValue"
                   :placeholder="imageInfoFromNet.autoImageList.length > 0 ? '请选择' : '无数据'">
          <el-option v-for="(item, index) in imageInfoFromNet.autoImageList"
                     :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="镜像地址" prop="customImageValue" v-else
                    class="custom-image" :class="imageSelectState.customImageType.toLowerCase()+'-image'"
      >
        <el-select v-model="imageSelectState.customImageType">
          <el-option v-for="(item, index) in customImageTypeList"
                     :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-select v-model="serviceForm.customImageValue" v-if="imageSelectState.customImageType=='ENV'"
                   :placeholder="imageInfoFromNet.customEnvImageList.length > 0 ? '请选择' : '无数据'">
          <el-option v-for="(item, index) in imageInfoFromNet.customEnvImageList"
                     :key="index" :label="item.imageName" :value="item.imageName">
          </el-option>
        </el-select>
        <el-select v-model="imageSelectState.currentPrivateApp" v-if="imageSelectState.customImageType=='PRIVATE'"
                   :placeholder="imageInfoFromNet.privateAppList.length > 0 ? '请选择' : '无数据'">
          <el-option v-for="(item, index) in imageInfoFromNet.privateAppList"
                     :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
        <el-select v-model="serviceForm.customImageValue" v-if="imageSelectState.customImageType=='PRIVATE'"
                   :placeholder="currentPrivateAppVersionList.length > 0 ? '请选择' : '无数据'">
          <el-option v-for="(item, index) in currentPrivateAppVersionList"
                     :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Gitlab_SSH地址" prop="gitLabAddress">
        <el-input v-model="serviceForm.gitLabAddress" placeholder="请输入项目的gitLab地址"></el-input>
      </el-form-item>
      <el-form-item label="Gitlab分支" prop="gitLabBranch">
        <el-input v-model="serviceForm.gitLabBranch" placeholder="请输入gitLab分支名"></el-input>
      </el-form-item>

      <el-form-item label="Gitlab父级pom.xml相对路径" prop="relativePathOfParentPOM"
                    v-if="currentApp && currentApp.isJavaLanguage"
                    class="relativePathOfParentPOM"
      >
        <el-input v-model="serviceForm.relativePathOfParentPOM" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="VM_Options" prop="vmOptions"
                    v-if="currentApp && currentApp.isJavaLanguage"
      >
        <el-input v-model="serviceForm.vmOptions" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="maven profile id" prop="mavenProfileId"
                    v-if="currentApp && currentApp.isJavaLanguage"
      >
        <el-input v-model="serviceForm.mavenProfileId" placeholder=""></el-input>
      </el-form-item>

      <el-form-item label="CPU" prop="cpuID">
        <el-radio-group v-model="serviceForm.cpuID" size="small">
          <el-radio-button v-for="item in cpuAndMemoryList" :label="item.id" :key="item.id">
            {{item.cpu}}核
        </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="内存" prop="memoryID">
        <el-radio-group v-model="serviceForm.memoryID" size="small">
          <el-radio-button v-for="item in memorySizeList" :label="item.id" :key="item.id">
            {{item.memory}}G
        </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="环境变量设置" prop="environments" class="environments">
        <el-row>
          <el-col :span="9" style="font-weight: bold;text-align: center">Key</el-col>
          <el-col :span="2">&nbsp</el-col>
          <el-col :span="9" style="font-weight: bold;text-align: center">Value</el-col>
          <el-col :span="4" style="font-weight: bold;text-align: center"></el-col>
        </el-row>
        <el-row
                v-for="(item, index) in serviceForm.environments"
                :key="item.key"
                type="flex" justify="center" align="middle"
                class="show"
        >
          <el-col :span="9" class="key">{{item.key}}</el-col>
          <el-col :span="2">&nbsp</el-col>
          <el-col :span="9" class="value">{{item.value}}</el-col>
          <el-col :span="4" class="button">
            <el-button class="delete-environment-btn" size="mini-extral" @click="handleEnvironment('delete', index)">删除</el-button>
          </el-col>
        </el-row>
        <el-row class="input"
                type="flex" justify="center" align="middle">
          <el-col :span="9">
            <el-input v-model="environmentKey" placeholder="64位以内的数字、字母、中划线、下划线"></el-input>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="9">
            <el-input v-model="environmentValue" placeholder="512位以内的数字、字母、中划线、下划线"></el-input>
          </el-col>
          <el-col :span="4">
            <el-button size="mini-extral" @click="handleEnvironment('add', environmentKey, environmentValue)">添加</el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="Host配置" prop="hosts" class="hosts">
        <el-row>
          <el-col :span="9" style="font-weight: bold;text-align: center">IP</el-col>
          <el-col :span="2">&nbsp</el-col>
          <el-col :span="9" style="font-weight: bold;text-align: center">域名</el-col>
          <el-col :span="4" style="font-weight: bold;"></el-col>
        </el-row>
        <el-row
                v-for="(item, index) in serviceForm.hosts"
                :key="item.ip"
                type="flex" justify="center" align="middle"
                class="show"
        >
          <el-col :span="9" class="key">{{item.ip}}</el-col>
          <el-col :span="2">&nbsp</el-col>
          <el-col :span="9" class="value">{{item.domain}}</el-col>
          <el-col :span="4">
            <el-button class="delete-host-btn" size="mini-extral" @click="handleHost('delete', index)">删除</el-button>
          </el-col>
        </el-row>
        <el-row class="input"
                type="flex" justify="center" align="middle">
          <el-col :span="9">
            <el-input v-model="hostKey" placeholder="ip地址"></el-input>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="9">
            <el-input v-model="hostValue" placeholder="域名"></el-input>
          </el-col>
          <el-col :span="4">
            <el-button size="mini-extral" @click="handleHost('add', hostKey, hostValue)">添加</el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="实例数量" prop="instanceCount">
        <el-input-number v-model="serviceForm.instanceCount" :min="1" :max="20" label="描述文字"></el-input-number>
      </el-form-item>
      <el-form-item class="finish" labelWidth="0">
        <el-button type="primary" @click="handleFinish">完成</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss">
  #service-add {
    .el-form {
      .el-form-item {
        &.serviceVersion {
          .el-input {
            .el-input-group__prepend {
              width: 24px;
              text-align: center;
              color: black;
            }
            input {
              width: 300px;
            }
          }
        }
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
        &.relativePathOfParentPOM {
          .el-form-item__label {
            line-height: 100%;
          }
        }
        &.environments, &.hosts {
          .el-form-item__content {
            text-align: center;
            .show {
              .key, .value {
                /*white-space: nowrap;*/
                /*overflow: hidden;*/
                /*text-overflow: ellipsis;*/
                word-wrap: break-word;
                word-break: break-all;
                line-height: 1.2;
              }
              .button {
                text-align: center;
              }
            }
            .input {
              .el-col {
                text-align: center;
              }
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #service-add {
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    margin: 20px 20px 20px 30px;
    padding: 30px 20px 20px 20px;
    width: 80%;
    max-width: 600px;
    .el-form {
      .el-form-item {
        &.finish {
          .el-button {
            display: block;
            margin: 0px auto;
            width: 50%;
            max-width: 200px;
            text-align: center;
          }
        }
      }
    }
  }
</style>
<script>
  import appPropUtil from '../utils/app-props';
  import ElSelect from "element-ui/packages/select/src/select";
  import ElTooltip from "element-ui/packages/tooltip/src/main";
  import ElOption from "element-ui/packages/select/src/option";
  export default {
    components: {ElOption, ElTooltip, ElSelect},
    created() {
      // receive queryString parameters from url, or go back
      let queryParam = this.$route.query;
      if ('appID' in queryParam && 'profileID' in queryParam && queryParam['appID'] != null && queryParam['profileID'] != null ) {
        this.serviceForm.appId = parseInt(queryParam['appID']);
        this.serviceForm.spaceId = parseInt(queryParam['profileID']);
      } else {
        this.$router.go(-1);
        return;
      }
      // appInfoListOfGroup must be existed: used for get info of currentApp which is ued to get isJavaLanguage
      // and image-related info.
      if (!this.appInfoListOfGroup) {
        this.$store.dispatch('user/appInfoListOfGroup', {
          from: 'page/service/add',
          groupID: this.$storeHelper.currentGroupID
        });
      } else {
        this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      }
      // the logic of groupInfo is different from appInfoListOfGroup as it is stored in localStorage
      if (!this.groupInfo) {
        this.$router.go(-1);
        return;
      }
      // get app related info at beginning

      this.rules.imageLocation.required = false;
      // set default cpu, default memorySizeList will be set in watch
      if (Array.isArray(this.cpuAndMemoryList) && this.cpuAndMemoryList.length > 0) {
        let firstItem = this.cpuAndMemoryList[0];
        this.serviceForm.cpuID = 'cpu' in firstItem ? firstItem.id : '';
      }
      this.onGroupInfo(this.groupInfo);
    },
    mounted() {
    },
    data() {
      return {
        environmentKey: '',
        environmentValue: '',
        hostKey: '',
        hostValue: '',
        serviceForm: {
          appId: null,
          spaceId: null,
          serviceVersion: '',
          imageLocation: '',
          gitLabAddress: '',
          gitLabBranch: '',
          relativePathOfParentPOM: '',
          vmOptions: '',
          mavenProfileId: '',
          cpuID: '',
          memoryID: '',
          environments: [],
          hosts: [],
          instanceCount: 1,
          customImage: false,
          // value of autoImage
          autoImageValue: '',
          // value of customImage
          customImageValue: '',
        },

        customImageTypeList: [{
          label: '环境镜像',
          value: 'ENV'
        }, {
          label: '私有镜像',
          value: 'PRIVATE'
        }],
        // image related info requested from network, with the format:
        imageInfoFromNet: {
          autoImageList: [],
          customEnvImageList: [],
          privateAppList: [],
        },
        imageSelectState: {
          // custom image or not
          customImage: false,
          // value of autoImage
          autoImageValue: '',
          // value of customImage
          customImageValue: '',
          // type of customImage
          customImageType: 'ENV',
          // selected private app in custom-image private-image
          currentPrivateApp: '',
        },
        currentPrivateAppVersionList: [],

        memorySizeList: [],
        rules: appPropUtil.rules,

        currentApp: null,
        currentProfile: null,

        showLoading: false,
        loadingText: '',
      };
    },
    computed: {
      cpuAndMemoryList() {
        return this.$storeHelper.cpuAndMemoryList();
      },
      groupInfo() {
        return this.$storeHelper.groupInfo();
      },
      appInfoListOfGroup() {
        return this.$storeHelper.appInfoListOfGroup();
      },
    },
    watch: {
      /**
       * set memoryID at watcher of serviceForm.cpuID
       */
      'serviceForm.cpuID': function (value, oldValue) {
        let cpuID = value;
        let cpuInfo = null;
        if (Array.isArray(this.cpuAndMemoryList)) {
          this.cpuAndMemoryList.some(it => {
            if (it.hasOwnProperty('id') && cpuID === it.id) {
              cpuInfo = it;
            }
          });
          if (!cpuInfo && this.cpuAndMemoryList.length > 0) {
            cpuInfo = this.cpuAndMemoryList[0];
          }
          if (!cpuInfo) {
            return;
          }
          this.memorySizeList = cpuInfo.memoryList;
          if (Array.isArray(this.memorySizeList)) {
            this.memorySizeList.some(it => {
              if (it.hasOwnProperty('defaultSelect') && 1 === it.defaultSelect) {
                this.serviceForm.memoryID = it.id;
              }
            })
          }
        }
      },
      appInfoListOfGroup: 'onAppInfoListOfGroup',
      groupInfo: 'onGroupInfo',

      // sync value from imageSelectState to serviceForm for form-validation
//      'imageSelectState.autoImageValue': function (value) {
//        this.serviceForm.autoImageValue = value;
//      },
//      'imageSelectState.customImageValue': function (value) {
//        this.serviceForm.customImageValue = value;
//        console.log(this.serviceForm);
//      },

      'imageInfoFromNet': {
        immediate: true,
        handler (info) {
          this.updateImageSelection();
        }
      },
      'imageSelectState.customImage': {
        immediate: true,
        handler (value) {
          this.updateImageSelection();
        }
      },
      'imageSelectState.customImageType': {
        immediate: true,
        handler (value) {
          this.updateImageSelection();
        }
      },
      'imageSelectState.currentPrivateApp': 'requestPrivateImageLocation'
    },
    methods: {
      /**
       * two conditions of getting app related info:
       * 1. refresh url.
       *   app related info depends on appList which is got form net, which is slow than the logic of code, so watch
       *   the value of appInfoListOfGroup is needed. Getting network data first, and then update app related info.
       * 2. come form former page
       *   as appInfoListOfGroup has contained in the web app, so i can get app related info at the beginning of app,
       *   so onAppInfoListOfGroup is called on created method.
       * @param value
       */
      onAppInfoListOfGroup(appList) {
        if (this.serviceForm.appId) {
          this.currentApp = this.$storeHelper.getAppByID(this.serviceForm.appId);
          // only customImage can be used when current language is python
          let isPythonLanguage = this.currentApp && this.currentApp.language == 'PYTHON';
          if (isPythonLanguage) {
            this.imageSelectState.customImage = true;
          }
        } else {
          console.log('serviceForm.appID not found');
        }
        if (this.serviceForm.spaceId) {
          this.currentProfile = this.$storeHelper.getProfileInfoByID(this.serviceForm.spaceId);
        } else {
          console.log('serviceForm.spaceId not found');
        }
        this.requestImageRelatedInfo();
      },
      onGroupInfo(groupInfo) {
        if (groupInfo) {
          this.requestImageRelatedInfo();
        }
      },

      // get image realted info from network
      requestImageRelatedInfo() {
        if (!this.currentApp || !this.currentProfile || !this.groupInfo || !this.serviceForm) {
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
        if (!this.serviceForm.appId || !this.serviceForm.spaceId) {
          console.log('appID or spaceId not found')
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
          applicationId: this.serviceForm.appId,
          groupTag: groupTag
        }, {
          groupTag: groupTag
        }).then(imageInfoFromNet => {
          this.imageInfoFromNet = imageInfoFromNet;
//          if (imageInfoFromNet && imageInfoFromNet.hasOwnProperty('privateAppList')
//            && Array.isArray(imageInfoFromNet.privateAppList) && imageInfoFromNet.privateAppList.length > 0) {
//            this.imageSelectState.currentPrivateApp = imageInfoFromNet.privateAppList[0];
//          }
//          console.log(this.imageInfoFromNet);
        }).catch(err => {
          console.log(err);
        })
      },
      // set default image at the change of custom-image's type
      updateImageSelection() {
        if (!this.imageSelectState.customImage) {
          this.serviceForm.autoImageValue = '';
        } else {
          let imageInfoFromNet = this.imageInfoFromNet;
          this.serviceForm.customImageValue = '';
          switch (this.imageSelectState.customImageType) {
            case 'ENV':
              if (imageInfoFromNet.hasOwnProperty('customEnvImageList') && imageInfoFromNet.customEnvImageList.length > 0) {
                this.serviceForm.customImageValue = this.imageInfoFromNet.customEnvImageList[0].imageName;
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
      // request private image version list by image-name
      requestPrivateImageLocation(value) {
        this.currentPrivateAppVersionList = [];
        this.$net.getVersionListOfAppInCustomImage({
          projectName: value
        }).then(versionList => {
          this.currentPrivateAppVersionList = versionList;
          if (this.currentPrivateAppVersionList.length > 0) {
//            this.serviceForm.customImageValue = this.currentPrivateAppVersionList[0];
          }
        }).catch(err => {
          console.log(err);
        });
      },

      handleEnvironment(action, key, value) {
        switch (action) {
          case 'add':
            let keyReg = /^[A-Za-z0-9_\-\.@]{1,64}$/;
            let valueReg = /^[A-Za-z0-9_\-\.@]{1,512}$/;
            if (!keyReg.exec(key)) {
              this.$message.error('请输入64位以内的数字、字母、中划线、下划线');
              return;
            }
            if (!valueReg.exec(value)) {
              this.$message.error('请输入512位以内的数字、字母、中划线、下划线');
              return;
            }
            if (this.serviceForm.environments.length >= 10) {
              this.$message.error('最多输入10个');
              return;
            }
            let keyHasExist = false;
            this.serviceForm.environments.forEach(it => {
              if (it.key === key) {
                it.value = value;
                keyHasExist = true;
              }
            });
            if (!keyHasExist) {
              this.serviceForm.environments.push({
                key: key,
                value: value,
              });
            }
            this.environmentKey = '';
            this.environmentValue = '';
            break;
          case 'delete':
            let index = key;
            this.serviceForm.environments.splice(index, 1);
            break;
        }
      },
      // add and delete host
      handleHost(action, key, value) {
        switch (action) {
          case 'add':
            let ip = key;
            let domain = value;
            let ipReg = new RegExp('^([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})$');
            if (!ipReg.exec(ip)) {
              this.$message.error('ip格式不正确');
              return;
            }
            let domainReg = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
            if (!domainReg.exec(domain)) {
              this.$message.error('域名格式不正确');
              return;
            }
            if (this.serviceForm.hosts.length >= 10) {
              this.$message.error('最多输入10个');
              return;
            }
            let keyHasExist = false;
            this.serviceForm.hosts.forEach(it => {
              if (it.ip === ip) {
                it.domain = domain;
                keyHasExist = true;
              }
            });
            if (!keyHasExist) {
              this.serviceForm.hosts.push({
                ip: ip,
                domain: domain,
              });
            }
            this.hostKey = '';
            this.hostValue = '';
            break;
          case 'delete':
            let index = key;
            this.serviceForm.hosts.splice(index, 1);
            break;
        }
      },

      handleFinish() {
        let self = this;
        this.$refs['serviceForm'].validate((valid) => {
          if (valid) {
            this.serviceForm.customImage = this.imageSelectState.customImage;
            if (this.imageSelectState.customImage) {
              this.serviceForm.imageLocation = this.serviceForm.customImageValue;
            } else {
              this.serviceForm.imageLocation = this.serviceForm.autoImageValue;
            }
            let toPost = appPropUtil.changePropNameForServer(this.serviceForm);
            this.showLoading = true;
            this.loadingText = '正在为您创建服务';
            this.$net.createService(toPost).then((content) => {
              this.showLoading = false;
              this.$message({
                type: 'success',
                message: '服务' + toPost.serviceVersion + '创建成功！'
              });
              this.$router.push('/profile/service');
            }).catch((err) => {
              console.log(err);
              this.showLoading = false;
              this.$notify({
                title: '提示',
                message: err,
                duration: 0,
                onClose: function () {
                  self.$router.push('/profile/service/add');
                }
              });
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      /**
       * used for two-way choose after success action, howto:
       * successConfirm(contentToShow).then().catch()
       * TODO: not used
       */
      successConfirm(content) {
        return new Promise((resolve, reject) => {
          this.$confirm(content, '提示', {
            confirmButtonText: '返回服务列表',
            cancelButtonText: '继续创建',
            closeOnClickModal: false,
            type: 'success'
          }).then(() => {
            resolve();
          }).catch(() => {
            reject()
          });
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
    }
  }
</script>
