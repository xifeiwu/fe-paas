<template>
  <div id="pipeline-add">
    <div class="sheet">
      <div class="nav-steps" @click="handleClick($event, 'change-step')">
        <ul>
          <li class="step step1 active">1. 基本配置</li>
          <li class="step step2 ">2. 定义pipeline脚本</li>
          <li class="step step3">3. 通知设置</li>
        </ul>
      </div>
      <div class="section-config">
        <div class="step step1">
          <div class="title">
            1. 基本配置
          </div>
          <div class="config">
            <el-form labelWidth="120px" size="mini" :model="formData" :rules="formDataRules" ref="basic-info-form">
              <el-form-item label="pipeline名称" prop="pipelineName">
                <el-input size="mini-extral" v-model="formData.pipelineName"></el-input>
              </el-form-item>
              <el-form-item label="pipeline描述" prop="pipelineDescription">
                <el-input size="mini-extral" v-model="formData.pipelineDescription"></el-input>
              </el-form-item>
              <el-form-item label="gitlab仓库" prop="gitLabPath">
                <el-input size="mini-extral" v-model="formData.gitLabPath"></el-input>
              </el-form-item>
              <el-form-item label="gitlab分支" prop="gitLabBranch">
                <el-input size="mini-extral" v-model="formData.gitLabBranch"></el-input>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="step step2">
          <div class="title">
            2. 定义pipeline脚本
          </div>
          <div class="config">
            <div class="stage-list">
              <pipeline-stage v-for="(item, index) in stages" :item="item"
                              @stage-mouse-event="handleMouseEvent"
                              @stage-click-event="handleStageClick"
                              :key="index"></pipeline-stage>
            </div>
            <div class="config-list" v-if="currentStage">
              <transition name="el-zoom-in-top">
                <div class="stage-config" v-if="currentStage.selected" :key="stageName">
                  <el-form labelWidth="180px" size="mini" :model="formData" :rules="formDataRules" ref="pipeline-script-form">
                    <el-form-item label="Sonar及单元测试脚本：" class="testAndSonarScript" prop="testAndSonarScript" :multiFields="true"
                                  v-show="stageName === 'testAndSonarScript'">
                      <codemirror v-model="formData.testAndSonarScript.script" :options="groovyOption"></codemirror>
                    </el-form-item>
                    <el-form-item label="打包脚本：" class="mvnPackage-script" prop="mvnPackage" :multiFields="true"
                                  v-if="stageName === 'mvnPackage'">
                      <codemirror v-model="formData.mvnPackage.script" :options="groovyOption"></codemirror>
                    </el-form-item>
                    <el-form-item label="基础镜像：" class="buildImage" v-if="stageName === 'buildImage'">
                      <el-select v-model="formData.buildImage.selectedImage" placeholder="请选择">
                        <el-option v-for="(item, index) in pipeLineInfo['buildImage']['basicImage']"
                                   :key="item" :label="item?item:'无'" :value="item">
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="自动化测试：" class="autoScript" prop="autoScript" :multiFields="true"
                                  v-if="stageName === 'autoScript'">
                      <codemirror v-model="formData.autoScript.script" :options="groovyOption"></codemirror>
                    </el-form-item>
                    <el-form-item label="检查项：" class="sonarCheck" v-if="stageName === 'sonarCheck'">
                      <div class="sonarCheck-unitTestRatio"><el-checkbox v-model="formData['sonarCheck']['unitTestSelected']"></el-checkbox>
                        <span>当单元测试覆盖率≥</span>
                        <el-input v-model="formData['sonarCheck']['unitTestRatio']"></el-input>
                        <span>时通过；反之不通过</span></div>
                      <div class="sonarCheck-codeDebt"><el-checkbox v-model="formData['sonarCheck']['codeDebtSelected']"></el-checkbox>
                        <span>当技术债数量≤</span>
                        <el-input v-model="formData['sonarCheck']['codeDebt']"></el-input>
                        <span>时通过；反之不通过</span>
                      </div>
                    </el-form-item>
                  </el-form>
                  <div class="stage-change-selection">
                    <span>删除结点 "{{currentStage.description}}"?</span>
                    <el-button size="mini-extral" type="danger" @click="handleClick($event, 'stage-remove')">确定</el-button>
                  </div>
                </div>
                <div class="stage-change-selection" :key="stageName" v-else>
                  <span>添加结点 "{{currentStage.description}}"?</span>
                  <el-button size="mini-extral" type="warning" @click="handleClick($event, 'stage-add')">确定</el-button>
                </div>
              </transition>
            </div>
          </div>
        </div>
        <div class="step step3">
          <div class="title">
            3. 通知设置
          </div>
          <div class="config">
            <el-form labelWidth="170px" size="mini">
              <el-form-item label="通知类型：">
                <el-checkbox v-model="formData.noticeConfig.executeSuccess">每次Pipeline执行成功时通知</el-checkbox>
                <el-checkbox v-model="formData.noticeConfig.executeFail">每次Pipeline执行失败时通知</el-checkbox>
              </el-form-item>
              <el-form-item label="通知接受人：" :error="emailProps.errMsg">
                <div class="notice-email-list">
                  <el-tag
                          v-for="(item, index) in formData.noticeConfig.noticeEmails"
                          :key="index"
                          closable
                          type="success"
                          size="small"
                          @close="handleEmail($event, 'remove', item)"
                  >{{item}}</el-tag>
                </div>
                <div class="notice-email-add">
                  <el-input v-model="emailProps.emailToAdd" placeholder="小写字符、数字、中划线，以字符数字开头，长度不超过63位"></el-input>
                  <el-button size="mini-extral" type="primary" @click="handleEmail($event, 'add')">添加</el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div style="height: 60px;"></div>
      </div>
      <div class="footer">
        <el-button size="mini" type="primary" @click="handleClick($event, 'save')">保存</el-button>
        <el-button size="mini" type="primary" @click="handleClick($event, 'apply')">应用</el-button>
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
  @mixin common-scroll-style() {
    overflow: scroll;
    &::-webkit-scrollbar {
      width: 3px;
      background-color: #F5F5F5;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #909399;
    }
  }
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

    /*.is-required::before {*/
      /*content: '*';*/
      /*color: #fa5555;*/
      /*margin-right: 4px;*/
    /*}*/
    .sheet {
      position: relative;
      height: 100%;
      .nav-steps {
        display: none;
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
        padding: 10px;
        background: #f9f9f9;
        box-sizing: border-box;
        border-radius: 3px;
        /*border-bottom-left-radius: 3px;*/
        /*border-bottom-right-radius: 3px;*/
        /*border-top: none;*/
        /*height: calc(100% - 40px);*/
        height: 100%;
        @include common-scroll-style;
        .step {
          margin-bottom: 10px;
          .title {
            /*margin: 30px 0px 5px -10px;*/
            font-size: 17px;
            padding: 10px;
            padding-left: 5px;
            border: none;
            border-top: 1px solid #ddd;
          }
          &.step1 {
            .title {
              border-top: none;
            }
            .el-form {
              .el-input {
                max-width: 500px;
              }
            }
          }
          &.step2 {
            padding-bottom: 8px;
            .config {
              padding-top: 28px;
              .stage-list {
                /*padding-left: 28px;*/
                text-align: center;
              }
              .config-list {
                margin-top: 20px;
                margin-right: 10px;
                .stage-config {
                  .el-form {
                    max-width: 1000px;
                    margin: 0px auto;
                    .CodeMirror {
                      width: 800px;
                    }
                    .el-form-item {
                      &.testAndSonarScript, &.mvnPackage-script, &.autoScript {
                        .el-form-item__content {
                          line-height: 100%;
                        }
                      }
                      &.buildImage {
                        .el-select {
                          width: 360px;
                        }
                      }
                      &.sonarCheck {
                        .sonarCheck-unitTestRatio, .sonarCheck-codeDebt {
                          .el-input {
                            max-width: 120px;
                          }
                        }
                        .sonarCheck-unitTestRatio {
                          margin-bottom: 3px;
                        }
                      }
                    }
                  }
                }
                .stage-change-selection {
                  padding-top: 10px;
                  text-align: center;
                  font-size: 14px;
                }
              }

            }
          }
          &.step3 {
            .config {
              .notice-email-list {
                margin-bottom: 3px;
                .el-tag {
                  margin-right: 2px;
                }
              }
              .notice-email-add {
                display: flex;
                align-items: center;
                .el-input {
                  width: 420px;
                  margin-right: 3px;
                }
              }
            }
          }
          .config {
            border-left: 5px solid rgba(0, 0, 0, 0.1);
            padding-left: 5px;
          }
        }
      }
      .footer {
        position: absolute;
        left: 0px;
        bottom: 0px;
        text-align: center;
        padding: 20px 25px;
        border-top-right-radius: 10px;
        border: 1px solid #aaccbb;
        background: rgba(245, 249, 239, 0.75);
      }
    }
  }
