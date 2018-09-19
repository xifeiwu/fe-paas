<template>
  <div id="k8s">
    <div class="header"></div>
    <div class="warning-list">

    </div>
  </div>
</template>

<style lang="scss">

</style>

<script>
  import {mapGetters} from 'vuex';
  export default {
    created() {},
    mounted() {
//      this.$net.requestPaasServer(this.$net.URL_LIST.k8s_warning_list).then(resContent => {
//        console.log(resContent);
//      }).catch(() => {});

      this.$net.requestPaasServer(this.$net.URL_LIST.user_group_list).then(resContent => {
        console.log(resContent);
      }).catch(() => {});
      console.log(this.visitPageCount);
      this.$store.dispatch('setConfig', {
        visitPageCount: this.visitPageCount + 1
      });



//      this.$net.requestPaasServer(this.$net.URL_LIST.app_list, {
//        payload: {groupId: this.$storeHelper}
//      }).then(resContent => {
//        console.log(resContent);
//      });
//      this.requestPaasServer(this.URL_LIST.app_list, {payload})
    },
    computed: {
      ...mapGetters({
        'visitPageCount': 'visitPageCount'
      }),
    }
  }
</script>