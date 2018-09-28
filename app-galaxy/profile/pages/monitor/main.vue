<template>
  <div id="monitor">
    <div class="header">
      <div class="condition">
        <paas-version-selector :customConfig="config4VersionSelector" ref="version-selector"
                               @version-selected="onVersionSelected"></paas-version-selector>
        <div class="item">
          <label>监控区间:</label>
          <el-date-picker
                  style="display: inline-block; width: 340px;"
                  size="mini"
                  v-model="dateTimeRange"
                  type="datetimerange"
                  :picker-options="pickerOptions2"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  align="right"
                  :enableClose="false"
                  @change="onDateRangeChange"
          >
          </el-date-picker>
        </div>
        <el-button
                size="mini-extral"
                type="primary"
                @click="handleButtonClick('search')">查询</el-button>
      </div>
      <div class="statistic-type-list">
        <div class="title">实例指标：</div>
        <el-checkbox-group v-model="selectedStatisticTypeList">
          <el-checkbox v-for="item in statisticTypeList" :label="item.type" :key="item.type">
            {{item.label}}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="instance-list">
        <div class="title">实例列表：</div>
        <el-checkbox-group v-model="selectedInstanceList">
          <el-checkbox v-for="item in instanceList" :label="item.id" :key="item.id">
            {{item.id}}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div class="chart-list" :style="{height: heightOfChartList + 'px'}">
      <div :class="{'chart-container':true, 'shrink': !chartContainerStatus['cpu']['expand']}"
           v-if="chartContainerStatus['cpu'].show">
        <div class="chart-card">
          <div class="title">
            <span>CPU使用率</span>
            <i :class="['paas-icon', chartContainerStatus['cpu']['expand']?'paas-icon-fa-arrow-left':'paas-icon-fa-arrow-right']"
               @click="handleChartEvent('cpu')"></i>
          </div>
          <ve-line width="100%" :height="chartHeight" :legend-visible="false" :grid="grid" :data-zoom="dataZoom"
                   :settings="chartSettingPercent" :extend="extend"
                   v-if="chartData['cpu'] != null"
                   ref="charts-cpu" :data="chartData['cpu']"></ve-line>
          <div class="empty" :style="{'width':'100%', 'height':chartHeight}" v-else>
            <span>暂无数据，请尝试点击查询按钮刷新数据。</span>
          </div>
        </div>
      </div>
      <div :class="{'chart-container':true, 'shrink': !chartContainerStatus['memory']['expand']}"
           v-if="chartContainerStatus['memory'].show">
        <div class="chart-card">
          <div class="title">
            <span>内存使用率</span>
            <i :class="['paas-icon', chartContainerStatus['memory']['expand']?'paas-icon-fa-arrow-left':'paas-icon-fa-arrow-right']"
               @click="handleChartEvent('memory')"></i>
          </div>
          <ve-line width="100%" :height="chartHeight" :legend-visible="false" :grid="grid" :data-zoom="dataZoom"
                   :settings="chartSettingPercent" :extend="extend"
                   v-if="chartData['memory'] != null"
                   ref="charts-memory" :data="chartData['memory']"></ve-line>
          <div class="empty" :style="{'width':'100%', 'height':chartHeight}" v-else>
            <span>暂无数据，请尝试点击查询按钮刷新数据。</span>
          </div>
        </div>
      </div>

      <div :class="{'chart-container':true, 'shrink': !chartContainerStatus['network-in']['expand']}"
           v-if="chartContainerStatus['network-in'].show">
        <div class="chart-card">
          <div class="title">
            <span>网络流量-入</span>
            <i :class="['paas-icon', chartContainerStatus['network-in']['expand']?'paas-icon-fa-arrow-left':'paas-icon-fa-arrow-right']"
               @click="handleChartEvent('network-in')"></i>
          </div>
          <ve-line width="100%" :height="chartHeight" :legend-visible="false" :grid="grid" :data-zoom="dataZoom"
                   :settings="chartSettingBytes" :extend="extend"
                   v-if="chartData['network-in'] != null"
                   ref="charts-network-in" :data="chartData['network-in']"></ve-line>
          <div class="empty" :style="{'width':'100%', 'height':chartHeight}" v-else>
            <span>暂无数据，请尝试点击查询按钮刷新数据。</span>
          </div>
        </div>
      </div>

      <div :class="{'chart-container':true, 'shrink': !chartContainerStatus['network-out']['expand']}"
           v-if="chartContainerStatus['network-out'].show">
        <div class="chart-card">
          <div class="title">
            <span>网络流量-出</span>
            <i :class="['paas-icon', chartContainerStatus['network-out']['expand']?'paas-icon-fa-arrow-left':'paas-icon-fa-arrow-right']"
               @click="handleChartEvent('network-out')"></i>
          </div>
          <ve-line width="100%" :height="chartHeight" :legend-visible="false" :grid="grid" :data-zoom="dataZoom"
                   :settings="chartSettingBytes" :extend="extend"
                   v-if="chartData['network-out'] != null"
                   ref="charts-network-out" :data="chartData['network-out']"></ve-line>
          <div class="empty" :style="{'width':'100%', 'height':chartHeight}" v-else>
            <span>暂无数据，请尝试点击查询按钮刷新数据。</span>
          </div>
        </div>
      </div>

      <div :class="{'chart-container':true, 'shrink': !chartContainerStatus['disk-read']['expand']}"
           v-if="chartContainerStatus['disk-read'].show">
        <div class="chart-card">
          <div class="title">
            <span>磁盘-读</span>
            <i :class="['paas-icon', chartContainerStatus['disk-read']['expand']?'paas-icon-fa-arrow-left':'paas-icon-fa-arrow-right']"
               @click="handleChartEvent('disk-read')"></i>
          </div>
          <ve-line width="100%" :height="chartHeight" :legend-visible="false" :grid="grid" :data-zoom="dataZoom"
                   :settings="chartSettingBytes" :extend="extend"
                   v-if="chartData['disk-read'] != null"
                   ref="charts-disk-read" :data="chartData['disk-read']"></ve-line>
          <div class="empty" :style="{'width':'100%', 'height':chartHeight}" v-else>
            <span>暂无数据，请尝试点击查询按钮刷新数据。</span>
          </div>
        </div>
      </div>

      <div :class="{'chart-container':true, 'shrink': !chartContainerStatus['disk-write']['expand']}"
           v-if="chartContainerStatus['disk-write'].show">
        <div class="chart-card">
          <div class="title">
            <span>磁盘-写</span>
            <i :class="['paas-icon', chartContainerStatus['disk-write']['expand']?'paas-icon-fa-arrow-left':'paas-icon-fa-arrow-right']"
               @click="handleChartEvent('disk-write')"></i>
          </div>
          <ve-line width="100%" :height="chartHeight" :legend-visible="false" :grid="grid" :data-zoom="dataZoom"
                   :settings="chartSettingBytes" :extend="extend"
                   v-if="chartData['disk-write'] != null"
                   ref="charts-disk-write" :data="chartData['disk-write']"></ve-line>
          <div class="empty" :style="{'width':'100%', 'height':chartHeight}" v-else>
            <span>暂无数据，请尝试点击查询按钮刷新数据。</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  #monitor {
    background-color: white;
    height: 100%;
    .header {
      padding: 3px 5px;
      font-size: 14px;
      min-height: 28px;
      .paas-version-selector {
        display: inline-block;
      }
      .item {
        display: inline-block;
        margin-right: 3px;
      }
      .statistic-type-list, .instance-list {
        margin: 5px 0px;
        display: flex;
        justify-content: flex-start;
        .title {
          color: rgb(19, 206, 102);
          line-height: 19px;
          font-weight: bold;
        }
        .el-checkbox-group {
          display: inline-block;
          .el-checkbox {
            height: auto;
          }
        }
      }
    }
    .chart-list {
      padding: 6px;
      display: flex;
      align-content: flex-start;
      flex-wrap: wrap;
      box-sizing: border-box;
      overflow-y: scroll;
      /*background-color: #F2F6FC;*/
      .chart-container {
        position: relative;
        width: 100%;
        box-sizing: border-box;
        padding: 6px;
        &.shrink {
          width: 50%;
        }
        .chart-card {
          box-shadow: 0 0 10px rgba(0, 0, 0, .2);
          /*background-color: white;*/
          /*border: 1px solid rgba(0, 0, 0, .2);*/
          border-radius: 10px;
          .title {
            position: absolute;
            z-index: 1000;
            width: 100%;
            text-align: center;
            font-size: 14px;
            line-height: 1.5;
            background: transparent;
            .paas-icon {
              position: absolute;
              right: 16px;
              &:hover {
                color: #409EFF;
              }
            }
          }
          .ve-line {
          }
          .empty {
            font-size: 14px;
            color: gray;
            display: flex;
            justify-content: space-around;
            align-items: center;
          }
        }
      }
    }
  }
