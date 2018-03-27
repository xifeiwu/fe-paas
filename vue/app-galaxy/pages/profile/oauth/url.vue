<template>
  <div id="oauth-url">
    <el-row class="header">
      <el-col :span="0"></el-col>
      <el-col :span="24">
        <div class="item">
          <label style="float: left; width: 100px; line-height: 26px">被访问的应用：</label>
          <el-select filterable v-model="searchCondition.appID" placeholder="请选择"
                     style="display:block; max-width: 280px; margin-left: 100px;">
            <el-option v-for="(item, index) in targetGroupList"
                       :key="item.targetGroupId" :label="item.targetGroupName" :value="item.targetGroupId">
            </el-option>
          </el-select>
        </div>
        <div class="item">
          <label style="float: left; width: 72px; line-height: 26px">访问环境：</label>
          <el-select v-model="searchCondition.production" placeholder="请选择"
                     style="display:block; max-width: 200px; margin-left: 72px;">
            <el-option :value="true" label="生产环境"></el-option>
            <el-option :value="false" label="非生产环境"></el-option>
          </el-select>
        </div>
        <el-button size="mini-extral"
                   type="primary"
                   :loading="statusOfWaitingResponse('search')"
                   @click="handleButtonClick('search')">搜索
        </el-button>
      </el-col>
    </el-row>
    <div class="access-key-list">
      <el-table
              :data="authorizeUrlListByPage"
              stripe
              v-loading="showLoading"
              element-loading-text="加载中"
      >
        <el-table-column
                prop="targetApplicationName"
                label="被访问的应用"
                width="120"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                prop="envName"
                label="访问环境"
                width="120"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                prop="operatorName"
                label="授权人"
                width="120"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                label="授权时间"
                prop="createTime"
                width="120"
                headerAlign="center" align="center">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.createTime)">
              <div v-for="(item, index) in scope.row.createTime" :key="index">
                {{item}}

              </div>
            </div>
            <div v-else>{{scope.row.createTime}}</div>
          </template>
        </el-table-column>
        <el-table-column
                prop="requestGroupName"
                label="授权访问团队"
                width="120"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                prop="requestGroupName"
                label="授权URL"
                headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="200"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="warning"
                    :loading="statusOfWaitingResponse('open-dialog-for-authorize-url') && selected.row.id === scope.row.id"
                    @click="handleTRClick('open-dialog-for-authorize-url', scope.$index, scope.row)">
              授权URL
            </el-button>
            <el-button
                    size="mini-extral"
                    type="danger"
                    :loading="statusOfWaitingResponse('delete') && selected.row.id === scope.row.id"
                    @click="handleTRClick('disable', scope.$index, scope.row)">禁用

            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss">
  #oauth-url {
    .el-row.header {
      .el-input {
        input {
          height: 26px;
        }
      }
      .el-select .el-input__inner {
        height: 26px;
      }
    }
  }
</style>
<style lang="scss" scoped>
  #oauth-url {
    .el-row.header {
      margin: 5px;
      font-size: 14px;
      line-height: 20px;
      i {
        font-size: 14px;
      }
      .el-col {
        vertical-align: middle;
        .item {
          margin: 1px;
          display: inline-block;
        }
      }
    }
    .el-table {
      .el-button {
        margin: 2px 4px;
      }
    }
  }
</style>

<script>
  module.exports = {
    created() {
    },
    mounted() {
      // whether need to request access key list or not
      let updateAccessList = false;
      if (!Array.isArray(this.authorizeUrlListByPage)) {
        updateAccessList = true;
      } else if (this.authorizeUrlListByPage.length == 0) {
        updateAccessList = true;
      }
      if (updateAccessList) {
        this.requestAuthorizeUrlList();
      }
      this.targetGroupList = [{
        targetGroupId: this.$storeHelper.APP_ID_FOR_ALL,
        targetGroupName: '全部',
      }];
//    if (!this.targetGroupList || this.targetGroupList.length === 0) {
//      this.getTargetGroupList(this.$storeHelper.currentGroupID)
//    }
    },
    data() {
      return {
        queueForWaitingResponse: [],

        targetGroupList: [],
        showLoading: false,
        searchCondition: {
          appID: '',
          production: true,
        },
        authorizeUrlListByPage: [],

        // for pagination
        totalSize: 0,
        pageSize: 10,
        currentPage: 1,
      }
    },
    methods: {

      // helper for loading action of el-button
      addToWaitingResponseQueue(action) {
        if (this.queueForWaitingResponse.indexOf(action) === -1) {
          this.queueForWaitingResponse.push(action);
        }
      },
      hideWaitingResponse(action) {
        let index = this.queueForWaitingResponse.indexOf(action);
        if (index > -1) {
          this.queueForWaitingResponse.splice(index, 1);
        }
      },
      statusOfWaitingResponse(action) {
        return this.queueForWaitingResponse.indexOf(action) > -1;
      },

      handleButtonClick(action) {
        switch (action) {
          case 'search':
//          console.log(this.searchCondition);
            this.requestAuthorizeUrlList();
            break;
        }
      },

      handleTRClick(action, index, row) {

      },

      /**
       * update access-key list, called at:
       * 1. mounted function at start of page
       * 2. change of pagination
       * 3. search button
       * 4. success callback of delete access-key
       * @param cb
       */
      requestAuthorizeUrlList(cb) {
        if (!cb) {
          cb = function () {
          };
        }
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;
        let targetAppID = this.searchCondition.appID;
        let options = {
          productEnv: this.searchCondition.production,
          targetGroupId: this.$storeHelper.currentGroupID,
          targetApplicationId: targetAppID == this.$storeHelper.APP_ID_FOR_ALL ? '' : targetAppID,
          start: start,
          length: length,
        };
        this.showLoading = true;
//      {
//        "targetApplicationName": "被访问的应用",
//        "envName": "访问环境",
//        "operatorName": '授权人',
//        "createTime": '授权时间',
//        "requestGroupName": '授权访问团队',
//        "detailList": []
//      }
        this.$net.oauthGetAuthorizeUrlList(options).then(content => {
          if (content.hasOwnProperty('authRecordList')) {
            this.authorizeUrlListByPage = content['authRecordList'];
            this.totalSize = content.total;
            console.log(this.authorizeUrlListByPage);
          }
          this.showLoading = false;
          cb(true)
        }).catch(err => {
          this.showLoading = false;
          cb(false)
        });
      },
    }
  }
</script>