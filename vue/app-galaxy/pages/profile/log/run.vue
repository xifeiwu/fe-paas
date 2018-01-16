<template>
  <div id="log-run">
    <div>this is run/log</div>
    <el-log-dialog></el-log-dialog>
  </div>
</template>
<script>
  import elLogDialog from '../utils/components/dialog4log.vue';
  export default {
    components: {elLogDialog}
  }
</script>