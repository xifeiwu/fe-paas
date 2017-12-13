<template>
  <div class="container">
    <el-row>
      <el-col :span="6">
        <el-button @click="handleButtonClick" action="/profile/add_app">创建应用</el-button>
      </el-col>
      <el-col :span="6">
        <el-button @click="handleButtonClick" action="refreshAppList">刷新</el-button>
      </el-col>
      <el-col :span="6"></el-col>
    </el-row>
    <el-table :data="appList" style="width: 100%">
      <el-table-column label="语言版本" prop="languageVersion" headerAlign="center">
        <template slot-scope="scope">
          <div>{{scope.row.language}} - {{scope.row.languageVersion}}</div>
        </template>
      </el-table-column>
      <el-table-column label="应用名称" prop="serviceName" headerAlign="center">
      </el-table-column>
      <el-table-column label="创建者" prop="creator" headerAlign="center">
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" headerAlign="center">
      </el-table-column>
      <el-table-column label="运行环境" prop="spaceList" headerAlign="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.spaceList" :key="item">
            <span class="profile-item" @click="jumpToService(scope.$index, scope.row, item)"
            >{{ item }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="operation" minWidth="130" headerAlign="center">
        <template slot-scope="scope">
          <el-button
            size="mini-extral"
            type="danger"
            @click="handleDeleteRow(scope.$index, scope.row)">删除</el-button>
          <el-button
            size="mini-extral"
            type="warning"
            @click="handleChangeProfile(scope.$index, scope.row)">更改运行环境</el-button>
        </template>
      </el-table-column>
    </el-table>
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

      <el-dialog title="更改运行环境" :visible.sync="changeProfileDialogVisible">
        <el-checkbox-group>
          <el-checkbox v-for="item in currentSpaceList" :label="item" :key="item">
          </el-checkbox>
        </el-checkbox-group>
        <el-tag>ADDDFD</el-tag>
      </el-dialog>
    </div>
  </div>
</template>

<!--<style lang="scss">-->
  <!--.fix-form-item-label {-->
    <!--line-height: 25px;-->
  <!--}-->
  <!--.fix-form-item-content {-->
    <!--line-height: 100%;-->
  <!--}-->
<!--</style>-->
<style lang="scss" scoped>
  .container {
    margin: 40px;
  }

  .el-table {
    color: black;
    .el-table__row {
      .profile-item {
        cursor: pointer;
        display: inline-block;
        border-bottom: 1px solid gray;
        &:hover {
          color: blue;
          border-color: blue;
        }
      }
    }
    .el-table__expanded-cel {
      color: rgb(90, 94, 120);
    }
    .el-form {
      .el-checkbox + .el-checkbox {
        margin-left: 20px;
      }
      .el-form-item {
        margin-bottom: 6px;
      }
    }
    .demo-table-expand {
      font-size: 12px;
      .el-form-item__label {
        vertical-align: middle;
      }
    }
  }

  .el-form-item__label {
    text-align: right;
  }

  .el-tag {
    display: block;
  }
  .pagination {
    margin-top: 15px;
    text-align: center;
    .el-pagination {
      display: inline-block;
    }
  }
</style>
<script>
  export default {
    created() {
      this.requestAPPList('');
    },
    mounted() {
      console.log('mount app manager');
    },
    data() {
      return {
        appList: [],
        pageSize: 2,
        totalSize: 0,
        currentPage: 1,
        changeProfileDialogVisible: false,
        currentSpaceList: [],
      }
    },
    computed: {
      currentGroupID() {
        let groupID = this.$store.getters['user/groupID'];
        return groupID;
      },
      groupList() {
        return this.$store.getters['user/groupList'];
      }
    },
    watch: {
      currentGroupID: function (value, oldValue) {
        this.requestAPPList('');
      }
    },
    methods: {
      handleButtonClick(evt) {
        let target = evt.target;
        let bubble = true;
        let stepCnt = 0;
        let maxStep = 8;
        while(bubble) {
          if ('BUTTON' == target.tagName.toUpperCase()) {
            bubble = false;
          } else {
            target = target.parentElement;
          }
          stepCnt += 1;
          if (stepCnt > maxStep) {
            bubble = false;
          }
        }
        let action = target.getAttribute('action');
        if ('refreshAppList' === action) {
          this.requestAPPList('');
        } else {
          this.$router.push(action);
        }
      },
      requestAPPList(serviceName) {
        if (!serviceName) {
          serviceName = '';
        }
        this.$net.getAPPList({
          groupId: this.currentGroupID,
          start: this.currentPage,
          length: this.pageSize,
          serviceName: serviceName
        }).then(content => {
          if (content.hasOwnProperty('appList')) {
            let appList = content.appList;
            if (Array.isArray(appList)) {
              appList.forEach(it => {
                it.selectedSpaceList = JSON.parse(JSON.stringify(it.spaceList));
              })
            }
            this.appList = appList;
          }
          if (content.hasOwnProperty('total')) {
            this.totalSize = content.total;
          }
        });
      },
      jumpToService(index, row, tag) {
        console.log('in jumpToService');
        console.log(index, row, tag);
      },
      handleDeleteRow(index, row) {
        this.confirm('您将删除应用，' + row.groupTag + '确定吗？').then(() => {
          this.$net.deleteAPP({
            groupId: this.groupID,
            id: row.appId
          }).then(res => {
            this.appList.splice(index, 1);
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '您已取消删除'
          });
        });
      },
      handleChangeProfile(index, row) {
        console.log(index);
        console.log(row);
        this.currentSpaceList = row.spaceList;
        this.changeProfileDialogVisible = true;
      },
      handleTagClose(index, row, tag) {
        console.log(index);
        console.log(row);
        console.log(tag);
        let item = row;
        if (item.hasOwnProperty('spaceList')) {
          let spaceList = item.spaceList;
          if ((Array.isArray(spaceList) && spaceList.indexOf(tag) > -1)) {
            this.confirm('您将删除' + row.groupTag + '应用下的' + tag + '环境，确定吗？').then(() => {
              spaceList.splice(spaceList.indexOf(tag), 1);
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
              this.requestAPPList('')
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '您已取消删除'
              });
            });
          }
        }
      },
      confirm(content) {
        return new Promise((resolve, reject) => {
          this.$confirm(content, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            resolve();
          }).catch(() => {
            reject()
          });

        });
      },

      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestAPPList('');
      },

      handleChangeSpaceList(row) {
        console.log(row);
      }
    }
  }
</script>