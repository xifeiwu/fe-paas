<template>
  <div id="record-main">
    <div class="header">
      <div class="item">
        <el-button size="mini" type="primary" style="margin-right: 5px;"
                   class="flex"
                   :loading="statusOfWaitingResponse('pipeline_build_execute')"
                   @click="handleClick($event, 'pipeline_build_execute')">
          <span>执行</span>
          <i class="paas-icon-fa-play" style="margin-left: 3px;"></i>
        </el-button>
        <el-button size="mini" type="primary" style="margin-right: 5px;"
                   class="flex"
                   @click="handleClick($event, 'refresh-record-list')">
          <span>刷新</span>
          <i class="el-icon-refresh" style="margin-left: 3px;"></i>
        </el-button>
        <div style="display: inline-block; margin-left: 16px">
          <span style="font-weight: bold">应用名称：</span><span>{{dataPassed.appName}}</span>
        </div>
        <div style="display: inline-block; margin-left: 16px">
          <span style="font-weight: bold">pipeline名称：</span><span>{{dataPassed.pipelineName}}</span>
        </div>
        <!--<el-button size="mini-extral" type="primary" style="margin-right: 5px">修改配置</el-button>-->
      </div>
    </div>
    <div class="record-list">
      <el-table
        style="width: 100%"
        stripe
        element-loading-text="加载中"
        :data="buildListAll">
        <el-table-column
          prop="statusName"
          label="状态"
          width="200"
          headerAlign="center"
          align="center">
          <template slot-scope="scope">
            {{scope.row.statusName}}
            <!--{{scope.row.buildingStatus ? scope.row.buildingStatus : scope.row.statusName}}-->
          </template>
        </el-table-column>
        <el-table-column
                prop="buildNumber"
                label="运行"
                width="80"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
          prop="formattedExecutionTime"
          label="执行时间"
          width="200"
          headerAlign="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="formattedDuration"
          label="持续时间"
          width="160"
          headerAlign="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="message"
          label="消息"
          minWidth="100"
          headerAligin="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="operation"
          label="操作"
          headerAlign="center"
          minWidth="100"
          align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row['status'] === 'IN_PROGRESS'"
              type="text"
              :class="['flex', 'danger']"
              @click="handleTRClick($event, 'stop', scope.$index, scope.row)">
              <span>停止</span>
            </el-button>
            <div class="ant-divider" v-if="scope.row['status'] === 'IN_PROGRESS'"></div>
            <el-button
              type="text"
              :class="['flex', 'primary']"
              :loading="statusOfWaitingResponse('pipeline_build_restart') && action.row.buildNumber == scope.row.buildNumber"
              @click="handleTRClick($event, 'pipeline_build_restart', scope.$index, scope.row)">
              <span>重启</span>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
              type="text"
              :class="['flex', 'primary']"
              :loading="statusOfWaitingResponse('pipeline_build_history') && action.row.buildNumber == scope.row.buildNumber"
              @click="handleTRClick($event, 'pipeline_build_history', scope.$index, scope.row)">
              <span>构建日志</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <paas-dialog-for-log :showStatus="buildLogStatus" ref="dialogForBuildLog">
      <div slot="content">
        <div v-for="(item, index) in buildLogStatus.logList" :key="index" class="log-item" v-html="item"></div>
      </div>
    </paas-dialog-for-log>
  </div>
</template>

<style lang="scss">
  #record-main {
    .header {
    }
  }
</style>
<style lang="scss" scoped>
  #record-main {
    background-color: white;
    height: 100%;
    max-width: 1500px;
    & > .header {
      padding: 3px 5px;
      font-size: 14px;
      .item {
        display: inline-block;
        margin-right: 5px;
      }
      .el-select {
        width: 180px;
      }
    }
  }
</style>

