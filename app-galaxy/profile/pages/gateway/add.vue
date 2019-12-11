<template>
  <div id="gateway_add">
    <div class="section-title">
      <span>{{forDetail ? '网关详情' : (forModify ? '修改API网关' : '创建API网关')}}</span>
    </div>
    <el-form :model="formData" :rules="formRules" size="mini" v-if="gatewayStatusFromNet"
             ref="the-form" label-width="90px">
      <el-form-item label="应用名称" class="message-show">{{gatewayStatusFromNet.appName}}</el-form-item>
      <el-form-item label="运行环境" class="message-show">{{gatewayStatusFromNet.spaceName}}</el-form-item>
      <el-form-item label="请求类型" class="message-show">HTTP</el-form-item>

      <el-form-item label="网关名称" prop="gatewayName" class="gateway-name">
        <div v-if="forModify || forDetail">{{gatewayStatusFromNet.gatewayName}}</div>
        <el-input v-model="formData.gatewayName" placeholder="可以包含字母数字中划线，1-36个字符" v-else></el-input>
      </el-form-item>
      <el-form-item label="请求路径" prop="paths" class="path-list" v-if="false">
        <div v-if="forDetail">
          <div v-if="formData.paths.length > 0">
            <el-tag
                    v-for="tag in formData.paths"
                    size="small"
                    :key="tag"
                    type="success"
            >{{tag}}</el-tag>
          </div>
          <div v-else>---</div>
        </div>
        <div v-else>
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
            <el-input v-model="formData.pathToAdd" placeholder="路径以/开头"
                      @keydown.native.enter.prevent="handlePath('add', formData.pathToAdd)"></el-input>
            <el-button
                    size="small"
                    type="text"
                    class="flex primary"
                    @click="handlePath('add', formData.pathToAdd)">
              <span>添加</span>
            </el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="请求路径" prop="path" class="path">
        <div v-if="forDetail">{{formData.path}}</div>
        <el-input v-model="formData.path" placeholder="路径以/开头，且不能为根路径" class="max-width-600" v-else></el-input>
      </el-form-item>
      <el-form-item label="转发到">
        {{gatewayStatusFromNet.appName}}<span style="display: inline-block;width: 20px;text-align: center;">/</span>{{gatewayStatusFromNet.spaceName}}
      </el-form-item>
      <div class="el-form-item el-form-item--mini timeout-setting" style="margin-bottom: 0px;">
        <div class="el-form-item__label" style="width: 90px; float: left; z-index: 11">
          <span>超时设置</span>
        </div>
        <div class="el-form-item__content" style="margin-left: 90px;">
          <div v-if="forDetail" class="detail">
            <span class="item">连接超时：{{formData.connTimeout}}</span>
            <span class="item">发送超时：{{formData.sendTimeout}}</span>
            <span class="item">读取超时：{{formData.readTimeout}}</span>
          </div>
          <div v-else>
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
      </div>
      <div class="el-form-item el-form-item--mini retry-setting" style="margin-bottom: 0px;">
        <div class="el-form-item__label" style="width: 90px; float: left; z-index: 11">
          <span>重试设置</span>
        </div>
        <div class="el-form-item__content" style="margin-left: 90px;">
          <div v-if="forDetail" class="detail">
            <span class="item">重试次数：{{formData.retryNum}}</span>
            <span class="item">重试超时时间：{{formData.retryTimeout}}</span>
          </div>
          <div v-else>
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
      </div>
      <el-form-item label="缓存器设置" class="cache-setting">
        <span class="item">请求缓存区大小：{{gatewayStatusFromNet.requestCache}}</span>
        <span class="item">客户端请求最大长度：{{gatewayStatusFromNet.requestMax}}</span>
        <span class="item">响应数据缓存区大小：{{gatewayStatusFromNet.responseCache}}</span>
      </el-form-item>
      <el-form-item label="域名" v-if="forModify || forDetail">
        {{formData.host}}
      </el-form-item>
      <el-form-item label="域名" prop="host" v-else>
        <el-radio-group v-model="formData.host" size="mini" style="display: inline-block;">
          <el-radio v-for="(item, index) in gatewayStatusFromNet.domainList" :label="item" :key="index">
            {{item}}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="section-footer">
      <div class="item">
        <el-button type="primary" size="mini" @click="handleClick($event, forModify ? 'modify' : 'create')">完成</el-button>
      </div>
      <div class="item">
        <el-button type="primary" size="mini" @click="goBack">返回</el-button>
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
          .detail {
            margin-bottom: 14px;
            .item {
              display: inline-block;
              padding: 0px 4px;
              margin-right: 6px;
              background-color: #ddd;
              line-height: 18px;
            }
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
    created() {
      this.forDetail = this.$route.name === 'gateway_detail';
      this.forModify = this.$route.name === 'gateway_update';

      var goBack = false;
      if (!this.$utils.hasProps(this.$route.query, 'groupId', 'appId', 'profileId')) {
        goBack = true;
      }
      if (goBack) {
        this.$message.message(`信息不完整：'groupId', 'appId', 'profileId'`);
        this.$router.push(this.$router.helper.pages['/profile/gateway'].fullPath);
        return;
      }
      this.groupId = this.$route.query['groupId'];
      this.appId = this.$route.query['appId'];
      this.profileId = this.$route.query['profileId'];

      if (this.forModify) {
      }
      this.requestRelatedInfoFromNet();
    },
    mounted() {
    },
    data() {
      return {
        forModify: false,
        forDetail: false,
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
              const reg = /^[0-9a-zA-Z-]{1,36}$/;
              let passed = true;
              if (!reg.test(values)) {
                passed = false;
                callback('可以包含字母数字中划线，1-36个字符');
              }
              if (passed) {
                callback();
              }
            }
          }],
          host: [{
            type: 'string',
            required: true,
            message: '至少选择一个域名',
            trigger: ['blur', 'change']
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
          path: [{
            type: 'string',
            required: true,
            message: '请填写路径',
            trigger: ['blur', 'change']
          }, {
            validator(rule, values, callback) {
              if (!values) {
                callback('请填写路径');
                return;
              }
              if (!values.startsWith('/')) {
                callback('路径以/开头');
                return;
              }
//              if (values.length == 1) {
//                callback('请求路径不能为根路径');
//                return;
//              }
              callback();
            }
          }],
          paths: [{
            type: 'array',
            required: true,
            message: '请至少填写一个路径',
            trigger: ['blur', 'change']
          }, {
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
          }]
        }
      }
    },
    methods: {
      async requestRelatedInfoFromNet() {
        const query = {
          groupId: this.groupId,
          appId: this.appId,
          spaceId: this.profileId,
        };
        if (this.forModify || this.forDetail) {
          query.gatewayName = decodeURIComponent(this.$route.params['name']);
        }
        // 获取服务端API配置信息
        const gatewayStatusFromNet = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_create_related, {
          query
        });
        gatewayStatusFromNet.paths = (gatewayStatusFromNet.paths && Array.isArray(gatewayStatusFromNet.paths)) ? gatewayStatusFromNet.paths : [];
        this.gatewayStatusFromNet = gatewayStatusFromNet;

        const formData = {
          gatewayName: '',
          host: '',             // host为hostList（已不支持选择多个域名）中的一个元素
          hostList: [],         // 已选域名列表（domainList为完整的域名列表），TODO: not used
          path: '',             // path为paths（已不支持填写多个路径）中的一个元素
          paths: [],            // 路径列表，TODO: not used
          pathToAdd: '',
          connTimeout: null,    // 连接超时
          sendTimeout: null,    // 发送超时
          readTimeout: null,    // 读取超时
          retryTimeout: null,   // 重试超时时间
          retryNum: null,       // 重试次数
        };
        formData.paths = gatewayStatusFromNet.paths;
        formData.path = gatewayStatusFromNet.paths.length > 0 ? gatewayStatusFromNet.paths[0] : '';
        // NOTICE: 创建时，domainList为完整的域名列表。在修改时，为用户所选择的域名列表
        if (this.forModify || this.forDetail) {
          formData.gatewayName = gatewayStatusFromNet.gatewayName;
          formData.host = gatewayStatusFromNet.domainList[0] ? gatewayStatusFromNet.domainList[0] : '---';
          formData.connTimeout = gatewayStatusFromNet.connTimeout;
          formData.sendTimeout = gatewayStatusFromNet.sendTimeout;
          formData.readTimeout = gatewayStatusFromNet.readTimeout;
          formData.retryTimeout = gatewayStatusFromNet.retryTimeout;
          formData.retryNum = gatewayStatusFromNet.retryNum;
        } else {
          // formData.hostList = [];
          // set the first one as default
          if (Array.isArray(gatewayStatusFromNet.domainList) && gatewayStatusFromNet.domainList.length > 0) {
            formData.host = gatewayStatusFromNet.domainList[0];
          }
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
            if (!data.startsWith('/')) {
              this.$message.error('路径以/开头');
              return;
            }
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
          case 'modify':
            var status = {
              urlObj: this.$net.URL_LIST.gateway_create,
              desc: '添加'
            };
            if ('modify' == action) {
              status = {
                urlObj: this.$net.URL_LIST.gateway_update,
                desc: '修改'
              }
            }
            try {
              await this.$refs['the-form'].validate();
              // console.log(this.formData);
              const formData = this.formData;
              const payload = {
                groupId: this.groupId,
                appId: this.appId,
                spaceId: this.profileId,
                domainList: [formData.host],
                paths: [formData.path],
                gatewayName: formData.gatewayName
              };
              // 连接超时
              (this.gatewayStatusFromNet.defConnTimeout != formData.connTimeout) && (payload.connTimeout = formData.connTimeout);
              // 发送超时
              (this.gatewayStatusFromNet.defSendTimeout != formData.sendTimeout) && (payload.sendTimeout = formData.sendTimeout);
              // 读取超时
              (this.gatewayStatusFromNet.defReadTimeout != formData.readTimeout) && (payload.readTimeout = formData.readTimeout);
              // 重试次数
              (this.gatewayStatusFromNet.defRetryTimeout != formData.retryTimeout) && (payload.retryTimeout = formData.retryTimeout);
              // 重试超时请求时间
              (this.gatewayStatusFromNet.defRetryNum != formData.retryNum) && (payload.retryNum = formData.retryNum);
              await this.$net.requestPaasServer(status.urlObj, {
                payload
              });
              this.$message.success(`网关"${formData.gatewayName}"${status.desc}成功！`);
              this.$router.push({
                path: this.$router.helper.pages['/profile/gateway'].fullPath,
              })
            } catch (err) {
              console.log(err);
            }
            break;
        }
      },

      goBack() {
        if (!this.$router.helper.preRouter || this.$router.helper.preRouter.name !== 'gateway_list') {
          this.$router.push({
            name: 'gateway_list'
          });
        } else {
          this.$router.go(-1);
        }
      }
    }
  }
</script>