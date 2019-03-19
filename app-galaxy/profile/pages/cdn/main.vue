<template>
    <div style="height: 100%">
        <el-aside width="0px" style="height: 100%">
            <div class="pa-3" style="border-right: 1px solid #eee;">
                <strong>CDN加速服务</strong>
            </div>
            <el-menu
                    :default-active="defaultActive"
                    background-color="transparent"
                    router
            >
                <!--<el-menu-item index="dashboard" :route="{path: '/cdn/dashboard'}">-->
                    <!--<span slot="title">概览</span>-->
                <!--</el-menu-item>-->
                <el-menu-item index="list" :route="{path: '/cdn/list'}">
                    <span slot="title">域名管理</span>
                </el-menu-item>
                <el-menu-item index="prefetch" :route="{path: '/cdn/prefetch'}">
                    <span slot="title">刷新预取</span>
                </el-menu-item>
                <el-menu-item index="statistics" :route="{path: '/cdn/statistics'}">
                    <span slot="title">统计分析</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main class="pa-0" style="background-color: white; height: 100%;">
            <router-view></router-view>
        </el-main>
    </div>
</template>

<script>
  export default {
    name: "CDN-Main-View",
    computed: {
      defaultActive() {
        const path = this.$route.path;
        if (/^\/cdn\/(create|list|edit)/.test(path)) return 'list';
        if (/^\/cdn\/prefetch/.test(path)) return 'prefetch';
        if (/^\/cdn\/statistics/.test(path)) return 'statistics';
        if (/^\/cdn\/dashboard/.test(path)) return 'dashboard';
      }
    }
  }
</script>

<style scoped>

</style>