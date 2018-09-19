<template>
  <div id="k8s">
    <div class="header">
      <el-button type="primary"
           :loading="statusOfWaitingResponse('add') && selected.row.id === scope.row.id"
           @click="handleRowButtonClick('add')">设置k8s事件报警
      </el-button>
    </div>
    <div class="warning-list">
      <el-table
              :data="warningList"
              style="width: 100%"
              stripe
      >
        <el-table-column prop="appName" label="应用名称" minWidth="150"></el-table-column>
        <el-table-column label="运行环境" width="100">
          <template slot-scope="scope">
            生产环境
          </template>
        </el-table-column>
        <el-table-column prop="eventDesc" label="事件类型" minWidth="150"></el-table-column>
        <el-table-column prop="jobDesc" label="报警接收者" minWidth="120"></el-table-column>
        <el-table-column prop="alertTimeDesc" label="报警时间段" width="150"></el-table-column>
        <el-table-column prop="intervalDesc" label="报警频率" width="80"></el-table-column>
        <el-table-column prop="appName" label="操作" minWidth="150">
          <template slot-scope="scope">
            <el-button
                    type="text" class="warning"
                    @click="handleRowButtonClick('modify', scope.$index, scope.row)">
              修改
            </el-button>
            <div class="ant-divider"></div>
            <el-button type="text"
                       :loading="statusOfWaitingResponse('remove') && selected.row.id === scope.row.id"
                       @click="handleRowButtonClick('remove', scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="action.name == 'modify'?'修改k8s事件报警':'添加k8s事件报警'"
               :visible="action.name == 'add' || action.name == 'modify'"
               :close-on-click-modal="false"
               class="modify-warning size-900"
               @close="handleCloseDialog('modify')"
               v-if="action.name"
    >
      <div>modify</div>
    </el-dialog>
  </div>
</template>

<style lang="scss">

</style>

<script>
  import {mapGetters} from 'vuex';
  import commonUtils from 'assets/components/mixins/common-utils';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';

  export default {
    mixins: [commonUtils],
    created() {},
    async mounted() {
      this.EVENT_TYPE_LIST = await this.$store.dispatch('k8s/setEventTypeList');
      // 报警事件列表
      this.warningList = await this.requestWarningList();
    },
    data() {
      return {
        warningList: [],
        INTERVAL_TYPE_LIST: [{
          type: 'EVERY_DAY',
          desc: '每天'
        }, {
          type: 'WORK_DAY',
          desc: '工作日'
        }],
        ccUserList: [{
          mail: 'paas.list@finupgroup.com',
          desc: 'PaaS团队邮件组'
        }],
        EVENT_TYPE_LIST: [],

        action: {
          name: '',
          row: null
        },
        statusForModifyWarning: {
          groupList: [],
          appList: [],
          groupName: '',
          groupId: '',
          appName: '',
          appId: '',
          eventList: [],
          eventSelected: [],
          receiverList: this.$storeHelper.JOB_LIST,
          ccUserList: this.ccUserList,
          intervalDayList: this.INTERVAL_TYPE_LIST,
          intervalTimeList: [5, 10, 15,30],
          receiverSelected: [],
          ccUserSelected: [],
          intervalDaySelected: '',
          intervalTimeSelected: 15
        }
      }
    },
    computed: {
      ...mapGetters({
        'visitPageCount': 'visitPageCount'
      }),
    },
    methods: {
      handleCloseDialog(action) {
        this.action.name = null;
        this.hideWaitingResponse(action);
      },
      async requestWarningList() {
        const warningList = await this.$net.requestPaasServer(this.$net.URL_LIST.k8s_warning_list, {
          payload: {
            start: 0,
            length: 10
          }
        });

        const eventTypeMap = {};
        this.EVENT_TYPE_LIST.forEach(it => {
          eventTypeMap[it['eventType']] = it['eventDescription'];
        });
        const intervalTypeMap = {};
        this.INTERVAL_TYPE_LIST.forEach(it => {
          intervalTypeMap[it['type']] = it['desc'];
        });
        const jobTypeMap = {};
        this.$storeHelper.JOB_LIST.forEach(it => {
          jobTypeMap[it['name']] = it['description'];
        });
        warningList.forEach(it => {
          it.eventDesc = it['eventList'].map(it => {
            if (eventTypeMap.hasOwnProperty(it)) {
              return eventTypeMap[it];
            } else {
              return ''
            }
          }).join('，');
          it.jobDesc = it['jobTypeList'].map(it => {
            if (jobTypeMap.hasOwnProperty(it)) {
              return jobTypeMap[it];
            } else {
              return ''
            }
          }).join('，');
          it.alertTimeDesc = `${intervalTypeMap[it['alertTime']]} ${it.period}`;
          it.intervalDesc = `${it.interval}一次`
        });

        console.log(this.EVENT_TYPE_LIST);
        console.log(warningList);
        return warningList;
      },

      async getStatusForModifyWarning(action, row) {
//      this.$store.dispatch('setConfig', {
//        visitPageCount: this.visitPageCount + 1
//      });
        const status = this.statusForModifyWarning;
        status.eventList = this.EVENT_TYPE_LIST;
        switch (action) {
          case 'add':
            status.groupList = (await this.$net.requestPaasServer(this.$net.URL_LIST.user_group_list))['groupList'];
            // get default groupId
            const groupInfo = this.$storeHelper.globalUserGroupInfo;
            status.groupId = groupInfo['id'];
            if (status.groupList.map(it => {
              return it['id']
            }).indexOf(groupInfo['id']) == -1) {
              status.groupId = status.groupList[0]['id'];
            }
            status.appList = (await this.$net.requestPaasServer(this.$net.URL_LIST.app_list, {
              payload: {
                groupId: status.groupId
              }
            }))['appList'];
            if (status.appList.length > 0) {
              status.appId = status.appList[0]['appId'];
            } else {
              status.appId = '';
            }

            status.eventSelected = status.eventList.filter(it => {
              return it['defaultSelect'];
            }).map(it => {
              return it['eventType'];
            });

            status['receiverSelected'] = [];
            status['ccUserSelected'] = status.ccUserList[0]['mail'];
            status['receiverSelected'] = ['TECH_LEADER'];
            status.ccUserSelected = [];
            status.intervalDaySelected = 'EVERY_DAY';
            status['intervalTimeSelected'] = 15;

//            console.log(status.groupList);
//            console.log(status.appList);
//            console.log(groupInfo);
            break;
          case 'modify':
            break;
        }
      },

      handleRowButtonClick(action, index, row) {
        switch (action) {
          case 'add':
            this.getStatusForModifyWarning(action).then(() => {
              this.action.name = action;
            });
            break;
          case 'modify':
            this.action.row = row;
            this.getStatusForModifyWarning(action).then(() => {
              this.action.name = action;
            });
            break;
          case 'remove':
            break;
        }
      }
    }
  }
</script>