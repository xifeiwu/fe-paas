<template>
  <div id="middleware-mysql">
    <div class="header">
      <el-button size="mini-extral"
                 type="primary"
                 @click="handleButtonClick($event, 'middleware_new_instance')">
        <span>申请实例</span>
      </el-button>
      <el-button size="mini-extral"
                 type="primary"
                 @click="handleButtonClick($event, 'refreshList')">
        <span>刷新列表</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
      </el-button>
    </div>
    <div class="list">
      <el-table :data="instanceList"
                :row-key="getRowKeys"
                :expand-row-keys="expandRows"
                stripe
                :height="heightOfTable">
        <el-table-column label="mariadb名称" prop="name" headerAlign="center" align="center" minWidth="120">
        </el-table-column>
        <el-table-column label="创建者" prop="realName" headerAlign="center" align="center" width="100">
        </el-table-column>
        <el-table-column label="创建时间" prop="formattedCreateTime" headerAlign="center" align="center" width="160">
        </el-table-column>
        <el-table-column label="更新时间" prop="formattedUpdateTime" headerAlign="center" align="center" width="160">
        </el-table-column>
        <el-table-column label="备注" prop="instanceDescribe" headerAlign="center" align="center" minWidth="120">
        </el-table-column>
        <el-table-column label="操作" prop="operation" minWidth="180" headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :class="$storeHelper.permission['middleware_instance_update'].disabled ? 'disabled' : 'warning'"
                    :loading="statusOfWaitingResponse('middleware_instance_update') && operation.row.id == scope.row.id"
                    @click="handleTRClick($event, 'middleware_instance_update', scope.$index, scope.row)">变更规则</el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="$storeHelper.permission['middleware_instance_delete'].disabled ? 'disabled' : 'danger'"
                    :loading="statusOfWaitingResponse('middleware_instance_delete') && operation.row.id == scope.row.id"
                    @click="handleTRClick($event, 'middleware_instance_delete', scope.$index, scope.row)">删除</el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="$storeHelper.permission['middleware_instance_start'].disabled ? 'disabled' : 'warning'"
                    :loading="statusOfWaitingResponse('middleware_instance_start') && operation.row.id == scope.row.id"
                    @click="handleTRClick($event, 'middleware_instance_start', scope.$index, scope.row)">启动</el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="$storeHelper.permission['middleware_instance_stop'].disabled ? 'disabled' : 'warning'"
                    :loading="statusOfWaitingResponse('middleware_instance_start') && operation.row.id == scope.row.id"
                    @click="handleTRClick($event, 'middleware_instance_start', scope.$index, scope.row)">停止</el-button>
            <div class="ant-divider"></div>
            <el-button
                    class="flex primary" type="text"
                    :loading="statusOfWaitingResponse('instance_more_info') && operation.row.id == scope.row.id"
                    @click="handleTRClick($event, 'instance_more_info', scope.$index, scope.row)">
              <span>服务详情</span>
              <i :class="{'el-icon-arrow-right': true, 'expand': expandRows.indexOf(scope.row.id) > -1}"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<style lang="scss">
#middleware-mysql {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1500px;
  background: white;
  .header {
    padding: 3px 5px;
    font-size: 14px;
  }
  .list {
    .el-table {
      .el-table__row {
        .el-button {
          .el-icon-arrow-right {
            vertical-align: middle;
            transition: transform 0.2s ease-in-out;
            &.expand {
              transform: rotate(90deg);
            }
          }
        }
        .ant-divider {
        }
      }
    }
  }
}
</style>
<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  module.exports = {
    mixins: [commonUtils],
    async created() {
      this.$storeHelper.middlewarePromiseChain.push(async() => {
//        console.log('middleware/mariadb created');
        const clusterId = this.$storeHelper.currentClusterId;
        const middlewareList = this.$storeHelper.getMiddlewareList(clusterId);
        this.clusterId = clusterId;

        var middlewareId = null;
        middlewareList.some(it => {
          if (it['middlewareName'] === 'mariadb') {
            middlewareId = it['id'];
          }
          return middlewareId;
        });
        if (!middlewareId) {
          console.log(`error: middlewareId not found!`);
        }

        this.middlewareId = middlewareId;
        this.$storeHelper.currentMiddlewareId = middlewareId;

        var middlewareVersionList = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_middleware_version, {
          query: {
            middlewareId
          }
        });
//      console.log(middlewareVersionList);
        this.$storeHelper.setMiddlewareVersionList(clusterId, middlewareId, middlewareVersionList);

        this.requestList();
      });
      await this.$storeHelper.middlewarePromiseChain[0]();
      await this.$storeHelper.middlewarePromiseChain[1]();
    },
    mounted() {
      // update value in next tick
      setTimeout(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
        this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 8;
        if (this.appInfoListOfGroup) {
          this.onAppInfoListOfGroup(this.appInfoListOfGroup);
        }
      });
    },
    data() {
      return {
        clusterId: null,
        middlewareId: null,

        instanceList: [],
        heightOfTable: '',
        getRowKeys: function (row) {
          return row.id;
        },
        expandRows: [],
        operation: {
          name: '',
          row: null
        },

        totalSize: 0,
        pageSize: 10,
        currentPage: 1,
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
    },
    methods: {
      onScreenSizeChange(size) {
//        console.log(this.$storeHelper.screen);
        if (!size) {
          return;
        }
        try {
          // if this.showAppList == false, headerNode will not exist
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
        } catch(err) {
        }
      },

      async requestList() {
        this.instanceList = [];
        const instanceList = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_middleware_instance_info_basic, {
          payload: {
            clusterId: this.clusterId,
            middlewareId: this.middlewareId,
            groupId: this.$storeHelper.currentGroupID
          }
        });
        instanceList.forEach(it => {
          it.formattedCreateTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
          it.formattedUpdateTime = this.$utils.formatDate(it.updateTime, 'yyyy-MM-dd hh:mm:ss');
          if(!it.instanceDescribe) {
            it.instanceDescribe = '---';
          }
        });
        this.instanceList = instanceList;
//        console.log(instanceList);
      },
      handleButtonClick(evt, action) {
        switch (action) {
          case 'middleware_new_instance':
            this.$router.push(this.$net.page['profile/middleware/mariadb/add']);
            break;
          case 'refreshList':
            this.requestList();
            break;
        }
      },
      async handleTRClick(evt, action, index, row) {
        this.operation.row = row;
        switch (action) {
          case 'middleware_instance_update': break;
          case 'middleware_instance_delete': break;
          case 'middleware_instance_start': break;
          case 'middleware_instance_stop': break;
          case 'instance_more_info':
            if (!row.hasOwnProperty('id')) {
              return;
            }
            let key = row.id;
            if (this.expandRows.indexOf(key) > -1) {
              this.expandRows.splice(this.expandRows.indexOf(key), 1);
            } else {
//              const style = {
//                "clusterId": 2,
//                "middlewareNameId": 2,
//                "middlewareVersionId": 3,
//                "namespace": "lalala1",
//                "name": "bqdtestmariadb27"
//              };
              this.addToWaitingResponseQueue(action);
              this.$net.requestPaasServer(this.$net.URL_LIST.middleware_middleware_instance_info_detail, {
                payload: {
                  clusterId: this.clusterId,
                  middlewareNameId: row.id,
                  middlewareVersionId: '',
                  namespace: this.$storeHelper.groupInfo.tag,
                  name: row.name
                }
              }).then(resContent => {
                console.log(resContent);
                this.expandRows = [key];
              }).finally(() => {
                this.hideWaitingResponse(action);
              });
            }
            break;
        }
      }
    }
  }
</script>