<template>
  <div class="container">
    <el-row>
      <el-col :span="6">
        <el-button @click="handleButtonClick" action="/profile/add_app">创建应用</el-button>
      </el-col>
      <el-col :span="6">
        <el-button @click="handleButtonClick" action="refresh">刷新</el-button>
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
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="商品名称">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="所属店铺">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="商品 ID">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="店铺 ID">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="商品分类">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="店铺地址">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="商品描述">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="应用名称" prop="groupTag">
      </el-table-column>
      <el-table-column label="创建者" prop="creator">
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime">
      </el-table-column>
      <el-table-column label="运行环境" prop="spaceList">
      </el-table-column>
    </el-table>
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
    },
    mounted() {
      console.log('mount app manager');
    },
    data() {
      return {
        groupID: '',
        appList: [],
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
        console.log(arguments);
        console.log(evt);
        console.log(evt.target);
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
        if ('refresh' === action) {

        } else {
          this.$router.push(action);
        }
      },
      requestAPPList(groupID, page, length, serviceName) {
        if (!serviceName) {
          serviceName = '';
        }
        this.$net.getAPPList({
          groupId: groupID,
          page: page,
          length: length,
          serviceName: serviceName
        }).then(content => {
          console.log(content);
          if (content.hasOwnProperty('appList')) {
            this.appList = content.appList;
          }
        });
      },
      handleGroupChange: function(groupID) {
        this.requestAPPList(groupID, 1, 8, '');
      },
    }
  }
</script>