<template>
  <div>
<el-badge :value="200" :max="99" class="item">
  <el-button size="small">评论</el-button>
</el-badge>
<el-badge :value="100" :max="10" class="item">
  <el-button size="small">回复</el-button>
</el-badge>
  </div>
</template>

<script>
  import Vue from 'vue';
  import Badge from '../packages/badge/index.js';
  Badge.install(Vue);
  export default {
    name: 'badge_demo'
  }
</script>
<style>
  .item {
    margin-top: 10px;
    margin-right: 40px;
  }
</style>