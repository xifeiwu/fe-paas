<template>
  <div>
    <el-input-number v-model="num8" controls-position="right" @change="handleChange" :min="1" :max="10"></el-input-number>
  </div>
</template>

<script>
  import Vue from 'vue';
  import InputNumber from '../packages/input-number/index.js';
  InputNumber.install(Vue);
  export default {
    data() {
      return {
        num8: 1
      };
    },
    methods: {
      handleChange(value) {
        console.log(value);
      }
    }
  };
</script>