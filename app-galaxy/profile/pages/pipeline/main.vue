<template>
  <div id="pipeline-main">
    <div class="header">
      <div class="item">
        <label>
          <span style="line-height: 26px">应用名称:</span>
          <el-select filterable placeholder="请选择" size="mini-extral" v-model="selectedAppId">
            <el-option v-for="(item,index) in appList" :key="item.appId" :label="item.appName" :value="item.appId">
            </el-option>
          </el-select>
        </label>
      </div>
      <div class="item">
        <label>
          <span style="line-height: 26px">最近一次执行状态:</span>
          <el-select placeholder="请选择" size="mini-extral" v-model="selectedStatus">
            <el-option v-for="(item,index) in STATUS_LIST" :key="item.index" :label="item.statusName" :value="item.status"></el-option>
          </el-select>
        </label>
      </div>
      <div class="item">
        <el-input size="mini-extral" placeholder="搜索pipeline" suffix-icon="el-icon-search" class="search" v-model="keyFilter"></el-input>
      </div>
      <div class="item">
        <el-button size="mini-extral" type="primary" style="margin-right: 5px" @click="handleClick($event, 'search')">
          <span>查找</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
        </el-button>
        <el-button size="mini-extral" class="flex" type="primary" @click="handleClick($event, 'add')">
          <span>创建pipeline</span><i class="paas-icon-level-up" style="margin-left: 3px;"></i>
        </el-button>
      </div>
    </div>
    <div class="pipeline-list">
      <el-table
              :data="pipelineListByPage"
              style="width:100%"
              stripe
              element-loading-text="加载中"
              :height="heightOfTable">
        <el-table-column
                prop="pipelineName"
                label="Pipeline名称"
                minWidth="100"
                headerAlign="left"
                align="left">
        </el-table-column>
        <el-table-column
                prop="appName"
                label="应用名称"
                minWidth="100"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
                prop="lastRunStatusName"
                label="最后一次执行状态"
                width="150"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
                prop="creator"
                label="创建人"
                width="100"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
                prop="createTime"
                label="创建时间"
                width="160"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
                prop="description"
                label="描述"
                minWidth="120"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="180"
                headerAlign="center"
                align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              :clase="['flex', 'primary']"
              @click="handleTRClick($event, 'go-to-page-pipeline-update', scope.$index, scope.row)">
              <span>配置</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
              type="text"
              :clase="['flex', 'primary']"
              @click="handleTRClick($event, 'got-to-page-pipeline-records', scope.$index, scope.row)">
              <span>执行记录</span><i class="paas-icon-level-up"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize">
        <div class="pagination">
          <el-pagination
            :current-page="currentPage"
            size="large"
            layout="prev,pager,next"
            :pageSize="pageSize"
            :total="totalSize"
            @current-change="handlePaginationPageChange">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  #pipeline-main {
    .header {
    }
  }
