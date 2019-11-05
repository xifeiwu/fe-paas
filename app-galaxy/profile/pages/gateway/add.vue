<template>
  <div id="gateway_add">
    <div class="section-title">
      <span>{{forModify ? '修改API网关' : '创建API网关'}}</span>
    </div>
    <el-form :model="formData" :rules="formRules" size="mini" v-if="gatewayStatusFromNet"
             ref="createInstanceForm" label-width="90px">
      <el-form-item label="应用名称" class="message-show">{{gatewayStatusFromNet.appName}}</el-form-item>
      <el-form-item label="运行环境" class="message-show">{{gatewayStatusFromNet.spaceName}}</el-form-item>
      <el-form-item label="请求类型" class="message-show">HTTP</el-form-item>

      <div class="el-form-item el-form-item--mini timeout-setting" style="margin-bottom: 0px;">
        <div class="el-form-item__label" style="width: 90px; float: left; z-index: 11">
          <span>超时设置</span>
        </div>
        <div class="el-form-item__content" style="margin-left: 90px;">
          <el-form-item label="连接超时" labelWidth="70px">
            <el-input-number v-model="formData.connTimeout" :min="0" :max="120" size="mini" label="连接超时"></el-input-number><span>秒</span>
            <i class="paas-icon-question" v-pop-on-mouse-over="'时间区间：0~120s'"></i>
          </el-form-item>
          <el-form-item label="发送超时" labelWidth="70px">
            <el-input-number v-model="formData.sendTimeout" :min="0" :max="120" size="mini" label="发送超时"></el-input-number><span>秒</span>
            <i class="paas-icon-question" v-pop-on-mouse-over="'时间区间：0~120s'"></i>
          </el-form-item>
          <el-form-item label="读取超时" labelWidth="70px">
            <el-input-number v-model="formData.readTimeout" :min="0" :max="120" size="mini" label="读取超时"></el-input-number><span>秒</span>
            <i class="paas-icon-question" v-pop-on-mouse-over="'时间区间：0~120s'"></i>
          </el-form-item>
        </div>
      </div>
      <div class="el-form-item el-form-item--mini retry-setting" style="margin-bottom: 0px;">
        <div class="el-form-item__label" style="width: 90px; float: left; z-index: 11">
          <span>重试设置</span>
        </div>
        <div class="el-form-item__content" style="margin-left: 90px;">
          <el-form-item label="重试次数" labelWidth="70px">
            <el-input-number v-model="formData.retryNum" :min="0" :max="10"></el-input-number><span>次</span>
            <i class="paas-icon-question" v-pop-on-mouse-over="'重试次数区间：0~10次'"></i>
          </el-form-item>
          <el-form-item label="重试超时时间" labelWidth="100px">
            <el-input-number v-model="formData.retryTimeout" :min="0" :max="120" label="重试超时时间"></el-input-number><span>秒</span>
            <i class="paas-icon-question" v-pop-on-mouse-over="'时间区间：0~120s'"></i>
          </el-form-item>
        </div>
      </div>
      <el-form-item label="缓存器设置" class="cache-setting">
        <span class="item">请求缓冲区大小：{{gatewayStatusFromNet.requestCache}}</span>
        <span class="item">客户端请求最大长度：{{gatewayStatusFromNet.requestMax}}</span>
        <span class="item">响应数据缓存区大小：{{gatewayStatusFromNet.responseCache}}</span>
      </el-form-item>
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
  #gateway_add {
    background: white;
    margin: 10px;
    padding: 10px 20px;
    max-width: 850px;
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
    > .el-form {
      .el-input-number--mini {
        width: 100px;
      }
      .paas-icon-question {
        font-size: 12px;
        color: #E6A23C;
      }
      .el-form-item {
        &.timeout-setting, &.retry-setting {
          .el-form-item {
            display: inline-block;
          }
        }
        &.cache-setting {
          .item {
            display: inline-block;
            padding: 0px 4px;
            margin-right: 6px;
            background-color: #ddd;
            line-height: 18px;
          }
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
        letter-spacing: 3px;
      }
    }
  }
</style>
<script>
  import utils from 'assets/libs/element-ui/utils';
  export default {
    components: {},
    created() {
      if (!this.$utils.hasProps(this.$route.query, 'groupId', 'appId', 'profileId')) {
        this.$message.error(`信息不完整：'groupId', 'appId', 'profileId'`);
        this.$router.push(this.$router.helper.pages['/profile/gateway'].fullPath);
        return;
      }
      this.groupId = this.$route.query['groupId'];
      this.appId = this.$route.query['appId'];
      this.profileId = this.$route.query['profileId'];
//      console.log({
//        groupId: this.groupId,
//        appId: this.appId,
//        profileId: this.profileId,
//      });
      this.requestRelatedInfoFromNet();
    },
    mounted() {
    },
    data() {
      return {
        forModify: false,
        groupId: null,
        appId: null,
        profileId: null,
        gatewayStatusFromNet: null,
        formData: {
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
        }
      }
    },
    methods: {
      async requestRelatedInfoFromNet() {
        const gatewayStatusFromNet = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_create_related, {
          query: {
            groupId: this.groupId,
            appId: this.appId,
            spaceId: this.profileId,
          }
        });
        gatewayStatusFromNet.host = (gatewayStatusFromNet.host && Array.isArray(gatewayStatusFromNet.host)) ? gatewayStatusFromNet.host : [];
        gatewayStatusFromNet.paths = (gatewayStatusFromNet.paths && Array.isArray(gatewayStatusFromNet.paths)) ? gatewayStatusFromNet.paths : [];
        this.gatewayStatusFromNet = gatewayStatusFromNet;

        const formData = {
          host: [],
          paths: [],
          connTimeout: null,    // 连接超时
          sendTimeout: null,    // 发送超时
          readTimeout: null,    // 读取超时
          retryTimeout: null,   // 重试超时时间
          retryNum: null,       // 重试次数
        };
        this.formData.host = gatewayStatusFromNet.host;
        this.formData.paths = gatewayStatusFromNet.paths;
        if (this.forModify) {
          formData.connTimeout = gatewayStatusFromNet.connTimeout;
          formData.sendTimeout = gatewayStatusFromNet.sendTimeout;
          formData.readTimeout = gatewayStatusFromNet.readTimeout;
          formData.retryTimeout = gatewayStatusFromNet.retryTimeout;
          formData.retryNum = gatewayStatusFromNet.retryNum;
        } else {
          formData.connTimeout = gatewayStatusFromNet['defConnTimeout'];
          formData.sendTimeout = gatewayStatusFromNet['defSendTimeout'];
          formData.readTimeout = gatewayStatusFromNet['defReadTimeout'];
          formData.retryTimeout = gatewayStatusFromNet['defRetryTimeout'];
          formData.retryNum = gatewayStatusFromNet['defRetryNum'];
        }
        this.formData = formData;
      },

      async handleClick(evt, action) {

      }
    }
  }
</script>