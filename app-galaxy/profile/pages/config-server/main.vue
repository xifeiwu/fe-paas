<template>
  <div id="config-server-list"
          v-loading="loading"
          element-loading-text="操作进行中"
          element-loading-spinner="el-icon-loading"
          style="flex: 1"
  >
    <div class="pa-3 pt-4" style="background-color: #fff;">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline"
                     @click="handleClick($event, 'open_dialog_create_directory')">
            创建目录
          </el-button>
          <el-button type="primary" size="mini" icon="el-icon-refresh"
                     @click="handleClick($event, 'refresh')">
            刷新目录
          </el-button>
        </el-col>
        <el-col :span="10">
          <el-input size="mini-extral" placeholder="按关键字搜索目录" class="search"
                    style="max-width: 360px;"
                    v-model="filterKey">
            <i slot="prefix" class="el-icon-search"></i>
            <i :class="filterKey && filterKey.length > 0 ? 'paas-icon-close' : ''"
               slot="suffix"
               @click="evt => filterKey=''"></i>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <el-dialog title="创建目录"
               :visible="['open_dialog_create_directory'].indexOf(action.name) > -1"
               v-if="['open_dialog_create_directory'].indexOf(action.name) > -1"
               @close="closeDialog"
               class="size-600 create_directory"
               :close-on-click-modal="false"
    >
      <el-form labelWidth="100px" :model="action.data" :rules="rules" size="mini" ref="createDialogForm">
        <el-form-item prop="groupId" label="团队">
          <el-select v-model="action.data.groupId" filterable placeholder="请选择团队">
            <el-option v-for="(item, index) in $storeHelper.groupList" :key="index" :label="item.asLabel":value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="branchName" label="分支">
          <el-select v-model="action.data.branchName" filterable placeholder="请选择分支">
            <el-option v-for="(item, index) in branchList" :key="index" :label="item"
                       :value="item">
            </el-option>
          </el-select>
        </el-form-item>
            <el-form-item prop="configDirName" label="目录名称">
              <el-input v-model="action.data.configDirName" auto-complete="off" placeholder="例如: foo-bar-some">
              </el-input>
            </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="mini"
                     @click="handleDialogEvent($event, action.name.replace('open_dialog_', ''))">保存</el-button>
        </div>
        <div class="item">
          <el-button @click="closeDialog" size="mini">取消</el-button>
        </div>
      </div>
    </el-dialog>

    <!--目录列表-->
    <el-table :data="configListByPage">
      <el-table-column prop="configDirName" label="目录名称" :width="320"
                       :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-button type="text" @click="gotoFileList(scope.row)">
            <i class="el-icon-news"></i>
            <span style="margin-left: 6px; font-weight: 800; ">
              {{ scope.row.configDirName }}
              </span>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="groupId" label="团队名称" :width="180">
        <template slot-scope="scope">
          {{scope.row.groupName}}
        </template>
      </el-table-column>
      <el-table-column prop="branchName" label="分支" :width="120">
        <template slot-scope="scope">
          <el-tag size="small" type="danger">{{scope.row.branchName}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastCommitMessage" label="最后修改">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>
            {{ scope.row.updateTime | localDate }} &emsp;&emsp;
          </span>
          <span style="margin-left: 6px; font-weight: 800;">
            {{ scope.row.lastOperateUserName || scope.row.creatorName }} |
            {{ scope.row.lastCommitMessage }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    <div class="pa-4" style="text-align: center; background-color: white;">
      <el-pagination
              @size-change="handleSizeChange"
              background
              :current-page.sync="currentPage"
              :page-size="pageSize"
              :page-sizes="[10, 15, 20, 30]"
              layout="total, sizes, prev, pager, next"
              :total="this.configListFiltered.length">
      </el-pagination>
    </div>
  </div>
</template>
<style lang="scss">
  #config-server-list {
    > .el-dialog__wrapper {
      &.create_directory {
        .el-form {
          margin-top: 16px;
          margin-right: 20px;
          .el-select {
            width: 100%;
          }
          .el-input {
            width: 100%;
          }
        }
      }
    }
  }
</style>
<script>
  import {mapState} from "vuex";
  import commonUtils from 'assets/components/mixins/common-utils';

  export default {
    mixins: [commonUtils],
    mounted() {
//      this.$store.dispatch('etc/initData');
      this.updateConfigListByPage(true);
    },
    data() {
      return {
        configList: [],
        configListFiltered: [],
        configListByPage: [],
        branchList: [],
        filterKey: '',
        rules: {
          configDirName: [
            {required: true, pattern: /^[a-z][a-z0-9-]{0,100}$/, message: '有效字符包括 a-z,0-9,中横线 例如：foo-bar-name'},
          ],
          groupId: [{required: true, type: 'number', message: '请选择团队', trigger: 'change'},],
          branchName: [{required: true, message: '请选择分支', trigger: 'change'}],
        },
        form: {
          configDirName: "",
          branchName: ""
        },
        currentPage: 1,
        pageSize: 10
      };
    },
    computed: {
      ...mapState("etc", ["loading"]),
    },
    watch: {
      filterKey() {
        this.updateConfigListByPage(false);
      },
      currentPage() {
        this.updateConfigListByPage(false);
      }
    },
    filters: {
      localDate(val) {
        return new Date(val).toLocaleString();
      }
    },
    methods: {
      handleSizeChange(val) {
        this.pageSize = val;
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      async requestConfigList() {
        var configList = [];
        try {
          configList = (await this.$net.requestPaasServer(this.$net.URL_LIST.config_server_list, {
            query: {
              groupId: ''
            }
          }))['data'];
          configList = configList.sort((a, b) => b.updateTime - a.updateTime);
        } catch (err) {
          consle.log(err);
        }
        return configList;
      },
      async updateConfigListByPage(refresh = false) {
        if (refresh) {
          this.configList = await this.requestConfigList();
        }
        var filterReg = null;
        if (this.filterKey) {
          filterReg = new RegExp(this.filterKey);
        }

        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;
        let end = start + length;

        const configListFiltered = this.configList.filter(it => {
          if (filterReg) {
            return filterReg.test(Object.values(it).join(",").toLowerCase());
          } else {
            return true;
          }
        });
        const configListByPage = configListFiltered.slice(start, end);
        this.configListFiltered = configListFiltered;
        this.configListByPage = configListByPage;
      },

      async handleClick(evt, action, row, index) {
        switch (action) {
          case 'open_dialog_create_directory':
            try {
              if (!Array.isArray(this.branchList)) {
                this.branchList = [];
              }
              if (this.branchList.length == 0) {
                this.branchList = await this.$net.requestPaasServer(this.$net.URL_LIST.config_server_branch);
              }
              const dialogData = await this.openDialog(action, {
                configDirName: '',
                groupId: '',
                branchName: '',
              });
              await this.$net.requestPaasServer(this.$net.URL_LIST.config_server_add, {
                payload: dialogData
              });
              this.$message.success(`${dialogData.configDirName} 创建成功`);
              // 清空搜索
              this.closeDialog();
              this.updateConfigListByPage(true);
            } catch(err) {

            } finally {
              this.closeDialog();
            }
            break;
          case 'refresh':
            this.updateConfigListByPage(true);
            break;
        }
      },
      async handleDialogEvent(evt, action, data) {
        switch (action) {
          case 'create_directory':
            try {
              await this.$refs['createDialogForm'].validate();
              this.action.promise.resolve(this.action.data);
            } catch (err) {
            }
            break;
        }
      },
      // 跳转到文件列表
      gotoFileList(val) {
        this.$store.commit("etc/SET_DIR_SELECTED", val);
        this.$router.push({path: '/profile/config-server/list'})
      }
    }
  };
</script>
