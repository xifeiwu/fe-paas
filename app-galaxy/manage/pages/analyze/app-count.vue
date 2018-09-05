<template>
  <div id="manage-app">
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
              :data="appStatusList"
              style="width: 100%"
              stripe
              :height="heightOfTable"
      >
        <el-table-column prop="appName" label="应用名称" width="100"></el-table-column>
        <el-table-column prop="tag" label="项目名称" width="100"></el-table-column>
        <el-table-column label="语言版本" width="100">
          <template slot-scope="scope">
            <span>{{scope.row.language}}</span><span v-if="scope.row.languageVersion">{{scope.row.languageVersion}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lobName" label="LOB" width="100"></el-table-column>
        <el-table-column prop="groupName" label="团队名称" width="100"></el-table-column>
        <el-table-column prop="creator" label="创建人" width="100"></el-table-column>
        <el-table-column prop="profileDesc" label="运行环境（实例数）">
          <template slot-scope="scope">
            <span v-for="(item, index) in scope.row.spaceAndInstanceNum" :key="index">{{item.spaceName}}（{{item.instanceNum}}）</span>
          </template>
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="160"
        >
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="text"
                    @click="handleRowButtonClick('transfer', scope.$index, scope.row)">
              应用转让
            </el-button>
            <el-button
                    size="mini-extral"
                    type="text"
                    :loading="statusOfWaitingResponse('remove') && selected.row.id === scope.row.id"
                    @click="handleRowButtonClick('remove', scope.$index, scope.row)">销毁应用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss">
  #manage-app {
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
  #manage-app {
    height: 100%;
    .header {
      display: flex;
      padding: 3px 5px;
      background-color: white;
      .item {
        display: inline-block;
        margin-right: 5px;
        &.key-word {
          display: flex;
          width: 300px;
        }
        .el-select {
          max-width: 190px;
          &.key-word-type {
            max-width: 100px;
          }
        }
      }
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
          groupId: '',
          dateRange: '',
        },
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
        appStatusList: [],
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
      handleClick(action) {
        switch (action) {
          case 'search':
            console.log(this.payload);
            return;
            const payload = {
              pageNum: 1,
              pageSize: 10,
            };
            if ('' !== this.payload.lobId) {
              payload.lobId = this.payload.lobId
            }
            if ('' !== this.payload.groupId) {
              payload.groupId = this.payload.groupId;
            }
            this.keyword = this.keyword.trim();
            if (this.keyword.length > 0) {
              if (this.keyWordType === 1) {
                payload['appName'] = this.keyword;
              } else {
                payload['tag'] = this.keyword;
              }
            }
            this.$net.requestPaasServer(this.$net.URL_LIST.app_status_list, {
              payload
            }).then(resContent => {
              this.appStatusList = resContent['backStageList'];
            }).catch(err => {
            });
            break;
        }
      },
      handleRowButtonClick(action, index, row) {

      }
    }
  }
</script>