<template>
  <div id="config-server-file-list">
    <div class="header">
      <el-row type="flex" justify="center" align="middle">
        <el-col :span="10">
          <el-button type="success" size="mini" icon="el-icon-circle-plus-outline"
                     @click="handleClick($event, 'config-file-add')">
            添加配置文件
          </el-button>
          <el-button type="primary" size="mini" icon="el-icon-refresh"
                     @click="handleClick($event, 'refresh')">刷新</el-button>
        </el-col>
        <el-col :span="1">
          <span>&nbsp</span>
        </el-col>
        <el-col :span="13">
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
      <div v-if="showCreateFileForm" class="px-3 pt-3">
        <el-form :model="form" :ref="'createFileForm'">
          <el-row>
            <el-col :span="12">
              <el-form-item prop="configFileName"
                            :rules="[{required: true, pattern: /^[a-z][a-z0-9.-]{0,100}$/, message: '有效字符包括 a-z,0-9及 . 和 - 例如: app-config' }]">
                <el-input v-model="form.configFileName" placeholder="请输出文件名称">
                  <template slot="prepend">
                    <div>&emsp;文件名称：</div>
                  </template>
                  <template slot="append">
                    <div class="px-3">
                      <el-dropdown @command="changeExtName">
                  <span class="el-dropdown-link">
                    {{form.extName}} <i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item command=".properties"><strong>.properties</strong>
                          </el-dropdown-item>
                          <el-dropdown-item command=".yml"><strong>.yml</strong>
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="1">
              <el-form-item>
                <el-button type="primary" @click="createFile">确认添加</el-button>
                <el-button type="warning" @click="showCreateFileForm = false">取消添加</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    <!--文件列表-->
    <div class="list">
      <el-table :data="configFilesFilter" stripe
                :height="heightOfTable">
        <el-table-column prop="configFileName" label="文件名称">
          <template slot-scope="scope">
            <div>
              <i class="el-icon-document"></i>
              <span @click="handleTRClick($event, 'open_dialog_update_config', scope.row)" class="to-file-list">{{dirSelected.configDirName}}/{{ scope.row.configFileName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="文件版本" :width="300">
        </el-table-column>
        <el-table-column prop="updateTime" label="最后修改时间" :width="300">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            {{scope.row.updateTime || scope.row.createTime | localDate}}
        </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 编辑器 -->
    <el-dialog :title="`修改配置${action.data.configDirName}/${action.data.configFileName}`"
               :visible.sync="action.name == 'open_dialog_update_config'"
               v-if="action.name == 'open_dialog_update_config'"
               class="update_config size-1200"
               @close="closeDialog"
               bodyPadding="0px"
               top="50px"
    >
      <paas-dismiss-message :toExpand="true" showSeconds="0" style="margin: 2px 0px;"
                            :msgList="'提示:类似“datasource.*.password”的字段值仅DBA岗位用户可以修改和查看，其他岗位用户只会看到“********”并且无法修改该字段值'"></paas-dismiss-message>
      <el-form size="mini" :model="action.data" ref="updateConfigForm"
               v-loading="action.requesting"
               element-loading-text="正在保存"
               element-loading-spinner="el-icon-loading"
               element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-form-item class="__editor message-show" labelWidth="0px">
          <codemirror v-model="action.data.code" :options="editorOptions"></codemirror>
        </el-form-item>
        <el-form-item label="修改说明" labelWidth="100px" prop="commitMessage" :rules="[{ required: true, message: '修改说明不能为空'}]">
          <el-input v-model="action.data.commitMessage" placeholder="请输入修改说明,将用于 git 提交"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="danger" size="mini" @click="handleDialogEvent($event, action.name.replace('open_dialog_', ''))">保存修改</el-button>
        </div>
        <div class="item">
          <el-button type="danger" size="mini" @click="handleDialogEvent($event, 'remove_config')">删除配置</el-button>
        </div>
        <div class="item">
          <el-button type="success" size="mini" @click="closeDialog">取消修改</el-button>
        </div>
      </div>
    </el-dialog>
  </div>

</template>
<style lang="scss" scoped>
  #config-server-file-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 1300px;
    background: white;
    > .header {
      padding: 3px 5px;
      font-size: 14px;
      .el-row {
        .el-col {
          &:nth-child(3) {
            text-align: right;
            .el-input {
              margin-left: 5px;
            }
          }
        }
      }
    }
    > .list {
      flex: 1;
      position: relative;
      .el-table {
        .to-file-list {
          font-family: monospace;
          cursor: pointer;
          color: $--color-primary;
          &:hover {
            font-weight: 800;
          }
        }
      }
    }
  }
</style>

<script>
  import {codemirror} from "vue-codemirror";
  import "codemirror/lib/codemirror.css";

  // language
  import "codemirror/mode/properties/properties.js";
  import "codemirror/mode/yaml/yaml.js";
  // theme
  import "codemirror/theme/monokai.css";
  // require active-line.js
  import "codemirror/addon/selection/active-line.js";
  import paasDismissMessage from 'assets/components/dismiss-message';
  import commonUtils from 'assets/components/mixins/common-utils';

  export default {
    mixins: [commonUtils],
    created() {
      if (this.$route.params && this.$route.params.hasOwnProperty('id')) {
        this.dirId = this.$route.params['id'];
      }
      this.dirSelected = this.$storeHelper.getUserConfig('config-server.dir');
      if (!this.dirId || !this.dirSelected || (this.dirId != this.dirSelected.id)) {
        this.$message.error('信息不完整！');
        this.$router.helper.goUp(this.$route.path);
        return;
      }
      this.requestConfigFileList();
    },
    mounted() {
      // update value in next tick
      this.$nextTick(() => {
        const routeConfig = this.$router.helper.getConfigByFullPath('/profile/config-server/:id(\\d+)');
        if (routeConfig) {
          routeConfig.name = `${this.dirSelected.configDirName}`;
        }
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
    },
    components: {
      codemirror, paasDismissMessage
    },
    data() {
      return {
        dirId: null,
        dirSelected: null,
        configFiles: [],
        heightOfTable: '',
        showCreateFileForm: false,
        filterKey: "",
        form: {
          configFileName: "",
          extName: '.properties',
        },
        editorOptions: {
          tabSize: 4,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          mode: "text/x-properties",
          theme: "monokai",
          readOnly: false,
          viewportMargin: 10
        }
      };
    },
    computed: {
      configFilesFilter() {
        let data = this.configFiles || [];
        data = data.sort((a, b) => b.updateTime - a.updateTime);
        const filterKey = this.filterKey;
        return filterKey
          ? data.filter(item => Object.values(item).join(",").toLowerCase().match(filterKey))
          : data;
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
    },
    filters: {
      localDate(val) {
        return new Date(val).toLocaleString();
      },
    },
    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          return;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - 24;
        } catch(err) {
        }
      },
      async handleClick(evt, action) {
        switch (action) {
          case 'config-file-add':
            this.showCreateFileForm = !this.showCreateFileForm;
            this.$nextTick(() => {
              this.onScreenSizeChange(this.$storeHelper.screen.size);
            });
            break;
          case 'refresh':
            this.requestConfigFileList();
            break;
        }
      },

      async requestConfigFileList() {
        const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.config_server_file_list, {
          query: {
            applicationRemoteConfigId: this.dirId
          }
        });
        this.configFiles = resData;
      },

      changeExtName(val) {
        this.form.extName = val;
      },

      async createFile() {
        try {
          await this.$refs['createFileForm'].validate();
          const payload = {
            "applicationRemoteConfigId": this.dirSelected.id,
            "configFileName": this.form.configFileName.trim() + this.form.extName,
            "groupId": this.dirSelected.groupId,
          };
          await this.$net.requestPaasServer(this.$net.URL_LIST.config_server_file_add, {
            payload
          });
          this.requestConfigFileList();
        } catch (err) {
          console.log(err);
        } finally {
          this.showCreateFileForm = false;
        }
      },

      async handleDialogEvent(evt, action) {
        switch (action) {
          case 'update_config':
            try {
              await this.$refs['updateConfigForm'].validate();
              this.action.promise.resolve(this.action.data);
            } catch(err) {
              console.log(err);
            }
            break;
          case 'remove_config':
            try {
              await this.$confirm(`确定要删除配置${this.action.data.configDirName}/${this.action.data.configFileName}吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              this.action.requesting = true;
              await this.$net.requestPaasServer(this.$net.URL_LIST.config_server_file_del, {
                payload: {
                  id: this.action.data.id
                }
              });
              this.$message.success(`配置${this.action.data.configDirName}/${this.action.data.configFileName}已删除！`);
              this.closeDialog();
              this.requestConfigFileList();
            } catch (err) {
              console.log(err);
            } finally {
              this.action.requesting = false;
            }
            break;
        }
      },

      async handleTRClick(evt, action, row) {
        switch (action) {
          case 'open_dialog_update_config':
            // editor mode
            this.editorOptions.mode = /yml/.test(row.configFileName) ? 'text/yaml' : 'text/x-properties';

            try {
              const resData = await this.$net.requestPaasServer(this.$net.URL_LIST.config_server_file_content, {
                query: {
                  applicationRemoteConfigFileId: row.id
                }
              });
              const dialogData = await this.openDialog(action, {
                id: resData.id,
                groupId: resData.groupId,
                configDirName: resData.configDirName,
                configFileName: resData.configFileName,
                code: resData.fileContent,
                commitMessage: '',
              });
              this.action.requesting = true;
              await this.$net.requestPaasServer(this.$net.URL_LIST.config_server_file_edit, {
                query: {
                  applicationRemoteConfigFileId: dialogData.id
                }
              });
              await this.$net.requestPaasServer(this.$net.URL_LIST.config_server_file_save, {
                payload: {
                  applicationRemoteConfigFileId: dialogData.id,
                  commitMessage: dialogData.commitMessage,
                  fileContent: dialogData.code,
                  groupId: dialogData.groupId,
                }
              });
            } catch (err) {
              console.log(err);
            } finally {
              this.action.requesting = false;
              this.closeDialog();
            }
            break;
        }
      },
    }
  };
</script>

<style lang="scss">
    .__editor {
        text-align: left;
        min-height: 400px;
        .CodeMirror {
            min-height: 480px;
        }
    }
</style>