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
                   filterable v-model="payload.lobId" placeholder="请选择">
          <el-option v-for="(item, index) in lobList" :key="item.id" :label="item.lobName" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="item">
        <label style="float: left; width: 52px; line-height: 24px">scrum:</label>
        <el-select style="display:block; width: 160px; margin-left: 52px;"
                   filterable v-model="payload.scrumId" placeholder="请选择">
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
        <label style="float: left; width: 80px; line-height: 24px;">起止日期：</label>
        <!--<el-date-picker style="display: inline-block; width: 180px;"-->
                        <!--v-model="payload.dateRange"-->
                        <!--type="date"-->
                        <!--:picker-options="datePickerOptions"-->
                        <!--placeholder="选择日期">-->
        <!--</el-date-picker>-->
        <el-date-picker style="display: inline-block; width: 240px;"
                        class="custom"
                        v-model="payload.dateRange"
                        type="daterange"
                        size="mini"
                        align="right"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        :picker-options="datePickerOptions">
        </el-date-picker>
      </div>
      <div class="item">
        <el-button size="mini-extral" @click="handleClick('search')">搜索</el-button>
      </div>
      <div class="item">
        <el-button size="mini-extral" round @click="handleClick('download-analyze')">
          <i class="el-icon-download"></i><span>导出表格</span>
        </el-button>
      </div>
    </div>
    <div class="detail-list">
      <el-table
              :data="appCountList"
              style="width: 100%"
              stripe
              :height="heightOfTable"
              :defaultSort="tableSort"
              @sort-change="onSortChangeInTable1"
      >
        <el-table-column prop="spaceName" label="运行环境"></el-table-column>
        <el-table-column prop="lobName" label="LOB"></el-table-column>
        <el-table-column prop="scrumName" label="Scrum"></el-table-column>
        <el-table-column prop="deployCount" label="部署次数" sortable></el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="160"
        >
          <template slot-scope="scope">
            <el-button
                    :loading="statusOfWaitingResponse('app-count-detail') && action.row == scope.row"
                    type="text"
                    @click="handleTrButton('app-count-detail', scope.$index, scope.row)">
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
    <el-dialog title="应用数详情" :visible="action.name == 'app-count-detail'"
               :close-on-click-modal="false"
               class="app-count-detail size-800"
               @close="handleCloseDialog('app-count-detail')"
               v-if="action.name && action.row"
    >
      <el-table
              :data="appCountDetailListByPage"
              style="width: 100%"
              stripe
              :defaultSort="appCountDetail.tableSort"
              @sort-change="onSortChangeInTable2"
      >
        <el-table-column prop="appName" label="应用名称" headerAlign="center" align="center"></el-table-column>
        <el-table-column prop="lobName" label="LOB" headerAlign="center" align="center">
          <template slot-scope="scope">
            {{action.row.lobName}}
          </template>
        </el-table-column>
        <el-table-column prop="scrumName" label="Scrum" headerAlign="center" align="center">
          <template slot-scope="scope">
            {{action.row.scrumName}}
          </template>
        </el-table-column>
        <el-table-column prop="deployCount" label="部署次数"sortable headerAlign="center" align="center"></el-table-column>
      </el-table>
      <div class="pagination-container" v-if="appCountDetail.totalSize > appCountDetail.pageSize">
        <div class="pagination">
          <el-pagination
                  :current-page="appCountDetail.currentPage"
                  size="large"
                  layout="prev, pager, next"
                  :page-size = "appCountDetail.pageSize"
                  :total="appCountDetail.totalSize"
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
      &.app-count-detail {
        .el-dialog__body {
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
    max-width: 1200px;
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
    }
  }
</style>

