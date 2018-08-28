<template>
  <div id="service-add">
    <div class="sheet">
      <div class="section-title">添加服务</div>
      <el-form :model="serviceForm" ref="serviceForm"
               :rules="rules" :label-width="appLanguage == 'JAVA' ? '200px' : '140px'" size="mini"
               v-loading="showLoading"
               :element-loading-text="loadingText">
        <el-form-item label="应用名称" class="app-name">
          {{appName}}
        </el-form-item>
        <el-form-item label="运行环境" class="profile-description" v-if="type==='add'">
          {{profileInfo? profileInfo.description: ''}}
        </el-form-item>
        <el-form-item label="运行环境" class="profile-description" v-if="type==='copy'">
          <el-select v-model="serviceForm.spaceId" placeholder="请选择" style="display:block; max-width: 200px;">
            <el-option v-for="item in profileListOfGroup" :key="item.id" :label="item.description" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本号" class="service-version"
                      :required="true"
                      :error="errorMsgForVersion">
          <el-input v-model="serviceForm.serviceVersion" placeholder="版本号只能包含数字，不能超过五位">
            <template slot="prepend">V</template>
          </el-input>
        </el-form-item>
        <el-form-item label="镜像方式" prop="customImage" class="custom-image">
          <el-radio-group v-model="imageSelectState.customImage" size="mini">
            <el-radio :label="false" v-if="appLanguage != 'PYTHON'">自动打镜像</el-radio>
            <el-radio :label="true">自定义镜像</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="基础镜像" class="auto-image" prop="autoImageValue" v-if="!imageSelectState.customImage">
          <el-select v-model="serviceForm.autoImageValue"
                     :placeholder="imageInfoFromNet.autoImageList.length > 0 ? '请选择' : '无数据'">
            <el-option v-for="(item, index) in imageInfoFromNet.autoImageList"
                       :key="index" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="镜像地址" prop="customImageValue" v-else
                      :class="['custom-image', imageSelectState.customImageType.toLowerCase()+'-image']"
        >
          <el-input v-model="serviceForm.customImageValue" placeholder="输入镜像地址，包含版本"></el-input>
          <!--<el-select v-model="imageSelectState.customImageType">-->
            <!--<el-option v-for="(item, index) in customImageTypeList"-->
                       <!--:key="index" :label="item.label" :value="item.value"></el-option>-->
          <!--</el-select>-->
          <!--<el-select v-model="serviceForm.customImageValue" v-if="imageSelectState.customImageType=='ENV'"-->
                     <!--:placeholder="imageInfoFromNet.customEnvImageList.length > 0 ? '请选择' : '无数据'">-->
            <!--<el-option v-for="(item, index) in imageInfoFromNet.customEnvImageList"-->
                       <!--:key="index" :label="item.imageName" :value="item.imageName">-->
            <!--</el-option>-->
          <!--</el-select>-->
          <!--<el-select v-model="imageSelectState.currentPrivateApp" v-if="imageSelectState.customImageType=='PRIVATE'"-->
                     <!--:placeholder="imageInfoFromNet.privateAppList.length > 0 ? '请选择' : '无数据'">-->
            <!--<el-option v-for="(item, index) in imageInfoFromNet.privateAppList"-->
                       <!--:key="index" :label="item" :value="item">-->
            <!--</el-option>-->
          <!--</el-select>-->
          <!--<el-select v-model="serviceForm.customImageValue" v-if="imageSelectState.customImageType=='PRIVATE'"-->
                     <!--:placeholder="currentPrivateAppVersionList.length > 0 ? '请选择' : '无数据'">-->
            <!--<el-option v-for="(item, index) in currentPrivateAppVersionList"-->
                       <!--:key="index" :label="item" :value="item">-->
            <!--</el-option>-->
          <!--</el-select>-->
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
          <el-form-item label="Gitlab父级pom.xml相对路径" prop="relativePathOfParentPOM"
                        v-if="appLanguage == 'JAVA' && !imageSelectState.customImage"
                        class="relative-path-of-parent-pom"
          >
            <el-input v-model="serviceForm.relativePathOfParentPOM"
                      placeholder="不能超过256个字符"></el-input>
          </el-form-item>
        </transition>
        <transition name="more-config">
          <el-form-item label="maven profile id" prop="mavenProfileId" class="maven-profile-id"
                        v-if="appLanguage == 'JAVA' && !imageSelectState.customImage"
          >
            <el-input v-model="serviceForm.mavenProfileId" placeholder="不能超过100个字符"></el-input>
          </el-form-item>
        </transition>
        <el-form-item label="VM_Options" prop="vmOptions" class="vm-options"
                      v-if="appLanguage == 'JAVA'"
        >
          <el-input v-model="serviceForm.vmOptions" placeholder="不能包含中文，不能超过512个字符"></el-input>
        </el-form-item>
        <el-form-item label="应用监控" prop="appMonitor" class="app-monitor" v-if="false">
          <el-radio-group v-model="serviceForm.appMonitor" size="mini" v-if="appPropUtil">
            <el-radio v-for="item in appPropUtil.appMonitorList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
          </el-radio-group>
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

        <transition name="more-config">
          <el-form-item label="环境变量设置" prop="environments" class="environments" :error="formItemMsgForEnvironments"
                        v-if="showMoreConfig">
            <div class="el-row title">
              <div class="el-col el-col-11 key">Key</div>
              <div class="el-col el-col-11 value">Value</div>
              <div class="el-col el-col-2" style="text-align: center">
                <el-tooltip slot="trigger" effect="dark" placement="bottom">
                  <div slot="content">
                    <div>容器运行前设置的环境变量。如env中的Name：string（环境变量名称），Value：string（环境变量的值）</div>
                  </div>
                  <span><i class="el-icon-question" style="color: #E6A23C"></i></span>
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
                  <span><i class="el-icon-question" style="color: #E6A23C"></i></span>
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
        <transition name="more-config">
          <el-form-item label="端口映射" class="port-map" v-if="true && showMoreConfig" :error="errMsgForPortMap">
            <div class="el-row title">
              <div class="el-col el-col-10">
                <span>访问端口</span>
                <el-tooltip slot="trigger" effect="dark" placement="top">
                  <div slot="content">
                    <div>访问端口的范围在40000~60000之间</div>
                  </div>
                  <span><i class="el-icon-question" style="color:#E6A23C"></i></span>
                </el-tooltip>
              </div>
              <div class="el-col el-col-2" style="min-height:1px"></div>
              <div class="el-col el-col-10">目标端口</div>
              <div class="el-col el-col-2">协议</div>
            </div>
            <el-row class="content">
              <el-col :span="10">
                <el-input placeholder="如40002" size="mini" v-model="serviceForm.portMap.outerPort"></el-input>
              </el-col>
              <el-col :span="2">--></el-col>
              <el-col :span="10">
                <el-input placeholder="如8100" size="mini" v-model="serviceForm.portMap.containerPort"></el-input>
              </el-col>
              <el-col :span="2">TCP</el-col>
            </el-row>
          </el-form-item>
        </transition>
        <el-form-item class="expand">
          <div class="more" @click="handleClick('more-config')">
            <span v-if="showMoreConfig">收起更多配置</span><span v-else>更多配置</span>
            <i :class="showMoreConfig?'el-icon-arrow-up':'el-icon-arrow-down'"></i>
          </div>
        </el-form-item>

      </el-form>
      <div class="section-footer">
        <div class="item">
          <el-button type="primary" size="mini"
                     :loading="statusOfWaitingResponse('submit')"
                     @click="handleClick('submit')">完&nbsp成</el-button>
        </div>
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleClick('back')">关&nbsp闭</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  #service-add {
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
      margin: 15px;
      padding: 10px 20px;
      width: 80%;
      max-width: 900px;
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
        .el-form-item {
          &.app-name {
            margin-bottom: 8px;
          }
          &.profile-description {
            margin-bottom: 10px;
          }
          &.auto-image {
            max-width: 600px;
            .el-select {
              width: 100%;
            }
          }
          &.custom-image {
            max-width: 600px;
            &.env-image {
              .el-select {
                width: calc(50% - 2px);
              }
            }
            &.private-image {
              .el-select {
                box-sizing: border-box;
                width: calc(50% - 2px);
                &:nth-child(3) {
                  width: 100%;
                }
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
          &.vm-options {
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
  import appPropUtil from '../utils/app-props';
  const debug = browserDebug('pass-fe:profile/service/add');
  import commonUtils from '$components/mixins/common-utils';
  export default {
    mixins: [commonUtils],
    created() {
      // appPropUtil will be used in template
      this.appPropUtil = appPropUtil;

      const dataTransfer = this.$storeHelper.dataTransfer;
      if (!dataTransfer) {
        this.$router.go(-1);
        return;
      }
//      console.log(dataTransfer);
      this.type = dataTransfer['type'];
      const theData = dataTransfer.data;
      this.dataPassed = theData;
      this.serviceForm.appId = theData.appId;
      this.serviceForm.spaceId = theData.profileId;
      this.appName = theData.appName;
      this.appLanguage = theData.language;
      if (this.type === 'copy') {
        this.serviceForm.gitLabBranch = theData.gitLabBranch;
        this.imageSelectState.customImage = theData.customImage;
        if(theData.customImage){
          this.serviceForm.customImageValue = theData.imageLocation;
        } else {
          // set after requestImageRelatedInfo
          // this.serviceForm.autoImageValue = theData.imageLocation;
        }
        this.serviceForm.gitLabAddress = theData.gitLabAddress;
        this.serviceForm.relativePathOfParentPOM = theData.relativePath;
        this.serviceForm.mavenProfileId = theData.mavenProfileId;
        this.serviceForm.vmOptions = theData.vmOptions;
        this.serviceForm.instanceCount = theData.instanceNum;
        this.serviceForm.environments = theData.environments;
        this.serviceForm.hosts = theData.hosts;
        this.serviceForm.cpuID = theData.cpuID;
      } else {
        // set default cpu, default memorySizeList will be set in watch
        if (Array.isArray(this.cpuAndMemoryList) && this.cpuAndMemoryList.length > 0) {
          let firstItem = this.cpuAndMemoryList[0];
          this.serviceForm.cpuID = 'cpu' in firstItem ? firstItem.id : '';
        }
      }

      this.rules.imageLocation.required = false;
    },
    mounted() {
      this.setDebounce();
    },
    data() {
      return {
        environmentKey: '',
        environmentValue: '',
        hostKey: '',
        hostValue: '',
        errorMsgForVersion: '',

        type: '',
        dataPassed: {},
        appName: '',
        profileInfo:  null,
        appLanguage: null,
        versionList: [],
        propsUsed: {
          memoryId: false,
          imageLocation: false
        },
        serviceForm: {
          appId: null,
          spaceId: null,
          serviceVersion: '',
          gitLabAddress: '',
          gitLabBranch: 'master',
          relativePathOfParentPOM: '',
          appMonitor: appPropUtil.defaultAppMonitorId,
          vmOptions: '',
          mavenProfileId: '',
          cpuID: '',
          memoryID: '',
          environments: [],
          hosts: [],
          instanceCount: 1,
          customImage: false,
          imageLocation: '',
          // value of autoImage
          autoImageValue: '',
          // value of customImage
          customImageValue: '',
          portMap: {
            protocol: 'TCP',
            outerPort: '',
            containerPort: ''
          }
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
          customEnvImageList: [],
          privateAppList: [],
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
        rules: appPropUtil.rules,

        showLoading: false,
        loadingText: '',

        errMsgForPortMap: '',
        debounceCheckPortMap: () => {},
      };
    },
    computed: {
      ...mapGetters('user', {
        'profileListOfGroup': 'profileListOfGroup'
      }),
      cpuAndMemoryList() {
        return this.$storeHelper.cpuAndMemoryList();
      },
      groupInfo() {
        return this.$storeHelper.groupInfo();
      },
    },
    watch: {
      'serviceForm.spaceId': function (profileId) {
        // update profile info
        this.profileInfo = this.$storeHelper.getProfileInfoByID(profileId);
        // request image related info
        this.requestImageRelatedInfo();
        // update versionList
        this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {
          payload: {
            appId: this.serviceForm.appId,
            spaceId: profileId
          }
        }).then(content => {
          if(content.hasOwnProperty('applicationServerList')){
            let serviceList = content['applicationServerList'];
            this.versionList = serviceList.filter(it => {
              return it.hasOwnProperty('serviceVersion') && it['serviceVersion'] && it['serviceVersion'][0] === 'v';
            }).map(it => {
              return it['serviceVersion'].substring(1);
            });
            // set default service version when this.type == 'copy'
            if (this.type === 'copy') {
              let maxVersion = 0;
              this.versionList.forEach(it => {
                if (it > maxVersion) {
                  maxVersion = it;
                }
              });
              this.serviceForm.serviceVersion = (maxVersion + 1).toString();
//              this.checkVersion(this.serviceForm.serviceVersion);
            }
          }
        })
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
          if (this.type === 'copy' && !this.propsUsed.memoryId) {
            // check if memoryId existed in memorySizeList
            if (this.memorySizeList.map(it => {
              return it.id
            }).indexOf(this.dataPassed.memoryID) > -1) {
              this.serviceForm.memoryID = this.dataPassed.memoryID;
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

      'serviceForm.serviceVersion': 'checkVersion',
      'serviceForm.portMap.outerPort': function (value) {
        this.debounceCheckPortMap(value)
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
      setDebounce() {
        this.debounceCheckPortMap = this.$utils.debounce(this.checkPortMap.bind(this), 1500, false);
      },
      scrollTop() {
        setTimeout(() => {
          this.$el.scrollTop = '0px';
        }, 500);
      },
      scrollBottom() {
        this.$nextTick(() => {
          let containerHeight = this.$el.offsetHeight;
          let sheet = this.$el.querySelector('.sheet');
          if (!sheet) {
            return;
          }
          // 30px is the sum of marginTop and marginBottom
          let sheetHeight = sheet.offsetHeight + 30;
          if (sheetHeight > containerHeight) {
            setTimeout(() => {
              this.$el.scrollTop = sheetHeight - containerHeight;
            }, 500);
          }
        });
      },
      checkVersion(value) {
        value = value.trim();
        if (value === '') {
          this.errorMsgForVersion = '版本号不能为空';
        } else if (!/^[0-9]{1,5}$/.test(value)) {
          this.errorMsgForVersion = '版本号只能包含数字，不能超过五位';
        } else if (this.versionList.indexOf(value) > -1) {
          this.errorMsgForVersion = `版本v${value}已经存在`;
        } else {
          this.errorMsgForVersion = ''
        }
        return this.errorMsgForVersion === '';
      },
      // 检查访问端口是否被占用
      checkPortMap(port) {
        this.$net.formatRequest(this.$net.URL_LIST.service_port_map_check, {
          payload: {
            appId: this.serviceForm.appId,
            spaceId: this.serviceForm.spaceId,
            outerPort: port
          }
        }).then(res => {
          let resData = res.data;
          if (resData.code === 0) {
            this.errMsgForPortMap = '';
          } else {
            this.errMsgForPortMap = resData.msg;
          }
        }).catch(err => {
          this.errMsgForPortMap = '';
        });
      },
      // get image related info from network
      requestImageRelatedInfo() {
        const groupTag = this.groupInfo.tag;
        const appId = this.serviceForm.appId;
        const profileName = this.profileInfo.name;
        this.$net.getImageRelatedInfo({
          groupTag,
          appId
        }, {
          env: profileName,
          applicationId: appId,
          groupTag: groupTag
        }, {
          groupTag: groupTag
        }).then(autoImageList => {
          this.imageInfoFromNet['autoImageList'] = autoImageList;
          if (!this.dataPassed.customImage && !this.propsUsed.imageLocation && autoImageList.indexOf(this.dataPassed.imageLocation) > -1) {
            this.serviceForm.autoImageValue = this.dataPassed.imageLocation;
            this.propsUsed.imageLocation = true;
          }
//          if (imageInfoFromNet && imageInfoFromNet.hasOwnProperty('privateAppList')
//            && Array.isArray(imageInfoFromNet.privateAppList) && imageInfoFromNet.privateAppList.length > 0) {
//            this.imageSelectState.currentPrivateApp = imageInfoFromNet.privateAppList[0];
//          }
//          console.log(this.imageInfoFromNet);
        }).catch(err => {
          console.log(err);
        })
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

      handleClick(action) {
        switch (action) {
          case 'more-config':
            this.showMoreConfig = !this.showMoreConfig;
            if (this.showMoreConfig) {
              this.scrollBottom();
            } else {
              this.scrollTop();
            }
            break;
          case 'back':
            this.$router.go(-1);
            break;
          case 'submit':
            if (!this.checkVersion(this.serviceForm.serviceVersion)) {
              return;
            }
            if (this.errMsgForPortMap) {
              return;
            }
            this.$refs['serviceForm'].validate((valid) => {
              if (valid) {
                this.serviceForm.customImage = this.imageSelectState.customImage;
                if (this.imageSelectState.customImage) {
                  this.serviceForm.imageLocation = this.serviceForm.customImageValue;
                } else {
                  this.serviceForm.imageLocation = this.serviceForm.autoImageValue;
                }
                let serviceForm = this.serviceForm;
                let toPost = {
                  appId: serviceForm.appId,
                  spaceId: serviceForm.spaceId,
                  serviceVersion: serviceForm.serviceVersion,
                  gitLabAddress: serviceForm.gitLabAddress,
                  gitLabBranch: serviceForm.gitLabBranch,
                  relativePath: serviceForm.relativePathOfParentPOM,
                  vmOptions: serviceForm.vmOptions,
                  appMonitor: serviceForm.appMonitor,
                  mavenProfileId: serviceForm.mavenProfileId,
                  cpuId: serviceForm.cpuID,
                  memoryId: serviceForm.memoryID,
                  environments: serviceForm.environments,
                  hosts: serviceForm.hosts,
                  instanceNum: serviceForm.instanceCount,
                  customImage: serviceForm.customImage,
                  image: serviceForm.imageLocation,
                  portsMapping: [serviceForm.portMap]
                };
                this.addToWaitingResponseQueue('submit');
                this.showLoading = true;
                this.loadingText = '正在为您创建服务';
                this.$net.createService(toPost).then((content) => {
                  this.$message({
                    type: 'success',
                    message: '服务' + toPost.serviceVersion + '创建成功！'
                  });
                  if (this.type === 'copy') {
                    this.$storeHelper.dataTransfer = {
                      from: 'service/add',
                      data: {
                        profileId: this.serviceForm.spaceId
                      }
                    };
                  }
                  this.$router.push('/service');
                }).catch((err) => {
                  this.$notify.error({
                    title: err.title,
                    message: err.msg,
                    duration: 0,
                    onClose: function () {
                    }
                  });
                }).finally(() => {
                  this.hideWaitingResponse('submit');
                  this.showLoading = false;
                });
              } else {
                console.log('error submit!!');
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
    }
  }
</script>
