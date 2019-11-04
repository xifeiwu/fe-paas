<template>
  <div id="gateway-list">
    <div class="header">
      <div class="item">
        <paas-version-selector :customConfig="config4VersionSelector" ref="version-selector"
                               @version-selected="updateServiceSelected"></paas-version-selector>
      </div>
      <div class="item">
        <el-button v-if="true"
                   size="mini"
                   type="primary"
                   @click="handleClick($event, 'refresh')">刷新</el-button>
        <el-button v-if="true"
                   size="mini"
                   type="primary"
                   @click="handleClick($event, 'gateway_create')">创建API</el-button>
      </div>
    </div>
    <div class="list">
      <el-table
              :data="gatewayList"
              style="width: 100%"
              :height="heightOfTable"
      >
        <el-table-column
                label="网关名称"
                prop="gatewayName"
                minWidth="150"
                headerAlign="left" align="left">
        </el-table-column>
        <el-table-column
                label="应用名称"
                prop="appName"
                minWidth="150"
                headerAlign="left" align="left">
        </el-table-column>
        <el-table-column
                label="运行环境"
                prop="profileDescription"
                width="120"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                label="域名"
                prop="domain"
                minWidth="150"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                label="请求路径"
                prop="domain"
                minWidth="100"
                headerAlign="center" align="center">
        </el-table-column>
        <!--<el-table-column-->
                <!--prop="cpuUsageInPercent"-->
                <!--label="CPU使用率"-->
                <!--width="110"-->
                <!--sortable="custom"-->
                <!--headerAlign="center" align="center">-->
        <!--</el-table-column>-->
        <el-table-column
                label="配置时间"
                prop="formattedCreateTime"
                sortable="custom"
                width="100"
                headerAlign="center" align="center">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column
                label="创建人"
                prop="creatorName"
                width="120"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="操作" prop="operation" headerAlign="center" align="center" minWidth="100">
          <template slot-scope="scope">
            <!--<el-button-->
                    <!--type="text"-->
                    <!--v-if="true"-->
                    <!--:class="['flex', $storeHelper.permission['instance_replace'].disabled || isMesosService || publishStatus? 'disabled' : 'primary']"-->
                    <!--@click="handleRowButtonClick($event, 'instance_replace', scope.$index, scope.row)"-->
            <!--&gt;-->
              <!--<span>驱逐</span>-->
            <!--</el-button>-->
            <!--<div class="ant-divider"></div>-->
          </template>
        </el-table-column>
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
          this.heightOfTable = this.$el.clientHeight - headerHeight - 24;
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

      /**
       * get current app/profile(service) selected
       */
      updateServiceSelected() {
        let serviceInfo = this.$refs['version-selector'].getSelectedValue();
        if (!this.$utils.propExists(serviceInfo, 'selectedAPP.appId')) {
          console.log(`selectedApp.appId not exist!`);
          return null;
        }
        if (!this.$utils.propExists(serviceInfo, 'selectedProfile.id')) {
          console.log(`selectedProfile.id not exist!`);
          return null;
        }
        this.appInfo = serviceInfo.selectedAPP;
        this.profileInfo = serviceInfo.selectedProfile;
      },

      async requestList() {
        this.gatewayList = [];
        const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.gateway_list, {
          payload: {
            "groupId": 251,
            "spaceId": 2
          }
        });
        resData.forEach(it => {
          it.gateway = it.gateway ? it.gateway : '---';
          it.appName = it.appName ? it.appName : '---';
          const profileInfo = this.$storeHelper.getProfileInfoByID(it.spaceId);
          it.profileDescription = profileInfo ? profileInfo.description : '---';
          it.domain = (Array.isArray(it.domainList) && it.domainList.length > 0) ? it.domainList.join(', ') : '---';
          if (it['createTimestamp']) {
            it.formattedCreateTime = this.$utils.formatDate(it.createTimestamp, 'yyyy-MM-dd hh:mm:ss').split(' ');
          } else {
            it.formattedCreateTime = '---';
          }
        });
        this.gatewayList = resData;
      },

      async handleClick(evt, action) {
        switch (action) {
          case 'gateway_create':
            this.updateServiceSelected();
            this.$router.push({
              path: this.$router.helper.pages['/profile/gateway/add'].fullPath,
              query: {
                groupId: this.$storeHelper.groupInfo.id,
                appId: this.appInfo.appId,
                spaceId: this.profileInfo.id
              }
            });
            break;
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
