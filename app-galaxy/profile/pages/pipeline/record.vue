<template>
  <div id="record-main">
    <div class="header">
      <div class="item">
        <el-button size="mini" type="primary" style="margin-right: 5px;"
                   :class="['flex',publishStatus ? 'disabled' : '']"
                   :loading="statusOfWaitingResponse('pipeline_build_execute')"
                   @click="handleClick($event, 'pipeline_build_execute')">
          <span>执行</span>
          <i class="paas-icon-fa-play" style="margin-left: 3px;"></i>
        </el-button>
        <el-button size="mini" type="primary" style="margin-right: 5px;"
                   class="flex"
                   :loading="statusOfWaitingResponse('pipeline_confirm_build_param')"
                   @click="handleClick($event, 'pipeline_confirm_build_param')">
          <span>带参数执行</span>
          <i class="paas-icon-fa-play" style="margin-left: 3px;"></i>
        </el-button>
        <el-button size="mini" type="primary" style="margin-right: 5px;"
                   class="flex"
                   @click="handleClick($event, 'refresh-record-list')">
          <span>刷新</span>
          <i class="el-icon-refresh" style="margin-left: 3px;"></i>
        </el-button>
        <div style="display: inline-block; margin-left: 16px">
          <span style="font-weight: bold">应用名称：</span><span>{{dataPassed.appName}}</span>
        </div>
        <div style="display: inline-block; margin-left: 16px">
          <span style="font-weight: bold">Pipeline名称：</span><span>{{dataPassed.pipelineName}}</span>
        </div>
        <!--<el-button size="mini-extral" type="primary" style="margin-right: 5px">修改配置</el-button>-->
      </div>
    </div>
    <div class="record-list">
      <el-table
        style="width: 100%"
        stripe
        element-loading-text="加载中"
        :data="buildListAll">
        <el-table-column
          prop="statusName"
          label="状态"
          width="200"
          headerAlign="center"
          align="center">
          <template slot-scope="scope">
            <span :class="[{'success':scope.row.statusName == '成功','failure':scope.row.statusName == '失败',
            'building':scope.row.statusName == '构建中','suspension':scope.row.statusName == '中止'},`build-${scope.row.buildNumber}-status`]" id="statusName">{{scope.row.statusName}}</span>
            <!--{{scope.row.buildingStatus ? scope.row.buildingStatus : scope.row.statusName}}-->
          </template>
        </el-table-column>
        <el-table-column
                prop="buildNumber"
                label="运行"
                width="80"
                headerAlign="center"
                align="center">
        </el-table-column>
        <el-table-column
          prop="formattedExecutionTime"
          label="执行时间"
          width="200"
          headerAlign="center"
          align="center">
        </el-table-column>
        <el-table-column
          label="持续时间"
          width="160"
          headerAlign="center"
          align="center">
          <template slot-scope="scope">
            {{scope.row.formattedDuration ? scope.row.formattedDuration : '--'}}
          </template>
        </el-table-column>
        <el-table-column
          prop="message"
          label="消息"
          minWidth="100"
          headerAligin="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="operation"
          label="操作"
          headerAlign="center"
          minWidth="100"
          align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row['status'] === 'IN_PROGRESS'"
              type="text"
              :class="['flex', 'danger']"
              @click="handleTRClick($event, 'stop', scope.$index, scope.row)">
              <span>停止</span>
            </el-button>
            <div class="ant-divider" v-if="scope.row['status'] === 'IN_PROGRESS'"></div>

            <el-button v-if="scope.row['status'] !== 'IN_PROGRESS'"
              type="text"
              :class="['flex', publishStatus ? 'disabled' : 'primary']"
              :loading="statusOfWaitingResponse('pipeline_build_restart') && action.row.buildNumber == scope.row.buildNumber"
              @click="handleTRClick($event, 'pipeline_build_restart', scope.$index, scope.row)">
              <span>重启</span>
            </el-button>
            <div class="ant-divider" v-if="scope.row['status'] !== 'IN_PROGRESS'"></div>

            <el-button v-if="scope.row['status'] === 'IN_PROGRESS'"
                       type="text"
                       :class="['flex', 'primary']"
                       :loading="statusOfWaitingResponse('pipeline_building_log') && action.row.buildNumber == scope.row.buildNumber"
                       @click="handleTRClick($event, 'pipeline_building_log', scope.$index, scope.row)">
              <span>查看构建中日志</span>
            </el-button>
            <el-button v-else
              type="text"
              :class="['flex', 'primary']"
              :loading="statusOfWaitingResponse('pipeline_build_history_log') && action.row.buildNumber == scope.row.buildNumber"
              @click="handleTRClick($event, 'pipeline_build_history_log', scope.$index, scope.row)">
              <span>查看历史日志</span>
            </el-button>
            <div class="ant-divider" v-if="scope.row['status'] !== 'IN_PROGRESS'"></div>

            <el-button
              type="text"
              :class="['flex', 'primary']"
              @click="handleTRClick($event, 'pipeline_build_plan', scope.$index, scope.row)">
              <span>查看执行进度</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <paas-dialog-for-log :showStatus="buildLogStatus" ref="dialogForBuildLog" @close="handleDialogClose">
      <div slot="content">
        <div v-for="(item, index) in buildLogStatus.logList" :key="index" class="log-item" v-html="item"></div>
        <div class="log-item loading-line" v-if="buildLogStatus.loading"><i class="el-icon-loading item"></i></div>
        <div class="last-item loading-line" v-else><span class="item"> </span></div>
      </div>
    </paas-dialog-for-log>
    <paas-popover-element-with-modal-mask ref="popover-for-user-confirm" popperClass="el-popover--small is-dark" title="等待用户确认"
                                          placement="bottom" :closeOnLeave="false">
      <div slot="content" style="font-size: 14px;">
        <div v-if="userInputInfo">{{userInputInfo.message}}</div>
        <div v-else>继续吗？</div>
        <div style="display: flex; justify-content: space-around; margin-top: 8px;">
          <el-button type="primary" size="mini-extral" :loading="userInputInfo && userInputInfo.action == 'go-on'"
                     @click="handleUserInput('go-on')">确定</el-button>
          <el-button type="danger" size="mini-extral" :loading="userInputInfo && userInputInfo.action == 'cancel'"
                     @click="handleUserInput('cancel')">取消</el-button>
        </div>
      </div>
    </paas-popover-element-with-modal-mask>
  
    <el-dialog title="带参数执行" :visible="action.name == 'dialogAddParamForPipeline'"
               :close-on-click-modal="false"
               class="image size-700"
               @close="action.name = null"
               v-if="action.name"
    >
      <el-tag type="success" disable-transitions style="display: block; text-align: left" size="small">
        <i class="el-icon-warning"></i>
        <span>需要如下参数用于执行pipeline:</span>
      </el-tag>
      <el-form size="mini" :rules="rules"
               labelWidth="150px" style="margin: 10px 0px 5px 0px;" ref="formInDialogAddParamForPipeline">
        <el-form-item v-for="(item, index) in buildParams"
                      :label="item.name"
                      :key="item.name"
                      style="margin-bottom: 5px;">
          <el-row :gutter="10" style="margin-bottom: 5px;">
            <el-col :span="20">
              <el-input size="mini-extral" v-model="item.defaultValue"></el-input>
            </el-col>
            <el-col :span="4" style="text-align: center">
            </el-col>
          </el-row>
          
          <el-row :gutter="10">
            <el-col :span="24">
              <div>
                <span class="el-tag--small">
                  <i class="el-icon-info"></i>
                  <span>{{item.description}}</span>
                </span>
              </div>
            </el-col>
          </el-row>
          
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleTRClick($event, 'pipeline_build_execute_with_param')"
                     :loading="statusOfWaitingResponse('pipeline_build_execute_with_param')">构&nbsp建</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="action.name = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  #record-main {
    .header {
    }
    .record-list {
      .el-table {
        .el-table__row {
          #statusName {
            &.success {
              color: #8cc04f;
            }
            &.failure {
              color: #d54c53;
            }
            &.building {
              color: #409EFF;
            }
            &.suspension {
              color: #949393;
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #record-main {
    background-color: white;
    height: 100%;
    max-width: 1500px;
    & > .header {
      padding: 3px 5px;
      font-size: 14px;
      .item {
        display: inline-block;
        margin-right: 5px;
      }
      .el-select {
        width: 180px;
      }
    }
    
    .el-dialog {
      .el-form {
        .el-form-item {
          .el-form-item__label {
            text-align: left;
          }
        }
      }
    }
  }
</style>

<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  import paasDialogForLog from 'assets/components/dialog4log.vue';
  import paasPopoverElementWithModalMask from 'assets/components/popover-element-with-modal-mask';

  const MS_BEFORE_GET_RECORD_LIST = 5000;
  const MAX_MS_WAITING_FOR_RECORD_LIST = 10000;
  export default {
    components: {paasDialogForLog, paasPopoverElementWithModalMask},
    mixins: [commonUtils],
    created() {
      var dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer['from'];
        const data = dataTransfer['data'];
        this.relatedAppId = data['appId'];
        this.dataPassed.appName = data['appName'];
        this.dataPassed.pipelineName = data['pipelineName'];
        this.$storeHelper.dataTransfer = null;
      } else {
        this.$router.push(this.$net.page['profile/pipeline/list']);
        return;
      }
	    this.buildParams = [];
    },
    async mounted() {
      try {
        this.$nextTick(() => {
          this.popperForUserConfirm = this.$refs['popover-for-user-confirm'];
        });
        await this.requestBuildingStatus();
      } catch(err) {
        console.log(err);
      }
    },
    beforeDestroy() {
      this.leavePage = true;
      this.buildLogStatus.visible = false;
      this.buildLogStatus.loading = false;
      this.buildLogStatus.title = '';
    },
    data() {
      return {
        heartBeatCount: 0,
        lastBuildRecord: null,
        lastBuildingRecord: null,
        // 需要用户确认的基本信息
        userInputInfo: null,
        leavePage: false,
        heartBeatStatus: {},
        dataPassed: {
          appName: '',
          pipelineName: ''
        },

        relatedAppId: null,
        buildListAll: [],
        buildList: [],
        buildingList: [],
        buildParams: [],
	      buildParam: '',
	      paramKey: '',
	      paramValue: '',
	      paramRemark: '',
        pipeline: null,
        statusMap: {
          SUCCESS: '成功',
          FAILURE: '失败',
          FAILED: '失败',
          ABORTED: '中止',
          CANCELLED: '已取消',
          BUILDING: '构建中',
          REBUILDING: '重建中',
          NOT_BUILD: '未构建',
          UNSTABLE: '不稳定',
          UNKNOWN: '构建中',
          IN_PROGRESS: '构建中',
          PAUSED_PENDING_INPUT: '等待手动确认'
        },

        action: {
          row: null,
          name: null
        },
	      rules: {
		      appId: {
			      type: 'number',
			      required: true,
			      message: '请选添加构建参数',
			      trigger: ['blur', 'change']
		      },
	      },
        buildLogStatus: {
          title: '日志',
          visible: false,
          loading: false,
          logList: []
        }
      }
    },
    computed: {
      publishStatus() {
        return this.$store.getters['publishStatus'];
      }
    },
    watch: {
    },
    methods: {
    	// 获取参数化构建的参数
	    async getBuildParams() {
		    const pipelineInfoFromNet = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_stage_query, {
			    query: {
				    appId: this.relatedAppId
			    }
		    });
		    
		    this.buildParams = pipelineInfoFromNet['defList'];
		    if (this.buildParams && this.buildParams.length > 0) {
		    	return true;
        } else {
			    return false;
        }
      },
      
      // merge status of buildList and buildingList
      mergeBuildList(buildList, buildingList) {
//        {
//          buildNumber: "92"
//          duration: 76675
//          executionTime: 1545374195910
//          message: null
//          status: "FAILURE"
//        }
//        {
//          buildNumber: "92"
//          durationMillis: "76675"
//          endTimeMillis: "1545374272616"
//          listStage: null
//          startTimeMillis: "1545374195941"
//          status: "FAILED"
//        }
        const transfer = (o) => {
          var result = {
            buildNumber: o['buildNumber'],
            // do not sync duration by buildingList
            // duration: parseInt(o['durationMillis']),
            durationMillis: parseInt(o['durationMillis']),
            executionTime: parseInt(o['startTimeMillis']),
//            message: null,
            status: o['status'],
            tag: o['tag'],
            stages: o['stages'],
          };
          if (result.tag && result.tag === 'building' && Array.isArray(result.stages) && result.stages.length > 0) {
            result['buildingStatus'] = `构建中/${result['stages'][result['stages'].length - 1]['name']}`;
          }
          return result;
        };
        const buildMap = {}, buildingMap = {};
        buildList.forEach(it => {
          buildMap[it['buildNumber']] = it;
        });
        buildingList.forEach(it => {
          buildingMap[it['buildNumber']] = transfer(it);
        });
        const keys = Array.from(new Set(
          buildList.map(it => it['buildNumber']).concat(buildingList.map(it => it['buildNumber']))
        )).sort((pre, next) => {
          return (pre - next) * -1;
        });
        var result = keys.map(key => {
          // 首次获得构建中列表时，更新构建列表时间
          try {
            if (buildMap.hasOwnProperty(key) && buildingMap.hasOwnProperty(key) && buildMap[key]['duration'] === 0) {
              buildMap[key]['duration'] = parseInt(buildingMap[key]['durationMillis']);
            }
          } catch(err) {
            console.log(err);
          }
          return Object.assign(buildMap.hasOwnProperty(key) ? buildMap[key] : {}, buildingMap.hasOwnProperty(key) ? buildingMap[key] : {});
        });
        this.formatBuildList(result);
//        console.log(result);
        return result;
      },

      formatBuildList(dataList) {
        dataList.forEach(it => {
          it["formattedExecutionTime"] = this.$utils.formatDate(new Date(it["executionTime"]), "yyyy-MM-dd hh:mm:ss");
          it['formattedDuration'] = this.$utils.formatSeconds(it['duration']);
          it["statusName"] = this.statusMap[it['status']];
          if(!it["message"]) {
            it["message"] = "---"
          }
        });
      },

      /** 获取构建列表requestBuildList
       *
       * 更新全局变量:lastBuildRecord, lastBuildingRecord
       * @returns {Promise.<*|Array>}
       */
      async requestBuildList() {
        if (!this.relatedAppId) {
          return;
        }
        this.buildList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_build_list, {
          params: {
            appId: this.relatedAppId
          }
        });
        this.buildList = resContent;

        // 如果status == 'UNKNOWN'，说明该record正在构建中，需要通过requestBuildingList获取详细构建信息
        var lastBuildRecord = null;
        this.lastBuildingRecord = null;
        if (this.buildList.length > 0) {
          lastBuildRecord = this.buildList[0];
        }
        this.buildList.forEach(it => {
          if (('UNKNOWN' === it['status'])) {
            this.lastBuildingRecord = it;
            lastBuildRecord = it;
          }
        });
        this.lastBuildRecord = lastBuildRecord;

//        this.formatBuildList();
        return this.buildList;
      },

      /**
       * TODO: 目前只能有一个pipeline处于构建状态（当这个假定改变时，lastBuildingRecord需要重新考虑）。
       */
      async requestBuildingList() {
        if (!this.relatedAppId) {
          return;
        }
        this.lastBuildingRecord = null;
        this.buildingList = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_in_building, {
          params: {
            appId: this.relatedAppId
          },
          query: {
            buildNumber: this.lastBuildRecord['buildNumber']
          }
        });
        this.buildingList.forEach(it => {
          if (['NOT_EXECUTED', 'IN_PROGRESS', 'PAUSED_PENDING_INPUT'].indexOf(it.status) > -1) {
            this.lastBuildingRecord = it;
            it.tag = 'building';
          } else {
            it.tag = 'has-build';
          }
        });
        return this.buildingList;
      },

      // 轮询更新构建列表，目前没有使用
      async loopRequestBuildingList() {
        const theSameRecord = (one, two) => {
          var theSame = true;
          ['buildNumber', 'status'].forEach(key => {
            theSame = theSame & (one[key] == two[key])
          });
          return theSame;
        };
//        console.log(this.lastBuildRecord);
        var needUpdateBuildList = false;
        if (null === this.lastBuildRecord) {
          needUpdateBuildList = true;
        } else if (this.buildingList && this.buildingList.length > 0 && this.buildingList.every(it => {
            return it.tag === 'has-build';
          })) {
          needUpdateBuildList = true;
          if ((this.lastBuildRecord['status'] !== 'UNKNOWN') && (this.buildingList[0]['buildNumber'] == this.lastBuildRecord['buildNumber'])) {
            needUpdateBuildList = false;
          }
        }

        if (needUpdateBuildList) {
          await this.requestBuildList();
        }
        await this.requestBuildingList();
        this.buildListAll = this.mergeBuildList(this.buildList, this.buildingList);
//        console.log(this.buildListAll);
      },

      /**
       * 请求buildList和buildingList，直到buildingList的状态不再更新
       * 被调用的地方：页面mounted；刷新；执行
       */
      async requestBuildingStatus() {
        // 先请求一次，看是否有正在构建中的记录
        await this.requestBuildList();
        this.buildListAll = this.mergeBuildList(this.buildList, []);
        // 如果有正在构建中的记录，则：
        // loopUntilBuildingFinish（不断轮询直到构建结束）；
        // usedTimeUpdateForBuildingRecord（更新构建中记录列表中，每个构建记录的执行时间）
        if (this.lastBuildingRecord) {
          var usedTimeUpdateForBuildingRecord = async () => {
            // 查询是否需要用户确认
            var confirmStatus = await this.updatePopperForUserConfirm();
            if (!Array.isArray(this.buildListAll)) {
              return;
            }
            var changed = false;
            // console.log(this.buildListAll);
            this.buildListAll.forEach((it, index) => {
              if (it.tag === 'building') {
                changed = true;
                it['duration'] += 1000;
                it['formattedDuration'] = this.$utils.formatSeconds(it['duration']);
              }
            });
            if (changed) {
              this.buildListAll = this.buildListAll.concat([]);
            }
            return confirmStatus;
          };
          // clear all heartBeat
          for(let key in this.heartBeatStatus) {
            this.heartBeatStatus[key] = false;
          }
          const timeStamp = Date.now();
          this.heartBeatStatus[timeStamp] = true;
          usedTimeUpdateForBuildingRecord = usedTimeUpdateForBuildingRecord.bind(this);
          const loopUntilBuildingFinish = this.loopUntilBuildingFinish.bind(this);
          loopUntilBuildingFinish.interval = 2;
          await this.startHeartBeat(1000, [usedTimeUpdateForBuildingRecord, loopUntilBuildingFinish], timeStamp);
          // request again
          await this.requestBuildList();
          this.buildListAll = this.mergeBuildList(this.buildList, []);
        }
      },

      // 获取等待用户确认的基本信息
      getUserInputInfo(record) {
        var result = null;
        if (!record) {
          return result;
        }
        if (record.status !== 'PAUSED_PENDING_INPUT') {
          return result;
        }
        const userInputInfo = record['ciPipelineInputVO'];
        if (!userInputInfo) {
          return result;
        }
        if (userInputInfo.hasOwnProperty('proceedUrl') &&  userInputInfo.hasOwnProperty('abortUrl')) {
          result = userInputInfo;
        }
        return result;
      },
      async handleUserInput(action) {
        const userInputInfo = this.userInputInfo;
        if (!userInputInfo) {
          return;
        }
        // 短时间内两次点击会触发后台错误，避免短时双击
        if (['go-on', 'cancel'].indexOf(userInputInfo.action) > -1) {
          return;
        }
        userInputInfo.action = action;
        switch (action) {
          case 'go-on':
            await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_user_input_check, {
              query: {
                inputUrl: userInputInfo['proceedUrl']
              }
            });
            break;
          case 'cancel':
            await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_user_input_check, {
              query: {
                inputUrl: userInputInfo['abortUrl']
              }
            });
            break;
        }
      },

      async updatePopperForUserConfirm() {
        const lastBuildingRecord = this.lastBuildingRecord;
        if (lastBuildingRecord && (lastBuildingRecord.status === 'PAUSED_PENDING_INPUT')) {
          const userInputInfo = this.getUserInputInfo(this.lastBuildingRecord);
          this.userInputInfo = userInputInfo;

          var targetClass = `build-${lastBuildingRecord.buildNumber}-status`;
          var target = this.$el.querySelector(`.record-list .el-table .${targetClass}`);
          if (this.buildLogStatus.visible) {
            if (this.$refs.hasOwnProperty('dialogForBuildLog')) {
              const dialogForDeployLog = this.$refs['dialogForBuildLog'];
              dialogForDeployLog.isScrolledBottom && dialogForDeployLog.scrollToBottom();
              target = dialogForDeployLog.$el.querySelector('.loading-line .item');
            }
          }
          if (!this.popperForUserConfirm.isShowing()) {
            this.popperForUserConfirm.show({
              ref: target
            });
          }
//          console.log(targetClass);
//          console.log(target);
        } else {
          this.popperForUserConfirm.doClose();
          return 'can-quite';
        }
      },

      async loopUntilBuildingFinish() {
        if (this.lastBuildingRecord) {
          // if (this.buildLogStatus.visible) {
            // 构建日志页面打开时，暂不更新构建列表状态
          // } else {
            await this.requestBuildingList();
            this.buildListAll = this.mergeBuildList(this.buildList, this.buildingList);
          // }
        } else {
          return 'can-quite';
        }
      },

      /**
       * 启动心跳
       * @param, milliSeconds, 心跳时间间隔
       * @param, funcList, 被执行的方法，需是async方法
       */
      async startHeartBeat(milliSeconds, funcList, id) {
        if (this.leavePage || !this.heartBeatStatus[id]) {
          return;
        }
        try {
          this.heartBeatCount++;
          var status = await Promise.all(funcList.map(it => {
            var result = it;
            if (it.hasOwnProperty('interval')) {
              if ((this.heartBeatCount % it.interval) !== 0) {
                result = async () => {};
              }
            }
            return result;
          }).map(it => {
            return it();
          }));
//          console.log(status);
          const canQuite = status.every(it => {
            return it === 'can-quite';
          });
          if (canQuite) {
            return;
          }
          await new Promise((resolve) => {
            setTimeout(resolve, milliSeconds);
          });
          await this.startHeartBeat(milliSeconds, funcList, id);
        } catch(err) {
          console.log(err);
          // ensure startHeartBeat go-on when any error is thrown
          await new Promise((resolve) => {
            setTimeout(resolve, milliSeconds);
          });
          await this.startHeartBeat(milliSeconds, funcList, id);
        }
      },

      /**
       *
       * @param action: 执行或重新执行
       * @returns {Promise.<void>}
       */
      // 执行pipeline并刷新构建列表状态
      async executePipeLine(action, payload) {
        try {
        	if (payload) {
		        await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_record_restart, {
			        params: {
				        appId: this.relatedAppId
			        },
              query: {
			          groupId: this.$storeHelper.currentGroupID
              },
			        payload
		        });
		        // 带参数执行后马上关闭页面
		        this.action.name = null;
          } else {
		        await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_record_restart, {
			        params: {
				        appId: this.relatedAppId
			        },
              query: {
                groupId: this.$storeHelper.currentGroupID
              }
		        });
          }

          // add loading status
          this.addToWaitingResponseQueue(action);
          this.$net.addToRequestingRrlList(action);
          // requestBuildList until build list is fresh
          var now = new Date().getTime();
          const until = now + MAX_MS_WAITING_FOR_RECORD_LIST;
          do {
            now = new Date().getTime();
            await new Promise((resolve) => {
              setTimeout(resolve, 2000);
            });
            this.requestBuildList();
          } while((now < until) && (this.lastBuildingRecord === null));

          // hide loading status
          this.hideWaitingResponse(action);
          this.$net.removeFromRequestingRrlList(action);
          // requestBuildingStatus
          this.requestBuildingStatus();

          // NOTICE: 某些构建直接进入FAILURE状态，不会被赋值给lastBuildingRecord
          await this.showBuildingLog(this.lastBuildingRecord ? this.lastBuildingRecord : this.lastBuildRecord);
        } catch(err) {
          console.log(err);
          this.hideWaitingResponse(action);
          this.$net.removeFromRequestingRrlList(action);
        }
      },

      /**
       * 展示正在构建中的日志
       * @param lastBuildingRecord, 值用到了buildNumber属性
       * @returns {Promise.<void>}
       */
      async showBuildingLog(lastBuildingRecord) {
        if (!lastBuildingRecord) {
          console.log(`lastBuildingRecord not found`);
          return;
        }
        this.buildLogStatus.visible = true;
        this.buildLogStatus.loading = true;
        this.buildLogStatus.title = `${this.dataPassed.pipelineName}-第${lastBuildingRecord['buildNumber']}次的构建日志`;

        var hasMoreData = true;
        var logQueue = [];
        var nextItem = null;
        const MAX_LINES_COUNT = 5000;
        const tagUpdateLog = setInterval(() => {
          if (!hasMoreData && logQueue.length === 0) {
            clearInterval(tagUpdateLog);
            return;
          }
          nextItem = logQueue.shift();
          if (!nextItem) {
            return;
          }
          this.buildLogStatus.logList.push(nextItem);
          while (this.buildLogStatus.logList.length > MAX_LINES_COUNT) {
            this.buildLogStatus.logList = this.buildLogStatus.logList.slice(MAX_LINES_COUNT - 1000);
          }

          // scroll after render finish
          this.$nextTick(() => {
            if (this.$refs.hasOwnProperty('dialogForBuildLog')) {
              const dialogForDeployLog = this.$refs['dialogForBuildLog'];
              dialogForDeployLog.isScrolledBottom && dialogForDeployLog.scrollToBottom();
            }
          });
        }, 10);

        var currentBufferSize = 0;
        do {
          try {
            var resContent = await this.$net.requestPaasServer(Object.assign(this.$net.URL_LIST.pipeline_record_building_log, {
              partial: true
            }), {
              payload: {
                appId: this.relatedAppId,
                buildNumber: lastBuildingRecord['buildNumber'],
                consoleLog: 'string',
                currentBufferSize,
                limit: true
              }
            });
            if (resContent.hasOwnProperty('consoleLog')) {
              logQueue = logQueue.concat(resContent['consoleLog'].split('\n'));
            }
            await new Promise((resolve) => {
              setTimeout(resolve, 2000);
            });
            hasMoreData = resContent.hasOwnProperty('hasMoreData') ? resContent['hasMoreData'] : false;
            currentBufferSize = resContent.hasOwnProperty('currentBufferSize') ? resContent['currentBufferSize'] : 0;
          } catch (e) {
            break;
          }
        } while(hasMoreData && this.buildLogStatus.visible);
        this.buildLogStatus.loading = false;
      },

      async handleClick(evt, action) {
        if (this.publishStatus && action == "pipeline_build_execute") {
          this.$storeHelper.popoverWhenPublish(evt.target);
          return;
        }
        switch (action) {
          case 'refresh-record-list':
            this.requestBuildingStatus();
//            this.requestBuildList();
            break;
          case 'pipeline_build_execute':
            await this.executePipeLine(action, null);
            break;
	        case 'pipeline_confirm_build_param':
		        const hasParam = await this.getBuildParams();
		        if (hasParam) {
			        this.action.name = 'dialogAddParamForPipeline';
            } else {
			        this.$message.error('该pipeline没有配置构建参数！');
            }
		        break;

        }
      },

      async handleTRClick(evt, action, index, row) {
        if (this.publishStatus && action == "pipeline_build_restart") {
          this.$storeHelper.popoverWhenPublish(evt.target);
          return;
        }
        this.action.row = row;
        var resData = null;
        var resContent = null;
        switch (action) {
          case 'pipeline_build_restart':
            await this.executePipeLine(action, null);
            break;
          case 'stop':
            this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_record_stop, {
              params: {
                appId: this.relatedAppId
              },
              query: {
                buildNumber: row['buildNumber']
              }
            });
            break;
          case 'pipeline_building_log':
            this.showBuildingLog({
              buildNumber: row['buildNumber']
            });
            break;
          case 'pipeline_build_history_log':
            resData = await this.$net.requestPaasServer(Object.assign(
              this.$net.URL_LIST.pipeline_record_build_history,
              {
                withCode: true
              }), {
              payload: {
                appId: this.relatedAppId,
                buildNumber: row['buildNumber'],
                currentBufferSize: 0,
                // 是否分页查询
                limit: false
              }
            });
            // 文件太大只能下载到本地
            if (resData.code === 'FILE_CONTENT_TOO_LARGE') {
              await this.$confirm(`pipeline "${this.dataPassed.pipelineName}" 第${row['buildNumber']}次的构建日志超过2M，点击"确定"，下载到本地查看。`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });

              const REQUEST_DESC_DOWNLOAD = this.$net.URL_LIST['pipeline_record_build_history_download'];

              this.$net.addToRequestingRrlList(REQUEST_DESC_DOWNLOAD.path);
              this.$net.getResponse(REQUEST_DESC_DOWNLOAD, {
                params: {
                  appId: this.relatedAppId
                },
                query: {
                  buildNumber: row['buildNumber']
                }
              }, {
                headers: {
                  token: this.$storeHelper.getUserInfo('token')
                },
                responseType: 'blob'
              }).then(res => {
                const a = document.createElement('a');
                const blob = new Blob([res.data]);
                a.href = window.URL.createObjectURL(blob);
                a.download = `${this.dataPassed.pipelineName}-第${row['buildNumber']}次的构建日志.txt`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
              }).catch(err => {
                this.$net.showError(err);
              }).finally(() => {
                this.$net.removeFromRequestingRrlList(REQUEST_DESC_DOWNLOAD.path);
              });
            } else {
              const resContent = resData.content;
              if (resContent.hasOwnProperty('consoleLog')) {
                this.buildLogStatus.title = `${this.dataPassed.pipelineName}-第${row['buildNumber']}次的构建日志`;
                this.buildLogStatus.logList = resContent['consoleLog'].split('\n');
                this.buildLogStatus.visible = true;
                this.buildLogStatus.loading = false;
                setTimeout(() => {
                  this.$refs['dialogForBuildLog'].scrollToBottom();
                },100);
              }
            }
            break;
          case 'pipeline_build_plan':
            this.$storeHelper.dataTransfer = {
              appId: this.relatedAppId,
              buildNumber: row['buildNumber'],
            };
            await this.$router.helper.renameRouterName('records/plan', `${this.dataPassed.pipelineName}<${row.buildNumber}>`, '/profile/pipeline');
            this.$router.push(this.$net.page['profile/pipeline/records/plan']);
            break;
	        case 'pipeline_build_execute_with_param':
		        let valueReg = /^[A-Za-z0-9_\-\.@]{1,128}$/;
	        	let param = {};
	        	this.buildParams.forEach(item => {
			        if (!valueReg.exec(item.defaultValue)) {
				        this.$message.error('请输入128位以内的数字、字母、中划线、下划线');
				        throw new Error('请输入128位以内的数字、字母、中划线、下划线');
			        }
	        		param[item.name] = item.defaultValue;
            });
//            console.log(param);
		        await this.executePipeLine(action, param);
		        break;
        }
      },

      handleDialogClose() {
        this.buildLogStatus.logList = [];
      }
    }
  }
</script>