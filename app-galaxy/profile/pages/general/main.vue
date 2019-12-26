<template>
  <div id="general">
    <div class="header">
      <el-button
              size="mini"
              :type="'primary'"
              :class="{'primary': true}"
              @click="handleButtonClick($event, 'refresh')">
        刷新
      </el-button>
    </div>
    <div class="statistic">
      <div class="section request">
        <div class="title">申请数统计</div>
        <div class="chart-list">
          <div class="chart">
            <!--<div class="title">{{status['general_instance_count'].title}}</div>-->
            <apxe-chart type=bar height=200 :options="status['general_instance_count'].chartOptions" :series="status['general_instance_count'].series" v-if="hasInitDefaultChartBarOptions"></apxe-chart>
          </div>
          <div class="chart">
            <!--<div class="title">{{status['general_cpu_count'].title}}</div>-->
            <apxe-chart type=bar height=200 :options="status['general_cpu_count'].chartOptions" :series="status['general_cpu_count'].series" v-if="hasInitDefaultChartBarOptions"></apxe-chart>
          </div>
          <div class="chart">
            <!--<div class="title">{{status['general_memory_size'].title}}</div>-->
            <apxe-chart type=bar height=200 :options="status['general_memory_size'].chartOptions" :series="status['general_memory_size'].series" v-if="hasInitDefaultChartBarOptions"></apxe-chart>
          </div>
        </div>
      </div>
      <div class="section ratio">
        <div class="title">使用率统计</div>
        <div class="chart-list">
          <div class="chart">
            <div class="title">{{status['general_instance_count'].title}}</div>
            <apxe-chart type=line height=300 :options="status['general_ratio_cpu_usage'].chartOptions" :series="status['general_ratio_cpu_usage'].series" v-if="hasInitDefaultChartBarOptions"></apxe-chart>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  #general {
    & > .statistic {
      .section {
        .chart-list {
          display: flex;
          flex-wrap: wrap;
          .chart {
            .title {
              font-size: 12px;
              /*font-weight: bold;*/
              text-align: center;
            }
          }
        }
        &.request {
          .chart {
            padding-right: 20px;
            max-width: 300px;
            /*background-color: white;*/
          }
        }
        &.ratio {
          .chart {
            width: 500px;
          }
        }
      }
    }
  }
