<template>
  <div id="middleware-redis-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="section-title">{{forModify ? '修改Redis实例配置' : '申请Redis实例'}}</div>
    <el-tag type="warning">
      <i class="el-icon-warning"></i>
      <span>温馨提示：因平台资源受限，目前每个团队能申请的（所有环境累计）：CPU总量≤8核，内存总量≤16G，磁盘总量≤100G；待资源放开后可满足更多资源需求。</span>
    </el-tag>
    <el-form :model="formData" :rules="formRules" size="mini"
             ref="createInstanceForm" label-width="120px">
      <div>
        <div class="title">基本信息</div>
        <el-form-item label="实例名称" prop="name" class="name">
          <div v-if="forModify">{{formData.name}}</div>
          <el-input v-model="formData.name" placeholder="小写字符，数字，中划线，不能以中划线开始或结尾。2-63个字符" :maxlength=63 v-else></el-input>
        </el-form-item>
        <el-form-item label="mariadb版本" prop="versionId" class="name">
          <el-radio-group v-model="formData.versionId">
            <el-radio v-for="item in middlewareVersionList" :label="item.id" :key="item.id">
              {{item.middlewareVersion}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="运行环境" prop="clusterId" class="cluster-id" v-if="false">
          <div v-if="forModify">{{clusterInfo.description}}</div>
          <el-radio-group v-model="formData.clusterId" v-else>
            <el-radio v-for="item in clusterList" :label="item.id" :key="item.id">
              {{item.description}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
      <div>
        <div class="title">资源信息</div>
        <el-form-item label="剩余有效天数" prop="remainingDays">
          <div style="width: 360px; display: inline-block; margin-left: 5px;">
            <el-slider v-model="formData.remainingDays" :show-tooltip="true" :show-stops="false"
                       :min="1" :max="90" :step="1"></el-slider>
          </div>
          <div style="display: inline-block; margin-left: 15px;"><span>{{formData.remainingDays}}天</span></div>
        </el-form-item>
        <el-form-item label="内存大小" prop="memory" class="memory" v-if="!forModify">
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
        <el-button type="primary" size="mini" @click="handleClick($event, forModify ? 'update' : 'create')">完成</el-button>
      </div>
      <div class="item">
        <el-button type="primary" size="mini" @click="$router.go(-1)">关闭</el-button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
#middleware-redis-add {
  background: white;
  margin: 10px;
  padding: 10px 30px;
  width: 80%;
  max-width: 750px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  .el-tag {
    white-space: normal;
    height: auto;
    width: 100%;
    margin-bottom: 15px;
  }
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

      this.forModify = (this.$route['path'] == this.$net.page['profile/middleware/redis/modify']);

      var goBack = false;
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
//        console.log(dataTransfer);
        const data = dataTransfer['data'];
        if (this.forModify) {
          this.clusterInfo = data.clusterInfo;
          this.middlewareInfo = data.middlewareInfo;
          this.formData.name = data.name;
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

      if (goBack) {
        this.$router.push(this.$net.page['profile/middleware/redis']);
        return;
      }

//      const profile = this.clusterInfo['clusterName'];
//      const middlewareName = this.middlewareInfo['middlewareName'];
//      await this.$storeHelper.checkBasicData4Middleware(profile, middlewareName);
//      this.clusterId = this.$storeHelper.currentMiddleware['clusterId'];
//      this.middlewareId = this.$storeHelper.currentMiddleware['middlewareId'];

      this.middlewareVersionList = this.$storeHelper.getMiddlewareVersionList(this.clusterInfo.id, this.middlewareInfo.id);

      this.formData.clusterId = this.clusterInfo.id;
      if (this.middlewareVersionList.length > 0) {
        this.formData.versionId = this.middlewareVersionList[0]['id'];
      }
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
        forModify: false,

//        clusterId: null,
//        middlewareId: null,
        clusterInfo: null,
        middlewareInfo: null,
        middlewareVersionList: [],
        showLoading: false,
        loadingText: '',
        dataPassed: {
          remainingDays: null,
        },
        formData: {
          name: '',
          versionId: '',
          clusterId: '',
          remainingDays: 30,
          memory: 256 * utils.ONE_MILLION,
          comment: '',
        },
        formRules: utils.redisRules,

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
//            console.log(this.formData);
        var resContent = null;
        var [valid, errors] = await this.$refs['createInstanceForm'].validate();
//            console.log(valid, errors);
        if (!valid) {
          return;
        }
        switch (action) {
          case 'create':
            try {
              payload = Object.assign(payload, {
                middlewareVersionId: formData.versionId,
                memory: formData.memory / utils.ONE_MILLION,
                instanceDescribe: formData.comment,
                lifecycle: formData.remainingDays,
                isCluster: ''
              });
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_redis_instance_create, {
                payload
              });
//            console.log(resContent);
              this.$message.success(`实例 "${formData.name}" 创建成功！`);
              this.$router.push(this.$net.page['profile/middleware/redis']);
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
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_redis_update_config, {
                payload
              });
              this.$message.success(`实例 "${formData.name}" 更新成功！`);
              this.$router.push(this.$net.page['profile/middleware/redis']);
            } catch (err) {
              console.log(err);
            }
            break;
        }
      }
    }
  }
</script>