<template>
  <div id="middleware-mariadb-backup" @click="handleButtonClick($event, 'click-on-page')">
    <div class="header">
      <el-button size="mini-extral"
                 type="warning"
                 @click="handleButtonClick($event, 'middleware_mariadb_backup_create')">
        <span>立即备份</span>
      </el-button>
      <el-button size="mini-extral"
                 type="danger"
                 @click="handleButtonClick($event, 'middleware_mariadb_backup_delete')">
        <span>删除</span>
      </el-button>
      <el-button size="mini-extral"
                 type="primary"
                 @click="handleButtonClick($event, 'middleware_mariadb_backup_recover')">
          <span>恢复</span>
      </el-button>
      <el-button size="mini-extral"
                 type="primary"
                 @click="handleButtonClick($event, 'middleware_mariadb_backup_refresh')">
        <span>刷新</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
      </el-button>
      <el-tooltip slot="trigger" effect="dark" placement="bottom">
        <div slot="content">
          <div v-for="(item, index) in HELP_LIST" :key="index">{{item}}</div>
        </div>
        <span class="helper-text-tool-tip" style="font-size: 12px">相关提示<i class="el-icon-question" ></i></span>
      </el-tooltip>
      <div style="display: inline-block; margin-left: 16px">
        <span style="font-weight: bold">运行环境：</span><span v-if="clusterInfo">{{clusterInfo.description}}</span>
      </div>
      <div style="display: inline-block; margin-left: 16px">
        <span style="font-weight: bold">mariadb名称：</span><span v-if="instanceInfo">{{instanceInfo.name}}</span>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="backupList"
        style="width: 100%"
        :height="heightOfTable"
      >
        <el-table-column
                label="备份实例"
                minWidth="200">
          <template slot-scope="scope">
            <el-radio :label="scope.row.name"
                      :value="selectedBackupName"
                      @input="changeDefaultBackup"></el-radio>
          </template>
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
        <el-table-column
                prop="status"
                label="状态"
                width="100"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                label="操作"
                minWidth="200"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :loading="statusOfWaitingResponse('mariadb_backup_recover_list') && action.row.name == scope.row.name"
                    :class="[false? 'disabled': 'primary']"
                    @click="handleTRClick($event, 'mariadb_backup_recover_list', scope.$index, scope.row)">
              <span>恢复历史</span><i :class="['el-icon-arrow-right', popperStatus.id == scope.row.name? 'rotate':'']"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <paas-pop-in-container :popStatus="popperStatus" style="width: 660px;" ref="pop-in-container">
        <div slot="content">
          <div class="recover-list">
            <div class="row title">
              <span class="id">还原ID</span><span class="start-time">开始时间</span><span class="complete-time">结束时间</span><span class="status">还原状态</span>
            </div>
            <template v-if="recoverList.length > 0">
              <div class="row content" v-for="(item ,index) in recoverList" :key="index">
                <span class="id">{{item.name}}</span><span class="start-time">{{item.formattedStartTime}}</span><span class="complete-time">{{item.formattedCompletedTime}}</span><span class="status">{{item.status}}</span>
              </div>
            </template>
            <div class="no-data" v-else>无数据</div>
          </div>
        </div>
      </paas-pop-in-container>
    </div>
  </div>
