<template>
  <div id="service-gray"></div>
</template>
<script>
  export default {
    async created() {
      var resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_id, {
        params: {
          id: 18524
        }
      });
      console.log(resContent);
    },
    async mounted() {

    }
  }
</script>