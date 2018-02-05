<template>
  <div id="service-add">
    <el-form :model="serviceForm" ref="serviceForm"
             :rules="rules" label-width="120px" size="mini"
             v-loading="showLoading"
             :element-loading-text="loadingText">
      <el-form-item label="版本号" prop="serviceVersion" class="serviceVersion">
        <el-input v-model="serviceForm.serviceVersion" placeholder="版本号只能包含数字">
          <template slot="prepend">V</template>
        </el-input>
      </el-form-item>
      <el-form-item label="镜像方式" prop="customImage">
        <el-radio-group v-model="serviceForm.customImage">
          <el-radio :label="false">自动打镜像</el-radio>
          <el-radio :label="true">自定义镜像</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="镜像地址" prop="customImageValue" v-if="serviceForm.customImage"
                    class="custom-image" :class="customImageType.toLowerCase()+'-image'"
      >
        <el-select v-model="customImageType">
          <el-option v-for="(item, index) in customImageTypeList"
                     :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-select v-model="serviceForm.customImageValue" v-if="customImageType=='ENV'"
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
        <el-select v-model="serviceForm.customImageValue" v-if="customImageType=='PRIVATE'"
                   :placeholder="currentPrivateAppVersionList.length > 0 ? '请选择' : '加载中'">
          <el-option v-for="(item, index) in currentPrivateAppVersionList"
                     :key="index" :label="item" :value="item">
          </el-option>
        </el-select>

      </el-form-item>
      <el-form-item label="基础镜像" class="auto-image" prop="autoImageValue" v-else>
        <el-select v-model="serviceForm.autoImageValue"
                   :placeholder="this.imageRelatedInfo.autoImageList.length > 0 ? '请选择' : '加载中'">
          <el-option v-for="(item, index) in imageRelatedInfo.autoImageList"
                     :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Gitlab地址" prop="gitLabAddress">
        <el-input v-model="serviceForm.gitLabAddress" placeholder="请输入项目的gitLab地址"></el-input>
      </el-form-item>
      <el-form-item label="Gitlab分支" prop="gitLabBranch">
        <el-input v-model="serviceForm.gitLabBranch" placeholder="请输入gitLab分支名"></el-input>
      </el-form-item>

      <el-form-item label="Gitlab父级pom.xml相对路径" prop="relativePathOfParentPOM"
                    v-if="currentApp.isJavaLanguage"
                    class="relativePathOfParentPOM"
      >
        <el-input v-model="serviceForm.relativePathOfParentPOM" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="VM_Options" prop="vmOptions"
                    v-if="currentApp.isJavaLanguage"
      >
        <el-input v-model="serviceForm.vmOptions" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="maven profile id" prop="mavenProfileId"
                    v-if="currentApp.isJavaLanguage"
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
          <el-col :span="9" style="font-weight: bold">Key</el-col>
          <el-col :span="2">&nbsp</el-col>
          <el-col :span="9" style="font-weight: bold">Value</el-col>
          <el-col :span="4" style="font-weight: bold"></el-col>
        </el-row>
        <el-row
                v-for="(item, index) in serviceForm.environments"
                :key="item.key"
        >
          <el-col :span="9">{{item.key}}</el-col>
          <el-col :span="2">&nbsp</el-col>
          <el-col :span="9">{{item.value}}</el-col>
          <el-col :span="4">
            <el-button class="delete-environment-btn" @click="handleDeleteEnvironment(index)">删除</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="9">
            <el-input v-model="environmentKey" placeholder="Key值"></el-input>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="9">
            <el-input v-model="environmentValue" placeholder="Value值"></el-input>
          </el-col>
          <el-col :span="4">
            <el-button @click="handleAddEnvironment(environmentKey, environmentValue)">添加</el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="域名配置" prop="hosts" class="hosts">
        <el-row>
          <el-col :span="9" style="font-weight: bold">IP</el-col>
          <el-col :span="2">&nbsp</el-col>
          <el-col :span="9" style="font-weight: bold">域名</el-col>
          <el-col :span="4" style="font-weight: bold"></el-col>
        </el-row>
        <el-row
                v-for="(item, index) in serviceForm.hosts"
                :key="item.ip"
        >
          <el-col :span="9">{{item.ip}}</el-col>
          <el-col :span="2">&nbsp</el-col>
          <el-col :span="9">{{item.domain}}</el-col>
          <el-col :span="4">
            <el-button class="delete-host-btn" @click="handleDeleteHost(index)">删除</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="9">
            <el-input v-model="hostKey" placeholder="IP"></el-input>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="9">
            <el-input v-model="hostValue" placeholder="域名"></el-input>
          </el-col>
          <el-col :span="4">
            <el-button @click="handleAddHost(hostKey, hostValue)">添加</el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="实例数量" prop="instanceCount">
        <el-input-number v-model="serviceForm.instanceCount" :min="1" :max="10" label="描述文字"></el-input-number>
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
              width: 50%;
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
      }
    }
  }
