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
          width="80"
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
          <template slot-scope="scope" v-if="scope.$index === 0">
            <el-button
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
      min-height: 28px;
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
    },
    data() {
      return {
        appList: [],
        selectedAppId: null,
        buildList: [],
        pipeline: null,
        statusMap: {
          SUCCESS: '成功',
          FAILURE: '失败',
          ABORTED: '中止',
          CANCELLED: '已取消',
          BUILDING: '构建中',
          REBUILDING: '重建中',
          NOT_BUILD: '未构建',
          UNSTABLE: '不稳定',
          UNKNOWN: '构建中',
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

      async getBuildList() {
//        await this.requestPipelineList();
        // let payload = {
        //   appId: this.selectedAppId,
        //   jobName: this.pipeline[0]["jobName"],
        // };
        let payload = {
          jobName: "job-jingang-demo-jar-bqd-4940",
          appId: 20480,
        };
        let resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_build_list, {
          payload
        });
        if(resContent) {
          this.buildList = resContent.map(it => {
            it["executionTime"] = this.$utils.formatDate(new Date(it["executionTime"]),"yyyy-MM-dd hh:mm:ss");
//            it["duration"] = Math.floor(it["duration"] / 1000);
            it['formattedDuration'] = this.$utils.formatSeconds(it['duration']);
            it["statusName"] = this.statusMap[it['status']];
            if(!it["message"]){
              it["message"] = "---"
            }
            return it;
          });
        }
      },
      async executePipeLine() {
        const payload = {
          jobName: "job-jingang-demo-jar-bqd-4940",
          appId: 20480,
        };
        let resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_record_restart, {
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

      async handleTRClick(evt, action, index, item) {
        switch (action) {
          case 'restart':
            this.executePipeLine();
            break;
          case 'stop':
            break;
        }
      }
    }
  }
</script>