<template>
  <div id="gateway-list">
    <div class="header">
      <div class="item">
        <!--<paas-version-selector :customConfig="config4VersionSelector" ref="version-selector"-->
                               <!--@version-selected="getSelectedService"></paas-version-selector>-->
        <paas-service-selector
                ref="service-selector"
                :addItemAll="{app: true, profile: false}"
                :customConfig="config4ServiceSelector"
                @service-selected="onServiceSelected"></paas-service-selector>
      </div>
      <div class="item">
        <el-input size="mini" placeholder="按关键字搜索"
                  style="max-width: 360px;"
                  v-model="filterKey">
          <i slot="prefix" class="el-icon-search"></i>
          <i :class="filterKey && filterKey.length > 0 ? 'paas-icon-close' : ''"
             slot="suffix"
             @click="evt => filterKey=''"></i>
        </el-input>
      </div>
      <div class="item">
        <el-button v-if="true"
                   size="mini"
                   type="primary"
                   @click="handleClick($event, 'refresh')"><i class="el-icon el-icon-refresh" style="margin-right: 3px;"></i>刷新</el-button>
        <el-button v-if="true"
                   size="mini"
                   type="primary"
                   @click="handleClick($event, 'open_dialog_gateway_create')">创建API网关</el-button>
      </div>
    </div>
    <div class="list">
      <el-table
              :data="listByPage"
              style="width: 100%"
              :height="heightOfTable"
      >
        <el-table-column
                label="网关名称"
                prop="gatewayName"
                minWidth="120"
                headerAlign="left" align="left">
        </el-table-column>
        <el-table-column
                label="应用名称"
                prop="appName"
                minWidth="100"
                headerAlign="left" align="left">
        </el-table-column>
        <!--<el-table-column-->
                <!--label="运行环境"-->
                <!--prop="profileDescription"-->
                <!--width="120"-->
                <!--headerAlign="center" align="center">-->
        <!--</el-table-column>-->
        <el-table-column
                label="域名"
                prop="host"
                minWidth="120"
                headerAlign="left" align="left">
        </el-table-column>
        <el-table-column
                label="请求路径"
                prop="paths"
                minWidth="100"
                headerAlign="center" align="center">
        </el-table-column>
        <!--<el-table-column-->
                <!--prop="cpuUsageInPercent"-->
                <!--label="CPU使用率"-->
                <!--width="110"-->
                <!--sortable="custom"-->
                <!--headerAlign="center" align="center">-->
        <!--</el-table-column>-->
        <el-table-column
                label="配置时间"
                prop="formattedCreateTime"
                width="100"
                headerAlign="center" align="center">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column
                label="创建人"
                prop="creatorName"
                width="100"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="操作" prop="operation" headerAlign="center" align="center" minWidth="100">
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :class="['flex', 'primary']"
                    @click="handleTRClick($event, 'gateway_modify', scope.row, scope.$index)"
            >
              <span>修改</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', 'primary']"
                    @click="handleTRClick($event, 'gateway_detail', scope.row, scope.$index)"
            >
              <span>详情</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    type="text"
                    :class="['flex', 'danger']"
                    @click="handleTRClick($event, 'gateway_delete', scope.row, scope.$index)"
            >
              <span>删除</span>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                type="text"
                :class="['flex', 'danger']"
                @click="handleTRClick($event, 'open_dialog_rate_limiting', scope.row, scope.$index)"
            >
              <span>源IP限速</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <div class="pagination">
          <el-pagination
                  @size-change="val => this.pageSize = val"
                  background
                  :current-page.sync="currentPage"
                  :page-size="pageSize"
                  :page-sizes="[10, 15, 20, 30]"
                  layout="total, sizes, prev, pager, next"
                  :total="listFiltered.length">
          </el-pagination>
        </div>
      </div>
    </div>

    <el-dialog title="创建API网关"
               :visible="action.name == 'open_dialog_gateway_create'"
               v-if="action.name == 'open_dialog_gateway_create'"
               bodyPadding="6px 10px"
               :close-on-click-modal="false"
               @close="closeDialog"
               class="size-650"
    >
      <el-form labelWidth="0px" size="mini">
        <el-form-item labelWidth="0px" class="message-show">
          <span style="font-weight: bold">请选择相关服务：</span>
        </el-form-item>
        <el-form-item labelWidth="0px" :error="action.data.errMsg">
          <paas-service-selector
                  ref="service-selector-for-gateway-create"
                  :addItemAll="{app: false, profile: false}"
                  :customConfig="{appId, profileId}"></paas-service-selector>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="mini" @click="handleDialogEvent($event, action.name.replace('open_dialog_', ''))">确定</el-button>
        </div>
        <div class="item">
          <el-button size="mini" @click="closeDialog">取消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="源IP限速"
               :visible="action.name === 'open_dialog_rate_limiting'"
               v-if="action.name === 'open_dialog_rate_limiting'"
               bodyPadding="6px 10px"
               :close-on-click-modal="false"
               @close="closeDialog"
               class="size-800 update-strategy"
    >
      <div class="content">
        <el-form :model="rateLimiting" size="mini" label-width="240px" >
          <el-form-item label="应用名称：" prop="limitConnections" class="message-show">
            <span> {{rateLimiting.appName}} </span>
          </el-form-item>
          <el-form-item label="运行环境：" prop="limitConnections" class="message-show">
            <span> {{rateLimiting.spaceName}} </span>
          </el-form-item>
          <el-form-item label="网关名称：" prop="limitConnections" class="message-show">
            <span> {{rateLimiting.gatewayName}} </span>
          </el-form-item>
          <el-form-item label="域名：" prop="limitConnections" class="message-show">
            <span> {{rateLimiting.host}} </span>
          </el-form-item>

          <el-form-item label="每个源IP可建立的最大连接数：" prop="limitConnections" class="message-show">
            <el-input-number v-model="rateLimiting.limitConnections" type="number" :min="0"></el-input-number>
            <i class="paas-icon-question" style="font-size: 12px; color: #E6A23C;" v-pop-on-mouse-over="'可建立的最大连接数必须为正数'"></i>
          </el-form-item>
          <el-form-item label="每个源IP每分钟最大请求次数：" prop="limitRpm" class="message-show">
            <el-input-number v-model="rateLimiting.limitRpm" type="number" :min="0"></el-input-number>
            <i class="paas-icon-question" style="font-size: 12px; color: #E6A23C;" v-pop-on-mouse-over="'每分钟最大请求次数必须为正数'"></i>
          </el-form-item>
          <el-form-item label="每个源IP每秒最大请求次数：" prop="limitRps" class="message-show">
            <el-input-number v-model="rateLimiting.limitRps" type="number" :min="0"></el-input-number>
            <i class="paas-icon-question" style="font-size: 12px; color: #E6A23C;" v-pop-on-mouse-over="'每秒最大请求次数必须为正数'"></i>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent($event, 'config_rate_limiting')">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button @click="closeDialog" size="mini">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
