<template>
  <el-form :model="stepForm3" ref="stepForm3" :rules="rules" label-width="120px">
    <el-form-item label="CPU" prop="cpu">
      <el-radio-group v-model="stepForm3.cpu" size="small" @change="handleCPUChange">
        <el-radio-button v-for="item in cpuAndMemorylist" :label="item.cpu" :key="item.id">
          {{item.cpu}}核
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="内存" prop="memory">
      <el-radio-group v-model="stepForm3.memory" size="small">
        <el-radio-button v-for="item in memeorySizeList" :label="item.memory" :key="item.id">
          {{item.memory}}G
        </el-radio-button>
        <!--<el-radio-button label="1G"></el-radio-button>-->
        <!--<el-radio-button label="2G"></el-radio-button>-->
        <!--<el-radio-button label="4G"></el-radio-button>-->
        <!--<el-radio-button label="6G"></el-radio-button>-->
        <!--<el-radio-button label="8G"></el-radio-button>-->
      </el-radio-group>
    </el-form-item>
    <el-form-item label="实例数量" prop="instanceCount">
      <el-input-number v-model="stepForm3.instanceCount" :min="1" :max="10" label="描述文字"></el-input-number>
    </el-form-item>
    <el-form-item label="滚动升级">
      <el-radio-group v-model="stepForm3.rollingUpdate">
        <el-radio :label="true">需要</el-radio>
        <el-radio :label="false">不需要</el-radio>
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
  export default {
    created() {
      let infos = this.$store.state.app.infoForCreateApp;
      if (infos && infos.hasOwnProperty('page3')) {
        this.stepForm3 = infos.page3;
      }
    },
    mounted() {
      this.$store.dispatch('app/updateStepOfAddAPP', 2);
    },
    data() {
      return {
        stepForm3: {
          cpu: '',
          memory: '',
          instanceCount: 0,
          rollingUpdate: true,
          loadBalance: 'round_robbin',
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
        },
        memeorySizeList: []
      }
    },
    computed: {
      infoForCreateApp() {
        return this.$store.getters['app/infoForCreateApp'];
      },
      infoForCreateAppToPost() {
        return this.$store.getters['app/infoForCreateAppToPost'];
      },
      cpuAndMemorylist() {
        let result = [];
        let value = this.$store.getters['app/messageForCreateAPP'];
//        console.log(value);
        if (value && value.hasOwnProperty('cpuAndMemorylist')) {
          result = value.cpuAndMemorylist;
        }
        // set default cpu
        if (Array.isArray(result) && result.length > 0) {
          let firstItem = result[0];
          this.stepForm3.cpu = 'cpu' in firstItem ? firstItem.cpu : '';
          this.stepForm3.memory = '2';
            this.memeorySizeList = 'memoryList' in firstItem ? firstItem.memoryList : '';
//          this.handleCPUChange(this.stepForm3.cpu);
//          if (Array.isArray(this.memeorySizeList)) {
//            this.memeorySizeList.some(it => {
//              if (it.hasOwnProperty('defaultSelect') && 1 === it.defaultSelect) {
//                this.stepForm3.memory = it.memory;
//              }
//            })
//          }
        }
        console.log(result);
        return result;
      }
    },
    watch: {
//      cpuAndMemorylist(value, oldValue){
//      }
    },
    methods: {
      handleCPUChange(value) {
//        console.log(value);
        if (Array.isArray(this.cpuAndMemorylist)) {
          this.cpuAndMemorylist.some(it => {
            if (it.hasOwnProperty('cpu') && it.cpu === value) {
              this.memeorySizeList = it.memoryList;
              console.log(this.memeorySizeList);
              if (Array.isArray(this.memeorySizeList)) {
                this.memeorySizeList.some(it => {
                  if (it.hasOwnProperty('defaultSelect') && 1 === it.defaultSelect) {
                    this.stepForm3.memory = it.memory;
                  }
                })
              }
            }
          })
        }
      },
      handleNextStep() {
        this.$refs['stepForm3'].validate((valid) => {
          if (valid) {
            this.$store.dispatch('app/updateStepOfAddAPP', 3);
            this.$store.dispatch('app/addCreateAPPInfo', {
              key: 'page3',
              value: this.stepForm3
            });
            console.log(JSON.stringify(this.infoForCreateApp));
            console.log(JSON.stringify(this.infoForCreateAppToPost))
            let toPost = this.infoForCreateAppToPost;
            delete toPost.volumes;
            this.$ajax.post('http://172.16.49.141:30333' + '/application/create',
              toPost, res=> {
              console.log(res);
            }, err => {
              console.log(err);
            })
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