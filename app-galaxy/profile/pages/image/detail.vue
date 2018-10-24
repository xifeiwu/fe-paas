<template>

</template>

<style lang="scss" scoped>

</style>

<script>
  export default {
    created() {
      const queryString = window.location.search.replace(/^\?/, '');
      const queryObj = this.$utils.parseQueryString(queryString);
      console.log(queryObj);
    }
  }
</script>