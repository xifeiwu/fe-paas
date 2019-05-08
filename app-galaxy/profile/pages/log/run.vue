<template>
  <div id="log-run">
    <div class="header">
      <paas-version-selector :customConfig="config4VersionSelector"
                           @version-selected="onVersionSelected"></paas-version-selector>
      <div class="item">
        <label>实例名称:</label>
        <el-input
                v-model="searchForm.instanceName"
                size="mini" style="display: inline-block; width: 160px;" placeholder="默认所有实例"></el-input>
      </div>

      <div class="item">
        <label>关键字:</label>
        <el-input
                v-model="searchForm.keyword"
                size="mini" style="display: inline-block; width: 160px;"></el-input>
      </div>

      <div class="item">
        <label>时间:</label>
        <el-date-picker
                style="display: inline-block; width: 360px;"
                size="mini"
                v-model="searchForm.dateTimeRange"
                type="datetimerange"
                :picker-options="pickerOptions2"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right"
                :enableClose="false"
        >
        </el-date-picker>
      </div>

      <div class="item">
        <label>日志级别:</label>
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group
                style="display: inline-block; width: 450px;"
                v-model="searchForm.logLevel"  @change="handleCheckedCitiesChange">
          <el-checkbox v-for="(item, index) in logLevelList" :key="index" :label="item" :value="item">
          </el-checkbox>
        </el-checkbox-group>
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
      <i class="paas-icon-screen-expand" @click="dialogStatus.visible = true"></i>
    </div>
    <paas-dialog-for-log class="log-run-log" title="运行日志" :showStatus="dialogStatus" @scrollBottom="requestLog">
      <div slot="log-list" v-for="(item,index) in runLogs" :key="index" class="log-item">
        <span class="time">{{item.timestamp}}</span>
        <span class="thread">{{item.thread}}</span>
        <span class="level">{{item.level}}</span>
        <span class="content">{{item.content}}</span>
        <div class="exception" v-if="item.exception">{{item.exception}}</div>
      </div>
    </paas-dialog-for-log>
  </div>
