<template>
    <div>
        <div class="py-3" style="background-color: #fff;">
            <el-row :gutter="20">
                <el-col :span="10" class="px-4">
                    <el-input clearable prefix-icon="el-icon-search" placeholder="请输入关键字搜索目录" @change="syncSearchState" v-model="search">
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button type="primary"  icon="el-icon-circle-plus-outline" @click="dialogCreateFolder = true">
                        创建目录
                    </el-button>
                </el-col>
            </el-row>
        </div>
        <el-table :data="configList" max-height="650" stripe>
            <el-table-column prop="configDirName" label="目录名称" :width="320">
                <template slot-scope="scope">
                    <i class="el-icon-news"></i>
                    <router-link :to="'/config-server/list/' + scope.row.configDirName">
                        <span style="margin-left: 6px; font-weight: 800;color: #097aa9;">
                            {{ scope.row.configDirName }}
                        </span>
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column prop="groupId" label="团队名称" :width="120">
            </el-table-column>
            <el-table-column prop="branchName" label="分支" :width="120">
                <template slot-scope="scope" >
                    <el-tag size="small">{{scope.row.branchName}}</el-tag>
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

        <el-dialog title="创建目录" :visible.sync="dialogCreateFolder" class="size-500">
            <!-- <div class="py-3 algin-left">
                <el-input v-model="form.name" auto-complete="off" prefix-icon="el-icon-news" placeholder="请输入目录名称"></el-input>
                <div class="pa-3"></div>
                <el-select v-model="form.branch" filterable placeholder="请选择分支">
                    <el-option v-for="(item, index) in branchList" :key="index" :label="item" :value="item">
                    </el-option>
                </el-select>
            </div> -->

            <el-form :model="form" class="mt-3">
                <el-form-item label="" :label-width="formLabelWidth">
                    <el-input v-model="form.name" auto-complete="off" prefix-icon="el-icon-news" placeholder="例如: foo-bar-some">
                        <template slot="prepend">
                            <div>&emsp;目录名称：</div>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <el-select v-model="form.branch" filterable placeholder="请选择分支">
                        <el-option v-for="(item, index) in branchList" :key="index" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="pb-2">
                <el-button @click="dialogCreateFolder = false" >取 消</el-button>
                <el-button type="primary" @click="createFolder" >确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
// const mapState = (that, moduleName) => that['$store']['state'][moduleName]
import { mapState } from "vuex";
export default {
  data() {
    return {
      dialogCreateFolder: false,
      formLabelWidth: 100,
      search: this.$store.state.etc.dirFilter,
      form: {
        name: "",
        branch: ""
      }
    };
  },
  computed: {
    ...mapState("etc", ["branchList", "remoteConfigList"]),
    configList() {
      const data = this.remoteConfigList || [];
      const search = this.search;
      return search
        ? data.filter(item =>
            Object.values(item)
              .join(",")
              .toLowerCase()
              .match(search)
          )
        : data;
    }
  },
  filters: {
    localDate(val) {
      return new Date(val).toLocaleString();
    }
  },
  mounted(){
      this.fetchConfigList();
  },
  methods: {
    fetchConfigList() {
        console.log('commit a action to get remoteConfigList')
    },
    createFolder() {
      alert("createFolder success");
      this.dialogCreateFolder = false;
    },
    syncSearchState() {
      // 同步到 store/etc
      this.$store.commit("etc/SET_DIR_SELECTED", this.search);
    }
  }
};
</script>
