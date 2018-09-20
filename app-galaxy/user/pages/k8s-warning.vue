<template>
  <div id="k8s">
    <div class="header">
      <el-button type="primary" size="mini"
           :loading="statusOfWaitingResponse('add')"
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
            <el-button type="text" class="danger"
                       :loading="statusOfWaitingResponse('remove') && action.row.id === scope.row.id"
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
               @close="handleCloseDialog(action.name)"
               v-if="action.name"
    >
      <el-form labelWidth="120px" :model="statusForModifyWarning" :rules="rulesForAddWarning"
               size="mini" ref="formModifyWarningInDialog">
        <el-form-item prop="groupId" label="团队" v-if="action.name == 'add'">
          <el-select v-model="statusForModifyWarning.groupId" placeholder="请选择" style="width: 300px;" filterable>
            <el-option v-for="item in statusForModifyWarning.groupList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="appId" label="应用" v-if="action.name == 'add'">
          <el-select v-model="statusForModifyWarning.appId" placeholder="请选择" style="width: 300px;" filterable>
            <el-option v-for="item in statusForModifyWarning.appList" :key="item.appId" :label="item.appName" :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="运行环境">生产环境</el-form-item>
        <el-form-item label="事件类型" prop="eventSelected">
          <el-checkbox-group v-model="statusForModifyWarning.eventSelected" class="col-3">
            <el-checkbox v-for="item in statusForModifyWarning.eventList" :label="item.id" :key="item.id">
              {{item.eventDescription}}
          </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="报警邮件接收者" prop="eventSelected">
          <el-checkbox-group v-model="statusForModifyWarning.receiverSelected" class="col-3">
            <el-checkbox v-for="item in statusForModifyWarning.receiverList" :label="item.name" :key="item.name">
              {{item.description}}
          </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="报警邮件抄送给">
          <el-checkbox-group v-model="statusForModifyWarning.ccUserSelected">
            <el-checkbox v-for="item in statusForModifyWarning.ccUserList" :label="item.mail" :key="item.mail">
              {{item.desc}}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="报警时间段">
          <el-radio-group v-model="statusForModifyWarning.intervalDaySelected">
            <el-radio v-for="item in statusForModifyWarning.intervalDayList" :label="item.type" :key="item.type">
              {{item.desc}}
            </el-radio>
          </el-radio-group>
          <el-time-picker
                  style="margin-left: 10px;"
                  class="custom"
                  is-range
                  v-model="statusForModifyWarning.intervalPeriodSelected"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="报警频率" prop="intervalTimeSelected">
          <el-select v-model="statusForModifyWarning.intervalTimeSelected"
                     placeholder="请选择" filterable style="width: 60px">
            <el-option v-for="item in statusForModifyWarning.intervalTimeList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <span>分钟执行一次</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary"
                       @click="handleClickInDialog(action.name)"
                       :loading="statusOfWaitingResponse(action.name)">确&nbsp定</el-button>
          </div>
          <div class="item">
            <el-button @click="handleCloseDialog(action.name)">取&nbsp消</el-button>
          </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">

</style>

