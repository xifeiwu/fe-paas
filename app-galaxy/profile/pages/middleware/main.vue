<template>
  <div id="middleware">
    <!--<keep-alive>-->
    <router-view></router-view>
    <!--</keep-alive>-->
  </div>
</template>
<style lang="scss" scoped>
  #middleware {
    height: 100%;
  }
</style>
<script>
  module.exports = {
    async created() {
      this.$storeHelper.middlewarePromiseChain = [];
      this.$storeHelper.middlewarePromiseChain.push(async () => {
        const clusterList = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_cluster);
//        console.log(clusterList);
        const clusterId = clusterList[0]['id'];
        this.$storeHelper.setClusterList(clusterList);
        this.$storeHelper.currentClusterId = clusterId;

        const middlewareList = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_middleware, {
          query: {
            clusterId
          }
        });
//      console.log(middlewareList);
        this.$storeHelper.setMiddlewareList(clusterId, middlewareList);
//        console.log('middleware created');
      });
    }
  }
</script>