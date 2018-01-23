<template>
  <div id="work-order-handle">
    {{this.workOrderDetail}}
  </div>
</template>

<style lang="scss"></style>

<script>
  export default {
    created() {

    },
    mounted() {
      this.workOrderDetail = this.$store.getters['app/currentWorkOrderDetail'];
//      console.log(this.workOrderDetail);
      if (!this.workOrderDetail || !this.workOrderDetail.hasOwnProperty('id')) {
        this.$router.push('/profile/work-order/todo');
      }
    },
    data() {
      return {
        workOrderDetail: null,
      }
    }
  }
</script>