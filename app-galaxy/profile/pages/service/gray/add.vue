<template>
  <el-scrollbar id="service-add">
    <div class="sheet">
      <div class="section-title">
        <span>{{title}}</span>
        <i style="font-size:14px; line-height: 22px;" class="paas-icon-question"
           v-pop-on-mouse-over="'置灰配置取自主服务，如需修改，请修改主服务的配置'"></i>
      </div>
      <el-form :model="formData" ref="formData"
               :rules="rules" :label-width="formRelated.isJavaLanguage ? '160px' : '160px'" size="mini"
               :element-loading-text="loadingText">
        <el-form-item label="目标环境" v-if="forCopy" class="message-show">
          <el-select v-model="formData.spaceId">
            <el-option v-for="item in formRelated.profileList" :key="item.id" :label="item.description" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="运行环境" class="message-show profile-description" v-else>
          {{profileInfo? profileInfo.description: ''}}
        </el-form-item>
        <el-form-item label="应用名称" class="app-name message-show">
          {{serviceInfo ? serviceInfo['appName'] : ''}}
        </el-form-item>

        <el-form-item label="语言/版本" class="app-name message-show">
          {{serviceInfo ? `${serviceInfo.language.name} / ${serviceInfo.language.version}` : ''}}
        </el-form-item>
        <el-form-item label="镜像方式" prop="customImage" class="custom-image">
          <el-radio-group v-model="imageSelectState.customImage" size="mini" :disabled="formRelated.isPythonLanguage">
            <el-radio :label="false">平台构建镜像</el-radio>
            <el-radio :label="true">自定义镜像</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item class="build-type" label="构建类型" v-if="formRelated.packageTypeList.length > 0 && formRelated.isJavaLanguage && !imageSelectState.customImage" :error="formData.packageInfo.errMsg">
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
        <el-form-item label="基础镜像" class="auto-image" prop="autoImageValue" v-if="!imageSelectState.customImage">
          <el-select v-model="formData.autoImageValue" filterable class="max-width-600"
                     :placeholder="imageInfoFromNet.autoImageList.length > 0 ? '请选择' : '无数据'">
            <el-option v-for="(item, index) in imageInfoFromNet.autoImageList"
                       :key="index" :label="item.label" :value="item.value">
              <div style="margin: 3px 0px">
                <div style="font-size: 15px; font-weight: bold; line-height: 20px;">{{ item.label }}</div>
                <div style="color: gray; font-size: 12px; line-height: 14px;">{{ item.desc }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="镜像地址" prop="customImageValue" v-else
                      :class="['custom-image', imageSelectState.customImageType.toLowerCase()+'-image']"
        >
          <el-autocomplete
                  class="inline-input max-width-500"
                  v-model="formData.customImageValue"
                  :fetch-suggestions="querySearch"
                  placeholder="请输入内容"
                  @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>

        <transition name="more-config">
          <el-form-item label="Gitlab_SSH地址" prop="gitLabAddress" class="gitlab-address"
                        v-if="!imageSelectState.customImage">
            <el-input v-model="formData.gitLabAddress" class="max-width-500"
                      placeholder="请输入项目的gitLab地址，不能超过256个字符"></el-input>
          </el-form-item>
        </transition>
        <transition name="more-config">
          <el-form-item label="Gitlab分支" prop="gitLabBranch" class="gitlab-branch"
                        v-if="!imageSelectState.customImage">
            <el-input v-model="formData.gitLabBranch" class="max-width-500"
                      placeholder="不能超过100个字符"></el-input>
          </el-form-item>
        </transition>
        <transition name="more-config">
          <el-form-item label="mainClass" prop="mainClass"
                        v-if="formRelated.isJavaLanguage && !imageSelectState.customImage && formData.packageInfo.type.toUpperCase() === 'ZIP'"
                        class="main-class max-width-600"
          >
            <el-input v-model="formData.mainClass"  class="max-width-500"
                      placeholder=""></el-input>
          </el-form-item>
        </transition>
        <transition name="more-config">
          <el-form-item label="项目根目录" prop="relativePath"
                        v-if="formRelated.isJavaLanguage && !imageSelectState.customImage"
                        class="relative-path-of-parent-pom">
            <el-input v-model="formData.relativePath" class="max-width-500"
                      placeholder="原“Gitlab父级pom.xml相对路径”字段，不能超过256个字符，不能以/开头"></el-input>
            <i class="paas-icon-question"
               v-pop-on-mouse-over="'原“Gitlab父级pom.xml相对路径”字段，用于非标准目录结构项目，填写项目根目录的相对路径，以便后续 mvn 打包使用'"></i>
          </el-form-item>
        </transition>
        <transition name="more-config">
          <el-form-item label="maven profile id" prop="mavenProfileId" class="maven-profile-id"
                        v-if="formRelated.isJavaLanguage && !imageSelectState.customImage"
          >
            <el-input v-model="formData.mavenProfileId" class="max-width-500"
                      :placeholder="`默认值为${profileInfo.nameStr},不能超过100字符`"></el-input>
          </el-form-item>
        </transition>
        <el-form-item label="VM_Options" prop="vmOptions" class="vm-options max-width-800"
                      v-if="formRelated.isJavaLanguage && !imageSelectState.customImage"
        >
          <div>
            <el-input v-model="formData.vmOptions"
                      class="max-width-600"
                      size="mini"
                      type="textarea"
                      :rows="4"
                      placeholder="不能包含中文，不能超过512个字符"
            ></el-input>
            <div style="color:#409EFF; display:flex; align-items: flex-start; cursor:pointer; font-size: 12px; line-height: 20px;">
              <span @click="handleClick($event, 'set-default-vmOptions')">帮我填</span>
              <i style="font-size:12px; line-height: 20px;" class="paas-icon-question" v-pop-on-mouse-over="'填写默认的VM_options'"></i>
            </div>
          </div>
        </el-form-item>
        <custom-slide-up-down :active="startShowMoreConfig" :duration="500" class="more-config"
                              @open-end="hasShowMoreConfig = true; scrollBottom()"
                              @close-end="hasShowMoreConfig = false; scrollBottom()">
        <el-form-item label="滚动升级" prop="rollingUpdate">
          <el-radio-group v-model="formData.rollingUpdate" :disabled="forGray">
            <el-radio :label="true">需要</el-radio>
            <el-radio :label="false">不需要</el-radio>
            <i class="paas-icon-question"
               v-pop-on-mouse-over="'滚动部署是为了实现业务的平滑上线而不中断，除了定时器外，建议其他应用都可以选用滚动部署'"></i>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="负载均衡" prop="loadBalance">
          <el-radio-group v-model="formData.loadBalance" :disabled="forGray">
            <el-radio v-for="item in loadBalanceType" :label="item" :key="item"></el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="el-form-item-group is-required health-check">
          <div class="label" style="width: 160px;">健康检查</div>
          <div class="content" style="margin-left: 160px;">
            <el-form-item :error="isSubmitClicked ? formData.healthCheck.contentCheckErrMsg : ''">
              <div class="health-check-type">
                <el-radio-group v-model="formData.healthCheck.type" :disabled="forGray">
                  <el-radio v-for="(item, index) in $storeHelper.healthCheckTypeList" :label="item.desc" :key="item.desc">{{item.label}}</el-radio>
                </el-radio-group>
                <div class="input-area">
                  <div v-if="formData.healthCheck.type == 'http'">
                    <el-input v-model="formData.healthCheck.content" class="max-width-500"
                              placeholder="以/开头，可以包含字母、数字、下划线、中划线。2-100个字符" :disabled="forGray"></el-input>
                  </div>
                  <div v-if="formData.healthCheck.type == 'shell'">
                    <el-input v-model="formData.healthCheck.content" placeholder="请填写shell指令" :disabled="forGray"></el-input>
                  </div>
                  <div v-if="formData.healthCheck.type == 'socket'">
                    <span>端口号：</span>
                    <el-input-number v-model="formData.healthCheck.content" :min="0" :max="10000" label="延迟时间" :disabled="forGray"></el-input-number>
                  </div>
                </div>
              </div>
            </el-form-item>
            <el-form-item class="health-check-more">
              <div class="initial-delay item" style="line-height: 28px">
                <span>延迟时间：</span>
                <el-input-number v-model="formData.healthCheck.initialDelay" :min="30" :max="300" label="延迟时间" :disabled="forGray"></el-input-number>
                <i class="paas-icon-question" v-pop-on-mouse-over="'单位秒。指实例启动后，多久开始探测。例如，启动延时设置为5，那么健康检查将在实例启动5秒后开始。默认值为120，范围30-300'"></i>
              </div>
              <div class="period-seconds item" style="line-height: 28px">
                <span>间隔时间：</span>
                <el-input-number v-model="formData.healthCheck.periodSeconds" :min="1" :max="10" label="间隔时间" :disabled="forGray"></el-input-number>
                <i class="paas-icon-question" v-pop-on-mouse-over="'单位秒。指健康检查的频率。例如，间隔时间设置成10，那么集群会每隔10s检查一次。默认值为5，范围1-10'"></i>
              </div>
              <div class="failure-threshold item" style="line-height: 28px">
                <span>不健康阈值：</span>
                <el-input-number v-model="formData.healthCheck.failureThreshold" :min="1" :max="10" label="不健康阈值" :disabled="forGray"></el-input-number>
                <i class="paas-icon-question" v-pop-on-mouse-over="'单位次。该参数指健康检查连续失败多少次后，才判定实例是不健康的。例如不健康阈值设置成 3，只有满足连续 3 次都探测失败了，才认为容器是不健康的。默认值为5，范围1-10'"></i>
              </div>
              <div class="timeout-seconds item" style="line-height: 28px">
                <span>响应超时：</span>
                <el-input-number v-model="formData.healthCheck.timeoutSeconds" :min="10" :max="120" label="响应超时" :disabled="forGray"></el-input-number>
                <i class="paas-icon-question" v-pop-on-mouse-over="'单位秒。指健康探测的超时时间。在这里是HTTP 请求响应超时时间。默认值为10，范围10-120'"></i>
              </div>
            </el-form-item>
          </div>
        </div>
        <el-form-item label="应用监控" prop="appMonitor" class="app-monitor" v-if="formRelated.isJavaLanguage">
          <el-radio-group v-model="formData.appMonitor" size="mini" v-if="profileUtils" :disabled="forGray">
            <el-radio v-for="item in profileUtils.appMonitorList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
          </el-radio-group>
          <span style="display: inline; margin-left: 10px; color: #E6A23C; font-size: 12px; line-height: 14px; cursor: pointer; padding: 1px; border: 1px solid #E6A23C; border-radius: 4px; word-break: normal"
                @mouseenter="handleClick($event, 'warning-app-monitor')" v-if="false"
          >{{profileUtils['warningList']['warning-app-monitor']['text']}}</span>
        </el-form-item>
        <el-form-item label="CPU" prop="cpuId" class="cpu">
          <el-radio-group v-model="formData.cpuId" size="mini" :disabled="forGray">
            <el-radio-button v-for="item in cpuAndMemoryList" :label="item.id" :key="item.id">
              {{item.cpu}}核
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内存" prop="memoryId" class="memory">
          <el-radio-group v-model="formData.memoryId" size="mini" :disabled="forGray">
            <el-radio-button v-for="item in memorySizeList" :label="item.id" :key="item.id">
              {{item.memory}}G
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="实例数量" prop="instanceCount" class="instance-count" v-if="!forGray">
          <el-input-number v-model="formData.instanceCount" :min="1" label="描述文字" :disabled="forGray"></el-input-number>
        </el-form-item>
        <el-form-item label="过期时间(天)" prop="remainExpiredDays" class="expired-days" v-if="!formRelated.isProductionProfile">
          <el-input-number v-model="formData.remainExpiredDays" :min="1" :max="365" :disabled="forGray"></el-input-number>
          <i class="paas-icon-question" v-pop-on-mouse-over="'服务的实例将在指定时间后被删除，最大值为一年'"></i>
        </el-form-item>
          <el-form-item label="环境变量设置" prop="environments" class="environments" :error="formItemMsgForEnvironments">
            <div class="el-row title">
              <div class="el-col el-col-7 key">Key</div>
              <div class="el-col el-col-7 value">Value</div>
              <div class="el-col el-col-8 remark">备注</div>
              <div class="el-col el-col-2" style="text-align: center">
                <i class="paas-icon-question"
                   v-pop-on-mouse-over="['容器运行前设置的环境变量', '如env中的Name：string（环境变量名称），Value：string（环境变量的值）']"></i>
              </div>
            </div>
            <el-row class="content"
                    v-for="(item, index) in formData.environments"
                    :key="item.key"
            >
              <el-col :span="7" class="key">{{item.key}}</el-col>
              <el-col :span="7" class="value">{{item.value}}</el-col>
              <el-col :span="8" class="remark">{{item.remark}}</el-col>
              <el-col :span="2" class="delete" v-if="!forGray">
                <i class="paas-icon-close" @click="handleEnvironment('delete', index)"></i>
              </el-col>
            </el-row>
            <el-row class="add-key-value" v-if="!forGray">
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
          <el-form-item label="Host配置" prop="hosts" class="hosts" :error="formItemMsgForHosts">
            <div class="el-row title">
              <div class="el-col el-col-11 key">IP</div>
              <div class="el-col el-col-11 value">域名</div>
              <div class="el-col el-col-2" style="text-align: center">
                <i class="paas-icon-question" v-pop-on-mouse-over="'该Host为/etc/hosts，配置主机名和IP地址。如：192.168.1.10 finup100'"></i>
              </div>
            </div>
            <el-row class="content"
                    v-for="(item, index) in formData.hosts"
                    :key="item.key"
            >
              <el-col :span="11" class="key">{{item.ip}}</el-col>
              <el-col :span="11" class="value">{{item.domain}}</el-col>
              <el-col :span="2" class="delete" v-if="!forGray">
                <i class="paas-icon-close" @click="handleHost('delete', index)"></i>
              </el-col>
            </el-row>
            <el-row class="add-key-value" v-if="!forGray">
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
          <el-form-item label="jacoco" v-if="!formRelated.isProductionProfile">
            <el-radio-group v-model="formData.enableJacoco" :disabled="forGray">
              <el-radio :label="true">需要</el-radio>
              <el-radio :label="false">不需要</el-radio>
              <div style="display: inline-block; margin-left: 6px;">
                <i class="paas-icon-question" v-pop-on-mouse-over="'如果开启jacoco，则端口映射的目标端口固定为：8144，Pipeline启动的实例数量强制设为1'"></i>
              </div>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="端口映射" class="port-map" v-if="!formRelated.isProductionProfile" :error="formData.portMap.errMsg">
            <div class="el-row title">
              <div class="el-col el-col-6">
                <span>访问端口</span>
                <i class="paas-icon-question" v-if="formData.portMap.update" v-pop-on-mouse-over="['访问端口的范围在40000~59999之间']"></i>
                <i class="paas-icon-question" v-else v-pop-on-mouse-over="['访问端口由后端自动生成', '服务创建成功后，可以进行修改']"></i>
              </div>
              <div class="el-col el-col-2" style="min-height:1px"></div>
              <div class="el-col el-col-6">目标端口</div>
              <div class="el-col el-col-2">协议</div>
            </div>
            <el-row class="content">
              <el-col :span="6">
                <el-input placeholder="如40002" size="mini" :disabled="!this.formData.portMap.update || forGray" v-model="formData.portMap.outerPort"></el-input>
              </el-col>
              <el-col :span="2">--></el-col>
              <el-col :span="6">
                <el-input placeholder="如8100" size="mini" :disabled="formData.enableJacoco || forGray" v-model="formData.portMap.containerPort"></el-input>
              </el-col>
              <el-col :span="2">TCP</el-col>
              <div class="el-col el-col-2">
                <i class="paas-icon-question" v-pop-on-mouse-over="'端口映射的内网访问域名为：galaxy.autotest.beta'"></i>
              </div>
            </el-row>
          </el-form-item>
          <el-form-item label="服务停止期限" prop="terminationGracePeriodSeconds"class="terminationGracePeriodSeconds">
            <el-input v-model="formData.terminationGracePeriodSeconds" class="max-width-500"
                      placeholder="10-300之间的整数，单位：秒" :disabled="forGray"></el-input>
            <i class="paas-icon-question" v-pop-on-mouse-over="'从触发容器删除请求到完成删除的宽限时间，这是一种容器钩子，在该钩子对应的hook handler 完成后不论执行的结果如何， Docker daemon会发送一个SIGTERN信号量给Docker daemon来删除该容器，默认30秒'"></i>
          </el-form-item>
          <el-form-item label="prestop脚本" prop="preStopExec"
                        class="preStopExec">
            <el-input v-model="formData.prestopCommand" class="max-width-500"
                      placeholder="例如：echo hello world !" :disabled="forGray"></el-input>
          </el-form-item>
          <el-form-item label="volume"
                        prop="volume"
                        class="volume"
                        v-if="$storeHelper.getUserInfo('role') == '平台管理员'">
            <el-input v-model="formData.volume" class="max-width-500" :disabled="forGray"></el-input>
          </el-form-item>
          <el-form-item label="subPath"
                        prop="subPath" class="subPath"
                        v-if="$storeHelper.getUserInfo('role') == '平台管理员'">
            <el-input v-model="formData.subPath" class="max-width-500" :disabled="forGray"></el-input>
          </el-form-item>
          <el-form-item label="claimName"
                        prop="claimName" class="claim"
                        v-if="$storeHelper.getUserInfo('role') == '平台管理员'">
            <el-input v-model="formData.claimName" class="max-width-500" :disabled="forGray"></el-input>
          </el-form-item>
        </custom-slide-up-down>
        <el-form-item label="用户须知" prop="agree" v-if="profileInfo && formRelated.isProductionProfile && !forGray">
          <el-checkbox v-model="formData.agree">
            <span style="display: inline-block;">已知晓：</span>
          </el-checkbox>
          <div style="display: inline-block; font-size: 12px; line-height: 18px; vertical-align: top;">
            <div>生产环境初次上线前需提交<a href="http://wiki.puhuitech.cn/pages/viewpage.action?pageId=28733856" target="_blank">生产准备就绪评审（PRR）</a>到paas.list@finupgroup.com；</div>
            <div>非生产环境可自助上线。</div>
          </div>
        </el-form-item>
        <el-form-item class="expand">
          <div class="more" @click="startShowMoreConfig = !startShowMoreConfig;">
            <span v-if="hasShowMoreConfig">收起更多配置</span><span v-else>更多配置</span>
            <i :class="hasShowMoreConfig?'el-icon-arrow-up':'el-icon-arrow-down'"></i>
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
</template>

<style lang="scss">
  #service-add {
    .el-form {
      .el-form-item {
        .el-form-item__label {
          font-weight: bold;
        }
        &.health-check-more {
          .el-form-item__content {
            display: block;
            .item {
              width: 300px;
              display: inline-block;
            }
          }
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
            line-height: 24px;
            text-align: center;
            .more {
              margin: 0px -20px;
              font-size: 14px;
              line-height: 24px;
              /*background-color: #eee;*/
              background-color: #F2F6FC;
              &:hover {
                /*background-color: #ddd;*/
                background-color: #EBEEF5;
                cursor: pointer;
              }
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #service-add {
    height: 100%;
    width: 100%;
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
    .sheet {
      background-color: white;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
      margin: 10px;
      padding: 10px 20px;
      max-width: 900px;
      box-sizing: border-box;
      .paas-icon-question {
        font-size: 12px;
        color: #E6A23C;
      }
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
        .paas-icon-close {
          color: #aaa;
          font-size: 14px;
          &:hover {
            color: gray;
          }
        }
        .el-form-item-group {
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
            .el-select {
              width: 100%;
            }
          }
          &.profile-description {
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
                font-size: 14px;
                line-height: 18px;
              }
              .delete {
                float: right;
                display: flex;
                justify-content: space-around;
                height: 18px;
                .paas-icon-close {
                  font-size: 12px;
                  line-height: 18px;
                }
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
  import profileUtils from '../../utils/app-props';
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    mixins: [commonUtils],
    async created() {
      // profileUtils will be used in template
      this.profileUtils = profileUtils;
      var dataTransfer = this.$storeHelper.dataTransfer;

      const path = this.$route['path'];
      var profileInfo = null;
      var serviceInfo = null;

      try {
        if (this.$router.helper.pages['/profile/service/:id(\\d+)/gray/add'].pathReg.test(path)) {
          this.forAdd = true;
          serviceInfo = await this.getServiceById(this.$route.params['id']);
          profileInfo = this.$storeHelper.getProfileInfoByID(serviceInfo.spaceId);
          const routeConfig = this.$router.helper.getConfigByFullPath('/profile/service/:id(\\d+)');
          if (routeConfig) {
            routeConfig.name = `${serviceInfo.appName}/${profileInfo.description}`;
          }
        } else
        if (this.$router.helper.pages['/profile/service/:id(\\d+)/gray/modify'].pathReg.test(path)) {
          this.forModify = true;
          serviceInfo = await this.getServiceById(this.$route.params['id']);
          profileInfo = this.$storeHelper.getProfileInfoByID(serviceInfo.spaceId);
          const routeConfig = this.$router.helper.getConfigByFullPath('/profile/service/:id(\\d+)');
          if (routeConfig) {
            routeConfig.name = `${serviceInfo.appName}/${profileInfo.description}`;
          }
        } else
        if (this.$router.helper.pages['/profile/service/modify'].pathReg.test(path)) {
          this.forModify = true;
          // try to get appId and profileId from location.search
          if (!dataTransfer && location.search) {
            dataTransfer = {
              data: this.$utils.parseQueryString(location.search)
            };
          }
          if (!this.$utils.hasProps(dataTransfer.data, 'appId', 'profileId')) {
            throw new Error('信息不完整');
          }
          profileInfo = this.$storeHelper.getProfileInfoByID(dataTransfer.data.profileId);
          serviceInfo = await this.getServiceByAppIdAndSpaceId(dataTransfer.data.appId, dataTransfer.data.profileId);
        } else
        if (this.$router.helper.pages['/profile/service/add'].pathReg.test(path)) {
          this.forAdd = true;
          if (!this.$utils.hasProps(dataTransfer.data, 'serviceBasicInfo', 'profileId')) {
            throw new Error('信息不完整');
          }
          profileInfo = this.$storeHelper.getProfileInfoByID(dataTransfer.data.profileId);
          serviceInfo = dataTransfer.data.serviceBasicInfo;
        } else
        if (this.$router.helper.pages['/profile/service/copy'].pathReg.test(path)) {
          this.forCopy = true;
          if (!this.$utils.hasProps(dataTransfer.data, 'appId', 'profileId', 'notServiceSpaceList')) {
            throw new Error('信息不完整');
          }
          profileInfo = this.$storeHelper.getProfileInfoByID(dataTransfer.data.profileId);
          serviceInfo = await this.getServiceByAppIdAndSpaceId(dataTransfer.data.appId, dataTransfer.data.profileId);
        }

        this.from = dataTransfer ? dataTransfer.from : null;
        this.formData.spaceId = profileInfo.id;
        if (this.forCopy) {
          this.formData.spaceId = dataTransfer.data.notServiceSpaceList[0];
          let appInfo = this.$storeHelper.getAppInfoByID(serviceInfo.appId);
          this.formRelated.profileList = appInfo['app']['profileList'].filter(it => {
            return dataTransfer.data.notServiceSpaceList.indexOf(it.id) > -1;
          });
        }
        // NOTICE: 修改/添加服务中的初始化参数都是从服务列表传递过来的
        if (this.forModify || this.forCopy || this.forGray) {
          if (!serviceInfo) {
            throw new Error('serviceInfo is null');
          }
          // NOTICE: the sequence of initialize should not change
          this.formRelated.languageInfo = serviceInfo.language;
          this.formData.appId = serviceInfo.appId;
          this.formData.gitLabAddress = serviceInfo.gitLabAddress;
          this.formData.gitLabBranch = serviceInfo.gitLabBranch;
          this.formData.appMonitor = serviceInfo.appMonitor;
          this.formData.mainClass = serviceInfo.mainClass;
          this.formData.relativePath = serviceInfo.relativePath;
          this.formData.mavenProfileId = serviceInfo.mavenProfileId;
          this.formData.vmOptions = serviceInfo.vmOptions;
          this.formData.instanceCount = serviceInfo.instanceNum;
          this.formData.environments = serviceInfo.environments;
          this.formData.hosts = serviceInfo.hosts;
          this.formData.prestopCommand = serviceInfo.prestopCommand;
          this.formData.terminationGracePeriodSeconds = serviceInfo.terminationGracePeriodSeconds;
          this.formData.cpuId = serviceInfo.cpuInfo.id;
          this.formData.memoryId = serviceInfo.memoryInfo.id;
          this.formData.rollingUpdate = serviceInfo.rollingUpdate;
          this.formData.volume = serviceInfo.volume;
          this.formData.subPath = serviceInfo.subPath;
          this.formData.claimName = serviceInfo.claimName;
          this.formData.enableJacoco = serviceInfo.enableJacoco;
          this.formData.remainExpiredDays = serviceInfo.remainExpiredDays;
          // NOTICE: healthCheck should set after mounted
          this.$nextTick(() => {
            this.formData.healthCheck = serviceInfo.healthCheck;
          });
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
          if (serviceInfo.portMap.outerPort && serviceInfo.portMap.outerPort !== ""
            && serviceInfo.portMap.action && serviceInfo.portMap.action !== 'del') {
            this.formData.portMap.outerPort = serviceInfo.portMap.outerPort;
            this.formData.portMap.containerPort = serviceInfo.portMap.containerPort;
            this.formData.portMap.update = true;
          }
        } else {
          // forAdd
          this.imageSelectState.customImage = false;
          //Production appMonitor environment is selected by default
          if (serviceInfo.isJavaLanguage && profileInfo && profileInfo.spaceType.toUpperCase() !== 'PRODUCTION') {
            this.formData.appMonitor = profileUtils.appMonitorList[1].id;
          }
          // use this.$nextTick for correct performance of this.formData.healthCheck.contentCheckErrMsg used in el-form-item :error
          this.$nextTick(() => {
            this.formData.healthCheck.type = this.$storeHelper.defaultHealthCheckTypeDesc;
            this.formData.healthCheck.content = '';
          });

          this.formData.appId = serviceInfo['appId'];
//        this.formData.packageInfo.type = this.packageTypeList[0].type;
          // set default cpu, default memorySizeList will be set in watch
          if (Array.isArray(this.cpuAndMemoryList) && this.cpuAndMemoryList.length > 0) {
            const firstItem = this.cpuAndMemoryList[0];
            this.formData.cpuId = 'cpu' in firstItem ? firstItem.id : '';
          }
        }
        this.profileInfo = profileInfo;
        this.serviceInfo = serviceInfo;
      } catch (err) {
        console.log(err);
        this.$message.error(err.message);
        this.$router.replace(this.$router.helper.pages['profile/service/list']);
      }
      this.rules.imageLocation.required = false;
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

        type: '', // 页面类型：add/modify/copy
        forModify: false,
        forCopy: false,
        forAdd: false,
        forGray: true,
        versionList: [],
        // （复制服务传递过来的）属性是否已经使用过
        propsUsed: {
          memoryId: false,
          customImageValue: false,
          autoImageValue: false
        },
        from: null,
        // 运行环境信息
        profileInfo: null,
        // 服务详情
        serviceInfo: null,
        formRelated: {
          serviceInfo: null,
          // 复制服务时，可以选择的运行环境列表
          profileList: [],
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

        formData: {
          appId: null,
          spaceId: null,
          serviceVersion: '',
          gitLabAddress: '',
          gitLabBranch: '',
          // 只有zip包需要填mainClass，且必须要填
          mainClass: '',
          relativePath: '',
          appMonitor: profileUtils.defaultAppMonitorId,
          vmOptions: '',
          mavenProfileId: '',
          cpuId: '',
          memoryId: '',
          environments: [],
          hosts: [],
          instanceCount: 1,
          remainExpiredDays: this.$storeHelper.globalConfig['defaultExpiredDays'],
          customImage: false,
          imageLocation: '',
          // value of autoImage
          autoImageValue: '',
          // value of customImage
          customImageValue: '',
          volume:'',
          subPath:'',
          claimName:'',
          enableJacoco: false,
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
          terminationGracePeriodSeconds:'',
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
        startShowMoreConfig: false,
        hasShowMoreConfig: false,
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
          // custom image or not，注意customImage的变化，会触发requestImageRelatedInfo，故默认设置为null
          customImage: null,
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
      title() {
        var result = '';
        if (this.forGray) {
          if (this.forModify) {
            result = '修改灰度版本';
          } else if (this.forAdd) {
            result = '创建灰度版本';
          }
        } else {
          if (this.forModify) {
            result = '修改配置';
          } else if (this.forCopy) {
            result = '复制服务';
          } else if (this.forAdd) {
            result = '创建服务';
          }
        }
        return result;
      }
    },
    watch: {
      // TODO: not used
      // 依赖appId的属性：serviceInfo, isJavaLanguage, isPythonLanguage, packageTypeList, this.formData.packageInfo.type
      'formData.appId': function (appId) {
        // 不论来自哪个页面，serviceInfo都会被带过来
        const serviceInfo = this.serviceInfo;

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
      },
      'imageSelectState.customImage': function(customImage) {
        if (customImage === true) {
          this.requestImageRelatedInfo(true);
        } else if (customImage === false) {
          this.requestImageRelatedInfo(false);
        }
      },
      'formData.packageInfo.type': {
        immediate: false,
        handler(type) {
          this.updateMainClassRequiredByPackageType(type);
          this.requestImageRelatedInfo(false, type);
        }
      },
      'formData.enableJacoco': {
        immediate: true,
        handler (useJacoco) {
          // 如果开启jacoco，则端口映射的目标端口只能为8144
          if (useJacoco) {
            this.formData.portMap.containerPort = 8144;
          } else {
            this.formData.portMap.containerPort = '';
          }
        }
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
            }).indexOf(this.serviceInfo.memoryInfo.id) > -1) {
              this.formData.memoryId = this.serviceInfo.memoryInfo.id;
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
        if (this.formData.portMap.syntaxErrMsg || this.formData.portMap.outerPort === this.serviceInfo.portMap.outerPort) {
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
    },
    methods: {
      updateMainClassRequiredByPackageType(type) {
        // 对于ZIP打包，把输入项“mainClass”设为必输项
        try {
          if (type === 'ZIP') {
            this.rules['mainClass'][0].required = true;
          } else {
            this.rules['mainClass'][0].required = false;
          }
        } catch (err) {
          this.rules['mainClass'][0].required = false;
        }
        // console.log(this.rules.mainClass);
      },

      // 得到服务所属
      async getServiceByAppIdAndSpaceId(appId, profileId) {
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {
          payload: {
            appId: appId,
            spaceId: profileId
          }
        });
        if (!resContent.hasOwnProperty('applicationServerList') && !Array.isArray(resContent['applicationServerList'])) {
          throw new Error('数据格式不正确');
        }
        const serviceInfo = this.$net.getServiceModel(resContent['applicationServerList'][0]);
        return serviceInfo;
      },
      async getServiceById(serviceId) {
        var mainServiceInfo = await this.$net.requestPaasServer(this.$net.URL_LIST.service_by_id, {
          params: {
            id: serviceId
          }
        });
        if (this.forGray && this.forModify) {
          var canaryServiceInfo = (await this.$net.requestPaasServer(this.$net.URL_LIST.service_gray_list, {
            query: {
              configId: serviceId
            }
          }))['canary'];
          ['customImage', 'image', 'gitLabAddress', 'gitLabBranch'].forEach(key => {
            mainServiceInfo[key] = canaryServiceInfo[key];
          });
        }
        const serviceModel = this.$net.getServiceModel(mainServiceInfo);
        if (this.forGray && this.forModify) {
          serviceModel['canaryId'] = canaryServiceInfo['id'];
        }
        return serviceModel;
      },
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
            }, 10);
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

      /**
       * get image related info from network
       * @param {customImage} customImage = this.imageSelectState.customImage
       * @param {packageType} packageType for autoImage
       */
      async requestImageRelatedInfo(customImage, packageType) {
        if (!packageType) {
          packageType = this.formData.packageInfo.type;
        }
        try {
          const groupTag = this.groupInfo.tag;
          const appId = this.formData.appId;
          const spaceId = this.formData.spaceId;

          var payload = {};
          var resContent = null;
          var imageList = [];
          if (customImage) {
            this.imageInfoFromNet['customImageList'] = [];
            payload = {
              groupTag,
              appId,
              spaceId
            };
            resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.custom_image_list, {
              payload
            });
            imageList = resContent;
            this.imageInfoFromNet['customImageList'] = resContent;
          } else {
            if (!packageType) {
              return;
            }
            this.imageInfoFromNet['autoImageList'] = [];
            payload = {
              groupTag,
              appId,
              language: this.formRelated.languageInfo.type,
              languageVersion: this.formRelated.languageInfo.version,
              packageType: packageType,
            };
            resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.auto_image_list, {
              payload
            });
            this.imageInfoFromNet['autoImageList'] = resContent['basicImage'].map(it => {
              return {
                label: it.name,
                value: it.name,
                desc: it.desc
              }
            });
          }

          // override default value by serviceInfo passed
          if (this.forModify || this.forCopy) {
            // set default value by passedData if necessary
            const serviceInfo = this.serviceInfo;
            if (serviceInfo && serviceInfo.image.hasOwnProperty('customImage') && serviceInfo.image.customImage != 'has-used') {
              if (serviceInfo.image.customImage === true) {
                // 自定义镜像
                // if (!this.propsUsed.customImageValue && customImageList.indexOf(serviceInfo.image.location) > -1) {
                //   this.formData.customImageValue = serviceInfo.image.location;
                //   this.propsUsed.customImageValue = true;
                // }
                //因为从harbor得到数据不稳定，所以直接赋值，不需要匹配
                this.formData.customImageValue = serviceInfo.image.location;
                this.propsUsed.customImageValue = true;
              } else if (serviceInfo.image.customImage === false) {
                // 自动打镜像
                // if (!this.propsUsed.autoImageValue && autoImageList.indexOf(serviceInfo.image.location) > -1) {
                //   this.formData.autoImageValue = serviceInfo.image.location;
                //   this.propsUsed.autoImageValue = true;
                // }
                this.formData.autoImageValue = serviceInfo.image.location;
                this.propsUsed.autoImageValue = true;
              }
              // serviceInfo.image passed used only once
              serviceInfo.image.customImage = 'has-used';
            }
          }

          // set default value for this.formData.autoImageValue
          if (!this.imageSelectState.customImage &&  !this.imageInfoFromNet.autoImageList.find(it => this.formData.autoImageValue === it.label)) {
            this.formData.autoImageValue = this.imageInfoFromNet.autoImageList[0].label;
          }

          // not set default value for customImageValue
          var customImageList = this.imageInfoFromNet['customImageList'];
          if (customImageList.length > 0 && false) {
            if (customImageList.indexOf(this.formData.customImageValue) === -1) {
              this.formData.customImageValue = customImageList[0];
            }
          }
        } catch (err) {
          console.log(err);
          this.$message.error(err.message);
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
        const targetUrl = this.$router.helper.pages['/profile/service/:id(\\d+)/gray'].toPath({
          id: this.serviceInfo.id
        });
        this.$router.push(targetUrl);
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
          // TODO: not used
          case 'more-config':
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
              if (this.formData.healthCheck.contentCheckErrMsg && !this.forGray) {
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
                  orchId: this.serviceInfo.orchId,
                  orchIP: this.serviceInfo.orchIP,
                  gitLabAddress: formData.gitLabAddress,
                  gitLabBranch: formData.gitLabBranch,
                  mainClass: formData.mainClass,
                  relativePath: formData.relativePath,
                  vmOptions: formData.vmOptions,
                  appMonitor: formData.appMonitor,
                  mavenProfileId: formData.mavenProfileId,
                  rollingUpdate: formData.rollingUpdate,
                  loadBalance: formData.loadBalance,
                  initialDelaySeconds: formData.healthCheck.initialDelay,
                  periodSeconds: formData.healthCheck.periodSeconds,
                  failureThreshold: formData.healthCheck.failureThreshold,
                  timeoutSeconds: formData.healthCheck.timeoutSeconds,
                  cpuId: formData.cpuId,
                  memoryId: formData.memoryId,
                  environments: formData.environments,
                  hosts: formData.hosts,
                  instanceNum: formData.instanceCount,
                  customImage: formData.customImage,
                  image: formData.imageLocation,
                  prestopCommand: formData.prestopCommand,
                  terminationGracePeriodSeconds:formData.terminationGracePeriodSeconds,
                  packageType: formData.packageInfo.type,
                  buildName: formData.packageInfo.name,
                  volume: formData.volume,
                  subPath: formData.subPath,
                  claimName: formData.claimName,
                  enableJacoco: formData.enableJacoco
                };
                if (this.forGray) {
                  if (this.forAdd) {
                    payload['configId'] = this.serviceInfo.id;
                  } else if (this.forModify) {
                    payload['configId'] = this.serviceInfo.id;
                    payload['id'] = this.serviceInfo.canaryId;
                  }
                } else {
                  payload.portsMapping = [{
                    protocol: formData.portMap.protocol,
                    outerPort: formData.portMap.outerPort,
                    containerPort: formData.portMap.containerPort,
                  }];
                  if (this.formRelated.isProductionProfile) {
                  } else {
                    payload.expiredDays = this.formData.remainExpiredDays;
                  }
                  if (this.forModify) {
                    payload["id"] = this.serviceInfo.id;
                    payload.portsMapping[0]["id"] = this.serviceInfo.portMap.id;
                    payload["serviceName"] = this.serviceInfo.serviceName;
                  }
                  if (this.$storeHelper.groupVersion !== 'v1') {
                    if (this.forModify) {
                      payload["serviceVersion"] = this.serviceInfo.serviceVersion;
                    } else {
                      payload["serviceVersion"] = 'default';
                    }
                  } else {
                    payload["serviceVersion"] = null;
                  }
                  payload.healthCheckType = this.$storeHelper.getHealthCheckTypeKeyByDesc(formData.healthCheck.type);
                  payload.healthCheck = formData.healthCheck.content;
                }
                this.addToWaitingResponseQueue('submit');
                this.loadingText = '正在为您创建服务';
                const url = this.forGray ? (this.forModify ? this.$net.URL_LIST.service_gray_update : this.$net.URL_LIST.service_gray_create) : (this.forModify ? this.$net.URL_LIST.service_update : this.$net.URL_LIST.service_create);
                this.$net.requestPaasServer(url, {
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
