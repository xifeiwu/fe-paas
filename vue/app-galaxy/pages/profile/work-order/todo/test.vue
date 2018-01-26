<template>
  <div id="work-order-handle">
    <div class="section-title">
      <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
        <div slot="content">
          <div>工单测试注意事项</div>
          <div>1. 测试类型为跳过测试的情况下，不需要上传测试报告，其它情况均需要上传测试报告</div>
          <div>2. 如果选择拒绝处理，必须给出审批意见</div>
          <div>3. 测试报告只能上传一个文件</div>
        </div>
        <span>工单测试<i class="el-icon-question"></i></span>
      </el-tooltip>
    </div>
    <el-form labelWidth="120px" size="mini" :model="handleInfo" :rules="rules" ref="handle-form">
      <el-form-item label="工单名称">{{workOrderDetail.name}}</el-form-item>
      <el-form-item label="申请人">{{workOrderDetail.creatorName}}</el-form-item>
      <el-form-item label="团队名称">{{workOrderDetail.groupName}}</el-form-item>
      <el-form-item label="功能列表">
        <el-table :data="workOrderDetail.featureList">
          <el-table-column label="功能名称" prop="name" headerAlign="center">
          </el-table-column>
          <el-table-column label="功能类型" prop="typeName" headerAlign="center">
          </el-table-column>
          <el-table-column label="jira地址" prop="jiraAddress" headerAlign="center">
          </el-table-column>
          <el-table-column label="功能描述" prop="description" headerAlign="center">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="程序/版本">
        <span>{{workOrderDetail.appName}}</span>
        <span>/</span>
        <span v-if="workOrderDetail.serviceVersion">{{workOrderDetail.serviceVersion}}</span><span v-else>版本未知</span>
      </el-form-item>
      <el-form-item label="待办人">{{workOrderDetail.userToDo}}</el-form-item>
      <el-form-item label="团队名称">{{workOrderDetail.groupName}}</el-form-item>
      <el-form-item label="验收人">
        <el-table :data="workOrderDetail.acceptedUserList">
          <el-table-column label="验收人" prop="userName" headerAlign="center">
          </el-table-column>
          <el-table-column label="状态" prop="status" headerAlign="center">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="知会人" class="notify-user-list">
        <span v-for="item in workOrderDetail.notifyUserList" :key="item.userId">{{item.userName}}</span>
      </el-form-item>
      <el-form-item label="邮件组" class="mail-group-list">
        <span v-for="(item, index) in workOrderDetail.mailGroupList" :key="index" v-if="workOrderDetail.mailGroupList.length > 0">
          {{item}}
        </span>
        <span v-else>未设置</span>
      </el-form-item>
      <el-form-item label="操作记录">
        <el-table :data="workOrderDetail.operationList">
          <el-table-column label="处理时间" prop="createTime" headerAlign="center">
          </el-table-column>
          <el-table-column label="处理操作" prop="actionName" headerAlign="center">
          </el-table-column>
          <el-table-column label="处理人" prop="handleUserName" headerAlign="center">
          </el-table-column>
          <el-table-column label="备注" prop="remark" headerAlign="center">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="备注">
        <span v-if="workOrderDetail.comment">{{workOrderDetail.comment}}</span>
        <span v-else>无备注</span>
      </el-form-item>
      <el-form-item label="工单状态">
        <span>{{workOrderDetail.statusName}}</span>
      </el-form-item>
      <el-form-item label="测试类型" prop="testType" class="test-type">
        <el-select  v-model="handleInfo.testType">
          <el-option v-for="item in testTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="测试报告" prop="fileList2Upload" class="test-report">
        <el-upload
              class="upload-demo"
              ref="upload"
              :limit="1"
              :headers="{token: this.$getUserInfo('token')}"
              :action="$url.work_order_handle_upload_test_report"
              :auto-upload="false"
              :beforeUpload="beforeFileUpload"
              :onSuccess="afterLoadSuccess"
              :onError="afterLoadError"
              @onUploadFiles="onUploadFiles"
        >
          <el-button slot="trigger" type="primary" size="mini-extral">选取文件</el-button>
          <!--<el-button style="margin-left: 10px;" type="success" size="mini-extral" @click="handleSubmitUpload">上传到服务器</el-button>-->
        </el-upload>
      </el-form-item>
      <el-form-item label="审批意见" prop="comment" class="comment">
        <el-input v-model="handleInfo.comment"
                  type="textarea"
                  :rows="2"
                  placeholder="无"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="section-footer">
      <el-button
              size="mini"
              type="primary"
              @click="handleButtonClick('close')">关闭</el-button>
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
  #work-order-handle {
    margin: 25px auto;
    width: 80%;
    .section-title {
      text-align: center;
      margin: 15px 0px;
    }
    .section-footer {
      text-align: center;
    }
    .el-form {
      .el-form-item {
        margin-bottom: 6px;
        &.test-type, &.test-report, &.comment {
          margin-bottom: 14px;
        }
        &.notify-user-list, &.mail-group-list{
          .el-form-item__content {
            span::after {
              content: '，';
            }
            span:last-child::after {
              content: '';
            }
          }
        }
      }
    }
  }
