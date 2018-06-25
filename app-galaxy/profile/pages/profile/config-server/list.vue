<template>
    <div>
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
                <el-col :span="12">
                    <el-input clearable prefix-icon="el-icon-search" placeholder="请输入关键字搜索文件"
                              v-model="search">
                    </el-input>
                </el-col>
            </el-row>
        </div>
        <!--添加文件表单-->
        <div v-if="showCreateFileForm" class="px-3 pt-3">
            <el-form :model="form" ref="createFileForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item prop="configFileName" :rules="[{ required: true, message: '文件名称不能为空'}]">
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
        <el-table :data="configFiles" max-height="650" stripe>
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
        <el-dialog :visible.sync="showEditor" top="30px" width="80%" :fullscreen="false">
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
                <el-button type="success" size="medium" @click="saveFile('editFileForm')">&emsp;保 存 修 改&emsp;</el-button>
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
      ...mapState("etc", ["configFiles", "dirSelected"]),
    },
    filters: {
      localDate(val) {
        return new Date(val).toLocaleString();
      },
      fullPath(val) {
        return ' / ' + val;
      }
    },
    methods: {
      changeExtName(val) {
        this.form.extName = val;
      },
      createFile() {
        // todo validate form
        this.$refs['createFileForm'].validate((valid) => {
          if (!valid) return false;

          let payload = {
            "applicationRemoteConfigId": this.dirSelected.id,
            "configFileName": this.form.configFileName.trim() + this.form.extName,
          };
          this.$store.dispatch('etc/addFile', payload);
          this.showCreateFileForm = false;
        })
      },
      openEditor(val) {
        this.currentEditFile = val;
        this.dialogTitle = "编辑配置文件";
        axios.get('http://localhost:7002/api/applicationRemoteConfigFile/remote-config/content?applicationRemoteConfigFileId=' + val.id)
          .then(res => {
            this.form.code = res.data.content.fileContent;
            this.showEditor = true;
          })
      },
      saveFile(formName) {
        this.$refs[formName].validate(valid => {
          if (!valid) return false;

          const baseurl = 'http://localhost:7002/api/applicationRemoteConfigFile';
          const editPath = '/update/edit-status?applicationRemoteConfigFileId=' + this.currentEditFile.id;
          const savePath = '/update?applicationRemoteConfigFileId=' + this.currentEditFile.id + '&commitMessage=' + this.form.commitMessage;
          this.$ajax.post(baseurl + editPath)
            .then(res => {
              console.log('lock', res);
              return axios.request({
                url: baseurl + savePath,
                method: 'post',
                data: this.form.code,
                headers: {
                  'Content-Type': 'text/plain'
                }
              })
            })
            .then(res => {
              console.log('save', res);
              this.showEditor = false;
              this.$store.dispatch('etc/getFiles', this.dirSelected.id);
            });
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

