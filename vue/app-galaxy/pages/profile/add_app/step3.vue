<template>
  <el-form :model="stepForm3" ref="stepForm3" :rules="rules" label-width="120px">
    <el-form-item label="CPU" prop="cpu">
      <el-radio-group v-model="stepForm3.cpu" size="small">
        <el-radio-button label="1核"></el-radio-button>
        <el-radio-button label="2核"></el-radio-button>
        <el-radio-button label="4核"></el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="内存" prop="memory">
      <el-radio-group v-model="stepForm3.memory" size="small">
        <el-radio-button label="1G"></el-radio-button>
        <el-radio-button label="2G"></el-radio-button>
        <el-radio-button label="4G"></el-radio-button>
        <el-radio-button label="6G"></el-radio-button>
        <el-radio-button label="8G"></el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="实例数量" prop="instanceCount">
      <el-input-number v-model="stepForm3.instanceCount" :min="1" :max="10" label="描述文字"></el-input-number>
    </el-form-item>
    <el-form-item label="滚动升级">
      <el-radio-group v-model="stepForm3.rollingUpdate">
        <el-radio label="需要"></el-radio>
        <el-radio label="不需要"></el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="负载均衡">
      <el-radio-group v-model="stepForm3.loadBalance">
        <el-radio label="round_robbin"></el-radio>
        <el-radio label="ip_hash"></el-radio>
        <el-radio label="session_sticky">ddd</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item class="steps">
      <el-row>
        <el-col :span="6">
          <el-button type="primary" @click="handleNextStep">完成</el-button>
        </el-col>
        <el-col :span="12">&nbsp</el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handlePreStep">上一步</el-button>
        </el-col>
      </el-row>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
  .el-form {
    .el-form-item {
      &.steps {
        text-align: center;
        .el-button {
          width: 100%;
        }
      }
    }
  }
</style>

<script>
  import ElFormItem from "../../../../packages/form/src/form-item";
  export default {
    components: {ElFormItem}, created() {

    },
    data() {
      return {
        stepForm3: {
          cpu: '1核',
          memory: '',
          instanceCount: 0,
          rollingUpdate: false,
          loadBalance: '',
        },
        rules: {
          cpu: [{
            required: true,
            message: '请选择CPU类型',
          }],
          memory: [{
            required: true,
            message: '请选择内存大小',
          }],
          count: [{
            type: 'string',
            required: true,
            message: '请输入实例数量',
          }],
          rollingUpdate: [{
            required: true,
            message: '是否需要滚动升级',
          }],
        }
      }
    },
    computed: {
      infoForCreateApp() {
        return this.$store.getters['app/infoForCreateApp'];
      }
    },
    methods: {
      handleNextStep() {
//        console.log(this.stepForm1);
        this.$refs['stepForm3'].validate((valid) => {
          if (valid) {
//            this.$router.push('step3');
            this.$store.dispatch('app/updateStepOfAddAPP', 3);
            this.$store.dispatch('app/addCreateAPPInfo', {
              key: 'page3',
              value: this.stepForm3
            });
            console.log(JSON.stringify(this.infoForCreateApp));
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      handlePreStep() {
        this.$router.push('step2');
        this.$store.dispatch('app/updateStepOfAddAPP', 2);
      },
    }

  }
</script>