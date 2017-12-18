<template>
  <div class="service-manager">
    <el-form inline labelWidth="80px" class="title">
      <el-form-item label="应用名称">
        <el-select v-model="currentAppIndex" placeholder="请选择" @change="handleSelectChange('app')">
          <el-option v-for="(item, index) in appList" :key="item.appId" :label="item.serviceName" :value="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运行环境">
        <el-select v-model="currentProfileID" placeholder="请选择" @change="handleSelectChange('profile')">
          <el-option v-for="item in currentProfileList" :key="item.id" :label="item.description" :value="item.id">
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
            <el-form label-position="right" class="demo-table-expand" label-width="120px">
              <el-form-item label="项目名称：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                {{currentAPP.serviceName}}
              </el-form-item>
              <el-form-item label="运行环境：" :labelClass="['fix-form-item-label']" :contentClass="['fix-form-item-content']">
                <el-tag v-for="item in currentAPP.profileList" :key="item.name">
                  {{item.description}}
                </el-tag>
              </el-form-item>
              <el-form-item label="开发语言：">
                {{currentAPP.language + ' - ' + currentAPP.languageVersion}}
              </el-form-item>
              <el-form-item label="构建类型：">
                {{currentAPP.packageType}}
              </el-form-item>
              <el-form-item label="健康检查：">
                {{currentAPP.healthCheck}}
              </el-form-item>
              <el-form-item label="oneAPM监控：">
                {{currentAPP.healthCheck}}
              </el-form-item>
              <el-form-item label="gitlab ssh地址：">
              </el-form-item>
              <el-form-item label="gitlab分支：">
              </el-form-item>
              <el-form-item label="Gitlab父级pom.xml相对路径：">
              </el-form-item>
              <el-form-item label="Maven profile id：">
              </el-form-item>
              <el-form-item label="镜像方式：">
              </el-form-item>
              <el-form-item label="基础镜像地址：">
              </el-form-item>
              <el-form-item label="文件存储：">
              </el-form-item>
              <el-form-item label="环境变量配置：">
              </el-form-item>
              <el-form-item label="Host配置：">
              </el-form-item>
              <el-form-item label="CPU/内存：">
              </el-form-item>
              <el-form-item label="实例数量：">
              </el-form-item>
              <el-form-item label="滚动升级：">
              </el-form-item>
              <el-form-item label="负载均衡：">
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

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
</style>

<script>
  import ElFormItem from "../../../packages/form/src/form-item";
export default {
  components: {ElFormItem}, created() {
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
      this.currentAppIndex = 0;
    }
  },
  mounted() {

  },
  data() {
    return {
      currentAppIndex: null,
      currentAPP: null,
      currentProfileID: null,
      currentProfileList: [],
      appList: [],
      appModelList: [],
      totalSize: 0,
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
    currentAppIndex: function (value, oldValue) {
      let index = value;
      if (this.appList && Array.isArray(this.appList) && this.appList.length > index) {
        this.currentAPP = this.appList[index];
        this.currentProfileList = this.currentAPP['profileList'];
        if (Array.isArray(this.currentProfileList) && this.currentProfileList.length > 0) {
          this.currentProfileID = this.currentProfileList[0]['id'];
        }
      }
    },
    currentProfileID: function (value, oldValue) {
      let profileID = this.currentProfileID;
      let appID = this.currentAPP.appId;
      this.requestServiceList(appID, profileID);
//      console.log(this.currentProfileID);
//      console.log(this.currentAPP.appId);
//      console.log(this.currentProfileList);
    }
  },

  methods: {
    handleOperationClick(action, index, row) {
      switch (action) {
        case 'service_info':
          if (this.expandRows.indexOf(index) > -1) {
            this.expandRows.splice(this.expandRows.indexOf(index), 1);
          } else {
            this.expandRows = [index];
          }
          break;
      }
      console.log(this.currentAPP);
    },
    requestService() {
      if (null === this.currentAppIndex || null === this.currentProfileID) {
        return;
      }
      let appID = this.appList[this.currentAppIndex]['appId'];
      console.log(appID + '; ' + this.currentProfileID);
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
        }
      })
    }
  }
}
</script>