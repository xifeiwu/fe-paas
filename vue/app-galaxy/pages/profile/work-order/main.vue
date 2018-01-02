<template>
  <div id="work-order"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="block">
      <span class="demonstration">默认</span>
      <el-date-picker
              v-model="value3"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
      </el-date-picker>
    </div>

    <div class="basic-section">
      <el-form :model="workOrderForm" :rules="rules"
               ref="workOrderForm"
               size="mini"
               label-width="120px">
        <el-form-item label="审批工单名称：" prop="name">
          <el-input v-model="workOrderForm.workOrderName" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="申请人：">
          {{workOrderForm.userName}}
        </el-form-item>
        <el-form-item label="团队名称" prop="groupName">
          <el-select v-model="workOrderForm.groupName" placeholder="请选择" style="width: 350px">
            <el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="feature-section">
      <div class="title">功能列表</div>
      <div class="feature-form-list">
        <features v-for="(item, index) in workOrderForm.features" :key="index"
                  :featureInfo="item"
                  :showPlug="index == workOrderForm.features.length - 1"
                  :onPlug="addFeatureForm"
        >{{item}}</features>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .el-form {
    .el-form-item--mini {
      margin-bottom: 12px;
    }
  }
  #work-order {
    width: 80%;
    /*max-width: 600px;*/
    margin: 5px auto;
    .feature-section {
      .title {
        border-left: 5px solid gray;
        margin-bottom: 3px;
      }
      .feature-form-list {
        .work-order-feature {
          display: inline-block;
          & + .work-order-feature {
            margin-left: 10px;
          }
        }
      }
    }
  }
</style>
<script>
  import workOrderUtils from './work-order-props';
  import features from './features.vue';
  export default {
    components: {features},
    data() {
      return {
        showLoading: false,
        loadingText: '',
        workOrderForm: {
          name: '',
          userName: '***',
          groupName: '',
          features: [{
            name: '',
            type: '',
            jiraAddress: null,
            description: null,
          }],
        },
        rules: workOrderUtils.rules.workOrder,
        pickerOptions2: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        value3: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
        value4: ''
      };
    },
    methods: {
      addFeatureForm() {
        this.workOrderForm.features.push({
          name: null
        });
        console.log(this.workOrderForm.features);
      }
    }
  };
</script>
