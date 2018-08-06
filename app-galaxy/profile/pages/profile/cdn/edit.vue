<template>
    <div class="pa-3" style="background-color: #fff;"
         v-loading="loading"
         element-loading-text="操作进行中"
         element-loading-spinner="el-icon-loading"
         v-if="domain.source"
    >
        <div class="pt-3">
            <el-row>
                <el-col :span="3" class="pl-3">
                    <strong>基本信息</strong>
                </el-col>
                <el-col :span="20">
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
                </el-col>
                <el-col :span="10" :offset="3" class="pt-3">
                    <el-tooltip class="item" effect="dark" content="通过DIG命令测试域名状态" placement="top-start">
                        <el-button type="primary" @click="checkDomain">域名测试</el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="点击后会添加CNAME" placement="top-start">
                        <el-button type="primary" @click="addCname">添加CNAME记录</el-button>
                    </el-tooltip>
                    <el-button type="danger" @click="updateSource"
                               :disabled="editable"
                    >停用
                    </el-button>
                    <el-button type="success" @click="getDomain">刷新</el-button>
                </el-col>
            </el-row>
        </div>
        <hr>
        <div>
            <el-row>
                <el-col :span="3" class="pl-3">
                    <strong>回源配置</strong>
                </el-col>
                <el-col :span="10" class="pa-0">
                    <div>
                        <!--<p>指定需要加速的资源。填写资源所在的域名或IP，也可以对保存在七牛云存储上的资源创建更多的加速功能。</p>-->
                        <div class="py-3">
                            <el-radio v-model="domain.source.sourceType" label="domain">源站域名</el-radio>
                            <el-radio v-model="domain.source.sourceType" label="ip">ip 地址</el-radio>
                            <el-radio v-model="domain.source.sourceType" label="advanced">高级</el-radio>
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
                        <el-input v-model="domain.source.testURLPath" label="">
                            <template slot="prepend">&emsp;http(s)://{{domain.source.sourceDomain}}/</template>
                            <template slot="append">&emsp;<el-button type="info" @click="alert('test')">测试源站
                            </el-button>&emsp;
                            </template>
                        </el-input>
                    </div>
                </el-col>
                <el-col :span="10" :offset="3" class="pt-3">
                    <el-button type="primary" @click="updateSource"
                               :disabled="editable"
                    >修改配置
                    </el-button>
                </el-col>
            </el-row>
        </div>
        <hr>
        <div>
            <el-row>
                <el-col :span="3" class="pl-3">
                    <strong>缓存配置</strong>
                </el-col>
                <el-col :span="10">
                    <div class="py-2">
                        <strong>基础配置</strong>
                        <p>定义指定资源内容的缓存过期时间规则。</p>
                        <el-radio v-model="cacheControls" label="default" border>默认</el-radio>
                        <el-radio v-model="cacheControls" label="follow" border>遵循源站</el-radio>
                        <el-radio v-model="cacheControls" label="custom" border>自定义</el-radio>
                    </div>
                    <div class="py-2">
                        <p>忽略 URL 参数</p>

                        <el-switch v-model="domain.cache.ignoreParam">
                        </el-switch>
                    </div>
                </el-col>
                <el-col :span="10" :offset="3" class="pt-3">
                    <el-button type="primary"
                               @click="updateCache"
                               :disabled="editable"
                    >修改配置
                    </el-button>
                </el-col>
            </el-row>
        </div>
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
        domain: {}
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
          })
          .catch(err => alert(err.message + '\n' + '请联系管理员！'))
          .finally(() => {
            // 隐藏loading
            this.$store.commit('cdn/SET_LOADING', false)
          })
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
    hr {
        box-sizing: content-box;
        height: 0;
        overflow: visible;
        margin: 30px 0;
        border: none;
        border-top: 1px solid #e6e9f0;
    }
</style>