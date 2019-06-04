<template>
  <div id="cluster-dashboard">
    <div class="header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>集群概况</el-breadcrumb-item>
        <!--<el-breadcrumb-item :to="{ path: '/manage/cluster-dashboard' }">集群概况</el-breadcrumb-item>-->
      </el-breadcrumb>
      <!--<span role="link" class="el-breadcrumb__inner">集群概况</span>-->
      <hr color="#DCDFE6">
    </div>
    <div class="list">
      <el-table :data="clusterListByPage"
                :row-key="getRowKeys"
                v-loading="loading"
                stripe
                :height="heightOfTable">
        <el-table-column label="集群名称" prop="clusterDescription" headerAlign="center" align="center" minWidth="80">
        </el-table-column>
        <el-table-column label="CPU(Request/总共)" headerAlign="center" align="center" width="200" >
          <template slot-scope="scope">
            <span>{{scope.row.cpuRequest + '核 / ' + scope.row.cpuTotal + '核'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="内存(Request/总共)" headerAlign="center" align="center" width="200" >
          <template slot-scope="scope">
            <span>{{scope.row.memoryRequest + 'G / ' + scope.row.memoryTotal + 'G'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="CPU(Limit/总共)" headerAlign="center" align="center" width="200" >
          <template slot-scope="scope">
            <span>{{scope.row.cpuLimit + '核 / ' + scope.row.cpuTotal + '核'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="CPU(Limit/总共)" headerAlign="center" align="center" width="200" >
          <template slot-scope="scope">
            <span>{{scope.row.cpuLimit + 'G / ' + scope.row.memoryTotal + 'G'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="" headerAlign="center" align="center" width="300">
          <template slot-scope="scope">
            <ul>
              <li style="display: inline-block; padding-left: 5px; padding-right: 5px;">
                <a href="#" @click="handleButtonClick($event, 'gotoNodeManage', scope.$index, scope.row)">按node分类</a>
              </li>
              <!--<li style="display: inline-block; padding-left: 5px; padding-right: 5px;">-->
              <!--<a href="#">按PV分类</a>-->
              <!--</li>-->
            </ul>
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
              @current-change="handlePaginationPageChange">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>

</template>

<style lang="scss">
  #cluster-dashboard {
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 1500px;
    background: white;
    .header {
      font-size: 14px;
      background-color: white;
      .el-breadcrumb {
        font-size: 16px;
        padding: 8px 0px 2px 5px;
      }
      .el-button {
        float: right;
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

      await this.requestK8sClusterDetailList();
      await this.computedClusterList(true);
    },
    mounted() {
      // update value in next tick
      setTimeout(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
        this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 5;
      });

    },
    computed: {},
    data() {
      return {

        k8sClusterDetailList: [],
        clusterListFilter: [],
        clusterListByPage: [],
        loading: false,
        keyword: '',

        heightOfTable: '',

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
      'keyword': function () {
        this.computedClusterList();
      },
    },
    methods: {

      // check if all necessary data is get
      async computedClusterList(refresh) {
        if (refresh || !this.k8sClusterDetailList) {
          await this.requestK8sClusterDetailList();
        }
        // update pageSize by screen size
        this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 5;
        var page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;

        this.clusterListFilter = this.k8sClusterDetailList;
        if (this.keyword) {
          const filterReg = new RegExp(this.keyword);
          this.clusterListFilter = this.k8sClusterDetailList.filter(it => {
            return filterReg.exec(it['clusterDescription']);
          });
        }

        this.totalSize = this.clusterListFilter.length;
        this.clusterListByPage = this.clusterListFilter.slice(start, end);
      },

      async requestK8sClusterDetailList() {
        this.loading = true;
        await this.$net.getResponse(this.$net.URL_LIST.query_k8s_cluster_detail, {}, {
          headers: {
            token: this.$storeHelper.getUserInfo('token')
          },
          timeout: 600000
        }).then(res => {
          if (!res.data.content) {
            return;
          }
          const resp = res.data.content;
          const clusterList = resp.map(it => {
            it['cpuRequest'] = parseInt(it.cpuRequest) / 1000;
            it['cpuTotal'] = parseInt(it.cpuTotal) / 1000;
            it['memoryRequest'] = parseFloat(it.memoryRequest / 1024).toFixed(2);
            it['memoryTotal'] = parseFloat(it.memoryTotal / 1024).toFixed(2);
            it['cpuLimit'] = parseInt(it.cpuLimit) / 1000;
            it["memoryLimit"] = parseInt(it.memoryLimit / 1024).toFixed(2);
            return it;
          });

          this.k8sClusterDetailList = clusterList;
          // console.log(clusterList);
        }).catch(err => {
          console.log(err);
        }).finally(() => {
          this.loading = false;
        });
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
        } catch (err) {
        }
      },

      async handleButtonClick(evt, action, index, row) {

        switch (action) {
          case 'gotoNodeManage':
            // console.log(action);
            this.$storeHelper.dataTransfer = {
              from: {
                path: this.$net.page['manage/node-manage'],
                action
              },
              data: {
                clusterInfo: row
              }
            };

            this.$router.push(this.$net.page['manage/node-manage']);
            break;
          // case 'refreshList':
          // 	this.addToWaitingResponseQueue(action);
          // 	try {
          // 		await this.computedClusterList(true);
          // 		setTimeout(() => {
          // 			this.hideWaitingResponse(action);
          // 		}, 1000);
          // 	} catch(err) {
          // 		setTimeout(() => {
          // 			this.hideWaitingResponse(action);
          // 		}, 1000);
          // 	}
          // 	break;
        }
      },

      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.computedClusterList();
      },

    }
  }
</script>
