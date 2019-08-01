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
              <el-form-item label="gitlab_ssh地址" prop="gitLabPath">
                <el-input size="mini-extral" v-model="formData.gitLabPath"></el-input>
              </el-form-item>
              <el-form-item label="gitlab分支" prop="gitLabBranch">
                <el-input size="mini-extral" v-model="formData.gitLabBranch" placeholder="请输入项目的gitLab分支，支持正表达式"></el-input>
              </el-form-item>
              <el-form-item label="webhook配置" v-if="pipelineInfoFromNet && pipelineInfoFromNet.webHooks" class="webhook-config big">
                <div class="webhook-config-content" :style="{color: formData.webHooks.selected ? 'inherit':'#b4bccc'}">
                  <div class="item">
                    <span>{{formData.webHooks.webHooksUrl}}</span>
                  </div>
                  <div class="item">
                    <label>hook类型</label>
                    <el-radio-group v-model="formData.webHooks.webHooksSelectedEvent" :disabled="!formData.webHooks.selected">
                      <el-radio v-for="(item, index) in pipelineInfoFromNet.webHooks.webHooksEvent" :label="item" :key="item">{{item}}</el-radio>
                    </el-radio-group>
                  </div>
                  <div class="item">
                    <label>目标分支</label>
                    <el-input size="mini" style="width: 160px;" placeholder="支持正则表达式"
                              v-model="formData.webHooks.hookBranch" :disabled="!formData.webHooks.selected"></el-input>
                  </div>
                  <div class="item">
                    <label>是否生效</label>
                    <el-switch v-model="formData.webHooks.selected"
                               active-color="#13ce66"
                               inactive-color="#ff4949"></el-switch>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="项目根目录" v-if="pipelineInfoFromNet">
                <span>{{pipelineInfoFromNet.relativePath ? pipelineInfoFromNet.relativePath : '---'}}</span>
              </el-form-item>

              <custom-slide-up-down :active="showMoreConfig" :duration="500" class="more-config" style="float: left; width: 100%">
                <el-form-item label="构建参数" prop="defList" class="environments big" :error="formItemMsgForParam" style="float: none">
                  <el-row class="title" style="font-size: 14px;">
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
                <el-form-item label="保留本次构建记录" labelWidth="140px" v-if="this.$storeHelper.getUserInfo('role') == '平台管理员'" style="float: none">
                  <el-switch v-model="formData.saveLastBuild"
                             active-color="#13ce66"
                             inactive-color="#ff4949"></el-switch>
                </el-form-item>
              </custom-slide-up-down>
              <el-form-item class="expand big">
                <div class="more" style="" @click="handleClick($event, 'more-config')">
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
              <!--<transition name="el-zoom-in-top">-->
                <div class="stage-config" v-show="currentStage.selected">
                  <!--:key="stageName"-->
                  <!--部署到[test]环境-->
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
                  <!--部署到[beta]环境-->
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
                    <!--utExecutedPath-->
                    <el-form-item label="执行脚本的相对目录：" labelWidth="180px" v-show="stageName === 'testAndSonarScript'">
                      <el-input v-model="formData.testAndSonarScript.utExecutedPath" style="max-width: 500px">
                        <template slot="prepend" v-if="formRelated.testAndSonarScript.scriptPrefix">{{formRelated.testAndSonarScript.scriptPrefix}}</template>
                      </el-input>
                    </el-form-item>
                    <!--sonar及单元测试-->
                    <el-form-item label="Sonar及单元测试脚本：" labelWidth="180px" class="testAndSonarScript"
                                  prop="testAndSonarScript" :multiFields="true"
                                  v-show="stageName === 'testAndSonarScript'">
                      <codemirror v-model="formData.testAndSonarScript.script" :options="groovyOption" ref="codemirror-sonar-and-unit-test"></codemirror>
                    </el-form-item>
                    <!--sonar及单元测试-->
                    <el-form-item label="手工确认：" labelWidth="180px" v-show="stageName === 'testAndSonarScript'">
                      <el-checkbox v-model="formData.testAndSonarScript.inputChecked"></el-checkbox>
                    </el-form-item>
                    <!--sonar数据检查-->
                    <el-form-item label="Sonar关键字：" class="sonarCheck"
                                  prop="sonarCheck.projectKeyWord"
                                  v-show="stageName === 'sonarCheck'">
                      <el-input v-model="formData.sonarCheck.projectKeyWord" style="max-width: 500px"
                                type="textarea" :rows="5"></el-input>
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
                    <div class="el-form-item el-form-item--mini sonarCheck" v-show="stageName === 'sonarCheck'">
                      <div class="el-form-item__label" style="width: 120px; float: left; z-index: 11">
                        <span>检查项：</span>
                      </div>
                      <div class="el-form-item__content" style="margin-left: 120px;">
                        <div class="message-tip">当</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheck.unitTestRatio">
                          <div>
                            <el-checkbox v-model="formData['sonarCheck']['unitTestSelected']"></el-checkbox>
                            <span>单元测试行覆盖率≥</span>
                            <el-input v-model="formData.sonarCheck.unitTestRatio" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>%</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheck.branchCoverage">
                          <div>
                            <el-checkbox v-model="formData['sonarCheck']['branchCoverageSelected']"></el-checkbox>
                            <span>单元测试条件覆盖率≥</span>
                            <el-input v-model="formData.sonarCheck.branchCoverage" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>%</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheck.itLineCoverage">
                          <div>
                            <el-checkbox v-model="formData['sonarCheck']['itLineCoverageSelected']"></el-checkbox>
                            <span>集成测试行覆盖率≥</span>
                            <el-input v-model="formData.sonarCheck.itLineCoverage" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>%</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheck.itBranchCoverage">
                          <div>
                            <el-checkbox v-model="formData['sonarCheck']['itBranchCoverageSelected']"></el-checkbox>
                            <span>集成测试条件覆盖率≥</span>
                            <el-input v-model="formData.sonarCheck.itBranchCoverage" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>%</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheck.blockerViolations">
                          <div>
                            <el-checkbox v-model="formData['sonarCheck']['blockerViolationsSelected']"></el-checkbox>
                            <span>阻断问题数量≤</span>
                            <el-input v-model="formData.sonarCheck.blockerViolations" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>个</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheck.criticalViolations">
                          <div>
                            <el-checkbox v-model="formData['sonarCheck']['criticalViolationsSelected']"></el-checkbox>
                            <span>严重问题数量≤</span>
                            <el-input v-model="formData.sonarCheck.criticalViolations" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>个</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheck.majorViolations">
                          <div>
                            <el-checkbox v-model="formData['sonarCheck']['majorViolationsSelected']"></el-checkbox>
                            <span>主要问题数量≤</span>
                            <el-input v-model="formData.sonarCheck.majorViolations" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>个</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheck.minorViolations">
                          <div>
                            <el-checkbox v-model="formData['sonarCheck']['minorViolationsSelected']"></el-checkbox>
                            <span>次要问题数量≤</span>
                            <el-input v-model="formData.sonarCheck.minorViolations" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>个</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheck.codeDebt">
                          <div>
                            <el-checkbox v-model="formData['sonarCheck']['codeDebtSelected']"></el-checkbox>
                            <span>技术债时间≤</span>
                            <el-input v-model="formData.sonarCheck.codeDebt" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>分钟</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip" style="line-height: 28px;">时通过，反之不通过。</div>
                      </div>
                    </div>
                    <!--sonar数据检查-->
                    <el-form-item label="手工确认：" v-show="stageName === 'sonarCheck'">
                      <el-checkbox v-model="formData.sonarCheck.inputChecked"></el-checkbox>
                    </el-form-item>
                    <!--打包-->
                    <el-form-item label="打包脚本：" class="mvnPackage-script" prop="mvnPackage" :multiFields="true"
                                  v-show="stageName === 'mvnPackage'">
                      <codemirror v-model="formData.mvnPackage.script" :options="groovyOption" ref="codemirror-mvn-package"></codemirror>
                    </el-form-item>
                    <!--打包-->
                    <el-form-item label="手工确认：" v-show="stageName === 'mvnPackage'">
                      <el-checkbox v-model="formData.mvnPackage.inputChecked"></el-checkbox>
                    </el-form-item>
                    <!--制作镜像-->
                    <el-form-item label="基础镜像：" class="buildImage" v-show="stageName === 'buildImage'" prop="buildImage" :multiFields="true">
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
                    <!--部署到[test]环境-->
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

                    <!--自动化测试[test]-start-->
                    <el-form-item label="gitlab_ssh地址：" labelWidth="220px" prop="ciPipelineAutoTestVOTest.gitLabPath"
                                  v-show="stageName === 'ciPipelineAutoTestVOTest'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVOTest.gitLabPath"></el-input>
                    </el-form-item>
                    <el-form-item label="gitlab分支：" labelWidth="220px" prop="ciPipelineAutoTestVOTest.gitLabBranch"
                                  v-show="stageName === 'ciPipelineAutoTestVOTest'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVOTest.gitLabBranch"></el-input>
                    </el-form-item>
                    <el-form-item label="自动化覆盖率报告路径：" labelWidth="220px" prop="ciPipelineAutoTestVOTest.itTestReportAddress"
                                  v-show="stageName === 'ciPipelineAutoTestVOTest'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVOTest.itTestReportAddress"></el-input>
                    </el-form-item>
                    <el-form-item label="项目根目录：" labelWidth="220px" prop="ciPipelineAutoTestVOTest.relativePath"
                                  v-show="stageName === 'ciPipelineAutoTestVOTest'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVOTest.relativePath"
                                placeholder="不能超过256个字符，不能以/开头"></el-input>
                    </el-form-item>
                    <el-form-item label="jacoco includes：" labelWidth="220px"
                                  v-show="stageName === 'ciPipelineAutoTestVOTest'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVOTest.includes"></el-input>
                    </el-form-item>
                    <el-form-item label="脚本：" labelWidth="220px" prop="ciPipelineAutoTestVOTest.script"
                                  v-show="stageName === 'ciPipelineAutoTestVOTest'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVOTest.script"></el-input>
                    </el-form-item>
                    <el-form-item label="手工确认：" labelWidth="220px" v-show="stageName === 'ciPipelineAutoTestVOTest'">
                      <el-checkbox v-model="formData.ciPipelineAutoTestVOTest.inputChecked"></el-checkbox>
                    </el-form-item>
                    <!--自动化测试[test]-end-->

                    <!--部署到[beta]环境-->
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
                    <!--自动化测试[beta]-start-->
                    <el-form-item label="gitlab_ssh地址：" labelWidth="220px" prop="ciPipelineAutoTestVO.gitLabPath"
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
                    <el-form-item label="项目根目录：" labelWidth="220px" prop="ciPipelineAutoTestVO.relativePath"
                      v-show="stageName === 'ciPipelineAutoTestVO'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVO.relativePath"
                                placeholder="不能超过256个字符，不能以/开头"></el-input>
                    </el-form-item>
                    <el-form-item label="jacoco includes：" labelWidth="220px"
                                  v-show="stageName === 'ciPipelineAutoTestVO'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVO.includes"></el-input>
                    </el-form-item>
                    <el-form-item label="脚本：" labelWidth="220px" prop="ciPipelineAutoTestVO.script"
                      v-show="stageName === 'ciPipelineAutoTestVO'">
                      <el-input size="mini-extral" v-model="formData.ciPipelineAutoTestVO.script"></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="自动化测试：" class="ciPipelineAutoTestVO" prop="ciPipelineAutoTestVO" :multiFields="true"
                                  v-show="stageName === 'ciPipelineAutoTestVO'">
                      <codemirror v-model="formData.ciPipelineAutoTestVO.script" :options="groovyOption"></codemirror>
                    </el-form-item> -->
                    <el-form-item label="手工确认：" labelWidth="220px" v-show="stageName === 'ciPipelineAutoTestVO'">
                      <el-checkbox v-model="formData.ciPipelineAutoTestVO.inputChecked"></el-checkbox>
                    </el-form-item>
                    <!--自动化测试[beta]-end-->

                    <!--上传覆盖率数据-->
                    <el-form-item v-show="stageName === 'uploadUnitTestReportAndAutoTestReport'" labelWidth="0px" class="message-show">
                      <div style="color: #eb9e05; font-size: 12px; line-height: 16px; text-align: left; padding: 0px 60px;">
                        <i class="el-icon-warning"></i>
                        <span>此结点用于同时上传前面"sonar及单元测试"结点生成的单测覆盖率报告以及"自动化测试"结点生成的集成覆盖率报告，上传成功后，可在 Sonar 中查看覆盖率及 Sonar 检查报告</span>
                      </div>
                    </el-form-item>
                    <el-form-item label="自动化覆盖率报告读取结点：" labelWidth="200px" prop="uploadUnitTestReportAndAutoTestReport.uploadAutoTestReportNode"
                                  v-show="stageName === 'uploadUnitTestReportAndAutoTestReport'">
                      <el-radio-group v-model="formData.uploadUnitTestReportAndAutoTestReport.uploadAutoTestReportNode">
                        <!--<el-radio v-for="(item, index) in [{name: 'test', description: '测试环境'}, {name: 'beta', description: '联调环境'}]"-->
                                  <!--:label="item.name" :key="index">{{item.description}}</el-radio>-->
                        <el-radio label="test" :disabled="!formData.ciPipelineAutoTestVOTest.selected">测试环境</el-radio>
                        <el-radio label="beta" :disabled="!formData.ciPipelineAutoTestVO.selected">联调环境</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="脚本：" labelWidth="200px" prop="uploadUnitTestReportAndAutoTestReport.script"
                                  v-show="stageName === 'uploadUnitTestReportAndAutoTestReport'">
                      <el-input size="mini-extral" v-model="formData.uploadUnitTestReportAndAutoTestReport.script"></el-input>
                    </el-form-item>
                    <el-form-item label="手工确认：" labelWidth="200px" v-show="stageName === 'uploadUnitTestReportAndAutoTestReport'">
                      <el-checkbox v-model="formData.uploadUnitTestReportAndAutoTestReport.inputChecked"></el-checkbox>
                    </el-form-item>

                    <!--sonar数据检查3-->
                    <el-form-item label="Sonar关键字：" class="sonarCheckAutoTestScript"
                                  prop="sonarCheckAutoTestScript.projectKeyWord"
                                  v-show="stageName === 'sonarCheckAutoTestScript'">
                      <el-input v-model="formData.sonarCheckAutoTestScript.projectKeyWord" style="max-width: 500px"
                                type="textarea" :rows="5"></el-input>
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
                    <div class="el-form-item el-form-item--mini sonarCheckAutoTestScript" v-show="stageName === 'sonarCheckAutoTestScript'">
                      <div class="el-form-item__label" style="width: 120px; float: left; z-index: 11">
                        <span>检查项：</span>
                      </div>
                      <div class="el-form-item__content" style="margin-left: 120px;">
                        <div class="message-tip">当</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheckAutoTestScript.unitTestRatio">
                          <div>
                            <el-checkbox v-model="formData['sonarCheckAutoTestScript']['unitTestSelected']"></el-checkbox>
                            <span>单元测试行覆盖率≥</span>
                            <el-input v-model="formData.sonarCheckAutoTestScript.unitTestRatio" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>%</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheckAutoTestScript.branchCoverage">
                          <div>
                            <el-checkbox v-model="formData['sonarCheckAutoTestScript']['branchCoverageSelected']"></el-checkbox>
                            <span>单元测试条件覆盖率≥</span>
                            <el-input v-model="formData.sonarCheckAutoTestScript.branchCoverage" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>%</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheckAutoTestScript.itLineCoverage">
                          <div>
                            <el-checkbox v-model="formData['sonarCheckAutoTestScript']['itLineCoverageSelected']"></el-checkbox>
                            <span>集成测试行覆盖率≥</span>
                            <el-input v-model="formData.sonarCheckAutoTestScript.itLineCoverage" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>%</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheckAutoTestScript.itBranchCoverage">
                          <div>
                            <el-checkbox v-model="formData['sonarCheckAutoTestScript']['itBranchCoverageSelected']"></el-checkbox>
                            <span>集成测试条件覆盖率≥</span>
                            <el-input v-model="formData.sonarCheckAutoTestScript.itBranchCoverage" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>%</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheckAutoTestScript.blockerViolations">
                          <div>
                            <el-checkbox v-model="formData['sonarCheckAutoTestScript']['blockerViolationsSelected']"></el-checkbox>
                            <span>阻断问题数量≤</span>
                            <el-input v-model="formData.sonarCheckAutoTestScript.blockerViolations" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>个</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheckAutoTestScript.criticalViolations">
                          <div>
                            <el-checkbox v-model="formData['sonarCheckAutoTestScript']['criticalViolationsSelected']"></el-checkbox>
                            <span>严重问题数量≤</span>
                            <el-input v-model="formData.sonarCheckAutoTestScript.criticalViolations" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>个</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheckAutoTestScript.majorViolations">
                          <div>
                            <el-checkbox v-model="formData['sonarCheckAutoTestScript']['majorViolationsSelected']"></el-checkbox>
                            <span>主要问题数量≤</span>
                            <el-input v-model="formData.sonarCheckAutoTestScript.majorViolations" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>个</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheckAutoTestScript.minorViolations">
                          <div>
                            <el-checkbox v-model="formData['sonarCheckAutoTestScript']['minorViolationsSelected']"></el-checkbox>
                            <span>次要问题数量≤</span>
                            <el-input v-model="formData.sonarCheckAutoTestScript.minorViolations" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>个</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip">，且</div>
                        <el-form-item label="" labelWidth="0px" prop="sonarCheckAutoTestScript.codeDebt">
                          <div>
                            <el-checkbox v-model="formData['sonarCheckAutoTestScript']['codeDebtSelected']"></el-checkbox>
                            <span>技术债时间≤</span>
                            <el-input v-model="formData.sonarCheckAutoTestScript.codeDebt" size="mini-extral" style="max-width: 60px;"></el-input>
                            <span>分钟</span>
                          </div>
                        </el-form-item>
                        <div class="message-tip" style="line-height: 28px;">时通过，反之不通过。</div>
                      </div>
                    </div>
                    <!--sonar数据检查3-->
                    <el-form-item label="手工确认：" v-show="stageName === 'sonarCheckAutoTestScript'">
                      <el-checkbox v-model="formData.sonarCheckAutoTestScript.inputChecked"></el-checkbox>
                    </el-form-item>
                  </el-form>
                  <div class="stage-change-selection">
                    <span>删除结点 "{{Array.isArray(currentStage.description) ? currentStage.description.join('') : currentStage.description}}"?</span>
                    <el-button size="mini-extral" type="danger" @click="handleStageActiveChange($event, 'stage-remove')">删除</el-button>
                  </div>
                </div>
                <div class="stage-change-selection" v-show="!currentStage.selected">
                  <!--:key="stageName"-->
                  <span>添加结点 "{{Array.isArray(currentStage.description) ? currentStage.description.join('') : currentStage.description}}"?</span>
                  <el-button size="mini-extral" type="primary" @click="handleStageActiveChange($event, 'stage-add')">添加</el-button>
                </div>
              <!--</transition>-->
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
        <el-button size="small" type="primary" @click="handleClick($event, 'save-and-go-to-page-pipeline-records')" class="flex" v-if="true">
          <span>保存并跳转到执行页面</span><i class="paas-icon-level-up" style="margin-left: 3px;"></i>
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
        padding: 10px 4px;
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
              .el-form-item {
                &.webhook-config {
                  .webhook-config-content {
                    display: flex;
                    align-items: center;
                    .item {
                      margin-left: 12px;
                      & > label {
                        color: black;
                        font-weight: bold;
                        font-size: 14px;
                        line-height: 24px;
                        vertical-align: middle;
                      }
                    }
                    .el-input {
                      max-width: 500px;
                    }
                    .el-radio + .el-radio {
                      margin-left: 8px;
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
                &.expand {
                  margin-bottom: 0px;
                  .el-form-item__content {
                    margin-left: 0px !important;
                    line-height: 20px;
                    text-align: center;
                    .more {
                      margin: 0px -2px 0px -10px;
                      font-size: 12px;
                      line-height: 20px;
                      background-color: #eee;
                      &:hover {
                        background-color: #ddd;
                        cursor: pointer;
                      }
                    }
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
                      &.testAndSonarScript, &.mvnPackage-script, &.ciPipelineAutoTestVO, &.ciPipelineAutoTestVOTest {
                        .el-form-item__content {
                          line-height: 100%;
                        }
                      }
                      &.buildImage {
                        .el-select {
                          min-width: 500px;
                        }
                      }
                      &.sonarCheck, &.sonarCheckAutoTestScript {
                        .el-form-item {
                          display: inline-block;
                        }
                        .message-tip {
                          display: inline-block;
                          margin-bottom: 14px;
                        }
                        .sonarCheck-unitTestRatio, .sonarCheck-codeDebt {
                        }
                        .sonarCheck-unitTestRatio {
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
        z-index: 100;
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
  // import "codemirror/addon/display/autorefresh";
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
      description: '部署到[test]环境'
    },
    'ciPipelineAutoTestVOTest': {
      description: ['自动化测试[test]']
    },
    'uploadUnitTestReportAndAutoTestReport': {
      description: '上传覆盖率数据'
    },
    'functionValidate': {
      description: '功能测试（人工验证）'
    },
    'deployBetaEnv': {
      description: '部署到[beta]环境'
    },
    'ciPipelineAutoTestVO': {
      description: ['自动化测试[beta]']
    },
    'sonarCheckAutoTestScript': {
      description: 'Sonar数据检查'
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
        'deployTestEnv', //部署到[test]环境
        'ciPipelineAutoTestVOTest',  //自动化测试[test]
        'functionValidate',  //功能测试（人工验证）
        'deployBetaEnv',  //部署到[beta]环境
        'ciPipelineAutoTestVO',  //自动化测试[beta]
        'uploadUnitTestReportAndAutoTestReport', // 上传覆盖率数据
        'sonarCheckAutoTestScript',  //Sonar数据检查
        'end'
      ].map(key => {
        var result = null;
        if (['start', 'download', 'end'].indexOf(key) > -1) {
          result = Object.assign({name: key}, commonProp, STAGE_NAME_MAP[key]);
        } else {
          if (pipelineInfoFromNet.hasOwnProperty(key)) {
            // 如果从服务端返回的该结点数据为null, selected设为false
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
            hookBranch: '',
            webHooksUrl: ''
          },
          // 保留最后一次构建记录
          saveLastBuild: false,
          // 自定义参数构建
          defList: [],
          // sonar及单元测试
          testAndSonarScript: {
            script: '',
            inputChecked: false,
            selected: false,
            // 执行脚本的相对目录
            utExecutedPath: ''
          },
          // sonar数据检查
          sonarCheck: {
            selected: false,
            inputChecked: false,
            projectKeyWord: '',
            // 单元测试覆盖率
            unitTestRatio: '',
            unitTestSelected: false,
            // 单元测试条件覆盖率
            branchCoverageSelected: false,
            branchCoverage: '',
            // 集成测试行覆盖率
            itLineCoverage: '',
            itLineCoverageSelected: false,
            // 集成测试条件覆盖率
            itBranchCoverageSelected: false,
            itBranchCoverage: '',
            // 阻断问题数量
            blockerViolations: '',
            blockerViolationsSelected: false,
            // 严重问题数量
            criticalViolations: '',
            criticalViolationsSelected: false,
            // 主要问题数量
            majorViolations: '',
            majorViolationsSelected: false,
            // 次要问题数量
            minorViolations: '',
            minorViolationsSelected: false,
            // 技术债时间
            codeDebt: '',
            codeDebtSelected: false,
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
          // 部署到[test]环境
          deployTestEnv: {
            env: 'TEST',
            inputChecked: false,
            selected: false,
          },
          // 自动化测试[test]
          ciPipelineAutoTestVOTest: {
            gitLabBranch: '', // gitlab分支 ,
            gitLabPath: '', // gitlab路径 SSH ,
            inputChecked: '', // 是否需要手工确认 ,
            itTestReportAddress: '', // 自动化覆盖率报告目录[相对地址即可] ,
            relativePath: '', // Gitlab父级pom.xml相对路径 ,
            script: '', // 脚本名称 ,
            includes: '',
            selected: '', //结点是否选中
          },
          // 功能测试（人工验证）
          functionValidate: {
            selected: false,
          },
          // 部署到[beta]环境
          deployBetaEnv: {
            env: 'BETA',
            inputChecked: false,
            selected: false,
          },
          // 自动化测试[beta]
          ciPipelineAutoTestVO: {
            gitLabBranch: '', // gitlab分支 ,
            gitLabPath: '', // gitlab路径 SSH ,
            inputChecked: '', // 是否需要手工确认 ,
            itTestReportAddress: '', // 自动化覆盖率报告目录[相对地址即可] ,
            relativePath: '', // 项目根目录 ,
            script: '', // 脚本名称 ,
            includes: '',
            selected: '', //结点是否选中
          },
          uploadUnitTestReportAndAutoTestReport: {
            script: '', // 脚本名称 ,
            uploadAutoTestReportNode: '',
            inputChecked: '', // 是否需要手工确认 ,
            selected: '', //结点是否选中
          },
          // sonar数据检查
          sonarCheckAutoTestScript: {
            selected: false,
            inputChecked: false,
            projectKeyWord: '',
            // 单元测试覆盖率
            unitTestRatio: '',
            unitTestSelected: false,
            // 单元测试条件覆盖率
            branchCoverageSelected: false,
            branchCoverage: '',
            // 集成测试行覆盖率
            itLineCoverage: '',
            itLineCoverageSelected: false,
            // 集成测试条件覆盖率
            itBranchCoverageSelected: false,
            itBranchCoverage: '',
            // 阻断问题数量
            blockerViolations: '',
            blockerViolationsSelected: false,
            // 严重问题数量
            criticalViolations: '',
            criticalViolationsSelected: false,
            // 主要问题数量
            majorViolations: '',
            majorViolationsSelected: false,
            // 次要问题数量
            minorViolations: '',
            minorViolationsSelected: false,
            // 技术债时间
            codeDebt: '',
            codeDebtSelected: false,
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
        formRelated: {
          testAndSonarScript: {
            scriptPrefix: ''
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
          ciPipelineAutoTestVOTest: {
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
              }, {
                validator: this.$utils.generateCountValidator(false, 0, 256)
              }, {
                validator(rule, values, callback) {
                  values = values.trim();
                  if (!values) {
                    callback();
                  } else {
                    if (values.startsWith('/')) {
                      callback('不能以/开头');
                    } else {
                      callback();
                    }
                  }
                }
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
              }, {
                trigger: ['blur', 'change'],
                validator: this.$utils.generateCountValidator(false, 0, 256)
              }, {
                trigger: ['blur', 'change'],
                validator(rule, values, callback) {
                  values = values.trim();
                  if (!values) {
                    callback();
                  } else {
                    if (values.startsWith('/')) {
                      callback('不能以/开头');
                    } else {
                      callback();
                    }
                  }
                }
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
              uploadAutoTestReportNode: [{
                type: "string",
                required: true,
                trigger: ['blur', 'change'],
                requiredOrigin: true,
                message: '请选择自动化覆盖率报告读取结点'
              }],
              script: [{
                type: "string",
                required: true,
                trigger: ['blur', 'change'],
                requiredOrigin: true,
                message: '脚本为必输项'
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
          sonarCheckAutoTestScript: {
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
      }
    },
    watch: {
      'emailProps.emailToAdd': function (value) {
        // remove errMsg if emailToAdd follows emailReg
        if (this.emailProps.errMsg && this.$utils.getReg('mail').exec(value)) {
          this.emailProps.errMsg = '';
        }
      },
      sonarCheckValue(value) {
        this.updateSonarCheckQuota('updateCheckedByValue', 'sonarCheck');
      },
      sonarCheckSelected() {
        this.updateSonarCheckQuota('updateValueByChecked', 'sonarCheck');
      },
      sonarCheckAutoTestScriptValue() {
        this.updateSonarCheckQuota('updateCheckedByValue', 'sonarCheckAutoTestScript');
      },
      sonarCheckAutoTestScriptSelect() {
        this.updateSonarCheckQuota('updateValueByChecked', 'sonarCheckAutoTestScript');
      }
    },
    computed: {
      sonarCheckValue() {
        return [
          'unitTestRatio',
          // 单元测试条件覆盖率
          'branchCoverage',
          // 集成测试行覆盖率
          'itLineCoverage',
          // 集成测试条件覆盖率
          'itBranchCoverage',
          // 阻断问题数量
          'blockerViolations',
          // 严重问题数量
          'criticalViolations',
          // 主要问题数量
          'majorViolations',
          // 次要问题数量
          'minorViolations',
          // 技术债时间
          'codeDebt',
        ].map(key => this.formData.sonarCheck[key]).join('');
      },
      sonarCheckSelected() {
        return [
          // 单元测试覆盖率
          'unitTestSelected',
          // 单元测试条件覆盖率
          'branchCoverageSelected',
          // 集成测试行覆盖率
          'itLineCoverageSelected',
          // 集成测试条件覆盖率
          'itBranchCoverageSelected',
          // 阻断问题数量
          'blockerViolationsSelected',
          // 严重问题数量
          'criticalViolationsSelected',
          // 主要问题数量
          'majorViolationsSelected',
          // 次要问题数量
          'minorViolationsSelected',
          // 技术债时间
          'codeDebtSelected'
        ].map(key => this.formData.sonarCheck[key]).join('');
      },
      sonarCheckAutoTestScriptValue() {
        return [
          'unitTestRatio',
          // 单元测试条件覆盖率
          'branchCoverage',
          // 集成测试行覆盖率
          'itLineCoverage',
          // 集成测试条件覆盖率
          'itBranchCoverage',
          // 阻断问题数量
          'blockerViolations',
          // 严重问题数量
          'criticalViolations',
          // 主要问题数量
          'majorViolations',
          // 次要问题数量
          'minorViolations',
          // 技术债时间
          'codeDebt',
        ].map(key => this.formData.sonarCheckAutoTestScript[key]).join('');
      },
      sonarCheckAutoTestScriptSelect() {
        return [
          // 单元测试覆盖率
          'unitTestSelected',
          // 单元测试条件覆盖率
          'branchCoverageSelected',
          // 集成测试行覆盖率
          'itLineCoverageSelected',
          // 集成测试条件覆盖率
          'itBranchCoverageSelected',
          // 阻断问题数量
          'blockerViolationsSelected',
          // 严重问题数量
          'criticalViolationsSelected',
          // 主要问题数量
          'majorViolationsSelected',
          // 次要问题数量
          'minorViolationsSelected',
          // 技术债时间
          'codeDebtSelected'
        ].map(key => this.formData.sonarCheckAutoTestScript[key]).join('');
      }

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

        var prefix = [];
        if (netData.gitLabPath) {
          let result = /\/([^\/]*)\.git *$/.exec(netData.gitLabPath);
          if (result.length === 2) {
            prefix.push(result[1])
          }
        }
        netData.relativePath && prefix.push(/^[ \/]*(.*?)[ \/]*$/.exec(netData.relativePath)[1])
        prefix.push('');
        this.formRelated.testAndSonarScript.scriptPrefix =  prefix.join('/');

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
        this.updateSonarCheckQuota('updateValueByChecked', 'sonarCheck');
        this.updateSonarCheckQuota('updateValueByChecked', 'sonarCheckAutoTestScript');
      },

      isSonarCheckSelected(sonarCheckName) {
        return [
          // 单元测试覆盖率
          'unitTestSelected',
          // 单元测试条件覆盖率
          'branchCoverageSelected',
          // 集成测试行覆盖率
          'itLineCoverageSelected',
          // 集成测试条件覆盖率
          'itBranchCoverageSelected',
          // 阻断问题数量
          'blockerViolationsSelected',
          // 严重问题数量
          'criticalViolationsSelected',
          // 主要问题数量
          'majorViolationsSelected',
          // 次要问题数量
          'minorViolationsSelected',
          // 技术债时间
          'codeDebtSelected'
        ].reduce((selected, key) => selected || this.formData[sonarCheckName][key], false);
      },
      /**
       * 自动更新sonarCheck相关属性
       * @param action, updateValueByChecked or updateCheckedByValue
       */
      updateSonarCheckQuota(action, whichSonarCheck = 'sonarCheck') {
        const sonarCheck = this.formData[whichSonarCheck];
        const updateValueByChecked = () => {
          !sonarCheck.unitTestSelected && (sonarCheck.unitTestRatio = '');
          !sonarCheck.branchCoverageSelected && (sonarCheck.branchCoverage = '');
          !sonarCheck.itLineCoverageSelected && (sonarCheck.itLineCoverage = '');
          !sonarCheck.itBranchCoverageSelected && (sonarCheck.itBranchCoverage = '');
          !sonarCheck.blockerViolationsSelected && (sonarCheck.blockerViolations = '');
          !sonarCheck.criticalViolationsSelected && (sonarCheck.criticalViolations = '');
          !sonarCheck.majorViolationsSelected && (sonarCheck.majorViolations = '');
          !sonarCheck.minorViolationsSelected && (sonarCheck.minorViolations = '');
          !sonarCheck.codeDebtSelected && (sonarCheck.codeDebt = '');
        };
        const updateCheckedByValue = () => {
          sonarCheck.unitTestSelected = String(sonarCheck.unitTestRatio).trim() !== '';
          sonarCheck.branchCoverageSelected = String(sonarCheck.branchCoverage).trim() !== '';
          sonarCheck.itLineCoverageSelected = String(sonarCheck.itLineCoverage).trim() !== '';
          sonarCheck.itBranchCoverageSelected = String(sonarCheck.itBranchCoverage).trim() !== '';
          sonarCheck.blockerViolationsSelected = String(sonarCheck.blockerViolations).trim() !== '';
          sonarCheck.criticalViolationsSelected = String(sonarCheck.criticalViolations).trim() !== '';
          sonarCheck.majorViolationsSelected = String(sonarCheck.majorViolations).trim() !== '';
          sonarCheck.minorViolationsSelected = String(sonarCheck.minorViolations).trim() !== '';
          sonarCheck.codeDebtSelected = String(sonarCheck.codeDebt).trim() !== '';
        };
        switch (action) {
          case 'updateValueByChecked':
            updateValueByChecked();
            break;
          case 'updateCheckedByValue':
            updateCheckedByValue();
            break;
          default:
            console.log(`action ${action} not found!`);
            break;
        }
        try {
          this.checkValidate();
        } catch (err) {}
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
        var pipelineStageList = ['testAndSonarScript', 'mvnPackage', 'ciPipelineAutoTestVO',  'ciPipelineAutoTestVOTest',
          'uploadUnitTestReportAndAutoTestReport'];//.concat(['sonarCheck']);
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
        const moreThanPercent = (rule, values, callback) => {
          var passed = false;
          try {
            values = String(values).trim();
            if (/^[0-9]+$/.test(values)) {
              values = parseInt(values);
              if (values > 0 && values <= 100) {
                passed = true;
              }
            }
          } catch(err) {
            passed = false;
          }
          if (passed)  {
            callback();
          } else {
            callback('请填写大于0小于等于100的整数');
          }
        };
        const integerMoreThanOrEqualZero = (rule, values, callback) => {
          var passed = false;
          try {
            values = String(values).trim();
            if (/^[0-9]+$/.test(values)) {
              values = parseInt(values);
              if (values >= 0) {
                passed = true;
              }
            }
          } catch(err) {
            passed = false;
          }
          if (passed)  {
            callback();
          } else {
            callback('请填写大于等于0的整数');
          }
        };
        // moreThanPercent(大于%多少): >0, <=100
        // integerMoreThanOrEqualZero(大于等于0的整数): >=0
        // sonar数据检测校验规则:
        const updateStageSonarCheck = (sonarCheckName) => {
          const sonarCheck = this.formData[sonarCheckName];
          const sonarCheckRules = this.formDataRules[sonarCheckName]['fields'];
          if (!sonarCheck.selected) {
            sonarCheckRules.projectKeyWord[0].required = false;
            ['unitTestRatio', 'branchCoverage', 'itLineCoverage', 'itBranchCoverage', 'blockerViolations', 'criticalViolations',
              'majorViolations', 'minorViolations', 'codeDebt'].forEach(key => {
              delete sonarCheckRules[key];
            })
          } else {
            sonarCheckRules.projectKeyWord[0].required = true;
            let keyMap = {
              'unitTestRatio': 'unitTestSelected',
              'branchCoverage': 'branchCoverageSelected',
              'itLineCoverage': 'itLineCoverageSelected',
              'itBranchCoverage': 'itBranchCoverageSelected',
              'blockerViolations': 'blockerViolationsSelected',
              'criticalViolations': 'criticalViolationsSelected',
              'majorViolations': 'majorViolationsSelected',
              'minorViolations': 'minorViolationsSelected',
              'codeDebt': 'codeDebtSelected'
            };
            let rulesMap = {
              'unitTestRatio': moreThanPercent,
              'branchCoverage': moreThanPercent,
              'itLineCoverage': moreThanPercent,
              'itBranchCoverage': moreThanPercent,
              'blockerViolations': integerMoreThanOrEqualZero,
              'criticalViolations': integerMoreThanOrEqualZero,
              'majorViolations': integerMoreThanOrEqualZero,
              'minorViolations': integerMoreThanOrEqualZero,
              'codeDebt': integerMoreThanOrEqualZero
            };
            for (let key in keyMap) {
              let value = keyMap[key];
              if (sonarCheck[value]) {
                sonarCheckRules[key] = [{
                  trigger: ['blur', 'change'],
                  validator: rulesMap[key]
                }];
              } else {
                delete sonarCheckRules[key];
              }
            }
          }
        };
        ['sonarCheck', 'sonarCheckAutoTestScript'].forEach(updateStageSonarCheck);

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
         // console.log(this.formData.sonarCheck);
         // console.log(this.formDataRules.sonarCheck);
      },

      async checkValidate() {
        this.updateFormDataRules();
        const basicInfoForm = this.$refs['basic-info-form'];
        const configInfoForm = this.$refs['config-info-form'];
        var validate = true;
        try {
          validate = await basicInfoForm.validate();
          if (this.$refs['pipeline-script-form']) {
            validate = await this.$refs['pipeline-script-form'].validate();
          }
          validate = await configInfoForm.validate();
          return Promise.resolve(validate);
        } catch (err) {
          return Promise.reject(err);
        }
      },

      // 处理按钮click事件
      async handleClick(evt, action) {
        const target = evt.target;
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
          case 'testAndSonarScript':
            this.formDataRules.testAndSonarScript.fields.script[0].required = false;
            break;
          case 'save':
          case 'take-effect':
            // console.log(this.formData);
            try {
              await this.checkValidate();
              this.formData.groupId = this.$storeHelper.currentGroupID;
              this.formData.ciPipelineAutoTestVO.relativePath = this.formData.ciPipelineAutoTestVO.relativePath.trim();
              this.formData.ciPipelineAutoTestVOTest.relativePath = this.formData.ciPipelineAutoTestVOTest.relativePath.trim();
              // 若选择Sonar数据检查，则至少要选择一个检查项
              if (this.formData.sonarCheck.selected && !this.isSonarCheckSelected('sonarCheck')) {
//                throw
                this.$message.error(`若选择Sonar数据检查，则至少要选择一个检查项`);
                throw [false, [{field: 'sonarCheck.*'}]];
              }
              if (this.formData.sonarCheckAutoTestScript.selected && !this.isSonarCheckSelected('sonarCheckAutoTestScript')) {
                this.$message.error(`若选择Sonar数据检查，则至少要选择一个检查项`);
                throw [false, [{field: 'sonarCheckAutoTestScript.*'}]];
              }
              // 前端逻辑按照字符串处理，为了兼容以后支持多种webhook，后端使用数组格式
              if (this.$utils.isString(this.formData.webHooks.webHooksSelectedEvent)) {
                this.formData.webHooks.webHooksSelectedEvent = [this.formData.webHooks.webHooksSelectedEvent]
              }
              await this.$net.requestPaasServer(this.$net.URL_LIST.pipeline_take_effect, {
                payload: this.formData
              });
              this.$message.success(`pipeline "${this.formData.pipelineName}" 的配置已生效！`);
              if ('take-effect' === action) {
                this.$router.go(-1);
              }
              return Promise.resolve();
              // console.log(`validate: ${validate}`);
            } catch (err) {
              // console.log(err);
              if (Array.isArray(err) && err.length > 1) {
                var firstError = err[1];
                var firstFields = firstError[0]['field'];
                // such as ciPipelineAutoTestVO.script
                if (firstFields.indexOf('.') > -1) {
                  firstFields = firstFields.split('.')[0];
                }
                const pipelineStageList = ['testAndSonarScript', 'mvnPackage', 'buildImage', 'ciPipelineAutoTestVO', 'ciPipelineAutoTestVOTest',
                  'uploadUnitTestReportAndAutoTestReport', 'sonarCheck', 'sonarCheckAutoTestScript'];
                if (pipelineStageList.indexOf(firstFields) > -1) {
                  this.setActiveStageByName(firstFields);
                  // validate again to make sure show error message
                  this.$nextTick(() => {
                    this.$refs.hasOwnProperty('pipeline-script-form') && this.$refs['pipeline-script-form'].validate(() => {});
                  });
                }
              } else {
                console.log(err);
              }
              return Promise.reject();
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
          case 'save-and-go-to-page-pipeline-records':
            try {
              await this.handleClick(evt, 'save');
              this.$storeHelper.dataTransfer = {
                from: this.$net.page['profile/pipeline/add'],
                data: {
                  appId: this.appInfo['appId'],
                  appName: this.appInfo['appName'],
                  pipelineName: this.formData['pipelineName'],
                }
              };
              this.$router.push(this.$net.page['profile/pipeline/records']);
            } catch(err) {}
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
      // 处理stage点击
      handleStageClick(evt, stage) {
        if (this.stageName === stage.name) {
          return;
        }
        // 不处理['开始', '下载代码', '结束']
        if (['start', 'download', 'end'].indexOf(stage.name) > -1) {
          return;
        }
        this.onStageClickOrChange();
        this.currentStage = stage;
        this.stageName = stage.name;
        this.currentStageNetInfo = this.pipelineInfoFromNet[stage.name];
        this.stages.forEach(it => {
          if (it !== stage) {
            it.active = false;
          }
        });
        // console.log(this.currentStage);
      },
      onStageClickOrChange() {
        // console.log(stage);
        for (let key in this.$refs) {
          setTimeout(() => {
            key.startsWith('codemirror-') && this.$refs[key] && this.$utils.isFunction(this.$refs[key].refresh) && this.$refs[key].refresh();
          }, 20);
        }
        this.updateFormDataRules();
      },

      // 处理stage的添加/删除

      // 删除逻辑：
      // "打包"结点删除后，"制作镜像"将会删除结点
      // "制作镜像"结点删除后，"部署到[test]环境"/"部署到[beta]环境"结点会被删除
      // "部署到[test]环境"删除后，"自动化测试[test]"结点将会删除
      // "部署到[beta]环境"删除后，"自动化测试[beta]"结点将会删除
      // "自动化测试[test]"结点 和 "自动化测试[beta]"结点 都删除后，"上传覆盖率数据"结点将会删除

      // 添加逻辑：
      // "自动化测试[test]"或 "自动化测试[beta]"结点添加后，才可以添加"上传覆盖率数据"结点

      // "上传覆盖率数据"结点的属性"自动化覆盖率报告读取结点"的默认值：
      //   新建pipeline时：如果"自动化测试[test]"结点 或 "自动化测试[beta]"结点只有一个被选中，则为选中结点对应的环境(test/beta)；如果两个结点都选中，默认选择test结点。
      //   修改pipeline时：同新建pipeline时
      handleStageActiveChange(evt, action, currentStageName) {
        const profileNameMap = {
          deployTestEnv: '测试环境',
          deployBetaEnv: '联调环境',
        };
        var stageChangeStatus = {
          success: true,
          reason: ''
        };
        currentStageName = currentStageName ? currentStageName : this.currentStage.name;
        switch (action) {
          case 'stage-add':
            switch (currentStageName) {
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
                  stageChangeStatus.reason = `部署到[test]环境依赖于制作镜像，必须勾选制作镜像步骤`;
                }
                break;
              case 'deployBetaEnv':
                if (!this.findStageByName('buildImage')['selected']) {
                  stageChangeStatus.success = false;
                  stageChangeStatus.reason = `部署到[beta]环境依赖于制作镜像，必须勾选制作镜像步骤`;
                  break;
                }
                if (this.currentStageNetInfo['serviceStatus'] && this.currentStageNetInfo['applicationConfig']) {
                  stageChangeStatus.success = true;
                } else {
                  stageChangeStatus.success = false;
                  stageChangeStatus.reason = `当前应用无"${profileNameMap[currentStageName]}"服务，无法添加结点"${this.currentStage.description}"`;
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
              case 'uploadUnitTestReportAndAutoTestReport':
                // "自动化测试[test]"或 "自动化测试[beta]"结点添加后，才可以添加"上传覆盖率数据"结点
                if (!this.formData.ciPipelineAutoTestVO.selected && !this.formData.ciPipelineAutoTestVOTest.selected) {
                  stageChangeStatus.success = false;
                  stageChangeStatus.reason = `"自动化测试[test]"或 "自动化测试[beta]"结点添加后，才可以添加"上传覆盖率数据"结点`;
                }
                break;
              case 'ciPipelineAutoTestVOTest':
              case 'ciPipelineAutoTestVO':
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
            if (this.formData[currentStageName] && this.formData[currentStageName].hasOwnProperty('inputChecked')) {
              this.formData[currentStageName]['inputChecked'] = false;
            }
            this.currentStage['selected'] = false;
            this.formData[this.currentStage['name']]['selected'] = false;
            switch (currentStageName) {
//              case 'sonarCheck':
//                this.formData.sonarCheck.codeDebtSelected = false;
//                this.formData.sonarCheck.codeDebt = '';
//                this.formData.sonarCheck.unitTestSelected = false;
//                this.formData.sonarCheck.unitTestRatio = '';
//                this.formDataRules.sonarCheck.fields.projectKeyWord[0].required = false;
//                break;
              case 'mvnPackage':
                // "打包"结点删除后，删除"制作镜像"结点
                this.stages.filter(it => ['buildImage'].indexOf(it['name']) > -1).forEach(it => it['selected'] = false);
                this.formData.buildImage.selected = false;
                this.handleStageActiveChange(evt, 'stage-remove', 'buildImage');
                break;
              case 'buildImage':
                // "制作镜像"结点删除后，"部署到[test]环境"/"部署到[beta]环境"结点会被删除
                this.stages.filter(it => ['deployTestEnv', 'deployBetaEnv'].indexOf(it['name']) > -1).forEach(it => it['selected'] = false);
                this.formData.deployBetaEnv.selected = false;
                this.formData.deployTestEnv.selected = false;
                break;
              case 'deployTestEnv':
                // "部署到[test]环境"删除后，"自动化测试[test]"结点将会删除
                this.stages.filter(it => ['ciPipelineAutoTestVOTest'].indexOf(it['name']) > -1).forEach(it => it['selected'] = false);
                this.formData.ciPipelineAutoTestVOTest.selected = false;
                this.handleStageActiveChange(evt, 'stage-remove', 'ciPipelineAutoTestVOTest');
                break;
              case 'deployBetatEnv':
                // "部署到[beta]环境"删除后，"自动化测试[beta]"结点将会删除
                this.stages.filter(it => ['ciPipelineAutoTestVO'].indexOf(it['name']) > -1).forEach(it => it['selected'] = false);
                this.formData.ciPipelineAutoTestVO.selected = false;
                this.handleStageActiveChange(evt, 'stage-remove', 'ciPipelineAutoTestVO');
                break;
              case 'ciPipelineAutoTestVOTest':
              case 'ciPipelineAutoTestVO':
                if (currentStageName === 'ciPipelineAutoTestVO' && this.formData.uploadUnitTestReportAndAutoTestReport.uploadAutoTestReportNode === 'beta') {
                  this.formData.uploadUnitTestReportAndAutoTestReport.uploadAutoTestReportNode = '';
                }
                if (currentStageName === 'ciPipelineAutoTestVOTest' && this.formData.uploadUnitTestReportAndAutoTestReport.uploadAutoTestReportNode === 'test') {
                  this.formData.uploadUnitTestReportAndAutoTestReport.uploadAutoTestReportNode = '';
                }
                // "自动化测试[test]"结点 和 "自动化测试[beta]"结点 都删除后，"上传覆盖率数据"结点将会删除
                if (!this.formData.ciPipelineAutoTestVO.selected && !this.formData.ciPipelineAutoTestVOTest.selected) {
                  this.stages.filter(it => ['uploadUnitTestReportAndAutoTestReport'].indexOf(it['name']) > -1).forEach(it => it['selected'] = false);
                  this.formData.uploadUnitTestReportAndAutoTestReport.selected = false;
                }
                break;
            }
            this.updateStageIndex(this.stages);
            // this.$message.success(`删除结点 "${this.currentStage['name']}" 成功！`);
            break;
        }
        // updateFormDataRules at active of Stage
        this.onStageClickOrChange();
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