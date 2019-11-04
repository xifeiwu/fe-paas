<template>
  <div id="gateway_add">

  </div>
</template>
<style lang="scss" scoped>

</style>
<script>
  export default {
    created() {
      if (!this.$utils.hasProps(this.$route.query, 'groupId', 'appId', 'spaceId')) {
        this.$message.error(`信息不完整：'groupId', 'appId', 'spaceId'`);
        this.$router.push(this.$router.helper.pages['/profile/gateway'].fullPath);
        return;
      }
      this.groupId = this.$route.query['groupId'];
      this.appId = this.$route.query['appId'];
      this.profileId = this.$route.query['spaceId'];
//      console.log({
//        groupId: this.groupId,
//        appId: this.appId,
//        profileId: this.profileId,
//      });
      this.requestRelatedInfoFromNet();
    },
    mounted() {
    },
    data() {
      return {
        groupId: null,
        appId: null,
        profileId: null,
        relatedInfo: {

        }
      }
    },
    methods: {
      async requestRelatedInfoFromNet() {
        this.$net.requestPaasServer(this.$net.URL_LIST.gateway_create_related, {
          query: {
            groupId: this.groupId,
            appId: this.appId,
            spaceId: this.profileId,
          }
        });
//        this.$net.requestPaasServer(this.$net.URL_LIST.gateway_create_related, {
//          query: {
//
//          }
//        });
        const results = await Promise.all()
      }

    }
  }
</script>