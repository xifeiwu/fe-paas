<template>
  <div id="docs">
    <paas-header @menu-click="handleClickOnPassHeader" defaultActive="docs"></paas-header>
    <div class="child">
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss">
  #docs {
    height: 100%;
    /*padding-top: 60px;*/
    .pass-header {
      /*position: fixed;*/
      width: 100%;
      /*top: 0px;*/
      box-shadow: 0 0 2px 0 rgba(64,158,255, .6);
      z-index: 100;
    }
  }
</style>
<script>
  import paasHeader from '../../components/header';

  export default {
    components: {paasHeader},
    created() {
    },
    mounted() {
    },
    data() {
      return {

      }
    },
    watch: {
    },
    methods: {
      handleClickOnPassHeader(keyPath) {
        switch (keyPath) {
          case 'profile':
          case 'product/app':
          case 'login':
            this.$utils.goToPath('/profile');
//            this.$router.push({
//              path: '/profile/app',
//              query: {
//              }
//            });
            break;
          case 'docs':
            this.$utils.goToPath('/docs');
            break;
          case 'index':
            this.$utils.goToPath('/index');
            break;
        }
      },
    }
  };
</script>