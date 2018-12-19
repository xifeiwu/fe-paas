<template>
  <div id="pipeline-main">
    <el-row class="header" type="flex" justify="left" align="middle">
        <el-col :span="5">
          <label style="float: left; width: 66px; line-height: 26px">应用名称:</label>
          <el-select filterable placeholder="请选择" style="display: block; margin-left: 66px" v-model="selectedAppId">
            <el-option v-for="(item,index) in appList" :key="item.appId" :label="item.appName" :value="item.appId">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="6" style="margin-left: 10px;">
          <label style="float: left; width: 125px; line-height: 26px;">最近一次执行状态:</label>
          <el-select placeholder="请选择" style="display: block; margin-left: 125px;" v-model="selectedStatus">
            <el-option v-for="(item,index) in statusList" :key="item.index" :label="item.statusName" :value="item.status"></el-option>
          </el-select>
        </el-col>
        <el-col :span="5" style="margin-left: 20px;">
          <el-input size="mini" placeholder="搜索pipeline" suffix-icon="el-icon-search" id="search" v-model="keyFilter"></el-input>
        </el-col>
        <el-col :span="4" :offset="4">
          <el-button size="mini-extral" type="primary" style="margin-right: 5px" @click="handleClick($event, 'refresh')">
            <i class="el-icon el-icon-refresh" style="margin-right: 3px;"></i>刷新
          </el-button>
          <el-button size="mini-extral" type="primary">创建pipeline</el-button>
        </el-col>
    </el-row>
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
                width="180"
                headerAlign="left"
                align="left">
        </el-table-column>
        <el-table-column
                prop="appName"
                label="应用名称"
                width="180"
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
                width="150"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
                prop="createTime"
                label="创建时间"
                width="180"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
                prop="description"
                label="描述"
                width="200"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                headerAlign="center"
                align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              :clase="['flex', 'primary']"
              >
              <span>配置</span>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
              type="text"
              :clase="['flex', 'primary']"
              @click="handleRowButtonClick($event, 'go-to-record', scope.$index, scope.row)">
              <span>执行记录</span>
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
      .el-select .el-input__inner {
        height: 26px;
      }
      #search {
        height: 26px;
      }
    }
  }
</style>
<style lang="scss" scoped>
  #pipeline-main {
    background-color: white;
    height:100%;
    max-width: 1500px;
    .el-row.header {
      padding: 3px 5px;
      font-size: 14px;
      min-height: 28px;
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
        this.updatePipelineListByPage(true,false);
      },
      'selectedStatus': function () {
        this.updatePipelineListByPage(false,true);
      },
      'keyFilter': function () {
        this.updatePipelineListByPage(false,true);
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
            this.appList = [{appId:'',appName:"全部",serviceName:''}].concat(this.appList);
            this.selectedAppId = this.appList[0]["appId"];
            this.updatePipelineListByPage(true);
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
        let payload = {
          groupTag: this.$storeHelper.groupInfo.tag,
          serviceName: selectedApp.serviceName,
        };
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.get_list,{payload});
        if(resContent) {
          this.pipelineList = resContent.map(it => {
            it["createTime"] = this.$utils.formatDate(Date.parse(it["createTime"]),"yyyy-MM-dd hh:mm:ss");
            return it;
          });
        }
        this.totalSize = this.pipelineList.length;
        this.currentPage = 1;
      },

      async updatePipelineListByPage(refresh,search) {
        if (refresh || !this.pipelineList) {
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
          case 'refresh':
            this.updatePipelineListByPage(true,false);
            break;
        }
      },

      handleRowButtonClick(evt, action, index, row) {
        switch (action) {
          case 'go-to-record':
            let app = this.appList.find(it => {
              return it["appName"] === row.appName;
            });
            this.$storeHelper.dataTransfer = {
              from: this.$net.page["profile/pipeline/pipeline-list"],
              data: {
                appId: app["appId"],
              }
            };
            this.$router.push(this.$net.page['profile/pipeline/pipeline-list/record']);
        }
      },

      handlePaginationPageChange(page){
        this.currentPage = page;
        this.updatePipelineListByPage(false,false);
      }
    }
  }
</script>