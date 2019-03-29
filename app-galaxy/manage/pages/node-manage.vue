<template>
  <div id="node-manage">
    <div class="header">
      <el-tabs type="border-tab" v-model="currentK8sNode" :class="[currentK8sNode]">
        <el-tab-pane v-for="item in k8sClusterList" :label="item.description" :name="item.name"
                             :key="item.name"></el-tab-pane>
        </el-tabs>
        <div class="operation">
          <div class="item">
            <label>关键字:</label>
            <el-input
                size="mini"
                style="display: inline-block; width: 200px; max-width: 280px"
                placeholder="按节点名称搜索"
                v-model="keyword" suffix-icon="el-icon-search">
            </el-input>
          </div>
          <div class="item">
            <label>运行状态:</label>
            <el-select v-model="runningStatus" placeholder="请选择" style="width: 200px;">
              <el-option v-for="(item, index) in statusList" :key="index" :label="item.status" :value="item.key">
              </el-option>
            </el-select>
          </div>
          <el-button size="mini"
                     type="primary"
                     @click="handleButtonClick($event, 'refreshList')">
            <span>刷新</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
          </el-button>
        </div>
    </div>
    <div class="list">
      <el-table :data="nodeListByPage"
                :row-key="getRowKeys"
                stripe
                :height="heightOfTable">
        <el-table-column label="节点名称" prop="nodeName" headerAlign="center" align="center" minWidth="80">
        </el-table-column>
        <el-table-column label="状态" prop="status" headerAlign="center" align="center" width="100">
        </el-table-column>
        <el-table-column label="Label" prop="labels" headerAlign="center" align="center" width="360">
          <template slot-scope="scope">
            <el-row
                v-for="(item, index) in scope.row.labels"
                :key="index"
            >
              <el-col :span="11" style="text-align: left;font-size: small;">{{index}}</el-col>
              <el-col :span="1" style="text-align: center">:</el-col>
              <el-col :span="12" style="text-align: left;font-size: small;">{{item}}</el-col>
            </el-row>
            
          </template>
        </el-table-column>
        <el-table-column label="CPU(已用/总共)" prop="cpuTotal" headerAlign="center" align="center" width="160" sortable>
          <template slot-scope="scope">
            <span>{{scope.row.cpuUsed + '核 / ' + scope.row.cpuTotal + '核'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="内存(已用/总共)" prop="memoryTotal" headerAlign="center" align="center" width="160" sortable>
          <template slot-scope="scope">
            <span>{{scope.row.memoryUsed + 'G / ' + scope.row.memoryTotal + 'G'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="外网IP" prop="internalIP" headerAlign="center" align="center" width="100">
        </el-table-column>
        <el-table-column label="操作系统" prop="os" headerAlign="center" align="center" width="120">
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" headerAlign="center" align="center" width="120"
                         sortable>
          <template slot-scope="scope">
            {{scope.row.createTimeYMD}}<br/>
            {{scope.row.createTimeHMS}}
          </template>
        </el-table-column>
        <!--<el-table-column headerAlign="center" align="center" minWidth="30">-->
        <!--</el-table-column>-->
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize">
        <div class="pagination">
          <el-pagination
              :current-page="currentPage"
              size="large"
              layout="prev,pager,next"
              :page-size="pageSize"
              :total="totalSize"
              @current-change="handlePaginationPageChange">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>

</template>
<style lang="scss">
  #node-manage {
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
          #tab-unproduction.is-active {
            border-color: $g-env-fpdev-color;
            color: $g-env-fpdev-color;
          }
          #tab-production.is-active {
            border-color: $g-env-test-color;
            color: $g-env-test-color;
          }
          #tab-production-ff-.is-active {
            border-color: $g-env-performance-color;
            color: $g-env-performance-color;
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
        /*text-align: right;*/
        .item {
          /*text-align: left;*/
          display: inline-block;
          margin-right: 3px;
          margin-top: 5px;
          width: 280px;
        }
      }
      .el-button {
        float:  right;
        margin-top: 5px;
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
	// import utils from '../utils';
	import commonUtils from 'assets/components/mixins/common-utils';
	
	
	export default {
		mixins: [commonUtils],
		async created() {
			this.bytes = bytes;
   
			await this.requestK8sClusterList();
			this.currentK8sNode = this.k8sClusterList[0].name;
			await this.computedNodeList(true);
		},
		mounted() {
			// update value in next tick
			setTimeout(() => {
				this.onScreenSizeChange(this.$storeHelper.screen.size);
				this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 5;
			});

		},
    computed: {
		},
		data() {
			return {
				
				k8sClusterList: [],
				currentK8sNode: '',
				statusList: [
					{
						key: 'all',
            status: '全部'
          } , {
						key: 'ready',
						status: 'running'
					} , {
						key: 'notReady',
						status: 'stopping'
          }
        ],
				runningStatus: 'all',
				keyword: '',
    
				heightOfTable: '',
        
        nodeList: [],
				nodeListFilter: [],
				nodeListByPage: [],
    
				getRowKeys: function (row) {
					return row.id;
				},
    
				totalSize: 0,
				pageSize: 10,
				currentPage: 1,
    
			}
		},
		watch: {
			'$storeHelper.screen.size': 'onScreenSizeChange',
			'currentK8sNode': async function(currentK8sNode) {
				// value of elTab is set to '0' by default
				if (currentK8sNode == '0') {
					return;
				}
				await this.requestNodeList();
			},
      'keyword': function () {
	      this.computedNodeList();
      },
      'runningStatus': function () {
	      this.computedNodeList();
      },
		},
		methods: {
			
			// check if all necessary data is get
			async computedNodeList(refresh) {
				if (refresh || !this.nodeList) {
					await this.requestNodeList();
				}
				// update pageSize by screen size
				this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 5;
				var page = this.currentPage - 1;
				page = page >= 0 ? page : 0;
				const start = page * this.pageSize;
				const length = this.pageSize;
				const end = start + length;
				
				this.nodeListFilter = this.nodeList;
				if (this.keyword) {
					const filterReg = new RegExp(this.keyword);
					this.nodeListFilter = this.nodeList.filter(it => {
						return filterReg.exec(it['nodeName']);
					});
				}
				
				if (this.runningStatus && 'all' !== this.runningStatus) {
					this.nodeListFilter = this.nodeList.filter(it => {
						return this.runningStatus === it['status'];
					});
        }
				this.totalSize = this.nodeListFilter.length;
				this.nodeListByPage = this.nodeListFilter.slice(start, end);
			},
   
			// request node list
			async requestK8sClusterList() {
				
				const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.query_k8s_cluster);
				const clusterList = resContent.map(it => {
					if (it.createTime) {
						it['createTime'] = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
					} else {
						it['createTime'] = '---';
					}
					return it;
				});
    
				this.k8sClusterList = clusterList;
			},
   
			onScreenSizeChange(size) {
//        console.log(this.$storeHelper.screen);
				if (!size) {
					return;
				}
				try {
					const headerNode = this.$el.querySelector(':scope > .header');
					const headerHeight = headerNode.offsetHeight;
					this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
				} catch(err) {
				}
			},
			
			// request node list
			async requestNodeList() {
				const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.query_node_list, {
					query: {
						clusterName: this.currentK8sNode
					}
        });
        
				resContent.map(it => {
					it['createTimeYMD'] = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd');
					it['createTimeHMS'] = this.$utils.formatDate(it.createTime, 'hh:mm:ss');
					it.formattedCreateTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
		
					it["os"] = it["osImage"];
					it["internalIP"] = it["internalIP"];
					if (it["nodeStatus"]) {
						it["status"] = 'ready';
          } else {
						it["status"] = 'notReady'
          }
          
					it.cpuDisplay = it.cpuUsed + '/' + it.cpuTotal;
					
					it['cpuUsed'] = parseInt(it.cpuUsage) / 1000;
					it['cpuTotal'] = parseInt(it.cpuTotal) / 1000;
     
					it['memoryUsed'] = parseFloat(it.memoryUsage / 1024).toFixed(2);
          it['memoryTotal'] = parseFloat(it.memoryTotal / 1024).toFixed(2);
					
				});
				this.totalSize = parseInt(resContent.length);
				
				this.nodeList = resContent;
				// this.computedNodeList();
//        console.log(this.nodeList);
			},
			
			async handleButtonClick(evt, action) {
				
				switch (action) {
					
					case 'refreshList':
						this.addToWaitingResponseQueue(action);
						try {
							await this.computedNodeList(true);
							setTimeout(() => {
								this.hideWaitingResponse(action);
							}, 1000);
						} catch(err) {
							setTimeout(() => {
								this.hideWaitingResponse(action);
							}, 1000);
						}
						break;
				}
			},
   
			handlePaginationPageChange(page) {
				this.currentPage = page;
				this.computedNodeList();
			},
   
		}
	}
</script>
