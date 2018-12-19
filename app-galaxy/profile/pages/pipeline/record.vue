<template>
  <div id="record-main">
    <el-row class="header" type="flex" justify="left" align="middle">
      <el-col :span="5">
        <label style="float: left; width: 66px; line-height: 26px">应用名称:</label>
        <el-select filterable placeholder="请选择" style="display: block; margin-left: 66px" v-model="selectedAppId">
          <el-option v-for="(item,index) in appList" :key="item.appId" :label="item.appName" :value="item.appId">
          </el-option>
        </el-select>
      </el-col>
      <el-col :offset="14" :span="5">
        <el-button size="mini-extral" type="primary" style="margin-right: 5px;">执行</el-button>
        <el-button size="mini-extral" type="primary" style="margin-right: 5px">修改配置</el-button>
      </el-col>
    </el-row>
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
          headerAlign="left"
          align="left">
        </el-table-column>
        <el-table-column
          prop="executionTime"
          label="执行时间"
          width="200"
          headerAlign="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="duration"
          label="持续时间(s)"
          width="200"
          headerAlign="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="message"
          label="消息"
          width="400"
          headerAligin="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="operation"
          label="操作"
          headerAlign="center"
          align="center">
          <template slot-scope="scope" v-if="scope.$index === 0">
            <el-button
              type="text"
              :clase="['flex', 'primary']">
              <span>停止</span>
            </el-button>
            <el-button
              type="text"
              :clase="['flex', 'primary']">
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
      .el-select .el-input__inner {
        height: 26px;
      }
    }
  }
</style>
<style lang="scss" scoped>
  #record-main {
    background-color: white;
    height: 100%;
    max-width: 1500px;
    .el-row.header {
      padding: 3px 5px;
      font-size: 14px;
      min-height: 28px;
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
        statusList: [{
          status: "",
          statusName: "全部",
        },{
          status: "SUCCESS",
          statusName: "成功",
        },{
          status: "FAILURE",
          statusName: "失败",
        },{
          status: "ABORTED",
          statusName: "中止"
        },{
          status: "CANCELLED",
          statusName: "已取消",
        },{
          status: "REBUILDING",
          statusName: "重建中",
        },{
          status: "UNSTABLE",
          statusName: "不稳定",
        },{
          status: "BUILDING",
          statusName: "构建中",
        },{
          status: "NOT_BUILD",
          statusName: "未构建",
        },{
          status: "UNKNOWN",
          statusName: "未知",
        }],
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

      async getPipeline() {
        let selectedApp = this.appList.find(it => {
          return it["appId"] === this.selectedAppId;
        });
        let payload = {
          groupTag: this.$storeHelper.groupInfo.tag,
          serviceName: selectedApp.serviceName,
        };
        this.pipeline = await this.$net.requestPaasServer(this.$net.URL_LIST.get_list,{payload});
      },

      async getBuildList() {
        await this.getPipeline();
        // let payload = {
        //   appId: this.selectedAppId,
        //   jobName: this.pipeline[0]["jobName"],
        // };
        let payload = {
          jobName: "job-jingang-demo-jar-bqd-4940",
          appId: 20480,
        };
        let resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.get_build_list,{payload});
        if(resContent) {
          this.buildList = resContent.map(it => {
            it["executionTime"] = this.$utils.formatDate(new Date(it["executionTime"]),"yyyy-MM-dd hh:mm:ss");
            it["duration"] = Math.floor(it["duration"] / 1000);
            it["statusName"] = this.statusList.find(obj => {
              return it["status"] === obj["status"];
            })["statusName"];
            if(!it["message"]){
              it["message"] = "---"
            }
            return it;
          });
        }
      }
    }
  }
</script>