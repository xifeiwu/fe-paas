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
