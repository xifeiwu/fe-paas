<template>
    <div id="cdn-edit" class="pa-3" style="background-color: #fff;"
         v-loading="loading"
         element-loading-text="操作进行中"
         element-loading-spinner="el-icon-loading"
         v-if="domain.source"
    >
        <el-form labelWidth="100px" size="medium">
            <el-form-item label="基本信息">
                <div>
                    <div>
                        <strong style="color: green;">加速域名:&emsp; {{domain.name}}</strong>
                    </div>
                    <div class="pt-2">
                        <strong style="color: green;">CNAME :&emsp; {{domain.cname}}</strong>
                    </div>
                    <div class="pt-2">
                        <strong style="color: green;">当前状态:&emsp; {{domain.operationType}}
                        {{domain.operatingState}}</strong>
                    </div>
                </div>
                <div class="pt-3">
                    <el-tooltip class="item" effect="dark" content="通过DIG命令测试域名状态" placement="top-start">
                        <el-button type="primary" @click="checkDomain" size="small">域名测试</el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="点击后会添加CNAME" placement="top-start">
                        <el-button type="primary" @click="addCname" size="small">添加CNAME记录</el-button>
                    </el-tooltip>
                    <el-button type="danger" @click="updateSource"
                               :disabled="editable"
                               v-if="false"
                    >停用</el-button>
                    <el-button type="success" @click="getDomain" size="small">刷新</el-button>
                </div>
            </el-form-item>
            <hr>
            <el-form-item label="回源配置" class="source-config" :required="true" :error="errMsgForSourceConfig">
                <div style="max-width: 600px;">
                    <div>
                        <!--<p>指定需要加速的资源。填写资源所在的域名或IP，也可以对保存在七牛云存储上的资源创建更多的加速功能。</p>-->
                        <div>
                            <el-radio v-model="domain.source.sourceType" label="domain">源站域名</el-radio>
                            <el-radio v-model="domain.source.sourceType" label="ip">ip 地址</el-radio>
                            <el-radio v-model="domain.source.sourceType" label="advanced" v-if="false">高级</el-radio>
                        </div>
                        <el-input
                                v-if="domain.source.sourceType !== 'ip'"
                                v-model="domain.source.sourceDomain" label=""></el-input>
                        <el-input v-if="domain.source.sourceType === 'ip'"
                                  type="textarea"
                                  :autosize="{ minRows: 2, maxRows: 4}"
                                  v-model="sourceIps"></el-input
                        >
                    </div>
                    <div class="py-2">
                        <strong>回源host</strong>
                        <p>可选项，默认为加速域名</p>
                        <el-input v-model="domain.source.sourceHost" label=""></el-input>
                    </div>
                    <div class="py-2">
                        <strong>源站测试</strong>
                        <el-row>
                            <el-col :span="20">
                                <el-input v-model="domain.source.testURLPath" label="">
                                    <template slot="prepend">&emsp;http(s)://{{domain.source.sourceDomain}}/</template>
                                    <template slot="append">
                                        <el-button type="info" @click="testSource()">测试源站</el-button>&emsp;
                                    </template>
                                </el-input>
                            </el-col>
                            <el-col :span="4">
                                <span v-if="!statusOfSourceConfig.hasCheck" style="color: #F56C6C"></span>
                                <span v-if="statusOfSourceConfig.hasCheck && statusOfSourceConfig.isOk" style="color: #67C23A">测试成功</span>
                                <span v-if="statusOfSourceConfig.hasCheck && !statusOfSourceConfig.isOk" style="color: #F56C6C">测试失败</span>
                            </el-col>
                        </el-row>
                    </div>
                    <div>
                        <el-button type="primary" @click="updateSource" size="small"
                                   :disabled="editable"
                        >修改配置</el-button>
                    </div>
                </div>
            </el-form-item>
            <hr>
            <el-form-item label="缓存配置">
                <div>
                    <strong>基础配置</strong>
                    <p>定义指定资源内容的缓存过期时间规则。</p>
                    <el-radio v-model="cacheControls" label="default" border>默认</el-radio>
                    <el-radio v-model="cacheControls" label="follow" border>遵循源站</el-radio>
                    <el-radio v-model="cacheControls" label="custom" border :disabled="true">自定义</el-radio>
                    <p class="tip py-1" v-html="cacheTips[cacheControls]"></p>
                </div>
                <div class="py-3">
                    <p>忽略 URL 参数</p>
                    <el-switch v-model="domain.cache.ignoreParam">
                    </el-switch>
                </div>
                <div>
                    <el-button type="primary" @click="updateCache" size="small"
                               :disabled="editable"
                    >修改配置</el-button>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
  import {mapState} from "vuex";

  export default {
    name: "cdn-edit",
    mounted() {
      this.getDomain()
    },
    data() {
      return {
        errMsgForSourceConfig: '',
        statusOfSourceConfig: {
          hasCheck: false,
          isOk: false
        },
        domain: {},
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
      }
    },
    computed: {
      ...mapState("cdn", ["domainList", "loading"]),
      editable() {
        return this.domain.operatingState === 'processing';
      },
      sourceIps: {
        get() {
          return this.domain.source.sourceIPs.join('\n')
        },
        set(val) {
          this.domain.source.sourceIPs = val.split('\n').map(ip => ip.trim()).filter(ip => ip.length > 6)
        }
      },
      cacheControls: {
        get() {
          let type = this.domain.cache.cacheControls[0].type;
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
          this.domain.cache.cacheControls = _cacheControls[val];
        }
      },
    },
    methods: {
      getDomain() {
        // 显示loading
        this.$store.commit('cdn/SET_LOADING', true);
        this.$ajax('/n-api/cdn/domain/' + this.$route.query.domain)
          .then(res => {
            this.domain = res.data;
//            console.log(res.data);
          })
          .catch(err => alert(err.message + '\n' + '请联系管理员！'))
          .finally(() => {
            // 隐藏loading
            this.$store.commit('cdn/SET_LOADING', false)
          })
      },
      getErrMegForSourceConfig() {
        let source = this.domain.source;
        if (!source) {
          return;
        }
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
      updateSource() {
        this.$store.commit('cdn/SET_LOADING', true)
        this.$ajax
          .post('/n-api/cdn/domain/' + this.$route.query.domain + '/source', this.domain.source)
          .then(res => {
            if (!res.data.hasOwnProperty('code') || res.data.code !== 200) {
              return this.$toast(res.data.code + '\n' + res.data.error, 'error');
            }
            this.getDomain();
            this.$toast('回源配置操作成功！！');
          })
          .catch(err => alert(err.message + '\n' + '请联系管理员！'))
          .finally(() => {
            // 隐藏loading
            this.$store.commit('cdn/SET_LOADING', false)
          })
      },
      testSource() {
        if (this.getErrMegForSourceConfig()) {
          return;
        }
        let source = this.domain.source;
        this.$net.getResponse(this.$net.URL_LIST.cdn_fusion_source_check, {
          params: {domain: 'common'}, payload: {
            advancedSources: source.advancedSources,
            protocol: this.domain.protocol,
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
      updateCache() {
        this.$store.commit('cdn/SET_LOADING', true)
        this.$ajax
          .post('/n-api/cdn/domain/' + this.$route.query.domain + '/cache', this.domain.cache)
          .then(res => {
            if (!res.data.hasOwnProperty('code') || res.data.code !== 200) {
              return this.$toast(res.data.code + '\n' + res.data.error, 'error');
            }
            this.getDomain();
            this.$toast('缓存规则修改成功！！');
          })
          .catch(err => alert(err.message + '\n' + '请联系管理员！'))
          .finally(() => {
            // 隐藏loading
            this.$store.commit('cdn/SET_LOADING', false)
          })
      },
      // 检查域名是否正常
      checkDomain() {
        let {host, protocol} = window.location;
        let checkurl = `${protocol}//${host}/n-api/dns/dig/` + this.domain.name
        window.open(checkurl);
      },
      addCname() {
        console.log('%s CNAME TO %s', this.domain.name, this.domain.cname);
        this.$store.commit('cdn/SET_LOADING', true)
        this.$ajax
          .post('/n-api/dns/record/create', {
            domain: this.domain.name,
            value: this.domain.cname,
            type: 'CNAME'
          })
          .then(res => {
            if (!res.data.hasOwnProperty('status') || res.data.status.code !== '1') {
              let errMsg = res.data.status.code + '\n' + res.data.status.message;
              if (res.data.status.code === '500026') {
                errMsg = res.data.status.code + '\n' + 'cname记录已经存在！'
              }
              return this.$toast(errMsg, 'error');
            }
            this.$toast('cname添加成功！！');
          })
          .catch(err => alert(err.message + '\n' + '请联系管理员！'))
          .finally(() => {
            // 隐藏loading
            this.$store.commit('cdn/SET_LOADING', false)
          })
      }
    }
  }
</script>


<style scoped>
</style>
<style lang="scss">
    #cdn-edit {
        hr {
            box-sizing: content-box;
            height: 0;
            overflow: visible;
            margin: 30px 0;
            border: none;
            border-top: 1px solid #e6e9f0;
        }
        .el-form {
            .el-form-item {
                &.source-config, &.cache-config {
                    .el-form-item__content {
                        line-height: 120%;
                    }
                }
            }
            .el-form-item__label {
                color: black;
                font-size: 16px;
                font-weight: bold;
                line-height: 120%;
            }
            .el-form-item__content {
                line-height: 120%;
            }
        }
    }
</style>