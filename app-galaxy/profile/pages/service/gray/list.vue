<template>
  <div id="service-gray">
    <div class="header">
      <el-button size="mini" type="primary" style="margin-right: 5px" @click="handleClick($event, 'service_gray_create')">
        <span>创建灰度版本</span>
      </el-button>
      <el-button size="mini" type="primary" style="margin-right: 5px" @click="handleClick($event, 'open_dialog_service_gray_strategy')">
        <span>设置灰度策略</span>
      </el-button>
      <el-button size="mini" type="primary" style="margin-right: 5px" @click="handleClick($event, 'refresh')">
        <span>刷新</span>
        <i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
      </el-button>
    </div>
    <div class="list">
      <el-table :data="serviceList"
                stripe>
        <el-table-column label="服务版本" prop="serviceTypeName"></el-table-column>
        <el-table-column label="运行实例数/总实例数" prop="instanceStatus" headerAlign="center" align="center" width="200"></el-table-column>
        <el-table-column label="创建时间" prop="formattedCreateTime" headerAlign="center" align="center" width="200"></el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <el-button
                    v-if="scope.row['serviceType'] === 'canary'"
                    size="small"
                    type="text"
                    :loading="statusOfWaitingResponse('service_gray_update') && action.row.index == scope.$index"
                    :class="$storeHelper.actionDisabled['service_gray_update']? 'disabled' : 'warning'"
                    @click="handleTRClick($event, 'service_gray_update', scope.$index, scope.row)">
              {{'修改配置'}}
              </el-button>
            <div v-if="scope.row['serviceType'] === 'canary'" class="ant-divider"></div>
            <el-button
                    v-if="scope.row['serviceType'] === 'canary'"
                    size="small"
                    type="text"
                    :loading="statusOfWaitingResponse('service_gray_delete') && action.row.index == scope.$index"
                    :class="$storeHelper.actionDisabled['service_gray_delete']? 'disabled' : 'danger'"
                    @click="handleTRClick($event, 'service_gray_delete', scope.$index, scope.row)">
              {{'删除'}}
              </el-button>
            <div v-if="scope.row['serviceType'] === 'canary'" class="ant-divider"></div>
            <el-button v-if="!$storeHelper.actionDisabled['open-dialog-k8s-info']"
                       size="small"
                       type="text"
                       @click="handleTRClick($event, 'open-dialog-k8s-info', scope.$index, scope.row)"
                       :class="['primary', 'flex']">
              <span>K8S实时信息</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="action.name == 'open_dialog_service_gray_strategy'? '设置灰度策略':''"
               :visible="['open_dialog_service_gray_strategy', 'open_dialog_modify'].indexOf(action.name) > -1"
               v-if="['open_dialog_service_gray_strategy'].indexOf(action.name) > -1"
               @close="closeDialog"
               class="size-900 update-strategy"
               :close-on-click-modal="false"
    >
      <div class="content">
        <paas-dismiss-message :toExpand="true"
                              showSeconds="0"
                              @status-change="active => {this.showWarning = active; onScreenSizeChange()}"
                              style="margin: 0px -2px"
                              :msgList="['目前pipeline只支持Java语言的“平台构建镜像”方式，不支持自定义镜像；Pipeline的基本配置默认取自对应应用的测试环境配置。']"></paas-dismiss-message>
        <el-form :model="action.row" size="mini" label-width="100px" ref="newDomainForm">
          <el-form-item label="网络类型" class="">
            <el-checkbox-group v-model="grayStrategy.listIngress" v-if="grayStrategyFromNet.listIngress">
              <el-checkbox v-for="item in grayStrategyFromNet.listIngress" :label="item.host" :key="item.host">
                {{item.host}}{{item.isIntranet ? '(内网域名)' : ''}}
            </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="实例数" class="instance-number">
            <span>主服务实例数：{{grayStrategy.masterInstanceNum}}</span>
            <div style="width: 160px; display: inline-block; margin-left: 5px;">
              <el-slider v-model="grayStrategy.masterInstanceNum" :show-tooltip="true" :show-stops="true"
                         :min="1" :max="grayStrategyFromNet.totalInstanceNum" :step="1"></el-slider>
            </div>
            <span>灰度服务实例数：{{grayStrategy.canaryInstanceNum}}</span>
          </el-form-item>
          <el-form-item label="灰度策略" class="strategy">
            <el-row style="font-weight: bold">
              <el-col :span="4" class="name">流量类型</el-col>
              <el-col :span="16" class="value">关键字</el-col>
              <el-col :span="4" class="level">优先级</el-col>
            </el-row>
            <el-row class="rule request-header">
              <el-col :span="4" class="name"><el-checkbox v-model="grayStrategy.headerKeySelected">request header</el-checkbox></el-col>
              <el-col :span="16" class="value">
                <el-input v-model="grayStrategy.headerKey" placeholder="属性"></el-input>
                <span> = </span>
                <el-input v-model="grayStrategy.headerValue" placeholder="匹配值"></el-input>
              </el-col>
              <el-col :span="4" class="level">高</el-col>
            </el-row>
            <el-row class="rule">
              <el-col :span="4" class="name"><el-checkbox v-model="grayStrategy.cookieSelected">cookie</el-checkbox></el-col>
              <el-col :span="16" class="value"><el-input v-model="grayStrategy.cookie" placeholder="属性"></el-input></el-col>
              <el-col :span="4" class="level">中</el-col>
            </el-row>
            <el-row class="rule">
              <el-col :span="4" class="name"><el-checkbox v-model="grayStrategy.weightSelected">weight</el-checkbox></el-col>
              <el-col :span="16" class="value"><el-input v-model="grayStrategy.weight" placeholder="属性"></el-input></el-col>
              <el-col :span="4" class="level">低</el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent($event, 'service_gray_strategy_update')">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button @click="closeDialog" size="mini">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="K8S实时信息展示"
               v-if="action.name === 'open-dialog-k8s-info'"
               :visible="action.name === 'open-dialog-k8s-info'"
               class="size-1000 k8s-info"
               @close="closeDialog"
               :close-on-click-modal="false"
    >
      <div class="__editor">
        <codemirror v-model="action.data" :options="showK8sResourceOptions"></codemirror>
      </div>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
  #service-gray {
    background-color: white;
    height:100%;
    max-width: 1500px;
    display: flex;
    flex-direction: column;
    > .header {
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
    }
  }