<script>
  import {mapState} from "vuex";
  import commonUtils from 'assets/components/mixins/common-utils';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';

  export default {
    mixins: [commonUtils],
    created() {
    },
    mounted() {
      const headerNode = this.$el.querySelector(':scope > .header');
      this.resizeListener = () => {
        let headerHeight = headerNode.offsetHeight;
        this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
      };
      addResizeListener(this.$el, this.resizeListener);
      this.setDateRange();
    },
    beforeDestroy() {
      if (this.showAppList) {
        removeResizeListener(this.$el, this.resizeListener);
      }
    },
    data() {
      return {
        resizeListener: () => {},
        heightOfTable: '',

        payload: {
          profileId: '',
          lobId: '',
          scrumId: '',
          groupId: '',
          dateRange: '',
        },
        appCountList: [],
        appCountDetailList: [],
        appCountDetailListSorted: {
          asc: [],
          desc: []
        },
        tableSort: {
          prop: 'deployCount',
          order: 'descending',
        },

        action: {
          name: null,
          row: null
        },

        totalSize: 0,
        pageSize: 16,
        currentPage: 1,

        appCountDetail: {
          tableSort: {
            prop: 'deployCount',
            order: 'descending',
          },
          totalSize: 0,
          pageSize: 10,
          currentPage: 1,
        },
        datePickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now() - 3600 * 1000 * 24;
          },
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近两个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 60);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
      }
    },
    computed: {
//      ...mapState(['lobList', 'groupList'])
      lobList() {
        if (this.$storeHelper.lobList) {
          return [{id: '', lobName: '全部'}].concat(this.$storeHelper.lobList);
        } else {
          return [];
        }
      },
      scrumList() {
        if (this.$storeHelper.scrumList) {
          return [{id: '', scrumName: '全部'}].concat(this.$storeHelper.scrumList);
        } else {
          return [];
        }
      },
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
      }
    },
    watch: {
      'payload.profileId': 'requestDetailList',
      'payload.lobId': 'requestDetailList',
      'payload.scrumId': 'requestDetailList',
      'payload.dateRange': 'requestDetailList',
      'tableSort': 'requestDetailList',
      'appCountDetail.tableSort': 'getAppCountDetailListByPage',
    },

    methods: {
      handleCloseDialog(action) {
        this.action.name = null;
        this.hideWaitingResponse(action);
      },
      setDateRange() {
        const end = new Date() - 1000 * 3600 * 24;
        const start = new Date();
        start.setTime(start.getTime() - 1000 * 3600 * 24 * 5);
        this.payload.dateRange = [start, end];
      },

      // 获取详情列表
      requestDetailList() {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        if (!this.payload.dateRange) {
          this.$message.error('请设置起止日期');
          return;
        }
        const payload = {
          start, length,
          startTime: this.$utils.formatDate(this.payload.dateRange[0], 'yyyyMMdd'),
          endTime: this.$utils.formatDate(this.payload.dateRange[1], 'yyyyMMdd')
        };
        if ('' !== this.payload.profileId) {
          payload.profileId = this.payload.profileId
        }
        if ('' !== this.payload.lobId) {
          payload.lobId = this.payload.lobId
        }
        if ('' !== this.payload.scrumId) {
          payload.scrumId = this.payload.scrumId
        }
        if (this.tableSort.prop && this.tableSort.order) {
          const order = this.tableSort.order == 'ascending' ? 'asc' : 'desc';
          payload['deployOrder'] = order;
        }

        this.$net.requestPaasServer(this.$net.URL_LIST.analyze_app_deploy_count_list, {
          payload
        }).then(resContent => {
          this.totalSize = resContent['totalNum'];
          this.appCountList = resContent['totalList'].map(it => {
            if (!it.lobName) {
              it.lobName = '无';
            }
            if (!it.scrumName) {
              it.scrumName = '无';
            }
            return it;
          });
        }).catch(err => {
        });
      },

      handleClick(action) {
        switch (action) {
          case 'search':
            this.requestDetailList();
            break;
          case 'download-analyze':
            const payload = {
              startTime: this.$utils.formatDate(this.payload.dateRange[0], 'yyyyMMdd'),
              endTime: this.$utils.formatDate(this.payload.dateRange[1], 'yyyyMMdd')
            };
            if ('' !== this.payload.profileId) {
              payload.profileId = this.payload.profileId
            }
            if ('' !== this.payload.lobId) {
              payload.lobId = this.payload.lobId
            }
            if ('' !== this.payload.scrumId) {
              payload.scrumId = this.payload.scrumId
            }

            this.$net.addToRequestingRrlList(this.$net.URL_LIST.download_app_deploy_count.path);
            this.$net.getResponse(this.$net.URL_LIST.download_app_deploy_count, {}, {
              responseType: 'blob'
            }).then(res => {
//            this.$ajax({
//              method: this.$net.URL_LIST.download_app_deploy_count.method,
//              url: this.$net.URL_LIST.download_app_deploy_count.path,
//              data: payload,
//              responseType: 'blob',
//            }).then(res => {
              const a = document.createElement('a');
              const blob = new Blob([res.data]);
              a.href = window.URL.createObjectURL(blob);
              a.download = `应用部署次数统计-${payload.startTime}-${payload.endTime}.xls`;
              a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
            }).catch(err => {
              this.$net.showError(err);
            }).finally(() => {
              this.$net.removeFromRequestingRrlList(this.$net.URL_LIST.download_app_deploy_count.path);
            });
            break;
        }
      },

      handleTrButton(action, index, row) {
        this.action.row = row;
        switch (action) {
          case 'app-count-detail':
            this.addToWaitingResponseQueue(action);
            this.$net.requestPaasServer(this.$net.URL_LIST.analyze_app_deploy_count_detail, {
              payload: {
                endTime: this.$utils.formatDate(this.payload.dateRange[1], 'yyyyMMdd'),
                startTime: this.$utils.formatDate(this.payload.dateRange[0], 'yyyyMMdd'),
                spaceId: row.spaceId,
                lobId: row.lobId,
                scrumId: row.scrumId
              }
            }).then(resContent => {
              this.appCountDetailList = resContent['totalList'];
              this.appCountDetailListSorted.asc = [];
              this.appCountDetailListSorted.desc = [];
              this.appCountDetailList.forEach(it => {
                this.appCountDetailListSorted.asc.push(it);
                this.appCountDetailListSorted.desc.push(it);
              });
              this.appCountDetailListSorted.asc.sort((it1, it2) => {
                return it1['instanceCount'] - it2['instanceCount'];
              });
              this.appCountDetailListSorted.desc.sort((it1, it2) => {
                return it2['instanceCount'] - it1['instanceCount'];
              });

              this.appCountDetail.totalSize = resContent['totalNum'];
              this.appCountDetail.currentPage = 1;
              this.getAppCountDetailListByPage();
              // open after success request
              this.action.name = action;
            }).catch(() => {
              this.hideWaitingResponse(action);
            });
            break;
        }
      },

      /**
       * 获取应用数详情
       * 应用数详情与应用数列表的逻辑的不同：应用数列表是分页请求；应用数详情是完整请求
       */
      getAppCountDetailListByPage() {
        let page = this.appCountDetail.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.appCountDetail.pageSize;
        const length = this.appCountDetail.pageSize;
        const end = start + length;
        if (this.appCountDetail.tableSort.order == 'ascending') {
          this.appCountDetailListByPage = this.appCountDetailListSorted['asc'].slice(start, end);
        } else {
          this.appCountDetailListByPage = this.appCountDetailListSorted['desc'].slice(start, end);
        }
      },
      // the first page of pagination is 1
      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestDetailList();
      },

      handlePaginationPageChangeInDialog(page) {
        this.appCountDetail.currentPage = page;
        this.getAppCountDetailListByPage();
      },

      onSortChangeInTable1(tableSort) {
        this.tableSort = tableSort;
      },
      onSortChangeInTable2(tableSort) {
        this.appCountDetail.tableSort = tableSort;
      }
    }
  }
</script>