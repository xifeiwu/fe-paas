<template>
  <div id="log-run">
    <div class="header">
      <el-version-selector @version-selected="onVersionSelected"></el-version-selector>
      <div class="item">
        <label>实例名称</label>
        <el-input
                v-model="searchForm.instanceName"
                size="mini" style="display: inline-block; width: 160px;"></el-input>
      </div>
      <div class="item">
        <label>日志级别</label>
        <el-select v-model="searchForm.logLevel" placeholder="全部">
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
                v-model="searchForm.keyword"
                size="mini" style="display: inline-block; width: 160px;"></el-input>
      </div>
      <el-button
              size="mini-extral"
              type="primary"
              @click="handleButtonClick('search')">查询</el-button>
    </div>
    <div class="log">
      <el-scrollbar>
        <div v-for="(item,index) in runLogs" :key="index" class="log-item">
          <span class="time">{{item.timestamp}}</span>
          <span class="thread">{{item.thread}}</span>
          <span class="level">{{item.level}}</span>
          <span class="content">{{item.content}}</span>
          <span class="exception" v-if="item.exception">{{item.exception}}</span>
        </div>
      </el-scrollbar>
      <i class="el-icon-rank" @click="dialogStatus.visible = true"></i>
    </div>
    <el-log-dialog title="运行日志" :showStatus="dialogStatus" :logsToShow="runLogs"></el-log-dialog>
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
      position: relative;
      margin: 10px;
      height: 600px;
      background-color: rgba(0, 0, 0, 0.8);
      /*.title {*/
        /*height: 24px;*/
        /*border-bottom: 1px solid white;*/
        /*position: relative;*/
        .el-icon-rank {
          position: absolute;
          right: 5px;
          top: 5px;
          color: white;
          font-size: 22px;
          transform: rotate(45deg);
          &:hover {
            color: #409EFF;
          }
        }
      /*}*/
      .el-scrollbar {
        height: 100%;
        .el-scrollbar__wrap {
          .el-scrollbar__view {
            padding: 6px 6px 10px 6px;
            pre {
              font-size: 12px;
              line-height: 16px;
            }
          }
        }
        .el-scrollbar__bar {
          &.is-horizontal {
            height: 2px;
          }
          &.is-vertical {
            width: 2px;
          }
          .el-scrollbar__thumb {
            background-color: #409EFF;
          }
        }
        .el-scrollbar__view {
          .log-item {
            font-size: 12px;
            line-height: 16px;
            .time {
              color:#FFFF00;
            }
            .thread {
              color: #00FFCC;
            }
            .level {
              color: #FF0000;
            }
            .content, .exception{
              color: white;
            }
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
    mounted() {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 1000 * 60 * 5);
      this.searchForm.dateTimeRange = [start, end];
    },
    data() {
      return {
        searchForm: {
          appId: '',
          spaceId: '',
          serviceVersion: '',
          instanceName: '',
          logLevel: '',
          dateTimeRange: [],
          keyword: '',
        },

        logLevelList: ['DEBUG', 'INFO', 'WARNING', 'ERROR'],
//        defaultTime: start.getTime() - 3600 * 1000 * 24 * 7,
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
        runLogs: []
      }
    },
    methods: {
      onVersionSelected(appInfo, profileID, serviceInfo) {
        this.searchForm.appId = appInfo.id;
        this.searchForm.spaceId = profileID;
        this.searchForm.serviceVersion = serviceInfo.id;
      },
      handleButtonClick(action) {
        switch (action) {
          case 'search':
            console.log(this.searchForm);
            if (!this.searchForm.serviceVersion) {
            this.$message.error('服务版本未找到');
            return;
          }
            let dateRange = this.searchForm.dateTimeRange.map(it => {
              let v = this.$utils.formatDate(it, 'yyyy-MM-dd hh:mm:ss')
              return v;
            });
            this.$net.getHistoryRunLog({
              appId: this.searchForm.appId,
              spaceId: this.searchForm.spaceId,
              serviceVersion: this.searchForm.serviceVersion,
              logLevel: this.searchForm.logLevel,
              startTime: dateRange[0],
              endTime: dateRange[1],
              keyword: this.searchForm.keyword,
            }).then(logs => {
              this.runLogs = logs;
            }).catch(err => {
              this.$showError(err);
            });
            break;
        }
      }
    }
  }
</script>