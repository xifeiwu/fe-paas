<template>
    <div v-loading = "loading"
         element-loading-text="拼命加载中"
         element-loading-spinner="el-icon-loading"
    >
        <div class="pa-3 pt-4" style="background-color: #fff;">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-button type="primary" icon="el-icon-circle-plus-outline"
                               @click="dialogCreateFolder = !dialogCreateFolder">
                        创建目录
                    </el-button>
                </el-col>
                <el-col :span="12">
                    <el-input clearable prefix-icon="el-icon-search" placeholder="请输入关键字搜索目录" @change="syncSearchState"
                              v-model="search">
                    </el-input>
                </el-col>
            </el-row>
        </div>
        <!--创建目录表单-->
        <div v-if="dialogCreateFolder" class="px-3">
            <el-form :model="form" :rules="rules" ref="configDirForm" class="mt-3">
                <el-row>
                    <el-col :span="6">
                        <el-form-item prop="configDirName">
                            <el-input v-model="form.configDirName" auto-complete="off" prefix-icon="el-icon-news"
                                      placeholder="目录名称,例如: foo-bar-some">
                                <!--<template slot="prepend">-->
                                <!--<div>&emsp;目录名称：</div>-->
                                <!--</template>-->
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4" class="pl-2">
                        <el-form-item prop="groupId">
                            <el-select v-model="form.groupId" filterable placeholder="请选择团队">
                                <el-option v-for="(item, index) in groupList" :key="index" :label="item.asLabel"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4">
                        <el-form-item prop="branchName">
                            <el-select v-model="form.branchName" filterable placeholder="请选择分支">
                                <el-option v-for="(item, index) in branchList" :key="index" :label="item" :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4">
                        <el-form-item>
                            <el-button type="success" @click="createFolder('configDirForm')">
                                确 定 创 建
                            </el-button>
                            <el-button type="danger" @click="dialogCreateFolder = false">取 消 创 建</el-button>
                        </el-form-item>
                    </el-col>
                </el-row>


            </el-form>
        </div>
        <!--目录列表-->
        <el-table :data="configList" max-height="650" stripe>
            <el-table-column prop="configDirName" label="目录名称" :width="320">
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
                    {{groupNameMap.get(scope.row.groupId)}}
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
                    <span style="margin-left: 6px; font-weight: 800;">
                        {{ scope.row.lastOperateUserName || scope.row.creatorName }} | {{ scope.row.lastCommitMessage }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="" :width="200">
                <template slot-scope="scope">
                    <span>
                        {{ scope.row.updateTime | localDate }}
                    </span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
  import {mapState} from "vuex";

  export default {
    mounted() {
      if (!this.configList.length) {
        this.$store.dispatch('etc/initData');
      }
    },
    data() {
      return {
        rules: {
          configDirName: [
            {required: true, min: 3, message: '目录名称不能为空'},
          ],
          groupId: [{required: true, type: 'number', message: '请选择团队', trigger: 'change'},],
          branchName: [{required: true, message: '请选择分支', trigger: 'change'}],
        },
        dialogCreateFolder: false,
        search: this.$store.state.etc.dirFilter,
        form: {
          configDirName: "",
          branchName: ""
        }
      };
    },
    computed: {
      ...mapState("etc", ["branchList", "remoteConfigList", "loading"]),
      ...mapState("user", ["groupList"]),
      configList() {
        let data = this.remoteConfigList || [];
        data = data.sort((a, b) => b.updateTime - a.updateTime);
        const search = this.search;
        return search
          ? data
            .filter(item => Object.values(item).join(",").toLowerCase().match(search))
          : data;
      },
      groupNameMap() {
        const _groupNameMap = new Map();
        this.groupList.forEach(item => {
          _groupNameMap.set(item.id, item.asLabel)
        })
        return _groupNameMap;
      }
    },
    filters: {
      localDate(val) {
        return new Date(val).toLocaleString();
      }
    },
    methods: {
      createFolder(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) return false;
          this.$ajax
            .post(this.$url.config_server_add.url, {
              branchName: this.form.branchName,
              configDirName: this.form.configDirName,
              groupId: this.form.groupId
            })
            .then(res => {
              if (!res.data.hasOwnProperty('success')) return alert(res.data.msg);
              this.$store.dispatch('etc/getDir')
              this.dialogCreateFolder = false;
            })
        })
      },
      syncSearchState() {
        // todo sync search to store/etc
        this.$store.commit("etc/SET_DIR_FILTER", this.search);
      },
      // 跳转到文件列表
      gotoFileList(val) {
        this.$store.commit("etc/SET_DIR_SELECTED", val);
        this.$router.push({path: '/config-server/list'})
      }
    }
  };
</script>
