<template>
  <div id="service-detail">
    <div class="header" v-if="dataPassed.profileInfo && dataPassed.serviceInfo">
      <div style="display: inline-block"><span style="font-weight: bold">运行环境：</span><span>{{dataPassed.profileInfo.name}}</span></div>
      <div style="display: inline-block; margin-left: 15px;"><span style="font-weight: bold">应用名称：</span><span>{{dataPassed.serviceInfo.appName}}</span></div>
      <el-button style="margin-left: 15px;" size="mini" type="primary" @click="handleClick($event, 'refresh')">刷新</el-button>
    </div>
    <div class="service-info" :style="{height: `${heightOfServiceInfo}px`}">
      <div class="by-text">
        <div class="section basic">
          <div class="title">基本信息</div>
          <div class="content">
            <el-form label-position="right" label-width="100px" size="mini">
              <el-form-item label="服务ID">
                {{model["id"]}}
              </el-form-item>
              <el-form-item label="所在集群" v-if="$storeHelper.groupVersion === 'v1'">
                {{model["k8s"] === 1 ? 'k8s' : 'mesos'}}
              </el-form-item>
              <el-form-item label="外网域名">
                <div v-if="internetDomainList.length==0">未绑定</div>
                <div v-if="internetDomainList.length==1">
                  <a :href="'http://' + internetDomainList[0]" target="_blank">{{internetDomainList[0]}}</a>
                </div>
                <div v-if="internetDomainList.length>1">
                  <a :href="'http://' + internetDomainList[0]" target="_blank">{{internetDomainList[0]}}</a>
                  <el-tooltip slot="trigger" effect="light" placement="top">
                    <div slot="content">
                      <div v-for="(item, index) in internetDomainList" v-if="index!=0">
                        <a :href="'http://' + item" target="_blank">{{item}}</a>
                      </div>
                    </div>
                    <span class="more"><i class="paas-icon-more"></i></span>
                  </el-tooltip>
                </div>
              </el-form-item>
              <el-form-item label="内网域名">
                <el-row v-if="intranetDomain" type="flex" align="middle">
                  <el-col :span="14"><a :href="'http://' + intranetDomain" target="_blank">{{intranetDomain}}</a></el-col>
                  <el-tooltip placement="top-start" effect="light" :content="dnsState.office.content">
                    <el-col :class="dnsState.office.status ? 'el-icon-success' : 'el-icon-error'" :span="2" :style="{color: dnsState.office.status ? '#67C23A': '#F56C6C'}"></el-col>
                  </el-tooltip>
                  <el-tooltip placement="top-start" effect="light" :content="dnsState.production.content">
                    <el-col :class="dnsState.production.status ? 'el-icon-success' : 'el-icon-error'" :span="2" :style="{color: dnsState.production.status ? '#67C23A': '#F56C6C'}"></el-col>
                  </el-tooltip>
                  <el-tooltip placement="top-start" effect="light" :content="dnsState.test.content">
                    <el-col :class="dnsState.test.status ? 'el-icon-success' : 'el-icon-error'" :span="2" :style="{color: dnsState.test.status ? '#67C23A': '#F56C6C'}"></el-col>
                  </el-tooltip>
                </el-row>
                <el-row v-else>未绑定</el-row>
              </el-form-item>
              <el-form-item label="更新时间">
                {{this.$utils.formatDate(model["updateTime"],"yyyy-MM-dd hh:mm:ss")}}
              </el-form-item>
              <el-form-item label="namespace">
                {{runningInfo && typeof runningInfo['namespace'] != 'undefined' ? runningInfo["namespace"] : "未知"}}
              </el-form-item>
              <el-form-item label="项目名称">
                {{model["tag"]}}
              </el-form-item>
              <el-form-item label="二级域名">
                {{dataPassed.serviceInfo["serviceName"]}}
              </el-form-item>
              <el-form-item label="开发语言">
                {{model["language"] + "-" + model["languageVersion"]}}
              </el-form-item>
              <el-form-item label="构建类型" v-if="model['language'].toUpperCase() === 'JAVA' && !model['customImage']">
                {{model["packageType"] ? model["packageType"] : '未知'}}
              </el-form-item>
              <el-form-item label="服务期限" v-if="!isProductionProfile">
                {{model["remainExpiredDays"] ? (model["remainExpiredDays"] < 0 ? 0 : model["remainExpiredDays"]) + "天": "未配置"}}
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="section running">
          <div class="title">实时信息</div>
          <div class="content" v-if="runningInfo">
            <el-form label-position="right" label-width="150px" size="mini">
              <el-form-item label="CPU/内存">
                {{!runningInfo || runningInfo["cpu"] == null || runningInfo["memory"] == null ? "未知" : runningInfo["cpu"] + "核 / " + runningInfo["memory"]}}
              </el-form-item>
              <el-form-item label="运行实例数/总实例数">
                {{runningInfo["status"] == null ? '未知' : runningInfo["status"]["Running"] + "/" +runningInfo["status"]["Total"]}}
              </el-form-item>
              <el-form-item label="健康检查类型">
                {{runningInfo["healthCheckType"] ? runningInfo["healthCheckType"] : "未知"}}
              </el-form-item>
              <el-form-item label="健康检查路径">
                <a v-if="runningInfo['healthCheckType'] && runningInfo['healthCheckType'].toLowerCase() === 'http'"
                   :href="'http://' + model['intranetDomain'] + runningInfo['healthCheck']">{{runningInfo['healthCheck']}}</a>
                <span v-else>{{runningInfo['healthCheck'] ? runningInfo['healthCheck'] : "未知"}}</span>
              </el-form-item>
              <el-form-item label="健康检查延迟时间" v-if="this.$storeHelper.groupVersion !== 'v1'">
                {{runningInfo["initialDelaySeconds"] ? runningInfo["initialDelaySeconds"] + "s" : "未知"}}
              </el-form-item>
              <el-form-item label="负载均衡">
                {{runningInfo["loadBalance"] ? runningInfo["loadBalance"] : "未知"}}
              </el-form-item>
              <el-form-item label="滚动升级">
                {{runningInfo["rollingUpdate"] ? "需要" : "未知"}}
              </el-form-item>
              <el-form-item label="应用监控">
                {{profileUtils.getMonitorNameById(runningInfo["appMonitor"])}}
              </el-form-item>
              <el-form-item label="镜像">
                {{runningInfo["imageTag"] ? runningInfo["imageTag"] : "未知"}}
                <i class="paas-icon-copy"
                   v-clipboard:copy="runningInfo['image']"
                   v-clipboard:success="handleSuccessCopy"></i>
              </el-form-item>
              <el-form-item label="环境变量配置">
                <div v-if="runningInfo.environments && runningInfo.environments.length > 0">
                  <el-row>
                    <el-col :span="10" style="font-weight: bold;text-align: center">Key</el-col>
                    <el-col :span="10" style="font-weight: bold;text-align: center">Value</el-col>
                  </el-row>
                  <el-row v-for="(item, index) in runningInfo.environments" :key="item.name">
                    <el-col :span="10" style="text-align: center">
                      <div class="expand-to-next-line">{{item.name}}</div>
                    </el-col>
                    <el-col :span="10" style="text-align: center">
                      <div class="expand-to-next-line">{{item.value}}</div>
                    </el-col>
                  </el-row>
                </div>
                <div v-else>
                  <span>未知</span>
                </div>
              </el-form-item>
              <el-form-item label="Host配置">
                <div v-if="runningInfo.hosts && runningInfo.hosts.length > 0">
                  <el-row>
                    <el-col :span="10" style="font-weight: bold; text-align: center">IP</el-col>
                    <el-col :span="10" style="font-weight: bold; text-align: center">域名</el-col>
                  </el-row>
                  <el-row v-for="(item, index) in runningInfo.hosts" :key="item.key">
                    <el-col :span="10" style="text-align: center">{{item.ip}}</el-col>
                    <el-col :span="10" style="text-align: center">{{item.hostname}}</el-col>
                    <el-col :span="2"></el-col>
                  </el-row>
                </div>
                <div v-else>
                  <span>未知</span>
                </div>
              </el-form-item>
              <el-form-item label="端口映射">
                <div v-if="runningInfo.postMapped">
                  <div class="el-row">
                    <div class="el-col el-col-6" style="font-weight: bold; text-align: center">访问端口</div>
                    <div class="el-col el-col-2" style="min-height:1px"></div>
                    <div class="el-col el-col-6" style="font-weight: bold; text-align: center">目标端口</div>
                    <div class="el-col el-col-2" style="font-weight: bold; text-align: center">协议</div>
                    <div class="el-col el-col-2" style="font-weight: bold; text-align: center"></div>
                  </div>
                  <el-row class="content">
                    <el-col :span="6" style="text-align: center">{{runningInfo.postMapped.outerPort}}</el-col>
                    <el-col :span="2" style="text-align: center">--></el-col>
                    <el-col :span="6" style="text-align: center">{{runningInfo.postMapped.containerPort}}</el-col>
                    <el-col :span="2" style="text-align: center">TCP</el-col>
                  </el-row>
                </div>
                <div v-else>
                  <span>未知</span>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <div class="by-graphic">
        <div class="section request-statistic" v-for="(item, index) in requestStatisticList">
          <div class="title">{{`${item.type === 'internet' ? '外网域名':'内网域名'} "${item.domain}" 请求数据统计`}}</div>
          <div class="content">
            <div class="loading" style="height: 240px; " v-if="item.loading">
              <div class="el-loading-mask" style="">
                <div class="el-loading-spinner">
                  <i class="el-icon-loading"></i>
                  <p class="el-loading-text">网络请求中...</p>
                </div>
              </div>
            </div>
            <paas-request-statistic :topRequest="item.top" :total="item.total" v-else></paas-request-statistic>
          </div>
        </div>
      </div>
    </div>
    <!--<div v-else class="el-table__empty-text" style="color: #545454">暂无服务相关信息</div>-->
  </div>
