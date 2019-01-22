<template>
  <div id="record-main">
    <div class="header">
      <div class="item">
        <el-button size="mini-extral" type="primary" style="margin-right: 5px;"
                   :loading="loadingStatus4Execute"
                   @click="handleClick($event, 'execute')">执行</el-button>
        <el-button size="mini-extral" type="primary" style="margin-right: 5px;" @click="handleClick($event, 'refresh-record-list')">刷新</el-button>
        <div style="display: inline-block; margin-left: 16px">
          <span style="font-weight: bold">pipeline名称：</span><span>{{dataPassed.pipelineName}}</span>
        </div>
        <div style="display: inline-block; margin-left: 16px">
          <span style="font-weight: bold">应用名称：</span><span>{{dataPassed.appName}}</span>
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
        const from = dataTransfer['from'];
        const data = dataTransfer['data'];
        this.relatedAppId = data['appId'];
        this.dataPassed.appName = data['appName'];
        this.dataPassed.pipelineName = data['pipelineName'];
        this.$storeHelper.dataTransfer = null;
      } else {
        this.$router.push(this.$net.page['profile/pipeline/list']);
      }
    },
    async mounted() {
      try {
        await this.startHeartBeat(4000, this.loopRequestBuildingList);
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
        loadingStatus4Execute: false,
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
        buildList.forEach(it => {
          buildMap[it['buildId']] = it;
        });
        buildingList.forEach(it => {
          buildingMap[it['buildId']] = transfer(it);
        });
        const keys = Array.from(new Set(
          buildList.map(it => it['buildId']).concat(buildingList.map(it => it['buildId']))
        )).sort((pre, next) => {
          return (pre - next) * -1;
        });
        var result = keys.map(key => {
          return Object.assign(buildMap.hasOwnProperty(key) ? buildMap[key] : {}, buildingMap.hasOwnProperty(key) ? buildingMap[key] : {});
        });
//        console.log(result);
        return result;
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
        this.buildList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_build_list, {
          params: {
            appId: this.relatedAppId
          }
        });
        this.buildList = resContent;

        // 如果status == 'UNKNOWN'，说明该record正在构建中，需要通过requestBuildingList获取详细构建信息
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
        this.buildingList = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_in_building, {
          params: {
            appId: this.relatedAppId
          },
          query: {
            buildId: this.lastBuildRecord['buildId']
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
          ['buildId', 'status'].forEach(key => {
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
          if ((this.lastBuildRecord['status'] !== 'UNKNOWN') && (this.buildingList[0]['buildId'] == this.lastBuildRecord['buildId'])) {
            needUpdateBuildList = false;
          }
        }

        if (needUpdateBuildList) {
          await this.requestBuildList();
        }
        await this.requestBuildingList();
        this.buildListAll = this.mergeBuildList(this.buildList, this.buildingList);
//        console.log(this.buildListAll);
        this.formatBuildList();
      },

      async startHeartBeat(milliSeconds, func) {
        if (this.leavePage) {
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