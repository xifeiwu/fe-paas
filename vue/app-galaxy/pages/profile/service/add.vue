<template>
  <div id="service-add">
    <el-form :model="serviceForm" ref="serviceForm" :rules="rules" label-width="120px">
      <el-form-item label="版本号" prop="serviceVersion" class="serviceVersion">
        <el-input v-model="serviceForm.serviceVersion" placeholder="版本号只能包含数字和点">
          <template slot="prepend">V</template>
        </el-input>
      </el-form-item>
      <el-form-item label="镜像方式" prop="mirrorType">
        <el-radio-group v-model="serviceForm.mirrorType" @change="handleMirrorTypeChange">
          <el-radio label="0">自动打镜像</el-radio>
          <el-radio label="1">自定义镜像</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="mirrorLocationLabel" prop="mirrorLocation">
        <el-input v-model="serviceForm.mirrorLocation" placeholder="输入镜像地址，包含版本"></el-input>
      </el-form-item>

      <el-form-item label="CPU" prop="cpu">
        <el-radio-group v-model="serviceForm.cpu" size="small">
          <el-radio-button v-for="item in cpuAndMemoryList" :label="item.cpu" :key="item.id">
            {{item.cpu}}核
        </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="内存" prop="memory">
        <el-radio-group v-model="serviceForm.memory" size="small">
          <el-radio-button v-for="item in memorySizeList" :label="item.memory" :key="item.id">
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
      this.rules.mirrorLocation.required = false;
      // set default cpu, default memorySizeList will be set in watch
      if (Array.isArray(this.cpuAndMemoryList) && this.cpuAndMemoryList.length > 0) {
        let firstItem = this.cpuAndMemoryList[0];
        this.serviceForm.cpu = 'cpu' in firstItem ? firstItem.id : '';
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
          mirrorType: '0',
          mirrorLocation: '',
          cpu: '',
          memory: '',
          fileLocation: [],
          environments: [],
          hosts: [],
          instanceCount: 1,
        },
        memorySizeList: [],
        rules: AppPropUtil.rules
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
    },
    watch: {
      'serviceForm.cpu': function (value, oldValue) {
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
                this.serviceForm.memory = it.memory;
              }
            })
          }
        }
      }
    },
    mounted() {
      this.$store.dispatch('app/updateStepOfAddAPP', 1);
    },
    methods: {
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
        console.log(this.serviceForm);
        this.$refs['serviceForm'].validate((valid) => {
          if (valid) {
//          this.$router.push('step2');
//          this.$store.dispatch('app/updateStepOfAddAPP', 1);
            this.$store.dispatch('app/addCreateAPPInfo', {
              key: 'page1',
              value: this.serviceForm
            });

            let toPost = this.$store.getters['app/infoForCreateAppToPost'];
            console.log('toPost');
            console.log(toPost);
            this.showLoading = true;
            this.loadingText = '正在为您创建应用' + toPost.serviceName;
            this.$net.createAPP(toPost).then((content) => {
              this.showLoading = false;
              this.$router.push('/profile/app');
//            this.confirm('创建应用 ' + toPost.serviceName + ' 成功！').then(() => {
//              this.$router.push('/profile/app_manager');
//            }).catch(() => {
//              this.$store.dispatch('app/addCreateAPPInfo', null);
//              this.$router.push('step1');
//            });
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
