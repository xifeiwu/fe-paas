<template>
  <el-container>
    <el-header height="auto">
      <el-steps :active="currentStep" finish-status="success">
        <el-step title="应用信息"></el-step>
        <el-step title="镜像信息"></el-step>
        <el-step title="实例规格"></el-step>
      </el-steps>
    </el-header>
    <el-main>
      <router-view></router-view>
      <!--<el-upload-->
      <!--class="upload-file"-->
      <!--ref="upload"-->
      <!--:action="http://localhost:4291/post/upload"-->
      <!--:multiple="true"-->
      <!--:autoUpload="true"-->
      <!--:auto-upload="false"-->
      <!--:beforeUpload="beforeFileUpload"-->
      <!--:onSuccess="afterLoadSuccess"-->
      <!--&gt;-->
      <!--<el-tooltip class="item" slot="trigger" effect="dark" content="只能上传以.xls或.xlsx为后缀的excel文件" placement="top-start">-->
      <!--<el-button size="mini-extral" type="primary">上传文件</el-button>-->
      <!--</el-tooltip>-->
      <!--<el-button size="mini-extral" type="success">下载模板</el-button>-->
      <!--</el-upload>-->
    </el-main>
  </el-container>
</template>
<script>
export default {
  created() {
  },
  mounted() {
//    this.$store.dispatch('')
  },
  data() {
    return {
    };
  },
  computed: {
    currentStep() {
      return this.$store.getters['app/stepOfAddAPP']
    },
  },
  methods: {
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
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-container {
    margin: 30px 15px 15px 15px;
    .el-header {
      border-bottom: 1px solid #c0ccda;
      padding: 20px 30px 5px 30px;
      .el-steps {
        width: 400px;
        margin: 0px auto;
      }
    }
    .el-main {
      max-width: 550px;
      margin: 0px auto;
      overflow: hidden;
    }
  }
</style>
