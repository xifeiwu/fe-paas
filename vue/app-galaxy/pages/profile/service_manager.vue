<template>
  <div class="service-manager">
    <el-form inline labelWidth="80px" class="title">
      <el-form-item label="应用名称">
        <el-select v-model="selectedAppIndex" placeholder="请选择" @change="handleSelectChange('app')">
          <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.serviceName" :value="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运行环境">
        <el-select v-model="selectedProfileID" placeholder="请选择" @change="handleSelectChange('profile')">
          <el-option v-for="item in selectedProfileList" :key="item.id" :label="item.description" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item></el-form-item>
    </el-form>
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
      >
        <el-table-column
          prop="serverVersion"
          label="版本"
          width="80">
        </el-table-column>
        <el-table-column
          prop="address"
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
                    @click="handleOperationClick('service_info', scope.$index, scope.row)">服务详情</el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         v-if="true"
                         width="0"
        >
          <template slot-scope="scope">
            <div class="step1">应用信息</div>
            <el-form class="form1" label-position="right" label-width="120px" inline style="width: 100%">
              <el-form-item label="项目名称：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.serviceName}}
              </el-form-item>
              <el-form-item label="开发语言：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.language + ' - ' + selected.service.languageVersion}}
              </el-form-item>
              <el-form-item label="构建类型：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.packageType}}
              </el-form-item>
              <el-form-item label="健康检查：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.healthCheck}}<i class="el-icon-edit" @click="handleChangeProp('healthCheck')"></i>
              </el-form-item>
              <el-form-item label="oneAPM监控：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.oneapm}}
              </el-form-item>
              <el-form-item label="gitlab ssh地址：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']"
                            v-if="selected.service.language === 'JAVA'">
                {{selected.service.gitlabAddress}}
              </el-form-item>
              <el-form-item label="gitlab分支：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']"
                            v-if="selected.service.language === 'JAVA'">
                {{selected.service.gitlabBranch}}<i class="el-icon-edit"></i>
              </el-form-item>
              <el-form-item label="Gitlab父级pom.xml相对路径：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']"
                            v-if="selected.service.language === 'JAVA'">
                {{selected.service.relativePath}}
              </el-form-item>
              <el-form-item label="Maven profile id：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']"
                            v-if="selected.service.language === 'JAVA'">
                {{selected.service.mavenProfileId}}<i class="el-icon-edit"></i>
              </el-form-item>
              <el-form-item label="运行环境：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                <span class="profile-desc" v-for="item in selected.service.profileList" :key="item.name">
                  {{item.description}}
                </span>
              </el-form-item>
            </el-form>
            <div class="step2">镜像信息</div>
            <el-form class="form2" label-position="right" label-width="120px" style="width: 100%">
              <el-form-item label="镜像方式：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.mirror.typeName}}
                <span style="padding: 0px 12px"> {{"基础镜像地址：" + selected.service.mirror.location}} </span>
                <i class="el-icon-edit" @click="handleChangeProp('mirror')"></i>
              </el-form-item>
              <el-form-item label="文件存储：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                <div v-if="selected.service.volumes && selected.service.volumes.length > 0">
                  <el-tag
                    v-for="tag in selected.service.volumes"
                    :key="tag"
                    type="success"
                  >{{tag}}</el-tag>
                  <i class="el-icon-edit" @click="handleChangeProp('fileLocation')"></i>
                </div>
                <span v-else>无</span>
              </el-form-item>
              <el-form-item label="环境变量配置：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                <el-row>
                  <el-col :span="10" style="font-weight: bold;text-align: center">Key</el-col>
                  <el-col :span="10" style="font-weight: bold;text-align: center">Value</el-col>
                  <el-col :span="4" style="font-weight: bold;text-align: center">
                    <i class="el-icon-edit" @click="handleChangeProp('environments')"></i>
                  </el-col>
                </el-row>
                <el-row
                  v-for="(item, index) in selected.service.environments"
                  :key="item.key"
                  >
                    <el-col :span="9" style="text-align: center">{{item.key}}</el-col>
                    <el-col :span="9" style="text-align: center">{{item.value}}</el-col>
                </el-row>
              </el-form-item>
              <el-form-item label="Host配置：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                <el-row>
                  <el-col :span="10" style="font-weight: bold; text-align: center">IP</el-col>
                  <el-col :span="10" style="font-weight: bold; text-align: center">域名</el-col>
                  <el-col :span="4" style="font-weight: bold;text-align: center">
                    <i class="el-icon-edit" @click="handleChangeProp('hosts')"></i>
                  </el-col>
                </el-row>
                  <el-row
                    v-for="(item, index) in selected.service.hosts"
                    :key="item.ip"
                  >
                    <el-col :span="10" style="text-align: center">{{item.ip}}</el-col>
                    <el-col :span="10" style="text-align: center">{{item.domain}}</el-col>
                    <el-col :span="4">
                      <!--<el-button class="delete-host-btn" @click="handleDeleteHost(index)">删除</el-button>-->
                    </el-col>
                  </el-row>
              </el-form-item>
            </el-form>
            <div class="step3">实例规格</div>
            <el-form class="form3" label-position="right" label-width="120px" inline style="width: 100%">
              <el-form-item label="CPU/内存：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.cpu.cpu + '核 / ' + selected.service.memory.memory + 'G'}}
                <i class="el-icon-edit" @click="handleChangeProp('cpuAndMemory')"></i>
              </el-form-item>
              <el-form-item label="实例数量：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.instanceNum}}
              </el-form-item>
              <el-form-item label="滚动升级：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.rollingUpdate}}
                <i class="el-icon-edit" @click="handleChangeProp('rollingUpdate')"></i>
              </el-form-item>
              <el-form-item label="负载均衡：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.loadBalance}}
                <i class="el-icon-edit" @click="handleChangeProp('loadBalance')"></i>
              </el-form-item>
            </el-form>
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
      <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="formInChangeHealthCheckDialog">
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
               @close="selected.prop = null"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改镜像方式后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-row>
        当前实例规格: {{selected.service.cpu.cpu + '核 / ' + selected.service.memory.memory + 'G'}}
      </el-row>
      <el-row>
        更改实例规格为：
      </el-row>
      <el-form :model="newProps" :rules="rules" labelWidth="150px" ref="formInChangeHealthCheckDialog">
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

    <!--<el-dialog title="更改文件存储" :visible="selected.prop == 'fileLocation'"-->
               <!--@close="selected.prop = null"-->
               <!--v-if="selected.service && selected.model"-->
    <!--&gt;-->
      <!--<el-tag type="success" disable-transitions>-->
        <!--<i class="el-icon-warning"></i>-->
        <!--<span>更改健康检查后需要重新【部署】才能生效！</span>-->
      <!--</el-tag>-->
      <!--<el-form-item label="文件存储" prop="fileLocation" class="fileLocation">-->
        <!--<div>-->
          <!--<el-tag-->
                  <!--v-for="tag in newProps.fileLocation"-->
                  <!--:key="tag"-->
                  <!--closable-->
                  <!--type="success"-->
                  <!--@close="handleRemoveFileLocation(tag)"-->
          <!--&gt;{{tag}}</el-tag>-->
        <!--</div>-->
        <!--<el-input v-model="fileLocationToAdd" placeholder="以/开头，可以包含字母数字下划线中划线，2-18位">-->
          <!--<template slot="append"><el-button class="add-file-location-btn" @click="handleAddFileLocation(fileLocationToAdd)">添加</el-button></template>-->
        <!--</el-input>-->
      <!--</el-form-item>-->
      <!--<div slot="footer" class="dialog-footer">-->
        <!--<el-row>-->
          <!--<el-col :span="12" style="text-align: center">-->
            <!--<el-button type="primary"-->
                       <!--@click="handleDialogButtonClick('fileLocation')"-->
                       <!--:loading="waitingResponse">保&nbsp存</el-button>-->
          <!--</el-col>-->
          <!--<el-col :span="12" style="text-align: center">-->
            <!--<el-button action="profile-dialog/cancel"-->
                       <!--@click="selected.prop = null">取&nbsp消</el-button>-->
          <!--</el-col>-->
        <!--</el-row>-->
      <!--</div>-->
    <!--</el-dialog>-->


    <el-dialog title="修改环境变量" :visible="selected.prop == 'environments'"
               @close="selected.prop = null"
               class="environments"
               v-if="selected.service && selected.model"
    >
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>更改环境变量后需要重新【部署】才能生效！</span>
      </el-tag>
      <el-form :model="newProps" :rules="rules" labelWidth="160px" ref="formInChangeEnvironmentsDialog">
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
      <el-form :model="newProps" :rules="rules" labelWidth="160px" ref="formInChangeHostsDialog">
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
            <el-radio-button v-for="item in cpuAndMemorylist" :label="item.id" :key="item.id">
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
</style>
<style lang="scss" scoped>

  .service-manager {
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
        }
        .el-button + .el-button {
          margin-left: 0px;
          /*margin-right: 10px;*/
        }
      }

      .el-table__expanded-cell {
        .step1 {
          margin-bottom: 8px;
          padding-left: 5px;
          border-left: 6px solid darkslategray;
          font-weight: bold;
        }
        .step2 {
          margin: 8px 0px;
          padding-left: 5px;
          border-left: 6px solid darkslategray;
          font-weight: bold;
        }
        .step3 {
          margin: 8px 0px;
          padding-left: 5px;
          border-left: 6px solid darkslategray;
          font-weight: bold;
        }
        .el-form {
          font-size: 0;
          border-bottom: 1px solid lightgray;
          &:last-child {
            border-width: 0px;
          }
          &.form1{
            .profile-desc + .profile-desc::before {
              content: ', ';
            }
            .el-form-item {
              width: 50%;
            }
            .el-form-item:last-child {
              width: 100%;
            }
          }
          &.form2 {
            .el-form-item {
              width: 80%;
            }
          }
          &.form3 {
            .el-form-item {
              width: 50%;
            }
          }
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
    }
  }
