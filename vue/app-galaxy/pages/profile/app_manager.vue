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
      <el-col :span="6">
        <el-select v-model="currentGroupID" placeholder="请选择" @input="handleGroupChange">
          <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-table :data="appList" style="width: 100%">
      <el-table-column label="语言版本" prop="languageVersion">
        <template slot-scope="scope">
          <div>{{scope.row.language}} - {{scope.row.languageVersion}}</div>
        </template>
      </el-table-column>
      <el-table-column label="应用名称" prop="groupTag">
      </el-table-column>
      <el-table-column label="创建者" prop="creator">
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime">
      </el-table-column>
      <el-table-column label="运行环境" prop="spaceList">
        <template slot-scope="scope">
          <el-tag v-for="item in scope.row.spaceList" :key="item" size="small" closable
                  @close="handleTagClose(scope.$index, scope.row, item)">
            {{ item }}
          </el-tag>
        </template>
      </el-table-column>
      <!--<el-table-column label="操作" prop="operation">-->
        <!--<template slot-scope="scope">-->
          <!--<el-button-->
            <!--size="mini"-->
            <!--type="danger"-->
            <!--@click="handleDeleteRow(scope.$index, scope.row)">删除</el-button>-->
        <!--</template>-->
      <!--</el-table-column>-->

      <el-table-column label="更多操作" type="expand">
        <template slot-scope="scope">
          <el-form label-position="right" class="demo-table-expand" label-width="120px">
            <el-form-item label="运行环境管理：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
              <el-checkbox-group
                  v-model="scope.row.selectedSpaceList"
                  @change="handleChangeSpaceList(scope.row)"
                  style="display: inline-block"
              >
                <el-checkbox v-for="item in scope.row.spaceList" :label="item" :key="item"
                  @change="handleChangeSpaceList(item)">
                </el-checkbox>
              </el-checkbox-group>
              <el-button
                size="mini-extral"
                type="warning"
                @click="handleDeleteRow(scope.$index, scope.row)">
                更改运行环境
              </el-button>
            </el-form-item>
            <el-form-item label="应用管理：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
              <el-button
                size="mini-extral"
                type="warning"
                @click="handleDeleteRow(scope.$index, scope.row)">删除应用</el-button>
              <el-button
                size="mini-extral"
                type="warning"
                @click="handleDeleteRow(scope.$index, scope.row)">应用转让</el-button>
            </el-form-item>
          </el-form>
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
    </div>
  </div>
</template>

<style lang="scss">
  .fix-form-item-label {
    line-height: 25px;
  }
  .fix-form-item-content {
    line-height: 100%;
  }
</style>
<style lang="scss" scoped>
  .container {
    margin: 40px;
  }

  .el-table {
    color: black;
    .el-table__expanded-cel {
      color: rgb(90, 94, 120);
    }

    .el-checkbox + .el-checkbox {
      margin-left: 20px;
    }

    .el-form {
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
      this.$store.dispatch('user/getGroupList');
      this.requestAPPList('');
    },
    mounted() {
      console.log('mount app manager');
    },
    data() {
      return {
        groupID: '',
        appList: [],
        pageSize: 2,
        totalSize: 0,
        currentPage: 1,
      }
    },
    computed: {
      currentGroupID: {
        get() {
          if ('' === this.groupID) {
            this.groupID = this.$store.getters['user/groupID'];
          }
          return this.groupID;
        },
        set(value) {
          this.groupID = value;
          this.$store.dispatch('user/groupID', value);
        }
      },
      groupList() {
        return this.$store.getters['user/groupList'];
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
      handleGroupChange: function() {
        this.currentPage = 1;
        this.requestAPPList('');
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