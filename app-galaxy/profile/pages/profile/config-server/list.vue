<template>
    <div v-loading="loading"
         element-loading-text="操作进行中"
         element-loading-spinner="el-icon-loading"
    >
        <div class="pa-3 pt-4" style="background-color: #fff;">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-button type="info" icon="el-icon-back" @click="$router.go(-1)">
                        返回
                    </el-button>
                    <el-button type="success" icon="el-icon-circle-plus-outline"
                               @click="showCreateFileForm=!showCreateFileForm">
                        添加配置文件
                    </el-button>
                </el-col>
                <el-col :span="10">
                    <el-input clearable prefix-icon="el-icon-search" placeholder="请输入关键字搜索文件"
                              v-model="search">
                        <template slot="append">
                            <div class="px-3">
                                <el-button @click="search=''" type="danger">
                                    <i class="el-icon-close"></i>
                                    重置搜索
                                </el-button>
                            </div>
                        </template>
                    </el-input>
                </el-col>
            </el-row>
        </div>
        <!--添加文件表单-->
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
        <!--文件列表-->
        <el-table :data="configFilesFilter" max-height="650" stripe>
            <el-table-column prop="configFileName" label="文件名称">
                <template slot-scope="scope">
                    <el-button type="text" @click="openEditor(scope.row)">
                        <i class="el-icon-document"></i>
                        <span>
                            {{dirSelected.configDirName}} /
                        </span>
                        <span style="font-weight: 800; ">
                           {{ scope.row.configFileName }}
                        </span>
                    </el-button>
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
        <!-- 编辑器 -->
        <el-dialog :visible.sync="showEditor" top="30px" width="80%" :fullscreen="false"
                   v-loading="saveFileLoading"
                   element-loading-text="正在保存"
                   element-loading-spinner="el-icon-loading"
                   element-loading-background="rgba(0, 0, 0, 0.8)"
        >
            <div class="py-3" style="width: 80%; text-align: left;">
                <h4>
                    <span style="color: red;">
                    {{dirSelected.configDirName}}/{{currentEditFile ? currentEditFile.configFileName: ''}}
                    </span>
                </h4>
            </div>
            <div class="__editor">
                <codemirror v-model="form.code" :options="editorOptions"></codemirror>
            </div>
            <div class="pt-3" style="width: 80%; text-align: left;">
                <el-form :model="form" ref="editFileForm">
                    <el-form-item prop="commitMessage" :rules="[{ required: true, message: '修改说明不能为空'}]">
                        <el-input v-model="form.commitMessage" placeholder="必填： 请输入修改说明,将用于 git 提交">
                            <template slot="prepend">
                                <div>&emsp;修改说明：</div>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer" class="pa-3" style="text-align: center">
                <el-button type="success" size="medium" @click="saveFile('editFileForm')">&emsp;保 存 修 改&emsp;
                </el-button>
                <el-button type="danger" size="medium" @click="showEditor = false">&emsp;取 消 修 改&emsp;</el-button>
            </div>
        </el-dialog>
    </div>

</template>

<script>
  import {mapState} from "vuex";
  import axios from 'axios';
  import {codemirror} from "vue-codemirror";
  import "codemirror/lib/codemirror.css";

  // language
  import "codemirror/mode/css/css.js";
  // theme
  import "codemirror/theme/monokai.css";
  // require active-line.js
  import "codemirror/addon/selection/active-line.js";

  export default {
    mounted() {
      this.$store.dispatch('etc/getFiles', this.dirSelected.id);
    },
    components: {
      codemirror
    },
    data() {
      return {
        saveFileLoading: false,
        currentEditFile: null,
        showCreateFileForm: false,
        search: "",
        showEditor: false,
        form: {
          configFileName: "",
          extName: '.properties',
          code: "",
          commitMessage: ""
        },
        editorOptions: {
          tabSize: 4,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          mode: "text/css",
          theme: "monokai",
          readOnly: false,
          viewportMargin: 10
        }
      };
    },
    computed: {
      ...mapState("etc", ["configFiles", "dirSelected", 'loading']),
      configFilesFilter() {
        let data = this.configFiles || [];
        data = data.sort((a, b) => b.updateTime - a.updateTime);
        const search = this.search;
        return search
          ? data.filter(item => Object.values(item).join(",").toLowerCase().match(search))
          : data;
      }
    },
    filters: {
      localDate(val) {
        return new Date(val).toLocaleString();
      },
    },
    methods: {
      changeExtName(val) {
        this.form.extName = val;
      },
      createFile() {
        // todo validate form
        this.$refs['createFileForm'].validate((valid) => {
          if (!valid) return false;
          // show loading
          this.$store.commit('etc/SET_LOADING', true);
          let payload = {
            "applicationRemoteConfigId": this.dirSelected.id,
            "configFileName": this.form.configFileName.trim() + this.form.extName,
          };
          this.$ajax.post(this.$url.config_server_file_add.url, payload)
            .then(res => {
              if (!res.data.hasOwnProperty('success')) return alert(res.data.msg);
              this.$store.dispatch('etc/getFiles', this.dirSelected.id);
              this.showCreateFileForm = false;
            })
            .catch(err => this.$alert('系统错误：创建配置文件时失败，请联系管理员' + err.message))
            .finally(() => this.$store.commit('etc/SET_LOADING', false))
        })
      },
      openEditor(val) {
        this.$store.commit('etc/SET_LOADING', true);
        this.currentEditFile = val;
        // 清空commitMessage
        this.form.commitMessage = ''
        this.$ajax
          .get(this.$url.config_server_file_content.url + '?applicationRemoteConfigFileId=' + val.id)
          .then(res => {
            this.form.code = res.data.content.fileContent;
            this.showEditor = true;
          })
          .catch(err => this.$alert('系统错误：获取配置文件内容失败，请联系管理员' + err.message))
          .finally(() => this.$store.commit('etc/SET_LOADING', false))
      },
      saveFile(formName) {
        this.$refs[formName].validate(valid => {
          if (!valid) return false;
          this.saveFileLoading = true;
          this.$ajax
            .request({
              method: 'post',
              url: this.$url.config_server_file_edit.url,
              params: {applicationRemoteConfigFileId: this.currentEditFile.id,}
            })
            .then(res => {
              console.log('lock', res);
              return axios.request({
                method: 'post',
                url: this.$url.config_server_file_save.url,
                data: {
                  applicationRemoteConfigFileId: this.currentEditFile.id,
                  commitMessage: this.form.commitMessage,
                  fileContent: this.form.code
                },
                // headers: {'Content-Type': 'text/plain'}
              })
            })
            .then(res => {
              console.log('save', res);
              if(!res.data.hasOwnProperty('success')) return alert(res.data.msg);
              this.showEditor = false;
              this.$store.dispatch('etc/getFiles', this.dirSelected.id);
            })
            .catch(err => {
              console.log(err);
              alert('文件保存失败，请联系paas平台组')
            })
            .finally(() => this.saveFileLoading = false);
        })
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