<template>
  <div id="plan-main">
    <div class="header">
      <div class="pipeline-run-result">
        <pipeline-stage
                v-for="(item,index) in stages" :item="item"
                :key="index"
                @stage-mouse-event="handleMouseEvent"
                @stage-click-event="handleStageClick"
                :class="item.result == 'FAILURE' ? 'error' : ''"></pipeline-stage>
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
          <div class="result-step-header" @click="handleRowOpenOrClose(item)">
            <span class="result-item-icon" :style="{'background-color': item.result && item.result == 'SUCCESS' ? '' : '#d54c53'}">
              <i class="el-icon-check" v-if="item.result && item.result == 'SUCCESS'"></i>
              <i class="el-icon-close" v-else></i>
            </span>
            <div class="result-item-title">
              <span :class="['el-icon-arrow-right', 'result-item-expando', {'icon-transform': currentOpenStepLogList && currentOpenStepLogList.hasOwnProperty(item.id.toString())}]"></span>
              <span class="result-item-label">{{item.displayName}}</span>
              <span class="result-item-extra-info">{{`${item.durationInMillis / 1000 < 1 ? '<1' : Math.floor(item.durationInMillis / 1000)}s`}}</span>
            </div>
          </div>
          <div class="result-step-log" v-show="currentOpenStepLogList && currentOpenStepLogList.hasOwnProperty(item.id.toString())">
            <stage-step-log :logs="currentOpenStepLogList[item.id.toString()]"></stage-step-log>
          </div>
        </div>
      </div>
    </div>
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
              width: 100%;
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
  export default {
    components: {pipelineStage, stageStepLog},
    created() {
      const dataPassed = this.$storeHelper.dataTransfer;
      if (!dataPassed) {
        this.$router.push(this.$net.page['profile/pipeline/list']);
      }
      this.appId = dataPassed.appId;
      this.buildNumber = dataPassed.buildNumber;
      this.$storeHelper.dataTransfer = null;
      this.requestBlueOceanStageList();
    },

    mounted() {

    },

    watch: {
      'currentBuildStage': function () {
        this.requestBlueOceanStageStepList();
      },
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
        buildStageStepList: [],
        currentOpenStepLogList: {},
      }
    },

    methods: {
      async requestBlueOceanStageList() {
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
            showIcon: true,
          };
          this.stages.push(stage);
        });
        this.stages = [{active:false, description: '开始', index: null, name: 'start'}].concat(this.stages)
          .concat({active: false, description: '结束', index: null, name: 'end'});
        this.stages[1].active = true;
        this.currentBuildStage = this.findStageById(this.stages[1].id);
        this.updateStageIndex(this.stages);
      },

      async requestBlueOceanStageStepList() {
        this.buildStageStepList = [];
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
    }
  }
</script>