<template>
  <div id="middleware-mariadb-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="section-title">申请Redis实例</div>
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
        <el-form-item label="运行环境" prop="clusterId" class="cluster-id">
          <el-radio-group v-model="formData.clusterId">
            <el-radio v-for="item in clusterList" :label="item.id" :key="item.id">
              {{item.description}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
      <div>
        <div class="title">资源信息</div>
        <el-form-item label="使用期限" prop="leaveTime">
          <div style="width: 360px; display: inline-block; margin-left: 5px;">
            <el-slider v-model="formData.leaveTime" :show-tooltip="true" :show-stops="false"
                       :min="10" :max="90" :step="1"></el-slider>
          </div>
          <div style="display: inline-block; margin-left: 15px;"><span>{{formData.leaveTime}}天</span></div>
        </el-form-item>
        <el-form-item label="磁盘大小" prop="memory" class="memory">
          <div style="width: 360px; display: inline-block; margin-left: 5px;">
            <el-slider v-model="formData.memory" :show-tooltip="true" :show-stops="false" :format-tooltip="utils.formatTooltipForMemory"
                       :min="512 * utils.ONE_MILLION" :max="256 * 4 * 5 * utils.ONE_MILLION" :step="256 * utils.ONE_MILLION"></el-slider>
          </div>
          <div style="display: inline-block; margin-left: 15px;"><span></span>{{bytes(formData.memory)}}</div>
        </el-form-item>
        <el-form-item label="备注" prop="comment" class="comment">
          <el-input v-model="formData.comment" placeholder="备注"
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
      &.memory {
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
  import bytes from 'bytes';
  import commonUtils from 'assets/components/mixins/common-utils';
  const PROFILE_LIST = [{
  }];
  module.exports = {
    mixins: [commonUtils],
    async created() {
      this.bytes = bytes;
      this.utils = utils;
      const profile = 'test';
      const middlewareName = 'redis';
      await this.$storeHelper.checkBasicData4Middleware(profile, middlewareName);
//      console.log(this.$storeHelper.getClusterList());
//      console.log(this.$storeHelper.currentMiddleware);

      this.clusterId = this.$storeHelper.currentMiddleware['clusterId'];
      this.middlewareId = this.$storeHelper.currentMiddleware['middlewareId'];
      this.middlewareVersionList = this.$storeHelper.getMiddlewareVersionList(this.clusterId, this.middlewareId);

      this.formData.clusterId = this.clusterId;
      if (this.middlewareVersionList.length > 0) {
        this.formData.versionId = this.middlewareVersionList[0]['id'];
      }
      this.formData.cpu = this.constants['cpuList'][0];
      this.formData.memory = this.constants['memoryList'][0];

//      console.log(this.middlewareVersionList);
//      console.log(this.clusterId);
//      console.log(this.$storeHelper.getClusterList());
    },

    mounted() {

    },
    computed: {
      clusterList() {
        var results = this.$storeHelper.getClusterList();
        if (!results) {
          results = [];
        }
        results = results.filter(it => it['clusterName']).filter(it => it['clusterName'] != 'production');
        return results;
      }
    },
    data() {
      return {
        clusterId: null,
        middlewareId: null,
        middlewareVersionList: [],
        showLoading: false,
        loadingText: '',
        formData: {
          name: '',
          versionId: '',
          clusterId: '',
          dbName: '',
//          cpu: '',
          leaveTime: 30,
          memory: 256 * utils.ONE_MILLION,
          userName: '',
          password: '',
          confirmPassword: '',
          comment: '',
        },
        formRules: utils.redis.rules,

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
//            console.log(this.formData);
            try {
              var [valid, errors] = await this.$refs['createInstanceForm'].validate();
//            console.log(valid, errors);
              if (!valid) {
                return;
              }
              const formData = this.formData;
              const payload = {
                groupId: this.$storeHelper.currentGroupID,
                namespace: this.$storeHelper.groupInfo.tag,
                clusterId: this.clusterId,
                middlewareId: this.middlewareId,
                middlewareVersionId: formData.versionId,
                name: formData.name,
                memory: formData.memory / utils.ONE_MILLION,
                instanceDescribe: formData.comment,
                lifecycle: formData.leaveTime,
                isCluster: ''
              };
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_redis_instance_create, {
                payload
              });
//            console.log(resContent);
              this.$message.success(`实例${formData.name}创建成功！`);
              this.$router.push(this.$net.page['profile/middleware/redis']);
            } catch (err) {

            }
            break;
        }
      }
    }
  }
</script>