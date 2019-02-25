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
    border: 1px solid transparent;
    box-sizing: border-box;
    /*height: calc(100% - 10px);*/
  }
</style>
<script>
  module.exports = {
    async created() {
      // request clusterList at start
      await this.checkBasicData(null, null);
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

      // all profileName: ['fpdev', 'test', 'beta', 'performance', 'production']
      // check data: clusterList, middlewareList, middlewareVersionList
      async checkBasicData(profileName, middlewareName) {
        try {
          const currentMiddleware = this.$storeHelper.currentMiddleware;

          var clusterList = this.$storeHelper.clusterList;
          if (!clusterList) {
            clusterList = await this.requestClusterList();
            // check clusterList
            if (!clusterList || !Array.isArray(clusterList) || clusterList.length === 0) {
              console.log(`format of clusterList is error!`);
              return;
            }
            this.$storeHelper.clusterList = clusterList;
          }

          if (!profileName) {
            return;
          }
          var currentClusterId = null;
          var currentCluster = null;
          // if !profileName, get the first element of clusterList
//        if (!profileName) {
//          currentClusterId = clusterList[0]['id'];
//        } else if (profileName === 'unProduction') {
//          var unProductionClusterList = clusterList.filter(it => it['clusterName'] != 'production');
//          if (unProductionClusterList.length > 0) {
//            currentCluster = unProductionClusterList[0];
//          }
//        } else {
          currentCluster = clusterList.find(it => it['clusterName'] === profileName);
//        }
          if (!currentCluster) {
            console.log(`currentCluster not found!`);
            return;
          }
          currentClusterId = currentCluster['id'];
          currentMiddleware['clusterId'] = currentClusterId;

          var middlewareList = this.$storeHelper.getMiddlewareList(currentClusterId);
          if (!middlewareList) {
            middlewareList = await this.requestMiddlewareList(currentClusterId);
            this.$storeHelper.setMiddlewareList(currentClusterId, middlewareList);
          }
//        console.log(middlewareList);

          if (!middlewareName) {
            return;
          }
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
          if (middlewareVersionList.length === 0) {
            middlewareVersionList = await this.requestMiddlewareVersionList(currentMiddlewareId);
            this.$storeHelper.setMiddlewareVersionList(currentClusterId, currentMiddlewareId, middlewareVersionList);
          }
        } catch(err) {
          console.log(err);
        }
      },
    },
    data() {
      return {
      }
    }
  }
</script>