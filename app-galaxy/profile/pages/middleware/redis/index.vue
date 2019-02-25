<template>
  <div id="middleware-redis">
    <div class="header">
      <el-tabs type="border-tab" v-model="profileName" :class="[profileName]">
        <el-tab-pane v-for="item in unProductionClusterList" :label="item.description" :name="item.clusterName"
                     :key="item.clusterName"></el-tab-pane>
      </el-tabs>
      <div class="operation">
        <el-button size="mini"
                   type="primary"
                   :class="{'flex': true, 'disabled': $storeHelper.permission['middleware_redis_instance_create'].disabled}"
                   @click="handleButtonClick($event, 'middleware_redis_instance_create')">
          <span>申请实例</span><i class="paas-icon-level-up"></i>
        </el-button>
        <el-button size="mini"
                   type="primary"
                   @click="handleButtonClick($event, 'refreshList')">
          <span>刷新列表</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
        </el-button>
      </div>
    </div>
    <div class="list">
      <el-table :data="instanceList"
                :row-key="getRowKeys"
                :expand-row-keys="expandRows"
                @sort-change="onSortChangeInTable"
                :defaultSort="tableSort"
                stripe
                :height="heightOfTable">
        <el-table-column label="实例ID" prop="id" headerAlign="center" align="center" width="60">
        </el-table-column>
        <el-table-column label="redis名称" prop="name" headerAlign="center" align="center" minWidth="120">
        </el-table-column>
        <el-table-column label="创建者" prop="realName" headerAlign="center" align="center" width="80">
        </el-table-column>
        <el-table-column label="创建时间" prop="formattedCreateTime" headerAlign="center" align="center" width="136"
                         sortable="custom">
        </el-table-column>
        <el-table-column label="更新时间" prop="formattedUpdateTime" headerAlign="center" align="center" width="136"
                         sortable="custom">
        </el-table-column>
        <el-table-column label="剩余有效天数" prop="remainingDays" headerAlign="center" align="center" width="136"
                         sortable="custom">
          <template slot-scope="scope">
            <span>{{(scope.row.remainingDays >= 0) ? scope.row.remainingDays + '天' : '已失效'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="instanceDescribe" headerAlign="center" align="center" minWidth="120">
        </el-table-column>
        <el-table-column label="操作" prop="operation" headerAlign="center" align="center" minWidth="200">
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :class="[$storeHelper.permission['middleware_redis_instance_update'].disabled ? 'disabled' : 'warning']"
                    :loading="statusOfWaitingResponse('middleware_redis_instance_update') && action.row.id == scope.row.id"
                    @click="handleTRClick($event, 'middleware_redis_instance_update', scope.$index, scope.row)">内存扩容</el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['middleware_redis_instance_edit'].disabled ? 'disabled' : 'warning']"
                    :loading="statusOfWaitingResponse('middleware_redis_instance_edit') && action.row.id == scope.row.id"
                    @click="handleTRClick($event, 'middleware_redis_instance_edit', scope.$index, scope.row)">
              <span>修改配置</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="$storeHelper.permission['middleware_redis_instance_delete'].disabled ? 'disabled' : 'danger'"
                    :loading="statusOfWaitingResponse('middleware_redis_instance_delete') && action.row.id == scope.row.id"
                    @click="handleTRClick($event, 'middleware_redis_instance_delete', scope.$index, scope.row)">删除</el-button>
            <div class="ant-divider"></div>
            <el-button v-if="false"
                    type="text"
                    :class="$storeHelper.permission['middleware_redis_instance_start'].disabled ? 'disabled' : 'warning'"
                    :loading="statusOfWaitingResponse('middleware_redis_instance_start') && action.row.id == scope.row.id"
                    @click="handleTRClick($event, 'middleware_redis_instance_start', scope.$index, scope.row)">启动</el-button>
            <div class="ant-divider" v-if="false"></div>
            <el-button v-if="false"
                    type="text"
                    :class="$storeHelper.permission['middleware_redis_instance_stop'].disabled ? 'disabled' : 'warning'"
                    :loading="statusOfWaitingResponse('middleware_redis_instance_stop') && action.row.id == scope.row.id"
                    @click="handleTRClick($event, 'middleware_redis_instance_stop', scope.$index, scope.row)">停止</el-button>
            <div class="ant-divider" v-if="false"></div>
            <el-button v-if="false"
                    type="text"
                    :class="['flex', false ? 'disabled' : 'primary']"
                    :loading="statusOfWaitingResponse('go-to-page-backup') && action.row.id == scope.row.id"
                    @click="handleTRClick($event, 'go-to-page-backup', scope.$index, scope.row)">
              <span>备份与恢复</span>
              <i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider" v-if="false"></div>
            <el-button
                    class="primary" type="text"
                    :loading="statusOfWaitingResponse('instance_more_info') && action.row.id == scope.row.id"
                    @click="handleTRClick($event, 'instance_more_info', scope.$index, scope.row)">
              <span>实例详情</span>
              <i :class="{'el-icon-arrow-right': true, 'expand': expandRows.indexOf(scope.row.id) > -1}"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         width="0">
          <template slot-scope="scope">
            <div class="row-expand">
              <i :class="['el-icon', 'el-icon-refresh',  statusOfWaitingResponse('instance_more_info_refresh') ? 'loading':'']"
                 @click="handleTRClick($event, 'instance_more_info_refresh')"></i>
              <el-form label-position="right" label-width="170px" inline size="mini" class="message-show">
                <el-form-item label="实例名称">
                  {{instanceMoreInfo.name}}
                </el-form-item>
                <el-form-item label="状态">
                  {{instanceMoreInfo.status}}
                </el-form-item>
                <el-form-item label="redis地址:端口">
                  {{instanceMoreInfo.redisAddr + ':' + instanceMoreInfo.redisPort}}
                </el-form-item>
                <el-form-item label="密码">
                  {{instanceMoreInfo.password}}
                </el-form-item>
                <el-form-item label="已用内存/总内存">
                  {{instanceMoreInfo.memoryUsed + " / " + instanceMoreInfo.memorySelected}}
                </el-form-item>
                <el-form-item label="已用存储/总磁盘">
                  {{instanceMoreInfo.storageUsed + " / " + instanceMoreInfo.storageTotal}}
                </el-form-item>
              </el-form>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="内存扩(缩)容" :visible="action.name == 'middleware_redis_instance_update'"
               :close-on-click-modal="false"
               @close="handleDialogButtonClick('close')"
               class="middleware_redis_instance_update size-700"
               v-if="action.name && action.row"
    >
      <el-form :model="dialog4UpdateMemory" :rules="rules" size="mini" labelWidth="120px">
        <el-form-item label="当前内存容量" class="memory">
          {{dialog4UpdateMemory.memoryNow}}
        </el-form-item>
        <el-form-item label="修改磁盘容量为" prop="memory" class="memory">
          <div style="width: 360px; display: inline-block; margin-left: 5px;">
            <el-slider v-model="dialog4UpdateMemory.memory" :show-tooltip="true" :show-stops="false" :format-tooltip="utils.formatTooltipForMemory"
                       :min="512 * 1048576" :max="256 * 4 * 5 * 1048576" :step="256 * 1048576"></el-slider>
          </div>
          <div style="display: inline-block; margin-left: 15px;"><span></span>{{bytes(dialog4UpdateMemory.memory)}}</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogButtonClick('middleware_redis_instance_update')"
                     :loading="statusOfWaitingResponse('middleware_redis_instance_update')">确定重启</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="handleDialogButtonClick('close')">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<style lang="scss">
#middleware-redis {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1500px;
  background: white;
  .header {
    font-size: 14px;
    .el-tabs {
      &.el-tabs--border-tab {
        background-color: #f4f5f5;
        #tab-fpdev.is-active {
          border-top-color: $g-env-fpdev-color;
          color: $g-env-fpdev-color;
        }
        #tab-test.is-active {
          border-top-color: $g-env-test-color;
          color: $g-env-test-color;
        }
        #tab-performance.is-active {
          border-top-color: $g-env-performance-color;
          color: $g-env-performance-color;
        }
        #tab-beta.is-active {
          border-top-color: $g-env-beta-color;
          color: $g-env-beta-color;
        }
        #tab-production.is-active {
          border-top-color: $g-env-production-color;
          color: $g-env-production-color;
        }

        >.el-tabs__header {
          .el-tabs__item {
            color: black;
          }
        }
        .el-tabs__content {
          display: none;
        }
      }
    }
    .operation {
      padding: 6px 8px 3px 5px;
      text-align: right;
    }
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
      .row-expand {
        position: relative;
        box-sizing: border-box;
        padding: 8px 12px;
        width: 85%;
        margin: 6px auto;
        max-width: 900px;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
        border: none;
        border-radius: 2px;
        .el-icon-refresh {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 14px;
          z-index: 10;
          &:hover {
            /*font-size: 16px;*/
            color: #409EFF;
            cursor: pointer;
          }
          &.loading {
            pointer-events: none;
            animation: rotating 1s linear infinite;
          }
        }
        .el-form {
          .el-form-item {
            box-sizing: border-box;
            width: calc(50% - 2px);
            &.big {
              .el-form-item__content {
                margin-left: 170px;
              }
            }
            .el-form-item__label {
              font-weight: bold;
            }
            &.el-form-item--mini {
              margin-bottom: 2px;
            }
            &.relativePathOfParentPOM {
              .el-form-item__label {
              }
            }
          }
        }
      }
    }
  }
}
</style>
<script>
  import bytes from 'bytes';
  import utils from '../utils';
  import commonUtils from 'assets/components/mixins/common-utils';
  const MIDDLEWARE_NAME = 'redis';

  module.exports = {
    mixins: [commonUtils],
    async created() {
      this.bytes = bytes;
      this.utils = utils;
//      await this.checkBasicData4Middleware();
//      this.requestInstanceList();
      if (this.$storeHelper.clusterList) {
        this.onClusterList(this.$storeHelper.clusterList);
      }
    },
    mounted() {
      // update value in next tick
      setTimeout(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
        this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 8;
//        if (this.appInfoListOfGroup) {
//          this.onAppInfoListOfGroup(this.appInfoListOfGroup);
//        }
      });
    },
    data() {
      return {
        unProductionClusterList: [],
        // ['fpdev', 'test', 'beta', 'performance', 'production']
        profileName: null,
        clusterId: null,
        middlewareId: null,
        clusterInfo: null,
        middlewareInfo: null,

        instanceList: [],
        heightOfTable: '',
        getRowKeys: function (row) {
          return row.id;
        },
        expandRows: [],
        instanceMoreInfo: {},
        action: {
          name: '',
          row: null
        },
        constants: {
          cpuList: [1, 2],
          memoryList: [2, 3, 4]
        },

        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        tableSort: {
          prop: 'formattedCreateTime',
          order: 'descending',
        },
        dialog4UpdateMemory: {
          memoryNow: '',
          memory: '',
        },
        rules: utils.redisRules
      }
    },
    watch: {
      '$storeHelper.clusterList': 'onClusterList',
      '$storeHelper.screen.size': 'onScreenSizeChange',
      '$storeHelper.groupInfo.id': function () {
        this.requestInstanceList();
      },
      'profileName': async function(profileName) {
        // value of elTab is set to '0' by default
        if (profileName == '0') {
          return;
        }
        // update user/config in vuex
        this.$store.dispatch('user/config', {
          page: 'middleware',
          data: {
            profileName: this.profileName
          }
        });
        await this.checkBasicData4Middleware();
        await this.requestInstanceList();
      }
    },
    methods: {
      onClusterList(clusterList) {
        this.unProductionClusterList = clusterList.filter(it => it['clusterName']).filter(it => it['clusterName'] != 'production');
        if (this.unProductionClusterList.length === 0) {
          return;
        }

        // get profileName from localStorage
        const userConfig = this.$store.getters['user/config'];
        if (userConfig && userConfig.hasOwnProperty('middleware')) {
          const middlewareConfig = userConfig['middleware'];
          this.profileName = middlewareConfig['profileName'];
        }
        // set first profileName
        if (!this.profileName) {
          this.profileName = this.unProductionClusterList[0]['clusterName'];
        }
      },
      // check if all necessary data is get
      async checkBasicData4Middleware() {
        if (!this.profileName) {
          return;
        }
        await this.$storeHelper.checkBasicData4Middleware(this.profileName, MIDDLEWARE_NAME);
//      console.log(this.$storeHelper.getClusterList());
//      console.log(this.$storeHelper.currentMiddleware);
        const clusterId = this.$storeHelper.currentMiddleware['clusterId'];
        const middlewareId = this.$storeHelper.currentMiddleware['middlewareId'];
        if (!clusterId || !middlewareId) {
          return;
        }
        this.clusterId = clusterId;
        this.middlewareId = middlewareId;
        this.clusterInfo = this.$storeHelper.getClusterById(this.clusterId);
        this.middlewareInfo = this.$storeHelper.getMiddlewareById(this.clusterId, this.middlewareId);
      },

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

      // request instance list
      async requestInstanceList() {
        if (!this.$storeHelper.currentGroupID) {
          return;
        }
        if (!this.clusterId || !this.middlewareId) {
          await this.checkBasicData4Middleware();
        }
        this.instanceList = [];
        // if current middleware not exist, set this.instanceList as empty array
        if (!this.middlewareId) {
          return;
        }
        var {content, timeStamp} = await this.$net.requestPaasServer(
          Object.assign({}, this.$net.URL_LIST.middleware_middleware_instance_info_basic, {
            withTimeStamp: true
          }), {
            payload: {
              clusterId: this.clusterId,
              middlewareId: this.middlewareId,
              groupId: this.$storeHelper.currentGroupID
            }
          });

        const instanceList = content;
        const ONE_DAY = 24 * 3600 * 1000;
        instanceList.forEach(it => {
          it.formattedCreateTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
          it.formattedUpdateTime = this.$utils.formatDate(it.updateTime, 'yyyy-MM-dd hh:mm:ss');
          it.formattedExpiredTime = this.$utils.formatDate(it.expiredTime, 'yyyy-MM-dd');

          it.remainingDays = '---';
          if (it.hasOwnProperty('expiredTime')) {
            it.remainingDays = Math.floor((parseInt(it.expiredTime) - timeStamp) / ONE_DAY);
          }

          if(!it.instanceDescribe) {
            it.instanceDescribe = '---';
          }
        });
        this.instanceList = instanceList;
//        console.log(instanceList);
        // sort table by this.tableSort after success request
        this.onSortChangeInTable(this.tableSort);
      },

      handleButtonClick(evt, action) {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        switch (action) {
          case 'middleware_redis_instance_create':
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/middleware/redis'],
              data: {
                clusterInfo: this.clusterInfo,
                middlewareInfo: this.middlewareInfo,
              }
            };
            this.$router.push(this.$net.page['profile/middleware/redis/add']);
            break;
          case 'refreshList':
            this.requestInstanceList();
            break;
        }
      },

      async getInstanceMoreInfo() {
        if (!this.clusterId || !this.middlewareId) {
          await this.checkBasicData4Middleware();
        }
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_redis_instance_info_more, {
          payload: {
            clusterId: this.clusterId,
            middlewareId: this.middlewareId,
//            middlewareVersionId: 3,
            namespace: this.$storeHelper.groupInfo.tag,
            name: this.action.row.name
          }
        });
        ['redisAddr', 'redisPort', 'memoryUsed', 'memoryTotal', 'storageUsed', 'storageTotal'].forEach(key => {
          if (resContent.hasOwnProperty(key) && null == resContent[key]) {
            resContent[key] = '---';
          }
        });
        ['memoryUsed', 'memoryTotal', 'storageUsed', 'storageTotal'].forEach(it => {
            if (resContent.hasOwnProperty(it) && '---' !== resContent[it]) {
                resContent[it] = bytes(parseInt(resContent[it]));
            }
        });
        resContent['redisAddress'] = `${resContent['redisAddr']}:${resContent['redisPort']}`;
        return resContent;
      },

      async handleTRClick(evt, action, index, row) {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        // action 'instance_more_info_refresh' does not pass param index and row
        if (row) {
          this.action.row = row;
        }
        switch (action) {
          case 'middleware_redis_instance_update':
            this.addToWaitingResponseQueue(action);
            try {
              const instanceStatus = await this.getInstanceMoreInfo();
//              console.log(instanceStatus);
              this.dialog4UpdateMemory.memoryNow = instanceStatus['memorySelected'];
              this.dialog4UpdateMemory.memory = parseInt(instanceStatus['memoryTotal']);
              this.action.name = action;
              this.hideWaitingResponse(action);
            } catch (err) {
              console.log(err);
              this.hideWaitingResponse(action);
            }
            break;
          case 'middleware_redis_instance_edit':
            try {
//              const moreInfo = await this.getInstanceMoreInfo();
//              console.log(moreInfo);
              this.$storeHelper.dataTransfer = {
                from: this.$net.page['profile/middleware/redis'],
                data: {
                  clusterInfo: this.clusterInfo,
                  middlewareInfo: this.middlewareInfo,
                  name: this.action.row.name,
                  instanceDescribe: this.action.row.instanceDescribe,
                  remainingDays: this.operation.row.remainingDays < 1 ? 1 : this.operation.row.remainingDays,
//                  memory: moreInfo['memoryTotal']
                }
              };
              this.$router.push(this.$net.page['profile/middleware/redis/modify']);
            } catch (err) {
              console.log(err);
            }
            break;
          case 'middleware_redis_instance_delete':
            this.addToWaitingResponseQueue(action);
            try {
              const warningMsg = `删除mariadb实例 "${row.name}"?`;
              await this.warningConfirm(warningMsg);
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_redis_instance_delete, {
                payload: {
                  clusterId: this.clusterId,
                  middlewareId: this.middlewareId,
                  middlewareVersionId: 3,
                  namespace: this.$storeHelper.groupInfo.tag,
                  name: this.action.row.name,
                }
              });
              this.$message.success(`mariadb实例 "${row.name}" 删除成功！`);
              this.hideWaitingResponse(action);
              this.requestInstanceList();
            } catch(err) {
              this.hideWaitingResponse(action);
            }
            break;
          case 'middleware_redis_instance_start':
            this.addToWaitingResponseQueue(action);
            try {
              await this.warningConfirm(`启动mariadb实例 "${row.name}"?`);
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_start, {
                payload: {
                  clusterId: this.clusterId,
                  middlewareId: this.middlewareId,
                  middlewareVersionId: 3,
                  namespace: this.$storeHelper.groupInfo.tag,
                  name: this.action.row.name,
                }
              });
              this.$message.success(`mariadb实例 "${row.name}" 启动成功！`);
              this.hideWaitingResponse(action);
//              this.expandRows = [];
              this.instanceMoreInfo = await this.getInstanceMoreInfo();
            } catch(err) {
              this.hideWaitingResponse(action);
            }
            break;
          case 'middleware_redis_instance_stop':
            this.addToWaitingResponseQueue(action);
            try {
              await this.warningConfirm(`停止mariadb实例 "${row.name}"?`);
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_stop, {
                payload: {
                  clusterId: this.clusterId,
                  middlewareId: this.middlewareId,
                  middlewareVersionId: 3,
                  namespace: this.$storeHelper.groupInfo.tag,
                  name: this.action.row.name,
                }
              });
              this.$message.success(`mariadb实例 "${row.name}" 停止成功！`);
              this.hideWaitingResponse(action);
              this.instanceMoreInfo = await this.getInstanceMoreInfo();