</style>
<style lang="scss">
  #monitor {
    .header {
      .el-select .el-input__inner {
        height: 24px;
      }
      .el-input .el-input__inner {
        height: 24px;
      }
      .el-range-editor--mini.el-input__inner {
        height: 26px;
      }
      .el-range-editor.el-input__inner {
        padding: 2px 6px;
      }
    }
  }
</style>

<script>
  import 'echarts/lib/component/dataZoom';
  import VeLine from 'v-charts/lib/line.common';
  import paasVersionSelector from '../components/version-selector';
  export default {
    components: { VeLine, paasVersionSelector },
    created() {
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer['from'];
        const data = dataTransfer['data'];
        switch (from) {
          case this.$net.page['profile/instance']:
            this.config4VersionSelector = {
              appId: data['appId'],
              profileId: data['profileId'],
              serviceId: data['serviceId'],
            };
            this.selectedInstanceList.push(data['instanceId']);
//            this.instanceList = data.hasOwnProperty('instanceList') ? data['instanceList'] : null;
            this.$store.dispatch('user/config', {
              page: 'monitor',
              data: {
                appId: data['appId'],
                profileId: data['profileId'],
                serviceId: data['serviceId'],
                instanceId: data['instanceId'],
              }
            });
            break;
        }
        this.$storeHelper.dataTransfer = null;
      }

      if (!this.config4VersionSelector) {
        // get config from localStorage
        const userConfig = this.$storeHelper.userConfig;
        if (userConfig.hasOwnProperty('monitor')) {
          const monitorConfig = userConfig['monitor'];
          if (this.$utils.hasProps(monitorConfig, 'appId', 'profileId', 'serviceId')) {
            this.config4VersionSelector = {
              appId: monitorConfig['appId'],
              profileId: monitorConfig['profileId'],
              serviceId: monitorConfig['serviceId'],
            }
          }
        }
      }
    },
    async mounted() {
      this.setDefaultDateRange();
      setTimeout(() => {
        this.onScreenSizeChange();
      });
    },
    methods: {
      setDefaultDateRange() {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 1000 * 3600 * 24 * 2);
        this.dateTimeRange = [start, end];
      },
      onScreenSizeChange() {
        const largeScreen = this.$el.clientWidth > 900 ? true : false;
        for (let key in this.chartContainerStatus) {
          let status = this.chartContainerStatus[key];
          if (!status['manual'] && largeScreen) {
            status['expand'] = false;
          }
        }

        const headerNode = this.$el.querySelector(':scope > .header');
        const headerHeight = headerNode.offsetHeight;
        this.heightOfChartList = this.$el.clientHeight - headerHeight - 5;
      },
      handleButtonClick(action) {
        switch (action) {
          case 'search':
            this.requestStatisticData();
            break;
        }
      },
      handleChartEvent(type) {
        this.chartContainerStatus[type]['expand'] = !this.chartContainerStatus[type]['expand'];
        this.chartContainerStatus[type]['manual'] = true;
        this.$nextTick(() => {
          if (this.$refs[`charts-${type}`]) {
            this.$refs[`charts-${type}`].echartsResize();
          };
        });
      },
      async onVersionSelected(selectedAPP, selectedProfile, selectedService) {
        if (!this.instanceList) {
          if (selectedAPP && selectedProfile && selectedService) {
            const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.instance_list, {
              payload: {
                appId: selectedAPP.appId,
                spaceId: selectedProfile.id,
                serviceVersion: selectedService.serviceVersion
              }
            });
            this.instanceList = resContent['instanceList'];
//            console.log(this.instanceList);
          } else {
          }
        } else {
        }
      },
      onDateRangeChange(range) {
        console.log(range[0].getTime());
        console.log(range[1].getTime());
      },

      requestStatisticData() {
        if (!this.instanceList) {
          this.$message.error('实例列表为空，请确保该服务下有运行实例');
          return;
        }
        if (this.selectedInstanceList.length === 0) {
          this.$message.error('当前所选实例为空，请在实例列表中选择实例');
          return;
        }

//        ['cpu', 'memory', 'network-in', 'network-out', 'disk-read', 'disk-write']
        const serviceInfo = this.$refs['version-selector'].getSelectedValue();
        const payload = {
          groupId: this.$storeHelper.groupInfo['id'],
          groupTag: this.$storeHelper.groupInfo['tag'],
          spaceId: serviceInfo.selectedProfile.id,
          spaceName: serviceInfo.selectedProfile.name,
          env: serviceInfo.selectedProfile.name,
          serviceName: serviceInfo.selectedService.serviceName,
          instanceName: this.selectedInstanceList[0],
          startTime: this.dateTimeRange[0].getTime(),
          endTime: this.dateTimeRange[1].getTime(),
          interval: "1h"
        };
//        console.log(serviceInfo);
//        console.log(this.$storeHelper.groupInfo());
//        console.log(this.dateTimeRange[0].getTime());
//        console.log(payload);

        const URL_LIST = this.$net.URL_LIST;
        const URL_MAP = {
          'cpu': URL_LIST.monitor_statistic_cpu,
          'memory': URL_LIST.monitor_statistic_memory,
          'network-in': URL_LIST.monitor_statistic_net_in,
          'network-out': URL_LIST.monitor_statistic_net_out,
          'disk-read': URL_LIST.monitor_statistic_disk_read,
          'disk-write': URL_LIST.monitor_statistic_disk_write,
        };
        const statisticTypeList = this.selectedStatisticTypeList.filter(it => {
          if (URL_MAP.hasOwnProperty(it)) {
            return true;
          } else {
            return false;
          }
        });

        // init value of this.chartData
        statisticTypeList.forEach(it => {
          this.chartData[it] = null;
        });

        const formatResponseData = (type, data) => {
          var result = data;
          switch (type) {
            case 'cpu':
            case 'memory':
              result = data.map(it => {
                let item = {};
                item['timestamp'] = this.$utils.formatDate(it['timestamp'], 'yyyy-MM-dd hh:mm:ss');
                item[payload.instanceName] = it['values'];
                return item;
              });
              break;
            case 'network-in':
            case 'network-out':
            case 'disk-read':
            case 'disk-write':
              result = data.map(it => {
                let item = {};
                item['timestamp'] = this.$utils.formatDate(it['timestamp'], 'yyyy-MM-dd hh:mm:ss');
                item[payload.instanceName] = it['values'];
                return item;
              });
              break;
              break;
          }
          return result;
        };
        // get statistic data
        const statisticData = {};
        Promise.all(statisticTypeList.map(it => {
          return this.$net.requestPaasServer(URL_MAP[it], {
            payload
          });
        })).then(resContentList => {
//          console.log(resContentList);
          if (resContentList.length === statisticTypeList.length) {
            statisticTypeList.forEach((type, index) => {
              statisticData[type] = formatResponseData(type, resContentList[index]);
            });
          }
        }).catch(err => {
          console.log(err);
        }).finally(() => {
          if (Object.keys(statisticData).length !== statisticTypeList.length) {
            this.$message.error('数据获取失败');
            console.log(Object.keys(statisticData).length);
            console.log(statisticTypeList.length);
          } else {
            const columns = ['timestamp'].concat(this.selectedInstanceList);
            for (let key in statisticData) {
              this.chartData[key] = {
                columns,
                rows: statisticData[key]
              }
            }

            setTimeout(() => {
              statisticTypeList.forEach(it => {
                if (this.$refs[`charts-${it}`]) {
                  this.$refs[`charts-${it}`].echartsResize();
                };
              });
            });
//            console.log(columns);
            console.log(statisticData);
            console.log(this.chartData);
          }
        });

//        this.chartData['cpu'] = {
//          "columns": ["timestamp", "v100-galaxy-job-console-782795121-4jhp5"],
//          "rows": [{
//            "timestamp": "2018-09-27 11:59:10",
//            "v100-galaxy-job-console-782795121-4jhp5": 0.07069556809333334
//          }, {
//            "timestamp": "2018-09-27 11:59:40",
//            "v100-galaxy-job-console-782795121-4jhp5": 0.000505632773333331
//          }, {
//            "timestamp": "2018-09-27 12:00:10",
//            "v100-galaxy-job-console-782795121-4jhp5": 0.0005720369442037211
//          }, {
//            "timestamp": "2018-09-27 12:00:40",
//            "v100-galaxy-job-console-782795121-4jhp5": 0.00465175705047003
//          }, {
//            "timestamp": "2018-09-27 12:01:10",
//            "v100-galaxy-job-console-782795121-4jhp5": 0.00638525202813053
//          }, {
//            "timestamp": "2018-09-27 12:01:40",
//            "v100-galaxy-job-console-782795121-4jhp5": 0.0020305455315177147
//          }, {
//            "timestamp": "2018-09-27 12:02:10",
//            "v100-galaxy-job-console-782795121-4jhp5": 0.0027648132208813927
//          }, {
//            "timestamp": "2018-09-27 12:02:40",
//            "v100-galaxy-job-console-782795121-4jhp5": 0.005621772853333326
//          }, {
//            "timestamp": "2018-09-27 12:03:10",
//            "v100-galaxy-job-console-782795121-4jhp5": 0.001717748366666676
//          }, {
//            "timestamp": "2018-09-27 12:03:40",
//            "v100-galaxy-job-console-782795121-4jhp5": 0.0018137060599999859
//          }]
//        };
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
      'selectedStatisticTypeList': function (selectedList) {
        // whether show the chart or not
        for (let key in this.chartContainerStatus) {
         if (selectedList.indexOf(key) > -1) {
           this.chartContainerStatus[key]['show'] = true;
         } else {
           this.chartContainerStatus[key]['show'] = false;
         }
        }
      }
    },
    data() {
      return {
        config4VersionSelector: null,
        heightOfChartList: 0,
        instanceList: null,
        dateTimeRange: [],
        pickerOptions2: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近两个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 60);
              picker.$emit('pick', [start, end]);
            }
          }]
        },

        selectedStatisticTypeList: ['cpu', 'memory', 'network-in', 'network-out', 'disk-read', 'disk-write'],
        statisticTypeList: [{
          type: 'cpu',
          label: 'CPU',
        }, {
          type: 'memory',
          label: '内存'
        }, {
          type: 'network-in',
          label: '网络(进)'
        }, {
          type: 'network-out',
          label: '网络(出)'
        }, {
          type: 'disk-read',
          label: '磁盘(读)'
        }, {
          type: 'disk-write',
          label: '磁盘(写)'
        }],
        chartContainerStatus: {
          'cpu': {
            expand: true,
            show: true,
            manual: false,
          },
          'memory': {
            expand: true,
            show: true,
            manual: false,
          },
          'network-in': {
            expand: true,
            show: true,
            manual: false,
          },
          'network-out': {
            expand: true,
            show: true,
            manual: false,
          },
          'disk-read': {
            expand: true,
            show: true,
            manual: false,
          },
          'disk-write': {
            expand: true,
            show: true,
            manual: false,
          }
        },
        selectedInstanceList: [],

        chartData: {
          cpu: null,
          memory: null,
          'network-in': null,
          'network-out': null,
        },

        chartHeight: '230px',
        grid: {
          top: 30,
          left: 5,
          bottom: 20,
          height: 180,
        },
        dataZoom: [
          {
            type: 'slider',
            start: 0,
            end: 100,
            bottom: 3,
            height: 15,
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          }
        ],
        extend: {
          'xAxis.0.axisLabel.rotate': 0,
          'tooltip.textStyle.fontSize': 12,
          'tooltip.textStyle.lineHeight': 14,
          'tooltip.position': [3, 3],
        },
        chartEvents: {
          click: (evt) => {
            console.log(evt);
          }
        },
        chartSettingPercent: {
          dimension: ['timestamp'],
//          xAxisType: 'time',
//          xAxisType: 'value',
          yAxisName: ['使用率'],
          yAxisType: ['percent']
        },
        chartSettingBytes: {
          dimension: ['timestamp'],
          yAxisName: ['流量'],
          yAxisType: ['value']
        },

        chartSettings3: {
          axisSite: { right: ['下单率'] },
          yAxisType: ['KMB', 'percent'],
          yAxisName: ['数值', '比率'],
        },
      }
    }
  }
</script>