<template>
  <div id="service-gray">
    <div class="header">
      <el-button size="mini" type="primary" style="margin-right: 5px" @click="handleClick($event, 'open_dialog_service_gray_create')">
        <span>创建灰度版本</span>
      </el-button>
      <el-button size="mini" type="primary" style="margin-right: 5px" @click="handleClick($event, 'service_gray_strategy')">
        <span>设置灰度策略</span>
      </el-button>
      <el-button size="mini" type="primary" style="margin-right: 5px" @click="handleClick($event, 'refresh')">
        <span>刷新</span>
        <i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
      </el-button>
    </div>
    <div class="list">
      <el-table :data="serviceList"
                stripe>
        <el-table-column label="服务版本" prop="serviceTypeName"></el-table-column>
        <el-table-column label="运行实例数/总实例数" prop="instanceStatus" headerAlign="center" align="center" width="200">
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="action.name == 'open_dialog_service_gray_create'? '创建灰度版本':''"
               :visible="['open_dialog_service_gray_create', 'open_dialog_modify'].indexOf(action.name) > -1"
               v-if="['open_dialog_service_gray_create'].indexOf(action.name) > -1"
               @close="closeDialog"
               class="size-900 dialog-add"
               :close-on-click-modal="false"
               top="80px"
    >
      <div class="content">
      </div>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="small"
                     @click="handleDialogEvent($event, action.name)">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button @click="closeDialog" size="small">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
  #service-gray {
    background-color: white;
    height:100%;
    max-width: 1500px;
    display: flex;
    flex-direction: column;
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
    & > .list {
      flex: 1;
    }
  }
</style>
<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  export default {
    mixins: [commonUtils],
    async created() {
      if (this.$route.params && this.$route.params.hasOwnProperty('id')) {
        this.serviceId = this.$route.params['id'];
      }
      if (!this.serviceId) {
        this.$message.error('未找到serviceId');
        this.$router.push(this.$router.helper.pages['/profile/service/list']);
        return;
      }
      this.requestServiceList();
    },
    async mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    data() {
      return {
        serviceId: null,
        serviceList: [],
      }
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
        } catch(err) {
        }
      },
      async requestServiceList() {
        this.serviceList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_gray_list, {
          query: {
            configId: this.serviceId
          }
        });
        const postTreat = it => {
          if (it.hasOwnProperty('containerStatus') && this.$utils.hasProps(it['containerStatus'], 'Running', 'Total')) {
            it.instanceStatus = `${it['containerStatus']['Running']}/${it['containerStatus']['Total']}`
          } else {
            it.instanceStatus = '---/---';
          }
          it.formattedCreateTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
          return it;
        };

        // console.log(resContent);
        if (resContent['master']) {
          resContent['master']['serviceType'] = 'master';
          resContent['master']['serviceTypeName'] = '主服务';
          this.serviceList.push(postTreat(resContent['master']));
        }
        // console.log(this.serviceList);
      },
      async getData4GrayCreate() {
        var resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_id, {
          params: {
            id: this.serviceId
          }
        });
//        console.log(resContent);
        const serviceInfo = this.$net.getServiceModel(resContent);
        const profileInfo = this.$storeHelper.getProfileInfoByID(serviceInfo.spaceId);
        const theData = {
          profileInfo,
          serviceInfo
        };
        console.log(theData);
        return theData;
      },
      async handleClick(evt, action, data) {
        switch (action) {
          case 'open_dialog_service_gray_create':
            try {
              await this.getData4GrayCreate();
              await this.openDialog(action);
            } catch (err) {
              console.log(err);
            }
            break;
          case 'service_gray_strategy':
            break;
          case 'refresh':
            this.requestServiceList();
            break;
        }
      }
    }
  }
</script>