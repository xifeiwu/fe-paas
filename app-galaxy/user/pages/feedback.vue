<template>
  <div id="user-feedback">
    <div class="header">
      <el-button size="mini"
                 type="primary"
                 @click="handleButtonClick($event, 'feedback_create')">
        <span>提交建议</span>
      </el-button>
    </div>
    <div class="feedback-list">feedback list</div>


    <el-dialog title="创建反馈建议"
               :visible="action.name == 'feedback_create'"
               v-if="action.name == 'feedback_create'"
               @close="closeDialog"
               class="size-700"
               :close-on-click-modal="false"
    >
      <el-form labelWidth="100px" size="mini" :rules="rulesForCreate" :model="action.data" ref="formForCreate">
        <el-form-item label="标题" prop="title">
          <el-input v-model="action.data.title" placeholder="不超过100个字符"></el-input>
        </el-form-item>
        <el-form-item label="问题描述" prop="issue">
          <el-input type="textarea"  :rows="3" v-model="action.data.issue" placeholder="不超过512个字符"></el-input>
        </el-form-item>
        <el-form-item label="建议方案" prop="suggestion">
          <el-input type="textarea"  :rows="3" v-model="action.data.suggestion" placeholder="不超过512个字符"></el-input>
        </el-form-item>
        <el-form-item label="附件">
          <!--<label style="position: relative;">-->
            <!--<span class="button">上传文件</span>-->
            <!--<input class="button" type="file" name="fileList" title="上传文件" style="width: 0px; height: 0px; position: absolute; left: -9999px"-->
                   <!--@change.native="evt => console.log(evt.target.files)">-->
          <!--</label>-->
          <input class="button" type="file" title="上传文件" value="上传文件" :multiple="false"
                 @change="handleInputChange($event)">
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogEvent($event, 'feedback_create')"
                     :loading="statusOfWaitingResponse('feedback_create')">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button @click="closeDialog">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
  #user-feedback {
  }
</style>
<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    mixins: [commonUtils],
    created() {
    },
    mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    data() {
      return {
        heightOfTable: '',
        rulesForCreate: {
          title: [{
            required: true,
            message: '请填写标题',
          }, {
            validator(rule, values, callback) {
              if (values.length > 100) {
                callback('不能超过100个字符')
              } else {
                callback();
              }
            }
          }],
          issue: [{
            required: true,
            message: '请填写问题描述',
          }, {
            validator(rule, values, callback) {
              if (values.length > 512) {
                callback('不能超过800个字符')
              } else {
                callback();
              }
            }
          }],
          suggestion: [{
            validator(rule, values, callback) {
              if (values.length > 512) {
                callback('不能超过800个字符')
              } else {
                callback();
              }
            }
          }],
        }
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
    },
    computed: {
    },
    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          return;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
        } catch(err) {
        }
      },
      handleInputChange(evt) {
        this.action.data.picture = evt.target.files[0];
      },
      async handleDialogEvent(evt, action) {
        var valid, errors;
        try {
          switch (action) {
            case 'feedback_create':
              [valid, errors] = await this.$refs['formForCreate'].validate();
              if (valid) {
                this.action.promise.resolve(this.action.data);
              }
              break;
          }
        } catch(err) {
        }
      },
      async handleButtonClick(evt, action) {
        var payload = {};
        var resContent = null;
        switch (action) {
          case 'feedback_create':
            try {
              payload = await this.openDialog(action, {
                title: '',
                issue: '',
                suggestion: '',
                picture: null
              });
              var formData = new FormData();
              for (let key in payload) {
                if (key === 'picture' && payload[key] === null) {
                  continue;
                }
                formData.append(key, payload[key]);
              }
              var testUrl = {
                path: 'http://172.16.112.199:3000/api/post/bin',
                method: 'post'
              };
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.feedback, {
                payload: formData
              });
            } catch(err) {
//              console.log()
            }
            break;
        }
      }
    }
  }
</script>