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
      <el-table-column label="操作" prop="operation" minWidth="170" width="180" headerAlign="center" align="center">
        <template slot-scope="scope">
          <el-button
                  v-if="!$storeHelper.notPermitted['show_group_numbers']"
                  size="mini-extral"
                  type="danger"
                  @click="handleTRButton('deleteRow', scope.$index, scope.row)">查看成员</el-button>
          <el-button
                  v-if="!$storeHelper.notPermitted['invite_numbers']"
                  size="mini-extral"
                  type="warning"
                  @click="handleTRButton('change-profileNames', scope.$index, scope.row)">邀请成员</el-button>
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

  }
</style>

<script>
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  module.exports = {
    created() {

    },

    mounted() {
      this.$net.getGroupList().then(content => {
        if (content.hasOwnProperty('groupList')) {
          this.groupList = content.groupList;
        }
//        console.log(content);
      });
      try {
        this.groupListNode = this.$el;
        this.heightOfGroupList = this.groupListNode.offsetHeight - 20;
        this.resizeListenerForAppList = (evt) => {
          let target = evt.target;
          this.heightOfGroupList = target.clientHeight - 20;
        };
        addResizeListener(this.groupListNode, this.resizeListenerForAppList)
        console.log(this.groupListNode);
        console.log(this.heightOfGroupList);
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
      }
    },

    methods: {
      handleTRButton() {

      },
      handlePaginationPageChange() {

      }
    }
  }
</script>