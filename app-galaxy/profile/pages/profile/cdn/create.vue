<template>
    <div>
        <!--<div class="pa-3 pt-4" style="background-color: #fff;">-->
        <!--<el-row :gutter="20">-->
        <!--<el-col :span="14">-->
        <!--<el-button type="info" icon="el-icon-back" @click="$router.go(-1)">-->
        <!--返回-->
        <!--</el-button>-->
        <!--</el-col>-->
        <!--</el-row>-->
        <!--</div>-->
        <div class="pa-3" style="background-color: #fff;">
            <el-form :model="form" ref="configDirForm" class="mt-3">
                <el-row>
                    <el-col :span="3" class="pl-3">
                        <strong>域名类型:</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-radio v-model="form.type" label="normal" border>普通域名</el-radio>
                        <el-radio v-model="form.type" label="wildcard" border :disabled="true">泛域名</el-radio>
                    </el-col>
                </el-row>
                <hr>
                <el-row>
                    <el-col :span="3" class="pl-3">
                        <strong>加速域名:</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-input v-model="domain" type="text" label="domain"></el-input>
                    </el-col>
                    <el-col :span="2" class="pt-1 pl-1">
                        必填项
                    </el-col>
                </el-row>
                <hr>
                <el-row>
                    <el-col :span="3" class="pl-3">
                        <strong>覆盖范围 :</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-radio v-model="form.geoCover" label="china" border>中国大陆</el-radio>
                        <el-radio v-model="form.geoCover" label="foreign" border :disabled="true">海外</el-radio>
                        <el-radio v-model="form.geoCover" label="global" border :disabled="true">全球</el-radio>
                    </el-col>
                </el-row>
                <hr>
                <el-row>
                    <el-col :span="3" class="pl-3">
                        <strong>通信协议 :</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-radio v-model="form.protocol" label="http" border>http</el-radio>
                        <el-radio v-model="form.protocol" label="https" border :disabled="true">https</el-radio>
                    </el-col>
                </el-row>
                <hr>
                <el-row>
                    <el-col :span="3" class="pl-3">
                        <strong>使用场景 :</strong>
                    </el-col>
                    <el-col :span="10">
                        <div class="py-2">针对资源的特性进行特定场景的线路优化，获得最优的加速效果</div>
                        <el-radio v-model="form.platform" label="web" border>图片小文件</el-radio>
                        <el-radio v-model="form.platform" label="download" border :disabled="true">下载分发</el-radio>
                        <el-radio v-model="form.platform" label="vod" border :disabled="true">视频直播</el-radio>
                    </el-col>
                </el-row>
                <hr>
                <el-row>
                    <el-col :span="3" class="pl-3">
                        <strong>源站配置 :</strong>
                    </el-col>
                    <el-col :span="11">
                        <div class="py-2">
                            <p><strong>基础设置</strong></p>
                            <!--<p>指定需要加速的资源。填写资源所在的域名或IP，也可以对保存在七牛云存储上的资源创建更多的加速功能。</p>-->
                            <div class="py-3">
                                <el-radio v-model="form.source.sourceType" label="domain">源站域名</el-radio>
                                <el-radio v-model="form.source.sourceType" label="ip">ip 地址</el-radio>
                                <el-radio v-model="form.source.sourceType" label="advanced" :disabled="true">高级</el-radio>
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
                                <el-col :span="19">
                                    <el-input v-model="form.source.testURLPath" label="">
                                        <template slot="prepend">&emsp;http(s)://{{form.source.sourceDomain}}/</template>
                                    </el-input>
                                </el-col>
                                <el-col :span="2" :offset="1">
                                    <el-button type="info" @click="testSource">测试源站</el-button>
                                </el-col>
                            </el-row>
                        </div>
                    </el-col>
                </el-row>
                <hr>
                <el-row>
                    <el-col :span="3" class="pl-3">
                        <strong>缓存配置 :</strong>
                    </el-col>
                    <el-col :span="21">
                        <div class="py-2">
                            <strong>基础配置</strong>
                            <p>定义指定资源内容的缓存过期时间规则。</p>
                            <el-radio v-model="cacheControls" label="default" border>默认</el-radio>
                            <el-radio v-model="cacheControls" label="follow" border>遵循源站</el-radio>
                            <el-radio v-model="cacheControls" label="custom" border>自定义</el-radio>
                            <p class="tip py-1" v-html="cacheTips[cacheControls]"></p>
                        </div>
                        <div class="py-2">
                            <p>忽略 URL 参数</p>

                            <el-switch v-model="form.cache.ignoreParam">
                            </el-switch>
                        </div>
                    </el-col>
                </el-row>
                <hr>
                <el-row>
                    <el-col :span="3" class="pl-3">
                        <strong>高级配置 :</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-button type="text" @click="external = !external">{{external ? '隐藏': '显示'}}</el-button>
                    </el-col>
                </el-row>
                <hr>
                <el-row class="py-4">
                    <el-col :span="10" :offset="3">
                        <el-button type="primary" @click="createDomain('configDirForm')">提交</el-button>
                        <el-button type="primary">重置</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </div>
    </div>
</template>

<script>
  export default {
    name: "cdn-create-domain",
    data() {
      return {
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
      testSource() {
        alert('测试通过')
      },
      createDomain(formName) {
        // alert('formcall');
        this.$refs[formName].validate((valid) => {
          if (!valid) return false;
          // 显示loading
          this.$store.commit('etc/SET_LOADING', true);

          this.$ajax
            .post('/api/cdn/domain/create/' + this.domain, this.form)
            .then(res => {
              if (!res.data.hasOwnProperty('code')) return this.$alert(res.data.msg);
              this.$router.push({path:'/cdn/list'})
            })
            .catch(err => alert(err.message + '\n' + '请联系管理员！'))
            .finally(() => {
              // 隐藏loading
              this.$store.commit('etc/SET_LOADING', false)
            })
        })
      },
    }
  }
</script>

<style scoped>
    .tip {
        color: #999;
        font-size: 12px;
    }
    hr {
        box-sizing: content-box;
        height: 0;
        overflow: visible;
        margin: 30px 0;
        border: none;
        border-top: 1px solid #e6e9f0;
    }
</style>