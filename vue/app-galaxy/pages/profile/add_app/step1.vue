<template>
<el-form :model="stepForm1" :rules="rules" ref="stepForm1" label-width="100px">
  <el-form-item label="团队" prop="region">
    <el-select v-model="currentGroupID" placeholder="请选择" @input="handleGroupIDChange">
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
  <el-form-item label="运行环境" prop="profiles" class="profiles" @change="handleProfileChange">
    <el-checkbox-group v-model="stepForm1.profiles">
      <el-checkbox v-for="item in profileListOfGroup" :label="item.name" :key="item.name">
        {{item.description}}
      </el-checkbox>
    </el-checkbox-group>
  </el-form-item>
  <el-form-item label="开发语言" prop="language">
    <el-radio-group v-model="stepForm1.language" @change="handleLanguageChange">
      <el-radio v-for="item in languageInfo" :label="item.type" :key="item.id">
        {{item.language}}
      </el-radio>
      <!--<el-radio label="JAVA"></el-radio>-->
      <!--<el-radio label="NODE_JS"></el-radio>-->
      <!--<el-radio label="PHP"></el-radio>-->
    </el-radio-group>
  </el-form-item>
  <el-form-item label="构建类型" prop="buildType" v-if="packageStyleList.length > 0">
    <el-radio-group v-model="stepForm1.buildType">
      <el-radio v-for="item in packageStyleList" :label="item.type" :key="item.type">
        {{item.packageType}}
      </el-radio>
      <!--<el-radio label="JAR"></el-radio>-->
      <!--<el-radio label="WAR"></el-radio>-->
      <!--<el-radio label="ZIP"></el-radio>-->
    </el-radio-group>
  </el-form-item>
  <el-form-item label="健康检查" prop="healthCheck">
    <el-input v-model="stepForm1.healthCheck" placeholder=""></el-input>
  </el-form-item>
  <el-form-item class="steps">
    <el-col :span="6">
      <el-button type="primary" @click="handleNextStep">下一步</el-button>
    </el-col>
    <el-col :span="18">&nbsp</el-col>
  </el-form-item>
</el-form>
</template>

<style lang="scss" scoped>
  .el-form {
    .el-form-item {
      &.profiles {
        .el-checkbox + .el-checkbox {
          margin-left: 20px;
        }
      }
      &.steps {
        .el-button {
          width: 100%;
        }
      }
    }
  }
</style>
<script>
  import ElRadio from "../../../../packages/radio/src/radio";
export default {
  created() {
    let infos = this.$store.state.app.infoForCreateApp;
    if (infos && infos.hasOwnProperty('page1')) {
      this.stepForm1 = infos.page1;
    }
  },
  data() {
    return {
      stepForm1: {
        groupID: '',
        appName: '',
        projectName: '',
        profiles: [],
        language: '',
        buildType: 'NO',
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
            pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9_-]+$/,
            message: '只能包含中文，字母，数字',
            trigger: 'blur'
          }
        ],
        projectName: [{
          required: true,
          message: '请输入项目名称',
          trigger: 'blur'
        }],
        profiles: [{
          type: 'array',
          required: true,
          message: '请选择运行环境',
          trigger: 'blur'
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
          trigger: 'input'
        }]
      },
      languageList: [],
      packageStyleList: [],
    };
  },
  computed: {
    currentGroupID: {
      get() {
        if ('' === this.stepForm1.groupID) {
          this.stepForm1.groupID = this.$store.getters['user/groupID'];
        }
        return this.stepForm1.groupID;
      },
      set(value) {
        this.stepForm1.groupID = value;
        this.$store.dispatch('user/groupID', value);
      }
    },
    groupList() {
      return this.$store.getters['user/groupList'];
    },
    profileListOfGroup() {
      let value = this.$store.getters['user/profileListOfGroup'];
      if (Array.isArray(value)) {
        this.stepForm1.profiles = value.map(it => {
          return it.name;
        });
      }
      return value;
    },
    languageInfo() {
      let result = [];
      let value = this.$store.getters['app/messageForCreateAPP'];
      if (value && value.hasOwnProperty('LanguageList')) {
        result = value.LanguageList;
      }
      if (Array.isArray(result) && result.length > 0) {
        this.stepForm1.language = result[0].type;
      }
//      console.log(result);
      return result;
    }
  },
  watch: {
    languageInfo(value, oldValue) {
//      console.log(value);
      if (value !== oldValue) {
//        this.currentGroupID = value;
      }
    }
  },
  mounted() {
    this.$store.dispatch('app/updateStepOfAddAPP', 0);
  },
  methods: {
    handleGroupIDChange: function(groupID) {
//      this.requestAPPList(groupID, 1, 8, '');
    },
    handleProfileChange: function () {
//      console.log(arguments);
    },
    handleLanguageChange: function (value) {
      if (Array.isArray(this.languageInfo)) {
        this.languageInfo.some(it => {
          if (it.hasOwnProperty('type') && it.type === value) {
            if (Array.isArray(it.packageTypeList)) {
              if (1 === it.packageTypeList.length && 'NO' === it.packageTypeList[0].type){
                this.packageStyleList = [];
                this.stepForm1.buildType = 'NO';
              } else {
                this.packageStyleList = it.packageTypeList;
                this.stepForm1.buildType = it.packageTypeList[0].type;
              }
            }
          }
        })
      }
    },
    handleNextStep() {
      console.log(this.stepForm1);
      this.$refs['stepForm1'].validate((valid) => {
        if (valid) {
          this.$router.push('step2');
          this.$store.dispatch('app/updateStepOfAddAPP', 1);
          this.$store.dispatch('app/addCreateAPPInfo', {
            key: 'page1',
            value: this.stepForm1
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