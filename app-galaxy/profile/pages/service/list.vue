<template>
  <div id="service-list">
    <div class="header">
      <el-tabs type="border-tab" v-model="profileName">
        <el-tab-pane v-for="item in $storeHelper.profileListOfGroup" :label="item.description" :name="item.name"
                     :key="item.id"></el-tab-pane>
      </el-tabs>
      <div class="operation">
        <el-button
                size="mini-extral"
                type="primary"
                @click="handleButtonClick($event, 'service_create')"
                :class="{'disabled': $storeHelper.permission['service_create'].disabled && !haveService, 'flex': true}">
          <span>创建服务</span><i class="paas-icon-level-up"></i>
        </el-button>
        <!--<el-button size="mini-extral"-->
                   <!--type="primary"-->
                   <!--:class="{'flex': true, 'disabled': $storeHelper.permission['middleware_mariadb_instance_create'].disabled}"-->
                   <!--@click="handleButtonClick($event, 'middleware_mariadb_instance_create')">-->
          <!--<span>申请实例</span><i class="paas-icon-level-up"></i>-->
        <!--</el-button>-->
        <el-button size="mini-extral"
                   type="primary"
                   @click="handleButtonClick($event, 'refresh-list')">
          <span>刷新列表</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
        </el-button>
      </div>
    </div>
    <div class="list">
      <el-table :data="serviceListByPage"
                stripe
                :height="heightOfTable">
        <el-table-column label="语言版本" headerAlign="center" align="center" width="80">
          <template slot-scope="scope">
            <svg :class="['paas-icon-svg', 'paas-icon-' + scope.row.language.name]" aria-hidden="true" v-if="scope.row.language.name">
              <use :xlink:href="'#paas-icon-' + scope.row.language.name"></use>
            </svg>
            <div class="language" v-else>{{scope.row.language.name ? scope.row.language.name : '语言名未知'}}</div>
            <div class="version" v-if="scope.row.language.version">{{scope.row.language.version}}</div>
            <div v-else>版本未知</div>
          </template>
        </el-table-column>
        <el-table-column label="应用名称" prop="appName" headerAlign="left" align="left" minWidth="100"></el-table-column>
        <el-table-column label="项目名称" prop="tag" headerAlign="left" align="left" minWidth="100"></el-table-column>
        <el-table-column label="二级域名" prop="serviceName" headerAlign="left" align="left" minWidth="100"></el-table-column>
        <el-table-column label="剩余有效时间" prop="remainExpiredDays" headerAlign="center" align="center" width="100"></el-table-column>
        <el-table-column label="创建日期" prop="formattedCreateTime" headerAlign="center" align="center" width="100">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" headerAlign="left" align="left" minWidth="180">
          <template slot-scope="scope">
            <el-button
                    type="text"
                    :class="['primary', 'flex']"
                    @click="handleTRClick($event, 'service_edit', scope.$index, scope.row)">
              <span>修改配置</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    :loading="statusOfWaitingResponse('service_deploy')"
                    v-if="!isProductionProfile"
                    @click="handleTRClick($event, 'service_deploy', scope.$index, scope.row)"
                    :class="$storeHelper.permission['service_deploy'].disabled ? 'disabled' : 'danger'">
                  {{statusOfWaitingResponse('deploy') ? '部署中': '部署'}}
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    v-if="!isProductionProfile"
                    type="text"
                    :loading="statusOfWaitingResponse('quick_deploy')"
                    @click="handleTRClick($event, 'quick_deploy', scope.$index, scope.row)"
                    :class="reason4DisableQuickDeploy() ? 'disabled' : 'danger'">
                  {{statusOfWaitingResponse('quick_deploy') ? '部署中': '重启'}}
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    :loading="statusOfWaitingResponse('service_stop')"
                    @click="handleTRClick($event, 'service_stop', scope.$index, scope.row)"
                    :class="$storeHelper.permission['service_stop'].disabled ? 'disabled' : 'danger'">
              停止
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    :loading="statusOfWaitingResponse('service_delete')"
                    @click="handleTRClick($event, 'service_delete', scope.$index, scope.row)"
                    :class="$storeHelper.permission['service_delete'].disabled ? 'disabled' : 'danger'">
              删除
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    v-if="isProductionProfile"
                    size="small"
                    type="text"
                    :class="['primary']"
                    @click="handleTRClick($event,'go-to-work-order-todo-add', scope.$index, scope.row)">
              <span>申请工单</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div v-if="isProductionProfile" class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    :class="['flex', 'primary']"
                    @click="handleTRClick($event, 'go-to-page-log-deploy-from-service', scope.$index, scope.row)">
              <span>部署日志</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    :class="['flex', 'primary']"
                    @click="handleTRClick($event, 'go-to-instance-list', scope.$index, scope.row)">
              <span>实例列表</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    v-if="$storeHelper.groupVersion === 'v2'"
                    @click="handleTRClick($event, 'go-page-domain-from-service', scope.$index, scope.row)"
                    :class="$storeHelper.permission['go-page-domain-from-service'].disabled ? 'disabled' : 'primary'">
              <span>配置外网二级域名</span><i class="paas-icon-level-up"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<style lang="scss">
  #service-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 1500px;
    background: white;
    > .header {
      .el-tabs {
        /*border-right: 1px solid #dfe4ed;*/
        &.el-tabs--border-tab {
          background-color: #f4f5f5;
          #tab-fpdev.is-active {
            border-top-color: $g-env-fpdev-color;
            color: $g-env-fpdev-color;
          }
          #tab-test.is-active {
            border-top-color: $g-env-test-color;
            color: $g-env-test-color;
          }
          #tab-performance.is-active {
            border-top-color: $g-env-performance-color;
            color: $g-env-performance-color;
          }
          #tab-beta.is-active {
            border-top-color: $g-env-beta-color;
            color: $g-env-beta-color;
          }
          #tab-production.is-active {
            border-top-color: $g-env-production-color;
            color: $g-env-production-color;
          }

          > .el-tabs__header {
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
        text-align: right;
        /*flex: 1;*/
        /*display: inline-flex;*/
        /*align-items: center;*/
        /*border-top: 1px solid #dfe4ed;*/
      }
    }
    > .list {
      .el-table {
        td {
          padding: 0px 3px;
        }
      }

    }
  }
