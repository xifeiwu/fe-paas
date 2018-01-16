<template>
  <div id="log-deploy">
    this is run/deploy
    <el-version-selector @version-selected="onVersionSelected"></el-version-selector>
  </div>
</template>
<script>
  import elVersionSelector from '../utils/components/version-selector';
  export default {
    components: {elVersionSelector},
    methods: {
      onVersionSelected(appId, profileID, version) {
        console.log(appId, profileID, version);
      }
    }
  }
</script>