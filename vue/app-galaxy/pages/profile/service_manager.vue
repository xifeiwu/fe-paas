<template>
  <div class="service-manager">
    <el-form inline labelWidth="80px" class="title">
      <el-form-item label="应用名称">
        <el-select v-model="currentAPP" placeholder="请选择">
          <el-option v-for="item in appList" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运行环境"></el-form-item>
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
        style="width: 100%">
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
            <el-button size="mini-extral" type="warning">部署</el-button>
            <el-button size="mini-extral" type="warning">运行日志</el-button>
            <el-button size="mini-extral" type="warning">停止</el-button>
            <el-button size="mini-extral" type="warning">重启</el-button>
            <el-button size="mini-extral" type="warning">实例列表</el-button>
            <el-button size="mini-extral" type="warning">配置外网二级域名</el-button>
            <el-button size="mini-extral" type="warning">删除</el-button>
            <el-button size="mini-extral" type="warning">服务信息</el-button>
          </template>
        </el-table-column>
        <!--<el-table-column label="操作">-->
          <!--<template slot-scope="scope">-->
            <!--<el-button-->
                    <!--size="mini"-->
                    <!--@click="handleEdit(scope.$index, scope.row)">编辑</el-button>-->
            <!--<el-button-->
                    <!--size="mini"-->
                    <!--type="danger"-->
                    <!--@click="handleDelete(scope.$index, scope.row)">删除</el-button>-->
          <!--</template>-->
        <!--</el-table-column>-->
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
//    this.$net.getAPPList({
//      groupId: this.currentGroupID,
//      serviceName: ''
//    }).then(content => {
//      console.log(content);
//    }).catch(err => {
//      console.log(err);
//    })
  },
  mounted() {

  },
  data() {
    return {
      currentAPP: {},
      appList: ['A', 'B', 'C'],
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }]
    }
  },
  computed: {
    currentGroupID() {
      let groupID = this.$store.getters['user/groupID'];
      return groupID;
    },
  }
}
</script>