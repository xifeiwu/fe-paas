<template>
  <div id="middleware-mariadb-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="section-title">
      <span>{{forModify ? '修改Mariadb实例配置' : '申请Mariadb实例'}}</span>
      <el-tooltip slot="trigger" effect="dark" placement="bottom">
        <div slot="content">
          <div>1. 数据库密码会由系统自动生成，可在实例详情中查看</div>
          <div>2. 剩余有效天数为0后，系统会自动回收相关资源</div>
        </div>
        <i class="paas-icon-fa-question"></i>
      </el-tooltip>
    </div>
    <el-form :model="formData" :rules="formRules" size="mini"
             ref="createInstanceForm" label-width="120px">
      <div>
        <div class="title">基本信息</div>
        <el-form-item label="实例名称" prop="name" class="name">
          <div v-if="forModify">{{formData.name}}</div>
          <el-input v-model="formData.name" placeholder="小写字符，数字，中划线，不能以中划线开始或结尾。2-256个字符" v-else></el-input>
        </el-form-item>
        <el-form-item label="mariadb版本" prop="versionId" class="name" v-if="!forModify">
          <el-radio-group v-model="formData.versionId">
            <el-radio v-for="item in middlewareVersionList" :label="item.id" :key="item.id">
              {{item.middlewareVersion}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
      <div>
        <div class="title">资源信息</div>
        <el-form-item label="剩余有效天数" prop="remainingDays">
          <div style="width: 360px; display: inline-block; margin-left: 5px;">
            <el-slider size="small" v-model="formData.remainingDays" :show-tooltip="true" :show-stops="false"
                       :min="1" :max="90" :step="1"></el-slider>
          </div>
          <div style="display: inline-block; margin-left: 15px;"><span>{{formData.remainingDays}}天</span></div>
        </el-form-item>
        <el-form-item label="CPU" prop="cpu" v-if="!forModify">
          <el-radio-group v-model="formData.cpu" size="small">
            <el-radio v-for="item in constants.cpuList" :label="item" :key="item">
              {{item}}核
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内存" prop="memory" v-if="!forModify">
          <el-radio-group v-model="formData.memory" size="small">
            <el-radio v-for="item in constants.memoryList" :label="item" :key="item">
              {{item}}G
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="磁盘" prop="disk" class="disk" v-if="!forModify">
          <div style="width: 200px; display: inline-block; margin-left: 5px;">
            <el-slider size="small" v-model="formData.disk" :show-tooltip="true" :show-stops="true" :min="1" :max="5" :step="1"></el-slider>
          </div>
          <div style="display: inline-block; margin-left: 15px;"><span>当前值：</span>{{formData.disk}}G</div>
        </el-form-item>
      </div>
      <div>
        <div class="title">数据库信息</div>
        <el-form-item label="数据库名" prop="dbName" class="db-name" v-if="!forModify">
          <el-input v-model="formData.dbName" placeholder="英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="userName" class="user-name" v-if="!forModify">
          <el-input v-model="formData.userName" placeholder="英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" class="password" v-if="false">
          <el-input v-model="formData.password" placeholder="英文，数字，下划线，中划线。2-30个字符" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" class="confirm-password" v-if="false">
          <el-input v-model="formData.confirmPassword" placeholder="英文，数字，下划线，中划线。2-30个字符" type="password"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="comment" class="comment">
          <el-input v-model="formData.comment" placeholder="长度小于100个字符"
                    size="mini"
                    type="textarea"
                    :rows="3"></el-input>
        </el-form-item>
      </div>
    </el-form>
    <div class="section-footer">
      <div class="item">
        <el-button type="primary" size="mini" @click="handleClick($event, forModify ? 'update' : 'create')"
                   :loading="statusOfWaitingResponse('submit')">完成</el-button>
      </div>
      <div class="item">
        <el-button type="primary" size="mini" @click="$router.go(-1)">关闭</el-button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
#middleware-mariadb-add {
  background: white;
  margin: 10px;
  padding: 10px 30px;
  width: 80%;
  max-width: 750px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  .section-title {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 15px 0px;
    font-size: 18px;
    font-weight: bold;
    .paas-icon-fa-question {
      font-size: 15px;
      color: #E6A23C;
      margin-left: 3px;
      &:hover {
        cursor: pointer;
      }
    }
  }
  .section-footer {
    margin: 0px -10px;
    padding-top: 10px;
    border-top: 1px solid #e7e7e7;
    display: flex;
    .item {
      flex: 1;
      text-align: center;
    }
    .el-button {
      display: inline-block;
      width: 150px;
    }
  }
  .el-form {
    .title {
      font-size: 15px;
      font-weight: 500;
      color: #409EFF;
      margin: 5px 0px 10px 0px;
      padding: 0px 5px;
      border-left: 5px solid #409EFF;
    }
    .el-form-item {
      &.disk {
        .el-slider {
          /*margin-left: 5px;*/
          /*max-width: 200px;*/
        }
      }
      .el-form-item__label {
        font-weight: normal;
      }
      &.finish {
        .el-button {
          display: block;
          margin: 0px auto;
          width: 50%;
          max-width: 200px;
          text-align: center;
        }
      }
    }
  }
}
</style>
<script>
  import utils from '../utils';
  import commonUtils from 'assets/components/mixins/common-utils';
  module.exports = {
    mixins: [commonUtils],
    async created() {
//      const profile = 'unProduction';
//      const middlewareName = 'mariadb';
//      await this.$storeHelper.checkBasicData4Middleware(profile, middlewareName);
//      console.log(this.$storeHelper.getClusterList());
//      console.log(this.$storeHelper.currentMiddleware);


      this.forModify = (this.$route['path'] == this.$net.page['profile/middleware/mariadb/modify']);

      var goBack = false;
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
//        console.log(dataTransfer);
        const data = dataTransfer['data'];
        if (this.forModify) {
          this.clusterInfo = data.clusterInfo;
          this.middlewareInfo = data.middlewareInfo;
          this.formData.name = data.name;
          this.dataPassed.name = data.name;
          this.dataPassed.remainingDays = data.remainingDays;
          this.formData.remainingDays = data.remainingDays;
          this.formData.comment = data.instanceDescribe;
          this.$storeHelper.dataTransfer = null;
        } else {
          this.clusterInfo = data.clusterInfo;
          this.middlewareInfo = data.middlewareInfo;
        }
      } else {
        goBack = true;
      }
//      console.log(this.clusterInfo);
//      console.log(this.middlewareInfo);

      if (goBack) {
        this.$router.push(this.$net.page['profile/middleware/mariadb']);
        return;
      }

      // get version list
      this.middlewareVersionList = this.$storeHelper.getMiddlewareVersionList(this.clusterInfo.id, this.middlewareInfo.id);
      // set default value for formData
      if (this.middlewareVersionList.length > 0) {
        const firstVersion = this.middlewareVersionList[0];
        this.formData.versionId = firstVersion.hasOwnProperty('id') ? firstVersion['id'] : '';
      }
      this.formData.cpu = this.constants['cpuList'][0];
      this.formData.memory = this.constants['memoryList'][0];
//      console.log(this.middlewareVersionList);
    },

    mounted() {

    },
    data() {
      return {
        forModify: false,
        clusterInfo: null,
        middlewareInfo: null,
        middlewareVersionList: [],

        showLoading: false,
        loadingText: '',
        // for show
        dataPassed: {
          name: '',
          remainingDays: ''
        },
        // for update
        formData: {
          name: '',
          versionId: '',
          dbName: '',
          remainingDays: 30, // 默认生效天数为30天
          cpu: '',
          memory: '',
          disk: 1,
          userName: '',
          password: '',
          confirmPassword: '',
          comment: '',
        },
        formRules: utils.mariadbRules,

        constants: {
          cpuList: [1, 2],
          memoryList: [2, 3, 4]
        },

      }
    },
    watch: {

    },
    methods: {
      async handleClick(evt, action) {
        const formData = this.formData;
        var payload = {
          groupId: this.$storeHelper.currentGroupID,
          namespace: this.$storeHelper.groupInfo.tag,
          clusterId: this.clusterInfo.id,
          middlewareId: this.middlewareInfo.id,
          name: formData.name,
        };
        var resContent = null;
        var [valid, errors] = await this.$refs['createInstanceForm'].validate();
        if (!valid) {
          return;
        }
        switch (action) {
          case 'create':
            try {
              payload = Object.assign(payload, {
                middlewareVersionId: formData.versionId,
                databaseName: formData.dbName,
                lifecycle: formData.remainingDays,
                cpuRequests: formData.cpu,
                memoryRequests: formData.memory,
                storageSize: formData.disk,
                databaseUser: formData.userName,
//                databasePassword: formData.password,
                instanceDescribe: formData.comment
              });
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_create, {
                payload
              });
//            console.log(resContent);
              this.$message.success(`实例${formData.name}创建成功！`);
              this.$router.push(this.$net.page['profile/middleware/mariadb']);
            } catch (err) {
              console.log(err);
            }
            break;
          case 'update':
            try {
              payload = Object.assign(payload, {
                instanceDescribe: formData.comment,
                delayDays: formData.remainingDays - this.dataPassed.remainingDays,
              });
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_update_config, {
                payload
              });
              this.$message.success(`实例 "${formData.name}" 更新成功！`);
              this.$router.push(this.$net.page['profile/middleware/mariadb']);
            } catch (err) {
              console.log(err);
            }
            break;
        }
      }
    }
  }
</script>