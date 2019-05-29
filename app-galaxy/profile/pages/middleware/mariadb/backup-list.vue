<template>
  <div id="middleware-backup-list">
    <el-row class="operation">
      <el-col :span="13">
        <label>过滤：</label>
        <el-radio-group v-model="selectEnv">
          <el-radio label="all">显示全部备份</el-radio>
          <el-radio label="fpdev">开发环境</el-radio>
          <el-radio label="test">测试环境</el-radio>
          <el-radio label="beta">联调环境</el-radio>
          <el-radio label="performance">性能测试环境</el-radio>
        </el-radio-group>
      </el-col>
    
      <el-col :span="4">
        <!--<el-checkbox v-model="isCurrentGroup">是否显示非本团队备份</el-checkbox>-->
      </el-col>
    
      <el-col :span="7" style="text-align: right;">
        <el-button size="mini-extral"
                   type="primary"
                   @click="handleClick($event, 'backup_refresh')">
          <span>刷新</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
        </el-button>
        <el-input
            size="mini"
            style="max-width: 200px"
            placeholder="按备份名称搜索"
            suffix-icon="el-icon-search"
            v-model="filterKey">
        </el-input>
      </el-col>
    </el-row>
    
    <el-table :data="backupListByPage"
              stripe
              :height="heightOfTable">
      <el-table-column label="备份名称" prop="backupName" headerAlign="center" align="center" width="250">
      </el-table-column>
      <el-table-column label="所属服务" prop="serviceName" headerAlign="center" align="center" width="180">
      </el-table-column>
      <el-table-column label="服务类型" prop="serviceType" headerAlign="center" align="center" width="150">
      </el-table-column>
      <el-table-column label="备份环境" prop="backupSpace" headerAlign="center" align="center" minWidth="100">
      </el-table-column>
      <el-table-column label="备份时间" prop="formattedStartTime" headerAlign="center" align="center" width="100"
                       sortable>
        <template slot-scope="scope">
          {{scope.row.formattedStartTimeYMD}}<br/>
          {{scope.row.formattedStartTimeHMS}}
        </template>
      </el-table-column>
      <el-table-column label="备份大小" prop="size" headerAlign="center" align="center" width="90">
      </el-table-column>
      <el-table-column label="操作人" prop="operatorRealName" headerAlign="center" align="center" width="100">
      </el-table-column>
      <el-table-column label="操作" prop="operation" headerAlign="center" align="center" minWidth="150">
        <template slot-scope="scope">
          <el-row>
            <el-col :span="24">
              <el-button
                  type="text"
                  :loading="statusOfWaitingResponse('delete_backup') && action.row.id == scope.row.id"
                  @click="handleClick($event, 'delete_backup', scope.$index, scope.row)">删除</el-button>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container" v-if="totalSize > pageSize">
      <div class="pagination">
        <el-pagination
            :current-page="currentPage"
            size="large"
            layout="prev,pager,next"
            :page-size="pageSize"
            :total="totalSize"
            @current-change="handlePaginationPageChange"
        >
        </el-pagination>
      </div>
    </div>
    
  </div>
