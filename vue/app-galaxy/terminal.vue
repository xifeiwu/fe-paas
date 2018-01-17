<template>
  <div id="app">
    termial
  </div>
</template>
<script>
  import axios from 'axios';
  export default {
    created() {

    },
    computed: {
      lang() {
        return this.$route.path.split('/')[1] || 'zh-CN';
      },
    },
  }
</script>
<style scoped>
  #app {
    height: 100%;
  }
</style>