</style>
<script>
  import AsyncValidator from 'async-validator';
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

  const STAGE_NAME_MAP = {
    'start': {
      description: '开始',
      type: 'prefix',
    },
    'download': {
      description: '下载代码',
      type: 'const',
      selected: true,
    },
    'testAndSonarScript': {
      description: 'sonar及单元测试'
    },
    'mvnPackage': {
      description: '打包'
    },
    'buildImage': {
      description: '制作镜像'
    },
    'deployTestEnv': {
      description: '部署到测试环境'
    },
    'autoScript': {
      description: '自动化测试'
    },
    'sonarCheck': {
      description: 'Sonar数据检查'
    },
    'functionValidate': {
      description: '功能测试（人工验证）'
    },
    'deployBetaEnv': {
      description: '部署到联调环境'
    },
    'end': {
      description: 'end',
      type: 'suffix',
    }
  };
  export default {
    components: {paasPopoverElement, pipelineStage, codemirror},
    async created() {
      const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_stage_query, {
        query: {
          appId: 24
        }
      });

      const commonProp = {
        active: false
      };
      const stages = [
        'start',  //开始
        'download',  //下载代码
        'testAndSonarScript',  //sonar及单元测试
        'mvnPackage',  //打包
        'buildImage',  //制作镜像
        'deployTestEnv', //部署到测试环境
        'autoScript',  //自动化测试
        'sonarCheck',  //Sonar数据检查
        'functionValidate',  //功能测试（人工验证）
        'deployBetaEnv',  //部署到联调环境
        'end'
      ].map(key => {
        var result = null;
        if (['start', 'download', 'end'].indexOf(key) > -1) {
          result = Object.assign({name: key}, commonProp, STAGE_NAME_MAP[key]);
        } else {
          if (resContent.hasOwnProperty(key)) {
            result = Object.assign({
              'selected': resContent[key]['selected']
            }, commonProp, {name: key}, STAGE_NAME_MAP[key]);
          } else {
            console.log(`prop ${key} is not found in response content!`);
          }
        }
        return result;
      });
//      console.log(stages);
      this.updateStageIndex(stages);
      this.stages = stages;
      if (resContent.hasOwnProperty('buildImage') && Array.isArray(resContent['buildImage']['basicImage'])) {
        // 可以不选择基础镜像
        resContent['buildImage']['basicImage'].unshift('');
      }
      this.pipeLineInfo = resContent;
      this.syncFormDataByServerData(this.formData, this.pipeLineInfo);
//      console.log(this.formData);
//      console.log(this.pipeLineInfo);
    },
    mounted() {
      this.stepNodeList = [].slice.call(this.$el.querySelectorAll('.sheet .nav-steps .step'));
      this.popperForContentShow = this.$refs['popover-for-content-show'];
//      console.log(this.stepNodeList);
    },
    data() {
      return {
        pipeLineInfo: null,
        stages: [],
        stageName: '',
        currentStage: null,

        formData: {
          appId: '',
          pipelineName: '',
          pipelineDescription: '',
          gitLabPath: '',
          gitLabBranch: '',
          // sonar及单元测试
          testAndSonarScript: {
            script: '',
            selected: false,
          },
          // 打包
          mvnPackage: {
            script: '',
            selected: false,
          },
          // 制作镜像
          buildImage: {
            selectedImage: '',
            selected: false,
          },
          // 部署到测试环境
          deployTestEnv: {
            env: 'TEST',
            selected: false,
          },
          // 自动化测试
          autoScript: {
            script: '',
            selected: false
          },
          // sonar数据检查
          sonarCheck: {
            codeDebt: '',
            unitTestRatio: '',
            codeDebtSelected: false,
            unitTestSelected: false,
            selected: false,
          },
          // 功能测试（人工验证）
          functionValidate: {
            selected: false,
          },
          // 部署到联调环境
          deployBetaEnv: {
            env: 'BETA',
            selected: false,
          },
          // 通知设置
          noticeConfig: {
            // 成功时通知
            executeSuccess: false,
            // 失败时通知
            executeFail: false,
            // 接受人列表
            noticeEmails: []
          }
        },
        formDataRules: {
          pipelineName: {
            type: "string",
            required: true,
            message: '请填写pipeline名称',
            trigger: ['blur', 'change']
          },
          pipelineDescription: {
            type: "string",
            required: false,
            trigger: ['blur']
          },
          gitLabPath: {
            type: "string",
            required: true,
            message: '请填写gitlab路径',
            trigger: ['blur']
          },
          gitLabBranch: {
            type: "string",
            required: true,
            message: '请填写gitlab分支',
            trigger: ['blur']
          },
          testAndSonarScript: {
            type: 'object',
            required: true,
            trigger: ['blur', 'change'],
            fields: {
              script: [{
                type: "string",
                required: true,
                message: '请填写sonar及单元测试脚本'
              }]
            }
          },
          mvnPackage: {
            type: 'object',
            required: true,
            trigger: ['blur', 'change'],
            fields: {
              script: [{
                type: "string",
                required: true,
                message: '请填写打包脚本'
              }]
            }
          },
          autoScript: {
            type: 'object',
            required: true,
            trigger: ['blur', 'change'],
            fields: {
              script: [{
                type: "string",
                required: true,
                message: '请填写自动化测试脚本'
              }]
            }
          }
        },
        emailProps: {
          emailToAdd: '',
          errMsg: ''
        },

        groovyOption: {
          tabSize: 4,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          mode: "groovy",
//          theme: "abcdef",
          theme: "paraiso-light",
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
    watch: {
      'emailProps.emailToAdd': function (value) {
        // remove errMsg if emailToAdd follows emailReg
        if (this.emailProps.errMsg && this.$utils.getReg('mail').exec(value)) {
          this.emailProps.errMsg = '';
        }
      }
    },
    computed: {

    },
    methods: {
      // 根据服务端数据更新formData
      syncFormDataByServerData(formData, netData) {
        const syncObject = (target, origin) => {
          for (let key in target) {
            if (Array.isArray(origin[key])) {
//              console.log(origin[key]);
//              console.log(Array.isArray(origin[key]));
//              console.log(JSON.parse(JSON.stringify(origin[key])));
              target[key] = JSON.parse(JSON.stringify(origin[key]));
            } else if (this.$utils.isObject(origin[key])) {
              syncObject(target[key], origin[key]);
            } else if (this.$utils.isString(origin[key])) {
              target[key] = !origin[key] ? '' : origin[key];
            } else {
              target[key] = origin[key];
            }
          }
        };
        syncObject(formData, netData);
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
//            console.log(evt.target);
            break;
          case 'stage-add':
            this.currentStage['selected'] = true;
            this.updateStageIndex(this.stages);
            this.$message.success(`添加结点 "${this.currentStage['name']}" 成功！`);
            this.formData[this.currentStage['name']]['selected'] = true;
            break;
          case 'stage-remove':
            this.currentStage['selected'] = false;
            this.updateStageIndex(this.stages);
            this.$message.success(`删除结点 "${this.currentStage['name']}" 成功！`);
            this.formData[this.currentStage['name']]['selected'] = false;
            break;
          case 'save':
            const basicInfoForm = this.$refs['basic-info-form'];

            var validator = new AsyncValidator(this.formDataRules);
            validator.validate(this.formData, (errors, fields) => {
              if (errors) {
//                console.log(errors);
//                console.log(fields);
                var firstFields = errors[0]['field'];
                if (firstFields.indexOf('.') > -1) {
                  firstFields = firstFields.split('.')[0];
                }
//                console.log(firstFields);
                // sonar及单元测试，打包，自动化测试
                if (['testAndSonarScript', 'mvnPackage', 'autoScript'].indexOf(firstFields) > -1) {
                  this.setActiveStageByName(firstFields);
                  this.$nextTick(() => {
                    this.$refs['pipeline-script-form'].validate(() => {});
                  });
                } else {
                  basicInfoForm.validate(() => {});
                }
              } else {
                console.log(this.formData);
              }
            });
            break;
          case 'apply':
            break;
        }
      },
      handleMouseEvent(action, evt, stage) {
      },
      handleStageClick(evt, stage) {
        if (this.stageName === stage.name) {
          return;
        }
        // 不处理['开始', '下载代码', '结束']
        if (['start', 'download', 'end'].indexOf(stage.name) > -1) {
          return;
        }
//        console.log(stage);
        this.currentStage = stage;
        this.stageName = stage.name;
        this.stages.forEach(it => {
          if (it !== stage) {
            it.active = false;
          }
        });
      },
      // 通过name属性设置stage.active
      setActiveStageByName(name) {
        this.stages.forEach(it => {
          if (it.name == name) {
            it.active = true;
            this.currentStage = it;
            this.stageName = it.name;
          } else {
            it.active = false;
          }
        });
      },
      handleEmail(evt, action, item) {
        const emailList = this.formData.noticeConfig.noticeEmails;
        const emailToAdd = this.emailProps.emailToAdd;
//        console.log(action, item, emailToAdd);
        switch (action) {
          case 'add':
            if (!this.$utils.getReg('mail').exec(emailToAdd)) {
              this.emailProps.errMsg = '邮件格式不正确';
              return;
            }
            if (emailList.indexOf(emailToAdd) > -1) {
              this.emailProps.errMsg = '该邮箱地址已添加';
              return;
            }
            emailList.push(emailToAdd);
            this.emailProps.emailToAdd = '';
            break;
          case 'remove':
            if (emailList.indexOf(item) > -1) {
              emailList.splice(emailList.indexOf(item), 1);
            }
            break;
        }
      }
    }
  }
</script>