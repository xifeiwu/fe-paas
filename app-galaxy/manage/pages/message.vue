<template>
  <div id="manage-message">
    <div class="header">
      <div class="item">
        <el-button type="primary" size="mini" @click="handleClick('message_create')">创建站内信</el-button>
        <el-button type="primary" size="mini" @click="handleClick('refresh')">刷新</el-button>
      </div>

      <label class="item">
        <span style="font-weight: bold">消息类型:</span>
        <el-select v-model="messageTypeSelect" placeholder="请选择">
          <el-option value="ALL" label="全部"></el-option>
          <el-option value="PRODUCT_ANNOUNCEMENT" label="产品公告"></el-option>
          <el-option value="PLATEFORM_ANNOUNCEMENT" label="平台公告"></el-option>
          <el-option value="ALERT" label="弹窗消息"></el-option>
        </el-select>
      </label>

      <label class="item">
        <span style="font-weight: bold">接收团队:</span>
        <el-select filterable v-model="groupIdSelect" placeholder="请选择">
          <el-option v-for="(item, index) in groupList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </label>
    </div>
    <div class="list">
      <el-table
              :data="messageListByPage"
              style="width: 100%"
              stripe
              :height="heightOfTable"
      >
        <el-table-column prop="messageTypeName" label="消息类型" width="80"></el-table-column>
        <el-table-column prop="title" label="标题" minWidth="100"></el-table-column>
        <el-table-column prop="content" label="内容" minWidth="200">
          <!--<template slot-scope="scope">-->
            <!--<el-scrollbar style="max-height: 300px;">-->
              <!--<div v-html="scope.row.htmlContent"></div>-->
            <!--</el-scrollbar>-->
          <!--</template>-->
        </el-table-column>
        <el-table-column label="接收团队" minWidth="100" headerAlign="center" align="center">
          <template slot-scope="scope">
            <div class="group-name-div">
              <span v-for="(item,index) in scope.row.messageGroupList" class="group-name-span">{{item.name}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="formattedReleaseTime" label="发布时间" width="200" headerAlign="center" align="center"></el-table-column>
        <el-table-column prop="releaseStatusName" label="状态" width="80"></el-table-column>
        <el-table-column label="操作" width="160" headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.releaseStatus === 'NO_RELEASE' || scope.row.releaseStatus === 'CANCEL'"
                       type="text"
                       :class="['flex', 'warning']"
                       @click="handleTRClick($event, 'message_publish', scope.$index, scope.row)">
              <span>发布</span>
            </el-button>
            <div class="ant-divider" v-if="scope.row.releaseStatus === 'NO_RELEASE' || scope.row.releaseStatus === 'CANCEL'"></div>
            <el-button v-if="scope.row.releaseStatus === 'NO_RELEASE' || scope.row.releaseStatus === 'CANCEL'"
                       type="text"
                       :class="['flex', 'warning']"
                       @click="handleTRClick($event, 'message_modify', scope.$index, scope.row)">
              <span>修改</span>
            </el-button>
            <div class="ant-divider" v-if="scope.row.releaseStatus === 'NO_RELEASE' || scope.row.releaseStatus === 'CANCEL'"></div>
            <el-button
                    v-if="scope.row.releaseStatus === 'RELEASE'"
                    type="text"
                    :class="['flex', 'warning']"
                    @click="handleTRClick($event, 'message_withdraw', scope.$index, scope.row)">
              <span>撤销</span>
            </el-button>
            <div class="ant-divider" v-if="scope.row.releaseStatus === 'RELEASE'"></div>
            <el-button
                    type="text"
                    :class="['flex', 'primary']"
                    @click="handleTRClick($event, 'html_preview', scope.$index, scope.row)">
              <span>预览</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize">
        <div class="pagination">
          <el-pagination
                  :current-page="currentPage"
                  size="large"
                  layout="prev, pager, next"
                  :page-size="pageSize"
                  :total="totalSize"
                  @current-change="page => {currentPage = page}"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <el-dialog :title="action.name == 'message_create'?'创建站内信':'修改站内信'"
               :visible="action.name == 'message_create' || action.name == 'message_modify'"
               v-if="action.name == 'message_create' || action.name == 'message_modify'"
               @close="closeDialog"
               class="size-900"
               :close-on-click-modal="false"
    >
      <el-form labelWidth="100px" size="mini" :rules="rulesForMessageCreate" :model="action.data" ref="formForMessageCreate">
        <el-form-item label="标题" prop="title">
          <el-input v-model="action.data.title" placeholder="不超过100个字符"></el-input>
        </el-form-item>
        <el-form-item label="消息类型" prop="messageTypeId">
          <el-select filterable v-model="action.data.messageTypeId" placeholder="请选择">
          <el-option v-for="(item, index) in messageTypeList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
        </el-form-item>
        <el-form-item label="接受团队" prop="groupIdList" class="receive-group">
          <el-select filterable v-model="action.data.groupIdList" placeholder="请选择" multiple>
            <el-option v-for="(item,index) in groupListWithoutAll" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content" placeholder="不超过800个字符">
          <el-input type="textarea"  :rows="8" v-model="action.data.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogEvent($event, 'message_create_confirm')"
                     :loading="statusOfWaitingResponse('app-message_create_confirm')">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button @click="closeDialog">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="预览"
               v-if="action.name === 'html_preview'"
               :visible="action.name === 'html_preview'"
               @close="closeDialog"
               class="size-900 html-preview"
               :close-on-click-modal="false"
    >
      <el-scrollbar style="height: 560px;">
        <div v-html="action.data" class="markdown-body" style="text-align: left"></div>
      </el-scrollbar>
    </el-dialog>

  </div>
</template>

<style lang="scss" >
  #manage-message {
    height: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    .header {
      padding: 3px 5px;
      background-color: white;
      display: flex;
      align-items: center;
      .item {
        display: inline-block;
        margin-right: 20px;
        span {
          font-size: 14px;
        }
        .el-select {
          input {
            height: 24px;
          }
          max-width: 190px;
        }
      }
    }
    .list {
      flex: 1;
      position: relative;
      .el-table__body-wrapper {
        .el-table__body {
          .el-table__row {
            .group-name-div {
              .group-name-span {
                box-sizing: border-box;
                border-color: transparent;
                margin: 2px 0 2px 6px;
                background-color: #f0f2f5;
                color: #909399;
                line-height: 22px;
                font-size: 13px;
              }
            }
          }
        }
      }
    }
    .el-dialog__wrapper {
      &.html-preview {
        .el-dialog__body {
          padding: 0px 3px;
        }
      }
    }
    .el-dialog {
      .el-dialog__body {
        .el-form-item {
          &.receive-group .el-form-item__content {
            .el-select {
              width: 100%;
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #manage-message {
    height: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    .header {
      padding: 3px 5px;
      background-color: white;
    }
    .list {
      flex: 1;
      position: relative;
    }
  }
</style>

<script>
  import {mapState} from "vuex";
  import commonUtils from 'assets/components/mixins/common-utils';
  import markdown from 'assets/components/markdown/markdown.js';
  export default {
    mixins: [markdown, commonUtils],
    created() {
    },
    mounted() {
      // update value in next tick
      setTimeout(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
      this.requestMessageListByPage(true);
    },
    beforeDestroy() {
    },
    data() {
      return {
        heightOfTable: '',
        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        messageTypeSelect: "ALL",
        messageTypeList: null,
        messageList: [],
        messageListByPage: [],
        messageListFilter: [],
        groupIdSelect: '',

        action: {
          name: null,
          promise: {
            resolve: () => {},
            reject: () => {},
          },
          dataOrigin: null,
          data: null
        },

        rulesForMessageCreate: {
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
          messageTypeId: [{
            required: true,
            message: '请选择消息类型',
          }],
          content: [{
            required: true,
            message: '请填写消息体',
          }, {
            validator(rule, values, callback) {
              if (values.length > 800) {
                callback('不能超过800个字符')
              } else {
                callback();
              }
            }
          }],
          groupIdList: [{
            required: true,
            message: '请选择接受团队',
          }, {
            validator(rule, values, callback) {
              if (values.length > 1 && values.indexOf(-1) > -1) {
                callback("若选择“所有团队”，则不能选择其他团队");
              } else {
                callback();
              }
            }
          }]
        }
      }
    },
    watch: {
      'messageTypeSelect': function () {
        this.filterMessageListByPage();
      },
      'groupIdSelect': function () {
        this.filterMessageListByPage();
      },
      '$storeHelper.screen.size': 'onScreenSizeChange',
      currentPage() {
        this.requestMessageListByPage(false);
      }
    },
    computed: {
      groupList() {
        if (this.$storeHelper.groupListAll) {
          return [{id: '', name: '全部'}, {id: -1, name: '--所有团队--'}].concat(this.$storeHelper.groupListAll);
        } else {
          return [];
        }
      },
      groupListWithoutAll() {
        if (this.$storeHelper.groupListAll) {
          return [{id: -1, name: '--所有团队--'}].concat(this.$storeHelper.groupListAll);
        } else {
          return [];
        }
      }
    },

    methods: {
      onScreenSizeChange(size) {
//        console.log(this.$storeHelper.screen);
        if (!size) {
          return;
        }
        try {
          // if this.showAppList == false, headerNode will not exist
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
        } catch(err) {
        }
      },
      openDialog(name, data) {
        this.action.dataOrigin = data;
        this.action.data = this.$utils.cloneDeep(data);
        this.action.name = name;

        return new Promise((resolve, reject) => {
          this.action.promise.resolve = resolve;
          this.action.promise.reject = reject;
        });
      },
      closeDialog() {
        this.action.name = null;
        this.action.promise.reject('cancel');
      },
      async handleDialogEvent(evt, action) {
        var valid, errors;
        try {
          switch (action) {
            case 'message_create_confirm':
              [valid, errors] = await this.$refs['formForMessageCreate'].validate();
              if (valid) {
                this.action.promise.resolve(this.action.data);
              }
              break;
          }
        } catch(err) {
        }
      },

      /**
       * get all message type list
       * used in: 1. start of page, 2. before open dialog for message_create
       */
      async getMessageTypeList() {
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.message_type_list);
        return resContent;
      },

      async requestMessageList() {
        const statusMap = {
          RELEASE: '已发布',
          NO_RELEASE: '未发布',
          CANCEL: '撤销'
        };
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.message_list);
        const messageList = resContent.map(it => {
          if (it.releaseTime) {
            it['formattedReleaseTime'] = this.$utils.formatDate(it.releaseTime, 'yyyy-MM-dd hh:mm:ss');
          } else {
            it['formattedReleaseTime'] = '---';
          }
          if (it["messageGroupList"].length === 0) {
            it["messageGroupList"].push({id: -1, name: "--所有团队--"});
          }
          return it;
        });
        this.totalSize = messageList.length;
        this.currentPage = 1;
        this.messageList = messageList;
        return messageList;
      },

      async filterMessageListByPage() {
        this.messageListFilter = this.messageList;
        if (this.messageTypeSelect !== 'ALL') {
          this.messageListFilter = this.messageList.filter(it => it['messageType'] === this.messageTypeSelect);
        }

        if (this.groupIdSelect !== '') {
          this.messageListFilter = this.messageListFilter.filter(it => {
            return it["messageGroupList"].find(group => {
              return group.id === this.groupIdSelect;
            })
          });
        }

        this.totalSize = this.messageListFilter.length;
        this.pageSize = 12;
        this.currentPage = 1;

        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;
        this.messageListByPage = this.messageListFilter.slice(start, end);
      },

      async requestMessageListByPage(refresh = false) {
        if (refresh) {
          this.messageList = await this.requestMessageList();
          this.messageTypeSelect = "ALL";
          this.groupIdSelect = '';
        }

        var filteredMessageList = this.messageList;
        if (this.messageTypeSelect !== 'ALL') {
          filteredMessageList = this.messageList.filter(it => it['messageType'] === this.messageTypeSelect);
        }

        if (this.groupIdSelect !== '') {
          filteredMessageList = filteredMessageList.filter(it => it['groupId'] === this.groupIdSelect);
        }

        filteredMessageList.forEach(it => {
          try {
            it.htmlContent = this.$render(it.content);
          } catch (err) {
            it.htmlContent = '';
          }
        });

        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;
        this.messageListByPage = filteredMessageList.slice(start, end);
      },

      async handleClick(action) {
        var dialogData = null;
        var resContent = null;
        switch (action) {
          case 'message_create':
            try {
              if (!this.messageTypeList) {
                this.messageTypeList = await this.getMessageTypeList();
              }
//              console.log(this.messageTypeList);
              dialogData = await this.openDialog(action, {
                title: '',
                messageTypeId: this.messageTypeList[0]['id'],
                content: '',
                groupIdList: [],
              });
             // console.log(dialogData);
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.message_create, {
                payload: {
                  groupId: this.$storeHelper.globalUserGroupInfo.id,
                  title: dialogData['title'],
                  messageTypeId: dialogData['messageTypeId'],
                  content: dialogData['content'],
                  groupIdList: dialogData["groupIdList"].indexOf(-1) > -1 ? [] : dialogData["groupIdList"],
                  immediateRelease: false,
                }
              });
//              console.log(resContent);
              this.$message({
                type: 'success',
                message: '创建消息成功！'
              });
              this.requestMessageListByPage(true);
            } catch (err) {
              console.log(err);
            } finally {
              this.closeDialog();
            }
            break;
          case 'refresh':
            this.requestMessageListByPage(true);
            break;
        }
      },

      async handleTRClick(evt, action, index, row) {
        var resContent = null;
        var dialogData = null;
        this.action.row = row;
        switch (action) {
          case 'message_publish':
          case 'message_withdraw':
            try {
              var mapper = {
                'message_publish': {
                  action: '发布',
                  toStatus: 'RELEASE'
                },
                'message_withdraw': {
                  action: '撤销',
//                  toStatus: 'NO_RELEASE'
                  toStatus: 'CANCEL'
                }
              };
              const desc = `确定要${mapper[action]['action']}消息 "${row.title}" 吗？`;
              await this.$confirm(desc, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.message_change_status, {
                params: {
                  messageId: row.id
                },
                query: {
                  releaseStatus: mapper[action]['toStatus'],
                  groupId: this.$storeHelper.globalUserGroupInfo.id,
                }
              });
//              console.log(resContent);
              this.$message.success(`${mapper[action]['action']}成功！`);
              this.requestMessageListByPage(true);
            } catch (err) {
              console.log(err);
            }

            break;
          case 'message_modify':
            try {
              if (!this.messageTypeList) {
                this.messageTypeList = await this.getMessageTypeList();
              }
              let groupIdList = [];
              row["messageGroupList"].forEach(it => {
                groupIdList.push(it.id);
              });
              dialogData = await this.openDialog(action, {
                  title: row.title,
                  messageTypeId:row.messageTypeId,
                  messageId: row.id,
                  content: row.content,
                  groupIdList: groupIdList,
                });
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.message_modify, {
                payload: {
                  title: dialogData['title'],
                  messageTypeId: dialogData['messageTypeId'],
                  content: dialogData['content'],
                  messageId: dialogData['messageId'],
                  groupIdList: dialogData["groupIdList"].indexOf(-1) > -1 ? [] : dialogData["groupIdList"],
                }
              });
              this.$message({
                type: 'success',
                message: '修改消息成功！'
              });
              this.requestMessageListByPage(true);
            } catch (err) {
              console.log(err);
            } finally {
              this.closeDialog();
            }
            break;
          case 'html_preview':
            dialogData = await this.openDialog(action, this.$render(row.content));
            break;
        }
      },
    }
  }
</script>