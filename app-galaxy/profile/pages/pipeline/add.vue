<template>
  <div id="pipeline-add">
    <div class="sheet">
      <div class="steps" @click="handleClick($event, 'change-step')">
        <ul>
          <li class="step step1 active">步骤一</li>
          <li class="step step2 ">步骤二</li>
          <li class="step step3">步骤三</li>
        </ul>
      </div>
      <div class="section-config">
        <div class="step step1">
          <div class="title">
            1. 基本配置
          </div>
          <div class="config">
            content of config
          </div>
        </div>
        <div class="step step2">
          <div class="title">
            2. 定义pipeline脚本
          </div>
          <div class="config">
            <pipeline-stage name="start" description="start"></pipeline-stage><!--
            --><pipeline-stage v-for="(item, index) in stages" :name="item.name" :index="item.index"
                               @stage-mouse-event="handleMouseEvent"
                               @stage-click-event="handleStageClick"
                            :description="item.description" :key="index"></pipeline-stage>
            <pipeline-stage name="end" description="end"></pipeline-stage>
          </div>
          <div class="transition">
            <transition name="el-zoom-in-top">
              <codemirror v-model="script" :options="groovyOption" v-if="currentStage === '打包制作镜像'"></codemirror>
            </transition>
            <transition name="el-zoom-in-top">
              <div v-if="currentStage === '单元测试'">
                <div>{{script}}</div>
              </div>
            </transition>
          </div>
        </div>
        <div class="step step3">
          <div class="title">
            3. 修改通知设置
          </div>
          <div class="config">
            content of config
          </div>
        </div>
      </div>
    </div>
    <paas-popover-element ref="popover-for-content-show" popperClass="el-popover--small is-dark" title="fdsafdsafd"
                          placement="bottom" :closeOnLeave="false">
      <div slot="content">
        <div class="auto-test" style="width: 800px">
          <codemirror v-model="script" :options="groovyOption"></codemirror>
        </div>
      </div>
    </paas-popover-element>
  </div>
</template>
<style lang="scss">
  $--all-transition: all .3s cubic-bezier(.645,.045,.355,1) !default;
  $--fade-transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1) !default;
  $--fade-linear-transition: opacity 200ms linear !default;
  $--md-fade-transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1) 100ms, opacity 300ms cubic-bezier(0.23, 1, 0.32, 1) 100ms !default;
  $--border-transition-base: border-color .2s cubic-bezier(.645,.045,.355,1) !default;
  $--color-transition-base: color .2s cubic-bezier(.645,.045,.355,1) !default;
  #pipeline-add {
    .el-zoom-in-top-enter-active {
      opacity: 1;
      transform: scaleY(1);
      transition: $--md-fade-transition;
      transform-origin: center top;
    }
    .el-zoom-in-top-enter {
      opacity: 0;
      transform: scaleY(0);
    }
    .el-zoom-in-top-leave-active,
    .el-zoom-in-top-leave {
      display: none;
    }
    height: 100%;
    background-color: white;
    .sheet {
      position: relative;
      .steps {
        background-color: #eee;
        border: 1px solid #cccccc;
        border-bottom: none;
        padding-top: 5px;
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
        ul li.step {
          display: inline-block;
          padding: 7px 10px;
          margin-left: 10px;
          font-size: 13px;
          color: #999;
          cursor: pointer;
          &.active {
            background: #f9f9f9;
            color: #000;
            font-weight: bold;
            z-index: 2;
            border: 1px solid #cccccc;
            border-bottom: 1px solid #f9f9f9;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
          }
        }
      }
      .section-config {
        border: 1px solid #cccccc;
        border-bottom-left-radius: 3px;
        border-bottom-right-radius: 3px;
        padding: 10px;
        border-top: none;
        background: #f9f9f9;
        .step {
          margin-bottom: 10px;
          .title {
            /*margin: 30px 0px 5px -10px;*/
            font-size: 19px;
            padding: 10px 15px;
            border: none;
            border-top: 1px solid #ddd;
          }
          &.step1 {
            .title {
              border-top: none;
            }
          }
          &.step2 {
            .config {
              padding-left: 15px;
              padding-top: 30px;
            }
            .transition {
              height: 300px;
            }
          }
          .config {
            border-left: 5px solid rgba(0, 0, 0, 0.1);
            padding-left: 5px;
          }
        }
      }
    }
  }
