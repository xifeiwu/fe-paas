<template>
  <div id="app">
    termial
  </div>
</template>
<script>
  import axios from 'axios';
  import URL_LIST from './net/url';
  export default {
    created() {
    },
    mounted() {
      this.$nextTick(() => {
        this.getTerminalInfo();
      });
    },

    computed: {
      lang() {
        return this.$route.path.split('/')[1] || 'zh-CN';
      },
    },
    methods: {
      getTerminalInfo() {
        let id = this.$utils.getQueryString('id');
        axios.post(URL_LIST.terminal_info, {
          serviceId: id
        }).then(response => {
          console.log(response);
        })
      },
    }
  }
</script>
<style scoped>
  #app {
    height: 100%;
  }
</style>