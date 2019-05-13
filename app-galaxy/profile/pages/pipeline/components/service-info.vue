<template>
  <div class="paas-service-info" v-if="serviceInfo">
    <!--测试环境基本信息{{serviceInfo}}-->
    <el-form label-position="right" label-width="160px" inline size="mini" class="compact clear-fix">
      <el-form-item label="开发语言">
        {{serviceInfo.language + ' - ' + serviceInfo.languageVersion}}
      </el-form-item>
      <el-form-item label="构建类型">
        {{serviceInfo.packageType}}
      </el-form-item>
      <el-form-item label="滚动升级">
        <span>{{serviceInfo.rollingUpdate? '需要' : '不需要'}}</span>
      </el-form-item>
      <el-form-item label="剩余过期时间">
        <span>{{serviceInfo.expiredDays}}</span>
      </el-form-item>
      <el-form-item label="负载均衡">
        {{serviceInfo.loadBalance}}
      </el-form-item>
      <el-form-item label="CPU/内存">
        <span>{{serviceInfo.cpu + '核 / ' + serviceInfo.memory + 'M'}}</span>
      </el-form-item>
      <el-form-item label="实例数量">
        <span>{{serviceInfo.instanceNum}}</span>
      </el-form-item>
      <el-form-item label="应用监控" v-if="!serviceInfo.customImage">
        <span>{{$storeHelper.getMonitorNameById(serviceInfo.appMonitor)}}</span>
      </el-form-item>
      <el-form-item label="构建名称" class="big" v-if="serviceInfo.packageType == 'WAR'">
        {{serviceInfo.buildName}}
      </el-form-item>
      <el-form-item label="mainClass" class="big" v-if="serviceInfo.packageType == 'ZIP'">
        {{serviceInfo.mainClass ? serviceInfo.mainClass : '---'}}
      </el-form-item>
      <el-form-item label="镜像方式" class="big">
        <span>{{serviceInfo.customImage ? '自定义镜像':'自动打镜像'}}</span>
        <span>{{serviceInfo.image}}</span>
      </el-form-item>
      <el-form-item label="Maven profile id" v-if="serviceInfo.language==='JAVA' && !serviceInfo.customImage">
        <div class="expand-to-next-line">{{serviceInfo.mavenProfileId}}</div>
      </el-form-item>
      <el-form-item label="健康检查" class="big">
        <span>{{serviceInfo.healthCheck}}</span>
      </el-form-item>
      <el-form-item label="preStop脚本" class="big">
        <span>{{serviceInfo.prestopCommand}}</span>
      </el-form-item>
      <el-form-item label="VM_Options" class="big vm-options" v-if="serviceInfo.language==='JAVA'">
        {{serviceInfo.vmOptions}}
      </el-form-item>
      <el-form-item label="Host配置" class="big" v-if="false">
        <div v-if="serviceInfo.hosts && serviceInfo.hosts.length > 0">
          <el-row>
            <el-col :span="8" style="font-weight: bold; text-align: center">IP</el-col>
            <el-col :span="8" style="font-weight: bold; text-align: center">域名</el-col>
            <el-col :span="2" style="font-weight: bold;text-align: left">
            </el-col>
          </el-row>
          <el-row
                  v-for="(item, index) in serviceInfo.hosts"
                  :key="item.ip"
          >
            <el-col :span="8" style="text-align: center">{{item.ip}}</el-col>
            <el-col :span="8" style="text-align: center">{{item.domain}}</el-col>
            <el-col :span="2"></el-col>
          </el-row>
        </div>
        <div v-else>
          <span>---</span>
        </div>
      </el-form-item>
      <el-form-item label="端口映射" class="port-map big" v-if="false">
        <div v-if="serviceInfo.portMap">
          <div class="el-row">
            <div class="el-col el-col-6" style="font-weight: bold; text-align: center">访问端口</div>
            <div class="el-col el-col-2" style="min-height:1px"></div>
            <div class="el-col el-col-6" style="font-weight: bold; text-align: center">目标端口</div>
            <div class="el-col el-col-2" style="font-weight: bold; text-align: center">协议</div>
            <div class="el-col el-col-2" style="font-weight: bold; text-align: center">
              <i :class="['paas-icon', 'el-icon-edit', isPermittedToChangeProp('portMap') ? 'warning' : 'disabled']"
                 @click="handleChangeProp($event, 'portMap')"></i>
            </div>
          </div>
        </div>
        <div v-else>
          <span>未设置</span>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<style lang="scss" >
  @mixin expand-inline-form-item() {
    display: block;
    width: 100%;
    .el-form-item__label {
      float: left;
    }
    .el-form-item__content {
      display: block;
    }
  }
  .paas-service-info {
    .el-form {
      .el-form-item {
        width: 50%;
        float: left;
        &.big {
          @include expand-inline-form-item;
          .el-form-item__content {
            /*margin-left: 170px;*/
          }
        }
      }
    }
  }
</style>
<script>
  export default {
    mounted() {
      const defaultValue = '---';
      ['mavenProfileId', 'prestopCommand', 'vmOptions', 'healthCheck', 'expiredDays'].forEach(key => {
        if (!this.serviceInfo[key]) {
          this.serviceInfo[key] = defaultValue;
        }
      });
    },
    props: {
      serviceInfo: {
        type: Object,
        default: null
      }
    }
  }
</script>