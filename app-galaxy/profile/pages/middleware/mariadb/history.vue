<template>
  <div id="middleware-mariadb-history">
    <div class="history-title">
      <span> {{instanceInfo.name}}操作历史</span>
      <el-button size="mini-extral"
                 type="primary"
                 @click="handleButtonClick($event, 'middleware_mariadb_history_refresh')">
        <span>刷新</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
      </el-button>
    </div>
    <div class="main">
      <el-row :gutter="20">
        <el-col :span="13">
          <div class="title">
            <label v-if="selectedRecoverName" style="font-size: 16px">{{selectedRecoverName}}:</label>
            <span style="margin-left: 5px;top: 2px;">备份历史（{{backupListFilter.length}}）</span>
            <el-button size="mini"
                       type="text"
                       v-if="selectedRowType && selectedRowType === 'backup'"
                       @click="deselect()">
              <span>取消选中</span>
            </el-button>
          </div>
          <el-table
                  ref="singleTable"
                  highlight-current-row
                  :data="backupListFilter"
                  :default-sort = "{prop: 'formattedEndTime', order: 'descending'}"
                  :height="heightOfTable"
          >
            <el-table-column
                    label="备份名称"
                    minWidth="100"
                    header-align="center">
              <template slot-scope="scope">
                <el-radio
                    :label="scope.row.name"
                    :value="selectedBackupName"
                    @input="backupNameChange">
                </el-radio>
              </template>
            </el-table-column>
            <el-table-column
                    prop="describe"
                    label="备份描述"
                    width="120">
            </el-table-column>
            <el-table-column
                    prop="formattedStartTime"
                    label="操作时间"
                    width="100"
                    sortable
                    headerAlign="center" align="center">
              <template slot-scope="scope">
                {{scope.row.formattedStartTimeYMD}}<br/>
                {{scope.row.formattedStartTimeHMS}}
              </template>
            </el-table-column>
            <el-table-column
                    prop="formattedEndTime"
                    label="结束时间"
                    width="100"
                    sortable
                    headerAlign="center" align="center">
              <template slot-scope="scope">
                {{scope.row.formattedEndTimeYMD}}<br/>
                {{scope.row.formattedEndTimeHMS}}
              </template>
            </el-table-column>
            <el-table-column
                    prop="operatorRealName"
                    label="操作人"
                    width="80"
                    headerAlign="center" align="center">
            </el-table-column>
            <el-table-column
                    prop="status"
                    label="状态"
                    width="80"
                    headerAlign="center" align="center">
            </el-table-column>
          </el-table>
        </el-col>
        <!--<el-col :span="1">>></el-col>-->
        <el-col :span="11">
          <div class="title">
            <label v-if="selectedBackupName" style="font-size: 16px">{{selectedBackupName}} :</label>
            <span style="margin-left: 5px;top: 2px;">恢复历史（{{recoverListFilter.length}}）</span>
            <el-button size="mini"
                       type="text"
                       v-if="selectedRowType && selectedRowType === 'recover'"
                       @click="deselect()">
              <span>取消选中</span>
            </el-button>
          </div>
          <el-table
                  ref="singleTable"
                  :data="recoverListFilter"
                  :height="heightOfTable"
                  highlight-current-row
                  :default-sort = "{prop: 'formattedEndTime', order: 'descending'}"
          >
            <el-table-column
                    label="恢复名称"
                    minWidth="100"
                    header-align="center">
                <template slot-scope="scope">
                  <el-radio
                          :label="scope.row.name"
                          :value="selectedRecoverName"
                          @input="recoverNameChange">
                  </el-radio>
                </template>
            </el-table-column>
            <el-table-column
                    prop="formattedStartTime"
                    label="开始时间"
                    width="100"
                    sortable
                    headerAlign="center" align="center">
              <template slot-scope="scope">
                {{scope.row.formattedStartTimeYMD}}<br/>
                {{scope.row.formattedStartTimeHMS}}
              </template>
            </el-table-column>
            <el-table-column
                    prop="formattedEndTime"
                    label="结束时间"
                    width="100"
                    sortable
                    headerAlign="center" align="center">
              <template slot-scope="scope">
                {{scope.row.formattedEndTimeYMD}}<br/>
                {{scope.row.formattedEndTimeHMS}}
              </template>
            </el-table-column>
            <el-table-column
                    prop="operatorRealName"
                    label="操作人"
                    width="80"
                    headerAlign="center" align="center">
            </el-table-column>
            <el-table-column
                    prop="status"
                    label="状态"
                    width="80"
                    headerAlign="center" align="center">
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<style lang="scss">
#middleware-mariadb-history {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1500px;
  background: white;
  > .header {
    padding: 3px 5px;
    font-size: 14px;
  }
  > .history-title {
    /*background-color: #f5f5f6;*/
    /*border: 1px solid #f5f5f6;*/
    padding: 16px;
    color: #666;
    font-weight: bold;
    text-align: center;
    font-size: 24px;
    line-height: 24px;
    .el-button {
      float: right;
      top: 5px;
    }
  }
  > .main {
    position: relative;
    .header {
      padding: 3px 5px;
      font-size: 14px;
    }

    .title {
      /*background-color: #f5f5f6;*/
      border: 1px solid #f5f5f6;
      padding: 5px;
      color: #666;
      font-weight: bold;
      text-align: left;
      font-size: 16px;
      line-height: 24px;
      .el-button {
        float: right;
        top: 5px;
      }
      .label {
        font-weight: bold;
        text-align: left;
        font-size: 16px;
      }
    }
    .el-table {
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      /*border-radius: 5px;*/
      .el-table--border td, .el-table--border th {
        border-right: none;
      }
      .el-icon-arrow-right {
        transition: transform 0.2s ease-in-out;
        &.rotate {
          transform: rotate(180deg);
        }
      }
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
        this.requestRecoverList();
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

        heightOfTable: 600,

        pageSize: 10,
        currentPage: 1,
        pageTotal: 0,

        backupList: [],
        backupListFilter: [],
        selectedBackupName: null,
        selectedRecoverName: null,
        selectedRowType: null,
        recoverList: [],
        recoverListFilter: [],

        action: {
          name: null,
          row: null,
        },

        currentRow: null,
      }
    },
    computed: {
    },
    methods: {
      deselect(row) {
        this.currentRow = null;
        this.selectedRowType = null;
        this.backupListFilter = this.backupList;
        this.recoverListFilter = this.recoverList;
        this.selectedRecoverName = null;
        this.selectedBackupName = null;
        this.$refs.singleTable.setCurrentRow(row);
      },
      handleCurrentChangeRecover(val) {
        if (val) {
          this.selectedRowType = "recover";
          this.currentRow = val;
          let filterList = this.backupList.filter(it => {
            if (this.currentRow.location === it.location) {
              return true;
            } else {
              return false;
            }
          });
          this.backupListFilter = filterList;
        } else {
          this.backupListFilter = this.backupList;
        }
      },
      handleCurrentChangeBackup(val) {
        if (val) {
          this.selectedRowType = "backup";
          this.currentRow = val;
          let filterList = this.recoverList.filter(it => {
            if (this.currentRow.location === it.location) {
              return true;
            } else {
              return false;
            }
          });
          this.recoverListFilter = filterList;
        } else {
          this.recoverListFilter = this.recoverList;
        }
      },
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
          record['describe'] = it['describe'];
          record['operatorRealName'] = it['operatorRealName'];
          record['formattedStartTime'] = this.$utils.formatDate(record.timeStarted, 'yyyy-MM-dd hh:mm:ss');
          record['formattedStartTimeYMD'] = this.$utils.formatDate(record.timeStarted, 'yyyy-MM-dd');
          record['formattedStartTimeHMS'] = this.$utils.formatDate(record.timeStarted, 'hh:mm:ss');
          record['formattedEndTime'] = this.$utils.formatDate(record.timeCompleted, 'yyyy-MM-dd hh:mm:ss');
          record['formattedEndTimeYMD'] = this.$utils.formatDate(record.timeCompleted, 'yyyy-MM-dd');
          record['formattedEndTimeHMS'] = this.$utils.formatDate(record.timeCompleted, 'hh:mm:ss');
          record['status'] = `备份${STATUS_MAP[record['status']]}`;
          record['size'] = record['size'] ? bytes(parseInt(record['size'])) : '---';
          return record;
        });
        this.backupListFilter = this.backupList;
       // console.log(this.backupList);
      },
      async requestRecoverList() {
        try {
          this.recoverList = [];
          const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_recovery_list, {
            payload: {
              clusterId: this.clusterInfo.id,
              middlewareId: this.middlewareInfo.id,
              name: this.instanceInfo.name,
              namespace: this.$storeHelper.groupInfo.tag
            }
          });
          // console.log(resContent);
            this.recoverList = resContent['data'].filter(it => {
              return it['records'] && it['records'].length > 0;
            }).map(it => {
              const record = it['records'][0];
              record['name'] = it['name'];
              record['operatorRealName'] = it['operatorRealName'];
              record['status'] = `还原${STATUS_MAP[record['status']]}`;
              record['formattedStartTime'] = this.$utils.formatDate(record.timeStarted, 'yyyy-MM-dd hh:mm:ss');
              record['formattedStartTimeYMD'] = this.$utils.formatDate(record.timeStarted, 'yyyy-MM-dd');
              record['formattedStartTimeHMS'] = this.$utils.formatDate(record.timeStarted, 'hh:mm:ss');
              record['formattedEndTime'] = this.$utils.formatDate(record.timeCompleted, 'yyyy-MM-dd hh:mm:ss');
              record['formattedEndTimeYMD'] = this.$utils.formatDate(record.timeCompleted, 'yyyy-MM-dd');
              record['formattedEndTimeHMS'] = this.$utils.formatDate(record.timeCompleted, 'hh:mm:ss');
              return record;
            });
            this.recoverListFilter = this.recoverList;
            // console.log(this.recoverListFilter);
        } catch(err) {
          console.log(err);
        }
      },
      async handleButtonClick(evt, action) {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        var resContent = null;
        switch (action) {

          case 'middleware_mariadb_history_refresh':
            try {
              await this.requestBackupList();
              await this.requestRecoverList();
              this.deselect();
            } catch(err) {
              console.log(err);
            }
            break;
        }
      },
      backupNameChange(rowName) {
        this.selectedBackupName = rowName;
        let row = this.backupListFilter.find(it => {
          return it.name === rowName;
        });
        this.handleCurrentChangeBackup(row);
      },
      recoverNameChange(rowName) {
        this.selectedRecoverName = rowName;
        let row = this.recoverList.find(it => {
          return it.name === rowName;
        });
        this.handleCurrentChangeRecover(row);
      }
    }
  }
</script>