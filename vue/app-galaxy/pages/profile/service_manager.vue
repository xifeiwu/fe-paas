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
            <el-button size="mini-extral" type="warning"
                       @click="handleOperationClick('deploy', scope.$index, scope.row)">部署</el-button>
            <el-button size="mini-extral"type="warning"
                       @click="handleOperationClick('running-log', scope.$index, scope.row)">运行日志</el-button>
            <el-button size="mini-extral" type="warning"
                       @click="handleOperationClick('stop', scope.$index, scope.row)">停止</el-button>
            <el-button size="mini-extral" type="warning">重启</el-button>
            <el-button size="mini-extral" type="warning"
                       @click="handleOperationClick('instance-list', scope.$index, scope.row)">实例列表</el-button>
            <el-button size="mini-extral" type="warning"
                       @click="handleOperationClick('domain-config', scope.$index, scope.row)">配置外网二级域名</el-button>
            <el-button size="mini-extral" type="warning"
                       @click="handleOperationClick('delete', scope.$index, scope.row)">删除</el-button>
            <el-button size="mini-extral" type="warning"
                       @click="handleOperationClick('service_info', scope.$index, scope.row)">服务信息</el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         v-if="true"
                         width="0"
        >
          <template slot-scope="scope">
            <div class="step1">应用信息</div>
            <el-form label-position="right" class="demo-table-expand" label-width="120px" inline style="width: 100%">
              <el-form-item label="项目名称：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.serviceName}}
              </el-form-item>
              <el-form-item label="运行环境：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                <el-tag v-for="item in selected.service.profileList" :key="item.name">
                  {{item.description}}
                </el-tag>
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
            </el-form>
            <div class="step2">镜像信息</div>
            <el-form label-position="right" class="demo-table-expand" label-width="120px" style="width: 100%">
              <el-form-item label="镜像方式：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.imageType}}
              </el-form-item>
              <el-form-item label="基础镜像地址：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.image}}
              </el-form-item>
              <el-form-item label="文件存储：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.volumes}}
              </el-form-item>
              <el-form-item label="环境变量配置：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.environments}}
              </el-form-item>
              <el-form-item label="Host配置：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.hosts}}
              </el-form-item>
            </el-form>
            <div class="step3">实例规格</div>
            <el-form label-position="right" class="demo-table-expand" label-width="120px" inline style="width: 100%">
              <el-form-item label="CPU/内存：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.cpu + '核 / ' + selected.service.memory + 'G'}}
              </el-form-item>
              <el-form-item label="实例数量：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.instanceNum}}
              </el-form-item>
              <el-form-item label="滚动升级：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.rollingUpdate}}
              </el-form-item>
              <el-form-item label="负载均衡：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{selected.service.loadBalance}}
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
      <el-form :model="newProps" :rules="rules" labelWidth="160px" ref="formInChangeHealthCheckDialog">
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
  </div>
</template>

<style lang="scss">
  .fix-form-item-label {
    line-height: 25px;
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
          .el-form-item {
            width: 50%;
            margin-right: 0;
            margin-bottom: 10px;
            .el-icon-edit {
              margin-left: 8px;
              font-size: 100%;
              font-weight: bold;
              color: #eb9e05;
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
      },
      waitingResponse: false,

      getRowKeys: function (row) {
       return row.id;
      },
      expandRows: []
    }
  },
  computed: {
    currentGroupID() {
      let groupID = this.$store.getters['user/groupID'];
      return groupID;
    },
    appInfoOfGroup() {
      return this.$store.getters['user/appInfoOfGroup'];
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
//      console.log(this.selectedProfileID);
//      console.log(this.selectedAPP.appId);
//      console.log(this.selectedProfileList);
    }
  },

  methods: {
    handleOperationClick(action, index, row) {
      let currentService = this.currentServiceList[index];
      if (!currentService) {
        return;
      } else {
        this.selected.service = currentService;
        this.selected.model = this.currentModelList[index];
      }
      switch (action) {
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
    handleChangeProp(prop) {
      console.log(prop);
      this.newProps[prop] = this.selected.model[prop];
      console.log(this.$refs);
      this.waitingResponse = false;
      switch (prop) {
        case 'healthCheck':
//          this.$refs['formInChangeHealthCheckDialog'].validate();
          break;
      }
      this.selected.prop = prop;
    },

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
          console.log(this.currentServiceList);
          console.log(this.currentModelList);
        }
      })
    },
  }
}
</script>