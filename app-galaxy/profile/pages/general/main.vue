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
    <div class="status">
      <section class="request-statistic">
        <div class="chart">
          <div class="title">{{status['general_instance_count'].title}}</div>
          <apxe-chart type=bar height=200 :options="status['general_instance_count'].chartOptions" :series="status['general_instance_count'].series" v-if="chartBarCommon.ready"></apxe-chart>
        </div>
        <div class="chart">
          <div class="title">{{status['general_cpu_count'].title}}</div>
          <apxe-chart type=bar height=200 :options="status['general_cpu_count'].chartOptions" :series="status['general_cpu_count'].series" v-if="chartBarCommon.ready"></apxe-chart>
        </div>
        <div class="chart">
          <div class="title">{{status['general_memory_size'].title}}</div>
          <apxe-chart type=bar height=200 :options="status['general_memory_size'].chartOptions" :series="status['general_memory_size'].series" v-if="chartBarCommon.ready"></apxe-chart>
        </div>
      </section>
      <section class="ratio">

      </section>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  #general {
    .status {
      display: flex;
      flex-wrap: wrap;
      .chart {
        .title {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
        }
        display: inline-block;
        padding-right: 20px;
        width: 50%;
        max-width: 300px;
        /*background-color: white;*/
      }
    }
  }
</style>
<script>
  import apexCharts from 'vue-apexcharts';
  import commonUtils from 'assets/components/mixins/common-utils';

  const CONSTANT = {
    general_instance_count: {
      title: '实例数',
        chartOptions: {
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
      title: '申请的CPU核数',
        chartOptions: {
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
      title: '内存申请量',
        chartOptions: {
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
        status: {
          general_instance_count: {
            title: '',
            timestamp: 0,
            series: [{
              name: '实例数',
              data: []
            }],
            chartOptions: {}
          },
          general_cpu_count: {
            title: '',
            timestamp: 0,
            series: [{
              name: 'cpu核数',
              data: []
            }],
            chartOptions: {}
          },
          general_memory_size: {
            title: '',
            timestamp: 0,
            series: [{
              name: '内存大小',
              data: []
            }],
            chartOptions: {}
          },
        },
        chartBarCommon: {
          // custom property
          ready: false,
          chart: {
            height: 200,
            type: 'bar',
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
                fontWeight: 'bold'
              }
            }
          }
        },
      }
    },
    watch: {
      '$storeHelper.profileListOfGroup': 'onProfileListOfGroup',
    },
    methods: {
      onProfileListOfGroup(profileListOfGroup) {
        // console.log(profileListOfGroup);
        const chartBarCommon = this.chartBarCommon;
        // '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'
        const colors = profileListOfGroup.map(it => this.style[`$env-${it.name}-color`]);
        chartBarCommon.colors = colors;
        chartBarCommon.xaxis.categories = profileListOfGroup.map(it => it.description);
        chartBarCommon.xaxis.labels.style.colors = colors;
        chartBarCommon.ready = true;

        // update chartOptions for each chart
        ['general_instance_count', 'general_cpu_count', 'general_memory_size'].forEach(key => {
          this.status[key].chartOptions = this.$utils.deepMerge(this.chartBarCommon, CONSTANT[key].chartOptions);
        });
        // status request should after profileListOfGroup is get
        this.requestStatusAll();
      },
      requestStatusAll() {
        if (this.requestStatusAll.lastRequest && ((Date.now() - this.requestStatusAll.lastRequest) < 2 * 1000)) {
          console.log(`ignore this request for status all`);
          return;
        }
        this.requestStatusAll.lastRequest = Date.now();
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
        this.status[type].timestamp = timestamp;
        this.status[type].series = [{
          name: CONSTANT[type].title,
          data: valueList.map(it => it[1])
        }];
        // 确保series发生改变才能触发重绘
        // this.status[type].series[0].data = valueList.map(it => it[1]);
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