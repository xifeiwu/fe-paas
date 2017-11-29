<template>
  <div id="app" :class="{ 'is-component': isComponent }">
      <router-view></router-view>
  </div>
</template>
<script>
  export default {
    computed: {
      lang() {
        return this.$route.path.split('/')[1] || 'zh-CN';
      },
      isComponent() {
        console.log(this.$route);
        return true;
//        return /^component-/.test(this.$route.name || '');
      }
    },
  }
</script>