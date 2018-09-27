<template>
  <div id="monitor">
    <div class="header">
      <paas-version-selector @version-selected="onVersionSelected"></paas-version-selector>
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
    <div :class="{'chart-list': true, 'large-screen': largeScreen}">
      <div class="chart-container" v-if="statisticCpu">
        <div class="title">CPU使用率</div>
        <ve-line width="100%" :height="chartHeight" :legend-visible="false" :grid="grid" :data-zoom="dataZoom" ref="charts-cpu"
                 :data="statisticCpu"></ve-line>
      </div>
      <div class="chart-container" v-if="statisticMemory">
        <div class="title">内存使用</div>
        <ve-line width="100%" :height="chartHeight" :legend-visible="false" :grid="grid" :data-zoom="dataZoom"
                 ref="charts-memory" :extend="extend"
                 :data="statisticMemory" :settings="chartMemorySetting" :events="chartEvents"></ve-line>
      </div>
      <!--<div class="chart-container">-->
        <!--<div class="title">网络连接</div>-->
        <!--<ve-line width="100%" :height="chartHeight" :data="chartData3" :grid="grid" :data-zoom="dataZoom"-->
                 <!--:settings="chartSettings3"-->
                 <!--:legend-visible="false"></ve-line>-->
      <!--</div>-->
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
    }
    .chart-list {
      padding: 6px;
      padding-top: 12px;
      display: flex;
      align-content: flex-start;
      flex-wrap: wrap;
      &.large-screen {
        .chart-container {
          width: 50%;
        }
      }
      .chart-container {
        position: relative;
        width: 100%;
        box-sizing: border-box;
        border-radius: 10px;
        padding: 6px;
        .title {
          position: absolute;
          top: -6px;
          width: 100%;
          text-align: center;
          font-size: 14px;
          line-height: 1.5;
        }
        .ve-line {
          top: -15px;
          box-shadow: 0 0 10px rgba(0, 0, 0, .2);
          canvas {
            top: 12px;
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

    },
    mounted() {
      this.setDefaultDateRange();
      setTimeout(() => {
        this.onScreenSizeChange();
      });

      this.statisticCpu = {
        columns: ['日期', '访问用户', '下单用户', '下单率'],
        rows: [
          { '日期': '1/1', '访问用户': 1393, '下单用户': 1093, '下单率': 0.32 },
          { '日期': '1/2', '访问用户': 3530, '下单用户': 3230, '下单率': 0.26 },
          { '日期': '1/3', '访问用户': 2923, '下单用户': 2623, '下单率': 0.76 },
          { '日期': '1/4', '访问用户': 1723, '下单用户': 1423, '下单率': 0.49 },
          { '日期': '1/5', '访问用户': 3792, '下单用户': 3492, '下单率': 0.323 },
          { '日期': '1/6', '访问用户': 4593, '下单用户': 4293, '下单率': 0.78 }
        ]
      };
      setTimeout(() => {
        this.$refs['charts-cpu'].echarts.resize();
      });


      this.statisticMemory = {
        columns: ['timestamp', 'memory'],
        rows: [
          {"memory":0.3242940902709961,"timestamp":'1537408825000'},
          {"memory":0.32430171966552734,"timestamp":'1537408855000'},
          {"memory":0.3243064880371094,"timestamp":'1537408885000'},
          {"memory":0.2242826461791992,"timestamp":'1537408915000'},
          {"memory":0.32425880432128906,"timestamp":'1537408945000'}
        ]
      };
      this.statisticMemory.rows.forEach(it => {
        it.timestamp = this.$utils.formatDate(it.timestamp, 'yyyy-MM-dd hh:mm:ss');
//        let memory = it.memory * 100;
//        it.memory = memory;
//        memory = memory.toFixed(2) + '';
//        it.memory = `${memory}%`;
      });
      console.log(this.statisticMemory.rows);
      setTimeout(() => {
        this.$refs['charts-memory'].echarts.resize();
      });
    },
    methods: {
      setDefaultDateRange() {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 1000 * 60 * 5);
        this.dateTimeRange = [start, end];
      },
      onScreenSizeChange() {
        this.largeScreen = this.$el.clientWidth > 900 ? true : false;
        [].slice.call(this.$el.querySelectorAll('.chart-list .chart-container')).forEach(it => {
          if (this.largeScreen) {
            it.style.width = '50%';
          } else {
            it.style.width = '100%';
          }
        })
      },
      handleButtonClick() {
      },
      onVersionSelected() {

      },
      onDateRangeChange(range) {
        console.log(range[0].getTime());
        console.log(range[1].getTime());
      },
      getData() {
//        serviceInfo = this.$refs['version-selector'].getSelectedValue();
//        console.log(serviceInfo);
//        console.log(this.action.row);
        this.$net.requestPaasServer(this.$net.URL_LIST.monitor_statistic_memory, {
          payload: {
            "spaceId": 1,
            "spaceName": "fpdev",
            "groupId": 4506,
            "groupTag":"paastest",
            "instanceName": "v100-galaxy-job-console-782795121-71h4d",
            "serviceName":"v100-galaxy-job-console",
            "env": "fpdev",
            "startTime": 1537408825000,
            "endTime": 1537408945000,
            "interval": "1h"
          }
        }).then(resContent => {
          console.log(JSON.stringify(resContent));
        });
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
    },
    data() {
      return {
        largeScreen: false,
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

        chartHeight: '280px',
        grid: {
          top: 30,
          left: 5,
          bottom: 20,
          height: 230,
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
          'xAxis.0.axisLabel.rotate': 0
        },
        chartEvents: {
          click: (evt) => {
            console.log(evt);
          }
        },
        statisticCpu: null,
        chartCpuSetting: {
          metrics: ['memory'],
          dimension: ['timestamp'],
          yAxisName: ['使用率'],
        },
        statisticMemory: null,
//        chartMemoryConfig: {
//          xAxis: {
//            name: '日期',
//            axisLabel: {
//              formatter() {
//                return 2;
//              }
//            }
//          }
//        },
        chartMemorySetting: {
          metrics: ['memory'],
          dimension: ['timestamp'],
//          xAxisType: 'time',
//          xAxisType: 'value',
          yAxisName: ['使用率'],
          yAxisType: ['percent']
        },
        chartSettings3: {
          axisSite: { right: ['下单率'] },
          yAxisType: ['KMB', 'percent'],
          yAxisName: ['数值', '比率'],

        },
        chartData3: {
          columns: ['日期', '访问用户', '下单用户', '下单率'],
          rows: [
            { '日期': '1/1', '访问用户': 1393, '下单用户': 1093, '下单率': 0.32 },
            { '日期': '1/2', '访问用户': 3530, '下单用户': 3230, '下单率': 0.26 },
            { '日期': '1/3', '访问用户': 2923, '下单用户': 2623, '下单率': 0.76 },
            { '日期': '1/4', '访问用户': 1723, '下单用户': 1423, '下单率': 0.49 },
            { '日期': '1/5', '访问用户': 3792, '下单用户': 3492, '下单率': 0.323 },
            { '日期': '1/6', '访问用户': 4593, '下单用户': 4293, '下单率': 0.78 }
          ]
        }
      }
    }
  }
</script>