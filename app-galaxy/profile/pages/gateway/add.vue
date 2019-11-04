<template>
  <div id="gateway_add">

  </div>
</template>
<style lang="scss" scoped>

</style>
<script>
  export default {
    created() {
      console.log(this.$route.query);
      if (!this.$utils.hasProps(this.$route.query, 'groupId', 'appId', 'spaceId')) {
        this.$message.error(`信息不完整：'groupId', 'appId', 'spaceId'`);
        this.$router.push(this.$router.helper.pages['/profile/gateway'].fullPath);
        return;
      }
      this.groupId = this.$route.query['groupId'];
      this.appId = this.$route.query['appId'];
      this.profileId = this.$route.query['spaceId'];
      console.log({
        groupId: this.groupId,
        appId: this.appId,
        profileId: this.profileId,
      })
    },
    mounted() {
    },
    data() {
      return {
        groupId: null,
        appId: null,
        profileId: null
      }
    },
    methods: {

    }
  }
</script>