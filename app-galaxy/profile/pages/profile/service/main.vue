<template>
  <div id="service-main">
    <div class="header">
      <el-row class="operation">
        <el-col :span="24" class="selector">
          <div class="item">
            <label style="float: left; width: 72px; line-height: 26px">应用名称：</label>
            <el-select filterable v-model="selectedAppID" placeholder="请选择" style="display:block; max-width: 280px; margin-left: 72px;">
              <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.appName" :value="item.appId">
              </el-option>
            </el-select>
          </div>
          <div class="item">
            <label style="float: left; width: 72px; line-height: 26px">运行环境：</label>
            <el-select v-model="selectedProfileID" placeholder="请选择" style="display:block; max-width: 200px; margin-left: 72px;">
              <el-option v-for="item in currentProfileList" :key="item.id" :label="item.description" :value="item.id">
              </el-option>
            </el-select>
          </div>
        </el-col>
        <div class="el-col el-col-24 btn-list">
          <el-button
                  v-if="!$storeHelper.notPermitted['service_create']"
              size="mini-extral"
              type="primary"
              @click="handleButtonClick('add-service')">
            添加服务
          </el-button>
          <el-button v-if="true"
             size="mini-extral"
             type="primary"
             @click="handleButtonClick('refreshAppList')">刷新</el-button>
          <el-button v-if="isProductionProfile"
                     size="mini-extral"
                     type="primary"
                     @click="handleButtonClick('go-to-work-order-todo-add')">申请工单</el-button>
          <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
            <div slot="content">
              <div>每次创建的服务版本信息为所在应用创建时的配置信息</div>
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
          <span class="text">内网域名：{{intranetDomain}}</span>
        </div>
        <div class="el-col el-col-12">
          <el-tooltip effect="dark" placement="bottom-start" v-if="internetDomainList.length > 1">
            <div slot="content">
              <div v-for="(item, index) in internetDomainList" :key="index">{{item}}</div>
            </div>
            <div>
              <div class="text"><span>外网二级域名：{{internetDomain}}</span></div>
              <i class="el-icon-edit"
                 v-if="!$storeHelper.notPermitted['go-domain-from-service-global']"
                 @click="handleButtonClick('go-to-domain-app')"></i>
            </div>
          </el-tooltip>
          <div v-else>
            <div class="text"><span>外网二级域名：{{internetDomain}}</span></div>
            <i class="el-icon-edit"
               v-if="!$storeHelper.notPermitted['go-domain-from-service-global']"
               @click="handleButtonClick('go-to-domain-app')"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="service-list">
      <el-table
        :data="currentServiceList"
        stripe
        :height="heightOfServiceList"
        :row-key="getRowKeys"
        :expand-row-keys="expandRows"
        v-loading="showLoading"
        element-loading-text="加载中"
      >
        <el-table-column
          label="服务默认版本"
          width="150">
          <template slot-scope="scope">
            <el-radio :label="scope.row.id"
                      :value="defaultServiceID"
                      :disabled="$storeHelper.notPermitted['service_change_default']"
                      @input="changeDefaultVersion">{{scope.row.serviceVersion}}</el-radio>
          </template>
        </el-table-column>
        <el-table-column
          prop="applicationServiceStatus"
          label="运行实例数/总实例数"
          width="160"
          headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="200"
          headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
                    v-if="!isProductionProfile && !$storeHelper.notPermitted['service_deploy']"
                    size="mini-extral" type="warning"
                    :loading="statusOfWaitingResponse('deploy') && selected.service.id == scope.row.id"
                    @click="handleRowButtonClick('deploy', scope.$index, scope.row)"
            >
              {{statusOfWaitingResponse('deploy') && selected.service.id == scope.row.id ? '部署中': '部署'}}
            </el-button>
            <el-button
                    size="mini-extral"type="warning"
                    v-if="!$storeHelper.notPermitted['service_get_deploy_log']"
                    @click="handleRowButtonClick('go-to-log-deploy', scope.$index, scope.row)">部署日志</el-button>
            <el-button
                    size="mini-extral" type="warning"
                    :loading="statusOfWaitingResponse('stop') && selected.service.id == scope.row.id"
                    v-if="!$storeHelper.notPermitted['service_stop']"
                    @click="handleRowButtonClick('stop', scope.$index, scope.row)">停止</el-button>
            <el-button
                    v-if="isProductionProfile"
                    size="mini-extral" type="warning"
                    @click="handleRowButtonClick('one-apm', scope.$index, scope.row)">OneAPM监控</el-button>
            <el-button
                    v-if="!$storeHelper.notPermitted['service_delete']"
                    size="mini-extral" type="danger"
                    :loading="statusOfWaitingResponse('delete') && selected.service.id == scope.row.id"
                    @click="handleRowButtonClick('delete', scope.$index, scope.row)">删除</el-button>
            <el-button
                    size="mini-extral" type="primary"
                    v-if="!$storeHelper.notPermitted['page_instance']"
                    @click="handleRowButtonClick('go-to-instance-list', scope.$index, scope.row)">实例列表</el-button>
            <el-button
                    size="mini-extral" type="primary"
                    v-if="!$storeHelper.notPermitted['go-domain-from-service']"
                    @click="handleRowButtonClick('go-to-domain-service', scope.$index, scope.row)">配置外网二级域名</el-button>
            <el-button
                    size="mini-extral" type="primary"
                    @click="handleRowButtonClick('service_info', scope.$index, scope.row)">
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
              <div class="app-info">
                <div class="title">应用信息</div>
                <el-form label-position="right" label-width="140px" inline size="mini">
                  <el-form-item label="项目名称" class="big">
                    {{valueToShow(selected.service.tag)}}
                  </el-form-item>
                  <el-form-item label="所属Scrum" v-if="selected.service.scrumName">
                    {{selected.service.scrumName}}
                  </el-form-item>
                  <el-form-item label="所属LOB" v-if="selected.service.lobName">
                    {{selected.service.lobName}}
                  </el-form-item>
                  <el-form-item label="开发语言">
                    {{selected.service.language + ' - ' + selected.service.languageVersion}}
                  </el-form-item>
                  <el-form-item label="构建类型">
                    {{valueToShow(selected.service.packageType)}}
                  </el-form-item>
                  <el-form-item label="滚动升级">
                    <span>{{selected.service.rollingUpdate? '需要' : '不需要'}}</span>
                    <i v-if="!$storeHelper.notPermitted['service_update']"
                       class="el-icon-edit" @click="handleChangeProp('rollingUpdate')"></i>
                  </el-form-item>
                  <el-form-item label="负载均衡">
                    {{valueToShow(selected.service.loadBalance)}}
                    <i class="el-icon-edit" @click="handleChangeProp('loadBalance')" v-if="false"></i>
                  </el-form-item>
                  <el-form-item label="健康检查">
                    <span>{{valueToShow(selected.service.healthCheck)}}</span>
                    <i v-if="!$storeHelper.notPermitted['service_update']"
                       class="el-icon-edit" @click="handleChangeProp('healthCheck')"></i>
                  </el-form-item>
                </el-form>
              </div>
              <div class="image-info">
                <div class="title">镜像信息</div>
                <el-form label-position="right" label-width="200px" size="mini">
                  <el-form-item label="镜像方式">
                    <span>{{valueToShow(selected.service.image.typeName)}}</span>
                    <span style="padding-left: 12px; font-weight: bold">基础镜像地址</span>
                    <span>{{selected.service.image.location}} </span>
                    <i v-if="!$storeHelper.notPermitted['service_update']"
                       class="el-icon-edit" @click="handleChangeProp('image')"></i>
                  </el-form-item>
                  <el-form-item label="gitlab_ssh地址">
                    <div class="expand-to-next-line" style="display: inline-block; max-width: calc(100% - 24px)">
                      {{valueToShow(selected.service.gitLabAddress)}}
                    </div>
                    <i v-if="!$storeHelper.notPermitted['service_update']"
                       class="el-icon-edit" @click="handleChangeProp('gitLabAddress')"></i>
                  </el-form-item>
                  <el-form-item label="gitlab分支">
                    <div class="expand-to-next-line" style="display: inline-block; max-width: calc(100% - 24px)">
                      {{valueToShow(selected.service.gitLabBranch)}}
                    </div>
                    <i v-if="!$storeHelper.notPermitted['service_update']"
                       class="el-icon-edit" @click="handleChangeProp('gitLabBranch')"></i>
                  </el-form-item>
                  <el-form-item label="Gitlab父级pom.xml相对路径" v-if="selectedApp.isJavaLanguage" class="relativePathOfParentPOM">
                    <div class="expand-to-next-line" style="display: inline-block; max-width: calc(100% - 24px)">
                      {{valueToShow(selected.service.relativePath)}}
                     </div>
                  </el-form-item>
                  <el-form-item label="Maven profile id" v-if="selectedApp.isJavaLanguage">
                    <div class="expand-to-next-line" style="display: inline-block; max-width: calc(100% - 24px)">
                      {{valueToShow(selected.service.mavenProfileId)}}
                    </div>
                    <i v-if="!$storeHelper.notPermitted['service_update']"
                       class="el-icon-edit" @click="handleChangeProp('mavenProfileId')"></i>
                  </el-form-item>
                </el-form>
              </div>
              <div class="instance-info">
                <div class="title">服务信息</div>
                <el-form label-position="right" label-width="140px" inline size="mini">
                  <el-form-item label="CPU/内存">
                    <span>{{selected.service.cpuInfo.size + '核 / ' + selected.service.memoryInfo.size + 'G'}}</span>
                    <i v-if="!$storeHelper.notPermitted['service_update']"
                       class="el-icon-edit" @click="handleChangeProp('cpuAndMemory')"></i>
                  </el-form-item>
                  <el-form-item label="实例数量">
                    {{valueToShow(selected.service.instanceNum)}}
                  </el-form-item>
                  <el-form-item label="当前服务的内网域名" class="big">
                      {{valueToShow(selected.service.intranetDomain)}}
                  </el-form-item>
                  <el-form-item label="文件存储" class="big file-location" v-if="false">
                    <div v-if="selected.service.fileLocation && selected.service.fileLocation.length > 0">
                      <el-tag
                              v-for="tag in selected.service.fileLocation"
                              :key="tag"
                              type="success"
                      >{{tag}}</el-tag>
                      <i class="el-icon-edit" @click="handleChangeProp('fileLocation')"></i>
                    </div>
                    <div v-else>
                      <span>未设置</span>
                      <i class="el-icon-edit" @click="handleChangeProp('fileLocation')"></i>
                    </div>
                  </el-form-item>
                  <el-form-item label="VM_Options" class="big" v-if="selectedApp.isJavaLanguage">
                    <div class="expand-to-next-line" style="display: inline-block; max-width: calc(100% - 24px)">
                      {{selected.service.vmOptions ? selected.service.vmOptions:'未设置'}}
                    </div>
                    <i v-if="!$storeHelper.notPermitted['service_update']"
                       class="el-icon-edit" @click="handleChangeProp('vmOptions')"></i>
                  </el-form-item>
                  <el-form-item label="环境变量配置" class="big">
                    <div v-if="selected.service.environments && selected.service.environments.length > 0">
                      <el-row>
                        <el-col :span="10" style="font-weight: bold;text-align: center">Key</el-col>
                        <el-col :span="10" style="font-weight: bold;text-align: center">Value</el-col>
                        <el-col :span="4" style="font-weight: bold;text-align: left">
                          <i v-if="!$storeHelper.notPermitted['service_update']"
                             class="el-icon-edit" @click="handleChangeProp('environments')"></i>
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
                      <i v-if="!$storeHelper.notPermitted['service_update']"
                         class="el-icon-edit" @click="handleChangeProp('environments')"></i>
                    </div>
                  </el-form-item>
                  <el-form-item label="Host配置" class="big">
                    <div v-if="selected.service.hosts && selected.service.hosts.length > 0">
                      <el-row>
                        <el-col :span="10" style="font-weight: bold; text-align: center">IP</el-col>
                        <el-col :span="10" style="font-weight: bold; text-align: center">域名</el-col>
                        <el-col :span="4" style="font-weight: bold;text-align: left">
                          <i v-if="!$storeHelper.notPermitted['service_update']"
                             class="el-icon-edit" @click="handleChangeProp('hosts')"></i>
                        </el-col>
                      </el-row>
                      <el-row
                              v-for="(item, index) in selected.service.hosts"
                              :key="item.ip"
                      >
                        <el-col :span="10" style="text-align: center">{{item.ip}}</el-col>
                        <el-col :span="10" style="text-align: center">{{item.domain}}</el-col>
                        <el-col :span="4"></el-col>
                      </el-row>
                    </div>
                    <div v-else>
                      <span>未设置</span>
                      <i v-if="!$storeHelper.notPermitted['service_update']"
                         class="el-icon-edit" @click="handleChangeProp('hosts')"></i>
                    </div>
                  </el-form-item>
                </el-form>
              </div>
          </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="更改健康检查" :visible="selected.prop == 'healthCheck'"
               :close-on-click-modal="false"
               class="health-check size-500"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改健康检查后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" size="mini" labelWidth="150px" ref="changeHealthCheckForm">
        <el-form-item label="当前健康检查：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
          <div class="expand-to-next-line">{{selected.model.healthCheck}}</div>
        </el-form-item>
        <el-form-item label="更改健康检查为：" prop="healthCheck" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
          <el-input v-model="newProps.healthCheck" placeholder="以/开头，可以包含字母数字下划线中划线，2-50位"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('healthCheck')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
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
        <span>更改镜像方式后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-row>
        当前镜像方式： {{selected.service.image.typeName}}；镜像地址： {{selected.service.image.location}}
      </el-row>
      <el-row>
        更改镜像方式为：
      </el-row>
      <my-image-selector ref="changeImageForm"></my-image-selector>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('image')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
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
        <span>更改文件存储后需要重新【部署】才能生效！</span>
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
        <span>更改Gitlab_ssh后需要重新【部署】才能生效！</span>
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
        <span>更改Gitlab分支后需要重新【部署】才能生效！</span>
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

    <el-dialog title="更改maven profile id" :visible="selected.prop == 'mavenProfileId'"
               :close-on-click-modal="false"
               @close="selected.prop = null"
               class="gitlab-address size-550"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改maven profile id后需要重新【部署】才能生效！</span>
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
        <span>更改实例规格后需要重新【部署】才能生效！</span>
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
        <span>更改滚动升级后需要重新【部署】才能生效！</span>
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
               class="load-balance size-500"
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
               class="vm-options size-700"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改VM_Options后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="changeVmOptionsForm" size="mini">
        <el-form-item label="当前VM_Options：">
          <div class="expand-to-next-line">{{selected.service.vmOptions ? selected.service.vmOptions:'未设置'}}</div>
        </el-form-item>
        <el-form-item label="更改VM_Options为：" prop="vmOptions">
          <el-input v-model="newProps.vmOptions" placeholder="不能包含中文，不能超过512个字符"></el-input>
        </el-form-item>
      </el-form>
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
        <span>更改环境变量后需要重新【部署】才能生效！</span>
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
        <span>更改Host配置后需要重新【部署】才能生效！</span>
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
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('oneApm')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button action="profile-dialog/cancel"
                       @click="selected.prop = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <my-dialog-for-log title="部署日志" :showStatus="dialogForLogStatus" ref="dialogForDeployLog">
      <div slot="log-list">
        <div v-for="(item,index) in deployLogs" :key="index" class="log-item">{{item}}</div>
      </div>
    </my-dialog-for-log>
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
            margin: 0px auto;
            max-width: 800px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            box-shadow: 0 0 2px 0 rgba(64,158,255, .6);
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

            .app-info {
              border-bottom: 1px solid lightgray;
              .el-form {
                .el-form-item {
                  width: 50%;
                  &.big {
                    @include expand-inline-form-item;
                    .el-form-item__content {
                      margin-left: 140px;
                    }
                  }
                }
              }
            }
            .image-info {
              border-bottom: 1px solid lightgray;
            }
            .instance-info {
              .el-form {
                .el-form-item {
                  width: 50%;
                  &.big {
                    @include expand-inline-form-item;
                    .el-form-item__content {
                      margin-left: 140px;
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
  }
</style>
<style lang="scss" scoped>
  #service-main {
    background: white;
    height: 100%;
    margin:0px 6px;
    padding: 0px 5px;
    max-width: 1300px;

    /*box-shadow: 0 2px 8px rgba(0,0,0,0.1);*/
    .el-icon-edit {
      margin-left: 2px;
      font-size: 100%;
      line-height: 100%;
      color: #eb9e05;
      vertical-align: middle;
      &:hover {
        font-weight: bold;
      }
    }
    .header {
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
      height: calc(100% - 120px);
      .el-table {
        .el-table__row {
          .el-button {
            margin: 2px 4px;
            float: left;
            .el-icon-arrow-right {
              vertical-align: middle;
              transition: transform 0.2s ease-in-out;
              &.expand {
                transform: rotate(90deg);
              }
            }
            &:first-child {
              margin-left: 0px;
            }
          }
          .el-button + .el-button {
            margin-left: 0px;
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
  import appPropUtils from '../utils/app-props';
  import MyDialogForLog from '../components/dialog4log.vue'
  import MyImageSelector from '../components/image-selector.vue'
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
export default {
  components: {MyDialogForLog, MyImageSelector},
  created() {
  },
  mounted() {
    if (!this.appInfoListOfGroup) {
      this.$store.dispatch('user/appInfoListOfGroup', {
        from: 'page/app/add',
        groupID: this.$storeHelper.currentGroupID
      });
    } else {
      this.onAppInfoListOfGroup(this.appInfoListOfGroup);
    }
    if (!this.cpuAndMemoryList) {
      this.$store.dispatch('app/messageForCreateAPP');
    } else {
      this.onCpuAndMemoryList(this.cpuAndMemoryList);
    }

    // adjust the height of el-table in the area service-list
    try {
      this.serviceListNode = this.$el.querySelector('.service-list');
      this.heightOfServiceList = this.serviceListNode.clientHeight - 20;
      this.resizeListenerForServiceList = (evt) => {
        let target = evt.target;
        this.heightOfServiceList = target.clientHeight - 20;
      };
      addResizeListener(this.serviceListNode, this.resizeListenerForServiceList)
    } catch(err) {
    }
  },
  beforeDestroy() {
    removeResizeListener(this.serviceListNode, this.resizeListenerForServiceList);
  },
  computed: {
    appInfoListOfGroup() {
      return this.$storeHelper.appInfoListOfGroup;
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
    }
    /* used for dialog end */
  },
  data() {
    return {
      serviceListNode: null,
      resizeListenerForServiceList: () => {},
      heightOfServiceList: '',

      appList: [],
//      totalSize: 0,

      showLoading: false,
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
      newProps: {
        healthCheck: '',
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
        mavenProfileId: '',
        fileLocation: [],
        vmOptions: '',
        oneApm: '',
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
        showLoading: false
      },

      queueForWaitingResponse: []
    }
  },
  watch: {
    appInfoListOfGroup: 'onAppInfoListOfGroup',
    cpuAndMemoryList: 'onCpuAndMemoryList',
    selectedAppID: function (value, oldValue) {
      let appID = value;
      let appInfo = this.$storeHelper.getAppInfoByID(appID);
      if (!appInfo) {
        return;
      }
      this.serviceInfo.appID = value;
      this.selectedApp = appInfo['app'];
      this.currentProfileList = this.selectedApp['profileList'];
      if (Array.isArray(this.currentProfileList) && this.currentProfileList.length > 0) {
        // at the beginning of this page(value of selectedProfileID is null), get selectedProfileID from localStorage
        // else selectedProfileID is the first element in profileList of selectedApp
        let defaultProfileID = this.currentProfileList[0]['id'];
        if (null == this.selectedProfileID || this.$storeHelper.SERVICE_ID_FOR_NULL == this.selectedProfileID) {
          let selectedProfileID = this.$storeHelper.getUserConfig('profile/service/profileID');
          // check whether selectedProfileID exist in currentProfileList
          selectedProfileID = this.currentProfileList.map(it => {
            if (it && it.id) {
              return it.id
            }
          }).indexOf(selectedProfileID) > -1 ? selectedProfileID: defaultProfileID;

          if (selectedProfileID) {
            this.selectedProfileID = selectedProfileID;
          } else {
            this.selectedProfileID = defaultProfileID;
          }
          this.requestServiceList(this.selectedApp.appId, this.selectedProfileID);
        } else {
          // request service list when app id is changed while profile id is not changed.
          if (this.selectedProfileID === defaultProfileID) {
            this.requestServiceList(this.selectedApp.appId, this.selectedProfileID);
          } else {
            this.selectedProfileID = defaultProfileID;
          }
        }
      }
      this.$storeHelper.setUserConfig('profile/service/appID', appID);
    },
    selectedProfileID: function (profileID, oldValue) {
      if (this.$storeHelper.SERVICE_ID_FOR_NULL === profileID) {
        return;
      }
      this.serviceInfo.profileID = profileID;
      this.isProductionProfile = this.$storeHelper.isProductionProfile(profileID);
      let appID = this.selectedApp.appId;
      this.requestServiceList(appID, profileID);
      this.$storeHelper.setUserConfig('profile/service/profileID', profileID);
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
        if (!this.appList || (0 == this.appList.length)) {
          this.$notify.warning({
            title: '该团队应用列表为空',
            message: '某些操作可能无法正常进行！',
            duration: 3 * 1000,
            onClose: function () {
            }
          });
          return;
        }
        let localID = this.$storeHelper.getUserConfig('profile/service/appID');
        let appID = null;
        if (localID && this.$storeHelper.getAppInfoByID(localID)) {
          appID = localID;
        } else {
          appID = this.appList[0]['appId'];
        }
        this.selectedAppID = appID;
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
      let result = null;
      let appInfo = this.$storeHelper.getAppByID(this.selectedAppID);
      let appName = null;
      if (appInfo && appInfo.hasOwnProperty('appName')) {
        appName = appInfo.appName;
      }

      // profile info
      let profileInfo = this.$storeHelper.getProfileInfoByID(this.selectedProfileID);
      let profileName = null;
      let profileDescription = null;
      if (profileInfo && profileInfo.hasOwnProperty('name') && profileInfo.hasOwnProperty('description')) {
        profileName = profileInfo.name;
        profileDescription = profileInfo.description;
      }
      // group info
      let groupInfo = this.$storeHelper.groupInfo();
      let groupTag = null;
      if (groupInfo && groupInfo.hasOwnProperty('tag')) {
        groupTag = groupInfo.tag;
      }
      // language info
      let language = null;
      let languageVersion = null;
      if (this.selectedApp && this.selectedApp.hasOwnProperty('language')) {
        language = this.selectedApp.language;
        languageVersion = this.selectedApp.languageVersion;
      }
      // has-existed version
      let versionList = [];
      if (this.currentServiceList && Array.isArray(this.currentServiceList)) {
        versionList = this.currentServiceList.filter(it => {
          return it.hasOwnProperty('serviceVersion') && it['serviceVersion'] && it['serviceVersion'][0] === 'v';
        }).map(it => {
          return it['serviceVersion'].substring(1);
        })
      }

      if (null !== groupTag && null !== this.selectedAppID && null !== this.selectedProfileID &&
        appName, profileName && profileDescription && language && languageVersion) {
        result = {
          groupTag: groupTag,
          appId: this.selectedAppID,
          profileId: this.selectedProfileID,
          appName, profileName, profileDescription,
          language: language,
          languageVersion: languageVersion,
          versionList: versionList
        }
      } else {
        console.log('error: infoForAddService');
      }
      return result;
    },
    handleButtonClick(action) {
      switch (action) {
        case 'add-service':
          let infoForAddService = this.getInfoForAddService();
          if (null == infoForAddService) {
            this.$message.error('数据不完整！尝试刷新页面重试');
            return;
          }
          this.$storeHelper.spaDataTransfer = infoForAddService;
          this.$router.push('/service/add');
          break;
        case 'refreshAppList':
          this.requestServiceList(this.selectedAppID, this.selectedProfileID);
          break;
        case 'go-to-work-order-todo-add':
          let statusOK = false;
          if (this.selectedAppID != null && this.selectedProfileID != null) {
            statusOK = true;
          }
          if (!statusOK) {
            this.$message.error('所需信息不完整！');
          } else {
            this.$storeHelper.setUserConfig('profile/service', {
              appID: this.selectedAppID,
              profileID: this.selectedProfileID
            });
            this.$router.push({
              path: '/work-order/todo/add',
              query: {
                from: '/service'
              }
            });
          }
          break;
        case 'go-to-domain-app':
          var statusOK = false;
          if (this.selectedAppID != null && this.selectedProfileID != null) {
            statusOK = true;
          }
          if (!statusOK) {
            this.$message.error('所需信息不完整！');
          } else {
            this.$storeHelper.setUserConfig('profile/service', {
              appID: this.selectedAppID,
              profileID: this.selectedProfileID,
            });
            this.$router.push({
              path: '/domain',
              query: {
                from: '/service',
                action: 'go-to-domain-app'
              }
            });
          }
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
      let desc = `${this.selectedApp.appName}-${description}-${row.serviceVersion}版本`;
      return desc;
    },
    /**
     * handle click event in the operation-column
     */
    handleRowButtonClick(action, index, row) {
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
        case 'deploy':
          this.addToWaitingResponseQueue('deploy');
//          setTimeout(() => {
//            this.hideWaitingResponse('deploy');
//          }, 30000);
          // request and show log
          function showDeployLog(options) {
            this.deployLogs = [];
            this.dialogForLogStatus.visible = true;
            // recursive function to fetch log from server with options {logName, logPath, offset}
            function getDeployLog(options) {
              // stop request deploy log when the window is closed
              if (!this.dialogForLogStatus.visible) {
                return;
              }
              this.$net.serviceGetDeployLog(options).then(content => {
                if (content.hasOwnProperty('Orchestration')) {
                  let Orchestration = content.Orchestration;
                  let log = Orchestration.log;
//                  console.log(log);
//                  console.log(content);
//                  console.log(Orchestration.offset);
                  if (log) {
                    // scroll after render finish
                    this.deployLogs = this.deployLogs.concat(log.split('\n'));
                    this.$nextTick(() => {
                      this.$refs.hasOwnProperty('dialogForDeployLog') &&
                      this.$refs['dialogForDeployLog'].scrollToBottom();
                    });
                  }
                  options.offset = Orchestration.offset;
//                  if (null != log) {
                  if (Orchestration.moreData) {
                    setTimeout(() => {
                      getDeployLog.call(this, options);
                    }, 1800);
                  }
                }
              }).catch(err => {
                console.log(err);
              });
            }

            setTimeout(() => {
              getDeployLog.call(this, options);
            }, 1500);
          }

          var desc = this.getVersionDescription(row);
          this.warningConfirm(`您确认要部署${desc}吗?`).then(() => {
            this.$net.serviceDeploy({
              id: serviceID,
              appId: this.selectedAppID,
              spaceId: this.selectedProfileID
            }).then(content => {
              this.hideWaitingResponse('deploy');
//            console.log(content);
              if (content.hasOwnProperty('orchestration')) {
                let orchestration = content['orchestration'];
                showDeployLog.call(this, {
                  logName: orchestration.logName,
                  logPath: orchestration.logPath,
                  offset: null == orchestration.offset ? 0 : orchestration.offset
                });
              }
            }).catch(err => {
              this.hideWaitingResponse('deploy');
              this.$notify.error({
                title: '部署失败',
                message: err,
                duration: 0,
                onClose: function () {
                }
              });
            });
          }).catch(() => {
            this.hideWaitingResponse('deploy');
          });
          break;
        case 'delete':
          this.addToWaitingResponseQueue('delete');
          var desc = this.getVersionDescription(row);
          this.warningConfirm(`删除服务将会销毁"${desc}"的代码和配置信息，同时自动解绑外网二级域名，删除后服务数据不可恢复。`).then(() => {
            this.warningConfirm(`你确认要删除"${desc}"，并清除该服务的一切数据？`).then(() => {
              this.$net.serviceDelete({
                id: serviceID,
                appId: this.selectedAppID,
                spaceId: this.selectedProfileID
              }).then(msg => {
                this.hideWaitingResponse('delete');
                this.$message({
                  type: 'success',
                  message: msg
                });
                this.requestServiceList(this.selectedAppID, this.selectedProfileID);
              }).catch(err => {
                this.hideWaitingResponse('delete');
                this.$notify.error({
                  title: '提示',
                  message: err,
                  duration: 0,
                  onClose: function () {
                  }
                });
              });
            }).catch(() => {
              this.hideWaitingResponse('delete');
            });
          }).catch(()=> {
            this.hideWaitingResponse('delete');
          });
          break;
        case 'stop':
          this.addToWaitingResponseQueue('stop');
          var desc = this.getVersionDescription(row);
          this.$confirm(`停止将会导致"${desc}"不可用，但不会删除代码及配置信息，你确定需要这么做吗?`).then(() => {
            this.$net.serviceStop({
              id: serviceID,
              appId: this.selectedAppID,
              spaceId: this.selectedProfileID
            }).then(msg => {
              this.hideWaitingResponse('stop');
              this.$message({
                type: 'success',
                message: msg
              });
            }).catch(err => {
              this.hideWaitingResponse('stop');
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
            this.hideWaitingResponse('stop');
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
        case 'go-to-instance-list':
          statusOK = false;
          if (row.hasOwnProperty('id') && this.selectedAppID != null && this.selectedProfileID != null) {
            statusOK = true;
          }
          if (!statusOK) {
            this.$message.error('所需信息不完整！');
          } else {
            this.$storeHelper.setUserConfig('profile/instance', {
              appID: this.selectedAppID,
              profileID: this.selectedProfileID,
              serviceID: row.id
            });
            this.$router.push({
              path: '/instance',
              query: {
                from: '/service'
              }
            });
          }
          break;
        case 'go-to-domain-service':
          statusOK = false;
          if (row.hasOwnProperty('id') && this.selectedAppID != null && this.selectedProfileID != null) {
            statusOK = true;
          }
          if (!statusOK) {
            this.$message.error('所需信息不完整！');
          } else {
            this.$storeHelper.setUserConfig('profile/service', {
              appID: this.selectedAppID,
              profileID: this.selectedProfileID,
              serviceID: row.id
            });
            this.$router.push({
              path: '/domain',
              query: {
                from: '/service',
                action: 'go-to-domain-service'
              }
            });
          }
          break;
        case 'go-to-log-deploy':
          statusOK = false;
          if (row.hasOwnProperty('id') && this.selectedAppID != null && this.selectedProfileID != null) {
            statusOK = true;
          }
          if (!statusOK) {
            this.$message.error('所需信息不完整！');
          } else {
            this.$storeHelper.setUserConfig('profile/service', {
              appID: this.selectedAppID,
              profileID: this.selectedProfileID,
              serviceID: row.id
            });
            this.$router.push({
              path: '/log/deploy',
              query: {
                from: '/service'
              }
            });
          }
          break;
        case 'one-apm':
          this.handleChangeProp('oneApm')
          break;
      }
    },
    /**
     * do some init action before dialog popup
     * @param prop
     */
    handleChangeProp(prop) {
      if (['healthCheck', 'image','gitLabAddress', 'gitLabBranch', 'mavenProfileId',
          'cpuAndMemory', 'rollingUpdate', 'loadBalance', 'environments', 'hosts',
          'fileLocation', 'vmOptions', 'oneApm'].indexOf(prop) == -1) {
        console.log(`${prop} not found`);
        return;
      }
      this.waitingResponse = false;
      let formName = 'change' + prop.replace(/^[a-z]/g, (L) => L.toUpperCase()) + 'Form';
      switch (prop) {
        case 'healthCheck':
        case 'gitLabAddress':
        case 'gitLabBranch':
        case 'mavenProfileId':
        case 'rollingUpdate':
        case 'loadBalance':
        case 'oneApm':
        case 'vmOptions':
          this.newProps[prop] = this.selected.model[prop];
          this.$refs.hasOwnProperty(formName) &&
          this.$refs[formName].validate();
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
          if (infoForAddService) {
            this.$refs[formName].init(this.getInfoForAddService(), this.newProps);
          } else {
            this.selected.prop = null;
            this.$message.error('获取信息失败！');
          }
        }
      })
    },

    /**
     * do some action of ok button in popup-dialog
     * @param prop
     */
    handleDialogButtonClick(prop) {
      let formName = 'change' + prop.replace(/^[a-z]/g, (L) => L.toUpperCase()) + 'Form';
      switch (prop) {
        case 'healthCheck':
        case 'gitLabAddress':
        case 'gitLabBranch':
        case 'mavenProfileId':
        case 'rollingUpdate':
        case 'loadBalance':
        case 'oneApm':
        case 'vmOptions':
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
            this.newProps = this.$refs[formName].getImageInfo();
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
        case 'healthCheck':
        case 'gitLabAddress':
        case 'gitLabBranch':
        case 'mavenProfileId':
        case 'rollingUpdate':
        case 'loadBalance':
        case 'fileLocation':
        case 'environments':
        case 'hosts':
        case 'oneApm':
        case 'vmOptions':
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
          this.waitingResponse = false;
          this.selected.prop = null;
          this.$message({
            type: 'success',
            message: msg
          });
          this.updateModelInfo(prop);
        }).catch(err => {
          this.waitingResponse = false;
          this.selected.prop = null;
          this.$notify.error({
            title: '修改失败！',
            message: err,
            duration: 0,
            onClose: function () {
            }
          });
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
        case 'healthCheck':
        case 'rollingUpdate':
        case 'loadBalance':
        case 'gitLabAddress':
        case 'gitLabBranch':
        case 'mavenProfileId':
        case 'oneApm':
        case 'vmOptions':
          this.selected.model[prop] = this.newProps[prop];
          this.selected.service[prop] = this.newProps[prop];
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
      this.showLoading = true;
      this.$net.getServiceListByAppIDAndProfileID({
        appId: appID,
        spaceId: profileID
      }).then(content => {
        if (content.hasOwnProperty('applicationServerList')) {
          this.currentServiceList = content['applicationServerList'];
          this.currentModelList = content['serviceModelList'];
          this.showLoading = false;
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
        } else {
          this.internetDomain = '未绑定';
        }
      }).catch(err => {
        this.showLoading = false;
        this.$notify.error({
          title: err.title,
          message: err.msg,
          duration: 0,
          onClose: function () {
          }
        });
        console.log(err);
      });
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