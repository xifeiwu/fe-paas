<template>
  <div>
    <el-input placeholder="请输入内容" v-model="input3">
      <template slot="prepend">Http://</template>
    </el-input>
    <el-input
            type="textarea"
            autosize
            placeholder="请输入内容"
            v-model="textarea2">
    </el-input>
    <div style="margin: 20px 0;"></div>
    <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入内容"
            v-model="textarea3">
    </el-input>
  </div>
</template>

<script>
  import Vue from 'vue';
  import Input from '../packages/input/index.js';
  Input.install(Vue);
  export default {
    data() {
      return {
        textarea2: '',
        textarea3: ''
      }
    },
    methods: {
      handleChange(value) {
        console.log(value);
      }
    }
  };
</script>

<style>
  .el-select .el-input {
    width: 130px;
  }
  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
</style>