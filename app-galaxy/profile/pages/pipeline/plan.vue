<template>
  <div id="plan-main" ref="plan-main">
    <div class="header">
      <div class="pipeline-run-result">
        <pipeline-stage
                v-for="(item,index) in stages" :item="item"
                :key="index"
                @stage-mouse-event="handleMouseEvent"
                @stage-click-event="handleStageClick"
                :class="item.result == 'FAILURE' || item.result == 'NOT_BUILT'? 'error' : ''"></pipeline-stage>
      </div>
    </div>
    <div class="body" v-if="currentBuildStage">
      <div class="log-header">
        <div>
          <span>{{currentBuildStage.displayName}}</span>
          <span>-</span>
          <span>{{`${currentBuildStage.durationInMillis / 1000 < 1 ? '<1' : Math.ceil(currentBuildStage.durationInMillis / 1000)}s`}}</span>
        </div>
      </div>
      <div class="steps">
        <div class="result-item" v-for="item in buildStageStepList">
          <div class="result-step-header" @click="handleRowOpenOrClose(item)" :style="{'cursor': item.stepsHref? 'pointer' : 'not-allowed'}">
            <span class="result-item-icon" :style="{'background-color': item.result && item.result == 'SUCCESS' ? '' : '#d54c53'}">
              <i class="el-icon-check" v-if="item.result && item.result == 'SUCCESS'"></i>
              <i class="el-icon-close" v-else></i>
            </span>
            <div class="result-item-title">
              <span :class="['el-icon-arrow-right', 'result-item-expando', {'icon-transform': currentOpenStepLogList && currentOpenStepLogList.hasOwnProperty(item.id.toString())}]"></span>
              <span class="result-item-displayDescription" :title="item.displayDescription">{{item.displayDescription}}</span>
              <span class="result-item-displayName">{{`${item.displayDescription ? '— ' : ''}${item.displayName}`}}</span>
              <span class="result-item-extra-info">{{`${item.durationInMillis / 1000 < 1 ? '<1' : Math.floor(item.durationInMillis / 1000)}s`}}</span>
            </div>
          </div>
          <div class="result-step-log" v-show="currentOpenStepLogList && currentOpenStepLogList.hasOwnProperty(item.id.toString())">
            <stage-step-log :logs="currentOpenStepLogList[item.id.toString()]"></stage-step-log>
          </div>
        </div>
      </div>
    </div>
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
  </div>
</template>

