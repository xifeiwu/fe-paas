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
            <span>1. 基本配置</span><span style="font-size: 14px;" v-if="appInfo">（目标应用：{{appInfo.appName}}）</span>
          </div>
          <div class="config">
            <el-form labelWidth="120px" size="mini" :model="formData" :rules="formDataRules" class="clear-fix" ref="basic-info-form">
              <el-form-item label="Pipeline名称" prop="pipelineName">
                <el-input size="mini-extral" v-model="formData.pipelineName"></el-input>
              </el-form-item>
              <el-form-item label="Pipeline描述" prop="pipelineDescription">
                <el-input size="mini-extral" v-model="formData.pipelineDescription"></el-input>
              </el-form-item>
              <el-form-item label="gitlab仓库" prop="gitLabPath">
                <el-input size="mini-extral" v-model="formData.gitLabPath"></el-input>
              </el-form-item>
              <el-form-item label="gitlab分支" prop="gitLabBranch">
                <el-input size="mini-extral" v-model="formData.gitLabBranch" placeholder="请输入项目的gitLab分支，支持正表达式"></el-input>
              </el-form-item>
              <el-form-item label="webhook配置" v-if="pipelineInfoFromNet && pipelineInfoFromNet.webHooks" class="webhook-config big">
                <div class="webhook-config-content">
                  <span>{{formData.webHooks.webHooksUrl}}</span>
                  <div class="more-config">
                    <span style="color: black; font-weight: bold; font-size: 14px; line-height: 24px; vertical-align: middle; margin-left: 20px;">hook类型：</span>
                    <el-radio-group v-model="formData.webHooks.webHooksSelectedEvent">
                      <el-radio v-for="(item, index) in pipelineInfoFromNet.webHooks.webHooksEvent" :label="item" :key="item">{{item}}</el-radio>
                    </el-radio-group>
                    <span style="color: black; font-weight: bold; font-size: 14px; line-height: 24px; vertical-align: middle; margin-left: 20px;">是否生效：</span>
                    <el-checkbox v-model="formData.webHooks.selected"></el-checkbox>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="构建参数" prop="defList" class="environments big" v-if="showMoreConfig" :error="formItemMsgForParam">
                <el-row class="title">
                  <el-col :span="7" class="key">名称</el-col>
                  <el-col :span="7" class="value">默认值</el-col>
                  <el-col :span="8" class="remark">描述</el-col>
                  <el-col :span="2" style="text-align: center"></el-col>
                </el-row>
                <el-row
                  v-for="(item, index) in formData.defList"
                  :key="item.name"
                  :gutter="10"
                >
                  <el-col :span="7" class="key">{{item.name}}</el-col>
                  <el-col :span="7" class="value">{{item.defaultValue}}</el-col>
                  <el-col :span="8" class="remark">{{item.description}}</el-col>
                  <el-col :span="2" style="text-align: center" class="delete">
                    <el-button type="warning" round size="mini-extral" @click="handleParameter('delete', index)">删除</el-button>
                  </el-col>
                </el-row>
                <el-row :gutter="10">
                  <el-col :span="7">
                    <el-input v-model="paramKey" placeholder="64位以内的数字、字母、下划线，以字母或下划线开头" size="mini"></el-input>
                  </el-col>
                  <el-col :span="7">
                    <el-input v-model="paramValue" placeholder="128位以内的数字、字母、中划线、下划线" size="mini"></el-input>
                  </el-col>
                  <el-col :span="8">
                    <el-input v-model="paramRemark" size="mini"></el-input>
                  </el-col>
                  <el-col :span="2" style="text-align: center">
                    <el-button type="primary" size="mini-extral" round
                               @click="handleParameter('add', paramKey, paramValue, paramRemark)">添加</el-button>
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item class="expand big">
                <div class="more" @click="handleClick($event, 'more-config')">
                  <span v-if="showMoreConfig">收起更多配置</span><span v-else>更多配置</span>
                  <i :class="showMoreConfig?'el-icon-arrow-up':'el-icon-arrow-down'"></i>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="step step2">
          <div class="title">
            <span>2. 定义Pipeline脚本</span>
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
                <div class="stage-config" v-if="currentStage.selected">
                  <!--:key="stageName"-->
                  <!--部署到测试环境-->
                  <div v-if="stageName === 'deployTestEnv'" class="deployTestEnv">
                    <div class="service-info-container" v-if="currentStageNetInfo['serviceStatus'] && currentStageNetInfo['applicationConfig']">
                      <!--<i :class="['el-icon', 'el-icon-refresh',  statusOfWaitingResponse('refresh_service_info') ? 'loading':'']"-->
                         <!--@click="handleClick($event, 'refresh_test_service_info')"></i>-->
                      <paas-service-info :serviceInfo="currentStageNetInfo['applicationConfig']"></paas-service-info>
                    </div>
                    <div style="color:#E6A23C; text-align: center" v-else>
                      当前应用无"测试环境"服务
                    </div>
                  </div>
                  <!--部署到联调环境-->
                  <div v-if="stageName === 'deployBetaEnv'" class="deployBetaEnv">
                    <div class="service-info-container" v-if="currentStageNetInfo['serviceStatus'] && currentStageNetInfo['applicationConfig']">
                      <!--<i :class="['el-icon', 'el-icon-refresh',  statusOfWaitingResponse('refresh_service_info') ? 'loading':'']"-->
                         <!--@click="handleClick($event, 'refresh_beta_service_info')"></i>-->
                      <paas-service-info :serviceInfo="currentStageNetInfo['applicationConfig']"></paas-service-info>
                    </div>
                    <div style="color:#E6A23C; text-align: center" v-else>
                      当前应用无"联调环境"服务
                    </div>
                  </div>
                  <el-form labelWidth="120px" size="mini" :model="formData" :rules="formDataRules" class="union-form"
                           ref="pipeline-script-form">
                    <!--sonar及单元测试-->
                    <el-form-item label="Sonar及单元测试脚本：" labelWidth="180px" class="testAndSonarScript"
                                  prop="testAndSonarScript" :multiFields="true"
                                  v-if="stageName === 'testAndSonarScript'">
                      <codemirror v-model="formData.testAndSonarScript.script" :options="groovyOption"></codemirror>
                    </el-form-item>
                    <!--sonar及单元测试-->
                    <el-form-item label="手工确认：" labelWidth="180px" v-show="stageName === 'testAndSonarScript'">
                      <el-checkbox v-model="formData.testAndSonarScript.inputChecked"></el-checkbox>
                    </el-form-item>
                    <!--sonar数据检查-->
                    <el-form-item label="Sonar关键字：" class="sonarCheck"
                                  prop="sonarCheck.projectKeyWord"
                                  v-show="stageName === 'sonarCheck'">
                      <el-input v-model="formData.sonarCheck.projectKeyWord" style="max-width: 500px"></el-input>
                      <el-popover
                        placement="left-start"
                        width="50"
                        trigger="hover">
                        <div>
                          <img src="/assets/imgs/profile/pipeline-sonar-tip.png" width="600px" height="400px"/>
                        </div>
                        <span slot="reference"><i class="paas-icon-fa-question" style="color: #E6A23C; font-size:12px;"></i></span>
                      </el-popover>
                    </el-form-item>
                    <!--sonar数据检查-->
                    <el-form-item label="检查项：" class="sonarCheck" v-if="stageName === 'sonarCheck'" prop="sonarCheck.unitTestRatio">
                      <div class="sonarCheck-unitTestRatio"><el-checkbox v-model="formData['sonarCheck']['unitTestSelected']"></el-checkbox>
                        <span>当单元测试行覆盖率≥</span>
                        <el-input v-model="formData.sonarCheck.unitTestRatio"></el-input>
                        <span>%时通过；反之不通过</span>
                      </div>
                    </el-form-item>
                    <el-form-item class="sonarCheck" v-if="stageName === 'sonarCheck'" prop="sonarCheck.codeDebt">
                      <div class="sonarCheck-codeDebt"><el-checkbox v-model="formData['sonarCheck']['codeDebtSelected']"></el-checkbox>
                        <span>当技术债时间≤</span>
                        <el-input v-model="formData.sonarCheck.codeDebt"></el-input>
                        <span>分钟时通过；反之不通过</span>
                      </div>
                    </el-form-item>
                    <!--sonar数据检查-->
                    <el-form-item label="手工确认：" v-show="stageName === 'sonarCheck'">
                      <el-checkbox v-model="formData.sonarCheck.inputChecked"></el-checkbox>
                    </el-form-item>
                    <!--打包-->
                    <el-form-item label="打包脚本：" class="mvnPackage-script" prop="mvnPackage" :multiFields="true"
                                  v-if="stageName === 'mvnPackage'">
                      <codemirror v-model="formData.mvnPackage.script" :options="groovyOption"></codemirror>
                    </el-form-item>
                    <!--打包-->
                    <el-form-item label="手工确认：" v-show="stageName === 'mvnPackage'">
                      <el-checkbox v-model="formData.mvnPackage.inputChecked"></el-checkbox>
                    </el-form-item>
                    <!--制作镜像-->
                    <el-form-item label="基础镜像：" class="buildImage" v-if="stageName === 'buildImage'" prop="buildImage" :multiFields="true">
                      <el-select v-model="formData.buildImage.selectedImage" placeholder="请选择" popper-class="select-high">
                        <el-option v-for="(item, index) in pipelineInfoFromNet['buildImage']['basicImage']"
                                   :key="item.name" :value="item.name">
                          <strong style="float: left;font-size: 16px">{{ item.name }}</strong>
                          <br/>
                          <p style="float: left; color: #8492a6; font-size: 13px">{{ item.desc }}</p>
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <!--制作镜像-->
                    <el-form-item label="手工确认：" v-show="stageName === 'buildImage'">
                      <el-checkbox v-model="formData.buildImage.inputChecked"></el-checkbox>
                    </el-form-item>
                    <!--部署到测试环境-->
                    <el-form-item label="手工确认：" labelWidth="300px" v-show="stageName === 'deployTestEnv'">
                      <div style="display: flex; justify-content: space-between">
                        <el-checkbox v-model="formData.deployTestEnv.inputChecked"></el-checkbox>
                        <div>
                          <el-button size="mini" type="primary" @click="handleClick($event, 'refresh_test_service_info')">
                            <span>同步环境配置</span>
                            <i class="el-icon-refresh"></i>
                          </el-button>
                          <span style="color: blue; text-decoration: underline; cursor: pointer; margin-left: 5px" @click="pageJump('test')">点击跳转到修改测试环境服务配置页面<i class="paas-icon-level-up"></i></span>
                        </div>
                      </div>
                    </el-form-item>
                    <!--部署到联调环境-->
                    <el-form-item label="手工确认：" labelWidth="300px" v-show="stageName === 'deployBetaEnv'">
                      <div style="display: flex; justify-content: space-between">
                        <el-checkbox v-model="formData.deployBetaEnv.inputChecked"></el-checkbox>
                        <div>
                          <el-button size="mini" type="primary" @click="handleClick($event, 'refresh_beta_service_info')">
                            <span>同步环境配置</span>
                            <i class="el-icon-refresh"></i>
                          </el-button>
                          <span style="color: blue; text-decoration: underline; cursor: pointer; margin-left: 5px" @click="pageJump('beta')">点击跳转到修改联调环境服务配置页面<i class="paas-icon-level-up"></i></span>
                        </div>
                      </div>
                    </el-form-item>
                    <!--自动化测试-->
                    <el-form-item label="gitlab路径：" labelWidth="220px" prop="ciPipelineAutoTestVO.gitLabPath"
                                  v-show="stageName === 'ciPipelineAutoTestVO'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVO.gitLabPath"></el-input>
                    </el-form-item>
                    <el-form-item label="gitlab分支：" labelWidth="220px" prop="ciPipelineAutoTestVO.gitLabBranch"
                                    v-show="stageName === 'ciPipelineAutoTestVO'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVO.gitLabBranch"></el-input>
                    </el-form-item>
                    <el-form-item label="自动化覆盖率报告路径：" labelWidth="220px" prop="ciPipelineAutoTestVO.itTestReportAddress"
                                  v-show="stageName === 'ciPipelineAutoTestVO'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVO.itTestReportAddress"></el-input>
                    </el-form-item>
                    <el-form-item label="Gitlab父级pom.xml相对路径：" labelWidth="220px"
                      v-show="stageName === 'ciPipelineAutoTestVO'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVO.relativePath"></el-input>
                    </el-form-item>
                    <el-form-item label="脚本：" labelWidth="220px" prop="ciPipelineAutoTestVO.script"
                      v-show="stageName === 'ciPipelineAutoTestVO'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVO.script"></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="自动化测试：" class="ciPipelineAutoTestVO" prop="ciPipelineAutoTestVO" :multiFields="true"
                                  v-if="stageName === 'ciPipelineAutoTestVO'">
                      <codemirror v-model="formData.ciPipelineAutoTestVO.script" :options="groovyOption"></codemirror>
                    </el-form-item> -->
                    <el-form-item label="手工确认：" labelWidth="220px" v-show="stageName === 'ciPipelineAutoTestVO'">
                      <el-checkbox v-model="formData.ciPipelineAutoTestVO.inputChecked"></el-checkbox>
                    </el-form-item>

                    <!--上传测试报告-->
                    <el-form-item label="脚本：" labelWidth="160px" prop="uploadUnitTestReportAndAutoTestReport.script"
                                  v-show="stageName === 'uploadUnitTestReportAndAutoTestReport' && false">
                      <el-input size="mini-extral" v-model="formData.uploadUnitTestReportAndAutoTestReport.script"></el-input>
                    </el-form-item>
                    <el-form-item label="手工确认：" v-show="stageName === 'uploadUnitTestReportAndAutoTestReport'">
                      <el-checkbox v-model="formData.uploadUnitTestReportAndAutoTestReport.inputChecked"></el-checkbox>
                    </el-form-item>
                  </el-form>
                  <div class="stage-change-selection">
                    <span>删除结点 "{{currentStage.description}}"?</span>
                    <el-button size="mini-extral" type="danger" @click="handleClick($event, 'stage-remove')">删除</el-button>
                  </div>
                </div>
                <div class="stage-change-selection" v-else>
                  <!--:key="stageName"-->
                  <span>添加结点 "{{currentStage.description}}"?</span>
                  <el-button size="mini-extral" type="primary" @click="handleClick($event, 'stage-add')">添加</el-button>
                </div>
              </transition>
            </div>
          </div>
        </div>
        <div class="step step3">
          <div class="title">
            <span>3. 通知设置</span>
          </div>
          <div class="config">
            <el-form labelWidth="170px" size="mini" :model="formData" :rules="formDataRules" ref="config-info-form">
              <el-form-item label="通知类型：">
                <el-checkbox v-model="formData.noticeConfig.executeSuccess">每次Pipeline执行成功时通知</el-checkbox>
                <el-checkbox v-model="formData.noticeConfig.executeFail">每次Pipeline执行失败时通知</el-checkbox>
              </el-form-item>
              <el-form-item label="通知接收人：" prop="noticeConfig" :multiFields="true" :error="emailProps.errMsg">
                <div class="notice-email-list" v-if="formData.noticeConfig && formData.noticeConfig.noticeEmails.length > 0">
                  <el-tag
                          v-for="(item, index) in formData.noticeConfig.noticeEmails"
                          :key="index"
                          closable
                          type="success"
                          size="small"
                          @close="handleEmail($event, 'remove', item)"
                  >{{item}}</el-tag>
                </div>
                <div v-else style="height: 27px">空</div>
                <div class="notice-email-add">
                  <el-autocomplete ref="email-selector"
                          v-model="emailProps.emailToAdd"
                          :fetch-suggestions="querySearch"
                          placeholder="小写字符、数字、中划线，以字符数字开头，长度不超过63位"
                          @select="handleSelect"
                          @keydown.native.enter.prevent="handleSelect"
                  ></el-autocomplete>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div style="height: 60px;"></div>
      </div>
      <div class="footer">
        <el-button size="small" type="primary" @click="handleClick($event, 'save')" v-if="false">保存</el-button>
        <el-button size="small" type="primary" @click="handleClick($event, 'enable')" v-if="false">生效</el-button>
        <el-button size="small" type="primary" @click="handleClick($event, 'take-effect')">保存</el-button>
        <el-button size="small" type="primary" @click="handleClick($event, 'go-to-page-pipeline-records')" class="flex" v-if="false">
          <span>执行</span><i class="paas-icon-level-up" style="margin-left: 3px;"></i>
        </el-button>
        <el-button size="small" type="primary" @click="handleClick($event, 'back')" class="flex">
          <span>返回</span><i class="paas-icon-level-up" style="margin-left: 3px;"></i>
        </el-button>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
  @mixin common-scroll-style() {
    overflow: scroll;
    &::-webkit-scrollbar {
      width: 3px;
      background-color: transparent;
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
  .select-high{
    .el-select-dropdown__item {
      height: 58px;
      line-height: 28px;
    }
  }
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
        /*background: #f9f9f9;*/
        background-color: white;
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
            border: none;
            border-top: 1px solid #ddd;
            padding-bottom: 10px;
            & > span:first-child {
              border-left: 5px solid #ddd;
              padding-left: 5px;
            }
          }
          .config {
            padding-left: 10px;
          }
          &.step1 {
            .title {
              border-top-width: 0px;
            }
            .el-form {
              .el-select {
                width: 500px;
              }
              .el-input {
                max-width: 500px;
              }
              .el-form-item.webhook-config {
                .webhook-config-content {
                  display: flex;
                  .more-config {
                    flex: 1;
                  }
                  .el-input {
                    max-width: 500px;
                  }
                  .el-checkbox + .el-checkbox {
                    margin-left: 8px;
                  }
                  .el-form-item__label {
                    padding-right: 5px;
                  }
                  .el-checkbox-group {
                    display: inline-block;
                  }
                }
              }
            }
            @mixin expand-inline-form-item() {
              display: block;
              width: 100%;
              .el-form-item__label {
                float: left;
              }
              .el-form-item__content {
                display: block;
              }
            }
            .el-form {
              .el-form-item {
                width: 50%;
                float: left;
                &.big {
                  @include expand-inline-form-item;
                }
              }
            }
            .key, .value, .remark {
              word-wrap: break-word;
              word-break: break-all;
            }
            .delete {
              flex: none;
              float: right;
            }
            .key {
              padding-right: 3px;
            }
            .value {
              padding-left: 3px;
              padding-right: 3px;
            }
            .remark {
              padding-left: 6px;
            }
            .expand {
              margin-bottom: 10px;
              .el-form-item__content {
                margin-left: 0px !important;
                background-color: #F2F6FC;
                &:hover {
                  background-color: #EBEEF5;
                }
                text-align: center;
                &.more {
                }
              }
            }
          }
          &.step2 {
            .title {
              padding-bottom: 0px;
            }
            padding-bottom: 8px;
            .config {
              padding-top: 12px;
              .stage-list {
                /*padding-left: 28px;*/
                text-align: center;
                border: 1px solid #F2F6FC;
              }
              .config-list {
                margin-top: 20px;
                margin-right: 10px;
                .stage-config {
                  .el-form-item {
                    .el-form-item__label {
                      padding-right: 6px;
                    }
                  }
                  .el-form.union-form {
                    max-width: 900px;
                    margin: 0px auto;
                    .vue-codemirror {
                      width: 100%;
                      .CodeMirror {
                        height: 250px;
                      }
                    }
                    .el-form-item {
                      &.testAndSonarScript, &.mvnPackage-script, &.ciPipelineAutoTestVO {
                        .el-form-item__content {
                          line-height: 100%;
                        }
                      }
                      &.buildImage {
                        .el-select {
                          min-width: 500px;
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
                  .deployTestEnv, .deployBetaEnv {
                    font-size: 14px;
                    .service-info-container {
                      position: relative;
                      display: block;
                      width: 760px;
                      margin: 0px auto;
                      /*not used*/
                      .el-icon-refresh {
                        position: absolute;
                        top: 0px;
                        right: 20px;
                        font-size: 20px;
                        z-index: 10;
                        &:hover {
                          /*font-size: 16px;*/
                          color: #409EFF;
                          cursor: pointer;
                        }
                        &.loading {
                          pointer-events: none;
                          animation: rotating 1s linear infinite;
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
//  import AsyncValidator from 'async-validator';
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
  import paasServiceInfo from './components/service-info.vue';
  import commonUtils from 'assets/components/mixins/common-utils';

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
    'sonarCheck': {
      description: 'Sonar数据检查'
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
    'ciPipelineAutoTestVO': {
      description: '自动化测试'
    },
    'uploadUnitTestReportAndAutoTestReport': {
      description: '上传测试报告'
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
    mixins: [commonUtils],
    components: {pipelineStage, codemirror, paasServiceInfo},
    async created() {
      var goBack = false;
      this.pageType = this.$route.path === this.$net.page["profile/pipeline/modify"] ? 'modify' : 'add';

      const dataTransfer = this.$storeHelper.dataTransfer;
      // TODO: mock data
//      const dataTransfer = {"from":"/profile/pipeline/list","data":{"appId":4594}};
      if (dataTransfer) {
        if (this.pageType === 'modify') {
          switch (dataTransfer.from) {
            case this.$net.page["profile/pipeline/list"]:
              this.dataPassed.appId = dataTransfer['data']['appId'];
              break;
            default:
              goBack = true;
              break;
          }
        } else {
          switch (dataTransfer.from) {
            case this.$net.page["profile/pipeline/list"]:
              this.dataPassed.appId = dataTransfer['data']['appId'];
              break;
            default:
              goBack = true;
              break;
          }
        }
        this.$storeHelper.dataTransfer = null;
      }
      // get app info
      if (this.dataPassed.appId) {
        this.appInfo = this.$storeHelper.appInfoListOfGroup['appModelList'].find(it => {
          return it.appId == this.dataPassed.appId;
        });
        if (!this.appInfo) {
          goBack = true;
          this.$message.error('未找到应用相关信息！');
          console.log('appInfo not found');
        }
        this.formData.appId = this.dataPassed.appId;
      } else {
        goBack = true;
      }

      if (goBack) {
        this.$router.go(-1);
        return;
      }

      const pipelineInfoFromNet = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_stage_query, {
        query: {
          appId: this.formData.appId
        }
      });
      // if (pipelineInfoFromNet.hasOwnProperty('buildImage') && Array.isArray(pipelineInfoFromNet['buildImage']['basicImage'])) {
      //   // 可以不选择基础镜像
      //   pipelineInfoFromNet['buildImage']['basicImage'].unshift('');
      // }
      ['deployTestEnv', 'deployBetaEnv'].forEach(stage => {
        var applicationConfig = null;
        if (pipelineInfoFromNet.hasOwnProperty(stage) && pipelineInfoFromNet[stage]['applicationConfig']) {
          applicationConfig = pipelineInfoFromNet[stage]['applicationConfig'];
        }
      });
      this.pipelineInfoFromNet = pipelineInfoFromNet;
//      pipelineInfoFromNet

      const commonProp = {
        active: false
      };
      const stages = [
        'start',  //开始
        'download',  //下载代码
        'testAndSonarScript',  //sonar及单元测试
        'sonarCheck',  //Sonar数据检查
        'mvnPackage',  //打包
        'buildImage',  //制作镜像
        'deployTestEnv', //部署到测试环境
        'functionValidate',  //功能测试（人工验证）
        'deployBetaEnv',  //部署到联调环境
        'ciPipelineAutoTestVO',  //自动化测试
        'uploadUnitTestReportAndAutoTestReport', // 上传测试报告
        'end'
      ].map(key => {
        var result = null;
        if (['start', 'download', 'end'].indexOf(key) > -1) {
          result = Object.assign({name: key}, commonProp, STAGE_NAME_MAP[key]);
        } else {
          if (pipelineInfoFromNet.hasOwnProperty(key)) {
            // 如果从服务端返回的该节点数据为null, selected设为false
            if (!pipelineInfoFromNet[key]) {
              pipelineInfoFromNet[key] = {};
              pipelineInfoFromNet[key]['selected'] = false;
            }
            result = Object.assign({
              'selected': pipelineInfoFromNet[key]['selected']
            }, commonProp, {name: key}, STAGE_NAME_MAP[key]);
          } else {
            console.log(`prop ${key} is not found in response content!`);
          }
        }
        return result;
      }).filter(it => it);
      this.updateStageIndex(stages);
//      console.log(stages);
      this.stages = stages;
      // sync formData by netData
      this.syncFormDataByServerData(this.formData, this.pipelineInfoFromNet);
//      console.log(this.formData);
      // override appId
      this.formData.appId = this.dataPassed.appId;
     // console.log(this.formData.defList);
//      console.log(this.formData);
//      console.log(this.pipelineInfoFromNet);
    },
    mounted() {
      this.$nextTick(() => {
        this.stepNodeList = [].slice.call(this.$el.querySelectorAll('.sheet .nav-steps .step'));
        const step3Form = this.$el.querySelector('.step.step3 .config form');
        // preventDefault event submit for form in step3, why submit event is not triggered in other forms?
        step3Form.onsubmit = evt => {
          evt.preventDefault();
        };
      });
    },
    data() {
      return {
        // 页面类型：add or modify
        pageType: 'add',
        appInfo: null,
        dataPassed: {
          appId: null,
        },
        pipelineInfoFromNet: null,
        stages: [],
        stageName: '',
        // 当前stage（用于状态展示）的信息
        currentStage: null,
        // 当前stage（服务端返回）的信息
        currentStageNetInfo: null,
	
	      showMoreConfig: false,
        paramKey: '',
	      paramValue: '',
	      paramRemark: '',
	      formItemMsgForParam: '',
        
        formData: {
          appId: '',
          pipelineName: '',
          pipelineDescription: '',
          gitLabPath: '',
          gitLabBranch: '',
          webHooks: {
            selected: false,
            webHooksSelectedEvent: [],
            webHooksUrl: ''
          },
          // 自定义参数构建
          defList: [],
          // sonar及单元测试
          testAndSonarScript: {
            script: '',
            inputChecked: false,
            selected: false,
          },
          // sonar数据检查
          sonarCheck: {
            projectKeyWord: '',
            codeDebt: '',
            codeDebtSelected: false,
            unitTestRatio: '',
            unitTestSelected: false,
            inputChecked: false,
            selected: false,
          },
          // 打包
          mvnPackage: {
            script: '',
            inputChecked: false,
            selected: false,
          },
          // 制作镜像
          buildImage: {
            selectedImage: '',
            inputChecked: false,
            selected: false,
          },
          // 部署到测试环境
          deployTestEnv: {
            env: 'TEST',
            inputChecked: false,
            selected: false,
          },
          // 功能测试（人工验证）
          functionValidate: {
            selected: false,
          },
          // 部署到联调环境
          deployBetaEnv: {
            env: 'BETA',
            inputChecked: false,
            selected: false,
          },
          // 自动化测试
          ciPipelineAutoTestVO: {
            gitLabBranch: '', // gitlab分支 ,
            gitLabPath: '', // gitlab路径 SSH ,
            inputChecked: '', // 是否需要手工确认 ,
            itTestReportAddress: '', // 自动化覆盖率报告目录[相对地址即可] ,
            relativePath: '', // Gitlab父级pom.xml相对路径 ,
            script: '', // 脚本名称 ,
            selected: '', //节点是否选中
          },
          uploadUnitTestReportAndAutoTestReport: {
            script: '', // 脚本名称 ,
            inputChecked: '', // 是否需要手工确认 ,
            selected: '', //节点是否选中
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
          appId: {
            type: "number",
            required: true,
            message: '请选择目标应用',
            trigger: ['blur', 'change']
          },
          pipelineName: {
            type: "string",
            required: true,
            message: '请填写pipeline名称',
            trigger: ['blur']
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
                requiredOrigin: true,
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
                requiredOrigin: true,
                message: '请填写打包脚本'
              }]
            }
          },
          ciPipelineAutoTestVO: {
            type: 'object',
            fields: {
              gitLabBranch: [{
                type: "string",
                required: true,
                trigger: ['blur', 'change'],
                requiredOrigin: true,
                message: '请填写gitlab分支'
              }],
              gitLabPath: [{
                type: "string",
                required: true,
                requiredOrigin: true,
                trigger: ['blur', 'change'],
                message: '请填写ssh格式的gitlab路径'
              }],
              relativePath: [{
                type: "string",
                required: false,
                requiredOrigin: false,
                message: '请填写ssh格式的gitlab路径'
              }],
              itTestReportAddress: [{
                type: "string",
                required: true,
                trigger: ['blur', 'change'],
                requiredOrigin: true,
                message: '请填写自动化覆盖率报告路径[相对地址即可] '
              }],
              script: [{
                type: "string",
                required: true,
                trigger: ['blur', 'change'],
                requiredOrigin: true,
                message: '请填写脚本名称'
              }]
            }
          },
          uploadUnitTestReportAndAutoTestReport: {
            type: 'object',
            fields: {
              script: [{
                type: "string",
                required: false,
                trigger: ['blur', 'change'],
                requiredOrigin: false,
                message: '请填写脚本名称'
              }]
            }
          },
          sonarCheck: {
            type: 'object',
            fields: {
              projectKeyWord: [{
                type: "string",
                required: true,
                requiredOrigin: true,
                message: '请填写sonar关键字'
              }]
              // codeDebt
              // unitTestRatio
            }
          },
          noticeConfig: {
            type: 'object',
            required: false,
            trigger: ['blur', 'change'],
            fields: {
              // noticeEmails
            }
          },
          buildImage: {
            type: 'object',
            required: true,
            trigger: ['blur', 'change'],
            fields: {
              selectedImage: [{
                type: 'string',
                required: true,
                message: '请选择基础镜像',
              }]
            },
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
      pageJump(profileName) {
        const profileInfo = this.$storeHelper.getProfileInfoByName(profileName);
        const appId = this.formData.appId;
        const profileId = profileInfo ? profileInfo['id'] : null;
        if (appId && profileId) {
          window.open(`${location.origin}${this.$net.page['profile/service/modify']}${this.$utils.objectToQueryString({appId, profileId})}`, '_blank');
        } else {
          console.log(`appId or profileId not found`);
        }
//        console.log(profile);
//        console.log(profileInfo);
      },
	    handleParameter (action, key, value, remark) {
		    switch (action) {
			    case 'add':
				    // remove error notification first
				    this.formItemMsgForParam = '';
//            let keyReg = /^[A-Za-z0-9_\-\.@]{1,64}$/;
				    let keyReg = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
				    let valueReg = /^[A-Za-z0-9_\-\.@]{1,128}$/;
				    if (!keyReg.exec(key)) {
					    this.$message.error('64位以内的数字、字母、下划线，以字母或下划线开头');
					    return;
				    }
				    if (!valueReg.exec(value)) {
					    this.$message.error('请输入128位以内的数字、字母、中划线、下划线');
					    return;
				    }
				    
				    if (this.formData.defList.length >= 5) {
					    this.$message.error('最多输入5个');
					    return;
				    }
				    let itemWithKey = null;
				    this.formData.defList.some(it => {
					    if (it.key === key) {
						    itemWithKey = it;
					    }
					    return itemWithKey;
				    });
				    if (!itemWithKey) {
					    this.formData.defList.push({
						    name: key,
						    defaultValue: value,
						    description: remark,
					    });
					    this.paramKey = '';
					    this.paramValue = '';
					    this.paramRemark = '';
				    } else {
					    this.formItemMsgForParam = `Key "${itemWithKey.key}" 已经存在，如需更改，请删除后重新添加`;
				    }
				    break;
			    case 'delete':
				    let index = key;
				    this.formData.defList.splice(index, 1);
				    break;
		    }
	    },
      // 根据服务端数据更新formData
      syncFormDataByServerData(formData, netData) {
        // ignore key not need to overwrite
        var keyIgnore = [];
        if (this.pageType === 'add') {
          keyIgnore = keyIgnore.concat(['appId']);
        }
        const syncObject = (target, origin) => {
          for (let key in target) {
            if (keyIgnore.indexOf(key) > -1) {
              continue;
            }
            if (null !== origin[key]) {
              if (Array.isArray(origin[key])) {
//              console.log(origin[key]);
//              console.log(Array.isArray(origin[key]));
//              console.log(JSON.parse(JSON.stringify(origin[key])));
                target[key] = JSON.parse(JSON.stringify(origin[key]));
              } else if (this.$utils.isObject(origin[key])) {
                syncObject(target[key], origin[key]);
              } else {
                target[key] = origin[key];
              }
            } else {
//              if (this.$utils.isString(origin[key])) {
//                target[key] = !origin[key] ? '' : origin[key];
//              }
            }
          }
        };
        syncObject(formData, netData);
        this.postTreatFormData(formData, netData);
      },
      postTreatFormData(formData, netData) {
        const formWebHooks = formData.webHooks;
        const netWebHooks = netData.webHooks;
        /** 目前后端传过来的是数组（但前端会当字符串处理） */
        // 兼容多种触发webhook的方式
//        if (formWebHooks.webHooksSelectedEvent.length === 0 && netWebHooks && netWebHooks.webHooksEvent && netWebHooks.webHooksEvent.length > 0) {
//          formData.webHooks.webHooksSelectedEvent.push(netWebHooks.webHooksEvent[0]);
//        }
        if (netWebHooks && netWebHooks.webHooksEvent && netWebHooks.webHooksEvent.length > 0) {
          if (formWebHooks.webHooksSelectedEvent.length === 0) {
            formData.webHooks.webHooksSelectedEvent = netWebHooks.webHooksEvent[0];
          } else {
            formData.webHooks.webHooksSelectedEvent = formData.webHooks.webHooksSelectedEvent[0]
          }
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

      // for el-autocomplete
      querySearch(qs, cb) {
        var result = []
        if (!qs) {
          cb(result);
          return;
        }

        var [user, suffix] = qs.split('@');

        var suffixList = ['finupgroup.com', 'renmai.com', 'iqianjin.com'].filter(it => {
          if (!suffix) {
            return true;
          }
          return it.startsWith(suffix)
        });
        if (suffixList.length > 0) {
          result = suffixList.map(it => {
            return {
              value:`${user}@${it}`
            };
          });
        } else {
          result = [{
            value: qs
          }]
        }

        cb(result);
      },
      handleSelect(item) {
        var value = item instanceof KeyboardEvent ? this.emailProps.emailToAdd : (item && item.value ? item.value : '');
        if (value) {
          this.handleEmail(null, 'add', value);
        }
      },

      // 根据pipeline结点的选择情况，更新formRules
      updateFormDataRules() {
        // fix rules for 'testAndSonarScript', 'mvnPackage', 'autoSciPipelineAutoTestVOcript'
        var pipelineStageList = ['testAndSonarScript', 'mvnPackage', 'ciPipelineAutoTestVO', 'uploadUnitTestReportAndAutoTestReport'];//.concat(['sonarCheck']);
        pipelineStageList.forEach(it => {
          const required = this.formData[it]['selected'];
          this.formDataRules[it]['required'] = required;
          Object.keys(this.formDataRules[it]['fields']).forEach(key => {
            this.formDataRules[it]['fields'][key].forEach(it => {
              it['required'] = required ? it['requiredOrigin'] : required;
            });
          })
        });

        // fix rules for sonarCheck
        // sonarCheck可以不填，如果填写，格式必须正确，检查项包括：
        // 1. 单元测试覆盖率
        // 2. 技术债
        const validatorForUnitTestSelected = function(rule, values, callback) {
          var passed = false;
          try {
            if (typeof(values) === 'string' || values instanceof String) {
              values = parseFloat(values.trim());
            }
//          if (!values) {
//            passed = true;
//          } else
            if (/^[0-9]+$/.exec(values) && (values > 0 && values <= 100)) {
              passed = true;
            }
          } catch(err) {
            passed = false;
          }
          if (passed) {
            callback();
          } else {
            callback('请填写0-100之间的数字');
          }
        };
        const validatorForCodeDebtSelected = function (rule, values, callback) {
          var passed = false;
          try {
            if (typeof(values) === 'string' || values instanceof String) {
              values = parseFloat(values.trim());
            }
            if (/^[0-9]+$/.exec(values) && (values >= 0)) {
              passed = true;
            }
          } catch(err) {
            passed = false;
          }
          if (passed)  {
            callback();
          } else {
            callback('请填写大于0的数字');
          }
        };
        const sonarCheck = this.formData['sonarCheck'];
        const sonarCheckRules = this.formDataRules['sonarCheck']['fields'];
        if (!this.formData.sonarCheck.selected) {
          sonarCheckRules.projectKeyWord[0].required = false;
        }
        if (sonarCheck.codeDebtSelected) {
          sonarCheckRules['codeDebt'] = [{
            validator: validatorForCodeDebtSelected
          }]
        } else {
          delete sonarCheckRules['codeDebt']
        }
        if (sonarCheck.unitTestSelected) {
          sonarCheckRules['unitTestRatio'] = [{
            validator: validatorForUnitTestSelected
          }]
        } else {
          delete sonarCheckRules['unitTestRatio']
        }

        // fix rules for noticeConfig
        const validatorForNoticeConfig = function(rule, values, callback) {
          if (!Array.isArray(values)) {
            callback('格式不正确');
            return;
          }
          if (values.length === 0) {
            callback('请至少添加一个邮箱地址');
            return;
          }
          callback();
        };
        const noticeConfig = this.formData['noticeConfig'];
        const noticeConfigRules = this.formDataRules['noticeConfig'];
        // 如果选择了成功(失败)时通知，必须填写邮箱地址（邮箱为数组类型）
        if (noticeConfig.executeFail || noticeConfig.executeSuccess) {
          noticeConfigRules.required = true;
          noticeConfigRules['fields']['noticeEmails'] = [{
            validator: validatorForNoticeConfig
          }]
        } else {
          noticeConfigRules.required = false;
          delete noticeConfigRules['fields']['noticeEmails']
        }

//        console.log(this.formDataRules);
      },

      // 请求更新
      async requestUpdate() {
        try {
          await this.$confirm('保存pipeline配置？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          });
          // 前端逻辑按照字符串处理，为了兼容以后支持多种webhook，后端使用数组格式
          if (this.$utils.isString(this.formData.webHooks.webHooksSelectedEvent)) {
            this.formData.webHooks.webHooksSelectedEvent = [this.formData.webHooks.webHooksSelectedEvent]
          }
          this.formData.groupId = this.$storeHelper.currentGroupID;
          await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_add_or_update, {
            payload: this.formData
          });
          this.$message.success(`"${this.formData.pipelineName}"配置已更新！`);
        } catch (err) {}
      },

      // 处理按钮click事件
      async handleClick(evt, action) {
        const target = evt.target;
        const profileNameMap = {
          deployTestEnv: '测试环境',
          deployBetaEnv: '联调环境',
        };
        var stageChangeStatus = {
          success: true,
          reason: ''
        };
        var resContent = null;
        switch (action) {
	        case 'more-config':
		        this.showMoreConfig = !this.showMoreConfig;
		        // if (this.showMoreConfig) {
			      //   // this.scrollBottom();
            //   console.log("scrollBottom");
		        // } else {
			      //   // this.scrollTop();
			      //   console.log("scrollTop");
		        // }
		        break;
          case 'change-step':
            this.stepNodeList.forEach(it => {
              if (it.contains(target)) {
                it.classList.add('active');
              } else {
                it.classList.remove('active');
              }
            });
            break;
          case 'stage-add':
            switch (this.currentStage.name) {
              case 'buildImage':
                if (!this.findStageByName('mvnPackage')['selected']) {
                  stageChangeStatus.success = false;
                  stageChangeStatus.reason = `制作镜像依赖于打包，必须勾选打包步骤`;
                  break;
                }
                this.formDataRules.buildImage.fields.selectedImage[0].required = true;
                break;
              case 'deployTestEnv':
                if (!this.findStageByName('buildImage')['selected']) {
                  stageChangeStatus.success = false;
                  stageChangeStatus.reason = `部署到测试环境依赖于制作镜像，必须勾选制作镜像步骤`;
                }
                break;
              case 'deployBetaEnv':
                if (!this.findStageByName('buildImage')['selected']) {
                  stageChangeStatus.success = false;
                  stageChangeStatus.reason = `部署到联调环境依赖于制作镜像，必须勾选制作镜像步骤`;
                  break;
                }
                if (this.currentStageNetInfo['serviceStatus'] && this.currentStageNetInfo['applicationConfig']) {
                  stageChangeStatus.success = true;
                } else {
                  stageChangeStatus.success = false;
                  stageChangeStatus.reason = `当前应用无"${profileNameMap[this.currentStage.name]}"服务，无法添加结点"${this.currentStage.description}"`;
                }
                break;
              case 'sonarCheck':
                this.formDataRules.sonarCheck.fields.projectKeyWord[0].required = true;
                break;
              case 'testAndSonarScript':
                this.formDataRules.testAndSonarScript.fields.script[0].required = true;
                break;
              case 'mvnPackage':
                this.formDataRules.mvnPackage.fields.script[0].required = true;
                break;
            }
            if (stageChangeStatus.success) {
              this.currentStage['selected'] = true;
//              console.log(this.currentStage);
              this.updateStageIndex(this.stages);
              // this.$message.success(`添加结点 "${this.currentStage['name']}" 成功！`);
              this.formData[this.currentStage['name']]['selected'] = true;
            } else {
              this.$message.error(stageChangeStatus.reason);
            }
            break;
          case 'stage-remove':
            // 结点删除后，取消"手工确认"
            var currentStageName = this.currentStage.name;
            if (this.formData[currentStageName] && this.formData[currentStageName].hasOwnProperty('inputChecked')) {
              this.formData[currentStageName]['inputChecked'] = false;
            }
            switch (currentStageName) {
              case 'sonarCheck':
                this.formData.sonarCheck.codeDebtSelected = false;
                this.formData.sonarCheck.codeDebt = '';
                this.formData.sonarCheck.unitTestSelected = false;
                this.formData.sonarCheck.unitTestRatio = '';
                this.formDataRules.sonarCheck.fields.projectKeyWord[0].required = false;
                break;
              case 'mvnPackage':
                this.stages.forEach(it => {
                  if (['buildImage','deployTestEnv','deployBetaEnv'].indexOf(it['name']) > -1) {
                    it['selected'] = false;
                  }
                });
                this.formData.buildImage.selected = false;
                this.formData.deployTestEnv.selected = false;
                this.formData.deployBetaEnv.selected = false;
                this.formDataRules.mvnPackage.fields.script[0].required = false;
                break;
              case 'buildImage':
                this.stages.forEach(it => {
                  if (['deployTestEnv', 'deployBetaEnv'].indexOf(it['name']) > -1) {
                    it['selected'] = false;
                  }
                });
                this.formData.deployBetaEnv.selected = false;
                this.formData.deployTestEnv.selected = false;
                this.formDataRules.buildImage.fields.selectedImage[0].required = false;
                break;
            }
            this.currentStage['selected'] = false;
            this.updateStageIndex(this.stages);
            // this.$message.success(`删除结点 "${this.currentStage['name']}" 成功！`);
            this.formData[this.currentStage['name']]['selected'] = false;
            break;
          case 'testAndSonarScript':
            this.formDataRules.testAndSonarScript.fields.script[0].required = false;
            break;
          case 'save':
          case 'take-effect':
//            console.log(this.formData);
            const basicInfoForm = this.$refs['basic-info-form'];
            const configInfoForm = this.$refs['config-info-form'];
            this.updateFormDataRules();

            var validate = true;
            try {
              validate = await basicInfoForm.validate();
              if (this.$refs['pipeline-script-form']) {
                validate = await this.$refs['pipeline-script-form'].validate();
              }
              validate = await configInfoForm.validate();
              // 若选择Sonar数据检查，则至少要选择一个检查项
              if (this.formData.sonarCheck.selected) {
                if (!this.formData.sonarCheck.unitTestSelected && !this.formData.sonarCheck.codeDebtSelected) {
                  this.$message.error(`若选择Sonar数据检查，则至少要选择一个检查项`);
                  return;
                }
              }
              if ('take-effect' === action) {
                // 前端逻辑按照字符串处理，为了兼容以后支持多种webhook，后端使用数组格式
                if (this.$utils.isString(this.formData.webHooks.webHooksSelectedEvent)) {
                  this.formData.webHooks.webHooksSelectedEvent = [this.formData.webHooks.webHooksSelectedEvent]
                }
                this.formData.groupId = this.$storeHelper.currentGroupID;
                await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_take_effect, {
                  payload: this.formData
                });
                this.$message.success(`pipeline "${this.formData.pipelineName}" 的配置已生效！`);
                this.$router.go(-1);
              } else {
                this.requestUpdate();
              }
//              console.log(validate);
            } catch (err) {
//              console.log(err);
              if (Array.isArray(err) && err.length > 1) {
                var firstError = err[1];
                var firstFields = firstError[0]['field'];
                // such as ciPipelineAutoTestVO.script
                if (firstFields.indexOf('.') > -1) {
                  firstFields = firstFields.split('.')[0];
                }
                const pipelineStageList = ['testAndSonarScript', 'mvnPackage', 'buildImage', 'ciPipelineAutoTestVO',
                  'uploadUnitTestReportAndAutoTestReport', 'sonarCheck'];
                if (pipelineStageList.indexOf(firstFields) > -1) {
                  this.setActiveStageByName(firstFields);
                  // validate again to make sure show error message
                  this.$nextTick(() => {
                    this.$refs['pipeline-script-form'].validate(() => {});
                  });
                }
              } else {
                console.log(err);
              }
            }
            break;
          // TODO: not used
          case 'enable':
            await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_enable, {
              query: {
                appId: this.formData.appId
              }
            });
            this.$message.success(`"${this.formData.pipelineName}"配置已生效！`);
            break;
          case 'back':
            this.$router.go(-1);
            break;
          case 'go-to-page-pipeline-records':
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/pipeline/list'],
              data: {
                appId: this.appInfo['appId'],
                appName: this.appInfo['appName'],
                pipelineName: this.formData['pipelineName'],
              }
            };
            this.$router.push(this.$net.page['profile/pipeline/records']);
            break;
          case 'refresh_test_service_info':
          case 'refresh_beta_service_info':
            var serviceInfo = {
              refresh_test_service_info: {
                spaceName: 'test',
                stageName: 'deployTestEnv'
              },
              refresh_beta_service_info: {
                spaceName: 'beta',
                stageName: 'deployBetaEnv'
              }
            }[action];
            this.addToWaitingResponseQueue('refresh_service_info');
            try {
              var applicationConfig = await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_service_info_update, {
                params: {
                  appId: this.formData.appId
                },
                query: {
                  spaceName: serviceInfo['spaceName']
                }
              });

              // update pipelineInfoFromNet['buildImage']['basicImage'](autoImageList) if necessary
              if (['language', 'languageVersion', 'packageType'].some(key => {
                return this.pipelineInfoFromNet[serviceInfo.stageName]['applicationConfig'][key] != applicationConfig[key];
              })) {
                resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.auto_image_list, {
                  payload: {
                    groupTag: this.$storeHelper.groupInfo.tag,
                    appId: this.formData.appId,
                    language: applicationConfig.language,
                    languageVersion: applicationConfig.languageVersion,
                    packageType: applicationConfig.packageType,
                  }
                });
                this.pipelineInfoFromNet['buildImage']['basicImage'] = resContent['basicImage'];
                if (this.pipelineInfoFromNet['buildImage']['basicImage'].length > 0) {
                  this.pipelineInfoFromNet['buildImage']['selectedImage'] = this.pipelineInfoFromNet['buildImage']['basicImage'][0];
                }
              } else {
              }
              this.pipelineInfoFromNet[serviceInfo.stageName]['applicationConfig'] = applicationConfig;

              this.hideWaitingResponse('refresh_service_info');
            } catch (err) {
              this.hideWaitingResponse('refresh_service_info');
            }
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
        this.currentStageNetInfo = this.pipelineInfoFromNet[stage.name];
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
        switch (action) {
          case 'add':
            var emailToAdd = item;
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
            this.$nextTick(() => {
              this.$refs['email-selector'] && (this.$refs['email-selector'].suggestions = []);
            });
            break;
          case 'remove':
            if (emailList.indexOf(item) > -1) {
              emailList.splice(emailList.indexOf(item), 1);
            }
            break;
        }
      },
      findStageByName(stageName) {
        return this.stages.find(it => {
          return it['name'] == stageName;
        })
      }
    }
  }
</script>