</style>
<style lang="scss">
  #service-gray {
    > .el-dialog__wrapper {
      &.k8s-info {
        .__editor {
          text-align: left;
          min-height: 600px;
          margin: -2px;
          .CodeMirror {
            min-height: 600px;
          }
        }
      }
      &.update-strategy {
        .el-form {
          margin-top: 10px;
          .strategy {
            .rule {
              .el-input {
                max-width: 80%;
              }
              &.request-header {
                .value {
                  .el-input {
                    max-width: 40%;
                  }
                }
              }
            }
            .level {
              text-align: center;
            }
          }
        }
      }
    }
  }
</style>
<script>
  import {codemirror} from "vue-codemirror";
  import "codemirror/lib/codemirror.css";

  // language
  import "codemirror/mode/properties/properties.js";
  import "codemirror/mode/yaml/yaml.js";
  // theme
  import "codemirror/theme/monokai.css";
  // require active-line.js
  import "codemirror/addon/selection/active-line.js";
  import paasDismissMessage from 'assets/components/dismiss-message.vue';
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    components: {paasDismissMessage, codemirror},
    mixins: [commonUtils],
    async created() {
      if (this.$route.params && this.$route.params.hasOwnProperty('id')) {
        this.serviceId = this.$route.params['id'];
      }
      if (!this.serviceId) {
        this.$message.error('未找到serviceId');
        this.$router.push(this.$router.helper.pages['/profile/service/list']);
        return;
      }
      this.requestServiceList();

      const {serviceInfo, profileInfo} = await this.getData4GrayCreate();
      if (!serviceInfo || !profileInfo) {
        this.$message.error('获取服务相关信息失败！');
        return;
      }
      this.serviceInfo = serviceInfo;
      this.profileInfo = profileInfo;
    },
    async mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    data() {
      return {
        serviceId: null,
        serviceInfo: null,
        profileInfo: null,
        serviceList: [],
        showK8sResourceOptions: {
          tabSize: 4,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          mode: "text/x-properties",
          theme: "monokai",
          readOnly: true,
          viewportMargin: 10
        },
        grayStrategyFromNet: null,
        grayStrategy: {
          listIngress: [],
          canaryInstanceNum: 0,
          masterInstanceNum: 0,
          headerKeySelected: false,
          headerKey: '',
          headerValue: '',
          cookieSelected: false,
          cookie: '',
          weightSelected: false,
          weight: 0,
        }
      }
    },
    watch: {
      'grayStrategy.masterInstanceNum': function (mainNum) {
        this.grayStrategy.canaryInstanceNum = this.grayStrategyFromNet.totalInstanceNum - mainNum;
      }
    },
    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          size = this.$storeHelper.screen.size;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight;
        } catch(err) {
        }
      },
      async requestServiceList() {
        this.serviceList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_gray_list, {
          query: {
            configId: this.serviceId
          }
        });
        const postTreat = it => {
          if (it.hasOwnProperty('containerStatus') && it['containerStatus'] && this.$utils.hasProps(it['containerStatus'], 'Running', 'Total')) {
            it.instanceStatus = `${it['containerStatus']['Running']}/${it['containerStatus']['Total']}`
          } else {
            it.instanceStatus = '---/---';
          }
          it.formattedCreateTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
          return it;
        };

        // console.log(resContent);
        if (resContent['master']) {
          resContent['master']['serviceType'] = 'master';
          resContent['master']['serviceTypeName'] = '主服务';
          this.serviceList.push(postTreat(resContent['master']));
        }
        if (resContent['canary']) {
          resContent['canary']['serviceType'] = 'canary';
          resContent['canary']['serviceTypeName'] = '灰度服务';
          this.serviceList.push(postTreat(resContent['canary']));
        }
        // console.log(this.serviceList);
      },
      async getData4GrayCreate() {
        var resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_by_id, {
          params: {
            id: this.serviceId
          }
        });
