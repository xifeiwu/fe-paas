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
        <!--<el-date-picker style="display: inline-block; width: 240px;"-->
                        <!--class="custom"-->
                        <!--v-model="dateRange"-->
                        <!--type="daterange"-->
                        <!--size="mini"-->
                        <!--align="right"-->
                        <!--unlink-panels-->
                        <!--range-separator="至"-->
                        <!--start-placeholder="开始日期"-->
                        <!--end-placeholder="结束日期"-->
                        <!--:picker-options="datePickerOptions">-->
        <!--</el-date-picker>-->
      </div>
      <div class="item">
        <el-button size="mini-extral" @click="handleClick('search')">搜索</el-button>
      </div>
    </div>
    <div class="detail-list">
      <el-table
              :data="appCountList"
              style="width: 100%"
              stripe
              :height="heightOfTable"
      >
        <el-table-column prop="spaceName" label="运行环境"></el-table-column>
        <el-table-column prop="lobName" label="LOB"></el-table-column>
        <el-table-column prop="scrumName" label="Scrum"></el-table-column>
        <el-table-column prop="appCount" label="应用数"></el-table-column>
        <el-table-column prop="instanceCount" label="实例数"></el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="160"
        >
          <template slot-scope="scope">
            <el-button
                    type="text"
                    @click="handleRowButtonClick('transfer', scope.$index, scope.row)">
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
  }
</style>
<style lang="scss" scoped>
  #manage-analyze-app_count {
    height: 100%;
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
      max-width: 1000px;
    }
  }
</style>

<script>
  import {mapState} from "vuex";
  import commonUtils from '$components/mixins/common-utils';
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

        totalSize: 0,
        pageSize: 16,
        currentPage: 1,

        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: '昨天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }, {
            text: '一周前',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          }]
        },
//        datePickerOptions: {
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
//        },
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
        if (this.$storeHelper.groupList) {
          return [{id: '', name: '全部'}].concat(this.$storeHelper.groupList);
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

    methods: {
      setDateRange() {
        this.payload.dateRange = new Date(Date.now() - 3600 * 1000 * 24);
      },
      // 获取详情列表
      requestDetailList() {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const payload = {
          start, length,
          endTime: this.$utils.formatDate(this.payload.dateRange, 'yyyyMMdd')
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
        });
      },

      handleClick(action) {
        switch (action) {
          case 'search':
            this.requestDetailList();
            break;
        }
      },

      handleRowButtonClick(action, index, row) {
      },

      // the first page of pagination is 1
      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestDetailList();
      },
    }
  }
</script>