</template>
<style lang="scss">
#middleware-mariadb-backup {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1500px;
  background: white;
  > .header {
    padding: 3px 5px;
    font-size: 14px;
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
    .pop-in-container {
      .recover-list {
        padding: 10px 6px;
        box-sizing: border-box;
        height: 100%;
        overflow-y: scroll;
        font-size: 14px;
        line-height: 28px;
        .row {
          display: flex;
          .id {
            flex: 1;
          }
          .start-time, .complete-time {
            flex-basis: 160px;
          }
          .status {
            flex-basis: 90px;
          }
        }
        .title {
          border-bottom: 1px solid gray;
          font-weight: bold;
        }
        .content {
          border-bottom: 1px dotted gray;
        }
        .no-data {
          text-align: center;
        }
      }
    }
  }
}
</style>
<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  import PaasPopInContainer from 'assets/components/pop-in-container';
  import bytes from 'bytes';

  const HELP_LIST = [
    '每个实例最多只能备份10份数据'
  ];
  const STATUS_MAP = {
    Complete: '成功',
    Running: '中',
    Failed: '失败'
  };
  export default {
    mixins: [commonUtils],
    components: { PaasPopInContainer },
    async created() {
      this.HELP_LIST = HELP_LIST;

      var goBack = false;
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const data = dataTransfer['data'];
        switch (dataTransfer.from) {
          case this.$net.page['profile/middleware/mariadb']:
            this.clusterInfo = data['clusterInfo'];
            this.middlewareInfo = data['middlewareInfo'];
            this.instanceInfo = data['instanceInfo'];
            break;
          default:
            goBack = true;
            break;
        }
        this.$storeHelper.dataTransfer = null;
      } else {
        this.$router.go(-1);
      }

      if (goBack) {
        this.$router.go(-1);
        return;
      }

      setTimeout(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
        this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 8;
        this.requestBackupList();
      });
    },
    mounted() {
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
    },
    data() {
      return {
        clusterInfo: null,
        middlewareInfo: null,
        instanceInfo: null,

        heightOfTable: 500,

        pageSize: 10,
        currentPage: 1,
        pageTotal: 0,

        backupList: [],
        selectedBackupName: null,
        recoverList: [],

        action: {
          name: null,
          row: null,
        },

        popperStatus: {
          id: null,
          title: '恢复记录',
          visible: false
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
    methods: {
      onScreenSizeChange(size) {
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
      async requestBackupList() {
        this.backupList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_list, {
          payload: {
            clusterId: this.clusterInfo.id,
            middlewareId: this.middlewareInfo.id,
            name: this.instanceInfo.name,
            namespace: this.$storeHelper.groupInfo.tag
          }
        });
        this.backupList = resContent['data'].filter(it => {
          return it['records'] && it['records'].length > 0;
        }).map(it => {
          const record = it['records'][0];
          record['name'] = it['name'];
          record['formattedStartTime'] = this.$utils.formatDate(record.timeStarted, 'yyyy-MM-dd hh:mm:ss');
          record['status'] = `备份${STATUS_MAP[record['status']]}`;
          record['size'] = record['size'] ? bytes(record['size']) : '---';
          return record;
        }).sort((pre, next) => {
          return (pre['timeStarted'] - next['timeStarted']) * -1;
        });
        if (this.backupList.length > 0) {
          this.selectedBackupName = this.backupList[0]['name'];
        }
//        console.log(this.backupList);
      },
      changeDefaultBackup(backupName) {
        this.selectedBackupName = backupName;
//        console.log(backupName);
      },
      async handleButtonClick(evt, action) {
        var resContent = null;
        switch (action) {
          case 'click-on-page':
            var popInContainer = this.$refs['pop-in-container'].$el;
            if (popInContainer && popInContainer.contains(evt.target)) {
            } else {
              this.popperStatus.visible = false;
              this.popperStatus.id = null;
            }
            break;
          case 'middleware_mariadb_backup_create':
            if (this.backupList.length > 10) {
              this.$message.warning('每个实例最多创建10个备份！如需创建新备份，可先删除老备份。');
              return;
            }
            try {
              await this.$confirm(`确定要备份mariadb实例 "${this.instanceInfo.name}" 吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_create, {
                payload: {
                  clusterId: this.clusterInfo.id,
                  middlewareId: this.middlewareInfo.id,
                  backupCluster: this.instanceInfo.name,
                  namespace: this.$storeHelper.groupInfo.tag
                }
              });
              this.$message.success(`已提交创建备份申请，请稍后刷新页面查看备份记录`);
//              await this.requestBackupList();
            } catch (err) {
              console.log(err);
            }
            break;
          case 'middleware_mariadb_backup_delete':
            try {
//              console.log(this.selectedBackup);
//              console.log(this.action);
              if (!this.selectedBackup) {
                this.$message.error('请选择要操作的备份！');
                return;
              }
              await this.$confirm(`确定要删除备份 "${this.selectedBackup.name}" 吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_delete, {
                payload: {
                  clusterId: this.clusterInfo.id,
                  middlewareId: this.middlewareInfo.id,
                  backupCluster: this.instanceInfo['name'],
                  location: this.selectedBackup.location,
                  name: this.selectedBackup.name,
                  namespace: this.$storeHelper.groupInfo.tag
                }
              });
              this.$message.success(`备份 "${this.selectedBackup.name}" 删除成功！稍后可刷新页面查看`);
//              await this.requestBackupList();
            } catch (err) {
              console.log(err);
            }
            break;
          case 'middleware_mariadb_backup_recover':
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
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_recover, {
                payload: {
                  clusterId: this.clusterInfo.id,
                  middlewareId: this.middlewareInfo.id,
                  dataFrom: this.selectedBackup.location,
                  clusterReference: this.instanceInfo.name,
                  namespace: this.$storeHelper.groupInfo.tag
                }
              });
              this.$message.success(`已提交恢复备份 "${this.selectedBackup.name}" ，稍后可在恢复历史中查看`);
            } catch (err) {
              console.log(err);
            }
            break;
          case 'middleware_mariadb_backup_refresh':
            try {
              await this.requestBackupList();
            } catch(err) {
              console.log(err);
            }
            break;
        }
      },
      async handleTRClick(evt, action, index, row) {
        this.action.name = action;
        this.action.row = row;
        var resContent = null;
        switch (action) {
          case 'mariadb_backup_recover_list':
            var toOpenPopper = !((this.popperStatus.id === row.name) && this.popperStatus.visible);
            this.popperStatus.visible = false;
            if (toOpenPopper) {
              this.addToWaitingResponseQueue(action);
              try {
                this.recoverList = [];
                resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_recovery_list, {
                  payload: {
                    clusterId: this.clusterInfo.id,
                    middlewareId: this.middlewareInfo.id,
                    name: this.instanceInfo.name,
                    namespace: this.$storeHelper.groupInfo.tag,
                    location: row.location
                  }
                });
                setTimeout(() => {
                  this.recoverList = resContent['data'].filter(it => {
                    return it['records'] && it['records'].length > 0;
                  }).map(it => {
                    const record = it['records'][0];
                    record['name'] = it['name'];
                    record['status'] = `还原${STATUS_MAP[record['status']]}`;
                    record['formattedStartTime'] = this.$utils.formatDate(record.timeStarted, 'yyyy-MM-dd hh:mm:ss');
                    record['formattedCompletedTime'] = this.$utils.formatDate(record.timeCompleted, 'yyyy-MM-dd hh:mm:ss');
                    return record;
                  });
//                  console.log(this.recoverList);
//                  this.recoverList = this.recoverList.concat(this.recoverList);
//                  this.recoverList = this.recoverList.concat(this.recoverList);
//                  this.recoverList = this.recoverList.concat(this.recoverList);
//                  this.recoverList = this.recoverList.concat(this.recoverList);
//                  this.recoverList = this.recoverList.concat(this.recoverList);
                  this.hideWaitingResponse(action);
                  this.popperStatus.visible = true;
                  this.popperStatus.id = row.name;
                }, 100);
              } catch(err) {
                this.hideWaitingResponse(action);
              }
            }
            break;
        }
      }
    }
  }
</script>