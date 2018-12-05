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
                @sort-change="onSortChangeInTable"
                :defaultSort="tableSort"
                stripe
                :height="heightOfTable">
        <el-table-column label="mariadb名称" prop="name" headerAlign="center" align="center" width="150">
        </el-table-column>
        <el-table-column label="创建者" prop="realName" headerAlign="center" align="center" width="80">
        </el-table-column>
        <el-table-column label="创建时间" prop="formattedCreateTime" headerAlign="center" align="center" width="150"
                         sortable="custom">
        </el-table-column>
        <el-table-column label="更新时间" prop="formattedUpdateTime" headerAlign="center" align="center" width="150"
                         sortable="custom">
        </el-table-column>
        <el-table-column label="备注" prop="instanceDescribe" headerAlign="center" align="center" minWidth="100">
        </el-table-column>
        <el-table-column label="操作" prop="operation" headerAlign="center" align="center" minWidth="150">
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
                    :loading="statusOfWaitingResponse('middleware_instance_stop') && operation.row.id == scope.row.id"
                    @click="handleTRClick($event, 'middleware_instance_stop', scope.$index, scope.row)">停止</el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', false ? 'disabled' : 'primary']"
                    :loading="statusOfWaitingResponse('go-to-page-backup') && operation.row.id == scope.row.id"
                    @click="handleTRClick($event, 'go-to-page-backup', scope.$index, scope.row)">
              <span>备份与恢复</span>
              <i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    class="primary" type="text"
                    :loading="statusOfWaitingResponse('instance_more_info') && operation.row.id == scope.row.id"
                    @click="handleTRClick($event, 'instance_more_info', scope.$index, scope.row)">
              <span>服务详情</span>
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
                <el-form-item label="数据库地址:端口">
                  {{instanceMoreInfo.address+':'+instanceMoreInfo.port}}
                </el-form-item>
                <el-form-item label="CPU/内存">
                  {{instanceMoreInfo.cpu + '核/' + instanceMoreInfo.memorySize}}
                </el-form-item>
                <el-form-item label="已用/总磁盘空间">
                  {{instanceMoreInfo.diskUsage + '/' + instanceMoreInfo.diskTotal}}
                </el-form-item>
                <el-form-item label="用户名/密码">
                  {{instanceMoreInfo.userName + '/' + instanceMoreInfo.password}}
                </el-form-item>
              </el-form>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="更改实例规格" :visible="operation.name == 'middleware_instance_update'"
               :close-on-click-modal="false"
               @close="handleDialogButtonClick('close')"
               class="middleware_instance_update size-500"
               v-if="operation.name && operation.row"
    >
      <el-form :model="newProps" size="mini" labelWidth="80px">
        <el-form-item label="CPU" prop="cpu">
          <el-radio-group v-model="newProps.cpu" size="small">
            <el-radio v-for="item in constants.cpuList" :label="item" :key="item">
              {{item}}核
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内存" prop="memory">
          <el-radio-group v-model="newProps.memory" size="small">
            <el-radio v-for="item in constants.memoryList" :label="item" :key="item">
              {{item}}G
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogButtonClick('middleware_instance_update')"
                     :loading="statusOfWaitingResponse('middleware_instance_update')">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="handleDialogButtonClick('close')">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
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
  import commonUtils from 'assets/components/mixins/common-utils';
  module.exports = {
    mixins: [commonUtils],
    async created() {
      await this.checkBasicData4Middleware();
      this.requestList();
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
        clusterId: null,
        middlewareId: null,

        instanceList: [],
        heightOfTable: '',
        getRowKeys: function (row) {
          return row.id;
        },
        expandRows: [],
        instanceMoreInfo: {},
        operation: {
          name: '',
          row: null
        },
        newProps: {
          cpu: '',
          memory: ''
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
        }
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
      '$storeHelper.groupInfo.id': function () {
        this.requestList();
      }
    },
    methods: {
      // check if all necessary data is get
      async checkBasicData4Middleware() {
        const profile = 'unProduction';
        const middlewareName = 'mariadb';
        await this.$storeHelper.checkBasicData4Middleware(profile, middlewareName);
//      console.log(this.$storeHelper.getClusterList());
//      console.log(this.$storeHelper.currentMiddleware);
        this.clusterId = this.$storeHelper.currentMiddleware['clusterId'];
        this.middlewareId = this.$storeHelper.currentMiddleware['middlewareId'];
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
      async requestList() {
        if (!this.clusterId || !this.middlewareId) {
          await this.checkBasicData4Middleware();
        }
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
        // sort table by this.tableSort after success request
        this.onSortChangeInTable(this.tableSort);
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

      async handleDialogButtonClick(action) {
        switch (action) {
          case 'middleware_instance_update':
            this.addToWaitingResponseQueue(action);
            try {
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_update, {
                payload: {
                  clusterId: this.clusterId,
                  middlewareId: this.middlewareId,
                  middlewareVersionId: 3,
                  namespace: this.$storeHelper.groupInfo.tag,
                  replicas: 1,
                  name: this.operation.row.name,
                  cpuRequests: this.newProps.cpu,
                  memoryRequests: this.newProps.memory
                }
              });
//              console.log(resContent);
              // updateTime is change when by this action
              await this.requestList();
              this.instanceMoreInfo = await this.getInstanceMoreInfo();
              this.expandRows = [this.operation.row.id];
              this.hideWaitingResponse(action);
              this.operation.name = null;
            } catch (err) {
              this.hideWaitingResponse(action);
              this.operation.name = null;
            }
            break;
          case 'close':
//            console.log(this.operation.name);
//            console.log(this.queueForWaitingResponse);
            this.hideWaitingResponse(this.operation.name);
            this.operation.name = null;
            break
        }
      },

      async getInstanceMoreInfo() {
        if (!this.clusterId || !this.middlewareId) {
          await this.checkBasicData4Middleware();
        }
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_middleware_instance_info_detail, {
          payload: {
            clusterId: this.clusterId,
            middlewareId: this.middlewareId,
            middlewareVersionId: 3,
            namespace: this.$storeHelper.groupInfo.tag,
            name: this.operation.row.name
          }
        });
        const cluster = resContent['cluster'];
        const spec = cluster['spec'];
        var instance = {
          status: '无运行实例',
          address: '---',
          port: '---',
          diskUsage: '---',
          disk: '---',
        };
        if (resContent['instances'].length === 0) {
//          this.$message.error('无运行实例，请联系管理员！');
//          throw new Error('无运行实例！');
        } else {
          instance = resContent['instances'][0];
        }
        const statusMap = {
          Pending: '启动中',
          Running: '运行中',
          Failed: '启动失败',
          Deleting: '删除中'
        };
        const cpu = parseInt(spec['resources']['requests']['cpu']);
        const memorySize = spec['resources']['requests']['memory'];
        return {
          name: cluster['metadata']['name'],
          address: instance['address'],
          port: instance['port'],
          userName: spec['user'],
          password: spec['password'],
          status: statusMap.hasOwnProperty(instance['status']) ? statusMap[instance['status']] : instance['status'],
          cpu,
          memory: parseInt(memorySize.substr(0, memorySize.length - 2)),
          memorySize,
          diskUsage: instance['diskUsage'] != '---' ? bytes(parseInt(instance['diskUsage'])) : '---',
          diskTotal: instance['disk'] != '---' ? bytes(parseInt(instance['disk'])) : '---'
        };
      },

      async handleTRClick(evt, action, index, row) {
        // action 'instance_more_info_refresh' does not pass param index and row
        if (row) {
          this.operation.row = row;
        }
        switch (action) {
          case 'middleware_instance_update':
            this.addToWaitingResponseQueue(action);
            try {
              const instanceStatus = await this.getInstanceMoreInfo();
//              console.log(instanceStatus);
              this.newProps.cpu = this.constants.cpuList[0];
              if (this.constants.cpuList.indexOf(instanceStatus['cpu']) > -1) {
                this.newProps.cpu = instanceStatus['cpu'];
              }
              this.newProps.memory = this.constants.memoryList[0];
              if (this.constants.memoryList.indexOf(instanceStatus['memory']) > -1) {
                this.newProps.memory = instanceStatus['memory'];
              }
              this.operation.name = action;
              this.hideWaitingResponse(action);
            } catch (err) {
              console.log(err);
              this.hideWaitingResponse(action);
            }
            break;
          case 'middleware_instance_delete':
            this.addToWaitingResponseQueue(action);
            try {
              const warningMsg = `删除mariadb实例 "${row.name}"?`;
              await this.warningConfirm(warningMsg);
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_delete, {
                payload: {
                  clusterId: this.clusterId,
                  middlewareId: this.middlewareId,
                  middlewareVersionId: 3,
                  namespace: this.$storeHelper.groupInfo.tag,
                  name: this.operation.row.name,
                }
              });
              this.$message.success(`mariadb实例 "${row.name}" 删除成功！`);
              this.hideWaitingResponse(action);
              this.requestList();
            } catch(err) {
              this.hideWaitingResponse(action);
            }
            break;
          case 'middleware_instance_start':
            this.addToWaitingResponseQueue(action);
            try {
              await this.warningConfirm(`启动mariadb实例 "${row.name}"?`);
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_start, {
                payload: {
                  clusterId: this.clusterId,
                  middlewareId: this.middlewareId,
                  middlewareVersionId: 3,
                  namespace: this.$storeHelper.groupInfo.tag,
                  name: this.operation.row.name,
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
          case 'middleware_instance_stop':
            this.addToWaitingResponseQueue(action);
            try {
              await this.warningConfirm(`停止mariadb实例 "${row.name}"?`);
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_stop, {
                payload: {
                  clusterId: this.clusterId,
                  middlewareId: this.middlewareId,
                  middlewareVersionId: 3,
                  namespace: this.$storeHelper.groupInfo.tag,
                  name: this.operation.row.name,
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