</style>
<script>
  import paasPopoverElement from 'assets/components/popover-element';
  import pipelineStage from './components/stage.vue';

  import {codemirror} from "vue-codemirror";
  import "codemirror/lib/codemirror.css";
  // language
  //  import "codemirror/mode/properties/properties.js";
  import "codemirror/mode/groovy/groovy.js";
  // theme
  import "codemirror/theme/paraiso-light.css";
  import "codemirror/theme/abcdef.css";
  // require active-line.js
  import "codemirror/addon/selection/active-line.js";
  export default {
    components: {paasPopoverElement, pipelineStage, codemirror},
    async created() {
      const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_stage_query, {
        query: {
          appId: 24
        }
      });
      console.log(resContent);
    },
    mounted() {
      this.stepNodeList = [].slice.call(this.$el.querySelectorAll('.sheet .steps .step'));
      this.popperForContentShow = this.$refs['popover-for-content-show'];
//      console.log(this.stepNodeList);
    },
    data() {
      return {
        stages: [{
          name: 'step1',
          description: '打包制作镜像',
          index: 1
        }, {
          name: 'step2',
          description: '部署到测试环境',
          index: null,
        }, {
          name: 'step3',
          description: '单元测试',
          index: 3
        }],
        currentStage: '',

        groovyOption: {
          tabSize: 4,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          mode: "groovy",
          theme: "abcdef",
          readOnly: false,
          viewportMargin: 10
        },
        script: `stage ('制作镜像(Image)') {
   if ('false' == customImage) {
       if ('JAR'== packageType) {
           sh 'docker login -u ' + harborUser + ' -p ' + harborPassword + ' ' + harborAddress
           sh 'mkdir agent'
           dir('agent') {
               checkout([
                   $class: 'GitSCM',
                   branches: [[name: '*/production']],
                   doGenerateSubmoduleConfigurations: false,
                   extensions: [],
                   submoduleCfg: [],
                   userRemoteConfigs: [
                       [credentialsId: credentialsId,
                       url: eagleeyeGitAddr]
                   ]
               ])
           }//dir
           writeFile file: serviceName + '/Dockerfile.' + fullImage, text: '''
               FROM ''' + basicImageEagleEye + '''
               ADD ''' + serviceName + '''/target/ /data/''' + serviceName + '''/
               RUN mkdir -p /data/agent/godeyes
               RUN mkdir -p /data/agent/godeyes/plugins
               COPY agent/agent-package/monitor-agent-core-1.0.2.jar /data/agent/godeyes/godeyes-agent-SNAPSHOT.jar
               COPY agent/agent-package/plugins /data/agent/godeyes/plugins
               CMD ['/data/run_all.sh']'''
           sh 'docker build -f ' + serviceName + '/Dockerfile.' + fullImage + ' -t ' + fullImage + ' .'
           sh 'docker push ' + fullImage
           sh 'docker rmi ' + fullImage
       } else if ('ZIP' == packageType) {
           //zip build
       } else if ('WAR' == packageType) {
           //war build
       }
   } else {
       //build image nothing
   }
}//image`
      }
    },
    computed: {

    },
    methods: {
      handleClick(evt, action) {
        const target = evt.target;
        switch (action) {
          case 'change-step':
            this.stepNodeList.forEach(it => {
              if (it.contains(target)) {
                it.classList.add('active');
              } else {
                it.classList.remove('active');
              }
            });
            console.log(evt.target);
            break;
        }
      },
      handleMouseEvent(action, evt, name) {
        return;
        if (action === 'leave') {
          return;
        }
        this.currentStage = name;
        console.log(this.popperForContentShow.$slots);
//        this.popperForContentShow.show({
//          ref: evt.target,
//          type: 'node',
//        });
//        console.log(evt.target);
        console.log(action, name);
      },
      handleStageClick(evt, name) {
        console.log(name);
        this.currentStage = '';
//        setTimeout(() => {
          this.currentStage = name;
//        }, 100);
      }
    }
  }
</script>