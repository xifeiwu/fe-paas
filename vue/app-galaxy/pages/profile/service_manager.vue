<template>
  <div class="service-manager">
    <el-form inline labelWidth="80px" class="title">
      <el-form-item label="应用名称">
        <el-select v-model="currentAppIndex" placeholder="请选择" @change="handleSelectChange('app')">
          <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.serviceName" :value="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运行环境">
        <el-select v-model="currentProfileID" placeholder="请选择" @change="handleSelectChange('profile')">
          <el-option v-for="item in currentProfileList" :key="item.id" :label="item.description" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item></el-form-item>
    </el-form>
    <el-row class="notice">
      <el-tag type="success">
        <i class="el-icon-warning"></i>
        <span>每次创建的服务版本信息为所在应用创建时的配置信息</span>
      </el-tag>
    </el-row>
    <div class="app-list">
      <el-table
        :data="tableData"
        style="width: 100%"
        :row-key="getRowKeys"
        :expand-row-keys="expandRows"
      >
        <el-table-column
          prop="date"
          label="版本"
          width="80">
        </el-table-column>
        <el-table-column
          prop="name"
          label="内网域名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="address"
          label="状态"
          width="80"
        >
        </el-table-column>
        <el-table-column
          prop="address"
          label="创建时间">
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button size="mini-extral" type="warning" @click="handleOperationClick('deploy', scope.$index, scope.row)">部署</el-button>
            <el-button size="mini-extral" type="warning">运行日志</el-button>
            <el-button size="mini-extral" type="warning">停止</el-button>
            <el-button size="mini-extral" type="warning">重启</el-button>
            <el-button size="mini-extral" type="warning">实例列表</el-button>
            <el-button size="mini-extral" type="warning">配置外网二级域名</el-button>
            <el-button size="mini-extral" type="warning">删除</el-button>
            <el-button size="mini-extral" type="warning" @click="handleOperationClick('service_info', scope.$index, scope.row)">服务信息</el-button>
          </template>
        </el-table-column>
        <el-table-column label="更多操作" type="expand">
          <template slot-scope="scope">
            <el-form label-position="right" class="demo-table-expand" label-width="120px">
              <el-form-item label="运行环境管理：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
              </el-form-item>
              <el-form-item label="应用管理：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .service-manager {
    .notice {
      .el-tag {
        display: block;
        .el-icon-warning {
          vertical-align: middle;
        }
      }
    }
    .el-button {
      margin-bottom: 5px;
      margin-right: 10px;
      float: left;
    }
    .el-button + .el-button {
      margin-left: 0px;
      /*margin-right: 10px;*/
    }
  }
</style>

<script>
export default {
  created() {
    let appInfoOfGroup = this.appInfoOfGroup;
    if (appInfoOfGroup) {
      if (appInfoOfGroup.hasOwnProperty('appList')) {
        this.appList = appInfoOfGroup.appList;
      }
      if (appInfoOfGroup.hasOwnProperty('appModelList')) {
        this.appModelList = appInfoOfGroup.appModelList;
      }
      if (appInfoOfGroup.hasOwnProperty('total')) {
        this.totalSize = appInfoOfGroup.total;
      }
      this.currentAppIndex = 0;
    }
  },
  mounted() {

  },
  data() {
    return {
      currentAppIndex: null,
      currentAPP: null,
      currentProfileID: null,
      currentProfileList: [],
      appList: [],
      appModelList: [],
      totalSize: 0,
      tableData: [{
        id: 0,
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        id: 1,
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        id: 2,
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        id: 3,
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }],
      getRowKeys: function (row) {
       return row.id;
      },
      expandRows: []
    }
  },
  computed: {
    currentGroupID() {
      let groupID = this.$store.getters['user/groupID'];
      return groupID;
    },
    appInfoOfGroup() {
      return this.$store.getters['user/appInfoOfGroup'];
    }
  },
  watch: {
    currentAppIndex: function (value, oldValue) {
      let index = value;
      if (this.appList && Array.isArray(this.appList) && this.appList.length > index) {
        this.currentAPP = this.appList[index];
        this.currentProfileList = this.currentAPP['profileList'];

        console.log(this.currentAPP);
        console.log(this.currentProfileList);

        if (Array.isArray(this.currentProfileList) && this.currentProfileList.length > 0) {
          this.currentProfileID = this.currentProfileList[0]['id'];
        }
      }
    },
    currentProfileID: function (value, oldValue) {
      console.log(this.currentAPP);
      console.log(this.currentProfileID);
    }
  },

  methods: {
    handleOperationClick(action, index, row) {
      switch (action) {
        case 'service_info':
          this.expandRows = [index];
          break;
      }
    },
    requestService() {
      if (null === this.currentAppIndex || null === this.currentProfileID) {
        return;
      }
      let appID = this.appList[this.currentAppIndex]['appId'];
      console.log(appID + '; ' + this.currentProfileID);
    },
    handleSelectChange(from) {
      switch (from) {
        case 'app':
          break;
        case 'profile':
          break;
      }
    }
  }
}
</script>