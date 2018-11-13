<template>
  <div id="manage-analyze-app_count">
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
        <label style="float: left; width: 80px; line-height: 24px;">截止日期：</label>
        <el-date-picker style="display: inline-block; width: 180px;"
                v-model="payload.dateRange"
                type="date"
                :picker-options="pickerOptions"
                placeholder="选择日期">
        </el-date-picker>
      </div>
      <!--<div class="item" @click="handleClick('search')">-->
        <!--<i :class="['el-icon-refresh']" style="color: #207245"></i>-->
      <!--</div>-->
      <!--<div class="item export-excel" @click="handleClick('download-analyze')">-->
        <!--<el-tooltip effect="dark" content="导出表格" placement="bottom">-->
          <!--<svg :class="['paas-icon-svg', 'paas-icon-excel']" aria-hidden="true">-->
            <!--<use :xlink:href="'#paas-icon-excel'"></use>-->
          <!--</svg>-->
        <!--</el-tooltip>-->
      <!--</div>-->
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
        <el-table-column prop="appCount" label="应用数" sortable></el-table-column>
        <el-table-column prop="instanceCount" label="创建实例数" sortable></el-table-column>
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
              :data="appCountDetailListByPage"
              style="width: 100%"
              stripe
              :defaultSort="appCountDetail.tableSort"
              @sort-change="onSortChangeInTable2"
      >
        <el-table-column prop="appName" label="应用名称" headerAlign="center" align="center"></el-table-column>
        <el-table-column prop="instanceCount" label="创建实例数" sortable headerAlign="center" align="center"></el-table-column>
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
  #manage-analyze-app_count {
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
        .el-input__icon {
          line-height: 24px;
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
  #manage-analyze-app_count {
    @keyframes rotating {
      0% {
        transform: rotateZ(0deg);
      }
      100% {
        transform: rotateZ(360deg);
      }
    }

    height: 100%;
    background-color: white;
    /*max-width: 1200px;*/
    .header {
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
        &.export-excel {
          margin-left: 8px;
        }
        .el-icon-refresh {
          cursor: pointer;
          &.loading {
            pointer-events: none;
            animation: rotating 1s linear;
          }
        }
        .paas-icon-excel {
          cursor: pointer;
          width: 20px;
          height: 20px;
          margin-top: 3px;
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

  export default {
    mixins: [commonUtils],
    created() {
    },
    mounted() {
      this.setDateRange();
      this.refreshIcon = this.$el.querySelector('.header .item > .el-icon-refresh');
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
//        this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 8;
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
          lobId: null,
          scrumId: null,
          groupId: '',
          dateRange: '',
        },
        scrumList:[],
        appCountList: [],
        appCountDetailList: [],
        appCountDetailListSorted: {
          asc: [],
          desc: []
        },
        tableSort: {
          prop: 'appCount',
          order: 'descending',
        },

        action: {
          name: null,
          row: null
        },

        totalSize: 0,
        pageSize: 14,
        currentPage: 1,

        appCountDetail: {
          tableSort: {
            prop: 'instanceCount',
            order: 'descending',
          },
          totalSize: 0,
          pageSize: 10,
          currentPage: 1,
        },

        pickerOptions: {
          disabledDate(time) {
            const getDate = function(dt) {
              return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
            };
            return getDate(time) >= getDate(new Date());
          },
//          shortcuts: [{
//            text: '今天',
//            onClick(picker) {
//              picker.$emit('pick', new Date());
//            }
//          }, {
//            text: '昨天',
//            onClick(picker) {
//              const date = new Date();
//              date.setTime(date.getTime() - 3600 * 1000 * 24);
//              picker.$emit('pick', date);
//            }
//          }, {
//            text: '一周前',
//            onClick(picker) {
//              const date = new Date();
//              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
//              picker.$emit('pick', date);
//            }
//          }]
        },
      }
    },
    computed: {
//      ...mapState(['lobList', 'groupList'])
      lobList() {
        if (Array.isArray(this.$storeHelper.lobList) && this.$storeHelper.lobList.length > 0) {
          let lobList = [{id: '', lobName: '全部'}].concat(this.$storeHelper.lobList);
          this.payload.lobId = lobList[0].id;
          return lobList;
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
//      'payload.profileId': 'requestDetailList',
//      'payload.lobId': 'requestDetailList',
//      'payload.scrumId': 'requestDetailList',
//      'payload.dateRange': 'requestDetailList',
      'tableSort': 'requestDetailList',
      'appCountDetail.tableSort': 'getAppCountDetailListByPage',
      '$storeHelper.screen.size': 'onScreenSizeChange',
      'payload.lobId':function(){
        if(this.payload.lobId == ''){
          this.scrumList = this.getScrumList();
          if(Array.isArray(this.scrumList) && this.scrumList.length > 0) {
            this.payload.scrumId = this.scrumList[0]["id"];
          }else{
            this.payload.scrumId = null;
          }
        }else{
          let query = {
            lobId:this.payload.lobId,
          };
          this.$net.requestPaasServer(this.$net.URL_LIST.get_scrum_list_by_lob,{query}).then(result => {
            if(Array.isArray(result['scrumList']) && result['scrumList'].length > 0) {
              this.scrumList = [{id: '', scrumName: "全部"}].concat(result['scrumList']);
              this.payload.scrumId = this.scrumList[0]["id"];
            }else{
              this.scrumList = [];
              this.payload.scrumId = null;
            }
          })
        }
      }
    },

    methods: {
      onScreenSizeChange(size) {
//        console.log(this.$storeHelper.screen);
        if (!size) {
          return;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
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
      // 获取详情列表
      requestDetailList(cb) {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const payload = {
          start, length,
          endTime: this.$utils.formatDate(this.payload.dateRange, 'yyyyMMdd')
        };
        if ('' !== this.payload.profileId) {
          payload.spaceId = this.payload.profileId
        }
        if ('' !== this.payload.lobId) {
          payload.lobId = this.payload.lobId
        }
        if ('' !== this.payload.scrumId) {
          payload.scrumId = this.payload.scrumId
        }
        if (this.tableSort.prop && this.tableSort.order) {
//          console.log(this.tableSort);
          const order = this.tableSort.order == 'ascending' ? 'asc' : 'desc';
          switch (this.tableSort.prop) {
            case 'appCount':
              payload['appOrder'] = order;
              break;
            case 'instanceCount':
              payload['instanceOrder'] = order;
              break;
          }
        }

        this.$net.requestPaasServer(this.$net.URL_LIST.analyze_app_count, {
          payload
        }).then(resContent => {
          this.totalSize = resContent['totalNum'];
          this.appCountList = resContent['appList'].map(it => {
            if (!it.lobName) {
              it.lobName = '无';
            }
            if (!it.scrumName) {
              it.scrumName = '无';
            }
            return it;
          });
        }).catch(err => {
        }).finally(() => {
          if (cb && cb instanceof Function) {
            cb();
          }
        });
      },

      handleClick(action) {
        switch (action) {
          case 'search':
//            this.refreshIcon.classList.add('loading');
//            () => {
//              setTimeout(() => {
//                this.refreshIcon.classList.remove('loading');
//              }, 1000);
//            }
            this.requestDetailList();
            break;
          case 'download-analyze':
            const payload = {
              endTime: this.$utils.formatDate(this.payload.dateRange, 'yyyyMMdd')
            };
            if ('' !== this.payload.profileId) {
              payload.spaceId = this.payload.profileId
            }
            if ('' !== this.payload.lobId) {
              payload.lobId = this.payload.lobId
            }
            if ('' !== this.payload.scrumId) {
              payload.scrumId = this.payload.scrumId
            }

            this.$net.addToRequestingRrlList(this.$net.URL_LIST.download_app_count_detail.path);
            this.$net.getResponse(this.$net.URL_LIST.download_app_count_detail, {
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
              a.download = `应用数统计-${payload.endTime}.xls`;
              a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
            }).catch(err => {
              this.$net.showError(err);
            }).finally(() => {
              this.$net.removeFromRequestingRrlList(this.$net.URL_LIST.download_app_count_detail.path);
            });
            break;
        }
      },

      handleTrButton(action, index, row) {
        this.action.row = row;
        switch (action) {
          case 'app-count-detail':
            this.addToWaitingResponseQueue(action);
            this.$net.requestPaasServer(this.$net.URL_LIST.analyze_app_count_detail, {
              payload: {
                endTime: this.$utils.formatDate(this.payload.dateRange, 'yyyyMMdd'),
                spaceId: row.spaceId,
                lobId: row.lobId,
                scrumId: row.scrumId
              }
            }).then(resContent => {
              this.appCountDetailList = resContent['detailList'];
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
      },
      getScrumList() {
        if (Array.isArray(this.$storeHelper.scrumList) && this.$storeHelper.scrumList.length > 0) {
          return [{id: '', scrumName: '全部'}].concat(this.$storeHelper.scrumList);
        } else {
          return [];
        }
      },
    }
  }
</script>