</template>

<style lang="scss">
  .fix-form-item-label {
    line-height: 25px;
    padding-right: 4px;
  }
  .fix-form-item-content {
    line-height: 25px;
  }
  #service-detail {
    height: 100%;
    .el-textarea__inner {
      font-size: 14px;
    }
    .paas-icon-level-up {
      margin-left: 2px;
      font-size: 12px;
    }
    .header {
      .el-select .el-input__inner {
        height: 26px;
      }
    }
    .dialog-for-log {
      .el-dialog {
        width: 95%;
      }
      .log-item {
        /*white-space: pre;*/
        max-width: 100%;
        word-wrap: break-word;
        word-break: break-all;
        line-height: 1.4;
      }
      .info {
        color: #409EFF;
        font-weight: bold;
      }
      .warning {
        color: #E6A23C;
        font-weight: bold;
      }
      .error {
        color: #F56C6C;
        font-weight: bold;
      }
      .success {
        color: #67C23A;
        font-weight: bold;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @mixin expand-inline-form-item() {
    display: block;
    width: 100%;
    .el-form-item__label {
      float: left;
    }
    .el-form-item__content {
      display: block;
    }
  }
  #service-detail {
    background: white;
    height: 100%;
    /*max-width: 1500px;*/
    .header {
      padding: 3px 5px;
      border-bottom: 1px solid lightgrey;
      font-size: 14px;
      line-height: 20px;
      .paas-icon-level-up {
        font-size: 12px;
      }
      .selector {
        padding: 3px 0px;
        .item {
          display: inline-block;
          > span {
            line-height: 26px;
            cusor: pointer;
          }
        }
      }
      .operation {
        padding-top: 2px;
        padding-bottom: 6px;
        /*padding: 3px 0px;*/
      }
      &.notice {
        .el-tag {
          display: block;
          .el-icon-warning {
            vertical-align: middle;
          }
        }
      }
      &.domain {
        /*margin: 5px 5px 5px 8px;*/
        .el-col {
          .text {
            display: inline-block;
            max-width: calc(100% - 30px);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            word-wrap: break-word;
            word-break: break-all;
          }
          .el-icon-edit {
            font-size: 16px;
            margin-left: 0px;
          }
        }
      }
    }
    .service-info {
      overflow: scroll;
      box-sizing: border-box;
      padding: 8px;
      border: none;
      border-radius: 2px;
      display: flex;
      flex-direction: row;
      /*flex-wrap: nowrap;*/
      .paas-icon {
        margin-left: 2px;
        vertical-align: middle;
        &:hover {
          font-weight: bold;
          cursor: pointer;
        }
      }
      .section {
        display: inline-block;
        background: #fff;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
        box-shadow: 0 1px 1px rgba(0,0,0,0.15);
        .title {
          background-color: #f5f5f6;
          color: #666;
          font-weight: bold;
          text-align: center;
          font-size: 14px;
          line-height: 24px;
        }
      }
      .by-text {
        display: inline-flex;
        flex-direction: column;
        /*width: 100%;*/
        min-width: 420px;
        margin-right: 15px;
        .el-form {
          .el-form-item {
            .el-form-item__label {
              /*color: #409EFF;*/
              font-weight: bold;
            }
            &.el-form-item--mini {
              margin-bottom: 2px;
            }
            &.relativePathOfParentPOM {
              .el-form-item__label {
                /*line-height: 120%;*/
              }
            }
          }
        }
        .basic, .running {
          width: 100%;
          .content {
            padding: 5px 12px;
          }
        }
        .running {
          margin-top: 15px;
        }
      }
      .by-graphic {
        flex: 1;
        margin-top: 0px;
        .section {
          .loading {
            .el-loading-mask {
              position: absolute;
              z-index: 2000;
              background-color: rgba(255, 255, 255, 0.5);;
              margin: 0;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              transition: opacity .3s;
            }
            .el-loading-spinner {
              top: 50%;
              margin-top: -21px;
              width: 100%;
              height: 100px;
              text-align: center;
              position: absolute;
            }
          }
        }
        .request-statistic {
          width: 100%;
          max-width: 900px;
          margin-bottom: 15px;
          .content {
            .paas-request-statistic {
              width: 100%;
              .content {
                /*margin: 3px 6px;*/
              }
            ;
            }
          }
        }
      }
      .to-delete {
        width: 50%;
        .el-form {
          .el-form-item {
            width: 50%;
            @include expand-inline-form-item;
            .el-form-item__content {
              margin-left: 170px;
            }
            &.file-location {
              .el-tag {
                display: inline-block;
                line-height: 26px;
                height: 26px;
              }
            }
          }
        }
      }
    }
  }
</style>

<script>
  import {mapGetters} from 'vuex';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  import profileUtils from '../utils/app-props';
  import commonUtils from 'assets/components/mixins/common-utils';
  import paasRequestStatistic from './request-statistic.vue';
  export default {
    mixins: [commonUtils],
    components: {paasRequestStatistic},
    created() {
      this.profileUtils = profileUtils;
      var goBack = false;
      this.recoveryStatus();
      if (this.$storeHelper.dataTransfer) {
        const dataTransfer = this.$storeHelper.dataTransfer;
        const from = dataTransfer['from'];
        const theData = dataTransfer['data'];
        switch (from) {
          case this.$net.page['profile/service']:
            this.dataPassed.profileInfo = theData['profileInfo'];
            this.dataPassed.serviceInfo = theData['serviceInfo'];
            this.dataPassed.profileId = this.dataPassed.profileInfo.id;
            this.dataPassed.appId = this.dataPassed.serviceInfo.appId;
            this.isProductionProfile = (this.dataPassed.profileInfo.name === 'production');
            break;
        }
        this.$storeHelper.dataTransfer = null;
        this.requestServiceInfo(this.dataPassed.appId, this.dataPassed.profileId);
      } else {
        goBack = true;
      }
      if (goBack) {
        this.$router.go(-1);
        return;
      }
    },
    mounted() {
      try {
        let headerNode = this.$el.querySelector(':scope > .header');
        this.resizeListener = () => {
          let headerHeight = headerNode.offsetHeight;
          this.heightOfServiceInfo = this.$el.clientHeight - headerHeight;
        };
        addResizeListener(this.$el, this.resizeListener);
      } catch(err) {
      }
    },
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },
    computed: {
      ...mapGetters('user', {
        'userConfig': 'config'
      }),
    },
    data() {
      return {
//      1. 对于1.x团队的应用，服务管理页面中删除、配置外网域名、复制服务不可用，创建服务不可用。
//      2. 对于mesos应用，服务管理页面中重启按钮不可用
        resizeListenerForServiceList: () => {},
        heightOfServiceInfo: '',
        dataPassed: {
          profileId: null,
          serviceId: null,
          profileInfo: null,
          serviceInfo: null,
        },
        // whether current profile is production
        isProductionProfile: null,
        intranetDomain: null,
        internetDomainList: [],
        runningInfo: null,
        dnsState: {
          office: {
            status: true,
            content:  '',
            value: [],
          },
          production: {
            status: true,
            content: '',
            value: [],
          },
          test: {
            status: true,
            content: '',
            value: [],
          },
        },
        // 请求次数统计信息
        requestStatisticList: [],
        model: null,
        deployLogs: [],
        props4CreateDomain: {
          prefixName: '',
          subDomain: '',
          subDomainList: [],
          domainToAdd: [],
          // 校验规则：单个元素（语法校验）
          errMsgForDomainName: '',
          // 校验规则：域名数组（大于一个小于五个，无域名后缀）
          errMsgForDomainList: ''
        },
        showInternetDomainDialog: false,
      }
    },
    watch: {
    },
    methods: {
      recoveryStatus() {
        this.runningInfo = null;
        this.model = null;
      },

      handleClick(evt, action) {
        switch (action) {
          case 'refresh':
            this.requestServiceInfo(this.dataPassed.appId, this.dataPassed.profileId);
            break;
        }
      },

      processResponseData(origin) {
        if (origin["cpu"] > 100) {
          origin["cpu"] = origin["cpu"]/1000;
        }
        let hosts = origin["hosts"];
        let processedHosts = [];
        if (hosts && Array.isArray(hosts)) {
          hosts.forEach(it => {
            it.hostnames.forEach(any => {
              processedHosts.push({
                hostname:any,
                ip:it.ip,
              })
            });
          });
        }
        origin["hosts"] = processedHosts;
        return origin;
      },

      processDnsState(dnsState) {
        let officeStatus = dnsState && dnsState.hasOwnProperty("OFFICE") && dnsState["OFFICE"].length > 0;
        this.dnsState.office.status = officeStatus;
        this.dnsState.office.content = officeStatus ? `办公网DNS解析成功` : `办公网DNS解析失败`;
        this.dnsState.office.value = officeStatus ? dnsState["OFFICE"] : [];
        let productionStatus = dnsState && dnsState.hasOwnProperty("PRODUCTION") && dnsState["PRODUCTION"].length > 0;
        this.dnsState.production.status = productionStatus;
        this.dnsState.production.content = productionStatus ? `生产环境DNS解析成功` : `生产环境DNS解析失败`;
        this.dnsState.production.value = productionStatus ? dnsState["PRODUCTION"] : [];
        let testStatus = dnsState && dnsState.hasOwnProperty("TEST") && dnsState["TEST"].length > 0;
        this.dnsState.test.status = testStatus;
        this.dnsState.test.content = testStatus ? `测试环境DNS解析成功` : `测试环境DNS解析失败`;
        this.dnsState.test.value = testStatus ? dnsState["TEST"] : [];
      },

      // 获取请求统计数据
      async getRequestStatistic(appId, profileId, intranetDomain, internetDomainList) {
        this.requestStatisticList = [];
        // set default value for requestStatisticList
        if (intranetDomain) {
          this.requestStatisticList.push({
            type: 'intranet', domain: intranetDomain, loading: true
          });
        }
        if (internetDomainList && Array.isArray(internetDomainList)) {
          internetDomainList.forEach(it => {
            this.requestStatisticList.push({
              type: 'internet', domain: it, loading: true
            });
          })
        }

        try {
          var current = new Date().getTime();
          var start = current - 3600 * 1000 * 24;
          const resContent = await this.$net.requestPaasServer(Object.assign(
            this.$net.URL_LIST.service_info_request_statistic,
            {partial: true}
          ), {
            payload: {
              appId: appId,
              spaceId: profileId,
              endTime: this.$utils.formatDate(current, 'yyyy-MM-dd hh:mm:ss'),
              startTime: this.$utils.formatDate(start, 'yyyy-MM-dd hh:mm:ss'),
              intranetDomain: intranetDomain,
              internetDomain: internetDomainList
            }
          });
          const parseStatistic = function (type, domain, statistic) {
            var total = parseInt(statistic['total']);
            var top = [];
            var topTotalCount = 0;
            if (total > 0 && statistic.hasOwnProperty('top')) {
              top = Object.keys(statistic['top']).map(path => {
                var count = parseInt(statistic['top'][path]);
                var percent = count / total;
                var formattedPercent = percent * 100;
                formattedPercent = `${formattedPercent.toFixed(2)}%`;
                topTotalCount += count;
                return {
                  path, count, percent, formattedPercent
                }
              }).sort((pre, next) => {
                return (pre['count'] - next['count']) * -1;
              });

              var count = total - topTotalCount;
              var percent = count / total;
              var formattedPercent = percent * 100;
              formattedPercent = `${formattedPercent.toFixed(2)}%`;
              const others = {
                path: '其它',
                count, percent, formattedPercent
              };
              top.push(others)
            }
            var result = {
              type, domain, total, top, loading: false
            };
            return result
          };

          var requestStatisticList = [];
          if (resContent.hasOwnProperty('intranetDomain')) {
            Object.keys(resContent['intranetDomain']).forEach(key => {
              var statistic = resContent['intranetDomain'][key];
              requestStatisticList.push(parseStatistic('intranet', key, statistic));
            });
          }
          if (resContent.hasOwnProperty('internetDomain')) {
            Object.keys(resContent['internetDomain']).forEach(key => {
              var statistic = resContent['internetDomain'][key];
              requestStatisticList.push(parseStatistic('internet', key, statistic));
            });
          }

//      console.log(requestStatisticList);
//      console.log(JSON.stringify(requestStatisticList));
          this.requestStatisticList = requestStatisticList;
//      [{"type":"intranet","domain":"daasone.cif.test","total":149,"top":[{"path":"/css/bootstrap.min.css","count":10,"percent":0.06711409395973154},{"path":"/css/style.css","count":6,"percent":0.040268456375838924},{"path":"/js/jquery.js","count":6,"percent":0.040268456375838924},{"path":"/css/animate.css","count":6,"percent":0.040268456375838924},{"path":"/fonts/fontawesome-webfont.woff2","count":6,"percent":0.040268456375838924},{"path":"/js/bootstrap.min.js","count":6,"percent":0.040268456375838924},{"path":"/js/plugins/validate/messages_zh.min.js","count":4,"percent":0.026845637583892617},{"path":"/js/plugins/layer/layer.min.js","count":4,"percent":0.026845637583892617},{"path":"/js/content.js","count":4,"percent":0.026845637583892617},{"path":"/js/plugins/validate/jquery.validate.min.js","count":4,"percent":0.026845637583892617}]}]
        } catch(err) {
          this.requestStatisticList.forEach(it => {
            it.loading = false;
          });
        }
      },

      async requestServiceInfo(appId, profileId) {
        this.recoveryStatus();
        if (!appId || !profileId) {
          console.log('appId or profileId can not be empty');
          return;
        }
        let payload = {
          appId: appId,
          spaceId: profileId
        };
        this.$net.requestPaasServer(this.$net.URL_LIST.service_info_running, {payload}).then(resContent => {
          if (resContent.hasOwnProperty("applicationConfigDeployment")) {
            this.runningInfo = this.processResponseData(resContent["applicationConfigDeployment"]);
          }
          if (resContent.hasOwnProperty("dnsState")) {
            this.processDnsState(resContent["dnsState"]);
          }
        });
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {payload});
        const basicInfo = this.$net.parseServiceList(resContent);
        if (basicInfo.hasOwnProperty("applicationServerList")) {
          this.model = basicInfo["applicationServerList"].find(it => {
            return it["defaultSelect"] === true;
          });
        }
        this.intranetDomain = basicInfo["intranetDomain"];
        this.internetDomainList = basicInfo["internetDomain"];

        this.getRequestStatistic(appId, profileId, this.intranetDomain, this.internetDomainList);
      },

      handleSuccessCopy(evt) {
        this.$storeHelper.globalTip.show({
          ref: evt.trigger,
          msg: '复制成功'
        });
      },
    }
  }
</script>
