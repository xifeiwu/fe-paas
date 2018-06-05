<template>
  <div class="group-list">
    <el-table :data="groupList"
              v-loading="showLoading"
              stripe
              :height="heightOfGroupList"
              element-loading-text="加载中">
      <el-table-column label="团队名称" prop="name" headerAlign="center" align="center" width="100">
      </el-table-column>
      <el-table-column label="团队标签" prop="tag" headerAlign="center" align="center">
      </el-table-column>
      <el-table-column label="所属业务线LOB" prop="lobName" headerAlign="center" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createTime" headerAlign="center" align="center" width="100">
        <template slot-scope="scope">
          <div v-if="Array.isArray(scope.row.createTime)">
            <div v-for="(item, index) in scope.row.createTime" :key="index">
              {{item}}
              </div>
          </div>
          <div v-else>{{scope.row.createTime}}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="operation" minWidth="120" headerAlign="center" align="center">
        <template slot-scope="scope">
          <el-button
                  v-if="!$storeHelper.notPermitted['show_group_numbers']"
                  size="mini-extral"
                  type="primary"
                  @click="handleTRButton('show-group-numbers', scope.$index, scope.row)"
                  :loading="statusOfWaitingResponse('show-group-numbers') && operation.rowID == scope.row.id">
            <span>查看成员</span>
            <i class="el-icon-arrow-right"></i>
          </el-button>
          <el-button
                  v-if="!$storeHelper.notPermitted['invite_numbers']"
                  size="mini-extral"
                  type="warning"
                  @click="handleTRButton('change-profile-names', scope.$index, scope.row)">邀请成员</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container" v-if="showAppList">
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
</template>

<style lang="scss" scoped>
  .group-list {
    height: 100%;
    .el-table {
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
          &:first-child {
            margin-left: 0px;
          }
        }
        .el-button + .el-button {
          margin-left: 0px;
        }
      }
    }
  }
</style>

<script>
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  module.exports = {
    created() {

    },

    mounted() {
      this.showLoading = true;
      this.$net.getGroupList().then(content => {
        if (content.hasOwnProperty('groupList')) {
          this.groupList = content.groupList;
          this.showLoading = false;
        }
      }).catch(err => {
        this.showLoading = false;
      });

      try {
        this.groupListNode = this.$el;
        this.heightOfGroupList = this.groupListNode.offsetHeight;
        this.resizeListenerForAppList = (evt) => {
          let target = evt.target;
          this.heightOfGroupList = target.clientHeight;
        };
        addResizeListener(this.groupListNode, this.resizeListenerForAppList);
      } catch(err) {
        console.log(err);
      }
    },
    beforeDestroy() {
      removeResizeListener(this.groupListNode, this.resizeListenerForAppList);
    },

    data() {
      return {
        groupList: [],
        showLoading: false,
        groupListNode: null,
        heightOfGroupList: '',

        pageSize: 0,
        currentPage: 1,
        pageSize: 1,
        showAppList: false,

        operation: {
          rowID: null,
          name: null,
        },

        queueForWaitingResponse: [],
      }
    },

    methods: {
      // helper for loading action of el-button
      addToWaitingResponseQueue(action) {
        if (this.queueForWaitingResponse.indexOf(action) === -1) {
          this.queueForWaitingResponse.push(action);
        }
      },
      statusOfWaitingResponse(action) {
        return this.queueForWaitingResponse.indexOf(action) > -1;
      },
      hideWaitingResponse(action) {
        let index = this.queueForWaitingResponse.indexOf(action);
        if (index > -1) {
          this.queueForWaitingResponse.splice(index, 1);
        }
      },

      handleTRButton(action, index, row) {
        switch (action) {
          case 'show-group-numbers':
            if (!row.hasOwnProperty('id')) {
              return;
            }
            this.operation.rowID = row.id;
            this.addToWaitingResponseQueue(action);
            this.$net.getGroupNumbers({id: row.id}).then(userList => {
              console.log(userList);
              this.hideWaitingResponse(action);
            }).catch(err => {
              this.hideWaitingResponse(action);
            });

            break;
          case 'change-profile-names':
            break;
        }

      },
      handlePaginationPageChange() {

      }
    }
  }
</script>