</style>
<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    mixins: [commonUtils],
    created() {
    },
    mounted() {
      this.onProfileList(this.$storeHelper.profileListOfGroup);
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
      // first requestServiceList will be called by change of profileName
      // this.requestServiceList();

//      if (this.$storeHelper.profileListOfGroup)
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
      '$storeHelper.profileListOfGroup': 'onProfileList',
      // changed by el-tab
      profileName(profileName) {
        var target = null;
        this.$storeHelper.profileListOfGroup.some(it => {
          if (it.name === profileName) {
            target = it;
          }
        });
        if (target) {
          this.profileInfo = target;
        }
        this.requestServiceList();
      }
    },
    data() {
      return {
        heightOfTable: '',

        profileName: null,
        profileInfo: null,
        isProductionProfile: false,
        serviceList: [],
        serviceListByPage: [],
        appWithoutService: [],

        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        action: {
          name: null,
          row: null
        }

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
          this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
        } catch(err) {
        }
      },
      onProfileList(profileList) {
        if (profileList && profileList.length > 0) {
          this.profileName = profileList[0]['name'];
          this.profileInfo = profileList[0];
          this.isProductionProfile = (this.profileName === 'production');
        }
      },
      handleButtonClick(evt, action) {
        switch (action) {
          case 'service_create':
            this.goToPageServiceAdd();
            break;
          case 'refresh-list':
            this.requestServiceList();
            break;
        }
      },

      // collect all related info for add-service before jump to page service/add
      getInfoForAddService() {
        let result = {
          success: false,
          message: '',
          content: null,
        };
        // check group info
        let groupInfo = this.$storeHelper.groupInfo;
        if (!groupInfo) {
          result.message = '未找到团队相关信息！';
          return result;
        }
        // app info
        let appInfo = this.$storeHelper.getAppByID(this.selectedAppID);
        let appName = null;
        let language = null;
        let languageVersion = null;
        if (appInfo && appInfo.hasOwnProperty('appName') && appInfo.hasOwnProperty('language')) {
          appName = appInfo.appName;
          language = appInfo.language.name;
          languageVersion = appInfo.language.version;
        } else {
          result.message = '未找到应用相关信息！';
          return result;
        }

        if (!this.selectedProfileID) {
          result.message = '未找到运行环境相关信息';
          return;
        }

        if (appName && language && languageVersion && null !== this.selectedProfileID) {
          result.success = true;
          result.content = {
            appInfo,
            appName,
            language,
            languageVersion,
            groupTag: groupInfo['tag'],
            appId: this.selectedAppID,
            profileId: this.selectedProfileID,
          }
        } else {
          console.log('error: infoForAddService');
        }
        return result;
      },


      goToPageServiceAdd() {
        const basicInfo = {
          profileInfo: this.profileInfo
        };
        this.$storeHelper.dataTransfer = {
          from: this.$net.page['profile/service'],
          data: Object.assign(basicInfo, {
            appWithoutService: this.appWithoutService,
//            serviceInfo: this.action.row
          })
//          data: JSON.parse(JSON.stringify(Object.assign(this.model, infoForAddService.content))),
        };
        this.$router.push(this.$net.page['profile/service/add']);
      },

      async goToPageServiceModify(row) {
        const basicInfo = {
          profileInfo: this.profileInfo
        };
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {
          payload: {
            appId: row.appId,
            spaceId: this.profileInfo.id
          }
        });
        console.log(resContent);
        const parsedContent = this.$net.parseServiceList(resContent);
        console.log(parsedContent);

        var model = null;
        if (parsedContent.hasOwnProperty("serviceModelList")) {
          model = parsedContent["serviceModelList"][0];
        }

        if (model) {
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            data: JSON.parse(JSON.stringify(Object.assign(basicInfo, {
              serviceInfo: model
            })))
          };
          console.log(this.appWithoutService);
          console.log(model);
          this.$router.push(this.$net.page['profile/service/modify']);
        } else {

        }
      },

      // add/modify service
      // TODO: not used
      goToPageServiceAdd1(type) {
        const infoForAddService = this.getInfoForAddService();
        if (!infoForAddService.success) {
          this.$message.error(infoForAddService.message);
          return;
        }
        // 没有服务就是添加，有服务就是修改
        if (type === 'edit') {
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            type: 'edit',
            data: JSON.parse(JSON.stringify(Object.assign(this.model, infoForAddService.content))),
          };
          this.$router.push(this.$net.page['profile/service/modify']);
        } else {
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            type: 'add',
            data: infoForAddService.content
          };
          this.$router.push(this.$net.page['profile/service/add']);
        }
      },

      handleTRClick(evt, action, index, row) {
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        this.action.name = action;
        this.action.row = row;
        switch (action) {
          case 'service_edit':
            this.goToPageServiceModify(row);
            break;
          case 'go-to-page-log-deploy-from-service':
          case 'go-to-instance-list':
          case 'go-page-domain-from-service':
            const data = {
              appId: row.appId,
              profileId: this.profileInfo.id,
              serviceId: row.id,
            };
            console.log(row);
            console.log(data);
            if (!data.appId || !data.profileId || !data.serviceId) {
              this.$message.error('所需信息不完整！');
              return;
            }
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/service'],
              data
            };
            const PATH_MAP = {
              'go-to-page-log-deploy-from-service': this.$net.page['profile/log/deploy'],
              'go-to-instance-list': this.$net.page['profile/instance'],
              'go-page-domain-from-service': this.$net.page['profile/domain']
            };
            this.$router.push(PATH_MAP[action]);
            break;
        }
      },

      // 是否支持快速部署：1. 是k8s应用，2. 有正在运行的实例
      reason4DisableQuickDeploy() {
        var reason = false;
//        if (this.model && this.runningInfo) {
//          if (this.model['k8s'] !== 1) {
//            reason = '老mesos应用不支持';
//          } else if (!this.runningInfo['status'] || !this.runningInfo['status']['Running'] || this.runningInfo['status']['Running'] == 0) {
//            reason = '运行实例数为0，不能进行重启操作！';
//          }
//        }
        return reason;
      },

      // TODO: not used
      parseServiceList(serviceList) {
        const  LANGUAGE_MAP = {
          'JAVA': 'java',
          'NODE_JS': 'nodejs',
          'PYTHON': 'python',
          'PHP': 'php'
        };
        const transform = it => {
          var result = {};
          ['language', 'languageVersion', 'serviceName', 'remainExpiredDays'].forEach(prop => {
            result[prop] = it[prop];
          });
          result = Object.assign(result, {
            formattedCreateTime: this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss').split(' '),
            languageLogo: LANGUAGE_MAP[it.language],
          });
          return result;
        };
        return serviceList.map(transform);
      },

      async requestServiceList() {
        this.serviceList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_profile, {
          payload: {
            groupId: this.$storeHelper.currentGroupID,
            spaceId: this.profileInfo.id
          }
        });
        const parsedResContent = this.$net.parseServiceList(resContent);
        this.serviceList = parsedResContent['serviceModelList'];
        this.serviceListByPage = this.serviceList;
        this.totalSize = parsedResContent.total;

        this.appWithoutService = [];
        if (parsedResContent.hasOwnProperty('tobeInsertList')) {
          this.appWithoutService = this.$storeHelper.appInfoListOfGroup['appModelList'].filter(it => {
            return parsedResContent['tobeInsertList'].indexOf(it['appId']) > -1;
          });
        }
        console.log(parsedResContent);
      }
    }
  }
</script>