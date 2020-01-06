<template>
  <div id="profile_general">
    <div class="header">
    </div>
    <div class="statistic">
      <div class="section request">
        <div class="header">
          <div class="title">资源使用量统计</div>
          <el-button
                  size="mini-extral"
                  :type="'primary'"
                  :class="{'primary': true}"
                  @click="handleButtonClick($event, 'refresh_request_statistic')">
            刷新
          </el-button>
        </div>
        <div class="chart-list">
          <div class="chart" v-loading="!status['general_instance_count'].ready"
               :style="{width: `${size.barChart.width}px`, height: `${size.barChart.height}px`}">
            <apxe-chart :width="size.barChart.width" :height="size.barChart.height" type=bar :options="status['general_instance_count'].chartOptions"
                        :series="status['general_instance_count'].series" v-if="status['general_instance_count'].ready"></apxe-chart>
          </div>
          <div class="chart" v-loading="!status['general_cpu_count'].ready"
               :style="{width: `${size.barChart.width}px`, height: `${size.barChart.height}px`}">
            <apxe-chart :width="size.barChart.width" :height="size.barChart.height" type=bar :options="status['general_cpu_count'].chartOptions"
                        :series="status['general_cpu_count'].series" v-if="status['general_cpu_count'].ready"></apxe-chart>
          </div>
          <div class="chart" v-loading="!status['general_memory_size'].ready"
               :style="{width: `${size.barChart.width}px`, height: `${size.barChart.height}px`}">
            <apxe-chart :width="size.barChart.width" :height="size.barChart.height" type=bar :options="status['general_memory_size'].chartOptions"
                        :series="status['general_memory_size'].series" v-if="status['general_memory_size'].ready"></apxe-chart>
          </div>
        </div>
      </div>
      <div class="section ratio">
        <div class="header">
          <div class="title">资源使用率统计</div>
          <el-date-picker style="display: inline-block; "
                          class=" disable-close"
                          v-model="query.dateRange"
                          type="datetimerange"
                          size="mini"
                          align="right"
                          unlink-panels
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期"
                          :enableClose="false"
                          :picker-options="datePickerOptions">
          </el-date-picker>
          <el-button
                  size="mini-extral"
                  :type="'primary'"
                  :class="{'primary': true}"
                  @click="handleButtonClick($event, 'refresh_use_ratio')">
            刷新
          </el-button>
        </div>
        <div class="chart-list">
          <div class="chart" v-loading="!status['general_ratio_cpu_usage'].ready"
               :style="{width: `${size.lineChart.width}px`, height: `${size.lineChart.height}px`}">
            <apxe-chart :width="size.lineChart.width" :height="size.lineChart.height" type=line :options="status['general_ratio_cpu_usage'].chartOptions" :series="status['general_ratio_cpu_usage'].series" v-if="status['general_ratio_cpu_usage'].ready"></apxe-chart>
          </div>
          <div class="chart" v-loading="!status['general_ratio_memory_usage'].ready"
               :style="{width: `${size.lineChart.width}px`, height: `${size.lineChart.height}px`}">
            <apxe-chart :width="size.lineChart.width" :height="size.lineChart.height" type=line :options="status['general_ratio_memory_usage'].chartOptions" :series="status['general_ratio_memory_usage'].series" v-if="status['general_ratio_memory_usage'].ready"></apxe-chart>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<style lang="scss">
  #profile_general {
    .chart-list {
      .chart {
        .apexcharts-tooltip {
          background: rgba(220, 220, 220, .5);
          .apexcharts-tooltip-series-group {
            padding-bottom: 2px;
            .apexcharts-tooltip-marker {
              width: 8px;
              height: 8px;
            }
            .apexcharts-tooltip-y-group {
              padding: 0px;
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #profile_general {
    & > .statistic {
      & > .section {
        margin-top: 10px;
        .header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 5px;
          .title {
            font-size: 14px;
            border-left: 5px solid gray;
            padding-left: 5px;
            margin-right: 12px;
          }
        }
        .chart-list {
          display: flex;
          flex-wrap: wrap;
          .chart {
            margin-right: 5px;
            .title {
              font-size: 12px;
              /*font-weight: bold;*/
              text-align: center;
            }
          }
        }
        &.request {
          .chart {
            /*background-color: white;*/
          }
        }
        &.ratio {
          .chart {
          }
        }
      }
    }
  }
</style>
<script>
  import apexCharts from 'vue-apexcharts';
  import commonUtils from 'assets/components/mixins/common-utils';

  // it seems there is not enough info for customToolTip
  const customToolTip = ({series, seriesIndex, dataPointIndex, w}) => {
      // console.log({series, seriesIndex, dataPointIndex, w});
      return '<div class="arrow_box">' +
        '<span>' + series[seriesIndex][dataPointIndex] + '</span>' +
        '</div>'
  };

  // default values for status
  const CONSTANT = {
    general_instance_count: {
      chartOptions: {
        title: {
          text: '实例数',
        },
        xaxis: {
          labels: {
            rotate: -25,
          }
        },
        yaxis: {
          title: {
            text: '（单位：个）',
          },
          labels: {
            formatter(val, index) {
              if (val < 1) {
                return 0;
              }
              val = parseInt(val);
              return val;
            }
          }
        }
      }
    },
    general_cpu_count: {
      chartOptions: {
        title: {
          text: 'CPU申请核数',
        },
        xaxis: {
          labels: {
            rotate: -25,
          }
        },
        yaxis: {
          title: {
            text: '（单位：核）',
          },
          labels: {
            formatter(val, index) {
              if (val < 1) {
                return 0;
              }
              val = parseInt(val);
              return val;
            }
          }
        }
      }
    },
    general_memory_size: {
      // title: '内存申请量',
      chartOptions: {
        title: {
          text: '内存申请量',
        },
        xaxis: {
          labels: {
            rotate: -25,
          }
        },
        yaxis: {
          title: {
            text: '（单位：GB）',
          },
          labels: {
            formatter(val, index) {
              if (val < 1) {
                return 0;
              }
              val = parseInt(val);
              return val;
            }
          }
        },
        tooltip: {
          y: {
            formatter(val) {
              return `${val}G`;
            }
          }
        }
      }
    },
    general_ratio_cpu_usage: {
      chartOptions: {
        title: {
          text: 'CPU使用率',
        },
        yaxis: {
          title: {
            text: '（单位：%）',
          },
          // tickAmount: 3
        },
        tooltip: {
          // intersect: false,
          shared: true,
          y: {
            formatter(val) {
              if (null == val) {
                return '--'
              } else {
                return `${val}%`;
              }
            }
          }
        }
      }
    },
    general_ratio_memory_usage: {
      chartOptions: {
        title: {
          text: '内存使用率',
        },
        yaxis: {
          title: {
            text: '（单位：%）',
          },
        },
        tooltip: {
          shared: true,
          y: {
            formatter(val) {
              if (null == val) {
                return '--'
              } else {
                return `${val}%`;
              }
            }
          }
        }
      }
    }
  };
  export default {
    mixins: [commonUtils],
    components: {
      apxeChart: apexCharts
    },
    created() {
    },
    mounted() {
      if (Array.isArray(this.$storeHelper.profileListOfGroup) && this.$storeHelper.profileListOfGroup.length > 0) {
        this.onProfileListOfGroup(this.$storeHelper.profileListOfGroup);
      }
    },
    data() {
      return {
        // all data related for chart drawing, including data(series), chart config(chartOptions), and others, such as title
        size: {
          barChart: {
            width: 320,
            height: 240,
          },
          lineChart: {
            width: 400,
            height: 240,
          }
        },
        status: {
          general_instance_count: {
            // custom property: if data is ready
            ready: false,
            timestamp: 0,
            series: [{
              name: '实例数',
              data: []
            }],
            chartOptions: {
            }
          },
          general_cpu_count: {
            ready: false,
            timestamp: 0,
            series: [{
              name: 'CPU核数',
              data: []
            }],
            chartOptions: {
              title: {
                text: 'CPU核数',
                align: 'left'
              }
            }
          },
          general_memory_size: {
            ready: false,
            timestamp: 0,
            series: [{
              name: '内存申请量',
              data: []
            }],
            chartOptions: {
              title: {
                text: '内存申请量',
                align: 'left'
              }}
          },
          general_ratio_cpu_usage: {
            ready: false,
            series: [],
            chartOptions: {}
          },
          general_ratio_memory_usage: {
            ready: false,
            series: [],
            chartOptions: {}
          },
        },
        query: {
          dateRange: [new Date(Date.now() - 1000 * 3600 * 3), new Date()],
        },
        datePickerOptions: {
          shortcuts: [{
            text: '最近三小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 3);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一天',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三天',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
      }
    },
    watch: {
      '$storeHelper.profileListOfGroup': 'onProfileListOfGroup',
    },
    methods: {
      onProfileListOfGroup(profileListOfGroup) {
        // status request should after profileListOfGroup is get
        this.drawChartBar(profileListOfGroup);
        this.drawChartLine(profileListOfGroup);
      },

      // 绘制申请数
      drawChartBar(profileListOfGroup) {
        if (this.drawChartBar.lastRequest && ((Date.now() - this.drawChartBar.lastRequest) < 2 * 1000)) {
          console.log(`ignore this request for status all`);
          return;
        }
        const commonChartOptions = {
          title: {
            align: 'left',
            margin: 0,
            style: {
              fontSize: '12px'
            }
          },
          chart: {
            // height: 400,
            // width: 500,
            // type: 'bar',
            events: {
              click: function (chart, w, e) {
                // console.log(chart, w, e)
              }
            },
          },
          colors: [],
          plotOptions: {
            bar: {
              columnWidth: '45%',
              distributed: true
            }
          },
          dataLabels: {
            enabled: false,
          },
          xaxis: {
            categories: [],
              labels: {
              style: {
                colors: [],
                  fontSize: '12px'
              }
            }
          },
          yaxis: {
            title: {
              style: {
                fontSize: '12px',
                  fontWeight: 'normal'
              }
            }
          }
        };

        // update commonChartOptions for each chart
        ['general_instance_count', 'general_cpu_count', 'general_memory_size'].forEach(key => {
          this.status[key].chartOptions = this.$utils.deepMerge(commonChartOptions, CONSTANT[key].chartOptions);
        });

        this.drawChartBar.lastRequest = Date.now();
        this._request('general_instance_count');
        this._request('general_cpu_count');
        this._request('general_memory_size');
      },
      async _request(type) {
        if (!['general_instance_count', 'general_cpu_count', 'general_memory_size'].includes(type)) {
          return;
        }
        const dataFomatter = {
          general_memory_size(val) {
            return parseInt(parseInt(val) / (1024  * 1024 * 1024));
          }
        };
        this.status[type].ready = false;
        // format of resData:
        // [{
        //   spaceId: 2, values: [{timestamp, count}]
        // }, ...]
        var resData = await this.$net.requestPaasServer(this.$net.URL_LIST[type], {
          data: {
            groupId: this.$storeHelper.currentGroupId,
          }
        });
        // filter, sort, map resData
        const spaceIdListOfGroup = this.$storeHelper.profileListOfGroup.map(it => it.id);
        resData = resData.filter(it => spaceIdListOfGroup.includes(it.spaceId))
          .sort((pre, next) => parseInt(pre.spaceId) - parseInt(next.spaceId))
          .map(it => {
            it.profileInfo = this.$storeHelper.getProfileInfoById(it.spaceId);
            return it;
          });
        // console.log(resData);

        const valueList = resData.map(it => it.values[0]);
        const timestamp = valueList[0][0];
        const sameTimeStamp = valueList.every(it => it[0] === timestamp);
        if (!sameTimeStamp) {
          console.log(`Error: data format is not ok! not sameTimeStamp`);
          return;
        }
        this.status[type].series = [{
          name: CONSTANT[type].chartOptions.title.text,
          data: valueList.map(it => dataFomatter[type] ? dataFomatter[type](it[1]): it[1])
        }];
        // set tickAmount by maxValue
        const maxValue = this.status[type].series[0].data.reduce((sum, it) => sum > it ? sum : it, 0);

        // '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'
        const colors = resData.map(it => this.style[`$env-${it.profileInfo.name}-color`]);
        this.status[type].chartOptions.colors = colors;
        this.status[type].chartOptions.xaxis.categories = resData.map(it => it.profileInfo.description);
        this.status[type].chartOptions.xaxis.labels.style.colors = colors;
        this.status[type].chartOptions.yaxis.tickAmount = maxValue <= 1 ? 1 : (maxValue <= 2 ? 2 : 3);

        this.status[type].ready = true;
        // 确保series发生改变才能触发重绘
        // this.status[type].series[0].data = valueList.map(it => dataFomatter[type] ? dataFomatter[type](it[1]): it[1]);
      },

      // 绘制使用率
      drawChartLine(profileListOfGroup) {
        if (this.drawChartLine.lastRequest && ((Date.now() - this.drawChartLine.lastRequest) < 2 * 1000)) {
          console.log(`ignore this request for status all`);
          return;
        }
        const self = this;
        const commonChartOptions = {
          title: {
            align: 'left',
            margin: 0,
            style: {
              fontSize: '12px'
            }
          },
          chart: {
            // height: 280,
            type: 'line',
            animations: {
              enabled: false
            },
            zoom: {
              enabled: true,
              type: 'x',
              autoScaleYaxis: false,
//              zoomedArea: {
//                fill: {
//                  color: '#90CAF9',
//                  opacity: 0.4
//                },
//                stroke: {
//                  color: '#0D47A1',
//                  opacity: 0.4,
//                  width: 1
//                }
//              }
            },
          },
          stroke: {
            width: 1,
            curve: 'smooth'
          },
          dataLabels: {
            enabled: false
          },
          markers: {
            size: 0,
            hover: {
              sizeOffset: 6
            }
          },
          xaxis: {
            type: 'datetime',
            tickAmount: 3,
            style: {
              fontSize: '12px'
            },
            labels: {
              rotate: -45,
              formatter(value, timestamp) {
                return self.$utils.formatDate(timestamp, 'MM-dd hh:mm:ss');
              }
            }
          },
          grid: {
            borderColor: '#f1f1f1',
          }
        };

        // update commonChartOptions for each chart
        ['general_ratio_cpu_usage', 'general_ratio_memory_usage'].forEach(key => {
          this.status[key].chartOptions = this.$utils.deepMerge(commonChartOptions, CONSTANT[key].chartOptions);
        });

        this.drawChartLine.lastRequest = Date.now();
        this._requestUseRatio('general_ratio_cpu_usage');
        this._requestUseRatio('general_ratio_memory_usage');
      },

      async _requestUseRatio(type) {
        if (!['general_ratio_cpu_usage', 'general_ratio_memory_usage'].includes(type)) {
          return;
        }
        const dataFormatter = {
          general_ratio_cpu_usage(val) {
            if (!val) {
              return val;
            } else {
              return (val * 100).toFixed(2)
            }
          },
          general_ratio_memory_usage(val) {
            if (!val) {
              return val;
            } else {
              return (val * 100).toFixed(2)
            }
          }
        };
        this.status[type].ready = false;
        /**
        3小时以内，取值区间：30s；
        3小时-12h，取值区间：2min;
        12h-24h,取值区间：3min；
        1天-3天，取值区间：12min;
        3天以上，取值区间：1h；
        */
        const startTime = this.query.dateRange[0].getTime();
        const endTime = this.query.dateRange[1].getTime();
        const timeRange = endTime - startTime;
        const ONE_MINUTE = 3600 * 60;
        const ONE_HOUR = ONE_MINUTE * 60;
        const ONE_DAY = ONE_HOUR * 24;
        var timeStep = ONE_MINUTE;
        if (timeRange > ONE_DAY * 3) {
          timeStep = ONE_HOUR;
        } else if (timeRange > ONE_DAY) {
          timeStep = ONE_MINUTE * 12;
        } else if (timeRange > ONE_HOUR * 12) {
          timeStep = ONE_MINUTE * 3;
        } else if (timeRange > ONE_HOUR * 3) {
          timeStep = ONE_MINUTE * 2;
        }
        const data = {
          groupId: this.$storeHelper.currentGroupId,
          startTime,
          endTime,
          step: timeStep,
        };
        // format of resData:
        // [{
        //   spaceId: 2, values: [{timestamp, ratio}, {timestamp, ratio}, ...]
        // }, ...]
        try {
          var resData = await this.$net.requestPaasServer(this.$net.URL_LIST[type], {
            data
          });
          // filter, sort, map resData
          const spaceIdListOfGroup = this.$storeHelper.profileListOfGroup.map(it => it.id);
          resData = resData.filter(it => spaceIdListOfGroup.includes(it.spaceId))
            .filter(it => it.values.length > 0) // ignore item without values
            .sort((pre, next) => parseInt(pre.spaceId) - parseInt(next.spaceId))
            .map(it => {
              it.profileInfo = this.$storeHelper.getProfileInfoById(it.spaceId);
              return it;
            });
          // console.log(resData);

          const timeStampList = Array.from(new Set(resData.reduce((sum, it) => {
            return sum.concat(it.values.map(it => it[0]))
          }, []))).sort((pre, next) => {
            return pre - next;
          });
          // console.log(timeStampList);
          // fix value according to timeStampList
          resData.forEach(it => {
            if (it.values.length == timeStampList.length) {
              return;
            } else {
              const values = it.values;
              const results = timeStampList.map(it => [it, null]);
              for (let i = 0, j = 0; i < results.length && j < values.length; i++) {
                const timeStamp = timeStampList[i];
                if (timeStamp == values[j][0]) {
                  results[i][1] = values[j][1];
                  j++;
                }
              }
              it.values = results;
            }
          });
          // console.log(JSON.stringify(resData));

          this.status[type].series = resData.map(it => {
            return {
              name: it.profileInfo.description,
              data: it.values.map(it => {
                return [it[0], dataFormatter[type] ? dataFormatter[type](it[1]) : it[1]];
              })
            }
          });
          //console.log(JSON.stringify(this.status[type].series));

          // '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'
          const colors = resData.map(it => this.style[`$env-${it.profileInfo.name}-color`]);
          this.status[type].chartOptions.colors = colors;
          // this.status[type].chartOptions.xaxis.categories = resData.map(it => it.profileInfo.description);
          // this.status[type].chartOptions.xaxis.labels.style.colors = colors;
        } catch (err) {
          console.log(err);
        } finally {
          this.status[type].ready = true;
        }
      },

      handleButtonClick(evt, action) {
        switch (action) {
          case 'refresh_request_statistic':
            if (!this.$storeHelper.profileListOfGroup) {
              return;
            }
            this.drawChartBar(this.$storeHelper.profileListOfGroup);
            break;
          case 'refresh_use_ratio':
            if (!this.$storeHelper.profileListOfGroup) {
              return;
            }
            this.drawChartLine(this.$storeHelper.profileListOfGroup);
            break;
        }
      }
    }
  }
</script>