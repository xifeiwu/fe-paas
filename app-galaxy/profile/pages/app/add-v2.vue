<template>
  <div id="app-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="section-title"><span>{{pageType == 'update'? '修改应用':'创建应用'}}</span>
      <el-popover v-if="false"
              width="300"
              v-model="showPopoverForHelp"
              placement="bottom"
              popperClass="el-popover--small">
        <div>1. 健康检查/延迟时间：延迟时间以秒为单位，取值范围在30-1800之间</div>
        <i class="paas-icon-fa-question" slot="reference" @click="handleClick('show-popover-for-help')"></i>
      </el-popover>
    </div>
    <el-form :model="createAppForm" :rules="rules" size="mini"
             ref="createAppForm" label-width="130px">
      <el-form-item label="团队" prop="groupID" class="group-list" v-if="pageType != 'update'">
        <el-select v-model="$storeHelper.currentGroupID" placeholder="请选择" filterable>
          <el-option v-for="item in groupList" :key="item.id" :label="item.asLabel" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="团队" class="group-list" v-else>
        <span>{{$storeHelper.groupInfo.asLabel}}</span>
      </el-form-item>

      <el-form-item label="维护者" prop="maintainerIdList" class="group-list" style="width: 340px">
        <el-select v-model="createAppForm.maintainerIdList" multiple :multiple-limit="5" placeholder="请选择" filterable>
          <el-option v-for="item in groupUsers" :key="item.id" :label="item.realName + ' ( ' + item.jobDescription + ' ) '" :value="item.userId">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="所属LOB" prop="lobId" class="lob" v-if="true">
        <el-select v-model="createAppForm.lobId" placeholder="请选择" filterable>
          <el-option v-for="item in lobList" :key="item.id" :label="item.lobName" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属ScrumTeam" prop="scrumId" class="scrumTeam" v-if="true">
        <el-select v-model="createAppForm.scrumId" placeholder="请选择" filterable>
          <el-option v-for="item in scrumList" :key="item.id" :label="item.scrumName" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="应用名称" prop="appName">
        <el-input v-model="createAppForm.appName" placeholder="中文，英文，数字，下划线，中划线。2-50个字符"></el-input>
      </el-form-item>

      <el-form-item label="项目名称" prop="projectName" v-if="pageType != 'update'">
        <el-input v-model="createAppForm.projectName"
                  placeholder="输入GitLab里的project名称。只能包含字母、数字、中划线，2-50个字符"></el-input>
      </el-form-item>
      <el-form-item label="项目名称" v-else>
        <span>{{createAppForm.projectName}}</span>
      </el-form-item>

      <el-form-item label="二级域名" prop="serviceName">
        <el-input v-model="createAppForm.serviceName" placeholder="默认与项目名称一致，且强制转换为小写字母" v-if="pageType != 'update'"></el-input>
        <span v-else>{{createAppForm.serviceName}}</span>
      </el-form-item>
      <el-form-item label="开发语言" prop="language">
        <el-radio-group v-model="createAppForm.language">
          <el-radio v-for="item in language.list" :label="item.language" :key="item.language">
            {{item.languageDesc}}
          </el-radio>
          <!--<el-radio label="JAVA"></el-radio>-->
          <!--<el-radio label="NODE_JS"></el-radio>-->
          <!--<el-radio label="PHP"></el-radio>-->
        </el-radio-group>
      </el-form-item>
      <el-form-item label="语言版本" prop="languageVersion">
        <el-radio-group v-model="createAppForm.languageVersion">
          <el-radio v-for="item in language.versionList" :label="item.version" :key="item.version">
            {{item.version}}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <!--<el-form-item class="build-type" label="构建类型"  style="height: 30px;"-->
                    <!--v-if="language.packageTypeList.length > 0" :error="createAppForm.packageInfo.errMsg">-->
        <!--<div class="flex-layout">-->
          <!--<div class="type-list">-->
            <!--<el-radio-group v-model="createAppForm.packageInfo.type">-->
              <!--<el-radio v-for="item in language.packageTypeList" :label="item.type" :key="item.type">-->
                <!--{{item.packageType}}-->
              <!--</el-radio>-->
            <!--</el-radio-group>-->
          <!--</div>-->
          <!--<div :class="['war-name', createAppForm.packageInfo.needSetName ?'':'hide', useBuildName?'':'hide']"><el-input v-model="createAppForm.packageInfo.name" placeholder="默认与项目名称一致"></el-input></div>-->
        <!--</div>-->
      <!--</el-form-item>-->
      <el-form-item label="运行环境" class="profiles" :error="productionProfileTip">
        <el-checkbox-group v-model="createAppForm.profiles" style="display: inline-block;">
          <el-checkbox v-for="item in $storeHelper.profileListOfGroup" :label="item.name" :key="item.name"
                       :disabled="true">
            {{item.description}}
          </el-checkbox>
        </el-checkbox-group>
        <i class="el-icon-warning" style="display: inline-block; margin-left: 10px; color: #E6A23C;"
           @mouseover="handleClick($event, 'warning-app-add-profile')"></i>
      </el-form-item>

      <el-form-item label="说明" prop="description">
        <el-input v-model="createAppForm.description"
                  size="mini"
                  type="textarea"
                  :rows="4"
                  placeholder="不能超过200个字符"
        ></el-input>
      </el-form-item>

      <div class="el-form-item-group is-required" v-if="false">
        <div class="label" style="width: 140px;">健康检查配置</div>
        <div class="content" style="margin-left: 140px;">
          <el-form-item :error="errMsgForHealthCheck">
            <div class="health-check-type" style="height: 64px">
              <el-radio-group v-model="createAppForm.healthCheckType">
                <el-radio v-for="(item, index) in $storeHelper.healthCheckTypeList" :label="item.desc" :key="item.desc">{{item.label}}</el-radio>
              </el-radio-group>
              <div class="input-area">
                <div :class="createAppForm.healthCheckType != 'http' ? 'hide': ''">
                  <el-input v-model="createAppForm.healthCheck.http" placeholder="以/开头，可以包含字母、数字、下划线、中划线。2-100个字符"></el-input>
                </div>
                <div :class="createAppForm.healthCheckType != 'shell' ? 'hide' : ''">
                  <el-input v-model="createAppForm.healthCheck.shell"placeholder="请填写shell指令"></el-input>
                </div>
                <div :class="createAppForm.healthCheckType != 'socket' ? 'hide' : ''">
                  <span>端口号：</span>
                  <el-input-number v-model="createAppForm.healthCheck.socket" :min="0" :max="10000" label="延迟时间"></el-input-number>
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <div class="initial-delay" style="line-height: 28px">
              <span>延迟时间：</span>
              <el-input-number v-model="createAppForm.initialDelaySeconds" :min="30" :max="1800" label="延迟时间"></el-input-number>
              <el-tooltip effect="dark" content="健康检查延迟时间：延迟时间以秒为单位，取值范围在30-1800之间" placement="bottom">
                <i class="paas-icon-fa-question" style="font-size: 12px; color: #E6A23C"></i>
              </el-tooltip>
            </div>
          </el-form-item>
        </div>
      </div>

      <el-form-item label="文件存储" prop="fileLocation" class="fileLocation" v-if="false">
          <el-tag
            v-for="tag in createAppForm.fileLocation"
            :key="tag"
            size="small"
            closable
            type="success"
            @close="handleFileLocation('remove', tag)"
          >{{tag}}</el-tag>
        <el-input v-model="fileLocationToAdd" placeholder="以/开头，可以包含字母、数字、下划线、中划线。2-18个字符。最多可以添加五个">
          <template slot="append">
            <el-button type="primary" class="add-file-location-btn" @click="handleFileLocation('add', fileLocationToAdd)">
              添加
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="滚动升级" prop="rollingUpdate" v-if="false">
        <el-radio-group v-model="createAppForm.rollingUpdate">
          <el-radio :label="true">需要</el-radio>
          <el-radio :label="false">不需要</el-radio>
        </el-radio-group>
      </el-form-item>
      <transition name="script-4-rolling-update">
        <el-form-item label="滚动升级脚本" prop="script4RollingUpdate"
                      class="script-4-rolling-update"
                      v-if="false"
        >
          <el-input v-model="createAppForm.script4RollingUpdate"
                    type="textarea"
                    :rows="16"
                    placeholder="滚动升级脚本"
                    v-if="editScript"
          ></el-input>
          <div class="formatted-script-4-rolling-update" v-else>
            <el-scrollbar>
              <pre><code class="bash hljs" v-if="formattedScript4RollingUpdate.length > 0"
                         v-html="formattedScript4RollingUpdate"></code></pre>
            </el-scrollbar>
          </div>
          <div class="toggle-edit-script" @click="toggleEditScript">
            <span v-if="editScript">预览</span>
            <span v-else>编辑</span>
          </div>
        </el-form-item>
      </transition>
      <transition name="max-age-4-script">
        <el-form-item label="超时时间" prop="maxAge4Script"
                      class="max-age-4-script"
                      v-if="false"
        >
          <el-input-number v-model="createAppForm.maxAge4Script" :min="1" :max="120" label="描述文字"></el-input-number>
          <span>秒（1-120秒之间）</span>
        </el-form-item>
      </transition>
      <el-form-item label="负载均衡" prop="loadBalance" v-if="false">
        <el-radio-group v-model="createAppForm.loadBalance">
          <el-radio v-for="item in loadBalanceType" :label="item" :key="item"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="用户须知" prop="agree" v-if="false">
        <el-checkbox v-model="createAppForm.agree">
          <span style="display: inline-block;">已知晓：</span>
        </el-checkbox>
        <div style="display: inline-block; font-size: 12px; line-height: 18px; vertical-align: top;">
          <div>生产环境初次上线前需提交<a href="http://wiki.puhuitech.cn/pages/viewpage.action?pageId=28733856" target="_blank">生产准备就绪评审（PRR）</a>到paas.list@finupgroup.com；</div>
          <div>非生产环境可自助上线。</div>
        </div>
      </el-form-item>
    </el-form>
    <div class="section-footer">
        <div class="item">
          <el-button type="primary" size="mini"  :loading="statusOfWaitingResponse('submit')"
                     @click="handleClick($event, 'submit')">完成</el-button>
        </div>
        <div class="item">
          <el-button type="primary" size="mini" @click="handleClick($event, 'back')">关闭</el-button>
        </div>
    </div>
  </div>
