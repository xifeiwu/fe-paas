<template>
  <div id="work-order-add"
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
    <div class="application-section">
      <div class="title">程序列表</div>
      <el-form :model="workOrderForm" :rules="rules"
               ref="applicationForm"
               size="mini"
               label-width="120px">
        <el-form-item label="应用名称" prop="appName">
          <el-select v-model="workOrderForm.appName" placeholder="请选择" style="width: 350px">
            <el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生成环境版本" prop="appVersion">
          <el-select v-model="workOrderForm.appVersion" placeholder="请选择" style="width: 350px">
            <el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="acceptance-section">
      <div class="title">验收信息</div>
      <el-form :model="workOrderForm" :rules="rules"
               ref="acceptanceForm"
               size="mini"
               label-width="120px">
        <el-form-item label="验收人" prop="acceptanceUser">
          <el-select v-model="workOrderForm.acceptanceUser" multiple placeholder="请选择" style="width: 350px">
            <el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="知会人" prop="notifyUser">
          <el-select v-model="workOrderForm.notifyUser" multiple placeholder="请选择" style="width: 350px">
            <el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮件组" prop="mailGroup">
          <el-select v-model="workOrderForm.mailGroup" multiple placeholder="请选择" style="width: 350px">
            <el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工单备注" prop="comments">
          <el-input v-model="workOrderForm.comments"
                    type="textarea"
                    :rows="2"
                    style="width: 350px"></el-input>
          <!--<el-select v-model="workOrderForm.comments" multiple placeholder="请选择" style="width: 350px">-->
          <!--<el-option v-for="item in ['A', 'B', 'C']" :key="item" :label="item" :value="item">-->
          <!--</el-option>-->
          <!--</el-select>-->
        </el-form-item>
      </el-form>
    </div>
    <div class="submit-section">
      <el-button type="primary" @click="handleFinish">完成</el-button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .el-form {
    .el-form-item--mini {
      margin-bottom: 12px;
    }
  }
  #work-order-add {
    width: 80%;
    /*max-width: 600px;*/
    margin: 5px auto;
    .feature-section {
      .title {
        border-left: 5px solid gray;
        margin: 3px -2px;
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
    .application-section {
      .title {
        border-left: 5px solid gray;
        margin: 3px -2px;
      }
    }
    .acceptance-section {
      .title {
        border-left: 5px solid gray;
        margin: 3px -2px;
      }
    }
    .submit-section {
      margin: 15px auto;
      .el-button {
        display: block;
        margin: 0px auto;
        width: 50%;
        max-width: 200px;
        text-align: center;
      }
    }
  }
</style>
<script>
  import workOrderUtils from './work-order-props';
  import features from './features.vue';
  import ElInput from "../../../../packages/input/src/input";
  export default {
    components: {ElInput, features},
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
          appName: null,
          appVersion: null,
          acceptanceUser: [],
          notifyUser: [],
          mailGroup: [],
          comments: '',
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
      },
      handleFinish(){

      }
    }
  };
</script>
