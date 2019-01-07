<template>
  <div id="pipeline-main">
    <div class="header">
      <div class="item">
        <label>
          <span style="line-height: 26px">应用名称:</span>
          <el-select filterable placeholder="请选择" size="mini-extral" v-model="selectedAppId">
            <el-option v-for="(item,index) in appListWithAll" :key="item.appId" :label="item.appName" :value="item.appId">
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
          <span>刷新</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
        </el-button>
        <el-button size="mini-extral" class="flex" type="primary" @click="handleClick($event, 'add')">
          <span>创建pipeline</span><i class="paas-icon-level-up" style="margin-left: 3px;"></i>
        </el-button>
      </div>
    </div>
    <div class="pipeline-list">
      <el-table
              :data="filteredPipelineListByPage"
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
                prop="formattedCreateTime"
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

    <el-dialog title="选择目标应用" :visible="action.name == 'dialog4SelectApp'"
               :close-on-click-modal="false"
               class="image size-700"
               @close="action.name = null"
               v-if="action.name"
    >
      <el-tag type="success" disable-transitions style="display: block; text-align: left" size="small">
        <i class="el-icon-warning"></i>
        <span>请选择将要创建pipeline的应用</span>
      </el-tag>
      <el-form size="mini" :model="dialog4SelectApp" :rules="rules"
               labelWidth="150px" style="margin: 10px 0px 30px 0px;" ref="formInDialog4SelectApp">
        <el-form-item label="目标应用：" prop="appId">
          <el-select v-model="dialog4SelectApp.appId" filterable placeholder="请选择" style="width: 400px;">
            <el-option v-for="(item, index) in dialog4SelectApp.appListFiltered"
                       :key="item.appId" :label="item.appName" :value="item.appId">
            </el-option>
          </el-select>
          <el-button type="primary" style="margin-left: 8px;" size="mini-extral"
                     @click="handleDialogButtonClick('dialog4SelectApp', 'yes')">确定&nbsp>></el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex" v-if="false">
        <div class="item">
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="action.name = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
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

  const STATUS_LIST = [{
    status: '',
    statusName: '全部',
  }, {
    status: 'SUCCESS',
    statusName: '成功',
  }, {
    status: 'FAILURE',
    statusName: '失败',
  }, {
    status: 'ABORTED',
    statusName: '中止'
  }, {
    status: 'CANCELLED',
    statusName: '已取消',
  }, {
    status: 'REBUILDING',
    statusName: '重建中',
  }, {
    status: 'UNSTABLE',
    statusName: '不稳定',
  }, {
    status: 'BUILDING',
    statusName: '构建中',
  }, {
    status: 'NOT_BUILT',
    statusName: '未构建',
  }, {
    status: 'UNKNOWN',
    statusName: '未知',
  }];
  const ID_FOR_ALL = '';
  
  export default {
    created() {
      this.STATUS_LIST = STATUS_LIST;
    },
    mounted() {
      this.onAppInfoListOfGroup(this.appInfoListOfGroup);
//      this.updatePipelineListByPage(true);
      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    data() {
      return {
        selectedAppId: '',
        selectedStatus: '',
        keyFilter: '',
        appListWithAll: [],

        // pipeline data related
        pipelineList: [],
        filteredPipelineList: [],
        filteredPipelineListByPage: [],

        totalSize: 0,
        pageSize: 12,
        currentPage: 1,
        heightOfTable: '',

        action: {
          name: null,
          row: null
        },
        dialog4SelectApp: {
          appId: '',
          appListFiltered: []
        },
        rules: {
          appId: {
            type: 'number',
            required: true,
            message: '请选择目标应用',
            trigger: ['blur', 'change']
          },
        }
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
        this.updatePipelineListByPage(false);
      },
      'selectedStatus': function () {
        this.updatePipelineListByPage(false);
      },
      'keyFilter': function () {
        this.updatePipelineListByPage(false);
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

      /**
       * 触发：初始页面；切换团队
       */
      onAppInfoListOfGroup(appInfoListOfGroup) {
        if (!appInfoListOfGroup) {
          return;
        }
        this.appListWithAll = [];
        if (appInfoListOfGroup.hasOwnProperty('appList')) {
          this.appListWithAll = [{appId:'', appName:'全部', serviceName:''}].concat(appInfoListOfGroup['appList']);
          this.selectedAppId = this.appListWithAll[0]['appId'];
          this.initSelectedStatus();
          this.updatePipelineListByPage(true);
        }
      },

      /**
       * init selected Status: start of Page; change of groupId(appInfoListOfGroup)
       */
      initSelectedStatus() {
        this.selectedAppId = ID_FOR_ALL;
        this.selectedStatus = ID_FOR_ALL;
        this.keyFilter = '';
      },

      //获取pipeline列表
      async requestPipelineList() {
        this.pipelineList = [];
        this.totalSize = this.pipelineList.length;
        const selectedApp = this.appListWithAll.find(it => {
          return it['appId'] === this.selectedAppId;
        });
        if (!selectedApp) {
          console.log('selectedApp is not found!');
//          console.log(this.appListWithAll);
//          console.log(this.selectedAppID);
          return;
        }
        const payload = {
          groupTag: this.$storeHelper.groupInfo.tag,
          serviceName: selectedApp.serviceName,
        };
        try {
          const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_list, {
            payload
          });
          if (Array.isArray(resContent)) {
            this.pipelineList = resContent.map(it => {
              it['formattedCreateTime'] = '---';
              it['lastRunStatusName'] = '---';
              if (it['createTime']) {
                it['formattedCreateTime'] = this.$utils.formatDate(it['createTime'], 'yyyy-MM-dd hh:mm:ss');
              }
              var statusInfo = STATUS_LIST.find(obj => {
                return it['lastRunStatus'] === obj['status'];
              });
              if (statusInfo) {
                it['lastRunStatusName'] = statusInfo['statusName'];
              }
              return it;
            });
            this.totalSize = this.pipelineList.length;
          }
        } catch(err) {
          console.log(err);
        }
      },

      /**
       * 获取pipeline
       * @param refresh
       * @param search
       * @returns {Promise.<void>}
       */
      async updatePipelineListByPage(refresh) {
        if (refresh) {
          await this.requestPipelineList();
        }
        try {
          this.currentPage = 1;
          this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 15 : 12;
          let page = this.currentPage - 1;
          page = page >= 0 ? page : 0;
          const start = page * this.pageSize;
          const length = this.pageSize;
          const end = start + length;

          this.filteredPipelineList = this.pipelineList.filter(it => {
            return true;
            if (this.selectedAppId === ID_FOR_ALL) {
              return true;
            } else {
              return this.selectedAppID == it['appId'];
            }
          }).filter(it => {
            return true;
            if (this.selectedStatus === ID_FOR_ALL) {
              return true;
            } else {
              return this.selectedStatus == it['lastRunStatus'];
            }
          }).filter(it => {
            return true;
            if (this.keyFilter.length === 0) {
              return true
            } else {
              const filterReg = new RegExp(this.keyFilter);
              return filterReg.exec(it['pipelineName']);
            }
          });
          this.totalSize = this.filteredPipelineList.length;
          this.filteredPipelineListByPage = this.filteredPipelineList.slice(start, end);
//          console.log(this.filteredPipelineListByPage);
        } catch(err) {
          console.log(err);
        }
      },

      handleClick(evt, action) {
        switch (action) {
          case 'search':
            this.updatePipelineListByPage(true);
            break;
          case 'add':
            const appHasPipeLine = this.pipelineList.filter(it => it['appId']).map(it => it['appId']);
            this.dialog4SelectApp.appListFiltered = this.$storeHelper.appInfoListOfGroup['appModelList'].filter(it => {
              return !(appHasPipeLine.indexOf(it.appId) > -1);
            });
            if (this.dialog4SelectApp.appListFiltered.length === 0) {
              this.$message.warning('当前团队所有应用已创建pipeline');
              return;
            }
            this.action.name = 'dialog4SelectApp';
            break;
        }
      },

      async handleDialogButtonClick(dialog, action) {
        switch (dialog) {
          case 'dialog4SelectApp':
            try {
              var [valid, errors] = await this.$refs['formInDialog4SelectApp'].validate();
              if (valid) {
//              var appModel = this.$storeHelper.appInfoListOfGroup['appModelList'].find(it => {
//                return it.appId == this.dialog4SelectApp.appId;
//              });
//              if (!appModel) {
//                console.log('appModel not found!');
//                return;
//              }
                this.$storeHelper.dataTransfer = {
                  from: this.$net.page['profile/pipeline/list'],
                  data: {
                    appId: this.dialog4SelectApp.appId
                  }
                };
                this.$router.push(this.$net.page['profile/pipeline/add']);
              }
            } catch(err) {
            }
            break;
        }
      },

      handleTRClick(evt, action, index, row) {
        switch (action) {
          case 'got-to-page-pipeline-records':
            if (!row.appId) {
              this.$message.error('未找到appId');
              return;
            }
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/pipeline/list'],
              data: {
                appId: row['appId'],
//                appId: 1934,
              }
            };
            this.$router.push(this.$net.page['profile/pipeline/records']);
            break;
          case 'go-to-page-pipeline-update':
            if (!row['appId']) {
              this.$message.error('未找到应用信息！');
              return;
            }
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/pipeline/list'],
              data: {
               appId: row['appId'],
//                appId: 1934,
              }
            };
            this.$router.push(this.$net.page['profile/pipeline/modify']);
            break;
        }
      },

      handlePaginationPageChange(page){
        this.currentPage = page;
        this.updatePipelineListByPage(false);
      }
    }
  }
</script>