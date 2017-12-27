<template>
  <div id="service-add">
    <el-form :model="serviceForm" ref="serviceForm"
             :rules="rules" label-width="120px"
             v-loading="showLoading"
             :element-loading-text="loadingText">
      <el-form-item label="版本号" prop="serviceVersion" class="serviceVersion">
        <el-input v-model="serviceForm.serviceVersion" placeholder="版本号只能包含数字">
          <template slot="prepend">V</template>
        </el-input>
      </el-form-item>
      <el-form-item label="镜像方式" prop="mirrorType">
        <el-radio-group v-model="serviceForm.mirrorType" @change="handleMirrorTypeChange">
          <el-radio :label="false">自动打镜像</el-radio>
          <el-radio :label="true">自定义镜像</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="mirrorLocationLabel" prop="mirrorLocation">
        <el-input v-model="serviceForm.mirrorLocation" placeholder="输入镜像地址，包含版本"></el-input>
      </el-form-item>

      <el-form-item label="Gitlab地址" prop="gitlabAddress">
        <el-input v-model="serviceForm.gitlabAddress" placeholder="请输入项目的gitlab地址"></el-input>
      </el-form-item>
      <el-form-item label="Gitlab分支" prop="gitlabBranch">
        <el-input v-model="serviceForm.gitlabBranch" placeholder="请输入gitlab分支名"></el-input>
      </el-form-item>

      <el-form-item label="Gitlab父级pom.xml相对路径" prop="relativePathOfParentPOM"
                    v-if="isJavaLanguage"
                    class="relativePathOfParentPOM"
      >
        <el-input v-model="serviceForm.relativePathOfParentPOM" placeholder=""></el-input>
      </el-form-item>

      <el-form-item label="VM_Options" prop="vmOptions"
                    v-if="isJavaLanguage"
      >
        <el-input v-model="serviceForm.vmOptions" placeholder=""></el-input>
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
    .el-form {
      margin: 30px auto 0px auto;
      width: 80%;
      max-width: 550px;
      .el-form-item {
        &.fileLocation {
          .add-file-location-btn {
            margin: 0px;
            width: 60px;
          }
        }
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
  import AppPropUtil from '../utils/app_prop';
  export default {
    created() {
      // receive queryString parameters from the former page
      let queryParam = this.$route.query;
      if ('appIndex' in queryParam) {
        this.appIndex = parseInt(queryParam['appIndex']);
        this.serviceForm.spaceId = parseInt(queryParam['profileID']);
      }
      // get app related info at beginning
      let appInfoListOfGroup = this.appInfoListOfGroup;
      appInfoListOfGroup && this.getAppRelatedInfo(appInfoListOfGroup);

      this.rules.mirrorLocation.required = false;
      // set default cpu, default memorySizeList will be set in watch
      if (Array.isArray(this.cpuAndMemoryList) && this.cpuAndMemoryList.length > 0) {
        let firstItem = this.cpuAndMemoryList[0];
        this.serviceForm.cpuID = 'cpu' in firstItem ? firstItem.id : '';
      }
    },
    data() {
      return {
        mirrorLocationLabel: '基础镜像地址',
        fileLocationToAdd: '',
        environmentKey: '',
        environmentValue: '',
        hostKey: '',
        hostValue: '',
        serviceForm: {
          serviceVersion: '',
          mirrorType: false,
          mirrorLocation: '',
          gitlabAddress: '',
          gitlabBranch: '',
          relativePathOfParentPOM: '',
          vmOptions: '',
          cpuID: '',
          memoryID: '',
          environments: [],
          hosts: [],
          instanceCount: 1,
          appId: null,
          spaceId: null,
        },
        memorySizeList: [],
        rules: AppPropUtil.rules,

        appIndex: null,
        app: null,
        isJavaLanguage: false,

        showLoading: false,
        loadingText: '',
      };
    },
    computed: {
      cpuAndMemoryList() {
        let result = [];
        let value = this.$store.getters['app/messageForCreateAPP'];
        if (value && value.hasOwnProperty('cpuAndMemorylist')) {
          result = value.cpuAndMemorylist;
        }
        return result;
      },
      appInfoListOfGroup() {
        return this.$store.getters['user/appInfoListOfGroup'];
      },
    },
    watch: {
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
      appInfoListOfGroup: function (value, oldValue) {
        this.getAppRelatedInfo(value);
      }
    },
    methods: {
      /**
       * two conditions of getting app related info:
       * 1. refresh url.
       *   app related info depends on appList which is got form net, which is slow than the logic of code, so watch
       *   the value of appInfoListOfGroup is needed. Getting network data first, and then update app related info.
       * 2. come form former page
       *   as appInfoListOfGroup has contained in the web app, so i can get app related info at the beginning of app,
       *   so getAppRelatedInfo is called on created method.
       * @param value
       */
      getAppRelatedInfo (value) {
        let appInfoListOfGroup = value;
        let appList = null;
        if (appInfoListOfGroup) {
          if (appInfoListOfGroup.hasOwnProperty('appList')) {
            appList = appInfoListOfGroup.appList;
          }
        }
        if (null != this.appIndex && appList && Array.isArray(appList) && appList.length > this.appIndex) {
          this.app = appList[this.appIndex];
          this.serviceForm.appId = this.app.appId;
        }
        this.isJavaLanguage = this.app && this.app.language == 'JAVA';
//        console.log(this.app);
//        console.log(this.isJavaLanguage);
      },
      handleMirrorTypeChange(value) {
        switch (value) {
          case '0':
            this.mirrorLocationLabel = '基础镜像地址';
            this.rules.mirrorLocation[0].required = false;
            break;
          case '1':
            this.mirrorLocationLabel = '镜像地址';
            this.rules.mirrorLocation[0].required = true;
            break;
        }
      },
      handleRemoveFileLocation(tag) {
        let items = this.serviceForm.fileLocation;
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
          this.serviceForm.fileLocation.push(tag);
          this.fileLocationToAdd = '';
        }
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
      handleFinish() {
        let self = this;
        this.$refs['serviceForm'].validate((valid) => {
          if (valid) {
            this.$store.dispatch('app/addCreateServiceInfo', {
              key: 'service_add',
              value: this.serviceForm
            });

            let toPost = this.$store.getters['app/infoForCreateServiceToPost'];
//            console.log('toPost');
//            console.log(toPost);
            this.showLoading = true;
            this.loadingText = '正在为您创建服务';
            this.$net.createService(toPost).then((content) => {
              this.showLoading = false;
              this.$confirm('创建应用成功！继续创建？').then(() => {
                this.$router.push('/profile/service/add');
              }).catch(() => {
                this.$router.push('/profile/service');
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
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
    }
  }
</script>
