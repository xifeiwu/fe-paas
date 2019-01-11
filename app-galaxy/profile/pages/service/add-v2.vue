<template>
  <div id="service-add">
    <el-scrollbar>
      <div class="sheet">
        <div class="section-title">{{type=='edit'?'修改服务':'创建服务'}}</div>
        <el-form :model="serviceForm" ref="serviceForm"
                 :rules="rules" :label-width="appLanguage == 'JAVA' ? '200px' : '140px'" size="mini"
                 v-loading="showLoading"
                 :element-loading-text="loadingText">
          <el-form-item label="应用名称" class="app-name">
            {{appName}}
          </el-form-item>
          <el-form-item label="运行环境" class="profile-description">
            {{profileInfo? profileInfo.description: ''}}
          </el-form-item>
          <el-form-item class="build-type" label="构建类型" v-if="packageTypeList.length > 0 && !(appLanguage.toUpperCase() == 'JAVA' && imageSelectState.customImage)" :error="serviceForm.packageInfo.errMsg">
            <div class="flex-layout">
              <div class="type-list">
                <el-radio-group v-model="serviceForm.packageInfo.type">
                  <el-radio v-for="item in packageTypeList" :label="item.type" :key="item.type">
                    {{item.packageType}}
                  </el-radio>
                </el-radio-group>
              </div>
              <div :class="['war-name', serviceForm.packageInfo.needSetName ?'':'hide', useBuildName?'':'hide']"><el-input v-model="serviceForm.packageInfo.name" placeholder="默认与项目名称一致"></el-input></div>
            </div>
          </el-form-item>
          <el-form-item label="镜像方式" prop="customImage" class="custom-image">
            <el-radio-group v-model="imageSelectState.customImage" size="mini" :disabled="handleCustomImage()">
              <el-radio :label="false">自动打镜像</el-radio>
              <el-radio :label="true">自定义镜像</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="基础镜像" class="auto-image" prop="autoImageValue" v-if="!imageSelectState.customImage">
            <el-select v-model="serviceForm.autoImageValue" filterable
                       :placeholder="imageInfoFromNet.autoImageList.length > 0 ? '请选择' : '无数据'">
              <el-option v-for="(item, index) in imageInfoFromNet.autoImageList"
                         :key="index" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="镜像地址" prop="customImageValue" v-else
                        :class="['custom-image', imageSelectState.customImageType.toLowerCase()+'-image']"
          >
            <!--<el-select v-model="serviceForm.customImageValue" filterable-->
            <!--:placeholder="imageInfoFromNet.customImageList.length > 0 ? '请选择' : '无数据'">-->
            <!--<el-option v-for="(item, index) in imageInfoFromNet.customImageList"-->
            <!--:key="index" :label="item" :value="item">-->
            <!--</el-option>-->
            <!--</el-select>-->
            <el-autocomplete
                    class="inline-input"
                    v-model="serviceForm.customImageValue"
                    :fetch-suggestions="querySearch"
                    placeholder="请输入内容"
                    @select="handleSelect"
            ></el-autocomplete>
          </el-form-item>

          <transition name="more-config">
            <el-form-item label="Gitlab_SSH地址" prop="gitLabAddress" class="gitlab-address"
                          v-if="!imageSelectState.customImage">
              <el-input v-model="serviceForm.gitLabAddress" placeholder="请输入项目的gitLab地址，不能超过256个字符"></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="Gitlab分支" prop="gitLabBranch" class="gitlab-branch"
                          v-if="!imageSelectState.customImage">
              <el-input v-model="serviceForm.gitLabBranch" placeholder="不能超过100个字符，默认为master分支"></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="mainClass" prop="mainClass"
                          v-if="appLanguage.toUpperCase() === 'JAVA' && !imageSelectState.customImage && serviceForm.packageInfo.type.toUpperCase() === 'ZIP'"
                          class="main-class"
            >
              <el-input v-model="serviceForm.mainClass"
                        placeholder=""></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="Gitlab父级pom.xml相对路径" prop="relativePathOfParentPOM"
                          v-if="appLanguage.toUpperCase() == 'JAVA' && !imageSelectState.customImage"
                          class="relative-path-of-parent-pom"
            >
              <el-input v-model="serviceForm.relativePathOfParentPOM"
                        placeholder="不能超过256个字符"></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="maven profile id" prop="mavenProfileId" class="maven-profile-id"
                          v-if="appLanguage.toUpperCase() == 'JAVA' && !imageSelectState.customImage"
            >
              <el-input v-model="serviceForm.mavenProfileId" placeholder="不能超过100个字符"></el-input>
            </el-form-item>
          </transition>
          <el-form-item label="VM_Options" prop="vmOptions" class="vm-options"
                        v-if="appLanguage.toUpperCase() == 'JAVA' && !imageSelectState.customImage"
          >
            <div>
              <el-input v-model="serviceForm.vmOptions"
                        size="mini"
                        type="textarea"
                        :rows="4"
                        placeholder="不能包含中文，不能超过512个字符"
              ></el-input>
              <div style="color:#409EFF; display:flex; align-items: flex-start; cursor:pointer; font-size: 12px; line-height: 16px;">
                <span style="line-height: 20px;" @click="handleClick($event, 'set-default-vmOptions')">帮我填</span>
                <el-tooltip slot="trigger" effect="dark" placement="bottom">
                  <div slot="content">
                    <div>填写默认的VM_options</div>
                  </div>
                  <span><i class="paas-icon-fa-question" style="color: #E6A23C; font-size:12px;"></i></span>
                </el-tooltip>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="滚动升级" prop="rollingUpdate">
            <el-radio-group v-model="serviceForm.rollingUpdate">
              <el-radio :label="true">需要</el-radio>
              <el-radio :label="false">不需要</el-radio>
              <span>
              <el-tooltip slot="trigger" effect="dark" placement="top">
                <div slot="content">
                  <div>滚动部署是为了实现业务的平滑上线而不中断，除了定时器外，建议其他应用都可以选用滚动部署</div>
                </div>
                <span><i class="paas-icon-fa-question" style="color:#E6A23C"></i></span>
              </el-tooltip>
            </span>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="负载均衡" prop="loadBalance">
            <el-radio-group v-model="serviceForm.loadBalance">
              <el-radio v-for="item in loadBalanceType" :label="item" :key="item"></el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="el-form-item-group is-required">
            <div class="label" style="width: 140px;">健康检查</div>
            <div class="content" style="margin-left: 140px;">
              <el-form-item :error="errMsgForHealthCheck">
                <div class="health-check-type" style="height: 64px">
                  <el-radio-group v-model="serviceForm.healthCheckType">
                    <el-radio v-for="(item, index) in $storeHelper.healthCheckTypeList" :label="item.desc" :key="item.desc">{{item.label}}</el-radio>
                  </el-radio-group>
                  <div class="input-area">
                    <div :class="serviceForm.healthCheckType != 'http' ? 'hide': ''">
                      <el-input v-model="serviceForm.healthCheck.http" placeholder="以/开头，可以包含字母、数字、下划线、中划线。2-100个字符"></el-input>
                    </div>
                    <div :class="serviceForm.healthCheckType != 'shell' ? 'hide' : ''">
                      <el-input v-model="serviceForm.healthCheck.shell"placeholder="请填写shell指令"></el-input>
                    </div>
                    <div :class="serviceForm.healthCheckType != 'socket' ? 'hide' : ''">
                      <span>端口号：</span>
                      <el-input-number v-model="serviceForm.healthCheck.socket" :min="0" :max="10000" label="延迟时间"></el-input-number>
                    </div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item>
                <div class="initial-delay" style="line-height: 28px">
                  <span>延迟时间：</span>
                  <el-input-number v-model="serviceForm.initialDelaySeconds" :min="30" :max="1800" label="延迟时间"></el-input-number>
                  <el-tooltip effect="dark" content="健康检查延迟时间：延迟时间以秒为单位，取值范围在30-1800之间" placement="bottom">
                    <i class="paas-icon-fa-question" style="font-size: 12px; color: #E6A23C"></i>
                  </el-tooltip>
                </div>
              </el-form-item>
            </div>
          </div>
          <el-form-item label="应用监控" prop="appMonitor" class="app-monitor" v-if="true">
            <el-radio-group v-model="serviceForm.appMonitor" size="mini" v-if="profileUtils">
              <el-radio v-for="item in profileUtils.appMonitorList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
            </el-radio-group>
            <span style="display: inline; margin-left: 10px; color: #E6A23C; font-size: 12px; line-height: 14px; cursor: pointer; padding: 1px; border: 1px solid #E6A23C; border-radius: 4px; word-break: normal"
                  @mouseenter="handleClick($event, 'warning-app-monitor')"
            >{{profileUtils['warningList']['warning-app-monitor']['text']}}</span>
          </el-form-item>
          <el-form-item label="CPU" prop="cpuID" class="cpu">
            <el-radio-group v-model="serviceForm.cpuID" size="mini">
              <el-radio-button v-for="item in cpuAndMemoryList" :label="item.id" :key="item.id">
                {{item.cpu}}核
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="内存" prop="memoryID" class="memory">
            <el-radio-group v-model="serviceForm.memoryID" size="mini">
              <el-radio-button v-for="item in memorySizeList" :label="item.id" :key="item.id">
                {{item.memory}}G
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="实例数量" prop="instanceCount" class="instance-count">
            <el-input-number v-model="serviceForm.instanceCount" :min="1" :max="20" label="描述文字"></el-input-number>
          </el-form-item>
          <el-form-item label="过期时间(天)" prop="expiredDays" class="expired-days" v-if="showExpiredDays()">
            <el-input-number v-model="serviceForm.expiredDays" :min="1"></el-input-number>
            <span>
              <el-tooltip slot="trigger" effect="dark" placement="top">
                <div slot="content">
                  <div>服务的实例将在指定时间后被删除</div>
                </div>
                <span><i class="paas-icon-fa-question" style="color:#E6A23C"></i></span>
              </el-tooltip>
            </span>
          </el-form-item>
          <transition name="more-config">
            <el-form-item label="环境变量设置" prop="environments" class="environments" :error="formItemMsgForEnvironments"
                          v-if="showMoreConfig">
              <div class="el-row title">
                <div class="el-col el-col-11 key">Key</div>
                <div class="el-col el-col-11 value">Value</div>
                <div class="el-col el-col-2" style="text-align: center">
                  <el-tooltip slot="trigger" effect="dark" placement="bottom">
                    <div slot="content">
                      <div>容器运行前设置的环境变量。</div>
                      <div>如env中的Name：string（环境变量名称），Value：string（环境变量的值）</div>
                    </div>
                    <span><i class="paas-icon-fa-question" style="color: #E6A23C"></i></span>
                  </el-tooltip>
                </div>
              </div>
              <el-row class="content"
                      v-for="(item, index) in serviceForm.environments"
                      :key="item.key"
              >
                <el-col :span="11" class="key">{{item.key}}</el-col>
                <el-col :span="11" class="value">{{item.value}}</el-col>
                <el-col :span="2" style="text-align: center">
                  <el-button type="warning" round size="mini-extral" @click="handleEnvironment('delete', index)">删除</el-button>
                </el-col>
              </el-row>
              <el-row class="add-key-value">
                <el-col :span="11" class="key">
                  <el-input v-model="environmentKey" placeholder="64位以内的数字、字母、下划线，以字母或下划线开头" size="mini"></el-input>
                </el-col>
                <el-col :span="11" class="value">
                  <el-input v-model="environmentValue" placeholder="512位以内的数字、字母、中划线、下划线" size="mini"></el-input>
                </el-col>
                <el-col :span="2" style="text-align: center">
                  <el-button type="primary" size="mini-extral" round
                             @click="handleEnvironment('add', environmentKey, environmentValue)">添加</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="Host配置" prop="hosts" class="hosts" :error="formItemMsgForHosts"
                          v-if="showMoreConfig">
              <div class="el-row title">
                <div class="el-col el-col-11 key">IP</div>
                <div class="el-col el-col-11 value">域名</div>
                <div class="el-col el-col-2" style="text-align: center">
                  <el-tooltip slot="trigger" effect="dark" placement="bottom">
                    <div slot="content">
                      <div>该Host为/etc/hosts，配置主机名和IP地址。如：192.168.1.10 finup100</div>
                    </div>
                    <span><i class="paas-icon-fa-question" style="color: #E6A23C"></i></span>
                  </el-tooltip>
                </div>
              </div>
              <el-row class="content"
                      v-for="(item, index) in serviceForm.hosts"
                      :key="item.key"
              >
                <el-col :span="11" class="key">{{item.ip}}</el-col>
                <el-col :span="11" class="value">{{item.domain}}</el-col>
                <el-col :span="2" style="text-align: center">
                  <el-button  type="warning" round size="mini-extral" @click="handleHost('delete', index)">删除</el-button>
                </el-col>
              </el-row>
              <el-row class="add-key-value">
                <el-col :span="11" class="key">
                  <el-input v-model="hostKey" placeholder="IP" size="mini"></el-input>
                </el-col>
                <el-col :span="11" class="value">
                  <el-input v-model="hostValue" placeholder="域名" size="mini"></el-input>
                </el-col>
                <el-col :span="2" style="text-align: center">
                  <el-button type="primary" size="mini-extral" round
                             @click="handleHost('add', hostKey, hostValue)">添加</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </transition>
          <!--<transition name="more-config">-->
            <!--<el-form-item label="端口映射" class="port-map" v-if="showMoreConfig && !isProductionProfile" :error="serviceForm.portMap.errMsg">-->
              <!--<div class="el-row title">-->
                <!--<div class="el-col el-col-6">-->
                  <!--<span>访问端口</span>-->
                  <!--<el-tooltip slot="trigger" effect="dark" placement="top">-->
                    <!--<div slot="content">-->
                      <!--<div v-if="serviceForm.portMap.update">访问端口的范围在40000~59999之间</div>-->
                      <!--<div v-if="!serviceForm.portMap.update">访问端口由后端自动生成</div>-->
                      <!--<div v-if="!serviceForm.portMap.update">服务创建成功后，可以进行修改</div>-->
                    <!--</div>-->
                    <!--<span><i class="paas-icon-fa-question" style="color:#E6A23C"></i></span>-->
                  <!--</el-tooltip>-->
                <!--</div>-->
                <!--<div class="el-col el-col-2" style="min-height:1px"></div>-->
                <!--<div class="el-col el-col-6">目标端口</div>-->
                <!--<div class="el-col el-col-2">协议</div>-->
              <!--</div>-->
              <!--<el-row class="content">-->
                <!--<el-col :span="6">-->
                  <!--<el-input placeholder="如40002" size="mini" :disabled="!this.serviceForm.portMap.update" v-model="serviceForm.portMap.outerPort"></el-input>-->
                <!--</el-col>-->
                <!--<el-col :span="2">&ndash;&gt;</el-col>-->
                <!--<el-col :span="6">-->
                  <!--<el-input placeholder="如8100" size="mini" v-model="serviceForm.portMap.containerPort"></el-input>-->
                <!--</el-col>-->
                <!--<el-col :span="2">TCP</el-col>-->
              <!--</el-row>-->
            <!--</el-form-item>-->
          <!--</transition>-->
          <transition name="more-config">
            <el-form-item label="prestop脚本" v-if="showMoreConfig && !isProductionProfile">
              <el-input v-model="serviceForm.prestopCommand"
                        size="mini"
                        type="textarea"
                        :rows="3"
                        placeholder="例如：shell & sleep 30 //30为变量，0-120之间的整数"
              ></el-input>
            </el-form-item>
          </transition>
          <el-form-item label="用户须知" prop="agree" v-if="profileInfo && profileInfo.spaceType.toUpperCase() === 'PRODUCTION'">
            <el-checkbox v-model="serviceForm.agree">
              <span style="display: inline-block;">已知晓：</span>
            </el-checkbox>
            <div style="display: inline-block; font-size: 12px; line-height: 18px; vertical-align: top;">
              <div>生产环境初次上线前需提交<a href="http://wiki.puhuitech.cn/pages/viewpage.action?pageId=28733856" target="_blank">生产准备就绪评审（PRR）</a>到paas.list@finupgroup.com；</div>
              <div>非生产环境可自助上线。</div>
            </div>
          </el-form-item>
          <el-form-item class="expand" v-if="$storeHelper.groupVersion !== 'v1'">
            <div class="more" @click="handleClick($event, 'more-config')">
              <span v-if="showMoreConfig">收起更多配置</span><span v-else>更多配置</span>
              <i :class="showMoreConfig?'el-icon-arrow-up':'el-icon-arrow-down'"></i>
            </div>
          </el-form-item>

        </el-form>
        <div class="section-footer">
          <div class="item">
            <el-button type="primary" size="mini"
                       :loading="statusOfWaitingResponse('submit')"
                       @click="handleClick($event, 'submit')">完&nbsp成</el-button>
          </div>
          <div class="item">
            <el-button type="primary" size="mini"
                       @click="handleClick($event, 'back')">关&nbsp闭</el-button>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style lang="scss">
  #service-add {
    .el-scrollbar {
      height: 100%;
      width: 100%;
    }
    .el-form {
      .el-form-item {
        .el-form-item__label {
          font-weight: bold;
        }
        &.service-version {
          max-width: 500px;
          .el-input {
            .el-input-group__prepend {
              width: 24px;
              text-align: center;
              color: black;
            }
          }
        }
        &.expand {
          margin-bottom: 10px;
          .el-form-item__content {
            margin-left: 0px !important;
            background-color: #F2F6FC;
            &:hover {
              background-color: #EBEEF5;
            }
            text-align: center;
            &.more {
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #service-add {
    @keyframes to-show {
      0% {
        opacity: 0;
      }
      25% {
        opacity: .75;
      }
      100% {
        opacity: 1;
      }
    }
    @keyframes to-hide {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    .more-config-enter-active  {
      animation: to-show 1.5s ease-in-out;
    }
    .more-config-leave-active {
      animation: to-hide .5s ease-in-out;
    }
    height: 100%;
    overflow: scroll;
    .sheet {
      background-color: white;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
      margin: 10px;
      padding: 10px 20px 10px 10px;
      width: 800px;
      .section-title {
        font-size: 18px;
        text-align: center;
        margin-bottom: 20px;
        font-weight: bold;
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
          width: 100px;
        }
      }
      .el-form {
        .paas-icon-fa-question {
          font-size: 12px;
        }
        .el-form-item {
          &.build-type {
            .flex-layout {
              display: flex;
              align-items: flex-start;
              .war-name {
                padding-left: 10px;
                flex: 1;
                min-width: 100px;
                opacity: 1;
                transition: opacity .5s;
                &.hide {
                  opacity: 0;
                }
              }
            }
          }
          &.app-name {
            margin-bottom: 8px;
          }
          &.profile-description {
            margin-bottom: 10px;
          }
          &.auto-image {
            max-width: 800px;
            .el-select {
              width: 100%;
            }
          }
          &.custom-image {
            max-width: 800px;
            .el-autocomplete {
              width: 100%;
            }
            .el-select {
              width: 100%;
            }
            .el-input {
              width: 100%;
            }
            &.env-image {
              .el-select {
              }
            }
            &.private-image {
              .el-select {
                box-sizing: border-box;
              }
            }
          }
          &.gitlab-address {
            max-width: 600px;
          }
          &.gitlab-branch {
            max-width: 600px;
          }
          &.relative-path-of-parent-pom {
            max-width: 600px;
          }
          &.main-class {
            max-width: 600px;
          }
          &.maven-profile-id {
            max-width: 600px;
          }

          &.environments, &.hosts {
            .key, .value {
              text-align: center;
            }
            .el-row.title {
              font-weight: bold;
            }
            .content {
              .key, .value {
                word-wrap: break-word;
                word-break: break-all;
                line-height: 1.2;
              }
            }
            .el-row.add-key-value {
              .key {
                padding-right: 3px;
              }
              .value {
                padding-left: 3px;
              }
            }
          }
          &.port-map {
            .title {
              font-weight: bold;
              text-align: center;
            }
            .content {
              text-align: center;
            }
          }
        }
      }
    }
  }
</style>
<script>
  import {mapGetters} from 'vuex';
  import profileUtils from '../utils/app-props';
  const debug = browserDebug('pass-fe:profile/service/add');
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    mixins: [commonUtils],
    created() {
      // profileUtils will be used in template
      this.profileUtils = profileUtils;
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (!dataTransfer) {
        this.$router.go(-1);
        return;
      } else {
        this.$storeHelper.dataTransfer = null;
      }
      console.log(dataTransfer);
      this.type = dataTransfer['type'];
      const theData = dataTransfer.data;
      this.dataPassed = theData;
      this.serviceForm.appId = theData.appId;
      this.serviceForm.spaceId = theData.profileId;
      this.appName = theData.appName;
      this.appLanguage = theData.language;
      this.appLanguageVersion = theData.languageVersion;
      this.packageTypeList = this.$storeHelper.getPackageTypeListByLanguageAndVersion(
        this.appLanguage,
        this.appLanguageVersion,
      );
      this.profileInfo = this.$storeHelper.getProfileInfoByID(this.serviceForm.spaceId);
      if (this.type === 'edit') {
        this.initPackageInfoType(theData);
        this.profileListOfCurrentApp = theData['appInfo']['profileList'];
        this.imageSelectState.customImage = theData.customImage;
        if(theData.customImage){
          // set after requestImageRelatedInfo
        } else {
          // set after requestImageRelatedInfo
        }
        this.serviceForm.gitLabAddress = theData.gitLabAddress;
        this.serviceForm.gitLabBranch = theData.gitLabBranch;
        this.serviceForm.appMonitor = theData.appMonitor;
        this.serviceForm.mainClass = theData.mainClass;
        this.serviceForm.relativePathOfParentPOM = theData.relativePath;
        this.serviceForm.mavenProfileId = theData.mavenProfileId;
        this.serviceForm.vmOptions = theData.vmOptions;
        this.serviceForm.instanceCount = theData.instanceNum;
        this.serviceForm.environments = theData.environments;
        this.serviceForm.hosts = theData.hosts;
        this.serviceForm.prestopCommand = theData.prestopCommand;
        this.serviceForm.cpuID = theData.cpuId;
        this.serviceForm.memoryID = theData.memoryId;
        this.serviceForm.rollingUpdate = theData.rollingUpdate;
        this.serviceForm.healthCheck.http = theData.healthCheck;
        this.serviceForm.initialDelaySeconds = theData.initialDelaySeconds;
        this.serviceForm.expiredDays = theData.remainExpiredDays;
        //端口映射暂时隐藏
        // if (theData.portsMapping[0].outerPort && theData.portsMapping[0].outerPort !== "") {
        //   this.serviceForm.portMap.outerPort = theData.portsMapping[0].outerPort;
        //   this.serviceForm.portMap.containerPort = theData.portsMapping[0].containerPort;
        //   this.serviceForm.portMap.update = true;
        // }
      } else {
        //Production appMonitor environment is selected by default
        if (this.profileInfo && this.profileInfo.spaceType.toUpperCase() !== 'PRODUCTION') {
          this.serviceForm.appMonitor = profileUtils.appMonitorList[1].id;
        }
        this.serviceForm.packageInfo.type = this.packageTypeList[0].type;
        // set default cpu, default memorySizeList will be set in watch
        if (Array.isArray(this.cpuAndMemoryList) && this.cpuAndMemoryList.length > 0) {
          let firstItem = this.cpuAndMemoryList[0];
          this.serviceForm.cpuID = 'cpu' in firstItem ? firstItem.id : '';
        }
        //set default expiredDays
        this.$net.requestPaasServer(this.$net.URL_LIST.query_default_expired_days).then(resContent => {
          this.serviceForm.expiredDays = resContent["defaultExpiredDays"];
        })
      }
      this.rules.imageLocation.required = false;
      if (this.appLanguage.toUpperCase() !== 'JAVA' && this.$storeHelper.groupVersion !== 'v1') {
        this.imageSelectState.customImage = true;
      }
    },
    mounted() {
      this.checkPortMap = this.$net.getDebounce4CheckPortMap();
      this.$nextTick(() => {
        this.$scrollWrapper = this.$el.querySelector('.el-scrollbar .el-scrollbar__wrap');
      });
    },
    data() {
      return {
        useBuildName: true,
        environmentKey: '',
        environmentValue: '',
        hostKey: '',
        hostValue: '',
        errorMsgForVersion: '',

        type: '',
        dataPassed: {},
        appName: '',
        profileInfo: null,
        appLanguage: null,
        appLanguageVersion: null,
        versionList: [],
        // （复制服务传递过来的）属性是否已经使用过
        propsUsed: {
          memoryId: false,
          customImageValue: false,
          autoImageValue: false
        },
        profileListOfCurrentApp: [],
        serviceForm: {
          appId: null,
          spaceId: null,
          serviceVersion: '',
          gitLabAddress: '',
          gitLabBranch: 'master',
          mainClass: '',
          relativePathOfParentPOM: '',
          appMonitor: profileUtils.defaultAppMonitorId,
          vmOptions: '',
          mavenProfileId: '',
          cpuID: '',
          memoryID: '',
          environments: [],
          hosts: [],
          instanceCount: 1,
          expiredDays: 90,
          customImage: false,
          imageLocation: '',
          // value of autoImage
          autoImageValue: '',
          // value of customImage
          customImageValue: '',
//           portMap: {
//             protocol: 'TCP',
//             outerPort: '',
//             containerPort: '',
//             _validateErrMsg: '',
//             update: false,
//             get errMsg() {
//               if (this.syntaxErrMsg) {
//                 return this.syntaxErrMsg;
//               } else if (this._validateErrMsg) {
//                 return this._validateErrMsg;
//               } else {
//                 return '';
//               }
//             },
//             get syntaxErrMsg() {
//               // 先检测语法错误，后检测端口号错误
//               let errMsg = '';
//               const numberReg = /^[0-9]+$/;
//               const outerPort = this.outerPort;
//               const containerPort = this.containerPort;
// //              if (outerPort == '') {
// //                errMsg = '请填写访问端口';
// //              } else if (containerPort == '') {
// //                errMsg = '请填写目标端口';
// //              } else {
//               if (containerPort != '') {
//                 if (this.update) {
//                   if (numberReg.exec(outerPort) && outerPort >= 40000 && outerPort <= 59999) {
//                   } else {
//                     errMsg = '访问端口只能是40000-59999之间的数字';
//                   }
//                 }
//                 if (!errMsg && !numberReg.exec(containerPort)) {
//                   errMsg = '端口只能是数字';
//                 }
//               }
//               return errMsg;
//             },
//             set validateErrMsg(value) {
//               this._validateErrMsg = value;
//             }
//           },
          prestopCommand: '',
          rollingUpdate: true,
          loadBalance: profileUtils.getSupportedLoadBalance()[0],
          healthCheckType: this.$storeHelper.defaultHealthCheckTypeDesc,
          healthCheck: {
            http: '/health',
            shell: '',
            socket: 8080
          },
          initialDelaySeconds: 120,
          agree: false,
          packageType: '',
          packageInfo: {
            _type: '',
            _name: '',
            set type(value) {
              this._type = value;
            },
            get type() {
              return this._type;
            },
            set name(value) {
              this._name = value;
            },
            get name() {
              if (this._type === 'WAR') {
                return this._name;
              } else {
                return '';
              }
            },
            get needSetName() {
              return this._type == 'WAR';
            },
            get errMsg() {
              return '';
              if (this._type === 'WAR' && !this._name) {
                return '默认与项目名称一致';
//              return '构建类型为WAR时，必须填写构建包名称';
              } else {
                return '';
              }
            }
          },
        },
        showMoreConfig: false,
        // error message for form-item environments
        formItemMsgForEnvironments: '',
        formItemMsgForHosts: '',

        customImageTypeList: [{
          label: '环境镜像',
          value: 'ENV'
        }, {
          label: '私有镜像',
          value: 'PRIVATE'
        }],
        // image related info requested from network, with the format:
        imageInfoFromNet: {
          autoImageList: [],
          customImageList: [],
//          customEnvImageList: [],
//          privateAppList: [],
        },
        imageSelectState: {
          // custom image or not
          customImage: false,
          // value of autoImage
          autoImageValue: '',
          // value of customImage
          customImageValue: '',
          // type of customImage
          customImageType: 'ENV',
          // selected private app in custom-image private-image
          currentPrivateApp: '',
        },
        currentPrivateAppVersionList: [],

        memorySizeList: [],
        rules: profileUtils.rules,

        showLoading: false,
        loadingText: '',

        checkPortMap: null,
        errMsgForHealthCheck: '',
        packageTypeList: [],
      }
    },
    computed: {
      ...mapGetters('user', {
        'profileListOfGroup': 'profileListOfGroup'
      }),
      cpuAndMemoryList() {
        return this.$storeHelper.cpuAndMemoryList;
      },
      groupInfo() {
        return this.$storeHelper.groupInfo;
      },
      isProductionProfile() {
        return this.$storeHelper.isProductionProfile(this.serviceForm.spaceId);
      },
      loadBalanceType() {
        if (this.$storeHelper.groupVersion === "v1") {
          return profileUtils.getAllLoadBalance();
        } else {
          return profileUtils.getSupportedLoadBalance();
        }
      },
    },
    watch: {
      'serviceForm.packageInfo.type': function (type) {
        this.requestImageRelatedInfo(type);
      },
      /**
       * set memoryID at watcher of serviceForm.cpuID
       */
      'serviceForm.cpuID': function (value, oldValue) {
        let cpuID = value;
        let cpuInfo = null;
        if (Array.isArray(this.cpuAndMemoryList)) {
          this.cpuAndMemoryList.some(it => {
            if (it.hasOwnProperty('id') && cpuID === it.id) {
              cpuInfo = it;
            }
          });
          if (!cpuInfo && this.cpuAndMemoryList.length > 0) {
            cpuInfo = this.cpuAndMemoryList[0];
          }
          if (!cpuInfo) {
            return;
          }
          this.memorySizeList = cpuInfo.memoryList;
          if (this.type === 'edit' && !this.propsUsed.memoryId) {
            // check if memoryId existed in memorySizeList
            if (this.memorySizeList.map(it => {
              return it.id
            }).indexOf(this.dataPassed.memoryId) > -1) {
              this.serviceForm.memoryID = this.dataPassed.memoryId;
            } else {
              this.serviceForm.memoryID = this.memorySizeList[0]['id'];
            }
            this.propsUsed.memoryId = true;
          } else {
            // set default memory
            if (Array.isArray(this.memorySizeList)) {
              this.memorySizeList.some(it => {
                if (it.hasOwnProperty('defaultSelect') && 1 === it.defaultSelect) {
                  this.serviceForm.memoryID = it.id;
                }
              })
            }
          }
        }
      },

      // 'serviceForm.portMap.outerPort': function (value) {
      //   if (this.serviceForm.portMap.syntaxErrMsg || this.serviceForm.portMap.outerPort === this.dataPassed.portsMapping[0].outerPort) {
      //     return;
      //   }
      //   this.checkPortMap({
      //     appId: this.serviceForm.appId,
      //     spaceId: this.serviceForm.spaceId,
      //     outerPort: this.serviceForm.portMap.outerPort
      //   }, (err, msg) => {
      //     if (err) {
      //       this.serviceForm.portMap.validateErrMsg = '';
      //     } else {
      //       this.serviceForm.portMap.validateErrMsg = msg;
      //     }
      //   })
      // },
      'serviceForm.healthCheckType': function (type) {
        switch (type) {
          case 'http':
//          this.createAppForm.healthCheck = '';
            break;
          case 'shell':
//          this.createAppForm.healthCheck = '';
            break;
          case 'socket':
            this.createAppForm.healthCheck.socket = 8080;
            break;
        }
        this.getErrMsgForHealthCheck();
      },
//      'imageInfoFromNet': {
//        immediate: true,
//        handler (info) {
//          this.updateImageSelection();
//        }
//      },
//      'imageSelectState.customImage': {
//        immediate: true,
//        handler (value) {
//          this.updateImageSelection();
//        }
//      },
//      'imageSelectState.customImageType': {
//        immediate: true,
//        handler (value) {
//          this.updateImageSelection();
//        }
//      },
//      'imageSelectState.currentPrivateApp': 'requestPrivateImageLocation'
    },
    methods: {
      scrollTop() {
        setTimeout(() => {
          this.$scrollWrapper.scrollTop = 0;
        }, 500);
      },
      scrollBottom() {
        this.$nextTick(() => {
          let containerHeight = this.$scrollWrapper.offsetHeight;
          let sheet = this.$el.querySelector('.sheet');
          if (!sheet) {
            return;
          }
          // 30px is the sum of marginTop and marginBottom
          let sheetHeight = sheet.offsetHeight + 30;
          if (sheetHeight > containerHeight) {
            setTimeout(() => {
              this.$scrollWrapper.scrollTop = sheetHeight - containerHeight;
            }, 500);
          }
        });
      },

      querySearch(queryString, cb) {
        var results = [];
        if (this.imageInfoFromNet['customImageList'].length > 0) {
          results = this.imageInfoFromNet['customImageList'].filter(it => {
            return it.indexOf(queryString) > -1;
          }).map(it => {
            return {
              value: it
            }
          })
        }
        cb(results);
      },
      handleSelect(item) {
        console.log(item);
      },

      // get image related info from network
      async requestImageRelatedInfo(type) {
        this.imageInfoFromNet['customImageList'] = [];
        this.imageInfoFromNet['autoImageList'] = [];
        try {
          const groupTag = this.groupInfo.tag;
          const appId = this.serviceForm.appId;
          const profileName = this.profileInfo.name;
          const projectName = this.appName;
          const results = await this.$net.getImageRelatedInfo({
            groupTag,
            appId,
            language: this.appLanguage,
            languageVersion: this.appLanguageVersion,
            packageType: type,
          }, {
            groupTag,
            appId
          });
          const customImageList = results['customImageList'];
          const autoImageList = results['autoImageList'];

          this.imageInfoFromNet['customImageList'] = customImageList;
          this.imageInfoFromNet['autoImageList'] = [{
            label: '无',
            value: ''
          }].concat(autoImageList.map(it => {
            return {
              label: it,
              value: it,
            }
          }));
//          console.log(this.imageInfoFromNet);
//          console.log(this.dataPassed);

          // set default value by dataPassed if necessary
          if (this.dataPassed.hasOwnProperty('customImage')) {
            if (this.dataPassed.customImage) {
              // 自定义镜像
              // if (!this.propsUsed.customImageValue && customImageList.indexOf(this.dataPassed.image.location) > -1) {
              //   this.serviceForm.customImageValue = this.dataPassed.image.location;
              //   this.propsUsed.customImageValue = true;
              // }
              //因为从harbor得到数据不稳定，所以直接赋值，不需要匹配
              this.serviceForm.customImageValue = this.dataPassed.image.location;
              this.propsUsed.customImageValue = true;
            } else {
              // 自动打镜像
              // if (!this.propsUsed.autoImageValue && autoImageList.indexOf(this.dataPassed.image.location) > -1) {
              //   this.serviceForm.autoImageValue = this.dataPassed.image.location;
              //   this.propsUsed.autoImageValue = true;
              // }
              this.serviceForm.autoImageValue = this.dataPassed.image.location;
              this.propsUsed.autoImageValue = true;
            }
          }

          // not set default value for customImageValue
          if (customImageList.length > 0 && false) {
            if (customImageList.indexOf(this.serviceForm.customImageValue) === -1) {
              this.serviceForm.customImageValue = customImageList[0];
            }
          }
        } catch (err) {
          console.log(err);
          this.$notify.error({
            title: '获取镜像信息失败，请联系管理员',
            message: err.message,
            duration: 8000
          });
        }
      },
      // set default image at the change of custom-image's type
      // TODO: not used
      updateImageSelection() {
        if (!this.imageSelectState.customImage) {
          this.serviceForm.autoImageValue = '';
        } else {
          let imageInfoFromNet = this.imageInfoFromNet;
          this.serviceForm.customImageValue = '';
          switch (this.imageSelectState.customImageType) {
            case 'ENV':
              if (imageInfoFromNet.hasOwnProperty('customEnvImageList') && imageInfoFromNet.customEnvImageList.length > 0) {
                this.serviceForm.customImageValue = this.imageInfoFromNet.customEnvImageList[0].imageName;
              }
              break;
            case 'PRIVATE':
              if (imageInfoFromNet.hasOwnProperty('privateAppList') && imageInfoFromNet.privateAppList.length > 0) {
                this.imageSelectState.currentPrivateApp = this.imageInfoFromNet.privateAppList[0];
              }
              break;
          }
        }
      },
      // request private image version list by image-name
      // TODO: not used
      requestPrivateImageLocation(value) {
        this.currentPrivateAppVersionList = [];
        this.$net.getVersionListOfAppInCustomImage({
          projectName: value
        }).then(versionList => {
          this.currentPrivateAppVersionList = versionList;
          if (this.currentPrivateAppVersionList.length > 0) {
//            this.serviceForm.customImageValue = this.currentPrivateAppVersionList[0];
          }
        }).catch(err => {
          console.log(err);
        });
      },

      // operation for add or delete environment
      handleEnvironment(action, key, value) {
        switch (action) {
          case 'add':
            // remove error notification first
            this.formItemMsgForEnvironments = '';
//            let keyReg = /^[A-Za-z0-9_\-\.@]{1,64}$/;
            let keyReg = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
            let valueReg = /^[A-Za-z0-9_\-\.@]{1,512}$/;
            if (!keyReg.exec(key)) {
              this.$message.error('64位以内的数字、字母、下划线，以字母或下划线开头');
              return;
            }
            if (!valueReg.exec(value)) {
              this.$message.error('请输入512位以内的数字、字母、中划线、下划线');
              return;
            }
            if (this.serviceForm.environments.length >= 10) {
              this.$message.error('最多输入10个');
              return;
            }
            let itemWithKey = null;
            this.serviceForm.environments.some(it => {
              if (it.key === key) {
                itemWithKey = it;
              }
              return itemWithKey;
            });
            if (!itemWithKey) {
              this.serviceForm.environments.push({
                key: key,
                value: value,
              });
              this.environmentKey = '';
              this.environmentValue = '';
            } else {
              this.formItemMsgForEnvironments = `Key "${itemWithKey.key}" 已经存在，如需更改，请删除后重新添加`;
            }
            break;
          case 'delete':
            let index = key;
            this.serviceForm.environments.splice(index, 1);
            break;
        }
      },

      // operation for add or delete host
      handleHost(action, key, value) {
        switch (action) {
          case 'add':
            // remove error notification first
            this.formItemMsgForHosts = '';
            let ip = key;
            let domain = value;
            let ipReg = new RegExp('^([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})$');
            if (!ip.match(ipReg)) {
              this.$message.error('ip格式不正确');
              return;
            }
            let domainReg = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
            if (!domain.match(domainReg)) {
              this.$message.error('域名格式不正确');
              return;
            }
            if (this.serviceForm.hosts.length >= 10) {
              this.$message.error('最多输入10个');
              return;
            }
            let itemWithIpAndDomain = null;
            this.serviceForm.hosts.some(it => {
              if (it.ip === ip && it.domain === domain) {
                itemWithIpAndDomain = it;
              }
            });
            if (!itemWithIpAndDomain) {
              this.serviceForm.hosts.push({
                ip: ip,
                domain: domain,
              });
              this.hostKey = '';
              this.hostValue = '';
            } else {
              this.formItemMsgForHosts = `"${itemWithIpAndDomain.ip}-${itemWithIpAndDomain.domain}" 已经存在`;
            }
            break;
          case 'delete':
            let index = key;
            this.serviceForm.hosts.splice(index, 1);
            break;
        }
      },

      handleClick(evt, action) {
        if (['warning-app-monitor'].indexOf(action) > -1) {
          if (this.profileUtils['warningList'].hasOwnProperty(action)) {
            this.$storeHelper.globalPopover.show({
              ref: evt.target,
              msg: this.profileUtils['warningList'][action]['more']
            });
          }
          return;
        }
        switch (action) {
          case 'more-config':
            this.showMoreConfig = !this.showMoreConfig;
            if (this.showMoreConfig) {
              this.scrollBottom();
            } else {
              this.scrollTop();
            }
            break;
          case 'set-default-vmOptions':
            this.serviceForm['vmOptions'] = `-server -Xmx2g -Xms2g -Xmn256m -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=256m -Xss256k -XX:+UseConcMarkSweepGC -XX:+UseFastAccessorMethods -XX:+UseCMSInitiatingOccupancyOnly -XX:CMSInitiatingOccupancyFraction=70 -XX:+PrintGCTimeStamps -XX:+ExplicitGCInvokesConcurrentAndUnloadsClasses -XX:+PrintGCDetails -XX:+PrintGCDateStamps`;
            break;
          case 'back':
            this.$router.go(-1);
            break;
          case 'submit':
            this.$refs['serviceForm'].validate((valid) => {
              // if (this.serviceForm.portMap.errMsg) {
              //   valid = false;
              // }
              if (this.getErrMsgForHealthCheck()) {
                valid = false;
              }
              if (valid) {
                this.serviceForm.customImage = this.imageSelectState.customImage;
                if (this.imageSelectState.customImage) {
                  this.serviceForm.imageLocation = this.serviceForm.customImageValue;
                } else {
                  this.serviceForm.imageLocation = this.serviceForm.autoImageValue;
                }
                let expiredDays = this.showExpiredDays() ? this.serviceForm.expiredDays : null;
                let serviceForm = this.serviceForm;
                let payload = {
                  appId: serviceForm.appId,
                  spaceId: serviceForm.spaceId,
                  orchId: this.dataPassed.orchId,
                  orchIP: this.dataPassed.orchIP,
                  gitLabAddress: serviceForm.gitLabAddress,
                  gitLabBranch: serviceForm.gitLabBranch,
                  mainClass: serviceForm.mainClass,
                  relativePath: serviceForm.relativePathOfParentPOM,
                  vmOptions: serviceForm.vmOptions,
                  appMonitor: serviceForm.appMonitor,
                  mavenProfileId: serviceForm.mavenProfileId,
                  rollingUpdate: serviceForm.rollingUpdate,
                  loadBalance: serviceForm.loadBalance,
                  initialDelaySeconds: serviceForm.initialDelaySeconds,
                  cpuId: serviceForm.cpuID,
                  memoryId: serviceForm.memoryID,
                  environments: serviceForm.environments,
                  hosts: serviceForm.hosts,
                  instanceNum: serviceForm.instanceCount,
                  customImage: serviceForm.customImage,
                  image: serviceForm.imageLocation,
                  prestopCommand: serviceForm.prestopCommand,
                  expiredDays: expiredDays,
                  packageType: this.serviceForm.packageInfo.type,
                };
                // payload.portsMapping = [{
                //   protocol: serviceForm.portMap.protocol,
                //   outerPort: serviceForm.portMap.outerPort,
                //   containerPort: serviceForm.portMap.containerPort,
                // }];
                if (this.type === 'edit') {
                  payload["id"] = this.dataPassed.id;
                  // payload.portsMapping[0]["id"] = this.dataPassed.portsMapping[0]["id"];
                  payload["serviceName"] = this.dataPassed.serviceName;
                }
                if (this.$storeHelper.groupVersion !== 'v1') {
                  if (this.type === 'edit') {
                    payload["serviceVersion"] = this.dataPassed.serviceVersion;
                  } else {
                    payload["serviceVersion"] = 'default';
                  }
                }
                payload.healthCheckType = this.$storeHelper.getHealthCheckTypeKeyByDesc(serviceForm.healthCheckType);
                switch (serviceForm.healthCheckType) {
                  case 'http':
                    payload.healthCheck = serviceForm.healthCheck.http;
                    break;
                  case 'shell':
                    payload.healthCheck = serviceForm.healthCheck.shell;
                    break;
                  case 'socket':
                    payload.healthCheck = serviceForm.healthCheck.socket;
                    break;
                }
                this.addToWaitingResponseQueue('submit');
                this.showLoading = true;
                this.loadingText = '正在为您创建服务';
                this.$net.requestPaasServer(this.$net.URL_LIST.service_create, {
                  payload
                }).then(resConent => {
                  if (this.type === 'edit') {
                    this.$message({
                      type: 'success',
                      message: '服务更新成功！'
                    });
                  } else {
                    this.$message({
                      type: 'success',
                      message: '服务创建成功！'
                    });
                  }
                  this.$net.needUpdateAppList = true;
                  this.$router.push(this.$net.page['profile/service']);
                }).catch().finally(() => {
                  this.hideWaitingResponse('submit');
                  this.showLoading = false;
                });
              } else {
                return false;
              }
            });
            break;
        }
      },
      /**
       * used for two-way choose after success action, howto:
       * successConfirm(contentToShow).then().catch()
       * TODO: not used
       */
      successConfirm(content) {
        return new Promise((resolve, reject) => {
          this.$confirm(content, '提示', {
            confirmButtonText: '返回服务列表',
            cancelButtonText: '继续创建',
            closeOnClickModal: false,
            type: 'success'
          }).then(() => {
            resolve();
          }).catch(() => {
            reject()
          });
        });
      },

      resetForm(formName) {
        this.$refs[formName].resetFields();
      },

      showExpiredDays() {
        return this.profileInfo && this.profileInfo.spaceType.toUpperCase() !== 'PRODUCTION';
      },

      getErrMsgForHealthCheck() {
        let errMsg = '';
        const healthCheck = this.serviceForm.healthCheck;
        switch (this.serviceForm.healthCheckType) {
          case 'http':
            const regForHttp = /^\/[A-Za-z0-9_\-\.\/]{1,99}$/;
            if (!regForHttp.exec(healthCheck.http)) {
              errMsg = '以/开头，可以包含字母、数字、下划线、中划线。2-100个字符';
            }
            break;
          case 'shell':
            if (healthCheck.shell.trim().length === 0) {
              errMsg = '健康检查不能为空';
            }
            break;
          case 'socket':
            break;
        }
        this.errMsgForHealthCheck = errMsg;
        return errMsg;
      },

      handleCustomImage() {
        if (this.appLanguage.toUpperCase() === "JAVA") {
          return false
        } else if (this.appLanguage.toUpperCase() === "NODEJS" && this.$storeHelper.groupVersion === "v1") {
          return false
        } else {
          return true
        }
      },

      initPackageInfoType(theData) {
        let item = this.packageTypeList.find(it => {
          return theData.packageType == it.type;
        });
        if (item) {
          this.serviceForm.packageInfo.type = theData.packageType;
        } else {
          this.serviceForm.packageInfo.type = this.packageTypeList[0].type;
        }
      }
    }
  }
</script>
