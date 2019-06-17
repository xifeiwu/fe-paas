<template>
  <div id="middleware-mysql">
    <el-row class="operation">
      <el-col :span="2">
        <el-button size="mini"
                   type="default"
                   @click="handleButtonClick($event, 'middleware_mariadb_backup_list')">
          <span>备份列表</span>
        </el-button>
      </el-col>

      <el-col :span="19">
        <el-button size="mini"
                   type="primary"
                   :class="{'flex': true, 'disabled': $storeHelper.permission['middleware_mariadb_instance_create'].disabled}"
                   @click="handleButtonClick($event, 'middleware_mariadb_instance_create')">
          <span>申请服务</span>
        </el-button>

        <!--<el-button size="mini"-->
                   <!--disabled-->
                   <!--type="primary"-->
                   <!--:class="{'flex': true, 'disabled': $storeHelper.permission['middleware_mariadb_instance_create'].disabled}"-->
                   <!--@click="handleButtonClick($event, '')">-->
          <!--<span>数据迁移</span>-->
        <!--</el-button>-->
      </el-col>

      <el-col :span="3">
        <el-button size="mini"
                   type="primary"
                   style="float: right;"
                   @click="handleButtonClick($event, 'refreshList')">
          <span>&nbsp;&nbsp;&nbsp;&nbsp;刷新&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </el-button>

      </el-col>
    </el-row>

    <el-row class="header">
      <el-tabs type="border-tab" v-model="profileName" :class="[profileName]">
        <el-tab-pane v-for="item in unProductionClusterList" :label="item.description" :name="item.clusterName"
                     :key="item.clusterName"></el-tab-pane>
      </el-tabs>

    </el-row>
    <el-row class="list">
      <el-table :data="instanceList"
                :row-key="getRowKeys"
                :expand-row-keys="expandRows"
                @sort-change="onSortChangeInTable"
                :defaultSort="tableSort"
                stripe
                :height="heightOfTable">
        <el-table-column label="服务名称" prop="name" headerAlign="center" align="center" width="150">
        </el-table-column>
        <el-table-column label="运行实例" prop="mariaStatus" headerAlign="center" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.mariaStatus.ins + " / " + scope.row.mariaStatus.replicas }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建者" prop="realName" headerAlign="center" align="center" width="80">
        </el-table-column>
        <el-table-column label="创建时间" prop="formattedCreateTime" headerAlign="center" align="center" width="90"
                         sortable="custom">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="formattedUpdateTime" headerAlign="center" align="center" width="90"
                         sortable="custom">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedUpdateTime)">
              <div v-for="(item, index) in scope.row.formattedUpdateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedUpdateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="剩余有效天数" prop="remainingDays" headerAlign="center" align="center" width="100">
          <template slot-scope="scope">
            <span>{{(scope.row.remainingDays >= 0) ? scope.row.remainingDays + '天' : '已失效'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="运行状态" headerAlign="center" align="center" minWidth="80">
          <template slot-scope="scope">
            <span>{{scope.row.mariaStatus.status}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operation" headerAlign="center" align="center" minWidth="150">
          <template slot-scope="scope">
            <el-row>
              <el-col :span="24">
                <el-button
                        type="text"
                        :class="$storeHelper.permission['middleware_mariadb_instance_update'].disabled ? 'disabled' : 'warning'"
                        :loading="statusOfWaitingResponse('middleware_mariadb_instance_update') && action.row.id == scope.row.id"
                        @click="handleTRClick($event, 'middleware_mariadb_instance_update', scope.$index, scope.row)">变更规格</el-button>
                <div class="ant-divider"></div>
                <el-button
                        type="text"
                        :class="$storeHelper.permission['middleware_mariadb_instance_update_config'].disabled ? 'disabled' : 'warning'"
                        :loading="statusOfWaitingResponse('middleware_mariadb_instance_update_config') && action.row.id == scope.row.id"
                        @click="handleTRClick($event, 'middleware_mariadb_instance_update_config', scope.$index, scope.row)">
                  <span>修改配置</span><i class="paas-icon-level-up"></i>
                </el-button>
                <div class="ant-divider"></div>
                <el-button
                        type="text"
                        :class="$storeHelper.permission['middleware_mariadb_instance_delete'].disabled ? 'disabled' : 'danger'"
                        :loading="statusOfWaitingResponse('middleware_mariadb_instance_delete') && action.row.id == scope.row.id"
                        @click="handleTRClick($event, 'middleware_mariadb_instance_delete', scope.$index, scope.row)">删除</el-button>
                <div class="ant-divider"></div>
                <el-button
                        type="text"
                        :class="$storeHelper.permission['middleware_mariadb_instance_start'].disabled ? 'disabled' : 'warning'"
                        :loading="statusOfWaitingResponse('middleware_mariadb_instance_start') && action.row.id == scope.row.id"
                        v-if="scope.row.mariaStatus.status != '运行中'"
                        @click="handleTRClick($event, 'middleware_mariadb_instance_start', scope.$index, scope.row)">启动</el-button>
                <div class="ant-divider" v-if="scope.row.mariaStatus.status != '运行中'"></div>
                <el-button
                        type="text"
                        :class="$storeHelper.permission['middleware_mariadb_instance_stop'].disabled ? 'disabled' : 'warning'"
                        :loading="statusOfWaitingResponse('middleware_mariadb_instance_stop') && action.row.id == scope.row.id"
                        v-if="scope.row.mariaStatus.status == '运行中'"
                        @click="handleTRClick($event, 'middleware_mariadb_instance_stop', scope.$index, scope.row)">停止</el-button>
                <div class="ant-divider" v-if="scope.row.mariaStatus.status == '运行中'"></div>
              </el-col>
              <el-col :span="24">
                <el-button
                        type="text"
                        :class="['flex', false ? 'disabled' : 'primary']"
                        :loading="statusOfWaitingResponse('middleware_mariadb_backup_create') && action.row.id == scope.row.id"
                        @click="handleTRClick($event, 'middleware_mariadb_backup_create', scope.$index, scope.row)">
                  <span>备份</span>

                </el-button>
                <div class="ant-divider"></div>
                <el-button
                        type="text"
                        :class="['flex', false ? 'disabled' : 'primary']"
                        :loading="statusOfWaitingResponse('middleware_mariadb_restore_create') && action.row.id == scope.row.id"
                        @click="handleTRClick($event, 'middleware_mariadb_restore_create', scope.$index, scope.row)">
                  <span>恢复</span>
                </el-button>
                <div class="ant-divider"></div>
                <!--<el-button-->
                        <!--type="text"-->
                        <!--disabled-->
                        <!--:loading="statusOfWaitingResponse('') && action.row.id == scope.row.id"-->
                        <!--@click="handleTRClick($event, '', scope.$index, scope.row)">-->
                  <!--<span>实例列表</span>-->
                <!--</el-button>-->
                <!--<div class="ant-divider"></div>-->
                <el-button
                        type="text"
                        :loading="statusOfWaitingResponse('go-to-page-history') && action.row.id == scope.row.id"
                        @click="handleTRClick($event, 'go-to-page-history', scope.$index, scope.row)">
                  <span>操作历史</span>
                </el-button>
                <div class="ant-divider"></div>
                <el-button
                        class="primary" type="text"
                        :loading="statusOfWaitingResponse('instance_more_info') && action.row.id == scope.row.id"
                        @click="handleTRClick($event, 'instance_more_info', scope.$index, scope.row)">
                  <span>服务配置</span>
                  <i :class="{'el-icon-arrow-right': true, 'expand': expandRows.indexOf(scope.row.id) > -1}"></i>
                </el-button>
                <!--<el-button type="text" -->
                           <!--:class="['flex', false ? 'disabled' : 'primary']" -->
                           <!--:loading="statusOfWaitingResponse('go-to-page-backup') && action.row.id == scope.row.id" -->
                           <!--@click="handleTRClick($event, 'go-to-page-backup', scope.$index, scope.row)">-->
                  <!--<span>原有恢复列表</span>-->
                <!--</el-button>-->
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         width="0">
          <template slot-scope="scope">
            <div class="row-expand">
              <!--<i :class="['el-icon', 'el-icon-refresh',  statusOfWaitingResponse('instance_more_info_refresh') ? 'loading':'']"-->
                 <!--@click="handleTRClick($event, 'instance_more_info_refresh')"></i>-->
              <el-form label-position="right" label-width="160px" inline size="mini" class="message-show">
                <el-form-item label="服务地址:">
                  <span class="secret">
                    <span>{{instanceMoreInfo.address}}</span><i v-if="instanceMoreInfo.address !== '---'"
                                                                class="paas-icon-copy"
                                                                v-clipboard:copy="instanceMoreInfo.address"
                                                                v-clipboard:success="handleSuccessCopy"></i>
                  </span><span>:</span><span class="secret">
                    <span>{{instanceMoreInfo.port}}</span><i v-if="instanceMoreInfo.port !== '---'"
                                                             class="paas-icon-copy"
                                                             v-clipboard:copy="instanceMoreInfo.port"
                                                             v-clipboard:success="handleSuccessCopy"></i>
                  </span>
                </el-form-item>
                <el-form-item label="服务类型:">
                  {{scope.row.mariaStatus.image}}
                </el-form-item>
                <el-form-item label="数据库名称:">
                  {{instanceMoreInfo.databaseName}}
                </el-form-item>
                <el-form-item label="实例状态:">
                  {{instanceMoreInfo.status}}
                </el-form-item>
                <el-form-item label="CPU/内存:">
                  {{instanceMoreInfo.cpu + '核/' + instanceMoreInfo.memory + 'G'}}
                </el-form-item>
                <el-form-item label="已用/总磁盘空间:">
                  {{instanceMoreInfo.diskUsage + '/' + instanceMoreInfo.disk}}
                </el-form-item>
                <el-form-item label="用户名:">
                  <span class="secret">
                    <span>{{instanceMoreInfo.userName}}</span>
                    <i v-if="instanceMoreInfo.userName !== '---'"
                      class="paas-icon-copy"
                      v-clipboard:copy="instanceMoreInfo.userName"
                      v-clipboard:success="handleSuccessCopy"></i>
                  </span>
                </el-form-item>
                <el-form-item label="密码:">
                  <span class="secret">
                    <span>{{instanceMoreInfo.password}}</span>
                    <i v-if="instanceMoreInfo.password !== '---'"
                     class="paas-icon-copy"
                     v-clipboard:copy="instanceMoreInfo.password"
                     v-clipboard:success="handleSuccessCopy"></i>
                  </span>
                </el-form-item>
                <el-form-item label="备注:">
                  {{scope.row.instanceDescribe}}
                </el-form-item>
              </el-form>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="更改实例规格" :visible="action.name == 'middleware_mariadb_instance_update'"
               :close-on-click-modal="false"
               @close="handleDialogButtonClick('close')"
               class="middleware_mariadb_instance_update size-500"
               v-if="action.name && action.row"
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
                     @click="handleDialogButtonClick('middleware_mariadb_instance_update')"
                     :loading="statusOfWaitingResponse('middleware_mariadb_instance_update')">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="handleDialogButtonClick('close')">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="创建备份" :visible="action.name == 'middleware_mariadb_backup_create'"
               width="30%"
               :close-on-click-modal="false"
               @close="handleDialogButtonClick('close')"
               v-if="action.name && action.row"
    >
      <el-form :model="backupCreate" size="mini" >
        <el-form-item label="备份描述:" prop="backupDescribe" label-width='120px' >
          <el-col :span="18">
            <el-input v-model="backupCreate.backupDescribe" size="mini" type="textarea" :maxlength='63'></el-input>
          </el-col>
        </el-form-item>
        <!--<el-form-item label="可恢复范围:" prop="groupScope" label-width='120px'>-->
          <!--<el-radio-group v-model="backupCreate.groupScope" label=false size="mini">-->
            <!--<el-radio label='onlyGroup' size="small">仅团队内</el-radio>-->
            <!--<el-radio label='groupScope' size="small">所有与团队</el-radio>-->
          <!--</el-radio-group>-->
        <!--</el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogButtonClick('middleware_mariadb_backup_create')"
                     :loading="statusOfWaitingResponse('middleware_mariadb_backup_create')">备&nbsp份</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="handleDialogButtonClick('close')">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="请选择备份进行恢复" :visible="action.name == 'middleware_mariadb_restore_create'"
               width="50%"
               :close-on-click-modal="false"
               @close="handleDialogButtonClick('close')"
               v-if="action.name && action.row"
    >
      <div class="main">
        <el-table
                :data="backupList"
                style="width: 100%"
        >
          <el-table-column
                  label="备份名称"
                  headerAlign="center"
                  minWidth="160">
            <template slot-scope="scope">
              <el-radio :label="scope.row.name"
                        :value="selectedBackupName"
                        @input="changeDefaultBackup"></el-radio>
            </template>
          </el-table-column>
          <el-table-column
                  prop="description"
                  label="备份描述"
                  minWidth="160"
                  headerAlign="center" align="center">
          </el-table-column>
          <el-table-column
                  prop="operator"
                  label="创建者"
                  width="100"
                  headerAlign="center" align="center">
          </el-table-column>
          <el-table-column
                  prop="formattedStartTime"
                  label="备份时间"
                  width="160"
                  headerAlign="center" align="center">
          </el-table-column>
          <el-table-column
                  prop="size"
                  label="备份大小"
                  width="100"
                  headerAlign="center" align="center">
          </el-table-column>
          <!--<el-table-column-->
                  <!--prop="status"-->
                  <!--label="状态"-->
                  <!--width="100"-->
                  <!--headerAlign="center" align="center">-->
          <!--</el-table-column>-->
        </el-table>

      </div>

      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogButtonClick('middleware_mariadb_restore_create')"
                     :loading="statusOfWaitingResponse('middleware_mariadb_restore_create')">恢&nbsp复</el-button>
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
  .operation {
    padding: 16px 8px 24px 0px;
    /*text-align: right;*/
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .header {
    background: white;
    /*display: flex;*/
    font-size: 14px;
    /*margin-bottom: 5px;*/
    .el-tabs {
      /*border-right: 1px solid #dfe4ed;*/
      &.el-tabs--border-tab {
        background-color: #f4f5f5;
        #tab-fpdev.is-active {
          border-color: $g-env-fpdev-color;
          color: $g-env-fpdev-color;
        }
        #tab-test.is-active {
          border-color: $g-env-test-color;
          color: $g-env-test-color;
        }
        #tab-performance.is-active {
          border-color: $g-env-performance-color;
          color: $g-env-performance-color;
        }
        #tab-beta.is-active {
          border-color: $g-env-beta-color;
          color: $g-env-beta-color;
        }
        #tab-production.is-active {
          border-color: $g-env-production-color;
          color: $g-env-production-color;
        }
        #tab-staging.is-active {
          border-color: $g-env-production-color;
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
  }
  .list {
    background: white;
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
        .paas-icon-copy {
          margin: 0px 2px;
          &:hover {
            color: #409EFF;
            cursor: pointer;
          }
        }
        .el-form {
          .el-form-item {
            box-sizing: border-box;
            width: calc(50% - 2px);
            &.big {
              .el-form-item__content {
                margin-left: 160px;
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
  .el-dialog {
    .el-dialog__body {
      .el-table__row {
        .el-radio {
          display: flex;
          .el-radio__label {
            white-space: normal;
          }
        }
      }
    }
  }
  > .main {
    position: relative;
    .el-table {
      .el-icon-arrow-right {
        transition: transform 0.2s ease-in-out;
        &.rotate {
          transform: rotate(180deg);
        }
      }
    }
  }
}
</style>
<script>
  import bytes from 'bytes';
  import commonUtils from 'assets/components/mixins/common-utils';

  const STATUS_MAP = {
    Complete: '成功',
    Running: '中',
    Failed: '失败'
  };
  const MIDDLEWARE_NAME = 'mariadb';
  const NO_INSTANCES = {'ins': 0, 'replicas': 0};
  module.exports = {
    mixins: [commonUtils],
    async created() {
      // request for clusterList
//      await this.checkBasicData4Middleware(null);
      // will request list at change of profileName
//      await this.requestInstanceList();
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

        backupCreate: {
          backupDescribe: '',
          groupScope: 'onlyGroup',
        },
        backupList: [],
        selectedBackupName: null,
        backupRestore: {
          dataFrom: '',
          clusterReference: '',
        },

        tableSort: {
          prop: 'formattedCreateTime',
          order: 'descending',
        }
      }
    },
    computed: {
      selectedBackup() {
        var result = null;
        this.backupList.some(it => {
          if (it.name == this.selectedBackupName) {
            result = it;
          }
        });
        return result;
      }
    },
    watch: {
      '$storeHelper.clusterList': 'onClusterList',
      '$storeHelper.screen.size': 'onScreenSizeChange',
      '$storeHelper.groupInfo.id': function () {
        this.requestInstanceList();
        this.expandRows = [];
      },
      'profileName': async function(profileName) {
        // value of elTab is set to '0' by default
        if (profileName == '0') {
          return;
        }
        this.expandRows = [];
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
      async requestBackupList() {
        this.backupList = [];
        var middlewareService = this.action.row;
        // console.log(row);
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_list, {
          payload: {
            clusterId: this.clusterInfo.id,
            middlewareId: this.middlewareInfo.id,
            name: middlewareService.name,
            namespace: this.$storeHelper.groupInfo.tag
          }
        });
        this.backupList = resContent['data'].filter(it => {
          return it['records'] && it['records'].length > 0;
        }).map(it => {
          const record = it['records'][0];
          record['name'] = it['name'];
          record['description'] = it['describe'];
          if (it['operatorRealName'] === null && it['operator'] === null) {
            record['operator'] = '---';
          } else {
            record['operator'] = it['operatorRealName'] ? it['operatorRealName'] : it['operator'];
          }
          record['formattedStartTime'] = this.$utils.formatDate(record.timeStarted, 'yyyy-MM-dd hh:mm:ss');
          record['status'] = `备份${STATUS_MAP[record['status']]}`;
          record['size'] = record['size'] ? bytes(parseInt(record['size'])) : '---';
          return record;
        }).sort((pre, next) => {
          return (pre['timeStarted'] - next['timeStarted']) * -1;
        });
        if (this.backupList.length > 0) {
          this.selectedBackupName = this.backupList[0]['name'];
        }
       // console.log(this.backupList);
      },
      changeDefaultBackup(backupName) {
        this.selectedBackupName = backupName;
       // console.log(backupName);
      },
      // check if all necessary data is get
      async checkBasicData4Middleware() {
        if (!this.profileName) {
          return;
        }
        await this.$storeHelper.checkBasicData4Middleware(this.profileName, MIDDLEWARE_NAME);
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
          Object.assign({}, this.$net.URL_LIST.middleware_middleware_instance_info_maria, {
            withTimeStamp: true
          }), {
          payload: {
            clusterId: this.clusterId,
            middlewareId: this.middlewareId,
            groupId: this.$storeHelper.currentGroupID
          }
        });
        const instanceList = content;
        instanceList.forEach(it => {
          it.formattedCreateTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss').split(' ');
          it.formattedUpdateTime = this.$utils.formatDate(it.updateTime, 'yyyy-MM-dd hh:mm:ss').split(' ');

          it.remainingDays = '---';
          if (it.hasOwnProperty('expiredTime')) {
            it.remainingDays = this.$utils.getDaysInterval(timeStamp, parseInt(it.expiredTime));
          }
          if(!it.instanceDescribe) {
            it.instanceDescribe = '';
          }

          if (it.mariaStatus && it.mariaStatus.instances) {
            let ins = it.mariaStatus.instances;
            if (ins && ins.length > 0) {
              let num = 0;
              for (var i in ins){
                if (ins[i].status === 'Running') {
                  num++;
                }
              }
              it.mariaStatus.ins = num;
            } else {
              it.mariaStatus.ins = 0;
            }
            if (it.mariaStatus.status === '运行失败') {
              it.mariaStatus.status = it.mariaStatus.status + "(" + it.mariaStatus.instances[0].conditionsMessage + ")";
            }
          } else {
          	it.mariaStatus = NO_INSTANCES;
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
          case 'middleware_mariadb_instance_create':
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/middleware/mariadb'],
              data: {
                clusterInfo: this.clusterInfo,
                middlewareInfo: this.middlewareInfo,
              }
            };
            this.$router.push(this.$net.page['profile/middleware/mariadb/add']);
            break;
	        case 'middleware_mariadb_backup_list':
		        this.$storeHelper.dataTransfer = {
			        from: this.$net.page['profile/middleware/mariadb'],
			        data: {
				        clusterInfo: this.clusterInfo,
				        middlewareInfo: this.middlewareInfo,
			        }
		        };
		        this.$router.push(this.$net.page['profile/middleware/mariadb/backup-list']);
		        break;
          case 'refreshList':
            this.expandRows = [];
            this.requestInstanceList();
            break;
        }
      },

      async handleDialogButtonClick(action) {
        switch (action) {
          case 'middleware_mariadb_instance_update':
            this.addToWaitingResponseQueue(action);
            try {
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_update, {
                payload: {
                  clusterId: this.clusterId,
                  middlewareId: this.middlewareId,
                  middlewareVersionId: 3,
                  namespace: this.$storeHelper.groupInfo.tag,
                  replicas: 1,
                  name: this.action.row.name,
                  cpuRequests: this.newProps.cpu,
                  memoryRequests: this.newProps.memory
                }
              });
//              console.log(resContent);
              // updateTime is change when by this action
              await this.requestInstanceList();
              // this.instanceMoreInfo = await this.getInstanceMoreInfo();
              this.instanceMoreInfo = this.checkInstanceInfo(row.mariaStatus);
              if (!this.instanceMoreInfo) {
                throw new Error('instanceMoreInfo is null');
              }
              this.expandRows = [this.action.row.id];
              this.hideWaitingResponse(action);
              this.action.name = null;
            } catch (err) {
              console.log(err);
              this.hideWaitingResponse(action);
              this.action.name = null;
            }
            break;
          case 'middleware_mariadb_backup_create':

            // if (this.backupList.length > 10) {
            //   this.$message.warning('每个实例最多创建10个备份！如需创建新备份，可先删除老备份。');
            //   return;
            // }
            
            this.addToWaitingResponseQueue(action);
            try {
              await this.$confirm(`确定要备份mariadb服务 "${this.action.row.name}" 吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              let serviceType = '';
              if (this.action.row.mariaStatus) {
	              serviceType = this.action.row.mariaStatus.image;
              }
              let resp = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_create, {
                payload: {
                  clusterId: this.action.row.clusterId,
                  middlewareId: this.action.row.middlewareId,
                  backupCluster: this.action.row.name,
                  backupDescribe: this.backupCreate.backupDescribe,
                  groupScope: this.backupCreate.groupScope,
	                middlewareVersion: serviceType,
                  namespace: this.action.row.namespace
                }
              });
              console.log(resp);
              if (resp.type === 'error') {
                this.$message.warning(resp.message);
                this.hideWaitingResponse(action);
                this.action.name = null;
              } else {
                this.$message.success(`已提交创建备份申请，请稍后刷新备份列表查看备份记录`);
                this.hideWaitingResponse(action);
                this.action.name = null;
                this.backupCreate.backupDescribe = '';
              }
            } catch (err) {
              console.log(err);
              this.$message.warning(err.code);
              this.hideWaitingResponse(action);
              this.action.name = null;
            }
            break;
          case 'middleware_mariadb_restore_create':
            try {
              if (!this.selectedBackup) {
                this.$message.error('请选择要操作的备份！');
                return;
              }
              if (!this.selectedBackup.location) {
                this.$message.error('未找到备份地址！');
                return;
              }
              await this.$confirm(`确定要恢复备份 "${this.selectedBackup.name}" 吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              let resp = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_restore, {
                payload: {
                  clusterId: this.action.row.clusterId,
                  middlewareId: this.action.row.middlewareId,
                  dataFrom: this.selectedBackup.location,
                  clusterReference: this.action.row.name,
                  namespace: this.$storeHelper.groupInfo.tag
                }
              });
              if (resp.type === 'error') {
                this.$message.warning(resp.message);
              } else {
                this.$message.success(`已提交恢复备份 "${this.selectedBackup.name}" ，稍后可在恢复历史中查看`);
              }
            } catch (err) {
              console.log(err);
            }
            this.action.name = null;
            break;
          case 'close':
//            console.log(this.action.name);
//            console.log(this.queueForWaitingResponse);
            this.hideWaitingResponse(this.action.name);
            this.action.name = null;
            break
        }
      },

      async getInstanceMoreInfo() {
        if (!this.clusterId || !this.middlewareId) {
          await this.checkBasicData4Middleware();
        }
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_more_info, {
          payload: {
            clusterId: this.clusterId,
            middlewareId: this.middlewareId,
            middlewareVersionId: 3,
            namespace: this.$storeHelper.groupInfo.tag,
            name: this.action.row.name
          }
        });

        if (resContent['instances'].length === 0) {
          this.$message.error('无运行实例，请联系管理员！');
          return null;
        }
        var instance = resContent['instances'][0];
        instance['name'] = resContent['name'];
        ['name', 'databaseName', 'address', 'port', 'user', 'password', 'status', 'cpu', 'diskUsage', 'disk', 'memory'].forEach(it => {
          if (null == instance[it]) {
            instance[it] = '---';
          }
        });

        const statusMap = {
          Pending: '启动中',
          Running: '运行中',
          Failed: '启动失败',
          Stopping: '停止',
          Deleting: '删除中'
        };
//        const cpu = parseInt(spec['resources']['requests']['cpu']);
        const memorySize = instance['memory'];
        return {
          name: instance['name'],
          dbName: instance['databaseName'],
          address: instance['address'],
          port: instance['port'],
          userName: instance['user'],
          password: instance['password'],
          status: statusMap.hasOwnProperty(instance['status']) ? statusMap[instance['status']] : instance['status'],
          cpu: instance['cpu'],
          memorySize: memorySize,
          memory: memorySize == '---' ? memorySize : parseInt(memorySize.substr(0, memorySize.length - 2)),
          diskUsage: instance['diskUsage'] != '---' ? bytes(parseInt(instance['diskUsage'])) : '---',
          diskTotal: instance['disk'] != '---' ? bytes(parseInt(instance['disk'])) : '---'
        };
      },

      checkInstanceInfo(resContent) {

        if (resContent['instances'].length === 0) {
          this.$message.error('无运行实例，请联系管理员！');
          return null;
        }
        var instance = resContent['instances'][0];
        instance['name'] = resContent['name'];
        ['name', 'databaseName', 'address', 'port', 'user', 'password', 'status', 'cpu', 'diskUsage', 'disk', 'memory'].forEach(it => {
          if (null == instance[it]) {
            instance[it] = '---';
          }
        });

        const statusMap = {
          Pending: '启动中',
          Running: '运行中',
          Failed: '启动失败',
          Stopping: '停止',
          Deleting: '删除中'
        };

        const memorySize = instance['memory'];
        return {
          name: instance['name'],
          databaseName: instance['databaseName'],
          address: instance['address'],
          port: instance['port'],
          userName: instance['user'],
          password: instance['password'],
          status: statusMap.hasOwnProperty(instance['status']) ? statusMap[instance['status']] : instance['status'],
          cpu: instance['cpu'],
          memorySize: memorySize,
          memory: memorySize == '---' ? memorySize : parseInt(memorySize.substr(0, memorySize.length - 2)),
          diskUsage: instance['diskUsage'] != '---' ? bytes(parseInt(instance['diskUsage'])) : '---',
          disk: instance['disk'] != '---' ? bytes(parseInt(instance['disk'])) : '---'
        };
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
          case 'middleware_mariadb_instance_update':
            this.addToWaitingResponseQueue(action);
            try {
              // const instanceStatus = await this.getInstanceMoreInfo();
              const instanceStatus= this.checkInstanceInfo(row.mariaStatus);
              if (!instanceStatus) {
                throw new Error('instanceMoreInfo is null');
              }
              this.newProps.cpu = this.constants.cpuList[0];
              if (this.constants.cpuList.indexOf(instanceStatus['cpu']) > -1) {
                this.newProps.cpu = instanceStatus['cpu'];
              }
              this.newProps.memory = this.constants.memoryList[0];
              if (this.constants.memoryList.indexOf(instanceStatus['memory']) > -1) {
                this.newProps.memory = instanceStatus['memory'];
              }
              this.action.name = action;
              this.hideWaitingResponse(action);
            } catch (err) {
              console.log(err);
              this.hideWaitingResponse(action);
            }
            break;
          case 'middleware_mariadb_instance_update_config':
            try {
//              const moreInfo = await this.getInstanceMoreInfo();
//              console.log(moreInfo);
//              console.log(row);
              this.$storeHelper.dataTransfer = {
                from: this.$net.page['profile/middleware/mariadb'],
                data: {
                  clusterInfo: this.clusterInfo,
                  middlewareInfo: this.middlewareInfo,
                  name: this.action.row.name,
                  instanceDescribe: this.action.row.instanceDescribe,
                  remainingDays: this.action.row.remainingDays < 1 ? 1 : this.action.row.remainingDays,
                }
              };
              this.$router.push(this.$net.page['profile/middleware/mariadb/modify']);
            } catch (err) {
              console.log(err);
            }
            break;
          case 'middleware_mariadb_instance_delete':
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
          case 'middleware_mariadb_instance_start':
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
//               this.instanceMoreInfo = await this.getInstanceMoreInfo();
              this.instanceMoreInfo = this.checkInstanceInfo(row.mariaStatus);
              if (!this.instanceMoreInfo) {
                throw new Error('instanceMoreInfo is null');
              }
            } catch(err) {
              this.hideWaitingResponse(action);
            }
            break;
          case 'middleware_mariadb_instance_stop':
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
              // this.instanceMoreInfo = await this.getInstanceMoreInfo();
              this.instanceMoreInfo = this.checkInstanceInfo(row.mariaStatus);
              if (!this.instanceMoreInfo) {
                throw new Error('instanceMoreInfo is null');
              }
//              this.expandRows = [];
            } catch(err) {
              this.hideWaitingResponse(action);
            }
            break;
          case 'instance_more_info_refresh':
            this.addToWaitingResponseQueue(action);
            try {
              // this.instanceMoreInfo = await this.getInstanceMoreInfo();
              this.instanceMoreInfo = this.checkInstanceInfo(row.mariaStatus);
              if (!this.instanceMoreInfo) {
                throw new Error('instanceMoreInfo is null');
              }
              setTimeout(() => {
                this.hideWaitingResponse(action);
              }, 1000);
              this.expandRows = [];
            } catch(err) {
              console.log(err);
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
              // this.addToWaitingResponseQueue(action);
              try {
                // this.instanceMoreInfo = await this.getInstanceMoreInfo();
                this.instanceMoreInfo = this.checkInstanceInfo(row.mariaStatus);
                if (!this.instanceMoreInfo) {
                  throw new Error('instanceMoreInfo is null');
                }
                this.expandRows = [key];
                // this.hideWaitingResponse(action);
              } catch(err) {
                console.log(err);
                // this.hideWaitingResponse(action);
              }
            }
            break;
          case 'go-to-page-backup':
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/middleware/mariadb'],
              data: {
                clusterInfo: this.clusterInfo,
                middlewareInfo: this.middlewareInfo,
                instanceInfo: row
              }
            };
            this.$router.push(this.$net.page['profile/middleware/mariadb/backup']);
            break;
          case 'go-to-page-history':
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/middleware/mariadb'],
              data: {
                clusterInfo: this.clusterInfo,
                middlewareInfo: this.middlewareInfo,
                instanceInfo: row
              }
            };
            this.$router.push(this.$net.page['profile/middleware/mariadb/history']);
            break;
          case 'middleware_mariadb_backup_create':
            this.action.name = action;
            break;
          case 'middleware_mariadb_restore_create':
            this.action.name = action;
            try {
              await this.requestBackupList();
            } catch(err) {
              console.log(err);
            }
            break;
          default:
            // console.log(action);
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
      },

      handleSuccessCopy(evt) {
        this.$storeHelper.globalTip.show({
          ref: evt.trigger,
          msg: '复制成功'
        });
      },
    }
  }
</script>