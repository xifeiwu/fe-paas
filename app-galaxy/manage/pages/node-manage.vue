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
                v-loading="loading"
                :height="heightOfTable"
                :default-sort="tableSort"
                @sort-change="onSortChange">
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
              <el-col :span="11" style="text-align: right;font-size: small;">{{index}}</el-col>
              <el-col :span="1" style="text-align: center">:</el-col>
              <el-col :span="12" style="text-align: left;font-size: small;">{{item}}</el-col>
            </el-row>
            
          </template>
        </el-table-column>
        <el-table-column label="内网IP" headerAlign="center" align="center" min-width="150px">
          <template slot-scope="scope">
            <a :href="`http://apm.finupgroup.com/monitor/index.html#/basicResource/machine/cpu?node=${scope.row.internalIP}`" target="_blank">
              {{scope.row.internalIP}}</a>
          </template>
        </el-table-column>
        <el-table-column label="节点配置" headerAlign="center" align="center" min-width="150px">
          <template slot-scope="scope">
            <span class="link" @click="handleTRClick($event, 'get_node_taint', scope.$index, scope.row)">spec配置</span>
          </template>
        </el-table-column>
        <el-table-column label="CPU(Request/总共)" headerAlign="center" align="center" prop="cpuRequest" sortable="custom"
                         min-width="200px">
          <template slot-scope="scope">
            <span v-if="resourceComputing">正在计算中...</span>
            <span v-else>{{scope.row.cpuRequest + '核 / ' + scope.row.cpuTotal + '核（' + scope.row.cpuRequestPercent + '%）' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="内存(Request/总共)" headerAlign="center" align="center" sortable="custom" prop="memoryRequest"
                         min-width="190px">
          <template slot-scope="scope">
            <span v-if="resourceComputing">正在计算中...</span>
            <span v-else>{{scope.row.memoryRequest + 'G / ' + scope.row.memoryTotal + 'G（' + scope.row.memoryRequestPercent + '%）' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="CPU(Limit/总共)" headerAlign="center" align="center" sortable="custom" min-width="180px"
                         prop="cpuLimit">
          <template slot-scope="scope">
            <span v-if="resourceComputing">正在计算中...</span>
            <span v-else>{{`${scope.row.cpuLimit}核 / ${scope.row.cpuTotal}核 (${scope.row.cpuLimitPercent}%)`}}</span>
          </template>
        </el-table-column>
        <el-table-column label="内存(Limit/总共)" headerAlign="center" align="center" sortable="custom" min-width="180px" prop="memoryLimit"
                         :sortable="true">
          <template slot-scope="scope">
            <span v-if="resourceComputing">正在计算中...</span>
            <span v-else>{{`${scope.row.memoryLimit}G / ${scope.row.memoryTotal}G (${scope.row.memoryLimitPercent}%)`}}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作系统" prop="os" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" headerAlign="center" align="center" :sortable="true">
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

    <el-dialog :visible.sync="hasTaints" top="30px" width="80%" :fullscreen="false"
               v-loading="saveTaintsLoading"
               element-loading-text="正在保存"
               element-loading-spinner="el-icon-loading"
               element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div class="py-3" style="width: 80%; text-align: left;">
        <h4 style="display: inline;">
          <span style="color: red;">
          Node配置（仅支持修改节点yaml中的spec字段）
          </span>
        </h4>
        <span>
          <el-tooltip slot="trigger" effect="dark" placement="right">
            <div slot="content">
              <pre>
污点配置模板样例如下：（taints）
---
externalID: "dev-k8s-node-87-63"
taints:
- effect: "NoSchedule"
  key: "test1"
  value: "26"
- effect: "NoSchedule"
  key: "test2"
  value: "16"
              </pre>
            </div>
            <span><i class="paas-icon-fa-question" style="color:#E6A23C"></i></span>
          </el-tooltip>
        </span>
      </div>

      <div class="__editor">
        <codemirror v-model="configOfTaints" :options="editorTaintsOptions"></codemirror>
      </div>

      <div slot="footer" class="pa-3" style="text-align: center">
        <el-button type="success" size="medium" @click="saveTaintsConfig(true)">&emsp;保 存 并 生 效&emsp;</el-button>
        <el-button type="danger" size="medium" @click="hasTaints = false">&emsp;取 消 修 改&emsp;</el-button>
      </div>
    </el-dialog>
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
            }
          }
        }
      }
      .link {
        color: #409EFF;
        &:hover {
          cursor: pointer;
          text-decoration: underline;
        }
      }
    }
  }
