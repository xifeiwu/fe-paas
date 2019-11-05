<template>
  <div id="gateway_add">
    <div class="section-title">
      <span>{{forModify ? '修改API网关' : '创建API网关'}}</span>
    </div>
    <el-form :model="formData" :rules="formRules" size="mini" v-if="gatewayStatusFromNet"
             ref="the-form" label-width="90px">
      <el-form-item label="应用名称" class="message-show">{{gatewayStatusFromNet.appName}}</el-form-item>
      <el-form-item label="运行环境" class="message-show">{{gatewayStatusFromNet.spaceName}}</el-form-item>
      <el-form-item label="请求类型" class="message-show">HTTP</el-form-item>

      <el-form-item label="网关名称" prop="gatewayName" class="gateway-name">
        <div v-if="forModify">{{gatewayStatusFromNet.gatewayName}}</div>
        <el-input v-model="formData.gatewayName" placeholder="小写字符，数字，中划线，不能以中划线开始或结尾。不能超过63个字符" :maxlength=63 v-else></el-input>
      </el-form-item>
      <el-form-item label="请求路径" prop="paths" class="path-list">
        <div v-if="formData.paths.length > 0">
          <el-tag
                  v-for="tag in formData.paths"
                  size="small"
                  :key="tag"
                  closable
                  type="success"
                  @close="handlePath('remove', tag)"
          >{{tag}}</el-tag>
        </div>
        <div v-else style="height: 27px">空</div>
        <div class="content">
          <el-input v-model="formData.pathToAdd" placeholder=""
                    @keydown.native.enter.prevent="handlePath('add', formData.pathToAdd)"></el-input>
          <el-button
                  size="small"
                  type="text"
                  class="flex primary"
                  @click="handlePath('add', formData.pathToAdd)">
            <span>添加</span>
          </el-button>
        </div>
      </el-form-item>

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
      <el-form-item label="域名" prop="hostList">
        <el-checkbox-group v-model="formData.hostList" style="display: inline-block;">
          <el-checkbox v-for="(item, index) in gatewayStatusFromNet.domainList" :label="item" :key="index">
            {{item}}
          </el-checkbox>
        </el-checkbox-group>
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
        &.gateway-name {
          .el-input {
            max-width: 500px;
          }
        }
        &.path-list {
          .el-tag {
            margin-right: 3px;
            margin-bottom: 2px;
          }
          .content {
            .el-input {
              display: inline-block;
              max-width: 500px;
            }
          }
        }
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
          gatewayName: [{
            required: true,
            message: '请输入网关名称',
            trigger: ['blur', 'change']
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
          hostList: [{
            type: 'array',
            required: true,
            message: '至少选择一个域名',
            trigger: ['blur', 'change']
          }, {
            validator(rule, values, callback) {
              if (values.length == 0) {
                callback('请至少选择一个域名');
                return;
              }
              callback();
            }
          }],
          paths: [{
            type: 'array',
            required: true,
            message: '请至少填写一个路径',
            trigger: ['blur', 'change']
          },
            {
              validator(rule, values, callback) {
                let passed = true;
//                let mailReg = /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/;
//                if (Array.isArray(values)) {
//                  values.every(it => {
//                    passed = mailReg.exec(it);
//                    if (!passed) {
//                      callback(`${it}格式不正确`);
//                    }
//                    return passed;
//                  })
//                } else {
//                  callback('不是数组');
//                }
                if (passed) {
                  callback();
                }
              }
            }
          ],
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
          hostList: [],
          paths: [],
          pathToAdd: '',
          connTimeout: null,    // 连接超时
          sendTimeout: null,    // 发送超时
          readTimeout: null,    // 读取超时
          retryTimeout: null,   // 重试超时时间
          retryNum: null,       // 重试次数
        };
        this.formData.hostList = gatewayStatusFromNet.host;
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
      // add or remove path
      handlePath(action, data) {
        switch (action) {
          case 'add':
            if (this.formData.paths.includes(data)) {
              this.$message.error(`路径"${data}"已经存在！`);
              return;
            }
            this.formData.paths.push(data);
            this.formData.pathToAdd = '';
            break;
          case 'remove':
            const index = this.formData.paths.indexOf(data);
            if (index > -1) {
              this.formData.paths.splice(index, 1);
            } else {
              console.log(`${data} not found!`);
            }
            break;
        }
      },
      async handleClick(evt, action) {
        switch (action) {
          case 'create':
            try {
              await this.$refs['the-form'].validate();
              console.log(this.formData);
              const formData = this.formData;
              await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_create, {
                payload: {
                  groupId: this.groupId,
                  appId: this.appId,
                  spaceId: this.profileId,
                  domainList: formData.hostList,
                  paths: formData.paths,
                  connTimeout: formData.connTimeout,
                  sendTimeout: formData.sendTimeout,
                  readTimeout: formData.readTimeout,
                  retryTimeout: formData.retryTimeout,
                  retryNum: formData.retryNum,
                  gatewayName: formData.gatewayName
                }
              });
              this.$message.success(`网关"${formData.gatewayName}"创建成功！`);
              this.$router.push({
                path: this.$router.helper.pages['/profile/gateway'].fullPath,
              })
            } catch (err) {
              console.log(err);
            }
            break;
          case 'update':
            break;
        }

      }
    }
  }
</script>