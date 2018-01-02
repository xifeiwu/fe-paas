<template>
  <div id="work-order-todo">
    <el-button
            size="mini-extral"
            type="primary"
            @click="handleButtonClick('linker', {path: '/profile/work-order/todo/add'})">
      申请工单
    </el-button>
  </div>
</template>
<script>
  export default {
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