</template>
<style lang="scss" scoped>
#middleware-backup-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1500px;
  .operation {
    padding: 5px 5px 5px 0px;
    /*text-align: right;*/
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .el-button {
      bottom: 2px;
    }
    .el-checkbox {
      bottom: 2px;
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
    }
  }
}
</style>
<script>
  import utils from '../utils';
  import commonUtils from 'assets/components/mixins/common-utils';
  import bytes from 'bytes';
  
  const STATUS_MAP = {
	  Complete: '成功',
	  Running: '中',
	  Failed: '失败'
  };
  
  export default {
    mixins: [commonUtils],
    async created() {
      
      var goBack = false;
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
//        console.log(dataTransfer);
        const data = dataTransfer['data'];
	      this.clusterInfo = data.clusterInfo;
	      this.middlewareInfo = data.middlewareInfo;
      } else {
        goBack = true;
      }

      if (goBack) {
        this.$router.push(this.$net.page['profile/middleware/mariadb']);
        return;
      }

	    setTimeout(() => {
		    this.updateBackupListByPage(true);
	    });
	    
    },

    mounted() {
	    this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    data() {
      return {
        clusterInfo: null,
        middlewareInfo: null,
        clusterList: [],
	
	      backupList: [],
	      backupListFilter: [],
	      backupListByPage: [],
	
	      isCurrentGroup: true,
	      filterKey: "",
	      selectEnv: "all",
	
	      totalSize: 0,
	      pageSize: 10,
	      currentPage: 1,
	      heightOfTable: 500,

      }
    },
    watch: {
	    '$storeHelper.screen.size': 'onScreenSizeChange',
	    '$storeHelper.groupInfo.id': function () {
		    this.updateBackupListByPage(true);
	    },
      'selectEnv': 'onSelectEnv',
      'filterKey': function () {
	      this.updateBackupListByPage();
      }
    },
    methods: {
	    onScreenSizeChange(size) {
		    if (!size) {
			    return;
		    }
		    try {
			    const headerNode = this.$el.querySelector(':scope > .header');
			    const headerHeight = headerNode.offsetHeight;
			    this.heightOfTable = this.$el.clientHeight - headerHeight;
			    this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 5;
		    } catch(err) {
		    }
	    },
     
	    onSelectEnv() {
	    	this.updateBackupListByPage();
      },
	
	    async updateBackupListByPage(refresh) {
		    if (refresh || !this.backupList) {
			    await this.requestBackupListByNamespace();
		    }
		    // update pageSize by screen size
		    this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 5;
		    var page = this.currentPage - 1;
		    page = page >= 0 ? page : 0;
		    const start = page * this.pageSize;
		    const length = this.pageSize;
		    const end = start + length;
		
		    this.backupListFilter = this.backupList;
		    if (this.filterKey) {
			    const filterReg = new RegExp(this.filterKey);
			    this.backupListFilter = this.backupListFilter.filter(it => {
				    return filterReg.exec(it['backupName']);
			    });
		    }
		    
		    if (this.selectEnv !== 'all') {
			    this.backupListFilter = this.backupListFilter.filter(it => it['backupEnv'] === this.selectEnv);
        }
        
		    this.totalSize = this.backupListFilter.length;
		    this.backupListByPage = this.backupListFilter.slice(start, end);
	    },
	
	    handlePaginationPageChange(page) {
		    this.currentPage = page;
		    this.updateBackupListByPage();
	    },
     
	    async requestBackupListByNamespace() {
		    const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_list_by_namespace, {
			    payload: {
				    clusterId: this.clusterInfo.id,
				    middlewareId: this.middlewareInfo.id,
				    namespace: this.$storeHelper.groupInfo.tag
			    }
		    });
		    this.backupList = resContent['data'].map(it => {
			    const record = it;
			    record['name'] = it['name'];
			    record['describe'] = it['describe'];
			    record['operatorRealName'] = it['operatorRealName'];
			    record['formattedStartTime'] = this.$utils.formatDate(it.timeStarted, 'yyyy-MM-dd hh:mm:ss');
			    record['formattedStartTimeYMD'] = this.$utils.formatDate(it.timeStarted, 'yyyy-MM-dd');
			    record['formattedStartTimeHMS'] = this.$utils.formatDate(it.timeStarted, 'hh:mm:ss');
			    // record['formattedEndTime'] = this.$utils.formatDate(record.timeCompleted, 'yyyy-MM-dd hh:mm:ss');
			    // record['formattedEndTimeYMD'] = this.$utils.formatDate(record.timeCompleted, 'yyyy-MM-dd');
			    // record['formattedEndTimeHMS'] = this.$utils.formatDate(record.timeCompleted, 'hh:mm:ss');
			    record['status'] = `备份${STATUS_MAP[it['status']]}`;
			    record['size'] = record['size'] ? bytes(parseInt(it['size'])) : '---';
			    return record;
		    });
		    // this.backupListFilter = this.backupList;
		    console.log(this.backupList);
	    },
      
      async handleClick(evt, action, index, row) {
        let resContent = null;
        let selectedBackup = row;
        console.log(row);
        switch (action) {
          case 'delete_backup':
	          try {
//              console.log(this.selectedBackup);
//              console.log(this.action);
		          if (!selectedBackup) {
			          this.$message.error('请选择要操作的备份！');
			          return;
		          }
		          await this.$confirm(`确定要删除备份 "${selectedBackup['backupName']}" 吗？`, '提示', {
			          confirmButtonText: '确定',
			          cancelButtonText: '取消',
			          type: 'warning',
			          dangerouslyUseHTMLString: true
		          });
		          resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_backup_delete, {
			          payload: {
				          clusterId: selectedBackup['backupSpaceId'],
				          backupCluster: selectedBackup.serviceName,
				          location: selectedBackup.location,
				          name: selectedBackup['backupName'],
				          namespace: selectedBackup['namespace']
			          }
		          });
		          this.$message.success(`备份 "${selectedBackup['backupName']}" 删除成功！稍后可刷新页面查看`);
              await this.updateBackupListByPage(true);
	          } catch (err) {
		          console.log(err);
	          }
            break;
          case 'backup_refresh':
	          try {
		          await this.updateBackupListByPage(true);
	          } catch(err) {
		          console.log(err);
	          }
	          
          	break;
        }
      }
    }
  }
</script>