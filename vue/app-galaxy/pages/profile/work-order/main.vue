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

    <el-form :model="workOrderForm" :rules="rules"
             ref="workOrderForm"
             size="mini"
             label-width="120px">
      <el-form-item label="审批工单名称：" prop="workOrderName">
        <el-input v-model="workOrderForm.workOrderName"></el-input>
      </el-form-item>
      <el-form-item label="申请人：">
        {{workOrderForm.userName}}
      </el-form-item>
      <el-form-item label="团队名称" prop="groupName">
        <el-select v-model="workOrderForm.groupName" placeholder="请选择">
          <el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <features v-for="item in workOrderForm.features" :key="item.id"
              :featuresInfo="item"
    ></features>
  </div>
</template>
<style>
  #work-order {
    padding: 10px;
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
          workOrderName: '',
          userName: '***',
          groupName: '',
          features: [{
            id: 0,
            name: ''
          }],
        },
        rules: workOrderUtils.rules,
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
    }
  };
</script>