<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  import paasDialogForLog from 'assets/components/dialog4log.vue';

  const MS_BEFORE_GET_RECORD_LIST = 5000;
  export default {
    components: {paasDialogForLog},
    mixins: [commonUtils],
    created() {
      var dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer['from'];
        const data = dataTransfer['data'];
        this.relatedAppId = data['appId'];
        this.dataPassed.appName = data['appName'];
        this.dataPassed.pipelineName = data['pipelineName'];
        this.$storeHelper.dataTransfer = null;
      } else {
        this.$router.push(this.$net.page['profile/pipeline/list']);
        return;
      }
    },
    async mounted() {
      try {
//        await this.startHeartBeat(4000, this.loopRequestBuildingList);
        await this.requestBuildingStatus();
      } catch(err) {
        console.log(err);
      }
    },
    beforeDestroy() {
      this.leavePage = true;
    },
    data() {
      return {
        lastBuildRecord: null,
        lastBuildingRecord: null,
        leavePage: false,
        leaveHeartBeat: false,
        dataPassed: {
          appName: '',
          pipelineName: ''
        },

        relatedAppId: null,
        buildListAll: [],
        buildList: [],
        buildingList: [],
        pipeline: null,
        statusMap: {
          SUCCESS: '成功',
          FAILURE: '失败',
          FAILED: '失败',
          ABORTED: '中止',
          CANCELLED: '已取消',
          BUILDING: '构建中',
          REBUILDING: '重建中',
          NOT_BUILD: '未构建',
          UNSTABLE: '不稳定',
          UNKNOWN: '构建中',
          IN_PROGRESS: '构建中',
        },

        action: {
          row: null,
          name: null
        },
        buildLogStatus: {
          title: '日志',
          visible: false,
          logList: []
        }
      }
    },
    computed: {
    },
    watch: {
    },
    methods: {
      // merge status of buildList and buildingList
      mergeBuildList(buildList, buildingList) {
//        {
//          buildNumber: "92"
//          duration: 76675
//          executionTime: 1545374195910
//          message: null
//          status: "FAILURE"
//        }
//        {
//          buildNumber: "92"
//          durationMillis: "76675"
//          endTimeMillis: "1545374272616"
//          listStage: null
//          startTimeMillis: "1545374195941"
//          status: "FAILED"
//        }
        const transfer = (o) => {
          var result = {
            buildNumber: o['buildNumber'],
            duration: parseInt(o['durationMillis']),
            executionTime: parseInt(o['startTimeMillis']),
//            message: null,
            status: o['status'],
            tag: o['tag'],
            stages: o['stages'],
          };
          if (result.tag && result.tag === 'building' && Array.isArray(result.stages) && result.stages.length > 0) {
            result['buildingStatus'] = `构建中/${result['stages'][result['stages'].length - 1]['name']}`;
          }
          return result;
        };
        const buildMap = {}, buildingMap = {};
        buildList.forEach(it => {
          buildMap[it['buildNumber']] = it;
        });
        buildingList.forEach(it => {
          buildingMap[it['buildNumber']] = transfer(it);
        });
        const keys = Array.from(new Set(
          buildList.map(it => it['buildNumber']).concat(buildingList.map(it => it['buildNumber']))
        )).sort((pre, next) => {
          return (pre - next) * -1;
        });
        var result = keys.map(key => {
          return Object.assign(buildMap.hasOwnProperty(key) ? buildMap[key] : {}, buildingMap.hasOwnProperty(key) ? buildingMap[key] : {});
        });
        this.formatBuildList(result);
//        console.log(result);
        return result;
      },

      formatBuildList(dataList) {
        dataList.forEach(it => {
          it["formattedExecutionTime"] = this.$utils.formatDate(new Date(it["executionTime"]), "yyyy-MM-dd hh:mm:ss");
          it['formattedDuration'] = this.$utils.formatSeconds(it['duration']);
          it["statusName"] = this.statusMap[it['status']];
          if(!it["message"]) {
            it["message"] = "---"
          }
        });
      },

      /** 获取构建列表
       * requestBuildList
       *
       * @returns {Promise.<*|Array>}
       */
      async requestBuildList() {
        if (!this.relatedAppId) {
          return;
        }
        this.buildList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_build_list, {
          params: {
            appId: this.relatedAppId
          }
        });
        this.buildList = resContent;

        // 如果status == 'UNKNOWN'，说明该record正在构建中，需要通过requestBuildingList获取详细构建信息
        var lastBuildRecord = null;
        this.lastBuildingRecord = null;
        if (this.buildList.length > 0) {
          lastBuildRecord = this.buildList[0];
        }
        this.buildList.forEach(it => {
          if (('UNKNOWN' === it['status'])) {
            this.lastBuildingRecord = it;
            lastBuildRecord = it;
          }
        });
        this.lastBuildRecord = lastBuildRecord;

//        this.formatBuildList();
        return this.buildList;
      },

      async requestBuildingList() {
        if (!this.relatedAppId) {
          return;
        }
        this.buildingList = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_in_building, {
          params: {
            appId: this.relatedAppId
          },
          query: {
            buildNumber: this.lastBuildRecord['buildNumber']
          }
        });
        this.lastBuildingRecord = null;
        this.buildingList.forEach(it => {
          if (['NOT_EXECUTED', 'IN_PROGRESS'].indexOf(it.status) > -1) {
            this.lastBuildingRecord = it;
            it.tag = 'building';
          } else {
            it.tag = 'has-build';
          }
        });
        return this.buildingList;
      },

      // 轮询更新构建列表
      async loopRequestBuildingList() {
        const theSameRecord = (one, two) => {
          var theSame = true;
          ['buildNumber', 'status'].forEach(key => {
            theSame = theSame & (one[key] == two[key])
          });
          return theSame;
        };
//        console.log(this.lastBuildRecord);
        var needUpdateBuildList = false;
        if (null === this.lastBuildRecord) {
          needUpdateBuildList = true;
        } else if (this.buildingList && this.buildingList.length > 0 && this.buildingList.every(it => {
            return it.tag === 'has-build';
          })) {
          needUpdateBuildList = true;
          if ((this.lastBuildRecord['status'] !== 'UNKNOWN') && (this.buildingList[0]['buildNumber'] == this.lastBuildRecord['buildNumber'])) {
            needUpdateBuildList = false;
          }
        }

        if (needUpdateBuildList) {
          await this.requestBuildList();
        }
        await this.requestBuildingList();
        this.buildListAll = this.mergeBuildList(this.buildList, this.buildingList);
//        console.log(this.buildListAll);
      },

      // 请求buildList和buildingList，直到buildingList的状态不再更新
      async requestBuildingStatus() {
        await this.requestBuildList();
        this.buildListAll = this.mergeBuildList(this.buildList, []);
        this.leaveHeartBeat = false;
        await this.startHeartBeat(1000, this.loopUntilBuildingFinish);
        // request again
        await this.requestBuildList();
        this.buildListAll = this.mergeBuildList(this.buildList, []);
      },

      async loopUntilBuildingFinish() {
        if (this.lastBuildingRecord) {
          await this.requestBuildingList();
          this.buildListAll = this.mergeBuildList(this.buildList, this.buildingList);
        } else {
          this.leaveHeartBeat = true;
        }
      },

      async startHeartBeat(milliSeconds, func) {
        if (this.leavePage || this.leaveHeartBeat) {
          return;
        }
        try {
          await func();
          await new Promise((resolve) => {
            setTimeout(resolve, milliSeconds);
          });
          await this.startHeartBeat(milliSeconds, func);
        } catch(err) {
          console.log(err);
          // ensure startHeartBeat go-on when any error is thrown
          await new Promise((resolve) => {
            setTimeout(resolve, milliSeconds);
          });
          await this.startHeartBeat(milliSeconds, func);
        }
      },

      // 执行pipeline
      async executePipeLine() {
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_record_restart, {
          params: {
            appId: this.relatedAppId
          }
        });
