<template>
  <div id="service-gray">
    <div class="header">
      <!--①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳-->
      <el-button size="mini" type="primary"
                 :class="[step!=STATE['START']?'disabled':'']"
                 @click="handleClick($event, 'service_gray_create')">
        <span class="step-tag">1</span><span>创建灰度版本</span>
      </el-button>
      <!--创建了灰度且没有部署-->
      <el-button
              size="mini"
              type="primary"
              :class="['flex', step<STATE['CANARY_CREATED']? 'disabled':'']"
              @click="handleClick($event,'go-to-work-order-todo-add-from-service-gray')">
        <span class="step-tag">2</span><span>申请工单</span><i class="paas-icon-level-up"></i>
      </el-button>
      <el-button size="mini" type="primary"
                 :class="[step<STATE['WORK_ORDER_DEPLOYED'] ?'disabled':'']"
                 @click="handleClick($event, 'open_dialog_service_gray_update_instance_count')">
        <span class="step-tag">3</span><span>调整实例数</span>
      </el-button>
      <el-button size="mini" type="primary"
                 :class="[step<STATE['WORK_ORDER_DEPLOYED'] ?'disabled':'']"
                 @click="handleClick($event, 'open_dialog_service_gray_update_strategy')">
        <span class="step-tag">4</span><span>设置灰度策略</span>
      </el-button>
      <el-button size="mini" type="primary"
                 :class="[step<STATE['WORK_ORDER_DEPLOYED'] ?'disabled':'']"
                 @click="handleClick($event, 'service_gray_apply')">
        <span class="step-tag">5</span><span>完成灰度发布</span>
      </el-button>
      <el-button size="mini" type="primary" @click="handleClick($event, 'refresh')">
        <span>刷新</span>
        <i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
      </el-button>
      <i class="paas-icon-question" v-if="false"
         v-pop-on-mouse-over="[
           '灰度服务的部署，需要申请工单，在部署工单页面进行',
           '灰度服务部署完成后，才能进行调整实例数、设置灰度策略及完成灰度发布操作',
           '灰度发布的作用是从主服务中切换部分流量到灰度服务上，待验证没问题后将主服务版本换成灰度服务版本，故会在灰度发布过程中会创建一个过渡期的灰度服务版本，待灰度发布完成，灰度服务版本会被删除。'
         ]"></i>
      <div class="toggle-warning">
        <i class="paas-icon-double-arrow-right" style="transform: rotate(270deg); " v-if="showWarning" @click="showWarning = false"></i>
        <i class="paas-icon-question" v-if="!showWarning" @click="showWarning = true"></i>
      </div>
      <paas-dismiss-message
              :toExpand="showWarning"
              @status-change="active => {this.showWarning = active; onScreenSizeChange()}"
              style="margin-left: -5px; margin-right: -5px; margin-top: 3px;"
              showSeconds="180"
              :msgList="[
           '灰度服务的部署，需要申请工单，在部署工单页面进行',
           '灰度服务部署完成后，才能进行调整实例数、设置灰度策略及完成灰度发布操作',
           '灰度发布的作用是从主服务中切换部分流量到灰度服务上，待验证没问题后将主服务版本换成灰度服务版本，故会在灰度发布过程中会创建一个过渡期的灰度服务版本，待灰度发布完成，灰度服务版本会被删除。'
       ]"></paas-dismiss-message>
    </div>
    <div class="list">
      <el-table :data="serviceList"
                stripe>
        <el-table-column label="服务版本" prop="serviceTypeName"></el-table-column>
        <el-table-column label="运行实例数/总实例数" prop="instanceStatus" headerAlign="center" align="center" width="200"></el-table-column>
        <el-table-column label="创建时间" prop="formattedCreateTime" headerAlign="center" align="center" width="200"></el-table-column>
        <el-table-column label="操作">
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
            <el-button v-if="!$storeHelper.actionDisabled('get_affinity')"
                       size="small"
                       type="text"
                       @click="handleTRClick($event, 'open-dialog-k8s-info', scope.$index, scope.row)"
                       :class="['primary', 'flex']">
              <span>K8S实时信息</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="strategy-show" v-if="!(step<STATE['WORK_ORDER_DEPLOYED'])">
        <div class="title">灰度策略</div>
        <el-form size="mini" class="message-show"
                 label-width="140px" v-if="grayStrategyFromNet && grayStrategy.listIngress && grayStrategy.listIngress.length > 0">
          <el-form-item label="相关域名" class="">
            {{grayStrategy.listIngress.join(', ')}}
          </el-form-item>
          <el-form-item label="主/灰服务实例数" class="instance-number">
            <span>{{grayStrategy.masterInstanceNum}} / {{grayStrategy.canaryInstanceNum}}</span>
            <i class="el-icon-question" style="color: #E6A23C; margin-left: 6px;"
               v-pop-on-mouse-over="'主服务及灰度服务实例数不能少于一个'">
            </i>
          </el-form-item>
          <el-form-item label="当前灰度策略" class="strategy">
            <el-row style="font-weight: bold">
              <el-col :span="8" class="name">流量类型</el-col>
              <el-col :span="16" class="value">关键字</el-col>
            </el-row>
            <el-row class="rule request-header">
              <el-col :span="8" class="name">
                <el-checkbox v-model="grayStrategy.headerKeySelected" :disabled="true">request header</el-checkbox>
              </el-col>
              <el-col :span="16" class="value">
                <span>属性/匹配值: </span><span>{{grayStrategy.headerKey ? grayStrategy.headerKey:'---'}}/{{grayStrategy.headerValue ? grayStrategy.headerValue:'---'}}</span>
              </el-col>
            </el-row>
            <el-row class="rule">
              <el-col :span="8" class="name">
                <el-checkbox v-model="grayStrategy.cookieSelected":disabled="true">cookie</el-checkbox>
              </el-col>
              <el-col :span="16" class="value">{{grayStrategy.cookie}}</el-col>
            </el-row>
            <el-row class="rule">
              <el-col :span="8" class="name">
                <el-checkbox v-model="grayStrategy.weightSelected":disabled="true">weight</el-checkbox>
              </el-col>
              <el-col :span="16" class="value">{{grayStrategy.weight ? grayStrategy.weight:'---'}}</el-col>
            </el-row>
          </el-form-item>
        </el-form>
        <div v-else style="text-align: center; margin-top: 10px">---</div>
      </div>
    </div>

    <el-dialog :title="{
                        'open_dialog_service_gray_update_strategy': '设置灰度策略',
                        'open_dialog_service_gray_update_instance_count': '调整实例数'
                      }[action.name]"
               :visible="['open_dialog_service_gray_update_strategy', 'open_dialog_service_gray_update_instance_count'].indexOf(action.name) > -1"
               v-if="['open_dialog_service_gray_update_strategy', 'open_dialog_service_gray_update_instance_count'].indexOf(action.name) > -1"
               @close="closeDialog"
               class="size-800 update-strategy"
               :close-on-click-modal="false"
    >
      <div class="content">
        <paas-dismiss-message :toExpand="true"
                              showSeconds="0"
                              @status-change="active => {}"
                              style="margin: 0px -2px"
                              :msgList="action.name == 'open_dialog_service_gray_update_instance_count' ?
                              '灰度服务版本初始默认实例数为1，请根据需要调整主服务版本和灰度服务版本的实例数比例，保存后将会立即生效'
                              :'目前提供3种灰度策略，并有优先级之分，请合理配置，保存后将会立即生效'
                              "></paas-dismiss-message>
        <el-form :model="grayStrategy" :rules="strategyRules" size="mini" label-width="100px" ref="updateStrategyForm">
          <el-form-item label="网络类型" class="" v-if="action.name == 'open_dialog_service_gray_update_strategy'">
            <el-checkbox-group v-model="grayStrategy.listIngress" v-if="grayStrategyFromNet.listIngress">
              <el-checkbox v-for="item in grayStrategyFromNet.listIngress" :label="item.host" :key="item.host">
                {{item.host}}{{item.isIntranet ? '(内网域名)' : ''}}
            </el-checkbox>
            </el-checkbox-group>
            <i class="el-icon-question" style="width: 18px; line-height: 26px; margin-left: 6px;" v-if="false"
               v-pop-on-mouse-over="'域名只能同时生效，或同时不生效'"></i>
          </el-form-item>
          <el-form-item label="实例数" class="instance-number" v-if="action.name == 'open_dialog_service_gray_update_instance_count'">
            <span>主服务实例数：{{grayApplication.masterInstanceNum}}</span>
            <div style="width: 160px; display: inline-block; margin: 0px 5px;">
              <el-slider v-model="grayApplication.masterInstanceNum" :show-tooltip="true" :show-stops="true"
                         :min="1" :max="grayApplicationFromNet.totalInstanceNum - 1" :step="1"></el-slider>
            </div>
            <span>灰度服务实例数：{{grayApplication.canaryInstanceNum}}</span>
            <i class="el-icon-question" style="color: #E6A23C; margin-left: 6px;"
               v-pop-on-mouse-over="'主服务及灰度服务实例数不能少于一个'">
            </i>
          </el-form-item>
          <el-form-item label="灰度策略" class="strategy title message-show" v-if="action.name == 'open_dialog_service_gray_update_strategy'">
            <el-row style="font-weight: bold">
              <el-col :span="5" class="name">流量类型</el-col>
              <el-col :span="15" class="value">关键字</el-col>
              <el-col :span="4" class="level">优先级</el-col>
            </el-row>
          </el-form-item>
          <el-form-item class="strategy request-header" prop="requestHeader" v-if="action.name == 'open_dialog_service_gray_update_strategy'">
            <el-row>
              <el-col :span="5" class="name">
                <el-checkbox v-model="grayStrategy.headerKeySelected">request header</el-checkbox>
              </el-col>
              <el-col :span="15" class="value" style="display: inline-flex">
                <el-input v-model="grayStrategy.headerKey" placeholder="属性，不能超过100个字符" style="flex: 1" :disabled="!grayStrategy.headerKeySelected"></el-input>
                <span style="width: 24px; text-align: center;"> = </span>
                <el-input v-model="grayStrategy.headerValue" placeholder="匹配值，不能超过100个字符" style="flex: 1" :disabled="!grayStrategy.headerKeySelected"></el-input>
                <i class="el-icon-question" style="width: 18px; line-height: 26px; margin-left: 6px;"
                   v-pop-on-mouse-over="[
                     '当只填写Key值时，使用时通过对请求的Header中添加该Key值，设置其Value值为always或never，来实现流量的分发，对Value值为always的请求将会一直发送到灰度服务版本，对Value值为never的请求将会一直发送到主服务版本，对Value为其他值，将忽略Request Header流量类型策略，并按照优先级与其他流量类型策略进行比较。',
                      '当同时填写Key值和Value值时，使用时通过对请求的Header中添加该Key值，设置其Value值是否等于在云平台上配置的Value值，来实现流量的分发，相等时请求将会一直发送到灰度服务版本，不相等时，将忽略 Request Header 流量类型策略，并按照优先级与其他流量类型策略进行比较。']"></i>
              </el-col>
              <el-col :span="4" class="level">高</el-col>
            </el-row>
          </el-form-item>
          <el-form-item class="strategy cookie" prop="cookie" v-if="action.name == 'open_dialog_service_gray_update_strategy'">
            <el-row>
              <el-col :span="5" class="name"><el-checkbox v-model="grayStrategy.cookieSelected">cookie</el-checkbox></el-col>
              <el-col :span="15" class="value" style="display: inline-flex">
                <el-input v-model="grayStrategy.cookie" placeholder="不能超过100个字符" style="flex: 1;" :disabled="!grayStrategy.cookieSelected"></el-input>
                <i class="el-icon-question" style="width: 18px; line-height: 26px; margin-left: 6px;"
                   v-pop-on-mouse-over="'Key值必填。设置了Key值后，使用时通过对请求的Cookie中添加该Key值，设置其Value值为always或never，来实现流量的分发，对Value值为always的请求将会一直发送到灰度服务版本，对Value值为never的请求将会一直发送到主服务版本，对Value为其他值，将忽略Cookie流量类型策略，并按照优先级与其他流量类型策略进行比较。'"></i>
              </el-col>
              <el-col :span="4" class="level">中</el-col>
            </el-row>
          </el-form-item>
          <el-form-item class="strategy weight" prop="weight" v-if="action.name == 'open_dialog_service_gray_update_strategy'">
            <el-row>
              <el-col :span="5" class="name"><el-checkbox v-model="grayStrategy.weightSelected">weight</el-checkbox></el-col>
              <el-col :span="15" class="value">
                <el-input-number v-model="grayStrategy.weight" :min="0" :max="100" label="流向灰度服务端权重" :disabled="!grayStrategy.weightSelected"></el-input-number>
                <i class="el-icon-question" style="width: 18px; line-height: 26px; margin-left: 6px;"
                   v-pop-on-mouse-over="'设置灰度服务版本分的流量的权重值，范围大于0小于等于100。例如：设置灰度权重值为30，该服务的请求流量将有约30%的流量分配到灰度服务版本。'"></i>
              </el-col>
              <el-col :span="4" class="level">低</el-col>
            </el-row>
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
    <paas-dialog-for-log :showStatus="dialogStatusGrayApply" ref="dialogGrayApply" @close="dialogStatusGrayApply.visible = false">
      <div slot="content">
        <div v-for="(item, index) in dialogStatusGrayApply.logList" :key="index" class="log-item" v-html="item"></div>
        <div class="log-item" v-if="dialogStatusGrayApply.isLoading"><i class="el-icon-loading item"></i></div>
        <div class="last-item loading-line" v-else><span class="item">&nbsp</span></div>
      </div>
    </paas-dialog-for-log>
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
      .el-button {
        .step-tag {
          display: inline-block;
          height: 14px;
          width: 14px;
          border-radius: 7px;
          border-width: 1px;
          border-style: solid;
        }
      }
      .toggle-warning {
        display: inline-flex;
        align-items: center;
        line-height: 24px;
        margin-left: 10px;
        color: $--color-warning;
        cursor: pointer;
      }
      .paas-icon-question {
      }
    }
    > .list {
      flex: 1;
    }
  }
