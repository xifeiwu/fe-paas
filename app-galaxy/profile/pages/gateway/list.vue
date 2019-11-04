<template>
  <div id="gateway-list">
    <div class="header">
      <div class="item">
        <paas-version-selector :customConfig="config4VersionSelector" ref="version-selector"
                               @version-selected="onVersionSelected"></paas-version-selector>
      </div>
      <div class="item">
        <el-button v-if="true"
                   size="mini"
                   type="primary"
                   @click="handleClick($event, 'refresh')">刷新</el-button>
      </div>
    </div>
    <div class="list">
      <el-table
              :data="gatewayList"
              style="width: 100%"
              :height="heightOfTable"
      >
        <!--<el-table-column-->
                <!--prop="id"-->
                <!--label="实例名称"-->
                <!--minWidth="100"-->
                <!--headerAlign="left" align="left">-->
          <!--<template slot-scope="scope">-->
            <!--<span class="link">{{scope.row.id}}</span>-->
            <!--<i class="paas-icon-copy"-->
               <!--v-clipboard:copy="scope.row.id"-->
               <!--v-clipboard:success="handleSuccessCopy"></i>-->
            <!--<span v-if="scope.row.hasCanary" :style="{border: '1px solid #409EFF', color: '#409EFF',-->
             <!--'font-size': '12px', padding: '1px','border-radius': '4px'}"-->
            <!--&gt;灰度</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column-->
                <!--prop="nodeName"-->
                <!--label="运行节点"-->
                <!--minWidth="70"-->
                <!--headerAlign="left" align="left">-->
          <!--<template slot-scope="scope">-->
            <!--<span-->
                    <!--:class="['running-node', isProductionProfile ? 'production': 'un-production']"-->
                    <!--@click="handleRowButtonClick($event, 'show_eagleeye', scope.$index, scope.row)"-->
            <!--&gt;{{scope.row.nodeName}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column-->
                <!--prop="status"-->
                <!--label="健康状态"-->
                <!--width="110"-->
                <!--headerAlign="center" align="center"-->
        <!--&gt;-->
          <!--<template slot-scope="scope">-->
            <!--<div>-->
              <!--<span>{{scope.row.status ? scope.row.status : ''}}</span>-->
              <!--<span :style="{border: !isMesosService ? '1px solid #409EFF' : '1px solid #b4bccc', color: !isMesosService ? '#409EFF':'#b4bccc',-->
             <!--'font-size': '12px', cursor: 'pointer', padding: '1px','border-radius': '4px'}"-->
                    <!--@click="handleRowButtonClick($event, 'instance-status-container',scope.$index,scope.row)"-->
              <!--&gt;详情</span>-->
            <!--</div>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column-->
                <!--prop="intranetIP"-->
                <!--label="内网IP"-->
                <!--width="90"-->
                <!--headerAlign="center" align="center">-->
          <!--<template slot-scope="scope">-->
            <!--<span-->
                    <!--:class="['running-node', isProductionProfile ? 'production': 'un-production']"-->
                    <!--@click="handleRowButtonClick($event, 'show_intranet', scope.$index, scope.row)"-->
            <!--&gt;{{scope.row.intranetIP}}</span>-->
            <!--<i class="paas-icon-copy"-->
               <!--v-clipboard:copy="scope.row.intranetIP"-->
               <!--v-clipboard:success="handleSuccessCopy"></i>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column-->
                <!--label="使用内存/总内存"-->
                <!--prop="memoryStatus"-->
                <!--width="150"-->
                <!--sortable="custom"-->
                <!--headerAlign="center" align="center">-->
        <!--</el-table-column>-->
        <!--<el-table-column-->
                <!--prop="cpuUsageInPercent"-->
                <!--label="CPU使用率"-->
                <!--width="110"-->
                <!--sortable="custom"-->
                <!--headerAlign="center" align="center">-->
        <!--</el-table-column>-->
        <!--<el-table-column-->
                <!--label="创建时间"-->
                <!--prop="formattedCreateTime"-->
                <!--sortable="custom"-->
                <!--width="100"-->
                <!--headerAlign="center" align="center">-->
          <!--<template slot-scope="scope">-->
            <!--<div v-if="Array.isArray(scope.row.formattedCreateTime)">-->
              <!--<div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">-->
                <!--{{item}}-->
              <!--</div>-->
            <!--</div>-->
            <!--<div v-else>{{scope.row.formattedCreateTime}}</div>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column-->
                <!--label="k8s重启时间"-->
                <!--prop="formattedStartTime"-->
                <!--sortable="custom"-->
                <!--width="110"-->
                <!--headerAlign="center" align="center"-->
                <!--v-if="!isMesosService">-->
          <!--<template slot-scope="scope">-->
            <!--<div v-if="Array.isArray(scope.row.formattedStartTime)">-->
              <!--<div v-for="(item, index) in scope.row.formattedStartTime" :key="index">-->
                <!--{{item}}-->
              <!--</div>-->
            <!--</div>-->
            <!--<div v-else>{{scope.row.formattedStartTime}}</div>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column-->
                <!--prop="restartCount"-->
                <!--label="K8s重启次数"-->
                <!--width="100"-->
                <!--headerAlign="center" align="center"-->
                <!--v-if="!isMesosService">-->
        <!--</el-table-column>-->
        <!--<el-table-column label="操作" prop="operation" headerAlign="center" align="center" minWidth="100">-->
          <!--<template slot-scope="scope">-->
            <!--<el-button-->
                    <!--type="text"-->
                    <!--v-if="true"-->
                    <!--:class="['flex', $storeHelper.permission['instance_replace'].disabled || isMesosService || publishStatus? 'disabled' : 'primary']"-->
                    <!--@click="handleRowButtonClick($event, 'instance_replace', scope.$index, scope.row)"-->
            <!--&gt;-->
              <!--<span>驱逐</span>-->
            <!--</el-button>-->
            <!--<div class="ant-divider"></div>-->
          <!--</template>-->
        <!--</el-table-column>-->
      </el-table>
    </div>

    <el-dialog title="手动伸缩" :visible="action.name == 'instance_change_count'"
               :close-on-click-modal="false"
               @close="action.name = null"
               class="manual-scale size-500"
    >
      <el-form labelWidth="150px" size="mini" class="message-show">
        <!--<el-form-item label="总实例数：">-->
          <!--<div>{{instanceStatus.canaryCnt + instanceStatus.masterCnt}}个</div>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="当前灰度实例数：">-->
          <!--<div>{{instanceStatus.canaryCnt}}个</div>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="当前主实例数：">-->
          <!--<div>{{instanceStatus.masterCnt}}个</div>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="调整主实例数为：" :error="manualScale.error">-->
          <!--<el-input-number v-model="manualScale.newCount" :min="1" size="mini"></el-input-number>-->
          <!--<i class="el-icon-question" style="color: #E6A23C; margin-left: 6px;"-->
             <!--v-pop-on-mouse-over="'现在仅支持调整主服务实例数，如需调整灰度服务实例数，请到灰度发布页面进行调整。'">-->
          <!--</i>-->
        <!--</el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent('manualScale')">确&nbsp定</el-button>
        </div>
        <div class="item">
          <el-button  size="mini" @click="action.name = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
