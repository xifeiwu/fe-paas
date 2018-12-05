<template>
  <div id="middleware-mariadb-backup">
    <div class="header">
      <el-button size="mini-extral"
                 type="primary"
                 @click="handleButtonClick($event, 'middleware_mariadb_backup_create')">
        <span>立即备份</span>
      </el-button>
        <el-button size="mini-extral"
                   type="primary"
                   @click="handleButtonClick($event, 'middleware_mariadb_backup_recover')">
          <span>恢复</span>
        </el-button>
          <el-button size="mini-extral"
                     type="primary"
                     @click="handleButtonClick($event, 'middleware_mariadb_backup_delete')">
            <span>删除</span>
          </el-button>
      <el-button size="mini-extral"
                 type="primary"
                 @click="handleButtonClick($event, 'middleware_mariadb_backup_refresh')">
        <span>刷新</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
      </el-button>
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
                      :value="currentBackupName"
                      @input="changeDefaultBackup"></el-radio>
          </template>
        </el-table-column>
        <el-table-column
                prop="timeStarted"
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
                    @click="handleTRClick($event, 'mariadb_backup_recover_list', scope.$index, scope.row)">恢复历史</el-button>
          </template>
        </el-table-column>
      </el-table>
      <paas-pop-in-container :popStatus="popperStatus" style="width: 500px;">
        <div slot="content">
          detail
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
  }
}
</style>
<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  import PaasPopInContainer from 'assets/components/pop-in-container';

  const STATUS_MAP = {
    Complete: '成功',
    Running: '中',
    Failed: '失败'
  };
  export default {
    mixins: [commonUtils],
    components: { PaasPopInContainer },
    async created() {
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (!dataTransfer) {
        this.$router.go(-1);
        return;
      } else {
        this.$storeHelper.dataTransfer = null;
      }
      if (dataTransfer.from !== this.$net.page['profile/middleware/mariadb']) {
        this.$router.go(-1);
        return;
      }

      const profile = 'unProduction';
      const middlewareName = 'mariadb';
      await this.$storeHelper.checkBasicData4Middleware(profile, middlewareName);

      this.clusterId = this.$storeHelper.currentMiddleware['clusterId'];
      this.middlewareId = this.$storeHelper.currentMiddleware['middlewareId'];
      this.instanceInfo = dataTransfer['data'];
    },
    mounted() {
      setTimeout(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
        this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 8;
        this.requestBackupList();
      });
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
    },
    data() {
      return {
        clusterId: null,
        middlewareId: null,
        instanceInfo: null,

        heightOfTable: 500,

        pageSize: 10,
        currentPage: 1,
        pageTotal: 0,

        backupList: [],
        currentBackupName: null,

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
            clusterId: this.clusterId,
            middlewareId: this.middlewareId,
            name: this.instanceInfo.name,
            namespace: this.$storeHelper.groupInfo.tag
          }
        });
        this.backupList = resContent['data'].filter(it => {
          return it['records'] && it['records'].length > 0;
        }).map(it => {
          const record = it['records'][0];
          record['name'] = it['name'];
          record['status'] = `备份${STATUS_MAP[record['status']]}`;
          return record;
        });
        if (this.backupList.length > 0) {
          this.currentBackupName = this.backupList[0]['name'];
        }
        console.log(this.backupList);
      },
      changeDefaultBackup(backupName) {
        this.currentBackupName = backupName;
        console.log(backupName);
      },
      async handleButtonClick(evt, action) {
        var resContent = null;
        switch (action) {
          case 'middleware_mariadb_backup_create':
            resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_create, {
              payload: {
                clusterId: this.clusterId,
                middlewareId: this.middlewareId,
                backupCluster: this.instanceInfo.name,
                namespace: this.$storeHelper.groupInfo.tag
              }
            });
//            console.log(resContent);
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
                resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_recovery_list, {
                  payload: {
                    clusterId: this.clusterId,
                    middlewareId: this.middlewareId,
                    name: this.instanceInfo.name,
                    namespace: this.$storeHelper.groupInfo.tag,
                    location: row.location
                  }
                });
//              console.log(resContent);
                setTimeout(() => {
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