<template>
  <div id="record-main">
    <div class="header">
      <!--<div class="item">-->
        <!--<label>-->
          <!--<span>应用名称:</span>-->
          <!--<el-select filterable placeholder="请选择" size="mini-extral" v-model="selectedAppId">-->
            <!--<el-option v-for="(item,index) in appList" :key="item.appId" :label="item.appName" :value="item.appId">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</label>-->
      <!--</div>-->
      <div class="item">
        <el-button size="mini-extral" type="primary" style="margin-right: 5px;" @click="handleClick($event, 'execute')">执行</el-button>
        <el-button size="mini-extral" type="primary" style="margin-right: 5px;" @click="handleClick($event, 'fresh-record-list')">刷新</el-button>
        <!--<el-button size="mini-extral" type="primary" style="margin-right: 5px">修改配置</el-button>-->
      </div>
    </div>
    <div class="record-list">
      <el-table
        style="width: 100%"
        stripe
        element-loading-text="加载中"
        :data="buildList">
        <el-table-column
          prop="statusName"
          label="状态"
          width="200"
          headerAlign="center"
          align="center">
        </el-table-column>
        <el-table-column
                prop="buildId"
                label="运行"
                width="80"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
          prop="executionTime"
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
  import {mapGetters} from "vuex"

  export default {
    created() {
      this.leavePage = false;
      if (this.$storeHelper.dataTransfer) {
        this.selectedAppId = this.$storeHelper.dataTransfer["data"]["appId"];
        this.$storeHelper.dataTransfer = null;
      }
    },
    mounted() {
      if(this.appInfoListOfGroup) {
        this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      }
      this.getBuildList();
      this.getBuildingList();
      this.oneSecondInterval = setInterval(() => {
        this.formatBuildList();
//        console.log('in oneSecondInterval');
      }, 1000);
    },
    beforeDestroy() {
      clearInterval(this.oneSecondInterval);
      this.leavePage = true;
    },
    data() {
      return {
        oneSecondInterval: null,
        lastBuildId: null,
        leavePage: false,

        appList: [],
        selectedAppId: null,
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
      ...mapGetters('user', {
        'appInfoListOfGroup': 'appInfoListOfGroup'
      }),
    },
    watch: {
      'appInfoListOfGroup' : 'onAppInfoListOfGroup',
      'selectedAppId': function () {
        this.getBuildList();
      }
    },
    methods: {
      onAppInfoListOfGroup(appInfoListOfGroup) {
        this.appList = [];
        if (appInfoListOfGroup) {
          if (appInfoListOfGroup.hasOwnProperty("appList")) {
            this.appList = appInfoListOfGroup["appList"];
          }
        }
      },

      async requestPipelineList() {
        let selectedApp = this.appList.find(it => {
          return it["appId"] === this.selectedAppId;
        });
        let payload = {
          groupTag: this.$storeHelper.groupInfo.tag,
          serviceName: selectedApp.serviceName,
        };
        this.pipeline = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_list,{payload});
      },

      /** 获取构建列表
       * getBuildList
       * lastBuildId
       *
       * @returns {Promise.<*|Array>}
       */
      async getBuildList() {
        // let payload = {
        //   appId: this.selectedAppId,
        //   jobName: this.pipeline[0]["jobName"],
        // };
        this.buildList = [];
        const payload = {
          jobName: "job-jingang-demo-jar-bqd-4940",
          appId: 20480,
        };
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_build_list, {
          payload
        });
        this.buildList = resContent;
        this.formatBuildList();

        return this.buildList;
      },

      // 不断更新该pipeline的构建状态
      async getBuildingList() {
        if (this.leavePage) {
          return;
        }
//        console.log(this.lastBuildId);
        if (this.lastBuildId) {
          const payload = {
            buildId: this.lastBuildId,
            jobName: 'job-jingang-demo-jar-bqd-4940',
            appId: 20480
          };
          this.buildingList = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_in_building, {
            payload
          });
          var lastBuildingId = this.lastBuildId;
          if (Array.isArray(this.buildingList)) {
            this.buildingList.forEach(it => {
              if ('IN_PROGRESS' === it['status']) {
                lastBuildingId = it['buildId'];
              }
            });
          }
          if (lastBuildingId !== this.lastBuildId) {
            this.lastBuildId = lastBuildingId;
            this.getBuildList();
          }
        } else {
          await this.getBuildList();
        }
        await new Promise((resolve) => {
          setTimeout(resolve, 3600);
        });
        await this.getBuildingList();
      },

      formatBuildList() {
//        {
//          buildId: "73"
//          duration: 76112
//          executionTime: 1545300998672
//          message: null
//          status: "FAILURE"
//        }
//        {
//          buildId: "73"
//          durationMillis: "76112"
//          endTimeMillis: "1545301074841"
//          listStage: null
//          startTimeMillis: "1545300998729"
//          status: "FAILED"
//        }
        const updateBuildStatus1 = () => {
//          const buildIdList = Object.keys(this.buildList);
//          const buildingIdList = Object.keys(this.buildingList);
          const buildMap = {}, buildingMap = {};
          this.buildList.forEach(it => {
            buildMap[it['buildId']] = it;
          });
          this.buildingList.forEach(it => {
            buildingMap[it['buildId']] = it;
          });
          const keys = Array.from(new Set(
            this.buildList.map(it => it['buildId']).concat(this.buildingList.map(it => it['buildId']))
          )).sort((pre, next) => {
            return (pre - next) * -1;
          });
          keys.forEach(key => {
            if (buildingMap.hasOwnProperty(key)) {
              const buildingItem = buildingMap[key];
              if (buildMap.hasOwnProperty(key)) {
                buildMap[key]['status'] = buildingItem['status'];
                buildMap[key]['duration'] = parseInt(buildingItem['durationMillis']);
              } else {
              }
            }
          });
        };
        const updateBuildStatus = () => {
          var buildingMap = {};
          this.buildingList.forEach(it => {
            buildingMap[it['buildId']] = it;
          });
          const buildingKeys = this.buildingList.map(it => it['buildId']);
          buildingKeys.forEach(key => {
            this.buildList.some(it2 => {
              if (it2['buildId'] == key) {
                var item = buildingMap[key];
                it2['status'] = item['status'];
                it2['duration'] = parseInt(item['durationMillis']);
                return true;
              }
            })
          });
          const buildList = this.buildList;
          this.buildList = [];
          this.buildList = buildList;
        };

        const origin = this.buildList;
        var lastBuildId = null;
        if (origin.length > 0) {
          lastBuildId = origin[0]['buildId'];
        }
        updateBuildStatus();
        console.log(this.buildList);
        origin.forEach(it => {
//          if (Array.isArray(this.buildingList)) {
//            this.buildingList.find(it2 => {
//              return it2['buildId'] === it['buildId'];
//            })
//          }
//          if ('UNKNOWN' === it['status']) {
          if ('IN_PROGRESS' === it['status']) {
            it['duration'] += 1000;
            lastBuildId = it['buildId'];
          }
          it["executionTime"] = this.$utils.formatDate(new Date(it["executionTime"]),"yyyy-MM-dd hh:mm:ss");
          it['formattedDuration'] = this.$utils.formatSeconds(it['duration']);
          it["statusName"] = this.statusMap[it['status']];
          if(!it["message"]) {
            it["message"] = "---"
          }
          return it;
        });
        if (lastBuildId) {
          this.lastBuildId = lastBuildId;
        }
//        console.log(lastBuildId);
//        console.log(this.buildList);
        return origin;
      },

      // 执行pipeline
      async executePipeLine() {
        const payload = {
          jobName: "job-jingang-demo-jar-bqd-4940",
          appId: 20480,
        };
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_record_restart, {
          payload
        });
//        console.log(resContent);
      },

      async handleClick(evt, action) {
        switch (action) {
          case 'fresh-record-list':
            this.getBuildList();
            break;
          case 'execute':
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
              payload: {
                jobName: "job-jingang-demo-jar-bqd-4940",
                appId: 20480,
                buildId: row['buildId']
              }
            });
            break;
        }
      }
    }
  }
</script>