</style>
<style lang="scss" scoped>
  #gateway-list {
    background-color: white;
    height:100%;
    max-width: 1500px;
    & > .header {
      padding: 3px 5px;
      font-size: 14px;
      min-height: 28px;
      .item {
        display: inline-block;
        margin-right: 5px;
      }
      .el-select {
        width: 180px;
      }
      .toggle-warning {
        display: inline-block;
        line-height: 24px;
        margin-left: 12px;
        color: #eb9e05;
      }
    }
    > .list {
      position: relative;
    }
  }
</style>

<script>
  import PaasVersionSelector from "../components/version-selector";
  import commonUtils from 'assets/components/mixins/common-utils';

  export default {
    mixins: [commonUtils],
    components: { PaasVersionSelector},

    /**
     * the sequence of create and mount in parent and child element is:
     * create parent -> create children -> mount children -> mount parent
     *
     * as this.config4VersionSelector is used in child component, as it must be set in created method
     */
    created() {
      this.requestList();
    },
    mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);

    },
    beforeDestroy() {
    },
    computed: {
    },
    data() {
      return {
        config4VersionSelector: null,
        appInfo: null,
        profileInfo: null,
        heightOfTable: '',
        gatewayList: []
      };
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
    },
    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          size = this.$storeHelper.screen.size;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight;
          // this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 15 : 12;
        } catch(err) {
        }
      },
      handleSuccessCopy(evt) {
        this.$storeHelper.globalTip.show({
          ref: evt.trigger,
          msg: '复制成功'
        });
      },
      onVersionSelected(appInfo, profileInfo, serviceInfo) {
//        console.log(appInfo, profileInfo, serviceInfo);
        // 获取服务运行时信息
        if (!appInfo || !profileInfo || !serviceInfo) {
          return;
        }
        this.profileInfo = profileInfo;
        // save to localStorage after selected change
        this.$store.dispatch('user/config', {
          page: 'instance',
          data: {
            appId: appInfo.appId,
            profileId: profileInfo.id,
            serviceId: serviceInfo.id
          }
        });
        // 是否mesos服务
//        this.requestInstanceList(
//          appInfo.appId,
//          profileInfo.id,
//        );
      },
      async requestList() {
        this.gatewayList = [];
        const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_list, {
          payload: {
            "groupId": 251,
            "spaceId": 2
          }
        });
        console.log(resData);


      },
      async handleClick(evt, action) {
        switch (action) {
          case 'refresh':
            this.requestList();
            break;
        }

      },
      handleDialogEvent(evt, action) {

      }
    }
  };
</script>
