<template>
  <div id="work-order-todo">
    <el-button
            size="mini-extral"
            type="primary"
            @click="handleButtonClick('linker', {path: '/profile/work-order/todo/add'})">
      申请工单
    </el-button>
    <div class="block">
      <span class="demonstration">默认</span>
      <el-date-picker
              v-model="value3"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
      </el-date-picker>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        value3: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      }
    },
    methods: {
      handleButtonClick(action, params) {
        switch (action) {
          case 'linker':
            this.$router.push(params.path);
            break;
        }
      }
    }
  }
</script>