</style>

<script>
  import AppPropUtils from './utils/app_prop';
export default {
  created() {
    let appInfoOfGroup = this.appInfoOfGroup;
    if (appInfoOfGroup) {
      if (appInfoOfGroup.hasOwnProperty('appList')) {
        this.appList = appInfoOfGroup.appList;
      }
      if (appInfoOfGroup.hasOwnProperty('appModelList')) {
        this.appModelList = appInfoOfGroup.appModelList;
      }
      if (appInfoOfGroup.hasOwnProperty('total')) {
        this.totalSize = appInfoOfGroup.total;
      }
      this.selectedAppIndex = 0;
    }
  },
  mounted() {

  },
  data() {
    return {
      appList: [],
      appModelList: [],
      totalSize: 0,

      selectedAppIndex: null,
      selectedAPP: null,
      selectedProfileID: null,
      selectedProfileList: [],

      rules: AppPropUtils.rules,
      currentServiceList: [{
        "draw": 1,
        "start": 0,
        "length": 2147483647,
        "id": 65,
        "groupId": 2,
        "createTime": 1513326115000,
        "updateTime": 1513326112000,
        "tag": "awdawdawd",
        "creatorId": 1,
        "serviceName": "wadawd",
        "language": "NODE_JS",
        "packageType": "TAR_GZ",
        "rollingUpdate": true,
        "volume": null,
        "buildName": null,
        "deleteStatus": false,
        "gitlabAddress": "",
        "gitlabBranch": "",
        "relativePath": "",
        "instanceNum": 1,
        "memory": 2,
        "cpu": 1.0,
        "packageScript": null,
        "deployScript": null,
        "applicationSpaceId": null,
        "healthCheck": "wadawd",
        "image": "awdawdawd",
        "k8s": null,
        "mavenProfileId": null,
        "loadBalance": "Round_robin",
        "languageVersion": null,
        "imageType": null,
        "environments": [],
        "hosts": [],
        "volumes": null,
        "spaceList": null,
        "serverVersion": "V1",
        "spaceId": null,
        "appId": null,
        "address": "wadawd.galaxy.beta",
        "orchId": 4,
        "orchIp": "10.10.13.71",
        "applicationStatus": "NOT_EXISTS",
        "outerDomain": null,
        "oneapm": null,
        "page": 1
      }],
      currentModelList: [],

      selected: {
        index: -1,
        prop: null,
        service: null,
        model: {},
      },
      newProps: {
        healthCheck: '',
        environments: [],
        hosts: [],
        cpuID: null,
        memoryID: null,
      },
      waitingResponse: false,

      getRowKeys: function (row) {
       return row.id;
      },
      expandRows: [],

      /* used for dialog */
      environmentKey: '',
      environmentValue: '',
      hostKey: '',
      hostValue: '',
      /* used for dialog end */
    }
  },
  computed: {
    currentGroupID() {
      let groupID = this.$store.getters['user/groupID'];
      return groupID;
    },
    appInfoOfGroup() {
      return this.$store.getters['user/appInfoOfGroup'];
    },

    /* used for dialog */
    cpuAndMemorylist() {
      let result = [];
      let value = this.$store.getters['app/messageForCreateAPP'];
      if (value && value.hasOwnProperty('cpuAndMemorylist')) {
        result = value.cpuAndMemorylist;
      }
      // set default cpu
      if (Array.isArray(result) && result.length > 0) {
        let firstItem = result[0];
        this.memeorySizeList = 'memoryList' in firstItem ? firstItem.memoryList : '';
      }
      return result;
    }
  },
  watch: {
    selectedAppIndex: function (value, oldValue) {
      let index = value;
      if (this.appList && Array.isArray(this.appList) && this.appList.length > index) {
        this.selectedAPP = this.appList[index];
        this.selectedProfileList = this.selectedAPP['profileList'];
        if (Array.isArray(this.selectedProfileList) && this.selectedProfileList.length > 0) {
          this.selectedProfileID = this.selectedProfileList[0]['id'];
        }
      }
    },
    selectedProfileID: function (value, oldValue) {
      let profileID = this.selectedProfileID;
      let appID = this.selectedAPP.appId;
      this.requestServiceList(appID, profileID);
    }
  },

  methods: {
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
      switch (action) {
        case 'deploy':
          let serviceID = this.selected.service['id'];
          if (!serviceID) {
            console.log('serviceID not found');
            return;
          }
          this.$net.serviceDeploy({
            id: serviceID
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
      if (['healthCheck', 'mirror','environments', 'cpuAndMemory'].indexOf(prop) == -1) {
        console.log(`${prop} not found`);
        return;
      }
      if ('cpuAndMemory' === prop) {
        this.newProps['cpuID'] = JSON.parse(JSON.stringify(this.selected.model['cpuID']));
        this.newProps['memoryID'] = JSON.parse(JSON.stringify(this.selected.model['memoryID']));
      } else {
        this.newProps[prop] = JSON.parse(JSON.stringify(this.selected.model[prop]));
      }
      this.waitingResponse = false;
      switch (prop) {
        case 'healthCheck':
          this.$refs.hasOwnProperty('formInChangeHealthCheckDialog') &&
          this.$refs['formInChangeHealthCheckDialog'].validate();
          break;
        case 'environments':
          this.$refs.hasOwnProperty('formInChangeEnvironmentsDialog') &&
          this.$refs['formInChangeEnvironmentsDialog'].validate();
          break;
        case 'cpuAndMemory':
          this.$refs.hasOwnProperty('formInChangeCpuAndMemoryDialog') &&
          this.$refs['formInChangeCpuAndMemoryDialog'].validate();
          let cpuAndMemorylist = this.cpuAndMemorylist;
          break;
      }
      this.selected.prop = prop;
    },

    /**
     * do some action of ok button in popup-dialog
     * @param prop
     */
    handleDialogButtonClick(action) {
      switch (action) {
        case 'healthCheck':
          this.$refs['formInChangeHealthCheckDialog'].validate((valid) => {
            if (!valid) {
              return;
            }
            if (!this.newProps.hasOwnProperty(action) || !this.selected.model.hasOwnProperty(action)) {
              return;
            }
            if (this.$utils.theSame(this.newProps[action], this.selected.model[action])) {
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
                this.updateModelInfo('healthCheck');
              }, 1000);
//              this.$net.changeProfile({
//                id: this.selected.app['appId'],
//                spaceList: this.newProps['profiles']
//              }).then(msg => {
//                this.waitingResponse = false;
//                this.selected.prop = null;
//                this.$message({
//                  type: 'success',
//                  message: msg
//                });
//                this.updateAppInfo(action, this.selected.index);
//              }).catch(err => {
//                this.waitingResponse = false;
//                this.selected.prop = null;
//                this.$notify.error({
//                  title: '修改运行环境失败！',
//                  message: err
//                });
//              })
            }
          });
          break;
        case 'environments':
          this.$refs['formInChangeEnvironmentsDialog'].validate((valid) => {
            if (!valid) {
              return;
            }
            if (!this.newProps.hasOwnProperty(action) || !this.selected.model.hasOwnProperty(action)) {
              return;
            }
//            console.log(this.newProps.environments);
//            console.log(this.selected.model.environments);
            if (this.$utils.theSame(this.newProps[action], this.selected.model[action])) {
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
              }, 1000);
            }
          });
          break;
        case 'hosts':
          this.$refs['formInChangeHostsDialog'].validate((valid) => {
            if (!valid) {
              return;
            }
            if (!this.newProps.hasOwnProperty(action) || !this.selected.model.hasOwnProperty(action)) {
              return;
            }
//            console.log(this.newProps.environments);
//            console.log(this.selected.model.environments);
            if (this.$utils.theSame(this.newProps[action], this.selected.model[action])) {
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
     * update value of service and model when server feedback is ok
     */
    updateModelInfo(prop) {
      switch (prop) {
        case 'healthCheck':
          this.selected.model[prop] = this.newProps[prop];
          this.selected.service[prop] = this.newProps[prop];
          break;
        case 'cpuAndMemory':
          let cpuID = this.newProps['cpuID'];
          let memoryID = this.newProps['memoryID'];
          this.selected.model['cpuID'] = cpuID;
          this.selected.model['memoryID'] = memoryID;
          let cpuAndMemoryInfo = AppPropUtils.getCPUAndMemoryInfoByID(cpuID, memoryID);
          this.selected.service['cpu'] = cpuAndMemoryInfo[0];
          this.selected.service['memory'] = cpuAndMemoryInfo[1];
          break;
      }
    },

    handleSelectChange(from) {
      switch (from) {
        case 'app':
          break;
        case 'profile':
          break;
      }
    },
    requestServiceList(appID, spaceID) {
      if (!appID || !spaceID) {
        console.log('appID or spaceID can not be empty');
        return;
      }
      this.$net.getServiceListByAppIDAndProfileID({
        appId: appID,
        spaceId: spaceID
      }).then(content => {
        if (content.hasOwnProperty('applicationServerList')) {
          this.currentServiceList = content['applicationServerList'];
          this.currentModelList = content['serviceModelList'];
//          console.log(this.currentServiceList);
//          console.log(this.currentModelList);
        }
      })
    },

    /* used for dialog */
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
      if (Array.isArray(this.cpuAndMemorylist)) {
        this.cpuAndMemorylist.some(it => {
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
    /* used for dialog end */
  }

  /**
   * some detail logic of service manager:
   * 1. deploy button should be hidden when the profile is '生产环境', related profile-id is 5
   */
}
</script>