//              this.expandRows = [];
            } catch(err) {
              this.hideWaitingResponse(action);
            }
            break;
          case 'instance_more_info_refresh':
            this.addToWaitingResponseQueue(action);
            try {
              this.instanceMoreInfo = await this.getInstanceMoreInfo();
              setTimeout(() => {
                this.hideWaitingResponse(action);
              }, 1000);
            } catch(err) {
              setTimeout(() => {
                this.hideWaitingResponse(action);
              }, 1000);
            }
            break;
          case 'instance_more_info':
            if (!row.hasOwnProperty('id')) {
              return;
            }
            let key = row.id;
            if (this.expandRows.indexOf(key) > -1) {
              this.expandRows.splice(this.expandRows.indexOf(key), 1);
            } else {
              this.addToWaitingResponseQueue(action);
              try {
                this.instanceMoreInfo = await this.getInstanceMoreInfo();
                this.expandRows = [key];
                this.hideWaitingResponse(action);
              } catch(err) {
                this.hideWaitingResponse(action);
              }
            }
            break;
          case 'go-to-page-backup':
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/middleware/mariadb'],
              data: row
            };
            this.$router.push(this.$net.page['profile/middleware/mariadb/backup']);
            break;
        }
      },

      async handleDialogButtonClick(action) {
        switch (action) {
          case 'middleware_redis_instance_update':
            this.addToWaitingResponseQueue(action);
            try {
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_redis_update_memory, {
                payload: {
                  clusterId: this.clusterId,
                  middlewareId: this.middlewareId,
                  name: this.action.row.name,
                  memory: this.dialog4UpdateMemory.memory / this.utils.ONE_MILLION,
                  groupId: this.$storeHelper.groupInfo.id,
                  namespace: this.$storeHelper.groupInfo.tag,
                  isCluster: false,
                }
              });
              // updateTime is change when by this action
//              await this.requestInstanceList();
              this.instanceMoreInfo = await this.getInstanceMoreInfo();
              this.expandRows = [this.action.row.id];
              this.hideWaitingResponse(action);
              this.action.name = null;
            } catch (err) {
              this.hideWaitingResponse(action);
              this.action.name = null;
            }
            break;
          case 'close':
//            console.log(this.action.name);
//            console.log(this.queueForWaitingResponse);
            this.hideWaitingResponse(this.action.name);
            this.action.name = null;
            break
        }
      },

      onSortChangeInTable(tableSort) {
//        console.log(tableSort);
        this.tableSort = tableSort;
        const keyMap = {
          'formattedUpdateTime': 'updateTime',
          'formattedCreateTime': 'createTime'
        };
        const key = keyMap[this.tableSort.prop];
        if (!key) {
          return 0;
        }
        this.instanceList.sort((pre, next) => {
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
      }
    }
  }
</script>