//        console.log(resContent);
      },

      async handleClick(evt, action) {
        switch (action) {
          case 'refresh-record-list':
            this.requestBuildingStatus();
//            this.requestBuildList();
            break;
          case 'pipeline_build_execute':
            try {
              await this.executePipeLine();
              this.addToWaitingResponseQueue(action);
              this.$net.addToRequestingRrlList(action);
              await new Promise((resolve) => {
                setTimeout(resolve, MS_BEFORE_GET_RECORD_LIST);
              });
              this.hideWaitingResponse(action);
              this.$net.removeFromRequestingRrlList(action);
              await this.requestBuildingStatus();
            } catch(err) {
              this.hideWaitingResponse(action);
              this.$net.removeFromRequestingRrlList(action);
            }
            break;
        }
      },

      async handleTRClick(evt, action, index, row) {
        this.action.row = row;
        var resData = null;
        var resContent = null;
        switch (action) {
          case 'pipeline_build_restart':
            try {
              await this.executePipeLine();
              this.addToWaitingResponseQueue(action);
              this.$net.addToRequestingRrlList(action);
              await new Promise((resolve) => {
                setTimeout(resolve, MS_BEFORE_GET_RECORD_LIST);
              });
              this.hideWaitingResponse(action);
              this.$net.removeFromRequestingRrlList(action);
              await this.requestBuildingStatus();
            } catch(err) {
              this.hideWaitingResponse(action);
              this.$net.removeFromRequestingRrlList(action);
            }
            break;
          case 'stop':
            this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_record_stop, {
              params: {
                appId: this.relatedAppId
              },
              query: {
                buildNumber: row['buildNumber']
              }
            });
            break;
          case 'pipeline_build_history':
            resData = await this.$net.requestPaasServer(Object.assign(
              this.$net.URL_LIST.pipeline_record_build_history,
              {
                withCode: true
              }), {
              payload: {
                appId: this.relatedAppId,
                buildNumber: row['buildNumber'],
                currentBufferSize: 0,
                // 是否分页查询
                limit: false
              }
            });
            // 文件太大只能下载到本地
            if (resData.code === 'FILE_CONTENT_TOO_LARGE') {
              await this.$confirm(`pipeline "${this.dataPassed.pipelineName}" 第${row['buildNumber']}次的构建日志超过2M，点击"确定"，下载到本地查看。`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });

              const REQUEST_DESC_DOWNLOAD = this.$net.URL_LIST['pipeline_record_build_history_download'];

              this.$net.addToRequestingRrlList(REQUEST_DESC_DOWNLOAD.path);
              this.$net.getResponse(REQUEST_DESC_DOWNLOAD, {
                params: {
                  appId: this.relatedAppId
                },
                query: {
                  buildNumber: row['buildNumber']
                }
              }, {
                headers: {
                  token: this.$storeHelper.getUserInfo('token')
                },
                responseType: 'blob'
              }).then(res => {
//                  console.log(res);
                const a = document.createElement('a');
                const blob = new Blob([res.data]);
                a.href = window.URL.createObjectURL(blob);
                a.download = `${this.dataPassed.pipelineName}-第${row['buildNumber']}次的构建日志.txt`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
              }).catch(err => {
                this.$net.showError(err);
              }).finally(() => {
                this.$net.removeFromRequestingRrlList(REQUEST_DESC_DOWNLOAD.path);
              });
            } else {
              const resContent = resData.resContent;
              if (resContent.hasOwnProperty('consoleLog')) {
                this.buildLogStatus.title = `${this.dataPassed.pipelineName}-第${row['buildNumber']}次的构建日志`;
                this.buildLogStatus.logList = resContent['consoleLog'].split('\n');
                this.buildLogStatus.visible = true;
              }
            }
            break;
        }
      }
    }
  }
</script>