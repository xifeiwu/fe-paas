<template>
  <div id="manage-app">
    <div class="header">
      <div class="item">
        <label>LOB:</label>
        <el-select filterable v-model="lobId" placeholder="请选择">
          <el-option v-for="(item, index) in lobList" :key="item.id" :label="item.lobName" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="item">
        <label>团队名称:</label>
        <el-select filterable v-model="groupId" placeholder="请选择">
          <el-option v-for="(item, index) in groupList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="item key-word">
        <el-select filterable v-model="keyWordType" placeholder="请选择" class="key-word-type">
          <el-option v-for="(item, index) in keyWordTypeList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
        <el-input
                v-model="keyword"
                size="mini"
                style="max-width: 200px"
                placeholder="按关键字搜索外网二级域名">
        </el-input>
      </div>
      <div class="item">
        <el-button size="mini-extral" @click="handleClick('search')">搜索</el-button>
      </div>
    </div>
    <div class="detail-list">
      <el-table
              :data="appStatusList"
              style="width: 100%"
              stripe
              :height="heightOfTable"
      >
        <el-table-column prop="appName" label="应用名称" width="100"></el-table-column>
        <el-table-column prop="tag" label="项目名称" width="100"></el-table-column>
        <el-table-column label="语言版本" width="100">
          <template slot-scope="scope">
            <span>{{scope.row.language}}</span><span v-if="scope.row.languageVersion">{{scope.row.languageVersion}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lobName" label="LOB" width="100"></el-table-column>
        <el-table-column prop="groupName" label="团队名称" width="100"></el-table-column>
        <el-table-column prop="creator" label="创建人" width="100"></el-table-column>
        <el-table-column prop="profileDesc" label="运行环境（实例数）">
          <template slot-scope="scope">
            <span v-for="(item, index) in scope.row.spaceAndInstanceNum" :key="index">{{item.spaceName}}（{{item.instanceNum}}）</span>
          </template>
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="160"
        >
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="text"
                    @click="handleRowButtonClick('transfer', scope.$index, scope.row)">
              应用转让
            </el-button>
            <el-button
                    size="mini-extral"
                    type="text"
                    :loading="statusOfWaitingResponse('remove') && selected.row.id === scope.row.id"
                    @click="handleRowButtonClick('remove', scope.$index, scope.row)">销毁应用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss">
  #manage-app {
    .header {
      label {
        font-size: 14px;
      }
      .el-input {
        .el-input__inner {
          height: 24px;
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  #manage-app {
    height: 100%;
    .header {
      display: flex;
      padding: 3px 5px;
      background-color: white;
      .item {
        display: inline-block;
        margin-right: 3px;
        &.key-word {
          display: flex;
          width: 300px;
        }
        .el-select {
          max-width: 190px;
          &.key-word-type {
            max-width: 100px;
          }
        }
      }
    }
  }
</style>

<script>
  import {mapState} from "vuex";
  import commonUtils from '$components/mixins/common-utils';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';

  export default {
    mixins: [commonUtils],
    created() {
      Promise.all([
        this.$net.requestPaasServer(this.$net.URL_LIST.lob_list),
        this.$net.requestPaasServer(this.$net.URL_LIST.user_group_list),
      ]).then(resContentList => {
        const lobList = resContentList[0]['lobList'];
        const groupList = resContentList[1]['groupList'];
        this.$store.dispatch('lobList', lobList);
        this.$store.dispatch('groupList', groupList);
        this.lobList = [{id: '', lobName: '全部'}].concat(lobList);
        this.groupList = [{id: '', name: '全部'}].concat(groupList);
//        console.log(resContentList);
      })

    },
    mounted() {
      const headerNode = this.$el.querySelector(':scope > .header');
      this.resizeListener = () => {
        let headerHeight = headerNode.offsetHeight;
        this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
      };
      addResizeListener(this.$el, this.resizeListener)
    },
    beforeDestroy() {
      if (this.showAppList) {
        removeResizeListener(this.$el, this.resizeListener);
      }
    },
    data() {
      return {
        resizeListener: () => {},
        heightOfTable: '',
        lobId: '',
        groupId: '',
        keyword: '',
        keyWordType: 1,
        keyWordTypeList: [{
          id: 1,
          name: '应用名称'
        }, {
          id: 2,
          name: '项目名称'
        }],

        lobList: [],
        groupList: [],
        appStatusList: [],
      }
    },
    computed: {
//      ...mapState(['lobList', 'groupList'])
    },

    methods: {
      handleClick(action) {
        switch (action) {
          case 'search':
            const payload = {
              pageNum: 1,
              pageSize: 10,
            };
            if ('' !== this.lobId) {
              payload.lobId = this.lobId
            }
            if ('' !== this.groupId) {
              payload.groupId = this.groupId;
            }
            this.keyword = this.keyword.trim();
            if (this.keyword.length > 0) {
              if (this.keyWordType === 1) {
                payload['appName'] = this.keyword;
              } else {
                payload['tag'] = this.keyword;
              }
            }
            this.$net.requestPaasServer(this.$net.URL_LIST.app_status_list, {
              payload
            }).then(resContent => {
              this.appStatusList = resContent['backStageList'];
            }).catch(err => {

            })
            break;
        }
      },
      handleRowButtonClick(action, index, row) {

      }
    }
  }
</script>