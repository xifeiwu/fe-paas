<template>
  <div id="service-add">
    <el-scrollbar>
      <div class="sheet">
        <div class="section-title">{{forModify ?'修改配置' : (forCopy ? '复制服务' : '创建服务')}}</div>
        <el-form :model="formData" ref="formData"
                 :rules="rules" :label-width="formRelated.isJavaLanguage ? '180px' : '180px'" size="mini"
                 :element-loading-text="loadingText">
          <el-form-item label="目标环境" v-if="forCopy">
            <el-select v-model="formData.spaceId">
              <el-option v-for="item in profileList" :key="item.id" :label="item.description" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="运行环境" class="profile-description" v-else>
            {{profileInfo? profileInfo.description: ''}}
          </el-form-item>
          <el-form-item label="应用名称" class="app-name max-width-600" v-if="forModify || forCopy">
            {{formRelated.serviceInfo ? formRelated.serviceInfo['appName'] : ''}}
          </el-form-item>
          <el-form-item label="应用名称" class="app-name max-width-600" v-else-if="dataPassed.from.action === 'service_config_add'">
            {{dataPassed.serviceBasicInfo ? dataPassed.serviceBasicInfo['appName'] : ''}}
          </el-form-item>
          <el-form-item label="应用名称" class="app-name max-width-600" v-else>
            <el-select v-model="formData.appId" placeholder="请选择" filterable>
              <el-option v-for="item in dataPassed.appWithoutService" :key="item.appId" :label="item.appName" :value="item.appId">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="语言/版本" class="app-name">
            {{formRelated.serviceInfo ? `${formRelated.serviceInfo.language.name} / ${formRelated.serviceInfo.language.version}` : ''}}
          </el-form-item>
          <el-form-item label="镜像方式" prop="customImage" class="custom-image">
            <el-radio-group v-model="imageSelectState.customImage" size="mini" :disabled="formRelated.isPythonLanguage">
              <el-radio :label="false">自动打镜像</el-radio>
              <el-radio :label="true">自定义镜像</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item class="build-type max-width-700" label="构建类型" v-if="formRelated.packageTypeList.length > 0 && formRelated.isJavaLanguage && !imageSelectState.customImage" :error="formData.packageInfo.errMsg">
            <div class="flex-layout">
              <div class="type-list">
                <el-radio-group v-model="formData.packageInfo.type">
                  <el-radio v-for="item in formRelated.packageTypeList" :label="item.type" :key="item.type">
                    {{item.packageType}}
                  </el-radio>
                </el-radio-group>
              </div>
              <div :class="['war-name', formData.packageInfo.needSetName ?'':'hide', useBuildName?'':'hide']" prop="packageInfo.name">
                <el-input v-model="formData.packageInfo.name" placeholder="默认与项目名称一致"></el-input>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="基础镜像" class="auto-image max-width-800" prop="autoImageValue" v-if="!imageSelectState.customImage">
            <el-select v-model="formData.autoImageValue" filterable
                       :placeholder="imageInfoFromNet.autoImageList.length > 0 ? '请选择' : '无数据'">
              <el-option v-for="(item, index) in imageInfoFromNet.autoImageList"
                         :key="index" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="镜像地址" prop="customImageValue" v-else
                        :class="['custom-image', 'max-width-800', imageSelectState.customImageType.toLowerCase()+'-image']"
          >
            <!--<el-select v-model="formData.customImageValue" filterable-->
            <!--:placeholder="imageInfoFromNet.customImageList.length > 0 ? '请选择' : '无数据'">-->
            <!--<el-option v-for="(item, index) in imageInfoFromNet.customImageList"-->
            <!--:key="index" :label="item" :value="item">-->
            <!--</el-option>-->
            <!--</el-select>-->
            <el-autocomplete
                    class="inline-input"
                    v-model="formData.customImageValue"
                    :fetch-suggestions="querySearch"
                    placeholder="请输入内容"
                    @select="handleSelect"
            ></el-autocomplete>
          </el-form-item>

          <transition name="more-config">
            <el-form-item label="Gitlab_SSH地址" prop="gitLabAddress" class="gitlab-address max-width-700"
                          v-if="!imageSelectState.customImage">
              <el-input v-model="formData.gitLabAddress" placeholder="请输入项目的gitLab地址，不能超过256个字符"></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="Gitlab分支" prop="gitLabBranch" class="gitlab-branch max-width-700"
                          v-if="!imageSelectState.customImage">
              <el-input v-model="formData.gitLabBranch" placeholder="不能超过100个字符"></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="mainClass" prop="mainClass"
                          v-if="formRelated.isJavaLanguage && !imageSelectState.customImage && formData.packageInfo.type.toUpperCase() === 'ZIP'"
                          class="main-class max-width-600"
            >
              <el-input v-model="formData.mainClass" placeholder=""></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item prop="relativePathOfParentPOM"
                          v-if="formRelated.isJavaLanguage && !imageSelectState.customImage"
                          class="relative-path-of-parent-pom max-width-700"
            >
              <div slot="label"><span style="font-size: 13px;">Gitlab父级pom.xml相对路径</span></div>
              <el-input v-model="formData.relativePathOfParentPOM"
                        placeholder="不能超过256个字符"></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="maven profile id" prop="mavenProfileId max-width-700" class="maven-profile-id max-width-700"
                          v-if="formRelated.isJavaLanguage && !imageSelectState.customImage"
            >
              <el-input v-model="formData.mavenProfileId" :placeholder="`默认值为${profileInfo.nameStr},不能超过100字符`"></el-input>
            </el-form-item>
          </transition>
          <el-form-item label="VM_Options" prop="vmOptions" class="vm-options max-width-800"
                        v-if="formRelated.isJavaLanguage && !imageSelectState.customImage"
          >
            <div>
              <el-input v-model="formData.vmOptions"
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
            <el-radio-group v-model="formData.rollingUpdate">
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
            <el-radio-group v-model="formData.loadBalance">
              <el-radio v-for="item in loadBalanceType" :label="item" :key="item"></el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="el-form-item-group is-required health-check max-width-700">
            <div class="label" style="width: 180px;">健康检查</div>
            <div class="content" style="margin-left: 180px;">
              <el-form-item :error="isSubmitClicked ? formData.healthCheck.contentCheckErrMsg : ''">
                <div class="health-check-type" style="height: 64px">
                  <el-radio-group v-model="formData.healthCheck.type">
                    <el-radio v-for="(item, index) in $storeHelper.healthCheckTypeList" :label="item.desc" :key="item.desc">{{item.label}}</el-radio>
                  </el-radio-group>
                  <div class="input-area">
                    <div v-if="formData.healthCheck.type == 'http'">
                      <el-input v-model="formData.healthCheck.content" placeholder="以/开头，可以包含字母、数字、下划线、中划线。2-100个字符"></el-input>
                    </div>
                    <div v-if="formData.healthCheck.type == 'shell'">
                      <el-input v-model="formData.healthCheck.content" placeholder="请填写shell指令"></el-input>
                    </div>
                    <div v-if="formData.healthCheck.type == 'socket'">
                      <span>端口号：</span>
                      <el-input-number v-model="formData.healthCheck.content" :min="0" :max="10000" label="延迟时间"></el-input-number>
                    </div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item>
                <div class="initial-delay" style="line-height: 28px">
                  <span>延迟时间：</span>
                  <el-input-number v-model="formData.healthCheck.initialDelay" :min="30" :max="300" label="延迟时间"></el-input-number>
                  <el-tooltip effect="dark" content="健康检查延迟时间：延迟时间以秒为单位，取值范围在30-300之间" placement="bottom">
                    <i class="paas-icon-fa-question" style="font-size: 12px; color: #E6A23C"></i>
                  </el-tooltip>
                </div>
              </el-form-item>
            </div>
          </div>
          <el-form-item label="应用监控" prop="appMonitor" class="app-monitor" v-if="formRelated.isJavaLanguage">
            <el-radio-group v-model="formData.appMonitor" size="mini" v-if="profileUtils">
              <el-radio v-for="item in profileUtils.appMonitorList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
            </el-radio-group>
            <span style="display: inline; margin-left: 10px; color: #E6A23C; font-size: 12px; line-height: 14px; cursor: pointer; padding: 1px; border: 1px solid #E6A23C; border-radius: 4px; word-break: normal"
                  @mouseenter="handleClick($event, 'warning-app-monitor')" v-if="false"
            >{{profileUtils['warningList']['warning-app-monitor']['text']}}</span>
          </el-form-item>
          <el-form-item label="CPU" prop="cpuId" class="cpu">
            <el-radio-group v-model="formData.cpuId" size="mini">
              <el-radio-button v-for="item in cpuAndMemoryList" :label="item.id" :key="item.id">
                {{item.cpu}}核
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="内存" prop="memoryId" class="memory">
            <el-radio-group v-model="formData.memoryId" size="mini">
              <el-radio-button v-for="item in memorySizeList" :label="item.id" :key="item.id">
                {{item.memory}}G
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="实例数量" prop="instanceCount" class="instance-count">
            <el-input-number v-model="formData.instanceCount" :min="1" label="描述文字"></el-input-number>
          </el-form-item>
          <el-form-item label="过期时间(天)" prop="expiredDays" class="expired-days" v-if="!formRelated.isProductionProfile">
            <el-input-number v-model="formData.expiredDays" :min="1"></el-input-number>
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
                <div class="el-col el-col-7 key">Key</div>
                <div class="el-col el-col-7 value">Value</div>
                <div class="el-col el-col-8 remark">备注</div>
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
                      v-for="(item, index) in formData.environments"
                      :key="item.key"
              >
                <el-col :span="7" class="key">{{item.key}}</el-col>
                <el-col :span="7" class="value">{{item.value}}</el-col>
                <el-col :span="8" class="remark">{{item.remark}}</el-col>
                <el-col :span="2" style="text-align: center" class="delete">
                  <el-button type="warning" round size="mini-extral" @click="handleEnvironment('delete', index)">删除</el-button>
                </el-col>
              </el-row>
              <el-row class="add-key-value">
                <el-col :span="7" class="key">
                  <el-input v-model="environmentKey" placeholder="64位以内的数字、字母、下划线，以字母或下划线开头" size="mini"></el-input>
                </el-col>
                <el-col :span="7" class="value">
                  <el-input v-model="environmentValue" placeholder="512位以内，不能为空" size="mini"></el-input>
                </el-col>
                <el-col :span="8" class="remark">
                  <el-input v-model="environmentRemark" size="mini"></el-input>
                </el-col>
                <el-col :span="2" style="text-align: center">
                  <el-button type="primary" size="mini-extral" round
                             @click="handleEnvironment('add', environmentKey, environmentValue, environmentRemark)">添加</el-button>
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
                      v-for="(item, index) in formData.hosts"
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
          <transition name="more-config">
            <el-form-item label="端口映射" class="port-map" v-if="showMoreConfig && !formRelated.isProductionProfile" :error="formData.portMap.errMsg">
              <div class="el-row title">
                <div class="el-col el-col-6">
                  <span>访问端口</span>
                  <el-tooltip slot="trigger" effect="dark" placement="top">
                    <div slot="content">
                      <div v-if="formData.portMap.update">访问端口的范围在40000~59999之间</div>
                      <div v-if="!formData.portMap.update">访问端口由后端自动生成</div>
                      <div v-if="!formData.portMap.update">服务创建成功后，可以进行修改</div>
                    </div>
                    <span><i class="paas-icon-fa-question" style="color:#E6A23C"></i></span>
                  </el-tooltip>
                </div>
                <div class="el-col el-col-2" style="min-height:1px"></div>
                <div class="el-col el-col-6">目标端口</div>
                <div class="el-col el-col-2">协议</div>
              </div>
              <el-row class="content">
                <el-col :span="6">
                  <el-input placeholder="如40002" size="mini" :disabled="!this.formData.portMap.update" v-model="formData.portMap.outerPort"></el-input>
                </el-col>
                <el-col :span="2">--></el-col>
                <el-col :span="6">
                  <el-input placeholder="如8100" size="mini" v-model="formData.portMap.containerPort"></el-input>
                </el-col>
                <el-col :span="2">TCP</el-col>
              </el-row>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="prestop脚本" v-if="showMoreConfig && !formRelated.isProductionProfile">
              <el-input v-model="formData.prestopCommand"
                        size="mini"
                        type="textarea"
                        :rows="3"
                        placeholder="例如：shell & sleep 30 //30为变量，0-120之间的整数"
              ></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="volume"
                          prop="volume"
                          class="volume max-width-700"
                          v-if="showMoreConfig && $storeHelper.getUserInfo('role') == '平台管理员'">
              <el-input v-model="formData.volume" ></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="subPath"
                          prop="subPath" class="subPath max-width-700"
                          v-if="showMoreConfig && $storeHelper.getUserInfo('role') == '平台管理员'">
              <el-input v-model="formData.subPath" ></el-input>
            </el-form-item>
          </transition>
          <transition name="more-config">
            <el-form-item label="claimName"
                          prop="claimName" class="claim max-width-700"
                          v-if="showMoreConfig && $storeHelper.getUserInfo('role') == '平台管理员'">
              <el-input v-model="formData.claimName" ></el-input>
            </el-form-item>
          </transition>
          <el-form-item label="用户须知" prop="agree" v-if="profileInfo && formRelated.isProductionProfile">
            <el-checkbox v-model="formData.agree">
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
      max-width: 900px;
      .section-title {
        margin: 15px 0px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
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
        .el-form-item-group {
          &.max-width-600 {
            max-width: 600px;
          }
          &.max-width-700 {
            max-width: 700px;
          }
          &.max-width-800 {
            max-width: 800px;
          }
        }
        .el-form-item {
          &.max-width-600 {
            max-width: 600px;
          }
          &.max-width-700 {
            max-width: 700px;
          }
          &.max-width-800 {
            max-width: 800px;
          }
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
            .el-select {
              width: 100%;
            }
          }
          &.profile-description {
            margin-bottom: 10px;
          }
          &.auto-image {
            .el-select {
              width: 100%;
            }
          }
          &.gitlab-address {
          }
          &.gitlab-branch {
          }
          &.relative-path-of-parent-pom {
          }
          &.main-class {
          }
          &.maven-profile-id {
          }
          &.vm-options {
          }
          &.custom-image {
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

          &.environments, &.hosts {
            .key, .value, .remark {
              text-align: center;
            }
            .el-row.title {
              font-weight: bold;
            }
            .content {
              .key, .value, .remark {
                word-wrap: break-word;
                word-break: break-all;
                line-height: 1.2;
              }
              .delete {
                flex: none;
                float: right;
              }
            }
            .el-row.add-key-value {
              .key {
                padding-right: 3px;
              }
              .value {
                padding-left: 3px;
                padding-right: 3px;
              }
              .remark {
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
     // console.log(dataTransfer);
      var goBack = false;
      this.type = dataTransfer['type'];
      this.forModify = (this.$route['path'] == this.$net.page['profile/service/modify']);
      this.forCopy = (this.$route['path'] == this.$net.page['profile/service/copy']);
      this.dataPassed.from = dataTransfer.from;
      const theData = dataTransfer.data;
      // for compatible
      this.profileInfo = theData.profileInfo;
//      console.log(this.profileInfo);
      this.dataPassed.profileInfo = theData.profileInfo;
      this.formData.spaceId = theData.profileInfo.id;
//      console.log(this.dataPassed);
      if (this.forModify || this.forCopy) {
        const serviceInfo = theData.serviceInfo;
        this.dataPassed.serviceInfo = serviceInfo;
        if (serviceInfo) {
          // NOTICE: the sequence of initialize should not change
          this.formRelated.languageInfo = serviceInfo.language;
          this.formData.appId = serviceInfo.appId;

          if (this.$storeHelper.groupVersion == 'v1' && this.formRelated.languageInfo.type.toUpperCase() === 'PYTHON') {
            this.imageSelectState.customImage = true;
          } else {
            this.imageSelectState.customImage = serviceInfo.image.customImage;
          }
          // imageLoaction should set in function requestImageRelatedInfo
          if (serviceInfo.customImage) {
            // set after requestImageRelatedInfo
          } else {
            // set after requestImageRelatedInfo
          }
          this.formData.gitLabAddress = serviceInfo.gitLabAddress;
          this.formData.gitLabBranch = serviceInfo.gitLabBranch;
          this.formData.appMonitor = serviceInfo.appMonitor;
          this.formData.mainClass = serviceInfo.mainClass;
          this.formData.relativePathOfParentPOM = serviceInfo.relativePath;
          this.formData.mavenProfileId = serviceInfo.mavenProfileId;
          this.formData.vmOptions = serviceInfo.vmOptions;
          this.formData.instanceCount = serviceInfo.instanceNum;
          this.formData.environments = serviceInfo.environments;
          this.formData.hosts = serviceInfo.hosts;
          this.formData.prestopCommand = serviceInfo.prestopCommand;
          this.formData.cpuId = serviceInfo.cpuInfo.id;
          this.formData.memoryId = serviceInfo.memoryInfo.id;
          this.formData.rollingUpdate = serviceInfo.rollingUpdate;
          this.formData.volume = serviceInfo.volume;
          this.formData.subPath = serviceInfo.subPath;
          this.formData.claimName = serviceInfo.claimName;
          // NOTICE: healthCheck should set after mounted
          this.$nextTick(() => {
            this.formData.healthCheck = serviceInfo.healthCheck;
          });
          this.formData.expiredDays = serviceInfo.remainExpiredDays;
          if (serviceInfo.portMap.outerPort && serviceInfo.portMap.outerPort !== ""
            && serviceInfo.portMap.action && serviceInfo.portMap.action !== 'del') {
            this.formData.portMap.outerPort = serviceInfo.portMap.outerPort;
            this.formData.portMap.containerPort = serviceInfo.portMap.containerPort;
            this.formData.portMap.update = true;
          }
          if (this.forCopy) {
            this.formData.spaceId = theData.notServiceSpaceList[0];
            let appInfo = this.$storeHelper.getAppInfoByID(serviceInfo.appId);
            let profileList = appInfo['app']['profileList'];
            this.profileList = profileList.filter(it => {
              return theData.notServiceSpaceList.indexOf(it.id) > -1;
            });
          }
        } else {
          goBack = true;
        }
      } else {
        //Production appMonitor environment is selected by default
        if (this.profileInfo && this.profileInfo.spaceType.toUpperCase() !== 'PRODUCTION') {
          this.formData.appMonitor = profileUtils.appMonitorList[1].id;
        }
        // use this.$nextTick for correct performance of this.formData.healthCheck.contentCheckErrMsg used in el-form-item :error
        this.$nextTick(() => {
          this.formData.healthCheck.type = this.$storeHelper.defaultHealthCheckTypeDesc;
          this.formData.healthCheck.content = '';
        });

        if (this.dataPassed.from.action === 'service_config_add') {
          if (theData.serviceBasicInfo) {
            this.dataPassed.serviceBasicInfo = theData.serviceBasicInfo;
            this.dataPassed.serviceInfo = theData.serviceBasicInfo;
            this.formData.appId = theData.serviceBasicInfo['appId'];
          } else {
            goBack = true;
          }
        } else {
          this.dataPassed.appWithoutService = theData.appWithoutService;
          if (this.dataPassed.appWithoutService.length > 0) {
            this.formData.appId = this.dataPassed.appWithoutService[0]['appId'];
          } else {
            goBack = true;
          }
        }

//        this.formData.packageInfo.type = this.packageTypeList[0].type;
        // set default cpu, default memorySizeList will be set in watch
        if (Array.isArray(this.cpuAndMemoryList) && this.cpuAndMemoryList.length > 0) {
          const firstItem = this.cpuAndMemoryList[0];
          this.formData.cpuId = 'cpu' in firstItem ? firstItem.id : '';
        }
//        //set default expiredDays
//        this.$net.requestPaasServer(this.$net.URL_LIST.query_default_expired_days).then(resContent => {
//          this.formData.expiredDays = resContent["defaultExpiredDays"];
//        });
      }
      if (goBack) {
        this.$router.go(-1);
        return;
      }
      this.rules.imageLocation.required = false;
//      if (this.appLanguage.toUpperCase() !== 'JAVA' && this.$storeHelper.groupVersion !== 'v1') {
//        this.imageSelectState.customImage = true;
//      }
    },
    mounted() {
      this.checkPortMap = this.$net.getDebounce4CheckPortMap();
      this.$nextTick(() => {
        this.$scrollWrapper = this.$el.querySelector('.el-scrollbar .el-scrollbar__wrap');
      });
    },
    data() {
      return {
        isSubmitClicked: false,
        useBuildName: true,
        environmentKey: '',
        environmentValue: '',
        environmentRemark: '',
        hostKey: '',
        hostValue: '',
        errorMsgForVersion: '',

        type: '',
        forModify: false,
        forCopy: false,
        profileList: [],
        versionList: [],
        // （复制服务传递过来的）属性是否已经使用过
        propsUsed: {
          memoryId: false,
          customImageValue: false,
          autoImageValue: false
        },
        profileInfo: null,
        dataPassed: {
          from: null,
          // 没有服务的应用列表
          appWithoutService: null,
          // 运行环境信息
          profileInfo: null,
          // 服务基本信息
          serviceBasicInfo: null,
          // 服务详情
          serviceInfo: null,
        },
        formRelated: {
          serviceInfo: null,
          packageTypeList: [],
          /** 语言相关 */
          languageInfo: null,
          /** 服务相关 */
          isJavaLanguage: false,
          // python不支持修改镜像类型
          isPythonLanguage: false,
          /** 运行环境相关 */
          isProductionProfile: false,
          // 是否展示剩余天数：生产环境不需要展示
//          showRemainingDays: false,
        },

//        profileListOfCurrentApp: [],
        formData: {
          appId: null,
          spaceId: null,
          serviceVersion: '',
          gitLabAddress: '',
          gitLabBranch: '',
          mainClass: '',
          relativePathOfParentPOM: '',
          appMonitor: profileUtils.defaultAppMonitorId,
          vmOptions: '',
          mavenProfileId: '',
          cpuId: '',
          memoryId: '',
          environments: [],
          hosts: [],
          instanceCount: 1,
          expiredDays: this.$storeHelper.globalConfig['defaultExpiredDays'],
          customImage: false,
          imageLocation: '',
          // value of autoImage
          autoImageValue: '',
          // value of customImage
          customImageValue: '',
          volume:'',
          subPath:'',
          claimName:'',
          portMap: {
            protocol: 'TCP',
            outerPort: '',
            containerPort: '',
            _validateErrMsg: '',
            update: false,
            get errMsg() {
              if (this.syntaxErrMsg) {
                return this.syntaxErrMsg;
              } else if (this._validateErrMsg) {
                return this._validateErrMsg;
              } else {
                return '';
              }
            },
            get syntaxErrMsg() {
              // 先检测语法错误，后检测端口号错误
              let errMsg = '';
              const numberReg = /^[0-9]+$/;
              const outerPort = this.outerPort;
              const containerPort = this.containerPort;
//              if (outerPort == '') {
//                errMsg = '请填写访问端口';
//              } else if (containerPort == '') {
//                errMsg = '请填写目标端口';
//              } else {
              if (containerPort != '') {
                if (this.update) {
                  if (numberReg.exec(outerPort) && outerPort >= 40000 && outerPort <= 59999) {
                  } else {
                    errMsg = '访问端口只能是40000-59999之间的数字';
                  }
                }
                if (!errMsg && !numberReg.exec(containerPort)) {
                  errMsg = '端口只能是数字';
                }
              }
              return errMsg;
            },
            set validateErrMsg(value) {
              this._validateErrMsg = value;
            }
          },
          prestopCommand: '',
          rollingUpdate: true,
          loadBalance: profileUtils.getSupportedLoadBalance()[0],
          healthCheck: this.$net.getObjHealthCheck(),
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

        loadingText: '',

        checkPortMap: null,
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
      loadBalanceType() {
        if (this.$storeHelper.groupVersion === "v1") {
          return profileUtils.getAllLoadBalance();
        } else {
          return profileUtils.getSupportedLoadBalance();
        }
      },
    },
    watch: {
      // 依赖appId的属性：serviceInfo, isJavaLanguage, isPythonLanguage, packageTypeList, this.formData.packageInfo.type
      'formData.appId': function (appId) {
        var serviceInfo = null;
        if (this.forModify || this.forCopy || this.dataPassed.from.action === 'service_config_add') {
          serviceInfo = this.dataPassed.serviceInfo;
        } else {
          serviceInfo = this.dataPassed.appWithoutService.find(it => {
            return it['appId'] === appId;
          })
        }

//        console.log(serviceInfo);
        if (serviceInfo) {
          this.formRelated.isJavaLanguage = serviceInfo.language.type === 'JAVA';
          this.formRelated.isPythonLanguage = serviceInfo.language.type === 'PYTHON';
          if (this.formRelated.isPythonLanguage) {
            this.imageSelectState.customImage = true;
          }

          // get packageTypeList by languageType and languageVersion
          this.formRelated.packageTypeList = this.$storeHelper.getPackageTypeListByLanguageAndVersion(
            serviceInfo.language.type,
            serviceInfo.language.version,
          );
        } else {
          console.log('serviceInfo not found!');
          return;
        }
        this.formRelated.serviceInfo = serviceInfo;

        if (this.forModify || this.forCopy) {
          const packageInfo = serviceInfo['packageInfo'];
          const item = this.formRelated.packageTypeList.find(it => {
            return packageInfo.type == it.type;
          });
          if (item) {
            this.formData.packageInfo.type = packageInfo.type;
            this.formData.packageInfo.name = packageInfo.name;
          } else {
            this.formData.packageInfo.type = this.formRelated.packageTypeList[0].type;
          }
        } else {
          this.formRelated.languageInfo = serviceInfo.language;
          this.formData.packageInfo.type = this.formRelated.packageTypeList[0].type;
        }
//        console.log(this.formRelated.serviceInfo);
//        console.log(this.formRelated.packageTypeList);
      },
      'formData.packageInfo.type': function (type) {
        this.requestImageRelatedInfo(type);
      },
      /**
       * set memoryId at watcher of formData.cpuId
       */
      'formData.cpuId': function (value, oldValue) {
        let cpuId = value;
        let cpuInfo = null;
        if (Array.isArray(this.cpuAndMemoryList)) {
          this.cpuAndMemoryList.some(it => {
            if (it.hasOwnProperty('id') && cpuId === it.id) {
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
          if ((this.forModify || this.forCopy) && !this.propsUsed.memoryId) {
            // check if memoryId existed in memorySizeList
            if (this.memorySizeList.map(it => {
              return it.id
            }).indexOf(this.dataPassed.serviceInfo.memoryInfo.id) > -1) {
              this.formData.memoryId = this.dataPassed.serviceInfo.memoryInfo.id;
            } else {
              this.formData.memoryId = this.memorySizeList[0]['id'];
            }
            this.propsUsed.memoryId = true;
          } else {
            // set default memory
            if (Array.isArray(this.memorySizeList)) {
              this.memorySizeList.some(it => {
                if (it.hasOwnProperty('defaultSelect') && 1 === it.defaultSelect) {
                  this.formData.memoryId = it.id;
                }
              })
            }
          }
        }
      },

      'formData.portMap.outerPort': function (value) {
        if (this.formData.portMap.syntaxErrMsg || this.formData.portMap.outerPort === this.dataPassed.serviceInfo.portMap.outerPort) {
          return;
        }
        this.checkPortMap({
          appId: this.formData.appId,
          spaceId: this.formData.spaceId,
          outerPort: this.formData.portMap.outerPort
        }, (err, msg) => {
          if (err) {
            this.formData.portMap.validateErrMsg = '';
          } else {
            this.formData.portMap.validateErrMsg = msg;
          }
        })
      },
      'formData.spaceId': function (spaceId) {
        this.formRelated.isProductionProfile = this.$storeHelper.isProductionProfile(spaceId);
        // 切换目标环境是清除所有的表单字段校验
        this.$refs['formData'].clearValidate();
      }
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
          const appId = this.formData.appId;
//          const profileName = this.profileInfo.name;
//          const projectName = this.appName;
          const results = await this.$net.getImageRelatedInfo({
            groupTag,
            appId,
            language: this.formRelated.languageInfo.type,
            languageVersion: this.formRelated.languageInfo.version,
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

          if (this.forModify || this.forCopy) {
            // set default value by passedData if necessary
            const serviceInfo = this.dataPassed.serviceInfo;
            if (serviceInfo && serviceInfo.image.hasOwnProperty('customImage')) {
              if (serviceInfo.image.customImage) {
                // 自定义镜像
                // if (!this.propsUsed.customImageValue && customImageList.indexOf(serviceInfo.image.location) > -1) {
                //   this.formData.customImageValue = serviceInfo.image.location;
                //   this.propsUsed.customImageValue = true;
                // }
                //因为从harbor得到数据不稳定，所以直接赋值，不需要匹配
                this.formData.customImageValue = serviceInfo.image.location;
                this.propsUsed.customImageValue = true;
              } else {
                // 自动打镜像
                // if (!this.propsUsed.autoImageValue && autoImageList.indexOf(serviceInfo.image.location) > -1) {
                //   this.formData.autoImageValue = serviceInfo.image.location;
                //   this.propsUsed.autoImageValue = true;
                // }
                this.formData.autoImageValue = serviceInfo.image.location;
                this.propsUsed.autoImageValue = true;
              }
            }
          }

          // not set default value for customImageValue
          if (customImageList.length > 0 && false) {
            if (customImageList.indexOf(this.formData.customImageValue) === -1) {
              this.formData.customImageValue = customImageList[0];
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
          this.formData.autoImageValue = '';
        } else {
          let imageInfoFromNet = this.imageInfoFromNet;
          this.formData.customImageValue = '';
          switch (this.imageSelectState.customImageType) {
            case 'ENV':
              if (imageInfoFromNet.hasOwnProperty('customEnvImageList') && imageInfoFromNet.customEnvImageList.length > 0) {
                this.formData.customImageValue = this.imageInfoFromNet.customEnvImageList[0].imageName;
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
//            this.formData.customImageValue = this.currentPrivateAppVersionList[0];
          }
        }).catch(err => {
          console.log(err);
        });
      },

      // operation for add or delete environment
      handleEnvironment(action, key, value, remark) {
        switch (action) {
          case 'add':
            key = key.trim();
            value = value.trim();
            // remove error notification first
            this.formItemMsgForEnvironments = '';
//            let keyReg = /^[A-Za-z0-9_\-\.@]{1,64}$/;
            let keyReg = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
            let valueReg = /^.{1,512}$/;
            if (!keyReg.exec(key)) {
              this.$message.error('环境变量的关键字：64位以内的数字、字母、下划线，以字母或下划线开头');
              return;
            }
            if (!valueReg.exec(value)) {
              this.$message.error('环境变量的值：512位以内，不能为空');
              return;
            }
            if (this.formData.environments.length >= 10) {
              this.$message.error('最多输入10个');
              return;
            }
            let itemWithKey = null;
            this.formData.environments.some(it => {
              if (it.key === key) {
                itemWithKey = it;
              }
              return itemWithKey;
            });
            if (!itemWithKey) {
              this.formData.environments.push({
                key,
                value,
                remark,
              });
              this.environmentKey = '';
              this.environmentValue = '';
              this.environmentRemark = '';
            } else {
              this.formItemMsgForEnvironments = `Key "${itemWithKey.key}" 已经存在，如需更改，请删除后重新添加`;
            }
            break;
          case 'delete':
            let index = key;
            this.formData.environments.splice(index, 1);
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
            const ipReg = this.$utils.getReg('ipOnly');
            if (!ipReg.test(ip)) {
              this.$message.error('ip格式不正确');
              return;
            }
            let domainReg = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
            if (!domain.match(domainReg)) {
              this.$message.error('域名格式不正确');
              return;
            }
            if (this.formData.hosts.length >= 10) {
              this.$message.error('最多输入10个');
              return;
            }
            let itemWithIpAndDomain = null;
            this.formData.hosts.some(it => {
              if (it.ip === ip && it.domain === domain) {
                itemWithIpAndDomain = it;
              }
            });
            if (!itemWithIpAndDomain) {
              this.formData.hosts.push({
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
            this.formData.hosts.splice(index, 1);
            break;
        }
      },

      // go to page service with dataPassed
      goToPageService() {
        this.$storeHelper.dataTransfer = {
          from: this.$route.path,
          to: {
            action: this.dataPassed.from.action,
            currentPage: this.dataPassed.from.page,
            profileInfo: this.profileInfo
          }
        };
        this.$router.push(this.$net.page['profile/service']);
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
            this.formData['vmOptions'] = `-server -Xmx2g -Xms2g -Xmn256m -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=256m -Xss256k -XX:+UseConcMarkSweepGC -XX:+UseFastAccessorMethods -XX:+UseCMSInitiatingOccupancyOnly -XX:CMSInitiatingOccupancyFraction=70 -XX:+PrintGCTimeStamps -XX:+ExplicitGCInvokesConcurrentAndUnloadsClasses -XX:+PrintGCDetails -XX:+PrintGCDateStamps`;
            break;
          case 'back':
            this.goToPageService();
            break;
          case 'submit':
            this.isSubmitClicked = true;
            this.formData.customImageValue = this.$utils.isString(this.formData.customImageValue) && this.formData.customImageValue.trim();
            this.formData.autoImageValue = this.$utils.isString(this.formData.autoImageValue) && this.formData.autoImageValue.trim();
            this.formData.mavenProfileId = this.$utils.isString(this.formData.mavenProfileId) && this.formData.mavenProfileId.trim();
            this.$refs['formData'].validate((valid) => {
              if (this.formData.portMap.errMsg) {
                valid = false;
              }
              if (this.formData.healthCheck.contentCheckErrMsg) {
                valid = false;
              }
              if (valid) {
                this.formData.customImage = this.imageSelectState.customImage;
                if (this.imageSelectState.customImage) {
                  this.formData.imageLocation = this.formData.customImageValue;
                } else {
                  this.formData.imageLocation = this.formData.autoImageValue;
                }
                const formData = this.formData;
                const payload = {
                  appId: formData.appId,
                  spaceId: formData.spaceId,
                  orchId: this.dataPassed.serviceInfo.orchId,
                  orchIP: this.dataPassed.serviceInfo.orchIP,
                  gitLabAddress: formData.gitLabAddress,
                  gitLabBranch: formData.gitLabBranch,
                  mainClass: formData.mainClass,
                  relativePath: formData.relativePathOfParentPOM,
                  vmOptions: formData.vmOptions,
                  appMonitor: formData.appMonitor,
                  mavenProfileId: formData.mavenProfileId,
                  rollingUpdate: formData.rollingUpdate,
                  loadBalance: formData.loadBalance,
                  initialDelaySeconds: formData.healthCheck.initialDelay,
                  cpuId: formData.cpuId,
                  memoryId: formData.memoryId,
                  environments: formData.environments,
                  hosts: formData.hosts,
                  instanceNum: formData.instanceCount,
                  customImage: formData.customImage,
                  image: formData.imageLocation,
                  prestopCommand: formData.prestopCommand,
                  packageType: formData.packageInfo.type,
                  buildName: formData.packageInfo.name,
                  volume: formData.volume,
                  subPath: formData.subPath,
                  claimName: formData.claimName
                };
                payload.portsMapping = [{
                  protocol: formData.portMap.protocol,
                  outerPort: formData.portMap.outerPort,
                  containerPort: formData.portMap.containerPort,
                }];
                if (this.formRelated.isProductionProfile) {
                } else {
                  payload.expiredDays = this.formData.expiredDays;
                }

                if (this.forModify) {
                  payload["id"] = this.dataPassed.serviceInfo.id;
                  payload.portsMapping[0]["id"] = this.dataPassed.serviceInfo.portMap.id;
                  payload["serviceName"] = this.dataPassed.serviceInfo.serviceName;
                }
                if (this.$storeHelper.groupVersion !== 'v1') {
                  if (this.forModify) {
                    payload["serviceVersion"] = this.dataPassed.serviceInfo.serviceVersion;
                  } else {
                    payload["serviceVersion"] = 'default';
                  }
                } else {
                  payload["serviceVersion"] = null;
                }
                payload.healthCheckType = this.$storeHelper.getHealthCheckTypeKeyByDesc(formData.healthCheck.type);
                payload.healthCheck = formData.healthCheck.content;
                this.addToWaitingResponseQueue('submit');
                this.loadingText = '正在为您创建服务';
                this.$net.requestPaasServer(this.$net.URL_LIST.service_create, {
                  payload
                }).then(resConent => {
                  if (this.forModify) {
                    this.$message({
                      type: 'success',
                      message: '服务更新成功，重新部署后才能生效！'
                    });
                  } else if (this.forCopy) {
                    this.$message({
                      type: 'success',
                      message: '服务复制成功!'
                    });
                  } else {
                    this.$message({
                      type: 'success',
                      message: '服务创建成功！'
                    });
                  }
                  this.$net.needUpdateAppList = true;

                  this.goToPageService();
                }).catch().finally(() => {
                  this.hideWaitingResponse('submit');
                });
              } else {
                return false;
              }
            });
            break;
        }
      },

      resetForm(formName) {
        this.$refs[formName].resetFields();
      },

    }
  }
</script>
