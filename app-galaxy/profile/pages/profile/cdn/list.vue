<template>
    <div
            v-loading="loading"
            element-loading-text="操作进行中"
            element-loading-spinner="el-icon-loading"
            style="height: 100%"
    >
        <div class="pa-3 pt-4" style="background-color: #fff;">
            <el-row :gutter="20">
                <el-col :span="14">
                    <el-button type="primary" icon="el-icon-circle-plus-outline"
                               @click="$router.push({path: '/cdn/create'})">
                        添加域名
                    </el-button>
                    <el-button type="default" icon="el-icon-refresh"
                               @click="$store.dispatch('cdn/getDomainList')">
                        刷新列表
                    </el-button>
                </el-col>
                <el-col :span="10">
                    <el-input clearable prefix-icon="el-icon-search" placeholder="请输入关键字搜索域名"
                              @change="syncSearchState"
                              v-model="search">
                        <template slot="append">
                            <div class="px-3">
                                <el-button @click="resetSearch" type="danger">
                                    <i class="el-icon-close"></i>
                                    重置搜索
                                </el-button>
                            </div>
                        </template>
                    </el-input>
                </el-col>
            </el-row>
        </div>
        <!--目录列表-->
        <el-table :data="domainListSplit">
            <el-table-column prop="name" label="加速域名" :width="320"
                             :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <el-button type="text" @click="gotoFileList(scope.row)">
                        <i class="el-icon-news"></i>
                        <span style="margin-left: 6px; font-weight: 800; ">
                            {{ scope.row.name }}
                            </span>
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column prop="operatingStateDesc" label="状态" :width="120">
                <template slot-scope="scope">
                    <el-tag size="small" :type="scope.row.operatingState=='success'?'success':'info'">{{scope.row.operatingStateDesc}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="protocol" label="协议" :width="120">
            </el-table-column>
            <el-table-column prop="platform" label="使用场景" :width="120">
            </el-table-column>
            <el-table-column prop="createAt" label="创建时间">
                <template slot-scope="scope">
                    {{ scope.row.createAt | localDate }}
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="$router.push({path: '/cdn/edit', query: {domain: scope.row.name}})">配置</el-button>
                    <el-button type="text" @click="$router.push({path: '/cdn/statistics', query: {domain: scope.row.name}})">统计</el-button>
                    <el-button type="text">停用</el-button>
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
                    :total="this.domainListSort.length">
            </el-pagination>
        </div>
    </div>
</template>

<script>
  import {mapState} from "vuex";

  export default {
    name: "cdn-main-view",
    mounted() {
      this.$store.dispatch('cdn/initData');
    },
    data() {
      return {
        search: this.$store.state.etc.domainFilter,
        currentPage: 1,
        pageSize: 10
      };
    },
    computed: {
      ...mapState("cdn", ["domainList", "loading"]),
      ...mapState("user", ["groupList"]),
      domainListSort() {
        let data = this.domainList || [];
        data = data.sort((a, b) => b.updateTime - a.updateTime);
        const search = this.search;
        return search
          ? data.filter(item => Object.values(item).join(",").toLowerCase().match(search))
          : data;
      },
      domainListSplit() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.domainListSort.slice(start, end);
      },
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
      resetSearch() {
        this.search = '';
        this.syncSearchState();
      },
      syncSearchState() {
        // todo sync search to store/etc
        this.$store.commit("cdn/SET_DOMAIN_FILTER", this.search);
      },
    }
  }
</script>