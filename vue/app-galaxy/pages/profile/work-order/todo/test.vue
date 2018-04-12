<template>
  <div id="work-order-test">
    <div class="section-title">
      <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
        <div slot="content">
          <div>工单测试注意事项</div>
          <div>1. 测试类型为跳过测试的情况下，不需要上传测试报告，其它情况均需要上传测试报告</div>
          <div>2. 如果选择拒绝处理，必须给出审批意见</div>
          <div>3. 测试报告只能上传一个文件</div>
        </div>
        <span>测试工单<i class="el-icon-question"></i></span>
      </el-tooltip>
    </div>

    <div class="section-body">
      <my-show-detail :workOrderDetail="workOrderDetail" :showTestLog="false"></my-show-detail>
      <el-form labelWidth="110px" size="mini" :model="handleInfo" :rules="rules" ref="handle-form">
        <el-form-item label="测试类型" prop="testType" class="test-type">
          <el-select  v-model="handleInfo.testType">
            <el-option v-for="item in testTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="测试报告" class="test-log-list" prop="testLogListAll" >
          <div class="test-log"
               v-for="(item, index) in workOrderDetail.testLogList" :key="index" v-if="workOrderDetail.testLogList.length>0">
            <a :href="item.url">{{item.name}}</a>
            <el-popover width="200"
                        v-model="item.openPopover"
                        placement="right"
                        trigger="click"
                        popperClass="el-popover--small">
              <p style="color: #fa5555">确定要删除测试报告《{{item.name}}》吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="handlePopoverButton('cancel', index, item)">取消</el-button>
                <el-button type="danger" size="mini-extral" @click="handlePopoverButton('delete-test-log', index, item)">确定</el-button>
              </div>
              <i slot="reference" class="el-icon-close" @click="handleButtonClick('delete-test-log', index, item)"></i>
            </el-popover>
          </div>
          <span v-else>无</span>
          <el-upload
                  class="upload-demo"
                  ref="upload"
                  :headers="{token: this.$getUserInfo('token')}"
                  :data="{'id': this.workOrderDetail.id}"
                  :action="$url.work_order_handle_upload_test_report"
                  :auto-upload="false"
                  :beforeUpload="beforeFileUpload"
                  :onChange="onFileChange"
                  :onRemove="onFileRemove"
                  :onSuccess="afterLoadSuccess"
                  :onError="afterLoadError"
                  :multiple="true"
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
                    placeholder="不超过200个字符"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
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
  #work-order-test {
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    width: 800px;
    margin: 20px;
    margin-left: 30px;
    padding: 18px;
    .el-form {
      .el-form-item {
        .el-textarea {
          textarea {
            font-size: 12px;
          }
        }
      }
    }
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
        &.test-type, &.comment {
          margin-bottom: 14px;
        }
        &.test-log-list {
          margin-bottom: 14px;
          .test-log {
            &:first-child {
              margin-top: 3px;
            }
            margin: 0px 5px;
            line-height: 1.4;
            a {
              color: blue;
            }
            .el-icon-close {
              margin-left: 5px;
              &:hover{
                font-weight: bold;
              }
            }
          }
          .el-upload-list {
            li {
              margin: 0px;
            }
          }
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
  import MyShowDetail from '../utils/components/show-detail.vue';
  import ElSelect from "element-ui/packages/select/src/select";
  import ElOption from "element-ui/packages/select/src/option";
  import ElFormItem from "element-ui/packages/form/src/form-item";
  export default {
    components: {MyShowDetail, ElFormItem, ElOption, ElSelect}, created() {

    },
    mounted() {
      let workOrderDetail = this.$storeHelper.getTmpProp('workOrderDetail');
      if (!workOrderDetail || !workOrderDetail.hasOwnProperty('id')) {
        this.$router.push('/profile/work-order/todo');
        return;
      }
      this.workOrderDetail = workOrderDetail;
      if (workOrderDetail.hasOwnProperty('testLogList')) {
        this.handleInfo.testLogListAll = workOrderDetail.testLogList;
      } else {
        this.handleInfo.testLogListAll = [];
      }
    },
    data() {
      return {
        workOrderDetail: {},
        testTypeList: WorkOrderPropUtils.getAllTestType(),
        handleInfo: {
          testType: '',
          testLogListAll: [],
          comment: '',
        },
        rules: {
          testType: [{
            required: true,
            message: '请选择测试类型',
            trigger: 'blur'
          }],
          testLogListAll: [{
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
        fileListToUpload: [],

        showLoading: false,
        loadingText: '',
        uploadFileSuccessCount: 0,
        rejectHandle: null
      }
    },
    watch: {
      'handleInfo.testType': function (value) {
        if ('SKIP_TEST' === value) {
          this.rules.testLogListAll = [{
            type: 'array',
            required: false,
          }];
        } else {
          this.rules.testLogListAll =[{
            type: 'array',
            required: true,
            message: '请上传测试文件',
            trigger: 'blur'
          }];
        }
      }
    },
    methods: {
      onFileChange(file, fileList) {
        this.fileListToUpload = fileList;
      },
      onFileRemove(file, fileList) {
        this.fileListToUpload = fileList;
      },
      onUploadFiles(fileList) {
        this.handleInfo.testLogListAll = this.workOrderDetail.testLogList.concat(fileList);
      },
      beforeFileUpload(file) {
//        console.log('beforeFileUpload');
        return new Promise((resolve, reject) => {
          let isExcel = false;
          if (file) {
            if (/\.xls$/.exec(file.name) || /\.xlsx$/.exec(file.name)) {
              isExcel = true;
            }
          }
          // un-check file type
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
       * uploadWorkOrder is called after all file upload success
       * @param res, not used
       * @param file, the file upload just now
       * @param uploadFiles, all files in uploadlist, including the files has been upload
       */
      afterLoadSuccess(res, file, uploadFiles) {
        this.uploadFileSuccessCount += 1;
//        console.log(this.handleInfo.testLogListAll);
//        console.log(this.workOrderDetail.testLogList);
//        console.log(this.uploadFileSuccessCount);
        if (this.uploadFileSuccessCount == this.handleInfo.testLogListAll.length - this.workOrderDetail.testLogList.length) {
          this.submitWorkOrder();
        }
      },
      afterLoadError(err, file, uploadFiles) {
//        console.log(err, file, uploadFiles)
        if (err) {
          this.$notify.error({
            title: '提示',
            message: `${file.name}上传失败`,
            duration: 0,
            onClose: function () {
            }
          });
        }
      },

      handleButtonClick(action, index, item) {
        switch (action) {
          case 'close':
            this.$router.go(-1);
            break;
          case 'finish-handle':
            this.rejectHandle = false;
            this.handleSubmit();
            break;
          case 'reject-handle':
            this.rejectHandle = true;
            this.handleSubmit();
            break;
          case 'delete-test-log':
            item.openPopover = true;
            break;
        }
      },
      handlePopoverButton(action, index, item) {
        switch (action) {
          case 'delete-test-log':
            item.openPopover = false;
            if (item.hasOwnProperty('id')) {
              this.$net.workOrderRemoveTestReport(item.id).then(msg => {
                this.workOrderDetail.testLogList.splice(index, 1);
                this.$message.success(msg);
              }).catch(msg => {
                this.$notify.error({
                  title: '删除失败',
                  message: msg,
                  duration: 0,
                  onClose: function () {
                  }
                });
              })
            }
            break;
          case 'cancel':
            item.openPopover = false;
            break;
        }
      },

      handleSubmit(reject) {
        // change rules according to user select
        this.rules.comment[0].required = this.rejectHandle;
        this.rules.testLogListAll[0].required = this.handleInfo.testType != 'SKIP_TEST';
        if (!WorkOrderPropUtils.checkComment(this.handleInfo.comment)) {
          this.$message.error('评论内容只能包含字母，数字，下划线，中划线等常规字符');
          return;
        }

        this.$refs.hasOwnProperty('handle-form')  && this.$refs['handle-form'].validate(valid => {
          if (valid) {
            this.showLoading = true;
            this.loadingText = '正在处理工单"' + this.workOrderDetail.name + '"';
            // submitWorkOrder directly when testType === 'SKIP_TEST' or length of fileListToUpload is zero,
            // or submitWorkOrder will be trigger after all file is upload success
            if (this.handleInfo.testType === 'SKIP_TEST' || this.fileListToUpload.length === 0) {
              this.submitWorkOrder();
            } else {
              this.uploadFileSuccessCount = 0;
              this.$refs.upload.submit();
            }
          }
        });
      },

      submitWorkOrder() {
        let options = {
          id: this.workOrderDetail.id,
          // 处理完成 or 拒绝处理
          handleResult: !this.rejectHandle,
          status: this.workOrderDetail.status,
          testType: this.handleInfo.testType,
          remark: this.handleInfo.comment
        };
        this.$net.handleWorkOrder(options).then(msg => {
//          console.log(msg);
          this.$alert('处理成功！即将进入待办工单页。', msg, {
            confirmButtonText: '确定',
            callback: () => {
              this.$router.push('/profile/work-order/todo');
            }
          });
          this.showLoading = false;
          this.loadingText = '';
        }).catch(msg => {
//          console.log(msg);
          this.$alert('处理失败！请与管理员联系。点击确定，进入待办工单列表页', msg, {
            confirmButtonText: '确定',
            callback: () => {
              this.$router.push('/profile/work-order/todo');
            }
          });
          this.showLoading = false;
          this.loadingText = ''
        });
      }
    }
  }
</script>