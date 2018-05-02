<template>
  <div id="multi-select-demo">
    <el-select v-model="value5" filterable multiple placeholder="请选择">
      <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
      </el-option>
    </el-select>

    <el-select
            v-model="value11"
            multiple
            collapse-tags
            style="margin-left: 20px;"
            placeholder="请选择">
      <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
      </el-option>
    </el-select>
  </div>
</template>
<style lang="scss">
  #multi-select-demo {
    .el-input {
      width: 200px;
    }
  }
</style>
<script>
  export default {
    data() {
      return {
        options: [{
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }],
        value5: [],
        value11: []
      }
    }
  }
</script>