//        console.log(resContent);
        const serviceInfo = this.$net.getServiceModel(resContent);
        const profileInfo = this.$storeHelper.getProfileInfoByID(serviceInfo.spaceId);
        const theData = {
          profileInfo,
          serviceInfo
        };
        // console.log(theData);
        return theData;
      },
      async handleClick(evt, action, data) {
        switch (action) {
          case 'service_gray_create':
            this.$router.push(this.$router.helper.pages['/profile/service/:id(\\d+)/gray/add'].toPath({
              id: this.serviceId
            }));
            break;
          case 'open_dialog_service_gray_strategy':
            try {
              this.grayStrategyFromNet = await this.$net.requestPaasServer(this.$net.URL_LIST.service_gray_strategy_query, {
                payload: {
                  configId: this.serviceId,
                  spaceId: this.profileInfo.id,
                  groupId: this.$storeHelper.groupInfo.id
                }
              });
              if (this.serviceList.length === 0) {
                this.$message.error('未找到服务列表');
                return;
              }
              this.grayStrategyFromNet.totalInstanceNum = this.grayStrategyFromNet.masterInstanceNum + this.grayStrategyFromNet.canaryInstanceNum;
              this.grayStrategy.listIngress = this.grayStrategyFromNet['listIngress'].filter(it => it.hasCanary).map(it => it.host);
              this.grayStrategy.canaryInstanceNum = this.grayStrategyFromNet.canaryInstanceNum;
              this.grayStrategy.masterInstanceNum = this.grayStrategyFromNet.masterInstanceNum;
              this.grayStrategy.headerKeySelected = this.grayStrategyFromNet.headerKeySelected;
              this.grayStrategy.headerKey = this.grayStrategyFromNet.headerKey;
              this.grayStrategy.headerValue = this.grayStrategyFromNet.headerValue;
              this.grayStrategy.cookieSelected = this.grayStrategyFromNet.cookieSelected;
              this.grayStrategy.cookie = this.grayStrategyFromNet.cookie;
              this.grayStrategy.weightSelected = this.grayStrategyFromNet.weightSelected;
              this.grayStrategy.weight = this.grayStrategyFromNet.weight;
              await this.openDialog(action);
            } catch (err) {
              console.log(err);
              this.$message.error(err.message);
            }
            break;
          case 'service_gray_strategy':
            break;
          case 'refresh':
            this.requestServiceList();
            break;
        }
      },
      async handleTRClick(evt, action, index, row) {
        switch (action) {
          case 'service_gray_update':
            this.$router.push(this.$router.helper.pages['/profile/service/:id(\\d+)/gray/modify'].toPath({
              id: this.serviceId
            }));
            break;
          case 'service_gray_delete':
            await this.$confirm(`删除 灰度服务 吗？`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              dangerouslyUseHTMLString: true
            });
            break;
          case 'open-dialog-k8s-info':
            try {
              var resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.get_resource_information_by_k8s, {
                payload: {
                  spaceId: this.profileInfo.id,
                  groupId: this.$storeHelper.groupInfo.id,
//                  namespace: this.$storeHelper.groupInfo.tag,
//                  appConfigId: this.action.row.id,
                  configServiceName: `${serviceInfo.serviceName}-canary`
                }
              });
              await this.openDialog(action, resContent);
            } catch (err) {
              console.log(err);
            } finally {
              this.closeDialog();
            }
            break;
        }
      },
      async handleDialogEvent(evt, action) {
        switch (action) {
          case 'service_gray_strategy_update':
            try {
              var payload = this.$utils.deepMerge({}, this.grayStrategy);
              payload.listIngress = this.grayStrategyFromNet.listIngress.filter(it => {
                return this.grayStrategy.listIngress.indexOf(it.host) > -1;
              });
              // TODO: delete later
              (payload.canaryInstanceNum < 1) && (payload.canaryInstanceNum = 1);
              (payload.masterInstanceNum < 1) && (payload.masterInstanceNum = 1);
              payload.configId = this.serviceId;
              await this.$net.requestPaasServer(this.$net.URL_LIST.service_gray_strategy_update, {
                payload
              });
            } catch (err) {
              console.log(err);
            } finally {
              this.closeDialog();
            }
            break;
        }
      }
    }
  }
</script>