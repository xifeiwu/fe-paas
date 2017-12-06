<template>
<el-form :model="stepForm1" :rules="rules" ref="stepForm1" label-width="100px">
  <el-form-item label="团队" prop="region">
    <el-select v-model="groupIDWatcher" placeholder="请选择" @input="handleGroupIDChange">
      <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">
      </el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="应用名称" prop="appName">
    <el-input v-model="stepForm1.appName" placeholder="中文，英文，数字，30字符内"></el-input>
  </el-form-item>
  <el-form-item label="项目名称" prop="projectName">
    <el-input v-model="stepForm1.projectName" placeholder="gitlab中project的名称"></el-input>
  </el-form-item>
  <el-form-item label="运行环境" prop="environment">
    <el-checkbox-group v-model="stepForm1.environment">
      <el-checkbox label="开发" name="type"></el-checkbox>
      <el-checkbox label="功能测试" name="type"></el-checkbox>
      <el-checkbox label="性能测试" name="type"></el-checkbox>
      <el-checkbox label="联调" name="type"></el-checkbox>
      <el-checkbox label="生产" name="type"></el-checkbox>
    </el-checkbox-group>
  </el-form-item>
  <el-form-item label="开发语言" prop="language">
    <el-radio-group v-model="stepForm1.language">
      <el-radio label="Java"></el-radio>
      <el-radio label="NodeJS"></el-radio>
      <el-radio label="Python"></el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="构建类型" prop="buildType">
    <el-radio-group v-model="stepForm1.buildType">
      <el-radio label="jar"></el-radio>
      <el-radio label="war"></el-radio>
      <el-radio label="zip"></el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="健康检查" prop="healthCheck">
    <el-input v-model="stepForm1.appName" placeholder=""></el-input>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="handleNextStep">下一步</el-button>
    <!--<el-button @click="resetForm('stepForm1')">重置</el-button>-->
  </el-form-item>
</el-form>
</template>

<script>
export default {
  data() {
    return {
      stepForm1: {
        groupID: '',
        appName: '',
        projectName: '',
        environment: [],
        language: '',
        buildType: '',
        healthCheck: ''
      },
      rules: {
        groupID: [{
          required: true,
          message: '请选择所属用户组',
          trigger: 'change'
        }],
        appName: [{
            required: true,
            message: '请输入应用名称',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 30,
            message: '长度在3到30个字符',
            trigger: 'blur'
          }, {
            pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
            message: '只能包含中文，字母，数字',
            trigger: 'blur'
          }
        ],
        projectName: [{
          required: true,
          message: '请输入项目名称',
          trigger: 'blur'
        }],
        environment: [{
          required: true,
          message: '请选择运行环境',
          trigger: 'change'
        }],
        language: [{
          required: true,
          message: '请选择开发语言',
          trigger: 'change'
        }],
        buildType: [{
          required: true,
          message: '请选择构建类型',
          trigger: 'change'
        }],
        healthCheck: [{
          required: true,
          message: '请填写健康检查类型',
          trigger: 'blur'
        }]
      },
      currentStep: 0,
    };
  },
  computed: {
    groupIDWatcher: {
      get() {
        let value = this.stepForm1.groupID;
        if (0 === value.length) {
          let groupList = this.groupList;
          if (Array.isArray(groupList) && groupList.length > 0) {
            value = groupList[0].id;
          }
        }
        return value;
      },
      set(value) {
        this.stepForm1.groupID = value;
      }
    },
    groupList() {
      return this.$store.getters['user/groupList'];
    }
  },
  methods: {
    handleGroupIDChange: function(groupID) {
//      this.requestAPPList(groupID, 1, 8, '');
    },
    submitForm(formName) {
      console.log(this.stepForm1);
      this.$refs[formName].validate((valid) => {
        if (valid) {
          alert('submit!');
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleNextStep() {
//      console.log(arguments);
      this.$router.push('step2');
    },
    nextStep() {
      if (this.currentStep++ > 2) this.currentStep = 0;
    }
  }
}
</script>