</style>
<style lang="scss">
  @mixin form-strategy {
    .el-form {
      margin-top: 10px;
      .strategy {
        .rule {
          margin-bottom: 3px;
          .el-input {
            width: 100%;
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
  #service-gray {
    .strategy-show {
      margin: 10px auto;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      &:hover {
        border-color: rgba(0, 0, 0, 0.3);
      }
      > .title {
        text-align: center;
        font-size: 16px;
      }
      max-width: 600px;
      @include form-strategy;
    }
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
        .el-icon-question {
          color: $--color-warning;
        }
        .el-form {
          margin-top: 10px;
          .strategy {
            .el-input {
              width: 100%;
            }
            &.request-header {
              .value {
                .el-input {
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
  import paasDialogForLog from 'assets/components/dialog4log.vue';
  const STATE = {
    START: 0,
    CANARY_CREATED: 1,
    WORK_ORDER_DEPLOYED: 2,
    UPDATE_INSTANCE_COUNT: 2,
    UPDATE_STRATEGY: 2,
    CANARY_APPLYING: 3,
    CANARY_APPLIED: 4
  };
  export default {
    components: {paasDismissMessage, paasDialogForLog, codemirror},
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

      const {originServiceInfo, serviceInfo, profileInfo} = await this.syncEnv();
      // go back when running instance of master service is zero
      if (serviceInfo && serviceInfo.containerStatus && serviceInfo.containerStatus.Total === 0) {
        this.$router.go(-1);
        return;
      }
      if (!serviceInfo || !profileInfo) {
        this.$message.error('获取服务相关信息失败！');
        this.$router.go(-1);
        return;
      }
      this.originServiceInfo = originServiceInfo;
      this.serviceInfo = serviceInfo;
      this.profileInfo = profileInfo;

      this.handleClick(window.event, 'refresh');
      this.setStrategyRules();
    },
    async mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    data() {
      return {
        heightOfTable: '',
        showWarning: true,

        STATE: STATE,
        step: STATE['START'],
        serviceId: null,
        originServiceInfo: null,
        serviceInfo: null,
        canaryStatus: null,
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
        grayApplicationFromNet: null,
        grayApplication: {
          id:'',
          canaryInstanceNum: 0,
          masterInstanceNum: 0,
          canaryServiceName: '',
        },
        grayStrategy: {
          listIngress: [],
          canaryInstanceNum: 0,
          masterInstanceNum: 0,
          headerKeySelected: false,
          // used for check headerKey and headerValue, requestHeader=headerKey$$$$$$headerValue
          requestHeader: '',
          headerKey: '',
          headerValue: '',
          cookieSelected: false,
          cookie: '',
          weightSelected: false,
          weight: 0,
        },
        dialogStatusGrayApply: {
          title: '',
          visible: false,
          loading: false,
          isLoading: false,
          logList: []
        }
      }
    },
    watch: {
      'grayApplication.masterInstanceNum': function (mainNum) {
        if (this.grayApplicationFromNet) {
          if (mainNum >= this.grayApplicationFromNet.totalInstanceNum) {
            this.grayApplication.masterInstanceNum =  this.grayApplicationFromNet.totalInstanceNum - 1;
            return;
          }
        }
        this.grayApplication.canaryInstanceNum = this.grayApplicationFromNet.totalInstanceNum - mainNum;
      },
      'grayStrategy.cookie': function(cookie) {
        if (this.$utils.isString(cookie)) {
          this.grayStrategy.cookieSelected = cookie.length > 0;
        }
      },
      'grayStrategy.weight': function (weight) {
        this.grayStrategy.weightSelected = this.$utils.isNumber(weight);
      },
      'grayStrategy.headerKey': function (headerKey) {
        this.grayStrategy.requestHeader = `${this.grayStrategy.headerKey.trim()}$$$$$$${this.grayStrategy.headerValue.trim()}`;
      },
      'grayStrategy.headerValue': function (headerValue) {
        this.grayStrategy.requestHeader = `${this.grayStrategy.headerKey.trim()}$$$$$$${this.grayStrategy.headerValue.trim()}`;
      },
//      'grayStrategy.requestHeader': function (requestHeader) {
//        this.grayStrategy.headerKeySelected = requestHeader !== '$$$$$$';
//      },
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
        } catch (err) {
        }
      },
      async requestCanaryInfo() {
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
        this.canaryStatus = resContent;
        return resContent;
      },
      updateStep() {
        // update current step
        if (this.canaryStatus.hasOwnProperty('canary')) {
          this.step = this.STATE['CANARY_CREATED'];
        }
        if (this.canaryStatus['canaryDeploymentFlag']) {
          this.step = this.STATE['WORK_ORDER_DEPLOYED'];
        }
      },

      // get all related data used in this page
      async syncEnv() {
        var resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_by_id, {
          params: {
            id: this.serviceId
          }
        });
        // console.log('resContent');
        // console.log(resContent);
        if (!resContent) {
          this.$message.error(`serviceId为：${this.serviceId} 的服务不存在`);
          this.$router.push(this.$net.page['profile/service']);
          return;
        }
        const serviceInfo = this.$net.getServiceModel(resContent);
        const profileInfo = this.$storeHelper.getProfileInfoByID(serviceInfo.spaceId);
        const theData = {
          originServiceInfo: resContent,
          profileInfo,
          serviceInfo,
        };
        const routeConfig = this.$router.helper.getConfigByFullPath('/profile/service/:id(\\d+)');
        if (routeConfig) {
          routeConfig.name = `${serviceInfo.appName}/${profileInfo.description}`;
        }
        return theData;
      },

      setStrategyRules() {
        const grayStrategy = this.grayStrategy;
        const isNumber = this.$utils.isNumber;
        this.strategyRules = {
          requestHeader: [{
            trigger: ['blur', 'change'],
            validator(rule, values, callback) {
              var errMessage = '';
              if (grayStrategy.headerKeySelected && values !== '$$$$$$') {
                const [headerKey, headerValue] = values.split('$$$$$$');
                if (headerValue.length >= 100) {
                  errMessage = '匹配值不能超过100个字符';
                }
                if (headerKey.length == 0) {
                  errMessage = '属性不能为空';
                }
                if (headerKey.length >= 100) {
                  errMessage = '属性不能超过100个字符';
                }
              }
              if (errMessage) {
                callback(errMessage);
              } else {
                callback();
              }
            }
          }],
          cookie: [{
            trigger: ['blur', 'change'],
            validator(rule, values, callback) {
              var errMessage = '';
              if (grayStrategy.cookieSelected && values && values.length && values.length >= 100) {
                errMessage = '不能超过100个字符';
              }
              if (errMessage) {
                callback(errMessage);
              } else {
                callback();
              }
            }
          }],
          weight: [{
            trigger: ['blur', 'change'],
            validator(rule, values, callback) {
              var errMessage = '';
              if (grayStrategy.weightSelected && !isNumber(values)) {
                errMessage = '请输入0-100之间的数字';
              }
              if (errMessage) {
                callback(errMessage);
              } else {
                callback();
              }
            }
          }]
        }
      },
      // 查询灰度实例策略
      async syncCanaryInstanceByServer() {
        const grayApplicationFromNet = await this.$net.requestPaasServer(this.$net.URL_LIST.service_gray_instance_query, {
          payload: {
            configId: this.serviceId,
            serviceName: this.serviceInfo.serviceName,
            spaceId: this.profileInfo.id,
            groupId: this.$storeHelper.groupInfo.id
          }
        });

        this.grayApplication.canaryInstanceNum = grayApplicationFromNet.canaryInstanceNum >= 0 ? grayApplicationFromNet.canaryInstanceNum : 0;
        this.grayApplication.masterInstanceNum = grayApplicationFromNet.masterInstanceNum >= 0 ? grayApplicationFromNet.masterInstanceNum : 0;
        this.grayApplication.canaryServiceName = grayApplicationFromNet.canaryServiceName;
        this.grayApplication.id = grayApplicationFromNet.id;
        grayApplicationFromNet.totalInstanceNum = grayApplicationFromNet.masterInstanceNum + grayApplicationFromNet.canaryInstanceNum;

        this.grayApplicationFromNet = grayApplicationFromNet;
      },
      // 更新灰度策略
      async syncStrategyByServer() {
        const grayStrategyFromNet = await this.$net.requestPaasServer(this.$net.URL_LIST.service_gray_strategy_query, {
          payload: {
            configId: this.serviceId,
            serviceName: this.serviceInfo.serviceName,
            spaceId: this.profileInfo.id,
            groupId: this.$storeHelper.groupInfo.id
          }
        });

        this.grayStrategy.listIngress = grayStrategyFromNet['listIngress'].filter(it => it.hasCanary).map(it => it.host);
        this.grayStrategy.canaryInstanceNum = grayStrategyFromNet.canaryInstanceNum >= 0 ? grayStrategyFromNet.canaryInstanceNum : 0;
        this.grayStrategy.masterInstanceNum = grayStrategyFromNet.masterInstanceNum >= 0 ? grayStrategyFromNet.masterInstanceNum : 0;
        this.grayStrategy.headerKeySelected = grayStrategyFromNet.headerKeySelected;
        this.grayStrategy.headerKey = grayStrategyFromNet.headerKey ? grayStrategyFromNet.headerKey : '';
        this.grayStrategy.headerValue = grayStrategyFromNet.headerValue ? grayStrategyFromNet.headerValue : '';
        this.grayStrategy.requestHeader = `${this.grayStrategy.headerKey.trim()}$$$$$$${this.grayStrategy.headerValue.trim()}`;
        this.grayStrategy.cookieSelected = grayStrategyFromNet.cookieSelected;
        this.grayStrategy.cookie = grayStrategyFromNet.cookie;
        this.grayStrategy.weightSelected = grayStrategyFromNet.weightSelected;
        this.grayStrategy.weight = grayStrategyFromNet.weight;
        grayStrategyFromNet.totalInstanceNum = grayStrategyFromNet.masterInstanceNum + grayStrategyFromNet.canaryInstanceNum;

        this.grayStrategyFromNet = grayStrategyFromNet;
      },
      async handleClick(evt, action, data) {
        let resContent = null;
        const target = evt.target;

        if (action == 'service_gray_create' && this.canaryStatus && !this.canaryStatus['hasVersionLabel']) {
          await this.$alert('如需使用灰度发布，请先重启或重新部署该服务', '提示');
          return;
        }

        if (action == 'service_gray_create' && this.step!=this.STATE['START']) {
          this.$storeHelper.globalPopover.show({
            ref: target,
            msg: `您已创建灰度服务`
          });
          return;
        }
        if (action == 'go-to-work-order-todo-add-from-service-gray'
          && (this.step<this.STATE['CANARY_CREATED'])) {
          this.$storeHelper.globalPopover.show({
            ref: target,
            msg: `您已通过工单完成灰度部署`
          });
          return;
        }
        if (action == 'go-to-work-order-todo-add-from-service-gray' && this.step<this.STATE['CANARY_CREATED']) {
          this.$storeHelper.globalPopover.show({
            ref: target,
            msg: `请先创建灰度服务`
          });
          return;
        }
        if (action == 'open_dialog_service_gray_update_instance_count' && this.step<this.STATE['WORK_ORDER_DEPLOYED']) {
          this.$storeHelper.globalPopover.show({
            ref: target,
            msg: `请先完成灰度部署，再调整实例数`
          });
          return;
        }
        if (action == 'open_dialog_service_gray_update_strategy' && this.step<this.STATE['WORK_ORDER_DEPLOYED']) {
          this.$storeHelper.globalPopover.show({
            ref: target,
            msg: `请先完成灰度部署，再调灰度策略`
          });
          return;
        }
        if (action == 'service_gray_apply' && this.step<this.STATE['WORK_ORDER_DEPLOYED']) {
          this.$storeHelper.globalPopover.show({
            ref: target,
            msg: `请先完成灰度部署`
          });
          return;
        }
        switch (action) {
          case 'service_gray_create':
            this.$router.push(this.$router.helper.pages['/profile/service/:id(\\d+)/gray/add'].toPath({
              id: this.serviceId
            }));
            break;
          case 'go-to-work-order-todo-add-from-service-gray':
            const data = {
              appId: this.serviceInfo.appId,
              profileId: this.profileInfo.id,
              serviceId: this.serviceInfo.id,
              serviceInfo: this.serviceInfo,
              profileInfo: this.profileInfo
            };
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/service'],
              data
            };
            const PATH_MAP = {
              'go-to-work-order-todo-add-from-service-gray': this.$net.page['profile/work-order/todo/add'],
            };
            this.$router.push(PATH_MAP[action]);
            break;
          case 'open_dialog_service_gray_update_instance_count':
            try {
              await this.syncCanaryInstanceByServer();
              const payload = await this.openDialog(action);
              await this.$net.requestPaasServer({
                open_dialog_service_gray_update_instance_count: this.$net.URL_LIST.service_gray_update_instance_count,
              }[action], {
                payload
              });
              this.$message.success('实例数更新成功！');
            } catch (err) {
              console.log(err);
            } finally {
              this.closeDialog();
            }
            break;
          case 'open_dialog_service_gray_update_strategy':
            try {
              await this.syncStrategyByServer();
              if (this.serviceList.length === 0) {
                this.$message.error('未找到服务列表');
                return;
              }
              const payload = await this.openDialog(action);
              await this.$net.requestPaasServer({
                open_dialog_service_gray_update_strategy: this.$net.URL_LIST.service_gray_update_strategy
              }[action], {
                payload
              });
              this.$message.success('灰度策略更新成功！');
            } catch (err) {
              console.log(err);
            } finally {
              this.closeDialog();
            }
            break;
          case 'service_gray_apply':
            await this.$confirm(`完成灰度发布是将灰度服务替换掉主服务的过程，完成后可在主服务的部署日志/完成灰度发布日志中查看日志，你确定需要完成灰度发布吗？`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              dangerouslyUseHTMLString: true
            });
            resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_gray_apply, {
              payload: {
                id: this.canaryStatus['canary']['id'],
                groupId: this.$storeHelper.groupInfo.id,
                serviceName: this.serviceInfo.serviceName
              }
            });
            this.showGrayApplyLog({
              logName: resContent.logName,
              logPath: resContent.logPath,
            });
            break;
          case 'service_gray_strategy':
            break;
          case 'refresh':
            await this.requestCanaryInfo();
            this.updateStep();
            await this.syncStrategyByServer();
            break;
        }
      },
      async handleTRClick(evt, action, index, row) {
        switch (action) {
          case 'service_gray_update':
            const originCanaryInfo = Object.assign({}, this.originServiceInfo, this.canaryStatus['canary']);
            const canaryInfo = this.$net.getServiceModel(originCanaryInfo);
            canaryInfo.masterServiceId = this.serviceInfo.id;
            canaryInfo.canaryId = this.canaryStatus['canary']['id'];
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/service/list'],
              data: {
                serviceInfo: canaryInfo
              }
            };
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

            if (!this.canaryStatus['canary']) {
              this.$message.error('灰度服务信息不存在！');
              break;
            }
            await this.$net.requestPaasServer(this.$net.URL_LIST.service_gray_delete, {
              payload: {
                id: this.canaryStatus['canary'].id,
              }
            });
            // update service list and current step after delete service success
            await this.requestCanaryInfo();
            this.step = this.STATE['START'];

            break;
          case 'open-dialog-k8s-info':
            try {
              var resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.get_resource_information_by_k8s, {
                payload: {
                  spaceId: this.profileInfo.id,
                  groupId: this.$storeHelper.groupInfo.id,
//                  namespace: this.$storeHelper.groupInfo.tag,
                  appConfigId: this.serviceId,
                  configServiceName: row.isCanary ? `${this.serviceInfo.serviceName}-canary` : `${this.serviceInfo.serviceName}`
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
          case 'service_gray_update_instance_count':
            try {
              var payload = this.$utils.cloneDeep(this.grayApplication);
              payload.configId = this.serviceId;
              payload.groupId = this.$storeHelper.groupInfo.id;
              payload.spaceId = this.profileInfo.id;
              payload.serviceName = this.serviceInfo.serviceName,
              this.action.promise.resolve(payload);
            } catch (err) {
              console.log(err);
            }
            break;
          case 'service_gray_update_strategy':
            try {
              await this.$refs['updateStrategyForm'].validate();
              // var payload = this.$utils.deepMerge({}, this.grayStrategy);
              var payload = this.$utils.cloneDeep(this.grayStrategy);
              payload.listIngress = this.grayStrategyFromNet.listIngress.map(it => {
                it.hasCanary = this.grayStrategy.listIngress.includes(it.host);
                return it;
              });
              // TODO: delete later
              // (payload.canaryInstanceNum < 1) && (payload.canaryInstanceNum = 1);
              // (payload.masterInstanceNum < 1) && (payload.masterInstanceNum = 1);
              payload.configId = this.serviceId;
              payload.groupId = this.$storeHelper.groupInfo.id;
              // console.log(this.grayStrategy);
              // console.log(payload);
              this.action.promise.resolve(payload);
            } catch (err) {
              console.log(err);
            }
            break;
        }
      },
      async showGrayApplyLog({logPath = null, logName = null, offset = 0}, action) {
        const dialogStatusGrayApply = this.dialogStatusGrayApply;
        dialogStatusGrayApply.logList = [];
        dialogStatusGrayApply.title = '完成灰度发布';
        dialogStatusGrayApply.loading = false;
        dialogStatusGrayApply.isLoading = false;
        dialogStatusGrayApply.visible = true;
        if (action === 'service_gray_apply') {
        }
        // recursive function to fetch log from server with options {logName, logPath, offset}
        const getLog = async(offset) => {
          // stop request deploy log when the window is closed
          if (!dialogStatusGrayApply.visible) {
            return Promise.reject('弹框关闭');
          }
          const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_gray_apply_log, {
            payload: {
              logPath,
              logName,
              offset
            }
          });
          return resContent;
        };

        const praseLog = log => {
          if (!log) {
            return [];
          } else {
            return log.split('\n');
          }
        };


        var deployLogQueue = [];
        var hasMoreData = true;
        dialogStatusGrayApply.isLoading = true;

        (function updateLogList(self) {
          if (!hasMoreData && deployLogQueue.length === 0) {
            return;
          }
          self.$nextTick(() => {
            self.$refs['dialogGrayApply'] && self.$refs['dialogGrayApply'].scrollToBottom();
          });
          setTimeout(() => {
            dialogStatusGrayApply.logList.push(deployLogQueue.shift());
            updateLogList(self);
          })
        })(this);

        while (hasMoreData) {
          try {
            const resContent = await getLog(offset);
            await new Promise((resolve) => {
              setTimeout(resolve, 1500);
            });
            hasMoreData = resContent['hasMoreData'];
            deployLogQueue = deployLogQueue.concat(praseLog(resContent['logContext']));
            offset = resContent['offset'];
            if (!dialogStatusGrayApply.visible) {
              hasMoreData = false;
            }
            if (!hasMoreData) {
              dialogStatusGrayApply.isLoading = false;
            }
          } catch (err) {
            console.log(err);
            hasMoreData = false;
          }
        }
      }
    }
  }
</script>