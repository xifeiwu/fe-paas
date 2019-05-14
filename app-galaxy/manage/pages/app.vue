<template>
  <div id="manage-app">
    <div class="header">
      <div class="item">
        <label>
          <span>LOB:</span>
          <el-select filterable v-model="search.lobId" placeholder="请选择">
            <el-option v-for="(item, index) in lobList" :key="item.id" :label="item.lobName" :value="item.id">
            </el-option>
          </el-select>
        </label>
      </div>
      <div class="item">
        <label>
          <span>团队名称:</span>
          <el-select filterable v-model="search.groupId" placeholder="请选择">
            <el-option v-for="(item, index) in groupList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </label>
      </div>
      <div class="item key-word">
        <el-select filterable v-model="search.keyWordType" placeholder="请选择" class="key-word-type">
          <el-option v-for="(item, index) in keyWordTypeList" :key="item.key" :label="item.label" :value="item.key">
          </el-option>
        </el-select>
        <el-input
                v-model="search.keyword"
                size="mini"
                style="max-width: 200px"
                placeholder="请输入关键字">
        </el-input>
      </div>
      <div class="item">
        <el-button type="primary" size="mini-extral" @click="handleClick('search')">搜索</el-button>
      </div>
    </div>
    <div class="detail-list">
      <el-table
              :data="appStatusList"
              style="width: 100%"
              stripe
              :height="heightOfTable"
      >
        <el-table-column prop="appName" label="应用名称" minWidth="120"></el-table-column>
        <el-table-column prop="tag" label="项目名称" minWidth="120"></el-table-column>
        <el-table-column label="语言版本" width="100">
          <template slot-scope="scope">
            <span>{{scope.row.language}}</span><span v-if="scope.row.languageVersion">{{scope.row.languageVersion}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="internetDomain" label="外网域名" minWidth="150" align="center"></el-table-column>
        <el-table-column prop="serviceName" label="二级域名" minWidth="100"></el-table-column>
        <el-table-column prop="lobName" label="LOB" width="100"></el-table-column>
        <el-table-column prop="groupName" label="团队名称" width="100"></el-table-column>
        <el-table-column prop="creator" label="创建人" width="80"></el-table-column>
        <el-table-column prop="instanceNumPerProfile" label="运行环境（配置实例数）" minWidth="250" >
          <template slot-scope="scope">
            <span :class="['to-service-url']" v-for="item in scope.row.instanceNumPerProfile"
                  @click="handleRowButtonClick('show_service_page', scope.$index, scope.row, item.spaceName)">
                  {{item.description}}&nbsp;
            </span>
          </template>
        </el-table-column>
        <!--<el-table-column-->
                <!--prop="operation"-->
                <!--label="操作"-->
                <!--width="160"-->
                <!--v-if="false"-->
        <!--&gt;-->
          <!--<template slot-scope="scope">-->
            <!--<el-button-->
                    <!--type="text" class="warning"-->
                    <!--@click="handleRowButtonClick('app-transfer', scope.$index, scope.row)">-->
              <!--应用转让-->
            <!--</el-button>-->
            <!--<div class="ant-divider" v-if="false"></div>-->
            <!--<el-button v-if="false"-->
                    <!--type="text"-->
                    <!--:loading="statusOfWaitingResponse('remove') && selected.row.id === scope.row.id"-->
                    <!--@click="handleRowButtonClick('remove', scope.$index, scope.row)">销毁应用-->
            <!--</el-button>-->
          <!--</template>-->
        <!--</el-table-column>-->
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

    <el-dialog title="应用转让" :visible="action.name == 'app-transfer'"
               @close="closeDialog"
               v-if="action.row"
               class="size-600"
               :close-on-click-modal="false"
    >
      <el-form labelWidth="160px" size="mini" ref="changeAppTransferForm">
        <el-form-item label="应用所属团队：">
          {{action.row.groupName}}
        </el-form-item>
        <el-form-item label="将应用转让到：">
          <el-select filterable v-model="appTransfer.targetGroupId" placeholder="请选择">
            <el-option v-for="(item, index) in targetGroupList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary"
                       @click="handleDialogButton('app-transfer')"
                       :loading="statusOfWaitingResponse('app-transfer')">保&nbsp存</el-button>
          </div>
          <div class="item">
            <el-button @click="closeDialog">取&nbsp消</el-button>
          </div>
      </div>
    </el-dialog>

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
    }
    .to-service-url{
      color: #409EFF;
      cursor: pointer;
    }
  }