</style>
<script>
  import apexCharts from 'vue-apexcharts';
  import commonUtils from 'assets/components/mixins/common-utils';

  // default values for status
  const CONSTANT = {
    general_instance_count: {
      chartOptions: {
        title: {
          text: '实例数',
          align: 'left',
          margin: 0,
          style: {
            fontSize: '12px'
          }
        },
        yaxis: {
          title: {
            text: '（单位：个）',
          },
          labels: {
            formatter: function(val, index) {
              return parseInt(val);
            }
          }
        }
      }
    },
    general_cpu_count: {
      chartOptions: {
        title: {
          text: '申请的CPU核数',
          align: 'left',
          margin: 0,
          style: {
            fontSize: '12px'
          }
        },
        yaxis: {
          title: {
            text: '（单位：个）',
          },
          labels: {
            formatter: function(val, index) {
              return parseInt(val);
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
          align: 'left',
          margin: 0,
          style: {
            fontSize: '12px'
          }
        },
        yaxis: {
          title: {
            text: '（单位：GB）',
          },
          labels: {
            formatter: function(val, index) {
              return `${parseInt(parseInt(val) / (1024  * 1024 * 1024))}GB`;
            }
          }
        }
      }
    },
    general_ratio_cpu_usage: {
      chartOptions: {
        title: {
          text: 'CPU使用率',
          align: 'left'
        },
        yaxis: {
          title: {
            text: '（单位：%）',
          },
          labels: {
            formatter: function(val, index) {
              return val;
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
        instanceCount: 0,
        cpuCount: 0,
        memorySize: 0,
        // all data related for chart drawing, including data(series), chart config(chartOptions), and others, such as title
        status: {
          general_instance_count: {
            title: '',
            timestamp: 0,
            series: [{
              name: '实例数',
              data: []
            }],
            chartOptions: {
            }
          },
          general_cpu_count: {
            title: '',
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
            title: '',
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
            series: [],
            chartOptions: {}
          }
        },
        // is the basic info for draw has done
        hasInitDefaultChartBarOptions: false,
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

      drawChartBar(profileListOfGroup) {
        if (this.drawChartBar.lastRequest && ((Date.now() - this.drawChartBar.lastRequest) < 2 * 1000)) {
          console.log(`ignore this request for status all`);
          return;
        }
        const commonChartOptions = {
          chart: {
            height: 200,
//            type: 'bar',
              events: {
              click: function (chart, w, e) {
                console.log(chart, w, e)
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
        // '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'
        const colors = profileListOfGroup.map(it => this.style[`$env-${it.name}-color`]);
        commonChartOptions.colors = colors;
        commonChartOptions.xaxis.categories = profileListOfGroup.map(it => it.description);
        commonChartOptions.xaxis.labels.style.colors = colors;
        this.hasInitDefaultChartBarOptions = true;

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
        // format of resData:
        // [{
        //   spaceId: 2, values: [{timestamp, count}]
        // }, ...]
        const resData = await this.$net.requestPaasServer(this.$net.URL_LIST[type], {
          data: {
            groupId: this.$storeHelper.currentGroupId,
          }
        });

        const spaceIdListOfGroup = this.$storeHelper.profileListOfGroup.map(it => it.id);
        // filter, sort, map resData
        const valueList = resData.filter(it => spaceIdListOfGroup.includes(it.spaceId))
          .sort((pre, next) => spaceIdListOfGroup.indexOf(parseInt(pre.spaceId)) > spaceIdListOfGroup.indexOf(parseInt(next.spaceId)))
          .map(it => it.values[0]);

        const timestamp = valueList[0][0];
        const sameTimeStamp = valueList.every(it => it[0] === timestamp);
        if (!sameTimeStamp) {
          console.log(`Error: data format is not ok! not sameTimeStamp`);
          return;
        }
        this.status[type].title = `${CONSTANT[type].title}（${this.$utils.formatDate(timestamp, 'yyyy-MM-dd hh:mm:ss')}）`;
        this.status[type].series = [{
          name: CONSTANT[type].title,
          data: valueList.map(it => it[1])
        }];
        // 确保series发生改变才能触发重绘
        // this.status[type].series[0].data = valueList.map(it => it[1]);
      },

      drawChartLine(profileListOfGroup) {
        if (this.drawChartLine.lastRequest && ((Date.now() - this.drawChartLine.lastRequest) < 2 * 1000)) {
          console.log(`ignore this request for status all`);
          return;
        }
        const commonChartOptions = {
          chart: {
            height: 360,
            type: 'line',
            zoom: {
              enabled: true
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
            type: 'datetime'
          },
          grid: {
            borderColor: '#f1f1f1',
          }
        };
        // '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'
        const colors = profileListOfGroup.map(it => this.style[`$env-${it.name}-color`]);
        commonChartOptions.colors = colors;
//        commonChartOptions.xaxis.categories = profileListOfGroup.map(it => it.description);
//        commonChartOptions.xaxis.labels.style.colors = colors;
//        this.hasInitDefaultChartBarOptions = true;

        // update commonChartOptions for each chart
        ['general_ratio_cpu_usage'].forEach(key => {
          this.status[key].chartOptions = this.$utils.deepMerge(commonChartOptions, CONSTANT[key].chartOptions);
        });

        this.drawChartLine.lastRequest = Date.now();
        this._requestUseRatio('general_ratio_cpu_usage');
//        this._requestUseRatio('general_ratio_memory_usage');
      },

      async _requestUseRatio(type) {
        if (!['general_ratio_cpu_usage'].includes(type)) {
          return;
        }
        const data = {
          groupId: this.$storeHelper.currentGroupId,
          startTime: 1577167195773,
          endTime: 1577177195773,
//            spaceList: [1,2]
        };
//        const data = {
//          groupId: 246, endTime: 1576228265800, startTime: 1576206665800
//        };
        const resData = await this.$net.requestPaasServer(this.$net.URL_LIST[type], {
          data
        });

        // data check and fix
//        const timestampList = Array.from(new Set(resData.reduce((sum, it) => {
//          if (Array.isArray(it.values)) {
//            return sum.concat(it.values.map(it2 => it2[0]))
//          } else {
//            return sum;
//          }
//        }, []))).sort((pre, next) => pre - next);
//        this.status[type].chartOptions.xaxis.categories = timestampList;

        this.status[type].series = resData.map(it => {
//          if (!Array.isArray(it.values)) {
//            it.values = timestampList.map(it2 => [it2, 0])
//          }
//          timestampList.forEach((it2, index) => {
//            if (!it.values[index]) {
//              it.values[index] = [it2, 0];
//            }
//          });
          return {
            name: it.spaceId,
            data: it.values.map(it => {
              return [it[0], (it[1] * 100).toFixed(4)];
            })
          }
        });
//        console.log('timestampList');
//        console.log(timestampList);
//        return;


//        console.log(resData);
//        console.log(timestampList);
        console.log(this.status[type]);
      },

      handleButtonClick(evt, action) {
        switch (action) {
          case 'refresh':
            if (!this.$storeHelper.profileListOfGroup) {
              return;
            }
            this.onProfileListOfGroup(this.$storeHelper.profileListOfGroup);
            break;
        }
      }
    }
  }
</script>