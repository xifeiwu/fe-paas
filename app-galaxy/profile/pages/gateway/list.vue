<template>
  <div id="gateway-list">
    <div class="header">
      <div class="item">
        <paas-service-selector
                ref="service-selector"
                :addItemAll="{app: true, profile: false}"
                :selected="query"></paas-service-selector>
      </div>
      <div class="item">
        <el-input size="mini" placeholder="按关键字搜索"
                  style="max-width: 360px;"
                  v-model="query.filterKey">
          <i slot="prefix" class="el-icon-search"></i>
          <i :class="query.filterKey && query.filterKey.length > 0 ? 'paas-icon-close' : ''"
             slot="suffix"
             @click="evt => query.filterKey=''"></i>
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
                minWidth="80"
                headerAlign="left" align="left">
        </el-table-column>
        <el-table-column
                label="域名"
                prop="host"
                minWidth="100"
                headerAlign="left" align="left">
        </el-table-column>
        <el-table-column
                label="应用名称"
                prop="appName"
                minWidth="80"
                headerAlign="center" align="center">
        </el-table-column>
        <!--<el-table-column-->
        <!--label="运行环境"-->
        <!--prop="profileDescription"-->
        <!--width="120"-->
        <!--headerAlign="center" align="center">-->
        <!--</el-table-column>-->
        <el-table-column
                label="请求路径"
                prop="allPath"
                width="100"
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
        <el-table-column
                label="策略配置"
                width="80"
                headerAlign="center" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.isRewrite" style="display: inline-flex; align-items: center; cursor: pointer"
                  @mouseenter="handleTRClick($event, 'tip_on_mouse_enter', 'path_rewrite')">
              <span>请求改写</span><i class="paas-icon-question" style="font-size: 12px;"></i>
            </span>
            <span v-else-if="scope.row.configList.length > 0" style="display: inline-flex; align-items: center; cursor: pointer"
                  @mouseenter="handleTRClick($event, 'gateway_config_show', scope.row, scope.$index)">
              <span>配置详情</span><i class="paas-icon-popover" style="margin-left: 2px;"></i>
            </span>
            <span v-else>---</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operation" headerAlign="center" align="center" minWidth="120">
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
                @click="handleTRClick($event, 'open_dialog_config_rate_limiting', scope.row, scope.$index)"
            >
              <span>源IP限速</span>
            </el-button>
            <div class="ant-divider"></div>
            <el-button v-if="!scope.row.isRewrite"
                    type="text"
                    :class="['flex', 'warning']"
                    @click="handleTRClick($event, 'open_dialog_config_path_rewrite', scope.row, scope.$index)"
            >
              <span>请求改写</span>
            </el-button>
            <div class="ant-divider" v-if="!scope.row.isRewrite"></div>
            <el-button
                    type="text"
                    :class="['flex', 'warning']"
                    @click="handleTRClick($event, 'open_dialog_config_copy_request', scope.row, scope.$index)"
            >
              <span>流量复制</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="listFiltered.length > query.pageSize">
        <div class="pagination">
          <el-pagination
                  size="mini"
                  @size-change="val => this.query.pageSize = val"
                  :background="false"
                  :current-page.sync="query.currentPage"
                  :page-size="query.pageSize"
                  :page-sizes="[10, 15, 20, 30]"
                  layout="total, sizes, prev, pager, next, jumper"
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
               :visible="action.name === 'open_dialog_config_rate_limiting'"
               v-if="action.name === 'open_dialog_config_rate_limiting'"
               bodyPadding="6px 10px"
               :close-on-click-modal="false"
               @close="closeDialog"
               class="size-700 config_rate_limiting"
    >
      <div class="content">
        <el-form :model="action.data" size="mini" label-width="180px" >
          <el-form-item label="网关名称"class="message-show">
            <span> {{action.data.gatewayName}} </span>
          </el-form-item>
          <el-form-item label="域名" class="message-show">
            <span> {{action.data.host}} </span>
          </el-form-item>
          <el-form-item label="应用名称/运行环境" class="message-show">
            <span> {{action.data.appName}} /  {{action.data.spaceName}}</span>
          </el-form-item>
          <el-form-item label="最大连接数" class="config message-show">
            <el-checkbox size="mini" v-model="action.data.limitConnectionsSelected">
              自定义配置
            </el-checkbox>
            <i class="paas-icon-question" style="font-size: 12px; color: #E6A23C;" v-pop-on-mouse-over="'每个源IP可建立的最大连接数'"></i>
            <el-input-number v-if="action.data.limitConnectionsSelected" v-model="action.data.limitConnections" type="number" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item label="每分钟最大请求次数" prop="limitRpm" class="config message-show">
            <el-checkbox size="mini" v-model="action.data.limitRpmSelected">
              自定义配置
            </el-checkbox>
            <i class="paas-icon-question" style="font-size: 12px; color: #E6A23C;" v-pop-on-mouse-over="'每个源IP每分钟最大请求次数'"></i>
            <el-input-number v-if="action.data.limitRpmSelected" v-model="action.data.limitRpm" type="number" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item label="每秒最大请求次数" prop="limitRps" class="config message-show">
            <el-checkbox size="mini" v-model="action.data.limitRpsSelected">
              自定义配置
            </el-checkbox>
            <i class="paas-icon-question" style="font-size: 12px; color: #E6A23C;" v-pop-on-mouse-over="'每个源IP每秒最大请求次数'"></i>
            <el-input-number v-if="action.data.limitRpsSelected" v-model="action.data.limitRps" type="number" :min="0"></el-input-number>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent($event, action.name.replace('open_dialog_', ''))">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button @click="closeDialog" size="mini">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="请求改写"
               :visible="action.name === 'open_dialog_config_path_rewrite'"
               v-if="action.name === 'open_dialog_config_path_rewrite'"
               bodyPadding="6px 10px"
               :close-on-click-modal="false"
               @close="closeDialog"
               class="size-700 config_path_rewrite"
    >
      <div class="content">
        <el-form :model="action.data" :rules="configRules" size="mini" label-width="180px" ref="configPathRewriteForm">
          <el-form-item label="网关名称"class="message-show">
            <span> {{action.data.gatewayName}} </span>
          </el-form-item>
          <el-form-item label="域名" class="message-show">
            <span> {{action.data.host}}</span>
          </el-form-item>
          <el-form-item label="应用名称/运行环境" class="message-show">
            <span> {{action.data.appName}} / {{action.data.spaceName}}</span>
          </el-form-item>
          <el-form-item label="当前路径" class="message-show">
            {{action.data.path}}
          </el-form-item>
          <el-form-item label="目标路径" prop="targetPath">
            <el-input size="mini" v-model="action.data.targetPath"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent($event, action.name.replace('open_dialog_', ''))">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button @click="closeDialog" size="mini">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="流量复制"
               :visible="action.name === 'open_dialog_config_copy_request'"
               v-if="action.name === 'open_dialog_config_copy_request'"
               bodyPadding="6px 10px"
               :close-on-click-modal="false"
               @close="closeDialog"
               class="size-700 config_copy_request"
    >
      <div class="content">
        <el-form :model="action.data" :rules="configRules" size="mini" label-width="160px" ref="not-set">
          <el-form-item label="网关名称"class="message-show">
            <span> {{action.data.gatewayName}} </span>
          </el-form-item>
          <el-form-item label="域名" class="message-show">
            <span> {{action.data.host}}</span>
          </el-form-item>
          <el-form-item label="应用名称/运行环境" class="message-show">
            <span> {{action.data.appName}} / {{action.data.spaceName}}</span>
          </el-form-item>
          <el-form-item label="接受请求流量的服务" class="target-service message-show">
            <el-select v-model="action.data.targetAppId" filterable>
              <el-option v-for="(item,index) in $storeHelper.appModelListOfGroup" :label="item.appName" :key="item.appId" :value="item.appId">
              </el-option>
            </el-select>
            <el-select v-model="action.data.targetProfileId" filterable>
              <el-option v-for="(item,index) in productionProfileListOfGroup" :label="item.description" :key="item.id" :value="item.id">
              </el-option>
            </el-select>
            <i class="paas-icon-question" style="font-size: 12px; color: #E6A23C;" v-pop-on-mouse-over="'只能重定向到生产环境的服务'"></i>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent($event, action.name.replace('open_dialog_', ''))">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button @click="closeDialog" size="mini">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  #gateway-list {
    .el-dialog__wrapper {
      &.config_rate_limiting {
        .el-form {
          .el-form-item.config {
            .el-input-number {
              margin-left: 30px;
            }
          }
        }
      }
      &.config_copy_request {
        .el-form {
          .el-form-item {
            &.target-service {
              .el-select {
                width: 240px;
              }
            }
          }
        }
      }
    }
  }
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
  import commonUtils from 'assets/components/mixins/common-utils';

  export default {
    mixins: [commonUtils],
    components: {paasServiceSelector},

    /**
     * the sequence of create and mount in parent and child element is:
     * create parent -> create children -> mount children -> mount parent
     *
     */
    created() {
      // NOTICE: affect logic: profileId -> updateListByPage(true)
      this.onRoute();
    },
    mounted() {
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
    },
    beforeDestroy() {
    },
    computed: {
      productionProfileListOfGroup() {
        return this.$storeHelper.profileListOfGroup.filter(it => it.spaceType == 'PRODUCTION');
      }
    },
    data() {
      return {
        heightOfTable: '',
        gatewayList: [],
        listFiltered: [],
        listByPage: [],

        query: {
          appId: this.$storeHelper.APP_ID_FOR_ALL,
          profileId: '',  // profileId set to '' to make sure it is changed on service-selector, then updateListByPage will be triggered
          currentPage: 1,
          pageSize: 15,
          filterKey: ''
        },

        configRules: {
          targetPath: [{
            trigger: ['blur', 'change'],
            validator(rule, values, callback) {
              let passed = true;
              if (values.length > 0) {
                const reg = /^\/[\u4e00-\u9fa5\w\-]{0,35}$/;
                if (!reg.test(values)) {
                  passed = false;
                  callback('以/开头，可以包含字母数字中划线，1-36个字符');
                }
              } else {
              }
              passed && callback();
            }
          }]
        }
      };
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
      '$route.fullPath'() {
        this.onRoute();
      },
      'query.appId'(appId) {
        this.updateQuery({appId});
        this.updateListByPage(false);
      },
      'query.profileId'(profileId) {
        this.updateQuery({profileId});
        this.updateListByPage(true);
      },
      'query.filterKey'(filterKey) {
        this.updateQuery({filterKey});
        this.updateListByPage(false);
      },
      'query.currentPage'(currentPage) {
        this.updateQuery({currentPage});
        this.updateListByPage(false);
      },
      'query.pageSize'(pageSize) {
        this.updateQuery({pageSize});
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
      onRoute() {
        const query = this.$route.query;
        query.hasOwnProperty('appId') && (this.query.appId = parseInt(query.appId));
        query.hasOwnProperty('profileId') && (this.query.profileId = parseInt(query.profileId));
        query.hasOwnProperty('currentPage') && (this.query.currentPage = parseInt(decodeURIComponent(query.currentPage)));
        query.hasOwnProperty('pageSize') && (this.query.pageSize = parseInt(decodeURIComponent(query.pageSize)));
        query.hasOwnProperty('filterKey') && (this.query.filterKey = decodeURIComponent(query.filterKey));
      },
      handleSuccessCopy(evt) {
        this.$storeHelper.globalTip.show({
          ref: evt.trigger,
          msg: '复制成功'
        });
      },

      _updateRowInfo(it) {
        it.gatewayName = it.gatewayName ? it.gatewayName : '---';
        it.appName = it.appName ? it.appName : '---';
        it.allPath = (Array.isArray(it.paths) && it.paths.length > 0) ? it.paths.join(',') : '---';
        it.path = (Array.isArray(it.paths) && it.paths.length > 0) ? it.paths[0] : '---';
        it.pathRewrite = it.pathRewrite ? it.pathRewrite : '';
        it.creatorName = it.creatorName ? it.creatorName : '---';
        // const profileInfo = this.$storeHelper.getProfileInfoByID(it.spaceId);
        // it.profileDescription = profileInfo ? profileInfo.description : '---';
        // it.domain = (Array.isArray(it.domainList) && it.domainList.length > 0) ? it.domainList.join(', ') : '---';
        if (it['createTimestamp']) {
          it.formattedCreateTime = this.$utils.formatDate(it.createTimestamp, 'yyyy-MM-dd hh:mm:ss').split(' ');
        } else {
          it.formattedCreateTime = '---';
        }

        if (it.copyTargetAppId) {
          it.targetApp = this.$storeHelper.appModelListOfGroup.find(it2 => it2.appId == it.copyTargetAppId);
        }
        if (it.copyTargetSpaceId) {
          it.targetProfile = this.$storeHelper.profileListAll.find(it2 => it2.id == it.copyTargetSpaceId);
        }
        it.configList = [];
        if (it.pathRewrite) {
          it.configList.push(`请求改写：${it.path} -> ${it.pathRewrite}`);
        }
        if (it.copyTargetAppId && it.targetApp && it.copyTargetSpaceId && it.targetProfile) {
          it.configList.push(`流量复制：${it.appName}/${it.spaceName} -> ${it.targetApp.appName}/${it.targetProfile.description}`);
        }
      },
      async _requestList() {
        var result = [];
        try {
          const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_list, {
            payload: {
              groupId: this.$storeHelper.groupInfo.id,
              spaceId: this.query.profileId,
            }
          });
          resData.forEach(this._updateRowInfo);
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
        if (this.query.filterKey) {
          filterReg = new RegExp(this.query.filterKey, 'i');
        }
        const listFiltered = this.gatewayList.filter(it => {
          if (this.$storeHelper.APP_ID_FOR_ALL == this.query.appId) {
            return true;
          } else {
            return it.appId == this.query.appId;
          }
        }).filter(it => {
          if (!filterReg) {
            return true;
          } else {
            return filterReg.test(`${it.gatewayName}${it.appName}${it.host}`)
          }
        });

        if (!this.$utils.isNumber(parseInt(this.query.currentPage))) {
          this.query.currentPage = 1;
          return;
        }
        const maxPageSize = Math.ceil(listFiltered.length / this.query.pageSize);
        if (maxPageSize >= 1 && this.query.currentPage > maxPageSize) {
          this.query.currentPage = maxPageSize;
        }
        var page = this.query.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.query.pageSize;
        const length = this.query.pageSize;
        const end = start + length;

        this.listFiltered = listFiltered;
        this.listByPage = listFiltered.slice(start, end);
      },

      async handleDialogEvent(evt, action) {
        switch (action) {
          case 'gateway_create':
            try {
              const {appModel, profileInfo} = this.$refs['service-selector-for-gateway-create'].getSelected();
              // const serviceModel = await this.$net.getServiceByAppIdAndSpaceId(appModel.appId, profileInfo.id);
              this.action.promise.resolve({
                appId: appModel.appId,
                profileId: profileInfo.id
              });
            } catch (err) {
              this.action.data.errMsg = err.message;
            } finally {
            }
            break;
          case 'config_rate_limiting':
            try {
              if (this.$utils.theSame(this.action.dataOrigin, this.action.data)) {
                this.$message.warning('您没有做任何修改。未向后端发送更新请求！');
                return;
              }
              this.action.promise.resolve(this.action.data);
            } catch (err) {
              console.log(err);
            } finally {
            }
            break;
          case 'config_path_rewrite':
            try {
              await this.$refs['configPathRewriteForm'].validate();
              this.action.promise.resolve(this.action.data);
            } catch (err) {
              console.log(err);
            }
            break;
          case 'config_copy_request':
            // console.log(this.action.data);
            try {
              const dialogData = this.action.data;
              const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_update_copy_request, {
                payload: {
                  gatewayName: dialogData.gatewayName,
                  groupId: dialogData.groupId,
                  spaceId: dialogData.spaceId,
                  appId: dialogData.appId,
                  targetAppId: dialogData.targetAppId,
                  targetSpaceId: dialogData.targetProfileId
                }
              });
              this.action.promise.resolve(this.action.data);
            } catch (err) {
              // console.log(err);
              this.$message.warning(err.message);
            }
            break;
        }
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
          case 'gateway_config_show':
            if (row.configList === 0) {
              return;
            }
            var content = ['<div style="width: 300px; font-size: 13px; color: black">',...row.configList.map(it => `<div style="; text-align: left">${it}</div>`), '</div>'].join('');
            this.$storeHelper.globalPopover.show({
              ref: evt.target,
              type: 'html',
              msg: content
            });
            break;
          case 'tip_on_mouse_enter':
            var content = {
              'path_rewrite': `<div style="font-size: 13px; color: black">为实现 '请求改写' 而新建的网关</div>`
            }[row];
            if (content) {
              this.$storeHelper.globalPopover.show({
                ref: evt.target,
                type: 'html',
                msg: content
              });
            }
            break;
          case 'open_dialog_config_rate_limiting':
            // console.log(row);
            if (!row.appId || !row.gatewayName || !row.spaceId || !row.groupId) {
              this.$message.error('该网关不能设置原IP限速功能！');
              return;
            }
            try {
              // 获取服务端API配置信息
              const gatewayStatus = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_create_related, {
                query: {
                  groupId: row.groupId,
                  appId: row.appId,
                  spaceId: row.spaceId,
                  gatewayName: row.gatewayName
                }
              });
              const dialogData = await this.openDialog(action, {
                gatewayName: gatewayStatus.gatewayName,
                appName: gatewayStatus.appName,
                spaceName: gatewayStatus.spaceName,
                host: gatewayStatus.host,             // 域名
                limitConnectionsSelected: gatewayStatus.limitConnectionsSelected,
                limitConnections: gatewayStatus.limitConnections,
                limitRpmSelected: gatewayStatus.limitRpmSelected,
                limitRpm: gatewayStatus.limitRpm,
                limitRpsSelected: gatewayStatus.limitRpsSelected,
                limitRps: gatewayStatus.limitRps,

                groupId: gatewayStatus.groupId,
                spaceId: gatewayStatus.spaceId,
              });

              const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_update_rate_limiting, {
                payload: {
                  gatewayName: dialogData.gatewayName,
                  groupId: dialogData.groupId,
                  spaceId: dialogData.spaceId,
                  limitConnectionsSelected: dialogData.limitConnectionsSelected,
                  limitRpmSelected: dialogData.limitRpmSelected,
                  limitRpsSelected: dialogData.limitRpsSelected,
                  limitConnections: dialogData.limitConnections,
                  limitRpm: dialogData.limitRpm,
                  limitRps: dialogData.limitRps,
                }
              });
              Object.assign(row, dialogData);   // update row by dialogData
              this.$message.success('更新成功！');
              this.closeDialog();
            } catch (err) {
              console.log(err);
            } finally {
            }
            break;
          case 'open_dialog_config_path_rewrite':
            // console.log(row);
            try {
              const dialogData = await this.openDialog(action, {
                gatewayName: row.gatewayName,
                appName: row.appName,
                spaceName: row.spaceName,
                host: row.host,             // 域名
                path: row.path,
                targetPath: row.pathRewrite,

                groupId: row.groupId,
                spaceId: row.spaceId,
              });
              const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_update_path_rewrite, {
                payload: {
                  gatewayName: dialogData.gatewayName,
                  groupId: dialogData.groupId,
                  spaceId: dialogData.spaceId,
                  pathRewrite: dialogData.targetPath
                }
              });
              // Object.assign(row, dialogData);   // update row by dialogData
              this.closeDialog();
              this.$message.success('更新成功！');
              this.updateListByPage(true);
            } catch (err) {
              console.log(err);
            } finally {
            }
            break;
          case 'open_dialog_config_copy_request':
            // console.log(row);
            // console.log(this.$storeHelper.profileListOfGroup);
            // console.log(this.$storeHelper.appInfoListOfGroup);
            if (!Array.isArray(this.$storeHelper.appModelListOfGroup) || (this.$storeHelper.appModelListOfGroup.length === 0)
              || !Array.isArray(this.productionProfileListOfGroup) || this.productionProfileListOfGroup.length === 0) {
              this.$message.error('数据不完整，应用列表为空或运行环境列表为空，请尝试刷新页面重试！');
              return;
            }


            var targetAppId = this.$storeHelper.appModelListOfGroup[0].appId;
            var targetProfileId = this.productionProfileListOfGroup[0].id;
            if (row.copyTargetAppId && row.targetApp && row.copyTargetSpaceId && row.targetProfile) {
              targetAppId = row.copyTargetAppId;
              targetProfileId = row.copyTargetSpaceId;
            }

            try {
              const dialogData = await this.openDialog(action, {
                gatewayName: row.gatewayName,
                appId: row.appId,
                appName: row.appName,
                spaceName: row.spaceName,
                host: row.host,             // 域名
                targetAppId,
                targetProfileId,

                groupId: row.groupId,
                spaceId: row.spaceId,
              });
              // Object.assign(row, dialogData);   // update row by dialogData
              this.closeDialog();
              this.$message.success('更新成功！');
              this.updateListByPage(true);
            } catch (err) {
              console.log(err);
            } finally {
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

      resetQuery() {
        const query = this.query;
        query.appId = this.$storeHelper.APP_ID_FOR_ALL;
        query.profileId = '';
        query.currentPage = 1;
        query.pageSize = 15;
        query.filterKey = '';
      },
      updateQuery() {
        if (this.$utils.theSame(this.query, this.$route.query)) {
          return;
        }
        this.$router.push({
          name: 'gateway_list',
          query: this.query
        });
//        if (this.$utils.isObject(objOrKey)) {
//          for (let key in objOrKey) {
//            value = objOrKey[key];
//            this.updateQuery(key, value);
//          }
//        } else {
//          if (this.query.hasOwnProperty(objOrKey)) {
//            this.query[objOrKey] = encodeURIComponent(value);
//          }
//          this.$router.push({
//            name: 'gateway_list',
//            query: this.query
//          });
//        }
      }
    }
  };
</script>
