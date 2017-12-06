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

    <el-form-item
            prop="email"
            label="邮箱"
            :rules="[
      { required: true, message: '请输入邮箱地址', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur,change' }
    ]"
    >
      <el-input v-model="stepForm2.email"></el-input>
    </el-form-item>
    <el-form-item
            v-for="(domain, index) in stepForm2.domains"
            :label="'域名' + index"
            :key="domain.key"
            :prop="'domains.' + index + '.value'"
            :rules="{
      required: true, message: '域名不能为空', trigger: 'blur'
    }"
    >
      <el-input v-model="domain.value"></el-input><el-button @click.prevent="removeDomain(domain)">删除</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleNextStep">下一页</el-button>
      <el-button type="primary" @click="handlePreStep">上一页</el-button>
      <el-button @click="addDomain">新增域名</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  export default {
    created() {
      this.rules.mirrorLocation.required = true;
    },
    data() {
      return {
        mirrorLocationLabel: '基础镜像地址',
        stepForm2: {
          mirrorType: '自动打镜像',
          mirrorLocation: '',
          domains: [{
            value: ''
          }],
          email: ''
        },
        rules: {
          mirrorType: [{
            required: true,
            message: '请选择打镜像方式',
            trigger: 'input'
          }],
          mirrorLocation: [{
            required: true,
            message: '请输入镜像地址',
            trigger: 'blur'
          }],
        }
      };
    },
    methods: {
      handleMirrorTypeChange(value) {
        switch (value) {
          case '自动打镜像':
            console.log('fd');
            break;
          case '自定义镜像':
            this.mirrorLocationLabel = '镜像地址';
            this.rules.mirrorLocation.required = true;
            break;
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
