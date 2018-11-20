<template>
  <div id="user-message">
    <div class="header"></div>
    <div class="message-list">
      <el-table :data="messageListByPage"
                stripe
                :height="heightOfTable"
                :row-key="(row) => {return row.id}"
                :expand-row-keys="expandRows">
        <el-table-column label="消息标题" prop="title" headerAlign="center" align="center" minWidth="100">
          <template slot-scope="scope">
            <span :class="{'un-read': scope.row.readStatus === 0}">{{scope.row.title}}</span>
          </template>
        </el-table-column>
        <el-table-column label="消息类型" prop="messageTypeName" headerAlign="center" align="center" minWidth="100">
          <template slot-scope="scope">
            <span :class="{'un-read': scope.row.readStatus === 0}">{{scope.row.messageTypeName}}</span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" prop="releaseTime" headerAlign="center" align="center" minWidth="100">
          <template slot-scope="scope">
            <span :class="{'un-read': scope.row.readStatus === 0}">{{scope.row.releaseTime}}</span>
          </template>
        </el-table-column>
        <el-table-column label="" headerAlign="center" align="center" minWidth="80">
          <template slot-scope="scope">
            <el-button
                    type="text" class="primary"
                    @click="handleTRButton('show-content', scope.$index, scope.row)"
                    :class="{'expand': expandRows.indexOf(scope.row.id) > -1}"
                    :loading="statusOfWaitingResponse('show-content') && operation.group.id == scope.row.id">
              <span>详情</span>
              <i class="el-icon-arrow-right"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         width="0">
          <template slot-scope="scope">
            <div class="row-expand">
              {{operation.row.content}}
            </div>
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
  </div>
</template>

<style lang="scss">
  #user-message {
    .message-list {
      .el-table {
        .el-table__body-wrapper {
          tr {
            color: darkgrey;
            .row-expand {
              color: #545454;
              font-size: 12px;
              text-indent: 2em;
              padding: 0px;
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #user-message {
    height: 100%;
    .message-list {
      height: 100%;
      position: relative;
      .el-table {
        tr {
          td {
            .un-read {
              color: black;
              font-weight: bold;
            }
          }
        }
        tr .row-expand {
          box-sizing: border-box;
          width: 85%;
          max-width: 900px;
          margin: 3px auto;
          padding: 2px;
          /*border: 1px solid #eee;*/
          /*border-radius: 6px;*/
          box-shadow: 0 1px 1px 0 rgba(0,0,0,.18);
        }
        .el-table__row {
          .el-button {
            margin: 2px 4px;
            &.expand {
              .el-icon-arrow-right {
                transform: rotate(90deg);
              }
            }
            .el-icon-arrow-right {
              vertical-align: middle;
              transition: transform 0.2s ease-in-out;
            }
          }
        }
      }
    }
  }
</style>

<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  module.exports = {
    mixins: [commonUtils],
    created() {

    },
    async mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);
      await this.requestMessage();
    },
    data() {
      return {
        messageList: [],
        messageListByPage: [],
        operation: {
          row: null,
        },
        expandRows: [],

        totalSize: 0,
        pageSize: 12,
        currentPage: 1,
        heightOfTable: '',
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange'
    },
    methods: {
      onScreenSizeChange(size) {
        if (size === 0) {
          return;
        }
        this.heightOfTable = this.$el.clientHeight - 18;
//        this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 15 : 10;
        this.updateMessageListByPage();
      },

      async requestMessage() {
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.message_list_all, {});
        const messageList = resContent['data'].map(it => {
          it.id = it.messageId;
          it.releaseTime = this.$utils.formatDate(it.releaseTime, 'yyyy-MM-dd hh:mm:ss');
          return it;
        });
        this.messageList = messageList;
        this.totalSize = resContent['recordsTotal'];
        this.currentPage = 1;
        this.updateMessageListByPage();
      },

      async handleTRButton(action, index, row) {
        this.operation.row = row;
        switch (action) {
          case 'show-content':
            if (!row.hasOwnProperty('id')) {
              return;
            }
            const updateExpandRows = (id) => {
              var isOpened = false;
              if (this.expandRows.indexOf(id) > -1) {
                isOpened = true;
                this.expandRows.splice(this.expandRows.indexOf(id), 1);
              } else {
//                this.expandRows.push(key);
                this.expandRows = [id];
              }
              return isOpened;
            };
            if (updateExpandRows(row.id)) {
              row.readStatus = 1;
            } else {
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.message_mark_read, {
                query: {
                  messageId: row.messageId
                }
              });
              row.readStatus = 1;
            }
            break;
        }
      },

      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.updateMessageListByPage();
      },

      updateMessageListByPage() {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;
        let end = start + length;
        this.messageListByPage =  this.messageList.slice(start, end);
      },
    }
  }
</script>