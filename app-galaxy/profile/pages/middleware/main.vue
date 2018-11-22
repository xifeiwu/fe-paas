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
    /*height: calc(100% - 10px);*/
  }
</style>
<script>
  module.exports = {
    async created() {
      this.$storeHelper.checkBasicData4Middleware = this.checkBasicData;
    },
    methods: {
      async requestClusterList() {
        return await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_cluster);
      },
      async requestMiddlewareList(clusterId) {
        return await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_middleware, {
          query: {
            clusterId
          }
        });
      },
      async requestMiddlewareVersionList(middlewareId) {
        return await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_middleware_version, {
          query: {
            middlewareId
          }
        });
      },

      // check data: clusterList, middlewareList, middlewareVersionList
      async checkBasicData (profile, middlewareName) {
        profile = 'unProduction';
        const currentMiddleware = this.$storeHelper.currentMiddleware;

        var clusterList = this.$storeHelper.getClusterList();
        if (!clusterList) {
          clusterList = await this.requestClusterList();
          this.$storeHelper.setClusterList(clusterList);
        }

        var currentClusterId = null;
        if (profile === 'unProduction') {
          currentClusterId = clusterList[0]['id'];
        }
        currentMiddleware['clusterId'] = currentClusterId;

        var middlewareList = this.$storeHelper.getMiddlewareList(currentClusterId);
        if (!middlewareList) {
          middlewareList = await this.requestMiddlewareList(currentClusterId);
          this.$storeHelper.setMiddlewareList(currentClusterId, middlewareList);
        }
//        console.log(middlewareList);

        // get middlewareId by middlewareName
        var currentMiddlewareId = null;
        middlewareList.some(it => {
          if (it['middlewareName'] === middlewareName) {
            currentMiddlewareId = it['id'];
          }
          return currentMiddlewareId;
        });
        if (!currentMiddlewareId) {
          console.log(`error: currentMiddlewareId not found!`);
        }
        currentMiddleware['middlewareId'] = currentMiddlewareId;

        var middlewareVersionList = this.$storeHelper.getMiddlewareVersionList(currentClusterId, currentMiddlewareId);
        if (!middlewareVersionList) {
          middlewareVersionList =  await this.requestMiddlewareVersionList(currentMiddlewareId);
          this.$storeHelper.setMiddlewareVersionList(currentClusterId, currentMiddlewareId, middlewareVersionList);
        }
      },
    },
    data() {
      return {
      }
    }
  }
</script>