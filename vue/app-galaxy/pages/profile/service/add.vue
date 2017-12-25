<template>
  <div id="service-add">
    <el-form :model="serviceForm" ref="serviceForm" :rules="rules" label-width="120px">
      <el-form-item label="镜像方式" prop="mirrorType">
        <el-radio-group v-model="serviceForm.mirrorType" @change="handleMirrorTypeChange">
          <el-radio label="0">自动打镜像</el-radio>
          <el-radio label="1">自定义镜像</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="mirrorLocationLabel" prop="mirrorLocation">
        <el-input v-model="serviceForm.mirrorLocation" placeholder="输入镜像地址，包含版本"></el-input>
      </el-form-item>
      <el-form-item label="文件存储" prop="fileLocation" class="fileLocation">
        <div>
          <el-tag
                  v-for="tag in serviceForm.fileLocation"
                  :key="tag"
                  closable
                  type="success"
                  @close="handleRemoveFileLocation(tag)"
          >{{tag}}</el-tag>
        </div>
        <el-input v-model="fileLocationToAdd" placeholder="以/开头，可以包含字母数字下划线中划线，2-18位">
          <template slot="append"><el-button class="add-file-location-btn" @click="handleAddFileLocation(fileLocationToAdd)">添加</el-button></template>
        </el-input>
      </el-form-item>

      <el-form-item label="环境变量设置" prop="environments" class="environments">
        <el-row>
          <el-col :span="10" style="font-weight: bold">Key</el-col>
          <el-col :span="10" style="font-weight: bold">Value</el-col>
          <el-col :span="4" style="font-weight: bold"></el-col>
        </el-row>
        <el-row
                v-for="(item, index) in serviceForm.environments"
                :key="item.key"
        >
          <el-col :span="9">{{item.key}}</el-col>
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
            <el-button class="add-environment-btn" @click="handleAddEnvironment(environmentKey, environmentValue)">添加</el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="域名配置" prop="hosts" class="hosts">
        <el-row>
          <el-col :span="10" style="font-weight: bold">IP</el-col>
          <el-col :span="10" style="font-weight: bold">域名</el-col>
          <el-col :span="4" style="font-weight: bold"></el-col>
        </el-row>
        <el-row
                v-for="(item, index) in serviceForm.hosts"
                :key="item.ip"
        >
          <el-col :span="9">{{item.ip}}</el-col>
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
            <el-button class="add-environment-btn" @click="handleAddHost(hostKey, hostValue)">添加</el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item class="steps">
        <el-row>
          <el-col :span="6">
            <el-button type="primary" @click="handleNextStep">下一步</el-button>
          </el-col>
          <el-col :span="12">&nbsp</el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handlePreStep">上一步</el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </div>
</template>

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
        &.steps {
          text-align: center;
          .el-button {
            width: 100%;
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
      let infos = this.$store.state.app.infoForCreateApp;
      if (infos && infos.hasOwnProperty('page2')) {
        this.serviceForm = infos.page2;
      }
      this.rules.mirrorLocation.required = false;
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
          mirrorType: '0',
          mirrorLocation: '',
          fileLocation: [],
          environments: [],
          hosts: []
        },
        rules: AppPropUtil.rules
      };
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
      handleNextStep() {
//        console.log(this.stepForm1);
        this.$refs['serviceForm'].validate((valid) => {
          if (valid) {
            this.$router.push('step3');
            this.$store.dispatch('app/updateStepOfAddAPP', 2);
            this.$store.dispatch('app/addCreateAPPInfo', {
              key: 'page2',
              value: this.serviceForm
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      handlePreStep() {
        this.$router.push('step1');
        this.$store.dispatch('app/updateStepOfAddAPP', 1);
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
    }
  }
</script>
