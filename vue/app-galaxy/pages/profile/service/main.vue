<template>
  <div id="service-main">
    <div class="header">
      <el-row class="operation">
        <el-col :span="5">
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
        </el-col>
        <el-col :span="10">
          <span>应用名称：</span>
          <el-select v-model="selectedAppID" placeholder="请选择" style="width: 80%; max-width: 300px">
            <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.serviceName" :value="item.appId">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="9">
          <span>运行环境：</span>
          <el-select v-model="selectedProfileID" placeholder="请选择" style="width: 80%; max-width: 200px">
            <el-option v-for="item in selectedProfileList" :key="item.id" :label="item.description" :value="item.id">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
    </div>
    <el-row class="notice">
      <el-tag type="success">
        <i class="el-icon-warning"></i>
        <span>每次创建的服务版本信息为所在应用创建时的配置信息</span>
      </el-tag>
    </el-row>
    <div class="app-list">
      <el-table
        :data="currentServiceList"
        style="width: 100%"
        :row-key="getRowKeys"
        :expand-row-keys="expandRows"
        v-loading="showLoading"
        element-loading-text="加载中"
      >
        <el-table-column
          prop="serviceVersion"
          label="版本"
          width="80">
        </el-table-column>
        <el-table-column
          prop="intranetDomain"
          label="内网域名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="applicationStatus"
          label="状态"
          width="80"
        >
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间">
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
                    v-if="selectedProfileID != '5'"
                    size="mini-extral" type="warning"
                    @click="handleOperationClick('deploy', scope.$index, scope.row)">部署</el-button>
            <el-button
                    v-if="selectedProfileID != '5'"
                    size="mini-extral"type="warning"
                    @click="handleOperationClick('deploy-log', scope.$index, scope.row)">部署日志</el-button>
            <el-button
                    size="mini-extral" type="warning"
                    @click="handleOperationClick('stop', scope.$index, scope.row)">停止</el-button>
            <el-button
                    v-if="selectedProfileID == '5'"
                    size="mini-extral" type="warning"
                    @click="handleOperationClick('one-apm', scope.$index, scope.row)">OneAPM监控</el-button>
            <el-button
                    size="mini-extral" type="warning"
                    @click="handleOperationClick('instance-list', scope.$index, scope.row)">实例列表</el-button>
            <el-button
                    size="mini-extral" type="warning"
                    @click="handleOperationClick('domain-config', scope.$index, scope.row)">配置外网二级域名</el-button>
            <el-button
                    size="mini-extral" type="warning"
                    @click="handleOperationClick('delete', scope.$index, scope.row)">删除</el-button>
            <el-button
                    size="mini-extral" type="warning"
                    @click="handleOperationClick('service_info', scope.$index, scope.row)">
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
                    {{valueToShow(selected.service.mirror.typeName)}}
                    <span style="padding: 0px 12px"> {{"基础镜像地址：" + selected.service.mirror.location}} </span>
                    <i class="el-icon-edit" @click="handleChangeProp('mirror')"></i>
                  </el-form-item>
                  <el-form-item label="gitlab ssh地址：">
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
                    {{selected.service.cpu.cpu + '核 / ' + selected.service.memory.memory + 'G'}}
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
                  <el-form-item label="文件存储：" class="big">
                    <div v-if="selected.service.volumes && selected.service.volumes.length > 0">
                      <el-tag
                              v-for="tag in selected.service.volumes"
                              :key="tag"
                              type="success"
                      >{{tag}}</el-tag>
                    </div>
                    <span v-else>未设置</span>
                    <i class="el-icon-edit" @click="handleChangeProp('fileLocation')"></i>
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

    <el-dialog title="更改镜像方式" :visible="selected.prop == 'mirror'"
               class="mirror"
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改镜像方式后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-row>
        当前镜像方式： {{selected.service.mirror.typeName}}；镜像地址： {{selected.service.mirror.location}}
      </el-row>
      <el-row>
        更改镜像方式为：
      </el-row>
      <el-form :model="newProps" :rules="rules" label-width="120px" ref="formInChangeMirrorDialog">
        <el-form-item label="镜像方式：" prop="mirrorTypeID">
          <el-radio-group v-model="newProps.mirrorTypeID" @change="handleMirrorTypeChange">
            <!--<el-radio label="0">自动打镜像</el-radio>-->
            <!--<el-radio label="1">自定义镜像</el-radio>-->
            <el-radio v-for="item in mirrorInfo" :label="item.id" :key="item.id">
              {{item.name}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="镜像地址：" prop="mirrorLocation">
          <el-input v-model="newProps.mirrorLocation" placeholder="输入镜像地址，包含版本"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('mirror')"
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
        <el-form-item label="当前文件存储">
          <div>
            <el-tag
                    v-for="tag in newProps.fileLocation"
                    :key="tag"
                    closable
                    type="success"
                    @close="handleRemoveFileLocation(tag)"
            >{{tag}}</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="文件存储" prop="fileLocation">
          <el-input v-model="fileLocationToAdd" placeholder="以/开头，可以包含字母数字下划线中划线，2-18位">
            <template slot="append"><el-button class="add-file-location-btn" @click="handleAddFileLocation(fileLocationToAdd)">添加</el-button></template>
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
        <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="changeGitLabAddressFrom" size="mini">
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
        当前实例规格: {{selected.service.cpu.cpu + '核 / ' + selected.service.memory.memory + 'G'}}
      </el-row>
      <el-row>
        更改实例规格为：
      </el-row>
      <el-form :model="newProps" :rules="rules" labelWidth="80px" ref="formInChangeCpuAndMemoryDialog">
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
        <span>滚动升级是为了实现业务的平滑上线而不中断。除了定时器外，建议其他应用都选用滚动升级。更改滚动升级后需要重新【部署】才能生效！</span>
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

    <el-dialog title="部署日志" :visible="selected.operation == 'deploy'"
               @close="selected.operation = null"
               class="deploy"
               :closeOnClickModal="false"
               v-if="selected.service && selected.model"
    >
      <el-scrollbar>
        <div v-for="(item,index) in deployLogs" :key="index" class="deploy-log">{{item}}</div>
      </el-scrollbar>
    </el-dialog>
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
      margin: 5px;
      font-size: 14px;
      .el-row.operation {
        .el-col {
          padding: 0px 6px;
          display: inline-block;
          text-align: center;
          vertical-align: middle;
        }
      }
      .el-select .el-input__inner {
        height: 26px;
      }
    }
    .app-list {
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
                  margin-bottom: 0px;
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
                  width: 50%;
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
      &.mirror {
        .el-row {
          text-align: left;
        }
      }
      &.fileLocation {
        .el-dialog__body {
          .el-tag {
            display: inline-block;
          }
          .add-file-location-btn {
            margin: 0px;
            width: 60px;
            background-color: lavenderblush;
            border-radius: 0px;
            &:hover {
              font-weight: bold;
              color: #409EFF;
            }
          }
        }
      }
      &.deploy {
        .el-dialog {
          background-color: black;
          width: 80%;
          height: 70%;
          text-align: left;
          .el-dialog__header {
            padding: 6px;
            border-bottom: 1px solid gray;
            .el-dialog__title {
              font-size: 14px;
              font-weight: bold;
              color: white;
            }
            .el-dialog__headerbtn {
              top: 10px;
            }
          }
          .el-dialog__body {
            padding: 0px;
            color: lightgray;
            height: calc(100% - 40px);
            box-sizing: border-box;
            overflow: scroll;
            .el-scrollbar {
              height: 100%;
              .el-scrollbar__wrap {
                .el-scrollbar__view {
                  padding: 0px 6px 10px 6px;
                  pre {
                    font-size: 12px;
                    line-height: 16px;
                  }
                }
              }
              .el-scrollbar__bar {
                &.is-horizontal {
                  height: 2px;
                }
                &.is-vertical {
                  width: 2px;
                }
                .el-scrollbar__thumb {
                  background-color: #409EFF;
                }
              }
              .el-scrollbar__view {
                .deploy-log {
                  font-size: 12px;
                  line-height: 16px;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #service-main {
    .notice {
      .el-tag {
        display: block;
        .el-icon-warning {
          vertical-align: middle;
        }
      }
    }

    .el-table {
      .el-table__row {
        .el-button {
          margin-bottom: 5px;
          margin-right: 10px;
          float: left;
          .el-icon-arrow-right {
            vertical-align: middle;
            transition: transform 0.2s ease-in-out;
            &.expand {
              transform: rotate(90deg);
            }
          }
        }
        .el-button + .el-button {
          margin-left: 0px;
          /*margin-right: 10px;*/
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
            .el-icon-edit {
              margin-left: 8px;
              font-size: 100%;
              line-height: 100%;
              font-weight: bold;
              color: #eb9e05;
              vertical-align: middle;
            }
          }
        }
      }
    }
  }
</style>

<script>
  import appPropUtils from '../utils/app_prop';
  import StoreHelper from '../utils/store_helper.vue';
export default {
  mixins: [StoreHelper],
  created() {
    this.onUpdateAppInfoList(this.appInfoListOfGroup);
    this.onCpuAndMemoryList(this.cpuAndMemoryList);
  },
  mounted() {
    console.log('mounted');
  },
  data() {
    return {
      appList: [],
//      totalSize: 0,

      showLoading: false,
      selectedAppID: null,
      selectedAPP: null,
      selectedProfileID: null,
      selectedProfileList: [],

      rules: appPropUtils.rules,
      currentServiceList: null,
      currentModelList: [],

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
        mirrorTypeID: 0,
        mirrorLocation: '',
        rollingUpdate: '',
        loadBalance: '',
        gitLabAddress: '',
        gitLabBranch: '',
        mavenProfileId: '',
        fileLocation: [],
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
      mirrorLocationLabel: '',
      deployLogs: [],
      /* used for dialog end */
    }
  },
  computed: {
    /* used for dialog */
    mirrorInfo: function () {
      return appPropUtils.getMirrorInfo();
    },
    loadBalanceType: function() {
      return appPropUtils.getAllLoadBalance();
    }
    /* used for dialog end */
  },
  watch: {
    appInfoListOfGroup: 'onUpdateAppInfoList',
    cpuAndMemoryList: 'onCpuAndMemoryList',
    selectedAppID: function (value, oldValue) {
      let appID = value;
      let appInfo = this.getAppInfoByID(appID);
      if (!appInfo) {
        return;
      }
      this.selectedAPP = appInfo['app'];
      this.selectedProfileList = this.selectedAPP['profileList'];
      if (Array.isArray(this.selectedProfileList) && this.selectedProfileList.length > 0) {
        // at the beginning of this page(value of selectedProfileID is null), get selectedProfileID from localStorage
        // else selectedProfileID is the first element in profileList of selectedApp
        let defaultProfileID = this.selectedProfileList[0]['id'];
        if (null == this.selectedProfileID) {
          let selectedProfileID = this.getConfig('profile/service/profileID');
          if (selectedProfileID) {
            this.selectedProfileID = selectedProfileID;
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
      this.setConfig('profile/service/appID', appID);
    },
    selectedProfileID: function (value, oldValue) {
      let profileID = value;
      let appID = this.selectedAPP.appId;
      this.requestServiceList(appID, profileID);
//      this.setConfig('profile/service/profileID', profileID);
    },
  },

  methods: {
    /**
     * call in two place:
     * 1. created function
     * 2. appInfoListOfGroup watcher
     *
     * what is done?
     * 1. refresh this.appList
     * 2. get default appId
     */
    onUpdateAppInfoList(appInfoListOfGroup) {
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
        let appId = this.getConfig('profile/service/appID');
        if (appId && this.getAppInfoByID(appId)) {
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
      }
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

    /**
     * handle click event in the operation-column
     */
    handleOperationClick(action, index, row) {
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
      switch (action) {
        case 'deploy':
          let self = this;
          function showDeployLog(options) {
            this.deployLogs = [];
            this.selected.operation = 'deploy';
            var scrollWrapInDeployDialog = document.querySelector('#service-main .deploy .el-scrollbar .el-scrollbar__wrap');

            function updateDeployLog(log) {
              this.deployLogs = this.deployLogs.concat(log.split('\n'));
              if (!scrollWrapInDeployDialog) {
                scrollWrapInDeployDialog = document.querySelector('#service-main .deploy .el-scrollbar .el-scrollbar__wrap');
              }
              this.$nextTick(() => {
                scrollWrapInDeployDialog.scrollTop = scrollWrapInDeployDialog.scrollHeight - scrollWrapInDeployDialog.offsetHeight;
              });
            }

            function getDeployLog(options) {
//              console.log(options);
              // stop request deploy log when the window is closed
              if (this.selected.operation != 'deploy') {
                return;
              }
              this.$net.serviceDeployLog(options).then(content => {
                if (content.hasOwnProperty('Orchestration')) {
                  let Orchestration = content.Orchestration;
                  let log = Orchestration.log;
//                  console.log(log);
//                  console.log(content);
//                  console.log(Orchestration.offset);
                  updateDeployLog.call(this, log);
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
          break;
        case 'delete':
          this.$confirm('您将删除服务版本：' + this.selected.service.serviceVersion + '，确定吗？').then(() => {
            this.$net.serviceDelete({
              id: serviceID,
              appId: this.selectedAppID,
              spaceId: this.selectedProfileID
            }).then(content => {
              console.log(content);
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
      }
    },
    /**
     * do some init action before dialog popup
     * @param prop
     */
    handleChangeProp(prop) {
//      console.log(prop);
      if (['healthCheck', 'mirror','environments', 'hosts','cpuAndMemory',
          'rollingUpdate', 'loadBalance', 'gitLabAddress', 'gitLabBranch',
          'mavenProfileId', 'fileLocation'].indexOf(prop) == -1) {
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
          this.newProps['cpuID'] = JSON.parse(JSON.stringify(this.selected.model['cpuID']));
          this.newProps['memoryID'] = JSON.parse(JSON.stringify(this.selected.model['memoryID']));
          this.$refs.hasOwnProperty('formInChangeCpuAndMemoryDialog') &&
          this.$refs['formInChangeCpuAndMemoryDialog'].validate();
          let cpuAndMemoryList = this.cpuAndMemoryList;
          break;
        case 'mirror':
          this.newProps['mirrorTypeID'] = this.selected.model['mirrorTypeID'];
          this.newProps['mirrorLocation'] = this.selected.model['mirrorLocation'];
          this.$refs.hasOwnProperty('formInChangeMirrorDialog') &&
          this.$refs['formInChangeMirrorDialog'].validate();
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
        case 'mavenProfileId':
        case 'gitLabAddress':
        case 'gitLabBranch':
        case 'rollingUpdate':
        case 'loadBalance':
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
        case 'environments':
        case 'hosts':
        case 'fileLocation':
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
        case 'mirror':
          this.$refs['formInChangeMirrorDialog'].validate((valid) => {
            if (!valid) {
              return;
            }
            if (!this.newProps.hasOwnProperty('mirrorTypeID') || !this.selected.model.hasOwnProperty('mirrorTypeID')
              || !this.newProps.hasOwnProperty('mirrorLocation') || !this.selected.model.hasOwnProperty('mirrorLocation')) {
              return;
            }
            if ((this.newProps['mirrorTypeID'] == this.selected.model['mirrorTypeID'])
              && (this.newProps['mirrorLocation'] == this.selected.model['mirrorLocation'])) {
              this.selected.prop = null;
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
            } else {
              this.waitingResponse = true;
              setTimeout(() => {
                this.waitingResponse = false;
                this.selected.prop = null;
                this.updateModelInfo('mirror');
              }, 1000);
            }
          });
          break;
        case 'cpuAndMemory':
          this.$refs['formInChangeCpuAndMemoryDialog'].validate((valid) => {
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
              this.waitingResponse = true;
              setTimeout(() => {
                this.waitingResponse = false;
                this.selected.prop = null;
                this.updateModelInfo('cpuAndMemory');
              }, 1000);
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
      switch (prop) {
        case 'healthCheck':
          this.$net.serviceUpdate(prop, {
            id: this.selected.service['id'],
            healthCheck: this.newProps[prop]
          }).then(msg => {
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
              message: err
            });
          });
          break;
        default:
          setTimeout(() => {
            this.waitingResponse = false;
            this.selected.prop = null;
            this.updateModelInfo(prop);
          }, 1000);
          break;
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
          this.selected.model[prop] = this.newProps[prop];
          this.selected.service[prop] = this.newProps[prop];
          break;
        case 'environments':
        case 'hosts':
        case 'fileLocation':
          this.selected.model[prop] = JSON.parse(JSON.stringify(this.newProps[prop]));
          this.selected.service[prop] = JSON.parse(JSON.stringify(this.newProps[prop]));
          break;
        case 'mirror':
          let mirrorTypeID = this.newProps['mirrorTypeID'];
          let mirrorLocation = this.newProps['mirrorLocation'];
          this.selected.model['mirrorTypeID'] = mirrorTypeID;
          this.selected.model['mirrorLocation'] = mirrorLocation;
          this.selected.service.mirror.typeID = mirrorTypeID;
          this.selected.service.mirror.typeName = appPropUtils.getMirrorNameById(mirrorTypeID);
          this.selected.service.mirror.location = mirrorLocation;
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

    requestServiceList(appID, spaceID) {
      if (!appID || !spaceID) {
        console.log('appID or spaceID can not be empty');
        return;
      }
      this.showLoading = true;
      this.$net.getServiceListByAppIDAndProfileID({
        appId: appID,
        spaceId: spaceID
      }).then(content => {
        if (content.hasOwnProperty('applicationServerList')) {
          this.currentServiceList = content['applicationServerList'];
          this.currentModelList = content['serviceModelList'];
          this.showLoading = false;
        }
      }).catch(err => {
        this.$notify({
          title: '提示',
          message: err,
          duration: 0,
          onClose: function () {
            self.showLoading = false;
          }
        });
        console.log(err);
//        this.showLoading = false;
      })
    },

    /* used for dialog */
    handleRemoveFileLocation(tag) {
      let items = this.newProps.fileLocation;
      items.splice(items.indexOf(tag), 1);
    },
    handleAddFileLocation(tag) {
      let tagLength = tag.length;
      console.log(tag);
      if (tagLength < 2 || tagLength > 18) {
        this.$message.error('长度在2到18个字符');
        return;
      }
      if (!/^\/[A-Za-z0-9_\-]+$/.exec(tag)) {
        this.$message.error('以/开头，可以包含字母数字下划线中划线');
        return;
      }
      if (tag.length > 0) {
        this.newProps.fileLocation.push(tag);
        this.fileLocationToAdd = '';
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
    handleMirrorTypeChange(value) {
//      switch (value) {
//        case '0':
//          this.mirrorLocationLabel = '基础镜像地址';
//          this.rules.mirrorLocation[0].required = false;
//          break;
//        case '1':
//          this.mirrorLocationLabel = '镜像地址';
//          this.rules.mirrorLocation[0].required = true;
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