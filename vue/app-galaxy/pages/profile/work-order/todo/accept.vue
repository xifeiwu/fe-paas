<template>
  <div id="work-order-accept">
    <div class="section-title">
      <span>验收工单</span>
    </div>
    <div class="section-content">
      <my-show-detail :workOrderDetail="workOrderDetail"></my-show-detail>
      <el-form labelWidth="110px" size="mini" :model="handleInfo" :rules="rules" ref="handle-form">
        <el-form-item label="审批意见" prop="comment" class="comment">
          <el-input v-model="handleInfo.comment"
                    type="textarea"
                    :rows="2"
                    placeholder="不超过200个字符"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="section-footer">
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('back')">返回</el-button>
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('finish-handle')">处理完成</el-button>
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('reject-handle')">拒绝处理</el-button>
    </div>
  </div>
</template>

<style lang="scss">
  #work-order-accept {
    .el-form {
      .el-form-item {
        .el-textarea {
          textarea {
            font-size: 12px;
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #work-order-accept {
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    width: 800px;
    margin: 20px;
    margin-left: 30px;
    padding: 18px;
    .section-title {
      text-align: center;
      margin: 15px 0px;
    }
    .section-footer {
      text-align: center;
    }
  }
</style>

<script>
  import WorkOrderPropUtils from '../utils/work-order-props';
  import MyShowDetail from '../utils/components/show-detail.vue';
  export default {
    components: {MyShowDetail},
    data() {
      return {
        workOrderDetail: {},
        handleInfo: {
          comment: '',
        },
        rules: {
          comment: [{
            required: false,
            message: '拒绝处理必须填写审批意见',
            trigger: 'blur'
          }],
        },

        showLoading: false,
        loadingText: '',
      }
    },
    mounted() {
      let workOrder = this.$storeHelper.getTmpProp('workOrderBasic');
      if (!workOrder || !workOrder.hasOwnProperty('id')) {
        this.$router.push('/profile/work-order/todo');
        return;
      }
      this.$nextTick(() => {
        WorkOrderPropUtils.getWorkOrderDetailByBasic(this, workOrder).then(detail => {
//          console.log(workOrder);
//          console.log(detail);
          this.workOrderDetail = detail;
        }).catch(err => {
        })
      });
    },
    methods: {
      handleButtonClick(action) {
        switch (action) {
          case 'back':
            this.$router.go(-1);
            break;
          case 'finish-handle':
            this.submitWorkOrder(false);
            break;
          case 'reject-handle':
            this.submitWorkOrder(true);
            break;
        }
      },
      submitWorkOrder(reject) {
        if (!WorkOrderPropUtils.checkComment(this.handleInfo.comment)) {
          this.$message.error('评论内容只能包含字母，数字，下划线，中划线等常规字符');
          return;
        }
        // change rules according to user select
        this.rules.comment[0].required = reject;
        this.$refs.hasOwnProperty('handle-form')  && this.$refs['handle-form'].validate(valid => {
          if (valid) {
            this.showLoading = true;
            this.loadingText = '正在处理工单"' + this.workOrderDetail.name + '"';
            let options = {
              id: this.workOrderDetail.id,
              handleResult: !reject,
              status: this.workOrderDetail.status,
              remark: this.handleInfo.comment
            };
//            console.log(options);
            this.$net.handleWorkOrder(options).then(msg => {
//              console.log(msg);
              this.$alert('点击确定，将进入工单列表页', msg, {
                confirmButtonText: '确定',
                callback: (action) => {
                  this.$router.push('/profile/work-order/list');
                }
              });
              this.showLoading = false;
              this.loadingText = '';
            }).catch(msg => {
              console.log(msg);
              this.$alert('请与管理员联系。点击确定，进入待办工单列表页', msg, {
                confirmButtonText: '确定',
                callback: (action) => {
                  this.$router.push('/profile/work-order/todo');
                }
              });
              this.showLoading = false;
              this.loadingText = ''
            });
          }
        });
      }
    }
  }
</script>