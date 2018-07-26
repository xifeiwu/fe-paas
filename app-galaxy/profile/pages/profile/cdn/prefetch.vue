<template>
    <div class="pa-5"
         v-loading="loading"
         element-loading-text="操作进行中"
         element-loading-spinner="el-icon-loading"
    >
        <div class="tip">
            <ol>
                <li>1. 每天文件刷新限额 500 个，目录刷新 10 个，文件预取限额 100 个；</li>
                <li>2. 每次提交文件刷新最多 20 个，文件预取最多 20 个；</li>
                <li>3. 输入时，多个 URL 请用回车换行分隔，每个 URL 应当以 http:// 或 https:// 开头， 例如 http://www.example.com/index.html。</li>
            </ol>
        </div>
        <hr>
        <el-tabs v-model="activeName">
            <el-tab-pane label="刷新文件" name="urls">
                <div class="orange py-3">输入需要刷新缓存的文件路径，当前剩余：{{urlSurplusDay}}</div>
                <div>
                    <el-input
                            placeholder="http://www.example.com/index.html"
                            type="textarea"
                            v-model="urls"
                            :autosize="{ minRows: 10, maxRows: 50}"
                    ></el-input>
                </div>
                <div class="py-3">
                    <el-button type="primary" @click="refresh">提交</el-button>
                </div>
            </el-tab-pane>
            <el-tab-pane label="刷新目录" name="dirs">
                <div class="orange py-3">
                    输入需要刷新缓存的目录路径，当前剩余：{{dirSurplusDay}}
                </div>
                <div class="tip pb-3">
                    * 小提醒：要刷新的目录必须以 `/` 结尾例如：http://www.example.com/
                </div>
                <div>
                    <el-input
                            placeholder="http://www.example.com/"
                            type="textarea"
                            v-model="dirs"
                            :autosize="{ minRows: 10, maxRows: 50}"
                    ></el-input>
                </div>
                <div class="py-3">
                    <el-button type="primary" @click="refresh">提交</el-button>
                </div>
            </el-tab-pane>
            <el-tab-pane label="文件预取" name="files">
                <div class="orange py-3">
                    输入需要预取的文件路径，主动预先推送资源到CDN节点，当前剩余：{{surplusDay}}
                </div>
                <div>
                    <el-input
                            placeholder="http://www.example.com/index.html"
                            type="textarea"
                            v-model="files"
                            :autosize="{ minRows: 10, maxRows: 50}"
                    ></el-input>
                </div>
                <div class="py-3">
                    <el-button type="primary" @click="refresh">提交</el-button>
                </div>
            </el-tab-pane>
            <el-tab-pane label="操作记录" name="fourth">
                操作记录
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
  import {mapState} from "vuex";

  export default {
    name: "prefetch",
    data() {
      return {
        urlSurplusDay: 500,
        dirSurplusDay: 10,
        surplusDay: 100,
        activeName: 'urls',
        urls: '',
        dirs: '',
        files: ''
      }
    },
    computed: {
      ...mapState("cdn", ["domainList", "loading"]),
    },
    methods: {
      refresh() {
        this.$store.commit('cdn/SET_LOADING', true);
        let payload = {};
        if (this.activeName === 'files') {
          payload = this.files.split('\n').map(i => i.trim()).filter(i => i.length > 1)
        } else {
          payload[this.activeName] = this[this.activeName].split('\n').map(i => i.trim()).filter(i => i.length > 1)
        }
        const url = this.activeName !== 'files' ? '/api/cdn/domain/refresh' : '/api/cdn/domain/prefetch';
        this.$ajax
          .post(url, payload)
          .then(res => {
            if (!res.data.hasOwnProperty('code') || res.data.code !== 200) {
              return this.$toast(res.data.code + '\n' + res.data.error, 'error');
            }
            res.data.urlSurplusDay && (this.urlSurplusDay = res.data.urlSurplusDay);
            res.data.dirSurplusDay && (this.dirSurplusDay = res.data.dirSurplusDay);
            res.data.surplusDay && (this.surplusDay = res.data.surplusDay);
            this.$toast('资源刷新成功！！');
          })
          .catch(err => alert(err.message + '\n' + '请联系管理员！'))
          .finally(() => {
            // 隐藏loading
            this.$store.commit('cdn/SET_LOADING', false)
          });
      }
    }
  }
</script>

<style scoped>
    .tip {
        color: #999;
    }

    .orange {
        color: orange;
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