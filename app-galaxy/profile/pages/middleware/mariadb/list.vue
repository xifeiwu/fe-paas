<template>
  <div id="middleware-mysql">jjj</div>
</template>
<style lang="scss">

</style>
<script>
  module.exports = {
    created() {

    },
    async mounted() {
      var clusterList = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_cluster);
      var middlewareList = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_middleware, {
        query: {
          clusterId: 1
        }
      });

      var middlewareVersionList = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_middleware_version, {
        query: {
          middlewareId: 1
        }
      });

      var instanceList = await this.$net.requestPaasServer(this.$net.URL_LIST.middleware_middleware_info_basic, {
        query: {
          clusterId: 1,
          groupId: this.$storeHelper.currentGroupID
        }
      });

//      var instanceList = await
      console.log(clusterList);
      console.log(middlewareList);
      console.log(middlewareVersionList);
      console.log(instanceList);
    },
    data() {
      return {

      }
    },
    methods: {

    }
  }
</script>