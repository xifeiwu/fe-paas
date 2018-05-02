<template>
  <div id="log-run">
    <div class="header">
      <my-version-selector :customConfig="localConfig"
                           @version-selected="onVersionSelected"></my-version-selector>
      <div class="item">
        <label>实例名称</label>
        <el-input
                v-model="searchForm.instanceName"
                size="mini" style="display: inline-block; width: 160px;"></el-input>
      </div>
      <div class="item">
        <label>日志级别</label>
        <el-select v-model="searchForm.logLevel">
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
      <el-button
              size="mini-extral"
              type="primary"
              @click="handleButtonClick('refresh')">刷新</el-button>
    </div>
    <div class="section-log"
         v-loading="showLoading"
         element-loading-text="加载中"
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(0, 0, 0, 0.1)">
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
    <my-dialog-for-log class="log-run-log" title="运行日志" :showStatus="dialogStatus" @scrollBottom="requestLog">
      <div slot="log-list" v-for="(item,index) in runLogs" :key="index" class="log-item">
        <span class="time">{{item.timestamp}}</span>
        <span class="thread">{{item.thread}}</span>
        <span class="level">{{item.level}}</span>
        <span class="content">{{item.content}}</span>
        <div class="exception" v-if="item.exception">{{item.exception}}</div>
      </div>
    </my-dialog-for-log>
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
    .section-log {
      position: relative;
      margin: 10px;
      height: 560px;
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
    .section-log {
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
              color: #FFFF00;
            }
            .thread {
              color: #00FFCC;
            }
            .level {
              color: #FF0000;
            }
            .content, .exception {
              color: white;
            }
          }
        }
      }
    }
  }
</style>
<script>
  import MyVersionSelector from '../utils/components/version-selector';
  import MyDialogForLog from '../utils/components/dialog4log.vue';
  export default {
    components: {MyVersionSelector, MyDialogForLog},
    /**
     * the sequence of create and mount in parent and child element is:
     * create parent -> create children -> mount children -> mount parent
     *
     * as this.localConfig is used in child component, as it must be set in created method
     */
    created() {
      // set default service
      let queryParam = this.$route.query;
      if (queryParam && queryParam.hasOwnProperty('from')) {
        if (queryParam['from'] === '/profile/instance') {
          this.localConfig = this.$storeHelper.getUserConfig('profile/instance');
        }
      }
    },
    mounted() {
      // set default date duration
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 1000 * 60 * 5);
      this.searchForm.dateTimeRange = [start, end];

      this.$nextTick(() => {
        this.scrollWrap = document.querySelector('#log-run .section-log .el-scrollbar .el-scrollbar__wrap');
        this.scrollWrap && this.scrollWrap.addEventListener('scroll', (evt) => {
          let target = evt.target;
          if (target) {
            if (target.scrollTop === 0) {
//              this.$emit('scrollTop');
              console.log('scrollTop');
            } else if (target.scrollTop + target.clientHeight === target.scrollHeight) {
//              this.$emit('scrollBottom');
              console.log('scrollBottom');
              this.requestLog();
            }
          }
        });
      });
    },
    data() {
      return {
        localConfig: null,
        searchForm: {
          appId: '',
          spaceId: '',
          serviceVersion: '',
          instanceName: '',
          logLevel: 'INFO',
          dateTimeRange: [],
          keyword: '',
        },

        DEFAULT_LEVEL: 'INFO',
        logLevelList: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
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
            text: '最近两个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 60);
              picker.$emit('pick', [start, end]);
            }
          }
//          , {
//            text: '最近三个月',
//            onClick(picker) {
//              const end = new Date();
//              const start = new Date();
//              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
//              picker.$emit('pick', [start, end]);
//            }
//          }
          ]
        },

        dialogStatus: {
          visible: false,
          full: true,
          showLoading: false
        },
        runLogs: [],
        requestPage: 1,
        requestSize: 50,
        showLoading: false
      }
    },
    computed: {
      currentGroupID() {
        return this.$storeHelper.currentGroupID;
      }
    },
    watch: {
      'currentGroupID': function () {
        this.resetSearchCondition();
      }
    },
    methods: {
      onVersionSelected(appInfo, profileInfo, serviceInfo) {
        this.searchForm.appId = appInfo.appId;
        this.searchForm.spaceId = profileInfo ? profileInfo.id: '';
        this.searchForm.serviceVersion = serviceInfo ? serviceInfo.serviceVersion : '';
//        this.requestLogAtStart();
      },
      handleButtonClick(action) {
        switch (action) {
          case 'search':
            this.requestLogAtStart();
          break;
          case 'refresh':
            this.resetSearchCondition();
            break;
        }
      },

      resetSearchCondition() {
        // reset time duration
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 1000 * 60 * 5);
        this.searchForm.dateTimeRange = [start, end];
        // reset instance name
//        this.searchForm.instanceName = '';
        // reset log level
//        this.searchForm.logLevel = this.DEFAULT_LEVEL;
        // reset key work
//        this.searchForm.keyword = '';
        // request log after reset
        this.requestLogAtStart();
      },
//      onScrollBottom() {
//        this.requestLog();
//      },

      requestLogAtStart() {
        this.requestPage = 1;
        this.runLogs = [];
//            console.log(this.searchForm);
        this.requestLog();
      },
      /**
       * requestLog called at
       * 1. search button
       * 2. scroll bottom of current scrollbar
       * 3. scroll bottom of popup dialog
       * 4. start of this page
       * 5. onVersionSelected, as may be serviceVersion is not ready at start.
       */
      requestLog() {
        if (!this.searchForm.serviceVersion) {
          this.$message.error('服务版本未找到');
          return;
        }
        let dateRange = this.searchForm.dateTimeRange.map(it => {
          let v = this.$utils.formatDate(it, 'yyyy-MM-dd hh:mm:ss')
          return v;
        });
        // some action to avoid request for more than one
        if (this.dialogStatus.visible) {
          if (this.dialogStatus.showLoading) {
            return;
          }
        } else {
          if (this.showLoading) {
            return;
          }
        }
        if (this.dialogStatus.visible) {
          this.dialogStatus.showLoading = true;
          this.showLoading = false;
        } else {
          this.dialogStatus.showLoading = false;
          this.showLoading = true;
        }
        if ('' == this.searchForm.appId || '' == this.searchForm.spaceId || '' == this.searchForm.serviceVersion) {
          console.log('seviceVersion not ready');
          return;
        }
        this.$net.getHistoryRunLog({
          appId: this.searchForm.appId,
          spaceId: this.searchForm.spaceId,
          serviceVersion: this.searchForm.serviceVersion,
          logLevel: this.searchForm.logLevel,
          startTime: dateRange[0],
          endTime: dateRange[1],
          keyword: this.searchForm.keyword,
          page: this.requestPage,
          size: this.requestSize
        }).then(logs => {
          this.runLogs = this.runLogs.concat(logs);
          this.requestPage += 1;
          this.showLoading = false;
          this.dialogStatus.showLoading = false;
          if (Array.isArray(logs) && logs.length === 0) {
            this.$message.warning('没有最新日志');
          }
        }).catch(err => {
          this.$showError(err);
          this.showLoading = false;
          this.dialogStatus.showLoading = false;
        });
      }
    }
  }
</script>