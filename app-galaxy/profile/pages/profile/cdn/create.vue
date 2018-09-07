<template>
    <div id="cdn-create" class="pa-3" style="background-color: #fff;">
        <el-form :model="form" ref="createForm" class="mt-3" label-width="120px" size="medium" :rules="rules">
            <el-form-item label="域名类型:">
                <el-row>
                    <el-col :span="10">
                        <el-radio v-model="form.type" label="normal" border>普通域名</el-radio>
                        <el-radio v-model="form.type" label="wildcard" border :disabled="true">泛域名</el-radio>
                    </el-col>
                </el-row>
            </el-form-item>
            <hr>
            <el-form-item label="加速域名:" :required="true" :error="errMsgForDomainName">
                <el-row style="max-width: 600px;">
                    <el-col :span="16">
                        <el-input v-model="domain" type="text" label="domain" placeholder="域名格式: *.cdn.finupcloud.com"></el-input>
                    </el-col>
                    <el-col :span="4" style="padding: 0px 3px;">
                        <el-tooltip class="item" effect="dark" content="检测域名是否被占用" placement="bottom">
                            <el-button type="info" @click="handleClick('check-domain')">域名检测</el-button>
                        </el-tooltip>
                    </el-col>
                    <el-col :span="4" style="padding-left: 5px; text-align: left; font-size: 14px; line-height: 100%">
                        <span v-if="!statusOfDomainCheck.hasCheck" style="color: #F56C6C">未检测</span>
                        <span v-if="statusOfDomainCheck.hasCheck && statusOfDomainCheck.hasExist"
                              style="color: #F56C6C;">域名已被占用，请尝试其它域名</span>
                        <span v-if="statusOfDomainCheck.hasCheck && !statusOfDomainCheck.hasExist"
                              style="color: #67C23A;">可以使用该域名</span>
                    </el-col>
                </el-row>
            </el-form-item>
            <hr>
            <el-form-item label="覆盖范围:">
                <el-row>
                    <el-col :span="18">
                        <el-radio v-model="form.geoCover" label="china" border>中国大陆</el-radio>
                        <el-radio v-model="form.geoCover" label="foreign" border :disabled="true">海外</el-radio>
                        <el-radio v-model="form.geoCover" label="global" border :disabled="true">全球</el-radio>
                    </el-col>
                </el-row>
            </el-form-item>
            <hr>
            <el-form-item label="通信协议:">
                <el-row>
                    <el-col :span="10">
                        <el-radio v-model="form.protocol" label="http" border>http</el-radio>
                        <el-radio v-model="form.protocol" label="https" border :disabled="true">https</el-radio>
                    </el-col>
                </el-row>
            </el-form-item>
            <hr>
            <el-form-item label="使用场景:">
                <el-row>
                    <el-col :span="18">
                        <div class="py-2">针对资源的特性进行特定场景的线路优化，获得最优的加速效果</div>
                        <el-radio v-model="form.platform" label="web" border>图片小文件</el-radio>
                        <el-radio v-model="form.platform" label="download" border :disabled="true">下载分发</el-radio>
                        <el-radio v-model="form.platform" label="vod" border :disabled="true">视频直播</el-radio>
                    </el-col>
                </el-row>
            </el-form-item>
            <hr>
            <el-form-item label="源站配置:" class="source-config" :required="true" :error="errMsgForSourceConfig">
                <div style="max-width: 600px;">
                    <div class="py-2">
                        <p><strong>基础设置</strong></p>
                        <!--<p>指定需要加速的资源。填写资源所在的域名或IP，也可以对保存在七牛云存储上的资源创建更多的加速功能。</p>-->
                        <div class="py-3">
                            <el-radio v-model="form.source.sourceType" label="domain">源站域名</el-radio>
                            <el-radio v-model="form.source.sourceType" label="ip" v-if="false">ip 地址</el-radio>
                            <el-radio v-model="form.source.sourceType" label="advanced" v-if="false">高级</el-radio>
                        </div>
                        <el-input
                                v-if="form.source.sourceType !== 'ip'"
                                v-model="form.source.sourceDomain" label=""></el-input>
                        <el-input v-if="form.source.sourceType === 'ip'"
                                  type="textarea"
                                  :autosize="{ minRows: 2, maxRows: 4}"
                                  v-model="sourceIps"></el-input
                        >
                    </div>
                    <div class="py-2">
                        <strong>回源host</strong>
                        <p>可选项，默认为加速域名</p>
                        <el-input v-model="form.source.sourceHost" label=""></el-input>
                    </div>
                    <div class="py-2">
                        <strong>测试网址</strong>
                        <el-row>
                            <el-col :span="16">
                                <el-input v-model="form.source.testURLPath" label="" placeholder="测试资源名">
                                    <template slot="prepend">&emsp;http(s)://{{form.source.sourceDomain}}/</template>
                                </el-input>
                            </el-col>
                            <el-col :span="4" style="padding: 0px 3px;">
                                <el-button type="info" @click="testSource">测试源站</el-button>
                            </el-col>
                            <el-col :span="4" style="padding-left: 5px; text-align: left; font-size: 14px; line-height: 100%">
                                <span v-if="!statusOfSourceConfig.hasCheck" style="color: #F56C6C">未测试</span>
                                <span v-if="statusOfSourceConfig.hasCheck && statusOfSourceConfig.isOk" style="color: #67C23A">测试成功</span>
                                <span v-if="statusOfSourceConfig.hasCheck && !statusOfSourceConfig.isOk" style="color: #F56C6C">测试失败</span>
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </el-form-item>
            <hr>
            <el-form-item label="缓存配置:" class="cache-config">
                <el-row>
                    <el-col :span="21">
                        <div class="py-2">
                            <strong>基础配置</strong>
                            <p>定义指定资源内容的缓存过期时间规则。</p>
                            <el-radio v-model="cacheControls" label="default" border>默认</el-radio>
                            <el-radio v-model="cacheControls" label="follow" border>遵循源站</el-radio>
                            <el-radio v-model="cacheControls" label="custom" border :disabled="true">自定义</el-radio>
                            <p class="tip py-1" v-html="cacheTips[cacheControls]"></p>
                        </div>
                        <div class="py-2">
                            <p>忽略 URL 参数</p>
                            <el-switch v-model="form.cache.ignoreParam">
                            </el-switch>
                        </div>
                    </el-col>
                </el-row>
            </el-form-item>
            <hr>
            <el-row v-if="false">
                <el-col :span="3" class="pl-3">
                    <strong>高级配置 :</strong>
                </el-col>
                <el-col :span="10">
                    <el-button type="text" @click="external = !external">{{external ? '隐藏': '显示'}}</el-button>
                </el-col>
            </el-row>
            <hr v-if="false">
            <el-row class="py-4">
                <el-col :span="10" :offset="3">
                    <el-button type="primary" @click="handleClick('submit')">提交</el-button>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script>
  export default {
    name: "cdn-create-domain",
    mounted() {
//      this.domain = 'a.cdn.finupcloud.com';
//      this.form.source.sourceDomain = 'www.elif.site';
//      this.form.source.sourceHost = 'www.elif.site';
//      this.form.source.testURLPath = 'index.js';
    },
    data() {
      return {
        rules: {
          domain: [{
            required: true,
            message: '请输入域名',
            trigger: 'blur'
          }, {
            validator(rule, values, callback){
              let passed = true;
              let reg = /^([A-Za-z0-9][A-Za-z0-9\-_]*).cdn.finupcloud.com$/;
              if (!values) {
                passed = false;
                callback('内容不能为空');
              } else if (values.length > 0) {
                values = values.trim();
                if (!reg.exec(values)) {
                  passed = false;
                  callback('域名格式: *.cdn.finupcloud.com，星号部分职能包括字母数字下划线');
                }
              }
              if (passed) {
                callback();
              }
            }
          }],
        },
        errMsgForDomainName: '',
        errMsgForSourceConfig: '',
        statusOfSourceConfig: {
          hasCheck: false,
          isOk: false
        },
        statusOfDomainCheck: {
          hasCheck: false,
          hasExist: false,
          recordInfo: ''
        },

        cacheTips: {
          default: '默认缓存30天',
          follow: '缓存时间将跟源站同步',
          custom: `
<li>后缀，必须以「.」(英文点)开始，多个后缀请用「;」(英文分号)隔开，例如(.png;.jpg;.gif)；</li>
<li> 路径，必须以「/」(英文斜杠)开始，多个路径请用「;」(英文分号)隔开，例如: (/a/b/c;/d/e/f;/h/i/j) ，路径中不能包含「.」，也不能以「/」结尾；</li>
<li>缓存规则最多15条；</li>
<li>1条缓存规则中，最多10个后缀/路径，「;」(英文分号)隔开；</li>
<li>时间单位：分/小时/天，只能输入整数，最大值为 365 天；</li>
<li>0 代表不缓存；</li>
<li>按从上至下顺序，采取优先匹配原则。</li>
          `
        },
        external: false,
        domain: '',
        form: {
          type: "normal",
          platform: "web",
          geoCover: "china",
          qiniuPrivate: false,
          protocol: "http",
          source: {
            sourceType: "domain",
            sourceHost: "",
            sourceURLScheme: "",
            sourceQiniuBucket: null,
            sourceDomain: null,
            sourceIPs: [],
            advancedSources: [],
            testURLPath: "",
            sourceIgnoreAllParams: false,
            sourceIgnoreParams: []
          },
          cache: {
            cacheControls: [
              {
                time: 30,
                timeunit: 3,
                type: "all",
                rule: ""
              }
            ],
            ignoreParam: false,
            ignoreParams: []
          },
        }
      }
    },
    watch: {
      domain: 'getErrMsgForDomainName'
    },
    computed: {
      sourceIps: {
        get() {
          return this.form.source.sourceIPs.join('\n')
        },
        set(val) {
          this.form.source.sourceIPs = val.split('\n').map(ip => ip.trim()).filter(ip => ip.length > 6)
        }
      },
      cacheControls: {
        get() {
          let type = this.form.cache.cacheControls[0].type;
          if (type === 'all') {
            return 'default'
          } else if (type === 'follow') {
            return 'follow'
          } else {
            return 'custom'
          }
        },
        set(val) {
          const _cacheControls = {
            default: [{"time": 30, "timeunit": 3, "type": "all", "rule": ""}],
            follow: [{"type": "follow"}],
            custom: [{"time": 30, "timeunit": 3, "type": "path", "rule": ""}],
          };
          this.form.cache.cacheControls = _cacheControls[val];
        }
      }
    },
    methods: {
      checkDomain() {
        let domain = 'finupcloud.com';
        let sub_domain = this.domain.trim().replace(/\.finupcloud\.com$/, '');
        return new Promise((resolve, reject) => {
          this.$net.getResponse(this.$net.URL_LIST.dns_record_info, {
            payload: {domain, sub_domain}
          }).then(res => {
            /**
             {
               domain: {id: "67076424", domain: "finupcloud.com", domain_grade: "DP_Free"},
               record: {id: "373872980", sub_domain: "a.cdn", record_type: "CNAME"}
               status: {code: '1', message: ''}
             }
             */
            let resData = res.data;
            if (resData.hasOwnProperty('status')) {
              this.statusOfDomainCheck.hasCheck = true;
              let status = resData.status;
              if (resData.hasOwnProperty('record') && status.code == 1) {
                this.statusOfDomainCheck.hasExist = true;
                this.statusOfDomainCheck.recordInfo = resData.record;
              } else {
                this.statusOfDomainCheck.hasExist = false;
              }
            } else {
              this.statusOfDomainCheck.hasExist = false;
            }
            resolve();
          }).catch(err => {
            this.$notify.error({
              title: '请求错误',
              message: err.toString()
            });
            resolve();
          })
        });
      },
      handleClick(action) {
        switch (action) {
          case 'check-domain':
            if (this.getErrMsgForDomainName()) {
              return;
            }
            this.checkDomain();
            break;
          case 'submit':
            this.$refs['createForm'].validate(async (valid) => {
              if (this.getErrMsgForDomainName()) {
                return;
              }
              if (this.getErrMegForSourceConfig()) {
                return;
              }
              await this.checkDomain();
              if (this.statusOfDomainCheck.hasExist) {
                this.$message.error(`域名${this.domain}已被占用`);
                return;
              }

              if (!this.statusOfSourceConfig.isOk) {
                this.$message.warning('请先测试源站');
                return;
              }
              if (!valid) return false;
              // 显示loading
              this.$store.commit('etc/SET_LOADING', true);

              this.$net.getResponse(this.$net.URL_LIST.cdn_domain_create, {
                params: {domain: this.domain}, payload: this.form
              }).then(res => {
                let resData = res.data;
                if (resData.hasOwnProperty('code') && resData.hasOwnProperty('error')) {
                  this.$message.error(`${resData.code}: ${resData.error}`);
                  this.$router.push({path: '/cdn/list'})
                }
              }).catch(err => {
                this.$net.showError({
                  title: '请求错误',
                  message: err.toString()
                })
              }).finally(() => {
                this.$store.commit('etc/SET_LOADING', false)
              });
            });
            break;
        }
      },
      testSource() {
        if (this.getErrMegForSourceConfig()) {
          return;
        }
        let source = this.form.source;

        this.$net.getResponse(this.$net.URL_LIST.cdn_fusion_source_check, {
          params: {domain: 'common'}, payload: {
            advancedSources: source.advancedSources,
            protocol: this.form.protocol,
            sourceDomain: source.sourceDomain,
            sourceHost: source.sourceHost,
            sourceIPs: source.sourceIPs,
            sourceType: source.sourceType,
            sourceURLScheme: source.sourceURLScheme,
            testURLPath: source.testURLPath,
          }
        }).then(res => {
          this.statusOfSourceConfig.hasCheck = true;
          this.statusOfSourceConfig.isOk = true;
//          alert('测试通过')
        }).catch(err => {
          this.statusOfSourceConfig.hasCheck = true;
          this.statusOfSourceConfig.isOk = false;
        });
      },
      getErrMsgForDomainName() {
        let domain = this.domain;
        let errMsg = '';
        let domainReg = /^([A-Za-z0-9][A-Za-z0-9\-_]*).cdn.finupcloud.com$/;
        if (!domain) {
          errMsg = '内容不能为空';
        } else if (domain.length > 0) {
          domain = domain.trim();
          if (!domainReg.exec(domain)) {
            errMsg = '域名格式: *.cdn.finupcloud.com，星号部分职能包括字母数字下划线';
          }
        }
        this.errMsgForDomainName = errMsg;
        return errMsg;
      },
      getErrMegForSourceConfig() {
        let source = this.form.source;
        let errMsg = '';
        if (!source.sourceDomain) {
          errMsg = '源站域名不能为空';
        }
        if (!errMsg && !source.sourceDomain) {
          errMsg = '回源Host不能为空';
        }
        if (!errMsg && !source.testURLPath) {
          errMsg = '测试资源名不能为空';
        }
        this.errMsgForSourceConfig = errMsg;
        return errMsg;
      },
    }
  }
</script>

<style lang="scss">
    #cdn-create {
        .el-form {
            .el-form-item {
                &.source-config, &.cache-config {
                    .el-form-item__content {
                        line-height: 120%;
                    }
                }
            }
            .el-form-item__label {
                font-size: 16px;
                font-weight: bold;
            }
        }
    }
</style>
<style lang="scss" scoped>
    .tip {
        color: #999;
        font-size: 12px;
    }

    hr {
        box-sizing: content-box;
        height: 0;
        overflow: visible;
        margin: 10px 0;
        border: none;
        border-top: 1px solid #e6e9f0;
    }
</style>