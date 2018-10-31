<template>
  <div id="service-main">
    <div class="header">
      <el-row class="operation">
        <el-col :span="24" class="selector">
          <div class="item">
            <label style="float: left; width: 66px; line-height: 26px">应用名称:</label>
            <el-select filterable v-model="selectedAppID" placeholder="请选择"
                       style="display:block; min-width: 360px; margin-left: 66px;">
              <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.appName" :value="item.appId">
              </el-option>
            </el-select>
          </div>
          <div class="item" style="margin-left: 8px;">
            <label style="float: left; width: 66px; line-height: 26px">运行环境:</label>
            <el-select v-model="selectedProfileID" placeholder="请选择" style="display:block; max-width: 200px; margin-left: 66px;">
              <el-option v-for="item in currentProfileList" :key="item.id" :label="item.description" :value="item.id">
              </el-option>
            </el-select>
          </div>
        </el-col>
        <div class="el-col el-col-24 btn-list">
          <el-button
              size="mini-extral" type="primary"
              :class="{'disabled': $storeHelper.permission['service_create'].disabled}"
              @click="handleButtonClick($event, 'service_create')">
            添加服务
          </el-button>
          <el-button v-if="true"
             size="mini-extral"
             type="primary"
             @click="handleButtonClick($event, 'refreshAppList')">刷新</el-button>
          <el-button v-if="isProductionProfile"
                     size="mini-extral"
                     :type="'primary'"
                     @click="handleButtonClick($event, 'go-to-work-order-todo-add')">申请工单</el-button>
          <el-tooltip slot="trigger" effect="dark" placement="bottom">
            <div slot="content">
              <div v-for="(item, index) in helpList" :key="index">{{item}}</div>
            </div>
            <span class="helper-text-tool-tip" style="font-size: 12px">相关提示<i class="el-icon-question" ></i></span>
          </el-tooltip>
        </div>
      </el-row>
      <el-row class="notice" v-show="false">
        <el-tag type="warning">
          <i class="el-icon-warning"></i>
          <span>每次创建的服务版本信息为所在应用创建时的配置信息</span>
        </el-tag>
      </el-row>
      <div  class="domain el-row is-justify-center is-align-middle">
        <div class="el-col el-col-12">
          <span class="text">内网域名：<a :href="'http://' + intranetDomain" target="_blank">{{intranetDomain}}</a></span>
        </div>
        <div class="el-col el-col-12">
          <el-tooltip effect="dark" placement="bottom" v-if="internetDomainList.length > 1">
            <div slot="content">
              <div v-for="(item, index) in internetDomainList" :key="index">
                <a :href="'http://' + item" target="_blank" style="color: white">{{item}}</a>
              </div>
            </div>
            <div>
              <div class="text"><span>外网二级域名：</span><span v-html="internetDomainHtml"></span></div>
              <i :class="['paas-icon', 'el-icon-edit', $storeHelper.permission['go-page-domain-from-service-list'].disabled ?  'disabled':'warning']"
                 @click="handleButtonClick($event, 'go-page-domain-from-service-list')"></i>
            </div>
          </el-tooltip>
          <div v-else>
            <div class="text"><span>外网二级域名：</span><span v-html="internetDomainHtml"></span></div>
            <i :class="['paas-icon', 'el-icon-edit', $storeHelper.permission['go-page-domain-from-service-list'].disabled ?  'disabled':'warning']"
               @click="handleButtonClick($event, 'go-page-domain-from-service-list')"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="service-list">
      <el-table
        :data="currentServiceList"
        stripe
        :height="heightOfTable"
        :row-key="getRowKeys"
        :expand-row-keys="expandRows"
      >
        <el-table-column
          label="服务默认版本"
          width="120">
          <template slot-scope="scope">
            <el-radio :label="scope.row.id"
                      :value="defaultServiceID"
                      :disabled="$storeHelper.permission['service_change_default'].disabled"
                      @input="changeDefaultVersion">{{scope.row.serviceVersion}}</el-radio>
              <span v-if="$storeHelper.groupVersion === 'v1'"
                    style="display: inline; color: #909399; font-size: 12px; line-height: 14px; cursor: pointer; padding: 1px; border: 1px solid #909399; border-radius: 4px; word-break: normal"
                    @mouseenter="handleRowButtonClick($event, 'k8s-tag', scope.$index, scope.row)"
              >{{scope.row.k8s === 1 ? 'k8s':'mesos'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="applicationServiceStatus"
          label="运行实例数/总实例数"
          width="180"
          headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            {{scope.row.k8s === 1 ? scope.row.applicationServiceStatus : '---' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="160"
          headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
                    v-if="!isProductionProfile"
                    type="text"
                    :class="[$storeHelper.permission['service_deploy'].disabled? 'disabled': 'danger']"
                    :loading="statusOfWaitingResponse('service_deploy') && selected.service.id == scope.row.id"
                    @click="handleRowButtonClick($event, 'service_deploy', scope.$index, scope.row)"
            >
              {{statusOfWaitingResponse('deploy') && selected.service.id == scope.row.id ? '部署中': '部署'}}
            </el-button>
            <div class="ant-divider"
                 v-if="!isProductionProfile"></div>
            <el-button
                    v-if="!isProductionProfile"
                    type="text"
                    :class="reason4DisableQuickDeploy(scope.row) ? 'disabled' : 'danger'"
                    :loading="statusOfWaitingResponse('quick-deploy') && selected.service.id == scope.row.id"
                    @click="handleRowButtonClick($event, 'quick-deploy', scope.$index, scope.row)"
            >
              {{statusOfWaitingResponse('quick-deploy') && selected.service.id == scope.row.id ? '部署中': '重启'}}
            </el-button>
            <div class="ant-divider"
                 v-if="!isProductionProfile && !$storeHelper.permission['service_deploy'].hide"></div>

            <el-button
                    type="text"
                    :loading="statusOfWaitingResponse('service_stop') && selected.service.id == scope.row.id"
                    :class="[$storeHelper.permission['service_stop'].disabled? 'disabled': 'danger']"
                    @click="handleRowButtonClick($event, 'service_stop', scope.$index, scope.row)">停止</el-button>
            <div class="ant-divider"></div>

            <el-button
                    type="text"
                    :class="$storeHelper.permission['service_delete'].disabled ? 'disabled' : 'danger'"
                    :loading="statusOfWaitingResponse('service_delete') && selected.service.id == scope.row.id"
                    @click="handleRowButtonClick($event, 'service_delete', scope.$index, scope.row)">删除</el-button>
            <div class="ant-divider"></div>

            <!--<el-button-->
                    <!--v-if="isProductionProfile"-->
                    <!--class="primary" type="text"-->
                    <!--@click="handleRowButtonClick('one-apm', scope.$index, scope.row)">OneAPM监控</el-button>-->
            <!--<div v-if="isProductionProfile"-->
                 <!--class="ant-divider"></div>-->

            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['go-to-page-log-deploy-from-service'].disabled ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'go-to-page-log-deploy-from-service', scope.$index, scope.row)">
              <span>部署日志</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>

            <el-button
                    type="text"
                    :class="['flex', 'primary']"
                    @click="handleRowButtonClick($event, 'go-to-instance-list', scope.$index, scope.row)">
              <span>实例列表</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>

            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['go-page-domain-from-service'].disabled ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'go-page-domain-from-service', scope.$index, scope.row)">
              <span>配置外网二级域名</span><i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>

            <el-button
                    type="text"
                    :class="['flex', $storeHelper.permission['copy-service'].disabled ? 'disabled' : 'primary']"
                    @click="handleRowButtonClick($event, 'copy-service',scope.$index,scope.row)">
              <span>复制服务</span>
              <i class="paas-icon-level-up"></i>
            </el-button>
            <div class="ant-divider"></div>

            <el-button
              class="flex primary" type="text"
              @click="handleRowButtonClick($event, 'service_info', scope.$index, scope.row)">
              <span>服务详情</span>
              <i class="el-icon-arrow-right"
                :class="{'expand': expandRows.indexOf(scope.row.id) > -1}"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         v-if="true"
                         width="0"
        >
          <template slot-scope="scope">
            <div class="row-expand">
              <div class="service-info">
                <div class="title">服务信息</div>
                <el-form label-position="right" label-width="170px" inline size="mini" class="message-show">
                  <el-form-item label="开发语言">
                    {{selected.service.language + ' - ' + selected.service.languageVersion}}
                  </el-form-item>
                  <el-form-item label="构建类型">
                    <span>{{valueToShow(selected.model.packageInfo.type)}}</span>
                    <span v-if="selected.model.packageInfo.name">（{{selected.model.packageInfo.name}}）</span>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('packageInfo') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'packageInfo')"></i>
                  </el-form-item>
                  <el-form-item label="滚动升级">
                    <span>{{selected.service.rollingUpdate? '需要' : '不需要'}}</span>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('rollingUpdate') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'rollingUpdate')"></i>
                  </el-form-item>
                  <el-form-item label="负载均衡">
                    {{valueToShow(selected.service.loadBalance)}}
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('loadBalance') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'loadBalance')" v-if="$storeHelper.groupVersion === 'v1'"></i>
                  </el-form-item>
                  <el-form-item label="CPU/内存">
                    <span>{{selected.service.cpuInfo.size + '核 / ' + selected.service.memoryInfo.size + 'G'}}</span>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('cpuAndMemory') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'cpuAndMemory')"></i>
                  </el-form-item>
                  <el-form-item label="实例数量">
                    <span>{{valueToShow(selected.model.instanceNum)}}</span>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('instanceNum') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'instanceNum')"></i>
                  </el-form-item>
                  <el-form-item label="应用监控">
                    <span>{{appPropUtils.getMonitorNameById(selected.model.appMonitor)}}</span>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('appMonitor') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'appMonitor')"></i>
                  </el-form-item>
                  <el-form-item label="镜像方式" class="big">
                    <span>{{valueToShow(selected.service.image.typeName)}}</span>
                    <span style="padding-left: 12px; font-weight: bold">{{selected.service.image.customImage?'镜像地址':'基础镜像'}}</span>
                    <span>{{selected.service.image.location}} </span>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('image') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'image')"></i>
                  </el-form-item>
                  <el-form-item label="gitlab_ssh地址" class="big" v-if="!selected.service.image.customImage">
                    <div class="expand-to-next-line">{{valueToShow(selected.service.gitLabAddress)}}</div>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('gitLabAddress') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'gitLabAddress')"></i>
                  </el-form-item>
                  <el-form-item label="gitlab分支" class="big" v-if="!selected.service.image.customImage">
                    <div class="expand-to-next-line">
                      <span>{{valueToShow(selected.service.gitLabBranch)}}</span>
                      <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('gitLabBranch') ? 'warning' : 'disabled']"
                         @click="handleChangeProp($event, 'gitLabBranch')"></i></div>
                  </el-form-item>
                  <el-form-item label="mainClass" class="main-class big" v-if="selectedApp.isJavaLanguage&&!selected.service.image.customImage">
                    <div class="expand-to-next-line">
                      <span>{{valueToShow(selected.service.mainClass)}}</span>
                      <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('mainClass') ? 'warning' : 'disabled']"
                         @click="handleChangeProp($event, 'mainClass')"></i>
                    </div>
                  </el-form-item>
                  <el-form-item label="gitlab父级pom相对路径" class="relativePathOfParentPOM big" v-if="selectedApp.isJavaLanguage&&!selected.service.image.customImage">
                    <div class="expand-to-next-line">
                      <span>{{valueToShow(selected.service.relativePath)}}</span>
                      <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('relativePath') ? 'warning' : 'disabled']"
                         @click="handleChangeProp($event, 'relativePath')"></i>
                    </div>
                  </el-form-item>
                  <el-form-item label="Maven profile id" v-if="selectedApp.isJavaLanguage&&!selected.service.image.customImage">
                    <div class="expand-to-next-line">{{valueToShow(selected.service.mavenProfileId)}}</div>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('mavenProfileId') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'mavenProfileId')"></i>
                  </el-form-item>
                  <el-form-item label="健康检查配置" class="big">
                    <span style="font-weight: bold">类型：</span><span>{{selected.model.healthCheck.type}}</span>
                    <span style="font-weight: bold; margin-left: 12px">{{selected.model.healthCheck.contentDesc}}：</span>
                    <a v-if="selected.model.healthCheck.type === 'http'"
                       :href="'http://' + selected.service.intranetDomain + selected.model.healthCheck.content" target="_blank">{{selected.model.healthCheck.content}}</a>
                    <span v-else>{{valueToShow(selected.model.healthCheck.content)}}</span>
                    <span style="font-weight: bold; margin-left: 12px">延迟时间：</span>
                    <span>{{selected.model.healthCheck.initialDelay}}秒</span>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('healthCheck') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'healthCheck')"></i>
                  </el-form-item>
                  <el-form-item label="preStop脚本" class="big" v-if="!isProductionProfile">
                    <span>{{valueToShow(selected.model.prestopCommand)}}</span>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('prestopCommand') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'prestopCommand')"></i>
                  </el-form-item>
                  <el-form-item label="文件存储" class="big file-location" v-if="false">
                    <div v-if="selected.service.fileLocation && selected.service.fileLocation.length > 0">
                      <el-tag
                              v-for="tag in selected.service.fileLocation"
                              :key="tag"
                              type="success"
                      >{{tag}}</el-tag>
                      <i class="el-icon-edit" @click="handleChangeProp($event, 'fileLocation')"></i>
                    </div>
                    <div v-else>
                      <span>未设置</span>
                      <i class="el-icon-edit" @click="handleChangeProp($event, 'fileLocation')"></i>
                    </div>
                  </el-form-item>
                  <el-form-item label="VM_Options" class="big" v-if="selectedApp.isJavaLanguage">
                    <div class="expand-to-next-line" style="display: inline-block; max-width: calc(100% - 24px)">
                      {{selected.service.vmOptions ? selected.service.vmOptions:'未设置'}}
                    </div>
                    <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('vmOptions') ? 'warning' : 'disabled']"
                       @click="handleChangeProp($event, 'vmOptions')"></i>
                  </el-form-item>
                  <el-form-item label="环境变量配置" class="big">
                    <div v-if="selected.service.environments && selected.service.environments.length > 0">
                      <el-row>
                        <el-col :span="10" style="font-weight: bold;text-align: center">Key</el-col>
                        <el-col :span="10" style="font-weight: bold;text-align: center">Value</el-col>
                        <el-col :span="4" style="font-weight: bold;text-align: left">
                          <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('environments') ? 'warning' : 'disabled']"
                             @click="handleChangeProp($event, 'environments')"></i>
                        </el-col>
                      </el-row>
                      <el-row
                              v-for="(item, index) in selected.service.environments"
                              :key="item.key"
                      >
                        <el-col :span="10" style="text-align: center">
                          <div class="expand-to-next-line">{{item.key}}</div>
                        </el-col>
                        <el-col :span="10" style="text-align: center">
                          <div class="expand-to-next-line">{{item.value}}</div>
                        </el-col>
                      </el-row>
                    </div>
                    <div v-else>
                      <span>未设置</span>
                      <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('environments') ? 'warning' : 'disabled']"
                         @click="handleChangeProp($event, 'environments')"></i>
                    </div>
                  </el-form-item>
                  <el-form-item label="Host配置" class="big">
                    <div v-if="selected.service.hosts && selected.service.hosts.length > 0">
                      <el-row>
                        <el-col :span="8" style="font-weight: bold; text-align: center">IP</el-col>
                        <el-col :span="8" style="font-weight: bold; text-align: center">域名</el-col>
                        <el-col :span="2" style="font-weight: bold;text-align: left">
                          <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('hosts') ? 'warning' : 'disabled']"
                             @click="handleChangeProp($event, 'hosts')"></i>
                        </el-col>
                      </el-row>
                      <el-row
                              v-for="(item, index) in selected.service.hosts"
                              :key="item.ip"
                      >
                        <el-col :span="8" style="text-align: center">{{item.ip}}</el-col>
                        <el-col :span="8" style="text-align: center">{{item.domain}}</el-col>
                        <el-col :span="2"></el-col>
                      </el-row>
                    </div>
                    <div v-else>
                      <span>未设置</span>
                      <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('hosts') ? 'warning' : 'disabled']"
                         @click="handleChangeProp($event, 'hosts')"></i>
                    </div>
                  </el-form-item>
                  <el-form-item label="端口映射" class="port-map big" v-if="!isProductionProfile">
                    <div v-if="selected.model.portMap.exist">
                      <div class="el-row">
                        <div class="el-col el-col-6" style="font-weight: bold; text-align: center">访问端口</div>
                        <div class="el-col el-col-2" style="min-height:1px"></div>
                        <div class="el-col el-col-6" style="font-weight: bold; text-align: center">目标端口</div>
                        <div class="el-col el-col-2" style="font-weight: bold; text-align: center">协议</div>
                        <div class="el-col el-col-2" style="font-weight: bold; text-align: center">
                          <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('portMap') ? 'warning' : 'disabled']"
                             @click="handleChangeProp($event, 'portMap')"></i>
                        </div>
                      </div>
                      <el-row class="content">
                        <el-col :span="6" style="text-align: center">{{selected.model.portMap.outerPort}}</el-col>
                        <el-col :span="2" style="text-align: center">--></el-col>
                        <el-col :span="6" style="text-align: center">{{selected.model.portMap.containerPort}}</el-col>
                        <el-col :span="2" style="text-align: center">TCP</el-col>
                      </el-row>
                    </div>
                    <div v-else>
                      <span>未设置</span>
                      <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('portMap') ? 'warning' : 'disabled']"
                         @click="handleChangeProp($event, 'portMap')"></i>
                    </div>
                  </el-form-item>
                  <el-form-item label="当前服务内网域名" class="big">
                    <a :href="'http://' + selected.service.intranetDomain" target="_blank"
                       v-if="selected.service.intranetDomain">{{selected.service.intranetDomain}}</a>
                    <span v-else>{{valueToShow(selected.service.intranetDomain)}}</span>
                  </el-form-item>
                  <el-form-item label="当前服务外网域名" class="big">
                    <div v-if="scope.row.internetDomainList.length==0">无</div>
                    <div v-if="scope.row.internetDomainList.length==1">
                      <a :href="'http://' + scope.row.internetDomainList[0]" target="_blank">{{scope.row.internetDomainList[0]}}</a>
                    </div>
                    <div v-if="scope.row.internetDomainList.length>1">
                      <a :href="'http://' + scope.row.internetDomainList[0]" target="_blank">{{scope.row.internetDomainList[0]}}</a>
                      <el-tooltip slot="trigger" effect="light" placement="top">
                        <div slot="content">
                          <div v-for="(item, index) in scope.row.internetDomainList" v-if="index!=0">
                            <a :href="'http://' + item" target="_blank">{{item}}</a>
                          </div>
                        </div>
                        <span class="more">更多...</span>
                      </el-tooltip>
                    </div>
                  </el-form-item>
                </el-form>
              </div>
          </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="更改实例数量" :visible="selected.prop == 'instanceNum'"
               :close-on-click-modal="false"
               class="manual-scale size-500"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改实例数量后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" labelWidth="120px" size="mini" ref="changeInstanceNumForm">
        <el-form-item label="当前实例数：">
          <div>{{selected.model.instanceNum}}个</div>
        </el-form-item>
        <el-form-item label="调整实例数为：">
          <el-input-number v-model="newProps.instanceNum" :min="1" :max="20" size="mini"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary"
                       @click="handleDialogButtonClick('instanceNum')"
                       :loading="waitingResponse">确&nbsp定</el-button>
          </div>
          <div class="item">
            <el-button @click="selected.prop = null">取&nbsp消</el-button>
          </div>
      </div>
    </el-dialog>

    <el-dialog title="更改健康检查配置" :visible="selected.prop == 'healthCheck'"
               :close-on-click-modal="false"
               class="health-check size-700"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改健康检查后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" size="mini" labelWidth="140px" ref="changeHealthCheckForm">
        <div class="el-form-item-group">
          <div class="label" style="width: 140px;">当前健康检查配置</div>
          <div class="content"style="margin-left: 140px;">
            <div>
              <span>健康检查方式：</span>
              <span v-if="selected.model.healthCheck.type">{{selected.model.healthCheck.type}}</span>
            </div>
            <div>
              <span v-if="selected.model.healthCheck.contentDesc">{{selected.model.healthCheck.contentDesc}}：</span>
              <span>{{selected.model.healthCheck.content}}</span>
            </div>
            <div>
              <span>延迟时间：</span>
              <span>{{selected.model.healthCheck.initialDelay}}s</span>
            </div>
          </div>
        </div>
        <div class="el-form-item-group is-required">
          <div class="label" style="width: 140px;">健康检查配置</div>
          <div class="content" style="margin-left: 140px;">
            <el-form-item :error="errMsgForHealthCheck">
              <div class="health-check-type" style="height: 64px">
                <el-radio-group v-model="newProps.healthCheck.type">
                  <el-radio v-for="(item, index) in $storeHelper.healthCheckTypeList" :label="item.desc" :key="item.desc">{{item.label}}</el-radio>
                </el-radio-group>
                <div class="input-area">
                  <div v-if="newProps.healthCheck.type == 'http'">
                    <el-input v-model="newProps.healthCheck.content" placeholder="以/开头，可以包含字母、数字、下划线、中划线。2-100个字符"></el-input>
                  </div>
                  <div v-if="newProps.healthCheck.type == 'shell'">
                    <el-input v-model="newProps.healthCheck.content"placeholder="请填写shell指令"></el-input>
                  </div>
                  <div v-if="newProps.healthCheck.type == 'socket'">
                    <span>端口号：</span>
                    <el-input-number v-model="newProps.healthCheck.content" :min="0" :max="10000" label="延迟时间"></el-input-number>
                  </div>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <div class="initial-delay" style="line-height: 28px">
                <span>延迟时间：</span>
                <el-input-number v-model="newProps.healthCheck.initialDelay" :min="30" :max="1800" label="延迟时间"></el-input-number>
              </div>
            </el-form-item>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogButtonClick('healthCheck')"
                     :loading="waitingResponse">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="selected.prop = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="更改包类型" :visible="selected.prop == 'packageInfo'"
               :close-on-click-modal="false"
               class="package-info size-700"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改包类型后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" size="mini" labelWidth="80px" ref="changePackageInfoForm">
        <el-form-item class="build-type" label="构建类型"  style="height: 30px;"
                      :error="newProps.packageInfo.errMsg">
          <div class="flex-layout">
            <div class="type-list">
              <el-radio-group v-model="newProps.packageInfo.type">
                <el-radio v-for="item in newProps.packageInfo.packageTypeList" :label="item.type" :key="item.type">
                  {{item.packageType}}
              </el-radio>
              </el-radio-group>
            </div>
            <div :class="['war-name', newProps.packageInfo.needSetName ?'':'hide']"><el-input v-model="newProps.packageInfo.name" placeholder="默认与项目名称一致"></el-input></div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogButtonClick('packageInfo')"
                     :loading="waitingResponse">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="selected.prop = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="更改prestop脚本" :visible="selected.prop == 'prestopCommand'"
               :close-on-click-modal="false"
               class="health-check size-700"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改preStop指令后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" size="mini" labelWidth="140px" ref="changePrestopCommandForm">
        <el-form-item label="prestop脚本">
          <el-input v-model="newProps.prestopCommand"
                    size="mini"
                    type="textarea"
                    :rows="6"
                    placeholder="例如：shell & sleep 30 //30为变量，0-120之间的整数"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogButtonClick('prestopCommand')"
                     :loading="waitingResponse">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="selected.prop = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="更改镜像方式" :visible="selected.prop == 'image'"
               :close-on-click-modal="false"
               class="image"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改镜像方式后需要【重启】才能生效！</span>
      </el-tag>
      <el-row>
        当前镜像方式： {{selected.service.image.typeName}}；镜像地址： {{selected.service.image.location}}
      </el-row>
      <el-row>
        更改镜像方式为：
      </el-row>
      <paas-image-selector ref="changeImageForm"></paas-image-selector>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogButtonClick('image')"
                     :loading="waitingResponse">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="selected.prop = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="更改文件存储" :visible="selected.prop == 'fileLocation'"
               :close-on-click-modal="false"
               class="fileL-location"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改文件存储后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" size="mini"
               label-width="120px" ref="changeFileLocationForm">
        <el-form-item label="当前文件存储" class="has-existed">
          <div>
            <el-tag
                    v-for="tag in newProps.fileLocation"
                    :key="tag"
                    size="small"
                    closable
                    type="success"
                    @close="handleFileLocation('remove', tag)"
            >{{tag}}</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="文件存储" prop="fileLocation">
          <el-input v-model="fileLocationToAdd" placeholder="以/开头，可以包含字母数字下划线中划线，2-18位">
            <template slot="append"><el-button class="add-file-location-btn"
                                               @click="handleFileLocation('add', fileLocationToAdd)">添加</el-button></template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('fileLocation')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="更改gitlab_ssh地址" :visible="selected.prop == 'gitLabAddress'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="gitlab-address size-600"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改Gitlab_ssh后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="changeGitLabAddressForm" size="mini">
        <el-form-item label="当前gitlab_ssh地址：">
          <div class="expand-to-next-line">{{selected.model.gitLabAddress}}</div>
        </el-form-item>
        <el-form-item label="更改gitlab_ssh地址为：" prop="gitLabAddress">
          <el-input v-model="newProps.gitLabAddress" placeholder="请输入项目的gitLab地址，不能超过256个字符"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('gitLabAddress')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="更改gitlab分支" :visible="selected.prop == 'gitLabBranch'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="gitlab-address size-500"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改Gitlab分支后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="changeGitLabBranchForm" size="mini">
        <el-form-item label="当前gitlab分支：">
          <div class="expand-to-next-line">{{selected.model.gitLabBranch}}</div>
         </el-form-item>
        <el-form-item label="更改gitlab分支为：" prop="gitLabBranch">
          <el-input v-model="newProps.gitLabBranch" placeholder="请输入gitLab分支名，不能超过100个字符"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('gitLabBranch')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="更改mainClass" :visible="selected.prop == 'mainClass'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="main-class size-500"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改mainClass后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="changeMainClassForm" size="mini">
        <el-form-item label="当前mainClass：">
          <div class="expand-to-next-line">{{selected.model.mainClass}}</div>
        </el-form-item>
        <el-form-item label="更改mainClass为：" prop="mainClass">
          <el-input v-model="newProps.mainClass" placeholder=""></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogButtonClick('mainClass')"
                     :loading="waitingResponse">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="selected.prop = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="更改pom相对路径" :visible="selected.prop == 'relativePath'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="gitlab-address size-600"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改pom相对路径后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="260px" ref="changeRelativePathForm" size="mini">
        <el-form-item label="当前Gitlab父级pom相对路径：">
          <div class="expand-to-next-line">{{selected.model.relativePath}}</div>
        </el-form-item>
        <el-form-item label="更改父级pom相对路径为：" prop="relativePath">
          <el-input v-model="newProps.relativePath" placeholder="不能包含中文，不能超过512个字符"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary"
                       @click="handleDialogButtonClick('relativePath')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </div>
          <div class="item">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </div>
      </div>
    </el-dialog>

    <el-dialog title="更改maven profile id" :visible="selected.prop == 'mavenProfileId'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="gitlab-address size-550"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改maven profile id后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="180px" ref="changeMavenProfileIdForm" size="mini">
        <el-form-item label="当前maven profile id：">
          <div class="expand-to-next-line">{{selected.model.mavenProfileId}}</div>
        </el-form-item>
        <el-form-item label="更改maven profile id：" prop="mavenProfileId">
          <el-input v-model="newProps.mavenProfileId" placeholder="不能超过100个字符"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('mavenProfileId')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="更改实例规格" :visible="selected.prop == 'cpuAndMemory'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="cpu-and-memory size-500"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改实例规格后需要【重启】才能生效！</span>
      </el-tag>
      <el-row>
        当前实例规格: {{selected.service.cpuInfo.size + '核 / ' + selected.service.memoryInfo.size + 'G'}}
      </el-row>
      <el-row>
        更改实例规格为：
      </el-row>
      <el-form :model="newProps" :rules="rules"  size="mini" labelWidth="80px" ref="changeCpuAndMemoryForm">
        <el-form-item label="CPU" prop="cpuID">
          <el-radio-group v-model="newProps.cpuID" size="small" @change="handleCPUChange">
            <el-radio-button v-for="item in cpuAndMemoryList" :label="item.id" :key="item.id">
              {{item.cpu}}核
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内存" prop="memoryID">
          <el-radio-group v-model="newProps.memoryID" size="small">
            <el-radio-button v-for="item in memeorySizeList" :label="item.id" :key="item.id">
              {{item.memory}}G
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('cpuAndMemory')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="使用滚动升级" :visible="selected.prop == 'rollingUpdate'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="rolling-update size-600"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>滚动升级是为了实现业务的平滑上线而不中断。除了定时器外，建议其他应用都选用滚动升级。</span>
      </el-tag>
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改滚动升级后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="80px" ref="changeRollingUpdateForm">
        <el-form-item label="滚动升级">
          <el-radio-group v-model="newProps.rollingUpdate">
            <el-radio :label="true">需要</el-radio>
            <el-radio :label="false">不需要</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('rollingUpdate')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="更改负载均衡" :visible="selected.prop == 'loadBalance'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="load-balance size-600"
               v-if="selected.service && selected.model"
    >
      <el-form :model="newProps" :rules="rules" labelWidth="80px" ref="changeLoadBalanceForm">
        <el-form-item label="负载均衡" prop="loadBalance">
          <el-radio-group v-model="newProps.loadBalance">
            <el-radio v-for="item in loadBalanceType" :label="item" :key="item"></el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('loadBalance')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="更改VM_Options" :visible="selected.prop == 'vmOptions'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="vm-options size-750"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改VM_Options后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="changeVmOptionsForm" size="mini">
        <el-form-item label="更改VM_Options">
          <el-input v-model="newProps.vmOptions"
                    size="mini"
                    type="textarea"
                    :rows="6"
                    placeholder="不能包含中文，不能超过512个字符"
          ></el-input>
        </el-form-item>
      </el-form>
      <div style="color:#409EFF; text-align:left; cursor:pointer" @click="handleDialogButtonClick('set-default-vmOptions')">
        <span>帮我填</span>
        <el-tooltip slot="trigger" effect="dark" placement="bottom">
          <div slot="content">
            <div>填写默认的VM_options</div>
          </div>
          <span><i class="paas-icon-fa-question" style="color: #E6A23C; font-size:12px;"></i></span>
        </el-tooltip>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('vmOptions')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="修改环境变量" :visible="selected.prop == 'environments'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="environments size-750"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改环境变量后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" size="mini" :rules="rules" labelWidth="160px" ref="changeEnvironmentsForm">
        <el-form-item labelWidth="0px" :error="formItemMsgForEnvironments">
          <el-row class="title">
            <el-col :span="11" class="key">Key</el-col>
            <el-col :span="11" class="value">Value</el-col>
            <el-col :span="2"></el-col>
          </el-row>
          <el-row class="content"
            v-for="(item, index) in newProps.environments"
            :key="item.key"
          >
            <el-col :span="11" class="key">{{item.key}}</el-col>
            <el-col :span="11" class="value">{{item.value}}</el-col>
            <el-col :span="2" style="text-align: center">
              <el-button type="warning" size="mini-extral" @click="handleEnvironment('delete', index)">删除</el-button>
            </el-col>
          </el-row>
          <el-row class="add-key-value">
            <el-col :span="11" class="key">
              <el-input v-model="environmentKey" placeholder="64位以内的数字、字母、下划线，以字母或下划线开头" size="mini"></el-input>
            </el-col>
            <el-col :span="11" class="value">
              <el-input v-model="environmentValue" placeholder="512位以内的数字、字母、中划线、下划线" size="mini"></el-input>
            </el-col>
            <el-col :span="2" style="text-align: center">
              <el-button type="primary" size="mini-extral"
                         @click="handleEnvironment('add', environmentKey, environmentValue)">添加</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('environments')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="修改Host配置" :visible="selected.prop == 'hosts'"
               :close-on-click-modal="false"
               class="hosts size-700"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改Host配置后需要【重启】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" size="mini" :rules="rules" labelWidth="160px" ref="changeHostsForm">
        <el-form-item labelWidth="0px" :error="formItemMsgForHosts">
          <el-row class="title">
            <el-col :span="11" class="key">IP</el-col>
            <el-col :span="11" class="value">域名</el-col>
            <el-col :span="2"></el-col>
          </el-row>
          <el-row class="content"
            v-for="(item, index) in newProps.hosts"
            :key="item.key"
          >
            <el-col :span="11" class="key">{{item.ip}}</el-col>
            <el-col :span="11" class="value">{{item.domain}}</el-col>
            <el-col :span="2" style="text-align: center">
              <el-button  type="warning" size="mini-extral" @click="handleHost('delete', index)">删除</el-button>
            </el-col>
          </el-row>
          <el-row class="add-key-value">
            <el-col :span="11" class="key">
              <el-input v-model="hostKey" placeholder="IP" size="mini"></el-input>
            </el-col>
            <el-col :span="11" class="value">
              <el-input v-model="hostValue" placeholder="域名" size="mini"></el-input>
            </el-col>
            <el-col :span="2" style="text-align: center">
              <el-button  type="primary" size="mini-extral" @click="handleHost('add', hostKey, hostValue)">添加</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('hosts')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="修改端口映射" :visible="selected.prop == 'portMap'"
               :close-on-click-modal="false"
               class="hosts size-700"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改端口映射配置后【立即生效】！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" size="mini" labelWidth="120px" ref="changePortMapForm">
        <el-form-item label="端口映射" class="port-map" :error="newProps.portMap.errMsg">
          <div class="el-row title">
            <div class="el-col el-col-8" style="text-align: center; font-weight: bold">
              <span>访问端口</span>
              <el-tooltip slot="trigger" effect="dark" placement="top">
                <div slot="content">
                  <div>访问端口的范围在40000~59999之间</div>
                  <div>如需删除端口映射，可将访问端口，目标端口都设为空</div>
                </div>
                <span><i class="paas-icon-fa-question" style="font-size: 12px; color:#E6A23C"></i></span>
              </el-tooltip>
            </div>
            <div class="el-col el-col-2" style="min-height:1px"></div>
            <div class="el-col el-col-8" style="text-align: center; font-weight: bold">目标端口</div>
            <div class="el-col el-col-2" style="text-align: center; font-weight: bold">协议</div>
          </div>
          <el-row class="content">
            <el-col :span="8" style="text-align: center">
              <el-input placeholder="如40002" size="mini" v-model="newProps.portMap.outerPort"></el-input>
            </el-col>
            <el-col :span="2" style="text-align: center">--></el-col>
            <el-col :span="8" style="text-align: center">
              <el-input placeholder="如8100" size="mini" v-model="newProps.portMap.containerPort"></el-input>
            </el-col>
            <el-col :span="2" style="text-align: center">TCP</el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary"
                       @click="handleDialogButtonClick('portMap')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </div>
          <div class="item">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </div>
      </div>
    </el-dialog>

    <!--TODO: not used-->
    <el-dialog title="更改OneApm" :visible="selected.prop == 'oneApm'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="one-apm"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
      <i class="el-icon-warning"></i>
        <span>更改监控后需要重启才能生效</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="120px" ref="changeOneApmForm">
        <el-form-item label="OneApm监控" prop="oneApm">
          <el-radio-group v-model="newProps.oneApm">
            <el-radio :label="true">需要</el-radio>
            <el-radio :label="false">不需要</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary"
                       @click="handleDialogButtonClick('oneApm')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </div>
          <div class="item">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </div>
      </div>
    </el-dialog>

    <el-dialog title="更改应用监控" :visible="selected.prop == 'appMonitor'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="app-monitor size-550"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改应用监控后需要重启才能生效</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="80px" ref="changeAppMonitorForm">
        <el-form-item label="应用监控" prop="appMonitor" class="app-monitor">
          <el-radio-group v-model="newProps.appMonitor" size="mini" v-if="appPropUtils">
            <el-radio v-for="item in appPropUtils.appMonitorList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="handleDialogButtonClick('appMonitor')"
                     :loading="waitingResponse">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="selected.prop = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <paas-dialog-for-log title="部署日志" :showStatus="dialogForLogStatus" ref="dialogForDeployLog">
      <div slot="content">
        <div v-for="(item,index) in deployLogs" :key="index" class="log-item" v-html="item"></div>
      </div>
    </paas-dialog-for-log>
  </div>
