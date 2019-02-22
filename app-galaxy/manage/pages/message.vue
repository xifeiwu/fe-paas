<template>
  <div id="manage-message">
    <div class="header">
      <div class="item">
        <el-button type="primary" size="mini" @click="handleClick('message_create')">创建站内信</el-button>
      </div>
      <div class="item">
        <el-button type="primary" size="mini" @click="handleClick('refresh')">刷新</el-button>
      </div>
    </div>
    <div class="list">
      <el-table
              :data="messageList"
              style="width: 100%"
              stripe
              :height="heightOfTable"
      >
        <el-table-column prop="messageTypeName" label="消息类型" idth="80"></el-table-column>
        <el-table-column prop="title" label="标题" minWidth="100"></el-table-column>
        <el-table-column prop="content" label="内容" width="160"></el-table-column>
        <el-table-column prop="formattedReleaseTime" label="发布时间" width="120"></el-table-column>
        <el-table-column prop="releaseStatusName" label="状态" width="100"></el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button
                    v-if="scope.row.releaseStatus === 'NO_RELEASE'"
                    type="text"
                    :class="['flex', 'warning']"
                    @click="handleTRClick($event, 'message_publish', scope.$index, scope.row)">
              <span>发布</span>
            </el-button>
            <el-button
                    v-if="scope.row.releaseStatus === 'RELEASE'"
                    type="text"
                    :class="['flex', 'warning']"
                    @click="handleTRClick($event, 'message_withdraw', scope.$index, scope.row)">
              <span>撤销</span>
            </el-button>

          </template>
        </el-table-column>
      </el-table>
      <!--<div class="pagination-container" v-if="totalSize > pageSize">-->
        <!--<div class="pagination">-->
          <!--<el-pagination-->
                  <!--:current-page="currentPage"-->
                  <!--size="large"-->
                  <!--layout="prev, pager, next"-->
                  <!--:page-size = "pageSize"-->
                  <!--:total="totalSize"-->
                  <!--@current-change="handlePaginationPageChange"-->
          <!--&gt;-->
          <!--</el-pagination>-->
        <!--</div>-->
      <!--</div>-->
    </div>

    <el-dialog title="创建站内信" :visible="action.name == 'message_create'"
               v-if="action.name == 'message_create'"
               @close="closeDialog"
               class="size-700"
               :close-on-click-modal="false"
    >
      <el-form labelWidth="120px" size="mini" :rules="rulesForMessageCreate" :model="action.data" ref="formForMessageCreate">
        <el-form-item label="标题" prop="title">
          <el-input v-model="action.data.title"></el-input>
        </el-form-item>
        <el-form-item label="消息类型" prop="messageTypeId">
          <el-select filterable v-model="action.data.messageTypeId" placeholder="请选择">
          <el-option v-for="(item, index) in messageTypeList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input type="textarea"  :rows="2" v-model="action.data.content"></el-input>
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

  </div>
</template>

<style lang="scss" scoped>
  #manage-message {
    height: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    .header {
      display: flex;
      padding: 3px 5px;
      background-color: white;
      .item {
        display: inline-block;
        margin-right: 3px;
        &.key-word {
          display: flex;
          width: 300px;
        }
        .el-select {
          max-width: 190px;
          &.key-word-type {
            max-width: 100px;
          }
        }
      }
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

  export default {
    components: {},
    mixins: [commonUtils],
    created() {
    },
    mounted() {
      // update value in next tick
      setTimeout(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
      this.requestList();
    },
    beforeDestroy() {
    },
    data() {
      return {
        heightOfTable: '',

        messageTypeList: null,
        messageList: [],

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
          }],
          messageTypeId: [{
            required: true,
            message: '请选择消息类型',
          }],
          content: [{
            required: true,
            message: '请填写消息体',
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

      async requestList() {
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
          return it;
        });
        this.messageList = messageList;
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
                content: ''
              });
//              console.log(dialogData);
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.message_create, {
                payload: {
                  title: dialogData['title'],
                  messageTypeId: dialogData['messageTypeId'],
                  content: dialogData['content'],
                }
              });
//              console.log(resContent);
              this.closeDialog();
              this.requestList();
            } catch (err) {
              console.log(err);
            }
            break;
          case 'refresh':
            this.requestList();
            break;
        }
      },

      async handleTRClick(evt, action, index, row) {
        var resContent = null;
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
                  toStatus: 'NO_RELEASE'
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
                  releaseStatus: mapper[action]['toStatus']
                }
              });
//              console.log(resContent);
              this.$message.success(`${mapper[action]['action']}成功！`);
              this.requestList();
            } catch (err) {
              console.log(err);
            }

            break;
        }
      },
    }
  }
</script>