</style>
<style lang="scss" scoped>
  #gateway-list {
    display: flex;
    flex-direction: column;
    background-color: white;
    height:100%;
    max-width: 1500px;
    & > .header {
      padding: 3px 5px;
      font-size: 14px;
      min-height: 28px;
      .item {
        display: inline-block;
        margin-right: 5px;
      }
      .el-select {
        width: 180px;
      }
      .toggle-warning {
        display: inline-block;
        line-height: 24px;
        margin-left: 12px;
        color: #eb9e05;
      }
    }
    > .list {
      flex: 1;
      position: relative;
    }
  }
</style>

<script>
  import paasServiceSelector from '../components/service-selector.vue';
  import PaasVersionSelector from "../components/version-selector";
  import commonUtils from 'assets/components/mixins/common-utils';

  export default {
    mixins: [commonUtils],
    components: {paasServiceSelector, PaasVersionSelector},

    /**
     * the sequence of create and mount in parent and child element is:
     * create parent -> create children -> mount children -> mount parent
     *
     */
    created() {
      const query = this.$route.query;
      // NOTICE: affect logic: config4ServiceSelector -> onServiceSelected -> profileId -> updateListByPage(true)
      query.hasOwnProperty('appId') && (this.config4ServiceSelector.appId = parseInt(query.appId));
      query.hasOwnProperty('profileId') && (this.config4ServiceSelector.profileId = parseInt(query.profileId));
      query.hasOwnProperty('currentPage') && (this.currentPage = parseInt(decodeURIComponent(query.currentPage)));
      query.hasOwnProperty('pageSize') && (this.pageSize = parseInt(decodeURIComponent(query.pageSize)));
      query.hasOwnProperty('filterKey') && (this.filterKey = decodeURIComponent(query.filterKey));
    },
    mounted() {
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
    },
    beforeDestroy() {
    },
    computed: {
    },
    data() {
      return {
        config4ServiceSelector: {
          appId: this.$storeHelper.APP_ID_FOR_ALL,
          profileId: ''
        },

        appInfo: null,
        profileInfo: null,
        appId: this.$storeHelper.APP_ID_FOR_ALL,
        profileId: null,
        filterKey: '',

        heightOfTable: '',
        gatewayList: [],
        listFiltered: [],
        listByPage: [],

        currentPage: 1,
        pageSize: 15,

        rateLimiting: {
          appName: '',
          groupId: '',
          spaceName: '',
          spaceId: '',
          gatewayName: '',
          host: '',
          limitConnections:'',
          limitRpm:'',
          limitRps:''
        },
        gatewayStatusFromNet: [],
        query: {
          appId: this.$storeHelper.APP_ID_FOR_ALL,
          profileId: '',
          currentPage: 1,
          pageSize: 15,
          filterKey: ''
        }
      };
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
      appId(appId) {
        this.setQuery({appId});
        this.updateListByPage(false);
      },
      profileId(profileId) {
        this.setQuery({profileId});
        this.updateListByPage(true);
      },
      filterKey(filterKey) {
        this.setQuery({filterKey});
        this.updateListByPage(false);
      },
      currentPage(currentPage) {
        this.setQuery({currentPage});
        this.updateListByPage(false);
      },
      pageSize(pageSize) {
        this.setQuery({pageSize});
        this.updateListByPage(false);
      },
    },
    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          size = this.$storeHelper.screen.size;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - 24;
          // this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 15 : 12;
        } catch(err) {
        }
      },
      handleSuccessCopy(evt) {
        this.$storeHelper.globalTip.show({
          ref: evt.trigger,
          msg: '复制成功'
        });
      },

      /**
       * get current app/profile(service) selected
       * NOTICE: at start of this page, requestList should be called when onServiceSelected is called
       */
      onServiceSelected(selectedApp, selectedProfile) {
        if (!selectedApp || !selectedProfile) {
          return;
        }
        if (!this.$utils.hasProps(selectedApp, 'appId')) {
          console.log(`selectedApp.appId not exist!`);
          return;
        }
        if (!this.$utils.hasProps(selectedProfile, 'id')) {
          console.log(`selectedProfile.id not exist!`);
          return null;
        }
        this.appInfo = selectedApp;
        this.profileInfo = selectedProfile;
        this.appId = selectedApp.appId;
        this.profileId = selectedProfile.id;
        // console.log(selectedApp, selectedProfile);
      },
      getSelectedService() {
        const {selectedApp, selectedProfile} = this.$refs['service-selector'].getSelectedInfo();
        this.onServiceSelected(selectedApp, selectedProfile);
      },

      async _requestList() {
        var result = [];
        try {
          const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_list, {
            payload: {
              groupId: this.$storeHelper.groupInfo.id,
              spaceId: this.profileId,
            }
          });
          resData.forEach(it => {
            it.gatewayName = it.gatewayName ? it.gatewayName : '---';
            it.appName = it.appName ? it.appName : '---';
            it.paths = (Array.isArray(it.paths) && it.paths.length > 0) ? it.paths.join(',') : '---';
            // const profileInfo = this.$storeHelper.getProfileInfoByID(it.spaceId);
            // it.profileDescription = profileInfo ? profileInfo.description : '---';
            // it.domain = (Array.isArray(it.domainList) && it.domainList.length > 0) ? it.domainList.join(', ') : '---';
            if (it['createTimestamp']) {
              it.formattedCreateTime = this.$utils.formatDate(it.createTimestamp, 'yyyy-MM-dd hh:mm:ss').split(' ');
            } else {
              it.formattedCreateTime = '---';
            }
          });
          result = resData;
        } catch(err) {
        }
        return result;
      },
      async updateListByPage(refresh) {
        if (refresh) {
          this.gatewayList = await this._requestList();
        }
        let filterReg = null;
        if (this.filterKey) {
          filterReg = new RegExp(this.filterKey, 'i');
        }
        const listFiltered = this.gatewayList.filter(it => {
          if (this.$storeHelper.APP_ID_FOR_ALL == this.appId) {
            return true;
          } else {
            return it.appId == this.appId;
          }
        }).filter(it => {
          if (!filterReg) {
            return true;
          } else {
            return filterReg.test(`${it.gatewayName}${it.appName}${it.host}`)
          }
        });

        if (!this.$utils.isNumber(parseInt(this.currentPage))) {
          this.currentPage = 1;
          return;
        }
        const maxPageSize = Math.ceil(listFiltered.length / this.pageSize);
        if (maxPageSize >= 1 && this.currentPage > maxPageSize) {
          this.currentPage = maxPageSize;
        }
        var page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;

        this.listFiltered = listFiltered;
        this.listByPage = listFiltered.slice(start, end);
      },

      async handleTRClick(evt, action, row, index) {
        switch (action) {
          case 'gateway_modify':
            this.$router.push({
              name: 'gateway_modify',
              params: {
                name: encodeURIComponent(row.gatewayName)
              },
              query: {
                groupId: this.$storeHelper.groupInfo.id,
                appId: row.appId,
                profileId: row.spaceId,
                gatewayName: row.gatewayName
              }
            });
            break;
          case 'gateway_detail':
            this.$router.push({
              name: 'gateway_detail',
              params: {
                name: encodeURIComponent(row.gatewayName)
              },
              query: {
                groupId: this.$storeHelper.groupInfo.id,
                appId: row.appId,
                profileId: row.spaceId,
                gatewayName: row.gatewayName
              }
            });
            break;
          case 'gateway_delete':
            try {
              await this.$confirm(`删除API网关配置 "${row.gatewayName}" 吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_delete, {
                data: {
                  groupId: this.$storeHelper.groupInfo.id,
                  appId: row.appId,
                  spaceId: row.spaceId,
                  gatewayName: row.gatewayName
                }
              });
              this.$message.success(`网关配置 "${row.gatewayName}" 已删除！`);
              this.updateListByPage(true);
            } catch (err) {
              console.log(err);
            }

            break;
          case 'open_dialog_rate_limiting':
            if (!row.appId || !row.gatewayName || !row.spaceId || !row.groupId) {
              this.$message.error('该网关不能设置原IP限速功能！');
              return;
            }
            const query = {
              groupId: row.groupId,
              appId: row.appId,
              spaceId: row.spaceId,
              gatewayName: row.gatewayName
            };
            try {
              // 获取服务端API配置信息
              const gatewayStatusFromNet = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_create_related, {
                query
              });
              console.log(gatewayStatusFromNet);
              this.gatewayStatusFromNet = gatewayStatusFromNet;
              this.rateLimiting.appName = this.gatewayStatusFromNet.appName;
              this.rateLimiting.spaceName = this.gatewayStatusFromNet.spaceName;
              this.rateLimiting.gatewayName = this.gatewayStatusFromNet.gatewayName;
              this.rateLimiting.host = this.gatewayStatusFromNet.host;
              this.rateLimiting.groupId = row.groupId;
              this.rateLimiting.spaceId = row.spaceId;

              this.rateLimiting.limitConnections = this.gatewayStatusFromNet.limitConnections;
              this.rateLimiting.limitRpm = this.gatewayStatusFromNet.limitRpm;
              this.rateLimiting.limitRps = this.gatewayStatusFromNet.limitRps;

              const limitingData = await this.openDialog(action, {
                errMsg: ''
              });

            } catch (err) {
              console.log(err);
            } finally {
              this.closeDialog();
            }
            break;
        }
      },

      async handleClick(evt, action) {
        switch (action) {
          case 'open_dialog_gateway_create':
            const dialogData = await this.openDialog(action, {
              errMsg: ''
            });
            this.$router.push({
              path: this.$router.helper.pages['/profile/gateway/add'].fullPath,
              query: {
                groupId: this.$storeHelper.groupInfo.id,
                appId: dialogData.appId,
                profileId: dialogData.profileId
              }
            });
            break;
          case 'refresh':
            this.updateListByPage(true);
            break;
        }

      },
      async handleDialogEvent(evt, action) {
        switch (action) {
          case 'gateway_create':
            try {
              const {selectedApp, selectedProfile} = this.$refs['service-selector-for-gateway-create'].getSelectedInfo();
              const serviceModel = await this.$net.getServiceByAppIdAndSpaceId(selectedApp.appId, selectedProfile.id);
              this.action.promise.resolve({
                appId: selectedApp.appId,
                profileId: selectedProfile.id
              });
            } catch (err) {
              this.action.data.errMsg = err.message;
            } finally {
            }
            break;
          case 'config_rate_limiting':
            try {
              const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_update_rate_limiting, {
                payload: {
                  gatewayName: this.rateLimiting.gatewayName,
                  groupId: this.rateLimiting.groupId,
                  spaceId: this.rateLimiting.spaceId,
                  limitConnections: this.rateLimiting.limitConnections,
                  limitRpm: this.rateLimiting.limitRpm,
                  limitRps: this.rateLimiting.limitRps,
                }
              });

              this.action.promise.resolve({
                gatewayName: this.rateLimiting.gatewayName,
                profileId: this.rateLimiting.spaceId
              });
            } catch (err) {
              console.log(err);
              this.action.data.errMsg = err.message;
            } finally {

            }
            break;
        }
      },

      setQuery(objOrKey, value) {
        if (this.$utils.isObject(objOrKey)) {
          for (let key in objOrKey) {
            value = objOrKey[key];
            this.setQuery(key, value);
          }
        } else {
          if (this.query.hasOwnProperty(objOrKey)) {
            this.query[objOrKey] = encodeURIComponent(value);
          }
          this.$router.push({
            name: 'gateway_list',
            query: this.query
          });
        }
      }
    }
  };
</script>
