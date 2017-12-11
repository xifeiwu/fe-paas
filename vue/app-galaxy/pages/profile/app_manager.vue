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
      <el-table-column label="操作" prop="operation">
        <template slot-scope="scope">
          <!--<el-button-->
            <!--size="mini"-->
            <!--@click="handleEdit(scope.$index, scope.row)">编辑</el-button>-->
          <el-button
            size="mini"
            type="danger"
            @click="handleDeleteRow(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>

      <!--<el-table-column type="expand">-->
        <!--<template slot-scope="props">-->
          <!--<el-form label-position="left" inline class="demo-table-expand">-->
            <!--<el-form-item label="商品名称">-->
              <!--<span>{{ props.row.groupTag }}</span>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="所属店铺">-->
              <!--<span>{{ props.row.groupTag }}</span>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="商品 ID">-->
              <!--<span>{{ props.row.groupTag }}</span>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="店铺 ID">-->
              <!--<span>{{ props.row.groupTag }}</span>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="商品分类">-->
              <!--<span>{{ props.row.groupTag }}</span>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="店铺地址">-->
              <!--<span>{{ props.row.groupTag }}</span>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="商品描述">-->
              <!--<span>{{ props.row.groupTag }}</span>-->
            <!--</el-form-item>-->
          <!--</el-form>-->
        <!--</template>-->
      <!--</el-table-column>-->
    </el-table>
    <div class="block">
      <span class="demonstration">页数较少时的效果</span>
      <el-pagination
              layout="prev, pager, next"
              :total="50">
      </el-pagination>
    </div>
  </div>
</template>
<style>
  .container {
    margin: 40px;
  }
  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
<script>
  export default {
    created() {
      this.$store.dispatch('user/getGroupList');
      this.requestAPPList(this.currentGroupID, 1, '');
    },
    mounted() {
      console.log('mount app manager');
    },
    data() {
      return {
        groupID: '',
        appList: [],
        pageSize: 10,
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
          this.requestAPPList(this.groupID, 1, '');
        } else {
          this.$router.push(action);
        }
      },
      requestAPPList(groupID, page, serviceName) {
        if (!serviceName) {
          serviceName = '';
        }
        this.$net.getAPPList({
          groupId: groupID,
          page: page,
          length: this.pageSize,
          serviceName: serviceName
        }).then(content => {
          if (content.hasOwnProperty('appList')) {
            this.appList = content.appList;
          }
        });
      },
      handleGroupChange: function(groupID) {
        this.requestAPPList(groupID, 1, '');
      },
      handleDeleteRow(index, row) {
        this.confirm('您将删除应用，' + row.groupTag + '确定吗？').then(() => {
          spaceList.splice(spaceList.indexOf(tag), 1);
          this.$message({
            type: 'success',
            message: '删除成功!'
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
    }
  }
</script>