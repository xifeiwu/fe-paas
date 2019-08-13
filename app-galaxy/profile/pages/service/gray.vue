<template>
  <div id="service-gray"></div>
</template>
<script>
  export default {
    async created() {
      if (this.$route.params && this.$route.params.hasOwnProperty('id')) {
        this.serviceId = this.$route.params['id'];
      }

      if (!this.serviceId) {
        this.$message.error('未找到serviceId');
        this.$router.push(this.$router.helper.pages['/profile/service/list']);
        return;
      }
      var resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_id, {
        params: {
          id: this.serviceId
        }
      });
      console.log(resContent);
    },
    async mounted() {
    },
    data() {
      return {
        serviceId: null
      }
    }
  }
</script>