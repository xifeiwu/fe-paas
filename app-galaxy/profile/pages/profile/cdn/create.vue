<template>
    <div>
        <div class="pa-3 pt-4" style="background-color: #fff;">
            <el-row :gutter="20">
                <el-col :span="14">
                    <el-button type="info" icon="el-icon-back" @click="$router.go(-1)">
                        返回
                    </el-button>
                </el-col>
            </el-row>
        </div>
        <div class="pa-3" style="background-color: #fff;">
            <el-form :model="form" :rules="rules" ref="configDirForm" class="mt-3">
                <el-row class="py-3">
                    <el-col :span="3" class="pl-3">
                            <strong>域名类型:</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-radio v-model="form.type" label="1" border>普通域名</el-radio>
                        <el-radio v-model="form.type" label="2" border>泛域名</el-radio>
                    </el-col>
                </el-row>
                <el-row class="py-3">
                    <el-col :span="3" class="pl-3">
                        <strong>加速域名:</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-input type="text" label="domain"></el-input>
                    </el-col>
                    <el-col :span="2" class="pt-1 pl-1">
                        必填项
                    </el-col>
                </el-row>
                <el-row class="py-3">
                    <el-col :span="3" class="pl-3">
                        <strong>备案号:</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-input type="text" label="domain"></el-input>
                    </el-col>
                    <el-col :span="2" class="pt-1 pl-1">
                        必填项
                    </el-col>
                </el-row>
                <el-row class="py-3">
                    <el-col :span="3" class="pl-3">
                        <strong>覆盖范围 :</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-radio v-model="form.type" label="1" border>中国大陆</el-radio>
                        <el-radio v-model="form.type" label="2" border>海外</el-radio>
                        <el-radio v-model="form.type" label="2" border>全球</el-radio>
                    </el-col>
                </el-row>
                <el-row class="py-3">
                    <el-col :span="3" class="pl-3">
                        <strong>通信协议 :</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-radio v-model="form.type" label="1" border>http</el-radio>
                        <el-radio v-model="form.type" label="2" border>https</el-radio>
                    </el-col>
                </el-row>
                <el-row class="py-3">
                    <el-col :span="3" class="pl-3">
                        <strong>使用场景 :</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-radio v-model="form.type" label="1" border>图片小文件</el-radio>
                        <el-radio v-model="form.type" label="2" border>下载分发</el-radio>
                        <el-radio v-model="form.type" label="3" border>视频直播</el-radio>
                    </el-col>
                </el-row>
                <el-row class="py-3">
                    <el-col :span="3" class="pl-3">
                        <strong>源站配置 :</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-radio v-model="form.type" label="1" border>图片小文件</el-radio>
                        <el-radio v-model="form.type" label="2" border>下载分发</el-radio>
                        <el-radio v-model="form.type" label="3" border>视频直播</el-radio>
                    </el-col>
                </el-row>
                <el-row class="py-3">
                    <el-col :span="3" class="pl-3">
                        <strong>缓存配置 :</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-radio v-model="form.type" label="1" border>图片小文件</el-radio>
                        <el-radio v-model="form.type" label="2" border>下载分发</el-radio>
                        <el-radio v-model="form.type" label="3" border>视频直播</el-radio>
                    </el-col>
                </el-row>
                <el-row class="py-3">
                    <el-col :span="3" class="pl-3">
                        <strong>高级配置 :</strong>
                    </el-col>
                    <el-col :span="10">
                        <el-radio v-model="form.type" label="1" border>图片小文件</el-radio>
                        <el-radio v-model="form.type" label="2" border>下载分发</el-radio>
                        <el-radio v-model="form.type" label="3" border>视频直播</el-radio>
                    </el-col>
                </el-row>
                <el-row class="py-4">
                    <el-col :span="10" :offset="3">
                        <el-button type="primary">提交</el-button>
                        <el-button type="primary">重置</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </div>
    </div>
</template>

<script>
  export default {
    name: "create.vue",
    data() {
      return {
        form: {
          type: 'web'
        }
      }
    }
  }
</script>

<style scoped>

</style>