<style lang="scss">
  #plan-main {
    background-color: white;
    height: 100%;
    max-width: 1500px;
    .header {
      height: 30%;
      margin-left: 45px;
      margin-right: 45px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .pipeline-run-result {
        .error {
          .node {
            background-color: #d54c53;
          }
        }
      }
    }
    .body {
      margin-left: 45px;
      margin-right: 45px;
      height: auto;
      .log-header {
        margin-bottom: 5px;
        line-height: 1.2;
        color: #4a4a4a;
        font-size: 15px;
        font-weight: 700;
      }
      .steps {
        .result-item {
          border: solid 1px #e4e4e4;
          .result-step-header {
            color: #4a4a4a;
            line-height: 2.1;
            width:100%;
            display: flex;
            flex-flow: row nowrap;
            align-items: stretch;
            cursor: pointer;
            .result-item-icon {
              width: 2.5%;
              background: #8cc04f;
              text-align: center;
              color: white;
            }
            .result-item-title {
              width: 97.5%;
              font-size: 14px;
              display: flex;
              align-items: center;
              .result-item-expando {
                margin-left: 6px;
                margin-right: 6px;
                font-weight: bold;
              }
              .icon-transform {
                transform: rotate(0.25turn);
              }
              .result-item-extra-info {
                flex: 1;
                text-align: right;
                margin-right: 10px;
              }
              .result-item-displayName {
                color: #a4a4a4;
                white-space: nowrap;
                margin-left: 10px;
                margin-right: 10px;
              }
              .result-item-displayDescription {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
              }
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>

</style>

<script>
  import pipelineStage from './components/stage.vue';
  import stageStepLog from './components/step-log';
  import paasPopoverElementWithModalMask from 'assets/components/popover-element-with-modal-mask';
  export default {
    components: {pipelineStage, stageStepLog, paasPopoverElementWithModalMask},
    created() {
      var goBack = false;
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer['from'];
        if (from === this.$net.page['profile/pipeline/records']) {
          const data = dataTransfer['data'];
          this.appId = data.appId;
          this.buildNumber = data.buildNumber;
          // for jump back to profile/pipeline/records
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/pipeline/records/plan'],
            data
          };
        } else {
          goBack = true;
        }
      } else {
        goBack = true;
      }
      if (goBack) {
        this.$router.push(this.$net.page['profile/pipeline/list']);
        return;
      }

      this.$nextTick(() => {
        this.popperForUserConfirm = this.$refs['popover-for-user-confirm'];
      });
      this.requestBlueOceanStageList();
    },

    mounted() {
      this.$refs["plan-main"].parentNode.setAttribute("style","background-color:white;");
    },

    watch: {
      'currentBuildStage': function () {
        this.requestBlueOceanStageStepList();
      },
      'lastStage': function () {
        this.processStageList();
      }
    },

    computed: {
    },

    data() {
      return {
        appId: null,
        buildNumber: null,
        buildStageList: [],
        currentBuildStage: null,
        stages: [],
        lastStage: null,
        buildStageStepList: [],
        currentOpenStepLogList: {},
        // 需要用户确认的基本信息
        userInputInfo: null,
        pipelineBuildingInfo: null,
      }
    },

    methods: {
      async requestBlueOceanStageList() {
        this.stages = [];
        let params = {
          appId: this.appId,
        };
        let query = {
          buildNumber: this.buildNumber,
        };
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_blue_ocean_stage_list,{params,query});
        this.buildStageList = resContent;
        resContent.forEach(it => {
          if (it.state == null) {
            return;
          }
          let stage = {
            active: false,
            description: it['displayName'],
            index: null,
            name: 'unknow',
            selected: true,
            id: it['id'],
            result: it['result'],
          };
          if (it.result && it.result.toUpperCase() === 'UNKNOWN') {
            stage["showLoading"] = true;
          } else {
            stage["showIcon"] = true;
          }
          this.stages.push(stage);
        });
        this.lastStage = resContent.length > 0 ? resContent[resContent.length - 1] : null;
      },

      async processStageList() {
        if (this.lastStage["result"] && this.lastStage["result"].toUpperCase() !== "UNKNOWN") {
          this.stages = [{active:false, description: '开始', index: null, name: 'start'}].concat(this.stages)
            .concat({active: false, description: '结束', index: null, name: 'end'});
          this.stages[1].active = true;
          this.currentBuildStage = this.findStageById(this.stages[1].id);
          this.updateStageIndex(this.stages);
          await this.requestBuildingInfo();
          this.updatePopperForUserConfirm();
        } else {
          this.stages = [{active:false, description: '开始', index: null, name: 'start'}].concat(this.stages);
          this.stages[this.stages.length - 1].active = true;
          this.currentBuildStage = this.findStageById(this.stages[this.stages.length - 1].id);
          this.updateStageIndex(this.stages);
          await this.requestBuildingInfo();
          this.updatePopperForUserConfirm();
          setTimeout(() => {
            this.requestBlueOceanStageList();
          },this.getRandomMills());
        }
      },

      async updatePopperForUserConfirm() {
        if (this.pipelineBuildingInfo && (this.pipelineBuildingInfo.status === 'PAUSED_PENDING_INPUT')) {
          let userInputInfo = this.getUserInputInfo(this.pipelineBuildingInfo);
          this.userInputInfo = userInputInfo;

          let nodeList = this.$el.querySelectorAll(`#plan-main .pipeline-run-result .stage`);
          let target = nodeList[nodeList.length - 1];
          if (!this.popperForUserConfirm.isShowing()) {
            this.popperForUserConfirm.show({
              ref: target
            });
          }
        } else {
          this.popperForUserConfirm.doClose();
        }
      },

      getUserInputInfo(record) {
        let result = null;
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

      async requestBlueOceanStageStepList() {
        this.buildStageStepList = [];
        if (!this.currentBuildStage) {
          return ;
        }
        let params = {
          appId: this.appId,
        };
        let query = {
          buildNumber: this.buildNumber,
          stageId: this.currentBuildStage.id,
        };
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_blue_ocean_stage_step_list,{params,query});
        this.buildStageStepList = resContent;
      },

      async requestBuildingInfo() {
        this.pipelineBuildingInfo = null;
        const buildingList = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_in_building, {
          params: {
            appId: this.appId
          },
          query: {
            buildNumber: this.buildNumber
          }
        });
        buildingList.forEach(it => {
          if (['NOT_EXECUTED', 'IN_PROGRESS', 'PAUSED_PENDING_INPUT'].indexOf(it.status) > -1) {
            this.pipelineBuildingInfo = it;
          }
        });
      },

      async handleUserInput(action) {
        const userInputInfo = this.userInputInfo;
        if (!userInputInfo) {
          return;
        }
        this.$set(userInputInfo,"action",action);
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

      // 更新stage列表中每个元素的index值
      updateStageIndex(stage) {
        var index = 1;
        stage.forEach(it => {
          if (it.selected) {
            it['index'] = index++;
          } else {
            it['index'] = null;
          }
        });
      },

      handleMouseEvent(action, evt, stage) {
      },

      handleStageClick(evt, stage) {
        if (['start','end'].indexOf(stage.name) > -1) {
          return;
        }
        this.currentOpenStepLogList = {};
        this.currentBuildStage = this.findStageById(stage.id);
        this.stages.forEach(it => {
          if (it !== stage) {
            it.active = false;
          }
        });
      },

      findStageById(id) {
        return this.buildStageList.find(it => {
          return it.id == id;
        })
      },

      async handleRowOpenOrClose(step) {
        if (!step.stepsHref) {
          return;
        }
        if (this.currentOpenStepLogList && this.currentOpenStepLogList.hasOwnProperty(step.id.toString())) {
          this.$delete(this.currentOpenStepLogList, step.id.toString());
          return;
        }
        let query = {
          'stageHref': this.currentBuildStage.stepsHref,
          'stepId': step.id
        };
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_blue_ocean_stage_step_log, {query});
        if (resContent) {
          this.$set(this.currentOpenStepLogList, step.id.toString(), resContent.split('\r\n'));
        } else {
          this.$set(this.currentOpenStepLogList, step.id.toString(), '');
        }
      },

      /**
       * 生成随机毫秒数，在8-15秒之间
       */
      getRandomMills() {
        let max = 15;
        let min = 8;
        return (Math.floor(Math.random() * max) % min + min) * 1000;
      }
    }
  }
</script>