</style>
<script>
  import bytes from 'bytes';
  // import utils from '../utils';
  import commonUtils from 'assets/components/mixins/common-utils';
  import {codemirror} from "vue-codemirror";
  import "codemirror/lib/codemirror.css";

  // language
  import "codemirror/mode/properties/properties.js";
  import "codemirror/mode/yaml/yaml.js";
  // theme
  import "codemirror/theme/monokai.css";
  // require active-line.js
  import "codemirror/addon/selection/active-line.js";

  export default {
    components: {
      codemirror,
    },
    mixins: [commonUtils],
    async created() {
      this.bytes = bytes;

      await this.requestK8sClusterList();

      if (this.$storeHelper.dataTransfer) {
        const dataTransfer = this.$storeHelper.dataTransfer;
        // console.log(dataTransfer);
        // const from = dataTransfer['from'];
        const theData = dataTransfer['data'];
        // console.log(from);
        // console.log(theData);
        this.dataPassed = theData['clusterInfo'];

        this.currentK8sNode = this.dataPassed.clusterName;
        this.$storeHelper.dataTransfer = null;
      } else {
        this.currentK8sNode = this.k8sClusterList[0].name;
      }

      await this.requestNodeListByPage(true);
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

        k8sClusterList: [],
        currentK8sNode: '',
        dataPassed: null,
        statusList: [
          {
            key: 'all',
            status: '全部'
          }, {
            key: 'ready',
            status: 'ready'
          }, {
            key: 'notReady',
            status: 'notReady'
          }
        ],
        runningStatus: 'all',
        keyword: '',

        heightOfTable: '',
        loading: false,
        nodeList: [],
        nodeListByPage: [],
        resourceComputing: true,

        action: {
          evt: null,
          name: null,
          row: null
        },

        hasTaints: false,
        configOfTaints: '',
        saveTaintsLoading: false,
        editorTaintsOptions: {
          tabSize: 4,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          mode: "text/x-properties",
          theme: "monokai",
          readOnly: false,
          viewportMargin: 10
        },

        getRowKeys: function (row) {
          return row.id;
        },

        totalSize: 0,
        pageSize: 10,
        currentPage: 1,
        tableSort: {prop: 'cpuRequest', order: 'descending'},
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
      'currentK8sNode': async function (currentK8sNode) {
        // value of elTab is set to '0' by default
        if (currentK8sNode == '0') {
          return;
        }
        this.currentPage = 1;
        await this.requestNodeListByPage(true);
      },
      'keyword': function () {
        this.requestNodeListByPage();
      },
      'runningStatus': function () {
        this.requestNodeListByPage();
      },
    },
    methods: {
      // check if all necessary data is get
      async requestNodeListByPage(refresh) {
        if (refresh) {
          this.nodeList = [];
          this.nodeList = await this.requestNodeList();
        }
        // update pageSize by screen size
        // this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 10 : 5;
        var page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;

        var nodeListByPage = this.nodeList;
        if (this.keyword) {
          const filterReg = new RegExp(this.keyword);
          nodeListByPage = this.nodeList.filter(it => {
            return filterReg.exec(it['nodeName']);
          });
        }

        if (this.runningStatus && 'all' !== this.runningStatus) {
          nodeListByPage = nodeListByPage.filter(it => {
            return this.runningStatus === it['status'];
          });
        }
        this.totalSize = nodeListByPage.length;
        this.nodeListByPage = nodeListByPage.slice(start, end);
        // console.log(this.nodeListByPage);
        // 分页后，根据分页的节点列表计算CPU和内存使用情况
        await this.queryNodeResourceUsage();
        this.onSortChange({prop: 'cpuRequest', order: 'descending'});
      },

      // 基于现有node列表的二次请求
      async queryNodeResourceUsage() {
        this.resourceComputing = true;
        if (this.nodeListByPage.length === 0) {
          return;
        }
        let nodeListByPage = this.nodeListByPage.map(it => {
          return it.nodeName;
        });
        // console.log(nodeListByPage);
        const resp = await this.$net.requestPaasServer(this.$net.URL_LIST.query_node_resource, {
          payload: {
            clusterName: this.currentK8sNode,
            nodeNameList: nodeListByPage
          }
        });
        if (resp) {
          resp.map(it => {
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
            it['cpuRequest'] = parseInt(it.cpuRequest) / 1000;
            it['cpuTotal'] = parseInt(it.cpuTotal) / 1000;
            it['cpuRequestPercent'] =  parseFloat(it['cpuRequest'] / it['cpuTotal'] * 100).toFixed(1);

            it['memoryRequest'] = parseFloat((it.memoryRequest / 1024).toFixed(2));
            it['memoryTotal'] = parseFloat(it.memoryTotal / 1024).toFixed(2);
            it['memoryRequestPercent'] =  parseFloat(it['memoryRequest'] / it['memoryTotal'] * 100).toFixed(1);

            it["cpuLimit"] = parseInt(it.cpuLimit) / 1000;
            it["cpuLimitPercent"] = parseFloat(it['cpuLimit'] / it["cpuTotal"] * 100).toFixed(1);

            it["memoryLimit"] = parseFloat((it.memoryLimit / 1024).toFixed(2));
            it["memoryLimitPercent"] = parseFloat(it["memoryLimit"] / it["memoryTotal"] * 100).toFixed(1);

          });

          let nl = [];
          this.nodeListByPage.map(srcList => {
            resp.forEach(newList => {
              if (srcList['nodeName'] === newList['nodeName']) {
                nl.push(newList);
              }
            });
          this.nodeListByPage = nl;
          });
          this.resourceComputing = false;
          // console.log(resp);
        } else {
          this.resourceComputing = true;
          // console.log("get failed!");
        }
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
        } catch (err) {
        }
      },

      // request node list
      async requestNodeList() {
        var nodeList = [];
        this.loading = true;
        try {
          const res = await this.$net.getResponse(this.$net.URL_LIST.query_node_list, {
            query: {
              clusterName: this.currentK8sNode
            }
          }, {
            headers: {
              token: this.$storeHelper.getUserInfo('token')
            },
            timeout: 600000
          });
          if (!res.data.content) {
            return nodeList;
          }
          const resp = res.data.content;
          resp.map(it => {
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

            it['cpuRequest'] = '';
            it['cpuTotal'] = '';
            it['cpuRequestPercent'] = '';

            it['memoryRequest'] = '';
            it['memoryTotal'] = '';
            it['memoryRequestPercent'] = '';

            it["cpuLimit"] = '';
            it["cpuLimitPercent"] = '';

            it["memoryLimit"] = '';
            it["memoryLimitPercent"] = '';
          });
          nodeList = resp;
        } catch (err) {

        }
        this.loading = false;
        this.nodeList = nodeList;
        return nodeList;
      },

      async handleButtonClick(evt, action) {
        switch (action) {
          case 'refreshList':
            this.addToWaitingResponseQueue(action);
            try {
              await this.requestNodeListByPage(true);
              setTimeout(() => {
                this.hideWaitingResponse(action);
              }, 1000);
            } catch (err) {
              setTimeout(() => {
                this.hideWaitingResponse(action);
              }, 1000);
            }
            break;
        }
      },

      async handleTRClick(evt, action, index, row) {

        this.action.evt = evt;
        this.action.name = action;
        this.action.row = row;

        switch (action) {
          case 'get_node_taint':
            await this.$net.requestPaasServer(this.$net.URL_LIST.get_node_taint, {
              payload: {
                clusterName: this.currentK8sNode,
                nodeName: row.nodeName
              }
            }).then(resp =>{
              // console.log(resp);
              if (resp) {
                this.configOfTaints = resp['taintConfig'];
              } else {
                this.configOfTaints = "";
              }
              this.hasTaints = true;
            }).catch(error => {
              console.log(error);
            }).finally(()=> {
            });
            break;
          default:
            console.log("未知操作");
            break;
        }
      },

      async saveTaintsConfig() {

        await this.$confirm(
          "您确认要修改节点（" + this.action.row.nodeName+ "）的配置吗?",
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );

        this.saveTaintsLoading = true;
        await this.$net.requestPaasServer(this.$net.URL_LIST.update_node_taint, {
        // await this.$net.getResponse(url, {
          payload: {
            clusterName: this.currentK8sNode,
            nodeName: this.action.row.nodeName,
            taintConfig: this.configOfTaints
          }
        }).then(response => {
          // console.log(response);
          this.$message.success("节点配置成功！");
          this.hasTaints = false;
        }).catch(err => {
          console.log(err);
          this.$message.error("保存配置失败，请联系云平台！");
        }).finally(() => {
          this.saveTaintsLoading = false;
        });
      },

      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestNodeListByPage();
      },

      onSortChange(tableSort) {
        // console.log(tableSort);
        this.tableSort = tableSort;
        let sortKey = this.tableSort.prop;
        let sortOrder = this.tableSort.order;
        this.nodeListByPage.sort((pre, next) => {
          let result = pre[sortKey] - next[sortKey];
          switch (sortOrder) {
            case "ascending":
              break;
            case "descending":
              result = -1 * result;
              break;
            default:
              result = 0;
              break;
          }
          return result;
        })
      }

    }
  }
</script>
<style lang="scss">
  .__editor {
    text-align: left;
    min-height: 400px;
    .CodeMirror {
      min-height: 480px;
    }
  }
</style>