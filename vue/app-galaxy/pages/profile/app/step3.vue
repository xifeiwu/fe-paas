<template>
  <el-form :model="stepForm3" ref="stepForm3" :rules="rules" label-width="120px"
           v-loading="showLoading"
           :element-loading-text="loadingText"
           element-loading-spinner="el-icon-loading"
           element-loading-background="rgba(255, 255, 255, 0.6)">
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
        <!--<el-radio label="Round_robin"></el-radio>-->
        <!--<el-radio label="IP_hash"></el-radio>-->
        <!--<el-radio label="Session_sticky"></el-radio>-->
        <el-radio v-for="item in loadBalanceType" :label="item" :key="item"></el-radio>
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
  import appPropUtils from '../utils/app_prop';
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
          loadBalance: 'Round_robin',
        },
        rules: appPropUtils.rules,
        memeorySizeList: [],
        showLoading: false,
        loadingText: ''
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
        return result;
      },
      loadBalanceType() {
        return appPropUtils.getAllLoadBalance();
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
        var self = this;
        this.$refs['stepForm3'].validate((valid) => {
          if (valid) {
            this.$store.dispatch('app/addCreateAPPInfo', {
              key: 'page3',
              value: this.stepForm3
            });
            let toPost = this.infoForCreateAppToPost;
//            delete toPost.volumes;
            this.showLoading = true;
            this.loadingText = '正在为您创建应用' + toPost.serviceName;
            this.$net.createAPP(toPost).then((content) => {
              this.$store.dispatch('app/updateStepOfAddAPP', 3);
              this.showLoading = false;
              this.confirm('创建应用 ' + toPost.serviceName + ' 成功！').then(() => {
                this.$router.push('/profile/app_manager');
              }).catch(() => {
                this.$store.dispatch('app/addCreateAPPInfo', null);
                this.$router.push('step1');
              });
            }).catch((err) => {
              this.$notify({
                title: '提示',
                message: err,
                duration: 0,
                onClose: function () {
                  self.showLoading = false;
                  self.$router.push('step1');
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
      handlePreStep() {
        this.$router.push('step2');
        this.$store.dispatch('app/updateStepOfAddAPP', 2);
      },

      confirm(content) {
        return new Promise((resolve, reject) => {
          this.$confirm(content, '提示', {
            confirmButtonText: '返回应用列表',
            cancelButtonText: '继续创建应用',
            type: 'info'
          }).then(() => {
            resolve();
          }).catch(() => {
            reject()
          });

        });
      },
    }

  }
</script>