</style>

<script>
  import WorkOrderPropUtils from '../utils/work-order-props';
  import ElSelect from "element-ui/packages/select/src/select";
  import ElOption from "element-ui/packages/select/src/option";
  import ElFormItem from "element-ui/packages/form/src/form-item";
  export default {
    components: {ElFormItem, ElOption, ElSelect}, created() {

    },
    mounted() {
      let workOrder = this.$store.getters['app/currentWorkOrder'];
      if (!workOrder || !workOrder.hasOwnProperty('id')) {
        this.$router.push('/profile/work-order/todo');
        return;
      }
      this.$nextTick(() => {
//        this.getWorkOrderDetail(workOrder)
        WorkOrderPropUtils.getWorkOrderDetailByBasic(this, workOrder).then(detail => {
          console.log(detail);
          this.workOrderDetail = detail;
        }).catch(err => {
        })
      });
    },
    data() {
      return {
        workOrderDetail: {},
        testTypeList: [{
          label: '系统测试',
          value: 'SYSTEM_TEST'
        }, {
          label: '简版测试',
          value: 'SIMPLE_TEST'
        }, {
          label: '跳过测试',
          value: 'SKIP_TEST'
        }],
        handleInfo: {
          testType: '',
          fileList2Upload: [],
          comment: '',
        },
        rules: {
          testType: [{
            required: true,
            message: '请选择测试类型',
            trigger: 'blur'
          }],
          fileList2Upload: [{
            type: 'array',
            required: true,
            message: '请上传测试文件',
            trigger: 'blur'
          }],
          comment: [{
            required: false,
            message: '拒绝处理必须填写审批意见',
            trigger: 'blur'
          }],
        },

        showLoading: false,
        loadingText: ''
      }
    },
    methods: {
      handleSubmitUpload() {
        this.$refs.upload.submit();
      },
      beforeFileUpload(file) {
        console.log('beforeFileUpload');
        return new Promise((resolve, reject) => {
          let isExcel = false;
          if (file) {
            if (/\.xls$/.exec(file.name) || /\.xlsx$/.exec(file.name)) {
              isExcel = true;
            }
          }
          isExcel = true;
          if (isExcel) {
            resolve(file);
          } else {
            reject(null);
            this.$message({
              type: 'error',
              message: '只能上传以.xls或.xlsx为后缀的excel文件'
            });
          }
        })
      },
      /**
       * callback of upload success
       * @param res, not used
       * @param file, the file upload just now
       * @param uploadFiles, all files in uploadlist, including the files has been upload
       */
      afterLoadSuccess(res, file, uploadFiles) {
//        this.$message.success(`${file.name}上传成功`);
      },
      afterLoadError(err, rawFile) {
        if (err) {
//          this.$message.error(`${rawFile.name}上传失败`);
        }
      },
      onUploadFiles(value) {
        this.handleInfo.fileList2Upload = value;
      },

      handleButtonClick(action) {
        switch (action) {
          case 'close':
            this.$router.go(-1);
            break;
          case 'finish-handle':
            this.handleSubmit(false);
            break;
          case 'reject-handle':
            this.handleSubmit(true);
            break;
        }
      },
      handleSubmit(reject) {
        // change rules according to user select
        this.rules.comment[0].required = reject;
        this.rules.fileList2Upload[0].required = this.handleInfo.testType != 'SKIP_TEST';
        if (!WorkOrderPropUtils.checkComment(this.handleInfo.comment)) {
          this.$message.error('评论内容只能包含字母，数字，下划线，中划线等常规字符');
          return;
        }

        this.$refs.hasOwnProperty('handle-form')  && this.$refs['handle-form'].validate(valid => {
          if (valid) {
            this.showLoading = true;
            this.loadingText = '正在处理工单"' + this.workOrderDetail.name + '"';
            let options = {
              id: this.workOrderDetail.id,
              handleResult: !reject,
              status: this.workOrderDetail.status,
              testType: this.handleInfo.testType,
              remark: this.handleInfo.comment
            };
//            console.log(options);
            this.handleSubmitUpload();
            this.$net.handleWorkOrder(options).then(msg => {
              console.log(msg);
              this.$alert('即将进入待办工单列表页', msg, {
                confirmButtonText: '确定',
                callback: () => {
                  this.$router.push('/profile/work-order/todo');
                }
              });
              this.showLoading = false;
              this.loadingText = '';
            }).catch(msg => {
              console.log(msg);
              this.$alert('请与管理员联系，即将进入待办工单列表页', msg, {
                confirmButtonText: '确定',
                callback: () => {
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