<template>
  <div id="user-feedback">
    <div class="header">
      <el-button size="mini"
                 type="primary"
                 @click="handleButtonClick($event, 'feedback_create')">
        <span>提交建议</span>
      </el-button>
      <el-button size="mini"
                 type="primary"
                 @click="handleButtonClick($event, 'feedback_list_refresh')">
        <span>刷新列表</span>
      </el-button>
    </div>
    <div class="feedback-list">
      <el-table :data="feedbackListByPage"
                stripe
                :height="heightOfTable">
        <el-table-column label="创建时间" prop="formattedCreateTime" headerAlign="center" align="center" width="100">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="title" headerAlign="center" align="center" minWidth="80">
        </el-table-column>
        <el-table-column label="问题描述" prop="issue" headerAlign="center" align="center" minWidth="100">
        </el-table-column>
        <el-table-column label="解决方案" prop="suggestion" headerAlign="center" align="center" minWidth="100">
        </el-table-column>
        <el-table-column label="附件" headerAlign="center" align="center" minWidth="80">
          <template slot-scope="scope">
            <span class="picture-navigate" @click="handleTRClick($event, 'picture-navigate', scope.row)">{{scope.row.pictureName ? scope.row.pictureName: '无'}}</span>
            <!--<el-button-->
                    <!--type="text" class="primary"-->
                    <!--@click="handleTRButton('show-content', scope.$index, scope.row)"-->
                    <!--:class="{'expand': expandRows.indexOf(scope.row.id) > -1}"-->
                    <!--:loading="statusOfWaitingResponse('show-content') && operation.group.id == scope.row.id">-->
              <!--<span>详情</span>-->
              <!--<i class="el-icon-arrow-right"></i>-->
            <!--</el-button>-->
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize">
        <div class="pagination">
          <el-pagination
                  :current-page="currentPage"
                  size="large"
                  layout="prev, pager, next"
                  :page-size = "pageSize"
                  :total="totalSize"
                  @current-change="handlePaginationPageChange"
          >
          </el-pagination>
        </div>
      </div>
    </div>

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
    <paas-show-with-modal ref="paas-show-with-modal">
    </paas-show-with-modal>
  </div>
</template>
<style lang="scss" scoped>
  #user-feedback {
    height: 100%;
    display: flex;
    flex-direction: column;
    & > .header {
      padding: 3px 5px;
    }
    .feedback-list {
      flex: 1;
      position: relative;
    }
  }
</style>
<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  import PaasShowWithModal from 'assets/components/show-with-modal';
  export default {
    components: {PaasShowWithModal},
    mixins: [commonUtils],
    created() {
    },
    mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);
      this.updateFeedbackListByPage(true);
      console.log(this.$refs);
    },
    data() {
      return {
        heightOfTable: '',
        totalSize: 0,
        pageSize: 12,
        currentPage: 1,

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
        },

        feedbackListByPage: [],
        feedbackList: []
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
          this.heightOfTable = this.$el.clientHeight - headerHeight - 10;
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

      async getFeedbackList() {
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.feedback_list);
        console.log(resContent);
        this.feedbackList = resContent;
      },
      async updateFeedbackListByPage(refresh) {
        if (refresh) {
          await this.getFeedbackList();
        }
        this.feedbackListByPage = this.feedbackList;
        this.feedbackListByPage.forEach(it => {
          if (it['createTime']) {
            it['formattedCreateTime'] = this.$utils.formatDate(it['createTime'], 'yyyy-MM-dd hh:mm:ss').split(' ');;
          }
        })
      },

      async handleButtonClick(evt, action) {
        var payload = {};
        var resContent = null;
        switch (action) {
          case 'feedback_list_refresh':
            this.updateFeedbackListByPage(true);
            break;
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
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.feedback_create, {
                payload: formData,
              });
              this.closeDialog();
              this.handleButtonClick(evt, 'feedback_list_refresh');
            } catch(err) {
//              console.log()
            }
            break;
        }
      },
      async handleTRClick(evt, action, row) {
        switch (action) {
          case 'picture-navigate':
            const response = await this.$net.getResponse(this.$net.URL_LIST.feedback_get_picture, {
              params: {
                feedbackId: row.id
              }
            }, {
              timeout: 600000,
              headers: {
                token: this.$storeHelper.getUserInfo('token')
              },
              responseType: 'blob'
            });
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(response.data);
              reader.onload = function() {
                var result = reader.result;
                resolve(result);
              };
              reader.onerror = function(e) {
                reject(e)
              };
            });

            this.$refs['paas-show-with-modal'] && this.$refs['paas-show-with-modal'].show(this.$createElement('img', {
              attrs: {
                src: base64
              }
            }));
            break;
        }
      }
    }
  }
</script>