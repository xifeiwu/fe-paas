<template>
  <div id="manage-analyze-app_deploy">
    <div class="header">
      <div class="item">
        <label style="float: left; width: 70px; line-height: 24px">运行环境:</label>
        <el-select style="display:block; width: 160px; margin-left: 70px;"
                   filterable v-model="payload.profileId" placeholder="请选择">
          <el-option v-for="(item, index) in profileListAll" :key="item.id" :label="item.description" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="item">
        <label style="float: left; width: 30px; line-height: 24px">LOB:</label>
        <el-select style="display:block; width: 160px; margin-left: 40px;"
                   filterable v-model="$storeHelper.currentLobId" placeholder="请选择">
          <el-option v-for="(item, index) in lobList" :key="item.id" :label="item.lobName" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="item">
        <label style="float: left; width: 52px; line-height: 24px">scrum:</label>
        <el-select style="display:block; width: 160px; margin-left: 52px;"
                   filterable v-model="$storeHelper.currentScrumId" placeholder="请选择">
          <el-option v-for="(item, index) in scrumList" :key="item.id" :label="item.scrumName" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="item" style="display: none">
        <label style="float: left; width: 70px; line-height: 24px">团队名称:</label>
        <el-select style="display:block; width: 160px; margin-left: 70px;"
                   filterable v-model="payload.groupId" placeholder="请选择">
          <el-option v-for="(item, index) in groupList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="item key-word">
        <label style="float: left; width: 80px; line-height: 24px;">截止日期：</label>
        <el-date-picker style="display: inline-block; width: 180px;"
                        v-model="payload.dateRange"
                        type="date"
                        :picker-options="datePickerOptions"
                        placeholder="选择日期">
        </el-date-picker>
      </div>
      <div class="item">
        <el-button type="primary" size="mini-extral" @click="handleClick('search')">查询</el-button>
      </div>
      <div class="item">
        <el-button size="mini-extral" plain type="primary" @click="handleClick('download-analyze')">
          <i class="el-icon-download"></i><span>导出表格</span>
        </el-button>
      </div>
    </div>
    <div class="detail-list">
      <el-table
              :data="statisticListByPage"
              style="width: 100%"
              stripe
              :height="heightOfTable"
              :defaultSort="tableSort"
              @sort-change="onListSortChangeInTable"
      >
        <el-table-column prop="spaceName" label="运行环境"></el-table-column>
        <el-table-column prop="lobName" label="LOB"></el-table-column>
        <el-table-column prop="scrumName" label="Scrum"></el-table-column>
        <el-table-column prop="cpuUsage" label="CPU总量"  headerAlign="center" align="center" minWidth="140"
                         sortable="custom"></el-table-column>
        <el-table-column prop="memoryUsage" label="内存总量"  headerAlign="center" align="center" minWidth="140"
                         sortable="custom"></el-table-column>
        <el-table-column
                prop="operation"
                headerAlign="center" align="center"
                label="操作"
                width="160"
        >
          <template slot-scope="scope">
            <el-button
                    :loading="statusOfWaitingResponse('detail-show') && action.row == scope.row"
                    type="text"
                    @click="handleTrButton('detail-show', scope.$index, scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize">
        <div class="pagination">
          <el-pagination
                  :current-page="currentPage"
                  size="large"
                  layout="prev, pager, next"
                  :page-size = "pageSize"
                  :total="totalSize"
                  @current-change="handlePaginationPageChange"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <el-dialog title="资源使用量详情" :visible="action.name == 'detail-show'"
               :close-on-click-modal="false"
               class="detail-show size-800"
               @close="handleCloseDialog('detail-show')"
               v-if="action.name && action.row"
    >
      <el-row class="general">
        <el-col :span="8">
          <span class="key">运行环境：</span><span class="value"> {{action.row.spaceName}}</span>
        </el-col>
        <el-col :span="8">
          <span class="key">LOB：</span><span class="value"> {{action.row.lobName}}</span>
        </el-col>
        <el-col :span="8">
          <span class="key">Scrum：</span><span class="value"> {{action.row.scrumName}}</span>
        </el-col>
      </el-row>
      <el-table
              :data="detailInfo.listByPage"
              style="width: 100%"
              stripe
              :defaultSort="detailInfo.tableSort"
              @sort-change="onDetailSortChangeInTable"
      >
        <el-table-column prop="appName" label="应用名称" headerAlign="center" align="center" minWidth="200"></el-table-column>
        <el-table-column prop="cpuUsage" label="CPU数" headerAlign="center" align="center" sortable="custom" minWidth="100"></el-table-column>
        <el-table-column prop="memoryUsage" label="内存总量" headerAlign="center" align="center" sortable="custom" minWidth="100"></el-table-column>
      </el-table>
      <div class="pagination-container" v-if="detailInfo.totalSize > detailInfo.pageSize">
        <div class="pagination">
          <el-pagination
            :current-page="detailInfo.currentPage"
            size="large"
            layout="prev, pager, next"
            :page-size = "detailInfo.pageSize"
            :total="detailInfo.totalSize"
            @current-change="handlePaginationPageChangeInDialog"
          >
          </el-pagination>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  #manage-analyze-app_deploy {
    .header {
      label {
        font-size: 14px;
      }
      .el-input {
        .el-input__inner {
          height: 24px;
        }
      }
      .el-date-editor {
        width: 160px;
        height: 26px;
        .el-input__icon {
          line-height: 20px;
        }
      }
    }
    .el-dialog__wrapper {
      .el-dialog {
        margin-top: 45px !important;
        height: 600px;
      }
      &.detail-show {
        .el-dialog__body {
          .general {
            margin: 0px 3px;
            .el-col {
              text-align: left;
              .key {
                font-weight: bold;
              }
            }
          }
          padding: 0px;
          margin-bottom: 20px;
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #manage-analyze-app_deploy {
    height: 100%;
    background-color: white;
    /*max-width: 1200px;*/
    .header {
      /*display: flex;*/
      padding: 3px 5px;
      background-color: white;
      .item {
        display: inline-block;
        margin-right: 5px;
        .el-select {
          max-width: 190px;
          &.key-word-type {
            max-width: 100px;
          }
        }
      }
    }
    .detail-list {
      position: relative;
    }
  }
</style>

<script>
  import {mapState} from "vuex";
  import commonUtils from 'assets/components/mixins/common-utils';

  const PROPS_MAP = {
    'cpuUsage': 'cpuAmount',
    'memoryUsage': 'memoryAmount'
  };

  export default {
    mixins: [commonUtils],
    created() {
    },
    mounted() {
      this.setDateRange();
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
        this.requestStatisticList();
      });
    },
    beforeDestroy() {
    },
    data() {
      return {
        resizeListener: () => {},
        heightOfTable: '',

        payload: {
          profileId: '',
          scrumId: null,
          groupId: '',
          dateRange: '',
        },
//        lobList: [],
//        scrumList:[],
        
        statisticListByPage: [],
        tableSort: {
          prop: 'memoryUsage',
          order: 'descending',
        },

        action: {
          name: null,
          row: null
        },

        totalSize: 0,
        pageSize: 14,
        currentPage: 1,

        detailInfo: {
          list: [],
          listByPage: [],
          tableSort: {
            prop: 'memoryUsage',
            order: 'descending',
          },
          totalSize: 0,
          pageSize: 10,
          currentPage: 1,
        },
        datePickerOptions: {
          disabledDate(time) {
            const getDate = function(dt) {
              return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
            };
            return getDate(time) >= getDate(new Date());
          },
//          shortcuts: [{
//            text: '最近一周',
//            onClick(picker) {
//              const end = new Date();
//              const start = new Date();
//              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
//              picker.$emit('pick', [start, end]);
//            }
//          }, {
//            text: '最近一个月',
//            onClick(picker) {
//              const end = new Date();
//              const start = new Date();
//              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
//              picker.$emit('pick', [start, end]);
//            }
//          }, {
//            text: '最近两个月',
//            onClick(picker) {
//              const end = new Date();
//              const start = new Date();
//              start.setTime(start.getTime() - 3600 * 1000 * 24 * 60);
//              picker.$emit('pick', [start, end]);
//            }
//          }, {
//            text: '最近三个月',
//            onClick(picker) {
//              const end = new Date();
//              const start = new Date();
//              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
//              picker.$emit('pick', [start, end]);
//            }
//          }]
        },
      }
    },
    computed: {
      groupList() {
        if (this.$storeHelper.groupListAll) {
          return [{id: '', name: '全部'}].concat(this.$storeHelper.groupListAll);
        } else {
          return [];
        }
      },
      profileListAll () {
        if (this.$storeHelper.profileListAll) {
          return [{id: '', description: '全部'}].concat(this.$storeHelper.profileListAll);
        } else {
          return [];
        }
      },
      lobList() {
        return [{id: '', lobName: '全部'}].concat(this.$storeHelper.lobList);
      },
      scrumList() {
        return [{id: '', scrumName: "全部"}].concat(this.$storeHelper.currentScrumList);
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
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
          this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 14 : 12;
        } catch(err) {
        }
      },
      handleCloseDialog(action) {
        this.action.name = null;
        this.hideWaitingResponse(action);
      },
      setDateRange() {
        this.payload.dateRange = new Date(Date.now() - 3600 * 1000 * 24);
      },
      // return the same date
      getOneDayBefore(origin) {
        origin = new Date(origin);
        const result = new Date();
        //  - 1000 * 3600 * 24
        result.setTime(origin.getTime());
        return result;
      },

      // 获取详情列表
      async requestStatisticList() {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        if (!this.payload.dateRange) {
          this.$message.error('请设置截止日期');
          return;
        }
        const payload = {
          start, length,
          endTime: this.$utils.getDate(this.payload.dateRange)
        };
        if ('' !== this.payload.profileId) {
          payload.spaceId = this.payload.profileId
        }
        if ('' !== this.$storeHelper.currentLobId) {
          payload.lobId = this.$storeHelper.currentLobId;
        }
        if ('' !== this.$storeHelper.currentScrumId) {
          payload.scrumId = this.$storeHelper.currentScrumId;
        }
        // sort by request
        if (this.tableSort.prop && this.tableSort.order) {
          payload['order'] = this.tableSort.order == 'ascending' ? 'asc' : 'desc';
          payload['orderField'] = PROPS_MAP[this.tableSort.prop];
        }

        this.totalSize = 0;
        this.statisticListByPage = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.analyze_resources_list, {
          payload
        });
        this.totalSize = resContent['totalNum'];
        this.statisticListByPage = resContent['totalList'].map(it => {
          if (!it.spaceId) {
            it.spaceName = '---';
          }
          if (!it.lobName) {
            it.lobName = '---';
          }
          if (!it.scrumName) {
            it.scrumName = '---';
          }
          it.cpuUsage = null !== it['cpuAmount'] ? `${it['cpuAmount']}核` : '---';
          it.memoryUsage = null !== it['memoryAmount'] ? `${it['memoryAmount']}G` : '---';
          return it;
        });
      },

      // sort table for list
      onListSortChangeInTable(tableSort) {
        this.tableSort = tableSort;
        this.requestStatisticList();
      },
      // the first page of pagination is 1
      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestStatisticList();
      },

      handleClick(action) {
        switch (action) {
          case 'search':
            this.requestStatisticList();
            break;
          case 'download-analyze':
            const payload = {
              endTime: this.$utils.getDate(this.payload.dateRange)
            };
            if ('' !== this.payload.profileId) {
              payload.spaceId = this.payload.profileId
            }
            if ('' !== this.$storeHelper.currentLobId) {
              payload.lobId = this.$storeHelper.currentLobId;
            }
            if ('' !== this.$storeHelper.currentScrumId) {
              payload.scrumId = this.$storeHelper.currentScrumId;
            }

            const REQUEST_DESC_DOWNLOAD = this.$net.URL_LIST['analyze_resources_list_download'];

            this.$net.addToRequestingRrlList(REQUEST_DESC_DOWNLOAD.path);
            this.$net.getResponse(REQUEST_DESC_DOWNLOAD, {
              payload
            }, {
              headers: {
                token: this.$storeHelper.getUserInfo('token')
              },
              responseType: 'blob'
            }).then(res => {
              const a = document.createElement('a');
              const blob = new Blob([res.data]);
              a.href = window.URL.createObjectURL(blob);
              a.download = `资源使用量统计-${this.$utils.formatDate(this.getOneDayBefore(payload.endTime), 'yyyyMMdd')}.xls`;
              a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
            }).catch(err => {
              this.$net.showError(err);
            }).finally(() => {
              this.$net.removeFromRequestingRrlList(REQUEST_DESC_DOWNLOAD.path);
            });
            break;
        }
      },

      async handleTrButton(action, index, row) {
        this.action.row = row;
        switch (action) {
          case 'detail-show':
            this.addToWaitingResponseQueue(action);
            try {
              await this.requestDetailList();
              // sort by memory descending when dialog is open
              this.onDetailSortChangeInTable({
                prop: 'memoryUsage',
                order: 'descending',
              });
              this.detailInfo.currentPage = 1;
              this.getDetailListByPage();
              // open after success request
              this.action.name = action;
            } catch(err) {
              console.log(err);
              this.hideWaitingResponse(action);
            }
            break;
        }
      },

      // request detail list
      async requestDetailList() {
        const REQUEST_DESC_DETAIL = this.$net.URL_LIST['analyze_resource_list_item_detail'];
        const resContent = await this.$net.requestPaasServer(REQUEST_DESC_DETAIL, {
          payload: {
            endTime: this.$utils.getDate(this.payload.dateRange),
            spaceId: this.action.row.spaceId,
            lobId: this.action.row.lobId,
            scrumId: this.action.row.scrumId
          }
        });
        this.detailInfo.totalSize = resContent['totalNum'];
        this.detailInfo.list = resContent['detailList'].map(it => {
          it['cpuUsage'] = `${it['cpuAmount']}核`;
          it['memoryUsage'] = `${it['memoryAmount']}G`;
          if (!it.appName) {
            it.appName = '---';
          }
          return it;
        });
        console.log(resContent);
        return resContent;
      },
      // sort detail list
      onDetailSortChangeInTable(tableSort) {
        this.detailInfo.tableSort = tableSort;
        const key = PROPS_MAP[tableSort.prop];
        if (!key) {
          return 0;
        }
        this.detailInfo.list.sort((pre, next) => {
          var result = pre[key] - next[key];
          switch (tableSort['order']) {
            case 'ascending':
              break;
            case 'descending':
              result = -1 * result;
              break;
            default:
              result = 0;
              break;
          }
          return result;
        });
        this.getDetailListByPage();
      },
      /**
       * 获取详情
       * 详情信息与列表信息的逻辑的不同：应用数列表是分页请求；应用数详情是完整请求
       */
      getDetailListByPage() {
        let page = this.detailInfo.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.detailInfo.pageSize;
        const length = this.detailInfo.pageSize;
        const end = start + length;
        this.detailInfo.listByPage = this.detailInfo.list.slice(start, end);
      },

      handlePaginationPageChangeInDialog(page) {
        this.detailInfo.currentPage = page;
        this.getDetailListByPage();
      },
    }
  }
</script>