<script>
  import {mapGetters} from 'vuex';
  import commonUtils from 'assets/components/mixins/common-utils';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  import ElFormItem from "../../../element-ui/packages/form/src/form-item";

  export default {
    components: {ElFormItem}, mixins: [commonUtils],
    created() {},
    async mounted() {
      this.EVENT_TYPE_LIST = await this.$store.dispatch('k8s/setEventTypeList');
      // 报警事件列表
      this.warningList = await this.requestWarningList();
    },
    data() {
      return {
        warningList: [],
        INTERVAL_DAY_LIST: [{
          type: 'EVERY_DAY',
          desc: '每天'
        }, {
          type: 'WORK_DAY',
          desc: '工作日'
        }],
//        CC_USER_LIST: [{
//          mail: 'paas.list@finupgroup.com',
//          desc: 'PaaS团队邮件组'
//        }],
        EVENT_TYPE_LIST: [],

        action: {
          name: '',
          row: null
        },
        rulesForAddWarning: {
          groupId: [{
            required: true,
            message: '请选择团队',
          }, {
            validator(rule, values, callback) {
              let passed = true;
              if (!values) {
                passed = false;
              }
              if (passed) {
                callback();
              } else {
                callback('请选择团队');
              }
            }
          }],
          appId: [{
            required: true,
            message: '请选择应用',
          }, {
            validator(rule, values, callback) {
              let passed = true;
              if (!values) {
                passed = false;
              }
              if (passed) {
                callback();
              } else {
                callback('请选择应用');
              }
            }
          }],
          eventSelected: [{
            required: true,
            message: '至少选择一个事件类型',
          }, {
            validator(rule, values, callback) {
              let passed = true;
              if (!values) {
                passed = false;
              } else if (Array.isArray(values) && values.length === 0) {
                passed = false;
              }
              if (passed) {
                callback();
              } else {
                callback('至少选择一个事件类型')
              }
            }
          }],
          receiverSelected: [{
            required: true,
            message: '至少选择一个报警邮件抄送者',
            trigger: 'blur'
          }, {
            validator(rule, values, callback) {
              let passed = true;
              if (!values) {
                passed = false;
              } else if (Array.isArray(values) && values.length === 0) {
                passed = false;
              }
              if (passed) {
                callback();
              } else {
                callback('至少选择一个报警邮件抄送者')
              }
            }
          }],
          intervalDaySelected: [{
            required: true,
            message: '必须选择报警时间段',
          }],
          intervalTimeSelected: [{
            required: true,
            message: '请选择报警频率',
          }, {
            validator(rule, values, callback) {
              console.log(values);
              let passed = true;
              if (!values) {
                passed = false;
              }
              if (passed) {
                callback();
              } else {
                callback('请选择报警频率');
              }
            }
          }],
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
          ccUserList: [{
            mail: 'paas.list@finupgroup.com',
            desc: 'PaaS团队邮件组'
          }],
          intervalDayList: [],
          intervalTimeList: [5, 10, 15, 30],
          receiverSelected: [],
          ccUserSelected: [],
          intervalDaySelected: '',
          intervalPeriodSelected: [new Date(2016, 9, 10, 10, 0), new Date(2016, 9, 10, 18, 0)],
          intervalTimeSelected: 15
        }
      }
    },
    computed: {
      ...mapGetters({
        'visitPageCount': 'visitPageCount'
      }),
    },
    watch: {
      'statusForModifyWarning.groupId': function (groupId) {
        if (groupId) {
          this.updateAppList();
        }
      }
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
        const intervalDayMap = {};
        this.INTERVAL_DAY_LIST.forEach(it => {
          intervalDayMap[it['type']] = it['desc'];
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
          it.eventIdList = it['eventList'].map(it => {
            return eventTypeMap[it]['id'];
          });
          it.jobDesc = it['jobTypeList'].map(it => {
            if (jobTypeMap.hasOwnProperty(it)) {
              return jobTypeMap[it];
            } else {
              return ''
            }
          }).join('，');
          it.alertTimeDesc = `${intervalDayMap[it['alertTime']]} ${it.period}`;
          it.intervalDesc = `${it.interval}分钟一次`
        });

        console.log(this.EVENT_TYPE_LIST);
        console.log(warningList);
        return warningList;
      },

      // 更新app列表，设置默认appId
      async updateAppList() {
        const status = this.statusForModifyWarning;
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
      },

      async getStatusForModifyWarning(action, row) {
//      this.$store.dispatch('setConfig', {
//        visitPageCount: this.visitPageCount + 1
//      });
        const peroidToDate = (period) => {
          const start = period.split('-')[0];
          const end = period.split('-')[1];
          const periodStart = new Date();
          const periodEnd = new Date();
          periodStart.setHours(start.split(':')[0]);
          periodStart.setMinutes(start.split(':')[1]);
          periodStart.setSeconds(0);
          periodEnd.setHours(end.split(':')[0]);
          periodEnd.setMinutes(end.split(':')[1]);
          periodEnd.setSeconds(0);
          return [periodStart, periodEnd];
        };
        const status = this.statusForModifyWarning;
        status.eventList = this.EVENT_TYPE_LIST;
        status.intervalDayList = this.INTERVAL_DAY_LIST;
        const periodStart = new Date();
        const periodEnd = new Date();
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

            await this.updateAppList();

            status.eventSelected = status.eventList.filter(it => {
              return it['defaultSelect'];
            }).map(it => {
              return it['id'];
            });

            status['ccUserSelected'] = status.ccUserList[0]['mail'];
            status['receiverSelected'] = ['TECH_LEADER'];
            status.ccUserSelected = [];
            status.intervalDaySelected = 'EVERY_DAY';

            periodStart.setHours(10);
            periodStart.setMinutes(0);
            periodStart.setSeconds(0);
            periodEnd.setHours(18);
            periodEnd.setMinutes(0);
            periodEnd.setSeconds(0);
            status.intervalPeriodSelected = [periodStart, periodEnd],
            status['intervalTimeSelected'] = 15;
//            console.log(this.statusForModifyWarning);
//            console.log(status);
            break;
          case 'modify':
            status.groupName = row['groupName'];
            status.appName = row['appName'];
            status.eventSelected = [];
            status['receiverSelected'] = row['jobTypeList'];
            if (row['ccUser']) {
              status.ccUserSelected = [row['ccUser']];
            } else {
              status.ccUserSelected = [];
            }

//            const peroidStart = new Date();
//            peroidStart.setHours()
//            const peroidEnd = new Date();
            status.intervalDaySelected = row['alertTime'];
            status.intervalPeriodSelected = peroidToDate(row['period']);
            status.intervalTimeSelected = row['interval'];

            console.log(row);
            break;
        }
      },

      async handleRowButtonClick(action, index, row) {
        this.addToWaitingResponseQueue(action);
        switch (action) {
          case 'add':
            this.getStatusForModifyWarning(action).then(() => {
              this.action.name = action;
            }).finally(() => {
              this.hideWaitingResponse(action);
            });
            break;
          case 'modify':
            this.action.row = row;
            this.getStatusForModifyWarning(action, row).then(() => {
              this.hideWaitingResponse(action);
              this.action.name = action;
            }).finally(() => {
              this.hideWaitingResponse(action);
            });
            break;
          case 'remove':
            this.action.name = name;
            this.action.row = row;
            this.addToWaitingResponseQueue(action);
            await this.warningConfirm(`确定要删除针对应用${row.appName}的k8s时间报警吗？`);
            this.hideWaitingResponse(action);
            break;
        }
      },
      warningConfirm(content) {
        return new Promise((resolve, reject) => {
          this.$confirm(content, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            resolve();
          }).catch(() => {
            reject()
          });
        });
      },

      handleClickInDialog(action) {
        const status = this.statusForModifyWarning;
        console.log(status);
        switch (action) {
          case 'add':
            console.log(this.statusForModifyWarning);
//            {
//              "alertTime": "EVERY_DAY",
//              "applicationId": 0,
//              "ccUser": "string",
//              "emailReceive": [
//              "string"
//            ],
//              "eventTypeId": [
//              0
//            ],
//              "groupId": 0,
//              "interval": 0,
//              "period": "string"
//            }
            this.$refs['formModifyWarningInDialog'].validate(valid => {
              if (!valid) {
                return;
              }
              const payload = {
                groupId: status.groupId,
                applicationId: status.appId,
                eventTypeId: status.eventSelected,
                emailReceive: status.receiverSelected,
                ccUser: status.ccUserSelected.length > 0 ? status.ccUserSelected[0] : '',
                alertTime: status.intervalDaySelected,
                period: `${this.$utils.formatDate(status.intervalPeriodSelected[0], 'hh:mm')}-${this.$utils.formatDate(status.intervalPeriodSelected[1], 'hh:mm')}`,
                interval: status.intervalTimeSelected
              };
              console.log(payload);
              this.$net.requestPaasServer(this.$net.URL_LIST.k8s_warning_add, {
                payload
              }).then(resContent => {
                console.log(resContent);
              })


            });
            break;
          case 'modify':
            break;
        }
      }
    }
  }
</script>