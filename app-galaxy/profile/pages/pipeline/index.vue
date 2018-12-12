<template>
  <div id="pipeline">
    <router-view></router-view>
  </div>
</template>

<style scoped>
  #pipeline {
    height: 100%;
    overflow: scroll;
  }
</style>
<script>
  export default {
    data: function () {
      return {}
    }
  }
</script>