</template>

<style lang="scss">
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
  .fix-form-item-label {
    line-height: 25px;
    padding-right: 4px;
  }
  .fix-form-item-content {
    line-height: 25px;
  }
  #service-main {
    .el-textarea__inner {
      font-size: 14px;
    }
    .paas-icon-level-up {
      margin-left: 2px;
      font-size: 12px;
    }
    .header {
      .el-select .el-input__inner {
        height: 26px;
      }
    }
    .service-list {
      .el-table {
        .el-table__expanded-cell {
          .row-expand {
            box-sizing: border-box;
            padding: 8px 12px;
            width: 85%;
            margin: 6px auto;
            max-width: 900px;
            /*box-shadow: 0 2px 15px rgba(0,0,0,0.1);*/
            /*box-shadow: 0 0 2px 0 rgba(64,158,255, .6);*/
            box-shadow: 0 2px 7px 0 rgba(0,0,0,.18);
            /*box-shadow: 0 6px 18px 0 rgba(232,237,250,0.50);*/
            .el-form {
              .el-form-item {
                .el-form-item__label {
                  /*color: #409EFF;*/
                  font-weight: bold;
                }
                &.el-form-item--mini {
                  margin-bottom: 2px;
                }
                &.relativePathOfParentPOM {
                  .el-form-item__label {
                    /*line-height: 120%;*/
                  }
                }
              }
            }
            .service-info {
              /*border-bottom: 1px solid lightgray;*/
              .el-form {
                .el-form-item {
                  width: 50%;
                  &.big {
                    @include expand-inline-form-item;
                    .el-form-item__content {
                      margin-left: 170px;
                    }
                  }
                  &.file-location {
                    .el-tag {
                      display: inline-block;
                      line-height: 26px;
                      height: 26px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .el-dialog {
      .el-tag {
        display: block;
        text-align: left;
        .el-icon-warning {
          vertical-align: middle;
        }
      }
    }

    .el-dialog__wrapper {
      &.cpu-and-memory {
        .el-row {
          text-align: left;
        }
      }
      &.image {
        .el-row {
          text-align: left;
        }
      }
      &.package-info {
        .flex-layout {
          display: flex;
          align-items: flex-start;
          .war-name {
            padding-left: 10px;
            flex: 1;
            min-width: 100px;
            opacity: 1;
            transition: opacity .5s;
            &.hide {
              opacity: 0;
            }
          }
        }
      }
      &.file-location {
        .el-dialog__body {
          .el-form {
            .el-form-item {
              &.has-existed {
                .el-form-item__content {
                  text-align: left;
                }
              }
            }
            .el-tag {
              display: inline-block;
              line-height: 26px;
              height: 26px;
              border-radius: 4px;
            }
          }
          .add-file-location-btn {
            color: white;
            background-color: #409EFF;
            margin: 0px;
            width: 60px;
            border-width: 0px;
            border-radius: 0px;
            &:hover {
              background-color: #79bbff;
              font-weight: bold;
            }
          }
        }
      }
      &.environments, &.hosts {
        .key, .value {
          text-align: center;
        }
        .el-row.title {
          font-weight: bold;
        }
        .content {
          .key, .value {
            word-wrap: break-word;
            word-break: break-all;
            line-height: 1.2;
          }
        }
        .el-row.add-key-value {
          .el-col.key, .el-col.value {
            padding: 0px 3px;
          }
        }
      }
    }

    .dialog-for-log {
      .el-dialog {
        width: 95%;
      }
      .log-item {
        /*white-space: pre;*/
        max-width: 100%;
        word-wrap: break-word;
        word-break: break-all;
        line-height: 1.4;
      }
      .info {
        color: #409EFF;
        font-weight: bold;
      }
      .warning {
        color: #E6A23C;
        font-weight: bold;
      }
      .error {
        color: #F56C6C;
        font-weight: bold;
      }
      .success {
        color: #67C23A;
        font-weight: bold;
      }
    }
  }
</style>
<style lang="scss" scoped>
  #service-main {
    background: white;
    height: 100%;
    /*margin:0px 6px;*/
    max-width: 1300px;

    /*box-shadow: 0 2px 8px rgba(0,0,0,0.1);*/
    .el-icon-edit {
      margin-left: 2px;
      font-size: 100%;
      line-height: 100%;
      vertical-align: middle;
      &:hover {
        font-weight: bold;
      }
    }
    .header {
      padding: 0px 5px;
      font-size: 14px;
      line-height: 20px;
      i {
        font-size: 14px;
      }
      .el-row {
        min-height: 28px;
        &.operation {
          /*margin: 3px 5px;*/
          .el-col {
            display: block !important;
            float: none !important;
            margin: 3px 0px;

            display: inline-block;
            vertical-align: middle;
            text-align: left;

            &.selector {
              .item {
                display: inline-block;
              }
            }
            &.btn-list {
              padding: 0px;
            }
          }
        }
        &.notice {
          .el-tag {
            display: block;
            .el-icon-warning {
              vertical-align: middle;
            }
          }
        }
        &.domain {
          /*margin: 5px 5px 5px 8px;*/
          .el-col {
            .text {
              display: inline-block;
              max-width: calc(100% - 30px);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              word-wrap: break-word;
              word-break: break-all;
            }
            .el-icon-edit {
              font-size: 16px;
              margin-left: 0px;
            }
          }
        }
      }
    }

    .service-list {
      .el-table {
        .el-table__row {
          .el-button {
            .el-icon-arrow-right {
              vertical-align: middle;
              transition: transform 0.2s ease-in-out;
              &.expand {
                transform: rotate(90deg);
              }
            }
          }
          .ant-divider {
          }
        }

        .el-table__expanded-cell {
          .title {
            margin: 8px 0px;
            padding-left: 5px;
            border-left: 6px solid darkslategray;
            font-weight: bold;
          }
          .el-form {
            font-size: 0;
            .el-form-item {
              margin-right: 0;
              margin-bottom: 10px;
            }
          }
        }
      }
    }
  }
</style>

<script>
  import {mapGetters} from 'vuex';
  import appPropUtils from '../utils/app-props';
  import paasDialogForLog from '../components/dialog4log.vue'
  import paasImageSelector from '../components/image-selector.vue'
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
export default {
  components: {paasDialogForLog, paasImageSelector},
  created() {
    this.appPropUtils = appPropUtils;
    if (this.$storeHelper.dataTransfer) {
      const dataTransfer = this.$storeHelper.dataTransfer;
      try {
        const from = dataTransfer['from'];
        // data save to localStorage
        let dataToSave = null;
        switch (from) {
          case this.$net.page['profile/app']:
            dataToSave = {
              appId: dataTransfer['data']['appId'],
              profileId: dataTransfer['data']['profileId']
            };
            break;
          case this.$net.page['profile/app/add']:
            dataToSave = {
              profileId: dataTransfer['data']['profileId']
            };
            break;
        }
        if (dataToSave) {
          this.$store.dispatch('user/config', {
            page: 'service',
            data: dataToSave
          });
        }
        this.$storeHelper.dataTransfer = null;
      } catch(err) {
      }
    }
  },
  mounted() {
    if (this.appInfoListOfGroup) {
      this.onAppInfoListOfGroup(this.appInfoListOfGroup);
    }
    if (!this.cpuAndMemoryList) {
      this.$store.dispatch('app/messageForCreateAPP');
    } else {
      this.onCpuAndMemoryList(this.cpuAndMemoryList);
    }

    // adjust the height of el-table in the area service-list
    try {
      let headerNode = this.$el.querySelector(':scope > .header');
      this.resizeListener = () => {
        let headerHeight = headerNode.offsetHeight;
        this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
      };
      addResizeListener(this.$el, this.resizeListener);
    } catch(err) {
    }
    this.checkPortMap = this.$net.getDebounce4CheckPortMap();
  },
  beforeDestroy() {
    removeResizeListener(this.$el, this.resizeListener);
  },
  computed: {
    ...mapGetters('user', {
      'appInfoListOfGroup': 'appInfoListOfGroup',
      'userConfig': 'config'
    }),
    serviceConfig() {
      let result = null;
      if (this.userConfig.hasOwnProperty('service')) {
        result = this.userConfig['service'];
      }
      return result;
    },
    cpuAndMemoryList() {
      return this.$storeHelper.cpuAndMemoryList();
    },
    /* used for dialog */
    imageInfo() {
      return appPropUtils.getImageInfo();
    },
    loadBalanceType() {
      return appPropUtils.getAllLoadBalance();
    },
//    isProductionProfile() {
//      return this.$storeHelper.isProductionProfile(this.selectedProfileID);
//    }
    /* used for dialog end */
  },
  data() {
    return {
//      1. 对于1.x团队的应用，服务管理页面中删除、配置外网域名、复制服务不可用，创建服务不可用。
//      2.对于mesos应用，服务管理页面中重启按钮不可用
      helpList: [
        '1. 每次创建的服务版本信息为所在应用创建时的配置信息',
        '2. 重启：采用最近一次部署成功的镜像进行服务的重新启动',
      ],
      resizeListenerForServiceList: () => {},
      heightOfTable: '',

      appList: [],
//      totalSize: 0,

      selectedAppID: null,
      selectedApp: null,
      selectedProfileID: null,
      // whether current profile is production
      isProductionProfile: null,
      currentProfileList: [],
      // used for component MyImageSelector
      serviceInfo: {
        appID: null,
        profileID: null
      },

      rules: appPropUtils.rules,
      currentServiceList: null,
      currentModelList: [],
      intranetDomain: '',
      internetDomain: '',
      internetDomainHtml: '',
      internetDomainList: [],

      defaultServiceID: '',
      selected: {
        index: -1,
        // which property to change
        prop: null,
        service: null,
        model: {},
        // which operation button is clicked
        operation: '',
      },
      errMsgForHealthCheck: '',
      newProps: {
        healthCheck: {
          _type: '',
          _content: {
            http: '',
            shell: '',
            socket: '8080',
          },
          _contentDesc: '',
          _initialDelay: 120,

          set type(type) {
            this._type = type;
            switch (type) {
              case 'http':
                this._contentDesc = '路径';
                break;
              case 'shell':
                this._contentDesc = '脚本';
                break;
              case 'socket':
                this._contentDesc = '端口';
                break;
            }
          },
          get type() {
            return this._type
          },
          set content(value) {
            if (['http', 'shell', 'socket'].indexOf(this._type) > -1) {
              this._content[this._type] = value;
            }
          },
          get content() {
            return this._content[this._type];
          },
          get contentDesc() {
            return this._contentDesc;
          },
          set initialDelay(type) {
            this._initialDelay = type
          },
          get initialDelay() {
            return this._initialDelay
          },
        },
        packageInfo: {
          _type: '',
          _name: '',
          _packageTypeList: null,
          set type(value) {
            this._type = value;
          },
          get type() {
            return this._type;
          },
          set name(value) {
            this._name = value;
          },
          get name() {
            if (this._type === 'WAR') {
              return this._name;
            } else {
              return '';
            }
          },
          get needSetName() {
            return this._type == 'WAR';
          },
          set packageTypeList(value) {
            this._packageTypeList = value;
          },
          get packageTypeList() {
            return this._packageTypeList;
          },
          get errMsg() {
            return '';
            if (this._type == 'WAR' && !this._name) {
              return '构建类型为WAR时，必须填写构建包名称';
            } else {
              return '';
            }
          }
        },
        portMap: {
          id: null,
          protocol: 'TCP',
          _outerPort: '',
          containerPort: '',
          _validateErrMsg: '',
          _errMsg: '',
          set outerPort(value) {
            this._outerPort = value;
            this.validateErrMsg = '';
          },
          get outerPort() {
            return this._outerPort;
          },
          get errMsg() {
            if (this.syntaxErrMsg) {
              return this.syntaxErrMsg;
            } else if (this._validateErrMsg) {
              return this._validateErrMsg;
            } else {
              return '';
            }
          },
          set errMsg(value) {
            this._errMsg = value;
          },
          get syntaxErrMsg() {
            // 先检测语法错误，后检测端口号错误
            let errMsg = '';
            const numberReg = /^[0-9]+$/;
            const outerPort = this.outerPort;
            const containerPort = this.containerPort;
//            if (outerPort == '') {
//              errMsg = '请填写访问端口';
//            } else if (containerPort == '') {
//              errMsg = '请填写目标端口';
//            } else {
            if (outerPort != '' && containerPort != '') {
              if (numberReg.exec(outerPort) && outerPort >= 40000 && outerPort <= 59999) {
              } else {
                errMsg = '访问端口只能是40000-59999之间的数字';
              }
              if (!errMsg && !numberReg.exec(containerPort)) {
                errMsg = '目标端口只能是数字';
              }
            } else if (outerPort == '' && containerPort == '') {
            } else {
              if (outerPort == '') {
                errMsg = '不能使用空的访问端口指向目标端口';
              } else {
                errMsg = '指向的目标端口不能为空';
              }
            }
            return errMsg;
          },
          set validateErrMsg(value) {
            this._validateErrMsg = value;
          },
          get exist() {
            return this.outerPort && this.containerPort;
          }
        },
        prestopCommand: '',
        environments: [],
        hosts: [],
        cpuID: null,
        memoryID: null,
        customImage: 0,
        imageLocation: '',
        rollingUpdate: '',
        loadBalance: '',
        gitLabAddress: '',
        gitLabBranch: '',
        relativePath: '',
        mavenProfileId: '',
        fileLocation: [],
        vmOptions: '',
        oneApm: '',
        instanceNum: '',
        appMonitor: '',
      },
      waitingResponse: false,
      formItemMsgForEnvironments: '',
      formItemMsgForHosts: '',

      getRowKeys: function (row) {
       return row.id;
      },
      expandRows: [],

      /* used for dialog */
      fileLocationToAdd: '',
      environmentKey: '',
      environmentValue: '',
      hostKey: '',
      hostValue: '',
      imageLocationLabel: '',
      deployLogs: [],
      /* used for dialog end */
      dialogForLogStatus: {
        visible: false,
        full: false,
        showLoading: false,
        iconExpand: true
      },

      queueForWaitingResponse: [],

    }
  },
  watch: {
    appInfoListOfGroup: 'onAppInfoListOfGroup',
    cpuAndMemoryList: 'onCpuAndMemoryList',
    selectedAppID: function (appId, oldValue) {
      let appInfo = this.$storeHelper.getAppInfoByID(appId);
      if (!appInfo) {
        return;
      }
      this.serviceInfo.appID = appId;
      this.selectedApp = appInfo['app'];
      this.$store.dispatch('user/config', {
        page: 'service',
        data: {
          appId
        }
      });

      this.currentProfileList = this.selectedApp['profileList'];
      if (!Array.isArray(this.currentProfileList) || this.currentProfileList.length === 0) {
        return;
      }
      // the logic of set profileId:
      // 1. profileId in local config; 2. first profileId in profileList
      let defaultProfileID = this.currentProfileList[0]['id'];
      const localProfileId = this.serviceConfig ? this.serviceConfig['profileId'] : null;
      // check whether localProfileId exist in currentProfileList
      defaultProfileID = this.currentProfileList.map(it => {
        if (it && it.id) {
          return it.id
        }
      }).indexOf(localProfileId) > -1 ? localProfileId: defaultProfileID;
      this.selectedProfileID = null;
      setTimeout(() => {
        this.selectedProfileID = defaultProfileID;
      });
    },
    selectedProfileID: function (profileId, oldValue) {
      if (this.$storeHelper.SERVICE_ID_FOR_NULL === profileId) {
        return;
      }
      this.serviceInfo.profileID = profileId;
      this.isProductionProfile = this.$storeHelper.isProductionProfile(profileId);
      let appID = this.selectedApp.appId;
      this.requestServiceList(appID, profileId);
      this.$store.dispatch('user/config', {
        page: 'service',
        data: {
          profileId
        }
      });
    },
    // add more info to selected.model
    'selected.model': function (model) {
//      model.healthCheckTypeInfo = this.$storeHelper.getHealthCheckTypeInfoByDesc(model.healthCheck.type);
    },
    'newProps.healthCheck.type': function (type) {
      this.getErrMsgForHealthCheck();
    },
    'newProps.healthCheck.content': function (type) {
      this.getErrMsgForHealthCheck();
    },

    'newProps.portMap.outerPort': function (value) {
    },
  },

  methods: {
    // helper for loading action of el-button
    addToWaitingResponseQueue(action) {
      if (this.queueForWaitingResponse.indexOf(action) === -1) {
        this.queueForWaitingResponse.push(action);
      }
    },
    hideWaitingResponse(action) {
      let index = this.queueForWaitingResponse.indexOf(action);
      if (index > -1) {
        this.queueForWaitingResponse.splice(index, 1);
      }
    },
    statusOfWaitingResponse(action) {
      return this.queueForWaitingResponse.indexOf(action) > -1;
    },

    // 是否支持快速部署：1. 是k8s应用，2. 有正在运行的实例
    reason4DisableQuickDeploy(item) {
      var reason = false;
      if (this.$storeHelper.groupVersion === 'v1') {
        reason = '1.x团队无法使用';
      } else if (item['k8s'] !== 1) {
        reason = '老mesos应用不支持';
      } else if (!item['containerStatus'].Running || item['containerStatus'].Running == 0) {
        reason = '运行实例数为0，不能进行重启操作！';
      }
      return reason;
    },

    // 是否允许修改属性（有些属性，1.x团队无法修改）
    isPermittedToChangeProp(key) {
      var permitted = true;
      if (key === 'go-page-domain-from-service-list') {
        permitted = !this.$storeHelper.permission[key].disabled;
      } else {
        // icon in change service detail
        // 1. all is disable if service_update is not permitted
        permitted = !this.$storeHelper.permission['service_update'].disabled;
        // 2. the prop in notPermittedInV1 is disabled when groupVersion is v1
        if (permitted && (this.$storeHelper.groupVersion === 'v1')) {
          const notPermittedInV1 = ['packageInfo', 'rollingUpdate', 'loadBalance', 'instanceNum', 'prestopCommand', 'environments', 'hosts', 'portMap'];
          permitted = notPermittedInV1.indexOf(key) === -1;
        }
      }
      return permitted;
    },
    // 获取不允许修改属性的原因
    reasonForNotPermittedToChangeProp(prop) {
      var reason = '';
      if (this.$storeHelper.permission['service_update'].disabled) {
        reason = '您无权限修改服务属性';
      } else {
        reason = '1.x团队无法修改该属性';
      }
      return reason;
    },


    initDataStatus() {
      this.appList = [];
      this.selectedAppID = null;
      this.currentProfileList = [];
      this.selectedProfileID = this.$storeHelper.SERVICE_ID_FOR_NULL;
      this.currentServiceList = [];
      this.currentModelList = [];
    },
    /**
     * the start point of change selectedAppID -> selectedProfileID -> serviceList
     * call in two place:
     * 1. created function
     * 2. appInfoListOfGroup watcher
     *
     * what is done?
     * 1. refresh this.appList
     * 2. get default appId
     */
    onAppInfoListOfGroup(appInfoListOfGroup) {
      this.initDataStatus();
      if (appInfoListOfGroup) {
        if (appInfoListOfGroup.hasOwnProperty('appList')) {
          this.appList = appInfoListOfGroup.appList;
        }
        const localId = this.serviceConfig ? this.serviceConfig['appId'] : null;
        let appId = null;
        if (localId && this.$storeHelper.getAppInfoByID(localId)) {
          appId = localId;
        } else {
          appId = this.appList.length > 0 ? this.appList[0]['appId'] : this.$storeHelper.APP_ID_FOR_NULL;
        }
        setTimeout(() => {
          this.selectedAppID = appId;
        });
      }
    },
    onCpuAndMemoryList(value, oldValue) {
      // set default cpu
      if (Array.isArray(value) && value.length > 0) {
        let firstItem = value[0];
        this.memeorySizeList = 'memoryList' in firstItem ? firstItem.memoryList : '';
      }
    },

    // collect all related info for add-service before jump to page service/add
    getInfoForAddService() {
      let result = {
        success: false,
        message: '',
        content: null,
      };
      // check group info
      let groupInfo = this.$storeHelper.groupInfo;
      if (!groupInfo) {
        result.message = '未找到团队相关信息！';
        return result;
      }
      // app info
      let appInfo = this.$storeHelper.getAppByID(this.selectedAppID);
      let appName = null;
      let language = null;
      let languageVersion = null;
      if (appInfo && appInfo.hasOwnProperty('appName') && appInfo.hasOwnProperty('language')) {
        appName = appInfo.appName;
        language = appInfo.language;
        languageVersion = appInfo.languageVersion;
      } else {
        result.message = '未找到应用相关信息！';
        return result;
      }

      if (!this.selectedProfileID) {
        result.message = '未找到运行环境相关信息';
        return;
      }

      if (appName && language && languageVersion && null !== this.selectedProfileID) {
        result.success = true;
        result.content = {
          appInfo,
          appName,
          language,
          languageVersion,
          appId: this.selectedAppID,
          profileId: this.selectedProfileID,
        }
      } else {
        console.log('error: infoForAddService');
      }
      return result;
    },

    // get error message tip for change healthCheck, used in the case
    // 1. change of healthCheck.type
    // 2. change of healthCheck.content
    // 3. submit in dialog of change-healthCheck
    getErrMsgForHealthCheck() {
      let errMsg = '';
      const healthCheck = this.newProps.healthCheck;
      switch (healthCheck.type) {
        case 'http':
          const regForHttp = /^\/[A-Za-z0-9_\-\.\/]{1,99}$/;
          if (!regForHttp.exec(healthCheck.content)) {
            errMsg = '以/开头，可以包含字母、数字、下划线、中划线。2-100个字符';
          }
          break;
        case 'shell':
          if (healthCheck.content.trim().length === 0) {
            errMsg = '健康检查不能为空';
          }
          break;
        case 'socket':
          break;
      }
      this.errMsgForHealthCheck = errMsg;
      return errMsg;
    },

    handleButtonClick(evt, action) {
      if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
        this.$storeHelper.globalPopover.show({
          ref: evt.target,
          msg: this.$storeHelper.permission[action].reason
        });
        return;
      }
      switch (action) {
        case 'service_create':
          let infoForAddService = this.getInfoForAddService();
          if (!infoForAddService.success) {
            this.$message.error(infoForAddService.message);
            return;
          }
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            type: 'add',
            data: infoForAddService.content
          };
          this.$router.push(this.$net.page['profile/service/add']);
          break;
        case 'refreshAppList':
          this.requestServiceList(this.selectedAppID, this.selectedProfileID);
          break;
        case 'go-to-work-order-todo-add':
          if (this.selectedAppID == null && this.selectedProfileID == null) {
            this.$message.error('所需信息不完整！');
            return;
          }
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            data: {
              appId: this.selectedAppID,
              profileId: this.selectedProfileID
            }
          };
          this.$router.push(this.$net.page['profile/work-order/todo/add']);
          break;
        case 'go-page-domain-from-service-list':
          if (this.selectedAppID == null && this.selectedProfileID == null) {
            this.$message.error('所需信息不完整！');
            return;
          }
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            data: {
              appId: this.selectedAppID,
              profileId: this.selectedProfileID
            }
          };
          this.$router.push(this.$net.page['profile/domain']);
          break;
      }
    },
    // change the default service
    changeDefaultVersion(serviceID) {
      this.warningConfirm(`更改默认版本后，内、外网访问应用将指向默认版本的内、外网域名，你确定需要更改吗？`).then(() => {
        this.$net.changeDefaultService({
          beforeSwitchId: this.defaultServiceID,
          afterSwitchId: serviceID
        }).then(msg => {
          this.$message.success(msg);
          this.defaultServiceID = serviceID;
        }).catch(msg => {
          this.$notify({
            title: err.title,
            message: err.msg,
            duration: 0,
            onClose: function () {
            }
          });
        })
      }).catch(() => {});
    },

    /**
     * set the value to show in this page
     */
    valueToShow(value){
      let result = value;
      if ('' === value || null == value || (Array.isArray(value) && 0 == value.length)
      || ('object' === typeof(value) && Object.keys(value).length > 0)) {
        result = '未设置';
      }
      return result;
    },

    getVersionDescription(row) {
      let profileInfo = this.$storeHelper.getProfileInfoByID(this.selectedProfileID);
      let description = profileInfo && profileInfo.hasOwnProperty('description') ? profileInfo.description : '';
      let desc = `应用"${this.selectedApp.appName}"${description}的${row.serviceVersion}版本服务`;
      return desc;
    },

    async serviceDeploy(payload, type) {
      // request and show log
      const filterReg = /^ *\[( *(?:INFO|WARNING|ERROR) *)\](.*)$/;
      // recursive function to fetch log from server with options {logName, logPath, offset}
      const getDeployLog = async (options) => {
        // stop request deploy log when the window is closed
        if (!this.dialogForLogStatus.visible) {
          return Promise.reject('弹框关闭');
        }
        const resContent = await this.$net.serviceGetDeployLog(options);
        if (resContent.hasOwnProperty('Orchestration')) {
          const orchestration = resContent['Orchestration'];
          const logs = orchestration.log;
          if (logs) {
            const logList = logs.split('\n').filter(it => {
              return it;
            }).map(it => {
              // replace white-space with &nbsp
              return it.replace(/^( *)(.*)$/, (match, p1, p2) => {
                return '&nbsp;'.repeat(p1.length) + p2;
              });
            }).map(it => {
              return it.replace(filterReg, (match, p1, p2, offset, string) => {
                // console.log(match, p1, offset, string);
                p2 = p2.replace(/(BUILD )*SUCCESS/g, (match, p1, offset, string) => {
                  return `<span class="success">${match}</span>`;
                });
                p2 = p2.replace(/BUILD FAILURE/g, (match, p1, offset, string) => {
                  return `<span class="error">${match}</span>`;
                });
                let result = '';
                switch (p1.toUpperCase()) {
                  case 'INFO':
                    result = `[<span class="info">${p1}</span>]${p2}`;
                    break;
                  case 'WARNING':
                    result = `[<span class="warning">${p1}</span>]${p2}`;
                    break;
                  case 'ERROR':
                    result = `[<span class="error">${p1}</span>]<span class="error">${p2}</span>`;
                    break;
                }
                return result;
              });
            });
            orchestration.logList = logList;
            return orchestration;
          } else {
            // may be orchestration has not prop log at start
            return orchestration;
          }
        } else {
          throw new Error('格式不正确');
        }
      };

      const desc = this.getVersionDescription(this.selected.service);

      var warningMsg = `您确认要部署${desc}吗?`;
      if (type == 'quick-deploy') {
        warningMsg = `<p>您确认要重启${desc}吗?</p><p style="color: #E6A23C; font-size: 12px;">(重启：采用最近一次部署成功的镜像进行服务的重新启动，跳过代码编译、镜像生成阶段)</p>`;
      }
      const urlDesc = type == 'quick-deploy' ? this.$net.URL_LIST.service_quick_deploy : this.$net.URL_LIST.service_deploy
//      await this.warningConfirm(warningMsg);
      await this.$confirm(warningMsg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      });
      const resContent = await this.$net.requestPaasServer(urlDesc, {
        payload
      });
      if (resContent.hasOwnProperty('orchestration')) {
        this.deployLogs = [];
        this.dialogForLogStatus.visible = true;
        this.dialogForLogStatus.showLoading = true;
        let orchestration = resContent['orchestration'];

        while(orchestration && orchestration['moreData']) {
          await new Promise((resolve) => {
            setTimeout(resolve, 1500);
          });
          orchestration = await getDeployLog({
            logName: orchestration.logName,
            logPath: orchestration.logPath,
            offset: null == orchestration.offset ? 0 : orchestration.offset,
            // 正在部署中的日志
            logType: 'deployLog'
          });
          if (!orchestration) {
            break;
          }
          if (orchestration.hasOwnProperty('logList')) {
            // stop showLoading when orchestration.log is not null
            this.dialogForLogStatus.showLoading = false;
            this.deployLogs = this.deployLogs.concat(orchestration['logList']);
            // scroll after render finish
            this.$nextTick(() => {
              if (this.$refs.hasOwnProperty('dialogForDeployLog')) {
                let dialogForDeployLog = this.$refs['dialogForDeployLog'];
                dialogForDeployLog.isScrolledBottom && dialogForDeployLog.scrollToBottom();
              }
            });
          }
        }
        return Promise.reject('已拉取所有日志');
      } else {
        return Promise.reject({
          title: '数据格式错误',
          message: '未找到orchestration'
        })
      }
    },

    /**
     * handle click event in the operation-column
     */
    async handleRowButtonClick(evt, action, index, row) {
      if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
        this.$storeHelper.globalPopover.show({
          ref: evt.target,
          msg: this.$storeHelper.permission[action].reason
        });
        return;
      }
      if (action === 'k8s-tag') {
        this.$storeHelper.globalPopover.show({
          ref: evt.target,
          msg: `这是一个${row.k8s === 1 ? 'k8s':'mesos'}服务`
        });
        return;
      }

      let currentService = this.currentServiceList[index];
      if (!currentService) {
        return;
      } else {
        this.selected.service = currentService;
        this.selected.model = this.currentModelList[index];
      }

      let serviceID = this.selected.service['id'];
      if (!serviceID) {
        console.log('serviceID not found');
        return;
      }
      let statusOK = false;
      switch (action) {
        case 'service_deploy':
          this.addToWaitingResponseQueue(action);
          try {
            await this.serviceDeploy({
              id: this.selected.service['id'],
              appId: this.selectedAppID,
              spaceId: this.selectedProfileID
            }, action);
          } catch (err) {
            console.log(err);
            this.hideWaitingResponse(action);
          }
          break;
        case 'quick-deploy':
          try {
            let reason = this.reason4DisableQuickDeploy(row);
            if (reason) {
              this.$storeHelper.globalPopover.show({
                ref: evt.target,
                msg: reason
              });
            } else {
              this.addToWaitingResponseQueue(action);
              await this.serviceDeploy({
                id: this.selected.service['id'],
                appId: this.selectedAppID,
                spaceId: this.selectedProfileID
              }, action);
              this.hideWaitingResponse(action);
            }
          } catch (err) {
            console.log(err);
            this.hideWaitingResponse(action);
          }
          break;
        case 'service_delete':
          this.addToWaitingResponseQueue(action);
          var desc = this.getVersionDescription(row);
          this.warningConfirm(`删除服务将会销毁"${desc}"的代码和配置信息，同时自动解绑外网二级域名，删除后服务数据不可恢复。`).then(() => {
            this.warningConfirm(`你确认要删除"${desc}"，并清除该服务的一切数据？`).then(() => {
              this.$net.serviceDelete({
                id: serviceID,
                appId: this.selectedAppID,
                spaceId: this.selectedProfileID
              }).then(msg => {
                this.hideWaitingResponse(action);
                this.$message({
                  type: 'success',
                  message: msg
                });
                this.$net.needUpdateAppList = true;
                this.requestServiceList(this.selectedAppID, this.selectedProfileID);
              }).catch(err => {
                this.hideWaitingResponse(action);
                this.$notify.error({
                  title: '提示',
                  message: err,
                  duration: 0,
                  onClose: function () {
                  }
                });
              });
            }).catch(() => {
              this.hideWaitingResponse(action);
            });
          }).catch(()=> {
            this.hideWaitingResponse(action);
          });
          break;
        case 'service_stop':
          this.addToWaitingResponseQueue(action);
          var desc = this.getVersionDescription(row);
          this.$confirm(`停止将会导致"${desc}"不可用，但不会删除代码及配置信息，你确定需要这么做吗?`).then(() => {
            this.$net.serviceStop({
              id: serviceID,
              appId: this.selectedAppID,
              spaceId: this.selectedProfileID
            }).then(msg => {
              this.hideWaitingResponse(action);
              this.$message({
                type: 'success',
                message: msg
              });
            }).catch(err => {
              this.hideWaitingResponse(action);
              this.$notify({
                title: '提示',
                message: err,
                duration: 0,
                onClose: function () {
                }
              });
              console.log(err);
            });
          }).catch(() => {
            this.hideWaitingResponse(action);
          });
          break;
        case 'service_info':
          if (!row.hasOwnProperty('id')) {
            return;
          }
          let key = row.id;
          if (this.expandRows.indexOf(key) > -1) {
            this.expandRows.splice(this.expandRows.indexOf(key), 1);
          } else {
            this.expandRows = [key];
          }
          break;
        case 'copy-service':
          let infoForAddService = this.getInfoForAddService();
          if (!infoForAddService.success) {
            this.$message.error(infoForAddService.message);
            return;
          }

          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            type: 'copy',
            data: JSON.parse(JSON.stringify(Object.assign(infoForAddService.content, this.selected.model)))
          };
          this.$router.push(this.$net.page['profile/service/copy']);
          break;
        case 'go-to-instance-list':
          statusOK = false;
          if (row.hasOwnProperty('id') && this.selectedAppID != null && this.selectedProfileID != null) {
            statusOK = true;
          }
          if (!statusOK) {
            this.$message.error('所需信息不完整！');
          } else {
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/service'],
              data: {
                appId: this.selectedAppID,
                profileId: this.selectedProfileID,
                serviceId: row.id
              }
            };
            this.$router.push(this.$net.page['profile/instance']);
          }
          break;
        case 'go-page-domain-from-service':
          if (!row.hasOwnProperty('id') || this.selectedAppID == null || this.selectedProfileID == null) {
            this.$message.error('所需信息不完整！');
            return;
          }
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            data: {
              appId: this.selectedAppID,
              profileId: this.selectedProfileID,
              serviceId: row.id
            }
          };
          this.$router.push(this.$net.page['profile/domain']);
          break;
        case 'go-to-page-log-deploy-from-service':
          if (!row.hasOwnProperty('id') || this.selectedAppID == null || this.selectedProfileID == null) {
            this.$message.error('所需信息不完整！');
            return;
          }
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            data: {
              appId: this.selectedAppID,
              profileId: this.selectedProfileID,
              serviceId: row.id
            }
          };
          this.$router.push(this.$net.page['profile/log/deploy']);
          break;
        case 'one-apm':
          this.handleChangeProp(evt, 'oneApm')
          break;
      }
    },
    /**
     * do some init action before dialog popup
     * @param prop
     */
    handleChangeProp(evt, prop) {
      if (!this.isPermittedToChangeProp(prop)) {
        this.$storeHelper.globalPopover.show({
          ref: evt.target,
          msg: this.reasonForNotPermittedToChangeProp(prop)
        });
        return;
      }
      if (['instanceNum', 'healthCheck', 'packageInfo', 'portMap', 'prestopCommand', 'image','gitLabAddress', 'gitLabBranch',
          'mainClass', 'relativePath','mavenProfileId',
          'cpuAndMemory', 'rollingUpdate', 'loadBalance', 'environments', 'hosts',
          'fileLocation', 'vmOptions', 'oneApm', 'appMonitor'].indexOf(prop) == -1) {
        console.log(`${prop} not found`);
        return;
      }
      this.waitingResponse = false;
      let formName = 'change' + prop.replace(/^[a-z]/g, (L) => L.toUpperCase()) + 'Form';
      switch (prop) {
        case 'instanceNum':
        case 'gitLabAddress':
        case 'gitLabBranch':
        case 'relativePath':
        case 'mainClass':
        case 'mavenProfileId':
        case 'rollingUpdate':
        case 'loadBalance':
        case 'oneApm':
        case 'appMonitor':
        case 'vmOptions':
          this.newProps[prop] = this.selected.model[prop];
          this.$refs.hasOwnProperty(formName) &&
          this.$refs[formName].validate();
          break;
        case 'healthCheck':
          this.newProps['healthCheck'].type = this.selected.model['healthCheck'].type;
          this.newProps['healthCheck'].content = this.selected.model['healthCheck'].content;
          this.newProps['healthCheck'].initialDelay = this.selected.model['healthCheck'].initialDelay;
          break;
        case 'packageInfo':
          this.newProps['packageInfo'].type = this.selected.model['packageInfo'].type;
          this.newProps['packageInfo'].name = this.selected.model['packageInfo'].name;
          if (!this.$storeHelper.messageForCreateAPP) {
            this.$message.error('信息不完整，请刷新后重试！');
            return;
          }
          const packageTypeList = this.$storeHelper.getPackageTypeListByLanguageAndVersion(
            this.selected.service.language,
            this.selected.service.languageVersion
          );
          if (!packageTypeList) {
            this.$message.error('信息不完整，请刷新后重试！');
            return;
          }
          this.newProps['packageInfo'].packageTypeList = packageTypeList;
          break;
        case 'portMap':
          // reset props for dialog
          this.newProps.portMap.validateErrMsg = '';
          this.newProps['portMap'].id = this.selected.model['portMap'].id;
          this.newProps['portMap'].protocol = this.selected.model['portMap'].protocol;
          this.newProps['portMap'].outerPort = this.selected.model['portMap'].outerPort;
          this.newProps['portMap'].containerPort = this.selected.model['portMap'].containerPort;
          break;
        case 'prestopCommand':
          this.newProps[prop] = this.selected.model[prop];
          break;
        case 'environments':
        case 'hosts':
        case 'fileLocation':
          this.newProps[prop] = JSON.parse(JSON.stringify(this.selected.model[prop]));
          break;
        case 'cpuAndMemory':
          this.newProps['cpuID'] = this.selected.model['cpuID'];
          this.newProps['memoryID'] = this.selected.model['memoryID'];
          break;
        case 'image':
          this.newProps['customImage'] = this.selected.model['customImage'];
          this.newProps['imageLocation'] = this.selected.model['imageLocation'];
          break;
      }
      this.selected.prop = prop;
      // some action must be done after ui-show
      this.$nextTick(() => {
        this.$refs.hasOwnProperty(formName) &&
        this.$refs[formName].validate();
        if (prop === 'image') {
          // pass parameter to component image-selector.vue
          let infoForAddService = this.getInfoForAddService();
          if (infoForAddService.success) {
            let content = infoForAddService.content;
            this.$refs[formName].init({
              groupTag: this.$storeHelper.groupInfo.tag,
              appId: content.appId,
              profileName: content.profileName,
              language: content.language,
              languageVersion: content.languageVersion,
              packageType: this.selected.model.packageInfo.type
            }, {
              customImage: this.newProps.customImage,
              imageLocation: this.newProps.imageLocation
            });
          } else {
            this.$message.error(infoForAddService.message);
            this.selected.prop = null;
          }
        }
      })
    },

    /**
     * do some action of ok button in popup-dialog
     * @param prop
     */
    async handleDialogButtonClick(prop) {
      let formName = 'change' + prop.replace(/^[a-z]/g, (L) => L.toUpperCase()) + 'Form';
      switch (prop) {
        case 'set-default-vmOptions':
          this.newProps['vmOptions'] = `-server -Xmx2g -Xms2g -Xmn256m -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=256m -Xss256k -XX:+UseConcMarkSweepGC -XX:+UseFastAccessorMethods -XX:+UseCMSInitiatingOccupancyOnly -XX:CMSInitiatingOccupancyFraction=70 -XX:+PrintGCTimeStamps -XX:+ExplicitGCInvokesConcurrentAndUnloadsClasses -XX:+PrintGCDetails -XX:+PrintGCDateStamps`;
          break;
        case 'clear-vmOptions':
          this.newProps['vmOptions'] = '';
          break;
        case 'instanceNum':
        case 'gitLabAddress':
        case 'gitLabBranch':
        case 'mainClass':
        case 'relativePath':
        case 'mavenProfileId':
        case 'rollingUpdate':
        case 'loadBalance':
        case 'oneApm':
        case 'appMonitor':
        case 'vmOptions':
        case 'prestopCommand':
          this.$refs[formName].validate((valid) => {
            if (!valid) {
              return;
            }
            if (!this.newProps.hasOwnProperty(prop) || !this.selected.model.hasOwnProperty(prop)) {
              return;
            }
            if (this.newProps[prop] == this.selected.model[prop]) {
              this.selected.prop = null;
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
            } else {
              this.requestUpdate(prop);
            }
          });
          break;
        case 'healthCheck':
          this.$refs[formName].validate((valid) => {
            if (this.getErrMsgForHealthCheck()) {
              valid = false;
            }
            if (!valid) {
              return;
            }
            if (
              this.newProps['healthCheck'].type == this.selected.model['healthCheck'].type &&
              this.newProps['healthCheck'].content == this.selected.model['healthCheck'].content &&
              this.newProps['healthCheck'].initialDelay == this.selected.model['healthCheck'].initialDelay
            ) {
              this.selected.prop = null;
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
            } else {
              this.requestUpdate(prop);
            }
          });
          break;
        case 'packageInfo':
          if (this.newProps.packageInfo.errMsg) {
            return;
          }
          if (
            this.newProps['packageInfo'].type == this.selected.model['packageInfo'].type &&
            this.newProps['packageInfo'].name == this.selected.model['packageInfo'].name
          ) {
            this.selected.prop = null;
            this.$message({
              type: 'warning',
              message: '您没有做修改'
            });
          } else {
            this.requestUpdate(prop);
          }
          break;
        case 'portMap':
          if (
            this.newProps['portMap'].outerPort == this.selected.model['portMap'].outerPort &&
            this.newProps['portMap'].containerPort == this.selected.model['portMap'].containerPort&&
            this.newProps['portMap'].protocol == this.selected.model['portMap'].protocol
          ) {
            this.selected.prop = null;
            this.$message({
              type: 'warning',
              message: '您没有做修改'
            });
          } else {
            if (this.newProps.portMap.syntaxErrMsg) {
              return;
            }
            // 如果端口号没有变，不需要检测
            const outerPort = this.newProps.portMap.outerPort;
            if (outerPort == '') {
              this.newProps.portMap.validateErrMsg = '';
            } else if (outerPort == this.selected.model['portMap'].outerPort) {
              this.requestUpdate(prop);
            } else {
              this.addToWaitingResponseQueue(`change-${prop}`);
              this.$net.getResponse(this.$net.URL_LIST.service_port_map_check, {
                payload: {
                  appId: this.selectedAppID,
                  spaceId: this.selectedProfileID,
                  outerPort: this.newProps.portMap.outerPort
                }
              }).then(res => {
                let errMsgForPortMap = '';
                if (!this.$net.isResponseSuccess(res.data)) {
                  errMsgForPortMap = res.data.msg;
                }
                this.newProps.portMap.validateErrMsg = errMsgForPortMap;
                // 端口检测通过后，更新端口映射
                if (!this.newProps.portMap.errMsg) {
                  this.requestUpdate(prop);
                } else {
                  this.hideWaitingResponse(`change-${prop}`);
                }
              }).catch(err => {
                console.log(err);
                this.hideWaitingResponse(`change-${prop}`);
              });
            }
          }
          break;
        case 'fileLocation':
        case 'environments':
        case 'hosts':
          this.$refs[formName].validate((valid) => {
            if (!valid) {
              return;
            }
            if (!this.newProps.hasOwnProperty(prop) || !this.selected.model.hasOwnProperty(prop)) {
              return;
            }
            if (this.$utils.theSame(this.newProps[prop], this.selected.model[prop])) {
              this.selected.prop = null;
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
            } else {
              this.requestUpdate(prop);
            }
          });
          break;
        case 'image':
          this.$refs[formName].validate((valid) => {
            if (!valid) {
              return;
            }
            const imageInfo = this.$refs[formName].getImageInfo();
            this.newProps.customImage = imageInfo.customImage;
            this.newProps.imageLocation = imageInfo.imageLocation;
            if (!this.newProps.hasOwnProperty('customImage') || !this.selected.model.hasOwnProperty('customImage')
              || !this.newProps.hasOwnProperty('imageLocation') || !this.selected.model.hasOwnProperty('imageLocation')) {
              return;
            }
            if ((this.newProps['customImage'] == this.selected.model['customImage'])
              && (this.newProps['imageLocation'] == this.selected.model['imageLocation'])) {
              this.selected.prop = null;
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
            } else {
              this.requestUpdate(prop);
            }
          });
          break;
        case 'cpuAndMemory':
          this.$refs[formName].validate((valid) => {
            if (!valid) {
              return;
            }
            if (!this.newProps.hasOwnProperty('cpuID') || !this.selected.model.hasOwnProperty('cpuID')
              || !this.newProps.hasOwnProperty('memoryID') || !this.selected.model.hasOwnProperty('memoryID')) {
              return;
            }
            if ((this.newProps['cpuID'] == this.selected.model['cpuID'])
              && (this.newProps['memoryID'] == this.selected.model['memoryID'])) {
              this.selected.prop = null;
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
            } else {
              this.requestUpdate('cpuAndMemory');
            }
          });
          break;
      }
    },
    /**
     * 网络请求，更新数据
     */
    requestUpdate(prop) {
      this.waitingResponse = true;
      let options = {
        appId: this.selectedAppID,
        spaceId: this.selectedProfileID,
        id: this.selected.service['id'],
      };
      switch (prop) {
        case 'instanceNum':
        case 'gitLabAddress':
        case 'gitLabBranch':
        case 'mainClass':
        case 'relativePath':
        case 'mavenProfileId':
        case 'rollingUpdate':
        case 'loadBalance':
        case 'fileLocation':
        case 'environments':
        case 'hosts':
        case 'oneApm':
        case 'appMonitor':
        case 'vmOptions':
        case 'prestopCommand':
          let propMap = {
            'fileLocation': 'volumes',
            'oneApm': 'oneapm'
          };
          let optionKey = prop;
          if (prop in propMap) {
            optionKey = propMap[prop];
          }
          options[optionKey] = this.newProps[prop];
          break;
        case 'healthCheck':
          options['healthCheckType'] = this.$storeHelper.getHealthCheckTypeKeyByDesc(this.newProps['healthCheck'].type);
          options['healthCheck'] = this.newProps['healthCheck'].content;
          options['initialDelaySeconds'] = this.newProps['healthCheck'].initialDelay;
          break;
        case 'packageInfo':
          options['packageType'] = this.newProps['packageInfo'].type;
          options['buildName'] = this.newProps['packageInfo'].name;
          break;
        case 'portMap':
          options['serviceName'] = this.selected.service['serviceName'];
          options['portsMapping'] = [{
            id: this.newProps['portMap'].id,
            protocol: this.newProps['portMap'].protocol,
            outerPort: this.newProps['portMap'].outerPort,
            containerPort: this.newProps['portMap'].containerPort,
            appConfigId: this.selected.service['id']
          }];
          break;
        case 'image':
          options['customImage'] = this.newProps['customImage'];
          options['image'] = this.newProps['imageLocation'];
          break;
        case 'cpuAndMemory':
          options['cpuId'] = this.newProps['cpuID'];
          options['memoryId'] = this.newProps['memoryID'];
          break;
        default:
          break;
      }
      if (Object.keys(options).length > 3) {
        this.$net.serviceUpdate(prop, options).then(msg => {
          this.$message({
            type: 'success',
            message: msg
          });
          this.updateModelInfo(prop);
          // 只在更新成功后关闭弹框
          this.selected.prop = null;
        }).catch(errMsg => {
          this.$net.showError({
            title: '修改失败',
            message: errMsg
          })
        }).finally(() => {
          this.hideWaitingResponse(`change-${prop}`);
          this.waitingResponse = false;
        });
      } else {
        // simulate post
        setTimeout(() => {
          this.waitingResponse = false;
          this.selected.prop = null;
          this.updateModelInfo(prop);
        }, 1000);
      }
    },
    /**
     * update value of service and model when server feedback is ok
     */
    updateModelInfo(prop) {
      switch (prop) {
        case 'instanceNum':
        case 'rollingUpdate':
        case 'loadBalance':
        case 'gitLabAddress':
        case 'gitLabBranch':
        case 'mainClass':
        case 'relativePath':
        case 'mavenProfileId':
        case 'oneApm':
        case 'appMonitor':
        case 'vmOptions':
        case 'prestopCommand':
          this.selected.model[prop] = this.newProps[prop];
          this.selected.service[prop] = this.newProps[prop];
          break;
        case 'healthCheck':
          this.selected.model['healthCheck'].type = this.newProps['healthCheck'].type;
          this.selected.model['healthCheck'].content = this.newProps['healthCheck'].content;
          this.selected.model['healthCheck'].initialDelay = this.newProps['healthCheck'].initialDelay;
          break;
        case 'packageInfo':
          this.selected.model['packageInfo'].type = this.newProps['packageInfo'].type;
          this.selected.model['packageInfo'].name = this.newProps['packageInfo'].name;
          break;
        case 'portMap':
          this.selected.model['portMap'].protocol = this.newProps['portMap'].protocol;
          this.selected.model['portMap'].outerPort = this.newProps['portMap'].outerPort;
          this.selected.model['portMap'].containerPort = this.newProps['portMap'].containerPort;
          break;
        case 'environments':
        case 'hosts':
        case 'fileLocation':
          this.selected.model[prop] = JSON.parse(JSON.stringify(this.newProps[prop]));
          this.selected.service[prop] = JSON.parse(JSON.stringify(this.newProps[prop]));
          break;
        case 'image':
          let customImage = this.newProps['customImage'];
          let imageLocation = this.newProps['imageLocation'];
          this.selected.model['customImage'] = customImage;
          this.selected.model['imageLocation'] = imageLocation;
          this.selected.service.image.customImage = customImage;
          this.selected.service.image.typeName = appPropUtils.getImageNameById(customImage);
          this.selected.service.image.location = imageLocation;
          break;
        case 'cpuAndMemory':
          let cpuID = this.newProps['cpuID'];
          let memoryID = this.newProps['memoryID'];
          this.selected.model['cpuID'] = cpuID;
          this.selected.model['memoryID'] = memoryID;
          let cpuAndMemoryInfo = appPropUtils.getCPUAndMemoryInfoByID(cpuID, memoryID);
          this.selected.service['cpuInfo'] = cpuAndMemoryInfo[0];
          this.selected.service['memoryInfo'] = cpuAndMemoryInfo[1];
          break;
      }
    },

    /**
     * request service list by appId and profileId, the place this function is called:
     * 1. appId is changed in selector
     * 2. profileId is changed in selector
     * 3. refresh button
     * 4. success callback of delete service
     */
    requestServiceList(appID, profileID) {
      if (!appID || !profileID) {
        console.log('appID or profileID can not be empty');
        return;
      }
      this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {
        payload: {
          appId: appID,
          spaceId: profileID
        }
      }).then(resContent => {
        const content = this.$net.parseServiceList(resContent);
        if (content.hasOwnProperty('applicationServerList')) {
          this.currentServiceList = content['applicationServerList'];
          this.currentModelList = content['serviceModelList'];
          this.expandRows = [];

          // get default version
          let findDefault = false;
          this.defaultServiceID = null;
          this.currentServiceList.some(it => {
            if (it.defaultSelect) {
              this.defaultServiceID = it.id;
              findDefault = true;
            }
            return it.defaultSelect;
          });
          if (!findDefault) {
//            this.$message({
//              type: 'warning',
//              message: '未找到默认版本'
//            })
          }
        }
        this.intranetDomain = content.hasOwnProperty('intranetDomain') ? content.intranetDomain : '未知';
        this.internetDomainList = content.hasOwnProperty('internetDomain') ? content.internetDomain : [];
        if (this.internetDomainList.length > 0) {
          this.internetDomain = this.internetDomainList.join(';');
          this.internetDomainHtml = this.internetDomainList.map(it => {
            return `<a href="http://${it}" target="_black">${it}</a>`;
          }).join('<span>; </span>');
        } else {
          this.internetDomain = '未绑定';
          this.internetDomainHtml = '未绑定';
        }
      }).catch();
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

    /* used for dialog */
    // 增删文件存储
    handleFileLocation(action, tag) {
      let fileLocationList = this.newProps.fileLocation;
      switch (action) {
        case 'add':
          tag = tag.trim();
          let reg = /^\/[A-Za-z0-9_\\-\\.@]{2,18}$/;
          if (!reg.exec(tag)) {
            this.$message.warning('以/开头，可包含字母、数字、下划线、中划线。2-18位字符。');
            return;
          }
          if (tag.length > 0) {
            if (fileLocationList.indexOf(tag) > -1) {
              this.$message.warning('该文件存储已存在！');
            } else {
              fileLocationList.push(tag);
              this.fileLocationToAdd = '';
            }
          }
          break;
        case 'remove':
          fileLocationList.splice(fileLocationList.indexOf(tag), 1);
          break;
      }
    },

    // operation for add or delete environment
    handleEnvironment(action, key, value) {
      switch (action) {
        case 'add':
          // remove error notification first
          this.formItemMsgForEnvironments = '';
//          let keyReg = /^[A-Za-z0-9_\-\.@]{1,64}$/;
          let keyReg = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
          let valueReg = /^[A-Za-z0-9_\-\.@]{1,512}$/;
          if (!keyReg.exec(key)) {
            this.$message.error('64位以内的数字、字母、下划线，以字母或下划线开头');
            return;
          }
          if (!valueReg.exec(value)) {
            this.$message.error('请输入512位以内的数字、字母、中划线、下划线');
            return;
          }
          if (this.newProps.environments.length >= 10) {
            this.$message.error('最多输入10个');
            return;
          }
          let itemWithKey = null;
          this.newProps.environments.some(it => {
            if (it.key === key) {
              itemWithKey = it;
            }
            return itemWithKey;
          });
          if (!itemWithKey) {
            this.newProps.environments.push({
              key: key,
              value: value,
            });
            this.environmentKey = '';
            this.environmentValue = '';
          } else {
            this.formItemMsgForEnvironments = `Key "${itemWithKey.key}" 已经存在，如需更改，请删除后重新添加`;
          }
          break;
        case 'delete':
          let index = key;
          this.newProps.environments.splice(index, 1);
          break;
      }
    },
    // operation for add or delete host
    handleHost(action, key, value) {
      switch (action) {
        case 'add':
          // remove error notification first
          this.formItemMsgForHosts = '';
          let ip = key;
          let domain = value;
          let ipReg = new RegExp('^([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})$');
          if (!ip.match(ipReg)) {
            this.$message.error('ip格式不正确');
            return;
          }
          let domainReg = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
          if (!domain.match(domainReg)) {
            this.$message.error('域名格式不正确');
            return;
          }
          if (this.newProps.hosts.length >= 10) {
            this.$message.error('最多输入10个');
            return;
          }
          let itemWithIpAndDomain = null;
          this.newProps.hosts.some(it => {
            if (it.ip === ip && it.domain === domain) {
              itemWithIpAndDomain = it;
            }
          });
          if (!itemWithIpAndDomain) {
            this.newProps.hosts.push({
              ip: ip,
              domain: domain,
            });
            this.hostKey = '';
            this.hostValue = '';
          } else {
            this.formItemMsgForHosts = `"${itemWithIpAndDomain.ip}-${itemWithIpAndDomain.domain}" 已经存在`;
          }
          break;
        case 'delete':
          let index = key;
          this.newProps.hosts.splice(index, 1);
          break;
      }
    },

    handleCPUChange(id) {
      if (Array.isArray(this.cpuAndMemoryList)) {
        this.cpuAndMemoryList.some(it => {
          if (it.hasOwnProperty('cpu') && it.id === id) {
            this.memeorySizeList = it.memoryList;
//            console.log(this.memeorySizeList);
            if (Array.isArray(this.memeorySizeList)) {
              this.memeorySizeList.some(it => {
                if (it.hasOwnProperty('defaultSelect') && 1 === it.defaultSelect) {
//                  this.stepForm3.memory = it.memory;
                  this.newProps['memoryID'] = it.id;
                }
              })
            }
          }
        })
      }
    },
    handleImageTypeChange(value) {
//      switch (value) {
//        case '0':
//          this.imageLocationLabel = '基础镜像地址';
//          this.rules.imageLocation[0].required = false;
//          break;
//        case '1':
//          this.imageLocationLabel = '镜像地址';
//          this.rules.imageLocation[0].required = true;
//          break;
//      }
    },
    /* used for dialog end */
  }

  /**
   * some detail logic of service manager:
   * 1. deploy button should be hidden when the profile is '生产环境', related profile-id is 5
   */
}
</script>