</style>
<style lang="scss" scoped>
  #manage-app {
    height: 100%;
    background-color: white;
    /*max-width: 1200px;*/
    .header {
      display: flex;
      padding: 3px 5px;
      background-color: white;
      .item {
        display: inline-block;
        margin-right: 10px;
        &.key-word {
          .el-select {
            margin-right: 2px;
          }
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
    .detail-list {
      position: relative;
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
        this.heightOfTable = this.$el.clientHeight - headerHeight;
      };
      addResizeListener(this.$el, this.resizeListener);
      this.search.keyWordType = this.keyWordTypeList[0]['key'];
      this.requestAppStatusList();
//      console.log(this.$storeHelper.groupListAll);
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

        keyWordTypeList: [{
          key: 'appName',
          label: '应用名称'
        }, {
          key: 'tag',
          label: '项目名称'
        }, {
          key: 'internetDomainQueryParam',
          label: '外网域名'
        }, {
          key: 'serviceName',
          label: '二级域名'
        }],
        search: {
          lobId: '',
          groupId: '',
          keyword: '',
          keyWordType: '',
        },

        totalSize: 0,
        pageSize: 12,
        currentPage: 1,

        appStatusList: [],

        action: {
          name: null,
          row: null,
        },
        appTransfer: {
          targetGroupId: null
        },
      }
    },
    watch: {
//      'search.lobId': 'requestAppStatusList',
//      'search.groupId': 'requestAppStatusList',
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
        if (this.$storeHelper.groupListAll) {
          return [{id: '', name: '全部'}].concat(this.$storeHelper.groupListAll);
        } else {
          return [];
        }
      },
      targetGroupList() {
        if (this.action.row && this.action.row.hasOwnProperty('groupId')) {
          return this.$storeHelper.groupListAll.filter(it => {
            return it.id !== this.action.row['groupId'];
          })
        } else {
          return [];
        }
      },
    },

    methods: {
      async requestAppStatusList() {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const payload = {
          start, length
        };
        if ('' !== this.search.lobId) {
          payload.lobId = this.search.lobId
        }
        if ('' !== this.search.groupId) {
          payload.groupId = this.search.groupId;
        }
        this.search.keyword = this.search.keyword.trim();
        if (this.search.keyword.length > 0) {
          payload[this.search.keyWordType] = this.search.keyword;
        }
        try {
          const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.app_status_list, {
            payload
          });
          this.totalSize = resContent['totalNum'];
          this.appStatusList = resContent['backStageList'].map(record => {
            record['instanceNumPerProfile'] = record['spaceAndInstanceNum'].map(it => {
              return {"spaceName":it.spaceName,"description":it.description+'('+it.instanceNum+')'};
            });
            if (record['internetDomainList'].length > 0) {
              record['internetDomain'] = record['internetDomainList'].join(', ');
            } else {
              record['internetDomain'] = '---';
            }
            if (!record['serviceName']) {
              record['serviceName'] = '---';
            }
            return record;
          });
        } catch(err) {
          console.log(err);
        }
      },

      // the first page of pagination is 1
      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestAppStatusList();
      },

      handleClick(action) {
        switch (action) {
          case 'search':
            this.requestAppStatusList();
            break;
        }
      },
      handleRowButtonClick(action, index, row, data) {
        this.action.row = row;
        switch (action) {
          case 'app-transfer':
            // set default value for this.appTransfer.targetGroupId
            if (this.targetGroupList.length > 0) {
              if (this.targetGroupList.map(it => {return it['id']}).indexOf(this.appTransfer.targetGroupId) > -1) {
              } else {
                this.appTransfer.targetGroupId = this.targetGroupList[0]['id'];
              }
            }
            this.action.name = 'app-transfer';
            break;
          case 'show_service_page':
            let groupId = row.groupId;
            let appName = row.appName;
            window.open(this.$net.page["profile/service"]+"?appName="+appName+"&profileName="+data+"&groupId="+groupId, '_blank');
            break;
        }
      },

      handleDialogButton(action) {
        switch (action) {
          case 'app-transfer':
            this.addToWaitingResponseQueue(action);
            this.$net.requestPaasServer(this.$net.URL_LIST.app_transfer, {
              payload: {
                appId: this.action.row.appId,
                updateGroupId: this.appTransfer.targetGroupId
              }
            }).then(resContent => {

            }).catch().finally(() => {
              this.hideWaitingResponse(action);
              this.closeDialog();
            });
            break;
        }
      },

      closeDialog() {
        this.action.name = null;
      },
    }
  }
</script>