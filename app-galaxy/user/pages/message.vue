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
    </div>
  </div>
</template>

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
          color: black;
          box-sizing: border-box;
          padding: 2px 6px;
          width: 85%;
          margin: 6px auto;
          max-width: 900px;
          border: 1px solid #eee;
          /*box-shadow: 0 2px 7px 0 rgba(0,0,0,.18);*/
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
      const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.message_list_all, {});

      const messageList = resContent['data'].map(it => {
        it.id = it.messageId;
        it.releaseTime = this.$utils.formatDate(it.releaseTime, 'yyyy-MM-dd hh:mm:ss');
        return it;
      });
      console.log(messageList);
      this.messageList = messageList;
      this.totalSize = resContent['recordTotal'];
      this.currentPage = 1;
      this.updateMessageListByPage();

      this.onScreenSizeChange(this.$storeHelper.screen.size);
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
        pageSize: 15,
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
      },

      handleTRButton(action, index, row) {
        this.operation.row = row;
        switch (action) {
          case 'show-content':
            if (!row.hasOwnProperty('id')) {
              return;
            }
            const updateExpandRows = (id) => {
              if (this.expandRows.indexOf(id) > -1) {
                this.expandRows.splice(this.expandRows.indexOf(id), 1);
              } else {
//                this.expandRows.push(key);
                this.expandRows = [id];
              }
            };
            updateExpandRows(row.id);
            row.readStatus = 1;
            
            break;
        }
      },

      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.updateGroupListByPage();
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