<template>
  <el-form :model="stepForm2" ref="stepForm2" :rules="rules" label-width="120px">
    <el-form-item label="镜像方式" prop="mirrorType">
      <el-radio-group v-model="stepForm2.mirrorType" @change="handleMirrorTypeChange">
        <el-radio label="自动打镜像"></el-radio>
        <el-radio label="自定义镜像"></el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="mirrorLocationLabel" prop="mirrorLocation">
      <el-input v-model="stepForm2.mirrorLocation" placeholder="输入镜像地址，包含版本"></el-input>
    </el-form-item>
    <el-form-item label="文件存储" prop="fileLocation" class="fileLocation">
      <div>
        <el-tag
                v-for="tag in stepForm2.fileLocation"
                :key="tag"
                closable
                type="success"
                @close="handleRemoveFileLocation(tag)"
        >{{tag}}</el-tag>
      </div>
      <el-input v-model="fileLocationToAdd" placeholder="输入文件地址，用/开始">
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
        v-for="(value, key) in stepForm2.environments"
        :key="key"
      >
        <el-col :span="9">{{key}}</el-col>
        <el-col :span="9">{{value}}</el-col>
        <el-col :span="4">
          <el-button class="delete-environment-btn" @click="handleDeleteEnvironment(key)">删除</el-button>
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
    <!--<el-form-item-->
            <!--v-for="(domain, index) in stepForm2.domains"-->
            <!--:label="'域名' + index"-->
            <!--:key="domain.key"-->
            <!--:prop="'domains.' + index + '.value'"-->
            <!--:rules="{-->
      <!--required: true, message: '域名不能为空', trigger: 'blur'-->
    <!--}"-->
    <!--&gt;-->
      <!--<el-input v-model="domain.value"></el-input><el-button @click.prevent="removeDomain(domain)">删除</el-button>-->
    <!--</el-form-item>-->
    <el-form-item>
      <el-button type="primary" @click="handleNextStep">下一页</el-button>
      <el-button type="primary" @click="handlePreStep">上一页</el-button>
      <el-button @click="addDomain">新增域名</el-button>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
  .el-form {
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
    }
  }
</style>
<script>
  import ElButton from "../../../../packages/button/src/button";
  export default {
    components: {ElButton}, created() {
      this.rules.mirrorLocation.required = false;
    },
    data() {
      return {
        mirrorLocationLabel: '基础镜像地址',
        fileLocationToAdd: '',
        environmentKey: '',
        environmentValue: '',
        environmentToAdd: '',
        stepForm2: {
          mirrorType: '自动打镜像',
          mirrorLocation: '',
          fileLocation: [],
          environments: {},
          domains: [{
            value: ''
          }],
          email: ''
        },
        rules: {
          mirrorType: [{
            required: true,
            message: '请选择打镜像方式',
//            trigger: 'blur, input'
          }],
          mirrorLocation: [{
            required: false,
            message: '请输入镜像地址',
//            trigger: 'blur, input'
          }],
          fileLocation: [{
            type: 'array',
            required: true,
            message: '请输入至少一个文件存储地址',
//            trigger: 'focus, blur, input'
          }]
        }
      };
    },
    methods: {
      handleMirrorTypeChange(value) {
        switch (value) {
          case '自动打镜像':
            this.mirrorLocationLabel = '基础镜像地址';
            this.rules.mirrorLocation[0].required = false;
            break;
          case '自定义镜像':
            this.mirrorLocationLabel = '镜像地址';
            this.rules.mirrorLocation[0].required = true;
            break;
        }
      },
      handleRemoveFileLocation(tag) {
        let items = this.stepForm2.fileLocation;
        items.splice(items.indexOf(tag), 1);
      },
      handleAddFileLocation(tag) {
        if (tag.length > 0) {
          this.stepForm2.fileLocation.push(tag);
          this.fileLocationToAdd = '';
        }
      },
      handleDeleteEnvironment(key) {
        this.$delete(this.stepForm2.environments, key)
      },
      handleAddEnvironment(key, value) {
        if (key.length > 0 && value.length > 0) {
          this.$set(this.stepForm2.environments, key, value);
        }
      },
      handleNextStep() {
        console.log(this.stepForm1);
        this.$refs['stepForm1'].validate((valid) => {
          if (valid) {
            this.$router.push('step2');
            this.$store.dispatch('app/updateStepOfAddAPP', 1);
//          this.$store.dispatch('user/login', response);
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      handlePreStep() {

      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            alert('submit!');
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      removeDomain(item) {
        var index = this.stepForm2.domains.indexOf(item)
        if (index !== -1) {
          this.stepForm2.domains.splice(index, 1)
        }
      },
      addDomain() {
        this.stepForm2.domains.push({
          value: '',
          key: Date.now()
        });
      }
    }
  }
</script>
