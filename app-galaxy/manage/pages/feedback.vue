<template>
  <div id="manage-feedback">
    <div class="header">
      <el-button size="mini"
                 type="primary"
                 v-if="false"
                 @click="handleButtonClick($event, 'feedback_create')">
        <span>提交建议</span>
      </el-button>
      <div class="item">
        <label>申请时间:</label>
        <el-date-picker style="display: inline-block; width: 220px;"
                        class="custom disable-close"
                        v-model="searchForm.dateRange"
                        type="daterange"
                        size="mini"
                        align="right"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        :enableClose="false"
                        :picker-options="datePickerOptions">
        </el-date-picker>
      </div>
      <div class="item">
        <label>关键字:</label>
        <el-input v-model="searchForm.filterKey" placeholder="关键字包括标题、用户名"
                  size="mini" style="display: inline-block; width: 300px;">
          <i class="el-icon-search" slot="prefix" style="line-height: 26px;"></i>
          <i :class="searchForm.filterKey && searchForm.filterKey.length > 0 ? 'paas-icon-close' : 'hide'"
             slot="suffix" style="line-height: 26px;"
             @click="evt => evt.target.classList.contains('paas-icon-close') ? searchForm.filterKey = '' : ''"></i>
        </el-input>
      </div>
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
        <el-table-column label="提问人" prop="realName" headerAlign="center" align="center" width="80">
        </el-table-column>
        <el-table-column label="标题" prop="title" headerAlign="center" align="center" minWidth="80">
        </el-table-column>
        <el-table-column label="问题描述" prop="issue" headerAlign="center" align="center" minWidth="100">
        </el-table-column>
        <el-table-column label="解决方案" prop="suggestion" headerAlign="center" align="center" minWidth="100">
        </el-table-column>
        <el-table-column label="附件" headerAlign="center" align="center" minWidth="80">
          <template slot-scope="scope">
            <span :class="{'picture-navigate': true, 'has-picture': !!scope.row.pictureName}" @click="handleTRClick($event, 'picture-navigate', scope.row)">{{scope.row.pictureName ? scope.row.pictureName: '---'}}</span>
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
                  @current-change="page => {currentPage = page}"
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
  #manage-feedback {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: white;
    & > .header {
      padding: 3px 5px;
      font-size: 14px;
      .item {
        display: inline-block;
        margin-right: 6px;
        label {
          color: black;
          font-weight: bold;
        }
        .paas-icon-close {
          &:hover {
            color: black;
            cursor: pointer;
          }
        }
      }
    }
    .feedback-list {
      flex: 1;
      position: relative;
      .el-table {
        .picture-navigate {
          &.has-picture {
            color: #409EFF;
            &:hover {
              cursor: pointer;
            }
          }
        }
      }
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
      this.setDateRange();
      // updateFeedbackListByPage will triggered by change of searchForm.dateRange, so the following line is commented
      // this.updateFeedbackListByPage(true);
      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    data() {
      return {
        heightOfTable: '',
        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        searchForm: {
          dateRange: '',
          filterKey: ''
        },
        datePickerOptions: {
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
            text: '最近两个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 60);
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
      'searchForm.dateRange': function (value) {
        this.updateFeedbackListByPage(true);
      },
      'searchForm.filterKey': function (value) {
        this.updateFeedbackListByPage();
      },
      currentPage() {
        this.updateFeedbackListByPage();
      }
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
      setDateRange() {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 1000 * 3600 * 24 * 60);
        this.searchForm.dateRange = [start, end];
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
        var [startTime, endTime] = this.searchForm.dateRange;
        startTime = startTime.getTime();
        endTime = endTime.getTime();
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.feedback_list, {
          payload: {
            title: '',
            startTime,
            endTime
          }
        });
        this.feedbackList = resContent;
      },
      async updateFeedbackListByPage(refresh = false) {
        if (refresh) {
          await this.getFeedbackList();
        }
        const filteredList = this.feedbackList.filter(it => {
          return new RegExp(this.searchForm.filterKey).exec(['title', 'realName'].map(key => it[key]).join(''));
        });
        this.totalSize = filteredList.length;

        var page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;
        this.feedbackListByPage = filteredList.slice(start, end);
        this.feedbackListByPage.forEach(it => {
          if (it['createTime']) {
            it['formattedCreateTime'] = this.$utils.formatDate(it['createTime'], 'yyyy-MM-dd hh:mm:ss').split(' ');
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
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.feedback_create, {
                payload: formData,
              });
              this.handleButtonClick(evt, 'feedback_list_refresh');
            } catch(err) {
            } finally {
              this.closeDialog();
            }
            break;
        }
      },
      async handleTRClick(evt, action, row) {
        switch (action) {
          case 'picture-navigate':
            if (!row.pictureName) {
              return;
            }
            this.$net.addToRequestingRrlList(this.$net.URL_LIST.feedback_get_picture.path);
            try {
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
                reader.onload = function () {
                  var result = reader.result;
                  resolve(result);
                };
                reader.onerror = function (e) {
                  reject(e)
                };
              });

              this.$refs['paas-show-with-modal'] && this.$refs['paas-show-with-modal'].show(this.$createElement('img', {
                attrs: {
                  src: base64
                }
              }));
            } catch(err) {
            } finally {
              this.$net.removeFromRequestingRrlList(this.$net.URL_LIST.feedback_get_picture.path);
            }
            break;
        }
      }
    }
  }
</script>