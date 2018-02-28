<template>
  <div id="service-main">
    <div class="header">
      <el-row class="operation">
        <el-col :span="6">
          <el-button
              size="mini-extral"
              type="primary"
              @click="handleButtonClick('linker', {path: '/profile/service/add'})">
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
        </el-col>
        <el-col :span="18" class="app-selector">
          <div class="item">
            <label style="float: left; width: 72px; line-height: 26px">应用名称：</label>
            <el-select filterable v-model="selectedAppID" placeholder="请选择" style="display:block; max-width: 280px; margin-left: 72px;">
              <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.serviceName" :value="item.appId">
              </el-option>
            </el-select>
          </div>
          <div class="item">
            <label style="float: left; width: 72px; line-height: 26px">运行环境：</label>
            <el-select v-model="selectedProfileID" placeholder="请选择" style="display:block; max-width: 200px; margin-left: 72px;">
              <el-option v-for="item in selectedProfileList" :key="item.id" :label="item.description" :value="item.id">
              </el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>
      <el-row class="notice">
        <el-tag type="warning">
          <i class="el-icon-warning"></i>
          <span>每次创建的服务版本信息为所在应用创建时的配置信息</span>
        </el-tag>
      </el-row>
      <el-row class="domain" type="flex" justify="center" align="middle">
        <el-col :span="12"><div class="text">内网域名：{{intranetDomain}}</div></el-col>
        <el-col :span="12">
          <div class="text"><span>外网二级域名：{{internetDomain}}</span></div>
          <i class="el-icon-edit" @click="handleButtonClick('go-to-domain-app')"></i>
        </el-col>
      </el-row>
    </div>
    <div class="service-list">
      <el-table
        :data="currentServiceList"
        style="width: 100%"
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
                      @input="changeDefaultVersion">{{scope.row.serviceVersion}}</el-radio>
          </template>
        </el-table-column>
        <el-table-column
          prop="intranetDomain"
          label="内网域名"
          headerAlign="left" align="left"
        >
        </el-table-column>
        <el-table-column
          prop="applicationStatus"
          label="状态"
          width="80"
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
                    v-if="!isProductionProfile"
                    size="mini-extral" type="warning"
                    :loading="statusOfWaitingResponse('deploy') && selected.service.id == scope.row.id"
                    @click="handleRowButtonClick('deploy', scope.$index, scope.row)">
              {{statusOfWaitingResponse('deploy') && selected.service.id == scope.row.id ? '部署中': '部署'}}
            </el-button>
            <el-button
                    size="mini-extral"type="warning"
                    @click="handleRowButtonClick('go-to-log-deploy', scope.$index, scope.row)">部署日志</el-button>
            <el-button
                    size="mini-extral" type="warning"
                    @click="handleRowButtonClick('stop', scope.$index, scope.row)">停止</el-button>
            <el-button
                    size="mini-extral" type="warning"
                    @click="handleRowButtonClick('go-to-instance-list', scope.$index, scope.row)">实例列表</el-button>
            <el-button
                    size="mini-extral" type="warning"
                    @click="handleRowButtonClick('go-to-domain-service', scope.$index, scope.row)">配置外网二级域名</el-button>
            <el-button
                    v-if="isProductionProfile"
                    size="mini-extral" type="warning"
                    @click="handleRowButtonClick('one-apm', scope.$index, scope.row)">OneAPM监控</el-button>
            <el-button
                    size="mini-extral" type="warning"
                    @click="handleRowButtonClick('delete', scope.$index, scope.row)">删除</el-button>
            <el-button
                    size="mini-extral" type="warning"
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
                  <el-form-item label="项目名称：">
                    {{valueToShow(selected.service.tag)}}
                  </el-form-item>
                  <el-form-item label="开发语言：">
                    {{selected.service.language + ' - ' + selected.service.languageVersion}}
                  </el-form-item>
                  <el-form-item label="构建类型：">
                    {{valueToShow(selected.service.packageType)}}
                  </el-form-item>
                  <el-form-item label="健康检查：">
                    {{valueToShow(selected.service.healthCheck)}}<i class="el-icon-edit" @click="handleChangeProp('healthCheck')"></i>
                  </el-form-item>
                </el-form>
              </div>
              <div class="image-info">
                <div class="title">镜像信息</div>
                <el-form label-position="right" label-width="140px" size="mini">
                  <el-form-item label="镜像方式：">
                    {{valueToShow(selected.service.image.typeName)}}
                    <span style="padding-left: 12px; color: #409EFF">基础镜像地址：</span><span>{{selected.service.image.location}} </span>
                    <i class="el-icon-edit" @click="handleChangeProp('image')"></i>
                  </el-form-item>
                  <el-form-item label="gitlab地址：">
                    <span>{{valueToShow(selected.service.gitLabAddress)}}</span>
                    <i class="el-icon-edit" @click="handleChangeProp('gitLabAddress')"></i>
                  </el-form-item>
                  <el-form-item label="gitlab分支：">
                    {{valueToShow(selected.service.gitLabBranch)}}<i class="el-icon-edit" @click="handleChangeProp('gitLabBranch')"></i>
                  </el-form-item>
                  <el-form-item label="Gitlab父级pom.xml相对路径：" v-if="selectedAPP.isJavaLanguage" class="relativePathOfParentPOM">
                    {{valueToShow(selected.service.relativePath)}}
                  </el-form-item>
                  <el-form-item label="Maven profile id：" v-if="selectedAPP.isJavaLanguage">
                    <span>{{valueToShow(selected.service.mavenProfileId)}}</span>
                    <i class="el-icon-edit" @click="handleChangeProp('mavenProfileId')"></i>
                  </el-form-item>
                </el-form>
              </div>
              <div class="instance-info">
                <div class="title">实例规格</div>
                <el-form label-position="right" label-width="140px" inline size="mini">
                  <el-form-item label="CPU/内存：">
                    {{selected.service.cpuInfo.size + '核 / ' + selected.service.memoryInfo.size + 'G'}}
                    <i class="el-icon-edit" @click="handleChangeProp('cpuAndMemory')"></i>
                  </el-form-item>
                  <el-form-item label="实例数量：">
                    {{valueToShow(selected.service.instanceNum)}}
                  </el-form-item>
                  <el-form-item label="滚动升级：">
                    {{selected.service.rollingUpdate? '需要' : '不需要'}}
                    <i class="el-icon-edit" @click="handleChangeProp('rollingUpdate')"></i>
                  </el-form-item>
                  <el-form-item label="负载均衡：">
                    {{valueToShow(selected.service.loadBalance)}}
                    <i class="el-icon-edit" @click="handleChangeProp('loadBalance')"></i>
                  </el-form-item>
                  <el-form-item label="文件存储：" class="big file-location">
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
                  <el-form-item label="环境变量配置：" class="big">
                    <div v-if="selected.service.environments && selected.service.environments.length > 0">
                      <el-row>
                        <el-col :span="10" style="font-weight: bold;text-align: center">Key</el-col>
                        <el-col :span="10" style="font-weight: bold;text-align: center">Value</el-col>
                        <el-col :span="4" style="font-weight: bold;text-align: left">
                          <i class="el-icon-edit" @click="handleChangeProp('environments')"></i>
                        </el-col>
                      </el-row>
                      <el-row
                              v-for="(item, index) in selected.service.environments"
                              :key="item.key"
                      >
                        <el-col :span="10" style="text-align: center">{{item.key}}</el-col>
                        <el-col :span="10" style="text-align: center">{{item.value}}</el-col>
                      </el-row>
                    </div>
                    <div v-else>
                      <span>未设置</span>
                      <i class="el-icon-edit" @click="handleChangeProp('environments')"></i>
                    </div>
                  </el-form-item>
                  <el-form-item label="Host配置：" class="big">
                    <div v-if="selected.service.hosts && selected.service.hosts.length > 0">
                      <el-row>
                        <el-col :span="10" style="font-weight: bold; text-align: center">IP</el-col>
                        <el-col :span="10" style="font-weight: bold; text-align: center">域名</el-col>
                        <el-col :span="4" style="font-weight: bold;text-align: left">
                          <i class="el-icon-edit" @click="handleChangeProp('hosts')"></i>
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
                      <i class="el-icon-edit" @click="handleChangeProp('hosts')"></i>
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
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改健康检查后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="changeHealthCheckForm">
        <el-form-item label="当前健康检查：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
          {{selected.model.healthCheck}}
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
      <my-image-selector :serviceInfo="serviceInfo" :imageInfo="newProps" ref="changeImageForm"></my-image-selector>
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
               class="fileLocation"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改健康检查后需要重新【部署】才能生效！</span>
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

    <el-dialog title="修改环境变量" :visible="selected.prop == 'environments'"
               @close="selected.prop = null"
               class="environments"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改环境变量后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="160px" ref="changeEnvironmentsForm">
        <el-row>
          <el-col :span="10" style="font-weight: bold">Key</el-col>
          <el-col :span="10" style="font-weight: bold">Value</el-col>
          <el-col :span="4" style="font-weight: bold"></el-col>
        </el-row>
        <el-row
          v-for="(item, index) in newProps.environments"
          :key="item.key"
        >
          <el-col :span="10">{{item.key}}</el-col>
          <el-col :span="10">{{item.value}}</el-col>
          <el-col :span="4" style="text-align: right">
            <el-button @click="handleDeleteEnvironment(index)">删除</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="9">
            <el-input v-model="environmentKey" placeholder="Key值"></el-input>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="9">
            <el-input v-model="environmentValue" placeholder="Value值"></el-input>
          </el-col>
          <el-col :span="4" style="text-align: right">
            <el-button @click="handleAddEnvironment(environmentKey, environmentValue)">添加</el-button>
          </el-col>
        </el-row>
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
               @close="selected.prop = null"
               class="hosts"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改Host配置后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="160px" ref="changeHostsForm">
        <el-row>
          <el-col :span="10" style="font-weight: bold">IP</el-col>
          <el-col :span="10" style="font-weight: bold">域名</el-col>
          <el-col :span="4" style="font-weight: bold"></el-col>
        </el-row>
        <el-row
          v-for="(item, index) in newProps.hosts"
          :key="item.key"
        >
          <el-col :span="10">{{item.ip}}</el-col>
          <el-col :span="10">{{item.domain}}</el-col>
          <el-col :span="4" style="text-align: right">
            <el-button @click="handleDeleteHost(index)">删除</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="9">
            <el-input v-model="hostKey" placeholder="IP"></el-input>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="9">
            <el-input v-model="hostValue" placeholder="域名"></el-input>
          </el-col>
          <el-col :span="4" style="text-align: right">
            <el-button @click="handleAddHost(hostKey, hostValue)">添加</el-button>
          </el-col>
        </el-row>
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

    <el-dialog title="更改gitlab地址" :visible="selected.prop == 'gitLabAddress'"
               @close="selected.prop = null"
               class="gitlab-address"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
      <i class="el-icon-warning"></i>
        <span>更改Gitlab_ssh后需要重新【部署】才能生效！</span>
      </el-tag>
        <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="changeGitLabAddressForm" size="mini">
          <el-form-item label="当前gitlab地址：">
            {{selected.model.gitLabAddress}}
          </el-form-item>
          <el-form-item label="更改gitlab地址为：" prop="gitLabAddress">
            <el-input v-model="newProps.gitLabAddress" placeholder=""></el-input>
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
               @close="selected.prop = null"
               class="gitlab-address"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改Gitlab分支后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="changeGitLabBranchForm" size="mini">
        <el-form-item label="当前gitlab分支：">
          {{selected.model.gitLabBranch}}
          </el-form-item>
        <el-form-item label="更改gitlab分支为：" prop="gitLabBranch">
          <el-input v-model="newProps.gitLabBranch" placeholder=""></el-input>
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
               @close="selected.prop = null"
               class="gitlab-address"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改maven profile id后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="180px" ref="changeMavenProfileIdForm" size="mini">
        <el-form-item label="当前maven profile id：">
          {{selected.model.mavenProfileId}}
          </el-form-item>
        <el-form-item label="更改maven profile id：" prop="mavenProfileId">
          <el-input v-model="newProps.mavenProfileId" placeholder=""></el-input>
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
               @close="selected.prop = null"
               class="cpu-and-memory"
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
      <el-form :model="newProps" :rules="rules" labelWidth="80px" ref="changeCpuAndMemoryForm">
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
               @close="selected.prop = null"
               class="rolling-update"
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
               @close="selected.prop = null"
               class="load-balance"
               v-if="selected.service && selected.model"
    >
      <!--<el-tag type="success" disable-transitions>-->
      <!--<i class="el-icon-warning"></i>-->
      <!--<span></span>-->
      <!--</el-tag>-->
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

    <el-dialog title="更改OneApm" :visible="selected.prop == 'oneApm'"
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
          border-color: #409EFF;
          .row-expand {
            width: 85%;
            margin: 0px auto;
            max-width: 750px;
            .el-form {
              .el-form-item {
                .el-form-item__label {
                  color: #409EFF;
                  font-weight: bold;
                }
                &.el-form-item--mini {
                  margin-bottom: 2px;
                }
                &.relativePathOfParentPOM {
                  .el-form-item__label {
                    line-height: 100%;
                  }
                }
              }
            }

            .app-info {
              border-bottom: 1px solid lightgray;
              .el-form {
                .el-form-item {
                  width: 50%;
                  &:first-child {
                    width: 100%;
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
                    display: block;
                    width: 100%;
                    .el-form-item__label {
                      float: left;
                    }
                    .el-form-item__content {
                      margin-left: 140px;
                      display: block;
                      /*width: 100%;*/
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
      max-width: 80%;
      .el-tag {
        display: block;
        text-align: left;
        .el-icon-warning {
          vertical-align: middle;
        }
      }
      .el-form-item {
        margin-bottom: 18px;
      }

      .el-row {
        margin-bottom: 6px;
      }

      &.environments, &.hosts {
        .el-col {
          text-align: center;
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
      &.fileLocation {
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
    }
  }
</style>
<style lang="scss" scoped>
  #service-main {
    .el-icon-edit {
      margin-left: 8px;
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
        &.operation {
          margin: 5px 5px 5px 8px;
          .el-col {
            padding: 0px 10px;
            display: inline-block;
            vertical-align: middle;
            &:first-child {
              padding: 0px;
              border-right: 1px solid darkgray;
            }
            &:nth-child(2) {
              .item {
                display: inline-block;
              }
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
          margin: 5px 5px 5px 8px;
          .el-col {
            .text {
              display: inline-block;
              max-width: 300px;
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
</style>

<script>
  import appPropUtils from '../utils/app-props';
  import MyDialogForLog from '../utils/components/dialog4log.vue'
  import MyImageSelector from '../utils/components/image-selector.vue'
  import ElRow from "element-ui/packages/row/src/row";
  import ElCol from "element-ui/packages/col/src/col";
  import ElRadio from "element-ui/packages/radio/src/radio";
export default {
  components: {ElRadio, ElCol, ElRow, MyDialogForLog, MyImageSelector},
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
  },
  computed: {
    appInfoListOfGroup() {
      return this.$storeHelper.appInfoListOfGroup();
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
      appList: [],
//      totalSize: 0,

      showLoading: false,
      selectedAppID: null,
      selectedAPP: null,
      selectedProfileID: null,
      // whether current profile is production
      isProductionProfile: null,
      selectedProfileList: [],
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
        oneApm: '',
      },
      waitingResponse: false,

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
      this.selectedAPP = appInfo['app'];
      this.selectedProfileList = this.selectedAPP['profileList'];
      if (Array.isArray(this.selectedProfileList) && this.selectedProfileList.length > 0) {
        // at the beginning of this page(value of selectedProfileID is null), get selectedProfileID from localStorage
        // else selectedProfileID is the first element in profileList of selectedApp
        let defaultProfileID = this.selectedProfileList[0]['id'];
        if (null == this.selectedProfileID) {
          let selectedProfileID = this.$getUserConfig('profile/service/profileID');
          if (selectedProfileID) {
            this.selectedProfileID = selectedProfileID;
          } else {
            this.selectedProfileID = defaultProfileID;
          }
        } else {
          // request service list when app id is changed while profile id is not changed.
          if (this.selectedProfileID == defaultProfileID) {
            this.requestServiceList(this.selectedAPP.appId, this.selectedProfileID);
          } else {
            this.selectedProfileID = defaultProfileID;
          }
        }
      }
      this.$storeHelper.setUserConfig('profile/service/appID', appID);
    },
    selectedProfileID: function (profileID, oldValue) {
      this.serviceInfo.profileID = profileID;
      this.isProductionProfile = this.$storeHelper.isProductionProfile(profileID);
      let appID = this.selectedAPP.appId;
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
    statusOfWaitingResponse(action) {
      return this.queueForWaitingResponse.indexOf(action) > -1;
    },
    hideWaitingResponse(action) {
      let index = this.queueForWaitingResponse.indexOf(action);
      if (index > -1) {
        this.queueForWaitingResponse.splice(index, 1);
      }
    },
    /**
     * call in two place:
     * 1. created function
     * 2. appInfoListOfGroup watcher
     *
     * what is done?
     * 1. refresh this.appList
     * 2. get default appId
     */
    onAppInfoListOfGroup(appInfoListOfGroup) {
      if (appInfoListOfGroup) {
        if (appInfoListOfGroup.hasOwnProperty('appList')) {
          this.appList = appInfoListOfGroup.appList;
        }
//        if (appInfoListOfGroup.hasOwnProperty('appModelList')) {
//          this.appModelList = appInfoListOfGroup.appModelList;
//        }
//        if (appInfoListOfGroup.hasOwnProperty('total')) {
//          this.totalSize = appInfoListOfGroup.total;
//        }
        if (!this.appList || (0 == this.appList.length)) {
          return;
        }
        let appId = this.$getUserConfig('profile/service/appID');
        if (appId && this.$storeHelper.getAppInfoByID(appId)) {
          this.selectedAppID = appId;
        } else {
          this.selectedAppID = this.appList[0]['appId'];
        }
      }
    },
    onCpuAndMemoryList(value, oldValue) {
      // set default cpu
      if (Array.isArray(value) && value.length > 0) {
        let firstItem = value[0];
        this.memeorySizeList = 'memoryList' in firstItem ? firstItem.memoryList : '';
      }
    },
    handleButtonClick(action, params) {
      switch (action) {
        case 'linker':
          this.$router.push({
            path: params.path,
            query: {
              appID: this.selectedAppID,
              profileID: this.selectedProfileID
            }
          });
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
            this.$storeHelper.setUserConfig('profile/service/appID', this.selectedAppID);
            this.$storeHelper.setUserConfig('profile/service/profileID', this.selectedProfileID);
            this.$router.push({
              path: '/profile/work-order/todo/add',
              query: {
                from: '/profile/service'
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
              path: '/profile/domain',
              query: {
                from: '/profile/service',
                action: 'go-to-domain-app'
              }
            });
          }
          break;
      }
    },
    // change the default service
    changeDefaultVersion(serviceID) {
      this.warningConfirm(`更改默认版本后，内、外网访问应用将指向默认版本的内、外网域名，10分钟之内会在全国范围生效，你确定需要更改吗？`).then(() => {
        this.$net.changeDefaultService({
          beforeSwitchId: this.defaultServiceID,
          afterSwitchId: serviceID
        }).then(msg => {
          this.$message.success(msg);
          this.defaultServiceID = serviceID;
        }).catch(msg => {
          this.$notify({
            title: '切换默认版本失败',
            message: msg,
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
      let desc = `应用${this.selectedAPP.serviceName}-${description}-${row.serviceVersion}版本的服务`;
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
//          this.addToWaitingResponseQueue('deploy');
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
              this.$net.serviceDeployLog(options).then(content => {
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
                  if (null != log) {
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
              this.$notify({
                title: '部署失败',
                message: err,
                duration: 0,
                onClose: function () {
                }
              });
            });
          }).catch(() => {});
          break;
        case 'delete':
          var desc = this.getVersionDescription(row);
          this.warningConfirm(`删除服务将会销毁${desc}的代码和配置信息，同时自动解绑外网二级域名，删除后服务数据不可恢复。`).then(() => {
            this.warningConfirm(`你确认要删除${desc}，并清除该服务的一切数据？`).then(() => {
              this.$net.serviceDelete({
                id: serviceID,
                appId: this.selectedAppID,
                spaceId: this.selectedProfileID
              }).then(msg => {
                this.$message({
                  type: 'success',
                  message: msg
                });
                this.requestServiceList(this.selectedAppID, this.selectedProfileID);
              }).catch(err => {
                this.$notify.error({
                  title: '提示',
                  message: err,
                  duration: 0,
                  onClose: function () {
                  }
                });
              });
            }).catch(() => {
            });
          }).catch(()=> {
          });
          break;
        case 'stop':
          var desc = this.getVersionDescription(row);
          this.$confirm(`停止将会导致${desc}不可用，但不会删除代码及配置信息，你确定需要这么做吗?`).then(() => {
            this.$net.serviceStop({
              id: serviceID,
              appId: this.selectedAppID,
              spaceId: this.selectedProfileID
            }).then(msg => {
              this.$message({
                type: 'success',
                message: msg
              });
            }).catch(err => {
              this.$notify({
                title: '提示',
                message: err,
                duration: 0,
                onClose: function () {
                }
              });
              console.log(err);
            });
          }).catch(() => {});
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
            this.$storeHelper.setUserConfig('profile/service', {
              appID: this.selectedAppID,
              profileID: this.selectedProfileID,
              serviceID: row.id
            });
            this.$router.push({
              path: '/profile/instance',
              query: {
                from: '/profile/service'
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
              path: '/profile/domain',
              query: {
                from: '/profile/service',
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
              path: '/profile/log/deploy',
              query: {
                from: '/profile/service'
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
          'fileLocation', 'oneApm'].indexOf(prop) == -1) {
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
          this.newProps[prop] = this.selected.model[prop];
          this.$refs.hasOwnProperty(formName) &&
          this.$refs[formName].validate();
          break;
        case 'environments':
        case 'hosts':
        case 'fileLocation':
          this.newProps[prop] = JSON.parse(JSON.stringify(this.selected.model[prop]));
          this.$refs.hasOwnProperty(formName) && this.$refs[formName].validate();
          break;
        case 'cpuAndMemory':
          this.newProps['cpuID'] = this.selected.model['cpuID'];
          this.newProps['memoryID'] = this.selected.model['memoryID'];
          this.$refs.hasOwnProperty(formName) && this.$refs[formName].validate();
          break;
        case 'image':
          this.newProps['customImage'] = this.selected.model['customImage'];
          this.newProps['imageLocation'] = this.selected.model['imageLocation'];
          this.$refs.hasOwnProperty(formName) &&
          this.$refs[formName].validate();
          break;
      }
      this.selected.prop = prop;
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
          this.selected.service['cpu'] = cpuAndMemoryInfo[0];
          this.selected.service['memory'] = cpuAndMemoryInfo[1];
          break;
      }
    },

    /**
     * request service list by appId and profileId, the place this function is called:
     * 1. appId changed is changed in selector
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
            this.$message({
              type: 'warning',
              message: '未找到默认版本'
            })
          }
        }
        this.intranetDomain = content.hasOwnProperty('intranetDomain') ? content.intranetDomain : '未知';
        let internetDomainList = content.hasOwnProperty('internetDomain') ? content.internetDomain : [];
        if (internetDomainList.length > 0) {
          this.internetDomain = internetDomainList.join(';');
        } else {
          this.internetDomain = '未绑定';
        }
      }).catch(err => {
        this.showLoading = false;
        this.$notify({
          title: '提示',
          message: err,
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
    handleDeleteEnvironment(index) {
      this.newProps.environments.splice(index, 1);
    },
    handleAddEnvironment(key, value) {
      if (key.length > 0 && value.length > 0) {
        this.newProps.environments.push({
          key: key,
          value: value,
        });
        this.environmentKey = '';
        this.environmentValue = '';
      } else {
        this.$message.error('key或value值不能为空');
      }
    },
    handleDeleteHost(index) {
      this.newProps.hosts.splice(index, 1);
    },
    handleAddHost(key, value) {
      if (key.length > 0 && value.length > 0) {
        this.newProps.hosts.push({
          ip: key,
          domain: value
        });
        this.hostKey = '';
        this.hostValue = '';
      } else {
        this.$message.error('IP或域名不能为空');
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