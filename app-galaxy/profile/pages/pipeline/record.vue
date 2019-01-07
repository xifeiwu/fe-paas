<template>
  <div id="record-main">
    <div class="header">
      <div class="item">
        <el-button size="mini-extral" type="primary" style="margin-right: 5px;"
                   :loading="loadingStatus4Execute"
                   @click="handleClick($event, 'execute')">执行</el-button>
        <el-button size="mini-extral" type="primary" style="margin-right: 5px;" @click="handleClick($event, 'refresh-record-list')">刷新</el-button>
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
                prop="buildId"
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
              :clase="['flex', 'primary']"
              @click="handleTRClick($event, 'stop', scope.$index, scope.row)">
              <span>停止</span>
            </el-button>
            <el-button
              type="text"
              :clase="['flex', 'primary']"
              @click="handleTRClick($event, 'restart', scope.$index, scope.row)">
              <span>重启</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
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
  export default {
    created() {
      var dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        this.relatedAppId = dataTransfer["data"]["appId"];
        dataTransfer = null;
      } else {
        this.$router.push(this.$net.page['profile/pipeline/list']);
      }
    },
    async mounted() {
      try {
        await this.startOneSecondInterval();
        await this.startThreeSecondsInterval();
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
        leavePage: false,
        loadingStatus4Execute: false,

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
        }
      }
    },
    computed: {
    },
    watch: {
    },
    methods: {
      async startOneSecondInterval() {
        if (this.leavePage) {
          return;
        }
        try {
          this.formatBuildList();
          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          });
          this.startOneSecondInterval();
        } catch(err) {
          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          });
          this.startOneSecondInterval();
        }
      },

      mergeBuildList() {
//        {
//          buildId: "92"
//          duration: 76675
//          executionTime: 1545374195910
//          message: null
//          status: "FAILURE"
//        }
//        {
//          buildId: "92"
//          durationMillis: "76675"
//          endTimeMillis: "1545374272616"
//          listStage: null
//          startTimeMillis: "1545374195941"
//          status: "FAILED"
//        }
        const transfer = (o) => {
          var result = {
            buildId: o['buildId'],
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
        this.buildList.forEach(it => {
          buildMap[it['buildId']] = it;
        });
        this.buildingList.forEach(it => {
          buildingMap[it['buildId']] = transfer(it);
        });
        const keys = Array.from(new Set(
          this.buildList.map(it => it['buildId']).concat(this.buildingList.map(it => it['buildId']))
        )).sort((pre, next) => {
          return (pre - next) * -1;
        });
        var result = keys.map(key => {
          return Object.assign(buildMap.hasOwnProperty(key) ? buildMap[key] : {}, buildingMap.hasOwnProperty(key) ? buildingMap[key] : {});
        });
//        console.log(result);
        return result;
      },

      async startThreeSecondsInterval() {
//        console.log('startThreeSecondsInterval');
        const sleepMilliSeconds = 4000;
        const theSameRecord = (one, two) => {
          var theSame = true;
          ['buildId', 'status'].forEach(key => {
            theSame = theSame & (one[key] == two[key])
          });
          return theSame;
        };
        if (this.leavePage) {
          return;
        }
        try {
//        console.log(this.lastBuildRecord);
          var needUpdateBuildList = false;
          if (null === this.lastBuildRecord) {
            needUpdateBuildList = true;
          } else if (this.buildingList && this.buildingList.length > 0 && this.buildingList.every(it => {
              return it.tag === 'has-build';
            })) {
            needUpdateBuildList = true;
            if ((this.lastBuildRecord['status'] !== 'UNKNOWN') && (this.buildingList[0]['buildId'] == this.lastBuildRecord['buildId'])) {
              needUpdateBuildList = false;
            }
          }

//        console.log(needUpdateBuildList);
          if (needUpdateBuildList) {
            await this.requestBuildList();
          }
          await this.requestBuildingList();
          this.buildListAll = this.mergeBuildList();
//        console.log(this.buildListAll);
          this.formatBuildList();
          await new Promise((resolve) => {
            setTimeout(resolve, sleepMilliSeconds);
          });
          await this.startThreeSecondsInterval();
        } catch(err) {
          console.log(err);
          // ensure startThreeSecondsInterval go-on when any error is thrown
          await new Promise((resolve) => {
            setTimeout(resolve, sleepMilliSeconds);
          });
          await this.startThreeSecondsInterval();
        }
      },

      formatBuildList() {
        this.buildListAll.forEach(it => {
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
        // let payload = {
        //   appId: this.relatedAppId,
        //   jobName: this.pipeline[0]["jobName"],
        // };
        this.buildList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_build_list, {
          params: {
            appId: this.relatedAppId
          }
        });
        this.buildList = resContent;

        var lastBuildRecord = null;
        if (this.buildList.length > 0) {
          lastBuildRecord = this.buildList[0];
        }
        this.buildList.forEach(it => {
          if (('UNKNOWN' === it['status'])) {
            lastBuildRecord = it;
          }
        });
        this.lastBuildRecord = lastBuildRecord;

//        this.formatBuildList();
        return this.buildList;
      },

      async requestBuildingList() {
//        const payload = {
//          buildId: this.lastBuildRecord['buildId'],
//          jobName: 'job-jingang-demo-jar-bqd-4940',
//          appId: 20480
//        };
        this.buildingList = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_in_building, {
          params: {
            appId: this.relatedAppId
          },
          query: {
            buildId: this.lastBuildRecord['buildId']
          }
        });
        this.buildingList.forEach(it => {
          if (['NOT_EXECUTED', 'IN_PROGRESS'].indexOf(it.status) > -1) {
            it.tag = 'building';
          } else {
            it.tag = 'has-build';
          }
        });
      },

      // 执行pipeline
      async executePipeLine() {
//        const payload = {
//          jobName: "job-jingang-demo-jar-bqd-4940",
//          appId: 20480,
//        };
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
            this.requestBuildList();
            break;
          case 'execute':
            this.loadingStatus4Execute = true;
            setTimeout(() => {
              this.loadingStatus4Execute = false;
            }, 4000);
            this.executePipeLine();
            break;
        }
      },

      async handleTRClick(evt, action, index, row) {
        switch (action) {
          case 'restart':
            this.executePipeLine();
            break;
          case 'stop':
            const payload = {
              jobName: "job-jingang-demo-jar-bqd-4940",
                appId: 20480,
                buildId: row['buildId']
            };
            this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_record_stop, {
              params: {
                appId: this.relatedAppId
              },
              query: {
                buildId: row['buildId']
              }
            });
            break;
        }
      }
    }
  }
</script>