</style>
<style lang="scss" scoped>
  #pipeline-main {
    background-color: white;
    height:100%;
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
  import {mapGetters} from 'vuex';

  export default {
    created() {
    },
    mounted() {
      if(this.appInfoListOfGroup) {
        this.onAppInfoListOfGroup(this.appInfoListOfGroup);
      }
      this.updatePipelineListByPage(true,false);
      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    data() {
      return {
        selectedAppId: null,
        appList: [],
        pipelineList: [],
        filterPipelineList: [],
        pipelineListByPage: [],
        selectedStatus: "",
        STATUS_LIST: [{
          status: "",
          statusName: "全部",
        }, {
          status: "SUCCESS",
          statusName: "成功",
        }, {
          status: "FAILURE",
          statusName: "失败",
        }, {
          status: "ABORTED",
          statusName: "中止"
        }, {
          status: "CANCELLED",
          statusName: "已取消",
        }, {
          status: "REBUILDING",
          statusName: "重建中",
        }, {
          status: "UNSTABLE",
          statusName: "不稳定",
        }, {
          status: "BUILDING",
          statusName: "构建中",
        }, {
          status: "NOT_BUILT",
          statusName: "未构建",
        }, {
          status: "UNKNOWN",
          statusName: "未知",
        }],
        keyFilter: "",
        totalSize: 0,
        pageSize: 12,
        currentPage: 1,
        heightOfTable: "",
      }
    },
    computed: {
      ...mapGetters('user', {
        'appInfoListOfGroup': 'appInfoListOfGroup'
      }),
    },
    watch: {
      'appInfoListOfGroup': 'onAppInfoListOfGroup',
      'selectedAppId': function () {
        this.updatePipelineListByPage(true, false);
      },
      'selectedStatus': function () {
        this.updatePipelineListByPage(false, true);
      },
      'keyFilter': function () {
        this.updatePipelineListByPage(false, true);
      },
    },
    methods: {

      onScreenSizeChange(size) {
        if (!size) {
          return;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight;
          this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 15 : 12;
        } catch(err) {
        }
      },

      onAppInfoListOfGroup(appInfoListOfGroup) {
        this.initDataStatus();
        if (appInfoListOfGroup) {
          if (appInfoListOfGroup.hasOwnProperty("appList")) {
            this.appList = appInfoListOfGroup["appList"];
            this.appList = [{appId:'', appName:"全部", serviceName:''}].concat(this.appList);
            this.selectedAppId = this.appList[0]["appId"];
            // comment this line as updatePipelineListByPage by selectedAppId (above)
//            this.updatePipelineListByPage(true);
          }
        }
      },

      initDataStatus() {
        this.appList = [];
        this.selectedAppId= null;
        this.pipelineList = [];
        this.selectedStatus = "";
        this.keyFilter= "";
      },

      //获取pipeline
      async requestPipelineList() {
        this.pipelineList = [];
        this.selectedStatus = "";
        this.keyFilter = "";
        let selectedApp = this.appList.find(it => {
          return it["appId"] === this.selectedAppId;
        });
        if (!selectedApp) {
          return;
        }
        let payload = {
          groupTag: this.$storeHelper.groupInfo.tag,
          serviceName: selectedApp.serviceName,
        };
        try {
          const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_list, {
            payload
          });
          if (resContent) {
            this.pipelineList = resContent.map(it => {
              it["createTime"] = this.$utils.formatDate(Date.parse(it["createTime"]), "yyyy-MM-dd hh:mm:ss");
              var statusInfo = this.STATUS_LIST.find(obj => {
                return it["lastRunStatus"] === obj["status"];
              });
              if (statusInfo) {
                it["lastRunStatusName"] = statusInfo["statusName"];
              } else {
                it["lastRunStatusName"] = '---';
              }
              return it;
            });
          }
          this.totalSize = this.pipelineList.length;
        } catch(err) {
          console.log(err);
          this.pipelineList = [];
          this.totalSize = this.pipelineList.length;
        }
        this.currentPage = 1;
      },

      async updatePipelineListByPage(refresh, search) {
        if (refresh) {
          await this.requestPipelineList();
        }
        if(search) {
          this.currentPage = 1;
        }
        this.pageSize = this.$storeHelper.screen["ratioHeight"] > 500 ? 15 : 12;
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;
        this.searchPipeline();
        this.totalSize = this.filterPipelineList.length;
        this.pipelineListByPage = this.filterPipelineList.slice(start, end);
//        console.log(this.pipelineListByPage);
      },

      searchPipeline() {
        if (this.selectedStatus === "" && this.keyFilter === "") {
          this.filterPipelineList = this.pipelineList;
        } else if (this.selectedStatus !== "" && this.keyFilter === "") {
          this.filterPipelineList = this.pipelineList.filter(it => {
            return it["lastRunStatus"] === this.selectedStatus;
          });
        } else if (this.selectedStatus === "" && this.keyFilter !== "") {
          let filterReg = new RegExp(this.keyFilter);
          this.filterPipelineList = this.pipelineList.filter(it => {
            return filterReg.exec(it["pipelineName"]);
          });
        } else {
          this.filterPipelineList = this.pipelineList.filter(it => {
            let filterReg = new RegExp(this.keyFilter);
            return it["lastRunStatus"] === this.selectedStatus && filterReg.exec(it["pipelineName"]);
          });
        }
      },

      handleClick(evt, action) {
        switch (action) {
          case 'search':
            this.updatePipelineListByPage(true,false);
            break;
          case 'add':
            const appAll = this.$storeHelper.appInfoListOfGroup['appList'].map(it => it['appId']);
            const appHasPipeLine = this.pipelineList.filter(it => it['appId']).map(it => it['appId']);
            const appCanAddPipeLine = appAll.filter(it => !(appHasPipeLine.indexOf(it) > -1));
            if (appCanAddPipeLine.length === 0) {
              this.$message.warning('当前团队所有应用已创建pipeline');
              return;
            }
            this.$storeHelper.dataTransfer = {
              from: this.$net.page["profile/pipeline/list"],
              data: {
                appIdList: appCanAddPipeLine,
              }
            };
            this.$router.push(this.$net.page['profile/pipeline/add']);
            break;
        }
      },

      handleTRClick(evt, action, index, row) {
        switch (action) {
          case 'got-to-page-pipeline-records':
            let app = this.appList.find(it => {
              return it["appName"] === row.appName;
            });
            this.$storeHelper.dataTransfer = {
              from: this.$net.page["profile/pipeline/list"],
              data: {
                // appId: row["appId"],
                appId: 1934,
              }
            };
            this.$router.push(this.$net.page['profile/pipeline/records']);
            break;
          case 'go-to-page-pipeline-update':
            this.$router.push(this.$net.page['profile/pipeline/modify']);
            break;
        }
      },

      handlePaginationPageChange(page){
        this.currentPage = page;
        this.updatePipelineListByPage(false,false);
      }
    }
  }
</script>