</template>
<style lang="scss" scoped>
  #log-run {
    height: calc(100% - 30px);
    padding: 0px 5px;
    .header {
      padding: 5px 0px;
      font-size: 14px;
      .paas-version-selector {
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
      background-color: rgba(0, 0, 0, 0.8);
      .paas-icon-screen-expand {
        position: absolute;
        right: 5px;
        top: 5px;
        font-size: 18px;
        color: #878d99;
        transform: rotateZ(90deg);
        &:hover {
          color: #409EFF;
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
  import paasVersionSelector from '../components/version-selector';
  import paasDialogForLog from '../components/dialog4log.vue';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  export default {
    components: {paasVersionSelector, paasDialogForLog},
    /**
     * the sequence of create and mount in parent and child element is:
     * create parent -> create children -> mount children -> mount parent
     *
     * as this.config4VersionSelector is used in child component, as it must be set in created method
     */
    created() {
      // set default service
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer['from'];
        const data = dataTransfer['data'];
        switch (from) {
          case this.$net.page['profile/instance']:
            this.config4VersionSelector = {
              appId: data['appId'],
              profileId: data['profileId'],
              serviceId: data['serviceId'],
            };
            break;
//          case this.$net.page['profile/work-order/list']:
//            this.localServiceConfig = {
//              appID: data['appId'],
//              profileID: data['profileId'],
//              serviceVersion: data['serviceVersion'],
//            };
            break;
        }
        // save to localStorage after selected change
        if (this.config4VersionSelector) {
          this.$store.dispatch('user/config', {
            page: 'log/deploy',
            data: this.config4VersionSelector
          });
        }
        this.$storeHelper.dataTransfer = null;
      } else {
        // get config from localStorage
        const userConfig = this.$store.getters['user/config'];
        if (userConfig.hasOwnProperty('log/deploy')) {
          const logDeployConfig = userConfig['log/deploy'];
          if (this.$utils.hasProps(logDeployConfig, 'appId', 'profileId')) {
            this.config4VersionSelector = {
              appId: logDeployConfig['appId'],
              profileId: logDeployConfig['profileId'],
            };
            if (logDeployConfig.hasOwnProperty('serviceId')) {
              this.config4VersionSelector['serviceId'] = logDeployConfig['serviceId'];
            } else if (logDeployConfig.hasOwnProperty('serviceVersion')) {
              this.config4VersionSelector['serviceVersion'] = logDeployConfig['serviceVersion'];
            }
          }
        }
      }
    },
    mounted() {
      // set default date duration
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 1000 * 3600);
      this.searchForm.dateTimeRange = [start, end];

      this.$nextTick(() => {
        this.scrollWrap = document.querySelector('#log-run .section-log .el-scrollbar .el-scrollbar__wrap');
        this.scrollWrap && this.scrollWrap.addEventListener('scroll', (evt) => {
          const target = evt.target;
          if (target) {
            if (target.scrollTop === 0) {
//              this.$emit('scrollTop');
//              console.log('scrollTop');
            } else if (target.scrollTop + target.clientHeight === target.scrollHeight) {
//              this.$emit('scrollBottom');
//              console.log('scrollBottom');
              this.requestLog();
            }
          }
        });
      });

      // adjust element height after resize
      try {
        const headerNode = this.$el.querySelector(':scope > .header');
        const logSection = this.$el.querySelector(':scope > .section-log');
        this.resizeListener = () => {
          const headerHeight = headerNode.offsetHeight;
          var targetHeight = this.$el.clientHeight - headerHeight - 5;
          if (targetHeight > 1000) {
            targetHeight = 1000;
          }
          logSection.style.height = `${targetHeight}px`;
        };
        addResizeListener(this.$el, this.resizeListener);
      } catch(err) {
      }
    },
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },
    data() {
      return {
        resizeListener: () => {},
        config4VersionSelector: null,
        searchForm: {
          appId: '',
          spaceId: '',
          serviceVersion: '',
          instanceName: '',
          logLevel: ['INFO'],
          dateTimeRange: [],
          keyword: '',
        },
        checkAll: false,
        isIndeterminate: true,
        DEFAULT_LEVEL: 'INFO',
        logLevelList: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
//        defaultTime: start.getTime() - 3600 * 1000 * 24 * 7,
        pickerOptions2: {
          shortcuts: [{
            text: '最近三天',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近两周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 14);
              picker.$emit('pick', [start, end]);
            }
          }]
        },

        dialogStatus: {
          visible: false,
          full: true,
          showLoading: false,
        },
        runLogs: [],
        requestPage: 1,
        requestSize: 150,
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
      },
      'searchForm.dateTimeRange': function (value) {
        console.log(value);
        const threeDays = 1000 * 3600 * 24 * 3;
        const start = this.searchForm.dateTimeRange[0];
        const end = this.searchForm.dateTimeRange[1];
        if ((end.getTime() - start.getTime()) > threeDays) {
          end.setTime(start.getTime() + threeDays);
          console.log(start, end);
          this.searchForm.dateTimeRange[1] = end;
          this.$message.warning('为减轻后台压力，默认截取从开始日期三天内的数据。');
        }
      }
    },
    methods: {
      onVersionSelected(appInfo, profileInfo, serviceInfo) {
        if (!appInfo || !profileInfo) {
          return;
        }
        this.searchForm.appId = appInfo.appId;
        this.searchForm.spaceId = profileInfo.id;
        this.searchForm.serviceVersion = serviceInfo ? serviceInfo.serviceVersion : '';
//        this.requestLogAtStart();
        // save to localStorage after selected change
        this.$store.dispatch('user/config', {
          page: 'log/deploy',
          data: {
            appId: appInfo.appId,
            profileId: profileInfo.id,
            serviceId: serviceInfo ? serviceInfo.id : ''
          }
        });
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
          podName: this.searchForm.instanceName,
          // logLevel: this.searchForm.logLevel,
          logLevels: this.searchForm.logLevel,
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
          console.log(err);
          this.showLoading = false;
          this.dialogStatus.showLoading = false;
        });
      },


        handleCheckAllChange(val) {
            this.searchForm.logLevel = val ? this.logLevelList : [];
            this.isIndeterminate = false;
        },
        handleCheckedCitiesChange(value) {
            let checkedCount = value.length;
            this.checkAll = checkedCount === this.logLevelList.length;
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.logLevelList.length;

        }
    }
  }
</script>