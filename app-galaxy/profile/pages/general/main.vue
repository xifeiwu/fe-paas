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
      <div class="chart">
        <apxe-chart type=bar height=350 :options="chartBarCommon" :series="status.general_instance_count.series" v-if="chartBarCommon.ready"></apxe-chart>
      </div>
      <div class="chart">
        <apxe-chart type=bar height=350 :options="chartBarCommon" :series="status.general_cpu_count.series" v-if="chartBarCommon.ready"></apxe-chart>
      </div>
      <div class="chart">
        <apxe-chart type=bar height=350 :options="chartBarCommon" :series="status.general_memory_size.series" v-if="chartBarCommon.ready"></apxe-chart>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  #general {
    .status {
      .chart {
        display: inline-block;
        background-color: white;
        width: 600px;
      }
    }
  }
</style>
<script>
  import apexCharts from 'vue-apexcharts';
  import commonUtils from 'assets/components/mixins/common-utils';

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
//        series: [{
////          data: [21, 22, 10, 28, 16, 21, 13, 30]
////          data: [21, 22, 10, 28, 16]
//          data: []
//        }],
        status: {
          general_instance_count: {
            timestamp: 0,
            series: [{
              name: '实例数',
              data: []
            }]
          },
          general_cpu_count: {
            timestamp: 0,
            series: [{
              name: 'cpu核数',
              data: []
            }]
          },
          general_memory_size: {
            timestamp: 0,
            series: [{
              name: '内存大小',
              data: []
            }]
          },
        },
        chartBarCommon: {
          // custom property
          ready: false,
          chart: {
            height: 320,
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
                fontSize: '14px'
              }
            }
          }
        },

//        chartOptions: {
//          chart: {
//            height: 320,
//            type: 'bar',
//            events: {
//              click: function (chart, w, e) {
//                console.log(chart, w, e)
//              }
//            },
//          },
//          colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'],
//          plotOptions: {
//            bar: {
//              columnWidth: '45%',
//              distributed: true
//            }
//          },
//          dataLabels: {
//            enabled: false,
//          },
//          xaxis: {
//            categories: ['John', 'Joe', 'Jake', 'Amber', 'Peter', 'Mary', 'David', 'Lily'],
//            labels: {
//              style: {
//                colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'],
//                fontSize: '14px'
//              }
//            }
//          }
//        }
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
        this.status[type].timestamp = timestamp;
        this.status[type].series[0].data = valueList.map(it => it[1]);
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