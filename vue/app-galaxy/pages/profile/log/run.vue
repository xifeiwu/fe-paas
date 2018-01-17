<template>
  <div id="log-run">
    <div class="header">
      <el-version-selector @version-selected="onVersionSelected"></el-version-selector>
      <div class="item">
        <label>实例名称</label>
        <el-input
                v-model="searchForm.userName"
                size="mini" style="display: inline-block; width: 160px;"></el-input>
      </div>
      <div class="item">
        <label>日志级别</label>
        <el-select v-model="searchForm.logLevel" placeholder="请选择">
          <el-option v-for="(item, index) in logLevelList" :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </div>
      <div class="item">
        <label>时间</label>
        <el-date-picker
                style="display: inline-block; width: 400px;"
                size="mini"
                v-model="searchForm.dateTimeRange"
                type="datetimerange"
                :picker-options="pickerOptions2"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right">
        </el-date-picker>
      </div>
      <div class="item">
        <label>关键字</label>
        <el-input
                v-model="searchForm.keyWords"
                size="mini" style="display: inline-block; width: 160px;"></el-input>
      </div>
      <el-button
              size="mini-extral"
              type="primary"
              @click="handleButtonClick('search')">查询</el-button>
    </div>
    <div class="log">
      <div class="title"><i class="el-icon-rank" @click="dialogStatus.visible = true"></i></div>
    </div>
    <el-log-dialog :showStatus="dialogStatus" :deployLogs="deployLogs"></el-log-dialog>
  </div>
</template>
<style lang="scss" scoped>
  #log-run {
    .header {
      font-size: 14px;
      margin: 5px;
      .el-version-selector {
        display: inline-block;
      }
      .item {
        display: inline-block;
        margin-right: 3px;
        margin-top: 5px;
      }
    }
    .log {
      margin: 10px;
      height: 600px;
      background-color: rgba(0, 0, 0, 0.8);
      .title {
        height: 24px;
        /*border-bottom: 1px solid white;*/
        position: relative;
        .el-icon-rank {
          position: absolute;
          right: 5px;
          top: 5px;
          color: white;
          font-size: 24px;
          transform: rotate(45deg);
          &:hover {
            color: #409EFF;
          }
        }
      }
    }
  }
</style>
<style lang="scss">
  #log-run {
    .header {
      .el-select .el-input__inner {
        height: 24px;
      }
      .el-input .el-input__inner {
        height: 24px;
      }
      .el-range-editor--mini.el-input__inner {
        height: 26px;
      }
      .el-range-editor.el-input__inner {
        padding: 2px 10px;
      }
    }
  }
</style>
<script>
  import elVersionSelector from '../utils/components/version-selector';
  import elLogDialog from '../utils/components/dialog4log.vue';
  import ElInput from "../../../../packages/input/src/input";
  import ElSelect from "../../../../packages/select/src/select";
  export default {
    components: {ElSelect, ElInput, elVersionSelector, elLogDialog},
    data() {
      return {
        searchForm: {
          userName: '',
          logLevel: '',
          dateTimeRange: '',
          keyWords: '',
        },

        logLevelList: ['Info', 'Debug', 'Warning', 'Error'],
        pickerOptions2: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },

        dialogStatus: {
          visible: false,
          full: true,
        },
        deployLogs: []
      }
    },
    methods: {
      onVersionSelected(appInfo, profileID, version) {
//        console.log(appId, profileID, version);
        this.$net.getDeployLogList({
          appId: appInfo.appId,
          spaceId: profileID,
          serviceVersion: version
        }).then(deployLogList => {
//          this.deployLogList = deployLogList;
        }).catch(err => {
          this.$message.error('列表获取失败！');
        });
      },
    }
  }
</script>