</template>

<style lang="scss">
.el-form {
  .el-form-item {
    .el-textarea {
      textarea {
        font-size: 12px;
      }
    }
    &.script-4-rolling-update {
      .el-form-item__content {
        /*overflow: scroll;*/
        .toggle-edit-script {
          font-size: 12px;
          line-height: 20px;
          background: #E6A23C;
          padding: 0px 3px;
          border-radius: 4px;
          display: inline-block;
          position: absolute;
          top: 0px;
          right: 0px;
          &:hover {
            font-weight: bold;
          }
        }
        .formatted-script-4-rolling-update {
          margin: 0px;
          padding: 0px;
          width: 100%;
          box-sizing: border-box;
          height: 300px;
          border: 1px solid gray;
          border-radius: 5px;
          .el-scrollbar {
            width: 100%;
            height: 300px;
          }
          overflow: scroll;
          font-size: 12px;
          line-height: 14px;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
  @keyframes to-show {
    0% {
      opacity: 0;
      /*max-height: 0px;*/
    }
    25% {
      opacity: .75;
    }
    100% {
      opacity: 1;
      /*max-height: 600px;*/
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
  .script-4-rolling-update-enter-active, .max-age-4-script-enter-active  {
    animation: to-show 1.5s ease-in-out;
  }
  .script-4-rolling-update-leave-active, .max-age-4-script-leave-active {
    animation: to-hide 1s ease-in-out;
  }

  #app-add {
    background: white;
    margin: 20px;
    padding: 10px 30px;
    width: 80%;
    max-width: 850px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    .section-title {
      margin: 15px 0px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      font-weight: bold;
      .paas-icon-fa-question {
        font-size: 14px;
        color: #E6A23C;
        &:hover {
          cursor: pointer;
        }
      }
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
        display: inline-block;
        width: 150px;
      }
    }
    .el-form {
      .el-form-item {
        .el-form-item__label {
          font-weight: bold;
        }
        &.group-list {
          .el-select {
            width: 550px;
          }
        }
        &.profiles {
          .el-checkbox + .el-checkbox {
            margin-left: 20px;
          }
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
        &.finish {
          .el-button {
            display: block;
            margin: 0px auto;
            width: 50%;
            max-width: 200px;
            text-align: center;
          }
        }
        &.fileLocation {
          .add-file-location-btn {
            color: white;
            background-color: #409EFF;
            margin: 0px;
            width: 60px;
            padding: 7px 15px 8px 15px;
            border-width: 0px;
            border-radius: 0px;
            &:hover {
              background-color: #79bbff;
              font-weight: bold;
            }
          }
        }
        &.script-4-rolling-update {
        }
        &.max-age-4-script {
        }
      }
    }
  }
</style>
<script>
  import {mapGetters} from 'vuex';
  import profileUtils from '../utils/app-props';
  import commonUtils from 'assets/components/mixins/common-utils';
export default {
  mixins: [commonUtils],
  created() {
    switch (this.$route.path) {
      case this.$net.page['profile/app/update']:
        this.pageType = 'update';
        break;
      default:
        this.pageType = 'add';
        break;
    }
    this.forModify = this.$route['path'] == this.$net.page['profile/app/update'];

    var goBack = false;

    if (this.forModify) {
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer['from'];
        const data = dataTransfer['data'];
        switch (from) {
          case this.$net.page['profile/app']:
          case this.$net.page['profile/service']:
            this.dataPassed = data;
            this.createAppForm.lobId = data['lobId'];
            this.createAppForm.scrumId = data['scrumId'];
            this.createAppForm.appName = data['appName'];
            this.createAppForm.projectName = data['projectName'];
            this.createAppForm.serviceName = data['serviceName'];
            this.createAppForm.maintainerId = data['maintainerId'];
            let maintainerList = data['maintainerList'];
            this.createAppForm.maintainerIdList = maintainerList.map(it => it.id);
            this.createAppForm.maintainer = data['maintainer'];
            // the follow prop is set in watch function
            this.propsUsed.language = false;
            this.propsUsed.languageVersion = false;
            // this.propsUsed.packageType = false;
            console.log(data)
            this.createAppForm.description = data['description'];
            break;
          default:
            goBack = true;
            break;
        }
        this.$storeHelper.dataTransfer = null;
      } else {
        goBack = true;
      }
    }
    if (goBack) {
      this.$router.go(-1);
      return;
    }

    this.onLanguageInfo(this.$storeHelper.languageInfo);
    this.onProfileListOfGroup(this.$storeHelper.profileListOfGroup);
  },
  mounted() {
    if (!this.$storeHelper.lobInfo) {
      this.$net.getLobInfo().then(result => {
        this.$storeHelper.lobInfo = result;
      }).catch(err => {
        this.$notify.error({
          title: err.title,
          message: err.msg,
          duration: 0,
          onClose: function () {
          }
        });
      })
    } else {
      this.onLobInfo(this.$storeHelper.lobInfo);
    }
    this.$net.getUsersInGroup({id: this.$storeHelper.currentGroupID}).then(memberList => {
      this.groupUsers = memberList;
      if (!this.forModify) {
        this.groupUsers.forEach( member => {
          if (member.jobName.includes("TECH_LEADER")) {
            this.createAppForm.maintainer = member.realName;
            this.createAppForm.maintainerId = member.userId;
          }
        });
      }
    });
  },
  data() {
    return {
      useBuildName: true,
      fileLocationToAdd: '',
      scrumList: [],
      lobList: [],
      showPopoverForHelp: false,
      errMsgForHealthCheck: '',
      // 添加应用或修改应用
      pageType: 'add',
      dataPassed: null,
      propsUsed: {
        language: false,
        languageVersion: false,
        // packageType: false
      },
      createAppForm: {
        groupID: this.$storeHelper.currentGroupID,
        scrumId: '',
        lobId: '',
        appName: '',
        projectName: '',
        serviceName: '',
        language: '',
        languageVersion: '',
        maintainerId: '',
        maintainer: '',
        maintainerIdList: [],
//         packageInfo: {
//           _type: '',
//           _name: '',
//           set type(value) {
//             this._type = value;
//           },
//           get type() {
//             return this._type;
//           },
//           set name(value) {
//             this._name = value;
//           },
//           get name() {
//             if (this._type === 'WAR') {
//               return this._name;
//             } else {
//               return '';
//             }
//           },
//           get needSetName() {
//             return this._type == 'WAR';
//           },
//           get errMsg() {
//             return '';
//             if (this._type === 'WAR' && !this._name) {
//               return '默认与项目名称一致';
// //              return '构建类型为WAR时，必须填写构建包名称';
//             } else {
//               return '';
//             }
//           }
//         },
        profiles: [],
        healthCheckType:  this.$storeHelper.defaultHealthCheckTypeDesc,
        healthCheck: {
          http: '',
          shell: '',
          socket: 8080
        },
        initialDelaySeconds: 120,
        fileLocation: [],
        rollingUpdate: true,
        script4RollingUpdate: '',
        maxAge4Script: '30',
        loadBalance: profileUtils.getSupportedLoadBalance()[0],
        agree: false,
        description:'',
      },
      productionProfileTip: '',
      editScript: true,
      formattedScript4RollingUpdate: '',
      rules: profileUtils.rules,
      language: {
        list: [],
        versionList: [],
        // packageTypeList: []
      },
      groupUsers: [],
      showLoading: false,
      loadingText: '',
      description:'',
    };
  },
  computed: {
    loadBalanceType() {
      return profileUtils.getSupportedLoadBalance();
    },
    groupList() {
      return this.$storeHelper.groupList;
    },
  },
  watch: {
    'createAppForm.healthCheckType': function (type) {
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
    '$storeHelper.languageInfo': 'onLanguageInfo',
    '$storeHelper.profileListOfGroup': 'onProfileListOfGroup',
    '$storeHelper.lobInfo': 'onLobInfo',
    '$storeHelper.currentGroupID': function (groupID) {
      this.createAppForm.groupID = groupID;
      this.$net.getUsersInGroup({id: groupID}).then(memberList => {
        console.log(memberList);
        this.groupUsers = memberList;
        if (!this.forModify) {
          this.createAppForm.maintainer = '';
          this.createAppForm.maintainerId = '';
        }
      });
    },
    'createAppForm.language': 'onLanguageTypeChange',
    // 'createAppForm.languageVersion': 'onLanguageVersionChange',
    'createAppForm.lobId': function() {
      let options = {
        lobId:this.createAppForm.lobId,
      };
      this.$net.getScrumByLobId(options).then(result => {
        if(Array.isArray(result.scrumList) && result.scrumList.length > 0) {
          this.scrumList = result.scrumList;
          if (this.pageType === 'add' || (this.pageType == 'update' && this.createAppForm.lobId != this.dataPassed.lobId)) {
            // this.createAppForm.scrumId = this.scrumList[0].id;
            this.createAppForm.scrumId = "";  // liugang - 20190821
          } else {
            this.createAppForm.scrumId = this.dataPassed.scrumId;
          }
        }else{
          this.scrumList = [];
          this.createAppForm.scrumId = '';
        }
      });
    },
    'scrumList': function () {
      if(this.scrumList.length == 0){
        this.$message({
          message: '此LOB下无ScrumTeam,不能创建应用,如有疑问,请联系平台管理员!',
          type: 'error',
          center: true,
          duration:5000
        })
      }
    }
  },
  methods: {
    /**
     * get profileNameList from profileInfoList
     * @param profileInfoList
     */
    onProfileListOfGroup: function (profileInfoList) {
      this.createAppForm.profiles = profileInfoList.map(it => {
        return it.name;
      });
    },
    onLobInfo(lobInfo) {
      if (lobInfo) {
        if (lobInfo.hasOwnProperty('scrumList') && Array.isArray(lobInfo['scrumList']) && lobInfo['scrumList'].length > 0) {
          this.scrumList = lobInfo['scrumList'];
          // if (this.page === 'add') {
          //   this.createAppForm.scrumId = this.scrumList[0].id;
          // }
        }
        if (lobInfo.hasOwnProperty('lobList') && Array.isArray(lobInfo['lobList']) && lobInfo['lobList'].length > 0) {
          this.lobList = lobInfo['lobList'];
          // if (this.pageType === 'add') {
          //   this.createAppForm.lobId = this.lobList[0].id;
          // }
        }
      }
    },

    // 处理语言信息
    onLanguageInfo(languageList) {
      if (Array.isArray(languageList) && languageList.length > 0) {
        if (this.forModify && !this.propsUsed.language) {
          this.createAppForm.language = this.dataPassed.language.type;
          this.propsUsed.language = true;
        } else {
          this.createAppForm.language = languageList[0].language;
        }
        this.language.list = languageList;
      }
    },

    // 语言改变时，更新版本列表
    onLanguageTypeChange (languageType) {
      this.language.versionList = [];
      if (Array.isArray(this.$storeHelper.languageInfo)) {
        // get language info from languageList by language
        this.$storeHelper.languageInfo.some(it => {
          if (it.hasOwnProperty('language') && it.language === languageType) {
//            console.log(it);
            this.language.versionList = it['languageVersionList'];
            return true;
          } else {
            return false;
          }
        })
      }
      if (Array.isArray(this.language.versionList) && this.language.versionList.length > 0) {
        if (this.pageType === 'update' && !this.propsUsed.languageVersion) {
          this.createAppForm.languageVersion = this.dataPassed.language.version;
          this.propsUsed.languageVersion = true;
        } else {
          this.createAppForm.languageVersion = this.language.versionList[0].version;
        }
      }
//      this.createAppForm.packageInfo.type = data['packageType'];
    },
    // 版本改变时，更新包类型
    // onLanguageVersionChange (version) {
    //   const versionList = this.language.versionList;
    //   this.language.packageTypeList = [];
    //   Array.isArray(versionList) && versionList.some(it => {
    //     if (version == it.version) {
    //       this.language.packageTypeList = it.packageTypeList;
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   });
    //   if (Array.isArray(this.language.packageTypeList) && this.language.packageTypeList.length > 0) {
    //     if (this.pageType === 'update' && !this.propsUsed.packageType) {
    //       this.createAppForm.packageInfo.type = this.dataPassed.packageType;
    //       this.propsUsed.packageType = true;
    //     } else {
    //       this.createAppForm.packageInfo.type = this.language.packageTypeList[0].type;
    //     }
    //   }
    // },

    toggleEditScript() {
      if (this.editScript) {
        Promise.all([this.$utils.lazyLoad('js', this.$url['highlight.js']),
          this.$utils.lazyLoad('css', this.$url['highlight.css'])]).then(content => {
            console.log(content);
          // lib highlight.js will expose hljs to window
          if (hljs) {
            let result = hljs.highlightAuto(this.createAppForm.script4RollingUpdate, ['bash']);
            if (result && result.value) {
              this.formattedScript4RollingUpdate = result.value;
            } else {
              this.formattedScript4RollingUpdate = '';
            }
            this.editScript = false;
          }
        }).catch(err => {
          console.log(err);
        });
      } else {
        this.editScript = true;
      }
    },

    // 增删文件存储
    handleFileLocation(action, tag) {
      let fileLocationList = this.createAppForm.fileLocation;
      switch (action) {
        case 'add':
          tag = tag.trim();
          let reg = /^\/[A-Za-z0-9_\-\.@]{1,49}$/;
          if (!reg.exec(tag)) {
            this.$message.warning('以/开头，可包含字母、数字、下划线、中划线。2-50位字符。');
            return;
          }
          if (fileLocationList.length >= 5) {
            this.$message.warning('最多只能添加五个路径');
            return;
          }
          if (tag.length > 0) {
            if (fileLocationList.indexOf(tag) > -1) {
              this.$message.warning('该文件存储已存在！');
            } else {
              fileLocationList.push(tag);
              this.fileLocationToAdd = '';
            }
          }
          break;
        case 'remove':
          fileLocationList.splice(fileLocationList.indexOf(tag), 1);
          break;
      }
    },

    // 有且只能有一个生产环境
    // fix 2019.2.21: 可以支持多个生产环境
    invalidProductionProfileTip() {
      let messageTip = null;
      return messageTip;
      let profileInfoList = this.createAppForm.profiles.map(it => {
        return this.$storeHelper.getProfileInfoByName(it);
      });
      let productionProfileCount = 0;
      profileInfoList.forEach(it => {
        if (it && it.hasOwnProperty('spaceType') && it['spaceType'] === 'PRODUCTION') {
          productionProfileCount += 1;
        }
      });
      if (productionProfileCount === 0) {
        messageTip = '必须选择一个生产环境';
      } else if (productionProfileCount > 1) {
        messageTip = '只能选择一个生产环境';
      }
      return messageTip;
    },

    getErrMsgForHealthCheck() {
      let errMsg = '';
      const healthCheck = this.createAppForm.healthCheck;
      switch (this.createAppForm.healthCheckType) {
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

    // action for submit button
    handleClick(evt, action) {
      if ('warning-app-add-profile' === action) {
        this.$storeHelper.globalPopover.show({
          ref: evt.target,
          msg: profileUtils.warningList[action]['more']
        });
        return;
      }
      switch (action) {
        case 'show-popover-for-help':
          this.showPopoverForHelp = true;
          break;

        case 'back':
          this.$router.go(-1);
          break;
        case 'submit':
          let productionTip = this.invalidProductionProfileTip();
          if (productionTip) {
            this.productionProfileTip = productionTip;
            return;
          } else {
            this.productionProfileTip = '';
          }
          this.$refs['createAppForm'].validate((valid) => {
            if (!valid) {
              console.log('error submit!!');
              return false;
            }
            const createAppForm = this.createAppForm;
            createAppForm.groupID = this.$storeHelper.currentGroupID;
            const payload = {
              groupId: createAppForm.groupID,
              scrumId: createAppForm.scrumId,
              lobId: createAppForm.lobId,
              appName: createAppForm.appName,
              tag: createAppForm.projectName,
              serviceName: createAppForm.serviceName,
              language: createAppForm.language,
              languageVersion: createAppForm.languageVersion,
              spaceList: createAppForm.profiles,
              maintainerId: createAppForm.maintainerId,
              maintainerIdList: createAppForm.maintainerIdList,
              description: createAppForm.description
            };
//          console.log('payload');
//          console.log(payload);
            if (this.groupUsers.length > 1
              && this.createAppForm.maintainerIdList.length < 2) {
              this.$message.warning("为了及时掌握应用异常情况，请填写至少2位以上应用维护者，以免影响云平台给维护者发送告警信息！");
              return false;
            }
            this.addToWaitingResponseQueue('submit');
            this.showLoading = true;

            var loadingTip = '';
            var successTip = '';
            var destUrl = '';
            switch (this.pageType) {
              case 'update':
                payload.id = this.dataPassed.appId;
                loadingTip = `正在更新应用 ${payload.appName}`;
                successTip = `应用${payload.appName}更新成功！`;
                destUrl = this.$net.URL_LIST.app_update;
                break;
              case 'add':
                loadingTip = `正在创建应用 ${payload.appName}`;
                successTip = `应用${payload.appName}创建成功！`;
                destUrl = this.$net.URL_LIST.app_create;
                break;
            }
            this.loadingText = loadingTip;
            this.$net.requestPaasServer(destUrl, {
              payload
            }).then(resContent => {
              this.$net.needUpdateAppList = true;
              this.$message({
                type: 'success',
                message: successTip
              });
              // update appInfoList after createApp success in page profile/app
              this.$router.push(this.$net.page['profile/app']);
            }).catch((err) => {
            }).finally(() => {
              this.hideWaitingResponse('submit');
              this.showLoading = false;
            });
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