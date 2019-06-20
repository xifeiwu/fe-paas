<template>
  <div id="user-feedback">
    <div class="header">
      <el-button size="mini"
                 type="primary"
                 @click="handleButtonClick($event, 'add')">
        <span>提交建议</span>
      </el-button>
    </div>
    <div class="feedback-list">feedback list</div>
  </div>
</template>
<style lang="scss" scoped>
  #user-feedback {
  }
</style>
<script>
  export default {
    created() {
    },
    mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    data() {
      return {
        heightOfTable: '',
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
    },
    computed: {
    },
    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          return;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
        } catch(err) {
        }
      },
      handleButtonClick(evt, action) {
        switch (action) {
          case 'add':
            break;
        }
      }
    }
  }
</script>