</style>
<style lang="scss" scoped>
  #service-add {
    box-shadow: 0 0 8px 0 rgba(232,237,250,.6), 0 2px 4px 0 rgba(232,237,250,.5);
    margin: 20px auto;
    padding: 30px 20px 20px 20px;
    width: 80%;
    max-width: 560px;
    .el-form {
      .el-form-item {
        &.environments {
          text-align: center;
        }
        &.hosts {
          text-align: center;
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
      }
    }
  }
</style>
<script>
  import appPropUtil from '../utils/app_prop';
  import ElSelect from "element-ui/packages/select/src/select";
  import ElTooltip from "element-ui/packages/tooltip/src/main";
  import ElOption from "element-ui/packages/select/src/option";
  export default {
    components: {ElOption, ElTooltip, ElSelect},
    created() {
      // receive queryString parameters from url first,
      // get from localStorage if queryString not exist.
      let queryParam = this.$route.query;
      if ('appID' in queryParam && 'profileID' in queryParam && queryParam['appID'] != null && queryParam['profileID'] != null ) {
        this.serviceForm.appId = parseInt(queryParam['appID']);
        this.serviceForm.spaceId = parseInt(queryParam['profileID']);
      } else {
        this.$router.go(-1);
//        let appId = this.$getUserConfig('profile/service/appID');
//        let profileId = this.$getUserConfig('profile/service/profileID');
//        if (appId && profileId) {
//          this.serviceForm.appId = appId;
//          this.serviceForm.spaceId = profileId;
//        }
      }
      // get app related info at beginning
      this.onAppInfoListOfGroup(this.appInfoListOfGroup);

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
          customImage: false,
          autoImageValue: '',
          customImageValue: '',
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
        },
        customImageTypeList: [{
          label: '环境镜像',
          value: 'ENV'
        }, {
          label: '私有镜像',
          value: 'PRIVATE'
        }],
        customImageType: 'ENV',
        imageRelatedInfo: {
          autoImageList: [],
          customEnvImageList: [],
          privateAppList: [],
        },
        currentPrivateApp: '',
        currentPrivateAppVersionList: [],

        memorySizeList: [],
        rules: appPropUtil.rules,

        appIndex: null,
        currentApp: {},

        showLoading: false,
        loadingText: '',
      };
    },
    computed: {
      cpuAndMemoryList() {
        return this.$storeHelper.cpuAndMemoryList();
      },
//      appInfoListOfGroup() {
//        return this.$store.getters['user/appInfoListOfGroup'];
//      },
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

      'imageRelatedInfo': {
        immediate: true,
        handler (info) {
          this.setDefaultImage(info);
        }
      },
      'serviceForm.customImage': {
        immediate: true,
        handler (value) {
        }
      },
      'customImageType': {
        immediate: true,
        handler (value) {
          this.serviceForm.customImageValue = '';
          this.setDefaultImage(this.imageRelatedInfo);
        }
      },
      'currentPrivateApp': 'requestAppVersionList'
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
      onAppInfoListOfGroup (value) {
        let appInfo = this.$storeHelper.getAppInfoByID(this.serviceForm.appId);
        if (appInfo && appInfo.hasOwnProperty('app')) {
          this.currentApp = appInfo.app;
        }
      },
      /**
       * do some action on change of groupInfo
       * 1. get type list of auto image
       */
      onGroupInfo(value) {
//        console.log(this.currentApp);
//        console.log(value);
        // check group tag
        if (!value || !value.hasOwnProperty('tag')) {
          console.log('groupTag not found');
          return;
        }
        // check language
        if (!this.currentApp || !this.currentApp.hasOwnProperty('language')) {
          console.log('language not found');
          return;
        }
        // check spaceId
        if (!this.serviceForm.hasOwnProperty('spaceId') || !this.serviceForm.hasOwnProperty('appId')) {
          console.log('spaceId or appId not found')
          return;
        }
        // check profile name
        let profileInfo = appPropUtil.getProfileInfoByID(this.serviceForm.spaceId);
        if (!profileInfo || !profileInfo.hasOwnProperty('name')) {
          console.log('profileName not found');
          return;
        }

        let groupTag = value.tag;
        let language = this.currentApp.language.toLowerCase();
        let profileName = profileInfo.name;
        this.$net.getImageRelatedInfo({
          groupTag: groupTag,
          language: 'ph' + language
        }, {
          env: profileName,
          applicationId: this.serviceForm.appId,
          groupTag: groupTag
        }, {
          groupTag: groupTag
        }).then(imageRelatedInfo => {
          this.imageRelatedInfo = imageRelatedInfo;
          console.log(this.imageRelatedInfo);
        }).catch(err => {
          console.log(err);
        })
      },
      setDefaultImage(relatedInfo) {
//          if (relatedInfo.hasOwnProperty('autoImageValue') && relatedInfo.autoImageValue.length > 0) {
//            if (!this.serviceForm.autoImageValue) {
//              this.serviceForm.autoImageValue = relatedInfo.autoImageValue[0];
//            }
//          }
        switch (this.customImageType) {
          case 'ENV':
            if (relatedInfo.hasOwnProperty('customEnvImageList') && relatedInfo.customEnvImageList.length > 0) {
              this.serviceForm.customImageValue = this.imageRelatedInfo.customEnvImageList[0].imageName;
            }
            break;
          case 'PRIVATE':
            if (relatedInfo.hasOwnProperty('privateAppList') && relatedInfo.privateAppList.length > 0) {
              this.currentPrivateApp = this.imageRelatedInfo.privateAppList[0];
            }
            break;
        }
      },
      requestAppVersionList(value) {
        this.currentPrivateAppVersionList = [];
        this.$net.getVersionListOfAppInCustomImage({
          projectName: value
        }).then(versionList => {
          this.currentPrivateAppVersionList = versionList;
          if (this.currentPrivateAppVersionList.length > 0) {
            this.serviceForm.customImageValue = this.currentPrivateAppVersionList[0];
          }
        });
      },
      handleDeleteEnvironment(index) {
        this.serviceForm.environments.splice(index, 1);
      },
      handleAddEnvironment(key, value) {
        if (key.length > 0 && value.length > 0) {
          this.serviceForm.environments.push({
            key: key,
            value: value,
          });
          this.environmentKey = '';
          this.environmentValue = '';
        } else {
          this.$message.error('key或value值不能为空');
        }
      },
      handleDeleteHost(index) {
        this.serviceForm.hosts.splice(index, 1);
//        this.$delete(this.serviceForm.hosts, key)
      },
      handleAddHost(key, value) {
        if (key.length > 0 && value.length > 0) {
//          this.$set(this.serviceForm.hosts, key, value);
          this.serviceForm.hosts.push({
            ip: key,
            domain: value
          });
          this.hostKey = '';
          this.hostValue = '';
        } else {
          this.$message.error('IP或域名不能为空');
        }
      },
      /**
       * init the value of this.serviceForm
       */
      initServiceForm() {
        this.serviceForm.serviceVersion = '';
          this.serviceForm.customImage = false;
          this.serviceForm.imageLocation = '';
          this.serviceForm.gitLabAddress = '';
          this.serviceForm.gitLabBranch = '';
          this.serviceForm.relativePathOfParentPOM = '';
          this.serviceForm.vmOptions = '';
//          this.serviceForm.cpuID = '';
//          this.serviceForm.memoryID = '';
          this.serviceForm.mavenProfileId = '';
          this.serviceForm.environments = [];
          this.serviceForm.hosts = [];
          this.serviceForm.instanceCount = 1;
      },
      handleFinish() {
        let self = this;
        this.$refs['serviceForm'].validate((valid) => {
          if (valid) {
            if (this.serviceForm.customImage) {
              this.serviceForm.imageLocation = this.serviceForm.customImageValue;
            } else {
              this.serviceForm.imageLocation = this.serviceForm.autoImageValue;
            }
            let toPost = appPropUtil.changePropNameForServer(this.serviceForm);
            this.showLoading = true;
            this.loadingText = '正在为您创建服务';
            this.$net.createService(toPost).then((content) => {
              this.showLoading = false;
              this.successConfirm('创建应用成功！返回服务列表？').then(() => {
                this.$router.push('/profile/service');
              }).catch(() => {
//                this.initServiceForm();
                this.$refresh();
                this.$router.push('/profile/service/add');
              });
            }).catch((err) => {
              this.showLoading = false;
              this.$notify({
                title: '提示',
                message: err,
                duration: 0,
                onClose: function () {
                  self.showLoading = false;
                  self.$router.push('/profile/service/add');
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
