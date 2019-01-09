<template>
  <div id="middleware-mariadb-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="section-title">申请Mariadb实例</div>
    <el-form :model="formData" :rules="formRules" size="mini"
             ref="createInstanceForm" label-width="120px">
      <div>
        <div class="title">基本信息</div>
        <el-form-item label="实例名称" prop="name" class="name">
          <el-input v-model="formData.name" placeholder="小写字符，数字，中划线，不能以中划线开始或结尾。2-256个字符"></el-input>
        </el-form-item>
        <el-form-item label="mariadb版本" prop="versionId" class="name">
          <el-radio-group v-model="formData.versionId">
            <el-radio v-for="item in middlewareVersionList" :label="item.id" :key="item.id">
              {{item.middlewareVersion}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
      <div>
        <div class="title">资源信息</div>
        <el-form-item label="CPU" prop="cpu">
          <el-radio-group v-model="formData.cpu" size="small">
            <el-radio v-for="item in constants.cpuList" :label="item" :key="item">
              {{item}}核
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内存" prop="memory">
          <el-radio-group v-model="formData.memory" size="small">
            <el-radio v-for="item in constants.memoryList" :label="item" :key="item">
              {{item}}G
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="磁盘" prop="disk" class="disk">
          <div style="width: 200px; display: inline-block; margin-left: 5px;">
            <el-slider v-model="formData.disk" :show-tooltip="true" :show-stops="true" :min="1" :max="5" :step="1"></el-slider>
          </div>
          <div style="display: inline-block; margin-left: 15px;"><span>当前值：</span>{{formData.disk}}G</div>
        </el-form-item>
      </div>
      <div>
        <div class="title">数据库信息</div>
        <el-form-item label="数据库名" prop="dbName" class="db-name">
          <el-input v-model="formData.dbName" placeholder="英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="userName" class="user-name">
          <el-input v-model="formData.userName" placeholder="英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" class="password">
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
        <el-button type="primary" size="mini" @click="handleClick($event, 'submit')"
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
    font-size: 18px;
    text-align: center;
    margin-bottom: 20px;
    font-weight: bold;
    .paas-icon-fa-question {
      font-size: 14px;
      color: #E6A23C;
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
  import utils from 'assets/libs/element-ui/utils';
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
          this.dataPassed.leaveTime = data.leaveTime;
          this.formData.leaveTime = data.leaveTime;
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
        this.formData.versionId = this.middlewareVersionList[0]['id'];
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
        formData: {
          name: '',
          versionId: '',
          dbName: '',
          cpu: '',
          memory: '',
          disk: 1,
          userName: '',
          password: '',
          confirmPassword: '',
          comment: '',
        },
        formRules: {
          name: [{
            required: true,
            message: '请输入实例名称',
            trigger: 'blur'
          }, {
            validator: (rule, values, callback) => {
              const reg = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
              let passed = true;
              if (!reg.exec(values)) {
                passed = false;
                callback('可以包含小写字符数字或中划线，但不能以中划线开始或结尾');
              }
              if (passed) {
                callback();
              }
            }
          }],
          versionId: [{
            type: 'number',
            required: true,
            message: '请选择实例版本',
            trigger: 'blur'
          }],
          cpu: [{
            type: 'number',
            required: true,
            message: '请选择CPU类型',
            trigger: 'blur'
          }],
          memory: [{
            type: 'number',
            required: true,
            message: '请选择内存大小',
            trigger: 'blur'
          }],
          disk: [{
            type: 'number',
            required: true,
            message: '请选择磁盘大小',
            trigger: 'blur'
          }],
          dbName: [{
            required: true,
            message: '请输入数据库名称',
            trigger: 'blur'
          }, {
            validator: utils.generateValidator(true, false, 2, 30, true)
          }],
          userName: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }, {
            validator: utils.generateValidator(true, false, 2, 30, true)
          }],
          password: [{
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          }, {
            validator: utils.generateValidator(true, false, 2, 30, true)
          }],
          comment: [{
            validator(rule, values, callback) {
              if (values.length > 100) {
                callback('长度不能超过100个字符');
                return;
              }
              callback();
            }
          }]
        },

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
        switch (action) {
          case 'submit':
            try {
              var [valid, errors] = await this.$refs['createInstanceForm'].validate();

              const formData = this.formData;
              const payload = {
                groupId: this.$storeHelper.currentGroupID,
                namespace: this.$storeHelper.groupInfo.tag,
                clusterId: this.clusterInfo.id,
                middlewareId: this.middlewareInfo.id,
                name: formData.name,
                middlewareVersionId: formData.versionId,
                databaseName: formData.dbName,
                cpuRequests: formData.cpu,
                memoryRequests: formData.memory,
                storageSize: formData.disk,
                databaseUser: formData.userName,
                databasePassword: formData.password,
                instanceDescribe: formData.comment
              };
//            console.log(payload);
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_mariadb_instance_create, {
                payload
              });
//            console.log(resContent);

              this.$message.success(`实例${formData.name}创建成功！`);
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